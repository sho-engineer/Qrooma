/**
 * POST /api/discuss
 *
 * Multi-round structured debate between AI agents.
 *
 * 2-agent (Free):  Round1(A→B) → Summary1 → Round2(A→B) → Summary2 → Conclusion
 * 3-agent (Pro):   Round1(A,B,C) → Summary1 → Round2(A,B,C) → Summary2 → Round3(A,B,C) → Conclusion
 *
 * Self-reference is prevented by explicitly naming the opponent(s) each agent
 * must address. Agents are never allowed to quote themselves.
 *
 * Writing style is injected into every system prompt via a tone suffix
 * built from the writingStyle payload field.
 */

import { Router } from "express";
import { callAI, type Provider } from "../lib/ai";

const router = Router();

// ─── Role labels ──────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  A: "Proposal (提案)",
  B: "Review (検証)",
  C: "Execution (実行)",
};

type Side = "A" | "B" | "C";

interface WritingStyle {
  tone?:             "natural" | "professional" | "concise" | "casual";
  conclusionFormat?: "paragraph" | "bullets";
  jpHardness?:       "soft" | "standard" | "formal";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function agentIdForProvider(provider: string): string {
  if (provider === "openai")    return "gpt";
  if (provider === "anthropic") return "claude";
  if (provider === "google")    return "gemini";
  return provider;
}

function sseWrite(res: import("express").Response, data: object) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// ─── Writing style → prompt suffix ───────────────────────────────────────────

function buildToneSuffix(style: WritingStyle): string {
  const lines: string[] = ["\n\n— WRITING STYLE INSTRUCTIONS —"];

  const toneInstructions: Record<string, string> = {
    natural:      "Write in a natural, readable tone. Don't over-explain. Use language a person would naturally read.",
    professional: "Write in a polished, organized business tone. Be thorough but not stiff.",
    concise:      "Lead with your conclusion. Be short. Cut all padding and redundancy.",
    casual:       "Write in a slightly warmer tone, but remain professional enough for a SaaS product.",
  };

  const jpHardnessInstructions: Record<string, string> = {
    soft:     "If writing in Japanese: use soft, readable phrasing such as 「〜が考えられます」「〜するとよさそうです」. Avoid assertive endings. Prioritize readability.",
    standard: "If writing in Japanese: use standard, natural product text. Avoid stiff bureaucratic phrasing.",
    formal:   "If writing in Japanese: use polished, clear Japanese. Be direct and easy to parse.",
  };

  if (style.tone) lines.push(toneInstructions[style.tone]);
  if (style.jpHardness) lines.push(jpHardnessInstructions[style.jpHardness]);

  lines.push("Do NOT use bureaucratic phrases like 「〜が確認された」「〜が強調された」「〜が求められる」.");
  lines.push("Prefer判断文 over 要約文: e.g. 「論点はここに絞られてきた」「この時点では〜が強い」「いったんの結論としては〜が妥当」.");

  return lines.join("\n");
}

function buildConclusionToneSuffix(style: WritingStyle): string {
  const lines: string[] = ["\n\n— CONCLUSION WRITING STYLE —"];

  if (style.conclusionFormat === "bullets") {
    lines.push("Format each section as 2–4 concise bullet points, not prose sentences.");
  } else {
    lines.push("Format each section as 1–2 natural prose sentences. Keep it human-readable.");
  }

  const toneInstructions: Record<string, string> = {
    natural:      "Sound like a sharp colleague summarizing a meeting — clear, readable, no jargon.",
    professional: "Sound like a well-written executive summary — organized, specific, not bloated.",
    concise:      "Be maximally brief. One sentence per section if possible. Cut all fluff.",
    casual:       "A little warmer than typical AI output, but still serious enough to act on.",
  };

  if (style.tone) lines.push(toneInstructions[style.tone]);

  const jpLines: Record<string, string> = {
    soft:     "If in Japanese: 「いったんの結論としては〜が妥当」「〜という進め方が現実的」など、柔らかく判断しやすい表現で。",
    standard: "If in Japanese: 自然なビジネス文体で。硬すぎず、読みやすく。",
    formal:   "If in Japanese: 丁寧で明確な文体で。ただし読みにくくしない。",
  };

  if (style.jpHardness) lines.push(jpLines[style.jpHardness]);

  return lines.join("\n");
}

// ─── System prompts — 2-agent ─────────────────────────────────────────────────
// A = Proposal (GPT),  B = Review (Gemini)

const PROMPTS_2AGENT = {
  "structured-debate": {
    rounds: {
      1: {
        A: `You are Agent A — Proposal (提案). This is Round 1.

Your only debate partner is Agent B (Review). Do NOT reference yourself.

Task: State ONE clear, concrete proposal for the user's question.
Rules:
— Be decisive and commit fully to your position.
— Give the single strongest reason in one sentence.
— Do NOT hedge or say "it depends."
— Do NOT start with "I" or "Agent A."
— 2–4 sentences max.

Respond in the SAME LANGUAGE as the user's message.`,

        B: `You are Agent B — Review (検証). This is Round 1.

Your only debate partner is Agent A (Proposal). Do NOT reference yourself.

Agent A has just given their initial proposal (shown above).
Task: Identify the single most dangerous assumption or failure condition in A's proposal.
Rules:
— Quote or paraphrase a SPECIFIC claim A made. Use: "Aは〜と提案したが..." / "A proposes X, but this assumes..."
— State concretely: "This fails when ___" or "The hidden assumption is ___."
— Do NOT just offer a complementary angle — challenge A's specific words.
— Do NOT start with "I" or "Agent B."
— 2–4 sentences max.

Respond in the SAME LANGUAGE as the discussion.`,
      },

      2: {
        A: `You are Agent A — Proposal (提案). This is Round 2.

Your only debate partner is Agent B (Review). Do NOT reference yourself.

Agent B's critique from Round 1 is in the context above.
Task: Revise your proposal in direct response to B's critique.
Rules:
— Open by naming what B challenged. Use: "Bは〜と指摘した。この点を踏まえ..." / "B pointed out that... Given this, I revise..."
— State clearly what you are CHANGING from Round 1 and why.
— Do NOT repeat your Round 1 proposal verbatim.
— Close with any tension that still remains.
— Do NOT start with "I" or "Agent A."
— 2–4 sentences.

Respond in the SAME LANGUAGE as the discussion.`,

        B: `You are Agent B — Review (検証). This is Round 2.

Your only debate partner is Agent A (Proposal). Do NOT reference yourself.

Agent A's revised proposal from Round 2 is in the context above.
Task: Re-evaluate A's revised proposal.
Rules:
— Acknowledge explicitly what A improved from Round 1. Use: "Aは〜を修正した点は評価できる。" / "A's revision of X is an improvement."
— Then state the ONE remaining concern that is still unresolved.
— Do NOT simply repeat your Round 1 critique.
— Do NOT start with "I" or "Agent B."
— 2–4 sentences.

Respond in the SAME LANGUAGE as the discussion.`,
      },
    },

    roundSummary: {
      1: `You are the MODERATOR. Round 1 of a 2-agent debate (Proposal vs. Review) has just completed.

Write a Round 1 Summary — not a retelling, but a judgment call on what matters.
Include:
【提案】 A's core proposal (one sentence)
【検証】 B's core critique (one sentence)
【争点】 The key tension that must be resolved (one sentence)

Rules:
— Do NOT restate both sides' content — synthesize what they mean.
— Prefer: 「論点はここに絞られてきた」「この時点では〜という見方が強い」
— 3 sentences total. No fluff.

Respond in the SAME LANGUAGE as the discussion.`,

      2: `You are the MODERATOR. Round 2 of a 2-agent debate (Proposal vs. Review) has just completed.

Write a Round 2 Summary focusing on what moved and what didn't.
Include:
【改訂】 What A changed and why it matters (one sentence)
【残課題】 B's remaining concern (one sentence)
【収束度】 Whether the debate converged or tension persists (one sentence)

Rules:
— Do NOT repeat Round 1 summary.
— Prefer judgment language over description: 「修正されたが、核心は残っている」など
— 3 sentences max.

Respond in the SAME LANGUAGE as the discussion.`,
    },

    conclusion: `You are the MODERATOR delivering the FINAL VERDICT of a 2-agent debate (Proposal vs. Review).

All debate rounds are in the context above. This is a judgment, not a summary.

Use EXACTLY these four section headers, each followed by content:

[採用] Adopted approach:
[棄却] Rejected / deferred:
[残論点] Open question:
[次アクション] Next action:

Rules:
— Each section: 1–2 sentences.
— Do NOT write "it depends."
— Sound like a sharp colleague making a call, not an AI summarizing.
— Use natural judgment language: 「〜が妥当」「〜という進め方が現実的」「いったんは〜で進める」
Respond in the SAME LANGUAGE as the discussion.`,
  },

  "free-talk": {
    rounds: {
      1: {
        A: `You are Agent A in a 2-person AI discussion. This is Round 1.

Your only partner is Agent B. Do NOT reference yourself.

Share your genuine perspective on the user's question.
Rules:
— Be specific and opinionated — not neutral.
— State your view and the core reason behind it.
— Do NOT start with "I" or "Agent A."
— 2–3 sentences max.

Respond in the SAME LANGUAGE as the user's message.`,

        B: `You are Agent B in a 2-person AI discussion. This is Round 1.

Your only partner is Agent A. Do NOT reference yourself.

Agent A has just shared their perspective (shown above).
Share your view — it may agree or contrast with A's.
Rules:
— Reference A's perspective: "Aは〜と言ったが..." / "A's point about X is..."
— Be specific. If you disagree, say so directly.
— Do NOT start with "I" or "Agent B."
— 2–3 sentences max.

Respond in the SAME LANGUAGE as the discussion.`,
      },

      2: {
        A: `You are Agent A in a 2-person AI discussion. This is Round 2.

Your only partner is Agent B. Do NOT reference yourself.

Agent B's Round 1 perspective is in the context above.
Task: Respond directly to something B said.
Rules:
— Quote or paraphrase a specific claim from B. Use: "Bが指摘した〜について..." / "On B's point that..."
— Agree, push back, or add a condition — but take a clear stance.
— Do NOT just add a new angle without connecting to what B said.
— Do NOT start with "I" or "Agent A."
— 2–3 sentences.

Respond in the SAME LANGUAGE as the discussion.`,

        B: `You are Agent B in a 2-person AI discussion. This is Round 2.

Your only partner is Agent A. Do NOT reference yourself.

Agent A's Round 2 response is in the context above.
Task: Respond to something A said and give your final take.
Rules:
— Quote or paraphrase A's specific claim. Use: "Aは〜と言ったが..." / "A said X, which I think..."
— Take a clear stance: agree, partially agree, or push back.
— End with your own conclusion on the topic.
— Do NOT start with "I" or "Agent B."
— 2–3 sentences.

Respond in the SAME LANGUAGE as the discussion.`,
      },
    },

    roundSummary: {
      1: `You are the MODERATOR. Round 1 of a 2-person discussion has completed.

Write a brief Round 1 judgment — not a retelling:
1. Where A and B align
2. Where they diverge
3. Which view currently seems stronger

Rules: 3 sentences max. Prefer judgment over description. Respond in the SAME LANGUAGE as the discussion.`,

      2: `You are the MODERATOR. Round 2 of a 2-person discussion has completed.

Write a brief Round 2 judgment: what changed or solidified from Round 1, and what the conversation landed on.
Rules: 3 sentences max. Respond in the SAME LANGUAGE as the discussion.`,
    },

    conclusion: `You are the MODERATOR of a 2-person AI discussion.

Use EXACTLY these four section headers, each followed by content:

[採用] Key insight:
[棄却] What to avoid:
[残論点] Open question:
[次アクション] Next step:

Rules: Be direct. No "it depends." Sound like a sharp colleague. Respond in the SAME LANGUAGE as the discussion.`,
  },
};

// ─── System prompts — 3-agent ─────────────────────────────────────────────────

const PROMPTS_3AGENT = {
  "structured-debate": {
    rounds: {
      1: {
        A: `You are Agent A — Proposal (提案). This is Round 1: Initial Stance.
The other agents are Agent B (Review) and Agent C (Execution). Do NOT reference yourself.

Task: State ONE clear, concrete proposal for the user's question.
Rules:
— Be decisive. Commit fully to your position.
— Give the single strongest reason in one sentence.
— Do NOT hedge or say "it depends."
— Do NOT start with "I" or "Agent A."
— 2–4 sentences max.

Respond in the SAME LANGUAGE as the user's message.`,

        B: `You are Agent B — Review (検証). This is Round 1: Initial Stance.
The other agents are Agent A (Proposal) and Agent C (Execution). Do NOT reference yourself.

Task: Identify the single most dangerous assumption or failure condition in the obvious approach to the user's question.
Rules:
— State concretely: "This fails when ___" or "The hidden assumption is ___."
— Challenge the premise itself — do NOT just offer a complementary angle.
— Do NOT start with "I" or "Agent B."
— 2–4 sentences max.

Respond in the SAME LANGUAGE as the user's message.`,

        C: `You are Agent C — Execution (実行). This is Round 1: Initial Stance.
The other agents are Agent A (Proposal) and Agent B (Review). Do NOT reference yourself.

Task: State what a working implementation actually requires.
Rules:
— Focus on operational reality, not ideals.
— Name the most critical constraint or prerequisite that tends to be ignored.
— Be specific: who does what, with what resource or condition.
— Do NOT start with "I" or "Agent C."
— 2–4 sentences max.

Respond in the SAME LANGUAGE as the user's message.`,
      },

      2: {
        A: `You are Agent A — Proposal (提案). This is Round 2: Challenge.
The other agents are Agent B (Review) and Agent C (Execution). Do NOT reference yourself.

Round 1 positions from B and C are in the context above.
Task: Respond DIRECTLY to Agent B or Agent C — pick the strongest challenge to your Round 1 proposal and address it.
Rules:
— Quote or paraphrase a specific claim from B or C. Use: "Bは〜と指摘したが..." / "B pointed out that... however..."
— Take a clear stance: push back, partially concede, or modify your proposal.
— Do NOT just add more support for your original position.
— Do NOT start with "I" or "Agent A."
— 2–4 sentences.

Respond in the SAME LANGUAGE as the discussion.`,

        B: `You are Agent B — Review (検証). This is Round 2: Challenge.
The other agents are Agent A (Proposal) and Agent C (Execution). Do NOT reference yourself.

Round 1 positions from A and C are in the context above.
Task: Challenge Agent A's Round 1 proposal on a specific claim.
Rules:
— Quote or paraphrase a SPECIFIC claim from A's Round 1 response. Use: "Aは〜と主張したが..." / "A claimed that... but this breaks down because..."
— Identify exactly where A's proposal fails or what assumption it rests on.
— Do NOT reference your own (B's) Round 1 position as if someone else said it.
— Do NOT start with "I" or "Agent B."
— 2–4 sentences.

Respond in the SAME LANGUAGE as the discussion.`,

        C: `You are Agent C — Execution (実行). This is Round 2: Challenge.
The other agents are Agent A (Proposal) and Agent B (Review). Do NOT reference yourself.

Round 1 positions from A and B are in the context above.
Task: Identify where A and B CLASH and stake your position on that clash.
Rules:
— Reference at least ONE specific point from A AND ONE from B.
— Name the exact tension between them — not "both have good points."
— State your concrete position on how to resolve or navigate that tension.
— Do NOT reference your own (C's) Round 1 position as if someone else said it.
— Do NOT start with "I" or "Agent C."
— 2–4 sentences.

Respond in the SAME LANGUAGE as the discussion.`,
      },

      3: {
        A: `You are Agent A — Proposal (提案). This is Round 3: Revision.
The other agents are Agent B (Review) and Agent C (Execution). Do NOT reference yourself.

All previous rounds from B and C are in the context above.
Task: Revise your proposal based on what emerged in Rounds 1–2.
Rules:
— Open by stating what you are CHANGING from Round 1 and WHY. Use: "Round 1では〜と提案したが、Bの指摘を踏まえ〜に修正する。" / "My Round 1 proposal was X; given B's challenge I now revise it to Y because..."
— Do NOT repeat your Round 1 proposal verbatim.
— Close with any tension that still remains unresolved.
— Do NOT start with "I" or "Agent A."
— 2–4 sentences.

Respond in the SAME LANGUAGE as the discussion.`,

        B: `You are Agent B — Review (検証). This is Round 3: Revision.
The other agents are Agent A (Proposal) and Agent C (Execution). Do NOT reference yourself.

All previous rounds from A and C are in the context above.
Task: Revise your critical assessment based on what emerged in Rounds 1–2.
Rules:
— Acknowledge explicitly if any of your Round 1 concerns were addressed by A or C.
— State the ONE concern that is STILL unresolved and why it still matters.
— Do NOT repeat your Round 1 critique word-for-word.
— Do NOT start with "I" or "Agent B."
— 2–4 sentences.

Respond in the SAME LANGUAGE as the discussion.`,

        C: `You are Agent C — Execution (実行). This is Round 3: Revision.
The other agents are Agent A (Proposal) and Agent B (Review). Do NOT reference yourself.

All previous rounds from A and B are in the context above.
Task: Provide a revised implementation path that incorporates the full debate.
Rules:
— Reference the key tension between A and B that shaped the debate.
— Name ONE concrete first step and ONE key condition for it to work.
— Do NOT repeat your Round 1 position verbatim.
— Do NOT start with "I" or "Agent C."
— 2–4 sentences.

Respond in the SAME LANGUAGE as the discussion.`,
      },
    },

    roundSummary: {
      1: `You are the MODERATOR. Round 1 of a 3-agent debate (Proposal / Review / Execution) has just completed.

Write a Round 1 judgment — not a retelling. What matters now:
【提案】 A's core proposal in one sentence
【検証】 B's core critique in one sentence
【実行】 C's key implementation concern in one sentence
【争点】 The central tension the debate must resolve in one sentence

Rules: Prefer judgment language. 4 sentences max. No fluff. Respond in the SAME LANGUAGE as the discussion.`,

      2: `You are the MODERATOR. Round 2 of a 3-agent debate has just completed.

Write a Round 2 judgment:
【収束】 What converged or was resolved (one sentence)
【残争点】 What remains contested (one sentence)
【優勢案】 Which position gained ground and why (one sentence)

Rules: 3 sentences max. Prefer: 「この時点では〜が強い」「修正されたが核心は残っている」. Respond in the SAME LANGUAGE as the discussion.`,
    },

    conclusion: `You are the MODERATOR delivering the FINAL VERDICT of a 3-agent structured debate.

All rounds are in the context above. This is a judgment, not a summary.

Use EXACTLY these four section headers, each followed by content:

[採用] Adopted approach:
[棄却] Rejected / deferred:
[残論点] Open questions:
[次アクション] Next action:

Rules:
— Each section: 1–2 sentences.
— Do NOT write "it depends."
— Sound like a sharp colleague making a call: 「〜が妥当」「〜という進め方が現実的」「いったんは〜で進める」
Respond in the SAME LANGUAGE as the discussion.`,
  },

  "free-talk": {
    rounds: {
      1: {
        A: `You are Agent A in a 3-person AI discussion. This is Round 1.
Your partners are Agent B and Agent C. Do NOT reference yourself.

Share your genuine perspective on the user's question.
Rules:
— Be specific and opinionated.
— State your view and the core reason behind it.
— Do NOT start with "I" or "Agent A."
— 2–3 sentences max.

Respond in the SAME LANGUAGE as the user's message.`,

        B: `You are Agent B in a 3-person AI discussion. This is Round 1.
Your partners are Agent A and Agent C. Do NOT reference yourself.

Share your perspective — it may align with or contrast Agent A's view.
Rules:
— Be specific. If you disagree with A, say so directly.
— State your view and what makes you confident in it.
— Do NOT start with "I" or "Agent B."
— 2–3 sentences max.

Respond in the SAME LANGUAGE as the user's message.`,

        C: `You are Agent C in a 3-person AI discussion. This is Round 1.
Your partners are Agent A and Agent B. Do NOT reference yourself.

Share your perspective on the user's question.
Rules:
— Be concrete and opinionated.
— You may build on A or B, or introduce a contrasting angle.
— Do NOT start with "I" or "Agent C."
— 2–3 sentences max.

Respond in the SAME LANGUAGE as the user's message.`,
      },

      2: {
        A: `You are Agent A in a 3-person AI discussion. This is Round 2.
Your partners are Agent B and Agent C. Do NOT reference yourself.

Round 1 perspectives from B and C are in the context above.
Task: Respond directly to something B or C said in Round 1.
Rules:
— Quote or paraphrase a specific claim. Use: "Bが言った〜について..." / "On B's point that..."
— Agree, push back, or add a condition — take a clear stance.
— Do NOT start with "I" or "Agent A."
— 2–3 sentences.

Respond in the SAME LANGUAGE as the discussion.`,

        B: `You are Agent B in a 3-person AI discussion. This is Round 2.
Your partners are Agent A and Agent C. Do NOT reference yourself.

Round 1 perspectives from A and C are in the context above.
Task: Respond directly to something A or C said in Round 1.
Rules:
— Quote or paraphrase a specific claim from A or C.
— Take a clear stance: agree, partially agree, or push back.
— Do NOT reference your own (B's) Round 1 statement as if A or C said it.
— Do NOT start with "I" or "Agent B."
— 2–3 sentences.

Respond in the SAME LANGUAGE as the discussion.`,

        C: `You are Agent C in a 3-person AI discussion. This is Round 2.
Your partners are Agent A and Agent B. Do NOT reference yourself.

Round 1 perspectives from A and B are in the context above.
Task: Identify where A and B agree and where they diverge, then give your take.
Rules:
— Reference at least ONE point from A and ONE from B.
— Name the exact point of agreement or disagreement between them.
— State your own conclusion on the topic.
— Do NOT reference your own (C's) Round 1 statement.
— Do NOT start with "I" or "Agent C."
— 2–3 sentences.

Respond in the SAME LANGUAGE as the discussion.`,
      },
    },

    roundSummary: {
      1: `You are the MODERATOR. Round 1 of a 3-person discussion has just completed.

Write a concise judgment — not a summary. What's the key alignment and tension?
Rules: 3 sentences max. Prefer judgment over description. Respond in the SAME LANGUAGE as the discussion.`,

      2: `You are the MODERATOR. Round 2 of a 3-person discussion has just completed.

Write a judgment on what changed from Round 1 and what the group converged on or still disagrees about.
Rules: 3 sentences max. Respond in the SAME LANGUAGE as the discussion.`,
    },

    conclusion: `You are the MODERATOR of a 3-person AI discussion.

Use EXACTLY these four section headers, each followed by content:

[採用] Key insight:
[棄却] What to avoid:
[残論点] Open question:
[次アクション] Next step:

Rules: Be direct. No "it depends." Respond in the SAME LANGUAGE as the discussion.`,
  },
};

// ─── Route ────────────────────────────────────────────────────────────────────

router.post("/discuss", async (req, res) => {
  const {
    roomId,
    runId,
    userMessage,
    mode,
    agentConfig,
    apiKeys: clientApiKeys = {},
    previousMessages = [],
    writingStyle = {},
  } = req.body as {
    roomId: string;
    runId: string;
    userMessage: string;
    mode: string;
    agentConfig: { side: "A" | "B" | "C"; provider: string; model: string }[];
    apiKeys?: { openai?: string; anthropic?: string; google?: string };
    previousMessages: { role: string; agentId?: string; content: string }[];
    writingStyle?: WritingStyle;
  };

  const apiKeys = {
    openai:    clientApiKeys.openai    || process.env["OPENAI_API_KEY"]    || undefined,
    anthropic: clientApiKeys.anthropic || process.env["ANTHROPIC_API_KEY"] || undefined,
    google:    clientApiKeys.google    || process.env["GOOGLE_API_KEY"]    || undefined,
  };

  res.writeHead(200, {
    "Content-Type":      "text/event-stream",
    "Cache-Control":     "no-cache",
    "Connection":        "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const is2Agent   = agentConfig.length <= 2;
  const modeKey    = (mode === "free-talk" ? "free-talk" : "structured-debate");
  const PROMPTS    = is2Agent ? PROMPTS_2AGENT : PROMPTS_3AGENT;
  const numRounds  = is2Agent
    ? 2
    : (modeKey === "structured-debate" ? 3 : 2);

  const ROUND_LABEL: Record<number, string> = modeKey === "structured-debate"
    ? (is2Agent
        ? { 1: "Round 1 — Initial Stance", 2: "Round 2 — Revision" }
        : { 1: "Round 1 — Initial Stance", 2: "Round 2 — Challenge", 3: "Round 3 — Revision" })
    : { 1: "Round 1 — Perspectives", 2: "Round 2 — Responses" };

  // Build writing style suffixes
  const toneSuffix       = buildToneSuffix(writingStyle);
  const conclusionSuffix = buildConclusionToneSuffix(writingStyle);

  // Build conversation history for context
  const history = previousMessages.slice(-12).map((m) => ({
    role:    (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
    content: m.role === "user"
      ? m.content
      : `[${(m.agentId ?? "agent").toUpperCase()}]: ${m.content}`,
  }));

  const allRoundMessages: Array<{
    round:     number;
    side:      string;
    agentId:   string;
    roleLabel: string;
    content:   string;
  }> = [];

  // Moderator call helper — uses first available agent's key
  async function callModerator(systemPrompt: string, contextText: string): Promise<string | null> {
    const conf = agentConfig[0];
    if (!conf) return null;
    const key = apiKeys[conf.provider as keyof typeof apiKeys];
    if (!key) return null;
    try {
      return await callAI({
        provider:     conf.provider as Provider,
        model:        conf.model,
        systemPrompt: systemPrompt + toneSuffix,
        messages:     [{ role: "user", content: contextText }],
        apiKey:       key,
      });
    } catch {
      return null;
    }
  }

  const modePrompts = PROMPTS[modeKey as keyof typeof PROMPTS] ?? PROMPTS["structured-debate"];

  try {
    for (let round = 1; round <= numRounds; round++) {
      const roundLabel = ROUND_LABEL[round] ?? `Round ${round}`;
      sseWrite(res, { type: "round_start", round, label: roundLabel });

      for (const { side, provider, model } of agentConfig) {
        const apiKey = apiKeys[provider as keyof typeof apiKeys];
        if (!apiKey) {
          sseWrite(res, { type: "warning", message: `No API key for ${provider} (${side}) — skipping` });
          continue;
        }

        const agentId   = agentIdForProvider(provider);
        const roleLabel = ROLE_LABEL[side] ?? side;

        const roundPrompts =
          (modePrompts.rounds as unknown as Record<number, Record<Side, string>>)[round]
          ?? (modePrompts.rounds as unknown as Record<number, Record<Side, string>>)[1]!;
        const baseSystemPrompt = roundPrompts[side as Side] ?? roundPrompts["A"]!;
        const systemPrompt = baseSystemPrompt + toneSuffix;

        const prevRoundsText = allRoundMessages
          .filter((m) => m.round < round)
          .map((m) => `[Round ${m.round} — ${m.roleLabel}]:\n${m.content}`)
          .join("\n\n");

        const currRoundText = allRoundMessages
          .filter((m) => m.round === round && m.side !== side)
          .map((m) => `[${m.roleLabel}]:\n${m.content}`)
          .join("\n\n");

        let contextMsg = `User question: ${userMessage}`;
        if (prevRoundsText) contextMsg += `\n\n${"─".repeat(40)}\nPrevious rounds:\n\n${prevRoundsText}`;
        if (currRoundText)  contextMsg += `\n\n${"─".repeat(40)}\nThis round so far (other agents only):\n\n${currRoundText}`;

        const messages = [
          ...history,
          { role: "user" as const, content: contextMsg },
        ];

        sseWrite(res, { type: "agent_start", round, side, agentId });

        let content: string;
        try {
          content = await callAI({ provider: provider as Provider, model, systemPrompt, messages, apiKey });
        } catch (agentErr: unknown) {
          const errMsg = agentErr instanceof Error ? agentErr.message : "Unknown error";
          sseWrite(res, { type: "agent_error", round, side, agentId, message: errMsg });
          continue;
        }

        const message = {
          id:        `${runId}-${side}-r${round}-${Date.now()}`,
          roomId,
          role:      "assistant",
          agentId,
          side,
          round,
          content,
          createdAt: new Date().toISOString(),
          runId,
        };

        sseWrite(res, { type: "message", message });
        allRoundMessages.push({ round, side, agentId, roleLabel, content });

        await new Promise((r) => setTimeout(r, 200));
      }

      // ── Round summary ─────────────────────────────────────────────────────
      const summaryPrompts = (modePrompts as { roundSummary?: Record<number, string> }).roundSummary;
      const summaryPrompt  = summaryPrompts?.[round];

      if (summaryPrompt) {
        const roundContext = allRoundMessages
          .filter((m) => m.round <= round)
          .map((m) => `[Round ${m.round} — ${m.roleLabel}]:\n${m.content}`)
          .join("\n\n");

        const fullContext = `User question: ${userMessage}\n\n${"─".repeat(40)}\n${roundContext}`;
        const summaryContent = await callModerator(summaryPrompt, fullContext);

        if (summaryContent) {
          sseWrite(res, {
            type:      "round_summary",
            round,
            label:     `Round ${round} Summary`,
            summary:   summaryContent,
            id:        `${runId}-summary-r${round}-${Date.now()}`,
            roomId,
            runId,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    // ── Final conclusion ───────────────────────────────────────────────────────
    // Always generate conclusion if any messages were produced.
    // Uses first available key; wraps in try/catch so errors emit conclusion_error
    // rather than crashing the whole stream.

    if (allRoundMessages.length > 0) {
      sseWrite(res, { type: "round_start", round: numRounds + 1, label: "Conclusion" });

      const conclusionBasePrompt = modePrompts.conclusion;
      const conclusionPrompt = conclusionBasePrompt + conclusionSuffix;

      const fullDebate = allRoundMessages
        .map((m) => `[Round ${m.round} — ${m.roleLabel}]:\n${m.content}`)
        .join("\n\n");

      const debateContext = `User question: ${userMessage}\n\n${"─".repeat(40)}\nFull debate:\n\n${fullDebate}`;

      // Try agents in order until one succeeds
      let conclusionContent: string | null = null;
      for (const conf of agentConfig) {
        const key = apiKeys[conf.provider as keyof typeof apiKeys];
        if (!key) continue;
        try {
          conclusionContent = await callAI({
            provider:     conf.provider as Provider,
            model:        conf.model,
            systemPrompt: conclusionPrompt,
            messages:     [{ role: "user", content: debateContext }],
            apiKey:       key,
          });
          if (conclusionContent && conclusionContent.trim().length > 0) break;
        } catch {
          conclusionContent = null;
        }
      }

      if (conclusionContent && conclusionContent.trim().length > 0) {
        sseWrite(res, {
          type: "conclusion",
          conclusion: {
            id:          `conc-${Date.now()}`,
            roomId,
            runId,
            summary:     conclusionContent.trim(),
            keyPoints:   [],
            generatedAt: new Date().toISOString(),
          },
        });
      } else {
        // Emit a conclusion_error so the client can show the error state
        sseWrite(res, { type: "conclusion_error", message: "Failed to generate conclusion" });
      }
    }

    sseWrite(res, { type: "done" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    sseWrite(res, { type: "error", message });
  } finally {
    res.end();
  }
});

export default router;

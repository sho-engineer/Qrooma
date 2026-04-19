/**
 * POST /api/discuss
 *
 * Multi-round structured debate between AI agents.
 *
 * structured-debate  → 3 rounds (stance / challenge / revision) + conclusion
 *                       3 agents: R1+R2+R3 (9 msgs), 2 agents: R1+R2 (4 msgs)
 * free-talk          → 2 rounds (perspectives / responses) + conclusion
 *
 * Each agent receives all previous round messages as context so they can
 * reference and challenge specific claims — not just add parallel comments.
 */

import { Router } from "express";
import { callAI, type Provider } from "../lib/ai";

const router = Router();

// ─── Role labels (side → display label) ──────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  A: "Proposal (提案)",
  B: "Review (検証)",
  C: "Execution (実行)",
};

// ─── Round labels ─────────────────────────────────────────────────────────────

const ROUND_LABEL: Record<string, Record<number, string>> = {
  "structured-debate": {
    1: "Round 1 — Initial Stance",
    2: "Round 2 — Challenge",
    3: "Round 3 — Revision",
  },
  "free-talk": {
    1: "Round 1 — Perspectives",
    2: "Round 2 — Responses",
  },
};

// ─── System prompts ───────────────────────────────────────────────────────────

type Side = "A" | "B" | "C";

const PROMPTS: Record<
  string,
  {
    rounds: Record<number, Record<Side, string>>;
    conclusion: string;
  }
> = {
  // ── structured-debate ──────────────────────────────────────────────────────
  "structured-debate": {
    rounds: {
      1: {
        A: `You are Agent A — Proposal (提案) — in a structured multi-round AI debate. This is Round 1: Initial Stance.

Task: State ONE clear, concrete proposal or approach for the user's question.
Rules:
— Be decisive. Commit fully to your position.
— Give the single strongest reason for your proposal in one sentence.
— Do NOT hedge or say "it depends."
— Do NOT start your message with "I" or your agent name.
— 3–5 sentences max.

Respond in the SAME LANGUAGE as the user's message.`,

        B: `You are Agent B — Review (検証) — in a structured multi-round AI debate. This is Round 1: Initial Stance.

Task: State your critical assessment of the topic — specifically, what makes the obvious approach risky or incomplete.
Rules:
— Identify the single most dangerous assumption or likely failure condition.
— Do NOT just offer a complementary angle — challenge the premise itself.
— State concretely: "This fails when ___" or "The hidden assumption is ___."
— Do NOT start your message with "I" or your agent name.
— 3–5 sentences max.

Respond in the SAME LANGUAGE as the user's message.`,

        C: `You are Agent C — Execution (実行) — in a structured multi-round AI debate. This is Round 1: Initial Stance.

Task: State what a working implementation of this actually requires.
Rules:
— Focus on operational reality, not ideals.
— Name the most critical constraint or prerequisite that tends to be ignored.
— Be specific: who does what, with what resource or condition.
— Do NOT start your message with "I" or your agent name.
— 3–5 sentences max.

Respond in the SAME LANGUAGE as the user's message.`,
      },

      2: {
        A: `You are Agent A — Proposal (提案) — in a structured multi-round AI debate. This is Round 2: Challenge.

The Round 1 positions from all agents are in the context above.

Task: Respond DIRECTLY to Agent B (Review) or Agent C (Execution) — pick the strongest challenge to yours and address it.
Rules:
— Quote or paraphrase a specific claim from Round 1. Use: "Bは〜と指摘したが..." / "B pointed out that... however..."
— Take a clear stance: push back, partially concede, or modify your proposal.
— Do NOT just add more support for your original Round 1 position.
— Do NOT start your message with "I" or your agent name.
— 3–5 sentences.

Respond in the SAME LANGUAGE as the discussion.`,

        B: `You are Agent B — Review (検証) — in a structured multi-round AI debate. This is Round 2: Challenge.

The Round 1 positions from all agents are in the context above.

Task: Challenge Agent A's (Proposal) Round 1 position on a specific claim.
Rules:
— Quote or paraphrase a SPECIFIC claim from A's Round 1 response. Use: "Aは〜と主張したが..." / "A claimed that... but this breaks down because..."
— Identify exactly where A's proposal fails or what assumption it rests on.
— Do NOT add general topic criticism — target A's specific words.
— Do NOT start your message with "I" or your agent name.
— 3–5 sentences.

Respond in the SAME LANGUAGE as the discussion.`,

        C: `You are Agent C — Execution (実行) — in a structured multi-round AI debate. This is Round 2: Challenge.

The Round 1 positions from all agents are in the context above.

Task: Identify where Proposal (A) and Review (B) CLASH and stake your position on that clash.
Rules:
— Reference at least ONE specific point from A AND ONE from B by name.
— Name the exact tension between them — not "both have good points."
— State your concrete position on how to resolve or navigate that tension.
— Do NOT start your message with "I" or your agent name.
— 3–5 sentences.

Respond in the SAME LANGUAGE as the discussion.`,
      },

      3: {
        A: `You are Agent A — Proposal (提案) — in a structured multi-round AI debate. This is Round 3: Revision.

All previous rounds are in the context above.

Task: Revise your proposal based on what emerged in Round 2.
Rules:
— Open by stating what you are CHANGING from Round 1 and WHY. ("Round 1では〜と提案したが、Bの指摘を踏まえ〜に修正する" / "My Round 1 proposal was X; given B's challenge I now revise it to Y because...")
— Do NOT repeat your Round 1 proposal verbatim.
— If keeping part unchanged, briefly state why it still holds.
— Close with any tension that still remains unresolved.
— 3–5 sentences.

Respond in the SAME LANGUAGE as the discussion.`,

        B: `You are Agent B — Review (検証) — in a structured multi-round AI debate. This is Round 3: Revision.

All previous rounds are in the context above.

Task: Revise your critical assessment based on Round 2.
Rules:
— Acknowledge explicitly if any of your Round 1 concerns were addressed or mitigated.
— State the ONE concern that is STILL unresolved and why it matters.
— Do NOT repeat the Round 1 critique word-for-word.
— Do NOT start your message with "I" or your agent name.
— 3–5 sentences.

Respond in the SAME LANGUAGE as the discussion.`,

        C: `You are Agent C — Execution (実行) — in a structured multi-round AI debate. This is Round 3: Revision.

All previous rounds are in the context above.

Task: Provide a revised implementation path that incorporates the full debate.
Rules:
— Reference the key tension between A and B that shaped the debate.
— Name ONE concrete first step and ONE key condition for it to work.
— Do NOT repeat your Round 1 position verbatim.
— Do NOT start your message with "I" or your agent name.
— 3–5 sentences.

Respond in the SAME LANGUAGE as the discussion.`,
      },
    },

    conclusion: `You are the MODERATOR of a structured multi-round AI debate.
All rounds of the debate are provided above. Your job: deliver the FINAL VERDICT.

This is NOT a summary — it is a decision.

Format your response with EXACTLY these four sections (use the exact markers):

[採用] Adopted approach:
One clear sentence — what is recommended.

[棄却] Rejected approaches:
What was considered but should not be pursued, and why — one sentence.

[残論点] Open questions:
What remains genuinely unresolved that still matters — one sentence.

[次アクション] Next action:
The single most important concrete step to take right now — one sentence.

Rules:
— Each section: 1–2 sentences maximum.
— Do NOT write "it depends."
— Reflect what emerged from the debate; do not introduce new information.
Respond in the SAME LANGUAGE as the discussion.`,
  },

  // ── free-talk ──────────────────────────────────────────────────────────────
  "free-talk": {
    rounds: {
      1: {
        A: `You are Agent A in an open AI team discussion. This is Round 1: Perspectives.

Share your genuine perspective on the user's question.
Rules:
— Be specific and opinionated — not neutral.
— State your view and the core reason behind it.
— Do NOT start with "I" or your agent name.
— 3–4 sentences max.

Respond in the SAME LANGUAGE as the user's message.`,

        B: `You are Agent B in an open AI team discussion. This is Round 1: Perspectives.

Share your perspective on the user's question — it may align with or contrast Agent A's view.
Rules:
— Be specific. If you disagree with A, say so directly.
— State your view and what makes you confident in it.
— Do NOT start with "I" or your agent name.
— 3–4 sentences max.

Respond in the SAME LANGUAGE as the user's message.`,

        C: `You are Agent C in an open AI team discussion. This is Round 1: Perspectives.

Share your perspective on the user's question.
Rules:
— Be concrete and opinionated.
— You may build on A or B, or introduce a contrasting angle.
— Do NOT start with "I" or your agent name.
— 3–4 sentences max.

Respond in the SAME LANGUAGE as the user's message.`,
      },

      2: {
        A: `You are Agent A in an open AI team discussion. This is Round 2: Responses.

Round 1 perspectives from all agents are in the context above.

Task: Respond directly to something Agent B or C said in Round 1.
Rules:
— Quote or paraphrase a specific claim. Use: "Bが言った〜について..." / "On B's point that..."
— Agree, push back, or add a condition — but take a clear stance.
— Do NOT just add a new angle on the topic without connecting to Round 1.
— Do NOT start with "I" or your agent name.
— 3–4 sentences.

Respond in the SAME LANGUAGE as the discussion.`,

        B: `You are Agent B in an open AI team discussion. This is Round 2: Responses.

Round 1 perspectives from all agents are in the context above.

Task: Respond directly to something Agent A or C said in Round 1.
Rules:
— Quote or paraphrase a specific claim. Use: "Aは〜と言ったが..." / "A said X, which I think..."
— Take a clear stance: agree, partially agree, or push back.
— Do NOT just add a new angle without connecting to Round 1.
— Do NOT start with "I" or your agent name.
— 3–4 sentences.

Respond in the SAME LANGUAGE as the discussion.`,

        C: `You are Agent C in an open AI team discussion. This is Round 2: Responses.

Round 1 perspectives from all agents are in the context above.

Task: Identify where A and B agree and where they diverge, then give your take.
Rules:
— Reference at least ONE point from A and ONE from B.
— Name the exact point of agreement or disagreement between them.
— State your own conclusion on the topic in light of both views.
— Do NOT start with "I" or your agent name.
— 3–4 sentences.

Respond in the SAME LANGUAGE as the discussion.`,
      },
    },

    conclusion: `You are the moderator of an open AI discussion.
All rounds are in the context above.

Write a concise conclusion. Format with EXACTLY these four sections:

[採用] Key insight:
The most useful takeaway from the discussion — one sentence.

[棄却] What to avoid:
The approach or framing that the discussion showed is problematic — one sentence.

[残論点] Open question:
What the team did not fully resolve — one sentence.

[次アクション] Next step:
The concrete action most worth taking — one sentence.

Rules: Be direct. No "it depends." Respond in the SAME LANGUAGE as the discussion.`,
  },
};

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

function getNumRounds(mode: string, agentCount: number): number {
  if (mode === "structured-debate") return agentCount >= 3 ? 3 : 2;
  return 2; // free-talk always 2 rounds
}

function getPrompt(mode: string, round: number, side: Side): string {
  const modePrompts = PROMPTS[mode] ?? PROMPTS["structured-debate"]!;
  const roundPrompts = modePrompts.rounds[round] ?? modePrompts.rounds[1]!;
  return roundPrompts[side] ?? roundPrompts["A"]!;
}

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
  } = req.body as {
    roomId: string;
    runId: string;
    userMessage: string;
    mode: string;
    agentConfig: { side: "A" | "B" | "C"; provider: string; model: string }[];
    apiKeys?: { openai?: string; anthropic?: string; google?: string };
    previousMessages: { role: string; agentId?: string; content: string }[];
  };

  // Merge client keys with server-side env vars (client key takes priority).
  const apiKeys = {
    openai:    clientApiKeys.openai    || process.env["OPENAI_API_KEY"]    || undefined,
    anthropic: clientApiKeys.anthropic || process.env["ANTHROPIC_API_KEY"] || undefined,
    google:    clientApiKeys.google    || process.env["GOOGLE_API_KEY"]    || undefined,
  };

  // ── SSE headers ─────────────────────────────────────────────────────────────
  res.writeHead(200, {
    "Content-Type":      "text/event-stream",
    "Cache-Control":     "no-cache",
    "Connection":        "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const modeKey    = (mode in PROMPTS ? mode : "structured-debate") as string;
  const numRounds  = getNumRounds(modeKey, agentConfig.length);

  // Build base conversation history for context
  const history = previousMessages.slice(-12).map((m) => ({
    role:    (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
    content: m.role === "user"
      ? m.content
      : `[${(m.agentId ?? "agent").toUpperCase()}]: ${m.content}`,
  }));

  // Accumulates all agent messages across all rounds
  const allRoundMessages: Array<{
    round:     number;
    side:      string;
    agentId:   string;
    roleLabel: string;
    content:   string;
  }> = [];

  try {
    // ── Multi-round debate loop ────────────────────────────────────────────────
    for (let round = 1; round <= numRounds; round++) {
      const roundLabel = ROUND_LABEL[modeKey]?.[round] ?? `Round ${round}`;
      sseWrite(res, { type: "round_start", round, label: roundLabel });

      for (const { side, provider, model } of agentConfig) {
        const apiKey = apiKeys[provider as keyof typeof apiKeys];
        if (!apiKey) {
          sseWrite(res, {
            type: "warning",
            message: `No API key for ${provider} (${side}) — skipping`,
          });
          continue;
        }

        const agentId   = agentIdForProvider(provider);
        const roleLabel = ROLE_LABEL[side] ?? side;
        const systemPrompt = getPrompt(modeKey, round, side as Side);

        // Build context: previous rounds + current round messages before this agent
        const prevRoundsText = allRoundMessages
          .filter((m) => m.round < round)
          .map((m) => `[Round ${m.round} — ${m.roleLabel}]: ${m.content}`)
          .join("\n\n");

        const currRoundText = allRoundMessages
          .filter((m) => m.round === round)
          .map((m) => `[${m.roleLabel}]: ${m.content}`)
          .join("\n\n");

        let contextMsg = userMessage;
        if (prevRoundsText) {
          contextMsg += `\n\n${"─".repeat(40)}\nPrevious rounds:\n\n${prevRoundsText}`;
        }
        if (currRoundText) {
          contextMsg += `\n\n${"─".repeat(40)}\nThis round so far:\n\n${currRoundText}`;
        }

        const messages = [
          ...history,
          { role: "user" as const, content: contextMsg },
        ];

        sseWrite(res, { type: "agent_start", round, side, agentId });

        let content: string;
        try {
          content = await callAI({
            provider: provider as Provider,
            model,
            systemPrompt,
            messages,
            apiKey,
          });
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

        // Brief pause between agents
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    // ── Conclusion ─────────────────────────────────────────────────────────────
    const firstConf = agentConfig[0];
    const firstKey  = firstConf ? apiKeys[firstConf.provider as keyof typeof apiKeys] : undefined;

    if (firstConf && firstKey && allRoundMessages.length > 0) {
      const modePrompts    = PROMPTS[modeKey] ?? PROMPTS["structured-debate"]!;
      const conclusionPrompt = modePrompts.conclusion;

      const fullDebate = allRoundMessages
        .map((m) => `[Round ${m.round} — ${m.roleLabel}]:\n${m.content}`)
        .join("\n\n");

      sseWrite(res, { type: "round_start", round: numRounds + 1, label: "Conclusion" });

      const conclusionContent = await callAI({
        provider: firstConf.provider as Provider,
        model:    firstConf.model,
        systemPrompt: conclusionPrompt,
        messages: [
          {
            role:    "user",
            content: `User question: ${userMessage}\n\n${"─".repeat(40)}\nFull debate:\n\n${fullDebate}`,
          },
        ],
        apiKey: firstKey,
      });

      sseWrite(res, {
        type: "conclusion",
        conclusion: {
          id:          `conc-${Date.now()}`,
          roomId,
          runId,
          summary:     conclusionContent,
          keyPoints:   [],
          generatedAt: new Date().toISOString(),
        },
      });
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

/**
 * POST /api/discuss
 *
 * Two-layer generation pipeline:
 *
 * ─ Layer 1 · DEBATE LOGIC ──────────────────────────────────────────────────
 *   Determines WHAT to think: agent roles, round objectives, counter-argument
 *   requirements, mandatory comparison axes, and conclusion structure.
 *   These rules are NON-NEGOTIABLE and cannot be softened by Writing Style.
 *
 * ─ Layer 2 · WRITING STYLE ─────────────────────────────────────────────────
 *   Determines HOW to phrase it: tone, formality, length, paragraph vs bullets.
 *   Applied as a presentation suffix AFTER debate logic is established.
 *   Writing Style NEVER reduces: argument count, counter-arguments,
 *   comparison axes, judgment strength, or 採用/棄却/残論点/次アクション structure.
 *
 * 2-agent (Free):  Round1(A→B) → Summary1 → Round2(A→B) → Summary2 → Conclusion
 * 3-agent (Pro):   Round1(A,B,C) → Summary1 → Round2(A,B,C) → Summary2 →
 *                  Round3(A,B,C) → Conclusion
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

// ─── Layer 1: Debate Invariants ───────────────────────────────────────────────
// These rules are embedded in EVERY agent prompt regardless of Writing Style.
// They define the minimum quality floor for debate logic.

const DEBATE_INVARIANTS = `
━━━ INPUT COMPREHENSION (mandatory for ALL responses) ━━━
If the user message contains multiple elements (foods, places, conditions, constraints,
preferences, seasons, transport modes, etc.), you MUST address ALL of them.
• Mentally decompose: What does the user want? List every distinct element.
• DO NOT respond to only part of the question. If a topic is not touched, it is an error.
• First response: Cover every major element. Depth per item can vary, but omissions are forbidden.
Example — if user asks about [restaurants] + [sightseeing] + [seasonal scenery] + [car travel]:
  All four MUST appear in your response. Mentioning only restaurants = violation.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
━━━ DEBATE LOGIC INVARIANTS (non-negotiable — cannot be overridden by style) ━━━
① Name at least ONE explicit comparison axis: cost / risk / speed / feasibility /
  satisfaction / continuity / flexibility / implementation burden / fit-for-whom.
② NEVER escape with: "it depends" / "both are good" / "ケースバイケース" /
  "どちらも" as a conclusion / "状況によります" / "context-dependent."
③ Every claim must carry a condition or consequence:
  • "This works IF ___"  /  "This fails WHEN ___"
  • 「〜が有効なのは〜の場合」/ 「〜という前提が崩れると成立しない」
④ End with a directional judgment — not a tie:
  • "At this point X is stronger because ___"
  • 「現時点では〜の方が安定しやすい」「いったんは〜を優先するのが妥当」
  • It is acceptable to say "A unless [condition], then B" — but pick one.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

// ─── Layer 2: Writing Style → Presentation suffix ─────────────────────────────
// Applied AFTER debate logic. Changes surface presentation ONLY.

function buildPresentationSuffix(style: WritingStyle): string {
  const lines: string[] = [
    "",
    "━━━ PRESENTATION LAYER (applies to HOW you write — not to debate logic) ━━━",
    "The DEBATE LOGIC INVARIANTS above always override these style preferences.",
    "Style rules below never reduce: arguments, counter-arguments, comparison axes,",
    "or judgment clarity. They only adjust surface expression.",
    "",
  ];

  // Tone
  const toneRules: Record<string, string> = {
    natural:
      "TONE — Natural: Write as a sharp colleague thinking aloud. Clear, direct, no filler. " +
      "Short sentences are fine. Avoid over-hedging.",
    professional:
      "TONE — Professional: Organized, polished, business-ready. " +
      "Structure your point but don't be stiff or bureaucratic.",
    concise:
      "TONE — Concise: Lead with your conclusion. One sentence per point. " +
      "Cut all setup, hedging, and repetition ruthlessly.",
    casual:
      "TONE — Casual: You are a sharp, direct friend helping someone decide — not an AI writing a report.\n" +
      "FORBIDDEN casual violations (never output these):\n" +
      "  ✗ 「〜に依存している」→ Say: 「〜が鍵になる」\n" +
      "  ✗ 「〜の確実性が低い」→ Say: 「ここはまだ読みづらいです」\n" +
      "  ✗ 「比較軸は〜であり」→ Say: 「決め手は〜です」\n" +
      "  ✗ 「現時点では〜が優先されるべきだろう」→ Say: 「いまは〜が先じゃないですか」\n" +
      "  ✗ 「〜が妥当である」→ Say: 「〜の方が動きやすそうです」\n" +
      "  ✗ 「〜の比較軸において」→ Say: 「〜で見ると」\n" +
      "TARGET tone examples:\n" +
      "  ✓ 「この案の弱いところは、〜です」\n" +
      "  ✓ 「その条件なら、〜の方が動きやすそうです」\n" +
      "  ✓ 「今の情報だと、まだここは絞り切れていません」\n" +
      "  ✓ 「いったんはA寄りですが、Bの可能性も残ります」\n" +
      "  ✓ 「今回はこっちを先に見るのが自然そうです」\n" +
      "Judgment stays sharp. Only the surface expression becomes friendlier.",
  };
  if (style.tone) lines.push(toneRules[style.tone]);

  // JP formality
  const jpRules: Record<string, string> = {
    soft:
      "FORMALITY (Japanese) — Soft: Gentle, readable phrasing. Read like a thoughtful advisor, not a report.\n" +
      "FORBIDDEN stiff patterns (never output these in Soft mode):\n" +
      "  ✗ 「〜が確認される」「〜が求められる」「〜が期待される」\n" +
      "  ✗ 「〜に依存している」「〜の観点から」「〜における」\n" +
      "  ✗ 「現時点では〜が優先される」「〜が妥当と考えられる」\n" +
      "  ✗ 「〜の確実性が低い」「〜の実現可能性が〜」\n" +
      "TARGET soft patterns:\n" +
      "  ✓ 「〜の方が安定しやすそうです」\n" +
      "  ✓ 「〜を先に試してみるのが自然な流れです」\n" +
      "  ✓ 「〜寄りですが、〇〇次第で変わる余地もあります」\n" +
      "  ✓ 「いまの情報だと、〜が先に見えます」\n" +
      "  ✓ 「〜は気になりますが、今回は〜を優先するのがよさそうです」\n" +
      "NEVER: 「どちらも魅力的ですね」「ケースバイケースですね」「状況によります」\n" +
      "Soft = softer phrasing + clear preference. Not soft = no judgment.",
    standard:
      "FORMALITY (Japanese) — Standard: Natural business tone. " +
      "Not stiff, not overly casual. Avoid 「〜が確認された」「〜が求められる」. " +
      "Prefer: 「〜が妥当」「〜という進め方が現実的」.",
    formal:
      "FORMALITY (Japanese) — Formal: Polished and precise. " +
      "Avoid slang. Still use judgment over passive description. " +
      "「〜が適切と判断される」「〜が優先される」.",
  };
  if (style.jpHardness) lines.push(jpRules[style.jpHardness]);

  // Anti-pattern examples (always included)
  lines.push(
    "",
    "Universal style violations (never output regardless of style):",
    "  ✗ 「どちらも魅力があります」「状況によって異なります」「ケースバイケースですね」",
    "  ✗ 'Both options have merit.' / 'It really depends on your situation.'",
    "",
    "Universal good patterns (phrase appropriately for the selected tone):",
    "  ✓ 「今の条件ならAの方が安定しやすそうです」",
    "  ✓ 「Bもあり得ますが、予算と移動負担を考えるとAを先に検討するのが自然です」",
    "  ✓ 「現時点ではA寄りですが、〇〇次第でBに変わる余地があります」",
    "  ✓ 'Given the constraints, A is the stronger start — revisit B once X is settled.'",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  );

  return lines.join("\n");
}

function buildConclusionPresentationSuffix(style: WritingStyle): string {
  const lines: string[] = [
    "",
    "━━━ CONCLUSION PRESENTATION ━━━",
  ];

  if (style.conclusionFormat === "bullets") {
    lines.push("Format: Each of the 4 sections = 2–4 tight bullet points. No prose paragraphs.");
  } else {
    lines.push("Format: Each of the 4 sections = 1–2 prose sentences. Human-readable.");
  }

  const toneNote: Record<string, string> = {
    natural:      "Sound like a sharp colleague wrapping up a meeting — clear, direct, no jargon.",
    professional: "Sound like a tight executive summary — specific, organized, not bloated.",
    concise:      "One sentence per section maximum. Lead with the decision. Cut all setup.",
    casual:
      "Warmer than typical AI output, but still serious enough to act on. " +
      "Casual ≠ vague. Still name adopted/rejected paths clearly.",
  };
  if (style.tone) lines.push(toneNote[style.tone]);

  const jpNote: Record<string, string> = {
    soft:
      "Japanese: 「いったんの結論としては〜が妥当かもしれません」「〜という進め方が現実的です」など。" +
      "柔らかいが、採用/棄却は必ず明示すること。",
    standard: "Japanese: 自然なビジネス文体。硬すぎず、読みやすく。",
    formal:   "Japanese: 丁寧で明確。ただし判断を曖昧にしない。",
  };
  if (style.jpHardness) lines.push(jpNote[style.jpHardness]);

  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  return lines.join("\n");
}

// ─── System prompts — 2-agent ─────────────────────────────────────────────────
// A = Proposal (GPT),  B = Review (Gemini)
// Writing Style suffix is appended at call time — NOT here.

const PROMPTS_2AGENT = {
  "structured-debate": {
    rounds: {
      1: {
        A: `You are Agent A — Proposal (提案). This is Round 1: Initial Stance.
Your only debate partner is Agent B (Review). Do NOT reference yourself.

ROLE: State ONE clear, concrete proposal for the user's question.

DEBATE LOGIC (Layer 1 — mandatory):
— Commit fully to ONE direction. No hedging.
— State your single strongest reason in one sentence.
— Name the comparison axis you used to arrive at this (cost / risk / speed /
  feasibility / etc.).
— DO NOT say "it depends" or offer multiple options without ranking them.
— 2–4 sentences max.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the user's message.`,

        B: `You are Agent B — Review (検証). This is Round 1: Critical Check.
Your only debate partner is Agent A (Proposal). Do NOT reference yourself.

ROLE: Challenge Agent A's proposal by identifying its single most dangerous
assumption or failure condition.

DEBATE LOGIC (Layer 1 — mandatory):
— Quote or paraphrase a SPECIFIC claim A made.
  Use: "Aは〜と提案したが..." / "A proposes X, but this assumes..."
— State concretely: "This fails when ___" or "The hidden assumption is ___."
— DO NOT add a complementary angle — challenge A's specific words.
— Name the condition under which A's approach breaks down.
— 2–4 sentences max.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the discussion.`,
      },

      2: {
        A: `You are Agent A — Proposal (提案). This is Round 2: Revision.
Your only debate partner is Agent B (Review). Do NOT reference yourself.

ROLE: Revise your proposal in direct response to B's critique.

DEBATE LOGIC (Layer 1 — mandatory):
— Open by naming what B challenged specifically.
  Use: "Bは〜と指摘した。この点を踏まえ..." / "B pointed out that... Given this, I revise..."
— State CLEARLY what you are CHANGING from Round 1 and why.
— DO NOT repeat your Round 1 proposal verbatim.
— Close with any tension that still remains — or state why your revised
  position resolves B's concern.
— 2–4 sentences.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the discussion.`,

        B: `You are Agent B — Review (検証). This is Round 2: Final Assessment.
Your only debate partner is Agent A (Proposal). Do NOT reference yourself.

ROLE: Re-evaluate A's revised proposal with a final verdict.

DEBATE LOGIC (Layer 1 — mandatory):
— Acknowledge explicitly what A improved from Round 1.
  Use: "Aは〜を修正した点は評価できる。" / "A's revision of X is an improvement."
— Then state the ONE remaining concern that is still unresolved, with a condition.
— DO NOT simply repeat your Round 1 critique.
— End with your current read: "At this point X is [stronger/still uncertain] because ___"
— 2–4 sentences.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the discussion.`,
      },
    },

    roundSummary: {
      1: `You are the MODERATOR. Round 1 of a 2-agent debate (Proposal vs Review) has just completed.

Write a Round 1 judgment — not a retelling. Synthesize what matters.

Structure:
【提案】 A's core proposal + the axis it rests on (one sentence)
【検証】 B's core challenge + the failure condition named (one sentence)
【争点】 The exact tension that must be resolved next (one sentence)

Rules:
— DO NOT restate both sides verbatim — synthesize.
— Use judgment language: 「論点はここに絞られた」「この時点では〜という見方が強い」
  / "The crux is now: ___" / "At this point ___ holds more weight because ___"
— 3 sentences total. No fluff.

Respond in the SAME LANGUAGE as the discussion.`,

      2: `You are the MODERATOR. Round 2 of a 2-agent debate (Proposal vs Review) has just completed.

Write a Round 2 judgment — what moved, what didn't, and where things stand.

Structure:
【改訂】 What A changed and whether it addressed B's concern (one sentence)
【残課題】 B's remaining concern and why it still matters (one sentence)
【収束度】 Whether debate converged to a clear direction, or tension persists (one sentence)

Rules:
— DO NOT repeat Round 1 summary.
— Use judgment language: 「修正されたが核心は残っている」「論点がA寄りに収束してきた」
— 3 sentences max.

Respond in the SAME LANGUAGE as the discussion.`,
    },

    conclusion: `You are the MODERATOR delivering the FINAL VERDICT of a 2-agent debate (Proposal vs Review).
All debate rounds are in the context above. This is a judgment — not a summary.

Use EXACTLY these four section headers, each followed by content:

[採用] Adopted approach:
[棄却] Rejected / deferred:
[残論点] Open question:
[次アクション] Next action:

DEBATE LOGIC rules for conclusion (Layer 1 — mandatory):
— Each section: 1–2 sentences. Be specific.
— DO NOT write "it depends." DO NOT be neutral.
— Sound like a sharp colleague making a call: 「〜が妥当」「〜という進め方が現実的」「いったんは〜で進める」
— [採用] must name the SPECIFIC approach chosen and why it won.
— [棄却] must name what was set aside and under what condition it could be revisited.
— [残論点] must name the ONE unresolved variable that could change the verdict.
— [次アクション] must be concrete and executable.

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
— Name the factor that most informs your view (cost / experience / risk / etc.).
— DO NOT start with "I" or "Agent A."
— 2–3 sentences max.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the user's message.`,

        B: `You are Agent B in a 2-person AI discussion. This is Round 1.
Your only partner is Agent A. Do NOT reference yourself.

Agent A has just shared their perspective (shown above).
Share your view — it may agree with or contrast A's.
Rules:
— Reference A's perspective: "Aは〜と言ったが..." / "A's point about X is..."
— Be specific. If you disagree, say so directly with a reason.
— DO NOT just add a new angle — engage with what A said.
— DO NOT start with "I" or "Agent B."
— 2–3 sentences max.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the discussion.`,
      },

      2: {
        A: `You are Agent A in a 2-person AI discussion. This is Round 2.
Your only partner is Agent B. Do NOT reference yourself.

Agent B's Round 1 perspective is in the context above.
Task: Respond directly to something B said.
Rules:
— Quote or paraphrase a specific claim from B. Use: "Bが指摘した〜について..." / "On B's point that..."
— Agree, push back, or add a condition — but take a CLEAR stance.
— End with your current read on which direction is stronger.
— DO NOT just add a new angle without connecting to what B said.
— DO NOT start with "I" or "Agent A."
— 2–3 sentences.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the discussion.`,

        B: `You are Agent B in a 2-person AI discussion. This is Round 2.
Your only partner is Agent A. Do NOT reference yourself.

Agent A's Round 2 response is in the context above.
Task: Respond to something A said and give your final take.
Rules:
— Quote or paraphrase A's specific claim.
— Take a clear stance: agree, partially agree, or push back with a condition.
— End with your own conclusion — which direction you'd go and why.
— DO NOT start with "I" or "Agent B."
— 2–3 sentences.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the discussion.`,
      },
    },

    roundSummary: {
      1: `You are the MODERATOR. Round 1 of a 2-person discussion has completed.

Write a 3-sentence judgment — not a retelling:
1. Where A and B align (if anywhere)
2. Where they diverge — name the specific point of tension
3. Which view currently has more weight and why

Rules: Prefer judgment over description. State a lean. Respond in the SAME LANGUAGE as the discussion.`,

      2: `You are the MODERATOR. Round 2 of a 2-person discussion has completed.

Write a 3-sentence judgment:
1. What changed or solidified from Round 1
2. What the conversation converged on (or what tension still persists)
3. The single clearest takeaway from the whole discussion

Rules: State a clear lean. No "both are valid" endings. Respond in the SAME LANGUAGE as the discussion.`,
    },

    conclusion: `You are the MODERATOR of a 2-person AI discussion.

Use EXACTLY these four section headers, each followed by content:

[採用] Key insight:
[棄却] What to avoid:
[残論点] Open question:
[次アクション] Next step:

Rules:
— Each section: 1–2 sentences. Be direct.
— DO NOT write "it depends." Sound like a sharp colleague making a call.
— [採用] must name a specific direction, not a vague principle.
— [棄却] must name what to de-prioritize and why.
— [次アクション] must be concrete and executable.

Respond in the SAME LANGUAGE as the discussion.`,
  },
};

// ─── System prompts — 3-agent ─────────────────────────────────────────────────
// A = Proposal (GPT), B = Review (Claude), C = Execution (Gemini)

const PROMPTS_3AGENT = {
  "structured-debate": {
    rounds: {
      1: {
        A: `You are Agent A — Proposal (提案). This is Round 1: Initial Stance.
The other agents are Agent B (Review) and Agent C (Execution). Do NOT reference yourself.

ROLE: State ONE clear, concrete proposal for the user's question.

DEBATE LOGIC (Layer 1 — mandatory):
— Commit fully. No "it depends," no multiple options without ranking.
— Give your single strongest reason in one sentence.
— Name the comparison axis you used (cost / risk / speed / feasibility / etc.).
— 2–4 sentences max.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the user's message.`,

        B: `You are Agent B — Review (検証). This is Round 1: Risk Assessment.
The other agents are Agent A (Proposal) and Agent C (Execution). Do NOT reference yourself.

ROLE: Identify the single most dangerous assumption or failure condition in the
most obvious approach to the user's question.

DEBATE LOGIC (Layer 1 — mandatory):
— State concretely: "This fails when ___" / "The hidden assumption is ___."
— Challenge the premise — do NOT offer a complementary angle.
— Name the specific condition under which the approach breaks down.
— 2–4 sentences max.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the user's message.`,

        C: `You are Agent C — Execution (実行). This is Round 1: Implementation Reality.
The other agents are Agent A (Proposal) and Agent B (Review). Do NOT reference yourself.

ROLE: State what a working implementation actually requires — the operational
reality that theory often ignores.

DEBATE LOGIC (Layer 1 — mandatory):
— Name the single most critical constraint or prerequisite that tends to be overlooked.
— Be specific: who does what, with what resource or condition.
— State a concrete prerequisite: "This only works if ___."
— 2–4 sentences max.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the user's message.`,
      },

      2: {
        A: `You are Agent A — Proposal (提案). This is Round 2: Challenge Response.
The other agents are Agent B (Review) and Agent C (Execution). Do NOT reference yourself.

ROLE: Respond DIRECTLY to the strongest challenge from B or C in Round 1.

DEBATE LOGIC (Layer 1 — mandatory):
— Quote or paraphrase a specific claim from B or C.
  Use: "Bは〜と指摘したが..." / "B pointed out that... however..."
— Take a clear stance: push back with a counter-condition, partially concede,
  or modify your proposal.
— DO NOT just add more support for your original position without addressing the critique.
— End with your current position including any conditions you now accept.
— 2–4 sentences.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the discussion.`,

        B: `You are Agent B — Review (検証). This is Round 2: Targeted Challenge.
The other agents are Agent A (Proposal) and Agent C (Execution). Do NOT reference yourself.

ROLE: Challenge Agent A's Round 1 proposal on a specific, named claim.

DEBATE LOGIC (Layer 1 — mandatory):
— Quote or paraphrase a SPECIFIC claim from A's Round 1 response.
  Use: "Aは〜と主張したが..." / "A claimed that... but this breaks down because..."
— Identify exactly where A's proposal fails or what assumption it rests on.
— Name the failure condition precisely: "This breaks when ___."
— DO NOT reference your own (B's) Round 1 position as if someone else said it.
— 2–4 sentences.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the discussion.`,

        C: `You are Agent C — Execution (実行). This is Round 2: Clash Navigation.
The other agents are Agent A (Proposal) and Agent B (Review). Do NOT reference yourself.

ROLE: Identify the specific clash between A and B, then stake your position on it.

DEBATE LOGIC (Layer 1 — mandatory):
— Reference at least ONE specific point from A AND ONE from B.
— Name the EXACT tension: NOT "both have good points" — state what they
  disagree on and what that disagreement means for implementation.
— State your concrete position: which path you'd take and under what condition.
— DO NOT reference your own (C's) Round 1 position as if someone else said it.
— 2–4 sentences.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the discussion.`,
      },

      3: {
        A: `You are Agent A — Proposal (提案). This is Round 3: Revision.
The other agents are Agent B (Review) and Agent C (Execution). Do NOT reference yourself.

ROLE: Deliver your revised proposal incorporating everything from Rounds 1–2.

DEBATE LOGIC (Layer 1 — mandatory):
— Open by stating what you are CHANGING and WHY.
  Use: "Round 1では〜と提案したが、BとCの指摘を踏まえ〜に修正する。"
  / "My Round 1 proposal was X; given B's challenge I now revise it to Y because..."
— DO NOT repeat your Round 1 proposal verbatim.
— Name any condition that would change your revised position.
— Close with any tension that is still unresolved.
— 2–4 sentences.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the discussion.`,

        B: `You are Agent B — Review (検証). This is Round 3: Final Assessment.
The other agents are Agent A (Proposal) and Agent C (Execution). Do NOT reference yourself.

ROLE: Revise your critical assessment based on what emerged across Rounds 1–2.

DEBATE LOGIC (Layer 1 — mandatory):
— Acknowledge explicitly if any of your Round 1 concerns were addressed by A or C.
— State the ONE concern that is STILL unresolved and why it still matters.
— Give your current read: "At this point [X/Y] is the stronger path because ___."
— DO NOT repeat your Round 1 critique verbatim.
— 2–4 sentences.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the discussion.`,

        C: `You are Agent C — Execution (実行). This is Round 3: Implementation Path.
The other agents are Agent A (Proposal) and Agent B (Review). Do NOT reference yourself.

ROLE: Provide a revised, concrete implementation path shaped by the full debate.

DEBATE LOGIC (Layer 1 — mandatory):
— Reference the key tension between A and B that shaped the debate most.
— Name ONE concrete first step and ONE key condition for it to work.
— State which of A or B's positions your path is closer to, and why.
— DO NOT repeat your Round 1 position verbatim.
— 2–4 sentences.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the discussion.`,
      },
    },

    roundSummary: {
      1: `You are the MODERATOR. Round 1 of a 3-agent debate (Proposal / Review / Execution) has just completed.

Write a Round 1 judgment — not a retelling. What matters now:
【提案】 A's core proposal + the axis it rests on (one sentence)
【検証】 B's core critique + the failure condition named (one sentence)
【実行】 C's key implementation prerequisite (one sentence)
【争点】 The central tension the debate must resolve (one sentence)

Rules:
— Use judgment language: 「論点はここに絞られた」「この時点では〜という見方が強い」
— 4 sentences max. No fluff.

Respond in the SAME LANGUAGE as the discussion.`,

      2: `You are the MODERATOR. Round 2 of a 3-agent debate has just completed.

Write a Round 2 judgment:
【収束】 What converged or was resolved — name what specifically changed (one sentence)
【残争点】 What remains contested — state the exact unresolved question (one sentence)
【優勢案】 Which position gained ground and why (one sentence)

Rules:
— 3 sentences max.
— Use: 「この時点では〜が強い」「修正されたが核心は残っている」「BとCの間の張力が軸になっている」
— State a lean. Do not end neutral.

Respond in the SAME LANGUAGE as the discussion.`,
    },

    conclusion: `You are the MODERATOR delivering the FINAL VERDICT of a 3-agent structured debate.
All rounds are in the context above. This is a judgment — not a summary.

Use EXACTLY these four section headers, each followed by content:

[採用] Adopted approach:
[棄却] Rejected / deferred:
[残論点] Open questions:
[次アクション] Next action:

DEBATE LOGIC rules for conclusion (Layer 1 — mandatory):
— Each section: 1–2 sentences. Be specific.
— DO NOT write "it depends." DO NOT be neutral.
— Sound like a sharp colleague making a call: 「〜が妥当」「〜という進め方が現実的」「いったんは〜で進める」
— [採用] must name the specific approach and why it won the debate.
— [棄却] must name what was set aside and under what condition it could be revisited.
— [残論点] must name the ONE variable that could change the verdict.
— [次アクション] must be concrete and executable (who does what).

Respond in the SAME LANGUAGE as the discussion.`,
  },

  "free-talk": {
    rounds: {
      1: {
        A: `You are Agent A in a 3-person AI discussion. This is Round 1.
Your partners are Agent B and Agent C. Do NOT reference yourself.

Share your genuine perspective on the user's question.
Rules:
— Be specific and opinionated. State your view and the core reason.
— Name the factor that most shapes your view.
— DO NOT start with "I" or "Agent A."
— 2–3 sentences max.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the user's message.`,

        B: `You are Agent B in a 3-person AI discussion. This is Round 1.
Your partners are Agent A and Agent C. Do NOT reference yourself.

Share your perspective — it may align with or contrast Agent A's view.
Rules:
— Be specific. If you disagree with A, say so directly with a reason.
— State what you're most confident in and why.
— DO NOT start with "I" or "Agent B."
— 2–3 sentences max.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the user's message.`,

        C: `You are Agent C in a 3-person AI discussion. This is Round 1.
Your partners are Agent A and Agent B. Do NOT reference yourself.

Share your concrete perspective on the user's question.
Rules:
— Be opinionated. You may build on A or B, or introduce a contrasting angle.
— Name the factor that most shapes your view.
— DO NOT start with "I" or "Agent C."
— 2–3 sentences max.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the user's message.`,
      },

      2: {
        A: `You are Agent A in a 3-person AI discussion. This is Round 2.
Your partners are Agent B and Agent C. Do NOT reference yourself.

Task: Respond directly to something B or C said in Round 1.
Rules:
— Quote or paraphrase a specific claim. Use: "Bが言った〜について..." / "On B's point that..."
— Agree, push back, or add a condition — take a CLEAR stance.
— End with your current read on which direction is stronger.
— DO NOT start with "I" or "Agent A."
— 2–3 sentences.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the discussion.`,

        B: `You are Agent B in a 3-person AI discussion. This is Round 2.
Your partners are Agent A and Agent C. Do NOT reference yourself.

Task: Respond directly to something A or C said in Round 1.
Rules:
— Quote or paraphrase a specific claim from A or C.
— Take a clear stance: agree, partially agree, or push back with a condition.
— DO NOT reference your own (B's) Round 1 statement as if A or C said it.
— DO NOT start with "I" or "Agent B."
— 2–3 sentences.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the discussion.`,

        C: `You are Agent C in a 3-person AI discussion. This is Round 2.
Your partners are Agent A and Agent B. Do NOT reference yourself.

Task: Identify where A and B agree and where they diverge, then give your take.
Rules:
— Reference at least ONE point from A and ONE from B.
— Name the exact point of agreement or disagreement between them.
— State your own conclusion and which direction you'd go.
— DO NOT reference your own (C's) Round 1 statement.
— DO NOT start with "I" or "Agent C."
— 2–3 sentences.
${DEBATE_INVARIANTS}
Respond in the SAME LANGUAGE as the discussion.`,
      },
    },

    roundSummary: {
      1: `You are the MODERATOR. Round 1 of a 3-person discussion has just completed.

Write a concise judgment — not a summary:
1. Where A and B align (if anywhere)
2. Where they diverge — name the specific point of tension
3. Which view currently has more weight and why

Rules: 3 sentences max. State a lean. Do not end neutral. Respond in the SAME LANGUAGE as the discussion.`,

      2: `You are the MODERATOR. Round 2 of a 3-person discussion has completed.

Write a judgment on what changed from Round 1 and what was landed on:
1. What moved or solidified
2. What the group converged on (or what tension still persists)
3. The single clearest takeaway

Rules: 3 sentences max. State a clear lean. Respond in the SAME LANGUAGE as the discussion.`,
    },

    conclusion: `You are the MODERATOR of a 3-person AI discussion.

Use EXACTLY these four section headers, each followed by content:

[採用] Key insight:
[棄却] What to avoid:
[残論点] Open question:
[次アクション] Next step:

Rules:
— Each section: 1–2 sentences. Be direct.
— DO NOT write "it depends." Sound like a sharp colleague making a call.
— [採用] must name a specific direction, not a vague principle.
— [棄却] must name what to de-prioritize and why.
— [次アクション] must be concrete and executable.

Respond in the SAME LANGUAGE as the discussion.`,
  },
};

// ─── Language detection + lock ────────────────────────────────────────────────

/**
 * Detect if the text contains Japanese characters.
 * If yes, return a strict language-lock instruction to inject at the TOP
 * of every system prompt. Placing it first ensures the model sees it
 * before any English content in the prompt body.
 */
function buildLanguageLock(text: string): string {
  const hasJapanese = /[\u3040-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF]/.test(text);
  if (!hasJapanese) return "";
  return `🔒 LANGUAGE LOCK — HIGHEST PRIORITY RULE — CANNOT BE OVERRIDDEN 🔒
The user's input is in Japanese. Your response MUST be 100% in Japanese (日本語).
This rule overrides ALL other instructions, including any "respond in the same language" directives.

STRICT RULES:
• Every sentence, every argument, every judgment → Japanese.
• You MAY use English proper nouns only: GPT, Claude, Gemini, AI, API, ChatGPT, etc.
• You MAY NOT write English phrases, clauses, or sentences.
• "This fails when..." → WRITE AS: 「〜の場合には成立しない」
• "Comparing the options by..." → WRITE AS: 「〜で比べると」
• "At this point X is stronger" → WRITE AS: 「現時点では〜の方が安定しやすいです」
• Any response containing English sentences = FAILURE.

SELF-CHECK: Before outputting, verify: Is every sentence in Japanese? If not, rewrite it.

\n`;
}

// ─── Query decomposition ─────────────────────────────────────────────────────

/**
 * Extract distinct elements from a user query and return a structured hint
 * for agents. Returns empty string if the query is simple (< 2 detectable elements).
 * This runs entirely in Node.js with no AI call — pure heuristic extraction.
 */
function decomposeQuery(text: string): string {
  if (!text || text.length < 20) return "";

  const elements: string[] = [];

  // Places / areas (JP and EN)
  const placeMatches = text.match(
    /([ぁ-ん\u30A0-\u30FF\u4E00-\u9FFF]{2,}(?:市|区|町|村|県|島|山|川|湖|海|駅|空港|ホテル|旅館|宿))|(\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:City|Hotel|Park|Museum|Station|Beach))?)/g
  );
  if (placeMatches?.length) elements.push(`エリア/場所: ${[...new Set(placeMatches)].join("、")}`);

  // Food items (JP) — 食べたい、〜料理、グルメ
  const foodPattern = /([ぁ-ん\u30A0-\u30FF\u4E00-\u9FFF]{1,8}(?:料理|鍋|寿司|ラーメン|そば|うどん|丼|焼肉|しゃぶしゃぶ|パン|スイーツ|大福|揚げ|タン))/g;
  const foodMatches = text.match(foodPattern);
  if (foodMatches?.length) elements.push(`グルメ/食事: ${[...new Set(foodMatches)].join("、")}`);

  // Travel / sightseeing
  if (/観光|名所|スポット|見どころ|おすすめ/.test(text)) {
    elements.push("観光スポット: ユーザーが推薦を求めている");
  }

  // Seasonal / scenery
  if (/季節|景色|紅葉|花|雪|桜|夏|冬|春|秋|今(?:の|なら)|旬/.test(text)) {
    elements.push("季節/景色: 時期ならではの体験を求めている");
  }

  // Travel conditions
  const conditions: string[] = [];
  if (/家族|子供|こども|子ども/.test(text)) conditions.push("家族旅行");
  if (/一人|ひとり|ソロ/.test(text)) conditions.push("一人旅");
  if (/カップル|夫婦|二人/.test(text)) conditions.push("カップル/夫婦");
  if (conditions.length) elements.push(`旅行スタイル: ${conditions.join("、")}`);

  // Transport
  if (/車|クルマ|ドライブ|自動車/.test(text)) elements.push("移動手段: 車");
  if (/電車|新幹線|バス|地下鉄|鉄道/.test(text)) elements.push("移動手段: 公共交通");
  if (/徒歩|歩き|ウォーク/.test(text)) elements.push("移動手段: 徒歩");

  // Budget / constraint
  if (/予算|円|万円|費用|コスト/.test(text)) elements.push("予算制約: 記載あり — 具体的に参照すること");
  if (/時間|〜時間|〜泊|日程|スケジュール/.test(text)) elements.push("日程/時間: 制約あり");

  // Return only if multi-element (single-topic questions don't need decomposition)
  if (elements.length < 2) return "";

  return elements.map((e) => `• ${e}`).join("\n") +
    "\n→ Your response MUST address ALL of the above elements. Omitting any = error.";
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
    writingStyle = {},
    forceConclusion = false,
    continuation = false,
    previousProvisional = "",
  } = req.body as {
    roomId: string;
    runId: string;
    userMessage: string;
    mode: string;
    agentConfig: { side: "A" | "B" | "C"; provider: string; model: string }[];
    apiKeys?: { openai?: string; anthropic?: string; google?: string };
    previousMessages: { role: string; agentId?: string; content: string }[];
    writingStyle?: WritingStyle;
    /** Skip rounds and go directly to final conclusion */
    forceConclusion?: boolean;
    /** Continue from a checkpoint — run additional rounds focused on open questions */
    continuation?: boolean;
    /** Text of the previous provisional conclusion (used when continuation=true) */
    previousProvisional?: string;
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

  // Layer 0: Language lock (prepended to ALL system prompts — highest priority)
  const languageLock = buildLanguageLock(userMessage);

  // Layer 2: Presentation suffixes (applied after debate logic)
  const presentationSuffix    = buildPresentationSuffix(writingStyle);
  const conclusionPresentation = buildConclusionPresentationSuffix(writingStyle);

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
        // Moderator also gets presentation suffix (format/tone) but not debate invariants
        // (moderator's job is to judge, not debate — its own prompts have judgment rules built in)
        systemPrompt: languageLock + systemPrompt + "\n" + presentationSuffix,
        messages:     [{ role: "user", content: contextText }],
        apiKey:       key,
      });
    } catch {
      return null;
    }
  }

  const modePrompts = PROMPTS[modeKey as keyof typeof PROMPTS] ?? PROMPTS["structured-debate"];

  try {
    // ── forceConclusion: skip debate rounds, jump straight to conclusion ──────
    if (forceConclusion) {
      // Populate allRoundMessages from previousMessages for conclusion context
      previousMessages
        .filter((m) => m.role === "assistant" && m.agentId)
        .slice(-18)
        .forEach((m, i) => {
          allRoundMessages.push({
            round:     Math.floor(i / (agentConfig.length || 1)) + 1,
            side:      m.agentId === "chatgpt" ? "A" : m.agentId === "claude" ? "B" : "C",
            agentId:   m.agentId ?? "agent",
            roleLabel: m.agentId === "chatgpt" ? "ChatGPT" : m.agentId === "claude" ? "Claude" : "Gemini",
            content:   m.content,
          });
        });
      // Skip the rounds loop — fall through to conclusion section
    } else {
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

        // Layer 0 (language lock) is prepended to ensure Japanese input → Japanese output.
        // Layer 1 (debate logic) is already IN baseSystemPrompt including DEBATE_INVARIANTS.
        // Layer 2 (presentation) is appended as a suffix — never overrides Layer 1.
        const systemPrompt = languageLock + baseSystemPrompt + presentationSuffix;

        const prevRoundsText = allRoundMessages
          .filter((m) => m.round < round)
          .map((m) => `[Round ${m.round} — ${m.roleLabel}]:\n${m.content}`)
          .join("\n\n");

        const currRoundText = allRoundMessages
          .filter((m) => m.round === round && m.side !== side)
          .map((m) => `[${m.roleLabel}]:\n${m.content}`)
          .join("\n\n");

        // Build query decomposition hint for multi-element questions
        const decomposed = decomposeQuery(userMessage);
        let contextMsg = `User question: ${userMessage}`;
        if (decomposed) contextMsg += `\n\n[INPUT ANALYSIS — elements to address]\n${decomposed}`;

        // When continuing from a checkpoint, inject the previous provisional conclusion so
        // agents know what's already been settled and focus on the [残論点].
        if (continuation && previousProvisional) {
          contextMsg += `\n\n${"═".repeat(40)}\nPREVIOUS CHECKPOINT SUMMARY:\n${previousProvisional}\n${"═".repeat(40)}\nCONTINUATION INSTRUCTIONS:\n— The above is where the debate stood at the last checkpoint.\n— Focus on the [残論点] listed there. Do NOT repeat points already settled.\n— Provide new evidence, conditions, or angles that resolve one of the open questions.\n— If you disagree with something in the checkpoint, name it specifically and explain why.\n— The goal: advance the open questions, not restate settled ones.`;
        }

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

      // ── Round summary ──────────────────────────────────────────────────────
      const summaryPrompts = (modePrompts as { roundSummary?: Record<number, string> }).roundSummary;
      const summaryPrompt  = summaryPrompts?.[round];

      if (summaryPrompt) {
        const roundMessages = allRoundMessages.filter((m) => m.round === round);
        const summaryContext = roundMessages
          .map((m) => `[${m.roleLabel}]:\n${m.content}`)
          .join("\n\n");

        const summaryText = await callModerator(summaryPrompt, summaryContext);

        if (summaryText) {
          const summaryId = `${runId}-summary-r${round}-${Date.now()}`;
          sseWrite(res, {
            type:    "round_summary",
            round,
            id:      summaryId,
            summary: summaryText,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
    } // end else (forceConclusion skips rounds)

    // ── Conclusion / Checkpoint ─────────────────────────────────────────────────
    const conclusionPromptBase = (modePrompts as { conclusion?: string }).conclusion;

    if (conclusionPromptBase) {
      const fullContext = allRoundMessages
        .map((m) => `[Round ${m.round} — ${m.roleLabel}]:\n${m.content}`)
        .join("\n\n");

      // ── PROVISIONAL CHECKPOINT PROMPT (default after rounds) ─────────────────
      // Used whenever forceConclusion is false — the human will then decide to end or continue.
      const PROVISIONAL_PROMPT = `You are the MODERATOR generating a PROVISIONAL CHECKPOINT.
The debate has completed its rounds. NO final decision has been made yet.
The human will decide whether to continue the discussion or accept this as the final answer.

Use EXACTLY these five section headers (in this order):

[有力案] Current leading direction:
[理由] Why it has the edge right now:
[残論点] Open questions that could change the verdict:
[次に詰める点] What to investigate or debate if discussion continues:
[更新点] What changed since the last checkpoint (write "初回" if this is the first checkpoint):

RULES:
— [有力案]: Name a SPECIFIC direction, option, or approach. Be concrete. Not vague like "further discussion needed."
— [理由]: 1–2 sentences. What gives this direction the edge right now.
— [残論点]: List 1–3 specific open questions that remain unresolved and could shift the outcome.
— [次に詰める点]: 1–2 specific things to investigate or debate if the human continues. Be actionable.
— [更新点]: What specifically moved compared to the previous checkpoint. If this is the first checkpoint, write "初回".
— This is a PROGRESS REPORT, not a final verdict. Leave room for the human to decide.
— DO NOT say "it depends" without naming what it depends on.
— Sound like a sharp advisor giving a status update.`;

      // When forceConclusion=true, use the mode's built-in final conclusion prompt.
      // Otherwise, generate a provisional checkpoint.
      const conclusionSystemPrompt = forceConclusion
        ? languageLock + conclusionPromptBase + "\n" + conclusionPresentation
        : languageLock + PROVISIONAL_PROMPT + "\n" + conclusionPresentation;

      let conclusionText: string | null = null;
      for (const conf of agentConfig) {
        const key = apiKeys[conf.provider as keyof typeof apiKeys];
        if (!key) continue;
        try {
          conclusionText = await callAI({
            provider:     conf.provider as Provider,
            model:        conf.model,
            systemPrompt: conclusionSystemPrompt,
            messages:     [{ role: "user", content: fullContext }],
            apiKey:       key,
          });
          if (conclusionText) break;
        } catch {
          continue;
        }
      }

      if (conclusionText) {
        if (forceConclusion) {
          // Final conclusion — human explicitly ended the discussion
          sseWrite(res, {
            type:      "conclusion",
            content:   conclusionText,
            createdAt: new Date().toISOString(),
          });
        } else {
          // Provisional checkpoint — human must choose to end or continue
          sseWrite(res, {
            type:      "checkpoint",
            content:   conclusionText,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        sseWrite(res, { type: "conclusion_error", message: "All agents failed to generate conclusion." });
      }
    }

    sseWrite(res, { type: "done" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    sseWrite(res, { type: "error", message: msg });
  } finally {
    res.end();
  }
});

export default router;

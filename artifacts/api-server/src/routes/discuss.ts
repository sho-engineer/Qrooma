/**
 * POST /api/discuss
 *
 * Runs a real AI discussion between 2 or 3 agents (A → B → C),
 * then generates a conclusion.  Streams progress via SSE.
 *
 * Body:
 *   roomId        string
 *   runId         string
 *   userMessage   string
 *   mode          "structured-debate" | "free-talk"
 *   agentConfig   { side: "A"|"B"|"C"; provider: string; model: string }[]
 *   apiKeys       { openai?: string; anthropic?: string; google?: string }
 *   previousMessages  { role: string; agentId?: string; content: string }[]
 */

import { Router } from "express";
import { callAI, type Provider } from "../lib/ai";

const router = Router();

// ─── Role prompts ──────────────────────────────────────────────────────────────

const ROLE_PROMPTS = {
  "structured-debate": {
    A: `You are participating in a structured multi-AI team discussion.
Your role is PROPOSAL (提案).
Read the user's message and propose ONE concrete, specific approach or solution.
Be decisive and clear. Do NOT hedge with "on the other hand" — commit to your position.
Keep your response to 3–5 sentences.
Respond in the SAME LANGUAGE as the user's message (Japanese if Japanese, English if English).`,

    B: `You are participating in a structured multi-AI team discussion.
Your role is REVIEW (検証).
The previous AI has just proposed an approach. Your job is to examine it critically.
Identify the single most important assumption, risk, or gap. Be constructive but honest.
Keep your response to 3–5 sentences.
Respond in the SAME LANGUAGE as the user's message (Japanese if Japanese, English if English).`,

    C: `You are participating in a structured multi-AI team discussion.
Your role is EXECUTION (実行).
Based on the proposal and review above, define the concrete FIRST STEP — what should actually be done right now.
Bridge the gap between idea and action. Be specific about who does what.
Keep your response to 3–5 sentences.
Respond in the SAME LANGUAGE as the user's message (Japanese if Japanese, English if English).`,

    conclusion: `You are a neutral moderator who has watched three AI agents discuss a topic.
Write a 2–3 sentence conclusion that distills the core insight and recommended action.
Be direct and actionable. Do NOT repeat everything — synthesize the key takeaway.
Respond in the SAME LANGUAGE as the discussion.`,
  },

  "free-talk": {
    A: `You are one of three AI participants in an open, exploratory discussion.
Respond to the user's question from your own perspective.
Be thoughtful and specific. Avoid filler phrases like "Great question!".
Keep your response to 3–5 sentences.
Respond in the SAME LANGUAGE as the user's message.`,

    B: `You are one of three AI participants in an open, exploratory discussion.
Respond to the user's question from your own perspective.
You may build on what has been said, or offer a contrasting angle.
Keep your response to 3–5 sentences.
Respond in the SAME LANGUAGE as the user's message.`,

    C: `You are one of three AI participants in an open, exploratory discussion.
Respond to the user's question from your own perspective.
Try to synthesize or move the conversation forward.
Keep your response to 3–5 sentences.
Respond in the SAME LANGUAGE as the user's message.`,

    conclusion: `You are a neutral moderator of an open AI discussion.
Write a 2–3 sentence summary that captures the key insights from the conversation.
Respond in the SAME LANGUAGE as the discussion.`,
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

// ─── Route ────────────────────────────────────────────────────────────────────

router.post("/discuss", async (req, res) => {
  const {
    roomId,
    runId,
    userMessage,
    mode,
    agentConfig,
    apiKeys,
    previousMessages = [],
  } = req.body as {
    roomId: string;
    runId: string;
    userMessage: string;
    mode: string;
    agentConfig: { side: "A" | "B" | "C"; provider: string; model: string }[];
    apiKeys: { openai?: string; anthropic?: string; google?: string };
    previousMessages: { role: string; agentId?: string; content: string }[];
  };

  // ── SSE headers ─────────────────────────────────────────────────────────────
  res.writeHead(200, {
    "Content-Type":     "text/event-stream",
    "Cache-Control":    "no-cache",
    "Connection":       "keep-alive",
    "X-Accel-Buffering": "no",   // prevent nginx from buffering SSE
  });

  const modeKey = (mode in ROLE_PROMPTS ? mode : "structured-debate") as keyof typeof ROLE_PROMPTS;
  const rolePrompts = ROLE_PROMPTS[modeKey];

  // Build conversation history for context (last 6 exchanges max)
  const history = previousMessages.slice(-12).map((m) => ({
    role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
    content: m.role === "user"
      ? m.content
      : `[${(m.agentId ?? "agent").toUpperCase()}]: ${m.content}`,
  }));

  const agentResponses: { side: string; agentId: string; content: string }[] = [];

  try {
    // ── Call each active agent in order (A → B → C) ─────────────────────────
    for (const { side, provider, model } of agentConfig) {
      const apiKey = apiKeys[provider as keyof typeof apiKeys];
      if (!apiKey) {
        sseWrite(res, { type: "warning", message: `No API key for ${provider} (${side}) — skipping` });
        continue;
      }

      const agentId = agentIdForProvider(provider);
      const systemPrompt = rolePrompts[side] ?? rolePrompts.A;

      // Each agent gets the full history + previous agent responses in this run
      const priorResponses = agentResponses
        .map((r) => `[${r.side} — ${r.agentId.toUpperCase()}]: ${r.content}`)
        .join("\n\n");

      const contextMsg = priorResponses
        ? `${userMessage}\n\n---\nOther agents have responded so far:\n${priorResponses}`
        : userMessage;

      const messages = [
        ...history,
        { role: "user" as const, content: contextMsg },
      ];

      sseWrite(res, { type: "agent_start", side, agentId });

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
        // One agent failing does NOT abort the whole run — skip and continue
        const errMsg = agentErr instanceof Error ? agentErr.message : "Unknown error";
        sseWrite(res, { type: "agent_error", side, agentId, message: errMsg });
        continue;
      }

      const message = {
        id:        `${runId}-${side}-${Date.now()}`,
        roomId,
        role:      "assistant",
        agentId,
        side,
        content,
        createdAt: new Date().toISOString(),
        runId,
      };

      sseWrite(res, { type: "message", message });
      agentResponses.push({ side, agentId, content });

      // Brief pause between agents so the UI can process
      await new Promise((r) => setTimeout(r, 200));
    }

    // ── Generate conclusion using the first available agent ───────────────────
    const firstConf = agentConfig[0];
    const firstKey  = firstConf ? apiKeys[firstConf.provider as keyof typeof apiKeys] : undefined;

    if (firstConf && firstKey && agentResponses.length > 0) {
      const discussionText = agentResponses
        .map((r) => `[${r.side}] ${r.content}`)
        .join("\n\n");

      const conclusionContent = await callAI({
        provider: firstConf.provider as Provider,
        model:    firstConf.model,
        systemPrompt: rolePrompts.conclusion,
        messages: [
          { role: "user", content: `User question: ${userMessage}\n\nDiscussion:\n${discussionText}` },
        ],
        apiKey: firstKey,
      });

      sseWrite(res, {
        type: "conclusion",
        conclusion: {
          id:          `conc-${Date.now()}`,
          roomId,
          runId,
          content:     conclusionContent,
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

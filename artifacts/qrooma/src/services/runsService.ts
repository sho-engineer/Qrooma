/**
 * ─── Runs Service ─────────────────────────────────────────────────────────────
 *
 * TRIGGER.DEV CONNECTION POINT
 * ────────────────────────────
 * When connecting Trigger.dev, replace `simulateRun` with:
 *
 *   import { tasks } from "@trigger.dev/sdk/v3"
 *   import type { discussionTask } from "../../trigger/discussionTask"
 *
 *   const handle = await tasks.trigger<typeof discussionTask>("discussion", { ... })
 *
 * API KEY SECURITY
 * ───────────────
 * ⚠️  API keys MUST NOT be sent from the browser in production.
 * The Trigger.dev task retrieves them server-side from Supabase.
 */

import type { AgentId, ConclusionData, Message, RunStatus, WritingStyle } from "../types";
import { AGENTS, DEBATE_POOL, FREETALK_POOL } from "../data/dummy";

export interface RunPayload {
  roomId:     string;
  userId:     string;
  userMessage?: string;
  mode:       "structured-debate" | "free-talk";
  agentCount: 2 | 3;
  agentIds?:  string[];
}

export interface RealRunParams {
  roomId:           string;
  runId:            string;
  userMessage:      string;
  mode:             "structured-debate" | "free-talk";
  agentConfig:      { side: "A" | "B" | "C"; provider: string; model: string }[];
  apiKeys:          { openai?: string; anthropic?: string; google?: string };
  previousMessages: { role: string; agentId?: string; content: string }[];
  writingStyle?:    WritingStyle;
}

export interface RoundStartEvent {
  round: number;
  label: string;
}

export interface RoundSummaryEvent {
  round:     number;
  label:     string;
  summary:   string;
  id:        string;
  roomId:    string;
  runId:     string;
  createdAt: string;
}

// ── Mock simulation ──────────────────────────────────────────────────────────

export const runsService = {
  async trigger(_payload: RunPayload): Promise<string> {
    return `run-${Date.now()}`;
  },

  simulateRun(
    runId:      string,
    payload:    RunPayload,
    onMessage:  (msg: Message) => void,
    onComplete: (status: RunStatus) => void,
  ): () => void {
    const pool = payload.mode === "free-talk" ? FREETALK_POOL : DEBATE_POOL;
    const agents = payload.agentIds
      ? AGENTS.filter((a) => payload.agentIds!.includes(a.id))
      : AGENTS.slice(0, payload.agentCount);
    const timers: ReturnType<typeof setTimeout>[] = [];

    let delay = 900;
    for (const agent of agents) {
      const t = setTimeout(() => {
        const fn = pool[Math.floor(Math.random() * pool.length)];
        onMessage({
          id:        `m-${Date.now()}-${agent.id}`,
          roomId:    payload.roomId,
          role:      "assistant",
          agentId:   agent.id as AgentId,
          content:   fn(agent.name),
          createdAt: new Date().toISOString(),
          runId,
        });
      }, delay);
      timers.push(t);
      delay += 1200;
    }

    const done = setTimeout(() => onComplete("completed"), delay + 300);
    timers.push(done);

    return () => timers.forEach(clearTimeout);
  },

  /**
   * Run a REAL multi-round discussion via the API server.
   * Streams SSE events: round_start → agent messages → round_summary → conclusion → done.
   */
  realRun(
    params:              RealRunParams,
    onMessage:           (msg: Message) => void,
    onConclusion:        (conclusion: ConclusionData) => void,
    onComplete:          (status: RunStatus) => void,
    onAgentError?:       (side: string, message: string) => void,
    onRoundStart?:       (event: RoundStartEvent) => void,
    onRoundSummary?:     (event: RoundSummaryEvent) => void,
    onConclusionError?:  () => void,
  ): () => void {
    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch("/api/discuss", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(params),
          signal:  controller.signal,
        });

        if (!response.ok || !response.body) {
          const text = await response.text().catch(() => "");
          throw new Error(`API error ${response.status}: ${text}`);
        }

        const reader  = response.body.getReader();
        const decoder = new TextDecoder();
        let   buffer  = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            let data: Record<string, unknown>;
            try { data = JSON.parse(raw); }
            catch { continue; }

            if (data["type"] === "round_start") {
              onRoundStart?.({
                round: Number(data["round"]),
                label: String(data["label"] ?? ""),
              });
            } else if (data["type"] === "message") {
              onMessage(data["message"] as Message);
            } else if (data["type"] === "round_summary") {
              onRoundSummary?.({
                round:     Number(data["round"]),
                label:     String(data["label"] ?? ""),
                summary:   String(data["summary"] ?? ""),
                id:        String(data["id"] ?? `sum-${Date.now()}`),
                roomId:    String(data["roomId"] ?? ""),
                runId:     String(data["runId"] ?? ""),
                createdAt: String(data["createdAt"] ?? new Date().toISOString()),
              });
            } else if (data["type"] === "conclusion") {
              const conc = data["conclusion"] as ConclusionData;
              if (conc?.summary && conc.summary.trim().length > 0) {
                onConclusion(conc);
              } else {
                onConclusionError?.();
              }
            } else if (data["type"] === "conclusion_error") {
              onConclusionError?.();
            } else if (data["type"] === "done") {
              onComplete("completed");
            } else if (data["type"] === "error") {
              console.error("API discussion error:", data["message"]);
              onComplete("error");
            } else if (data["type"] === "agent_error") {
              const side = String(data["side"] ?? "?");
              const msg  = String(data["message"] ?? "Unknown error");
              console.warn(`Agent ${side} error:`, msg);
              onAgentError?.(side, msg);
            } else if (data["type"] === "warning") {
              const msg = String(data["message"] ?? "");
              console.info("API warning:", msg);
              if (msg.includes("No API key")) {
                const sideMatch = msg.match(/\(([ABC])\)/);
                const side = sideMatch?.[1] ?? "?";
                onAgentError?.(side, msg);
              }
            }
          }
        }
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        console.error("realRun fetch error:", err);
        onComplete("error");
      }
    })();

    return () => controller.abort();
  },
};

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

import type { AgentId, ConclusionData, Message, PromptConfig, RunStatus, WritingStyle } from "../types";
import { AGENTS, DEBATE_POOL, FREETALK_POOL } from "../data/dummy";

// ─── Error sanitization ───────────────────────────────────────────────────────

/**
 * Convert raw vendor API errors into short, user-friendly Japanese/English messages.
 * Raw errors are always written to console — never surfaced in the UI as-is.
 */
function sanitizeVendorError(raw: string): string {
  const lower = raw.toLowerCase();

  // Quota / rate limit
  if (
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("429") ||
    lower.includes("resource_exhausted") ||
    lower.includes("too many requests")
  ) {
    return "現在このAIが混み合っています。少し時間をおいて再試行してください。";
  }

  // Auth errors
  if (
    lower.includes("api key") ||
    lower.includes("apikey") ||
    lower.includes("authentication") ||
    lower.includes("unauthorized") ||
    lower.includes("401") ||
    lower.includes("invalid_api_key") ||
    lower.includes("permission_denied")
  ) {
    return "このAIのAPIキーが無効または未設定です。設定を確認してください。";
  }

  // Timeout
  if (
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("deadline") ||
    lower.includes("econnreset") ||
    lower.includes("socket hang up")
  ) {
    return "応答がタイムアウトしました。再試行してください。";
  }

  // No key configured
  if (lower.includes("no api key")) {
    return "このAIのAPIキーが設定されていません。";
  }

  // Generic vendor errors (hide the raw class name)
  if (
    lower.includes("googleGenerativeAI") ||
    lower.includes("openai") ||
    lower.includes("anthropic") ||
    lower.includes("fetch failed") ||
    lower.includes("network error") ||
    lower.includes("5") // 5xx
  ) {
    return "一部のAIで応答できなかったため、残りのAIで続行しました。";
  }

  // Fallback — hide everything
  return "一部のAIで問題が発生しました。残りのAIで続行しています。";
}

export interface RunPayload {
  roomId:     string;
  userId:     string;
  userMessage?: string;
  mode:       "structured-debate" | "free-talk";
  agentCount: 2 | 3;
  agentIds?:  string[];
}

export interface RealRunParams {
  roomId:              string;
  runId:               string;
  userMessage:         string;
  mode:                "structured-debate" | "free-talk";
  agentConfig:         { side: "A" | "B" | "C"; provider: string; model: string }[];
  apiKeys:             { openai?: string; anthropic?: string; google?: string };
  previousMessages:    { role: string; agentId?: string; content: string }[];
  writingStyle?:       WritingStyle;
  /** When true: skip all debate rounds and jump straight to the final conclusion */
  forceConclusion?:    boolean;
  /** When true: run additional rounds focused on the open questions from the previous checkpoint */
  continuation?:       boolean;
  /** Text of the previous provisional conclusion — injected into agent context when continuation=true */
  previousProvisional?: string;
  /** Free-text direction adjustment from the user when continuing the discussion */
  continuationDirection?: string;
  /** Prompt Mode config — when set, agents must compare multiple candidates against explicit axes */
  promptConfig?: PromptConfig;
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
   * Streams SSE events: round_start → agent messages → round_summary → checkpoint|conclusion → done.
   *
   * The server will send `checkpoint` (provisional conclusion) after normal rounds.
   * It sends `conclusion` only when forceConclusion=true (human ended the discussion).
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
    onCheckpoint?:       (conclusion: ConclusionData) => void,
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

        // Track which kind of conclusion event we received so we can send the
        // right status when `done` fires.
        let receivedCheckpoint = false;
        let receivedConclusion = false;

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
            } else if (data["type"] === "checkpoint") {
              // Provisional conclusion — human must decide to end or continue
              const content = String(data["content"] ?? "").trim();
              if (content) {
                receivedCheckpoint = true;
                const conc: ConclusionData = {
                  summary:      content,
                  keyPoints:    [],
                  generatedAt:  String(data["createdAt"] ?? new Date().toISOString()),
                  runId:        params.runId,
                  isProvisional: true,
                  isFinal:       false,
                };
                onCheckpoint?.(conc);
              } else {
                onConclusionError?.();
              }
            } else if (data["type"] === "conclusion") {
              // Final conclusion — human explicitly ended the discussion (forceConclusion=true)
              const content = String(data["content"] ?? "").trim();
              if (content) {
                receivedConclusion = true;
                const conc: ConclusionData = {
                  summary:      content,
                  keyPoints:    [],
                  generatedAt:  String(data["createdAt"] ?? new Date().toISOString()),
                  runId:        params.runId,
                  isProvisional: false,
                  isFinal:       true,
                };
                onConclusion(conc);
              } else {
                onConclusionError?.();
              }
            } else if (data["type"] === "conclusion_error") {
              onConclusionError?.();
            } else if (data["type"] === "done") {
              // Send the appropriate terminal status based on what we received
              if (receivedConclusion) {
                onComplete("completed");
              } else if (receivedCheckpoint) {
                onComplete("checkpoint");
              } else {
                onComplete("completed");
              }
            } else if (data["type"] === "error") {
              console.error("API discussion error:", data["message"]);
              onComplete("error");
            } else if (data["type"] === "agent_error") {
              const side   = String(data["side"] ?? "?");
              const rawMsg = String(data["message"] ?? "Unknown error");
              console.warn(`Agent ${side} error (raw):`, rawMsg);
              onAgentError?.(side, sanitizeVendorError(rawMsg));
            } else if (data["type"] === "warning") {
              const rawMsg = String(data["message"] ?? "");
              console.info("API warning (raw):", rawMsg);
              if (rawMsg.includes("No API key")) {
                const sideMatch = rawMsg.match(/\(([ABC])\)/);
                const side = sideMatch?.[1] ?? "?";
                onAgentError?.(side, sanitizeVendorError(rawMsg));
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

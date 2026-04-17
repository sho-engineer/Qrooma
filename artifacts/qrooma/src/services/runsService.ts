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
 *   // Trigger a new discussion run:
 *   const handle = await tasks.trigger<typeof discussionTask>("discussion", {
 *     roomId,
 *     userId,
 *     userMessage,
 *     agentConfig: [
 *       { side: "A", provider: sideA.provider, model: sideA.model },
 *       { side: "B", provider: sideB.provider, model: sideB.model },
 *       { side: "C", provider: sideC.provider, model: sideC.model },
 *     ],
 *     mode: "structured-debate",
 *     // API keys are retrieved SERVER-SIDE by the task — NOT sent from browser
 *   })
 *
 *   // Poll status or subscribe via Supabase realtime on `runs` table:
 *   supabase
 *     .channel("runs")
 *     .on("postgres_changes", { event: "UPDATE", table: "runs", filter: `id=eq.${handle.id}` },
 *         (payload) => onRunStatusChange(payload.new))
 *     .subscribe()
 *
 * API KEY SECURITY
 * ───────────────
 * ⚠️  API keys MUST NOT be sent from the browser in production.
 * The Trigger.dev task retrieves them server-side from Supabase
 * using the user's JWT:
 *   const { data } = await supabaseAdmin
 *     .from("user_api_keys")
 *     .select("provider, encrypted_key")
 *     .eq("user_id", userId)
 *
 * Supabase table: `runs`
 *   id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
 *   room_id       uuid REFERENCES rooms NOT NULL
 *   user_id       uuid REFERENCES auth.users NOT NULL
 *   trigger_id    text  -- Trigger.dev handle ID for polling
 *   status        text CHECK (status IN ('queued','running','done','failed'))
 *   created_at    timestamptz DEFAULT now()
 *   completed_at  timestamptz
 *
 * UI STATUS MAPPING (DB → UI):
 *   queued | running → "running"
 *   done             → "completed"
 *   failed           → "error"
 */

import type { AgentId, Message, RunStatus } from "../types";
import { AGENTS, DEBATE_POOL, FREETALK_POOL } from "../data/dummy";

export interface RunPayload {
  roomId:     string;
  userId:     string;
  userMessage?: string;
  mode:       "structured-debate" | "free-talk";
  agentCount: 2 | 3;
}

// ── Mock simulation (replace with Trigger.dev in production) ──────────────────

export const runsService = {
  /**
   * Start a new run.
   * TRIGGER.DEV: tasks.trigger("discussion", payload) → returns handle.id
   * MOCK: returns a synthetic run ID immediately
   */
  async trigger(_payload: RunPayload): Promise<string> {
    return `run-${Date.now()}`;
  },

  /**
   * Simulate AI agent responses locally with staggered delays.
   * TRIGGER.DEV: Replace with Supabase realtime subscription on `messages` table.
   *
   * Returns a cancel function (call on component unmount / re-navigate).
   */
  simulateRun(
    runId:      string,
    payload:    RunPayload,
    onMessage:  (msg: Message) => void,
    onComplete: (status: RunStatus) => void,
  ): () => void {
    const pool = payload.mode === "free-talk" ? FREETALK_POOL : DEBATE_POOL;
    const agents = AGENTS.slice(0, payload.agentCount);
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
};

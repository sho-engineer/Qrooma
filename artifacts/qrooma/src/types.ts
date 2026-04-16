export type Provider = "openai" | "anthropic" | "google";

export interface Room {
  id: string;
  name: string;
  createdAt: string;
  /**
   * Derived display value — in production, computed from the latest run
   * for this room (last assistant message content). Not a physical column
   * on the rooms table.
   */
  lastMessage?: string;
  /**
   * Derived display value — timestamp of the latest message in the latest
   * run. Not a physical column on the rooms table.
   */
  lastMessageAt?: string;
  /**
   * UI-layer run status derived from the latest run record.
   * DB values map as: queued | running → "running", done → "completed",
   * failed → "error". Never expose raw DB values in the UI.
   * Faked in dummy data; set by server in production.
   */
  lastRunStatus?: RunStatus;
}

export interface Message {
  id: string;
  roomId: string;
  role: "user" | "assistant";
  agentId?: AgentId;
  content: string;
  createdAt: string;
  /** Groups messages into a single run invocation. */
  runId?: string;
}

export type AgentId = "gpt" | "claude" | "gemini";

export interface AgentInfo {
  id: AgentId;
  name: string;
  provider: Provider;
  color: string;
  initial: string;
}

/**
 * UI-layer run status.
 * Mapping from DB: queued/running → "running", done → "completed", failed → "error".
 * "queued" is never surfaced directly to the UI.
 */
export type RunStatus = "idle" | "running" | "completed" | "error";

export interface ConclusionData {
  summary: string;
  keyPoints: string[];
  generatedAt: string;
}

export interface AgentSideConfig {
  side: "A" | "B" | "C";
  provider: Provider;
  model: string;
}

export type DefaultMode = "structured-debate" | "free-talk";

export interface Settings {
  openaiApiKey: string;
  anthropicApiKey: string;
  googleApiKey: string;
  sideA: AgentSideConfig;
  sideB: AgentSideConfig;
  sideC: AgentSideConfig;
  defaultMode: DefaultMode;
}

export type Provider = "openai" | "anthropic" | "google";

export interface Room {
  id: string;
  name: string;
  createdAt: string;
  lastMessage?: string;
  lastMessageAt?: string;
  /** Latest run status — set by the server in production, faked in dummy data */
  lastRunStatus?: RunStatus;
}

export interface Message {
  id: string;
  roomId: string;
  role: "user" | "assistant";
  agentId?: AgentId;
  content: string;
  createdAt: string;
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

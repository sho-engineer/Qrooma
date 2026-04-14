export type Provider = "openai" | "anthropic" | "google";

export interface Room {
  id: string;
  name: string;
  createdAt: string;
  lastMessage?: string;
  lastMessageAt?: string;
}

export interface Message {
  id: string;
  roomId: string;
  role: "user" | "assistant";
  agentId?: AgentId;
  content: string;
  createdAt: string;
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

export interface ConclusionCard {
  summary: string;
  keyPoints: string[];
  generatedAt: string;
}

export interface AgentSideConfig {
  side: "A" | "B" | "C";
  provider: Provider;
  model: string;
}

export interface Settings {
  openaiApiKey: string;
  anthropicApiKey: string;
  googleApiKey: string;
  sideA: AgentSideConfig;
  sideB: AgentSideConfig;
  sideC: AgentSideConfig;
  defaultMode: "debate" | "collaborate" | "critique";
}

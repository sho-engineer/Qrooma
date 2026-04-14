import type { Room, Message, AgentInfo, Settings } from "../types";

export const AGENTS: AgentInfo[] = [
  { id: "gpt",    name: "ChatGPT",  provider: "openai",    color: "#10a37f", initial: "G" },
  { id: "claude", name: "Claude",   provider: "anthropic", color: "#d97706", initial: "C" },
  { id: "gemini", name: "Gemini",   provider: "google",    color: "#4285f4", initial: "Gm" },
];

export const DUMMY_ROOMS: Room[] = [
  {
    id: "room-1",
    name: "Product Roadmap Q3",
    createdAt: "2026-04-10T09:00:00Z",
    lastMessage: "Claude: I think we should prioritize mobile-first...",
    lastMessageAt: "2026-04-14T08:30:00Z",
  },
  {
    id: "room-2",
    name: "Pricing Strategy",
    createdAt: "2026-04-12T14:00:00Z",
    lastMessage: "ChatGPT: A freemium model works best here.",
    lastMessageAt: "2026-04-13T16:45:00Z",
  },
  {
    id: "room-3",
    name: "Tech Stack Decision",
    createdAt: "2026-04-13T11:00:00Z",
    lastMessage: "Gemini: Consider the long-term maintainability.",
    lastMessageAt: "2026-04-13T12:10:00Z",
  },
];

export const DUMMY_MESSAGES: Message[] = [
  {
    id: "m1",
    roomId: "room-1",
    role: "user",
    content: "What should be our top priorities for Q3?",
    createdAt: "2026-04-14T08:00:00Z",
    runId: "run-1",
  },
  {
    id: "m2",
    roomId: "room-1",
    role: "assistant",
    agentId: "gpt",
    content:
      "Based on the current market trends, I recommend focusing on three areas: (1) Mobile experience improvements, (2) API integrations for enterprise clients, and (3) Performance optimization. The mobile segment is growing 40% YoY in your space.",
    createdAt: "2026-04-14T08:01:00Z",
    runId: "run-1",
  },
  {
    id: "m3",
    roomId: "room-1",
    role: "assistant",
    agentId: "claude",
    content:
      "I agree with the mobile priority, but I'd reorder them. Performance optimization should come first — slow apps lose users before they even see the features. Enterprise API integrations are a revenue multiplier, but only once the core experience is solid.",
    createdAt: "2026-04-14T08:02:00Z",
    runId: "run-1",
  },
  {
    id: "m4",
    roomId: "room-1",
    role: "assistant",
    agentId: "gemini",
    content:
      "Both perspectives have merit. From a user-retention standpoint, I'd suggest a phased approach: ship quick performance wins in Month 1, then mobile in Months 2-3, and begin enterprise integrations in parallel. This balances immediate impact with strategic growth.",
    createdAt: "2026-04-14T08:03:00Z",
    runId: "run-1",
  },
  {
    id: "m5",
    roomId: "room-1",
    role: "user",
    content: "What about hiring? Should we expand the team first?",
    createdAt: "2026-04-14T08:25:00Z",
    runId: "run-2",
  },
  {
    id: "m6",
    roomId: "room-1",
    role: "assistant",
    agentId: "gpt",
    content:
      "Hiring is a 3-6 month lag on productivity. I'd recommend hiring now if you plan to ship in Q4. Two senior engineers focused on mobile could 2x your velocity on that front.",
    createdAt: "2026-04-14T08:26:00Z",
    runId: "run-2",
  },
  {
    id: "m7",
    roomId: "room-1",
    role: "assistant",
    agentId: "claude",
    content:
      "I think we should be cautious. Adding team members has coordination overhead. Consider whether your current team could achieve the same with better tooling or reduced scope first.",
    createdAt: "2026-04-14T08:27:00Z",
    runId: "run-2",
  },
  {
    id: "m8",
    roomId: "room-1",
    role: "assistant",
    agentId: "gemini",
    content:
      "I'd suggest a middle path: hire one versatile engineer now, and evaluate after Q3 milestones. This limits risk while still building capacity.",
    createdAt: "2026-04-14T08:30:00Z",
    runId: "run-2",
  },
];

export const DUMMY_CONCLUSION = {
  summary:
    "The team agrees on a phased Q3 approach: performance first, then mobile, then enterprise integrations. Hiring one senior engineer now is recommended as a measured capacity investment.",
  keyPoints: [
    "Performance optimization in Month 1 reduces churn risk",
    "Mobile-first improvements target the fastest-growing user segment",
    "Enterprise API integrations to begin in parallel from Month 2",
    "Hire one senior engineer now; reassess headcount after Q3 milestones",
  ],
  generatedAt: "2026-04-14T08:31:00Z",
};

export const DEFAULT_SETTINGS: Settings = {
  openaiApiKey: "",
  anthropicApiKey: "",
  googleApiKey: "",
  sideA: { side: "A", provider: "openai",    model: "gpt-4o" },
  sideB: { side: "B", provider: "anthropic", model: "claude-3-5-sonnet-20241022" },
  sideC: { side: "C", provider: "google",    model: "gemini-1.5-pro" },
  defaultMode: "structured-debate",
};

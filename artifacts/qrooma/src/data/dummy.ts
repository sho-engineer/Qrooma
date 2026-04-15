import type { Room, Message, AgentInfo, Settings } from "../types";

export const AGENTS: AgentInfo[] = [
  { id: "gpt",    name: "ChatGPT",  provider: "openai",    color: "#10a37f", initial: "G"  },
  { id: "claude", name: "Claude",   provider: "anthropic", color: "#d97706", initial: "C"  },
  { id: "gemini", name: "Gemini",   provider: "google",    color: "#4285f4", initial: "Gm" },
];

export const DUMMY_ROOMS: Room[] = [
  {
    id: "room-1",
    name: "Product Roadmap Q3",
    createdAt: "2026-04-10T09:00:00Z",
    lastMessage: "Gemini: I'd suggest a middle path — hire one versatile engineer now.",
    lastMessageAt: "2026-04-14T08:30:00Z",
  },
  {
    id: "room-2",
    name: "Pricing Strategy",
    createdAt: "2026-04-12T14:00:00Z",
    lastMessage: "Claude: Freemium works, but only if the free tier is genuinely useful.",
    lastMessageAt: "2026-04-13T16:50:00Z",
  },
  {
    id: "room-3",
    name: "Tech Stack Decision",
    createdAt: "2026-04-13T11:00:00Z",
    lastMessage: "Gemini: Consider long-term maintainability over short-term velocity.",
    lastMessageAt: "2026-04-13T12:15:00Z",
  },
];

export const DUMMY_MESSAGES: Message[] = [
  // ── room-1: Product Roadmap Q3 ── 2 runs ──────────────────────────────────
  {
    id: "m1-1",
    roomId: "room-1",
    role: "user",
    content: "What should be our top priorities for Q3?",
    createdAt: "2026-04-14T08:00:00Z",
    runId: "run-1",
  },
  {
    id: "m1-2",
    roomId: "room-1",
    role: "assistant",
    agentId: "gpt",
    content:
      "Based on current market trends, I recommend three areas: (1) Mobile experience improvements, (2) API integrations for enterprise clients, and (3) Performance optimization. The mobile segment is growing 40% YoY in your space.",
    createdAt: "2026-04-14T08:01:00Z",
    runId: "run-1",
  },
  {
    id: "m1-3",
    roomId: "room-1",
    role: "assistant",
    agentId: "claude",
    content:
      "I'd reorder those. Performance optimization should come first — slow apps lose users before they see any features. Enterprise API integrations are a revenue multiplier, but only once the core experience is solid.",
    createdAt: "2026-04-14T08:02:00Z",
    runId: "run-1",
  },
  {
    id: "m1-4",
    roomId: "room-1",
    role: "assistant",
    agentId: "gemini",
    content:
      "Both views have merit. From a retention standpoint, a phased approach works best: quick performance wins in Month 1, mobile in Months 2–3, then enterprise integrations in parallel. This balances immediate impact with strategic growth.",
    createdAt: "2026-04-14T08:03:00Z",
    runId: "run-1",
  },
  {
    id: "m1-5",
    roomId: "room-1",
    role: "user",
    content: "What about hiring? Should we expand the team first?",
    createdAt: "2026-04-14T08:25:00Z",
    runId: "run-2",
  },
  {
    id: "m1-6",
    roomId: "room-1",
    role: "assistant",
    agentId: "gpt",
    content:
      "Hiring has a 3–6 month lag on productivity. I'd recommend hiring now if you plan to ship in Q4. Two senior engineers focused on mobile could 2× your velocity on that front.",
    createdAt: "2026-04-14T08:26:00Z",
    runId: "run-2",
  },
  {
    id: "m1-7",
    roomId: "room-1",
    role: "assistant",
    agentId: "claude",
    content:
      "Be cautious. Adding team members creates coordination overhead. First ask: could the current team achieve the same with better tooling or reduced scope?",
    createdAt: "2026-04-14T08:27:00Z",
    runId: "run-2",
  },
  {
    id: "m1-8",
    roomId: "room-1",
    role: "assistant",
    agentId: "gemini",
    content:
      "I'd suggest a middle path: hire one versatile engineer now, evaluate after Q3 milestones. This limits risk while still building capacity.",
    createdAt: "2026-04-14T08:30:00Z",
    runId: "run-2",
  },

  // ── room-2: Pricing Strategy ── 1 run ─────────────────────────────────────
  {
    id: "m2-1",
    roomId: "room-2",
    role: "user",
    content: "Should we go freemium or start with a paid-only model?",
    createdAt: "2026-04-13T16:40:00Z",
    runId: "run-1",
  },
  {
    id: "m2-2",
    roomId: "room-2",
    role: "assistant",
    agentId: "gpt",
    content:
      "Freemium accelerates top-of-funnel growth, but only if the free tier delivers genuine value. I'd lean freemium with a clear, limited feature set — not a crippled product. Conversion depends on the free tier being useful enough to create habit.",
    createdAt: "2026-04-13T16:42:00Z",
    runId: "run-1",
  },
  {
    id: "m2-3",
    roomId: "room-2",
    role: "assistant",
    agentId: "claude",
    content:
      "Freemium works, but only if the free tier is genuinely useful. If you ship a watered-down version, you build brand association with a lesser product. Consider starting paid-only with a long free trial instead — it signals quality and filters for serious users.",
    createdAt: "2026-04-13T16:45:00Z",
    runId: "run-1",
  },
  {
    id: "m2-4",
    roomId: "room-2",
    role: "assistant",
    agentId: "gemini",
    content:
      "The right answer depends on your CAC and LTV targets. If CAC is high, you need paid-only to break even early. If you have viral potential, freemium compounds. Run a small paid-only cohort first to validate willingness-to-pay before committing to freemium.",
    createdAt: "2026-04-13T16:50:00Z",
    runId: "run-1",
  },

  // ── room-3: Tech Stack Decision ── 1 run ──────────────────────────────────
  {
    id: "m3-1",
    roomId: "room-3",
    role: "user",
    content: "Should we use Next.js or stick with a standalone React + Vite setup?",
    createdAt: "2026-04-13T11:05:00Z",
    runId: "run-1",
  },
  {
    id: "m3-2",
    roomId: "room-3",
    role: "assistant",
    agentId: "gpt",
    content:
      "Next.js wins on SEO, server components, and the full-stack integration story. If you need SSR or ISR for content pages, it's the clear choice. For pure SPA workloads, Vite is faster to develop with and simpler to deploy.",
    createdAt: "2026-04-13T11:07:00Z",
    runId: "run-1",
  },
  {
    id: "m3-3",
    roomId: "room-3",
    role: "assistant",
    agentId: "claude",
    content:
      "I'd push back on defaulting to Next.js. Its abstraction layers add complexity that slows small teams down. If this is an app-like product — not a content site — Vite + React keeps your deploy simpler and your mental model cleaner.",
    createdAt: "2026-04-13T11:10:00Z",
    runId: "run-1",
  },
  {
    id: "m3-4",
    roomId: "room-3",
    role: "assistant",
    agentId: "gemini",
    content:
      "Consider long-term maintainability over short-term velocity. Next.js has a larger ecosystem and better hiring pool. That said, if your team already knows Vite deeply, the ramp-up cost of switching might not be worth it for a 6-month runway.",
    createdAt: "2026-04-13T12:15:00Z",
    runId: "run-1",
  },
];

export const DUMMY_CONCLUSIONS: Record<string, {
  summary: string;
  keyPoints: string[];
  generatedAt: string;
}> = {
  "room-1": {
    summary:
      "The team agrees on a phased Q3 approach: performance first, then mobile, then enterprise integrations. Hiring one senior engineer now is recommended as a measured capacity investment.",
    keyPoints: [
      "Performance optimization in Month 1 reduces churn risk",
      "Mobile-first improvements target the fastest-growing user segment",
      "Enterprise API integrations to begin in parallel from Month 2",
      "Hire one senior engineer now; reassess headcount after Q3 milestones",
    ],
    generatedAt: "2026-04-14T08:31:00Z",
  },
  "room-2": {
    summary:
      "No single pricing model is universally correct — it depends on CAC, LTV, and willingness-to-pay. The recommendation is to validate paid conversion before committing to freemium.",
    keyPoints: [
      "Freemium requires a genuinely useful free tier, not a crippled product",
      "Paid-only with a long free trial signals quality and filters serious users",
      "Run a small paid-only cohort first to validate willingness-to-pay",
    ],
    generatedAt: "2026-04-13T16:51:00Z",
  },
  "room-3": {
    summary:
      "The choice between Next.js and Vite depends on the product type and team familiarity. For app-like products with no SEO requirement, Vite is simpler. For content-driven products, Next.js wins.",
    keyPoints: [
      "Next.js is preferred when SSR, ISR, or SEO is a requirement",
      "Vite + React is simpler for pure SPA workloads",
      "Long-term maintainability and hiring pool favor Next.js",
      "Switching cost must be weighed against a 6-month runway",
    ],
    generatedAt: "2026-04-13T12:16:00Z",
  },
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

import type { Room, Message, AgentInfo, Settings, ConclusionData } from "../types";

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
    lastMessage: "Gemini: A middle path — hire one versatile engineer now, then reassess.",
    lastMessageAt: "2026-04-14T08:30:00Z",
    lastRunStatus: "completed",
  },
  {
    id: "room-2",
    name: "Pricing Strategy",
    createdAt: "2026-04-12T14:00:00Z",
    lastMessage: "Claude: Freemium works only if the free tier delivers genuine value.",
    lastMessageAt: "2026-04-13T16:50:00Z",
    lastRunStatus: "completed",
  },
  {
    id: "room-3",
    name: "Tech Stack Decision",
    createdAt: "2026-04-13T11:00:00Z",
    lastMessage: "Gemini: Long-term maintainability and ecosystem depth favor Next.js.",
    lastMessageAt: "2026-04-13T12:15:00Z",
    lastRunStatus: "completed",
  },
  {
    id: "room-4",
    name: "Marketing Copy Review",
    createdAt: "2026-04-14T10:00:00Z",
    lastMessage: "Gemini: 'Think together. Decide faster.' — tight and memorable.",
    lastMessageAt: "2026-04-14T10:18:00Z",
    lastRunStatus: "completed",
  },
  {
    id: "room-5",
    name: "Q4 Budget Planning",
    createdAt: "2026-04-15T09:00:00Z",
    lastMessage: "Gemini: A 60/30/10 allocation gives flexibility without sacrificing focus.",
    lastMessageAt: "2026-04-15T09:45:00Z",
    lastRunStatus: "completed",
  },
  {
    id: "room-6",
    name: "Launch Timeline Estimate",
    createdAt: "2026-04-15T14:00:00Z",
    lastMessage: "ChatGPT: 6 to 9 months is realistic for a typical B2B SaaS launch—",
    lastMessageAt: "2026-04-15T14:30:00Z",
    lastRunStatus: "error",          // ← demo: failed run, Re-run to recover
  },
];

export const DUMMY_MESSAGES: Message[] = [

  // ── room-1: Product Roadmap Q3 ── 2 runs (Structured Debate) ──────────────
  {
    id: "m1-1", roomId: "room-1", role: "user",
    content: "What should be our top priorities for Q3?",
    createdAt: "2026-04-14T08:00:00Z", runId: "run-1",
  },
  {
    id: "m1-2", roomId: "room-1", role: "assistant", agentId: "gpt",
    content: "Mobile experience improvements are the highest-leverage bet. The segment is growing 40% YoY and our current mobile retention lags desktop by 18 points. I'd also push API integrations for enterprise — it's a revenue multiplier once the core experience is solid.",
    createdAt: "2026-04-14T08:01:00Z", runId: "run-1",
  },
  {
    id: "m1-3", roomId: "room-1", role: "assistant", agentId: "claude",
    content: "I'd reorder those. Performance optimization comes first — slow apps lose users before they see any features. Churn from performance issues is silent and hard to recover. Enterprise integrations should wait until retention is healthy.",
    createdAt: "2026-04-14T08:02:00Z", runId: "run-1",
  },
  {
    id: "m1-4", roomId: "room-1", role: "assistant", agentId: "gemini",
    content: "Both views have merit. A phased approach balances them: quick performance wins in Month 1, mobile improvements in Months 2–3, then enterprise integrations in parallel. This reduces churn risk while still building revenue capacity.",
    createdAt: "2026-04-14T08:03:00Z", runId: "run-1",
  },
  {
    id: "m1-5", roomId: "room-1", role: "user",
    content: "What about hiring? Should we expand the team before tackling this?",
    createdAt: "2026-04-14T08:25:00Z", runId: "run-2",
  },
  {
    id: "m1-6", roomId: "room-1", role: "assistant", agentId: "gpt",
    content: "Hiring has a 3–6 month productivity lag. If you want Q4 output, you need to hire now. Two senior engineers focused on mobile could 2× velocity on that front alone.",
    createdAt: "2026-04-14T08:26:00Z", runId: "run-2",
  },
  {
    id: "m1-7", roomId: "room-1", role: "assistant", agentId: "claude",
    content: "Hiring first is a trap. Adding headcount creates coordination overhead and slows delivery in the short term. First ask: can the current team achieve the same goal with better tooling or reduced scope?",
    createdAt: "2026-04-14T08:27:00Z", runId: "run-2",
  },
  {
    id: "m1-8", roomId: "room-1", role: "assistant", agentId: "gemini",
    content: "A middle path — hire one versatile engineer now, then reassess after Q3 milestones. This limits downside risk while still building capacity where you need it most.",
    createdAt: "2026-04-14T08:30:00Z", runId: "run-2",
  },

  // ── room-2: Pricing Strategy ── 1 run (Structured Debate) ─────────────────
  {
    id: "m2-1", roomId: "room-2", role: "user",
    content: "Should we go freemium or start with a paid-only model?",
    createdAt: "2026-04-13T16:40:00Z", runId: "run-1",
  },
  {
    id: "m2-2", roomId: "room-2", role: "assistant", agentId: "gpt",
    content: "Freemium wins for top-of-funnel growth, but only if the free tier delivers real value — not a crippled demo. I'd lean freemium with a clear, limited feature set. Conversion depends on habit-forming utility at the free tier.",
    createdAt: "2026-04-13T16:42:00Z", runId: "run-1",
  },
  {
    id: "m2-3", roomId: "room-2", role: "assistant", agentId: "claude",
    content: "Freemium only works if the free tier is genuinely useful. Ship a watered-down version and you build brand association with a lesser product. I'd start paid-only with a long free trial — it signals quality and filters for serious users.",
    createdAt: "2026-04-13T16:45:00Z", runId: "run-1",
  },
  {
    id: "m2-4", roomId: "room-2", role: "assistant", agentId: "gemini",
    content: "The right answer depends on CAC and LTV targets. If CAC is high, paid-only lets you break even early. If viral potential exists, freemium compounds. Run a small paid-only cohort first to validate willingness-to-pay before committing.",
    createdAt: "2026-04-13T16:50:00Z", runId: "run-1",
  },

  // ── room-3: Tech Stack Decision ── 1 run (Structured Debate) ──────────────
  {
    id: "m3-1", roomId: "room-3", role: "user",
    content: "Should we use Next.js or stick with React + Vite for our new product?",
    createdAt: "2026-04-13T11:05:00Z", runId: "run-1",
  },
  {
    id: "m3-2", roomId: "room-3", role: "assistant", agentId: "gpt",
    content: "Next.js wins on SSR, ISR, and the full-stack integration story. If you need content pages with SEO or server components, it's the clear choice. For pure SPA workloads, Vite is faster to develop with and simpler to deploy.",
    createdAt: "2026-04-13T11:07:00Z", runId: "run-1",
  },
  {
    id: "m3-3", roomId: "room-3", role: "assistant", agentId: "claude",
    content: "Next.js adds abstraction layers that slow small teams down. If this is an app-like product without SEO requirements, Vite + React keeps your deploy simple and your mental model clean. Don't add complexity you don't need yet.",
    createdAt: "2026-04-13T11:10:00Z", runId: "run-1",
  },
  {
    id: "m3-4", roomId: "room-3", role: "assistant", agentId: "gemini",
    content: "Long-term maintainability and ecosystem depth favor Next.js — larger community, better hiring pool. But switching cost matters if your team knows Vite deeply. Evaluate the 6-month runway before deciding.",
    createdAt: "2026-04-13T12:15:00Z", runId: "run-1",
  },

  // ── room-4: Marketing Copy Review ── 1 run (Free Talk) ────────────────────
  {
    id: "m4-1", roomId: "room-4", role: "user",
    content: "Help me improve this headline: 'Qrooma — AI team room'. It feels flat.",
    createdAt: "2026-04-14T10:00:00Z", runId: "run-1",
  },
  {
    id: "m4-2", roomId: "room-4", role: "assistant", agentId: "gpt",
    content: "You're right that it's flat — it describes the product but doesn't sell the benefit. A few directions to try:\n\n• 'Your AI team, always available'\n• 'Bring three perspectives to every decision'\n• 'Async AI brainstorming for busy teams'\n\nThe strongest angle is probably the 'team' metaphor — it makes AI feel collaborative rather than transactional.",
    createdAt: "2026-04-14T10:05:00Z", runId: "run-1",
  },
  {
    id: "m4-3", roomId: "room-4", role: "assistant", agentId: "claude",
    content: "Building on the 'team' framing — I'd push the async angle harder, since that's genuinely differentiated:\n\n• 'Ask once. Get three perspectives.'\n• 'Your AI panel, on demand'\n• 'Three minds, one conversation'\n\nThe second one feels strong — 'panel' implies expert diversity without sounding robotic.",
    createdAt: "2026-04-14T10:12:00Z", runId: "run-1",
  },
  {
    id: "m4-4", roomId: "room-4", role: "assistant", agentId: "gemini",
    content: "Both directions are solid. I'd synthesize toward something short enough for a nav bar but memorable:\n\n• 'Think together. Decide faster.'\n• 'Your AI team. Your API keys.'\n• 'Better decisions, three voices at once.'\n\nIf BYOK is the key differentiator, the second variant leans into trust and ownership. If the value is speed, go with the first.",
    createdAt: "2026-04-14T10:18:00Z", runId: "run-1",
  },

  // ── room-5: Q4 Budget Planning ── 3 runs (Structured Debate) ──────────────
  {
    id: "m5-1", roomId: "room-5", role: "user",
    content: "We have a $500K Q4 budget. How should we allocate across product, marketing, and ops?",
    createdAt: "2026-04-15T09:00:00Z", runId: "run-a",
  },
  {
    id: "m5-2", roomId: "room-5", role: "assistant", agentId: "gpt",
    content: "Product should take the majority — roughly 50%. If the core product isn't ready to retain users, marketing spend is wasted. I'd put 30% into marketing for acquisition experiments and 20% into ops for infrastructure and tooling.",
    createdAt: "2026-04-15T09:01:00Z", runId: "run-a",
  },
  {
    id: "m5-3", roomId: "room-5", role: "assistant", agentId: "claude",
    content: "50% product is too high if you're pre-PMF. Marketing experiments will tell you faster whether your positioning works. I'd flip it — 40% marketing, 40% product, 20% ops. You need signal on acquisition before doubling down on retention.",
    createdAt: "2026-04-15T09:02:00Z", runId: "run-a",
  },
  {
    id: "m5-4", roomId: "room-5", role: "assistant", agentId: "gemini",
    content: "Both frameworks make sense at different stages. The right split depends on whether you have PMF signal. If retention is above 40% at 30 days, front-load marketing. If below, front-load product. Use a 60/30/10 starting split and revisit at mid-quarter.",
    createdAt: "2026-04-15T09:03:00Z", runId: "run-a",
  },
  {
    id: "m5-5", roomId: "room-5", role: "user",
    content: "Retention is 38% at 30 days. Does that change the recommendation?",
    createdAt: "2026-04-15T09:20:00Z", runId: "run-b",
  },
  {
    id: "m5-6", roomId: "room-5", role: "assistant", agentId: "gpt",
    content: "38% at Day 30 is borderline — close enough to PMF that you shouldn't neglect acquisition entirely. I'd keep product at 50% but start low-cost acquisition experiments with 20%, reserving 30% for ops and contingency.",
    createdAt: "2026-04-15T09:21:00Z", runId: "run-b",
  },
  {
    id: "m5-7", roomId: "room-5", role: "assistant", agentId: "claude",
    content: "At 38%, you're not there yet. Every dollar into marketing before 40%+ retention is likely wasted. I'd go 65% product, 15% marketing (brand only, no performance spend), 20% ops. Crack retention first.",
    createdAt: "2026-04-15T09:22:00Z", runId: "run-b",
  },
  {
    id: "m5-8", roomId: "room-5", role: "assistant", agentId: "gemini",
    content: "38% is actionable. Run a 6-week sprint focused on the activation-to-habit loop before increasing marketing. A 60/20/20 split with a built-in reallocation trigger at 6 weeks gives discipline without locking in an assumption.",
    createdAt: "2026-04-15T09:23:00Z", runId: "run-b",
  },
  {
    id: "m5-9", roomId: "room-5", role: "user",
    content: "What specific product areas drive retention from 38% to 45%?",
    createdAt: "2026-04-15T09:40:00Z", runId: "run-c",
  },
  {
    id: "m5-10", roomId: "room-5", role: "assistant", agentId: "gpt",
    content: "The activation loop is usually the culprit. Users who complete a 'first win' in session 1 retain at 2–3× the rate. I'd audit the time-to-value metric: how quickly does a new user experience the core benefit?",
    createdAt: "2026-04-15T09:41:00Z", runId: "run-c",
  },
  {
    id: "m5-11", roomId: "room-5", role: "assistant", agentId: "claude",
    content: "Notifications and re-engagement triggers are often underinvested. A well-timed 'your last session found three insights' email can lift Day 30 retention by 8–12 points with minimal product work.",
    createdAt: "2026-04-15T09:43:00Z", runId: "run-c",
  },
  {
    id: "m5-12", roomId: "room-5", role: "assistant", agentId: "gemini",
    content: "Both directions are valid. I'd prioritize by impact-per-sprint:\n\n• Activation flow simplification — highest leverage\n• Re-engagement emails — quick win (8–12 pts)\n• Habit-forming features like saved rooms — medium-term\n\nA 60/30/10 allocation gives the flexibility to pursue all three in sequence.",
    createdAt: "2026-04-15T09:45:00Z", runId: "run-c",
  },

  // ── room-6: Launch Timeline Estimate ── 1 run, FAILED (error demo) ─────────
  // Only ChatGPT responded before the run failed (Claude + Gemini API key error)
  {
    id: "m6-1", roomId: "room-6", role: "user",
    content: "How long will it realistically take to go from MVP to public launch?",
    createdAt: "2026-04-15T14:25:00Z", runId: "run-1",
  },
  {
    id: "m6-2", roomId: "room-6", role: "assistant", agentId: "gpt",
    content: "6 to 9 months is a realistic range for a typical B2B SaaS product — assuming a functional MVP and a small but capable team. The bottleneck is rarely the product itself: it's the feedback loops between user testing, positioning, and iteration. Budget for at least 2–3 fast learning cycles before locking in your go-to-market strategy.",
    createdAt: "2026-04-15T14:27:00Z", runId: "run-1",
  },
  // ← Claude and Gemini did NOT respond — run failed here
];

export const DUMMY_CONCLUSIONS: Record<string, ConclusionData> = {
  "room-1": {
    summary: "The team converges on a phased Q3 approach: performance optimization first, then mobile improvements, followed by enterprise integrations. On hiring, a single senior engineer is the measured starting point — with a headcount review after Q3 milestones.",
    keyPoints: [
      "Performance optimization in Month 1 reduces silent churn risk",
      "Mobile-first improvements target the fastest-growing user segment",
      "Enterprise API integrations begin in parallel from Month 2",
      "Hire one senior engineer now; reassess headcount after Q3 milestones",
    ],
    generatedAt: "2026-04-14T08:31:00Z",
  },
  "room-2": {
    summary: "No pricing model is universally correct at this stage — the recommendation is to validate paid conversion before committing to freemium. A high-quality free trial signals quality and filters for serious users.",
    keyPoints: [
      "Freemium requires a genuinely useful free tier, not a crippled product",
      "Paid-only with a long free trial signals quality and filters serious users",
      "Run a small paid-only cohort to validate willingness-to-pay before scaling",
    ],
    generatedAt: "2026-04-13T16:51:00Z",
  },
  "room-3": {
    summary: "The choice depends on product type and team familiarity. For app-like products without SEO requirements, Vite is simpler. For content-driven products or when long-term hiring pool matters, Next.js is the better bet.",
    keyPoints: [
      "Next.js is preferred when SSR, ISR, or SEO is a hard requirement",
      "Vite + React is simpler and faster for pure SPA workloads",
      "Long-term maintainability and hiring pool favor Next.js",
      "Switching cost must be weighed against a short runway",
    ],
    generatedAt: "2026-04-13T12:16:00Z",
  },
  "room-4": {
    summary: "The team converged on two strong headline candidates: 'Think together. Decide faster.' (emphasizes speed and collaboration) and 'Your AI team. Your API keys.' (emphasizes BYOK trust). Both are nav-bar-length and benefit from A/B testing.",
    keyPoints: [
      "'Think together. Decide faster.' — best if the value prop is speed",
      "'Your AI team. Your API keys.' — best if BYOK trust is the differentiator",
      "Avoid functional descriptions like 'AI team room' — they describe, not sell",
      "The 'three perspectives' angle differentiates from single-model AI tools",
    ],
    generatedAt: "2026-04-14T10:19:00Z",
  },
  "room-5": {
    summary: "With 38% Day-30 retention, the team recommends a product-first allocation before scaling marketing. A 60/30/10 split (product/ops/marketing) with a 6-week reallocation trigger is the most defensible starting point.",
    keyPoints: [
      "38% retention is borderline — do not scale performance marketing yet",
      "Prioritize activation flow simplification for the highest retention leverage",
      "Re-engagement emails are a quick win: 8–12 point lift with minimal work",
      "Use a 60/30/10 budget split with a built-in review trigger at 6 weeks",
    ],
    generatedAt: "2026-04-15T09:46:00Z",
  },
  // room-6 has no conclusion — run failed before all agents responded
};

// Reply pools — mode-specific phrasing for demo runs
export const DEBATE_POOL = [
  (name: string) => `${name} disagrees with the framing here. The underlying assumption is that speed matters more than certainty — but in this context, a wrong fast decision costs more than a slow right one. I'd push back and redefine the success criterion first.`,
  (name: string) => `From ${name}'s perspective: the risk is asymmetric. The downside of moving too fast is higher than the downside of moving too slowly. I'd argue for a staged approach with explicit review gates at each step.`,
  (name: string) => `${name} here. The strongest counter-argument is opportunity cost. Every week spent debating is a week the competition is executing. Set a 72-hour decision window and commit to whichever option has the best evidence by then.`,
  (name: string) => `${name} taking a different angle: the data is ambiguous enough that either option can be justified post-hoc. That's a signal the framing is wrong — restate the question as a testable hypothesis before committing resources.`,
];

export const FREETALK_POOL = [
  (name: string) => `${name} building on that — one thing worth adding is the second-order effect. The immediate impact is clear, but three months out, the compounding benefit shows up in user trust and team morale, which are harder to measure but easier to lose.`,
  (name: string) => `${name} here. I'd add a practical constraint to consider: the team's current bandwidth. Even a well-reasoned direction stalls if there's no capacity to execute. Worth stress-testing the plan against current sprint commitments.`,
  (name: string) => `${name} agreeing with the direction and adding nuance: the key variable is timing. Doing the right thing at the wrong moment — too early or too late in the cycle — produces the same outcome as doing the wrong thing. Sequence matters as much as strategy.`,
  (name: string) => `${name} wants to zoom out for a moment. The tactics being discussed are sound, but the strategic question underneath is: what does success look like in 12 months, and which path makes it most reachable? Anchoring to that north star simplifies the near-term trade-offs.`,
];

export const DEFAULT_SETTINGS: Settings = {
  openaiApiKey: "",
  anthropicApiKey: "",
  googleApiKey: "",
  sideA: { side: "A", provider: "openai",    model: "gpt-4o" },
  sideB: { side: "B", provider: "anthropic", model: "claude-3-5-sonnet-20241022" },
  sideC: { side: "C", provider: "google",    model: "gemini-1.5-pro" },
  defaultMode: "structured-debate",
  agentCount: 3,
};

---
name: DEFAULT_ROLES location and provider
description: Where the Free plan agent config lives, and which provider is currently wired up
---

Free plan agent config (`DEFAULT_ROLES`) lives in `artifacts/qrooma/src/pages/RoomDetailPage.tsx` (not `dummy.ts`).

Current setting: `provider: "openai", model: "gpt-4o-mini"` × 3 agents.

**Why:** ANTHROPIC_API_KEY is not in Replit secrets; OPENAI_API_KEY is. Using Anthropic caused all Free plan agent calls to be silently skipped (no key → `continue` in the agent loop).

**How to apply:** If switching to Claude later, set ANTHROPIC_API_KEY in Replit secrets AND update DEFAULT_ROLES. The discuss.ts server fallback already supports all three providers: `process.env["OPENAI_API_KEY"]`, `process.env["ANTHROPIC_API_KEY"]`, `process.env["GOOGLE_API_KEY"]`.

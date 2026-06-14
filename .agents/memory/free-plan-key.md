---
name: Free plan API key server fallback
description: Free plan sends empty apiKeys {} from client; without server-side fallback, all agents silently skip.
---

The client sends `apiKeys: isFree ? {} : { openai, anthropic }` in RoomDetailPage.tsx.

In discuss.ts, the apiKeys object is built as:
```ts
const apiKeys = {
  openai:    clientApiKeys.openai    || process.env["OPENAI_API_KEY"]    || undefined,
  anthropic: clientApiKeys.anthropic || process.env["ANTHROPIC_API_KEY"] || undefined,
  google:    clientApiKeys.google    || process.env["GOOGLE_API_KEY"]    || undefined,
};
```

**Why:** Without server-side env var fallbacks, `apiKeys.<provider> = undefined` and the `if (!apiKey) continue` check in the agent loop skips every agent. Free plan produces zero messages (infinite "実行中").

**How to apply:** Always keep all three provider fallbacks. The same fallback pattern applies to the check-ambiguity route (OPENAI_API_KEY only, since it always uses gpt-4o-mini).

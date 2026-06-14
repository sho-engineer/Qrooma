---
name: Free plan API key fallback
description: Free plan sends empty apiKeys {} from client; without server-side fallback, all agents silently skip.
---

The client sends `apiKeys: isFree ? {} : { openai, anthropic }` in RoomDetailPage.tsx.

In discuss.ts, the apiKeys object is built as:
```ts
const apiKeys = {
  openai:    clientApiKeys.openai    || undefined,
  anthropic: clientApiKeys.anthropic || process.env["ANTHROPIC_API_KEY"] || undefined,
  google:    clientApiKeys.google    || undefined,
};
```

**Why:** Without the `process.env["ANTHROPIC_API_KEY"]` fallback, `apiKeys.anthropic = undefined`, and the `if (!apiKey) continue` check in the agent loop skips every agent. The free plan would produce zero messages.

**How to apply:** Always keep this fallback. If adding a new provider for the free plan, add a matching `|| process.env["<PROVIDER>_API_KEY"]` fallback.

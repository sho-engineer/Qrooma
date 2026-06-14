---
name: Run lifecycle states and runsService.realRun signature
description: RunStatus values and the order/meaning of all callbacks in runsService.realRun.
---

## RunStatus lifecycle

```
idle → running → generating_conclusion → completed
                                       → memo_failed  (conclusion_error SSE)
     → running → checkpoint → continued → generating_conclusion → completed
     → error  (catastrophic fetch/agent failure)
```

- `generating_conclusion`: emitted when server fires `generating_conclusion` SSE (between rounds end and memo LLM call)
- `memo_failed`: fired when `conclusion_error` SSE comes (memo generation failed, rounds completed)
- `error`: catastrophic failure (no conclusion OR checkpoint OR conclusion_error received before `done`)

## runsService.realRun callback order (positional)

```
1  params
2  onMessage
3  onConclusion        — conclusion SSE (auto after rounds, or forceConclusion=true)
4  onComplete          — called with final RunStatus from done event
5  onAgentError?
6  onRoundStart?
7  onRoundSummary?
8  onConclusionError?  — conclusion_error SSE; also sets receivedConclusionError → memo_failed
9  onCheckpoint?       — checkpoint SSE (provisional flow)
10 onGeneratingConclusion? — generating_conclusion SSE
```

**Why:** Positional API chosen for backward compat; new callbacks added at the end as optional.

**How to apply:** When adding new SSE event types, add a new optional callback at position N+1 and handle it in the SSE while loop.

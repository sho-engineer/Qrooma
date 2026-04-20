# Qrooma

Async AI team room — bring your own API keys (BYOK).
A group-chat UI where ChatGPT, Claude, and Gemini discuss topics asynchronously.
**BYOK mode is now live**: when the user enters API keys in Settings, real OpenAI / Anthropic / Google calls are made via the Express API server using SSE streaming. Free mode still uses local simulation (dummy data). Supabase Auth/DB and Trigger.dev are future integration points.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v4 (CSS variables) |
| Routing | Wouter |
| Data fetching | TanStack Query (wired, not yet used for real fetches) |
| AI calls | Express API server (`/api/discuss`) → OpenAI / Anthropic / Google SDKs via SSE |
| Auth (temp) | localStorage |
| Settings (temp) | localStorage |

---

## Artifact

- **Kind**: web  
- **Dir**: `artifacts/qrooma/`  
- **Preview path**: `/`

---

## Screens

| Route | Screen | Notes |
|---|---|---|
| `/` | Auth | Log in / Sign up. Any email+password works (no validation). |
| `/rooms` | Room List | Cards with last-message preview and relative time. |
| `/rooms/:id` | Room Detail | Chat timeline, run separators, Conclusion card, Re-run. |
| `/settings` | Settings | API keys, Default Mode, Agent configuration (auto-save). |

---

## Component Structure

```
src/
├── App.tsx                        # Router + AuthProvider + SettingsProvider
├── types.ts                       # All shared TypeScript types
├── data/
│   └── dummy.ts                   # AGENTS, DUMMY_ROOMS, DUMMY_MESSAGES,
│                                  # DUMMY_CONCLUSIONS, DEFAULT_SETTINGS
├── context/
│   ├── AuthContext.tsx            # User auth state — swap signIn/signUp for Supabase Auth
│   └── SettingsContext.tsx        # Settings state — auto-saves to localStorage
├── pages/
│   ├── AuthPage.tsx               # Login / Signup form
│   ├── RoomsPage.tsx              # Room list grid
│   ├── RoomDetailPage.tsx         # Orchestrates all room-detail sub-components
│   ├── SettingsPage.tsx           # API key fields, mode picker, agent config
│   └── NotFoundPage.tsx           # 404 fallback
└── components/
    ├── Sidebar.tsx                # Left nav — rooms list, rename, new room, sign out
    ├── AgentAvatar.tsx            # Colored circle avatar for each agent
    ├── RoomHeader.tsx             # Status badge + mode + models + Re-run button
    ├── MessageBubble.tsx          # User bubble (right) or agent bubble (left)
    ├── ConclusionCard.tsx         # Collapsible conclusion accordion
    ├── MessageInput.tsx           # Textarea + send button + hint text
    ├── EmptyState.tsx             # Empty room prompt
    └── ErrorState.tsx             # Run-failed error banner with retry
```

---

## Key UI States

| State | Where | Behaviour |
|---|---|---|
| Loading (app boot) | `App.tsx` | Spinner while auth state resolves from localStorage |
| Empty room | `EmptyState.tsx` | Icon + prompt, shown when room has no messages |
| Running | `RoomHeader` + `ThinkingIndicator` | Yellow badge + bouncing dots while agents respond |
| Completed | `RoomHeader` | Green badge, Re-run button shown |
| Error | `RoomHeader` + `ErrorState` | Red badge + error banner with Retry |
| Conclusion collapsed | `ConclusionCard` | Default closed; shows run count |
| Conclusion expanded | `ConclusionCard` | Summary + key points + timestamp |

---

## Run Flow (real AI)

1. User types a message → presses Enter or Send  
2. `RoomDetailPage.sendMessage()` calls `POST /api/check-ambiguity` first  
   - If ambiguity detected → shows `ClarificationCard` with up to 3 questions  
   - User can answer or skip; either way the debate begins  
3. Creates a user `Message` with a new `runId`  
4. Calls `POST /api/discuss` via SSE; receives streamed agent messages + checkpoint/conclusion events  
5. After all rounds, a provisional checkpoint appears; user chooses to end or continue  
6. Re-run button repeats the real AI run with the same message

## Pre-debate Clarification Flow

- `POST /api/check-ambiguity` — fast AI call (gpt-4o-mini or Gemini) returns `{ needsClarification, questions[], assumptions[] }`
- `ClarificationCard` component shows questions + optional answer textarea + "Answer first" / "Start anyway" buttons
- If user answers: original message is concatenated with `\n\n補足: <answer>` before sending to debate
- If user skips: debate starts with stated assumptions in context
- Ambiguity check failure is silent (falls through to normal run)

---

## Dummy Data (data/dummy.ts)

| Room | Messages | Runs | Conclusion |
|---|---|---|---|
| room-1: Product Roadmap Q3 | 8 | 2 | Yes |
| room-2: Pricing Strategy | 4 | 1 | Yes |
| room-3: Tech Stack Decision | 4 | 1 | Yes |

All messages are realistic English business discussions.

---

## Temporary / Placeholder Implementations

| Item | Current | Production replacement |
|---|---|---|
| **Auth** | localStorage, no password validation | Supabase Auth → swap `AuthContext.signIn/signUp` |
| **Room data** | Hardcoded in `dummy.ts` | Supabase DB → TanStack Query |
| **Message data** | Hardcoded in `dummy.ts` | Supabase DB + Realtime stream |
| **Agent replies** | `setTimeout` + random strings | Trigger.dev job → parallel LLM calls |
| **Conclusion** | Fixed text in `dummy.ts` | Generated by agents post-run |
| **API key storage** | localStorage (amber warning shown in UI) | Encrypted server-side storage per account |
| **Re-run** | Regenerates random replies | Re-triggers Trigger.dev job with last user message |
| **Settings persistence** | localStorage | Supabase DB (per-account) |

---

## Production Connection Points

```
AuthContext.tsx
  signIn(email, password)   →  supabase.auth.signInWithPassword()
  signUp(email, password)   →  supabase.auth.signUp()

RoomDetailPage.tsx
  DUMMY_MESSAGES            →  useQuery(["messages", roomId], fetchMessages)
  triggerAgentReplies()     →  triggerClient.sendEvent({ name: "run.start", payload: { roomId, runId } })
                               + supabase.channel(roomId).on("INSERT", appendMessage)

SettingsContext.tsx
  localStorage              →  supabase.from("settings").upsert({ userId, ...settings })

data/dummy.ts (DUMMY_ROOMS) →  useQuery(["rooms"], fetchRooms)
```

---

## UI Conventions

- **Mode names**: always `Structured Debate` or `Free Talk` (no abbreviations)
- **API key copy**: "Currently stored in your browser (temporary). Final spec: encrypted server-side storage per account — keys never exposed to the client."
- **Auto-save**: Settings save on every change — no Save button
- **Scroll**: initial view starts at top; auto-scrolls to bottom only on new messages
- **Run separator**: labeled `RUN 2`, `RUN 3`, etc. between run groups
- **Agent initials**: G (ChatGPT), C (Claude), Gm (Gemini)
- **Agent colors**: ChatGPT `#10a37f`, Claude `#d97706`, Gemini `#4285f4`

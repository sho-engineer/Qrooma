# Qrooma

Async AI team room — BYOK (Bring Your Own Key). Built with React + Vite + TypeScript.

## Overview

Qrooma is a group-chat-style interface where ChatGPT, Claude, and Gemini discuss topics asynchronously. This is the MVP UI scaffold with dummy data and local auth simulation.

## Screens

| Route | Description |
|---|---|
| `/` | Auth — Log in / Sign up |
| `/rooms` | Room list |
| `/rooms/:id` | Room detail — chat timeline, run status, conclusion |
| `/settings` | API keys and agent configuration |

## Getting Started

```bash
# Install dependencies (from repo root)
pnpm install

# Start the dev server
pnpm --filter @workspace/qrooma run dev
```

The app will be available at the URL shown in the terminal.

## Architecture Notes

- **Authentication**: `src/context/AuthContext.tsx` — simulates auth with localStorage. Replace with Supabase Auth by swapping `signIn` / `signUp` to call `supabase.auth.*`.
- **Settings**: `src/context/SettingsContext.tsx` — stores API keys in localStorage. Ready for encryption or server-side storage.
- **Dummy data**: `src/data/dummy.ts` — replace with real API calls when backend is connected.
- **Types**: `src/types.ts` — shared TypeScript types for rooms, messages, settings, agents.

## Connecting Supabase (later)

1. Install `@supabase/supabase-js`
2. Replace `AuthContext.tsx` `signIn`/`signUp`/`signOut` with Supabase Auth calls
3. Replace `DUMMY_ROOMS` / `DUMMY_MESSAGES` with Supabase queries
4. Add `DATABASE_URL` to `.env`

## Connecting Trigger.dev (later)

1. Add Trigger.dev job definitions for agent run orchestration
2. Replace the simulated agent replies in `RoomDetailPage.tsx` with job triggers
3. Use webhooks or Supabase realtime to stream responses back to the UI

## Tech Stack

- React 19 + Vite 7
- TypeScript
- Tailwind CSS v4
- Wouter (routing)
- TanStack Query
- Lucide React (icons)

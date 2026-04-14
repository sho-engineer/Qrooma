# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Qrooma (`artifacts/qrooma`) — React + Vite — previewPath: `/`
MVP UI for the async AI team room app (BYOK).

**Screens:**
- `/` → Auth (login / signup)
- `/rooms` → Room list
- `/rooms/:id` → Room detail (chat timeline, run status, conclusion card)
- `/settings` → API keys + agent model config

**Key files:**
- `src/types.ts` — shared types
- `src/data/dummy.ts` — all dummy data, AGENTS config
- `src/context/AuthContext.tsx` — localStorage auth (swap for Supabase later)
- `src/context/SettingsContext.tsx` — settings persistence
- `src/pages/` — AuthPage, RoomsPage, RoomDetailPage, SettingsPage
- `src/components/Sidebar.tsx` — left nav with rename + room creation
- `src/components/AgentAvatar.tsx` — colored avatar per AI agent

**Backend integration notes:**
- Auth: replace `AuthContext` signIn/signUp with Supabase Auth
- Rooms/messages: replace dummy data with Supabase or API calls
- Agent runs: wire `RoomDetailPage` run button to Trigger.dev jobs

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/qrooma run dev` — run Qrooma frontend locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

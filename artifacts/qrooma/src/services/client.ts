/**
 * ─── Supabase Client ──────────────────────────────────────────────────────────
 *
 * SUPABASE CONNECTION POINT
 * ─────────────────────────
 * 1. Install: pnpm add @supabase/supabase-js
 * 2. Set env vars (Replit Secrets or .env):
 *      VITE_SUPABASE_URL=https://<project>.supabase.co
 *      VITE_SUPABASE_ANON_KEY=<your-anon-key>
 * 3. Replace this file with:
 *
 *   import { createClient } from "@supabase/supabase-js"
 *   export const supabase = createClient(
 *     import.meta.env.VITE_SUPABASE_URL,
 *     import.meta.env.VITE_SUPABASE_ANON_KEY
 *   )
 *
 * Current mode: MOCK (localStorage-backed, no network calls)
 */

export const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL     ?? "";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

/** True when Supabase env vars are set — used to switch between mock and real */
export const IS_CONNECTED = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

if (IS_CONNECTED) {
  console.info("[Qrooma] Supabase connected:", SUPABASE_URL);
} else {
  console.info("[Qrooma] Running in MOCK mode (no Supabase env vars)");
}

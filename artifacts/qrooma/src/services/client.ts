/**
 * ─── Supabase Client ──────────────────────────────────────────────────────────
 *
 * Env vars required (Replit Secrets):
 *   VITE_SUPABASE_URL      = https://<project>.supabase.co
 *   VITE_SUPABASE_ANON_KEY = <your-anon-key>
 *
 * If env vars are absent the client is null and auth will show a
 * "not configured" error — no mock fallback in production.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL  as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const IS_CONNECTED = !!(url && key);

export const supabase: SupabaseClient | null = IS_CONNECTED
  ? createClient(url!, key!)
  : null;

if (IS_CONNECTED) {
  console.info("[Adjudo] Supabase connected:", url);
} else {
  console.warn("[Adjudo] Supabase env vars missing — auth unavailable.");
}

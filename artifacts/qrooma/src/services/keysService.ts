/**
 * ─── API Keys Service ─────────────────────────────────────────────────────────
 *
 * SUPABASE CONNECTION POINT
 * ─────────────────────────
 * ⚠️  In production, NEVER store raw API keys in localStorage.
 *     Store them encrypted server-side in Supabase:
 *
 *   // Save (via Edge Function or server action — never expose to browser):
 *   await supabase.from("user_api_keys").upsert({
 *     user_id:       userId,
 *     provider:      "openai",
 *     encrypted_key: encrypt(rawKey, SERVER_ENCRYPTION_SECRET),
 *   })
 *
 *   // Check if a key exists (safe for browser):
 *   const { data } = await supabase.rpc("has_api_key", { p_provider: "openai" })
 *
 *   // Read key (server-side ONLY — Trigger.dev task or Edge Function):
 *   const { data } = await supabaseAdmin
 *     .from("user_api_keys")
 *     .select("encrypted_key")
 *     .eq("user_id", userId)
 *     .eq("provider", provider)
 *     .single()
 *   const rawKey = decrypt(data.encrypted_key, SERVER_ENCRYPTION_SECRET)
 *
 * Supabase table: `user_api_keys`
 *   id             uuid PRIMARY KEY DEFAULT gen_random_uuid()
 *   user_id        uuid REFERENCES auth.users NOT NULL
 *   provider       text CHECK (provider IN ('openai', 'anthropic', 'google'))
 *   encrypted_key  text NOT NULL
 *   created_at     timestamptz DEFAULT now()
 *   updated_at     timestamptz DEFAULT now()
 *   UNIQUE (user_id, provider)
 *
 * BROWSER SHOULD ONLY STORE: a boolean "key is set" flag per provider.
 * The actual key is only ever transmitted to/from Edge Functions or Trigger.dev tasks.
 *
 * Current mode: localStorage (DEMO ONLY — acceptable for local development)
 */

export type ApiProvider = "openai" | "anthropic" | "google";

export interface ApiKeys {
  openai:    string;
  anthropic: string;
  google:    string;
}

const STORAGE_KEY = "qrooma_api_keys_v2";

function load(): ApiKeys {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as ApiKeys;
  } catch { /* ignore */ }
  return { openai: "", anthropic: "", google: "" };
}

export const keysService = {
  /** SUPABASE: .rpc("has_api_key", { p_provider }) per provider */
  get(): ApiKeys {
    return load();
  },

  /** SUPABASE: upsert into user_api_keys via Edge Function */
  set(patch: Partial<ApiKeys>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...load(), ...patch }));
  },

  /** True if a key is stored for this provider */
  hasKey(provider: ApiProvider): boolean {
    return !!load()[provider];
  },

  /** Remove all stored keys (e.g. on sign-out) */
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};

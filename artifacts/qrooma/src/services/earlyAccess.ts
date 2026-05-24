/**
 * Early Access state management (localStorage)
 *
 * Keys stored:
 *   adjudo_ea_granted    "true" | absent
 *   adjudo_ea_code       coupon code string
 *   adjudo_ea_type       accessType (early_access | tester | special)
 *   adjudo_ea_granted_at ISO timestamp
 *   adjudo_ea_expires_at ISO timestamp
 */

const K = {
  granted:   "adjudo_ea_granted",
  code:      "adjudo_ea_code",
  type:      "adjudo_ea_type",
  grantedAt: "adjudo_ea_granted_at",
  expiresAt: "adjudo_ea_expires_at",
} as const;

export interface EarlyAccessInfo {
  code:       string;
  accessType: string;
  grantedAt:  string;
  expiresAt:  string;
}

/** Returns the stored early access info, or null if not set. */
export function getEarlyAccess(): EarlyAccessInfo | null {
  if (localStorage.getItem(K.granted) !== "true") return null;
  const code       = localStorage.getItem(K.code)      ?? "";
  const accessType = localStorage.getItem(K.type)      ?? "early_access";
  const grantedAt  = localStorage.getItem(K.grantedAt) ?? "";
  const expiresAt  = localStorage.getItem(K.expiresAt) ?? "";
  if (!code || !expiresAt) return null;
  return { code, accessType, grantedAt, expiresAt };
}

/** True when early access has been granted AND has not expired. */
export function isEarlyAccessValid(): boolean {
  const info = getEarlyAccess();
  if (!info) return false;
  return new Date(info.expiresAt) > new Date();
}

/** Persist early access after a successful coupon validation. */
export function setEarlyAccess(code: string, accessType: string, days: number): void {
  const now     = new Date();
  const expires = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  localStorage.setItem(K.granted,   "true");
  localStorage.setItem(K.code,      code);
  localStorage.setItem(K.type,      accessType);
  localStorage.setItem(K.grantedAt, now.toISOString());
  localStorage.setItem(K.expiresAt, expires.toISOString());
}

/** Clear all early access state (e.g. on sign-out). */
export function clearEarlyAccess(): void {
  Object.values(K).forEach((k) => localStorage.removeItem(k));
}

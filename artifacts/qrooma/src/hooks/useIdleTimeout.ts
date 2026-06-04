import { useCallback, useEffect, useRef, useState } from "react";

// ── Single config ─────────────────────────────────────────────────────────────
// Change this value to adjust the inactivity timeout for all authenticated sessions.
export const SESSION_TIMEOUT_MINUTES = 30;

// ── Derived constants ─────────────────────────────────────────────────────────
const TIMEOUT_MS     = SESSION_TIMEOUT_MINUTES * 60 * 1000;
const WARN_BEFORE_MS = 60_000; // show warning banner 60 s before logout

const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"] as const;

/**
 * Idle-timeout hook for authenticated sessions.
 *
 * - Resets the countdown on any mouse/key/scroll/touch activity.
 * - Calls `onTimeout` when the user has been inactive for SESSION_TIMEOUT_MINUTES.
 * - Returns `warningSecondsLeft` (number) in the last 60 seconds; null otherwise.
 *
 * Mount this hook only while a user is logged in (e.g. inside AuthGuard).
 * It does nothing while `enabled` is false.
 */
export function useIdleTimeout(
  onTimeout: () => void,
  enabled: boolean = true,
): { warningSecondsLeft: number | null } {
  const deadlineRef    = useRef<number>(Date.now() + TIMEOUT_MS);
  const onTimeoutRef   = useRef(onTimeout);
  const [warningSecondsLeft, setWarningSecondsLeft] = useState<number | null>(null);

  // Keep callback ref fresh without restarting effects
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const resetTimer = useCallback(() => {
    deadlineRef.current = Date.now() + TIMEOUT_MS;
    setWarningSecondsLeft(null);
  }, []);

  // Attach activity listeners
  useEffect(() => {
    if (!enabled) return;
    for (const ev of ACTIVITY_EVENTS) {
      window.addEventListener(ev, resetTimer, { passive: true });
    }
    return () => {
      for (const ev of ACTIVITY_EVENTS) {
        window.removeEventListener(ev, resetTimer);
      }
    };
  }, [enabled, resetTimer]);

  // Ticker: check remaining time every second
  useEffect(() => {
    if (!enabled) return;
    deadlineRef.current = Date.now() + TIMEOUT_MS; // reset on mount / re-enable

    const id = window.setInterval(() => {
      const remaining = deadlineRef.current - Date.now();

      if (remaining <= 0) {
        window.clearInterval(id);
        setWarningSecondsLeft(null);
        onTimeoutRef.current();
        return;
      }

      if (remaining <= WARN_BEFORE_MS) {
        setWarningSecondsLeft(Math.ceil(remaining / 1000));
      } else {
        setWarningSecondsLeft(null);
      }
    }, 1_000);

    return () => window.clearInterval(id);
  }, [enabled]);

  return { warningSecondsLeft };
}

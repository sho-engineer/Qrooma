/**
 * Returns true when the device is primarily touch-based (phone / tablet).
 *
 * Four independent signals are combined so the check is reliable across:
 *  • Real phones/tablets  (maxTouchPoints > 0  OR  mobile user-agent)
 *  • Replit / browser DevTools preview  (coarse pointer media query)
 *  • Playwright mobile emulation / narrow viewport  (window.innerWidth ≤ 768)
 *
 * Call this inside event handlers or component body. It is intentionally NOT
 * a React hook so it can be used in plain onKeyDown/onSubmit callbacks.
 *
 * The viewport-width fallback (≤ 768) is intentional: even in headless
 * Playwright emulation, the correct Enter behaviour on a ≤ 768 px screen
 * should be "newline", not "send", regardless of pointer type.
 */
export function isMobile(): boolean {
  if (typeof navigator === "undefined" || typeof window === "undefined") return false;
  const hasTouchPoints = navigator.maxTouchPoints > 0;
  const mobileUA       = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const coarsePointer  = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const narrowViewport = window.innerWidth <= 768;
  return hasTouchPoints || mobileUA || coarsePointer || narrowViewport;
}

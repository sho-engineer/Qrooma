import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { ArrowLeftIcon } from "lucide-react";
import { setEarlyAccess, getEarlyAccess } from "../services/earlyAccess";
import { useLocale } from "../context/LocaleContext";
import { useAuth } from "../context/AuthContext";

export default function EarlyAccessPage() {
  const [code,       setCode]       = useState("");
  const [status,     setStatus]     = useState<"idle" | "loading" | "success" | "error" | "invalid">("idle");
  const [, navigate] = useLocation();
  const { locale }   = useLocale();
  const isJa         = locale === "ja";
  const { user }     = useAuth();

  // If already valid, redirect
  useEffect(() => {
    const ea = getEarlyAccess();
    if (ea && new Date(ea.expiresAt) > new Date()) {
      navigate(user ? "/rooms" : "/login");
    }
  }, [navigate, user]);

  const isExpired = typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("expired") === "true";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setStatus("loading");

    const upperCode = code.trim().toUpperCase();

    try {
      // Step 1: Validate
      const valRes = await fetch("/api/coupons/validate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code: upperCode }),
      });
      const valData = await valRes.json() as { valid: boolean; accessDays?: number; couponType?: string };

      if (!valData.valid) { setStatus("invalid"); return; }

      const accessDays = valData.accessDays ?? 14;
      const couponType = valData.couponType ?? "early_access";

      if (user) {
        // Already logged in → redeem immediately
        const redeemRes = await fetch("/api/coupons/redeem", {
          method:  "POST",
          headers: { "Content-Type": "application/json", "x-user-id": user.id },
          body:    JSON.stringify({ code: upperCode }),
        });
        const rd = redeemRes.ok
          ? await redeemRes.json() as { accessDays?: number }
          : { accessDays: accessDays };
        setEarlyAccess(upperCode, couponType, rd.accessDays ?? accessDays);
        setStatus("success");
        setTimeout(() => navigate("/rooms"), 1500);
      } else {
        // Not logged in → store for post-login redemption
        sessionStorage.setItem("pendingCouponCode", upperCode);
        setEarlyAccess(upperCode, couponType, accessDays);
        setStatus("success");
        setTimeout(() => navigate("/login"), 1200);
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <button className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeftIcon size={12} />
              Adjudo
            </button>
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isJa ? "先行利用コードを入力" : "Early Access"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            {isJa
              ? "adjudoは現在、招待された先行ユーザー向けに公開しています。"
              : "adjudo is currently available to invited early users only."}
          </p>
        </div>

        {/* Expired notice */}
        {isExpired && status === "idle" && (
          <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-sm font-medium text-amber-800">
              {isJa
                ? "Early Accessの利用期間が終了しました。新しいコードを入力して続けてください。"
                : "Your Early Access period has ended. Enter a new code to continue."}
            </p>
          </div>
        )}

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          {status === "success" ? (
            <div className="text-center py-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {isJa
                  ? (user ? "アクセスコードを確認しました。" : "アクセスコードを確認しました。ログインして続行してください。")
                  : (user ? "Access code confirmed. Redirecting…" : "Access code confirmed. Please log in to continue.")}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {isJa ? "アクセスコード" : "Access code"}
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus("idle"); }}
                  placeholder={isJa ? "アクセスコードを入力" : "Enter your access code"}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground font-mono placeholder:font-sans placeholder:tracking-normal"
                  autoFocus
                  autoComplete="off"
                />
              </div>

              {status === "invalid" && (
                <p className="text-sm text-destructive">
                  {isJa
                    ? "このアクセスコードは無効、または現在利用できません。"
                    : "This access code is invalid or no longer available."}
                </p>
              )}
              {status === "error" && (
                <p className="text-sm text-destructive">
                  {isJa ? "エラーが発生しました。再度お試しください。" : "Something went wrong. Please try again."}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading" || !code.trim()}
                className="w-full py-2.5 text-sm font-medium bg-zinc-900 text-white rounded-xl hover:bg-zinc-700 transition-colors disabled:bg-zinc-300 disabled:text-zinc-400 disabled:cursor-not-allowed dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 dark:disabled:bg-zinc-600 dark:disabled:text-zinc-400"
              >
                {status === "loading"
                  ? (isJa ? "確認中…" : "Verifying…")
                  : (isJa ? "ログインへ進む" : "Continue to login")}
              </button>
            </form>
          )}
        </div>

        {/* Waitlist link */}
        <p className="mt-5 text-xs text-center text-muted-foreground/60">
          {isJa ? "アクセスコードをお持ちでない方は" : "Don't have an access code?"}{" "}
          <Link href="/waitlist">
            <span className="underline cursor-pointer hover:text-foreground transition-colors">
              {isJa ? "Waitlistに登録してください。" : "Join the waitlist."}
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}

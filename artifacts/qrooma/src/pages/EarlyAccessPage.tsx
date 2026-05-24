import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { ArrowLeftIcon } from "lucide-react";
import { setEarlyAccess, getEarlyAccess } from "../services/earlyAccess";
import { useLocale } from "../context/LocaleContext";

export default function EarlyAccessPage() {
  const [code,       setCode]       = useState("");
  const [status,     setStatus]     = useState<"idle" | "loading" | "success" | "error" | "invalid">("idle");
  const [, navigate] = useLocation();
  const { locale }   = useLocale();
  const isJa         = locale === "ja";

  // Check if already valid and redirect
  useEffect(() => {
    const ea = getEarlyAccess();
    if (ea && new Date(ea.expiresAt) > new Date()) {
      navigate("/login");
    }
  }, [navigate]);

  // Check for ?expired=true query param
  const isExpired = typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("expired") === "true";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/early-access/validate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json() as { valid: boolean; accessType?: string; days?: number };

      if (data.valid) {
        setEarlyAccess(code.trim(), data.accessType ?? "early_access", data.days ?? 14);
        setStatus("success");
        setTimeout(() => navigate("/login"), 1200);
      } else {
        setStatus("invalid");
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
            Early Access
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            {isJa
              ? "テスターまたは先行利用者の方は、配布されたクーポンコードを入力してください。このクーポンでは、認証日から14日間adjudoを利用できます。"
              : "Enter the coupon code you received. Access is valid for 14 days from activation."}
          </p>
        </div>

        {/* Expired notice */}
        {isExpired && status === "idle" && (
          <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-sm font-medium text-amber-800">
              {isJa
                ? "Early Accessの利用期間が終了しました。引き続き利用をご希望の場合は、再度ご案内をお待ちください。"
                : "Your Early Access period has ended. Please wait for further invitation."}
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
                {isJa ? "認証しました。ログイン画面へ移動します。" : "Verified! Redirecting to sign in…"}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {isJa ? "クーポンコード" : "Coupon Code"}
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setStatus("idle"); }}
                  placeholder={isJa ? "クーポンコードを入力" : "Enter coupon code"}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground font-mono"
                  autoFocus
                  autoComplete="off"
                />
              </div>

              {status === "invalid" && (
                <p className="text-sm text-destructive">
                  {isJa ? "クーポンコードが正しくありません。" : "Invalid coupon code."}
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
                  : (isJa ? "認証してログインへ進む" : "Verify and continue to sign in")}
              </button>
            </form>
          )}
        </div>

        {/* Waitlist link */}
        <p className="mt-5 text-xs text-center text-muted-foreground/60">
          {isJa ? "クーポンをお持ちでない方は" : "Don't have a code?"}{" "}
          <Link href="/waitlist">
            <span className="underline cursor-pointer hover:text-foreground transition-colors">
              {isJa ? "Waitlistへ" : "Join the waitlist"}
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}

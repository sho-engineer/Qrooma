import { useState } from "react";
import { Link } from "wouter";
import { useAuth, mapFirebaseError, isAdminEmail } from "../context/AuthContext";
import { useLocale, type Locale } from "../context/LocaleContext";
import { ArrowLeftIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { GoogleIcon } from "../components/GoogleIcon";
import { IS_CONFIGURED } from "../lib/firebase";
import { isEarlyAccessValid } from "../services/earlyAccess";

type View = "signin" | "signup" | "reset";

export default function AuthPage() {
  const [view,          setView]       = useState<View>("signin");
  const [email,         setEmail]      = useState("");
  const [password,      setPassword]   = useState("");
  const [name,          setName]       = useState("");
  const [showPw,        setShowPw]     = useState(false);
  const [error,         setError]      = useState("");
  const [resetSent,     setResetSent]  = useState(false);
  const [isSubmitting,  setSubmitting] = useState(false);

  const { signInWithGoogle, signInWithEmail, signUp, sendPasswordReset } = useAuth();
  const { locale, setLocale } = useLocale();
  const isJa = locale === "ja";

  function reset() {
    setError("");
    setResetSent(false);
    setPassword("");
    setShowPw(false);
  }

  function switchView(v: View) {
    reset();
    setView(v);
  }

  async function handleGoogle() {
    setError("");
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(mapFirebaseError(err));
      setSubmitting(false);
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      setError(mapFirebaseError(err));
      setSubmitting(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const needsEA = !isAdminEmail(email) && !isEarlyAccessValid();
    if (needsEA) {
      setError(
        isJa
          ? "アカウント作成にはEarly Accessコードが必要です。クーポンを入力してから登録してください。"
          : "Early Access code required to create an account."
      );
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    try {
      await signUp(email, password, name);
    } catch (err) {
      setError(mapFirebaseError(err));
      setSubmitting(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await sendPasswordReset(email);
      setResetSent(true);
    } catch (err) {
      setError(mapFirebaseError(err));
    } finally {
      setSubmitting(false);
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
          <div className="flex gap-1">
            {(["ja", "en"] as Locale[]).map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                  locale === l
                    ? "bg-foreground text-background border-foreground"
                    : "text-muted-foreground border-border hover:bg-accent/40"
                }`}
              >
                {l === "ja" ? "日本語" : "EN"}
              </button>
            ))}
          </div>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {view === "reset"
              ? (isJa ? "パスワード再設定" : "Reset password")
              : view === "signup"
              ? (isJa ? "アカウント作成" : "Create account")
              : (isJa ? "先行利用ログイン" : "Early Access Login")}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            {view === "reset"
              ? (isJa ? "登録済みのメールアドレスにリセットリンクを送ります。" : "We'll send a reset link to your email.")
              : view === "signup"
              ? (isJa ? "新しいアカウントを作成します。Early Accessが必要です。" : "Create your account. Early Access required.")
              : (isJa ? "adjudoは現在、テスターと一部の先行利用者向けに公開しています。" : "adjudo is currently available for testers and selected early users.")}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">

          {!IS_CONFIGURED && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-xs font-semibold text-amber-800 mb-0.5">
                {isJa ? "Firebase 未設定" : "Firebase not configured"}
              </p>
              <p className="text-xs text-amber-700 leading-relaxed">
                {isJa
                  ? "VITE_FIREBASE_* 環境変数を設定してください。"
                  : "Set the VITE_FIREBASE_* environment variables to enable login."}
              </p>
            </div>
          )}

          {/* ── Password reset view ── */}
          {view === "reset" && (
            resetSent ? (
              <div className="text-center py-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  {isJa ? "送信しました" : "Email sent"}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isJa ? `${email} にリセットリンクを送りました。` : `We sent a reset link to ${email}.`}
                </p>
                <button
                  onClick={() => switchView("signin")}
                  className="mt-4 text-xs text-muted-foreground underline hover:text-foreground transition-colors"
                >
                  {isJa ? "ログインに戻る" : "Back to sign in"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                    {isJa ? "メールアドレス" : "Email"}
                  </label>
                  <input
                    type="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                </div>
                {error && <p className="text-xs text-destructive leading-relaxed">{error}</p>}
                <button
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="w-full py-2.5 text-sm font-medium bg-zinc-900 text-white rounded-xl hover:bg-zinc-700 transition-colors disabled:bg-zinc-300 disabled:text-zinc-400 disabled:cursor-not-allowed dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {isSubmitting ? (isJa ? "送信中…" : "Sending…") : (isJa ? "リセットリンクを送る" : "Send reset link")}
                </button>
                <button type="button" onClick={() => switchView("signin")}
                  className="w-full text-xs text-center text-muted-foreground hover:text-foreground transition-colors py-1">
                  {isJa ? "← ログインに戻る" : "← Back to sign in"}
                </button>
              </form>
            )
          )}

          {/* ── Sign up view ── */}
          {view === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                  {isJa ? "名前（任意）" : "Name (optional)"}
                </label>
                <input
                  type="text"
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={isJa ? "山田 太郎" : "Your name"}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                  {isJa ? "メールアドレス" : "Email"}
                </label>
                <input
                  type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring transition-shadow"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                  {isJa ? "パスワード（6文字以上）" : "Password (6+ chars)"}
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"} required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 pr-10 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                  </button>
                </div>
              </div>
              {error && <p className="text-xs text-destructive leading-relaxed">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting || !IS_CONFIGURED}
                className="w-full py-2.5 text-sm font-medium bg-zinc-900 text-white rounded-xl hover:bg-zinc-700 transition-colors disabled:bg-zinc-300 disabled:text-zinc-400 disabled:cursor-not-allowed dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isSubmitting ? (isJa ? "作成中…" : "Creating…") : (isJa ? "アカウントを作成" : "Create account")}
              </button>
              <button type="button" onClick={() => switchView("signin")}
                className="w-full text-xs text-center text-muted-foreground hover:text-foreground transition-colors py-1">
                {isJa ? "すでにアカウントをお持ちの方" : "Already have an account? Sign in"}
              </button>
            </form>
          )}

          {/* ── Sign in view ── */}
          {view === "signin" && (
            <>
              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={isSubmitting || !IS_CONFIGURED}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-800 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GoogleIcon size={18} />
                {isSubmitting ? (isJa ? "処理中…" : "Please wait…") : (isJa ? "Googleでログイン" : "Continue with Google")}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] text-muted-foreground/50">
                  {isJa ? "または" : "or"}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Email/password */}
              <form onSubmit={handleEmailSignIn} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                    {isJa ? "メールアドレス" : "Email"}
                  </label>
                  <input
                    type="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring transition-shadow"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-foreground/70">
                      {isJa ? "パスワード" : "Password"}
                    </label>
                    <button type="button" onClick={() => switchView("reset")}
                      className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors">
                      {isJa ? "忘れた場合" : "Forgot?"}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"} required
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full px-3 py-2.5 pr-10 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-xs text-destructive leading-relaxed">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting || !IS_CONFIGURED}
                  className="w-full py-2.5 text-sm font-medium bg-zinc-900 text-white rounded-xl hover:bg-zinc-700 transition-colors disabled:bg-zinc-300 disabled:text-zinc-400 disabled:cursor-not-allowed dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {isSubmitting ? (isJa ? "処理中…" : "Please wait…") : (isJa ? "ログイン" : "Sign in")}
                </button>
              </form>

              <button type="button" onClick={() => switchView("signup")}
                className="w-full text-xs text-center text-muted-foreground hover:text-foreground transition-colors py-1">
                {isJa ? "アカウントをお持ちでない方 → 新規登録" : "New here? Create account →"}
              </button>
            </>
          )}
        </div>

        <p className="mt-5 text-xs text-center text-muted-foreground/60 leading-relaxed px-2">
          {isJa
            ? "ログインすることで、利用規約およびプライバシーポリシーに同意したことになります。"
            : "By signing in, you agree to our Terms of Service and Privacy Policy."}
        </p>
      </div>
    </div>
  );
}

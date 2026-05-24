import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useLocale, type Locale } from "../context/LocaleContext";
import { ArrowLeftIcon } from "lucide-react";
import { GoogleIcon } from "../components/GoogleIcon";
import { IS_CONFIGURED } from "../lib/firebase";

export default function AuthPage() {
  const [error, setError]           = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
  const { signInWithGoogle } = useAuth();
  const { locale, setLocale } = useLocale();

  const isJa = locale === "ja";

  async function handleGoogle() {
    setError("");
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } catch {
      setError(
        isJa
          ? "ログインに失敗しました。時間を置いてもう一度お試しください。"
          : "Login failed. Please try again later."
      );
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
                    ? "bg-primary text-primary-foreground border-primary"
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
            {isJa ? "ログイン" : "Sign in"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            {isJa
              ? "AI Decision Roomで、曖昧なテーマを整理し、実行できる判断に変えましょう。"
              : "Structure your decisions and turn ambiguity into action."}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">

          {/* Firebase not configured warning */}
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

          {/* Google login button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={isSubmitting || !IS_CONFIGURED}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-800 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-ring transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <GoogleIcon size={18} />
            {isSubmitting
              ? (isJa ? "処理中…" : "Please wait…")
              : (isJa ? "Googleでログイン" : "Continue with Google")}
          </button>

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive text-center leading-relaxed">{error}</p>
          )}
        </div>

        {/* Footer note */}
        <p className="mt-5 text-xs text-center text-muted-foreground/60 leading-relaxed px-2">
          {isJa
            ? "ログインすることで、利用規約およびプライバシーポリシーに同意したことになります。"
            : "By signing in, you agree to our Terms of Service and Privacy Policy."}
        </p>
      </div>
    </div>
  );
}

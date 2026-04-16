import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useLocale, type Locale } from "../context/LocaleContext";
import { ArrowLeftIcon } from "lucide-react";

interface Props {
  initialMode?: "login" | "signup";
}

export default function AuthPage({ initialMode = "login" }: Props) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const { t, locale, setLocale } = useLocale();
  const [, navigate] = useLocation();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        if (!name.trim()) {
          setError(locale === "ja" ? "名前を入力してください。" : "Name is required.");
          setIsSubmitting(false);
          return;
        }
        await signUp(email, password, name);
      }
      navigate("/rooms");
    } catch {
      setError(locale === "ja" ? "エラーが発生しました。再度お試しください。" : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">

        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <button className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeftIcon size={12} />
              Qrooma
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

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Qrooma</h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            {locale === "ja"
              ? "非同期 AI チームルーム — 自分の API キーを使う"
              : "Async AI team room — bring your own API keys"}
          </p>
        </div>

        <div className="mb-5 px-4 py-3 bg-muted/60 border border-border rounded-xl">
          <p className="text-xs font-medium text-foreground mb-0.5">{t.demoModeTitle}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{t.demoModeDesc}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex gap-1.5 mb-6 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                mode === "login"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.loginTab}
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                mode === "signup"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.signupTab}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="name">
                  {t.name}
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={locale === "ja" ? "お名前" : "Your name"}
                  required={mode === "signup"}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="email">
                {t.email}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="password">
                {t.password}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-muted-foreground"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 mt-1"
            >
              {isSubmitting
                ? (locale === "ja" ? "処理中…" : "Please wait…")
                : mode === "login" ? t.loginBtn : t.signupBtn}
            </button>
          </form>
        </div>

        <p className="mt-5 text-xs text-center text-muted-foreground/60 leading-relaxed px-2">
          {locale === "ja"
            ? "APIキーはこのプロトタイプではブラウザに保存されます。本実装ではサーバーサイドで暗号化されクライアントに送信されません。"
            : "API keys are stored in your browser for this prototype. Final spec: encrypted server-side storage — keys never exposed to the client."}
        </p>
      </div>
    </div>
  );
}

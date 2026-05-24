import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";

const logoA = "/brand/adjudo-wordmark.png";

type Status = "idle" | "loading" | "success" | "already" | "error";

interface WaitlistPageProps {
  locale?: "en" | "ja";
}

export default function WaitlistPage({ locale = "en" }: WaitlistPageProps) {
  const [email,   setEmail]   = useState("");
  const [name,    setName]    = useState("");
  const [role,    setRole]    = useState("");
  const [status,  setStatus]  = useState<Status>("idle");

  const isJa = locale === "ja";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const r = await fetch("/api/waitlist", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim(), name: name.trim() || undefined, role: role.trim() || undefined }),
      });
      const d = await r.json() as { status?: string };
      if (d.status === "joined")         setStatus("success");
      else if (d.status === "already_joined") setStatus("already");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Nav */}
      <header className="border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <Link href={isJa ? "/jp" : "/"}>
            <img src={logoA} alt="Adjudo" className="w-[105px] h-auto dark:invert hover:opacity-70 transition-opacity" />
          </Link>
          <Link href={isJa ? "/jp" : "/"}>
            <button className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeftIcon size={12} />
              {isJa ? "トップへ戻る" : "Back to home"}
            </button>
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center px-5 py-16 sm:py-24">
        <div className="w-full max-w-md">
          {status === "success" || status === "already" ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-foreground/[0.06] flex items-center justify-center mx-auto mb-6">
                <CheckIcon size={22} className="text-foreground/60" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-foreground mb-3">
                {status === "already"
                  ? (isJa ? "すでに登録済みです" : "You're already on the list")
                  : (isJa ? "登録しました！" : "You're on the list!")}
              </h1>
              <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
                {status === "already"
                  ? (isJa ? "このメールアドレスはすでに登録されています。Adjudoの準備ができ次第、お知らせします。" : "That email is already registered. We'll reach out as soon as Adjudo is ready.")
                  : (isJa ? "Waitlistに登録しました。Adjudoの準備ができ次第、お知らせします。" : "You're on the waitlist. We'll let you know when Adjudo is ready.")}
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link href={isJa ? "/jp" : "/"}>
                  <button className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-full hover:text-foreground hover:border-foreground/30 transition-all">
                    <ArrowLeftIcon size={13} />
                    {isJa ? "トップへ" : "Back to home"}
                  </button>
                </Link>
                <Link href="/feedback">
                  <button className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium bg-foreground text-background rounded-full hover:opacity-85 transition-all">
                    {isJa ? "要望ボードを見る" : "View feedback board"}
                    <ArrowRightIcon size={13} />
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-4">
                  {isJa ? "先行アクセス" : "Early access"}
                </p>
                <h1
                  className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-4"
                  style={{ fontSize: "clamp(1.8rem, 4vw, 2.75rem)" }}
                >
                  {isJa ? "Waitlistに\n登録する" : "Join the\nwaitlist"}
                </h1>
                <p className="text-[15px] text-muted-foreground leading-relaxed">
                  {isJa
                    ? "Adjudoの先行アクセスを受け取りましょう。Solo Founderのための AI Decision Room です。"
                    : "Get early access to Adjudo — the AI Decision Room for solo founders."}
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                    {isJa ? "メールアドレス *" : "Email *"}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isJa ? "your@email.com" : "your@email.com"}
                    required
                    className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                    {isJa ? "名前（任意）" : "Name (optional)"}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isJa ? "山田 太郎" : "Your name"}
                    className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                    {isJa ? "役割（任意）" : "Role (optional)"}
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder={isJa ? "例：Solo Founder、プロダクトマネージャー" : "e.g. Solo Founder, Product Manager"}
                    className="w-full px-4 py-3 text-sm border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/40 transition-colors"
                  />
                </div>

                {status === "error" && (
                  <p className="text-xs text-red-500">
                    {isJa ? "エラーが発生しました。もう一度お試しください。" : "Something went wrong. Please try again."}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background font-medium rounded-full px-7 py-3 text-[15px] hover:opacity-85 active:scale-[0.97] transition-all disabled:opacity-50 mt-2"
                >
                  {status === "loading"
                    ? (isJa ? "登録中..." : "Joining...")
                    : (isJa ? "Waitlistに登録する" : "Join waitlist")}
                  {status !== "loading" && <ArrowRightIcon size={14} />}
                </button>
              </form>

              <p className="mt-4 text-[11px] text-muted-foreground/40 text-center">
                {isJa ? "スパムは送りません。いつでも退会できます。" : "No spam. Unsubscribe any time."}
              </p>

              <div className="mt-8 pt-6 border-t border-border/50 text-center">
                <p className="text-[12px] text-muted-foreground/60 mb-2">
                  {isJa ? "機能要望や投票はこちら" : "Have a feature request?"}
                </p>
                <Link href="/feedback">
                  <span className="text-[12px] text-foreground/60 hover:text-foreground underline underline-offset-2 transition-colors cursor-pointer">
                    {isJa ? "フィードバックボードを見る →" : "View feedback board →"}
                  </span>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

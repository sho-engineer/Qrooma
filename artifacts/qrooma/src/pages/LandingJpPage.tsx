import { useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import { ArrowRightIcon } from "lucide-react";
const logoA = "/brand/adjudo-wordmark.png";
const logoB = "/brand/adjudo-symbol.png";

// ─── useFadeSection ───────────────────────────────────────────────────────────
function useFadeSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
      },
      { threshold: 0.04, rootMargin: "0px 0px -24px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return {
    ref,
    style: {
      transition: "opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)",
      opacity:   visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(14px)",
    } as React.CSSProperties,
  };
}

// ─── Buttons ──────────────────────────────────────────────────────────────────
function PrimaryBtn({ children, large }: { children: React.ReactNode; large?: boolean }) {
  return (
    <button
      className={`inline-flex items-center gap-2 bg-foreground text-background font-medium rounded-full
        whitespace-nowrap hover:opacity-85 active:scale-[0.97] transition-all duration-150
        ${large ? "px-7 py-3 text-[15px]" : "px-5 py-2.5 text-sm"}`}
    >
      {children}
    </button>
  );
}

function GhostBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-full bg-transparent whitespace-nowrap hover:text-foreground hover:border-foreground/30 active:scale-[0.97] transition-all duration-150">
      {children}
    </button>
  );
}

function WaitlistHeroFormJp() {
  const [email,  setEmail]  = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "already" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const r = await fetch("/api/waitlist", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim() }),
      });
      const d = await r.json() as { status?: string };
      if (d.status === "joined")               setStatus("success");
      else if (d.status === "already_joined")  setStatus("already");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success" || status === "already") {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-sm font-medium text-foreground py-1">
          ✓ {status === "already"
            ? "このメールアドレスはすでに登録済みです — 準備が整い次第ご連絡します。"
            : "Waitlistへの登録が完了しました。Adjudoの準備ができ次第お知らせします。"}
        </p>
        <Link href="/feedback">
          <GhostBtn>要望ボードを見る <ArrowRightIcon size={13} /></GhostBtn>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 flex-wrap">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="px-4 py-2.5 text-sm border border-border rounded-full bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/40 min-w-[220px] w-full sm:w-auto transition-colors"
      />
      <PrimaryBtn large>
        {status === "loading" ? "登録中…" : "Waitlistに登録する"}
        {status !== "loading" && <ArrowRightIcon size={14} />}
      </PrimaryBtn>
      <Link href="/feedback">
        <GhostBtn>要望ボードを見る</GhostBtn>
      </Link>
      {status === "error" && (
        <span className="text-[12px] text-red-500 w-full sm:w-auto">エラーが発生しました。もう一度お試しください。</span>
      )}
    </form>
  );
}

// ─── Decision Memo Preview (Japanese) ─────────────────────────────────────────
function DecisionMemoPreviewJp() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
      {/* Window chrome */}
      <div className="border-b border-border px-5 py-3.5 flex items-center justify-between bg-card">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-foreground/8" />
            <div className="w-2.5 h-2.5 rounded-full bg-foreground/8" />
          </div>
          <img src={logoB} alt="Adjudo" className="h-3.5 w-auto opacity-40 ml-1 dark:invert" />
        </div>
        <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/40">
          Decision Memo
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Topic */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">
            テーマ
          </p>
          <p className="text-sm font-semibold text-foreground leading-snug">
            MVPにどの機能を入れるか
          </p>
        </div>

        {/* Decision */}
        <div className="border border-foreground/10 rounded-xl px-4 py-3 bg-background">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1.5">
            判断
          </p>
          <p className="text-[13px] text-foreground leading-relaxed font-medium">
            認証フローとコアループのみ実装。チーム機能は v1 対象外。
          </p>
        </div>

        {/* Scope classification */}
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label:  "今やる",
              symbol: "✓",
              dark:   true,
              items:  ["認証フロー", "コアループ", "分析イベント"],
            },
            {
              label:  "今やらない",
              symbol: "✗",
              dark:   false,
              items:  ["チームワークスペース", "高度なフィルター", "カスタムテーマ"],
            },
            {
              label:  "後で検討",
              symbol: "○",
              dark:   false,
              items:  ["AI提案機能", "APIアクセス"],
            },
            {
              label:  "要検証",
              symbol: "?",
              dark:   false,
              items:  ["料金モデルの検証"],
            },
          ].map((box) => (
            <div
              key={box.label}
              className={`rounded-xl p-3 border ${
                box.dark
                  ? "bg-foreground text-background border-transparent"
                  : "bg-background border-border"
              }`}
            >
              <p className={`text-[9px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1 ${box.dark ? "text-background/60" : "text-muted-foreground/60"}`}>
                <span className="text-[10px]">{box.symbol}</span> {box.label}
              </p>
              <ul className="space-y-0.5">
                {box.items.map((item) => (
                  <li key={item} className={`text-[11px] leading-relaxed ${box.dark ? "text-background/90" : "text-foreground/80"}`}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Next actions */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-2">
            次アクション
          </p>
          <ul className="space-y-1">
            {[
              "設計を auth flow から開始",
              "コアループのユーザーテストを計画",
              "チーム機能を v2 バックログに追加",
            ].map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-foreground/70">
                <span className="shrink-0 mt-px w-4 h-4 rounded-full border border-border flex items-center justify-center text-[9px] font-bold text-muted-foreground/50">
                  {i + 1}
                </span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── Positioning grid (Japanese) ──────────────────────────────────────────────
function PositioningGridJp() {
  const rows = [
    {
      category: "思考 / 壁打ち",
      tools:    "ChatGPT, Claude, Gemini",
      role:     "アイデア生成",
      here:     false,
    },
    {
      category: "判断 / 構造化",
      tools:    "Adjudo",
      role:     "比較・検証・構造化",
      here:     true,
    },
    {
      category: "実行 / 構築",
      tools:    "Manus, Replit, Cursor, Claude Code",
      role:     "実装・構築",
      here:     false,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      {rows.map((row, i) => (
        <div
          key={row.category}
          className={`grid grid-cols-[auto_1fr_1fr] sm:grid-cols-[160px_1fr_1fr] items-center gap-4 px-5 py-4 ${
            row.here
              ? "bg-foreground text-background"
              : i === 0 ? "bg-card" : "bg-card border-t border-border"
          } ${i > 0 && !row.here ? "border-t border-border" : ""}`}
        >
          <p className={`text-[11px] font-semibold uppercase tracking-widest ${row.here ? "text-background/70" : "text-muted-foreground/60"}`}>
            {row.category}
          </p>
          <p className={`text-[12px] font-medium leading-snug ${row.here ? "text-background" : "text-foreground/70"}`}>
            {row.tools}
            {row.here && (
              <span className="ml-2 text-[10px] font-bold uppercase tracking-widest opacity-50">
                ← あなたはここ
              </span>
            )}
          </p>
          <p className={`text-[12px] leading-snug ${row.here ? "text-background/80" : "text-muted-foreground"}`}>
            {row.role}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Japanese Landing Page (/jp) ──────────────────────────────────────────────
export default function LandingJpPage() {
  const { user } = useAuth();

  const secProblem   = useFadeSection();
  const secHow       = useFadeSection();
  const secMemo      = useFadeSection();
  const secWhy       = useFadeSection();
  const secUseCases  = useFadeSection();
  const secPricing   = useFadeSection();
  const secFooter    = useFadeSection();

  const howSteps = [
    {
      n: "01",
      title: "選択肢を並べる",
      body:  "複数の判断軸で選択肢を比較する。片方の視点に偏らず、論点を整理する。",
    },
    {
      n: "02",
      title: "前提を崩す",
      body:  "AIが仮定・反証・盲点の指摘を行い、思い込みを壊す。決断の質を上げる。",
    },
    {
      n: "03",
      title: "判断を構造化する",
      body:  "今やること・やらないこと・後で考えることを分類。判断に根拠と背景を付ける。",
    },
    {
      n: "04",
      title: "実行に渡す",
      body:  "Decision Memoとして出力。ChatGPT、Manus、Replit、Cursor、Claude Codeに渡せる形にまとまる。",
    },
  ];

  const useCases = [
    "MVP スコープ",
    "機能優先度",
    "料金・プラン設計",
    "LP 訴求の方向性",
    "実装方針",
    "Build vs. Buy",
  ];

  const freeFeatures = [
    "Builder / Breaker / Operator の3役割",
    "Decision Memo 出力",
    "スコープ分類（今やる / 今やらない / 後で検討 / 要検証）",
    "1日3回まで · APIキー不要",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
          <Link href="/jp">
            <img src={logoA} alt="Adjudo" className="w-[105px] sm:w-[140px] h-auto hover:opacity-70 transition-opacity duration-150 dark:invert" />
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/">
              <button className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-full border border-border/60 hover:border-border transition-all duration-150">
                EN
              </button>
            </Link>
            {user ? (
              <Link href="/rooms">
                <PrimaryBtn>アプリを開く</PrimaryBtn>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <button className="hidden sm:inline-block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">
                    ログイン
                  </button>
                </Link>
                <Link href="/waitlist/jp">
                  <PrimaryBtn>Waitlistに登録する</PrimaryBtn>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pt-24 sm:pt-32 pb-20 sm:pb-28">
        <div className="max-w-3xl">
          <p className="animate-fade-up text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/60 mb-6">
            AI Decision Room
          </p>

          <h1
            className="animate-fade-up anim-d1 font-black tracking-[-0.03em] leading-[1.08] text-foreground mb-6"
            style={{ fontSize: "clamp(2.6rem, 6.5vw, 4.5rem)" }}
          >
            <span className="block">散らかった思考を、</span>
            <span className="block">明確な判断に変える。</span>
          </h1>

          <p className="animate-fade-up anim-d2 text-[17px] sm:text-lg text-muted-foreground leading-[1.8] max-w-xl mb-10">
            ひとりで事業をつくる人のための AI Decision Room。選択肢を比較し、前提を崩し、判断する。ChatGPT、Manus、Replit、Cursorに渡せる形でまとめます。
          </p>

          <div className="animate-fade-up anim-d3">
            {user ? (
              <div className="flex items-center gap-3 flex-wrap">
                <Link href="/rooms">
                  <PrimaryBtn large>アプリを開く <ArrowRightIcon size={14} /></PrimaryBtn>
                </Link>
              </div>
            ) : (
              <WaitlistHeroFormJp />
            )}
          </div>
        </div>
      </section>

      {/* ── Problem ─────────────────────────────────────────────────────────── */}
      <section
        ref={secProblem.ref as React.RefObject<HTMLElement>}
        style={secProblem.style}
        className="border-y border-border bg-[#F7F7F5]"
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-5">
            よくある問題
          </p>
          <h2
            className="font-black tracking-[-0.025em] leading-[1.2] text-foreground mb-12 sm:mb-14"
            style={{ fontSize: "clamp(1.65rem, 3.8vw, 2.5rem)" }}
          >
            AIは考えるのを助けてくれる。<br />でも、それは「決めた」ことにならない。
          </h2>

          <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border border border-border rounded-2xl overflow-hidden">
            {[
              {
                title: "ひとつのAIとのループ",
                body:  "ChatGPTやClaudeと往復しているうちに、視野が狭くなる。アイデアは出るが、比較や反証がなく、判断の質が上がらない。",
              },
              {
                title: "探索しても着地できない",
                body:  "選択肢を並べても「どれにするか」が決まらない。議論が止まったまま、先に進めない。",
              },
              {
                title: "実行への引き渡しが曖昧",
                body:  "ChatGPTやCursorに何を渡せばいいかわからない。判断が構造化されていないから。",
              },
            ].map((item, i) => (
              <div key={i} className="bg-[#F7F7F5] p-7 sm:p-8 flex flex-col gap-5">
                <span className="text-[11px] font-bold tracking-[0.18em] text-foreground/20 uppercase select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[15px] font-bold text-foreground mb-2.5 leading-snug">{item.title}</p>
                  <p className="text-[14px] text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section
        ref={secHow.ref as React.RefObject<HTMLElement>}
        style={secHow.style}
        className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24"
      >
        <h2
          className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-12 sm:mb-16"
          style={{ fontSize: "clamp(1.65rem, 3.8vw, 2.5rem)" }}
        >
          比較して、崩して、決めて、渡す。
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border border border-border rounded-2xl overflow-hidden">
          {howSteps.map((step) => (
            <div key={step.n} className="bg-background p-7 sm:p-8 flex flex-col justify-between gap-6 min-h-[220px]">
              <div>
                <span className="block text-[42px] font-black leading-none tracking-tight text-foreground/[0.07] mb-5 select-none">
                  {step.n}
                </span>
                <p className="text-[15px] font-bold text-foreground mb-2 leading-snug">{step.title}</p>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
              {step.n === "04" && (
                <div className="flex flex-wrap gap-1.5">
                  {["Decision Memo", "Task List", "Build Prompt"].map((label) => (
                    <span key={label} className="px-2.5 py-1 text-[10px] font-semibold tracking-wide border border-border rounded-md text-foreground/40 bg-card">
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Decision Memo showcase ──────────────────────────────────────────── */}
      <section
        ref={secMemo.ref as React.RefObject<HTMLElement>}
        style={secMemo.style}
        className="border-t border-border bg-[#F7F7F5]"
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-start">
            {/* Left: text */}
            <div className="lg:pt-4">
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-5">
                アウトプット
              </p>
              <h2
                className="font-black tracking-[-0.025em] leading-[1.2] text-foreground mb-5"
                style={{ fontSize: "clamp(1.65rem, 3.4vw, 2.3rem)" }}
              >
                判断が、一枚のメモになる。
              </h2>
              <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
                ChatGPT、Claude、Manus、Replit、Cursorに渡せる、構造化されたアウトプット。
              </p>

              <div className="space-y-2">
                {[
                  ["Decision Memo",   "判断・背景・根拠・スコープ分類・次アクション"],
                  ["Task List",       "すぐに実行できるタスク一覧"],
                  ["Generic Prompt",  "汎用AIへのプロンプト"],
                  ["Build Prompt",    "実行ツール向けの構造化プロンプト"],
                ].map(([label, desc]) => (
                  <div key={label} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-foreground/40 mt-[7px]" />
                    <div>
                      <span className="text-[13px] font-semibold text-foreground">{label}</span>
                      <span className="text-[12px] text-muted-foreground ml-2">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: preview card */}
            <DecisionMemoPreviewJp />
          </div>
        </div>
      </section>

      {/* ── Positioning ─────────────────────────────────────────────────────── */}
      <section
        ref={secWhy.ref as React.RefObject<HTMLElement>}
        style={secWhy.style}
        className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24"
      >
        <h2
          className="font-black tracking-[-0.025em] leading-[1.2] text-foreground mb-4"
          style={{ fontSize: "clamp(1.65rem, 3.8vw, 2.5rem)" }}
        >
          思考と実行のあいだにある層。
        </h2>
        <p className="text-[15px] text-muted-foreground leading-relaxed mb-10 max-w-xl">
          Adjudoはチャットボットでも、PMツールでも、議事録ツールでもない。判断を構造化する専用の層。
        </p>
        <PositioningGridJp />
      </section>

      {/* ── Use cases ───────────────────────────────────────────────────────── */}
      <section
        ref={secUseCases.ref as React.RefObject<HTMLElement>}
        style={secUseCases.style}
        className="border-t border-border bg-[#F7F7F5]"
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <h2
            className="font-black tracking-[-0.025em] leading-[1.2] text-foreground mb-3"
            style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}
          >
            プロダクトを動かす、あらゆる判断に。
          </h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed mb-8 max-w-lg">
            MVP スコープ、機能優先度、価格設計、LP訴求、実装方針、Build vs. Buy — 構造が必要なすべての判断に。
          </p>
          <div className="flex flex-wrap gap-2">
            {useCases.map((uc) => (
              <span
                key={uc}
                className="px-4 py-2 rounded-full border border-border bg-background text-[13px] font-medium text-foreground/80"
              >
                {uc}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing note ────────────────────────────────────────────────────── */}
      <section
        ref={secPricing.ref as React.RefObject<HTMLElement>}
        style={secPricing.style}
        className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20"
      >
        <div className="grid sm:grid-cols-[1fr_auto] gap-8 items-start">
          {/* Free plan */}
          <div className="max-w-sm">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-black tracking-tight text-foreground">$0</span>
              <span className="text-sm text-muted-foreground">/ 無料ではじめる</span>
            </div>
            <p className="text-[14px] text-muted-foreground mb-5 leading-relaxed">
              APIキー不要で今すぐ試せます。フルのDecision Room体験を、セットアップなしで。
            </p>
            <ul className="space-y-2.5 mb-6">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13px] text-foreground/80">
                  <span className="shrink-0 mt-0.5 text-foreground/40 text-xs font-bold">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/waitlist/jp">
              <PrimaryBtn>Waitlistに登録する <ArrowRightIcon size={13} /></PrimaryBtn>
            </Link>
          </div>

          {/* BYOK note */}
          <div className="sm:max-w-[260px] rounded-2xl border border-border bg-card p-5">
            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/50 mb-3">
              BYOK
            </p>
            <p className="text-[13px] text-foreground/80 leading-relaxed">
              自分の OpenAI / Anthropic / Google APIキーで動かせます。Connectプランにより近日提供予定。
            </p>
            <p className="mt-2 text-[12px] text-muted-foreground/60">
              現在は Free で試せます
            </p>
          </div>
        </div>
      </section>

      {/* ── Help shape Adjudo ───────────────────────────────────────────────── */}
      <section className="border-t border-border bg-[#F7F7F5]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-4">
            プロダクトを一緒に作る
          </p>
          <h2
            className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-3"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}
          >
            Adjudoを一緒に作ろう
          </h2>
          <p className="text-[15px] text-muted-foreground mb-6 max-w-md leading-relaxed">
            次に何を作るべきか、あなたの声を聞かせてください。機能リクエストへの投票や提案ができます。
          </p>
          <Link href="/feedback">
            <GhostBtn>要望ボードを見る <ArrowRightIcon size={13} /></GhostBtn>
          </Link>
        </div>
      </section>

      {/* ── Footer CTA ──────────────────────────────────────────────────────── */}
      <section
        ref={secFooter.ref as React.RefObject<HTMLElement>}
        style={secFooter.style}
        className="border-t border-border"
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <h2
            className="font-black tracking-[-0.03em] leading-[1.15] text-foreground mb-4 max-w-lg"
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
          >
            Adjudoを最初に使う一人になろう。
          </h2>
          <p className="text-[15px] text-muted-foreground mb-8">
            Waitlistに登録して、一緒にプロダクトを作りましょう。
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {user ? (
              <Link href="/rooms">
                <PrimaryBtn large>アプリを開く <ArrowRightIcon size={14} /></PrimaryBtn>
              </Link>
            ) : (
              <>
                <Link href="/waitlist/jp">
                  <PrimaryBtn large>Waitlistに登録する <ArrowRightIcon size={14} /></PrimaryBtn>
                </Link>
                <Link href="/feedback">
                  <GhostBtn>要望ボードを見る</GhostBtn>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card/40">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoA} alt="Adjudo" className="h-5 w-auto opacity-50 dark:invert" />
            <span className="text-[11px] text-muted-foreground/40">© 2025</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-muted-foreground/40 hidden sm:inline">
              思考と実行のあいだにある層
            </span>
            <Link href="/">
              <span className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer">
                EN
              </span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

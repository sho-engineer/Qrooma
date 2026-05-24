import { useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import { useLocale, type Locale } from "../context/LocaleContext";
import { useAuth } from "../context/AuthContext";
import { ArrowRightIcon } from "lucide-react";

// ─── useFadeSection — scroll-triggered fade-up ────────────────────────────────
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

// ─── LocaleToggle ─────────────────────────────────────────────────────────────
function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex gap-0.5 rounded-full border border-border bg-card p-0.5">
      {(["ja", "en"] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-3 py-1 text-xs rounded-full font-medium transition-all duration-150 active:scale-[0.95] ${
            locale === l
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l === "ja" ? "日本語" : "EN"}
        </button>
      ))}
    </div>
  );
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

// ─── Decision Memo Preview Card ───────────────────────────────────────────────
function DecisionMemoPreview({ locale }: { locale: Locale }) {
  const isJa = locale === "ja";
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="border-b border-border px-5 py-3.5 flex items-center justify-between bg-card">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-foreground/8" />
            <div className="w-2.5 h-2.5 rounded-full bg-foreground/8" />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground/50 ml-1">Qrooma</span>
        </div>
        <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/40">
          {isJa ? "Decision Memo" : "Decision Memo"}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Topic */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1">
            {isJa ? "テーマ" : "Topic"}
          </p>
          <p className="text-sm font-semibold text-foreground leading-snug">
            {isJa ? "MVPにどの機能を入れるか" : "Which features go into the MVP?"}
          </p>
        </div>

        {/* Decision */}
        <div className="border border-foreground/10 rounded-xl px-4 py-3 bg-background">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1.5">
            {isJa ? "判断" : "Decision"}
          </p>
          <p className="text-[13px] text-foreground leading-relaxed font-medium">
            {isJa
              ? "認証フローとコアループのみ実装。チーム機能は v1 対象外。"
              : "Ship auth + core loop only. No team features in v1."}
          </p>
        </div>

        {/* Scope classification */}
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label:   isJa ? "今やる" : "Do now",
              symbol:  "✓",
              dark:    true,
              items:   isJa
                ? ["認証フロー", "コアループ", "分析イベント"]
                : ["Auth flow", "Core loop", "Analytics events"],
            },
            {
              label:   isJa ? "今やらない" : "Not now",
              symbol:  "✗",
              dark:    false,
              items:   isJa
                ? ["チームワークスペース", "高度なフィルター", "カスタムテーマ"]
                : ["Team workspaces", "Advanced filters", "Custom themes"],
            },
            {
              label:   isJa ? "後で検討" : "Consider later",
              symbol:  "○",
              dark:    false,
              items:   isJa
                ? ["AI提案機能", "APIアクセス"]
                : ["AI suggestions", "API access"],
            },
            {
              label:   isJa ? "要検証" : "Need more info",
              symbol:  "?",
              dark:    false,
              items:   isJa
                ? ["料金モデルの検証"]
                : ["Pricing model validation"],
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
            {isJa ? "次アクション" : "Next actions"}
          </p>
          <ul className="space-y-1">
            {(isJa
              ? ["設計を auth flow から開始", "コアループのユーザーテストを計画", "チーム機能を v2 バックログに追加"]
              : ["Start design with auth flow", "Plan user test for core loop", "Add team features to v2 backlog"]
            ).map((action, i) => (
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

// ─── Positioning grid ─────────────────────────────────────────────────────────
function PositioningGrid({ locale }: { locale: Locale }) {
  const isJa = locale === "ja";
  const rows = [
    {
      category: isJa ? "思考 / 壁打ち" : "Thinking",
      tools:    "ChatGPT, Claude, Gemini",
      role:     isJa ? "アイデア生成" : "Generate ideas",
      here:     false,
    },
    {
      category: isJa ? "判断 / 構造化" : "Deciding",
      tools:    "Qrooma",
      role:     isJa ? "比較・検証・構造化" : "Compare, pressure-test, structure",
      here:     true,
    },
    {
      category: isJa ? "実行 / 構築" : "Building",
      tools:    "Manus, Replit, Cursor, Claude Code",
      role:     isJa ? "実装・構築" : "Implement and build",
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
                ← {isJa ? "あなたはここ" : "you are here"}
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

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const { t, locale } = useLocale();
  const { user } = useAuth();

  const secProblem   = useFadeSection();
  const secHow       = useFadeSection();
  const secMemo      = useFadeSection();
  const secWhy       = useFadeSection();
  const secUseCases  = useFadeSection();
  const secPricing   = useFadeSection();
  const secFooter    = useFadeSection();

  const isJa = locale === "ja";

  const howSteps = [
    { n: "01", title: t.landingHowV2Step1Title, body: t.landingHowV2Step1Body },
    { n: "02", title: t.landingHowV2Step2Title, body: t.landingHowV2Step2Body },
    { n: "03", title: t.landingHowV2Step3Title, body: t.landingHowV2Step3Body },
    { n: "04", title: t.landingHowV2Step4Title, body: t.landingHowV2Step4Body },
  ];

  const useCases = isJa
    ? ["MVP スコープ", "機能優先度", "料金・プラン", "LP 訴求", "実装方針", "Build vs. Buy"]
    : ["MVP scope", "Feature priority", "Pricing & plans", "LP messaging", "Implementation direction", "Build vs. buy"];

  const freeFeatures = isJa
    ? ["Builder / Breaker / Operator の3役割", "Decision Memo 出力", "スコープ分類（今やる / 今やらない / 後で検討 / 要検証）", "1日3回まで · APIキー不要"]
    : ["Builder / Breaker / Operator roles", "Decision Memo output", "Scope classification (Do now / Not now / Later / Need more info)", "3 discussions/day · No API keys"];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Nav ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
          <Link href="/">
            <button className="text-[15px] font-bold tracking-tight text-foreground hover:opacity-70 transition-opacity duration-150">
              Qrooma
            </button>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <LocaleToggle />
            {user ? (
              <Link href="/rooms">
                <PrimaryBtn>{t.landingGoToApp}</PrimaryBtn>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <button className="hidden sm:inline-block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">
                    {t.loginBtn}
                  </button>
                </Link>
                <Link href="/signup">
                  <PrimaryBtn>{t.landingGetStarted}</PrimaryBtn>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pt-24 sm:pt-32 pb-20 sm:pb-28">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <p className="animate-fade-up text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/60 mb-6">
            {t.landingEyebrow}
          </p>

          {/* Headline */}
          <h1 className="animate-fade-up anim-d1 font-black tracking-[-0.03em] leading-[1.02] text-foreground mb-6"
            style={{ fontSize: "clamp(2.6rem, 6.5vw, 4.5rem)" }}
          >
            <span className="block">{t.landingHeroLine1}</span>
            <span className="block">{t.landingHeroLine2}</span>
          </h1>

          {/* Sub */}
          <p className="animate-fade-up anim-d2 text-[17px] sm:text-lg text-muted-foreground leading-[1.75] max-w-xl mb-10">
            {t.landingSubcopyV2}
          </p>

          {/* CTAs */}
          <div className="animate-fade-up anim-d3 flex items-center gap-3 flex-wrap">
            {user ? (
              <Link href="/rooms">
                <PrimaryBtn large>{t.landingGoToApp} <ArrowRightIcon size={14} /></PrimaryBtn>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <PrimaryBtn large>{t.landingGetStarted} <ArrowRightIcon size={14} /></PrimaryBtn>
                </Link>
                <Link href="/login">
                  <GhostBtn>{t.loginBtn}</GhostBtn>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Problem ────────────────────────────────────────────────────────── */}
      <section
        ref={secProblem.ref as React.RefObject<HTMLElement>}
        style={secProblem.style}
        className="border-y border-border bg-[#F7F7F5]"
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-5">
            {t.landingProblemEyebrow}
          </p>
          <h2
            className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-12 sm:mb-14 whitespace-pre-line"
            style={{ fontSize: "clamp(1.65rem, 3.8vw, 2.5rem)" }}
          >
            {t.landingProblemTitle}
          </h2>

          <div className="grid sm:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden">
            {[
              { title: t.landingProblemItem1Title, body: t.landingProblemItem1Body },
              { title: t.landingProblemItem2Title, body: t.landingProblemItem2Body },
              { title: t.landingProblemItem3Title, body: t.landingProblemItem3Body },
            ].map((item, i) => (
              <div key={i} className="bg-[#F7F7F5] p-6 sm:p-7">
                <p className="text-[13px] font-bold text-foreground mb-2 leading-snug">{item.title}</p>
                <p className="text-[14px] text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section
        ref={secHow.ref as React.RefObject<HTMLElement>}
        style={secHow.style}
        className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24"
      >
        <h2
          className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-12 sm:mb-16"
          style={{ fontSize: "clamp(1.65rem, 3.8vw, 2.5rem)" }}
        >
          {t.landingHowV2Title}
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden">
          {howSteps.map((step) => (
            <div key={step.n} className="bg-background p-6 sm:p-7 flex flex-col gap-4">
              <span className="text-[11px] font-bold tracking-[0.12em] text-muted-foreground/40 uppercase">
                {step.n}
              </span>
              <div>
                <p className="text-[15px] font-bold text-foreground mb-2 leading-snug">{step.title}</p>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
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
                {t.landingMemoEyebrow}
              </p>
              <h2
                className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-5"
                style={{ fontSize: "clamp(1.65rem, 3.4vw, 2.3rem)" }}
              >
                {t.landingMemoTitle}
              </h2>
              <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
                {t.landingMemoSub}
              </p>

              {/* Output types */}
              <div className="space-y-2">
                {(isJa
                  ? [
                      ["Decision Memo",    "判断・背景・根拠・分類・次アクション"],
                      ["Task List",        "すぐに実行できるタスク一覧"],
                      ["Generic Prompt",   "汎用AIへのプロンプト"],
                      ["Build Prompt",     "実行ツール向けの構造化プロンプト"],
                    ]
                  : [
                      ["Decision Memo",   "Decision, background, reasoning, scope classification, next actions"],
                      ["Task List",       "Immediately actionable task list"],
                      ["Generic Prompt",  "Prompt ready for any AI tool"],
                      ["Build Prompt",    "Structured prompt for execution tools"],
                    ]
                ).map(([label, desc]) => (
                  <div key={label} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                    <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-foreground/40 mt-[7px]" />
                    <div>
                      <span className="text-[13px] font-semibold text-foreground">{label}</span>
                      <span className="text-[12px] text-muted-foreground ml-2">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: preview card */}
            <DecisionMemoPreview locale={locale} />
          </div>
        </div>
      </section>

      {/* ── Positioning ────────────────────────────────────────────────────── */}
      <section
        ref={secWhy.ref as React.RefObject<HTMLElement>}
        style={secWhy.style}
        className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24"
      >
        <h2
          className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-4"
          style={{ fontSize: "clamp(1.65rem, 3.8vw, 2.5rem)" }}
        >
          {t.landingPositioningTitle}
        </h2>
        <p className="text-[15px] text-muted-foreground leading-relaxed mb-10 max-w-xl">
          {t.landingPositioningSub}
        </p>
        <PositioningGrid locale={locale} />
      </section>

      {/* ── Use cases ──────────────────────────────────────────────────────── */}
      <section
        ref={secUseCases.ref as React.RefObject<HTMLElement>}
        style={secUseCases.style}
        className="border-t border-border bg-[#F7F7F5]"
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <h2
            className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-3"
            style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}
          >
            {t.landingUseCasesTitle}
          </h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed mb-8 max-w-lg">
            {t.landingUseCasesSub}
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

      {/* ── Pricing note ───────────────────────────────────────────────────── */}
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
              <span className="text-sm text-muted-foreground">{isJa ? "/ 無料ではじめる" : "/ Start free"}</span>
            </div>
            <p className="text-[14px] text-muted-foreground mb-5 leading-relaxed">
              {t.planFreeDesc}
            </p>
            <ul className="space-y-2.5 mb-6">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13px] text-foreground/80">
                  <span className="shrink-0 mt-0.5 text-foreground/40 text-xs font-bold">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/signup">
              <PrimaryBtn>{t.planFreeCta} <ArrowRightIcon size={13} /></PrimaryBtn>
            </Link>
          </div>

          {/* BYOK note */}
          <div className="sm:max-w-[260px] rounded-2xl border border-border bg-card p-5">
            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/50 mb-3">
              BYOK
            </p>
            <p className="text-[13px] text-foreground/80 leading-relaxed">
              {isJa
                ? "自分の OpenAI / Anthropic / Google APIキーで動かせます。Connectプランにより近日提供予定。"
                : "Bring your own OpenAI, Anthropic, or Google API keys. Available with the Connect plan — coming soon."}
            </p>
            <p className="mt-2 text-[12px] text-muted-foreground/60">
              {isJa ? "現在は Free で試せます" : "Try free in the meantime"}
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ─────────────────────────────────────────────────────── */}
      <section
        ref={secFooter.ref as React.RefObject<HTMLElement>}
        style={secFooter.style}
        className="border-t border-border"
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
          <h2
            className="font-black tracking-[-0.03em] leading-[1.05] text-foreground mb-4 max-w-lg"
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
          >
            {t.landingFooterCtaV2}
          </h2>
          <p className="text-[15px] text-muted-foreground mb-8">
            {t.landingFooterSub}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {user ? (
              <Link href="/rooms">
                <PrimaryBtn large>{t.landingGoToApp} <ArrowRightIcon size={14} /></PrimaryBtn>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <PrimaryBtn large>{t.landingGetStarted} <ArrowRightIcon size={14} /></PrimaryBtn>
                </Link>
                <Link href="/login">
                  <GhostBtn>{t.loginBtn}</GhostBtn>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card/40">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-12 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground/50 font-medium">© 2025 Qrooma</span>
          <span className="text-[11px] text-muted-foreground/40 hidden sm:inline">
            {isJa ? "思考と実行の間にある層" : "The layer between thinking and execution"}
          </span>
        </div>
      </footer>
    </div>
  );
}

import { useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { ArrowRightIcon } from "lucide-react";
const logoA = "/brand/adjudo-wordmark.png";

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

// ─── Checkpoint CTAs (Submit + See a sample) ───────────────────────────────────
function CheckpointActions({ url, external, large }: { url: string; external: boolean; large?: boolean }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <a
        href={url}
        target={external ? "_blank" : undefined}
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 bg-foreground text-background font-semibold rounded-full whitespace-nowrap hover:opacity-85 active:scale-[0.97] transition-all duration-150 ${large ? "px-7 py-3 text-[15px]" : "px-5 py-2.5 text-sm"}`}
      >
        あなたの意思決定を送る <ArrowRightIcon size={14} />
      </a>
      <Link href="/sample-decision-checkpoint">
        <button className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-full bg-transparent whitespace-nowrap hover:text-foreground hover:border-foreground/30 active:scale-[0.97] transition-all duration-150">
          サンプルを見る
        </button>
      </Link>
    </div>
  );
}

// ─── Positioning grid ─────────────────────────────────────────────────────────
function PositioningGrid() {
  const rows = [
    { category: "考える", tools: "ChatGPT, Claude, Gemini",            role: "アイデアを出す",            here: false },
    { category: "決める", tools: "Adjudo",                             role: "比較し、検証し、決める",    here: true  },
    { category: "つくる", tools: "Manus, Replit, Cursor, Claude Code", role: "実装してつくる",            here: false },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      {rows.map((row, i) => (
        <div
          key={row.category}
          className={`grid grid-cols-[auto_1fr_1fr] sm:grid-cols-[160px_1fr_1fr] items-center gap-4 px-5 py-4 ${
            row.here ? "bg-foreground text-background" : i === 0 ? "bg-card" : "bg-card border-t border-border"
          } ${i > 0 && !row.here ? "border-t border-border" : ""}`}
        >
          <p className={`text-[11px] font-semibold uppercase tracking-widest ${row.here ? "text-background/70" : "text-muted-foreground/60"}`}>
            {row.category}
          </p>
          <p className={`text-[12px] font-medium leading-snug ${row.here ? "text-background" : "text-foreground/70"}`}>
            {row.tools}
            {row.here && (
              <span className="ml-2 text-[10px] font-bold uppercase tracking-widest opacity-50">← ここ</span>
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

// ─── Main Landing Page (Japanese) ─────────────────────────────────────────────
export default function LandingPageJP() {
  const { user } = useAuth();
  const { setLocale } = useLocale();
  useEffect(() => { setLocale("ja"); }, []);

  const secProblem    = useFadeSection();
  const secHow        = useFadeSection();
  const secWhy        = useFadeSection();
  const secUseCases   = useFadeSection();
  const secCheckpoint = useFadeSection();
  const secWho        = useFadeSection();
  const secFaq        = useFadeSection();
  const secFooter     = useFadeSection();

  // Source-tracking: preserve ?source= when linking to the external intake form
  const [urlSource] = useState(() =>
    new URLSearchParams(window.location.search).get("source") ?? ""
  );

  // Decision Checkpoint env vars — safe Japanese defaults
  const checkpointIntakeRaw = (import.meta.env.VITE_CHECKPOINT_INTAKE_URL        as string | undefined)?.trim() ?? "";
  const checkpointEmail     = (import.meta.env.VITE_SUPPORT_EMAIL                as string | undefined)?.trim() || "hello@adjudo.com";
  const priceLabel          = (import.meta.env.VITE_CHECKPOINT_PRICE_LABEL_JA    as string | undefined)?.trim() || "$9 有料ベータ";
  const deliveryLabel       = (import.meta.env.VITE_CHECKPOINT_DELIVERY_LABEL_JA as string | undefined)?.trim() || "支払い後48時間以内";
  const checkpointCtaUrl    = checkpointIntakeRaw
    ? (urlSource
        ? `${checkpointIntakeRaw}${checkpointIntakeRaw.includes("?") ? "&" : "?"}source=${encodeURIComponent(urlSource)}`
        : checkpointIntakeRaw)
    : "/submit-decision";
  const ctaExternal = Boolean(checkpointIntakeRaw);

  const howSteps = [
    {
      n: "01",
      title: "Builder",
      body:  "各選択肢の、一番強い可能性を見つける。",
    },
    {
      n: "02",
      title: "Skeptic",
      body:  "見落としやすい前提・反論・リスク・崩れる条件を炙り出す。",
    },
    {
      n: "03",
      title: "Operator",
      body:  "決定を、検証ステップと具体的な次のアクションに落とす。",
    },
  ];

  const useCases = [
    "機能の優先順位",
    "顧客セグメント",
    "マーケティングメッセージ",
    "MVPの範囲",
    "価格とプラン",
    "内製か外部調達か",
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
                English
              </button>
            </Link>
            {user ? (
              <Link href="/rooms">
                <PrimaryBtn>アプリを開く</PrimaryBtn>
              </Link>
            ) : (
              <a
                href={checkpointCtaUrl}
                target={ctaExternal ? "_blank" : undefined}
                rel="noopener noreferrer"
              >
                <PrimaryBtn>意思決定を送る</PrimaryBtn>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pt-24 sm:pt-32 pb-20 sm:pb-28">
        <div className="max-w-3xl">
          <p className="animate-fade-up text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/60 mb-6">
            Decision Checkpoint · {priceLabel}
          </p>

          <h1
            className="animate-fade-up anim-d1 font-black tracking-[-0.03em] leading-[1.1] text-foreground mb-6"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)" }}
          >
            <span className="block">AIは10個のアイデアをくれた。</span>
            <span className="block">次の一手は、あなたが選ぶ。</span>
          </h1>

          <p className="animate-fade-up anim-d2 text-[17px] sm:text-lg text-muted-foreground leading-[1.85] max-w-xl mb-10">
            一人で事業を進める人のための、複数視点型Decision Checkpoint。あなたの選択肢を Builder・Skeptic・Operator の視点でレビューし、一週間を無駄にする前に次の一手を返す。
          </p>

          <div className="animate-fade-up anim-d3">
            {user ? (
              <Link href="/rooms">
                <PrimaryBtn large>アプリを開く <ArrowRightIcon size={14} /></PrimaryBtn>
              </Link>
            ) : (
              <CheckpointActions url={checkpointCtaUrl} external={ctaExternal} large />
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
            課題
          </p>
          <h2
            className="font-black tracking-[-0.025em] leading-[1.3] text-foreground"
            style={{ fontSize: "clamp(1.55rem, 3.6vw, 2.4rem)" }}
          >
            AIは考えるのを助けてくれる。<br />でも、それは「決めた」ことにはならない。
          </h2>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section
        ref={secHow.ref as React.RefObject<HTMLElement>}
        style={secHow.style}
        className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24"
      >
        <h2
          className="font-black tracking-[-0.025em] leading-[1.3] text-foreground mb-4"
          style={{ fontSize: "clamp(1.55rem, 3.6vw, 2.4rem)" }}
        >
          Adjudoは、あなたの意思決定をこうレビューします
        </h2>
        <p className="text-[15px] text-muted-foreground leading-relaxed mb-12 sm:mb-16 max-w-xl">
          Adjudoは、メモを要約するだけではありません。次の一手を勧める前に、あなたの選択肢を3つの視点でレビューします。
        </p>

        <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border border border-border rounded-2xl overflow-hidden">
          {howSteps.map((step) => (
            <div key={step.n} className="bg-background p-7 sm:p-8 flex flex-col gap-5 min-h-[200px]">
              <span className="block text-[42px] font-black leading-none tracking-tight text-foreground/[0.07] select-none">
                {step.n}
              </span>
              <div>
                <p className="text-[15px] font-bold text-foreground mb-2 leading-snug">{step.title}</p>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[14px] text-muted-foreground leading-relaxed mt-8 max-w-2xl">
          結果として返ってくるのが Decision Checkpoint：次の一手、却下した選択肢、重要な前提、リスク、検証ステップ、そして見直し条件。
        </p>
      </section>

      {/* ── Positioning ─────────────────────────────────────────────────────── */}
      <section
        ref={secWhy.ref as React.RefObject<HTMLElement>}
        style={secWhy.style}
        className="max-w-5xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24"
      >
        <h2
          className="font-black tracking-[-0.025em] leading-[1.3] text-foreground mb-4"
          style={{ fontSize: "clamp(1.55rem, 3.6vw, 2.4rem)" }}
        >
          思考と実装の、あいだのレイヤー。
        </h2>
        <p className="text-[15px] text-muted-foreground leading-relaxed mb-10 max-w-xl">
          ChatGPTは考えるのを助ける。Cursorはつくるのを助ける。Adjudoはその間にある意思決定のレイヤー——動く前の、二つ目の、厳しい視点です。
        </p>
        <PositioningGrid />
      </section>

      {/* ── Use cases ───────────────────────────────────────────────────────── */}
      <section
        ref={secUseCases.ref as React.RefObject<HTMLElement>}
        style={secUseCases.style}
        className="border-t border-border bg-[#F7F7F5]"
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <h2
            className="font-black tracking-[-0.025em] leading-[1.3] text-foreground mb-3"
            style={{ fontSize: "clamp(1.35rem, 2.9vw, 1.9rem)" }}
          >
            ソロビルダーが詰まる、あの意思決定に。
          </h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed mb-8 max-w-lg">
            外したら本当に時間を失う、次の一手に。
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

      {/* ── Decision Checkpoint offer ────────────────────────────────────────── */}
      <section
        ref={secCheckpoint.ref as React.RefObject<HTMLElement>}
        style={secCheckpoint.style}
        className="border-t border-border"
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <div className="mb-12">
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-4">
              オファー · {priceLabel}
            </p>
            <h2
              className="font-black tracking-[-0.025em] leading-[1.3] text-foreground mb-5 max-w-xl"
              style={{ fontSize: "clamp(1.55rem, 3.6vw, 2.4rem)" }}
            >
              また一から、AIに聞き直す前に。
            </h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
              散らかったアイデア・AI出力・選択肢を送る。構造化されたDecision Checkpointが返ってきます。
            </p>
          </div>

          <figure className="mb-10 max-w-4xl rounded-2xl border border-border overflow-hidden bg-[#F7F7F5]">
            <img
              src="/decision-checkpoint.svg"
              alt="散らかった入力が、構造化されたDecision Checkpointに変わる：次の一手、却下した選択肢、リスク、検証"
              className="w-full h-auto block"
            />
          </figure>

          <div className="grid sm:grid-cols-2 gap-8 max-w-4xl">
            {/* What's included */}
            <div className="rounded-2xl border border-border bg-[#F7F7F5] p-7">
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-4">
                受け取れるもの
              </p>
              <ul className="space-y-3">
                {[
                  "次に取るべき一手",
                  "却下した選択肢",
                  "重要な前提",
                  "反論 / リスク",
                  "検証ステップ",
                  `次のアクション（${deliveryLabel}）`,
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px] text-foreground/80">
                    <span className="shrink-0 mt-0.5 text-foreground/30 text-xs font-bold">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust notes + CTAs */}
            <div className="flex flex-col justify-between gap-6">
              <ul className="space-y-2">
                {[
                  "有料ベータ",
                  "複数視点レビュー",
                  "アカウント不要",
                  "メモは非公開",
                ].map((note) => (
                  <li key={note} className="flex items-start gap-2 text-[12px] text-muted-foreground leading-relaxed">
                    <span className="shrink-0 mt-0.5 text-foreground/25 text-xs">✓</span>
                    {note}
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                <a
                  href={checkpointCtaUrl}
                  target={ctaExternal ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-85 active:scale-[0.97] transition-all duration-150"
                >
                  あなたの意思決定を送る <ArrowRightIcon size={14} />
                </a>
                <Link href="/sample-decision-checkpoint">
                  <button className="flex items-center justify-center gap-1.5 w-full px-5 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-full bg-transparent hover:text-foreground hover:border-foreground/30 active:scale-[0.97] transition-all duration-150">
                    サンプルを見る
                  </button>
                </Link>
                <p className="text-[11px] text-muted-foreground/50 text-center leading-relaxed">
                  相性が良ければ、決済リンクをお送りします。
                  お支払い後、{deliveryLabel}にDecision Checkpointをお届けします。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Who this is for + Not for ─────────────────────────────────────────── */}
      <section
        ref={secWho.ref as React.RefObject<HTMLElement>}
        style={secWho.style}
        className="border-t border-border bg-[#F7F7F5]"
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="grid sm:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-4">
                こんな人のために
              </p>
              <h3
                className="font-black tracking-[-0.025em] leading-[1.3] text-foreground mb-4"
                style={{ fontSize: "clamp(1.25rem, 2.7vw, 1.7rem)" }}
              >
                一人でつくり、次の一手を選ぶ人へ。
              </h3>
              <ul className="space-y-2">
                {[
                  "どの機能を優先するか選ぶ",
                  "どの顧客セグメントを試すか選ぶ",
                  "どのマーケティングメッセージを使うか選ぶ",
                  "あるアイデアを続けるか、保留するか、却下するか決める",
                  "散らかったAIの出力を、より明確な次の一手に変える",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px] text-foreground/80">
                    <span className="shrink-0 mt-0.5 text-foreground/30 text-xs font-bold">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-4">
                向いていない場合
              </p>
              <h3
                className="font-black tracking-[-0.025em] leading-[1.3] text-foreground mb-4"
                style={{ fontSize: "clamp(1.25rem, 2.7vw, 1.7rem)" }}
              >
                すでに何をすべきか分かっているなら、たぶん不要。
              </h3>
              <ul className="space-y-2">
                {[
                  "一般的な文書の要約",
                  "タスク管理",
                  "チームでの共同作業",
                  "法律・医療・金融のアドバイス",
                  "共有できる文脈が十分にない意思決定",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                    <span className="shrink-0 mt-0.5 text-foreground/20 text-xs font-bold">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section
        ref={secFaq.ref as React.RefObject<HTMLElement>}
        style={secFaq.style}
        className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-20"
      >
        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-4">
          FAQ
        </p>
        <h2
          className="font-black tracking-[-0.025em] leading-[1.3] text-foreground mb-10"
          style={{ fontSize: "clamp(1.35rem, 2.9vw, 1.9rem)" }}
        >
          よくある質問
        </h2>
        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl">
          {[
            {
              q: "これはただのAIの生成物では？",
              a: "AIが生成しますが、1回の出力ではなく Builder・Skeptic・Operator の3視点を通し、Decision Checkpointの形に整えます。ベータ期間中は、各提出の相性を人が確認し、手作業でお届けします。",
            },
            {
              q: "これはただのChatGPTでは？",
              a: "発想出しはChatGPTでできます。Adjudoは、行動する前に特定の意思決定を——次の一手、却下した選択肢、前提、リスク、検証ステップ——1回の出力ではなく3つの視点でレビューします。",
            },
            {
              q: "アカウントは必要ですか？",
              a: "不要です。受付フォームから送ってください。相性が良ければ、決済リンクを手作業でお送りします。",
            },
            {
              q: "送ったあと、どうなりますか？",
              a: `内容を確認します。相性が良ければ決済リンクをお送りし、お支払い後に${deliveryLabel}でDecision Checkpointをお届けします。`,
            },
            {
              q: "これは完成したSaaSですか？",
              a: "まだです。Adjudoは有料ベータで、需要を検証している間は手作業でお届けしています。",
            },
            {
              q: "相性が良くない場合は？",
              a: "お断りするか、より良い問いの立て方をご提案することがあります。有益なレビューを提供できると判断できない限り、お支払いはお願いしません。",
            },
          ].map(({ q, a }) => (
            <div key={q}>
              <p className="text-[14px] font-semibold text-foreground mb-1.5 leading-snug">{q}</p>
              <p className="text-[13px] text-muted-foreground leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Fallback contact (#checkpoint-contact) ──────────────────────────── */}
      <section id="checkpoint-contact" className="border-t border-border bg-[#F7F7F5]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-18">
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-4">
            Decision Checkpoint
          </p>
          <h2
            className="font-black tracking-[-0.025em] leading-[1.3] text-foreground mb-4"
            style={{ fontSize: "clamp(1.4rem, 3.3vw, 2.1rem)" }}
          >
            Decision Checkpointが欲しいですか？
          </h2>
          <p className="text-[15px] text-muted-foreground mb-6 max-w-md leading-relaxed">
            受付フォームから実際の意思決定を送ってください。もしくは、直接ご連絡を。
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={checkpointCtaUrl}
              target={ctaExternal ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-foreground text-background font-semibold rounded-full px-5 py-2.5 text-sm whitespace-nowrap hover:opacity-85 active:scale-[0.97] transition-all duration-150"
            >
              あなたの意思決定を送る <ArrowRightIcon size={13} />
            </a>
            <a
              href={`mailto:${checkpointEmail}`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-full bg-transparent whitespace-nowrap hover:text-foreground hover:border-foreground/30 active:scale-[0.97] transition-all duration-150"
            >
              {checkpointEmail}
            </a>
          </div>
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
            className="font-black tracking-[-0.03em] leading-[1.2] text-foreground mb-4 max-w-lg"
            style={{ fontSize: "clamp(1.8rem, 4.5vw, 3rem)" }}
          >
            次の一手を、選ぶ。
          </h2>
          <p className="text-[15px] text-muted-foreground mb-8">
            本物の意思決定をひとつ送ってください。{deliveryLabel}にDecision Checkpointが届きます。
          </p>
          {user ? (
            <Link href="/rooms">
              <PrimaryBtn large>アプリを開く <ArrowRightIcon size={14} /></PrimaryBtn>
            </Link>
          ) : (
            <CheckpointActions url={checkpointCtaUrl} external={ctaExternal} large />
          )}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card/40">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoA} alt="Adjudo" className="h-5 w-auto opacity-50 dark:invert" />
            <span className="text-[11px] text-muted-foreground/40">© 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-muted-foreground/40 hidden sm:inline">
              一人でつくる人のための意思決定サポート
            </span>
            <a
              href={`mailto:${checkpointEmail}`}
              className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            >
              {checkpointEmail}
            </a>
            <Link href="/">
              <span className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer">
                English
              </span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

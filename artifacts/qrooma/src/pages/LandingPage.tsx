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
        Submit your decision <ArrowRightIcon size={14} />
      </a>
      <Link href="/sample-decision-checkpoint">
        <button className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-full bg-transparent whitespace-nowrap hover:text-foreground hover:border-foreground/30 active:scale-[0.97] transition-all duration-150">
          See a sample
        </button>
      </Link>
    </div>
  );
}

// ─── Positioning grid ─────────────────────────────────────────────────────────
function PositioningGrid() {
  const rows = [
    { category: "Thinking",  tools: "ChatGPT, Claude, Gemini",              role: "Generate ideas",                    here: false },
    { category: "Deciding",  tools: "Adjudo",                               role: "Compare, pressure-test, decide",    here: true  },
    { category: "Building",  tools: "Manus, Replit, Cursor, Claude Code",   role: "Implement and build",               here: false },
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
              <span className="ml-2 text-[10px] font-bold uppercase tracking-widest opacity-50">← you are here</span>
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

// ─── Main Landing Page (English) ──────────────────────────────────────────────
export default function LandingPage() {
  const { user } = useAuth();
  const { setLocale } = useLocale();
  useEffect(() => { setLocale("en"); }, []);

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

  // Decision Checkpoint env vars — safe defaults throughout
  const checkpointIntakeRaw = (import.meta.env.VITE_CHECKPOINT_INTAKE_URL     as string | undefined)?.trim() ?? "";
  const checkpointEmail     = (import.meta.env.VITE_SUPPORT_EMAIL             as string | undefined)?.trim() || "hello@adjudo.com";
  const priceLabel          = (import.meta.env.VITE_CHECKPOINT_PRICE_LABEL    as string | undefined)?.trim() || "$9 paid beta";
  const deliveryLabel       = (import.meta.env.VITE_CHECKPOINT_DELIVERY_LABEL as string | undefined)?.trim() || "within 48 hours after payment";
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
      body:  "Finds the strongest case for each option.",
    },
    {
      n: "02",
      title: "Skeptic",
      body:  "Surfaces hidden assumptions, objections, risks, and failure conditions.",
    },
    {
      n: "03",
      title: "Operator",
      body:  "Turns the decision into validation steps and a concrete next action.",
    },
  ];

  const useCases = [
    "Feature priority",
    "Customer segment",
    "Marketing message",
    "MVP scope",
    "Pricing & plans",
    "Build vs. buy",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
          <Link href="/">
            <img src={logoA} alt="Adjudo" className="w-[105px] sm:w-[140px] h-auto hover:opacity-70 transition-opacity duration-150 dark:invert" />
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/jp">
              <button className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-full border border-border/60 hover:border-border transition-all duration-150">
                日本語
              </button>
            </Link>
            {user ? (
              <Link href="/rooms">
                <PrimaryBtn>Open app</PrimaryBtn>
              </Link>
            ) : (
              <a
                href={checkpointCtaUrl}
                target={ctaExternal ? "_blank" : undefined}
                rel="noopener noreferrer"
              >
                <PrimaryBtn>Submit your decision</PrimaryBtn>
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
            className="animate-fade-up anim-d1 font-black tracking-[-0.03em] leading-[1.02] text-foreground mb-6"
            style={{ fontSize: "clamp(2.6rem, 6.5vw, 4.5rem)" }}
          >
            <span className="block">AI gave you 10 ideas.</span>
            <span className="block">Now choose the next move.</span>
          </h1>

          <p className="animate-fade-up anim-d2 text-[17px] sm:text-lg text-muted-foreground leading-[1.75] max-w-xl mb-10">
            A multi-perspective Decision Checkpoint for people building alone. Your options, reviewed through Builder, Skeptic, and Operator perspectives — so you choose the next move before wasting a week.
          </p>

          <div className="animate-fade-up anim-d3">
            {user ? (
              <Link href="/rooms">
                <PrimaryBtn large>Open app <ArrowRightIcon size={14} /></PrimaryBtn>
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
            The problem
          </p>
          <h2
            className="font-black tracking-[-0.025em] leading-[1.1] text-foreground"
            style={{ fontSize: "clamp(1.65rem, 3.8vw, 2.5rem)" }}
          >
            AI can help you think.<br />That doesn't mean you've decided.
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
          className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-4"
          style={{ fontSize: "clamp(1.65rem, 3.8vw, 2.5rem)" }}
        >
          How Adjudo reviews your decision
        </h2>
        <p className="text-[15px] text-muted-foreground leading-relaxed mb-12 sm:mb-16 max-w-xl">
          Adjudo doesn't just summarize your notes. It reviews your options from three perspectives before recommending the next move.
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
          The result is a Decision Checkpoint: a recommended next move, rejected options, key assumptions, risks, validation steps, and revisit criteria.
        </p>
      </section>

      {/* ── Positioning ─────────────────────────────────────────────────────── */}
      <section
        ref={secWhy.ref as React.RefObject<HTMLElement>}
        style={secWhy.style}
        className="max-w-5xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24"
      >
        <h2
          className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-4"
          style={{ fontSize: "clamp(1.65rem, 3.8vw, 2.5rem)" }}
        >
          The layer between thinking and building.
        </h2>
        <p className="text-[15px] text-muted-foreground leading-relaxed mb-10 max-w-xl">
          ChatGPT helps you think. Cursor helps you build. Adjudo is the decision layer in between — the second, harder look before you act.
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
            className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-3"
            style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}
          >
            The decisions solo builders get stuck on.
          </h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed mb-8 max-w-lg">
            Any next move where being wrong costs you real time.
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
              The offer · {priceLabel}
            </p>
            <h2
              className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-5 max-w-xl"
              style={{ fontSize: "clamp(1.65rem, 3.8vw, 2.5rem)" }}
            >
              Not ready for another AI chat?
            </h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl">
              Send your messy ideas, AI outputs, or options. Get back a structured Decision Checkpoint.
            </p>
          </div>

          <figure className="mb-10 max-w-4xl rounded-2xl border border-border overflow-hidden bg-[#F7F7F5]">
            <img
              src="/decision-checkpoint.svg"
              alt="Messy input becomes a structured Decision Checkpoint: next move, rejected options, risk, and validation"
              className="w-full h-auto block"
            />
          </figure>

          <div className="grid sm:grid-cols-2 gap-8 max-w-4xl">
            {/* What's included */}
            <div className="rounded-2xl border border-border bg-[#F7F7F5] p-7">
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-4">
                What you receive
              </p>
              <ul className="space-y-3">
                {[
                  "Recommended next move",
                  "Rejected options",
                  "Key assumptions",
                  "Objections / risks",
                  "Validation steps",
                  `Next action ${deliveryLabel}`,
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
                  "Paid beta",
                  "Multi-perspective review",
                  "No account required",
                  "Your notes stay private",
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
                  Submit your decision <ArrowRightIcon size={14} />
                </a>
                <Link href="/sample-decision-checkpoint">
                  <button className="flex items-center justify-center gap-1.5 w-full px-5 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-full bg-transparent hover:text-foreground hover:border-foreground/30 active:scale-[0.97] transition-all duration-150">
                    See a sample
                  </button>
                </Link>
                <p className="text-[11px] text-muted-foreground/50 text-center leading-relaxed">
                  If your decision is a good fit, we'll send you a payment link.
                  After payment, you'll receive your Decision Checkpoint {deliveryLabel}.
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
                Who this is for
              </p>
              <h3
                className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-4"
                style={{ fontSize: "clamp(1.3rem, 2.8vw, 1.8rem)" }}
              >
                People building alone, choosing their next move.
              </h3>
              <ul className="space-y-2">
                {[
                  "Choosing which feature to prioritize",
                  "Choosing which customer segment to test",
                  "Choosing which marketing message to use",
                  "Deciding whether to continue, pause, or reject an idea",
                  "Turning messy AI outputs into a clearer next move",
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
                Not for
              </p>
              <h3
                className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-4"
                style={{ fontSize: "clamp(1.3rem, 2.8vw, 1.8rem)" }}
              >
                Probably not useful if you already know what to do.
              </h3>
              <ul className="space-y-2">
                {[
                  "Generic document summaries",
                  "Task management",
                  "Team collaboration",
                  "Legal, medical, or financial advice",
                  "Decisions where you can't share enough context",
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
          className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-10"
          style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}
        >
          Common questions
        </h2>
        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl">
          {[
            {
              q: "Is this just raw AI output?",
              a: "It's AI-generated, but run through three perspectives — Builder, Skeptic, Operator — instead of a single pass, then shaped into a Decision Checkpoint. In this beta we review each submission for fit and deliver it manually.",
            },
            {
              q: "Is this just ChatGPT?",
              a: "You can brainstorm in ChatGPT. Adjudo reviews one specific decision before you act — next move, rejected options, assumptions, risks, and validation steps — structured through three perspectives rather than one pass.",
            },
            {
              q: "Do I need an account?",
              a: "No. Submit through the intake form. If it's a good fit, we'll send a payment link manually.",
            },
            {
              q: "What happens after I submit?",
              a: `We review it. If it's a good fit, we send a payment link, and you receive your Decision Checkpoint ${deliveryLabel} after payment.`,
            },
            {
              q: "Is this a full SaaS product?",
              a: "Not yet. Adjudo is in paid beta, delivered manually while we validate demand.",
            },
            {
              q: "What if my decision isn't a good fit?",
              a: "We may decline or suggest a better framing. You won't be asked to pay unless we can give you a useful review.",
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
            className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-4"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}
          >
            Want a Decision Checkpoint?
          </h2>
          <p className="text-[15px] text-muted-foreground mb-6 max-w-md leading-relaxed">
            Submit your real decision through the intake form, or contact us directly.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={checkpointCtaUrl}
              target={ctaExternal ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-foreground text-background font-semibold rounded-full px-5 py-2.5 text-sm whitespace-nowrap hover:opacity-85 active:scale-[0.97] transition-all duration-150"
            >
              Submit your decision <ArrowRightIcon size={13} />
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
            className="font-black tracking-[-0.03em] leading-[1.05] text-foreground mb-4 max-w-lg"
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
          >
            Choose your next move.
          </h2>
          <p className="text-[15px] text-muted-foreground mb-8">
            Send one real decision. Get a Decision Checkpoint {deliveryLabel}.
          </p>
          {user ? (
            <Link href="/rooms">
              <PrimaryBtn large>Open app <ArrowRightIcon size={14} /></PrimaryBtn>
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
              Decision support for solo builders
            </span>
            <a
              href={`mailto:${checkpointEmail}`}
              className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            >
              {checkpointEmail}
            </a>
            <Link href="/jp">
              <span className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer">
                日本語
              </span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

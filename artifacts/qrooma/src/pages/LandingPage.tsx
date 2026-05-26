import { useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useLocale } from "../context/LocaleContext";
import { ArrowRightIcon } from "lucide-react";
const logoA = "/brand/adjudo-wordmark.png";
const logoB = "/brand/adjudo-symbol.png";

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

function GhostBtn({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-full bg-transparent whitespace-nowrap hover:text-foreground hover:border-foreground/30 active:scale-[0.97] transition-all duration-150">
      {children}
    </button>
  );
}

function WaitlistHeroForm() {
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
      if (d.status === "joined")          setStatus("success");
      else if (d.status === "already_joined") setStatus("already");
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
            ? "You're already on the waitlist — we'll reach out soon."
            : "You're on the waitlist. We'll let you know when Adjudo is ready."}
        </p>
        <Link href="/feedback">
          <GhostBtn>View feedback board <ArrowRightIcon size={13} /></GhostBtn>
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
        {status === "loading" ? "Joining…" : "Join waitlist"}
        {status !== "loading" && <ArrowRightIcon size={14} />}
      </PrimaryBtn>
      <Link href="/feedback">
        <GhostBtn>View feedback board</GhostBtn>
      </Link>
      {status === "error" && (
        <span className="text-[12px] text-red-500 w-full sm:w-auto">Something went wrong — please try again.</span>
      )}
    </form>
  );
}

// ─── Decision Memo Preview Card ───────────────────────────────────────────────
function DecisionMemoPreview() {
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
            Topic
          </p>
          <p className="text-sm font-semibold text-foreground leading-snug">
            Which features go into the MVP?
          </p>
        </div>

        {/* Decision */}
        <div className="border border-foreground/10 rounded-xl px-4 py-3 bg-background">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-1.5">
            Decision
          </p>
          <p className="text-[13px] text-foreground leading-relaxed font-medium">
            Ship auth + core loop only. No team features in v1.
          </p>
        </div>

        {/* Scope classification */}
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label:  "Do now",
              symbol: "✓",
              dark:   true,
              items:  ["Auth flow", "Core loop", "Analytics events"],
            },
            {
              label:  "Not now",
              symbol: "✗",
              dark:   false,
              items:  ["Team workspaces", "Advanced filters", "Custom themes"],
            },
            {
              label:  "Consider later",
              symbol: "○",
              dark:   false,
              items:  ["AI suggestions", "API access"],
            },
            {
              label:  "Need more info",
              symbol: "?",
              dark:   false,
              items:  ["Pricing model validation"],
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
            Next actions
          </p>
          <ul className="space-y-1">
            {[
              "Start design with auth flow",
              "Plan user test for core loop",
              "Add team features to v2 backlog",
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

// ─── Positioning grid ─────────────────────────────────────────────────────────
function PositioningGrid() {
  const rows = [
    {
      category: "Thinking",
      tools:    "ChatGPT, Claude, Gemini",
      role:     "Generate ideas",
      here:     false,
    },
    {
      category: "Deciding",
      tools:    "Adjudo",
      role:     "Compare, pressure-test, structure",
      here:     true,
    },
    {
      category: "Building",
      tools:    "Manus, Replit, Cursor, Claude Code",
      role:     "Implement and build",
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
                ← you are here
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

// ─── Main Landing Page (English) ──────────────────────────────────────────────
export default function LandingPage() {
  const { user } = useAuth();
  const { setLocale } = useLocale();
  useEffect(() => { setLocale("en"); }, []);

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
      title: "Compare options",
      body:  "Surface multiple choices with pros, cons, and fit conditions — so every decision has a real foundation.",
    },
    {
      n: "02",
      title: "Challenge assumptions",
      body:  "AI roles pressure-test your reasoning, surface blind spots, and break down beliefs you didn't know you were holding.",
    },
    {
      n: "03",
      title: "Structure the decision",
      body:  "Classify what to do now, not now, later, or investigate further — with reasoning and background attached.",
    },
    {
      n: "04",
      title: "Hand off to execution",
      body:  "Export a Decision Memo or Build Prompt ready for ChatGPT, Manus, Replit, Cursor, or Claude Code.",
    },
  ];

  const useCases = [
    "MVP scope",
    "Feature priority",
    "Pricing & plans",
    "LP messaging",
    "Implementation direction",
    "Build vs. buy",
  ];

  const freeFeatures = [
    "Builder / Breaker / Operator AI roles",
    "Decision Memo output",
    "Scope classification (Do now / Not now / Later / Need more info)",
    "3 discussions/day · No API keys required",
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
              <>
                <Link href="/login">
                  <button className="hidden sm:inline-block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">
                    Log in
                  </button>
                </Link>
                <Link href="/waitlist">
                  <PrimaryBtn>Join waitlist</PrimaryBtn>
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
            className="animate-fade-up anim-d1 font-black tracking-[-0.03em] leading-[1.02] text-foreground mb-6"
            style={{ fontSize: "clamp(2.6rem, 6.5vw, 4.5rem)" }}
          >
            <span className="block">Turn messy thinking</span>
            <span className="block">into clear decisions.</span>
          </h1>

          <p className="animate-fade-up anim-d2 text-[17px] sm:text-lg text-muted-foreground leading-[1.75] max-w-xl mb-10">
            Built for solo founders and product-minded builders. Compare options, pressure-test assumptions, decide what to do now — and hand off a structured memo to your execution tools.
          </p>

          <div className="animate-fade-up anim-d3">
            {user ? (
              <div className="flex items-center gap-3 flex-wrap">
                <Link href="/rooms">
                  <PrimaryBtn large>Open app <ArrowRightIcon size={14} /></PrimaryBtn>
                </Link>
              </div>
            ) : (
              <WaitlistHeroForm />
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
            className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-12 sm:mb-14"
            style={{ fontSize: "clamp(1.65rem, 3.8vw, 2.5rem)" }}
          >
            AI can help you think.<br />That doesn't mean you've decided.
          </h2>

          <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border border border-border rounded-2xl overflow-hidden">
            {[
              {
                title: "The one-AI loop",
                body:  "Going back and forth with a single AI narrows your perspective. Ideas emerge, but without comparison or pressure-testing, decision quality stalls.",
              },
              {
                title: "Exploration without landing",
                body:  "You list the options. You still don't know which one to pick. The discussion ends without a clear decision.",
              },
              {
                title: "Vague handoff to execution",
                body:  "You know what you want to build, but can't tell ChatGPT or Cursor exactly what to do. The decision wasn't structured.",
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
          Compare. Challenge. Decide. Hand off.
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
                Output
              </p>
              <h2
                className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-5"
                style={{ fontSize: "clamp(1.65rem, 3.4vw, 2.3rem)" }}
              >
                Every decision becomes a memo.
              </h2>
              <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
                Structured output ready to hand off to ChatGPT, Claude, Manus, Replit, or Cursor.
              </p>

              <div className="space-y-2">
                {[
                  ["Decision Memo",   "Decision, background, reasoning, scope classification, next actions"],
                  ["Task List",       "Immediately actionable task list"],
                  ["Generic Prompt",  "Prompt ready for any AI tool"],
                  ["Build Prompt",    "Structured prompt for execution tools"],
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
            <DecisionMemoPreview />
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
          className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-4"
          style={{ fontSize: "clamp(1.65rem, 3.8vw, 2.5rem)" }}
        >
          The layer between thinking and execution.
        </h2>
        <p className="text-[15px] text-muted-foreground leading-relaxed mb-10 max-w-xl">
          Adjudo isn't another chatbot, a PM tool, or a meeting summarizer. It's the decision layer that sits before you build.
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
            Built for the decisions that move products forward.
          </h2>
          <p className="text-[14px] text-muted-foreground leading-relaxed mb-8 max-w-lg">
            MVP scope, feature priority, pricing, LP messaging, implementation direction, build vs. buy — any decision that needs structure.
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
              <span className="text-sm text-muted-foreground">/ Start free</span>
            </div>
            <p className="text-[14px] text-muted-foreground mb-5 leading-relaxed">
              Try it now without any API keys. Full Decision Room experience, no setup required.
            </p>
            <ul className="space-y-2.5 mb-6">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13px] text-foreground/80">
                  <span className="shrink-0 mt-0.5 text-foreground/40 text-xs font-bold">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/waitlist">
              <PrimaryBtn>Join waitlist <ArrowRightIcon size={13} /></PrimaryBtn>
            </Link>
          </div>

          {/* BYOK note */}
          <div className="sm:max-w-[260px] rounded-2xl border border-border bg-card p-5">
            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/50 mb-3">
              BYOK
            </p>
            <p className="text-[13px] text-foreground/80 leading-relaxed">
              Bring your own OpenAI, Anthropic, or Google API keys. Available with the Connect plan — coming soon.
            </p>
            <p className="mt-2 text-[12px] text-muted-foreground/60">
              Try free in the meantime
            </p>
          </div>
        </div>
      </section>

      {/* ── Help shape Adjudo ───────────────────────────────────────────────── */}
      <section className="border-t border-border bg-[#F7F7F5]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-4">
            Shape the product
          </p>
          <h2
            className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-3"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}
          >
            Help shape Adjudo
          </h2>
          <p className="text-[15px] text-muted-foreground mb-6 max-w-md leading-relaxed">
            Vote on what we should build next, or suggest a feature that would make Adjudo more useful for you.
          </p>
          <Link href="/feedback">
            <GhostBtn>View feedback board <ArrowRightIcon size={13} /></GhostBtn>
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
            className="font-black tracking-[-0.03em] leading-[1.05] text-foreground mb-4 max-w-lg"
            style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
          >
            Be the first to use Adjudo.
          </h2>
          <p className="text-[15px] text-muted-foreground mb-8">
            Join the waitlist and help shape what we build next.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {user ? (
              <Link href="/rooms">
                <PrimaryBtn large>Open app <ArrowRightIcon size={14} /></PrimaryBtn>
              </Link>
            ) : (
              <>
                <Link href="/waitlist">
                  <PrimaryBtn large>Join waitlist <ArrowRightIcon size={14} /></PrimaryBtn>
                </Link>
                <Link href="/feedback">
                  <GhostBtn>View feedback board</GhostBtn>
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
            <span className="text-[11px] text-muted-foreground/40">© 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-muted-foreground/40 hidden sm:inline">
              The layer between thinking and execution
            </span>
            <a
              href="mailto:hello@adjudo.com"
              className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            >
              hello@adjudo.com
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

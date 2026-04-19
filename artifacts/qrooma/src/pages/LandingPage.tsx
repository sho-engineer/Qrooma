import { useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import { useLocale, type Locale } from "../context/LocaleContext";
import { useAuth } from "../context/AuthContext";
import { ArrowRightIcon, CheckIcon } from "lucide-react";

// ─── useFadeSection — scroll-triggered fade-up ────────────────────────────────
function useFadeSection() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -32px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return {
    ref,
    style: {
      transition: "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(10px)",
    } as React.CSSProperties,
  };
}

// ─── LocaleToggle ─────────────────────────────────────────────────────────────
function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex gap-1 rounded-full border border-border bg-card/70 p-1 backdrop-blur">
      {(["ja", "en"] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-3 py-1.5 text-xs rounded-full transition-all duration-200 active:scale-[0.95] ${
            locale === l
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          {l === "ja" ? "日本語" : "EN"}
        </button>
      ))}
    </div>
  );
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
      {children}
    </h2>
  );
}

// ─── ProductPreview ───────────────────────────────────────────────────────────
const AGENT_COLORS = ["#10a37f", "#d97706", "#4285f4"] as const;

function ProductPreview() {
  const { t } = useLocale();

  const previewMessages = [
    { role: t.previewRole1, color: AGENT_COLORS[0], text: t.previewMsg1 },
    { role: t.previewRole2, color: AGENT_COLORS[1], text: t.previewMsg2 },
    { role: t.previewRole3, color: AGENT_COLORS[2], text: t.previewMsg3 },
  ];

  const previewRooms = [
    { name: t.previewRoomActive, active: true },
    { name: t.previewRoom2,      active: false },
    { name: t.previewRoom3,      active: false },
  ];

  return (
    <div className="rounded-[28px] border border-border bg-card/90 shadow-[0_12px_48px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Window chrome */}
      <div className="border-b border-border/80 px-5 py-3 flex items-center gap-2 bg-card">
        <div className="w-2.5 h-2.5 rounded-full bg-foreground/15" />
        <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
        <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
        <span className="ml-3 text-xs text-muted-foreground/60 font-medium">Qrooma</span>
      </div>

      <div className="grid md:grid-cols-[200px_1fr]" style={{ minHeight: 380 }}>
        {/* Sidebar */}
        <div className="hidden md:flex flex-col border-r border-border bg-sidebar">
          <div className="px-3 pt-3 pb-1">
            <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest px-2 py-1">
              {t.previewRooms}
            </p>
          </div>
          <nav className="flex-1 px-1.5 space-y-0.5">
            {previewRooms.map((room) => (
              <div
                key={room.name}
                className={`px-2.5 py-1.5 rounded-lg text-xs truncate transition-colors duration-150 ${
                  room.active
                    ? "bg-sidebar-accent text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {room.name}
              </div>
            ))}
          </nav>
        </div>

        {/* Main pane */}
        <div className="flex flex-col min-h-0 overflow-hidden">
          {/* Room header */}
          <div className="border-b border-border px-4 py-2.5 flex items-center gap-3 bg-card/60 min-w-0">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-foreground truncate">{t.previewRoomActive}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{t.previewMeta}</p>
            </div>
            <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
              {t.structuredDebate}
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 px-4 py-4 space-y-3 bg-background/40 overflow-hidden">
            {previewMessages.map((msg) => (
              <div key={msg.role} className="flex gap-2.5 max-w-[92%]">
                <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: msg.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1">{msg.role}</p>
                  <div className="bg-card border border-border/60 rounded-xl px-3 py-2">
                    <p className="text-[11px] text-foreground leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Conclusion */}
          <div className="border-t border-border bg-card/80 px-4 py-3 overflow-hidden">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-muted-foreground/40 text-sm leading-none shrink-0">◈</span>
              <span className="text-xs font-semibold text-foreground">{t.conclusion}</span>
            </div>
            <p className="text-[11px] text-foreground/70 leading-relaxed pl-4">
              {t.previewConclusionText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PricingSection ───────────────────────────────────────────────────────────
function PricingSection() {
  const { t } = useLocale();

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "",
      desc: t.planFreeDesc,
      features: [t.planFreeFeature1, t.planFreeFeature2, t.planFreeFeature3, t.planFreeFeature4],
      cta: t.planFreeCta,
      href: "/signup",
      badge: null,
      highlight: false,
      note: t.pricingFreeLimit,
    },
    {
      name: "Connect",
      price: "$9",
      period: "/ mo",
      desc: t.planConnectDesc,
      features: [t.planConnectFeature1, t.planConnectFeature2, t.planConnectFeature3, t.planConnectFeature4],
      cta: t.planConnectCta,
      href: "/signup",
      badge: t.planConnectBadge,
      highlight: true,
      note: null,
    },
    {
      name: "Pro",
      price: "$20",
      period: "/ mo",
      desc: t.planProDesc,
      features: [t.planProFeature1, t.planProFeature2, t.planProFeature3, t.planProFeature4],
      cta: t.planProCta,
      href: "/signup",
      badge: null,
      highlight: false,
      note: null,
    },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`rounded-[20px] border p-6 flex flex-col transition-all duration-200
            ${plan.highlight
              ? "border-foreground/15 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_28px_rgba(0,0,0,0.08)]"
              : "border-border bg-background hover:border-foreground/10 hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
            }`}
        >
          {/* Plan name + badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[11px] font-semibold tracking-widest uppercase
              ${plan.highlight ? "text-foreground" : "text-muted-foreground/70"}`}>
              {plan.name}
            </span>
            {plan.badge && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-foreground text-background leading-none">
                {plan.badge}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-bold tracking-tight text-foreground">{plan.price}</span>
            {plan.period && (
              <span className="text-xs text-muted-foreground">{plan.period}</span>
            )}
          </div>

          {/* Desc */}
          <p className="text-xs text-muted-foreground leading-relaxed mb-5">{plan.desc}</p>

          {/* Features */}
          <ul className="space-y-2 mb-6 flex-1">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckIcon
                  size={11}
                  className={`shrink-0 mt-[3px] ${plan.highlight ? "text-foreground/50" : "text-muted-foreground/40"}`}
                />
                <span className={`text-xs leading-relaxed ${plan.highlight ? "text-foreground/80" : "text-muted-foreground"}`}>
                  {f}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link href={plan.href}>
            <button
              className={`w-full py-2 text-sm font-medium rounded-full transition-all duration-150 active:scale-[0.97]
                ${plan.highlight
                  ? "bg-foreground text-background hover:opacity-85"
                  : "border border-border bg-transparent text-foreground hover:bg-accent"
                }`}
            >
              {plan.cta}
            </button>
          </Link>

          {/* Free-tier note */}
          {plan.note && (
            <div className="mt-3 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
              <span className="text-amber-500 text-[10px] leading-none">⚠</span>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 text-center">{plan.note}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Primary CTA button ───────────────────────────────────────────────────────
function PrimaryBtn({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <button
      className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-foreground text-background rounded-full
        whitespace-nowrap hover:opacity-85 active:scale-[0.97] transition-all duration-150 ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryBtn({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <button
      className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-foreground border border-border
        rounded-full bg-card/70 whitespace-nowrap hover:bg-accent active:scale-[0.97] transition-all duration-150 ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const { t } = useLocale();
  const { user } = useAuth();

  const cards = [
    { title: t.landingCard1Title, body: t.landingCard1Body },
    { title: t.landingCard2Title, body: t.landingCard2Body },
    { title: t.landingCard3Title, body: t.landingCard3Body },
  ];

  const steps = [t.landingHowStep1, t.landingHowStep2, t.landingHowStep3];
  const stepLabels = [t.landingHowStep1Label, t.landingHowStep2Label, t.landingHowStep3Label];

  // Scroll-triggered sections
  const secCards   = useFadeSection();
  const secHow     = useFadeSection();
  const secModes   = useFadeSection();
  const secPricing = useFadeSection();
  const secFooter  = useFadeSection();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Top-center: soft indigo glow */}
        <div className="absolute left-1/2 top-[-80px] h-[400px] w-[500px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(ellipse, #818cf8 0%, transparent 70%)" }} />
        {/* Right: sky-blue accent */}
        <div className="absolute right-[-4%] top-[10%] h-[280px] w-[280px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(ellipse, #38bdf8 0%, transparent 70%)" }} />
        {/* Left: violet accent */}
        <div className="absolute left-[-2%] top-[30%] h-[240px] w-[240px] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(ellipse, #a78bfa 0%, transparent 70%)" }} />
        {/* Bottom: subtle warm tone */}
        <div className="absolute left-[30%] bottom-[20%] h-[200px] w-[300px] rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(ellipse, #6ee7b7 0%, transparent 70%)" }} />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/">
            <button className="text-sm font-semibold tracking-tight text-foreground transition-opacity duration-150 hover:opacity-70">
              Qrooma
            </button>
          </Link>
          <div className="flex items-center gap-2.5 shrink-0">
            <LocaleToggle />
            {user ? (
              <Link href="/rooms">
                <PrimaryBtn>{t.landingGoToApp}</PrimaryBtn>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <button className="whitespace-nowrap hidden sm:inline-block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground active:scale-[0.97] transition-all duration-150">
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

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 pt-20 sm:pt-28 pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-up inline-flex items-center rounded-full border border-border bg-card/80 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur mb-7 tracking-wide uppercase">
            ChatGPT · Claude · Gemini
          </div>

          <h1 className="animate-fade-up anim-d1 text-5xl sm:text-6xl md:text-[4.25rem] font-bold tracking-tight leading-[1.06] text-foreground whitespace-pre-line mb-5">
            {t.landingHero}
          </h1>

          <p className="animate-fade-up anim-d2 max-w-xl mx-auto text-base sm:text-lg text-muted-foreground leading-8 mb-8">
            {t.landingSubcopy}
          </p>

          <div className="animate-fade-up anim-d3 flex items-center justify-center gap-3 flex-wrap mb-12">
            {user ? (
              <Link href="/rooms">
                <PrimaryBtn>{t.landingGoToApp} <ArrowRightIcon size={13} /></PrimaryBtn>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <PrimaryBtn>{t.landingGetStarted} <ArrowRightIcon size={13} /></PrimaryBtn>
                </Link>
                <Link href="/login">
                  <SecondaryBtn>{t.loginBtn}</SecondaryBtn>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Product preview */}
        <div className="animate-fade-up anim-d4 max-w-4xl mx-auto">
          <ProductPreview />
          <p className="mt-3 text-center text-xs text-muted-foreground/50">
            {t.landingHowTitle}
          </p>
        </div>
      </section>

      {/* Appeal cards */}
      <section
        ref={secCards.ref as React.RefObject<HTMLElement>}
        style={secCards.style}
        className="max-w-6xl mx-auto px-5 sm:px-6 pb-20 sm:pb-24"
      >
        <div className="grid sm:grid-cols-3 gap-3">
          {cards.map((card, i) => (
            <div
              key={i}
              className="rounded-[20px] border border-border bg-card p-6 cursor-default
                transition-all duration-200
                hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-foreground/10"
            >
              <p className="text-sm font-semibold text-foreground leading-snug mb-2">{card.title}</p>
              <p className="text-sm text-muted-foreground leading-7">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        ref={secHow.ref as React.RefObject<HTMLElement>}
        style={secHow.style}
        className="border-t border-border/60 bg-card/50"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-14 sm:py-18">
          <div className="max-w-2xl mb-8">
            <SectionTitle>{t.landingHowTitle}</SectionTitle>
          </div>
          <div className="max-w-lg divide-y divide-border/50">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-5 py-4">
                <span className="shrink-0 text-sm font-bold text-foreground/20 w-4 text-right select-none mt-px">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{step}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{stepLabels[i]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modes */}
      <section
        ref={secModes.ref as React.RefObject<HTMLElement>}
        style={secModes.style}
        className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20"
      >
        <div className="max-w-2xl mb-10">
          <SectionTitle>{t.landingModesTitle}</SectionTitle>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-[20px] border border-border bg-card p-6 transition-all duration-200 hover:border-foreground/15 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
              {t.structuredDebate}
            </p>
            <p className="text-sm text-foreground leading-7">{t.debateDesc}</p>
          </div>
          <div className="rounded-[20px] border border-border bg-card p-6 transition-all duration-200 hover:border-foreground/15 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
              {t.freeTalk}
            </p>
            <p className="text-sm text-foreground leading-7">{t.freeTalkDesc}</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        ref={secPricing.ref as React.RefObject<HTMLElement>}
        style={secPricing.style}
        className="border-t border-border/60 bg-card/50"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="max-w-2xl mb-10">
            <SectionTitle>{t.pricingTitle}</SectionTitle>
            <p className="mt-3 text-sm text-muted-foreground leading-7">{t.pricingSub}</p>
          </div>
          <PricingSection />
        </div>
      </section>

      {/* Footer CTA */}
      <section
        ref={secFooter.ref as React.RefObject<HTMLElement>}
        style={secFooter.style}
        className="border-t border-border/60"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-20 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-7">
            {t.landingFooterCta}
          </h2>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {user ? (
              <Link href="/rooms">
                <PrimaryBtn>{t.landingGoToApp} <ArrowRightIcon size={13} /></PrimaryBtn>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <PrimaryBtn>{t.landingGetStarted} <ArrowRightIcon size={13} /></PrimaryBtn>
                </Link>
                <Link href="/login">
                  <SecondaryBtn>{t.loginBtn}</SecondaryBtn>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/40">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-12 flex items-center justify-between text-[11px] text-muted-foreground/50">
          <span>© 2025 Qrooma</span>
          <span className="hidden sm:inline">BYOK · Async AI Team Room</span>
        </div>
      </footer>
    </div>
  );
}

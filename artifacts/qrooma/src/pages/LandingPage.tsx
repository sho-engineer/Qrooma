import { Link } from "wouter";
import { useLocale, type Locale } from "../context/LocaleContext";
import { useAuth } from "../context/AuthContext";
import {
  MessageSquareIcon,
  LayersIcon,
  BrainIcon,
  KeyIcon,
  CheckIcon,
  ArrowRightIcon,
  ZapIcon,
} from "lucide-react";

function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex gap-1">
      {(["ja", "en"] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
            locale === l
              ? "bg-primary text-primary-foreground border-primary"
              : "text-muted-foreground border-border hover:bg-accent/60"
          }`}
        >
          {l === "ja" ? "日本語" : "EN"}
        </button>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const { t } = useLocale();
  const { user } = useAuth();

  const cards = [
    {
      icon: <BrainIcon size={18} className="text-primary" />,
      title: t.landingCard1Title,
      body: t.landingCard1Body,
    },
    {
      icon: <LayersIcon size={18} className="text-primary" />,
      title: t.landingCard2Title,
      body: t.landingCard2Body,
    },
    {
      icon: <MessageSquareIcon size={18} className="text-primary" />,
      title: t.landingCard3Title,
      body: t.landingCard3Body,
    },
  ];

  const steps = [t.landingHowStep1, t.landingHowStep2, t.landingHowStep3];

  const byokItems = [
    t.landingByokItem1,
    t.landingByokItem2,
    t.landingByokItem3,
    t.landingByokItem4,
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between gap-4">
          <span className="text-sm font-semibold tracking-tight text-foreground">Qrooma</span>
          <div className="flex items-center gap-2 shrink-0">
            <LocaleToggle />
            {user ? (
              <Link href="/rooms">
                <button className="whitespace-nowrap px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
                  {t.landingGoToApp}
                </button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <button className="whitespace-nowrap hidden sm:inline-block px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {t.loginBtn}
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="whitespace-nowrap px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity">
                    {t.landingGetStarted}
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-5 pt-20 pb-20 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-8 rounded-full bg-primary/8 border border-primary/20 text-xs font-medium text-primary">
          <ZapIcon size={11} />
          ChatGPT · Claude · Gemini
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight whitespace-pre-line mb-6">
          {t.landingHero}
        </h1>
        <p className="max-w-xl mx-auto text-base text-muted-foreground leading-relaxed mb-10">
          {t.landingSubcopy}
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {user ? (
            <Link href="/rooms">
              <button className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity shadow-sm">
                {t.landingGoToApp}
                <ArrowRightIcon size={14} />
              </button>
            </Link>
          ) : (
            <>
              <Link href="/signup">
                <button className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity shadow-sm">
                  {t.landingGetStarted}
                  <ArrowRightIcon size={14} />
                </button>
              </Link>
              <Link href="/login">
                <button className="px-6 py-2.5 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-accent/40 transition-colors">
                  {t.loginBtn}
                </button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ── Appeal cards ── */}
      <section className="max-w-4xl mx-auto px-5 pb-20">
        <div className="grid sm:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-6 shadow-xs hover:shadow-sm transition-shadow"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center mb-4">
                {card.icon}
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug mb-2">
                {card.title}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-5 py-20">
          <h2 className="text-xl font-semibold text-foreground text-center mb-12">
            {t.landingHowTitle}
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-0">
            {steps.map((step, i) => (
              <div key={i} className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-3 flex-1 relative">
                {/* Connector line (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute left-1/2 top-5 w-full h-px bg-border" />
                )}
                <div className="relative z-10 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
                  {i + 1}
                </div>
                <p className="sm:text-center text-sm text-foreground font-medium">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modes ── */}
      <section className="max-w-4xl mx-auto px-5 py-20">
        <h2 className="text-xl font-semibold text-foreground text-center mb-10">
          {t.landingModesTitle}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {t.structuredDebate}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t.debateDesc}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                {t.freeTalk}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t.freeTalkDesc}</p>
          </div>
        </div>
      </section>

      {/* ── BYOK ── */}
      <section className="border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-5 py-20">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-2.5 mb-2">
              <KeyIcon size={16} className="text-primary" />
              <h2 className="text-xl font-semibold text-foreground">{t.landingByokTitle}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">{t.landingByokLead}</p>
            <ul className="space-y-3">
              {byokItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckIcon size={10} className="text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="border-t border-border">
        <div className="max-w-4xl mx-auto px-5 py-20 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-6">{t.landingFooterCta}</h2>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {user ? (
              <Link href="/rooms">
                <button className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity shadow-sm">
                  {t.landingGoToApp}
                  <ArrowRightIcon size={14} />
                </button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <button className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity shadow-sm">
                    {t.landingGetStarted}
                    <ArrowRightIcon size={14} />
                  </button>
                </Link>
                <Link href="/login">
                  <button className="px-6 py-2.5 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-accent/40 transition-colors">
                    {t.loginBtn}
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-5 h-12 flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2025 Qrooma</span>
          <span>BYOK · Async AI Team Room</span>
        </div>
      </footer>
    </div>
  );
}

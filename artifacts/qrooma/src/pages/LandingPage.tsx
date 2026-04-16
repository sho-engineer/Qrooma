import { Link } from "wouter";
import { useLocale, type Locale } from "../context/LocaleContext";
import { useAuth } from "../context/AuthContext";
import { ArrowRightIcon, CheckIcon } from "lucide-react";

function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex gap-1">
      {(["ja", "en"] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
            locale === l
              ? "bg-foreground text-background border-foreground"
              : "text-muted-foreground border-border hover:bg-accent"
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
      title: t.landingCard1Title,
      body: t.landingCard1Body,
    },
    {
      title: t.landingCard2Title,
      body: t.landingCard2Body,
    },
    {
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

      {/* Nav */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <span className="text-sm font-semibold tracking-tight text-foreground">Qrooma</span>
          <div className="flex items-center gap-3 shrink-0">
            <LocaleToggle />
            {user ? (
              <Link href="/rooms">
                <button className="whitespace-nowrap px-3.5 py-1.5 text-sm font-medium bg-foreground text-background rounded-xl hover:opacity-80 transition-opacity">
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
                  <button className="whitespace-nowrap px-3.5 py-1.5 text-sm font-medium bg-foreground text-background rounded-xl hover:opacity-80 transition-opacity">
                    {t.landingGetStarted}
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-28 pb-28 text-center">
        <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-8">
          ChatGPT · Claude · Gemini
        </p>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.1] whitespace-pre-line mb-7">
          {t.landingHero}
        </h1>
        <p className="max-w-lg mx-auto text-lg text-muted-foreground leading-relaxed mb-12">
          {t.landingSubcopy}
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {user ? (
            <Link href="/rooms">
              <button className="inline-flex items-center gap-2 px-7 py-3 text-sm font-medium bg-foreground text-background rounded-2xl hover:opacity-80 transition-opacity">
                {t.landingGoToApp}
                <ArrowRightIcon size={14} />
              </button>
            </Link>
          ) : (
            <>
              <Link href="/signup">
                <button className="inline-flex items-center gap-2 px-7 py-3 text-sm font-medium bg-foreground text-background rounded-2xl hover:opacity-80 transition-opacity">
                  {t.landingGetStarted}
                  <ArrowRightIcon size={14} />
                </button>
              </Link>
              <Link href="/login">
                <button className="px-7 py-3 text-sm font-medium text-foreground bg-card border border-border rounded-2xl hover:bg-accent transition-colors">
                  {t.loginBtn}
                </button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Appeal cards */}
      <section className="max-w-5xl mx-auto px-6 pb-28">
        <div className="grid sm:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl p-7"
            >
              <p className="text-sm font-semibold text-foreground leading-snug mb-3">
                {card.title}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <h2 className="text-2xl font-semibold text-foreground text-center mb-14">
            {t.landingHowTitle}
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-start gap-8 sm:gap-0">
            {steps.map((step, i) => (
              <div key={i} className="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-4 flex-1 relative">
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute left-1/2 top-4 w-full h-px bg-border" />
                )}
                <div className="relative z-10 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                  {i + 1}
                </div>
                <p className="sm:text-center text-sm text-foreground leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modes */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-semibold text-foreground text-center mb-12">
          {t.landingModesTitle}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-7">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
              {t.structuredDebate}
            </p>
            <p className="text-sm text-foreground leading-relaxed">{t.debateDesc}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-7">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
              {t.freeTalk}
            </p>
            <p className="text-sm text-foreground leading-relaxed">{t.freeTalkDesc}</p>
          </div>
        </div>
      </section>

      {/* BYOK */}
      <section className="border-t border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-semibold text-foreground mb-3">{t.landingByokTitle}</h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">{t.landingByokLead}</p>
            <ul className="space-y-4">
              {byokItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3.5">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                    <CheckIcon size={9} className="text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-28 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8 tracking-tight">{t.landingFooterCta}</h2>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {user ? (
              <Link href="/rooms">
                <button className="inline-flex items-center gap-2 px-7 py-3 text-sm font-medium bg-foreground text-background rounded-2xl hover:opacity-80 transition-opacity">
                  {t.landingGoToApp}
                  <ArrowRightIcon size={14} />
                </button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <button className="inline-flex items-center gap-2 px-7 py-3 text-sm font-medium bg-foreground text-background rounded-2xl hover:opacity-80 transition-opacity">
                    {t.landingGetStarted}
                    <ArrowRightIcon size={14} />
                  </button>
                </Link>
                <Link href="/login">
                  <button className="px-7 py-3 text-sm font-medium text-foreground bg-card border border-border rounded-2xl hover:bg-accent transition-colors">
                    {t.loginBtn}
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between text-xs text-muted-foreground/50">
          <span>© 2025 Qrooma</span>
          <span>BYOK · Async AI Team Room</span>
        </div>
      </footer>
    </div>
  );
}

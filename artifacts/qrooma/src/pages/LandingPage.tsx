import { Link } from "wouter";
import { useLocale, type Locale } from "../context/LocaleContext";
import { useAuth } from "../context/AuthContext";
import { ArrowRightIcon, CheckIcon } from "lucide-react";

function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex gap-1 rounded-full border border-border bg-card/70 p-1 backdrop-blur">
      {(["ja", "en"] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-3 py-1.5 text-xs rounded-full transition-all ${
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
      {children}
    </h2>
  );
}

const PREVIEW_MESSAGES = [
  {
    name: "ChatGPT",
    color: "#10a37f",
    text: "The real bottleneck isn't the feature list — it's engineering bandwidth. I'd ship a tighter scope and revisit quarterly.",
  },
  {
    name: "Claude",
    color: "#d97706",
    text: "I'd push back. The issue isn't just bandwidth — it's unclear success criteria. What's the one metric that matters most?",
  },
  {
    name: "Gemini",
    color: "#4285f4",
    text: "A middle path: lock one north star metric, then let it drive scope decisions automatically. Both problems solved.",
  },
];

function ProductPreview() {
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
              Rooms
            </p>
          </div>
          <nav className="flex-1 px-1.5 space-y-0.5">
            {[
              { name: "Product Roadmap Q3", active: true },
              { name: "Pricing Strategy",   active: false },
              { name: "Tech Stack Decision", active: false },
            ].map((room) => (
              <div
                key={room.name}
                className={`px-2.5 py-1.5 rounded-lg text-xs truncate transition-colors ${
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
        <div className="flex flex-col min-h-0">
          {/* Room header */}
          <div className="border-b border-border px-4 py-2.5 flex items-center justify-between bg-card/60">
            <div>
              <p className="text-[11px] font-semibold text-foreground">Product Roadmap Q3</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">3 agents · Run 2</p>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              Debate Mode
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 px-4 py-4 space-y-3 bg-background/40">
            {PREVIEW_MESSAGES.map((msg) => (
              <div key={msg.name} className="flex gap-2.5 max-w-[90%]">
                <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: msg.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1">{msg.name}</p>
                  <div className="bg-card border border-border/60 rounded-xl px-3 py-2">
                    <p className="text-[11px] text-foreground leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Conclusion */}
          <div className="border-t border-border bg-card/80 px-4 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-muted-foreground/40 text-sm leading-none">◈</span>
              <span className="text-xs font-semibold text-foreground">Conclusion</span>
            </div>
            <p className="text-[11px] text-foreground/70 leading-relaxed pl-4">
              Align on one north star metric first — it resolves both the prioritization and bandwidth problems simultaneously.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  const byokItems = [
    t.landingByokItem1,
    t.landingByokItem2,
    t.landingByokItem3,
    t.landingByokItem4,
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Soft ambient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-[-100px] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-foreground/[0.04] blur-3xl" />
        <div className="absolute right-[6%] top-[20%] h-[240px] w-[240px] rounded-full bg-foreground/[0.03] blur-3xl" />
        <div className="absolute left-[8%] bottom-[15%] h-[200px] w-[200px] rounded-full bg-foreground/[0.025] blur-3xl" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/">
            <button className="text-sm font-semibold tracking-tight text-foreground">Qrooma</button>
          </Link>
          <div className="flex items-center gap-2.5 shrink-0">
            <LocaleToggle />
            {user ? (
              <Link href="/rooms">
                <button className="whitespace-nowrap px-4 py-1.5 text-sm font-medium bg-foreground text-background rounded-full hover:opacity-85 transition-opacity">
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
                  <button className="whitespace-nowrap px-4 py-1.5 text-sm font-medium bg-foreground text-background rounded-full hover:opacity-85 transition-opacity">
                    {t.landingGetStarted}
                  </button>
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
                <button className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-foreground text-background rounded-full hover:opacity-85 transition-opacity">
                  {t.landingGoToApp} <ArrowRightIcon size={13} />
                </button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <button className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-foreground text-background rounded-full hover:opacity-85 transition-opacity">
                    {t.landingGetStarted} <ArrowRightIcon size={13} />
                  </button>
                </Link>
                <Link href="/login">
                  <button className="px-6 py-2.5 text-sm font-medium text-foreground border border-border rounded-full bg-card/70 hover:bg-accent transition-colors">
                    {t.loginBtn}
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Product preview — real UI mockup */}
        <div className="animate-fade-up anim-d4 max-w-4xl mx-auto">
          <ProductPreview />
          <p className="mt-3 text-center text-xs text-muted-foreground/50">
            {t.landingHowTitle}
          </p>
        </div>
      </section>

      {/* Appeal cards */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 pb-20 sm:pb-24">
        <div className="grid sm:grid-cols-3 gap-3">
          {cards.map((card, i) => (
            <div
              key={i}
              className="rounded-[20px] border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
            >
              <p className="text-sm font-semibold text-foreground leading-snug mb-2">
                {card.title}
              </p>
              <p className="text-sm text-muted-foreground leading-7">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/60 bg-card/50">
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
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
        <div className="max-w-2xl mb-10">
          <SectionTitle>{t.landingModesTitle}</SectionTitle>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-[20px] border border-border bg-card p-6 hover:border-foreground/15 transition-colors">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
              {t.structuredDebate}
            </p>
            <p className="text-sm text-foreground leading-7">{t.debateDesc}</p>
          </div>
          <div className="rounded-[20px] border border-border bg-card p-6 hover:border-foreground/15 transition-colors">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
              {t.freeTalk}
            </p>
            <p className="text-sm text-foreground leading-7">{t.freeTalkDesc}</p>
          </div>
        </div>
      </section>

      {/* BYOK */}
      <section className="border-t border-border/60 bg-card/50">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="max-w-xl">
            <SectionTitle>{t.landingByokTitle}</SectionTitle>
            <p className="mt-3 text-sm text-muted-foreground leading-7">
              {t.landingByokLead}
            </p>
            <ul className="mt-7 space-y-3.5">
              {byokItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-4 h-4 rounded-full border border-border bg-background flex items-center justify-center shrink-0">
                    <CheckIcon size={8} className="text-muted-foreground" />
                  </div>
                  <span className="text-sm text-foreground leading-7">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-20 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-7">
            {t.landingFooterCta}
          </h2>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {user ? (
              <Link href="/rooms">
                <button className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-foreground text-background rounded-full hover:opacity-85 transition-opacity">
                  {t.landingGoToApp} <ArrowRightIcon size={13} />
                </button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <button className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-foreground text-background rounded-full hover:opacity-85 transition-opacity">
                    {t.landingGetStarted} <ArrowRightIcon size={13} />
                  </button>
                </Link>
                <Link href="/login">
                  <button className="px-6 py-2.5 text-sm font-medium text-foreground border border-border rounded-full bg-card/70 hover:bg-accent transition-colors">
                    {t.loginBtn}
                  </button>
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

/**
 * /sample-decision-checkpoint — Read-only public sample page.
 *
 * Shows a before/after Decision Checkpoint example so visitors can
 * understand what they receive before submitting their own decision.
 *
 * This page is intentionally static. No fake demo, no login, no form.
 */

import { Link } from "wouter";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

const logoA = "/brand/adjudo-wordmark.png";

const INTAKE_URL  = (import.meta.env.VITE_CHECKPOINT_INTAKE_URL  as string | undefined)?.trim() ?? "";
const PRICE_LABEL = (import.meta.env.VITE_CHECKPOINT_PRICE_LABEL as string | undefined)?.trim() || "$9 paid beta";
const DELIVERY    = (import.meta.env.VITE_CHECKPOINT_DELIVERY_LABEL as string | undefined)?.trim() || "within 48 hours after payment";
const intakeCta   = INTAKE_URL || "#";

// ── Sub-components ────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-2">
      {children}
    </p>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[15px] font-bold text-foreground mb-3 leading-snug">
      {children}
    </h3>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/40 mb-1.5">
        {label}
      </p>
      <div className="text-[13px] text-foreground/80 leading-relaxed">{children}</div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-[13px] text-foreground/75 leading-relaxed">
          <span className="shrink-0 mt-[3px] text-foreground/25 text-[10px] font-bold">—</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SampleDecisionCheckpointPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
          <Link href="/">
            <img
              src={logoA}
              alt="Adjudo"
              className="w-[105px] sm:w-[130px] h-auto hover:opacity-70 transition-opacity dark:invert"
            />
          </Link>
          <Link href="/">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground border border-border/60 rounded-full hover:text-foreground hover:border-border transition-all duration-150">
              <ArrowLeftIcon size={11} />
              Back
            </button>
          </Link>
        </div>
      </header>

      {/* Sample banner */}
      <div className="border-b border-border bg-[#F7F7F5]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-bold tracking-widest uppercase border border-border rounded-md px-2 py-0.5 text-foreground/40">
            Sample
          </span>
          <p className="text-[12px] text-muted-foreground">
            This is a sample Decision Checkpoint.
            The {PRICE_LABEL} is currently delivered manually {DELIVERY}.
          </p>
        </div>
      </div>

      {/* Page header */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 pt-14 pb-10">
        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-4">
          Sample output
        </p>
        <h1
          className="font-black tracking-[-0.03em] leading-[1.05] text-foreground mb-4"
          style={{ fontSize: "clamp(1.8rem, 4.5vw, 3rem)" }}
        >
          Sample Decision Checkpoint
        </h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-xl">
          See what you receive after submitting messy ideas, AI outputs, options, or open questions.
        </p>
      </section>

      {/* Before / After layout */}
      <section className="max-w-4xl mx-auto px-5 sm:px-8 pb-20">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">

          {/* ── BEFORE: Messy input ───────────────────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-[#F7F7F5] overflow-hidden">
            <div className="border-b border-border px-5 py-3.5">
              <Label>Before</Label>
              <SectionHeading>Messy input</SectionHeading>
              <p className="text-[12px] text-muted-foreground">
                What the visitor sends — notes, AI outputs, options, questions.
              </p>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-[12px] font-semibold text-muted-foreground/60 mb-3 uppercase tracking-widest">
                Decision topic
              </p>
              <p className="text-[14px] font-semibold text-foreground mb-4 leading-snug">
                Should I prioritize the onboarding improvement or the AI summary feature first?
              </p>
              <BulletList items={[
                "I'm building a small SaaS for solo creators.",
                "I have two feature ideas.",
                "Option A: improve onboarding because many users sign up but do not complete setup.",
                "Option B: build an AI summary feature because it sounds more exciting and may be easier to market.",
                "ChatGPT suggested both could be useful.",
                "I only have one week of development time.",
                "I want to choose the move that is most likely to improve activation or generate stronger user feedback.",
                "I'm worried I'll spend a week building something impressive but not actually useful.",
              ]} />
            </div>
          </div>

          {/* ── AFTER: Decision Checkpoint ───────────────────────────────────── */}
          <div className="rounded-2xl border border-foreground/10 bg-background overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
            <div className="border-b border-border px-5 py-3.5 bg-foreground text-background">
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-background/50 mb-1">
                After
              </p>
              <p className="text-[15px] font-bold text-background">Decision Checkpoint</p>
              <p className="text-[11px] text-background/50 mt-0.5">Human-reviewed · {DELIVERY}</p>
            </div>

            <div className="p-5 space-y-6">

              <Block label="Current decision">
                Should the builder spend the next week improving onboarding or building the AI summary feature?
              </Block>

              {/* Recommended move — highlighted */}
              <div className="rounded-xl border border-foreground/10 bg-[#F7F7F5] px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1.5">
                  Recommended next move
                </p>
                <p className="text-[14px] font-semibold text-foreground leading-snug">
                  Prioritize the onboarding improvement first.
                </p>
              </div>

              <Block label="Why this move">
                <p className="mb-2">
                  The onboarding issue is closer to an existing user behavior problem: people are signing up but not completing setup. Improving onboarding is more likely to reveal whether users understand the product and reach the first meaningful outcome.
                </p>
                <p className="mb-2">
                  The AI summary feature may be more marketable, but it adds complexity before confirming that users can successfully activate.
                </p>
                <p>
                  The sharper move is to fix the path to first value before adding another feature.
                </p>
              </Block>

              <Block label="Rejected options">
                <BulletList items={[
                  "Build the AI summary feature first: rejected for now because it may create a more impressive demo without solving the current activation problem.",
                  "Split the week between both: rejected because it would likely produce two weak tests instead of one clear result.",
                  "Do nothing until more users arrive: rejected because the existing signup-to-activation gap is already a useful signal.",
                ]} />
              </Block>

              <Block label="Key assumptions">
                <BulletList items={[
                  "The main current bottleneck is activation, not feature depth.",
                  "Users who complete onboarding are more likely to give useful feedback.",
                  "The AI summary feature will be more valuable after users understand the core workflow.",
                  "One focused improvement is better than two shallow changes this week.",
                ]} />
              </Block>

              <Block label="Objections / risks">
                <BulletList items={[
                  "The AI summary feature might attract more attention on social channels.",
                  "Onboarding improvements may feel less exciting and harder to market.",
                  "The activation issue may come from weak positioning, not onboarding UX.",
                  "If current traffic is too low, the onboarding test may not produce enough data quickly.",
                ]} />
              </Block>

              <Block label="Validation steps">
                <BulletList items={[
                  "Define the current onboarding completion rate.",
                  "Identify the exact step where users drop off.",
                  "Improve only that step, not the entire onboarding flow.",
                  "Track completion rate before and after the change.",
                  "Ask 3 users where they got confused.",
                  "If activation does not improve, revisit whether the issue is positioning rather than onboarding.",
                ]} />
              </Block>

              <Block label="Kill / revisit criteria">
                <p className="mb-1.5 text-[12px] text-muted-foreground">Revisit the AI summary feature if:</p>
                <BulletList items={[
                  "Onboarding completion improves but retention remains weak",
                  "Users explicitly ask for better output summaries",
                  "The AI summary feature becomes necessary to reach the product's core value",
                  "Marketing tests show strong demand for summary-related use cases",
                ]} />
              </Block>

              {/* Next action — highlighted */}
              <div className="rounded-xl bg-foreground text-background px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-background/50 mb-1.5">
                  Next action {DELIVERY}
                </p>
                <p className="text-[13px] font-medium text-background leading-relaxed">
                  Review the onboarding flow, identify the biggest drop-off step, and ship one focused improvement before building any new AI feature.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border bg-[#F7F7F5]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 py-14 sm:py-18">
          <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-4">
            Ready to submit yours?
          </p>
          <h2
            className="font-black tracking-[-0.025em] leading-[1.1] text-foreground mb-4 max-w-lg"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}
          >
            Submit your real decision.
          </h2>
          <p className="text-[14px] text-muted-foreground mb-8 max-w-md leading-relaxed">
            Send your messy notes, AI outputs, or open questions.
            If it is a good fit, we'll send you a {PRICE_LABEL.includes("$") ? PRICE_LABEL : `${PRICE_LABEL}`} payment link.
            After payment, you receive a human-reviewed Decision Checkpoint {DELIVERY}.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href={intakeCta}
              target={INTAKE_URL ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-foreground text-background font-semibold rounded-full px-6 py-3 text-[15px] whitespace-nowrap hover:opacity-85 active:scale-[0.97] transition-all duration-150"
            >
              Submit your decision <ArrowRightIcon size={14} />
            </a>
            <Link href="/">
              <button className="inline-flex items-center gap-1.5 px-5 py-3 text-sm font-medium text-muted-foreground border border-border rounded-full bg-transparent whitespace-nowrap hover:text-foreground hover:border-foreground/30 active:scale-[0.97] transition-all duration-150">
                <ArrowLeftIcon size={13} />
                Back to landing page
              </button>
            </Link>
          </div>
          <p className="mt-5 text-[11px] text-muted-foreground/40">
            Adjudo is currently in paid beta. The Decision Checkpoint is delivered manually while we validate demand.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoA} alt="Adjudo" className="h-5 w-auto opacity-50 dark:invert" />
            <span className="text-[11px] text-muted-foreground/40">© 2026</span>
          </div>
          <Link href="/">
            <span className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer">
              adjudo.com
            </span>
          </Link>
        </div>
      </footer>

    </div>
  );
}

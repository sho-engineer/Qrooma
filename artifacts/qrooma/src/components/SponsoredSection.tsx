/**
 * SponsoredSection — LP-only sponsored / partner tools banner
 *
 * Deliberately subdued: no animation, no bright colors, no auto-play.
 * Swap SPONSORS data for live ad network integration when ready.
 *
 * Usage: <SponsoredSection />
 */

import { ExternalLinkIcon } from "lucide-react";
import { useLocale, type Locale } from "../context/LocaleContext";

// ─── Sponsor data ─────────────────────────────────────────────────────────────
// Replace with dynamic data from your ad provider.

interface Sponsor {
  id:      string;
  initials: string;
  bgColor:  string;
  name:     string;
  desc:     string;
  href:     string;
}

const SPONSORS: Record<Locale, Sponsor[]> = {
  ja: [
    {
      id:       "notion",
      initials: "N",
      bgColor:  "#000000",
      name:     "Notion AI",
      desc:     "ドキュメント・タスク・データベースを一元化。AIがチームの知識を整理します。",
      href:     "https://notion.so",
    },
    {
      id:       "linear",
      initials: "L",
      bgColor:  "#5E6AD2",
      name:     "Linear",
      desc:     "プロダクトチームのための高速な課題管理。Qroomaの議論をタスクに変換。",
      href:     "https://linear.app",
    },
    {
      id:       "loom",
      initials: "LO",
      bgColor:  "#625DF5",
      name:     "Loom",
      desc:     "非同期ビデオメッセージで意思決定を加速。テキストより伝わるチームコミュニケーション。",
      href:     "https://loom.com",
    },
  ],
  en: [
    {
      id:       "notion",
      initials: "N",
      bgColor:  "#000000",
      name:     "Notion AI",
      desc:     "Docs, tasks, and databases in one place. Let AI organize your team's knowledge.",
      href:     "https://notion.so",
    },
    {
      id:       "linear",
      initials: "L",
      bgColor:  "#5E6AD2",
      name:     "Linear",
      desc:     "Fast issue tracking for product teams. Turn Qrooma debates into action items.",
      href:     "https://linear.app",
    },
    {
      id:       "loom",
      initials: "LO",
      bgColor:  "#625DF5",
      name:     "Loom",
      desc:     "Async video messaging that speeds up decisions. Better than a wall of text.",
      href:     "https://loom.com",
    },
  ],
};

// ─── SponsoredCard ────────────────────────────────────────────────────────────

interface SponsoredCardProps {
  sponsor:      Sponsor;
  learnMoreLabel: string;
  sponsoredLabel: string;
}

function SponsoredCard({ sponsor, learnMoreLabel, sponsoredLabel }: SponsoredCardProps) {
  return (
    <a
      href={sponsor.href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group flex flex-col rounded-[20px] border border-border bg-background p-5
        transition-all duration-200
        hover:-translate-y-[2px] hover:border-foreground/10 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
    >
      {/* Header row: logo + sponsored badge */}
      <div className="flex items-start justify-between gap-3 mb-3.5">
        {/* Logo placeholder */}
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: sponsor.bgColor }}
        >
          <span className="text-[11px] font-bold text-white leading-none select-none">
            {sponsor.initials}
          </span>
        </div>

        {/* Sponsored badge */}
        <span className="shrink-0 text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-widest mt-1 select-none">
          {sponsoredLabel}
        </span>
      </div>

      {/* Service name */}
      <p className="text-sm font-semibold text-foreground mb-1.5 leading-snug group-hover:text-foreground/80 transition-colors">
        {sponsor.name}
      </p>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">
        {sponsor.desc}
      </p>

      {/* CTA */}
      <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground/50
        group-hover:text-foreground/70 transition-colors duration-150">
        {learnMoreLabel}
        <ExternalLinkIcon
          size={10}
          className="opacity-50 group-hover:opacity-70 transition-opacity translate-y-[0.5px]"
        />
      </span>
    </a>
  );
}

// ─── SponsoredSection ─────────────────────────────────────────────────────────

interface SponsoredSectionProps {
  /** Optional: forward a fade-in ref/style from the parent's useFadeSection() */
  sectionRef?:   React.RefObject<HTMLElement>;
  sectionStyle?: React.CSSProperties;
}

export default function SponsoredSection({ sectionRef, sectionStyle }: SponsoredSectionProps) {
  const { t, locale } = useLocale();
  const sponsors = SPONSORS[locale];

  return (
    <section
      ref={sectionRef}
      style={sectionStyle}
      className="border-t border-border/50"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-14 sm:py-16">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-8">
          <p className="text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-widest select-none">
            {t.sponsoredSectionTitle}
          </p>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-3 gap-3">
          {sponsors.map((s) => (
            <SponsoredCard
              key={s.id}
              sponsor={s}
              learnMoreLabel={t.sponsoredLearnMore}
              sponsoredLabel={t.sponsoredLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

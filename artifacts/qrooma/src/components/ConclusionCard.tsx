import { useState } from "react";
import { ChevronDownIcon, ClockIcon } from "lucide-react";
import type { ConclusionData } from "../types";
import { useLocale } from "../context/LocaleContext";

interface Props {
  runCount:    number;
  conclusions: ConclusionData[];
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale === "ja" ? "ja-JP" : "en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Parse structured conclusion sections ─────────────────────────────────────

interface ConclusionSections {
  adopted?:   { label: string; content: string };
  rejected?:  { label: string; content: string };
  open?:      { label: string; content: string };
  next?:      { label: string; content: string };
  fallback?:  string;
}

type StructuredKey = "adopted" | "rejected" | "open" | "next";

const SECTION_PATTERNS: Array<{ key: StructuredKey; regex: RegExp }> = [
  { key: "adopted",  regex: /\[採用\][^\n]*\n?([\s\S]*?)(?=\[棄却\]|\[残論点\]|\[次アクション\]|$)/i },
  { key: "rejected", regex: /\[棄却\][^\n]*\n?([\s\S]*?)(?=\[採用\]|\[残論点\]|\[次アクション\]|$)/i },
  { key: "open",     regex: /\[残論点\][^\n]*\n?([\s\S]*?)(?=\[採用\]|\[棄却\]|\[次アクション\]|$)/i },
  { key: "next",     regex: /\[次アクション\][^\n]*\n?([\s\S]*?)(?=\[採用\]|\[棄却\]|\[残論点\]|$)/i },
];

const HEADER_LABELS_JA: Record<keyof ConclusionSections, string> = {
  adopted:  "採用", rejected: "棄却", open: "残論点", next: "次アクション", fallback: "",
};
const HEADER_LABELS_EN: Record<keyof ConclusionSections, string> = {
  adopted:  "Adopted", rejected: "Rejected", open: "Open questions", next: "Next action", fallback: "",
};

function parseSections(text: string): ConclusionSections {
  const hasMarkers = SECTION_PATTERNS.some((p) => p.regex.test(text));
  if (!hasMarkers) return { fallback: text };
  const result: ConclusionSections = {};
  for (const { key, regex } of SECTION_PATTERNS) {
    const m = text.match(regex);
    const content = m?.[1]?.trim();
    if (content) result[key] = { label: key, content };
  }
  return result;
}

const SECTION_META: Record<
  "adopted" | "rejected" | "open" | "next",
  { icon: string; color: string; borderColor: string }
> = {
  adopted:  { icon: "✓", color: "text-emerald-700 dark:text-emerald-400", borderColor: "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20" },
  rejected: { icon: "✗", color: "text-rose-600 dark:text-rose-400",       borderColor: "border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20" },
  open:     { icon: "?", color: "text-amber-600 dark:text-amber-400",      borderColor: "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20" },
  next:     { icon: "→", color: "text-blue-600 dark:text-blue-400",        borderColor: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20" },
};

// ─── Single conclusion body ────────────────────────────────────────────────────

function ConclusionBody({ conclusion, locale }: { conclusion: ConclusionData; locale: string }) {
  const labelMap = locale === "ja" ? HEADER_LABELS_JA : HEADER_LABELS_EN;
  const sections = parseSections(conclusion.summary);
  const isStructured = !sections.fallback;
  const { t } = useLocale();

  if (isStructured) {
    return (
      <>
        <div className="px-4 py-4 space-y-2.5">
          {(["adopted", "rejected", "open", "next"] as const).map((key) => {
            const sec = sections[key];
            if (!sec) return null;
            const meta = SECTION_META[key];
            return (
              <div key={key} className={`flex gap-3 px-3.5 py-3 rounded-xl border ${meta.borderColor}`}>
                <span className={`shrink-0 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full border ${meta.color} border-current mt-0.5`}>
                  {meta.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[10px] font-semibold uppercase tracking-widest mb-0.5 ${meta.color}`}>
                    {labelMap[key]}
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{sec.content}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-5 py-2 border-t border-border/30 bg-background/20">
          <p className="text-[11px] text-muted-foreground/40">
            {t.generatedAt}: {formatDate(conclusion.generatedAt, locale)}
            {conclusion.runNumber != null && (
              <span className="ml-2 opacity-60">· Run #{conclusion.runNumber}</span>
            )}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="px-5 py-4">
        <p className="text-sm text-foreground leading-[1.75]">{sections.fallback}</p>
      </div>
      <div className="px-5 py-2 border-t border-border/30 bg-background/20">
        <p className="text-[11px] text-muted-foreground/40">
          {t.generatedAt}: {formatDate(conclusion.generatedAt, locale)}
          {conclusion.runNumber != null && (
            <span className="ml-2 opacity-60">· Run #{conclusion.runNumber}</span>
          )}
        </p>
      </div>
    </>
  );
}

// ─── Past conclusion row (collapsible) ────────────────────────────────────────

function PastConclusionRow({
  conclusion,
  index,
  total,
  locale,
}: {
  conclusion: ConclusionData;
  index:      number;
  total:      number;
  locale:     string;
}) {
  const [open, setOpen] = useState(false);
  const versionNum = total - index;

  return (
    <div className="border border-border/40 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <ClockIcon size={11} className="text-muted-foreground/40 shrink-0" />
          <span className="text-[11px] font-medium text-muted-foreground/70">
            {locale === "ja" ? `結論 v${versionNum}` : `Conclusion v${versionNum}`}
          </span>
          {conclusion.runNumber != null && (
            <span className="text-[10px] text-muted-foreground/40">· Run #{conclusion.runNumber}</span>
          )}
          <span className="text-[10px] text-muted-foreground/30 ml-1">
            {formatDate(conclusion.generatedAt, locale)}
          </span>
        </div>
        <div
          className="text-muted-foreground/30 transition-transform duration-200 shrink-0 ml-2"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <ChevronDownIcon size={12} />
        </div>
      </button>

      {open && (
        <div className="border-t border-border/30">
          <ConclusionBody conclusion={conclusion} locale={locale} />
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function ConclusionCard({ runCount, conclusions }: Props) {
  const [isOpen,       setIsOpen]       = useState(false);
  const [showHistory,  setShowHistory]  = useState(false);
  const { t, locale } = useLocale();

  const current  = conclusions[0] ?? null;
  const history  = conclusions.slice(1);
  const hasConc  = !!current;

  return (
    <div className="mx-3 sm:mx-4 mb-2">
      {/* ── Main toggle ── */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm border transition-all duration-200 ${
          isOpen
            ? "border-b-0 rounded-t-2xl bg-card border-border/60"
            : "rounded-2xl bg-card border-border/60 hover:border-foreground/15 hover:shadow-[0_2px_12px_rgba(0,0,0,0.05)] active:scale-[0.99]"
        }`}
      >
        <div className="flex items-center gap-2 text-foreground">
          <span className="text-foreground/30 text-base leading-none select-none">◈</span>
          <span className="text-sm font-semibold">{t.conclusion}</span>
          {hasConc && (
            <span className="text-[11px] font-normal text-muted-foreground/50">
              {t.runsCount(runCount)}
            </span>
          )}
          {history.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground/60 font-medium">
              v{conclusions.length}
            </span>
          )}
        </div>
        <div
          className="text-muted-foreground/40 transition-transform duration-300 ease-in-out"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <ChevronDownIcon size={14} />
        </div>
      </button>

      {/* ── Accordion body ── */}
      <div
        className={`accordion-wrap border border-t-0 border-border/60 rounded-b-2xl bg-card ${
          isOpen ? "accordion-open" : ""
        }`}
      >
        <div className="accordion-inner">
          {hasConc ? (
            <>
              <ConclusionBody conclusion={current} locale={locale} />

              {/* ── History section ── */}
              {history.length > 0 && (
                <div className="px-4 pb-4">
                  <button
                    onClick={() => setShowHistory((p) => !p)}
                    className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors mt-1"
                  >
                    <ClockIcon size={10} />
                    <span>
                      {locale === "ja"
                        ? `過去の結論 ${history.length} 件`
                        : `${history.length} previous conclusion${history.length > 1 ? "s" : ""}`}
                    </span>
                    <ChevronDownIcon
                      size={10}
                      className="transition-transform duration-200"
                      style={{ transform: showHistory ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </button>

                  {showHistory && (
                    <div className="mt-3 space-y-2">
                      {history.map((conc, i) => (
                        <PastConclusionRow
                          key={conc.generatedAt}
                          conclusion={conc}
                          index={i + 1}
                          total={conclusions.length}
                          locale={locale}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="px-5 py-7 text-center">
              <p className="text-sm text-muted-foreground/50">
                {runCount === 0 ? t.noConclusionStart : t.noConclusionAfterRun}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

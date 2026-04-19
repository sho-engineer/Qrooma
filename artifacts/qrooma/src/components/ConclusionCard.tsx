import { useState } from "react";
import { ChevronDownIcon, ClockIcon, RotateCcwIcon } from "lucide-react";
import type { ConclusionData, ConclusionStatus } from "../types";
import { useLocale } from "../context/LocaleContext";

interface Props {
  runCount:         number;
  conclusions:      ConclusionData[];
  conclusionStatus: ConclusionStatus;
  onRerun?:         () => void;
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
  adopted: "採用", rejected: "棄却", open: "残論点", next: "次アクション", fallback: "",
};
const HEADER_LABELS_EN: Record<keyof ConclusionSections, string> = {
  adopted: "Adopted", rejected: "Rejected", open: "Open questions", next: "Next action", fallback: "",
};

function parseSections(text: string): ConclusionSections {
  if (!text || !text.trim()) return {};
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

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ConclusionLoadingSkeleton() {
  return (
    <div className="px-4 py-4 space-y-2.5 animate-pulse">
      {(["adopted", "rejected", "open", "next"] as const).map((key) => {
        const meta = SECTION_META[key];
        return (
          <div key={key} className={`flex gap-3 px-3.5 py-3 rounded-xl border ${meta.borderColor}`}>
            <span className={`shrink-0 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full border ${meta.color} border-current mt-0.5 opacity-30`}>
              {meta.icon}
            </span>
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="h-2 rounded-full bg-muted/50 w-1/4" />
              <div className="h-3 rounded-full bg-muted/40 w-full" />
              <div className="h-3 rounded-full bg-muted/30 w-3/4" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ConclusionErrorState({ onRerun }: { onRerun?: () => void }) {
  const { t } = useLocale();
  return (
    <div className="px-5 py-6 text-center space-y-3">
      <p className="text-sm text-muted-foreground/70 leading-relaxed">
        {t.conclusionError}
      </p>
      {onRerun && (
        <button
          onClick={onRerun}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-border hover:bg-accent transition-colors"
        >
          <RotateCcwIcon size={10} />
          {t.conclusionErrorRetry}
        </button>
      )}
    </div>
  );
}

// ─── Single conclusion body ────────────────────────────────────────────────────

function ConclusionBody({ conclusion, locale }: { conclusion: ConclusionData; locale: string }) {
  const labelMap = locale === "ja" ? HEADER_LABELS_JA : HEADER_LABELS_EN;
  const sections = parseSections(conclusion.summary);
  const { t } = useLocale();

  const hasAnySection =
    sections.adopted || sections.rejected || sections.open || sections.next || sections.fallback;

  if (!hasAnySection) {
    return (
      <div className="px-5 py-7 text-center">
        <p className="text-sm text-muted-foreground/50">{t.conclusionError}</p>
      </div>
    );
  }

  const isStructured = !sections.fallback;

  return (
    <>
      {isStructured ? (
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
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{sec.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-5 py-4">
          <p className="text-sm text-foreground leading-[1.75] whitespace-pre-line">{sections.fallback}</p>
        </div>
      )}

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

export default function ConclusionCard({ runCount, conclusions, conclusionStatus, onRerun }: Props) {
  const [isOpen,       setIsOpen]       = useState(false);
  const [showHistory,  setShowHistory]  = useState(false);
  const { t, locale } = useLocale();

  const current  = conclusions[0] ?? null;
  const history  = conclusions.slice(1);
  const hasConc  = !!current && !!current.summary?.trim();
  const isLoading = conclusionStatus === "loading";
  const isError   = conclusionStatus === "error";

  // Auto-open when loading starts (so user sees progress)
  // handled by the parent setting conclusionStatus

  // Badge label
  const badgeLabel = isLoading
    ? (locale === "ja" ? "生成中" : "Generating")
    : isError
    ? (locale === "ja" ? "エラー" : "Error")
    : hasConc
    ? t.runsCount(runCount)
    : undefined;

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
          <span className={`text-base leading-none select-none ${isLoading ? "animate-spin" : ""} ${isError ? "text-rose-400/70" : "text-foreground/30"}`}>
            {isError ? "!" : "◈"}
          </span>
          <span className="text-sm font-semibold">{t.conclusion}</span>
          {badgeLabel && (
            <span className={`text-[11px] font-normal ${isError ? "text-rose-500/70" : isLoading ? "text-blue-500/70" : "text-muted-foreground/50"}`}>
              {badgeLabel}
            </span>
          )}
          {!isLoading && !isError && history.length > 0 && (
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
          {isLoading ? (
            <ConclusionLoadingSkeleton />
          ) : isError ? (
            <ConclusionErrorState onRerun={onRerun} />
          ) : hasConc ? (
            <>
              <ConclusionBody conclusion={current!} locale={locale} />

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
            // idle / no conclusion yet
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

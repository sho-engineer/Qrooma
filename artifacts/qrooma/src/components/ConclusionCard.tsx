import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import type { ConclusionData } from "../types";
import { useLocale } from "../context/LocaleContext";

interface Props {
  runCount:   number;
  conclusion: ConclusionData | null;
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale === "ja" ? "ja-JP" : "en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Parse structured conclusion sections ─────────────────────────────────────
// Supports markers: [採用] [棄却] [残論点] [次アクション]
// Also supports English variants: [採用] == "Adopted" key insight etc.

interface ConclusionSections {
  adopted?:   { label: string; content: string };
  rejected?:  { label: string; content: string };
  open?:      { label: string; content: string };
  next?:      { label: string; content: string };
  fallback?:  string;
}

const SECTION_PATTERNS: Array<{
  key:    keyof ConclusionSections;
  regex:  RegExp;
}> = [
  { key: "adopted",  regex: /\[採用\][^\n]*\n?([\s\S]*?)(?=\[棄却\]|\[残論点\]|\[次アクション\]|$)/i },
  { key: "rejected", regex: /\[棄却\][^\n]*\n?([\s\S]*?)(?=\[採用\]|\[残論点\]|\[次アクション\]|$)/i },
  { key: "open",     regex: /\[残論点\][^\n]*\n?([\s\S]*?)(?=\[採用\]|\[棄却\]|\[次アクション\]|$)/i },
  { key: "next",     regex: /\[次アクション\][^\n]*\n?([\s\S]*?)(?=\[採用\]|\[棄却\]|\[残論点\]|$)/i },
];

const HEADER_LABELS_JA: Record<keyof ConclusionSections, string> = {
  adopted:  "採用",
  rejected: "棄却",
  open:     "残論点",
  next:     "次アクション",
  fallback: "",
};
const HEADER_LABELS_EN: Record<keyof ConclusionSections, string> = {
  adopted:  "Adopted",
  rejected: "Rejected",
  open:     "Open questions",
  next:     "Next action",
  fallback: "",
};

function parseSections(text: string): ConclusionSections {
  const hasMarkers = SECTION_PATTERNS.some((p) => p.regex.test(text));
  if (!hasMarkers) return { fallback: text };

  const result: ConclusionSections = {};
  for (const { key, regex } of SECTION_PATTERNS) {
    const m = text.match(regex);
    const content = m?.[1]?.trim();
    if (content) {
      result[key] = { label: key, content };
    }
  }
  return result;
}

// ─── Section icons ─────────────────────────────────────────────────────────────

const SECTION_META: Record<
  "adopted" | "rejected" | "open" | "next",
  { icon: string; color: string; borderColor: string }
> = {
  adopted:  { icon: "✓", color: "text-emerald-700 dark:text-emerald-400", borderColor: "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20" },
  rejected: { icon: "✗", color: "text-rose-600 dark:text-rose-400",       borderColor: "border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20" },
  open:     { icon: "?", color: "text-amber-600 dark:text-amber-400",      borderColor: "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20" },
  next:     { icon: "→", color: "text-blue-600 dark:text-blue-400",        borderColor: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20" },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ConclusionCard({ runCount, conclusion }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { t, locale } = useLocale();
  const labelMap = locale === "ja" ? HEADER_LABELS_JA : HEADER_LABELS_EN;

  const sections = conclusion ? parseSections(conclusion.summary) : null;
  const isStructured = sections && !sections.fallback;

  return (
    <div className="mx-3 sm:mx-4 mb-2">
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
          {conclusion && (
            <span className="text-[11px] font-normal text-muted-foreground/50">
              {t.runsCount(runCount)}
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

      <div
        className={`accordion-wrap border border-t-0 border-border/60 rounded-b-2xl bg-card ${
          isOpen ? "accordion-open" : ""
        }`}
      >
        <div className="accordion-inner">
          {conclusion && sections ? (
            isStructured ? (
              <>
                <div className="px-4 py-4 space-y-2.5">
                  {(["adopted", "rejected", "open", "next"] as const).map((key) => {
                    const sec = sections[key];
                    if (!sec) return null;
                    const meta = SECTION_META[key];
                    return (
                      <div
                        key={key}
                        className={`flex gap-3 px-3.5 py-3 rounded-xl border ${meta.borderColor}`}
                      >
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
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="px-5 py-4">
                  <p className="text-sm text-foreground leading-[1.75]">{sections.fallback}</p>
                </div>
                <div className="px-5 py-2 border-t border-border/30 bg-background/20">
                  <p className="text-[11px] text-muted-foreground/40">
                    {t.generatedAt}: {formatDate(conclusion.generatedAt, locale)}
                  </p>
                </div>
              </>
            )
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

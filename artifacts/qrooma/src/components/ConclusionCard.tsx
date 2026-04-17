import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import type { ConclusionData } from "../types";
import { useLocale } from "../context/LocaleContext";

interface Props {
  runCount: number;
  conclusion: ConclusionData | null;
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale === "ja" ? "ja-JP" : "en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ConclusionCard({ runCount, conclusion }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { t, locale } = useLocale();

  return (
    <div className="mx-3 sm:mx-4 mb-2">
      {/* Toggle button */}
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

      {/* Accordion body — CSS grid-template-rows trick for smooth expand/collapse */}
      <div
        className={`accordion-wrap border border-t-0 border-border/60 rounded-b-2xl bg-card ${
          isOpen ? "accordion-open" : ""
        }`}
      >
        <div className="accordion-inner">
          {conclusion ? (
            <>
              <div className="px-5 py-4">
                <p className="text-sm text-foreground leading-[1.75]">{conclusion.summary}</p>
              </div>
              <div className="px-5 py-4 border-t border-border/40 bg-background/30">
                <p className="text-[10px] font-semibold text-muted-foreground/50 mb-3 uppercase tracking-widest">
                  {t.keyPoints}
                </p>
                <ul className="space-y-2">
                  {conclusion.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-3 text-[13px] text-foreground/75 leading-relaxed">
                      <span className="mt-2 w-1 h-1 rounded-full bg-foreground/20 shrink-0" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-5 py-2 border-t border-border/30 bg-background/20">
                <p className="text-[11px] text-muted-foreground/40">
                  {t.generatedAt}: {formatDate(conclusion.generatedAt, locale)}
                </p>
              </div>
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

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
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
      <button
        onClick={() => setIsOpen((p) => !p)}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium border transition-all ${
          isOpen
            ? "border-b-0 rounded-t-xl bg-card border-border/70"
            : "rounded-xl bg-card border-border/70 hover:border-border"
        }`}
      >
        <div className="flex items-center gap-2.5 text-foreground">
          <span className="text-muted-foreground/50 text-base leading-none">◈</span>
          <span className="font-medium">{t.conclusion}</span>
          {conclusion && (
            <span className="text-[11px] font-normal text-muted-foreground/60">
              {t.runsCount(runCount)}
            </span>
          )}
        </div>
        <div className="text-muted-foreground/40">
          {isOpen ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
        </div>
      </button>

      {isOpen && (
        <div className="border border-t-0 border-border/70 rounded-b-xl bg-card divide-y divide-border/40">
          {conclusion ? (
            <>
              <div className="px-5 py-4">
                <p className="text-sm text-foreground leading-relaxed">{conclusion.summary}</p>
              </div>
              <div className="px-5 py-4">
                <p className="text-[10px] font-semibold text-muted-foreground/60 mb-3 uppercase tracking-widest">
                  {t.keyPoints}
                </p>
                <ul className="space-y-2.5">
                  {conclusion.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-foreground/70 leading-relaxed">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/30 shrink-0" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-5 py-2.5">
                <p className="text-[11px] text-muted-foreground/40">
                  {t.generatedAt}: {formatDate(conclusion.generatedAt, locale)}
                </p>
              </div>
            </>
          ) : (
            <div className="px-5 py-6 text-center">
              <p className="text-sm text-muted-foreground/60">
                {runCount === 0 ? t.noConclusionStart : t.noConclusionAfterRun}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

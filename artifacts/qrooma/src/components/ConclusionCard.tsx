import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, SparklesIcon } from "lucide-react";
import type { ConclusionData } from "../types";

interface Props {
  runCount: number;
  conclusion: ConclusionData | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString([], {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function ConclusionCard({ runCount, conclusion }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mx-4 mb-2">
      <button
        onClick={() => setIsOpen((p) => !p)}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium border transition-all ${
          isOpen
            ? "border-b-0 rounded-t-lg bg-card border-border"
            : "rounded-lg bg-card border-border hover:bg-accent/30"
        }`}
      >
        <div className="flex items-center gap-2 text-foreground">
          <SparklesIcon size={13} className="text-primary/70" />
          <span>Conclusion</span>
          {conclusion && (
            <span className="text-xs font-normal text-muted-foreground">
              · {runCount} {runCount === 1 ? "run" : "runs"}
            </span>
          )}
        </div>
        <div className="text-muted-foreground">
          {isOpen ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
        </div>
      </button>

      {isOpen && (
        <div className="border border-t-0 border-border rounded-b-lg bg-card divide-y divide-border/50">
          {conclusion ? (
            <>
              <div className="px-4 py-3">
                <p className="text-sm text-foreground leading-relaxed">{conclusion.summary}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Key points</p>
                <ul className="space-y-2">
                  {conclusion.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-4 py-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground/50 italic">
                  Generated {formatDate(conclusion.generatedAt)}
                </p>
                <span className="text-[10px] text-muted-foreground/40 bg-muted px-1.5 py-0.5 rounded">
                  placeholder
                </span>
              </div>
            </>
          ) : (
            <div className="px-4 py-5 text-center">
              <p className="text-sm text-muted-foreground">
                No conclusion yet —{" "}
                {runCount === 0
                  ? "start a discussion to generate one."
                  : "will appear after a completed run."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

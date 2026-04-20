import { useState } from "react";
import { HelpCircleIcon, ArrowRightIcon, PlayIcon } from "lucide-react";
import { useLocale } from "../context/LocaleContext";

interface Props {
  questions:   string[];
  assumptions: string[];
  onAnswer:    (answer: string) => void;
  onSkip:      () => void;
}

export default function ClarificationCard({ questions, assumptions, onAnswer, onSkip }: Props) {
  const { t, locale } = useLocale();
  const [answer, setAnswer] = useState("");

  function handleSubmit() {
    const text = answer.trim();
    if (!text) {
      onSkip();
      return;
    }
    onAnswer(text);
  }

  return (
    <div className="mx-3 sm:mx-4 mb-2 rounded-2xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/30">
        <HelpCircleIcon size={14} className="text-blue-500 shrink-0" />
        <p className="text-sm font-semibold text-foreground">
          {locale === "ja" ? "議論を始める前に、少しだけ確認したいことがあります" : "Before we start, I'd like to confirm a few things"}
        </p>
      </div>

      {/* Questions */}
      <div className="px-4 py-3 space-y-2">
        {questions.map((q, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="shrink-0 mt-1 w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-[9px] font-bold text-blue-600 dark:text-blue-400">
              {i + 1}
            </span>
            <p className="text-sm text-foreground/80 leading-relaxed">{q}</p>
          </div>
        ))}
      </div>

      {/* Answer input */}
      <div className="px-4 pb-3">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={locale === "ja" ? "回答を入力（任意）…" : "Type your answers here (optional)…"}
          rows={2}
          className="w-full text-sm bg-background border border-border/60 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/40 leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <ArrowRightIcon size={12} />
          {locale === "ja" ? "回答してから始める" : "Answer first"}
        </button>
        <button
          onClick={onSkip}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-medium text-muted-foreground hover:bg-accent active:scale-[0.98] transition-all"
        >
          <PlayIcon size={11} />
          {locale === "ja" ? "このまま議論する" : "Start anyway"}
        </button>
      </div>

      {/* Assumptions preview (shown when skipping is available) */}
      {assumptions.length > 0 && (
        <div className="px-4 pb-4 pt-0">
          <details className="group">
            <summary className="text-[10px] text-muted-foreground/40 cursor-pointer hover:text-muted-foreground/60 transition-colors list-none flex items-center gap-1">
              <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
              {locale === "ja" ? "「このまま議論する」を選ぶと、以下の前提で進みます" : "\"Start anyway\" will use these assumptions"}
            </summary>
            <div className="mt-2 space-y-1.5">
              {assumptions.map((a, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-muted-foreground/30 text-xs mt-0.5 shrink-0">•</span>
                  <p className="text-[11px] text-muted-foreground/50 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

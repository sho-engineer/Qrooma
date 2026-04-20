import { useState, useEffect, useRef } from "react";
import {
  ChevronDownIcon, ClockIcon, RotateCcwIcon,
  CheckCircleIcon, PlayIcon, ArrowRightIcon,
} from "lucide-react";
import type { ConclusionData, ConclusionStatus } from "../types";
import { useLocale } from "../context/LocaleContext";
import { isMobile } from "../lib/isMobile";

interface Props {
  runCount:           number;
  conclusions:        ConclusionData[];
  conclusionStatus:   ConclusionStatus;
  onRerun?:           () => void;
  onContinue?:        () => void;
  onProvisional?:     () => void;
  onAddCondition?:    () => void;
  onEndHere?:         () => void;
  /** Called with the user's free-text direction (empty string = no direction) */
  onContinueDiscussion?: (direction: string) => void;
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale === "ja" ? "ja-JP" : "en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Section parsers ───────────────────────────────────────────────────────────

// FINAL conclusion format: [採用][棄却][残論点][次アクション]
interface FinalSections {
  adopted?:  { content: string };
  rejected?: { content: string };
  open?:     { content: string };
  next?:     { content: string };
  fallback?: string;
}

const FINAL_PATTERNS: Array<{ key: keyof Omit<FinalSections, "fallback">; regex: RegExp }> = [
  { key: "adopted",  regex: /\[採用\][^\n]*\n?([\s\S]*?)(?=\[棄却\]|\[残論点\]|\[次アクション\]|$)/i },
  { key: "rejected", regex: /\[棄却\][^\n]*\n?([\s\S]*?)(?=\[採用\]|\[残論点\]|\[次アクション\]|$)/i },
  { key: "open",     regex: /\[残論点\][^\n]*\n?([\s\S]*?)(?=\[採用\]|\[棄却\]|\[次アクション\]|$)/i },
  { key: "next",     regex: /\[次アクション\][^\n]*\n?([\s\S]*?)(?=\[採用\]|\[棄却\]|\[残論点\]|$)/i },
];

function parseFinalSections(text: string): FinalSections {
  if (!text?.trim()) return {};
  const hasMarkers = FINAL_PATTERNS.some((p) => p.regex.test(text));
  if (!hasMarkers) return { fallback: text };
  const result: FinalSections = {};
  for (const { key, regex } of FINAL_PATTERNS) {
    const m = text.match(regex);
    const content = m?.[1]?.trim();
    if (content) result[key] = { content };
  }
  return result;
}

// PROVISIONAL conclusion format: [有力案][理由][残論点][次に詰める点][更新点]
interface ProvisionalSections {
  leading?:   { content: string };
  reasoning?: { content: string };
  open?:      { content: string };
  clarify?:   { content: string };
  changed?:   { content: string };
  fallback?:  string;
}

const PROVISIONAL_PATTERNS: Array<{ key: keyof Omit<ProvisionalSections, "fallback">; regex: RegExp }> = [
  { key: "leading",   regex: /\[有力案\][^\n]*\n?([\s\S]*?)(?=\[理由\]|\[残論点\]|\[次に詰める点\]|\[更新点\]|$)/i },
  { key: "reasoning", regex: /\[理由\][^\n]*\n?([\s\S]*?)(?=\[有力案\]|\[残論点\]|\[次に詰める点\]|\[更新点\]|$)/i },
  { key: "open",      regex: /\[残論点\][^\n]*\n?([\s\S]*?)(?=\[有力案\]|\[理由\]|\[次に詰める点\]|\[更新点\]|$)/i },
  { key: "clarify",   regex: /\[次に詰める点\][^\n]*\n?([\s\S]*?)(?=\[有力案\]|\[理由\]|\[残論点\]|\[更新点\]|$)/i },
  { key: "changed",   regex: /\[更新点\][^\n]*\n?([\s\S]*?)(?=\[有力案\]|\[理由\]|\[残論点\]|\[次に詰める点\]|$)/i },
];

function parseProvisionalSections(text: string): ProvisionalSections {
  if (!text?.trim()) return {};
  const hasMarkers = PROVISIONAL_PATTERNS.some((p) => p.regex.test(text));
  if (!hasMarkers) return { fallback: text };
  const result: ProvisionalSections = {};
  for (const { key, regex } of PROVISIONAL_PATTERNS) {
    const m = text.match(regex);
    const content = m?.[1]?.trim();
    if (content) result[key] = { content };
  }
  return result;
}

function isProvisionalFormat(text: string): boolean {
  return /\[有力案\]/.test(text) || /\[次に詰める点\]/.test(text) || /\[更新点\]/.test(text);
}

// ─── Section meta ──────────────────────────────────────────────────────────────

const FINAL_SECTION_META = {
  adopted:  { icon: "✓", color: "text-emerald-700 dark:text-emerald-400", bg: "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20" },
  rejected: { icon: "✗", color: "text-rose-600 dark:text-rose-400",       bg: "border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20" },
  open:     { icon: "?", color: "text-amber-600 dark:text-amber-400",      bg: "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20" },
  next:     { icon: "→", color: "text-blue-600 dark:text-blue-400",        bg: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20" },
};

const PROVISIONAL_SECTION_META = {
  leading:   { icon: "✦", color: "text-violet-600 dark:text-violet-400",  bg: "border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20" },
  reasoning: { icon: "→", color: "text-blue-600 dark:text-blue-400",      bg: "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20" },
  open:      { icon: "?", color: "text-amber-600 dark:text-amber-400",    bg: "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20" },
  clarify:   { icon: "↻", color: "text-indigo-600 dark:text-indigo-400",  bg: "border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20" },
  changed:   { icon: "↕", color: "text-slate-500 dark:text-slate-400",    bg: "border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20" },
};

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function ConclusionLoadingSkeleton({ isProvisional }: { isProvisional?: boolean }) {
  const keys = isProvisional
    ? (["leading", "open", "clarify", "changed"] as const)
    : (["adopted", "rejected", "open", "next"] as const);

  const metas = isProvisional ? PROVISIONAL_SECTION_META : FINAL_SECTION_META;

  return (
    <div className="px-4 py-4 space-y-2.5 animate-pulse">
      {keys.map((key) => {
        const meta = metas[key as keyof typeof metas];
        return (
          <div key={key} className={`flex gap-3 px-3.5 py-3 rounded-xl border ${meta.bg}`}>
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
      <p className="text-sm text-muted-foreground/70 leading-relaxed">{t.conclusionError}</p>
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

// ─── Unresolved state (AI couldn't generate even a provisional) ───────────────

function ConclusionUnresolvedState({
  onContinue,
  onProvisional,
  onAddCondition,
}: {
  onContinue?:     () => void;
  onProvisional?:  () => void;
  onAddCondition?: () => void;
}) {
  const { t, locale } = useLocale();
  return (
    <div className="px-5 py-5 space-y-4">
      <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/20 px-4 py-3.5">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">{t.conclusionUnresolved}</p>
        <p className="text-xs text-amber-700/70 dark:text-amber-400/60 leading-relaxed">{t.conclusionUnresolvedDesc}</p>
      </div>
      <div className="space-y-2">
        {onContinue && (
          <button onClick={onContinue} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-border bg-background hover:bg-card transition-colors text-left">
            <div className="shrink-0 w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center">
              <PlayIcon size={10} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{t.conclusionContinue}</p>
              <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                {locale === "ja" ? "次ラウンドを追加して議論を深める" : "Add another round to deepen the debate"}
              </p>
            </div>
          </button>
        )}
        {onProvisional && (
          <button onClick={onProvisional} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-border bg-background hover:bg-card transition-colors text-left">
            <div className="shrink-0 w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center">
              <PlayIcon size={10} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{t.conclusionProvisional}</p>
              <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                {locale === "ja" ? "完全収束でなくても現時点の最善案を出す" : "Extract the best current option without full consensus"}
              </p>
            </div>
          </button>
        )}
        {onAddCondition && (
          <button onClick={onAddCondition} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-border bg-background hover:bg-card transition-colors text-left">
            <div className="shrink-0 w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
              <PlayIcon size={10} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{t.conclusionAddCondition}</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Checkpoint action buttons (always rendered at the TOP of card body) ──────

function CheckpointActions({
  onEndHere,
  onContinueDiscussion,
}: {
  onEndHere?:            () => void;
  onContinueDiscussion?: (direction: string) => void;
}) {
  const { t, locale } = useLocale();
  const [showDirection, setShowDirection] = useState(false);
  const [direction,     setDirection]     = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleContinueClick() {
    setShowDirection(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function submitContinue() {
    onContinueDiscussion?.(direction.trim());
    setShowDirection(false);
    setDirection("");
  }

  // Direction input view
  if (showDirection) {
    return (
      <div className="px-4 pt-4 pb-3 space-y-2.5 border-b border-border/30">
        <p className="text-[10px] text-muted-foreground/60">
          {locale === "ja" ? "次の議論で重視したいことがあれば入力してください（任意）" : "Add direction for the next round (optional)"}
        </p>
        <textarea
          ref={textareaRef}
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          rows={2}
          placeholder={
            locale === "ja"
              ? "例: 有名どころ重視で進めて / 子ども優先 / 予算を抑えたい"
              : "e.g. Focus on top-rated options / Keep it budget-friendly"
          }
          className="w-full text-sm bg-background border border-border/60 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/30 leading-relaxed"
          onKeyDown={(e) => {
            // On mobile, Enter = newline. Submit only via button.
            if (e.key === "Escape") { setShowDirection(false); setDirection(""); return; }
            if (!isMobile() && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitContinue(); }
          }}
          enterKeyHint={isMobile() ? "enter" : "send"}
        />
        <div className="flex gap-2">
          <button
            onClick={submitContinue}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 active:scale-[0.98] transition-all"
          >
            <PlayIcon size={11} />
            {direction.trim()
              ? (locale === "ja" ? "条件を加えて続ける" : "Add & continue")
              : (locale === "ja" ? "そのまま続ける" : "Continue as-is")}
          </button>
          <button
            onClick={() => { setShowDirection(false); setDirection(""); }}
            className="px-3 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:bg-accent transition-colors"
          >
            {locale === "ja" ? "戻る" : "Back"}
          </button>
        </div>
      </div>
    );
  }

  // Default view
  return (
    <div className="px-4 pt-4 pb-3 space-y-2 border-b border-border/30">
      <p className="text-[10px] text-muted-foreground/50">
        {locale === "ja" ? "この先どうしますか？" : "What would you like to do next?"}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {onEndHere && (
          <button
            onClick={onEndHere}
            className="flex flex-col items-start gap-1 px-3.5 py-3 rounded-xl border border-border bg-background hover:bg-card active:scale-[0.98] transition-all text-left"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircleIcon size={12} className="text-emerald-500 shrink-0" />
              <span className="text-xs font-semibold text-foreground">{t.endHere}</span>
            </div>
            <p className="text-[10px] text-muted-foreground/50 leading-snug">{t.endHereDesc}</p>
          </button>
        )}
        {onContinueDiscussion && (
          <button
            onClick={handleContinueClick}
            className="flex flex-col items-start gap-1 px-3.5 py-3 rounded-xl border border-violet-200/70 dark:border-violet-800/40 bg-violet-50/40 dark:bg-violet-950/20 hover:bg-violet-50/70 dark:hover:bg-violet-950/30 active:scale-[0.98] transition-all text-left"
          >
            <div className="flex items-center gap-1.5">
              <PlayIcon size={12} className="text-violet-500 shrink-0" />
              <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">{t.continueDiscussion}</span>
            </div>
            <p className="text-[10px] text-violet-600/50 dark:text-violet-400/40 leading-snug">{t.continueDiscussionDesc}</p>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Provisional conclusion body ───────────────────────────────────────────────

function ProvisionalConclusionBody({ conclusion, locale }: { conclusion: ConclusionData; locale: string }) {
  const { t } = useLocale();
  const sections = parseProvisionalSections(conclusion.summary);
  const labelMap: Record<keyof Omit<ProvisionalSections, "fallback">, string> = {
    leading:   t.leadingOption,
    reasoning: t.conclusionReasoning,
    open:      t.openQuestionsLabel,
    clarify:   t.clarifyNext,
    changed:   t.whatChanged,
  };

  const hasStructured = sections.leading || sections.open || sections.clarify;
  if (!hasStructured && !sections.fallback) {
    return (
      <div className="px-5 py-7 text-center">
        <p className="text-sm text-muted-foreground/50">{t.conclusionError}</p>
      </div>
    );
  }

  return (
    <>
      {sections.fallback ? (
        <div className="px-5 py-4">
          <p className="text-sm text-foreground leading-[1.75] whitespace-pre-line">{sections.fallback}</p>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-2.5">
          {(["leading", "reasoning", "open", "clarify", "changed"] as const).map((key) => {
            const sec = sections[key];
            if (!sec) return null;
            const meta = PROVISIONAL_SECTION_META[key];
            return (
              <div key={key} className={`flex gap-3 px-3.5 py-3 rounded-xl border ${meta.bg}`}>
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

// ─── Final conclusion body ─────────────────────────────────────────────────────

function FinalConclusionBody({ conclusion, locale }: { conclusion: ConclusionData; locale: string }) {
  const { t } = useLocale();
  const sections = parseFinalSections(conclusion.summary);
  const labelMap = {
    adopted:  locale === "ja" ? "採用" : "Adopted",
    rejected: locale === "ja" ? "棄却" : "Rejected",
    open:     locale === "ja" ? "残論点" : "Open questions",
    next:     locale === "ja" ? "次アクション" : "Next action",
  };

  const hasStructured = sections.adopted || sections.rejected || sections.open || sections.next;
  if (!hasStructured && !sections.fallback) {
    return (
      <div className="px-5 py-7 text-center">
        <p className="text-sm text-muted-foreground/50">{t.conclusionError}</p>
      </div>
    );
  }

  return (
    <>
      {sections.fallback ? (
        <div className="px-5 py-4">
          <p className="text-sm text-foreground leading-[1.75] whitespace-pre-line">{sections.fallback}</p>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-2.5">
          {(["adopted", "rejected", "open", "next"] as const).map((key) => {
            const sec = sections[key];
            if (!sec) return null;
            const meta = FINAL_SECTION_META[key];
            return (
              <div key={key} className={`flex gap-3 px-3.5 py-3 rounded-xl border ${meta.bg}`}>
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

// ─── Smart conclusion body (auto-detects format) ──────────────────────────────

function ConclusionBody({ conclusion, locale }: { conclusion: ConclusionData; locale: string }) {
  const provisional = conclusion.isProvisional || isProvisionalFormat(conclusion.summary);
  return provisional
    ? <ProvisionalConclusionBody conclusion={conclusion} locale={locale} />
    : <FinalConclusionBody conclusion={conclusion} locale={locale} />;
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
  const { t } = useLocale();
  const versionNum = total - index;
  const isProvis = conclusion.isProvisional && !conclusion.isFinal;
  const badge = isProvis ? t.provisionalBadge : conclusion.isFinal ? t.finalBadge : null;

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
          {badge && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
              isProvis
                ? "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                : "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
            }`}>
              {badge}
            </span>
          )}
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

export default function ConclusionCard({
  runCount,
  conclusions,
  conclusionStatus,
  onRerun,
  onContinue,
  onProvisional,
  onAddCondition,
  onEndHere,
  onContinueDiscussion,
}: Props) {
  const [isOpen,          setIsOpen]          = useState(false);
  const [showHistory,     setShowHistory]     = useState(false);
  const [isNewlyUpdated,  setIsNewlyUpdated]  = useState(false);
  const prevStatus      = useRef<ConclusionStatus>("idle");
  const prevConcCount   = useRef(0);
  const { t, locale }   = useLocale();

  // Auto-open + flash when a new conclusion/checkpoint arrives.
  // NOTE: Do NOT auto-open when status is "loading" — avoids "jump to conclusion" UX bug.
  useEffect(() => {
    const wasLoading      = prevStatus.current === "loading";
    const wasProvisional  = prevStatus.current === "provisional";
    const isNowSuccess    = conclusionStatus === "provisional" || conclusionStatus === "final";
    const isNowFinal      = conclusionStatus === "final";
    const newConcArrived  = conclusions.length > prevConcCount.current;

    // Open + flash when:
    //  1. A new conclusion arrives (loading → provisional/final, or count increases)
    //  2. User clicks "ここで終える" (provisional → final) — keep card open & flash
    const shouldOpenFlash =
      (isNowSuccess && (wasLoading || newConcArrived)) ||
      (isNowFinal && wasProvisional);

    if (shouldOpenFlash) {
      setIsOpen(true);
      setIsNewlyUpdated(true);
      const timer = setTimeout(() => setIsNewlyUpdated(false), 2200);
      prevStatus.current    = conclusionStatus;
      prevConcCount.current = conclusions.length;
      return () => clearTimeout(timer);
    }

    prevStatus.current    = conclusionStatus;
    prevConcCount.current = conclusions.length;
  }, [conclusionStatus, conclusions.length]);

  const current      = conclusions[0] ?? null;
  const history      = conclusions.slice(1);
  const hasConc      = !!current && !!current.summary?.trim();
  const isLoading    = conclusionStatus === "loading";
  const isError      = conclusionStatus === "error";
  const isUnresolved = conclusionStatus === "unresolved";
  const isProvisional = conclusionStatus === "provisional";
  const isFinal       = conclusionStatus === "final";

  // Card header title
  const titleLabel = isProvisional
    ? t.provisionalConclusion
    : isFinal
    ? t.finalConclusion
    : t.conclusion;

  // Badge label
  const badgeLabel = isLoading
    ? (locale === "ja" ? "生成中" : "Generating")
    : isError
    ? (locale === "ja" ? "エラー" : "Error")
    : isUnresolved
    ? (locale === "ja" ? "未確定" : "Unresolved")
    : isProvisional
    ? t.provisionalBadge
    : hasConc
    ? t.runsCount(runCount)
    : undefined;

  return (
    <div className="mx-3 sm:mx-4 mb-2">
      {/* ── Main toggle ── */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm border transition-all duration-300 ${
          isOpen
            ? "border-b-0 rounded-t-2xl bg-card border-border/60"
            : "rounded-2xl bg-card border-border/60 hover:border-foreground/15 hover:shadow-[0_2px_12px_rgba(0,0,0,0.05)] active:scale-[0.99]"
        } ${isNewlyUpdated ? "ring-2 ring-emerald-400/50 ring-offset-0" : ""}`}
      >
        <div className="flex items-center gap-2 text-foreground">
          <span className={`text-base leading-none select-none ${isLoading ? "animate-spin" : ""} ${
            isError ? "text-rose-400/70"
            : isUnresolved ? "text-amber-400/70"
            : isProvisional ? "text-violet-400/70"
            : isFinal ? "text-emerald-500/80"
            : isNewlyUpdated ? "text-emerald-500/70"
            : "text-foreground/30"
          }`}>
            {isError ? "!" : isUnresolved ? "◎" : isProvisional ? "◐" : "◈"}
          </span>
          <span className="text-sm font-semibold">{titleLabel}</span>
          {badgeLabel && (
            <span className={`text-[11px] font-normal ${
              isError ? "text-rose-500/70"
              : isUnresolved ? "text-amber-500/70"
              : isLoading ? "text-blue-500/70"
              : isProvisional ? "text-violet-500/70"
              : "text-muted-foreground/50"
            }`}>
              {badgeLabel}
            </span>
          )}
          {isNewlyUpdated && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
              {locale === "ja" ? "更新" : "Updated"}
            </span>
          )}
          {!isLoading && !isError && !isUnresolved && !isNewlyUpdated && history.length > 0 && (
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
        {/* accordion-inner must have overflow:hidden for the CSS grid animation.
            We constrain height + scroll on the inner content instead. */}
        <div className="accordion-inner">
          {isLoading ? (
            <ConclusionLoadingSkeleton isProvisional />
          ) : isError ? (
            <ConclusionErrorState onRerun={onRerun} />
          ) : isUnresolved ? (
            <ConclusionUnresolvedState
              onContinue={onContinue}
              onProvisional={onProvisional}
              onAddCondition={onAddCondition}
            />
          ) : hasConc ? (
            <>
              {/* ── Checkpoint action buttons — at the TOP so they're always visible ── */}
              {isProvisional && (
                <CheckpointActions
                  onEndHere={onEndHere}
                  onContinueDiscussion={(direction) => {
                    // Collapse the card immediately so the new round is visible
                    setIsOpen(false);
                    onContinueDiscussion?.(direction);
                  }}
                />
              )}

              {/* ── Scrollable conclusion body ── */}
              <div className="overflow-y-auto max-h-[42vh]">
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

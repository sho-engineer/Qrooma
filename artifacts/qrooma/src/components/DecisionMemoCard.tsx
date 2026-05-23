import { useState } from "react";
import {
  CheckCircleIcon, XCircleIcon, ClockIcon, HelpCircleIcon,
  ZapIcon, ChevronDownIcon, ClipboardIcon, CheckIcon,
} from "lucide-react";
import type { DecisionMemo, DecisionMemoNextAction } from "../types";
import { useLocale } from "../context/LocaleContext";

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function doCopy() {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    }
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      onClick={doCopy}
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-lg border transition-all ${
        copied
          ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
          : "border-border hover:bg-accent text-muted-foreground hover:text-foreground"
      }`}
    >
      {copied ? <CheckIcon size={8} /> : <ClipboardIcon size={8} />}
      {copied ? "Copied" : label}
    </button>
  );
}

// ─── Scope quadrant row ───────────────────────────────────────────────────────

interface ScopeItem { item: string; reason: string; revisit_condition?: string }

function ScopeSection({
  icon, title, colorClass, bgClass, borderClass, items,
}: {
  icon: React.ReactNode;
  title: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  items: ScopeItem[];
}) {
  if (!items.length) return null;
  return (
    <div className={`rounded-xl border px-3 py-2.5 space-y-1.5 ${bgClass} ${borderClass}`}>
      <div className={`flex items-center gap-1.5 text-[11px] font-bold mb-1 ${colorClass}`}>
        {icon}
        {title}
      </div>
      {items.map((it, i) => (
        <div key={i} className="text-[11px] leading-relaxed">
          <span className="font-medium text-foreground">{it.item}</span>
          {it.reason && (
            <span className="text-muted-foreground"> — {it.reason}</span>
          )}
          {it.revisit_condition && (
            <div className="mt-0.5 text-[10px] text-amber-600 dark:text-amber-400">
              ↻ {it.revisit_condition}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Axis evaluation chip ─────────────────────────────────────────────────────

function AxisChip({ axis, evaluation, reason }: { axis: string; evaluation: string; reason: string }) {
  const colorMap: Record<string, string> = {
    chosen:     "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
    not_chosen: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400",
    partial:    "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
  };
  const iconMap: Record<string, string> = { chosen: "✓", not_chosen: "✗", partial: "~" };
  const cls = colorMap[evaluation] ?? colorMap.partial;
  return (
    <div className={`rounded-lg border px-2.5 py-1.5 ${cls}`}>
      <div className="flex items-center gap-1 text-[10px] font-bold mb-0.5">
        <span>{iconMap[evaluation] ?? "·"}</span>
        <span>{axis}</span>
      </div>
      {reason && <p className="text-[10px] opacity-80 leading-snug">{reason}</p>}
    </div>
  );
}

// ─── Next action row ──────────────────────────────────────────────────────────

function NextActionRow({ action, index, t }: { action: DecisionMemoNextAction; index: number; t: ReturnType<typeof useLocale>["t"] }) {
  const pColor = action.priority === "high"
    ? "text-rose-500 dark:text-rose-400"
    : action.priority === "medium"
    ? "text-amber-500 dark:text-amber-400"
    : "text-muted-foreground/60";
  return (
    <div className="flex gap-2.5 py-1.5 border-b border-border/30 last:border-0">
      <span className="shrink-0 w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground/70 mt-0.5">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <span className="text-[11px] font-semibold text-foreground">{action.task}</span>
          <span className={`text-[9px] font-bold uppercase tracking-wide ${pColor}`}>
            {t.decisionMemoPriority(action.priority)}
          </span>
          {action.requires_human_review && (
            <span className="text-[9px] px-1 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 font-medium">
              {t.decisionMemoHumanReview}
            </span>
          )}
        </div>
        {action.purpose && (
          <p className="text-[10px] text-muted-foreground leading-snug">{action.purpose}</p>
        )}
        {action.expected_output && (
          <p className="text-[10px] text-muted-foreground/60 leading-snug mt-0.5 italic">→ {action.expected_output}</p>
        )}
      </div>
    </div>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function Accordion({ title, icon, count, defaultOpen, children }: {
  title: string; icon: React.ReactNode; count?: number;
  defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div>
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between py-1.5 text-left group"
      >
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/70 group-hover:text-foreground transition-colors">
          {icon}
          {title}
          {count != null && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground/60 font-medium">{count}</span>
          )}
        </div>
        <ChevronDownIcon
          size={11}
          className={`text-muted-foreground/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
}

// ─── Main DecisionMemoCard ────────────────────────────────────────────────────

interface Props {
  memo: DecisionMemo;
  generatedAt?: string;
}

function memoToMarkdown(memo: DecisionMemo, locale: string): string {
  const isJa = locale === "ja";
  const lines: string[] = [
    isJa ? "# Decision Memo" : "# Decision Memo",
    "",
    isJa ? `## 採用した判断` : `## Decision`,
    memo.decision,
    "",
    isJa ? `## 背景` : `## Background`,
    memo.background,
    "",
    isJa ? `## 採用理由` : `## Reasoning`,
    memo.reasoning,
    "",
  ];

  if (memo.axis_evaluations?.length) {
    lines.push(isJa ? `## 比較軸評価` : `## Axis Evaluations`, "");
    memo.axis_evaluations.forEach(a => {
      const e = a.evaluation === "chosen" ? "✓" : a.evaluation === "not_chosen" ? "✗" : "~";
      lines.push(`- [${e}] **${a.axis}**: ${a.reason}`);
    });
    lines.push("");
  }

  if (memo.do_now?.length) {
    lines.push(isJa ? `## 今やる` : `## Do Now`, "");
    memo.do_now.forEach(i => lines.push(`- ${i.item} — ${i.reason}`));
    lines.push("");
  }

  if (memo.not_now?.length) {
    lines.push(isJa ? `## 今回やらない` : `## Not Now`, "");
    memo.not_now.forEach(i => lines.push(`- ${i.item} — ${i.reason}`));
    lines.push("");
  }

  if (memo.future_consideration?.length) {
    lines.push(isJa ? `## 後で検討` : `## Future Consideration`, "");
    memo.future_consideration.forEach(i => {
      lines.push(`- ${i.item} — ${i.reason}`);
      if (i.revisit_condition) lines.push(`  ↻ ${i.revisit_condition}`);
    });
    lines.push("");
  }

  if (memo.needs_confirmation?.length) {
    lines.push(isJa ? `## 追加確認が必要` : `## Needs Confirmation`, "");
    memo.needs_confirmation.forEach(i => lines.push(`- ${i.item} — ${i.reason}`));
    lines.push("");
  }

  if (memo.next_actions?.length) {
    lines.push(isJa ? `## 次アクション` : `## Next Actions`, "");
    memo.next_actions.forEach((a, i) => {
      lines.push(`${i + 1}. **${a.task}** [${a.priority}]`);
      if (a.purpose) lines.push(`   目的: ${a.purpose}`);
      if (a.expected_output) lines.push(`   完了条件: ${a.expected_output}`);
    });
    lines.push("");
  }

  if (memo.conditions_that_change_decision?.length) {
    lines.push(isJa ? `## 判断が変わる条件` : `## Conditions That Change the Decision`, "");
    memo.conditions_that_change_decision.forEach(c => lines.push(`- ${c}`));
  }

  return lines.join("\n").trim();
}

export default function DecisionMemoCard({ memo, generatedAt }: Props) {
  const { t, locale } = useLocale();

  const mdText = memoToMarkdown(memo, locale);

  return (
    <div className="space-y-3">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground/80">{t.decisionMemoTitle}</span>
          {generatedAt && (
            <span className="text-[10px] text-muted-foreground/50">
              {new Date(generatedAt).toLocaleString(locale === "ja" ? "ja-JP" : "en-US", {
                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </span>
          )}
        </div>
        <CopyBtn text={mdText} label={t.decisionMemoCopy} />
      </div>

      {/* ── Decision ── */}
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 px-4 py-3">
        <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
          {t.decisionMemoDecision}
        </p>
        <p className="text-sm font-semibold text-foreground leading-relaxed">{memo.decision}</p>
      </div>

      {/* ── Background + Reasoning ── */}
      {(memo.background || memo.reasoning) && (
        <div className="space-y-2 px-0.5">
          {memo.background && (
            <div>
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-0.5">
                {t.decisionMemoBackground}
              </p>
              <p className="text-[11px] text-foreground/80 leading-relaxed">{memo.background}</p>
            </div>
          )}
          {memo.reasoning && (
            <div>
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-0.5">
                {t.decisionMemoReasoning}
              </p>
              <p className="text-[11px] text-foreground/80 leading-relaxed">{memo.reasoning}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Axis evaluations ── */}
      {memo.axis_evaluations?.length > 0 && (
        <Accordion
          title={t.decisionMemoAxes}
          icon={<span className="text-[10px]">⚖</span>}
          count={memo.axis_evaluations.length}
          defaultOpen
        >
          <div className="grid grid-cols-1 gap-1.5">
            {memo.axis_evaluations.map((ax, i) => (
              <AxisChip key={i} axis={ax.axis} evaluation={ax.evaluation} reason={ax.reason} />
            ))}
          </div>
        </Accordion>
      )}

      {/* ── Scope 4-way classification ── */}
      <div className="space-y-1.5">
        <ScopeSection
          icon={<ZapIcon size={10} />}
          title={t.decisionMemoDoNow}
          colorClass="text-emerald-700 dark:text-emerald-400"
          bgClass="bg-emerald-50/50 dark:bg-emerald-950/20"
          borderClass="border-emerald-200 dark:border-emerald-800"
          items={memo.do_now ?? []}
        />
        <ScopeSection
          icon={<XCircleIcon size={10} />}
          title={t.decisionMemoNotNow}
          colorClass="text-rose-600 dark:text-rose-400"
          bgClass="bg-rose-50/50 dark:bg-rose-950/20"
          borderClass="border-rose-200 dark:border-rose-800"
          items={memo.not_now ?? []}
        />
        <ScopeSection
          icon={<ClockIcon size={10} />}
          title={t.decisionMemoFuture}
          colorClass="text-amber-600 dark:text-amber-400"
          bgClass="bg-amber-50/50 dark:bg-amber-950/20"
          borderClass="border-amber-200 dark:border-amber-800"
          items={memo.future_consideration ?? []}
        />
        <ScopeSection
          icon={<HelpCircleIcon size={10} />}
          title={t.decisionMemoNeedsConfirmation}
          colorClass="text-blue-600 dark:text-blue-400"
          bgClass="bg-blue-50/50 dark:bg-blue-950/20"
          borderClass="border-blue-200 dark:border-blue-800"
          items={memo.needs_confirmation ?? []}
        />
      </div>

      {/* ── Next actions ── */}
      {memo.next_actions?.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1.5 px-0.5">
            {t.decisionMemoNextActions}
          </p>
          <div className="rounded-xl border border-border/50 px-3 py-1.5">
            {memo.next_actions.map((action, i) => (
              <NextActionRow key={i} action={action} index={i} t={t} />
            ))}
          </div>
        </div>
      )}

      {/* ── Conditions that change decision ── */}
      {memo.conditions_that_change_decision?.length > 0 && (
        <Accordion
          title={t.decisionMemoConditions}
          icon={<CheckCircleIcon size={10} className="text-muted-foreground/60" />}
          count={memo.conditions_that_change_decision.length}
        >
          <ul className="space-y-1 mt-1">
            {memo.conditions_that_change_decision.map((c, i) => (
              <li key={i} className="text-[11px] text-muted-foreground leading-relaxed flex gap-1.5">
                <span className="text-muted-foreground/40 shrink-0">·</span>
                {c}
              </li>
            ))}
          </ul>
        </Accordion>
      )}
    </div>
  );
}

export { memoToMarkdown };

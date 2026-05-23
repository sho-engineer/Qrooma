import { useState } from "react";
import {
  ChevronDownIcon, ClipboardIcon, CheckIcon,
  FileTextIcon, ListIcon, CalendarClockIcon,
} from "lucide-react";
import type { ConclusionData, DecisionMemo } from "../types";
import { useLocale } from "../context/LocaleContext";
import { memoToMarkdown } from "./DecisionMemoCard";

// ─── Local types ──────────────────────────────────────────────────────────────

interface TaskItem {
  name: string;
  priority: "high" | "medium" | "low";
  needsHumanReview: boolean;
}

interface FutureItem {
  name: string;
  reasonDeferred?: string;
  reconsiderCondition?: string;
}

// ─── Section parsers ──────────────────────────────────────────────────────────

const RE = {
  adopted:  /\[採用\][^\n]*\n?([\s\S]*?)(?=\[棄却\]|\[残論点\]|\[次アクション\]|\[将来検討\]|$)/i,
  rejected: /\[棄却\][^\n]*\n?([\s\S]*?)(?=\[採用\]|\[残論点\]|\[次アクション\]|\[将来検討\]|$)/i,
  open:     /\[残論点\][^\n]*\n?([\s\S]*?)(?=\[採用\]|\[棄却\]|\[次アクション\]|\[将来検討\]|$)/i,
  next:     /\[次アクション\][^\n]*\n?([\s\S]*?)(?=\[採用\]|\[棄却\]|\[残論点\]|\[将来検討\]|$)/i,
  future:   /\[将来検討\][^\n]*\n?([\s\S]*?)(?=\[採用\]|\[棄却\]|\[残論点\]|\[次アクション\]|$)/i,
};

function sect(text: string, key: keyof typeof RE): string | null {
  return text.match(RE[key])?.[1]?.trim() || null;
}

function hasMarkers(text: string): boolean {
  return /\[採用\]|\[棄却\]|\[残論点\]|\[次アクション\]/.test(text);
}

function parseTasks(summary: string, keyPoints: string[]): TaskItem[] {
  const raw = sect(summary, "next");
  const lines = raw
    ? raw.split("\n").map(l => l.replace(/^[\d]+\.\s*|^[•\-\*]\s*/, "").trim()).filter(l => l.length > 3)
    : (keyPoints ?? []).slice(0, 5);
  return lines.map((name, i) => ({
    name,
    priority: (i === 0 ? "high" : i < 3 ? "medium" : "low") as TaskItem["priority"],
    needsHumanReview: true,
  }));
}

function parseFutureItems(summary: string): FutureItem[] {
  const raw = sect(summary, "future");
  if (!raw) return [];
  return raw.split("\n")
    .map(l => l.replace(/^[\d]+\.\s*|^[•\-\*]\s*/, "").trim())
    .filter(l => l.length > 0)
    .map(name => ({ name }));
}

// ─── Markdown generators ──────────────────────────────────────────────────────

function mdBrief(conclusion: ConclusionData, locale: string): string {
  const isJa = locale === "ja";
  const { summary, keyPoints } = conclusion;
  const lines: string[] = ["# Decision Brief", ""];

  if (hasMarkers(summary)) {
    const adopted  = sect(summary, "adopted");
    const rejected = sect(summary, "rejected");
    const open     = sect(summary, "open");
    const next     = sect(summary, "next");
    const future   = sect(summary, "future");
    if (adopted)  lines.push(`## ${isJa ? "採用案" : "Adopted"}`,  adopted,  "");
    if (rejected) lines.push(`## ${isJa ? "棄却案" : "Rejected"}`, rejected, "");
    if (open)     lines.push(`## ${isJa ? "残論点" : "Open Questions"}`, open, "");
    if (next)     lines.push(`## ${isJa ? "次アクション" : "Next Actions"}`, next, "");
    if (future)   lines.push(`## ${isJa ? "将来検討" : "Future Considerations"}`, future, "");
  } else {
    lines.push(summary, "");
    if (keyPoints?.length) {
      lines.push(`## ${isJa ? "要点" : "Key Points"}`, "");
      keyPoints.forEach(p => lines.push(`- ${p}`));
    }
  }
  return lines.join("\n").trim();
}

function mdTasks(tasks: TaskItem[], locale: string): string {
  const isJa = locale === "ja";
  const lines: string[] = [isJa ? "# タスクリスト" : "# Task List", ""];
  tasks.forEach((task, i) => {
    lines.push(`## ${isJa ? `タスク ${i + 1}` : `Task ${i + 1}`}: ${task.name}`);
    const p = isJa
      ? (task.priority === "high" ? "高" : task.priority === "medium" ? "中" : "低")
      : task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    lines.push(`- ${isJa ? "優先度" : "Priority"}: ${p}`);
    lines.push(`- ${isJa ? "人間確認" : "Human Review"}: ${task.needsHumanReview ? (isJa ? "必要" : "Yes") : (isJa ? "不要" : "No")}`);
    lines.push("");
  });
  return lines.join("\n").trim();
}

function mdFuture(items: FutureItem[], locale: string): string {
  if (!items.length) return "";
  const isJa = locale === "ja";
  const lines: string[] = [isJa ? "# 将来検討" : "# Future Considerations", ""];
  items.forEach((item, i) => {
    lines.push(`${i + 1}. ${item.name}`);
    if (item.reasonDeferred) lines.push(`   - ${isJa ? "今回やらない理由" : "Why deferred"}: ${item.reasonDeferred}`);
    if (item.reconsiderCondition) lines.push(`   - ${isJa ? "再検討条件" : "Reconsider when"}: ${item.reconsiderCondition}`);
  });
  return lines.join("\n").trim();
}

function mdAll(conclusion: ConclusionData, tasks: TaskItem[], items: FutureItem[], locale: string): string {
  const parts = [mdBrief(conclusion, locale), mdTasks(tasks, locale)];
  const future = mdFuture(items, locale);
  if (future) parts.push(future);
  return parts.join("\n\n---\n\n");
}

function mdGenericAI(conclusion: ConclusionData, tasks: TaskItem[], locale: string): string {
  const isJa = locale === "ja";
  const adopted  = sect(conclusion.summary, "adopted")  ?? conclusion.summary.slice(0, 300);
  const rejected = sect(conclusion.summary, "rejected") ?? (isJa ? "(なし)" : "None");
  const open     = sect(conclusion.summary, "open")     ?? (isJa ? "(なし)" : "None");
  const next     = sect(conclusion.summary, "next")     ?? "";
  const future   = sect(conclusion.summary, "future")   ?? "";

  if (isJa) {
    return [
      "# 汎用AIプロンプト", "",
      "以下の情報を踏まえて、私の判断を支援してください。", "",
      "## 背景",
      conclusion.summary.slice(0, 200), "",
      "## 目的",
      "以下の決定事項に基づき、次の行動を明確にすること。", "",
      "## 決定事項",
      adopted, "",
      "## 採用案", adopted, "",
      "## 棄却案", rejected, "",
      "## 残論点", open, "",
      "## 次アクション",
      ...tasks.map((t, i) => `${i + 1}. ${t.name}`), "",
      ...(future ? ["## 将来検討", future, ""] : []),
      "## 期待アウトプット",
      "- 各タスクの具体的な実行手順",
      "- 残論点に対する意見・見解",
      "- 優先度の高いアクションの特定", "",
      "## 注意点",
      "- 人間が最終判断を行う前提で支援すること",
      "- 「ケースバイケース」で終わらず、具体的な方向性を示すこと",
      `- ${next ? `特に次のアクションを優先: ${next}` : "採用案の実行を最優先とすること"}`,
    ].join("\n").trim();
  }

  return [
    "# Generic AI Prompt", "",
    "Please help me based on the following decision context.", "",
    "## Background",
    conclusion.summary.slice(0, 200), "",
    "## Purpose",
    "Clarify the next steps based on the decisions made.", "",
    "## Decision Summary",
    adopted, "",
    "## Adopted Approach", adopted, "",
    "## Rejected Options", rejected, "",
    "## Open Questions", open, "",
    "## Next Actions",
    ...tasks.map((t, i) => `${i + 1}. ${t.name}`), "",
    ...(future ? ["## Future Considerations", future, ""] : []),
    "## Expected Output",
    "- Concrete steps for each task",
    "- Opinions on open questions",
    "- Identification of highest-priority actions", "",
    "## Notes",
    "- The human makes the final decision — your role is to support",
    "- Do not end with 'it depends' — provide a directional recommendation",
    `- ${next ? `Prioritize this action first: ${next}` : "Focus on executing the adopted approach"}`,
  ].join("\n").trim();
}

function mdBuildPrompt(conclusion: ConclusionData, tasks: TaskItem[], locale: string): string {
  const isJa    = locale === "ja";
  const adopted  = sect(conclusion.summary, "adopted")  ?? conclusion.summary.slice(0, 300);
  const rejected = sect(conclusion.summary, "rejected") ?? (isJa ? "(なし)" : "None");
  const open     = sect(conclusion.summary, "open")     ?? (isJa ? "(なし)" : "None");

  if (isJa) {
    return [
      "# 実装用プロンプト", "",
      "以下の仕様に基づいて実装を進めてください。", "",
      "## 実装目的",
      adopted, "",
      "## 採用仕様",
      adopted, "",
      "## やらないこと（スコープ外）",
      rejected, "",
      "## 受け入れ条件",
      ...tasks.map((t, i) => `${i + 1}. ${t.name}`), "",
      "## 残論点（確認事項）", open, "",
      "## UI要件",
      "- 既存のUIパターン・デザインシステムに従うこと",
      "- モバイル対応を考慮すること",
      "- アクセシビリティを意識すること", "",
      "## 注意点",
      "- 各ステップを実施前に人間に確認すること",
      "- 大きな変更の前にはバックアップを取ること",
      "- スコープ外の変更は行わないこと", "",
      "## 返してほしいもの",
      "- 実装した変更内容の一覧",
      "- 確認が必要な箇所のリスト",
      "- テスト方法の提案",
    ].join("\n").trim();
  }

  return [
    "# Build Prompt", "",
    "Please implement based on the following specification.", "",
    "## Implementation Goal",
    adopted, "",
    "## Adopted Specification",
    adopted, "",
    "## Out of Scope (do NOT implement)",
    rejected, "",
    "## Acceptance Criteria",
    ...tasks.map((t, i) => `${i + 1}. ${t.name}`), "",
    "## Open Questions (confirm before proceeding)", open, "",
    "## UI Requirements",
    "- Follow existing UI patterns and design system",
    "- Ensure mobile responsiveness",
    "- Consider accessibility", "",
    "## Notes",
    "- Confirm with the user before each major step",
    "- Do not make changes outside the defined scope",
    "- Back up before large structural changes", "",
    "## Expected Output",
    "- List of implemented changes",
    "- List of items requiring human review",
    "- Testing recommendations",
  ].join("\n").trim();
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ label, text, small }: { label: string; text: string; small?: boolean }) {
  const [copied, setCopied] = useState(false);
  const { t } = useLocale();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 rounded-lg border transition-all font-medium ${
        copied
          ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
          : "border-border hover:bg-accent text-muted-foreground hover:text-foreground"
      } ${small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"}`}
    >
      {copied ? <CheckIcon size={9} /> : <ClipboardIcon size={9} />}
      {copied ? t.handoffCopied : label}
    </button>
  );
}

// ─── Accordion section ────────────────────────────────────────────────────────

function Section({
  icon, title, badge, defaultOpen, children,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {icon}
          <span className="text-[11px] font-semibold text-foreground truncate">{title}</span>
          {badge != null && (
            <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground/60 font-medium">
              {badge}
            </span>
          )}
        </div>
        <ChevronDownIcon
          size={11}
          className={`shrink-0 ml-2 text-muted-foreground/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="border-t border-border/30">{children}</div>}
    </div>
  );
}

// ─── Decision Brief content ───────────────────────────────────────────────────

function DecisionBriefContent({ conclusion, locale }: { conclusion: ConclusionData; locale: string }) {
  const isJa = locale === "ja";
  const { summary, keyPoints } = conclusion;
  const structured = hasMarkers(summary);

  if (!structured) {
    return (
      <div className="px-3.5 py-3 space-y-2.5">
        <p className="text-[12px] text-foreground leading-relaxed">{summary}</p>
        {(keyPoints ?? []).length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
              {isJa ? "要点" : "Key Points"}
            </p>
            <ul className="space-y-1">
              {keyPoints.map((kp, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[12px] text-foreground/80">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground/30 shrink-0" />
                  {kp}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  const entries: Array<{ label: string; content: string | null; color: string }> = [
    { label: isJa ? "採用案" : "Adopted",        content: sect(summary, "adopted"),  color: "text-emerald-600 dark:text-emerald-400" },
    { label: isJa ? "棄却案" : "Rejected",        content: sect(summary, "rejected"), color: "text-rose-600 dark:text-rose-400"    },
    { label: isJa ? "残論点" : "Open Questions",  content: sect(summary, "open"),     color: "text-amber-600 dark:text-amber-400"  },
    { label: isJa ? "次アクション" : "Next Actions", content: sect(summary, "next"),  color: "text-blue-600 dark:text-blue-400"    },
    { label: isJa ? "将来検討" : "Future",        content: sect(summary, "future"),   color: "text-violet-600 dark:text-violet-400" },
  ].filter(e => e.content);

  return (
    <div className="px-3.5 py-3 space-y-2">
      {entries.map(({ label, content, color }) => (
        <div key={label}>
          <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${color}`}>{label}</p>
          <p className="text-[12px] text-foreground/80 leading-relaxed whitespace-pre-line">{content}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Task List content ────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  high:   { label: { ja: "高", en: "High" },   cls: "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400" },
  medium: { label: { ja: "中", en: "Medium" }, cls: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" },
  low:    { label: { ja: "低", en: "Low" },    cls: "bg-muted text-muted-foreground/60" },
};

function TaskListContent({ tasks, locale }: { tasks: TaskItem[]; locale: string }) {
  const isJa = locale === "ja";
  const { t } = useLocale();
  if (!tasks.length) {
    return <p className="px-3.5 py-3 text-xs text-muted-foreground/50">{t.handoffNoTasks}</p>;
  }
  return (
    <div className="px-3.5 py-3 space-y-2">
      {tasks.map((task, i) => {
        const pc = PRIORITY_CONFIG[task.priority];
        return (
          <div key={i} className="flex items-start gap-2 py-1.5 border-b border-border/20 last:border-0">
            <span className="shrink-0 mt-0.5 w-4 h-4 rounded-full bg-muted text-[9px] font-bold text-muted-foreground/60 flex items-center justify-center">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-foreground leading-snug">{task.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${pc.cls}`}>
                  {pc.label[isJa ? "ja" : "en"]}
                </span>
                {task.needsHumanReview && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold">
                    {isJa ? "人間確認" : "Human review"}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Future Consideration content ────────────────────────────────────────────

function FutureContent({ items, locale }: { items: FutureItem[]; locale: string }) {
  const isJa = locale === "ja";
  const { t } = useLocale();
  if (!items.length) {
    return <p className="px-3.5 py-3 text-xs text-muted-foreground/40">{t.handoffNoFuture}</p>;
  }
  return (
    <div className="px-3.5 py-3 space-y-2">
      {items.map((item, i) => (
        <div key={i} className="space-y-0.5">
          <div className="flex items-start gap-1.5">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-violet-400/60 shrink-0" />
            <p className="text-[12px] text-foreground/80">{item.name}</p>
          </div>
          {item.reasonDeferred && (
            <p className="ml-2.5 text-[10px] text-muted-foreground/50">
              {isJa ? "理由:" : "Why deferred:"} {item.reasonDeferred}
            </p>
          )}
          {item.reconsiderCondition && (
            <p className="ml-2.5 text-[10px] text-muted-foreground/50">
              {isJa ? "再検討条件:" : "Reconsider when:"} {item.reconsiderCondition}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Decision Memo to Markdown for copy (when memo is available) ──────────────

function memoToTaskListMd(memo: DecisionMemo, locale: string): string {
  const isJa = locale === "ja";
  const lines: string[] = [isJa ? "# タスクリスト" : "# Task List", ""];
  (memo.next_actions ?? []).forEach((a, i) => {
    lines.push(`${i + 1}. **${a.task}**`);
    if (a.purpose)          lines.push(`   ${isJa ? "目的" : "Purpose"}: ${a.purpose}`);
    if (a.expected_output)  lines.push(`   ${isJa ? "完了条件" : "Done when"}: ${a.expected_output}`);
    const p = isJa
      ? (a.priority === "high" ? "高" : a.priority === "medium" ? "中" : "低")
      : a.priority.charAt(0).toUpperCase() + a.priority.slice(1);
    lines.push(`   ${isJa ? "優先度" : "Priority"}: ${p}`);
    lines.push("");
  });
  return lines.join("\n").trim();
}

function memoToGenericAIMd(memo: DecisionMemo, locale: string): string {
  const isJa = locale === "ja";
  if (isJa) {
    return [
      "# 汎用AIプロンプト", "",
      "以下の決定情報を踏まえて、私の判断を支援してください。", "",
      "## 決断",      memo.decision, "",
      "## 背景",      memo.background, "",
      "## 採用理由",  memo.reasoning, "",
      "## 今やること",
      ...(memo.do_now ?? []).map(i => `- ${i.item}: ${i.reason}`), "",
      "## やらないこと",
      ...(memo.not_now ?? []).map(i => `- ${i.item}: ${i.reason}`), "",
      "## 次アクション",
      ...(memo.next_actions ?? []).map((a, i) => `${i + 1}. ${a.task}`), "",
      "## 期待アウトプット",
      "- 具体的な実行手順",
      "- 残論点への見解",
      "- 優先度の高いアクションの特定",
    ].join("\n").trim();
  }
  return [
    "# Generic AI Prompt", "",
    "Please help me based on the following decision.", "",
    "## Decision",   memo.decision, "",
    "## Background", memo.background, "",
    "## Reasoning",  memo.reasoning, "",
    "## Do Now",
    ...(memo.do_now ?? []).map(i => `- ${i.item}: ${i.reason}`), "",
    "## Not Now",
    ...(memo.not_now ?? []).map(i => `- ${i.item}: ${i.reason}`), "",
    "## Next Actions",
    ...(memo.next_actions ?? []).map((a, i) => `${i + 1}. ${a.task}`), "",
    "## Expected Output",
    "- Concrete implementation steps",
    "- Thoughts on open questions",
    "- Identification of highest-priority actions",
  ].join("\n").trim();
}

function memoBuildPromptMd(memo: DecisionMemo, locale: string): string {
  const isJa = locale === "ja";
  if (isJa) {
    return [
      "# 実装プロンプト", "",
      "以下の仕様に基づいて実装してください。", "",
      "## 実装目的",     memo.decision, "",
      "## 背景・制約",   memo.background, "",
      "## 採用スコープ（今やること）",
      ...(memo.do_now ?? []).map(i => `- ${i.item}`), "",
      "## スコープ外（今回やらないこと）",
      ...(memo.not_now ?? []).map(i => `- ${i.item}: ${i.reason}`), "",
      "## 追加確認が必要な項目",
      ...(memo.needs_confirmation ?? []).map(i => `- ${i.item}`), "",
      "## 受け入れ条件",
      ...(memo.next_actions ?? []).map((a, i) => `${i + 1}. ${a.expected_output || a.task}`), "",
      "## 注意点",
      "- 各ステップを実施前に人間に確認すること",
      "- スコープ外の変更は行わないこと",
    ].join("\n").trim();
  }
  return [
    "# Build Prompt", "",
    "Please implement based on the following specification.", "",
    "## Goal",          memo.decision, "",
    "## Background",    memo.background, "",
    "## In Scope (Do Now)",
    ...(memo.do_now ?? []).map(i => `- ${i.item}`), "",
    "## Out of Scope (Not Now)",
    ...(memo.not_now ?? []).map(i => `- ${i.item}: ${i.reason}`), "",
    "## Needs Confirmation",
    ...(memo.needs_confirmation ?? []).map(i => `- ${i.item}`), "",
    "## Acceptance Criteria",
    ...(memo.next_actions ?? []).map((a, i) => `${i + 1}. ${a.expected_output || a.task}`), "",
    "## Notes",
    "- Confirm with the human before each major step",
    "- Do not change anything outside the defined scope",
  ].join("\n").trim();
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  conclusion: ConclusionData;
}

export default function HandoffPanel({ conclusion }: Props) {
  const { t, locale } = useLocale();
  const isJa = locale === "ja";

  const hasMemo = !!conclusion.decisionMemo;
  const memo    = conclusion.decisionMemo;

  const tasks       = parseTasks(conclusion.summary, conclusion.keyPoints ?? []);
  const futureItems = parseFutureItems(conclusion.summary);

  // Copy texts — prefer Decision Memo when available
  const briefText     = hasMemo && memo ? memoToMarkdown(memo, locale)           : mdBrief(conclusion, locale);
  const taskText      = hasMemo && memo ? memoToTaskListMd(memo, locale)         : mdTasks(tasks, locale);
  const genericAIText = hasMemo && memo ? memoToGenericAIMd(memo, locale)        : mdGenericAI(conclusion, tasks, locale);
  const buildText     = hasMemo && memo ? memoBuildPromptMd(memo, locale)        : mdBuildPrompt(conclusion, tasks, locale);
  const allText       = hasMemo && memo
    ? memoToMarkdown(memo, locale)
    : mdAll(conclusion, tasks, futureItems, locale);

  return (
    <div className="border-t border-border/30 mt-1">
      {/* Section header */}
      <div className="px-4 pt-3 pb-1.5 flex items-center gap-2">
        <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.12em]">
          {isJa ? "出力" : "Outputs"}
        </span>
      </div>

      {/* Accordion sections — only shown when no structured DecisionMemo */}
      {!hasMemo && (
        <div className="px-4 space-y-1.5 pb-3">
          <Section
            icon={<FileTextIcon size={11} className="text-muted-foreground/50 shrink-0" />}
            title={t.handoffDecisionBrief}
            defaultOpen
          >
            <DecisionBriefContent conclusion={conclusion} locale={locale} />
          </Section>

          <Section
            icon={<ListIcon size={11} className="text-muted-foreground/50 shrink-0" />}
            title={t.handoffTaskList}
            badge={t.handoffTaskCount(tasks.length)}
          >
            <TaskListContent tasks={tasks} locale={locale} />
          </Section>

          <Section
            icon={<CalendarClockIcon size={11} className="text-muted-foreground/50 shrink-0" />}
            title={t.handoffFutureConsiderations}
            badge={t.handoffFutureCount(futureItems.length)}
          >
            <FutureContent items={futureItems} locale={locale} />
          </Section>
        </div>
      )}

      {/* Copy buttons — 4 types */}
      <div className="px-4 pb-4 border-t border-border/20 pt-2.5">
        <p className="text-[9px] text-muted-foreground/30 uppercase tracking-widest mb-2">
          {isJa ? "コピー" : "Export"}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <CopyButton label={t.handoffCopyDecisionMemo} text={briefText} />
          <CopyButton label={t.handoffCopyTaskList2}    text={taskText} />
          <CopyButton label={t.handoffCopyGenericAI2}   text={genericAIText} small />
          <CopyButton label={t.handoffCopyBuildPrompt}  text={buildText} small />
        </div>
      </div>
    </div>
  );
}

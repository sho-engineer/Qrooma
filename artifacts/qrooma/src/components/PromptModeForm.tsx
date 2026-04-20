import { useState, useRef } from "react";
import { SlidersHorizontalIcon, XIcon, PlayIcon, PlusIcon, ZapIcon } from "lucide-react";
import type { PromptConfig, OutputDepth, ChallengeLevel } from "../types";
import { useLocale } from "../context/LocaleContext";

// ─── Topic placeholder examples ───────────────────────────────────────────────

const TOPIC_PLACEHOLDERS_JA = [
  "新機能を今期に入れるべきか検討したい",
  "テレワーク導入方針を決めたい",
  "採用優先順位を比較したい",
  "価格改定の是非を判断したい",
  "営業施策の優先順位を決めたい",
  "開発ロードマップの選択肢を整理したい",
];

const TOPIC_PLACEHOLDERS_EN = [
  "Should we ship this feature this quarter?",
  "Decide on a remote work policy",
  "Compare hiring priorities",
  "Evaluate a pricing change",
  "Prioritize sales initiatives",
  "Organize development roadmap options",
];

// ─── Preset data ──────────────────────────────────────────────────────────────

const GOAL_PRESETS = [
  { id: "recommend", ja: "おすすめを決めたい",         en: "Get a recommendation" },
  { id: "compare",   ja: "比較して優先順位を決めたい",  en: "Compare and prioritize" },
  { id: "risk",      ja: "リスクを洗い出したい",        en: "Identify risks" },
  { id: "plan",      ja: "実行プランを作りたい",        en: "Build an action plan" },
];

const AXIS_PRESETS_JA = [
  "ROI", "実装コスト", "導入スピード", "社内負荷",
  "インパクト", "再現性", "継続性", "顧客価値",
  "オペレーション負荷", "学習コスト",
  "コスト", "リスク", "実行しやすさ", "満足度",
];
const AXIS_PRESETS_EN = [
  "ROI", "Implementation cost", "Time to deploy", "Internal burden",
  "Impact", "Reproducibility", "Sustainability", "Customer value",
  "Operational load", "Learning curve",
  "Cost", "Risk", "Ease of execution", "Satisfaction",
];

// ─── Quick-start templates ─────────────────────────────────────────────────────

interface Template {
  id: string;
  ja: string;
  en: string;
  config: Partial<PromptConfig>;
  topicHint_ja: string;
  topicHint_en: string;
}

const TEMPLATES: Template[] = [
  {
    id: "measure-compare",
    ja: "施策比較",
    en: "Strategy comparison",
    topicHint_ja: "例: マーケ施策A・B・Cをどれを優先すべきか",
    topicHint_en: "e.g. Which marketing initiative to prioritize: A, B, or C",
    config: {
      goal:           "比較して優先順位を決めたい",
      comparisonAxes: ["ROI", "実装コスト", "導入スピード", "リスク"],
    },
  },
  {
    id: "hiring",
    ja: "採用判断",
    en: "Hiring decision",
    topicHint_ja: "例: 候補者AとBどちらを採用すべきか",
    topicHint_en: "e.g. Should we hire candidate A or B?",
    config: {
      goal:           "おすすめを決めたい",
      comparisonAxes: ["コスト", "スキル適合度", "導入スピード", "継続性"],
    },
  },
  {
    id: "feature-priority",
    ja: "新機能優先順位",
    en: "Feature prioritization",
    topicHint_ja: "例: Q3の開発候補から何を優先すべきか",
    topicHint_en: "e.g. What features should we prioritize for Q3?",
    config: {
      goal:           "比較して優先順位を決めたい",
      comparisonAxes: ["顧客価値", "実装コスト", "インパクト", "リスク"],
    },
  },
  {
    id: "pricing",
    ja: "価格戦略",
    en: "Pricing strategy",
    topicHint_ja: "例: 価格改定（値上げ・据え置き・値下げ）の判断",
    topicHint_en: "e.g. Should we raise, hold, or lower our pricing?",
    config: {
      goal:           "リスクを洗い出したい",
      comparisonAxes: ["ROI", "顧客価値", "継続性", "リスク"],
    },
  },
  {
    id: "ops",
    ja: "組織・運営",
    en: "Org & operations",
    topicHint_ja: "例: 組織改編の選択肢を比較したい",
    topicHint_en: "e.g. Compare restructuring options",
    config: {
      goal:           "比較して優先順位を決めたい",
      comparisonAxes: ["社内負荷", "オペレーション負荷", "リスク", "継続性"],
    },
  },
  {
    id: "risk-review",
    ja: "リスクレビュー",
    en: "Risk review",
    topicHint_ja: "例: 新規事業立ち上げのリスクを洗い出したい",
    topicHint_en: "e.g. Identify risks for a new business launch",
    config: {
      goal:           "リスクを洗い出したい",
      comparisonAxes: ["リスク", "インパクト", "再現性", "社内負荷"],
    },
  },
];

const OUTPUT_DEPTH_OPTIONS: { value: OutputDepth; ja: string; en: string; hint_ja: string; hint_en: string }[] = [
  {
    value:   "rough",
    ja:      "ラフな案出し",
    en:      "Rough ideation",
    hint_ja: "大まかな方向感をつかむ",
    hint_en: "Grasp the landscape",
  },
  {
    value:   "compare",
    ja:      "比較して絞る",
    en:      "Compare & narrow",
    hint_ja: "軸で比べて候補を絞る",
    hint_en: "Compare by axes, narrow down",
  },
  {
    value:   "concrete",
    ja:      "実行レベルまで具体化",
    en:      "Fully concrete",
    hint_ja: "すぐ動けるレベルまで",
    hint_en: "Ready to act immediately",
  },
];

const CHALLENGE_LEVEL_OPTIONS: { value: ChallengeLevel; ja: string; en: string }[] = [
  { value: "soft",     ja: "ソフト",    en: "Soft" },
  { value: "standard", ja: "標準",      en: "Standard" },
  { value: "strong",   ja: "ストロング", en: "Strong" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">
      {children}
    </p>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border touch-manipulation ${
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-card text-foreground/60 border-border hover:border-foreground/40"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  onSubmit: (config: PromptConfig, topic: string) => void;
  onCancel: () => void;
}

const DEFAULT_CONFIG: PromptConfig = {
  goal:           "",
  decisionTarget: "",
  comparisonAxes: [],
  constraints:    "",
  priorities:     "",
  outputDepth:    "compare",
  challengeLevel: "standard",
};

export default function PromptModeForm({ onSubmit, onCancel }: Props) {
  const { locale } = useLocale();
  const ja = locale === "ja";

  const [config, setConfig] = useState<PromptConfig>(DEFAULT_CONFIG);
  const [customGoal, setCustomGoal] = useState("");
  const [topic, setTopic]           = useState("");
  const [selectedGoalId, setSelectedGoalId]         = useState<string | null>(null);
  const [activeTemplateId, setActiveTemplateId]     = useState<string | null>(null);
  const [topicPlaceholder]                          = useState(() => {
    const pool = ja ? TOPIC_PLACEHOLDERS_JA : TOPIC_PLACEHOLDERS_EN;
    return pool[Math.floor(Math.random() * pool.length)];
  });

  // "その他" axis support
  const [showCustomAxis, setShowCustomAxis] = useState(false);
  const [customAxisInput, setCustomAxisInput] = useState("");
  const customAxisRef = useRef<HTMLInputElement>(null);

  function toggleAxis(axis: string) {
    setConfig((prev) => ({
      ...prev,
      comparisonAxes: prev.comparisonAxes.includes(axis)
        ? prev.comparisonAxes.filter((a) => a !== axis)
        : [...prev.comparisonAxes, axis],
    }));
  }

  function addCustomAxis() {
    const trimmed = customAxisInput.trim();
    if (!trimmed) return;
    if (!config.comparisonAxes.includes(trimmed)) {
      setConfig((prev) => ({
        ...prev,
        comparisonAxes: [...prev.comparisonAxes, trimmed],
      }));
    }
    setCustomAxisInput("");
    customAxisRef.current?.focus();
  }

  function removeCustomAxis(axis: string) {
    setConfig((prev) => ({
      ...prev,
      comparisonAxes: prev.comparisonAxes.filter((a) => a !== axis),
    }));
  }

  /** Custom axes = axes not in the preset list */
  const axisPresetsSet = new Set(ja ? AXIS_PRESETS_JA : AXIS_PRESETS_EN);
  const customAxes = config.comparisonAxes.filter((a) => !axisPresetsSet.has(a));

  function selectGoal(id: string, label: string) {
    setSelectedGoalId(id);
    setCustomGoal("");
    setConfig((prev) => ({ ...prev, goal: label }));
  }

  function handleCustomGoal(val: string) {
    setCustomGoal(val);
    setSelectedGoalId(null);
    setConfig((prev) => ({ ...prev, goal: val }));
  }

  function applyTemplate(tpl: Template) {
    if (activeTemplateId === tpl.id) {
      setActiveTemplateId(null);
      return;
    }
    setActiveTemplateId(tpl.id);
    const goalLabel = ja ? tpl.config.goal! : tpl.config.goal!;
    const matchedGoal = GOAL_PRESETS.find((g) =>
      g.ja === goalLabel || g.en === goalLabel
    );
    if (matchedGoal) {
      setSelectedGoalId(matchedGoal.id);
      setCustomGoal("");
    } else {
      setSelectedGoalId(null);
      setCustomGoal(goalLabel);
    }
    setConfig((prev) => ({
      ...prev,
      goal:           tpl.config.goal  ?? prev.goal,
      comparisonAxes: tpl.config.comparisonAxes ?? prev.comparisonAxes,
    }));
  }

  const canSubmit = !!topic.trim() && !!config.goal.trim();

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit(config, topic.trim());
  }

  const axisPresets = ja ? AXIS_PRESETS_JA : AXIS_PRESETS_EN;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontalIcon size={14} className="text-primary" />
          <span className="text-sm font-semibold">
            {ja ? "プロンプトモード" : "Prompt Mode"}
          </span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <XIcon size={14} />
        </button>
      </div>

      {/* Scrollable form body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

        {/* ── Quick-start templates ───────────────────────────────────────── */}
        <div>
          <SectionLabel>
            <span className="flex items-center gap-1.5">
              <ZapIcon size={9} className="inline text-muted-foreground/50" />
              {ja ? "クイックテンプレート" : "Quick templates"}
            </span>
          </SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border touch-manipulation ${
                  activeTemplateId === tpl.id
                    ? "bg-foreground text-background border-foreground"
                    : "bg-muted/40 text-foreground/55 border-border/60 hover:border-foreground/30 hover:text-foreground/80"
                }`}
              >
                {ja ? tpl.ja : tpl.en}
              </button>
            ))}
          </div>
          {activeTemplateId && (() => {
            const tpl = TEMPLATES.find((t) => t.id === activeTemplateId);
            return tpl ? (
              <p className="mt-1.5 text-[11px] text-muted-foreground/50 italic">
                {ja ? tpl.topicHint_ja : tpl.topicHint_en}
              </p>
            ) : null;
          })()}
        </div>

        {/* Topic */}
        <div>
          <SectionLabel>{ja ? "何を検討・判断したいですか？" : "What do you want to decide or discuss?"}</SectionLabel>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={`${ja ? "例: " : "e.g. "}${topicPlaceholder}`}
            rows={2}
            className="w-full text-sm bg-muted/30 border border-border rounded-xl px-3 py-2 resize-none outline-none focus:border-foreground/40 placeholder:text-muted-foreground/40 leading-relaxed"
          />
        </div>

        {/* A: 議論の目的 */}
        <div>
          <SectionLabel>{ja ? "A. 議論の目的" : "A. Discussion goal"}</SectionLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {GOAL_PRESETS.map((g) => (
              <Chip
                key={g.id}
                active={selectedGoalId === g.id}
                onClick={() => selectGoal(g.id, ja ? g.ja : g.en)}
              >
                {ja ? g.ja : g.en}
              </Chip>
            ))}
          </div>
          <input
            type="text"
            value={customGoal}
            onChange={(e) => handleCustomGoal(e.target.value)}
            placeholder={ja ? "または自由入力…" : "Or type your own…"}
            className="w-full text-sm bg-muted/30 border border-border rounded-xl px-3 py-2 outline-none focus:border-foreground/40 placeholder:text-muted-foreground/40"
          />
        </div>

        {/* B: 最終的に決めたいこと */}
        <div>
          <SectionLabel>{ja ? "B. 最終的に決めたいこと" : "B. Decision target"}</SectionLabel>
          <input
            type="text"
            value={config.decisionTarget}
            onChange={(e) => setConfig((p) => ({ ...p, decisionTarget: e.target.value }))}
            placeholder={ja
              ? "例: 施策を1つ選ぶ / 候補を3つまで絞る / 導入方針を決める"
              : "e.g. Pick one initiative / Narrow to 3 options / Decide on rollout policy"}
            className="w-full text-sm bg-muted/30 border border-border rounded-xl px-3 py-2 outline-none focus:border-foreground/40 placeholder:text-muted-foreground/40"
          />
        </div>

        {/* C: 比較軸 */}
        <div>
          <SectionLabel>
            {ja ? "C. 比較軸（複数可）" : "C. Comparison axes (multi-select)"}
          </SectionLabel>
          <div className="flex flex-wrap gap-2">
            {axisPresets.map((axis) => (
              <Chip
                key={axis}
                active={config.comparisonAxes.includes(axis)}
                onClick={() => toggleAxis(axis)}
              >
                {axis}
              </Chip>
            ))}
            {/* "その他" chip */}
            <Chip
              active={showCustomAxis}
              onClick={() => {
                setShowCustomAxis((v) => !v);
                if (!showCustomAxis) {
                  setTimeout(() => customAxisRef.current?.focus(), 50);
                }
              }}
            >
              {ja ? "+ その他" : "+ Custom"}
            </Chip>
          </div>

          {/* Custom axis input */}
          {showCustomAxis && (
            <div className="mt-2.5 space-y-2">
              <div className="flex gap-2">
                <input
                  ref={customAxisRef}
                  type="text"
                  value={customAxisInput}
                  onChange={(e) => setCustomAxisInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addCustomAxis(); }
                  }}
                  placeholder={ja ? "例: 市場規模 / ブランド整合性 / 差別化度" : "e.g. Market size / Brand fit / Differentiation"}
                  className="flex-1 text-sm bg-muted/30 border border-border rounded-xl px-3 py-1.5 outline-none focus:border-foreground/40 placeholder:text-muted-foreground/40"
                />
                <button
                  type="button"
                  onClick={addCustomAxis}
                  disabled={!customAxisInput.trim()}
                  className="p-1.5 rounded-xl border border-border text-foreground/60 hover:text-foreground hover:border-foreground/40 disabled:opacity-30 transition-colors"
                  title={ja ? "追加" : "Add"}
                >
                  <PlusIcon size={14} />
                </button>
              </div>

              {/* Custom axes already added */}
              {customAxes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {customAxes.map((ax) => (
                    <span
                      key={ax}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-foreground text-background border border-foreground"
                    >
                      {ax}
                      <button
                        type="button"
                        onClick={() => removeCustomAxis(ax)}
                        className="opacity-60 hover:opacity-100 transition-opacity -mr-0.5"
                      >
                        <XIcon size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* D: 制約条件 */}
        <div>
          <SectionLabel>{ja ? "D. 制約条件（任意）" : "D. Constraints (optional)"}</SectionLabel>
          <input
            type="text"
            value={config.constraints}
            onChange={(e) => setConfig((p) => ({ ...p, constraints: e.target.value }))}
            placeholder={ja
              ? "例: 予算100万円以内 / 2か月以内に実施 / 追加採用なし / 現体制で回す"
              : "e.g. Budget under ¥1M / Ship within 2 months / No new hires / Current team only"}
            className="w-full text-sm bg-muted/30 border border-border rounded-xl px-3 py-2 outline-none focus:border-foreground/40 placeholder:text-muted-foreground/40"
          />
        </div>

        {/* E: 優先順位 */}
        <div>
          <SectionLabel>{ja ? "E. 優先順位（任意）" : "E. Priorities (optional)"}</SectionLabel>
          <input
            type="text"
            value={config.priorities}
            onChange={(e) => setConfig((p) => ({ ...p, priorities: e.target.value }))}
            placeholder={ja
              ? "例: 1.スピード　2.コスト　3.リスク最小化"
              : "e.g. 1. Speed  2. Cost  3. Risk minimization"}
            className="w-full text-sm bg-muted/30 border border-border rounded-xl px-3 py-2 outline-none focus:border-foreground/40 placeholder:text-muted-foreground/40"
          />
        </div>

        {/* F: 出力の粒度 */}
        <div>
          <SectionLabel>{ja ? "F. 出力の粒度" : "F. Output depth"}</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            {OUTPUT_DEPTH_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setConfig((p) => ({ ...p, outputDepth: opt.value }))}
                className={`flex flex-col gap-0.5 px-2 py-2.5 rounded-xl border text-left transition-all touch-manipulation ${
                  config.outputDepth === opt.value
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card border-border text-foreground/70 hover:border-foreground/40"
                }`}
              >
                <span className="text-[11px] font-semibold leading-tight">
                  {ja ? opt.ja : opt.en}
                </span>
                <span className={`text-[10px] leading-tight ${config.outputDepth === opt.value ? "text-background/70" : "text-muted-foreground/50"}`}>
                  {ja ? opt.hint_ja : opt.hint_en}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* G: 反論の強さ */}
        <div>
          <SectionLabel>{ja ? "G. 反論の強さ" : "G. Challenge level"}</SectionLabel>
          <div className="flex rounded-xl border border-border overflow-hidden">
            {CHALLENGE_LEVEL_OPTIONS.map((opt, i) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setConfig((p) => ({ ...p, challengeLevel: opt.value }))}
                className={`flex-1 py-2 text-xs font-medium transition-all touch-manipulation ${
                  i > 0 ? "border-l border-border" : ""
                } ${
                  config.challengeLevel === opt.value
                    ? "bg-foreground text-background"
                    : "bg-card text-foreground/60 hover:bg-muted/50"
                }`}
              >
                {ja ? opt.ja : opt.en}
              </button>
            ))}
          </div>
        </div>

        {/* H: 最終判断 */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border/60 bg-muted/20">
          <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 shrink-0" />
          <p className="text-[11px] text-muted-foreground/70">
            {ja ? "H. 最終判断は人間が行う" : "H. Final decision is made by the human"}
          </p>
        </div>

        {/* Bottom padding for safe area */}
        <div className="h-2" />
      </div>

      {/* Submit button */}
      <div className="shrink-0 px-4 pb-4 pt-2 border-t border-border/60 bg-background">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-foreground text-background text-sm font-semibold disabled:opacity-30 transition-opacity active:scale-[0.98] touch-manipulation"
        >
          <PlayIcon size={13} />
          {ja ? "議論スタート" : "Start Debate"}
        </button>
        {!canSubmit && (
          <p className="mt-1.5 text-center text-[11px] text-muted-foreground/50">
            {ja ? "トピックと目的を入力してください" : "Enter topic and goal to continue"}
          </p>
        )}
      </div>
    </div>
  );
}

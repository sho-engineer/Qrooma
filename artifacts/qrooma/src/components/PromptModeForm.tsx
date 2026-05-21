import { useState, useRef } from "react";
import {
  SlidersHorizontalIcon, XIcon, PlayIcon, PlusIcon,
  ChevronDownIcon, CheckIcon,
} from "lucide-react";
import type { PromptConfig, ComparisonAxis, OutputDepth, ChallengeLevel } from "../types";
import { useLocale } from "../context/LocaleContext";

// ─── Templates ────────────────────────────────────────────────────────────────

interface TemplateAxis { ja: string; en: string }

interface Template {
  id:           string;
  ja:           string;
  en:           string;
  topicHint_ja: string;
  topicHint_en: string;
  axes:         TemplateAxis[];
}

const TEMPLATES: Template[] = [
  {
    id: "mvp-scope",
    ja: "MVPスコープ決定",
    en: "MVP Scope",
    topicHint_ja: "例: 次のMVPリリースでどの機能を優先すべきか",
    topicHint_en: "e.g. Which features to prioritize for the next MVP release",
    axes: [
      { ja: "コア価値への近さ",         en: "Core value proximity" },
      { ja: "実装コスト",               en: "Implementation cost" },
      { ja: "リリース速度",             en: "Release speed" },
      { ja: "ユーザーへの分かりやすさ", en: "User clarity" },
      { ja: "将来拡張性",               en: "Future extensibility" },
    ],
  },
  {
    id: "feature-priority",
    ja: "新機能優先順位",
    en: "Feature Priority",
    topicHint_ja: "例: Q3の開発候補から何を優先すべきか",
    topicHint_en: "e.g. Which features to prioritize for Q3",
    axes: [
      { ja: "顧客価値",     en: "Customer value" },
      { ja: "実装しやすさ", en: "Ease of implementation" },
      { ja: "差別化",       en: "Differentiation" },
      { ja: "利用頻度",     en: "Usage frequency" },
      { ja: "リスク",       en: "Risk" },
    ],
  },
  {
    id: "lp-messaging",
    ja: "LP / 訴求比較",
    en: "LP / Messaging",
    topicHint_ja: "例: サービスの打ち出し方やメッセージを決めたい",
    topicHint_en: "e.g. Which messaging angle works best for our LP",
    axes: [
      { ja: "分かりやすさ",    en: "Clarity" },
      { ja: "刺さりやすさ",    en: "Resonance" },
      { ja: "差別化",          en: "Differentiation" },
      { ja: "信頼感",          en: "Trust" },
      { ja: "CTAにつながるか", en: "CTA effectiveness" },
    ],
  },
  {
    id: "implementation",
    ja: "実装方針比較",
    en: "Implementation",
    topicHint_ja: "例: 技術方針や実装方法を比較したい",
    topicHint_en: "e.g. Compare implementation approaches or tech choices",
    axes: [
      { ja: "実装速度",   en: "Development speed" },
      { ja: "保守性",     en: "Maintainability" },
      { ja: "複雑性",     en: "Complexity" },
      { ja: "将来拡張性", en: "Future extensibility" },
      { ja: "バグリスク", en: "Bug risk" },
    ],
  },
  {
    id: "pricing",
    ja: "価格 / プラン設計",
    en: "Pricing / Plans",
    topicHint_ja: "例: Free / Pro のプラン設計を考えたい",
    topicHint_en: "e.g. Design Free / Pro plan structure and limits",
    axes: [
      { ja: "収益性",             en: "Revenue potential" },
      { ja: "ユーザーの納得感",   en: "User acceptance" },
      { ja: "運営コスト",         en: "Operational cost" },
      { ja: "アップグレード導線", en: "Upgrade path" },
      { ja: "シンプルさ",         en: "Simplicity" },
    ],
  },
];

// ─── Option lists ──────────────────────────────────────────────────────────────

const OUTPUT_DEPTH_OPTIONS: {
  value: OutputDepth; ja: string; en: string; hint_ja: string; hint_en: string
}[] = [
  { value: "rough",   ja: "Quick",    en: "Quick",    hint_ja: "方向感をつかむ",       hint_en: "Grasp the landscape" },
  { value: "compare", ja: "Standard", en: "Standard", hint_ja: "軸で比べて絞る",       hint_en: "Compare by axes" },
  { value: "concrete", ja: "Detailed", en: "Detailed", hint_ja: "実行レベルまで具体化", hint_en: "Ready to act" },
];

const CHALLENGE_LEVEL_OPTIONS: { value: ChallengeLevel; ja: string; en: string }[] = [
  { value: "soft",     ja: "Soft",     en: "Soft" },
  { value: "standard", ja: "Standard", en: "Standard" },
  { value: "strong",   ja: "Strong",   en: "Strong" },
];

const WEIGHTS: { value: ComparisonAxis["weight"]; ja: string; en: string }[] = [
  { value: "high",   ja: "高", en: "High" },
  { value: "medium", ja: "中", en: "Med" },
  { value: "low",    ja: "低", en: "Low" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-2">
      {children}
    </p>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 my-0.5">
      <div className="flex-1 h-px bg-border/40" />
      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-border/40" />
    </div>
  );
}

// ─── Default config ────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: PromptConfig = {
  goal:           "",
  decisionTarget: "",
  comparisonAxes: [],
  constraints:    "",
  priorities:     "",
  outputDepth:    "compare",
  challengeLevel: "standard",
};

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  onSubmit: (config: PromptConfig, topic: string) => void;
  onCancel: () => void;
}

export default function PromptModeForm({ onSubmit, onCancel }: Props) {
  const { locale } = useLocale();
  const ja = locale === "ja";

  // form state
  const [topic,          setTopic]          = useState("");
  const [decisionTarget, setDecisionTarget] = useState("");
  const [constraints,    setConstraints]    = useState("");
  const [outputDepth,    setOutputDepth]    = useState<OutputDepth>(DEFAULT_CONFIG.outputDepth);
  const [challengeLevel, setChallengeLevel] = useState<ChallengeLevel>(DEFAULT_CONFIG.challengeLevel);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [showAdvanced,   setShowAdvanced]   = useState(false);

  // axis weights: key = axis name (localized), value = weight. Presence means selected.
  const [axisWeights, setAxisWeights] = useState<Record<string, ComparisonAxis["weight"]>>({});
  // custom axes added by the user (not from the active template)
  const [customAxisNames, setCustomAxisNames] = useState<string[]>([]);
  const [customAxisInput, setCustomAxisInput] = useState("");
  const [showCustomAxis,  setShowCustomAxis]  = useState(false);
  const customAxisRef = useRef<HTMLInputElement>(null);

  // build the full pool of axis names to show as chips
  const templateAxeNames: string[] = activeTemplate
    ? activeTemplate.axes.map(a => ja ? a.ja : a.en)
    : [];
  const allAxisNames = [
    ...templateAxeNames,
    ...customAxisNames.filter(n => !templateAxeNames.includes(n)),
  ];

  // derive ordered selected axes from the pool
  const selectedAxes: ComparisonAxis[] = allAxisNames
    .filter(n => n in axisWeights)
    .map(n => ({ name: n, weight: axisWeights[n] }));

  function applyTemplate(tpl: Template) {
    if (activeTemplate?.id === tpl.id) {
      setActiveTemplate(null);
      setAxisWeights({});
      return;
    }
    setActiveTemplate(tpl);
    const weights: Record<string, ComparisonAxis["weight"]> = {};
    tpl.axes.forEach(a => { weights[ja ? a.ja : a.en] = "medium"; });
    setAxisWeights(weights);
  }

  function toggleAxis(name: string) {
    setAxisWeights(prev => {
      if (name in prev) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return { ...prev, [name]: "medium" };
    });
  }

  function setWeight(name: string, w: ComparisonAxis["weight"]) {
    setAxisWeights(prev => ({ ...prev, [name]: w }));
  }

  function addCustomAxis() {
    const trimmed = customAxisInput.trim();
    if (!trimmed) return;
    if (!customAxisNames.includes(trimmed) && !templateAxeNames.includes(trimmed)) {
      setCustomAxisNames(prev => [...prev, trimmed]);
    }
    setAxisWeights(prev => ({ ...prev, [trimmed]: "medium" }));
    setCustomAxisInput("");
    customAxisRef.current?.focus();
  }

  function removeCustomAxis(name: string) {
    setCustomAxisNames(prev => prev.filter(n => n !== name));
    setAxisWeights(prev => { const next = { ...prev }; delete next[name]; return next; });
  }

  const canSubmit = !!topic.trim() && !!decisionTarget.trim();

  function handleSubmit() {
    if (!canSubmit) return;
    const config: PromptConfig = {
      goal:           decisionTarget.trim(),
      decisionTarget: decisionTarget.trim(),
      comparisonAxes: selectedAxes,
      constraints:    constraints.trim(),
      priorities:     "",
      outputDepth,
      challengeLevel,
      templateId:     activeTemplate?.id,
    };
    onSubmit(config, topic.trim());
  }

  return (
    <div className="flex flex-col h-full bg-background">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-3 border-b border-border/60 shrink-0">
        <div className="flex items-center gap-2">
          <SlidersHorizontalIcon size={13} className="text-primary" />
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

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

        {/* ─ Section 1: Template ─ */}
        <div>
          <SectionLabel>{ja ? "テンプレート" : "Template"}</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border touch-manipulation ${
                  activeTemplate?.id === tpl.id
                    ? "bg-foreground text-background border-foreground"
                    : "bg-muted/40 text-foreground/55 border-border/60 hover:border-foreground/30 hover:text-foreground/80"
                }`}
              >
                {ja ? tpl.ja : tpl.en}
              </button>
            ))}
          </div>
          {activeTemplate && (
            <p className="mt-2 text-[11px] text-muted-foreground/45 italic">
              {ja ? activeTemplate.topicHint_ja : activeTemplate.topicHint_en}
            </p>
          )}
        </div>

        <Divider label={ja ? "必須項目" : "Required"} />

        {/* ─ 検討テーマ ─ */}
        <div>
          <SectionLabel>{ja ? "検討テーマ" : "Topic"}</SectionLabel>
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder={
              activeTemplate
                ? (ja ? activeTemplate.topicHint_ja : activeTemplate.topicHint_en)
                : (ja
                    ? "例: 次のMVPリリースでどの機能を優先すべきか検討したい"
                    : "e.g. Which features should we prioritize for the next MVP release?")
            }
            rows={2}
            className="w-full text-sm bg-muted/30 border border-border rounded-xl px-3 py-2 resize-none outline-none focus:border-foreground/40 placeholder:text-muted-foreground/35 leading-relaxed"
          />
        </div>

        {/* ─ 最終的に決めたいこと ─ */}
        <div>
          <SectionLabel>{ja ? "最終的に決めたいこと" : "Decision Goal"}</SectionLabel>
          <input
            type="text"
            value={decisionTarget}
            onChange={e => setDecisionTarget(e.target.value)}
            placeholder={ja
              ? "例: 次に実装する機能を1つ決めたい / 最も良い訴求案を選びたい"
              : "e.g. Pick one feature to implement next / Select the strongest message angle"}
            className="w-full text-sm bg-muted/30 border border-border rounded-xl px-3 py-2 outline-none focus:border-foreground/40 placeholder:text-muted-foreground/35"
          />
        </div>

        {/* ─ 比較軸 ─ */}
        <div>
          <SectionLabel>{ja ? "比較軸" : "Evaluation Axes"}</SectionLabel>

          {/* chip pool */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {allAxisNames.map(name => {
              const isOn = name in axisWeights;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleAxis(name)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all border touch-manipulation ${
                    isOn
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card text-foreground/55 border-border hover:border-foreground/40"
                  }`}
                >
                  {isOn && <CheckIcon size={9} />}
                  {name}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setShowCustomAxis(v => !v);
                if (!showCustomAxis) setTimeout(() => customAxisRef.current?.focus(), 50);
              }}
              className="px-2.5 py-1 rounded-full text-xs font-medium border border-dashed border-border/50 text-muted-foreground/45 hover:text-foreground/70 hover:border-foreground/30 transition-all touch-manipulation"
            >
              {ja ? "+ その他" : "+ Custom"}
            </button>
          </div>

          {/* custom axis input */}
          {showCustomAxis && (
            <div className="flex gap-2 mb-3">
              <input
                ref={customAxisRef}
                type="text"
                value={customAxisInput}
                onChange={e => setCustomAxisInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomAxis(); } }}
                placeholder={ja ? "例: ブランド整合性 / 市場規模" : "e.g. Brand fit / Market size"}
                className="flex-1 text-sm bg-muted/30 border border-border rounded-xl px-3 py-1.5 outline-none focus:border-foreground/40 placeholder:text-muted-foreground/35"
              />
              <button
                type="button"
                onClick={addCustomAxis}
                disabled={!customAxisInput.trim()}
                className="p-2 rounded-xl border border-border text-foreground/55 hover:text-foreground hover:border-foreground/40 disabled:opacity-30 transition-colors"
              >
                <PlusIcon size={13} />
              </button>
            </div>
          )}

          {/* selected axes with weight buttons */}
          {selectedAxes.length > 0 && (
            <div className="mt-1 space-y-1.5 pt-2 border-t border-border/30">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 mb-1.5">
                {ja ? "重み付け" : "Weight"}
              </p>
              {selectedAxes.map(ax => {
                const isCustom = customAxisNames.includes(ax.name) && !templateAxeNames.includes(ax.name);
                return (
                  <div key={ax.name} className="flex items-center gap-2">
                    <span className="flex-1 text-[11px] text-foreground/70 truncate min-w-0">{ax.name}</span>
                    <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
                      {WEIGHTS.map(w => (
                        <button
                          key={w.value}
                          type="button"
                          onClick={() => setWeight(ax.name, w.value)}
                          className={`px-2 py-0.5 text-[10px] font-semibold transition-colors touch-manipulation ${
                            ax.weight === w.value
                              ? "bg-foreground text-background"
                              : "bg-card text-foreground/40 hover:bg-muted/60"
                          }`}
                        >
                          {ja ? w.ja : w.en}
                        </button>
                      ))}
                    </div>
                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => removeCustomAxis(ax.name)}
                        className="text-muted-foreground/30 hover:text-muted-foreground/70 transition-colors shrink-0"
                        title={ja ? "削除" : "Remove"}
                      >
                        <XIcon size={11} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─ Section 3: Advanced settings (collapsible) ─ */}
        <div className="border border-border/40 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(v => !v)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-muted/20 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
              {ja ? "詳細設定" : "Advanced Settings"}
            </span>
            <ChevronDownIcon
              size={11}
              className={`text-muted-foreground/30 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}
            />
          </button>

          {showAdvanced && (
            <div className="border-t border-border/30 px-3.5 py-3.5 space-y-4">

              {/* 前提・制約 */}
              <div>
                <SectionLabel>{ja ? "前提・制約" : "Assumptions / Constraints"}</SectionLabel>
                <input
                  type="text"
                  value={constraints}
                  onChange={e => setConstraints(e.target.value)}
                  placeholder={ja
                    ? "例: 開発者1人 / 2週間以内 / 外部API未使用"
                    : "e.g. Solo developer / Ship in 2 weeks / No external APIs"}
                  className="w-full text-sm bg-muted/30 border border-border rounded-xl px-3 py-2 outline-none focus:border-foreground/40 placeholder:text-muted-foreground/35"
                />
              </div>

              {/* 反論の強さ */}
              <div>
                <SectionLabel>{ja ? "反論の強さ" : "Challenge Level"}</SectionLabel>
                <div className="flex rounded-xl border border-border overflow-hidden">
                  {CHALLENGE_LEVEL_OPTIONS.map((opt, i) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setChallengeLevel(opt.value)}
                      className={`flex-1 py-2 text-xs font-medium transition-all touch-manipulation ${
                        i > 0 ? "border-l border-border" : ""
                      } ${
                        challengeLevel === opt.value
                          ? "bg-foreground text-background"
                          : "bg-card text-foreground/55 hover:bg-muted/50"
                      }`}
                    >
                      {ja ? opt.ja : opt.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* 出力粒度 */}
              <div>
                <SectionLabel>{ja ? "出力粒度" : "Output Depth"}</SectionLabel>
                <div className="grid grid-cols-3 gap-2">
                  {OUTPUT_DEPTH_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setOutputDepth(opt.value)}
                      className={`flex flex-col gap-0.5 px-2 py-2.5 rounded-xl border text-left transition-all touch-manipulation ${
                        outputDepth === opt.value
                          ? "bg-foreground text-background border-foreground"
                          : "bg-card border-border text-foreground/65 hover:border-foreground/40"
                      }`}
                    >
                      <span className="text-[11px] font-semibold leading-tight">
                        {ja ? opt.ja : opt.en}
                      </span>
                      <span className={`text-[10px] leading-tight ${outputDepth === opt.value ? "text-background/65" : "text-muted-foreground/45"}`}>
                        {ja ? opt.hint_ja : opt.hint_en}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        <div className="h-2" />
      </div>

      {/* ── Submit ── */}
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
          <p className="mt-1.5 text-center text-[11px] text-muted-foreground/40">
            {ja ? "検討テーマと決めたいことを入力してください" : "Fill in Topic and Decision Goal to continue"}
          </p>
        )}
      </div>
    </div>
  );
}

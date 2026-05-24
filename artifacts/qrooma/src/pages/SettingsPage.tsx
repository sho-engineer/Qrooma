import { useState } from "react";
import { Link } from "wouter";
import { useSettings } from "../context/SettingsContext";
import { useLocale, type Locale } from "../context/LocaleContext";
import { usePlan } from "../context/PlanContext";
import { useUserProfile } from "../context/UserProfileContext";
import { usageService } from "../services/usageService";
import type { AgentSideConfig, Provider, DefaultMode, WritingTone, ConclusionFormat, JpHardness, WritingStyle } from "../types";
import { AlertCircleIcon, ArrowUpRightIcon, CheckIcon } from "lucide-react";
import InviteCodeSection from "../components/InviteCodeSection";

// ─── Provider metadata ────────────────────────────────────────────────────────

const PROVIDER_COLORS: Record<Provider, string> = {
  openai:    "#10a37f",
  anthropic: "#d97706",
  google:    "#4285f4",
};

const PROVIDER_LABELS: Record<Provider, string> = {
  openai:    "OpenAI",
  anthropic: "Anthropic",
  google:    "Google",
};

const PROVIDER_API_KEY_URLS: Record<Provider, string> = {
  openai:    "https://platform.openai.com/api-keys",
  anthropic: "https://console.anthropic.com/settings/keys",
  google:    "https://aistudio.google.com/app/apikey",
};

const PROVIDER_MODELS: Record<Provider, { value: string; label: string }[]> = {
  openai: [
    { value: "gpt-4o",        label: "GPT-4o" },
    { value: "gpt-4o-mini",   label: "GPT-4o mini" },
    { value: "gpt-4-turbo",   label: "GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ],
  anthropic: [
    { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet" },
    { value: "claude-3-opus-20240229",     label: "Claude 3 Opus" },
    { value: "claude-3-haiku-20240307",    label: "Claude 3 Haiku" },
  ],
  google: [
    { value: "gemini-2.5-flash",      label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-flash-lite",  label: "Gemini 2.5 Flash Lite" },
    { value: "gemini-1.5-pro",        label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash",      label: "Gemini 1.5 Flash" },
    { value: "gemini-1.0-pro",        label: "Gemini 1.0 Pro" },
  ],
};

function comboKey(provider: Provider, model: string) {
  return `${provider}:${model}`;
}

// ─── Step Guide ───────────────────────────────────────────────────────────────

function ApiKeyStepGuide() {
  const { t } = useLocale();
  const steps = [
    t.apiKeySetupStep1,
    t.apiKeySetupStep2,
    t.apiKeySetupStep3,
    t.apiKeySetupStep4,
  ];

  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-4">
      <p className="text-xs font-semibold text-foreground mb-3">{t.apiKeySetupTitle}</p>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{t.apiKeySetupLead}</p>
      <ol className="space-y-2.5">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-px w-5 h-5 shrink-0 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
              {i + 1}
            </span>
            <span className="text-xs text-foreground/80 leading-relaxed pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[11px] text-muted-foreground/60 leading-relaxed border-t border-border pt-3">
        {t.apiKeySetupSupportText}
      </p>
    </div>
  );
}

// ─── Per-provider API Key Field ───────────────────────────────────────────────

interface ApiKeyFieldProps {
  provider: Provider;
  value:    string;
  onChange: (v: string) => void;
}

function ApiKeyField({ provider, value, onChange }: ApiKeyFieldProps) {
  const { t } = useLocale();
  const color  = PROVIDER_COLORS[provider];
  const label  = PROVIDER_LABELS[provider];
  const url    = PROVIDER_API_KEY_URLS[provider];
  const hasKey = !!value;

  const placeholders: Record<Provider, string> = {
    openai:    "sk-...",
    anthropic: "sk-ant-...",
    google:    "AIza...",
  };

  return (
    <div className={`rounded-2xl border px-4 py-4 bg-card transition-colors ${
      hasKey ? "border-border" : "border-border/70"
    }`}>
      <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-xs font-semibold text-foreground shrink-0">{label}</span>
          {hasKey ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium leading-none shrink-0">
              <CheckIcon size={8} strokeWidth={2.5} />
              {t.settingsSaved.split("").slice(0, 3).join("")}
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground/60 text-[10px] font-medium leading-none shrink-0">
              {t.apiKeyNotSet}
            </span>
          )}
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors shrink-0 whitespace-nowrap"
        >
          {t.getApiKey}
          <ArrowUpRightIcon size={10} strokeWidth={2} />
        </a>
      </div>

      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholders[provider]}
        autoComplete="new-password"
        className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring font-mono placeholder:font-sans placeholder:text-muted-foreground"
      />

      {!hasKey && (
        <p className="mt-2.5 text-[11px] text-muted-foreground/70 leading-relaxed">
          {t.apiKeyNeededWarning}
        </p>
      )}
      {hasKey && (
        <p className="mt-2 text-[11px] text-muted-foreground/50 leading-relaxed">
          {t.apiKeySecureNote}
        </p>
      )}
    </div>
  );
}

// ─── SideConfig ───────────────────────────────────────────────────────────────

function SideConfig({
  sideKey,
  config,
  hasApiKey,
  otherCombos,
  onChange,
}: {
  sideKey:     string;
  config:      AgentSideConfig;
  hasApiKey:   boolean;
  otherCombos: Set<string>;
  onChange:    (c: AgentSideConfig) => void;
}) {
  const { t } = useLocale();
  const models            = PROVIDER_MODELS[config.provider];
  const color             = PROVIDER_COLORS[config.provider];
  const currentModelValue = models.find((m) => m.value === config.model)?.value ?? models[0].value;
  const isDuplicate       = otherCombos.has(comboKey(config.provider, currentModelValue));

  return (
    <div className={`border rounded-2xl p-4 bg-card transition-colors ${
      isDuplicate ? "border-destructive/40" : "border-border"
    }`}>
      <div className="flex items-center gap-2 mb-3 flex-wrap min-w-0">
        <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        </div>
        <p className="text-xs font-semibold text-foreground">{t.sideLabel(sideKey)}</p>
        {!hasApiKey && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground/70 leading-none">
            {t.apiKeyNotSet}
          </span>
        )}
        {isDuplicate && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-destructive/8 text-destructive/80 flex items-center gap-1 leading-none">
            <AlertCircleIcon size={9} />
            {t.duplicateModelError.slice(0, 4)}
          </span>
        )}
      </div>

      <div>
        <label className="block text-[11px] text-muted-foreground mb-1">{t.model}</label>
        <select
          value={currentModelValue}
          onChange={(e) => onChange({ ...config, provider: "openai", model: e.target.value })}
          className="w-full px-2.5 py-1.5 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring"
        >
          {PROVIDER_MODELS["openai"].map((m) => {
            const taken = otherCombos.has(comboKey("openai", m.value));
            return (
              <option key={m.value} value={m.value} disabled={taken}>
                {taken ? `${m.label} ✕` : m.label}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}

// ─── Plan Cards ───────────────────────────────────────────────────────────────

function FreePlanCard() {
  const { locale, t } = useLocale();
  const { profile }   = useUserProfile();
  const isJa          = locale === "ja";

  const dailyUsed    = usageService.getDailyCount();
  const monthlyUsed  = usageService.getMonthlyCount();
  const dailyLimit   = profile.dailyRunLimit;
  const monthlyLimit = profile.monthlyRunLimit;
  const isUnlimited  = profile.isUnlimitedUser;

  return (
    <section>
      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
        {isJa ? "現在のプラン" : "Current plan"}
      </h3>

      {/* Plan badge */}
      <div className="rounded-2xl border border-border bg-card p-5 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Free</span>
          {profile.accessType !== "normal" && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 capitalize">
              {profile.accessType.replace("_", " ")}
            </span>
          )}
        </div>

        {/* Usage display */}
        <div className="rounded-xl bg-muted/30 px-3 py-2.5 space-y-2 mb-3">
          <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">
            {isJa ? "利用状況" : "Usage"}
          </p>
          {isUnlimited ? (
            <p className="text-xs font-medium text-emerald-600">{t.usageUnlimited}</p>
          ) : (
            <>
              {dailyLimit !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-foreground/70">
                    {t.usageTodayRemaining(dailyUsed, dailyLimit)}
                  </span>
                  <div className="flex gap-0.5 ml-2">
                    {Array.from({ length: dailyLimit }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-1.5 rounded-full ${i < dailyUsed ? "bg-foreground/25" : "bg-foreground/60"}`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {monthlyLimit !== null && (
                <p className="text-[10px] text-muted-foreground/50">
                  {t.usageMonthly(monthlyUsed, monthlyLimit)}
                </p>
              )}
            </>
          )}
        </div>

        {/* Fixed model config */}
        <div className="rounded-xl bg-muted/30 px-3 py-2.5 space-y-1.5 mb-3">
          <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1.5">
            {isJa ? "固定の2エージェント構成" : "Fixed 2-agent config"}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10a37f] shrink-0" />
            <span className="text-[11px] text-foreground/70">{isJa ? "Builder（候補提案）" : "Builder"}</span>
            <span className="ml-auto text-[11px] font-mono text-muted-foreground/60">GPT-4o mini</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] shrink-0" />
            <span className="text-[11px] text-foreground/70">{isJa ? "Breaker（検証・反証）" : "Breaker"}</span>
            <span className="ml-auto text-[11px] font-mono text-muted-foreground/60">GPT-4o mini</span>
          </div>
          <p className="text-[10px] text-muted-foreground/40 pt-0.5">
            {isJa ? "Connect プランで Operator（実行整理）も利用可" : "Operator role available on Connect plan"}
          </p>
        </div>

        {/* Limit note (only for non-unlimited) */}
        {!isUnlimited && (
          <div className="flex items-start gap-1.5 px-3 py-2 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-muted-foreground text-[11px] shrink-0 mt-px">i</span>
            <span className="text-[11px] text-muted-foreground/70 leading-relaxed">
              {isJa
                ? `1日5回・月100回まで。継続議論は1回まで。`
                : "5 runs/day · 100 runs/month (fair use) · 1 continuation per discussion."}
            </span>
          </div>
        )}
      </div>

      {/* Coming soon note */}
      <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
        <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
          {isJa
            ? "Pro / Connect は近日公開予定です。現在は Free プランのみ提供中です。"
            : "Pro and Connect plans are coming soon. The Free plan is available now."}
        </p>
      </div>
    </section>
  );
}

function ProPlanCard() {
  const { locale } = useLocale();
  const isJa = locale === "ja";
  return (
    <section>
      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
        {isJa ? "現在のプラン" : "Current plan"}
      </h3>
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Free</span>
          <span className="text-xs text-muted-foreground">
            {isJa ? "現在 Free プランをご利用中です" : "You're on the Free plan"}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
          {isJa
            ? "Pro / Connect は近日公開予定です。"
            : "Pro and Connect plans are coming soon."}
        </p>
      </div>
    </section>
  );
}

// ─── WritingStyleSection ──────────────────────────────────────────────────────

function OptionButton({
  active,
  onClick,
  label,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  desc?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-all duration-150 active:scale-[0.99] ${
        active
          ? "border-foreground/20 bg-card"
          : "border-border bg-background hover:bg-card"
      }`}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {active && <CheckIcon size={11} className="text-foreground/50 shrink-0" />}
      </div>
      {desc && (
        <p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-relaxed">{desc}</p>
      )}
    </button>
  );
}

function WritingStyleSection({
  value,
  onChange,
  isFree,
}: {
  value:    WritingStyle;
  onChange: (ws: WritingStyle) => void;
  isFree:   boolean;
}) {
  const { t, locale } = useLocale();

  function patch(partial: Partial<WritingStyle>) {
    onChange({ ...value, ...partial });
  }

  const tones: { v: WritingTone; label: string; desc: string }[] = [
    { v: "natural",      label: t.writingToneNatural,      desc: t.writingToneNaturalDesc      },
    { v: "professional", label: t.writingToneProfessional, desc: t.writingToneProfessionalDesc },
    { v: "concise",      label: t.writingToneConcise,      desc: t.writingToneConciseDesc      },
    { v: "casual",       label: t.writingToneCasual,       desc: t.writingToneCasualDesc       },
  ];

  const formats: { v: ConclusionFormat; label: string }[] = [
    { v: "paragraph", label: t.conclusionFormatParagraph },
    { v: "bullets",   label: t.conclusionFormatBullets   },
  ];

  const jpHardnesses: { v: JpHardness; label: string }[] = [
    { v: "soft",     label: t.jpHardnessSoft     },
    { v: "standard", label: t.jpHardnessStandard },
    { v: "formal",   label: t.jpHardnessFormal   },
  ];

  return (
    <section>
      <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
        {t.writingStyleSection}
      </h3>

      <div className="rounded-2xl border border-border bg-card divide-y divide-border/60 overflow-hidden">

        {/* ── Tone ── */}
        <div className="p-4">
          <p className="text-xs font-semibold text-foreground mb-2.5">{t.writingToneLabel}</p>
          <div className="grid grid-cols-2 gap-1.5">
            {tones.map(({ v, label, desc }) => (
              <OptionButton
                key={v}
                active={value.tone === v}
                onClick={() => patch({ tone: v })}
                label={label}
                desc={desc}
              />
            ))}
          </div>
        </div>

        {/* ── Conclusion format ── */}
        <div className="p-4">
          <p className="text-xs font-semibold text-foreground mb-2.5">{t.conclusionFormatLabel}</p>
          <div className="flex gap-1.5">
            {formats.map(({ v, label }) => (
              <OptionButton
                key={v}
                active={value.conclusionFormat === v}
                onClick={() => patch({ conclusionFormat: v })}
                label={label}
              />
            ))}
          </div>
        </div>

        {/* ── JP hardness (always shown, but labeled differently in EN) ── */}
        <div className="p-4">
          <p className="text-xs font-semibold text-foreground mb-2.5">{t.jpHardnessLabel}</p>
          <div className="flex gap-1.5">
            {jpHardnesses.map(({ v, label }) => (
              <OptionButton
                key={v}
                active={value.jpHardness === v}
                onClick={() => patch({ jpHardness: v })}
                label={label}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Save note for Free plan */}
      {isFree && (
        <p className="mt-2.5 text-[11px] text-muted-foreground/50 leading-relaxed px-0.5">
          {locale === "ja"
            ? "表現設定は Free プランでも有効です。変更は即時反映されます。"
            : "Writing style applies on all plans. Changes are saved immediately."}
        </p>
      )}
    </section>
  );
}

// ─── Draft type ───────────────────────────────────────────────────────────────

type DraftSettings = {
  openaiApiKey: string;
  defaultMode:  DefaultMode;
  agentCount:   2 | 3;
  sideA:        AgentSideConfig;
  sideB:        AgentSideConfig;
  sideC:        AgentSideConfig;
  writingStyle: WritingStyle;
};

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { t, locale, setLocale }     = useLocale();
  const { plan }                     = usePlan();

  const defaultWritingStyle: WritingStyle = {
    tone: "natural", conclusionFormat: "paragraph", jpHardness: "soft",
  };

  const [draft, setDraft] = useState<DraftSettings>({
    openaiApiKey: settings.openaiApiKey,
    defaultMode:  settings.defaultMode,
    agentCount:   settings.agentCount ?? 3,
    sideA:        settings.sideA,
    sideB:        settings.sideB,
    sideC:        settings.sideC,
    writingStyle: settings.writingStyle ?? defaultWritingStyle,
  });

  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [showDupError, setShowDupError] = useState(false);

  function patchDraft(patch: Partial<DraftSettings>) {
    setDraft((prev) => ({ ...prev, ...patch }));
    setSavedAt(null);
  }

  const savedSnap: DraftSettings = {
    openaiApiKey: settings.openaiApiKey,
    defaultMode:  settings.defaultMode,
    agentCount:   settings.agentCount ?? 3,
    sideA:        settings.sideA,
    sideB:        settings.sideB,
    sideC:        settings.sideC,
    writingStyle: settings.writingStyle ?? defaultWritingStyle,
  };
  const isDirty = JSON.stringify(draft) !== JSON.stringify(savedSnap);

  function activeSides() {
    return draft.agentCount === 2
      ? [{ key: "A", config: draft.sideA }, { key: "B", config: draft.sideB }]
      : [
          { key: "A", config: draft.sideA },
          { key: "B", config: draft.sideB },
          { key: "C", config: draft.sideC },
        ];
  }

  function hasDuplicate(): boolean {
    const keys = activeSides().map((s) => comboKey(s.config.provider, s.config.model));
    return new Set(keys).size !== keys.length;
  }

  function getCombosExcluding(excludeKey: string): Set<string> {
    return new Set(
      activeSides()
        .filter((s) => s.key !== excludeKey)
        .map((s) => comboKey(s.config.provider, s.config.model))
    );
  }

  function handleSideChange(key: string, c: AgentSideConfig) {
    const patch = key === "A" ? { sideA: c } : key === "B" ? { sideB: c } : { sideC: c };
    patchDraft(patch);
    const afterKeys = activeSides().map((s) =>
      s.key === key ? comboKey(c.provider, c.model) : comboKey(s.config.provider, s.config.model)
    );
    setShowDupError(new Set(afterKeys).size !== afterKeys.length);
  }

  function save() {
    if (hasDuplicate()) return;
    updateSettings(draft);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2500);
  }

  function apiKeyForProvider(_provider: Provider): string {
    return draft.openaiApiKey;
  }

  const modes: { value: DefaultMode; label: string; description: string }[] = [
    { value: "structured-debate", label: t.structuredDebate, description: t.debateDesc },
    { value: "free-talk",         label: t.freeTalk,         description: t.freeTalkDesc },
  ];

  const sides    = activeSides();
  const canSave  = isDirty && !hasDuplicate();
  const isFree   = plan === "free";
  const isPro    = plan === "pro";
  const isConnect = plan === "connect";

  // Save button JSX (reused in header + bottom)
  const saveBtn = (fullWidth = false) => (
    <button
      onClick={save}
      disabled={!canSave}
      className={`whitespace-nowrap ${fullWidth ? "w-full py-2.5 text-sm font-semibold rounded-2xl" : "shrink-0 flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl border"} transition-all active:scale-[0.97] ${
        savedAt
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : canSave
          ? "bg-foreground text-background border-transparent hover:opacity-85"
          : "bg-muted text-muted-foreground/50 border-transparent cursor-not-allowed"
      }`}
    >
      {savedAt ? (
        <span className="flex items-center justify-center gap-1.5 whitespace-nowrap">
          <CheckIcon size={fullWidth ? 14 : 11} strokeWidth={2.5} />
          {t.settingsSaved}
        </span>
      ) : (
        <span className="whitespace-nowrap">{t.saveSettings}</span>
      )}
    </button>
  );

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">

      {/* ── Sticky header ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border/60">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 max-w-xl">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground leading-none">{t.settingsTitle}</h2>
            <p className={`text-[11px] mt-0.5 transition-colors ${
              isFree
                ? "text-muted-foreground/50"
                : savedAt
                ? "text-emerald-600"
                : isDirty
                ? "text-amber-600"
                : "text-muted-foreground/50"
            }`}>
              {isFree
                ? locale === "ja" ? "Free プラン" : "Free plan"
                : savedAt
                ? t.settingsSaved
                : isDirty
                ? t.settingsUnsaved
                : locale === "ja"
                ? "変更すると保存ボタンが有効になります"
                : "Edit fields, then save"}
            </p>
          </div>
          {!isFree && saveBtn()}
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6 sm:py-7 max-w-xl">
        <div className="space-y-8">

          {/* ══ ACCOUNT ══════════════════════════════════════════════════ */}
          <section>
            <h3 className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.15em] mb-4">
              {locale === "ja" ? "アカウント" : "Account"}
            </h3>
            <div className="space-y-4">

              {/* Plan card */}
              {isFree  && <FreePlanCard />}
              {isPro   && <ProPlanCard />}

              {/* Invite Code */}
              <InviteCodeSection />
            </div>
          </section>

          {/* ══ DISPLAY ══════════════════════════════════════════════════ */}
          <section>
            <h3 className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.15em] mb-4">
              {locale === "ja" ? "表示設定" : "Display"}
            </h3>
            <div className="space-y-4">

              {/* Language */}
              <div>
                <p className="text-[11px] font-semibold text-foreground mb-2">{t.uiLanguage}</p>
                <div className="flex gap-1.5">
                  {(["ja", "en"] as Locale[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLocale(l)}
                      className={`px-3.5 py-1.5 text-sm rounded-xl border transition-all duration-200 active:scale-[0.97] ${
                        locale === l
                          ? "bg-foreground text-background border-foreground"
                          : "bg-background text-foreground border-border hover:bg-accent"
                      }`}
                    >
                      {l === "ja" ? "日本語" : "English"}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground/50">
                  {locale === "ja"
                    ? "言語設定は即時反映（保存不要）"
                    : "Language applies immediately — no save needed"}
                </p>
              </div>

              {/* Writing Style */}
              <WritingStyleSection
                value={draft.writingStyle}
                onChange={(ws) => {
                  patchDraft({ writingStyle: ws });
                  if (isFree) {
                    updateSettings({ writingStyle: ws });
                    setSavedAt(Date.now());
                    setTimeout(() => setSavedAt(null), 1500);
                  }
                }}
                isFree={isFree}
              />
            </div>
          </section>

          {/* ══ AI SETTINGS (Connect + Pro) ══════════════════════════════ */}
          {!isFree && (
            <section>
              <h3 className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.15em] mb-4">
                {locale === "ja" ? "AI 設定" : "AI Settings"}
              </h3>
              <div className="space-y-6">

                {/* API Keys (Connect only) */}
                {isConnect && (
                  <div>
                    <p className="text-[11px] font-semibold text-foreground mb-2">{t.apiKeys}</p>
                    <div className="mb-3">
                      <ApiKeyStepGuide />
                    </div>
                    <div className="space-y-3">
                      <ApiKeyField
                        provider="openai"
                        value={draft.openaiApiKey}
                        onChange={(v) => patchDraft({ openaiApiKey: v })}
                      />
                    </div>
                  </div>
                )}

                {/* Default Mode */}
                <div>
                  <p className="text-[11px] font-semibold text-foreground mb-0.5">{t.defaultMode}</p>
                  <p className="text-[11px] text-muted-foreground/60 mb-3 leading-relaxed">{t.agentConfigDesc}</p>
                  <div className="space-y-2">
                    {modes.map(({ value, label, description }) => (
                      <button
                        key={value}
                        onClick={() => patchDraft({ defaultMode: value })}
                        className={`w-full text-left px-4 py-3 rounded-2xl border transition-all duration-200 active:scale-[0.99] ${
                          draft.defaultMode === value
                            ? "border-foreground/20 bg-card"
                            : "border-border bg-background hover:bg-card"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-0.5 min-w-0">
                          <span className="text-xs font-semibold text-foreground">{label}</span>
                          {draft.defaultMode === value && (
                            <CheckIcon size={12} className="text-foreground/60 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Agent Configuration */}
                <div>
                  <p className="text-[11px] font-semibold text-foreground mb-0.5">{t.agentConfig}</p>
                  <p className="text-[11px] text-muted-foreground/60 mb-3 leading-relaxed">{t.agentConfigDesc}</p>

                  <div className="flex items-center justify-between mb-4 px-4 py-3 bg-card border border-border rounded-2xl min-w-0">
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-foreground">{t.agentCount}</span>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                        {draft.agentCount === 2
                          ? locale === "ja" ? "サイド A / B のみ有効" : "Only Side A / B active"
                          : locale === "ja" ? "サイド A / B / C すべて有効" : "All sides A / B / C active"}
                      </p>
                    </div>
                    <div className="flex gap-1 rounded-full border border-border bg-background p-0.5 shrink-0 ml-3">
                      {([2, 3] as const).map((n) => (
                        <button
                          key={n}
                          onClick={() => patchDraft({ agentCount: n })}
                          className={`w-8 h-6 text-xs font-medium rounded-full transition-all ${
                            draft.agentCount === n
                              ? "bg-foreground text-background"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {isConnect && (
                    <>
                      {(showDupError || hasDuplicate()) && (
                        <div className="flex items-start gap-2 mb-3 px-3.5 py-2.5 bg-destructive/8 border border-destructive/20 rounded-xl">
                          <AlertCircleIcon size={13} className="text-destructive/70 shrink-0 mt-0.5" />
                          <p className="text-xs text-destructive/80">{t.duplicateModelError}</p>
                        </div>
                      )}
                      <div className="space-y-2.5">
                        {sides.map(({ key, config }) => (
                          <SideConfig
                            key={key}
                            sideKey={key}
                            config={config}
                            hasApiKey={!!apiKeyForProvider(config.provider)}
                            otherCombos={getCombosExcluding(key)}
                            onChange={(c) => handleSideChange(key, c)}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {isPro && (
                    <p className="text-[11px] text-muted-foreground/60 leading-relaxed px-1">
                      {locale === "ja"
                        ? "Pro プランではモデルは Adjudo が自動選択します。"
                        : "On Pro, models are automatically selected by Adjudo."}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ── Bottom save (Connect + Pro) ─────────────────────────────── */}
          {!isFree && (
            <div className="pb-4">
              {saveBtn(true)}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

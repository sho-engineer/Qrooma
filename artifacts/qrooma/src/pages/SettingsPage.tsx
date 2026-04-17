import { useState } from "react";
import { useSettings } from "../context/SettingsContext";
import { useLocale, type Locale } from "../context/LocaleContext";
import type { AgentSideConfig, Provider, DefaultMode } from "../types";
import { AlertCircleIcon, ArrowUpRightIcon, CheckIcon } from "lucide-react";

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
    { value: "gemini-1.5-pro",   label: "Gemini 1.5 Pro" },
    { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
    { value: "gemini-1.0-pro",   label: "Gemini 1.0 Pro" },
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] text-muted-foreground mb-1">{t.provider}</label>
          <select
            value={config.provider}
            onChange={(e) => {
              const p = e.target.value as Provider;
              onChange({ ...config, provider: p, model: PROVIDER_MODELS[p][0].value });
            }}
            className="w-full px-2.5 py-1.5 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring"
          >
            {(["openai", "anthropic", "google"] as Provider[]).map((p) => (
              <option key={p} value={p}>{PROVIDER_LABELS[p]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] text-muted-foreground mb-1">{t.model}</label>
          <select
            value={currentModelValue}
            onChange={(e) => onChange({ ...config, model: e.target.value })}
            className="w-full px-2.5 py-1.5 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring"
          >
            {models.map((m) => {
              const taken = otherCombos.has(comboKey(config.provider, m.value));
              return (
                <option key={m.value} value={m.value} disabled={taken}>
                  {taken ? `${m.label} ✕` : m.label}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── Draft type ───────────────────────────────────────────────────────────────

type DraftSettings = {
  openaiApiKey:    string;
  anthropicApiKey: string;
  googleApiKey:    string;
  defaultMode:     DefaultMode;
  agentCount:      2 | 3;
  sideA:           AgentSideConfig;
  sideB:           AgentSideConfig;
  sideC:           AgentSideConfig;
};

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { t, locale, setLocale }     = useLocale();

  // Local draft — all field changes go here; committed on "Save"
  const [draft, setDraft] = useState<DraftSettings>({
    openaiApiKey:    settings.openaiApiKey,
    anthropicApiKey: settings.anthropicApiKey,
    googleApiKey:    settings.googleApiKey,
    defaultMode:     settings.defaultMode,
    agentCount:      settings.agentCount ?? 3,
    sideA:           settings.sideA,
    sideB:           settings.sideB,
    sideC:           settings.sideC,
  });

  // "Saved" feedback lasts 2.5 s
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [showDupError, setShowDupError] = useState(false);

  function patchDraft(patch: Partial<DraftSettings>) {
    setDraft((prev) => ({ ...prev, ...patch }));
    setSavedAt(null);
  }

  // Check if draft differs from what's currently saved
  const savedSnap: DraftSettings = {
    openaiApiKey:    settings.openaiApiKey,
    anthropicApiKey: settings.anthropicApiKey,
    googleApiKey:    settings.googleApiKey,
    defaultMode:     settings.defaultMode,
    agentCount:      settings.agentCount ?? 3,
    sideA:           settings.sideA,
    sideB:           settings.sideB,
    sideC:           settings.sideC,
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

  function apiKeyForProvider(provider: Provider): string {
    if (provider === "openai")    return draft.openaiApiKey;
    if (provider === "anthropic") return draft.anthropicApiKey;
    return draft.googleApiKey;
  }

  const modes: { value: DefaultMode; label: string; description: string }[] = [
    { value: "structured-debate", label: t.structuredDebate, description: t.debateDesc },
    { value: "free-talk",         label: t.freeTalk,         description: t.freeTalkDesc },
  ];

  const sides = activeSides();
  const canSave = isDirty && !hasDuplicate();

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">

      {/* ── Sticky header + Save button ──────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border/60">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 max-w-xl">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground leading-none">{t.settingsTitle}</h2>
            <p className={`text-[11px] mt-0.5 transition-colors ${
              savedAt
                ? "text-emerald-600"
                : isDirty
                ? "text-amber-600"
                : "text-muted-foreground/50"
            }`}>
              {savedAt
                ? t.settingsSaved
                : isDirty
                ? t.settingsUnsaved
                : locale === "ja"
                ? "変更すると保存ボタンが有効になります"
                : "Edit fields, then save"}
            </p>
          </div>

          <button
            onClick={save}
            disabled={!canSave}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl border transition-all active:scale-[0.97] ${
              savedAt
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : canSave
                ? "bg-foreground text-background border-transparent hover:opacity-85"
                : "bg-muted text-muted-foreground/50 border-transparent cursor-not-allowed"
            }`}
          >
            {savedAt ? (
              <>
                <CheckIcon size={11} strokeWidth={2.5} />
                {t.settingsSaved}
              </>
            ) : (
              t.saveSettings
            )}
          </button>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6 sm:py-7 max-w-xl">
        <div className="space-y-8">

          {/* ── UI Language (auto-save, no Save button needed) ─────── */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              {t.uiLanguage}
            </h3>
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
            <p className="mt-2 text-[11px] text-muted-foreground/50">
              {locale === "ja"
                ? "言語設定は即時反映（保存不要）"
                : "Language applies immediately — no save needed"}
            </p>
          </section>

          {/* ── Plan overview ────────────────────────────────────────── */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              {t.settingsPlanTitle}
            </h3>
            <div className="rounded-2xl border border-border bg-card divide-y divide-border/70 overflow-hidden">
              {[
                { name: "Free",    desc: t.settingsPlanFreeDesc },
                { name: "Connect", desc: t.settingsPlanConnectDesc },
                { name: "Pro",     desc: t.settingsPlanProDesc },
              ].map(({ name, desc }) => (
                <div key={name} className="flex items-start gap-3 px-4 py-3">
                  <span className="shrink-0 mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
                    {name}
                  </span>
                  <span className="text-xs text-muted-foreground leading-relaxed">{desc}</span>
                </div>
              ))}
            </div>
            <p className="mt-2.5 text-[11px] text-muted-foreground/50 leading-relaxed">
              {t.settingsPlanApiKeyDesc}
            </p>
          </section>

          {/* ── API Keys ─────────────────────────────────────────────── */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              {t.apiKeys}
            </h3>

            <div className="mb-4">
              <ApiKeyStepGuide />
            </div>

            <div className="space-y-3">
              <ApiKeyField
                provider="openai"
                value={draft.openaiApiKey}
                onChange={(v) => patchDraft({ openaiApiKey: v })}
              />
              <ApiKeyField
                provider="anthropic"
                value={draft.anthropicApiKey}
                onChange={(v) => patchDraft({ anthropicApiKey: v })}
              />
              <ApiKeyField
                provider="google"
                value={draft.googleApiKey}
                onChange={(v) => patchDraft({ googleApiKey: v })}
              />
            </div>
          </section>

          {/* ── Default Mode ──────────────────────────────────────────── */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
              {t.defaultMode}
            </h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              {t.agentConfigDesc}
            </p>

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
          </section>

          {/* ── Agent Configuration ───────────────────────────────────── */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
              {t.agentConfig}
            </h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              {t.agentConfigDesc}
            </p>

            {/* 2 / 3 agent count toggle */}
            <div className="flex items-center justify-between mb-4 px-4 py-3 bg-card border border-border rounded-2xl min-w-0">
              <div className="min-w-0">
                <span className="text-xs font-medium text-foreground">{t.agentCount}</span>
                <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                  {draft.agentCount === 2
                    ? locale === "ja"
                      ? "サイド A / B のみ有効"
                      : "Only Side A / B active"
                    : locale === "ja"
                      ? "サイド A / B / C すべて有効"
                      : "All sides A / B / C active"}
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

            {/* Duplicate error */}
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
          </section>

          {/* ── Bottom save (convenience) ──────────────────────────── */}
          <div className="pb-4">
            <button
              onClick={save}
              disabled={!canSave}
              className={`w-full py-2.5 text-sm font-semibold rounded-2xl transition-all active:scale-[0.99] ${
                savedAt
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : canSave
                  ? "bg-foreground text-background hover:opacity-85"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {savedAt ? (
                <span className="flex items-center justify-center gap-1.5">
                  <CheckIcon size={14} strokeWidth={2.5} />
                  {t.settingsSaved}
                </span>
              ) : (
                t.saveSettings
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

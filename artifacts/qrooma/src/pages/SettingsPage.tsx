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
  value: string;
  onChange: (v: string) => void;
}

function ApiKeyField({ provider, value, onChange }: ApiKeyFieldProps) {
  const { t } = useLocale();
  const color = PROVIDER_COLORS[provider];
  const label = PROVIDER_LABELS[provider];
  const url = PROVIDER_API_KEY_URLS[provider];
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
      {/* Provider header row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs font-semibold text-foreground">{label}</span>
          {hasKey ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium leading-none">
              <CheckIcon size={8} strokeWidth={2.5} />
              設定済
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground/60 text-[10px] font-medium leading-none">
              {t.apiKeyNotSet}
            </span>
          )}
        </div>

        {/* "Get API key" link button */}
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

      {/* Input field */}
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholders[provider]}
        autoComplete="new-password"
        className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring font-mono placeholder:font-sans placeholder:text-muted-foreground"
      />

      {/* Warning when key is missing */}
      {!hasKey && (
        <p className="mt-2.5 text-[11px] text-muted-foreground/70 leading-relaxed">
          {t.apiKeyNeededWarning}
        </p>
      )}

      {/* Secure storage note when key IS set */}
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
  sideKey: string;
  config: AgentSideConfig;
  hasApiKey: boolean;
  otherCombos: Set<string>;
  onChange: (c: AgentSideConfig) => void;
}) {
  const { t } = useLocale();
  const models = PROVIDER_MODELS[config.provider];
  const color = PROVIDER_COLORS[config.provider];
  const currentModelValue = models.find((m) => m.value === config.model)?.value ?? models[0].value;
  const isDuplicate = otherCombos.has(comboKey(config.provider, currentModelValue));

  return (
    <div className={`border rounded-2xl p-4 bg-card transition-colors ${
      isDuplicate ? "border-destructive/40" : "border-border"
    }`}>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
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
            重複
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

// ─── Main Settings Page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { t, locale, setLocale } = useLocale();
  const [showDupError, setShowDupError] = useState(false);

  function apiKeyForProvider(provider: Provider): string {
    if (provider === "openai") return settings.openaiApiKey;
    if (provider === "anthropic") return settings.anthropicApiKey;
    return settings.googleApiKey;
  }

  const agentCount = settings.agentCount ?? 3;

  const sides = agentCount === 2
    ? [{ key: "A", config: settings.sideA }, { key: "B", config: settings.sideB }]
    : [{ key: "A", config: settings.sideA }, { key: "B", config: settings.sideB }, { key: "C", config: settings.sideC }];

  function getCombosExcluding(excludeKey: string): Set<string> {
    return new Set(
      sides
        .filter((s) => s.key !== excludeKey)
        .map((s) => comboKey(s.config.provider, s.config.model))
    );
  }

  function hasDuplicate(): boolean {
    const keys = sides.map((s) => comboKey(s.config.provider, s.config.model));
    return new Set(keys).size !== keys.length;
  }

  function handleSideChange(key: string, c: AgentSideConfig) {
    const patch = key === "A" ? { sideA: c } : key === "B" ? { sideB: c } : { sideC: c };
    updateSettings(patch);
    const afterKeys = sides.map((s) =>
      s.key === key ? comboKey(c.provider, c.model) : comboKey(s.config.provider, s.config.model)
    );
    setShowDupError(new Set(afterKeys).size !== afterKeys.length);
  }

  const modes: { value: DefaultMode; label: string; description: string }[] = [
    { value: "structured-debate", label: t.structuredDebate, description: t.debateDesc },
    { value: "free-talk",         label: t.freeTalk,         description: t.freeTalkDesc },
  ];

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6 sm:py-7">
      <div className="max-w-xl">
        <h2 className="text-base font-semibold text-foreground mb-0.5">{t.settingsTitle}</h2>
        <p className="text-xs text-muted-foreground mb-7">{t.settingsDesc}</p>

        <div className="space-y-8">

          {/* ── UI Language ──────────────────────────────────────────────── */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              {t.uiLanguage}
            </h3>
            <div className="flex gap-1.5">
              {(["ja", "en"] as Locale[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={`px-3.5 py-1.5 text-sm rounded-xl border transition-all ${
                    locale === l
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:bg-accent"
                  }`}
                >
                  {l === "ja" ? "日本語" : "English"}
                </button>
              ))}
            </div>
          </section>

          {/* ── API Keys ─────────────────────────────────────────────────── */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              {t.apiKeys}
            </h3>

            {/* Step-by-step guide card */}
            <div className="mb-4">
              <ApiKeyStepGuide />
            </div>

            {/* Per-provider key fields */}
            <div className="space-y-3">
              <ApiKeyField
                provider="openai"
                value={settings.openaiApiKey}
                onChange={(v) => updateSettings({ openaiApiKey: v })}
              />
              <ApiKeyField
                provider="anthropic"
                value={settings.anthropicApiKey}
                onChange={(v) => updateSettings({ anthropicApiKey: v })}
              />
              <ApiKeyField
                provider="google"
                value={settings.googleApiKey}
                onChange={(v) => updateSettings({ googleApiKey: v })}
              />
            </div>
          </section>

          {/* ── Default Mode ─────────────────────────────────────────────── */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              {t.defaultMode}
            </h3>
            <div className="space-y-2">
              {modes.map((mode) => {
                const active = settings.defaultMode === mode.value;
                return (
                  <button
                    key={mode.value}
                    onClick={() => updateSettings({ defaultMode: mode.value })}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all ${
                      active
                        ? "bg-card border-foreground/20"
                        : "bg-background border-border hover:border-foreground/10 hover:bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-foreground" : "bg-border"}`} />
                      <span className={`text-sm font-medium ${active ? "text-foreground" : "text-foreground/70"}`}>
                        {mode.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-3.5 leading-relaxed">{mode.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Agent Configuration ──────────────────────────────────────── */}
          <section>
            <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">
              {t.agentConfig}
            </h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              {t.agentConfigDesc}
            </p>

            {/* Agent count toggle */}
            <div className="flex items-center justify-between mb-4 px-4 py-3 bg-card border border-border rounded-2xl">
              <span className="text-xs font-medium text-foreground">{t.agentCount}</span>
              <div className="flex gap-1 rounded-full border border-border bg-background p-0.5 shrink-0">
                {([2, 3] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => updateSettings({ agentCount: n })}
                    className={`w-8 h-6 text-xs font-medium rounded-full transition-all ${
                      agentCount === n
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

        </div>
      </div>
    </div>
  );
}

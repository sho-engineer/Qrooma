import { useSettings } from "../context/SettingsContext";
import { useLocale, type Locale } from "../context/LocaleContext";
import type { AgentSideConfig, Provider, DefaultMode } from "../types";

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

function ApiKeyField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground mb-1.5">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="new-password"
        className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring font-mono placeholder:font-sans placeholder:text-muted-foreground"
      />
    </div>
  );
}

function SideConfig({
  sideKey,
  config,
  hasApiKey,
  onChange,
}: {
  sideKey: string;
  config: AgentSideConfig;
  hasApiKey: boolean;
  onChange: (c: AgentSideConfig) => void;
}) {
  const { t } = useLocale();
  const models = PROVIDER_MODELS[config.provider];
  const color = PROVIDER_COLORS[config.provider];
  const currentModel = models.find((m) => m.value === config.model) ?? models[0];

  return (
    <div className="flex gap-4 items-start border border-border rounded-2xl p-5 bg-card">
      <div className="shrink-0 flex flex-col items-center gap-1 pt-0.5">
        <div
          className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs font-medium text-foreground">{t.sideLabel(sideKey)}</p>
          {!hasApiKey && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              API Key 未設定
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">{t.provider}</label>
            <select
              value={config.provider}
              onChange={(e) => {
                const p = e.target.value as Provider;
                onChange({ ...config, provider: p, model: PROVIDER_MODELS[p][0].value });
              }}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring"
            >
              {(["openai", "anthropic", "google"] as Provider[]).map((p) => (
                <option key={p} value={p}>{PROVIDER_LABELS[p]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">{t.model}</label>
            <select
              value={currentModel.value}
              onChange={(e) => onChange({ ...config, model: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring"
            >
              {models.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { t, locale, setLocale } = useLocale();

  function apiKeyForProvider(provider: Provider): string {
    if (provider === "openai") return settings.openaiApiKey;
    if (provider === "anthropic") return settings.anthropicApiKey;
    return settings.googleApiKey;
  }

  const modes: { value: DefaultMode; label: string; description: string }[] = [
    {
      value: "structured-debate",
      label: t.structuredDebate,
      description: t.debateDesc,
    },
    {
      value: "free-talk",
      label: t.freeTalk,
      description: t.freeTalkDesc,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7 sm:py-8">
      <div className="max-w-xl">
        <h2 className="text-lg font-semibold text-foreground mb-1">{t.settingsTitle}</h2>
        <p className="text-xs text-muted-foreground mb-9">{t.settingsDesc}</p>

        <div className="space-y-10">

          {/* UI Language */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              {t.uiLanguage}
            </h3>
            <div className="flex gap-2">
              {(["ja", "en"] as Locale[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  className={`px-4 py-2 text-sm rounded-xl border transition-all ${
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

          {/* API Keys */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              {t.apiKeys}
            </h3>
            <div className="mb-5 px-4 py-3.5 bg-muted/50 border border-border rounded-2xl">
              <p className="text-xs font-medium text-foreground mb-1">{t.apiKeysTempWarningTitle}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.apiKeysTempWarningDesc}
              </p>
            </div>
            <div className="space-y-4">
              <ApiKeyField
                label="OpenAI API Key"
                value={settings.openaiApiKey}
                onChange={(v) => updateSettings({ openaiApiKey: v })}
                placeholder="sk-..."
              />
              <ApiKeyField
                label="Anthropic API Key"
                value={settings.anthropicApiKey}
                onChange={(v) => updateSettings({ anthropicApiKey: v })}
                placeholder="sk-ant-..."
              />
              <ApiKeyField
                label="Google API Key"
                value={settings.googleApiKey}
                onChange={(v) => updateSettings({ googleApiKey: v })}
                placeholder="AIza..."
              />
            </div>
          </section>

          {/* Default Mode */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              {t.defaultMode}
            </h3>
            <div className="space-y-2.5">
              {modes.map((mode) => {
                const active = settings.defaultMode === mode.value;
                return (
                  <button
                    key={mode.value}
                    onClick={() => updateSettings({ defaultMode: mode.value })}
                    className={`w-full text-left px-5 py-4 rounded-2xl border transition-all ${
                      active
                        ? "bg-card border-foreground/20"
                        : "bg-background border-border hover:border-foreground/10 hover:bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        active ? "bg-foreground" : "bg-border"
                      }`} />
                      <span className={`text-sm font-medium ${
                        active ? "text-foreground" : "text-foreground/70"
                      }`}>
                        {mode.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-4 leading-relaxed">{mode.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Agent Configuration */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
              {t.agentConfig}
            </h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              {t.agentConfigDesc}
            </p>
            <div className="space-y-3">
              <SideConfig sideKey="A" config={settings.sideA} hasApiKey={!!apiKeyForProvider(settings.sideA.provider)} onChange={(c) => updateSettings({ sideA: c })} />
              <SideConfig sideKey="B" config={settings.sideB} hasApiKey={!!apiKeyForProvider(settings.sideB.provider)} onChange={(c) => updateSettings({ sideB: c })} />
              <SideConfig sideKey="C" config={settings.sideC} hasApiKey={!!apiKeyForProvider(settings.sideC.provider)} onChange={(c) => updateSettings({ sideC: c })} />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

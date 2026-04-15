import { useSettings } from "../context/SettingsContext";
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

const MODES: { value: DefaultMode; label: string; description: string }[] = [
  {
    value: "structured-debate",
    label: "Structured Debate",
    description: "Each agent takes a distinct position and argues it. Trade-offs surface through disagreement.",
  },
  {
    value: "free-talk",
    label: "Free Talk",
    description: "Agents respond freely without role constraints. Good for open exploration and brainstorming.",
  },
];

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
      <label className="block text-xs font-medium text-foreground mb-1">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="new-password"
        className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring font-mono placeholder:font-sans placeholder:text-muted-foreground"
      />
    </div>
  );
}

function SideConfig({
  label,
  config,
  onChange,
}: {
  label: string;
  config: AgentSideConfig;
  onChange: (c: AgentSideConfig) => void;
}) {
  const models = PROVIDER_MODELS[config.provider];
  const color = PROVIDER_COLORS[config.provider];
  const currentModel = models.find((m) => m.value === config.model) ?? models[0];

  return (
    <div className="flex gap-4 items-start bg-muted/30 border border-border/60 rounded-lg p-4">
      {/* Color indicator */}
      <div className="shrink-0 flex flex-col items-center gap-1 pt-0.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
          style={{ backgroundColor: color }}
        >
          {label}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground mb-2.5">Side {label}</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Provider</label>
            <select
              value={config.provider}
              onChange={(e) => {
                const p = e.target.value as Provider;
                onChange({ ...config, provider: p, model: PROVIDER_MODELS[p][0].value });
              }}
              className="w-full px-2.5 py-1.5 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring"
            >
              {(["openai", "anthropic", "google"] as Provider[]).map((p) => (
                <option key={p} value={p}>{PROVIDER_LABELS[p]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Model</label>
            <select
              value={currentModel.value}
              onChange={(e) => onChange({ ...config, model: e.target.value })}
              className="w-full px-2.5 py-1.5 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring"
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

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-xl">
        <h2 className="text-lg font-semibold text-foreground mb-0.5">Settings</h2>
        <p className="text-xs text-muted-foreground mb-7">Changes are saved automatically.</p>

        <div className="space-y-9">

          {/* API Keys */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              API Keys
            </h3>
            <div className="mb-4 px-3.5 py-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/30 dark:border-amber-800">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 mb-1">Temporary storage</p>
              <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                API keys are currently stored in your browser's localStorage. This is a placeholder
                implementation. The final spec uses encrypted server-side storage per account —
                keys will never be exposed to the client.
              </p>
            </div>
            <div className="space-y-3.5">
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
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Default Mode
            </h3>
            <div className="space-y-2">
              {MODES.map((mode) => {
                const active = settings.defaultMode === mode.value;
                const isDebate = mode.value === "structured-debate";
                return (
                  <button
                    key={mode.value}
                    onClick={() => updateSettings({ defaultMode: mode.value })}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      active
                        ? isDebate
                          ? "bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700"
                          : "bg-violet-50 border-violet-300 dark:bg-violet-900/20 dark:border-violet-700"
                        : "bg-background border-border hover:bg-accent/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        active
                          ? isDebate ? "bg-blue-500" : "bg-violet-500"
                          : "bg-border"
                      }`} />
                      <span className={`text-sm font-medium ${
                        active
                          ? isDebate ? "text-blue-700 dark:text-blue-400" : "text-violet-700 dark:text-violet-400"
                          : "text-foreground"
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
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Agent Configuration
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Each side maps to one provider and model. Agents respond in the order A → B → C.
            </p>
            <div className="space-y-2.5">
              <SideConfig label="A" config={settings.sideA} onChange={(c) => updateSettings({ sideA: c })} />
              <SideConfig label="B" config={settings.sideB} onChange={(c) => updateSettings({ sideB: c })} />
              <SideConfig label="C" config={settings.sideC} onChange={(c) => updateSettings({ sideC: c })} />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

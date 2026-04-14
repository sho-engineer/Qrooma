import { useSettings } from "../context/SettingsContext";
import type { AgentSideConfig, Provider, DefaultMode } from "../types";

const OPENAI_MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"];
const ANTHROPIC_MODELS = ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"];
const GOOGLE_MODELS = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"];

const PROVIDER_MODELS: Record<Provider, string[]> = {
  openai: OPENAI_MODELS,
  anthropic: ANTHROPIC_MODELS,
  google: GOOGLE_MODELS,
};

const PROVIDER_LABELS: Record<Provider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
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
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring font-mono placeholder:font-sans placeholder:text-muted-foreground"
        />
      </div>
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
  return (
    <div className="bg-muted/40 rounded-lg p-4 space-y-3">
      <p className="text-sm font-medium text-foreground">Side {label}</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Provider</label>
          <select
            value={config.provider}
            onChange={(e) => {
              const p = e.target.value as Provider;
              onChange({ ...config, provider: p, model: PROVIDER_MODELS[p][0] });
            }}
            className="w-full px-2 py-1.5 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring"
          >
            {(["openai", "anthropic", "google"] as Provider[]).map((p) => (
              <option key={p} value={p}>{PROVIDER_LABELS[p]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Model</label>
          <select
            value={config.model}
            onChange={(e) => onChange({ ...config, model: e.target.value })}
            className="w-full px-2 py-1.5 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring"
          >
            {models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="text-lg font-semibold mb-1">Settings</h2>
      <p className="text-xs text-muted-foreground mb-6">Changes are saved automatically.</p>

      <div className="max-w-xl space-y-8">

        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">API Keys</h3>
          <div className="mb-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-md dark:bg-amber-950/30 dark:border-amber-800">
            <p className="text-xs text-amber-800 dark:text-amber-400 font-medium mb-0.5">Temporary storage</p>
            <p className="text-xs text-amber-700 dark:text-amber-500">
              API keys are currently stored in your browser's localStorage. This is a placeholder implementation.
              The final spec uses encrypted server-side storage per account — keys will never be exposed to the client.
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

        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Default Mode</h3>
          <div className="space-y-2">
            {MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => updateSettings({ defaultMode: mode.value })}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  settings.defaultMode === mode.value
                    ? "bg-primary/5 border-primary text-foreground"
                    : "bg-background border-border text-foreground hover:bg-accent"
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${settings.defaultMode === mode.value ? "bg-primary" : "bg-border"}`} />
                  <span className="text-sm font-medium">{mode.label}</span>
                </div>
                <p className="text-xs text-muted-foreground pl-4">{mode.description}</p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Agent Configuration</h3>
          <div className="space-y-3">
            <SideConfig
              label="A"
              config={settings.sideA}
              onChange={(c) => updateSettings({ sideA: c })}
            />
            <SideConfig
              label="B"
              config={settings.sideB}
              onChange={(c) => updateSettings({ sideB: c })}
            />
            <SideConfig
              label="C"
              config={settings.sideC}
              onChange={(c) => updateSettings({ sideC: c })}
            />
          </div>
        </section>

      </div>
    </div>
  );
}

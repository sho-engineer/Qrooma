import { useState } from "react";
import { useSettings } from "../context/SettingsContext";
import type { AgentSideConfig, Provider } from "../types";

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
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring font-mono placeholder:font-sans placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="px-3 py-2 text-xs border border-border rounded-md text-muted-foreground hover:bg-accent transition-colors"
        >
          {show ? "Hide" : "Show"}
        </button>
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
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="text-lg font-semibold mb-6">Settings</h2>

      <div className="max-w-xl space-y-8">
        <section>
          <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide text-xs text-muted-foreground">API Keys</h3>
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

        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Default Mode</h3>
          <div className="flex gap-2">
            {(["debate", "collaborate", "critique"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => updateSettings({ defaultMode: mode })}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  settings.defaultMode === mode
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-accent"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {settings.defaultMode === "debate" && "Agents take opposing positions to surface trade-offs."}
            {settings.defaultMode === "collaborate" && "Agents build on each other's ideas constructively."}
            {settings.defaultMode === "critique" && "Agents critically evaluate ideas to find weaknesses."}
          </p>
        </section>

        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          {saved ? "Saved!" : "Save settings"}
        </button>
      </div>
    </div>
  );
}

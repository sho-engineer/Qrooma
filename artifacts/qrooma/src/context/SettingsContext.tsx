import { createContext, useContext, useState, type ReactNode } from "react";
import type { Settings } from "../types";
import { DEFAULT_SETTINGS } from "../data/dummy";

interface SettingsContextValue {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem("qrooma_settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Settings & {
          googleApiKey?: unknown;
          sideA?: { provider?: string; model?: string; side?: string };
          sideB?: { provider?: string; model?: string; side?: string };
          sideC?: { provider?: string; model?: string; side?: string };
        };
        if (parsed.defaultMode === "debate" || parsed.defaultMode === "collaborate" || parsed.defaultMode === "critique") {
          parsed.defaultMode = "structured-debate";
        }
        // Migrate: remove legacy google key
        delete parsed.googleApiKey;
        // Ensure anthropicApiKey exists
        if (!("anthropicApiKey" in parsed)) {
          (parsed as Settings).anthropicApiKey = "";
        }
        return { ...DEFAULT_SETTINGS, ...parsed };
      } catch { /* ignore */ }
    }
    return DEFAULT_SETTINGS;
  });

  function updateSettings(patch: Partial<Settings>) {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("qrooma_settings", JSON.stringify(next));
      return next;
    });
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

import { RotateCcwIcon } from "lucide-react";
import type { RunStatus } from "../types";
import { useLocale } from "../context/LocaleContext";

interface Props {
  roomName: string;
  runStatus: RunStatus;
  modeLabel: string;
  activeModels: string[];
  hasMessages: boolean;
  canRun: boolean;
  onRerun: () => void;
}

const MODEL_SHORT: Record<string, string> = {
  "gpt-4o":                      "GPT-4o",
  "gpt-4o-mini":                 "GPT-4o mini",
  "gpt-4-turbo":                 "GPT-4 Turbo",
  "gpt-3.5-turbo":               "GPT-3.5 Turbo",
  "claude-3-5-sonnet-20241022":  "Claude 3.5 Sonnet",
  "claude-3-opus-20240229":      "Claude 3 Opus",
  "claude-3-haiku-20240307":     "Claude 3 Haiku",
  "gemini-1.5-pro":              "Gemini 1.5 Pro",
  "gemini-1.5-flash":            "Gemini 1.5 Flash",
  "gemini-1.0-pro":              "Gemini 1.0 Pro",
};

function shorten(model: string): string {
  return MODEL_SHORT[model] ?? model;
}

export default function RoomHeader({
  roomName,
  runStatus,
  modeLabel,
  activeModels,
  hasMessages,
  canRun,
  onRerun,
}: Props) {
  const { t } = useLocale();
  const modelLine = activeModels.map(shorten).join(" · ");

  return (
    <div className="shrink-0 border-b border-border bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 sm:px-5 pt-3.5 pb-1.5 min-w-0">
        <h1 className="flex-1 text-sm font-semibold text-foreground tracking-[-0.01em] truncate min-w-0">
          {roomName}
        </h1>
        {hasMessages && (
          <button
            onClick={onRerun}
            disabled={runStatus === "running" || !canRun}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium border border-border rounded-lg text-muted-foreground hover:bg-accent transition-colors disabled:opacity-40 shrink-0"
            title={!canRun ? t.apiKeyMissingRunTitle : t.rerun}
          >
            <RotateCcwIcon size={11} />
            {t.rerun}
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 px-4 sm:px-5 pb-3 overflow-hidden">
        <RunStatusBadge status={runStatus} />
        <span className="text-border text-xs shrink-0">·</span>
        <ModeBadge label={modeLabel} />
        {modelLine && (
          <>
            <span className="text-border text-xs shrink-0 hidden sm:block">·</span>
            <span
              className="text-[11px] text-muted-foreground/50 hidden sm:block truncate min-w-0"
              title={modelLine}
            >
              {modelLine}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function RunStatusBadge({ status }: { status: RunStatus }) {
  const { t } = useLocale();

  const config: Record<RunStatus, { label: string; dotClass: string; pill: string }> = {
    idle: {
      label: t.statusIdle,
      dotClass: "bg-muted-foreground/30",
      pill: "bg-muted text-muted-foreground",
    },
    running: {
      label: t.statusRunning,
      dotClass: "bg-amber-400 animate-pulse",
      pill: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    },
    completed: {
      label: t.statusCompleted,
      dotClass: "bg-muted-foreground/40",
      pill: "bg-muted text-muted-foreground",
    },
    error: {
      label: t.statusError,
      dotClass: "bg-destructive/60",
      pill: "bg-muted text-destructive/80",
    },
  };

  const { label, dotClass, pill } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}

function ModeBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 bg-muted text-muted-foreground">
      {label}
    </span>
  );
}

import { RotateCcwIcon } from "lucide-react";
import type { RunStatus } from "../types";

interface Props {
  roomName: string;
  runStatus: RunStatus;
  modeLabel: string;
  activeModels: string[];
  hasMessages: boolean;
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
  onRerun,
}: Props) {
  const modelLine = activeModels.map(shorten).join(" · ");

  return (
    <div className="shrink-0 border-b border-border bg-card">
      {/* Row 1: room name + re-run */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <h1 className="text-sm font-semibold text-foreground truncate">{roomName}</h1>
        {hasMessages && (
          <button
            onClick={onRerun}
            disabled={runStatus === "running"}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border border-border rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-40 shrink-0 ml-3"
            title="Re-run — starts a new run with the same last question"
          >
            <RotateCcwIcon size={11} />
            Re-run
          </button>
        )}
      </div>

      {/* Row 2: status + mode + models */}
      <div className="flex items-center gap-1.5 px-4 pb-2 flex-wrap">
        <RunStatusBadge status={runStatus} />
        <span className="text-muted-foreground/40 text-xs">·</span>
        <ModeBadge label={modeLabel} />
        {modelLine && (
          <>
            <span className="text-muted-foreground/40 text-xs hidden sm:block">·</span>
            <span
              className="text-xs text-muted-foreground/70 hidden sm:block truncate max-w-sm"
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
  const config: Record<RunStatus, { label: string; dot: string; text: string; bg: string }> = {
    idle:      { label: "Idle",       dot: "bg-muted-foreground/40", text: "text-muted-foreground", bg: "bg-muted/60" },
    running:   { label: "Running",    dot: "bg-yellow-500 animate-pulse", text: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/30" },
    completed: { label: "Completed",  dot: "bg-green-500", text: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/30" },
    error:     { label: "Error",      dot: "bg-destructive", text: "text-destructive", bg: "bg-destructive/10" },
  };
  const { label, dot, text, bg } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {label}
    </span>
  );
}

function ModeBadge({ label }: { label: string }) {
  const isDebate = label === "Structured Debate";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
      isDebate
        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        : "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
    }`}>
      {label}
    </span>
  );
}

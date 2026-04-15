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

export default function RoomHeader({
  roomName,
  runStatus,
  modeLabel,
  activeModels,
  hasMessages,
  onRerun,
}: Props) {
  return (
    <div className="shrink-0 border-b border-border bg-card">
      <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
        <h1 className="text-sm font-semibold text-foreground truncate">{roomName}</h1>
        {hasMessages && (
          <button
            onClick={onRerun}
            disabled={runStatus === "running"}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium border border-border rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-40 shrink-0 ml-3"
            title="Re-run with last question"
          >
            <RotateCcwIcon size={12} />
            Re-run
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 px-4 pb-2 flex-wrap">
        <RunStatusBadge status={runStatus} />
        <span className="text-xs text-muted-foreground border border-border/60 rounded px-1.5 py-0.5 whitespace-nowrap">
          {modeLabel}
        </span>
        <span
          className="text-xs text-muted-foreground hidden sm:block truncate max-w-xs"
          title={activeModels.join(" · ")}
        >
          {activeModels.join(" · ")}
        </span>
      </div>
    </div>
  );
}

function RunStatusBadge({ status }: { status: RunStatus }) {
  const map: Record<RunStatus, { label: string; classes: string }> = {
    idle:      { label: "Idle",      classes: "bg-muted text-muted-foreground" },
    running:   { label: "Running…",  classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400" },
    completed: { label: "Completed", classes: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400" },
    error:     { label: "Error",     classes: "bg-destructive/10 text-destructive" },
  };
  const { label, classes } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${classes}`}>
      {status === "running" && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {label}
    </span>
  );
}

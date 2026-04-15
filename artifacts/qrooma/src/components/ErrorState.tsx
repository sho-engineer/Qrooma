import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react";

interface Props {
  onRerun: () => void;
}

export default function ErrorState({ onRerun }: Props) {
  return (
    <div className="mt-4 rounded-lg border border-destructive/25 bg-destructive/5 overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangleIcon size={13} className="text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-destructive">Run failed</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            One or more agents did not respond. Check that your API keys are set in Settings and try again.
          </p>
        </div>
      </div>
      <div className="border-t border-destructive/15 px-4 py-2 bg-destructive/[0.03] flex justify-end">
        <button
          onClick={onRerun}
          className="flex items-center gap-1.5 text-xs font-medium text-destructive hover:opacity-80 transition-opacity"
        >
          <RotateCcwIcon size={11} />
          Re-run
        </button>
      </div>
    </div>
  );
}

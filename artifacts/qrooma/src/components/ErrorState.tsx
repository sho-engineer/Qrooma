import { AlertCircleIcon, RotateCcwIcon } from "lucide-react";

interface Props {
  onRerun: () => void;
}

export default function ErrorState({ onRerun }: Props) {
  return (
    <div className="flex items-start gap-3 mt-4 px-4 py-3.5 bg-destructive/5 border border-destructive/20 rounded-lg">
      <AlertCircleIcon size={16} className="text-destructive mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-destructive">Run failed</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          One or more agents did not respond. Check your API keys in Settings, then try again.
        </p>
      </div>
      <button
        onClick={onRerun}
        className="flex items-center gap-1 text-xs text-destructive underline underline-offset-2 shrink-0 hover:opacity-80 transition-opacity"
      >
        <RotateCcwIcon size={11} />
        Re-run
      </button>
    </div>
  );
}

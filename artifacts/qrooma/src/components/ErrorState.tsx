import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react";
import { useLocale } from "../context/LocaleContext";

interface Props {
  onRerun: () => void;
}

export default function ErrorState({ onRerun }: Props) {
  const { t } = useLocale();

  return (
    <div className="mt-4 rounded-lg border border-destructive/25 bg-destructive/5 overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangleIcon size={13} className="text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-destructive">{t.runFailed}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {t.runFailedDesc}
          </p>
        </div>
      </div>
      <div className="border-t border-destructive/15 px-4 py-2 bg-destructive/[0.03] flex justify-end">
        <button
          onClick={onRerun}
          className="flex items-center gap-1.5 text-xs font-medium text-destructive hover:opacity-80 transition-opacity"
        >
          <RotateCcwIcon size={11} />
          {t.rerun}
        </button>
      </div>
    </div>
  );
}

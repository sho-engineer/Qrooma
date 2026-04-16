import { RotateCcwIcon } from "lucide-react";
import { useLocale } from "../context/LocaleContext";

interface Props {
  onRerun: () => void;
}

export default function ErrorState({ onRerun }: Props) {
  const { t } = useLocale();

  return (
    <div className="mt-4 rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-4">
        <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive/70" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{t.runFailed}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {t.runFailedDesc}
          </p>
        </div>
      </div>
      <div className="border-t border-border px-4 py-2.5 flex justify-end">
        <button
          onClick={onRerun}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcwIcon size={11} />
          {t.rerun}
        </button>
      </div>
    </div>
  );
}

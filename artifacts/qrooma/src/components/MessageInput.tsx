import { forwardRef } from "react";
import { Link } from "wouter";
import { SendIcon, ZapIcon, KeyRoundIcon } from "lucide-react";
import { useLocale } from "../context/LocaleContext";

interface Props {
  value:        string;
  onChange:     (v: string) => void;
  onSend:       () => void;
  isRunning:    boolean;
  /** false = BYOK keys not set → Free mode (still allows sending, with banner) */
  apiKeysReady: boolean;
}

const MessageInput = forwardRef<HTMLTextAreaElement, Props>(function MessageInput({
  value,
  onChange,
  onSend,
  isRunning,
  apiKeysReady,
}, ref) {
  const { t } = useLocale();

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isRunning) onSend();
    }
  }

  const isFreeMode = !apiKeysReady;

  return (
    <div className="shrink-0 px-3 pb-3 pt-1 sm:px-4 sm:pb-4">
      {/* Free mode banner */}
      {isFreeMode && (
        <div className="flex items-center justify-between gap-3 mb-2 px-3.5 py-2 rounded-xl bg-card border border-border/80">
          <div className="flex items-center gap-2 min-w-0">
            <ZapIcon size={12} className="shrink-0 text-amber-500" />
            <span className="text-[11px] font-medium text-foreground">{t.freeMode}</span>
            <span className="text-[11px] text-muted-foreground/60 hidden sm:block">—</span>
            <span className="text-[11px] text-muted-foreground/60 hidden sm:block leading-snug">
              {t.freeModeHint}
            </span>
          </div>
          <Link href="/settings" className="shrink-0">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap">
              <KeyRoundIcon size={10} />
              {t.goToSettings}
            </span>
          </Link>
        </div>
      )}

      <div
        className={`flex gap-2 bg-card border rounded-2xl px-3 py-2 transition-opacity ${
          isRunning ? "opacity-60" : ""
        }`}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRunning ? t.agentsResponding : t.messagePlaceholder}
          rows={2}
          disabled={isRunning}
          className="flex-1 resize-none text-sm bg-transparent outline-none placeholder:text-muted-foreground/50 disabled:cursor-not-allowed leading-relaxed"
        />
        <button
          onClick={() => !isRunning && onSend()}
          disabled={!value.trim() || isRunning}
          className="self-end p-1.5 text-foreground/50 hover:text-foreground/80 disabled:opacity-30 transition-colors active:scale-[0.92]"
          title={t.sendingAutoRun}
        >
          <SendIcon size={15} />
        </button>
      </div>

      <p className="mt-1 text-[11px] text-muted-foreground/40 text-right">
        {isFreeMode ? t.freeModeDesc : t.sendingAutoRun}
      </p>
    </div>
  );
});

export default MessageInput;

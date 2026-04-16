import { Link } from "wouter";
import { SendIcon, KeyRoundIcon } from "lucide-react";
import { useLocale } from "../context/LocaleContext";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  isRunning: boolean;
  /** false = required API keys are missing → block sending */
  apiKeysReady: boolean;
}

export default function MessageInput({
  value,
  onChange,
  onSend,
  isRunning,
  apiKeysReady,
}: Props) {
  const { t } = useLocale();

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (apiKeysReady) onSend();
    }
  }

  const isDisabled = isRunning || !apiKeysReady;

  return (
    <div className="shrink-0 px-3 pb-3 pt-1 sm:px-4 sm:pb-4">
      {/* API key missing banner */}
      {!apiKeysReady && (
        <div className="flex items-start justify-between gap-3 mb-2 px-3.5 py-2.5 rounded-xl bg-card border border-border/80">
          <div className="flex items-start gap-2.5 min-w-0">
            <KeyRoundIcon size={13} className="shrink-0 text-muted-foreground/50 mt-px" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">{t.apiKeyMissingRunTitle}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-relaxed">
                {t.apiKeyMissingRunDesc}
              </p>
            </div>
          </div>
          <Link href="/settings" className="shrink-0">
            <span className="text-[11px] font-medium text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity whitespace-nowrap">
              {t.goToSettings}
            </span>
          </Link>
        </div>
      )}

      <div
        className={`flex gap-2 bg-card border rounded-2xl px-3 py-2 transition-opacity ${
          isDisabled ? "opacity-50" : ""
        }`}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            !apiKeysReady
              ? t.apiKeyMissingRunTitle
              : isRunning
              ? t.agentsResponding
              : t.messagePlaceholder
          }
          rows={2}
          disabled={isDisabled}
          className="flex-1 resize-none text-sm bg-transparent outline-none placeholder:text-muted-foreground/50 disabled:cursor-not-allowed leading-relaxed"
        />
        <button
          onClick={() => apiKeysReady && onSend()}
          disabled={!value.trim() || isDisabled}
          className="self-end p-1.5 text-foreground/50 hover:text-foreground/80 disabled:opacity-30 transition-colors"
          title={!apiKeysReady ? t.apiKeyMissingRunTitle : t.sendingAutoRun}
        >
          <SendIcon size={15} />
        </button>
      </div>

      <p className="mt-1 text-[11px] text-muted-foreground/40 text-right">
        {apiKeysReady ? t.sendingAutoRun : ""}
      </p>
    </div>
  );
}

import { forwardRef } from "react";
import { SendIcon, SlidersHorizontalIcon, Square } from "lucide-react";
import { useLocale } from "../context/LocaleContext";
import { isMobile } from "../lib/isMobile";

interface Props {
  value:        string;
  onChange:     (v: string) => void;
  onSend:       () => void;
  /** Called when the user presses the stop button during generation */
  onStop?:      () => void;
  isRunning:    boolean;
  /** Whether prompt mode is currently active */
  promptMode?:  boolean;
  /** Toggle between normal and prompt mode */
  onTogglePromptMode?: () => void;
  /** @deprecated kept for caller compatibility — no longer used */
  apiKeysReady?: boolean;
  /** @deprecated kept for caller compatibility — no longer used */
  usageInfo?: unknown;
}

const MessageInput = forwardRef<HTMLTextAreaElement, Props>(function MessageInput({
  value,
  onChange,
  onSend,
  onStop,
  isRunning,
  promptMode,
  onTogglePromptMode,
}, ref) {
  const { t, locale } = useLocale();
  const ja = locale === "ja";

  function handleKeyDown(e: React.KeyboardEvent) {
    if (isMobile()) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isRunning) onSend();
    }
  }

  const hintText = isMobile()
    ? (ja ? "送信は右のボタンから" : "Tap the button to send")
    : t.sendingAutoRun;

  return (
    <div className="shrink-0 px-3 pb-3 pt-1 sm:px-4 sm:pb-4">
      {/* Mode toggle row */}
      {onTogglePromptMode && (
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => promptMode && onTogglePromptMode()}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              !promptMode
                ? "bg-foreground text-background"
                : "text-muted-foreground/60 hover:text-foreground"
            }`}
          >
            {ja ? "通常" : "Normal"}
          </button>
          <button
            type="button"
            onClick={() => !promptMode && onTogglePromptMode()}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              promptMode
                ? "bg-foreground text-background"
                : "text-muted-foreground/60 hover:text-foreground"
            }`}
          >
            <SlidersHorizontalIcon size={10} />
            {ja ? "プロンプトモード" : "Prompt Mode"}
          </button>
        </div>
      )}

      <div className="flex gap-2 bg-card border rounded-2xl px-3 py-2">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isRunning
              ? (ja ? "生成中…" : "Generating…")
              : (isMobile()
                  ? (ja ? "メッセージを入力" : "Type a message")
                  : t.messagePlaceholder)
          }
          rows={2}
          disabled={isRunning}
          enterKeyHint={isMobile() ? "enter" : "send"}
          className="flex-1 resize-none text-sm bg-transparent outline-none placeholder:text-muted-foreground/40 disabled:cursor-not-allowed leading-relaxed"
        />

        {/* Stop button — visible during generation */}
        {isRunning && onStop ? (
          <button
            onClick={onStop}
            className="self-end p-2 rounded-xl bg-destructive/90 text-white hover:bg-destructive transition-all active:scale-[0.92] touch-manipulation"
            title={ja ? "停止" : "Stop"}
          >
            <Square size={14} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={() => !isRunning && onSend()}
            disabled={!value.trim() || isRunning}
            className="self-end p-2 rounded-xl bg-foreground text-background disabled:opacity-20 transition-all active:scale-[0.92] hover:opacity-90"
            title={t.sendingAutoRun}
          >
            <SendIcon size={14} />
          </button>
        )}
      </div>

      <p className="mt-1 text-[11px] text-muted-foreground/40 text-right">
        {isRunning ? (ja ? "生成中は停止ボタンで中断できます" : "Press stop to abort generation") : hintText}
      </p>
    </div>
  );
});

export default MessageInput;

import { SendIcon } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  isRunning: boolean;
}

export default function MessageInput({ value, onChange, onSend, isRunning }: Props) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div className="shrink-0 px-4 pb-4 pt-1">
      <div
        className={`flex gap-2 bg-card border rounded-lg px-3 py-2 transition-opacity ${
          isRunning ? "opacity-60" : ""
        }`}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isRunning
              ? "Agents are responding…"
              : "Ask the team something… (Enter to send, Shift+Enter for newline)"
          }
          rows={2}
          disabled={isRunning}
          className="flex-1 resize-none text-sm bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed leading-relaxed"
        />
        <button
          onClick={onSend}
          disabled={!value.trim() || isRunning}
          className="self-end p-1.5 text-primary hover:text-primary/80 disabled:opacity-40 transition-colors"
          title="Send — starts a new run"
        >
          <SendIcon size={15} />
        </button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground text-right">
        Sending starts a new run automatically.
      </p>
    </div>
  );
}

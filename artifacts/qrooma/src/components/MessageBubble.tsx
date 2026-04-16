import type { Message, DefaultMode } from "../types";
import { useLocale } from "../context/LocaleContext";

// Fixed side mapping for the MVP dummy data
// In production, this would be derived from the run's agent configuration.
const AGENT_SIDE_MAP: Record<string, "A" | "B" | "C"> = {
  gpt: "A",
  claude: "B",
  gemini: "C",
};

const SIDE_COLORS: Record<"A" | "B" | "C", string> = {
  A: "#10a37f",
  B: "#d97706",
  C: "#4285f4",
};

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

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function RichContent({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/);
  return (
    <div className="space-y-2">
      {paragraphs.map((para, pi) => {
        const lines = para.split("\n");
        const isList = lines.every((l) => l.trim().startsWith("•") || l.trim() === "");
        if (isList) {
          const items = lines
            .filter((l) => l.trim().startsWith("•"))
            .map((l) => l.replace(/^•\s*/, "").trim());
          return (
            <ul key={pi} className="space-y-1.5 pl-1">
              {items.map((item, ii) => (
                <li key={ii} className="flex items-start gap-2">
                  <span className="mt-2 w-1 h-1 rounded-full bg-current shrink-0 opacity-30" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={pi}>
            {lines.map((line, li) => (
              <span key={li}>
                {line}
                {li < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

interface Props {
  message: Message;
  mode: DefaultMode;
  /** Shortened model name per side (A/B/C → "GPT-4o" etc.) */
  sideModelMap: Record<"A" | "B" | "C", string>;
}

export default function MessageBubble({ message, mode, sideModelMap }: Props) {
  const { t } = useLocale();

  if (message.role === "user") {
    return (
      <div className="flex justify-end overflow-hidden">
        <div className="max-w-[88%] sm:max-w-[72%] bg-foreground text-background rounded-2xl px-4 py-2.5 text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  const agentId = message.agentId ?? "";
  const side = AGENT_SIDE_MAP[agentId] ?? "A";
  const color = SIDE_COLORS[side];
  const roleLabel = t.roleLabel(side, mode);
  const modelLabel = sideModelMap[side];

  return (
    <div className="flex gap-3 max-w-[95%] sm:max-w-[88%] overflow-hidden">
      {/* Side dot avatar */}
      <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      </div>

      <div className="min-w-0 flex-1">
        {/* Role label (primary) + model name (secondary) */}
        <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
          <span className="text-xs font-semibold text-foreground tracking-[-0.01em]">
            {roleLabel}
          </span>
          {modelLabel && (
            <span className="text-[10px] text-muted-foreground/50 font-normal">
              {modelLabel}
            </span>
          )}
        </div>

        <div className="bg-card border border-border/70 rounded-xl px-4 py-3 text-sm text-foreground leading-relaxed">
          <RichContent text={message.content} />
        </div>

        <p className="text-[11px] text-muted-foreground/40 mt-1 pl-1">
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

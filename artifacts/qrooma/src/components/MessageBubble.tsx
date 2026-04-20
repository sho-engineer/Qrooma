import type { Message, DefaultMode } from "../types";
import { useLocale } from "../context/LocaleContext";

// Fixed side mapping for the MVP
const AGENT_SIDE_MAP: Record<string, "A" | "B" | "C"> = {
  gpt:    "A",
  claude: "B",
  gemini: "C",
};

// Short brand names used in the combined label "提案（GPT）" / "Proposal (GPT)"
const AGENT_BRAND: Record<string, string> = {
  gpt:    "GPT",
  claude: "Claude",
  gemini: "Gemini",
};

const SIDE_COLORS: Record<"A" | "B" | "C", string> = {
  A: "#10a37f",
  B: "#d97706",
  C: "#4285f4",
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
  message:      Message;
  mode:         DefaultMode;
  sideModelMap: Record<"A" | "B" | "C", string>;
}

export default function MessageBubble({ message, mode, sideModelMap: _sideModelMap }: Props) {
  const { t, locale } = useLocale();

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
  // Prefer the side stored on the message itself (set by the backend at generation time).
  // Fall back to the static map only when message.side is absent (e.g. older messages).
  const side      = (message.side as "A" | "B" | "C" | undefined) ?? AGENT_SIDE_MAP[agentId] ?? "A";
  const color     = SIDE_COLORS[side];
  const roleLabel = t.roleLabel(side, mode);
  const brand     = AGENT_BRAND[agentId] ?? agentId;

  // Combined display: "提案（GPT）" / "Proposal (GPT)"
  const displayLabel = locale === "ja"
    ? `${roleLabel}（${brand}）`
    : `${roleLabel} (${brand})`;

  return (
    <div className="flex gap-3 max-w-[95%] sm:max-w-[88%] overflow-hidden">
      {/* Side dot avatar */}
      <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      </div>

      <div className="min-w-0 flex-1">
        {/* Combined role + model label */}
        <div className="flex items-center gap-1.5 mb-1.5 min-w-0">
          <span className="text-xs font-semibold text-foreground tracking-[-0.01em] truncate">
            {displayLabel}
          </span>
        </div>

        <div className="bg-card border border-border/70 rounded-xl px-4 py-3 text-sm text-foreground leading-relaxed overflow-hidden">
          <RichContent text={message.content} />
        </div>

        <p className="text-[11px] text-muted-foreground/40 mt-1 pl-1">
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

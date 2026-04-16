import { AGENTS } from "../data/dummy";
import type { Message } from "../types";

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
          const items = lines.filter((l) => l.trim().startsWith("•")).map((l) =>
            l.replace(/^•\s*/, "").trim()
          );
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
}

export default function MessageBubble({ message }: Props) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] sm:max-w-[70%] bg-primary text-primary-foreground rounded-2xl px-4 py-2.5 text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  const agent = AGENTS.find((a) => a.id === message.agentId);

  return (
    <div className="flex gap-3 max-w-[95%] sm:max-w-[85%]">
      {agent && (
        <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: agent.color }}
          />
        </div>
      )}
      <div className="min-w-0">
        {agent && (
          <p className="text-[11px] font-medium text-muted-foreground mb-1.5 tracking-wide">
            {agent.name}
          </p>
        )}
        <div className="bg-card border border-border/70 rounded-xl px-4 py-3 text-sm text-foreground leading-relaxed">
          <RichContent text={message.content} />
        </div>
        <p className="text-[11px] text-muted-foreground/50 mt-1 pl-1">
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

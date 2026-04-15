import { AGENTS } from "../data/dummy";
import type { Message } from "../types";
import AgentAvatar from "./AgentAvatar";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Simple rich-text renderer: handles bullet lists and paragraph breaks */
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
            <ul key={pi} className="space-y-1 pl-1">
              {items.map((item, ii) => (
                <li key={ii} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-current shrink-0 opacity-50" />
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
        <div className="max-w-[70%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  const agent = AGENTS.find((a) => a.id === message.agentId);

  return (
    <div className="flex gap-2.5 max-w-[85%]">
      {message.agentId && <AgentAvatar agentId={message.agentId} />}
      <div className="min-w-0">
        {agent && (
          <p className="text-xs font-semibold mb-1" style={{ color: agent.color }}>
            {agent.name}
          </p>
        )}
        <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-foreground leading-relaxed">
          <RichContent text={message.content} />
        </div>
        <p className="text-xs text-muted-foreground mt-1 pl-1">
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

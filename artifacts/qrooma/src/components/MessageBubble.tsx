import { AGENTS } from "../data/dummy";
import type { Message } from "../types";
import AgentAvatar from "./AgentAvatar";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
          {message.content}
        </div>
        <p className="text-xs text-muted-foreground mt-1 pl-1">
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

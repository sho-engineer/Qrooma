import { AGENTS } from "../data/dummy";
import type { AgentId } from "../types";

interface Props {
  agentId: AgentId;
  size?: "sm" | "md";
}

export default function AgentAvatar({ agentId, size = "md" }: Props) {
  const agent = AGENTS.find((a) => a.id === agentId);
  if (!agent) return null;

  const dim = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  const dotDim = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-card border border-border shrink-0 ${dim}`}
      title={agent.name}
    >
      <span
        className={`rounded-full ${dotDim}`}
        style={{ backgroundColor: agent.color }}
      />
    </span>
  );
}

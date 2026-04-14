import { AGENTS } from "../data/dummy";
import type { AgentId } from "../types";

interface Props {
  agentId: AgentId;
  size?: "sm" | "md";
}

export default function AgentAvatar({ agentId, size = "md" }: Props) {
  const agent = AGENTS.find((a) => a.id === agentId);
  if (!agent) return null;

  const dim = size === "sm" ? "w-5 h-5 text-[10px]" : "w-7 h-7 text-xs";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0 ${dim}`}
      style={{ backgroundColor: agent.color }}
      title={agent.name}
    >
      {agent.initial}
    </span>
  );
}

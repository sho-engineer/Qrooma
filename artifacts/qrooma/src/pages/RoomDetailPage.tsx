import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { DUMMY_MESSAGES, DUMMY_CONCLUSIONS, AGENTS } from "../data/dummy";
import { useSettings } from "../context/SettingsContext";
import type { Message, RunStatus } from "../types";
import RoomHeader from "../components/RoomHeader";
import MessageBubble from "../components/MessageBubble";
import ConclusionCard from "../components/ConclusionCard";
import MessageInput from "../components/MessageInput";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

const MODE_LABELS: Record<string, string> = {
  "structured-debate": "Structured Debate",
  "free-talk": "Free Talk",
};

export default function RoomDetailPage() {
  const { id: roomId } = useParams<{ id: string }>();
  const { settings } = useSettings();

  const initialMessages = DUMMY_MESSAGES.filter((m) => m.roomId === roomId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [runStatus, setRunStatus] = useState<RunStatus>(
    initialMessages.length > 0 ? "completed" : "idle"
  );
  const [runCount, setRunCount] = useState(
    new Set(initialMessages.map((m) => m.runId).filter(Boolean)).size
  );

  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      topRef.current?.scrollIntoView();
      isFirstMount.current = false;
    } else {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  function triggerAgentReplies(currentRunId: string) {
    setRunStatus("running");
    let delay = 900;
    AGENTS.forEach((agent) => {
      setTimeout(() => {
        const pool = [
          `As ${agent.name}, I think this is a meaningful question. My analysis points to a structured approach — gather data first, then decide. Rushing to conclusions without evidence leads to costly reversals.`,
          `From ${agent.name}'s perspective: there are genuine trade-offs here. I'd carefully weigh short-term cost against long-term flexibility before making a commitment that's hard to undo.`,
          `${agent.name} here. The key lever is alignment. Without clear team buy-in, even the best-reasoned strategy will stall at execution. I'd recommend a short alignment check before committing to direction.`,
          `${agent.name} taking a different angle: the framing matters. How you define success changes which option looks best. Let's agree on the success metric before debating solutions.`,
        ];
        const content = pool[Math.floor(Math.random() * pool.length)];
        setMessages((prev) => [
          ...prev,
          {
            id: `m-${Date.now()}-${agent.id}`,
            roomId,
            role: "assistant",
            agentId: agent.id,
            content,
            createdAt: new Date().toISOString(),
            runId: currentRunId,
          },
        ]);
      }, delay);
      delay += 1000;
    });
    setTimeout(() => setRunStatus("completed"), delay + 300);
  }

  function sendMessage() {
    if (!input.trim() || runStatus === "running") return;
    const newRunId = `run-${Date.now()}`;
    const userMsg: Message = {
      id: `m-${Date.now()}`,
      roomId,
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
      runId: newRunId,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setRunCount((n) => n + 1);
    triggerAgentReplies(newRunId);
  }

  function rerun() {
    if (runStatus === "running" || messages.length === 0) return;
    const newRunId = `run-${Date.now()}`;
    setRunCount((n) => n + 1);
    triggerAgentReplies(newRunId);
  }

  const hasMessages = messages.length > 0;
  const modeLabel = MODE_LABELS[settings.defaultMode] ?? settings.defaultMode;
  const activeModels = [settings.sideA.model, settings.sideB.model, settings.sideC.model];
  const groupedMessages = groupByRun(messages);
  const conclusion = roomId ? DUMMY_CONCLUSIONS[roomId] ?? null : null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <RoomHeader
        runStatus={runStatus}
        modeLabel={modeLabel}
        activeModels={activeModels}
        hasMessages={hasMessages}
        onRerun={rerun}
      />

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col">
        <div ref={topRef} />

        {!hasMessages && <EmptyState />}

        {groupedMessages.map((group, groupIdx) => (
          <div key={group.runId}>
            {groupIdx > 0 && <RunSeparator label={`Run ${groupIdx + 1}`} />}
            <div className="space-y-4">
              {group.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>
          </div>
        ))}

        {runStatus === "running" && <ThinkingIndicator />}
        {runStatus === "error" && <ErrorState onRetry={rerun} />}

        <div ref={bottomRef} />
      </div>

      {hasMessages && (
        <ConclusionCard runCount={runCount} conclusion={conclusion} />
      )}

      <MessageInput
        value={input}
        onChange={setInput}
        onSend={sendMessage}
        isRunning={runStatus === "running"}
      />
    </div>
  );
}

function groupByRun(messages: Message[]) {
  const groups: { runId: string; messages: Message[] }[] = [];
  const seen = new Map<string, number>();
  for (const msg of messages) {
    const runId = msg.runId ?? "default";
    if (!seen.has(runId)) {
      seen.set(runId, groups.length);
      groups.push({ runId, messages: [] });
    }
    groups[seen.get(runId)!].messages.push(msg);
  }
  return groups;
}

function RunSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[11px] font-medium text-muted-foreground/70 tracking-wide uppercase whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground text-xs mt-4 px-1">
      <div className="flex gap-0.5">
        <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      Agents are thinking…
    </div>
  );
}

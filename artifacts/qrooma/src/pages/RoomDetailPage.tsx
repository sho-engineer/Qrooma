import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { DUMMY_MESSAGES, DUMMY_CONCLUSION, AGENTS } from "../data/dummy";
import { useSettings } from "../context/SettingsContext";
import type { Message, RunStatus } from "../types";
import AgentAvatar from "../components/AgentAvatar";
import {
  SendIcon,
  RotateCcwIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MessageSquarePlusIcon,
  AlertCircleIcon,
} from "lucide-react";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const MODE_LABELS: Record<string, string> = {
  "structured-debate": "Structured Debate",
  "free-talk": "Free Talk",
};

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const roomId = params.id;
  const { settings } = useSettings();

  const initialMessages = DUMMY_MESSAGES.filter((m) => m.roomId === roomId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [runStatus, setRunStatus] = useState<RunStatus>(
    initialMessages.length > 0 ? "completed" : "idle"
  );
  const [showConclusion, setShowConclusion] = useState(false);
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
    let delay = 1000;
    AGENTS.forEach((agent) => {
      setTimeout(() => {
        const replies = [
          `As ${agent.name}, I think this is a meaningful question. My analysis points to a structured approach: gather data first, then decide. Rushing to conclusions without evidence leads to costly reversals.`,
          `From ${agent.name}'s perspective: there are genuine trade-offs here. I'd carefully weigh short-term cost against long-term flexibility before making a commitment that's hard to undo.`,
          `${agent.name} here. The key lever is alignment. Without clear team buy-in, even the best-reasoned strategy will stall at execution. I'd recommend a short alignment workshop before committing to direction.`,
        ];
        const content = replies[Math.floor(Math.random() * replies.length)];
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
      delay += 900;
    });
    setTimeout(() => setRunStatus("completed"), delay + 200);
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
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;
    const newRunId = `run-${Date.now()}`;
    triggerAgentReplies(newRunId);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const hasMessages = messages.length > 0;
  const modeLabel = MODE_LABELS[settings.defaultMode] ?? settings.defaultMode;
  const activeModels = [settings.sideA.model, settings.sideB.model, settings.sideC.model];

  const groupedMessages = groupByRun(messages);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0 gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <RunStatusBadge status={runStatus} />
          <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 whitespace-nowrap">
            {modeLabel}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:block truncate" title={activeModels.join(" · ")}>
            {activeModels.join(" · ")}
          </span>
        </div>
        {hasMessages && (
          <button
            onClick={rerun}
            disabled={runStatus === "running"}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium border border-border rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-40 shrink-0"
            title="Re-run with latest question"
          >
            <RotateCcwIcon size={12} />
            Re-run
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div ref={topRef} />

        {!hasMessages && <EmptyState />}

        {groupedMessages.map((group, groupIdx) => (
          <div key={group.runId}>
            {groupIdx > 0 && (
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  Run {groupIdx + 1}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}
            <div className="space-y-4">
              {group.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>
          </div>
        ))}

        {runStatus === "running" && (
          <div className="flex gap-2 items-center text-muted-foreground text-xs mt-4">
            <div className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
            Agents are thinking…
          </div>
        )}

        {runStatus === "error" && <ErrorState onRetry={rerun} />}

        <div ref={bottomRef} />
      </div>

      {hasMessages && (
        <div className="shrink-0 mx-4 mb-2">
          <button
            onClick={() => setShowConclusion((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg bg-card hover:bg-accent/40 transition-colors"
          >
            <span className="text-sm">Conclusion</span>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-xs">{runCount} run{runCount !== 1 ? "s" : ""}</span>
              {showConclusion ? <ChevronDownIcon size={14} /> : <ChevronUpIcon size={14} />}
            </div>
          </button>
          {showConclusion && (
            <div className="border border-t-0 border-border rounded-b-lg bg-card px-4 pb-4">
              <p className="text-sm text-foreground mt-3">{DUMMY_CONCLUSION.summary}</p>
              <ul className="mt-2 space-y-1">
                {DUMMY_CONCLUSION.keyPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="mt-1 w-1 h-1 rounded-full bg-primary shrink-0" />
                    {pt}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Generated at {formatTime(DUMMY_CONCLUSION.generatedAt)} · <span className="italic">Dummy data</span>
              </p>
            </div>
          )}
        </div>
      )}

      <div className="shrink-0 px-4 pb-4">
        <div className={`flex gap-2 bg-card border rounded-lg p-2 transition-colors ${runStatus === "running" ? "border-border opacity-60" : "border-border"}`}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={runStatus === "running" ? "Agents are responding…" : "Ask the team something… (Enter to send, Shift+Enter for newline)"}
            rows={2}
            disabled={runStatus === "running"}
            className="flex-1 resize-none text-sm bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || runStatus === "running"}
            className="self-end p-2 text-primary hover:text-primary/80 disabled:opacity-40 transition-colors"
            title="Send and run"
          >
            <SendIcon size={16} />
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground text-right">
          Sending starts a new run automatically.
        </p>
      </div>
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
      <MessageSquarePlusIcon size={32} className="text-muted-foreground mb-3 opacity-50" />
      <p className="text-sm font-medium text-foreground mb-1">Start the discussion</p>
      <p className="text-xs text-muted-foreground max-w-xs">
        Type a question or topic below. ChatGPT, Claude, and Gemini will each respond when you send.
      </p>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-start gap-3 mt-4 px-4 py-3 bg-destructive/5 border border-destructive/20 rounded-lg">
      <AlertCircleIcon size={16} className="text-destructive mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-destructive">Run failed</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          One or more agents did not respond. Check your API keys in Settings, then try again.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="text-xs text-destructive underline underline-offset-2 shrink-0"
      >
        Retry
      </button>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  const agent = AGENTS.find((a) => a.id === message.agentId);

  return (
    <div className="flex gap-2 max-w-[85%]">
      {message.agentId && <AgentAvatar agentId={message.agentId} />}
      <div>
        {agent && (
          <p className="text-xs font-medium mb-1" style={{ color: agent.color }}>
            {agent.name}
          </p>
        )}
        <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-foreground">
          {message.content}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{formatTime(message.createdAt)}</p>
      </div>
    </div>
  );
}

function RunStatusBadge({ status }: { status: RunStatus }) {
  const map: Record<RunStatus, { label: string; color: string }> = {
    idle:      { label: "Idle",      color: "bg-muted text-muted-foreground" },
    running:   { label: "Running…",  color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400" },
    completed: { label: "Completed", color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400" },
    error:     { label: "Error",     color: "bg-destructive/10 text-destructive" },
  };
  const { label, color } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {status === "running" && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {label}
    </span>
  );
}

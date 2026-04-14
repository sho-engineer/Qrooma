import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { DUMMY_MESSAGES, DUMMY_CONCLUSION, AGENTS } from "../data/dummy";
import type { Message, RunStatus } from "../types";
import AgentAvatar from "../components/AgentAvatar";
import { SendIcon, PlayIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function RoomDetailPage() {
  const params = useParams<{ id: string }>();
  const roomId = params.id;

  const initialMessages = DUMMY_MESSAGES.filter((m) => m.roomId === roomId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [runStatus, setRunStatus] = useState<RunStatus>("idle");
  const [showConclusion, setShowConclusion] = useState(initialMessages.length > 0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!input.trim() || runStatus === "running") return;
    const userMsg: Message = {
      id: `m-${Date.now()}`,
      roomId,
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setRunStatus("running");

    let delay = 1200;
    AGENTS.forEach((agent) => {
      setTimeout(() => {
        const replies = [
          `As ${agent.name}, I think this is an important question. My analysis suggests a structured approach would work best here — start with data, then move to decisions.`,
          `From ${agent.name}'s perspective: there are trade-offs to consider. I'd weigh the short-term cost against long-term flexibility before committing.`,
          `${agent.name} here. The key insight is alignment. Without team buy-in, even the best strategy will stall. I'd recommend a workshop before execution.`,
        ];
        const content = replies[Math.floor(Math.random() * replies.length)];
        setMessages((prev) => [
          ...prev,
          { id: `m-${Date.now()}-${agent.id}`, roomId, role: "assistant", agentId: agent.id, content, createdAt: new Date().toISOString() },
        ]);
      }, delay);
      delay += 800;
    });

    setTimeout(() => setRunStatus("completed"), delay + 200);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <RunStatusBadge status={runStatus} />
        </div>
        <button
          onClick={() => { setRunStatus("running"); setTimeout(() => setRunStatus("completed"), 2000); }}
          disabled={runStatus === "running" || messages.length === 0}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <PlayIcon size={12} />
          Run
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!hasMessages && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Start the conversation below.
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {runStatus === "running" && (
          <div className="flex gap-2 items-center text-muted-foreground text-xs">
            <div className="flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
            Agents are thinking…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {showConclusion && messages.length > 0 && (
        <div className="shrink-0 mx-4 mb-2 border border-border rounded-lg bg-card overflow-hidden">
          <button
            onClick={() => setShowConclusion((p) => !p)}
            className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-foreground hover:bg-accent/40 transition-colors"
          >
            <span>Conclusion</span>
            {showConclusion ? <ChevronDownIcon size={14} /> : <ChevronUpIcon size={14} />}
          </button>
          <div className="px-4 pb-4 border-t border-border">
            <p className="text-sm text-foreground mt-3">{DUMMY_CONCLUSION.summary}</p>
            <ul className="mt-2 space-y-1">
              {DUMMY_CONCLUSION.keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-0.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                  {pt}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              Generated at {formatTime(DUMMY_CONCLUSION.generatedAt)}
            </p>
          </div>
        </div>
      )}

      {!showConclusion && messages.length > 0 && (
        <div className="shrink-0 mx-4 mb-2">
          <button
            onClick={() => setShowConclusion(true)}
            className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-muted-foreground border border-border rounded hover:bg-accent/40 transition-colors"
          >
            <ChevronUpIcon size={12} />
            Show conclusion
          </button>
        </div>
      )}

      <div className="shrink-0 px-4 pb-4">
        <div className="flex gap-2 bg-card border border-border rounded-lg p-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the team something… (Enter to send)"
            rows={2}
            className="flex-1 resize-none text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || runStatus === "running"}
            className="self-end p-2 text-primary hover:text-primary/80 disabled:opacity-40 transition-colors"
          >
            <SendIcon size={16} />
          </button>
        </div>
      </div>
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
          <p className="text-xs font-medium mb-1" style={{ color: agent.color }}>{agent.name}</p>
        )}
        <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-foreground">
          {message.content}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
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

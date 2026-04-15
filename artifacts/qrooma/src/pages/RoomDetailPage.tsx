import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { DUMMY_MESSAGES, DUMMY_CONCLUSIONS, AGENTS } from "../data/dummy";
import { useSettings } from "../context/SettingsContext";
import { useRooms } from "../context/RoomsContext";
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

// Pools are slightly different per mode to hint at different agent behaviour
const DEBATE_POOL = [
  (name: string) => `${name} disagrees with the framing here. The underlying assumption is that speed matters more than certainty — but in this context, a wrong fast decision costs more than a slow right one. I'd push back and redefine the success criterion first.`,
  (name: string) => `From ${name}'s perspective: the risk is asymmetric. The downside of moving too fast is higher than the downside of moving too slowly. I'd argue for a staged approach with explicit review gates at each step.`,
  (name: string) => `${name} here. The strongest counter-argument is opportunity cost. Every week spent debating is a week the competition is executing. Set a 72-hour decision window and commit to whichever option has the best evidence by then.`,
  (name: string) => `${name} taking a different angle: the data is ambiguous enough that either option can be justified post-hoc. That's a signal the framing is wrong — restate the question as a testable hypothesis before committing resources.`,
];

const FREETALK_POOL = [
  (name: string) => `${name} building on that — one thing worth adding is the second-order effect. The immediate impact is clear, but three months out, the compounding benefit shows up in user trust and team morale, which are harder to measure but easier to lose.`,
  (name: string) => `${name} here. I'd add a practical constraint to consider: the team's current bandwidth. Even a well-reasoned direction stalls if there's no capacity to execute. Worth stress-testing the plan against current sprint commitments.`,
  (name: string) => `${name} agreeing with the direction and adding nuance: the key variable is timing. Doing the right thing at the wrong moment — too early or too late in the cycle — produces the same outcome as doing the wrong thing. Sequence matters as much as strategy.`,
  (name: string) => `${name} wants to zoom out for a moment. The tactics being discussed are sound, but the strategic question underneath is: what does success look like in 12 months, and which path makes it most reachable? Anchoring to that north star simplifies the near-term trade-offs.`,
];

export default function RoomDetailPage() {
  const { id: roomId } = useParams<{ id: string }>();
  const { settings } = useSettings();
  const { getRoomById } = useRooms();

  const room = getRoomById(roomId);
  const roomName = room?.name ?? "Room";

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

  // Reset state when room changes
  useEffect(() => {
    const msgs = DUMMY_MESSAGES.filter((m) => m.roomId === roomId);
    setMessages(msgs);
    setRunStatus(msgs.length > 0 ? "completed" : "idle");
    setRunCount(new Set(msgs.map((m) => m.runId).filter(Boolean)).size);
    isFirstMount.current = true;
  }, [roomId]);

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
    const pool = settings.defaultMode === "free-talk" ? FREETALK_POOL : DEBATE_POOL;
    let delay = 900;
    AGENTS.forEach((agent) => {
      setTimeout(() => {
        const fn = pool[Math.floor(Math.random() * pool.length)];
        setMessages((prev) => [
          ...prev,
          {
            id: `m-${Date.now()}-${agent.id}`,
            roomId,
            role: "assistant",
            agentId: agent.id,
            content: fn(agent.name),
            createdAt: new Date().toISOString(),
            runId: currentRunId,
          },
        ]);
      }, delay);
      delay += 1100;
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
        roomName={roomName}
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
            {groupIdx > 0 && (
              <RunSeparator index={groupIdx + 1} firstMsgTime={group.messages[0]?.createdAt} />
            )}
            <div className="space-y-4">
              {group.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>
          </div>
        ))}

        {runStatus === "running" && <ThinkingIndicator />}
        {runStatus === "error" && <ErrorState onRerun={rerun} />}

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

function RunSeparator({ index, firstMsgTime }: { index: number; firstMsgTime?: string }) {
  const timeLabel = firstMsgTime
    ? new Date(firstMsgTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="flex items-center gap-3 my-8">
      <div className="flex-1 h-px bg-border/60" />
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
          Run {index}
        </span>
        {timeLabel && (
          <span className="text-[11px] text-muted-foreground/50">{timeLabel}</span>
        )}
      </div>
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3 mt-5 px-1">
      <div className="flex items-center gap-1.5">
        {[
          { initial: "G", color: "#10a37f" },
          { initial: "C", color: "#d97706" },
          { initial: "Gm", color: "#4285f4" },
        ].map((a, i) => (
          <div key={a.initial} className="flex items-center gap-1">
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[9px] font-bold"
              style={{ backgroundColor: a.color }}
            >
              {a.initial}
            </span>
            <span
              className="w-1 h-1 rounded-full bg-muted-foreground/50 animate-bounce"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          </div>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">Agents are thinking…</span>
    </div>
  );
}

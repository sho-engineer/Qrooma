import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { RotateCcwIcon } from "lucide-react";
import {
  DUMMY_MESSAGES,
  DUMMY_CONCLUSIONS,
  AGENTS,
  DEBATE_POOL,
  FREETALK_POOL,
} from "../data/dummy";
import { useSettings } from "../context/SettingsContext";
import { useRooms } from "../context/RoomsContext";
import { useLocale } from "../context/LocaleContext";
import type { Message, RunStatus } from "../types";
import RoomHeader from "../components/RoomHeader";
import MessageBubble from "../components/MessageBubble";
import ConclusionCard from "../components/ConclusionCard";
import MessageInput from "../components/MessageInput";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";


// ─── group messages by run ────────────────────────────────────────────────────
interface RunGroup {
  runId: string;
  messages: Message[];
  /** true when this group has no user message (= triggered by Re-run) */
  isRerun: boolean;
  /** the user question that started this run (null for Re-runs without a new question) */
  userQuestion: string | null;
}

function groupByRun(messages: Message[]): RunGroup[] {
  const groups: RunGroup[] = [];
  const seen = new Map<string, number>();
  for (const msg of messages) {
    const runId = msg.runId ?? "default";
    if (!seen.has(runId)) {
      seen.set(runId, groups.length);
      groups.push({ runId, messages: [], isRerun: msg.role === "assistant", userQuestion: null });
    }
    const g = groups[seen.get(runId)!];
    g.messages.push(msg);
    if (msg.role === "user" && !g.userQuestion) g.userQuestion = msg.content;
  }
  return groups;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function RoomDetailPage() {
  const { id: roomId } = useParams<{ id: string }>();
  const { settings } = useSettings();
  const { getRoomById } = useRooms();
  const { t } = useLocale();

  const room = getRoomById(roomId);
  const roomName = room?.name ?? "Room";

  const initialMessages = DUMMY_MESSAGES.filter((m) => m.roomId === roomId);

  function deriveInitialStatus(): RunStatus {
    if (room?.lastRunStatus) return room.lastRunStatus;
    return initialMessages.length > 0 ? "completed" : "idle";
  }

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [runStatus, setRunStatus] = useState<RunStatus>(deriveInitialStatus);
  const [runCount, setRunCount] = useState(
    new Set(initialMessages.map((m) => m.runId).filter(Boolean)).size
  );
  /** How many agents have responded in the current in-progress run (0–3) */
  const [respondedCount, setRespondedCount] = useState(0);

  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);
  /** Set to true when the user explicitly sends or re-runs — force-scroll regardless of position */
  const shouldScrollToBottom = useRef(false);

  function isNearBottom(): boolean {
    const el = scrollContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  }

  // Reset when room changes
  useEffect(() => {
    const msgs = DUMMY_MESSAGES.filter((m) => m.roomId === roomId);
    setMessages(msgs);
    const newRoom = getRoomById(roomId);
    if (newRoom?.lastRunStatus) {
      setRunStatus(newRoom.lastRunStatus);
    } else {
      setRunStatus(msgs.length > 0 ? "completed" : "idle");
    }
    setRunCount(new Set(msgs.map((m) => m.runId).filter(Boolean)).size);
    setRespondedCount(0);
    isFirstMount.current = true;
    shouldScrollToBottom.current = false;
  }, [roomId]);

  // Scroll: top on room change; bottom on new messages only if near bottom or user sent
  useEffect(() => {
    if (isFirstMount.current) {
      topRef.current?.scrollIntoView();
      isFirstMount.current = false;
    } else if (shouldScrollToBottom.current || isNearBottom()) {
      shouldScrollToBottom.current = false;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  function triggerAgentReplies(currentRunId: string) {
    setRunStatus("running");
    setRespondedCount(0);
    const pool = settings.defaultMode === "free-talk" ? FREETALK_POOL : DEBATE_POOL;
    let delay = 900;
    AGENTS.forEach((agent, i) => {
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
        setRespondedCount(i + 1);
      }, delay);
      delay += 1200;
    });
    setTimeout(() => {
      setRunStatus("completed");
      setRespondedCount(0);
    }, delay + 300);
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
    shouldScrollToBottom.current = true;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setRunCount((n) => n + 1);
    triggerAgentReplies(newRunId);
  }

  function rerun() {
    if (runStatus === "running" || messages.length === 0) return;
    const newRunId = `run-${Date.now()}`;
    shouldScrollToBottom.current = true;
    setRunCount((n) => n + 1);
    triggerAgentReplies(newRunId);
  }

  const hasMessages = messages.length > 0;
  const MODE_LABELS: Record<string, string> = {
    "structured-debate": t.structuredDebate,
    "free-talk": t.freeTalk,
  };
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

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 flex flex-col">
        <div ref={topRef} />

        {!hasMessages && <EmptyState />}

        {groupedMessages.map((group, groupIdx) => (
          <div key={group.runId}>
            {groupIdx > 0 && (
              <RunSeparator
                index={groupIdx + 1}
                firstMsgTime={group.messages[0]?.createdAt}
                isRerun={group.isRerun}
                userQuestion={group.userQuestion}
              />
            )}
            <div className="space-y-4">
              {group.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>
          </div>
        ))}

        {runStatus === "running" && <ThinkingIndicator respondedCount={respondedCount} />}
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

// ─── Run Separator ────────────────────────────────────────────────────────────

interface RunSeparatorProps {
  index: number;
  firstMsgTime?: string;
  isRerun: boolean;
  userQuestion: string | null;
}

function RunSeparator({ index, firstMsgTime, isRerun, userQuestion }: RunSeparatorProps) {
  const { t } = useLocale();
  const timeLabel = firstMsgTime
    ? new Date(firstMsgTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="my-8">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border/60" />
        <div className="flex items-center gap-1.5 shrink-0">
          {isRerun && (
            <RotateCcwIcon size={10} className="text-muted-foreground/50" />
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
            {isRerun ? t.rerun : t.runLabel(index)}
          </span>
          {timeLabel && (
            <span className="text-[11px] text-muted-foreground/50">{timeLabel}</span>
          )}
        </div>
        <div className="flex-1 h-px bg-border/60" />
      </div>

      {!isRerun && userQuestion && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground/50 italic px-8 truncate" title={userQuestion}>
          "{userQuestion}"
        </p>
      )}
      {isRerun && (
        <p className="mt-2 text-center text-[11px] text-muted-foreground/50 italic">
          {t.rerunDesc}
        </p>
      )}
    </div>
  );
}

// ─── Thinking Indicator ───────────────────────────────────────────────────────

function ThinkingIndicator({ respondedCount }: { respondedCount: number }) {
  const { t } = useLocale();
  const done = AGENTS.slice(0, respondedCount);
  const pending = AGENTS.slice(respondedCount);
  const nextAgent = pending[0];
  const remaining = pending.length;

  return (
    <div className="flex items-center gap-3 mt-5 px-1">
      <div className="flex items-center gap-2">
        {done.map((a) => (
          <span
            key={a.id}
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[9px] font-bold opacity-30"
            style={{ backgroundColor: a.color }}
          >
            {a.initial}
          </span>
        ))}

        {nextAgent && (
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[9px] font-bold"
              style={{ backgroundColor: nextAgent.color }}
            >
              {nextAgent.initial}
            </span>
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <span className="text-xs text-muted-foreground">
        {remaining === 3 && t.agentsResponding}
        {remaining === 2 && t.agentAndMoreResponding(pending[0]?.name ?? "")}
        {remaining === 1 && t.agentResponding(nextAgent?.name ?? "")}
        {remaining === 0 && t.finishingUp}
      </span>
    </div>
  );
}

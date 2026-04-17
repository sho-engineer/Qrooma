/**
 * Room Detail Page
 *
 * ARCHITECTURE NOTE
 * ─────────────────
 * All data access goes through service layer:
 *   - messagesService  →  read/write messages + conclusions
 *   - runsService      →  trigger agent runs (Trigger.dev in production)
 *   - roomsService     →  update room metadata after a run completes
 *
 * When connecting to Supabase + Trigger.dev:
 * 1. Replace `runsService.simulateRun()` with `tasks.trigger("discussion", payload)`
 * 2. Replace `messagesService.getByRoom()` with Supabase query + realtime subscription
 * 3. Remove all setTimeout-based simulation
 */

import { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "wouter";
import { RotateCcwIcon } from "lucide-react";
import { AGENTS } from "../data/dummy";
import { messagesService } from "../services/messagesService";
import { runsService, type RunPayload } from "../services/runsService";
import { useSettings } from "../context/SettingsContext";
import { useRooms } from "../context/RoomsContext";
import { useLocale } from "../context/LocaleContext";
import type { Message, RunStatus, Provider } from "../types";
import RoomHeader from "../components/RoomHeader";
import MessageBubble from "../components/MessageBubble";
import ConclusionCard from "../components/ConclusionCard";
import MessageInput from "../components/MessageInput";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MODEL_SHORT: Record<string, string> = {
  "gpt-4o":                      "GPT-4o",
  "gpt-4o-mini":                 "GPT-4o mini",
  "gpt-4-turbo":                 "GPT-4 Turbo",
  "gpt-3.5-turbo":               "GPT-3.5 Turbo",
  "claude-3-5-sonnet-20241022":  "Claude 3.5 Sonnet",
  "claude-3-opus-20240229":      "Claude 3 Opus",
  "claude-3-haiku-20240307":     "Claude 3 Haiku",
  "gemini-1.5-pro":              "Gemini 1.5 Pro",
  "gemini-1.5-flash":            "Gemini 1.5 Flash",
  "gemini-1.0-pro":              "Gemini 1.0 Pro",
};

function shortenModel(model: string): string {
  return MODEL_SHORT[model] ?? model;
}

function hasApiKeyFor(provider: Provider, settings: {
  openaiApiKey: string; anthropicApiKey: string; googleApiKey: string;
}): boolean {
  if (provider === "openai")    return !!settings.openaiApiKey;
  if (provider === "anthropic") return !!settings.anthropicApiKey;
  return !!settings.googleApiKey;
}

// ─── Run grouping ─────────────────────────────────────────────────────────────

interface RunGroup {
  runId:        string;
  messages:     Message[];
  isRerun:      boolean;
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
  const { getRoomById, updateRoom } = useRooms();
  const { t } = useLocale();

  const room = getRoomById(roomId);
  const roomName = room?.name ?? "Room";

  // ─── Load messages from service ────────────────────────────────────────────
  // SUPABASE: replace with supabase.from("messages").select("*").eq("room_id", roomId)
  //           + realtime subscription to append new messages

  function loadMessages() {
    return messagesService.getByRoom(roomId);
  }

  function deriveInitialStatus(): RunStatus {
    if (room?.lastRunStatus) return room.lastRunStatus;
    return loadMessages().length > 0 ? "completed" : "idle";
  }

  const [messages,       setMessages]       = useState<Message[]>(loadMessages);
  const [input,          setInput]          = useState("");
  const [runStatus,      setRunStatus]      = useState<RunStatus>(deriveInitialStatus);
  const [runCount,       setRunCount]       = useState(() => messagesService.countRuns(roomId));
  const [respondedCount, setRespondedCount] = useState(0);

  // Cancel ref: holds a cleanup function for in-progress simulated runs
  const cancelRun = useRef<(() => void) | null>(null);

  const topRef            = useRef<HTMLDivElement>(null);
  const bottomRef         = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFirstMount      = useRef(true);
  const shouldScrollToBottom = useRef(false);

  // ─── Derived values ─────────────────────────────────────────────────────────

  const agentCount  = settings.agentCount ?? 3;
  const activeSides = agentCount === 2
    ? [settings.sideA, settings.sideB]
    : [settings.sideA, settings.sideB, settings.sideC];

  const canRun = useMemo(() => {
    return activeSides.every((side) => hasApiKeyFor(side.provider, settings));
  }, [settings.openaiApiKey, settings.anthropicApiKey, settings.googleApiKey, agentCount]);

  const sideModelMap = useMemo(() => ({
    A: shortenModel(settings.sideA.model),
    B: shortenModel(settings.sideB.model),
    C: shortenModel(settings.sideC.model),
  }), [settings.sideA.model, settings.sideB.model, settings.sideC.model]);

  const activeModels  = activeSides.map((s) => s.model);

  const MODE_LABELS: Record<string, string> = {
    "structured-debate": t.structuredDebate,
    "free-talk":         t.freeTalk,
  };
  const modeLabel = MODE_LABELS[settings.defaultMode] ?? settings.defaultMode;

  const groupedMessages = groupByRun(messages);
  // SUPABASE: replace with supabase.from("conclusions").select("*").eq("room_id", roomId)
  const conclusion  = messagesService.getConclusion(roomId);
  const hasMessages = messages.length > 0;

  // ─── Reset when roomId changes ──────────────────────────────────────────────

  useEffect(() => {
    // Cancel any in-progress simulated run
    cancelRun.current?.();
    cancelRun.current = null;

    const msgs = messagesService.getByRoom(roomId);
    setMessages(msgs);
    setRunCount(messagesService.countRuns(roomId));
    setRunStatus(room?.lastRunStatus ?? (msgs.length > 0 ? "completed" : "idle"));
    setRespondedCount(0);
    isFirstMount.current = true;
    shouldScrollToBottom.current = false;
  }, [roomId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { cancelRun.current?.(); };
  }, []);

  // ─── Scroll ─────────────────────────────────────────────────────────────────

  function isNearBottom(): boolean {
    const el = scrollContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  }

  useEffect(() => {
    if (isFirstMount.current) {
      topRef.current?.scrollIntoView();
      isFirstMount.current = false;
    } else if (shouldScrollToBottom.current || isNearBottom()) {
      shouldScrollToBottom.current = false;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ─── Actions ─────────────────────────────────────────────────────────────────

  /**
   * Trigger agent responses for a given run.
   * TRIGGER.DEV CONNECTION POINT:
   *   Replace `runsService.simulateRun()` with:
   *   const handle = await tasks.trigger("discussion", payload)
   *   // Then subscribe to Supabase realtime on messages table for this runId
   */
  function triggerRun(runId: string) {
    setRunStatus("running");
    setRespondedCount(0);

    const payload: RunPayload = {
      roomId,
      userId:     "demo",
      mode:       settings.defaultMode,
      agentCount: settings.agentCount ?? 3,
    };

    let responseCount = 0;

    const cancel = runsService.simulateRun(
      runId,
      payload,
      (msg) => {
        // SUPABASE: this callback is replaced by realtime subscription events
        messagesService.append(msg);
        setMessages((prev) => [...prev, msg]);
        responseCount++;
        setRespondedCount(responseCount);
      },
      (status) => {
        setRunStatus(status);
        setRespondedCount(0);
        // Update room metadata (lastRunStatus, lastMessage) via service
        // SUPABASE: this is handled server-side after the Trigger.dev task completes
        const lastMsg = messagesService.getByRoom(roomId).at(-1);
        if (lastMsg?.role === "assistant") {
          updateRoom(roomId, {
            lastRunStatus: status,
            lastMessage:   lastMsg.content.slice(0, 80),
            lastMessageAt: lastMsg.createdAt,
          });
        }
      },
    );

    cancelRun.current = cancel;
  }

  function sendMessage() {
    if (!input.trim() || runStatus === "running") return;

    const newRunId = `run-${Date.now()}`;
    const userMsg: Message = {
      id:        `m-${Date.now()}`,
      roomId,
      role:      "user",
      content:   input.trim(),
      createdAt: new Date().toISOString(),
      runId:     newRunId,
    };

    // Persist user message via service
    // SUPABASE: supabase.from("messages").insert(userMsg)
    messagesService.append(userMsg);

    shouldScrollToBottom.current = true;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setRunCount((n) => n + 1);
    triggerRun(newRunId);
  }

  function rerun() {
    if (runStatus === "running" || messages.length === 0) return;
    const newRunId = `run-${Date.now()}`;
    shouldScrollToBottom.current = true;
    setRunCount((n) => n + 1);
    triggerRun(newRunId);
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <RoomHeader
        roomName={roomName}
        runStatus={runStatus}
        modeLabel={modeLabel}
        activeModels={activeModels}
        hasMessages={hasMessages}
        canRun={canRun}
        onRerun={rerun}
      />

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 sm:px-4 sm:py-4 flex flex-col"
      >
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
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  mode={settings.defaultMode}
                  sideModelMap={sideModelMap}
                />
              ))}
            </div>
          </div>
        ))}

        {runStatus === "running" && (
          <ThinkingIndicator respondedCount={respondedCount} agentCount={agentCount} />
        )}
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
        apiKeysReady={canRun}
      />
    </div>
  );
}

// ─── Run Separator ────────────────────────────────────────────────────────────

interface RunSeparatorProps {
  index:        number;
  firstMsgTime?: string;
  isRerun:      boolean;
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
          {isRerun && <RotateCcwIcon size={10} className="text-muted-foreground/50" />}
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

function ThinkingIndicator({ respondedCount, agentCount }: { respondedCount: number; agentCount: number }) {
  const { t } = useLocale();
  const activeAgents = AGENTS.slice(0, agentCount);
  const done    = activeAgents.slice(0, respondedCount);
  const pending = activeAgents.slice(respondedCount);
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
        {remaining === agentCount && t.agentsResponding}
        {remaining > 0 && remaining < agentCount && t.agentAndMoreResponding(nextAgent?.name ?? "")}
        {remaining === 1 && t.agentResponding(nextAgent?.name ?? "")}
        {remaining === 0 && t.finishingUp}
      </span>
    </div>
  );
}

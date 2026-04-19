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
import { runsService, type RunPayload, type RealRunParams } from "../services/runsService";
import { useSettings } from "../context/SettingsContext";
import { useRooms } from "../context/RoomsContext";
import { useLocale } from "../context/LocaleContext";
import { usePlan } from "../context/PlanContext";
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
  const { t, locale } = useLocale();
  const { plan } = usePlan();

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
  const [agentErrors,    setAgentErrors]    = useState<string[]>([]);
  const [fatalError,     setFatalError]     = useState<string | null>(null);

  // Cancel ref: holds a cleanup function for in-progress simulated runs
  const cancelRun = useRef<(() => void) | null>(null);

  const topRef            = useRef<HTMLDivElement>(null);
  const bottomRef         = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFirstMount      = useRef(true);
  const shouldScrollToBottom = useRef(false);

  // ─── Derived values ─────────────────────────────────────────────────────────

  // Free plan always uses 2 agents; Connect/Pro use settings
  const agentCount  = plan === "free" ? 2 : (settings.agentCount ?? 3);
  const activeSides = agentCount === 2
    ? [settings.sideA, settings.sideB]
    : [settings.sideA, settings.sideB, settings.sideC];

  // Real API calls only on Connect plan when keys are present
  // Free and Pro always use simulation
  const hasSomeKey = useMemo(() => {
    if (plan !== "connect") return false;
    return activeSides.some((side) => hasApiKeyFor(side.provider, settings));
  }, [plan, settings.openaiApiKey, settings.anthropicApiKey, settings.googleApiKey, agentCount]);

  // canRun: Free/Pro always true (simulation); Connect requires a key
  const canRun = plan !== "connect" ? true : hasSomeKey;

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
  const [conclusion, setConclusion] = useState(() => messagesService.getConclusion(roomId));
  const hasMessages = messages.length > 0;

  // ─── Reset when roomId changes ──────────────────────────────────────────────

  useEffect(() => {
    // Cancel any in-progress run
    cancelRun.current?.();
    cancelRun.current = null;

    const msgs = messagesService.getByRoom(roomId);
    setMessages(msgs);
    setRunCount(messagesService.countRuns(roomId));
    setRunStatus(room?.lastRunStatus ?? (msgs.length > 0 ? "completed" : "idle"));
    setRespondedCount(0);
    setAgentErrors([]);
    setFatalError(null);
    setConclusion(messagesService.getConclusion(roomId));
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
   * BYOK mode  → calls real AI APIs via /api/discuss (SSE stream)
   * Free mode  → local simulation with dummy responses
   */
  function triggerRun(runId: string, userMessage: string) {
    setRunStatus("running");
    setRespondedCount(0);
    setAgentErrors([]);
    setFatalError(null);

    let responseCount = 0;

    function onMessage(msg: Message) {
      messagesService.append(msg);
      setMessages((prev) => [...prev, msg]);
      responseCount++;
      setRespondedCount(responseCount);
    }

    function onAgentError(side: string, message: string) {
      setAgentErrors((prev) => [...prev, `${side}: ${message}`]);
    }

    function onStatus(status: RunStatus) {
      setRunStatus(status);
      setRespondedCount(0);
      const lastMsg = messagesService.getByRoom(roomId).at(-1);
      if (lastMsg?.role === "assistant") {
        updateRoom(roomId, {
          lastRunStatus: status,
          lastMessage:   lastMsg.content.slice(0, 80),
          lastMessageAt: lastMsg.createdAt,
        });
      }
    }

    if (hasSomeKey) {
      // ── Connect plan: real AI call (only agents with valid keys) ───────────
      const sides = (agentCount === 2 ? ["A", "B"] : ["A", "B", "C"]) as ("A" | "B" | "C")[];
      const sideConfigs = [settings.sideA, settings.sideB, settings.sideC];

      const allAgentConfig = sides.map((side, i) => ({
        side,
        provider: sideConfigs[i]!.provider,
        model:    sideConfigs[i]!.model,
      }));

      // Filter to agents that actually have an API key
      const apiKeyMap: Record<string, string | undefined> = {
        openai:    settings.openaiApiKey    || undefined,
        anthropic: settings.anthropicApiKey || undefined,
        google:    settings.googleApiKey    || undefined,
      };
      const agentConfig = allAgentConfig.filter((a) => !!apiKeyMap[a.provider]);

      const params: RealRunParams = {
        roomId,
        runId,
        userMessage,
        mode:       settings.defaultMode,
        agentConfig,
        apiKeys: {
          openai:    settings.openaiApiKey    || undefined,
          anthropic: settings.anthropicApiKey || undefined,
          google:    settings.googleApiKey    || undefined,
        },
        previousMessages: messages.slice(-12).map((m) => ({
          role:    m.role,
          agentId: m.agentId,
          content: m.content,
        })),
      };

      const cancel = runsService.realRun(
        params,
        onMessage,
        (conc) => {
          messagesService.saveConclusion(roomId, conc);
          setConclusion(conc);
        },
        onStatus,
        onAgentError,
      );
      cancelRun.current = cancel;
    } else {
      // ── Free / Pro: local simulation ───────────────────────────────────────
      const payload: RunPayload = {
        roomId,
        userId:     "demo",
        mode:       settings.defaultMode,
        agentCount, // plan-aware: Free=2, Pro/Connect=settings value
      };
      const cancel = runsService.simulateRun(runId, payload, onMessage, onStatus);
      cancelRun.current = cancel;
    }
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
    triggerRun(newRunId, input.trim());
  }

  function rerun() {
    if (runStatus === "running" || messages.length === 0) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const newRunId = `run-${Date.now()}`;
    shouldScrollToBottom.current = true;
    setRunCount((n) => n + 1);
    triggerRun(newRunId, lastUserMsg?.content ?? "");
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <RoomHeader
        roomName={roomName}
        runStatus={runStatus}
        modeLabel={modeLabel}
        activeModels={plan === "free" ? activeModels.slice(0, 2) : activeModels}
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

        {/* No-key warning for Connect plan with no API keys set */}
        {runStatus === "idle" && plan === "connect" && !hasSomeKey && hasMessages === false && (
          <div className="mt-4 px-4 py-3.5 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-0.5">
              {locale === "ja" ? "APIキーが設定されていません" : "No API keys configured"}
            </p>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
              {locale === "ja"
                ? "Connect プランではAPIキーが必要です。設定 → APIキーで追加してください。"
                : "Connect plan requires API keys. Add them in Settings → API keys."}
            </p>
          </div>
        )}

        {/* Per-agent error notices (non-fatal) */}
        {agentErrors.length > 0 && runStatus !== "running" && (
          <div className="mt-3 space-y-1.5">
            {agentErrors.map((err, i) => (
              <div key={i} className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl border border-destructive/20 bg-destructive/5">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive/60 shrink-0 mt-1" />
                <p className="text-[11px] text-destructive/80 leading-relaxed">{err}</p>
              </div>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {hasMessages && (
        <ConclusionCard runCount={runCount} conclusion={conclusion} />
      )}

      {/* Free plan banner */}
      {plan === "free" && (
        <div className="shrink-0 px-4 py-2 border-t border-border/60 bg-muted/30 flex items-center justify-between gap-3 min-w-0">
          <p className="text-[11px] text-muted-foreground/70 leading-relaxed truncate min-w-0">
            {t.freeModeBanner}
          </p>
          <a href="/signup" className="shrink-0 text-[11px] font-medium text-foreground/60 hover:text-foreground transition-colors whitespace-nowrap">
            {t.freeUpgradeHint} →
          </a>
        </div>
      )}

      <MessageInput
        value={input}
        onChange={setInput}
        onSend={sendMessage}
        isRunning={runStatus === "running"}
        apiKeysReady={plan === "free" || plan === "pro" ? true : hasSomeKey}
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

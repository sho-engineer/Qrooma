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

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams } from "wouter";
import { RotateCcwIcon } from "lucide-react";
import { AGENTS } from "../data/dummy";
import { messagesService } from "../services/messagesService";
import { runsService, type RunPayload, type RealRunParams } from "../services/runsService";
import { useSettings } from "../context/SettingsContext";
import { useRooms } from "../context/RoomsContext";
import { useLocale } from "../context/LocaleContext";
import { usePlan } from "../context/PlanContext";
import { useUserProfile } from "../context/UserProfileContext";
import { usageService } from "../services/usageService";
import type { ConclusionData, ConclusionStatus, Message, PromptConfig, RunStatus } from "../types";
import RoomHeader from "../components/RoomHeader";
import MessageBubble from "../components/MessageBubble";
import ConclusionCard from "../components/ConclusionCard";
import ClarificationCard from "../components/ClarificationCard";
import MessageInput from "../components/MessageInput";
import PromptModeForm from "../components/PromptModeForm";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Side mapping for role labels (agentId → side)
const AGENT_SIDE: Record<string, "A" | "B" | "C"> = {
  builder:  "A",
  breaker:  "B",
  operator: "C",
};

// Free plan: fixed 2-agent config (no API keys required)
const FREE_SIDES: Array<{ provider: "openai"; model: string }> = [
  { provider: "openai", model: "gpt-4o-mini" },
  { provider: "openai", model: "gpt-4o-mini" },
];

function hasApiKeyFor(_provider: string, settings: { openaiApiKey: string }): boolean {
  return !!settings.openaiApiKey;
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
  const { profile } = useUserProfile();

  const room = getRoomById(roomId);
  const roomName = room?.name ?? "Room";

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
  const [currentRound,   setCurrentRound]   = useState<{ round: number; label: string } | null>(null);
  const [agentErrors,    setAgentErrors]    = useState<string[]>([]);
  const [fatalError,     setFatalError]     = useState<string | null>(null);
  const [conclusions,       setConclusions]       = useState<ConclusionData[]>(
    () => messagesService.getConclusions(roomId),
  );
  const [conclusionStatus,  setConclusionStatus]  = useState<ConclusionStatus>("idle");
  const [limitError,        setLimitError]        = useState<string | null>(null);

  // ─── Prompt Mode state ──────────────────────────────────────────────────────
  const [promptMode,   setPromptMode]   = useState(false);
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null);

  // ─── Clarification state ────────────────────────────────────────────────────
  const [clarifyState, setClarifyState] = useState<{
    questions: string[];
    assumptions: string[];
    pendingInput: string;
  } | null>(null);
  const [isCheckingAmbiguity, setIsCheckingAmbiguity] = useState(false);

  const cancelRun = useRef<(() => void) | null>(null);

  const topRef            = useRef<HTMLDivElement>(null);
  const bottomRef         = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef          = useRef<HTMLTextAreaElement>(null);
  const isFirstMount      = useRef(true);
  const shouldScrollToBottom = useRef(false);

  // ─── Derived values ─────────────────────────────────────────────────────────

  const isFree = plan === "free";
  /** True while any round is actively running (initial run or continuation) */
  const isRunActive = runStatus === "running" || runStatus === "continued";
  const agentCount  = isFree ? 2 : (settings.agentCount ?? 3);
  const activeSides = isFree
    ? FREE_SIDES
    : agentCount === 2
      ? [settings.sideA, settings.sideB]
      : [settings.sideA, settings.sideB, settings.sideC];

  const hasSomeKey = useMemo(() => {
    if (plan !== "connect") return false;
    return !!settings.openaiApiKey;
  }, [plan, settings.openaiApiKey]);

  const canRun = plan !== "connect" ? true : hasSomeKey;

  const activeRoleLabels = useMemo(() => {
    if (isFree) {
      return [
        t.roleLabel("A", settings.defaultMode),
        t.roleLabel("B", settings.defaultMode),
      ];
    }
    const sideCodes: Array<"A" | "B" | "C"> = agentCount === 2 ? ["A", "B"] : ["A", "B", "C"];
    return sideCodes.map((s) => t.roleLabel(s, settings.defaultMode));
  }, [isFree, agentCount, t, settings.defaultMode]);

  const MODE_LABELS: Record<string, string> = {
    "structured-debate": t.structuredDebate,
    "free-talk":         t.freeTalk,
  };
  const modeLabel = MODE_LABELS[settings.defaultMode] ?? settings.defaultMode;

  const groupedMessages = groupByRun(messages);
  const hasMessages = messages.length > 0;

  // ─── Reset when roomId changes ──────────────────────────────────────────────

  useEffect(() => {
    cancelRun.current?.();
    cancelRun.current = null;

    const msgs = messagesService.getByRoom(roomId);
    setMessages(msgs);
    setRunCount(messagesService.countRuns(roomId));
    setRunStatus(room?.lastRunStatus ?? (msgs.length > 0 ? "completed" : "idle"));
    setRespondedCount(0);
    setCurrentRound(null);
    setAgentErrors([]);
    setFatalError(null);
    const savedConcs = messagesService.getConclusions(roomId);
    setConclusions(savedConcs);
    // Restore conclusion status from saved data so page-refresh preserves state
    const top = savedConcs[0];
    if (top?.isProvisional && !top?.isFinal) {
      setConclusionStatus("provisional");
    } else if (top?.isFinal || (top && !top?.isProvisional)) {
      // Explicit isFinal OR an existing conclusion without the provisional flag — both are final
      setConclusionStatus("final");
    } else {
      setConclusionStatus("idle");
    }
    isFirstMount.current = true;
    shouldScrollToBottom.current = false;
  }, [roomId]);

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

  function triggerRun(runId: string, userMessage: string, currentRunCount: number, config?: PromptConfig | null) {
    setRunStatus("running");
    setRespondedCount(0);
    setCurrentRound(null);
    setAgentErrors([]);
    setFatalError(null);
    setLimitError(null);
    setConclusionStatus("loading");
    // Count every real run (Free and BYOK)
    if (isFree || hasSomeKey) {
      usageService.increment();
    }

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

    if (hasSomeKey || isFree) {
      const sides = isFree
        ? (["A", "B"] as const)
        : ((agentCount === 2 ? ["A", "B"] : ["A", "B", "C"]) as ("A" | "B" | "C")[]);
      const sideConfigs = isFree
        ? FREE_SIDES
        : [settings.sideA, settings.sideB, settings.sideC];

      const allAgentConfig = sides.map((side, i) => ({
        side,
        provider: sideConfigs[i]!.provider,
        model:    sideConfigs[i]!.model,
      }));

      const agentConfig = isFree
        ? allAgentConfig
        : allAgentConfig.filter(() => !!settings.openaiApiKey);

      const params: RealRunParams = {
        roomId,
        runId,
        userMessage,
        mode:       settings.defaultMode,
        agentConfig,
        apiKeys: isFree ? {} : {
          openai: settings.openaiApiKey || undefined,
        },
        previousMessages: messages
          .filter((m) => m.role !== "summary")
          .slice(-12)
          .map((m) => ({
            role:    m.role,
            agentId: m.agentId,
            content: m.content,
          })),
        writingStyle: settings.writingStyle,
        promptConfig: config ?? undefined,
      };

      const cancel = runsService.realRun(
        params,
        onMessage,
        // onConclusion — called when forceConclusion=true (user clicked "End here")
        (conc) => {
          const enriched: ConclusionData = {
            ...conc,
            runId,
            runNumber: currentRunCount,
            isProvisional: false,
            isFinal:       true,
          };
          messagesService.saveConclusion(roomId, enriched);
          setConclusions(messagesService.getConclusions(roomId));
          setConclusionStatus("final");
        },
        (status) => {
          onStatus(status);
          if (status === "error") {
            setConclusionStatus((prev) => prev === "loading" ? "error" : prev);
          }
        },
        onAgentError,
        (evt) => setCurrentRound(evt),
        (evt) => {
          const summaryMsg: Message = {
            id:        evt.id,
            roomId,
            role:      "summary",
            round:     evt.round,
            content:   evt.summary,
            createdAt: evt.createdAt,
            runId,
          };
          messagesService.append(summaryMsg);
          setMessages((prev) => [...prev, summaryMsg]);
        },
        () => {
          // conclusion_error: rounds completed but AI failed to generate even a provisional.
          setConclusionStatus("unresolved");
        },
        // onCheckpoint — called after normal rounds complete (provisional conclusion)
        (conc) => {
          const enriched: ConclusionData = {
            ...conc,
            runId,
            runNumber:    currentRunCount,
            isProvisional: true,
            isFinal:       false,
          };
          messagesService.saveConclusion(roomId, enriched);
          setConclusions(messagesService.getConclusions(roomId));
          setConclusionStatus("provisional");
        },
      );
      cancelRun.current = cancel;
    } else {
      // No API keys → simulate (no conclusion generated)
      setConclusionStatus("idle");
      const payload: RunPayload = {
        roomId,
        userId:     "demo",
        mode:       settings.defaultMode,
        agentCount,
      };
      const cancel = runsService.simulateRun(runId, payload, onMessage, onStatus);
      cancelRun.current = cancel;
    }
  }

  function _doSendMessage(text: string, configOverride?: PromptConfig | null) {
    const newRunId = `run-${Date.now()}`;
    const userMsg: Message = {
      id:        `m-${Date.now()}`,
      roomId,
      role:      "user",
      content:   text,
      createdAt: new Date().toISOString(),
      runId:     newRunId,
    };

    messagesService.append(userMsg);
    shouldScrollToBottom.current = true;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setClarifyState(null);
    const nextCount = runCount + 1;
    setRunCount(nextCount);
    const activeConfig = configOverride !== undefined ? configOverride : promptConfig;
    triggerRun(newRunId, text, nextCount, activeConfig);
  }

  async function sendMessage() {
    if (!input.trim() || isRunActive) return;

    // ── Usage limit check for Free plan ──
    if (isFree && !profile.isUnlimitedUser) {
      if (!usageService.canRunToday(profile.dailyRunLimit)) {
        setLimitError(t.usageLimitDayReached);
        return;
      }
      if (!usageService.canRunThisMonth(profile.monthlyRunLimit)) {
        setLimitError(t.usageLimitMonthReached);
        return;
      }
    }
    setLimitError(null);

    const text = input.trim();
    const apiKeyPayload = isFree ? {} : {
      openai: settings.openaiApiKey || undefined,
    };

    setIsCheckingAmbiguity(true);
    try {
      const res = await fetch("/api/check-ambiguity", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: text, apiKeys: apiKeyPayload }),
      });
      if (res.ok) {
        const data = await res.json() as {
          needsClarification: boolean;
          questions: string[];
          assumptions: string[];
        };
        if (data.needsClarification && data.questions.length > 0) {
          setIsCheckingAmbiguity(false);
          setClarifyState({ questions: data.questions, assumptions: data.assumptions, pendingInput: text });
          return;
        }
      }
    } catch {
      // If ambiguity check fails, proceed with the run anyway
    }
    setIsCheckingAmbiguity(false);
    _doSendMessage(text);
  }

  function rerun() {
    if (isRunActive || messages.length === 0) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const newRunId = `run-${Date.now()}`;
    shouldScrollToBottom.current = true;
    const nextCount = runCount + 1;
    setRunCount(nextCount);
    triggerRun(newRunId, lastUserMsg?.content ?? "", nextCount);
  }

  // "暫定結論を出す" — skip rounds, generate conclusion from current context
  const handleProvisional = useCallback(() => {
    if (isRunActive || messages.length === 0) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;
    if (!hasSomeKey && !isFree) return;

    const sides = isFree
      ? (["A", "B"] as const)
      : ((agentCount === 2 ? ["A", "B"] : ["A", "B", "C"]) as ("A" | "B" | "C")[]);
    const sideConfigs = isFree ? FREE_SIDES : [settings.sideA, settings.sideB, settings.sideC];
    const agentConfig = sides
      .map((side, i) => ({ side, provider: sideConfigs[i]!.provider, model: sideConfigs[i]!.model }))
      .filter(() => isFree || !!settings.openaiApiKey);

    setConclusionStatus("loading");
    setRunStatus("running");

    const runId = `run-${Date.now()}-provisional`;
    const params: RealRunParams = {
      roomId,
      runId,
      userMessage:      lastUserMsg.content,
      mode:             settings.defaultMode,
      agentConfig,
      apiKeys: isFree ? {} : {
        openai: settings.openaiApiKey || undefined,
      },
      previousMessages: messages
        .filter((m) => m.role !== "summary")
        .slice(-20)
        .map((m) => ({ role: m.role, agentId: m.agentId, content: m.content })),
      writingStyle:    settings.writingStyle,
      forceConclusion: true,
    };

    const cancel = runsService.realRun(
      params,
      () => {},  // no new messages expected (rounds skipped)
      (conc) => {
        const enriched: ConclusionData = {
          ...conc, runId, runNumber: runCount,
          isProvisional: false, isFinal: true,
        };
        messagesService.saveConclusion(roomId, enriched);
        setConclusions(messagesService.getConclusions(roomId));
        setConclusionStatus("final");
        setRunStatus("completed");
      },
      (status) => {
        setRunStatus(status);
        if (status === "error") setConclusionStatus("unresolved");
      },
      undefined,
      undefined,
      undefined,
      () => { setConclusionStatus("unresolved"); setRunStatus("completed"); },
    );
    cancelRun.current = cancel;
  }, [runStatus, messages, hasSomeKey, isFree, agentCount, settings, roomId, runCount]);

  // "条件を追加する" — focus the message input
  const handleAddCondition = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // "ここで終える" — promote the current provisional conclusion to final (client-side, no API call)
  const handleEndHere = useCallback(() => {
    const current = conclusions[0];
    if (!current) return;
    const finalized: ConclusionData = {
      ...current,
      isProvisional: false,
      isFinal:       true,
    };
    // Replace the top conclusion with the finalized version
    messagesService.updateTopConclusion(roomId, finalized);
    setConclusions(messagesService.getConclusions(roomId));
    setConclusionStatus("final");
    setRunStatus("completed");
    const lastMsg = messagesService.getByRoom(roomId).at(-1);
    updateRoom(roomId, { lastRunStatus: "completed", ...(lastMsg ? { lastMessage: lastMsg.content.slice(0, 80), lastMessageAt: lastMsg.createdAt } : {}) });
  }, [conclusions, roomId, updateRoom]);

  // "議論を続ける" — run additional rounds focused on the 残論点 from the last provisional
  const handleContinueDiscussion = useCallback((direction: string = "") => {
    if (isRunActive || messages.length === 0) return;
    if (!hasSomeKey && !isFree) return;

    // ── Continuation limit check for Free plan ──
    if (isFree && !profile.isUnlimitedUser) {
      if (!usageService.canContinue(roomId, profile.continuationLimit)) {
        setLimitError(t.usageContinuationLimit);
        return;
      }
    }
    setLimitError(null);
    usageService.incrementContinuation(roomId);

    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;
    const previousProvisional = conclusions[0]?.summary ?? "";

    const sides = isFree
      ? (["A", "B"] as const)
      : ((agentCount === 2 ? ["A", "B"] : ["A", "B", "C"]) as ("A" | "B" | "C")[]);
    const sideConfigs = isFree ? FREE_SIDES : [settings.sideA, settings.sideB, settings.sideC];
    const agentConfig = sides
      .map((side, i) => ({ side, provider: sideConfigs[i]!.provider, model: sideConfigs[i]!.model }))
      .filter(() => isFree || !!settings.openaiApiKey);

    const runId = `run-${Date.now()}-cont`;
    const nextCount = runCount + 1;
    setRunCount(nextCount);
    setRunStatus("continued");
    setRespondedCount(0);
    setCurrentRound(null);
    setAgentErrors([]);
    setConclusionStatus("loading");
    // Scroll to the bottom so the new round is immediately visible
    shouldScrollToBottom.current = true;

    const params: RealRunParams = {
      roomId,
      runId,
      userMessage:      lastUserMsg.content,
      mode:             settings.defaultMode,
      agentConfig,
      apiKeys: isFree ? {} : {
        openai: settings.openaiApiKey || undefined,
      },
      previousMessages: messages
        .filter((m) => m.role !== "summary")
        .slice(-16)
        .map((m) => ({ role: m.role, agentId: m.agentId, content: m.content })),
      writingStyle:           settings.writingStyle,
      continuation:           true,
      previousProvisional,
      continuationDirection:  direction || undefined,
      promptConfig:           promptConfig ?? undefined,
    };

    function onMsg(msg: Message) {
      messagesService.append(msg);
      setMessages((prev) => [...prev, msg]);
      setRespondedCount((c) => c + 1);
    }

    const cancel = runsService.realRun(
      params,
      onMsg,
      // onConclusion — shouldn't fire in continuation (no forceConclusion), but handle defensively
      (conc) => {
        const enriched: ConclusionData = { ...conc, runId, runNumber: nextCount, isProvisional: false, isFinal: true };
        messagesService.saveConclusion(roomId, enriched);
        setConclusions(messagesService.getConclusions(roomId));
        setConclusionStatus("final");
        setRunStatus("completed");
      },
      (status) => {
        if (status !== "checkpoint") setRunStatus(status);
        if (status === "error") setConclusionStatus((prev) => prev === "loading" ? "error" : prev);
        if (status === "completed") {
          updateRoom(roomId, { lastRunStatus: status });
        }
      },
      (side, message) => setAgentErrors((prev) => [...prev, `${side}: ${message}`]),
      (evt) => setCurrentRound(evt),
      (evt) => {
        const summaryMsg: Message = {
          id:        evt.id,
          roomId,
          role:      "summary",
          round:     evt.round,
          content:   evt.summary,
          createdAt: evt.createdAt,
          runId,
        };
        messagesService.append(summaryMsg);
        setMessages((prev) => [...prev, summaryMsg]);
      },
      () => { setConclusionStatus("unresolved"); },
      // onCheckpoint — updated provisional conclusion
      (conc) => {
        const enriched: ConclusionData = { ...conc, runId, runNumber: nextCount, isProvisional: true, isFinal: false };
        messagesService.saveConclusion(roomId, enriched);
        setConclusions(messagesService.getConclusions(roomId));
        setConclusionStatus("provisional");
        setRunStatus("checkpoint");
      },
    );
    cancelRun.current = cancel;
  }, [runStatus, messages, hasSomeKey, isFree, agentCount, settings, roomId, runCount, conclusions, updateRoom]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="relative flex flex-col flex-1 min-h-0 overflow-hidden">
      <RoomHeader
        roomName={roomName}
        runStatus={runStatus}
        modeLabel={modeLabel}
        activeRoleLabels={activeRoleLabels}
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
              {group.messages.map((msg, msgIdx) => {
                const prevMsg = group.messages[msgIdx - 1];

                if (msg.role === "summary") {
                  return (
                    <RoundSummaryBubble
                      key={msg.id}
                      round={msg.round ?? 0}
                      content={msg.content}
                      locale={locale}
                    />
                  );
                }

                const showRoundHeader =
                  msg.role === "assistant" &&
                  msg.round != null &&
                  msg.round !== (prevMsg?.role === "assistant" ? prevMsg.round : undefined) &&
                  !(prevMsg == null && msg.round === 1);

                return (
                  <div key={msg.id}>
                    {showRoundHeader && (
                      <RoundHeader round={msg.round!} mode={settings.defaultMode} locale={locale} />
                    )}
                    <MessageBubble
                      message={msg}
                      mode={settings.defaultMode}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {isRunActive && (
          <ThinkingIndicator
            respondedCount={respondedCount}
            agentCount={agentCount}
            currentRound={currentRound}
          />
        )}
        {runStatus === "error" && !fatalError && <ErrorState onRerun={rerun} />}

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
        <ConclusionCard
          runCount={runCount}
          conclusions={conclusions}
          conclusionStatus={conclusionStatus}
          onRerun={rerun}
          onContinue={rerun}
          onProvisional={handleProvisional}
          onAddCondition={handleAddCondition}
          onEndHere={handleEndHere}
          onContinueDiscussion={handleContinueDiscussion}
        />
      )}

      {/* Clarification card — shown before debate starts when ambiguity detected */}
      {clarifyState && !isRunActive && (
        <ClarificationCard
          questions={clarifyState.questions}
          assumptions={clarifyState.assumptions}
          onAnswer={(answer) => {
            const combined = `${clarifyState.pendingInput}\n\n補足: ${answer}`;
            _doSendMessage(combined);
          }}
          onSkip={() => {
            _doSendMessage(clarifyState.pendingInput);
          }}
        />
      )}

      {/* Ambiguity checking indicator */}
      {isCheckingAmbiguity && (
        <div className="mx-3 sm:mx-4 mb-2 flex items-center gap-2 px-4 py-3 rounded-2xl border border-border/40 bg-muted/20">
          <span className="w-3 h-3 rounded-full border-2 border-foreground/20 border-t-foreground/60 animate-spin" />
          <p className="text-xs text-muted-foreground">
            {locale === "ja" ? "確認中…" : "Checking…"}
          </p>
        </div>
      )}

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

      {/* ── Prompt Mode overlay ─────────────────────────────────────────────── */}
      {promptMode && !isRunActive && (
        <div className="absolute inset-0 z-30 bg-background/95 backdrop-blur-sm flex flex-col">
          <PromptModeForm
            onSubmit={(cfg, topic) => {
              setPromptConfig(cfg);
              setPromptMode(false);
              _doSendMessage(topic, cfg);
            }}
            onCancel={() => setPromptMode(false)}
          />
        </div>
      )}

      {/* ── Usage limit error banner ──────────────────────────────────────── */}
      {limitError && (
        <div className="mx-3 sm:mx-4 mb-2 flex items-start gap-2.5 px-4 py-3 rounded-2xl border border-amber-300/60 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/30">
          <span className="text-amber-600 text-sm shrink-0 mt-px">⚠</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{limitError}</p>
          </div>
          <button
            onClick={() => setLimitError(null)}
            className="text-amber-500 hover:text-amber-700 text-xs shrink-0 ml-1 leading-none"
          >✕</button>
        </div>
      )}

      <MessageInput
        ref={inputRef}
        value={input}
        onChange={setInput}
        onSend={sendMessage}
        onStop={() => {
          cancelRun.current?.();
          cancelRun.current = null;
          setRunStatus("checkpoint");
        }}
        isRunning={isRunActive || isCheckingAmbiguity}
        apiKeysReady={plan === "free" || plan === "pro" ? true : hasSomeKey}
        promptMode={promptMode}
        onTogglePromptMode={() => setPromptMode((v) => !v)}
        usageInfo={isFree ? {
          used:        usageService.getDailyCount(),
          limit:       profile.dailyRunLimit ?? 5,
          isUnlimited: profile.isUnlimitedUser,
        } : null}
      />
    </div>
  );
}

// ─── Round Summary Bubble ─────────────────────────────────────────────────────

const ROUND_SUMMARY_LABELS_JA: Record<number, string> = {
  1: "Round 1 暫定まとめ",
  2: "Round 2 暫定まとめ",
  3: "Round 3 暫定まとめ",
};
const ROUND_SUMMARY_LABELS_EN: Record<number, string> = {
  1: "Round 1 Summary",
  2: "Round 2 Summary",
  3: "Round 3 Summary",
};

function RoundSummaryBubble({
  round,
  content,
  locale,
}: {
  round:   number;
  content: string;
  locale:  string;
}) {
  const label = locale === "ja"
    ? (ROUND_SUMMARY_LABELS_JA[round] ?? `Round ${round} まとめ`)
    : (ROUND_SUMMARY_LABELS_EN[round] ?? `Round ${round} Summary`);

  return (
    <div className="mx-1 my-1">
      <div className="rounded-xl border border-violet-200/60 dark:border-violet-800/40 bg-violet-50/40 dark:bg-violet-950/20 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-1.5">
          ◎ {label}
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
          {content}
        </p>
      </div>
    </div>
  );
}

// ─── Run Separator ────────────────────────────────────────────────────────────

interface RunSeparatorProps {
  index:         number;
  firstMsgTime?: string;
  isRerun:       boolean;
  userQuestion:  string | null;
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

// ─── Round Header ─────────────────────────────────────────────────────────────

const ROUND_LABELS_JA: Record<number, string> = {
  1: "Round 1 — 初期立場",
  2: "Round 2 — 応酬",
  3: "Round 3 — 修正案",
};
const ROUND_LABELS_EN: Record<number, string> = {
  1: "Round 1 — Initial Stance",
  2: "Round 2 — Challenge",
  3: "Round 3 — Revision",
};

function RoundHeader({ round, mode, locale }: { round: number; mode: string; locale: string }) {
  const isConclusion = round > 3;
  if (isConclusion) return null;
  if (mode === "free-talk" && round === 1) return null;

  const label = locale === "ja"
    ? (ROUND_LABELS_JA[round] ?? `Round ${round}`)
    : (ROUND_LABELS_EN[round] ?? `Round ${round}`);

  return (
    <div className="flex items-center gap-2 my-5">
      <div className="flex-1 h-px bg-border/40" />
      <span className="shrink-0 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest px-2">
        {label}
      </span>
      <div className="flex-1 h-px bg-border/40" />
    </div>
  );
}

// ─── Thinking Indicator ───────────────────────────────────────────────────────

function ThinkingIndicator({
  respondedCount,
  agentCount,
  currentRound,
}: {
  respondedCount: number;
  agentCount:     number;
  currentRound:   { round: number; label: string } | null;
}) {
  const { t, locale } = useLocale();
  const activeAgents  = AGENTS.slice(0, agentCount);
  const done          = activeAgents.slice(0, respondedCount % agentCount);
  const pending       = activeAgents.slice(respondedCount % agentCount);
  const nextAgent     = pending[0];
  const remaining     = pending.length;

  // Locale-aware role display name for the next responding agent
  const nextAgentLabel = nextAgent
    ? t.roleLabel(AGENT_SIDE[nextAgent.id] ?? "A", "structured-debate")
    : "";

  const isConclusion  = currentRound?.label?.toLowerCase().includes("conclusion");
  const isSummary     = currentRound?.label?.toLowerCase().includes("summary");

  return (
    <div className="flex flex-col gap-2 mt-5 px-1">
      {currentRound && (
        <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
          {locale === "ja" && currentRound.round <= 3
            ? (ROUND_LABELS_JA[currentRound.round] ?? currentRound.label)
            : (ROUND_LABELS_EN[currentRound.round] ?? currentRound.label)}
        </span>
      )}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {!isConclusion && !isSummary && done.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[9px] font-bold opacity-30"
              style={{ backgroundColor: a.color }}
            >
              {a.initial}
            </span>
          ))}

          {(isConclusion || isSummary || nextAgent) && (
            <div className="flex items-center gap-1.5">
              {!isConclusion && !isSummary && nextAgent && (
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[9px] font-bold"
                  style={{ backgroundColor: nextAgent.color }}
                >
                  {nextAgent.initial}
                </span>
              )}
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
          {isConclusion || isSummary
            ? t.finishingUp
            : remaining === agentCount
              ? t.agentsResponding
              : remaining > 1
                ? t.agentAndMoreResponding(nextAgentLabel)
                : remaining === 1
                  ? t.agentResponding(nextAgentLabel)
                  : t.finishingUp}
        </span>
      </div>
    </div>
  );
}

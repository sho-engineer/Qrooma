/**
 * ─── Messages Service ─────────────────────────────────────────────────────────
 *
 * SUPABASE CONNECTION POINT
 * ─────────────────────────
 * Replace mock implementations with Supabase calls:
 *
 *   // Get messages for a room
 *   const { data } = await supabase
 *     .from("messages")
 *     .select("*")
 *     .eq("room_id", roomId)
 *     .order("created_at", { ascending: true })
 *
 *   // Subscribe to new messages (realtime)
 *   supabase
 *     .channel(`room:${roomId}`)
 *     .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" },
 *         (payload) => onNewMessage(payload.new as Message))
 *     .subscribe()
 *
 * Supabase table: `messages`
 *   id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
 *   room_id     uuid REFERENCES rooms NOT NULL
 *   run_id      uuid REFERENCES runs
 *   role        text CHECK (role IN ('user', 'assistant'))
 *   agent_id    text CHECK (agent_id IN ('gpt', 'claude', 'gemini'))
 *   content     text NOT NULL
 *   created_at  timestamptz DEFAULT now()
 *
 * Supabase table: `conclusions`  (or store as a special message row with role='conclusion')
 *   id             uuid PRIMARY KEY DEFAULT gen_random_uuid()
 *   room_id        uuid REFERENCES rooms NOT NULL
 *   run_id         uuid REFERENCES runs
 *   summary        text NOT NULL
 *   key_points     text[]
 *   generated_at   timestamptz DEFAULT now()
 */

import type { Message, ConclusionData } from "../types";
import { DUMMY_MESSAGES, DUMMY_CONCLUSIONS } from "../data/dummy";

const MSG_KEY  = "qrooma_messages_v2";
const CONC_KEY = "qrooma_conclusions_v2";

function loadMessages(): Message[] {
  try {
    const stored = localStorage.getItem(MSG_KEY);
    if (stored) return JSON.parse(stored) as Message[];
  } catch { /* ignore */ }
  const seeded = [...DUMMY_MESSAGES];
  localStorage.setItem(MSG_KEY, JSON.stringify(seeded));
  return seeded;
}

function saveMessages(messages: Message[]): void {
  localStorage.setItem(MSG_KEY, JSON.stringify(messages));
}

function loadConclusions(): Record<string, ConclusionData> {
  try {
    const stored = localStorage.getItem(CONC_KEY);
    if (stored) return JSON.parse(stored) as Record<string, ConclusionData>;
  } catch { /* ignore */ }
  const seeded = { ...DUMMY_CONCLUSIONS };
  localStorage.setItem(CONC_KEY, JSON.stringify(seeded));
  return seeded;
}

// ── Mock implementations ──────────────────────────────────────────────────────

export const messagesService = {
  /** SUPABASE: .from("messages").select("*").eq("room_id", roomId).order("created_at") */
  getByRoom(roomId: string): Message[] {
    return loadMessages().filter((m) => m.roomId === roomId);
  },

  /** SUPABASE: .from("messages").insert(msg) */
  append(msg: Message): void {
    const messages = loadMessages();
    messages.push(msg);
    saveMessages(messages);
  },

  /** SUPABASE: .from("conclusions").select("*").eq("room_id", roomId).single() */
  getConclusion(roomId: string): ConclusionData | null {
    return loadConclusions()[roomId] ?? null;
  },

  /** Count unique run IDs for a room */
  countRuns(roomId: string): number {
    const ids = loadMessages()
      .filter((m) => m.roomId === roomId && m.runId)
      .map((m) => m.runId!);
    return new Set(ids).size;
  },
};

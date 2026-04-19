/**
 * ─── Messages Service ─────────────────────────────────────────────────────────
 *
 * SUPABASE CONNECTION POINT
 * ─────────────────────────
 * Replace mock implementations with Supabase calls.
 *
 * Supabase table: `messages`
 *   id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
 *   room_id     uuid REFERENCES rooms NOT NULL
 *   run_id      uuid REFERENCES runs
 *   role        text CHECK (role IN ('user', 'assistant', 'summary'))
 *   agent_id    text CHECK (agent_id IN ('gpt', 'claude', 'gemini'))
 *   content     text NOT NULL
 *   created_at  timestamptz DEFAULT now()
 *
 * Supabase table: `conclusions`
 *   id             uuid PRIMARY KEY DEFAULT gen_random_uuid()
 *   room_id        uuid REFERENCES rooms NOT NULL
 *   run_id         uuid REFERENCES runs
 *   run_number     int
 *   summary        text NOT NULL
 *   key_points     text[]
 *   generated_at   timestamptz DEFAULT now()
 */

import type { Message, ConclusionData } from "../types";
import { DUMMY_MESSAGES, DUMMY_CONCLUSIONS } from "../data/dummy";

const MSG_KEY  = "qrooma_messages_v2";
const CONC_KEY = "qrooma_conclusions_v3";  // v3 = array-per-room

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

/** Returns Record<roomId, ConclusionData[]> — newest conclusion first within each room */
function loadConclusions(): Record<string, ConclusionData[]> {
  try {
    const stored = localStorage.getItem(CONC_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, unknown>;
      // Migrate old single-value format → array format
      const migrated: Record<string, ConclusionData[]> = {};
      for (const [roomId, val] of Object.entries(parsed)) {
        if (Array.isArray(val)) {
          migrated[roomId] = val as ConclusionData[];
        } else if (val && typeof val === "object") {
          migrated[roomId] = [val as ConclusionData];
        }
      }
      return migrated;
    }
  } catch { /* ignore */ }

  // Seed from dummy
  const seeded: Record<string, ConclusionData[]> = {};
  for (const [roomId, conc] of Object.entries(DUMMY_CONCLUSIONS)) {
    seeded[roomId] = [conc];
  }
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

  /** Returns the LATEST conclusion for the room, or null */
  getConclusion(roomId: string): ConclusionData | null {
    const all = loadConclusions();
    const history = all[roomId];
    return history && history.length > 0 ? history[0]! : null;
  },

  /** Returns all conclusions for the room, newest first */
  getConclusions(roomId: string): ConclusionData[] {
    const all = loadConclusions();
    return all[roomId] ?? [];
  },

  /**
   * Appends a new conclusion to the room's history.
   * Newest conclusion is always first in the array.
   */
  saveConclusion(roomId: string, conclusion: ConclusionData): void {
    const all = loadConclusions();
    const existing = all[roomId] ?? [];
    all[roomId] = [conclusion, ...existing];
    localStorage.setItem(CONC_KEY, JSON.stringify(all));
  },

  /** Count unique run IDs for a room */
  countRuns(roomId: string): number {
    const ids = loadMessages()
      .filter((m) => m.roomId === roomId && m.runId)
      .map((m) => m.runId!);
    return new Set(ids).size;
  },
};

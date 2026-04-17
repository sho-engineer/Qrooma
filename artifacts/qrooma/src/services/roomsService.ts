/**
 * ─── Rooms Service ────────────────────────────────────────────────────────────
 *
 * SUPABASE CONNECTION POINT
 * ─────────────────────────
 * Replace mock implementations with Supabase calls:
 *
 *   // List
 *   const { data } = await supabase
 *     .from("rooms")
 *     .select("*")
 *     .eq("user_id", userId)
 *     .order("created_at", { ascending: false })
 *
 *   // Create
 *   const { data } = await supabase
 *     .from("rooms")
 *     .insert({ user_id: userId, name })
 *     .select()
 *     .single()
 *
 *   // Update
 *   const { data } = await supabase
 *     .from("rooms")
 *     .update(patch)
 *     .eq("id", id)
 *     .select()
 *     .single()
 *
 *   // Delete
 *   await supabase.from("rooms").delete().eq("id", id)
 *
 * Supabase table: `rooms`
 *   id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
 *   user_id     uuid REFERENCES auth.users NOT NULL
 *   name        text NOT NULL
 *   created_at  timestamptz DEFAULT now()
 *
 * NOTE: `lastMessage`, `lastMessageAt`, `lastRunStatus` are DERIVED values
 *       computed from the `runs` / `messages` tables — not stored on rooms.
 *       In production, compute via a Postgres VIEW or JOIN.
 */

import type { Room } from "../types";
import { DUMMY_ROOMS } from "../data/dummy";

const STORAGE_KEY = "qrooma_rooms_v2";

function load(): Room[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Room[];
  } catch { /* ignore */ }
  // Seed with demo data on first load
  const seeded = [...DUMMY_ROOMS];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function save(rooms: Room[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}

// ── Mock implementations (swap each function body for Supabase call) ──────────

export const roomsService = {
  /** SUPABASE: .from("rooms").select("*").eq("user_id", userId).order("created_at", { ascending: false }) */
  async list(_userId: string): Promise<Room[]> {
    return load();
  },

  /** SUPABASE: .from("rooms").insert({ user_id: userId, name }).select().single() */
  async create(_userId: string, name: string): Promise<Room> {
    const room: Room = {
      id: `room-${Date.now()}`,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    const rooms = load();
    rooms.unshift(room);
    save(rooms);
    return room;
  },

  /** SUPABASE: .from("rooms").update(patch).eq("id", id).select().single() */
  async update(id: string, patch: Partial<Room>): Promise<Room> {
    const rooms = load();
    const idx = rooms.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Room ${id} not found`);
    rooms[idx] = { ...rooms[idx], ...patch };
    save(rooms);
    return rooms[idx];
  },

  /** SUPABASE: .from("rooms").delete().eq("id", id) */
  async delete(id: string): Promise<void> {
    save(load().filter((r) => r.id !== id));
  },

  /** Sync helper used by the context layer for immediate UI updates */
  getById(id: string): Room | undefined {
    return load().find((r) => r.id === id);
  },
};

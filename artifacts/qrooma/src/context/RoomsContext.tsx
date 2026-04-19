/**
 * Rooms Context
 *
 * ARCHITECTURE NOTE
 * ─────────────────
 * This context is a thin UI layer over `roomsService`.
 * All data access goes through the service — never import from `../data/dummy` here.
 *
 * When Supabase is connected:
 * 1. `roomsService` methods call `supabase.from("rooms").*`
 * 2. Add a Supabase realtime subscription here to keep `rooms` in sync:
 *
 *   supabase
 *     .channel("rooms")
 *     .on("postgres_changes", { event: "*", table: "rooms", filter: `user_id=eq.${userId}` },
 *         () => refresh())
 *     .subscribe()
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Room } from "../types";
import { roomsService } from "../services/roomsService";
import { useAuth } from "./AuthContext";

interface RoomsContextValue {
  rooms:       Room[];
  isLoading:   boolean;
  addRoom:     (name: string) => Room;
  updateRoom:  (id: string, patch: Partial<Room>) => void;
  archiveRoom: (id: string) => void;
  restoreRoom: (id: string) => void;
  deleteRoom:  (id: string) => void;
  getRoomById: (id: string) => Room | undefined;
}

const RoomsContext = createContext<RoomsContextValue | null>(null);

export function RoomsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    setIsLoading(true);
    roomsService.list(user?.id ?? "demo").then((r) => {
      setRooms(r);
      setIsLoading(false);
    });
  }, [user?.id]);

  useEffect(() => {
    refresh();
    // SUPABASE CONNECTION POINT:
    // const channel = supabase.channel("rooms")
    //   .on("postgres_changes", { event: "*", table: "rooms", filter: `user_id=eq.${user?.id}` },
    //       () => refresh())
    //   .subscribe()
    // return () => channel.unsubscribe()
  }, [refresh]);

  /**
   * Optimistic create: updates local state immediately, persists via service.
   * In production (Supabase), the optimistic ID is replaced by the server UUID
   * via the realtime subscription above.
   */
  function addRoom(name: string): Room {
    const room: Room = {
      id:        `room-${Date.now()}`,
      name:      name.trim(),
      createdAt: new Date().toISOString(),
    };
    setRooms((prev) => [room, ...prev]);
    // Fire-and-forget to service; realtime subscription updates state in production
    roomsService.create(user?.id ?? "demo", name).catch(console.error);
    return room;
  }

  function updateRoom(id: string, patch: Partial<Room>): void {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    roomsService.update(id, patch).catch(console.error);
  }

  function archiveRoom(id: string): void {
    const archivedAt = new Date().toISOString();
    setRooms((prev) =>
      prev.map((r) => r.id === id ? { ...r, archived: true, archivedAt } : r)
    );
    roomsService.update(id, { archived: true, archivedAt }).catch(console.error);
  }

  function restoreRoom(id: string): void {
    setRooms((prev) =>
      prev.map((r) => r.id === id ? { ...r, archived: false, archivedAt: undefined } : r)
    );
    roomsService.update(id, { archived: false, archivedAt: undefined }).catch(console.error);
  }

  function deleteRoom(id: string): void {
    setRooms((prev) => prev.filter((r) => r.id !== id));
    roomsService.delete(id).catch(console.error);
  }

  function getRoomById(id: string): Room | undefined {
    return rooms.find((r) => r.id === id);
  }

  return (
    <RoomsContext.Provider value={{ rooms, isLoading, addRoom, updateRoom, archiveRoom, restoreRoom, deleteRoom, getRoomById }}>
      {children}
    </RoomsContext.Provider>
  );
}

export function useRooms(): RoomsContextValue {
  const ctx = useContext(RoomsContext);
  if (!ctx) throw new Error("useRooms must be used within RoomsProvider");
  return ctx;
}

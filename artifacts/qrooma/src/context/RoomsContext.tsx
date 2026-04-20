import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
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
  const [rooms, setRooms]       = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Track IDs that have been explicitly deleted in this session.
   * This prevents a race where refresh() re-fetches from storage
   * and re-adds a room that was just deleted optimistically.
   */
  const deletedIds = useRef<Set<string>>(new Set());

  const refresh = useCallback(() => {
    setIsLoading(true);
    roomsService.list(user?.id ?? "demo").then((r) => {
      // Never restore rooms that were deleted in this session
      setRooms(r.filter((room) => !deletedIds.current.has(room.id)));
      setIsLoading(false);
    });
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function addRoom(name: string): Room {
    const room: Room = {
      id:        `room-${Date.now()}`,
      name:      name.trim(),
      createdAt: new Date().toISOString(),
    };
    setRooms((prev) => [room, ...prev]);
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
    // Mark as deleted immediately so no refresh can restore it
    deletedIds.current.add(id);
    // Remove from React state
    setRooms((prev) => prev.filter((r) => r.id !== id));
    // Persist to storage (sync inside async wrapper — runs before next event loop tick)
    roomsService.delete(id).catch((err) => {
      // On failure: un-mark and restore by refreshing from storage
      deletedIds.current.delete(id);
      console.error("deleteRoom failed, restoring:", err);
      refresh();
    });
  }

  function getRoomById(id: string): Room | undefined {
    return rooms.find((r) => r.id !== undefined && !deletedIds.current.has(r.id) && r.id === id);
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

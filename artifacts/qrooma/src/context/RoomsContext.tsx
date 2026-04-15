import { createContext, useContext, useState, type ReactNode } from "react";
import type { Room } from "../types";
import { DUMMY_ROOMS } from "../data/dummy";

interface RoomsContextValue {
  rooms: Room[];
  addRoom: (name: string) => Room;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  getRoomById: (id: string) => Room | undefined;
}

const RoomsContext = createContext<RoomsContextValue | null>(null);

export function RoomsProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>(DUMMY_ROOMS);

  function addRoom(name: string): Room {
    const room: Room = {
      id: `room-${Date.now()}`,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    setRooms((prev) => [room, ...prev]);
    return room;
  }

  function updateRoom(id: string, patch: Partial<Room>) {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function getRoomById(id: string) {
    return rooms.find((r) => r.id === id);
  }

  return (
    <RoomsContext.Provider value={{ rooms, addRoom, updateRoom, getRoomById }}>
      {children}
    </RoomsContext.Provider>
  );
}

export function useRooms(): RoomsContextValue {
  const ctx = useContext(RoomsContext);
  if (!ctx) throw new Error("useRooms must be used within RoomsProvider");
  return ctx;
}

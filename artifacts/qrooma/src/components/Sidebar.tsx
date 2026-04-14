import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import type { Room } from "../types";
import { DUMMY_ROOMS } from "../data/dummy";
import { PlusIcon, PencilIcon, CheckIcon, XIcon, LogOutIcon, SettingsIcon } from "lucide-react";

interface SidebarProps {
  rooms: Room[];
  onRoomsChange: (rooms: Room[]) => void;
}

export default function Sidebar({ rooms, onRoomsChange }: SidebarProps) {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newRoomMode, setNewRoomMode] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  function startEdit(room: Room) {
    setEditingId(room.id);
    setEditValue(room.name);
  }

  function commitEdit(roomId: string) {
    if (!editValue.trim()) { cancelEdit(); return; }
    onRoomsChange(rooms.map((r) => r.id === roomId ? { ...r, name: editValue.trim() } : r));
    cancelEdit();
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  function createRoom() {
    if (!newRoomName.trim()) { setNewRoomMode(false); return; }
    const room: Room = {
      id: `room-${Date.now()}`,
      name: newRoomName.trim(),
      createdAt: new Date().toISOString(),
    };
    onRoomsChange([room, ...rooms]);
    setNewRoomName("");
    setNewRoomMode(false);
  }

  return (
    <aside className="flex flex-col w-60 shrink-0 border-r border-border bg-sidebar h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
        <span className="text-sm font-semibold text-sidebar-foreground">Qrooma</span>
        <button
          onClick={() => setNewRoomMode(true)}
          className="p-1 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-accent-foreground transition-colors"
          title="New room"
        >
          <PlusIcon size={16} />
        </button>
      </div>

      {newRoomMode && (
        <div className="px-3 py-2 border-b border-sidebar-border">
          <input
            autoFocus
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") createRoom(); if (e.key === "Escape") { setNewRoomMode(false); setNewRoomName(""); } }}
            placeholder="Room name"
            className="w-full px-2 py-1 text-sm bg-background border border-input rounded outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-1 mt-1">
            <button onClick={createRoom} className="flex-1 py-0.5 text-xs bg-primary text-primary-foreground rounded hover:opacity-90">Create</button>
            <button onClick={() => { setNewRoomMode(false); setNewRoomName(""); }} className="flex-1 py-0.5 text-xs text-muted-foreground border border-border rounded hover:bg-accent">Cancel</button>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-2">
        {rooms.length === 0 && (
          <p className="px-4 py-3 text-xs text-muted-foreground">No rooms yet. Create one.</p>
        )}
        {rooms.map((room) => {
          const isActive = location === `/rooms/${room.id}`;
          return (
            <div key={room.id} className={`group flex items-center gap-1 mx-2 mb-0.5 rounded-md ${isActive ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60"}`}>
              {editingId === room.id ? (
                <div className="flex items-center gap-1 flex-1 px-2 py-1.5">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") commitEdit(room.id); if (e.key === "Escape") cancelEdit(); }}
                    className="flex-1 text-sm bg-background border border-input rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button onClick={() => commitEdit(room.id)} className="text-primary"><CheckIcon size={13} /></button>
                  <button onClick={cancelEdit} className="text-muted-foreground"><XIcon size={13} /></button>
                </div>
              ) : (
                <>
                  <Link href={`/rooms/${room.id}`} className="flex-1 min-w-0 px-2 py-1.5">
                    <span className={`block text-sm truncate ${isActive ? "text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground"}`}>
                      {room.name}
                    </span>
                    {room.lastMessage && (
                      <span className="block text-xs text-muted-foreground truncate">{room.lastMessage}</span>
                    )}
                  </Link>
                  <button
                    onClick={() => startEdit(room)}
                    className="opacity-0 group-hover:opacity-100 p-1 mr-1 text-muted-foreground hover:text-foreground transition-opacity"
                    title="Rename"
                  >
                    <PencilIcon size={12} />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-2 space-y-1">
        <Link href="/settings" className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${location === "/settings" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"}`}>
          <SettingsIcon size={14} />
          Settings
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground transition-colors text-left"
        >
          <LogOutIcon size={14} />
          <span>Sign out</span>
          {user && <span className="ml-auto text-xs text-muted-foreground truncate max-w-20">{user.email}</span>}
        </button>
      </div>
    </aside>
  );
}

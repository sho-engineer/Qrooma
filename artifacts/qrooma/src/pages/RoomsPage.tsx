import { useState } from "react";
import { Link, useLocation } from "wouter";
import { PlusIcon, MessageSquareIcon } from "lucide-react";
import { useRooms } from "../context/RoomsContext";

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function RoomsPage() {
  const { rooms, addRoom } = useRooms();
  const [, navigate] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");

  function createRoom() {
    if (!newName.trim()) return;
    const room = addRoom(newName.trim());
    setNewName("");
    setShowForm(false);
    navigate(`/rooms/${room.id}`);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Rooms</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Each room is an async discussion with your AI team.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            <PlusIcon size={14} />
            New Room
          </button>
        </div>

        {showForm && (
          <div className="mb-4 p-4 bg-card border border-border rounded-lg">
            <label className="block text-sm font-medium text-foreground mb-2">
              Room name
            </label>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createRoom();
                if (e.key === "Escape") { setShowForm(false); setNewName(""); }
              }}
              placeholder="e.g. Product Roadmap Q3"
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring mb-3 placeholder:text-muted-foreground"
            />
            <div className="flex gap-2">
              <button
                onClick={createRoom}
                disabled={!newName.trim()}
                className="px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Create room
              </button>
              <button
                onClick={() => { setShowForm(false); setNewName(""); }}
                className="px-4 py-1.5 text-sm text-muted-foreground border border-border rounded hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {rooms.length === 0 ? (
          <RoomsEmptyState onNew={() => setShowForm(true)} />
        ) : (
          <div className="grid gap-3">
            {rooms.map((room) => (
              <Link key={room.id} href={`/rooms/${room.id}`}>
                <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquareIcon size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                      <span className="font-medium text-sm text-foreground truncate">{room.name}</span>
                    </div>
                    {room.lastMessageAt && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatRelative(room.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  {room.lastMessage ? (
                    <p className="mt-1.5 text-xs text-muted-foreground truncate pl-5">{room.lastMessage}</p>
                  ) : (
                    <p className="mt-1.5 text-xs text-muted-foreground italic pl-5">No messages yet</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RoomsEmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <MessageSquareIcon size={20} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1.5">No rooms yet</p>
      <p className="text-xs text-muted-foreground max-w-xs mb-5 leading-relaxed">
        Create a room to start an async discussion with your AI team.
      </p>
      <button
        onClick={onNew}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
      >
        <PlusIcon size={14} />
        Create your first room
      </button>
    </div>
  );
}

import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useRooms } from "../context/RoomsContext";
import { PlusIcon, PencilIcon, CheckIcon, XIcon, LogOutIcon, SettingsIcon, AlertTriangleIcon } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const { rooms, addRoom, updateRoom } = useRooms();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [newRoomMode, setNewRoomMode] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  function startEdit(id: string, name: string) {
    setEditingId(id);
    setEditValue(name);
  }

  function commitEdit(id: string) {
    if (!editValue.trim()) { cancelEdit(); return; }
    updateRoom(id, { name: editValue.trim() });
    cancelEdit();
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  function createRoom() {
    if (!newRoomName.trim()) { setNewRoomMode(false); return; }
    addRoom(newRoomName.trim());
    setNewRoomName("");
    setNewRoomMode(false);
  }

  return (
    <aside className="flex flex-col w-60 shrink-0 border-r border-border bg-sidebar h-full">
      {/* Header */}
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

      {/* Inline new-room form */}
      {newRoomMode && (
        <div className="px-3 py-2 border-b border-sidebar-border">
          <input
            autoFocus
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") createRoom();
              if (e.key === "Escape") { setNewRoomMode(false); setNewRoomName(""); }
            }}
            placeholder="Room name"
            className="w-full px-2 py-1 text-sm bg-background border border-input rounded outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-1 mt-1">
            <button onClick={createRoom} className="flex-1 py-0.5 text-xs bg-primary text-primary-foreground rounded hover:opacity-90">
              Create
            </button>
            <button
              onClick={() => { setNewRoomMode(false); setNewRoomName(""); }}
              className="flex-1 py-0.5 text-xs text-muted-foreground border border-border rounded hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Room list */}
      <nav className="flex-1 overflow-y-auto py-2">
        {rooms.length === 0 && (
          <p className="px-4 py-3 text-xs text-muted-foreground">No rooms yet. Tap + to create one.</p>
        )}
        {rooms.map((room) => {
          const isActive = location === `/rooms/${room.id}`;
          const hasError = room.lastRunStatus === "error";
          return (
            <div
              key={room.id}
              className={`group flex items-center gap-1 mx-2 mb-0.5 rounded-md ${
                isActive ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60"
              }`}
            >
              {editingId === room.id ? (
                <div className="flex items-center gap-1 flex-1 px-2 py-1.5">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit(room.id);
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="flex-1 text-sm bg-background border border-input rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button onClick={() => commitEdit(room.id)} className="text-primary p-0.5">
                    <CheckIcon size={13} />
                  </button>
                  <button onClick={cancelEdit} className="text-muted-foreground p-0.5">
                    <XIcon size={13} />
                  </button>
                </div>
              ) : (
                <>
                  <Link href={`/rooms/${room.id}`} className="flex-1 min-w-0 px-2 py-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {hasError && (
                        <AlertTriangleIcon size={10} className="text-destructive shrink-0" />
                      )}
                      <span className={`block text-sm truncate ${
                        isActive ? "text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground"
                      }`}>
                        {room.name}
                      </span>
                    </div>
                    {room.lastMessage && (
                      <span className={`block text-xs truncate mt-0.5 ${
                        hasError ? "text-destructive/60" : "text-muted-foreground"
                      }`}>
                        {room.lastMessage}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => startEdit(room.id, room.name)}
                    className="p-1 mr-1 text-muted-foreground hover:text-foreground opacity-40 group-hover:opacity-100 transition-opacity"
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

      {/* Footer */}
      <div className="border-t border-sidebar-border px-3 py-2 space-y-1">
        <Link
          href="/settings"
          className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors ${
            location === "/settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
          }`}
        >
          <SettingsIcon size={14} />
          Settings
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground transition-colors text-left"
        >
          <LogOutIcon size={14} />
          <span>Sign out</span>
          {user && (
            <span className="ml-auto text-xs text-muted-foreground truncate max-w-[5rem]">
              {user.email}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

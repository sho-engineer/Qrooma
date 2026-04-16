import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useRooms } from "../context/RoomsContext";
import { useLocale } from "../context/LocaleContext";
import {
  PlusIcon, PencilIcon, CheckIcon, XIcon,
  LogOutIcon, SettingsIcon,
  PanelLeftCloseIcon, PanelLeftOpenIcon,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  isMobile: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function Sidebar({ isOpen, isMobile, onToggle, onClose }: Props) {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const { rooms, addRoom, updateRoom } = useRooms();
  const { t } = useLocale();

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

  function handleRoomClick() {
    onClose();
  }

  if (!isOpen && !isMobile) {
    return (
      <aside className="flex flex-col w-10 shrink-0 border-r border-sidebar-border bg-sidebar h-full items-center py-2 gap-2">
        <button
          onClick={onToggle}
          title={t.toggleSidebar}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent transition-colors"
        >
          <PanelLeftOpenIcon size={15} />
        </button>
        <div className="flex-1" />
        <Link href="/settings">
          <button
            title={t.settings}
            className={`p-1.5 rounded-lg transition-colors ${
              location === "/settings"
                ? "bg-sidebar-accent text-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent"
            }`}
          >
            <SettingsIcon size={14} />
          </button>
        </Link>
        <button
          onClick={signOut}
          title={t.logout}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent transition-colors"
        >
          <LogOutIcon size={14} />
        </button>
      </aside>
    );
  }

  if (!isOpen && isMobile) {
    return null;
  }

  const containerClass = isMobile
    ? "fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-sidebar shadow-xl border-r border-sidebar-border"
    : "flex flex-col w-60 shrink-0 border-r border-sidebar-border bg-sidebar h-full";

  return (
    <aside className={containerClass}>
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-sidebar-border">
        <span className="text-sm font-semibold text-foreground tracking-tight">Qrooma</span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setNewRoomMode(true)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent transition-colors"
            title={t.newRoom}
          >
            <PlusIcon size={14} />
          </button>
          {!isMobile && (
            <button
              onClick={onToggle}
              title={t.toggleSidebar}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent transition-colors"
            >
              <PanelLeftCloseIcon size={14} />
            </button>
          )}
          {isMobile && (
            <button
              onClick={onClose}
              title={t.toggleSidebar}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent transition-colors"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>
      </div>

      {newRoomMode && (
        <div className="px-3 py-2.5 border-b border-sidebar-border">
          <input
            autoFocus
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") createRoom();
              if (e.key === "Escape") { setNewRoomMode(false); setNewRoomName(""); }
            }}
            placeholder={t.roomNamePlaceholder}
            className="w-full px-2.5 py-1.5 text-sm bg-background border border-input rounded-lg outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-1.5 mt-2">
            <button onClick={createRoom} className="flex-1 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90">
              {t.create}
            </button>
            <button
              onClick={() => { setNewRoomMode(false); setNewRoomName(""); }}
              className="flex-1 py-1 text-xs text-muted-foreground border border-border rounded-lg hover:bg-accent transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-1.5 px-1.5">
        {rooms.length === 0 && (
          <p className="px-3 py-3 text-xs text-muted-foreground">{t.noRooms}</p>
        )}
        {rooms.map((room) => {
          const isActive = location === `/rooms/${room.id}`;
          const hasError = room.lastRunStatus === "error";
          return (
            <div
              key={room.id}
              className={`group flex items-center gap-1 mb-0.5 rounded-lg ${
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
                    className="flex-1 text-sm bg-background border border-input rounded-lg px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button onClick={() => commitEdit(room.id)} className="text-primary p-0.5">
                    <CheckIcon size={12} />
                  </button>
                  <button onClick={cancelEdit} className="text-muted-foreground p-0.5">
                    <XIcon size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href={`/rooms/${room.id}`}
                    className="flex-1 min-w-0 px-2.5 py-2"
                    onClick={handleRoomClick}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {hasError && (
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive/60 shrink-0" />
                      )}
                      <span className={`block text-sm truncate ${
                        isActive ? "text-foreground font-medium" : "text-sidebar-foreground"
                      }`}>
                        {room.name}
                      </span>
                    </div>
                    {room.lastMessage && (
                      <span className="block text-xs text-muted-foreground truncate mt-0.5">
                        {room.lastMessage}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => startEdit(room.id, room.name)}
                    className="p-1.5 mr-0.5 text-muted-foreground/40 hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    title={t.rename}
                  >
                    <PencilIcon size={11} />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-1.5 py-2 space-y-0.5">
        <Link
          href="/settings"
          onClick={handleRoomClick}
          className={`flex items-center gap-2 px-2.5 py-2 text-sm rounded-lg transition-colors ${
            location === "/settings"
              ? "bg-sidebar-accent text-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
          }`}
        >
          <SettingsIcon size={13} />
          {t.settings}
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-2.5 py-2 text-sm rounded-lg text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground transition-colors text-left"
        >
          <LogOutIcon size={13} />
          <span>{t.logout}</span>
          {user && (
            <span className="ml-auto text-[11px] text-muted-foreground/50 truncate max-w-[5rem]">
              {user.email}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}

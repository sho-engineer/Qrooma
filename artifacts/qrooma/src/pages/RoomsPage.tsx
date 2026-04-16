import { useState } from "react";
import { Link, useLocation } from "wouter";
import { PlusIcon, MessageSquareIcon, AlertTriangleIcon } from "lucide-react";
import { useRooms } from "../context/RoomsContext";
import { useLocale } from "../context/LocaleContext";
import type { Room } from "../types";

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "たった今";
  if (mins < 60) return `${mins}分前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}時間前`;
  return `${Math.floor(hrs / 24)}日前`;
}

function RoomCard({ room }: { room: Room }) {
  const { t } = useLocale();
  const hasError = room.lastRunStatus === "error";

  return (
    <Link href={`/rooms/${room.id}`}>
      <div className={`bg-card border rounded-lg p-4 hover:shadow-sm transition-all cursor-pointer ${
        hasError
          ? "border-destructive/30 hover:border-destructive/50"
          : "border-border hover:border-primary/40"
      }`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {hasError ? (
              <AlertTriangleIcon size={13} className="text-destructive shrink-0 mt-0.5" />
            ) : (
              <MessageSquareIcon size={13} className="text-muted-foreground shrink-0 mt-0.5" />
            )}
            <span className="font-medium text-sm text-foreground truncate">{room.name}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {hasError && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive">
                {t.errorBadge}
              </span>
            )}
            {room.lastMessageAt && (
              <span className="text-xs text-muted-foreground">
                {formatRelative(room.lastMessageAt)}
              </span>
            )}
          </div>
        </div>
        {room.lastMessage ? (
          <p className={`mt-1.5 text-xs truncate pl-5 ${hasError ? "text-destructive/70" : "text-muted-foreground"}`}>
            {room.lastMessage}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-muted-foreground italic pl-5">{t.noMessagesYet}</p>
        )}
      </div>
    </Link>
  );
}

export default function RoomsPage() {
  const { rooms, addRoom } = useRooms();
  const { t } = useLocale();
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
    <div className="flex-1 overflow-y-auto px-4 py-5 sm:p-6">
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{t.rooms}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t.startDiscussionHint}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
          >
            <PlusIcon size={14} />
            {t.newRoom}
          </button>
        </div>

        {showForm && (
          <div className="mb-4 p-4 bg-card border border-border rounded-lg">
            <label className="block text-sm font-medium text-foreground mb-2">
              ルーム名
            </label>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createRoom();
                if (e.key === "Escape") { setShowForm(false); setNewName(""); }
              }}
              placeholder={t.roomNamePlaceholder}
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md outline-none focus:ring-2 focus:ring-ring mb-3 placeholder:text-muted-foreground"
            />
            <div className="flex gap-2">
              <button
                onClick={createRoom}
                disabled={!newName.trim()}
                className="px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {t.create}
              </button>
              <button
                onClick={() => { setShowForm(false); setNewName(""); }}
                className="px-4 py-1.5 text-sm text-muted-foreground border border-border rounded hover:bg-accent transition-colors"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {rooms.length === 0 ? (
          <RoomsEmptyState onNew={() => setShowForm(true)} />
        ) : (
          <div className="grid gap-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RoomsEmptyState({ onNew }: { onNew: () => void }) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <MessageSquareIcon size={20} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1.5">{t.noRooms}</p>
      <p className="text-xs text-muted-foreground max-w-xs mb-5 leading-relaxed">
        {t.createFirstRoom}
      </p>
      <button
        onClick={onNew}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
      >
        <PlusIcon size={14} />
        {t.newRoom}
      </button>
    </div>
  );
}

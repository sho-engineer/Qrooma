import { useState } from "react";
import { Link, useLocation } from "wouter";
import { PlusIcon } from "lucide-react";
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
    <Link href={`/rooms/${room.id}`} className="block">
      <div className="bg-card border border-border rounded-2xl px-4 py-3 hover:border-foreground/20 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {hasError && (
                <span className="w-1.5 h-1.5 rounded-full bg-destructive/60 shrink-0 mt-px" />
              )}
              <span className="font-medium text-sm text-foreground truncate">{room.name}</span>
            </div>
            {room.lastMessage ? (
              <p className="text-xs text-muted-foreground truncate leading-relaxed">
                {room.lastMessage}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground/50 italic">{t.noMessagesYet}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            {hasError && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-destructive/70">
                {t.errorBadge}
              </span>
            )}
            {room.lastMessageAt && (
              <span className="text-[11px] text-muted-foreground/50">
                {formatRelative(room.lastMessageAt)}
              </span>
            )}
          </div>
        </div>
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
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-6 sm:px-7 sm:py-8">
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-7 gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{t.rooms}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {t.startDiscussionHint}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
          >
            <PlusIcon size={14} />
            {t.newRoom}
          </button>
        </div>

        {showForm && (
          <div className="mb-5 p-5 bg-card border border-border rounded-2xl">
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
              className="w-full px-3 py-2.5 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring mb-4 placeholder:text-muted-foreground"
            />
            <div className="flex gap-2">
              <button
                onClick={createRoom}
                disabled={!newName.trim()}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {t.create}
              </button>
              <button
                onClick={() => { setShowForm(false); setNewName(""); }}
                className="px-4 py-2 text-sm text-muted-foreground border border-border rounded-xl hover:bg-accent transition-colors"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {rooms.length === 0 ? (
          <RoomsEmptyState onNew={() => setShowForm(true)} />
        ) : (
          <div className="grid gap-2.5">
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
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-5">
        <span className="text-muted-foreground/40 text-lg">·</span>
      </div>
      <p className="text-sm font-medium text-foreground mb-2">{t.noRooms}</p>
      <p className="text-xs text-muted-foreground max-w-xs mb-7 leading-relaxed">
        {t.createFirstRoom}
      </p>
      <button
        onClick={onNew}
        className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
      >
        <PlusIcon size={14} />
        {t.newRoom}
      </button>
    </div>
  );
}

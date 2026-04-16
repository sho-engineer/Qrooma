import { useState } from "react";
import { Link, useLocation } from "wouter";
import { PlusIcon } from "lucide-react";
import { useRooms } from "../context/RoomsContext";
import { useLocale } from "../context/LocaleContext";
import type { Room } from "../types";

function formatRelative(iso: string, locale: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (locale === "ja") {
    if (mins < 1) return "たった今";
    if (mins < 60) return `${mins}分前`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}時間前`;
    return `${Math.floor(hrs / 24)}日前`;
  } else {
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }
}

function RoomCard({ room }: { room: Room }) {
  const { t, locale } = useLocale();
  const hasError = room.lastRunStatus === "error";

  return (
    <Link href={`/rooms/${room.id}`} className="block w-full min-w-0">
      <div className="bg-card border border-border rounded-2xl px-4 py-3 hover:border-foreground/20 transition-colors cursor-pointer">
        {/* Row 1: error dot · name · error badge */}
        <div className="flex items-center gap-2 mb-1 overflow-hidden min-w-0">
          {hasError && (
            <span className="w-1.5 h-1.5 rounded-full bg-destructive/60 shrink-0" />
          )}
          <span className="font-medium text-sm text-foreground truncate flex-1 min-w-0">
            {room.name}
          </span>
          {hasError && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-destructive/70 shrink-0 whitespace-nowrap">
              {t.errorBadge}
            </span>
          )}
        </div>

        {/* Row 2: last message · time (time hidden on mobile) */}
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          <p className="flex-1 min-w-0 text-xs text-muted-foreground truncate leading-relaxed">
            {room.lastMessage ?? (
              <span className="italic text-muted-foreground/40">{t.noMessagesYet}</span>
            )}
          </p>
          {room.lastMessageAt && (
            <span className="text-[11px] text-muted-foreground/50 shrink-0 whitespace-nowrap hidden sm:inline">
              {formatRelative(room.lastMessageAt, locale)}
            </span>
          )}
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
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-3 min-w-0">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground truncate">{t.rooms}</h2>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {t.startDiscussionHint}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium bg-foreground text-background rounded-xl hover:opacity-85 transition-opacity whitespace-nowrap shrink-0"
          >
            <PlusIcon size={13} />
            {t.newRoom}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="mb-4 p-4 bg-card border border-border rounded-2xl">
            <label className="block text-xs font-medium text-foreground mb-2">
              {t.roomNamePlaceholder}
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
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring mb-3 placeholder:text-muted-foreground"
            />
            <div className="flex gap-2">
              <button
                onClick={createRoom}
                disabled={!newName.trim()}
                className="px-4 py-1.5 text-sm font-medium bg-foreground text-background rounded-xl hover:opacity-85 disabled:opacity-40 transition-opacity"
              >
                {t.create}
              </button>
              <button
                onClick={() => { setShowForm(false); setNewName(""); }}
                className="px-4 py-1.5 text-sm text-muted-foreground border border-border rounded-xl hover:bg-accent transition-colors"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {/* Room list */}
        {rooms.length === 0 ? (
          <RoomsEmptyState onNew={() => setShowForm(true)} />
        ) : (
          <div className="grid gap-2">
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
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-5">
        <span className="text-muted-foreground/40 text-lg">·</span>
      </div>
      <p className="text-sm font-medium text-foreground mb-2">{t.noRooms}</p>
      <p className="text-xs text-muted-foreground max-w-xs mb-7 leading-relaxed">
        {t.createFirstRoom}
      </p>
      <button
        onClick={onNew}
        className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium bg-foreground text-background rounded-xl hover:opacity-85 transition-opacity"
      >
        <PlusIcon size={13} />
        {t.newRoom}
      </button>
    </div>
  );
}

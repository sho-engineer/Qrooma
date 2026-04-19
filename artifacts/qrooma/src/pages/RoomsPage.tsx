import { useState, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  PlusIcon, ArchiveIcon, Trash2Icon, MoreHorizontalIcon,
  RotateCcwIcon, InboxIcon,
} from "lucide-react";
import { useRooms } from "../context/RoomsContext";
import { useLocale } from "../context/LocaleContext";
import type { Room } from "../types";

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

// ─── Active Room Card (swipe to archive / delete) ──────────────────────────────

const SWIPE_THRESHOLD = 72;
const ACTION_WIDTH    = 144;

interface SwipeableRoomCardProps {
  room:      Room;
  onArchive: (id: string) => void;
  onDelete:  (id: string) => void;
}

function SwipeableRoomCard({ room, onArchive, onDelete }: SwipeableRoomCardProps) {
  const { t, locale } = useLocale();
  const [offset,      setOffset]      = useState(0);
  const [isOpen,      setIsOpen]      = useState(false);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [showMenu,    setShowMenu]    = useState(false);
  const touchStartX   = useRef<number | null>(null);
  const touchStartY   = useRef<number | null>(null);
  const isDragging    = useRef(false);

  const hasError = room.lastRunStatus === "error";

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current  = false;
    setDeleteArmed(false);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.touches[0].clientY - (touchStartY.current ?? 0));
    if (dy > 14 && !isDragging.current) return;
    isDragging.current = true;
    const base   = isOpen ? -ACTION_WIDTH : 0;
    const capped = Math.max(-ACTION_WIDTH, Math.min(0, base + dx));
    setOffset(capped);
  }, [isOpen]);

  const onTouchEnd = useCallback(() => {
    if (!isDragging.current) {
      if (isOpen) closeActions();
      touchStartX.current = null;
      return;
    }
    if (offset < -SWIPE_THRESHOLD || (isOpen && offset <= -ACTION_WIDTH / 2)) {
      setOffset(-ACTION_WIDTH); setIsOpen(true);
    } else {
      setOffset(0); setIsOpen(false);
    }
    touchStartX.current = null;
    isDragging.current  = false;
  }, [offset, isOpen]);

  function closeActions() { setIsOpen(false); setOffset(0); setDeleteArmed(false); }

  function handleArchive() { closeActions(); onArchive(room.id); }
  function handleDelete() {
    if (!deleteArmed) { setDeleteArmed(true); return; }
    closeActions(); onDelete(room.id);
  }

  return (
    <div className="relative overflow-x-hidden rounded-2xl select-none">
      {/* Action strip */}
      <div className="absolute inset-y-0 right-0 flex" style={{ width: ACTION_WIDTH }}>
        <button
          onClick={handleArchive}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 transition-colors"
          aria-label={t.archiveRoom}
        >
          <ArchiveIcon size={16} className="text-stone-500" />
          <span className="text-[10px] font-medium text-stone-500">{t.archiveRoom}</span>
        </button>
        <button
          onClick={handleDelete}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
            deleteArmed ? "bg-destructive" : "bg-red-50 dark:bg-red-950 hover:bg-red-100"
          }`}
          aria-label={t.deleteRoom}
        >
          <Trash2Icon size={16} className={deleteArmed ? "text-white" : "text-destructive"} />
          <span className={`text-[10px] font-medium ${deleteArmed ? "text-white" : "text-destructive"}`}>
            {deleteArmed ? "確認" : t.deleteRoom}
          </span>
        </button>
      </div>

      {/* Card surface */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform:  `translateX(${offset}px)`,
          transition: isDragging.current ? "none" : "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
        className="relative z-10 bg-background"
        onClick={() => { if (isOpen) closeActions(); }}
      >
        <Link
          href={`/rooms/${room.id}`}
          className="block w-full min-w-0"
          onClick={(e) => { if (isOpen) e.preventDefault(); }}
        >
          <div className="group bg-card border border-border rounded-2xl px-4 py-3 cursor-pointer
            transition-all duration-200
            hover:border-foreground/15 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]
            active:scale-[0.99] active:shadow-none">
            <div className="flex items-center gap-2 mb-1 overflow-hidden min-w-0">
              {hasError && <span className="w-1.5 h-1.5 rounded-full bg-destructive/60 shrink-0" />}
              <span className="font-medium text-sm text-foreground truncate flex-1 min-w-0">{room.name}</span>
              {hasError && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-destructive/70 shrink-0 whitespace-nowrap">
                  {t.errorBadge}
                </span>
              )}
              {/* Desktop menu */}
              <div className="relative hidden sm:block shrink-0">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu((v) => !v); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-accent -mr-1"
                >
                  <MoreHorizontalIcon size={14} className="text-muted-foreground/60" />
                </button>
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); }} />
                    <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[120px]">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(false); handleArchive(); }}
                        className="flex items-center gap-2 w-full px-3.5 py-2 text-xs text-foreground/70 hover:bg-accent transition-colors"
                      >
                        <ArchiveIcon size={12} />{t.archiveRoom}
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault(); e.stopPropagation();
                          if (!deleteArmed) { setDeleteArmed(true); }
                          else { setShowMenu(false); onDelete(room.id); }
                        }}
                        className={`flex items-center gap-2 w-full px-3.5 py-2 text-xs transition-colors ${
                          deleteArmed
                            ? "text-destructive font-medium bg-destructive/5 hover:bg-destructive/10"
                            : "text-destructive/80 hover:bg-destructive/5"
                        }`}
                      >
                        <Trash2Icon size={12} />
                        {deleteArmed ? t.deleteRoomConfirm : t.deleteRoom}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 overflow-hidden min-w-0">
              <p className="flex-1 min-w-0 text-xs text-muted-foreground truncate leading-relaxed">
                {room.lastMessage ?? <span className="italic text-muted-foreground/40">{t.noMessagesYet}</span>}
              </p>
              {room.lastMessageAt && (
                <span className="text-[11px] text-muted-foreground/50 shrink-0 whitespace-nowrap hidden sm:inline">
                  {formatRelative(room.lastMessageAt, locale)}
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

// ─── Archived Room Card (swipe to restore / delete) ───────────────────────────

const ARCHIVED_ACTION_WIDTH = 144;

interface ArchivedRoomCardProps {
  room:      Room;
  onRestore: (id: string) => void;
  onDelete:  (id: string) => void;
}

function ArchivedRoomCard({ room, onRestore, onDelete }: ArchivedRoomCardProps) {
  const { t, locale } = useLocale();
  const [offset,      setOffset]      = useState(0);
  const [isOpen,      setIsOpen]      = useState(false);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [showMenu,    setShowMenu]    = useState(false);
  const touchStartX  = useRef<number | null>(null);
  const touchStartY  = useRef<number | null>(null);
  const isDragging   = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current  = false;
    setDeleteArmed(false);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.touches[0].clientY - (touchStartY.current ?? 0));
    if (dy > 14 && !isDragging.current) return;
    isDragging.current = true;
    const base   = isOpen ? -ARCHIVED_ACTION_WIDTH : 0;
    const capped = Math.max(-ARCHIVED_ACTION_WIDTH, Math.min(0, base + dx));
    setOffset(capped);
  }, [isOpen]);

  const onTouchEnd = useCallback(() => {
    if (!isDragging.current) {
      if (isOpen) closeActions();
      touchStartX.current = null;
      return;
    }
    if (offset < -SWIPE_THRESHOLD || (isOpen && offset <= -ARCHIVED_ACTION_WIDTH / 2)) {
      setOffset(-ARCHIVED_ACTION_WIDTH); setIsOpen(true);
    } else {
      setOffset(0); setIsOpen(false);
    }
    touchStartX.current = null;
    isDragging.current  = false;
  }, [offset, isOpen]);

  function closeActions() { setIsOpen(false); setOffset(0); setDeleteArmed(false); }

  return (
    <div className="relative overflow-x-hidden rounded-2xl select-none">
      {/* Action strip */}
      <div className="absolute inset-y-0 right-0 flex" style={{ width: ARCHIVED_ACTION_WIDTH }}>
        <button
          onClick={() => { closeActions(); onRestore(room.id); }}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 transition-colors"
          aria-label={t.restoreRoom}
        >
          <RotateCcwIcon size={15} className="text-sky-600" />
          <span className="text-[10px] font-medium text-sky-600">{t.restoreRoom}</span>
        </button>
        <button
          onClick={() => {
            if (!deleteArmed) { setDeleteArmed(true); return; }
            closeActions(); onDelete(room.id);
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
            deleteArmed ? "bg-destructive" : "bg-red-50 dark:bg-red-950 hover:bg-red-100"
          }`}
          aria-label={t.deleteRoom}
        >
          <Trash2Icon size={15} className={deleteArmed ? "text-white" : "text-destructive"} />
          <span className={`text-[10px] font-medium ${deleteArmed ? "text-white" : "text-destructive"}`}>
            {deleteArmed ? "確認" : t.deleteRoom}
          </span>
        </button>
      </div>

      {/* Card surface */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          transform:  `translateX(${offset}px)`,
          transition: isDragging.current ? "none" : "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
        className="relative z-10 bg-background"
        onClick={() => { if (isOpen) closeActions(); }}
      >
        <div className="group bg-card/70 border border-border/60 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2 mb-1 min-w-0">
            <ArchiveIcon size={12} className="text-muted-foreground/40 shrink-0" />
            <span className="font-medium text-sm text-foreground/60 truncate flex-1 min-w-0">{room.name}</span>
            {/* Desktop menu */}
            <div className="relative hidden sm:block shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-accent -mr-1"
              >
                <MoreHorizontalIcon size={14} className="text-muted-foreground/60" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
                  <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[120px]">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowMenu(false); onRestore(room.id); }}
                      className="flex items-center gap-2 w-full px-3.5 py-2 text-xs text-sky-600 hover:bg-sky-50 transition-colors"
                    >
                      <RotateCcwIcon size={12} />{t.restoreRoom}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!deleteArmed) { setDeleteArmed(true); }
                        else { setShowMenu(false); onDelete(room.id); }
                      }}
                      className={`flex items-center gap-2 w-full px-3.5 py-2 text-xs transition-colors ${
                        deleteArmed
                          ? "text-destructive font-medium bg-destructive/5 hover:bg-destructive/10"
                          : "text-destructive/80 hover:bg-destructive/5"
                      }`}
                    >
                      <Trash2Icon size={12} />
                      {deleteArmed ? t.deleteRoomConfirm : t.deleteRoom}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <p className="flex-1 min-w-0 text-xs text-muted-foreground/50 truncate leading-relaxed italic">
              {room.lastMessage ?? t.noMessagesYet}
            </p>
            {room.archivedAt && (
              <span className="text-[11px] text-muted-foreground/40 shrink-0 whitespace-nowrap hidden sm:inline">
                {formatRelative(room.archivedAt, locale)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rooms Page ────────────────────────────────────────────────────────────────

type Tab = "active" | "archived";

export default function RoomsPage() {
  const { rooms, isLoading, addRoom, archiveRoom, restoreRoom, deleteRoom } = useRooms();
  const { t } = useLocale();
  const [, navigate] = useLocation();
  const [tab,      setTab]      = useState<Tab>("active");
  const [showForm, setShowForm] = useState(false);
  const [newName,  setNewName]  = useState("");

  function createRoom() {
    if (!newName.trim()) return;
    const room = addRoom(newName.trim());
    setNewName(""); setShowForm(false);
    navigate(`/rooms/${room.id}`);
  }

  const activeRooms   = rooms.filter((r) => !r.archived);
  const archivedRooms = rooms.filter((r) => !!r.archived);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5 gap-3 min-w-0">
          <h2 className="text-base font-semibold text-foreground truncate">{t.rooms}</h2>
          {tab === "active" && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium bg-foreground text-background rounded-xl hover:opacity-85 transition-opacity whitespace-nowrap shrink-0"
            >
              <PlusIcon size={13} />
              {t.newRoom}
            </button>
          )}
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <div className="flex gap-1 mb-4 bg-muted/50 rounded-xl p-0.5 w-fit">
          {(["active", "archived"] as Tab[]).map((tb) => (
            <button
              key={tb}
              onClick={() => { setTab(tb); setShowForm(false); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-[10px] transition-all duration-200 whitespace-nowrap ${
                tab === tb
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tb === "active" ? t.rooms : t.archivedRooms}
              {tb === "archived" && archivedRooms.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold leading-none ${
                  tab === "archived" ? "bg-muted text-muted-foreground" : "bg-muted/60 text-muted-foreground/70"
                }`}>
                  {archivedRooms.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Create form ─────────────────────────────────────────────────── */}
        {showForm && tab === "active" && (
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

        {/* ── Room list ───────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : tab === "active" ? (
          activeRooms.length === 0 ? (
            <RoomsEmptyState onNew={() => setShowForm(true)} />
          ) : (
            <div className="grid gap-2">
              {activeRooms.map((room) => (
                <SwipeableRoomCard
                  key={room.id}
                  room={room}
                  onArchive={archiveRoom}
                  onDelete={deleteRoom}
                />
              ))}
            </div>
          )
        ) : (
          /* ── Archived tab ──────────────────────────────────────────────── */
          archivedRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-4">
                <InboxIcon size={16} className="text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground/60">{t.archivedEmptyState}</p>
            </div>
          ) : (
            <div className="grid gap-2">
              <p className="text-[11px] text-muted-foreground/50 px-1 mb-1">
                {archivedRooms.length === 1
                  ? (typeof t.archivedRooms === "string" ? `1 ${t.archivedRooms.toLowerCase()}` : "")
                  : `${archivedRooms.length} ${t.archivedRooms.toLowerCase()}`}
              </p>
              {archivedRooms.map((room) => (
                <ArchivedRoomCard
                  key={room.id}
                  room={room}
                  onRestore={restoreRoom}
                  onDelete={deleteRoom}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

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

import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useRooms } from "../context/RoomsContext";
import { useLocale } from "../context/LocaleContext";
import {
  PlusIcon, PencilIcon, CheckIcon, XIcon,
  LogOutIcon, SettingsIcon,
  PanelLeftCloseIcon, PanelLeftOpenIcon,
  MoreHorizontalIcon, Trash2Icon, ArchiveIcon,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  isMobile: boolean;
  onToggle: () => void;
  onClose: () => void;
}

// ─── Delete confirmation dialog ─────────────────────────────────────────────

function DeleteConfirmDialog({
  roomName,
  onConfirm,
  onCancel,
}: {
  roomName: string;
  onConfirm: () => void;
  onCancel:  () => void;
}) {
  const { locale } = useLocale();
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-xs rounded-2xl border border-border bg-card shadow-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {locale === "ja" ? "このトークルームを削除しますか？" : "Delete this room?"}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {locale === "ja"
              ? `「${roomName}」を削除すると元に戻せません。`
              : `"${roomName}" will be permanently deleted and cannot be recovered.`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 text-xs font-medium border border-border rounded-xl hover:bg-accent transition-colors"
          >
            {locale === "ja" ? "キャンセル" : "Cancel"}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 text-xs font-semibold bg-destructive text-destructive-foreground rounded-xl hover:opacity-90 transition-opacity"
          >
            {locale === "ja" ? "削除する" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Room context menu ────────────────────────────────────────────────────────
// NOTE: DeleteConfirmDialog is intentionally NOT rendered here.
// Rendering it inside RoomContextMenu caused a race condition:
// the "mousedown" click-outside handler unmounted this component (and the dialog)
// before the "click" event on "削除する" could fire. The dialog is now lifted to
// the Sidebar level so it survives the menu unmount.

function RoomContextMenu({
  roomId,
  roomName,
  onClose,
  onDeleteRequest,
}: {
  roomId:          string;
  roomName:        string;
  onClose:         () => void;
  /** Called when user selects Delete — Sidebar owns the confirmation dialog */
  onDeleteRequest: (id: string, name: string) => void;
}) {
  const { locale } = useLocale();
  const { archiveRoom } = useRooms();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  function handleArchive() {
    archiveRoom(roomId);
    onClose();
  }

  function handleDeleteClick() {
    // Close the dropdown first, then signal the parent to show the confirmation dialog.
    // This ensures the dialog is mounted at the Sidebar level before the menu unmounts.
    onClose();
    onDeleteRequest(roomId, roomName);
  }

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-7 z-50 w-40 rounded-xl border border-border bg-card shadow-xl py-1 text-sm"
    >
      <button
        onClick={handleArchive}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent transition-colors text-left text-xs"
      >
        <ArchiveIcon size={12} className="text-muted-foreground" />
        <span>{locale === "ja" ? "アーカイブ" : "Archive"}</span>
      </button>
      <div className="my-1 border-t border-border/40" />
      <button
        onClick={handleDeleteClick}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-destructive/10 transition-colors text-left text-xs text-destructive"
      >
        <Trash2Icon size={12} />
        <span>{locale === "ja" ? "削除" : "Delete"}</span>
      </button>
    </div>
  );
}

export default function Sidebar({ isOpen, isMobile, onToggle, onClose }: Props) {
  const [location, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  const { rooms, addRoom, updateRoom, deleteRoom } = useRooms();
  const { t } = useLocale();

  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [editValue,    setEditValue]    = useState("");
  const [newRoomMode,  setNewRoomMode]  = useState(false);
  const [newRoomName,  setNewRoomName]  = useState("");
  const [menuOpenId,   setMenuOpenId]   = useState<string | null>(null);
  /** Target room pending deletion — lifted here so the confirmation dialog
   *  survives the RoomContextMenu unmount (mousedown race condition fix). */
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  function startEdit(id: string, name: string) {
    setMenuOpenId(null);
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

  /** Called by RoomContextMenu when user picks Delete — shows confirmation at Sidebar level */
  function handleDeleteRequest(id: string, name: string) {
    setDeleteTarget({ id, name });
  }

  /** Called when user confirms deletion in the dialog */
  function handleDeleteConfirmed() {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);
    // Optimistic: remove from context immediately (animates out via AnimatePresence)
    deleteRoom(id);
    // If the user was viewing the deleted room, navigate away
    if (location === `/rooms/${id}`) {
      setLocation("/rooms");
    }
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
    ? "fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-sidebar shadow-xl border-r border-sidebar-border animate-slide-left"
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
        <AnimatePresence initial={false}>
          {rooms.map((room) => {
            const isActive  = location === `/rooms/${room.id}`;
            const hasError  = room.lastRunStatus === "error";
            const isEditing = editingId === room.id;
            const menuOpen  = menuOpenId === room.id;

            return (
              <motion.div
                key={room.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: -24,
                  scaleY: 0.7,
                  height: 0,
                  marginBottom: 0,
                  paddingTop: 0,
                  paddingBottom: 0,
                  transition: { duration: 0.22, ease: "easeIn" },
                }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className={`group relative flex items-center gap-1 mb-0.5 rounded-lg ${
                  isActive ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60"
                }`}
              >
                {isEditing ? (
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

                    {/* Rename button — desktop hover only */}
                    <button
                      onClick={() => startEdit(room.id, room.name)}
                      className="hidden sm:flex p-1.5 text-muted-foreground/40 hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      title={t.rename}
                    >
                      <PencilIcon size={11} />
                    </button>

                    {/* ··· menu — always visible on mobile, hover-only on desktop */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpen ? null : room.id);
                        }}
                        className={`p-2 mr-0.5 rounded-md transition-all touch-manipulation ${
                          menuOpen
                            ? "opacity-100 text-foreground bg-sidebar-accent"
                            : "opacity-70 sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                        }`}
                        title="メニュー"
                      >
                        <MoreHorizontalIcon size={14} />
                      </button>
                      {menuOpen && (
                        <RoomContextMenu
                          roomId={room.id}
                          roomName={room.name}
                          onClose={() => setMenuOpenId(null)}
                          onDeleteRequest={handleDeleteRequest}
                        />
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
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

      {/* ── Delete confirmation dialog — rendered at Sidebar level so it is NEVER
           unmounted when RoomContextMenu closes. Without this, the mousedown
           click-outside handler in RoomContextMenu would unmount the dialog
           before the "click" event on "削除する" could fire. ─────────────── */}
      {deleteTarget && (
        <DeleteConfirmDialog
          roomName={deleteTarget.name}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </aside>
  );
}

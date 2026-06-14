import { useRoute, useLocation, Link } from "wouter";
import { PlusIcon, ArrowLeftIcon, InboxIcon, FolderOpenIcon } from "lucide-react";
import { useProjects } from "../context/ProjectsContext";
import { useRooms } from "../context/RoomsContext";
import { useLocale } from "../context/LocaleContext";

function formatRelative(iso: string, locale: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (locale === "ja") {
    if (mins < 1) return "たった今";
    if (mins < 60) return `${mins}分前`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}時間前`;
    return `${Math.floor(hrs / 24)}日前`;
  }
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function ProjectDetailPage() {
  const [, params]   = useRoute("/projects/:projectId");
  const projectId    = params?.projectId ?? "";
  const [, navigate] = useLocation();
  const { locale }   = useLocale();
  const { getProjectById } = useProjects();
  const { rooms, addRoom } = useRooms();

  const project = getProjectById(projectId);

  const projectRooms = rooms
    .filter((r) => r.projectId === projectId && !r.archived)
    .sort((a, b) => {
      const aT = a.lastMessageAt ?? a.createdAt;
      const bT = b.lastMessageAt ?? b.createdAt;
      return bT.localeCompare(aT);
    });

  function handleNewRoom() {
    const name = locale === "ja" ? "新しいディシジョンルーム" : "Untitled Decision Room";
    const room = addRoom(name, { projectId });
    navigate(`/rooms/${room.id}`);
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <FolderOpenIcon className="w-8 h-8 opacity-40" />
        <p className="text-sm">
          {locale === "ja" ? "プロジェクトが見つかりません" : "Project not found"}
        </p>
        <Link href="/projects" className="text-xs underline hover:text-foreground">
          ← {locale === "ja" ? "プロジェクト一覧" : "All projects"}
        </Link>
      </div>
    );
  }

  const roomCountLabel =
    locale === "ja"
      ? `${projectRooms.length} ルーム`
      : `${projectRooms.length} ${projectRooms.length === 1 ? "room" : "rooms"}`;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-5 pb-3 border-b border-border/60 shrink-0">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeftIcon className="w-3 h-3" />
          {locale === "ja" ? "プロジェクト一覧" : "All projects"}
        </Link>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold leading-tight truncate">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {project.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{roomCountLabel}</p>
          </div>

          <button
            onClick={handleNewRoom}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-80 transition-opacity"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            {locale === "ja" ? "新しいルーム" : "New Decision Room"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {projectRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <InboxIcon className="w-7 h-7 opacity-30" />
            <p className="text-sm">
              {locale === "ja" ? "まだルームがありません" : "No rooms yet"}
            </p>
            <button
              onClick={handleNewRoom}
              className="text-xs underline hover:text-foreground transition-colors"
            >
              {locale === "ja" ? "最初のルームを作る" : "Create the first room"}
            </button>
          </div>
        ) : (
          projectRooms.map((room) => (
            <Link key={room.id} href={`/rooms/${room.id}`}>
              <div className="block px-4 py-3 rounded-xl border border-border/60 bg-card hover:bg-muted/40 transition-colors cursor-pointer">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{room.name}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelative(room.lastMessageAt ?? room.createdAt, locale)}
                  </span>
                </div>
                {room.lastMessage && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {room.lastMessage}
                  </p>
                )}
                {room.lastRunStatus === "completed" && (
                  <span className="inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {locale === "ja" ? "完了" : "Completed"}
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

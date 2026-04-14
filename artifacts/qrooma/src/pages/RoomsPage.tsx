import { Link } from "wouter";
import type { Room } from "../types";

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  rooms: Room[];
}

export default function RoomsPage({ rooms }: Props) {
  if (rooms.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
        No rooms yet. Create one using the + button in the sidebar.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h2 className="text-lg font-semibold mb-4">Rooms</h2>
      <div className="grid gap-3 max-w-2xl">
        {rooms.map((room) => (
          <Link key={room.id} href={`/rooms/${room.id}`}>
            <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-sm text-foreground">{room.name}</span>
                {room.lastMessageAt && (
                  <span className="text-xs text-muted-foreground shrink-0">{formatRelative(room.lastMessageAt)}</span>
                )}
              </div>
              {room.lastMessage && (
                <p className="mt-1 text-xs text-muted-foreground truncate">{room.lastMessage}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

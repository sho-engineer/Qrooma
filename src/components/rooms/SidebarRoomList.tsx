'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { renameRoom, deleteRoom } from '@/actions/rooms'
import { CreateRoomDialog } from './CreateRoomDialog'

interface Room {
  id: string
  name: string
  created_at: string
}

interface Props {
  rooms: Room[]
}

export function SidebarRoomList({ rooms }: Props) {
  return (
    <div className="space-y-0.5 px-2">
      {rooms.map((room) => (
        <SidebarRoomItem key={room.id} room={room} />
      ))}
      <div className="pt-1">
        <CreateRoomDialog />
      </div>
    </div>
  )
}

function SidebarRoomItem({ room }: { room: Room }) {
  const pathname = usePathname()
  const isActive =
    pathname === `/rooms/${room.id}` || pathname.startsWith(`/rooms/${room.id}/`)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(room.name)
  const [isPending, startTransition] = useTransition()

  function handleRename(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await renameRoom(room.id, editName)
      setEditing(false)
    })
  }

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Delete "${room.name}"?`)) return
    startTransition(async () => {
      await deleteRoom(room.id)
    })
  }

  if (editing) {
    return (
      <form onSubmit={handleRename} className="flex items-center gap-1 px-1">
        <input
          autoFocus
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setEditing(false)}
          className="flex-1 text-xs px-2 py-1 border border-blue-400 rounded focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          ✓
        </button>
      </form>
    )
  }

  return (
    <div
      className={`group flex items-center rounded-lg ${
        isActive ? 'bg-blue-50' : 'hover:bg-gray-100'
      }`}
    >
      <Link
        href={`/rooms/${room.id}`}
        className={`flex-1 px-2 py-2 text-sm truncate ${
          isActive ? 'text-blue-700 font-medium' : 'text-gray-700'
        }`}
        title={room.name}
      >
        {room.name}
      </Link>

      {/* Action buttons — only visible on hover */}
      <div className="hidden group-hover:flex items-center pr-1 gap-0.5">
        <button
          onClick={(e) => { e.preventDefault(); setEditing(true) }}
          className="p-1 text-gray-400 hover:text-gray-600 rounded text-xs"
          title="Rename"
        >
          ✎
        </button>
        <Link
          href={`/rooms/${room.id}/settings`}
          className="p-1 text-gray-400 hover:text-gray-600 rounded text-xs"
          title="Settings"
        >
          ⚙
        </Link>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="p-1 text-gray-400 hover:text-red-500 rounded text-xs disabled:opacity-50"
          title="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

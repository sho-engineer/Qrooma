'use client'

import { useState, useTransition } from 'react'
import { renameRoom, deleteRoom } from '@/actions/rooms'
import Link from 'next/link'

interface Props {
  room: {
    id: string
    name: string
    created_at: string
  }
  isActive?: boolean
}

export function RoomCard({ room, isActive }: Props) {
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

  function handleDelete() {
    if (!confirm(`Delete "${room.name}"? This cannot be undone.`)) return
    startTransition(async () => {
      await deleteRoom(room.id)
    })
  }

  if (editing) {
    return (
      <form onSubmit={handleRename} className="flex gap-1 px-2 py-1">
        <input
          autoFocus
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="flex-1 text-sm px-2 py-1 border border-blue-400 rounded focus:outline-none"
          onKeyDown={(e) => e.key === 'Escape' && setEditing(false)}
        />
        <button
          type="submit"
          disabled={isPending}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Save
        </button>
      </form>
    )
  }

  return (
    <div className={`group flex items-center gap-1 rounded-lg px-1 ${isActive ? 'bg-blue-50' : 'hover:bg-gray-100'}`}>
      <Link
        href={`/rooms/${room.id}`}
        className={`flex-1 px-2 py-2 text-sm truncate ${isActive ? 'text-blue-700 font-medium' : 'text-gray-700'}`}
      >
        {room.name}
      </Link>
      <div className="hidden group-hover:flex items-center gap-0.5 pr-1">
        <button
          onClick={() => setEditing(true)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded text-xs"
          title="Rename"
        >
          ✎
        </button>
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

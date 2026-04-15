import { createClient } from '@/lib/supabase/server'
import { RoomCard } from '@/components/rooms/RoomCard'
import { CreateRoomDialog } from '@/components/rooms/CreateRoomDialog'

export default async function RoomsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Rooms</h2>
        <p className="text-sm text-gray-500 mt-1">
          Each room is an AI team discussion space.
        </p>
      </div>

      <div className="space-y-2">
        <CreateRoomDialog />

        {rooms && rooms.length > 0 ? (
          rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">No rooms yet.</p>
            <p className="text-xs mt-1">Create your first room to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}

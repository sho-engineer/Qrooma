import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/actions/auth'
import { SidebarRoomList } from '@/components/rooms/SidebarRoomList'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch rooms for sidebar
  const { data: rooms } = await supabase
    .from('rooms')
    .select('id, name, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-4 py-4 border-b">
          <h1 className="text-base font-bold text-gray-900 tracking-tight">Qrooma</h1>
          <p className="text-xs text-gray-400 mt-0.5">AI Team Room</p>
        </div>

        {/* Room list + create button */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-3 mb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">
              Rooms
            </p>
          </div>
          <SidebarRoomList rooms={rooms ?? []} />
        </div>

        {/* Bottom nav */}
        <div className="border-t py-2 px-3 space-y-0.5">
          <a
            href="/settings"
            className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-gray-400">⚙</span>
            <span>Settings</span>
          </a>
        </div>

        {/* User footer */}
        <div className="px-3 pb-3 border-t pt-2">
          <p className="text-xs text-gray-400 truncate px-2 mb-1">{user.email}</p>
          <form action={logout}>
            <button
              type="submit"
              className="w-full text-left px-2 py-1.5 text-xs text-gray-500 rounded hover:bg-gray-100 transition-colors"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}

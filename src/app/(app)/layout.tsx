import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/actions/auth'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold text-gray-900">Qrooma</h1>
          <p className="text-xs text-gray-400 mt-0.5">AI Team Room</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <a
            href="/rooms"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span>Rooms</span>
          </a>
          <a
            href="/settings"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span>Settings</span>
          </a>
        </nav>

        <div className="p-3 border-t">
          <p className="text-xs text-gray-400 truncate px-2 mb-2">{user.email}</p>
          <form action={logout}>
            <button
              type="submit"
              className="w-full text-left px-3 py-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}

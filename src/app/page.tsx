// Root redirect — middleware handles auth-based routing
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/rooms')
}

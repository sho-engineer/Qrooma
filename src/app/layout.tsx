import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Qrooma',
  description: 'BYOK Async AI Team Room',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}

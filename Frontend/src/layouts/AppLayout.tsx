import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { Sidebar, TopNav } from '@/components/layout'
import { useRealtimeAppointments } from '@/hooks'

/**
 * Authenticated application shell: sidebar, top navigation,
 * and a scrollable main content area rendered via <Outlet />.
 */
export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  useRealtimeAppointments()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav onToggleSidebar={() => setIsSidebarOpen((open) => !open)} />

        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { Sidebar, TopNav } from '@/components/layout'
import { LoadingBlock } from '@/components/ui'
import { useRealtimeAppointments } from '@/hooks'
import { consumeUnauthorizedAccess } from '@/lib/sessionFlags'
import { useToast } from '@/providers'

/**
 * Authenticated application shell: sidebar, top navigation,
 * and a scrollable main content area rendered via <Outlet />.
 * Suspense is scoped to the outlet so chrome stays visible while
 * lazy page chunks load.
 */
export function AppLayout() {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { showToast } = useToast()
  useRealtimeAppointments()

  useEffect(() => {
    if (consumeUnauthorizedAccess()) {
      showToast('You do not have access to that page.', 'error')
    }
  }, [location.pathname, showToast])

  return (
    <div className="flex h-screen overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Skip to content
      </a>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav onToggleSidebar={() => setIsSidebarOpen((open) => !open)} />

        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <Suspense
              fallback={
                <LoadingBlock label="Loading page…" variant="default" />
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}

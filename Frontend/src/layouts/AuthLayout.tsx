import { Outlet } from 'react-router-dom'

import { env } from '@/lib/env'

/** Centered single-column layout for unauthenticated pages. */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-linear-to-b from-brand-500 to-brand-600 text-sm font-semibold text-white shadow-sm shadow-brand-500/25">
          M
        </span>
        <span className="text-xl font-semibold tracking-tight text-ink">
          {env.appName}
        </span>
      </div>
      <Outlet />
    </div>
  )
}

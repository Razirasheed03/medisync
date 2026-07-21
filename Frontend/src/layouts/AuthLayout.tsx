import { Outlet } from 'react-router-dom'

import { env } from '@/lib/env'

/** Centered single-column layout for unauthenticated pages. */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="mb-8 flex items-center gap-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
          M
        </span>
        <span className="text-2xl font-semibold text-slate-900">
          {env.appName}
        </span>
      </div>
      <Outlet />
    </div>
  )
}

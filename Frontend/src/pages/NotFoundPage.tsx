import { Link } from 'react-router-dom'

import { paths } from '@/routes/paths'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
      <p className="text-6xl font-black text-brand-600">404</p>
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="max-w-md text-sm text-slate-500">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to={paths.dashboard}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
      >
        Back to dashboard
      </Link>
    </div>
  )
}

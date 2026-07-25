import { Link } from 'react-router-dom'

import { paths } from '@/routes/paths'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-sm font-medium text-muted">404</p>
      <h1 className="text-xl font-semibold text-ink">Page not found</h1>
      <p className="max-w-sm text-sm text-muted">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to={paths.dashboard}
        className="mt-2 rounded-xl bg-linear-to-b from-brand-500 to-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm shadow-brand-500/20 transition-all duration-200 hover:from-brand-600 hover:to-brand-700"
      >
        Back to dashboard
      </Link>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui'
import { endSession } from '@/features/auth'
import { paths } from '@/routes/paths'

interface TopNavProps {
  onToggleSidebar: () => void
}

export function TopNav({ onToggleSidebar }: TopNavProps) {
  const navigate = useNavigate()

  const handleSignOut = () => {
    endSession()
    navigate(paths.login, { replace: true })
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="size-6"
            aria-hidden="true"
          >
            <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <p className="hidden text-sm text-slate-500 sm:block">
          Welcome back
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden size-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 sm:flex">
          U
        </span>
        <Button variant="secondary" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </header>
  )
}

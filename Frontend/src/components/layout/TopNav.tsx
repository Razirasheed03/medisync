import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui'
import { logout } from '@/features/auth'
import { paths } from '@/routes/paths'
import { useAuth } from '@/store'

const roleLabels = {
  SUPER_ADMIN: 'Admin',
  RECEPTIONIST: 'Receptionist',
  DOCTOR: 'Doctor',
} as const

interface TopNavProps {
  onToggleSidebar: () => void
}

export function TopNav({ onToggleSidebar }: TopNavProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      await logout()
    } finally {
      navigate(paths.login, { replace: true })
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-glass-border/80 bg-white/75 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="rounded-xl p-1.5 text-muted transition-colors duration-200 hover:bg-white/60 hover:text-ink lg:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="size-5"
            aria-hidden="true"
          >
            <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        {user ? (
          <p className="hidden text-sm text-muted sm:block">
            <span className="font-medium text-ink">{user.name}</span>
            <span className="mx-1.5 text-brand-200">·</span>
            {roleLabels[user.role]}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600">
          {user?.name.charAt(0).toUpperCase() ?? 'U'}
        </span>
        <Button
          variant="secondary"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="h-9 gap-1.5 px-3 text-[13px]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5 text-muted"
            aria-hidden="true"
          >
            <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
          {isSigningOut ? 'Signing out…' : 'Sign out'}
        </Button>
      </div>
    </header>
  )
}

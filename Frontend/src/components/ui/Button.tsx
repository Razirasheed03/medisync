import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-linear-to-b from-brand-500 to-brand-600 text-white shadow-sm shadow-brand-500/20 hover:from-brand-600 hover:to-brand-700 focus-visible:outline-brand-500',
  secondary:
    'border border-glass-border bg-white/70 text-ink shadow-sm backdrop-blur-sm hover:bg-white/90 focus-visible:outline-brand-300',
  ghost:
    'text-muted hover:bg-white/70 hover:text-ink focus-visible:outline-brand-300',
  danger:
    'bg-linear-to-b from-danger to-[#dc2626] text-white shadow-sm shadow-danger/20 hover:brightness-95 focus-visible:outline-danger',
}

export function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}

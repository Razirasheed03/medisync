import { cn } from '@/utils'

interface SkeletonProps {
  className?: string
}

/** Single shimmer block used to compose page loading skeletons. */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('shimmer rounded-xl', className)} aria-hidden="true" />
}

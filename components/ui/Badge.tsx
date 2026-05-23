import { cn } from '@/lib/utils'
import type { CaseStatus } from '@/types'
import { STATUS_COLORS, STATUS_LABELS } from '@/types'

interface StatusBadgeProps {
  status: CaseStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs tracking-wide font-normal rounded-full',
        STATUS_COLORS[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-navy/10 text-navy',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs tracking-wide rounded-full',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

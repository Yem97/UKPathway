import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 tracking-widest uppercase font-normal transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-navy text-white hover:bg-navy-800',
      secondary: 'border border-navy text-navy hover:bg-navy hover:text-white',
      ghost: 'text-navy hover:opacity-60',
    }

    const sizes = {
      sm: 'px-5 py-2.5 text-xs',
      md: 'px-8 py-4 text-sm',
      lg: 'px-10 py-5 text-sm',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button

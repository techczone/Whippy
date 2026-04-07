'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils'

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'gradient'
  size?: 'sm' | 'default' | 'lg'
  showValue?: boolean
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ 
  className, 
  value, 
  indicatorClassName, 
  variant = 'default',
  size = 'default',
  showValue = false,
  ...props 
}, ref) => {
  const sizeClasses = {
    sm: 'h-1.5',
    default: 'h-2.5',
    lg: 'h-4',
  }

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
    gradient: 'bg-gradient-to-r from-primary to-accent',
  }

  return (
    <div className="relative">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-secondary',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            'h-full w-full flex-1 transition-all duration-500 ease-out rounded-full',
            variantClasses[variant],
            indicatorClassName
          )}
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </ProgressPrimitive.Root>
      {showValue && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+8px)] text-xs font-medium text-muted-foreground">
          {Math.round(value || 0)}%
        </span>
      )}
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

// Circular progress component
interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  showValue?: boolean
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ value, size = 120, strokeWidth = 8, className, variant = 'default', showValue = true }, ref) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (value / 100) * circumference

    const variantColors = {
      default: 'stroke-primary',
      success: 'stroke-success',
      warning: 'stroke-warning',
      destructive: 'stroke-destructive',
    }

    return (
      <div ref={ref} className={cn('relative inline-flex items-center justify-center', className)}>
        <svg width={size} height={size} className="progress-ring">
          <circle
            className="stroke-secondary"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className={cn('transition-all duration-500 ease-out', variantColors[variant])}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
            }}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{Math.round(value)}</span>
          </div>
        )}
      </div>
    )
  }
)
CircularProgress.displayName = 'CircularProgress'

export { Progress, CircularProgress }

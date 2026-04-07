'use client'

import { motion } from 'framer-motion'
import { cn, getScoreColor } from '@/lib/utils'
import { CircularProgress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number | string
  subtitle?: string
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  color?: string
  variant?: 'default' | 'circular' | 'compact'
  className?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  icon,
  color,
  variant = 'default',
  className,
}: StatCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0
  
  const getTrendIcon = () => {
    if (change === undefined || change === 0) return <Minus className="h-3 w-3" />
    return change > 0 ? (
      <TrendingUp className="h-3 w-3" />
    ) : (
      <TrendingDown className="h-3 w-3" />
    )
  }

  const getTrendColor = () => {
    if (change === undefined || change === 0) return 'text-muted-foreground'
    return change > 0 ? 'text-green-500' : 'text-red-500'
  }

  if (variant === 'circular') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'stat-card bg-card border border-border',
          className
        )}
        style={{ color }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon && <span className="text-xl">{icon}</span>}
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <CircularProgress
            value={numericValue}
            size={100}
            strokeWidth={8}
            variant={
              numericValue >= 80 ? 'success' :
              numericValue >= 60 ? 'default' :
              numericValue >= 40 ? 'warning' : 'destructive'
            }
          />
        </div>
        
        {(change !== undefined || subtitle) && (
          <div className="mt-4 text-center">
            {change !== undefined && (
              <div className={cn('flex items-center justify-center gap-1 text-xs', getTrendColor())}>
                {getTrendIcon()}
                <span>{change > 0 ? '+' : ''}{change}%</span>
                {changeLabel && <span className="text-muted-foreground ml-1">{changeLabel}</span>}
              </div>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        )}
      </motion.div>
    )
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl bg-secondary/50',
          className
        )}
      >
        {icon && (
          <div 
            className="flex items-center justify-center w-10 h-10 rounded-lg"
            style={{ backgroundColor: color ? `${color}20` : undefined }}
          >
            <span className="text-lg">{icon}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{title}</p>
          <p className="text-lg font-semibold" style={{ color }}>
            {typeof value === 'number' ? Math.round(value) : value}
          </p>
        </div>
        {change !== undefined && (
          <div className={cn('text-xs', getTrendColor())}>
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'stat-card bg-card border border-border',
        className
      )}
      style={{ color }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
        {icon && <span className="text-xl opacity-80">{icon}</span>}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span 
          className={cn(
            'text-3xl font-bold',
            typeof value === 'number' && getScoreColor(value)
          )}
          style={typeof value !== 'number' ? { color } : undefined}
        >
          {typeof value === 'number' ? Math.round(value) : value}
        </span>
        {typeof value === 'number' && (
          <span className="text-lg text-muted-foreground">/100</span>
        )}
      </div>
      
      {(change !== undefined || subtitle) && (
        <div className="mt-3 flex items-center justify-between">
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 text-xs', getTrendColor())}>
              {getTrendIcon()}
              <span>{change > 0 ? '+' : ''}{change}%</span>
              {changeLabel && <span className="text-muted-foreground ml-1">{changeLabel}</span>}
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}
    </motion.div>
  )
}

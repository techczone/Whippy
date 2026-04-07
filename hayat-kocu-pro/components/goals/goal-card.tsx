'use client'

import { motion } from 'framer-motion'
import { Target, Calendar, TrendingUp, MoreVertical, Pencil, Trash2, CheckCircle, Pause } from 'lucide-react'
import { cn, formatDate, GOAL_CATEGORY_ICONS } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Goal } from '@/types'

interface GoalCardProps {
  goal: Goal
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onUpdateProgress?: (id: string, value: number) => void
  onStatusChange?: (id: string, status: Goal['status']) => void
  compact?: boolean
}

export function GoalCard({
  goal,
  onEdit,
  onDelete,
  onUpdateProgress,
  onStatusChange,
  compact = false,
}: GoalCardProps) {
  const progress = Math.min(100, (goal.current_value / goal.target_value) * 100)
  const isComplete = goal.status === 'completed' || progress >= 100
  const isPaused = goal.status === 'paused'
  const categoryIcon = GOAL_CATEGORY_ICONS[goal.category] || '📌'

  const getProgressVariant = () => {
    if (isComplete) return 'success'
    if (progress >= 75) return 'default'
    if (progress >= 50) return 'warning'
    return 'destructive'
  }

  const getDaysRemaining = () => {
    if (!goal.deadline) return null
    const deadline = new Date(goal.deadline)
    const today = new Date()
    const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const daysRemaining = getDaysRemaining()

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className={cn(
          'p-3 rounded-xl border transition-all cursor-pointer',
          isComplete 
            ? 'bg-success/10 border-success/30'
            : isPaused
            ? 'bg-muted/50 border-border opacity-60'
            : 'bg-card border-border hover:border-primary/30'
        )}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-lg">{categoryIcon}</span>
          <span className={cn('font-medium truncate flex-1', isComplete && 'line-through')}>
            {goal.name}
          </span>
          {isComplete && <CheckCircle className="w-4 h-4 text-success" />}
        </div>
        
        <Progress value={progress} variant={getProgressVariant()} size="sm" />
        
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{goal.current_value} / {goal.target_value} {goal.unit}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group p-5 rounded-2xl border transition-all',
        isComplete 
          ? 'bg-success/10 border-success/30'
          : isPaused
          ? 'bg-muted/50 border-border'
          : 'bg-card border-border hover:border-primary/30 hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ 
              backgroundColor: goal.color ? `${goal.color}20` : 'hsl(var(--primary) / 0.1)' 
            }}
          >
            {categoryIcon}
          </div>
          <div>
            <h3 className={cn('font-semibold', isComplete && 'line-through text-muted-foreground')}>
              {goal.name}
            </h3>
            {goal.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">{goal.description}</p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon-sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(goal.id)}>
              <Pencil className="w-4 h-4 mr-2" />
              Düzenle
            </DropdownMenuItem>
            {!isComplete && (
              <DropdownMenuItem 
                onClick={() => onStatusChange?.(goal.id, isPaused ? 'active' : 'paused')}
              >
                <Pause className="w-4 h-4 mr-2" />
                {isPaused ? 'Devam Et' : 'Duraklat'}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => onDelete?.(goal.id)}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Progress section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">İlerleme</span>
          <span className="font-medium">
            {goal.current_value} / {goal.target_value} {goal.unit}
          </span>
        </div>

        <Progress 
          value={progress} 
          variant={getProgressVariant()} 
          size="lg"
          className="h-3"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Quick update buttons */}
            {!isComplete && !isPaused && onUpdateProgress && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => onUpdateProgress(goal.id, Math.max(0, goal.current_value - 1))}
                  className="h-7 w-7"
                >
                  −
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => onUpdateProgress(goal.id, goal.current_value + 1)}
                  className="h-7 w-7"
                >
                  +
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {daysRemaining !== null && (
              <div className={cn(
                'flex items-center gap-1',
                daysRemaining < 0 && 'text-destructive',
                daysRemaining <= 7 && daysRemaining >= 0 && 'text-warning'
              )}>
                <Calendar className="w-3 h-3" />
                {daysRemaining < 0 
                  ? `${Math.abs(daysRemaining)} gün geçti`
                  : daysRemaining === 0
                  ? 'Bugün'
                  : `${daysRemaining} gün kaldı`
                }
              </div>
            )}
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Goal summary for dashboard
export function GoalsSummary({ goals }: { goals: Goal[] }) {
  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')
  const totalProgress = activeGoals.length > 0
    ? activeGoals.reduce((acc, g) => acc + (g.current_value / g.target_value) * 100, 0) / activeGoals.length
    : 0

  return (
    <div className="flex items-center gap-6 p-4 rounded-xl bg-secondary/30">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{activeGoals.length}</p>
          <p className="text-xs text-muted-foreground">Aktif hedef</p>
        </div>
      </div>

      <div className="h-10 w-px bg-border" />

      <div>
        <p className="text-2xl font-bold text-success">{completedGoals.length}</p>
        <p className="text-xs text-muted-foreground">Tamamlanan</p>
      </div>

      <div className="h-10 w-px bg-border" />

      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs text-muted-foreground">Ortalama ilerleme</p>
          <p className="text-sm font-medium">{Math.round(totalProgress)}%</p>
        </div>
        <Progress value={totalProgress} variant="gradient" size="sm" />
      </div>
    </div>
  )
}

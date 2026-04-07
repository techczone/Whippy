'use client'

import { motion } from 'framer-motion'
import { FolderKanban, Calendar, MoreVertical, Pencil, Trash2, Play, Pause, CheckCircle } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Project } from '@/types'

interface ProjectCardProps {
  project: Project
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onUpdateProgress?: (id: string, progress: number) => void
  onStatusChange?: (id: string, status: Project['status']) => void
  compact?: boolean
}

const PRIORITY_COLORS = {
  low: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', label: 'Düşük' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', label: 'Orta' },
  high: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', label: 'Yüksek' },
}

const STATUS_ICONS = {
  active: Play,
  paused: Pause,
  completed: CheckCircle,
  archived: FolderKanban,
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onUpdateProgress,
  onStatusChange,
  compact = false,
}: ProjectCardProps) {
  const isComplete = project.status === 'completed' || project.progress >= 100
  const isPaused = project.status === 'paused'
  const priority = PRIORITY_COLORS[project.priority]
  const StatusIcon = STATUS_ICONS[project.status]

  const getDaysRemaining = () => {
    if (!project.deadline) return null
    const deadline = new Date(project.deadline)
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
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <span className={cn('font-medium truncate flex-1', isComplete && 'line-through')}>
            {project.name}
          </span>
        </div>
        
        <Progress 
          value={project.progress} 
          variant={isComplete ? 'success' : 'default'} 
          size="sm" 
        />
        
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span className={cn('px-1.5 py-0.5 rounded', priority.bg, priority.text)}>
            {priority.label}
          </span>
          <span>{project.progress}%</span>
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
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${project.color}20` }}
          >
            <FolderKanban className="w-6 h-6" style={{ color: project.color }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={cn('font-semibold', isComplete && 'line-through text-muted-foreground')}>
                {project.name}
              </h3>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                priority.bg, priority.text
              )}>
                {priority.label}
              </span>
            </div>
            {project.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{project.description}</p>
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
            <DropdownMenuItem onClick={() => onEdit?.(project.id)}>
              <Pencil className="w-4 h-4 mr-2" />
              Düzenle
            </DropdownMenuItem>
            {!isComplete && (
              <DropdownMenuItem 
                onClick={() => onStatusChange?.(project.id, isPaused ? 'active' : 'paused')}
              >
                {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                {isPaused ? 'Devam Et' : 'Duraklat'}
              </DropdownMenuItem>
            )}
            {!isComplete && (
              <DropdownMenuItem 
                onClick={() => onStatusChange?.(project.id, 'completed')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Tamamlandı
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => onDelete?.(project.id)}
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
          <div className="flex items-center gap-2">
            <StatusIcon className={cn(
              'w-4 h-4',
              isComplete ? 'text-success' : isPaused ? 'text-muted-foreground' : 'text-primary'
            )} />
            <span className="text-muted-foreground">
              {isComplete ? 'Tamamlandı' : isPaused ? 'Duraklatıldı' : 'Devam ediyor'}
            </span>
          </div>
          <span className="font-medium">{project.progress}%</span>
        </div>

        <Progress 
          value={project.progress} 
          variant={isComplete ? 'success' : 'gradient'} 
          size="lg"
          className="h-3"
        />

        <div className="flex items-center justify-between">
          {/* Progress slider */}
          {!isComplete && !isPaused && onUpdateProgress && (
            <input
              type="range"
              min="0"
              max="100"
              value={project.progress}
              onChange={(e) => onUpdateProgress(project.id, parseInt(e.target.value))}
              className="flex-1 h-2 mr-4 accent-primary cursor-pointer"
            />
          )}

          {daysRemaining !== null && (
            <div className={cn(
              'flex items-center gap-1 text-xs',
              daysRemaining < 0 && 'text-destructive',
              daysRemaining <= 7 && daysRemaining >= 0 && 'text-warning',
              daysRemaining > 7 && 'text-muted-foreground'
            )}>
              <Calendar className="w-3 h-3" />
              {daysRemaining < 0 
                ? `${Math.abs(daysRemaining)} gün geçti`
                : daysRemaining === 0
                ? 'Bugün bitiyor'
                : `${daysRemaining} gün kaldı`
              }
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Projects summary for dashboard
export function ProjectsSummary({ projects }: { projects: Project[] }) {
  const activeProjects = projects.filter(p => p.status === 'active')
  const completedProjects = projects.filter(p => p.status === 'completed')
  const totalProgress = activeProjects.length > 0
    ? activeProjects.reduce((acc, p) => acc + p.progress, 0) / activeProjects.length
    : 0

  const urgentProjects = activeProjects.filter(p => {
    if (!p.deadline) return false
    const deadline = new Date(p.deadline)
    const today = new Date()
    const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff <= 7 && diff >= 0
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 p-4 rounded-xl bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <FolderKanban className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeProjects.length}</p>
            <p className="text-xs text-muted-foreground">Aktif proje</p>
          </div>
        </div>

        <div className="h-10 w-px bg-border" />

        <div>
          <p className="text-2xl font-bold text-success">{completedProjects.length}</p>
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

      {urgentProjects.length > 0 && (
        <div className="p-3 rounded-xl bg-warning/10 border border-warning/30">
          <p className="text-sm font-medium text-warning">
            ⚠️ {urgentProjects.length} proje bu hafta bitiyor
          </p>
          <div className="mt-2 space-y-1">
            {urgentProjects.slice(0, 3).map(p => (
              <p key={p.id} className="text-xs text-muted-foreground">
                • {p.name}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

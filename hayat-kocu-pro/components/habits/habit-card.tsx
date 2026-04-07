'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Flame, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import confetti from 'canvas-confetti'

interface HabitCardProps {
  id: string
  name: string
  icon: string
  color: string
  streak: number
  completed: boolean
  onToggle: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function HabitCard({
  id,
  name,
  icon,
  color,
  streak,
  completed,
  onToggle,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleToggle = () => {
    if (!completed) {
      setIsAnimating(true)
      
      // Trigger confetti for completing a habit
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: [color, '#FFD700', '#FF6B6B'],
      })

      setTimeout(() => setIsAnimating(false), 600)
    }
    onToggle(id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer',
        completed 
          ? 'bg-success/10 border-success/30' 
          : 'bg-card border-border hover:border-primary/30 hover:bg-accent/5'
      )}
      onClick={handleToggle}
    >
      {/* Checkbox */}
      <motion.div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-lg border-2 transition-all duration-300',
          completed 
            ? 'bg-success border-success' 
            : 'border-muted-foreground/30 hover:border-primary'
        )}
        animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Icon */}
      <div 
        className="flex items-center justify-center w-10 h-10 rounded-xl text-xl"
        style={{ backgroundColor: `${color}20` }}
      >
        {icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          'font-medium transition-all duration-300',
          completed && 'line-through text-muted-foreground'
        )}>
          {name}
        </h4>
        
        {/* Streak badge */}
        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 mt-1"
          >
            <div 
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                streak >= 7 && 'animate-streak-glow'
              )}
              style={{ 
                backgroundColor: `${color}20`,
                color: color 
              }}
            >
              <Flame className="w-3 h-3" />
              <span>{streak} gün seri</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="ghost" 
            size="icon-sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(id) }}>
            <Pencil className="w-4 h-4 mr-2" />
            Düzenle
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={(e) => { e.stopPropagation(); onDelete?.(id) }}
            className="text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Sil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}

// Mini version for compact lists
export function HabitCardMini({
  name,
  icon,
  color,
  streak,
  completed,
  onToggle,
}: Omit<HabitCardProps, 'id' | 'onEdit' | 'onDelete'> & { onToggle: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all',
        completed ? 'bg-success/10' : 'hover:bg-accent/10'
      )}
      onClick={onToggle}
    >
      <div 
        className={cn(
          'w-5 h-5 rounded border-2 flex items-center justify-center',
          completed ? 'bg-success border-success' : 'border-muted-foreground/30'
        )}
      >
        {completed && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className="text-lg">{icon}</span>
      <span className={cn(
        'text-sm flex-1 truncate',
        completed && 'line-through text-muted-foreground'
      )}>
        {name}
      </span>
      {streak > 0 && (
        <span className="text-xs text-orange-500 flex items-center gap-0.5">
          <Flame className="w-3 h-3" />
          {streak}
        </span>
      )}
    </motion.div>
  )
}

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MOOD_EMOJIS, MOOD_LABELS } from '@/types'

interface MoodSelectorProps {
  value?: 1 | 2 | 3 | 4 | 5
  selectedMood?: 1 | 2 | 3 | 4 | 5
  onChange?: (mood: 1 | 2 | 3 | 4 | 5) => void
  onSelect?: (mood: 1 | 2 | 3 | 4 | 5) => void
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function MoodSelector({
  value,
  selectedMood,
  onChange,
  onSelect,
  showLabels = false,
  size = 'md',
  className,
}: MoodSelectorProps) {
  const currentValue = value || selectedMood
  const handleChange = onChange || onSelect
  const [hoveredMood, setHoveredMood] = useState<number | null>(null)

  const sizeClasses = {
    sm: 'text-2xl gap-2',
    md: 'text-3xl gap-3',
    lg: 'text-4xl gap-4',
  }

  const buttonSizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  }

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className={cn('flex items-center', sizeClasses[size])}>
        {([1, 2, 3, 4, 5] as const).map((mood) => (
          <motion.button
            key={mood}
            type="button"
            onClick={() => handleChange?.(mood)}
            onMouseEnter={() => setHoveredMood(mood)}
            onMouseLeave={() => setHoveredMood(null)}
            className={cn(
              'flex items-center justify-center rounded-full transition-all duration-200',
              buttonSizes[size],
              currentValue === mood
                ? 'bg-primary/20 scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background'
                : 'hover:bg-accent/50 hover:scale-105'
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={currentValue === mood ? { scale: [1, 1.2, 1.1] } : {}}
            transition={{ duration: 0.2 }}
          >
            <span className={cn(
              'transition-all duration-200',
              currentValue === mood ? 'grayscale-0' : 'grayscale-[30%] opacity-70 hover:grayscale-0 hover:opacity-100'
            )}>
              {MOOD_EMOJIS[mood]}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {(showLabels || hoveredMood || currentValue) && (
          <motion.p
            key={hoveredMood || currentValue || 'none'}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="text-sm text-muted-foreground font-medium"
          >
            {MOOD_LABELS[(hoveredMood || currentValue || 3) as keyof typeof MOOD_LABELS]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// Compact inline version for lists
export function MoodBadge({ 
  mood, 
  showLabel = false,
  size = 'sm' 
}: { 
  mood: 1 | 2 | 3 | 4 | 5
  showLabel?: boolean
  size?: 'xs' | 'sm' | 'md'
}) {
  const sizeClasses = {
    xs: 'text-sm px-1.5 py-0.5',
    sm: 'text-base px-2 py-1',
    md: 'text-lg px-3 py-1.5',
  }

  const bgColors = {
    1: 'bg-red-100 dark:bg-red-900/30',
    2: 'bg-orange-100 dark:bg-orange-900/30',
    3: 'bg-yellow-100 dark:bg-yellow-900/30',
    4: 'bg-green-100 dark:bg-green-900/30',
    5: 'bg-emerald-100 dark:bg-emerald-900/30',
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-medium',
      sizeClasses[size],
      bgColors[mood]
    )}>
      <span>{MOOD_EMOJIS[mood]}</span>
      {showLabel && (
        <span className="text-xs">{MOOD_LABELS[mood]}</span>
      )}
    </span>
  )
}

// Weekly mood display
export function MoodWeekView({
  moods,
  onSelectDay,
}: {
  moods: { date: string; value: 1 | 2 | 3 | 4 | 5 }[]
  onSelectDay?: (date: string) => void
}) {
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
  
  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  return (
    <div className="flex items-center justify-between gap-1">
      {last7Days.map((date, index) => {
        const mood = moods.find(m => m.date === date)
        const isToday = date === new Date().toISOString().split('T')[0]
        
        return (
          <motion.button
            key={date}
            onClick={() => onSelectDay?.(date)}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-lg transition-colors',
              isToday ? 'bg-primary/10' : 'hover:bg-accent/50',
              onSelectDay && 'cursor-pointer'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-xs text-muted-foreground">{days[index]}</span>
            <span className="text-xl">
              {mood ? MOOD_EMOJIS[mood.value] : '○'}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

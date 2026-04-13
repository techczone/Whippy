'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Award, Shield, ChevronRight, AlertTriangle, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useStreaks, StreakData, GlobalStreak } from '@/hooks/use-streaks'
import Link from 'next/link'

interface StreakCardProps {
  language?: 'tr' | 'en'
  showTopStreaks?: boolean
  showAtRisk?: boolean
  compact?: boolean
}

export function StreakCard({ 
  language = 'tr', 
  showTopStreaks = true,
  showAtRisk = true,
  compact = false 
}: StreakCardProps) {
  const { 
    loading, 
    globalStreak, 
    topStreaks, 
    habitsAtRisk,
    getNextMilestone,
    getRecentMilestone,
  } = useStreaks()

  const [showCelebration, setShowCelebration] = useState(false)

  const t = {
    title: language === 'tr' ? 'Seri Durumu' : 'Streak Status',
    currentStreak: language === 'tr' ? 'Mevcut Seri' : 'Current Streak',
    longestStreak: language === 'tr' ? 'En Uzun' : 'Longest',
    days: language === 'tr' ? 'gün' : 'days',
    day: language === 'tr' ? 'gün' : 'day',
    topStreaks: language === 'tr' ? 'En İyi Seriler' : 'Top Streaks',
    atRisk: language === 'tr' ? 'Risk Altında!' : 'At Risk!',
    noStreak: language === 'tr' ? 'Henüz seri yok' : 'No streaks yet',
    keepGoing: language === 'tr' ? 'Devam et!' : 'Keep going!',
    nextMilestone: language === 'tr' ? 'Sonraki hedef' : 'Next milestone',
    freezeAvailable: language === 'tr' ? 'Dondurma hakkın var' : 'Freeze available',
    viewAll: language === 'tr' ? 'Tümünü Gör' : 'View All',
  }

  const nextMilestone = getNextMilestone(globalStreak.currentStreak)
  const recentMilestone = getRecentMilestone(globalStreak.currentStreak)

  // Celebration effect when hitting milestone
  useEffect(() => {
    if (recentMilestone && globalStreak.currentStreak === recentMilestone.days) {
      setShowCelebration(true)
      const timer = setTimeout(() => setShowCelebration(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [globalStreak.currentStreak, recentMilestone])

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="pt-6">
          <div className="h-24 bg-muted rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "relative overflow-hidden",
      globalStreak.currentStreak > 0 && "bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/30"
    )}>
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && recentMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 bg-gradient-to-br from-orange-500/90 to-amber-500/90 flex flex-col items-center justify-center z-10"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 3 }}
            >
              <span className="text-6xl">{recentMilestone.emoji}</span>
            </motion.div>
            <p className="text-white text-xl font-bold mt-2">{recentMilestone.title}!</p>
            <p className="text-white/80">{recentMilestone.days} {t.days}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <CardHeader className={cn("pb-2", compact && "pb-1")}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={globalStreak.currentStreak > 0 ? { 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0]
              } : {}}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <Flame className={cn(
                "w-5 h-5",
                globalStreak.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"
              )} />
            </motion.div>
            <span className="text-lg">{t.title}</span>
          </div>
          {!compact && (
            <Link href="/habits">
              <Button variant="ghost" size="sm">
                {t.viewAll} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main streak display */}
        <div className="flex items-center gap-4">
          <motion.div 
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center",
              globalStreak.currentStreak > 0 
                ? "bg-gradient-to-br from-orange-500 to-amber-500" 
                : "bg-muted"
            )}
            animate={globalStreak.currentStreak > 0 ? {
              boxShadow: [
                "0 0 0 0 rgba(249, 115, 22, 0)",
                "0 0 20px 10px rgba(249, 115, 22, 0.3)",
                "0 0 0 0 rgba(249, 115, 22, 0)"
              ]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-3xl font-bold text-white">
              {globalStreak.currentStreak}
            </span>
          </motion.div>
          
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{t.currentStreak}</p>
            <p className="text-2xl font-bold">
              {globalStreak.currentStreak} {globalStreak.currentStreak === 1 ? t.day : t.days}
            </p>
            {nextMilestone && globalStreak.currentStreak > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {t.nextMilestone}: {nextMilestone.emoji} {nextMilestone.days} {t.days}
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">{t.longestStreak}</p>
            <p className="text-lg font-semibold flex items-center gap-1">
              <Award className="w-4 h-4 text-yellow-500" />
              {globalStreak.longestStreak}
            </p>
          </div>
        </div>

        {/* Progress to next milestone */}
        {nextMilestone && globalStreak.currentStreak > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{recentMilestone?.emoji} {recentMilestone?.days || 0}</span>
              <span>{nextMilestone.emoji} {nextMilestone.days}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min(100, ((globalStreak.currentStreak - (recentMilestone?.days || 0)) / (nextMilestone.days - (recentMilestone?.days || 0))) * 100)}%` 
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Freeze status */}
        {globalStreak.freezesAvailable > 0 && globalStreak.currentStreak > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <Shield className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-blue-600 dark:text-blue-400">
              {t.freezeAvailable} ({globalStreak.freezesAvailable})
            </span>
          </div>
        )}

        {/* Top streaks by habit */}
        {showTopStreaks && topStreaks.length > 0 && !compact && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-medium text-muted-foreground">{t.topStreaks}</p>
            {topStreaks.slice(0, 3).map((streak, idx) => (
              <motion.div 
                key={streak.habitId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{streak.habitEmoji}</span>
                  <span className="text-sm truncate max-w-[120px]">{streak.habitName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className={cn(
                    "text-sm font-medium",
                    streak.currentStreak >= 7 && "text-orange-500"
                  )}>
                    {streak.currentStreak} {t.days}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* At risk habits */}
        {showAtRisk && habitsAtRisk.length > 0 && !compact && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>{t.atRisk}</span>
            </div>
            {habitsAtRisk.slice(0, 2).map((streak) => (
              <div key={streak.habitId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>{streak.habitEmoji}</span>
                  <span className="truncate max-w-[120px]">{streak.habitName}</span>
                </div>
                <span className="text-amber-600 dark:text-amber-400">
                  {streak.currentStreak} {t.days}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* No streak message */}
        {globalStreak.currentStreak === 0 && topStreaks.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-2">
            {t.noStreak}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Mini streak badge for habit cards
export function StreakBadge({ 
  streak, 
  size = 'sm' 
}: { 
  streak: number
  size?: 'xs' | 'sm' | 'md' 
}) {
  if (streak <= 0) return null

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        streak >= 30 ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white" :
        streak >= 7 ? "bg-orange-500/20 text-orange-600 dark:text-orange-400" :
        "bg-muted text-muted-foreground",
        sizeClasses[size]
      )}
    >
      <Flame className={cn(
        size === 'xs' ? 'w-2.5 h-2.5' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
      )} />
      <span>{streak}</span>
    </motion.div>
  )
}

// Streak flame animation component
export function StreakFlame({ streak, size = 'md' }: { streak: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xl',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-4xl',
  }

  const intensity = Math.min(streak / 30, 1) // Max intensity at 30 days

  return (
    <motion.div
      className={cn(
        "rounded-full flex items-center justify-center relative",
        sizeClasses[size],
        streak > 0 ? "bg-gradient-to-br from-orange-500 to-amber-500" : "bg-muted"
      )}
      animate={streak > 0 ? {
        scale: [1, 1.05, 1],
        boxShadow: [
          `0 0 0 0 rgba(249, 115, 22, 0)`,
          `0 0 ${20 * intensity}px ${10 * intensity}px rgba(249, 115, 22, ${0.3 * intensity})`,
          `0 0 0 0 rgba(249, 115, 22, 0)`
        ]
      } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <motion.span
        animate={streak > 0 ? {
          rotate: [-3, 3, -3],
          y: [-1, 1, -1],
        } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        🔥
      </motion.span>
      {streak > 0 && (
        <motion.span
          className="absolute -bottom-1 -right-1 bg-background rounded-full px-1.5 text-xs font-bold border-2 border-orange-500"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {streak}
        </motion.span>
      )}
    </motion.div>
  )
}

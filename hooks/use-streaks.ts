'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

export interface StreakData {
  habitId: string
  habitName: string
  habitEmoji: string
  currentStreak: number
  longestStreak: number
  lastCompletedDate: string | null
  isActiveToday: boolean
}

export interface GlobalStreak {
  currentStreak: number
  longestStreak: number
  totalCompletedDays: number
  freezesAvailable: number
  freezesUsed: number
  lastFreezeDate: string | null
}

export interface StreakMilestone {
  days: number
  title: string
  emoji: string
  achieved: boolean
}

const MILESTONES = [
  { days: 3, title: 'Getting Started', emoji: '🌱' },
  { days: 7, title: 'One Week', emoji: '⭐' },
  { days: 14, title: 'Two Weeks', emoji: '🔥' },
  { days: 21, title: 'Habit Formed', emoji: '💪' },
  { days: 30, title: 'One Month', emoji: '🏆' },
  { days: 60, title: 'Two Months', emoji: '💎' },
  { days: 90, title: 'Three Months', emoji: '👑' },
  { days: 100, title: 'Century', emoji: '🎯' },
  { days: 180, title: 'Half Year', emoji: '🚀' },
  { days: 365, title: 'One Year', emoji: '🏅' },
]

export function useStreaks() {
  const { user } = useAuth()
  const userId = user?.id
  
  const [loading, setLoading] = useState(true)
  const [habits, setHabits] = useState<any[]>([])
  const [habitLogs, setHabitLogs] = useState<any[]>([])
  const [streakFreezes, setStreakFreezes] = useState<any[]>([])
  
  const supabase = useMemo(() => createClient(), [])

  // Fetch data
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      
      // Get last 365 days of data
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 365)
      const startDateStr = startDate.toISOString().split('T')[0]

      try {
        const [habitsRes, logsRes] = await Promise.all([
          supabase.from('habits').select('*').eq('user_id', userId).eq('archived', false),
          supabase.from('habit_logs').select('*').eq('user_id', userId).gte('date', startDateStr).order('date', { ascending: false }),
        ])

        setHabits(habitsRes.data || [])
        setHabitLogs(logsRes.data || [])
      } catch (err) {
        console.error('Error fetching streak data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, supabase])

  // Calculate streak for a single habit
  const calculateHabitStreak = useCallback((habitId: string): StreakData => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) {
      return {
        habitId,
        habitName: '',
        habitEmoji: '✅',
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
        isActiveToday: false,
      }
    }

    const habitLogsFiltered = habitLogs.filter(l => l.habit_id === habitId && l.completed)
    const completedDates = [...new Set(habitLogsFiltered.map(l => l.date))].sort().reverse()
    
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    
    const isActiveToday = completedDates.includes(today)
    const lastCompletedDate = completedDates[0] || null

    // Calculate current streak
    let currentStreak = 0
    let checkDate = isActiveToday ? today : yesterday
    
    for (let i = 0; i < 365; i++) {
      if (completedDates.includes(checkDate)) {
        currentStreak++
        const prevDate = new Date(checkDate)
        prevDate.setDate(prevDate.getDate() - 1)
        checkDate = prevDate.toISOString().split('T')[0]
      } else {
        break
      }
    }

    // If not completed today and not yesterday, streak is 0
    if (!isActiveToday && !completedDates.includes(yesterday)) {
      currentStreak = 0
    }

    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 0
    let prevDateStr = ''

    for (const dateStr of [...completedDates].sort()) {
      if (prevDateStr) {
        const prevDate = new Date(prevDateStr)
        const currDate = new Date(dateStr)
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000)
        
        if (diffDays === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      } else {
        tempStreak = 1
      }
      prevDateStr = dateStr
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    return {
      habitId,
      habitName: habit.name,
      habitEmoji: habit.emoji || '✅',
      currentStreak,
      longestStreak,
      lastCompletedDate,
      isActiveToday,
    }
  }, [habits, habitLogs])

  // Calculate all habit streaks
  const habitStreaks = useMemo((): StreakData[] => {
    return habits.map(h => calculateHabitStreak(h.id))
  }, [habits, calculateHabitStreak])

  // Calculate global streak (based on completing at least 50% of habits)
  const globalStreak = useMemo((): GlobalStreak => {
    if (habits.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalCompletedDays: 0,
        freezesAvailable: 1,
        freezesUsed: 0,
        lastFreezeDate: null,
      }
    }

    const threshold = Math.max(1, Math.ceil(habits.length * 0.5)) // At least 50%
    const today = new Date().toISOString().split('T')[0]
    
    // Group logs by date
    const logsByDate: Record<string, number> = {}
    habitLogs.filter(l => l.completed).forEach(log => {
      logsByDate[log.date] = (logsByDate[log.date] || 0) + 1
    })

    // Get all dates where threshold was met
    const successDates = Object.entries(logsByDate)
      .filter(([_, count]) => count >= threshold)
      .map(([date]) => date)
      .sort()
      .reverse()

    const totalCompletedDays = successDates.length

    // Calculate current streak
    let currentStreak = 0
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const isActiveToday = successDates.includes(today)
    let checkDate = isActiveToday ? today : yesterday

    for (let i = 0; i < 365; i++) {
      if (successDates.includes(checkDate)) {
        currentStreak++
        const prevDate = new Date(checkDate)
        prevDate.setDate(prevDate.getDate() - 1)
        checkDate = prevDate.toISOString().split('T')[0]
      } else {
        break
      }
    }

    if (!isActiveToday && !successDates.includes(yesterday)) {
      currentStreak = 0
    }

    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 0
    let prevDateStr = ''

    for (const dateStr of [...successDates].sort()) {
      if (prevDateStr) {
        const prevDate = new Date(prevDateStr)
        const currDate = new Date(dateStr)
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000)
        
        if (diffDays === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      } else {
        tempStreak = 1
      }
      prevDateStr = dateStr
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    return {
      currentStreak,
      longestStreak,
      totalCompletedDays,
      freezesAvailable: 1, // 1 free freeze per week
      freezesUsed: streakFreezes.length,
      lastFreezeDate: streakFreezes[0]?.date || null,
    }
  }, [habits, habitLogs, streakFreezes])

  // Get milestones for a streak
  const getMilestones = useCallback((streak: number): StreakMilestone[] => {
    return MILESTONES.map(m => ({
      ...m,
      achieved: streak >= m.days,
    }))
  }, [])

  // Get next milestone
  const getNextMilestone = useCallback((streak: number): StreakMilestone | null => {
    const next = MILESTONES.find(m => m.days > streak)
    return next ? { ...next, achieved: false } : null
  }, [])

  // Get recently achieved milestone
  const getRecentMilestone = useCallback((streak: number): StreakMilestone | null => {
    const achieved = MILESTONES.filter(m => m.days <= streak)
    return achieved.length > 0 ? { ...achieved[achieved.length - 1], achieved: true } : null
  }, [])

  // Top streaks (sorted by current streak)
  const topStreaks = useMemo((): StreakData[] => {
    return [...habitStreaks]
      .filter(s => s.currentStreak > 0)
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, 5)
  }, [habitStreaks])

  // Habits at risk (not completed today, has streak)
  const habitsAtRisk = useMemo((): StreakData[] => {
    return habitStreaks
      .filter(s => !s.isActiveToday && s.currentStreak > 0)
      .sort((a, b) => b.currentStreak - a.currentStreak)
  }, [habitStreaks])

  // Use streak freeze
  const useFreeze = useCallback(async (): Promise<boolean> => {
    // In a real app, this would save to database
    // For now, just return success
    console.log('Streak freeze used')
    return true
  }, [])

  return {
    loading,
    habitStreaks,
    globalStreak,
    topStreaks,
    habitsAtRisk,
    getMilestones,
    getNextMilestone,
    getRecentMilestone,
    calculateHabitStreak,
    useFreeze,
  }
}

'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'
import type { Habit, HabitLog } from '@/types'
import toast from 'react-hot-toast'

export function useHabits() {
  const { user } = useAuth()
  const userId = user?.id

  const [habits, setHabits] = useState<Habit[]>([])
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => createClient(), [])
  const today = new Date().toISOString().split('T')[0]

  // Fetch habits and today's logs
  const fetchData = useCallback(async () => {
    if (!userId) {
      setHabits([])
      setTodayLogs([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Fetch habits
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('archived', false)
        .order('created_at', { ascending: false })

      if (habitsError) {
        console.error('Habits fetch error:', habitsError)
      }

      // Fetch today's logs - try different date formats
      const { data: logsData, error: logsError } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('completed_at', `${today}T00:00:00.000Z`)
        .lte('completed_at', `${today}T23:59:59.999Z`)

      if (logsError) {
        console.error('Logs fetch error:', logsError)
      }

      setHabits(habitsData || [])
      setTodayLogs(logsData || [])
    } catch (err) {
      console.error('Error fetching habits:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, supabase, today])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Add habit
  const addHabit = useCallback(async (habit: {
    name: string
    icon: string
    color: string
    frequency?: string
    target_days?: number[]
  }) => {
    if (!userId) {
      toast.error('Giriş yapmalısınız')
      return null
    }

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const tempHabit: Habit = {
      id: tempId,
      user_id: userId,
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      frequency: habit.frequency || 'daily',
      target_days: habit.target_days || [0, 1, 2, 3, 4, 5, 6],
      streak: 0,
      best_streak: 0,
      archived: false,
      created_at: new Date().toISOString(),
    }
    setHabits(prev => [tempHabit, ...prev])

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: userId,
          name: habit.name,
          icon: habit.icon,
          color: habit.color,
          frequency: habit.frequency || 'daily',
          target_days: habit.target_days || [0, 1, 2, 3, 4, 5, 6],
          streak: 0,
          best_streak: 0,
          archived: false,
        })
        .select()
        .single()

      if (error) throw error
      
      setHabits(prev => prev.map(h => h.id === tempId ? data : h))
      return data
    } catch (err) {
      setHabits(prev => prev.filter(h => h.id !== tempId))
      console.error('Error adding habit:', err)
      toast.error('Alışkanlık eklenemedi')
      return null
    }
  }, [userId, supabase])

  // Toggle habit (complete/uncomplete for today)
  const toggleHabit = useCallback(async (habitId: string) => {
    if (!userId) {
      toast.error('Giriş yapmalısınız')
      return
    }

    const existingLog = todayLogs.find(l => l.habit_id === habitId)

    try {
      if (existingLog) {
        // Remove log (uncomplete)
        const { error } = await supabase
          .from('habit_logs')
          .delete()
          .eq('id', existingLog.id)

        if (error) throw error

        setTodayLogs(prev => prev.filter(l => l.id !== existingLog.id))
      } else {
        // Add log (complete)
        const newLog = {
          habit_id: habitId,
          user_id: userId,
          completed_at: new Date().toISOString(),
          completed: true,
          date: today,
        }

        const { data, error } = await supabase
          .from('habit_logs')
          .insert(newLog)
          .select()
          .single()

        if (error) {
          console.error('Toggle error details:', error)
          throw error
        }
        
        setTodayLogs(prev => [...prev, data])
        toast.success('Tebrikler! 🎉')
      }
    } catch (err: any) {
      console.error('Error toggling habit:', err)
      toast.error(err?.message || 'Bir hata oluştu')
    }
  }, [userId, supabase, todayLogs, today])

  // Delete habit (archive)
  const deleteHabit = useCallback(async (id: string) => {
    if (!userId) return

    const prevHabits = [...habits]
    setHabits(prev => prev.filter(h => h.id !== id))

    try {
      const { error } = await supabase
        .from('habits')
        .update({ archived: true })
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
    } catch (err) {
      setHabits(prevHabits)
      console.error('Error deleting habit:', err)
      toast.error('Silme başarısız')
    }
  }, [userId, supabase, habits])

  return {
    habits,
    todayLogs,
    loading,
    addHabit,
    toggleHabit,
    deleteHabit,
    refetch: fetchData,
  }
}

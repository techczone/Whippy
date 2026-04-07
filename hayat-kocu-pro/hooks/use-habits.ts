'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Habit, HabitLog } from '@/types'
import toast from 'react-hot-toast'

const supabase = createClient()

// ============================================
// HABITS HOOK
// ============================================

export function useHabits(userId: string | undefined) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch habits
  const fetchHabits = useCallback(async () => {
    if (!userId) {
      setHabits([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('archived', false)
        .order('sort_order', { ascending: true })

      if (error) throw error
      setHabits(data || [])
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching habits:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  // Add habit
  const addHabit = async (habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'streak' | 'best_streak'>) => {
    if (!userId) return null

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          ...habit,
          user_id: userId,
          streak: 0,
          best_streak: 0,
        })
        .select()
        .single()

      if (error) throw error
      
      setHabits(prev => [...prev, data])
      toast.success('Alışkanlık eklendi!')
      return data
    } catch (err) {
      console.error('Error adding habit:', err)
      toast.error('Alışkanlık eklenemedi')
      return null
    }
  }

  // Update habit
  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setHabits(prev => prev.map(h => h.id === id ? data : h))
      return data
    } catch (err) {
      console.error('Error updating habit:', err)
      toast.error('Güncelleme başarısız')
      return null
    }
  }

  // Delete habit (archive)
  const deleteHabit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .update({ archived: true })
        .eq('id', id)

      if (error) throw error
      
      setHabits(prev => prev.filter(h => h.id !== id))
      toast.success('Alışkanlık silindi')
    } catch (err) {
      console.error('Error deleting habit:', err)
      toast.error('Silme başarısız')
    }
  }

  return {
    habits,
    loading,
    error,
    addHabit,
    updateHabit,
    deleteHabit,
    refetch: fetchHabits,
  }
}

// ============================================
// HABIT LOGS HOOK
// ============================================

export function useHabitLogs(userId: string | undefined, date?: string) {
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)

  const today = date || new Date().toISOString().split('T')[0]

  // Fetch logs for today
  const fetchLogs = useCallback(async () => {
    if (!userId) {
      setLogs([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)

      if (error) throw error
      setLogs(data || [])
    } catch (err) {
      console.error('Error fetching habit logs:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, today])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Toggle habit completion
  const toggleHabit = async (habitId: string) => {
    if (!userId) return

    const existingLog = logs.find(l => l.habit_id === habitId)

    try {
      if (existingLog) {
        // Update existing log
        const { data, error } = await supabase
          .from('habit_logs')
          .update({ 
            completed: !existingLog.completed,
            completed_at: !existingLog.completed ? new Date().toISOString() : null
          })
          .eq('id', existingLog.id)
          .select()
          .single()

        if (error) throw error
        
        setLogs(prev => prev.map(l => l.id === existingLog.id ? data : l))
        
        if (data.completed) {
          toast.success('Tebrikler! 🎉')
        }
      } else {
        // Create new log
        const { data, error } = await supabase
          .from('habit_logs')
          .insert({
            habit_id: habitId,
            user_id: userId,
            date: today,
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error
        
        setLogs(prev => [...prev, data])
        toast.success('Tebrikler! 🎉')
      }
    } catch (err) {
      console.error('Error toggling habit:', err)
      toast.error('Bir hata oluştu')
    }
  }

  // Check if habit is completed today
  const isCompleted = (habitId: string) => {
    const log = logs.find(l => l.habit_id === habitId)
    return log?.completed || false
  }

  return {
    logs,
    loading,
    toggleHabit,
    isCompleted,
    refetch: fetchLogs,
  }
}

// ============================================
// COMBINED HABITS WITH TODAY STATUS
// ============================================

export function useHabitsWithStatus(userId: string | undefined) {
  const { habits, loading: habitsLoading, addHabit, updateHabit, deleteHabit } = useHabits(userId)
  const { logs, loading: logsLoading, toggleHabit, isCompleted } = useHabitLogs(userId)

  const habitsWithStatus = habits.map(habit => ({
    ...habit,
    completedToday: isCompleted(habit.id),
  }))

  const completedCount = habitsWithStatus.filter(h => h.completedToday).length
  const totalCount = habitsWithStatus.length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return {
    habits: habitsWithStatus,
    loading: habitsLoading || logsLoading,
    completedCount,
    totalCount,
    completionRate,
    toggleHabit,
    addHabit,
    updateHabit,
    deleteHabit,
  }
}

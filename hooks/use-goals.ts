'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Goal } from '@/types'
import toast from 'react-hot-toast'

export function useGoals(userId: string | undefined) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const supabase = useMemo(() => createClient(), [])

  // Fetch goals
  const fetchGoals = useCallback(async () => {
    if (!userId) {
      setGoals([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching goals:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  // Add goal
  const addGoal = async (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_value' | 'status'>) => {
    if (!userId) return null

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goal,
          user_id: userId,
          current_value: 0,
          status: 'active',
        })
        .select()
        .single()

      if (error) throw error
      
      setGoals(prev => [data, ...prev])
      toast.success('Hedef eklendi!')
      return data
    } catch (err) {
      console.error('Error adding goal:', err)
      toast.error('Hedef eklenemedi')
      return null
    }
  }

  // Update goal
  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    // Optimistic update
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g))
    
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setGoals(prev => prev.map(g => g.id === id ? data : g))
      return data
    } catch (err) {
      console.error('Error updating goal:', err)
      toast.error('Güncelleme başarısız')
      fetchGoals() // Rollback
      return null
    }
  }

  // Update progress
  const updateProgress = async (id: string, value: number) => {
    const goal = goals.find(g => g.id === id)
    if (!goal) return

    const newValue = Math.min(goal.target_value, Math.max(0, value))
    const newStatus = newValue >= goal.target_value ? 'completed' : 'active'
    
    await updateGoal(id, { 
      current_value: newValue,
      status: newStatus 
    })

    if (newStatus === 'completed' && goal.status !== 'completed') {
      toast.success('🎉 Hedef tamamlandı!')
    }
  }

  // Delete goal
  const deleteGoal = async (id: string) => {
    // Optimistic update
    setGoals(prev => prev.filter(g => g.id !== id))
    
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast.success('Hedef silindi')
    } catch (err) {
      console.error('Error deleting goal:', err)
      toast.error('Silme başarısız')
      fetchGoals() // Rollback
    }
  }

  // Stats
  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')
  const avgProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + (g.current_value / g.target_value) * 100, 0) / goals.length)
    : 0

  return {
    goals,
    loading,
    error,
    activeCount: activeGoals.length,
    completedCount: completedGoals.length,
    avgProgress,
    addGoal,
    updateGoal,
    updateProgress,
    deleteGoal,
    refetch: fetchGoals,
  }
}

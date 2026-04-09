'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'
import type { Goal } from '@/types'

export function useGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = useMemo(() => createClient(), [])

  // Fetch goals
  useEffect(() => {
    if (!user?.id) {
      setGoals([])
      setLoading(false)
      return
    }

    const fetchGoals = async () => {
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setGoals(data || [])
      } catch (err) {
        console.error('Error fetching goals:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGoals()
  }, [user?.id, supabase])

  // Add goal
  const addGoal = useCallback(async (goalData: {
    title: string
    description?: string
    target_value: number
    current_value?: number
    unit: string
    deadline?: string
    category: string
  }) => {
    if (!user?.id) return null

    const newGoal = {
      user_id: user.id,
      title: goalData.title,
      description: goalData.description || null,
      target_value: goalData.target_value,
      current_value: goalData.current_value || 0,
      unit: goalData.unit,
      deadline: goalData.deadline || null,
      category: goalData.category,
      status: 'active',
    }

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const optimisticGoal = { ...newGoal, id: tempId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Goal
    setGoals(prev => [optimisticGoal, ...prev])

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert(newGoal)
        .select()
        .single()

      if (error) throw error

      // Replace temp with real
      setGoals(prev => prev.map(g => g.id === tempId ? data : g))
      return data
    } catch (err) {
      // Rollback
      setGoals(prev => prev.filter(g => g.id !== tempId))
      console.error('Error adding goal:', err)
      return null
    }
  }, [user?.id, supabase])

  // Update goal
  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    if (!user?.id) return false

    const prevGoals = [...goals]
    
    // Optimistic update
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g))

    try {
      const { error } = await supabase
        .from('goals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      return true
    } catch (err) {
      // Rollback
      setGoals(prevGoals)
      console.error('Error updating goal:', err)
      return false
    }
  }, [user?.id, supabase, goals])

  // Delete goal
  const deleteGoal = useCallback(async (id: string) => {
    if (!user?.id) return false

    const prevGoals = [...goals]
    
    // Optimistic update
    setGoals(prev => prev.filter(g => g.id !== id))

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      return true
    } catch (err) {
      // Rollback
      setGoals(prevGoals)
      console.error('Error deleting goal:', err)
      return false
    }
  }, [user?.id, supabase, goals])

  // Update progress
  const updateProgress = useCallback(async (id: string, currentValue: number) => {
    const goal = goals.find(g => g.id === id)
    if (!goal) return false

    const newStatus = currentValue >= goal.target_value ? 'completed' : 'active'
    return updateGoal(id, { current_value: currentValue, status: newStatus })
  }, [goals, updateGoal])

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    updateProgress,
  }
}

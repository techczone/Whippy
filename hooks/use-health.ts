'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'
import type { HealthEntry } from '@/types'

export function useHealth() {
  const { user } = useAuth()
  const [healthEntries, setHealthEntries] = useState<HealthEntry[]>([])
  const [todayHealth, setTodayHealth] = useState<HealthEntry | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = useMemo(() => createClient(), [])
  const today = new Date().toISOString().split('T')[0]

  // Fetch health entries
  useEffect(() => {
    if (!user?.id) {
      setHealthEntries([])
      setTodayHealth(null)
      setLoading(false)
      return
    }

    const fetchHealth = async () => {
      try {
        const { data, error } = await supabase
          .from('health_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(30)

        if (error) throw error
        
        setHealthEntries(data || [])
        
        // Find today's entry
        const todayEntry = (data || []).find(e => e.date === today)
        setTodayHealth(todayEntry || null)
      } catch (err) {
        console.error('Error fetching health:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHealth()
  }, [user?.id, supabase, today])

  // Update today's health
  const updateHealth = useCallback(async (updates: Partial<HealthEntry>) => {
    if (!user?.id) return false

    const prevHealth = todayHealth

    // Optimistic update
    const newHealth = {
      ...todayHealth,
      ...updates,
      user_id: user.id,
      date: today,
    } as HealthEntry
    
    setTodayHealth(newHealth)

    try {
      // Check if entry exists
      const { data: existing } = await supabase
        .from('health_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (existing) {
        // Update
        const { error } = await supabase
          .from('health_entries')
          .update(updates)
          .eq('id', existing.id)

        if (error) throw error
      } else {
        // Insert
        const { data, error } = await supabase
          .from('health_entries')
          .insert({
            user_id: user.id,
            date: today,
            ...updates,
          })
          .select()
          .single()

        if (error) throw error
        setTodayHealth(data)
      }

      return true
    } catch (err) {
      // Rollback
      setTodayHealth(prevHealth)
      console.error('Error updating health:', err)
      return false
    }
  }, [user?.id, supabase, today, todayHealth])

  // Increment/decrement a metric
  const adjustMetric = useCallback(async (
    metric: 'water_liters' | 'sleep_hours' | 'exercise_minutes' | 'calories' | 'steps',
    amount: number
  ) => {
    const currentValue = (todayHealth?.[metric] as number) || 0
    const newValue = Math.max(0, currentValue + amount)
    return updateHealth({ [metric]: newValue })
  }, [todayHealth, updateHealth])

  return {
    healthEntries,
    todayHealth,
    loading,
    updateHealth,
    adjustMetric,
  }
}

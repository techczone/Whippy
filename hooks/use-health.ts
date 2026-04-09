'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { HealthEntry } from '@/types'
import toast from 'react-hot-toast'

export function useHealth(userId: string | undefined) {
  const [todayHealth, setTodayHealth] = useState<Partial<HealthEntry>>({})
  const [weeklyHealth, setWeeklyHealth] = useState<Partial<HealthEntry>[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = useMemo(() => createClient(), [])
  const today = new Date().toISOString().split('T')[0]

  // Fetch today's health data
  const fetchHealth = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Get today's entry
      const { data: todayData } = await supabase
        .from('health_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      if (todayData) {
        setTodayHealth(todayData)
      }

      // Get last 7 days
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]

      const { data: weekData } = await supabase
        .from('health_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('date', weekAgoStr)
        .order('date', { ascending: true })

      if (weekData) {
        setWeeklyHealth(weekData)
      }

    } catch (err) {
      console.error('Error fetching health:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, today, supabase])

  useEffect(() => {
    fetchHealth()
  }, [fetchHealth])

  // Update health entry
  const updateHealth = async (updates: Partial<HealthEntry>) => {
    if (!userId) return

    // Optimistic update
    setTodayHealth(prev => ({ ...prev, ...updates }))

    try {
      // Check if entry exists
      const { data: existing } = await supabase
        .from('health_entries')
        .select('id')
        .eq('user_id', userId)
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
        // Insert new
        const { data, error } = await supabase
          .from('health_entries')
          .insert({
            user_id: userId,
            date: today,
            ...updates,
          })
          .select()
          .single()

        if (error) throw error
        if (data) setTodayHealth(data)
      }
    } catch (err) {
      console.error('Error updating health:', err)
      toast.error('Güncelleme başarısız')
      fetchHealth() // Rollback
    }
  }

  // Calculate scores
  const waterScore = Math.min(100, ((todayHealth.water_liters || 0) / 2.5) * 100)
  const sleepScore = Math.min(100, ((todayHealth.sleep_hours || 0) / 8) * 100)
  const exerciseScore = Math.min(100, ((todayHealth.exercise_minutes || 0) / 60) * 100)
  const stepsScore = Math.min(100, ((todayHealth.steps || 0) / 10000) * 100)
  const overallScore = Math.round((waterScore + sleepScore + exerciseScore + stepsScore) / 4)

  return {
    todayHealth,
    weeklyHealth,
    loading,
    updateHealth,
    waterScore,
    sleepScore,
    exerciseScore,
    stepsScore,
    overallScore,
    refetch: fetchHealth,
  }
}

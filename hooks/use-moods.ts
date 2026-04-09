'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'
import type { MoodEntry } from '@/types'

export function useMoods() {
  const { user } = useAuth()
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = useMemo(() => createClient(), [])
  const today = new Date().toISOString().split('T')[0]

  // Fetch moods
  useEffect(() => {
    if (!user?.id) {
      setMoods([])
      setTodayMood(null)
      setLoading(false)
      return
    }

    const fetchMoods = async () => {
      try {
        const { data, error } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(30)

        if (error) throw error
        
        setMoods(data || [])
        
        // Find today's entry
        const todayEntry = (data || []).find(m => m.date === today)
        setTodayMood(todayEntry || null)
      } catch (err) {
        console.error('Error fetching moods:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMoods()
  }, [user?.id, supabase, today])

  // Add/update today's mood
  const addMood = useCallback(async (value: 1 | 2 | 3 | 4 | 5, note?: string) => {
    if (!user?.id) return false

    const prevMood = todayMood

    // Optimistic update
    const newMood = {
      user_id: user.id,
      date: today,
      value,
      note: note || null,
    } as MoodEntry
    
    setTodayMood(newMood)

    try {
      // Check if entry exists
      const { data: existing } = await supabase
        .from('mood_entries')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (existing) {
        // Update
        const { error } = await supabase
          .from('mood_entries')
          .update({ value, note: note || null })
          .eq('id', existing.id)

        if (error) throw error
      } else {
        // Insert
        const { data, error } = await supabase
          .from('mood_entries')
          .insert({
            user_id: user.id,
            date: today,
            value,
            note: note || null,
          })
          .select()
          .single()

        if (error) throw error
        setTodayMood(data)
        setMoods(prev => [data, ...prev.filter(m => m.date !== today)])
      }

      return true
    } catch (err) {
      // Rollback
      setTodayMood(prevMood)
      console.error('Error adding mood:', err)
      return false
    }
  }, [user?.id, supabase, today, todayMood])

  return {
    moods,
    todayMood,
    loading,
    addMood,
  }
}

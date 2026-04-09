'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MoodEntry } from '@/types'
import toast from 'react-hot-toast'

export function useMoods(userId: string | undefined) {
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [todayMood, setTodayMood] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  
  const supabase = useMemo(() => createClient(), [])
  const today = new Date().toISOString().split('T')[0]

  // Fetch moods
  const fetchMoods = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Get this week's moods
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const weekAgoStr = weekAgo.toISOString().split('T')[0]

      const { data } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('date', weekAgoStr)
        .order('date', { ascending: true })

      if (data) {
        setMoods(data)
        const todayEntry = data.find(m => m.date === today)
        if (todayEntry) {
          setTodayMood(todayEntry.value as 1 | 2 | 3 | 4 | 5)
        }
      }

    } catch (err) {
      console.error('Error fetching moods:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, today, supabase])

  useEffect(() => {
    fetchMoods()
  }, [fetchMoods])

  // Save mood
  const saveMood = async (mood: 1 | 2 | 3 | 4 | 5, note?: string) => {
    if (!userId) return

    // Optimistic update
    setTodayMood(mood)

    try {
      // Check if entry exists
      const { data: existing } = await supabase
        .from('mood_entries')
        .select('id')
        .eq('user_id', userId)
        .eq('date', today)
        .single()

      if (existing) {
        // Update
        await supabase
          .from('mood_entries')
          .update({ value: mood, note })
          .eq('id', existing.id)
      } else {
        // Insert
        const { data } = await supabase
          .from('mood_entries')
          .insert({
            user_id: userId,
            date: today,
            value: mood,
            note,
          })
          .select()
          .single()

        if (data) {
          setMoods(prev => [...prev.filter(m => m.date !== today), data])
        }
      }
    } catch (err) {
      console.error('Error saving mood:', err)
      toast.error('Kaydetme başarısız')
      fetchMoods() // Rollback
    }
  }

  return {
    moods,
    todayMood,
    loading,
    saveMood,
    refetch: fetchMoods,
  }
}

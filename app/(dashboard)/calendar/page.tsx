'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Target,
  Heart,
  Smile
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]

const MOOD_EMOJIS: Record<number, string> = {
  1: '😢',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄'
}

export default function CalendarPage() {
  const { user } = useAuth()
  const userId = user?.id
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate())
  const [loading, setLoading] = useState(true)
  const [monthData, setMonthData] = useState({
    habitLogs: [] as any[],
    habits: [] as any[],
    moodEntries: [] as any[],
    healthEntries: [] as any[],
  })

  const supabase = useMemo(() => createClient(), [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Ayın ilk günü ve toplam gün sayısı
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  // Pazartesi'den başlat (0 = Pazartesi olacak şekilde ayarla)
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  // Fetch month data
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchMonthData = async () => {
      setLoading(true)
      
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${daysInMonth}`

      try {
        const [habitsRes, logsRes, moodRes, healthRes] = await Promise.all([
          supabase.from('habits').select('*').eq('user_id', userId).eq('archived', false),
          supabase.from('habit_logs').select('*').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
          supabase.from('mood_entries').select('*').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
          supabase.from('health_entries').select('*').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
        ])

        setMonthData({
          habits: habitsRes.data || [],
          habitLogs: logsRes.data || [],
          moodEntries: moodRes.data || [],
          healthEntries: healthRes.data || [],
        })
      } catch (err) {
        console.error('Error fetching calendar data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMonthData()
  }, [userId, year, month, daysInMonth, supabase])

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDate(null)
  }

  // Get day status from real data
  const getDayData = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    const dayLogs = monthData.habitLogs.filter(l => l.date === dateStr && l.completed)
    const totalHabits = monthData.habits.length
    const completedCount = dayLogs.length
    
    const mood = monthData.moodEntries.find(m => m.date === dateStr)
    const health = monthData.healthEntries.find(h => h.date === dateStr)
    
    let status = 'none'
    if (totalHabits > 0) {
      const rate = completedCount / totalHabits
      if (rate >= 0.8) status = 'completed'
      else if (rate >= 0.3) status = 'partial'
    }
    
    return {
      status,
      completedCount,
      totalHabits,
      mood: mood?.value,
      health,
    }
  }

  // Selected day details
  const selectedDayData = selectedDate ? getDayData(selectedDate) : null

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Takvim</h1>
          <p className="text-muted-foreground">Günlük aktivitelerini görselleştir</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <CardTitle className="text-xl">
                {MONTHS[month]} {year}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before the 1st */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayData = getDayData(day)
                const today = isToday(day)
                const selected = selectedDate === day
                const future = new Date(year, month, day) > new Date()

                return (
                  <motion.button
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all relative',
                      today && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                      selected && 'bg-primary text-primary-foreground',
                      !selected && dayData.status === 'completed' && 'bg-green-500/20',
                      !selected && dayData.status === 'partial' && 'bg-yellow-500/20',
                      !selected && !today && 'hover:bg-accent',
                      future && 'opacity-40'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className={cn(
                      'text-sm font-medium',
                      selected ? 'text-primary-foreground' : ''
                    )}>
                      {day}
                    </span>
                    {dayData.mood && !selected && (
                      <span className="text-xs">{MOOD_EMOJIS[dayData.mood]}</span>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500/20" />
                <span>Tamamlandı</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500/20" />
                <span>Kısmi</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded ring-2 ring-primary" />
                <span>Bugün</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected day details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {selectedDate ? `${selectedDate} ${MONTHS[month]}` : 'Bir gün seçin'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDayData ? (
                <div className="space-y-4">
                  {/* Habits */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <Target className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Alışkanlıklar</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDayData.completedCount} / {selectedDayData.totalHabits} tamamlandı
                      </p>
                    </div>
                    <span className={cn(
                      'text-lg font-bold',
                      selectedDayData.status === 'completed' ? 'text-green-500' :
                      selectedDayData.status === 'partial' ? 'text-yellow-500' : 'text-muted-foreground'
                    )}>
                      {selectedDayData.totalHabits > 0 
                        ? Math.round((selectedDayData.completedCount / selectedDayData.totalHabits) * 100)
                        : 0}%
                    </span>
                  </div>

                  {/* Mood */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <Smile className="w-5 h-5 text-yellow-500" />
                    <div className="flex-1">
                      <p className="font-medium">Ruh Hali</p>
                    </div>
                    <span className="text-2xl">
                      {selectedDayData.mood ? MOOD_EMOJIS[selectedDayData.mood] : '—'}
                    </span>
                  </div>

                  {/* Health */}
                  {selectedDayData.health && (
                    <div className="p-3 rounded-lg bg-secondary/50 space-y-2">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        <p className="font-medium">Sağlık</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {selectedDayData.health.water_liters && (
                          <div className="flex items-center gap-1">
                            <span>💧</span>
                            <span>{selectedDayData.health.water_liters}L</span>
                          </div>
                        )}
                        {selectedDayData.health.sleep_hours && (
                          <div className="flex items-center gap-1">
                            <span>🌙</span>
                            <span>{selectedDayData.health.sleep_hours}sa</span>
                          </div>
                        )}
                        {selectedDayData.health.exercise_minutes && (
                          <div className="flex items-center gap-1">
                            <span>💪</span>
                            <span>{selectedDayData.health.exercise_minutes}dk</span>
                          </div>
                        )}
                        {selectedDayData.health.steps && (
                          <div className="flex items-center gap-1">
                            <span>👣</span>
                            <span>{selectedDayData.health.steps}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Detayları görmek için takvimden bir gün seçin
                </p>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bu Ay Özet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Kayıtlı gün</span>
                <span className="font-medium">
                  {new Set(monthData.habitLogs.map(l => l.date)).size} gün
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tamamlanan alışkanlık</span>
                <span className="font-medium">
                  {monthData.habitLogs.filter(l => l.completed).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ruh hali girişi</span>
                <span className="font-medium">
                  {monthData.moodEntries.length} gün
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

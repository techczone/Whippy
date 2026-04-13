'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Target,
  Heart,
  Smile,
  Droplets,
  Moon,
  Dumbbell,
  Footprints
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from '@/hooks/use-translation'
import { createClient } from '@/lib/supabase/client'

const DAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const MOOD_EMOJIS: Record<number, string> = { 1: '😢', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' }

export default function CalendarPage() {
  const { user } = useAuth()
  const { language } = useTranslation()
  const userId = user?.id
  
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate())
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [monthData, setMonthData] = useState({
    habitLogs: [] as any[],
    habits: [] as any[],
    moodEntries: [] as any[],
    healthEntries: [] as any[],
  })

  const supabase = useMemo(() => createClient(), [])

  const DAYS = language === 'tr' ? DAYS_TR : DAYS_EN
  const MONTHS = language === 'tr' ? MONTHS_TR : MONTHS_EN

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!userId) { setLoading(false); return }

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

  const prevMonth = () => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDate(null) }
  const nextMonth = () => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDate(null) }
  const goToToday = () => { const today = new Date(); setCurrentDate(today); setSelectedDate(today.getDate()) }

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
      else if (rate > 0) status = 'started'
    }
    
    return { status, completedCount, totalHabits, mood: mood?.value, health, hasData: completedCount > 0 || mood || health }
  }

  const selectedDayData = selectedDate ? getDayData(selectedDate) : null
  const selectedDateStr = selectedDate ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}` : null

  const selectedDayHabits = useMemo(() => {
    if (!selectedDateStr) return []
    return monthData.habits.map(habit => ({
      ...habit,
      completed: !!monthData.habitLogs.find(l => l.habit_id === habit.id && l.date === selectedDateStr && l.completed),
    }))
  }, [monthData.habits, monthData.habitLogs, selectedDateStr])

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const monthStats = useMemo(() => {
    const daysWithData = new Set(monthData.habitLogs.map(l => l.date)).size
    const completedHabits = monthData.habitLogs.filter(l => l.completed).length
    const moodEntries = monthData.moodEntries.length
    const avgMood = moodEntries > 0 ? (monthData.moodEntries.reduce((a, m) => a + m.value, 0) / moodEntries).toFixed(1) : null
    
    let currentStreak = 0
    const today = new Date()
    for (let i = 0; i < daysInMonth; i++) {
      const checkDate = new Date(year, month, today.getDate() - i)
      if (checkDate.getMonth() !== month) break
      const dateStr = checkDate.toISOString().split('T')[0]
      const dayLogs = monthData.habitLogs.filter(l => l.date === dateStr && l.completed)
      if (dayLogs.length > 0 && monthData.habits.length > 0 && dayLogs.length >= monthData.habits.length * 0.5) {
        currentStreak++
      } else if (i > 0) break
    }
    return { daysWithData, completedHabits, moodEntries, avgMood, currentStreak }
  }, [monthData, month, year, daysInMonth])

  if (!mounted) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

  const t = {
    title: language === 'tr' ? 'Takvim' : 'Calendar',
    subtitle: language === 'tr' ? 'Günlük aktivitelerini görselleştir' : 'Visualize your daily activities',
    today: language === 'tr' ? 'Bugün' : 'Today',
    selectDay: language === 'tr' ? 'Bir gün seçin' : 'Select a day',
    habits: language === 'tr' ? 'Alışkanlıklar' : 'Habits',
    mood: language === 'tr' ? 'Ruh Hali' : 'Mood',
    health: language === 'tr' ? 'Sağlık' : 'Health',
    completed: language === 'tr' ? 'Tamamlandı' : 'Completed',
    partial: language === 'tr' ? 'Kısmi' : 'Partial',
    monthSummary: language === 'tr' ? 'Bu Ay' : 'This Month',
    daysLogged: language === 'tr' ? 'Kayıtlı gün' : 'Days logged',
    habitsCompleted: language === 'tr' ? 'Tamamlanan' : 'Completed',
    moodEntries: language === 'tr' ? 'Ruh hali' : 'Mood entries',
    avgMood: language === 'tr' ? 'Ort. ruh hali' : 'Avg mood',
    streak: language === 'tr' ? 'Seri' : 'Streak',
    days: language === 'tr' ? 'gün' : 'days',
    noData: language === 'tr' ? 'Bu gün için veri yok' : 'No data for this day',
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-primary" />
            {t.title}
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>{t.today}</Button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="w-5 h-5" /></Button>
                <CardTitle className="text-xl">{MONTHS[month]} {year}</CardTitle>
                <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="w-5 h-5" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">{day}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDay }).map((_, i) => (<div key={`empty-${i}`} className="aspect-square" />))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayData = getDayData(day)
                  const today = isToday(day)
                  const selected = selectedDate === day
                  const future = new Date(year, month, day) > new Date()

                  return (
                    <motion.button
                      key={day}
                      onClick={() => !future && setSelectedDate(day)}
                      className={cn(
                        'aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all relative',
                        today && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                        selected && 'bg-primary text-primary-foreground',
                        !selected && dayData.status === 'completed' && 'bg-green-500/20 hover:bg-green-500/30',
                        !selected && dayData.status === 'partial' && 'bg-yellow-500/20 hover:bg-yellow-500/30',
                        !selected && dayData.status === 'started' && 'bg-orange-500/10 hover:bg-orange-500/20',
                        !selected && dayData.status === 'none' && 'hover:bg-accent',
                        future && 'opacity-40 cursor-not-allowed'
                      )}
                      whileHover={!future ? { scale: 1.05 } : {}}
                      whileTap={!future ? { scale: 0.95 } : {}}
                    >
                      <span className={cn('text-sm font-medium', selected && 'text-primary-foreground', today && !selected && 'text-primary font-bold')}>{day}</span>
                      {dayData.mood && !selected && <span className="text-[10px]">{MOOD_EMOJIS[dayData.mood]}</span>}
                      {dayData.hasData && !dayData.mood && !selected && <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />}
                    </motion.button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-500/20" /><span>{t.completed}</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-yellow-500/20" /><span>{t.partial}</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded ring-2 ring-primary" /><span>{t.today}</span></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected day */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  {selectedDate ? `${selectedDate} ${MONTHS[month]}` : t.selectDay}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDayData ? (
                  <div className="space-y-3">
                    {/* Habits */}
                    <div className="p-3 rounded-xl bg-secondary/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">{t.habits}</span>
                        </div>
                        <span className={cn('text-sm font-bold',
                          selectedDayData.status === 'completed' ? 'text-green-500' :
                          selectedDayData.status === 'partial' ? 'text-yellow-500' : 'text-muted-foreground'
                        )}>
                          {selectedDayData.completedCount}/{selectedDayData.totalHabits}
                        </span>
                      </div>
                      {selectedDayHabits.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {selectedDayHabits.map(habit => (
                            <div key={habit.id} className="flex items-center gap-2 text-xs">
                              <span className={habit.completed ? 'opacity-100' : 'opacity-40'}>{habit.emoji || '✅'}</span>
                              <span className={cn('truncate', !habit.completed && 'text-muted-foreground line-through')}>{habit.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Mood */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <Smile className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium text-sm">{t.mood}</span>
                      </div>
                      <span className="text-xl">{selectedDayData.mood ? MOOD_EMOJIS[selectedDayData.mood] : '—'}</span>
                    </div>

                    {/* Health */}
                    {selectedDayData.health && (
                      <div className="p-3 rounded-xl bg-secondary/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="font-medium text-sm">{t.health}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedDayData.health.water_liters > 0 && <div className="flex items-center gap-1.5 text-xs"><Droplets className="w-3 h-3 text-blue-500" /><span>{selectedDayData.health.water_liters}L</span></div>}
                          {selectedDayData.health.sleep_hours > 0 && <div className="flex items-center gap-1.5 text-xs"><Moon className="w-3 h-3 text-purple-500" /><span>{selectedDayData.health.sleep_hours}h</span></div>}
                          {selectedDayData.health.exercise_minutes > 0 && <div className="flex items-center gap-1.5 text-xs"><Dumbbell className="w-3 h-3 text-green-500" /><span>{selectedDayData.health.exercise_minutes}m</span></div>}
                          {selectedDayData.health.steps > 0 && <div className="flex items-center gap-1.5 text-xs"><Footprints className="w-3 h-3 text-orange-500" /><span>{selectedDayData.health.steps}</span></div>}
                        </div>
                      </div>
                    )}

                    {!selectedDayData.hasData && <p className="text-xs text-center text-muted-foreground py-2">{t.noData}</p>}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-6 text-sm">{t.selectDay}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Month Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t.monthSummary}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t.daysLogged}</span>
                  <span className="font-medium">{monthStats.daysWithData} {t.days}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t.habitsCompleted}</span>
                  <span className="font-medium">{monthStats.completedHabits}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t.moodEntries}</span>
                  <span className="font-medium">{monthStats.moodEntries} {t.days}</span>
                </div>
                {monthStats.avgMood && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t.avgMood}</span>
                    <span className="font-medium">{MOOD_EMOJIS[Math.round(parseFloat(monthStats.avgMood))]} {monthStats.avgMood}</span>
                  </div>
                )}
                {monthStats.currentStreak > 0 && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">🔥 {t.streak}</span>
                    <span className="font-bold text-orange-500">{monthStats.currentStreak} {t.days}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

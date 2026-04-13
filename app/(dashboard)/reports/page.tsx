'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Target, Heart, Smile, Droplets, Moon, Dumbbell, Flame, Award, Calendar, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from '@/hooks/use-translation'
import { createClient } from '@/lib/supabase/client'

export default function ReportsPage() {
  const { user } = useAuth()
  const { language } = useTranslation()
  const userId = user?.id
  
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState({
    habits: [] as any[],
    habitLogs: [] as any[],
    healthEntries: [] as any[],
    moodEntries: [] as any[],
    goals: [] as any[],
  })

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      
      const daysBack = period === 'week' ? 7 : 30
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysBack)
      const startDateStr = startDate.toISOString().split('T')[0]

      try {
        const [habitsRes, logsRes, healthRes, moodRes, goalsRes] = await Promise.all([
          supabase.from('habits').select('*').eq('user_id', userId).eq('archived', false),
          supabase.from('habit_logs').select('*').eq('user_id', userId).gte('date', startDateStr),
          supabase.from('health_entries').select('*').eq('user_id', userId).gte('date', startDateStr),
          supabase.from('mood_entries').select('*').eq('user_id', userId).gte('date', startDateStr),
          supabase.from('goals').select('*').eq('user_id', userId),
        ])

        setData({
          habits: habitsRes.data || [],
          habitLogs: logsRes.data || [],
          healthEntries: healthRes.data || [],
          moodEntries: moodRes.data || [],
          goals: goalsRes.data || [],
        })
      } catch (err) {
        console.error('Error fetching report data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, period, supabase])

  const stats = useMemo(() => {
    const totalHabits = data.habits.length
    const completedLogs = data.habitLogs.filter(l => l.completed).length
    const daysInPeriod = period === 'week' ? 7 : 30
    const totalPossibleLogs = totalHabits * daysInPeriod
    const habitCompletionRate = totalPossibleLogs > 0 ? Math.round((completedLogs / totalPossibleLogs) * 100) : 0

    const avgWater = data.healthEntries.length > 0
      ? data.healthEntries.reduce((a, e) => a + (e.water_liters || 0), 0) / data.healthEntries.length
      : 0
    const avgSleep = data.healthEntries.length > 0
      ? data.healthEntries.reduce((a, e) => a + (e.sleep_hours || 0), 0) / data.healthEntries.length
      : 0
    const avgExercise = data.healthEntries.length > 0
      ? data.healthEntries.reduce((a, e) => a + (e.exercise_minutes || 0), 0) / data.healthEntries.length
      : 0
    const avgMood = data.moodEntries.length > 0
      ? data.moodEntries.reduce((a, e) => a + (e.value || 3), 0) / data.moodEntries.length
      : 3

    // Streak calculation
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    
    for (let i = 0; i < daysInPeriod; i++) {
      const checkDate = new Date()
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      const dayLogs = data.habitLogs.filter(l => l.date === dateStr && l.completed)
      
      if (dayLogs.length > 0 && totalHabits > 0 && dayLogs.length >= totalHabits * 0.5) {
        tempStreak++
        if (i === 0 || currentStreak > 0) currentStreak = tempStreak
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 0
        if (i === 0) currentStreak = 0
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    // Best day
    const dayStats: Record<string, number> = {}
    data.habitLogs.filter(l => l.completed).forEach(log => {
      const day = new Date(log.date).getDay()
      dayStats[day] = (dayStats[day] || 0) + 1
    })
    const bestDayNum = Object.entries(dayStats).sort((a, b) => b[1] - a[1])[0]?.[0]
    const dayNames = language === 'tr' 
      ? ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const bestDay = bestDayNum ? dayNames[parseInt(bestDayNum)] : '-'

    const healthScore = Math.round(
      (Math.min(avgWater / 2.5, 1) * 25) +
      (avgSleep >= 7 && avgSleep <= 9 ? 25 : Math.min(avgSleep / 8, 1) * 25) +
      (Math.min(avgExercise / 30, 1) * 25) +
      (habitCompletionRate / 100 * 25)
    )

    return {
      habitCompletionRate,
      completedLogs,
      totalHabits,
      avgWater: avgWater.toFixed(1),
      avgSleep: avgSleep.toFixed(1),
      avgExercise: Math.round(avgExercise),
      avgMood: avgMood.toFixed(1),
      healthScore,
      moodScore: Math.round(avgMood * 20),
      overallScore: Math.round((healthScore + habitCompletionRate + avgMood * 20) / 3),
      currentStreak,
      longestStreak,
      bestDay,
    }
  }, [data, period, language])

  const dailyData = useMemo(() => {
    const days = period === 'week' ? 7 : 30
    const result = []
    const dayNamesShort = language === 'tr' 
      ? ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayName = dayNamesShort[date.getDay()]
      const dayNum = date.getDate()
      
      const dayLogs = data.habitLogs.filter(l => l.date === dateStr && l.completed)
      const dayHealth = data.healthEntries.find(e => e.date === dateStr)
      const dayMood = data.moodEntries.find(e => e.date === dateStr)
      
      result.push({
        date: dateStr,
        dayName,
        dayNum,
        habitsCompleted: dayLogs.length,
        totalHabits: data.habits.length,
        completionRate: data.habits.length > 0 ? Math.round((dayLogs.length / data.habits.length) * 100) : 0,
        water: dayHealth?.water_liters || 0,
        sleep: dayHealth?.sleep_hours || 0,
        exercise: dayHealth?.exercise_minutes || 0,
        mood: dayMood?.value || 0,
      })
    }
    return result
  }, [data, period, language])

  const habitStats = useMemo(() => {
    const daysInPeriod = period === 'week' ? 7 : 30
    return data.habits.map(habit => {
      const logs = data.habitLogs.filter(l => l.habit_id === habit.id && l.completed)
      const completionRate = Math.round((logs.length / daysInPeriod) * 100)
      return { ...habit, completedDays: logs.length, completionRate }
    }).sort((a, b) => b.completionRate - a.completionRate)
  }, [data.habits, data.habitLogs, period])

  if (!mounted) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    )
  }

  const t = {
    title: language === 'tr' ? 'Raporlar' : 'Reports',
    subtitle: language === 'tr' ? 'İlerlemenizi takip edin' : 'Track your progress',
    week: language === 'tr' ? 'Hafta' : 'Week',
    month: language === 'tr' ? 'Ay' : 'Month',
  }

  const getMoodEmoji = (v: number) => v >= 4.5 ? '😄' : v >= 3.5 ? '🙂' : v >= 2.5 ? '😐' : v >= 1.5 ? '😔' : '😢'
  const getScoreColor = (s: number) => s >= 80 ? 'text-green-500' : s >= 60 ? 'text-yellow-500' : s >= 40 ? 'text-orange-500' : 'text-red-500'

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            {t.title}
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex bg-secondary rounded-xl p-1">
          {(['week', 'month'] as const).map((p) => (
            <Button key={p} variant={period === p ? 'default' : 'ghost'} size="sm" onClick={() => setPeriod(p)} className={period === p ? 'bg-primary' : ''}>
              {p === 'week' ? t.week : t.month}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Score Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-2">
              <span className={`text-3xl font-bold ${getScoreColor(stats.overallScore)}`}>{stats.overallScore}</span>
            </div>
            <p className="text-sm text-muted-foreground">{language === 'tr' ? 'Genel Skor' : 'Overall'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-2">
              <Target className="w-8 h-8 text-green-500" />
            </div>
            <p className={`text-2xl font-bold ${getScoreColor(stats.habitCompletionRate)}`}>{stats.habitCompletionRate}%</p>
            <p className="text-sm text-muted-foreground">{language === 'tr' ? 'Alışkanlık' : 'Habits'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-2">
              <Heart className="w-8 h-8 text-red-500" />
            </div>
            <p className={`text-2xl font-bold ${getScoreColor(stats.healthScore)}`}>{stats.healthScore}</p>
            <p className="text-sm text-muted-foreground">{language === 'tr' ? 'Sağlık' : 'Health'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center mb-2">
              <span className="text-3xl">{getMoodEmoji(parseFloat(stats.avgMood))}</span>
            </div>
            <p className={`text-2xl font-bold ${getScoreColor(stats.moodScore)}`}>{stats.moodScore}</p>
            <p className="text-sm text-muted-foreground">{language === 'tr' ? 'Ruh Hali' : 'Mood'}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Streak Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{stats.currentStreak}</p>
              <p className="text-xs text-muted-foreground">{language === 'tr' ? 'Seri' : 'Streak'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{stats.longestStreak}</p>
              <p className="text-xs text-muted-foreground">{language === 'tr' ? 'Rekor' : 'Best'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-lg font-bold truncate">{stats.bestDay}</p>
              <p className="text-xs text-muted-foreground">{language === 'tr' ? 'En İyi' : 'Best Day'}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Habit Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-primary" />
                {language === 'tr' ? 'Alışkanlık Tamamlama' : 'Habit Completion'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dailyData.slice(-(period === 'week' ? 7 : 14)).map((day, idx) => (
                  <div key={day.date} className="flex items-center gap-3">
                    <span className="w-10 text-xs text-muted-foreground">{period === 'week' ? day.dayName : day.dayNum}</span>
                    <div className="flex-1 h-7 bg-secondary rounded-full overflow-hidden relative">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${day.completionRate}%` }}
                        transition={{ delay: idx * 0.05, duration: 0.5 }}
                      />
                      {day.completionRate > 0 && (
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">{day.completionRate}%</span>
                      )}
                    </div>
                    <span className="w-10 text-xs text-right text-muted-foreground">{day.habitsCompleted}/{day.totalHabits}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mood Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Smile className="w-5 h-5 text-yellow-500" />
                {language === 'tr' ? 'Ruh Hali Trendi' : 'Mood Trend'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-40 gap-1 md:gap-2">
                {dailyData.slice(-(period === 'week' ? 7 : 14)).map((day, idx) => {
                  const heightPercent = day.mood > 0 ? (day.mood / 5) * 100 : 10
                  const moodColors = ['from-red-500 to-red-400', 'from-orange-500 to-orange-400', 'from-yellow-500 to-yellow-400', 'from-lime-500 to-lime-400', 'from-green-500 to-green-400']
                  const colorClass = day.mood > 0 ? moodColors[Math.min(day.mood - 1, 4)] : 'from-gray-400 to-gray-300'
                  
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div 
                        className={`w-full bg-gradient-to-t ${colorClass} rounded-t-lg relative group cursor-pointer`}
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ delay: idx * 0.05, duration: 0.5 }}
                      >
                        {day.mood > 0 && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-lg">{getMoodEmoji(day.mood)}</span>
                          </div>
                        )}
                      </motion.div>
                      <span className="text-[10px] text-muted-foreground">{period === 'week' ? day.dayName : day.dayNum}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <span>😢 1</span>
                <span>😐 3</span>
                <span>😄 5</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Health */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                {language === 'tr' ? 'Sağlık Ortalamaları' : 'Health Averages'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span>{language === 'tr' ? 'Su' : 'Water'}</span>
                    <span className="font-medium">{stats.avgWater} L</span>
                  </div>
                  <Progress value={Math.min(parseFloat(stats.avgWater) / 2.5 * 100, 100)} className="h-2 mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span>{language === 'tr' ? 'Uyku' : 'Sleep'}</span>
                    <span className="font-medium">{stats.avgSleep} {language === 'tr' ? 'saat' : 'hrs'}</span>
                  </div>
                  <Progress value={Math.min(parseFloat(stats.avgSleep) / 8 * 100, 100)} className="h-2 mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span>{language === 'tr' ? 'Egzersiz' : 'Exercise'}</span>
                    <span className="font-medium">{stats.avgExercise} {language === 'tr' ? 'dk' : 'min'}</span>
                  </div>
                  <Progress value={Math.min(stats.avgExercise / 30 * 100, 100)} className="h-2 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Habit Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                {language === 'tr' ? 'Alışkanlık Performansı' : 'Habit Performance'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {habitStats.length > 0 ? (
                <div className="space-y-3">
                  {habitStats.slice(0, 5).map((habit) => (
                    <div key={habit.id} className="flex items-center gap-3">
                      <span className="text-lg">{habit.emoji || '✅'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-sm truncate">{habit.name}</span>
                          <span className={`text-sm font-medium ${getScoreColor(habit.completionRate)}`}>{habit.completionRate}%</span>
                        </div>
                        <Progress value={habit.completionRate} className="h-1.5 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">{language === 'tr' ? 'Veri yok' : 'No data'}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Insights */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                {language === 'tr' ? 'AI Önerileri' : 'AI Insights'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {stats.habitCompletionRate >= 80 && <p>🎉 {language === 'tr' ? 'Harika! Alışkanlıklarda çok başarılısın!' : 'Amazing habit performance!'}</p>}
              {stats.habitCompletionRate < 50 && stats.habitCompletionRate > 0 && <p>💡 {language === 'tr' ? 'Daha az ama yapılabilir hedefler koy.' : 'Set fewer, achievable goals.'}</p>}
              {parseFloat(stats.avgWater) < 2 && <p>💧 {language === 'tr' ? 'Su tüketimini artır.' : 'Drink more water.'}</p>}
              {parseFloat(stats.avgSleep) < 7 && <p>🌙 {language === 'tr' ? 'Daha fazla uyumaya çalış.' : 'Get more sleep.'}</p>}
              {stats.avgExercise < 20 && <p>💪 {language === 'tr' ? 'Egzersiz süresini artır.' : 'Exercise more.'}</p>}
              {stats.currentStreak >= 7 && <p>🔥 {language === 'tr' ? `${stats.currentStreak} günlük seri!` : `${stats.currentStreak} day streak!`}</p>}
              {stats.overallScore >= 70 && <p>⭐ {language === 'tr' ? 'Genel skorun çok iyi!' : 'Great overall score!'}</p>}
              {stats.totalHabits === 0 && <p>🚀 {language === 'tr' ? 'Alışkanlık ekleyerek başla!' : 'Start by adding habits!'}</p>}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

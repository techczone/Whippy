'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, TrendingDown, Calendar, Sparkles, Target, Heart, Smile } from 'lucide-react'
import { cn, formatDate, getWeekDays } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'

export default function ReportsPage() {
  const { user } = useAuth()
  const userId = user?.id
  
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    habits: [] as any[],
    habitLogs: [] as any[],
    healthEntries: [] as any[],
    moodEntries: [] as any[],
    goals: [] as any[],
  })

  const supabase = useMemo(() => createClient(), [])

  // Fetch all data
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

  // Calculate stats
  const stats = useMemo(() => {
    const totalHabits = data.habits.length
    const completedLogs = data.habitLogs.filter(l => l.completed).length
    const totalPossibleLogs = totalHabits * (period === 'week' ? 7 : 30)
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

    const activeGoals = data.goals.filter(g => g.status === 'active').length
    const completedGoals = data.goals.filter(g => g.status === 'completed').length
    const avgGoalProgress = data.goals.length > 0
      ? data.goals.reduce((a, g) => a + (g.current_value / g.target_value) * 100, 0) / data.goals.length
      : 0

    // Health score
    const healthScore = Math.round(
      (Math.min(avgWater / 2.5, 1) * 25) +
      (avgSleep >= 7 && avgSleep <= 9 ? 25 : (avgSleep / 8) * 25) +
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
      activeGoals,
      completedGoals,
      avgGoalProgress: Math.round(avgGoalProgress),
      healthScore,
      moodScore: Math.round(avgMood * 20),
      overallScore: Math.round((healthScore + habitCompletionRate + avgMood * 20) / 3),
    }
  }, [data, period])

  // Generate daily data for charts
  const dailyData = useMemo(() => {
    const days = period === 'week' ? 7 : 30
    const result = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayName = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][date.getDay()]
      
      const dayLogs = data.habitLogs.filter(l => l.date === dateStr && l.completed)
      const dayHealth = data.healthEntries.find(e => e.date === dateStr)
      const dayMood = data.moodEntries.find(e => e.date === dateStr)
      
      result.push({
        date: dateStr,
        dayName,
        habitsCompleted: dayLogs.length,
        totalHabits: data.habits.length,
        water: dayHealth?.water_liters || 0,
        sleep: dayHealth?.sleep_hours || 0,
        exercise: dayHealth?.exercise_minutes || 0,
        mood: dayMood?.value || 0,
      })
    }
    
    return result
  }, [data, period])

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
          <h1 className="text-2xl md:text-3xl font-bold">Raporlar & Analiz</h1>
          <p className="text-muted-foreground">İlerlemenizi takip edin, örüntüleri keşfedin</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-secondary rounded-lg p-1">
            {(['week', 'month'] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {p === 'week' ? 'Hafta' : 'Ay'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.overallScore}</p>
                <p className="text-xs text-muted-foreground">Genel Skor</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.habitCompletionRate}%</p>
                <p className="text-xs text-muted-foreground">Alışkanlık</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.healthScore}</p>
                <p className="text-xs text-muted-foreground">Sağlık</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Smile className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.moodScore}</p>
                <p className="text-xs text-muted-foreground">Ruh Hali</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Habit Completion Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Alışkanlık Tamamlama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyData.slice(-7).map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="w-8 text-xs text-muted-foreground">{day.dayName}</span>
                  <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ 
                        width: day.totalHabits > 0 
                          ? `${(day.habitsCompleted / day.totalHabits) * 100}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                  <span className="w-12 text-xs text-right">
                    {day.habitsCompleted}/{day.totalHabits}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mood Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-primary" />
              Ruh Hali Trendi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-32 gap-2">
              {dailyData.slice(-7).map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-primary/20 rounded-t transition-all"
                    style={{ height: `${(day.mood / 5) * 100}%` }}
                  >
                    <div 
                      className="w-full h-full bg-primary rounded-t"
                      style={{ opacity: day.mood > 0 ? 1 : 0.2 }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{day.dayName}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Health Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sağlık Ortalamaları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">💧 Su</span>
              <span className="font-medium">{stats.avgWater} L / gün</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">🌙 Uyku</span>
              <span className="font-medium">{stats.avgSleep} saat / gün</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">💪 Egzersiz</span>
              <span className="font-medium">{stats.avgExercise} dk / gün</span>
            </div>
          </CardContent>
        </Card>

        {/* Goals Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hedef Durumu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Aktif Hedefler</span>
              <span className="font-medium">{stats.activeGoals}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tamamlanan</span>
              <span className="font-medium text-green-500">{stats.completedGoals}</span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground">Ort. İlerleme</span>
                <span className="font-medium">{stats.avgGoalProgress}%</span>
              </div>
              <Progress value={stats.avgGoalProgress} />
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              AI Önerileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.habitCompletionRate < 50 && (
              <p className="text-sm">
                💡 Alışkanlık tamamlama oranın düşük. Daha az ama yapılabilir hedefler koy.
              </p>
            )}
            {parseFloat(stats.avgWater) < 2 && (
              <p className="text-sm">
                💧 Su tüketimini artırmayı dene. Günde en az 2L hedefle.
              </p>
            )}
            {parseFloat(stats.avgSleep) < 7 && (
              <p className="text-sm">
                🌙 Uyku süren yetersiz. 7-8 saat uyumayı hedefle.
              </p>
            )}
            {stats.avgExercise < 30 && (
              <p className="text-sm">
                💪 Günlük egzersiz süresini artır. 30 dakika hedefle.
              </p>
            )}
            {stats.overallScore >= 70 && (
              <p className="text-sm">
                🎉 Harika gidiyorsun! Böyle devam et!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  TrendingUp, 
  Target, 
  Heart, 
  Sparkles,
  ChevronRight,
  Flame,
} from 'lucide-react'
import Link from 'next/link'
import { cn, formatDate, getWeekDays } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/dashboard/stat-card'
import { MoodSelector, MoodWeekView } from '@/components/mood/mood-selector'
import { HealthSummaryCard } from '@/components/health/health-tracker'
import { GoalCard, GoalsSummary } from '@/components/goals/goal-card'
import { useAppStore } from '@/lib/store'
import { useHabitsWithStatus } from '@/hooks/use-habits'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import type { Habit, Goal, MoodEntry, HealthEntry } from '@/types'
import confetti from 'canvas-confetti'

export default function DashboardPage() {
  const { user } = useAuth()
  const userId = user?.id

  // Real data from Supabase
  const { habits, completedCount, totalCount, toggleHabit, addHabit } = useHabitsWithStatus(userId)
  
  const [goals, setGoals] = useState<Goal[]>([])
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [health, setHealth] = useState<Partial<HealthEntry>>({})
  const [todayMood, setTodayMood] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const greeting = getGreeting()

  // Fetch goals, moods, health from Supabase
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      const supabase = createClient()
      
      try {
        // Fetch goals
        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .limit(3)

        if (goalsData) setGoals(goalsData)

        // Fetch this week's moods
        const weekStart = getWeekDays()[0].toISOString().split('T')[0]
        const { data: moodsData } = await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', userId)
          .gte('date', weekStart)
          .order('date', { ascending: true })

        if (moodsData) {
          setMoods(moodsData)
          const todayMoodEntry = moodsData.find(m => m.date === todayStr)
          if (todayMoodEntry) {
            setTodayMood(todayMoodEntry.value as 1 | 2 | 3 | 4 | 5)
          }
        }

        // Fetch today's health entry
        const { data: healthData } = await supabase
          .from('health_entries')
          .select('*')
          .eq('user_id', userId)
          .eq('date', todayStr)
          .single()

        if (healthData) setHealth(healthData)

      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, todayStr])

  // Calculate scores
  const productivityScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const healthScore = calculateHealthScore(health)
  const moodScore = todayMood ? todayMood * 20 : 60
  const overallScore = Math.round((productivityScore + healthScore + moodScore) / 3)

  // Handle habit toggle with confetti
  const handleHabitToggle = async (habitId: string, isCompleted: boolean) => {
    if (!isCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
    await toggleHabit(habitId)
  }

  // Handle mood change
  const handleMoodChange = async (mood: 1 | 2 | 3 | 4 | 5) => {
    if (!userId) return
    
    setTodayMood(mood)
    
    const supabase = createClient()
    
    try {
      // Check if mood entry exists for today
      const { data: existing } = await supabase
        .from('mood_entries')
        .select('id')
        .eq('user_id', userId)
        .eq('date', todayStr)
        .single()

      if (existing) {
        // Update existing
        await supabase
          .from('mood_entries')
          .update({ value: mood })
          .eq('id', existing.id)
      } else {
        // Create new
        await supabase
          .from('mood_entries')
          .insert({
            user_id: userId,
            date: todayStr,
            value: mood,
          })
      }

      // Update local state
      setMoods(prev => {
        const filtered = prev.filter(m => m.date !== todayStr)
        return [...filtered, { 
          id: existing?.id || Date.now().toString(), 
          user_id: userId, 
          date: todayStr, 
          value: mood, 
          note: null, 
          tags: [], 
          energy_level: null, 
          stress_level: null, 
          created_at: new Date().toISOString() 
        }]
      })
    } catch (err) {
      console.error('Error saving mood:', err)
    }
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
          <h1 className="text-2xl md:text-3xl font-bold">{greeting}</h1>
          <p className="text-muted-foreground">
            {formatDate(today, 'EEEE, d MMMM yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/reports">
              <TrendingUp className="w-4 h-4 mr-2" />
              Raporlar
            </Link>
          </Button>
          <Button asChild>
            <Link href="/coach">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Koç
            </Link>
          </Button>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Genel Skor"
          value={overallScore}
          icon="🎯"
          change={5}
          changeLabel="vs dün"
          variant="circular"
        />
        <StatCard
          title="Verimlilik"
          value={productivityScore}
          icon="⚡"
          subtitle={`${completedCount}/${totalCount} alışkanlık`}
        />
        <StatCard
          title="Sağlık"
          value={healthScore}
          icon="❤️"
          change={-3}
          changeLabel="vs dün"
        />
        <StatCard
          title="Ruh Hali"
          value={moodScore}
          icon="😊"
          change={10}
          changeLabel="vs dün"
        />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column - Habits */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Habits */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Bugünkü Alışkanlıklar
                </CardTitle>
                <Link href="/habits" className="text-sm text-muted-foreground hover:text-primary flex items-center">
                  Tümü <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {habits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Henüz alışkanlık eklemedin</p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href="/habits">
                      <Plus className="w-4 h-4 mr-2" />
                      Alışkanlık Ekle
                    </Link>
                  </Button>
                </div>
              ) : (
                habits.slice(0, 4).map((habit) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-xl border transition-all',
                      habit.completedToday 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'hover:bg-accent/50'
                    )}
                  >
                    <button
                      onClick={() => handleHabitToggle(habit.id, habit.completedToday)}
                      className={cn(
                        'w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all shrink-0',
                        habit.completedToday 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-muted-foreground/30 hover:border-primary'
                      )}
                    >
                      {habit.completedToday && <span className="text-sm">✓</span>}
                    </button>
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: `${habit.color}20` }}
                    >
                      {habit.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        'font-medium truncate',
                        habit.completedToday && 'line-through text-muted-foreground'
                      )}>
                        {habit.name}
                      </h4>
                      {habit.streak > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-orange-500">
                          <Flame className="w-3 h-3" />
                          {habit.streak} gün seri
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              
              {/* Add habit inline */}
              <Link 
                href="/habits"
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
              >
                <Plus className="w-4 h-4" />
                Yeni Alışkanlık Ekle
              </Link>
            </CardContent>
          </Card>

          {/* Goals Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Hedefler
                </CardTitle>
                <Link href="/goals" className="text-sm text-muted-foreground hover:text-primary flex items-center">
                  Tümü <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {goals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Henüz hedef eklemedin</p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link href="/goals">
                      <Plus className="w-4 h-4 mr-2" />
                      Hedef Ekle
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} compact />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Mood & Health */}
        <div className="space-y-6">
          {/* Mood */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Bugün Nasıl Hissediyorsun?</CardTitle>
            </CardHeader>
            <CardContent>
              <MoodSelector 
                value={todayMood} 
                onChange={handleMoodChange}
              />
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Bu hafta</p>
                <MoodWeekView moods={moods} />
              </div>
            </CardContent>
          </Card>

          {/* Health Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Sağlık Skoru
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <HealthSummaryCard health={health} score={healthScore} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Günaydın 👋'
  if (hour < 18) return 'İyi Günler 👋'
  return 'İyi Akşamlar 👋'
}

function calculateHealthScore(health: Partial<HealthEntry>) {
  let score = 50 // Base score
  
  if (health.water_liters) {
    score += Math.min(health.water_liters / 2.5, 1) * 15
  }
  if (health.sleep_hours) {
    const sleepScore = health.sleep_hours >= 7 && health.sleep_hours <= 9 ? 1 : 0.5
    score += sleepScore * 15
  }
  if (health.exercise_minutes) {
    score += Math.min(health.exercise_minutes / 30, 1) * 10
  }
  if (health.steps) {
    score += Math.min(health.steps / 10000, 1) * 10
  }

  return Math.min(Math.round(score), 100)
}

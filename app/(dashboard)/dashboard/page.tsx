'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  TrendingUp, 
  Target, 
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { cn, formatDate, getWeekDays } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/dashboard/stat-card'
import { HabitCard } from '@/components/habits/habit-card'
import { MoodSelector, MoodWeekView } from '@/components/mood/mood-selector'
import { HealthSummaryCard } from '@/components/health/health-tracker'
import { GoalCard } from '@/components/goals/goal-card'
import { WeeklyChart } from '@/components/charts/weekly-chart'
import { StreakCard } from '@/components/streak/streak-card'
import { useTranslation } from '@/hooks/use-translation'
import { useAuth } from '@/hooks/use-auth'
import { useHabits } from '@/hooks/use-habits'
import { useGoals } from '@/hooks/use-goals'
import { useMoods } from '@/hooks/use-moods'
import { useHealth } from '@/hooks/use-health'
import { useStreaks } from '@/hooks/use-streaks'
import type { HealthEntry } from '@/types'

export default function DashboardPage() {
  const { t, language } = useTranslation()
  const { user } = useAuth()
  const { habits = [], toggleHabit, todayLogs = [] } = useHabits()
  const { goals = [] } = useGoals()
  const { moods = [], addMood, todayMood } = useMoods()
  const { todayHealth } = useHealth()
  const { globalStreak, habitStreaks } = useStreaks()
  
  const [mounted, setMounted] = useState(false)
  const [selectedMood, setSelectedMood] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (todayMood?.value) {
      setSelectedMood(todayMood.value as 1 | 2 | 3 | 4 | 5)
    }
  }, [todayMood])

  const today = new Date()
  const greeting = getGreeting(language)

  const activeHabits = habits?.filter(h => !h.archived) || []
  const activeGoals = goals?.filter(g => g.status === 'active') || []

  // Get streak for each habit
  const habitsWithStreaks = useMemo(() => {
    return activeHabits.map(habit => {
      const streakData = habitStreaks.find(s => s.habitId === habit.id)
      return {
        ...habit,
        streak: streakData?.currentStreak || 0,
      }
    })
  }, [activeHabits, habitStreaks])

  const completedHabits = todayLogs?.length || 0
  const totalHabits = activeHabits.length
  const productivityScore = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0
  const healthScore = calculateHealthScore(todayHealth)
  const moodScore = selectedMood ? selectedMood * 20 : 60
  const overallScore = Math.round((productivityScore + healthScore + moodScore) / 3)

  const handleHabitToggle = async (id: string) => {
    await toggleHabit(id)
  }

  const handleMoodChange = async (mood: 1 | 2 | 3 | 4 | 5) => {
    setSelectedMood(mood)
    await addMood(mood)
  }

  const weeklyData = useMemo(() => {
    return getWeekDays().map((date) => ({
      date: date.toISOString().split('T')[0],
      productivity: 60 + Math.random() * 30,
      health: 50 + Math.random() * 40,
      mood: 40 + Math.random() * 50,
    }))
  }, [])

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-muted rounded-xl" />
            <div className="h-48 bg-muted rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="h-40 bg-muted rounded-xl" />
            <div className="h-40 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{greeting}</h1>
          <p className="text-muted-foreground">
            {formatDate(today, language === 'tr' ? 'EEEE, d MMMM yyyy' : 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/reports">
              <TrendingUp className="w-4 h-4 mr-2" />
              {t.dashboard.reports}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/coach">
              <Sparkles className="w-4 h-4 mr-2" />
              {t.dashboard.ai_coach}
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Score cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatCard
          title={t.dashboard.overall_score}
          value={overallScore}
          icon="🎯"
          change={5}
          changeLabel={t.dashboard.vs_yesterday}
          variant="circular"
        />
        <StatCard
          title={t.dashboard.productivity}
          value={productivityScore}
          icon="⚡"
          change={completedHabits > 0 ? 10 : -5}
          changeLabel={t.dashboard.vs_yesterday}
        />
        <StatCard
          title={t.dashboard.health}
          value={healthScore}
          icon="❤️"
          change={healthScore > 50 ? 8 : -3}
          changeLabel={t.dashboard.vs_yesterday}
        />
        <StatCard
          title={t.dashboard.mood}
          value={moodScore}
          icon="😊"
          change={10}
          changeLabel={t.dashboard.vs_yesterday}
        />
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Habits & Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Habits section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  {t.dashboard.todays_habits}
                </CardTitle>
                <Link href="/habits">
                  <Button variant="ghost" size="sm">
                    {t.dashboard.view_all} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeHabits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{t.dashboard.no_habits_yet}</p>
                    <p className="text-sm">{t.dashboard.create_first_habit}</p>
                  </div>
                ) : (
                  habitsWithStreaks.slice(0, 4).map((habit) => {
                    const isCompleted = todayLogs?.some(log => log.habit_id === habit.id) || false
                    return (
                      <HabitCard
                        key={habit.id}
                        id={habit.id}
                        name={habit.name}
                        icon={habit.icon}
                        color={habit.color}
                        streak={habit.streak}
                        completed={isCompleted}
                        onToggle={handleHabitToggle}
                      />
                    )
                  })
                )}
                <Button variant="outline" className="w-full mt-2" asChild>
                  <Link href="/habits">
                    <Plus className="w-4 h-4 mr-2" />
                    {t.dashboard.add_habit}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{t.dashboard.weekly_performance || 'Weekly Performance'}</CardTitle>
              </CardHeader>
              <CardContent>
                <WeeklyChart data={weeklyData} />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right column - Mood, Health, Goals, Streak */}
        <div className="space-y-6">
          {/* Mood section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t.dashboard.how_feeling}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MoodSelector
                  value={selectedMood}
                  onChange={handleMoodChange}
                  showLabels
                  size="lg"
                />
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">{t.dashboard.this_week}</p>
                  <MoodWeekView moods={(moods || []).slice(-7).map(m => ({ date: m.date, value: m.value }))} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Health section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <HealthSummaryCard data={todayHealth || {}} />
          </motion.div>

          {/* Goals section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {t.goals.title}
                </CardTitle>
                <Link href="/goals">
                  <Button variant="ghost" size="sm">
                    {t.dashboard.view_all} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeGoals.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground text-sm">
                    {t.goals.no_goals}
                  </p>
                ) : (
                  activeGoals.slice(0, 2).map((goal) => (
                    <GoalCard key={goal.id} goal={goal} compact />
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <StreakCard language={language as 'tr' | 'en'} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function getGreeting(lang: string): string {
  const hour = new Date().getHours()
  if (lang === 'tr') {
    if (hour < 6) return 'İyi Geceler 🌙'
    if (hour < 12) return 'Günaydın ☀️'
    if (hour < 18) return 'İyi Günler 👋'
    return 'İyi Akşamlar 🌆'
  } else {
    if (hour < 6) return 'Good Night 🌙'
    if (hour < 12) return 'Good Morning ☀️'
    if (hour < 18) return 'Good Afternoon 👋'
    return 'Good Evening 🌆'
  }
}

function calculateHealthScore(health: Partial<HealthEntry> | null | undefined): number {
  if (!health) return 0
  
  let score = 0
  let count = 0

  if (health.water_liters) {
    score += Math.min(100, (health.water_liters / 2.5) * 100)
    count++
  }
  if (health.sleep_hours) {
    score += Math.min(100, (health.sleep_hours / 8) * 100)
    count++
  }
  if (health.exercise_minutes) {
    score += Math.min(100, (health.exercise_minutes / 60) * 100)
    count++
  }

  return count > 0 ? Math.round(score / count) : 0
}

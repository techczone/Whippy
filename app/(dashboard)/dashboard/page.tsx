'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { HabitCard } from '@/components/habits/habit-card'
import { MoodSelector, MoodWeekView } from '@/components/mood/mood-selector'
import { HealthSummaryCard } from '@/components/health/health-tracker'
import { GoalCard } from '@/components/goals/goal-card'
import { WeeklyChart } from '@/components/charts/weekly-chart'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/hooks/use-translation'
import { useAuth } from '@/hooks/use-auth'
import { useHabits } from '@/hooks/use-habits'
import { useGoals } from '@/hooks/use-goals'
import { useMoods } from '@/hooks/use-moods'
import { useHealth } from '@/hooks/use-health'
import type { HealthEntry } from '@/types'

export default function DashboardPage() {
  const { t, language } = useTranslation()
  const { user } = useAuth()
  const { habits, toggleHabit, todayLogs } = useHabits()
  const { goals } = useGoals()
  const { moods, addMood, todayMood } = useMoods()
  const { todayHealth } = useHealth()
  
  const [selectedMood, setSelectedMood] = useState<1 | 2 | 3 | 4 | 5 | undefined>(
    todayMood?.value as 1 | 2 | 3 | 4 | 5 | undefined
  )

  const today = new Date()
  const greeting = getGreeting(language)

  // Calculate scores
  const completedHabits = todayLogs.length
  const totalHabits = habits.filter(h => !h.archived).length
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

  // Weekly data for chart
  const weeklyData = useMemo(() => {
    return getWeekDays().map((date) => ({
      date: date.toISOString().split('T')[0],
      productivity: 60 + Math.random() * 30,
      health: 50 + Math.random() * 40,
      mood: 40 + Math.random() * 50,
    }))
  }, [])

  const activeHabits = habits.filter(h => !h.archived)
  const activeGoals = goals.filter(g => g.status === 'active')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          subtitle={`${completedHabits}/${totalHabits} ${t.dashboard.habits_completed}`}
        />
        <StatCard
          title={t.dashboard.health}
          value={healthScore}
          icon="❤️"
          change={-3}
          changeLabel={t.dashboard.vs_yesterday}
        />
        <StatCard
          title={t.dashboard.mood}
          value={moodScore}
          icon="😊"
          change={10}
          changeLabel={t.dashboard.vs_yesterday}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Habits & Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Habits section */}
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
                activeHabits.slice(0, 4).map((habit) => {
                  const isCompleted = todayLogs.some(log => log.habit_id === habit.id)
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

          {/* Weekly chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t.dashboard.weekly_performance}</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyChart data={weeklyData} />
            </CardContent>
          </Card>
        </div>

        {/* Right column - Mood, Health, Goals */}
        <div className="space-y-6">
          {/* Mood section */}
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
                <MoodWeekView moods={moods.slice(-7).map(m => ({ date: m.date, value: m.value }))} />
              </div>
            </CardContent>
          </Card>

          {/* Health section */}
          <HealthSummaryCard data={todayHealth || {}} />

          {/* Goals section */}
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

          {/* Streak highlights */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold">{t.habits.best_streak}</h3>
                  <p className="text-sm text-muted-foreground">
                    {language === 'tr' ? 'Devam ettir!' : 'Keep it up!'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {activeHabits
                  .sort((a, b) => b.streak - a.streak)
                  .slice(0, 3)
                  .map((habit) => (
                    <div key={habit.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{habit.icon}</span>
                        <span className="text-sm">{habit.name}</span>
                      </div>
                      <span className="streak-badge">
                        {habit.streak} {t.habits.days}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
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

function calculateHealthScore(health: Partial<HealthEntry> | null): number {
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

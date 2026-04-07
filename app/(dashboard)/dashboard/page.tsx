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
import { HabitCard, HabitCardMini } from '@/components/habits/habit-card'
import { MoodSelector, MoodWeekView } from '@/components/mood/mood-selector'
import { HealthSummaryCard } from '@/components/health/health-tracker'
import { GoalCard, GoalsSummary } from '@/components/goals/goal-card'
import { WeeklyChart, MoodTrendChart } from '@/components/charts/weekly-chart'
import { useAppStore } from '@/lib/store'
import type { Habit, Goal, MoodEntry, HealthEntry } from '@/types'

// Demo data for initial state
const DEMO_HABITS: (Habit & { completedToday: boolean })[] = [
  { id: '1', user_id: '1', name: 'Sabah meditasyonu', description: null, icon: '🧘', color: '#8B5CF6', frequency: 'daily', target_days: [], reminder_time: '07:00', streak: 12, best_streak: 15, created_at: '', updated_at: '', archived: false, completedToday: true },
  { id: '2', user_id: '1', name: '30 dk egzersiz', description: null, icon: '💪', color: '#22C55E', frequency: 'daily', target_days: [], reminder_time: '08:00', streak: 5, best_streak: 20, created_at: '', updated_at: '', archived: false, completedToday: false },
  { id: '3', user_id: '1', name: '2.5L su iç', description: null, icon: '💧', color: '#3B82F6', frequency: 'daily', target_days: [], reminder_time: null, streak: 8, best_streak: 30, created_at: '', updated_at: '', archived: false, completedToday: true },
  { id: '4', user_id: '1', name: '30 dk okuma', description: null, icon: '📚', color: '#F97316', frequency: 'daily', target_days: [], reminder_time: '21:00', streak: 3, best_streak: 10, created_at: '', updated_at: '', archived: false, completedToday: false },
]

const DEMO_GOALS: Goal[] = [
  { id: '1', user_id: '1', name: '10 kg ver', description: 'Sağlıklı kilo hedefi', target_value: 10, current_value: 4, unit: 'kg', deadline: '2025-06-01', category: 'health', status: 'active', created_at: '', updated_at: '' },
  { id: '2', user_id: '1', name: '50 kitap oku', description: 'Yıllık okuma hedefi', target_value: 50, current_value: 18, unit: 'kitap', deadline: '2025-12-31', category: 'education', status: 'active', created_at: '', updated_at: '' },
]

const DEMO_MOODS: MoodEntry[] = [
  { id: '1', user_id: '1', date: getWeekDays()[0].toISOString().split('T')[0], value: 4, note: null, tags: [], energy_level: null, stress_level: null, created_at: '' },
  { id: '2', user_id: '1', date: getWeekDays()[1].toISOString().split('T')[0], value: 3, note: null, tags: [], energy_level: null, stress_level: null, created_at: '' },
  { id: '3', user_id: '1', date: getWeekDays()[2].toISOString().split('T')[0], value: 5, note: null, tags: [], energy_level: null, stress_level: null, created_at: '' },
  { id: '4', user_id: '1', date: getWeekDays()[3].toISOString().split('T')[0], value: 4, note: null, tags: [], energy_level: null, stress_level: null, created_at: '' },
  { id: '5', user_id: '1', date: getWeekDays()[4].toISOString().split('T')[0], value: 3, note: null, tags: [], energy_level: null, stress_level: null, created_at: '' },
  { id: '6', user_id: '1', date: getWeekDays()[5].toISOString().split('T')[0], value: 5, note: null, tags: [], energy_level: null, stress_level: null, created_at: '' },
]

const DEMO_HEALTH: Partial<HealthEntry> = {
  water_liters: 1.5,
  sleep_hours: 7,
  exercise_minutes: 30,
  calories: 1800,
  steps: 6500,
}

const DEMO_WEEKLY_DATA = getWeekDays().map((date, i) => ({
  date: date.toISOString().split('T')[0],
  productivity: 60 + Math.random() * 30,
  health: 50 + Math.random() * 40,
  mood: 40 + Math.random() * 50,
}))

export default function DashboardPage() {
  const [habits, setHabits] = useState(DEMO_HABITS)
  const [goals] = useState(DEMO_GOALS)
  const [moods, setMoods] = useState(DEMO_MOODS)
  const [health, setHealth] = useState(DEMO_HEALTH)
  const [todayMood, setTodayMood] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined)

  const today = new Date()
  const greeting = getGreeting()

  // Calculate scores
  const completedHabits = habits.filter(h => h.completedToday).length
  const totalHabits = habits.length
  const productivityScore = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0
  const healthScore = calculateHealthScore(health)
  const moodScore = todayMood ? todayMood * 20 : 60
  const overallScore = Math.round((productivityScore + healthScore + moodScore) / 3)

  const handleHabitToggle = (id: string) => {
    setHabits(prev => prev.map(h => 
      h.id === id ? { ...h, completedToday: !h.completedToday, streak: !h.completedToday ? h.streak + 1 : h.streak - 1 } : h
    ))
  }

  const handleMoodChange = (mood: 1 | 2 | 3 | 4 | 5) => {
    setTodayMood(mood)
    const todayStr = today.toISOString().split('T')[0]
    setMoods(prev => {
      const filtered = prev.filter(m => m.date !== todayStr)
      return [...filtered, { 
        id: Date.now().toString(), 
        user_id: '1', 
        date: todayStr, 
        value: mood, 
        note: null, 
        tags: [], 
        energy_level: null, 
        stress_level: null, 
        created_at: '' 
      }]
    })
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
          subtitle={`${completedHabits}/${totalHabits} alışkanlık`}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Habits & Mood */}
        <div className="lg:col-span-2 space-y-6">
          {/* Habits section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Bugünkü Alışkanlıklar
              </CardTitle>
              <Link href="/habits">
                <Button variant="ghost" size="sm">
                  Tümü <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  id={habit.id}
                  name={habit.name}
                  icon={habit.icon}
                  color={habit.color}
                  streak={habit.streak}
                  completed={habit.completedToday}
                  onToggle={handleHabitToggle}
                />
              ))}
              <Button variant="outline" className="w-full mt-2" asChild>
                <Link href="/habits/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Alışkanlık Ekle
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Weekly chart */}
          <WeeklyChart data={DEMO_WEEKLY_DATA} />
        </div>

        {/* Right column - Mood, Health, Goals */}
        <div className="space-y-6">
          {/* Mood section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Bugün Nasıl Hissediyorsun?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MoodSelector
                value={todayMood}
                onChange={handleMoodChange}
                showLabels
                size="lg"
              />
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Bu hafta</p>
                <MoodWeekView moods={moods.map(m => ({ date: m.date, value: m.value }))} />
              </div>
            </CardContent>
          </Card>

          {/* Health section */}
          <HealthSummaryCard data={health} />

          {/* Goals section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
                Hedefler
              </CardTitle>
              <Link href="/goals">
                <Button variant="ghost" size="sm">
                  Tümü <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {goals.slice(0, 2).map((goal) => (
                <GoalCard key={goal.id} goal={goal} compact />
              ))}
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
                  <h3 className="font-semibold">En Uzun Seri</h3>
                  <p className="text-sm text-muted-foreground">Devam ettir!</p>
                </div>
              </div>
              <div className="space-y-2">
                {habits
                  .sort((a, b) => b.streak - a.streak)
                  .slice(0, 3)
                  .map((habit) => (
                    <div key={habit.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{habit.icon}</span>
                        <span className="text-sm">{habit.name}</span>
                      </div>
                      <span className="streak-badge">{habit.streak} gün</span>
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

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return 'İyi Geceler 🌙'
  if (hour < 12) return 'Günaydın ☀️'
  if (hour < 18) return 'İyi Günler 👋'
  return 'İyi Akşamlar 🌆'
}

function calculateHealthScore(health: Partial<HealthEntry>): number {
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

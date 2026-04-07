'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Heart, 
  Smile, 
  Trophy,
  Plus,
  Sparkles
} from 'lucide-react'
import { useAppStore, useHabitsForToday, useTodayMood, useTodayHealth, useActiveGoals, useActiveProjects } from '@/lib/store'
import { StatCard } from '@/components/dashboard/stat-card'
import { HabitCard } from '@/components/habits/habit-card'
import { MoodSelector } from '@/components/mood/mood-selector'
import { HealthTracker } from '@/components/health/health-tracker'
import { GoalCard } from '@/components/goals/goal-card'
import { ProjectCard } from '@/components/projects/project-card'
import { AICoach } from '@/components/coach/ai-coach'
import { WeeklyChart } from '@/components/charts/weekly-chart'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, calculateOverallScore, calculateHealthScore, formatTurkishDate } from '@/lib/utils'
import type { Habit, Goal, Project, HabitLog, MoodEntry, HealthEntry } from '@/types'

// Demo data for initial state
const DEMO_HABITS: Habit[] = [
  { id: '1', user_id: 'demo', name: 'Sabah meditasyonu', icon: '🧘', color: '#8B5CF6', frequency: 'daily', streak: 5, best_streak: 12, created_at: new Date().toISOString() },
  { id: '2', user_id: 'demo', name: '10.000 adım', icon: '🚶', color: '#14B8A6', frequency: 'daily', streak: 3, best_streak: 7, created_at: new Date().toISOString() },
  { id: '3', user_id: 'demo', name: 'Kitap okuma (30 dk)', icon: '📚', color: '#F59E0B', frequency: 'daily', streak: 8, best_streak: 15, created_at: new Date().toISOString() },
  { id: '4', user_id: 'demo', name: '8 saat uyku', icon: '😴', color: '#3B82F6', frequency: 'daily', streak: 2, best_streak: 10, created_at: new Date().toISOString() },
]

const DEMO_GOALS: Goal[] = [
  { id: '1', user_id: '1', title: '10 kg ver', name: '10 kg ver', description: 'Sağlıklı kilo hedefi', target_value: 10, current_value: 4, unit: 'kg', deadline: '2025-06-01', category: 'health', status: 'active', created_at: '', updated_at: '' },
  { id: '2', user_id: '1', title: '50 kitap oku', name: '50 kitap oku', description: 'Yıllık okuma hedefi', target_value: 50, current_value: 18, unit: 'kitap', deadline: '2025-12-31', category: 'education', status: 'active', created_at: '', updated_at: '' },
]

const DEMO_PROJECTS: Project[] = [
  { id: '1', user_id: 'demo', name: 'Trading Bot Geliştirme', description: 'Solana memecoin trading botu', color: '#8B5CF6', status: 'active', progress: 75, created_at: new Date().toISOString() },
  { id: '2', user_id: 'demo', name: 'Yaşam Koçu App', description: 'AI destekli yaşam koçu uygulaması', color: '#14B8A6', status: 'active', progress: 40, created_at: new Date().toISOString() },
]

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const { 
    habits, setHabits,
    habitLogs, addHabitLog,
    goals, setGoals, updateGoal,
    projects, setProjects, updateProject,
    moods, addMood,
    health, updateHealth,
  } = useAppStore()
  
  const habitsForToday = useHabitsForToday()
  const todayMood = useTodayMood()
  const todayHealth = useTodayHealth()
  const activeGoals = useActiveGoals()
  const activeProjects = useActiveProjects()

  // Initialize demo data
  useEffect(() => {
    setMounted(true)
    if (habits.length === 0) {
      setHabits(DEMO_HABITS)
    }
    if (goals.length === 0) {
      setGoals(DEMO_GOALS)
    }
    if (projects.length === 0) {
      setProjects(DEMO_PROJECTS)
    }
  }, [])

  // Calculate stats
  const today = new Date().toISOString().split('T')[0]
  const completedHabits = habitsForToday.filter(h => h.completedToday).length
  const totalHabits = habitsForToday.length
  const habitScore = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

  const healthScore = calculateHealthScore(
    todayHealth?.exercise_minutes || 0,
    todayHealth?.water_liters || 0,
    todayHealth?.sleep_hours || 0
  )

  const moodScore = todayMood ? (todayMood.value / 5) * 100 : 0
  const overallScore = calculateOverallScore(habitScore, healthScore, moodScore)

  // Toggle habit completion
  const toggleHabit = (habitId: string) => {
    const existingLog = habitLogs.find(
      log => log.habit_id === habitId && log.date === today
    )
    
    addHabitLog({
      id: `${habitId}-${today}`,
      habit_id: habitId,
      user_id: 'demo',
      date: today,
      completed: !existingLog?.completed,
      created_at: new Date().toISOString()
    })
  }

  // Add new habit
  const addNewHabit = () => {
    const name = prompt('Yeni alışkanlık adı:')
    if (name) {
      const newHabit: Habit = {
        id: Date.now().toString(),
        user_id: 'demo',
        name,
        icon: '✨',
        color: '#8B5CF6',
        frequency: 'daily',
        streak: 0,
        best_streak: 0,
        created_at: new Date().toISOString()
      }
      useAppStore.getState().addHabit(newHabit)
    }
  }

  // Add new goal
  const addNewGoal = () => {
    const title = prompt('Yeni hedef:')
    if (title) {
      const newGoal: Goal = {
        id: Date.now().toString(),
        user_id: 'demo',
        title,
        category: 'personal',
        target_value: 100,
        current_value: 0,
        unit: '%',
        status: 'active',
        created_at: new Date().toISOString()
      }
      useAppStore.getState().addGoal(newGoal)
    }
  }

  // Add new project
  const addNewProject = () => {
    const name = prompt('Yeni proje adı:')
    if (name) {
      const newProject: Project = {
        id: Date.now().toString(),
        user_id: 'demo',
        name,
        color: '#14B8A6',
        status: 'active',
        progress: 0,
        created_at: new Date().toISOString()
      }
      useAppStore.getState().addProject(newProject)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">
            Hayat Koçu Pro
          </h1>
          <p className="text-muted-foreground mt-1">
            {formatTurkishDate(new Date())}
          </p>
        </div>
        <Button variant="glow" size="sm" className="hidden md:flex">
          <Sparkles className="w-4 h-4 mr-2" />
          Pro'ya Yükselt
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Verimlilik"
          value={habitScore}
          suffix="%"
          icon={TrendingUp}
          trend={{ value: 5, positive: true }}
          color="purple"
          variant="circular"
        />
        <StatCard
          title="Sağlık"
          value={healthScore}
          suffix="%"
          icon={Heart}
          trend={{ value: 3, positive: true }}
          color="teal"
          variant="circular"
        />
        <StatCard
          title="Ruh Hali"
          value={todayMood ? ['😫', '😔', '😐', '🙂', '😄'][todayMood.value - 1] : '-'}
          icon={Smile}
          color="amber"
        />
        <StatCard
          title="Genel Skor"
          value={overallScore}
          suffix="%"
          icon={Trophy}
          trend={{ value: 8, positive: true }}
          color="green"
          variant="circular"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Habits & Health */}
        <div className="lg:col-span-2 space-y-6">
          {/* Habits */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span>📋</span>
                Günlük Alışkanlıklar
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={addNewHabit}>
                <Plus className="w-4 h-4 mr-1" />
                Ekle
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {habitsForToday.map((habit, index) => (
                  <motion.div
                    key={habit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <HabitCard
                      habit={habit}
                      completed={habit.completedToday}
                      onToggle={() => toggleHabit(habit.id)}
                    />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mood & Health Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mood */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>😊</span>
                  Ruh Hali
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MoodSelector
                  selectedMood={todayMood?.value}
                  onSelect={(value) => addMood({
                    id: `mood-${today}`,
                    user_id: 'demo',
                    date: today,
                    value,
                    created_at: new Date().toISOString()
                  })}
                />
              </CardContent>
            </Card>

            {/* Health */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🏃</span>
                  Sağlık Metrikleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HealthTracker
                  data={todayHealth}
                  onUpdate={(updates) => updateHealth(today, updates)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Weekly Chart */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>📊</span>
                Haftalık Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyChart />
            </CardContent>
          </Card>

          {/* Goals */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span>🎯</span>
                Hedefler
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={addNewGoal}>
                <Plus className="w-4 h-4 mr-1" />
                Ekle
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeGoals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GoalCard
                      goal={goal}
                      onUpdate={(updates) => updateGoal(goal.id, updates)}
                    />
                  </motion.div>
                ))}
                {activeGoals.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Henüz hedef eklenmemiş
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span>🚀</span>
                Aktif Projeler
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={addNewProject}>
                <Plus className="w-4 h-4 mr-1" />
                Ekle
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProjectCard
                      project={project}
                      onUpdate={(updates) => updateProject(project.id, updates)}
                    />
                  </motion.div>
                ))}
                {activeProjects.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Henüz proje eklenmemiş
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - AI Coach */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <AICoach
              stats={{
                habitScore,
                healthScore,
                moodScore,
                overallScore,
                completedHabits,
                totalHabits,
                exercise: todayHealth?.exercise_minutes || 0,
                sleep: todayHealth?.sleep_hours || 0,
                water: todayHealth?.water_liters || 0,
                goals: activeGoals.map(g => `${g.title}: %${Math.round((g.current_value / g.target_value) * 100)}`).join(', '),
                projects: activeProjects.map(p => `${p.name}: %${p.progress}`).join(', ')
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

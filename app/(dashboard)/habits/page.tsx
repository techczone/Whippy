'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Target, 
  Flame, 
  Trophy,
  Check,
  Search,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useHabitsWithStatus } from '@/hooks/use-habits'
import { useTranslation } from '@/hooks/use-translation'
import { createClient } from '@/lib/supabase/client'
import confetti from 'canvas-confetti'
import toast from 'react-hot-toast'

const HABIT_ICONS = ['🏃', '💪', '📚', '🧘', '💧', '🥗', '😴', '📝', '🎯', '💼', '🎨', '🎵']
const HABIT_COLORS = ['#8B5CF6', '#14B8A6', '#F97316', '#EC4899', '#3B82F6', '#22C55E', '#EAB308', '#EF4444']

export default function HabitsPage() {
  const { t, language } = useTranslation()
  const [userId, setUserId] = useState<string | undefined>()
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Get user ID
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id)
    })
  }, [])

  const { 
    habits, 
    loading, 
    completedCount, 
    totalCount, 
    completionRate,
    toggleHabit,
    addHabit,
    deleteHabit 
  } = useHabitsWithStatus(userId)

  // Filter habits
  const filteredHabits = habits.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle habit toggle with confetti
  const handleToggle = async (habitId: string, isCompleted: boolean) => {
    if (!isCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      toast.success(t.habits.habit_completed)
    }
    await toggleHabit(habitId)
  }

  // Stats
  const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0)
  const bestStreak = Math.max(...habits.map(h => h.best_streak), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.habits.title}</h1>
          <p className="text-muted-foreground">{t.habits.subtitle}</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {t.habits.add_new}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completionRate}%</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'tr' ? 'Bugün tamamlanan' : 'Completed today'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStreak}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'tr' ? 'Toplam seri günü' : 'Total streak days'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bestStreak || 0}</p>
                <p className="text-xs text-muted-foreground">{t.habits.best_streak}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}/{totalCount}</p>
                <p className="text-xs text-muted-foreground">{t.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {language === 'tr' ? 'Bugünkü İlerleme' : "Today's Progress"}
            </span>
            <span className="text-sm text-muted-foreground">{completedCount}/{totalCount}</span>
          </div>
          <Progress value={completionRate} className="h-3" />
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={language === 'tr' ? 'Alışkanlık ara...' : 'Search habits...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredHabits.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">{t.habits.no_habits}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t.habits.create_first}
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t.habits.add_new}
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredHabits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    habit.completedToday && 'bg-green-500/10 border-green-500/30'
                  )}
                  onClick={() => handleToggle(habit.id, habit.completedToday)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all',
                          habit.completedToday ? 'bg-green-500 text-white' : 'bg-muted'
                        )}
                        style={{ 
                          backgroundColor: habit.completedToday ? '#22C55E' : `${habit.color}20`,
                        }}
                      >
                        {habit.completedToday ? <Check className="w-6 h-6" /> : habit.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={cn(
                          'font-medium',
                          habit.completedToday && 'line-through text-muted-foreground'
                        )}>
                          {habit.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            {habit.streak} {t.habits.days} {t.habits.streak.toLowerCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {t.habits.best_streak}: {habit.best_streak}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm(t.messages.delete_confirm)) {
                            deleteHabit(habit.id)
                            toast.success(t.habits.habit_deleted)
                          }
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Mobile FAB */}
      <Button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg md:hidden z-30"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddHabitModal
            onClose={() => setShowAddModal(false)}
            onAdd={async (habit) => {
              await addHabit(habit)
              toast.success(t.habits.habit_added)
              setShowAddModal(false)
            }}
            t={t}
            language={language}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function AddHabitModal({ 
  onClose, 
  onAdd,
  t,
  language 
}: { 
  onClose: () => void
  onAdd: (habit: { name: string; icon: string; color: string }) => void
  t: any
  language: string
}) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🎯')
  const [color, setColor] = useState('#8B5CF6')

  const handleSubmit = () => {
    if (!name.trim()) return
    onAdd({ name, icon, color })
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-card rounded-2xl shadow-xl z-50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{t.habits.add_new}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">{t.habits.habit_name}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'tr' ? 'örn: 30 dk egzersiz' : 'e.g., 30 min exercise'}
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t.habits.select_icon}</label>
            <div className="grid grid-cols-6 gap-2">
              {HABIT_ICONS.map((i) => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all',
                    icon === i ? 'bg-primary text-primary-foreground scale-110' : 'bg-muted hover:bg-accent'
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t.habits.select_color}</label>
            <div className="grid grid-cols-8 gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-lg transition-all',
                    color === c && 'ring-2 ring-offset-2 ring-primary scale-110'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={!name.trim()}>
            {t.add}
          </Button>
        </div>
      </motion.div>
    </>
  )
}

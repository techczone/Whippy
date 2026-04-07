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
import { createClient } from '@/lib/supabase/client'
import confetti from 'canvas-confetti'

const HABIT_ICONS = ['🏃', '💪', '📚', '🧘', '💧', '🥗', '😴', '📝', '🎯', '💼', '🎨', '🎵']
const HABIT_COLORS = ['#8B5CF6', '#14B8A6', '#F97316', '#EC4899', '#3B82F6', '#22C55E', '#EAB308', '#EF4444']

export default function HabitsPage() {
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
          <h1 className="text-2xl font-bold">Alışkanlıklar</h1>
          <p className="text-muted-foreground">Günlük rutinlerini takip et</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Yeni Alışkanlık
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
                <p className="text-xs text-muted-foreground">Bugün tamamlanan</p>
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
                <p className="text-xs text-muted-foreground">Toplam seri günü</p>
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
                <p className="text-xs text-muted-foreground">En uzun seri</p>
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
                <p className="text-xs text-muted-foreground">Bugün</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Bugünkü İlerleme</span>
            <span className="text-sm text-muted-foreground">{completedCount}/{totalCount}</span>
          </div>
          <Progress value={completionRate} className="h-3" />
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Alışkanlık ara..."
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
                <h3 className="font-medium mb-2">Henüz alışkanlık yok</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  İlk alışkanlığını ekleyerek başla
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Alışkanlık Ekle
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
                    'transition-all cursor-pointer hover:shadow-md',
                    habit.completedToday && 'bg-green-500/10 border-green-500/30'
                  )}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggle(habit.id, habit.completedToday)}
                        className={cn(
                          'w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all',
                          habit.completedToday 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-muted-foreground/30 hover:border-primary'
                        )}
                      >
                        {habit.completedToday && <Check className="w-5 h-5" />}
                      </button>

                      {/* Icon */}
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${habit.color}20` }}
                      >
                        {habit.icon}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className={cn(
                          'font-medium',
                          habit.completedToday && 'line-through text-muted-foreground'
                        )}>
                          {habit.name}
                        </h3>
                        {habit.streak > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-orange-500 mt-1">
                            <Flame className="w-3 h-3" />
                            {habit.streak} gün seri
                          </span>
                        )}
                      </div>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm('Bu alışkanlığı silmek istediğine emin misin?')) {
                            deleteHabit(habit.id)
                          }
                        }}
                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Habit Button (Mobile) */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-4 md:hidden w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Habit Modal */}
      <AddHabitModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        onAdd={addHabit}
      />
    </div>
  )
}

// Add Habit Modal Component
function AddHabitModal({ 
  isOpen, 
  onClose, 
  onAdd 
}: { 
  isOpen: boolean
  onClose: () => void
  onAdd: (habit: any) => Promise<any>
}) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🎯')
  const [color, setColor] = useState('#8B5CF6')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    await onAdd({
      name: name.trim(),
      icon,
      color,
      frequency: 'daily',
      target_days: [0, 1, 2, 3, 4, 5, 6],
    })
    setLoading(false)
    setName('')
    setIcon('🎯')
    setColor('#8B5CF6')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-2xl p-6 w-full max-w-md border border-border"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Yeni Alışkanlık</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Alışkanlık Adı</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: 30 dk egzersiz"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">İkon</label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={cn(
                    'w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all',
                    icon === i ? 'bg-primary/20 ring-2 ring-primary' : 'bg-secondary hover:bg-secondary/80'
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Renk</label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    color === c && 'ring-2 ring-offset-2 ring-offset-background ring-white'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              İptal
            </Button>
            <Button type="submit" disabled={!name.trim() || loading} className="flex-1">
              {loading ? 'Ekleniyor...' : 'Ekle'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

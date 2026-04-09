'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, Flame, Check, X, Calendar } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useHabits } from '@/hooks/use-habits'
import { useTranslation } from '@/hooks/use-translation'
import toast from 'react-hot-toast'

const HABIT_ICONS = ['🎯', '💪', '📚', '🧘', '🏃', '💧', '🥗', '😴', '✍️', '🎨', '🎵', '💻', '🧹', '💰', '🙏']
const HABIT_COLORS = ['#8B5CF6', '#3B82F6', '#22C55E', '#F97316', '#EC4899', '#14B8A6', '#EAB308', '#EF4444']

export default function HabitsPage() {
  const { t, language } = useTranslation()
  const { habits, loading, addHabit, toggleHabit, deleteHabit, todayLogs } = useHabits()
  const [showAddModal, setShowAddModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const activeHabits = habits.filter(h => !h.archived)
  const completedCount = todayLogs.length
  const totalCount = activeHabits.length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const handleToggle = async (habitId: string) => {
    await toggleHabit(habitId)
  }

  const handleDelete = async (habitId: string) => {
    if (confirm(t.messages.delete_confirm)) {
      await deleteHabit(habitId)
      toast.success(language === 'tr' ? 'Alışkanlık silindi' : 'Habit deleted')
    }
  }

  const handleAdd = async (data: any) => {
    const result = await addHabit(data)
    if (result) {
      toast.success(language === 'tr' ? 'Alışkanlık eklendi' : 'Habit added')
      setShowAddModal(false)
    }
  }

  if (!mounted || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-xl" />)}
        </div>
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-muted rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t.habits.title}</h1>
          <p className="text-muted-foreground">{t.habits.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {formatDate(new Date(), language === 'tr' ? 'EEEE, d MMMM' : 'EEEE, MMMM d')}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-primary">{totalCount}</p>
            <p className="text-xs text-muted-foreground">{t.habits.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-500">{completedCount}</p>
            <p className="text-xs text-muted-foreground">{t.habits.completed_today}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">{t.habits.completion}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add button (desktop) */}
      <Button onClick={() => setShowAddModal(true)} className="hidden md:flex">
        <Plus className="w-4 h-4 mr-2" />
        {t.habits.add_new}
      </Button>

      {/* Habits List */}
      <div className="space-y-3">
        <AnimatePresence>
          {activeHabits.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">{t.habits.no_habits}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t.habits.create_first}</p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t.habits.add_new}
                </Button>
              </CardContent>
            </Card>
          ) : (
            activeHabits.map((habit) => {
              const isCompleted = todayLogs.some(log => log.habit_id === habit.id)
              
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  layout
                >
                  <Card className={cn(
                    'transition-all',
                    isCompleted && 'bg-green-500/10 border-green-500/30'
                  )}>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleToggle(habit.id)}
                          className={cn(
                            'w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all shrink-0',
                            isCompleted 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-muted-foreground/30 hover:border-primary'
                          )}
                        >
                          {isCompleted && <Check className="w-5 h-5" />}
                        </button>

                        {/* Icon */}
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                          style={{ backgroundColor: `${habit.color}20` }}
                        >
                          {habit.icon}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className={cn(
                            'font-medium truncate',
                            isCompleted && 'line-through text-muted-foreground'
                          )}>
                            {habit.name}
                          </h3>
                          {(habit.streak || 0) > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs text-orange-500 mt-1">
                              <Flame className="w-3 h-3" />
                              {habit.streak} {t.habits.days}
                            </span>
                          )}
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(habit.id)}
                          className="p-2 text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

      {/* Mobile FAB */}
      <Button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg md:hidden z-30"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddHabitModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAdd}
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
  language,
}: {
  onClose: () => void
  onAdd: (data: any) => void
  t: any
  language: string
}) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🎯')
  const [color, setColor] = useState('#8B5CF6')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
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
  }

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-card rounded-2xl shadow-xl z-50 flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-xl font-bold">{t.habits.add_new}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">{t.habits.habit_name}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'tr' ? 'Örn: 30 dk egzersiz' : 'e.g., 30 min exercise'}
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t.habits.icon}</label>
            <div className="grid grid-cols-8 gap-2">
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
            <label className="text-sm font-medium mb-2 block">{t.habits.color}</label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-10 h-10 rounded-full transition-all',
                    color === c && 'ring-2 ring-offset-2 ring-offset-background ring-primary'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t shrink-0">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={!name.trim() || loading}>
            {loading ? (language === 'tr' ? 'Ekleniyor...' : 'Adding...') : t.add}
          </Button>
        </div>
      </motion.div>
    </>
  )
}

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, TrendingUp, CheckCircle, Clock, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useGoals } from '@/hooks/use-goals'
import { useTranslation } from '@/hooks/use-translation'
import type { GoalCategory } from '@/types'
import toast from 'react-hot-toast'

const CATEGORIES: { id: GoalCategory; label_tr: string; label_en: string }[] = [
  { id: 'health', label_tr: 'Sağlık', label_en: 'Health' },
  { id: 'fitness', label_tr: 'Fitness', label_en: 'Fitness' },
  { id: 'career', label_tr: 'Kariyer', label_en: 'Career' },
  { id: 'education', label_tr: 'Eğitim', label_en: 'Education' },
  { id: 'finance', label_tr: 'Finans', label_en: 'Finance' },
  { id: 'personal', label_tr: 'Kişisel', label_en: 'Personal' },
  { id: 'other', label_tr: 'Diğer', label_en: 'Other' },
]

export default function GoalsPage() {
  const { t, language } = useTranslation()
  const { goals, loading, addGoal, updateGoal, deleteGoal, updateProgress } = useGoals()
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredGoals = goals.filter(g => {
    if (filter === 'active') return g.status === 'active'
    if (filter === 'completed') return g.status === 'completed'
    return true
  })

  const activeCount = goals.filter(g => g.status === 'active').length
  const completedCount = goals.filter(g => g.status === 'completed').length
  const avgProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + (g.current_value / g.target_value) * 100, 0) / goals.length)
    : 0

  const handleDelete = async (id: string) => {
    if (confirm(t.messages.delete_confirm)) {
      const success = await deleteGoal(id)
      if (success) toast.success(t.goals.goal_deleted)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t.goals.title}</h1>
          <p className="text-muted-foreground">{t.goals.subtitle}</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t.goals.add_new}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-primary">{activeCount}</p>
            <p className="text-xs text-muted-foreground">{t.goals.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-500">{completedCount}</p>
            <p className="text-xs text-muted-foreground">{t.goals.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{avgProgress}%</p>
            <p className="text-xs text-muted-foreground">{language === 'tr' ? 'Ort. İlerleme' : 'Avg. Progress'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? t.all : f === 'active' ? t.goals.active : t.goals.completed}
          </Button>
        ))}
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">{t.goals.no_goals}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t.goals.create_first}</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t.goals.add_new}
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredGoals.map((goal) => {
            const progress = Math.round((goal.current_value / goal.target_value) * 100)
            const isCompleted = goal.status === 'completed'
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={isCompleted ? 'border-green-500/30 bg-green-500/5' : ''}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className={cn('font-medium', isCompleted && 'line-through text-muted-foreground')}>
                          {goal.title || goal.name}
                        </h3>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(goal.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{goal.current_value} / {goal.target_value} {goal.unit}</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {!isCompleted && (
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateProgress(goal.id, Math.max(0, goal.current_value - 1))}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          value={goal.current_value}
                          onChange={(e) => updateProgress(goal.id, Number(e.target.value))}
                          className="w-20 text-center"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateProgress(goal.id, goal.current_value + 1)}
                        >
                          +
                        </Button>
                        {goal.deadline && (
                          <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(goal.deadline).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })
        )}
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
          <AddGoalModal
            onClose={() => setShowAddModal(false)}
            onAdd={async (data) => {
              const result = await addGoal(data)
              if (result) {
                toast.success(t.goals.goal_added)
                setShowAddModal(false)
              }
            }}
            t={t}
            language={language}
            categories={CATEGORIES}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function AddGoalModal({
  onClose,
  onAdd,
  t,
  language,
  categories,
}: {
  onClose: () => void
  onAdd: (data: any) => void
  t: any
  language: string
  categories: typeof CATEGORIES
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [unit, setUnit] = useState('')
  const [deadline, setDeadline] = useState('')
  const [category, setCategory] = useState<GoalCategory>('personal')

  const handleSubmit = () => {
    if (!title.trim() || !targetValue) return
    onAdd({
      title,
      description,
      target_value: Number(targetValue),
      unit,
      deadline: deadline || undefined,
      category,
    })
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
        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-card rounded-2xl shadow-xl z-50 flex flex-col max-h-[80vh]"
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-xl font-bold">{t.goals.add_new}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">{t.goals.goal_name} *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'tr' ? 'örn: 10 kg ver' : 'e.g., Lose 10 kg'}
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t.goals.description}</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'tr' ? 'Açıklama (opsiyonel)' : 'Description (optional)'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">{t.goals.target_value} *</label>
              <Input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="10"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t.goals.unit}</label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t.goals.deadline}</label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t.goals.category}</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    category === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-accent'
                  )}
                >
                  {language === 'tr' ? cat.label_tr : cat.label_en}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex gap-3 p-4 border-t shrink-0">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={!title.trim() || !targetValue}>
            {t.add}
          </Button>
        </div>
      </motion.div>
    </>
  )
}

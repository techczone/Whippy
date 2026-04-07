'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, TrendingUp, CheckCircle, Clock } from 'lucide-react'
import { cn, GOAL_CATEGORY_ICONS, COLOR_OPTIONS } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { GoalCard, GoalsSummary } from '@/components/goals/goal-card'
import type { Goal, GoalCategory } from '@/types'

const DEMO_GOALS: Goal[] = [
  { id: '1', user_id: '1', title: '10 kg ver', name: '10 kg ver', description: 'Sağlıklı kilo hedefi', target_value: 10, current_value: 4, unit: 'kg', deadline: '2025-06-01', category: 'health', status: 'active', created_at: '', updated_at: '' },
  { id: '2', user_id: '1', title: '50 kitap oku', name: '50 kitap oku', description: 'Yıllık okuma hedefi', target_value: 50, current_value: 18, unit: 'kitap', deadline: '2025-12-31', category: 'education', status: 'active', created_at: '', updated_at: '' },
  { id: '3', user_id: '1', title: '₺100.000 biriktir', name: '₺100.000 biriktir', description: 'Acil durum fonu', target_value: 100000, current_value: 35000, unit: '₺', deadline: '2025-12-31', category: 'finance', status: 'active', created_at: '', updated_at: '' },
  { id: '4', user_id: '1', title: 'İngilizce C1', name: 'İngilizce C1', description: 'Dil seviyesi hedefi', target_value: 100, current_value: 65, unit: '%', deadline: '2025-09-01', category: 'education', status: 'active', created_at: '', updated_at: '' },
  { id: '5', user_id: '1', title: 'Maraton koş', name: 'Maraton koş', description: '42 km maraton tamamla', target_value: 42, current_value: 21, unit: 'km', deadline: '2025-10-15', category: 'fitness', status: 'active', created_at: '', updated_at: '' },
  { id: '6', user_id: '1', title: '30 gün meditasyon', name: '30 gün meditasyon', description: 'Kesintisiz meditasyon serisi', target_value: 30, current_value: 30, unit: 'gün', deadline: '2025-02-01', category: 'personal', status: 'completed', created_at: '', updated_at: '' },
]

const CATEGORIES: { id: GoalCategory; label: string }[] = [
  { id: 'health', label: 'Sağlık' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'career', label: 'Kariyer' },
  { id: 'education', label: 'Eğitim' },
  { id: 'finance', label: 'Finans' },
  { id: 'relationship', label: 'İlişki' },
  { id: 'personal', label: 'Kişisel' },
  { id: 'other', label: 'Diğer' },
]

export default function GoalsPage() {
  const [goals, setGoals] = useState(DEMO_GOALS)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    name: '',
    description: '',
    target_value: 0,
    unit: '',
    deadline: '',
    category: 'personal' as GoalCategory,
  })

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

  const handleUpdateProgress = (id: string, value: number) => {
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, current_value: Math.min(g.target_value, Math.max(0, value)) } : g
    ))
  }

  const handleStatusChange = (id: string, status: Goal['status']) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, status } : g))
  }

  const handleDelete = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const handleAddGoal = () => {
    if (!newGoal.name.trim()) return
    
    const goal: Goal = {
      id: Date.now().toString(),
      user_id: '1',
      name: newGoal.name,
      description: newGoal.description || null,
      target_value: newGoal.target_value,
      current_value: 0,
      unit: newGoal.unit,
      deadline: newGoal.deadline || null,
      category: newGoal.category,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    setGoals(prev => [...prev, goal])
    setNewGoal({ name: '', description: '', target_value: 0, unit: '', deadline: '', category: 'personal' })
    setShowAddModal(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Hedefler</h1>
          <p className="text-muted-foreground">Büyük hayallerini küçük adımlara böl</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Hedef
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{goals.length}</p>
                <p className="text-xs text-muted-foreground">Toplam hedef</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-xs text-muted-foreground">Tamamlanan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgProgress}%</p>
                <p className="text-xs text-muted-foreground">Ort. ilerleme</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Tümü' : f === 'active' ? 'Aktif' : 'Tamamlanan'}
          </Button>
        ))}
      </div>

      {/* Goals grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdateProgress={handleUpdateProgress}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredGoals.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Henüz hedef eklenmemiş</p>
          <Button className="mt-4" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            İlk Hedefinizi Ekleyin
          </Button>
        </div>
      )}

      {/* Add goal modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Yeni Hedef</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Hedef Adı</label>
                  <Input
                    value={newGoal.name}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="örn: 10 kg ver"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Açıklama (opsiyonel)</label>
                  <Input
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Kısa açıklama..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hedef Değer</label>
                    <Input
                      type="number"
                      value={newGoal.target_value || ''}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, target_value: parseInt(e.target.value) || 0 }))}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Birim</label>
                    <Input
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="kg, saat, ₺"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Bitiş Tarihi</label>
                  <Input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Kategori</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setNewGoal(prev => ({ ...prev, category: cat.id }))}
                        className={cn(
                          'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                          newGoal.category === cat.id 
                            ? 'bg-primary/20 ring-2 ring-primary' 
                            : 'bg-secondary hover:bg-secondary/80'
                        )}
                      >
                        <span className="text-lg">{GOAL_CATEGORY_ICONS[cat.id]}</span>
                        <span className="text-[10px]">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                    İptal
                  </Button>
                  <Button onClick={handleAddGoal} className="flex-1">
                    Ekle
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

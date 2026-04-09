'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, TrendingUp, CheckCircle, Clock, X } from 'lucide-react'
import { cn, GOAL_CATEGORY_ICONS } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { GoalCard } from '@/components/goals/goal-card'
import { useGoals } from '@/hooks/use-goals'
import { useAuth } from '@/hooks/use-auth'
import type { Goal, GoalCategory } from '@/types'

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
  const { user } = useAuth()
  const userId = user?.id

  const { 
    goals, 
    loading, 
    activeCount, 
    completedCount, 
    avgProgress,
    addGoal,
    updateProgress,
    updateGoal,
    deleteGoal 
  } = useGoals(userId)

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  
  const [newGoal, setNewGoal] = useState({
    title: '',
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

  const handleUpdateProgress = async (id: string, value: number) => {
    await updateProgress(id, value)
  }

  const handleStatusChange = async (id: string, status: Goal['status']) => {
    await updateGoal(id, { status })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bu hedefi silmek istediğine emin misin?')) {
      await deleteGoal(id)
    }
  }

  const handleEdit = (id: string) => {
    const goal = goals.find(g => g.id === id)
    if (goal) {
      setEditingGoal(goal)
      setShowEditModal(true)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingGoal) return
    
    await updateGoal(editingGoal.id, {
      title: editingGoal.title,
      description: editingGoal.description,
      target_value: editingGoal.target_value,
      current_value: editingGoal.current_value,
      unit: editingGoal.unit,
      deadline: editingGoal.deadline,
      category: editingGoal.category,
    })
    
    setShowEditModal(false)
    setEditingGoal(null)
  }

  const handleAddGoal = async () => {
    if (!newGoal.title.trim()) return
    
    const result = await addGoal({
      title: newGoal.title,
      description: newGoal.description || null,
      target_value: newGoal.target_value,
      unit: newGoal.unit,
      deadline: newGoal.deadline || null,
      category: newGoal.category,
    })
    
    if (result) {
      setNewGoal({ title: '', description: '', target_value: 0, unit: '', deadline: '', category: 'personal' })
      setShowAddModal(false)
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
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
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
              onEdit={handleEdit}
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

      {/* Mobile FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-4 md:hidden w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Yeni Hedef</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Hedef Adı</label>
                  <Input
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
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
                        type="button"
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

      {/* Edit goal modal */}
      <AnimatePresence>
        {showEditModal && editingGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => { setShowEditModal(false); setEditingGoal(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Hedefi Düzenle</h2>
                <Button variant="ghost" size="icon" onClick={() => { setShowEditModal(false); setEditingGoal(null); }}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Hedef Adı</label>
                  <Input
                    value={editingGoal.title || ''}
                    onChange={(e) => setEditingGoal(prev => prev ? { ...prev, title: e.target.value } : null)}
                    placeholder="örn: 10 kg ver"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Açıklama</label>
                  <Input
                    value={editingGoal.description || ''}
                    onChange={(e) => setEditingGoal(prev => prev ? { ...prev, description: e.target.value } : null)}
                    placeholder="Kısa açıklama..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Mevcut Değer</label>
                    <Input
                      type="number"
                      value={editingGoal.current_value || 0}
                      onChange={(e) => setEditingGoal(prev => prev ? { ...prev, current_value: parseInt(e.target.value) || 0 } : null)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Hedef Değer</label>
                    <Input
                      type="number"
                      value={editingGoal.target_value || 0}
                      onChange={(e) => setEditingGoal(prev => prev ? { ...prev, target_value: parseInt(e.target.value) || 0 } : null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Birim</label>
                    <Input
                      value={editingGoal.unit || ''}
                      onChange={(e) => setEditingGoal(prev => prev ? { ...prev, unit: e.target.value } : null)}
                      placeholder="kg, saat, ₺"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Bitiş Tarihi</label>
                    <Input
                      type="date"
                      value={editingGoal.deadline || ''}
                      onChange={(e) => setEditingGoal(prev => prev ? { ...prev, deadline: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Kategori</label>
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setEditingGoal(prev => prev ? { ...prev, category: cat.id } : null)}
                        className={cn(
                          'flex flex-col items-center gap-1 p-2 rounded-lg transition-all',
                          editingGoal.category === cat.id 
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
                  <Button variant="outline" onClick={() => { setShowEditModal(false); setEditingGoal(null); }} className="flex-1">
                    İptal
                  </Button>
                  <Button onClick={handleSaveEdit} className="flex-1">
                    Kaydet
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

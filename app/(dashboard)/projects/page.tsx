'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FolderKanban, Clock, CheckCircle, Pause, Play, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useProjects } from '@/hooks/use-projects'
import { useTranslation } from '@/hooks/use-translation'
import type { Project } from '@/types'
import toast from 'react-hot-toast'

const COLOR_OPTIONS = ['#8B5CF6', '#3B82F6', '#22C55E', '#F97316', '#EC4899', '#14B8A6', '#EAB308', '#EF4444']

const PRIORITIES = [
  { id: 'low', label_tr: 'Düşük', label_en: 'Low' },
  { id: 'medium', label_tr: 'Orta', label_en: 'Medium' },
  { id: 'high', label_tr: 'Yüksek', label_en: 'High' },
]

export default function ProjectsPage() {
  const { t, language } = useTranslation()
  const { projects = [], loading, addProject, updateProject, deleteProject } = useProjects()
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const safeProjects = projects || []

  const filteredProjects = safeProjects.filter(p => {
    if (filter === 'all') return true
    return p.status === filter
  })

  const activeCount = safeProjects.filter(p => p.status === 'active').length
  const completedCount = safeProjects.filter(p => p.status === 'completed').length
  const pausedCount = safeProjects.filter(p => p.status === 'paused').length

  const handleUpdateProgress = async (id: string, progress: number) => {
    const newProgress = Math.min(100, Math.max(0, progress))
    const newStatus = newProgress >= 100 ? 'completed' : 'active'
    await updateProject(id, { progress: newProgress, status: newStatus })
  }

  const handleStatusChange = async (id: string, status: Project['status']) => {
    await updateProject(id, { 
      status, 
      progress: status === 'completed' ? 100 : undefined 
    })
    toast.success(language === 'tr' ? 'Güncellendi' : 'Updated')
  }

  const handleDelete = async (id: string) => {
    if (confirm(t.messages?.delete_confirm || 'Silmek istediğine emin misin?')) {
      await deleteProject(id)
      toast.success(language === 'tr' ? 'Silindi' : 'Deleted')
    }
  }

  if (!mounted || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t.projects?.title || 'Projeler'}</h1>
          <p className="text-muted-foreground">{t.projects?.subtitle || 'Projelerini yönet'}</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t.projects?.add_new || 'Yeni Proje'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-primary">{activeCount}</p>
            <p className="text-xs text-muted-foreground">{t.projects?.active || 'Aktif'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-500">{completedCount}</p>
            <p className="text-xs text-muted-foreground">{t.projects?.completed || 'Tamamlandı'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{pausedCount}</p>
            <p className="text-xs text-muted-foreground">{t.projects?.paused || 'Beklemede'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'active', 'paused', 'completed'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="shrink-0"
          >
            {f === 'all' ? (t.all || 'Tümü') : 
             f === 'active' ? (t.projects?.active || 'Aktif') : 
             f === 'paused' ? (t.projects?.paused || 'Beklemede') : 
             (t.projects?.completed || 'Tamamlandı')}
          </Button>
        ))}
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderKanban className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">{t.projects?.no_projects || 'Henüz proje yok'}</h3>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t.projects?.add_new || 'Yeni Proje'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredProjects.map((project) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={cn(
                project.status === 'completed' && 'border-green-500/30 bg-green-500/5',
                project.status === 'paused' && 'border-yellow-500/30 bg-yellow-500/5'
              )}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        {project.description && <p className="text-sm text-muted-foreground">{project.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {project.status !== 'completed' && (
                        <Button variant="ghost" size="icon" onClick={() => handleStatusChange(project.id, project.status === 'paused' ? 'active' : 'paused')}>
                          {project.status === 'paused' ? <Play className="w-4 h-4 text-green-500" /> : <Pause className="w-4 h-4 text-yellow-500" />}
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{language === 'tr' ? 'İlerleme' : 'Progress'}</span>
                      <span className="font-medium">{project.progress || 0}%</span>
                    </div>
                    <Progress value={project.progress || 0} className="h-2" />
                  </div>

                  {project.status !== 'completed' && (
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={() => handleUpdateProgress(project.id, (project.progress || 0) - 10)}>-10%</Button>
                      <Button variant="outline" size="sm" onClick={() => handleUpdateProgress(project.id, (project.progress || 0) + 10)}>+10%</Button>
                      <Button variant="default" size="sm" className="ml-auto" onClick={() => handleStatusChange(project.id, 'completed')}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {language === 'tr' ? 'Tamamla' : 'Done'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Mobile FAB */}
      <Button onClick={() => setShowAddModal(true)} className="fixed bottom-20 right-4 w-14 h-14 rounded-full shadow-lg md:hidden z-30" size="icon">
        <Plus className="w-6 h-6" />
      </Button>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddProjectModal
            onClose={() => setShowAddModal(false)}
            onAdd={async (data) => {
              const result = await addProject(data)
              if (result) {
                toast.success(language === 'tr' ? 'Eklendi' : 'Added')
                setShowAddModal(false)
              }
            }}
            t={t}
            language={language}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function AddProjectModal({ onClose, onAdd, t, language }: { onClose: () => void; onAdd: (data: any) => void; t: any; language: string }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [dueDate, setDueDate] = useState('')
  const [color, setColor] = useState(COLOR_OPTIONS[0])
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim() || submitting) return
    setSubmitting(true)
    await onAdd({ name, description, priority, due_date: dueDate || undefined, color })
    setSubmitting(false)
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed left-4 right-4 top-20 bottom-20 md:inset-x-auto md:left-1/2 md:top-[10%] md:bottom-auto md:-translate-x-1/2 md:w-full md:max-w-md md:max-h-[80vh] bg-card rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <h2 className="text-lg font-bold">{t.projects?.add_new || 'Yeni Proje'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">{t.projects?.project_name || 'Proje Adı'} *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={language === 'tr' ? 'örn: Web Sitesi' : 'e.g., Website'} autoFocus />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">{t.projects?.priority || 'Öncelik'}</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button key={p.id} onClick={() => setPriority(p.id as any)} className={cn('flex-1 px-3 py-1.5 rounded-lg text-sm font-medium', priority === p.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent')}>
                  {language === 'tr' ? p.label_tr : p.label_en}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">{t.projects?.due_date || 'Bitiş'}</label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">{t.projects?.color || 'Renk'}</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button key={c} onClick={() => setColor(c)} className={cn('w-8 h-8 rounded-full', color === c && 'ring-2 ring-offset-2 ring-primary')} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t shrink-0">
          <Button variant="outline" className="flex-1" onClick={onClose}>{t.cancel || 'İptal'}</Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={!name.trim() || submitting}>{submitting ? '...' : (t.add || 'Ekle')}</Button>
        </div>
      </motion.div>
    </>
  )
}

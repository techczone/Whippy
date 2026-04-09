'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FolderKanban, Clock, CheckCircle, Pause } from 'lucide-react'
import { cn, COLOR_OPTIONS } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ProjectCard } from '@/components/projects/project-card'
import { useProjects } from '@/hooks/use-projects'
import { useAuth } from '@/hooks/use-auth'
import type { Project } from '@/types'

const PRIORITIES = [
  { id: 'low', label: 'Düşük', color: 'bg-blue-500' },
  { id: 'medium', label: 'Orta', color: 'bg-yellow-500' },
  { id: 'high', label: 'Yüksek', color: 'bg-red-500' },
]

export default function ProjectsPage() {
  const { user } = useAuth()
  const userId = user?.id

  const { 
    projects, 
    loading,
    activeCount,
    completedCount,
    pausedCount,
    addProject,
    updateProgress,
    updateProject,
    deleteProject 
  } = useProjects(userId)

  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    priority: 'medium' as Project['priority'],
    deadline: '',
    color: COLOR_OPTIONS[0],
  })

  const filteredProjects = projects.filter(p => {
    if (filter === 'all') return true
    return p.status === filter
  })

  const handleUpdateProgress = async (id: string, progress: number) => {
    await updateProgress(id, progress)
  }

  const handleStatusChange = async (id: string, status: Project['status']) => {
    await updateProject(id, { status, progress: status === 'completed' ? 100 : undefined })
  }

  const handleDelete = async (id: string) => {
    await deleteProject(id)
  }

  const handleAddProject = async () => {
    if (!newProject.name.trim()) return
    
    await addProject({
      name: newProject.name,
      description: newProject.description || null,
      priority: newProject.priority,
      deadline: newProject.deadline || null,
      color: newProject.color,
    })
    
    setNewProject({ name: '', description: '', priority: 'medium', deadline: '', color: COLOR_OPTIONS[0] })
    setShowAddModal(false)
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
          <h1 className="text-2xl md:text-3xl font-bold">Projeler</h1>
          <p className="text-muted-foreground">Büyük işleri yönetilebilir parçalara böl</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Proje
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-xs text-muted-foreground">Toplam proje</p>
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
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Pause className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pausedCount}</p>
                <p className="text-xs text-muted-foreground">Duraklatılmış</p>
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
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'active', 'paused', 'completed'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Tümü' : f === 'active' ? 'Aktif' : f === 'paused' ? 'Duraklatılmış' : 'Tamamlanan'}
          </Button>
        ))}
      </div>

      {/* Projects grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onUpdateProgress={handleUpdateProgress}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {filter === 'all' ? 'Henüz proje eklenmemiş' : 'Bu kategoride proje yok'}
          </p>
          {filter === 'all' && (
            <Button className="mt-4" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              İlk Projenizi Ekleyin
            </Button>
          )}
        </div>
      )}

      {/* Add project modal */}
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
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Yeni Proje</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Proje Adı</label>
                  <Input
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="örn: Kişisel Web Sitesi"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Açıklama (opsiyonel)</label>
                  <Input
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Kısa açıklama..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Öncelik</label>
                  <div className="flex gap-2">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setNewProject(prev => ({ ...prev, priority: p.id as Project['priority'] }))}
                        className={cn(
                          'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all',
                          newProject.priority === p.id 
                            ? `${p.color} text-white` 
                            : 'bg-secondary hover:bg-secondary/80'
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Bitiş Tarihi</label>
                  <Input
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Renk</label>
                  <div className="flex gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewProject(prev => ({ ...prev, color }))}
                        className={cn(
                          'w-8 h-8 rounded-full transition-all',
                          newProject.color === color && 'ring-2 ring-offset-2 ring-offset-background ring-primary'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                    İptal
                  </Button>
                  <Button onClick={handleAddProject} className="flex-1">
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

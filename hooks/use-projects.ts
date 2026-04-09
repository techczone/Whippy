'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/types'
import toast from 'react-hot-toast'

export function useProjects(userId: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const supabase = useMemo(() => createClient(), [])

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    if (!userId) {
      setProjects([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, supabase])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Add project
  const addProject = async (project: { name: string; description?: string | null; priority: string; deadline?: string | null; color: string }) => {
    if (!userId) return null

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: project.name,
          description: project.description || null,
          priority: project.priority,
          deadline: project.deadline || null,
          color: project.color,
          user_id: userId,
          progress: 0,
          status: 'active',
        })
        .select()
        .single()

      if (error) throw error
      
      setProjects(prev => [data, ...prev])
      toast.success('Proje eklendi!')
      return data
    } catch (err) {
      console.error('Error adding project:', err)
      toast.error('Proje eklenemedi')
      return null
    }
  }

  // Update project
  const updateProject = async (id: string, updates: Partial<Project>) => {
    // Optimistic update
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      setProjects(prev => prev.map(p => p.id === id ? data : p))
      return data
    } catch (err) {
      console.error('Error updating project:', err)
      toast.error('Güncelleme başarısız')
      fetchProjects() // Rollback
      return null
    }
  }

  // Update progress
  const updateProgress = async (id: string, progress: number) => {
    const newProgress = Math.min(100, Math.max(0, progress))
    const newStatus = newProgress >= 100 ? 'completed' : 'active'
    
    await updateProject(id, { 
      progress: newProgress,
      status: newStatus 
    })

    if (newProgress >= 100) {
      toast.success('🎉 Proje tamamlandı!')
    }
  }

  // Delete project
  const deleteProject = async (id: string) => {
    // Optimistic update
    setProjects(prev => prev.filter(p => p.id !== id))
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast.success('Proje silindi')
    } catch (err) {
      console.error('Error deleting project:', err)
      toast.error('Silme başarısız')
      fetchProjects() // Rollback
    }
  }

  // Stats
  const activeProjects = projects.filter(p => p.status === 'active')
  const completedProjects = projects.filter(p => p.status === 'completed')
  const pausedProjects = projects.filter(p => p.status === 'paused')

  return {
    projects,
    loading,
    error,
    activeCount: activeProjects.length,
    completedCount: completedProjects.length,
    pausedCount: pausedProjects.length,
    addProject,
    updateProject,
    updateProgress,
    deleteProject,
    refetch: fetchProjects,
  }
}

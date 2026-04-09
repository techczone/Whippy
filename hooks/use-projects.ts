'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'
import type { Project, ProjectTask } from '@/types'

export function useProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  
  const supabase = useMemo(() => createClient(), [])

  // Fetch projects with tasks
  useEffect(() => {
    if (!user?.id) {
      setProjects([])
      setLoading(false)
      return
    }

    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            tasks:project_tasks(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setProjects(data || [])
      } catch (err) {
        console.error('Error fetching projects:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user?.id, supabase])

  // Add project
  const addProject = useCallback(async (projectData: {
    name: string
    description?: string
    status?: string
    priority?: string
    due_date?: string
    color?: string
  }) => {
    if (!user?.id) return null

    const newProject = {
      user_id: user.id,
      name: projectData.name,
      description: projectData.description || null,
      status: projectData.status || 'active',
      priority: projectData.priority || 'medium',
      due_date: projectData.due_date || null,
      color: projectData.color || '#8B5CF6',
    }

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const optimisticProject = { ...newProject, id: tempId, tasks: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Project
    setProjects(prev => [optimisticProject, ...prev])

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(newProject)
        .select()
        .single()

      if (error) throw error

      // Replace temp with real
      setProjects(prev => prev.map(p => p.id === tempId ? { ...data, tasks: [] } : p))
      return data
    } catch (err) {
      // Rollback
      setProjects(prev => prev.filter(p => p.id !== tempId))
      console.error('Error adding project:', err)
      return null
    }
  }, [user?.id, supabase])

  // Update project
  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    if (!user?.id) return false

    const prevProjects = [...projects]
    
    // Optimistic update
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))

    try {
      const { error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      return true
    } catch (err) {
      // Rollback
      setProjects(prevProjects)
      console.error('Error updating project:', err)
      return false
    }
  }, [user?.id, supabase, projects])

  // Delete project
  const deleteProject = useCallback(async (id: string) => {
    if (!user?.id) return false

    const prevProjects = [...projects]
    
    // Optimistic update
    setProjects(prev => prev.filter(p => p.id !== id))

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      return true
    } catch (err) {
      // Rollback
      setProjects(prevProjects)
      console.error('Error deleting project:', err)
      return false
    }
  }, [user?.id, supabase, projects])

  // Add task to project
  const addTask = useCallback(async (projectId: string, taskData: {
    title: string
    description?: string
  }) => {
    if (!user?.id) return null

    const newTask = {
      project_id: projectId,
      user_id: user.id,
      title: taskData.title,
      description: taskData.description || null,
      completed: false,
    }

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const optimisticTask = { ...newTask, id: tempId, created_at: new Date().toISOString() } as ProjectTask
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, tasks: [...(p.tasks || []), optimisticTask] }
        : p
    ))

    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .insert(newTask)
        .select()
        .single()

      if (error) throw error

      // Replace temp with real
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, tasks: (p.tasks || []).map(t => t.id === tempId ? data : t) }
          : p
      ))
      return data
    } catch (err) {
      // Rollback
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, tasks: (p.tasks || []).filter(t => t.id !== tempId) }
          : p
      ))
      console.error('Error adding task:', err)
      return null
    }
  }, [user?.id, supabase])

  // Toggle task completion
  const toggleTask = useCallback(async (projectId: string, taskId: string) => {
    const project = projects.find(p => p.id === projectId)
    const task = project?.tasks?.find(t => t.id === taskId)
    if (!task) return false

    const newCompleted = !task.completed

    // Optimistic update
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, tasks: (p.tasks || []).map(t => t.id === taskId ? { ...t, completed: newCompleted } : t) }
        : p
    ))

    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ completed: newCompleted })
        .eq('id', taskId)

      if (error) throw error
      return true
    } catch (err) {
      // Rollback
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, tasks: (p.tasks || []).map(t => t.id === taskId ? { ...t, completed: !newCompleted } : t) }
          : p
      ))
      console.error('Error toggling task:', err)
      return false
    }
  }, [projects, supabase])

  // Delete task
  const deleteTask = useCallback(async (projectId: string, taskId: string) => {
    const prevProjects = [...projects]

    // Optimistic update
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, tasks: (p.tasks || []).filter(t => t.id !== taskId) }
        : p
    ))

    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      return true
    } catch (err) {
      // Rollback
      setProjects(prevProjects)
      console.error('Error deleting task:', err)
      return false
    }
  }, [projects, supabase])

  return {
    projects,
    loading,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    toggleTask,
    deleteTask,
  }
}

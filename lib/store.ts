import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  User, 
  Habit, 
  HabitLog, 
  Goal, 
  MoodEntry, 
  HealthEntry, 
  Project,
  CoachMode,
  CoachMessage,
  DailyStats
} from '@/types'

export type Theme = 'light' | 'dark' | 'system'
export type Language = 'tr' | 'en'

export interface NotificationSettings {
  email: boolean
  push: boolean
  reminders: boolean
  weekly: boolean
}

export interface AppSettings {
  theme: Theme
  language: Language
  notifications: NotificationSettings
}

interface AppState {
  // User state
  user: User | null
  setUser: (user: User | null) => void
  
  // Settings state
  settings: AppSettings
  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
  setNotifications: (notifications: NotificationSettings) => void
  updateNotification: (key: keyof NotificationSettings, value: boolean) => void
  
  // UI state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Coach state
  coachMode: CoachMode
  setCoachMode: (mode: CoachMode) => void
  coachMessages: CoachMessage[]
  addCoachMessage: (message: CoachMessage) => void
  clearCoachMessages: () => void
  
  // Data state (for optimistic updates)
  habits: Habit[]
  setHabits: (habits: Habit[]) => void
  addHabit: (habit: Habit) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  removeHabit: (id: string) => void
  
  habitLogs: HabitLog[]
  setHabitLogs: (logs: HabitLog[]) => void
  addHabitLog: (log: HabitLog) => void
  
  goals: Goal[]
  setGoals: (goals: Goal[]) => void
  addGoal: (goal: Goal) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  removeGoal: (id: string) => void
  
  moods: MoodEntry[]
  setMoods: (moods: MoodEntry[]) => void
  addMood: (mood: MoodEntry) => void
  
  health: HealthEntry[]
  setHealth: (entries: HealthEntry[]) => void
  updateHealth: (date: string, updates: Partial<HealthEntry>) => void
  
  projects: Project[]
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  removeProject: (id: string) => void
  
  // Stats
  todayStats: DailyStats | null
  setTodayStats: (stats: DailyStats | null) => void
  weeklyStats: DailyStats[]
  setWeeklyStats: (stats: DailyStats[]) => void
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'tr',
  notifications: {
    email: true,
    push: true,
    reminders: true,
    weekly: true,
  },
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),
      
      // Settings state
      settings: defaultSettings,
      setTheme: (theme) => set((state) => ({ 
        settings: { ...state.settings, theme } 
      })),
      setLanguage: (language) => set((state) => ({ 
        settings: { ...state.settings, language } 
      })),
      setNotifications: (notifications) => set((state) => ({ 
        settings: { ...state.settings, notifications } 
      })),
      updateNotification: (key, value) => set((state) => ({
        settings: {
          ...state.settings,
          notifications: { ...state.settings.notifications, [key]: value }
        }
      })),
      
      // UI state
      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      
      // Coach state
      coachMode: 'gentle',
      setCoachMode: (coachMode) => set({ coachMode }),
      coachMessages: [],
      addCoachMessage: (message) => 
        set((state) => ({ 
          coachMessages: [...state.coachMessages, message].slice(-50) // Keep last 50 messages
        })),
      clearCoachMessages: () => set({ coachMessages: [] }),
      
      // Habits
      habits: [],
      setHabits: (habits) => set({ habits }),
      addHabit: (habit) => 
        set((state) => ({ habits: [...state.habits, habit] })),
      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        })),
      removeHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),
      
      // Habit Logs
      habitLogs: [],
      setHabitLogs: (habitLogs) => set({ habitLogs }),
      addHabitLog: (log) =>
        set((state) => ({ habitLogs: [...state.habitLogs, log] })),
      
      // Goals
      goals: [],
      setGoals: (goals) => set({ goals }),
      addGoal: (goal) =>
        set((state) => ({ goals: [...state.goals, goal] })),
      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),
      removeGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),
      
      // Moods
      moods: [],
      setMoods: (moods) => set({ moods }),
      addMood: (mood) =>
        set((state) => {
          // Replace if same date exists
          const filtered = state.moods.filter((m) => m.date !== mood.date)
          return { moods: [...filtered, mood] }
        }),
      
      // Health
      health: [],
      setHealth: (health) => set({ health }),
      updateHealth: (date, updates) =>
        set((state) => {
          const existing = state.health.find((h) => h.date === date)
          if (existing) {
            return {
              health: state.health.map((h) =>
                h.date === date ? { ...h, ...updates } : h
              ),
            }
          }
          return {
            health: [...state.health, { date, ...updates } as HealthEntry],
          }
        }),
      
      // Projects
      projects: [],
      setProjects: (projects) => set({ projects }),
      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),
      
      // Stats
      todayStats: null,
      setTodayStats: (todayStats) => set({ todayStats }),
      weeklyStats: [],
      setWeeklyStats: (weeklyStats) => set({ weeklyStats }),
    }),
    {
      name: 'whippy-storage',
      partialize: (state) => ({
        settings: state.settings,
        coachMode: state.coachMode,
        coachMessages: state.coachMessages,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)

// Selectors for computed values
export const useHabitsForToday = () => {
  const habits = useAppStore((state) => state.habits)
  const habitLogs = useAppStore((state) => state.habitLogs)
  const today = new Date().toISOString().split('T')[0]
  
  return habits
    .filter((h) => !h.archived)
    .map((habit) => ({
      ...habit,
      completedToday: habitLogs.some(
        (log) => log.habit_id === habit.id && log.date === today && log.completed
      ),
    }))
}

export const useTodayMood = () => {
  const moods = useAppStore((state) => state.moods)
  const today = new Date().toISOString().split('T')[0]
  return moods.find((m) => m.date === today)
}

export const useTodayHealth = () => {
  const health = useAppStore((state) => state.health)
  const today = new Date().toISOString().split('T')[0]
  return health.find((h) => h.date === today)
}

export const useActiveGoals = () => {
  const goals = useAppStore((state) => state.goals)
  return goals.filter((g) => g.status === 'active')
}

export const useActiveProjects = () => {
  const projects = useAppStore((state) => state.projects)
  return projects.filter((p) => p.status === 'active')
}

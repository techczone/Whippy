// User types
export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  settings: UserSettings
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'tr' | 'en'
  notifications: boolean
  coachMode: CoachMode
  weekStartsOn: 0 | 1 // 0 = Sunday, 1 = Monday
}

// Coach types
export type CoachMode = 'gentle' | 'brutal' | 'oracle'

export interface CoachMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  mode: CoachMode
  timestamp: string
}

// Habit types
export interface Habit {
  id: string
  user_id: string
  name: string
  description?: string | null
  icon: string
  color: string
  frequency: 'daily' | 'weekly' | 'custom'
  target_days?: number[] // 0-6 for custom frequency
  reminder_time?: string | null
  streak: number
  best_streak: number
  created_at: string
  updated_at?: string
  archived?: boolean
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  date: string // YYYY-MM-DD
  completed: boolean
  note?: string | null
  created_at: string
}

// Goal types
export interface Goal {
  id: string
  user_id: string
  name?: string
  title?: string
  description?: string | null
  target_value: number
  current_value: number
  unit: string
  deadline?: string | null
  category: GoalCategory
  status: 'active' | 'completed' | 'paused' | 'failed'
  created_at: string
  updated_at?: string
}

export type GoalCategory = 
  | 'health'
  | 'fitness'
  | 'career'
  | 'education'
  | 'finance'
  | 'relationship'
  | 'personal'
  | 'other'

// Mood types
export interface MoodEntry {
  id: string
  user_id: string
  date: string
  value: 1 | 2 | 3 | 4 | 5
  note?: string | null
  tags?: string[]
  energy_level?: number | null
  stress_level?: number | null
  created_at: string
}

export const MOOD_EMOJIS = {
  1: '😫',
  2: '😔',
  3: '😐',
  4: '🙂',
  5: '😄',
} as const

export const MOOD_LABELS = {
  1: 'Çok Kötü',
  2: 'Kötü',
  3: 'Orta',
  4: 'İyi',
  5: 'Harika',
} as const

// Health tracking types
export interface HealthEntry {
  id?: string
  user_id?: string
  date: string
  sleep_hours?: number | null
  water_liters?: number | null
  calories?: number | null
  exercise_minutes?: number | null
  steps?: number | null
  weight?: number | null
  notes?: string | null
  created_at?: string
  updated_at?: string
}

// Project types
export interface Project {
  id: string
  user_id: string
  name: string
  description?: string | null
  progress: number
  status: 'active' | 'paused' | 'completed' | 'archived'
  priority?: 'low' | 'medium' | 'high'
  deadline?: string | null
  color: string
  created_at: string
  updated_at?: string
}

// Analytics types
export interface DailyStats {
  date: string
  productivity_score: number
  health_score: number
  mood_score: number
  overall_score: number
  habits_completed: number
  habits_total: number
  goals_progress: number
}

export interface WeeklyReport {
  week_start: string
  week_end: string
  avg_productivity: number
  avg_health: number
  avg_mood: number
  total_habits_completed: number
  total_exercise_minutes: number
  total_sleep_hours: number
  highlights: string[]
  areas_to_improve: string[]
  ai_insights: string
}

export interface Prediction {
  scenario: 'optimistic' | 'realistic' | 'pessimistic'
  date: string
  predicted_productivity: number
  predicted_health: number
  predicted_mood: number
  predicted_goal_completion: number
  key_factors: string[]
  recommendations: string[]
}

// AI Analysis types
export interface Correlation {
  factor_a: string
  factor_b: string
  correlation_coefficient: number
  insight: string
}

export interface Pattern {
  name: string
  description: string
  frequency: string
  impact: 'positive' | 'negative' | 'neutral'
  recommendation: string
}

// Notification types
export interface Notification {
  id: string
  user_id: string
  type: 'reminder' | 'achievement' | 'warning' | 'insight'
  title: string
  message: string
  read: boolean
  action_url: string | null
  created_at: string
}

// Achievement types
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'habit' | 'goal' | 'streak' | 'health' | 'special'
  requirement: string
  points: number
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  achievement: Achievement
}

// Subscription types
export type SubscriptionTier = 'free' | 'pro' | 'elite'

export interface Subscription {
  id: string
  user_id: string
  tier: SubscriptionTier
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
}

export const TIER_LIMITS = {
  free: {
    max_habits: 3,
    max_goals: 2,
    max_projects: 1,
    ai_messages_per_day: 5,
    brutal_mode: false,
    oracle_mode: false,
    reports: false,
    integrations: false,
  },
  pro: {
    max_habits: 20,
    max_goals: 10,
    max_projects: 10,
    ai_messages_per_day: 50,
    brutal_mode: true,
    oracle_mode: true,
    reports: true,
    integrations: true,
  },
  elite: {
    max_habits: -1, // unlimited
    max_goals: -1,
    max_projects: -1,
    ai_messages_per_day: -1,
    brutal_mode: true,
    oracle_mode: true,
    reports: true,
    integrations: true,
  },
} as const

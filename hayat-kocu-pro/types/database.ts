// Auto-generated types for Supabase
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          timezone: string
          language: 'tr' | 'en'
          theme: 'light' | 'dark' | 'system'
          notifications_enabled: boolean
          coach_mode: 'gentle' | 'brutal' | 'predict'
          week_starts_on: 0 | 1
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          timezone?: string
          language?: 'tr' | 'en'
          theme?: 'light' | 'dark' | 'system'
          notifications_enabled?: boolean
          coach_mode?: 'gentle' | 'brutal' | 'predict'
          week_starts_on?: 0 | 1
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          timezone?: string
          language?: 'tr' | 'en'
          theme?: 'light' | 'dark' | 'system'
          notifications_enabled?: boolean
          coach_mode?: 'gentle' | 'brutal' | 'predict'
          week_starts_on?: 0 | 1
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          tier: 'free' | 'pro' | 'elite'
          status: 'active' | 'cancelled' | 'expired' | 'trial'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tier?: 'free' | 'pro' | 'elite'
          status?: 'active' | 'cancelled' | 'expired' | 'trial'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tier?: 'free' | 'pro' | 'elite'
          status?: 'active' | 'cancelled' | 'expired' | 'trial'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          icon: string
          color: string
          frequency: 'daily' | 'weekly' | 'custom'
          target_days: number[]
          reminder_time: string | null
          streak: number
          best_streak: number
          total_completions: number
          archived: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          icon?: string
          color?: string
          frequency?: 'daily' | 'weekly' | 'custom'
          target_days?: number[]
          reminder_time?: string | null
          streak?: number
          best_streak?: number
          total_completions?: number
          archived?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          icon?: string
          color?: string
          frequency?: 'daily' | 'weekly' | 'custom'
          target_days?: number[]
          reminder_time?: string | null
          streak?: number
          best_streak?: number
          total_completions?: number
          archived?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      habit_logs: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          date: string
          completed: boolean
          note: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          date: string
          completed?: boolean
          note?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          date?: string
          completed?: boolean
          note?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          target_value: number
          current_value: number
          unit: string
          deadline: string | null
          status: 'active' | 'completed' | 'paused' | 'failed'
          color: string
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string
          target_value?: number
          current_value?: number
          unit?: string
          deadline?: string | null
          status?: 'active' | 'completed' | 'paused' | 'failed'
          color?: string
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          target_value?: number
          current_value?: number
          unit?: string
          deadline?: string | null
          status?: 'active' | 'completed' | 'paused' | 'failed'
          color?: string
          priority?: number
          created_at?: string
          updated_at?: string
        }
      }
      mood_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          value: number
          note: string | null
          tags: string[] | null
          energy_level: number | null
          stress_level: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          value: number
          note?: string | null
          tags?: string[] | null
          energy_level?: number | null
          stress_level?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          value?: number
          note?: string | null
          tags?: string[] | null
          energy_level?: number | null
          stress_level?: number | null
          created_at?: string
        }
      }
      health_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          sleep_hours: number | null
          water_liters: number | null
          calories: number | null
          exercise_minutes: number | null
          steps: number | null
          weight: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
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
        Update: {
          id?: string
          user_id?: string
          date?: string
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
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color: string
          status: 'active' | 'paused' | 'completed' | 'archived'
          progress: number
          priority: 'low' | 'medium' | 'high'
          deadline: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          color?: string
          status?: 'active' | 'paused' | 'completed' | 'archived'
          progress?: number
          priority?: 'low' | 'medium' | 'high'
          deadline?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          color?: string
          status?: 'active' | 'paused' | 'completed' | 'archived'
          progress?: number
          priority?: 'low' | 'medium' | 'high'
          deadline?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      coach_messages: {
        Row: {
          id: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          mode: 'gentle' | 'brutal' | 'predict'
          tokens_used: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          mode: 'gentle' | 'brutal' | 'predict'
          tokens_used?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'user' | 'assistant'
          content?: string
          mode?: 'gentle' | 'brutal' | 'predict'
          tokens_used?: number | null
          created_at?: string
        }
      }
      daily_stats: {
        Row: {
          id: string
          user_id: string
          date: string
          productivity_score: number
          health_score: number
          mood_score: number
          overall_score: number
          habits_completed: number
          habits_total: number
          exercise_minutes: number | null
          sleep_hours: number | null
          water_liters: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          productivity_score?: number
          health_score?: number
          mood_score?: number
          overall_score?: number
          habits_completed?: number
          habits_total?: number
          exercise_minutes?: number | null
          sleep_hours?: number | null
          water_liters?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          productivity_score?: number
          health_score?: number
          mood_score?: number
          overall_score?: number
          habits_completed?: number
          habits_total?: number
          exercise_minutes?: number | null
          sleep_hours?: number | null
          water_liters?: number | null
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          category: 'habit' | 'goal' | 'streak' | 'health' | 'special'
          requirement: string
          requirement_value: number | null
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          category: 'habit' | 'goal' | 'streak' | 'health' | 'special'
          requirement: string
          requirement_value?: number | null
          points?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          category?: 'habit' | 'goal' | 'streak' | 'health' | 'special'
          requirement?: string
          requirement_value?: number | null
          points?: number
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'reminder' | 'achievement' | 'warning' | 'insight' | 'system'
          title: string
          message: string
          read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'reminder' | 'achievement' | 'warning' | 'insight' | 'system'
          title: string
          message: string
          read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'reminder' | 'achievement' | 'warning' | 'insight' | 'system'
          title?: string
          message?: string
          read?: boolean
          action_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_daily_stats: {
        Args: {
          p_user_id: string
          p_date: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

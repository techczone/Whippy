-- Hayat Koçu Pro - Database Schema
-- Version: 1.0.0
-- Description: Initial database schema for AI Life Coach application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & PROFILES
-- ============================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Europe/Istanbul',
  language TEXT DEFAULT 'tr' CHECK (language IN ('tr', 'en')),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
  notifications_enabled BOOLEAN DEFAULT true,
  coach_mode TEXT DEFAULT 'gentle' CHECK (coach_mode IN ('gentle', 'brutal', 'predict')),
  week_starts_on INTEGER DEFAULT 1 CHECK (week_starts_on IN (0, 1)), -- 0=Sunday, 1=Monday
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'elite')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- HABITS
-- ============================================

CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '✨',
  color TEXT DEFAULT '#8B5CF6',
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'custom')),
  target_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,0], -- Days of week (0=Sunday)
  reminder_time TIME,
  streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  archived BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_habits_archived ON public.habits(archived);

-- Habit logs (daily completion records)
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  note TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

CREATE INDEX idx_habit_logs_user_date ON public.habit_logs(user_id, date);
CREATE INDEX idx_habit_logs_habit_date ON public.habit_logs(habit_id, date);

-- ============================================
-- GOALS
-- ============================================

CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'personal' CHECK (category IN (
    'health', 'fitness', 'career', 'education', 
    'finance', 'relationship', 'personal', 'learning', 'other'
  )),
  target_value NUMERIC NOT NULL DEFAULT 100,
  current_value NUMERIC DEFAULT 0,
  unit TEXT DEFAULT '%',
  deadline DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'failed')),
  color TEXT DEFAULT '#14B8A6',
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_status ON public.goals(status);

-- Goal milestones
CREATE TABLE IF NOT EXISTS public.goal_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MOOD TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value INTEGER NOT NULL CHECK (value BETWEEN 1 AND 5),
  note TEXT,
  tags TEXT[],
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_mood_entries_user_date ON public.mood_entries(user_id, date);

-- ============================================
-- HEALTH TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS public.health_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_hours NUMERIC(3,1),
  water_liters NUMERIC(3,1),
  calories INTEGER,
  exercise_minutes INTEGER,
  steps INTEGER,
  weight NUMERIC(4,1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_health_entries_user_date ON public.health_entries(user_id, date);

-- ============================================
-- PROJECTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#8B5CF6',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  deadline DATE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);

-- Project tasks
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI COACH
-- ============================================

-- Coach conversation history
CREATE TABLE IF NOT EXISTS public.coach_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('gentle', 'brutal', 'predict')),
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coach_messages_user ON public.coach_messages(user_id, created_at DESC);

-- Daily AI message count (for rate limiting)
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  message_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ============================================
-- ANALYTICS & STATS
-- ============================================

-- Daily stats (pre-computed for performance)
CREATE TABLE IF NOT EXISTS public.daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  productivity_score INTEGER DEFAULT 0,
  health_score INTEGER DEFAULT 0,
  mood_score INTEGER DEFAULT 0,
  overall_score INTEGER DEFAULT 0,
  habits_completed INTEGER DEFAULT 0,
  habits_total INTEGER DEFAULT 0,
  exercise_minutes INTEGER DEFAULT 0,
  sleep_hours NUMERIC(3,1),
  water_liters NUMERIC(3,1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_stats_user_date ON public.daily_stats(user_id, date);

-- ============================================
-- ACHIEVEMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('habit', 'goal', 'streak', 'health', 'special')),
  requirement TEXT NOT NULL,
  requirement_value INTEGER,
  points INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'achievement', 'warning', 'insight', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, read, created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own subscription" ON public.subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own habits" ON public.habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own habit_logs" ON public.habit_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own goal_milestones" ON public.goal_milestones FOR ALL USING (
  auth.uid() = (SELECT user_id FROM public.goals WHERE id = goal_id)
);
CREATE POLICY "Users can manage own mood_entries" ON public.mood_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own health_entries" ON public.health_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own project_tasks" ON public.project_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own coach_messages" ON public.coach_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own ai_usage" ON public.ai_usage FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily_stats" ON public.daily_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Public read for achievements catalog
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT TO authenticated USING (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create free subscription
  INSERT INTO public.subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_health_entries_updated_at BEFORE UPDATE ON public.health_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to calculate and update habit streaks
CREATE OR REPLACE FUNCTION public.update_habit_streak()
RETURNS TRIGGER AS $$
DECLARE
  current_streak INTEGER := 0;
  check_date DATE;
  habit_record RECORD;
BEGIN
  -- Get the habit
  SELECT * INTO habit_record FROM public.habits WHERE id = NEW.habit_id;
  
  IF NEW.completed THEN
    -- Count consecutive days backward from today
    check_date := NEW.date;
    LOOP
      IF EXISTS (
        SELECT 1 FROM public.habit_logs 
        WHERE habit_id = NEW.habit_id 
        AND date = check_date 
        AND completed = true
      ) THEN
        current_streak := current_streak + 1;
        check_date := check_date - INTERVAL '1 day';
      ELSE
        EXIT;
      END IF;
    END LOOP;
    
    -- Update habit streak
    UPDATE public.habits 
    SET 
      streak = current_streak,
      best_streak = GREATEST(best_streak, current_streak),
      total_completions = total_completions + 1
    WHERE id = NEW.habit_id;
  ELSE
    -- Reset streak if uncompleted
    UPDATE public.habits SET streak = 0 WHERE id = NEW.habit_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_habit_streak_trigger
  AFTER INSERT OR UPDATE ON public.habit_logs
  FOR EACH ROW EXECUTE FUNCTION public.update_habit_streak();

-- Function to calculate daily stats
CREATE OR REPLACE FUNCTION public.calculate_daily_stats(p_user_id UUID, p_date DATE)
RETURNS VOID AS $$
DECLARE
  v_habits_completed INTEGER;
  v_habits_total INTEGER;
  v_productivity_score INTEGER;
  v_health_score INTEGER;
  v_mood_score INTEGER;
  v_overall_score INTEGER;
  v_exercise INTEGER;
  v_sleep NUMERIC;
  v_water NUMERIC;
  v_mood INTEGER;
BEGIN
  -- Count habits
  SELECT 
    COUNT(*) FILTER (WHERE completed = true),
    COUNT(*)
  INTO v_habits_completed, v_habits_total
  FROM public.habit_logs
  WHERE user_id = p_user_id AND date = p_date;
  
  -- Get health data
  SELECT exercise_minutes, sleep_hours, water_liters
  INTO v_exercise, v_sleep, v_water
  FROM public.health_entries
  WHERE user_id = p_user_id AND date = p_date;
  
  -- Get mood
  SELECT value INTO v_mood
  FROM public.mood_entries
  WHERE user_id = p_user_id AND date = p_date;
  
  -- Calculate scores
  v_productivity_score := CASE 
    WHEN v_habits_total > 0 THEN ROUND((v_habits_completed::NUMERIC / v_habits_total) * 100)
    ELSE 0
  END;
  
  v_health_score := ROUND((
    LEAST(100, COALESCE(v_exercise, 0) / 60.0 * 100) +
    LEAST(100, COALESCE(v_water, 0) / 2.5 * 100) +
    LEAST(100, COALESCE(v_sleep, 0) / 8.0 * 100)
  ) / 3);
  
  v_mood_score := COALESCE(v_mood * 20, 0);
  
  v_overall_score := ROUND((v_productivity_score + v_health_score + v_mood_score) / 3);
  
  -- Upsert daily stats
  INSERT INTO public.daily_stats (
    user_id, date, productivity_score, health_score, mood_score, overall_score,
    habits_completed, habits_total, exercise_minutes, sleep_hours, water_liters
  ) VALUES (
    p_user_id, p_date, v_productivity_score, v_health_score, v_mood_score, v_overall_score,
    v_habits_completed, v_habits_total, v_exercise, v_sleep, v_water
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    productivity_score = EXCLUDED.productivity_score,
    health_score = EXCLUDED.health_score,
    mood_score = EXCLUDED.mood_score,
    overall_score = EXCLUDED.overall_score,
    habits_completed = EXCLUDED.habits_completed,
    habits_total = EXCLUDED.habits_total,
    exercise_minutes = EXCLUDED.exercise_minutes,
    sleep_hours = EXCLUDED.sleep_hours,
    water_liters = EXCLUDED.water_liters;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA: Achievements
-- ============================================

INSERT INTO public.achievements (name, description, icon, category, requirement, requirement_value, points) VALUES
-- Streak achievements
('İlk Adım', 'İlk alışkanlığını tamamla', '🌟', 'habit', 'first_habit_completed', 1, 10),
('Tutarlı Başlangıç', '7 günlük seri', '🔥', 'streak', 'streak_days', 7, 25),
('Alışkanlık Ustası', '30 günlük seri', '⚡', 'streak', 'streak_days', 30, 100),
('Efsane Seri', '100 günlük seri', '👑', 'streak', 'streak_days', 100, 500),

-- Health achievements
('Su Canavarı', '7 gün üst üste 2.5L su iç', '💧', 'health', 'water_streak', 7, 30),
('Uyku Düzeni', '7 gün üst üste 7+ saat uyu', '😴', 'health', 'sleep_streak', 7, 30),
('Fitness Gurusu', 'Toplam 1000 dakika egzersiz', '💪', 'health', 'total_exercise', 1000, 100),

-- Goal achievements
('Hedef Avcısı', 'İlk hedefini tamamla', '🎯', 'goal', 'first_goal_completed', 1, 50),
('Çok Yönlü', '5 farklı kategoride hedef oluştur', '🌈', 'goal', 'goal_categories', 5, 75),

-- Special achievements
('Erken Kalkan', '7 gün üst üste sabah 7den önce alışkanlık tamamla', '🌅', 'special', 'early_bird', 7, 50),
('Mükemmel Gün', 'Bir günde tüm alışkanlıkları tamamla', '✨', 'special', 'perfect_day', 1, 25),
('Mükemmel Hafta', 'Bir hafta boyunca her gün tüm alışkanlıkları tamamla', '🏆', 'special', 'perfect_week', 1, 200)
ON CONFLICT DO NOTHING;

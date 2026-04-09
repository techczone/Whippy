'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Trophy,
  Target,
  Flame,
  Calendar,
  TrendingUp,
  Edit2,
  Save,
  X,
  LogIn,
  Heart,
  Smile
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from '@/hooks/use-translation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = [
  { id: 'first_habit', name_tr: 'İlk Adım', name_en: 'First Step', icon: '🌟', description_tr: 'İlk alışkanlığını tamamla', description_en: 'Complete your first habit', requirement: (stats: any) => stats.totalHabitsCompleted >= 1 },
  { id: '7_day_streak', name_tr: 'Tutarlı Başlangıç', name_en: 'Consistent Start', icon: '🔥', description_tr: '7 günlük seri', description_en: '7 day streak', requirement: (stats: any) => stats.currentStreak >= 7 },
  { id: 'water_master', name_tr: 'Su Canavarı', name_en: 'Water Master', icon: '💧', description_tr: '7 gün üst üste 2.5L su iç', description_en: 'Drink 2.5L water for 7 days', requirement: (stats: any) => stats.healthDays >= 7 },
  { id: '30_day_streak', name_tr: 'Alışkanlık Ustası', name_en: 'Habit Master', icon: '⚡', description_tr: '30 günlük seri', description_en: '30 day streak', requirement: (stats: any) => stats.currentStreak >= 30 },
  { id: 'first_goal', name_tr: 'Hedef Avcısı', name_en: 'Goal Hunter', icon: '🎯', description_tr: 'İlk hedefini tamamla', description_en: 'Complete your first goal', requirement: (stats: any) => stats.goalsCompleted >= 1 },
  { id: '100_day_streak', name_tr: 'Efsane Seri', name_en: 'Legend Streak', icon: '👑', description_tr: '100 günlük seri', description_en: '100 day streak', requirement: (stats: any) => stats.longestStreak >= 100 },
  { id: '50_habits', name_tr: 'Yarı Yüzük', name_en: 'Half Century', icon: '💪', description_tr: '50 alışkanlık tamamla', description_en: 'Complete 50 habits', requirement: (stats: any) => stats.totalHabitsCompleted >= 50 },
  { id: '100_habits', name_tr: 'Yüzük', name_en: 'Century', icon: '🏆', description_tr: '100 alışkanlık tamamla', description_en: 'Complete 100 habits', requirement: (stats: any) => stats.totalHabitsCompleted >= 100 },
  { id: '5_goals', name_tr: 'Hedef Makinesi', name_en: 'Goal Machine', icon: '🚀', description_tr: '5 hedef tamamla', description_en: 'Complete 5 goals', requirement: (stats: any) => stats.goalsCompleted >= 5 },
  { id: '30_days_active', name_tr: 'Bir Ay Aktif', name_en: 'Month Active', icon: '📅', description_tr: '30 gün aktif ol', description_en: 'Be active for 30 days', requirement: (stats: any) => stats.totalDaysActive >= 30 },
  { id: '7_health_days', name_tr: 'Sağlık Takipçisi', name_en: 'Health Tracker', icon: '❤️', description_tr: '7 gün sağlık kaydı', description_en: '7 days of health logs', requirement: (stats: any) => stats.healthDays >= 7 },
  { id: '7_mood_days', name_tr: 'Ruh Hali Ustası', name_en: 'Mood Master', icon: '😊', description_tr: '7 gün ruh hali kaydı', description_en: '7 days of mood logs', requirement: (stats: any) => stats.moodDays >= 7 },
]

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const { t, language } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [tempName, setTempName] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalHabitsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    goalsCompleted: 0,
    totalDaysActive: 0,
    healthDays: 0,
    moodDays: 0,
  })
  const [profile, setProfile] = useState<any>(null)

  const supabase = useMemo(() => createClient(), [])

  // Fetch profile and stats
  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
          setName(profileData.full_name || user.email?.split('@')[0] || '')
          setTempName(profileData.full_name || user.email?.split('@')[0] || '')
        }

        // Fetch stats
        const [habitLogs, goals, healthEntries, moodEntries] = await Promise.all([
          supabase.from('habit_logs').select('id, completed_at').eq('user_id', user.id),
          supabase.from('goals').select('id, status').eq('user_id', user.id),
          supabase.from('health_entries').select('id, date').eq('user_id', user.id),
          supabase.from('mood_entries').select('id, date').eq('user_id', user.id),
        ])

        // Calculate streak
        const dates = [...new Set((habitLogs.data || []).map(l => l.completed_at?.split('T')[0]))].sort().reverse()
        let currentStreak = 0
        let longestStreak = 0
        let tempStreak = 0
        const today = new Date().toISOString().split('T')[0]
        
        for (let i = 0; i < dates.length; i++) {
          const expectedDate = new Date()
          expectedDate.setDate(expectedDate.getDate() - i)
          const expected = expectedDate.toISOString().split('T')[0]
          
          if (dates.includes(expected)) {
            tempStreak++
            if (i === 0 || currentStreak > 0) currentStreak = tempStreak
          } else {
            longestStreak = Math.max(longestStreak, tempStreak)
            tempStreak = 0
            if (i === 0) currentStreak = 0
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

        // Unique active days
        const uniqueDays = new Set(dates)

        setStats({
          totalHabitsCompleted: habitLogs.data?.length || 0,
          currentStreak,
          longestStreak,
          goalsCompleted: (goals.data || []).filter(g => g.status === 'completed').length,
          totalDaysActive: uniqueDays.size,
          healthDays: new Set((healthEntries.data || []).map(h => h.date)).size,
          moodDays: new Set((moodEntries.data || []).map(m => m.date)).size,
        })
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id, supabase])

  const handleSave = async () => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, full_name: tempName, updated_at: new Date().toISOString() })

      if (error) throw error

      setName(tempName)
      setIsEditing(false)
      toast.success(t.profile.name_updated)
    } catch (err) {
      toast.error(t.error)
    }
  }

  const handleCancel = () => {
    setTempName(name)
    setIsEditing(false)
  }

  // Calculate achievements
  const achievements = ACHIEVEMENT_DEFINITIONS.map(a => ({
    ...a,
    name: language === 'tr' ? a.name_tr : a.name_en,
    description: language === 'tr' ? a.description_tr : a.description_en,
    unlocked: a.requirement(stats),
  }))

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalAchievements = achievements.length

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-32" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="h-64 bg-muted rounded-xl" />
          <div className="lg:col-span-2 h-64 bg-muted rounded-xl" />
        </div>
      </div>
    )
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-7 h-7 text-primary" />
            {t.profile.title}
          </h1>
          <p className="text-muted-foreground">{t.profile.subtitle}</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">
              {language === 'tr' ? 'Giriş Yapın' : 'Sign In'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'tr' 
                ? 'Profilinizi görüntülemek ve verilerinize erişmek için giriş yapın.' 
                : 'Sign in to view your profile and access your data.'}
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link href="/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  {language === 'tr' ? 'Giriş Yap' : 'Sign In'}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/signup">
                  {language === 'tr' ? 'Hesap Oluştur' : 'Create Account'}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-7 h-7 text-primary" />
          {t.profile.title}
        </h1>
        <p className="text-muted-foreground">{t.profile.subtitle}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-4xl text-white font-bold">
                  {name.charAt(0).toUpperCase() || '?'}
                </div>
              </div>

              {/* Name */}
              {isEditing ? (
                <div className="flex items-center gap-2 mb-2 w-full max-w-[200px]">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="text-center"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={handleSave}>
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleCancel}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold">{name}</h2>
                  <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Email */}
              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>

              {/* Member since */}
              <div className="text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 inline mr-1" />
                {t.profile.member_since}: {new Date(user.created_at || profile?.created_at || Date.now()).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
              </div>

              {/* Plan badge */}
              <div className="mt-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                🆓 {language === 'tr' ? 'Ücretsiz Plan' : 'Free Plan'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{stats.totalHabitsCompleted}</p>
                <p className="text-xs text-muted-foreground">{t.profile.total_habits}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">{t.profile.current_streak}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{stats.goalsCompleted}</p>
                <p className="text-xs text-muted-foreground">{t.profile.completed_goals}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{stats.totalDaysActive}</p>
                <p className="text-xs text-muted-foreground">{t.profile.days_active}</p>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                {t.profile.achievements} ({unlockedCount}/{totalAchievements})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    className={`relative p-3 rounded-xl text-center transition-all ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
                        : 'bg-muted/50 opacity-50 grayscale'
                    }`}
                    whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
                    title={achievement.description}
                  >
                    <div className="text-2xl mb-1">{achievement.icon}</div>
                    <p className="text-[10px] font-medium truncate">{achievement.name}</p>
                    {achievement.unlocked && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-[8px] text-white">✓</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

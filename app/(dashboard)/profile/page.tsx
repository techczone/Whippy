'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Camera,
  Trophy,
  Target,
  Flame,
  Calendar,
  TrendingUp,
  Edit2,
  Save,
  X,
  Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/use-auth'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

// Tüm başarılar (achievements tablosundan çekilebilir ama statik de olabilir)
const ALL_ACHIEVEMENTS = [
  { id: 'first_habit', name: 'İlk Adım', icon: '🌟', description: 'İlk alışkanlığını tamamla', condition: (s: any) => s.totalHabitsCompleted >= 1 },
  { id: 'streak_7', name: 'Tutarlı Başlangıç', icon: '🔥', description: '7 günlük seri', condition: (s: any) => s.currentStreak >= 7 },
  { id: 'water_master', name: 'Su Canavarı', icon: '💧', description: '7 gün üst üste 2.5L su iç', condition: (s: any) => s.waterStreak >= 7 },
  { id: 'streak_30', name: 'Alışkanlık Ustası', icon: '⚡', description: '30 günlük seri', condition: (s: any) => s.currentStreak >= 30 },
  { id: 'first_goal', name: 'Hedef Avcısı', icon: '🎯', description: 'İlk hedefini tamamla', condition: (s: any) => s.goalsCompleted >= 1 },
  { id: 'streak_100', name: 'Efsane Seri', icon: '👑', description: '100 günlük seri', condition: (s: any) => s.currentStreak >= 100 },
  { id: 'habits_50', name: 'Kararlı', icon: '💪', description: '50 alışkanlık tamamla', condition: (s: any) => s.totalHabitsCompleted >= 50 },
  { id: 'habits_100', name: 'Disiplinli', icon: '🏆', description: '100 alışkanlık tamamla', condition: (s: any) => s.totalHabitsCompleted >= 100 },
  { id: 'goals_5', name: 'Hedef Makinesi', icon: '🚀', description: '5 hedef tamamla', condition: (s: any) => s.goalsCompleted >= 5 },
  { id: 'active_30', name: 'Sadık Kullanıcı', icon: '📅', description: '30 gün aktif ol', condition: (s: any) => s.totalDaysActive >= 30 },
  { id: 'health_week', name: 'Sağlık Takipçisi', icon: '❤️', description: '7 gün sağlık verisi gir', condition: (s: any) => s.healthDays >= 7 },
  { id: 'mood_week', name: 'Kendini Tanı', icon: '😊', description: '7 gün ruh hali kaydet', condition: (s: any) => s.moodDays >= 7 },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const userId = user?.id
  
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [tempName, setTempName] = useState('')
  const [stats, setStats] = useState({
    totalHabitsCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    goalsCompleted: 0,
    totalDaysActive: 0,
    averageScore: 0,
    waterStreak: 0,
    healthDays: 0,
    moodDays: 0,
  })

  const supabase = useMemo(() => createClient(), [])

  // Fetch profile and stats
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      
      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (profileData) {
          setProfile(profileData)
          setTempName(profileData.full_name || user?.email?.split('@')[0] || '')
        }

        // Fetch habit logs (completed)
        const { data: habitLogs } = await supabase
          .from('habit_logs')
          .select('date, completed')
          .eq('user_id', userId)
          .eq('completed', true)

        const totalHabitsCompleted = habitLogs?.length || 0
        
        // Calculate streak
        const uniqueDates = [...new Set(habitLogs?.map(l => l.date) || [])].sort().reverse()
        let currentStreak = 0
        let longestStreak = 0
        let tempStreak = 0
        
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        
        // Current streak
        if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
          for (let i = 0; i < uniqueDates.length; i++) {
            const expectedDate = new Date(Date.now() - (i * 86400000)).toISOString().split('T')[0]
            if (uniqueDates.includes(expectedDate)) {
              currentStreak++
            } else if (i === 0 && !uniqueDates.includes(today)) {
              // Bugün yoksa dünden başla
              continue
            } else {
              break
            }
          }
        }

        // Longest streak calculation
        for (let i = 0; i < uniqueDates.length; i++) {
          if (i === 0) {
            tempStreak = 1
          } else {
            const prevDate = new Date(uniqueDates[i - 1])
            const currDate = new Date(uniqueDates[i])
            const diff = (prevDate.getTime() - currDate.getTime()) / 86400000
            
            if (diff === 1) {
              tempStreak++
            } else {
              longestStreak = Math.max(longestStreak, tempStreak)
              tempStreak = 1
            }
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

        // Fetch completed goals
        const { data: goals } = await supabase
          .from('goals')
          .select('status')
          .eq('user_id', userId)

        const goalsCompleted = goals?.filter(g => g.status === 'completed').length || 0

        // Total active days (unique dates with any activity)
        const totalDaysActive = uniqueDates.length

        // Fetch health entries count
        const { data: healthEntries } = await supabase
          .from('health_entries')
          .select('date')
          .eq('user_id', userId)

        const healthDays = healthEntries?.length || 0

        // Fetch mood entries count
        const { data: moodEntries } = await supabase
          .from('mood_entries')
          .select('date')
          .eq('user_id', userId)

        const moodDays = moodEntries?.length || 0

        // Calculate average score (based on completion rate)
        const averageScore = totalDaysActive > 0 
          ? Math.round((totalHabitsCompleted / (totalDaysActive * 3)) * 100) // Assuming ~3 habits average
          : 0

        setStats({
          totalHabitsCompleted,
          currentStreak,
          longestStreak,
          goalsCompleted,
          totalDaysActive,
          averageScore: Math.min(100, averageScore),
          waterStreak: 0, // TODO: Calculate from health_entries
          healthDays,
          moodDays,
        })

      } catch (err) {
        console.error('Error fetching profile data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, supabase, user])

  // Calculate unlocked achievements
  const achievements = useMemo(() => {
    return ALL_ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: a.condition(stats)
    }))
  }, [stats])

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalAchievements = achievements.length

  const handleSave = async () => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: tempName })
        .eq('id', userId)

      if (error) throw error

      setProfile((prev: any) => ({ ...prev, full_name: tempName }))
      setIsEditing(false)
      toast.success('Profil güncellendi!')
    } catch (err) {
      console.error('Error updating profile:', err)
      toast.error('Güncelleme başarısız')
    }
  }

  const handleCancel = () => {
    setTempName(profile?.full_name || '')
    setIsEditing(false)
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Kullanıcı'
  const joinDate = profile?.created_at || user?.created_at

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
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-7 h-7 text-primary" />
          Profil
        </h1>
        <p className="text-muted-foreground">Hesap bilgilerin ve başarıların</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl text-white font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center hover:bg-accent transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Name */}
              {isEditing ? (
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="text-center"
                  />
                  <Button size="icon" variant="ghost" onClick={handleSave}>
                    <Save className="w-4 h-4 text-green-500" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleCancel}>
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold">{displayName}</h2>
                  <button onClick={() => { setTempName(displayName); setIsEditing(true); }}>
                    <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              )}

              {/* Email */}
              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>

              {/* Tier Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-sm font-medium mb-4">
                🆓 Ücretsiz Plan
              </div>

              {/* Join Date */}
              {joinDate && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(joinDate).toLocaleDateString('tr-TR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} tarihinde katıldı
                </p>
              )}

              {/* Upgrade Button */}
              <Button className="w-full mt-6 bg-gradient-to-r from-primary to-accent">
                Pro'ya Yükselt
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="pt-4 text-center">
                  <Target className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{stats.totalHabitsCompleted}</p>
                  <p className="text-xs text-muted-foreground">Tamamlanan Alışkanlık</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="pt-4 text-center">
                  <Flame className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold">{stats.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Güncel Seri</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="pt-4 text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold">{stats.longestStreak}</p>
                  <p className="text-xs text-muted-foreground">En Uzun Seri</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="pt-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{stats.goalsCompleted}</p>
                  <p className="text-xs text-muted-foreground">Tamamlanan Hedef</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardContent className="pt-4 text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{stats.totalDaysActive}</p>
                  <p className="text-xs text-muted-foreground">Aktif Gün</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardContent className="pt-4 text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <p className="text-2xl font-bold">{stats.healthDays}</p>
                  <p className="text-xs text-muted-foreground">Sağlık Kaydı</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Başarılar
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {unlockedCount}/{totalAchievements}
                </span>
              </div>
              <Progress value={(unlockedCount / totalAchievements) * 100} className="h-2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-xl border ${
                      achievement.unlocked 
                        ? 'bg-secondary/50 border-primary/30' 
                        : 'bg-secondary/20 border-border opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{achievement.icon}</span>
                      <span className="font-medium text-sm">{achievement.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    {achievement.unlocked && (
                      <span className="text-xs text-green-500 mt-1 block">✓ Kazanıldı</span>
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

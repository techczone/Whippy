'use client'

import { useState, useEffect } from 'react'
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
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

const demoStats = {
  totalHabitsCompleted: 234,
  currentStreak: 12,
  longestStreak: 21,
  goalsCompleted: 5,
  totalDaysActive: 45,
  averageScore: 72,
}

const demoAchievements = [
  { id: '1', name: 'İlk Adım', icon: '🌟', description: 'İlk alışkanlığını tamamla', unlocked: true },
  { id: '2', name: 'Tutarlı Başlangıç', icon: '🔥', description: '7 günlük seri', unlocked: true },
  { id: '3', name: 'Su Canavarı', icon: '💧', description: '7 gün üst üste 2.5L su iç', unlocked: true },
  { id: '4', name: 'Alışkanlık Ustası', icon: '⚡', description: '30 günlük seri', unlocked: false },
  { id: '5', name: 'Hedef Avcısı', icon: '🎯', description: 'İlk hedefini tamamla', unlocked: true },
  { id: '6', name: 'Efsane Seri', icon: '👑', description: '100 günlük seri', unlocked: false },
]

export default function ProfilePage() {
  const { user, profile, subscription, signOut, loading } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [tempName, setTempName] = useState('')

  useEffect(() => {
    if (user) {
      const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Kullanıcı'
      setName(displayName)
      setTempName(displayName)
    }
  }, [user])

  const handleSave = () => {
    setName(tempName)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempName(name)
    setIsEditing(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const unlockedCount = demoAchievements.filter(a => a.unlocked).length
  const totalAchievements = demoAchievements.length

  // Get user info
  const userEmail = user?.email || 'email@example.com'
  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null
  const userTier = subscription?.tier || 'free'
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) : ''

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-7 h-7 text-primary" />
            Profil
          </h1>
          <p className="text-muted-foreground">Hesap bilgilerin ve başarıların</p>
        </div>
        <Button variant="outline" onClick={handleSignOut} className="text-red-500 hover:text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Çıkış Yap
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {userAvatar ? (
                    <img src={userAvatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    name.charAt(0).toUpperCase()
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Name */}
              <div className="flex items-center gap-2 mb-1">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="h-8 w-40 text-center"
                    />
                    <button onClick={handleSave} className="text-green-500 hover:text-green-600">
                      <Save className="w-4 h-4" />
                    </button>
                    <button onClick={handleCancel} className="text-red-500 hover:text-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold">{name}</h2>
                    <button onClick={() => setIsEditing(true)} className="text-muted-foreground hover:text-foreground">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Email */}
              <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                <Mail className="w-4 h-4" />
                {userEmail}
              </div>

              {/* Tier Badge */}
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                userTier === 'elite' 
                  ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                  : userTier === 'pro'
                  ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {userTier === 'elite' ? '👑' : userTier === 'pro' ? '⭐' : '🆓'}
                {userTier === 'elite' ? 'Elite Plan' : userTier === 'pro' ? 'Pro Plan' : 'Ücretsiz Plan'}
              </div>

              {/* Join Date */}
              {joinDate && (
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Calendar className="w-3 h-3" />
                  {joinDate} tarihinde katıldı
                </div>
              )}

              {/* Upgrade Button */}
              {userTier === 'free' && (
                <Button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  Pro'ya Yükselt
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3">
                  <Target className="w-6 h-6 text-orange-500" />
                </div>
                <div className="text-3xl font-bold">{demoStats.totalHabitsCompleted}</div>
                <div className="text-sm text-muted-foreground">Tamamlanan Alışkanlık</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-3">
                  <Flame className="w-6 h-6 text-red-500" />
                </div>
                <div className="text-3xl font-bold">{demoStats.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Güncel Seri</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-3">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="text-3xl font-bold">{demoStats.longestStreak}</div>
                <div className="text-sm text-muted-foreground">En Uzun Seri</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div className="text-3xl font-bold">{demoStats.goalsCompleted}</div>
                <div className="text-sm text-muted-foreground">Tamamlanan Hedef</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-3xl font-bold">{demoStats.totalDaysActive}</div>
                <div className="text-sm text-muted-foreground">Aktif Gün</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                  <div className="text-purple-500 font-bold">%</div>
                </div>
                <div className="text-3xl font-bold">{demoStats.averageScore}</div>
                <div className="text-sm text-muted-foreground">Ortalama Skor</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Başarılar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Progress value={(unlockedCount / totalAchievements) * 100} className="w-32 h-2" />
              <span className="text-sm text-muted-foreground">{unlockedCount}/{totalAchievements}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl border ${
                  achievement.unlocked 
                    ? 'bg-card border-orange-500/20' 
                    : 'bg-muted/30 border-border opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <h4 className="font-medium">{achievement.name}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    {achievement.unlocked && (
                      <span className="text-xs text-green-500">✓ Kazanıldı</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

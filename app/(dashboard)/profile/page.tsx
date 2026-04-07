'use client'

import { useState } from 'react'
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
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

// Demo user data
const demoUser = {
  name: 'Cem',
  email: 'cem@example.com',
  avatar: null,
  joinDate: '2024-01-15',
  tier: 'free' as const,
}

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
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(demoUser.name)
  const [tempName, setTempName] = useState(demoUser.name)

  const handleSave = () => {
    setName(tempName)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempName(name)
    setIsEditing(false)
  }

  const unlockedCount = demoAchievements.filter(a => a.unlocked).length
  const totalAchievements = demoAchievements.length

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
                  {name.charAt(0).toUpperCase()}
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
                  <h2 className="text-xl font-bold">{name}</h2>
                  <button onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              )}

              {/* Email */}
              <p className="text-sm text-muted-foreground flex items-center gap-1 mb-4">
                <Mail className="w-4 h-4" />
                {demoUser.email}
              </p>

              {/* Tier Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-sm font-medium mb-4">
                {demoUser.tier === 'free' && '🆓 Ücretsiz Plan'}
                {demoUser.tier === 'pro' && '⭐ Pro Plan'}
                {demoUser.tier === 'elite' && '👑 Elite Plan'}
              </div>

              {/* Join Date */}
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(demoUser.joinDate).toLocaleDateString('tr-TR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} tarihinde katıldı
              </p>

              {/* Upgrade Button */}
              {demoUser.tier === 'free' && (
                <Button className="w-full mt-6 bg-gradient-to-r from-primary to-accent">
                  Pro'ya Yükselt
                </Button>
              )}
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
                  <p className="text-2xl font-bold">{demoStats.totalHabitsCompleted}</p>
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
                  <p className="text-2xl font-bold">{demoStats.currentStreak}</p>
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
                  <p className="text-2xl font-bold">{demoStats.longestStreak}</p>
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
                  <p className="text-2xl font-bold">{demoStats.goalsCompleted}</p>
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
                  <p className="text-2xl font-bold">{demoStats.totalDaysActive}</p>
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
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                    %
                  </div>
                  <p className="text-2xl font-bold">{demoStats.averageScore}</p>
                  <p className="text-xs text-muted-foreground">Ortalama Skor</p>
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
                {demoAchievements.map((achievement) => (
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

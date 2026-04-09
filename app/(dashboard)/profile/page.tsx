'use client'

import { useState, useEffect } from 'react'
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
  LogIn
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from '@/hooks/use-translation'
import Link from 'next/link'

// Static achievements
const ACHIEVEMENTS = [
  { id: '1', name_tr: 'İlk Adım', name_en: 'First Step', icon: '🌟', description_tr: 'İlk alışkanlığını tamamla', description_en: 'Complete your first habit' },
  { id: '2', name_tr: 'Tutarlı Başlangıç', name_en: 'Consistent Start', icon: '🔥', description_tr: '7 günlük seri', description_en: '7 day streak' },
  { id: '3', name_tr: 'Su Canavarı', name_en: 'Water Master', icon: '💧', description_tr: '7 gün üst üste 2.5L su iç', description_en: 'Drink 2.5L water for 7 days' },
  { id: '4', name_tr: 'Alışkanlık Ustası', name_en: 'Habit Master', icon: '⚡', description_tr: '30 günlük seri', description_en: '30 day streak' },
  { id: '5', name_tr: 'Hedef Avcısı', name_en: 'Goal Hunter', icon: '🎯', description_tr: 'İlk hedefini tamamla', description_en: 'Complete your first goal' },
  { id: '6', name_tr: 'Efsane Seri', name_en: 'Legend Streak', icon: '👑', description_tr: '100 günlük seri', description_en: '100 day streak' },
]

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const { t, language } = useTranslation()
  const [mounted, setMounted] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [tempName, setTempName] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user?.email) {
      const defaultName = user.email.split('@')[0]
      setName(defaultName)
      setTempName(defaultName)
    }
  }, [user?.email])

  const handleSave = () => {
    setName(tempName)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempName(name)
    setIsEditing(false)
  }

  // Hydration fix
  if (!mounted) {
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

  // Loading state
  if (authLoading) {
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
            {language === 'tr' ? 'Profil' : 'Profile'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'tr' ? 'Hesap bilgilerin ve başarıların' : 'Your account and achievements'}
          </p>
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

  // Logged in - show profile
  const achievements = ACHIEVEMENTS.map(a => ({
    ...a,
    name: language === 'tr' ? a.name_tr : a.name_en,
    description: language === 'tr' ? a.description_tr : a.description_en,
    unlocked: false, // Default to locked
  }))

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalAchievements = achievements.length

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-7 h-7 text-primary" />
          {language === 'tr' ? 'Profil' : 'Profile'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'tr' ? 'Hesap bilgilerin ve başarıların' : 'Your account and achievements'}
        </p>
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
                {language === 'tr' ? 'Üyelik' : 'Member since'}: {new Date(user.created_at || Date.now()).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
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
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'tr' ? 'Tamamlanan' : 'Completed'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'tr' ? 'Günlük Seri' : 'Day Streak'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'tr' ? 'Hedefler' : 'Goals'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'tr' ? 'Aktif Gün' : 'Active Days'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                {language === 'tr' ? 'Başarılar' : 'Achievements'} ({unlockedCount}/{totalAchievements})
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

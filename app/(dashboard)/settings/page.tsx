'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Settings, User, Bell, Moon, Sun, Globe, Shield, Trash2, Download, CreditCard, Check, Monitor, LogOut, Clock, TestTube } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore, Theme, Language } from '@/lib/store'
import { useTranslation } from '@/hooks/use-translation'
import { useAuth } from '@/hooks/use-auth'
import { useNotifications } from '@/hooks/use-notifications'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { t, language } = useTranslation()
  const { user } = useAuth()
  const router = useRouter()
  const {
    permission,
    isSupported,
    isEnabled,
    requestPermission,
    sendTestNotification,
    scheduleDailyReminder,
    cancelDailyReminder,
    getReminderTime,
  } = useNotifications()
  
  const settings = useAppStore((state) => state.settings)
  const setTheme = useAppStore((state) => state.setTheme)
  const setLanguage = useAppStore((state) => state.setLanguage)
  const updateNotification = useAppStore((state) => state.updateNotification)
  
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reminderHour, setReminderHour] = useState(9)
  const [reminderMinute, setReminderMinute] = useState(0)
  const [stats, setStats] = useState({
    habitCount: 0,
    aiUsage: 0,
  })
  
  const supabase = useMemo(() => createClient(), [])
  
  useEffect(() => {
    setMounted(true)
    
    // Load saved reminder time
    const savedTime = getReminderTime()
    if (savedTime) {
      setReminderHour(savedTime.hour)
      setReminderMinute(savedTime.minute)
    }
  }, [getReminderTime])

  // Fetch user stats
  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      try {
        const { data: habits } = await supabase
          .from('habits')
          .select('id')
          .eq('user_id', user.id)
          .eq('archived', false)

        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)
        
        const { data: aiMessages } = await supabase
          .from('coach_messages')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', startOfMonth.toISOString())

        setStats({
          habitCount: habits?.length || 0,
          aiUsage: aiMessages?.length || 0,
        })
      } catch (err) {
        console.error('Error fetching settings stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user?.id, supabase])
  
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    toast.success(language === 'tr' ? 'Tema güncellendi' : 'Theme updated')
  }
  
  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang)
    toast.success(newLang === 'tr' ? 'Dil Türkçe olarak değiştirildi' : 'Language changed to English')
  }
  
  const handleNotificationChange = async (key: keyof typeof settings.notifications, value: boolean) => {
    if (key === 'push' && value && permission !== 'granted') {
      const granted = await requestPermission()
      if (!granted) {
        toast.error(language === 'tr' ? 'Bildirim izni reddedildi' : 'Notification permission denied')
        return
      }
    }
    
    updateNotification(key, value)
    toast.success(language === 'tr' ? 'Bildirim ayarı güncellendi' : 'Notification setting updated')
  }

  const handleEnableNotifications = async () => {
    const granted = await requestPermission()
    if (granted) {
      toast.success(language === 'tr' ? 'Bildirimler etkinleştirildi! 🎉' : 'Notifications enabled! 🎉')
    } else {
      toast.error(language === 'tr' ? 'Bildirim izni reddedildi' : 'Notification permission denied')
    }
  }

  const handleTestNotification = async () => {
    const sent = await sendTestNotification()
    if (!sent) {
      toast.error(language === 'tr' ? 'Bildirim gönderilemedi' : 'Failed to send notification')
    }
  }

  const handleSetReminder = () => {
    if (!isEnabled) {
      toast.error(language === 'tr' ? 'Önce bildirimleri etkinleştirin' : 'Enable notifications first')
      return
    }
    
    scheduleDailyReminder(reminderHour, reminderMinute)
    toast.success(
      language === 'tr' 
        ? `Hatırlatıcı ${reminderHour.toString().padStart(2, '0')}:${reminderMinute.toString().padStart(2, '0')} için ayarlandı` 
        : `Reminder set for ${reminderHour.toString().padStart(2, '0')}:${reminderMinute.toString().padStart(2, '0')}`
    )
  }

  const handleCancelReminder = () => {
    cancelDailyReminder()
    toast.success(language === 'tr' ? 'Hatırlatıcı iptal edildi' : 'Reminder cancelled')
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
      toast.success(language === 'tr' ? 'Çıkış yapıldı' : 'Signed out')
    } catch (err) {
      toast.error(language === 'tr' ? 'Çıkış yapılamadı' : 'Sign out failed')
    }
  }

  const handleExportData = async () => {
    if (!user?.id) return
    
    toast.loading(language === 'tr' ? 'Veriler hazırlanıyor...' : 'Preparing data...')
    
    try {
      const [habits, habitLogs, goals, healthEntries, moodEntries, projects] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', user.id),
        supabase.from('habit_logs').select('*').eq('user_id', user.id),
        supabase.from('goals').select('*').eq('user_id', user.id),
        supabase.from('health_entries').select('*').eq('user_id', user.id),
        supabase.from('mood_entries').select('*').eq('user_id', user.id),
        supabase.from('projects').select('*').eq('user_id', user.id),
      ])

      const exportData = {
        exportDate: new Date().toISOString(),
        user: { email: user.email },
        habits: habits.data || [],
        habitLogs: habitLogs.data || [],
        goals: goals.data || [],
        healthEntries: healthEntries.data || [],
        moodEntries: moodEntries.data || [],
        projects: projects.data || [],
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `whippy-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast.dismiss()
      toast.success(language === 'tr' ? 'Veriler indirildi!' : 'Data exported!')
    } catch (err) {
      toast.dismiss()
      toast.error(language === 'tr' ? 'Dışa aktarma başarısız' : 'Export failed')
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      language === 'tr' 
        ? 'Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!'
        : 'Are you sure you want to delete your account? This cannot be undone!'
    )
    
    if (!confirmed) return
    
    const doubleConfirm = window.prompt(
      language === 'tr'
        ? 'Onaylamak için "SİL" yazın:'
        : 'Type "DELETE" to confirm:'
    )
    
    if (doubleConfirm?.toUpperCase() !== (language === 'tr' ? 'SİL' : 'DELETE')) {
      toast.error(language === 'tr' ? 'İşlem iptal edildi' : 'Operation cancelled')
      return
    }
    
    toast.error(language === 'tr' ? 'Hesap silme özelliği yakında!' : 'Account deletion coming soon!')
  }

  if (!mounted) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="h-64 bg-muted rounded" />
        <div className="h-64 bg-muted rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          {t.settings.title}
        </h1>
        <p className="text-muted-foreground">{t.settings.subtitle}</p>
      </motion.div>

      {/* Appearance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5" />
              {t.settings.appearance}
            </CardTitle>
            <CardDescription>{t.settings.appearance_desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-3 block">{t.settings.theme}</label>
              <div className="grid grid-cols-3 gap-2">
                <ThemeButton
                  active={settings.theme === 'light'}
                  onClick={() => handleThemeChange('light')}
                  icon={<Sun className="w-4 h-4" />}
                  label={t.settings.theme_light}
                />
                <ThemeButton
                  active={settings.theme === 'dark'}
                  onClick={() => handleThemeChange('dark')}
                  icon={<Moon className="w-4 h-4" />}
                  label={t.settings.theme_dark}
                />
                <ThemeButton
                  active={settings.theme === 'system'}
                  onClick={() => handleThemeChange('system')}
                  icon={<Monitor className="w-4 h-4" />}
                  label={t.settings.theme_system}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">{t.settings.language}</label>
              <div className="grid grid-cols-2 gap-2">
                <LanguageButton
                  active={settings.language === 'tr'}
                  onClick={() => handleLanguageChange('tr')}
                  flag="🇹🇷"
                  label="Türkçe"
                />
                <LanguageButton
                  active={settings.language === 'en'}
                  onClick={() => handleLanguageChange('en')}
                  flag="🇬🇧"
                  label="English"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {t.settings.notifications}
            </CardTitle>
            <CardDescription>{t.settings.notifications_desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Push Notification Permission */}
            {isSupported && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      {language === 'tr' ? 'Tarayıcı Bildirimleri' : 'Browser Notifications'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {permission === 'granted' 
                        ? (language === 'tr' ? '✅ Bildirimler etkin' : '✅ Notifications enabled')
                        : permission === 'denied'
                        ? (language === 'tr' ? '❌ Bildirimler engellendi' : '❌ Notifications blocked')
                        : (language === 'tr' ? 'Bildirimleri etkinleştir' : 'Enable notifications')
                      }
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {permission !== 'granted' ? (
                      <Button 
                        size="sm" 
                        onClick={handleEnableNotifications}
                        disabled={permission === 'denied'}
                        className="bg-gradient-to-r from-orange-500 to-red-500"
                      >
                        {language === 'tr' ? 'Etkinleştir' : 'Enable'}
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleTestNotification}
                      >
                        <TestTube className="w-4 h-4 mr-1" />
                        {language === 'tr' ? 'Test Et' : 'Test'}
                      </Button>
                    )}
                  </div>
                </div>

                {permission === 'denied' && (
                  <p className="text-xs text-destructive">
                    {language === 'tr' 
                      ? 'Tarayıcı ayarlarından bildirimleri etkinleştirin.' 
                      : 'Enable notifications from browser settings.'}
                  </p>
                )}
              </div>
            )}

            {/* Daily Reminder */}
            {isEnabled && (
              <div className="p-4 rounded-xl bg-muted/50 border">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4" />
                  <p className="font-medium">
                    {language === 'tr' ? 'Günlük Hatırlatıcı' : 'Daily Reminder'}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {language === 'tr' 
                    ? 'Her gün belirlediğin saatte alışkanlıklarını hatırlat' 
                    : 'Remind you about habits at the set time every day'}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <select 
                      value={reminderHour}
                      onChange={(e) => setReminderHour(parseInt(e.target.value))}
                      className="bg-background border rounded-lg px-3 py-2 text-sm"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <span>:</span>
                    <select 
                      value={reminderMinute}
                      onChange={(e) => setReminderMinute(parseInt(e.target.value))}
                      className="bg-background border rounded-lg px-3 py-2 text-sm"
                    >
                      {[0, 15, 30, 45].map((m) => (
                        <option key={m} value={m}>
                          {m.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button size="sm" onClick={handleSetReminder}>
                    {language === 'tr' ? 'Kaydet' : 'Save'}
                  </Button>
                  {getReminderTime() && (
                    <Button size="sm" variant="ghost" onClick={handleCancelReminder}>
                      {language === 'tr' ? 'İptal' : 'Cancel'}
                    </Button>
                  )}
                </div>
                {getReminderTime() && (
                  <p className="text-xs text-green-500 mt-2">
                    ✅ {language === 'tr' ? 'Hatırlatıcı aktif' : 'Reminder active'}: {getReminderTime()?.hour.toString().padStart(2, '0')}:{getReminderTime()?.minute.toString().padStart(2, '0')}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1 pt-2">
              <ToggleRow
                label={t.settings.email_notifications}
                description={t.settings.email_notifications_desc}
                checked={settings.notifications.email}
                onChange={(checked) => handleNotificationChange('email', checked)}
              />
              <ToggleRow
                label={t.settings.push_notifications}
                description={t.settings.push_notifications_desc}
                checked={settings.notifications.push}
                onChange={(checked) => handleNotificationChange('push', checked)}
              />
              <ToggleRow
                label={t.settings.habit_reminders}
                description={t.settings.habit_reminders_desc}
                checked={settings.notifications.reminders}
                onChange={(checked) => handleNotificationChange('reminders', checked)}
              />
              <ToggleRow
                label={t.settings.weekly_report}
                description={t.settings.weekly_report_desc}
                checked={settings.notifications.weekly}
                onChange={(checked) => handleNotificationChange('weekly', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t.settings.account}
            </CardTitle>
            <CardDescription>{t.settings.account_desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t.settings.email}</label>
              <Input value={user?.email || ''} disabled className="bg-muted" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => toast.success('Yakında!')}>
                {t.settings.change_password}
              </Button>
              <Button variant="outline" onClick={() => router.push('/profile')}>
                {t.settings.edit_profile}
              </Button>
              <Button variant="outline" onClick={handleSignOut} className="text-destructive hover:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                {language === 'tr' ? 'Çıkış Yap' : 'Sign Out'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscription */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {t.settings.subscription}
            </CardTitle>
            <CardDescription>{t.settings.subscription_desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-card rounded-xl border">
              <div>
                <p className="font-semibold">🆓 {language === 'tr' ? 'Ücretsiz Plan' : 'Free Plan'}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'tr' ? 'Tüm özellikler açık!' : 'All features unlocked!'}
                </p>
              </div>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90" disabled>
                {language === 'tr' ? 'Yakında Pro' : 'Pro Coming Soon'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-card border">
                <p className="text-sm text-muted-foreground">{t.settings.ai_usage}</p>
                <p className="text-2xl font-bold">{stats.aiUsage} / ∞</p>
                <p className="text-xs text-muted-foreground">{language === 'tr' ? 'Bu ay' : 'This month'}</p>
              </div>
              <div className="p-4 rounded-xl bg-card border">
                <p className="text-sm text-muted-foreground">{t.settings.habit_limit}</p>
                <p className="text-2xl font-bold">{stats.habitCount} / ∞</p>
                <p className="text-xs text-muted-foreground">{t.settings.used}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data & Privacy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t.settings.data_privacy}
            </CardTitle>
            <CardDescription>{t.settings.data_privacy_desc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                {t.settings.download_data}
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                <Trash2 className="w-4 h-4 mr-2" />
                {t.settings.delete_account}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t.settings.data_note}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium">Whippy v1.1.0</p>
              <p className="mt-1">© 2025 Whippy. {language === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}</p>
              <div className="flex justify-center gap-4 mt-3">
                <a href="/privacy" className="hover:text-foreground transition-colors">{t.settings.privacy_policy}</a>
                <span>•</span>
                <a href="/terms" className="hover:text-foreground transition-colors">{t.settings.terms}</a>
                <span>•</span>
                <a href="mailto:destek@whippy.life" className="hover:text-foreground transition-colors">{t.settings.support}</a>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function ThemeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200',
        active ? 'border-orange-500 bg-orange-500/10 text-orange-500' : 'border-border hover:border-muted-foreground/50 hover:bg-muted/50'
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {active && <Check className="w-4 h-4 ml-1" />}
    </button>
  )
}

function LanguageButton({ active, onClick, flag, label }: { active: boolean; onClick: () => void; flag: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200',
        active ? 'border-orange-500 bg-orange-500/10 text-orange-500' : 'border-border hover:border-muted-foreground/50 hover:bg-muted/50'
      )}
    >
      <span className="text-lg">{flag}</span>
      <span className="font-medium">{label}</span>
      {active && <Check className="w-4 h-4 ml-1" />}
    </button>
  )
}

function ToggleRow({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={cn('w-12 h-6 rounded-full transition-colors relative shrink-0', checked ? 'bg-orange-500' : 'bg-muted')}
      >
        <motion.div
          className="w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-sm"
          animate={{ left: checked ? 26 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )
}

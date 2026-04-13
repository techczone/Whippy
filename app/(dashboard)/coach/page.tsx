'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Info, Zap, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AICoach } from '@/components/coach/ai-coach'
import { useAppStore } from '@/lib/store'
import { useAuth } from '@/hooks/use-auth'
import { useTranslation } from '@/hooks/use-translation'
import { createClient } from '@/lib/supabase/client'
import type { CoachMode } from '@/types'

const COACH_INFO_TR = {
  gentle: { title: 'Nazik Mod', description: 'Destekleyici, motive edici ve anlayışlı yaklaşım.', icon: '💚' },
  brutal: { title: 'Acımasız Mod', description: 'Sert, gerçekçi ve doğrudan yaklaşım.', icon: '🔥' },
  predict: { title: '6 Ay Tahmini', description: 'Gelecek odaklı analiz ve tahminler.', icon: '🔮' },
}

const COACH_INFO_EN = {
  gentle: { title: 'Gentle Mode', description: 'Supportive, motivating and understanding approach.', icon: '💚' },
  brutal: { title: 'Brutal Mode', description: 'Harsh, realistic and direct approach.', icon: '🔥' },
  predict: { title: '6 Month Prediction', description: 'Future-focused analysis and predictions.', icon: '🔮' },
}

const QUICK_PROMPTS_TR = [
  { label: 'Bugün nasıl gitti?', prompt: 'Bugünkü performansımı değerlendir ve önerilerde bulun.' },
  { label: 'Motivasyon ver', prompt: 'Beni motive et! Devam etmem için nedenler söyle.' },
  { label: 'Son 7 gün analizi', prompt: 'Son 7 günümü analiz et. Neler iyi gitti, neler geliştirilmeli?' },
  { label: 'Yarın için plan', prompt: 'Yarın için ne önerirsin? Optimum bir gün planı yap.' },
  { label: 'Alışkanlık önerisi', prompt: 'Bana yeni alışkanlık önerir misin? Hayatımı iyileştirecek.' },
  { label: 'Hedef kontrolü', prompt: 'Hedeflerime ne kadar yakınım? İlerleme raporumu ver.' },
]

const QUICK_PROMPTS_EN = [
  { label: 'How was today?', prompt: 'Evaluate my performance today and give me suggestions.' },
  { label: 'Motivate me', prompt: 'Motivate me! Give me reasons to keep going.' },
  { label: 'Last 7 days', prompt: 'Analyze my last 7 days. What went well, what needs improvement?' },
  { label: 'Plan for tomorrow', prompt: 'What do you suggest for tomorrow? Create an optimal day plan.' },
  { label: 'Habit suggestion', prompt: 'Can you suggest a new habit? Something to improve my life.' },
  { label: 'Goal check', prompt: 'How close am I to my goals? Give me a progress report.' },
]

export default function CoachPage() {
  const { user } = useAuth()
  const { language } = useTranslation()
  const userId = user?.id
  
  const { coachMode, setCoachMode, coachMessages, clearCoachMessages } = useAppStore()
  const [showInfo, setShowInfo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [quickPromptToSend, setQuickPromptToSend] = useState<string | null>(null)
  const [stats, setStats] = useState({
    habitScore: 0, healthScore: 0, moodScore: 60, overallScore: 0,
    completedHabits: 0, totalHabits: 0, exercise: 0, sleep: 0, water: 0,
    goals: '', projects: '',
  })

  const supabase = useMemo(() => createClient(), [])
  
  const COACH_INFO = language === 'tr' ? COACH_INFO_TR : COACH_INFO_EN
  const QUICK_PROMPTS = language === 'tr' ? QUICK_PROMPTS_TR : QUICK_PROMPTS_EN
  const currentCoachInfo = COACH_INFO[coachMode]

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!userId) { setLoading(false); return }

    const fetchStats = async () => {
      const today = new Date().toISOString().split('T')[0]
      try {
        const { data: habits } = await supabase.from('habits').select('id').eq('user_id', userId).eq('archived', false)
        const totalHabits = habits?.length || 0

        const { data: todayLogs } = await supabase.from('habit_logs').select('completed').eq('user_id', userId).eq('date', today).eq('completed', true)
        const completedHabits = todayLogs?.length || 0
        const habitScore = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

        const { data: health } = await supabase.from('health_entries').select('*').eq('user_id', userId).eq('date', today).single()
        const exercise = health?.exercise_minutes || 0
        const sleep = health?.sleep_hours || 0
        const water = health?.water_liters || 0
        const healthScore = Math.round((Math.min(water / 2.5, 1) * 25) + (sleep >= 7 && sleep <= 9 ? 25 : Math.min(sleep / 8, 1) * 25) + (Math.min(exercise / 30, 1) * 25) + (habitScore / 100 * 25))

        const { data: mood } = await supabase.from('mood_entries').select('value').eq('user_id', userId).eq('date', today).single()
        const moodScore = mood?.value ? mood.value * 20 : 60

        const { data: goals } = await supabase.from('goals').select('title, current_value, target_value, status').eq('user_id', userId).eq('status', 'active').limit(5)
        const goalsText = goals?.map(g => `${g.title}: ${g.current_value}/${g.target_value}`).join(', ') || (language === 'tr' ? 'Henüz aktif hedef yok' : 'No active goals')

        const { data: projects } = await supabase.from('projects').select('name, progress, status').eq('user_id', userId).eq('status', 'active').limit(5)
        const projectsText = projects?.map(p => `${p.name}: %${p.progress}`).join(', ') || (language === 'tr' ? 'Henüz aktif proje yok' : 'No active projects')

        const overallScore = Math.round((habitScore + healthScore + moodScore) / 3)
        setStats({ habitScore, healthScore, moodScore, overallScore, completedHabits, totalHabits, exercise, sleep, water, goals: goalsText, projects: projectsText })
      } catch (err) { console.error('Error fetching stats:', err) } 
      finally { setLoading(false) }
    }
    fetchStats()
  }, [userId, supabase, language])

  const handleQuickPrompt = (prompt: string) => { setQuickPromptToSend(prompt) }
  const handleQuickPromptProcessed = () => { setQuickPromptToSend(null) }

  const t = {
    title: language === 'tr' ? 'AI Yaşam Koçu' : 'AI Life Coach',
    subtitle: language === 'tr' ? 'Acımasızca dürüst veya nazik - sen seç!' : 'Brutally honest or gentle - you choose!',
    aboutModes: language === 'tr' ? 'Modlar Hakkında' : 'About Modes',
    clearHistory: language === 'tr' ? 'Geçmişi Temizle' : 'Clear History',
    activeMode: language === 'tr' ? 'Aktif mod' : 'Active mode',
    currentStatus: language === 'tr' ? 'Güncel Durum' : 'Current Status',
    habit: language === 'tr' ? 'Alışkanlık' : 'Habits',
    healthScore: language === 'tr' ? 'Sağlık Skoru' : 'Health Score',
    mood: language === 'tr' ? 'Ruh Hali' : 'Mood',
    exerciseLabel: language === 'tr' ? 'Egzersiz' : 'Exercise',
    sleepLabel: language === 'tr' ? 'Uyku' : 'Sleep',
    waterLabel: language === 'tr' ? 'Su' : 'Water',
    overall: language === 'tr' ? 'Genel Skor' : 'Overall Score',
    quickQuestions: language === 'tr' ? 'Hızlı Sorular' : 'Quick Questions',
    tips: language === 'tr' ? 'İpuçları' : 'Tips',
    min: language === 'tr' ? 'dk' : 'min',
    hours: language === 'tr' ? 'saat' : 'hours',
  }

  const tips = language === 'tr' 
    ? ['Spesifik sorular daha iyi cevaplar alır', 'Günlük olarak koçunla konuş', 'Zorlandığında Acımasız modu dene', 'Gelecek planları için Tahmin modunu kullan']
    : ['Specific questions get better answers', 'Talk to your coach daily', 'Try Brutal mode when struggling', 'Use Predict mode for future plans']

  if (!mounted) return null
  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" /></div>

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            {t.title}
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowInfo(!showInfo)}>
            <Info className="w-4 h-4 mr-2" />{t.aboutModes}
          </Button>
          {coachMessages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearCoachMessages}>
              <History className="w-4 h-4 mr-2" />{t.clearHistory}
            </Button>
          )}
        </div>
      </motion.div>

      {showInfo && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-4">
          {(Object.entries(COACH_INFO) as [CoachMode, typeof COACH_INFO.gentle][]).map(([mode, info]) => (
            <Card key={mode} className={cn('cursor-pointer transition-all hover:scale-[1.02]', coachMode === mode && 'ring-2 ring-primary')} onClick={() => setCoachMode(mode)}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{info.icon}</span>
                  <h3 className="font-bold">{info.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <AICoach className="h-[calc(100vh-280px)] min-h-[450px]" stats={stats} quickPrompt={quickPromptToSend} onQuickPromptProcessed={handleQuickPromptProcessed} />
        </motion.div>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{currentCoachInfo.icon}</span>
                <div>
                  <h3 className="font-bold">{currentCoachInfo.title}</h3>
                  <p className="text-xs text-muted-foreground">{t.activeMode}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{currentCoachInfo.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                {t.quickQuestions}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_PROMPTS.map((item) => (
                  <Button key={item.label} variant="outline" size="sm" className="h-auto py-2 px-3 text-xs text-left justify-start hover:bg-primary/10 hover:border-primary" onClick={() => handleQuickPrompt(item.prompt)}>
                    {item.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg">📊 {t.currentStatus}</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t.habit}</span><span className="font-medium">{stats.completedHabits}/{stats.totalHabits} ({stats.habitScore}%)</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t.healthScore}</span><span className="font-medium">{stats.healthScore}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t.mood}</span><span className="font-medium">{stats.moodScore}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t.exerciseLabel}</span><span className="font-medium">{stats.exercise} {t.min}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t.sleepLabel}</span><span className="font-medium">{stats.sleep} {t.hours}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t.waterLabel}</span><span className="font-medium">{stats.water} L</span></div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold"><span>{t.overall}</span><span className="text-primary">{stats.overallScore}%</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-lg">💡 {t.tips}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-sm text-muted-foreground">{tip}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

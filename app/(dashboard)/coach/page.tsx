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
import { createClient } from '@/lib/supabase/client'
import type { CoachMode } from '@/types'

const COACH_INFO = {
  gentle: {
    title: 'Nazik Mod',
    description: 'Destekleyici, motive edici ve anlayışlı yaklaşım. Küçük başarılarınızı kutlar, sizi teşvik eder.',
    examples: [
      'Bugün 3 alışkanlığını tamamladın, bu harika bir başlangıç!',
      'Kendine zaman tanı, her gün biraz daha iyi oluyorsun.',
      'Zorlandığın günler olacak, bu normal. Önemli olan devam etmen.',
    ],
    icon: '💚',
    color: 'from-green-500 to-emerald-500',
  },
  brutal: {
    title: 'Acımasız Mod',
    description: 'Sert, gerçekçi ve doğrudan yaklaşım. Bahaneleri kabul etmez, sonuç odaklıdır.',
    examples: [
      'Geçen hafta da aynı bahaneyi söyledin. Sonuç? Sıfır ilerleme.',
      'Netflix izleyecek vaktin var ama egzersiz yapacak vaktin yok mu?',
      'Başarılı insanlar bahane üretmez, çözüm üretir. Sen hangisini seçiyorsun?',
    ],
    icon: '🔥',
    color: 'from-red-500 to-orange-500',
  },
  predict: {
    title: '6 Ay Tahmini Mod',
    description: 'Gelecek odaklı analiz. Mevcut alışkanlıklarınla 6 ay sonra nerede olacağını gösterir.',
    examples: [
      '📊 Mevcut hızla: 6 ay sonra hedefe ulaşma olasılığı %35',
      '🔮 Uyku düzenini düzeltirsen enerji seviyesi %40 artabilir',
      '📈 Son 2 haftalık trend pozitif. Bu ivmeyle 6 ay sonra hedefin %80\'ine ulaşırsın.',
    ],
    icon: '🔮',
    color: 'from-indigo-500 to-purple-500',
  },
}

const QUICK_PROMPTS = [
  { label: 'Bugün nasıl gitti?', prompt: 'Bugünkü performansımı değerlendir ve önerilerde bulun.' },
  { label: 'Motivasyon ver', prompt: 'Beni motive et! Devam etmem için nedenler söyle.' },
  { label: 'Son 7 gün analizi', prompt: 'Son 7 günümü analiz et. Neler iyi gitti, neler geliştirilmeli?' },
  { label: 'Yarın için plan', prompt: 'Yarın için ne önerirsin? Optimum bir gün planı yap.' },
  { label: 'Alışkanlık önerisi', prompt: 'Bana yeni alışkanlık önerir misin? Hayatımı iyileştirecek.' },
  { label: 'Hedef kontrolü', prompt: 'Hedeflerime ne kadar yakınım? İlerleme raporumu ver.' },
]

export default function CoachPage() {
  const { user } = useAuth()
  const userId = user?.id
  
  const { coachMode, setCoachMode, coachMessages, clearCoachMessages } = useAppStore()
  const [showInfo, setShowInfo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    habitScore: 0,
    healthScore: 0,
    moodScore: 60,
    overallScore: 0,
    completedHabits: 0,
    totalHabits: 0,
    exercise: 0,
    sleep: 0,
    water: 0,
    goals: '',
    projects: '',
  })

  const supabase = useMemo(() => createClient(), [])
  const currentCoachInfo = COACH_INFO[coachMode]

  // Fetch user stats for AI context
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      const today = new Date().toISOString().split('T')[0]
      
      try {
        // Fetch habits
        const { data: habits } = await supabase
          .from('habits')
          .select('id')
          .eq('user_id', userId)
          .eq('archived', false)

        const totalHabits = habits?.length || 0

        // Fetch today's habit logs
        const { data: todayLogs } = await supabase
          .from('habit_logs')
          .select('completed')
          .eq('user_id', userId)
          .eq('date', today)
          .eq('completed', true)

        const completedHabits = todayLogs?.length || 0
        const habitScore = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

        // Fetch today's health
        const { data: health } = await supabase
          .from('health_entries')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .single()

        const exercise = health?.exercise_minutes || 0
        const sleep = health?.sleep_hours || 0
        const water = health?.water_liters || 0

        // Calculate health score
        const healthScore = Math.round(
          (Math.min(water / 2.5, 1) * 25) +
          (sleep >= 7 && sleep <= 9 ? 25 : Math.min(sleep / 8, 1) * 25) +
          (Math.min(exercise / 30, 1) * 25) +
          (habitScore / 100 * 25)
        )

        // Fetch today's mood
        const { data: mood } = await supabase
          .from('mood_entries')
          .select('value')
          .eq('user_id', userId)
          .eq('date', today)
          .single()

        const moodScore = mood?.value ? mood.value * 20 : 60

        // Fetch goals
        const { data: goals } = await supabase
          .from('goals')
          .select('title, current_value, target_value, status')
          .eq('user_id', userId)
          .eq('status', 'active')
          .limit(5)

        const goalsText = goals?.map(g => 
          `${g.title}: ${g.current_value}/${g.target_value}`
        ).join(', ') || 'Henüz aktif hedef yok'

        // Fetch projects
        const { data: projects } = await supabase
          .from('projects')
          .select('name, progress, status')
          .eq('user_id', userId)
          .eq('status', 'active')
          .limit(5)

        const projectsText = projects?.map(p => 
          `${p.name}: %${p.progress}`
        ).join(', ') || 'Henüz aktif proje yok'

        const overallScore = Math.round((habitScore + healthScore + moodScore) / 3)

        setStats({
          habitScore,
          healthScore,
          moodScore,
          overallScore,
          completedHabits,
          totalHabits,
          exercise,
          sleep,
          water,
          goals: goalsText,
          projects: projectsText,
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId, supabase])

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            AI Yaşam Koçu
          </h1>
          <p className="text-muted-foreground">Acımasızca dürüst veya nazik - sen seç!</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowInfo(!showInfo)}>
            <Info className="w-4 h-4 mr-2" />
            Modlar Hakkında
          </Button>
          {coachMessages.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearCoachMessages}>
              <History className="w-4 h-4 mr-2" />
              Geçmişi Temizle
            </Button>
          )}
        </div>
      </div>

      {/* Mode info panel */}
      {showInfo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-3 gap-4"
        >
          {(Object.entries(COACH_INFO) as [CoachMode, typeof COACH_INFO.gentle][]).map(([mode, info]) => (
            <Card 
              key={mode}
              className={cn(
                'cursor-pointer transition-all',
                coachMode === mode && 'ring-2 ring-primary'
              )}
              onClick={() => setCoachMode(mode)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{info.icon}</span>
                  {info.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{info.description}</p>
                <div className="space-y-2">
                  {info.examples.slice(0, 2).map((ex, i) => (
                    <p key={i} className="text-xs italic text-muted-foreground/80">"{ex}"</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Main content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat interface */}
        <div className="lg:col-span-2">
          <AICoach 
            className="h-[calc(100vh-250px)] min-h-[500px]" 
            stats={stats}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current mode */}
          <Card className={cn('bg-gradient-to-br', `${currentCoachInfo.color.replace('from-', 'from-').replace(' to-', '/10 to-')}/10`)}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{currentCoachInfo.icon}</span>
                <div>
                  <h3 className="font-bold">{currentCoachInfo.title}</h3>
                  <p className="text-sm text-muted-foreground">Aktif mod</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{currentCoachInfo.description}</p>
            </CardContent>
          </Card>

          {/* Current Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">📊 Güncel Durum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Alışkanlık</span>
                <span className="font-medium">{stats.completedHabits}/{stats.totalHabits} ({stats.habitScore}%)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sağlık Skoru</span>
                <span className="font-medium">{stats.healthScore}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ruh Hali</span>
                <span className="font-medium">{stats.moodScore}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Egzersiz</span>
                <span className="font-medium">{stats.exercise} dk</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uyku</span>
                <span className="font-medium">{stats.sleep} saat</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Su</span>
                <span className="font-medium">{stats.water} L</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-sm font-bold">
                <span>Genel Skor</span>
                <span className="text-primary">{stats.overallScore}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick prompts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Hızlı Sorular
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_PROMPTS.map((item) => (
                  <Button
                    key={item.label}
                    variant="outline"
                    size="sm"
                    className="h-auto py-2 px-3 text-xs text-left justify-start"
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">💡 İpuçları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <TipItem text="Spesifik sorular daha iyi cevaplar alır" />
              <TipItem text="Günlük olarak koçunla konuş" />
              <TipItem text="Zorlandığında Acımasız modu dene" />
              <TipItem text="Gelecek planları için Tahmin modunu kullan" />
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">💬 Sohbet İstatistikleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <StatRow label="Toplam mesaj" value={coachMessages.length.toString()} />
                <StatRow 
                  label="Bu hafta" 
                  value={coachMessages.filter(m => {
                    const msgDate = new Date(m.timestamp)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return msgDate > weekAgo
                  }).length.toString()} 
                />
                <StatRow 
                  label="En çok kullanılan mod" 
                  value={getMostUsedMode(coachMessages.map(m => m.mode))} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function TipItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-primary">•</span>
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function getMostUsedMode(modes: CoachMode[]): string {
  if (modes.length === 0) return '-'
  
  const counts = modes.reduce((acc, mode) => {
    acc[mode] = (acc[mode] || 0) + 1
    return acc
  }, {} as Record<CoachMode, number>)
  
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const modeLabels = { gentle: 'Nazik', brutal: 'Acımasız', predict: 'Tahmin' }
  
  return modeLabels[sorted[0][0] as CoachMode] || '-'
}

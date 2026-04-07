'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Info, Zap, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AICoach, CoachQuickActions } from '@/components/coach/ai-coach'
import { useAppStore } from '@/lib/store'
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
  const { coachMode, setCoachMode, coachMessages, clearCoachMessages } = useAppStore()
  const [showInfo, setShowInfo] = useState(false)

  const currentCoachInfo = COACH_INFO[coachMode]

  const handleQuickPrompt = (prompt: string) => {
    // This would be handled by the AICoach component
    // For now, we'll just show a toast or something
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
          <AICoach className="h-[calc(100vh-250px)] min-h-[500px]" />
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
                    onClick={() => handleQuickPrompt(item.prompt)}
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
              <CardTitle className="text-lg">📊 Sohbet İstatistikleri</CardTitle>
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

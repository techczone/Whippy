'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Droplets, Moon, Flame, Footprints, Dumbbell, TrendingUp, Calendar } from 'lucide-react'
import { cn, formatDate, getWeekDays } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HealthTracker } from '@/components/health/health-tracker'
import { WeeklyChart } from '@/components/charts/weekly-chart'
import type { HealthEntry } from '@/types'

const DEMO_WEEKLY_HEALTH = getWeekDays().map((date) => ({
  date: date.toISOString().split('T')[0],
  water_liters: 1 + Math.random() * 2,
  sleep_hours: 5 + Math.random() * 4,
  exercise_minutes: Math.random() * 90,
  calories: 1500 + Math.random() * 1000,
  steps: 3000 + Math.random() * 10000,
}))

export default function HealthPage() {
  const [todayHealth, setTodayHealth] = useState<Partial<HealthEntry>>({
    water_liters: 1.5,
    sleep_hours: 7,
    exercise_minutes: 30,
    calories: 1800,
    steps: 6500,
    weight: 75,
  })

  const [weeklyData] = useState(DEMO_WEEKLY_HEALTH)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const handleHealthUpdate = (updates: Partial<HealthEntry>) => {
    setTodayHealth(prev => ({ ...prev, ...updates }))
  }

  // Calculate scores
  const waterScore = Math.min(100, ((todayHealth.water_liters || 0) / 2.5) * 100)
  const sleepScore = Math.min(100, ((todayHealth.sleep_hours || 0) / 8) * 100)
  const exerciseScore = Math.min(100, ((todayHealth.exercise_minutes || 0) / 60) * 100)
  const stepsScore = Math.min(100, ((todayHealth.steps || 0) / 10000) * 100)
  const overallScore = Math.round((waterScore + sleepScore + exerciseScore + stepsScore) / 4)

  // Chart data
  const chartData = weeklyData.map(d => ({
    date: d.date,
    water: Math.min(100, (d.water_liters / 2.5) * 100),
    sleep: Math.min(100, (d.sleep_hours / 8) * 100),
    exercise: Math.min(100, (d.exercise_minutes / 60) * 100),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Sağlık Takibi</h1>
          <p className="text-muted-foreground">Günlük sağlık verilerini takip et</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{formatDate(selectedDate, 'EEEE, d MMMM yyyy')}</span>
        </div>
      </div>

      {/* Overall score */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <svg className="w-24 h-24 progress-ring">
                  <circle
                    className="stroke-secondary"
                    strokeWidth="8"
                    fill="transparent"
                    r="40"
                    cx="48"
                    cy="48"
                  />
                  <circle
                    className={cn(
                      'transition-all duration-500',
                      overallScore >= 80 ? 'stroke-success' :
                      overallScore >= 60 ? 'stroke-primary' :
                      overallScore >= 40 ? 'stroke-warning' : 'stroke-destructive'
                    )}
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="transparent"
                    r="40"
                    cx="48"
                    cy="48"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 40}`,
                      strokeDashoffset: `${2 * Math.PI * 40 * (1 - overallScore / 100)}`,
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{overallScore}</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold">Günlük Sağlık Skoru</h2>
                <p className="text-muted-foreground">
                  {overallScore >= 80 ? 'Harika gidiyorsun! 🎉' :
                   overallScore >= 60 ? 'İyi ilerleme! 💪' :
                   overallScore >= 40 ? 'Biraz daha çaba gerekiyor 🎯' : 'Hedeflerine odaklan! 🔥'}
                </p>
              </div>
            </div>

            <div className="hidden md:grid grid-cols-4 gap-4">
              <MetricBadge icon={Droplets} value={Math.round(waterScore)} label="Su" color="#3B82F6" />
              <MetricBadge icon={Moon} value={Math.round(sleepScore)} label="Uyku" color="#8B5CF6" />
              <MetricBadge icon={Dumbbell} value={Math.round(exerciseScore)} label="Egzersiz" color="#22C55E" />
              <MetricBadge icon={Footprints} value={Math.round(stepsScore)} label="Adım" color="#14B8A6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main tracking section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Bugünkü Takip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HealthTracker
                data={todayHealth}
                onChange={handleHealthUpdate}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Weight tracking */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Kilo Takibi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{todayHealth.weight || 0}</span>
                    <span className="text-muted-foreground">kg</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Güncel kilo</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => handleHealthUpdate({ weight: (todayHealth.weight || 0) + 0.1 })}
                  >
                    +
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => handleHealthUpdate({ weight: Math.max(0, (todayHealth.weight || 0) - 0.1) })}
                  >
                    −
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick tips */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                💡 Günün İpucu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {waterScore < 50 
                  ? 'Su içmeyi unutma! Her saat başı bir bardak su iç.' 
                  : sleepScore < 50 
                  ? 'Uyku düzenine dikkat et. 7-8 saat uyumayı hedefle.'
                  : exerciseScore < 50
                  ? 'Bugün biraz hareket et! 30 dakika yürüyüş bile fark yaratır.'
                  : 'Harika gidiyorsun! Böyle devam et! 🌟'}
              </p>
            </CardContent>
          </Card>

          {/* Weekly summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Haftalık Özet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <SummaryRow 
                  label="Ort. su tüketimi" 
                  value={`${(weeklyData.reduce((a, d) => a + d.water_liters, 0) / 7).toFixed(1)} L`} 
                />
                <SummaryRow 
                  label="Ort. uyku" 
                  value={`${(weeklyData.reduce((a, d) => a + d.sleep_hours, 0) / 7).toFixed(1)} saat`} 
                />
                <SummaryRow 
                  label="Toplam egzersiz" 
                  value={`${Math.round(weeklyData.reduce((a, d) => a + d.exercise_minutes, 0))} dk`} 
                />
                <SummaryRow 
                  label="Ort. adım" 
                  value={`${Math.round(weeklyData.reduce((a, d) => a + d.steps, 0) / 7).toLocaleString()}`} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Weekly chart */}
      <WeeklyChart
        data={chartData}
        title="Haftalık Sağlık Trendi"
        type="area"
        metrics={[
          { key: 'water', label: 'Su', color: '#3B82F6' },
          { key: 'sleep', label: 'Uyku', color: '#8B5CF6' },
          { key: 'exercise', label: 'Egzersiz', color: '#22C55E' },
        ]}
      />
    </div>
  )
}

function MetricBadge({ 
  icon: Icon, 
  value, 
  label, 
  color 
}: { 
  icon: React.ElementType
  value: number
  label: string
  color: string
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div 
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="text-lg font-bold">{value}%</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

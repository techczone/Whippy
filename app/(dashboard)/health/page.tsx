'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Droplets, Moon, Flame, Footprints, Dumbbell, TrendingUp, Calendar, Plus, Minus } from 'lucide-react'
import { cn, formatDate, getWeekDays } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useHealth } from '@/hooks/use-health'
import { useAuth } from '@/hooks/use-auth'
import type { HealthEntry } from '@/types'

export default function HealthPage() {
  const { user } = useAuth()
  const userId = user?.id
  
  const {
    todayHealth,
    weeklyHealth,
    loading,
    updateHealth,
    waterScore,
    sleepScore,
    exerciseScore,
    stepsScore,
    overallScore,
  } = useHealth(userId)

  const [selectedDate] = useState(new Date().toISOString().split('T')[0])

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
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <svg className="w-24 h-24 -rotate-90">
                  <circle
                    className="stroke-muted"
                    strokeWidth="8"
                    fill="transparent"
                    r="40"
                    cx="48"
                    cy="48"
                  />
                  <circle
                    className={cn(
                      'transition-all duration-500',
                      overallScore >= 80 ? 'stroke-green-500' :
                      overallScore >= 60 ? 'stroke-primary' :
                      overallScore >= 40 ? 'stroke-yellow-500' : 'stroke-red-500'
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

            <div className="grid grid-cols-4 gap-4">
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
        <div className="lg:col-span-2 space-y-4">
          {/* Water */}
          <HealthMetricCard
            label="Su"
            icon={Droplets}
            value={todayHealth.water_liters || 0}
            target={2.5}
            unit="L"
            color="#3B82F6"
            step={0.25}
            max={5}
            decimals={1}
            onChange={(value) => updateHealth({ water_liters: value })}
          />

          {/* Sleep */}
          <HealthMetricCard
            label="Uyku"
            icon={Moon}
            value={todayHealth.sleep_hours || 0}
            target={8}
            unit="saat"
            color="#8B5CF6"
            step={0.5}
            max={12}
            decimals={1}
            onChange={(value) => updateHealth({ sleep_hours: value })}
          />

          {/* Exercise */}
          <HealthMetricCard
            label="Egzersiz"
            icon={Dumbbell}
            value={todayHealth.exercise_minutes || 0}
            target={60}
            unit="dk"
            color="#22C55E"
            step={5}
            max={180}
            decimals={0}
            onChange={(value) => updateHealth({ exercise_minutes: value })}
          />

          {/* Steps */}
          <HealthMetricCard
            label="Adım"
            icon={Footprints}
            value={todayHealth.steps || 0}
            target={10000}
            unit=""
            color="#14B8A6"
            step={500}
            max={30000}
            decimals={0}
            onChange={(value) => updateHealth({ steps: value })}
          />

          {/* Calories */}
          <HealthMetricCard
            label="Kalori"
            icon={Flame}
            value={todayHealth.calories || 0}
            target={2000}
            unit="kcal"
            color="#F97316"
            step={100}
            max={4000}
            decimals={0}
            onChange={(value) => updateHealth({ calories: value })}
          />
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
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="300"
                      value={todayHealth.weight || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        if (!isNaN(val) && val >= 0) {
                          updateHealth({ weight: val })
                        }
                      }}
                      className="text-2xl font-bold w-24 h-12 text-center"
                      placeholder="0"
                    />
                    <span className="text-muted-foreground text-lg">kg</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Güncel kilo</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateHealth({ weight: Math.round(((todayHealth.weight || 0) + 0.1) * 10) / 10 })}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateHealth({ weight: Math.max(0, Math.round(((todayHealth.weight || 0) - 0.1) * 10) / 10) })}
                  >
                    <Minus className="w-4 h-4" />
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
                <TrendingUp className="w-5 h-5 text-primary" />
                Bu Hafta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <WeeklyStatRow
                  label="Ortalama Su"
                  value={calculateWeeklyAvg(weeklyHealth, 'water_liters')}
                  unit="L"
                  target={2.5}
                />
                <WeeklyStatRow
                  label="Ortalama Uyku"
                  value={calculateWeeklyAvg(weeklyHealth, 'sleep_hours')}
                  unit="saat"
                  target={8}
                />
                <WeeklyStatRow
                  label="Toplam Egzersiz"
                  value={calculateWeeklyTotal(weeklyHealth, 'exercise_minutes')}
                  unit="dk"
                  target={420}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Health Metric Card Component
function HealthMetricCard({
  label,
  icon: Icon,
  value,
  target,
  unit,
  color,
  step,
  max,
  decimals,
  onChange,
}: {
  label: string
  icon: React.ElementType
  value: number
  target: number
  unit: string
  color: string
  step: number
  max: number
  decimals: number
  onChange: (value: number) => void
}) {
  const percentage = Math.min(100, (value / target) * 100)
  const isComplete = percentage >= 100

  const formatValue = (v: number) => {
    return decimals > 0 ? v.toFixed(decimals) : Math.round(v)
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{label}</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step={step}
                  min={0}
                  max={max}
                  value={value || ''}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    if (!isNaN(val) && val >= 0 && val <= max) {
                      onChange(val)
                    }
                  }}
                  className="w-20 h-8 text-center font-bold"
                  style={{ color: isComplete ? '#22C55E' : color }}
                />
                <span className="text-sm text-muted-foreground">
                  / {formatValue(target)} {unit}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onChange(Math.max(0, value - step))}
              >
                <Minus className="w-4 h-4" />
              </Button>

              <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: isComplete ? '#22C55E' : color,
                    width: `${percentage}%` 
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onChange(Math.min(max, value + step))}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Metric Badge
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
    <div className="text-center">
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-1"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <p className="text-lg font-bold">{value}%</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

// Weekly stat row
function WeeklyStatRow({
  label,
  value,
  unit,
  target,
}: {
  label: string
  value: number
  unit: string
  target: number
}) {
  const percentage = Math.min(100, (value / target) * 100)
  
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value.toFixed(1)} {unit}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Helper functions
function calculateWeeklyAvg(data: Partial<HealthEntry>[], key: keyof HealthEntry): number {
  if (data.length === 0) return 0
  const sum = data.reduce((acc, d) => acc + (Number(d[key]) || 0), 0)
  return sum / data.length
}

function calculateWeeklyTotal(data: Partial<HealthEntry>[], key: keyof HealthEntry): number {
  return data.reduce((acc, d) => acc + (Number(d[key]) || 0), 0)
}

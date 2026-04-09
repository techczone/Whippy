'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Droplets, Moon, Flame, Footprints, Dumbbell, TrendingUp, Calendar, Minus, Plus } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useHealth } from '@/hooks/use-health'
import { useTranslation } from '@/hooks/use-translation'
import toast from 'react-hot-toast'

const METRICS = [
  { key: 'water_liters', icon: Droplets, color: '#3B82F6', target: 2.5, unit: 'L', step: 0.25, max: 5 },
  { key: 'sleep_hours', icon: Moon, color: '#8B5CF6', target: 8, unit: 'saat', unit_en: 'hrs', step: 0.5, max: 12 },
  { key: 'exercise_minutes', icon: Dumbbell, color: '#22C55E', target: 60, unit: 'dk', unit_en: 'min', step: 5, max: 180 },
  { key: 'calories', icon: Flame, color: '#F97316', target: 2000, unit: 'kcal', unit_en: 'kcal', step: 100, max: 4000 },
  { key: 'steps', icon: Footprints, color: '#14B8A6', target: 10000, unit: '', unit_en: '', step: 500, max: 25000 },
] as const

export default function HealthPage() {
  const { t, language } = useTranslation()
  const { todayHealth, loading, adjustMetric, updateHealth } = useHealth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate scores
  const getScore = (key: string, value: number) => {
    const metric = METRICS.find(m => m.key === key)
    if (!metric) return 0
    return Math.min(100, (value / metric.target) * 100)
  }

  const waterScore = getScore('water_liters', todayHealth?.water_liters || 0)
  const sleepScore = getScore('sleep_hours', todayHealth?.sleep_hours || 0)
  const exerciseScore = getScore('exercise_minutes', todayHealth?.exercise_minutes || 0)
  const stepsScore = getScore('steps', todayHealth?.steps || 0)
  const overallScore = Math.round((waterScore + sleepScore + exerciseScore + stepsScore) / 4)

  const handleAdjust = async (key: typeof METRICS[number]['key'], amount: number) => {
    const success = await adjustMetric(key, amount)
    if (success && amount > 0) {
      const metric = METRICS.find(m => m.key === key)
      const newValue = (todayHealth?.[key] as number || 0) + amount
      if (metric && newValue >= metric.target) {
        toast.success('🎉 ' + (language === 'tr' ? 'Hedefe ulaştın!' : 'Goal reached!'))
      }
    }
  }

  if (!mounted || loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded w-48" />
        <div className="h-32 bg-muted rounded-xl" />
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t.health_page.title}</h1>
          <p className="text-muted-foreground">{t.health_page.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {formatDate(new Date(), language === 'tr' ? 'EEEE, d MMMM' : 'EEEE, MMMM d')}
        </div>
      </div>

      {/* Overall Score */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <svg className="w-24 h-24 -rotate-90">
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
                <span className="text-2xl font-bold">{overallScore}%</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">{t.dashboard.health_score}</h2>
              <p className="text-muted-foreground text-sm">
                {overallScore >= 80 ? (language === 'tr' ? 'Mükemmel! 🎉' : 'Excellent! 🎉') :
                 overallScore >= 60 ? (language === 'tr' ? 'İyi gidiyorsun!' : 'Doing well!') :
                 overallScore >= 40 ? (language === 'tr' ? 'Daha iyisini yapabilirsin' : 'You can do better') :
                 (language === 'tr' ? 'Bugün kendine bak' : 'Take care of yourself')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="space-y-4">
        {METRICS.map((metric) => {
          const Icon = metric.icon
          const value = (todayHealth?.[metric.key] as number) || 0
          const percentage = Math.min(100, (value / metric.target) * 100)
          const isComplete = percentage >= 100
          const unit = language === 'tr' ? metric.unit : (metric.unit_en || metric.unit)

          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={isComplete ? 'border-green-500/30 bg-green-500/5' : ''}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${metric.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: metric.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {metric.key === 'water_liters' ? t.health_page.water_intake :
                           metric.key === 'sleep_hours' ? t.health_page.sleep_hours :
                           metric.key === 'exercise_minutes' ? t.health_page.exercise :
                           metric.key === 'calories' ? t.health_page.calories :
                           t.health_page.steps}
                        </span>
                        <div className="flex items-center gap-1">
                          <span 
                            className="text-lg font-bold"
                            style={{ color: isComplete ? '#22C55E' : metric.color }}
                          >
                            {metric.key === 'water_liters' ? value.toFixed(1) : Math.round(value)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            / {metric.target} {unit}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-10 h-10 shrink-0"
                          onClick={() => handleAdjust(metric.key, -metric.step)}
                          disabled={value <= 0}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>

                        <div className="flex-1">
                          <Progress
                            value={percentage}
                            className="h-3"
                            style={{ 
                              '--progress-background': `${metric.color}20`,
                              '--progress-foreground': isComplete ? '#22C55E' : metric.color 
                            } as React.CSSProperties}
                          />
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          className="w-10 h-10 shrink-0"
                          onClick={() => handleAdjust(metric.key, metric.step)}
                          disabled={value >= metric.max}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-blue-500">
              {(todayHealth?.water_liters || 0).toFixed(1)}L
            </p>
            <p className="text-xs text-muted-foreground">{t.health_page.water_intake}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-3xl font-bold text-purple-500">
              {(todayHealth?.sleep_hours || 0).toFixed(1)}h
            </p>
            <p className="text-xs text-muted-foreground">{t.health_page.sleep_hours}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

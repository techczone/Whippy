'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Droplets, Moon, Flame, Footprints, Dumbbell, TrendingUp } from 'lucide-react'
import { cn, formatNumber } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { HealthEntry } from '@/types'

interface HealthTrackerProps {
  data: Partial<HealthEntry>
  onChange: (updates: Partial<HealthEntry>) => void
  targets?: {
    water: number
    sleep: number
    calories: number
    exercise: number
    steps: number
  }
  compact?: boolean
}

export function HealthTracker({
  data,
  onChange,
  targets = {
    water: 2.5,
    sleep: 8,
    calories: 2000,
    exercise: 60,
    steps: 10000,
  },
  compact = false,
}: HealthTrackerProps) {
  const metrics = [
    {
      key: 'water_liters' as const,
      label: 'Su',
      icon: Droplets,
      value: data.water_liters || 0,
      target: targets.water,
      unit: 'L',
      color: '#3B82F6',
      step: 0.25,
      max: 5,
    },
    {
      key: 'sleep_hours' as const,
      label: 'Uyku',
      icon: Moon,
      value: data.sleep_hours || 0,
      target: targets.sleep,
      unit: 'saat',
      color: '#8B5CF6',
      step: 0.5,
      max: 12,
    },
    {
      key: 'calories' as const,
      label: 'Kalori',
      icon: Flame,
      value: data.calories || 0,
      target: targets.calories,
      unit: 'kcal',
      color: '#F97316',
      step: 100,
      max: 4000,
    },
    {
      key: 'exercise_minutes' as const,
      label: 'Egzersiz',
      icon: Dumbbell,
      value: data.exercise_minutes || 0,
      target: targets.exercise,
      unit: 'dk',
      color: '#22C55E',
      step: 5,
      max: 180,
    },
    {
      key: 'steps' as const,
      label: 'Adım',
      icon: Footprints,
      value: data.steps || 0,
      target: targets.steps,
      unit: '',
      color: '#14B8A6',
      step: 500,
      max: 25000,
    },
  ]

  if (compact) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {metrics.map((metric) => (
          <HealthMetricCompact
            key={metric.key}
            {...metric}
            onChange={(value) => onChange({ [metric.key]: value })}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.key}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <HealthMetricRow
            {...metric}
            onChange={(value) => onChange({ [metric.key]: value })}
          />
        </motion.div>
      ))}
    </div>
  )
}

interface HealthMetricRowProps {
  label: string
  icon: React.ElementType
  value: number
  target: number
  unit: string
  color: string
  step: number
  max: number
  onChange: (value: number) => void
}

function HealthMetricRow({
  label,
  icon: Icon,
  value,
  target,
  unit,
  color,
  step,
  max,
  onChange,
}: HealthMetricRowProps) {
  const percentage = Math.min(100, (value / target) * 100)
  const isComplete = percentage >= 100

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
      <div
        className="flex items-center justify-center w-12 h-12 rounded-xl"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold" style={{ color: isComplete ? '#22C55E' : color }}>
              {formatNumber(value, unit === 'L' ? 1 : 0)}
            </span>
            <span className="text-sm text-muted-foreground">
              / {formatNumber(target, unit === 'L' ? 1 : 0)} {unit}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onChange(Math.max(0, value - step))}
            className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-lg font-bold transition-colors"
          >
            −
          </button>

          <div className="flex-1">
            <Progress
              value={percentage}
              variant={isComplete ? 'success' : 'default'}
              size="lg"
              className="h-3"
              indicatorClassName="transition-all duration-300"
              style={{ '--progress-color': color } as React.CSSProperties}
            />
          </div>

          <button
            onClick={() => onChange(Math.min(max, value + step))}
            className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-lg font-bold transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

function HealthMetricCompact({
  label,
  icon: Icon,
  value,
  target,
  unit,
  color,
  step,
  max,
  onChange,
}: HealthMetricRowProps) {
  const percentage = Math.min(100, (value / target) * 100)
  const isComplete = percentage >= 100

  return (
    <motion.div
      className={cn(
        'relative p-4 rounded-xl border transition-all cursor-pointer',
        isComplete 
          ? 'bg-success/10 border-success/30' 
          : 'bg-card border-border hover:border-primary/30'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-sm font-medium">{label}</span>
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold" style={{ color: isComplete ? '#22C55E' : color }}>
          {formatNumber(value, unit === 'L' ? 1 : 0)}
        </span>
        <span className="text-xs text-muted-foreground">
          / {formatNumber(target, unit === 'L' ? 1 : 0)} {unit}
        </span>
      </div>

      <Progress
        value={percentage}
        variant={isComplete ? 'success' : 'default'}
        size="sm"
        indicatorClassName="transition-all duration-300"
      />

      <div className="flex items-center justify-between mt-3">
        <button
          onClick={(e) => { e.stopPropagation(); onChange(Math.max(0, value - step)) }}
          className="w-7 h-7 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-sm font-bold transition-colors"
        >
          −
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onChange(Math.min(max, value + step)) }}
          className="w-7 h-7 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center text-sm font-bold transition-colors"
        >
          +
        </button>
      </div>
    </motion.div>
  )
}

// Health summary card for dashboard
export function HealthSummaryCard({ data }: { data: Partial<HealthEntry> }) {
  const calculateHealthScore = () => {
    let score = 0
    let count = 0

    if (data.water_liters) {
      score += Math.min(100, (data.water_liters / 2.5) * 100)
      count++
    }
    if (data.sleep_hours) {
      score += Math.min(100, (data.sleep_hours / 8) * 100)
      count++
    }
    if (data.exercise_minutes) {
      score += Math.min(100, (data.exercise_minutes / 60) * 100)
      count++
    }

    return count > 0 ? Math.round(score / count) : 0
  }

  const healthScore = calculateHealthScore()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          Sağlık Skoru
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative">
            <svg className="w-20 h-20 progress-ring">
              <circle
                className="stroke-secondary"
                strokeWidth="6"
                fill="transparent"
                r="32"
                cx="40"
                cy="40"
              />
              <circle
                className={cn(
                  'transition-all duration-500',
                  healthScore >= 80 ? 'stroke-success' :
                  healthScore >= 60 ? 'stroke-primary' :
                  healthScore >= 40 ? 'stroke-warning' : 'stroke-destructive'
                )}
                strokeWidth="6"
                strokeLinecap="round"
                fill="transparent"
                r="32"
                cx="40"
                cy="40"
                style={{
                  strokeDasharray: `${2 * Math.PI * 32}`,
                  strokeDashoffset: `${2 * Math.PI * 32 * (1 - healthScore / 100)}`,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">{healthScore}</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <MetricMini icon={Droplets} label="Su" value={data.water_liters || 0} unit="L" color="#3B82F6" />
            <MetricMini icon={Moon} label="Uyku" value={data.sleep_hours || 0} unit="sa" color="#8B5CF6" />
            <MetricMini icon={Dumbbell} label="Egzersiz" value={data.exercise_minutes || 0} unit="dk" color="#22C55E" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricMini({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  color 
}: { 
  icon: React.ElementType
  label: string
  value: number
  unit: string
  color: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4" style={{ color }} />
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className="text-sm font-medium">
        {formatNumber(value, unit === 'L' ? 1 : 0)} {unit}
      </span>
    </div>
  )
}

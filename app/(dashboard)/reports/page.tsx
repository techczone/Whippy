'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, TrendingDown, Calendar, Download, Sparkles } from 'lucide-react'
import { cn, formatDate, getWeekDays } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { WeeklyChart, HabitCompletionChart, MoodTrendChart } from '@/components/charts/weekly-chart'

// Generate demo data
const generateWeeklyData = () => {
  return getWeekDays().map((date) => ({
    date: date.toISOString().split('T')[0],
    productivity: 50 + Math.random() * 40,
    health: 40 + Math.random() * 50,
    mood: 45 + Math.random() * 45,
  }))
}

const generateHabitData = () => {
  return getWeekDays().map((date) => ({
    date: date.toISOString().split('T')[0],
    completed: Math.floor(3 + Math.random() * 4),
    total: 6,
  }))
}

const generateMoodData = () => {
  return getWeekDays().map((date) => ({
    date: date.toISOString().split('T')[0],
    mood: Math.floor(2 + Math.random() * 4) as 1 | 2 | 3 | 4 | 5,
  }))
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week')
  const [weeklyData] = useState(generateWeeklyData())
  const [habitData] = useState(generateHabitData())
  const [moodData] = useState(generateMoodData())

  // Calculate averages
  const avgProductivity = Math.round(weeklyData.reduce((a, d) => a + d.productivity, 0) / weeklyData.length)
  const avgHealth = Math.round(weeklyData.reduce((a, d) => a + d.health, 0) / weeklyData.length)
  const avgMood = Math.round(weeklyData.reduce((a, d) => a + d.mood, 0) / weeklyData.length)
  const overallScore = Math.round((avgProductivity + avgHealth + avgMood) / 3)

  // Calculate trends (comparing first half to second half of week)
  const firstHalf = weeklyData.slice(0, 3)
  const secondHalf = weeklyData.slice(4)
  const productivityTrend = secondHalf.length > 0 
    ? Math.round(secondHalf.reduce((a, d) => a + d.productivity, 0) / secondHalf.length - firstHalf.reduce((a, d) => a + d.productivity, 0) / firstHalf.length)
    : 0

  // AI insights (mock)
  const insights = [
    { type: 'positive', text: 'Sabah meditasyonu alışkanlığın uyku kaliteni %15 artırdı.' },
    { type: 'warning', text: 'Çarşamba günleri en düşük verimlilik. Bu günleri hafif tutmayı dene.' },
    { type: 'tip', text: 'Egzersiz yaptığın günlerde ruh halin ortalama 1.2 puan daha yüksek.' },
    { type: 'positive', text: 'Su tüketimin geçen haftaya göre %20 arttı. Harika!' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Raporlar & Analiz</h1>
          <p className="text-muted-foreground">İlerlemenizi takip edin, örüntüleri keşfedin</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-secondary rounded-lg p-1">
            {(['week', 'month', 'year'] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {p === 'week' ? 'Hafta' : p === 'month' ? 'Ay' : 'Yıl'}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ScoreCard
          title="Genel Skor"
          value={overallScore}
          trend={productivityTrend > 0 ? 'up' : productivityTrend < 0 ? 'down' : 'neutral'}
          trendValue={`${productivityTrend > 0 ? '+' : ''}${productivityTrend}%`}
          color="primary"
        />
        <ScoreCard
          title="Verimlilik"
          value={avgProductivity}
          trend={avgProductivity > 70 ? 'up' : 'down'}
          trendValue={avgProductivity > 70 ? '+8%' : '-3%'}
          color="purple"
        />
        <ScoreCard
          title="Sağlık"
          value={avgHealth}
          trend={avgHealth > 60 ? 'up' : 'down'}
          trendValue={avgHealth > 60 ? '+12%' : '-5%'}
          color="green"
        />
        <ScoreCard
          title="Ruh Hali"
          value={avgMood}
          trend={avgMood > 65 ? 'up' : 'neutral'}
          trendValue={avgMood > 65 ? '+5%' : '0%'}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <WeeklyChart 
          data={weeklyData} 
          title="Performans Trendi"
          type="area"
        />
        <HabitCompletionChart data={habitData} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <MoodTrendChart data={moodData} />
        
        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI İçgörüleri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  'p-3 rounded-lg border',
                  insight.type === 'positive' && 'bg-green-500/10 border-green-500/30',
                  insight.type === 'warning' && 'bg-yellow-500/10 border-yellow-500/30',
                  insight.type === 'tip' && 'bg-blue-500/10 border-blue-500/30'
                )}
              >
                <p className="text-sm">
                  {insight.type === 'positive' && '✅ '}
                  {insight.type === 'warning' && '⚠️ '}
                  {insight.type === 'tip' && '💡 '}
                  {insight.text}
                </p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detailed breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Haftalık Detay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Gün</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Verimlilik</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Sağlık</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Ruh Hali</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Alışkanlık</th>
                </tr>
              </thead>
              <tbody>
                {weeklyData.map((day, i) => (
                  <tr key={day.date} className="border-b border-border/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{formatDate(day.date, 'EEEE')}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(day.date, 'd MMM')}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={day.productivity} className="w-20" size="sm" />
                        <span className="text-sm w-10">{Math.round(day.productivity)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={day.health} className="w-20" size="sm" variant="success" />
                        <span className="text-sm w-10">{Math.round(day.health)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Progress value={day.mood} className="w-20" size="sm" variant="warning" />
                        <span className="text-sm w-10">{Math.round(day.mood)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm">{habitData[i]?.completed || 0}/{habitData[i]?.total || 6}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ScoreCard({
  title,
  value,
  trend,
  trendValue,
  color,
}: {
  title: string
  value: number
  trend: 'up' | 'down' | 'neutral'
  trendValue: string
  color: 'primary' | 'purple' | 'green' | 'orange'
}) {
  const colors = {
    primary: 'from-primary/20 to-primary/5 border-primary/30',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
    green: 'from-green-500/20 to-green-500/5 border-green-500/30',
    orange: 'from-orange-500/20 to-orange-500/5 border-orange-500/30',
  }

  return (
    <Card className={cn('bg-gradient-to-br border', colors[color])}>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-bold">{value}</p>
          <div className={cn(
            'flex items-center gap-1 text-sm',
            trend === 'up' && 'text-green-500',
            trend === 'down' && 'text-red-500',
            trend === 'neutral' && 'text-muted-foreground'
          )}>
            {trend === 'up' && <TrendingUp className="w-4 h-4" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4" />}
            <span>{trendValue}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ChartData {
  date: string
  [key: string]: string | number
}

interface WeeklyChartProps {
  data: ChartData[]
  title?: string
  type?: 'area' | 'bar' | 'line'
  metrics?: {
    key: string
    label: string
    color: string
  }[]
  className?: string
}

export function WeeklyChart({
  data,
  title = 'Haftalık Performans',
  type = 'area',
  metrics = [
    { key: 'productivity', label: 'Verimlilik', color: '#8B5CF6' },
    { key: 'health', label: 'Sağlık', color: '#22C55E' },
    { key: 'mood', label: 'Ruh Hali', color: '#F97316' },
  ],
  className,
}: WeeklyChartProps) {
  const formattedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      shortDate: new Date(item.date).toLocaleDateString('tr-TR', { weekday: 'short' }),
    }))
  }, [data])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null

    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{Math.round(entry.value)}</span>
          </div>
        ))}
      </div>
    )
  }

  const renderChart = () => {
    const commonProps = {
      data: formattedData,
      margin: { top: 10, right: 10, left: -20, bottom: 0 },
    }

    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="shortDate" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
            {metrics.map((metric) => (
              <Bar
                key={metric.key}
                dataKey={metric.key}
                name={metric.label}
                fill={metric.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        )

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="shortDate" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
            {metrics.map((metric) => (
              <Line
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                name={metric.label}
                stroke={metric.color}
                strokeWidth={2}
                dot={{ fill: metric.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        )

      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              {metrics.map((metric) => (
                <linearGradient key={metric.key} id={`color${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="shortDate" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: 16 }}
              formatter={(value) => <span className="text-sm">{value}</span>}
            />
            {metrics.map((metric) => (
              <Area
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                name={metric.label}
                stroke={metric.color}
                fill={`url(#color${metric.key})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        )
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// Habit completion chart
export function HabitCompletionChart({ 
  data 
}: { 
  data: { date: string; completed: number; total: number }[] 
}) {
  const formattedData = data.map(item => ({
    ...item,
    shortDate: new Date(item.date).toLocaleDateString('tr-TR', { weekday: 'short' }),
    percentage: item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Alışkanlık Tamamlama</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="shortDate" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                domain={[0, 100]}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  'Tamamlanan'
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar
                dataKey="percentage"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// Mood trend chart
export function MoodTrendChart({
  data,
}: {
  data: { date: string; mood: number }[]
}) {
  const formattedData = data.map(item => ({
    ...item,
    shortDate: new Date(item.date).toLocaleDateString('tr-TR', { weekday: 'short' }),
    moodLabel: ['', '😫', '😔', '😐', '🙂', '😄'][item.mood] || '',
  }))

  const moodColors = {
    1: '#EF4444',
    2: '#F97316',
    3: '#EAB308',
    4: '#84CC16',
    5: '#22C55E',
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Ruh Hali Trendi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="shortDate" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(value) => ['', '😫', '😔', '😐', '🙂', '😄'][value] || ''}
              />
              <Tooltip 
                formatter={(value: number) => [
                  ['', '😫 Çok Kötü', '😔 Kötü', '😐 Orta', '🙂 İyi', '😄 Harika'][value],
                  'Ruh Hali'
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={(props: any) => {
                  const { cx, cy, payload } = props
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill={moodColors[payload.mood as keyof typeof moodColors] || 'hsl(var(--primary))'}
                      stroke="white"
                      strokeWidth={2}
                    />
                  )
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

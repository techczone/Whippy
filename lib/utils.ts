import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isYesterday, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import { tr } from 'date-fns/locale'

// Tailwind class merge utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: string | Date, formatStr: string = 'dd MMM yyyy') {
  return format(new Date(date), formatStr, { locale: tr })
}

export function formatTurkishDate(date: Date): string {
  return format(date, "d MMMM yyyy, EEEE", { locale: tr })
}

export function formatRelativeDate(date: string | Date) {
  const d = new Date(date)
  if (isToday(d)) return 'Bugün'
  if (isYesterday(d)) return 'Dün'
  return formatDistanceToNow(d, { addSuffix: true, locale: tr })
}

export function getWeekDays(date: Date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function isSameDayCheck(date1: Date, date2: Date) {
  return isSameDay(date1, date2)
}

// Score calculation utilities
export function calculateProductivityScore(
  habitsCompleted: number,
  habitsTotal: number,
  goalsProgress: number
): number {
  if (habitsTotal === 0) return 0
  const habitScore = (habitsCompleted / habitsTotal) * 100
  return Math.round(habitScore * 0.6 + goalsProgress * 0.4)
}

export function calculateHealthScore(
  exerciseMinutes: number,
  waterLiters: number,
  sleepHours: number
): number {
  const exerciseScore = Math.min(100, (exerciseMinutes / 60) * 100)
  const waterScore = Math.min(100, (waterLiters / 2.5) * 100)
  const sleepScore = Math.min(100, (sleepHours / 8) * 100)
  return Math.round((exerciseScore + waterScore + sleepScore) / 3)
}

export function calculateOverallScore(
  productivityScore: number,
  healthScore: number,
  moodScore: number
): number {
  return Math.round((productivityScore + healthScore + moodScore) / 3)
}

// Streak utilities
export function calculateStreak(logs: { date: string; completed: boolean }[]): number {
  if (!logs.length) return 0
  
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  for (const log of sortedLogs) {
    const logDate = new Date(log.date)
    logDate.setHours(0, 0, 0, 0)
    
    const diffDays = Math.floor(
      (currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    if (diffDays <= 1 && log.completed) {
      streak++
      currentDate = logDate
    } else if (diffDays > 1) {
      break
    }
  }
  
  return streak
}

// Color utilities
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-yellow-500'
  if (score >= 40) return 'text-orange-500'
  return 'text-red-500'
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

export function getMoodColor(mood: number): string {
  const colors = {
    1: 'text-red-500',
    2: 'text-orange-500',
    3: 'text-yellow-500',
    4: 'text-green-400',
    5: 'text-green-500',
  }
  return colors[mood as keyof typeof colors] || 'text-gray-500'
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Number formatting utilities
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatPercentage(num: number): string {
  return `%${Math.round(num)}`
}

// Storage utilities
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Handle quota exceeded
  }
}

// Debounce utility
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Habit icon options
export const HABIT_ICONS = [
  '🏃', '💪', '📚', '🧘', '💧', '🥗', '😴', '📝', 
  '🎯', '💼', '🎨', '🎵', '🧠', '❤️', '🌱', '⏰',
  '🚶', '🍎', '☕', '🧹', '💊', '🎮', '📱', '🌙'
] as const

// Goal category icons
export const GOAL_CATEGORY_ICONS: Record<string, string> = {
  health: '❤️',
  fitness: '💪',
  career: '💼',
  education: '📚',
  finance: '💰',
  relationship: '👥',
  personal: '🌟',
  other: '📌',
}

// Color options for habits/projects
export const COLOR_OPTIONS = [
  '#8B5CF6', // Purple
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#EAB308', // Yellow
  '#EF4444', // Red
] as const

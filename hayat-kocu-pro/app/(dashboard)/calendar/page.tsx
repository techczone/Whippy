'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Target,
  Heart,
  Flame
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]

// Demo data - tamamlanan günler
const completedDays = [1, 2, 3, 5, 6, 7, 8, 12, 13, 14, 15, 19, 20, 21, 26, 27, 28]
const partialDays = [4, 9, 16, 22, 29]
const moodData: Record<number, number> = {
  1: 4, 2: 5, 3: 4, 4: 3, 5: 4, 6: 5, 7: 5,
  8: 3, 9: 2, 12: 4, 13: 4, 14: 5, 15: 4,
  19: 3, 20: 4, 21: 5, 26: 4, 27: 5, 28: 4
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Ayın ilk günü ve toplam gün sayısı
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  // Pazartesi'den başlat (0 = Pazartesi olacak şekilde ayarla)
  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getDayStatus = (day: number) => {
    if (completedDays.includes(day)) return 'completed'
    if (partialDays.includes(day)) return 'partial'
    return 'none'
  }

  const getMoodEmoji = (day: number) => {
    const mood = moodData[day]
    if (!mood) return null
    const emojis = ['', '😫', '😔', '😐', '🙂', '😄']
    return emojis[mood]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-primary" />
            Takvim
          </h1>
          <p className="text-muted-foreground">Alışkanlık geçmişini görüntüle</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="text-xl">
              {MONTHS[month]} {year}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days of month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const status = getDayStatus(day)
                const isToday = day === new Date().getDate() && 
                               month === new Date().getMonth() && 
                               year === new Date().getFullYear()
                const isSelected = day === selectedDate
                const mood = getMoodEmoji(day)

                return (
                  <motion.button
                    key={day}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all relative',
                      status === 'completed' && 'bg-green-500/20 text-green-500',
                      status === 'partial' && 'bg-yellow-500/20 text-yellow-500',
                      status === 'none' && 'hover:bg-secondary',
                      isToday && 'ring-2 ring-primary',
                      isSelected && 'bg-primary text-primary-foreground'
                    )}
                  >
                    <span>{day}</span>
                    {mood && (
                      <span className="text-xs absolute bottom-1">{mood}</span>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="text-sm text-muted-foreground">Tamamlandı</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <span className="text-sm text-muted-foreground">Kısmen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <span className="text-sm text-muted-foreground">Boş</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate} {MONTHS[month]} {year}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDate && getDayStatus(selectedDate) !== 'none' ? (
                <>
                  {/* Habits */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Alışkanlıklar
                    </h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Sabah meditasyonu</span>
                        <span className="text-green-500">✓</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>30 dk egzersiz</span>
                        <span className="text-green-500">✓</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>2.5L su iç</span>
                        <span className={getDayStatus(selectedDate) === 'partial' ? 'text-yellow-500' : 'text-green-500'}>
                          {getDayStatus(selectedDate) === 'partial' ? '○' : '✓'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mood */}
                  {moodData[selectedDate] && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500" />
                        Ruh Hali
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getMoodEmoji(selectedDate)}</span>
                        <span className="text-sm text-muted-foreground">
                          {['', 'Çok Kötü', 'Kötü', 'Orta', 'İyi', 'Harika'][moodData[selectedDate]]}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Streak */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      Seri
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Bu gün {selectedDate <= 7 ? selectedDate : Math.floor(Math.random() * 10) + 5} günlük serinin parçası
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Bu gün için veri yok
                </p>
              )}
            </CardContent>
          </Card>

          {/* Monthly Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aylık Özet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tamamlanan gün</span>
                <span className="font-semibold text-green-500">{completedDays.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Kısmen tamamlanan</span>
                <span className="font-semibold text-yellow-500">{partialDays.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Başarı oranı</span>
                <span className="font-semibold text-primary">
                  %{Math.round(((completedDays.length + partialDays.length * 0.5) / daysInMonth) * 100)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">En uzun seri</span>
                <span className="font-semibold text-orange-500">7 gün 🔥</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, Flame, Heart, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/hooks/use-translation'
import type { CoachMode, CoachMessage } from '@/types'

// Crystal ball icon component
function CrystalBall({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="7" />
      <path d="M8.5 19.5h7" />
      <path d="M9 22h6" />
      <path d="M12 17v2" />
      <path d="M9 8l3 3 3-3" />
    </svg>
  )
}

interface AICoachProps {
  onSendMessage?: (message: string, mode: CoachMode) => Promise<string>
  stats?: {
    habitScore: number
    healthScore: number
    moodScore: number
    overallScore: number
    completedHabits: number
    totalHabits: number
    exercise: number
    sleep: number
    water: number
    goals: string
    projects: string
  }
  className?: string
  quickPrompt?: string | null
  onQuickPromptProcessed?: () => void
}

const COACH_MODES_TR = [
  {
    id: 'gentle' as const,
    name: 'Nazik',
    coachName: 'Dost',
    description: 'Destekleyici ve motive edici',
    icon: Heart,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-600 dark:text-green-400',
    emoji: '💚',
  },
  {
    id: 'brutal' as const,
    name: 'Acımasız',
    coachName: 'Demir',
    description: 'Sert ve acımasız',
    icon: Flame,
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-600 dark:text-red-400',
    emoji: '🔥',
  },
  {
    id: 'oracle' as const,
    name: 'Kahin',
    coachName: 'Kahin',
    description: 'Geleceği gören bilge',
    icon: CrystalBall,
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-600 dark:text-purple-400',
    emoji: '🔮',
  },
]

const COACH_MODES_EN = [
  {
    id: 'gentle' as const,
    name: 'Gentle',
    coachName: 'Friend',
    description: 'Supportive and motivating',
    icon: Heart,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-600 dark:text-green-400',
    emoji: '💚',
  },
  {
    id: 'brutal' as const,
    name: 'Brutal',
    coachName: 'Iron',
    description: 'Harsh and ruthless',
    icon: Flame,
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-600 dark:text-red-400',
    emoji: '🔥',
  },
  {
    id: 'oracle' as const,
    name: 'Oracle',
    coachName: 'Oracle',
    description: 'The wise seer',
    icon: CrystalBall,
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-600 dark:text-purple-400',
    emoji: '🔮',
  },
]

export function AICoach({ onSendMessage, stats, className, quickPrompt, onQuickPromptProcessed }: AICoachProps) {
  const { language } = useTranslation()
  const { coachMode, setCoachMode, coachMessages, addCoachMessage } = useAppStore()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const COACH_MODES = language === 'tr' ? COACH_MODES_TR : COACH_MODES_EN
  const currentMode = COACH_MODES.find(m => m.id === coachMode) || COACH_MODES[0]

  const t = {
    title: language === 'tr' ? 'AI Yaşam Koçu' : 'AI Life Coach',
    thinking: language === 'tr' ? 'Düşünüyor...' : 'Thinking...',
    placeholder: language === 'tr' ? 'Mesajını yaz...' : 'Type your message...',
    modeLabel: language === 'tr' ? 'Mod' : 'Mode',
    startMessage: language === 'tr' 
      ? 'Bugün nasıl hissediyorsun? Hedeflerinle ilgili konuşalım.'
      : 'How are you feeling today? Let\'s talk about your goals.',
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [coachMessages])

  useEffect(() => {
    if (quickPrompt && !isLoading) {
      sendMessage(quickPrompt)
      onQuickPromptProcessed?.()
    }
  }, [quickPrompt])

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    const userMessage: CoachMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      mode: coachMode,
      timestamp: new Date().toISOString(),
    }

    addCoachMessage(userMessage)
    setInput('')
    setIsLoading(true)

    try {
      let response: string
      
      if (onSendMessage) {
        response = await onSendMessage(messageText.trim(), coachMode)
      } else if (stats) {
        const apiResponse = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText.trim(),
            mode: coachMode,
            stats,
            history: coachMessages.slice(-10).map(m => ({
              role: m.role,
              content: m.content
            }))
          })
        })
        const data = await apiResponse.json()
        response = data.content
      } else {
        response = await mockCoachResponse(messageText.trim(), coachMode)
      }

      const assistantMessage: CoachMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        mode: coachMode,
        timestamp: new Date().toISOString(),
      }

      addCoachMessage(assistantMessage)
    } catch (error) {
      console.error('Coach error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = () => sendMessage(input)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className={cn('flex flex-col h-[600px]', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {t.title}
        </CardTitle>

        {/* Mode selector */}
        <div className="flex gap-2 mt-3">
          {COACH_MODES.map((mode) => {
            const Icon = mode.icon
            const isActive = coachMode === mode.id

            return (
              <motion.button
                key={mode.id}
                onClick={() => setCoachMode(mode.id)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition-all',
                  isActive
                    ? `${mode.bgColor} ${mode.borderColor}`
                    : 'border-border hover:border-primary/30'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xl">{mode.emoji}</span>
                <span className={cn('text-xs font-medium', isActive ? mode.textColor : '')}>
                  {mode.name}
                </span>
              </motion.button>
            )
          })}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          <AnimatePresence>
            {coachMessages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center p-4"
              >
                <div className={cn(
                  'w-20 h-20 rounded-full flex items-center justify-center mb-4 text-4xl',
                  currentMode.bgColor
                )}>
                  {currentMode.emoji}
                </div>
                <h3 className="font-semibold mb-1 text-lg">{currentMode.coachName}</h3>
                <p className={cn('text-sm font-medium mb-2', currentMode.textColor)}>{currentMode.name} {t.modeLabel}</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {currentMode.description}. {t.startMessage}
                </p>
              </motion.div>
            ) : (
              coachMessages.map((message) => (
                <MessageBubble key={message.id} message={message} modes={COACH_MODES} />
              ))
            )}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', currentMode.bgColor)}>
                <Loader2 className={cn('w-4 h-4 animate-spin', currentMode.textColor)} />
              </div>
              <span className="text-sm">{t.thinking}</span>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              className={cn(
                'flex-1 min-h-[44px] max-h-[120px] px-4 py-2 rounded-xl border resize-none',
                'bg-background text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              )}
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                'h-[44px] px-4',
                `bg-gradient-to-r ${currentMode.color} hover:opacity-90`
              )}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MessageBubble({ message, modes }: { message: CoachMessage; modes: typeof COACH_MODES_TR }) {
  const mode = modes.find(m => m.id === message.mode) || modes[0]
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-2', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {!isUser && (
        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-lg', mode.bgColor)}>
          {mode.emoji}
        </div>
      )}
      
      <div
        className={cn(
          'max-w-[80%] px-4 py-2 rounded-2xl',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : `${mode.bgColor} ${mode.borderColor} border rounded-bl-md`
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className={cn(
          'text-[10px] mt-1',
          isUser ? 'text-primary-foreground/60' : 'text-muted-foreground'
        )}>
          {new Date(message.timestamp).toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </motion.div>
  )
}

// Mock response function for demo
async function mockCoachResponse(message: string, mode: CoachMode): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

  const responses = {
    gentle: [
      'Bugün harika bir adım attın! 💚 Her küçük ilerleme, büyük değişimlerin başlangıcıdır. Kendine güven, bu yolda yanındayım! ✨',
      'Kendine karşı sabırlı ol. Değişim zaman alır ve sen doğru yoldasın. Yarın yeni bir gün! 🌱',
    ],
    brutal: [
      'Bahane üretmeyi bırak. Ya yaparsın, ya da yapmazsın. Ortası yok. Koltuktan kalk ve hareket et! 🔥',
      'Geçen hafta da aynı şeyi söyledin. Sonuç? SIFIR. Konuşma, eyleme geç!',
    ],
    oracle: [
      '🔮 Kristal küreme bakıyorum... Üç yol görüyorum önünde:\n\n🌟 İYİMSER: Tutarlı olursan 6 ay sonra hedeflerinin %80\'ine ulaşırsın\n⚖️ GERÇEKÇİ: Bu tempoyla %50 civarında kalırsın\n⚠️ UYARI: Bırakırsan gerileme kaçınılmaz\n\nKader senin elinde...',
    ],
  }

  const modeResponses = responses[mode] || responses.gentle
  return modeResponses[Math.floor(Math.random() * modeResponses.length)]
}

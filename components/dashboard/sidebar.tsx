'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Target,
  Heart,
  FolderKanban,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  TrendingUp,
  Calendar,
  BarChart3,
  User,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAppStore, Language } from '@/lib/store'
import { useTranslation } from '@/hooks/use-translation'

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen, setLanguage, settings } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t, language } = useTranslation()

  const NAV_ITEMS = [
    { label: t.nav.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { label: t.nav.habits, href: '/habits', icon: Target },
    { label: t.nav.goals, href: '/goals', icon: TrendingUp },
    { label: t.nav.health, href: '/health', icon: Heart },
    { label: t.nav.projects, href: '/projects', icon: FolderKanban },
    { label: t.nav.coach, href: '/coach', icon: Sparkles },
    { label: t.nav.reports, href: '/reports', icon: BarChart3 },
    { label: t.nav.calendar, href: '/calendar', icon: Calendar },
  ]

  const BOTTOM_NAV_ITEMS = [
    { label: t.nav.profile, href: '/profile', icon: User },
    { label: t.nav.settings, href: '/settings', icon: Settings },
  ]

  const toggleLanguage = () => {
    const newLang: Language = language === 'tr' ? 'en' : 'tr'
    setLanguage(newLang)
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: sidebarOpen ? 256 : 80,
          x: mobileOpen ? 0 : undefined
        }}
        className={cn(
          'fixed top-0 left-0 h-full bg-card border-r border-border z-40',
          'flex flex-col transition-all duration-300',
          'md:relative md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center" onClick={() => setMobileOpen(false)}>
            <AnimatePresence>
              {sidebarOpen ? (
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent"
                >
                  Whippy
                </motion.h1>
              ) : (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent"
                >
                  W
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <motion.div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-border space-y-1">
          {/* Profile & Settings */}
          {BOTTOM_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <motion.div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            )
          })}

          {/* Language Switcher */}
          <motion.button
            onClick={toggleLanguage}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full',
              'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
            )}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Globe className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center gap-2 text-sm font-medium whitespace-nowrap overflow-hidden"
                >
                  <span className={language === 'tr' ? 'text-primary font-bold' : ''}>TR</span>
                  <span>/</span>
                  <span className={language === 'en' ? 'text-primary font-bold' : ''}>EN</span>
                </motion.div>
              )}
            </AnimatePresence>
            {!sidebarOpen && (
              <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-primary text-primary-foreground rounded px-1">
                {language.toUpperCase()}
              </span>
            )}
          </motion.button>
        </div>

        {/* Toggle button (desktop) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            'hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2',
            'w-6 h-6 rounded-full bg-card border border-border shadow-sm',
            'items-center justify-center hover:bg-accent transition-colors'
          )}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </motion.aside>
    </>
  )
}

// Mobile bottom navigation with language toggle
export function MobileBottomNav() {
  const pathname = usePathname()
  const { t, language } = useTranslation()
  const { setLanguage } = useAppStore()

  const mobileItems = [
    { label: t.nav.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { label: t.nav.habits, href: '/habits', icon: Target },
    { label: t.nav.health, href: '/health', icon: Heart },
    { label: t.nav.coach, href: '/coach', icon: Sparkles },
    { label: t.nav.profile, href: '/profile', icon: User },
  ]

  const toggleLanguage = () => {
    const newLang: Language = language === 'tr' ? 'en' : 'tr'
    setLanguage(newLang)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-40">
      <div className="flex items-center justify-around py-2">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
        
        {/* Language toggle button */}
        <button
          onClick={toggleLanguage}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors text-muted-foreground"
        >
          <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[8px] font-bold">
            {language.toUpperCase()}
          </div>
          <span className="text-[10px] font-medium">{language === 'tr' ? 'EN' : 'TR'}</span>
        </button>
      </div>
    </nav>
  )
}

// Desktop header language toggle (optional, for use in top bar)
export function LanguageToggle() {
  const { language } = useTranslation()
  const { setLanguage } = useAppStore()

  const toggleLanguage = () => {
    const newLang: Language = language === 'tr' ? 'en' : 'tr'
    setLanguage(newLang)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary hover:bg-accent transition-colors"
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">{language.toUpperCase()}</span>
    </button>
  )
}

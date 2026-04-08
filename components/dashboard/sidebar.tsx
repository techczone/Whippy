'use client'

import { useEffect } from 'react'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { useTranslation } from '@/hooks/use-translation'

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen, mobileMenuOpen, setMobileMenuOpen } = useAppStore()
  const { t } = useTranslation()

  // Sayfa değiştiğinde mobil menüyü kapat
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname, setMobileMenuOpen])

  // Mobil menü açıkken scroll'u engelle
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

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

  return (
    <>
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-card/95 backdrop-blur-sm border-b border-border z-50 md:hidden flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          className="mr-3"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
        <Link href="/dashboard" className="flex items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Whippy
          </span>
        </Link>
      </header>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar - Slide from left */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50 md:hidden flex flex-col"
          >
            {/* Mobile Logo */}
            <div className="h-14 flex items-center px-4 border-b border-border">
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Whippy
                </span>
              </Link>
              <span className="ml-2 text-xs text-muted-foreground">🔥 Bahane yok</span>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon

                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <div
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.98]',
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Mobile Bottom Navigation */}
            <div className="p-3 border-t border-border space-y-1">
              {BOTTOM_NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <div
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-[0.98]',
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 80 }}
        className={cn(
          'hidden md:flex fixed top-0 left-0 h-full bg-card border-r border-border z-40',
          'flex-col transition-all duration-300'
        )}
      >
        {/* Desktop Logo */}
        <div className="p-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center">
            <AnimatePresence mode="wait">
              {sidebarOpen ? (
                <motion.h1
                  key="full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent"
                >
                  Whippy
                </motion.h1>
              ) : (
                <motion.span
                  key="short"
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

        {/* Desktop Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
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

        {/* Desktop Bottom Navigation */}
        <div className="p-3 border-t border-border space-y-1">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.href} href={item.href}>
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
        </div>

        {/* Desktop Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            'absolute -right-3 top-1/2 -translate-y-1/2',
            'w-6 h-6 rounded-full bg-card border border-border shadow-sm',
            'flex items-center justify-center hover:bg-accent transition-colors'
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

// Mobile bottom navigation - Quick access to main features
export function MobileBottomNav() {
  const pathname = usePathname()
  const { t } = useTranslation()

  const mobileItems = [
    { label: t.nav.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { label: t.nav.habits, href: '/habits', icon: Target },
    { label: t.nav.coach, href: '/coach', icon: Sparkles },
    { label: t.nav.health, href: '/health', icon: Heart },
    { label: t.nav.profile, href: '/profile', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border md:hidden z-40 safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-1">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all min-w-[60px] active:scale-95',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground active:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'text-primary')} />
              <span className={cn(
                'text-[10px] font-medium',
                isActive && 'text-primary'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

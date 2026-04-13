'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAppStore, Language } from '@/lib/store'
import { useTranslation } from '@/hooks/use-translation'

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen, setLanguage } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t, language } = useTranslation()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const NAV_ITEMS = [
    { label: t.nav.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { label: t.nav.habits, href: '/habits', icon: Target },
    { label: t.nav.goals, href: '/goals', icon: TrendingUp },
    { label: t.nav.health, href: '/health', icon: Heart },
    { label: t.nav.projects, href: '/projects', icon: FolderKanban },
    { label: t.nav.coach, href: '/coach', icon: Sparkles },
    { label: t.nav.reports, href: '/reports', icon: BarChart3 },
    { label: t.nav.calendar, href: '/calendar', icon: Calendar },
    { label: t.nav.social || (language === 'tr' ? 'Sosyal' : 'Social'), href: '/social', icon: Users },
  ]

  const BOTTOM_NAV_ITEMS = [
    { label: t.nav.profile, href: '/profile', icon: User },
    { label: t.nav.settings, href: '/settings', icon: Settings },
  ]

  const toggleLanguage = () => {
    const newLang: Language = language === 'tr' ? 'en' : 'tr'
    setLanguage(newLang)
  }

  const handleNavClick = () => {
    setMobileOpen(false)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

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

      <aside
        className={cn(
          'fixed top-0 left-0 bg-card border-r border-border z-40',
          'flex flex-col transition-all duration-300 ease-in-out',
          'h-[calc(100dvh-64px)] md:h-dvh',
          'md:relative md:translate-x-0',
          sidebarOpen ? 'md:w-64' : 'md:w-20',
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
        )}
      >
        <div className="p-4 border-b border-border shrink-0">
          <Link href="/dashboard" className="flex items-center" onClick={handleNavClick}>
            <Image src="/logo.png" alt="Whippy" width={36} height={36} className="rounded-xl shrink-0" />
            <AnimatePresence>
              {(sidebarOpen || mobileOpen) && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="ml-3 text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent whitespace-nowrap overflow-hidden"
                >
                  Whippy
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto min-h-0">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} onClick={handleNavClick}>
                <motion.div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                    isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <AnimatePresence>
                    {(sidebarOpen || mobileOpen) && (
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

        <div className="p-3 border-t border-border shrink-0">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} onClick={handleNavClick}>
                <motion.div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl transition-all',
                    isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <AnimatePresence>
                    {(sidebarOpen || mobileOpen) && (
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

          <motion.button
            onClick={toggleLanguage}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl transition-all w-full mt-1',
              'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
            )}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Globe className="w-5 h-5 shrink-0" />
            <AnimatePresence>
              {(sidebarOpen || mobileOpen) && (
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
          </motion.button>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            'hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2',
            'w-6 h-6 rounded-full bg-card border border-border shadow-sm',
            'items-center justify-center hover:bg-accent transition-colors'
          )}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </aside>
    </>
  )
}

export function MobileBottomNav() {
  const pathname = usePathname()
  const { t, language } = useTranslation()

  const mobileItems = [
    { label: t.nav.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { label: t.nav.habits, href: '/habits', icon: Target },
    { label: t.nav.social || (language === 'tr' ? 'Sosyal' : 'Social'), href: '/social', icon: Users },
    { label: t.nav.coach, href: '/coach', icon: Sparkles },
    { label: t.nav.profile, href: '/profile', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-40 h-16">
      <div className="flex items-center justify-around h-full">
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
      </div>
    </nav>
  )
}

'use client'

import { Sidebar, MobileBottomNav } from '@/components/dashboard/sidebar'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { sidebarOpen } = useAppStore()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main 
        className={cn(
          'flex-1 transition-all duration-300 w-full',
          // Mobile: top padding for header, bottom for nav
          'pt-14 pb-20',
          // Desktop: no top padding, sidebar margin
          'md:pt-0 md:pb-0',
          sidebarOpen ? 'md:ml-64' : 'md:ml-20'
        )}
      >
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
          {children}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  )
}

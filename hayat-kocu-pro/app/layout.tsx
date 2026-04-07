import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/providers/theme-provider'

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Whippy - Acımasız AI Yaşam Koçun',
  description: 'Bahane yok, sadece sonuç. Acımasızca dürüst AI yaşam koçun ile alışkanlıklarını takip et, hedeflerine ulaş.',
  keywords: ['whippy', 'yaşam koçu', 'habit tracker', 'alışkanlık takip', 'AI coach', 'productivity', 'brutal coach'],
  authors: [{ name: 'Whippy' }],
  openGraph: {
    title: 'Whippy - Acımasız AI Yaşam Koçun',
    description: 'Bahane yok, sadece sonuç. 🔥',
    type: 'website',
    url: 'https://whippy.life',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whippy - Acımasız AI Yaşam Koçun',
    description: 'Bahane yok, sadece sonuç. 🔥',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${jakarta.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
            },
            success: {
              iconTheme: {
                primary: 'hsl(var(--success))',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'hsl(var(--destructive))',
                secondary: 'white',
              },
            },
          }}
        />
      </body>
    </html>
  )
}

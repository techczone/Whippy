import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/providers/theme-provider'

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'Whippy - Acımasız AI Yaşam Koçun',
    template: '%s | Whippy',
  },
  description: 'Bahane yok, sadece sonuç. Acımasızca dürüst AI yaşam koçun ile alışkanlıklarını takip et, hedeflerine ulaş. Ücretsiz başla!',
  keywords: [
    'whippy',
    'yaşam koçu',
    'AI koç',
    'habit tracker',
    'alışkanlık takip',
    'hedef takip',
    'productivity',
    'brutal coach',
    'kişisel gelişim',
    'sağlık takibi',
  ],
  authors: [{ name: 'Whippy', url: 'https://whippy.life' }],
  creator: 'Whippy',
  publisher: 'Whippy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://whippy.life'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Whippy - Acımasız AI Yaşam Koçun',
    description: 'Bahane yok, sadece sonuç. 🔥 Alışkanlıklarını takip et, hedeflerine ulaş.',
    type: 'website',
    url: 'https://whippy.life',
    siteName: 'Whippy',
    locale: 'tr_TR',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Whippy - Acımasız AI Yaşam Koçun',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whippy - Acımasız AI Yaşam Koçun',
    description: 'Bahane yok, sadece sonuç. 🔥',
    creator: '@whippylife',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icons/safari-pinned-tab.svg', color: '#f97316' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Whippy',
  },
  applicationName: 'Whippy',
  category: 'productivity',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Whippy" />
      </head>
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

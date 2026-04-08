import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/providers/theme-provider'
import Script from 'next/script'

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
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Whippy',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Whippy - Acımasız AI Yaşam Koçun',
    description: 'Bahane yok, sadece sonuç. 🔥',
    type: 'website',
    url: 'https://whippy.life',
    siteName: 'Whippy',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Whippy - AI Yaşam Koçu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whippy - Acımasız AI Yaşam Koçun',
    description: 'Bahane yok, sadece sonuç. 🔥',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icons/safari-pinned-tab.svg', color: '#f97316' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* PWA iOS specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Whippy" />
        
        {/* iOS Splash Screens */}
        <link 
          rel="apple-touch-startup-image" 
          href="/splash/apple-splash-2048-2732.png" 
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" 
        />
        <link 
          rel="apple-touch-startup-image" 
          href="/splash/apple-splash-1170-2532.png" 
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" 
        />
        <link 
          rel="apple-touch-startup-image" 
          href="/splash/apple-splash-1284-2778.png" 
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" 
        />
      </head>
      <body className={`${jakarta.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Toaster
          position="bottom-center"
          containerStyle={{
            bottom: 80, // Above mobile nav
          }}
          toastOptions={{
            duration: 3000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--card-foreground))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
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
        
        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('SW registered:', registration.scope);
                  },
                  function(err) {
                    console.log('SW registration failed:', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}

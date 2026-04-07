'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Loader2, Mail, Lock, User, Sparkles, Check } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const FEATURES = [
  'Sınırsız alışkanlık takibi',
  'AI destekli yaşam koçu',
  '3 farklı koçluk modu',
  'İlerleme raporları',
]

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const { signUpWithEmail, signInWithOAuth } = useAuth()

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signUpWithEmail(email, password, name)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Kayıt oluşturulamadı')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setOauthLoading(provider)
    setError(null)

    try {
      await signInWithOAuth(provider)
    } catch (err: any) {
      setError(err.message || 'Giriş yapılamadı')
      setOauthLoading(null)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="border-border/50 shadow-xl text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <CardTitle className="text-xl">Kayıt Başarılı! 🎉</CardTitle>
            <CardDescription>
              E-posta adresine bir doğrulama linki gönderdik.
              Lütfen e-postanı kontrol et.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Giriş Yap</Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-border/50 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span className="text-3xl">🔥</span>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Whippy</CardTitle>
          <CardDescription>Ücretsiz hesap oluştur</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Features */}
          <div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-secondary/30">
            {FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <Check className="w-3 h-3 text-green-500 shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>

          {/* OAuth Buttons */}
          <div className="grid gap-3">
            <Button
              variant="outline"
              onClick={() => handleOAuthLogin('google')}
              disabled={oauthLoading !== null}
              className="w-full h-12"
            >
              {oauthLoading === 'google' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Google ile kaydol
            </Button>

            <Button
              variant="outline"
              onClick={() => handleOAuthLogin('apple')}
              disabled={oauthLoading !== null}
              className="w-full h-12"
            >
              {oauthLoading === 'apple' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              )}
              Apple ile kaydol
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">veya</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Adın"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User className="w-4 h-4" />}
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="E-posta adresin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Şifre (min. 6 karakter)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                minLength={6}
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-destructive text-center"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Ücretsiz Kaydol
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground">
            Kaydolarak{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Kullanım Koşullarını
            </Link>
            {' '}ve{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Gizlilik Politikasını
            </Link>
            {' '}kabul etmiş olursun.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-0">
          <div className="text-center text-sm text-muted-foreground">
            Zaten hesabın var mı?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Giriş yap
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Heart, 
  Flame, 
  Eye,
  Check,
  ArrowRight,
  Star,
  Zap,
  Skull,
  Trophy
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const FEATURES = [
  {
    icon: Target,
    title: 'Alışkanlık Takibi',
    description: 'Günlük alışkanlıklarını oluştur, takip et ve seri rekorlarını kır.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Brain,
    title: 'AI Yaşam Koçu',
    description: 'Acımasız veya nazik - kişiselleştirilmiş gerçek zamanlı analiz.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: TrendingUp,
    title: 'İlerleme Analizi',
    description: 'Detaylı grafikler ve haftalık raporlarla gelişimini gör.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Heart,
    title: 'Sağlık Metrikleri',
    description: 'Uyku, egzersiz, su tüketimi ve ruh halini kaydet.',
    color: 'from-pink-500 to-rose-500',
  },
]

const COACH_MODES = [
  {
    icon: Heart,
    name: 'Nazik Mod',
    description: 'Destekleyici, motive edici ve anlayışlı geri bildirimler',
    color: 'bg-green-500/20 text-green-500 border-green-500/30',
    emoji: '💚',
  },
  {
    icon: Flame,
    name: 'Acımasız Mod',
    description: 'Direkt, sert ve bahane kabul etmeyen yaklaşım',
    color: 'bg-red-500/20 text-red-500 border-red-500/30',
    emoji: '🔥',
  },
  {
    icon: Eye,
    name: '6 Ay Tahmini',
    description: 'Mevcut verilerle geleceğe dönük senaryo analizi',
    color: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
    emoji: '🔮',
  },
]

const PRICING = [
  {
    name: 'Ücretsiz',
    price: '₺0',
    period: '/ay',
    description: 'Başlamak için ideal',
    features: [
      '3 alışkanlık takibi',
      '2 hedef belirleme',
      'Temel AI koç (günde 5 mesaj)',
      'Nazik mod',
    ],
    cta: 'Ücretsiz Başla',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: '₺99',
    period: '/ay',
    description: 'Ciddi kullanıcılar için',
    features: [
      '20 alışkanlık takibi',
      '10 hedef belirleme',
      'Sınırsız AI koç mesajı',
      'Tüm koç modları',
      'Haftalık raporlar',
      '6 ay tahmin modu',
    ],
    cta: 'Pro\'ya Geç',
    href: '/signup?plan=pro',
    popular: true,
  },
  {
    name: 'Elite',
    price: '₺199',
    period: '/ay',
    description: 'Maksimum potansiyel',
    features: [
      'Sınırsız her şey',
      'Öncelikli destek',
      'API erişimi',
      'Özel entegrasyonlar',
      'Takım özellikleri',
      'White-label seçeneği',
    ],
    cta: 'Elite\'e Geç',
    href: '/signup?plan=elite',
    popular: false,
  },
]

const TESTIMONIALS = [
  {
    quote: 'Acımasız mod sayesinde 3 ayda 15 kilo verdim. Bahanelere artık yer yok!',
    author: 'Mehmet K.',
    role: 'Yazılım Mühendisi',
    avatar: '👨‍💻',
  },
  {
    quote: '6 ay tahmini özelliği gözlerimi açtı. Şimdi her gün daha bilinçli yaşıyorum.',
    author: 'Ayşe T.',
    role: 'Girişimci',
    avatar: '👩‍💼',
  },
  {
    quote: 'Alışkanlık takibi ile 100 günlük seri yaptım. Bu uygulama hayatımı değiştirdi.',
    author: 'Can B.',
    role: 'Öğrenci',
    avatar: '👨‍🎓',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-lg">🔥</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Whippy</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Özellikler
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Fiyatlar
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Giriş
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                Ücretsiz Başla
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-500 text-sm font-medium mb-6 border border-orange-500/20">
              <Flame className="w-4 h-4" />
              Bahane yok, sadece sonuç
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Acımasız AI{' '}
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">Yaşam Koçun</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Alışkanlıklarını takip et, hedeflerine ulaş ve AI koçunla her gün daha iyi bir versiyon ol.
              <strong className="text-orange-400"> Bahanelere yer yok.</strong> 🔥
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/30">
                  Ücretsiz Başla
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 border-orange-500/30 hover:bg-orange-500/10">
                  Demo'yu Dene
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Kredi kartı gerektirmez • 14 gün ücretsiz Pro deneme
            </p>
          </motion.div>

          {/* Animated badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-12 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-card border border-border"
          >
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm">👨‍💻</div>
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-sm">👩‍💼</div>
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-sm">👨‍🎓</div>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">1,234+ kişi katıldı</p>
              <p className="text-xs text-muted-foreground">Son 30 günde</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-gradient-to-b from-orange-500/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Güçlü Özellikler 💪</h2>
            <p className="text-muted-foreground">
              Her şeyi tek bir yerden yönet, ilerlemenizi görselleştir
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:border-orange-500/30 transition-colors group">
                  <CardContent className="pt-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coach Modes */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">3 Farklı Koçluk Modu</h2>
            <p className="text-muted-foreground">
              İhtiyacına göre koçunu özelleştir
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {COACH_MODES.map((mode, i) => (
              <motion.div
                key={mode.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl border ${mode.color} hover:scale-105 transition-transform cursor-pointer`}
              >
                <div className="text-4xl mb-4">{mode.emoji}</div>
                <h3 className="font-semibold mb-2">{mode.name}</h3>
                <p className="text-sm opacity-80">{mode.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-orange-500/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Kullanıcılar Ne Diyor? 🗣️</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:border-orange-500/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-orange-500 text-orange-500" />
                      ))}
                    </div>
                    <p className="text-sm mb-4">"{t.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xl">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{t.author}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Basit Fiyatlandırma 💰</h2>
            <p className="text-muted-foreground">
              Ücretsiz başla, ihtiyacın olduğunda yükselt
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`h-full ${plan.popular ? 'border-orange-500 shadow-lg shadow-orange-500/20' : ''}`}>
                  {plan.popular && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-medium text-center py-1">
                      🔥 En Popüler
                    </div>
                  )}
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-orange-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href={plan.href}>
                      <Button 
                        className={`w-full ${plan.popular ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700' : ''}`}
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30">
            <div className="text-5xl mb-4">🔥</div>
            <h2 className="text-3xl font-bold mb-4">
              Bahanelere son ver, bugün başla
            </h2>
            <p className="text-muted-foreground mb-6">
              1000+ kişi zaten Whippy ile hedeflerine ulaşıyor
            </p>
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/30">
                Ücretsiz Başla
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-sm">🔥</span>
              </div>
              <span className="font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Whippy</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Gizlilik
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Kullanım Koşulları
              </Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                İletişim
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Whippy - whippy.life
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

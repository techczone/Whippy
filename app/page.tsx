'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
  Menu,
  X,
  ChevronDown,
  Smartphone
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
  {
    icon: Zap,
    title: 'Hedef Yönetimi',
    description: 'Büyük hedeflerini küçük adımlara böl ve takip et.',
    color: 'from-yellow-500 to-amber-500',
  },
  {
    icon: Smartphone,
    title: 'Her Yerde Erişim',
    description: 'Mobil ve masaüstünde senkronize çalışan PWA uygulaması.',
    color: 'from-blue-500 to-cyan-500',
  },
]

const COACH_MODES = [
  {
    icon: Heart,
    name: 'Nazik Mod',
    description: 'Destekleyici, motive edici ve anlayışlı geri bildirimler. Küçük adımları kutlar.',
    color: 'bg-green-500/20 text-green-500 border-green-500/30',
    emoji: '💚',
    example: '"Bugün 3 alışkanlık tamamladın, harika gidiyorsun! 🌟"',
  },
  {
    icon: Flame,
    name: 'Acımasız Mod',
    description: 'Direkt, sert ve bahane kabul etmeyen yaklaşım. Sonuç odaklı.',
    color: 'bg-red-500/20 text-red-500 border-red-500/30',
    emoji: '🔥',
    example: '"Geçen hafta da aynı bahaneyi söyledin. Eyleme geç!"',
  },
  {
    icon: Eye,
    name: '6 Ay Tahmini',
    description: 'Mevcut verilerle geleceğe dönük senaryo analizi ve tahminler.',
    color: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
    emoji: '🔮',
    example: '"Bu tempoyla 6 ay sonra hedefinin %80\'ine ulaşırsın."',
  },
]

const PRICING = [
  {
    name: 'Ücretsiz',
    price: '₺0',
    period: '/ay',
    description: 'Başlamak için ideal',
    features: [
      'Sınırsız alışkanlık takibi',
      'Sınırsız hedef belirleme',
      'AI koç (Groq destekli)',
      'Tüm koç modları',
      'Sağlık takibi',
      'Raporlar & Takvim',
    ],
    cta: 'Ücretsiz Başla',
    href: '/signup',
    popular: true,
  },
  {
    name: 'Pro',
    price: '₺99',
    period: '/ay',
    description: 'Gelişmiş özellikler',
    features: [
      'Ücretsiz\'deki her şey',
      'Öncelikli AI yanıtları',
      'Email bildirimleri',
      'Veri dışa aktarma',
      'Öncelikli destek',
      'Yakında: Takım özellikleri',
    ],
    cta: 'Yakında',
    href: '#',
    popular: false,
    disabled: true,
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

const STATS = [
  { value: '1,000+', label: 'Aktif Kullanıcı' },
  { value: '50,000+', label: 'Tamamlanan Alışkanlık' },
  { value: '98%', label: 'Memnuniyet' },
  { value: '24/7', label: 'AI Koç' },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/95 backdrop-blur-lg border-b border-border shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Whippy" width={36} height={36} className="rounded-xl" />ow-orange-500/30">
              <span className="text-lg">🔥</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Whippy</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Özellikler
            </Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Nasıl Çalışır
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

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background border-b border-border"
            >
              <nav className="flex flex-col p-4 gap-4">
                <Link href="#features" className="text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
                  Özellikler
                </Link>
                <Link href="#how-it-works" className="text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
                  Nasıl Çalışır
                </Link>
                <Link href="#pricing" className="text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
                  Fiyatlar
                </Link>
                <Link href="/login" className="text-foreground py-2" onClick={() => setMobileMenuOpen(false)}>
                  Giriş
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600">
                    Ücretsiz Başla
                  </Button>
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero */}
      <section className="pt-28 md:pt-32 pb-16 md:pb-20 px-4">
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
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
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
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 border-orange-500/30 hover:bg-orange-500/10">
                  Nasıl Çalışır?
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              ✓ Kredi kartı gerekmez &nbsp; ✓ 30 saniyede kayıt &nbsp; ✓ Tamamen ücretsiz
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto"
          >
            {STATS.map((stat, i) => (
              <div key={i} className="p-4 rounded-xl bg-secondary/50 border border-border">
                <p className="text-2xl md:text-3xl font-bold text-orange-500">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-gradient-to-b from-transparent to-secondary/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Neden Whippy? 🚀</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hedeflerine ulaşmak için ihtiyacın olan tüm araçlar tek bir uygulamada
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* How It Works - Coach Modes */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">3 Farklı Koçluk Modu</h2>
            <p className="text-muted-foreground">
              İhtiyacına göre koçunu özelleştir - Nazik mi, Acımasız mı?
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
                <h3 className="font-semibold text-lg mb-2">{mode.name}</h3>
                <p className="text-sm opacity-80 mb-4">{mode.description}</p>
                <p className="text-xs italic opacity-60">{mode.example}</p>
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
                    <p className="text-sm mb-4 italic">"{t.quote}"</p>
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
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Basit Fiyatlandırma 💰</h2>
            <p className="text-muted-foreground">
              Şimdilik tamamen ücretsiz! Tüm özellikler açık.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`h-full ${plan.popular ? 'border-orange-500 shadow-lg shadow-orange-500/20' : 'opacity-60'}`}>
                  {plan.popular && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-medium text-center py-1">
                      🔥 Şu An Aktif
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
                        disabled={plan.disabled}
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
              Binlerce kişi zaten Whippy ile hedeflerine ulaşıyor. Sen de aramıza katıl!
            </p>
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/30">
                Ücretsiz Başla
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              30 saniyede kayıt ol, hemen kullanmaya başla
            </p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="Whippy" width={32} height={32} className="rounded-lg" />ow-orange-500/20">
                  <span className="text-sm">🔥</span>
                </div>
                <span className="font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Whippy</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Acımasız AI yaşam koçunuz. Alışkanlık takibi, hedef yönetimi ve daha fazlası.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ürün</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">Özellikler</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground">Fiyatlandırma</Link></li>
                <li><Link href="/login" className="hover:text-foreground">Giriş Yap</Link></li>
                <li><Link href="/signup" className="hover:text-foreground">Kayıt Ol</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Destek</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:destek@whippy.life" className="hover:text-foreground">İletişim</a></li>
                <li><Link href="/privacy" className="hover:text-foreground">Gizlilik Politikası</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Kullanım Koşulları</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sosyal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://twitter.com/whippylife" target="_blank" rel="noopener" className="hover:text-foreground">Twitter</a></li>
                <li><a href="https://instagram.com/whippylife" target="_blank" rel="noopener" className="hover:text-foreground">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Whippy. Tüm hakları saklıdır.
            </p>
            <p className="text-sm text-muted-foreground">
              Made with 🔥 in Istanbul
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

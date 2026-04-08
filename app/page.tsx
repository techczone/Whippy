'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  Flame,
  Heart,
  Brain,
  Zap,
  ChevronRight,
  Check,
  Star,
  ArrowRight,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
      {/* Navigation */}
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border' : 'bg-transparent'
      )}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Whippy
              </span>
              <span className="text-xs text-muted-foreground hidden sm:block">🔥 Bahane yok</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Özellikler</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Nasıl Çalışır</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Fiyatlandırma</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Giriş Yap</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <Link href="/signup">Ücretsiz Başla</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <a href="#features" className="block text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Özellikler</a>
              <a href="#how-it-works" className="block text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Nasıl Çalışır</a>
              <a href="#pricing" className="block text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Fiyatlandırma</a>
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/login">Giriş Yap</Link>
                </Button>
                <Button asChild className="flex-1 bg-gradient-to-r from-orange-500 to-red-500">
                  <Link href="/signup">Ücretsiz Başla</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium mb-6">
              <Flame className="w-4 h-4" />
              Türkiye'nin İlk Acımasız AI Yaşam Koçu
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-clip-text text-transparent">
                Bahane Yok,
              </span>
              <br />
              <span className="text-foreground">Sadece Sonuç</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Seni motive etmek için yalvarmayacak. Bahanelerini dinlemeyecek. 
              Sadece gerçekleri söyleyecek ve seni hedefe ulaştıracak.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-lg px-8 py-6">
                <Link href="/signup">
                  Ücretsiz Başla
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-lg px-8 py-6">
                <Link href="#how-it-works">
                  Nasıl Çalışır?
                </Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              ✓ Kredi kartı gerektirmez &nbsp; ✓ 14 gün ücretsiz Pro
            </p>
          </motion.div>

          {/* Hero Image/Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="relative mx-auto max-w-3xl rounded-2xl overflow-hidden border border-border shadow-2xl shadow-orange-500/10">
              <div className="bg-card p-4 border-b border-border flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-sm text-muted-foreground">whippy.life/dashboard</span>
              </div>
              <div className="bg-gradient-to-br from-card to-background p-8 min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔥</div>
                  <p className="text-xl font-semibold text-foreground">Dashboard Preview</p>
                  <p className="text-muted-foreground">Alışkanlıklar, hedefler, AI koç - hepsi bir arada</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">3 Farklı Koçluk Modu</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Her ruh haline uygun bir koç. Sen seç, o konuşsun.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Gentle Mode */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-8 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20"
            >
              <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">🌱 Nazik Mod</h3>
              <p className="text-muted-foreground mb-4">
                Destekleyici, anlayışlı ve motive edici. Zor günlerinde yanında, 
                küçük başarılarını kutluyor.
              </p>
              <div className="p-4 rounded-xl bg-background/50 border border-border">
                <p className="text-sm italic text-muted-foreground">
                  "Bugün 2 alışkanlık tamamladın, bu harika bir başlangıç! 
                  Her adım seni hedefe yaklaştırıyor. 💪"
                </p>
              </div>
            </motion.div>

            {/* Brutal Mode */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative p-8 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20"
            >
              <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold">
                POPÜLER
              </div>
              <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center mb-6">
                <Flame className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">🔥 Acımasız Mod</h3>
              <p className="text-muted-foreground mb-4">
                Bahaneleri kabul etmez. Gerçekleri yüzüne vurur. 
                Seni konfor alanından çıkarır.
              </p>
              <div className="p-4 rounded-xl bg-background/50 border border-border">
                <p className="text-sm italic text-muted-foreground">
                  "0 dakika egzersiz mi? Bu tembellik. Koltuktan kalk ve 
                  hareket et. Bahane istemiyorum."
                </p>
              </div>
            </motion.div>

            {/* Predict Mode */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-500/20"
            >
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3">🔮 6 Ay Tahmini</h3>
              <p className="text-muted-foreground mb-4">
                Mevcut tempona göre 6 ay sonra nerede olacağını tahmin eder. 
                3 senaryo: İyimser, Gerçekçi, Kötümser.
              </p>
              <div className="p-4 rounded-xl bg-background/50 border border-border">
                <p className="text-sm italic text-muted-foreground">
                  "Bu tempoyla 6 ayda hedefe ulaşma şansın %65. 
                  Egzersizi artırırsan %85'e çıkar."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nasıl Çalışır?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              3 adımda hayatını değiştirmeye başla
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Target,
                title: 'Hedeflerini Belirle',
                description: 'Alışkanlıklarını, hedeflerini ve projelerini ekle. Whippy seni tanısın.'
              },
              {
                step: '02',
                icon: Zap,
                title: 'Günlük Takip Et',
                description: 'Her gün alışkanlıklarını işaretle, sağlık metriklerini gir, ruh halini kaydet.'
              },
              {
                step: '03',
                icon: Sparkles,
                title: 'AI Koçunla Konuş',
                description: 'Verilerine göre kişiselleştirilmiş tavsiyeler al. Motive ol veya gerçeklerle yüzleş.'
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center"
              >
                <div className="text-7xl font-bold text-muted-foreground/10 absolute -top-4 left-1/2 -translate-x-1/2">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <item.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Basit Fiyatlandırma</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              İhtiyacına göre seç. İstediğin zaman yükselt veya iptal et.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-background border border-border"
            >
              <h3 className="text-lg font-semibold mb-2">Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">₺0</span>
                <span className="text-muted-foreground">/ay</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '5 alışkanlık takibi',
                  '2 hedef',
                  'Günlük ruh hali kaydı',
                  'Temel sağlık metrikleri',
                  'Nazik mod AI koç',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/signup">Ücretsiz Başla</Link>
              </Button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative p-8 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/5 border-2 border-orange-500/50"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold">
                EN POPÜLER
              </div>
              <h3 className="text-lg font-semibold mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">₺99</span>
                <span className="text-muted-foreground">/ay</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Sınırsız alışkanlık',
                  'Sınırsız hedef',
                  'Tüm koç modları (3 mod)',
                  'Detaylı analitik & raporlar',
                  'Haftalık özet e-posta',
                  'Öncelikli destek',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-orange-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" asChild>
                <Link href="/signup?plan=pro">Pro'ya Başla</Link>
              </Button>
            </motion.div>

            {/* Elite Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-2xl bg-background border border-border"
            >
              <h3 className="text-lg font-semibold mb-2">Elite</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">₺199</span>
                <span className="text-muted-foreground">/ay</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Pro\'daki her şey',
                  'Kişisel koç asistanı',
                  'Özel hedef planlaması',
                  'Video içerikler',
                  '1-1 destek önceliği',
                  'API erişimi',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-purple-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/signup?plan=elite">Elite'e Başla</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Kullanıcılar Ne Diyor?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Ahmet Y.',
                role: 'Yazılım Geliştirici',
                avatar: '👨‍💻',
                quote: 'Acımasız mod beni gerçekten motive etti. Artık bahaneler üretmiyorum, sadece yapıyorum.',
                rating: 5
              },
              {
                name: 'Elif K.',
                role: 'Fitness Eğitmeni',
                avatar: '💪',
                quote: '6 ay tahmini özelliği müthiş. Müşterilerime de öneriyorum. Gerçekçi hedefler koymayı öğretti.',
                rating: 5
              },
              {
                name: 'Can M.',
                role: 'Girişimci',
                avatar: '🚀',
                quote: 'Her sabah Whippy ile başlıyorum. Alışkanlık takibi + AI koç kombinasyonu harika.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/30"
          >
            <div className="text-5xl mb-6">🔥</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bahanelere Son Ver
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Bugün başla, 6 ay sonra farklı bir insan ol.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-lg px-8 py-6">
              <Link href="/signup">
                Ücretsiz Başla
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Whippy
              </span>
              <span className="text-sm text-muted-foreground">© 2026</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Gizlilik</a>
              <a href="#" className="hover:text-foreground transition-colors">Kullanım Şartları</a>
              <a href="#" className="hover:text-foreground transition-colors">İletişim</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

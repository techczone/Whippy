'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, Target, TrendingUp, Heart, Flame, Eye, Check, ArrowRight, Star, Zap, 
  Menu, X, Smartphone, Instagram
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type Lang = 'tr' | 'en'

const CONTENT = {
  tr: {
    nav: { features: 'Özellikler', howItWorks: 'Nasıl Çalışır', pricing: 'Fiyatlar', login: 'Giriş', start: 'Ücretsiz Başla' },
    hero: {
      badge: '🔥 AI destekli alışkanlık koçu',
      title: 'Hayatını Değiştir,',
      titleHighlight: 'Bahanelere Son Ver',
      subtitle: 'Whippy ile alışkanlık takibi, kişiselleştirilmiş AI koçluk ve gerçek zamanlı ilerleme analizi. Acımasız veya nazik - sen seç.',
      cta: 'Ücretsiz Başla',
      ctaSub: 'Kredi kartı gerektirmez',
    },
    stats: [
      { value: '1,000+', label: 'Aktif Kullanıcı' },
      { value: '50,000+', label: 'Tamamlanan Alışkanlık' },
      { value: '98%', label: 'Memnuniyet' },
      { value: '24/7', label: 'AI Koç' },
    ],
    features: {
      title: 'Neden Whippy? 🚀',
      subtitle: 'Alışkanlık takibinden fazlası. Gerçek bir yaşam dönüşümü.',
      items: [
        { icon: Target, title: 'Alışkanlık Takibi', description: 'Günlük alışkanlıklarını oluştur, takip et ve seri rekorlarını kır.', color: 'from-orange-500 to-red-500' },
        { icon: Brain, title: 'AI Yaşam Koçu', description: 'Acımasız veya nazik - kişiselleştirilmiş gerçek zamanlı analiz.', color: 'from-purple-500 to-pink-500' },
        { icon: TrendingUp, title: 'İlerleme Analizi', description: 'Detaylı grafikler ve haftalık raporlarla gelişimini gör.', color: 'from-amber-500 to-orange-500' },
        { icon: Heart, title: 'Sağlık Metrikleri', description: 'Uyku, egzersiz, su tüketimi ve ruh halini kaydet.', color: 'from-pink-500 to-rose-500' },
        { icon: Zap, title: 'Hedef Yönetimi', description: 'Büyük hedeflerini küçük adımlara böl ve takip et.', color: 'from-yellow-500 to-amber-500' },
        { icon: Smartphone, title: 'Her Yerde Erişim', description: 'Mobil ve masaüstünde senkronize çalışan PWA uygulaması.', color: 'from-blue-500 to-cyan-500' },
      ],
    },
    coachModes: {
      title: 'AI Koçunu Seç 🤖',
      subtitle: 'Her mod farklı bir yaklaşım. Ruh haline göre değiştir.',
      modes: [
        { name: 'Nazik Mod', description: 'Destekleyici, motive edici ve anlayışlı geri bildirimler.', emoji: '💚', example: '"Bugün 3 alışkanlık tamamladın, harika gidiyorsun! 🌟"', color: 'bg-green-500/20 text-green-500 border-green-500/30' },
        { name: 'Acımasız Mod', description: 'Direkt, sert ve bahane kabul etmeyen yaklaşım.', emoji: '🔥', example: '"Geçen hafta da aynı bahaneyi söyledin. Eyleme geç!"', color: 'bg-red-500/20 text-red-500 border-red-500/30' },
        { name: '6 Ay Tahmini', description: 'Mevcut verilerle geleceğe dönük senaryo analizi.', emoji: '🔮', example: '"Bu tempoyla 6 ay sonra hedefinin %80\'ine ulaşırsın."', color: 'bg-purple-500/20 text-purple-500 border-purple-500/30' },
      ],
    },
    testimonials: {
      title: 'Kullanıcılar Ne Diyor? 🗣️',
      items: [
        { quote: 'Acımasız mod sayesinde 3 ayda 15 kilo verdim. Bahanelere artık yer yok!', author: 'Mehmet K.', role: 'Yazılım Mühendisi', avatar: '👨‍💻' },
        { quote: '6 ay tahmini özelliği gözlerimi açtı. Şimdi her gün daha bilinçli yaşıyorum.', author: 'Ayşe T.', role: 'Girişimci', avatar: '👩‍💼' },
        { quote: 'Alışkanlık takibi ile 100 günlük seri yaptım. Bu uygulama hayatımı değiştirdi.', author: 'Can B.', role: 'Öğrenci', avatar: '👨‍🎓' },
      ],
    },
    pricing: {
      title: 'Basit Fiyatlandırma 💰',
      subtitle: 'Şimdilik tamamen ücretsiz! Tüm özellikler açık.',
      free: { name: 'Ücretsiz', price: '₺0', period: '/ay', description: 'Başlamak için ideal', cta: 'Ücretsiz Başla', features: ['Sınırsız alışkanlık takibi', 'Sınırsız hedef belirleme', 'AI koç (Groq destekli)', 'Tüm koç modları', 'Sağlık takibi', 'Raporlar & Takvim'] },
      pro: { name: 'Pro', price: '₺99', period: '/ay', description: 'Gelişmiş özellikler', cta: 'Yakında', features: ['Ücretsiz\'deki her şey', 'Öncelikli AI yanıtları', 'Email bildirimleri', 'Veri dışa aktarma', 'Öncelikli destek', 'Yakında: Takım özellikleri'] },
    },
    cta: { title: 'Bahanelere son ver, bugün başla', subtitle: 'Binlerce kişi zaten Whippy ile hedeflerine ulaşıyor.', button: 'Ücretsiz Başla', note: '30 saniyede kayıt ol, hemen kullanmaya başla' },
    footer: {
      tagline: 'Acımasız AI yaşam koçunuz. Alışkanlık takibi, hedef yönetimi ve daha fazlası.',
      product: 'Ürün', features: 'Özellikler', pricingLink: 'Fiyatlandırma', loginLink: 'Giriş Yap', signupLink: 'Kayıt Ol',
      support: 'Destek', contact: 'İletişim', privacy: 'Gizlilik Politikası', terms: 'Kullanım Koşulları',
      social: 'Sosyal', rights: '© 2025 Whippy. Tüm hakları saklıdır.', madeIn: 'Made with 🔥 in Istanbul',
    },
  },
  en: {
    nav: { features: 'Features', howItWorks: 'How It Works', pricing: 'Pricing', login: 'Login', start: 'Get Started Free' },
    hero: {
      badge: '🔥 AI-powered habit coach',
      title: 'Transform Your Life,',
      titleHighlight: 'No More Excuses',
      subtitle: 'Track habits, get personalized AI coaching and real-time progress analysis with Whippy. Brutal or gentle - you choose.',
      cta: 'Get Started Free',
      ctaSub: 'No credit card required',
    },
    stats: [
      { value: '1,000+', label: 'Active Users' },
      { value: '50,000+', label: 'Habits Completed' },
      { value: '98%', label: 'Satisfaction' },
      { value: '24/7', label: 'AI Coach' },
    ],
    features: {
      title: 'Why Whippy? 🚀',
      subtitle: 'More than habit tracking. A real life transformation.',
      items: [
        { icon: Target, title: 'Habit Tracking', description: 'Create daily habits, track them and break streak records.', color: 'from-orange-500 to-red-500' },
        { icon: Brain, title: 'AI Life Coach', description: 'Brutal or gentle - personalized real-time analysis.', color: 'from-purple-500 to-pink-500' },
        { icon: TrendingUp, title: 'Progress Analysis', description: 'See your growth with detailed charts and weekly reports.', color: 'from-amber-500 to-orange-500' },
        { icon: Heart, title: 'Health Metrics', description: 'Track sleep, exercise, water intake and mood.', color: 'from-pink-500 to-rose-500' },
        { icon: Zap, title: 'Goal Management', description: 'Break big goals into small steps and track them.', color: 'from-yellow-500 to-amber-500' },
        { icon: Smartphone, title: 'Access Anywhere', description: 'PWA app synced across mobile and desktop.', color: 'from-blue-500 to-cyan-500' },
      ],
    },
    coachModes: {
      title: 'Choose Your AI Coach 🤖',
      subtitle: 'Each mode has a different approach. Switch based on your mood.',
      modes: [
        { name: 'Gentle Mode', description: 'Supportive, motivating and understanding feedback.', emoji: '💚', example: '"You completed 3 habits today, great job! 🌟"', color: 'bg-green-500/20 text-green-500 border-green-500/30' },
        { name: 'Brutal Mode', description: 'Direct, harsh and no-excuses approach.', emoji: '🔥', example: '"You said the same thing last week. Take action!"', color: 'bg-red-500/20 text-red-500 border-red-500/30' },
        { name: '6 Month Prediction', description: 'Future scenario analysis based on current data.', emoji: '🔮', example: '"At this pace, you\'ll reach 80% of your goal in 6 months."', color: 'bg-purple-500/20 text-purple-500 border-purple-500/30' },
      ],
    },
    testimonials: {
      title: 'What Users Say 🗣️',
      items: [
        { quote: 'Lost 15kg in 3 months thanks to brutal mode. No more excuses!', author: 'John K.', role: 'Software Engineer', avatar: '👨‍💻' },
        { quote: '6 month prediction feature opened my eyes. I live more consciously now.', author: 'Sarah T.', role: 'Entrepreneur', avatar: '👩‍💼' },
        { quote: 'Made a 100-day streak with habit tracking. This app changed my life.', author: 'Mike B.', role: 'Student', avatar: '👨‍🎓' },
      ],
    },
    pricing: {
      title: 'Simple Pricing 💰',
      subtitle: 'Currently completely free! All features unlocked.',
      free: { name: 'Free', price: '$0', period: '/mo', description: 'Perfect to start', cta: 'Get Started Free', features: ['Unlimited habit tracking', 'Unlimited goals', 'AI coach (Groq powered)', 'All coach modes', 'Health tracking', 'Reports & Calendar'] },
      pro: { name: 'Pro', price: '$9', period: '/mo', description: 'Advanced features', cta: 'Coming Soon', features: ['Everything in Free', 'Priority AI responses', 'Email notifications', 'Data export', 'Priority support', 'Coming: Team features'] },
    },
    cta: { title: 'Stop making excuses, start today', subtitle: 'Thousands are already reaching their goals with Whippy.', button: 'Get Started Free', note: 'Sign up in 30 seconds, start using immediately' },
    footer: {
      tagline: 'Your brutal AI life coach. Habit tracking, goal management and more.',
      product: 'Product', features: 'Features', pricingLink: 'Pricing', loginLink: 'Login', signupLink: 'Sign Up',
      support: 'Support', contact: 'Contact', privacy: 'Privacy Policy', terms: 'Terms of Service',
      social: 'Social', rights: '© 2025 Whippy. All rights reserved.', madeIn: 'Made with 🔥 in Istanbul',
    },
  },
}

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>('tr')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const t = CONTENT[lang]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const browserLang = navigator.language.toLowerCase()
    if (!browserLang.startsWith('tr')) setLang('en')
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/95 backdrop-blur-lg border-b border-border shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Whippy" width={36} height={36} className="rounded-xl" />
            <span className="font-bold text-xl bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Whippy</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.features}</Link>
            <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.howItWorks}</Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.pricing}</Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t.nav.login}</Link>
            <div className="flex items-center gap-1 border rounded-full px-2 py-1">
              <button onClick={() => setLang('tr')} className={`text-xs px-2 py-1 rounded-full transition-colors ${lang === 'tr' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>TR</button>
              <button onClick={() => setLang('en')} className={`text-xs px-2 py-1 rounded-full transition-colors ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>EN</button>
            </div>
            <Link href="/signup"><Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">{t.nav.start}</Button></Link>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <div className="flex items-center gap-1 border rounded-full px-2 py-1">
              <button onClick={() => setLang('tr')} className={`text-xs px-2 py-0.5 rounded-full ${lang === 'tr' ? 'bg-primary text-primary-foreground' : ''}`}>TR</button>
              <button onClick={() => setLang('en')} className={`text-xs px-2 py-0.5 rounded-full ${lang === 'en' ? 'bg-primary text-primary-foreground' : ''}`}>EN</button>
            </div>
            <button className="p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-background border-b border-border">
              <nav className="flex flex-col p-4 gap-4">
                <Link href="#features" className="text-sm" onClick={() => setMobileMenuOpen(false)}>{t.nav.features}</Link>
                <Link href="#how-it-works" className="text-sm" onClick={() => setMobileMenuOpen(false)}>{t.nav.howItWorks}</Link>
                <Link href="#pricing" className="text-sm" onClick={() => setMobileMenuOpen(false)}>{t.nav.pricing}</Link>
                <Link href="/login" className="text-sm" onClick={() => setMobileMenuOpen(false)}>{t.nav.login}</Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}><Button className="w-full bg-gradient-to-r from-orange-500 to-red-600">{t.nav.start}</Button></Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-500 px-4 py-2 rounded-full text-sm font-medium mb-6">{t.hero.badge}</motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-bold mb-6">{t.hero.title}<br /><span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">{t.hero.titleHighlight}</span></motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">{t.hero.subtitle}</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/signup"><Button size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/30">{t.hero.cta}<ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-sm text-muted-foreground">{t.hero.ctaSub}</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8 border-t border-border">
            {t.stats.map((stat, i) => (<div key={i} className="text-center"><div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">{stat.value}</div><div className="text-sm text-muted-foreground">{stat.label}</div></div>))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-gradient-to-b from-transparent to-orange-500/5">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12"><h2 className="text-3xl font-bold mb-4">{t.features.title}</h2><p className="text-muted-foreground">{t.features.subtitle}</p></motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.features.items.map((feature, i) => { const Icon = feature.icon; return (<motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}><Card className="h-full hover:border-orange-500/30 transition-colors group"><CardContent className="pt-6"><div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><Icon className="w-6 h-6 text-white" /></div><h3 className="font-semibold text-lg mb-2">{feature.title}</h3><p className="text-sm text-muted-foreground">{feature.description}</p></CardContent></Card></motion.div>) })}
          </div>
        </div>
      </section>

      {/* AI Coach Modes */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12"><h2 className="text-3xl font-bold mb-4">{t.coachModes.title}</h2><p className="text-muted-foreground">{t.coachModes.subtitle}</p></motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {t.coachModes.modes.map((mode, i) => (<motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`p-6 rounded-2xl border ${mode.color} hover:scale-105 transition-transform cursor-pointer`}><div className="text-4xl mb-4">{mode.emoji}</div><h3 className="font-semibold text-lg mb-2">{mode.name}</h3><p className="text-sm opacity-80 mb-4">{mode.description}</p><p className="text-xs italic opacity-60">{mode.example}</p></motion.div>))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-orange-500/5">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12"><h2 className="text-3xl font-bold mb-4">{t.testimonials.title}</h2></motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {t.testimonials.items.map((item, i) => (<motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}><Card className="h-full hover:border-orange-500/30 transition-colors"><CardContent className="pt-6"><div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-orange-500 text-orange-500" />)}</div><p className="text-sm mb-4 italic">&quot;{item.quote}&quot;</p><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xl">{item.avatar}</div><div><p className="font-medium text-sm">{item.author}</p><p className="text-xs text-muted-foreground">{item.role}</p></div></div></CardContent></Card></motion.div>))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12"><h2 className="text-3xl font-bold mb-4">{t.pricing.title}</h2><p className="text-muted-foreground">{t.pricing.subtitle}</p></motion.div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><Card className="h-full border-orange-500 shadow-lg shadow-orange-500/20"><div className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-medium text-center py-1">🔥 {lang === 'tr' ? 'Şu An Aktif' : 'Currently Active'}</div><CardContent className="pt-6"><h3 className="font-semibold text-lg">{t.pricing.free.name}</h3><p className="text-sm text-muted-foreground mb-4">{t.pricing.free.description}</p><div className="mb-6"><span className="text-4xl font-bold">{t.pricing.free.price}</span><span className="text-muted-foreground">{t.pricing.free.period}</span></div><ul className="space-y-3 mb-6">{t.pricing.free.features.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-orange-500 shrink-0" />{f}</li>)}</ul><Link href="/signup"><Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">{t.pricing.free.cta}</Button></Link></CardContent></Card></motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}><Card className="h-full opacity-60"><CardContent className="pt-6"><h3 className="font-semibold text-lg">{t.pricing.pro.name}</h3><p className="text-sm text-muted-foreground mb-4">{t.pricing.pro.description}</p><div className="mb-6"><span className="text-4xl font-bold">{t.pricing.pro.price}</span><span className="text-muted-foreground">{t.pricing.pro.period}</span></div><ul className="space-y-3 mb-6">{t.pricing.pro.features.map((f, i) => <li key={i} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-orange-500 shrink-0" />{f}</li>)}</ul><Button className="w-full" variant="outline" disabled>{t.pricing.pro.cta}</Button></CardContent></Card></motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500/30">
            <Image src="/logo.png" alt="Whippy" width={64} height={64} className="mx-auto mb-4 rounded-xl" />
            <h2 className="text-3xl font-bold mb-4">{t.cta.title}</h2>
            <p className="text-muted-foreground mb-6">{t.cta.subtitle}</p>
            <Link href="/signup"><Button size="lg" className="h-12 px-8 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg shadow-orange-500/30">{t.cta.button}<ArrowRight className="w-4 h-4 ml-2" /></Button></Link>
            <p className="text-sm text-muted-foreground mt-4">{t.cta.note}</p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4"><Image src="/logo.png" alt="Whippy" width={32} height={32} className="rounded-lg" /><span className="font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Whippy</span></div>
              <p className="text-sm text-muted-foreground">{t.footer.tagline}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t.footer.product}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">{t.footer.features}</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground">{t.footer.pricingLink}</Link></li>
                <li><Link href="/login" className="hover:text-foreground">{t.footer.loginLink}</Link></li>
                <li><Link href="/signup" className="hover:text-foreground">{t.footer.signupLink}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t.footer.support}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:destek@whippy.life" className="hover:text-foreground">{t.footer.contact}</a></li>
                <li><Link href="/privacy" className="hover:text-foreground">{t.footer.privacy}</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">{t.footer.terms}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t.footer.social}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://instagram.com/whippy.app" target="_blank" rel="noopener noreferrer" className="hover:text-foreground flex items-center gap-2"><Instagram className="w-4 h-4" /> Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">{t.footer.rights}</p>
            <p className="text-sm text-muted-foreground">{t.footer.madeIn}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

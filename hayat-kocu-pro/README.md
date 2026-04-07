# 🚀 Hayat Koçu Pro

**AI Destekli Yaşam Koçu Dashboard** - Alışkanlıklarını takip et, hedeflerine ulaş ve acımasızca dürüst AI koçunla her gün daha iyi ol!

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?style=flat-square&logo=supabase)

## ✨ Özellikler

### 🎯 Alışkanlık Takibi
- Günlük, haftalık ve özel alışkanlıklar
- Seri takibi ve rekorlar
- Confetti animasyonları ile kutlama

### 🤖 AI Yaşam Koçu (3 Mod)
- **🌱 Nazik Mod**: Destekleyici ve motive edici
- **🔥 Acımasız Mod**: Direkt, sert ve bahane kabul etmeyen
- **🔮 6 Ay Tahmini**: Mevcut verilerle gelecek senaryoları

### 📊 Kapsamlı Analytics
- Haftalık ilerleme grafikleri
- Sağlık skorları (uyku, egzersiz, su)
- Ruh hali takibi
- Verimlilik analizi

### 💼 Proje Yönetimi
- Hedef belirleme ve takip
- Proje ilerleme görselleştirmesi
- Milestone yönetimi

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **State**: Zustand
- **Backend**: Supabase (Auth, Database, RLS)
- **AI**: Anthropic Claude API
- **Charts**: Recharts
- **UI**: Radix UI primitives

## 🚀 Kurulum

### 1. Projeyi İndir
```bash
unzip hayat-kocu-pro.zip
cd hayat-kocu-pro
```

### 2. Bağımlılıkları Yükle
```bash
npm install
```

### 3. Environment Variables
`.env.example` dosyasını `.env.local` olarak kopyala ve değerleri doldur:

```bash
cp .env.example .env.local
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic (AI Koç için)
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 4. Supabase Kurulumu
1. [Supabase](https://supabase.com) üzerinde yeni proje oluştur
2. SQL Editor'da `supabase/migrations/001_initial_schema.sql` dosyasını çalıştır
3. Authentication > Providers'dan Google/Apple OAuth'u aktif et

### 5. Çalıştır
```bash
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini aç.

## 📁 Proje Yapısı

```
hayat-kocu-pro/
├── app/
│   ├── (auth)/           # Auth sayfaları (login, signup)
│   ├── (dashboard)/      # Dashboard sayfaları
│   ├── api/              # API routes
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # Temel UI bileşenleri
│   ├── dashboard/        # Dashboard bileşenleri
│   ├── habits/           # Alışkanlık bileşenleri
│   ├── coach/            # AI Koç bileşenleri
│   └── ...
├── lib/
│   ├── store.ts          # Zustand store
│   ├── utils.ts          # Yardımcı fonksiyonlar
│   └── supabase/         # Supabase clients
├── hooks/
│   └── use-auth.ts       # Auth hook
├── types/
│   ├── index.ts          # App types
│   └── database.ts       # Supabase types
└── supabase/
    └── migrations/       # SQL migrations
```

## 💰 Fiyatlandırma Modeli

| Plan | Fiyat | Özellikler |
|------|-------|------------|
| **Ücretsiz** | ₺0/ay | 3 alışkanlık, 2 hedef, 5 AI mesaj/gün, Nazik mod |
| **Pro** | ₺99/ay | 20 alışkanlık, 10 hedef, Sınırsız AI, Tüm modlar |
| **Elite** | ₺199/ay | Sınırsız, API erişimi, Öncelikli destek |

## 🎨 Tasarım Sistemi

- **Primary**: Purple (#8B5CF6)
- **Accent**: Teal (#14B8A6)
- **Brutal Red**: #FF3B30
- **Dark Mode**: Varsayılan tema

## 📱 Mobil Uyumluluk

- Responsive tasarım
- Bottom navigation (mobil)
- Touch-friendly interactions
- PWA hazır yapı

## 🔒 Güvenlik

- Row Level Security (RLS) ile veri izolasyonu
- OAuth 2.0 authentication
- HTTPS zorunlu
- API key'ler server-side

## 🚧 Gelecek Özellikler

- [ ] Apple Watch entegrasyonu
- [ ] Push notifications
- [ ] Team/workspace özellikleri
- [ ] Stripe ödeme entegrasyonu
- [ ] Export/import özellikleri

## 📄 Lisans

MIT License

---

**Hayat Koçu Pro** ile her gün bir adım daha ileriye! 🚀

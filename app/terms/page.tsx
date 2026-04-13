'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Lang = 'tr' | 'en'

export default function TermsPage() {
  const [lang, setLang] = useState<Lang>('tr')

  useEffect(() => {
    const browserLang = navigator.language.toLowerCase()
    if (!browserLang.startsWith('tr')) setLang('en')
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Whippy" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-lg bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Whippy</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border rounded-full px-2 py-1">
              <button onClick={() => setLang('tr')} className={`text-xs px-2 py-1 rounded-full transition-colors ${lang === 'tr' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>TR</button>
              <button onClick={() => setLang('en')} className={`text-xs px-2 py-1 rounded-full transition-colors ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>EN</button>
            </div>
            <Link href="/"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />{lang === 'tr' ? 'Ana Sayfa' : 'Home'}</Button></Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {lang === 'tr' ? <TermsTR /> : <TermsEN />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 Whippy. {lang === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">{lang === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function TermsTR() {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>Kullanım Koşulları</h1>
      <p className="text-muted-foreground">Son güncelleme: 13 Nisan 2025</p>

      <h2>1. Sözleşmenin Tarafları ve Konusu</h2>
      <p>
        İşbu Kullanım Koşulları ("Sözleşme"), Whippy platformu ("Platform") ile Platform'u kullanan 
        gerçek veya tüzel kişi ("Kullanıcı") arasında, Platform'un kullanım şartlarını düzenlemek 
        amacıyla akdedilmiştir.
      </p>
      <p>
        Platform'a kayıt olarak veya Platform'u kullanarak bu Sözleşme'nin tüm hükümlerini 
        okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş olursunuz.
      </p>

      <h2>2. Tanımlar</h2>
      <ul>
        <li><strong>Platform:</strong> whippy.life alan adı üzerinden sunulan web ve mobil uygulama</li>
        <li><strong>Hizmet:</strong> Platform üzerinden sunulan alışkanlık takibi, hedef yönetimi, sağlık takibi ve AI koçluk hizmetleri</li>
        <li><strong>Kullanıcı:</strong> Platform'a kayıt olan ve/veya Platform'u kullanan gerçek veya tüzel kişi</li>
        <li><strong>İçerik:</strong> Platform'da yer alan metin, görsel, video, yazılım ve diğer tüm materyaller</li>
      </ul>

      <h2>3. Hizmetin Kapsamı</h2>
      <p>Platform, Kullanıcılara aşağıdaki hizmetleri sunmaktadır:</p>
      <ul>
        <li>Alışkanlık oluşturma ve takip etme</li>
        <li>Hedef belirleme ve ilerleme takibi</li>
        <li>Sağlık metriklerini kaydetme (uyku, egzersiz, su tüketimi)</li>
        <li>Ruh hali takibi</li>
        <li>Yapay zeka destekli kişisel koçluk hizmeti</li>
        <li>İlerleme raporları ve analizler</li>
        <li>Bildirim ve hatırlatıcılar</li>
      </ul>

      <h2>4. Üyelik ve Hesap Güvenliği</h2>
      <h3>4.1. Üyelik Koşulları</h3>
      <ul>
        <li>Platform'u kullanabilmek için 13 yaşından büyük olmanız gerekmektedir.</li>
        <li>18 yaşından küçük kullanıcılar, veli veya vasilerinin onayı ile Platform'u kullanabilir.</li>
        <li>Kayıt sırasında doğru ve güncel bilgi vermekle yükümlüsünüz.</li>
      </ul>
      <h3>4.2. Hesap Güvenliği</h3>
      <ul>
        <li>Hesabınızın güvenliğinden siz sorumlusunuz.</li>
        <li>Hesabınıza yetkisiz erişim olduğunu fark ederseniz derhal bizi bilgilendirmelisiniz.</li>
        <li>Hesabınız üzerinden gerçekleştirilen tüm işlemlerden siz sorumlusunuz.</li>
      </ul>

      <h2>5. Kullanıcı Yükümlülükleri</h2>
      <p>Kullanıcı olarak aşağıdaki kurallara uymayı kabul edersiniz:</p>
      <ul>
        <li>Platform'u yalnızca yasal amaçlarla kullanmak</li>
        <li>Başkalarının haklarını ihlal etmemek</li>
        <li>Yanıltıcı, yanlış veya aldatıcı bilgi paylaşmamak</li>
        <li>Zararlı yazılım veya kod yaymamak</li>
        <li>Platform'un güvenliğini tehlikeye atacak eylemlerden kaçınmak</li>
        <li>Diğer kullanıcıları rahatsız edici davranışlarda bulunmamak</li>
        <li>Platform'u tersine mühendislik yapmamak veya kaynak koduna erişmeye çalışmamak</li>
        <li>Otomatik veri toplama araçları (bot, scraper vb.) kullanmamak</li>
      </ul>

      <h2>6. Fikri Mülkiyet Hakları</h2>
      <h3>6.1. Platform'un Hakları</h3>
      <p>
        Platform'daki tüm içerik, tasarım, logo, yazılım ve diğer materyaller Whippy'nin 
        fikri mülkiyetidir ve 5846 sayılı Fikir ve Sanat Eserleri Kanunu ile korunmaktadır.
      </p>
      <h3>6.2. Kullanıcı İçeriği</h3>
      <p>
        Platform'a yüklediğiniz içerikler üzerindeki haklarınız size aittir. Ancak bu içerikleri 
        Platform'a yükleyerek, Platform'un bu içerikleri hizmet sunumu amacıyla işlemesine 
        izin vermiş olursunuz.
      </p>

      <h2>7. AI Koçluk Hizmeti</h2>
      <h3>7.1. Hizmetin Niteliği</h3>
      <p>
        AI koçluk hizmeti, yapay zeka teknolojisi kullanılarak sunulan motivasyon ve rehberlik 
        hizmetidir. Bu hizmet:
      </p>
      <ul>
        <li>Profesyonel psikolojik danışmanlık veya tedavi yerine geçmez</li>
        <li>Tıbbi tavsiye niteliği taşımaz</li>
        <li>Beslenme uzmanı veya diyetisyen önerisi değildir</li>
        <li>Yalnızca genel motivasyon ve bilgilendirme amaçlıdır</li>
      </ul>
      <h3>7.2. Sorumluluk Reddi</h3>
      <p>
        AI koçluk hizmetinden alınan önerilere dayanarak verdiğiniz kararlardan tamamen siz 
        sorumlusunuz. Sağlık sorunlarınız için mutlaka bir sağlık profesyoneline danışın.
      </p>

      <h2>8. Ücretlendirme</h2>
      <p>
        Platform şu anda ücretsiz olarak sunulmaktadır. İleride ücretli planlar sunulması 
        halinde, fiyatlandırma ve ödeme koşulları ayrıca duyurulacaktır.
      </p>

      <h2>9. Hizmetin Askıya Alınması ve Sonlandırılması</h2>
      <h3>9.1. Platform'un Hakları</h3>
      <p>Platform, aşağıdaki durumlarda hesabınızı askıya alabilir veya sonlandırabilir:</p>
      <ul>
        <li>Bu Sözleşme'nin ihlali</li>
        <li>Yasadışı faaliyetler</li>
        <li>Diğer kullanıcıları rahatsız eden davranışlar</li>
        <li>Platform'un güvenliğini tehdit eden eylemler</li>
      </ul>
      <h3>9.2. Kullanıcının Hakları</h3>
      <p>
        Hesabınızı istediğiniz zaman silebilirsiniz. Hesap silme işlemi geri alınamaz ve 
        verileriniz Gizlilik Politikası'nda belirtilen süre içinde silinir.
      </p>

      <h2>10. Sorumluluk Sınırlaması</h2>
      <p>
        Platform, aşağıdaki durumlardan kaynaklanan doğrudan veya dolaylı zararlardan 
        sorumlu tutulamaz:
      </p>
      <ul>
        <li>Hizmet kesintileri veya teknik aksaklıklar</li>
        <li>Veri kaybı</li>
        <li>Üçüncü taraf hizmetlerindeki sorunlar</li>
        <li>Kullanıcının Platform'u yanlış kullanması</li>
        <li>Mücbir sebep halleri</li>
      </ul>
      <p>
        Platform, hizmeti "olduğu gibi" sunmaktadır ve hizmetin kesintisiz veya hatasız 
        olacağını garanti etmez.
      </p>

      <h2>11. Uyuşmazlık Çözümü</h2>
      <p>
        Bu Sözleşme'den doğan uyuşmazlıklarda Türkiye Cumhuriyeti kanunları uygulanır. 
        Uyuşmazlıkların çözümünde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
      </p>
      <p>
        Tüketici sıfatıyla hareket eden Kullanıcılar, 6502 sayılı Tüketicinin Korunması 
        Hakkında Kanun kapsamındaki haklarını saklı tutar ve bulundukları yerdeki 
        Tüketici Hakem Heyetleri'ne başvurabilir.
      </p>

      <h2>12. Değişiklikler</h2>
      <p>
        Platform, bu Sözleşme'yi önceden haber vererek veya vermeksizin değiştirme hakkını 
        saklı tutar. Değişiklikler Platform'da yayınlandığı tarihte yürürlüğe girer. 
        Platform'u kullanmaya devam etmeniz, değişiklikleri kabul ettiğiniz anlamına gelir.
      </p>

      <h2>13. Bölünebilirlik</h2>
      <p>
        Bu Sözleşme'nin herhangi bir hükmünün geçersiz veya uygulanamaz bulunması halinde, 
        diğer hükümler geçerliliğini korumaya devam eder.
      </p>

      <h2>14. İletişim</h2>
      <p>
        Kullanım Koşulları ile ilgili sorularınız için:<br />
        E-posta: destek@whippy.life
      </p>

      <h2>15. Yürürlük</h2>
      <p>
        Bu Sözleşme, Platform'a kayıt olduğunuz veya Platform'u kullanmaya başladığınız 
        tarihte yürürlüğe girer ve hesabınız silinene kadar geçerliliğini korur.
      </p>
    </div>
  )
}

function TermsEN() {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: April 13, 2025</p>

      <h2>1. Parties and Subject of the Agreement</h2>
      <p>
        These Terms of Service ("Agreement") are entered into between the Whippy platform ("Platform") 
        and the natural or legal person using the Platform ("User") to regulate the terms of use of the Platform.
      </p>
      <p>
        By registering for or using the Platform, you declare that you have read, understood, and 
        accepted all provisions of this Agreement.
      </p>

      <h2>2. Definitions</h2>
      <ul>
        <li><strong>Platform:</strong> Web and mobile application provided through whippy.life domain</li>
        <li><strong>Service:</strong> Habit tracking, goal management, health tracking, and AI coaching services provided through the Platform</li>
        <li><strong>User:</strong> Natural or legal person who registers for and/or uses the Platform</li>
        <li><strong>Content:</strong> All text, images, videos, software, and other materials on the Platform</li>
      </ul>

      <h2>3. Scope of Service</h2>
      <p>The Platform provides Users with the following services:</p>
      <ul>
        <li>Creating and tracking habits</li>
        <li>Setting goals and tracking progress</li>
        <li>Recording health metrics (sleep, exercise, water intake)</li>
        <li>Mood tracking</li>
        <li>AI-powered personal coaching service</li>
        <li>Progress reports and analyses</li>
        <li>Notifications and reminders</li>
      </ul>

      <h2>4. Membership and Account Security</h2>
      <h3>4.1. Membership Requirements</h3>
      <ul>
        <li>You must be over 13 years old to use the Platform.</li>
        <li>Users under 18 may use the Platform with parental or guardian consent.</li>
        <li>You are obligated to provide accurate and current information during registration.</li>
      </ul>
      <h3>4.2. Account Security</h3>
      <ul>
        <li>You are responsible for the security of your account.</li>
        <li>You must immediately notify us if you notice unauthorized access to your account.</li>
        <li>You are responsible for all activities performed through your account.</li>
      </ul>

      <h2>5. User Obligations</h2>
      <p>As a User, you agree to comply with the following rules:</p>
      <ul>
        <li>Use the Platform only for legal purposes</li>
        <li>Not violate the rights of others</li>
        <li>Not share misleading, false, or deceptive information</li>
        <li>Not spread malicious software or code</li>
        <li>Avoid actions that endanger the security of the Platform</li>
        <li>Not engage in behavior that disturbs other users</li>
        <li>Not reverse engineer or attempt to access the source code of the Platform</li>
        <li>Not use automated data collection tools (bots, scrapers, etc.)</li>
      </ul>

      <h2>6. Intellectual Property Rights</h2>
      <h3>6.1. Platform's Rights</h3>
      <p>
        All content, design, logos, software, and other materials on the Platform are the intellectual 
        property of Whippy and are protected by applicable copyright laws.
      </p>
      <h3>6.2. User Content</h3>
      <p>
        You retain rights to content you upload to the Platform. However, by uploading this content 
        to the Platform, you grant the Platform permission to process this content for service delivery purposes.
      </p>

      <h2>7. AI Coaching Service</h2>
      <h3>7.1. Nature of Service</h3>
      <p>
        The AI coaching service is a motivation and guidance service provided using artificial 
        intelligence technology. This service:
      </p>
      <ul>
        <li>Does not replace professional psychological counseling or treatment</li>
        <li>Does not constitute medical advice</li>
        <li>Is not nutritionist or dietitian recommendations</li>
        <li>Is intended only for general motivation and information purposes</li>
      </ul>
      <h3>7.2. Disclaimer</h3>
      <p>
        You are fully responsible for decisions you make based on recommendations from the AI 
        coaching service. Always consult a healthcare professional for health concerns.
      </p>

      <h2>8. Pricing</h2>
      <p>
        The Platform is currently offered free of charge. If paid plans are introduced in the 
        future, pricing and payment terms will be announced separately.
      </p>

      <h2>9. Suspension and Termination of Service</h2>
      <h3>9.1. Platform's Rights</h3>
      <p>The Platform may suspend or terminate your account in the following cases:</p>
      <ul>
        <li>Violation of this Agreement</li>
        <li>Illegal activities</li>
        <li>Behavior disturbing other users</li>
        <li>Actions threatening the security of the Platform</li>
      </ul>
      <h3>9.2. User's Rights</h3>
      <p>
        You may delete your account at any time. Account deletion is irreversible and your 
        data will be deleted within the period specified in the Privacy Policy.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        The Platform cannot be held liable for direct or indirect damages arising from:
      </p>
      <ul>
        <li>Service interruptions or technical failures</li>
        <li>Data loss</li>
        <li>Problems with third-party services</li>
        <li>User's misuse of the Platform</li>
        <li>Force majeure events</li>
      </ul>
      <p>
        The Platform provides the service "as is" and does not guarantee that the service will 
        be uninterrupted or error-free.
      </p>

      <h2>11. Dispute Resolution</h2>
      <p>
        The laws of the Republic of Turkey shall apply to disputes arising from this Agreement. 
        Istanbul Courts and Enforcement Offices have jurisdiction for the resolution of disputes.
      </p>
      <p>
        Users acting as consumers reserve their rights under applicable consumer protection laws 
        and may apply to Consumer Arbitration Boards in their location.
      </p>

      <h2>12. Changes</h2>
      <p>
        The Platform reserves the right to change this Agreement with or without prior notice. 
        Changes take effect on the date they are published on the Platform. Your continued use 
        of the Platform means you accept the changes.
      </p>

      <h2>13. Severability</h2>
      <p>
        If any provision of this Agreement is found to be invalid or unenforceable, the remaining 
        provisions shall continue to remain valid.
      </p>

      <h2>14. Contact</h2>
      <p>
        For questions about Terms of Service:<br />
        Email: destek@whippy.life
      </p>

      <h2>15. Effective Date</h2>
      <p>
        This Agreement takes effect on the date you register for or start using the Platform 
        and remains valid until your account is deleted.
      </p>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Lang = 'tr' | 'en'

export default function PrivacyPage() {
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
        {lang === 'tr' ? <PrivacyTR /> : <PrivacyEN />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 Whippy. {lang === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground">{lang === 'tr' ? 'Kullanım Koşulları' : 'Terms of Service'}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function PrivacyTR() {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>Gizlilik Politikası</h1>
      <p className="text-muted-foreground">Son güncelleme: 13 Nisan 2025</p>

      <h2>1. Giriş</h2>
      <p>
        Whippy olarak, kişisel verilerinizin gizliliğine büyük önem veriyoruz. Bu Gizlilik Politikası, 
        6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") ve Avrupa Birliği Genel Veri Koruma 
        Tüzüğü ("GDPR") kapsamında kişisel verilerinizin nasıl toplandığını, kullanıldığını, 
        saklandığını ve korunduğunu açıklamaktadır.
      </p>

      <h2>2. Veri Sorumlusu</h2>
      <p>
        Kişisel verileriniz bakımından veri sorumlusu Whippy'dir.<br />
        İletişim: destek@whippy.life
      </p>

      <h2>3. Toplanan Kişisel Veriler</h2>
      <p>Hizmetlerimizi kullanmanız sırasında aşağıdaki kişisel verilerinizi toplayabiliriz:</p>
      <ul>
        <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, e-posta adresi</li>
        <li><strong>Hesap Bilgileri:</strong> Google hesabı ile giriş yapıldığında Google tarafından paylaşılan profil bilgileri</li>
        <li><strong>Kullanım Verileri:</strong> Alışkanlık kayıtları, hedefler, sağlık metrikleri (uyku, egzersiz, su tüketimi), ruh hali kayıtları</li>
        <li><strong>Teknik Veriler:</strong> IP adresi, tarayıcı türü, cihaz bilgileri, çerezler</li>
        <li><strong>İletişim Verileri:</strong> AI koç ile yapılan sohbet geçmişi</li>
      </ul>

      <h2>4. Verilerin Toplanma Yöntemi</h2>
      <p>Kişisel verileriniz aşağıdaki yöntemlerle toplanmaktadır:</p>
      <ul>
        <li>Kayıt ve giriş işlemleri sırasında (Google OAuth)</li>
        <li>Uygulama içi aktiviteleriniz aracılığıyla</li>
        <li>Çerezler ve benzer teknolojiler aracılığıyla</li>
      </ul>

      <h2>5. Verilerin İşlenme Amaçları</h2>
      <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
      <ul>
        <li>Hizmetlerimizin sunulması ve iyileştirilmesi</li>
        <li>Kişiselleştirilmiş AI koçluk hizmeti sağlanması</li>
        <li>İlerleme raporları ve analizlerin oluşturulması</li>
        <li>Bildirim ve hatırlatıcıların gönderilmesi</li>
        <li>Kullanıcı deneyiminin geliştirilmesi</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi</li>
      </ul>

      <h2>6. Verilerin Hukuki Sebebi</h2>
      <p>Kişisel verileriniz KVKK madde 5 ve GDPR madde 6 kapsamında aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:</p>
      <ul>
        <li>Açık rızanız</li>
        <li>Sözleşmenin ifası için gerekli olması</li>
        <li>Hukuki yükümlülüklerin yerine getirilmesi</li>
        <li>Meşru menfaatlerimiz</li>
      </ul>

      <h2>7. Verilerin Saklanma Süresi</h2>
      <p>
        Kişisel verileriniz, işleme amaçlarının gerektirdiği süre boyunca saklanmaktadır. 
        Hesabınızı sildiğinizde, kişisel verileriniz yasal saklama yükümlülükleri saklı kalmak kaydıyla 
        30 gün içinde silinir veya anonimleştirilir.
      </p>

      <h2>8. Verilerin Paylaşımı</h2>
      <p>Kişisel verileriniz aşağıdaki durumlar haricinde üçüncü taraflarla paylaşılmaz:</p>
      <ul>
        <li><strong>Hizmet Sağlayıcılar:</strong> Supabase (veritabanı), Vercel (hosting), Groq (AI hizmeti), Google (kimlik doğrulama)</li>
        <li><strong>Yasal Zorunluluklar:</strong> Mahkeme kararı veya yasal düzenlemeler gereği</li>
      </ul>
      <p>Verileriniz hiçbir koşulda reklam veya pazarlama amacıyla üçüncü taraflara satılmaz.</p>

      <h2>9. Veri Güvenliği</h2>
      <p>Kişisel verilerinizin güvenliği için aşağıdaki önlemler alınmaktadır:</p>
      <ul>
        <li>SSL/TLS şifreleme</li>
        <li>Güvenli veri merkezlerinde barındırma</li>
        <li>Erişim kontrolü ve yetkilendirme</li>
        <li>Düzenli güvenlik güncellemeleri</li>
      </ul>

      <h2>10. Haklarınız</h2>
      <p>KVKK madde 11 ve GDPR kapsamında aşağıdaki haklara sahipsiniz:</p>
      <ul>
        <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme</li>
        <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
        <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri öğrenme</li>
        <li>Eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</li>
        <li>KVKK madde 7 kapsamında silinmesini veya yok edilmesini isteme</li>
        <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
        <li>Kanuna aykırı işleme sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
      </ul>

      <h2>11. Çerezler</h2>
      <p>
        Web sitemiz ve uygulamamız, oturum yönetimi ve kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. 
        Çerez tercihlerinizi tarayıcı ayarlarınızdan yönetebilirsiniz.
      </p>

      <h2>12. Uluslararası Veri Aktarımı</h2>
      <p>
        Hizmet sağlayıcılarımızın bazıları yurt dışında bulunmaktadır. Bu aktarımlar, KVKK ve GDPR'ın 
        öngördüğü güvencelere uygun olarak gerçekleştirilmektedir.
      </p>

      <h2>13. Çocukların Gizliliği</h2>
      <p>
        Hizmetlerimiz 13 yaşın altındaki çocuklara yönelik değildir. 13 yaşın altındaki çocuklardan 
        bilerek kişisel veri toplamıyoruz.
      </p>

      <h2>14. Değişiklikler</h2>
      <p>
        Bu Gizlilik Politikası zaman zaman güncellenebilir. Önemli değişiklikler olması halinde 
        sizi bilgilendireceğiz.
      </p>

      <h2>15. İletişim</h2>
      <p>
        Gizlilik Politikası ile ilgili sorularınız veya haklarınızı kullanmak için:<br />
        E-posta: destek@whippy.life
      </p>
    </div>
  )
}

function PrivacyEN() {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: April 13, 2025</p>

      <h2>1. Introduction</h2>
      <p>
        At Whippy, we take the privacy of your personal data very seriously. This Privacy Policy 
        explains how your personal data is collected, used, stored, and protected in accordance 
        with the Turkish Personal Data Protection Law No. 6698 ("KVKK") and the European Union 
        General Data Protection Regulation ("GDPR").
      </p>

      <h2>2. Data Controller</h2>
      <p>
        The data controller for your personal data is Whippy.<br />
        Contact: destek@whippy.life
      </p>

      <h2>3. Personal Data We Collect</h2>
      <p>We may collect the following personal data when you use our services:</p>
      <ul>
        <li><strong>Identity Information:</strong> Name, surname, email address</li>
        <li><strong>Account Information:</strong> Profile information shared by Google when signing in with Google</li>
        <li><strong>Usage Data:</strong> Habit records, goals, health metrics (sleep, exercise, water intake), mood records</li>
        <li><strong>Technical Data:</strong> IP address, browser type, device information, cookies</li>
        <li><strong>Communication Data:</strong> Chat history with AI coach</li>
      </ul>

      <h2>4. How We Collect Data</h2>
      <p>Your personal data is collected through the following methods:</p>
      <ul>
        <li>During registration and login processes (Google OAuth)</li>
        <li>Through your in-app activities</li>
        <li>Through cookies and similar technologies</li>
      </ul>

      <h2>5. Purposes of Data Processing</h2>
      <p>Your personal data is processed for the following purposes:</p>
      <ul>
        <li>Providing and improving our services</li>
        <li>Providing personalized AI coaching service</li>
        <li>Creating progress reports and analyses</li>
        <li>Sending notifications and reminders</li>
        <li>Improving user experience</li>
        <li>Fulfilling legal obligations</li>
      </ul>

      <h2>6. Legal Basis for Processing</h2>
      <p>Your personal data is processed based on the following legal grounds under KVKK Article 5 and GDPR Article 6:</p>
      <ul>
        <li>Your explicit consent</li>
        <li>Necessity for the performance of a contract</li>
        <li>Compliance with legal obligations</li>
        <li>Our legitimate interests</li>
      </ul>

      <h2>7. Data Retention Period</h2>
      <p>
        Your personal data is retained for as long as necessary for the purposes of processing. 
        When you delete your account, your personal data will be deleted or anonymized within 30 days, 
        subject to legal retention obligations.
      </p>

      <h2>8. Data Sharing</h2>
      <p>Your personal data is not shared with third parties except in the following cases:</p>
      <ul>
        <li><strong>Service Providers:</strong> Supabase (database), Vercel (hosting), Groq (AI service), Google (authentication)</li>
        <li><strong>Legal Requirements:</strong> Court orders or legal regulations</li>
      </ul>
      <p>Your data is never sold to third parties for advertising or marketing purposes.</p>

      <h2>9. Data Security</h2>
      <p>The following measures are taken to ensure the security of your personal data:</p>
      <ul>
        <li>SSL/TLS encryption</li>
        <li>Hosting in secure data centers</li>
        <li>Access control and authorization</li>
        <li>Regular security updates</li>
      </ul>

      <h2>10. Your Rights</h2>
      <p>Under KVKK Article 11 and GDPR, you have the following rights:</p>
      <ul>
        <li>Right to know whether your personal data is being processed</li>
        <li>Right to request information about processing</li>
        <li>Right to know the purpose of processing and whether it is used accordingly</li>
        <li>Right to know third parties to whom data is transferred domestically or abroad</li>
        <li>Right to request correction if data is incomplete or incorrect</li>
        <li>Right to request deletion or destruction under KVKK Article 7</li>
        <li>Right to object to results arising from automated analysis</li>
        <li>Right to claim compensation for damages due to unlawful processing</li>
      </ul>

      <h2>11. Cookies</h2>
      <p>
        Our website and application use cookies for session management and to improve user experience. 
        You can manage your cookie preferences through your browser settings.
      </p>

      <h2>12. International Data Transfers</h2>
      <p>
        Some of our service providers are located abroad. These transfers are carried out in 
        accordance with the safeguards provided by KVKK and GDPR.
      </p>

      <h2>13. Children's Privacy</h2>
      <p>
        Our services are not directed to children under the age of 13. We do not knowingly 
        collect personal data from children under 13.
      </p>

      <h2>14. Changes</h2>
      <p>
        This Privacy Policy may be updated from time to time. We will notify you of any 
        significant changes.
      </p>

      <h2>15. Contact</h2>
      <p>
        For questions about this Privacy Policy or to exercise your rights:<br />
        Email: destek@whippy.life
      </p>
    </div>
  )
}

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

interface CoachRequestBody {
  message: string
  mode: 'gentle' | 'brutal' | 'predict'
  stats: {
    habitScore: number
    healthScore: number
    moodScore: number
    overallScore: number
    completedHabits: number
    totalHabits: number
    exercise: number
    sleep: number
    water: number
    goals: string
    projects: string
    streak?: number
    habits?: string[]
  }
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

function getSystemPrompt(mode: string, stats: CoachRequestBody['stats']): string {
  const habitList = stats.habits?.length 
    ? stats.habits.join(', ') 
    : 'henüz yok'

  const dataBlock = `
📊 KULLANICININ VERİLERİ:
- Alışkanlık: ${stats.completedHabits}/${stats.totalHabits} (%${stats.habitScore})
- Sağlık skoru: %${stats.healthScore}
- Ruh hali: %${stats.moodScore}
- Genel: %${stats.overallScore}
- Egzersiz: ${stats.exercise} dk | Uyku: ${stats.sleep} saat | Su: ${stats.water} L
- Seri: ${stats.streak || 0} gün
- Alışkanlıklar: ${habitList}
- Hedefler: ${stats.goals || 'yok'}
- Projeler: ${stats.projects || 'yok'}
`

  const characters = {
    gentle: `Sen "WHIPPY" - dünyanın en destekleyici, sıcacık AI yaşam koçusun. 

🌸 KARAKTERİN:
- Bir çay içerken sohbet eden en yakın arkadaş gibisin
- Her küçük başarıda konfeti patlatırsın 🎉
- "Canım", "tatlım", "süpersin" gibi samimi hitaplar kullanırsın
- Kötü günlerde bile gümüş astar bulursun
- Emoji bolca kullan ama abartma (2-4 per mesaj)
- Mizahi ve neşeli ol, espri yap

💬 ÖRNEK TARZ:
- "Aaa bugün 2 alışkanlık mı tamamladın? Kralsın sen ya! 👑"
- "Uyku 5 saat mi? Olsun canım, yarın telafi ederiz. Bu gece erken yatağa atla!"
- "Su içmeyi unutmuşsun galiba... Hadi şimdi bir bardak iç, bekliyorum! 💧"

⚠️ YASAK:
- Asla eleştirme veya suçlama
- "Yapmalısın", "zorundasın" gibi baskıcı ifadeler kullanma
- Uzun paragraflar yazma, kısa ve tatlı tut`,

    brutal: `Sen "ACIMAZ KOÇO" - Türkiye'nin en acımasız, en sarkastik fitness koçusun.

🔥 KARAKTERİN:
- Jocko Willink + Şahan Gökbakar karışımısın
- Bahanelere alerjin var, duyunca göz tikine giriyorsun
- Sarkastik, iğneleyici ama komik
- Türk dizi/film referansları yapabilirsin
- Küfür etmezsin ama iğnelersin
- Her cümlede bir yerde vurucu bir laf olmalı

💬 ÖRNEK TARZ:
- "0 dakika egzersiz? Vay be, koltuk seni çok özlemiş demek ki. Kavuşmuşsunuz, maşallah. 🛋️"
- "Uyku 4 saat... Gece 3'te ne yapıyordun? Netflix mi? TikTok mu? Kendi hayatının yan karakteri olmaya devam."
- "Su 0.5 litre? Çöl kaktüsü bile senden fazla su içiyordur şu an."
- "'Yarın başlarım' diyorsun ama yarın dünün yarınıydı. Bugün ne oldu peki? HİÇ."
- "Alışkanlık %30? Ortaokulda bu notla sınıfta kalırdın haberin olsun."

🎯 FORMAT:
1. Önce iğnele/dalga geç (2-3 cümle)
2. Sonra gerçeği söyle (1 cümle)
3. En son ne yapması gerektiğini emret (1 cümle)

⚠️ YASAK:
- Nazik olmak (kesinlikle yasak)
- "Olsun", "sorun değil", "idare eder" gibi yumuşak ifadeler
- Uzun açıklamalar - kısa ve yıkıcı ol`,

    predict: `Sen "ORACLE" - gizemli, bilge ve biraz ürkütücü bir kahin AI'sın.

🔮 KARAKTERİN:
- Kristal küreye bakan mistik bir kahin gibi konuş
- Dramatik ve teatral ol
- "Görüyorum ki...", "Gelecek şunu fısıldıyor..." gibi ifadeler kullan
- Hem korkutucu hem motive edici ol
- Somut rakamlar ve olasılıklar ver ama gizemli paketle

💬 ÖRNEK TARZ:
- "Hmm... Kristal kürem bulanıklaşıyor... Çünkü 0 dakika egzersiz görüyorum. 6 ay sonra? 📉 Merdiven çıkarken nefes nefese kalacaksın."
- "Ahhh, ilginç bir gelecek... İki yol görüyorum: 
  🌟 Işık yolu: Her gün 30dk yürürsen, 6 ayda 8 kilo gider
  🕳️ Karanlık yol: Böyle devam edersen, 6 ayda +5 kilo ve kronik yorgunluk"
- "Bekle... Bir vizyon geliyor... %${stats.habitScore} alışkanlık skoru ile devam edersen... *dramatik sessizlik* ...6 ay sonra aynı yerde olacaksın. Sürpriz yok."

🎯 FORMAT:
Her zaman 2-3 senaryo sun:
- 🚀 Parlak Gelecek (eğer değişirse)
- ⚖️ Mevcut Gidişat (değişmezse)  
- 💀 Karanlık Gelecek (daha da kötüye giderse)

Somut tahminler ver: "6 ayda X kilo", "%Y olasılıkla Z olur" gibi.

⚠️ YASAK:
- Sıkıcı ve düz konuşmak
- Sadece veri tekrarı yapmak
- Drama olmadan cevap vermek`
  }

  return characters[mode as keyof typeof characters] + '\n\n' + dataBlock + `

📏 GENEL KURALLAR:
- Türkçe yanıt ver
- Maksimum 100 kelime (kısa ve öz)
- Her mesaj karakterine uygun olsun
- Verilerden bahset, kişiselleştirilmiş ol`
}

export async function POST(request: NextRequest) {
  try {
    const body: CoachRequestBody = await request.json()
    const { message, mode, stats, history = [] } = body

    const GROQ_API_KEY = process.env.GROQ_API_KEY
    
    console.log('Coach API called, mode:', mode, 'has API key:', !!GROQ_API_KEY)

    if (!GROQ_API_KEY) {
      console.log('No GROQ_API_KEY found, using demo response')
      return NextResponse.json({
        content: getDemoResponse(mode, stats),
        isDemo: true,
      })
    }

    const messages = [
      { role: 'system' as const, content: getSystemPrompt(mode, stats) },
      ...history.slice(-6).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 400,
        temperature: mode === 'brutal' ? 0.95 : mode === 'predict' ? 0.8 : 0.75,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', response.status, errorText)
      return NextResponse.json({
        content: getDemoResponse(mode, stats),
        isDemo: true,
      })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || 'Bir hata oluştu.'
    
    console.log('Groq API success, response length:', content.length)

    return NextResponse.json({ content, isDemo: false })
  } catch (error) {
    console.error('Coach API error:', error)
    return NextResponse.json({
      content: 'Bağlantı hatası 🔄',
      isDemo: true,
    })
  }
}

function getDemoResponse(mode: string, stats: CoachRequestBody['stats']): string {
  // Random seed based on message to avoid same responses
  const seed = Date.now() % 10
  
  const responses = {
    gentle: [
      `Canım benim! 🌸 Bugün ${stats.completedHabits} alışkanlık tamamlamışsın, harikasın! ${stats.exercise > 0 ? `${stats.exercise} dakika egzersiz de yapmışsın, süpersin!` : 'Egzersiz yapmamışsın ama olsun, yarın telafi ederiz!'} Kendine iyi bak tatlım! 💕`,
      `Aşkım bugün nasıl hissediyorsun? 🤗 Verilerine baktım, ${stats.sleep} saat uyku... ${stats.sleep >= 7 ? 'Harika uyumuşsun!' : 'Biraz az ama sorun değil, bu gece erken yat!'} Seninle gurur duyuyorum! ✨`,
      `Tatlım! 🌺 Genel skorun %${stats.overallScore} - ${stats.overallScore > 50 ? 'gayet iyi gidiyorsun!' : 'biraz düşük ama SORUN DEĞİL!'} Her adım önemli, unutma! Seni çok destekliyorum! 🤍`,
      `Hey güzelim! 💫 ${stats.water} litre su içmişsin bugün. ${stats.water >= 2 ? 'Muhteşem!' : 'Biraz daha içsen süper olur!'} Kendine değer verdiğin için mutluyum! 🥰`,
      `Süperstar! ⭐ ${stats.completedHabits}/${stats.totalHabits} alışkanlık = harika bir başlangıç! Roma bir günde kurulmadı, sen de adım adım ilerle. Seninle gurur duyuyorum! 💖`,
    ],
    brutal: [
      `${stats.exercise === 0 ? 'Egzersiz 0 dakika. SIFIR. Koltuk seninle evlenme teklifi mi etti? 🛋️💍' : ''} ${stats.sleep < 6 ? `Uyku ${stats.sleep} saat - zombi gibi dolaşıyorsun muhtemelen.` : ''} ${stats.water < 1.5 ? `Su ${stats.water}L - çöl faresi senden daha hidrate.` : ''} Yarın aynı bahaneyi duymak istemiyorum. KALK VE YAP.`,
      `Alışkanlık skoru %${stats.habitScore}... 📉 Bu notla diplomayı çöpe atarlardı. "${stats.completedHabits}/${stats.totalHabits} fena değil" mi diyorsun? Fena. Çok fena. Mükemmellik %100'dür, gerisi bahane. Şimdi telefonu bırak ve bir alışkanlık tamamla.`,
      `Vay be, genel skor %${stats.overallScore}. 🎪 Sirkten mi kaçtın? Bu performansla ancak palyaço olursun. "Yorgunum" deme bana - yorgunluk bahane, tembellik gerçek. HADİ!`,
      `${stats.sleep} saat uyku? 😴 Gece 3'te ne yapıyordun? Instagram'da eski sevgilini mi stalklıyordun? Netflix maratonu mu? O vakit uyusaydın şimdi insan gibi olurdun.`,
      `Su ${stats.water}L... 🏜️ Sahara çölünde kaybolmuş deve bile senden fazla içiyordur. Böbreklerinden "YARDIM!" sesi geliyor duymuyor musun? Git bir bardak iç. ŞİMDİ.`,
      `"Ne yapayım?" diyorsun. 🤡 Sana söyleyeyim: 1) Telefonu bırak 2) Ayağa kalk 3) Bir alışkanlık tamamla. Çok mu zor? Hayır. Yapmıyorsun çünkü TEMBELSIN.`,
    ],
    predict: [
      `🔮 *Kristal küre parlamaya başlıyor...*

Görüyorum... ${stats.overallScore < 50 ? 'Karanlık bulutlar...' : 'Umut ışıkları...'}

🚀 **Parlak Gelecek**: Her gün %100 tutarsan → 6 ayda bambaşka biri
⚖️ **Mevcut Gidişat**: %${stats.habitScore} ile devam → 6 ay sonra aynı yer
💀 **Karanlık Yol**: Bırakırsan → Pişmanlık ve "keşke" dolu günler

Seçim senin... Ama kristal kürem ${stats.overallScore > 60 ? 'parlak yolu işaret ediyor ✨' : 'uyarı veriyor ⚠️'}`,
      `🌙 *Gözlerimi kapatıyorum ve geleceğe bakıyorum...*

Hmm... ${stats.exercise === 0 ? 'Hareketsizlik sisini görüyorum.' : `${stats.exercise} dakika egzersiz... iyi bir başlangıç.`}

📅 **6 Ay Sonra:**
- Bu tempoyla: Aynı yerdesin, belki daha kötü
- Günde 30dk egzersiz eklersen: 5-8 kilo kayıp mümkün
- Uyku düzenini tutarsan: Enerji %40 artar

*Kristal küre kararıyor...* Seçim senin. ⚡`,
      `🔮 *Vizyon geliyor...*

${stats.completedHabits}/${stats.totalHabits} alışkanlık... %${stats.habitScore} başarı oranı...

**GELECEK HARİTAN:**
🌟 En iyi senaryo: Her gün %100 tut → 6 ayda alışkanlıklar otomatik olur
😐 Orta senaryo: Böyle devam → Yarım yamalak ilerleme
💀 Kötü senaryo: Bırakırsan → Sıfıra dönüş

*Küre titriyor...* Değişim için son çağrı! 🚨`,
    ],
  }

  const modeResponses = responses[mode as keyof typeof responses] || responses.gentle
  return modeResponses[seed % modeResponses.length]
}

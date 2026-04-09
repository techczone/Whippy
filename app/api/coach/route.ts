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
  }
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

function getSystemPrompt(mode: string, stats: CoachRequestBody['stats']): string {
  const basePrompt = `Sen profesyonel bir AI yaşam koçusun. Türkçe yanıt ver. Her zaman samimi, doğrudan ve yardımcı ol.

Kullanıcının güncel verileri:
- Alışkanlıklar: ${stats.completedHabits}/${stats.totalHabits} tamamlandı (${stats.habitScore}%)
- Sağlık skoru: ${stats.healthScore}%
- Ruh hali skoru: ${stats.moodScore}%
- Genel skor: ${stats.overallScore}%
- Bugünkü egzersiz: ${stats.exercise} dakika
- Uyku: ${stats.sleep} saat
- Su tüketimi: ${stats.water} litre
- Hedefler: ${stats.goals || 'henüz yok'}
- Projeler: ${stats.projects || 'henüz yok'}

Yanıtlarını kısa ve öz tut (maksimum 150 kelime). Emoji kullanabilirsin.`

  const modeParts = {
    gentle: `

🌱 NAZİK MOD AKTİF
- Destekleyici ve motive edici ol
- Küçük başarıları kutla ("Harika gidiyorsun!" gibi)
- Yapıcı öneriler sun
- Empati göster ve anlayışlı ol
- Pozitif dil kullan`,

    brutal: `

🔥 ACIMASIZCA DÜRÜST MOD AKTİF!
- Bahaneleri asla kabul etme
- Direkt ve sert konuş, yuvarlama
- "Ama", "belki", "deneyebilirsin" gibi yumuşak ifadeler KULLANMA
- Gerçekleri yüzlerine vur
- Motivasyon konuşması yapma, sadece gerçekleri söyle
- Eğer performans düşükse bunu açıkça belirt
- Örnek: "3 gündür egzersiz yapmamışsın. Bu bahane değil tembellik."`,

    predict: `

🔮 6 AY TAHMİN MODU AKTİF
- Mevcut verilere dayanarak 6 ay sonraki durumu tahmin et
- Her zaman 3 senaryo sun:
  1. 🚀 İYİMSER: Tüm alışkanlıklar tutulursa
  2. ⚖️ GERÇEKÇİ: Mevcut tempo devam ederse  
  3. ⚠️ KÖTÜMSERİ: Performans düşerse
- Somut rakamlar ve olasılıklar ver
- Hangi alışkanlıkların en büyük etkiyi yapacağını belirt
- "Eğer X'i değiştirirsen, Y olur" formatında öneriler ver`,
  }

  return basePrompt + (modeParts[mode as keyof typeof modeParts] || modeParts.gentle)
}

export async function POST(request: NextRequest) {
  try {
    const body: CoachRequestBody = await request.json()
    const { message, mode, stats, history = [] } = body

    // Mesaj geçmişini formatla
    const messages = [
      { role: 'system' as const, content: getSystemPrompt(mode, stats) },
      ...history.slice(-10).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ]

    // Önce Groq'u dene (daha hızlı ve ücretsiz)
    const groqKey = process.env.GROQ_API_KEY
    
    if (groqKey) {
      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages,
            max_tokens: 1024,
            temperature: 0.7,
          }),
        })

        if (groqResponse.ok) {
          const data = await groqResponse.json()
          const content = data.choices?.[0]?.message?.content || 'Bir hata oluştu.'
          return NextResponse.json({ content, provider: 'groq' })
        }
      } catch (groqError) {
        console.error('Groq error:', groqError)
      }
    }

    // Groq başarısızsa Anthropic'i dene
    const anthropicKey = process.env.ANTHROPIC_API_KEY
    
    if (anthropicKey) {
      try {
        const anthropicMessages = messages.filter(m => m.role !== 'system')
        const systemPrompt = messages.find(m => m.role === 'system')?.content || ''
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: systemPrompt,
            messages: anthropicMessages,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const content = data.content?.[0]?.text || 'Bir hata oluştu.'
          return NextResponse.json({ content, provider: 'anthropic' })
        }
      } catch (anthropicError) {
        console.error('Anthropic error:', anthropicError)
      }
    }

    // Her iki API de başarısızsa demo yanıt
    return NextResponse.json({
      content: getDemoResponse(mode, stats),
      provider: 'demo',
    })
    
  } catch (error) {
    console.error('Coach API error:', error)
    
    return NextResponse.json({
      content: 'Şu an AI koçuna bağlanamıyorum. Lütfen daha sonra tekrar dene.',
      provider: 'error',
    })
  }
}

// Demo yanıtlar (API key olmadığında kullanılır)
function getDemoResponse(mode: string, stats: CoachRequestBody['stats']): string {
  const habitPercent = stats.habitScore
  const overallScore = stats.overallScore

  const responses = {
    gentle: [
      habitPercent >= 70
        ? `Harika gidiyorsun! 💪 ${stats.completedHabits} alışkanlık tamamladın, bu çok güzel bir ilerleme. Kendine güven, bu tempoda devam et!`
        : `Bugün biraz zor geçmiş olabilir, sorun değil. ${stats.completedHabits} alışkanlık tamamladın, her adım önemli. Yarın yeni bir gün! 🌱`,
      `Sağlık skorun ${stats.healthScore}%. ${
        stats.exercise > 0
          ? `${stats.exercise} dakika egzersiz yapmışsın, bu harika!`
          : 'Bugün biraz hareket eklemeye ne dersin?'
      }`,
      `Genel skorun ${overallScore}%. ${
        overallScore >= 60
          ? 'Doğru yoldasın, böyle devam!'
          : 'Adım adım ilerle, her gün biraz daha iyi olacaksın.'
      } ✨`,
    ],
    brutal: [
      habitPercent < 50
        ? `${stats.completedHabits}/${stats.totalHabits} alışkanlık mı? Bu rezalet. Bahane üretmeyi bırak ve işine bak.`
        : `${habitPercent}% fena değil ama daha iyisini yapabilirsin. Kendinle barışık olmayı bırak, zorla kendini.`,
      stats.exercise === 0
        ? `Bugün 0 dakika egzersiz. SIFIR. O koltuktan kalk ve bir şeyler yap. Yarın da aynı bahaneyi görmek istemiyorum.`
        : `${stats.exercise} dakika egzersiz? ${
            stats.exercise < 30
              ? "Bu yeterli değil. Minimum 30 dakika olmalı."
              : "İşte bu! Ama bir gün yapmak yetmez, her gün tekrarla."
          }`,
      stats.sleep < 7
        ? `${stats.sleep} saat uyku? Vücut dinlenmiyor, beyin çalışmıyor. Sonra neden verimli değilim diye ağlama.`
        : `Uyku düzeni iyi gidiyor. Bunu bozma sakın.`,
    ],
    predict: [
      `🔮 **6 AY SONRASI TAHMİNİ**

📊 Mevcut skorun: ${overallScore}%

🚀 **İyimser Senaryo** (${Math.min(95, overallScore + 25)}%):
Tüm alışkanlıklarını tutarsan, 6 ay sonra genel skorun ${Math.min(95, overallScore + 25)}%'e çıkabilir.

⚖️ **Gerçekçi Senaryo** (${Math.min(85, overallScore + 10)}%):
Bu tempoyla devam edersen, muhtemelen ${Math.min(85, overallScore + 10)}% civarında olacaksın.

⚠️ **Kötümser Senaryo** (${Math.max(20, overallScore - 15)}%):
Motivasyonunu kaybedersen, ${Math.max(20, overallScore - 15)}%'e düşme riski var.

💡 **Öneri**: ${
        stats.exercise < 30
          ? "Egzersiz süresini artır - en büyük etkiyi bu yapacak."
          : stats.sleep < 7
          ? "Uyku düzenini iyileştir - tüm diğer metrikleri etkiliyor."
          : "Tutarlılık! Her gün küçük adımlar, 6 ayda büyük fark yaratır."
      }`,
    ],
  }

  const modeResponses = responses[mode as keyof typeof responses] || responses.gentle
  return modeResponses[Math.floor(Math.random() * modeResponses.length)]
}

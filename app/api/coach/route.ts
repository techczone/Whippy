import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

interface CoachRequestBody {
  message: string
  mode: 'gentle' | 'brutal' | 'oracle'
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
  const baseContext = `Kullanıcının güncel verileri:
- Alışkanlıklar: ${stats.completedHabits}/${stats.totalHabits} tamamlandı (${stats.habitScore}%)
- Sağlık skoru: ${stats.healthScore}%
- Ruh hali skoru: ${stats.moodScore}%
- Genel skor: ${stats.overallScore}%
- Bugünkü egzersiz: ${stats.exercise} dakika
- Uyku: ${stats.sleep} saat
- Su tüketimi: ${stats.water} litre
- Hedefler: ${stats.goals || 'henüz yok'}
- Projeler: ${stats.projects || 'henüz yok'}`

  const modePrompts = {
    gentle: `Sen sıcak, destekleyici ve anlayışlı bir yaşam koçusun. Adın "Dost".

KARAKTERİN:
- Her zaman pozitif ve umut dolu konuş
- Küçük başarıları bile coşkuyla kutla
- "Harika!", "Süpersin!", "Gurur duyuyorum!" gibi ifadeler kullan
- Zorluklarda empati göster: "Anlıyorum, zor olabilir ama..."
- Asla eleştirme, sadece nazikçe yönlendir
- Bol emoji kullan 💚🌱✨🌟💪

KONUŞMA TARZI:
- "Bugün ${stats.completedHabits} alışkanlık tamamlamışsın, bu harika bir başlangıç!"
- "Kendine karşı nazik ol, her adım önemli"
- "Yarın yeni bir gün, birlikte başaracağız"

${baseContext}

Türkçe yanıt ver. Maksimum 100 kelime. Sıcak ve samimi ol.`,

    brutal: `Sen acımasız, sert ve direkt bir yaşam koçusun. Adın "Demir".

KARAKTERİN:
- ASLA yumuşak konuşma, ASLA teselli etme
- Bahaneleri yüzlerine vur, kabul etme
- "Ama", "belki", "deneyebilirsin" kelimelerini KULLANMA
- Küfür etme ama çok sert ol
- Gerçekleri acıtacak şekilde söyle
- Az emoji, varsa sadece 🔥 veya 💀

KONUŞMA TARZI:
- "${stats.completedHabits}/${stats.totalHabits} mü? Rezalet. Kendine yalan söylemeyi bırak."
- "${stats.exercise === 0 ? 'SIFIR dakika egzersiz. Koltukta çürüyorsun.' : ''}"
- "Bahane üretmeyi bırak. Ya yap ya da yapma, ortası yok."
- "Geçen hafta da aynı şeyi söyledin. Sonuç? HİÇ."
- "${stats.sleep < 6 ? `${stats.sleep} saat uyku mu? Sonra neden zombi gibisin diye ağlama.` : ''}"

${baseContext}

Türkçe yanıt ver. Maksimum 80 kelime. Sert, direkt, acımasız ol. Teselli YOK.`,

    oracle: `Sen gizemli bir kahin/bilgesin. Adın "Kahin".

KARAKTERİN:
- Gizemli ve bilge konuş
- Geleceği görüyormuş gibi tahminler yap
- 3 senaryo sun: İyimser 🌟, Gerçekçi ⚖️, Kötümser ⚠️
- Somut rakamlar ve olasılıklar ver
- Kadim bilgelik havası kat
- Emoji: 🔮✨🌙⭐

KONUŞMA TARZI:
- "Kristal küreme bakıyorum... 6 ay sonrasını görüyorum..."
- "Eğer bu yolda devam edersen..."
- "Kader senin elinde, ama yıldızlar şunu fısıldıyor..."
- "Üç yol görüyorum önünde..."

TAHMİN FORMATI:
🌟 İYİMSER: Tüm alışkanlıkları tutarsan → Skor: ${Math.min(95, stats.overallScore + 30)}%
⚖️ GERÇEKÇİ: Bu tempoyla → Skor: ${Math.min(85, stats.overallScore + 10)}%  
⚠️ UYARI: Bırakırsan → Skor: ${Math.max(15, stats.overallScore - 20)}%

${baseContext}

Türkçe yanıt ver. Maksimum 120 kelime. Gizemli ve bilge ol.`
  }

  return modePrompts[mode as keyof typeof modePrompts] || modePrompts.gentle
}

export async function POST(request: NextRequest) {
  try {
    const body: CoachRequestBody = await request.json()
    const { message, mode, stats, history = [] } = body

    const GROQ_API_KEY = process.env.GROQ_API_KEY

    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not set')
      return NextResponse.json({
        content: getDemoResponse(mode, stats),
        isDemo: true,
      })
    }

    const messages = [
      { role: 'system' as const, content: getSystemPrompt(mode, stats) },
      ...history.slice(-10).map((m) => ({
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
        max_tokens: 1024,
        temperature: mode === 'brutal' ? 0.9 : mode === 'oracle' ? 0.8 : 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Groq API error:', errorData)
      return NextResponse.json({ content: getDemoResponse(mode, stats), isDemo: true })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || 'Bir hata oluştu.'

    return NextResponse.json({ content, isDemo: false })
  } catch (error) {
    console.error('Coach API error:', error)
    return NextResponse.json({ content: getDemoResponse(mode, stats), isDemo: true })
  }
}

function getDemoResponse(mode: string, stats: CoachRequestBody['stats']): string {
  const responses = {
    gentle: `Harika gidiyorsun! 💚 ${stats.completedHabits} alışkanlık tamamlamışsın, bu çok güzel bir ilerleme. Kendine güven, bu tempoda devam et! Her adım seni hedeflerine yaklaştırıyor. 🌱✨`,
    
    brutal: `${stats.completedHabits}/${stats.totalHabits} alışkanlık mı? ${stats.habitScore < 50 ? 'Rezalet.' : 'Fena değil ama yetmez.'} ${stats.exercise === 0 ? 'Bugün SIFIR egzersiz. Koltuktan kalk.' : ''} Bahane üretmeyi bırak, işine bak. 🔥`,
    
    oracle: `🔮 Kristal küreme bakıyorum...

🌟 İYİMSER: Tüm alışkanlıkları tutarsan → 6 ay sonra %${Math.min(95, stats.overallScore + 30)}
⚖️ GERÇEKÇİ: Bu tempoyla → %${Math.min(85, stats.overallScore + 10)}
⚠️ UYARI: Bırakırsan → %${Math.max(15, stats.overallScore - 20)}

Kader senin elinde... ✨`
  }

  return responses[mode as keyof typeof responses] || responses.gentle
}

'use client'

import { useAppStore } from '@/lib/store'
import { translations } from '@/lib/i18n'

export function useTranslation() {
  const language = useAppStore((state) => state.settings.language)
  
  const t = translations[language]
  
  return { t, language }
}

export function useT() {
  const { t } = useTranslation()
  return t
}

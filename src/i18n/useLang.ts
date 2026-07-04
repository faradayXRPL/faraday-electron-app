import { useCallback, useEffect, useState } from 'react'
import { type Lang, translations } from './translations'

const STORAGE_KEY = 'faraday_usb_lang'

function detectLang(): Lang {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'de' || stored === 'en') return stored
  return 'en'
}

export function useLang() {
  const [lang, setLangState] = useState<Lang>(() => detectLang())

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.lang = next
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = translations[lang].meta.title
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', translations[lang].meta.description)
  }, [lang])

  return { lang, setLang, t: translations[lang] }
}

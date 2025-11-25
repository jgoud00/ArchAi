import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslations from './locales/en.json'
import hiTranslations from './locales/hi.json'
import teTranslations from './locales/te.json'

const resources = {
  en: { translation: enTranslations },
  hi: { translation: hiTranslations },
  te: { translation: teTranslations },
}

// Get initial language safely (SSR-compatible)
const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem('language') || 'en'
    } catch (error) {
      // localStorage might not be available (e.g., in private browsing)
      return 'en'
    }
  }
  return 'en' // Default for SSR environments
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n


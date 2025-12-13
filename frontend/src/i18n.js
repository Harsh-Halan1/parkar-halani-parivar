import i18next from 'i18next';
import enTranslations from './locales/en.json';
import guTranslations from './locales/gu.json';
import hiTranslations from './locales/hi.json';

// Get language from localStorage or default
const savedLang = localStorage.getItem('language') || 'gu';

i18next.init({
  lng: savedLang,
  fallbackLng: 'gu',
  resources: {
    en: { translation: enTranslations },
    gu: { translation: guTranslations },
    hi: { translation: hiTranslations }
  },
  interpolation: {
    escapeValue: false
  }
});

export default i18next;

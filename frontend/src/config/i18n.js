// src/config/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  // .use(LanguageDetector) // Commenté pour désactiver la détection automatique
  .use(initReactI18next)
  .init({
    lng: 'fr', // Ajouté pour forcer le français comme langue par défaut
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'ar', 'en-US'],
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // not needed for React as it escapes by default
    },
    
    // Chemins vers les fichiers de traduction
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    
    react: {
      useSuspense: false,
    }
  });

export default i18n;
import { createContext, useContext, useState, useCallback } from 'react';
import { translations } from '../i18n';

const LanguageContext = createContext();

/**
 * Wrap your app with this provider to enable language switching.
 * Default language is detected from browser, fallback to 'en'.
 */
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    // Try to restore from localStorage
    const saved = localStorage.getItem('portfolio_lang');
    if (saved && translations[saved]) return saved;
    // Auto-detect from browser
    const browserLang = navigator.language?.slice(0, 2);
    return browserLang === 'id' ? 'id' : 'en';
  });

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'en' ? 'id' : 'en';
      localStorage.setItem('portfolio_lang', next);
      return next;
    });
  }, []);

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access current language, toggle function, and translations.
 * Usage: const { t, lang, toggleLang } = useLanguage();
 */
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

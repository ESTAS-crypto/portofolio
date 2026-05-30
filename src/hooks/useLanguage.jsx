'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../i18n';

const LanguageContext = createContext();

/**
 * Wrap your app with this provider to enable language switching.
 * SSR-safe: defaults to 'en', then restores from localStorage on mount.
 */
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en'); // safe default for SSR

  // Restore language preference on mount (client-only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('portfolio_lang');
      if (saved && translations[saved]) {
        setLang(saved);
        return;
      }
      // Auto-detect from browser
      const browserLang = navigator.language?.slice(0, 2);
      if (browserLang === 'id') setLang('id');
    } catch {
      // SSR or localStorage unavailable — keep default
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'en' ? 'id' : 'en';
      try {
        localStorage.setItem('portfolio_lang', next);
      } catch {
        // localStorage unavailable
      }
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

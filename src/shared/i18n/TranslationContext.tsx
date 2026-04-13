'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { dictionaries, Language, Dictionary } from './dictionaries';

interface TranslationContextType {
  lang: Language;
  t: Dictionary;
  setLang: (lang: Language) => void;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('ko'); // Default to KO per MVP requirement
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Detect browser language on mount
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('en')) {
      setLang('en');
    } else {
      setLang('ko'); // fallback and default
    }
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by waiting for mount
  const value = {
    lang,
    t: dictionaries[lang],
    setLang,
  };

  return (
    <TranslationContext.Provider value={value}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden', display: 'contents' }}>
        {children}
      </div>
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

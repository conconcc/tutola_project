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
  // Lazy initializer — navigator not available during SSR, typeof window guard handles it
  const [lang, setLang] = useState<Language>(() =>
    typeof window !== 'undefined' && navigator.language.toLowerCase().startsWith('en') ? 'en' : 'ko'
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { translations, Language } from '../i18n/translations';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const globalSettings = useLiveQuery(() => db.settings.get('global'));
  const dbLang = globalSettings?.language as Language | undefined;

  // Use local state as fallback before DB loads
  const [localLang, setLocalLang] = useState<Language>('en');

  useEffect(() => {
    if (dbLang) {
      setLocalLang(dbLang);
    }
  }, [dbLang]);

  const handleSetLanguage = async (newLang: Language) => {
    setLocalLang(newLang);
    
    // Ensure the settings record exists
    const exists = await db.settings.get('global');
    if (exists) {
      await db.settings.update('global', { language: newLang });
    } else {
      await db.settings.put({
        id: 'global',
        language: newLang,
        theme: 'system',
        modelLimitConfig: 'default'
      });
    }
  };

  const t = (key: string) => {
    return translations[localLang]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language: localLang, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Language } from '@/lib/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>('en');


    useEffect(() => {
        // Load saved language from localStorage on mount
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && (savedLang === 'en' || savedLang === 'hi')) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLanguageState(prev => prev !== savedLang ? savedLang : prev);
        }

    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    // Prevent hydration mismatch by rendering children only after mount (optional, 
    // currently we just want to ensure we have the correct language loaded)
    // But for simple text replacement, we might not need to block rendering, 
    // though it might cause a flash of default language (English). 
    // Let's stick to simple rendering for now to avoid complexity, 
    // but if flash is annoying we can return null if not mounted.

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

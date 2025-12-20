import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, Translations } from '@/lib/translations/types';
import { translations } from '@/lib/translations';
import { enUS, zhCN, id, arSA, faIR, he, th, ja, ko } from 'date-fns/locale';

// Map our Language type to date-fns locales
const localeMap: Record<Language, any> = {
    eng: enUS,
    chn: zhCN,
    idn: id,
    ara: arSA,
    per: faIR,
    heb: he,
    tha: th,
    jap: ja,
    kor: ko
};

interface LanguageState {
    language: Language;
    direction: 'ltr' | 'rtl';
    t: (key: string) => any; // Helper to get nested keys
    setLanguage: (lang: Language) => void;
    getLocale: () => any;
    translations: Translations;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set, get) => ({
            language: 'eng',
            direction: 'ltr',
            translations: translations.eng,

            setLanguage: (lang: Language) => {
                const isRtl = ['ara', 'per', 'heb'].includes(lang);
                set({
                    language: lang,
                    direction: isRtl ? 'rtl' : 'ltr',
                    translations: translations[lang]
                });

                // Update document direction immediately for better UX
                if (typeof document !== 'undefined') {
                    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
                    document.documentElement.lang = lang;
                }
            },

            getLocale: () => {
                return localeMap[get().language];
            },

            t: (path: string) => {
                const currentTranslations = get().translations;
                const keys = path.split('.');
                let result: any = currentTranslations;
                for (const key of keys) {
                    if (result && typeof result === 'object' && key in result) {
                        result = result[key as keyof typeof result];
                    } else {
                        return path; // Fallback to key if not found
                    }
                }
                return result;
            }
        }),
        {
            name: 'language-storage',
            partialize: (state) => ({ language: state.language }), // Only persist language
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setLanguage(state.language); // Re-apply direction and translations
                }
            }
        }
    )
);

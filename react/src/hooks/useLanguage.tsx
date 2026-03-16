import { 
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";
import { Languages, Locale } from "../pages/settings/languageContext/LanguageContext";

type ContextType = {
    locale: Locale
    setLocale: (l: Locale) => void
    t: (key: string) => string
}

const Language = createContext < ContextType | null > (null)

/**
 * Provides locale state and translation lookup to descendant components.
 */
export function LanguageProvider ({
    children,
    defaultLocale = 'en',
}: {
    children: React.ReactNode
    defaultLocale?: Locale
}) {
    const [locale, setLocale] = useState<Locale>(() => {
        const saved = localStorage.getItem('locale')
        if (saved === 'en' || saved === 'sv') {
            return saved;
        }
        return defaultLocale
    })

    useEffect(() => {
        localStorage.setItem('locale', locale)
    }, [locale]);

    const value = useMemo(() => {
        const dict = Languages[locale]

        return {
            locale, setLocale,
            t: (key: string) => {
                const translation = (dict as Record<string, string>)[key];
                if (!translation) {
                    console.warn(`Missing translation for key: ${key} in locale: ${locale}`);
                    return key;
                }
                return translation;
            },
        }
    }, [locale])

    return (
        <Language.Provider value={value}>
            {children}
        </Language.Provider>
    )
}

/**
 * Returns the active language context.
 *
 * @returns {ContextType}
 */
export function useLanguage() {
    const ctx = useContext(Language);
    if (!ctx) {
        throw new Error('Language must be used within LanguageProvider')
    }
    return ctx
}

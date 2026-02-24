import { 
    createContext,
    useContext,
    useMemo,
    useState
} from "react";
import { Languages, Locale } from "./LanguageContext";

type ContextType = {
    locale: Locale
    setLocale: (l: Locale) => void
    t: (key: string) => string
}

const Language = createContext < ContextType | null > (null)

export function LanguageProvider ({
    children,
    defaultLocale = 'sv',
}: {
    children: React.ReactNode
    defaultLocale?: Locale
}) {
    const [locale, setLocale] = useState<Locale>(defaultLocale)

    const value = useMemo(() => {
        const dict = Languages[locale]

        return {
            locale, setLocale,
            t: (key: string) => (dict as Record<string, string>)[key] ?? key,
        }
    }, [locale])

    return (
        <Language.Provider value={value}>
            {children}
        </Language.Provider>
    )
}

export function useLanguage() {
    const ctx = useContext(Language);
    if (!ctx) {
        throw new Error('Language must be used within LanguageProvider')
    }
    return ctx
}
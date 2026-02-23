import { 
    createContext,
    useContext,
    useMemo,
    useState
} from "react";
import { Languanges, Locale } from "./LanguageContext";

type ContextType = {
    locale: Locale
    setLocale: (l: Locale) => void
    t: (key: string) => string
}

const Context
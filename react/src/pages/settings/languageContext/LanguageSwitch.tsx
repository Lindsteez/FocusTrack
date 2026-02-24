import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitch() {
    const {locale, setLocale} = useLanguage();

    return (
        <>
        <button 
            onClick={() => setLocale('sv')}
            disabled={locale === 'sv'}
        > Swedish </button>

        <button 
            onClick={() => setLocale('en')}
            disabled={locale === 'en'}
        > English </button>

        </>
    )
}
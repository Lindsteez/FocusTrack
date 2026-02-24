import { useLanguage } from "./LanguageProvider";
import "../themeContext.css";

export default function LanguageSwitch() {
    const {locale, setLocale} = useLanguage();

    return (
    <section className="settings">
      <div className="settings__card">
        <div className="settings__row">
          <span className="settings__label">Language</span>

          <div className="segmented">
            <button 
                type="button"
                className={'segmented__btn'}
                onClick={() => setLocale('sv')}
                disabled={locale === 'sv'}
                >Swedish </button>

            <button
                type="button"
                className={'segmented__btn'}
                onClick={() => setLocale('en')}
                disabled={locale === 'en'}
                >English</button>
          </div>
        </div>
      </div>
    </section>
  )
}

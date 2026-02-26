import { useLanguage } from "../../../hooks/useLanguage";
import "../themeContext.css";

export default function LanguageSwitch() {
  const { t } = useLanguage();
    const {locale, setLocale} = useLanguage();

    return (
    <section className="settings">
      <div className="settings__card">
        <div className="settings__row">
          <span className="settings__label">{t('settings.language')}</span>

          <div className="segmented">
            <button 
                type="button"
                className={`segmented__btn ${locale === 'sv' ? 'is-active' : ''}`}
                onClick={() => setLocale('sv')}
                >{t('settings.swedish')} </button>

            <button
                type="button"
                className={`segmented__btn ${locale === 'en' ? 'is-active' : ''}`}
                onClick={() => setLocale('en')}
                >{t('settings.english')}</button>
          </div>
        </div>
      </div>
    </section>
  )
}

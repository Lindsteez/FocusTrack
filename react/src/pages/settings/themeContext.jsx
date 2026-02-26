import { useEffect } from 'react'
import useLocalStorage from '../../hooks/useLocalStorage'
import { useLanguage } from './languageContext/LanguageProvider'
import './themeContext.css'

function ThemeContextCard() {
  const { t } = useLanguage();
  const [theme, setTheme] = useLocalStorage('theme', 'dark') // dark | light | auto

  // Apply theme + listen to system changes when auto
  useEffect(() => {
    const applyTheme = () => {
      if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        document.body.dataset.theme = prefersDark ? 'dark' : 'light'
      } else {
        document.body.dataset.theme = theme
      }
    }

    applyTheme()

    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', applyTheme)
      return () => mq.removeEventListener('change', applyTheme)
    }
  }, [theme])

  return (
    <section className="settings">
      <h2 className="settings__title">{t('settings.title')}</h2>

      <div className="settings__card">
        <div className="settings__row">
          <span className="settings__label">{t('settings.theme')}</span>

          <div className="segmented">
            <button
              type="button"
              className={`segmented__btn ${theme === 'dark' ? 'is-active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              🌙 {t('settings.dark')}
            </button>

            <button
              type="button"
              className={`segmented__btn ${theme === 'light' ? 'is-active' : ''}`}
              onClick={() => setTheme('light')}
            >
              🌞 {t('settings.light')}
            </button>

            <button
              type="button"
              className={`segmented__btn ${theme === 'auto' ? 'is-active' : ''}`}
              onClick={() => setTheme('auto')}
            >
              ✨ Auto
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ThemeContextCard
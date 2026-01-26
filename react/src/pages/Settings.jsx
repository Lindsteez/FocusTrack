import { useEffect } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import './Settings.css'

function Settings() {
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
      <h2 className="settings__title">Settings</h2>

      <div className="settings__card">
        <div className="settings__row">
          <span className="settings__label">Theme</span>

          <div className="segmented">
            <button
              type="button"
              className={`segmented__btn ${theme === 'dark' ? 'is-active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              🌙 Dark
            </button>

            <button
              type="button"
              className={`segmented__btn ${theme === 'light' ? 'is-active' : ''}`}
              onClick={() => setTheme('light')}
            >
              🌞 Light
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

export default Settings
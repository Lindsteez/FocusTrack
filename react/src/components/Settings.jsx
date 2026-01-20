import { useEffect } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import './Settings.css'

function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'dark') // dark | light | auto

  useEffect(() => {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.body.dataset.theme = prefersDark ? 'dark' : 'light'
    } else {
      document.body.dataset.theme = theme
    }
  }, [theme])

  return (
    <section className="settings">
      <h2 className="settings__title">Settings</h2>

      <div className="settings__card">
        <div className="settings__row">
          <p className="settings__label">Theme</p>

          <div className="segmented">
            <button
              className={`segmented__btn ${theme === 'dark' ? 'is-active' : ''}`}
              onClick={() => setTheme('dark')}
              type="button"
            >
              🌙 Dark
            </button>

            <button
              className={`segmented__btn ${theme === 'light' ? 'is-active' : ''}`}
              onClick={() => setTheme('light')}
              type="button"
            >
              🌞 Light
            </button>

            <button
              className={`segmented__btn ${theme === 'auto' ? 'is-active' : ''}`}
              onClick={() => setTheme('auto')}
              type="button"
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
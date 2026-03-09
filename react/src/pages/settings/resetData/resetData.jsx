import { useLanguage } from '../../../hooks/useLanguage'
import '../themeContext.css'

function ClearStorageCard() {
  const { t } = useLanguage()

  const handleClearStorage = () => {
    const confirmed = window.confirm(t('settings.clearStorageConfirm'))

    if (!confirmed) return

    localStorage.clear()
    window.location.reload()
  }

  return (
      <div className="settings__card">
        <div className="settings__row">
          <div>
            <span className="settings__label">{t('settings.clearStorage')}</span>
            <p className="settings__description">
              {t('settings.clearStorageDescription')}
            </p>
          </div>

          <button
            type="button"
            className="segmented__btn clear-storage-btn"
            onClick={handleClearStorage}
          >
            🗑️ {t('settings.clearStorageButton')}
          </button>
        </div>
      </div>
  )
}

export default ClearStorageCard
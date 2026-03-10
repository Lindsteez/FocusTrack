import "./FocusModeSelector.css";
import { useLanguage } from "../hooks/useLanguage";



export default function FocusModeSelector({ value, onChange }) {
  const { t } = useLanguage();
  const focusModes = [t('timer.work'), t('timer.meeting'), t('timer.break')];

  
  return (
    <div className="focusMode">
      <p className="focusMode__label">{t('timer.focusTitle')}</p>

      <div className="focusMode__group" role="tablist" aria-label="Focus modes">
        {focusModes.map((mode) => (
          <button
            key={mode}
            type="button"
            className={`focusMode__btn ${value === mode ? "is-active" : ""}`}
            onClick={() => onChange(mode)}
          >
            {mode}
          </button>
        ))}
      </div>

      <p className="focusMode__active">
        {t('timer.activeMode')} <span>{value}</span>
      </p>
    </div>
  );
}
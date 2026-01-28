import "./FocusModeSelector.css";

const focusModes = ["Deep work", "Meeting", "Break"];

export default function FocusModeSelector({ value, onChange }) {
  return (
    <div className="focusMode">
      <p className="focusMode__label">Focus modes</p>

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
        Active mode: <span>{value}</span>
      </p>
    </div>
  );
}
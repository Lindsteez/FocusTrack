import FocusModeSelector from "./FocusModeSelector";
import EnergyLevelSelector from "./EnergyLog/EnergyLevelSelector";
import styles from "./StartSessionModal.module.css";

export default function StartSessionModal({
  isOpen,
  focusMode,
  energyLevel,
  label,
  onChangeFocusMode,
  onChangeEnergyLevel,
  onChangeLabel,
  onCancel,
  onConfirm,
}) {
  if (!isOpen) return null;

  const canStart = Boolean(focusMode) && energyLevel != null;

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Start session</h2>

        <FocusModeSelector value={focusMode} onChange={onChangeFocusMode} />
        <EnergyLevelSelector value={energyLevel} onChange={onChangeEnergyLevel} />

        <label style={{ display: "block", marginTop: 12 }}>
          What did you do?
          <input
            value={label}
            onChange={(e) => onChangeLabel(e.target.value)}
            placeholder='e.g. "Reading"'
            style={{
              width: "100%",
              marginTop: 6,
              padding: "10px",
              borderRadius: "8px",
              boxSizing: "border-box",
            }}
          />
        </label>

        <div className={styles.actions}>
          <button onClick={onConfirm} disabled={!canStart}>
            Start
          </button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

import FocusModeSelector from "../FocusModeSelector";
import EnergyLevelSelector from "../EnergyLog/EnergyLevelSelector";
import styles from "./StartSessionModal.module.css";
import { useState } from "react";
import Button from "../Button"

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

  // Edit mode
  mode = 'start',
  initialValues = {},
  onSave,
}) {

  // Edit mode
  const isEdit = mode === 'edit';
  const [editLabel, setEditLabel] = useState(initialValues.description ?? initialValues.label ?? '');
  const [editFocusMode, setEditFocusMode] = useState(initialValues.focusMode ?? 'Work');
  const [editEnergyLevel, setEditEnergyLevel] = useState(initialValues.energyLevel == null ? null : Number(initialValues.energyLevel));

  if (!isOpen) return null;

  const uiFocusMode = isEdit ? editFocusMode : focusMode;
  const uiEnergyLevel = isEdit ? editEnergyLevel : energyLevel;
  const uiLabel = isEdit ? editLabel : label;

  const uiSetFocusMode = isEdit ? setEditFocusMode : onChangeFocusMode;
  const uiSetEnergyLevel = isEdit ? (n) => setEditEnergyLevel(Number(n)) : onChangeEnergyLevel;
  console.log("editEnergyLevel", editEnergyLevel);
  const uiSetLabel = isEdit ? setEditLabel : onChangeLabel;

  const canSubmit = Boolean(uiFocusMode) && uiEnergyLevel != null;

  function handlePrimaryAction() {
    if (!canSubmit) return;

    if (isEdit) {
      onSave?.({
        description: editLabel, // sparar description i sessions
        focusMode: editFocusMode,
        energyLevel: editEnergyLevel,
      });
    } else {
      onConfirm?.();
    }
  }

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? 'Edit session' : 'Start Session'}</h2>

        <FocusModeSelector value={uiFocusMode} onChange={uiSetFocusMode} />
        <EnergyLevelSelector value={uiEnergyLevel} onChange={uiSetEnergyLevel} />

        <label style={{ display: "block", marginTop: 12 }}>
          <h2>What will you do?</h2>
          <input
            value={uiLabel}
            onChange={(e) => uiSetLabel(e.target.value)}
            placeholder='e.g. "Reading"'
            style={{
              width: "100%",
              marginTop: 6,
              padding: "7px",
              borderRadius: "8px",
              boxSizing: "border-box",
              minHeight: 40,
            }}
          />
        </label>

        <div className={styles.actions}>
          <Button
            label={isEdit ? "Save" : "Start"}
            variant="start"
            onClick={handlePrimaryAction}
            disabled={!canSubmit}
          />

          <Button
            label="Cancel"
            variant="stop"
            onClick={onCancel}
          />
        </div>

      </div>
    </div>
  );
}

import FocusModeSelector from "../FocusModeSelector";
import EnergyLevelSelector from "../EnergyLog/EnergyLevelSelector";
import styles from "./StartSessionModal.module.css";
import { useState, useMemo } from "react";
import Button from "../Button";
import { useLanguage } from "../../hooks/useLanguage";
import { buildRecommendations } from "../../utils/recommendations";

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
  timerMode = "up",
  onChangeTimerMode,
  alarmHours = 0,
  alarmMinutes = 0,
  alarmSeconds = 0,
  onChangeAlarmHours,
  onChangeAlarmMinutes,
  onChangeAlarmSeconds,

  // Edit mode
  mode = "start",
  initialValues = {},
  onSave,
}) {
  const { t } = useLanguage();

  // Edit mode
  const isEdit = mode === "edit";
  const [editLabel, setEditLabel] = useState(
    initialValues.description ?? initialValues.label ?? "",
  );
  const [editFocusMode, setEditFocusMode] = useState(
    initialValues.focusMode ?? "Work",
  );
  const [editEnergyLevel, setEditEnergyLevel] = useState(
    initialValues.energyLevel == null
      ? null
      : Number(initialValues.energyLevel),
  );

  const rec = useMemo(() => {
    return buildRecommendations({ energyLevel, focusMode });
  }, [energyLevel, focusMode]);

  if (!isOpen) return null;

  const uiFocusMode = isEdit ? editFocusMode : focusMode;
  const uiEnergyLevel = isEdit ? editEnergyLevel : energyLevel;
  const uiLabel = isEdit ? editLabel : label;

  const uiSetFocusMode = isEdit ? setEditFocusMode : onChangeFocusMode;
  const uiSetEnergyLevel = isEdit
    ? (n) => setEditEnergyLevel(Number(n))
    : onChangeEnergyLevel;
  // console.log("editEnergyLevel", editEnergyLevel);
  const uiSetLabel = isEdit ? setEditLabel : onChangeLabel;

  const alarmTotalSeconds =
    Number(alarmHours || 0) * 3600 +
    Number(alarmMinutes || 0) * 60 +
    Number(alarmSeconds || 0);

  const canSubmit =
    Boolean(uiFocusMode) &&
    uiEnergyLevel != null &&
    String(uiLabel).trim().length > 0 &&
    (isEdit || timerMode === "up" || alarmTotalSeconds > 0);

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function parseNumberInput(value, min, max) {
    if (value === "") return min;
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return min;
    return clamp(Math.floor(parsed), min, max);
  }

  function handlePrimaryAction() {
    if (!canSubmit) return;

    if (isEdit) {
      onSave?.({
        description: editLabel, // sparar description i sessions
        focusMode: editFocusMode,
        energyLevel: editEnergyLevel,
      });
    } else {
      onConfirm?.({
        timerMode,
        targetSeconds: timerMode === "down" ? alarmTotalSeconds : 0,
      });
    }
  }

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>
          {isEdit ? `${t("timer.editSession")}` : `${t("timer.startSession")}`}
        </h2>

        <FocusModeSelector value={uiFocusMode} onChange={uiSetFocusMode} />
        <EnergyLevelSelector
          value={uiEnergyLevel}
          onChange={uiSetEnergyLevel}
        />

        <div className={styles.recommendation}>
          Recommended time: <b>{rec.recommendedMinutes} min</b>
          <span className={styles.confidence}>
            {" "}
            (confidence {Math.round(rec.confidence * 100)}%)
          </span>
        </div>

        {!isEdit && (
          <div className={styles.timerTypeSection}>
            <h2>{t("timer.timerType")}</h2>
            <div className={styles.timerTypeButtons}>
              <Button
                label={t("timer.countUp")}
                variant={timerMode === "up" ? "start" : "pause"}
                onClick={() => onChangeTimerMode?.("up")}
              />
              <Button
                label={t("timer.countDown")}
                variant={timerMode === "down" ? "start" : "pause"}
                onClick={() => onChangeTimerMode?.("down")}
              />
            </div>

            {timerMode === "down" && (
              <div className={styles.alarmSection}>
                <h2>{t("timer.alarmTime")}</h2>
                <div className={styles.alarmGrid}>
                  <label>
                    {t("timer.hours")}
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={alarmHours}
                      onChange={(e) =>
                        onChangeAlarmHours?.(
                          parseNumberInput(e.target.value, 0, 99),
                        )
                      }
                      className={styles.alarmInput}
                    />
                  </label>

                  <label>
                    {t("timer.minutes")}
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={alarmMinutes}
                      onChange={(e) =>
                        onChangeAlarmMinutes?.(
                          parseNumberInput(e.target.value, 0, 59),
                        )
                      }
                      className={styles.alarmInput}
                    />
                  </label>

                  <label>
                    {t("timer.seconds")}
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={alarmSeconds}
                      onChange={(e) =>
                        onChangeAlarmSeconds?.(
                          parseNumberInput(e.target.value, 0, 59),
                        )
                      }
                      className={styles.alarmInput}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        <label className={styles.labelBlock}>
          <h2>{t("timer.wwyd")}</h2>
          <input
            value={uiLabel}
            onChange={(e) => uiSetLabel(e.target.value)}
            placeholder={t("timer.eg")}
            className={styles.labelInput}
          />
        </label>

        <div className={styles.actions}>
          <Button
            label={isEdit ? `${t("timer.save")}` : `${t("timer.start")}`}
            variant={!canSubmit ? "disabledStart" : "start"}
            onClick={handlePrimaryAction}
            disabled={!canSubmit}
          />

          <Button label={t("timer.cancel")} variant="stop" onClick={onCancel} />
        </div>
      </div>
    </div>
  );
}

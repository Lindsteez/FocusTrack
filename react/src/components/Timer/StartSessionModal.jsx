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

  const HOUR_OPTIONS = Array.from({ length: 100 }, (_, i) => i);
  const MIN_SEC_OPTIONS = Array.from({ length: 60 }, (_, i) => i);

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

  function toPaddedString(value) {
    return String(value).padStart(2, "0");
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
                  <label className={styles.alarmField}>
                    <span>{t("timer.hours")}</span>
                    <select
                      value={Number(alarmHours)}
                      onChange={(e) =>
                        onChangeAlarmHours?.(Number(e.target.value))
                      }
                      className={styles.alarmInput}
                    >
                      {HOUR_OPTIONS.map((hour) => (
                        <option key={hour} value={hour}>
                          {toPaddedString(hour)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.alarmField}>
                    <span>{t("timer.minutes")}</span>
                    <select
                      value={Number(alarmMinutes)}
                      onChange={(e) =>
                        onChangeAlarmMinutes?.(Number(e.target.value))
                      }
                      className={styles.alarmInput}
                    >
                      {MIN_SEC_OPTIONS.map((minute) => (
                        <option key={minute} value={minute}>
                          {toPaddedString(minute)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.alarmField}>
                    <span>{t("timer.seconds")}</span>
                    <select
                      value={Number(alarmSeconds)}
                      onChange={(e) =>
                        onChangeAlarmSeconds?.(Number(e.target.value))
                      }
                      className={styles.alarmInput}
                    >
                      {MIN_SEC_OPTIONS.map((second) => (
                        <option key={second} value={second}>
                          {toPaddedString(second)}
                        </option>
                      ))}
                    </select>
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

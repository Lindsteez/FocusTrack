import FocusModeSelector from "../FocusModeSelector";
import EnergyLevelSelector from "../EnergyLog/EnergyLevelSelector";
import styles from "./StartSessionModal.module.css";
import { useState, useMemo, useEffect, useRef } from "react";
import Button from "../Button";
import { useLanguage } from "../../hooks/useLanguage";
import { buildRecommendations } from "../../utils/recommendations";

const WHEEL_ITEM_HEIGHT = 52;

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
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [revertOnClose, setRevertOnClose] = useState(false);
  const [draftHours, setDraftHours] = useState(Number(alarmHours) || 0);
  const [draftMinutes, setDraftMinutes] = useState(Number(alarmMinutes) || 0);
  const [draftSeconds, setDraftSeconds] = useState(Number(alarmSeconds) || 0);

  const hoursRef = useRef(null);
  const minutesRef = useRef(null);
  const secondsRef = useRef(null);

  const rec = useMemo(() => {
    return buildRecommendations({ energyLevel, focusMode });
  }, [energyLevel, focusMode]);

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

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function scrollToValue(ref, value, behavior = "smooth") {
    if (!ref.current) return;
    ref.current.scrollTo({
      top: value * WHEEL_ITEM_HEIGHT,
      behavior,
    });
  }

  function handleWheelScroll(event, max, setValue) {
    const rawIndex = Math.round(
      event.currentTarget.scrollTop / WHEEL_ITEM_HEIGHT,
    );
    const nextValue = clamp(rawIndex, 0, max);
    setValue(nextValue);
  }

  function openWheelPicker(shouldRevertOnClose = false) {
    const h = clamp(Number(alarmHours) || 0, 0, 99);
    const m = clamp(Number(alarmMinutes) || 0, 0, 59);
    const s = clamp(Number(alarmSeconds) || 0, 0, 59);

    setDraftHours(h);
    setDraftMinutes(m);
    setDraftSeconds(s);
    setRevertOnClose(shouldRevertOnClose);
    setIsWheelOpen(true);
  }

  function revertToCountUp() {
    onChangeTimerMode?.("up");
  }

  function closeWheelPicker() {
    setIsWheelOpen(false);
    if (revertOnClose) {
      revertToCountUp();
    }
  }

  function applyWheelPicker() {
    onChangeAlarmHours?.(draftHours);
    onChangeAlarmMinutes?.(draftMinutes);
    onChangeAlarmSeconds?.(draftSeconds);
    onChangeTimerMode?.("down");
    setRevertOnClose(false);
    setIsWheelOpen(false);
  }

  function handleSelectCountDown() {
    onChangeTimerMode?.("down");
    openWheelPicker(alarmTotalSeconds <= 0);
  }

  function handleSelectCountUp() {
    onChangeTimerMode?.("up");
    setRevertOnClose(false);
    setIsWheelOpen(false);
  }

  useEffect(() => {
    if (!isWheelOpen) return;

    requestAnimationFrame(() => {
      scrollToValue(hoursRef, draftHours, "auto");
      scrollToValue(minutesRef, draftMinutes, "auto");
      scrollToValue(secondsRef, draftSeconds, "auto");
    });
  }, [isWheelOpen, draftHours, draftMinutes, draftSeconds]);

  if (!isOpen) return null;

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
                onClick={handleSelectCountUp}
              />
              <Button
                label={t("timer.countDown")}
                variant={timerMode === "down" ? "start" : "pause"}
                onClick={handleSelectCountDown}
              />
            </div>

            {timerMode === "down" && (
              <div className={styles.alarmSection}>
                <h2>{t("timer.alarmTime")}</h2>
                <div className={styles.alarmInlineRow}>
                  <div className={styles.alarmValuePreview}>
                    {toPaddedString(alarmHours)}h :{" "}
                    {toPaddedString(alarmMinutes)}m :{" "}
                    {toPaddedString(alarmSeconds)}s
                  </div>
                  <button
                    type="button"
                    className={styles.openWheelBtn}
                    onClick={() => openWheelPicker(alarmTotalSeconds <= 0)}
                  >
                    {t("timer.alarmTime")}
                  </button>
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

        {isWheelOpen ? (
          <div className={styles.wheelBackdrop} onClick={closeWheelPicker}>
            <div
              className={styles.wheelModal}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.wheelCloseBtn}
                onClick={closeWheelPicker}
                aria-label="Close"
              >
                X
              </button>

              <h3 className={styles.wheelTitle}>{t("timer.alarmTime")}</h3>

              <div className={styles.wheelGrid}>
                <div className={styles.wheelCol}>
                  <div className={styles.wheelColLabel}>{t("timer.hours")}</div>
                  <div className={styles.wheelViewportWrap}>
                    <div
                      ref={hoursRef}
                      className={styles.wheelViewport}
                      onScroll={(e) => handleWheelScroll(e, 99, setDraftHours)}
                    >
                      <div className={styles.wheelSpacer} />
                      {HOUR_OPTIONS.map((hour) => (
                        <button
                          key={hour}
                          type="button"
                          className={`${styles.wheelItem} ${draftHours === hour ? styles.wheelItemActive : ""}`}
                          onClick={() => {
                            setDraftHours(hour);
                            scrollToValue(hoursRef, hour);
                          }}
                        >
                          {toPaddedString(hour)}
                          <span className={styles.wheelUnit}>h</span>
                        </button>
                      ))}
                      <div className={styles.wheelSpacer} />
                    </div>
                    <div className={styles.wheelFocusBand} />
                  </div>
                </div>

                <div className={styles.wheelCol}>
                  <div className={styles.wheelColLabel}>
                    {t("timer.minutes")}
                  </div>
                  <div className={styles.wheelViewportWrap}>
                    <div
                      ref={minutesRef}
                      className={styles.wheelViewport}
                      onScroll={(e) =>
                        handleWheelScroll(e, 59, setDraftMinutes)
                      }
                    >
                      <div className={styles.wheelSpacer} />
                      {MIN_SEC_OPTIONS.map((minute) => (
                        <button
                          key={minute}
                          type="button"
                          className={`${styles.wheelItem} ${draftMinutes === minute ? styles.wheelItemActive : ""}`}
                          onClick={() => {
                            setDraftMinutes(minute);
                            scrollToValue(minutesRef, minute);
                          }}
                        >
                          {toPaddedString(minute)}
                          <span className={styles.wheelUnit}>m</span>
                        </button>
                      ))}
                      <div className={styles.wheelSpacer} />
                    </div>
                    <div className={styles.wheelFocusBand} />
                  </div>
                </div>

                <div className={styles.wheelCol}>
                  <div className={styles.wheelColLabel}>
                    {t("timer.seconds")}
                  </div>
                  <div className={styles.wheelViewportWrap}>
                    <div
                      ref={secondsRef}
                      className={styles.wheelViewport}
                      onScroll={(e) =>
                        handleWheelScroll(e, 59, setDraftSeconds)
                      }
                    >
                      <div className={styles.wheelSpacer} />
                      {MIN_SEC_OPTIONS.map((second) => (
                        <button
                          key={second}
                          type="button"
                          className={`${styles.wheelItem} ${draftSeconds === second ? styles.wheelItemActive : ""}`}
                          onClick={() => {
                            setDraftSeconds(second);
                            scrollToValue(secondsRef, second);
                          }}
                        >
                          {toPaddedString(second)}
                          <span className={styles.wheelUnit}>s</span>
                        </button>
                      ))}
                      <div className={styles.wheelSpacer} />
                    </div>
                    <div className={styles.wheelFocusBand} />
                  </div>
                </div>
              </div>

              <div className={styles.wheelActions}>
                <Button
                  label={t("timer.cancel")}
                  variant="stop"
                  onClick={closeWheelPicker}
                />
                <Button
                  label={t("timer.save")}
                  variant="start"
                  onClick={applyWheelPicker}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

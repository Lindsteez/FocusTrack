import FocusModeSelector from "../FocusModeSelector";
import EnergyLevelSelector from "../EnergyLog/EnergyLevelSelector";
import styles from "./StartSessionModal.module.css";
import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Button from "../Button";
import { useLanguage } from "../../hooks/useLanguage";
import { buildRecommendations } from "../../utils/recommendations";
import {
  getPlanningItemDurationMinutes,
  getTodayPlanningRecommendation,
  subscribePlanning,
} from "../../utils/planningStore";

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
  const draftHoursRef = useRef(draftHours);
  const draftMinutesRef = useRef(draftMinutes);
  const draftSecondsRef = useRef(draftSeconds);

  const hoursDragRef = useRef({
    isDragging: false,
    startY: 0,
    startScrollTop: 0,
    pointerId: null,
  });
  const minutesDragRef = useRef({
    isDragging: false,
    startY: 0,
    startScrollTop: 0,
    pointerId: null,
  });
  const secondsDragRef = useRef({
    isDragging: false,
    startY: 0,
    startScrollTop: 0,
    pointerId: null,
  });

  const rec = useMemo(() => {
    return buildRecommendations({ energyLevel, focusMode });
  }, [energyLevel, focusMode]);
  const [planningRec, setPlanningRec] = useState(() =>
    getTodayPlanningRecommendation(),
  );
  const [planningItemId, setPlanningItemId] = useState(null);

  const uiFocusMode = isEdit ? editFocusMode : focusMode;
  const uiEnergyLevel = isEdit ? editEnergyLevel : energyLevel;
  const uiLabel = isEdit ? editLabel : label;

  const uiSetFocusMode = isEdit ? setEditFocusMode : onChangeFocusMode;
  const uiSetEnergyLevel = isEdit
    ? (n) => setEditEnergyLevel(Number(n))
    : onChangeEnergyLevel;
  // console.log("editEnergyLevel", editEnergyLevel);
  const uiSetLabel = isEdit ? setEditLabel : onChangeLabel;
  const focusModeOptions = [
    t("timer.work"),
    t("timer.meeting"),
    t("timer.break"),
  ];
  const hasManualFocusMode = focusModeOptions.includes(uiFocusMode);
  const isPlanningApplied = planningItemId != null;

  const alarmTotalSeconds =
    Number(alarmHours || 0) * 3600 +
    Number(alarmMinutes || 0) * 60 +
    Number(alarmSeconds || 0);

  const canSubmit =
    (isEdit || isPlanningApplied || hasManualFocusMode) &&
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

  function startMouseDrag(event, viewportRef, dragRef) {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

    const el = viewportRef.current;
    if (!el) return;

    dragRef.current = {
      isDragging: true,
      startY: event.clientY,
      startScrollTop: el.scrollTop,
      pointerId: event.pointerId,
    };

    if (el.setPointerCapture) {
      el.setPointerCapture(event.pointerId);
    }
  }

  function moveMouseDrag(event, viewportRef, dragRef, max, setValue) {
    const drag = dragRef.current;
    if (!drag.isDragging) return;

    const el = viewportRef.current;
    if (!el) return;

    const deltaY = event.clientY - drag.startY;
    el.scrollTop = drag.startScrollTop - deltaY;

    const rawIndex = Math.round(el.scrollTop / WHEEL_ITEM_HEIGHT);
    setValue(clamp(rawIndex, 0, max));
  }

  function endMouseDrag(viewportRef, dragRef, max, setValue) {
    const drag = dragRef.current;
    if (!drag.isDragging) return;

    const el = viewportRef.current;
    dragRef.current = {
      isDragging: false,
      startY: 0,
      startScrollTop: 0,
      pointerId: null,
    };

    if (!el) return;

    if (el.releasePointerCapture && drag.pointerId != null) {
      try {
        el.releasePointerCapture(drag.pointerId);
      } catch {
        // ignore release errors
      }
    }

    const rawIndex = Math.round(el.scrollTop / WHEEL_ITEM_HEIGHT);
    const nextValue = clamp(rawIndex, 0, max);
    setValue(nextValue);
    scrollToValue(viewportRef, nextValue);
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

  useEffect(() => {
    draftHoursRef.current = draftHours;
  }, [draftHours]);

  useEffect(() => {
    draftMinutesRef.current = draftMinutes;
  }, [draftMinutes]);

  useEffect(() => {
    draftSecondsRef.current = draftSeconds;
  }, [draftSeconds]);

  useEffect(() => {
    if (!isWheelOpen) return;

    const wheelBindings = [
      {
        ref: hoursRef,
        valueRef: draftHoursRef,
        max: 99,
        setValue: setDraftHours,
      },
      {
        ref: minutesRef,
        valueRef: draftMinutesRef,
        max: 59,
        setValue: setDraftMinutes,
      },
      {
        ref: secondsRef,
        valueRef: draftSecondsRef,
        max: 59,
        setValue: setDraftSeconds,
      },
    ];

    const cleanups = wheelBindings
      .map(({ ref, valueRef, max, setValue }) => {
        const el = ref.current;
        if (!el) return null;

        const onWheel = (event) => {
          event.preventDefault();
          const direction = event.deltaY > 0 ? 1 : -1;
          const nextValue = clamp(valueRef.current + direction, 0, max);
          valueRef.current = nextValue;
          setValue(nextValue);
          scrollToValue(ref, nextValue, "auto");
        };

        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
      })
      .filter(Boolean);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [isWheelOpen]);

  useEffect(() => {
    if (!isOpen || isEdit) return;

    function syncPlanningRecommendation() {
      setPlanningRec(getTodayPlanningRecommendation());
    }

    syncPlanningRecommendation();

    const unsubscribe = subscribePlanning(syncPlanningRecommendation);
    const intervalId = setInterval(syncPlanningRecommendation, 30000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [isOpen, isEdit]);

  if (!isOpen) return null;

  function handleModalCancel() {
    setPlanningItemId(null);
    onCancel?.();
  }

  function handleFocusModeChange(nextMode) {
    setPlanningItemId(null);
    uiSetFocusMode(nextMode);
  }

  function applyPlanningRecommendation() {
    const item = planningRec.item;
    if (!item || isEdit) return;

    const durationMinutes = getPlanningItemDurationMinutes(item);
    if (durationMinutes <= 0) return;

    const totalSeconds = durationMinutes * 60;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    uiSetLabel(item.title);
    uiSetFocusMode(item.title);
    onChangeTimerMode?.("down");
    onChangeAlarmHours?.(hours);
    onChangeAlarmMinutes?.(minutes);
    onChangeAlarmSeconds?.(seconds);
    setPlanningItemId(item.id);
    setRevertOnClose(false);
    setIsWheelOpen(false);
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
      const selectedPlanningItemId = planningItemId;
      setPlanningItemId(null);
      onConfirm?.({
        timerMode,
        targetSeconds: timerMode === "down" ? alarmTotalSeconds : 0,
        planningItemId: selectedPlanningItemId,
      });
    }
  }

  const modalTree = (
    <div className={styles.backdrop} onClick={handleModalCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>
          {isEdit ? `${t("timer.editSession")}` : `${t("timer.startSession")}`}
        </h2>

        <FocusModeSelector value={uiFocusMode} onChange={handleFocusModeChange} />
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

        {!isEdit && planningRec.item ? (
          <div className={styles.planHint}>
            <p className={styles.planHintTitle}>{t("timer.planRecommendation")}</p>
            <p className={styles.planHintMeta}>
              {planningRec.state === "active"
                ? t("timer.planNow")
                : t("timer.planNext")}{" "}
              • {planningRec.item.startTime}-{planningRec.item.endTime} •{" "}
              {getPlanningItemDurationMinutes(planningRec.item)} min
            </p>
            <p className={styles.planHintName}>{planningRec.item.title}</p>
            <button
              type="button"
              className={styles.planHintBtn}
              onClick={applyPlanningRecommendation}
            >
              {t("timer.planUse")}
            </button>
          </div>
        ) : null}

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
                  <button
                    type="button"
                    className={styles.alarmValuePreviewBtn}
                    onClick={() => openWheelPicker(alarmTotalSeconds <= 0)}
                    aria-label={t("timer.alarmTime")}
                  >
                    <span className={styles.alarmValuePreview}>
                      {toPaddedString(alarmHours)}h :{" "}
                      {toPaddedString(alarmMinutes)}m :{" "}
                      {toPaddedString(alarmSeconds)}s
                    </span>
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

          <Button
            label={t("timer.cancel")}
            variant="stop"
            onClick={handleModalCancel}
          />
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
                      onScroll={(e) => {
                        handleWheelScroll(e, 99, setDraftHours);
                      }}
                      onPointerDown={(e) =>
                        startMouseDrag(e, hoursRef, hoursDragRef)
                      }
                      onPointerMove={(e) =>
                        moveMouseDrag(
                          e,
                          hoursRef,
                          hoursDragRef,
                          99,
                          setDraftHours,
                        )
                      }
                      onPointerUp={() =>
                        endMouseDrag(hoursRef, hoursDragRef, 99, setDraftHours)
                      }
                      onPointerCancel={() =>
                        endMouseDrag(hoursRef, hoursDragRef, 99, setDraftHours)
                      }
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
                      onScroll={(e) => {
                        handleWheelScroll(e, 59, setDraftMinutes);
                      }}
                      onPointerDown={(e) =>
                        startMouseDrag(e, minutesRef, minutesDragRef)
                      }
                      onPointerMove={(e) =>
                        moveMouseDrag(
                          e,
                          minutesRef,
                          minutesDragRef,
                          59,
                          setDraftMinutes,
                        )
                      }
                      onPointerUp={() =>
                        endMouseDrag(
                          minutesRef,
                          minutesDragRef,
                          59,
                          setDraftMinutes,
                        )
                      }
                      onPointerCancel={() =>
                        endMouseDrag(
                          minutesRef,
                          minutesDragRef,
                          59,
                          setDraftMinutes,
                        )
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
                      onScroll={(e) => {
                        handleWheelScroll(e, 59, setDraftSeconds);
                      }}
                      onPointerDown={(e) =>
                        startMouseDrag(e, secondsRef, secondsDragRef)
                      }
                      onPointerMove={(e) =>
                        moveMouseDrag(
                          e,
                          secondsRef,
                          secondsDragRef,
                          59,
                          setDraftSeconds,
                        )
                      }
                      onPointerUp={() =>
                        endMouseDrag(
                          secondsRef,
                          secondsDragRef,
                          59,
                          setDraftSeconds,
                        )
                      }
                      onPointerCancel={() =>
                        endMouseDrag(
                          secondsRef,
                          secondsDragRef,
                          59,
                          setDraftSeconds,
                        )
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

  if (typeof document === "undefined") {
    return modalTree;
  }

  return createPortal(modalTree, document.body);
}

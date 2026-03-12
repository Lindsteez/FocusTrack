import { useEffect, useMemo, useRef, useState } from "react";
import Card from "../Card";
import Button from "../Button";
import Timer from "./Timer.tsx";
import SaveTimeModal from "./SaveTimeModal";
import StartSessionModal from "./StartSessionModal";
import {
  clearTimerState,
  loadTimerState,
  saveTimerState,
} from "../../utils/timerStore";
import { addSession } from "../../utils/sessionsStore";
import { useLanguage } from "../../hooks/useLanguage.tsx";
import styles from "./Timer.module.css";
import jingleUrl from "../../assets/audio/jingle.mp3";

function computeElapsedSeconds(
  { isRunning, startedAt, accumulatedSeconds },
  nowMs,
) {
  if (!isRunning) return accumulatedSeconds;
  const elapsed = Math.floor((nowMs - startedAt) / 1000);
  return accumulatedSeconds + Math.max(0, elapsed);
}

function splitToHms(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  return {
    hours: Math.floor(safe / 3600),
    minutes: Math.floor((safe % 3600) / 60),
    seconds: safe % 60,
  };
}

export default function TimerSection() {
  const stored = loadTimerState();
  const { t } = useLanguage();
  const initialAlarm = splitToHms(stored?.targetSeconds ?? 0);

  const [isRunning, setIsRunning] = useState(stored?.isRunning ?? false);
  const [startedAt, setStartedAt] = useState(
    () => stored?.startedAt ?? Date.now(),
  );
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(
    stored?.accumulatedSeconds ?? 0,
  );
  const [timerMode, setTimerMode] = useState(stored?.timerMode ?? "up");
  const [targetSeconds, setTargetSeconds] = useState(
    stored?.targetSeconds ?? 0,
  );
  const [alarmHours, setAlarmHours] = useState(
    stored?.alarmHours ?? initialAlarm.hours,
  );
  const [alarmMinutes, setAlarmMinutes] = useState(
    stored?.alarmMinutes ?? initialAlarm.minutes,
  );
  const [alarmSeconds, setAlarmSeconds] = useState(
    stored?.alarmSeconds ?? initialAlarm.seconds,
  );
  const [alarmPlayed, setAlarmPlayed] = useState(false);
  const [alarmDoneVisible, setAlarmDoneVisible] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(stored?.focusMode ?? "-");
  const [energyLevel, setEnergyLevel] = useState(stored?.energyLevel ?? null);
  const [sessionLabel, setSessionLabel] = useState(stored?.sessionLabel ?? "");

  const [nowMs, setNowMs] = useState(() => Date.now());
  const alarmAudioRef = useRef(null);
  const alarmAudioBlobUrlRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function initAlarmAudio() {
      const audio = new Audio();
      audio.preload = "auto";

      try {
        // Loading via blob URL avoids flaky range/caching failures (e.g. HTTP 416 in dev).
        const response = await fetch(jingleUrl, { cache: "no-store" });
        if (!response.ok)
          throw new Error(`Failed to load jingle: ${response.status}`);

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        if (cancelled) {
          URL.revokeObjectURL(blobUrl);
          return;
        }

        alarmAudioBlobUrlRef.current = blobUrl;
        audio.src = blobUrl;
      } catch {
        // Fallback to direct URL if fetch/blob fails for any reason.
        if (cancelled) return;
        audio.src = jingleUrl;
      }

      if (cancelled) return;
      audio.load();
      alarmAudioRef.current = audio;
    }

    initAlarmAudio();

    return () => {
      cancelled = true;

      if (!alarmAudioRef.current) return;
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;

      if (alarmAudioBlobUrlRef.current) {
        URL.revokeObjectURL(alarmAudioBlobUrlRef.current);
        alarmAudioBlobUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => setNowMs(Date.now()), 250);

    const onVis = () => {
      if (document.visibilityState === "visible") setNowMs(Date.now());
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [isRunning]);

  const elapsedSeconds = useMemo(() => {
    return computeElapsedSeconds(
      { isRunning, startedAt, accumulatedSeconds },
      nowMs,
    );
  }, [isRunning, startedAt, accumulatedSeconds, nowMs]);

  const seconds = useMemo(() => {
    if (timerMode === "down")
      return Math.max(targetSeconds - elapsedSeconds, 0);
    return elapsedSeconds;
  }, [timerMode, targetSeconds, elapsedSeconds]);

  const sessionSeconds = useMemo(() => {
    if (timerMode === "down") return Math.min(elapsedSeconds, targetSeconds);
    return elapsedSeconds;
  }, [timerMode, targetSeconds, elapsedSeconds]);

  const progressRatio = useMemo(() => {
    if (timerMode === "down") {
      if (targetSeconds <= 0) return 0;
      return seconds / targetSeconds;
    }

    const CYCLE_SECONDS = 60 * 60;
    return (seconds % CYCLE_SECONDS) / CYCLE_SECONDS;
  }, [timerMode, targetSeconds, seconds]);

  useEffect(() => {
    saveTimerState({
      isRunning,
      startedAt,
      accumulatedSeconds,
      focusMode,
      energyLevel,
      sessionLabel,
      timerMode,
      targetSeconds,
      alarmHours,
      alarmMinutes,
      alarmSeconds,
    });
  }, [
    isRunning,
    startedAt,
    accumulatedSeconds,
    focusMode,
    energyLevel,
    sessionLabel,
    timerMode,
    targetSeconds,
    alarmHours,
    alarmMinutes,
    alarmSeconds,
  ]);

  async function playAlarmJingle() {
    const audio = alarmAudioRef.current;
    if (!audio) return;

    try {
      audio.currentTime = 0;
      await audio.play();
    } catch {
      // Ignore autoplay restrictions.
    }
  }

  useEffect(() => {
    if (timerMode !== "down") return;
    if (!isRunning) return;
    if (seconds !== 0) return;
    if (alarmPlayed) return;

    setAccumulatedSeconds(targetSeconds);
    setIsRunning(false);
    setAlarmPlayed(true);
    setAlarmDoneVisible(true);
    playAlarmJingle();
    setIsModalOpen(true);
  }, [timerMode, isRunning, seconds, targetSeconds, alarmPlayed]);

  function stopAndOpenModal() {
    const snapElapsed = computeElapsedSeconds(
      { isRunning, startedAt, accumulatedSeconds },
      Date.now(),
    );
    const snapSessionSeconds =
      timerMode === "down" ? Math.min(snapElapsed, targetSeconds) : snapElapsed;

    if (snapSessionSeconds === 0) return;

    setAccumulatedSeconds(snapElapsed);
    setIsRunning(false);
    setIsModalOpen(true);
  }

  function resetTimer() {
    setIsRunning(false);
    setAccumulatedSeconds(0);
    setTargetSeconds(0);
    setTimerMode("up");
    setStartedAt(Date.now());
    clearTimerState();
    setNowMs(Date.now());

    setAlarmPlayed(false);
    setAlarmDoneVisible(false);
    setAlarmHours(0);
    setAlarmMinutes(0);
    setAlarmSeconds(0);

    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }

    setEnergyLevel(null);
    setSessionLabel("");
    setFocusMode("-");
  }

  return (
    <>
      <Card title="Timer">
        <div className={styles.timerLayout}>
          <div className={styles.ringCol}>
            <div className={styles.ringBox}>
              <Timer seconds={seconds} progressRatio={progressRatio} />
            </div>
          </div>

          <div className={styles.controlsCol}>
            <div className={styles.buttonRow}>
              <div className={styles.actions}>
                <Button
                  label={
                    isRunning
                      ? `⏸ ${t("timer.pause")}`
                      : `► ${t("timer.start")}`
                  }
                  variant={isRunning ? "pause" : "start"}
                  onClick={() => {
                    if (isRunning) {
                      setAccumulatedSeconds(elapsedSeconds);
                      setIsRunning(false);
                      return;
                    }

                    if (
                      elapsedSeconds > 0 &&
                      (timerMode !== "down" || seconds > 0)
                    ) {
                      setStartedAt(Date.now());
                      setIsRunning(true);
                      return;
                    }

                    setEnergyLevel(null);
                    setSessionLabel("");
                    setAlarmPlayed(false);
                    setAlarmDoneVisible(false);
                    setIsStartModalOpen(true);
                  }}
                />

                <Button
                  label={`■ ${t("timer.stop")}`}
                  variant="stop"
                  onClick={stopAndOpenModal}
                  disabled={sessionSeconds === 0}
                />
              </div>
            </div>

            <div className={styles.timerMeta}>
              {t("timer.mode")}: <b>{focusMode}</b> • {t("timer.energy")}:{" "}
              <b>{energyLevel ?? "-"}</b> • {t("timer.timerType")}:{" "}
              <b>
                {timerMode === "down"
                  ? t("timer.countDown")
                  : t("timer.countUp")}
              </b>
            </div>

            {alarmDoneVisible && timerMode === "down" ? (
              <div className={styles.timerMeta}>
                <b>{t("timer.timeUp")}</b>
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <SaveTimeModal
        isOpen={isModalOpen}
        seconds={sessionSeconds}
        onDiscardConfirm={() => {
          setIsModalOpen(false);
          resetTimer();
        }}
        onSaveConfirm={(rating) => {
          const label = sessionLabel.trim();

          addSession({
            seconds: sessionSeconds,
            description: label.length > 0 ? label : "(no label)",
            note: `Energy: ${energyLevel ?? "-"}`,
            focusMode,
            energyLevel,
            label,
            rating,
          });

          setIsModalOpen(false);
          resetTimer();
        }}
      />

      <StartSessionModal
        isOpen={isStartModalOpen}
        focusMode={focusMode}
        energyLevel={energyLevel}
        label={sessionLabel}
        onChangeFocusMode={setFocusMode}
        onChangeEnergyLevel={setEnergyLevel}
        onChangeLabel={setSessionLabel}
        timerMode={timerMode}
        onChangeTimerMode={setTimerMode}
        alarmHours={alarmHours}
        alarmMinutes={alarmMinutes}
        alarmSeconds={alarmSeconds}
        onChangeAlarmHours={setAlarmHours}
        onChangeAlarmMinutes={setAlarmMinutes}
        onChangeAlarmSeconds={setAlarmSeconds}
        onCancel={() => setIsStartModalOpen(false)}
        onConfirm={(payload = {}) => {
          const selectedMode = payload.timerMode ?? "up";
          const selectedTargetSeconds = payload.targetSeconds ?? 0;

          setIsStartModalOpen(false);
          setTimerMode(selectedMode);
          setTargetSeconds(selectedMode === "down" ? selectedTargetSeconds : 0);
          setAccumulatedSeconds(0);
          setStartedAt(Date.now());
          setAlarmPlayed(false);
          setAlarmDoneVisible(false);

          if (selectedMode === "up") {
            setAlarmHours(0);
            setAlarmMinutes(0);
            setAlarmSeconds(0);
          }

          setIsRunning(true);
        }}
      />
    </>
  );
}

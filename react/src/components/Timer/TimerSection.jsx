import { useEffect, useMemo, useRef, useState } from "react";
import Card from "../Card";
import Button from "../Button";
import Timer from "./Timer.tsx";
import SaveTimeModal from "./SaveTimeModal";
import StartSessionModal from "./StartSessionModal";
import styles from "./TimerSection.module.css";
import { addSession } from "../../utils/sessionsStore";
import {
  clearTimerState,
  loadTimerState,
  saveTimerState,
} from "../../utils/timerStore";
import { useLanguage } from "../../hooks/useLanguage.tsx";
import jingleUrl from "../../assets/audio/jingle.mp3";

// Calculate total seconds based on timestamps
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
  // Load persisted timer state once
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

  // State for start-session modal
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(stored?.focusMode ?? "-");
  const [energyLevel, setEnergyLevel] = useState(stored?.energyLevel ?? null);
  const [sessionLabel, setSessionLabel] = useState(stored?.sessionLabel ?? "");

  // "now" is only for re-rendering the UI; correctness comes from timestamps.
  const [nowMs, setNowMs] = useState(() => Date.now());
  const alarmAudioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(jingleUrl);
    audio.preload = "auto";
    alarmAudioRef.current = audio;

    return () => {
      if (!alarmAudioRef.current) return;
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    };
  }, []);

  // Update now periodically while running (frequency not important for correctness)
  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => setNowMs(Date.now()), 250);

    // Also update immediately when tab becomes visible again
    const onVis = () => {
      if (document.visibilityState === "visible") setNowMs(Date.now());
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [isRunning]);

  // Derived seconds shown on screen
  const elapsedSeconds = useMemo(() => {
    return computeElapsedSeconds(
      { isRunning, startedAt, accumulatedSeconds },
      nowMs,
    );
  }, [isRunning, startedAt, accumulatedSeconds, nowMs]);

  const seconds = useMemo(() => {
    if (timerMode === "down") {
      return Math.max(targetSeconds - elapsedSeconds, 0);
    }
    return elapsedSeconds;
  }, [timerMode, targetSeconds, elapsedSeconds]);

  const sessionSeconds = useMemo(() => {
    if (timerMode === "down") {
      return Math.min(elapsedSeconds, targetSeconds);
    }
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

  // Persist whenever the core timer state changes
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
      // Ignore autoplay-block errors silently; we still complete the session flow.
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
    // Calculate seconds (avoid waiting for UI tick)
    const snapElapsed = computeElapsedSeconds(
      { isRunning, startedAt, accumulatedSeconds },
      Date.now(),
    );
    const snapSessionSeconds =
      timerMode === "down" ? Math.min(snapElapsed, targetSeconds) : snapElapsed;

    if (snapSessionSeconds === 0) return;

    // Freeze time into accumulatedSeconds and stop
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

    // Reset session metadata for next NEW session
    setEnergyLevel(null);
    setSessionLabel("");
    setFocusMode("-");
  }

  return (
    <>
      <Card title="Timer">
        <Timer seconds={seconds} progressRatio={progressRatio} />

        <div className="buttonRow">
          <Button
            label={
              isRunning ? `⏸ ${t("timer.pause")}` : `► ${t("timer.start")}`
            }
            variant={isRunning ? "pause" : "start"}
            onClick={() => {
              if (isRunning) {
                // PAUSE
                setAccumulatedSeconds(elapsedSeconds);
                setIsRunning(false);
                return;
              }

              if (elapsedSeconds > 0 && (timerMode !== "down" || seconds > 0)) {
                // RESUME paused timer
                setStartedAt(Date.now());
                setIsRunning(true);
                return;
              }

              // NEW session → open start modal
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

        {alarmDoneVisible && timerMode === "down" && (
          <div className={styles.alarmDone}>{t("timer.timeUp")}</div>
        )}

        {/* Show selected mode and energy while running */}
        <div className={styles.sessionMeta}>
          {t("timer.mode")}: <b>{focusMode}</b> • {t("timer.energy")}:{" "}
          <b>{energyLevel ?? "-"}</b> • {t("timer.timerType")}:{" "}
          <b>
            {timerMode === "down" ? t("timer.countDown") : t("timer.countUp")}
          </b>
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
        onConfirm={({
          timerMode: selectedMode,
          targetSeconds: selectedTargetSeconds,
        }) => {
          setIsStartModalOpen(false);
          setTimerMode(selectedMode);
          setTargetSeconds(selectedMode === "down" ? selectedTargetSeconds : 0);
          setAccumulatedSeconds(0);
          setStartedAt(Date.now());
          setAlarmPlayed(false);
          setAlarmDoneVisible(false);
          setIsRunning(true);
        }}
      />
    </>
  );
}

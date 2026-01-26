import { useEffect, useMemo, useState } from "react";
import Card from "./Card";
import Button from "./Button";
import Timer from "./Timer";
import SaveTimeModal from "./SaveTimeModal";
import FocusModeSelector from "./FocusModeSelector";
import { addSession } from "../utils/sessionsStore";
import { clearTimerState, loadTimerState, saveTimerState } from "../utils/timerStore";

function computeSeconds({ isRunning, startedAt, accumulatedSeconds }, nowMs) {
  if (!isRunning) return accumulatedSeconds;
  const elapsed = Math.floor((nowMs - startedAt) / 1000);
  return accumulatedSeconds + Math.max(0, elapsed);
}

export default function TimerSection() {
  // Load persisted timer state once
  const stored = loadTimerState();

  const [isRunning, setIsRunning] = useState(stored?.isRunning ?? false);
  const [startedAt, setStartedAt] = useState(() => stored?.startedAt ?? Date.now());
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(stored?.accumulatedSeconds ?? 0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // "now" is only for re-rendering the UI; correctness comes from timestamps.
  const [nowMs, setNowMs] = useState(() => Date.now());

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
  const seconds = useMemo(() => {
    return computeSeconds({ isRunning, startedAt, accumulatedSeconds }, nowMs);
  }, [isRunning, startedAt, accumulatedSeconds, nowMs]);

  // Persist whenever the core timer state changes
  useEffect(() => {
    saveTimerState({ isRunning, startedAt, accumulatedSeconds });
  }, [isRunning, startedAt, accumulatedSeconds]);

  function start() {
    // Start counting from "now", keep any accumulated time
    setStartedAt(Date.now());
    setIsRunning(true);
  }

  function stopAndOpenModal() {
    if (seconds === 0) return;

    // Freeze time into accumulatedSeconds and stop
    setAccumulatedSeconds(seconds);
    setIsRunning(false);
    setIsModalOpen(true);
  }

  function resetTimer() {
    setIsRunning(false);
    setAccumulatedSeconds(0);
    setStartedAt(Date.now());
    clearTimerState();
    setNowMs(Date.now());
  }

  return (
    <>
      <Card title="Timer">
        <FocusModeSelector />
        
        <Timer seconds={seconds} />

        <div className="buttonRow">
          <Button
            label="► Start"
            variant="start"
            onClick={start}
            disabled={isRunning}
          />

          <Button
            label="■ Stop"
            variant="stop"
            onClick={stopAndOpenModal}
            disabled={!isRunning || seconds === 0}
          />
        </div>
      </Card>

      <SaveTimeModal
        isOpen={isModalOpen}
        seconds={seconds}
        onClose={() => setIsModalOpen(false)}
        onDiscardConfirm={() => {
          setIsModalOpen(false);
          resetTimer();
        }}
        onSaveConfirm={(payload) => {
          addSession({
            seconds,
            description: payload.description,
            category: payload.category,
          });

          setIsModalOpen(false);
          resetTimer();
        }}
      />
    </>
  );
}

import { useEffect, useMemo, useState } from "react";
import Card from "./Card";
import Button from "./Button";
import Timer from "./Timer";
import SaveTimeModal from "./SaveTimeModal";
import StartSessionModal from "./StartSessionModal";
import { addSession } from "../utils/sessionsStore";
import { clearTimerState, loadTimerState, saveTimerState } from "../utils/timerStore";

// Calculate total seconds based on timestamps
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

  // State for start-session modal
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [focusMode, setFocusMode] = useState("Deep work");
  const [energyLevel, setEnergyLevel] = useState(null);

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

function stopAndOpenModal() {
  // Calculate seconds (avoid waiting for UI tick)
  const snapSeconds = computeSeconds(
    { isRunning, startedAt, accumulatedSeconds },
    Date.now()
  );

  if (snapSeconds === 0) return;

  // Freeze time into accumulatedSeconds and stop
  setAccumulatedSeconds(snapSeconds);
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
        <Timer seconds={seconds} />

        <div className="buttonRow">
          <Button
            label={isRunning ? "⏸ Pause" : "► Start"}
            variant={isRunning ? "pause" : "start"}
            onClick={() => {
              if (isRunning) {
                // PAUSE
                setAccumulatedSeconds(seconds);
                setIsRunning(false);
                return;
              }

              if (seconds > 0) {
                // RESUME paused timer
                setStartedAt(Date.now());
                setIsRunning(true);
                return;
              }

              // NEW session → open start modal
              setEnergyLevel(null);
              setIsStartModalOpen(true);
            }}
          />

          <Button
            label="■ Stop"
            variant="stop"
            onClick={stopAndOpenModal}
            disabled={seconds === 0} // allow stop even if paused

          />
        </div>

        {/* Show selected mode and energy while running */}
        <div style={{ marginTop: 8, opacity: 0.8 }}>
          Mode: <b>{focusMode}</b> • Energy: <b>{energyLevel ?? "-"}</b>
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
            energyLevel: energyLevel ?? 0,
            description: `${payload.description} • Mode: ${focusMode} • Energy: ${energyLevel ?? "-"}`,
            category: payload.category,
          });

          setIsModalOpen(false);
          resetTimer();
        }}
      />

      <StartSessionModal
        isOpen={isStartModalOpen}
        focusMode={focusMode}
        energyLevel={energyLevel}
        onChangeFocusMode={setFocusMode}
        onChangeEnergyLevel={setEnergyLevel}
        onCancel={() => setIsStartModalOpen(false)}
        onConfirm={() => {
          setIsStartModalOpen(false);
          setStartedAt(Date.now());
          setIsRunning(true);
        }}
      />
    </>
  );
}

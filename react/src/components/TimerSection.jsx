import { useCallback, useState } from "react";
import Card from "./Card";
import Button from "./Button";
import Timer from "./Timer";
import SaveTimeModal from "./SaveTimeModal";
import { addSession } from "../utils/sessionsStore";

export default function TimerSection() {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tick = useCallback(() => {
    setSeconds((prev) => prev + 1);
  }, []);

  function resetTimer() {
    setSeconds(0);
    setIsRunning(false);
  }

  function openStopModal() {
    if (seconds === 0) return;
    setIsRunning(false);
    setIsModalOpen(true);
  }

  return (
    <>
      <Card title="Timer">
        <Timer seconds={seconds} isRunning={isRunning} onTick={tick} />

        <div className="buttonRow">
          <Button
            label="► Start"
            variant="start"
            onClick={() => setIsRunning(true)}
            disabled={isRunning}
          />

          <Button
            label="■ Stop"
            variant="stop"
            onClick={openStopModal}
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

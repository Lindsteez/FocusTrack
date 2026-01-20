import { useCallback, useState } from "react";
import "./App.css";
import Button from "./components/Button";
import Card from "./components/Card";
import MobileLayout from "./components/MobileLayout";
import Timer from "./components/Timer";
import SaveTimeModal from "./components/SaveTimeModal";

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // controls ONLY whether the modal is open or not
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
      <MobileLayout />

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
          // payload = { description, category }
          // Next step: store payload + seconds in localStorage for the History page.
          console.log(payload);
          setIsModalOpen(false);
          resetTimer();
        }}
      />
    </>
  );
}

export default App;

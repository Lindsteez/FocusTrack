import { useState } from "react";
import Card from "./Card";
import Button from "./Button";

export default function SaveTimeModal({ isOpen, seconds, onDiscardConfirm, onSaveConfirm }) {
  const [mode, setMode] = useState("confirmSave"); // confirmSave | confirmDiscard

  if (!isOpen) return null;

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalBox">
        {mode === "confirmSave" && (
          <Card title="Save time?">
            <p>Would you like to save this time?</p>

            <div className="modalButtons">
              <Button
                label="Yes"
                variant="start"
                disabled={seconds === 0}
                onClick={() => {
                  setMode("confirmSave"); // reset for next open
                  onSaveConfirm();
                }}
              />
              <Button label="No" variant="stop" onClick={() => setMode("confirmDiscard")} />
            </div>
          </Card>
        )}

        {mode === "confirmDiscard" && (
          <Card title="Are you sure?">
            <p>This will discard the time.</p>

            <div className="modalButtons">
              <Button
                label="Yes"
                variant="start"
                onClick={() => {
                  setMode("confirmSave"); // reset for next open
                  onDiscardConfirm();
                }}
              />
              <Button
                label="No"
                variant="stop"
                onClick={() => setMode("confirmSave")}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

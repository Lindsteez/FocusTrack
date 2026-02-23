import { useState } from "react";
import Card from "../Card";
import Button from "../Button";
import styles from "./SaveTimeModal.module.css";

export default function SaveTimeModal({ isOpen, seconds, onDiscardConfirm, onSaveConfirm }) {
  const [mode, setMode] = useState("confirmSave"); // confirmSave | confirmDiscard | rateSession

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
                  setMode("rateSession"); // skickar vidare till rating
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

          {mode === "rateSession" && (
            <Card title="How did it feel?">
              <div className={styles.emojiRow}>
                {[
                  { value: 1, emoji: "😩" },
                  { value: 2, emoji: "😕" },
                  { value: 3, emoji: "😐" },
                  { value: 4, emoji: "🙂" },
                  { value: 5, emoji: "🔥" },
                ].map(e => (
                  <button
                    key={e.value}
                    className={styles.emojiButton}
                    onClick={() => {
                      onSaveConfirm(e.value);
                      setMode("confirmSave");
                    }}
                  >
                    {e.emoji}
                  </button>
                ))}
              </div>
            </Card>
          )}
      </div>
    </div>
  );
}

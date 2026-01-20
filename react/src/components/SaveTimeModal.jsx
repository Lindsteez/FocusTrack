import { useState } from "react";
import Card from "./Card";
import Button from "./Button";

export default function SaveTimeModal({
  isOpen,
  seconds,
  onDiscardConfirm,
  onSaveConfirm,
}) {
  const [mode, setMode] = useState("confirmSave"); // confirmSave | confirmDiscard | saveForm
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("work");

  if (!isOpen) return null;

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalBox">
        {mode === "confirmSave" && (
          <Card title="Save time?">
            <p>Would you like to save this time?</p>

            <div className="modalButtons">
              <Button
                label="No"
                variant="stop"
                onClick={() => setMode("confirmDiscard")}
              />
              <Button
                label="Yes"
                variant="start"
                onClick={() => setMode("saveForm")}
              />
            </div>
          </Card>
        )}

        {mode === "confirmDiscard" && (
          <Card title="Are you sure?">
            <p>This will discard the time.</p>

            <div className="modalButtons">
              <Button
                label="No"
                variant="start"
                onClick={() => setMode("confirmSave")}
              />
              <Button
                label="Yes"
                variant="stop"
                onClick={() => {
                  setMode("confirmSave");
                  setDescription("");
                  setCategory("work");
                  onDiscardConfirm();
                }}
              />
            </div>
          </Card>
        )}

        {mode === "saveForm" && (
          <Card title="Save entry">
            <label style={{ display: "block", marginBottom: "12px" }}>
              What was it?
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='e.g. "Dusting"'
                style={{
                  width: "100%",
                  marginTop: "6px",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              />
            </label>

            <label style={{ display: "block", marginBottom: "12px" }}>
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "6px",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                <option value="work">Work</option>
                <option value="hobby">Hobby</option>
                <option value="sports">Sports</option>
                <option value="cooking">Cooking</option>
                <option value="cooking">Cleaning</option>
              </select>
            </label>

            <div className="modalButtons">
              <Button
                label="Cancel"
                variant="stop"
                onClick={() => setMode("confirmSave")}
              />
              <Button
                label="Save"
                variant="start"
                disabled={seconds === 0 || description.trim().length === 0}
                onClick={() => {
                  const payload = {
                    description: description.trim(),
                    category,
                  };
                  setMode("confirmSave");
                  setDescription("");
                  setCategory("work");
                  onSaveConfirm(payload);
                }}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

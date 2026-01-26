import { useState } from "react";

const focusModes = ["Deep work", "Meeting", "Break"];

export default function FocusModeSelector() {
  const [activeMode, setActiveMode] = useState("Deep work");

  return (
    <div>
      <h2>Active mode: {activeMode}</h2>

      <p>Focus modes:</p>
      <div>
        {focusModes.map((mode) => (
          <button
            key={mode}
            onClick={() => setActiveMode(mode)}
            style={{
              fontWeight: activeMode === mode ? "bold" : "normal",
              border:
                activeMode === mode
                  ? "2px solid black"
                  : "1px solid gray",
            }}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
}

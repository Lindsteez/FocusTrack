import { useState } from "react"
import "./FocusModeSelector.css"

const focusModes = ["Deep work", "Meeting", "Break"]

export default function FocusModeSelector() {
  const [activeMode, setActiveMode] = useState("Deep work")

  return (
    <div className="focusMode">
      <p className="focusMode__label">Focus modes</p>

      <div className="focusMode__group" role="tablist" aria-label="Focus modes">
        {focusModes.map((mode) => (
          <button
            key={mode}
            type="button"
            className={`focusMode__btn ${
              activeMode === mode ? "is-active" : ""
            }`}
            onClick={() => setActiveMode(mode)}
          >
            {mode}
          </button>
        ))}
      </div>

      <p className="focusMode__active">
        Active mode: <span>{activeMode}</span>
      </p>
    </div>
  )
}

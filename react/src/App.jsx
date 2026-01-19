import { useState } from "react"
import "./App.css"
import NavbarMobile from "./components/NavbarMobile"

const focusmodes = ["Deep work", "Meeting", "Break"]

function App() {
  const [activeMode, setActiveMode] = useState("Deep work")

  return (
    <div className="App">
      <NavbarMobile
        focusmodes={focusmodes}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
      />

      <h2>Active mode: {activeMode}</h2>

      <p>Focus modes:</p>
      <div>
        {focusmodes.map((mode) => (
         <button
       key={mode}
        onClick={() => setActiveMode(mode)}
         style={{
      fontWeight: activeMode === mode ? "bold" : "normal",
      border: activeMode === mode ? "2px solid black" : "1px solid gray"
    }}
  >
    {mode}
  </button>
))}

      </div>
    </div>
  )
}

export default App

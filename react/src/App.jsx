<<<<<<< HEAD
// import { useEffect, useState } from 'react'
import './App.css'
import Button from './components/Button'
import Card from './components/Card'
import AppLayout from './components/AppLayout'
// import Navbar from './components/Navbar'
import NavbarMobile from './components/NavbarMobile/NavbarMobile'
import EnergyLog from './components/EnergyLog/EnergyLog'

function App() {
  return (    
  
  <div className="App">
    <AppLayout>
      <Card title="Timer">
        <Button 
            label = "Start ►"
            variant = "start"
        />
         <Button 
            label = "Stop ■"
            variant = "stop"
        />
      </Card>
    </AppLayout>

    <EnergyLog />
    <NavbarMobile />
  </div>
=======
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
>>>>>>> 1a42c6d (WIP: select focus mode)
  )
}

export default App
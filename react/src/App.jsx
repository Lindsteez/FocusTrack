import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import NavbarMobile from './components/NavbarMobile'
import EnergyLog from './components/EnergyLog/EnergyLog'

function App() {

  return (
    <div className="App">
      <EnergyLog />
      <NavbarMobile />
    </div>
  )
}

export default App

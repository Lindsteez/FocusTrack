// import { useEffect, useState } from 'react'
import './App.css'
import Button from './components/Button'
import Card from './components/Card'
import AppLayout from './components/AppLayout'
// import Navbar from './components/Navbar'
import NavbarMobile from './components/NavbarMobile'
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
  )
}

export default App
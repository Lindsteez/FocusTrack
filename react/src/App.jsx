import { startTransition, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import NavbarMobile from './components/NavbarMobile'
import Button from './components/Button'
import Card from './components/Card'

function App() {

  return (
    <>

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

      <div className="App">
        <NavbarMobile />
      </div>

    </>
  )
}

export default App

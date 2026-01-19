import { startTransition, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import NavbarMobile from './components/NavbarMobile'
import Button from './components/Button'
import Card from './components/Card'
import MobileLayout from './components/MobileLayout'

function App() {

  return (
    <>
  
      <MobileLayout />
        

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


    </>
  )
}

export default App

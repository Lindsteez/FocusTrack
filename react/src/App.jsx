import { useEffect, useState } from 'react'
import './App.css'
import Button from './components/Button'
import Card from './components/Card'
import AppLayout from './components/AppLayout'

function App() {
  return (
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
  )
}

export default App
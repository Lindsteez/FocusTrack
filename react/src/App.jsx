import { startTransition, useState } from 'react'
import './App.css'
import Button from './components/Button'
import Card from './components/Card'
import MobileLayout from './components/MobileLayout'
import Timer from './components/Timer'

function App() {

  const [isRunning, setIsRunning] = useState(false);

  return (
    <>
  
      <MobileLayout />
        

      <Card title="Timer">
        <Timer isRunning={isRunning} />
        
        <div className="buttonRow">
          <Button 
              label = "► Start"
              variant = "start"
              onClick = {() => setIsRunning(true)}
              disabled = {isRunning}
          />
          <Button 
              label = "■ Stop"
              variant = "stop"
              onClick = {() => setIsRunning(false)}
              disabled = {!isRunning}
          />
        </div>
      </Card>


    </>
  )
}

export default App

// import { useEffect, useState } from 'react'
import './App.css'
import AppLayout from './components/AppLayout'
import EnergyLog from './components/EnergyLog/EnergyLog'
import TimerSection from "./components/TimerSection";
import RecentSessions from "./components/RecentSessions";

function App() {
  return (    
  
  <div className="App">
    <AppLayout>
      
      <div className="dashboardStack">
        <TimerSection />
        <RecentSessions />
        <EnergyLog />
      </div>
    
    </AppLayout>
  </div>
  )
}

export default App
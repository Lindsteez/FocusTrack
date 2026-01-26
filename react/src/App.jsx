
import { useEffect, useState } from 'react'
import './App.css'
import Button from './components/Button'
import Card from './components/Card'
import AppLayout from './components/AppLayout'
import TimerSection from "./components/TimerSection";
import RecentSessions from "./components/RecentSessions";

function App() {
  return (
    <AppLayout>
      <div className="dashboardStack">
        <TimerSection />
        <RecentSessions />
      </div>
    </AppLayout>
  )
}

export default App
import TimerSection from '../components/TimerSection'
import RecentSessions from '../components/RecentSessions'
import EnergyLog from '../components/EnergyLog/EnergyLog'
import '../App.css'

export default function Dashboard() {
  return (
    <div className="dashboardStack">
      <TimerSection />
      <RecentSessions />
      <EnergyLog />
    </div>
  )
}
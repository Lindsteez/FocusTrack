import TimerSection from '../components/TimerSection'
import RecentSessions from '../components/RecentSessions'
import EnergyLog from '../components/EnergyLog/EnergyLog'
import '../App.css'
import Last5DaysBarChart from '../components/Last5DaysBarChart'

export default function Dashboard() {
  return (
    <div className="dashboardStack">
      <TimerSection />
      <RecentSessions />
      <Last5DaysBarChart />
    </div>
  )
}
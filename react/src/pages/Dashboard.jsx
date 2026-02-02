import TimerSection from '../components/Timer/TimerSection'
import RecentSessions from '../components/RecentSessions'
import EnergyLog from '../components/EnergyLog/EnergyLog'
import '../App.css'
import Last5DaysBarChart from '../components/Last5DaysBarChart'

export default function Dashboard() {
  return (
    
    <div className="dashboardStack grid">

{/* ========= Vänster kolumn ========= */}
    <div className="leftGrid">
        <div className='box timer'>
          <TimerSection />
        </div>

      </div>


{/* ========= 'Höger kolumn ========= */}

      <div className='box recent'>
        <RecentSessions />
      </div>

      <div className="box chart">
        <Last5DaysBarChart />
      </div>
    </div>
  )
}
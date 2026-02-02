import TimerSection from '../components/Timer/TimerSection'
import RecentSessions from '../components/RecentSessions'
import EnergyLog from '../components/EnergyLog/EnergyLog'
import '../App.css'

export default function Dashboard() {
  return (
    <div className="dashboardStack grid">

{/* ========= Vänster kolumn ========= */}
    <div className="leftGrid">
        <div className='box timer'>
          <TimerSection />
        </div>

        <div className='box stats'>
          <h1>stat</h1>
        </div>
      </div>


{/* ========= 'Höger kolumn ========= */}

      <div className='box recent'>
        <RecentSessions />
      </div>


      {/* <EnergyLog /> */}
    </div>
  )
}
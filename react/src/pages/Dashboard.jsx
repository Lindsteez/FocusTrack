import TimerSection from "../components/Timer/TimerSection";
import RecentSessions from "../components/RecentSessions";
import EnergyLog from "../components/EnergyLog/EnergyLog";
import Last5DaysBarChart from "../components/Last5DaysBarChart";
import StatsSummary from "../components/StatsSummary";
import ToDo from "../components/ToDo/ToDo";
import ToDoDesktopOnly from "../components/ToDo/ToDoDesktopOnly";
import "../App.css";

export default function Dashboard() {
  return (
    <div className="dashboardStack grid">
      {/* ========= Vänster kolumn ========= */}
      <div className="leftGrid">
        <div className="box timer">
          <TimerSection />
        </div>

        <div className="box stats">
          <StatsSummary />
        </div>

        <div className="box chart">
          <Last5DaysBarChart />
        </div>
      </div>

      {/* ========= Höger kolumn ========= */}
      <div className="box recent">
        <RecentSessions />
      </div>

      <ToDoDesktopOnly>
        <div className="box todo">
          <ToDo />
        </div>
      </ToDoDesktopOnly>
    </div>
  );
}

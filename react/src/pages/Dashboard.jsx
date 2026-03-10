import TimerSection from "../components/Timer/TimerSection";
import RecentSessions from "../components/RecentSessions";
import EnergyLog from "../components/EnergyLog/EnergyLog";
import Last5DaysBarChart from "../components/Last5DaysBarChart";
import StatsSummary from "../components/StatsSummary";
import ToDo from "./ToDo/ToDo";
import ToDoDesktopOnly from "./ToDo/ToDoDesktopOnly";
import "../App.css";

export default function Dashboard() {
  return (
    <div className="dashboardViewport">
      <div className="dashboardStack grid dashboardFixed">
        {/* ========= Vänster kolumn ========= */}
        <div className="box timer">
          <TimerSection />
        </div>

        {/* ========= Mitten kolumn ========= */}
        <div className="box chart">
          <Last5DaysBarChart />
        </div>
        <div className="box recent">
          <RecentSessions />
        </div>

        {/* ========= Höger kolumn ========= */}
        <div className="box todo">
          <ToDoDesktopOnly>
            <ToDo />
          </ToDoDesktopOnly>
        </div>
      </div>
    </div>
  );
}


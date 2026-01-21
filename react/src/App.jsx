import "./App.css";
import MobileLayout from "./components/MobileLayout";
import TimerSection from "./components/TimerSection";
import RecentSessions from "./components/RecentSessions";

function App() {
  return (
    <>
      <MobileLayout />

      <div className="dashboardStack">
        <TimerSection />
        <RecentSessions />
      </div>
    </>
  );
}

export default App;

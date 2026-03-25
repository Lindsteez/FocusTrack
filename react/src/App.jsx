import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import AppLayout from "./components/AppLayout";
               
import History from "./pages/History";
import Stats from "./pages/Stats";
import Settings from "./pages/settings/Settings";
import ToDo from "./pages/ToDo/ToDo.jsx";
import Planning from "./pages/Planning";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/planning" element={<Planning />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/todo" element={<ToDo />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

import "./App.css";
import NavbarMobile from "./components/NavbarMobile";
import FocusModeSelector from "./components/FocusModeSelector";

function App() {
  return (
    <div className="App">
      <FocusModeSelector />
      <NavbarMobile />
    </div>
  );
}

export default App;

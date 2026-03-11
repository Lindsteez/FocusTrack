import LanguageSwitch from "./languageContext/LanguageSwitch";
import ThemeContextCard from "./themeContext";
import ClearStorageCard from "./resetData/resetData";
import DataTransferCard from "./dataTransfer/DataTransferCard";
import GoalsCard from "./goals/GoalsCard";
import "./themeContext.css";


export default function Settings() {
  return(
    <div className="settingsPage">
      <ThemeContextCard />
      <LanguageSwitch />
      <GoalsCard />
      <DataTransferCard />
      <section className="settings">
        <ClearStorageCard />
      </section>
    </div>
  )
}

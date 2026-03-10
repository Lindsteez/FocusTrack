import LanguageSwitch from "./languageContext/LanguageSwitch";
import ThemeContextCard from "./themeContext";
import ClearStorageCard from "./resetData/resetData";
import DataTransferCard from "./dataTransfer/DataTransferCard";


export default function Settings() {
  return(
    <div className="settingsPage">
      <ThemeContextCard />
      <LanguageSwitch />
      <DataTransferCard />
      <section className="settings">
        <ClearStorageCard />
      </section>
    </div>
  )
}

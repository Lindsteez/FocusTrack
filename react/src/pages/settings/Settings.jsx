import LanguageSwitch from "./languageContext/LanguageSwitch";
import ThemeContextCard from "./themeContext";
import ClearStorageCard from "./resetData/resetData";


export default function Settings() {
  return(
    <div className="settingsPage">
      <ThemeContextCard />
      <LanguageSwitch />
      <section className="settings">
        <ClearStorageCard />
      </section>
    </div>
  )
}

import LanguageSwitch from "./languageContext/LanguageSwitch";
import ThemeContextCard from "./themeContext";
import ClearStorageCard from "./resetData/resetData";


export default function Settings() {
  return(
    <>
    <ThemeContextCard />
    <LanguageSwitch />
    <ClearStorageCard />
    </>
  )
}
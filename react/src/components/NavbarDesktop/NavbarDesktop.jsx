import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../../pages/settings/languageContext/LanguageProvider";

import LogoDark from "../../assets/svg/focustrack-logo.svg";
import LogoLight from "../../assets/svg/focustrack-logo-light.svg";

import styles from "./NavbarDesktop.module.css";

function NavbarDesktop() {
  const { t } = useLanguage();
  const [theme, setTheme] = useState(() => document.body.dataset.theme || "dark");

  useEffect(() => {
    const body = document.body;

    const observer = new MutationObserver(() => {
      setTheme(body.dataset.theme || "dark");
    });

    observer.observe(body, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const logoSrc = theme === "light" ? LogoLight : LogoDark;

  const linkClass = ({ isActive }) =>
    `${styles.link} ${isActive ? styles.active : ""}`;

  return (
    <nav className={styles.navbar}>
      <img className={styles.logo} src={logoSrc} alt="FocusTrack Logo" />

      <NavLink to="/" end className={linkClass}>{t('nav.dashboard')}</NavLink>
      <NavLink to="/history" className={linkClass}>{t('nav.history')}</NavLink>
      {/* <NavLink to="/todo" className={linkClass}>TODO</NavLink> */}
      <NavLink to="/stats" className={linkClass}>{t('nav.stats')}</NavLink>
      <NavLink to="/settings" className={linkClass}>{t('nav.settings')}</NavLink>
    </nav>
  );
}

export default NavbarDesktop;
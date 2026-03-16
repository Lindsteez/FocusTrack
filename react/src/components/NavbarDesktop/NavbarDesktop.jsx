import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";
import useLocalStorage from "../../hooks/useLocalStorage";

import LogoDark from "../../assets/svg/focustrack-logo.svg";
import LogoLight from "../../assets/svg/focustrack-logo-light.svg";

import Weather from "../Weather/Weather"; // <-- add this

import styles from "./NavbarDesktop.module.css";

function NavbarDesktop() {
  const { t } = useLanguage();
  const [theme, setTheme] = useState(() => document.body.dataset.theme || "dark");
  const [alarmMuted, setAlarmMuted] = useLocalStorage("timerAlarmMuted", false);

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
      <NavLink to="/planning" className={linkClass}>{t('nav.planning')}</NavLink>
      {/* <NavLink to="/todo" className={linkClass}>TODO</NavLink> */}
      <NavLink to="/stats" className={linkClass}>{t('nav.stats')}</NavLink>
      <NavLink to="/settings" className={linkClass}>{t('nav.settings')}</NavLink>
      <div className={styles.right}>
        <span className={styles.alarmIcon} aria-hidden="true">
          {alarmMuted ? "🔕" : "🔔"}
        </span>
        <label
          className={styles.alarmSwitch}
          aria-label={alarmMuted ? "Alarm sound muted" : "Alarm sound on"}
          title={alarmMuted ? "Alarm muted" : "Alarm on"}
        >
          <input
            type="checkbox"
            className={styles.alarmSwitchInput}
            checked={alarmMuted}
            onChange={(e) => setAlarmMuted(e.target.checked)}
          />
          <span className={styles.alarmSwitchTrack}>
            <span className={styles.alarmSwitchThumb} />
          </span>
        </label>

        <div className={styles.weather}>
          <Weather />
        </div>
      </div>
    </nav>
  );
}

export default NavbarDesktop;

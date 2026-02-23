import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import LogoDark from "../../assets/svg/focustrack-logo.svg";
import LogoLight from "../../assets/svg/focustrack-logo-light.svg";

import Weather from "../Weather/Weather"; // <-- add this

import styles from "./NavbarDesktop.module.css";

function NavbarDesktop() {
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

      <NavLink to="/" end className={linkClass}>DASHBOARD</NavLink>
      <NavLink to="/history" className={linkClass}>HISTORY</NavLink>
      <NavLink to="/stats" className={linkClass}>STATS</NavLink>
      <NavLink to="/settings" className={linkClass}>SETTINGS</NavLink>

       <div className={styles.weather}>
        <Weather />
      </div>
    </nav>
  );
}

export default NavbarDesktop;

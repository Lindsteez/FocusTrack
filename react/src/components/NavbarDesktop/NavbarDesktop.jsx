import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import LogoDark from "../../assets/svg/focustrack-logo.svg";
import LogoLight from "../../assets/svg/focustrack-logo-light.svg";

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

      <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
      <NavLink to="/history" className={linkClass}>History</NavLink>
      <NavLink to="/todo" className={linkClass}>ToDo</NavLink>
      <NavLink to="/stats" className={linkClass}>Stats</NavLink>
      <NavLink to="/settings" className={linkClass}>Settings</NavLink>
    </nav>
  );
}

export default NavbarDesktop;
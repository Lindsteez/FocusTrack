// components/Logo/LogoMobile.jsx
import { useEffect, useState } from "react";

import LogoDark from "../../assets/svg/focustrack-logo.svg";
import LogoLight from "../../assets/svg/focustrack-logo-light.svg";

import Weather from "../Weather/Weather";

import styles from "./LogoMobile.module.css";

function LogoMobile() {
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

  return (
    <div className={styles.header}>
      <div className={styles.logoWrap}>
        <img className={styles.logoImg} src={logoSrc} alt="FocusTrack Logo" />
      </div>

      <div className={styles.weather}>
        <Weather />
      </div>
    </div>
  );
}

export default LogoMobile;

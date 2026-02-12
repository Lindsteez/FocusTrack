import { useEffect, useState } from "react";

import LogoDark from "../../assets/svg/focustrack-logo.svg";
import LogoLight from "../../assets/svg/focustrack-logo-light.svg";

import styles from "./LogoMobile.module.css";

function LogoImport() {
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
    <div className={styles.img}>
      <img src={logoSrc} alt="FocusTrack Logo" />
    </div>
  );
}

export default LogoImport;
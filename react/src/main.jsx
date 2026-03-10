import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "./hooks/useLanguage.tsx";
import "./index.css";
import "./media.css";
import App from "./App.jsx";

function getSavedTheme() {
  const raw = localStorage.getItem("theme");
  if (!raw) return "dark";

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function applyThemeFromStorage() {
  const theme = getSavedTheme();

  if (theme === "auto") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.body.dataset.theme = prefersDark ? "dark" : "light";
  } else {
    document.body.dataset.theme = theme;
  }
}

applyThemeFromStorage();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    </LanguageProvider>
  </StrictMode>
);

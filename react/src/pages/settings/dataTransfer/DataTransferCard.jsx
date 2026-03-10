import { useRef, useState } from "react";
import { useLanguage } from "../../../hooks/useLanguage";
import {
  exportSessionsAsJson,
  importSessionsFromJsonFile,
} from "../../../utils/sessionsTransfer";
import "../themeContext.css";

export default function DataTransferCard() {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  async function handleImport(mode) {
    if (!selectedFile) {
      window.alert(t("settings.importSelectFileFirst"));
      return;
    }

    try {
      const result = await importSessionsFromJsonFile(selectedFile, mode);
      const successBase =
        mode === "replace"
          ? t("settings.importSuccessReplace")
          : t("settings.importSuccessMerge");
      window.alert(`${successBase} (${result.savedCount})`);

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("settings.importError");
      window.alert(`${t("settings.importError")}: ${message}`);
    }
  }

  return (
    <section className="settings">
      <div className="settings__card">
        <div className="settings__row">
          <div>
            <span className="settings__label">{t("settings.exportData")}</span>
            <p className="settings__description">
              {t("settings.exportDataDescription")}
            </p>
          </div>

          <button
            type="button"
            className="segmented__btn export-json-btn"
            onClick={exportSessionsAsJson}
          >
            {t("settings.exportJsonButton")}
          </button>
        </div>

        <div className="settings__divider" />

        <div className="settings__row">
          <div>
            <span className="settings__label">{t("settings.importData")}</span>
            <p className="settings__description">
              {t("settings.importDataDescription")}
            </p>

            <label className="settings__description import-file-label">
              {t("settings.importFileLabel")}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="import-file-input"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="import-actions">
            <button
              type="button"
              className="segmented__btn import-replace-btn"
              onClick={() => handleImport("replace")}
            >
              {t("settings.importReplaceButton")}
            </button>
            <button
              type="button"
              className="segmented__btn import-merge-btn"
              onClick={() => handleImport("merge")}
            >
              {t("settings.importMergeButton")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import Card from "../Card";
import Button from "../Button";
import { useLanguage } from "../../hooks/useLanguage";

export default function SaveTimeModal({ isOpen, seconds, onDiscardConfirm, onSaveConfirm }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState("confirmSave"); // confirmSave | confirmDiscard

  if (!isOpen) return null;

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalBox">
        {mode === "confirmSave" && (
          <Card title={t('timer.modalTitle')}>
            <p>{t('timer.saveTime')}</p>

            <div className="modalButtons">
              <Button
                label={t('timer.yes')}
                variant="start"
                disabled={seconds === 0}
                onClick={() => {
                  setMode("confirmSave"); // reset for next open
                  onSaveConfirm();
                }}
              />
              <Button 
                label={t('timer.no')} 
                variant="stop" 
                onClick={() => 
                  setMode("confirmDiscard")
                } 
              />
            </div>
          </Card>
        )}

        {mode === "confirmDiscard" && (
          <Card title={t('timer.youSure')}>
            <p>{t('timer.discard')}</p>

            <div className="modalButtons">
              <Button
                label={t('timer.yes')}
                variant="start"
                onClick={() => {
                  setMode("confirmSave"); // reset for next open
                  onDiscardConfirm();
                }}
              />
              <Button
                label={t('timer.no')}
                variant="stop"
                onClick={() => setMode("confirmSave")}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useLanguage } from "../../../hooks/useLanguage";
import { getGoals, isValidGoalMinutes, saveGoals } from "../../../utils/goalsStore";
import "../themeContext.css";

export default function GoalsCard() {
  const { t } = useLanguage();
  const [dailyMinutes, setDailyMinutes] = useState(() => String(getGoals().dailyMinutes));
  const [weeklyMinutes, setWeeklyMinutes] = useState(() => String(getGoals().weeklyMinutes));

  function handleSaveGoals() {
    const daily = Number(dailyMinutes);
    const weekly = Number(weeklyMinutes);

    if (!isValidGoalMinutes(daily) || !isValidGoalMinutes(weekly)) {
      window.alert(t("settings.goalsInvalid"));
      return;
    }

    const saved = saveGoals({
      dailyMinutes: daily,
      weeklyMinutes: weekly,
    });

    setDailyMinutes(String(saved.dailyMinutes));
    setWeeklyMinutes(String(saved.weeklyMinutes));
    window.alert(t("settings.goalsSaved"));
  }

  return (
    <section className="settings">
      <div className="settings__card">
        <div className="settings__row goals-row">
          <div>
            <span className="settings__label">{t("settings.goals")}</span>
            <p className="settings__description">{t("settings.goalsDescription")}</p>
          </div>
        </div>

        <div className="goals-grid">
          <label className="goal-field">
            <span className="settings__description">{t("settings.dailyGoalMinutes")}</span>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              className="goal-input"
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(e.target.value)}
            />
          </label>

          <label className="goal-field">
            <span className="settings__description">{t("settings.weeklyGoalMinutes")}</span>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              className="goal-input"
              value={weeklyMinutes}
              onChange={(e) => setWeeklyMinutes(e.target.value)}
            />
          </label>
        </div>

        <button
          type="button"
          className="segmented__btn goals-save-btn"
          onClick={handleSaveGoals}
        >
          {t("settings.saveGoalsButton")}
        </button>
      </div>
    </section>
  );
}

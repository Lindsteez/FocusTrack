import { useEffect, useMemo, useState } from "react";
import Card from "./Card";
import useSessions from "../hooks/useSessions";
import { useLanguage } from "../hooks/useLanguage";
import { getGoals, subscribeGoals } from "../utils/goalsStore";
import { buildGoalsProgress } from "../utils/goalsProgress";
import styles from "./GoalsProgressCard.module.css";

function formatSecondsAsHm(seconds) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safe / 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function GoalsProgressCard() {
  const { t } = useLanguage();
  const { sessions } = useSessions();
  const [goals, setGoals] = useState(() => getGoals());

  useEffect(() => {
    return subscribeGoals(() => {
      setGoals(getGoals());
    });
  }, []);

  const progress = useMemo(() => {
    return buildGoalsProgress({
      sessions,
      goals,
    });
  }, [sessions, goals]);

  return (
    <Card title={t("stats.goalsProgressTitle")}>
      <div className={`${styles.grid} goalsProgressGrid`}>
        <article className={styles.item}>
          <div className={styles.label}>{t("stats.dailyGoal")}</div>
          <div className={styles.value}>
            {formatSecondsAsHm(progress.todaySeconds)} /{" "}
            {formatSecondsAsHm(progress.dailyGoalSeconds)}
          </div>
          <div className={styles.track} aria-hidden="true">
            <div
              className={styles.fill}
              style={{ width: `${progress.todayPercent}%` }}
            />
          </div>
          <div className={styles.meta}>
            {progress.todayPercent}%{" "}
            {progress.todayDone ? `• ${t("stats.done")}` : ""}
          </div>
        </article>

        <article className={styles.item}>
          <div className={styles.label}>{t("stats.weeklyGoal")}</div>
          <div className={styles.value}>
            {formatSecondsAsHm(progress.weekSeconds)} /{" "}
            {formatSecondsAsHm(progress.weeklyGoalSeconds)}
          </div>
          <div className={styles.track} aria-hidden="true">
            <div
              className={styles.fill}
              style={{ width: `${progress.weekPercent}%` }}
            />
          </div>
          <div className={styles.meta}>
            {progress.weekPercent}%{" "}
            {progress.weekDone ? `• ${t("stats.done")}` : ""}
          </div>
        </article>

        <article className={styles.item}>
          <div className={styles.label}>{t("stats.currentStreak")}</div>
          <div className={styles.value}>
            {progress.currentStreakDays} {t("stats.days")}
          </div>
        </article>

        <article className={styles.item}>
          <div className={styles.label}>{t("stats.bestStreak")}</div>
          <div className={styles.value}>
            {progress.bestStreakDays} {t("stats.days")}
          </div>
        </article>
      </div>
    </Card>
  );
}

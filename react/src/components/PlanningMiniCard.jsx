import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "./Card";
import { useLanguage } from "../hooks/useLanguage";
import {
  getDateKey,
  getPlanningItemsByDate,
  removePlanningItem,
  subscribePlanning,
  togglePlanningItemCompleted,
} from "../utils/planningStore";
import styles from "./PlanningMiniCard.module.css";

const DAY_MS = 24 * 60 * 60 * 1000;

function getDateByOffset(dayOffset) {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  return new Date(base.getTime() + dayOffset * DAY_MS);
}

function formatDayInfo(date, localeTag) {
  const weekday = new Intl.DateTimeFormat(localeTag, {
    weekday: "long",
  }).format(date);

  const dateLabel = new Intl.DateTimeFormat(localeTag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);

  return { weekday, dateLabel };
}

export default function PlanningMiniCard() {
  const { t, locale } = useLanguage();
  const [dayOffset, setDayOffset] = useState(0);
  const [dayPlans, setDayPlans] = useState([]);

  const localeTag = locale === "sv" ? "sv-SE" : "en-US";
  const labels =
    locale === "sv"
      ? {
          noPlan: "Ingen plan hittades för den här dagen ännu.",
          openFull: "Öppna hela planering",
          today: "Idag",
          prev: "Föregående dag",
          next: "Nästa dag",
          remove: "Ta bort",
          done: "Klar",
          markDone: "Klar",
          markUndone: "Ångra",
        }
      : {
          noPlan: "No plan found for this day yet.",
          openFull: "Open full planning",
          today: "Today",
          prev: "Previous day",
          next: "Next day",
          remove: "Remove",
          done: "Done",
          markDone: "Done",
          markUndone: "Undo",
        };

  const targetDate = useMemo(() => getDateByOffset(dayOffset), [dayOffset]);
  const targetDateKey = useMemo(() => getDateKey(targetDate), [targetDate]);
  const { weekday, dateLabel } = useMemo(
    () => formatDayInfo(targetDate, localeTag),
    [targetDate, localeTag],
  );

  useEffect(() => {
    function syncPlans() {
      setDayPlans(getPlanningItemsByDate(targetDateKey));
    }

    syncPlans();
    return subscribePlanning(syncPlans);
  }, [targetDateKey]);

  return (
    <Card title={t("nav.planning")} className={styles.card}>
      <div className={styles.headerRow}>
        <button
          type="button"
          className={styles.dayBtn}
          onClick={() => setDayOffset((prev) => prev - 1)}
          aria-label={labels.prev}
          title={labels.prev}
        >
          ‹
        </button>

        <div className={styles.dayInfo}>
          <p className={styles.weekday}>{weekday}</p>
          <p className={styles.date}>{dateLabel}</p>
        </div>

        <button
          type="button"
          className={styles.dayBtn}
          onClick={() => setDayOffset((prev) => prev + 1)}
          aria-label={labels.next}
          title={labels.next}
        >
          ›
        </button>
      </div>

      {dayPlans.length === 0 ? (
        <p className={styles.emptyText}>{labels.noPlan}</p>
      ) : (
        <ul className={styles.planList}>
          {dayPlans.map((item) => (
            <li
              key={item.id}
              className={`${styles.planItem} ${item.completed ? styles.planItemDone : ""}`}
            >
              <button
                type="button"
                className={`${styles.planCheck} ${item.completed ? styles.planCheckDone : ""}`}
                onClick={() => togglePlanningItemCompleted(item.id)}
                aria-label={
                  item.completed
                    ? `${labels.markUndone}: ${item.title}`
                    : `${labels.markDone}: ${item.title}`
                }
                title={item.completed ? labels.markUndone : labels.markDone}
              >
                {item.completed ? "✓" : "○"}
              </button>
              <span
                className={`${styles.planTime} ${item.completed ? styles.planTextDone : ""}`}
              >
                {item.startTime}-{item.endTime}
              </span>
              <span
                className={`${styles.planTitle} ${item.completed ? styles.planTextDone : ""}`}
              >
                {item.title}
              </span>
              <button
                type="button"
                className={styles.planDeleteBtn}
                onClick={() => removePlanningItem(item.id)}
                aria-label={`${labels.remove}: ${item.title}`}
                title={labels.remove}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={() => setDayOffset(0)}
          disabled={dayOffset === 0}
        >
          {labels.today}
        </button>

        <Link to="/planning" className={styles.linkBtn}>
          {labels.openFull}
        </Link>
      </div>
    </Card>
  );
}

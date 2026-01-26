import Card from "./Card";
import styles from "./RecentSessions.module.css";
import useSessions from "../hooks/useSessions";
import { formatDuration, formatDate } from "../utils/sessionsStore";



function categoryDotStyle(category) {
  const map = {
    work: "#3B82F6",
    hobby: "#A855F7",
    sports: "#22C55E",
    cooking: "#F97316",
    study: "#ff00c8",
  };
  return { background: map[category] ?? "#94A3B8" };
}

export default function RecentSessions() {
  const sessions = useSessions();

  return (
    <Card title="Recent Sessions">
      {sessions.length === 0 ? (
        <p className={styles.empty}>No sessions yet.</p>
      ) : (
        <div className={styles.cardBody}>
          {sessions.slice(0, 5).map((s) => (
            <div key={s.id} className={styles.row}>
              <div className={styles.left}>
                <div className={styles.title}>{s.description || "(no name)"}</div>

                <div className={styles.metaRow}>
                  <span
                    className={styles.dot}
                    style={categoryDotStyle(s.category)}
                    aria-hidden="true"
                  />
                  <span className={styles.category}>{s.category}</span>
                </div>
              </div>

              <div className={styles.timeBlock}>
                <div className={styles.time}>{formatDuration(s.seconds)}</div>
                <div className={styles.date}>{formatDate(s.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

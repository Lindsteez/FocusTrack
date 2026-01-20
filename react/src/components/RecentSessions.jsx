import Card from "./Card";
import styles from "./RecentSessions.module.css";
import { formatDuration } from "../utils/sessionsStore";

function categoryDotStyle(category) {
  // Uses no custom colors. Just varies opacity via different preset shades.
  // If you later want real colors per category, say so and we’ll do it cleanly.
  const map = {
    work: 0.55,
    hobby: 0.45,
    sports: 0.65,
    cooking: 0.4,
    cleaning: 0.6,
  };
  const a = map[category] ?? 0.35;
  return { background: `rgba(255, 255, 255, ${a})` };
}

export default function RecentSessions({ sessions }) {
  return (
    <Card title="Recent Sessions">
      {sessions.length === 0 ? (
        <p className={styles.empty}>No sessions yet.</p>
      ) : (
        <div className={styles.cardBody}>
          {sessions.slice(0, 5).map((s) => (
            <div key={s.id} className={styles.row}>
              <div className={styles.left}>
                <div className={styles.title}>
                  {s.description || "(no name)"}
                </div>

                <div className={styles.metaRow}>
                  <span
                    className={styles.dot}
                    style={categoryDotStyle(s.category)}
                    aria-hidden="true"
                  />
                  <span className={styles.category}>{s.category}</span>
                </div>
              </div>

              <div className={styles.time}>{formatDuration(s.seconds)}</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

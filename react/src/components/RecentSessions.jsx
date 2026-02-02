import Card from "./Card";
import styles from "./RecentSessions.module.css";
import useSessions from "../hooks/useSessions";
import { formatDuration, formatDate } from "../utils/sessionsStore";
import penIcon from '../assets/imgs/pen.png';

function focusDotStyle(focusMode) {
  const map = {
    Work: "#22C55E",         // green
    Break: "#EAB308",       // yellow
    Meeting: "#ff00c8",     // pink
  };
  return { background: map[focusMode] ?? "#94A3B8" };
}

export default function RecentSessions({onDelete, onEdit}) {
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

                <div className={styles.title}>{s.description || "(no name)"}
                </div>
              

                {/* Dot is now based on focusMode, not category */}
                <div className={styles.metaRow}>
                  
                  <span
                    className={styles.dot}
                    style={focusDotStyle(s.focusMode)}
                    aria-hidden="true"
                  />
                  <span className={styles.category}>{s.focusMode ?? "-"}</span>
                </div>

                {(s.note ?? "") && <div className={styles.note}>{s.note}</div>}
              </div>
              

              <div className={styles.timeBlock}>

                
              {/* Edit and delete session */}
                <div className={styles.editDelete}>
                    <button onClick={() => onEdit(sessions.id)}
                      className={styles.editBtn}><img src={penIcon} alt='Edit' /></button>                

                    <button onClick={() => onDelete(sessions.id)}
                      className={styles.deleteBtn}>✕</button>                
                  </div>

                <div className={styles.time}>{formatDuration(s.seconds)}</div>
                <div className={styles.timeSpacer} />
                <div className={styles.date}>{formatDate(s.createdAt)}</div>

              </div>
            </div>
            
          ))}
        </div>

      )}
    </Card>
  );
}

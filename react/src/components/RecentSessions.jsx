import Card from "./Card";
import styles from "./RecentSessions.module.css";
import useSessions from "../hooks/useSessions";
import { formatDuration, formatDate } from "../utils/sessionsStore";
import penIcon from '../assets/imgs/pen.png';
import StartSessionModal from "./Timer/StartSessionModal";

function focusDotStyle(focusMode) {
  const map = {
    Work: "#22C55E",         // green
    Break: "#EAB308",       // yellow
    Meeting: "#ff00c8",     // pink
  };
  return { background: map[focusMode] ?? "#94A3B8" };
}

export default function RecentSessions() {
  const {sessions, 
    deleteSession, 
    editOpen,
    editingSession,
    openEdit,
    closeEdit,
    saveEdit
  } = useSessions();

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
                  <span className={styles.note}>
                      Energy: {s.energyLevel ?? "-"}
                  </span>

              </div>
              

              <div className={styles.timeBlock}>

                
              {/* Edit and delete session */}
                <div className={styles.editDelete}>
                    <button onClick={() => openEdit(s.id)}
                      className={styles.editBtn}>
                        <img src={penIcon} alt='Edit' />
                    </button>                

                    <button onClick={() => deleteSession(s.id)}
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

      

      {editOpen && editingSession && ( 
        <StartSessionModal 
        key = {editingSession.id}
        isOpen={editOpen}
        mode ='edit'
        initialValues = {{
          description: editingSession.description ?? '',
          note: editingSession.note ?? '',
          focusMode: editingSession.focusMode ?? 'Work',
          energyLevel: editingSession.energyLevel ?? null,
        }}
        onCancel = {closeEdit}
        onSave = {(values) => {
          saveEdit({
            description: values.description,
            focusMode: values.focusMode,
            energyLevel: values.energyLevel,
          })
        }}
        />
      )}
    </Card>
  );
}

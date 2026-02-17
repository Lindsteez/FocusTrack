// src/components/SessionsList.jsx
import styles from "./RecentSessions.module.css"; // återanvänd samma CSS
import useSessions from "../hooks/useSessions";
import { formatDuration, formatDate } from "../utils/sessionsStore";
import penIcon from "../assets/imgs/pen.png";
import StartSessionModal from "./Timer/StartSessionModal";

function focusDotStyle(focusMode) {
  const map = {
    Work: "#637fb3",
    Break: "#d1a664",
    Meeting: "#bb67a9",
  };
  return { background: map[focusMode] ?? "#94A3B8" };
}

export default function SessionsList({ limit = 5, emptyText = "No sessions yet." }) {
  const {
    sessions,
    deleteSession,
    editOpen,
    editingSession,
    openEdit,
    closeEdit,
    saveEdit,
  } = useSessions();

  const list = sessions.slice(0, limit);

  return (
    <>
      {sessions.length === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        <div className={styles.cardBody}>
          {list.map((s) => (
            <div key={s.id} className={styles.row}>
              <div className={styles.left}>
                <div className={styles.title}>{s.description || "(no name)"}</div>

                <div className={styles.metaRow}>
                  <span
                    className={styles.dot}
                    style={focusDotStyle(s.focusMode)}
                    aria-hidden="true"
                  />
                  <span className={styles.category}>{s.focusMode ?? "-"}</span>
                </div>

                <span className={styles.note}>Energy: {s.energyLevel ?? "-"}</span>
              </div>

              <div className={styles.timeBlock}>
                <div className={styles.editDelete}>
                  <button onClick={() => openEdit(s.id)} className={styles.editBtn}>
                    <img src={penIcon} alt="Edit" />
                  </button>

                  <button onClick={() => deleteSession(s.id)} className={styles.deleteBtn}>
                    ✕
                  </button>
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
          key={editingSession.id}
          isOpen={editOpen}
          mode="edit"
          initialValues={{
            description: editingSession.description ?? "",
            note: editingSession.note ?? "",
            focusMode: editingSession.focusMode ?? "Work",
            energyLevel: editingSession.energyLevel ?? null,
          }}
          onCancel={closeEdit}
          onSave={(values) => {
            saveEdit({
              description: values.description,
              focusMode: values.focusMode,
              energyLevel: values.energyLevel,
            });
          }}
        />
      )}
    </>
  );
}

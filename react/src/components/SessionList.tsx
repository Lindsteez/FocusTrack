import { useState, useMemo } from "react";
import { useLanguage } from "../hooks/useLanguage";
import styles from "./RecentSessions.module.css"; // återanvänd samma CSS
import useSessions from "../hooks/useSessions";
import { formatDuration, formatDate } from "../utils/sessionsStore";
import penIcon from "../assets/imgs/pen.png";
import StartSessionModal from "./Timer/StartSessionModal";

type FocusMode = 'work' | 'break' | 'meeting';

type SessionType = {
  id: string;
  seconds: number;
  description?: string;
  note?: string;
  focusMode?: FocusMode;
  energyLevel?: number | null;
  createdAt: string;
};

type ValuesType = {
  description: string;
  focusMode: FocusMode;
  energyLevel: number | null;
};

function focusDotStyle(focusMode: FocusMode) {
  const map = {
    work: "#637fb3",
    break: "#d1a664",
    meeting: "#bb67a9",
  };
  return { background: map[focusMode] ?? "#94A3B8" };
}

interface SessionsListProps {
  limit?: number;
  emptyText?: string;
  showLoadMore?: boolean;
  pageSize?: number;
}

export default function SessionsList({ 
  limit = 5, 
  emptyText = "No sessions yet.",
  showLoadMore = false,
  pageSize = 20, 
}: SessionsListProps) {  
  const {
    sessions,
    deleteSession,
    editOpen,
    editingSession,
    openEdit,
    closeEdit,
    saveEdit,
  } = useSessions();

  const { t } =  useLanguage();

  const initialCount = showLoadMore ? Math.min(pageSize, limit) : limit;
  const [visibleCount, setVisibleCount] = useState (initialCount);
  const safeVisibleCount = Math.min(visibleCount, limit, sessions.length);

  const list: SessionType[] = useMemo(
    () => sessions.slice(0, safeVisibleCount),
    [sessions, safeVisibleCount]
  );

  const canLoadMore = showLoadMore && safeVisibleCount < Math.min(limit, sessions.length);

  return (
    <>
      {sessions.length === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        <div className={styles.cardBody}>
          {list.map((s: SessionType) => (
            <div key={s.id} className={styles.row}>
              <div className={styles.left}>
                <div className={styles.title}>{s.description || "(no name)"}</div>

                <div className={styles.metaRow}>
                  <span
                    className={styles.dot}
                    style={focusDotStyle(s.focusMode ?? 'work')}
                    aria-hidden="true"
                  />
                  <span className={styles.category}>{s.focusMode ? t(`timer.${s.focusMode.toLowerCase()}`) : "-"}</span>
                </div>

                <span className={styles.note}>{t('timer.energy')}: {s.energyLevel ?? "-"}</span>
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

          {canLoadMore && (
            <button 
            className={styles.loadMoreBtn}
            onClick={() =>
              setVisibleCount((c) => Math.min(c + pageSize, limit, sessions.length))
            }>
              Load more
            </button>
          )}
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
            focusMode: editingSession.focusMode ?? "work",
            energyLevel: editingSession.energyLevel ?? null,
          }}
          focusMode={editingSession.focusMode ?? "work"}
          energyLevel={editingSession.energyLevel ?? null}
          label={editingSession.description ?? ""}
          onChangeFocusMode={() => {}}
          onChangeEnergyLevel={() => {}}
          onChangeLabel={() => {}}
          onCancel={closeEdit}
          onConfirm={() => {}}
          onSave={(values: ValuesType) => {
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

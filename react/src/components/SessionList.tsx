import { useMemo, useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
import styles from "./RecentSessions.module.css"; 
import useSessions from "../hooks/useSessions";
import { formatDuration, formatDate } from "../utils/sessionsStore";
import penIcon from "../assets/svg/pen.svg";
import penIconDark from "../assets/imgs/pen.png";
import StartSessionModal from "./Timer/StartSessionModal";

type FocusMode = "work" | "break" | "meeting";

type SessionType = {
  id: string;
  seconds: number;
  description?: string;
  note?: string;
  focusMode?: FocusMode | string;
  energyLevel?: number | null;
  createdAt: string;
};

type ValuesType = {
  description: string;
  focusMode: FocusMode;
  energyLevel: number | null;
};

interface SessionsListProps {
  limit?: number;
  emptyText?: string;
  showLoadMore?: boolean;
  pageSize?: number;
  pageScrollOnMobile?: boolean;
}

function focusDotStyle(focusMode?: string) {
  const map: Record<string, string> = {
    work: "#637fb3",
    break: "#d1a664",
    meeting: "#bb67a9",
  };

  return { background: map[focusMode ?? ""] ?? "#94A3B8" };
}

export default function SessionsList({
  limit = 5,
  emptyText = "No sessions yet.",
  showLoadMore = false,
  pageSize = 20,
  pageScrollOnMobile = false,
}: SessionsListProps) {
  const { t } = useLanguage();

  const {
    sessions,
    deleteSession,
    editOpen,
    editingSession,
    openEdit,
    closeEdit,
    saveEdit,
  } = useSessions();

  const initialCount = showLoadMore ? Math.min(pageSize, limit) : limit;
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const safeVisibleCount = Math.min(visibleCount, limit, sessions.length);

  const list = useMemo(
    () => sessions.slice(0, safeVisibleCount) as SessionType[],
    [sessions, safeVisibleCount]
  );

  const canLoadMore =
    showLoadMore && safeVisibleCount < Math.min(limit, sessions.length);

  return (
    <>
      {sessions.length === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        <>
          <div
            className={
              pageScrollOnMobile
                ? `${styles.cardBody} ${styles.pageScrollOnMobile}`
                : styles.cardBody
            }
          >
            {list.map((s) => {
              const modeKey = (s.focusMode ?? "").toString().toLowerCase();
              const isLight = document.body.getAttribute("data-theme") === "light";

              return (
                <div key={s.id} className={styles.row}>
                  <div className={styles.left}>
                    <div className={styles.title}>{s.description || "(no name)"}</div>

                    <div className={styles.metaRow}>
                      <span
                        className={styles.dot}
                        style={focusDotStyle(modeKey)}
                        aria-hidden="true"
                      />
                      <span className={styles.category}>
                        {modeKey ? t(`timer.${modeKey}`) : "-"}
                      </span>
                    </div>

                    <span className={styles.note}>
                      {t("timer.energy")}: {s.energyLevel ?? "-"}
                    </span>
                  </div>

                  <div className={styles.timeBlock}>
                    <div className={styles.editDelete}>
                      <button
                        type="button"
                        onClick={() => openEdit(s.id)}
                        className={styles.editBtn}
                        aria-label="Edit session"
                      >
                        <img src={isLight ? penIcon : penIconDark} alt="" />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteSession(s.id)}
                        className={styles.deleteBtn}
                        aria-label="Delete session"
                      >
                        ✕
                      </button>
                    </div>

                    <div className={styles.time}>{formatDuration(s.seconds)}</div>
                    <div className={styles.date}>{formatDate(s.createdAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {canLoadMore && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setVisibleCount((c) => Math.min(c + pageSize, limit))}
                className={styles.loadMoreBtn}
              >
                {t("recent.loadMore") ?? "Load more"}
              </button>
            </div>
          )}
        </>
      )}

      {editOpen && editingSession && (
        <StartSessionModal
          key={editingSession.id}
          isOpen={editOpen}
          mode="edit"
          initialValues={{
            description: editingSession.description ?? "",
            note: editingSession.note ?? "",
            focusMode: (editingSession.focusMode as FocusMode) ?? "work",
            energyLevel: editingSession.energyLevel ?? null,
          }}
          focusMode={(editingSession.focusMode as FocusMode) ?? "work"}
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

import { useEffect, useState } from "react";
import { getSessions, 
        deleteSessionById, 
        subscribeSessions,
        updateSessionById } from "../utils/sessionsStore";
      

/**
 * Provides reactive access to saved sessions and exposes edit/delete actions.
 *
 * @returns {{
 *   sessions: Array<object>,
 *   deleteSession: (id: string) => void,
 *   editOpen: boolean,
 *   editingSession: object | null,
 *   openEdit: (id: string) => void,
 *   closeEdit: () => void,
 *   saveEdit: (patch: object) => void
 * }}
 */
export default function useSessions() {
  // Engångsmigrering: konvertera gamla svenska focusMode till engelska
  const migrateFocusMode = (sessions) => {
    let changed = false;
    const map = { 'jobb': 'work', 'möte': 'meeting', 'rast': 'break' };
    const migrated = sessions.map(s => {
      if (s.focusMode && map[s.focusMode]) {
        changed = true;
        return { ...s, focusMode: map[s.focusMode] };
      }
      return s;
    });
    if (changed) {
      // Spara tillbaka till localStorage
      window.localStorage.setItem('focustrack.sessions', JSON.stringify(migrated));
    }
    return migrated;
  };

  const [sessions, setSessions] = useState(() => migrateFocusMode(getSessions()));
   
  /* Modale state */
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    return subscribeSessions(() => {
      setSessions(getSessions());
    });
  }, []);

/* Tar bort från localstorage */
  function deleteSession(id) {
   const updated = deleteSessionById(id);
   setSessions(updated);
  }

  /* Redigera session */
  function openEdit(id) {
    setEditingId(id);
    setEditOpen(true);
    // setEditNonce(n => n + 1);
  }

  function closeEdit() {
    setEditOpen(false);
    setEditingId(null);
  }

  const editingSession = sessions.find(s => s.id === editingId) ?? null;

  function saveEdit(patch){
    if (!editingId) return;
    const updated = updateSessionById(editingId, patch);
    setSessions(updated);
    closeEdit();
  }
  

  return {sessions, 
          deleteSession,
          editOpen,
          editingSession,
          openEdit,
          closeEdit,
          saveEdit,
        };
}

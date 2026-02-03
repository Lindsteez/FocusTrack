import { useEffect, useState } from "react";
import { getSessions, 
        deleteSessionById, 
        subscribeSessions,
        updateSessionById } from "../utils/sessionsStore";
      

export default function useSessions() {
  const [sessions, setSessions] = useState(() => getSessions());
   
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

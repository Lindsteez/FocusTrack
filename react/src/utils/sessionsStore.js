const SESSIONS_KEY = "focustrack.sessions";
const EVENT_NAME = "focustrack:sessions-changed";

export function loadSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getSessions() {
  return loadSessions();
}

export function subscribeSessions(callback) {
  function handler() {
    callback();
  }
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

function emitSessionsChanged() {
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function makeSessionEntry({ seconds, description, category }) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    seconds,
    description,
    category,
    createdAt: new Date().toISOString(),
  };
}

export function addSession({ seconds, description, category }) {
  const entry = makeSessionEntry({ seconds, description, category });

  const prev = loadSessions();
  const next = [entry, ...prev].slice(0, 10);

  saveSessions(next);
  emitSessionsChanged();

  return entry;
}

export function clearSessions() {
  localStorage.removeItem(SESSIONS_KEY);
  emitSessionsChanged();
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

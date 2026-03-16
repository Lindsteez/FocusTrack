const SESSIONS_KEY = "focustrack.sessions";
const EVENT_NAME = "focustrack:sessions-changed";

/**
 * Loads all saved sessions from localStorage.
 *
 * @returns {Array<object>}
 */
export function loadSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves the complete session collection to localStorage.
 *
 * @param {Array<object>} sessions
 * @returns {void}
 */
export function saveSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

/**
 * Returns the current list of saved sessions.
 *
 * @returns {Array<object>}
 */
export function getSessions() {
  return loadSessions();
}

/**
 * Subscribes to the custom session change event.
 *
 * @param {() => void} callback
 * @returns {() => void}
 */
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
function normalizeFocusMode(focusMode) {
  if (!focusMode) return null;
  const map = { 'jobb': 'work', 'möte': 'meeting', 'rast': 'break', 'work': 'work', 'meeting': 'meeting', 'break': 'break' };
  return map[focusMode.toLowerCase()] ?? 'work';
}

/**
 * Creates a normalized session entry before persistence.
 *
 * @param {{
 *   seconds: number,
 *   description?: string,
 *   category?: string,
 *   note?: string,
 *   focusMode?: string | null,
 *   energyLevel?: number | null,
 *   label?: string,
 *   rating?: number | null
 * }} params
 * @returns {object}
 */
export function makeSessionEntry({
  seconds,
  description,
  category,
  note,
  focusMode,
  energyLevel,
  label,
  rating,
}) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    seconds,
    description,
    category,
    note: note ?? "",
    createdAt: new Date().toISOString(),

    // New structured fields saved to localStorage:
    focusMode: normalizeFocusMode(focusMode),
    energyLevel: energyLevel ?? null,
    label: label ?? "",
    rating: rating ?? null,
  };
}

/**
 * Adds a new session, persists it and emits a change event.
 *
 * @param {{
 *   seconds: number,
 *   description?: string,
 *   category?: string,
 *   note?: string,
 *   focusMode?: string | null,
 *   energyLevel?: number | null,
 *   label?: string
 * }} params
 * @returns {object}
 */
export function addSession({
  seconds,
  description,
  category,
  note,
  focusMode,
  energyLevel,
  label,
}) {
  const entry = makeSessionEntry({
    seconds,
    description,
    category,
    note,
    focusMode,
    energyLevel,
    label,
  });


  const prev = loadSessions();
  const next = [entry, ...prev].slice(0, 200);

  saveSessions(next);
  emitSessionsChanged();

  return entry;
}

/**
 * Removes every persisted session.
 *
 * @returns {void}
 */
export function clearSessions() {
  localStorage.removeItem(SESSIONS_KEY);
  emitSessionsChanged();
}

/**
 * Formats a duration in seconds for UI display.
 *
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Formats an ISO timestamp as a locale date string.
 *
 * @param {string} isoString
 * @returns {string}
 */
export function formatDate(isoString) {
  const d = new Date(isoString);

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(d);
}


/* Tar bort från localstorage */
/**
 * Deletes a single saved session by id.
 *
 * @param {string} id
 * @returns {Array<object>}
 */
export function deleteSessionById(id) {
  const sessions = getSessions();
  const updated = sessions.filter( s => s.id !== id)
  saveSessions(updated);
  emitSessionsChanged();
  return(updated);
}

/* Redigera en sparad session */ 
/**
 * Updates a saved session by id and persists the result.
 *
 * @param {string} id
 * @param {object} patch
 * @returns {Array<object>}
 */
export function updateSessionById(id, patch) {
  const sessions = getSessions();
  const updated = sessions.map(s => {
    if (s.id === id) {
      // Normalisera focusMode även vid uppdatering
      return { ...s, ...patch, focusMode: normalizeFocusMode(patch.focusMode ?? s.focusMode) };
    }
    return s;
  });
  saveSessions(updated);
  emitSessionsChanged();
  return updated;
}

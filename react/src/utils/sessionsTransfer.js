import { getSessions, saveSessions } from "./sessionsStore";

const SESSIONS_CHANGED_EVENT = "focustrack:sessions-changed";
const MAX_SESSIONS = 200;

function normalizeFocusMode(focusMode) {
  if (!focusMode) return null;

  const map = {
    jobb: "work",
    möte: "meeting",
    rast: "break",
    work: "work",
    meeting: "meeting",
    break: "break",
  };

  return map[String(focusMode).toLowerCase()] ?? "work";
}

function makeSessionId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function normalizeImportedSession(raw) {
  if (!raw || typeof raw !== "object") return null;

  const numericSeconds = Number(raw.seconds);
  if (!Number.isFinite(numericSeconds) || numericSeconds < 0) return null;

  const dateMs = new Date(raw.createdAt).getTime();
  const createdAt = Number.isFinite(dateMs)
    ? new Date(dateMs).toISOString()
    : new Date().toISOString();

  const energyLevelRaw = raw.energyLevel;
  const energyLevel =
    Number.isFinite(Number(energyLevelRaw)) && Number(energyLevelRaw) >= 0
      ? Number(energyLevelRaw)
      : null;

  const ratingRaw = raw.rating;
  const rating =
    Number.isFinite(Number(ratingRaw)) && Number(ratingRaw) >= 0
      ? Number(ratingRaw)
      : null;

  return {
    id: typeof raw.id === "string" && raw.id.trim() ? raw.id : makeSessionId(),
    seconds: Math.floor(numericSeconds),
    description:
      typeof raw.description === "string" && raw.description.trim()
        ? raw.description
        : typeof raw.label === "string" && raw.label.trim()
          ? raw.label
          : "(no label)",
    category: typeof raw.category === "string" ? raw.category : undefined,
    note: typeof raw.note === "string" ? raw.note : "",
    createdAt,
    focusMode: normalizeFocusMode(raw.focusMode),
    energyLevel,
    label: typeof raw.label === "string" ? raw.label : "",
    rating,
  };
}

function extractSessionsArray(parsedJson) {
  if (Array.isArray(parsedJson)) return parsedJson;
  if (Array.isArray(parsedJson?.sessions)) return parsedJson.sessions;
  return null;
}

function dedupeById(sessions) {
  const seen = new Set();
  const unique = [];

  for (const session of sessions) {
    const key = String(session.id);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(session);
  }

  return unique;
}

/**
 * Exports all saved sessions as a downloadable JSON file.
 *
 * @returns {void}
 */
export function exportSessionsAsJson() {
  const sessions = getSessions() ?? [];

  const payload = {
    app: "FocusTrack",
    version: 1,
    exportedAt: new Date().toISOString(),
    sessions,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);

  a.href = url;
  a.download = `focustrack-sessions-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

/**
 * Imports sessions from a JSON file and merges or replaces existing data.
 *
 * @param {File} file
 * @param {"merge" | "replace"} [mode="merge"]
 * @returns {Promise<{mode: "merge" | "replace", importedCount: number, savedCount: number}>}
 */
export async function importSessionsFromJsonFile(file, mode = "merge") {
  if (!(file instanceof File)) {
    throw new Error("No file selected.");
  }

  if (mode !== "merge" && mode !== "replace") {
    throw new Error("Invalid import mode.");
  }

  const text = await file.text();
  let parsed;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON file.");
  }

  const sourceSessions = extractSessionsArray(parsed);
  if (!sourceSessions) {
    throw new Error("The JSON file does not contain a valid sessions array.");
  }

  const normalizedImported = sourceSessions
    .map(normalizeImportedSession)
    .filter(Boolean);

  if (normalizedImported.length === 0) {
    throw new Error("No valid sessions found in file.");
  }

  const currentSessions = getSessions() ?? [];
  const normalizedCurrent = currentSessions
    .map(normalizeImportedSession)
    .filter(Boolean);

  const nextSessions =
    mode === "replace"
      ? normalizedImported.slice(0, MAX_SESSIONS)
      : dedupeById([...normalizedImported, ...normalizedCurrent]).slice(0, MAX_SESSIONS);

  saveSessions(nextSessions);
  window.dispatchEvent(new Event(SESSIONS_CHANGED_EVENT));

  return {
    mode,
    importedCount: normalizedImported.length,
    savedCount: nextSessions.length,
  };
}

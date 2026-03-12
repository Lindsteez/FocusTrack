const PLANNING_KEY = "focustrack.planning-items";
const PLANNING_CHANGED_EVENT = "focustrack:planning-changed";

function makeId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export function getDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isValidTime(value) {
  return typeof value === "string" && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function toMinutes(value) {
  if (!isValidTime(value)) return null;
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function normalizeDateKey(value, fallback = getDateKey()) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : fallback;
}

function normalizeItem(raw) {
  if (!raw || typeof raw !== "object") return null;

  const title = typeof raw.title === "string" ? raw.title.trim().slice(0, 90) : "";
  if (!title) return null;

  const startTime = isValidTime(raw.startTime) ? raw.startTime : "09:00";
  const endTime = isValidTime(raw.endTime) ? raw.endTime : "09:30";

  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);
  if (startMinutes == null || endMinutes == null || endMinutes <= startMinutes) return null;
  const completed = raw.completed === true;
  const completedAt =
    typeof raw.completedAt === "string" && raw.completedAt.trim()
      ? raw.completedAt
      : null;

  return {
    id: typeof raw.id === "string" && raw.id.trim() ? raw.id : makeId(),
    dateKey: normalizeDateKey(raw.dateKey),
    title,
    startTime,
    endTime,
    completed,
    completedAt: completed ? completedAt ?? new Date().toISOString() : null,
    createdAt:
      typeof raw.createdAt === "string" && raw.createdAt.trim()
        ? raw.createdAt
        : new Date().toISOString(),
  };
}

function readAll() {
  try {
    const raw = localStorage.getItem(PLANNING_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeItem).filter(Boolean);
  } catch {
    return [];
  }
}

function emitPlanningChanged() {
  window.dispatchEvent(new Event(PLANNING_CHANGED_EVENT));
}

function writeAll(items) {
  localStorage.setItem(PLANNING_KEY, JSON.stringify(items));
  emitPlanningChanged();
}

function sortItems(items) {
  return [...items].sort((a, b) => {
    if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
    if (a.startTime !== b.startTime) return a.startTime.localeCompare(b.startTime);
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export function getPlanningItems() {
  return sortItems(readAll());
}

export function getPlanningItemsByDate(dateOrKey) {
  const dateKey =
    typeof dateOrKey === "string" ? normalizeDateKey(dateOrKey) : getDateKey(dateOrKey);
  return getPlanningItems().filter((item) => item.dateKey === dateKey);
}

export function getPlanningItemDurationMinutes(item) {
  const start = toMinutes(item?.startTime);
  const end = toMinutes(item?.endTime);
  if (start == null || end == null || end <= start) return 0;
  return end - start;
}

export function getTodayPlanningRecommendation(now = new Date()) {
  const dateKey = getDateKey(now);
  const todayItems = getPlanningItemsByDate(dateKey);
  if (todayItems.length === 0) return { item: null, state: "none" };

  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const active = todayItems.find((item) => {
    const start = toMinutes(item.startTime);
    const end = toMinutes(item.endTime);
    return start != null && end != null && nowMinutes >= start && nowMinutes < end;
  });
  if (active) return { item: active, state: "active" };

  const next = todayItems.find((item) => {
    const start = toMinutes(item.startTime);
    return start != null && start > nowMinutes;
  });
  if (next) return { item: next, state: "next" };

  return { item: null, state: "none" };
}

export function subscribePlanning(callback) {
  function handler() {
    callback();
  }

  window.addEventListener(PLANNING_CHANGED_EVENT, handler);
  return () => window.removeEventListener(PLANNING_CHANGED_EVENT, handler);
}

export function addPlanningItem({
  dateKey = getDateKey(),
  title = "",
  startTime = "09:00",
  endTime = "09:30",
} = {}) {
  const safeTitle = String(title).trim().slice(0, 90);
  if (!safeTitle) return { ok: false, reason: "title-required" };

  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return { ok: false, reason: "invalid-time" };
  }

  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);
  if (startMinutes == null || endMinutes == null || endMinutes <= startMinutes) {
    return { ok: false, reason: "invalid-range" };
  }

  const safeDateKey = normalizeDateKey(dateKey, getDateKey());
  const now = new Date();
  const todayKey = getDateKey(now);
  if (safeDateKey < todayKey) {
    return { ok: false, reason: "past-time" };
  }

  const isToday = safeDateKey === todayKey;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (isToday && startMinutes < nowMinutes) {
    return { ok: false, reason: "past-time" };
  }

  const items = readAll();
  const sameDay = items.filter((item) => item.dateKey === safeDateKey);

  const overlap = sameDay.some((item) => {
    const itemStart = toMinutes(item.startTime);
    const itemEnd = toMinutes(item.endTime);
    if (itemStart == null || itemEnd == null) return false;
    return startMinutes < itemEnd && endMinutes > itemStart;
  });

  if (overlap) return { ok: false, reason: "overlap" };

  const newItem = normalizeItem({
    id: makeId(),
    dateKey: safeDateKey,
    title: safeTitle,
    startTime,
    endTime,
    createdAt: new Date().toISOString(),
  });

  if (!newItem) return { ok: false, reason: "invalid-item" };

  writeAll(sortItems([...items, newItem]));
  return { ok: true, item: newItem };
}

export function updatePlanningItem({
  id = "",
  title = "",
  startTime = "09:00",
  endTime = "09:30",
} = {}) {
  if (typeof id !== "string" || !id.trim()) {
    return { ok: false, reason: "invalid-id" };
  }

  const items = readAll();
  const current = items.find((item) => item.id === id);
  if (!current) return { ok: false, reason: "not-found" };

  const safeTitle = String(title).trim().slice(0, 90);
  if (!safeTitle) return { ok: false, reason: "title-required" };

  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return { ok: false, reason: "invalid-time" };
  }

  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);
  if (startMinutes == null || endMinutes == null || endMinutes <= startMinutes) {
    return { ok: false, reason: "invalid-range" };
  }

  const overlap = items
    .filter((item) => item.dateKey === current.dateKey && item.id !== current.id)
    .some((item) => {
      const itemStart = toMinutes(item.startTime);
      const itemEnd = toMinutes(item.endTime);
      if (itemStart == null || itemEnd == null) return false;
      return startMinutes < itemEnd && endMinutes > itemStart;
    });

  if (overlap) return { ok: false, reason: "overlap" };

  const updatedItem = normalizeItem({
    ...current,
    title: safeTitle,
    startTime,
    endTime,
  });

  if (!updatedItem) return { ok: false, reason: "invalid-item" };

  const next = items.map((item) => (item.id === current.id ? updatedItem : item));
  writeAll(sortItems(next));
  return { ok: true, item: updatedItem };
}

export function removePlanningItem(id) {
  const items = readAll();
  const next = items.filter((item) => item.id !== id);
  writeAll(sortItems(next));
}

export function markPlanningItemCompleted(id) {
  return setPlanningItemCompleted(id, true);
}

export function setPlanningItemCompleted(id, completed) {
  if (typeof id !== "string" || !id.trim()) {
    return { ok: false, reason: "invalid-id" };
  }

  const shouldBeCompleted = completed === true;
  const items = readAll();
  let found = false;
  let changed = false;

  const next = items.map((item) => {
    if (item.id !== id) return item;

    found = true;
    if (item.completed === shouldBeCompleted) return item;

    changed = true;
    return {
      ...item,
      completed: shouldBeCompleted,
      completedAt: shouldBeCompleted ? new Date().toISOString() : null,
    };
  });

  if (!found) return { ok: false, reason: "not-found" };

  if (changed) {
    writeAll(sortItems(next));
  }

  return { ok: true };
}

export function togglePlanningItemCompleted(id) {
  if (typeof id !== "string" || !id.trim()) {
    return { ok: false, reason: "invalid-id" };
  }

  const item = readAll().find((entry) => entry.id === id);
  if (!item) return { ok: false, reason: "not-found" };

  return setPlanningItemCompleted(id, !item.completed);
}

export function swapPlanningItemTimes(firstId, secondId) {
  if (typeof firstId !== "string" || !firstId.trim()) {
    return { ok: false, reason: "invalid-id" };
  }
  if (typeof secondId !== "string" || !secondId.trim()) {
    return { ok: false, reason: "invalid-id" };
  }
  if (firstId === secondId) return { ok: false, reason: "same-item" };

  const items = readAll();
  const first = items.find((item) => item.id === firstId);
  const second = items.find((item) => item.id === secondId);
  if (!first || !second) return { ok: false, reason: "not-found" };
  if (first.dateKey !== second.dateKey) return { ok: false, reason: "different-day" };

  const firstSwapped = normalizeItem({
    ...first,
    startTime: second.startTime,
    endTime: second.endTime,
  });
  const secondSwapped = normalizeItem({
    ...second,
    startTime: first.startTime,
    endTime: first.endTime,
  });

  if (!firstSwapped || !secondSwapped) {
    return { ok: false, reason: "invalid-item" };
  }

  const next = items.map((item) => {
    if (item.id === firstId) return firstSwapped;
    if (item.id === secondId) return secondSwapped;
    return item;
  });

  writeAll(sortItems(next));
  return { ok: true, first: firstSwapped, second: secondSwapped };
}

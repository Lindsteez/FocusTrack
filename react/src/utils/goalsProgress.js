import { getDefaultGoals } from "./goalsStore";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function clampPercent(value) {
  if (!Number.isFinite(value) || value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}

function toDateOrNull(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function getSessionSeconds(session) {
  const direct = Number(session?.seconds);
  if (Number.isFinite(direct) && direct >= 0) return Math.floor(direct);

  const duration = Number(session?.duration);
  if (Number.isFinite(duration) && duration >= 0) return Math.floor(duration);

  const elapsed = Number(session?.elapsedSeconds);
  if (Number.isFinite(elapsed) && elapsed >= 0) return Math.floor(elapsed);

  return 0;
}

function getLocalDayKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDayKeyToUtcMs(dayKey) {
  const [y, m, d] = dayKey.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function getStartOfToday(now) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getStartOfIsoWeek(now) {
  const start = getStartOfToday(now);
  const day = start.getDay(); // 0..6 (Sun..Sat)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday);
  return start;
}

function buildSuccessfulDaySet(totalsByDay, dailyGoalSeconds) {
  const successful = new Set();
  for (const [dayKey, seconds] of totalsByDay.entries()) {
    if (seconds >= dailyGoalSeconds) successful.add(dayKey);
  }
  return successful;
}

function getCurrentStreakDays(successfulDays, today) {
  let count = 0;
  const cursor = getStartOfToday(today);

  const todayKey = getLocalDayKey(cursor);
  if (!successfulDays.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (successfulDays.has(getLocalDayKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return count;
}

function getBestStreakDays(successfulDays) {
  const ordered = Array.from(successfulDays).sort();
  if (ordered.length === 0) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < ordered.length; i += 1) {
    const prevMs = parseDayKeyToUtcMs(ordered[i - 1]);
    const currMs = parseDayKeyToUtcMs(ordered[i]);

    if ((currMs - prevMs) / ONE_DAY_MS === 1) {
      current += 1;
    } else {
      current = 1;
    }

    if (current > best) best = current;
  }

  return best;
}

function normalizeGoals(goals) {
  const defaults = getDefaultGoals();
  const daily = Number(goals?.dailyMinutes);
  const weekly = Number(goals?.weeklyMinutes);

  return {
    dailyMinutes: Number.isFinite(daily) && daily > 0 ? Math.floor(daily) : defaults.dailyMinutes,
    weeklyMinutes:
      Number.isFinite(weekly) && weekly > 0 ? Math.floor(weekly) : defaults.weeklyMinutes,
  };
}

/**
 * Calculates daily and weekly goal progress together with streak metrics.
 *
 * @param {{
 *   sessions?: Array<object>,
 *   goals?: {dailyMinutes?: number, weeklyMinutes?: number} | null,
 *   now?: Date | string | number
 * }} [params]
 * @returns {{
 *   goals: {dailyMinutes: number, weeklyMinutes: number},
 *   todaySeconds: number,
 *   weekSeconds: number,
 *   dailyGoalSeconds: number,
 *   weeklyGoalSeconds: number,
 *   todayPercent: number,
 *   weekPercent: number,
 *   todayDone: boolean,
 *   weekDone: boolean,
 *   currentStreakDays: number,
 *   bestStreakDays: number
 * }}
 */
export function buildGoalsProgress({ sessions = [], goals = null, now = new Date() } = {}) {
  const safeNow = toDateOrNull(now) ?? new Date();
  const safeGoals = normalizeGoals(goals);

  const dailyGoalSeconds = safeGoals.dailyMinutes * 60;
  const weeklyGoalSeconds = safeGoals.weeklyMinutes * 60;

  const startOfToday = getStartOfToday(safeNow);
  const startOfTomorrow = new Date(startOfToday.getTime() + ONE_DAY_MS);
  const startOfWeek = getStartOfIsoWeek(safeNow);

  const totalsByDay = new Map();

  let todaySeconds = 0;
  let weekSeconds = 0;

  for (const session of sessions) {
    const date = toDateOrNull(
      session?.createdAt ??
        session?.date ??
        session?.startedAt ??
        session?.timestamp,
    );
    if (!date) continue;

    const seconds = getSessionSeconds(session);
    if (seconds <= 0) continue;

    const at = date.getTime();

    if (at >= startOfToday.getTime() && at < startOfTomorrow.getTime()) {
      todaySeconds += seconds;
    }

    if (at >= startOfWeek.getTime() && at < startOfTomorrow.getTime()) {
      weekSeconds += seconds;
    }

    const dayKey = getLocalDayKey(date);
    totalsByDay.set(dayKey, (totalsByDay.get(dayKey) ?? 0) + seconds);
  }

  const successfulDays = buildSuccessfulDaySet(totalsByDay, dailyGoalSeconds);
  const currentStreakDays = getCurrentStreakDays(successfulDays, safeNow);
  const bestStreakDays = getBestStreakDays(successfulDays);

  return {
    goals: safeGoals,
    todaySeconds,
    weekSeconds,
    dailyGoalSeconds,
    weeklyGoalSeconds,
    todayPercent: clampPercent((todaySeconds / dailyGoalSeconds) * 100),
    weekPercent: clampPercent((weekSeconds / weeklyGoalSeconds) * 100),
    todayDone: todaySeconds >= dailyGoalSeconds,
    weekDone: weekSeconds >= weeklyGoalSeconds,
    currentStreakDays,
    bestStreakDays,
  };
}

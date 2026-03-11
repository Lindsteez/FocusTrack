const GOALS_KEY = "focustrack.goals"
const GOALS_CHANGED_EVENT = "focustrack:goals-changed"

const DEFAULT_DAILY_MINUTES = 120
const DEFAULT_WEEKLY_MINUTES = 600

const DAILY_MINUTES_MIN = 1
const DAILY_MINUTES_MAX = 24 * 60
const WEEKLY_MINUTES_MIN = 1
const WEEKLY_MINUTES_MAX = 7 * 24 * 60

function toIntegerMinutes(value) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return null
  return Math.floor(numeric)
}

export function getDefaultGoals() {
  return {
    dailyMinutes: DEFAULT_DAILY_MINUTES,
    weeklyMinutes: DEFAULT_WEEKLY_MINUTES,
  }
}

export function isValidGoalMinutes(value) {
  const minutes = toIntegerMinutes(value)
  return minutes !== null && minutes >= 1
}

function normalizeGoals(raw) {
  const defaults = getDefaultGoals()

  const daily = toIntegerMinutes(raw?.dailyMinutes)
  const weekly = toIntegerMinutes(raw?.weeklyMinutes)

  const dailyMinutes =
    daily !== null && daily >= DAILY_MINUTES_MIN && daily <= DAILY_MINUTES_MAX
      ? daily
      : defaults.dailyMinutes

  const weeklyMinutes =
    weekly !== null &&
    weekly >= WEEKLY_MINUTES_MIN &&
    weekly <= WEEKLY_MINUTES_MAX
      ? weekly
      : defaults.weeklyMinutes

  return { dailyMinutes, weeklyMinutes }
}

export function getGoals() {
  try {
    const raw = localStorage.getItem(GOALS_KEY)
    if (!raw) return getDefaultGoals()

    const parsed = JSON.parse(raw)
    return normalizeGoals(parsed)
  } catch {
    return getDefaultGoals()
  }
}

export function subscribeGoals(callback) {
  function handler() {
    callback()
  }

  window.addEventListener(GOALS_CHANGED_EVENT, handler)
  return () => window.removeEventListener(GOALS_CHANGED_EVENT, handler)
}

export function saveGoals({ dailyMinutes, weeklyMinutes }) {
  const next = normalizeGoals({ dailyMinutes, weeklyMinutes })
  localStorage.setItem(GOALS_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(GOALS_CHANGED_EVENT))
  return next
}

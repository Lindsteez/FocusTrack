const TIMER_KEY = "focustrack.timer";

/**
 * Loads persisted timer state from localStorage.
 *
 * @returns {object | null}
 */
export function loadTimerState() {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Saves timer state to localStorage.
 *
 * @param {object} state
 * @returns {void}
 */
export function saveTimerState(state) {
  localStorage.setItem(TIMER_KEY, JSON.stringify(state));
}

/**
 * Clears persisted timer state.
 *
 * @returns {void}
 */
export function clearTimerState() {
  localStorage.removeItem(TIMER_KEY);
}

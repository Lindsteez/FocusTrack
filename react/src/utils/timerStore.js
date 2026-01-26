const TIMER_KEY = "focustrack.timer";

export function loadTimerState() {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveTimerState(state) {
  localStorage.setItem(TIMER_KEY, JSON.stringify(state));
}

export function clearTimerState() {
  localStorage.removeItem(TIMER_KEY);
}

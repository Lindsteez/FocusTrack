// src/hooks/useStatsData.js
import useSessions from "./useSessions";

function getSessionTimeMs(s) {
  const raw =
    s?.date ??
    s?.createdAt ??
    s?.startedAt ??
    s?.startTime ??
    s?.timestamp ??
    null;

  const t = raw ? new Date(raw).getTime() : NaN;
  return Number.isFinite(t) ? t : NaN;
}

function getDurationSeconds(s) {
 
  if (Number.isFinite(Number(s?.duration))) return Number(s.duration);

 
  if (Number.isFinite(Number(s?.seconds))) return Number(s.seconds);
  if (Number.isFinite(Number(s?.elapsedSeconds))) return Number(s.elapsedSeconds);
  if (Number.isFinite(Number(s?.accumulatedSeconds))) return Number(s.accumulatedSeconds);


  if (Number.isFinite(Number(s?.durationMs))) return Math.round(Number(s.durationMs) / 1000);

  
  const start = s?.startedAt ?? s?.startTime;
  const end = s?.endedAt ?? s?.endTime ?? s?.stoppedAt;
  const a = start ? new Date(start).getTime() : NaN;
  const b = end ? new Date(end).getTime() : NaN;
  if (Number.isFinite(a) && Number.isFinite(b) && b >= a) {
    return Math.round((b - a) / 1000);
  }

  return 0;
}

export default function useStatsData() {
  const { sessions } = useSessions();
  const all = sessions ?? [];

  const now = Date.now();
  const cutoff = now - 30 * 24 * 60 * 60 * 1000;

  const last30 = all.filter((s) => {
    const t = getSessionTimeMs(s);
    return Number.isFinite(t) && t >= cutoff && t <= now;
  });

  const sumDurationSeconds = (arr) =>
    arr.reduce((acc, s) => acc + getDurationSeconds(s), 0);

  return {
    last30DaysDuration: sumDurationSeconds(last30),
    last30DaysSessions: last30.length,
    totalDuration: sumDurationSeconds(all),
    totalSessions: all.length,
  };
}

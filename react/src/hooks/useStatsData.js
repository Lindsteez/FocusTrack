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

export default function useStatsData() {
  const { sessions } = useSessions();

  const all = sessions ?? [];

  const now = Date.now();
  const cutoff = now - 30 * 24 * 60 * 60 * 1000; 
  const last30 = all.filter((s) => {
    const t = getSessionTimeMs(s);
    
    return Number.isFinite(t) && t >= cutoff && t <= now;
  });

  const sumDuration = (arr) =>
    arr.reduce((acc, s) => acc + (Number(s?.duration) || 0), 0);

  const totalDuration = sumDuration(all);
  const totalSessions = all.length;

  const last30DaysDuration = sumDuration(last30);
  const last30DaysSessions = last30.length;

  return {
    last30DaysDuration,
    last30DaysSessions,
    totalDuration,
    totalSessions,
  };
}

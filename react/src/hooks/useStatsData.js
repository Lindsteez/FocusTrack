import { useMemo } from "react";
import useSessions from "./useSessions";

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function useStatsData() {
  const { sessions } = useSessions();

  const stats = useMemo(() => {

    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        totalDuration: 0,
        todayDuration: 0,
        last5Days: [],
      };
      
    }

    let totalDuration = 0;
    let todayDuration = 0;

    const today = new Date();

    sessions.forEach((s) => {
      const duration = s.seconds ?? 0;

      totalDuration += duration;

      if (s.createdAt) {
        const sessionDate = new Date(s.createdAt);
        if (isSameDay(sessionDate, today)) {
          todayDuration += duration;
        }
      }
    });

    // senaste 5 dagarna
    const days = [...Array(5)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    }).reverse();

    const last5Days = days.map((day) => {
      const duration = sessions.reduce((sum, s) => {
        if (!s.createdAt) return sum;
        const sd = new Date(s.createdAt);
        if (isSameDay(sd, day)) {
          return sum + (s.duration ?? 0);
        }
        return sum;
      }, 0);

      return {
        date: day,
        duration,
      };
    });

    return {
      totalSessions: sessions.length,
      totalDuration,
      todayDuration,
      last5Days,
    };
  }, [sessions]);

  return stats;
}

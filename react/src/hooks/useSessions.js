import { useEffect, useState } from "react";
import { getSessions, subscribeSessions } from "../utils/sessionsStore";

export default function useSessions() {
  const [sessions, setSessions] = useState(() => getSessions());

  useEffect(() => {
    return subscribeSessions(() => {
      setSessions(getSessions());
    });
  }, []);

  return sessions;
}

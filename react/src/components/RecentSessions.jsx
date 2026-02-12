// src/components/RecentSessions.jsx
import Card from "./Card";
import SessionsList from "./SessionList";

export default function RecentSessions() {
  return (
    <Card title="Recent Sessions">
      <SessionsList limit={5} emptyText="No sessions yet." />
    </Card>
  );
}

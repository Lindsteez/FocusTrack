// src/components/History.jsx
import Card from "../components/Card";
import SessionsList from "../components/SessionList";

export default function History() {
  return (
    <Card title="History">
      <SessionsList limit={200} emptyText="No sessions in history yet." />
    </Card>
  );
}
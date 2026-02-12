// src/components/History.jsx
import Card from "../components/Card";
import SessionsList from "../components/SessionList";
import styles from "../pages/History.module.css"

export default function History() {
  return (
    <section className={styles.history}>
      <Card title="History">
        <SessionsList limit={200} emptyText="No sessions in history yet." />
      </Card>
    </section>
  );
}
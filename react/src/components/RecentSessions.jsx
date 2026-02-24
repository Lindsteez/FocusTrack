import Card from "./Card";
import SessionsList from "./SessionList";
import styles from "./RecentSessions.module.css";

export default function RecentSessions() {
  return (
    <Card title="Recent Sessions">
      <div className={styles.body}>
        <SessionsList limit={5} />
      </div>
    </Card>
  );
}
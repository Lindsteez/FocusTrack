import { useLanguage } from "../hooks/useLanguage";
import Card from "./Card";
import SessionsList from "./SessionList";
import styles from "./RecentSessions.module.css";

export default function RecentSessions() {
  const { t } = useLanguage();

  return (
    <Card title={`${t("recent.title")}`}>
      <div className={styles.body}>
        <SessionsList
          limit={5}
          emptyText={t("recent.noSessions")}
        />
      </div>
    </Card>
  );
}
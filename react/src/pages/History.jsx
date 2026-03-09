// src/components/History.jsx
import Card from "../components/Card";
import SessionsList from "../components/SessionList";
import styles from "../pages/History.module.css"
import { useLanguage } from "../hooks/useLanguage";

export default function History() {
  const { t } = useLanguage();
  return (
    <section className={styles.history}>
      <div className={styles.historyPanel}>
        <Card title={`${t('nav.history')}`}>
          <SessionsList
            limit={200}
            emptyText={t("recent.noSessions")}
            showLoadMore
            pageSize={10}
          />
        </Card>
      </div>
    </section>
  );
}

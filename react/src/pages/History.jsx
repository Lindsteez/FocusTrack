// src/components/History.jsx
import Card from "../components/Card";
import SessionsList from "../components/SessionList";
import styles from "../pages/History.module.css"
import { useLanguage } from "../hooks/useLanguage";

export default function History() {
  const { t } = useLanguage();
  return (
    <section className={styles.history}>
      <Card title={`${t('nav.history')}`}>
        <SessionsList
          limit={200}
          emptyText="No sessions in history yet."
          showLoadMore
          pageSize={10}
          pageScrollOnMobile
        />
      </Card>
    </section>
  );
}

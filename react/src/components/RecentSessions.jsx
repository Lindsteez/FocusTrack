// src/components/RecentSessions.jsx
import { useLanguage } from "../hooks/useLanguage";
import Card from "./Card";
import SessionsList from "./SessionList";

export default function RecentSessions() {
  const { t } = useLanguage()
  return (
    <Card title= {`${t('recent.title')}`}>
      <SessionsList limit={5} emptyText={t('recent.noSessions')} />
    </Card>
  );
}

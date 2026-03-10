import Card from "./Card";
import useStatsData from "../hooks/useStatsData";
import { useLanguage } from "../hooks/useLanguage";
import "./StatsSummary.css";

function formatSeconds(sec) {
  if (!sec) return "0m";
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return h > 0 ? `${h}h ${mm}m` : `${mm}m`;
}

export default function StatsSummary() {
  const { t } = useLanguage();
  const {
    last30DaysDuration,
    last30DaysSessions,
    totalDuration,
   
  } = useStatsData();

  const items = [
    { label: `${t('stats.lastDays')}`, value: formatSeconds(last30DaysDuration) },
    { label: `${t('stats.totalTime')}`, value: formatSeconds(totalDuration) },
    { label: `${t('stats.sessions')}`, value: String(last30DaysSessions ?? 0) },
  ];
  return (
    <Card title={`${t('stats.title')}`}>
      <div className="statsSummaryGrid">
        {items.map((item) => (
          <article key={item.label} className="statsSummaryItem">
            <div className="statsSummaryLabel">{item.label}</div>
            <div className="statsSummaryValue">{item.value}</div>
          </article>
        ))}
      </div>
    </Card>
  );
}

import Card from "./Card";
import useStatsData from "../hooks/useStatsData";

function formatSeconds(sec) {
  if (!sec) return "0m";
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return h > 0 ? `${h}h ${mm}m` : `${mm}m`;
}

export default function StatsSummary() {
  const {
    last30DaysDuration,
    last30DaysSessions,
    totalDuration,
   
  } = useStatsData();

  const items = [
    { label: "Last 30 days", value: formatSeconds(last30DaysDuration) },
    { label: "Total time", value: formatSeconds(totalDuration) },
    { label: "Sessions", value: String(last30DaysSessions ?? 0) },
  ];

  return (
    <Card title="Stats">
      <div
        style={{
          display: "flex",
          gap: 14,
          flexWrap: "wrap",
          alignItems: "stretch",
          paddingTop: 6,
        }}
      >
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              flex: "1 1 160px",
              minWidth: 160,
              padding: "14px 14px 12px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(10,16,28,0.18)",
              backdropFilter: "blur(6px)",
              textAlign: "left",
            }}
          >
            <div
              style={{
                fontSize: 11,
                opacity: 0.7,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              {item.label}
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 650,
                lineHeight: 1.1,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

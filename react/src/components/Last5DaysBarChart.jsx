import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { buildLast5DaysData } from "../utils/chartsData";
import { getSessions } from "../utils/sessionsStore";
import Card from "./Card";

function energyToColor(energyRounded) {
    switch (energyRounded) {
        case 1: return "#D36460"; //röd
        case 2: return "#da9944"; //orange
        case 3: return "#ebdf73"; //gul
        case 4: return "#76A076"; //grön
        case 5: return "#0b9265"; //turkos
        default: return "#9ca3af"; //grå
    }
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const isLight = document.body.getAttribute("data-theme") === "light";

    return (
        <div style={{
            background: isLight ? "#E8F1F2" : "#2A2F42",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "10px 12px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        }}>
            <div style={{ fontWeight: 700, marginBottom: 6}}>{label}</div>
            <div>Total tid: <b>{d.totalLabel}</b></div>
            <div>Energi: <b>{d.energy > 0 ? d.energy : "-"}</b></div>
        </div>
    );
}

function EnergyBarShape(props) {
  const { x, y, width, height, payload } = props;

  if (!height || height <= 0) return null;

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={10}
      ry={10}
      fill={energyToColor(payload.energyRounded)}
    />
  );
}

export default function Last5DaysBarChart() {
const data = useMemo(() => {
  const sessions = getSessions?.() ?? [];

 
  const result = buildLast5DaysData(sessions);
  return result;
}, []);

  const yConfig = useMemo(() => {
      const max = Math.max(0, ...data.map(d => d.totalSeconds ?? 0));
      const maxMinutes = max / 60;

      let stepMinutes;

      if (maxMinutes <= 10) stepMinutes = 1;
      else if (maxMinutes <= 30) stepMinutes = 2;
      else if (maxMinutes <= 90) stepMinutes = 5;
      else stepMinutes = 10;

      const stepSeconds = stepMinutes * 60;
      const maxRounded = Math.ceil(max / stepSeconds) * stepSeconds;

      const ticks = [];
      for (let t = 0; t <= maxRounded; t += stepSeconds) {
        ticks.push(t);
      }

      return { ticks, maxRounded };
    }, [data]);

return (
  <Card title="Previous 5 days">
    <div style={{ width: "100%", height: 347 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 10, right: 16, left: 0, bottom: 10 }}
        >
          <XAxis dataKey="date" tickMargin={8} />
          <YAxis
            domain={[0, yConfig.maxRounded]}
            ticks={yConfig.ticks}
            tickFormatter={(v) => {
              const total = Math.max(0, Math.floor(Number(v) || 0));
              const h = Math.floor(total / 3600);
              const m = Math.floor((total % 3600) / 60);

              if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
              return `${m}m`;
            }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="totalSeconds"
            shape={<EnergyBarShape />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </Card>
);
}
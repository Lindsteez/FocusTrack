import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { buildLast5DaysData } from "../utils/chartsData";
import { getSessions } from "../utils/sessionsStore";
import Card from "./Card";
import { useLanguage } from "../hooks/useLanguage";

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
      const { t } = useLanguage()
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
            <div>{t('prev.totalTime')} <b>{d.totalLabel}</b></div>
            <div>{t('timer.energy')} <b>{d.energy > 0 ? d.energy : "-"}</b></div>
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
      const { t } = useLanguage()
const data = useMemo(() => {
  const sessions = getSessions?.() ?? [];

 
  const result = buildLast5DaysData(sessions);
  return result;
}, []);

    const yConfig = useMemo(() => {
      const max = Math.max(0, ...data.map(d => d.totalSeconds ?? 0));

      let step;

      if (max >= 24 * 3600) {
        step = 4 * 3600; // 4h 
      } else if (max >= 12 * 3600) {
        step = 2 * 3600; // 2h 
      } else if (max >= 3600) {
        step = 3600; // 1h 
      } else if (max >= 600) {
        step = 600; // 10m
      } else {
        step = 60; // 1m
      }

      const maxRounded = Math.ceil(max / step) * step;

      const ticks = [];
      for (let t = 0; t <= maxRounded; t += step) {
        ticks.push(t);
      }

      return { ticks, maxRounded, step };
    }, [data]);

return (
<Card title= {`${t('prev.title')}`}>
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
              if (yConfig.step >= 3600) {
                return `${Math.floor(v / 3600)}h`;
              }
              return `${Math.floor(v / 60)}m`;
            }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
            <CartesianGrid
              stroke="rgba(128,128,128,0.2)"
              strokeDasharray="3 3"
              vertical={false}
            />
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
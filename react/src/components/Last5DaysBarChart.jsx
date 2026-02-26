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

function energyToColor(energyRounded) {
  switch (energyRounded) {
    case 1: return "#D36460"; // red
    case 2: return "#da9944"; // orange
    case 3: return "#ebdf73"; // yellow
    case 4: return "#76A076"; // green
    case 5: return "#0b9265"; // teal
    default: return "#9ca3af"; // gray
  }
}

function formatTimeAxis(seconds, step) {
  // For very small ranges: show seconds ticks
  if (step < 60) return `${seconds}s`;

  // Up to 10 minutes: show minutes with 1 decimal for readability
  if (seconds <= 600) {
    const m = seconds / 60;
    return `${m.toFixed(m % 1 === 0 ? 0 : 1)}m`;
  }

  // Up to 1 hour: integer minutes
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;

  // 1h+: hours
  return `${Math.round(seconds / 3600)}h`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const isLight = document.body.getAttribute("data-theme") === "light";

  return (
    <div
      style={{
        background: isLight ? "#E8F1F2" : "#2A2F42",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 10,
        padding: "10px 12px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div>
        Total tid: <b>{d.totalLabel}</b>
      </div>
      <div>
        Energi: <b>{d.energy > 0 ? d.energy : "-"}</b>
      </div>
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
    return buildLast5DaysData(sessions);
  }, []);

  const yConfig = useMemo(() => {
    const max = Math.max(0, ...data.map((d) => d.totalSeconds ?? 0));

    // Add headroom so bars don't stick to the top
    const padded = max === 0 ? 60 : Math.ceil(max * 1.25);

    let step;
    if (padded <= 120) step = 15;          // up to 2m -> 15s steps
    else if (padded <= 300) step = 30;     // up to 5m -> 30s
    else if (padded <= 600) step = 60;     // up to 10m -> 1m
    else if (padded <= 1800) step = 300;   // up to 30m -> 5m
    else if (padded <= 3600) step = 600;   // up to 1h -> 10m
    else if (padded <= 12 * 3600) step = 3600; // up to 12h -> 1h
    else step = 2 * 3600;                  // 2h

    const maxRounded = Math.max(step, Math.ceil(padded / step) * step);

    // Build ticks (aim for ~6)
    const ticks = [];
    for (let t = 0; t <= maxRounded; t += step) ticks.push(t);

    return { ticks, maxRounded, step };
  }, [data]);

  return (
    <Card title="Previous 5 days">
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, left: 6, bottom: 8 }}
            barCategoryGap="35%"
          >
            <CartesianGrid
              stroke="rgba(128,128,128,0.18)"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickMargin={8}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />

            <YAxis
              domain={[0, yConfig.maxRounded]}
              ticks={yConfig.ticks}
              tickFormatter={(v) => formatTimeAxis(v, yConfig.step)}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              width={44}
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar
              dataKey="totalSeconds"
              shape={<EnergyBarShape />}
              barSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
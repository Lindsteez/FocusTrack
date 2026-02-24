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
    case 1:
      return "#D36460"; // red
    case 2:
      return "#da9944"; // orange
    case 3:
      return "#ebdf73"; // yellow
    case 4:
      return "#76A076"; // green
    case 5:
      return "#0b9265"; // teal
    default:
      return "#9ca3af"; // gray
  }
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
        boxShadow: "0 8px 20px rgba(0,0,0,0.14)",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div>
        Total time: <b>{d.totalLabel}</b>
      </div>
      <div>
        Energy: <b>{d.energy > 0 ? d.energy : "-"}</b>
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
      rx={8}
      ry={8}
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

    // "Zoom out": always show a meaningful scale even if data is tiny
    // (prevents the 0m/1m-only axis look)
    const minVisibleMax = 30 * 60; // 30 minutes
    const maxForScale = Math.max(max, minVisibleMax);

    let step;
    if (maxForScale >= 24 * 3600) step = 4 * 3600; // 4h
    else if (maxForScale >= 12 * 3600) step = 2 * 3600; // 2h
    else if (maxForScale >= 3600) step = 3600; // 1h
    else if (maxForScale >= 30 * 60) step = 5 * 60; // 5m
    else if (maxForScale >= 10 * 60) step = 2 * 60; // 2m
    else step = 60; // 1m

    const maxRounded = Math.ceil(maxForScale / step) * step;

    const ticks = [];
    for (let t = 0; t <= maxRounded; t += step) ticks.push(t);

    // A bit of headroom so it feels less cramped
    const domainMax = Math.ceil(maxRounded * 1.15);

    return { ticks, domainMax, step };
  }, [data]);

  return (
    <Card title="Previous 5 days">
      <div style={{ width: "100%", height: "100%", minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 12, left: 0, bottom: 6 }}
            barCategoryGap="28%"
          >
            <CartesianGrid
              stroke="rgba(128,128,128,0.18)"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickMargin={6}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
            />

            <YAxis
              domain={[0, yConfig.domainMax]}
              ticks={yConfig.ticks}
              interval={0}
              tickMargin={6}
              width={40}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => {
                if (yConfig.step >= 3600) return `${Math.floor(v / 3600)}h`;
                return `${Math.floor(v / 60)}m`;
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar
              dataKey="totalSeconds"
              shape={<EnergyBarShape />}
              barSize={14} // thinner bars
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
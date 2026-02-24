import { useMemo } from "react";
import {
  LineChart,
  Line,
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
    case 1: return "#D36460";
    case 2: return "#da9944";
    case 3: return "#ebdf73";
    case 4: return "#76A076";
    case 5: return "#27a525";
    default: return "#9ca3af";
  }
}

function EnergyDot(props) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null) return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={energyToColor(payload.energyRounded)}
      stroke="rgba(0,0,0,0.15)"
      strokeWidth={1}
    />
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const isLight = document.body.getAttribute("data-theme") === "light";

  return (
    <div
      style={{
        background: isLight ? "#E8F1F2" : "#2A2F42",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "10px 12px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        maxWidth: 320,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div>Total time: <b>{d.totalLabel}</b></div>
      <div>Energy (avarage): <b>{d.energy > 0 ? d.energy : "-"}</b></div>

      <div style={{ marginTop: 8, fontWeight: 700 }}>Session(s)</div>
      {d.sessions?.length ? (
        <div style={{ marginTop: 4, display: "grid", gap: 4 }}>
          {d.sessions.map((s, idx) => (
            <div
              key={`${s.atMs}-${idx}`}
              style={{ display: "flex", gap: 8, alignItems: "baseline" }}
            >
              <span style={{ fontVariantNumeric: "tabular-nums", minWidth: 46 }}>
                {s.time}
              </span>
              <span style={{ fontWeight: 600 }}>{s.durationLabel}</span>
              <span style={{ opacity: 0.85 }}>
                {s.energy ? `• E${s.energy}` : ""}
                {s.title ? ` • ${s.title}` : ""}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 4, opacity: 0.85 }}>Inga pass</div>
      )}
    </div>
  );
}

export default function Last5DaysLineChart() {
  const data = useMemo(() => {
    const sessions = getSessions?.() ?? [];
    return buildLast5DaysData(sessions);
  }, []);

  const yConfig = useMemo(() => {
    const max = Math.max(0, ...data.map((d) => d.totalSeconds ?? 0));

    let step;
    if (max >= 24 * 3600) step = 4 * 3600;
    else if (max >= 12 * 3600) step = 2 * 3600;
    else if (max >= 3600) step = 3600;
    else if (max >= 600) step = 600;
    else step = 60;

    const maxRounded = Math.ceil(max / step) * step;

    const ticks = [];
    for (let t = 0; t <= maxRounded; t += step) ticks.push(t);

    return { ticks, maxRounded, step };
  }, [data]);

  return (
    <Card title="Previous 5 days">
      <div style={{ width: "100%", height: 347 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
            <XAxis dataKey="date" tickMargin={8} />
            <YAxis
              domain={[0, yConfig.maxRounded]}
              ticks={yConfig.ticks}
              tickFormatter={(v) => {
                if (yConfig.step >= 3600) return `${Math.floor(v / 3600)}h`;
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

            <Line
              type="linear"
              dataKey="totalSeconds"
              stroke="rgba(128,128,128,0.9)"
              strokeWidth={2}
              dot={<EnergyDot />}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

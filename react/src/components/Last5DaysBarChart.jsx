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
import { useLanguage } from "../hooks/useLanguage";
import "./Last5DaysBarChart.css";

/**
 * Maps energy level to a dot color (used in the line chart dots).
 */
function energyToColor(energyRounded) {
  switch (energyRounded) {
    case 1:
      return "#D36460";
    case 2:
      return "#da9944";
    case 3:
      return "#ebdf73";
    case 4:
      return "#76A076";
    case 5:
      return "#27a525";
    default:
      return "#9ca3af";
  }
}

/**
 * Dot renderer: colors each dot based on average energy of that day.
 */
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

/**
 * Tooltip (dev version): shows total time + avg energy + list of sessions (if provided).
 */
function CustomTooltip({ active, payload, label }) {
  const { t } = useLanguage();
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

      <div>
        {t("prev.totalTime")} <b>{d.totalLabel}</b>
      </div>

      <div>
        {t("timer.energy")} ({t("prev.avarage")}):{" "}
        <b>{d.energy > 0 ? d.energy : "-"}</b>
      </div>

      <div style={{ marginTop: 8, fontWeight: 700 }}>{t("stats.sessions")}</div>

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
        <div style={{ marginTop: 4, opacity: 0.85 }}>{t("prev.noSessions")}</div>
      )}
    </div>
  );
}

/**
 * Builds Y-axis ticks and "zoom out" scaling:
 * - adds headroom (so the line isn't glued to the top)
 * - chooses a readable step (60s, 10m, 1h, etc.)
 */
function buildYAxisConfig(data) {
  const max = Math.max(0, ...data.map((d) => d.totalSeconds ?? 0));

  // Add headroom so it "zooms out" nicely
  const padded = max === 0 ? 60 : Math.ceil(max * 1.25);

  let step;
  if (padded <= 120) step = 15; // up to 2m -> 15s
  else if (padded <= 300) step = 30; // up to 5m -> 30s
  else if (padded <= 600) step = 60; // up to 10m -> 1m
  else if (padded <= 1800) step = 300; // up to 30m -> 5m
  else if (padded <= 3600) step = 600; // up to 1h -> 10m
  else if (padded <= 3 * 3600) step = 1800; // up to 3h -> 30m
  else if (padded <= 12 * 3600) step = 3600; // up to 12h -> 1h
  else step = 2 * 3600; // 2h

  const maxRounded = Math.max(step, Math.ceil(padded / step) * step);

  const ticks = [];
  for (let t = 0; t <= maxRounded; t += step) ticks.push(t);

  return { ticks, maxRounded, step };
}

/**
 * Formats Y-axis labels based on step.
 */
function formatYAxisTick(value, step) {
  if (step < 60) return `${value}s`;
  if (step < 3600) {
    const mins = value / 60;
    if (mins >= 60) {
      const hours = mins / 60;
      return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
    }
    return `${mins}m`;
  }
  return `${Math.floor(value / 3600)}h`;
}

export default function Last5DaysBarChart() {
  const { t } = useLanguage();

  const data = useMemo(() => {
    const sessions = getSessions?.() ?? [];
    return buildLast5DaysData(sessions);
  }, []);

  const yConfig = useMemo(() => buildYAxisConfig(data), [data]);

  return (
    <Card title={`${t("prev.title")}`}>
      <div className="chartCanvas">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 10 }}>
            <CartesianGrid
              stroke="rgba(128,128,128,0.18)"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis dataKey="date" tickMargin={8} />

            <YAxis
              domain={[0, yConfig.maxRounded]}
              ticks={yConfig.ticks}
              tickFormatter={(v) => formatYAxisTick(v, yConfig.step)}
              width={44}
            />

            <Tooltip content={<CustomTooltip />} />

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

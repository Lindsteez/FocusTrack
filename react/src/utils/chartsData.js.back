function startOfDayMs(ms) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function labelMMDD(ms) {
  const d = new Date(ms);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
}

function formatDuration(seconds) {
  const s = Number(seconds);
  if (!Number.isFinite(s) || s <= 0) return "0m";

  const whole = Math.floor(s);
  const h = Math.floor(whole / 3600);
  const m = Math.floor((whole % 3600) / 60);
  const sec = whole % 60;

  // Visa sekunder när det är korta pass
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function toMs(createdAt) {
  if (!createdAt) return null;
  if (typeof createdAt === "number") return createdAt;

  const str = String(createdAt);

  if (/^\d+$/.test(str)) return Number(str);

  // ISO eller annat datumformat
  const parsed = Date.parse(str);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildLast5DaysData(sessions) {
  const today = startOfDayMs(Date.now());

  // Skapa exakt 5 dagar (inkl idag)
  const days = Array.from({ length: 5 }, (_, i) => {
    const dayMs = today - (4 - i) * 24 * 60 * 60 * 1000;
    return {
      dayMs,
      dayKey: labelMMDD(dayMs),
      totalSeconds: 0,
      weightedEnergySum: 0,
      energyWeightSeconds: 0,
    };
  });

  const byKey = new Map(days.map((d) => [d.dayKey, d]));

  for (const s of sessions ?? []) {
    const createdAtMs = toMs(s.createdAt);
    if (!createdAtMs) continue;

    const key = labelMMDD(startOfDayMs(createdAtMs));
    const row = byKey.get(key);
    if (!row) continue;

    const sec = Number(s.seconds) || 0;

    // Energi: ta från fältet (nya sessions)
    let e = Number(s.energyLevel) || 0;

    // Fallback
    if (!e) {
      const m = String(s.description ?? "").match(/Energy:\s*([1-5])/i);
      if (m) e = Number(m[1]);
    }

    row.totalSeconds += sec;

    if (e >= 1 && e <= 5 && sec > 0) {
      row.weightedEnergySum += e * sec;
      row.energyWeightSeconds += sec;
    }
  }

  return days.map((d) => {
    const avgEnergy =
      d.energyWeightSeconds > 0
        ? d.weightedEnergySum / d.energyWeightSeconds
        : 0;

    return {
      date: d.dayKey,
      totalSeconds: d.totalSeconds,
      totalLabel: formatDuration(d.totalSeconds),
      energy: Math.round(avgEnergy * 10) / 10,
      energyRounded: avgEnergy > 0 ? Math.round(avgEnergy) : 0,
    };
  });
}
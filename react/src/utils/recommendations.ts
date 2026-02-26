import { getSessions } from "./sessionsStore";


export type EnergyLevel = number | string | null;

export interface Session {
    id: string;
    seconds: number;
    createdAt: string;

    rating: number | null;
    energyLevel: EnergyLevel;

    // optional 
    focusMode?: string | null;
    label?: string;
    description?: string;
    note?: string;
    category?: string; 
}

// const all = (getSessions() as Session[]) ?? [];

const PRESET_MINUTES = [5, 10, 15, 20, 25, 30, 40, 50, 60] as const;
type PresetMinute = typeof PRESET_MINUTES[number];

function clamp(n: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, n));
}

function avg(nums: number[]): number | null {
    if (nums.length === 0) return null;
    return nums.reduce((a,b) => a + b, 0) / nums.length;
}

function median(nums: number[]): number | null {
    if (nums.length === 0) return null;
    const a = [...nums].sort((x, y) => x - y);
    const mid = Math.floor(a.length / 2);
    return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

function bucketMinutes(minutes: number): PresetMinute {
    let best: PresetMinute = PRESET_MINUTES[0];
    let bestDiff = Math.abs(minutes - best);

    for (const p of PRESET_MINUTES) {
        const d = Math.abs(minutes - p);
        if (d < bestDiff) {
        best = p;
        bestDiff = d;
        }
    }
    return best;
}


function lastNDays(sessions: Session[], days:number): Session[] {
    const now = Date.now();
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    return sessions.filter(s => new Date(s.createdAt).getTime() >= cutoff);
}

function normalizeEnergyLevel(energyLevel: EnergyLevel): EnergyLevel {
    if (energyLevel === null || energyLevel === undefined) return null;
    const n = Number(energyLevel);
    return Number.isFinite(n) ? n : String(energyLevel);
}

export interface Recommendations {
    recommendedMinutes: number;
    baseRecommendedMinutes: number;
    streak4: number;
    last5Avg: number | null;
    burnout: boolean;
    confidence: number;
    tips: string[];
}


type BucketStats = { sum: number; count: number; recency: number };

export function buildRecommendations(
    params: { energyLevel?: EnergyLevel; focusMode?: string | null } = {}
): Recommendations {
    const { energyLevel = null, focusMode = null } = params;

    let all = ((getSessions() as Session[]) ?? []).slice();
        if (all.length === 0 || all.every((s) => s.rating == null)) {
        all = generateMockSessions();
        }
    
    const energy = normalizeEnergyLevel(energyLevel);

    const sessions30 = lastNDays(all, 30);
    const sessions = sessions30.length > 0 ? sessions30 : all;

    const rated = sessions
    .map((s) => ({ ...s, rating: s.rating == null ? null : Number(s.rating) }))
    .filter((s): s is Session & { rating: number } => Number.isFinite(s.rating));

// more code incoming in next push

    const energyRated =
        energy === null 
            ? rated
            : rated.filter((s) => normalizeEnergyLevel(s.energyLevel) === energy);

    const modeRated =
        focusMode == null
            ? rated
            : rated.filter((s) => (s.focusMode ?? null) === focusMode);

    const modeEnergyRated =
        energy === null
        ? modeRated
        : modeRated.filter((s) => normalizeEnergyLevel(s.energyLevel) === energy);

    function recommendDurationForm(
    dataRated: Array<Session & { rating: number }>
    ): number | null {
    if (dataRated.length === 0) return null;

    const buckets = new Map<number, BucketStats>();
    const now = Date.now();

    for (const s of dataRated) {
        const minsRaw = s.seconds / 60;
        if (!minsRaw) continue;

        const mins = bucketMinutes(minsRaw);
        const prev = buckets.get(mins) ?? { sum: 0, count: 0, recency: 0 };

        const hoursAgo = (now - new Date(s.createdAt).getTime()) / 36e5;
        const recencyBonus = 1 / (1 + hoursAgo / 24);

        prev.sum += s.rating;
        prev.count += 1;
        prev.recency += recencyBonus;

        buckets.set(mins, prev);
    }

    let bestMins: number | null = null;
    let bestScore = -Infinity;

    for (const [mins, v] of buckets.entries()) {
        if (v.count < 2) continue;

        const avgRating = v.sum / v.count;
        const score = avgRating * 10 + v.recency + Math.min(3, v.count) * 0.5;

        if (score > bestScore) {
        bestScore = score;
        bestMins = mins;
        }
    }

    if (bestMins === null) {
        const minsAll = dataRated.map((s) => s.seconds / 60).filter(Boolean);
        return bucketMinutes(median(minsAll) ?? 10);
    }

    return bestMins;
    }

        let recommendedMinutes = recommendDurationForm(modeEnergyRated);

        if (recommendedMinutes === null) {
        recommendedMinutes = recommendDurationForm(energyRated);
        }
        if (recommendedMinutes === null) {
        recommendedMinutes = recommendDurationForm(modeRated);
        }
        if (recommendedMinutes === null) {
        recommendedMinutes = recommendDurationForm(rated) ?? 10;
        }

    const confidence = clamp((energyRated.length || 0) / 10, 0.2, 1);

    return {
    recommendedMinutes,
    baseRecommendedMinutes: recommendedMinutes,
    streak4: 0,
    last5Avg: null,
    burnout: false,
    confidence,
    tips: [],
};
}



function generateMockSessions(): Session[] {
  const now = Date.now();

  const mk = (
    id: string,
    mins: number,
    daysAgo: number,
    rating: number,
    energyLevel: number,
    focusMode: "Work" | "Meeting" | "Break"
  ): Session => ({
    id,
    seconds: mins * 60,
    createdAt: new Date(now - daysAgo * 86400000).toISOString(),
    rating,
    energyLevel,
    focusMode,
  });

  return [
    // Work: brukar funka bäst runt 25 min
    mk("w1", 25, 1, 5, 4, "Work"),
    mk("w2", 25, 2, 4, 3, "Work"),
    mk("w3", 20, 4, 4, 2, "Work"),
    mk("w4", 30, 6, 3, 5, "Work"),

    // Meeting: ofta längre och lite lägre rating
    mk("m1", 45, 1, 3, 3, "Meeting"),
    mk("m2", 50, 3, 2, 2, "Meeting"),
    mk("m3", 40, 5, 3, 4, "Meeting"),
    mk("m4", 60, 8, 2, 3, "Meeting"),

    // Break: korta pauser med hög rating
    mk("b1", 5, 1, 5, 2, "Break"),
    mk("b2", 10, 2, 5, 3, "Break"),
    mk("b3", 10, 4, 4, 1, "Break"),
    mk("b4", 15, 6, 3, 4, "Break"),
  ];
}
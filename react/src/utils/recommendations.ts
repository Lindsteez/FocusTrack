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

import { getSessions } from "./sessionsStore";

const all = (getSessions() as Session[]) ?? [];

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
    if (nums.lenght === 0) return null;
    const a = [...nums].sort((a,b) => a - b);
    const mid = Math.floor(a.length / 2);
    return a.length % 2 === 0 ? a[mid] : (a[mid -1] + a[mid]) / 2;
}

function bucketMinutes(minutes: number): PresetMinute {
    let best: PresetMinute = PRESET_MINUTES[0];
    let bestDiff = Math.abs(minutes - best);

    for (const m of PRESET_MINUTES) {
        const d = Math.abs(minutes - m);
        id (d < bestDiff) {
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

function normalizeEnergyLevel(Level: EnergyLevel): EnergyLevel {
    if (energyLevel === null) return null;

    const n = Number(energyLevel);
    return Number.isFinite(n) ? n : String(energyLevel);
}

export interface Recommendations {
    reocommendedMinutes: number;
    baseRecommendedMinutes: number;
    streak4: number;
    last5Avg: number | null;
    burnout: boolean;
    confidence: number;
    tips: string[];
}

export function buildRecommendations(
    params: { energyLevel?: EnergyLevel } = {}
): Recommendations {
    const { energyLevel = null } = params;

    const all = ((getSessions() as Session[]) ?? []).slice();
    const energy = normalizeEnergyLevel(energyLevel);

    const sessions30 = lastNDays(all, 30);
    const sessions = sessions30.length > 0 sessions30 : all;

    const rated = sessions 
    .map((s) => ({...s, rating: s.rating == null ? null : Number(s.rating)  }))
    .filter((s) : s is Session & { rating : number } => Number.isFinite(s.rating);
)}

// more code incoming in next push
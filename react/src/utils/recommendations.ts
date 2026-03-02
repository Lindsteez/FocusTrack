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

// rekommenderade minuter som bucketas till närmaste preset
const PRESET_MINUTES = [5, 10, 15, 20, 25, 30, 40, 50, 60] as const;
type PresetMinute = typeof PRESET_MINUTES[number];

// hjälpfunktioner
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

// bucketa minuter till närmaste preset
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

// filtrerar sessioner som är inom de senaste n dagarna
function lastNDays(sessions: Session[], days:number): Session[] {
    const now = Date.now();
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    return sessions.filter(s => new Date(s.createdAt).getTime() >= cutoff);
}

// normaliserar energylevel så att "3", 3 och "3.0" behandlas lika
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

// huvudfunktionen som bygger rekommendation baserat på tidigare sessioner, energy level och focus mode
export function buildRecommendations(
    params: { energyLevel?: EnergyLevel; focusMode?: string | null } = {}
): Recommendations {
    const { energyLevel = null, focusMode = null } = params;
    //hämtar och gör kopia av LS, om tom eller inga ratings så generera mockdata
    let all = ((getSessions() as Session[]) ?? []).slice();
        if (all.length === 0 || all.every((s) => s.rating == null)) {
        all = generateMockSessions();
        }
    
    const energy = normalizeEnergyLevel(energyLevel);

    // kollar de senaste 30 dagarna först, annars alla
    const sessions30 = lastNDays(all, 30);
    const sessions = sessions30.length > 0 ? sessions30 : all;

    // filtrerar bort de utan rating och konverterar rating till number
    const rated = sessions
    .map((s) => ({ ...s, rating: s.rating == null ? null : Number(s.rating) }))
    .filter((s): s is Session & { rating: number } => Number.isFinite(s.rating));

    // filtrerar sessioner baserat på energy level och focus mode i olika steg för att kunna falla tillbaka om det inte finns tillräckligt med data
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


    // funktion som grupperar sessioner i buckets baserat på duration och räknar ut en score för varje bucket
    function recommendDurationForm(
    dataRated: Array<Session & { rating: number }>
    ): number | null {
    if (dataRated.length === 0) return null;

    // grupperar sessioner i buckets baserat på duration och räknar ut en score för varje bucket
    const buckets = new Map<number, BucketStats>();
    const now = Date.now();

    for (const s of dataRated) {
        const minsRaw = s.seconds / 60;
        if (!minsRaw) continue;

        const mins = bucketMinutes(minsRaw);
        const prev = buckets.get(mins) ?? { sum: 0, count: 0, recency: 0 };

        // sessions som är nyligen för högre vikt (recency bonus)
        const hoursAgo = (now - new Date(s.createdAt).getTime()) / 36e5;
        const recencyBonus = 1 / (1 + hoursAgo / 24);

        prev.sum += s.rating;
        prev.count += 1;
        prev.recency += recencyBonus;

        buckets.set(mins, prev);
    }

    // väljer bucket med högst score, där score är en kombination av genomsnittlig rating, recency och antal sessioner i bucketen
    let bestMins: number | null = null;
    let bestScore = -Infinity;

    // kräver minst 2 sessioner i en bucket för att den ska vara relevant
    for (const [mins, v] of buckets.entries()) {
        if (v.count < 2) continue;
        const avgRating = v.sum / v.count;
        const score = avgRating * 10 + v.recency + Math.min(3, v.count) * 0.5;

        // om score är lika kan vi välja den med mer data (högre count) för mer stabilitet
        if (score > bestScore) {
        bestScore = score;
        bestMins = mins;
        }
    }

    // om ingen bucket har tillräckligt med data, ta medianen av alla sessioner. Fallback 10 min
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

    // confidence hur mycket relevant data vi har (10+ sessions = 100%)  
    const confidence = clamp((modeEnergyRated.length || 0) / 10, 0.2, 1);

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
  const focusModes = ["Work", "Meeting", "Break"] as const;
  const energyLevels = [1, 2, 3, 4, 5] as const;

  // Hur många sessions per (mode, energy)
  // Tweak:a gärna så den matchar din UI-känsla
  const COUNTS: Record<(typeof focusModes)[number], Record<number, number>> = {
    Work:   { 1: 1, 2: 3, 3: 10, 4: 6, 5: 2 },
    Meeting:{ 1: 0, 2: 2, 3: 8, 4: 4, 5: 1 },
    Break:  { 1: 6, 2: 9, 3: 4, 4: 1, 5: 0 },
  };

  let idCounter = 1;
  const sessions: Session[] = [];

  const rand = (min: number, max: number) => Math.random() * (max - min) + min;
  const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));

  const clampNum = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  for (const mode of focusModes) {
    for (const energy of energyLevels) {
      const count = COUNTS[mode][energy];

      for (let i = 0; i < count; i++) {
        // Basduration per mode
        const base =
          mode === "Work" ? 25 :
          mode === "Meeting" ? 45 :
          10;

        // Energi påverkar duration lite (hög energi -> lite längre)
        const minutes = clampNum(
          Math.round(base + (energy - 3) * 3 + rand(-6, 6)),
          5,
          60
        );

        // Rating påverkas av energi + lite brus
        const rating = clampNum(
          Math.round(3 + (energy - 3) * 0.6 + rand(-1.2, 1.2)),
          1,
          5
        );

        // Sprid de senaste 25 dagarna (nyare lite oftare)
        const daysAgo = Math.pow(Math.random(), 1.6) * 25;

        sessions.push({
          id: `mock-${idCounter++}`,
          seconds: minutes * 60,
          createdAt: new Date(now - daysAgo * 86400000).toISOString(),
          rating,
          energyLevel: energy,
          focusMode: mode,
        });
      }
    }
  }

  return sessions;
}
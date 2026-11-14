/**
 * Gaṇaka — Bhāva Chalita (भाव चलित).
 *
 * The rāśi chart places a graha in a sign, and the sign becomes a house. That is
 * the whole-sign reading. The *chalita* reading places the same graha in a
 * bhāva — a house measured from its own cusp — and a graha near the end of a
 * sign can therefore move into the next house without moving in the zodiac.
 *
 * That shift is the whole point of the chalita chart: a graha that reads as
 * sitting in the 10th by sign may actually be in the 11th by bhāva, and the
 * judgement changes with it.
 *
 * The bhāvas are taken from the Śrīpati construction by default, because that
 * is the unequal-house system the classical chalita is read against. Under
 * whole-sign houses the chalita necessarily equals the rāśi chart, so the
 * comparison would be empty.
 */
import type { JyotishaChart, PlanetId } from './types';
import { GRAHA_PROPERTIES, RASHIS } from './constants';
import { calculateHouses } from './houses';

export type ChalitHouseSystem = 'sripati' | 'placidus' | 'equal_whole';

export interface ChalitEntry {
  planet: PlanetId;
  planetName: string;
  /** House the graha occupies by sign. */
  rashiHouse: number;
  /** House it occupies by bhāva cusp. */
  chalitHouse: number;
  /** True when the two disagree — the reason the chalita chart exists. */
  shifted: boolean;
  /** Degrees travelled into the bhāva. */
  degreeInBhava: number;
  /** The bhāva's crest (madhya). */
  bhavaMid: number;
  /** How far the graha stands from that crest, in degrees. */
  fromMid: number;
  rashiName: string;
}

export interface BhavaChalit {
  system: ChalitHouseSystem;
  entries: ChalitEntry[];
  /** The bhāvas themselves, so a renderer can draw the unequal wheel. */
  bhavas: Array<{
    house: number;
    start: number;
    mid: number;
    end: number;
    rashi: number;
    rashiName: string;
    occupants: PlanetId[];
  }>;
  summary: {
    total: number;
    shifted: number;
    unchanged: number;
  };
  note: string;
}

/**
 * Compute the chalita placement for every graha in the chart.
 */
export function calculateBhavaChalit(
  chart: JyotishaChart,
  system: ChalitHouseSystem = 'sripati'
): BhavaChalit {
  const positions: Record<string, { siderealLongitude: number }> = {};
  for (const [id, p] of Object.entries(chart.planets as any)) {
    positions[id] = { siderealLongitude: (p as any).siderealLongitude };
  }

  const lagna = chart.lagna.siderealLongitude;
  // The true midheaven, now carried on the chart. The old fallback of
  // lagna + 270° is only right when the MC happens to sit square to the
  // ascendant; when it does not, Sripati silently degenerates to equal houses
  // and no graha ever shifts.
  const mc = Number((chart as any).angles?.mc ?? ((lagna + 270) % 360));

  const bhavas = calculateHouses(lagna, mc, system as any, positions as any) as any[];

  const entries: ChalitEntry[] = [];
  for (const [id, p] of Object.entries(chart.planets as any)) {
    const pos: any = p;
    const lon = pos.siderealLongitude ?? 0;

    // Which bhāva span contains this longitude.
    let chalitHouse = pos.house ?? 1;
    let start = 0;
    let mid = 0;
    for (const b of bhavas) {
      const s = b.startDegree;
      const e = b.endDegree;
      const inside = s < e ? lon >= s && lon < e : lon >= s || lon < e;
      if (inside) {
        chalitHouse = b.houseNumber;
        start = s;
        mid = b.midDegree;
        break;
      }
    }

    const degreeInBhava = ((lon - start) % 360 + 360) % 360;
    const fromMid = ((lon - mid) % 360 + 360) % 360;
    const signedFromMid = fromMid > 180 ? fromMid - 360 : fromMid;

    entries.push({
      planet: id as PlanetId,
      planetName: GRAHA_PROPERTIES[id as PlanetId]?.name ?? id,
      rashiHouse: pos.house ?? 1,
      chalitHouse,
      shifted: (pos.house ?? 1) !== chalitHouse,
      degreeInBhava: Number(degreeInBhava.toFixed(3)),
      bhavaMid: Number(mid.toFixed(3)),
      fromMid: Number(signedFromMid.toFixed(3)),
      rashiName: RASHIS[(pos.rashiNumber ?? 1) as 1]?.name ?? '',
    });
  }

  const shifted = entries.filter((e) => e.shifted).length;

  return {
    system,
    entries,
    bhavas: bhavas.map((b) => ({
      house: b.houseNumber,
      start: Number(b.startDegree.toFixed(3)),
      mid: Number(b.midDegree.toFixed(3)),
      end: Number(b.endDegree.toFixed(3)),
      rashi: b.rashiNumber,
      rashiName: RASHIS[b.rashiNumber as 1]?.name ?? '',
      occupants: b.planetsInHouse,
    })),
    summary: { total: entries.length, shifted, unchanged: entries.length - shifted },
    note:
      system === 'equal_whole'
        ? 'Under whole-sign houses the chalita placement always equals the rāśi placement, so no graha shifts.'
        : `Bhāvas by ${system}. A graha shifts when its longitude falls outside the sign-based house but inside a different bhāva span.`,
  };
}

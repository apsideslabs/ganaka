/**
 * Gaṇaka — Tājika daśās (Muḍḍa, Patyayini) and the Ithasala / Ishrafa aspects.
 *
 * These belong to the annual chart (Varṣaphala), not the natal one.
 *
 * MUḌḌA — the Viṃśottarī cycle compressed into one Tājika year. Each lord takes
 * its Viṃśottarī share of 120, applied to the year's length, and the seed lord
 * advances one place each year.
 *
 * PATYAYINI — the one Tājika daśā that is not nakṣatra-based. The seven grahas
 * and the lagna are ranked by how far each stands into its own sign (the
 * *krishāṃśa*); successive differences give the *patyāṃśa*; the periods are
 * those differences scaled to the year. The patyāṃśas telescope — their sum is
 * simply the largest krishāṃśa — so the timeline tiles the year exactly, and a
 * printed table can be checked by adding the column.
 *
 * ITHASALA / ISHRAFA — Tājika's applying and separating aspects. A pair is in
 * Ithasala when the faster body is still closing on the exact angle, Ishrafa
 * when it has passed it. This is what distinguishes Tājika from the fixed
 * Parāśarī dṛṣṭi: it describes whether a matter is coming together or coming
 * apart, not merely that a connection exists.
 */
import type { JyotishaChart, PlanetId } from '../jyotisha/types';
import { RASHIS, GRAHA_PROPERTIES } from '../jyotisha/constants';

const VIMSHOTTARI: Array<{ planet: PlanetId; years: number }> = [
  { planet: 'ketu', years: 7 },
  { planet: 'venus', years: 20 },
  { planet: 'sun', years: 6 },
  { planet: 'moon', years: 10 },
  { planet: 'mars', years: 7 },
  { planet: 'rahu', years: 18 },
  { planet: 'jupiter', years: 16 },
  { planet: 'saturn', years: 19 },
  { planet: 'mercury', years: 17 },
];

/** Tājika deeptāṃśa — the orb each graha carries, in degrees. */
const DEEPTAMSHA: Record<string, number> = {
  sun: 15, moon: 12, mars: 8, mercury: 7, jupiter: 9, venus: 7, saturn: 9,
};

const YEAR_DAYS = 365.2425;

export interface MuddaPeriod {
  lord: PlanetId;
  name: string;
  startDate: Date;
  endDate: Date;
  durationDays: number;
  fractionOfYear: number;
}

/**
 * Muḍḍa daśā — Viṃśottarī compressed into one year, seeded from the natal Moon.
 */
export function calculateMudda(
  natalMoonLongitude: number,
  yearStart: Date
): MuddaPeriod[] {
  const nakSpan = 360 / 27;
  const janmaNak = Math.floor(natalMoonLongitude / nakSpan); // 0-26

  // The Vimshottari seed cycles through Ketu, Venus, Sun ... at 3-nakshatra steps.
  const seedIdx = Math.floor(janmaNak / 3) % 9;
  const fractionElapsed = (natalMoonLongitude % nakSpan) / nakSpan;

  const out: MuddaPeriod[] = [];
  let cursor = new Date(yearStart.getTime());

  // Start part-way through the seed lord's period.
  const firstShare = VIMSHOTTARI[seedIdx].years / 120;
  const remainingFirst = firstShare * (1 - fractionElapsed);

  let idx = seedIdx;
  let first = true;
  let accumulated = 0;

  while (accumulated < 1 - 1e-9) {
    const lord = VIMSHOTTARI[idx];
    const fullShare = lord.years / 120;
    const share = first ? remainingFirst : Math.min(fullShare, 1 - accumulated);
    const days = share * YEAR_DAYS;
    const start = new Date(cursor.getTime());
    const end = new Date(start.getTime() + days * 864e5);
    out.push({
      lord: lord.planet,
      name: GRAHA_PROPERTIES[lord.planet]?.name ?? lord.planet,
      startDate: start,
      endDate: end,
      durationDays: days,
      fractionOfYear: share,
    });
    cursor = end;
    accumulated += share;
    first = false;
    idx = (idx + 1) % 9;
  }

  return out;
}

export interface PatyayiniRow {
  body: string;
  name: string;
  longitude: number;
  rashiName: string;
  /** Degrees within the sign. */
  krishamsa: number;
  /** Successive difference from the previous row. */
  patyamsa: number;
  /** Share of the year, 0-1. */
  fractionOfYear: number;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Patyayini — the year divided by deducted degrees.
 */
export function calculatePatyayini(
  chart: JyotishaChart,
  yearStart: Date
): { rows: PatyayiniRow[]; totalDegrees: number } {
  const bodies: Array<{ body: string; name: string; lon: number }> = [];
  for (const p of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as PlanetId[]) {
    const pos: any = (chart.planets as any)?.[p];
    if (!pos) continue;
    bodies.push({ body: p, name: GRAHA_PROPERTIES[p]?.name ?? p, lon: pos.siderealLongitude });
  }
  bodies.push({ body: 'lagna', name: 'Lagna', lon: chart.lagna.siderealLongitude });

  const sorted = bodies
    .map((b) => ({ ...b, krishamsa: ((b.lon % 30) + 30) % 30 }))
    .sort((a, b) => a.krishamsa - b.krishamsa);

  const totalDegrees = sorted.length ? sorted[sorted.length - 1].krishamsa : 0;

  const rows: PatyayiniRow[] = [];
  let prev = 0;
  let cursor = new Date(yearStart.getTime());
  for (const s of sorted) {
    const patyamsa = s.krishamsa - prev;
    prev = s.krishamsa;
    const fraction = totalDegrees > 0 ? patyamsa / totalDegrees : 0;
    const start = new Date(cursor.getTime());
    const end = new Date(start.getTime() + fraction * YEAR_DAYS * 864e5);
    rows.push({
      body: s.body,
      name: s.name,
      longitude: s.lon,
      rashiName: RASHIS[(Math.floor(s.lon / 30) + 1) as 1]?.name ?? '',
      krishamsa: s.krishamsa,
      patyamsa,
      fractionOfYear: fraction,
      startDate: start,
      endDate: end,
    });
    cursor = end;
  }

  return { rows, totalDegrees };
}

export type TajikaAspectType = 'ithasala' | 'ishrafa' | 'none';

export interface TajikaAspect {
  a: PlanetId;
  b: PlanetId;
  aName: string;
  bName: string;
  /** Angular separation, 0-180. */
  separation: number;
  /** The orb the pair allows — the mean of their deeptāṃśas. */
  orb: number;
  type: TajikaAspectType;
  /** The aspect angle the pair is measured against. */
  aspectAngle: number;
  description: string;
}

const ASPECT_ANGLES = [0, 60, 90, 120, 180];

/**
 * Find the Ithasala and Ishrafa pairs among the seven tāras.
 *
 * A pair is in orb when their separation is within the mean of their
 * deeptāṃśas of one of the Tājika aspect angles. Ithasala when the faster
 * body is closing on that angle, Ishrafa when it has passed it.
 */
export function calculateTajikaAspects(chart: JyotishaChart): TajikaAspect[] {
  const planets: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  const out: TajikaAspect[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const pa: any = (chart.planets as any)?.[planets[i]];
      const pb: any = (chart.planets as any)?.[planets[j]];
      if (!pa || !pb) continue;

      const sep = Math.abs(((pa.siderealLongitude - pb.siderealLongitude + 540) % 360) - 180);
      const orb = ((DEEPTAMSHA[planets[i]] ?? 8) + (DEEPTAMSHA[planets[j]] ?? 8)) / 2;

      let best: { angle: number; delta: number } | null = null;
      for (const angle of ASPECT_ANGLES) {
        const delta = Math.abs(sep - angle);
        if (delta <= orb && (!best || delta < best.delta)) best = { angle, delta };
      }
      if (!best) continue;

      // The faster body decides applying or separating: if closing the gap to
      // the exact angle, Ithasala; if opening it, Ishrafa.
      const speedA = Math.abs(pa.speed ?? 0);
      const speedB = Math.abs(pb.speed ?? 0);
      const faster = speedA >= speedB ? pa : pb;
      const closing = sep < best.angle ? faster.speed > 0 : faster.speed < 0;
      const type: TajikaAspectType = closing ? 'ithasala' : 'ishrafa';

      out.push({
        a: planets[i],
        b: planets[j],
        aName: GRAHA_PROPERTIES[planets[i]]?.name ?? planets[i],
        bName: GRAHA_PROPERTIES[planets[j]]?.name ?? planets[j],
        separation: sep,
        orb,
        type,
        aspectAngle: best.angle,
        description:
          `${type === 'ithasala' ? 'Applying' : 'Separating'} ${best.angle}° aspect, ` +
          `${best.delta.toFixed(2)}° from exact within an orb of ${orb.toFixed(1)}°`,
      });
    }
  }

  return out;
}

/**
 * KP — timing.
 *
 * The promise is settled by the cuspal sub lord; timing is settled by the daśā
 * chain. The delivery test is stricter than "is the lord a significator", and the
 * first version got it wrong by testing only that. From KP practice:
 *
 *   "A period delivers a promised matter when its Maha, Antar and Pratyantar
 *    lords jointly signify all the houses the matter requires, each lord
 *    contributing at least one different house. For marriage that means 2, 7 and
 *    11 covered between them. The Maha lord must signify at least one."
 *
 * So a period qualifies when the three lords between them cover the whole house
 * group, each supplying a different house — not when any one of them happens to
 * be a significator. A chain of three lords that all signify only the 7th has
 * not covered 2, 7 and 11 and does not deliver a marriage.
 *
 * Transits are subordinate: they narrow a delivering period to a window, and a
 * transit disagreement never turns a promised matter into a denied one.
 */
import type { JyotishaChart, PlanetId } from '../jyotisha/types';
import { GRAHA_PROPERTIES } from '../jyotisha/constants';
import type { RulingPlanetsResult } from './ruling-planets';
import type { SignificatorsResult } from './significators';
import type { KpCusp } from './cusps';
import { housesSignified } from './significators';

export interface KpPeriodLord {
  level: 'mahā' | 'antara' | 'pratyantara';
  lord: PlanetId;
  lordName: string;
  from: string;
  to: string;
  /** The houses this lord signifies. */
  signifies: number[];
  /** Which of the matter's houses it covers. */
  covers: number[];
  isRulingPlanet: boolean;
}

export interface KpTimingWindow {
  from: string;
  to: string;
  lords: KpPeriodLord[];
  /** Houses of the matter the three lords cover between them. */
  covered: number[];
  /** Houses of the matter left uncovered. */
  missing: number[];
  /** True when the group is fully covered, each lord contributing one. */
  delivers: boolean;
  /** True when every delivering lord is also a ruling planet of the moment. */
  strong: boolean;
}

export interface KpTimingResult {
  house: number;
  matterHouses: number[];
  /** The chain running now. */
  current: KpTimingWindow | null;
  /** Upcoming windows inside the current mahādaśā that deliver. */
  windows: KpTimingWindow[];
  note: string;
}

function runningChain(chart: JyotishaChart, now: Date): any[] {
  const tree: any[] = (chart.vimshottari as any)?.tree ?? [];
  const chain: any[] = [];
  let level = tree;
  for (let depth = 0; depth < 3 && level && level.length; depth++) {
    const hit = level.find((n) => {
      const s = new Date(n.startDate).getTime();
      const e = new Date(n.endDate).getTime();
      return now.getTime() >= s && now.getTime() <= e;
    });
    if (!hit) break;
    chain.push(hit);
    level = hit.subPeriods ?? [];
  }
  return chain;
}

const LEVELS: Array<KpPeriodLord['level']> = ['mahā', 'antara', 'pratyantara'];

function toLord(
  chart: JyotishaChart,
  cusps: KpCusp[],
  node: any,
  i: number,
  matterHouses: number[],
  rpSet: Set<PlanetId>
): KpPeriodLord {
  const lord = (node.lord ?? node.lordKey) as PlanetId;
  const signifies = housesSignified(chart, cusps, lord);
  return {
    level: LEVELS[i] ?? 'pratyantara',
    lord,
    lordName: GRAHA_PROPERTIES[lord]?.name ?? node.lordName ?? String(lord),
    from: String(node.startDate ?? ''),
    to: String(node.endDate ?? ''),
    signifies,
    covers: signifies.filter((h) => matterHouses.includes(h)),
    isRulingPlanet: rpSet.has(lord),
  };
}

/**
 * The delivery test: the three lords must cover the whole house group between
 * them, each contributing a different house.
 */
function judge(lords: KpPeriodLord[], matterHouses: number[]): KpTimingWindow {
  const covered = new Set<number>();
  const seen = new Set<number>();
  let distinctContributions = 0;

  for (const l of lords) {
    let contributed = false;
    for (const h of l.covers) {
      covered.add(h);
      if (!seen.has(h)) { seen.add(h); contributed = true; }
    }
    if (contributed) distinctContributions++;
  }

  const missing = matterHouses.filter((h) => !covered.has(h));
  const maha = lords[0];
  const delivers =
    missing.length === 0 &&
    distinctContributions >= Math.min(3, matterHouses.length) &&
    !!maha && maha.covers.length > 0;

  return {
    from: lords[0]?.from ?? '',
    to: lords[lords.length - 1]?.to ?? '',
    lords,
    covered: [...covered].sort((a, b) => a - b),
    missing,
    delivers,
    strong: delivers && lords.every((l) => l.isRulingPlanet || l.covers.length === 0),
  };
}

/**
 * Cross the ruling planets with the daśā chain for one matter.
 */
export function kpTiming(
  chart: JyotishaChart,
  cusps: KpCusp[],
  ruling: RulingPlanetsResult,
  significators: SignificatorsResult,
  house: number,
  matterHouses: number[],
  now: Date = new Date()
): KpTimingResult {
  const rpSet = new Set<PlanetId>(ruling.distinct);
  const chain = runningChain(chart, now);

  const currentLords = chain.map((n, i) => toLord(chart, cusps, n, i, matterHouses, rpSet));
  const current = currentLords.length ? judge(currentLords, matterHouses) : null;

  // Walk the antardaśās of the running mahādaśā and keep the delivering ones.
  const windows: KpTimingWindow[] = [];
  const maha = chain[0];
  if (maha?.subPeriods) {
    for (const antar of maha.subPeriods) {
      const antarLord = toLord(chart, cusps, antar, 1, matterHouses, rpSet);
      const pratys: any[] = antar.subPeriods ?? [];
      if (pratys.length === 0) {
        const w = judge([currentLords[0] ?? antarLord, antarLord], matterHouses);
        if (w.delivers) windows.push(w);
        continue;
      }
      for (const praty of pratys) {
        const pratyLord = toLord(chart, cusps, praty, 2, matterHouses, rpSet);
        const w = judge([currentLords[0] ?? antarLord, antarLord, pratyLord], matterHouses);
        if (w.delivers) windows.push(w);
      }
    }
  }

  return {
    house,
    matterHouses,
    current,
    windows: windows.slice(0, 24),
    note:
      'A period delivers only when the mahā, antara and pratyantara lords between them cover the ' +
      'whole house group, each supplying a different house, with the mahā lord signifying at least ' +
      'one. Transits narrow a delivering period to a window; they never overturn a promise.',
  };
}

/**
 * Gaṇaka — the KP layer.
 *
 * Krishnamurti Paddhati is a different framework from the Parāśarī one, not a
 * refinement of it: it replaces whole-sign houses with Placidus cusps and reads
 * each nakṣatra through its star lord and sub lord. The engine already computed
 * the four KP lords for every graha and cusp; what it never did was the three
 * things a KP reading actually turns on —
 *
 *   RULING PLANETS   the five grahas ruling the moment of judgement, used as a
 *                    cross-check on whether a matter is genuinely ripe.
 *   SIGNIFICATORS    the four-level ranking of which grahas speak for a house.
 *   SUB-LORD PROMISE whether the sub lord of a cusp signifies the matter at all.
 *
 * Those are built here. Note the framework boundary the reference insists on:
 * mixing KP cusps with Parāśarī whole-sign judgements produces nonsense, so
 * everything in this module stays inside the KP reading.
 */
import type { JyotishaChart, PlanetId, RashiNumber } from './types';
import { GRAHA_PROPERTIES, NAKSHATRAS, RASHIS } from './constants';
import { calculateKPPosition } from './sphutas';
import { calculateAllPlanets } from '../astronomy/ephemeris';
import { calculateJulianDay, normalizeDegrees } from '../astronomy/julian';
import { calculateAscendant, calculateHouses } from './houses';


/**
 * Placidus cusps for KP.
 *
 * KP is defined on Placidus cusps — a cusp is a calculated degree, not a sign
 * boundary, and the whole sub-lord reading depends on that degree. Reading the
 * chart's own `bhavas` silently produced non-KP answers whenever the chart was
 * cast with whole-sign houses: on the Binay chart the 7th cusp sits at 45° by
 * whole sign but 60.85° by Placidus, and the two fall in different sub-lords
 * (Jupiter against Mercury). Everything here is computed from Placidus directly
 * so the KP layer is correct regardless of what the rest of the app is set to.
 */
function placidusBhavas(chart: JyotishaChart): any[] {
  const positions: Record<string, { siderealLongitude: number }> = {};
  for (const [id, p] of Object.entries(chart.planets as any)) {
    positions[id] = { siderealLongitude: (p as any).siderealLongitude };
  }
  const lagna = chart.lagna.siderealLongitude;
  const mc = Number((chart as any).angles?.mc ?? ((lagna + 270) % 360));
  return calculateHouses(lagna, mc, 'placidus' as any, positions as any) as any[];
}

export interface RulingPlanet {
  /** Which of the five roles produced it. */
  role: string;
  planet: PlanetId;
  planetName: string;
}

export interface RulingPlanetsResult {
  moment: string;
  planets: RulingPlanet[];
  /** Distinct grahas across the five roles, in order of appearance. */
  distinct: PlanetId[];
  note: string;
}

/**
 * The five ruling planets of the moment of judgement.
 *
 * The ascendant's star lord, the ascendant's sign lord, the Moon's star lord,
 * the Moon's sign lord, and the day lord. KP uses these on the principle that
 * the same grahas recur when a matter is genuinely ripe — so a planet appearing
 * both in the ruling set and as a significator is a strong signal.
 */
export function calculateRulingPlanets(
  when: Date,
  latitude: number,
  longitude: number,
  timezoneOffsetHours: number,
  ayanamshaType: any = 'lahiri',
  customAyanamshaValue = 0
): RulingPlanetsResult {
  const localHour = when.getHours() + when.getMinutes() / 60;
  const jd = calculateJulianDay(
    when.getFullYear(), when.getMonth() + 1, when.getDate(),
    localHour - timezoneOffsetHours, 0, 0
  );

  const asc: any = calculateAscendant(jd, latitude, longitude, ayanamshaType, customAyanamshaValue);
  const ascLon = asc?.siderealLongitude ?? 0;
  const ascKP = calculateKPPosition(ascLon);

  const planets: any = calculateAllPlanets(jd, ayanamshaType, customAyanamshaValue);
  const moonLon = planets?.moon?.siderealLongitude ?? 0;
  const moonKP = calculateKPPosition(moonLon);

  // The day lord: the vāra lord of the civil day.
  const DAY_LORDS: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  const dayLord = DAY_LORDS[when.getDay()];

  const rows: RulingPlanet[] = [
    { role: 'Ascendant star lord', planet: ascKP.starLord },
    { role: 'Ascendant sign lord', planet: ascKP.signLord },
    { role: 'Moon star lord', planet: moonKP.starLord },
    { role: 'Moon sign lord', planet: moonKP.signLord },
    { role: 'Day lord', planet: dayLord },
  ].map((r) => ({
    ...r,
    planetName: GRAHA_PROPERTIES[r.planet]?.name ?? r.planet,
  }));

  const distinct: PlanetId[] = [];
  for (const r of rows) if (!distinct.includes(r.planet)) distinct.push(r.planet);

  return {
    moment: when.toISOString(),
    planets: rows,
    distinct,
    note:
      'The five grahas ruling the moment of judgement. KP uses them as a cross-check: a graha ' +
      'appearing both here and among a house’s significators is a strong signal that the matter ' +
      'is ripe. They are a timing and confirmation tool, not a promise in themselves.',
  };
}

export interface SignificatorLevel {
  /** 1 is the strongest. */
  level: number;
  rule: string;
  planets: PlanetId[];
  planetNames: string[];
}

/**
 * The four-level significator ranking for one house.
 *
 *   1. Grahas in the star of the house's occupants
 *   2. The occupants themselves
 *   3. Grahas in the star of the house's owners
 *   4. The owner itself
 *
 * A graha can appear at more than one level; the strongest level it reaches is
 * the one that counts.
 */
export function calculateSignificators(chart: JyotishaChart, house: number): SignificatorLevel[] {
  const planets = chart.planets as any;
  const bhavas = placidusBhavas(chart);
  const bhava = bhavas?.[house - 1];
  if (!bhava) return [];

  const occupants: PlanetId[] = (bhava.planetsInHouse || []) as PlanetId[];
  const owner: PlanetId = (bhava.rashiLord || bhava.lord) as PlanetId;

  const starLordOf = (id: PlanetId): PlanetId | null => {
    const p: any = planets?.[id];
    if (!p || typeof p.siderealLongitude !== 'number') return null;
    return calculateKPPosition(p.siderealLongitude).starLord;
  };

  const inStarOf = (targets: PlanetId[]): PlanetId[] => {
    const out: PlanetId[] = [];
    for (const [id, p] of Object.entries(planets) as any) {
      if (typeof (p as any).siderealLongitude !== 'number') continue;
      const sl = calculateKPPosition((p as any).siderealLongitude).starLord;
      if (targets.includes(sl) && !out.includes(id as PlanetId)) out.push(id as PlanetId);
    }
    return out;
  };

  const name = (ids: PlanetId[]) => ids.map((x) => GRAHA_PROPERTIES[x]?.name ?? x);

  const levels: SignificatorLevel[] = [
    {
      level: 1,
      rule: 'Grahas in the star of the occupants',
      planets: inStarOf(occupants),
      planetNames: [],
    },
    {
      level: 2,
      rule: 'The occupants themselves',
      planets: occupants,
      planetNames: [],
    },
    {
      level: 3,
      rule: 'Grahas in the star of the owner',
      planets: owner ? inStarOf([owner]) : [],
      planetNames: [],
    },
    {
      level: 4,
      rule: 'The owner itself',
      planets: owner ? [owner] : [],
      planetNames: [],
    },
  ];

  for (const l of levels) l.planetNames = name(l.planets);
  return levels;
}

export type CuspPromise = 'promised' | 'denied' | 'mixed' | 'undetermined';

export interface CuspPromiseResult {
  house: number;
  subLord: PlanetId;
  subLordName: string;
  /** Houses the sub lord signifies — by occupation, ownership or star. */
  signifies: number[];
  matterHouses: number[];
  detrimentalHouses: number[];
  hitsMatter: number[];
  hitsDetrimental: number[];
  promise: CuspPromise;
  reading: string;
}

/**
 * The KP promise rule.
 *
 * If the sub lord of the cusp signifies the matter's house group, the matter
 * fructifies; if it signifies only the detrimental houses, it does not; if it
 * signifies both, the native gets both results in different periods.
 *
 * A sub lord "signifies" a house when it occupies it, owns it, or sits in the
 * star of a graha that occupies or owns it — the same four-level logic as the
 * significator ranking.
 */
export function evaluateCuspPromise(
  chart: JyotishaChart,
  house: number,
  matterHouses: number[],
  detrimentalHouses: number[]
): CuspPromiseResult | null {
  const bhava = placidusBhavas(chart)?.[house - 1];
  if (!bhava) return null;

  const cuspLon = bhava.madhyaDegree ?? bhava.midDegree;
  if (typeof cuspLon !== 'number') return null;

  const kp = calculateKPPosition(cuspLon);
  const subLord = kp.subLord;

  // Computed once — calling placidusBhavas inside the loop below rebuilt the
  // whole house set for every planet and made the panel hang.
  const placidus = placidusBhavas(chart);

  // What the sub lord signifies: houses it occupies, owns, and reaches by star.
  const signifies = new Set<number>();
  const addHousesOf = (id: PlanetId) => {
    const p: any = (chart.planets as any)?.[id];
    if (!p) return;
    if (typeof p.house === 'number') signifies.add(p.house);
    const rashi = p.rashiNumber as RashiNumber;
    // Ownership: the sign it occupies is ruled by someone; a graha owns the
    // signs whose lord it is.
    for (let r = 1; r <= 12; r++) {
      if (RASHIS[r as RashiNumber]?.lord === id) signifies.add(r);
    }
    // And the house whose sign it rules in this chart.
    const ownedBhava = placidus.findIndex(
      (b: any) => (b.rashiLord || b.lord) === id
    );
    if (ownedBhava != null && ownedBhava >= 0) signifies.add(ownedBhava + 1);
  };

  addHousesOf(subLord);

  // Grahas in the sub lord's star also carry its signification.
  const subLordStar = ((chart.planets as any)?.[subLord]?.nakshatraLord ?? subLord) as PlanetId;
  if (subLordStar !== subLord) addHousesOf(subLordStar);

  const sig = [...signifies].sort((a, b) => a - b);
  const hitsMatter = sig.filter((h) => matterHouses.includes(h));
  const hitsDetrimental = sig.filter((h) => detrimentalHouses.includes(h));

  let promise: CuspPromise;
  let reading: string;
  if (hitsMatter.length > 0 && hitsDetrimental.length === 0) {
    promise = 'promised';
    reading = `The sub lord ${GRAHA_PROPERTIES[subLord]?.name} signifies ${hitsMatter.join(', ')} — the matter fructifies.`;
  } else if (hitsMatter.length === 0 && hitsDetrimental.length > 0) {
    promise = 'denied';
    reading = `The sub lord ${GRAHA_PROPERTIES[subLord]?.name} signifies only the detrimental houses ${hitsDetrimental.join(', ')} — the matter does not fructify.`;
  } else if (hitsMatter.length > 0 && hitsDetrimental.length > 0) {
    promise = 'mixed';
    reading = `The sub lord signifies both ${hitsMatter.join(', ')} and ${hitsDetrimental.join(', ')} — the native gets both results, in different periods.`;
  } else {
    promise = 'undetermined';
    reading = 'The sub lord signifies neither group by this reading, so the cusp is silent on the matter.';
  }

  return {
    house,
    subLord,
    subLordName: GRAHA_PROPERTIES[subLord]?.name ?? subLord,
    signifies: sig,
    matterHouses,
    detrimentalHouses,
    hitsMatter,
    hitsDetrimental,
    promise,
    reading,
  };
}

/** Standard KP house groups for the common questions. */
export const KP_MATTERS: Record<string, { matter: number[]; detrimental: number[]; label: string }> = {
  marriage: { matter: [2, 7, 11], detrimental: [1, 6, 10], label: 'Marriage' },
  career: { matter: [2, 6, 10, 11], detrimental: [1, 5, 8, 12], label: 'Career' },
  wealth: { matter: [2, 6, 11], detrimental: [5, 8, 12], label: 'Wealth' },
  children: { matter: [2, 5, 11], detrimental: [1, 4, 10], label: 'Children' },
  property: { matter: [4, 11, 12], detrimental: [3, 8, 9], label: 'Property' },
  education: { matter: [4, 9, 11], detrimental: [3, 8, 12], label: 'Education' },
  health: { matter: [1, 5, 11], detrimental: [6, 8, 12], label: 'Health' },
};

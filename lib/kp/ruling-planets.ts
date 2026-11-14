/**
 * KP — ruling planets.
 *
 * The five grahas ruling the moment of judgement, in KP's order of preference:
 *
 *   1. Star lord of the ascendant
 *   2. Sign lord of the ascendant
 *   3. Star lord of the Moon
 *   4. Sign lord of the Moon
 *   5. Day lord
 *
 * Two rules the earlier version omitted:
 *
 *   NODE AGENTS. "If Rāhu or Ketu is conjoining or aspects a Ruling Planet, or
 *   if Rāhu or Ketu is posited in a sign owned by one of the Ruling Planets,
 *   then Rāhu and/or Ketu should be included as a Ruling Planet."
 *
 *   RETROGRADE OMISSION. "The Ruling planet which is in the star or sub of a
 *   retrograde planet should be omitted." Those grahas are removed from the set
 *   and reported, so a reading can see what was discarded.
 */
import type { JyotishaChart, PlanetId } from '../jyotisha/types';
import { GRAHA_PROPERTIES, RASHIS } from '../jyotisha/constants';
import { calculateKPPosition } from '../jyotisha/sphutas';
import { calculateAllPlanets } from '../astronomy/ephemeris';
import { calculateJulianDay } from '../astronomy/julian';
import { calculateAscendant } from '../jyotisha/houses';
import { NODES, SIGN_OWNERS } from './constants';

export interface RulingPlanet {
  role: string;
  planet: PlanetId;
  planetName: string;
  /** True when the graha was added because a node acts as its agent. */
  viaNode?: boolean;
}

export interface RulingPlanetsResult {
  moment: string;
  /** The five classic roles, before any filtering. */
  base: RulingPlanet[];
  /** Nodes admitted as agents, with the role they borrow. */
  nodeAgents: RulingPlanet[];
  /** The five classic roles. Unchanged semantics for existing callers. */
  planets: RulingPlanet[];
  /** The working set after nodes are added and retrograde grahas removed. */
  workingSet: RulingPlanet[];
  distinct: PlanetId[];
  /** Dropped because they sit in a retrograde planet's star or sub. */
  omittedRetrograde: PlanetId[];
  note: string;
}

const DAY_LORDS: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

/** Star and sub lord of any longitude. */
function lordsOf(lon: number): { starLord: PlanetId; subLord: PlanetId } {
  const kp = calculateKPPosition(lon);
  return { starLord: kp.starLord, subLord: kp.subLord };
}

/**
 * Ruling planets for a moment and place.
 *
 * Pass the chart when the question is about that chart; pass a Date when it is
 * a horary question put now.
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

  const dayLord = DAY_LORDS[when.getDay()];

  const mk = (role: string, planet: PlanetId): RulingPlanet => ({
    role,
    planet,
    planetName: GRAHA_PROPERTIES[planet]?.name ?? planet,
  });

  const base: RulingPlanet[] = [
    mk('Ascendant star lord', ascKP.starLord),
    mk('Ascendant sign lord', ascKP.signLord),
    mk('Moon star lord', moonKP.starLord),
    mk('Moon sign lord', moonKP.signLord),
    mk('Day lord', dayLord),
  ];

  // ---- Node agency -------------------------------------------------------
  // A node joins the set when it conjoins a ruling planet, is aspected by one,
  // or sits in a sign owned by one.
  const baseSet = base.map((b) => b.planet);
  const nodeAgents: RulingPlanet[] = [];

  for (const node of NODES) {
    const n: any = planets?.[node];
    if (!n) continue;

    const conjoins = baseSet.some(
      (rp) => planets?.[rp]?.rashiNumber === n.rashiNumber
    );
    const inRulingSign = baseSet.some(
      (rp) => SIGN_OWNERS.includes(rp) && RASHIS[n.rashiNumber as 1]?.lord === rp
    );
    const aspecting = baseSet.some((rp) => {
      const d = (n.rashiNumber - planets?.[rp]?.rashiNumber + 12) % 12 + 1;
      return d === 7;
    });

    if (conjoins || inRulingSign || aspecting) {
      const role = conjoins ? 'Node conjoining a ruling planet'
        : inRulingSign ? 'Node in a ruling planet\u2019s sign'
        : 'Node aspected by a ruling planet';
      nodeAgents.push({ ...mk(role, node), viaNode: true });
    }
  }

  // ---- Retrograde omission ----------------------------------------------
  // A ruling planet sitting in the star or sub of a retrograde graha is dropped.
  const omitted: PlanetId[] = [];
  const isRetro = (id: PlanetId): boolean => planets?.[id]?.isRetrograde === true;

  const keep = (rp: RulingPlanet): boolean => {
    const lon = planets?.[rp.planet]?.siderealLongitude;
    if (typeof lon !== 'number') return true;
    const { starLord, subLord } = lordsOf(lon);
    if (isRetro(starLord) || isRetro(subLord)) {
      omitted.push(rp.planet);
      return false;
    }
    return true;
  };

  const planetsKept = [...base, ...nodeAgents].filter(keep);

  const distinct: PlanetId[] = [];
  for (const r of planetsKept) if (!distinct.includes(r.planet)) distinct.push(r.planet);

  return {
    moment: when.toISOString(),
    base,
    nodeAgents,
    planets: base,
    workingSet: planetsKept,
    distinct,
    omittedRetrograde: [...new Set(omitted)],
    note:
      'The five grahas ruling the moment of judgement, extended by any node acting as an agent ' +
      'and reduced by any graha sitting in a retrograde star or sub. KP uses them as a cross-check ' +
      'on whether a matter is ripe, not as a promise in themselves.',
  };
}

/** Ruling planets for a natal chart's own moment. */
export function rulingPlanetsForChart(chart: JyotishaChart): RulingPlanetsResult {
  const b = chart.meta.birthDetails;
  const when = new Date(b.year, b.month - 1, b.day, b.hour, b.minute, b.second ?? 0);
  return calculateRulingPlanets(
    when, b.latitude, b.longitude, b.timezoneOffsetHours,
    (chart.meta as any).ayanamshaType
  );
}

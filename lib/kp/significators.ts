/**
 * KP — significators.
 *
 * The four-level ranking, in descending strength:
 *
 *   1. Grahas in the star of a house's occupants
 *   2. The occupants themselves
 *   3. Grahas in the star of the cusp lord
 *   4. The cusp lord itself
 *
 * Two KP rules are applied here that the earlier version omitted:
 *
 *   RETROGRADE STARS. KP-Simple-Rules: "Reject the significators which are in
 *   the star of a retrograde planet (because it cannot, during its period or sub
 *   period, give the results of its star lord)." Those grahas are dropped from
 *   every level and listed separately so the rejection is visible.
 *
 *   NODE AGENCY. Rāhu and Ketu own no sign, so they signify nothing by ownership.
 *   KP gives them the agency of the grahas they conjoin, are aspected by, or sit
 *   with in the star of — their signification is borrowed. Handled by
 *   `nodeAgency`.
 */
import type { JyotishaChart, PlanetId } from '../jyotisha/types';
import { GRAHA_PROPERTIES } from '../jyotisha/constants';
import { calculateKPPosition } from '../jyotisha/sphutas';
import { NODES } from './constants';
import type { KpCusp } from './cusps';
import { cuspLord } from './cusps';

export interface SignificatorLevel {
  level: 1 | 2 | 3 | 4;
  rule: string;
  planets: PlanetId[];
  planetNames: string[];
}

export interface SignificatorsResult {
  house: number;
  levels: SignificatorLevel[];
  /** Union across the four levels, strongest level winning. */
  ranked: Array<{ planet: PlanetId; planetName: string; level: number }>;
  /** Dropped because their star lord is retrograde. */
  rejectedRetrograde: PlanetId[];
  /** Nodes acting as agents, with the graha whose agency they borrow. */
  nodeAgents: Array<{ node: PlanetId; agentOf: PlanetId }>;
}

/** Star lord of a graha in this chart. */
function starLordOf(chart: JyotishaChart, id: PlanetId): PlanetId | null {
  const p: any = (chart.planets as any)?.[id];
  if (!p || typeof p.siderealLongitude !== 'number') return null;
  return calculateKPPosition(p.siderealLongitude).starLord;
}

function isRetrograde(chart: JyotishaChart, id: PlanetId): boolean {
  return (chart.planets as any)?.[id]?.isRetrograde === true;
}

/**
 * Which graha a node borrows its agency from.
 *
 * KP: Rāhu/Ketu take on the role of a graha they conjoin (same sign), that
 * aspects them, or in whose star they sit. Conjunction is checked first because
 * it is the strongest, then the star, then an aspect.
 */
export function nodeAgency(chart: JyotishaChart): Array<{ node: PlanetId; agentOf: PlanetId }> {
  const out: Array<{ node: PlanetId; agentOf: PlanetId }> = [];
  const planets = chart.planets as any;

  for (const node of NODES) {
    const n: any = planets?.[node];
    if (!n) continue;

    // 1. Conjunction — a graha in the same sign.
    const conjunct = Object.keys(planets).find(
      (id) => !NODES.includes(id as PlanetId) && planets[id]?.rashiNumber === n.rashiNumber
    ) as PlanetId | undefined;

    // 2. Star lord of the node.
    const star = starLordOf(chart, node);

    // 3. A graha aspecting the node's sign.
    const aspecting = Object.keys(planets).find((id) => {
      if (NODES.includes(id as PlanetId)) return false;
      const distances = GRAHA_PROPERTIES[id as PlanetId]?.aspectDistances ?? [7];
      return distances.some(
        (d) => ((planets[id].rashiNumber - 1 + d - 1) % 12) + 1 === n.rashiNumber
      );
    }) as PlanetId | undefined;

    const agent = conjunct ?? star ?? aspecting;
    if (agent && agent !== node) out.push({ node, agentOf: agent });
  }
  return out;
}

/**
 * The four-level significators of one house, with KP's retrograde rejection.
 */
export function significatorsOf(
  chart: JyotishaChart,
  cusps: KpCusp[],
  house: number
): SignificatorsResult {
  const cusp = cusps[house - 1];
  if (!cusp) {
    return { house, levels: [], ranked: [], rejectedRetrograde: [], nodeAgents: [] };
  }

  const planets = chart.planets as any;
  const occupants = cusp.occupants;
  const owner = cuspLord(cusp);

  const inStarOf = (targets: PlanetId[]): PlanetId[] => {
    const out: PlanetId[] = [];
    for (const id of Object.keys(planets)) {
      const sl = starLordOf(chart, id as PlanetId);
      if (sl && targets.includes(sl) && !out.includes(id as PlanetId)) out.push(id as PlanetId);
    }
    return out;
  };

  // KP: drop any graha sitting in a retrograde planet's star.
  const rejected = new Set<PlanetId>();
  const filterRetrograde = (ids: PlanetId[]): PlanetId[] =>
    ids.filter((id) => {
      const sl = starLordOf(chart, id);
      if (sl && isRetrograde(chart, sl)) {
        rejected.add(id);
        return false;
      }
      return true;
    });

  const name = (ids: PlanetId[]) => ids.map((x) => GRAHA_PROPERTIES[x]?.name ?? x);

  const raw: Array<{ level: 1 | 2 | 3 | 4; rule: string; planets: PlanetId[] }> = [
    { level: 1, rule: 'Grahas in the star of the occupants', planets: inStarOf(occupants) },
    { level: 2, rule: 'The occupants themselves', planets: occupants },
    { level: 3, rule: 'Grahas in the star of the cusp lord', planets: inStarOf([owner]) },
    { level: 4, rule: 'The cusp lord itself', planets: [owner] },
  ];

  const levels: SignificatorLevel[] = raw.map((r) => {
    const kept = filterRetrograde(r.planets);
    return { level: r.level, rule: r.rule, planets: kept, planetNames: name(kept) };
  });

  // Strongest level wins for each graha.
  const best = new Map<PlanetId, number>();
  for (const l of levels) {
    for (const p of l.planets) {
      if (!best.has(p) || l.level < (best.get(p) as number)) best.set(p, l.level);
    }
  }
  const ranked = [...best.entries()]
    .map(([planet, level]) => ({
      planet,
      planetName: GRAHA_PROPERTIES[planet]?.name ?? planet,
      level,
    }))
    .sort((a, b) => a.level - b.level);

  return {
    house,
    levels,
    ranked,
    rejectedRetrograde: [...rejected],
    nodeAgents: nodeAgency(chart),
  };
}

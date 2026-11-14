/**
 * KP — significators.
 *
 * The four-level ranking, strongest first:
 *
 *   1. Grahas in the star of a house's occupants
 *   2. The occupants themselves
 *   3. Grahas in the star of the cusp lord
 *   4. The cusp lord itself
 *
 * Two rules govern this file, and both were wrong in the first version:
 *
 *   RETROGRADE IS A HORARY DEVICE, NOT A NATAL ONE. KP practice is explicit: in
 *   a birth chart retrogression carries no weight — a retrograde graha signifies
 *   its houses exactly as a direct one does. It is only in a question chart that
 *   a retrograde sub lord is read as delay or denial. The first version applied
 *   the horary rejection to every chart and silently dropped good significators.
 *   `mode` now decides.
 *
 *   NODE AGENCY HAS A DEFINED ORDER. Rāhu and Ketu own no sign, so they act for
 *   another graha in this order: the graha they conjoin (the nearest, when more
 *   than one), then the owner of the sign they tenant, then any graha aspecting
 *   them. A node signifies both by its own four levels and by the four levels of
 *   the graha it represents — the first version used the wrong order and skipped
 *   the borrowed signification entirely.
 */
import type { JyotishaChart, PlanetId } from '../jyotisha/types';
import { GRAHA_PROPERTIES, RASHIS } from '../jyotisha/constants';
import { calculateKPPosition } from '../jyotisha/sphutas';
import { NODES } from './constants';
import type { KpCusp } from './cusps';
import { cuspLord } from './cusps';

/** Natal reading, or a horary question — the retrograde rule differs. */
export type KpMode = 'natal' | 'horary';

export interface SignificatorLevel {
  level: 1 | 2 | 3 | 4;
  rule: string;
  planets: PlanetId[];
  planetNames: string[];
}

export interface NodeAgent {
  node: PlanetId;
  agentOf: PlanetId;
  /** How the agency was established, in the order the texts give. */
  basis: 'conjunction' | 'sign-owner' | 'aspect';
  /** Distance in degrees from the node, when established by conjunction. */
  separation?: number;
}

export interface SignificatorsResult {
  house: number;
  levels: SignificatorLevel[];
  /** Union across the four levels, strongest level winning. */
  ranked: Array<{ planet: PlanetId; planetName: string; level: number }>;
  /** Dropped because their star lord is retrograde — horary only. */
  rejectedRetrograde: PlanetId[];
  /** Nodes acting as agents, with the graha whose agency they borrow. */
  nodeAgents: NodeAgent[];
  /** Houses a node signifies by borrowing its agent's links. */
  nodeBorrowed: Array<{ node: PlanetId; agentOf: PlanetId; houses: number[] }>;
}

function starLordOf(chart: JyotishaChart, id: PlanetId): PlanetId | null {
  const p: any = (chart.planets as any)?.[id];
  if (!p || typeof p.siderealLongitude !== 'number') return null;
  return calculateKPPosition(p.siderealLongitude).starLord;
}

function isRetrograde(chart: JyotishaChart, id: PlanetId): boolean {
  return (chart.planets as any)?.[id]?.isRetrograde === true;
}

/** Shortest angular separation between two longitudes, 0–180. */
function separation(a: number, b: number): number {
  const d = Math.abs(((a - b + 540) % 360) - 180);
  return d;
}

/**
 * Which graha a node represents.
 *
 * Order, from the texts: a graha conjoining or aspecting it, then the owner of
 * the sign it tenants. When several conjoin, the nearest is the strongest agent.
 */
export function nodeAgency(chart: JyotishaChart): NodeAgent[] {
  const out: NodeAgent[] = [];
  const planets = chart.planets as any;

  for (const node of NODES) {
    const n: any = planets?.[node];
    if (!n || typeof n.siderealLongitude !== 'number') continue;

    // 1. Conjunction — nearest graha in the same sign.
    let nearest: { id: PlanetId; sep: number } | null = null;
    for (const id of Object.keys(planets)) {
      if (NODES.includes(id as PlanetId)) continue;
      const p: any = planets[id];
      if (!p || p.rashiNumber !== n.rashiNumber) continue;
      if (typeof p.siderealLongitude !== 'number') continue;
      const sep = separation(n.siderealLongitude, p.siderealLongitude);
      if (!nearest || sep < nearest.sep) nearest = { id: id as PlanetId, sep };
    }
    if (nearest) {
      out.push({ node, agentOf: nearest.id, basis: 'conjunction', separation: Number(nearest.sep.toFixed(2)) });
      continue;
    }

    // 2. The owner of the sign the node tenants.
    const signOwner = RASHIS[n.rashiNumber as 1]?.lord as PlanetId | undefined;
    if (signOwner) {
      out.push({ node, agentOf: signOwner, basis: 'sign-owner' });
      continue;
    }

    // 3. A graha aspecting the node's sign.
    const aspecting = Object.keys(planets).find((id) => {
      if (NODES.includes(id as PlanetId)) return false;
      const distances = GRAHA_PROPERTIES[id as PlanetId]?.aspectDistances ?? [7];
      return distances.some(
        (d) => ((planets[id].rashiNumber - 1 + d - 1) % 12) + 1 === n.rashiNumber
      );
    }) as PlanetId | undefined;
    if (aspecting) out.push({ node, agentOf: aspecting, basis: 'aspect' });
  }
  return out;
}

/** The houses a graha signifies by its own occupation, ownership and star link. */
function ownHouses(chart: JyotishaChart, cusps: KpCusp[], id: PlanetId): number[] {
  const out = new Set<number>();
  const p: any = (chart.planets as any)?.[id];
  if (!p || typeof p.siderealLongitude !== 'number') return [];

  const lon = p.siderealLongitude;
  for (let i = 0; i < 12; i++) {
    const start = cusps[i].longitude;
    const end = cusps[(i + 1) % 12].longitude;
    const inside = start < end ? lon >= start && lon < end : lon >= start || lon < end;
    if (inside) { out.add(cusps[i].house); break; }
  }
  for (const c of cusps) if (cuspLord(c) === id) out.add(c.house);

  const star = calculateKPPosition(lon).starLord;
  if (star !== id) {
    const sp: any = (chart.planets as any)?.[star];
    if (sp && typeof sp.siderealLongitude === 'number') {
      const slon = sp.siderealLongitude;
      for (let i = 0; i < 12; i++) {
        const start = cusps[i].longitude;
        const end = cusps[(i + 1) % 12].longitude;
        const inside = start < end ? slon >= start && slon < end : slon >= start || slon < end;
        if (inside) { out.add(cusps[i].house); break; }
      }
      for (const c of cusps) if (cuspLord(c) === star) out.add(c.house);
    }
  }
  return [...out].sort((a, b) => a - b);
}

/**
 * The four-level significators of one house.
 */
export function significatorsOf(
  chart: JyotishaChart,
  cusps: KpCusp[],
  house: number,
  mode: KpMode = 'natal'
): SignificatorsResult {
  const cusp = cusps[house - 1];
  if (!cusp) {
    return { house, levels: [], ranked: [], rejectedRetrograde: [], nodeAgents: [], nodeBorrowed: [] };
  }

  const planets = chart.planets as any;
  const occupants = cusp.occupants;
  const owner = cuspLord(cusp);
  const agents = nodeAgency(chart);

  const inStarOf = (targets: PlanetId[]): PlanetId[] => {
    const out: PlanetId[] = [];
    for (const id of Object.keys(planets)) {
      const sl = starLordOf(chart, id as PlanetId);
      if (sl && targets.includes(sl) && !out.includes(id as PlanetId)) out.push(id as PlanetId);
    }
    return out;
  };

  // Retrograde rejection applies to a horary question chart only. In a natal
  // chart KP gives retrogression no weight, so nothing is dropped.
  const rejected = new Set<PlanetId>();
  const filterRetrograde = (ids: PlanetId[]): PlanetId[] => {
    if (mode !== 'horary') return ids;
    return ids.filter((id) => {
      const sl = starLordOf(chart, id);
      if (sl && isRetrograde(chart, sl)) {
        rejected.add(id);
        return false;
      }
      return true;
    });
  };

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

  const best = new Map<PlanetId, number>();
  for (const l of levels) {
    for (const p of l.planets) {
      if (!best.has(p) || l.level < (best.get(p) as number)) best.set(p, l.level);
    }
  }
  const ranked = [...best.entries()]
    .map(([planet, level]) => ({ planet, planetName: GRAHA_PROPERTIES[planet]?.name ?? planet, level }))
    .sort((a, b) => a.level - b.level);

  // What each node signifies by borrowing its agent's links.
  const nodeBorrowed = agents.map((a) => ({
    node: a.node,
    agentOf: a.agentOf,
    houses: ownHouses(chart, cusps, a.agentOf),
  }));

  return {
    house,
    levels,
    ranked,
    rejectedRetrograde: [...rejected],
    nodeAgents: agents,
    nodeBorrowed,
  };
}

/** Houses a graha signifies, node agency included. */
export function housesSignified(
  chart: JyotishaChart,
  cusps: KpCusp[],
  id: PlanetId
): number[] {
  const own = ownHouses(chart, cusps, id);
  if (!NODES.includes(id)) return own;
  // A node adds the houses of the graha it represents.
  const agent = nodeAgency(chart).find((a) => a.node === id);
  if (!agent) return own;
  return [...new Set([...own, ...ownHouses(chart, cusps, agent.agentOf)])].sort((a, b) => a - b);
}

export { ownHouses };

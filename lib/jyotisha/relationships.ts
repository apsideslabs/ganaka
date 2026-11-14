/**
 * Gaṇaka — Pañcadhā Maitrī: the five-fold relationship matrix.
 *
 * The relationship between two grahas is read in three layers:
 *
 *   NAISARGIKA  natural — fixed by the planetary cabinet, the same in every chart.
 *   TĀTKĀLIKA   temporal — a graha is a temporal friend of whatever sits in the
 *               2nd, 3rd, 4th, 10th, 11th or 12th from it, and a temporal enemy
 *               of the rest.
 *   PAÑCADHĀ    compound — the two combined, giving five grades from Adhi Mitra
 *               to Adhi Shatru.
 *
 * The individual functions already existed in lib/jyotisha/dignity.ts but were
 * never called from anywhere, so the workspace, the JSON and the PDF all had no
 * relationship data at all. This module runs them across the chart and hands
 * back a matrix both the panels and the exports can use.
 */
import type { JyotishaChart, PlanetId, RashiNumber } from './types';
import { GRAHA_PROPERTIES, RASHIS } from './constants';
import {
  calculateNaturalFriendship,
  getTatkalikaRelationship,
  getPanchadhaRelationship,
} from './dignity';

/** The seven tāras plus the nodes, in the order a chart is usually read. */
export const RELATION_PLANETS: PlanetId[] = [
  'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu',
];

export type NaturalGrade = 'Mitra' | 'Sama' | 'Shatru';
export type TemporalGrade = 'friend' | 'enemy';
export type CompoundGrade = 'Adhi Mitra' | 'Mitra' | 'Sama' | 'Shatru' | 'Adhi Shatru';

export interface RelationshipPair {
  planet: PlanetId;
  planetName: string;
  other: PlanetId;
  otherName: string;
  /** Naisargika — fixed by the planetary cabinet. */
  natural: NaturalGrade;
  /** Tātkālika — from the house distance between them in this chart. */
  temporal: TemporalGrade;
  /** Pañcadhā — natural and temporal combined. */
  compound: CompoundGrade;
  /** House distance from `planet` to `other`, 1–12. */
  houseDistance: number;
}

export interface RelationshipMatrix {
  pairs: RelationshipPair[];
  /** Each graha with its relations, for a per-planet table. */
  byPlanet: Record<string, Array<{
    other: string;
    otherName: string;
    natural: NaturalGrade;
    temporal: TemporalGrade;
    compound: CompoundGrade;
  }>>;
  summary: {
    adhiMitra: number;
    mitra: number;
    sama: number;
    shatru: number;
    adhiShatru: number;
  };
}

function rashiOf(chart: JyotishaChart, id: PlanetId): RashiNumber {
  return ((chart.planets as any)?.[id]?.rashiNumber ?? 1) as RashiNumber;
}

/**
 * Build the full matrix. Only grahas present in the chart are included, so a
 * chart computed without the nodes simply yields a smaller matrix.
 */
/**
 * Varga rāśi of a graha, or its D1 rāśi when no varga is asked for.
 *
 * The natural friendship is fixed by the planetary cabinet and never changes.
 * The temporal reading comes from the sign distance between the two grahas — so
 * it shifts when the chart is a divisional one, which is exactly why an
 * astrologer will check D-9 as well as D-1 before committing to a compound
 * verdict.
 */
function rashiIn(chart: JyotishaChart, id: PlanetId, varga?: string): RashiNumber {
  if (!varga || varga === 'D1') return rashiOf(chart, id);
  const v: any = (chart.vargas as any)?.[varga];
  const p: any = v?.planets?.[id] ?? (v?.positions as any)?.[id];
  const r = Number(p?.rashiNumber ?? p?.rashi ?? 0);
  return (r >= 1 && r <= 12 ? r : rashiOf(chart, id)) as RashiNumber;
}

export function calculateRelationshipMatrix(
  chart: JyotishaChart,
  varga?: string
): RelationshipMatrix {
  const present = RELATION_PLANETS.filter((id) => (chart.planets as any)?.[id]);
  const pairs: RelationshipPair[] = [];
  const byPlanet: RelationshipMatrix['byPlanet'] = {};
  const summary = { adhiMitra: 0, mitra: 0, sama: 0, shatru: 0, adhiShatru: 0 };

  for (const a of present) {
    byPlanet[a] = [];
    const aRashi = rashiIn(chart, a, varga);

    for (const b of present) {
      if (a === b) continue;
      const bRashi = rashiIn(chart, b, varga);

      const natural = calculateNaturalFriendship(a, b);
      const temporal = getTatkalikaRelationship(aRashi, bRashi);
      const compound = getPanchadhaRelationship(a, b, aRashi, bRashi);
      const houseDistance = (((bRashi - aRashi + 12) % 12) + 1);

      pairs.push({
        planet: a,
        planetName: GRAHA_PROPERTIES[a]?.name ?? a,
        other: b,
        otherName: GRAHA_PROPERTIES[b]?.name ?? b,
        natural,
        temporal,
        compound,
        houseDistance,
      });

      byPlanet[a].push({
        other: b,
        otherName: GRAHA_PROPERTIES[b]?.name ?? b,
        natural,
        temporal,
        compound,
      });

      if (compound === 'Adhi Mitra') summary.adhiMitra++;
      else if (compound === 'Mitra') summary.mitra++;
      else if (compound === 'Sama') summary.sama++;
      else if (compound === 'Shatru') summary.shatru++;
      else summary.adhiShatru++;
    }
  }

  return { pairs, byPlanet, summary };
}

/**
 * How each graha stands with the lord of the sign it occupies — the reading an
 * astrologer actually uses, rather than the full pairwise grid.
 */
export interface DispositorRelation {
  planet: PlanetId;
  planetName: string;
  rashiName: string;
  dispositor: PlanetId;
  dispositorName: string;
  natural: NaturalGrade;
  temporal: TemporalGrade;
  compound: CompoundGrade;
}

export function calculateDispositorRelations(chart: JyotishaChart): DispositorRelation[] {
  const out: DispositorRelation[] = [];
  for (const id of RELATION_PLANETS) {
    const pos: any = (chart.planets as any)?.[id];
    if (!pos) continue;
    const rashi = pos.rashiNumber as RashiNumber;
    const lord = RASHIS[rashi]?.lord as PlanetId;
    if (!lord) continue;

    const lordPos: any = (chart.planets as any)?.[lord];
    const lordRashi = (lordPos?.rashiNumber ?? rashi) as RashiNumber;

    out.push({
      planet: id,
      planetName: GRAHA_PROPERTIES[id]?.name ?? id,
      rashiName: RASHIS[rashi]?.name ?? '',
      dispositor: lord,
      dispositorName: GRAHA_PROPERTIES[lord]?.name ?? lord,
      natural: calculateNaturalFriendship(id, lord),
      temporal: getTatkalikaRelationship(rashi, lordRashi),
      compound: getPanchadhaRelationship(id, lord, rashi, lordRashi),
    });
  }
  return out;
}

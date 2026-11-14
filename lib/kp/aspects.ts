/**
 * KP — aspects.
 *
 * KP does not replace dṛṣṭi with something else; Krishnamurti layered Western
 * aspects on top of the Parāśarī set, and both belong to his original method
 * (KP Reader 1, pp. 130–132). What is genuinely KP is the hierarchy, not the
 * geometry:
 *
 *   ⚠ ASPECTS NEVER OVERRIDE THE CUSPAL SUB-LORD. A planet aspecting a cusp
 *   gains a secondary, supporting link to that house — it does not become a
 *   primary significator, and it cannot reverse a denial the sub lord has
 *   already made. Aspects are character witnesses; the sub lord is the judge.
 *
 * Two further points that are KP-specific rather than general:
 *
 *   The aspect benefic/malefic reading is FIXED by the graha, not by the chart.
 *   Jupiter, Venus, Moon and Mercury are always benefic in aspect; Saturn, Mars
 *   and the Sun always malefic — "Saturn though connected to benefic houses, by
 *   its aspect, will offer only harmful results". This is the opposite of the
 *   Parāśarī habit of reading a graha's nature from its house.
 *
 *   The cusps are real degrees, so an aspect can fall on a cusp. Whole-sign
 *   dṛṣṭi has no way to express that at all, and it is half the value of the KP
 *   view.
 */

import type { JyotishaChart, PlanetId } from '../jyotisha/types';
import { GRAHA_PROPERTIES } from '../jyotisha/constants';
import type { KpCusp } from './cusps';

export type AspectKind = 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'rasi';

export interface AspectRule {
  kind: AspectKind;
  angle: number;
  orb: number;
  label: string;
}

/**
 * Krishnamurti's own orbs, from KP Reader 1 — generous, not the tightened 1–3°
 * set some modern schools teach as "orthodox". A 12° conjunction is his figure,
 * citing the Uttara Kalamṛta.
 */
export function orbsFor(planet: PlanetId): { applying: number; separating: number } {
  if (planet === 'sun') return { applying: 12, separating: 12 };
  if (planet === 'moon') return { applying: 8, separating: 12 };
  return { applying: 6, separating: 8 };
}

const WESTERN: Array<{ kind: AspectKind; angle: number; label: string }> = [
  { kind: 'conjunction', angle: 0, label: 'Conjunction' },
  { kind: 'sextile', angle: 60, label: 'Sextile' },
  { kind: 'square', angle: 90, label: 'Square' },
  { kind: 'trine', angle: 120, label: 'Trine' },
  { kind: 'opposition', angle: 180, label: 'Opposition' },
];

/**
 * Rāśi dṛṣṭi — the Parāśarī special aspects Krishnamurti taught directly.
 * All grahas aspect the 7th; Mars adds 4 and 8, Jupiter 5 and 9, Saturn 3 and 10.
 */
export const RASI_ASPECTS: Record<PlanetId, number[]> = {
  sun: [7], moon: [7], mercury: [7], venus: [7],
  mars: [4, 7, 8], jupiter: [5, 7, 9], saturn: [3, 7, 10],
  rahu: [7], ketu: [7], true_rahu: [7], true_ketu: [7],
};

/**
 * The fixed aspect nature. Deliberately not read from the chart: KP holds that
 * Jupiter's aspect is benefic and Saturn's malefic whatever houses they rule.
 */
const ASPECT_BENEFICS: PlanetId[] = ['jupiter', 'venus', 'moon', 'mercury'];
export const isAspectBenefic = (p: PlanetId): boolean => ASPECT_BENEFICS.includes(p);

export interface PlanetAspect {
  from: PlanetId;
  fromName: string;
  to: PlanetId;
  toName: string;
  kind: AspectKind;
  /** Exact separation in degrees. */
  separation: number;
  orb: number;
  /** True when the faster body is closing on the exact angle. */
  applying: boolean;
  benefic: boolean;
}

export interface CuspAspect {
  from: PlanetId;
  fromName: string;
  cusp: number;
  cuspLongitude: number;
  kind: AspectKind;
  separation: number;
  orb: number;
  benefic: boolean;
  /** The houses this aspecting graha signifies — what it carries into the cusp. */
  carries: number[];
}

export interface KpAspectsResult {
  /** Graha-to-graha aspects, degree-based. */
  planetAspects: PlanetAspect[];
  /** Graha-to-cusp aspects — the half whole-sign dṛṣṭi cannot express. */
  cuspAspects: CuspAspect[];
  /** Rāśi dṛṣṭi: which grahas aspect which house, by whole sign. */
  rasiAspects: Array<{ from: PlanetId; fromName: string; house: number; benefic: boolean }>;
  note: string;
}

/** Shortest separation between two longitudes, 0–180. */
const sep = (a: number, b: number): number => Math.abs(((a - b + 540) % 360) - 180);

/**
 * Every KP aspect in a chart.
 */
export function calculateKpAspects(
  chart: JyotishaChart,
  cusps: KpCusp[],
  housesSignifiedBy: (id: PlanetId) => number[]
): KpAspectsResult {
  const planets = chart.planets as any;
  const ids = Object.keys(planets).filter(
    (id) => typeof planets[id]?.siderealLongitude === 'number' && !id.startsWith('true_')
  ) as PlanetId[];

  const planetAspects: PlanetAspect[] = [];
  const cuspAspects: CuspAspect[] = [];

  // ---- graha to graha ------------------------------------------------
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = ids[i], b = ids[j];
      const la = planets[a].siderealLongitude;
      const lb = planets[b].siderealLongitude;
      const s = sep(la, lb);

      for (const w of WESTERN) {
        const orbA = orbsFor(a).applying;
        const orbB = orbsFor(b).applying;
        const orb = Math.max(orbA, orbB);
        if (Math.abs(s - w.angle) > orb) continue;

        // Applying when the separation is closing — read from the two speeds.
        const relSpeed = Number(planets[a].speed ?? 0) - Number(planets[b].speed ?? 0);
        const d = ((lb - la + 540) % 360) - 180;
        const applying = relSpeed === 0 ? false : Math.sign(relSpeed) * Math.sign(d) > 0;

        planetAspects.push({
          from: a, fromName: GRAHA_PROPERTIES[a]?.name ?? a,
          to: b, toName: GRAHA_PROPERTIES[b]?.name ?? b,
          kind: w.kind, separation: Number(s.toFixed(2)), orb,
          applying,
          // The aspect takes the nature of the stronger aspected body in KP's
          // fixed scheme; a malefic's aspect stays malefic.
          benefic: isAspectBenefic(a) && isAspectBenefic(b),
        });
        break;
      }
    }
  }

  // ---- graha to cusp --------------------------------------------------
  for (const id of ids) {
    const lon = planets[id].siderealLongitude;
    for (const c of cusps) {
      const s = sep(lon, c.longitude);
      for (const w of WESTERN) {
        const orb = orbsFor(id).applying;
        if (Math.abs(s - w.angle) > orb) continue;
        cuspAspects.push({
          from: id, fromName: GRAHA_PROPERTIES[id]?.name ?? id,
          cusp: c.house, cuspLongitude: c.longitude,
          kind: w.kind, separation: Number(s.toFixed(2)), orb,
          benefic: isAspectBenefic(id),
          carries: housesSignifiedBy(id),
        });
        break;
      }
    }
  }

  // ---- rāśi dṛṣṭi -----------------------------------------------------
  const rasiAspects: KpAspectsResult['rasiAspects'] = [];
  for (const id of ids) {
    const fromRashi = Number(planets[id].rashiNumber);
    for (const dist of RASI_ASPECTS[id] ?? [7]) {
      const target = ((fromRashi - 1 + dist - 1) % 12) + 1;
      // The house whose cusp sign is that rashi.
      const cusp = cusps.find((c) => c.rashi === target);
      if (!cusp) continue;
      rasiAspects.push({
        from: id, fromName: GRAHA_PROPERTIES[id]?.name ?? id,
        house: cusp.house, benefic: isAspectBenefic(id),
      });
    }
  }

  return {
    planetAspects,
    cuspAspects,
    rasiAspects,
    note:
      'Aspects in KP support or suppress a signification; they never override the cuspal sub lord. ' +
      'The aspect nature is fixed by the graha — Jupiter, Venus, Moon and Mercury are always benefic ' +
      'in aspect, Saturn, Mars and the Sun always malefic, whatever houses they rule. Orbs follow ' +
      'Krishnamurti: Sun 12°, Moon 8–12°, the rest 6° applying and 8° separating.',
  };
}

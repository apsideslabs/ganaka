/**
 * Birth-time sensitivity of a KP cusp sub lord.
 *
 * KP's whole verdict hangs on the sub lord of one cusp degree, and the sub lord
 * hangs on the minute of birth. A reading that hides that is hiding its largest
 * source of error:
 *
 *   "together with a note of how many minutes the birth time could move before
 *    the 7th cusp sub lord changes. That last note matters more than it looks."
 *
 * The number is found by walking the birth time forward and back a minute at a
 * time until the cusp crosses into a different sub, and reporting the smaller
 * of the two distances.
 */
import type { JyotishaChart, PlanetId } from '@/lib/jyotisha/types';
import { calculateAscendant } from '@/lib/jyotisha/houses';
import { calculateAyanamsha } from '@/lib/astronomy/ayanamsha';
import { calculateKPPosition } from '@/lib/jyotisha/sphutas';

export interface CuspSensitivity {
  house: number;
  subLord: PlanetId;
  /** Minutes the birth time may move in either direction before the sub changes. */
  minutes: number;
  /** The sub lord that takes over first, and which way the clock would have to move. */
  wouldBecome: { subLord: PlanetId; direction: 'earlier' | 'later'; afterMinutes: number } | null;
}

const KP_AYAN = 'kp' as any;

/** The 7th cusp longitude for a birth time shifted by `deltaMinutes`. */
function cusp7At(chart: JyotishaChart, deltaMinutes: number): number | null {
  const bd: any = (chart.meta as any)?.birthDetails;
  const jd0 = Number((chart.meta as any)?.julianDay);
  if (!bd || !Number.isFinite(jd0)) return null;

  const jd = jd0 + deltaMinutes / 1440;
  const asc = calculateAscendant(jd, bd.latitude, bd.longitude, KP_AYAN, 0);
  // The 7th cusp is the ascendant plus 180° in Placidus, to first order.
  return ((asc.siderealLongitude + 180) % 360 + 360) % 360;
}

/**
 * How many minutes the birth time may move before the 7th cusp sub lord changes.
 * Returns null when the chart carries no birth details to perturb.
 */
export function cusp7Sensitivity(chart: JyotishaChart, maxMinutes = 30): CuspSensitivity | null {
  const bd: any = (chart.meta as any)?.birthDetails;
  if (!bd) return null;

  const base = cusp7At(chart, 0);
  if (base === null) return null;
  const baseSub = calculateKPPosition(base).subLord as PlanetId;

  let earlier: number | null = null;
  let later: number | null = null;

  for (let m = 1; m <= maxMinutes; m++) {
    const back = cusp7At(chart, -m);
    if (back !== null && calculateKPPosition(back).subLord !== baseSub && earlier === null) {
      earlier = m;
    }
    const fwd = cusp7At(chart, m);
    if (fwd !== null && calculateKPPosition(fwd).subLord !== baseSub && later === null) {
      later = m;
    }
    if (earlier !== null && later !== null) break;
  }

  const minutes = Math.min(earlier ?? maxMinutes, later ?? maxMinutes);
  const direction = (earlier ?? Infinity) <= (later ?? Infinity) ? 'earlier' : 'later';
  const afterMinutes = direction === 'earlier' ? earlier : later;
  const probe = cusp7At(chart, direction === 'earlier' ? -(afterMinutes ?? 0) : (afterMinutes ?? 0));

  return {
    house: 7,
    subLord: baseSub,
    minutes,
    wouldBecome:
      probe !== null && afterMinutes !== null
        ? { subLord: calculateKPPosition(probe).subLord as PlanetId, direction, afterMinutes }
        : null,
  };
}

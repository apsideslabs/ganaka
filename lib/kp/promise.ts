/**
 * KP — the cuspal sub-lord promise, and cuspal interlinks.
 *
 * The sub-lord settles whether a matter is promised at all; everything else
 * refines timing and texture. The rule, from KP-Simple-Rules:
 *
 *   "The cuspal sub lord of a house under question indicates whether the matter
 *   signified by that house is promised or not. The matter is promised if the
 *   cuspal sub lord is the significator of that house or any one of the houses
 *   under consideration."
 *
 * Two qualifications the earlier version omitted:
 *
 *   RETROGRADE. "If the cuspal sub lord or its sub star lord is retrograde, the
 *   matter is promised when they turn direct." Such a promise is reported as
 *   deferred rather than plain.
 *
 *   INTERLINKS. A cusp's sub lord standing in another cusp's star chains the two
 *   houses together — this is how KP reads one matter in terms of another, and
 *   it is the part practitioners lean on most.
 */
import type { JyotishaChart, PlanetId } from '../jyotisha/types';
import { GRAHA_PROPERTIES } from '../jyotisha/constants';
import { calculateKPPosition } from '../jyotisha/sphutas';
import type { KpCusp } from './cusps';
import { cuspLord } from './cusps';
import { fertilityOf } from './constants';

export type CuspPromise = 'promised' | 'promised-when-direct' | 'denied' | 'mixed' | 'undetermined';

export interface CuspPromiseResult {
  house: number;
  subLord: PlanetId;
  subLordName: string;
  subLordRetrograde: boolean;
  /** Houses the sub lord signifies — by occupation, ownership and star. */
  signifies: number[];
  matterHouses: number[];
  detrimentalHouses: number[];
  hitsMatter: number[];
  hitsDetrimental: number[];
  promise: CuspPromise;
  /** Fruitful / semi-fruitful / barren sign on the cusp. */
  fertility: string;
  reading: string;
}

/**
 * Which houses a graha signifies, by KP's links.
 *
 * Occupation (the house whose arc holds it), ownership (the cusp whose sign it
 * rules) and the star link (the houses signified by its star lord).
 */
function housesSignifiedBy(
  chart: JyotishaChart,
  cusps: KpCusp[],
  id: PlanetId
): number[] {
  const out = new Set<number>();
  const p: any = (chart.planets as any)?.[id];
  if (!p) return [];

  // Occupation — by cusp boundary, not by sign.
  const lon = p.siderealLongitude;
  for (let i = 0; i < 12; i++) {
    const start = cusps[i].longitude;
    const end = cusps[(i + 1) % 12].longitude;
    const inside = start < end ? lon >= start && lon < end : lon >= start || lon < end;
    if (inside) { out.add(cusps[i].house); break; }
  }

  // Ownership — the cusp whose sign this graha rules.
  for (const c of cusps) {
    if (cuspLord(c) === id) out.add(c.house);
  }

  // Star link — whatever the star lord signifies by occupation/ownership.
  const star = calculateKPPosition(lon).starLord;
  if (star !== id) {
    const sp: any = (chart.planets as any)?.[star];
    if (sp) {
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
 * Evaluate the promise on one cusp for one matter.
 */
export function evaluateCuspPromise(
  chart: JyotishaChart,
  cusps: KpCusp[],
  house: number,
  matterHouses: number[],
  detrimentalHouses: number[]
): CuspPromiseResult | null {
  const cusp = cusps[house - 1];
  if (!cusp) return null;

  const subLord = cusp.lords.subLord;
  const subLordRetrograde = (chart.planets as any)?.[subLord]?.isRetrograde === true;

  const signifies = housesSignifiedBy(chart, cusps, subLord);
  const hitsMatter = signifies.filter((h) => matterHouses.includes(h));
  const hitsDetrimental = signifies.filter((h) => detrimentalHouses.includes(h));

  let promise: CuspPromise;
  let reading: string;
  const name = GRAHA_PROPERTIES[subLord]?.name ?? subLord;

  if (hitsMatter.length > 0 && hitsDetrimental.length === 0) {
    promise = subLordRetrograde ? 'promised-when-direct' : 'promised';
    reading = subLordRetrograde
      ? `The sub lord ${name} signifies ${hitsMatter.join(', ')} but is retrograde, so the matter is promised when it turns direct.`
      : `The sub lord ${name} signifies ${hitsMatter.join(', ')} — the matter is promised.`;
  } else if (hitsMatter.length === 0 && hitsDetrimental.length > 0) {
    promise = 'denied';
    reading = `The sub lord ${name} signifies only the detrimental houses ${hitsDetrimental.join(', ')} — the matter is not promised.`;
  } else if (hitsMatter.length > 0 && hitsDetrimental.length > 0) {
    promise = 'mixed';
    reading = `The sub lord signifies both ${hitsMatter.join(', ')} and ${hitsDetrimental.join(', ')} — both results are given, in different periods.`;
  } else {
    promise = 'undetermined';
    reading = 'The sub lord signifies neither group by this reading, so the cusp is silent on the matter.';
  }

  return {
    house,
    subLord,
    subLordName: name,
    subLordRetrograde,
    signifies,
    matterHouses,
    detrimentalHouses,
    hitsMatter,
    hitsDetrimental,
    promise,
    fertility: fertilityOf(cusp.rashi),
    reading,
  };
}

export interface CuspInterlink {
  fromHouse: number;
  fromSubLord: PlanetId;
  fromSubLordName: string;
  /** The house whose star holds that sub lord. */
  intoHouse: number;
  intoCuspLord: PlanetId;
  note: string;
}

/**
 * Cuspal interlinks.
 *
 * For every cusp, find which other cusp's star holds its sub lord. That chain is
 * how KP reads one house's matter through another's — the 7th's sub lord sitting
 * in the 11th cusp's star ties marriage to gain, and so on.
 */
export function cuspalInterlinks(chart: JyotishaChart, cusps: KpCusp[]): CuspInterlink[] {
  const out: CuspInterlink[] = [];
  const planets = chart.planets as any;

  for (const cusp of cusps) {
    const subLord = cusp.lords.subLord;
    const p = planets?.[subLord];
    if (!p || typeof p.siderealLongitude !== 'number') continue;
    const starOfSub = calculateKPPosition(p.siderealLongitude).starLord;

    for (const other of cusps) {
      if (other.house === cusp.house) continue;
      const otherStar = other.lords.starLord;
      if (otherStar !== starOfSub) continue;

      out.push({
        fromHouse: cusp.house,
        fromSubLord: subLord,
        fromSubLordName: GRAHA_PROPERTIES[subLord]?.name ?? subLord,
        intoHouse: other.house,
        intoCuspLord: cuspLord(other),
        note: `House ${cusp.house} sub lord sits in the star of house ${other.house}'s star lord.`,
      });
    }
  }
  return out;
}

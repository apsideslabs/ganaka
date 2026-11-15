/**
 * Rāja Yoga from a debilitated graha — Bṛhat Parāśara Horā Śāstra 22.26–30.
 *
 * This is NOT the same thing as Nīcabhaṅga, and the difference matters.
 *
 * The word "nīcabhaṅga" does not occur in BPHS at all. What BPHS gives, in
 * chapter 22, is a shorter and stranger rule: a graha in its sign of fall that
 * ASPECTS THE LAGNA confers Rāja Yoga — the falling planet turned toward the
 * ascendant is read as a gain, not as a weakness to be repaired.
 *
 * The "lord in a kendra" checklist that everyone quotes as Nīcabhaṅga comes
 * from Phaladīpikā 7.26–30, a later text, which files those cancellations among
 * the rāja yogas. Both traditions exist; they are not the same rule, and a
 * chart can satisfy one and not the other. This module implements the BPHS
 * verses, and `neechabhanga.ts` implements Phaladīpikā's.
 *
 * The five verses, in order:
 *
 *   22.26  all grahas aspecting the lagna are auspicious-giving; even a
 *          debilitated graha, if it aspects the lagna, is declared a king
 *   22.27  a debilitated graha in the 3rd, 6th, 8th or 11th that aspects the
 *          lagna is a rāja-yoga-giving graha
 *   22.28  an exalted graha aspecting the birth lagna gives rāja yoga; a
 *          debilitated graha in the 6th or 8th aspecting it is yoga-making
 *   22.29  the lord of the 6th or 8th, debilitated and aspecting the lagna, or
 *          such a lord debilitated in the 3rd or 11th aspecting it, gives a
 *          kingdom
 *   22.30  the lords of the 6th and 8th both benefics, both in their
 *          debilitation signs, both aspecting the birth lagna — rāja yoga
 *
 * What the verses do NOT say, and this module does not add: how strong the
 * yoga is, when in life it shows, or what cancels it. Nothing here ranks one
 * case above another.
 */

import { PlanetId } from '../astronomy/ephemeris';
import { GRAHA_PROPERTIES, RASHIS } from './constants';

export interface RajaYogaCase {
  verse: '22.26' | '22.27' | '22.28' | '22.29' | '22.30';
  graha: PlanetId;
  grahaName: string;
  /** Where the graha sits. */
  house: number;
  rashiName: string;
  /** Why this verse applies, in the text's own terms. */
  reason: string;
  /** The Sanskrit phrase the verse uses for the result. */
  result: string;
}

const KENDRA = [1, 4, 7, 10];
const BENEFICS: PlanetId[] = ['jupiter', 'venus', 'mercury', 'moon'];

/** Whole-sign aspect houses, Parāśarī set. */
function aspectHouses(id: PlanetId): number[] {
  const base = [7];
  if (id === 'mars') return [...base, 4, 8];
  if (id === 'jupiter') return [...base, 5, 9];
  if (id === 'saturn') return [...base, 3, 10];
  return base;
}

/** Does the graha, sitting in `house`, cast a whole-sign aspect on the Lagna (house 1)? */
function aspectsLagna(id: PlanetId, house: number): boolean {
  // From `house`, the house that is `n` ahead is ((house + n - 2) % 12) + 1.
  return aspectHouses(id).some((n) => (((house + n - 2) % 12) + 1) === 1);
}

export interface RajaYogaInput {
  lagnaRashi: number;
  planets: Record<string, { rashiNumber: number; house: number }>;
}

/**
 * Every BPHS 22.26–30 case present in the chart.
 *
 * A chart may satisfy several verses at once; each is reported separately so a
 * reader can see which rule fired rather than a single merged verdict.
 */
export function evaluateNeechaRajaYoga(input: RajaYogaInput): RajaYogaCase[] {
  const out: RajaYogaCase[] = [];
  const props = GRAHA_PROPERTIES as any;

  const debilitated = (id: string) => {
    const p = input.planets[id];
    const prop = props[id];
    return p && prop && p.rashiNumber === prop.debilitationSign;
  };
  const houseOf = (id: string) => input.planets[id]?.house;

  // ── 22.26 — any debilitated graha aspecting the lagna ──────────────
  for (const id of Object.keys(input.planets)) {
    if (!debilitated(id)) continue;
    const h = houseOf(id);
    if (h === undefined || !aspectsLagna(id as PlanetId, h)) continue;
    out.push({
      verse: '22.26',
      graha: id as PlanetId,
      grahaName: props[id]?.sanskritName ?? id,
      house: h,
      rashiName: RASHIS[input.planets[id].rashiNumber as 1]?.name ?? '',
      reason: `debilitated, yet it casts a whole-sign aspect on the Lagna from house ${h}`,
      result: 'rājā prakīrtitaḥ — declared a king',
    });
  }

  // ── 22.27 — debilitated in 3, 6, 8 or 11 AND aspecting the lagna ───
  for (const id of Object.keys(input.planets)) {
    if (!debilitated(id)) continue;
    const h = houseOf(id);
    if (h === undefined || ![3, 6, 8, 11].includes(h)) continue;
    if (!aspectsLagna(id as PlanetId, h)) continue;
    out.push({
      verse: '22.27',
      graha: id as PlanetId,
      grahaName: props[id]?.sanskritName ?? id,
      house: h,
      rashiName: RASHIS[input.planets[id].rashiNumber as 1]?.name ?? '',
      reason: `debilitated in the ${h}th — one of the four the verse names — and aspecting the Lagna`,
      result: 'rājayoga-pradāyaka — a giver of Rāja Yoga',
    });
  }

  // ── 22.28 — an exalted graha aspecting the lagna ──────────────────
  for (const id of Object.keys(input.planets)) {
    const p = input.planets[id];
    const prop = props[id];
    if (!p || !prop || p.rashiNumber !== prop.exaltationSign) continue;
    const h = p.house;
    if (!aspectsLagna(id as PlanetId, h)) continue;
    out.push({
      verse: '22.28',
      graha: id as PlanetId,
      grahaName: prop.sanskritName ?? id,
      house: h,
      rashiName: RASHIS[p.rashiNumber as 1]?.name ?? '',
      reason: `exalted and aspecting the birth Lagna from house ${h}`,
      result: 'rāja yoga',
    });
  }

  // ── 22.29 — the lord of the 6th or 8th, debilitated, aspecting lagna ─
  // The verse asks which houses the graha RULES, not where it stands.
  const lagnaRashi = input.lagnaRashi;
  const rashiOfHouse = (h: number) => (((lagnaRashi - 1) + (h - 1)) % 12) + 1;
  const lordOfHouse = (h: number) => RASHIS[rashiOfHouse(h) as 1]?.lord as PlanetId | undefined;

  for (const houseNum of [6, 8]) {
    const lord = lordOfHouse(houseNum);
    if (!lord || !debilitated(lord)) continue;
    const h = houseOf(lord);
    if (h === undefined || !aspectsLagna(lord, h)) continue;
    out.push({
      verse: '22.29',
      graha: lord,
      grahaName: props[lord]?.sanskritName ?? lord,
      house: h,
      rashiName: RASHIS[input.planets[lord].rashiNumber as 1]?.name ?? '',
      reason: `lord of the ${houseNum}th, debilitated in house ${h}, aspecting the Lagna`,
      result: 'rājya-da — a giver of a kingdom',
    });
  }

  // ── 22.30 — both 6th and 8th lords benefics, both debilitated, both
  //           aspecting the lagna ─────────────────────────────────────
  const l6 = lordOfHouse(6);
  const l8 = lordOfHouse(8);
  if (
    l6 && l8 && l6 !== l8 &&
    BENEFICS.includes(l6) && BENEFICS.includes(l8) &&
    debilitated(l6) && debilitated(l8)
  ) {
    const h6 = houseOf(l6);
    const h8 = houseOf(l8);
    if (h6 !== undefined && h8 !== undefined && aspectsLagna(l6, h6) && aspectsLagna(l8, h8)) {
      out.push({
        verse: '22.30',
        graha: l6,
        grahaName: props[l6]?.sanskritName ?? l6,
        house: h6,
        rashiName: RASHIS[input.planets[l6].rashiNumber as 1]?.name ?? '',
        reason:
          `the lords of the 6th (${l6}) and 8th (${l8}) are both benefics, both in debilitation, ` +
          `and both aspect the birth Lagna`,
        result: 'rāja yoga udāhṛtaḥ — Rāja Yoga is declared',
      });
    }
  }

  return out;
}

export const RAJA_YOGA_NOTE =
  'BPHS 22.26–30 reads a fallen graha turned toward the Lagna as a gain. ' +
  'These verses say nothing about the strength of the yoga, when it shows, or what undoes it — ' +
  'and they are a different rule from the Phaladīpikā 7.26–30 cancellations.';

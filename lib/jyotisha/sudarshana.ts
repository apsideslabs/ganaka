/**
 * Gaṇaka — Sudarśana Cakra.
 *
 * BPHS ch. 74, *Sudarśanacakraphalādhyāya*. The construction is given in the
 * Sanskrit of 74.4–6:
 *
 *   एककेन्द्रोद्भवं रम्यं लिखेद् वृत्तत्रयं द्विज ।
 *   द्वादशारं च तत् कुर्याद् भवेदेवं सुदर्शनम् ॥४॥
 *   तत्राद्यवृत्ते लग्नाद्या भावा लेख्याः सखेचराः ।
 *   तदूर्ध्ववृत्ते चन्द्राच्च भवाः खेटसमन्विताः ॥५॥
 *   तदूर्ध्ववृत्ते सूर्याच्च क्रमात् भवा ग्रहान्विताः ।
 *   एवमेकैकभावेऽत्र भवेद्भानां त्रयं त्रयम् ॥६॥
 *
 * Three circles from one centre, twelve spokes each: the first holds the houses
 * counted from the Lagna with their planets, the next those from the Moon, the
 * outermost those from the Sun — so every spoke carries three signs.
 *
 * Two things this module is careful about, because practice often is not:
 *
 * 1. THE USE CONDITION (74.19–20). The chakra is read only when Lagna, Sun and
 *    Moon fall in three *separate* signs. If any two share a sign, the text
 *    directs the reader back to the ordinary rāśi chart. `applicable` reports
 *    this and the caller should honour it.
 *
 * 2. THE HOUSE SUBJECT DOES NOT CHANGE. The 10th from the Moon is still the
 *    10th house's subject, not "the emotional 10th". The familiar overlay of
 *    Lagna = body, Moon = mind, Sun = soul is later teaching, not this chapter.
 */
import type { JyotishaChart, PlanetId, RashiNumber } from './types';

/** The seven grahas plus the nodes, in the order the cakra lists them. */
const GRAHAS: PlanetId[] = [
  'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu',
];

export type SudarshanaReference = 'lagna' | 'moon' | 'sun';

export interface SudarshanaHouse {
  /** House number 1–12, counted from this ring's reference sign. */
  house: number;
  /** The rāśi that falls in this house, counted from the ring's reference. */
  rashi: RashiNumber;
  /** Planets occupying that rāśi. */
  planets: PlanetId[];
}

export interface SudarshanaRing {
  reference: SudarshanaReference;
  /** The sign the twelve houses are counted from. */
  referenceRashi: RashiNumber;
  referenceRashiName: string;
  houses: SudarshanaHouse[];
}

export interface SudarshanaChakra {
  rings: SudarshanaRing[];
  /**
   * BPHS 74.19–20: read from the cakra only when Lagna, Sun and Moon occupy
   * three distinct signs. When false, the rāśi chart alone is authoritative.
   */
  applicable: boolean;
  /** Plain-language reason when `applicable` is false. */
  inapplicableReason?: string;
  /** Each graha's house number under all three reckonings. */
  perGraha: Record<string, { fromLagna: number; fromMoon: number; fromSun: number }>;
  /** The Sudarśana daśā for a given completed year of life (BPHS 74.21–22). */
  dasha?: { yearOfLife: number; house: number; note: string };
}

const RASHI_NAMES = [
  'Meṣa', 'Vṛṣabha', 'Mithuna', 'Karka', 'Simha', 'Kanyā',
  'Tulā', 'Vṛścika', 'Dhanu', 'Makara', 'Kumbha', 'Mīna',
];

/** Inclusive house number of `target` counted from `reference`, both 1–12. */
function houseFrom(reference: number, target: number): number {
  return ((target - reference + 12) % 12) + 1;
}

function buildRing(
  reference: SudarshanaReference,
  referenceRashi: RashiNumber,
  planetsByRashi: Map<number, PlanetId[]>
): SudarshanaRing {
  const houses: SudarshanaHouse[] = [];
  for (let h = 1; h <= 12; h++) {
    const rashi = (((referenceRashi - 1 + (h - 1)) % 12) + 1) as RashiNumber;
    houses.push({
      house: h,
      rashi,
      planets: planetsByRashi.get(rashi) ?? [],
    });
  }
  return {
    reference,
    referenceRashi,
    referenceRashiName: RASHI_NAMES[referenceRashi - 1],
    houses,
  };
}

/**
 * The active house for a completed year of life. BPHS 74.22 allots one house
 * per year from the first, repeating on a twelve-year cycle:
 *   year 1 → 1st, year 12 → 12th, year 13 → 1st.
 */
export function sudarshanaHouseForYear(yearOfLife: number): number {
  const y = Math.max(1, Math.floor(yearOfLife));
  return ((y - 1) % 12) + 1;
}

export interface SudarshanaOptions {
  /** Completed years since birth, to attach the annual daśā. */
  yearOfLife?: number;
}

export function calculateSudarshanaChakra(
  chart: JyotishaChart,
  opts: SudarshanaOptions = {}
): SudarshanaChakra {
  const lagnaRashi = chart.lagna.rashiNumber;
  const moonRashi = (chart.planets as any).moon?.rashiNumber as RashiNumber;
  const sunRashi = (chart.planets as any).sun?.rashiNumber as RashiNumber;

  // planets grouped by the rāśi they occupy — the signs themselves never move,
  // only the house number changes with the reference (BPHS 74.6).
  const byRashi = new Map<number, PlanetId[]>();
  for (const g of GRAHAS) {
    const p: any = (chart.planets as any)[g];
    if (!p || typeof p.rashiNumber !== 'number') continue;
    const list = byRashi.get(p.rashiNumber) ?? [];
    list.push(g);
    byRashi.set(p.rashiNumber, list);
  }

  const rings: SudarshanaRing[] = [
    buildRing('lagna', lagnaRashi, byRashi),
    buildRing('moon', moonRashi, byRashi),
    buildRing('sun', sunRashi, byRashi),
  ];

  // --- use condition, BPHS 74.19–20 -------------------------------------
  const distinct = new Set<number>([lagnaRashi, moonRashi, sunRashi]).size;
  const applicable = distinct === 3;
  let inapplicableReason: string | undefined;
  if (!applicable) {
    const clash: string[] = [];
    if (lagnaRashi === moonRashi) clash.push('Lagna and the Moon share a sign');
    if (lagnaRashi === sunRashi) clash.push('Lagna and the Sun share a sign');
    if (moonRashi === sunRashi) clash.push('the Moon and the Sun share a sign');
    inapplicableReason =
      `${clash.join('; ')}. BPHS 74.19–20 directs the reader back to the ` +
      `ordinary rāśi chart in this case; the cakra is shown for completeness but ` +
      `its results should not be read as authoritative.`;
  }

  const perGraha: SudarshanaChakra['perGraha'] = {};
  for (const g of GRAHAS) {
    const p: any = (chart.planets as any)[g];
    if (!p || typeof p.rashiNumber !== 'number') continue;
    perGraha[g] = {
      fromLagna: houseFrom(lagnaRashi, p.rashiNumber),
      fromMoon: houseFrom(moonRashi, p.rashiNumber),
      fromSun: houseFrom(sunRashi, p.rashiNumber),
    };
  }

  const result: SudarshanaChakra = { rings, applicable, perGraha };
  if (inapplicableReason) result.inapplicableReason = inapplicableReason;

  if (typeof opts.yearOfLife === 'number') {
    const house = sudarshanaHouseForYear(opts.yearOfLife);
    result.dasha = {
      yearOfLife: opts.yearOfLife,
      house,
      note:
        `BPHS 74.21–22: one house per completed year from birth, repeating ` +
        `every twelve. Year ${opts.yearOfLife} activates the ${house} house in all ` +
        `three rings; the month and day sub-periods step through the same twelve.`,
    };
  }

  return result;
}

/**
 * Which planets influence a house, across all three rings — the raw material for
 * the judgement rules in 74.10–17 (occupants and aspects, benefics advancing a
 * house, malefics harming it, the lord when the house is empty).
 */
export function sudarshanaOccupants(
  chakra: SudarshanaChakra,
  house: number
): { ring: SudarshanaReference; rashi: RashiNumber; planets: PlanetId[] }[] {
  return chakra.rings.map((ring) => {
    const h = ring.houses[house - 1];
    return { ring: ring.reference, rashi: h.rashi, planets: h.planets };
  });
}

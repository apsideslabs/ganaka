/**
 * Gaṇaka — Maṇḍūka and Trikoṇa rāśi daśās (Jaimini / BPHS ch. 46).
 *
 * MAṆḌŪKA (BPHS 46.179–180) — the "frog" daśā.
 *
 *   The twelve signs divide into three trinal quartets, one per modality:
 *     movable  Aries, Cancer, Libra, Capricorn
 *     dual     Gemini, Virgo, Sagittarius, Pisces
 *     fixed    Taurus, Leo, Scorpio, Aquarius
 *   The seed's quartet is exhausted first, then the daśā leaps to the next.
 *   An even-numbered seed traverses each quartet in reverse.
 *
 *   Durations follow the K.N. Rao count-to-lord branch: 12 years when the lord
 *   sits in its own sign, 10 when it sits in the 7th from the sign, otherwise
 *   the count between the sign and its lord, inclusive. Sanjay Rath's branch
 *   gives flat 7/8/9 by modality instead; that variant is not implemented and
 *   the difference is material, not a rounding.
 *
 * TRIKOṆA (BPHS 46.183–184) — the trinal daśā.
 *
 *   The seed is the strongest of the lagna, the 5th and the 9th. Succession
 *   depends on the seed's modality: cardinal runs the signs directly (or in
 *   reverse for an even seed), fixed runs every sixth, dual runs the trines.
 *   Durations are counted from each sign to its lord, one year added if the
 *   lord is exalted and one removed if debilitated, twelve when the lord is in
 *   the sign itself.
 */
import type { JyotishaChart, RashiNumber } from '../jyotisha/types';
import { RASHIS, GRAHA_PROPERTIES } from '../jyotisha/constants';
import type { PlanetId } from '../jyotisha/types';
import {
  ExtendedDashaCalculationResult,
  ExtendedDashaPeriod,
  ExtendedDashaSystemDefinition,
  DashaEligibility,
} from './extended-types';

const MOVABLE: RashiNumber[] = [1, 4, 7, 10];
const FIXED: RashiNumber[] = [2, 5, 8, 11];
const DUAL: RashiNumber[] = [3, 6, 9, 12];

type Modality = 'movable' | 'fixed' | 'dual';

function modalityOf(r: RashiNumber): Modality {
  if (MOVABLE.includes(r)) return 'movable';
  if (FIXED.includes(r)) return 'fixed';
  return 'dual';
}

function addYears(d: Date, years: number): Date {
  return new Date(d.getTime() + years * 365.2425 * 864e5);
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** The sign holding the most planets among the candidates; ties go to the first. */
function strongestSign(chart: JyotishaChart, candidates: RashiNumber[]): RashiNumber {
  let best = candidates[0];
  let bestCount = -1;
  for (const c of candidates) {
    let n = 0;
    for (const p of Object.values(chart.planets)) {
      if (Math.floor(p.siderealLongitude / 30) + 1 === c) n++;
    }
    if (n > bestCount) { bestCount = n; best = c; }
  }
  return best;
}

/** Count from `from` to `to`, inclusive, direction set by `from`'s parity. */
function countInclusive(from: RashiNumber, to: RashiNumber): number {
  if (from === to) return 12;
  return from % 2 === 1
    ? ((to - from + 12) % 12) + 1
    : ((from - to + 12) % 12) + 1;
}

function lordOf(r: RashiNumber): PlanetId {
  return RASHIS[r]?.lord as PlanetId;
}

// ---------------------------------------------------------------------------
// MAṆḌŪKA
// ---------------------------------------------------------------------------

/** The twelve-sign leap order for a given seed. */
export function mandookaOrder(seed: RashiNumber): RashiNumber[] {
  const seedMod = modalityOf(seed);
  const quartets: Record<Modality, RashiNumber[]> = {
    movable: MOVABLE,
    fixed: FIXED,
    dual: DUAL,
  };
  // Seed's quartet first, then the other two with movable before dual. The
  // text gives the movable-seeded and dual-seeded orders; the fixed-seeded
  // order follows the same shape.
  const rest: Modality[] =
    seedMod === 'movable' ? ['dual', 'fixed']
    : seedMod === 'dual' ? ['movable', 'fixed']
    : ['movable', 'dual'];

  const reverse = seed % 2 === 0;
  const out: RashiNumber[] = [];
  for (const mod of [seedMod, ...rest]) {
    const q = quartets[mod];
    const startIdx = q.indexOf(seed);
    if (startIdx < 0) {
      out.push(...(reverse ? [...q].reverse() : q));
      continue;
    }
    // Rotate so the seed leads. An even seed then reverses only the tail —
    // the seed stays first, which is what the text's Cancer example shows
    // (Cancer, Aries, Capricorn, Libra).
    const rotated = [...q.slice(startIdx), ...q.slice(0, startIdx)];
    if (reverse) out.push(rotated[0], ...rotated.slice(1).reverse());
    else out.push(...rotated);
  }
  return out;
}

/** Maṇḍūka years for one sign: own sign 12, lord in the 7th 10, else the count. */
export function mandookaYears(sign: RashiNumber, lordRashi: RashiNumber): number {
  if (sign === lordRashi) return 12;
  const seventh = (((sign - 1 + 6) % 12) + 1) as RashiNumber;
  if (lordRashi === seventh) return 10;
  const c = countInclusive(sign, lordRashi);
  return c === 0 ? 12 : c;
}

export const MANDOOKA_SYSTEM_DEF: ExtendedDashaSystemDefinition = {
  id: 'mandooka' as any,
  name: 'Maṇḍūka Daśā',
  sanskritName: 'मण्डूक दशा',
  devanagari: 'मण्डूक दशा (भेक क्रम)',
  cycleYears: 0,
  classification: 'raasi_jaimini',
  traditionalBasis: 'Trinal-quartet leap daśā, durations counted to each sign lord',
  scripturalProvenance: 'BPHS ch. 46, vv. 179–180',
  description: 'The frog daśā: the seed’s trinal quartet is exhausted, then the daśā leaps to the next quartet.',
  chartRequirements: ['Stronger of lagna and 7th', 'Every sign lord’s position'],
};

export const TRIKONA_SYSTEM_DEF: ExtendedDashaSystemDefinition = {
  id: 'trikona' as any,
  name: 'Trikoṇa Daśā',
  sanskritName: 'त्रिकोण दशा',
  devanagari: 'त्रिकोण दशा',
  cycleYears: 0,
  classification: 'raasi_jaimini',
  traditionalBasis: 'Trinal rāśi daśā, seeded from the strongest trine',
  scripturalProvenance: 'BPHS ch. 46, vv. 183–184',
  description: 'Seeded from the strongest of the lagna, 5th and 9th; succession follows the seed’s modality.',
  chartRequirements: ['Strength of the lagna, 5th and 9th', 'Every sign lord’s position and dignity'],
};

export function calculateMandookaDasha(
  chart: JyotishaChart,
  birthDate: Date
): ExtendedDashaCalculationResult {
  const lagna = chart.lagna.rashiNumber;
  const seventh = (((lagna - 1 + 6) % 12) + 1) as RashiNumber;
  const seed = strongestSign(chart, [lagna, seventh]);
  const order = mandookaOrder(seed);

  const periods: ExtendedDashaPeriod[] = [];
  let cursor = new Date(birthDate.getTime());
  for (const sign of order) {
    const lord = lordOf(sign);
    const lordPos: any = (chart.planets as any)[lord];
    const lordRashi = (lordPos ? Math.floor(lordPos.siderealLongitude / 30) + 1 : sign) as RashiNumber;
    const years = mandookaYears(sign, lordRashi);
    const start = new Date(cursor.getTime());
    const end = addYears(start, years);
    periods.push({
      id: `mandooka-${sign}`,
      level: 1,
      lordKey: lord,
      name: `${RASHIS[sign].name} (${lord})`,
      sanskritName: RASHIS[sign].sanskritName,
      devanagari: RASHIS[sign].devanagari ?? RASHIS[sign].sanskritName,
      startDate: start,
      endDate: end,
      startDateStr: fmt(start),
      endDateStr: fmt(end),
      durationYears: years,
      durationDays: years * 365.2425,
      metadata: { rashiNumber: sign, planetId: lord, note: `lord in ${RASHIS[lordRashi].name}` },
    });
    cursor = end;
  }

  const total = periods.reduce((t, p) => t + p.durationYears, 0);
  const now = new Date();
  const current = periods.find((p) => p.startDate <= now && now <= p.endDate) ?? periods[periods.length - 1];
  const remainingYears = Math.max(0, (current.endDate.getTime() - now.getTime()) / (365.2425 * 864e5));

  const system: ExtendedDashaSystemDefinition = {
    id: 'mandooka' as any,
    name: 'Maṇḍūka Daśā',
    sanskritName: 'मण्डूक दशा',
    devanagari: 'मण्डूक दशा (भेक क्रम)',
    cycleYears: Math.round(total),
    classification: 'raasi_jaimini',
    traditionalBasis: 'Trinal-quartet leap daśā, durations counted to each sign lord',
    scripturalProvenance: 'BPHS ch. 46, vv. 179–180',
    description: 'The frog daśā: the seed’s trinal quartet is exhausted, then the daśā leaps to the next quartet. Durations are chart-specific.',
    chartRequirements: ['Stronger of lagna and 7th', 'Every sign lord’s position'],
  };

  return {
    system,
    eligibility: {
      status: 'universal',
      isSatisfied: true,
      conditionTitle: 'maṇḍūka',
      classicalRule: 'Seeded from the stronger of the lagna and the 7th.',
      chartEvaluation: `Seed ${RASHIS[seed].name} (${modalityOf(seed)}), order ${order.map((r) => RASHIS[r].name).join(' → ')}`,
      scripturalSource: 'BPHS ch. 46, vv. 179–180',
    },
    selectedVariant: 'kn_rao_count_to_lord',
    availableVariants: [
      { id: 'kn_rao_count_to_lord', name: 'K.N. Rao', description: 'Count to the sign lord; own sign 12, lord in 7th 10.' },
    ],
    currentPeriod: {
      majorPeriod: current,
      startDate: current.startDate,
      endDate: current.endDate,
      durationYears: current.durationYears,
      remainingYears,
      remainingMonths: (remainingYears % 1) * 12,
      remainingDays: Math.round(((remainingYears * 12) % 1) * 30.44),
      progressPercentage: Math.min(100, Math.max(0,
        ((now.getTime() - current.startDate.getTime()) /
          Math.max(1, current.endDate.getTime() - current.startDate.getTime())) * 100)),
    },
    periods,
    calculationDetails: {
      provenance: 'BPHS ch. 46, vv. 179–180',
      seedBasis: `Seed ${RASHIS[seed].name}; leap order ${order.map((r) => RASHIS[r].name).join(', ')}`,
      balanceFraction: 1,
      balanceYears: periods[0].durationYears,
      steps: [
        `Stronger of lagna (${RASHIS[lagna].name}) and 7th (${RASHIS[seventh].name}) → ${RASHIS[seed].name}`,
        `Quartet ${modalityOf(seed)} first`,
        seed % 2 === 0 ? 'Even seed → each quartet reversed' : 'Odd seed → each quartet direct',
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// TRIKOṆA
// ---------------------------------------------------------------------------

/** The succession of signs for Trikoṇa, given its seed. */
export function trikonaOrder(seed: RashiNumber): RashiNumber[] {
  const mod = modalityOf(seed);
  const odd = seed % 2 === 1;

  // Cardinal seeds run the zodiac directly (or in reverse for an even seed).
  if (mod === 'movable') {
    const seq = Array.from({ length: 12 }, (_, i) => (((seed - 1 + i) % 12) + 1) as RashiNumber);
    return odd ? seq : [...seq].reverse();
  }

  // Fixed and dual seeds run by trinal group — 1/5/9, 2/6/10, 3/7/11, 4/8/12 —
  // beginning with the group the seed belongs to. A plain arithmetic step
  // would revisit the same two or three signs and never cover the twelve.
  const groups: RashiNumber[][] = [[1, 5, 9], [2, 6, 10], [3, 7, 11], [4, 8, 12]];
  const seedGroup = groups.findIndex((g) => g.includes(seed));
  const ordered = [...groups.slice(seedGroup), ...groups.slice(0, seedGroup)];
  const seq: RashiNumber[] = [];
  for (const g of ordered) {
    const idx = g.indexOf(seed);
    const rotated = idx >= 0 ? [...g.slice(idx), ...g.slice(0, idx)] : g;
    seq.push(...rotated);
  }
  return odd ? seq : [...seq].reverse();
}

export function calculateTrikonaDasha(
  chart: JyotishaChart,
  birthDate: Date
): ExtendedDashaCalculationResult {
  const lagna = chart.lagna.rashiNumber;
  const fifth = (((lagna - 1 + 4) % 12) + 1) as RashiNumber;
  const ninth = (((lagna - 1 + 8) % 12) + 1) as RashiNumber;
  const seed = strongestSign(chart, [lagna, fifth, ninth]);
  const order = trikonaOrder(seed);

  const periods: ExtendedDashaPeriod[] = [];
  let cursor = new Date(birthDate.getTime());
  for (const sign of order) {
    const lord = lordOf(sign);
    const lordPos: any = (chart.planets as any)[lord];
    const lordRashi = (lordPos ? Math.floor(lordPos.siderealLongitude / 30) + 1 : sign) as RashiNumber;
    const prop = GRAHA_PROPERTIES[lord];

    let years = countInclusive(sign, lordRashi);
    if (lordRashi === prop?.exaltationSign) years += 1;
    if (lordRashi === prop?.debilitationSign) years -= 1;
    years = Math.max(1, Math.min(12, years));

    const start = new Date(cursor.getTime());
    const end = addYears(start, years);
    periods.push({
      id: `trikona-${sign}`,
      level: 1,
      lordKey: lord,
      name: `${RASHIS[sign].name} (${lord})`,
      sanskritName: RASHIS[sign].sanskritName,
      devanagari: RASHIS[sign].devanagari ?? RASHIS[sign].sanskritName,
      startDate: start,
      endDate: end,
      startDateStr: fmt(start),
      endDateStr: fmt(end),
      durationYears: years,
      durationDays: years * 365.2425,
      metadata: { rashiNumber: sign, planetId: lord, note: `lord in ${RASHIS[lordRashi].name}` },
    });
    cursor = end;
  }

  const total = periods.reduce((t, p) => t + p.durationYears, 0);
  const now = new Date();
  const current = periods.find((p) => p.startDate <= now && now <= p.endDate) ?? periods[periods.length - 1];
  const remainingYears = Math.max(0, (current.endDate.getTime() - now.getTime()) / (365.2425 * 864e5));

  const system: ExtendedDashaSystemDefinition = {
    id: 'trikona' as any,
    name: 'Trikoṇa Daśā',
    sanskritName: 'त्रिकोण दशा',
    devanagari: 'त्रिकोण दशा',
    cycleYears: Math.round(total),
    classification: 'raasi_jaimini',
    traditionalBasis: 'Trinal rāśi daśā, seeded from the strongest trine',
    scripturalProvenance: 'BPHS ch. 46, vv. 183–184',
    description: 'Seeded from the strongest of the lagna, 5th and 9th; succession follows the seed’s modality.',
    chartRequirements: ['Strength of the lagna, 5th and 9th', 'Every sign lord’s position and dignity'],
  };

  return {
    system,
    eligibility: {
      status: 'universal',
      isSatisfied: true,
      conditionTitle: 'trikona',
      classicalRule: 'Seeded from the strongest of the lagna, 5th and 9th.',
      chartEvaluation: `Seed ${RASHIS[seed].name} (${modalityOf(seed)}), order ${order.map((r) => RASHIS[r].name).join(' → ')}`,
      scripturalSource: 'BPHS ch. 46, vv. 183–184',
    },
    selectedVariant: 'classical',
    availableVariants: [{ id: 'classical', name: 'Classical', description: 'BPHS 46.183–184.' }],
    currentPeriod: {
      majorPeriod: current,
      startDate: current.startDate,
      endDate: current.endDate,
      durationYears: current.durationYears,
      remainingYears,
      remainingMonths: (remainingYears % 1) * 12,
      remainingDays: Math.round(((remainingYears * 12) % 1) * 30.44),
      progressPercentage: Math.min(100, Math.max(0,
        ((now.getTime() - current.startDate.getTime()) /
          Math.max(1, current.endDate.getTime() - current.startDate.getTime())) * 100)),
    },
    periods,
    calculationDetails: {
      provenance: 'BPHS ch. 46, vv. 183–184',
      seedBasis: `Seed ${RASHIS[seed].name}; order ${order.map((r) => RASHIS[r].name).join(', ')}`,
      balanceFraction: 1,
      balanceYears: periods[0].durationYears,
      steps: [
        `Strongest of lagna, 5th and 9th → ${RASHIS[seed].name}`,
        `Modality ${modalityOf(seed)} → step ${modalityOf(seed) === 'fixed' ? 6 : modalityOf(seed) === 'dual' ? 4 : 1}`,
        seed % 2 === 1 ? 'Odd seed → direct' : 'Even seed → reverse',
      ],
    },
  };
}

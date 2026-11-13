/**
 * Gaṇaka — Sthira Daśā and the Brahma graha (BPHS ch. 46, vv. 168–173).
 *
 * The years are fixed by sign class — v. 168: "7, 8 and 9 years are the dasha
 * spans of the Movable, Fixed and Dual rāśis" — which is why the system is
 * called sthira, fixed. v. 169 says it begins from the sign occupied by the
 * Brahma graha, and that the dashas run onwards from odd signs and in reverse
 * from even ones.
 *
 * The Brahma graha (vv. 170–173), as the translation gives it:
 *
 *   "From amongst the Lords of Ari [6th], Randhr [8th] and Vyaya [12th] the
 *   Graha who may possess the greatest strength and is placed in Lagna, or in
 *   Yuvati [7th] with strength, the one placed in an odd rāśi within sixth
 *   Bhava from the Bhava concerned, is called the Brahm Grah. The Lord of
 *   Randhr in Randhr is also accepted as Brahm Grah. If Śani, or Rāhu/Ketu
 *   obtain Brahmatva, they become Brahm Grah. If a number of Grahas obtain
 *   Brahmatva, the one with the largest number of degrees would become Brahm
 *   Grah. If there is parity in the degrees of such Grahas, the most powerful
 *   amongst them would become Brahm Grah."
 *
 * The selection below follows that order: the three house-lords are the
 * candidates; a candidate sitting in the lagna or the 7th wins; failing that
 * the 8th lord in the 8th; ties break on the greater degree within the sign,
 * then on the stronger planet.
 */
import type { JyotishaChart, PlanetId, RashiNumber } from '../jyotisha/types';
import { RASHIS, GRAHA_PROPERTIES } from '../jyotisha/constants';
import {
  ExtendedDashaCalculationResult,
  ExtendedDashaPeriod,
  ExtendedDashaSystemDefinition,
} from './extended-types';

const MOVABLE: RashiNumber[] = [1, 4, 7, 10];
const FIXED: RashiNumber[] = [2, 5, 8, 11];

function yearsFor(rashi: RashiNumber): number {
  if (MOVABLE.includes(rashi)) return 7;
  if (FIXED.includes(rashi)) return 8;
  return 9;
}

function addYears(d: Date, years: number): Date {
  return new Date(d.getTime() + years * 365.2425 * 864e5);
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export interface BrahmaGrahaResult {
  planet: PlanetId;
  name: string;
  rashiNumber: RashiNumber;
  rashiName: string;
  reason: string;
  candidates: Array<{ planet: PlanetId; house: number; rashi: RashiNumber; reason: string }>;
}

/**
 * Elect the Brahma graha per BPHS 46.170–173.
 */
export function findBrahmaGraha(chart: JyotishaChart): BrahmaGrahaResult {
  const bhavas: any[] = (chart.bhavas as any[]) ?? [];
  const lordOfHouse = (h: number): PlanetId => {
    const rashi = (bhavas[h - 1]?.rashiNumber ?? 1) as RashiNumber;
    return RASHIS[rashi]?.lord as PlanetId;
  };

  const candidateHouses = [6, 8, 12];
  const candidates = candidateHouses.map((h) => {
    const planet = lordOfHouse(h);
    const pos: any = (chart.planets as any)[planet];
    return {
      planet,
      house: pos?.house ?? 0,
      rashi: (pos?.rashiNumber ?? 1) as RashiNumber,
      degree: pos?.longitudeInRashi ?? 0,
      speed: Math.abs(pos?.speed ?? 0),
      sourceHouse: h,
      reason: `lord of the ${h}th`,
    };
  });

  // 1. A candidate placed in the lagna or the 7th.
  let pool = candidates.filter((c) => c.house === 1 || c.house === 7);
  let reason = 'lord of the 6th, 8th or 12th placed in the lagna or the 7th';

  // 2. Failing that, the 8th lord placed in the 8th.
  if (pool.length === 0) {
    pool = candidates.filter((c) => c.sourceHouse === 8 && c.house === 8);
    reason = 'lord of the 8th placed in the 8th';
  }

  // 3. Failing that, take all three candidates.
  if (pool.length === 0) {
    pool = candidates;
    reason = 'strongest of the 6th, 8th and 12th lords';
  }

  // Ties break on the greater degree within the sign, then on the faster planet.
  pool.sort((a, b) => (b.degree - a.degree) || (b.speed - a.speed));
  const winner = pool[0];

  return {
    planet: winner.planet,
    name: GRAHA_PROPERTIES[winner.planet]?.name ?? winner.planet,
    rashiNumber: winner.rashi,
    rashiName: RASHIS[winner.rashi]?.name ?? '',
    reason: `${reason}; ${winner.planet} at ${winner.degree.toFixed(2)}°`,
    candidates: candidates.map((c) => ({
      planet: c.planet,
      house: c.house,
      rashi: c.rashi,
      reason: c.reason,
    })),
  };
}

export const STHIRA_SYSTEM_DEF: ExtendedDashaSystemDefinition = {
  id: 'sthira' as any,
  name: 'Sthira Daśā',
  sanskritName: 'स्थिर दशा',
  devanagari: 'स्थिर दशा (७/८/९ वर्षाणि)',
  cycleYears: 96, // 4 × 7 + 4 × 8 + 4 × 9
  classification: 'raasi_jaimini',
  traditionalBasis: 'Fixed-year rāśi daśā: movable 7, fixed 8, dual 9',
  scripturalProvenance: 'BPHS ch. 46, vv. 168–173',
  description:
    'Twelve rāśi periods of 7, 8 or 9 years by sign class, beginning from the sign of the Brahma graha.',
  chartRequirements: ['The Brahma graha', 'Each sign’s modality'],
};

/**
 * Build the Sthira daśā, seeded from the Brahma graha's sign.
 */
export function calculateSthiraDasha(
  chart: JyotishaChart,
  birthDate: Date
): ExtendedDashaCalculationResult {
  const brahma = findBrahmaGraha(chart);
  const seed = brahma.rashiNumber;
  const odd = seed % 2 === 1;

  const order: RashiNumber[] = [];
  for (let i = 0; i < 12; i++) {
    order.push((((seed - 1 + (odd ? i : -i)) % 12 + 12) % 12 + 1) as RashiNumber);
  }

  const periods: ExtendedDashaPeriod[] = [];
  let cursor = new Date(birthDate.getTime());
  for (const rashi of order) {
    const years = yearsFor(rashi);
    const start = new Date(cursor.getTime());
    const end = addYears(start, years);
    const lord = RASHIS[rashi].lord as PlanetId;
    periods.push({
      id: `sthira-${rashi}`,
      level: 1,
      lordKey: lord,
      name: `${RASHIS[rashi].name} (${lord})`,
      sanskritName: RASHIS[rashi].sanskritName,
      devanagari: RASHIS[rashi].devanagari ?? RASHIS[rashi].sanskritName,
      startDate: start,
      endDate: end,
      startDateStr: fmt(start),
      endDateStr: fmt(end),
      durationYears: years,
      durationDays: years * 365.2425,
      metadata: { rashiNumber: rashi, planetId: lord },
    });
    cursor = end;
  }

  const total = periods.reduce((t, p) => t + p.durationYears, 0);
  const now = new Date();
  const current = periods.find((p) => p.startDate <= now && now <= p.endDate) ?? periods[periods.length - 1];
  const remainingYears = Math.max(0, (current.endDate.getTime() - now.getTime()) / (365.2425 * 864e5));

  return {
    system: STHIRA_SYSTEM_DEF,
    eligibility: {
      status: 'universal',
      isSatisfied: true,
      conditionTitle: 'sthira',
      classicalRule: 'Begins from the sign occupied by the Brahma graha.',
      chartEvaluation: `Brahma ${brahma.name} in ${brahma.rashiName} — ${brahma.reason}`,
      scripturalSource: 'BPHS ch. 46, vv. 168–173',
    },
    selectedVariant: 'classical',
    availableVariants: [{ id: 'classical', name: 'Classical', description: 'BPHS 46.168–173.' }],
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
      provenance: 'BPHS ch. 46, vv. 168–173',
      seedBasis: `Brahma ${brahma.name} in ${brahma.rashiName}; ${odd ? 'odd' : 'even'} seed → ${odd ? 'direct' : 'reverse'}`,
      balanceFraction: 1,
      balanceYears: periods[0].durationYears,
      steps: [
        `Brahma graha: ${brahma.name} (${brahma.reason})`,
        `Seed sign ${RASHIS[seed].name}, ${odd ? 'odd → count onwards' : 'even → count in reverse'}`,
        `Years by class: movable 7, fixed 8, dual 9`,
      ],
    },
  };
}

/**
 * Gaṇaka — The six conditional nakṣatra daśās of BPHS ch. 46.
 *
 *   Shodashottari  116 yr  vv. 24–26
 *   Dwadashottari  112 yr  vv. 27–28
 *   Panchottari    105 yr  vv. 29–30
 *   Shatabdika     100 yr  vv. 32–34
 *   Chaturashiti    84 yr  vv. 35–36
 *   Dwisaptati      72 yr  vv. 37–39
 *
 * The counting rule is the same for all six. Count from the named star to the
 * janma nakṣatra, both ends included, and divide by the number of lords; the
 * remainder names the lord running at birth, and a count that divides exactly
 * falls to the last lord. Abhijit is not counted, so the count runs over the
 * 27.
 *
 * The rule is checked against the two worked examples the chapter itself
 * gives, and both are exercised in the test suite:
 *
 *   Shatabdika, Mrigashira — Revati, Ashwini, Bharani, Krittika, Rohini,
 *   Mrigashira = 6. 6 mod 7 = 6 → the 6th lord, Mars, 20 years.
 *   Panchottari, Mrigashira — 16 from Anuradha. 16 mod 7 = 2 → the 2nd lord,
 *   Mercury, 13 years.
 */
import type { JyotishaChart, PlanetId } from '../jyotisha/types';
import { calculateVargaRashi } from '../vargas/varga-engine';
import { RASHIS } from '../jyotisha/constants';
import {
  ExtendedDashaCalculationResult,
  ExtendedDashaPeriod,
  ExtendedDashaSystemDefinition,
  DashaEligibility,
} from './extended-types';

const NAK_SPAN = 360 / 27;

interface LordSpec {
  key: string;
  name: string;
  sanskritName: string;
  devanagari: string;
  years: number;
}

export interface ConditionalDashaSpec {
  id: 'shodashottari' | 'dwadashottari' | 'panchottari' | 'shatabdika' | 'chaturashiti' | 'dwisaptati';
  name: string;
  sanskritName: string;
  devanagari: string;
  cycleYears: number;
  /** 1–27, the star the count starts from. */
  startNakshatra: number;
  /** 'forward' counts start → janma; 'backward' counts janma → Revati. */
  direction: 'forward' | 'backward';
  lords: LordSpec[];
  provenance: string;
  description: string;
  condition: string;
}

const L = (key: string, name: string, sk: string, dv: string, years: number): LordSpec =>
  ({ key, name, sanskritName: sk, devanagari: dv, years });

const SUN = (y: number) => L('sun', 'Sun (Sūrya)', 'Sūrya', 'सूर्य', y);
const MOON = (y: number) => L('moon', 'Moon (Candra)', 'Candra', 'चन्द्र', y);
const MARS = (y: number) => L('mars', 'Mars (Maṅgala)', 'Maṅgala', 'मङ्गल', y);
const MERCURY = (y: number) => L('mercury', 'Mercury (Budha)', 'Budha', 'बुध', y);
const JUPITER = (y: number) => L('jupiter', 'Jupiter (Guru)', 'Guru', 'गुरु', y);
const VENUS = (y: number) => L('venus', 'Venus (Śukra)', 'Śukra', 'शुक्र', y);
const SATURN = (y: number) => L('saturn', 'Saturn (Śani)', 'Śani', 'शनि', y);
const RAHU = (y: number) => L('rahu', 'Rāhu', 'Rāhu', 'राहु', y);
const KETU = (y: number) => L('ketu', 'Ketu', 'Ketu', 'केतु', y);

export const CONDITIONAL_DASHA_SPECS: ConditionalDashaSpec[] = [
  {
    id: 'shodashottari',
    name: 'Ṣoḍaśottarī Daśā',
    sanskritName: 'षोडशोत्तरी दशा',
    devanagari: 'षोडशोत्तरी (११६ वर्षाणि)',
    cycleYears: 116,
    startNakshatra: 8, // Puṣya
    direction: 'forward',
    lords: [SUN(11), MARS(12), JUPITER(13), SATURN(14), KETU(15), MOON(16), MERCURY(17), VENUS(18)],
    provenance: 'BPHS ch. 46, vv. 24–26',
    description: '116 years over eight lords, Ketu included and Rāhu left out.',
    condition: 'Lagna in the Moon’s horā with a Kṛṣṇa-pakṣa birth, or in the Sun’s horā with a Śukla-pakṣa birth.',
  },
  {
    id: 'dwadashottari',
    name: 'Dvādaśottarī Daśā',
    sanskritName: 'द्वादशोत्तरी दशा',
    devanagari: 'द्वादशोत्तरी (११२ वर्षाणि)',
    cycleYears: 112,
    startNakshatra: 27, // Revatī
    direction: 'backward',
    lords: [SUN(7), JUPITER(9), KETU(11), MERCURY(13), RAHU(15), MARS(17), SATURN(19), MOON(21)],
    provenance: 'BPHS ch. 46, vv. 27–28',
    description: '112 years over eight lords; the count runs from the janma nakṣatra forward to Revatī.',
    condition: 'Lagna in a navāṃśa of Venus — Taurus or Libra.',
  },
  {
    id: 'panchottari',
    name: 'Pañcottarī Daśā',
    sanskritName: 'पञ्चोत्तरी दशा',
    devanagari: 'पञ्चोत्तरी (१०५ वर्षाणि)',
    cycleYears: 105,
    startNakshatra: 17, // Anurādhā
    direction: 'forward',
    lords: [SUN(12), MERCURY(13), SATURN(14), MARS(15), VENUS(16), MOON(17), JUPITER(18)],
    provenance: 'BPHS ch. 46, vv. 29–30',
    description: '105 years over seven lords, Rāhu and Ketu both left out.',
    condition: 'Cancer lagna in both the rāśi and the dvādaśāṃśa.',
  },
  {
    id: 'shatabdika',
    name: 'Śatābdika Daśā',
    sanskritName: 'शताब्दिका दशा',
    devanagari: 'शताब्दिका (१०० वर्षाणि)',
    cycleYears: 100,
    startNakshatra: 27, // Revatī
    direction: 'forward',
    lords: [SUN(5), MOON(5), VENUS(10), MERCURY(10), JUPITER(20), MARS(20), SATURN(30)],
    provenance: 'BPHS ch. 46, vv. 32–34',
    description: '100 years over seven lords, weighted heavily to Jupiter, Mars and Saturn.',
    condition: 'A vargottama lagna — the same sign in the rāśi chart and the navāṃśa.',
  },
  {
    id: 'chaturashiti',
    name: 'Caturāśīti-sama Daśā',
    sanskritName: 'चतुराशीति-सम दशा',
    devanagari: 'चतुराशीति-सम (८४ वर्षाणि)',
    cycleYears: 84,
    startNakshatra: 15, // Svātī
    direction: 'forward',
    lords: [SUN(12), MOON(12), MARS(12), MERCURY(12), JUPITER(12), VENUS(12), SATURN(12)],
    provenance: 'BPHS ch. 46, vv. 35–36',
    description: '84 years, every lord holding exactly twelve.',
    condition: 'The 10th lord placed in the 10th house.',
  },
  {
    id: 'dwisaptati',
    name: 'Dvisaptati-sama Daśā',
    sanskritName: 'द्विसप्तति-सम दशा',
    devanagari: 'द्विसप्तति-सम (७२ वर्षाणि)',
    cycleYears: 72,
    startNakshatra: 19, // Mūla
    direction: 'forward',
    lords: [SUN(9), MOON(9), MARS(9), MERCURY(9), JUPITER(9), VENUS(9), SATURN(9), RAHU(9)],
    provenance: 'BPHS ch. 46, vv. 37–39',
    description: '72 years, every lord holding exactly nine.',
    condition: 'The lagna lord placed in the lagna or the 7th.',
  },
];

function addYears(d: Date, years: number): Date {
  const ms = years * 365.2425 * 24 * 60 * 60 * 1000;
  return new Date(d.getTime() + ms);
}

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * The lord index running at birth.
 *
 * Count from the start star to the janma star with both ends included — or the
 * other way round for Dwādaśottarī, whose count runs from the janma star to
 * Revatī. Divide by the number of lords; a remainder of zero falls to the last.
 */
export function lordIndexAtBirth(
  janmaNakshatra: number,
  startNakshatra: number,
  lordCount: number,
  direction: 'forward' | 'backward'
): { count: number; index: number } {
  const count =
    direction === 'forward'
      ? ((janmaNakshatra - startNakshatra + 27) % 27) + 1
      : ((startNakshatra - janmaNakshatra + 27) % 27) + 1;
  const remainder = count % lordCount;
  return { count, index: remainder === 0 ? lordCount - 1 : remainder - 1 };
}

/** Eligibility, evaluated from the chart where the condition is computable. */
function evaluateEligibility(spec: ConditionalDashaSpec, chart: JyotishaChart): DashaEligibility {
  const lagnaRashi = chart.lagna.rashiNumber;
  const d9Lagna = calculateVargaRashi(chart.lagna.siderealLongitude, 'D9').rashiNumber;
  const d12Lagna = calculateVargaRashi(chart.lagna.siderealLongitude, 'D12').rashiNumber;
  const d2Lagna = calculateVargaRashi(chart.lagna.siderealLongitude, 'D2').rashiNumber;
  const paksha: any = (chart.panchanga as any)?.paksha;
  const isKrishna = typeof paksha === 'string' ? paksha.toLowerCase().includes('kṛṣṇa') || paksha.toLowerCase().includes('krishna') : undefined;

  const lagnaLord = RASHIS[lagnaRashi]?.lord as PlanetId;
  const lagna = chart.planets?.[lagnaLord] as any;
  const tenthRashi = ((chart.bhavas as any)?.[9]?.rashiNumber ?? 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  const tenthLord = RASHIS[tenthRashi]?.lord as PlanetId;
  const tenth = chart.planets?.[tenthLord] as any;

  let satisfied = false;
  let detail = '';
  switch (spec.id) {
    case 'shodashottari': {
      // Sun's horā is Leo (5), the Moon's is Cancer (4).
      const sunHora = d2Lagna === 5;
      const moonHora = d2Lagna === 4;
      satisfied = (moonHora && isKrishna === true) || (sunHora && isKrishna === false);
      detail = `lagna horā ${RASHIS[d2Lagna]?.name ?? d2Lagna}, pakṣa ${paksha ?? 'unknown'}`;
      break;
    }
    case 'dwadashottari':
      satisfied = d9Lagna === 2 || d9Lagna === 7;
      detail = `navāṃśa lagna ${RASHIS[d9Lagna]?.name ?? d9Lagna}`;
      break;
    case 'panchottari':
      satisfied = lagnaRashi === 4 && d12Lagna === 4;
      detail = `rāśi lagna ${RASHIS[lagnaRashi]?.name}, dvādaśāṃśa ${RASHIS[d12Lagna]?.name}`;
      break;
    case 'shatabdika':
      satisfied = lagnaRashi === d9Lagna;
      detail = `rāśi lagna ${RASHIS[lagnaRashi]?.name}, navāṃśa ${RASHIS[d9Lagna]?.name}`;
      break;
    case 'chaturashiti':
      satisfied = !!tenth && tenth.house === 10;
      detail = `10th lord ${lagnaLord} in house ${tenth?.house ?? '?'}`;
      break;
    case 'dwisaptati':
      satisfied = !!lagna && (lagna.house === 1 || lagna.house === 7);
      detail = `lagna lord ${lagnaLord} in house ${lagna?.house ?? '?'}`;
      break;
  }

  return {
    status: satisfied ? 'satisfied' : 'not_satisfied',
    isSatisfied: satisfied,
    conditionTitle: spec.id,
    classicalRule: spec.condition,
    chartEvaluation: detail,
    scripturalSource: spec.provenance,
  };
}

/**
 * Build the full cycle for one of the six systems.
 */
export function calculateConditionalDasha(
  spec: ConditionalDashaSpec,
  chart: JyotishaChart,
  birthDate: Date
): ExtendedDashaCalculationResult {
  const moonLon = chart.planets.moon.siderealLongitude;
  const janma = Math.floor(moonLon / NAK_SPAN) + 1; // 1–27

  // How far the Moon has travelled through its nakṣatra — the balance left.
  const fractionElapsed = (moonLon % NAK_SPAN) / NAK_SPAN;
  const balanceFraction = 1 - fractionElapsed;

  const { count, index } = lordIndexAtBirth(
    janma, spec.startNakshatra, spec.lords.length, spec.direction
  );

  const system: ExtendedDashaSystemDefinition = {
    id: spec.id as any,
    name: spec.name,
    sanskritName: spec.sanskritName,
    devanagari: spec.devanagari,
    cycleYears: spec.cycleYears,
    classification: 'nakshatra_planetary',
    traditionalBasis: `${spec.cycleYears}-year conditional nakṣatra cycle`,
    scripturalProvenance: spec.provenance,
    description: spec.description,
    chartRequirements: ['Moon sidereal longitude (janma nakṣatra)', spec.condition],
  };

  const periods: ExtendedDashaPeriod[] = [];
  let cursor = new Date(birthDate.getTime());
  let accumulated = 0;
  let idx = index;
  let first = true;

  while (accumulated < spec.cycleYears - 1e-6) {
    const lord = spec.lords[idx];
    const years = first
      ? lord.years * balanceFraction
      : Math.min(lord.years, spec.cycleYears - accumulated);

    const start = new Date(cursor.getTime());
    const end = addYears(start, years);

    periods.push({
      id: `${spec.id}-maha-${periods.length + 1}`,
      level: 1,
      lordKey: lord.key,
      name: lord.name,
      sanskritName: lord.sanskritName,
      devanagari: lord.devanagari,
      startDate: start,
      endDate: end,
      startDateStr: fmt(start),
      endDateStr: fmt(end),
      durationYears: years,
      durationDays: years * 365.2425,
      isBirthBalance: first,
      metadata: { planetId: lord.key },
    });

    accumulated += years;
    cursor = end;
    first = false;
    idx = (idx + 1) % spec.lords.length;
  }

  const now = new Date();
  const current =
    periods.find((p) => p.startDate <= now && now <= p.endDate) ??
    periods[periods.length - 1];

  const remainingYears = Math.max(0, (current.endDate.getTime() - now.getTime()) / (365.2425 * 864e5));

  return {
    system,
    eligibility: evaluateEligibility(spec, chart),
    selectedVariant: 'classical',
    availableVariants: [{ id: 'classical', name: 'Classical', description: 'BPHS ch. 46 as given.' }],
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
      provenance: spec.provenance,
      seedBasis: `Janma nakṣatra ${janma}; counted ${count} from ${spec.startNakshatra}; remainder → ${spec.lords[index].name}`,
      balanceFraction,
      balanceYears: spec.lords[index].years * balanceFraction,
      steps: [
        `Janma nakṣatra index ${janma}`,
        `Count ${count} from star ${spec.startNakshatra} (${spec.direction})`,
        `Remainder over ${spec.lords.length} lords → ${spec.lords[index].name}`,
        `Balance at birth ${(balanceFraction * 100).toFixed(2)}% of ${spec.lords[index].years} years`,
      ],
    },
  };
}

/** System definitions, for registration in the extended-dasha registry. */
export const CONDITIONAL_SYSTEM_DEFS: ExtendedDashaSystemDefinition[] =
  CONDITIONAL_DASHA_SPECS.map((spec) => ({
    id: spec.id as any,
    name: spec.name,
    sanskritName: spec.sanskritName,
    devanagari: spec.devanagari,
    cycleYears: spec.cycleYears,
    classification: 'nakshatra_planetary' as const,
    traditionalBasis: `${spec.cycleYears}-year conditional nakṣatra cycle`,
    scripturalProvenance: spec.provenance,
    description: spec.description,
    chartRequirements: ['Moon sidereal longitude (janma nakṣatra)', spec.condition],
  }));

export function calculateShodashottari(chart: JyotishaChart, d: Date) {
  return calculateConditionalDasha(CONDITIONAL_DASHA_SPECS[0], chart, d);
}
export function calculateDwadashottari(chart: JyotishaChart, d: Date) {
  return calculateConditionalDasha(CONDITIONAL_DASHA_SPECS[1], chart, d);
}
export function calculatePanchottari(chart: JyotishaChart, d: Date) {
  return calculateConditionalDasha(CONDITIONAL_DASHA_SPECS[2], chart, d);
}
export function calculateShatabdika(chart: JyotishaChart, d: Date) {
  return calculateConditionalDasha(CONDITIONAL_DASHA_SPECS[3], chart, d);
}
export function calculateChaturashiti(chart: JyotishaChart, d: Date) {
  return calculateConditionalDasha(CONDITIONAL_DASHA_SPECS[4], chart, d);
}
export function calculateDwisaptati(chart: JyotishaChart, d: Date) {
  return calculateConditionalDasha(CONDITIONAL_DASHA_SPECS[5], chart, d);
}

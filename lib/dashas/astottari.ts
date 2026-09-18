/**
 * Gaṇaka — Authentic Classical Aṣṭottarī Daśā Engine (108-Year Cycle)
 * 
 * Sources:
 * - Bṛhat Parāśara Horā Śāstra (BPHS Ch. 46, Verses 37–45)
 * - Jātaka Pārijāta (Ch. 18)
 * - Phaladīpikā
 */

import { JyotishaChart } from '../jyotisha/types';
import { RASHIS } from '../jyotisha/constants';
import { PlanetId } from '../astronomy/ephemeris';
import {
  ExtendedDashaCalculationResult,
  ExtendedDashaPeriod,
  ExtendedDashaSystemDefinition,
  DashaEligibility,
  CurrentPeriodSummary,
} from './extended-types';

export const ASTOTTARI_SYSTEM_DEF: ExtendedDashaSystemDefinition = {
  id: 'astottari',
  name: 'Aṣṭottarī Daśā',
  sanskritName: 'अष्टोत्तरी दशा',
  devanagari: 'अष्टोत्तरी दशा (१०८ वर्षाणि)',
  cycleYears: 108,
  classification: 'nakshatra_planetary',
  traditionalBasis: '108-year Nakṣatra-based planetary cycle based on the 108 zodiacal padas',
  scripturalProvenance: 'Bṛhat Parāśara Horā Śāstra, Ch. 46, Ślokas 37–45',
  description:
    'Aṣṭottarī spans exactly 108 solar years divided among 8 grahas (Ketu is excluded). Parāśara dictates it as the primary alternative to Viṃśottarī for nativities conforming to specific Pakṣa and Rāhu alignment conditions.',
  chartRequirements: [
    'Moon sidereal longitude (Janma Nakṣatra)',
    'Pakṣa (Śukla vs Kṛṣṇa) and Birth Kāla (Day vs Night)',
    'Lagna Lord and Rāhu house placements',
  ],
};

interface AstottariPlanetDef {
  key: string;
  name: string;
  sanskritName: string;
  devanagari: string;
  years: number;
  nakshatras28: number[]; // 1-indexed numbers (1..27, 28 for Abhijit)
  nakshatras27: number[];
}

const ASTOTTARI_LORDS: AstottariPlanetDef[] = [
  {
    key: 'sun',
    name: 'Sun (Sūrya)',
    sanskritName: 'Sūrya',
    devanagari: 'सूर्य',
    years: 6,
    nakshatras28: [6, 7, 8, 9], // Ārdrā, Punarvasu, Puṣya, Āśleṣā
    nakshatras27: [6, 7, 8, 9],
  },
  {
    key: 'moon',
    name: 'Moon (Candra)',
    sanskritName: 'Candra',
    devanagari: 'चन्द्र',
    years: 15,
    nakshatras28: [10, 11, 12], // Maghā, P.Phalgunī, U.Phalgunī
    nakshatras27: [10, 11, 12],
  },
  {
    key: 'mars',
    name: 'Mars (Maṅgala)',
    sanskritName: 'Maṅgala',
    devanagari: 'मङ्गल',
    years: 8,
    nakshatras28: [13, 14, 15, 16], // Hasta, Citrā, Svātī, Viśākhā
    nakshatras27: [13, 14, 15, 16],
  },
  {
    key: 'mercury',
    name: 'Mercury (Budha)',
    sanskritName: 'Budha',
    devanagari: 'बुध',
    years: 17,
    nakshatras28: [17, 18, 19], // Anurādhā, Jyeṣṭhā, Mūla
    nakshatras27: [17, 18, 19],
  },
  {
    key: 'saturn',
    name: 'Saturn (Śani)',
    sanskritName: 'Śani',
    devanagari: 'शनि',
    years: 10,
    nakshatras28: [20, 21, 28, 22], // P.Āṣāḍhā, U.Āṣāḍhā, Abhijit (28), Śravaṇa (22)
    nakshatras27: [20, 21, 22],
  },
  {
    key: 'jupiter',
    name: 'Jupiter (Guru)',
    sanskritName: 'Guru',
    devanagari: 'गुरु',
    years: 19,
    nakshatras28: [23, 24, 25], // Dhaniṣṭhā, Śatabhiṣā, P.Bhādrapadā
    nakshatras27: [23, 24, 25],
  },
  {
    key: 'rahu',
    name: 'Rāhu (Rāhu)',
    sanskritName: 'Rāhu',
    devanagari: 'राहु',
    years: 12,
    nakshatras28: [26, 27, 1, 2], // U.Bhādrapadā, Revatī, Aśvinī, Bharaṇī
    nakshatras27: [26, 27, 1, 2],
  },
  {
    key: 'venus',
    name: 'Venus (Śukra)',
    sanskritName: 'Śukra',
    devanagari: 'शुक्र',
    years: 21,
    nakshatras28: [3, 4, 5], // Kṛttikā, Rohiṇī, Mṛgaśīrṣā
    nakshatras27: [3, 4, 5],
  },
];

function formatDateISO(d: Date): string {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${day}`;
}

/**
 * Check classical Parāśara eligibility for Aṣṭottarī Daśā:
 * BPHS 46.37:
 * "Kṛṣṇapakṣe divā janma śuklapakṣe tathā niśi |
 *  Aṣṭottarī daśā jñeyā..."
 * 
 * Condition A: Day birth in Kṛṣṇa Pakṣa (waning), OR Night birth in Śukla Pakṣa (waxing).
 * Condition B: Rāhu is situated in a Kendra (1, 4, 7, 10) or Trikona (5, 9) from Lagna lord, and not in Lagna itself.
 */
export function evaluateAstottariEligibility(chart: JyotishaChart): DashaEligibility {
  const sunLong = chart.planets.sun.siderealLongitude;
  const moonLong = chart.planets.moon.siderealLongitude;
  const lagnaLong = chart.lagna.siderealLongitude;

  // Elongation: Moon - Sun
  let diff = moonLong - sunLong;
  if (diff < 0) diff += 360;
  const isShukla = diff >= 0 && diff < 180;
  const isKrishna = !isShukla;

  // Day vs Night birth from Sun & Lagna relative position (Sun above horizon = houses 7..12)
  let sunFromLagna = sunLong - lagnaLong;
  if (sunFromLagna < 0) sunFromLagna += 360;
  const isDayBirth = sunFromLagna >= 180 && sunFromLagna < 360; // 7th to 12th houses relative to Lagna
  const isNightBirth = !isDayBirth;

  // Check Condition A
  const pakshaKalaMatch = (isKrishna && isDayBirth) || (isShukla && isNightBirth);

  // Check Condition B: Rāhu placement relative to Lagna Lord
  const lagnaRashi = chart.lagna.rashiNumber;
  const lagnaLord = (RASHIS[lagnaRashi]?.lord || 'mars') as PlanetId;
  const lagnaLordPlanet = chart.planets[lagnaLord];
  const lagnaLordRashi = lagnaLordPlanet ? Math.floor(lagnaLordPlanet.siderealLongitude / 30) + 1 : lagnaRashi;
  const rahuRashi = Math.floor(chart.planets.rahu.siderealLongitude / 30) + 1;

  let rahuFromLagnaLord = rahuRashi - lagnaLordRashi;
  if (rahuFromLagnaLord < 0) rahuFromLagnaLord += 12;
  const rahuHouseFromLord = rahuFromLagnaLord + 1; // 1 to 12

  const rahuInLagna = rahuRashi === lagnaRashi;
  const isKendraOrTrikona = [1, 4, 5, 7, 9, 10].includes(rahuHouseFromLord);
  const rahuConditionMatch = isKendraOrTrikona && !rahuInLagna;

  const isSatisfied = pakshaKalaMatch && rahuConditionMatch;
  const status = isSatisfied
    ? 'satisfied'
    : pakshaKalaMatch || rahuConditionMatch
    ? 'conditional'
    : 'not_satisfied';

  const evaluationNotes = [
    `Pakṣa: ${isShukla ? 'Śukla (Waxing)' : 'Kṛṣṇa (Waning)'}`,
    `Birth Kāla: ${isDayBirth ? 'Divā (Day)' : 'Niśi (Night)'} — ${pakshaKalaMatch ? 'Conforms to BPHS rule' : 'Does not conform to BPHS rule'}`,
    `Rāhu in ${rahuHouseFromLord}th house from Lagna lord (${lagnaLordPlanet?.name || 'Lord'}) — ${rahuConditionMatch ? 'Kendra/Trikoṇa satisfied (not in Lagna)' : 'Rāhu condition unsatisfied'}`,
  ].join(' | ');

  return {
    status,
    isSatisfied,
    conditionTitle: 'Parāśara Pakṣa-Kāla & Rāhu Alignment',
    classicalRule:
      'Day birth in Kṛṣṇa Pakṣa or Night birth in Śukla Pakṣa; Rāhu situated in a Kendra or Trikona from Lagna Lord and not in Lagna.',
    chartEvaluation: evaluationNotes,
    sanskritVerse:
      'कृष्णपक्षे दिवा जन्म शुक्लपक्षे तथा निशि। अष्टोत्तरी दशा ज्ञेया यदि लग्ने न तिष्ठति॥ लग्नाधीशत्रिकोणे वा केन्द्रे वा यदि संस्थितः। राहुस्तदा प्रयोक्तव्या ह्यष्टोत्तरी दशा बुधैः॥',
    scripturalSource: 'BPHS Ch. 46, Ślokas 37–38',
  };
}

export function calculateAstottariDasha(
  chart: JyotishaChart,
  birthDate: Date,
  variant: 'ardradi_28' | 'ardradi_27' = 'ardradi_28'
): ExtendedDashaCalculationResult {
  const eligibility = evaluateAstottariEligibility(chart);
  const moonLong = chart.planets.moon.siderealLongitude;

  // Determine Nakshatra and exact arc
  const nakshatraSpan = 360 / 27; // 13°20'
  const nakshatraIndex = Math.floor(moonLong / nakshatraSpan); // 0..26
  const nakshatraNum = nakshatraIndex + 1; // 1..27
  const arcInNakshatra = moonLong - nakshatraIndex * nakshatraSpan;
  const fractionElapsed = arcInNakshatra / nakshatraSpan;
  const fractionRemaining = 1 - fractionElapsed;

  // In 28-nakshatra scheme, check if Moon falls in Abhijit area (276°40' to 280°53'20")
  let effectiveStar = nakshatraNum;
  if (variant === 'ardradi_28' && moonLong >= 276.666667 && moonLong <= 280.888889) {
    effectiveStar = 28; // Abhijit
  }

  // Find starting lord in Astottari sequence
  const use28 = variant === 'ardradi_28';
  let startLordIdx = ASTOTTARI_LORDS.findIndex((l) =>
    use28 ? l.nakshatras28.includes(effectiveStar) : l.nakshatras27.includes(effectiveStar)
  );
  if (startLordIdx === -1) startLordIdx = 0;

  const startLord = ASTOTTARI_LORDS[startLordIdx];
  const balanceYears = startLord.years * fractionRemaining;
  const daysInYear = 365.2425;

  // Build full 108-year sequence of Mahadashas
  const periods: ExtendedDashaPeriod[] = [];
  let currentStart = new Date(birthDate.getTime());

  for (let i = 0; i < ASTOTTARI_LORDS.length; i++) {
    const idx = (startLordIdx + i) % ASTOTTARI_LORDS.length;
    const lord = ASTOTTARI_LORDS[idx];
    const isFirst = i === 0;
    const durationYears = isFirst ? balanceYears : lord.years;
    const durationDays = durationYears * daysInYear;
    const currentEnd = new Date(currentStart.getTime() + durationDays * 86400000);

    // Compute sub-periods (Antardashas)
    const subPeriods: ExtendedDashaPeriod[] = [];
    let subStart = new Date(currentStart.getTime());

    for (let j = 0; j < ASTOTTARI_LORDS.length; j++) {
      const subIdx = (idx + j) % ASTOTTARI_LORDS.length;
      const subLord = ASTOTTARI_LORDS[subIdx];
      // Classical formula: (MD_years * AD_years) / 108
      const fullSubYears = (lord.years * subLord.years) / 108;
      const subDurationYears = isFirst ? fullSubYears * fractionRemaining : fullSubYears;
      const subDurationDays = subDurationYears * daysInYear;
      const subEnd = new Date(subStart.getTime() + subDurationDays * 86400000);

      subPeriods.push({
        id: `ast-${lord.key}-${subLord.key}-${i}-${j}`,
        level: 2,
        lordKey: subLord.key,
        name: `${lord.sanskritName} / ${subLord.sanskritName}`,
        sanskritName: `${lord.sanskritName}-${subLord.sanskritName}`,
        devanagari: `${lord.devanagari}-${subLord.devanagari}`,
        startDate: new Date(subStart),
        endDate: new Date(subEnd),
        startDateStr: formatDateISO(subStart),
        endDateStr: formatDateISO(subEnd),
        durationYears: subDurationYears,
        durationDays: subDurationDays,
        metadata: { planetId: subLord.key },
      });

      subStart = subEnd;
    }

    periods.push({
      id: `ast-${lord.key}-${i}`,
      level: 1,
      lordKey: lord.key,
      name: lord.name,
      sanskritName: lord.sanskritName,
      devanagari: lord.devanagari,
      startDate: new Date(currentStart),
      endDate: new Date(currentEnd),
      startDateStr: formatDateISO(currentStart),
      endDateStr: formatDateISO(currentEnd),
      durationYears,
      durationDays,
      isBirthBalance: isFirst,
      subPeriods,
      metadata: { planetId: lord.key },
    });

    currentStart = currentEnd;
  }

  // Determine current active period for today's date
  const now = new Date();
  let currentMD = periods[0];
  let currentAD = periods[0].subPeriods?.[0];

  for (const p of periods) {
    if (now >= p.startDate && now < p.endDate) {
      currentMD = p;
      if (p.subPeriods) {
        for (const sp of p.subPeriods) {
          if (now >= sp.startDate && now < sp.endDate) {
            currentAD = sp;
            break;
          }
        }
      }
      break;
    }
  }

  const activeEnd = currentMD.endDate;
  const totalDays = currentMD.durationDays;
  const elapsedDays = Math.max(0, (now.getTime() - currentMD.startDate.getTime()) / 86400000);
  const remainingDays = Math.max(0, (activeEnd.getTime() - now.getTime()) / 86400000);
  const remainingYears = remainingDays / daysInYear;
  const remY = Math.floor(remainingYears);
  const remM = Math.floor((remainingYears - remY) * 12);
  const remD = Math.floor(remainingDays % 30.4375);
  const progressPercentage = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

  const currentPeriod: CurrentPeriodSummary = {
    majorPeriod: currentMD,
    subPeriod: currentAD,
    startDate: currentMD.startDate,
    endDate: currentMD.endDate,
    durationYears: currentMD.durationYears,
    remainingYears: remY,
    remainingMonths: remM,
    remainingDays: remD,
    progressPercentage: Math.round(progressPercentage * 10) / 10,
  };

  return {
    system: ASTOTTARI_SYSTEM_DEF,
    eligibility,
    selectedVariant: variant,
    availableVariants: [
      {
        id: 'ardradi_28',
        name: 'Ārdrādi Variant (28 Asterisms with Abhijit)',
        description: 'Classical Parāśara formulation utilizing 28 asterisms (4-3-4-3-4-3-4-3 distribution).',
      },
      {
        id: 'ardradi_27',
        name: 'Ārdrādi Variant (27 Asterisms)',
        description: 'Standard 27 nakshatras without Abhijit intercalation.',
      },
    ],
    currentPeriod,
    periods,
    calculationDetails: {
      provenance: 'BPHS Ch. 46, Verses 37–45',
      seedBasis: `Moon in Nakṣatra ${chart.planets.moon.nakshatraName} (${chart.planets.moon.nakshatraLord.toUpperCase()}) at ${moonLong.toFixed(2)}°`,
      balanceFraction: fractionRemaining,
      balanceYears,
      steps: [
        `Identified Moon at ${moonLong.toFixed(4)}° in Nakṣatra #${nakshatraNum}`,
        `Elapsed fraction of Nakṣatra arc: ${(fractionElapsed * 100).toFixed(2)}%`,
        `Unexpired birth balance fraction: ${(fractionRemaining * 100).toFixed(2)}%`,
        `Starting Lord: ${startLord.name} (${startLord.years} full years → ${balanceYears.toFixed(2)}y balance at birth)`,
        `Evaluated BPHS eligibility: Pakṣa Kāla condition & Rāhu Kendra/Trikoṇa placement`,
      ],
    },
  };
}

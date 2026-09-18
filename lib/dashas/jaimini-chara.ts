/**
 * Gaṇaka — Authentic Jaiminī Cara Daśā Engine (Rāśi Daśā)
 * 
 * Sources:
 * - Maharṣi Jaimini Upadeśa Sūtras (Ch. 2, Pāda 4)
 * - Bṛhat Parāśara Horā Śāstra (Ch. 47)
 * - K.N. Rao: "Predicting through Jaimini's Chara Dasha"
 */

import { JyotishaChart, RashiNumber } from '../jyotisha/types';
import { RASHIS } from '../jyotisha/constants';
import {
  ExtendedDashaCalculationResult,
  ExtendedDashaPeriod,
  ExtendedDashaSystemDefinition,
  DashaEligibility,
  CurrentPeriodSummary,
} from './extended-types';

export const JAIMINI_CHARA_SYSTEM_DEF: ExtendedDashaSystemDefinition = {
  id: 'chara',
  name: 'Cara Daśā (Chara)',
  sanskritName: 'चर दशा',
  devanagari: 'जैमिनी चर दशा (राशि दशा)',
  cycleYears: 144, // 12 signs * up to 12 years (typically ~90-110 years)
  classification: 'raasi_jaimini',
  traditionalBasis: 'Zodiacal sign (Rāśi) based progression initiating from the Janma Lagna',
  scripturalProvenance: 'Jaimini Upadeśa Sūtras 2.4 & BPHS Ch. 47',
  description:
    'The foundational sign-based (Rāśi) daśā of Maharṣi Jaimini. Progression is direct or indirect based on the Lagna/9th house orientation, with each sign period spanning 1 to 12 years evaluated from the sign to its ruling graha.',
  chartRequirements: [
    'Janma Lagna sign and degree',
    'Sign placements of all 7 classical grahas + Rāhu & Ketu',
    'Evaluation of dual lordship for Vṛścika (Mars/Ketu) and Kumbha (Saturn/Rāhu)',
  ],
};

// Direct signs (Savya): 1, 2, 3, 7, 8, 9 (Aries, Taurus, Gemini, Libra, Scorpio, Sagittarius)
const DIRECT_RASHIS = new Set<RashiNumber>([1, 2, 3, 7, 8, 9]);

function formatDateISO(d: Date): string {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${day}`;
}

/**
 * Determine stronger co-lord for Scorpio (Mars vs Ketu) and Aquarius (Saturn vs Rahu)
 */
function getStrongerCoLord(
  chart: JyotishaChart,
  rashi: 8 | 11
): { lordPlanet: 'mars' | 'ketu' | 'saturn' | 'rahu'; rashiNum: RashiNumber } {
  const p1Key = rashi === 8 ? 'mars' : 'saturn';
  const p2Key = rashi === 8 ? 'ketu' : 'rahu';

  const p1 = chart.planets[p1Key];
  const p2 = chart.planets[p2Key];

  const p1Rashi = (Math.floor(p1.siderealLongitude / 30) + 1) as RashiNumber;
  const p2Rashi = (Math.floor(p2.siderealLongitude / 30) + 1) as RashiNumber;

  // Jaimini Rule 1: Planet with more planets in the same sign is stronger
  let p1Conjuncts = 0;
  let p2Conjuncts = 0;
  Object.values(chart.planets).forEach((pl) => {
    const plRashi = Math.floor(pl.siderealLongitude / 30) + 1;
    if (plRashi === p1Rashi && pl.id !== p1Key) p1Conjuncts++;
    if (plRashi === p2Rashi && pl.id !== p2Key) p2Conjuncts++;
  });

  if (p1Conjuncts > p2Conjuncts) return { lordPlanet: p1Key, rashiNum: p1Rashi };
  if (p2Conjuncts > p1Conjuncts) return { lordPlanet: p2Key, rashiNum: p2Rashi };

  // Rule 2: Exalted planet is stronger
  if (p1.dignity.startsWith('Exalted')) return { lordPlanet: p1Key, rashiNum: p1Rashi };
  if (p2.dignity.startsWith('Exalted')) return { lordPlanet: p2Key, rashiNum: p2Rashi };

  // Rule 3: Moolatrikona / Own sign
  if (p1.dignity.startsWith('Own Sign') || p1.dignity === 'Moolatrikona') return { lordPlanet: p1Key, rashiNum: p1Rashi };
  if (p2.dignity.startsWith('Own Sign') || p2.dignity === 'Moolatrikona') return { lordPlanet: p2Key, rashiNum: p2Rashi };

  // Default to primary classical lord (Mars / Saturn)
  return { lordPlanet: p1Key, rashiNum: p1Rashi };
}

/**
 * Calculate Jaimini Chara Dasha sign duration (1 to 12 years)
 */
export function calculateCharaSignYears(
  chart: JyotishaChart,
  rashi: RashiNumber
): { years: number; lordUsed: string } {
  let lordRashi: RashiNumber;
  let lordName: string;

  if (rashi === 8) {
    const res = getStrongerCoLord(chart, 8);
    lordRashi = res.rashiNum;
    lordName = res.lordPlanet === 'mars' ? 'Mars (Maṅgala)' : 'Ketu (Ketu)';
  } else if (rashi === 11) {
    const res = getStrongerCoLord(chart, 11);
    lordRashi = res.rashiNum;
    lordName = res.lordPlanet === 'saturn' ? 'Saturn (Śani)' : 'Rāhu (Rāhu)';
  } else {
    const lord = RASHIS[rashi].lord;
    const lordPlanet = chart.planets[lord];
    lordRashi = (Math.floor(lordPlanet.siderealLongitude / 30) + 1) as RashiNumber;
    lordName = RASHIS[rashi].lord.toUpperCase();
  }

  // Same sign rule = 12 years
  if (lordRashi === rashi) {
    return { years: 12, lordUsed: lordName };
  }

  const isDirect = DIRECT_RASHIS.has(rashi);
  let dist: number;

  if (isDirect) {
    // Direct sign: count forward from sign to its lord
    dist = lordRashi - rashi;
    if (dist < 0) dist += 12;
  } else {
    // Indirect sign: count backward from sign to its lord
    dist = rashi - lordRashi;
    if (dist < 0) dist += 12;
  }

  let years = dist;
  if (years === 0) years = 12;

  return { years, lordUsed: lordName };
}

export function evaluateCharaEligibility(): DashaEligibility {
  return {
    status: 'universal',
    isSatisfied: true,
    conditionTitle: 'Universal Jaiminī Application',
    classicalRule:
      'Cara Daśā is universally applicable to all nativities for deciphering events from Jaiminī Kārakas, Arūḍhas, and Rāśi Dṛṣṭi.',
    chartEvaluation: 'Universal sign-based daśā. No exclusionary natal conditions.',
    sanskritVerse:
      'अथ चरदशा वक्ष्ये जैमिन्युक्ता महर्षिणा। राशिनां बलभेदेन फलं ज्ञेयं शुभाशुभम्॥',
    scripturalSource: 'Jaimini Upadeśa Sūtras 2.4 & BPHS Ch. 47',
  };
}

export function calculateCharaDasha(
  chart: JyotishaChart,
  birthDate: Date,
  variant: 'classical_lagna' | 'kn_rao_9th' = 'classical_lagna'
): ExtendedDashaCalculationResult {
  const eligibility = evaluateCharaEligibility();
  const lagnaRashi = chart.lagna.rashiNumber;

  // Determine progression direction
  // In classical_lagna: direct if Lagna is odd/savya, reverse if even/apasavya
  // In kn_rao_9th: direct if 9th house sign is direct, reverse if indirect
  let isDirectProgression: boolean;
  if (variant === 'kn_rao_9th') {
    const ninthRashi = (((lagnaRashi - 1 + 8) % 12) + 1) as RashiNumber;
    isDirectProgression = DIRECT_RASHIS.has(ninthRashi);
  } else {
    isDirectProgression = DIRECT_RASHIS.has(lagnaRashi);
  }

  // Generate 12 sign Mahadasha sequence starting from Lagna
  const rashiSequence: RashiNumber[] = [];
  for (let i = 0; i < 12; i++) {
    let r: number;
    if (isDirectProgression) {
      r = ((lagnaRashi - 1 + i) % 12) + 1;
    } else {
      r = ((lagnaRashi - 1 - i + 24) % 12) + 1;
    }
    rashiSequence.push(r as RashiNumber);
  }

  const daysInYear = 365.2425;
  const periods: ExtendedDashaPeriod[] = [];
  let currentStart = new Date(birthDate.getTime());

  for (let i = 0; i < rashiSequence.length; i++) {
    const rashiNum = rashiSequence[i];
    const rashiInfo = RASHIS[rashiNum];
    const { years, lordUsed } = calculateCharaSignYears(chart, rashiNum);

    const durationDays = years * daysInYear;
    const currentEnd = new Date(currentStart.getTime() + durationDays * 86400000);

    // Sub-periods (12 equal Antardaśās of durationYears / 12 years each)
    const subDurationYears = years / 12;
    const subDurationDays = subDurationYears * daysInYear;
    const subPeriods: ExtendedDashaPeriod[] = [];
    let subStart = new Date(currentStart.getTime());

    // Sub-periods cycle through the 12 signs
    for (let j = 0; j < 12; j++) {
      let subRashiNum: RashiNumber;
      if (isDirectProgression) {
        subRashiNum = (((rashiNum - 1 + j) % 12) + 1) as RashiNumber;
      } else {
        subRashiNum = (((rashiNum - 1 - j + 24) % 12) + 1) as RashiNumber;
      }
      const subRashiInfo = RASHIS[subRashiNum];
      const subEnd = new Date(subStart.getTime() + subDurationDays * 86400000);

      subPeriods.push({
        id: `chara-${i}-${j}-${rashiNum}-${subRashiNum}`,
        level: 2,
        lordKey: `rashi_${subRashiNum}`,
        name: `${rashiInfo.sanskritName} / ${subRashiInfo.sanskritName}`,
        sanskritName: `${rashiInfo.sanskritName}-${subRashiInfo.sanskritName}`,
        devanagari: `${rashiInfo.devanagari}-${subRashiInfo.devanagari}`,
        startDate: new Date(subStart),
        endDate: new Date(subEnd),
        startDateStr: formatDateISO(subStart),
        endDateStr: formatDateISO(subEnd),
        durationYears: subDurationYears,
        durationDays: subDurationDays,
        metadata: {
          rashiNumber: subRashiNum,
        },
      });

      subStart = subEnd;
    }

    periods.push({
      id: `chara-maha-${i}-${rashiNum}`,
      level: 1,
      lordKey: `rashi_${rashiNum}`,
      name: `${rashiInfo.sanskritName} (${rashiInfo.name})`,
      sanskritName: rashiInfo.sanskritName,
      devanagari: rashiInfo.devanagari,
      startDate: new Date(currentStart),
      endDate: new Date(currentEnd),
      startDateStr: formatDateISO(currentStart),
      endDateStr: formatDateISO(currentEnd),
      durationYears: years,
      durationDays,
      subPeriods,
      metadata: {
        rashiNumber: rashiNum,
        coLordUsed: lordUsed,
        note: `Duration: ${years} years derived from distance to lord ${lordUsed}`,
      },
    });

    currentStart = currentEnd;
  }

  // Determine current active period
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

  const totalCycleYears = periods.reduce((sum, p) => sum + p.durationYears, 0);

  return {
    system: JAIMINI_CHARA_SYSTEM_DEF,
    eligibility,
    selectedVariant: variant,
    availableVariants: [
      {
        id: 'classical_lagna',
        name: 'Classical Parāśara / Jaimini (Lagna-Oriented)',
        description:
          'Progression direction evaluated directly from the Janma Lagna sign nature (Direct for Savya, Indirect for Apasavya).',
      },
      {
        id: 'kn_rao_9th',
        name: 'K.N. Rao Method (9th House Progression Orientation)',
        description:
          'Progression direction determined by the 9th house sign from Lagna per K.N. Rao research school.',
      },
    ],
    currentPeriod,
    periods,
    calculationDetails: {
      provenance: 'Jaimini Upadeśa Sūtras 2.4 & BPHS Ch. 47',
      seedBasis: `Lagna in ${RASHIS[lagnaRashi].sanskritName} (#${lagnaRashi}) | Progression: ${isDirectProgression ? 'Zodiacal (Direct)' : 'Reverse (Indirect)'}`,
      balanceFraction: 1,
      balanceYears: periods[0].durationYears,
      steps: [
        `Identified Lagna sign: ${RASHIS[lagnaRashi].sanskritName} (${RASHIS[lagnaRashi].mobility})`,
        `Direction: ${isDirectProgression ? 'Direct / Clockwise (Savya)' : 'Reverse / Anti-clockwise (Apasavya)'}`,
        `Calculated years for 12 signs based on sign-to-lord distance with dual-lordship resolution for Scorpio/Aquarius`,
        `Total Jaiminī Cara Daśā cycle: ${totalCycleYears} years`,
        `Constructed 12 equal sub-periods (Antardaśās) for each sign`,
      ],
    },
  };
}

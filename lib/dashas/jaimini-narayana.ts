/**
 * Gaṇaka — Authentic Jaiminī Nārāyaṇa Daśā Engine
 * 
 * Sources:
 * - Maharṣi Jaimini Upadeśa Sūtras (Ch. 2)
 * - Bṛhat Parāśara Horā Śāstra (Ch. 47)
 * - Sanjay Rath: "Narayana Dasha"
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

export const JAIMINI_NARAYANA_SYSTEM_DEF: ExtendedDashaSystemDefinition = {
  id: 'narayana',
  name: 'Nārāyaṇa Daśā',
  sanskritName: 'नारायण दशा',
  devanagari: 'जैमिनी नारायण दशा (पद्क्रम दशा)',
  cycleYears: 144,
  classification: 'raasi_jaimini',
  traditionalBasis: 'Progressive Padakrama sign daśā initiating from the stronger of the 1st or 7th house',
  scripturalProvenance: 'Jaimini Upadeśa Sūtras 2.1 & BPHS Ch. 47',
  description:
    'Nārāyaṇa Daśā is revered as the sovereign sign-based system for deciphering career, worldly achievements, and sustained prosperity (Viṣṇu tattva). Commences from the stronger of Lagna (1st) or 7th house and moves through the zodiac in regulated Padakrama cycles.',
  chartRequirements: [
    'Comparative planetary potency evaluation of 1st vs 7th house (Arambha Rāśi)',
    'Dual-lordship evaluations for Scorpio and Aquarius',
    'Exaltation/Debilitation modifications to sign durations',
  ],
};

function formatDateISO(d: Date): string {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${day}`;
}

/**
 * Determine stronger between 1st (Lagna) and 7th house to establish the Arambha (starting) sign
 */
export function determineNarayanaArambhaSign(
  chart: JyotishaChart
): { arambhaRashi: RashiNumber; reason: string } {
  const lagnaRashi = chart.lagna.rashiNumber;
  const seventhRashi = (((lagnaRashi - 1 + 6) % 12) + 1) as RashiNumber;

  // Count planets in 1st vs 7th
  let count1 = 0;
  let count7 = 0;
  let exalted1 = false;
  let exalted7 = false;

  Object.values(chart.planets).forEach((p) => {
    const r = Math.floor(p.siderealLongitude / 30) + 1;
    if (r === lagnaRashi) {
      count1++;
      if (p.dignity.startsWith('Exalted')) exalted1 = true;
    }
    if (r === seventhRashi) {
      count7++;
      if (p.dignity.startsWith('Exalted')) exalted7 = true;
    }
  });

  if (count1 > count7) {
    return { arambhaRashi: lagnaRashi, reason: `1st house (${RASHIS[lagnaRashi].sanskritName}) contains more planets (${count1} vs ${count7})` };
  }
  if (count7 > count1) {
    return { arambhaRashi: seventhRashi, reason: `7th house (${RASHIS[seventhRashi].sanskritName}) contains more planets (${count7} vs ${count1})` };
  }

  // Check exalted planet
  if (exalted1 && !exalted7) {
    return { arambhaRashi: lagnaRashi, reason: `1st house contains an exalted planet` };
  }
  if (exalted7 && !exalted1) {
    return { arambhaRashi: seventhRashi, reason: `7th house contains an exalted planet` };
  }

  // Check odd vs even sign (odd signs are generally stronger for starting initiation)
  const isLagnaOdd = lagnaRashi % 2 !== 0;
  if (isLagnaOdd) {
    return { arambhaRashi: lagnaRashi, reason: `1st house (${RASHIS[lagnaRashi].sanskritName}) is an Odd (Viṣama) sign` };
  } else {
    return { arambhaRashi: seventhRashi, reason: `7th house (${RASHIS[seventhRashi].sanskritName}) is an Odd (Viṣama) sign` };
  }
}

export function evaluateNarayanaEligibility(): DashaEligibility {
  return {
    status: 'universal',
    isSatisfied: true,
    conditionTitle: 'Universal Jaiminī Viṣṇu-Tattva System',
    classicalRule:
      'Nārāyaṇa Daśā is universally applicable to all nativities for timing professional status, financial flow, and worldly fruition.',
    chartEvaluation: 'Universal sign-based daśā. 1st vs 7th house potency evaluated successfully.',
    sanskritVerse:
      'लग्नाद् वा सप्तमाद् वापि यद् बलीयः प्रजायते। तस्माद् दशा विधातव्या नारायणाभिधा बुधैः॥',
    scripturalSource: 'Jaimini Upadeśa Sūtras 2.1 & BPHS Ch. 47',
  };
}

export function calculateNarayanaDasha(
  chart: JyotishaChart,
  birthDate: Date
): ExtendedDashaCalculationResult {
  const eligibility = evaluateNarayanaEligibility();
  const { arambhaRashi, reason } = determineNarayanaArambhaSign(chart);

  // Progression is direct if Arambha sign is odd, indirect if even
  const isDirect = arambhaRashi % 2 !== 0;

  // Build 12-sign sequence
  const rashiSequence: RashiNumber[] = [];
  for (let i = 0; i < 12; i++) {
    let r: number;
    if (isDirect) {
      r = ((arambhaRashi - 1 + i) % 12) + 1;
    } else {
      r = ((arambhaRashi - 1 - i + 24) % 12) + 1;
    }
    rashiSequence.push(r as RashiNumber);
  }

  const daysInYear = 365.2425;
  const periods: ExtendedDashaPeriod[] = [];
  let currentStart = new Date(birthDate.getTime());

  for (let i = 0; i < rashiSequence.length; i++) {
    const rashiNum = rashiSequence[i];
    const rashiInfo = RASHIS[rashiNum];

    // Lord calculation
    const lord = rashiInfo.lord;
    const lordPlanet = chart.planets[lord];
    const lordRashi = (Math.floor(lordPlanet.siderealLongitude / 30) + 1) as RashiNumber;

    let years = 0;
    if (lordRashi === rashiNum) {
      years = 12;
    } else {
      const isSignOdd = rashiNum % 2 !== 0;
      let dist = 0;
      if (isSignOdd) {
        dist = lordRashi - rashiNum;
        if (dist < 0) dist += 12;
      } else {
        dist = rashiNum - lordRashi;
        if (dist < 0) dist += 12;
      }
      years = dist;
      if (years === 0) years = 12;
    }

    // Exaltation / Debilitation adjustment (+1 year for exalted, -1 for debilitated, bounded 1..12)
    if (lordPlanet.dignity.startsWith('Exalted')) years = Math.min(12, years + 1);
    if (lordPlanet.dignity.startsWith('Debilitated')) years = Math.max(1, years - 1);

    const durationDays = years * daysInYear;
    const currentEnd = new Date(currentStart.getTime() + durationDays * 86400000);

    // Sub-periods: 12 equal sub-divisions
    const subDurationYears = years / 12;
    const subDurationDays = subDurationYears * daysInYear;
    const subPeriods: ExtendedDashaPeriod[] = [];
    let subStart = new Date(currentStart.getTime());

    for (let j = 0; j < 12; j++) {
      const subRashiNum = (((rashiNum - 1 + j) % 12) + 1) as RashiNumber;
      const subRashiInfo = RASHIS[subRashiNum];
      const subEnd = new Date(subStart.getTime() + subDurationDays * 86400000);

      subPeriods.push({
        id: `nar-${i}-${j}-${rashiNum}-${subRashiNum}`,
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
      id: `nar-maha-${i}-${rashiNum}`,
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
        note: `Duration: ${years}y (Lord ${lord.toUpperCase()} in ${RASHIS[lordRashi].sanskritName})`,
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
    system: JAIMINI_NARAYANA_SYSTEM_DEF,
    eligibility,
    selectedVariant: 'classical_narayana',
    availableVariants: [
      {
        id: 'classical_narayana',
        name: 'Classical Padakrama (1st/7th Arambha)',
        description: 'Initiation determined by comparing planetary potencies of 1st vs 7th house.',
      },
    ],
    currentPeriod,
    periods,
    calculationDetails: {
      provenance: 'Jaimini Upadeśa Sūtras 2.1 & BPHS Ch. 47',
      seedBasis: `Arambha Sign: ${RASHIS[arambhaRashi].sanskritName} (#${arambhaRashi}) — Reason: ${reason}`,
      balanceFraction: 1,
      balanceYears: periods[0].durationYears,
      steps: [
        `Evaluated potencies of Lagna (#${chart.lagna.rashiNumber}) and 7th House (#${(((chart.lagna.rashiNumber - 1 + 6) % 12) + 1)})`,
        `Selected Arambha (Starting) sign: ${RASHIS[arambhaRashi].sanskritName} (${reason})`,
        `Direction: ${isDirect ? 'Direct / Clockwise' : 'Reverse / Anti-clockwise'}`,
        `Total Nārāyaṇa Daśā cycle: ${totalCycleYears} years`,
        `Divided each sign into 12 proportionate Antardaśā sub-periods`,
      ],
    },
  };
}

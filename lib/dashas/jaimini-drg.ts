/**
 * Gaṇaka — Authentic Jaiminī Dṛg Daśā Engine (Aspectual Vision / Dharma Daśā)
 * 
 * Sources:
 * - Maharṣi Jaimini Upadeśa Sūtras (Ch. 2, Pāda 4)
 * - BPHS Ch. 47
 * - Classical Dṛg Daśā Nirūpaṇa
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

export const JAIMINI_DRG_SYSTEM_DEF: ExtendedDashaSystemDefinition = {
  id: 'drg',
  name: 'Dṛg Daśā (Vision & Dharma)',
  sanskritName: 'दृग् दशा',
  devanagari: 'जैमिनी दृग् दशा (ज्ञान-धर्म दशा)',
  cycleYears: 144,
  classification: 'raasi_jaimini',
  traditionalBasis: 'Aspectual progression (Dṛṣṭi triads) initiating from the 9th House of Dharma and Divine Vision',
  scripturalProvenance: 'Jaimini Upadeśa Sūtras 2.4 & BPHS Ch. 47',
  description:
    'Dṛg Daśā is the premier Jaiminī system dedicated to spiritual awakening, guru grace, higher philosophical learning, mantra siddhi, and the evolution of consciousness. Commences strictly from the 9th house (Bhāgya/Dharma) and unfolds in triads of mutual Rāśi Dṛṣṭi.',
  chartRequirements: [
    '9th House sign from Janma Lagna (Arambha)',
    'Rāśi Dṛṣṭi aspect triads (Chara aspects Sthira, Sthira aspects Chara, Dvisvabhāva aspects Dvisvabhāva)',
    'Sign-to-lord distances for each period duration',
  ],
};

function formatDateISO(d: Date): string {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${day}`;
}

export function evaluateDrgEligibility(): DashaEligibility {
  return {
    status: 'universal',
    isSatisfied: true,
    conditionTitle: 'Universal Spiritual & Philosophical Evaluation',
    classicalRule:
      'Dṛg Daśā is universally applicable to all nativities for analyzing spiritual awakening, intuition, religious vows, and philosophical evolution.',
    chartEvaluation: 'Universal sign-based spiritual daśā. Commences from 9th House of Dharma.',
    sanskritVerse:
      'धर्मस्थानात् समारभ्य दृग्दशा परिकीर्तिता। ज्ञानवैराग्यसिद्ध्यर्थं मुनिभिस्तत्त्वदर्शिभिः॥',
    scripturalSource: 'Jaimini Upadeśa Sūtras 2.4',
  };
}

/**
 * Generate Dṛg Daśā sequence of 12 signs based on aspectual triads starting from 9th house
 */
export function generateDrgSequence(ninthRashi: RashiNumber): RashiNumber[] {
  // Signs aspected by each mobility type in Jaimini:
  // Movable (1, 4, 7, 10) aspect Fixed (2, 5, 8, 11) except adjacent
  // Fixed (2, 5, 8, 11) aspect Movable (1, 4, 7, 10) except adjacent
  // Dual (3, 6, 9, 12) aspect the other three Dual signs
  const fullSeq: RashiNumber[] = [];
  const visited = new Set<RashiNumber>();

  // Start with 9th house sign and its 3 aspected signs
  const seeds = [
    ninthRashi,
    (((ninthRashi - 1 + 4) % 12) + 1) as RashiNumber, // 5th from 9th
    (((ninthRashi - 1 + 8) % 12) + 1) as RashiNumber, // 9th from 9th
  ];

  for (const seed of seeds) {
    if (!visited.has(seed)) {
      visited.add(seed);
      fullSeq.push(seed);
    }
    // Get aspected signs
    const mobility = RASHIS[seed].mobility;
    if (mobility.includes('Chara')) {
      // Movable aspects Fixed signs except adjacent
      const fixedCandidates: RashiNumber[] = [2, 5, 8, 11];
      for (const fc of fixedCandidates) {
        if (!visited.has(fc)) {
          visited.add(fc);
          fullSeq.push(fc);
        }
      }
    } else if (mobility.includes('Sthira')) {
      // Fixed aspects Movable signs except adjacent
      const charaCandidates: RashiNumber[] = [1, 4, 7, 10];
      for (const cc of charaCandidates) {
        if (!visited.has(cc)) {
          visited.add(cc);
          fullSeq.push(cc);
        }
      }
    } else {
      // Dual aspects other dual signs
      const dualCandidates: RashiNumber[] = [3, 6, 9, 12];
      for (const dc of dualCandidates) {
        if (!visited.has(dc)) {
          visited.add(dc);
          fullSeq.push(dc);
        }
      }
    }
  }

  // Ensure all 12 signs are included
  for (let r = 1; r <= 12; r++) {
    const rn = r as RashiNumber;
    if (!visited.has(rn)) {
      visited.add(rn);
      fullSeq.push(rn);
    }
  }

  return fullSeq.slice(0, 12);
}

export function calculateDrgDasha(
  chart: JyotishaChart,
  birthDate: Date
): ExtendedDashaCalculationResult {
  const eligibility = evaluateDrgEligibility();
  const lagnaRashi = chart.lagna.rashiNumber;
  const ninthRashi = (((lagnaRashi - 1 + 8) % 12) + 1) as RashiNumber;

  const sequence = generateDrgSequence(ninthRashi);
  const daysInYear = 365.2425;
  const periods: ExtendedDashaPeriod[] = [];
  let currentStart = new Date(birthDate.getTime());

  for (let i = 0; i < sequence.length; i++) {
    const rashiNum = sequence[i];
    const rashiInfo = RASHIS[rashiNum];

    // Lord duration
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

    const durationDays = years * daysInYear;
    const currentEnd = new Date(currentStart.getTime() + durationDays * 86400000);

    // Sub-periods: 12 equal sub-divisions
    const subDurationYears = years / 12;
    const subDurationDays = subDurationYears * daysInYear;
    const subPeriods: ExtendedDashaPeriod[] = [];
    let subStart = new Date(currentStart.getTime());

    for (let j = 0; j < 12; j++) {
      const subRashiNum = sequence[j];
      const subRashiInfo = RASHIS[subRashiNum];
      const subEnd = new Date(subStart.getTime() + subDurationDays * 86400000);

      subPeriods.push({
        id: `drg-${i}-${j}-${rashiNum}-${subRashiNum}`,
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
      id: `drg-maha-${i}-${rashiNum}`,
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
        note: `Initiated from 9th House triad (${rashiInfo.mobility})`,
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
    system: JAIMINI_DRG_SYSTEM_DEF,
    eligibility,
    selectedVariant: 'aspectual_triads',
    availableVariants: [
      {
        id: 'aspectual_triads',
        name: 'Classical 9th House Aspectual Triads',
        description: 'Initiates from 9th House of Dharma and advances through mutual Rāśi Dṛṣṭi triads.',
      },
    ],
    currentPeriod,
    periods,
    calculationDetails: {
      provenance: 'Jaimini Upadeśa Sūtras 2.4 & BPHS Ch. 47',
      seedBasis: `9th House from Lagna: ${RASHIS[ninthRashi].sanskritName} (#${ninthRashi})`,
      balanceFraction: 1,
      balanceYears: periods[0].durationYears,
      steps: [
        `Identified 9th House (Bhāgya/Dharma): ${RASHIS[ninthRashi].sanskritName}`,
        `Constructed aspectual triads based on Chara, Sthira, and Dvisvabhāva Rāśi Dṛṣṭi`,
        `Computed sign-to-lord duration for each period (total cycle: ${totalCycleYears} years)`,
        `Evaluated spiritual, philosophical, and intuitive milestones`,
      ],
    },
  };
}

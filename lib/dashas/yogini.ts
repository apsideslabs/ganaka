/**
 * Gaṇaka — Authentic Classical Yoginī Daśā Engine (36-Year Cycle)
 * 
 * Sources:
 * - Bṛhat Parāśara Horā Śāstra (BPHS Ch. 46)
 * - Rudrayāmala Tantra
 * - Classical Yoginī Dīpikā
 */

import { JyotishaChart } from '../jyotisha/types';
import {
  ExtendedDashaCalculationResult,
  ExtendedDashaPeriod,
  ExtendedDashaSystemDefinition,
  DashaEligibility,
  CurrentPeriodSummary,
} from './extended-types';

export const YOGINI_SYSTEM_DEF: ExtendedDashaSystemDefinition = {
  id: 'yogini',
  name: 'Yoginī Daśā',
  sanskritName: 'योगिनी दशा',
  devanagari: 'योगिनी दशा (३६ वर्षाणि)',
  cycleYears: 36,
  classification: 'nakshatra_planetary',
  traditionalBasis: '36-year octagonal cycle ruled by 8 Yoginī deities and associated planetary lords',
  scripturalProvenance: 'Bṛhat Parāśara Horā Śāstra, Ch. 46 & Rudrayāmala Tantra',
  description:
    'Yoginī Daśā operates in 36-year cycles governed by 8 divine Mother Yoginīs (Maṅgalā, Piṅgalā, Dhānyā, Bhrāmarī, Bhadrikā, Ulkā, Siddhā, Saṅkaṭā). Renowned for its pinpoint precision in Kaliyuga for timing acute life transitions.',
  chartRequirements: ['Moon sidereal longitude (Janma Nakṣatra and elapsed arc)'],
};

export interface YoginiDef {
  number: number; // 1 to 8
  name: string;
  sanskritName: string;
  devanagari: string;
  planetLord: string;
  planetSanskrit: string;
  years: number;
  signification: string;
}

export const YOGINI_LORDS: YoginiDef[] = [
  {
    number: 1,
    name: 'Maṅgalā',
    sanskritName: 'Maṅgalā',
    devanagari: 'मङ्गला',
    planetLord: 'moon',
    planetSanskrit: 'Candra',
    years: 1,
    signification: 'Auspiciousness, peace of mind, marital harmony, spiritual purity',
  },
  {
    number: 2,
    name: 'Piṅgalā',
    sanskritName: 'Piṅgalā',
    devanagari: 'पिङ्गला',
    planetLord: 'sun',
    planetSanskrit: 'Sūrya',
    years: 2,
    signification: 'Vitality, authority, government matters, fiery trials, fame',
  },
  {
    number: 3,
    name: 'Dhānyā',
    sanskritName: 'Dhānyā',
    devanagari: 'धान्या',
    planetLord: 'jupiter',
    planetSanskrit: 'Guru',
    years: 3,
    signification: 'Wealth, prosperity, progeny, learning, divine blessings',
  },
  {
    number: 4,
    name: 'Bhrāmarī',
    sanskritName: 'Bhrāmarī',
    devanagari: 'भ्रामरी',
    planetLord: 'mars',
    planetSanskrit: 'Maṅgala',
    years: 4,
    signification: 'Travel, wandering, displacement, fiery ambitions, courage',
  },
  {
    number: 5,
    name: 'Bhadrikā',
    sanskritName: 'Bhadrikā',
    devanagari: 'भद्रिका',
    planetLord: 'mercury',
    planetSanskrit: 'Budha',
    years: 5,
    signification: 'Intellectual advancement, commerce, good friends, family welfare',
  },
  {
    number: 6,
    name: 'Ulkā',
    sanskritName: 'Ulkā',
    devanagari: 'उल्का',
    planetLord: 'saturn',
    planetSanskrit: 'Śani',
    years: 6,
    signification: 'Obstacles, health distress, sorrow, perseverance, deep karmic duty',
  },
  {
    number: 7,
    name: 'Siddhā',
    sanskritName: 'Siddhā',
    devanagari: 'सिद्धा',
    planetLord: 'venus',
    planetSanskrit: 'Śukra',
    years: 7,
    signification: 'Success, spiritual accomplishments (siddhis), material comfort, love',
  },
  {
    number: 8,
    name: 'Saṅkaṭā',
    sanskritName: 'Saṅkaṭā',
    devanagari: 'सङ्कटा',
    planetLord: 'rahu',
    planetSanskrit: 'Rāhu',
    years: 8,
    signification: 'Major upheavals, hidden enemies, intense transformation, spiritual surrender',
  },
];

function formatDateISO(d: Date): string {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${day}`;
}

export function evaluateYoginiEligibility(): DashaEligibility {
  return {
    status: 'universal',
    isSatisfied: true,
    conditionTitle: 'Universal Application in Kaliyuga',
    classicalRule:
      'Applicable to all nativities. Tantric texts and BPHS praise Yoginī Daśā as universally effective, particularly for instant verification of worldly and health circumstances.',
    chartEvaluation: 'Universal — no exclusionary natal planetary conditions required.',
    sanskritVerse:
      'योगिनी दशा कलिता सर्वशास्त्रेषु पूजिता। कलौ युगे विशेषेण फलदा मुनिपुङ्गवैः॥',
    scripturalSource: 'Rudrayāmala Tantra & BPHS Ch. 46',
  };
}

export function calculateYoginiDasha(
  chart: JyotishaChart,
  birthDate: Date
): ExtendedDashaCalculationResult {
  const eligibility = evaluateYoginiEligibility();
  const moonLong = chart.planets.moon.siderealLongitude;

  // 13°20' per nakshatra
  const nakshatraSpan = 360 / 27;
  const nakshatraIndex = Math.floor(moonLong / nakshatraSpan); // 0..26
  const nakshatraNum = nakshatraIndex + 1; // 1..27
  const arcInNakshatra = moonLong - nakshatraIndex * nakshatraSpan;
  const fractionElapsed = arcInNakshatra / nakshatraSpan;
  const fractionRemaining = 1 - fractionElapsed;

  // Classical formula: (NakshatraNumber + 3) % 8; if 0 -> 8
  let seed = (nakshatraNum + 3) % 8;
  if (seed === 0) seed = 8;
  const startYoginiIndex = seed - 1; // 0..7

  const firstYogini = YOGINI_LORDS[startYoginiIndex];
  const balanceYears = firstYogini.years * fractionRemaining;
  const daysInYear = 365.2425;

  // Generate 3 full cycles (3 * 36 = 108 years) to span normal human lifespan
  const periods: ExtendedDashaPeriod[] = [];
  let currentStart = new Date(birthDate.getTime());
  const totalCycles = 3;

  for (let cycle = 0; cycle < totalCycles; cycle++) {
    for (let i = 0; i < YOGINI_LORDS.length; i++) {
      const isAbsoluteFirst = cycle === 0 && i === 0;
      const yoginiIdx = (startYoginiIndex + i) % YOGINI_LORDS.length;
      const yogini = YOGINI_LORDS[yoginiIdx];

      const durationYears = isAbsoluteFirst ? balanceYears : yogini.years;
      const durationDays = durationYears * daysInYear;
      const currentEnd = new Date(currentStart.getTime() + durationDays * 86400000);

      // Sub-periods (Antardaśās)
      const subPeriods: ExtendedDashaPeriod[] = [];
      let subStart = new Date(currentStart.getTime());

      for (let j = 0; j < YOGINI_LORDS.length; j++) {
        const subIdx = (yoginiIdx + j) % YOGINI_LORDS.length;
        const subYogini = YOGINI_LORDS[subIdx];

        // Classical formula: (MD_years * AD_years) / 36
        const fullSubYears = (yogini.years * subYogini.years) / 36;
        const subDurationYears = isAbsoluteFirst ? fullSubYears * fractionRemaining : fullSubYears;
        const subDurationDays = subDurationYears * daysInYear;
        const subEnd = new Date(subStart.getTime() + subDurationDays * 86400000);

        subPeriods.push({
          id: `yog-${cycle}-${yogini.name}-${subYogini.name}-${i}-${j}`,
          level: 2,
          lordKey: subYogini.name.toLowerCase(),
          name: `${yogini.name} / ${subYogini.name} (${subYogini.planetSanskrit})`,
          sanskritName: `${yogini.sanskritName}-${subYogini.sanskritName}`,
          devanagari: `${yogini.devanagari}-${subYogini.devanagari}`,
          startDate: new Date(subStart),
          endDate: new Date(subEnd),
          startDateStr: formatDateISO(subStart),
          endDateStr: formatDateISO(subEnd),
          durationYears: subDurationYears,
          durationDays: subDurationDays,
          metadata: {
            planetId: subYogini.planetLord,
            note: subYogini.signification,
          },
        });

        subStart = subEnd;
      }

      periods.push({
        id: `yog-${cycle}-${yogini.name}-${i}`,
        level: 1,
        lordKey: yogini.name.toLowerCase(),
        name: `${yogini.name} (${yogini.planetSanskrit}) [Cycle ${cycle + 1}]`,
        sanskritName: yogini.sanskritName,
        devanagari: yogini.devanagari,
        startDate: new Date(currentStart),
        endDate: new Date(currentEnd),
        startDateStr: formatDateISO(currentStart),
        endDateStr: formatDateISO(currentEnd),
        durationYears,
        durationDays,
        isBirthBalance: isAbsoluteFirst,
        subPeriods,
        metadata: {
          planetId: yogini.planetLord,
          note: yogini.signification,
        },
      });

      currentStart = currentEnd;
    }
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

  return {
    system: YOGINI_SYSTEM_DEF,
    eligibility,
    selectedVariant: 'standard_36',
    availableVariants: [
      {
        id: 'standard_36',
        name: 'Standard 36-Year Octagonal Cycle',
        description: 'Classical 8-Yoginī progression per BPHS & Rudrayāmala (1, 2, 3, 4, 5, 6, 7, 8 years).',
      },
    ],
    currentPeriod,
    periods,
    calculationDetails: {
      provenance: 'BPHS Ch. 46 & Rudrayāmala Tantra',
      seedBasis: `Janma Nakṣatra #${nakshatraNum} (${chart.planets.moon.nakshatraName}) + 3 ÷ 8 = Remainder ${seed} (${firstYogini.name})`,
      balanceFraction: fractionRemaining,
      balanceYears,
      steps: [
        `Identified Janma Nakṣatra #${nakshatraNum} at ${moonLong.toFixed(4)}°`,
        `Yoginī Seed Formula: (${nakshatraNum} + 3) mod 8 = ${seed}`,
        `Initial Mahādaśā Lord: ${firstYogini.name} (${firstYogini.planetSanskrit}, full ${firstYogini.years}y)`,
        `Nakṣatra arc elapsed: ${(fractionElapsed * 100).toFixed(2)}% → Unexpired birth balance: ${balanceYears.toFixed(2)} years`,
        `Generated 3 complete 36-year cycles (108 years) with proportional 2-level Antardaśās`,
      ],
    },
  };
}

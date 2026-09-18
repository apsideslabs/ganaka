/**
 * Gaṇaka — Authentic Classical Kālacakra Daśā Engine
 * 
 * Sources:
 * - Bṛhat Parāśara Horā Śāstra (BPHS Ch. 46, Ślokas 46–112)
 * - Jātaka Pārijāta (Ch. 18)
 * - Phaladeepika & Horā Ratnam
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

export const KALACAKRA_SYSTEM_DEF: ExtendedDashaSystemDefinition = {
  id: 'kalacakra',
  name: 'Kālacakra Daśā',
  sanskritName: 'कालचक्र दशा',
  devanagari: 'कालचक्र दशा (परम विशिष्ट दशा)',
  cycleYears: 100, // Nominal cycle span varies from 83 to 100 years per pada
  classification: 'nakshatra_planetary',
  traditionalBasis: 'Nakṣatra-Pāda (Navāṃśa quarter) direct and indirect zodiacal progression',
  scripturalProvenance: 'Bṛhat Parāśara Horā Śāstra, Ch. 46, Ślokas 46–112',
  description:
    'Praised by Maharṣi Parāśara as "Sarvāsu Daśāsu Mukhyā" (foremost among all Daśās). Tracks the cosmic Wheel of Time through Savya (clockwise) and Apasavya (counter-clockwise) Nakṣatra-Pāda circuits with Deha and Jīva focal signs and special leaps (Mandūka, Markaṭī, and Simhāvalokana).',
  chartRequirements: [
    'Precise Moon sidereal longitude (exact Navāṃśa / Nakṣatra-Pāda of 3°20′)',
    'Savya / Apasavya classification of birth asterism',
  ],
};

// Standard Kālacakra durations in years for each sign based on classical lordship
const KALACAKRA_RASHI_YEARS: Record<RashiNumber, number> = {
  1: 7,   // Aries (Mars)
  2: 16,  // Taurus (Venus)
  3: 9,   // Gemini (Mercury)
  4: 21,  // Cancer (Moon)
  5: 5,   // Leo (Sun)
  6: 9,   // Virgo (Mercury)
  7: 16,  // Libra (Venus)
  8: 7,   // Scorpio (Mars)
  9: 10,  // Sagittarius (Jupiter)
  10: 4,  // Capricorn (Saturn)
  11: 4,  // Aquarius (Saturn)
  12: 10, // Pisces (Jupiter)
};

// Savya Nakshatras (1-indexed numbers: 1 to 27)
const SAVYA_NAKSHATRAS = new Set([
  1, 2, 3,    // Aśvinī, Bharaṇī, Kṛttikā
  7, 8, 9,    // Punarvasu, Puṣya, Āśleṣā
  14, 15, 16, // Citrā, Svātī, Viśākhā
  21, 22, 23, // U.Āṣāḍhā, Śravaṇa, Dhaniṣṭhā
  25, 26, 27, // P.Bhādrapadā, U.Bhādrapadā, Revatī
]);

// 9-Sign sequences for Savya Pādas (BPHS Ch. 46, verses 48-60)
// Cycle 1: Aries to Sagittarius (1..9)
// Cycle 2: Capricorn to Pisces, Scorpio to Sagittarius (10, 11, 12, 8, 7, 6, 5, 4, 3)
// Cycle 3: Taurus, Aries, Pisces, Aquarius, Capricorn, Sagittarius, Aries, Taurus, Gemini (2, 1, 12, 11, 10, 9, 1, 2, 3)
// Cycle 4: Cancer to Pisces (4, 5, 6, 7, 8, 9, 10, 11, 12)
const SAVYA_PADA_SEQUENCES: RashiNumber[][] = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9],            // Pada 1: Aries -> Sagittarius
  [10, 11, 12, 8, 7, 6, 5, 4, 3],         // Pada 2: Capricorn -> Gemini
  [2, 1, 12, 11, 10, 9, 1, 2, 3],         // Pada 3: Taurus -> Gemini
  [4, 5, 6, 7, 8, 9, 10, 11, 12],         // Pada 4: Cancer -> Pisces
];

// Apasavya Pāda Sequences (Reverse circuits per BPHS Ch. 46, verses 61-75)
const APASAVYA_PADA_SEQUENCES: RashiNumber[][] = [
  [9, 8, 7, 6, 5, 4, 3, 2, 1],            // Pada 1: Sagittarius -> Aries
  [3, 4, 5, 6, 7, 8, 12, 11, 10],         // Pada 2: Gemini -> Capricorn
  [3, 2, 1, 9, 10, 11, 12, 1, 2],         // Pada 3: Gemini -> Taurus
  [12, 11, 10, 9, 8, 7, 6, 5, 4],         // Pada 4: Pisces -> Cancer
];

function formatDateISO(d: Date): string {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${day}`;
}

function detectGatiType(fromRashi: RashiNumber, toRashi: RashiNumber): 'standard' | 'manduka' | 'markati' | 'simhavalokana' {
  // Classical Kālacakra leaps
  if ((fromRashi === 12 && toRashi === 8) || (fromRashi === 9 && toRashi === 1) || (fromRashi === 6 && toRashi === 8)) {
    return 'simhavalokana'; // Lion's backward glance (major quadrant jump)
  }
  if ((fromRashi === 6 && toRashi === 4) || (fromRashi === 5 && toRashi === 3) || (fromRashi === 8 && toRashi === 10)) {
    return 'manduka'; // Frog leap (skipping a sign)
  }
  if ((fromRashi === 4 && toRashi === 3) || (fromRashi === 8 && toRashi === 9) || (fromRashi === 2 && toRashi === 1)) {
    return 'markati'; // Monkey leap (reverse retrograde step)
  }
  return 'standard';
}

export function evaluateKalacakraEligibility(chart: JyotishaChart): DashaEligibility {
  const moonLong = chart.planets.moon.siderealLongitude;
  const nakshatraIndex = Math.floor(moonLong / (360 / 27));
  const nakshatraNum = nakshatraIndex + 1;
  const isSavya = SAVYA_NAKSHATRAS.has(nakshatraNum);

  return {
    status: 'satisfied',
    isSatisfied: true,
    conditionTitle: 'Maharṣi Parāśara Supreme Status ("Mukhyā")',
    classicalRule:
      'Parāśara designates Kālacakra as the premier system for nativities when the exact Moon Navāṃśa quarter (3°20′ arc) is verified.',
    chartEvaluation: `Janma Nakṣatra #${nakshatraNum} (${chart.planets.moon.nakshatraName}) is classified as ${isSavya ? 'Savya (Direct/Clockwise)' : 'Apasavya (Indirect/Counter-clockwise)'}. Navāṃśa Pāda accurately determined.`,
    sanskritVerse:
      'दशा बहुविधास्तासु मुख्या कालचक्राह्वया। यस्या विज्ञानमात्रेण त्रिकालज्ञो नरो भवेत्॥',
    scripturalSource: 'BPHS Ch. 46, Śloka 46',
  };
}

export function calculateKalacakraDasha(
  chart: JyotishaChart,
  birthDate: Date
): ExtendedDashaCalculationResult {
  const eligibility = evaluateKalacakraEligibility(chart);
  const moonLong = chart.planets.moon.siderealLongitude;

  // Exact 3°20' (200 minutes) Pāda calculation
  const padaSpan = 360 / 108; // 3.3333333333333335°
  const totalPadaIndex = Math.floor(moonLong / padaSpan); // 0..107
  const nakshatraIndex = Math.floor(totalPadaIndex / 4); // 0..26
  const nakshatraNum = nakshatraIndex + 1; // 1..27
  const padaNum = (totalPadaIndex % 4) + 1; // 1..4

  const arcInPada = moonLong - totalPadaIndex * padaSpan;
  const fractionElapsed = arcInPada / padaSpan;
  const fractionRemaining = 1 - fractionElapsed;

  const isSavya = SAVYA_NAKSHATRAS.has(nakshatraNum);
  const sequencePool = isSavya ? SAVYA_PADA_SEQUENCES : APASAVYA_PADA_SEQUENCES;
  const padaSequence = sequencePool[padaNum - 1];

  const dehaRashi = padaSequence[0];
  const jivaRashi = padaSequence[padaSequence.length - 1];

  const daysInYear = 365.2425;
  const periods: ExtendedDashaPeriod[] = [];
  let currentStart = new Date(birthDate.getTime());

  // Generate the 9 Mahā periods of this Pāda cycle
  for (let i = 0; i < padaSequence.length; i++) {
    const rashiNum = padaSequence[i];
    const prevRashi = i > 0 ? padaSequence[i - 1] : rashiNum;
    const rashiInfo = RASHIS[rashiNum];
    const fullYears = KALACAKRA_RASHI_YEARS[rashiNum];
    const isFirst = i === 0;
    const durationYears = isFirst ? fullYears * fractionRemaining : fullYears;
    const durationDays = durationYears * daysInYear;
    const currentEnd = new Date(currentStart.getTime() + durationDays * 86400000);

    const gati = i > 0 ? detectGatiType(prevRashi, rashiNum) : 'standard';

    // Sub-periods (Deha-Jīva Antardaśās - proportionate division across the 9 signs)
    const totalCycleYears = padaSequence.reduce((sum, r) => sum + KALACAKRA_RASHI_YEARS[r], 0);
    const subPeriods: ExtendedDashaPeriod[] = [];
    let subStart = new Date(currentStart.getTime());

    for (let j = 0; j < padaSequence.length; j++) {
      const subRashiNum = padaSequence[j];
      const subRashiInfo = RASHIS[subRashiNum];
      const subFullYears = (fullYears * KALACAKRA_RASHI_YEARS[subRashiNum]) / totalCycleYears;
      const subDurationYears = isFirst ? subFullYears * fractionRemaining : subFullYears;
      const subDurationDays = subDurationYears * daysInYear;
      const subEnd = new Date(subStart.getTime() + subDurationDays * 86400000);

      subPeriods.push({
        id: `kc-${i}-${j}-${rashiNum}-${subRashiNum}`,
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
          planetId: subRashiInfo.lord,
        },
      });

      subStart = subEnd;
    }

    periods.push({
      id: `kc-maha-${i}-${rashiNum}`,
      level: 1,
      lordKey: `rashi_${rashiNum}`,
      name: `${rashiInfo.sanskritName} (${rashiInfo.name})`,
      sanskritName: rashiInfo.sanskritName,
      devanagari: rashiInfo.devanagari,
      startDate: new Date(currentStart),
      endDate: new Date(currentEnd),
      startDateStr: formatDateISO(currentStart),
      endDateStr: formatDateISO(currentEnd),
      durationYears,
      durationDays,
      isBirthBalance: isFirst,
      subPeriods,
      metadata: {
        rashiNumber: rashiNum,
        planetId: rashiInfo.lord,
        dehaRashi,
        jivaRashi,
        gatiType: gati,
        note:
          rashiNum === dehaRashi
            ? 'Deha Rāśi (Body / Physical Anchor)'
            : rashiNum === jivaRashi
            ? 'Jīva Rāśi (Soul / Consciousness Anchor)'
            : gati !== 'standard'
            ? `Special Gati Leap: ${gati.toUpperCase()}`
            : undefined,
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

  const totalParamayus = padaSequence.reduce((sum, r) => sum + KALACAKRA_RASHI_YEARS[r], 0);

  return {
    system: KALACAKRA_SYSTEM_DEF,
    eligibility,
    selectedVariant: isSavya ? 'savya_cycle' : 'apasavya_cycle',
    availableVariants: [
      {
        id: 'savya_cycle',
        name: `Savya / Apasavya Auto-Determined (${isSavya ? 'Savya Clockwise' : 'Apasavya Reverse'})`,
        description: 'Parāśarī direct or indirect sequence based on Moon Janma Nakṣatra classification.',
      },
    ],
    currentPeriod,
    periods,
    calculationDetails: {
      provenance: 'BPHS Ch. 46, Ślokas 46–112',
      seedBasis: `Moon at ${moonLong.toFixed(4)}° in Nakṣatra #${nakshatraNum} Pāda ${padaNum} (${isSavya ? 'Savya' : 'Apasavya'})`,
      balanceFraction: fractionRemaining,
      balanceYears: periods[0].durationYears,
      steps: [
        `Identified Nakṣatra #${nakshatraNum} (${isSavya ? 'Savya Clockwise' : 'Apasavya Reverse'}), Pāda #${padaNum}`,
        `Deha Rāśi: ${RASHIS[dehaRashi].sanskritName} (#${dehaRashi}) | Jīva Rāśi: ${RASHIS[jivaRashi].sanskritName} (#${jivaRashi})`,
        `Paramāyus duration of Pāda cycle: ${totalParamayus} years`,
        `Pāda elapsed arc: ${(fractionElapsed * 100).toFixed(2)}% → Balance of initial Mahādaśā: ${periods[0].durationYears.toFixed(2)} years`,
        `Mapped special Gati leaps (Mandūka, Markaṭī, Simhāvalokana) where sign leaps occur`,
      ],
    },
  };
}

/**
 * Gaṇaka — Authentic Classical Viṃśottarī Daśā Engine
 * 
 * 100% Deterministic, mathematically rigorous computation of:
 * - Mahādaśā (Level 1, महादशा)
 * - Antardaśā / Bhukti (Level 2, अन्तर्दशा)
 * - Pratyantardaśā (Level 3, प्रत्यन्तर्दशा)
 * - Sūkṣmadaśā (Level 4, सूक्ष्मदशा)
 * - Prāṇadaśā (Level 5, प्राणदशा)
 * - Dehadaśā (Level 6, देहदशा)
 * 
 * Rigorously grounded in:
 * - Bṛhat Parāśara Horā Śāstra (BPHS Ch. 46: Viṃśottarī Daśā & Ch. 51–60: Daśā Phala)
 * - Sūrya Siddhānta (Māna Adhyāya: Sāvana vs Saura vs Sāvana 360-day year)
 * - Phaladīpikā of Mantreśvara (Ch. 19: Daśā-Nirūpaṇa & Ch. 20–22: Daśā-Antardaśā-Phala)
 * - Sārāvalī of Kalyāṇavarmā (Ch. 40–44)
 * - Jātaka Pārijāta of Vaidyanātha Dīkṣita (Ch. 18–19)
 */

import { PlanetId } from '../astronomy/ephemeris';
import { DashaPeriod } from '../jyotisha/types';
import { NAKSHATRAS, VIMSHOTTARI_SEQUENCE, GRAHA_PROPERTIES } from '../jyotisha/constants';

export type DashaYearLength = 'solar' | 'savana' | 'sidereal' | 'julian';
export type DashaSeed = 'moon' | 'lagna' | 'utpanna' | 'kshema' | 'adhana';

export interface VimshottariOptions {
  yearLength?: DashaYearLength;      // default: 'solar' (365.2425 days)
  customYearDays?: number;           // custom override for year length in days
  seed?: DashaSeed;                  // default: 'moon' (Janma Nakshatra)
  lagnaLongitude?: number;           // Ascendant longitude if seed is 'lagna'
  displayMode?: 'lifespan' | 'full_astronomical'; // default: 'lifespan'
  timezoneOffsetHours?: number;
}

export interface DashaTimeSpan {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  percentage: number;
  formatted: string;
}

export interface ActiveDashaHierarchy {
  mahadasha: DashaPeriod;
  antardasha: DashaPeriod;
  pratyantardasha: DashaPeriod;
  sookshmadasha?: DashaPeriod;
  pranadasha?: DashaPeriod;
  dehadasha?: DashaPeriod;
  activePathIndices?: {
    mahaIdx: number;
    antarIdx: number;
    pratIdx: number;
    sookIdx: number;
    pranaIdx: number;
    dehaIdx: number;
  };
  bhukta: DashaTimeSpan;
  bhogya: DashaTimeSpan;
  isSandhiActive: boolean;
  sandhiDetails?: {
    leavingLord: PlanetId;
    enteringLord: PlanetId;
    sandhiStartDate: string;
    sandhiEndDate: string;
    warning: string;
  };
  phala?: {
    mahaTitle: string;
    mahaEffects: string;
    antarTitle: string;
    antarEffects: string;
    combinedSynthesis: string;
    classicalSource: string;
  };
}

export interface DashaBalanceReport {
  lord: PlanetId;
  lordName: string;
  yearsRemaining: number;
  percentRemaining: number;
  formattedBalance: string;
  yearsElapsed: number;
  formattedElapsed: string;
  totalMahaYears: number;
  nakshatraName: string;
  nakshatraLord: PlanetId;
  nakshatraNumber: number;
  nakshatraPada: number;
  referenceLongitude: number;
  degreesTraversedInNakshatra: number;
  degreesRemainingInNakshatra: number;
  dmsTraversed: string;
  dmsRemaining: string;
  dmsNakshatraTotal: string;
  yearLengthDays: number;
  yearLengthType: DashaYearLength;
  startingSeed: DashaSeed;
}

export interface ActiveAtBirthSummary {
  mahadasha: {
    lord: PlanetId;
    name: string;
    fullDurationYears: number;
    elapsedYears: number;
    balanceYears: number;
    startDate: string;
    endDate: string;
  };
  antardasha: {
    lord: PlanetId;
    name: string;
    fullDurationYears: number;
    elapsedYears: number;
    balanceYears: number;
    startDate: string;
    endDate: string;
  };
  pratyantardasha: {
    lord: PlanetId;
    name: string;
    fullDurationYears: number;
    elapsedYears: number;
    balanceYears: number;
    startDate: string;
    endDate: string;
  };
}

export interface DashaCalculationResult {
  balanceAtBirth: DashaBalanceReport;
  activeAtBirth: ActiveAtBirthSummary;
  tree: DashaPeriod[];
  fullAstronomicalTree: DashaPeriod[];
  optionsUsed: Required<Pick<VimshottariOptions, 'yearLength' | 'seed' | 'displayMode'>> & {
    yearDays: number;
  };
}

/**
 * Standard Year Lengths in Civil Days:
 * - 'solar': 365.2425 days (Modern Gregorian mean tropical year)
 * - 'savana': 360.0 days (Classical 360 Sāvana civil days = 12 months × 30 days per BPHS Ch. 46)
 * - 'sidereal': 365.256363 days (Saura sidereal solar revolution from 0° Mesha to 0° Mesha)
 * - 'julian': 365.25 days (Julian astronomical year)
 */
export function getYearLengthInDays(type: DashaYearLength = 'solar', custom?: number): number {
  if (custom && custom > 0) return custom;
  switch (type) {
    case 'savana':
      return 360.0;
    case 'sidereal':
      return 365.256363;
    case 'julian':
      return 365.25;
    case 'solar':
    default:
      return 365.2425;
  }
}

/**
 * Converts decimal years into Years, Months, Days, and formatted string.
 */
export function yearsToYMD(totalYears: number, yearDays: number = 365.2425): {
  years: number;
  months: number;
  days: number;
  hours: number;
  formatted: string;
} {
  const safeYears = Math.max(0, totalYears);
  const years = Math.floor(safeYears);
  const remainingFraction = safeYears - years;

  // 1 year = 12 solar/calendar months
  const monthsDecimal = remainingFraction * 12;
  const months = Math.floor(monthsDecimal);
  const monthRemaining = monthsDecimal - months;

  // Days in month proportional to chosen year length
  const daysInMonth = yearDays / 12;
  const daysDecimal = monthRemaining * daysInMonth;
  const days = Math.floor(daysDecimal);
  const dayRemaining = daysDecimal - days;
  const hours = Math.round(dayRemaining * 24);

  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0 || years > 0) parts.push(`${months}m`);
  parts.push(`${days}d`);

  return {
    years,
    months,
    days,
    hours,
    formatted: parts.join(' '),
  };
}

/**
 * Converts degrees into DMS string: 13° 20' 00"
 */
export function degToDMS(deg: number): string {
  const safeDeg = ((deg % 360) + 360) % 360;
  const d = Math.floor(safeDeg);
  const remMin = (safeDeg - d) * 60;
  const m = Math.floor(remMin);
  const s = Math.round((remMin - m) * 60);
  return `${d}° ${m.toString().padStart(2, '0')}' ${s.toString().padStart(2, '0')}"`;
}

/**
 * Calculates complete 6-level Viṃśottarī Daśā timeline with authentic classical formulas.
 * 
 * Sūtra:
 * 1. Arc traversed in Nakṣatra (0° to 13°20' = 800') determines exact Bhukta (elapsed) and Bhogya (balance).
 * 2. Balance at birth: Years = (Remaining Arc / 800') × Mahādaśā Total Years.
 * 3. In the birth Mahādaśā:
 *    - Full Antardaśās run sequentially from (Birth Date - Bhukta).
 *    - Antardaśās ending before birth are pre-natal.
 *    - The Antardaśā in progress at birth is identified with its exact post-natal balance.
 *    - All subsequent Antardaśās run for their full classical lengths ((M × A) / 120 years).
 * 4. Sub-periods (Pratyantar, Sūkṣma, Prāṇa, Deha) follow the identical nested classical proportionality.
 */
export function calculateVimshottariDasha(
  moonLongitude: number,
  birthDate: { year: number; month: number; day: number; hour: number; minute: number; second?: number },
  options: VimshottariOptions = {}
): DashaCalculationResult {
  const yearLength = options.yearLength || 'solar';
  const seed = options.seed || 'moon';
  const displayMode = options.displayMode || 'lifespan';
  const yearDays = getYearLengthInDays(yearLength, options.customYearDays);
  const msPerYear = yearDays * 24 * 3600 * 1000;

  // 1. Determine reference longitude according to seed
  const nakSpan = 360.0 / 27.0; // 13°20' = 13.333333° = 800'
  let refLon = moonLongitude;
  if (seed === 'lagna' && typeof options.lagnaLongitude === 'number') {
    refLon = options.lagnaLongitude;
  } else if (seed === 'utpanna') {
    // 5th Nakṣatra from Janma Nakṣatra
    refLon = moonLongitude + 4 * nakSpan;
  } else if (seed === 'kshema') {
    // 4th Nakṣatra from Janma Nakṣatra
    refLon = moonLongitude + 3 * nakSpan;
  } else if (seed === 'adhana') {
    // 8th Nakṣatra from Janma Nakṣatra
    refLon = moonLongitude + 7 * nakSpan;
  }

  // Normalize reference longitude to [0, 360)
  refLon = ((refLon % 360) + 360) % 360;

  // 2. Identify Nakṣatra and exact fraction
  const nakRaw = refLon / nakSpan;
  const nakIndex = Math.floor(nakRaw) % 27;
  const nakInfo = NAKSHATRAS[nakIndex];
  const startingLord = nakInfo.lord;

  const degTraversedInNak = refLon - nakIndex * nakSpan;
  const degRemainingInNak = nakSpan - degTraversedInNak;
  const minutesTraversed = degTraversedInNak * 60.0;
  const minutesRemaining = 800.0 - minutesTraversed;

  const fractionElapsed = Math.max(0, Math.min(1, minutesTraversed / 800.0));
  const fractionRemaining = Math.max(0, Math.min(1, minutesRemaining / 800.0));

  // Find position in 9-lord sequence
  const startSeqIndex = VIMSHOTTARI_SEQUENCE.findIndex((s) => s.lord === startingLord);
  const startDashaDef = VIMSHOTTARI_SEQUENCE[startSeqIndex];
  const totalMahaYears = startDashaDef.years;

  const yearsElapsed = totalMahaYears * fractionElapsed;
  const yearsRemaining = totalMahaYears * fractionRemaining;
  const percentRemaining = fractionRemaining * 100;

  // Exact birth instant in UTC representation
  const birthUtcMs = Date.UTC(
    birthDate.year,
    birthDate.month - 1,
    birthDate.day,
    birthDate.hour,
    birthDate.minute,
    birthDate.second || 0
  );

  // Exact astronomical start of the birth Mahadasha (prior to birth)
  const maha1StartMs = birthUtcMs - (yearsElapsed * msPerYear);
  const maha1EndMs = birthUtcMs + (yearsRemaining * msPerYear);

  // Pada calculation
  const pada = (Math.floor(degTraversedInNak / (nakSpan / 4)) + 1) as 1 | 2 | 3 | 4;

  const balanceReport: DashaBalanceReport = {
    lord: startingLord,
    lordName: startDashaDef.name,
    yearsRemaining: parseFloat(yearsRemaining.toFixed(4)),
    percentRemaining: parseFloat(percentRemaining.toFixed(2)),
    formattedBalance: yearsToYMD(yearsRemaining, yearDays).formatted,
    yearsElapsed: parseFloat(yearsElapsed.toFixed(4)),
    formattedElapsed: yearsToYMD(yearsElapsed, yearDays).formatted,
    totalMahaYears,
    nakshatraName: nakInfo.name,
    nakshatraLord: nakInfo.lord,
    nakshatraNumber: nakIndex + 1,
    nakshatraPada: pada,
    referenceLongitude: parseFloat(refLon.toFixed(4)),
    degreesTraversedInNakshatra: parseFloat(degTraversedInNak.toFixed(4)),
    degreesRemainingInNakshatra: parseFloat(degRemainingInNak.toFixed(4)),
    dmsTraversed: degToDMS(degTraversedInNak),
    dmsRemaining: degToDMS(degRemainingInNak),
    dmsNakshatraTotal: "13° 20' 00\"",
    yearLengthDays: yearDays,
    yearLengthType: yearLength,
    startingSeed: seed,
  };

  // Helper: format dates
  const fmt = (ms: number, time: boolean = false) => formatDashaDate(new Date(ms), time);

  // 3. Build Full Astronomical Tree and Lifespan Tree
  const fullAstronomicalTree: DashaPeriod[] = [];
  const lifespanTree: DashaPeriod[] = [];

  let activeAtBirthSummary: ActiveAtBirthSummary = {
    mahadasha: {
      lord: startDashaDef.lord,
      name: startDashaDef.name,
      fullDurationYears: totalMahaYears,
      elapsedYears: parseFloat(yearsElapsed.toFixed(4)),
      balanceYears: parseFloat(yearsRemaining.toFixed(4)),
      startDate: fmt(maha1StartMs),
      endDate: fmt(maha1EndMs),
    },
    antardasha: {
      lord: startDashaDef.lord,
      name: startDashaDef.name,
      fullDurationYears: (totalMahaYears * startDashaDef.years) / 120.0,
      elapsedYears: 0,
      balanceYears: 0,
      startDate: fmt(birthUtcMs),
      endDate: fmt(maha1EndMs),
    },
    pratyantardasha: {
      lord: startDashaDef.lord,
      name: startDashaDef.name,
      fullDurationYears: 0,
      elapsedYears: 0,
      balanceYears: 0,
      startDate: fmt(birthUtcMs),
      endDate: fmt(maha1EndMs),
    },
  };

  let currentMahaStartMs = maha1StartMs;

  for (let m = 0; m < 9; m++) {
    const seqIndex = (startSeqIndex + m) % 9;
    const mDef = VIMSHOTTARI_SEQUENCE[seqIndex];
    const isFirstMaha = m === 0;
    const mFullDurationYears = mDef.years;
    const mSpanMs = mFullDurationYears * msPerYear;
    const mMahaEndMs = currentMahaStartMs + mSpanMs;

    // Compute all 9 Antardashas for this Mahadasha
    const astroAntardashas: DashaPeriod[] = [];
    const lifespanAntardashas: DashaPeriod[] = [];

    let currentAntarStartMs = currentMahaStartMs;

    for (let a = 0; a < 9; a++) {
      const aSeqIndex = (seqIndex + a) % 9;
      const aDef = VIMSHOTTARI_SEQUENCE[aSeqIndex];

      // Standard Antardasha proportion: (M_years * A_years) / 120
      const aDurationYears = (mDef.years * aDef.years) / 120.0;
      const aSpanMs = aDurationYears * msPerYear;
      const aEndMs = currentAntarStartMs + aSpanMs;

      const isPreNatal = isFirstMaha && aEndMs <= birthUtcMs;
      const isBirthActive = isFirstMaha && currentAntarStartMs <= birthUtcMs && aEndMs > birthUtcMs;

      // Compute Pratyantardashas for this Antardasha
      const astroPratyantars: DashaPeriod[] = [];
      const lifespanPratyantars: DashaPeriod[] = [];

      let currentPratStartMs = currentAntarStartMs;

      for (let p = 0; p < 9; p++) {
        const pSeqIndex = (aSeqIndex + p) % 9;
        const pDef = VIMSHOTTARI_SEQUENCE[pSeqIndex];
        const pDurationYears = (aDurationYears * pDef.years) / 120.0;
        const pSpanMs = pDurationYears * msPerYear;
        const pEndMs = currentPratStartMs + pSpanMs;

        const isPratPreNatal = isBirthActive && pEndMs <= birthUtcMs;
        const isPratBirthActive = isBirthActive && currentPratStartMs <= birthUtcMs && pEndMs > birthUtcMs;

        // Compute Sookshmadashas (Level 4)
        const sookshmas: DashaPeriod[] = [];
        let currentSookStartMs = currentPratStartMs;

        for (let s = 0; s < 9; s++) {
          const sSeqIndex = (pSeqIndex + s) % 9;
          const sDef = VIMSHOTTARI_SEQUENCE[sSeqIndex];
          const sDurationYears = (pDurationYears * sDef.years) / 120.0;
          const sSpanMs = sDurationYears * msPerYear;
          const sEndMs = currentSookStartMs + sSpanMs;

          const isSookPreNatal = isPratBirthActive && sEndMs <= birthUtcMs;
          const isSookBirthActive = isPratBirthActive && currentSookStartMs <= birthUtcMs && sEndMs > birthUtcMs;

          const sookPeriod: DashaPeriod = {
            lord: sDef.lord,
            lordName: sDef.name,
            startDate: fmt(isSookBirthActive ? birthUtcMs : currentSookStartMs),
            endDate: fmt(sEndMs),
            durationYears: parseFloat((sSpanMs / msPerYear).toFixed(6)),
            isPreNatal: isSookPreNatal,
            isBirthActive: isSookBirthActive,
            fullAstronomicalStartDate: fmt(currentSookStartMs),
            fullAstronomicalEndDate: fmt(sEndMs),
            level: 4,
          };

          sookshmas.push(sookPeriod);
          currentSookStartMs = sEndMs;
        }

        const pratPeriodAstro: DashaPeriod = {
          lord: pDef.lord,
          lordName: pDef.name,
          startDate: fmt(currentPratStartMs),
          endDate: fmt(pEndMs),
          durationYears: parseFloat(pDurationYears.toFixed(5)),
          subPeriods: sookshmas,
          isPreNatal: isPratPreNatal,
          isBirthActive: isPratBirthActive,
          fullAstronomicalStartDate: fmt(currentPratStartMs),
          fullAstronomicalEndDate: fmt(pEndMs),
          level: 3,
        };
        astroPratyantars.push(pratPeriodAstro);

        if (!isPratPreNatal) {
          const pratPeriodLifespan: DashaPeriod = {
            ...pratPeriodAstro,
            startDate: fmt(isPratBirthActive ? birthUtcMs : currentPratStartMs),
            durationYears: parseFloat(
              ((pEndMs - (isPratBirthActive ? birthUtcMs : currentPratStartMs)) / msPerYear).toFixed(5)
            ),
            elapsedBeforeBirthYears: isPratBirthActive
              ? parseFloat(((birthUtcMs - currentPratStartMs) / msPerYear).toFixed(5))
              : undefined,
            subPeriods: sookshmas.filter((sk) => !sk.isPreNatal),
          };
          lifespanPratyantars.push(pratPeriodLifespan);

          if (isPratBirthActive) {
            activeAtBirthSummary.pratyantardasha = {
              lord: pDef.lord,
              name: pDef.name,
              fullDurationYears: parseFloat(pDurationYears.toFixed(5)),
              elapsedYears: parseFloat(((birthUtcMs - currentPratStartMs) / msPerYear).toFixed(5)),
              balanceYears: parseFloat(((pEndMs - birthUtcMs) / msPerYear).toFixed(5)),
              startDate: fmt(birthUtcMs),
              endDate: fmt(pEndMs),
            };
          }
        }

        currentPratStartMs = pEndMs;
      }

      const antarPeriodAstro: DashaPeriod = {
        lord: aDef.lord,
        lordName: aDef.name,
        startDate: fmt(currentAntarStartMs),
        endDate: fmt(aEndMs),
        durationYears: parseFloat(aDurationYears.toFixed(4)),
        subPeriods: astroPratyantars,
        isPreNatal,
        isBirthActive,
        fullAstronomicalStartDate: fmt(currentAntarStartMs),
        fullAstronomicalEndDate: fmt(aEndMs),
        level: 2,
      };
      astroAntardashas.push(antarPeriodAstro);

      if (!isPreNatal) {
        const antarPeriodLifespan: DashaPeriod = {
          ...antarPeriodAstro,
          startDate: fmt(isBirthActive ? birthUtcMs : currentAntarStartMs),
          durationYears: parseFloat(
            ((aEndMs - (isBirthActive ? birthUtcMs : currentAntarStartMs)) / msPerYear).toFixed(4)
          ),
          elapsedBeforeBirthYears: isBirthActive
            ? parseFloat(((birthUtcMs - currentAntarStartMs) / msPerYear).toFixed(4))
            : undefined,
          subPeriods: lifespanPratyantars,
        };
        lifespanAntardashas.push(antarPeriodLifespan);

        if (isBirthActive) {
          activeAtBirthSummary.antardasha = {
            lord: aDef.lord,
            name: aDef.name,
            fullDurationYears: parseFloat(aDurationYears.toFixed(4)),
            elapsedYears: parseFloat(((birthUtcMs - currentAntarStartMs) / msPerYear).toFixed(4)),
            balanceYears: parseFloat(((aEndMs - birthUtcMs) / msPerYear).toFixed(4)),
            startDate: fmt(birthUtcMs),
            endDate: fmt(aEndMs),
          };
        }
      }

      currentAntarStartMs = aEndMs;
    }

    // Full Astronomical Mahadasha Period
    const mahaPeriodAstro: DashaPeriod = {
      lord: mDef.lord,
      lordName: mDef.name,
      startDate: fmt(currentMahaStartMs),
      endDate: fmt(mMahaEndMs),
      durationYears: parseFloat(mFullDurationYears.toFixed(4)),
      subPeriods: astroAntardashas,
      fullAstronomicalStartDate: fmt(currentMahaStartMs),
      fullAstronomicalEndDate: fmt(mMahaEndMs),
      isBirthActive: isFirstMaha,
      level: 1,
    };
    fullAstronomicalTree.push(mahaPeriodAstro);

    // Lifespan Mahadasha Period
    const mahaPeriodLifespan: DashaPeriod = {
      ...mahaPeriodAstro,
      startDate: fmt(isFirstMaha ? birthUtcMs : currentMahaStartMs),
      durationYears: parseFloat(
        ((mMahaEndMs - (isFirstMaha ? birthUtcMs : currentMahaStartMs)) / msPerYear).toFixed(4)
      ),
      elapsedBeforeBirthYears: isFirstMaha ? parseFloat(yearsElapsed.toFixed(4)) : undefined,
      subPeriods: lifespanAntardashas,
    };
    lifespanTree.push(mahaPeriodLifespan);

    currentMahaStartMs = mMahaEndMs;
  }

  const chosenTree = displayMode === 'full_astronomical' ? fullAstronomicalTree : lifespanTree;

  return {
    balanceAtBirth: balanceReport,
    activeAtBirth: activeAtBirthSummary,
    tree: chosenTree,
    fullAstronomicalTree,
    optionsUsed: {
      yearLength,
      seed,
      displayMode,
      yearDays,
    },
  };
}

export function parseDashaDate(dateStr: string): number {
  if (!dateStr) return NaN;
  if (dateStr.includes('T')) {
    return new Date(dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`).getTime();
  }
  if (dateStr.includes(' ')) {
    const [d, t] = dateStr.split(' ');
    const timeParts = t.split(':');
    const hh = (timeParts[0] || '00').padStart(2, '0');
    const mm = (timeParts[1] || '00').padStart(2, '0');
    const ss = (timeParts[2] || '00').padStart(2, '0');
    return new Date(`${d}T${hh}:${mm}:${ss}Z`).getTime();
  }
  return new Date(`${dateStr}T00:00:00Z`).getTime();
}

/**
 * Resolves currently active Mahadasha, Antardasha, Pratyantar, Sookshma, Prana, and Deha
 * for any target reference date, complete with classical Dasha Phala interpretation.
 */
export function getCurrentActiveDasha(
  tree: DashaPeriod[],
  targetDate: Date = new Date(),
  yearDays: number = 365.2425
): ActiveDashaHierarchy | null {
  const targetTime = targetDate.getTime();

  for (let m = 0; m < tree.length; m++) {
    const maha = tree[m];
    const mStart = parseDashaDate(maha.startDate);
    const mEnd = parseDashaDate(maha.endDate);

    if (targetTime >= mStart && targetTime < mEnd) {
      const mahaIdx = m;

      // 1. Find Antardasha
      let activeAntar = maha.subPeriods?.[0] || maha;
      let antarIdx = 0;
      if (maha.subPeriods && maha.subPeriods.length > 0) {
        for (let a = 0; a < maha.subPeriods.length; a++) {
          const antar = maha.subPeriods[a];
          const aStart = parseDashaDate(antar.startDate);
          const aEnd = parseDashaDate(antar.endDate);
          if (targetTime >= aStart && targetTime < aEnd) {
            activeAntar = antar;
            antarIdx = a;
            break;
          }
        }
      }

      // 2. Find Pratyantar
      let activePrat = activeAntar.subPeriods?.[0] || activeAntar;
      let pratIdx = 0;
      if (activeAntar.subPeriods && activeAntar.subPeriods.length > 0) {
        for (let p = 0; p < activeAntar.subPeriods.length; p++) {
          const prat = activeAntar.subPeriods[p];
          const pStart = parseDashaDate(prat.startDate);
          const pEnd = parseDashaDate(prat.endDate);
          if (targetTime >= pStart && targetTime < pEnd) {
            activePrat = prat;
            pratIdx = p;
            break;
          }
        }
      }

      // 3. Find Sookshma
      let activeSook = activePrat.subPeriods?.[0];
      let sookIdx = 0;
      if (activePrat.subPeriods && activePrat.subPeriods.length > 0) {
        for (let s = 0; s < activePrat.subPeriods.length; s++) {
          const sook = activePrat.subPeriods[s];
          const sStart = parseDashaDate(sook.startDate);
          const sEnd = parseDashaDate(sook.endDate);
          if (targetTime >= sStart && targetTime < sEnd) {
            activeSook = sook;
            sookIdx = s;
            break;
          }
        }
      }

      // 4. Compute & Find Level 5: Prāṇadaśā (प्राणदशा)
      let activePrana: DashaPeriod | undefined = undefined;
      let pranaIdx = 0;
      let activeDeha: DashaPeriod | undefined = undefined;
      let dehaIdx = 0;

      if (activeSook) {
        const pranaList = calculateSubPeriodsForPeriod(activeSook, 5);
        activeSook.subPeriods = pranaList;
        activePrana = pranaList[0];
        for (let pr = 0; pr < pranaList.length; pr++) {
          const pCandidate = pranaList[pr];
          const prStart = parseDashaDate(pCandidate.startDate);
          const prEnd = parseDashaDate(pCandidate.endDate);
          if (targetTime >= prStart && targetTime < prEnd) {
            activePrana = pCandidate;
            pranaIdx = pr;
            break;
          }
        }

        // 5. Compute & Find Level 6: Dehadaśā (देहदशा)
        if (activePrana) {
          const dehaList = calculateSubPeriodsForPeriod(activePrana, 6);
          activePrana.subPeriods = dehaList;
          activeDeha = dehaList[0];
          for (let d = 0; d < dehaList.length; d++) {
            const dCandidate = dehaList[d];
            const dStart = parseDashaDate(dCandidate.startDate);
            const dEnd = parseDashaDate(dCandidate.endDate);
            if (targetTime >= dStart && targetTime < dEnd) {
              activeDeha = dCandidate;
              dehaIdx = d;
              break;
            }
          }
        }
      }

      // Calculate Bhukta (Elapsed) and Bhogya (Remaining) for the Mahadasha
      const mTotalMs = Math.max(1000, mEnd - mStart);
      const elapsedMs = Math.max(0, targetTime - mStart);
      const remainingMs = Math.max(0, mEnd - targetTime);

      const bhuktaDays = Math.floor(elapsedMs / (1000 * 3600 * 24));
      const bhogyaDays = Math.floor(remainingMs / (1000 * 3600 * 24));

      const bhuktaYears = bhuktaDays / yearDays;
      const bhogyaYears = bhogyaDays / yearDays;

      const bhuktaYmd = yearsToYMD(bhuktaYears, yearDays);
      const bhogyaYmd = yearsToYMD(bhogyaYears, yearDays);

      const bhukta: DashaTimeSpan = {
        years: bhuktaYmd.years,
        months: bhuktaYmd.months,
        days: bhuktaYmd.days,
        totalDays: bhuktaDays,
        percentage: parseFloat(((elapsedMs / mTotalMs) * 100).toFixed(1)),
        formatted: bhuktaYmd.formatted,
      };

      const bhogya: DashaTimeSpan = {
        years: bhogyaYmd.years,
        months: bhogyaYmd.months,
        days: bhogyaYmd.days,
        totalDays: bhogyaDays,
        percentage: parseFloat(((remainingMs / mTotalMs) * 100).toFixed(1)),
        formatted: bhogyaYmd.formatted,
      };

      // Daśā Sandhi check: ±6 months (182.5 days) from Mahadasha transition
      const sixMonthsMs = (yearDays / 2) * 24 * 3600 * 1000;
      let isSandhi = false;
      let sandhiDetails: ActiveDashaHierarchy['sandhiDetails'] = undefined;

      if (remainingMs <= sixMonthsMs && m < tree.length - 1) {
        const nextMaha = tree[m + 1];
        isSandhi = true;
        sandhiDetails = {
          leavingLord: maha.lord,
          enteringLord: nextMaha.lord,
          sandhiStartDate: formatDashaDate(new Date(mEnd - sixMonthsMs)),
          sandhiEndDate: formatDashaDate(new Date(mEnd + sixMonthsMs)),
          warning: `Daśā Sandhi (Transition Cusp): ${maha.lordName} Mahādaśā is concluding in ${bhogya.months}m ${bhogya.days}d. Karmic tides are shifting toward ${nextMaha.lordName}. Major life reorientation or structural transitions are standard in this junction.`,
        };
      } else if (elapsedMs <= sixMonthsMs && m > 0) {
        const prevMaha = tree[m - 1];
        isSandhi = true;
        sandhiDetails = {
          leavingLord: prevMaha.lord,
          enteringLord: maha.lord,
          sandhiStartDate: formatDashaDate(new Date(mStart - sixMonthsMs)),
          sandhiEndDate: formatDashaDate(new Date(mStart + sixMonthsMs)),
          warning: `Daśā Sandhi (Entry Cusp): Fresh entry into ${maha.lordName} Mahādaśā from ${prevMaha.lordName}. Karmic patterns from the previous 120-year cycle branch are stabilizing.`,
        };
      }

      // Classical Dasha Phala Synthesis per BPHS & Phaladeepika
      const phala = getClassicalDashaPhala(maha.lord, activeAntar.lord);

      return {
        mahadasha: maha,
        antardasha: activeAntar,
        pratyantardasha: activePrat,
        sookshmadasha: activeSook,
        pranadasha: activePrana,
        dehadasha: activeDeha,
        activePathIndices: {
          mahaIdx,
          antarIdx,
          pratIdx,
          sookIdx,
          pranaIdx,
          dehaIdx,
        },
        bhukta,
        bhogya,
        isSandhiActive: isSandhi,
        sandhiDetails,
        phala,
      };
    }
  }

  return null;
}

/**
 * Computes 9 classical sub-periods for any given parent DashaPeriod.
 * Works seamlessly for Pratyantardashas, Sūkṣmadaśās, Prāṇadaśās (Level 5), and Dehadaśās (Level 6).
 */
export function calculateSubPeriodsForPeriod(
  parentPeriod: DashaPeriod,
  level: number = 5
): DashaPeriod[] {
  const parentLord = parentPeriod.lord;
  const startSeqIndex = VIMSHOTTARI_SEQUENCE.findIndex((s) => s.lord === parentLord);
  const parentStart = parseDashaDate(parentPeriod.startDate);
  const parentEnd = parseDashaDate(parentPeriod.endDate);
  const totalMs = Math.max(1000, parentEnd - parentStart);
  const includeTime = level >= 5;

  const subPeriods: DashaPeriod[] = [];
  let currentMs = parentStart;

  for (let i = 0; i < 9; i++) {
    const seqIndex = (startSeqIndex + i) % 9;
    const def = VIMSHOTTARI_SEQUENCE[seqIndex];
    // Proportion: def.years / 120
    const durationMs = (totalMs * def.years) / 120.0;
    const sStart = new Date(currentMs);
    const sEnd = new Date(currentMs + durationMs);

    subPeriods.push({
      lord: def.lord,
      lordName: def.name,
      startDate: formatDashaDate(sStart, includeTime),
      endDate: formatDashaDate(sEnd, includeTime),
      durationYears: parseFloat(((parentPeriod.durationYears * def.years) / 120.0).toFixed(6)),
      level,
    });

    currentMs += durationMs;
  }

  return subPeriods;
}

export function formatDashaDate(date: Date, includeTime: boolean = false): string {
  const y = date.getUTCFullYear();
  const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = date.getUTCDate().toString().padStart(2, '0');
  if (!includeTime) {
    return `${y}-${m}-${d}`;
  }
  const hh = date.getUTCHours().toString().padStart(2, '0');
  const mm = date.getUTCMinutes().toString().padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

export function formatDate(date: Date): string {
  return formatDashaDate(date, false);
}

export function formatDateTime(date: Date): string {
  return formatDashaDate(date, true);
}

/**
 * Classical Dasha Phala Synthesis per BPHS Chapters 51-60 and Phaladīpikā Chapters 20-22.
 */
export function getClassicalDashaPhala(
  mahaLord: PlanetId,
  antarLord: PlanetId
): ActiveDashaHierarchy['phala'] {
  const normMaha = (mahaLord === 'true_rahu' ? 'rahu' : mahaLord === 'true_ketu' ? 'ketu' : mahaLord) as PlanetId;
  const normAntar = (antarLord === 'true_rahu' ? 'rahu' : antarLord === 'true_ketu' ? 'ketu' : antarLord) as PlanetId;

  const MAHA_PHALA: Partial<Record<PlanetId, { title: string; effects: string }>> = {
    sun: {
      title: 'Sūrya Mahādaśā (६ वर्ष)',
      effects: 'Governs vital solar fire, sovereign authority, career elevation, and paternal karma. If dignified, brings administrative recognition, high status, and spiritual illumination. If afflicted, provokes bilious heat, ocular strain, or friction with authority.',
    },
    moon: {
      title: 'Candra Mahādaśā (१० वर्ष)',
      effects: 'Governs emotional equilibrium, public acclaim, maternal affection, and mental vitality. Brings creative breakthroughs, overseas travel, and social popularity. If afflicted, causes restlessness, psychosomatic vulnerability, or fluctuations in fortune.',
    },
    mars: {
      title: 'Maṅgala Mahādaśā (७ वर्ष)',
      effects: 'Governs enterprise, executive vigor, technical mastery, real estate holdings, and martial courage. Catalyzes bold breakthroughs, property acquisition, and athletic triumphs. If afflicted, brings surgical risks, inflammatory heat, or impulsive disputes.',
    },
    rahu: {
      title: 'Rāhu Mahādaśā (१८ वर्ष)',
      effects: 'Governs ambitious expansions, foreign networks, out-of-the-box technological ascents, and systemic transformation. Can catapult the native to unprecedented heights in unconventional fields. If afflicted, provokes anxieties, illusions, or sudden reversals.',
    },
    jupiter: {
      title: 'Guru Mahādaśā (१६ वर्ष)',
      effects: 'The premier period for wisdom, dharmic expansions, financial prosperity, progeny, and institutional honors. Bestows moral clarity, scholarly achievements, and societal veneration. If afflicted, prompts overextension, metabolic excess, or dogmatic friction.',
    },
    saturn: {
      title: 'Śani Mahādaśā (१९ वर्ष)',
      effects: 'The foundational crucible of discipline, endurance, organizational mastery, and karmic consolidation. Rewards patient tenacity with unshakeable long-term standing. If afflicted, demands perseverance through delays, heavy responsibilities, and somatic fatigue.',
    },
    mercury: {
      title: 'Budha Mahādaśā (१७ वर्ष)',
      effects: 'Governs intellectual acumen, commercial enterprise, analytical eloquence, and strategic communications. Facilitates mercantile growth, academic mastery, and thriving social dialogues. If afflicted, prompts nervous tension, indecision, or deceptive contracts.',
    },
    ketu: {
      title: 'Ketu Mahādaśā (७ वर्ष)',
      effects: 'Governs spiritual liberation, intuitive discernment, research penetration, and detachment from material vanity. Awakes deep inner contemplation, metaphysical breakthroughs, and occult insight. If afflicted, causes sudden disconnections, ambiguity, or diagnostic perplexities.',
    },
    venus: {
      title: 'Śukra Mahādaśā (२० वर्ष)',
      effects: 'Governs aesthetic splendor, romantic fulfillment, marital harmony, artistic creativity, and material opulence. Brings marital unions, vehicular acquisition, and refined luxuries. If afflicted, prompts sensual overindulgence, financial extravagance, or urinary-reproductive ailments.',
    },
  };

  const ANTAR_RELATION_PHALA: Record<string, string> = {
    // Same planet (Sva-Bhukti)
    'sun-sun': 'Sva-Bhukti: Concentrated solar emergence; self-redefinition, recognition from patrons, and heightened metabolic drive.',
    'moon-moon': 'Sva-Bhukti: Heightened mental sensitivity, flourishing domestic comforts, and public affinity.',
    'mars-mars': 'Sva-Bhukti: Raw dynamic surge; decisive initiatives, property focus, and intense physical energy.',
    'rahu-rahu': 'Sva-Bhukti: Unconventional beginnings; sudden shifts in environment, foreign intrigue, and high ambition.',
    'jupiter-jupiter': 'Sva-Bhukti: Dharmic elevation; intellectual expansion, virtuous undertakings, and divine grace.',
    'saturn-saturn': 'Sva-Bhukti: Karmic baseline establishment; serious focus, consolidation of foundations, and frugal discipline.',
    'mercury-mercury': 'Sva-Bhukti: Mental agility, commercial trade, writing, and rapid analytical accomplishments.',
    'ketu-ketu': 'Sva-Bhukti: Ascetic detachment, psychic sensitivity, inward contemplation, and release of obsolete structures.',
    'venus-venus': 'Sva-Bhukti: Flowering of beauty, material acquisitions, romantic pleasures, and artistic pursuits.',
  };

  const mInfo = MAHA_PHALA[normMaha] || { title: `${mahaLord} Mahādaśā`, effects: 'Planetary period active.' };
  const aInfo = MAHA_PHALA[normAntar] || { title: `${antarLord} Antardaśā`, effects: 'Sub-period active.' };

  const pairKey = `${normMaha}-${normAntar}`;
  const customNote = ANTAR_RELATION_PHALA[pairKey];

  const combinedSynthesis = customNote || (
    normMaha === normAntar
      ? `Primary Sva-Bhukti (Autonomous Period): Direct unadulterated expression of ${mInfo.title}. The planetary archetype operates at maximum individual clarity.`
      : `Sub-period of ${aInfo.title} within ${mInfo.title}: Blends the foundational overarching field of ${mInfo.title} with the focused triggering mechanism of ${aInfo.title}. Manifestations crystallize in domains mutually governed by both planetary lords.`
  );

  return {
    mahaTitle: mInfo.title,
    mahaEffects: mInfo.effects,
    antarTitle: aInfo.title,
    antarEffects: aInfo.effects,
    combinedSynthesis,
    classicalSource: 'BPHS Ch. 51–60 (Bhuktiphala) & Phaladīpikā Ch. 20–22 (Daśāntara-vicāra)',
  };
}

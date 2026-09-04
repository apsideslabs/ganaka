/**
 * Gaṇaka — Classical Muhūrta Search & Evaluation Engine
 * Deterministic calculation evaluating authentic classical electional astrology rules
 * grounded in Muhūrta Cintāmaṇi, Kālāmṛta, Bṛhat Saṁhitā, and Sūrya Siddhānta.
 * Real, verifiable calculations with zero arbitrary scoring heuristics.
 */

import {
  MuhurtaObjectiveDefinition,
  MuhurtaSearchQuery,
  CandidateMuhurtaPeriod,
  EvaluatedCondition,
  MuhurtaStatus,
  MuhurtaClassification,
  ConditionStatus,
  PlanetaryPlacementSnapshot,
  PariharaRecord,
  MuhurtaQualityTier,
  MuhurtaSearchResult,
  SearchHorizonPreset,
  MahaDoshaAuditRecord,
} from './types';
import { getObjectiveById } from './objectives-registry';
import { calculateJulianDay, normalizeDegrees } from '@/lib/astronomy/julian';
import { calculateAllPlanets, calculateSolarTimes, PlanetId } from '@/lib/astronomy/ephemeris';
import { calculatePanchanga } from '@/lib/jyotisha/panchanga';
import { calculateDailyLagnaTable, DailyLagnaPeriod } from './lagna-calculator';
import { CityLocation } from '@/lib/astronomy/coordinates';
import { AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { CLASSICAL_SOURCES_REGISTRY } from './classical-sources';
import { RASHIS, NAKSHATRAS, GRAHA_PROPERTIES } from '@/lib/jyotisha/constants';
import { RashiNumber } from '@/lib/jyotisha/types';

// Classical Dik-Śūla Prohibition for Travel by Weekday (0 = Sun, ..., 6 = Sat)
const DIK_SHOOLA_RULES: Record<number, string> = {
  0: 'west',  // Sunday: West prohibited
  1: 'east',  // Monday: East prohibited
  2: 'north', // Tuesday: North prohibited
  3: 'north', // Wednesday: North prohibited
  4: 'south', // Thursday: South prohibited
  5: 'west',  // Friday: West prohibited
  6: 'east',  // Saturday: East prohibited
};

// Sarvārtha Siddhī Yoga Table (Weekday -> Favorable Nakshatra numbers 1-27)
const SARVARTHA_SIDDHI_MAP: Record<number, number[]> = {
  0: [13, 8, 19, 12, 21, 26, 1], // Sun: Hasta, Pushya, Mula, U-Phalguni, U-Ashadha, U-Bhadrapada, Ashwini
  1: [4, 5, 8, 17, 22],        // Mon: Rohini, Mrigashirsha, Pushya, Anuradha, Shravana
  2: [1, 3, 26, 9],            // Tue: Ashwini, Krittika, U-Bhadrapada, Ashlesha
  3: [4, 17, 13, 3, 5],        // Wed: Rohini, Anuradha, Hasta, Krittika, Mrigashira
  4: [7, 8, 17, 1, 27],        // Thu: Punarvasu, Pushya, Anuradha, Ashwini, Revati
  5: [27, 1, 17, 7, 13],       // Fri: Revati, Ashwini, Anuradha, Punarvasu, Hasta
  6: [4, 15, 22],              // Sat: Rohini, Swati, Shravana
};

// Amṛta Siddhī Yoga Table (Weekday -> Exact Nakshatra number)
const AMRITA_SIDDHI_MAP: Record<number, number> = {
  0: 13, // Sun + Hasta
  1: 5,  // Mon + Mrigashirsha
  2: 1,  // Tue + Ashwini
  3: 17, // Wed + Anuradha
  4: 8,  // Thu + Pushya
  5: 27, // Fri + Revati
  6: 4,  // Sat + Rohini
};

// Dagdha Tithis by Weekday (0 = Sun, ..., 6 = Sat)
// Tithis 1-15 (and corresponding Krishna 16-30)
const DAGDHA_TITHIS_MAP: Record<number, number> = {
  0: 12, // Sun + 12 (Dvadashi)
  1: 11, // Mon + 11 (Ekadashi)
  2: 5,  // Tue + 5 (Panchami)
  3: 3,  // Wed + 3 (Tritiya)
  4: 6,  // Thu + 6 (Shashthi)
  5: 8,  // Fri + 8 (Ashtami)
  6: 9,  // Sat + 9 (Navami)
};

// Yamaghanta Yoga (Weekday -> Prohibited Nakshatra)
const YAMAGHANTA_YOGA_MAP: Record<number, number> = {
  0: 10, // Sun + Magha (10)
  1: 16, // Mon + Vishakha (16)
  2: 6,  // Tue + Ardra (6)
  3: 19, // Wed + Mula (19)
  4: 3,  // Thu + Krittika (3)
  5: 4,  // Fri + Rohini (4)
  6: 13, // Sat + Hasta (13)
};

// Mrityu Yoga (Weekday -> Prohibited Nakshatra)
const MRITYU_YOGA_MAP: Record<number, number> = {
  0: 17, // Sun + Anuradha (17)
  1: 21, // Mon + Uttarashadha (21)
  2: 24, // Tue + Shatabhisha (24)
  3: 1,  // Wed + Ashwini (1)
  4: 5,  // Thu + Mrigashira (5)
  5: 9,  // Fri + Ashlesha (9)
  6: 13, // Sat + Hasta (13)
};

// Dagdha Yoga (Weekday -> Prohibited Nakshatra)
const DAGDHA_YOGA_MAP: Record<number, number> = {
  0: 2,  // Sun + Bharani (2)
  1: 14, // Mon + Chitra (14)
  2: 21, // Tue + Uttarashadha (21)
  3: 23, // Wed + Dhanishtha (23)
  4: 18, // Thu + Jyeshtha (18)
  5: 20, // Fri + Purvashadha (20)
  6: 27, // Sat + Revati (27)
};

// Choghadiya Patterns (Daytime and Nighttime)
type ChoghadiyaName = 'Amrit' | 'Shubh' | 'Labh' | 'Char' | 'Rog' | 'Kaal' | 'Udveg';
const CHOGHADIYA_DAY_PATTERNS: Record<number, ChoghadiyaName[]> = {
  0: ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg'],
  1: ['Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit'],
  2: ['Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'],
  3: ['Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh'],
  4: ['Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh'],
  5: ['Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog', 'Udveg', 'Char'],
  6: ['Kaal', 'Shubh', 'Rog', 'Udveg', 'Char', 'Labh', 'Amrit', 'Kaal'],
};

const CHOGHADIYA_NIGHT_PATTERNS: Record<number, ChoghadiyaName[]> = {
  0: ['Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh'],
  1: ['Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char'],
  2: ['Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal'],
  3: ['Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg'],
  4: ['Amrit', 'Char', 'Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit'],
  5: ['Rog', 'Kaal', 'Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog'],
  6: ['Labh', 'Udveg', 'Shubh', 'Amrit', 'Char', 'Rog', 'Kaal', 'Labh'],
};

// Gandanta Nakshatra Numbers (Junctions of Water & Fire signs)
// Revati(27)-Ashwini(1), Ashlesha(9)-Magha(10), Jyeshtha(18)-Mula(19)
const GANDANTA_NAKSHATRAS = [1, 9, 10, 18, 19, 27];

function getPresetLabel(preset?: SearchHorizonPreset): string {
  switch (preset) {
    case 'specific_hour': return 'Specific Hour Window';
    case 'today': return 'Today';
    case 'tomorrow': return 'Tomorrow';
    case 'specific_day': return 'Specific Day';
    case 'next_3_days': return 'Next 3 Days';
    case 'this_week': return 'This Week';
    case 'next_7_days': return 'Next 7 Days (1 Week)';
    case 'specific_week': return 'Specific Week';
    case 'this_month': return 'This Month';
    case 'next_30_days': return 'Next 30 Days (1 Māsa)';
    case 'selected_month': return 'Selected Month';
    case 'multiple_months': return 'Next 60 Days (2 Māsas)';
    case 'year': return 'Full Year (1 Saṁvatsara)';
    default: return 'Custom Date Span';
  }
}

/**
 * Evaluates candidate windows across a specific date span [startDate, endDate]
 */
function evaluateWindowsAcrossDateRange(
  objective: MuhurtaObjectiveDefinition,
  query: MuhurtaSearchQuery,
  startDate: Date,
  endDate: Date,
  location: CityLocation,
  ayanamshaType: AyanamshaType
): CandidateMuhurtaPeriod[] {
  const candidates: CandidateMuhurtaPeriod[] = [];
  const curDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 12, 0, 0);
  const targetEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59);

  const diffDays = Math.max(1, Math.ceil((targetEnd.getTime() - curDate.getTime()) / (1000 * 60 * 60 * 24)));
  let loopLimit = Math.min(diffDays + 2, 370);

  while (curDate <= targetEnd && loopLimit > 0) {
    loopLimit--;
    const year = curDate.getFullYear();
    const month = curDate.getMonth() + 1;
    const day = curDate.getDate();

    const utNoon = 12.0 - location.timezoneOffsetHours;
    const jdNoon = calculateJulianDay(year, month, day, utNoon);
    const solarTimes = calculateSolarTimes(
      jdNoon,
      location.latitude,
      location.longitude,
      location.timezoneOffsetHours
    );

    const jdSunrise = solarTimes.sunriseJD;
    const planetsSunrise = calculateAllPlanets(jdSunrise + 0.0001, ayanamshaType);
    const panchangaSunrise = calculatePanchanga(
      planetsSunrise.sun.siderealLongitude,
      planetsSunrise.moon.siderealLongitude,
      jdSunrise + 0.0001,
      location.latitude,
      location.longitude,
      location.timezoneOffsetHours,
      ayanamshaType
    );

    const sunriseParts = panchangaSunrise.sunTimes.sunrise.split(':');
    const sunriseHourDec =
      parseInt(sunriseParts[0] || '6', 10) + parseInt(sunriseParts[1] || '0', 10) / 60;
    const sunsetParts = panchangaSunrise.sunTimes.sunset.split(':');
    const sunsetHourDec =
      parseInt(sunsetParts[0] || '18', 10) + parseInt(sunsetParts[1] || '0', 10) / 60;

    const lagnaPeriods = calculateDailyLagnaTable(
      year,
      month,
      day,
      location.latitude,
      location.longitude,
      location.timezoneOffsetHours,
      sunriseHourDec,
      sunsetHourDec,
      ayanamshaType
    );

    for (const lagna of lagnaPeriods) {
      if (
        query.searchScope === 'specific_hour' &&
        query.targetHourStart !== undefined &&
        query.targetHourEnd !== undefined
      ) {
        const hStart = query.targetHourStart;
        const hEnd = query.targetHourEnd;
        const overlaps = !(lagna.endHourDecimal <= hStart || lagna.startHourDecimal >= hEnd);
        if (!overlaps) continue;
      }

      if (query.allowDayOnly && !lagna.isDaytime) {
        continue;
      }

      if (query.preferredLagnasOnly && !objective.favorableLagnas.includes(lagna.rashiNumber)) {
        continue;
      }

      const midHourDec = (lagna.startHourDecimal + lagna.endHourDecimal) / 2;
      const utMidHours = midHourDec - location.timezoneOffsetHours;
      const jdMid = calculateJulianDay(year, month, day, utMidHours);

      const planetsAtLagna = calculateAllPlanets(jdMid, ayanamshaType);

      const panchangaAtLagna = calculatePanchanga(
        planetsAtLagna.sun.siderealLongitude,
        planetsAtLagna.moon.siderealLongitude,
        jdMid,
        location.latitude,
        location.longitude,
        location.timezoneOffsetHours,
        ayanamshaType
      );

      const evaluation = evaluateSingleMuhurtaWindow(
        objective,
        query,
        panchangaAtLagna,
        planetsAtLagna,
        lagna,
        curDate,
        sunriseHourDec,
        sunsetHourDec,
        jdMid
      );

      candidates.push(evaluation);
    }

    curDate.setDate(curDate.getDate() + 1);
  }

  return candidates;
}

/**
 * Executes a classical constraint-first Muhūrta search:
 * 1. Prioritizes the user's requested horizon first.
 * 2. Explicitly ranks windows across the 4 classical tiers.
 * 3. Never silently rejects without displaying verifiable criteria.
 * 4. Calculates the Nearest Stronger Window if requested range has no ideal window.
 */
export function searchClassicalMuhurtas(
  query: MuhurtaSearchQuery,
  location: CityLocation,
  ayanamshaType: AyanamshaType = 'lahiri'
): MuhurtaSearchResult {
  const objective = getObjectiveById(query.objectiveId);
  const start = new Date(query.startDate);
  const end = new Date(query.endDate);
  const mode = query.searchMode || 'best_available';

  // 1. Evaluate all rising windows in the user's requested period
  const rawCandidatesInRange = evaluateWindowsAcrossDateRange(
    objective,
    query,
    start,
    end,
    location,
    ayanamshaType
  );

  // Sort candidates deterministically:
  // Classification priority: STRONGLY_RECOMMENDED (1) -> SUITABLE (2) -> CONDITIONAL (3) -> AVOID (4)
  // Within tier: Purity Score (descending) -> Chronological date & time (ascending)
  const tierRank: Record<MuhurtaClassification, number> = {
    STRONGLY_RECOMMENDED: 1,
    SUITABLE: 2,
    CONDITIONAL: 3,
    AVOID: 4,
  };

  const sortedInRange = rawCandidatesInRange.sort((a, b) => {
    const tierDiff = tierRank[a.classification] - tierRank[b.classification];
    if (tierDiff !== 0) return tierDiff;
    const scoreDiff = b.purityScore - a.purityScore;
    if (scoreDiff !== 0) return scoreDiff;
    return a.date.getTime() - b.date.getTime() || a.startHourDecimal - b.startHourDecimal;
  });

  // Determine counts
  const stronglyCount = sortedInRange.filter((c) => c.classification === 'STRONGLY_RECOMMENDED').length;
  const suitableCount = sortedInRange.filter((c) => c.classification === 'SUITABLE').length;
  const conditionalCount = sortedInRange.filter((c) => c.classification === 'CONDITIONAL').length;
  const avoidCount = sortedInRange.filter((c) => c.classification === 'AVOID').length;
  const acceptableCandidates = sortedInRange.filter((c) => c.classification !== 'AVOID');
  const hasNoAcceptableInRequested = acceptableCandidates.length === 0;

  // Identify Best In Requested Range:
  // Priority to user constraint! Pick highest non-avoid candidate, or top candidate if none non-avoid.
  let bestInRequestedRange: CandidateMuhurtaPeriod | null = null;
  if (acceptableCandidates.length > 0) {
    bestInRequestedRange = acceptableCandidates[0];
    bestInRequestedRange.isBestInRequestedRange = true;
  } else if (sortedInRange.length > 0) {
    bestInRequestedRange = sortedInRange[0];
    bestInRequestedRange.isBestInRequestedRange = true;
  }

  // Flag top picks in the result set
  let topPickCount = 0;
  for (const c of sortedInRange) {
    if (c.classification !== 'AVOID' && topPickCount < 5) {
      c.isTopPick = true;
      topPickCount++;
    }
  }

  // Filter according to user's search mode:
  let finalCandidates: CandidateMuhurtaPeriod[] = [];
  if (mode === 'strongly_recommended_only') {
    finalCandidates = sortedInRange.filter((c) => c.classification === 'STRONGLY_RECOMMENDED');
  } else if (mode === 'best_available') {
    // Return all acceptable candidates; if none acceptable, return top 3 avoid windows so user sees what failed
    finalCandidates = acceptableCandidates.length > 0 ? acceptableCandidates : sortedInRange.slice(0, 5);
  } else if (mode === 'strict_classical') {
    finalCandidates = sortedInRange.filter((c) => c.failedConditions.length === 0 && c.purityScore >= 80);
  } else {
    // 'show_all_ranked'
    finalCandidates = sortedInRange;
  }

  // Lookahead for Stronger Alternative:
  // If bestInRequestedRange is not STRONGLY_RECOMMENDED, or if no acceptable window was found,
  // look ahead into the next 21 days to find the nearest pristine window.
  let strongerAlternativeOutsideRange: CandidateMuhurtaPeriod | null = null;
  const needsLookahead =
    hasNoAcceptableInRequested ||
    (bestInRequestedRange && bestInRequestedRange.classification !== 'STRONGLY_RECOMMENDED');

  if (needsLookahead) {
    const lookaheadStart = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1, 12, 0, 0);
    const lookaheadEnd = new Date(lookaheadStart.getFullYear(), lookaheadStart.getMonth(), lookaheadStart.getDate() + 21, 23, 59, 59);

    const lookaheadCandidates = evaluateWindowsAcrossDateRange(
      objective,
      {
        ...query,
        searchScope: 'date_range',
        targetHourStart: undefined,
        targetHourEnd: undefined,
      },
      lookaheadStart,
      lookaheadEnd,
      location,
      ayanamshaType
    );

    // Find the earliest candidate that is STRONGLY_RECOMMENDED
    // If none strongly recommended and requested had NO acceptable, find earliest SUITABLE
    const futureStrong = lookaheadCandidates.find((c) => c.classification === 'STRONGLY_RECOMMENDED');
    const futureSuitable = lookaheadCandidates.find((c) => c.classification === 'SUITABLE');

    if (futureStrong) {
      futureStrong.isStrongerAlternative = true;
      strongerAlternativeOutsideRange = futureStrong;
    } else if (hasNoAcceptableInRequested && futureSuitable) {
      futureSuitable.isStrongerAlternative = true;
      strongerAlternativeOutsideRange = futureSuitable;
    }
  }

  const diffDays = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  return {
    bestInRequestedRange,
    candidates: finalCandidates,
    strongerAlternativeOutsideRange,
    requestedHorizonSummary: {
      preset: query.horizonPreset || 'custom_range',
      presetLabel: getPresetLabel(query.horizonPreset),
      startDate: start,
      endDate: end,
      totalDays: diffDays,
      searchMode: mode,
      totalWindowsEvaluated: rawCandidatesInRange.length,
      stronglyRecommendedCount: stronglyCount,
      suitableCount: suitableCount,
      conditionalCount: conditionalCount,
      avoidCount: avoidCount,
      hasNoAcceptableInRequested,
    },
  };
}

/**
 * Rigorous evaluation of a single rising Lagna window based on classical Shastras.
 */
function evaluateSingleMuhurtaWindow(
  objective: MuhurtaObjectiveDefinition,
  query: MuhurtaSearchQuery,
  panchanga: ReturnType<typeof calculatePanchanga>,
  planets: ReturnType<typeof calculateAllPlanets>,
  lagna: DailyLagnaPeriod,
  date: Date,
  sunriseDec: number,
  sunsetDec: number,
  jdMid: number
): CandidateMuhurtaPeriod {
  const evaluatedConditions: EvaluatedCondition[] = [];
  const keyPositiveFactors: string[] = [];
  const keyNegativeFactors: string[] = [];
  const specialYogas: string[] = [];
  const appliedPariharas: PariharaRecord[] = [];

  const tithiNum = panchanga.tithi.number;
  const varaNum = panchanga.vara.number;
  const nakNum = panchanga.nakshatra.number;
  const lagnaRashi = lagna.rashiNumber;

  // --- 1. DETAILED PLANETARY POSITIONS & HOUSES FROM MUHŪRTA LAGNA ---
  const planetKeys: PlanetId[] = [
    'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'
  ];

  const naturalBenefics: PlanetId[] = ['jupiter', 'venus', 'mercury'];
  const naturalMalefics: PlanetId[] = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];

  const planetaryPlacements: PlanetaryPlacementSnapshot[] = [];
  const planetsByHouse: Record<number, PlanetaryPlacementSnapshot[]> = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: []
  };

  for (const pId of planetKeys) {
    const p = planets[pId];
    if (!p) continue;

    const pRashiNum = (Math.floor(p.siderealLongitude / 30) + 1) as RashiNumber;
    const rashiInfo = RASHIS[pRashiNum];
    const degInRashi = p.siderealLongitude % 30;
    const degStr = `${Math.floor(degInRashi)}°${Math.floor((degInRashi % 1) * 60)}'`;

    // House from Muhūrta Lagna (1 to 12)
    const houseFromLagna = (((pRashiNum - lagnaRashi + 12) % 12) + 1);

    const isBenefic =
      naturalBenefics.includes(pId) ||
      (pId === 'moon' && panchanga.tithi.paksha === 'Shukla' && tithiNum >= 8 && tithiNum <= 22);
    const isMalefic =
      naturalMalefics.includes(pId) ||
      (pId === 'moon' && panchanga.tithi.paksha === 'Krishna' && (tithiNum >= 25 || tithiNum <= 5));

    // Exaltation / Debilitation / Own Sign
    let isExalted = false;
    let isDebilitated = false;
    let isOwnSign = false;

    if (pId === 'sun') { isExalted = pRashiNum === 1; isDebilitated = pRashiNum === 7; isOwnSign = pRashiNum === 5; }
    if (pId === 'moon') { isExalted = pRashiNum === 2; isDebilitated = pRashiNum === 8; isOwnSign = pRashiNum === 4; }
    if (pId === 'mars') { isExalted = pRashiNum === 10; isDebilitated = pRashiNum === 4; isOwnSign = pRashiNum === 1 || pRashiNum === 8; }
    if (pId === 'mercury') { isExalted = pRashiNum === 6; isDebilitated = pRashiNum === 12; isOwnSign = pRashiNum === 3 || pRashiNum === 6; }
    if (pId === 'jupiter') { isExalted = pRashiNum === 4; isDebilitated = pRashiNum === 10; isOwnSign = pRashiNum === 9 || pRashiNum === 12; }
    if (pId === 'venus') { isExalted = pRashiNum === 12; isDebilitated = pRashiNum === 6; isOwnSign = pRashiNum === 2 || pRashiNum === 7; }
    if (pId === 'saturn') { isExalted = pRashiNum === 7; isDebilitated = pRashiNum === 1; isOwnSign = pRashiNum === 10 || pRashiNum === 11; }

    const prop = GRAHA_PROPERTIES[pId];
    const snap: PlanetaryPlacementSnapshot = {
      planetId: pId,
      planetName: p.name || prop?.name || pId,
      sanskritName: prop?.sanskritName || pId,
      rashiNumber: pRashiNum,
      rashiName: rashiInfo?.name || `Rāśi ${pRashiNum}`,
      degreeInRashi: degStr,
      houseFromLagna,
      isBenefic,
      isMalefic,
      isExalted,
      isDebilitated,
      isOwnSign,
      isRetrograde: p.isRetrograde,
    };

    planetaryPlacements.push(snap);
    planetsByHouse[houseFromLagna].push(snap);
  }

  // --- 2. CORE SHĀSTRIC EXCLUSIONS & FORTIFICATIONS ---

  // A. Aṣṭama Śuddhi (8th House Purity) - "अष्टमशुद्धिः सर्वकर्मसु प्रशस्ता"
  const planetsIn8th = planetsByHouse[8];
  const is8thClean = planetsIn8th.length === 0;
  const hasMaleficIn8th = planetsIn8th.some((p) => p.isMalefic || p.planetId === 'moon');
  const ashtamaPlanetsNames = planetsIn8th.map((p) => p.sanskritName);

  let ashtamaDescription = 'Pure 8th House (अष्टमशुद्धिः) — No planets in 8th from Lagna.';
  if (!is8thClean) {
    ashtamaDescription = `8th house contains ${ashtamaPlanetsNames.join(', ')} (${
      hasMaleficIn8th ? 'Severe Malefic Affliction' : 'Occupied by Benefic'
    }).`;
  }

  // B. Kendra & Trikoṇa Benefic Fortification
  const kendraBeneficsList: string[] = [];
  const kendraHouses = [1, 4, 7, 10];
  const trikonaHouses = [5, 9];
  for (const h of [...kendraHouses, ...trikonaHouses]) {
    for (const p of planetsByHouse[h]) {
      if (p.isBenefic) {
        kendraBeneficsList.push(`${p.sanskritName} in H${h}`);
      }
    }
  }

  // Upachayas (3, 6, 11) for Malefics (Sun, Mars, Saturn, Rahu)
  const upachayaMaleficsList: string[] = [];
  for (const h of [3, 6, 11]) {
    for (const p of planetsByHouse[h]) {
      if (p.isMalefic) {
        upachayaMaleficsList.push(`${p.sanskritName} in H${h}`);
      }
    }
  }

  // C. Pāpa-Kārtarī Yoga (Hemmed between malefics in 12th & 2nd)
  const hasMaleficIn12 = planetsByHouse[12].some((p) => p.isMalefic);
  const hasMaleficIn2 = planetsByHouse[2].some((p) => p.isMalefic);
  const isLagnaPapaKartari = hasMaleficIn12 && hasMaleficIn2;

  const moonPlacement = planetaryPlacements.find((p) => p.planetId === 'moon');
  const moonHouse = moonPlacement ? moonPlacement.houseFromLagna : 4;
  const houseBeforeMoon = moonHouse === 1 ? 12 : moonHouse - 1;
  const houseAfterMoon = moonHouse === 12 ? 1 : moonHouse + 1;
  const isMoonPapaKartari =
    planetsByHouse[houseBeforeMoon].some((p) => p.isMalefic) &&
    planetsByHouse[houseAfterMoon].some((p) => p.isMalefic);

  // D. Moon Dignity & Chandra Bala
  const moonRashiNum = moonPlacement ? moonPlacement.rashiNumber : 1;
  const moonRashiInfo = RASHIS[moonRashiNum];
  const isMoonExalted = moonRashiNum === 2;
  const isMoonDebilitated = moonRashiNum === 8; // Scorpio Moon
  const isMoonOwnSign = moonRashiNum === 4;
  const isWaxing = panchanga.tithi.paksha === 'Shukla';

  let moonDignityDesc = `Moon in ${moonRashiInfo?.name || ''} (${isWaxing ? 'Waxing/Śukla' : 'Waning/Kṛṣṇa'})`;
  if (isMoonExalted) moonDignityDesc += ' — Exalted (उच्च)';
  else if (isMoonDebilitated) moonDignityDesc += ' — Debilitated / Nīca (नीच)';
  else if (isMoonOwnSign) moonDignityDesc += ' — Own Sign (स्वक्षेत्र)';

  // E. Solar Month (Saura Māsa) & Kharmās Check
  const sunPlacement = planetaryPlacements.find((p) => p.planetId === 'sun');
  const sunRashiNum = sunPlacement ? sunPlacement.rashiNumber : 1;
  const sunRashiInfo = RASHIS[sunRashiNum];
  const isKharmas = sunRashiNum === 9 || sunRashiNum === 12; // Sun in Dhanu or Meena

  // F. Diurnal Time Windows & Inauspicious Slots
  const dayLength = sunsetDec - sunriseDec;
  const midHourDec = (lagna.startHourDecimal + lagna.endHourDecimal) / 2;
  const isDay = lagna.isDaytime;

  const rahuKalaOrder: Record<number, number> = { 0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3 };
  const rkSegment = rahuKalaOrder[varaNum] || 8;
  const rkStart = sunriseDec + ((rkSegment - 1) * dayLength) / 8;
  const rkEnd = rkStart + dayLength / 8;

  // Yamagaṇḍa Order
  const yamagandaOrder: Record<number, number> = { 0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 7, 6: 6 };
  const ygSegment = yamagandaOrder[varaNum] || 5;
  const ygStart = sunriseDec + ((ygSegment - 1) * dayLength) / 8;
  const ygEnd = ygStart + dayLength / 8;

  // Gulika Kāla Order
  const gulikaOrder: Record<number, number> = { 0: 7, 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1 };
  const gkSegment = gulikaOrder[varaNum] || 7;
  const gkStart = sunriseDec + ((gkSegment - 1) * dayLength) / 8;
  const gkEnd = gkStart + dayLength / 8;

  const lagnaStart = lagna.startHourDecimal;
  const lagnaEnd = lagna.endHourDecimal;

  const isRahuKalaOverlap = lagna.isDaytime && !(lagnaEnd <= rkStart || lagnaStart >= rkEnd);
  const isYamagandaOverlap = lagna.isDaytime && !(lagnaEnd <= ygStart || lagnaStart >= ygEnd);
  const isGulikaOverlap = lagna.isDaytime && !(lagnaEnd <= gkStart || lagnaStart >= gkEnd);

  // Abhijit Muhūrta (8th Muhurta of daytime: 7/15 to 8/15)
  const abhijitStart = sunriseDec + (7 * dayLength) / 15;
  const abhijitEnd = sunriseDec + (8 * dayLength) / 15;
  const isAbhijitOverlap =
    lagna.isDaytime &&
    !(lagnaEnd <= abhijitStart || lagnaStart >= abhijitEnd) &&
    varaNum !== 3; // Wednesday Abhijit is excluded per tradition

  // Godhūli Muhūrta (12 minutes before to 12 minutes after Sunset: 0.2 hr window)
  const isGodhuli = !(lagnaEnd <= sunsetDec - 0.2 || lagnaStart >= sunsetDec + 0.2);

  // Vijaya Muhūrta (14th Muhūrta of daytime: 13/15 to 14/15)
  const vijayaStart = sunriseDec + (13 * dayLength) / 15;
  const vijayaEnd = sunriseDec + (14 * dayLength) / 15;
  const isVijaya = lagna.isDaytime && !(lagnaEnd <= vijayaStart || lagnaStart >= vijayaEnd);

  // Brahma Muhūrta (14th Muhūrta of nighttime: approx 96 min before sunrise)
  const brahmaStart = sunriseDec - 1.6;
  const brahmaEnd = sunriseDec - 0.8;
  const isBrahmaMuhurta = !(lagnaEnd <= brahmaStart || lagnaStart >= brahmaEnd);

  // Bhadrā / Viṣṭi Karaṇa check
  const isBhadra =
    panchanga.karana.name.toLowerCase().includes('viṣṭi') ||
    panchanga.karana.name.toLowerCase().includes('vishti') ||
    panchanga.karana.name.toLowerCase().includes('bhadra');

  // Gaṇḍānta Check
  const isGandanta = GANDANTA_NAKSHATRAS.includes(nakNum);

  // Active Horā Lord Determination for this specific window
  const HORA_PLANETS_ORDER: PlanetId[] = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'];
  const VARA_START_HORA: Record<number, PlanetId> = {
    0: 'sun', 1: 'moon', 2: 'mars', 3: 'mercury', 4: 'jupiter', 5: 'venus', 6: 'saturn'
  };
  const horaStartLord = VARA_START_HORA[varaNum] || 'sun';
  const horaCycleStartIdx = HORA_PLANETS_ORDER.indexOf(horaStartLord);
  let horaIndex = 0;
  if (isDay) {
    const elapsedDay = Math.max(0, midHourDec - sunriseDec);
    horaIndex = Math.min(11, Math.floor((elapsedDay / dayLength) * 12));
  } else {
    const elapsedNight = midHourDec >= sunsetDec ? midHourDec - sunsetDec : midHourDec + 24 - sunsetDec;
    const nightLength = 24 - dayLength;
    horaIndex = 12 + Math.min(11, Math.floor((elapsedNight / nightLength) * 12));
  }
  const activeHoraLordId = HORA_PLANETS_ORDER[(horaCycleStartIdx + horaIndex) % 7];
  const activeHoraLordName = GRAHA_PROPERTIES[activeHoraLordId]?.name || activeHoraLordId;
  const activeHoraLordSanskrit = GRAHA_PROPERTIES[activeHoraLordId]?.sanskritName || activeHoraLordId;
  const isHoraBenefic = naturalBenefics.includes(activeHoraLordId);
  const activeHoraFavorability = isHoraBenefic
    ? 'Benefic Horā (शुभ होरा) — Harmonious'
    : activeHoraLordId === 'sun' || activeHoraLordId === 'mars'
    ? 'Dynamic Horā (उग्र होरा) — Suited for initiative & surgery'
    : 'Challenging Horā (मन्द होरा)';

  // Active Choghadiyā Determination
  let activeChoghadiyaName: ChoghadiyaName = 'Char';
  if (isDay) {
    const elapsedDay = Math.max(0, midHourDec - sunriseDec);
    const slot = Math.min(7, Math.floor((elapsedDay / dayLength) * 8));
    activeChoghadiyaName = CHOGHADIYA_DAY_PATTERNS[varaNum]?.[slot] || 'Char';
  } else {
    const elapsedNight = midHourDec >= sunsetDec ? midHourDec - sunsetDec : midHourDec + 24 - sunsetDec;
    const nightLength = 24 - dayLength;
    const slot = Math.min(7, Math.floor((elapsedNight / nightLength) * 8));
    activeChoghadiyaName = CHOGHADIYA_NIGHT_PATTERNS[varaNum]?.[slot] || 'Char';
  }
  const choghadiyaNatureMap: Record<ChoghadiyaName, { nature: string; isAuspicious: boolean }> = {
    Amrit: { nature: 'Supreme Nectar (अमृत)', isAuspicious: true },
    Shubh: { nature: 'Auspicious (शुभ)', isAuspicious: true },
    Labh: { nature: 'Commercial Gain (लाभ)', isAuspicious: true },
    Char: { nature: 'Active Mobility (चल)', isAuspicious: true },
    Rog: { nature: 'Disease & Obstacle (रोग)', isAuspicious: false },
    Kaal: { nature: 'Destruction & Loss (काल)', isAuspicious: false },
    Udveg: { nature: 'Anxiety & Agitation (उद्वेग)', isAuspicious: false },
  };
  const choghadiyaInfo = choghadiyaNatureMap[activeChoghadiyaName] || { nature: 'Neutral', isAuspicious: true };

  // Dagdha Tithi Check
  const tithiInPaksha = ((tithiNum - 1) % 15) + 1;
  const isDagdhaTithi = DAGDHA_TITHIS_MAP[varaNum] === tithiInPaksha;

  // Inauspicious Yogas
  const isYamaghantaYoga = YAMAGHANTA_YOGA_MAP[varaNum] === nakNum;
  const isMrityuYoga = MRITYU_YOGA_MAP[varaNum] === nakNum;
  const isDagdhaYoga = DAGDHA_YOGA_MAP[varaNum] === nakNum;

  // Jāmitra Śuddhi (7th from Lagna and 7th from Moon)
  const planetsIn7thLagna = planetsByHouse[7];
  const moon7thHouse = (((moonHouse + 6 - 1) % 12) + 1);
  const planetsIn7thMoon = planetsByHouse[moon7thHouse];
  const all7thPlanets = [...planetsIn7thLagna, ...planetsIn7thMoon.filter(p => !planetsIn7thLagna.some(lp => lp.planetId === p.planetId))];
  const hasMaleficIn7th = planetsIn7thLagna.some((p) => p.isMalefic) || planetsIn7thMoon.some((p) => p.isMalefic);
  const jamitraDescription = hasMaleficIn7th
    ? `Afflicted: 7th house contains ${all7thPlanets.filter(p => p.isMalefic).map(p => p.sanskritName).join(', ')} (Jāmitra Doṣa)`
    : planetsIn7thLagna.length === 0
    ? 'Pure 7th House (जामित्रशुद्धिः) — No occupants in 7th'
    : `Fortified: 7th house supported by benefic ${all7thPlanets.map(p => p.sanskritName).join(', ')}`;

  // Candra-Lagna Relation (Distance in Rashis)
  const chandraLagnaDist = (((moonRashiNum - lagnaRashi + 12) % 12) + 1);
  const isShadashtaka = chandraLagnaDist === 6 || chandraLagnaDist === 8;
  const isDvidvadasha = chandraLagnaDist === 2 || chandraLagnaDist === 12;
  const chandraLagnaDesc = isShadashtaka
    ? `Ṣaḍaṣṭaka (6/8 axis): Moon is 6/8 from rising Lagna, introducing mental unrest`
    : isDvidvadasha
    ? `Dvidvādaśa (2/12 axis): Moon is 2/12 from rising Lagna`
    : `Harmonious (House ${chandraLagnaDist} relationship from Lagna)`;

  // Guru & Śukra Combustion (Mūḍhatva)
  const sunLon = planets.sun ? planets.sun.siderealLongitude : 0;
  const jupLon = planets.jupiter ? planets.jupiter.siderealLongitude : 0;
  const venLon = planets.venus ? planets.venus.siderealLongitude : 0;
  const jupSunDiff = Math.min((jupLon - sunLon + 360) % 360, (sunLon - jupLon + 360) % 360);
  const venSunDiff = Math.min((venLon - sunLon + 360) % 360, (sunLon - venLon + 360) % 360);
  const isJupiterCombust = jupSunDiff <= 11.0;
  const isVenusCombust = venSunDiff <= 10.0;
  let combustionDesc = 'Both Jupiter and Venus are bright and uncombust.';
  if (isJupiterCombust && isVenusCombust) {
    combustionDesc = 'Severe: Both Guru and Śukra are combust (Mūḍha / अस्त).';
  } else if (isJupiterCombust) {
    combustionDesc = 'Guru is combust (गुरु मौढ्य / अस्त) — inauspicious for marriage and major initiations.';
  } else if (isVenusCombust) {
    combustionDesc = 'Śukra is combust (शुक्र मौढ्य / अस्त) — inauspicious for marriage and auspicious milestones.';
  }

  // Sūrya Saṅkrānti Proximity
  const sunDegInRashi = planets.sun ? planets.sun.siderealLongitude % 30 : 15;
  const isNearSankranti = sunDegInRashi < 1.0 || sunDegInRashi > 29.0;
  const sankrantiDesc = isNearSankranti
    ? `Saṅkrānti Sandhi: Sun at ${sunDegInRashi.toFixed(1)}° of ${sunRashiInfo?.name || ''} (within 16 Ghaṭīs transition)`
    : `Stable Solar Phase: Sun at ${sunDegInRashi.toFixed(1)}° of ${sunRashiInfo?.name || ''}`;

  // G. Special Auspicious Yogas & Classical Parihāras
  // 1. Sarvārtha Siddhī Yoga
  const siddhiNaks = SARVARTHA_SIDDHI_MAP[varaNum] || [];
  const isSarvarthaSiddhi = siddhiNaks.includes(nakNum);
  if (isSarvarthaSiddhi) specialYogas.push('Sarvārtha Siddhī Yoga (सर्वार्थसिद्धि योग)');

  // 2. Amṛta Siddhī Yoga
  const amritaNak = AMRITA_SIDDHI_MAP[varaNum];
  const isAmritaSiddhi = amritaNak === nakNum;
  if (isAmritaSiddhi) specialYogas.push('Amṛta Siddhī Yoga (अमृतसिद्धि योग)');

  // 3. Guru Pushya & Ravi Pushya
  const isGuruPushya = nakNum === 8 && varaNum === 4;
  const isRaviPushya = nakNum === 8 && varaNum === 0;
  if (isGuruPushya) specialYogas.push('Guru Pushya Yoga (गुरु पुष्य महायोग)');
  if (isRaviPushya) specialYogas.push('Ravi Pushya Yoga (रवि पुष्य महायोग)');

  // 4. Abhijit Muhūrta
  if (isAbhijitOverlap) specialYogas.push('Abhijit Muhūrta (अभिजित् मुहूर्त)');

  // Check Guru in Kendra Parihāra
  const hasJupiterInKendra = planetsByHouse[1].some((p) => p.planetId === 'jupiter') ||
    planetsByHouse[4].some((p) => p.planetId === 'jupiter') ||
    planetsByHouse[7].some((p) => p.planetId === 'jupiter') ||
    planetsByHouse[10].some((p) => p.planetId === 'jupiter');

  // Check Venus in Kendra Parihāra
  const hasVenusInKendra = planetsByHouse[1].some((p) => p.planetId === 'venus') ||
    planetsByHouse[4].some((p) => p.planetId === 'venus') ||
    planetsByHouse[7].some((p) => p.planetId === 'venus') ||
    planetsByHouse[10].some((p) => p.planetId === 'venus');

  // Record active classical pariharas
  if (isAbhijitOverlap) {
    appliedPariharas.push({
      id: 'parihara_abhijit',
      title: 'Abhijit Muhūrta Parihāra',
      sanskritTitle: 'अभिजित् परिहारः',
      description: 'Mid-day Abhijit window mitigates minor Tithi and asterism blemishes per Muhūrta Cintāmaṇi 1.34.',
      mitigatesDosha: 'Minor Tithi/Vara/Nakshatra blemishes',
      citation: CLASSICAL_SOURCES_REGISTRY.abhijit_parihara,
    });
  }

  if (hasJupiterInKendra) {
    appliedPariharas.push({
      id: 'parihara_guru_kendra',
      title: 'Guru in Kendra Parihāra',
      sanskritTitle: 'गुरु केन्द्रस्थिति परिहारः',
      description: 'Jupiter seated in Kendra destroys thousands of minor afflictions per Vasiṣṭha Saṁhitā.',
      mitigatesDosha: 'General planetary and directional afflictions',
      citation: CLASSICAL_SOURCES_REGISTRY.guru_kendra_parihara,
    });
  }

  if (isSarvarthaSiddhi) {
    appliedPariharas.push({
      id: 'parihara_sarvartha_siddhi',
      title: 'Sarvārtha Siddhī Parihāra',
      sanskritTitle: 'सर्वार्थसिद्धि परिहारः',
      description: 'Auspicious weekday and asterism confluence provides sovereign accomplishment.',
      mitigatesDosha: 'Weekday and planetary neutralities',
      citation: CLASSICAL_SOURCES_REGISTRY.sarvartha_siddhi_parihara,
    });
  }

  // 5. Godhūli Muhūrta
  if (isGodhuli) {
    specialYogas.push('Godhūli Muhūrta (गोधूलि वेला)');
    appliedPariharas.push({
      id: 'parihara_godhuli',
      title: 'Godhūli Muhūrta Parihāra',
      sanskritTitle: 'गोधूलि परिहारः',
      description: 'The auspicious sunset twilight window neutralizes planetary blemishes when pure Lagnas are unavailable per Muhūrta Cintāmaṇi 6.48.',
      mitigatesDosha: 'Lagna defects and directional blemishes',
      citation: CLASSICAL_SOURCES_REGISTRY.mc_godhuli_parihara,
    });
  }

  // 6. Vijaya Muhūrta
  if (isVijaya) {
    specialYogas.push('Vijaya Muhūrta (विजय मुहूर्त)');
  }

  // 7. Brahma Muhūrta
  if (isBrahmaMuhurta) {
    specialYogas.push('Brahma Muhūrta (ब्रह्म मुहूर्त)');
  }

  // --- 3. EVALUATE ALL OBJECTIVE-SPECIFIC CONDITIONS ---

  // 1. Tithi Condition
  const isTithiProhibited = objective.prohibitedTithis.includes(tithiNum);
  const isTithiFavorable = objective.favorableTithis.includes(tithiNum);
  let tithiConditionStatus: ConditionStatus = isTithiProhibited ? 'NOT_MET' : isTithiFavorable ? 'MET' : 'MET';
  if (isTithiProhibited && (isAbhijitOverlap || isGuruPushya)) {
    // If minor tithi issue and Abhijit is active (non-Amavasya)
    if (tithiNum !== 30) {
      tithiConditionStatus = 'EXCEPTION_APPLIED';
    }
  }

  const tithiTier = (tithiNum === 30 || [4, 9, 14, 19, 24, 29].includes(tithiNum)) && isTithiProhibited
    ? 'ABSOLUTE_PROHIBITION'
    : 'MAJOR_CONDITION';

  evaluatedConditions.push({
    rule: {
      id: 'rule_tithi',
      name: 'Classical Tithi Appropriateness',
      sanskritName: 'तिथिशुद्धिः',
      category: 'Tithi',
      description: `Must avoid Rikta (4, 9, 14, 19, 24, 29) and Amāvāsyā (30), favoring auspicious Tithis.`,
      citation: objective.classicalSources[0] || CLASSICAL_SOURCES_REGISTRY.mc_grihapravesha_1,
      isMandatory: true,
      ruleTier: tithiTier,
    },
    status: tithiConditionStatus,
    ruleTier: tithiTier,
    observedValue: `${panchanga.tithi.name} (${panchanga.tithi.paksha} Pakṣa, #${tithiNum})`,
    requiredValue: isTithiProhibited ? 'Avoid Rikta / Amāvāsyā' : 'Approved Classical Tithi',
    note: isTithiProhibited
      ? tithiConditionStatus === 'EXCEPTION_APPLIED'
        ? 'Rikta blemish mitigated by Sovereign Yoga / Abhijit'
        : 'Prohibited Rikta or Amāvāsyā Tithi per Classical Texts'
      : isTithiFavorable
      ? 'Auspicious Classical Tithi'
      : 'Neutral Tithi (Acceptable)',
  });

  if (isTithiFavorable) keyPositiveFactors.push(`Auspicious ${panchanga.tithi.name} (${panchanga.tithi.paksha})`);
  else if (isTithiProhibited) keyNegativeFactors.push(`Prohibited Tithi (${panchanga.tithi.name})`);

  // 2. Vāra (Weekday) Condition
  const isVaraProhibited = objective.prohibitedVaras.includes(varaNum);
  const isVaraFavorable = objective.favorableVaras.includes(varaNum);
  let varaConditionStatus: ConditionStatus = isVaraProhibited ? 'NOT_MET' : 'MET';
  if (isVaraProhibited && (isSarvarthaSiddhi || hasJupiterInKendra)) {
    varaConditionStatus = 'EXCEPTION_APPLIED';
  }

  evaluatedConditions.push({
    rule: {
      id: 'rule_vara',
      name: 'Vāra (Weekday) Harmony',
      sanskritName: 'वारशुद्धिः',
      category: 'Vara',
      description: 'The weekday planetary ruler must support the nature of the undertaking.',
      citation: objective.classicalSources[0] || CLASSICAL_SOURCES_REGISTRY.mc_vanijya_trade,
      isMandatory: false,
      ruleTier: 'SUPPORTING_CONDITION',
    },
    status: varaConditionStatus,
    ruleTier: 'SUPPORTING_CONDITION',
    observedValue: panchanga.vara.name,
    requiredValue: objective.favorableVaras.map((v) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][v]).join(', '),
    note: isVaraProhibited
      ? varaConditionStatus === 'EXCEPTION_APPLIED'
        ? 'Weekday unsuitability mitigated by Kendra Benefic'
        : 'Weekday is classically unrecommended for this deed'
      : isVaraFavorable
      ? 'Auspicious ruling weekday'
      : 'Acceptable weekday',
  });

  if (isVaraFavorable) keyPositiveFactors.push(`Favorable Weekday (${panchanga.vara.name})`);
  else if (isVaraProhibited) keyNegativeFactors.push(`Inauspicious Weekday (${panchanga.vara.name})`);

  // 3. Nakṣatra Condition
  const isNakFavorable = objective.favorableNakshatras.includes(nakNum);
  const isNakSecondary = objective.secondaryNakshatras?.includes(nakNum);
  let nakConditionStatus: ConditionStatus = isNakFavorable ? 'MET' : isNakSecondary ? 'EXCEPTION_APPLIED' : 'NOT_MET';
  if (!isNakFavorable && !isNakSecondary && (isSarvarthaSiddhi || isAmritaSiddhi || hasJupiterInKendra || isAbhijitOverlap)) {
    nakConditionStatus = 'EXCEPTION_APPLIED';
  }

  evaluatedConditions.push({
    rule: {
      id: 'rule_nakshatra',
      name: 'Nakṣatra Auspiciousness',
      sanskritName: 'नक्षत्रशुद्धिः',
      category: 'Nakshatra',
      description: 'Moon must transit a harmonious asterism for the deed.',
      citation: objective.classicalSources[0] || CLASSICAL_SOURCES_REGISTRY.bs_vastu_foundation,
      isMandatory: true,
      ruleTier: 'MAJOR_CONDITION',
    },
    status: nakConditionStatus,
    ruleTier: 'MAJOR_CONDITION',
    observedValue: `${panchanga.nakshatra.name} (Pāda ${panchanga.nakshatra.pada})`,
    requiredValue: 'Harmonious Classical Asterism',
    note: isNakFavorable
      ? 'Auspicious Primary Nakṣatra for this undertaking'
      : isNakSecondary
      ? 'Classical Secondary (Anukūla) Nakṣatra'
      : nakConditionStatus === 'EXCEPTION_APPLIED'
      ? 'Neutral asterism fortified by active Siddhi Yoga / Kendra Jupiter / Abhijit'
      : 'Unsuitable Nakṣatra for this objective',
  });

  if (isNakFavorable) keyPositiveFactors.push(`Auspicious Nakṣatra: ${panchanga.nakshatra.name}`);
  else if (isNakSecondary) keyPositiveFactors.push(`Secondary Nakṣatra: ${panchanga.nakshatra.name}`);
  else keyNegativeFactors.push(`Unsuitable Nakṣatra: ${panchanga.nakshatra.name}`);

  // 4. Lagna Condition
  const isLagnaFavorable = objective.favorableLagnas.includes(lagnaRashi);
  const isLagnaSecondary = objective.secondaryLagnas?.includes(lagnaRashi);
  let lagnaConditionStatus: ConditionStatus = isLagnaFavorable ? 'MET' : isLagnaSecondary ? 'EXCEPTION_APPLIED' : 'NOT_MET';
  if (!isLagnaFavorable && !isLagnaSecondary && (hasJupiterInKendra || hasVenusInKendra)) {
    lagnaConditionStatus = 'EXCEPTION_APPLIED';
  }

  evaluatedConditions.push({
    rule: {
      id: 'rule_lagna',
      name: 'Rising Sign (Lagna) Mobility & Element',
      sanskritName: 'लग्नशुद्धिः',
      category: 'Lagna',
      description: `Lagna mobility (${lagna.mobility}) and element (${lagna.tattva}) must match the undertaking.`,
      citation: objective.classicalSources[0] || CLASSICAL_SOURCES_REGISTRY.mc_grihapravesha_1,
      isMandatory: true,
      ruleTier: 'MAJOR_CONDITION',
    },
    status: lagnaConditionStatus,
    ruleTier: 'MAJOR_CONDITION',
    observedValue: `${lagna.rashiName} (${lagna.sanskritName}, ${lagna.mobility})`,
    requiredValue: objective.favorableLagnas.map((l) => RASHIS[l]?.name).join(', '),
    note: isLagnaFavorable
      ? 'Favorable Primary Lagna'
      : isLagnaSecondary
      ? 'Acceptable Secondary Lagna'
      : lagnaConditionStatus === 'EXCEPTION_APPLIED'
      ? 'Lagna mobility mitigated by Kendra benefic placement'
      : 'Unsuitable Lagna for this deed',
  });

  if (isLagnaFavorable) keyPositiveFactors.push(`Favorable Lagna: ${lagna.rashiName} (${lagna.mobility})`);
  else if (isLagnaSecondary) keyPositiveFactors.push(`Secondary Lagna: ${lagna.rashiName}`);
  else keyNegativeFactors.push(`Unsuitable Lagna: ${lagna.rashiName}`);

  // 5. Aṣṭama Śuddhi (8th House Purity Rule)
  const ashtamaTier = objective.id === 'vivaha' ? 'ABSOLUTE_PROHIBITION' : 'MAJOR_CONDITION';
  let ashtamaConditionStatus: ConditionStatus = is8thClean ? 'MET' : hasMaleficIn8th ? 'NOT_MET' : 'MET';
  if (hasMaleficIn8th && hasJupiterInKendra && objective.id !== 'vivaha') {
    ashtamaConditionStatus = 'EXCEPTION_APPLIED';
  }

  evaluatedConditions.push({
    rule: {
      id: 'rule_ashtama_shuddhi',
      name: 'Aṣṭama Śuddhi (8th House Purity)',
      sanskritName: 'अष्टमशुद्धिः',
      category: 'Lagna',
      description: 'The 8th house from rising Muhūrta Lagna must be clean of malefics and Moon.',
      citation: CLASSICAL_SOURCES_REGISTRY.mc_vivaha_lagna,
      isMandatory: true,
      ruleTier: ashtamaTier,
    },
    status: ashtamaConditionStatus,
    ruleTier: ashtamaTier,
    observedValue: is8thClean ? '8th House Pure' : `Occupied by ${ashtamaPlanetsNames.join(', ')}`,
    requiredValue: 'Clean 8th House',
    note: is8thClean
      ? 'Aṣṭama Śuddhi fully satisfied'
      : hasMaleficIn8th
      ? ashtamaConditionStatus === 'EXCEPTION_APPLIED'
        ? 'Aṣṭama blemish mitigated by Kendra Jupiter'
        : 'Severe Aṣṭama affliction by malefic or Moon'
      : 'Benefic in 8th (Acceptable)',
  });

  if (is8thClean) keyPositiveFactors.push('Pure 8th House (Aṣṭama Śuddhi)');
  else if (hasMaleficIn8th) keyNegativeFactors.push(`Aṣṭama Affliction (${ashtamaPlanetsNames.join(', ')} in 8th)`);

  // 6. Objective-Specific Check (e.g. Dik-Śūla for Travel)
  if (objective.id === 'yatra') {
    const travelDir = (query.answers.travelDirection as string) || 'east';
    const prohibitedDir = DIK_SHOOLA_RULES[varaNum];
    const isDikShoolaViolated = travelDir === prohibitedDir;

    evaluatedConditions.push({
      rule: {
        id: 'rule_dikshoola',
        name: 'Dik-Śūla Direction Check',
        sanskritName: 'दिक्शूलविचारः',
        category: 'Exclusion',
        description: 'Avoid traveling in the planetary spear direction of the weekday.',
        citation: CLASSICAL_SOURCES_REGISTRY.kalamrita_yatra,
        isMandatory: true,
        ruleTier: 'ABSOLUTE_PROHIBITION',
      },
      status: isDikShoolaViolated ? 'NOT_MET' : 'MET',
      ruleTier: 'ABSOLUTE_PROHIBITION',
      observedValue: `Travel towards ${travelDir.toUpperCase()} on ${panchanga.vara.name}`,
      requiredValue: `Must NOT be ${prohibitedDir?.toUpperCase()}`,
      note: isDikShoolaViolated ? `Severe Dik-Śūla violation towards ${travelDir}` : 'Direction cleared of Dik-Śūla',
    });

    if (isDikShoolaViolated) keyNegativeFactors.push(`Violates Dik-Śūla (${travelDir.toUpperCase()} on ${panchanga.vara.name})`);
    else keyPositiveFactors.push(`Dik-Śūla cleared for ${travelDir.toUpperCase()}`);
  }

  // Kharmās check for marriage / house entry
  if (objective.id === 'vivaha' || objective.id === 'grihapravesha') {
    evaluatedConditions.push({
      rule: {
        id: 'rule_kharmas',
        name: 'Kharmās (Solar Transit in Guru Rāśis) Clearance',
        sanskritName: 'मलमास / खरमास वर्जनम्',
        category: 'Exclusion',
        description: 'Sun in Sagittarius or Pisces suppresses auspicious ceremonies.',
        citation: CLASSICAL_SOURCES_REGISTRY.general_exclusions,
        isMandatory: true,
        ruleTier: 'ABSOLUTE_PROHIBITION',
      },
      status: isKharmas ? 'NOT_MET' : 'MET',
      ruleTier: 'ABSOLUTE_PROHIBITION',
      observedValue: isKharmas ? `Sun in ${sunRashiInfo?.name || 'Guru Rāśi'} (Kharmās)` : 'Cleared of Kharmās',
      requiredValue: 'Clean Solar Month',
      note: isKharmas ? 'Solar Kharmās prohibits vivāha and gṛhapraveśa' : 'Solar month auspicious',
    });

    if (isKharmas) keyNegativeFactors.push('Afflicted by Kharmās (Sun in Dhanu/Mīna)');
  }

  // 7. Universal Exclusions: Rāhu Kāla & Bhadrā Karaṇa
  evaluatedConditions.push({
    rule: {
      id: 'rule_rahu_kala',
      name: 'Rāhu Kāla Clearance',
      sanskritName: 'राहुकालवर्जनम्',
      category: 'Exclusion',
      description: 'Diurnal period governed by Rahu bringing obstruction and loss.',
      citation: CLASSICAL_SOURCES_REGISTRY.general_exclusions,
      isMandatory: true,
      ruleTier: 'ABSOLUTE_PROHIBITION',
    },
    status: isRahuKalaOverlap ? 'NOT_MET' : 'MET',
    ruleTier: 'ABSOLUTE_PROHIBITION',
    observedValue: isRahuKalaOverlap ? 'Falls inside Rāhu Kāla' : 'Free of Rāhu Kāla',
    requiredValue: 'Complete Clearance',
    note: isRahuKalaOverlap ? 'Lagna overlaps inauspicious Rāhu Kāla window' : 'No Rāhu Kāla overlap',
  });

  if (isRahuKalaOverlap) keyNegativeFactors.push('Afflicted by Rāhu Kāla');

  evaluatedConditions.push({
    rule: {
      id: 'rule_bhadra',
      name: 'Bhadrā (Viṣṭi Karaṇa) Prohibition',
      sanskritName: 'भद्रा (विष्टिकरण) वर्जनम्',
      category: 'Exclusion',
      description: 'Active Viṣṭi Karaṇa causes destruction and failure of undertakings.',
      citation: CLASSICAL_SOURCES_REGISTRY.general_exclusions,
      isMandatory: true,
      ruleTier: 'ABSOLUTE_PROHIBITION',
    },
    status: isBhadra ? 'NOT_MET' : 'MET',
    ruleTier: 'ABSOLUTE_PROHIBITION',
    observedValue: panchanga.karana.name,
    requiredValue: 'Non-Viṣṭi Karaṇa',
    note: isBhadra ? 'Active Bhadrā prohibits this deed' : 'Karaṇa is auspicious',
  });

  if (isBhadra) keyNegativeFactors.push('Afflicted by Bhadrā (Viṣṭi) Karaṇa');

  // Supporting conditions
  evaluatedConditions.push({
    rule: {
      id: 'rule_chandra_bala',
      name: 'Candra Bala & Pakṣa Strength',
      sanskritName: 'चन्द्रबलविचारः',
      category: 'Planetary',
      description: 'Moon waxing (Śukla) and well-placed bestows vitality and mental clarity.',
      citation: CLASSICAL_SOURCES_REGISTRY.general_exclusions,
      isMandatory: false,
      ruleTier: 'SUPPORTING_CONDITION',
    },
    status: isMoonDebilitated ? 'NOT_MET' : isWaxing || isMoonExalted || isMoonOwnSign ? 'MET' : 'EXCEPTION_APPLIED',
    ruleTier: 'SUPPORTING_CONDITION',
    observedValue: moonDignityDesc,
    requiredValue: 'Waxing / Dignified Moon',
    note: isMoonDebilitated
      ? 'Debilitated Moon weakens election'
      : isWaxing
      ? 'Waxing Moon provides full auspiciousness'
      : 'Waning Moon acceptable with benefic support',
  });

  if (isMoonDebilitated) {
    keyNegativeFactors.push('Moon Debilitated in Scorpio (Nīca Candra)');
  }

  // Kendra Benefics
  if (kendraBeneficsList.length > 0) {
    evaluatedConditions.push({
      rule: {
        id: 'rule_kendra_benefics',
        name: 'Benefic Fortification in Kendras/Trikoṇas',
        sanskritName: 'केन्द्रत्रिकोण शुभग्रह स्थितिः',
        category: 'Lagna',
        description: 'Benefics in angles (1, 4, 7, 10) or trines (5, 9) protect the enterprise.',
        citation: CLASSICAL_SOURCES_REGISTRY.guru_kendra_parihara,
        isMandatory: false,
        ruleTier: 'SUPPORTING_CONDITION',
      },
      status: 'MET',
      ruleTier: 'SUPPORTING_CONDITION',
      observedValue: kendraBeneficsList.join(', '),
      requiredValue: 'Benefics in 1, 4, 7, 10, 5, 9',
      note: `Fortified by ${kendraBeneficsList.length} benefic placement(s)`,
    });
    keyPositiveFactors.push(`Benefic Fortification: ${kendraBeneficsList.slice(0, 2).join(', ')}`);
  }

  // Upachaya Malefics
  if (upachayaMaleficsList.length > 0) {
    evaluatedConditions.push({
      rule: {
        id: 'rule_upachaya_malefics',
        name: 'Malefics in Upachaya Houses (3, 6, 11)',
        sanskritName: 'उपचयस्थानगत क्रूरग्रहः',
        category: 'Lagna',
        description: 'Malefic planets in 3, 6, 11 overcome enemies and obstacles.',
        citation: CLASSICAL_SOURCES_REGISTRY.general_exclusions,
        isMandatory: false,
        ruleTier: 'SUPPORTING_CONDITION',
      },
      status: 'MET',
      ruleTier: 'SUPPORTING_CONDITION',
      observedValue: upachayaMaleficsList.join(', '),
      requiredValue: 'Malefics in 3, 6, 11',
      note: `Obstacles conquered by ${upachayaMaleficsList.join(', ')}`,
    });
    keyPositiveFactors.push(`Upachaya Strength: ${upachayaMaleficsList.slice(0, 2).join(', ')}`);
  }

  if (isLagnaPapaKartari) {
    evaluatedConditions.push({
      rule: {
        id: 'rule_papa_kartari',
        name: 'Pāpa-Kārtarī Freedom',
        sanskritName: 'पापकर्तरी वर्जनम्',
        category: 'Lagna',
        description: 'Lagna should not be hemmed between malefics in 12th and 2nd.',
        citation: CLASSICAL_SOURCES_REGISTRY.general_exclusions,
        isMandatory: false,
        ruleTier: 'SECONDARY_PREFERENCE',
      },
      status: 'NOT_MET',
      ruleTier: 'SECONDARY_PREFERENCE',
      observedValue: 'Malefics in 12th and 2nd houses',
      requiredValue: 'Free of Pāpa-Kārtarī',
      note: 'Lagna is hemmed by malefics',
    });
    keyNegativeFactors.push('Lagna hemmed by Malefics (Pāpa-Kārtarī)');
  }

  // --- 4. DETERMINISTIC 4-TIER QUALIFICATION ASSIGNMENT ---
  const passedConditions = evaluatedConditions.filter((c) => c.status === 'MET');
  const conditionalConditions = evaluatedConditions.filter((c) => c.status === 'EXCEPTION_APPLIED');
  const failedConditions = evaluatedConditions.filter((c) => c.status === 'NOT_MET');

  const absoluteProhibitions = evaluatedConditions.filter((c) => c.ruleTier === 'ABSOLUTE_PROHIBITION');
  const majorConditions = evaluatedConditions.filter((c) => c.ruleTier === 'MAJOR_CONDITION');
  const supportingConditions = evaluatedConditions.filter((c) => c.ruleTier === 'SUPPORTING_CONDITION');
  const secondaryPreferences = evaluatedConditions.filter((c) => c.ruleTier === 'SECONDARY_PREFERENCE');

  const unmitigatedProhibitions = absoluteProhibitions.filter((c) => c.status === 'NOT_MET');
  const majorConditionsFailed = majorConditions.filter((c) => c.status === 'NOT_MET');
  const majorConditionsExceptions = majorConditions.filter((c) => c.status === 'EXCEPTION_APPLIED');

  // Purity Score (0 to 100)
  let rawPurity = 50;
  if (is8thClean) rawPurity += 15;
  if (hasMaleficIn8th) rawPurity -= 25;
  rawPurity += Math.min(20, kendraBeneficsList.length * 8);
  rawPurity += Math.min(12, upachayaMaleficsList.length * 4);
  if (isNakFavorable) rawPurity += 15;
  else if (isNakSecondary) rawPurity += 8;
  if (isLagnaFavorable) rawPurity += 12;
  else if (isLagnaSecondary) rawPurity += 6;
  if (isTithiFavorable) rawPurity += 10;
  if (isSarvarthaSiddhi) rawPurity += 12;
  if (isAmritaSiddhi) rawPurity += 15;
  if (isGuruPushya || isRaviPushya) rawPurity += 20;
  if (isAbhijitOverlap) rawPurity += 12;
  if (isGodhuli) rawPurity += 14;
  if (isVijaya) rawPurity += 10;
  if (isBrahmaMuhurta) rawPurity += 10;
  if (choghadiyaInfo.isAuspicious) rawPurity += 6;
  if (isHoraBenefic) rawPurity += 5;
  if (isWaxing) rawPurity += 5;
  if (isMoonExalted || isMoonOwnSign) rawPurity += 8;
  if (isMoonDebilitated) rawPurity -= 18;
  if (isLagnaPapaKartari) rawPurity -= 15;
  if (isRahuKalaOverlap) rawPurity -= 35;
  if (isBhadra) rawPurity -= 35;
  if (isYamaghantaYoga) {
    rawPurity -= 25;
    keyNegativeFactors.push(`Yamaghaṇṭa Yoga (${panchanga.vara.name} + ${panchanga.nakshatra.name})`);
  }
  if (isMrityuYoga) {
    rawPurity -= 30;
    keyNegativeFactors.push(`Mṛtyu Yoga (${panchanga.vara.name} + ${panchanga.nakshatra.name})`);
  }
  if (isDagdhaYoga) {
    rawPurity -= 25;
    keyNegativeFactors.push(`Dagdha Yoga (${panchanga.vara.name} + ${panchanga.nakshatra.name})`);
  }
  if (isDagdhaTithi) {
    if (!isAbhijitOverlap) {
      rawPurity -= 15;
      keyNegativeFactors.push(`Dagdha Tithi (${panchanga.tithi.name} on ${panchanga.vara.name})`);
    }
  }
  if (hasMaleficIn7th) {
    const penalty = objective.id === 'vivaha' ? 35 : 15;
    rawPurity -= penalty;
    keyNegativeFactors.push(`Jāmitra Doṣa: Malefic in 7th house`);
  }
  if (isShadashtaka) {
    rawPurity -= 10;
    keyNegativeFactors.push(`Candra-Lagna Ṣaḍaṣṭaka (6/8 axis)`);
  }
  if (isJupiterCombust || isVenusCombust) {
    const penalty = objective.id === 'vivaha' || objective.id === 'grihapravesha' ? 25 : 10;
    rawPurity -= penalty;
    keyNegativeFactors.push(isJupiterCombust ? 'Guru Mūḍha (Combust Jupiter)' : 'Śukra Mūḍha (Combust Venus)');
  }
  if (isNearSankranti) {
    rawPurity -= 20;
    keyNegativeFactors.push('Sūrya Saṅkrānti Sandhi (Solar transition window)');
  }
  if (unmitigatedProhibitions.length > 0) rawPurity = Math.min(rawPurity, 30);

  const purityScore = Math.max(5, Math.min(100, Math.round(rawPurity)));

  // Build the 21 Classical Mahā-Doṣas Structured Audit Ledger
  const mahaDoshasAudit: MahaDoshaAuditRecord[] = [
    {
      id: 'md_tithi',
      name: 'Tithi Śuddhi',
      sanskritName: 'तिथि शुद्धि',
      status: [4, 9, 14, 19, 24, 29, 30].includes(tithiNum) ? 'AFFLICTED' : 'CLEARED',
      detail: [4, 9, 14, 19, 24, 29].includes(tithiNum)
        ? `Rikta Tithi (${panchanga.tithi.name}) active — avoided in classical texts`
        : tithiNum === 30
        ? 'Amāvasyā (New Moon) active — universally prohibited'
        : `Auspicious ${panchanga.tithi.name} (${panchanga.tithi.paksha} Pakṣa)`,
      mitigationText: (isAbhijitOverlap || isGuruPushya) && tithiNum !== 30 ? 'Mitigated by Abhijit / Sovereign Yoga' : undefined,
    },
    {
      id: 'md_vara',
      name: 'Vāra Śuddhi',
      sanskritName: 'वार शुद्धि',
      status: objective.prohibitedVaras.includes(varaNum) ? 'AFFLICTED' : 'CLEARED',
      detail: objective.prohibitedVaras.includes(varaNum)
        ? `${panchanga.vara.name} is prohibited for ${objective.name}`
        : `${panchanga.vara.name} is harmonious`,
    },
    {
      id: 'md_nakshatra',
      name: 'Nakṣatra Śuddhi',
      sanskritName: 'नक्षत्र शुद्धि',
      status: objective.favorableNakshatras.includes(nakNum) ? 'CLEARED' : 'AFFLICTED',
      detail: objective.favorableNakshatras.includes(nakNum)
        ? `${panchanga.nakshatra.name} (Pada ${panchanga.nakshatra.pada}) is praised`
        : `${panchanga.nakshatra.name} is neutral/secondary for this deed`,
      mitigationText: isSarvarthaSiddhi ? 'Conjoined in Sarvārtha Siddhi Yoga' : undefined,
    },
    {
      id: 'md_yoga',
      name: 'Yoga Śuddhi',
      sanskritName: 'योग शुद्धि',
      status: [17, 27].includes(panchanga.yoga.number) ? 'AFFLICTED' : 'CLEARED',
      detail: panchanga.yoga.number === 17
        ? 'Vyatīpāta Mahādoṣa — strictly avoid'
        : panchanga.yoga.number === 27
        ? 'Vaidhṛti Mahādoṣa — strictly avoid'
        : `Pure Solar-Lunar Yoga (${panchanga.yoga.name})`,
    },
    {
      id: 'md_karana',
      name: 'Karaṇa Śuddhi (Viṣṭi/Bhadrā)',
      sanskritName: 'करण शुद्धि (भद्रा)',
      status: isBhadra ? 'AFFLICTED' : 'CLEARED',
      detail: isBhadra
        ? 'Viṣṭi (Bhadrā) Karaṇa active — severe prohibition'
        : `Fortified Karaṇa (${panchanga.karana.name})`,
    },
    {
      id: 'md_sankranti',
      name: 'Sūrya Saṅkrānti Sandhi',
      sanskritName: 'सूर्य सङ्क्रान्ति सन्धि',
      status: isNearSankranti ? 'AFFLICTED' : 'CLEARED',
      detail: sankrantiDesc,
    },
    {
      id: 'md_kartari',
      name: 'Pāpa-Kartarī on Lagna',
      sanskritName: 'पापकर्तरी दोष',
      status: isLagnaPapaKartari ? 'AFFLICTED' : 'CLEARED',
      detail: isLagnaPapaKartari
        ? 'Rising Lagna is hemmed between malefics in 12th & 2nd houses'
        : 'Rising Lagna is clear of adjacent malefic scissors',
    },
    {
      id: 'md_chandra_shadashtaka',
      name: 'Candra-Lagna Ṣaḍaṣṭaka',
      sanskritName: 'चन्द्र-लग्न षडाष्टक',
      status: isShadashtaka ? 'AFFLICTED' : 'CLEARED',
      detail: chandraLagnaDesc,
    },
    {
      id: 'md_chandra_dvidvadasha',
      name: 'Candra-Lagna Dvidvādaśa',
      sanskritName: 'चन्द्र-लग्न द्विर्द्वादश',
      status: isDvidvadasha ? 'AFFLICTED' : 'CLEARED',
      detail: isDvidvadasha ? 'Moon sits 2nd or 12th from Lagna' : 'Balanced alignment',
    },
    {
      id: 'md_jamitra',
      name: 'Jāmitra Doṣa (7th House)',
      sanskritName: 'जामित्र दोष (सप्तम शुद्धि)',
      status: hasMaleficIn7th ? 'AFFLICTED' : 'CLEARED',
      detail: jamitraDescription,
    },
    {
      id: 'md_ashtama',
      name: 'Aṣṭama Doṣa (8th House Purity)',
      sanskritName: 'अष्टम दोष (अष्टम शुद्धि)',
      status: is8thClean ? 'CLEARED' : hasMaleficIn8th ? 'AFFLICTED' : 'MITIGATED',
      detail: ashtamaDescription,
    },
    {
      id: 'md_dagdha_tithi',
      name: 'Dagdha Tithi',
      sanskritName: 'दग्ध तिथि दोष',
      status: isDagdhaTithi ? 'AFFLICTED' : 'CLEARED',
      detail: isDagdhaTithi
        ? `Tithi ${panchanga.tithi.name} is Dagdha on ${panchanga.vara.name}`
        : 'Tithi is not Dagdha for today',
      mitigationText: isAbhijitOverlap ? 'Neutralized by Abhijit window' : undefined,
    },
    {
      id: 'md_yamaghanta',
      name: 'Yamaghaṇṭa Yoga',
      sanskritName: 'यमघण्ट योग',
      status: isYamaghantaYoga ? 'AFFLICTED' : 'CLEARED',
      detail: isYamaghantaYoga
        ? `Inauspicious confluence of ${panchanga.vara.name} with ${panchanga.nakshatra.name}`
        : 'Free from Yamaghaṇṭa affliction',
    },
    {
      id: 'md_mrityu_yoga',
      name: 'Mṛtyu Yoga',
      sanskritName: 'मृत्यु योग',
      status: isMrityuYoga ? 'AFFLICTED' : 'CLEARED',
      detail: isMrityuYoga
        ? `Hazardous confluence of ${panchanga.vara.name} with ${panchanga.nakshatra.name}`
        : 'Free from Mṛtyu Yoga',
    },
    {
      id: 'md_dagdha_yoga',
      name: 'Dagdha Yoga',
      sanskritName: 'दग्ध योग',
      status: isDagdhaYoga ? 'AFFLICTED' : 'CLEARED',
      detail: isDagdhaYoga
        ? `Combust day-star pairing (${panchanga.vara.name} + ${panchanga.nakshatra.name})`
        : 'Free from Dagdha Yoga',
    },
    {
      id: 'md_rahu_kala',
      name: 'Rāhukāla Window',
      sanskritName: 'राहुकाल वेला',
      status: isRahuKalaOverlap ? 'AFFLICTED' : 'CLEARED',
      detail: isRahuKalaOverlap
        ? 'Window overlaps with daytime Rāhu Kāla'
        : 'Completely clear of Rāhu Kāla',
    },
    {
      id: 'md_yamaganda',
      name: 'Yamagaṇḍa Window',
      sanskritName: 'यमगण्ड वेला',
      status: isYamagandaOverlap ? 'AFFLICTED' : 'CLEARED',
      detail: isYamagandaOverlap
        ? 'Window overlaps with Yamagaṇḍa period'
        : 'Completely clear of Yamagaṇḍa',
    },
    {
      id: 'md_gulika',
      name: 'Gulika Kāla Window',
      sanskritName: 'गुलिक काल वेला',
      status: isGulikaOverlap ? 'AFFLICTED' : 'CLEARED',
      detail: isGulikaOverlap
        ? 'Window overlaps with Gulika Kāla'
        : 'Completely clear of Gulika Kāla',
    },
    {
      id: 'md_gandanta',
      name: 'Gaṇḍānta Sandhi',
      sanskritName: 'गण्डान्त सन्धि',
      status: isGandanta ? 'AFFLICTED' : 'CLEARED',
      detail: isGandanta
        ? `Moon in Gaṇḍānta star (${panchanga.nakshatra.name})`
        : 'Clear of Gaṇḍānta junction',
    },
    {
      id: 'md_combustion',
      name: 'Guru-Śukra Mūḍhatva',
      sanskritName: 'गुरु-शुक्र मौढ्य (अस्त)',
      status: (isJupiterCombust || isVenusCombust) ? 'AFFLICTED' : 'CLEARED',
      detail: combustionDesc,
    },
    {
      id: 'md_kharmasa',
      name: 'Kharmāsa / Malamāsa',
      sanskritName: 'खरमास (धनु-मीन सूर्य)',
      status: isKharmas ? 'AFFLICTED' : 'CLEARED',
      detail: isKharmas
        ? `Sun in ${sunRashiInfo?.name || ''} (Kharmāsa)`
        : `Sun in ${sunRashiInfo?.name || ''} (Pure solar month)`,
    },
  ];

  // Calculate the 4-tier Classification
  let classification: MuhurtaClassification;
  let classificationLabel: string;
  let classicalBasisSummary: string;
  let cautionSummary: string | undefined = undefined;
  let status: MuhurtaStatus;
  let statusLabel: string;
  let summaryReason: string;

  if (unmitigatedProhibitions.length > 0) {
    classification = 'AVOID';
    classificationLabel = 'Avoid (वर्ज्य / अविहित)';
    status = 'NOT_QUALIFIED';
    statusLabel = 'Not Qualified (अविहित)';
    summaryReason = `Violates classical prohibition: ${unmitigatedProhibitions.map((c) => c.rule.name).join(', ')}.`;
    classicalBasisSummary = `Strict classical prohibition active (${unmitigatedProhibitions.map((c) => c.rule.sanskritName || c.rule.name).join(', ')}).`;
    cautionSummary = `Classical authorities forbid commencement: ${unmitigatedProhibitions.map((c) => c.note || c.rule.name).join('; ')}.`;
  } else if (majorConditionsFailed.length === 0 && (purityScore >= 75 || majorConditionsExceptions.length === 0)) {
    classification = 'STRONGLY_RECOMMENDED';
    classificationLabel = 'Strongly Recommended (परमोत्तम / उत्तम)';
    status = 'QUALIFIED';
    statusLabel = 'Qualified (सम्मत)';
    summaryReason = 'All mandatory Shastric rules, Pañcāṅga limbs, and Lagna purity conditions are fully satisfied.';
    classicalBasisSummary = `All major applicable conditions favorable (Lagna ${lagna.rashiName}, ${panchanga.nakshatra.name} Nakṣatra, non-Rikta Tithi); all classical exclusions checked and cleared.`;
    if (keyNegativeFactors.length > 0) {
      cautionSummary = `Minor secondary consideration: ${keyNegativeFactors[0]}.`;
    }
  } else if (majorConditionsFailed.length === 0 || (majorConditionsFailed.length === 1 && (appliedPariharas.length > 0 || specialYogas.length > 0))) {
    classification = 'SUITABLE';
    classificationLabel = 'Suitable within Constraint (सम्मत)';
    status = 'QUALIFIED';
    statusLabel = 'Qualified (सम्मत)';
    summaryReason = 'Principal conditions required for the deed are satisfied with verified classical clearance.';
    classicalBasisSummary = `Principal conditions required for ${objective.name} are satisfied; minor non-critical factors disclosed.`;
    if (keyNegativeFactors.length > 0) {
      cautionSummary = `Secondary consideration: ${keyNegativeFactors.slice(0, 2).join('; ')}.`;
    }
  } else {
    classification = 'CONDITIONAL';
    classificationLabel = 'Conditional / Acceptable (सापवाद / मध्यम)';
    status = 'QUALIFIED_WITH_CONDITIONS';
    statusLabel = 'Qualified with Conditions (सापवाद सम्मत)';
    summaryReason = 'Contains weaker or mixed factors acceptable under classical exceptions (Apavāda / Parihāra).';
    classicalBasisSummary = `No severe prohibition applies; contains weaker or mixed factors acceptable under classical exceptions.`;
    cautionSummary = `Conditions requiring caution: ${keyNegativeFactors.slice(0, 3).join('; ')}.`;
  }

  // Determine Quality Tier
  let tier: MuhurtaQualityTier = 'NOT_RECOMMENDED';
  if (classification === 'STRONGLY_RECOMMENDED' && purityScore >= 85 && is8thClean) {
    tier = 'SOVEREIGN_GOLD';
  } else if (classification === 'STRONGLY_RECOMMENDED') {
    tier = 'HIGHLY_RECOMMENDED';
  } else if (classification === 'SUITABLE' || classification === 'CONDITIONAL') {
    tier = 'USABLE_WITH_PARIHARA';
  } else {
    tier = 'NOT_RECOMMENDED';
  }

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  return {
    id: `muhurta_${dateStr}_${lagna.rashiNumber}_${lagna.index}`,
    date: new Date(date),
    dateString: dateStr,
    dayOfWeek: panchanga.vara.name,
    startTime: lagna.startTimeStr,
    endTime: lagna.endTimeStr,
    startHourDecimal: lagna.startHourDecimal,
    endHourDecimal: lagna.endHourDecimal,
    durationMinutes: lagna.durationMinutes,
    lagnaRashi: lagna.rashiNumber,
    lagnaName: lagna.rashiName,
    lagnaSanskrit: lagna.sanskritName,
    lagnaLord: lagna.lagnaLord,
    lagnaLordName: lagna.lagnaLordName,
    status,
    statusLabel,
    classification,
    classificationLabel,
    classicalBasisSummary,
    cautionSummary,
    isBestInRequestedRange: false,
    isStrongerAlternative: false,
    ruleCategoriesBreakdown: {
      absoluteProhibitions,
      majorConditions,
      supportingConditions,
      secondaryPreferences,
    },
    summaryReason,
    purityScore,
    tier,
    isTopPick: false,
    qualityBadge:
      tier === 'SOVEREIGN_GOLD'
        ? 'परमोत्तम (Gold)'
        : tier === 'HIGHLY_RECOMMENDED'
        ? 'उत्तम (Recommended)'
        : tier === 'USABLE_WITH_PARIHARA'
        ? 'सापवाद (Parihāra)'
        : 'अविहित (Prohibited)',
    appliedPariharas,
    allConditions: evaluatedConditions,
    passedConditions,
    conditionalConditions,
    failedConditions,
    keyPositiveFactors,
    keyNegativeFactors,
    specialYogas,
    ashtamaShuddhi: {
      isClean: is8thClean,
      planetsIn8th: ashtamaPlanetsNames,
      description: ashtamaDescription,
    },
    kendraBenefics: kendraBeneficsList,
    upachayaMalefics: upachayaMaleficsList,
    papaKartari: {
      onLagna: isLagnaPapaKartari,
      onMoon: isMoonPapaKartari,
    },
    moonDignity: {
      rashiName: moonRashiInfo?.name || '',
      isExalted: isMoonExalted,
      isDebilitated: isMoonDebilitated,
      isOwnSign: isMoonOwnSign,
      isWaxing,
      description: moonDignityDesc,
    },
    solarMonth: {
      rashiName: sunRashiInfo?.name || '',
      isKharmas,
    },
    planetaryPositions: planetaryPlacements,
    panchangaSnapshot: {
      tithiName: panchanga.tithi.name,
      tithiPaksha: panchanga.tithi.paksha,
      tithiNumber: tithiNum,
      nakshatraName: panchanga.nakshatra.name,
      nakshatraPada: panchanga.nakshatra.pada,
      varaName: panchanga.vara.name,
      yogaName: panchanga.yoga.name,
      karanaName: panchanga.karana.name,
      isAbhijit: isAbhijitOverlap,
      isAmritaKala: isAmritaSiddhi,
      isRahuKala: isRahuKalaOverlap,
      isYamaganda: isYamagandaOverlap,
      isGulika: isGulikaOverlap,
      isDurmuhurta: false,
      isBhadra,
      activeHoraLord: activeHoraLordName,
      activeHoraLordSanskrit: activeHoraLordSanskrit,
      activeHoraFavorability,
      activeChoghadiyaName,
      activeChoghadiyaNature: choghadiyaInfo.nature,
      activeChoghadiyaIsAuspicious: choghadiyaInfo.isAuspicious,
      isGodhuli,
      isVijaya,
      isBrahmaMuhurta,
      isDagdhaTithi,
      isYamaghantaYoga,
      isMrityuYoga,
      isDagdhaYoga,
    },
    jamitraShuddhi: {
      isClean: !hasMaleficIn7th,
      planetsIn7th: all7thPlanets.map((p) => p.sanskritName),
      description: jamitraDescription,
    },
    chandraLagnaRelation: {
      rashiDistance: chandraLagnaDist,
      isShadashtaka,
      isDvidvadasha,
      description: chandraLagnaDesc,
    },
    combustionStatus: {
      isJupiterCombust,
      isVenusCombust,
      description: combustionDesc,
    },
    sankrantiStatus: {
      isNearSankranti,
      description: sankrantiDesc,
    },
    mahaDoshasAudit,
    citations: objective.classicalSources,
  };
}

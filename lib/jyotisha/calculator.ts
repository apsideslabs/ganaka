/**
 * Gaṇaka — Master Jyotiṣa Calculation Orchestrator
 * Fully harmonizes high-precision VSOP87/ELP-2000 astronomy with
 * classical Parāśari, Jaimini, and Sūrya Siddhānta calculation rules.
 */

import { calculateJulianDay, toDMS, normalizeDegrees } from '../astronomy/julian';
import { calculateAyanamsha, formatAyanamsha, AyanamshaType } from '../astronomy/ayanamsha';
import { calculateAllPlanets, calculateSolarTimes, getSunDetailsAtJD, PlanetId } from '../astronomy/ephemeris';
import { calculateAscendant, calculateMidheaven, calculateHouses } from './houses';
import { calculateDignity, checkCombustion, calculateAspects } from './dignity';
import { calculatePanchanga } from './panchanga';
import { calculateAllVargas } from '../vargas/varga-engine';
import { calculateVimshottariDasha } from '../dashas/vimshottari';
import { calculateAshtakavarga } from '../ashtakavarga/ashtakavarga';
import { calculateShadbala } from '../shadbala/shadbala';
import { detectAllYogas } from '../yogas/yoga-engine';
import { evaluateAllDoshas } from '../doshas/dosha-engine';
import { calculateJaiminiFactors } from '../jaimini/jaimini-engine';
import { calculatePlanetaryAvasthas } from './sphutas';
import { calculateBhavaChalit } from './bhava-chalit';
import { calculateHouseArgalas } from './argala';
import { calculateRelationshipMatrix, calculateDispositorRelations } from './relationships';
import { calculateNatalAttributes } from './attributes';
import { calculateSpecialPoints } from './special-lagnas';
import { JyotishaChart, CalculatedPlanet, RashiNumber } from './types';
import { GRAHA_PROPERTIES, NAKSHATRAS, RASHIS } from './constants';

export interface CalculationInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
  latitude: number;
  longitude: number;
  timezoneOffsetHours: number;
  locationName: string;
  ayanamshaType?: AyanamshaType;
  customAyanamshaValue?: number;
  houseSystem?: 'equal_whole' | 'sripati' | 'placidus';
  /** Aṣṭakavarga table recension; see AshtakavargaOptions. */
  ashtakavargaRecension?: 'parashara' | 'varahamihira';
  /**
   * Which lunar node the chart is cast from.
   *
   * 'mean' (default) is the Parāśari convention: the Sūrya Siddhānta and the
   * printed panchāṅga lineage tabulate the mean node, BPHS assumes it, and it
   * keeps Rāhu permanently retrograde as the texts describe the graha.
   * 'true' is the osculating node, used by KP and Jaimini practice; it swings
   * up to 1°45′ from the mean and briefly turns direct.
   *
   * Substitution happens before nakshatra, pada, bhāva, aṣṭakavarga, yoga and
   * daśā are derived, so every downstream value follows the chosen node.
   */
  nodeType?: 'mean' | 'true';
  jaiminiScheme?: '7_karaka' | '8_karaka';
}


/**
 * Result cache.
 *
 * A full chart costs about 130 ms — the VSOP87 series and the ṣaḍbala work
 * dominate. The workspace recomputes on every change to the birth fields, and
 * the panels remount whenever a tab is reopened, so the same chart was being
 * built over and over for identical inputs. This memoises on the input
 * signature, so a repeat call is free.
 *
 * Bounded, because a long session with a lot of typing would otherwise hold
 * every intermediate chart. Oldest entry is dropped first.
 */
const CHART_CACHE_LIMIT = 24;
const chartCache = new Map<string, JyotishaChart>();

function cacheKey(input: CalculationInput): string {
  return [
    input.year, input.month, input.day, input.hour, input.minute, input.second ?? 0,
    input.latitude, input.longitude, input.timezoneOffsetHours,
    input.ayanamshaType ?? 'lahiri', input.customAyanamshaValue ?? 0,
    input.houseSystem ?? 'equal_whole', input.jaiminiScheme ?? '7_karaka',
    input.ashtakavargaRecension ?? 'parashara', input.nodeType ?? 'mean',
  ].join('|');
}

/** Clear the cache — used by tests that need a cold run. */
export function clearChartCache(): void {
  chartCache.clear();
}

/**
 * Computes a full JyotishaChart structure with 100% mathematical fidelity.
 *
 * Memoised on the input signature; the returned object is shared, so callers
 * must treat it as immutable.
 */
export function calculateFullJyotishaChart(input: CalculationInput): JyotishaChart {
  const key = cacheKey(input);
  const hit = chartCache.get(key);
  if (hit) return hit;
  const chart = computeChart(input);
  if (chartCache.size >= CHART_CACHE_LIMIT) {
    const oldest = chartCache.keys().next().value;
    if (oldest !== undefined) chartCache.delete(oldest);
  }
  chartCache.set(key, chart);
  return chart;
}

function computeChart(input: CalculationInput): JyotishaChart {
  const {
    year,
    month,
    day,
    hour,
    minute,
    second = 0,
    latitude: rawLatitude,
    longitude: rawLongitude,
    timezoneOffsetHours: rawTimezone,
    locationName,
    ayanamshaType = 'lahiri',
    customAyanamshaValue = 0,
    houseSystem = 'equal_whole',
    jaiminiScheme = '7_karaka',
    ashtakavargaRecension = 'parashara',
    nodeType = 'mean',
  } = input;

  /**
   * Input validation.
   *
   * These used to pass straight through. A latitude of 91°, a longitude of 400°
   * or an hour of 25 all produced a chart that looked completely normal and was
   * entirely wrong — the worst possible failure mode, because nothing signals it.
   * Values are now clamped to their legal ranges and every clamp is recorded in
   * `meta.warnings` so a caller can surface it rather than trusting the chart.
   */
  const warnings: string[] = [];

  const clamp = (v: number, lo: number, hi: number, name: string): number => {
    if (!Number.isFinite(v)) {
      warnings.push(`${name} was not a number; used ${lo}.`);
      return lo;
    }
    if (v < lo || v > hi) {
      const c = Math.max(lo, Math.min(hi, v));
      warnings.push(`${name} ${v} is outside ${lo}…${hi}; clamped to ${c}.`);
      return c;
    }
    return v;
  };

  const latitude = clamp(rawLatitude, -90, 90, 'latitude');
  // Longitude is circular, so normalise rather than clamp — 400° is −40°.
  let longitude = Number.isFinite(rawLongitude) ? ((rawLongitude % 360) + 540) % 360 - 180 : 0;
  if (!Number.isFinite(rawLongitude)) warnings.push('longitude was not a number; used 0.');
  else if (rawLongitude < -180 || rawLongitude > 180) {
    warnings.push(`longitude ${rawLongitude} is outside −180…180; normalised to ${longitude.toFixed(4)}.`);
  }
  const timezoneOffsetHours = clamp(rawTimezone, -12, 14, 'timezone');

  const safeHour = clamp(hour, 0, 23, 'hour');
  const safeMinute = clamp(minute, 0, 59, 'minute');
  const safeSecond = clamp(second, 0, 59, 'second');

  const monthDays = [31, (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const safeMonth = clamp(month, 1, 12, 'month');
  const safeDay = clamp(day, 1, monthDays[safeMonth - 1] ?? 31, 'day');
  if (safeDay !== day) {
    warnings.push(`day ${day} does not exist in month ${safeMonth} of ${year}; clamped to ${safeDay}.`);
  }

  // 1. Julian Day (Universal Time)
  const decimalHours = safeHour + safeMinute / 60.0 + safeSecond / 3600.0;
  const utDecimalHours = decimalHours - timezoneOffsetHours;
  const jd = calculateJulianDay(year, safeMonth, safeDay, utDecimalHours);

  // 2. Ayanāṃśa
  const ayanamsha = calculateAyanamsha(jd, ayanamshaType, customAyanamshaValue);
  const ayanamshaFormatted = formatAyanamsha(ayanamsha);

  // 3. Ephemeris (Planetary positions & speeds)
  const rawPlanets = calculateAllPlanets(jd, ayanamshaType, customAyanamshaValue);

  // 3a. Node convention. Both nodes are already computed; this decides which
  // one the rest of the chart is built from. Done here, before houses,
  // nakshatra, aṣṭakavarga or daśā, so nothing downstream keeps the mean value.
  if (nodeType === 'true') {
    rawPlanets.rahu = { ...rawPlanets.true_rahu, id: 'rahu', name: 'Rahu (True)' };
    rawPlanets.ketu = { ...rawPlanets.true_ketu, id: 'ketu', name: 'Ketu (True)' };
  }
  const sunTimes = calculateSolarTimes(jd, latitude, longitude, timezoneOffsetHours);
  const isDayBirth = jd >= sunTimes.sunriseJD && jd <= sunTimes.sunsetJD;

  // Solar ingress instants for Varsa and Masa bala (BPHS 27.26-27). Found by
  // bisection on the Sun's sidereal longitude rather than by linear
  // extrapolation: the Sun's speed ranges from 0.953 to 1.019 deg/day, so a
  // straight-line estimate over ~320 days can be several days out and land on
  // the wrong weekday.
  const sunSiderealAt = (j: number): number => {
    const s2 = getSunDetailsAtJD(j);
    const ay = calculateAyanamsha(j, ayanamshaType, customAyanamshaValue);
    return (((s2.appLon - ay) % 360) + 360) % 360;
  };
  const lastIngressJD = (target: number): number => {
    const f = (j: number) => (((sunSiderealAt(j) - target) % 360) + 360) % 360;
    const approx = jd - f(jd);
    let lo = approx - 12;
    let hi = approx + 12;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (f(mid) > 180) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };
  const varshaIngressJD = lastIngressJD(0);
  const masaIngressJD = lastIngressJD(
    Math.floor(rawPlanets.sun.siderealLongitude / 30) * 30
  );

  // 4. Ascendant (Lagna) & Midheaven (MC)
  const lagna = calculateAscendant(jd, latitude, longitude, ayanamshaType, customAyanamshaValue);
  const mc = calculateMidheaven(jd, longitude, ayanamshaType, customAyanamshaValue);
  // The MC, IC and descendant were computed and then dropped, so nothing could
  // reproduce the local sky or build unequal houses from the true midheaven.
  const angles = {
    mc: Number(mc.toFixed(4)),
    ic: Number(normalizeDegrees(mc + 180).toFixed(4)),
    descendant: Number(normalizeDegrees(lagna.siderealLongitude + 180).toFixed(4)),
  };

  // 5. Bhāvas (Houses)
  const planetaryPositionsForHouses: Record<PlanetId, { siderealLongitude: number }> = {} as any;
  for (const [pId, pData] of Object.entries(rawPlanets)) {
    // The ephemeris carries both nodes; the chart carries only the chosen one,
    // which is already in `rahu`/`ketu`. Keeping the alternate here would give
    // a house and a varga to a graha that is not in the chart.
    if (pId === 'true_rahu' || pId === 'true_ketu') continue;
    planetaryPositionsForHouses[pId as PlanetId] = {
      siderealLongitude: pData.siderealLongitude,
    };
  }

  const bhavas = calculateHouses(
    lagna.siderealLongitude,
    mc,
    houseSystem,
    planetaryPositionsForHouses
  );

  // 6. Enrich Planetary Objects with Dignity, Nakshatra, Pada, House, Aspects
  const calculatedPlanets: Record<PlanetId, CalculatedPlanet> = {} as any;

  for (const [pId, pData] of Object.entries(rawPlanets)) {
    // Only the nine grahas belong in the chart. `true_rahu`/`true_ketu` are
    // ephemeris inputs; surfacing them put eleven cards in the planet grid,
    // with Rāhu listed twice.
    if (pId === 'true_rahu' || pId === 'true_ketu') continue;
    const pKey = pId as PlanetId;
    const prop = GRAHA_PROPERTIES[pKey];
    const rashiIndex = Math.floor(pData.siderealLongitude / 30);
    const rashiNum = (rashiIndex + 1) as RashiNumber;
    const degInRashi = pData.siderealLongitude % 30;

    // Find house number (whole sign relative to lagna)
    const house = (((rashiNum - lagna.rashiNumber + 12) % 12) + 1);

    // Nakshatra and Pada
    const nakRaw = pData.siderealLongitude / (360.0 / 27.0);
    const nakIndex = Math.floor(nakRaw) % 27;
    const nakInfo = NAKSHATRAS[nakIndex];
    const pada = (Math.floor((nakRaw - Math.floor(nakRaw)) * 4) + 1) as 1 | 2 | 3 | 4;

    const dms = toDMS(pData.siderealLongitude);
    const isCombust = checkCombustion(pKey, pData.siderealLongitude, rawPlanets.sun.siderealLongitude);
    const dignity = calculateDignity(pKey, pData.siderealLongitude, planetaryPositionsForHouses);
    const aspects = calculateAspects(pKey, house);

    calculatedPlanets[pKey] = {
      id: pKey,
      name: prop?.name || pData.name,
      sanskritName: prop?.sanskritName || pData.sanskritName,
      devanagari: prop?.devanagari || pData.sanskritName,
      tropicalLongitude: pData.tropicalLongitude,
      siderealLongitude: pData.siderealLongitude,
      longitudeInRashi: degInRashi,
      rashiNumber: rashiNum,
      rashiName: RASHIS[rashiNum].sanskritName,
      house,
      nakshatraIndex: nakIndex,
      nakshatraName: nakInfo.name,
      nakshatraLord: nakInfo.lord,
      pada,
      degreeStr: `${dms.degrees}°${dms.minutes.toString().padStart(2, '0')}′${dms.seconds.toString().padStart(2, '0')}″`,
      isRetrograde: pData.isRetrograde,
      isCombust,
      speed: parseFloat(pData.speedDegPerDay.toFixed(4)),
      declination: parseFloat(pData.declination.toFixed(4)),
      dignity,
      naturalBenefic: prop ? prop.naturalBenefic : true,
      aspectsToHouses: aspects,
    };
  }

  // 7. Pañcāṅga & Muhūrtas
  const panchanga = calculatePanchanga(
    rawPlanets.sun.siderealLongitude,
    rawPlanets.moon.siderealLongitude,
    jd,
    latitude,
    longitude,
    timezoneOffsetHours,
    ayanamshaType,
    customAyanamshaValue
  );

  // 8. Divisional Charts (Vargas) & Vargottama Planets
  const vargasData = calculateAllVargas(lagna.siderealLongitude, planetaryPositionsForHouses);

  // 9. Viṃśottarī Daśā (120-year tree)
  const vimshottari = calculateVimshottariDasha(
    rawPlanets.moon.siderealLongitude,
    {
      year,
      month,
      day,
      hour,
      minute,
      second: second || 0,
    },
    {
      lagnaLongitude: lagna.siderealLongitude,
      timezoneOffsetHours,
    }
  );

  // 10. Aṣṭakavarga
  const rashiMap: Record<PlanetId, RashiNumber> = {} as any;
  for (const [pId, pObj] of Object.entries(calculatedPlanets)) {
    rashiMap[pId as PlanetId] = pObj.rashiNumber;
  }
  const ashtakavarga = calculateAshtakavarga(rashiMap, lagna.rashiNumber, {
    recension: ashtakavargaRecension,
  });

  // 11. Śaḍbala
  const shadbalaInput: any = {};
  for (const [pId, pObj] of Object.entries(calculatedPlanets)) {
    shadbalaInput[pId] = {
      siderealLongitude: pObj.siderealLongitude,
      speedDegPerDay: pObj.speed,
      isRetrograde: pObj.isRetrograde,
      latitude: pObj.latitude,
    };
  }
  const shadbala = calculateShadbala(shadbalaInput, lagna.siderealLongitude, isDayBirth, {
    jd,
    sunriseJD: sunTimes.sunriseJD,
    sunsetJD: sunTimes.sunsetJD,
    solarNoonJD: sunTimes.solarNoonJD,
    year,
    month,
    day,
    hour,
    minute,
    timezoneOffsetHours,
    ayanamsha,
    varshaIngressJD,
    masaIngressJD,
  });

  // 12. Classical Yogas
  const yogaInput: any = {};
  for (const [pId, pObj] of Object.entries(calculatedPlanets)) {
    yogaInput[pId] = {
      siderealLongitude: pObj.siderealLongitude,
      rashiNumber: pObj.rashiNumber,
      house: pObj.house,
      isCombust: pObj.isCombust,
      isRetrograde: pObj.isRetrograde,
      latitude: pObj.latitude,
    };
  }
  const yogas = detectAllYogas(yogaInput, lagna.rashiNumber);

  // 13. Jaimini Factors
  const jaimini = calculateJaiminiFactors(
    planetaryPositionsForHouses,
    lagna.siderealLongitude,
    jaiminiScheme
  );

  // 14. Special Lagnas & Upagrahas
  // Bālādi / Jāgradādi / Dīptādi avasthās, BPHS. The sphuṭas module could already
  // compute these, but the result was never attached to the planet, so the
  // workspace showed one word of it and the exports showed none.
  for (const [pId, pObj] of Object.entries(calculatedPlanets) as any) {
    try {
      (pObj as any).avasthas = calculatePlanetaryAvasthas(
        pId as PlanetId,
        (pObj as any).longitudeInRashi ?? 0,
        (pObj as any).rashiNumber ?? 1,
        (pObj as any).dignity,
        (pObj as any).isCombust ?? false
      );
    } catch {
      /* a chart without a usable longitude simply carries no avasthā */
    }
  }

  const specialPoints = calculateSpecialPoints(
    rawPlanets.sun.siderealLongitude,
    rawPlanets.moon.siderealLongitude,
    lagna.siderealLongitude,
    jd,
    sunTimes.sunriseJD,
    sunTimes.sunsetJD,
    panchanga.vara.number
  );

  // 15. Classical Dosha & Ariṣṭa Engine
  const baseChartForDoshas: any = {
    meta: {
      calculatedAt: new Date().toISOString(),
      engineVersion: 'Gaṇaka Classical Mathematical Engine v1.0',
      ayanamshaType,
      ayanamshaValue: ayanamsha,
      ayanamshaFormatted,
      julianDay: parseFloat(jd.toFixed(6)),
      houseSystem,
      // Recorded so a chart can be reproduced exactly. Without the node
      // convention a Rāhu that is 1°45′ out is indistinguishable from one that
      // is right, and the daśā balance moves with it.
      nodeType: (nodeType ?? 'mean'),
      warnings,
      jaiminiScheme: (jaiminiScheme ?? '7_karaka'),
      birthDetails: {
        year,
        month,
        day,
        hour,
        minute,
        second,
        locationName,
        latitude,
        longitude,
        timezoneOffsetHours,
      },
    },
    lagna,
    angles,
    planets: calculatedPlanets,
    bhavas,
    panchanga,
    vargas: vargasData.vargas,
    vargottamaPlanets: vargasData.vargottamaPlanets,
    vimshottari,
    ashtakavarga,
    shadbala,
    yogas,
    jaimini,
    specialPoints,
  };

  // Relationships and the favourable attributes were both computable before
  // this — the friendship functions existed but were never called — so the
  // panels and exports had nothing to show. They are attached here so every
  // surface reads from one place.
  const relationships = calculateRelationshipMatrix(baseChartForDoshas as any);
  const dispositorRelations = calculateDispositorRelations(baseChartForDoshas as any);
  const attributes = calculateNatalAttributes(baseChartForDoshas as any);
  // The chalita reading: the same grahas placed by bhāva cusp rather than by
  // sign. It was computed inside a panel and never reached the chart, so the
  // JSON and the PDF had no way to show it.
  const bhavaChalit = calculateBhavaChalit(baseChartForDoshas as any, 'sripati');
  (baseChartForDoshas as any).bhavaChalit = bhavaChalit;

  // Argala was computed by its own module and never attached, so the Jaimini
  // intervention layer reached neither the workspace nor the exports.
  try {
    (baseChartForDoshas as any).argala = calculateHouseArgalas(
      (baseChartForDoshas as any).lagna.rashiNumber,
      (baseChartForDoshas as any).planets
    );
  } catch {
    (baseChartForDoshas as any).argala = null;
  }
  (baseChartForDoshas as any).relationships = relationships;
  (baseChartForDoshas as any).dispositorRelations = dispositorRelations;
  (baseChartForDoshas as any).attributes = attributes;

  const doshas = evaluateAllDoshas(baseChartForDoshas);

  return {
    ...baseChartForDoshas,
    doshas,
  };
}

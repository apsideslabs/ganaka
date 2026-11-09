/**
 * Gaṇaka — Master Jyotiṣa Calculation Orchestrator
 * Fully harmonizes high-precision VSOP87/ELP-2000 astronomy with
 * classical Parāśari, Jaimini, and Sūrya Siddhānta calculation rules.
 */

import { calculateJulianDay, toDMS } from '../astronomy/julian';
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
  jaiminiScheme?: '7_karaka' | '8_karaka';
}

/**
 * Computes a full JyotishaChart structure with 100% mathematical fidelity.
 */
export function calculateFullJyotishaChart(input: CalculationInput): JyotishaChart {
  const {
    year,
    month,
    day,
    hour,
    minute,
    second = 0,
    latitude,
    longitude,
    timezoneOffsetHours,
    locationName,
    ayanamshaType = 'lahiri',
    customAyanamshaValue = 0,
    houseSystem = 'equal_whole',
    jaiminiScheme = '7_karaka',
  } = input;

  // 1. Julian Day (Universal Time)
  const decimalHours = hour + minute / 60.0 + second / 3600.0;
  const utDecimalHours = decimalHours - timezoneOffsetHours;
  const jd = calculateJulianDay(year, month, day, utDecimalHours);

  // 2. Ayanāṃśa
  const ayanamsha = calculateAyanamsha(jd, ayanamshaType, customAyanamshaValue);
  const ayanamshaFormatted = formatAyanamsha(ayanamsha);

  // 3. Ephemeris (Planetary positions & speeds)
  const rawPlanets = calculateAllPlanets(jd, ayanamshaType, customAyanamshaValue);
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

  // 5. Bhāvas (Houses)
  const planetaryPositionsForHouses: Record<PlanetId, { siderealLongitude: number }> = {} as any;
  for (const [pId, pData] of Object.entries(rawPlanets)) {
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
  const ashtakavarga = calculateAshtakavarga(rashiMap, lagna.rashiNumber);

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

  const doshas = evaluateAllDoshas(baseChartForDoshas);

  return {
    ...baseChartForDoshas,
    doshas,
  };
}

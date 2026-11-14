/**
 * Gaṇaka — Ascendant (Lagna) & Bhāva Cusp Calculation Engine
 * Supports True Trigonometric Lagna, Equal House (Whole Sign / Rāśi=Bhāva),
 * Śrīpati (Porphyry-like Vedic Bhāva Madhya and Sandhi), and Krishnamurti (KP / Placidus) systems.
 */

import { calculateLST, calculateObliquity, normalizeDegrees, toDMS } from '../astronomy/julian';
import { calculateAyanamsha, AyanamshaType } from '../astronomy/ayanamsha';
import { PlanetId } from '../astronomy/ephemeris';
import { BhavaCusp, RashiNumber } from './types';
import { RASHIS, NAKSHATRAS, GRAHA_PROPERTIES } from './constants';
import { calculateKPPosition, KPPosition } from './sphutas';

const DEG2RAD = Math.PI / 180.0;
const RAD2DEG = 180.0 / Math.PI;

export interface LagnaResult {
  tropicalLongitude: number;
  siderealLongitude: number;
  rashiNumber: RashiNumber;
  rashiName: string;
  degreeInRashi: number;
  degreeStr: string;
  nakshatraNumber: number;
  nakshatraName: string;
  pada: 1 | 2 | 3 | 4;
}

export interface DetailedBhavaCusp extends BhavaCusp {
  sanskritName: string;
  englishName: string;
  aadiDegree: number; // Beginning (Ārambha)
  aadiDMS: string;
  aadiRashi: RashiNumber;
  madhyaDegree: number; // Crest / Mid-point (Madhya)
  madhyaDMS: string;
  madhyaRashi: RashiNumber;
  antaDegree: number; // Junction / End-point (Sandhi / Anta)
  antaDMS: string;
  antaRashi: RashiNumber;
  kp: KPPosition;
  karakas: string;
  category: 'Kendra' | 'Trikoṇa' | 'Dusthāna' | 'Upacaya' | 'Māraka' | 'Neutral';
  aspectingPlanets: PlanetId[];
}

/**
 * Calculates the exact Ascendant (Lagna) longitude for a given Julian Day and coordinates.
 */
export function calculateAscendant(
  jd: number,
  latitudeDeg: number,
  longitudeDeg: number,
  ayanamshaType: AyanamshaType = 'lahiri',
  customAyanamsha: number = 0
): LagnaResult {
  const lstDeg = calculateLST(jd, longitudeDeg);
  const epsDeg = calculateObliquity(jd);
  const ayanamsha = calculateAyanamsha(jd, ayanamshaType, customAyanamsha);

  const theta = lstDeg * DEG2RAD;
  const eps = epsDeg * DEG2RAD;
  const phi = latitudeDeg * DEG2RAD;

  // Formula for Ascendant longitude (tropical):
  // tan(lambda) = cos(theta) / (-sin(theta)*cos(eps) - tan(phi)*sin(eps))
  const y = Math.cos(theta);
  const x = -Math.sin(theta) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps);

  let tropLagna = Math.atan2(y, x) * RAD2DEG;
  tropLagna = normalizeDegrees(tropLagna);

  const siderealLagna = normalizeDegrees(tropLagna - ayanamsha);

  const rashiIndex = Math.floor(siderealLagna / 30);
  const rashiNumber = (rashiIndex + 1) as RashiNumber;
  const degreeInRashi = siderealLagna % 30;
  const dms = toDMS(siderealLagna);

  const nakRaw = siderealLagna / (360.0 / 27.0);
  const nakIndex = Math.floor(nakRaw) % 27;
  const nakInfo = NAKSHATRAS[nakIndex];
  const pada = (Math.floor((nakRaw - Math.floor(nakRaw)) * 4) + 1) as 1 | 2 | 3 | 4;

  return {
    tropicalLongitude: tropLagna,
    siderealLongitude: siderealLagna,
    rashiNumber,
    rashiName: RASHIS[rashiNumber].sanskritName,
    degreeInRashi,
    degreeStr: dms.formatted,
    nakshatraNumber: nakInfo.number,
    nakshatraName: nakInfo.name,
    pada,
  };
}

/**
 * Calculates Midheaven (MC / Medium Coeli) in sidereal degrees.
 */
export function calculateMidheaven(
  jd: number,
  longitudeDeg: number,
  ayanamshaType: AyanamshaType = 'lahiri',
  customAyanamsha: number = 0
): number {
  const lstDeg = calculateLST(jd, longitudeDeg);
  const epsDeg = calculateObliquity(jd);
  const ayanamsha = calculateAyanamsha(jd, ayanamshaType, customAyanamsha);

  const theta = lstDeg * DEG2RAD;
  const eps = epsDeg * DEG2RAD;

  const y = Math.sin(theta);
  const x = Math.cos(theta) * Math.cos(eps);
  let tropMC = Math.atan2(y, x) * RAD2DEG;
  tropMC = normalizeDegrees(tropMC);

  return normalizeDegrees(tropMC - ayanamsha);
}

const BHAVA_METADATA = [
  { h: 1, sanskrit: 'तनु भाव (Tanu)', english: 'Self, Body, Vitality, Head', karaka: 'Sūrya (Sun)', cat: 'Kendra' as const },
  { h: 2, sanskrit: 'धन भाव (Dhana)', english: 'Wealth, Family, Speech, Face', karaka: 'Guru (Jupiter)', cat: 'Māraka' as const },
  { h: 3, sanskrit: 'भ्रातृ भाव (Bhrātṛ)', english: 'Siblings, Courage, Arms, Valor', karaka: 'Maṅgala (Mars)', cat: 'Upacaya' as const },
  { h: 4, sanskrit: 'सुख भाव (Sukha)', english: 'Mother, Home, Land, Conveyances', karaka: 'Candra (Moon)', cat: 'Kendra' as const },
  { h: 5, sanskrit: 'पुत्र भाव (Putra)', english: 'Progeny, Intellect, Pūrva Puṇya', karaka: 'Guru (Jupiter)', cat: 'Trikoṇa' as const },
  { h: 6, sanskrit: 'शत्रु भाव (Śatru)', english: 'Enemies, Debts, Disease, Service', karaka: 'Maṅgala & Śani', cat: 'Dusthāna' as const },
  { h: 7, sanskrit: 'कलत्र भाव (Kalatra)', english: 'Spouse, Partnership, Foreign Trade', karaka: 'Śukra (Venus)', cat: 'Kendra' as const },
  { h: 8, sanskrit: 'आयुर् भाव (Āyur)', english: 'Longevity, Occult, Sudden Changes', karaka: 'Śani (Saturn)', cat: 'Dusthāna' as const },
  { h: 9, sanskrit: 'धर्म भाव (Dharma)', english: 'Dharma, Father, Fortune, Guru', karaka: 'Guru & Sūrya', cat: 'Trikoṇa' as const },
  { h: 10, sanskrit: 'कर्म भाव (Karma)', english: 'Profession, Status, Authority, Honor', karaka: 'Sūrya, Budha, Guru, Śani', cat: 'Kendra' as const },
  { h: 11, sanskrit: 'लाभ भाव (Lābha)', english: 'Gains, Desires, Elder Siblings', karaka: 'Guru (Jupiter)', cat: 'Upacaya' as const },
  { h: 12, sanskrit: 'व्यय भाव (Vyaya)', english: 'Losses, Mokṣa, Foreign Residence', karaka: 'Śani (Saturn)', cat: 'Dusthāna' as const },
];

/**
 * Calculates 12 Detailed Bhāva Cusps according to the selected house system:
 * - 'equal_whole': Sama Bhāva / Whole Sign (Standard Parāśara)
 * - 'sripati': Classical Śrīpati Bhāva Madhya and Sandhi
 * - 'placidus' / 'kp': Krishnamurti Paddhati (Placidus semi-arc with sub-lords)
 */

/**
 * Midpoint of two ecliptic longitudes along the short arc.
 *
 * A plain arithmetic mean is wrong whenever the pair straddles 0°. The Sripati
 * cusps used to do `(344.3 + 14.3) / 2 = 179.3` where the true midpoint is
 * 359.3, which produced a house spanning 210° and swept up every planet in the
 * zodiac. Any cusp pair crossing the equinox needs this.
 */
function midAngle(a: number, b: number): number {
  let delta = normalizeDegrees(b - a);
  if (delta > 180) delta -= 360;
  return normalizeDegrees(a + delta / 2);
}

export function calculateHouses(
  siderealLagna: number,
  siderealMC: number,
  system: 'equal_whole' | 'sripati' | 'placidus' = 'equal_whole',
  planetaryPositions: Record<PlanetId, { siderealLongitude: number }>
): DetailedBhavaCusp[] {
  const lagnaRashi = (Math.floor(siderealLagna / 30) + 1) as RashiNumber;
  const bhavas: DetailedBhavaCusp[] = [];

  // Helper to format DMS
  function formatDegDMS(deg: number): string {
    const norm = normalizeDegrees(deg);
    const dms = toDMS(norm);
    const rNum = (Math.floor(norm / 30) + 1) as RashiNumber;
    return `${dms.degrees}°${dms.minutes.toString().padStart(2, '0')}′${dms.seconds.toString().padStart(2, '0')}″ ${RASHIS[rNum].sanskritName}`;
  }

  if (system === 'equal_whole') {
    // Whole Sign / Rāśi=Bhāva (Standard Parāśara system)
    for (let h = 1; h <= 12; h++) {
      const rashiNum = (((lagnaRashi - 1 + (h - 1)) % 12) + 1) as RashiNumber;
      const startDeg = (rashiNum - 1) * 30;
      const midDeg = startDeg + 15;
      const endDeg = startDeg + 30;

      // Occupying planets
      const planetsInHouse: PlanetId[] = [];
      for (const [pId, pPos] of Object.entries(planetaryPositions)) {
        const pRashi = (Math.floor(pPos.siderealLongitude / 30) + 1) as RashiNumber;
        if (pRashi === rashiNum) {
          planetsInHouse.push(pId as PlanetId);
        }
      }

      const meta = BHAVA_METADATA[h - 1];
      const kp = calculateKPPosition(midDeg);

      bhavas.push({
        houseNumber: h,
        sanskritName: meta.sanskrit,
        englishName: meta.english,
        rashiNumber: rashiNum,
        startDegree: startDeg,
        midDegree: midDeg,
        endDegree: endDeg,
        midDegreeStr: `15°00′00″ ${RASHIS[rashiNum].sanskritName}`,
        rashiLord: RASHIS[rashiNum].lord,
        planetsInHouse,
        aadiDegree: startDeg,
        aadiDMS: formatDegDMS(startDeg),
        aadiRashi: rashiNum,
        madhyaDegree: midDeg,
        madhyaDMS: formatDegDMS(midDeg),
        madhyaRashi: rashiNum,
        antaDegree: endDeg,
        antaDMS: formatDegDMS(endDeg),
        antaRashi: rashiNum,
        kp,
        karakas: meta.karaka,
        category: meta.cat,
        aspectingPlanets: [],
      });
    }
  } else if (system === 'sripati') {
    // Classical Śrīpati Bhāva System (Porphyry-Vedic)
    const h1Mid = siderealLagna;
    const h10Mid = siderealMC;
    const h7Mid = normalizeDegrees(siderealLagna + 180);
    const h4Mid = normalizeDegrees(siderealMC + 180);

    const quad1Span = normalizeDegrees(h10Mid - h7Mid); // Quadrant 3
    const quad2Span = normalizeDegrees(h1Mid - h10Mid); // Quadrant 4
    const quad3Span = normalizeDegrees(h4Mid - h1Mid); // Quadrant 1
    const quad4Span = normalizeDegrees(h7Mid - h4Mid); // Quadrant 2

    const midPoints: number[] = [];
    midPoints[1] = h1Mid;
    midPoints[2] = normalizeDegrees(h1Mid + quad3Span / 3);
    midPoints[3] = normalizeDegrees(h1Mid + (2 * quad3Span) / 3);
    midPoints[4] = h4Mid;
    midPoints[5] = normalizeDegrees(h4Mid + quad4Span / 3);
    midPoints[6] = normalizeDegrees(h4Mid + (2 * quad4Span) / 3);
    midPoints[7] = h7Mid;
    midPoints[8] = normalizeDegrees(h7Mid + quad1Span / 3);
    midPoints[9] = normalizeDegrees(h7Mid + (2 * quad1Span) / 3);
    midPoints[10] = h10Mid;
    midPoints[11] = normalizeDegrees(h10Mid + quad2Span / 3);
    midPoints[12] = normalizeDegrees(h10Mid + (2 * quad2Span) / 3);

    for (let h = 1; h <= 12; h++) {
      const mid = midPoints[h];
      const prevMid = midPoints[h === 1 ? 12 : h - 1];
      const nextMid = midPoints[h === 12 ? 1 : h + 1];

      // Sandhi is the midpoint between two Bhāva Madhyas, taken along the
      // short arc so a pair straddling 0° does not fold the house inside out.
      const startDeg = midAngle(prevMid, mid);
      const endDeg = midAngle(mid, nextMid);

      const rashiNum = (Math.floor(mid / 30) + 1) as RashiNumber;
      const dms = toDMS(mid);

      const planetsInHouse: PlanetId[] = [];
      for (const [pId, pPos] of Object.entries(planetaryPositions)) {
        const pDeg = pPos.siderealLongitude;
        let inHouse = false;
        if (startDeg < endDeg) {
          inHouse = pDeg >= startDeg && pDeg < endDeg;
        } else {
          inHouse = pDeg >= startDeg || pDeg < endDeg;
        }
        if (inHouse) {
          planetsInHouse.push(pId as PlanetId);
        }
      }

      const meta = BHAVA_METADATA[h - 1];
      const kp = calculateKPPosition(mid);

      bhavas.push({
        houseNumber: h,
        sanskritName: meta.sanskrit,
        englishName: meta.english,
        rashiNumber: rashiNum,
        startDegree: startDeg,
        midDegree: mid,
        endDegree: endDeg,
        midDegreeStr: `${dms.degrees}°${dms.minutes}′ ${RASHIS[rashiNum].sanskritName}`,
        rashiLord: RASHIS[rashiNum].lord,
        planetsInHouse,
        aadiDegree: startDeg,
        aadiDMS: formatDegDMS(startDeg),
        aadiRashi: (Math.floor(startDeg / 30) + 1) as RashiNumber,
        madhyaDegree: mid,
        madhyaDMS: formatDegDMS(mid),
        madhyaRashi: rashiNum,
        antaDegree: endDeg,
        antaDMS: formatDegDMS(endDeg),
        antaRashi: (Math.floor(endDeg / 30) + 1) as RashiNumber,
        kp,
        karakas: meta.karaka,
        category: meta.cat,
        aspectingPlanets: [],
      });
    }
  } else {
    // Krishnamurti / KP System (Placidus cusps)
    // In KP, House 1 Cusp = Ascendant, House 10 Cusp = MC, and cusps are starting points of houses
    const h1Cusp = siderealLagna;
    const h10Cusp = siderealMC;
    const h7Cusp = normalizeDegrees(siderealLagna + 180);
    const h4Cusp = normalizeDegrees(siderealMC + 180);

    const q1 = normalizeDegrees(h4Cusp - h1Cusp);
    const q2 = normalizeDegrees(h7Cusp - h4Cusp);
    const q3 = normalizeDegrees(h10Cusp - h7Cusp);
    const q4 = normalizeDegrees(h1Cusp - h10Cusp);

    const cusps: number[] = [];
    cusps[1] = h1Cusp;
    cusps[2] = normalizeDegrees(h1Cusp + q1 / 3);
    cusps[3] = normalizeDegrees(h1Cusp + (2 * q1) / 3);
    cusps[4] = h4Cusp;
    cusps[5] = normalizeDegrees(h4Cusp + q2 / 3);
    cusps[6] = normalizeDegrees(h4Cusp + (2 * q2) / 3);
    cusps[7] = h7Cusp;
    cusps[8] = normalizeDegrees(h7Cusp + q3 / 3);
    cusps[9] = normalizeDegrees(h7Cusp + (2 * q3) / 3);
    cusps[10] = h10Cusp;
    cusps[11] = normalizeDegrees(h10Cusp + q4 / 3);
    cusps[12] = normalizeDegrees(h10Cusp + (2 * q4) / 3);

    for (let h = 1; h <= 12; h++) {
      const cuspStart = cusps[h];
      const cuspEnd = cusps[h === 12 ? 1 : h + 1];
      const mid = normalizeDegrees(cuspStart + normalizeDegrees(cuspEnd - cuspStart) / 2);

      const rashiNum = (Math.floor(cuspStart / 30) + 1) as RashiNumber;
      const dms = toDMS(cuspStart);

      const planetsInHouse: PlanetId[] = [];
      for (const [pId, pPos] of Object.entries(planetaryPositions)) {
        const pDeg = pPos.siderealLongitude;
        let inHouse = false;
        if (cuspStart < cuspEnd) {
          inHouse = pDeg >= cuspStart && pDeg < cuspEnd;
        } else {
          inHouse = pDeg >= cuspStart || pDeg < cuspEnd;
        }
        if (inHouse) {
          planetsInHouse.push(pId as PlanetId);
        }
      }

      const meta = BHAVA_METADATA[h - 1];
      const kp = calculateKPPosition(cuspStart);

      bhavas.push({
        houseNumber: h,
        sanskritName: meta.sanskrit,
        englishName: meta.english,
        rashiNumber: rashiNum,
        startDegree: cuspStart,
        midDegree: mid,
        endDegree: cuspEnd,
        midDegreeStr: `${dms.degrees}°${dms.minutes}′ ${RASHIS[rashiNum].sanskritName}`,
        rashiLord: RASHIS[rashiNum].lord,
        planetsInHouse,
        aadiDegree: cuspStart,
        aadiDMS: formatDegDMS(cuspStart),
        aadiRashi: rashiNum,
        madhyaDegree: mid,
        madhyaDMS: formatDegDMS(mid),
        madhyaRashi: (Math.floor(mid / 30) + 1) as RashiNumber,
        antaDegree: cuspEnd,
        antaDMS: formatDegDMS(cuspEnd),
        antaRashi: (Math.floor(cuspEnd / 30) + 1) as RashiNumber,
        kp,
        karakas: meta.karaka,
        category: meta.cat,
        aspectingPlanets: [],
      });
    }
  }

  return bhavas;
}


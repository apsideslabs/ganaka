/**
 * Gaṇaka — Classical Navāṃśa (D-9) Mapping & Calculation Engine
 * Defined strictly according to Bṛhat Parāśara Horā Śāstra (BPHS Chapter 6, Ślokas 21–24),
 * Kalyāṇavarmā's Sārāvalī, and Varāhamihira's Bṛhat Jātaka.
 *
 * Each Rāśi (30°00'00") is divided into 9 equal Navāṃśas of 3°20'00" (3.333333°).
 *
 * Classical Assignment Rule (Tattva / Element Starting Signs):
 * 1. Fiery Signs (Meṣa, Siṃha, Dhanu - 1, 5, 9):
 *    Navāṃśas begin from Meṣa (Aries = 1) through Dhanu (Sagittarius = 9).
 * 2. Earthy Signs (Vṛṣabha, Kanyā, Makara - 2, 6, 10):
 *    Navāṃśas begin from Makara (Capricorn = 10) through Kanyā (Virgo = 6).
 * 3. Airy Signs (Mithuna, Tulā, Kumbha - 3, 7, 11):
 *    Navāṃśas begin from Tulā (Libra = 7) through Mithuna (Gemini = 3).
 * 4. Watery Signs (Karka, Vṛścika, Mīna - 4, 8, 12):
 *    Navāṃśas begin from Karka (Cancer = 4) through Mīna (Pisces = 12).
 */

import { RashiNumber, RashiInfo } from '../jyotisha/types';
import { RASHIS, NAKSHATRAS } from '../jyotisha/constants';
import { PlanetId } from '../astronomy/ephemeris';

export interface NavamshaDivision {
  navamshaNumber: number; // 1 to 9
  startDegree: number; // e.g. 0.0, 3.333333, 6.666667
  endDegree: number; // e.g. 3.333333, 6.666667, 10.0
  startDegreeFormatted: string; // e.g. "00°00'00\""
  endDegreeFormatted: string; // e.g. "03°20'00\""
  rangeFormatted: string; // e.g. "00°00' – 03°20'"
  navamshaRashiNumber: RashiNumber; // 1 to 12
  navamshaRashiName: string; // e.g. "Aries"
  navamshaRashiSanskrit: string; // e.g. "Meṣa"
  navamshaRashiDevanagari: string; // e.g. "मेष"
  navamshaLord: string; // e.g. "mars"
  navamshaElement: string; // e.g. "Fire"
  isVargottama: boolean;
  isPushkara: boolean;
  nakshatraName: string;
  nakshatraPada: number;
}

export interface RashiNavamshaTable {
  rashiNumber: RashiNumber;
  rashiName: string;
  rashiSanskrit: string;
  rashiDevanagari: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  mobility: string;
  lord: string;
  startSignNumber: RashiNumber;
  startSignSanskrit: string;
  divisions: NavamshaDivision[];
}

export interface CalculatedNavamshaPosition {
  entityId: string; // 'lagna' | PlanetId
  entityName: string;
  entitySanskrit: string;
  siderealLongitude: number;
  rashiNumber: RashiNumber;
  rashiName: string;
  rashiSanskrit: string;
  degreeInRashi: number;
  formattedDegreeInRashi: string; // e.g. "14°28'32\""
  navamshaNumber: number; // 1 to 9
  degreeRangeFormatted: string; // e.g. "13°20' – 16°40'"
  navamshaRashiNumber: RashiNumber;
  navamshaRashiName: string;
  navamshaRashiSanskrit: string;
  navamshaRashiDevanagari: string;
  navamshaLord: string;
  degreeInNavamsha: number; // 0° to 30° inside D9
  formattedDegreeInNavamsha: string;
  houseInD9: number; // House from D9 Lagna (1 to 12)
  isVargottama: boolean;
  isPushkara: boolean;
  nakshatraName: string;
  nakshatraPada: number;
}

export const NAVAMSHA_SPAN_DEG = 30.0 / 9.0; // 3°20' = 3.3333333333333335°

/**
 * Returns the starting Navāṃśa sign (1 to 12) for a given source Rāśi per classical BPHS rules.
 */
export function getNavamshaStartRashi(rashiNumber: RashiNumber): RashiNumber {
  const element = RASHIS[rashiNumber].element;
  switch (element) {
    case 'Fire':
      return 1; // Mesha
    case 'Earth':
      return 10; // Makara
    case 'Air':
      return 7; // Tula
    case 'Water':
      return 4; // Karka
    default:
      return 1;
  }
}

/**
 * Formats a decimal degree into Classical DMS (DD°MM'SS") notation.
 */
export function formatDegreesDMS(deg: number): string {
  const d = Math.floor(deg);
  const totalSeconds = Math.round((deg - d) * 3600);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${d.toString().padStart(2, '0')}°${m.toString().padStart(2, '0')}'${s.toString().padStart(2, '0')}"`;
}

/**
 * Formats a degree range into a concise string: "00°00' – 03°20'"
 */
export function formatNavamshaRange(startDeg: number, endDeg: number): string {
  const startM = Math.round(startDeg * 60);
  const endM = Math.round(endDeg * 60);

  const startD = Math.floor(startM / 60);
  const startMin = startM % 60;

  const endD = Math.floor(endM / 60);
  const endMin = endM % 60;

  return `${startD.toString().padStart(2, '0')}°${startMin.toString().padStart(2, '0')}' – ${endD.toString().padStart(2, '0')}°${endMin.toString().padStart(2, '0')}'`;
}

/**
 * Checks if a Navāṃśa division is a classical Puṣkara Navāṃśa.
 * Fire signs: 7th (Tula) & 9th (Dhanu)
 * Earth signs: 3rd (Mina) & 5th (Vrishabha)
 * Air signs: 6th (Mina) & 8th (Dhanu)
 * Water signs: 1st (Karka) & 3rd (Kanya)
 */
export function isPushkaraNavamsha(sourceRashi: RashiNumber, navamshaNumber: number): boolean {
  const element = RASHIS[sourceRashi].element;
  if (element === 'Fire') {
    return navamshaNumber === 7 || navamshaNumber === 9;
  } else if (element === 'Earth') {
    return navamshaNumber === 3 || navamshaNumber === 5;
  } else if (element === 'Air') {
    return navamshaNumber === 6 || navamshaNumber === 8;
  } else if (element === 'Water') {
    return navamshaNumber === 1 || navamshaNumber === 3;
  }
  return false;
}

/**
 * Determines corresponding Nakshatra and Pada (1..4) from source sign and Navamsha index.
 */
export function getNakshatraPadaForNavamsha(sourceRashi: RashiNumber, navamshaIndex: number): { nakshatraName: string; nakshatraPada: number } {
  // Total absolute navamsha count from 0° Aries = (sourceRashi - 1) * 9 + navamshaIndex (0..107)
  const totalNavIndex = (sourceRashi - 1) * 9 + navamshaIndex;
  const nakshatraIndex = Math.floor(totalNavIndex / 4); // 0..26
  const pada = (totalNavIndex % 4) + 1; // 1..4

  const nakInfo = NAKSHATRAS[nakshatraIndex];
  return {
    nakshatraName: nakInfo ? nakInfo.sanskritName : `Nakshatra #${nakshatraIndex + 1}`,
    nakshatraPada: pada,
  };
}

/**
 * Calculates the exact Navāṃśa for any given Rāśi (1..12) and degree within that Rāśi (0° to 30°).
 *
 * Calculation Pipeline:
 * Rāśi + exact degree → Navāṃśa number (1–9) → Resulting Navāṃśa Rāśi
 */
export function calculateNavamsha(
  rashiNumber: RashiNumber,
  degreeInRashi: number
): {
  navamshaNumber: number; // 1 to 9
  startDegree: number;
  endDegree: number;
  rangeFormatted: string;
  navamshaRashiNumber: RashiNumber;
  navamshaRashi: RashiInfo;
  degreeInNavamsha: number;
  isVargottama: boolean;
  isPushkara: boolean;
  nakshatraName: string;
  nakshatraPada: number;
} {
  // Clamp degree safely between 0 and 29.999999
  const clampedDeg = Math.max(0, Math.min(29.9999999, degreeInRashi));
  const navamshaIndex = Math.floor(clampedDeg / NAVAMSHA_SPAN_DEG); // 0 to 8
  const navamshaNumber = navamshaIndex + 1; // 1 to 9

  const startDeg = navamshaIndex * NAVAMSHA_SPAN_DEG;
  const endDeg = (navamshaIndex + 1) * NAVAMSHA_SPAN_DEG;
  const rangeFormatted = formatNavamshaRange(startDeg, endDeg);

  const startSign = getNavamshaStartRashi(rashiNumber);
  const targetRashiNumber = (((startSign - 1 + navamshaIndex) % 12) + 1) as RashiNumber;
  const targetRashi = RASHIS[targetRashiNumber];

  // Degree within the 30° span of the resulting D9 house
  const fractionInPart = (clampedDeg - startDeg) / NAVAMSHA_SPAN_DEG;
  const degreeInNavamsha = fractionInPart * 30.0;

  const isVargottama = targetRashiNumber === rashiNumber;
  const isPushkara = isPushkaraNavamsha(rashiNumber, navamshaNumber);
  const { nakshatraName, nakshatraPada } = getNakshatraPadaForNavamsha(rashiNumber, navamshaIndex);

  return {
    navamshaNumber,
    startDegree: startDeg,
    endDegree: endDeg,
    rangeFormatted,
    navamshaRashiNumber: targetRashiNumber,
    navamshaRashi: targetRashi,
    degreeInNavamsha,
    isVargottama,
    isPushkara,
    nakshatraName,
    nakshatraPada,
  };
}

/**
 * Returns the complete 12 Rāśi × 9 Navāṃśa Classical Canonical Reference Mapping Table.
 */
export function getCompleteNavamshaMappingTable(): RashiNavamshaTable[] {
  const table: RashiNavamshaTable[] = [];

  for (let r = 1; r <= 12; r++) {
    const rNum = r as RashiNumber;
    const rInfo = RASHIS[rNum];
    const startSignNum = getNavamshaStartRashi(rNum);
    const startSignInfo = RASHIS[startSignNum];

    const divisions: NavamshaDivision[] = [];

    for (let i = 0; i < 9; i++) {
      const navNumber = i + 1;
      const startDeg = i * NAVAMSHA_SPAN_DEG;
      const endDeg = (i + 1) * NAVAMSHA_SPAN_DEG;
      const navRashiNum = (((startSignNum - 1 + i) % 12) + 1) as RashiNumber;
      const navRashiInfo = RASHIS[navRashiNum];
      const isVarg = navRashiNum === rNum;
      const isPushk = isPushkaraNavamsha(rNum, navNumber);
      const { nakshatraName, nakshatraPada } = getNakshatraPadaForNavamsha(rNum, i);

      divisions.push({
        navamshaNumber: navNumber,
        startDegree: startDeg,
        endDegree: endDeg,
        startDegreeFormatted: formatDegreesDMS(startDeg),
        endDegreeFormatted: formatDegreesDMS(endDeg),
        rangeFormatted: formatNavamshaRange(startDeg, endDeg),
        navamshaRashiNumber: navRashiNum,
        navamshaRashiName: navRashiInfo.name,
        navamshaRashiSanskrit: navRashiInfo.sanskritName,
        navamshaRashiDevanagari: navRashiInfo.devanagari,
        navamshaLord: navRashiInfo.lord,
        navamshaElement: navRashiInfo.element,
        isVargottama: isVarg,
        isPushkara: isPushk,
        nakshatraName,
        nakshatraPada,
      });
    }

    table.push({
      rashiNumber: rNum,
      rashiName: rInfo.name,
      rashiSanskrit: rInfo.sanskritName,
      rashiDevanagari: rInfo.devanagari,
      element: rInfo.element as any,
      mobility: rInfo.mobility,
      lord: rInfo.lord,
      startSignNumber: startSignNum,
      startSignSanskrit: startSignInfo.sanskritName,
      divisions,
    });
  }

  return table;
}

/**
 * Calculates Navāṃśa mappings for Lagna and all active Grahas in a Jyotiṣa horoscope.
 */
export function calculateChartNavamshaBreakdown(
  lagna: { siderealLongitude: number; rashiNumber: RashiNumber; degreeInRashi?: number; longitudeInRashi?: number },
  planets: Record<PlanetId, { siderealLongitude: number; rashiNumber: RashiNumber; degreeInRashi?: number; longitudeInRashi?: number }>
): {
  lagnaNavamsha: CalculatedNavamshaPosition;
  planetsNavamsha: CalculatedNavamshaPosition[];
  vargottamaCount: number;
  pushkaraCount: number;
} {
  const lagnaDeg = lagna.degreeInRashi ?? lagna.longitudeInRashi ?? 0;
  // 1. Calculate Lagna Navamsha
  const lagnaNav = calculateNavamsha(lagna.rashiNumber, lagnaDeg);
  const lagnaRashiInfo = RASHIS[lagna.rashiNumber];
  const d9LagnaRashi = lagnaNav.navamshaRashiNumber;

  const lagnaPosition: CalculatedNavamshaPosition = {
    entityId: 'lagna',
    entityName: 'Ascendant (Lagna)',
    entitySanskrit: 'Lagna',
    siderealLongitude: lagna.siderealLongitude,
    rashiNumber: lagna.rashiNumber,
    rashiName: lagnaRashiInfo.name,
    rashiSanskrit: lagnaRashiInfo.sanskritName,
    degreeInRashi: lagnaDeg,
    formattedDegreeInRashi: formatDegreesDMS(lagnaDeg),
    navamshaNumber: lagnaNav.navamshaNumber,
    degreeRangeFormatted: lagnaNav.rangeFormatted,
    navamshaRashiNumber: lagnaNav.navamshaRashiNumber,
    navamshaRashiName: lagnaNav.navamshaRashi.name,
    navamshaRashiSanskrit: lagnaNav.navamshaRashi.sanskritName,
    navamshaRashiDevanagari: lagnaNav.navamshaRashi.devanagari,
    navamshaLord: lagnaNav.navamshaRashi.lord,
    degreeInNavamsha: lagnaNav.degreeInNavamsha,
    formattedDegreeInNavamsha: formatDegreesDMS(lagnaNav.degreeInNavamsha),
    houseInD9: 1, // Lagna is 1st house in D9
    isVargottama: lagnaNav.isVargottama,
    isPushkara: lagnaNav.isPushkara,
    nakshatraName: lagnaNav.nakshatraName,
    nakshatraPada: lagnaNav.nakshatraPada,
  };

  // 2. Calculate Planets Navamsha
  const planetsList: CalculatedNavamshaPosition[] = [];
  let vargottamaCount = lagnaPosition.isVargottama ? 1 : 0;
  let pushkaraCount = lagnaPosition.isPushkara ? 1 : 0;

  const planetOrder: PlanetId[] = [
    'sun',
    'moon',
    'mars',
    'mercury',
    'jupiter',
    'venus',
    'saturn',
    'rahu',
    'ketu',
  ];

  for (const pId of planetOrder) {
    const p = planets[pId];
    if (!p) continue;

    const pDeg = p.longitudeInRashi ?? p.degreeInRashi ?? 0;
    const pNav = calculateNavamsha(p.rashiNumber, pDeg);
    const pRashiInfo = RASHIS[p.rashiNumber];
    const houseInD9 = (((pNav.navamshaRashiNumber - d9LagnaRashi + 12) % 12) + 1);

    if (pNav.isVargottama) vargottamaCount++;
    if (pNav.isPushkara) pushkaraCount++;

    const sanskritNames: Partial<Record<PlanetId, string>> = {
      sun: 'Sūrya',
      moon: 'Candra',
      mars: 'Maṅgala',
      mercury: 'Budha',
      jupiter: 'Guru',
      venus: 'Śukra',
      saturn: 'Śani',
      rahu: 'Rāhu',
      ketu: 'Ketu',
      true_rahu: 'Rāhu (True)',
      true_ketu: 'Ketu (True)',
    };

    planetsList.push({
      entityId: pId,
      entityName: pId.charAt(0).toUpperCase() + pId.slice(1),
      entitySanskrit: sanskritNames[pId] || pId,
      siderealLongitude: p.siderealLongitude,
      rashiNumber: p.rashiNumber,
      rashiName: pRashiInfo.name,
      rashiSanskrit: pRashiInfo.sanskritName,
      degreeInRashi: pDeg,
      formattedDegreeInRashi: formatDegreesDMS(pDeg),
      navamshaNumber: pNav.navamshaNumber,
      degreeRangeFormatted: pNav.rangeFormatted,
      navamshaRashiNumber: pNav.navamshaRashiNumber,
      navamshaRashiName: pNav.navamshaRashi.name,
      navamshaRashiSanskrit: pNav.navamshaRashi.sanskritName,
      navamshaRashiDevanagari: pNav.navamshaRashi.devanagari,
      navamshaLord: pNav.navamshaRashi.lord,
      degreeInNavamsha: pNav.degreeInNavamsha,
      formattedDegreeInNavamsha: formatDegreesDMS(pNav.degreeInNavamsha),
      houseInD9,
      isVargottama: pNav.isVargottama,
      isPushkara: pNav.isPushkara,
      nakshatraName: pNav.nakshatraName,
      nakshatraPada: pNav.nakshatraPada,
    });
  }

  return {
    lagnaNavamsha: lagnaPosition,
    planetsNavamsha: planetsList,
    vargottamaCount,
    pushkaraCount,
  };
}

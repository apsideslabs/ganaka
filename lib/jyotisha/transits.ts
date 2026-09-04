/**
 * Gaṇaka — Classical Gochara (Transit) & Śani Sāḍhē Sātī Analysis Engine
 * Reference: Phaladeepika Ch. 26 & BPHS
 */

import { PlanetId, calculateAllPlanets } from '../astronomy/ephemeris';
import { calculateJulianDay } from '../astronomy/julian';
import { AyanamshaType } from '../astronomy/ayanamsha';
import { RashiNumber, CalculatedPlanet } from './types';
import { RASHIS, GRAHA_PROPERTIES } from './constants';

export interface TransitPlanetStatus {
  id: PlanetId;
  name: string;
  sanskritName: string;
  devanagari: string;
  transitRashi: RashiNumber;
  transitRashiName: string;
  transitDegreeInRashi: number;
  transitLongitude: number;
  isRetrograde: boolean;
  houseFromNatalMoon: number;
  houseFromNatalLagna: number;
  isBeneficTransitFromMoon: boolean;
  vedhaHouse?: number;
  hasVedhaObstruction?: boolean;
  obstructingPlanets?: PlanetId[];
  transitEffectsSummary: string;
}

export interface SadeSatiStatus {
  isActive: boolean;
  phase: 'Not Active' | 'Phase 1 (Rising / 12th from Moon)' | 'Phase 2 (Peak / 1st on Moon)' | 'Phase 3 (Setting / 2nd from Moon)';
  saturnNatalHouseFromMoon: number;
  kantakaShani: boolean; // 4th or 10th from Moon/Lagna
  ashtamaShani: boolean; // 8th from Moon/Lagna
  dhairyaDescription: string;
}

/**
 * Benefic Gochara and corresponding Vedha (Obstruction) pairs from Moon per Phaladeepika Ch. 26:
 * Format: { beneficHouse: vedhaHouse }
 */
const VEDHA_PAIRS: Partial<Record<PlanetId, Record<number, number>>> = {
  sun: { 3: 9, 6: 12, 10: 4, 11: 5 },
  moon: { 1: 5, 3: 9, 6: 12, 7: 2, 10: 4, 11: 8 },
  mars: { 3: 12, 6: 9, 11: 5 },
  mercury: { 2: 5, 4: 3, 6: 9, 8: 1, 10: 8, 11: 12 },
  jupiter: { 2: 12, 5: 4, 7: 3, 9: 10, 11: 8 },
  venus: { 1: 8, 2: 7, 3: 1, 4: 10, 5: 9, 8: 5, 9: 11, 11: 6, 12: 3 },
  saturn: { 3: 12, 6: 9, 11: 5 },
  rahu: { 3: 12, 6: 9, 10: 4, 11: 5 },
  ketu: { 3: 12, 6: 9, 11: 5 },
};

export function calculateCurrentTransits(
  natalMoonRashi: RashiNumber,
  natalLagnaRashi: RashiNumber,
  ayanamshaType: AyanamshaType = 'lahiri',
  transitDate: Date = new Date()
): {
  transitDateStr: string;
  transitJD: number;
  rawPlanets: any;
  planets: TransitPlanetStatus[];
  sadeSati: SadeSatiStatus;
} {
  const tYear = transitDate.getUTCFullYear();
  const tMonth = transitDate.getUTCMonth() + 1;
  const tDay = transitDate.getUTCDate();
  const tHour = transitDate.getUTCHours();
  const tMin = transitDate.getUTCMinutes();
  const tSec = transitDate.getUTCSeconds();

  const jd = calculateJulianDay(tYear, tMonth, tDay, tHour, tMin, tSec);
  const rawTransitPlanets = calculateAllPlanets(jd, ayanamshaType);

  const planetList: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
  const intermediate: Array<{
    pid: PlanetId;
    raw: any;
    rNum: RashiNumber;
    degInRashi: number;
    houseFromMoon: number;
    houseFromLagna: number;
  }> = [];

  // Map raw positions first to allow cross-planet Vedha checking
  for (const pid of planetList) {
    const raw = rawTransitPlanets[pid];
    if (!raw) continue;

    const rNum = (Math.floor(raw.siderealLongitude / 30) + 1) as RashiNumber;
    const degInRashi = raw.siderealLongitude % 30;
    const houseFromMoon = ((rNum - natalMoonRashi + 12) % 12) + 1;
    const houseFromLagna = ((rNum - natalLagnaRashi + 12) % 12) + 1;

    intermediate.push({
      pid,
      raw,
      rNum,
      degInRashi,
      houseFromMoon,
      houseFromLagna,
    });
  }

  const transitPlanets: TransitPlanetStatus[] = [];

  for (const item of intermediate) {
    const pairs = VEDHA_PAIRS[item.pid] || {};
    const isNominallyBenefic = Object.keys(pairs).map(Number).includes(item.houseFromMoon);
    const expectedVedhaHouse = pairs[item.houseFromMoon];

    let hasVedha = false;
    const obstructors: PlanetId[] = [];

    if (isNominallyBenefic && expectedVedhaHouse !== undefined) {
      // Check if any transit planet is sitting in the vedha house
      for (const other of intermediate) {
        if (other.pid === item.pid) continue;
        // Classical exemptions:
        // Sun and Saturn do not cause Vedha to each other (father and son)
        if ((item.pid === 'sun' && other.pid === 'saturn') || (item.pid === 'saturn' && other.pid === 'sun')) continue;
        // Moon and Mercury do not cause Vedha to each other
        if ((item.pid === 'moon' && other.pid === 'mercury') || (item.pid === 'mercury' && other.pid === 'moon')) continue;

        if (other.houseFromMoon === expectedVedhaHouse) {
          hasVedha = true;
          obstructors.push(other.pid);
        }
      }
    }

    let summary = '';
    if (isNominallyBenefic) {
      if (hasVedha) {
        summary = `Benefic Gochara in ${item.houseFromMoon}th from Moon, but partially obstructed by Vedha (${obstructors.map((o) => GRAHA_PROPERTIES[o]?.sanskritName || o).join(', ')} in ${expectedVedhaHouse}th house).`;
      } else {
        summary = `Unobstructed Benefic Gochara in ${item.houseFromMoon}th house from Moon (Śubha Phala).`;
      }
    } else {
      summary = `Inauspicious/Mixed Gochara in ${item.houseFromMoon}th from Moon; requires caution and disciplined action.`;
    }

    if (item.pid === 'jupiter' && isNominallyBenefic && !hasVedha) {
      summary = `Prime Guru Gochara in auspicious ${item.houseFromMoon}th house (Brahma Tejas & auspicious expansion).`;
    }

    transitPlanets.push({
      id: item.pid,
      name: item.raw.name,
      sanskritName: item.raw.sanskritName,
      devanagari: item.raw.devanagari,
      transitRashi: item.rNum,
      transitRashiName: RASHIS[item.rNum].sanskritName,
      transitDegreeInRashi: item.degInRashi,
      transitLongitude: item.raw.siderealLongitude,
      isRetrograde: item.raw.isRetrograde,
      houseFromNatalMoon: item.houseFromMoon,
      houseFromNatalLagna: item.houseFromLagna,
      isBeneficTransitFromMoon: isNominallyBenefic && !hasVedha,
      vedhaHouse: expectedVedhaHouse,
      hasVedhaObstruction: hasVedha,
      obstructingPlanets: obstructors,
      transitEffectsSummary: summary,
    });
  }

  // Calculate Saturn Sade Sati & Dhaiya
  const saturnTransit = transitPlanets.find((p) => p.id === 'saturn');
  const saturnHouseFromMoon = saturnTransit ? saturnTransit.houseFromNatalMoon : 1;
  const saturnHouseFromLagna = saturnTransit ? saturnTransit.houseFromNatalLagna : 1;

  let sadeSatiActive = false;
  let sadeSatiPhase: SadeSatiStatus['phase'] = 'Not Active';
  let kantaka = saturnHouseFromMoon === 4 || saturnHouseFromMoon === 10 || saturnHouseFromLagna === 4 || saturnHouseFromLagna === 10;
  let ashtama = saturnHouseFromMoon === 8 || saturnHouseFromLagna === 8;
  let dhairyaDesc = 'No major adverse Saturn transit active at present.';

  if (saturnHouseFromMoon === 12) {
    sadeSatiActive = true;
    sadeSatiPhase = 'Phase 1 (Rising / 12th from Moon)';
    dhairyaDesc = 'Śani Sāḍhē Sātī Phase 1 (Ārohaṇa / 12th from Moon): Financial restructuring, foreign travels, mental recalibration.';
  } else if (saturnHouseFromMoon === 1) {
    sadeSatiActive = true;
    sadeSatiPhase = 'Phase 2 (Peak / 1st on Moon)';
    dhairyaDesc = 'Śani Sāḍhē Sātī Phase 2 (Janma Śani / Peak): Deep personal transformation, heavy responsibilities, character forging.';
  } else if (saturnHouseFromMoon === 2) {
    sadeSatiActive = true;
    sadeSatiPhase = 'Phase 3 (Setting / 2nd from Moon)';
    dhairyaDesc = 'Śani Sāḍhē Sātī Phase 3 (Avarohaṇa / 2nd from Moon): Family affairs, resource consolidation, concluding lesson cycle.';
  } else if (ashtama) {
    dhairyaDesc = 'Aṣṭama Śani (8th from Moon/Lagna): Vigilance needed for physical health, sudden transitions, and deep occult insight.';
  } else if (kantaka) {
    dhairyaDesc = 'Kaṇṭaka Śani (4th or 10th from Moon/Lagna): Professional or domestic workload increases, requiring steady persistence.';
  }

  const y = transitDate.getUTCFullYear();
  const m = (transitDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = transitDate.getUTCDate().toString().padStart(2, '0');

  return {
    transitDateStr: `${y}-${m}-${d}`,
    transitJD: jd,
    rawPlanets: rawTransitPlanets,
    planets: transitPlanets,
    sadeSati: {
      isActive: sadeSatiActive,
      phase: sadeSatiPhase,
      saturnNatalHouseFromMoon: saturnHouseFromMoon,
      kantakaShani: kantaka,
      ashtamaShani: ashtama,
      dhairyaDescription: dhairyaDesc,
    },
  };
}


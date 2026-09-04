/**
 * Gaṇaka — Classical Parāśari & Jaimini Aspect (Dṛṣṭi) Engine
 * Reference: Bṛhat Parāśara Horā Śāstra, Ch. 26 (Dṛṣṭi Adhyāya) & Jaimini Upadeśa Sūtras
 */

import { PlanetId } from '../astronomy/ephemeris';
import { RashiNumber, CalculatedPlanet } from './types';
import { RASHIS } from './constants';

export interface GrahaAspectDetail {
  fromPlanet: PlanetId;
  toPlanet: PlanetId;
  angleDiff: number; // 0 to 360
  aspectStrengthVirupas: number; // 0 to 60 virupas (60 = 100% full aspect)
  isSpecialAspect: boolean;
  aspectDescription: string;
}

export interface RashiDrishtiDetail {
  sourceRashi: RashiNumber;
  sourceRashiName: string;
  aspectsRashis: RashiNumber[];
  aspectsRashiNames: string[];
  planetsInSource: PlanetId[];
  aspectingPlanets: PlanetId[];
}

/**
 * Calculates Parāśari Graha Dṛṣṭi (Planetary Aspect) strength in Virūpas (0-60)
 * All planets have 7th house full aspect (60 virupas / 100%).
 * Special aspects:
 * - Mars: 4th (100%) and 8th (100%)
 * - Jupiter: 5th (100%) and 9th (100%)
 * - Saturn: 3rd (100%) and 10th (100%)
 * - Rahu/Ketu: 5th (100%) and 9th (100%)
 */
export function calculateGrahaAspectStrength(
  fromPlanet: PlanetId,
  fromDeg: number,
  toDeg: number
): { virupas: number; isSpecial: boolean; desc: string } {
  let diff = (toDeg - fromDeg + 360) % 360;

  let virupas = 0;
  let isSpecial = false;
  let desc = '';

  // 1. Classical 7th house (opposition ~180°) aspect for all grahas
  if (diff >= 150 && diff <= 210) {
    // Peak at 180° = 60 virupas
    const distFrom180 = Math.abs(diff - 180);
    virupas = Math.max(0, Math.round(60 - distFrom180 * 1.5));
    desc = '7th House Full Aspect (Saptama Dṛṣṭi)';
  }

  // 2. Special Mars (Maṅgala) aspects: 4th (~90°) and 8th (~210°-240°)
  if (fromPlanet === 'mars') {
    if (diff >= 75 && diff <= 105) {
      const distFrom90 = Math.abs(diff - 90);
      const str = Math.max(0, Math.round(60 - distFrom90 * 2));
      if (str > virupas) {
        virupas = str;
        isSpecial = true;
        desc = 'Mars 4th Special Aspect (Caturtha Dṛṣṭi)';
      }
    } else if (diff >= 210 && diff <= 240) {
      const distFrom225 = Math.abs(diff - 225);
      const str = Math.max(0, Math.round(60 - distFrom225 * 2));
      if (str > virupas) {
        virupas = str;
        isSpecial = true;
        desc = 'Mars 8th Special Aspect (Aṣṭama Dṛṣṭi)';
      }
    }
  }

  // 3. Special Jupiter (Guru) and Rahu/Ketu aspects: 5th (~120°) and 9th (~240°)
  if (fromPlanet === 'jupiter' || fromPlanet === 'rahu' || fromPlanet === 'ketu') {
    if (diff >= 105 && diff <= 135) {
      const distFrom120 = Math.abs(diff - 120);
      const str = Math.max(0, Math.round(60 - distFrom120 * 2));
      if (str > virupas) {
        virupas = str;
        isSpecial = true;
        desc = `${fromPlanet === 'jupiter' ? 'Jupiter' : 'Node'} 5th Special Aspect (Pañcama Dṛṣṭi - Trine)`;
      }
    } else if (diff >= 225 && diff <= 255) {
      const distFrom240 = Math.abs(diff - 240);
      const str = Math.max(0, Math.round(60 - distFrom240 * 2));
      if (str > virupas) {
        virupas = str;
        isSpecial = true;
        desc = `${fromPlanet === 'jupiter' ? 'Jupiter' : 'Node'} 9th Special Aspect (Navama Dṛṣṭi - Trine)`;
      }
    }
  }

  // 4. Special Saturn (Śani) aspects: 3rd (~60°) and 10th (~270°)
  if (fromPlanet === 'saturn') {
    if (diff >= 45 && diff <= 75) {
      const distFrom60 = Math.abs(diff - 60);
      const str = Math.max(0, Math.round(60 - distFrom60 * 2));
      if (str > virupas) {
        virupas = str;
        isSpecial = true;
        desc = 'Saturn 3rd Special Aspect (Tṛtīya Dṛṣṭi)';
      }
    } else if (diff >= 255 && diff <= 285) {
      const distFrom270 = Math.abs(diff - 270);
      const str = Math.max(0, Math.round(60 - distFrom270 * 2));
      if (str > virupas) {
        virupas = str;
        isSpecial = true;
        desc = 'Saturn 10th Special Aspect (Daśama Dṛṣṭi)';
      }
    }
  }

  // General 3/10 (1/4 aspect ~15 virupas) and 5/9 (1/2 aspect ~30 virupas) and 4/8 (3/4 aspect ~45 virupas)
  if (virupas === 0) {
    if (diff >= 105 && diff <= 135) {
      virupas = 30; // Half aspect
      desc = '5th House Secondary Aspect (30 Virūpas)';
    } else if (diff >= 75 && diff <= 105) {
      virupas = 45; // Three-quarter aspect
      desc = '4th House Secondary Aspect (45 Virūpas)';
    } else if (diff >= 45 && diff <= 75) {
      virupas = 15; // One-quarter aspect
      desc = '3rd House Secondary Aspect (15 Virūpas)';
    }
  }

  return { virupas, isSpecial, desc };
}

/**
 * Calculates complete Mutual Aspect Matrix between all 9 Vedic Grahas
 */
export function calculateMutualAspectMatrix(
  planets: Record<PlanetId, CalculatedPlanet>
): GrahaAspectDetail[] {
  const planetList: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
  const matrix: GrahaAspectDetail[] = [];

  for (const fromP of planetList) {
    const p1 = planets[fromP];
    if (!p1) continue;

    for (const toP of planetList) {
      if (fromP === toP) continue;
      const p2 = planets[toP];
      if (!p2) continue;

      const angle = (p2.siderealLongitude - p1.siderealLongitude + 360) % 360;
      const { virupas, isSpecial, desc } = calculateGrahaAspectStrength(
        fromP,
        p1.siderealLongitude,
        p2.siderealLongitude
      );

      if (virupas > 0) {
        matrix.push({
          fromPlanet: fromP,
          toPlanet: toP,
          angleDiff: Math.round(angle * 10) / 10,
          aspectStrengthVirupas: virupas,
          isSpecialAspect: isSpecial,
          aspectDescription: desc,
        });
      }
    }
  }

  return matrix;
}

/**
 * Jaimini Rāśi Dṛṣṭi (Sign Aspect) rules:
 * - Chara (Movable) signs (1, 4, 7, 10) aspect all Sthira (Fixed) signs EXCEPT the adjacent one.
 * - Sthira (Fixed) signs (2, 5, 8, 11) aspect all Chara (Movable) signs EXCEPT the adjacent one.
 * - Dvisvabhāva (Dual) signs (3, 6, 9, 12) aspect all other Dual signs.
 */
export function calculateJaiminiRashiDrishti(
  planets: Record<PlanetId, CalculatedPlanet>
): RashiDrishtiDetail[] {
  const details: RashiDrishtiDetail[] = [];

  const charaRashis: RashiNumber[] = [1, 4, 7, 10];
  const sthiraRashis: RashiNumber[] = [2, 5, 8, 11];
  const dvisvabhavaRashis: RashiNumber[] = [3, 6, 9, 12];

  for (let r = 1; r <= 12; r++) {
    const rNum = r as RashiNumber;
    const rInfo = RASHIS[rNum];
    let targetedRashis: RashiNumber[] = [];

    if (charaRashis.includes(rNum)) {
      // Aspects all Fixed signs except adjacent (rNum + 1)
      const adjacent = (rNum % 12) + 1;
      targetedRashis = sthiraRashis.filter((s) => s !== adjacent);
    } else if (sthiraRashis.includes(rNum)) {
      // Aspects all Movable signs except adjacent (rNum - 1)
      const adjacent = ((rNum - 2 + 12) % 12) + 1;
      targetedRashis = charaRashis.filter((c) => c !== adjacent);
    } else {
      // Dual signs aspect the other 3 dual signs
      targetedRashis = dvisvabhavaRashis.filter((d) => d !== rNum);
    }

    const planetsInSource = Object.values(planets)
      .filter((p) => p.rashiNumber === rNum)
      .map((p) => p.id);

    const aspectingPlanets = Object.values(planets)
      .filter((p) => targetedRashis.includes(p.rashiNumber))
      .map((p) => p.id);

    details.push({
      sourceRashi: rNum,
      sourceRashiName: rInfo.sanskritName,
      aspectsRashis: targetedRashis,
      aspectsRashiNames: targetedRashis.map((tr) => RASHIS[tr].sanskritName),
      planetsInSource,
      aspectingPlanets,
    });
  }

  return details;
}

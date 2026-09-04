/**
 * Gaṇaka — Jaimini Chara Daśā Calculation Engine
 * Reference: Jaimini Upadeśa Sūtras & K.N. Rao Method
 */

import { PlanetId } from '../astronomy/ephemeris';
import { RashiNumber, CalculatedPlanet } from './types';
import { RASHIS } from './constants';

export interface CharaDashaPeriod {
  rashiNumber: RashiNumber;
  rashiName: string;
  sanskritName: string;
  durationYears: number;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  lord: PlanetId;
  lordPlacementRashi: RashiNumber;
}

const DIRECT_SIGNS: RashiNumber[] = [1, 3, 5, 7, 9, 11]; // Odd signs
const INDIRECT_SIGNS: RashiNumber[] = [2, 4, 6, 8, 10, 12]; // Even signs

/**
 * Calculates Chara Dasha for a native given their Lagna and Planetary positions
 */
export function calculateCharaDasha(
  lagnaRashi: RashiNumber,
  planets: Record<PlanetId, CalculatedPlanet>,
  birthYear: number
): CharaDashaPeriod[] {
  // Determine progression sequence from Lagna
  const isDirect = DIRECT_SIGNS.includes(lagnaRashi);
  const sequence: RashiNumber[] = [];

  if (isDirect) {
    for (let i = 0; i < 12; i++) {
      const r = (((lagnaRashi - 1 + i) % 12) + 1) as RashiNumber;
      sequence.push(r);
    }
  } else {
    for (let i = 0; i < 12; i++) {
      const r = (((lagnaRashi - 1 - i + 120) % 12) + 1) as RashiNumber;
      sequence.push(r);
    }
  }

  const result: CharaDashaPeriod[] = [];
  let currentAge = 0;

  for (const rNum of sequence) {
    const rInfo = RASHIS[rNum];
    const lord = rInfo.lord;
    const lordPlanet = planets[lord];
    const lordRashi = lordPlanet ? lordPlanet.rashiNumber : rNum;

    let duration = 0;
    if (lordRashi === rNum) {
      duration = 12;
    } else {
      const isSignDirect = DIRECT_SIGNS.includes(rNum);
      if (isSignDirect) {
        // Forward count minus 1
        const forwardCount = ((lordRashi - rNum + 12) % 12) + 1;
        duration = forwardCount - 1;
      } else {
        // Backward count minus 1
        const backwardCount = ((rNum - lordRashi + 12) % 12) + 1;
        duration = backwardCount - 1;
      }
      if (duration === 0) duration = 12;
    }

    const startAge = currentAge;
    const endAge = currentAge + duration;
    const startYear = birthYear + startAge;
    const endYear = birthYear + endAge;

    result.push({
      rashiNumber: rNum,
      rashiName: rInfo.name,
      sanskritName: rInfo.sanskritName,
      durationYears: duration,
      startAge,
      endAge,
      startYear,
      endYear,
      lord,
      lordPlacementRashi: lordRashi,
    });

    currentAge = endAge;
  }

  return result;
}

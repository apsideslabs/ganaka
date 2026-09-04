/**
 * Gaṇaka — Dosha Evaluation Core Utilities
 */

import { PlanetId } from '../astronomy/ephemeris';
import { RashiNumber, CalculatedPlanet } from '../jyotisha/types';

export const RASHI_LORDS: Record<RashiNumber, PlanetId> = {
  1: 'mars',
  2: 'venus',
  3: 'mercury',
  4: 'moon',
  5: 'sun',
  6: 'mercury',
  7: 'venus',
  8: 'mars',
  9: 'jupiter',
  10: 'saturn',
  11: 'saturn',
  12: 'jupiter',
};

export const NATURAL_MALEFICS: PlanetId[] = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];
export const NATURAL_BENEFICS: PlanetId[] = ['jupiter', 'venus', 'mercury', 'moon'];

export function getHouseLord(house: number, lagnaRashi: RashiNumber): PlanetId {
  const rashiNumber = ((((lagnaRashi - 1) + (house - 1)) % 12) + 1) as RashiNumber;
  return RASHI_LORDS[rashiNumber];
}

export function getRashiFromHouse(house: number, lagnaRashi: RashiNumber): RashiNumber {
  return ((((lagnaRashi - 1) + (house - 1)) % 12) + 1) as RashiNumber;
}

export function getHouseFromRashi(rashi: RashiNumber, lagnaRashi: RashiNumber): number {
  return (((rashi - lagnaRashi + 12) % 12) + 1);
}

export function isExalted(planet: PlanetId, rashi: RashiNumber): boolean {
  const exaltationMap: Partial<Record<PlanetId, RashiNumber>> = {
    sun: 1,      // Aries
    moon: 2,     // Taurus
    mars: 10,    // Capricorn
    mercury: 6,  // Virgo
    jupiter: 4,  // Cancer
    venus: 12,   // Pisces
    saturn: 7,   // Libra
    rahu: 2,     // Taurus / Gemini
    ketu: 8,     // Scorpio / Sagittarius
  };
  return exaltationMap[planet] === rashi;
}

export function isDebilitated(planet: PlanetId, rashi: RashiNumber): boolean {
  const debilityMap: Partial<Record<PlanetId, RashiNumber>> = {
    sun: 7,      // Libra
    moon: 8,     // Scorpio
    mars: 4,     // Cancer
    mercury: 12, // Pisces
    jupiter: 10, // Capricorn
    venus: 6,    // Virgo
    saturn: 1,   // Aries
    rahu: 8,     // Scorpio
    ketu: 2,     // Taurus
  };
  return debilityMap[planet] === rashi;
}

export function isOwnSign(planet: PlanetId, rashi: RashiNumber): boolean {
  return RASHI_LORDS[rashi] === planet;
}

export function isMoolatrikona(planet: PlanetId, rashi: RashiNumber, degree: number): boolean {
  switch (planet) {
    case 'sun': return rashi === 5 && degree <= 20; // Leo 0-20°
    case 'moon': return rashi === 2 && degree > 3 && degree <= 30; // Taurus 3-30°
    case 'mars': return rashi === 1 && degree <= 12; // Aries 0-12°
    case 'mercury': return rashi === 6 && degree > 15 && degree <= 20; // Virgo 15-20°
    case 'jupiter': return rashi === 9 && degree <= 10; // Sagittarius 0-10°
    case 'venus': return rashi === 7 && degree <= 15; // Libra 0-15°
    case 'saturn': return rashi === 11 && degree <= 20; // Aquarius 0-20°
    default: return false;
  }
}

export function isKendra(house: number): boolean {
  return [1, 4, 7, 10].includes(house);
}

export function isTrikona(house: number): boolean {
  return [1, 5, 9].includes(house);
}

export function isDusthana(house: number): boolean {
  return [6, 8, 12].includes(house);
}

export function isTrishadaya(house: number): boolean {
  return [3, 6, 11].includes(house);
}

export function isMaraka(house: number): boolean {
  return [2, 7].includes(house);
}

/**
 * Checks if planet A casts special or general Parāśara aspect on planet B or house H
 */
export function castsAspectOn(fromPlanet: CalculatedPlanet, targetHouse: number): boolean {
  const fromHouse = fromPlanet.house;
  const dist = ((targetHouse - fromHouse + 12) % 12) + 1;

  // 7th house general aspect (all planets)
  if (dist === 7) return true;

  // Mars special aspects (4th and 8th)
  if (fromPlanet.id === 'mars' && (dist === 4 || dist === 8)) return true;

  // Jupiter special aspects (5th and 9th)
  if (fromPlanet.id === 'jupiter' && (dist === 5 || dist === 9)) return true;

  // Saturn special aspects (3rd and 10th)
  if (fromPlanet.id === 'saturn' && (dist === 3 || dist === 10)) return true;

  // Rahu / Ketu 5th and 9th aspects (acknowledged in classical traditions like Jātaka Pārijāta)
  if ((fromPlanet.id === 'rahu' || fromPlanet.id === 'ketu') && (dist === 5 || dist === 9)) return true;

  return false;
}

/**
 * Finds all planets aspecting a given house
 */
export function getAspectingPlanets(targetHouse: number, planets: Record<PlanetId, CalculatedPlanet>): PlanetId[] {
  const aspecting: PlanetId[] = [];
  for (const [pId, pData] of Object.entries(planets)) {
    if (pData.house !== targetHouse && castsAspectOn(pData, targetHouse)) {
      aspecting.push(pId as PlanetId);
    }
  }
  return aspecting;
}

/**
 * Checks if a house is hemmed between natural malefics (Pāpa Kartarī)
 */
export function checkPapaKartari(targetHouse: number, planets: Record<PlanetId, CalculatedPlanet>): {
  isPapaKartari: boolean;
  prevMalefics: PlanetId[];
  nextMalefics: PlanetId[];
} {
  const prevHouse = targetHouse === 1 ? 12 : targetHouse - 1;
  const nextHouse = targetHouse === 12 ? 1 : targetHouse + 1;

  const prevMalefics: PlanetId[] = [];
  const nextMalefics: PlanetId[] = [];

  for (const [pId, p] of Object.entries(planets)) {
    if (NATURAL_MALEFICS.includes(pId as PlanetId)) {
      if (p.house === prevHouse) prevMalefics.push(pId as PlanetId);
      if (p.house === nextHouse) nextMalefics.push(pId as PlanetId);
    }
  }

  return {
    isPapaKartari: prevMalefics.length > 0 && nextMalefics.length > 0,
    prevMalefics,
    nextMalefics,
  };
}

/**
 * Calculates longitudinal angular distance in degrees (0 - 180)
 */
export function getAngularDistance(deg1: number, deg2: number): number {
  const diff = Math.abs(deg1 - deg2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Gaṇaka — Planetary Dignity & Relationship Engine (Pañcadhā Maitrī)
 * Calculates Exaltation, Debilitation, Moolatrikona, Swakshetra,
 * Tatkalika Maitri (Temporal Friendship), Panchadha Maitri (5-fold relationship),
 * Combustion (Astangata), and Aspects (Graha Drishti).
 */

import { PlanetId } from '../astronomy/ephemeris';
import { DignityType, RashiNumber } from './types';
import { GRAHA_PROPERTIES, NATURAL_FRIENDSHIPS, RASHIS } from './constants';
import { normalizeDegrees } from '../astronomy/julian';

/**
 * Calculates whether a planet is combust (Astangata) based on angular distance from Sun.
 */
export function checkCombustion(
  planetId: PlanetId,
  planetLongitude: number,
  sunLongitude: number
): boolean {
  if (planetId === 'sun' || planetId === 'rahu' || planetId === 'ketu' || planetId === 'true_rahu' || planetId === 'true_ketu') {
    return false;
  }

  const prop = GRAHA_PROPERTIES[planetId];
  if (!prop || prop.combustionRadiusDegrees === 0) return false;

  let diff = Math.abs(planetLongitude - sunLongitude);
  if (diff > 180) diff = 360 - diff;

  return diff <= prop.combustionRadiusDegrees;
}

/**
 * Calculates Temporal Friendship (Tatkalika Mitra):
 * Planets placed in 2nd, 3rd, 4th, 10th, 11th, 12th from a planet are its Temporal Friends;
 * Planets in 1st, 5th, 6th, 7th, 8th, 9th are Temporal Enemies.
 */
export function getTatkalikaRelationship(
  planetRashi: RashiNumber,
  otherPlanetRashi: RashiNumber
): 'friend' | 'enemy' {
  if (planetRashi === otherPlanetRashi) return 'enemy';

  let diff = otherPlanetRashi - planetRashi;
  if (diff < 0) diff += 12;
  const houseDistance = diff + 1; // 1 to 12

  const friendHouses = [2, 3, 4, 10, 11, 12];
  return friendHouses.includes(houseDistance) ? 'friend' : 'enemy';
}

/**
 * Calculates the 5-fold relationship (Pañcadhā Maitrī) of a planet with a sign's ruler.
 */
export function getPanchadhaRelationship(
  planetId: PlanetId,
  signRulerId: PlanetId,
  planetRashi: RashiNumber,
  rulerRashi: RashiNumber
): 'Adhi Mitra' | 'Mitra' | 'Sama' | 'Shatru' | 'Adhi Shatru' {
  if (planetId === signRulerId) return 'Sama';

  const natural = NATURAL_FRIENDSHIPS[planetId];
  let natRel: 1 | 0 | -1 = 0; // 1: friend, 0: neutral, -1: enemy
  if (natural.friends.includes(signRulerId)) natRel = 1;
  else if (natural.enemies.includes(signRulerId)) natRel = -1;

  const tatkalika = getTatkalikaRelationship(planetRashi, rulerRashi);
  const tatRel: 1 | -1 = tatkalika === 'friend' ? 1 : -1;

  const total = natRel + tatRel; // range from -2 to +2

  if (total === 2) return 'Adhi Mitra'; // Great Friend
  if (total === 1) return 'Mitra'; // Friend
  if (total === 0) return 'Sama'; // Neutral
  if (total === -1) return 'Shatru'; // Enemy
  return 'Adhi Shatru'; // Great Enemy
}

/**
 * Calculates essential dignity of a planet in a given sign and degree.
 */
export function calculateDignity(
  planetId: PlanetId,
  siderealLongitude: number,
  allPlanetaryPositions: Record<PlanetId, { siderealLongitude: number }>
): DignityType {
  const prop = GRAHA_PROPERTIES[planetId];
  if (!prop) return 'Neutral (Sama)';

  const rashiIndex = Math.floor(siderealLongitude / 30);
  const rashiNumber = (rashiIndex + 1) as RashiNumber;
  const degreeInRashi = siderealLongitude % 30;

  // 1. Check Exaltation (Ucca)
  if (rashiNumber === prop.exaltationSign) {
    return 'Exalted (Ucca)';
  }

  // 2. Check Debilitation (Neecha)
  if (rashiNumber === prop.debilitationSign) {
    return 'Debilitated (Neecha)';
  }

  // 3. Check Moolatrikona
  if (
    rashiNumber === prop.moolatrikonaSign &&
    degreeInRashi >= prop.moolatrikonaDegreeRange[0] &&
    degreeInRashi <= prop.moolatrikonaDegreeRange[1]
  ) {
    return 'Moolatrikona';
  }

  // 4. Check Own Sign (Swakshetra)
  if (prop.ownSigns.includes(rashiNumber)) {
    return 'Own Sign (Swakshetra)';
  }

  // 5. Check Compound Relationship with Sign Lord (Pañcadhā Maitrī)
  const signLordId = RASHIS[rashiNumber].lord;
  const signLordPos = allPlanetaryPositions[signLordId];
  const signLordRashi = signLordPos
    ? ((Math.floor(signLordPos.siderealLongitude / 30) + 1) as RashiNumber)
    : rashiNumber;

  const relationship = getPanchadhaRelationship(
    planetId,
    signLordId,
    rashiNumber,
    signLordRashi
  );

  switch (relationship) {
    case 'Adhi Mitra':
      return 'Great Friend (Adhi Mitra)';
    case 'Mitra':
      return 'Friend (Mitra)';
    case 'Sama':
      return 'Neutral (Sama)';
    case 'Shatru':
      return 'Enemy (Shatru)';
    case 'Adhi Shatru':
      return 'Great Enemy (Adhi Shatru)';
  }
}

/**
 * Calculates planetary aspects (Graha Drishti) on houses (1 to 12).
 */
export function calculateAspects(planetId: PlanetId, planetHouse: number): number[] {
  const prop = GRAHA_PROPERTIES[planetId];
  if (!prop) return [];

  const aspects: number[] = [];
  for (const dist of prop.aspectDistances) {
    let targetHouse = ((planetHouse - 1 + (dist - 1)) % 12) + 1;
    aspects.push(targetHouse);
  }

  return aspects;
}

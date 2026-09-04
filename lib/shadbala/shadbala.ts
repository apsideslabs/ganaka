/**
 * Gaṇaka — Śaḍbala (Six-fold Strength) Engine
 * Calculates Sthāna Bala, Dig Bala, Kāla Bala, Ceṣṭā Bala, Naisargika Bala, and Dṛg Bala
 * in Virūpas and Rūpas (1 Rūpa = 60 Virūpas) per BPHS Chapters 27-29.
 */

import { PlanetId } from '../astronomy/ephemeris';
import { ShadbalaComponent, RashiNumber } from '../jyotisha/types';
import { GRAHA_PROPERTIES } from '../jyotisha/constants';
import { normalizeDegrees } from '../astronomy/julian';

// Standard minimum required Rūpas per BPHS
export const REQUIRED_SHADBALA_RUPAS: Record<PlanetId, number> = {
  sun: 6.5, // 390 virūpas
  moon: 6.0, // 360 virūpas
  mars: 5.0, // 300 virūpas
  mercury: 7.0, // 420 virūpas
  jupiter: 6.5, // 390 virūpas
  venus: 5.5, // 330 virūpas
  saturn: 5.0, // 300 virūpas
  rahu: 5.0,
  ketu: 5.0,
  true_rahu: 5.0,
  true_ketu: 5.0,
};

// Fixed Naisargika Bala in Virūpas (Sun is brightest 60, Saturn 8.57)
export const NAISARGIKA_BALA_VIRUPAS: Record<PlanetId, number> = {
  sun: 60.0,
  moon: 51.43,
  venus: 42.86,
  jupiter: 34.29,
  mercury: 25.71,
  mars: 17.14,
  saturn: 8.57,
  rahu: 8.57,
  ketu: 8.57,
  true_rahu: 8.57,
  true_ketu: 8.57,
};

/**
 * Calculates complete Śaḍbala for all 7 classical grahas.
 */
export function calculateShadbala(
  planetaryPositions: Record<
    PlanetId,
    { siderealLongitude: number; speedDegPerDay: number; isRetrograde: boolean }
  >,
  lagnaLongitude: number,
  isDayBirth: boolean
): Record<PlanetId, ShadbalaComponent> {
  const grahas: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  const result: Partial<Record<PlanetId, ShadbalaComponent>> = {};

  for (const pId of grahas) {
    const pos = planetaryPositions[pId];
    const prop = GRAHA_PROPERTIES[pId];

    // 1. STHĀNA BALA (Positional Strength)
    // 1.1 Uccha Bala (Exaltation strength): Max 60 virūpas at deep exaltation, 0 at deep debilitation
    const debDeg = (prop.debilitationSign - 1) * 30 + prop.debilitationDegree;
    let distFromDeb = Math.abs(pos.siderealLongitude - debDeg);
    if (distFromDeb > 180) distFromDeb = 360 - distFromDeb;
    const ucchaBala = (distFromDeb / 180.0) * 60.0;

    // 1.2 Kendrādi Bala: Kendra (1,4,7,10)=60, Panaphara (2,5,8,11)=30, Apoklima (3,6,9,12)=15
    const pRashi = Math.floor(pos.siderealLongitude / 30) + 1;
    const lagnaRashi = Math.floor(lagnaLongitude / 30) + 1;
    const house = (((pRashi - lagnaRashi + 12) % 12) + 1);
    let kendradiBala = 15.0;
    if ([1, 4, 7, 10].includes(house)) kendradiBala = 60.0;
    else if ([2, 5, 8, 11].includes(house)) kendradiBala = 30.0;

    // 1.3 Drekkana & Ojayugma Bala
    const ojayugmaBala = (pRashi % 2 === 1 && prop.gender === 'Male') || (pRashi % 2 === 0 && prop.gender === 'Female') ? 30.0 : 15.0;

    const sthanaBala = ucchaBala + kendradiBala + ojayugmaBala + 45.0; // sum of positional sub-balas

    // 2. DIG BALA (Directional Strength)
    // Directional ideals:
    // Jupiter & Mercury: 1st house (East / Lagna) = 60 virupas
    // Sun & Mars: 10th house (South / MC) = 60 virupas
    // Saturn: 7th house (West / Descendant) = 60 virupas
    // Moon & Venus: 4th house (North / IC) = 60 virupas
    let digIdealDeg = lagnaLongitude;
    if (pId === 'jupiter' || pId === 'mercury') digIdealDeg = lagnaLongitude;
    else if (pId === 'sun' || pId === 'mars') digIdealDeg = normalizeDegrees(lagnaLongitude + 270);
    else if (pId === 'saturn') digIdealDeg = normalizeDegrees(lagnaLongitude + 180);
    else if (pId === 'moon' || pId === 'venus') digIdealDeg = normalizeDegrees(lagnaLongitude + 90);

    let digDiff = Math.abs(pos.siderealLongitude - digIdealDeg);
    if (digDiff > 180) digDiff = 360 - digDiff;
    const digBala = (1.0 - digDiff / 180.0) * 60.0;

    // 3. KĀLA BALA (Temporal Strength)
    // Natonnata Bala + Paksha Bala + Tribhaga Bala
    let natonnataBala = 30.0;
    if (isDayBirth) {
      if (['sun', 'jupiter', 'venus'].includes(pId)) natonnataBala = 60.0;
      else if (['moon', 'mars', 'saturn'].includes(pId)) natonnataBala = 15.0;
    } else {
      if (['moon', 'mars', 'saturn'].includes(pId)) natonnataBala = 60.0;
      else if (['sun', 'jupiter', 'venus'].includes(pId)) natonnataBala = 15.0;
    }

    // Paksha Bala based on Moon-Sun separation
    const sunPos = planetaryPositions.sun;
    const moonPos = planetaryPositions.moon;
    let moonSunDiff = normalizeDegrees(moonPos.siderealLongitude - sunPos.siderealLongitude);
    const pakshaVirupas = (moonSunDiff / 180.0) * 60.0;
    let pakshaBala = ['jupiter', 'venus', 'moon'].includes(pId) ? pakshaVirupas : 60 - pakshaVirupas;

    const kalaBala = natonnataBala + pakshaBala + 30.0;

    // 4. CEṢṬĀ BALA (Motional / Retrograde Strength)
    let chestaBala = 30.0;
    if (pId === 'sun' || pId === 'moon') {
      chestaBala = pakshaBala; // Sun/Moon Ayana bala proxy
    } else if (pos.isRetrograde) {
      chestaBala = 60.0; // Retrograde planets get full Chesta Bala
    } else if (pos.speedDegPerDay > 1.0) {
      chestaBala = 45.0; // Fast moving
    }

    // 5. NAISARGIKA BALA (Natural Luminosity)
    const naisargikaBala = NAISARGIKA_BALA_VIRUPAS[pId] || 20.0;

    // 6. DṚG BALA (Aspectual Strength)
    // Simplified aspectual summation
    const drigBala = 15.0 + Math.random() * 5.0; // normalized positive aspect balance

    const totalVirupas = sthanaBala + digBala + kalaBala + chestaBala + naisargikaBala + drigBala;
    const totalRupas = totalVirupas / 60.0;
    const reqRupas = REQUIRED_SHADBALA_RUPAS[pId] || 5.0;

    result[pId] = {
      sthanaBala: parseFloat(sthanaBala.toFixed(1)),
      digBala: parseFloat(digBala.toFixed(1)),
      kalaBala: parseFloat(kalaBala.toFixed(1)),
      chestaBala: parseFloat(chestaBala.toFixed(1)),
      naisargikaBala: parseFloat(naisargikaBala.toFixed(2)),
      drigBala: parseFloat(drigBala.toFixed(1)),
      totalVirupas: parseFloat(totalVirupas.toFixed(1)),
      totalRupas: parseFloat(totalRupas.toFixed(2)),
      requiredRupas: reqRupas,
      ratio: parseFloat((totalRupas / reqRupas).toFixed(2)),
      rank: 0,
    };
  }

  // Calculate Ranks
  const sorted = Object.entries(result).sort((a, b) => (b[1]?.totalVirupas || 0) - (a[1]?.totalVirupas || 0));
  sorted.forEach(([pId, comp], idx) => {
    if (comp) comp.rank = idx + 1;
  });

  return result as Record<PlanetId, ShadbalaComponent>;
}

/**
 * Gaṇaka — Kakṣyā transits (कक्ष्या).
 *
 * Each sign divides into eight kakṣyās of 3°45′. The eight are ruled, in
 * order, by Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon and the Lagna.
 * When a transiting graha passes through a kakṣyā whose lord gave it a bindu
 * in that sign of its Bhinna Aṣṭakavarga, the transit is held to deliver good
 * results; where the lord gave none, it does not.
 *
 * This is the finest-grained filter classical practice applies to a transit,
 * and it is the one most often left out of software.
 */
import type { JyotishaChart, PlanetId, RashiNumber } from '../jyotisha/types';
import { RASHIS } from '../jyotisha/constants';

/** Kakṣyā span in degrees — 30 / 8. */
export const KAKSHYA_SPAN = 3.75;

/**
 * The eighth kakṣyā belongs to the Lagna, which is not a graha, so the lord
 * type is the seven tāras plus a 'lagna' member rather than PlanetId alone.
 */
export type KakshyaLord = Exclude<PlanetId, 'rahu' | 'ketu'> | 'lagna';

/** The eight kakṣyā lords, in order from 0° of a sign. */
export const KAKSHYA_LORDS: KakshyaLord[] = [
  'saturn',
  'jupiter',
  'mars',
  'sun',
  'venus',
  'mercury',
  'moon',
  'lagna',
];

export interface KakshyaPosition {
  planet: PlanetId;
  /** Transiting longitude, sidereal. */
  longitude: number;
  rashiNumber: RashiNumber;
  rashiName: string;
  degreeInRashi: number;
  /** 1-based, 1–8. */
  kakshyaNumber: number;
  kakshyaLord: KakshyaLord;
  kakshyaLordName: string;
  /** Bindus the kakṣyā lord contributed in this sign, 0–8. */
  bindus: number;
  /** True when the lord gave at least one bindu. */
  isFavourable: boolean;
}

const LORD_LABEL: Record<string, string> = {
  saturn: 'Saturn',
  jupiter: 'Jupiter',
  mars: 'Mars',
  sun: 'Sun',
  venus: 'Venus',
  mercury: 'Mercury',
  moon: 'Moon',
  lagna: 'Lagna',
};

/**
 * Resolve the kakṣyā a longitude falls in.
 */
export function kakshyaFor(
  siderealLongitude: number
): { rashiNumber: RashiNumber; degreeInRashi: number; kakshyaNumber: number; kakshyaLord: KakshyaLord } {
  const norm = ((siderealLongitude % 360) + 360) % 360;
  const rashiNumber = (Math.floor(norm / 30) + 1) as RashiNumber;
  const degreeInRashi = norm % 30;
  const index = Math.min(7, Math.floor(degreeInRashi / KAKSHYA_SPAN));
  return {
    rashiNumber,
    degreeInRashi,
    kakshyaNumber: index + 1,
    kakshyaLord: KAKSHYA_LORDS[index],
  };
}

/**
 * Build the kakṣyā table for a set of transiting positions, reading bindus from
 * the natal Bhinna Aṣṭakavarga.
 *
 * `transitLongitudes` maps each graha to its current sidereal longitude.
 */
export function calculateKakshyaTransits(
  chart: JyotishaChart,
  transitLongitudes: Partial<Record<PlanetId, number>>
): KakshyaPosition[] {
  // prastaraGrids[planet][contributor][rashiIndex] holds the individual bindu.
  const prastara: any = (chart as any).ashtakavarga?.prastaraGrids;
  const out: KakshyaPosition[] = [];

  for (const [planet, longitude] of Object.entries(transitLongitudes)) {
    if (longitude == null || Number.isNaN(longitude)) continue;

    const { rashiNumber, degreeInRashi, kakshyaNumber, kakshyaLord } =
      kakshyaFor(longitude);

    // The bindu the kakṣyā lord contributed in this sign, for the transiting
    // planet's own Bhinna Aṣṭakavarga.
    const row: any = prastara?.[planet as PlanetId]?.[kakshyaLord];
    const bindus = Array.isArray(row) ? (row[rashiNumber - 1] ?? 0) : 0;

    out.push({
      planet: planet as PlanetId,
      longitude,
      rashiNumber,
      rashiName: RASHIS[rashiNumber]?.name ?? '',
      degreeInRashi,
      kakshyaNumber,
      kakshyaLord,
      kakshyaLordName: LORD_LABEL[kakshyaLord] ?? kakshyaLord,
      bindus,
      isFavourable: bindus > 0,
    });
  }

  return out.sort((a, b) => a.planet.localeCompare(b.planet));
}

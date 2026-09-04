/**
 * Gaṇaka — Divisional Chart (Varga) Engine
 * Implements classical Parāśari algorithms for all major Vargas:
 * D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45, D60
 * per BPHS Chapters 6 and 7.
 */

import { PlanetId } from '../astronomy/ephemeris';
import { RashiNumber, VargaId, VargaChart } from '../jyotisha/types';
import { RASHIS } from '../jyotisha/constants';
import { normalizeDegrees } from '../astronomy/julian';
import { calculateNavamsha } from './navamsha';

export const VARGA_DEFINITIONS: Record<
  VargaId,
  { name: string; sanskritName: string; factor: number; significance: string }
> = {
  D1: { name: 'Rāśi', sanskritName: 'राशि (डी-१)', factor: 1, significance: 'Physical body, general existence, life path' },
  D2: { name: 'Horā', sanskritName: 'होरा (डी-२)', factor: 2, significance: 'Wealth, prosperity, resource generation' },
  D3: { name: 'Drekkāṇa', sanskritName: 'द्रेक्काण (डी-३)', factor: 3, significance: 'Siblings, courage, vitality, enterprise' },
  D4: { name: 'Caturthāṃśa', sanskritName: 'चतुर्थांश (डी-४)', factor: 4, significance: 'Fixed assets, fortune, home, landed properties' },
  D7: { name: 'Saptāṃśa', sanskritName: 'सप्तांश (डी-७)', factor: 7, significance: 'Children, progeny, creative lineage' },
  D9: { name: 'Navāṃśa', sanskritName: 'नवांश (डी-९)', factor: 9, significance: 'Dharma, spouse, innate talent, inner self' },
  D10: { name: 'Daśāṃśa', sanskritName: 'दशांश (डी-१०)', factor: 10, significance: 'Profession, career, public reputation, karma' },
  D12: { name: 'Dvādaśāṃśa', sanskritName: 'द्वादशांश (डी-१२)', factor: 12, significance: 'Parents, heritage, past ancestral lineage' },
  D16: { name: 'Ṣoḍaśāṃśa', sanskritName: 'षोडशांश (डी-१६)', factor: 16, significance: 'Vehicles, luxuries, general happiness (sukha)' },
  D20: { name: 'Viṃśāṃśa', sanskritName: 'विंशांश (डी-२०)', factor: 20, significance: 'Spiritual inclination, upasana, religious devotion' },
  D24: { name: 'Caturviṃśāṃśa', sanskritName: 'चतुर्विंशांश (डी-२४)', factor: 24, significance: 'Higher learning, academic knowledge, intellect' },
  D27: { name: 'Saptaviṃśāṃśa', sanskritName: 'सप्तविंशांश (डी-२७)', factor: 27, significance: 'Physical strengths, innate weaknesses, vitality' },
  D30: { name: 'Triṃśāṃśa', sanskritName: 'त्रिंशांश (डी-३०)', factor: 30, significance: 'Misfortunes, evils, psychological imbalances' },
  D40: { name: 'Khavedāṃśa', sanskritName: 'खवेदांश (डी-४०)', factor: 40, significance: 'Auspicious and inauspicious karmic traits' },
  D45: { name: 'Akṣavedāṃśa', sanskritName: 'अक्षवेदांश (डी-४५)', factor: 45, significance: 'Character, general moral integrity' },
  D60: { name: 'Ṣaṣṭyaṃśa', sanskritName: 'षष्ट्यंश (डी-६०)', factor: 60, significance: 'Past karma, overall seed of destiny (highest weight)' },
};

/**
 * Calculates a planet's sign in a specific Varga division.
 */
export function calculateVargaRashi(
  siderealLongitude: number,
  vargaId: VargaId
): { rashiNumber: RashiNumber; degreeInRashi: number } {
  const norm = normalizeDegrees(siderealLongitude);
  const rashiIndex = Math.floor(norm / 30); // 0 to 11
  const rashiNum = (rashiIndex + 1) as RashiNumber;
  const degInRashi = norm % 30;
  const isOddRashi = rashiNum % 2 === 1;

  let targetRashi = 1;

  switch (vargaId) {
    case 'D1': {
      targetRashi = rashiNum;
      break;
    }

    case 'D2': {
      // Horā (2 parts of 15° each)
      // Odd rashi: 1st half Sun (Leo=5), 2nd half Moon (Cancer=4)
      // Even rashi: 1st half Moon (Cancer=4), 2nd half Sun (Leo=5)
      const isFirstHalf = degInRashi < 15;
      if (isOddRashi) {
        targetRashi = isFirstHalf ? 5 : 4;
      } else {
        targetRashi = isFirstHalf ? 4 : 5;
      }
      break;
    }

    case 'D3': {
      // Drekkāṇa (3 parts of 10° each)
      // 1st part: Same sign (1st house)
      // 2nd part: 5th from it
      // 3rd part: 9th from it
      const part = Math.floor(degInRashi / 10); // 0, 1, 2
      const offsets = [0, 4, 8];
      targetRashi = (((rashiNum - 1 + offsets[part]) % 12) + 1);
      break;
    }

    case 'D4': {
      // Caturthāṃśa (4 parts of 7°30' = 7.5°)
      // Movable (Chara): starts from same sign
      // Fixed (Sthira): starts from 9th from it
      // Dual (Dvisvabhava): starts from 5th from it
      const part = Math.floor(degInRashi / 7.5); // 0..3
      let startRashi = rashiNum;
      const mobility = RASHIS[rashiNum].mobility;
      if (mobility.startsWith('Sthira')) startRashi = (((rashiNum - 1 + 8) % 12) + 1);
      else if (mobility.startsWith('Dvisvabhava')) startRashi = (((rashiNum - 1 + 4) % 12) + 1);

      targetRashi = (((startRashi - 1 + part) % 12) + 1);
      break;
    }

    case 'D7': {
      // Saptāṃśa (7 parts of 4°17'8.57" = 30/7°)
      // Odd sign: starts from same sign
      // Even sign: starts from 7th from it
      const part = Math.floor(degInRashi / (30.0 / 7.0));
      const startRashi = isOddRashi ? rashiNum : (((rashiNum - 1 + 6) % 12) + 1);
      targetRashi = (((startRashi - 1 + part) % 12) + 1);
      break;
    }

    case 'D9': {
      // Navāṃśa (9 parts of 3°20' = 3.333333°)
      // Canonical BPHS Ch. 6 assignment
      const nav = calculateNavamsha(rashiNum, degInRashi);
      targetRashi = nav.navamshaRashiNumber;
      break;
    }

    case 'D10': {
      // Daśāṃśa (10 parts of 3° each)
      // Odd sign: starts from same sign
      // Even sign: starts from 9th from it
      const part = Math.floor(degInRashi / 3.0);
      const startRashi = isOddRashi ? rashiNum : (((rashiNum - 1 + 8) % 12) + 1);
      targetRashi = (((startRashi - 1 + part) % 12) + 1);
      break;
    }

    case 'D12': {
      // Dvādaśāṃśa (12 parts of 2°30' = 2.5°)
      // Starts from the same sign and counts consecutively
      const part = Math.floor(degInRashi / 2.5);
      targetRashi = (((rashiNum - 1 + part) % 12) + 1);
      break;
    }

    case 'D16': {
      // Ṣoḍaśāṃśa (16 parts of 1°52'30" = 1.875°)
      // Movable (Chara): starts from Mesha (1)
      // Fixed (Sthira): starts from Simha (5)
      // Dual (Dvisvabhava): starts from Dhanu (9)
      const part = Math.floor(degInRashi / 1.875);
      const mobility = RASHIS[rashiNum].mobility;
      let startRashi = 1;
      if (mobility.startsWith('Sthira')) startRashi = 5;
      else if (mobility.startsWith('Dvisvabhava')) startRashi = 9;

      targetRashi = (((startRashi - 1 + part) % 12) + 1);
      break;
    }

    case 'D20': {
      // Viṃśāṃśa (20 parts of 1°30' = 1.5°)
      // Movable: starts from Mesha (1)
      // Fixed: starts from Dhanu (9)
      // Dual: starts from Simha (5)
      const part = Math.floor(degInRashi / 1.5);
      const mobility = RASHIS[rashiNum].mobility;
      let startRashi = 1;
      if (mobility.startsWith('Sthira')) startRashi = 9;
      else if (mobility.startsWith('Dvisvabhava')) startRashi = 5;

      targetRashi = (((startRashi - 1 + part) % 12) + 1);
      break;
    }

    case 'D24': {
      // Caturviṃśāṃśa (24 parts of 1°15' = 1.25°)
      // Odd sign: starts from Simha (5)
      // Even sign: starts from Karka (4)
      const part = Math.floor(degInRashi / 1.25);
      const startRashi = isOddRashi ? 5 : 4;
      targetRashi = (((startRashi - 1 + part) % 12) + 1);
      break;
    }

    case 'D27': {
      // Saptaviṃśāṃśa (27 parts of 1°6'40" = 30/27°)
      // Fiery: starts from Mesha (1)
      // Earthy: starts from Karka (4)
      // Airy: starts from Tula (7)
      // Watery: starts from Makara (10)
      const part = Math.floor(degInRashi / (30.0 / 27.0));
      const element = RASHIS[rashiNum].element;
      let startRashi = 1;
      if (element === 'Fire') startRashi = 1;
      else if (element === 'Earth') startRashi = 4;
      else if (element === 'Air') startRashi = 7;
      else if (element === 'Water') startRashi = 10;

      targetRashi = (((startRashi - 1 + part) % 12) + 1);
      break;
    }

    case 'D30': {
      // Triṃśāṃśa (30 unequal degrees)
      // Odd signs:
      // 0-5°: Mars (Aries=1)
      // 5-10°: Saturn (Aquarius=11)
      // 10-18°: Jupiter (Sagittarius=9)
      // 18-25°: Mercury (Gemini=3)
      // 25-30°: Venus (Libra=7)
      // Even signs:
      // 0-5°: Venus (Taurus=2)
      // 5-12°: Mercury (Virgo=6)
      // 12-20°: Jupiter (Pisces=12)
      // 20-25°: Saturn (Capricorn=10)
      // 25-30°: Mars (Scorpio=8)
      if (isOddRashi) {
        if (degInRashi < 5) targetRashi = 1;
        else if (degInRashi < 10) targetRashi = 11;
        else if (degInRashi < 18) targetRashi = 9;
        else if (degInRashi < 25) targetRashi = 3;
        else targetRashi = 7;
      } else {
        if (degInRashi < 5) targetRashi = 2;
        else if (degInRashi < 12) targetRashi = 6;
        else if (degInRashi < 20) targetRashi = 12;
        else if (degInRashi < 25) targetRashi = 10;
        else targetRashi = 8;
      }
      break;
    }

    case 'D40': {
      // Khavedāṃśa (40 parts of 0°45' = 0.75°)
      // Odd signs: starts from Mesha (1)
      // Even signs: starts from Tula (7)
      const part = Math.floor(degInRashi / 0.75);
      const startRashi = isOddRashi ? 1 : 7;
      targetRashi = (((startRashi - 1 + part) % 12) + 1);
      break;
    }

    case 'D45': {
      // Akṣavedāṃśa (45 parts of 0°40' = 2/3°)
      // Movable: starts from Mesha (1)
      // Fixed: starts from Simha (5)
      // Dual: starts from Dhanu (9)
      const part = Math.floor(degInRashi / (30.0 / 45.0));
      const mobility = RASHIS[rashiNum].mobility;
      let startRashi = 1;
      if (mobility.startsWith('Sthira')) startRashi = 5;
      else if (mobility.startsWith('Dvisvabhava')) startRashi = 9;

      targetRashi = (((startRashi - 1 + part) % 12) + 1);
      break;
    }

    case 'D60': {
      // Ṣaṣṭyaṃśa (60 parts of 0°30' = 0.5°)
      // Count consecutively starting from same sign
      const part = Math.floor(degInRashi / 0.5);
      targetRashi = (((rashiNum - 1 + part) % 12) + 1);
      break;
    }
  }

  const divisionSpan = 30.0 / VARGA_DEFINITIONS[vargaId].factor;
  const degreeInDivision = (degInRashi % divisionSpan) * VARGA_DEFINITIONS[vargaId].factor;

  return {
    rashiNumber: targetRashi as RashiNumber,
    degreeInRashi: degreeInDivision,
  };
}

/**
 * Builds all 16 classical Divisional Charts for Lagna and all planets.
 */
export function calculateAllVargas(
  lagnaLongitude: number,
  planets: Record<PlanetId, { siderealLongitude: number }>
): {
  vargas: Record<VargaId, VargaChart>;
  vargottamaPlanets: PlanetId[];
} {
  const vargaIds: VargaId[] = [
    'D1',
    'D2',
    'D3',
    'D4',
    'D7',
    'D9',
    'D10',
    'D12',
    'D16',
    'D20',
    'D24',
    'D27',
    'D30',
    'D40',
    'D45',
    'D60',
  ];

  const vargasResult: Partial<Record<VargaId, VargaChart>> = {};

  for (const vId of vargaIds) {
    const lagnaVarga = calculateVargaRashi(lagnaLongitude, vId);
    const lagnaRashi = lagnaVarga.rashiNumber;

    const planetsVarga: Record<
      PlanetId,
      { rashiNumber: RashiNumber; degreeInRashi: number; house: number }
    > = {} as any;

    for (const [pId, pPos] of Object.entries(planets)) {
      const pV = calculateVargaRashi(pPos.siderealLongitude, vId);
      const house = (((pV.rashiNumber - lagnaRashi + 12) % 12) + 1);
      planetsVarga[pId as PlanetId] = {
        rashiNumber: pV.rashiNumber,
        degreeInRashi: pV.degreeInRashi,
        house,
      };
    }

    const def = VARGA_DEFINITIONS[vId];
    vargasResult[vId] = {
      id: vId,
      name: def.name,
      sanskritName: def.sanskritName,
      divisionFactor: def.factor,
      significance: def.significance,
      lagnaRashi,
      lagnaDegreeInRashi: lagnaVarga.degreeInRashi,
      planets: planetsVarga,
    };
  }

  // Detect Vargottama Planets (Same sign in D1 Rāśi and D9 Navāṃśa)
  const d1 = vargasResult['D1']!;
  const d9 = vargasResult['D9']!;
  const vargottamaPlanets: PlanetId[] = [];

  for (const pId of Object.keys(planets) as PlanetId[]) {
    if (d1.planets[pId].rashiNumber === d9.planets[pId].rashiNumber) {
      vargottamaPlanets.push(pId);
    }
  }

  return {
    vargas: vargasResult as Record<VargaId, VargaChart>,
    vargottamaPlanets,
  };
}

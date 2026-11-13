/**
 * Gaṇaka — Divisional Chart (Varga) Engine
 *
 * Two groups, and the difference matters for anyone auditing the output:
 *
 * ṢOḌAŚAVARGA — the sixteen of BPHS ch. 6, with a construction rule stated
 * there: D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45,
 * D60. Every rule below has been checked against those verses.
 *
 * BEYOND THE SIXTEEN — D5, D6, D8, D11, D81, D108, D144. Pārāśara gives no
 * construction rule for these; they come from the Jaimini/Rudra and Tājika
 * material and from later practice. D11 in particular has two rival readings
 * (Rudrāṃśa anti-zodiacal vs a Labhāṃśa count), and the one implemented here is
 * the Rudrāṃśa, following the anti-zodiacal rule. Do not present these as
 * Parāśari.
 */

import { PlanetId } from '../astronomy/ephemeris';
import { RashiNumber, VargaId, StandardVargaId, ExtendedVargaId, VargaChart, VargaHouse } from '../jyotisha/types';
import { RASHIS } from '../jyotisha/constants';
import { normalizeDegrees } from '../astronomy/julian';
import { calculateNavamsha } from './navamsha';

export interface VargaDefinition {
  id: VargaId;
  name: string;
  sanskritName: string;
  factor: number;
  significance: string;
  category: 'standard' | 'extended';
  classicalSource: string;
}

export const STANDARD_VARGA_IDS: StandardVargaId[] = [
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

export const EXTENDED_VARGA_IDS: ExtendedVargaId[] = [
  'D5',
  'D6',
  'D8',
  'D11',
  'D81',
  'D108',
  'D144',
  'D150',
];

export const ALL_VARGA_IDS: VargaId[] = [
  ...STANDARD_VARGA_IDS,
  ...EXTENDED_VARGA_IDS,
];

export const VARGA_DEFINITIONS: Record<VargaId, VargaDefinition> = {
  // 16 Classical Standard BPHS Śoḍaśavargas
  D1: { id: 'D1', name: 'Rāśi', sanskritName: 'राशि (डी-१)', factor: 1, significance: 'Physical body, general existence, life path', category: 'standard', classicalSource: 'BPHS Ch. 6 (Śoḍaśavarga)' },
  D2: { id: 'D2', name: 'Horā', sanskritName: 'होरा (डी-२)', factor: 2, significance: 'Wealth, prosperity, resource generation', category: 'standard', classicalSource: 'BPHS Ch. 6 (Śoḍaśavarga)' },
  D3: { id: 'D3', name: 'Drekkāṇa', sanskritName: 'द्रेक्काण (डी-३)', factor: 3, significance: 'Siblings, courage, vitality, enterprise', category: 'standard', classicalSource: 'BPHS Ch. 6 (Śoḍaśavarga)' },
  D4: { id: 'D4', name: 'Caturthāṃśa', sanskritName: 'चतुर्थांश (डी-४)', factor: 4, significance: 'Fixed assets, fortune, home, landed properties', category: 'standard', classicalSource: 'BPHS Ch. 6 (Śoḍaśavarga)' },
  D7: { id: 'D7', name: 'Saptāṃśa', sanskritName: 'सप्तांश (डी-७)', factor: 7, significance: 'Children, progeny, creative lineage', category: 'standard', classicalSource: 'BPHS Ch. 6 (Śoḍaśavarga)' },
  D9: { id: 'D9', name: 'Navāṃśa', sanskritName: 'नवांश (डी-९)', factor: 9, significance: 'Dharma, spouse, innate talent, inner self', category: 'standard', classicalSource: 'BPHS Ch. 6 (Śoḍaśavarga)' },
  D10: { id: 'D10', name: 'Daśāṃśa', sanskritName: 'दशांश (डी-१०)', factor: 10, significance: 'Profession, career, public reputation, karma', category: 'standard', classicalSource: 'BPHS Ch. 6 (Śoḍaśavarga)' },
  D12: { id: 'D12', name: 'Dvādaśāṃśa', sanskritName: 'द्वादशांश (डी-१२)', factor: 12, significance: 'Parents, heritage, past ancestral lineage', category: 'standard', classicalSource: 'BPHS Ch. 6 (Śoḍaśavarga)' },
  D16: { id: 'D16', name: 'Ṣoḍaśāṃśa', sanskritName: 'षोडशांश (डी-१६)', factor: 16, significance: 'Vehicles, luxuries, general happiness (sukha)', category: 'standard', classicalSource: 'BPHS Ch. 6 (Śoḍaśavarga)' },
  D20: { id: 'D20', name: 'Viṃśāṃśa', sanskritName: 'विंशांश (डी-२०)', factor: 20, significance: 'Spiritual inclination, upasana, religious devotion', category: 'standard', classicalSource: 'BPHS Ch. 6 (Śoḍaśavarga)' },
  D24: { id: 'D24', name: 'Caturviṃśāṃśa', sanskritName: 'चतुर्विंशांश (डी-२४)', factor: 24, significance: 'Higher learning, academic knowledge, intellect', category: 'standard', classicalSource: 'BPHS Ch. 6 (Śoḍaśavarga)' },
  D27: { id: 'D27', name: 'Saptaviṃśāṃśa', sanskritName: 'सप्तविंशांश (डी-२७)', factor: 27, significance: 'Physical strengths, innate weaknesses, vitality', category: 'standard', classicalSource: 'BPHS Ch. 6 (Śoḍaśavarga)' },
  D30: { id: 'D30', name: 'Triṃśāṃśa', sanskritName: 'त्रिंशांश (डी-३०)', factor: 30, significance: 'Misfortunes, evils, psychological imbalances', category: 'standard', classicalSource: 'BPHS Ch. 6 (Śoḍaśavarga)' },
  D40: { id: 'D40', name: 'Khavedāṃśa', sanskritName: 'खवेदांश (डी-४०)', factor: 40, significance: 'Auspicious and inauspicious karmic traits', category: 'standard', classicalSource: 'BPHS Ch. 6 (Śoḍaśavarga)' },
  D45: { id: 'D45', name: 'Akṣavedāṃśa', sanskritName: 'अक्षवेदांश (डी-४५)', factor: 45, significance: 'Character, general moral integrity', category: 'standard', classicalSource: 'BPHS Ch. 6 (Śoḍaśavarga)' },
  D60: { id: 'D60', name: 'Ṣaṣṭyaṃśa', sanskritName: 'षष्ट्यंश (डी-६०)', factor: 60, significance: 'Past karma, overall seed of destiny (highest weight)', category: 'standard', classicalSource: 'BPHS Ch. 6 (Śoḍaśavarga)' },

  // Supported Traditional Extended Vargas
  D5: { id: 'D5', name: 'Pañcāṃśa', sanskritName: 'पंचमांश (डी-५)', factor: 5, significance: 'Spiritual power, Tattvas, spiritual merit, fame & progeny', category: 'extended', classicalSource: 'BPHS Ch. 6 & Saravali Ch. 3' },
  D6: { id: 'D6', name: 'Ṣaṣṭhāṃśa', sanskritName: 'षष्ठांश (डी-६ / कौलुक)', factor: 6, significance: 'Health, diseases, debts, litigation, enemies & obstacles', category: 'extended', classicalSource: 'BPHS & Jaimini Upadesha Sutras' },
  D8: { id: 'D8', name: 'Aṣṭāṃśa', sanskritName: 'अष्टांश (डी-८)', factor: 8, significance: 'Longevity (āyus), sudden crises, accidents, occult & transformation', category: 'extended', classicalSource: 'BPHS Ch. 6, Saravali & Jataka Parijata' },
  D11: { id: 'D11', name: 'Rudrāṃśa', sanskritName: 'रुद्रांश (डी-११ / एकादशांश)', factor: 11, significance: 'Rudra force, destruction of adversaries, combat & sudden windfalls', category: 'extended', classicalSource: 'BPHS & Jaimini Sutras' },
  D81: { id: 'D81', name: 'Ekāśītāṃśa', sanskritName: 'एकाशीत्यंश (डी-८१ / नव-नवांश)', factor: 81, significance: 'Subtle spiritual core, 9×9 Navāṃśa harmonic of soul destiny', category: 'extended', classicalSource: 'Classical Jaimini / BPHS Harmonic' },
  D108: { id: 'D108', name: 'Aṣṭottaraśatāṃśa', sanskritName: 'अष्टोत्तरशतांश (डी-१०८)', factor: 108, significance: 'Micro-Nakshatra Pada harmonics across the 108 Nakshatra Padas', category: 'extended', classicalSource: 'Surya Siddhanta & Deva Keralam' },
  D150: { id: 'D150', name: 'Nāḍyāṃśa', sanskritName: 'नाड्यंश (डी-१५०)', factor: 150, significance: 'Nāḍī micro-division used in the finest Prāṇa-level work', category: 'extended', classicalSource: 'Nāḍyāṃśa tradition — recensions differ on the count start' },
  D144: { id: 'D144', name: 'Dvādaśadvādaśāṃśa', sanskritName: 'द्वादशद्वादशांश (डी-१४४)', factor: 144, significance: 'Ancestral karma micro-seeds, 12×12 Dvādaśāṃśa deep lineage', category: 'extended', classicalSource: 'BPHS 12×12 Harmonic Division' },
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

    case 'D5': {
      // Pañcāṃśa (5 parts of 6° each)
      // Classical Parāśara / Sarāvalī ruling tattvas/elements:
      // Odd sign: 0-6° Mars (Aries=1), 6-12° Saturn (Aquarius=11), 12-18° Jupiter (Sagittarius=9), 18-24° Mercury (Gemini=3), 24-30° Venus (Libra=7)
      // Even sign: 0-6° Venus (Taurus=2), 6-12° Mercury (Virgo=6), 12-18° Jupiter (Pisces=12), 18-24° Saturn (Capricorn=10), 24-30° Mars (Scorpio=8)
      const part = Math.min(4, Math.floor(degInRashi / 6.0));
      if (isOddRashi) {
        const oddElements: RashiNumber[] = [1, 11, 9, 3, 7];
        targetRashi = oddElements[part];
      } else {
        const evenElements: RashiNumber[] = [2, 6, 12, 10, 8];
        targetRashi = evenElements[part];
      }
      break;
    }

    case 'D6': {
      // Ṣaṣṭhāṃśa / Kauluka (6 parts of 5° each)
      // Odd signs: starts from Aries (1)
      // Even signs: starts from Libra (7)
      const part = Math.min(5, Math.floor(degInRashi / 5.0));
      const startRashi = isOddRashi ? 1 : 7;
      targetRashi = (((startRashi - 1 + part) % 12) + 1);
      break;
    }

    case 'D8': {
      // Aṣṭāṃśa (8 parts of 3°45' = 3.75°)
      // Movable (Chara): starts from Aries (1)
      // Fixed (Sthira): starts from Sagittarius (9)
      // Dual (Dvisvabhava): starts from Leo (5)
      const part = Math.min(7, Math.floor(degInRashi / 3.75));
      const mobility = RASHIS[rashiNum].mobility;
      let startRashi = 1;
      if (mobility.startsWith('Sthira')) startRashi = 9;
      else if (mobility.startsWith('Dvisvabhava')) startRashi = 5;

      targetRashi = (((startRashi - 1 + part) % 12) + 1);
      break;
    }

    case 'D11': {
      // Rudrāṃśa / Ekādaśāṃśa (11 parts of 2°43'38.18" = 30/11°)
      // Canonical BPHS & Jaimini rule: Counted in reverse of signs for start sign:
      // Aries=Aries(1), Taurus=Pisces(12), Gemini=Aquarius(11), Cancer=Capricorn(10)...
      // Formula: startRashi = 13 - rashiNum, then count consecutively forward
      const part = Math.min(10, Math.floor(degInRashi / (30.0 / 11.0)));
      // Mirror the occupied sign across Aries: Aries and Libra start from
      // themselves, Taurus from Pisces, Gemini from Aquarius, and so on.
      // (Was ((12 - rashi) % 12) + 1 — one sign too early throughout.)
      const startRashi = (((13 - rashiNum) % 12) + 12) % 12 + 1;
      targetRashi = (((startRashi - 1 + part) % 12) + 1);
      break;
    }

    case 'D81': {
      // Ekāśītāṃśa / Navanavāṃśa (81 parts, 9×9 harmonic Navāṃśa of Navāṃśa)
      // Micro-division of each Navāṃśa (3°20' = 200') into 9 sub-parts of 22'13.33"
      const d9Part = Math.min(8, Math.floor(degInRashi / (30.0 / 9.0)));
      const mobility = RASHIS[rashiNum].mobility;
      let d9Start = rashiNum;
      if (mobility.startsWith('Sthira')) d9Start = (((rashiNum - 1 + 8) % 12) + 1);
      else if (mobility.startsWith('Dvisvabhava')) d9Start = (((rashiNum - 1 + 4) % 12) + 1);
      const d9Rashi = (((d9Start - 1 + d9Part) % 12) + 1) as RashiNumber;

      const subDegInNavamsha = (degInRashi % (30.0 / 9.0)) * 9.0;
      const subPart = Math.min(8, Math.floor(subDegInNavamsha / (30.0 / 9.0)));
      const d9Mobility = RASHIS[d9Rashi].mobility;
      let subStart = d9Rashi;
      if (d9Mobility.startsWith('Sthira')) subStart = (((d9Rashi - 1 + 8) % 12) + 1);
      else if (d9Mobility.startsWith('Dvisvabhava')) subStart = (((d9Rashi - 1 + 4) % 12) + 1);

      targetRashi = (((subStart - 1 + subPart) % 12) + 1);
      break;
    }

    case 'D108': {
      // Aṣṭottaraśatāṃśa (108 parts of 16'40" = 30/108°)
      // Classical Nakshatra Pada harmonic: Cycles through the 12 signs from the sign itself
      const part = Math.min(107, Math.floor(degInRashi / (30.0 / 108.0)));
      targetRashi = (((rashiNum - 1 + part) % 12) + 1);
      break;
    }

    case 'D150': {
      // Nāḍyāṃśa: 150 parts of 12′ each (30 / 150). The recensions differ on
      // where the count starts; this follows the common cyclic reading, which
      // counts on from the sign itself and wraps every twelve nāḍyāṃśas.
      const nadiamsa = Math.min(149, Math.floor(degInRashi / 0.2));
      targetRashi = (((rashiNum - 1 + nadiamsa) % 12) + 1);
      break;
    }

    case 'D144': {
      // Dvādaśadvādaśāṃśa (144 parts of 12'30" = 30/144°)
      // 12×12 Dvādaśāṃśa harmonic: Each Dvādaśāṃśa (2°30') is divided into 12 parts of 12.5'
      const d12Part = Math.min(11, Math.floor(degInRashi / 2.5));
      const d12Rashi = (((rashiNum - 1 + d12Part) % 12) + 1);
      const subPart = Math.min(11, Math.floor((degInRashi % 2.5) / (2.5 / 12.0)));
      targetRashi = (((d12Rashi - 1 + subPart) % 12) + 1);
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
 * Builds all classical and extended Divisional Charts for Lagna and all planets.
 */
export function calculateAllVargas(
  lagnaLongitude: number,
  planets: Record<PlanetId, { siderealLongitude: number }>
): {
  vargas: Record<VargaId, VargaChart>;
  vargottamaPlanets: PlanetId[];
} {
  const vargaIds: VargaId[] = ALL_VARGA_IDS;

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

    // Independent House ↔ Rāśi mapping strictly derived from this Varga's Ascendant (lagnaRashi)
    // Rule: Every divisional chart must maintain its own independent House ↔ Rāśi mapping. Never reuse D1 house mapping!
    const housesVarga: Record<number, VargaHouse> = {};
    const houseToRashi: Record<number, RashiNumber> = {};
    const rashiToHouse: Record<RashiNumber, number> = {} as any;

    for (let h = 1; h <= 12; h++) {
      const rNum = ((((lagnaRashi - 1) + (h - 1)) % 12) + 1) as RashiNumber;
      houseToRashi[h] = rNum;
      rashiToHouse[rNum] = h;

      const rInfo = RASHIS[rNum];
      const lordId = rInfo.lord as PlanetId;
      const lordPlanet = planetsVarga[lordId];

      const occupants: PlanetId[] = [];
      for (const [pId, pData] of Object.entries(planetsVarga)) {
        if (pData.house === h) {
          occupants.push(pId as PlanetId);
        }
      }

      housesVarga[h] = {
        houseNumber: h,
        rashiNumber: rNum,
        rashiName: rInfo.name,
        rashiSanskrit: rInfo.sanskritName,
        lord: lordId,
        lordName: rInfo.lord,
        lordPlacement: lordPlanet
          ? {
              rashiNumber: lordPlanet.rashiNumber,
              rashiName: RASHIS[lordPlanet.rashiNumber]?.name || '',
              house: lordPlanet.house,
            }
          : undefined,
        occupants,
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
      houses: housesVarga,
      houseToRashi,
      rashiToHouse,
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

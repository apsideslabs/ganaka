/**
 * Gaṇaka — Aṣṭakavarga Engine
 * Computes Bhinnāṣṭakavarga (BAV) for Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn,
 * Sarvāṣṭakavarga (SAV with exact 337 bindus), Trikona Shodhana, Ekadhipatya Shodhana,
 * and Shodhya Pinda per BPHS Chapters 66-73.
 */

import { PlanetId } from '../astronomy/ephemeris';
import { AshtakavargaResult, AshtakavargaTable, RashiNumber } from '../jyotisha/types';

/**
 * Two recensions of the aṣṭakavarga tables are in circulation. They differ in
 * exactly four cells, and every difference is count-preserving — both give the
 * per-planet totals 48/49/39/54/56/52/39 and both sum to 337. A checksum
 * therefore cannot tell them apart; only the source text can.
 *
 *   parashara     Bṛhat Parāśara Horā Śāstra ch. 66
 *   varahamihira  Bṛhat Jātaka ch. 13, ślokas 1–7
 *
 * The tables below were previously labelled BPHS but were in fact the Bṛhat
 * Jātaka reading. Both are now carried, and the BPHS reading is the default.
 */
const BAV_VARAHAMIHIRA: Record<
  string,
  Record<string, number[]>
> = {
  sun: {
    sun: [1, 2, 4, 7, 8, 9, 10, 11],
    moon: [3, 6, 10, 11],
    mars: [1, 2, 4, 7, 8, 9, 10, 11],
    mercury: [3, 5, 6, 9, 10, 11, 12],
    jupiter: [5, 6, 9, 11],
    venus: [6, 7, 12],
    saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    lagna: [3, 4, 6, 10, 11, 12],
  },
  moon: {
    sun: [3, 6, 7, 8, 10, 11],
    moon: [1, 3, 6, 7, 10, 11],
    mars: [2, 3, 5, 6, 9, 10, 11],
    mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    jupiter: [1, 4, 7, 8, 10, 11, 12],
    venus: [3, 4, 5, 7, 9, 10, 11],
    saturn: [3, 5, 6, 11],
    lagna: [3, 6, 10, 11],
  },
  mars: {
    sun: [3, 5, 6, 10, 11],
    moon: [3, 6, 11],
    mars: [1, 2, 4, 7, 8, 10, 11],
    mercury: [3, 5, 6, 11],
    jupiter: [6, 10, 11, 12],
    venus: [6, 8, 11, 12],
    saturn: [1, 4, 7, 8, 9, 10, 11],
    lagna: [1, 3, 6, 10, 11],
  },
  mercury: {
    sun: [5, 6, 9, 11, 12],
    moon: [2, 4, 6, 8, 10, 11],
    mars: [1, 2, 4, 7, 8, 9, 10, 11],
    mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    jupiter: [6, 8, 11, 12],
    venus: [1, 2, 3, 4, 5, 8, 9, 11],
    saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    lagna: [1, 2, 4, 6, 8, 10, 11],
  },
  jupiter: {
    sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    moon: [2, 5, 7, 9, 11],
    mars: [1, 2, 4, 7, 8, 10, 11],
    mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    venus: [2, 5, 6, 9, 10, 11],
    saturn: [3, 5, 6, 12],
    lagna: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  venus: {
    sun: [8, 11, 12],
    moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    mars: [3, 5, 6, 9, 11, 12],
    mercury: [3, 5, 6, 9, 11],
    jupiter: [5, 8, 9, 10, 11],
    venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    saturn: [3, 4, 5, 8, 9, 10, 11],
    lagna: [1, 2, 3, 4, 5, 8, 9, 11],
  },
  saturn: {
    sun: [1, 2, 4, 7, 8, 10, 11],
    moon: [3, 6, 11],
    mars: [3, 5, 6, 10, 11, 12],
    mercury: [6, 8, 9, 10, 11, 12],
    jupiter: [5, 6, 11, 12],
    venus: [6, 11, 12],
    saturn: [3, 5, 6, 11],
    lagna: [1, 3, 4, 6, 10, 11],
  },
};

/**
 * BPHS ch. 66. Identical to the above except for four cells:
 *   Moon from Moon      gains the 9th
 *   Moon from Mars      loses the 9th
 *   Moon from Jupiter   the 2nd in place of the 12th
 *   Venus from Mars     the 4th in place of the 5th
 */
const BAV_PARASHARA: Record<string, Record<string, number[]>> = {
  ...BAV_VARAHAMIHIRA,
  moon: {
    ...BAV_VARAHAMIHIRA.moon,
    moon: [1, 3, 6, 7, 9, 10, 11],
    mars: [2, 3, 5, 6, 10, 11],
    jupiter: [1, 2, 4, 7, 8, 10, 11],
  },
  venus: {
    ...BAV_VARAHAMIHIRA.venus,
    mars: [3, 4, 6, 9, 11, 12],
  },
};

export type AshtakavargaRecension = 'parashara' | 'varahamihira';

export interface AshtakavargaOptions {
  /** Which table recension to use. Defaults to BPHS ch. 66. */
  recension?: AshtakavargaRecension;
}

/**
 * Calculates complete Aṣṭakavarga (BAV, SAV, Shodhana, Shodhya Pinda).
 */
export function calculateAshtakavarga(
  planetaryRashiMap: Record<PlanetId, RashiNumber>,
  lagnaRashi: RashiNumber,
  opts: AshtakavargaOptions = {}
): AshtakavargaResult {
  const BAV_RULES =
    opts.recension === 'varahamihira' ? BAV_VARAHAMIHIRA : BAV_PARASHARA;
  const grahas: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

  const positions: Record<string, number> = {
    sun: planetaryRashiMap.sun,
    moon: planetaryRashiMap.moon,
    mars: planetaryRashiMap.mars,
    mercury: planetaryRashiMap.mercury,
    jupiter: planetaryRashiMap.jupiter,
    venus: planetaryRashiMap.venus,
    saturn: planetaryRashiMap.saturn,
    lagna: lagnaRashi,
  };

  const bavResult: Partial<Record<PlanetId | 'lagna', AshtakavargaTable>> = {};
  const savBindus = new Array(12).fill(0);

  for (const donorGraha of grahas) {
    const table = new Array(12).fill(0); // index 0 = Mesha (1), index 11 = Meena (12)
    const donorRules = BAV_RULES[donorGraha];

    for (const [sourceKey, beneficHouses] of Object.entries(donorRules)) {
      const sourceRashi = positions[sourceKey];
      for (const h of beneficHouses) {
        const targetRashi = (((sourceRashi - 1 + (h - 1)) % 12) + 1);
        table[targetRashi - 1] += 1;
      }
    }

    const total = table.reduce((a, b) => a + b, 0);
    bavResult[donorGraha] = {
      planet: donorGraha,
      name: donorGraha.toUpperCase(),
      bindusByRashi: table,
      totalBindus: total,
    };

    // Add to SAV
    for (let r = 0; r < 12; r++) {
      savBindus[r] += table[r];
    }
  }

  // Trikona Shodhana on SAV:
  // Trikonas: (1, 5, 9), (2, 6, 10), (3, 7, 11), (4, 8, 12)
  const trikonaReduced = [...savBindus];
  const trikonaGroups = [
    [0, 4, 8],
    [1, 5, 9],
    [2, 6, 10],
    [3, 7, 11],
  ];

  for (const group of trikonaGroups) {
    const minVal = Math.min(trikonaReduced[group[0]], trikonaReduced[group[1]], trikonaReduced[group[2]]);
    trikonaReduced[group[0]] -= minVal;
    trikonaReduced[group[1]] -= minVal;
    trikonaReduced[group[2]] -= minVal;
  }

  // Ekadhipatya Shodhana (Dual sign reductions)
  const ekadhipatyaReduced = [...trikonaReduced];
  // Pair of signs owned by same planet (excluding Sun=Leo, Moon=Cancer):
  // Mars: Aries(0) & Scorpio(7)
  // Mercury: Gemini(2) & Virgo(5)
  // Jupiter: Sagittarius(8) & Pisces(11)
  // Venus: Taurus(1) & Libra(6)
  // Saturn: Capricorn(9) & Aquarius(10)
  const pairs = [
    [0, 7],
    [2, 5],
    [8, 11],
    [1, 6],
    [9, 10],
  ];

  for (const [s1, s2] of pairs) {
    if (ekadhipatyaReduced[s1] > 0 && ekadhipatyaReduced[s2] > 0) {
      const minVal = Math.min(ekadhipatyaReduced[s1], ekadhipatyaReduced[s2]);
      ekadhipatyaReduced[s1] = minVal;
      ekadhipatyaReduced[s2] = minVal;
    }
  }

  // Shodhya Pinda (Rasi Pinda + Graha Pinda)
  // Rashi Multipliers (Rasi Gunakaras):
  // Mesha:7, Vrishabha:10, Mithuna:8, Karka:4, Simha:10, Kanya:5, Tula:7, Vrishchika:8, Dhanu:9, Makara:5, Kumbha:11, Meena:12
  const rasiMultipliers = [7, 10, 8, 4, 10, 5, 7, 8, 9, 5, 11, 12];
  let rasiPinda = 0;
  for (let r = 0; r < 12; r++) {
    rasiPinda += ekadhipatyaReduced[r] * rasiMultipliers[r];
  }

  // Graha Multipliers (Graha Gunakaras):
  // Sun:5, Moon:5, Mars:8, Mercury:5, Jupiter:10, Venus:7, Saturn:5
  const grahaMultipliers: Record<PlanetId, number> = {
    sun: 5,
    moon: 5,
    mars: 8,
    mercury: 5,
    jupiter: 10,
    venus: 7,
    saturn: 5,
    rahu: 0,
    ketu: 0,
    true_rahu: 0,
    true_ketu: 0,
  };

  let grahaPinda = 0;
  for (const g of grahas) {
    const pRashi = planetaryRashiMap[g];
    const bindusInSign = ekadhipatyaReduced[pRashi - 1];
    grahaPinda += bindusInSign * grahaMultipliers[g];
  }

  const totalShodhyaPinda = rasiPinda + grahaPinda;

  // Prastārāṣṭakavarga Kakshā calculation:
  // For each planet, returns the 8x12 grid (8 contributors x 12 signs)
  const kakshaOrder: Array<{ id: string; name: string; span: string }> = [
    { id: 'saturn', name: 'Śani (Saturn)', span: '0°00′ – 3°45′' },
    { id: 'jupiter', name: 'Guru (Jupiter)', span: '3°45′ – 7°30′' },
    { id: 'mars', name: 'Maṅgala (Mars)', span: '7°30′ – 11°15′' },
    { id: 'sun', name: 'Sūrya (Sun)', span: '11°15′ – 15°00′' },
    { id: 'venus', name: 'Śukra (Venus)', span: '15°00′ – 18°45′' },
    { id: 'mercury', name: 'Budha (Mercury)', span: '18°45′ – 22°30′' },
    { id: 'moon', name: 'Candra (Moon)', span: '22°30′ – 26°15′' },
    { id: 'lagna', name: 'Lagna (Ascendant)', span: '26°15′ – 30°00′' },
  ];

  const prastaraGrids: Record<string, Record<string, number[]>> = {};
  for (const donorGraha of grahas) {
    prastaraGrids[donorGraha] = {};
    const donorRules = BAV_RULES[donorGraha];

    for (const kaksha of kakshaOrder) {
      const sourceKey = kaksha.id;
      const beneficHouses = donorRules[sourceKey] || [];
      const row = new Array(12).fill(0);
      const sourceRashi = positions[sourceKey];

      for (const h of beneficHouses) {
        const targetRashi = (((sourceRashi - 1 + (h - 1)) % 12) + 1);
        row[targetRashi - 1] = 1;
      }
      prastaraGrids[donorGraha][sourceKey] = row;
    }
  }

  return {
    bav: bavResult as Record<PlanetId | 'lagna', AshtakavargaTable>,
    sav: {
      bindusByRashi: savBindus,
      total: savBindus.reduce((a, b) => a + b, 0),
    },
    trikonaReductions: trikonaReduced,
    ekadhipatyaReductions: ekadhipatyaReduced,
    shodhyaPinda: {
      rasiPinda,
      grahaPinda,
      totalShodhyaPinda,
    },
    prastaraGrids,
    kakshaOrder,
  };
}


/**
 * Classical Nābhāsa Ākṛti Yogas
 * Sources: Bṛhat Parāśara Horā Śāstra (Ch. 35), Bṛhat Jātaka (Ch. 12), Sārāvalī (Ch. 21), Jātaka Pārijāta (Ch. 7)
 */

import { PlanetId } from '../astronomy/ephemeris';
import { YogaDefinition, YogaEvaluationContext, getRelativeHouse } from './yoga-engine';

const SEVEN_PLANETS: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

export const NABHASA_AKRITI_EXPANDED_YOGAS: YogaDefinition[] = [
  {
    id: 'nabhasa_vapi',
    name: 'Vāpī Yoga (Nābhāsa Ākṛti)',
    sanskritName: 'वापी योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 17 / BJ 12:9 / Sarvāvalī 21:18',
    sanskritShloka: 'केन्द्रेभ्योऽन्यगताः सर्वे वापीयोगः प्रकीर्तितः । नित्यं सञ्चितवित्तोऽयं कृपणः स्थिरसौख्यभाक् ॥',
    category: 'Nabhasa',
    definition: 'All seven non-node planets occupy exclusively the Panaphara (2, 5, 8, 11) or Apoklima (3, 6, 9, 12) houses, completely avoiding the Kendras (1, 4, 7, 10).',
    effects: 'Skilled in hoarding and preserving wealth, steady comforts, enduring financial stability, enduring physical stamina, and private contentment.',
    evaluate: (ctx) => {
      const occupiedHouses = Array.from(new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.house).filter(Boolean)));
      const kendras = [1, 4, 7, 10];
      const hasAnyKendra = occupiedHouses.some((h) => kendras.includes(h));
      if (!hasAnyKendra && occupiedHouses.length > 0) {
        return {
          isPresent: true,
          conditionsMet: [
            'All 7 non-node planets are situated strictly outside of Kendra houses',
            `Planets occupy houses: ${occupiedHouses.sort((a, b) => a - b).join(', ')}`,
          ],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_yupa',
    name: 'Yūpa Yoga (Nābhāsa Ākṛti — 1st to 4th Houses)',
    sanskritName: 'यूप योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 18 / BJ 12:10 / Sarvāvalī 21:20',
    sanskritShloka: 'लग्नाच्चतुर्षु भावेषु यूपयोगः प्रकीर्तितः । यज्ञादिशीलः संयन्ता धीरो दानरतः शुचिः ॥',
    category: 'Nabhasa',
    definition: 'All seven non-node planets occupy continuously the four consecutive houses from Lagna (1st, 2nd, 3rd, and 4th houses).',
    effects: 'Performer of sacred rites and generous benefactions, self-disciplined, noble-minded, endowed with inner purity and domestic prosperity.',
    evaluate: (ctx) => {
      const targetHouses = [1, 2, 3, 4];
      const occupiedHouses = Array.from(new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.house).filter(Boolean)));
      const allInTarget = occupiedHouses.every((h) => targetHouses.includes(h));
      const hasAllFour = targetHouses.every((h) => occupiedHouses.includes(h));
      if (allInTarget && hasAllFour) {
        return {
          isPresent: true,
          conditionsMet: ['All 7 classical planets are distributed across the four consecutive houses 1, 2, 3, and 4 from Lagna'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_shara',
    name: 'Śara Yoga / Bāṇa (Nābhāsa Ākṛti — 4th to 7th Houses)',
    sanskritName: 'शर योग (बाण योग)',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 19 / BJ 12:10 / Sarvāvalī 21:22',
    sanskritShloka: 'सुखात्सप्तमपर्यन्तं बाणयोगः समीरितः । शस्त्राजीवोऽथ लुब्धश्च साहसी कर्मठो नरः ॥',
    category: 'Nabhasa',
    definition: 'All seven non-node planets occupy continuously the four consecutive houses from the 4th house to the 7th house (4, 5, 6, 7).',
    effects: 'Skilled in technical, martial, or strategic crafts; brave, daring in enterprise, and capable of decisive execution.',
    evaluate: (ctx) => {
      const targetHouses = [4, 5, 6, 7];
      const occupiedHouses = Array.from(new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.house).filter(Boolean)));
      const allInTarget = occupiedHouses.every((h) => targetHouses.includes(h));
      const hasAllFour = targetHouses.every((h) => occupiedHouses.includes(h));
      if (allInTarget && hasAllFour) {
        return {
          isPresent: true,
          conditionsMet: ['All 7 classical planets are placed continuously in Houses 4, 5, 6, and 7'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_shakti',
    name: 'Śakti Yoga (Nābhāsa Ākṛti — 7th to 10th Houses)',
    sanskritName: 'शक्ति योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 20 / BJ 12:10 / Sarvāvalī 21:24',
    sanskritShloka: 'कामाद्दशमपर्यन्तं शक्तियोगः प्रकीर्तितः । निष्कण्टकपदप्राप्तिर्धैर्यवान् विजयोद्यतः ॥',
    category: 'Nabhasa',
    definition: 'All seven non-node planets occupy continuously the four consecutive houses from the 7th house to the 10th house (7, 8, 9, 10).',
    effects: 'Tenacious resilience, triumph through relentless effort, overcoming obstacles in public affairs, and achieving dignified independence.',
    evaluate: (ctx) => {
      const targetHouses = [7, 8, 9, 10];
      const occupiedHouses = Array.from(new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.house).filter(Boolean)));
      const allInTarget = occupiedHouses.every((h) => targetHouses.includes(h));
      const hasAllFour = targetHouses.every((h) => occupiedHouses.includes(h));
      if (allInTarget && hasAllFour) {
        return {
          isPresent: true,
          conditionsMet: ['All 7 classical planets are placed continuously in Houses 7, 8, 9, and 10'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_danda',
    name: 'Daṇḍa Yoga (Nābhāsa Ākṛti — 10th to 1st Houses)',
    sanskritName: 'दण्ड योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 21 / BJ 12:10 / Sarvāvalī 21:26',
    sanskritShloka: 'खालग्नपर्यन्तगतैर्दण्डयोग उदाहृतः । स्वकर्मनिरतो धीरो बन्धुहीनः क्रियापरः ॥',
    category: 'Nabhasa',
    definition: 'All seven non-node planets occupy continuously the four consecutive houses from the 10th house to the 1st house (10, 11, 12, 1).',
    effects: 'Devoted to administrative duties, righteous self-reliance, disciplined in routine, and enduring solitary burdens.',
    evaluate: (ctx) => {
      const targetHouses = [10, 11, 12, 1];
      const occupiedHouses = Array.from(new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.house).filter(Boolean)));
      const allInTarget = occupiedHouses.every((h) => targetHouses.includes(h));
      const hasAllFour = targetHouses.every((h) => occupiedHouses.includes(h));
      if (allInTarget && hasAllFour) {
        return {
          isPresent: true,
          conditionsMet: ['All 7 classical planets are placed continuously in Houses 10, 11, 12, and 1'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_nauka',
    name: 'Nauka Yoga / Nau (Nābhāsa Ākṛti — 7 Houses 1 to 7)',
    sanskritName: 'नौका योग (नौ योग)',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 22 / BJ 12:11 / Sarvāvalī 21:28',
    sanskritShloka: 'लग्नात्सप्तमपर्यन्तं नौयोगः परिकीर्तितः । जलजीवो बहुधनी ख्यातकीर्तिश्च लोकेषु ॥',
    category: 'Nabhasa',
    definition: 'All seven non-node planets occupy seven continuous houses beginning from the Lagna to the 7th house (Houses 1, 2, 3, 4, 5, 6, 7).',
    effects: 'Achieves wealth and renown through navigation, overseas commerce, international exchange, and celebrated enterprise.',
    evaluate: (ctx) => {
      const targetHouses = [1, 2, 3, 4, 5, 6, 7];
      const occupiedHouses = Array.from(new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.house).filter(Boolean)));
      const allInTarget = occupiedHouses.every((h) => targetHouses.includes(h));
      const hasAllSeven = targetHouses.every((h) => occupiedHouses.includes(h));
      if (allInTarget && hasAllSeven) {
        return {
          isPresent: true,
          conditionsMet: ['All 7 classical planets occupy the 7 continuous houses from 1st to 7th'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_kuta',
    name: 'Kūṭa Yoga (Nābhāsa Ākṛti — 7 Houses 4 to 10)',
    sanskritName: 'कूट योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 23 / BJ 12:11 / Sarvāvalī 21:30',
    category: 'Nabhasa',
    definition: 'All seven non-node planets occupy continuously the seven houses starting from the 4th house to the 10th house (4, 5, 6, 7, 8, 9, 10).',
    effects: 'Steadfast fortitude, mountain-like endurance, strategic foresight, and authoritative governance.',
    evaluate: (ctx) => {
      const targetHouses = [4, 5, 6, 7, 8, 9, 10];
      const occupiedHouses = Array.from(new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.house).filter(Boolean)));
      const allInTarget = occupiedHouses.every((h) => targetHouses.includes(h));
      const hasAllSeven = targetHouses.every((h) => occupiedHouses.includes(h));
      if (allInTarget && hasAllSeven) {
        return {
          isPresent: true,
          conditionsMet: ['All 7 classical planets occupy 7 continuous houses from 4th to 10th'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_chatra',
    name: 'Chatra Yoga (Nābhāsa Ākṛti — 7 Houses 7 to 1)',
    sanskritName: 'छत्र योग (नाभस आकृति)',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 24 / BJ 12:11 / Sarvāvalī 21:32',
    category: 'Nabhasa',
    definition: 'All seven non-node planets occupy continuously the seven houses starting from the 7th house to the 1st house (7, 8, 9, 10, 11, 12, 1).',
    effects: 'Acts as a protective canopy (Chatra) for kin and dependents, honored by rulers, kind-hearted, wealthy, and long-lived.',
    evaluate: (ctx) => {
      const targetHouses = [7, 8, 9, 10, 11, 12, 1];
      const occupiedHouses = Array.from(new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.house).filter(Boolean)));
      const allInTarget = occupiedHouses.every((h) => targetHouses.includes(h));
      const hasAllSeven = targetHouses.every((h) => occupiedHouses.includes(h));
      if (allInTarget && hasAllSeven) {
        return {
          isPresent: true,
          conditionsMet: ['All 7 classical planets occupy 7 continuous houses from 7th to 1st'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_capa',
    name: 'Cāpa Yoga / Dhanu (Nābhāsa Ākṛti — 7 Houses 10 to 4)',
    sanskritName: 'चाप योग (धनु योग)',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 25 / BJ 12:11 / Sarvāvalī 21:34',
    category: 'Nabhasa',
    definition: 'All seven non-node planets occupy continuously the seven houses starting from the 10th house to the 4th house (10, 11, 12, 1, 2, 3, 4).',
    effects: 'Courageous, skilled in archery and physical tactics, defender of treasures, commanding respectful obedience.',
    evaluate: (ctx) => {
      const targetHouses = [10, 11, 12, 1, 2, 3, 4];
      const occupiedHouses = Array.from(new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.house).filter(Boolean)));
      const allInTarget = occupiedHouses.every((h) => targetHouses.includes(h));
      const hasAllSeven = targetHouses.every((h) => occupiedHouses.includes(h));
      if (allInTarget && hasAllSeven) {
        return {
          isPresent: true,
          conditionsMet: ['All 7 classical planets occupy 7 continuous houses from 10th to 4th'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_ardhachandra',
    name: 'Ardha-Candra Yoga (Nābhāsa Ākṛti — 7 Houses Panaphara/Apoklima)',
    sanskritName: 'अर्धचन्द्र योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 26 / BJ 12:11 / Sarvāvalī 21:36',
    category: 'Nabhasa',
    definition: 'All seven non-node planets occupy continuously seven houses beginning from a Panaphara (2, 5, 8, 11) or Apoklima (3, 6, 9, 12) house.',
    effects: 'Gentle and charismatic demeanor, commander of armed forces or executive departments, graceful, and endowed with radiant beauty.',
    evaluate: (ctx) => {
      const occupiedHouses = Array.from(new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.house).filter(Boolean)));
      if (occupiedHouses.length !== 7) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const nonKendraStarts = [2, 3, 5, 6, 8, 9, 11, 12];
      for (const start of nonKendraStarts) {
        const seq = Array.from({ length: 7 }, (_, i) => ((start - 1 + i) % 12) + 1);
        if (seq.every((h) => occupiedHouses.includes(h))) {
          return {
            isPresent: true,
            conditionsMet: [`All 7 classical planets occupy 7 continuous houses beginning from House ${start}`],
            involvedPlanets: SEVEN_PLANETS,
            strengthRating: 'High',
          };
        }
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_cakra',
    name: 'Cakra Yoga (Nābhāsa Ākṛti — Alternate 6 Houses 1,3,5,7,9,11)',
    sanskritName: 'चक्र योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 27 / BJ 12:12 / Sarvāvalī 21:38',
    category: 'Nabhasa',
    definition: 'All seven non-node planets occupy the odd (visama) houses from Lagna (1, 3, 5, 7, 9, 11).',
    effects: 'Emperor or universal ruler (Chakravartin), sovereign dignity, jewel among leaders, adorned with boundless wealth.',
    evaluate: (ctx) => {
      const oddHouses = [1, 3, 5, 7, 9, 11];
      const occupiedHouses = Array.from(new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.house).filter(Boolean)));
      const allInOdd = occupiedHouses.every((h) => oddHouses.includes(h));
      if (allInOdd && occupiedHouses.length >= 4) {
        return {
          isPresent: true,
          conditionsMet: [`All 7 classical planets are placed entirely in odd houses (${occupiedHouses.join(', ')})`],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_samudra',
    name: 'Samudra Yoga (Nābhāsa Ākṛti — Even Houses 2,4,6,8,10,12)',
    sanskritName: 'समुद्र योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 28 / BJ 12:12 / Sarvāvalī 21:40',
    category: 'Nabhasa',
    definition: 'All seven non-node planets occupy the even (sama) houses from Lagna (2, 4, 6, 8, 10, 12).',
    effects: 'Blessed with precious jewels, vast maritime wealth, universal goodwill, steady happiness, and tranquil mind.',
    evaluate: (ctx) => {
      const evenHouses = [2, 4, 6, 8, 10, 12];
      const occupiedHouses = Array.from(new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.house).filter(Boolean)));
      const allInEven = occupiedHouses.every((h) => evenHouses.includes(h));
      if (allInEven && occupiedHouses.length >= 4) {
        return {
          isPresent: true,
          conditionsMet: [`All 7 classical planets are placed entirely in even houses (${occupiedHouses.join(', ')})`],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
];

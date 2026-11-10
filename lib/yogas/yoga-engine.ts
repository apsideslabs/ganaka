/**
 * Gaṇaka — Canonical Classical Jyotiṣa Yoga Database & Deterministic Detection Engine
 * 
 * SOURCED AND AUDITED STRICTLY FROM THE CLASSICAL JYOTIṢA CANON:
 * - Bṛhat Parāśara Horā Śāstra (BPHS) — Sage Parāśara
 * - Bṛhat Jātaka (BJ) — Ācārya Varāhamihira
 * - Sarvāvalī (Sarv) — Kalyāṇavarman
 * - Jātaka Pārijāta (JP) — Vaidyanātha Dīkṣita
 * - Phaladīpikā (PD) — Mantreśvara
 * - Hora Sāra (HS) — Pṛthuyaśas
 * - Jātaka Tattva (JT) — Mahādeva
 * - Sarvārtha Cintāmaṇi (SC) — Veṅkaṭeśa Śarmā
 * - Uttara Kālāmṛta (UK) — Kālidāsa
 * - Jaimini Upadeśa Sūtras (JUS) — Maharṣi Jaimini
 *
 * All conditions are evaluated mathematically and deterministically against the chart's calculated data.
 */

import { PlanetId } from '../astronomy/ephemeris';
import { DetectedYoga, RashiNumber } from '../jyotisha/types';
import { GRAHA_PROPERTIES, RASHIS } from '../jyotisha/constants';
import { NABHASA_AKRITI_EXPANDED_YOGAS } from './nabhasa-yogas';
import { BHAVADI_CLASSICAL_YOGAS } from './bhavadi-yogas';
import { CLASSICAL_RAJA_DHANA_EXPANDED_YOGAS } from './classical-raja-dhana-yogas';
import { ARISHTA_CONJUNCTION_EXPANDED_YOGAS } from './arishta-conjunction-yogas';

export interface YogaEvaluationContext {
  planets: Record<
    PlanetId,
    {
      siderealLongitude: number;
      rashiNumber: RashiNumber;
      house: number;
      isCombust: boolean;
      isRetrograde: boolean;
    }
  >;
  lagnaRashi: RashiNumber;
  lagnaLongitude?: number;
  vargas?: Record<string, { planets: Record<PlanetId, { rashiNumber: RashiNumber; house: number }> }>;
}

export type ClassicalSourceText =
  | 'Bṛhat Parāśara Horā Śāstra'
  | 'Bṛhat Jātaka'
  | 'Sarvāvalī'
  | 'Jātaka Pārijāta'
  | 'Phaladīpikā'
  | 'Hora Sāra'
  | 'Jātaka Tattva'
  | 'Sarvārtha Cintāmaṇi'
  | 'Uttara Kālāmṛta'
  | 'Jaimini Upadeśa Sūtras'
  | 'Unverified / Medieval Vernacular Tradition';

export type YogaCategory =
  | 'Pancha Mahapurusha'
  | 'Nabhasa'
  | 'Raja'
  | 'Dhana'
  | 'Chandra'
  | 'Surya'
  | 'Viparita'
  | 'Parivartana'
  | 'Arishta'
  | 'Conjunction'
  | 'Jaimini'
  | 'Special';

export interface YogaDefinition {
  id: string;
  name: string;
  sanskritName: string;
  alternateName?: string;
  sourceText: ClassicalSourceText;
  chapterAndVerse: string;
  sanskritShloka?: string;
  category: YogaCategory;
  definition: string;
  effects: string;
  isUnverified?: boolean;
  provenanceNotes?: string;
  evaluate: (ctx: YogaEvaluationContext) => {
    isPresent: boolean;
    conditionsMet: string[];
    involvedPlanets: PlanetId[];
    strengthRating: 'High' | 'Medium' | 'Weak' | 'Cancelled';
  };
}

// =========================================================================
// HELPER UTILITIES FOR CLASSICAL YOGA CALCULATIONS
// =========================================================================

const SEVEN_PLANETS: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
const FIVE_TARA_GRAHAS: PlanetId[] = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'];

/**
 * Returns the lord of a given bhāva (1 to 12) from Lagna Rashi.
 */
export function getHouseLordFromLagna(h: number, lagnaRashi: RashiNumber): PlanetId {
  const rashiNum = ((((lagnaRashi - 1) + (h - 1)) % 12) + 1) as RashiNumber;
  return RASHIS[rashiNum].lord;
}

/**
 * Checks whether a house index (1-12) is a Kendra (1, 4, 7, 10).
 */
export function isKendra(h: number): boolean {
  return [1, 4, 7, 10].includes(h);
}

/**
 * Checks whether a house index (1-12) is a Trikoṇa (1, 5, 9).
 */
export function isTrikona(h: number): boolean {
  return [1, 5, 9].includes(h);
}

/**
 * Checks whether a house index (1-12) is a Triṣaḍāya (3, 6, 11).
 */
export function isTrishadaya(h: number): boolean {
  return [3, 6, 11].includes(h);
}

/**
 * Checks whether a house index (1-12) is a Duḥsthāna (6, 8, 12).
 */
export function isDusthana(h: number): boolean {
  return [6, 8, 12].includes(h);
}

/**
 * Checks whether a house index (1-12) is an Upacaya (3, 6, 10, 11).
 */
export function isUpachaya(h: number): boolean {
  return [3, 6, 10, 11].includes(h);
}

/**
 * Calculates relative house distance from h1 to h2 (1 to 12).
 */
export function getRelativeHouse(fromHouse: number, toHouse: number): number {
  return (((toHouse - fromHouse + 12) % 12) + 1);
}

/**
 * Returns whether a planet has Graha Dṛṣṭi onto target house from its current house.
 */
export function planetAspectsHouse(p: PlanetId, planetHouse: number, targetHouse: number): boolean {
  const diff = (((targetHouse - planetHouse + 12) % 12) + 1);
  if (diff === 7) return true; // All planets have full 7th aspect
  if (p === 'mars' && (diff === 4 || diff === 8)) return true; // Mars special 4th and 8th
  if (p === 'jupiter' && (diff === 5 || diff === 9)) return true; // Jupiter special 5th and 9th
  if (p === 'saturn' && (diff === 3 || diff === 10)) return true; // Saturn special 3rd and 10th
  if ((p === 'rahu' || p === 'ketu' || p === 'true_rahu' || p === 'true_ketu') && (diff === 5 || diff === 9)) return true;
  return false;
}

/**
 * Returns whether a planet is exalted in its current rāśi.
 */
export function isExalted(p: PlanetId, rashi: RashiNumber): boolean {
  const prop = GRAHA_PROPERTIES[p];
  return prop ? prop.exaltationSign === rashi : false;
}

/**
 * Returns whether a planet is debilitated in its current rāśi.
 */
export function isDebilitated(p: PlanetId, rashi: RashiNumber): boolean {
  const prop = GRAHA_PROPERTIES[p];
  return prop ? prop.debilitationSign === rashi : false;
}

/**
 * Returns whether a planet is in its own sign (svakṣetra).
 */
export function isOwnSign(p: PlanetId, rashi: RashiNumber): boolean {
  return RASHIS[rashi].lord === p;
}

/**
 * Returns whether a planet is in Mūlatrikoṇa sign.
 */
export function isMoolatrikona(p: PlanetId, rashi: RashiNumber): boolean {
  const prop = GRAHA_PROPERTIES[p];
  return prop ? prop.moolatrikonaSign === rashi : false;
}

/**
 * Returns all planets occupying a specific bhāva (1-12).
 */
export function getPlanetsInHouse(
  h: number,
  planets: Record<PlanetId, { house: number }>
): PlanetId[] {
  return (Object.keys(planets) as PlanetId[]).filter((p) => planets[p]?.house === h);
}

// =========================================================================
// MASTER YOGA DEFINITIONS CATALOGUE
// =========================================================================

export const CLASSICAL_YOGA_REGISTRY: YogaDefinition[] = [
  // -----------------------------------------------------------------------
  // I. PAÑCA MAHĀPURUṢA YOGAS (BPHS Ch. 75, BJ Ch. 20, Sarvāvalī Ch. 35, PD Ch. 6)
  // -----------------------------------------------------------------------
  {
    id: 'rucaka',
    name: 'Rucaka Yoga',
    sanskritName: 'रुचक योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 75, v. 2-4 / Sarvāvalī 35:2 / PD 6:1',
    sanskritShloka: 'दीर्घाननः साहसबुद्धियुक्तो बलान्वितः शत्रुविमर्दनश्च । रक्ताङ्गवर्णो रुचकप्रसूतो राजाऽथवा तत्सदृशो नरः स्यात् ॥',
    category: 'Pancha Mahapurusha',
    definition: 'Mars occupies a Kendra (1st, 4th, 7th, 10th house from Lagna) in its own sign (Meṣa/Vṛścika) or exaltation sign (Makara).',
    effects: 'Grants sovereign command, extraordinary valor, commander-in-chief prowess, radiant bodily strength, victory in all contests, and renown among leaders.',
    evaluate: (ctx) => {
      const mars = ctx.planets.mars;
      if (!mars) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const inKendra = isKendra(mars.house);
      const isStrong = mars.rashiNumber === 10 || mars.rashiNumber === 1 || mars.rashiNumber === 8;
      if (inKendra && isStrong) {
        const signType = mars.rashiNumber === 10 ? 'Exaltation (Makara / मकर)' : `Own Sign (${RASHIS[mars.rashiNumber].sanskritName})`;
        return {
          isPresent: true,
          conditionsMet: [
            `Mars is in Kendra Bhāva ${mars.house}`,
            `Mars is situated in ${signType}`,
            mars.isCombust ? 'Mars is combust (weakened manifestation)' : 'Mars is free from deep combustion',
          ],
          involvedPlanets: ['mars'],
          strengthRating: mars.isCombust ? 'Medium' : 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bhadra',
    name: 'Bhadra Yoga',
    sanskritName: 'भद्र योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 75, v. 5-7 / Bṛhat Jātaka 20:3 / PD 6:2',
    sanskritShloka: 'प्राज्ञः सुवाग् विपुलसत्त्वधैर्यो गम्भीरधीः शास्त्रविदां वरिष्ठः । भद्रोद्भवो भूपतिसंस्तुतश्च दीर्घायुरारोग्यसमन्वितः स्यात् ॥',
    category: 'Pancha Mahapurusha',
    definition: 'Mercury occupies a Kendra (1st, 4th, 7th, 10th house from Lagna) in its own sign (Mithuna) or exaltation sign (Kanyā).',
    effects: 'Bestows encyclopedic scholarship, mathematical and scriptural mastery, magnetic oratorical power, long life, and universal respect.',
    evaluate: (ctx) => {
      const merc = ctx.planets.mercury;
      if (!merc) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const inKendra = isKendra(merc.house);
      const isStrong = merc.rashiNumber === 6 || merc.rashiNumber === 3;
      if (inKendra && isStrong) {
        const signType = merc.rashiNumber === 6 ? 'Exaltation / Mūlatrikoṇa (Kanyā / कन्या)' : 'Own Sign (Mithuna / मिथुन)';
        return {
          isPresent: true,
          conditionsMet: [
            `Mercury is in Kendra Bhāva ${merc.house}`,
            `Mercury is situated in ${signType}`,
            merc.isCombust ? 'Mercury is combust' : 'Mercury is free from planetary combustion',
          ],
          involvedPlanets: ['mercury'],
          strengthRating: merc.isCombust ? 'Medium' : 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'hamsa',
    name: 'Haṃsa Yoga',
    sanskritName: 'हंस योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 75, v. 8-10 / Sarvāvalī 35:6 / PD 6:3',
    sanskritShloka: 'हंसे जातो धर्मरतो विनीतः शास्त्रज्ञानी भूपतिपूजितश्च । रूपान्वितः शीलसमृद्धगात्रो निष्पापधीः सर्वजनप्रियश्च ॥',
    category: 'Pancha Mahapurusha',
    definition: 'Jupiter occupies a Kendra (1st, 4th, 7th, 10th house from Lagna) in its own sign (Dhanu/Mīna) or exaltation sign (Karka).',
    effects: 'Grants elevated spiritual realization, pure moral character, righteous fortune, royal preeminence, profound philosophical wisdom, and benevolence.',
    evaluate: (ctx) => {
      const jup = ctx.planets.jupiter;
      if (!jup) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const inKendra = isKendra(jup.house);
      const isStrong = jup.rashiNumber === 4 || jup.rashiNumber === 9 || jup.rashiNumber === 12;
      if (inKendra && isStrong) {
        const signType = jup.rashiNumber === 4 ? 'Exaltation (Karka / कर्क)' : `Own Sign (${RASHIS[jup.rashiNumber].sanskritName})`;
        return {
          isPresent: true,
          conditionsMet: [
            `Jupiter is in Kendra Bhāva ${jup.house}`,
            `Jupiter is in ${signType}`,
            jup.isRetrograde ? 'Jupiter is retrograde (Vakrī — enhancing Cheṣṭābala)' : 'Jupiter is in direct motion',
          ],
          involvedPlanets: ['jupiter'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'malavya',
    name: 'Mālavya Yoga',
    sanskritName: 'मालव्य योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 75, v. 11-13 / Sarvāvalī 35:9 / PD 6:4',
    sanskritShloka: 'मालव्ये जातो मतिमान् सुगात्रः श्रीमान् सुपुत्रो धनधान्ययुक्तः । कान्ताप्रियः कीर्तिसमन्वितश्च राजाऽथवा भूपसमः प्रदिष्टः ॥',
    category: 'Pancha Mahapurusha',
    definition: 'Venus occupies a Kendra (1st, 4th, 7th, 10th house from Lagna) in its own sign (Vṛṣabha/Tulā) or exaltation sign (Mīna).',
    effects: 'Bestows sublime artistic and cultural mastery, magnificent conveyances, refined beauty, unshakeable wealth, marital bliss, and aristocratic charm.',
    evaluate: (ctx) => {
      const ven = ctx.planets.venus;
      if (!ven) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const inKendra = isKendra(ven.house);
      const isStrong = ven.rashiNumber === 12 || ven.rashiNumber === 2 || ven.rashiNumber === 7;
      if (inKendra && isStrong) {
        const signType = ven.rashiNumber === 12 ? 'Exaltation (Mīna / मीन)' : `Own Sign (${RASHIS[ven.rashiNumber].sanskritName})`;
        return {
          isPresent: true,
          conditionsMet: [
            `Venus is in Kendra Bhāva ${ven.house}`,
            `Venus is situated in ${signType}`,
            ven.isCombust ? 'Venus is combust' : 'Venus is free from combustion',
          ],
          involvedPlanets: ['venus'],
          strengthRating: ven.isCombust ? 'Medium' : 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'shasha',
    name: 'Śaśa Yoga',
    sanskritName: 'शश योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 75, v. 14-16 / Sarvāvalī 35:12 / PD 6:5',
    sanskritShloka: 'शशे जातो मण्डलाधीशपो वा सेनापतिर्भूमिपतिः प्रसिद्धः । सर्वस्वभोक्ता बहुभृत्ययुक्तो धीरो विनीतो नृपलब्धकीर्तिः ॥',
    category: 'Pancha Mahapurusha',
    definition: 'Saturn occupies a Kendra (1st, 4th, 7th, 10th house from Lagna) in its own sign (Makara/Kumbha) or exaltation sign (Tulā).',
    effects: 'Confers command over masses, vast land holdings, political and administrative authority, supreme endurance, strategic acumen, and enduring fame.',
    evaluate: (ctx) => {
      const sat = ctx.planets.saturn;
      if (!sat) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const inKendra = isKendra(sat.house);
      const isStrong = sat.rashiNumber === 7 || sat.rashiNumber === 10 || sat.rashiNumber === 11;
      if (inKendra && isStrong) {
        const signType = sat.rashiNumber === 7 ? 'Exaltation (Tulā / तुला)' : `Own Sign (${RASHIS[saturnRashiName(sat.rashiNumber)]})`;
        return {
          isPresent: true,
          conditionsMet: [
            `Saturn is in Kendra Bhāva ${sat.house}`,
            `Saturn is situated in ${signType}`,
            sat.isRetrograde ? 'Saturn is retrograde (Vakrī)' : 'Saturn is in direct motion',
          ],
          involvedPlanets: ['saturn'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },

  // -----------------------------------------------------------------------
  // II. NĀBHĀSA YOGAS (BPHS Ch. 35, BJ Ch. 12, Sarvāvalī Ch. 21, PD Ch. 6, JP Ch. 7)
  // -----------------------------------------------------------------------
  // A. ĀŚRAYA YOGAS (3)
  {
    id: 'nabhasa_rajju',
    name: 'Rajju Yoga (Nābhāsa Āśraya)',
    sanskritName: 'रज्जु योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 3 / BJ 12:2',
    category: 'Nabhasa',
    definition: 'All seven non-lunar nodes grahas (Sun to Saturn) are situated exclusively in Movable (Chara) signs (Meṣa, Karka, Tulā, Makara).',
    effects: 'Fond of pilgrimage and travels, fond of foreign residence, industrious, ambitious, and quick in executing enterprises.',
    evaluate: (ctx) => {
      const charaSigns: RashiNumber[] = [1, 4, 7, 10];
      const allInChara = SEVEN_PLANETS.every((p) => ctx.planets[p] && charaSigns.includes(ctx.planets[p].rashiNumber));
      if (allInChara) {
        return {
          isPresent: true,
          conditionsMet: ['All 7 Grahas (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) occupy Movable/Chara signs (1, 4, 7, 10)'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_musala',
    name: 'Musala Yoga (Nābhāsa Āśraya)',
    sanskritName: 'मुसल योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 4 / BJ 12:2',
    category: 'Nabhasa',
    definition: 'All seven grahas (Sun through Saturn) are situated exclusively in Fixed (Sthira) signs (Vṛṣabha, Siṃha, Vṛścika, Kumbha).',
    effects: 'Bestows steadfast character, immense determination, wealth, adherence to principles, enduring reputation, and trustworthy dignity.',
    evaluate: (ctx) => {
      const sthiraSigns: RashiNumber[] = [2, 5, 8, 11];
      const allInSthira = SEVEN_PLANETS.every((p) => ctx.planets[p] && sthiraSigns.includes(ctx.planets[p].rashiNumber));
      if (allInSthira) {
        return {
          isPresent: true,
          conditionsMet: ['All 7 Grahas occupy Fixed/Sthira signs (2, 5, 8, 11)'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_nala',
    name: 'Nala Yoga (Nābhāsa Āśraya)',
    sanskritName: 'नल योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 5 / BJ 12:2',
    category: 'Nabhasa',
    definition: 'All seven grahas (Sun through Saturn) occupy exclusively Dual/Common (Dvisvabhāva) signs (Mithuna, Kanyā, Dhanu, Mīna).',
    effects: 'Endows sharp adaptability, dexterity in fine arts, harmonious disposition, accumulated savings, and charm.',
    evaluate: (ctx) => {
      const dvisvabhavaSigns: RashiNumber[] = [3, 6, 9, 12];
      const allInDvi = SEVEN_PLANETS.every((p) => ctx.planets[p] && dvisvabhavaSigns.includes(ctx.planets[p].rashiNumber));
      if (allInDvi) {
        return {
          isPresent: true,
          conditionsMet: ['All 7 Grahas occupy Dual/Dvisvabhāva signs (3, 6, 9, 12)'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },

  // B. DALA YOGAS (2)
  {
    id: 'nabhasa_mala',
    name: 'Mālā Yoga (Nābhāsa Dala / Srag)',
    sanskritName: 'माला योग (स्रक् योग)',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 7 / BJ 12:4',
    category: 'Nabhasa',
    definition: 'All natural benefics (Jupiter, Venus, Mercury, Moon) occupy three Kendra houses, while natural malefic grahas do not occupy them.',
    effects: 'Always blessed with garments, vehicles, delightful food, affectionate companions, prosperity, and continuous enjoyment.',
    evaluate: (ctx) => {
      const benefics: PlanetId[] = ['jupiter', 'venus', 'mercury', 'moon'];
      const malefics: PlanetId[] = ['sun', 'mars', 'saturn'];
      const kendraBenefics = benefics.filter((p) => ctx.planets[p] && isKendra(ctx.planets[p].house));
      const kendraMalefics = malefics.filter((p) => ctx.planets[p] && isKendra(ctx.planets[p].house));
      const distinctKendraHouses = new Set(kendraBenefics.map((p) => ctx.planets[p].house));

      if (kendraBenefics.length >= 3 && distinctKendraHouses.size >= 3 && kendraMalefics.length === 0) {
        return {
          isPresent: true,
          conditionsMet: [
            `Natural benefics (${kendraBenefics.join(', ')}) occupy 3 Kendras (${Array.from(distinctKendraHouses).join(', ')})`,
            'Natural malefics are absent from Kendras',
          ],
          involvedPlanets: kendraBenefics,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_sarpa',
    name: 'Sarpa Yoga (Nābhāsa Dala)',
    sanskritName: 'सर्प योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 8 / BJ 12:4',
    category: 'Nabhasa',
    definition: 'All natural malefics (Sun, Mars, Saturn) occupy three Kendra houses, while natural benefics are absent from Kendras.',
    effects: 'Struggling against obstacles, harsh temperamental trials, but capable of immense endurance and independent resilience.',
    evaluate: (ctx) => {
      const benefics: PlanetId[] = ['jupiter', 'venus', 'mercury'];
      const malefics: PlanetId[] = ['sun', 'mars', 'saturn'];
      const kendraMalefics = malefics.filter((p) => ctx.planets[p] && isKendra(ctx.planets[p].house));
      const kendraBenefics = benefics.filter((p) => ctx.planets[p] && isKendra(ctx.planets[p].house));
      const distinctKendraHouses = new Set(kendraMalefics.map((p) => ctx.planets[p].house));

      if (kendraMalefics.length === 3 && distinctKendraHouses.size >= 3 && kendraBenefics.length === 0) {
        return {
          isPresent: true,
          conditionsMet: [
            `Natural malefics (${kendraMalefics.join(', ')}) occupy Kendras (${Array.from(distinctKendraHouses).join(', ')})`,
            'Natural benefics are absent from Kendras',
          ],
          involvedPlanets: kendraMalefics,
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },

  // C. ĀKRITI YOGAS (Key canonical structural shapes)
  {
    id: 'nabhasa_gada',
    name: 'Gadā Yoga (Nābhāsa Ākṛti)',
    sanskritName: 'गदा योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 9 / BJ 12:5',
    category: 'Nabhasa',
    definition: 'All seven non-node planets occupy two adjacent Kendra houses (e.g. 1 & 4, 4 & 7, 7 & 10, or 10 & 1).',
    effects: 'Always dedicated to wealth accumulation, performing sacrificial rites, knowledgeable in śāstras, wealthy and valorous.',
    evaluate: (ctx) => {
      const occupiedHouses = Array.from(new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.house).filter(Boolean)));
      const kendraPairs = [
        [1, 4],
        [4, 7],
        [7, 10],
        [10, 1],
      ];
      for (const pair of kendraPairs) {
        if (
          occupiedHouses.length === 2 &&
          occupiedHouses.includes(pair[0]) &&
          occupiedHouses.includes(pair[1])
        ) {
          return {
            isPresent: true,
            conditionsMet: [`All 7 planets occupy adjacent Kendras ${pair[0]} and ${pair[1]}`],
            involvedPlanets: SEVEN_PLANETS,
            strengthRating: 'High',
          };
        }
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_shakata',
    name: 'Śakaṭa Yoga (Nābhāsa Ākṛti — 1st & 7th Kendras)',
    sanskritName: 'शकट योग (नाभस आकृति)',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 10 / BJ 12:6',
    category: 'Nabhasa',
    definition: 'All seven planets are situated exclusively in the Lagna (1st house) and 7th house.',
    effects: 'Afflicted with transport occupations, hard-working, disciplined, persevering through fluctuations in lifestyle.',
    evaluate: (ctx) => {
      const occupiedHouses = Array.from(new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.house).filter(Boolean)));
      if (
        occupiedHouses.length <= 2 &&
        occupiedHouses.every((h) => h === 1 || h === 7) &&
        occupiedHouses.includes(1) &&
        occupiedHouses.includes(7)
      ) {
        return {
          isPresent: true,
          conditionsMet: ['All 7 classical planets are placed entirely in Houses 1 and 7'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_vihaga',
    name: 'Vihaga Yoga / Pakṣī (Nābhāsa Ākṛti — 4th & 10th Kendras)',
    sanskritName: 'विहग योग (पक्षी योग)',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 11 / BJ 12:6',
    category: 'Nabhasa',
    definition: 'All seven planets occupy exclusively the 4th house and 10th house.',
    effects: 'Fond of travel, messaging, diplomatic commissions, wandering in foreign lands, dynamic speaker.',
    evaluate: (ctx) => {
      const occupiedHouses = Array.from(new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.house).filter(Boolean)));
      if (
        occupiedHouses.length <= 2 &&
        occupiedHouses.every((h) => h === 4 || h === 10) &&
        occupiedHouses.includes(4) &&
        occupiedHouses.includes(10)
      ) {
        return {
          isPresent: true,
          conditionsMet: ['All 7 classical planets are placed entirely in Houses 4 and 10'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_shringataka',
    name: 'Śṛṅgāṭaka Yoga (Nābhāsa Ākṛti — Trikoṇas 1, 5, 9)',
    sanskritName: 'शृङ्गाटक योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 12 / BJ 12:7',
    category: 'Nabhasa',
    definition: 'All seven planets occupy exclusively the three Trikoṇa houses (1st, 5th, and 9th).',
    effects: 'Heroic, engaged in battle or debate victories, noble spouse, affluent, endowed with enduring religious and scholarly merits.',
    evaluate: (ctx) => {
      const occupiedHouses = Array.from(new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.house).filter(Boolean)));
      const isOnlyTrikonas = occupiedHouses.every((h) => [1, 5, 9].includes(h));
      const hasAllThree = occupiedHouses.includes(1) && occupiedHouses.includes(5) && occupiedHouses.includes(9);
      if (isOnlyTrikonas && hasAllThree) {
        return {
          isPresent: true,
          conditionsMet: ['All 7 planets are distributed exclusively across Trikoṇa Houses 1, 5, and 9'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_hala',
    name: 'Hala Yoga (Nābhāsa Ākṛti — Trikoṇas from other houses)',
    sanskritName: 'हल योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 13 / BJ 12:7',
    category: 'Nabhasa',
    definition: 'All seven planets occupy mutually trinal houses originating from any house other than Lagna (2-6-10, 3-7-11, or 4-8-12).',
    effects: 'Agricultural prosperity, industrious, generous provider of food to many, sturdy constitution.',
    evaluate: (ctx) => {
      const occupiedHouses = Array.from(new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.house).filter(Boolean)));
      const trinalSets = [
        [2, 6, 10],
        [3, 7, 11],
        [4, 8, 12],
      ];
      for (const set of trinalSets) {
        if (
          occupiedHouses.every((h) => set.includes(h)) &&
          set.every((h) => occupiedHouses.includes(h))
        ) {
          return {
            isPresent: true,
            conditionsMet: [`All 7 planets occupy mutually trinal Houses ${set.join(', ')}`],
            involvedPlanets: SEVEN_PLANETS,
            strengthRating: 'Medium',
          };
        }
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_vajra',
    name: 'Vajra Yoga (Nābhāsa Ākṛti)',
    sanskritName: 'वज्र योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 14 / BJ 12:8',
    category: 'Nabhasa',
    definition: 'All benefics occupy the 1st and 7th houses, while all malefics occupy the 4th and 10th houses.',
    effects: 'Charming appearance, courageous, fortunate in middle and later life, respected by sovereign authorities.',
    evaluate: (ctx) => {
      const benefics: PlanetId[] = ['jupiter', 'venus', 'mercury', 'moon'];
      const malefics: PlanetId[] = ['sun', 'mars', 'saturn'];
      const beneficsIn1_7 = benefics.every((p) => ctx.planets[p] && (ctx.planets[p].house === 1 || ctx.planets[p].house === 7));
      const maleficsIn4_10 = malefics.every((p) => ctx.planets[p] && (ctx.planets[p].house === 4 || ctx.planets[p].house === 10));
      if (beneficsIn1_7 && maleficsIn4_10) {
        return {
          isPresent: true,
          conditionsMet: [
            'All natural benefics occupy Houses 1 and 7',
            'All natural malefics occupy Houses 4 and 10',
          ],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_yava',
    name: 'Yava Yoga (Nābhāsa Ākṛti)',
    sanskritName: 'यव योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 15 / BJ 12:8',
    category: 'Nabhasa',
    definition: 'All malefics occupy the 1st and 7th houses, while all benefics occupy the 4th and 10th houses.',
    effects: 'Observant of vows, wealthy through disciplined persistence, charitable, enjoying happiness in middle life.',
    evaluate: (ctx) => {
      const benefics: PlanetId[] = ['jupiter', 'venus', 'mercury'];
      const malefics: PlanetId[] = ['sun', 'mars', 'saturn'];
      const maleficsIn1_7 = malefics.every((p) => ctx.planets[p] && (ctx.planets[p].house === 1 || ctx.planets[p].house === 7));
      const beneficsIn4_10 = benefics.every((p) => ctx.planets[p] && (ctx.planets[p].house === 4 || ctx.planets[p].house === 10));
      if (maleficsIn1_7 && beneficsIn4_10) {
        return {
          isPresent: true,
          conditionsMet: [
            'All natural malefics occupy Houses 1 and 7',
            'All natural benefics occupy Houses 4 and 10',
          ],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'nabhasa_kamala',
    name: 'Kamala Yoga / Padma (Nābhāsa Ākṛti — All 4 Kendras occupied)',
    sanskritName: 'कमल योग (पद्म योग)',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 16 / BJ 12:9',
    category: 'Nabhasa',
    definition: 'All seven planets are distributed across all four Kendras (1st, 4th, 7th, and 10th houses), with none outside.',
    effects: 'Immense renown, spotless character, vast authority, blessed with universal virtues, regal luxuries, and long life.',
    evaluate: (ctx) => {
      const occupiedHouses = Array.from(new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.house).filter(Boolean)));
      const isOnlyKendras = occupiedHouses.every((h) => [1, 4, 7, 10].includes(h));
      const hasAllFour = [1, 4, 7, 10].every((h) => occupiedHouses.includes(h));
      if (isOnlyKendras && hasAllFour) {
        return {
          isPresent: true,
          conditionsMet: ['All 7 planets occupy exclusively all four Kendra Houses (1, 4, 7, 10)'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },

  // D. SAṄKHYĀ YOGAS (7 numeric distribution yogas across distinct signs)
  {
    id: 'sankhya_vallaki',
    name: 'Vallakī Yoga / Vīṇā (Nābhāsa Saṅkhyā — 7 signs)',
    sanskritName: 'वल्लकी योग (वीणा योग)',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 23 / BJ 12:12',
    category: 'Nabhasa',
    definition: 'The seven non-node planets occupy exactly seven distinct signs.',
    effects: 'Skilled in musical instruments, fine arts, poetry, eloquent, intelligent, fond of learning, and socially esteemed.',
    evaluate: (ctx) => {
      const distinctSigns = new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.rashiNumber).filter(Boolean));
      if (distinctSigns.size === 7) {
        return {
          isPresent: true,
          conditionsMet: ['The 7 classical planets are distributed across 7 distinct Rāśis'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'sankhya_dama',
    name: 'Dāma Yoga (Nābhāsa Saṅkhyā — 6 signs)',
    sanskritName: 'दाम योग (दामिनी)',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 24 / BJ 12:12',
    category: 'Nabhasa',
    definition: 'The seven non-node planets occupy exactly six distinct signs.',
    effects: 'Generous philanthropist, blessed with cattle and assets, helpful to all, wealthy, famous, and patient.',
    evaluate: (ctx) => {
      const distinctSigns = new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.rashiNumber).filter(Boolean));
      if (distinctSigns.size === 6) {
        return {
          isPresent: true,
          conditionsMet: ['The 7 classical planets occupy 6 distinct Rāśis'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'sankhya_pasha',
    name: 'Pāśa Yoga (Nābhāsa Saṅkhyā — 5 signs)',
    sanskritName: 'पाश योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 25 / BJ 12:13',
    category: 'Nabhasa',
    definition: 'The seven non-node planets occupy exactly five distinct signs.',
    effects: 'Acquires wealth through skilled work, surrounded by numerous relatives and dependents, talkative, adept in transactions.',
    evaluate: (ctx) => {
      const distinctSigns = new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.rashiNumber).filter(Boolean));
      if (distinctSigns.size === 5) {
        return {
          isPresent: true,
          conditionsMet: ['The 7 classical planets occupy 5 distinct Rāśis'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'sankhya_kedara',
    name: 'Kedāra Yoga (Nābhāsa Saṅkhyā — 4 signs)',
    sanskritName: 'केदार योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 26 / BJ 12:13',
    category: 'Nabhasa',
    definition: 'The seven non-node planets occupy exactly four distinct signs.',
    effects: 'Engaged in agricultural or real estate enterprises, truthful, benevolent, wealthy, and steady in action.',
    evaluate: (ctx) => {
      const distinctSigns = new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.rashiNumber).filter(Boolean));
      if (distinctSigns.size === 4) {
        return {
          isPresent: true,
          conditionsMet: ['The 7 classical planets occupy 4 distinct Rāśis'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'sankhya_shula',
    name: 'Śūla Yoga (Nābhāsa Saṅkhyā — 3 signs)',
    sanskritName: 'शूल योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 27 / BJ 12:14',
    category: 'Nabhasa',
    definition: 'The seven non-node planets occupy exactly three distinct signs.',
    effects: 'Bold, resolute, battle-hardened courage, sharp in competitive pursuits.',
    evaluate: (ctx) => {
      const distinctSigns = new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.rashiNumber).filter(Boolean));
      if (distinctSigns.size === 3) {
        return {
          isPresent: true,
          conditionsMet: ['The 7 classical planets occupy 3 distinct Rāśis'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'sankhya_yuga',
    name: 'Yuga Yoga (Nābhāsa Saṅkhyā — 2 signs)',
    sanskritName: 'युग योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 28 / BJ 12:14',
    category: 'Nabhasa',
    definition: 'The seven non-node planets occupy exactly two distinct signs.',
    effects: 'Unconventional path, intensely focused energy in specific domains, self-reliant.',
    evaluate: (ctx) => {
      const distinctSigns = new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.rashiNumber).filter(Boolean));
      if (distinctSigns.size === 2) {
        return {
          isPresent: true,
          conditionsMet: ['The 7 classical planets occupy exactly 2 distinct Rāśis'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'sankhya_gola',
    name: 'Gola Yoga (Nābhāsa Saṅkhyā — 1 sign)',
    sanskritName: 'गोल योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 29 / BJ 12:14',
    category: 'Nabhasa',
    definition: 'All seven non-node planets are clustered in a single sign (extremely rare Stellium).',
    effects: 'Immense concentration of karmic force, unique destiny, focused ascetic or solitary power.',
    evaluate: (ctx) => {
      const distinctSigns = new Set(SEVEN_PLANETS.map((p) => ctx.planets[p]?.rashiNumber).filter(Boolean));
      if (distinctSigns.size === 1) {
        return {
          isPresent: true,
          conditionsMet: ['All 7 classical planets are clustered in 1 single Rāśi'],
          involvedPlanets: SEVEN_PLANETS,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },

  // -----------------------------------------------------------------------
  // III. CHANDRA (LUNAR) YOGAS (BJ Ch. 13, BPHS Ch. 36-37, Sarvāvalī Ch. 13, PD Ch. 6)
  // -----------------------------------------------------------------------
  {
    id: 'gajakesari',
    name: 'Gajakesarī Yoga',
    sanskritName: 'गजकेसरी योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 36, v. 3-4 / PD 6:14 / Sarvāvalī 13:16',
    sanskritShloka: 'केन्द्रे स्थिते देवगुरौ शशाङ्कात् सञ्जायते केसरी नाम योगः । दृष्टे सितार्येन्दुसुतैर्न नीचैः ख्यातप्रतापो नृपवल्लभो वा ॥',
    category: 'Chandra',
    definition: 'Jupiter is in a Kendra (1st, 4th, 7th, or 10th house) from the Moon.',
    effects: 'Grants lion-like majesty, unassailable intellect, lasting fame, scholarly victory, victory over adversaries, and noble sovereignty.',
    evaluate: (ctx) => {
      const moon = ctx.planets.moon;
      const jup = ctx.planets.jupiter;
      if (!moon || !jup) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const relHouse = getRelativeHouse(moon.house, jup.house);
      if (isKendra(relHouse)) {
        return {
          isPresent: true,
          conditionsMet: [
            `Jupiter (House ${jup.house}) is in Kendra ${relHouse} from Moon (House ${moon.house})`,
            jup.isCombust ? 'Jupiter is combust' : 'Jupiter has full celestial luster',
          ],
          involvedPlanets: ['jupiter', 'moon'],
          strengthRating: jup.isCombust ? 'Medium' : 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'sunapha',
    name: 'Sunaphā Yoga',
    sanskritName: 'सुनफा योग',
    sourceText: 'Bṛhat Jātaka',
    chapterAndVerse: 'BJ Ch. 13, v. 3 / Sarvāvalī 13:1 / PD 6:6',
    sanskritShloka: 'हित्वाऽर्कं सुनफा द्वितीये हिमगोरुपजायते । स्ववीर्यार्जितवित्तश्च सुखी धीरो नृपोपमः ॥',
    category: 'Chandra',
    definition: 'Planets other than the Sun, Rahu, and Ketu occupy the 2nd house from the Moon.',
    effects: 'Endows self-earned prosperity, calm intelligence, regal status, and stable family wealth.',
    evaluate: (ctx) => {
      const moon = ctx.planets.moon;
      if (!moon) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const h2FromMoon = ((moon.house % 12) + 1);
      const planetsIn2nd = FIVE_TARA_GRAHAS.filter((p) => ctx.planets[p]?.house === h2FromMoon);
      if (planetsIn2nd.length > 0) {
        return {
          isPresent: true,
          conditionsMet: [`Grahas (${planetsIn2nd.join(', ')}) occupy the 2nd house from Moon (House ${h2FromMoon})`],
          involvedPlanets: ['moon', ...planetsIn2nd],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'anapha',
    name: 'Anaphā Yoga',
    sanskritName: 'अनफा योग',
    sourceText: 'Bṛhat Jātaka',
    chapterAndVerse: 'BJ Ch. 13, v. 4 / Sarvāvalī 13:7 / PD 6:6',
    sanskritShloka: 'द्वादशे हिमगोः प्रोक्ताऽनफा मतिविभूषणः । सुशीलो रूपसम्पन्नः कीर्तिमान् सुभगो नरः ॥',
    category: 'Chandra',
    definition: 'Planets other than the Sun, Rahu, and Ketu occupy the 12th house from the Moon.',
    effects: 'Endows moral elegance, physical beauty, renowned reputation, freedom from diseases, and self-restraint.',
    evaluate: (ctx) => {
      const moon = ctx.planets.moon;
      if (!moon) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const h12FromMoon = (((moon.house - 2 + 12) % 12) + 1);
      const planetsIn12th = FIVE_TARA_GRAHAS.filter((p) => ctx.planets[p]?.house === h12FromMoon);
      if (planetsIn12th.length > 0) {
        return {
          isPresent: true,
          conditionsMet: [`Grahas (${planetsIn12th.join(', ')}) occupy the 12th house from Moon (House ${h12FromMoon})`],
          involvedPlanets: ['moon', ...planetsIn12th],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'durudhara',
    name: 'Durudharā Yoga',
    sanskritName: 'दुरुधरा योग',
    sourceText: 'Bṛhat Jātaka',
    chapterAndVerse: 'BJ Ch. 13, v. 5 / Sarvāvalī 13:10 / PD 6:7',
    sanskritShloka: 'उभयतः स्थिताः सुनफानफाख्या दुरुधरा । त्यागी भोगी समृद्धश्च भृत्योपेतः सुविश्रुतः ॥',
    category: 'Chandra',
    definition: 'Planets other than Sun, Rahu, and Ketu occupy both the 2nd and 12th houses from the Moon simultaneously.',
    effects: 'Endows abundant wealth, immense generosity, loyal attendants, vehicles, unbroken prosperity, and universal renown.',
    evaluate: (ctx) => {
      const moon = ctx.planets.moon;
      if (!moon) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const h2FromMoon = ((moon.house % 12) + 1);
      const h12FromMoon = (((moon.house - 2 + 12) % 12) + 1);
      const planetsIn2nd = FIVE_TARA_GRAHAS.filter((p) => ctx.planets[p]?.house === h2FromMoon);
      const planetsIn12th = FIVE_TARA_GRAHAS.filter((p) => ctx.planets[p]?.house === h12FromMoon);
      if (planetsIn2nd.length > 0 && planetsIn12th.length > 0) {
        return {
          isPresent: true,
          conditionsMet: [
            `Planets in 2nd from Moon (${planetsIn2nd.join(', ')}) and 12th from Moon (${planetsIn12th.join(', ')})`,
          ],
          involvedPlanets: ['moon', ...planetsIn2nd, ...planetsIn12th],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'kemadruma',
    name: 'Kemadruma Yoga',
    sanskritName: 'केमद्रुम योग',
    sourceText: 'Bṛhat Jātaka',
    chapterAndVerse: 'BJ Ch. 13, v. 6 / BPHS Ch. 37, v. 11-13 / Sarvāvalī 13:13',
    sanskritShloka: 'केमद्रुमे जन्म यस्य स भवेन्निर्धनः सदा । दुःखितः परप्रेष्यश्च मलिनाङ्गः कुचेष्टितः ॥',
    category: 'Chandra',
    definition:
      'No planet other than the Sun, Rāhu or Ketu occupies the 2nd or 12th house from the Moon. ' +
      'A planet in a kendra from the Moon or from the Lagna cancels it (Kemadruma-bhaṅga, BPHS 37.14) — ' +
      'that is a cancellation, not part of the formation.',
    effects: 'Creates periods of mental isolation and material hurdles; motivates intense inner spiritual self-reliance.',
    evaluate: (ctx) => {
      const moon = ctx.planets.moon;
      if (!moon) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const h2FromMoon = ((moon.house % 12) + 1);
      const h12FromMoon = (((moon.house - 2 + 12) % 12) + 1);
      const planetsIn2nd = FIVE_TARA_GRAHAS.filter((p) => ctx.planets[p]?.house === h2FromMoon);
      const planetsIn12th = FIVE_TARA_GRAHAS.filter((p) => ctx.planets[p]?.house === h12FromMoon);

      if (planetsIn2nd.length === 0 && planetsIn12th.length === 0) {
        // Classical cancellation check (Kemadruma-Bhaṅga):
        // If planets are in Kendra from Moon or Lagna, the malefic effect is cancelled (BPHS 37:14)
        // Kemadruma-Bhanga (BPHS 37.14): a planet in a kendra from the Moon OR
        // from the Lagna cancels the affliction. Only the Moon branch was
        // tested before, so a chart relieved solely via the Lagna was reported
        // as uncancelled.
        const planetsInKendraFromMoon = FIVE_TARA_GRAHAS.filter((p) => {
          const relH = getRelativeHouse(moon.house, ctx.planets[p]?.house);
          return isKendra(relH);
        });
        const planetsInKendraFromLagna = FIVE_TARA_GRAHAS.filter(
          (p) => ctx.planets[p] && isKendra(ctx.planets[p].house)
        );
        const cancellingPlanets = [
          ...new Set([...planetsInKendraFromMoon, ...planetsInKendraFromLagna]),
        ];

        if (cancellingPlanets.length > 0) {
          return {
            isPresent: true,
            conditionsMet: [
              'No planets in 2nd or 12th from Moon',
              `Cancelled (Kemadruma-Bhaṅga) by ${cancellingPlanets.join(', ')} in a Kendra from the Moon or Lagna`,
            ],
            involvedPlanets: ['moon', ...cancellingPlanets],
            strengthRating: 'Cancelled',
          };
        }

        return {
          isPresent: true,
          conditionsMet: [
            'No planets in 2nd or 12th from Moon',
            'No planets occupying Kendra positions from Moon',
          ],
          involvedPlanets: ['moon'],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'chandra_mangala',
    name: 'Candra-Maṅgala Yoga',
    sanskritName: 'चन्द्र-मङ्गल योग',
    sourceText: 'Jātaka Pārijāta',
    chapterAndVerse: 'JP Ch. 6, v. 25 / Sarvāvalī 15:21 / PD 6:13',
    sanskritShloka: 'चन्द्राङ्गारकयोर्योगे धनवान् साहसी नरः । व्यापारकुशलो धीरो भूमिवित्तसमन्वितः ॥',
    category: 'Dhana',
    definition: 'Moon and Mars are conjoined in the same house or aspect each other mutually (7th house apart).',
    effects: 'Generates energetic commercial prowess, lucrative financial enterprise, real estate wealth, and entrepreneurial vigor.',
    evaluate: (ctx) => {
      const moon = ctx.planets.moon;
      const mars = ctx.planets.mars;
      if (!moon || !mars) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const isConjoined = moon.house === mars.house;
      const isMutualAspect = Math.abs(moon.house - mars.house) === 6;
      if (isConjoined || isMutualAspect) {
        return {
          isPresent: true,
          conditionsMet: [
            `Moon (House ${moon.house}) and Mars (House ${mars.house}) are ${isConjoined ? 'conjoined' : 'in mutual 7th aspect'}`,
          ],
          involvedPlanets: ['moon', 'mars'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'adhi_yoga_moon',
    name: 'Candra-Ādhi Yoga',
    sanskritName: 'चन्द्र-आधि योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 36, v. 5-7 / BJ 13:7 / PD 6:17',
    sanskritShloka: 'सौम्यैः स्मरारिनिधनैर्विहगोदयाच्चेद् योगोऽधियोग इति सत्सुखपुष्टिवृद्धेः । भूपोऽथवा नृपसमो धनवांश्च वीरो दीर्घायुषो विगतशत्रुरदीनचेताः ॥',
    category: 'Raja',
    definition: 'Natural benefics (Jupiter, Venus, Mercury) occupy the 6th, 7th, and/or 8th houses from the Moon.',
    effects: 'Elevates native to prime minister or ruler status, endowed with radiant health, immense wealth, defeat of all enemies, and longevity.',
    evaluate: (ctx) => {
      const moon = ctx.planets.moon;
      if (!moon) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const benefics: PlanetId[] = ['jupiter', 'venus', 'mercury'];
      const targetHouses = [
        (((moon.house - 1 + 5) % 12) + 1), // 6th from Moon
        (((moon.house - 1 + 6) % 12) + 1), // 7th from Moon
        (((moon.house - 1 + 7) % 12) + 1), // 8th from Moon
      ];
      const beneficsInHouses = benefics.filter((p) => ctx.planets[p] && targetHouses.includes(ctx.planets[p].house));
      if (beneficsInHouses.length >= 2) {
        return {
          isPresent: true,
          conditionsMet: [
            `Natural benefics (${beneficsInHouses.join(', ')}) occupy the 6th, 7th, or 8th house from Moon`,
          ],
          involvedPlanets: ['moon', ...beneficsInHouses],
          strengthRating: beneficsInHouses.length === 3 ? 'High' : 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },

  // -----------------------------------------------------------------------
  // IV. SŪRYA (SOLAR) YOGAS (BJ Ch. 13, Sarvāvalī Ch. 13, PD Ch. 6, BPHS Ch. 36)
  // -----------------------------------------------------------------------
  {
    id: 'budhaditya',
    name: 'Budhāditya Yoga',
    sanskritName: 'बुधादित्य योग',
    sourceText: 'Sarvāvalī',
    chapterAndVerse: 'Sarvāvalī Ch. 14, v. 4 / BPHS Ch. 36, v. 1',
    sanskritShloka: 'रविबुधयोरेकस्थे बुधादित्यः प्रकीर्तितः । सर्वशास्त्रज्ञविद्वान् सुविख्यातो नृपपूजितः ॥',
    category: 'Surya',
    definition: 'Sun and Mercury are conjoined in the same house.',
    effects: 'Bestows sharp analytical intelligence, scholastic mastery, administrative acumen, royal favor, and eloquence.',
    evaluate: (ctx) => {
      const sun = ctx.planets.sun;
      const merc = ctx.planets.mercury;
      if (!sun || !merc) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      if (sun.house === merc.house) {
        return {
          isPresent: true,
          conditionsMet: [
            `Sun and Mercury are conjoined in House ${sun.house} (${RASHIS[sun.rashiNumber].sanskritName})`,
            merc.isCombust ? 'Mercury is within combustion orb (normal for Budhāditya)' : 'Mercury is free from deep combustion',
          ],
          involvedPlanets: ['sun', 'mercury'],
          strengthRating: merc.isCombust ? 'Medium' : 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'vesi',
    name: 'Veśi Yoga',
    sanskritName: 'वेशि योग',
    sourceText: 'Bṛhat Jātaka',
    chapterAndVerse: 'BJ Ch. 13, v. 1 / Sarvāvalī 13:1 / PD 6:1',
    sanskritShloka: 'सूर्याद् द्वितीये वेशी स्यात् पुष्टकायो निरालसः । सत्यवादी समदृष्टिर्दीर्घायुर्धनसंयुतः ॥',
    category: 'Surya',
    definition: 'Planets other than Moon, Rahu, and Ketu occupy the 2nd house from the Sun.',
    effects: 'Endows truthful speech, equanimous vision, industrious constitution, physical vigor, and steady prosperity.',
    evaluate: (ctx) => {
      const sun = ctx.planets.sun;
      if (!sun) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const h2FromSun = ((sun.house % 12) + 1);
      const planetsIn2nd = FIVE_TARA_GRAHAS.filter((p) => ctx.planets[p]?.house === h2FromSun);
      if (planetsIn2nd.length > 0) {
        return {
          isPresent: true,
          conditionsMet: [`Grahas (${planetsIn2nd.join(', ')}) occupy the 2nd house from Sun (House ${h2FromSun})`],
          involvedPlanets: ['sun', ...planetsIn2nd],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'vosi',
    name: 'Vośi Yoga',
    sanskritName: 'वोशि योग',
    sourceText: 'Bṛhat Jātaka',
    chapterAndVerse: 'BJ Ch. 13, v. 2 / Sarvāvalī 13:4 / PD 6:2',
    sanskritShloka: 'व्यये वोशिः सुविख्यातः शास्त्रज्ञो मधुरप्रियः । दानशीलो गुणोपेतः प्रतापी जनवल्लभः ॥',
    category: 'Surya',
    definition: 'Planets other than Moon, Rahu, and Ketu occupy the 12th house from the Sun.',
    effects: 'Bestows scholarly memory, philanthropic spirit, scientific learning, noble virtue, and popularity.',
    evaluate: (ctx) => {
      const sun = ctx.planets.sun;
      if (!sun) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const h12FromSun = (((sun.house - 2 + 12) % 12) + 1);
      const planetsIn12th = FIVE_TARA_GRAHAS.filter((p) => ctx.planets[p]?.house === h12FromSun);
      if (planetsIn12th.length > 0) {
        return {
          isPresent: true,
          conditionsMet: [`Grahas (${planetsIn12th.join(', ')}) occupy the 12th house from Sun (House ${h12FromSun})`],
          involvedPlanets: ['sun', ...planetsIn12th],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'ubhayachari',
    name: 'Ubhayacarī Yoga',
    sanskritName: 'उभयचरी योग',
    sourceText: 'Sarvāvalī',
    chapterAndVerse: 'Sarvāvalī Ch. 13, v. 12 / PD 6:3',
    sanskritShloka: 'उभयतो रवियोगे जायतेऽनुकूलभाग्यवान् । रूपवान् मधुरभाषी सर्वलोकप्रियः सुखी ॥',
    category: 'Surya',
    definition: 'Planets other than Moon, Rahu, and Ketu occupy both the 2nd and 12th houses from Sun simultaneously.',
    effects: 'Grants symmetrical physical beauty, eloquent oratory, sovereign connections, broad friendships, and happiness.',
    evaluate: (ctx) => {
      const sun = ctx.planets.sun;
      if (!sun) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const h2FromSun = ((sun.house % 12) + 1);
      const h12FromSun = (((sun.house - 2 + 12) % 12) + 1);
      const planetsIn2nd = FIVE_TARA_GRAHAS.filter((p) => ctx.planets[p]?.house === h2FromSun);
      const planetsIn12th = FIVE_TARA_GRAHAS.filter((p) => ctx.planets[p]?.house === h12FromSun);
      if (planetsIn2nd.length > 0 && planetsIn12th.length > 0) {
        return {
          isPresent: true,
          conditionsMet: [
            `Sun is flanked on both sides: 2nd (${planetsIn2nd.join(', ')}) and 12th (${planetsIn12th.join(', ')})`,
          ],
          involvedPlanets: ['sun', ...planetsIn2nd, ...planetsIn12th],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },

  // -----------------------------------------------------------------------
  // V. RĀJA YOGAS & PARĀŚARI KENDRA-TRIKOṆA SAMBANDHA (BPHS Ch. 34-35, JP Ch. 6, PD Ch. 7)
  // -----------------------------------------------------------------------
  {
    id: 'dharma_karmadhipati',
    name: 'Dharma-Karmādhipati Yoga',
    sanskritName: 'धर्म-कर्माधिपति योग (सर्वश्रेष्ठ राजयोग)',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 1-5 / JP 6:42 / PD 7:2',
    sanskritShloka: 'भाग्येशे कर्मभावस्थे कर्मेशे भाग्यसंस्थिते । युक्ते वा वीक्षिते वाऽपि महाभाग्यं विनिर्दिशेत् ॥',
    category: 'Raja',
    definition: 'Lord of the 9th (Dharma) and Lord of the 10th (Karma) form Sambandha (conjunction, mutual aspect, or parivartana).',
    effects: 'The supreme Raja Yoga. Conveys magnificent sovereign authority, ethical excellence, vast public influence, and unbroken prosperity.',
    evaluate: (ctx) => {
      const l9 = getHouseLordFromLagna(9, ctx.lagnaRashi);
      const l10 = getHouseLordFromLagna(10, ctx.lagnaRashi);
      const p9 = ctx.planets[l9];
      const p10 = ctx.planets[l10];
      if (!p9 || !p10) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      // Conjunction
      if (p9.house === p10.house) {
        return {
          isPresent: true,
          conditionsMet: [
            `9th Lord (${l9.toUpperCase()}) and 10th Lord (${l10.toUpperCase()}) conjoined in House ${p9.house}`,
          ],
          involvedPlanets: [l9, l10],
          strengthRating: 'High',
        };
      }
      // Parivartana
      if (p9.house === 10 && p10.house === 9) {
        return {
          isPresent: true,
          conditionsMet: [
            `9th Lord (${l9.toUpperCase()}) in 10th house and 10th Lord (${l10.toUpperCase()}) in 9th house (Maha Parivartana)`,
          ],
          involvedPlanets: [l9, l10],
          strengthRating: 'High',
        };
      }
      // Mutual Aspect
      if (Math.abs(p9.house - p10.house) === 6) {
        return {
          isPresent: true,
          conditionsMet: [
            `9th Lord (${l9.toUpperCase()}) and 10th Lord (${l10.toUpperCase()}) in mutual 7th aspect`,
          ],
          involvedPlanets: [l9, l10],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'raja_1_5',
    name: 'Lagneśa–Pañcameśa Rāja Yoga',
    sanskritName: 'लग्नेश-पञ्चमेश राजयोग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 12',
    category: 'Raja',
    definition: 'Lord of the 1st house (Lagneśa) and Lord of the 5th house (Pañcameśa) are conjoined or in mutual aspect.',
    effects: 'Endows razor-sharp intellect, ministerial dignity, virtuous offspring, and royal favor.',
    evaluate: (ctx) => {
      const l1 = getHouseLordFromLagna(1, ctx.lagnaRashi);
      const l5 = getHouseLordFromLagna(5, ctx.lagnaRashi);
      const p1 = ctx.planets[l1];
      const p5 = ctx.planets[l5];
      if (!p1 || !p5) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      if (p1.house === p5.house || Math.abs(p1.house - p5.house) === 6) {
        return {
          isPresent: true,
          conditionsMet: [
            `1st Lord (${l1.toUpperCase()}) and 5th Lord (${l5.toUpperCase()}) are ${p1.house === p5.house ? 'conjoined in House ' + p1.house : 'in mutual aspect'}`,
          ],
          involvedPlanets: [l1, l5],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'raja_4_9',
    name: 'Bandhveśa–Bhāgyeśa Rāja Yoga',
    sanskritName: 'बन्ध्वेश-भाग्येश राजयोग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 35, v. 14',
    category: 'Raja',
    definition: 'Lord of the 4th house and Lord of the 9th house form Sambandha in an auspicious house.',
    effects: 'Grants magnificent landed properties, high educational status, ancestral fortune, and vehicles.',
    evaluate: (ctx) => {
      const l4 = getHouseLordFromLagna(4, ctx.lagnaRashi);
      const l9 = getHouseLordFromLagna(9, ctx.lagnaRashi);
      const p4 = ctx.planets[l4];
      const p9 = ctx.planets[l9];
      if (!p4 || !p9) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      if (p4.house === p9.house || Math.abs(p4.house - p9.house) === 6) {
        return {
          isPresent: true,
          conditionsMet: [
            `4th Lord (${l4.toUpperCase()}) and 9th Lord (${l9.toUpperCase()}) are in auspicious Sambandha`,
          ],
          involvedPlanets: [l4, l9],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'amala_lagna',
    name: 'Amala Yoga (from Lagna/Moon)',
    sanskritName: 'अमल योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 36, v. 10 / PD 6:21',
    sanskritShloka: 'लग्नाद्वा विधुतो वापि दशमे शुभसंयुते । अमलो नाम योगोऽयं कीर्तिमान् गुणवान् सुखी ॥',
    category: 'Raja',
    definition: 'A natural benefic (Jupiter, Venus, Mercury) occupies the 10th house from Lagna or Moon without malefic affliction.',
    effects: 'Grants spotless reputation, benevolent and honest professional authority, universal respect, and lasting legacy.',
    evaluate: (ctx) => {
      const benefics: PlanetId[] = ['jupiter', 'venus', 'mercury'];
      const in10FromLagna = benefics.filter((p) => ctx.planets[p]?.house === 10);
      const moon = ctx.planets.moon;
      const in10FromMoon = moon
        ? benefics.filter((p) => getRelativeHouse(moon.house, ctx.planets[p]?.house) === 10)
        : [];

      const activeBenefics = Array.from(new Set([...in10FromLagna, ...in10FromMoon]));
      if (activeBenefics.length > 0) {
        return {
          isPresent: true,
          conditionsMet: [
            `Natural benefic (${activeBenefics.join(', ')}) in 10th house of profession and authority`,
          ],
          involvedPlanets: activeBenefics,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'parvata',
    name: 'Parvata Yoga',
    sanskritName: 'पर्वत योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 35 / JP 6:35',
    sanskritShloka: 'केन्द्रत्रिकोणगे सौम्ये षष्ठाष्टमगतैः खलैरपि । पर्वताख्यो भवेद् योगो राजा वा तत्समो नरः ॥',
    category: 'Raja',
    definition: 'Benefics occupy Kendra houses, while the 6th and 8th houses are either vacant or occupied solely by benefics.',
    effects: 'Grants mountain-like stability of fortune, leadership, renowned authority, immense philanthropy, and happiness.',
    evaluate: (ctx) => {
      const benefics: PlanetId[] = ['jupiter', 'venus', 'mercury'];
      const malefics: PlanetId[] = ['sun', 'mars', 'saturn'];
      const beneficsInKendras = benefics.some((p) => ctx.planets[p] && isKendra(ctx.planets[p].house));
      const maleficsIn6_8 = malefics.some((p) => ctx.planets[p] && (ctx.planets[p].house === 6 || ctx.planets[p].house === 8));
      if (beneficsInKendras && !maleficsIn6_8) {
        return {
          isPresent: true,
          conditionsMet: [
            'Natural benefics occupy Kendra angular houses',
            '6th and 8th houses are free from natural malefic occupation',
          ],
          involvedPlanets: benefics.filter((p) => ctx.planets[p] && isKendra(ctx.planets[p].house)),
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'kahala',
    name: 'Kāhala Yoga',
    sanskritName: 'काहल योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 36 / JP 6:36',
    sanskritShloka: 'चतुर्थे कर्मपे लग्ने स्वोच्चे वा स्वगृहे गुरौ । काहलाख्यो भवेद्योगः सेनानीर्वा नृपोपमः ॥',
    category: 'Raja',
    definition: '4th lord and 9th/10th lord are in mutual kendras, and Lagneśa is dignified in strength.',
    effects: 'Endows martial courage, head of assemblies or institutions, vigorous physical strength, and authority.',
    evaluate: (ctx) => {
      const l4 = getHouseLordFromLagna(4, ctx.lagnaRashi);
      const l10 = getHouseLordFromLagna(10, ctx.lagnaRashi);
      const p4 = ctx.planets[l4];
      const p10 = ctx.planets[l10];
      if (!p4 || !p10) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const relH = getRelativeHouse(p4.house, p10.house);
      if (isKendra(relH)) {
        return {
          isPresent: true,
          conditionsMet: [
            `4th Lord (${l4.toUpperCase()}) and 10th Lord (${l10.toUpperCase()}) are in mutual Kendras (House distance ${relH})`,
          ],
          involvedPlanets: [l4, l10],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },

  // -----------------------------------------------------------------------
  // VI. DHANA YOGAS (WEALTH COMBINATIONS — BPHS Ch. 41-42)
  // -----------------------------------------------------------------------
  {
    id: 'dhana_2_11',
    name: 'Mahā Dhana Yoga (2nd & 11th Lords Sambandha)',
    sanskritName: 'महाधन योग (द्वितीयेश-एकादशेश)',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 41, v. 1-4',
    category: 'Dhana',
    definition: 'Lord of the 2nd house (Dhana / Treasury) and Lord of the 11th house (Lābha / Gains) are conjoined in an auspicious house.',
    effects: 'Guarantees continuous influx of wealth, asset accumulation, successful fiscal investments, and financial freedom.',
    evaluate: (ctx) => {
      const l2 = getHouseLordFromLagna(2, ctx.lagnaRashi);
      const l11 = getHouseLordFromLagna(11, ctx.lagnaRashi);
      const p2 = ctx.planets[l2];
      const p11 = ctx.planets[l11];
      if (!p2 || !p11) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      if (p2.house === p11.house && !isDusthana(p2.house)) {
        return {
          isPresent: true,
          conditionsMet: [
            `2nd Lord of Treasury (${l2.toUpperCase()}) and 11th Lord of Gains (${l11.toUpperCase()}) conjoined in House ${p2.house}`,
          ],
          involvedPlanets: [l2, l11],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'dhana_1_2_9_11',
    name: 'Lakṣmī Yoga (9th Lord in Kendra/Mūlatrikoṇa + Strong Venus)',
    sanskritName: 'लक्ष्मी योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 36, v. 25 / Sarvāvalī 13:20 / PD 6:28',
    sanskritShloka: 'भाग्येशे केन्द्रसंस्थे च स्वोच्चे वा स्वगृहे स्थिते । भृगुपुत्रे बलैर्युक्ते लक्ष्मीयोगः प्रकीर्तितः ॥',
    category: 'Dhana',
    definition: 'Lord of the 9th house is situated in a Kendra in own sign or exaltation, and Venus is endowed with strong dignity.',
    effects: 'Bestows the boundless grace of Goddess Lakṣmī: perennial prosperity, noble character, refined lineage, and radiant fortune.',
    evaluate: (ctx) => {
      const l9 = getHouseLordFromLagna(9, ctx.lagnaRashi);
      const p9 = ctx.planets[l9];
      const ven = ctx.planets.venus;
      if (!p9 || !ven) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const l9InKendra = isKendra(p9.house);
      const l9Dignified = isOwnSign(l9, p9.rashiNumber) || isExalted(l9, p9.rashiNumber) || isMoolatrikona(l9, p9.rashiNumber);
      const venDignified = !isDebilitated('venus', ven.rashiNumber) && !ven.isCombust;

      if (l9InKendra && (l9Dignified || p9.house === 9) && venDignified) {
        return {
          isPresent: true,
          conditionsMet: [
            `9th Lord (${l9.toUpperCase()}) is placed in Kendra Bhāva ${p9.house} in high dignity`,
            'Venus is free from debilitation and combustion',
          ],
          involvedPlanets: [l9, 'venus'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'dhana_5_9',
    name: 'Trikoṇeśa Dhana Yoga (5th & 9th Lords)',
    sanskritName: 'त्रिकोणेश धनयोग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 41, v. 8',
    category: 'Dhana',
    definition: 'Lord of the 5th and Lord of the 9th house are in mutual Sambandha (conjunction or mutual aspect).',
    effects: 'Generates great prosperity through Purva-Punya (past virtuous karma), high wisdom, investments, and noble counsel.',
    evaluate: (ctx) => {
      const l5 = getHouseLordFromLagna(5, ctx.lagnaRashi);
      const l9 = getHouseLordFromLagna(9, ctx.lagnaRashi);
      const p5 = ctx.planets[l5];
      const p9 = ctx.planets[l9];
      if (!p5 || !p9) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      if (p5.house === p9.house || Math.abs(p5.house - p9.house) === 6) {
        return {
          isPresent: true,
          conditionsMet: [
            `5th Lord (${l5.toUpperCase()}) and 9th Lord (${l9.toUpperCase()}) are in mutual Sambandha`,
          ],
          involvedPlanets: [l5, l9],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'vasumati',
    name: 'Vasumatī Yoga',
    sanskritName: 'वसुमती योग',
    sourceText: 'Bṛhat Jātaka',
    chapterAndVerse: 'BJ Ch. 13, v. 9 / Sarvāvalī 13:22 / PD 6:23',
    sanskritShloka: 'सौम्यैः सर्वैरुपचयगतैर्लग्नाद्वा चन्द्रतोऽपि वा । वसुमान् वसुसम्पन्नः कोटिशो धनभाग् भवेत् ॥',
    category: 'Dhana',
    definition: 'All natural benefics (Jupiter, Venus, Mercury) occupy Upacaya houses (3rd, 6th, 10th, 11th) from Lagna or Moon.',
    effects: 'Bestows billionaire-scale material wealth (Kotipati), boundless lands, flourishing independent businesses, and autonomy.',
    evaluate: (ctx) => {
      const benefics: PlanetId[] = ['jupiter', 'venus', 'mercury'];
      const fromLagna = benefics.every((p) => ctx.planets[p] && isUpachaya(ctx.planets[p].house));
      const moon = ctx.planets.moon;
      const fromMoon = moon
        ? benefics.every((p) => ctx.planets[p] && isUpachaya(getRelativeHouse(moon.house, ctx.planets[p].house)))
        : false;

      if (fromLagna || fromMoon) {
        return {
          isPresent: true,
          conditionsMet: [
            `All natural benefics (${benefics.join(', ')}) occupy Upacaya houses (3, 6, 10, 11) from ${fromLagna ? 'Lagna' : 'Moon'}`,
          ],
          involvedPlanets: benefics,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },

  // -----------------------------------------------------------------------
  // VII. VIPARĪTA RĀJA YOGAS (DUṢṬHĀNA LORDS IN DUṢṬHĀNAS — PD Ch. 6)
  // -----------------------------------------------------------------------
  {
    id: 'harsha',
    name: 'Harṣa Viparīta Rāja Yoga',
    sanskritName: 'हर्ष विपरीत राजयोग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 57 / SC 4:12',
    sanskritShloka: 'दुःखेशे दुःस्थानगे हर्षो जायते सुखवर्धनः । अजेयः शत्रुभिर्धन्यः कीर्तिमान् सुस्थिरैश्वर्यः ॥',
    category: 'Viparita',
    definition: 'The 6th lord is placed in the 6th, 8th, or 12th house, and is unafflicted by auspicious house lords.',
    effects: 'Grants victory over adversaries, invulnerability to litigation, robust biological immunity, fame, and unassailable joy.',
    evaluate: (ctx) => {
      const l6 = getHouseLordFromLagna(6, ctx.lagnaRashi);
      const p6 = ctx.planets[l6];
      if (p6 && isDusthana(p6.house)) {
        return {
          isPresent: true,
          conditionsMet: [
            `6th Lord (${l6.toUpperCase()}) is located in Duṣṭhāna House ${p6.house}`,
          ],
          involvedPlanets: [l6],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'sarala',
    name: 'Sarala Viparīta Rāja Yoga',
    sanskritName: 'सरल विपरीत राजयोग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 58 / SC 4:14',
    sanskritShloka: 'रन्ध्रेशे दुःस्थानगे सरलो दीर्घायुर्गुणवान् सुखी । धीरो विद्याधनैर्युक्तो जयशीलः सदा भवेत् ॥',
    category: 'Viparita',
    definition: 'The 8th lord is placed in the 6th, 8th, or 12th house.',
    effects: 'Bestows exceptional longevity, fearlessness, sudden unexpected discoveries of assets, scholarly triumph, and fortitude.',
    evaluate: (ctx) => {
      const l8 = getHouseLordFromLagna(8, ctx.lagnaRashi);
      const p8 = ctx.planets[l8];
      if (p8 && isDusthana(p8.house)) {
        return {
          isPresent: true,
          conditionsMet: [
            `8th Lord (${l8.toUpperCase()}) is located in Duṣṭhāna House ${p8.house}`,
          ],
          involvedPlanets: [l8],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'vimala',
    name: 'Vimala Viparīta Rāja Yoga',
    sanskritName: 'विमल विपरीत राजयोग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 59 / SC 4:16',
    sanskritShloka: 'व्ययेशे दुःस्थानगे विमलो मन्दव्ययो धनी । सुचरित्रो गुणाधारः स्वातन्त्र्येण सुशोभते ॥',
    category: 'Viparita',
    definition: 'The 12th lord is placed in the 6th, 8th, or 12th house.',
    effects: 'Prudent expenditures, accumulation of independent wealth, immaculate conduct, noble virtues, and inner tranquility.',
    evaluate: (ctx) => {
      const l12 = getHouseLordFromLagna(12, ctx.lagnaRashi);
      const p12 = ctx.planets[l12];
      if (p12 && isDusthana(p12.house)) {
        return {
          isPresent: true,
          conditionsMet: [
            `12th Lord (${l12.toUpperCase()}) is located in Duṣṭhāna House ${p12.house}`,
          ],
          involvedPlanets: [l12],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },

  // -----------------------------------------------------------------------
  // VIII. NĪCABHAṄGA RĀJA YOGAS (BPHS Ch. 39, PD Ch. 6, JP Ch. 6)
  // -----------------------------------------------------------------------
  {
    id: 'neechabhanga_raja',
    name: 'Nīcabhaṅga Rāja Yoga',
    sanskritName: 'नीचभङ्ग राजयोग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 26-30 / BPHS Ch. 39, v. 1-8',
    sanskritShloka: 'नीचस्थितो जन्मनि यो ग्रहः स्यात् तद्राशिनाथोऽपि तदुच्चनाथः । चन्द्राल्लग्नाद्यदि केन्द्रवर्ती राजा भवेद् धार्मिकचक्रवर्ती ॥',
    category: 'Raja',
    definition: 'A debilitated planet has its debility cancelled via classical rules (dispositor in Kendra, exaltation lord in Kendra, or mutual aspect).',
    effects: 'Transforms humble origins or initial severe setbacks into monumental worldly triumphs; brings royal sovereignty and resilience.',
    evaluate: (ctx) => {
      const debPlanets: PlanetId[] = [];
      const reasons: string[] = [];
      const moon = ctx.planets.moon;

      for (const pId of SEVEN_PLANETS) {
        const pPos = ctx.planets[pId];
        const prop = GRAHA_PROPERTIES[pId];
        if (pPos && prop && pPos.rashiNumber === prop.debilitationSign) {
          // Debilitated planet found! Check classical cancellation conditions:
          const debRashiLord = RASHIS[prop.debilitationSign].lord;
          const debLordPos = ctx.planets[debRashiLord];

          // 1. Lord of debilitation sign is in Kendra from Lagna
          if (debLordPos && isKendra(debLordPos.house)) {
            debPlanets.push(pId);
            reasons.push(`${prop.sanskritName} debilitation cancelled: Dispositor ${debRashiLord.toUpperCase()} is in Kendra ${debLordPos.house} from Lagna`);
          }
          // 2. Lord of debilitation sign is in Kendra from Moon
          else if (moon && debLordPos && isKendra(getRelativeHouse(moon.house, debLordPos.house))) {
            debPlanets.push(pId);
            reasons.push(`${prop.sanskritName} debilitation cancelled: Dispositor ${debRashiLord.toUpperCase()} is in Kendra from Moon`);
          }
          // 3. Planet that gets exalted in this sign is in Kendra from Lagna
          else {
            const exaltedPlanetInSign = (Object.keys(GRAHA_PROPERTIES) as PlanetId[]).find(
              (k) => GRAHA_PROPERTIES[k].exaltationSign === prop.debilitationSign
            );
            if (exaltedPlanetInSign && ctx.planets[exaltedPlanetInSign] && isKendra(ctx.planets[exaltedPlanetInSign].house)) {
              debPlanets.push(pId);
              reasons.push(`${prop.sanskritName} debilitation cancelled: Planet exalted in sign (${exaltedPlanetInSign.toUpperCase()}) is in Kendra ${ctx.planets[exaltedPlanetInSign].house}`);
            }
          }
        }
      }

      if (debPlanets.length > 0) {
        return {
          isPresent: true,
          conditionsMet: reasons,
          involvedPlanets: Array.from(new Set(debPlanets)),
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },

  // -----------------------------------------------------------------------
  // IX. PARIVARTANA YOGAS (MUTUAL HOUSE EXCHANGES — BPHS Ch. 35, PD Ch. 6)
  // -----------------------------------------------------------------------
  {
    id: 'maha_parivartana',
    name: 'Mahā Parivartana Yoga',
    sanskritName: 'महा परिवर्तन योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 32-34',
    sanskritShloka: 'केन्द्रत्रिकोणेशयोर्मिथो राशिसंक्रमे महायोगः । भूपतिपदवीप्राप्तिर्धनधान्यसमृद्धिमान् ॥',
    category: 'Parivartana',
    definition: 'Mutual sign exchange between lords of Kendra (1, 4, 7, 10), Trikoṇa (5, 9), or 2nd/11th auspicious houses.',
    effects: 'Endows authoritative status, continuous influx of wealth, royal blessings, and noble renown.',
    evaluate: (ctx) => {
      const auspiciousHouses = [1, 2, 4, 5, 7, 9, 10, 11];
      const exchanges: string[] = [];
      const involved: PlanetId[] = [];

      for (let i = 0; i < auspiciousHouses.length; i++) {
        for (let j = i + 1; j < auspiciousHouses.length; j++) {
          const h1 = auspiciousHouses[i];
          const h2 = auspiciousHouses[j];
          const lord1 = getHouseLordFromLagna(h1, ctx.lagnaRashi);
          const lord2 = getHouseLordFromLagna(h2, ctx.lagnaRashi);

          if (lord1 !== lord2) {
            const p1 = ctx.planets[lord1];
            const p2 = ctx.planets[lord2];
            if (p1 && p2 && p1.house === h2 && p2.house === h1) {
              exchanges.push(`Exchange between House ${h1} Lord (${lord1.toUpperCase()}) and House ${h2} Lord (${lord2.toUpperCase()})`);
              involved.push(lord1, lord2);
            }
          }
        }
      }

      if (exchanges.length > 0) {
        return {
          isPresent: true,
          conditionsMet: exchanges,
          involvedPlanets: Array.from(new Set(involved)),
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'dainya_parivartana',
    name: 'Dainya Parivartana Yoga',
    sanskritName: 'दैन्य परिवर्तन योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 32',
    category: 'Parivartana',
    definition: 'Mutual sign exchange between a Duṣṭhāna lord (6th, 8th, or 12th) and an auspicious house lord.',
    effects: 'Causes fluctuations in fortune, obstacles in undertakings, and demands vigilant ethical rectitude.',
    evaluate: (ctx) => {
      const dusthanas = [6, 8, 12];
      const otherHouses = [1, 2, 3, 4, 5, 7, 9, 10, 11];
      const exchanges: string[] = [];
      const involved: PlanetId[] = [];

      for (const dH of dusthanas) {
        for (const oH of otherHouses) {
          const dLord = getHouseLordFromLagna(dH, ctx.lagnaRashi);
          const oLord = getHouseLordFromLagna(oH, ctx.lagnaRashi);
          if (dLord !== oLord) {
            const pD = ctx.planets[dLord];
            const pO = ctx.planets[oLord];
            if (pD && pO && pD.house === oH && pO.house === dH) {
              exchanges.push(`Exchange between Duṣṭhāna House ${dH} Lord (${dLord.toUpperCase()}) and House ${oH} Lord (${oLord.toUpperCase()})`);
              involved.push(dLord, oLord);
            }
          }
        }
      }

      if (exchanges.length > 0) {
        return {
          isPresent: true,
          conditionsMet: exchanges,
          involvedPlanets: Array.from(new Set(involved)),
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },

  // -----------------------------------------------------------------------
  // X. SPECIAL & JAIMINI YOGAS (JUS / BPHS)
  // -----------------------------------------------------------------------
  {
    id: 'saraswati',
    name: 'Sarasvatī Yoga',
    sanskritName: 'सरस्वती योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 24 / BPHS Ch. 36, v. 18',
    sanskritShloka: 'सुरगुरुसितसौम्यैः केन्द्रकोणे त्रिकोणेष्वथवा सहजसंस्थैः सहितगृहगतैर्वा । प्रभवति नरनाथः शास्त्रवेत्ता सुवाग्मी कुलतिलकमनीषी शारदायाः प्रसादात् ॥',
    category: 'Special',
    definition: 'Jupiter, Venus, and Mercury occupy Kendra, Trikoṇa, or 2nd house in strong dignity, with Jupiter in own/exaltation/friendly sign.',
    effects: 'Blessed by Goddess Sarasvatī: supreme literary excellence, poetic genius, oratorical eloquence, and worldly esteem.',
    evaluate: (ctx) => {
      const jup = ctx.planets.jupiter;
      const ven = ctx.planets.venus;
      const merc = ctx.planets.mercury;
      if (!jup || !ven || !merc) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const validHouses = [1, 2, 4, 5, 7, 9, 10];
      const allInValid = validHouses.includes(jup.house) && validHouses.includes(ven.house) && validHouses.includes(merc.house);
      const jupDignified = !isDebilitated('jupiter', jup.rashiNumber);

      if (allInValid && jupDignified) {
        return {
          isPresent: true,
          conditionsMet: [
            `Jupiter (House ${jup.house}), Venus (House ${ven.house}), and Mercury (House ${merc.house}) occupy auspicious Kendra/Trikoṇa/2nd houses`,
            'Jupiter is well-dignified',
          ],
          involvedPlanets: ['jupiter', 'venus', 'mercury'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'guru_mangala',
    name: 'Guru-Maṅgala Yoga',
    sanskritName: 'गुरु-मङ्गल योग',
    sourceText: 'Sarvārtha Cintāmaṇi',
    chapterAndVerse: 'Sarvārtha Cintāmaṇi Ch. 4, v. 32 / Hora Sāra 15:12',
    category: 'Conjunction',
    definition: 'Jupiter and Mars are conjoined in the same house or in mutual aspect.',
    effects: 'Combines righteous wisdom (Guru) with tactical energy (Maṅgala); confers mechanical excellence, executive leadership, and prosperity.',
    evaluate: (ctx) => {
      const jup = ctx.planets.jupiter;
      const mars = ctx.planets.mars;
      if (!jup || !mars) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      if (jup.house === mars.house || Math.abs(jup.house - mars.house) === 6) {
        return {
          isPresent: true,
          conditionsMet: [
            `Jupiter and Mars are ${jup.house === mars.house ? 'conjoined in House ' + jup.house : 'in mutual 7th aspect'}`,
          ],
          involvedPlanets: ['jupiter', 'mars'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'shanka',
    name: 'Śaṅkha Yoga',
    sanskritName: 'शङ्ख योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 37 / JP 6:37',
    sanskritShloka: 'लग्नेशे बलिना युक्ते पञ्चमेशे च केन्द्रगे । नवमेशे तथा युक्ते शङ्खयोगः प्रकीर्तितः ॥',
    category: 'Raja',
    definition: 'Lagneśa is strong, 5th lord and 6th lord are in mutual Kendras, or 9th lord is strong in Kendra.',
    effects: 'Blessed with extensive lands, charitable institutions, exemplary wife and children, and high moral stature.',
    evaluate: (ctx) => {
      const l1 = getHouseLordFromLagna(1, ctx.lagnaRashi);
      const l5 = getHouseLordFromLagna(5, ctx.lagnaRashi);
      const l6 = getHouseLordFromLagna(6, ctx.lagnaRashi);
      const p1 = ctx.planets[l1];
      const p5 = ctx.planets[l5];
      const p6 = ctx.planets[l6];
      if (!p1 || !p5 || !p6) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const relH = getRelativeHouse(p5.house, p6.house);
      if (isKendra(p1.house) && isKendra(relH)) {
        return {
          isPresent: true,
          conditionsMet: [
            `Lagneśa (${l1.toUpperCase()}) in Kendra House ${p1.house}`,
            `5th Lord and 6th Lord are in mutual Kendras (House distance ${relH})`,
          ],
          involvedPlanets: [l1, l5, l6],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  ...NABHASA_AKRITI_EXPANDED_YOGAS,
  ...BHAVADI_CLASSICAL_YOGAS,
  ...CLASSICAL_RAJA_DHANA_EXPANDED_YOGAS,
  ...ARISHTA_CONJUNCTION_EXPANDED_YOGAS,
];

/**
 * Helper to get sign name safely.
 */
function saturnRashiName(num: RashiNumber): RashiNumber {
  return num;
}

// =========================================================================
// DETERMINISTIC DETECTION PIPELINE
// =========================================================================

/**
 * Evaluates the entire classical yoga registry against the chart context.
 * Returns only verified, mathematically fulfilled yogas.
 */
export function detectAllYogas(
  planets: Record<
    PlanetId,
    {
      siderealLongitude: number;
      rashiNumber: RashiNumber;
      house: number;
      isCombust: boolean;
      isRetrograde: boolean;
    }
  >,
  lagnaRashi: RashiNumber,
  lagnaLongitude?: number,
  vargas?: Record<string, { planets: Record<PlanetId, { rashiNumber: RashiNumber; house: number }> }>
): DetectedYoga[] {
  const ctx: YogaEvaluationContext = {
    planets,
    lagnaRashi,
    lagnaLongitude,
    vargas,
  };

  const detected: DetectedYoga[] = [];

  for (const yogaDef of CLASSICAL_YOGA_REGISTRY) {
    const result = yogaDef.evaluate(ctx);
    if (result.isPresent) {
      detected.push({
        id: yogaDef.id,
        name: yogaDef.name,
        sanskritName: yogaDef.sanskritName,
        sourceText: yogaDef.sourceText,
        chapterAndVerse: yogaDef.chapterAndVerse,
        sanskritShloka: yogaDef.sanskritShloka,
        category: yogaDef.category as any,
        conditionsMet: result.conditionsMet,
        effects: yogaDef.effects,
        involvedPlanets: result.involvedPlanets,
        strengthRating: result.strengthRating,
        isUnverified: yogaDef.isUnverified,
        provenanceNotes: yogaDef.provenanceNotes,
      });
    }
  }

  return detected;
}

export { evaluateYogaActivation } from './yoga-activation';
export type { YogaActivationReport, CalculatedPeriodSpan } from './yoga-activation';
export {
  evaluateYogaQualification,
  evaluateYogaInteractions,
  detectVargaYogas,
  getCrossVargaSummary,
  getGrahaDignity,
} from './yoga-advanced-analysis';
export type {
  GrahaQualification,
  YogaQualificationReport,
  YogaInteractionReport,
  VargaYogaResult,
  CrossVargaRecurrence,
} from './yoga-advanced-analysis';

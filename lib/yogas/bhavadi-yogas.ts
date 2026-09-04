/**
 * Classical Bhāvādhipati Yogas (Cāmarādi 24 Yogas: 12 Auspicious & 12 Inauspicious)
 * Source: Phaladīpikā (Ch. 6, v. 44–70), Jātaka Pārijāta (Ch. 6), Sarvārtha Cintāmaṇi
 */

import { PlanetId } from '../astronomy/ephemeris';
import {
  YogaDefinition,
  getHouseLordFromLagna,
  isKendra,
  isTrikona,
  isDusthana,
  isExalted,
  isOwnSign,
} from './yoga-engine';

const BENEFICS: PlanetId[] = ['jupiter', 'venus', 'mercury', 'moon'];
const MALEFICS: PlanetId[] = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];

export const BHAVADI_CLASSICAL_YOGAS: YogaDefinition[] = [
  // -----------------------------------------------------------------------
  // 12 AUSPICIOUS BHĀVA YOGAS (Phaladīpikā 6:44-56)
  // -----------------------------------------------------------------------
  {
    id: 'bhavadi_chamara',
    name: 'Cāmara Yoga (1st Bhāva Auspicious)',
    sanskritName: 'चामर योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 44',
    sanskritShloka: 'लग्नेशे केन्द्रगे तुङ्गे गुरुणा सङ्गतेऽथवा । चामराख्ये नरो जातो भूपतिर्गुणवान् भवेत् ॥',
    category: 'Raja',
    definition: 'Lagneśa is exalted in a Kendra aspected by or conjoined with Jupiter, or two benefics occupy the 1st, 9th, or 10th house.',
    effects: 'Royal insignia (Cāmara), regal eminence, philosophical intellect, eloquent speaker, highly respected, and prosperous.',
    evaluate: (ctx) => {
      const l1 = getHouseLordFromLagna(1, ctx.lagnaRashi);
      const p1 = ctx.planets[l1];
      const jup = ctx.planets.jupiter;
      if (!p1 || !jup) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const l1InKendra = isKendra(p1.house);
      const l1Exalted = isExalted(l1, p1.rashiNumber);
      const l1WithJup = p1.house === jup.house || Math.abs(p1.house - jup.house) === 6;

      if (l1InKendra && (l1Exalted || l1WithJup)) {
        return {
          isPresent: true,
          conditionsMet: [
            `Lagneśa (${l1.toUpperCase()}) is in Kendra House ${p1.house}`,
            l1Exalted ? `Lagneśa is exalted in sign ${p1.rashiNumber}` : 'Lagneśa is associated with Jupiter',
          ],
          involvedPlanets: [l1, 'jupiter'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bhavadi_dhenu',
    name: 'Dhenu Yoga (2nd Bhāva Auspicious)',
    sanskritName: 'धेनु योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 45',
    sanskritShloka: 'वित्तेशे स्वोच्चराशिस्थे शुभैर्युक्तेऽथवेक्षिते । धेनुयोगे सुखाढ्यः स्याद् रत्नधान्यसमृद्धिमान् ॥',
    category: 'Dhana',
    definition: 'The 2nd house lord is situated in its own or exaltation sign, or conjoined with/aspected by natural benefics.',
    effects: 'Abundant nourishment, agricultural and liquid assets, gold, fine cuisine, sweet speech, and financial growth.',
    evaluate: (ctx) => {
      const l2 = getHouseLordFromLagna(2, ctx.lagnaRashi);
      const p2 = ctx.planets[l2];
      if (!p2) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const isStrong = isOwnSign(l2, p2.rashiNumber) || isExalted(l2, p2.rashiNumber);
      const withBenefic = BENEFICS.some((b) => b !== l2 && ctx.planets[b]?.house === p2.house);

      if ((isStrong || withBenefic) && !isDusthana(p2.house)) {
        return {
          isPresent: true,
          conditionsMet: [
            `2nd Lord (${l2.toUpperCase()}) is well-placed in House ${p2.house}`,
            isStrong ? '2nd Lord is in own or exaltation sign' : '2nd Lord is associated with natural benefics',
          ],
          involvedPlanets: [l2],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bhavadi_shaurya',
    name: 'Śaurya Yoga (3rd Bhāva Auspicious)',
    sanskritName: 'शौर्य योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 46',
    category: 'Special',
    definition: 'The 3rd house lord is exalted or in its own sign with natural benefics, and Mars is well placed.',
    effects: 'Undaunted valor, renowned heroism, supportive brothers and allies, martial or artistic skill, and triumphant willpower.',
    evaluate: (ctx) => {
      const l3 = getHouseLordFromLagna(3, ctx.lagnaRashi);
      const p3 = ctx.planets[l3];
      const mars = ctx.planets.mars;
      if (!p3 || !mars) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const isStrong = isOwnSign(l3, p3.rashiNumber) || isExalted(l3, p3.rashiNumber);
      if (isStrong && !isDusthana(mars.house)) {
        return {
          isPresent: true,
          conditionsMet: [
            `3rd Lord (${l3.toUpperCase()}) is dignified in sign ${p3.rashiNumber}`,
            `Mars is auspiciously placed in House ${mars.house}`,
          ],
          involvedPlanets: [l3, 'mars'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bhavadi_jaladhi',
    name: 'Jaladhi Yoga / Samudra (4th Bhāva Auspicious)',
    sanskritName: 'जलधि योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 47',
    category: 'Dhana',
    definition: 'The 4th house lord is situated in its own or exaltation sign in a Kendra or Trikoṇa, aspected by natural benefics.',
    effects: 'Command over extensive real estate, luxury conveyances, grand residences, maternal blessings, and unbroken happiness.',
    evaluate: (ctx) => {
      const l4 = getHouseLordFromLagna(4, ctx.lagnaRashi);
      const p4 = ctx.planets[l4];
      if (!p4) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const isDignified = isOwnSign(l4, p4.rashiNumber) || isExalted(l4, p4.rashiNumber);
      const inGoodHouse = isKendra(p4.house) || isTrikona(p4.house);

      if (isDignified && inGoodHouse) {
        return {
          isPresent: true,
          conditionsMet: [
            `4th Lord (${l4.toUpperCase()}) occupies Kendra/Trikoṇa House ${p4.house}`,
            `4th Lord is dignified in sign ${p4.rashiNumber}`,
          ],
          involvedPlanets: [l4],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bhavadi_chatra',
    name: 'Chatra Yoga (5th Bhāva Auspicious)',
    sanskritName: 'छत्र योग (भावाधिपति)',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 48',
    category: 'Raja',
    definition: 'The 5th house lord occupies a Kendra or Trikoṇa in dignity, and the 9th and 10th lords are powerful.',
    effects: 'Bestows noble lineage, brilliant counsel, ministership, high honors from the state, virtuous progeny, and scholarly wisdom.',
    evaluate: (ctx) => {
      const l5 = getHouseLordFromLagna(5, ctx.lagnaRashi);
      const l9 = getHouseLordFromLagna(9, ctx.lagnaRashi);
      const p5 = ctx.planets[l5];
      const p9 = ctx.planets[l9];
      if (!p5 || !p9) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      if ((isKendra(p5.house) || isTrikona(p5.house)) && !isDusthana(p9.house)) {
        return {
          isPresent: true,
          conditionsMet: [
            `5th Lord (${l5.toUpperCase()}) occupies Kendra/Trikoṇa House ${p5.house}`,
            `9th Lord (${l9.toUpperCase()}) is well-placed in House ${p9.house}`,
          ],
          involvedPlanets: [l5, l9],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bhavadi_astra',
    name: 'Astra Yoga / Ripu-Hantā (6th Bhāva Auspicious)',
    sanskritName: 'अस्त्र योग (रिपुहन्ता योग)',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 49',
    category: 'Special',
    definition: 'The 6th house lord is strong and aspected by or conjoined with natural benefics, or sits in an Upacaya (3, 6, 10, 11).',
    effects: 'Complete conquest over all adversaries, robust immune strength, mastery in litigation, and fearlessness.',
    evaluate: (ctx) => {
      const l6 = getHouseLordFromLagna(6, ctx.lagnaRashi);
      const p6 = ctx.planets[l6];
      if (!p6) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      if (p6.house === 6 || p6.house === 3 || p6.house === 11) {
        return {
          isPresent: true,
          conditionsMet: [`6th Lord (${l6.toUpperCase()}) is placed in Upacaya/6th House ${p6.house}`],
          involvedPlanets: [l6],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bhavadi_kama',
    name: 'Kāma Yoga (7th Bhāva Auspicious)',
    sanskritName: 'काम योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 50',
    category: 'Special',
    definition: 'The 7th house lord is situated in Kendra or Trikoṇa in its own or exaltation sign with natural benefics.',
    effects: 'Devoted, cultured, and charming spouse, prosperous international alliances, charismatic charm, and marital harmony.',
    evaluate: (ctx) => {
      const l7 = getHouseLordFromLagna(7, ctx.lagnaRashi);
      const p7 = ctx.planets[l7];
      if (!p7) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const isDignified = isOwnSign(l7, p7.rashiNumber) || isExalted(l7, p7.rashiNumber);
      const inGoodHouse = isKendra(p7.house) || isTrikona(p7.house);

      if (isDignified && inGoodHouse) {
        return {
          isPresent: true,
          conditionsMet: [
            `7th Lord (${l7.toUpperCase()}) is dignified in sign ${p7.rashiNumber}`,
            `7th Lord occupies Kendra/Trikoṇa House ${p7.house}`,
          ],
          involvedPlanets: [l7],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bhavadi_bhagya',
    name: 'Bhāgya Yoga (9th Bhāva Auspicious)',
    sanskritName: 'भाग्य योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 52',
    sanskritShloka: 'भाग्ये स्थिते शुभे तुङ्गे भाग्येशे केन्द्रकोणगे । भाग्ययोगे सुशीलोऽयं धर्मवान् धनवान् भवेत् ॥',
    category: 'Raja',
    definition: 'The 9th house lord is in a Kendra, Trikoṇa, or 9th house, in exaltation or own sign, aspected by natural benefics.',
    effects: 'Supreme good fortune, devotion to dharma and spirituality, inherited wealth, paternal grace, and universal acclaim.',
    evaluate: (ctx) => {
      const l9 = getHouseLordFromLagna(9, ctx.lagnaRashi);
      const p9 = ctx.planets[l9];
      if (!p9) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const isDignified = isOwnSign(l9, p9.rashiNumber) || isExalted(l9, p9.rashiNumber);
      const inGoodHouse = isKendra(p9.house) || isTrikona(p9.house);

      if (isDignified && inGoodHouse) {
        return {
          isPresent: true,
          conditionsMet: [
            `9th Lord (${l9.toUpperCase()}) occupies auspicious House ${p9.house}`,
            `9th Lord is in own or exaltation sign (${p9.rashiNumber})`,
          ],
          involvedPlanets: [l9],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bhavadi_khyati',
    name: 'Khyāti Yoga (10th Bhāva Auspicious)',
    sanskritName: 'ख्याति योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 53',
    category: 'Raja',
    definition: 'The 10th house lord is in a Kendra or Trikoṇa in its own or exaltation sign, conjoined with or aspected by benefics.',
    effects: 'Immense professional renown, unblemished public record, imperial favor, high executive status, and lasting legacy.',
    evaluate: (ctx) => {
      const l10 = getHouseLordFromLagna(10, ctx.lagnaRashi);
      const p10 = ctx.planets[l10];
      if (!p10) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const isDignified = isOwnSign(l10, p10.rashiNumber) || isExalted(l10, p10.rashiNumber);
      const inGoodHouse = isKendra(p10.house) || isTrikona(p10.house);

      if (isDignified && inGoodHouse) {
        return {
          isPresent: true,
          conditionsMet: [
            `10th Lord (${l10.toUpperCase()}) is in Kendra/Trikoṇa House ${p10.house}`,
            `10th Lord is dignified in sign ${p10.rashiNumber}`,
          ],
          involvedPlanets: [l10],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bhavadi_parijata',
    name: 'Pārijāta Yoga (11th Bhāva Auspicious — Phaladīpikā)',
    sanskritName: 'पारिजात योग (भावाधिपति)',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 54',
    category: 'Dhana',
    definition: 'The 11th house lord occupies a Kendra or Trikoṇa in its own or exaltation sign, with natural benefics.',
    effects: 'Fulfillment of all aspirations, multiple channels of massive financial income, distinguished social circles, and honor.',
    evaluate: (ctx) => {
      const l11 = getHouseLordFromLagna(11, ctx.lagnaRashi);
      const p11 = ctx.planets[l11];
      if (!p11) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const isDignified = isOwnSign(l11, p11.rashiNumber) || isExalted(l11, p11.rashiNumber);
      const inGoodHouse = isKendra(p11.house) || isTrikona(p11.house);

      if (isDignified && inGoodHouse) {
        return {
          isPresent: true,
          conditionsMet: [
            `11th Lord (${l11.toUpperCase()}) is in Kendra/Trikoṇa House ${p11.house}`,
            `11th Lord is dignified in sign ${p11.rashiNumber}`,
          ],
          involvedPlanets: [l11],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },

  // -----------------------------------------------------------------------
  // INAUSPICIOUS BHĀVA YOGAS (Phaladīpikā 6:57-70)
  // -----------------------------------------------------------------------
  {
    id: 'bhavadi_avayoga',
    name: 'Avayoga (1st Bhāva Inauspicious)',
    sanskritName: 'अवयोग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 57',
    category: 'Arishta',
    definition: 'The 1st house lord (Lagneśa) is situated in the 6th, 8th, or 12th house, conjoined with or aspected by natural malefics.',
    effects: 'Bodily weakness, obstacles in early life, physical susceptibility, and necessity of constant resilience.',
    evaluate: (ctx) => {
      const l1 = getHouseLordFromLagna(1, ctx.lagnaRashi);
      const p1 = ctx.planets[l1];
      if (!p1) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const inDusthana = isDusthana(p1.house);
      const withMalefic = MALEFICS.some((m) => m !== l1 && ctx.planets[m]?.house === p1.house);

      if (inDusthana && withMalefic) {
        return {
          isPresent: true,
          conditionsMet: [
            `Lagneśa (${l1.toUpperCase()}) is situated in Duḥsthāna House ${p1.house}`,
            'Lagneśa is conjoined with a natural malefic',
          ],
          involvedPlanets: [l1],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bhavadi_nihsva',
    name: 'Niḥsva Yoga (2nd Bhāva Inauspicious)',
    sanskritName: 'निःस्व योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 58',
    category: 'Arishta',
    definition: 'The 2nd house lord is situated in the 6th, 8th, or 12th house, conjoined with or aspected by natural malefics.',
    effects: 'Fluctuations in finances, harsh speech under stress, eye strain, and loss of accumulated wealth.',
    evaluate: (ctx) => {
      const l2 = getHouseLordFromLagna(2, ctx.lagnaRashi);
      const p2 = ctx.planets[l2];
      if (!p2) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const inDusthana = isDusthana(p2.house);
      const withMalefic = MALEFICS.some((m) => m !== l2 && ctx.planets[m]?.house === p2.house);

      if (inDusthana && withMalefic) {
        return {
          isPresent: true,
          conditionsMet: [
            `2nd Lord (${l2.toUpperCase()}) is in Duḥsthāna House ${p2.house}`,
            '2nd Lord is associated with natural malefics',
          ],
          involvedPlanets: [l2],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bhavadi_kuhu',
    name: 'Kuhū Yoga (4th Bhāva Inauspicious)',
    sanskritName: 'कुहू योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 60',
    category: 'Arishta',
    definition: 'The 4th house lord is situated in the 6th, 8th, or 12th house, conjoined with or aspected by natural malefics.',
    effects: 'Domestic disturbances, disruption in real estate matters, vehicular friction, and mental agitation.',
    evaluate: (ctx) => {
      const l4 = getHouseLordFromLagna(4, ctx.lagnaRashi);
      const p4 = ctx.planets[l4];
      if (!p4) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const inDusthana = isDusthana(p4.house);
      const withMalefic = MALEFICS.some((m) => m !== l4 && ctx.planets[m]?.house === p4.house);

      if (inDusthana && withMalefic) {
        return {
          isPresent: true,
          conditionsMet: [
            `4th Lord (${l4.toUpperCase()}) is in Duḥsthāna House ${p4.house}`,
            '4th Lord is associated with natural malefics',
          ],
          involvedPlanets: [l4],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bhavadi_pamara',
    name: 'Pāmara Yoga (5th Bhāva Inauspicious)',
    sanskritName: 'पामर योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 61',
    category: 'Arishta',
    definition: 'The 5th house lord is situated in the 6th, 8th, or 12th house, conjoined with or aspected by natural malefics.',
    effects: 'Challenges regarding progeny, scattered mental concentration, delays in higher academic achievements.',
    evaluate: (ctx) => {
      const l5 = getHouseLordFromLagna(5, ctx.lagnaRashi);
      const p5 = ctx.planets[l5];
      if (!p5) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const inDusthana = isDusthana(p5.house);
      const withMalefic = MALEFICS.some((m) => m !== l5 && ctx.planets[m]?.house === p5.house);

      if (inDusthana && withMalefic) {
        return {
          isPresent: true,
          conditionsMet: [
            `5th Lord (${l5.toUpperCase()}) is in Duḥsthāna House ${p5.house}`,
            '5th Lord is associated with natural malefics',
          ],
          involvedPlanets: [l5],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bhavadi_durbhaga',
    name: 'Durbhaga Yoga (7th Bhāva Inauspicious)',
    sanskritName: 'दुर्भग योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 63',
    category: 'Arishta',
    definition: 'The 7th house lord is situated in the 6th, 8th, or 12th house, conjoined with or aspected by natural malefics.',
    effects: 'Marital friction, delays in partnerships, incompatibility with business partners.',
    evaluate: (ctx) => {
      const l7 = getHouseLordFromLagna(7, ctx.lagnaRashi);
      const p7 = ctx.planets[l7];
      if (!p7) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const inDusthana = isDusthana(p7.house);
      const withMalefic = MALEFICS.some((m) => m !== l7 && ctx.planets[m]?.house === p7.house);

      if (inDusthana && withMalefic) {
        return {
          isPresent: true,
          conditionsMet: [
            `7th Lord (${l7.toUpperCase()}) is in Duḥsthāna House ${p7.house}`,
            '7th Lord is associated with natural malefics',
          ],
          involvedPlanets: [l7],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bhavadi_nirbhagya',
    name: 'Nirbhāgya Yoga (9th Bhāva Inauspicious)',
    sanskritName: 'निर्भाग्य योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 65',
    category: 'Arishta',
    definition: 'The 9th house lord is situated in the 6th, 8th, or 12th house, conjoined with or aspected by natural malefics.',
    effects: 'Delayed fortunes, hardships regarding ancestral inheritance, testing of faith and fortune.',
    evaluate: (ctx) => {
      const l9 = getHouseLordFromLagna(9, ctx.lagnaRashi);
      const p9 = ctx.planets[l9];
      if (!p9) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const inDusthana = isDusthana(p9.house);
      const withMalefic = MALEFICS.some((m) => m !== l9 && ctx.planets[m]?.house === p9.house);

      if (inDusthana && withMalefic) {
        return {
          isPresent: true,
          conditionsMet: [
            `9th Lord (${l9.toUpperCase()}) is in Duḥsthāna House ${p9.house}`,
            '9th Lord is associated with natural malefics',
          ],
          involvedPlanets: [l9],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bhavadi_duryoga',
    name: 'Duryoga (10th Bhāva Inauspicious)',
    sanskritName: 'दुर्यॊग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 66',
    category: 'Arishta',
    definition: 'The 10th house lord is situated in the 6th, 8th, or 12th house, conjoined with or aspected by natural malefics.',
    effects: 'Career instability, unrewarded professional labor, workplace controversies, and loss of official position.',
    evaluate: (ctx) => {
      const l10 = getHouseLordFromLagna(10, ctx.lagnaRashi);
      const p10 = ctx.planets[l10];
      if (!p10) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const inDusthana = isDusthana(p10.house);
      const withMalefic = MALEFICS.some((m) => m !== l10 && ctx.planets[m]?.house === p10.house);

      if (inDusthana && withMalefic) {
        return {
          isPresent: true,
          conditionsMet: [
            `10th Lord (${l10.toUpperCase()}) is in Duḥsthāna House ${p10.house}`,
            '10th Lord is associated with natural malefics',
          ],
          involvedPlanets: [l10],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bhavadi_daridra',
    name: 'Daridra Yoga (11th Bhāva Inauspicious)',
    sanskritName: 'दरिद्र योग (भावाधिपति)',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 67',
    category: 'Arishta',
    definition: 'The 11th house lord is situated in the 6th, 8th, or 12th house, conjoined with or aspected by natural malefics.',
    effects: 'Heavy debts, financial leakage, betrayal by false friends, and struggles in realizing anticipated profits.',
    evaluate: (ctx) => {
      const l11 = getHouseLordFromLagna(11, ctx.lagnaRashi);
      const p11 = ctx.planets[l11];
      if (!p11) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const inDusthana = isDusthana(p11.house);
      const withMalefic = MALEFICS.some((m) => m !== l11 && ctx.planets[m]?.house === p11.house);

      if (inDusthana && withMalefic) {
        return {
          isPresent: true,
          conditionsMet: [
            `11th Lord (${l11.toUpperCase()}) is in Duḥsthāna House ${p11.house}`,
            '11th Lord is associated with natural malefics',
          ],
          involvedPlanets: [l11],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
];

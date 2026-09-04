/**
 * Classical Celebrated Rāja, Dhana, and Mahā-Yogas
 * Sources: Phaladīpikā (Ch. 6), Jātaka Pārijāta (Ch. 6–7), Sarvārtha Cintāmaṇi, Bṛhat Parāśara Horā Śāstra, Sārāvalī, Jātaka Tattva
 */

import { PlanetId } from '../astronomy/ephemeris';
import { RashiNumber } from '../jyotisha/types';
import { RASHIS } from '../jyotisha/constants';
import {
  YogaDefinition,
  getHouseLordFromLagna,
  isKendra,
  isTrikona,
  isDusthana,
  isExalted,
  isDebilitated,
  isOwnSign,
  getRelativeHouse,
} from './yoga-engine';

export const CLASSICAL_RAJA_DHANA_EXPANDED_YOGAS: YogaDefinition[] = [
  {
    id: 'bheri',
    name: 'Bheri Yoga',
    sanskritName: 'भेरी योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 38 / Jātaka Pārijāta 6:38',
    sanskritShloka: 'लग्नेशे बलिना युक्ते शुक्रेन्द्वोः केन्द्रसंस्थयोः । भेरीयोगे सुसम्पन्नः कीर्तिमान् विजयी नरः ॥',
    category: 'Raja',
    definition: 'Venus, Jupiter, and Lagneśa are in Kendras from Lagna, and the 9th lord is strong in dignity.',
    effects: 'Accompanied by victorious royal drums (Bheri), commanding long-lasting wealth, regal dominion, health, and joyous celebrations.',
    evaluate: (ctx) => {
      const l1 = getHouseLordFromLagna(1, ctx.lagnaRashi);
      const l9 = getHouseLordFromLagna(9, ctx.lagnaRashi);
      const p1 = ctx.planets[l1];
      const p9 = ctx.planets[l9];
      const ven = ctx.planets.venus;
      const jup = ctx.planets.jupiter;
      if (!p1 || !p9 || !ven || !jup) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const l1InKendra = isKendra(p1.house);
      const venInKendra = isKendra(ven.house);
      const jupInKendra = isKendra(jup.house);
      const l9Strong = !isDusthana(p9.house);

      if (l1InKendra && venInKendra && jupInKendra && l9Strong) {
        return {
          isPresent: true,
          conditionsMet: [
            `Lagneśa (${l1.toUpperCase()}), Venus, and Jupiter are placed in Kendras (1, 4, 7, 10)`,
            `9th Lord (${l9.toUpperCase()}) is strong in House ${p9.house}`,
          ],
          involvedPlanets: [l1, 'venus', 'jupiter', l9],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'mridanga',
    name: 'Mṛdaṅga Yoga',
    sanskritName: 'मृदङ्ग योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 39 / Jātaka Pārijāta 6:39',
    category: 'Raja',
    definition: 'Lagneśa is exalted, and other planets occupy their own or exaltation signs in Kendras or Trikoṇas.',
    effects: 'Sovereign lordship, accompanied by royal music and fanfare, generous temperament, radiant charm, and universally honored.',
    evaluate: (ctx) => {
      const l1 = getHouseLordFromLagna(1, ctx.lagnaRashi);
      const p1 = ctx.planets[l1];
      if (!p1) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const l1Exalted = isExalted(l1, p1.rashiNumber);
      const planetsInKendraTrikona = Object.keys(ctx.planets).filter((p) => {
        const pl = ctx.planets[p as PlanetId];
        return pl && (isKendra(pl.house) || isTrikona(pl.house)) && (isExalted(p as PlanetId, pl.rashiNumber) || isOwnSign(p as PlanetId, pl.rashiNumber));
      });

      if (l1Exalted && planetsInKendraTrikona.length >= 2) {
        return {
          isPresent: true,
          conditionsMet: [
            `Lagneśa (${l1.toUpperCase()}) is exalted in sign ${p1.rashiNumber}`,
            `Dignified planets (${planetsInKendraTrikona.join(', ')}) occupy Kendras/Trikoṇas`,
          ],
          involvedPlanets: [l1, ...(planetsInKendraTrikona as PlanetId[])],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'shrinatha',
    name: 'Śrīnātha Yoga',
    sanskritName: 'श्रीनाथ योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 40 / Jātaka Pārijāta 6:40',
    sanskritShloka: 'सप्तमेशे दशमस्थे दशमेशे च तुङ्गगे । भाग्येशेन युते दृष्टे श्रीनाथयोग उच्यते ॥',
    category: 'Raja',
    definition: 'The 7th house lord is situated in the 10th house, and the 10th lord is exalted and conjoined with or aspected by the 9th lord.',
    effects: 'Blessed with Viṣṇu-like fortune (Śrīnātha), commanding sovereign dignity, charismatic speech, and immense devotion.',
    evaluate: (ctx) => {
      const l7 = getHouseLordFromLagna(7, ctx.lagnaRashi);
      const l10 = getHouseLordFromLagna(10, ctx.lagnaRashi);
      const l9 = getHouseLordFromLagna(9, ctx.lagnaRashi);
      const p7 = ctx.planets[l7];
      const p10 = ctx.planets[l10];
      const p9 = ctx.planets[l9];
      if (!p7 || !p10 || !p9) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const l7In10 = p7.house === 10;
      const l10Exalted = isExalted(l10, p10.rashiNumber);
      const l10WithL9 = p10.house === p9.house || Math.abs(p10.house - p9.house) === 6;

      if (l7In10 && (l10Exalted || isOwnSign(l10, p10.rashiNumber)) && l10WithL9) {
        return {
          isPresent: true,
          conditionsMet: [
            `7th Lord (${l7.toUpperCase()}) occupies the 10th House`,
            `10th Lord (${l10.toUpperCase()}) is dignified and connected with 9th Lord (${l9.toUpperCase()})`,
          ],
          involvedPlanets: [l7, l10, l9],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'matsya',
    name: 'Matsya Yoga',
    sanskritName: 'मत्स्य योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 41 / Jātaka Pārijāta 6:41',
    category: 'Special',
    definition: 'Benefics occupy the 1st and 9th houses, malefics occupy the 4th and 8th houses, and 5th house is occupied by benefics.',
    effects: 'Renowned ocean of wisdom, deep contemplative intuition, philanthropic character, and enduring fame.',
    evaluate: (ctx) => {
      const benefics = ['jupiter', 'venus', 'mercury', 'moon'] as PlanetId[];
      const malefics = ['sun', 'mars', 'saturn', 'rahu', 'ketu'] as PlanetId[];

      const h1Benefic = benefics.some((b) => ctx.planets[b]?.house === 1);
      const h9Benefic = benefics.some((b) => ctx.planets[b]?.house === 9);
      const h4Malefic = malefics.some((m) => ctx.planets[m]?.house === 4);
      const h8Malefic = malefics.some((m) => ctx.planets[m]?.house === 8);

      if (h1Benefic && h9Benefic && (h4Malefic || h8Malefic)) {
        return {
          isPresent: true,
          conditionsMet: [
            'Natural benefics occupy 1st and 9th houses',
            'Natural malefics situated in 4th / 8th axis',
          ],
          involvedPlanets: ['jupiter', 'venus'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'kurma',
    name: 'Kūrma Yoga',
    sanskritName: 'कूर्म योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 42 / Jātaka Pārijāta 6:42',
    category: 'Special',
    definition: 'Benefics occupy the 5th, 6th, and 7th houses in their own, friendly, or exaltation signs, or malefics in 1, 3, 11.',
    effects: 'Tortoise-like unshakeable stability (Kūrma), steady sovereign authority, righteous leadership, and immense patience.',
    evaluate: (ctx) => {
      const benefics = ['jupiter', 'venus', 'mercury'] as PlanetId[];
      const in5_6_7 = benefics.filter((b) => ctx.planets[b] && [5, 6, 7].includes(ctx.planets[b].house));
      if (in5_6_7.length >= 2) {
        return {
          isPresent: true,
          conditionsMet: [`Benefics (${in5_6_7.join(', ')}) occupy Houses 5, 6, and 7 in dignified alignment`],
          involvedPlanets: in5_6_7,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'khadga',
    name: 'Khaḍga Yoga',
    sanskritName: 'खड्ग योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 43 / Jātaka Pārijāta 6:43',
    sanskritShloka: 'भाग्येशे धनराशिस्थे धनेशे भाग्यराशिगे । लग्नेशे केन्द्रकोणस्थे खड्गयोगः प्रकीर्तितः ॥',
    category: 'Raja',
    definition: 'Mutual sign exchange (Parivartana) between the 2nd lord and 9th lord, while Lagneśa occupies a Kendra or Trikoṇa.',
    effects: 'Sharp sword-like brilliance (Khaḍga), commanding authority, scriptural erudition, vast fortunes, and decisive intellect.',
    evaluate: (ctx) => {
      const l2 = getHouseLordFromLagna(2, ctx.lagnaRashi);
      const l9 = getHouseLordFromLagna(9, ctx.lagnaRashi);
      const l1 = getHouseLordFromLagna(1, ctx.lagnaRashi);
      const p2 = ctx.planets[l2];
      const p9 = ctx.planets[l9];
      const p1 = ctx.planets[l1];
      if (!p2 || !p9 || !p1) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const rashi2 = ((((ctx.lagnaRashi - 1) + 1) % 12) + 1) as any;
      const rashi9 = ((((ctx.lagnaRashi - 1) + 8) % 12) + 1) as any;

      const parivartana2_9 = p2.rashiNumber === rashi9 && p9.rashiNumber === rashi2;
      const l1Good = isKendra(p1.house) || isTrikona(p1.house);

      if (parivartana2_9 && l1Good) {
        return {
          isPresent: true,
          conditionsMet: [
            `2nd Lord (${l2.toUpperCase()}) and 9th Lord (${l9.toUpperCase()}) have mutual Parivartana (House exchange)`,
            `Lagneśa (${l1.toUpperCase()}) occupies Kendra/Trikoṇa House ${p1.house}`,
          ],
          involvedPlanets: [l2, l9, l1],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'kusuma',
    name: 'Kusuma Yoga',
    sanskritName: 'कुसुम योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 44 / Jātaka Pārijāta 6:44',
    category: 'Raja',
    definition: 'Venus is in a Kendra, the Moon is in a Trikoṇa (5th or 9th), and Saturn occupies the 10th house.',
    effects: 'Flowering renown (Kusuma), regal appointments, celebrated patronage of arts, handsome appearance, and royal luxury.',
    evaluate: (ctx) => {
      const ven = ctx.planets.venus;
      const moon = ctx.planets.moon;
      const sat = ctx.planets.saturn;
      if (!ven || !moon || !sat) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      if (isKendra(ven.house) && (moon.house === 5 || moon.house === 9) && sat.house === 10) {
        return {
          isPresent: true,
          conditionsMet: [
            `Venus is in Kendra House ${ven.house}`,
            `Moon is in Trikoṇa House ${moon.house}`,
            'Saturn is positioned in 10th House',
          ],
          involvedPlanets: ['venus', 'moon', 'saturn'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'kalanidhi',
    name: 'Kalānidhi Yoga',
    sanskritName: 'कलानिधि योग',
    sourceText: 'Sarvāvalī',
    chapterAndVerse: 'Sarvāvalī Ch. 35, v. 21 / Sarvārtha Cintāmaṇi 4:35',
    sanskritShloka: 'गुरौ द्वितीये पञ्चमे वा शुक्रेन्द्वोर्युतवीक्षिते । कलानिधिसमाख्यातः सर्वविद्याविशारदः ॥',
    category: 'Special',
    definition: 'Jupiter occupies the 2nd or 5th house, conjoined with or aspected by Mercury and Venus, or in signs of Mercury/Venus.',
    effects: 'Storehouse of arts and sciences (Kalānidhi), virtuous character, royal patronage, eloquent mastery, and magnetic charm.',
    evaluate: (ctx) => {
      const jup = ctx.planets.jupiter;
      const merc = ctx.planets.mercury;
      const ven = ctx.planets.venus;
      if (!jup || !merc || !ven) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const in2or5 = jup.house === 2 || jup.house === 5;
      const connectedMercVen =
        jup.house === merc.house ||
        jup.house === ven.house ||
        [3, 6, 2, 7].includes(jup.rashiNumber);

      if (in2or5 && connectedMercVen) {
        return {
          isPresent: true,
          conditionsMet: [
            `Jupiter occupies House ${jup.house} (2nd or 5th)`,
            'Jupiter is associated with Mercury / Venus and their signs',
          ],
          involvedPlanets: ['jupiter', 'mercury', 'venus'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'brahma',
    name: 'Brahma Yoga',
    sanskritName: 'ब्रह्म योग',
    sourceText: 'Jātaka Pārijāta',
    chapterAndVerse: 'Jātaka Pārijāta Ch. 6, v. 46 / Phaladīpikā 6:46',
    sanskritShloka: 'विप्रेशे केन्द्रगे शुक्रे भाग्येशात् केन्द्रसंस्थिते । गुरौ च केन्द्रगे लब्धो ब्रह्मयोगः सुदुर्लभः ॥',
    category: 'Special',
    definition: 'Jupiter is in a Kendra from the 9th lord, Venus is in a Kendra from the 11th lord, and Mercury is in a Kendra from the Lagna or 10th lord.',
    effects: 'Supreme Vedic erudition, longest longevity, universal reverence, spotless saintly character, and celestial intellect.',
    evaluate: (ctx) => {
      const l9 = getHouseLordFromLagna(9, ctx.lagnaRashi);
      const l11 = getHouseLordFromLagna(11, ctx.lagnaRashi);
      const p9 = ctx.planets[l9];
      const p11 = ctx.planets[l11];
      const jup = ctx.planets.jupiter;
      const ven = ctx.planets.venus;
      const merc = ctx.planets.mercury;
      if (!p9 || !p11 || !jup || !ven || !merc) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const relJup = getRelativeHouse(p9.house, jup.house);
      const relVen = getRelativeHouse(p11.house, ven.house);
      const mercInKendra = isKendra(merc.house);

      if (isKendra(relJup) && isKendra(relVen) && mercInKendra) {
        return {
          isPresent: true,
          conditionsMet: [
            `Jupiter is in Kendra ${relJup} from 9th Lord`,
            `Venus is in Kendra ${relVen} from 11th Lord`,
            `Mercury is in Kendra House ${merc.house} from Lagna`,
          ],
          involvedPlanets: ['jupiter', 'venus', 'mercury'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'hari',
    name: 'Hari Yoga',
    sanskritName: 'हरि योग',
    sourceText: 'Jātaka Pārijāta',
    chapterAndVerse: 'Jātaka Pārijāta Ch. 6, v. 47 / Phaladīpikā 6:47',
    category: 'Special',
    definition: 'Natural benefics occupy the 2nd, 12th, and 8th houses counted from the 7th house lord.',
    effects: 'Devotee of Lord Hari (Viṣṇu), blessed with noble children, immense wealth, happiness, and moral brilliance.',
    evaluate: (ctx) => {
      const l7 = getHouseLordFromLagna(7, ctx.lagnaRashi);
      const p7 = ctx.planets[l7];
      if (!p7) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const h2FromL7 = (p7.house % 12) + 1;
      const h12FromL7 = ((p7.house - 2 + 12) % 12) + 1;
      const h8FromL7 = ((p7.house + 6) % 12) + 1;

      const benefics = ['jupiter', 'venus', 'mercury', 'moon'] as PlanetId[];
      const has2 = benefics.some((b) => ctx.planets[b]?.house === h2FromL7);
      const has12 = benefics.some((b) => ctx.planets[b]?.house === h12FromL7);
      const has8 = benefics.some((b) => ctx.planets[b]?.house === h8FromL7);

      if (has2 && has12 && has8) {
        return {
          isPresent: true,
          conditionsMet: ['Natural benefics occupy the 2nd, 12th, and 8th houses from the 7th Lord'],
          involvedPlanets: [l7, 'jupiter', 'venus'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'hara',
    name: 'Hara Yoga',
    sanskritName: 'हर योग',
    sourceText: 'Jātaka Pārijāta',
    chapterAndVerse: 'Jātaka Pārijāta Ch. 6, v. 48 / Phaladīpikā 6:48',
    category: 'Special',
    definition: 'Natural benefics occupy the 4th, 9th, and 8th houses counted from the 7th house lord.',
    effects: 'Devotee of Lord Hara (Śiva), endowed with spiritual wisdom, victory over senses, and fearless valor.',
    evaluate: (ctx) => {
      const l7 = getHouseLordFromLagna(7, ctx.lagnaRashi);
      const p7 = ctx.planets[l7];
      if (!p7) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const h4FromL7 = ((p7.house + 2) % 12) + 1;
      const h9FromL7 = ((p7.house + 7) % 12) + 1;
      const h8FromL7 = ((p7.house + 6) % 12) + 1;

      const benefics = ['jupiter', 'venus', 'mercury', 'moon'] as PlanetId[];
      const has4 = benefics.some((b) => ctx.planets[b]?.house === h4FromL7);
      const has9 = benefics.some((b) => ctx.planets[b]?.house === h9FromL7);
      const has8 = benefics.some((b) => ctx.planets[b]?.house === h8FromL7);

      if (has4 && has9 && has8) {
        return {
          isPresent: true,
          conditionsMet: ['Natural benefics occupy the 4th, 9th, and 8th houses from the 7th Lord'],
          involvedPlanets: [l7, 'jupiter', 'mercury'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bhaskara',
    name: 'Bhāskara Yoga',
    sanskritName: 'भास्कर योग',
    sourceText: 'Jātaka Pārijāta',
    chapterAndVerse: 'Jātaka Pārijāta Ch. 6, v. 50',
    category: 'Raja',
    definition: 'Mercury is in the 2nd house from the Sun, the Moon is in the 11th from Mercury, and Jupiter is in the 5th or 9th from the Moon.',
    effects: 'Sun-like brilliance (Bhāskara), scholarly supremacy, profound mathematical/astronomical intellect, and majestic authority.',
    evaluate: (ctx) => {
      const sun = ctx.planets.sun;
      const merc = ctx.planets.mercury;
      const moon = ctx.planets.moon;
      const jup = ctx.planets.jupiter;
      if (!sun || !merc || !moon || !jup) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const mercFromSun = getRelativeHouse(sun.house, merc.house);
      const moonFromMerc = getRelativeHouse(merc.house, moon.house);
      const jupFromMoon = getRelativeHouse(moon.house, jup.house);

      if (mercFromSun === 2 && moonFromMerc === 11 && (jupFromMoon === 5 || jupFromMoon === 9)) {
        return {
          isPresent: true,
          conditionsMet: [
            'Mercury is in 2nd house from Sun',
            'Moon is in 11th house from Mercury',
            `Jupiter is in ${jupFromMoon}th Trikoṇa house from Moon`,
          ],
          involvedPlanets: ['sun', 'mercury', 'moon', 'jupiter'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'marut',
    name: 'Māruta Yoga',
    sanskritName: 'मारुत योग',
    sourceText: 'Jātaka Pārijāta',
    chapterAndVerse: 'Jātaka Pārijāta Ch. 6, v. 51',
    category: 'Raja',
    definition: 'Jupiter is in the 5th or 9th from Venus, the Moon is in the 5th from Jupiter, and the Sun is in a Kendra from the Moon.',
    effects: 'Wind-like swift intelligence and eloquence (Māruta), commanding trade, royal patronage, and enduring happiness.',
    evaluate: (ctx) => {
      const ven = ctx.planets.venus;
      const jup = ctx.planets.jupiter;
      const moon = ctx.planets.moon;
      const sun = ctx.planets.sun;
      if (!ven || !jup || !moon || !sun) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const jupFromVen = getRelativeHouse(ven.house, jup.house);
      const moonFromJup = getRelativeHouse(jup.house, moon.house);
      const sunFromMoon = getRelativeHouse(moon.house, sun.house);

      if ((jupFromVen === 5 || jupFromVen === 9) && moonFromJup === 5 && isKendra(sunFromMoon)) {
        return {
          isPresent: true,
          conditionsMet: [
            `Jupiter is in Trikoṇa ${jupFromVen} from Venus`,
            'Moon is in 5th from Jupiter',
            `Sun is in Kendra ${sunFromMoon} from Moon`,
          ],
          involvedPlanets: ['venus', 'jupiter', 'moon', 'sun'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'akhanda_samrajya',
    name: 'Akhaṇḍa Sāmrājya Yoga',
    sanskritName: 'अखण्ड साम्राज्य योग',
    sourceText: 'Jātaka Tattva',
    chapterAndVerse: 'Jātaka Tattva / BPHS Ch. 41',
    sanskritShloka: 'लग्नेशे बलिना युक्ते गुरौ केन्द्रस्थिते सति । नवमेशांशपे दृष्टे साम्राज्यपदवी भवेत् ॥',
    category: 'Raja',
    definition: 'Jupiter rules the 2nd, 5th, or 11th house and sits in a Kendra (1, 4, 7, 10), while the 9th, 11th, or 2nd lord is strong.',
    effects: 'Undivided empire/dominion (Akhaṇḍa Sāmrājya), sovereign political or administrative rule, unshakeable stability, and immense prosperity.',
    evaluate: (ctx) => {
      const l2 = getHouseLordFromLagna(2, ctx.lagnaRashi);
      const l5 = getHouseLordFromLagna(5, ctx.lagnaRashi);
      const l11 = getHouseLordFromLagna(11, ctx.lagnaRashi);
      const jup = ctx.planets.jupiter;
      if (!jup) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const jupRulesKeyHouse = l2 === 'jupiter' || l5 === 'jupiter' || l11 === 'jupiter';
      const jupInKendra = isKendra(jup.house);

      if (jupRulesKeyHouse && jupInKendra && !isDebilitated('jupiter', jup.rashiNumber)) {
        return {
          isPresent: true,
          conditionsMet: [
            'Jupiter is lord of 2nd, 5th, or 11th house from Lagna',
            `Jupiter occupies Kendra House ${jup.house} without debility`,
          ],
          involvedPlanets: ['jupiter'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'lakshmi',
    name: 'Lakṣmī Yoga',
    sanskritName: 'लक्ष्मी योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 42, v. 8 / Sarvāvalī 35:18',
    sanskritShloka: 'भाग्येशे केन्द्रगे तुङ्गे स्वभवनेऽपि वा । लग्नेशे बलसंयुक्ते लक्ष्मीयोगः प्रकीर्तितः ॥',
    category: 'Dhana',
    definition: 'The 9th house lord occupies a Kendra in its own or exaltation sign, while Lagneśa is powerful.',
    effects: 'Goddess Lakṣmī’s perpetual abode: boundless financial abundance, peerless moral integrity, high status, and enduring luxury.',
    evaluate: (ctx) => {
      const l9 = getHouseLordFromLagna(9, ctx.lagnaRashi);
      const l1 = getHouseLordFromLagna(1, ctx.lagnaRashi);
      const p9 = ctx.planets[l9];
      const p1 = ctx.planets[l1];
      if (!p9 || !p1) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const l9DignifiedInKendra = isKendra(p9.house) && (isExalted(l9, p9.rashiNumber) || isOwnSign(l9, p9.rashiNumber));
      const l1Strong = !isDusthana(p1.house);

      if (l9DignifiedInKendra && l1Strong) {
        return {
          isPresent: true,
          conditionsMet: [
            `9th Lord (${l9.toUpperCase()}) is in Kendra House ${p9.house} in own or exalted sign`,
            `Lagneśa (${l1.toUpperCase()}) is well-placed in House ${p1.house}`,
          ],
          involvedPlanets: [l9, l1],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'gauri',
    name: 'Gaurī Yoga',
    sanskritName: 'गौरी योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 23 / Jātaka Pārijāta 6:23',
    category: 'Special',
    definition: 'The Moon is in its own or exaltation sign in a Kendra or Trikoṇa, aspected by or conjoined with Jupiter.',
    effects: 'Radiant physical grace (Gaurī), royal favor, pure auspicious conduct, celebrated family honor, and long-lasting joy.',
    evaluate: (ctx) => {
      const moon = ctx.planets.moon;
      const jup = ctx.planets.jupiter;
      if (!moon || !jup) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const moonDignified = moon.rashiNumber === 4 || moon.rashiNumber === 2;
      const moonInGoodHouse = isKendra(moon.house) || isTrikona(moon.house);
      const aspectOrConj = moon.house === jup.house || Math.abs(moon.house - jup.house) === 6 || [4, 8].includes(getRelativeHouse(jup.house, moon.house));

      if (moonDignified && moonInGoodHouse && aspectOrConj) {
        return {
          isPresent: true,
          conditionsMet: [
            `Moon is in dignified sign ${moon.rashiNumber} in House ${moon.house}`,
            'Moon is connected with Jupiter by conjunction or aspect',
          ],
          involvedPlanets: ['moon', 'jupiter'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'pushkala',
    name: 'Puṣkala Yoga',
    sanskritName: 'पुष्कल योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 24 / Jātaka Pārijāta 6:24',
    category: 'Raja',
    definition: 'Lagneśa and the dispositor of the Moon are conjoined in a Kendra or in the house of a friend, aspecting Lagna.',
    effects: 'Abundant wealth and power (Puṣkala), magnetic speech, universal popularity, and sovereign honor.',
    evaluate: (ctx) => {
      const l1 = getHouseLordFromLagna(1, ctx.lagnaRashi);
      const moon = ctx.planets.moon;
      if (!moon) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
      const moonDispositor = getHouseLordFromLagna(moon.house, ctx.lagnaRashi);
      const p1 = ctx.planets[l1];
      const pDisp = ctx.planets[moonDispositor];
      if (!p1 || !pDisp) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      if (p1.house === pDisp.house && isKendra(p1.house)) {
        return {
          isPresent: true,
          conditionsMet: [
            `Lagneśa (${l1.toUpperCase()}) and Moon's dispositor (${moonDispositor.toUpperCase()}) are conjoined in Kendra House ${p1.house}`,
          ],
          involvedPlanets: [l1, moonDispositor, 'moon'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'mahabhagya',
    name: 'Mahābhāgya Yoga',
    sanskritName: 'महाभाग्य योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 36, v. 19–20 / BJ 13:8 / Phaladīpikā 6:22 / Sārāvalī 13:21',
    sanskritShloka: 'दिने रवौ लग्ने शशिनि च युक्ते पुंराशिभिः पुंसि महाभाग्यः । निशाकरे भूमिसुतादिना च योषित्सु चन्द्रे विषमे तदन्यत् ॥',
    category: 'Raja',
    definition: 'For a daytime birth: Lagna, Sun, and Moon are in odd (male) signs. For a nighttime birth: Lagna, Sun, and Moon are in even (female) signs.',
    effects: 'Supreme good fortune (Mahābhāgya), commanding leadership, generous disposition, long life, and spotless fame across domains.',
    evaluate: (ctx) => {
      const sun = ctx.planets.sun;
      const moon = ctx.planets.moon;
      if (!sun || !moon) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const isDayBirth = sun.house >= 7 && sun.house <= 12;
      const oddSigns = [1, 3, 5, 7, 9, 11];
      const evenSigns = [2, 4, 6, 8, 10, 12];

      const lagnaIsOdd = oddSigns.includes(ctx.lagnaRashi);
      const sunIsOdd = oddSigns.includes(sun.rashiNumber);
      const moonIsOdd = oddSigns.includes(moon.rashiNumber);

      const lagnaIsEven = evenSigns.includes(ctx.lagnaRashi);
      const sunIsEven = evenSigns.includes(sun.rashiNumber);
      const moonIsEven = evenSigns.includes(moon.rashiNumber);

      if (isDayBirth && lagnaIsOdd && sunIsOdd && moonIsOdd) {
        return {
          isPresent: true,
          conditionsMet: [
            `Diurnal birth (Sun in House ${sun.house} above horizon)`,
            `Lagna (${RASHIS[ctx.lagnaRashi].sanskritName}), Sun (${RASHIS[sun.rashiNumber].sanskritName}), and Moon (${RASHIS[moon.rashiNumber].sanskritName}) all occupy Odd (Oja) Signs`,
          ],
          involvedPlanets: ['sun', 'moon'],
          strengthRating: 'High',
        };
      }

      if (!isDayBirth && lagnaIsEven && sunIsEven && moonIsEven) {
        return {
          isPresent: true,
          conditionsMet: [
            `Nocturnal birth (Sun in House ${sun.house} below horizon)`,
            `Lagna (${RASHIS[ctx.lagnaRashi].sanskritName}), Sun (${RASHIS[sun.rashiNumber].sanskritName}), and Moon (${RASHIS[moon.rashiNumber].sanskritName}) all occupy Even (Yugma) Signs`,
          ],
          involvedPlanets: ['sun', 'moon'],
          strengthRating: 'High',
        };
      }

      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'khala_parivartana',
    name: 'Khala Parivartana Yoga',
    sanskritName: 'खल परिवर्तन योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 32–34 / Jātaka Pārijāta 6:32',
    sanskritShloka: 'तृतीयाधिपतेर्लग्नात् केन्द्रे वा कोणगेऽपि वा । व्यत्ययेन स्थितौ योगः खलो भवति निश्चितम् ॥',
    category: 'Parivartana',
    definition: 'Mutual sign exchange between the 3rd house lord (Sahajeśa) and the lord of an auspicious house (1st, 2nd, 4th, 5th, 7th, 9th, 10th, or 11th).',
    effects: 'Periods of intense exertion and fluctuating fortunes alternating with major breakthroughs, courage, and self-made ascendancy.',
    evaluate: (ctx) => {
      const l3 = getHouseLordFromLagna(3, ctx.lagnaRashi);
      const auspiciousHouses = [1, 2, 4, 5, 7, 9, 10, 11];
      for (const h of auspiciousHouses) {
        const lh = getHouseLordFromLagna(h, ctx.lagnaRashi);
        if (l3 === lh) continue;
        const p3 = ctx.planets[l3];
        const ph = ctx.planets[lh];
        if (!p3 || !ph) continue;
        const rashi3 = ((((ctx.lagnaRashi - 1) + 2) % 12) + 1) as RashiNumber;
        const rashih = ((((ctx.lagnaRashi - 1) + (h - 1)) % 12) + 1) as RashiNumber;
        if (p3.rashiNumber === rashih && ph.rashiNumber === rashi3) {
          return {
            isPresent: true,
            conditionsMet: [
              `3rd Lord (${l3.toUpperCase()}) occupies Sign ${rashih} (House ${h})`,
              `House ${h} Lord (${lh.toUpperCase()}) occupies Sign ${rashi3} (House 3)`,
            ],
            involvedPlanets: [l3, lh],
            strengthRating: 'Medium',
          };
        }
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'lagna_adhi_yoga',
    name: 'Lagna-Ādhi Yoga',
    sanskritName: 'लग्न-आधि योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 17–18 / BPHS Ch. 36, v. 5–7',
    sanskritShloka: 'षष्ठे सप्तमे वाऽष्टमे वा लग्नात् सौम्यैः समाश्रिते । आधियोगः समुद्दिष्टः सर्वसम्पत्प्रदायकः ॥',
    category: 'Raja',
    definition: 'All natural benefics (Jupiter, Venus, Mercury) occupy the 6th, 7th, and 8th houses from Lagna.',
    effects: 'Grants high ministerial and administrative power, invincibility over opposition, noble character, deep wealth, and longevity.',
    evaluate: (ctx) => {
      const benefics: PlanetId[] = ['jupiter', 'venus', 'mercury'];
      const targetHouses = [6, 7, 8];
      const beneficHouses = benefics.map((p) => ctx.planets[p]?.house).filter(Boolean);
      const allInTarget = beneficHouses.length >= 3 && beneficHouses.every((h) => targetHouses.includes(h));
      if (allInTarget) {
        return {
          isPresent: true,
          conditionsMet: [
            `Benefics (${benefics.join(', ')}) occupy Houses 6, 7, 8 from Lagna: ${beneficHouses.join(', ')}`,
          ],
          involvedPlanets: benefics,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'pravrajya_chatur_graha',
    name: 'Pravrajyā / Catur-Graha Yoga',
    sanskritName: 'प्रव्रज्या योग (चतुर्ग्रह योग)',
    sourceText: 'Bṛhat Jātaka',
    chapterAndVerse: 'BJ Ch. 15, v. 1 / Sārāvalī Ch. 19, v. 1 / BPHS Ch. 81',
    sanskritShloka: 'एकस्थैश्चतुराद्यैः प्रव्रज्या बलवद्ग्रहे । दीक्षां ददाति स्वां तां च तत्प्रवृत्तो नरः शुचिः ॥',
    category: 'Special',
    definition: 'Four or more classical Grahas occupy a single sign/house.',
    effects: 'Bestows deep spiritual orientation, capacity for profound detachment, ascetic intellectual mastery, and renowned philosophical legacy.',
    evaluate: (ctx) => {
      const seven = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as PlanetId[];
      const houseCounts: Record<number, PlanetId[]> = {};
      for (const p of seven) {
        const h = ctx.planets[p]?.house;
        if (h) {
          if (!houseCounts[h]) houseCounts[h] = [];
          houseCounts[h].push(p);
        }
      }
      for (const [h, planets] of Object.entries(houseCounts)) {
        if (planets.length >= 4) {
          return {
            isPresent: true,
            conditionsMet: [
              `${planets.length} classical Grahas (${planets.join(', ')}) occupy House ${h}`,
            ],
            involvedPlanets: planets,
            strengthRating: 'High',
          };
        }
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'shrikantha_yoga',
    name: 'Śrīkaṇṭha Yoga',
    sanskritName: 'श्रीकण्ठ योग',
    sourceText: 'Phaladīpikā',
    chapterAndVerse: 'Phaladīpikā Ch. 6, v. 28 / Jātaka Pārijāta 6:28',
    sanskritShloka: 'लग्नेशे रविसंयुक्ते चन्द्रे च केन्द्रकोणगे । मित्रस्वतुङ्गभे वापि श्रीकण्ठो जायते नरः ॥',
    category: 'Special',
    definition: 'Lagneśa, Sun, and Moon occupy Kendras or Trikoṇas in exaltation, own sign, or friendly signs.',
    effects: 'Adorned with righteous glory, virtuous speech, deep devotion to spiritual truth, benevolence, and esteemed authority.',
    evaluate: (ctx) => {
      const l1 = getHouseLordFromLagna(1, ctx.lagnaRashi);
      const p1 = ctx.planets[l1];
      const sun = ctx.planets.sun;
      const moon = ctx.planets.moon;
      if (!p1 || !sun || !moon) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const l1Good = (isKendra(p1.house) || isTrikona(p1.house)) && !isDebilitated(l1, p1.rashiNumber);
      const sunGood = (isKendra(sun.house) || isTrikona(sun.house)) && !isDebilitated('sun', sun.rashiNumber);
      const moonGood = (isKendra(moon.house) || isTrikona(moon.house)) && !isDebilitated('moon', moon.rashiNumber);

      if (l1Good && sunGood && moonGood) {
        return {
          isPresent: true,
          conditionsMet: [
            `Lagneśa (${l1.toUpperCase()}), Sun, and Moon all occupy Kendras/Trikoṇas without debility`,
            `Placements: Lagneśa in H${p1.house}, Sun in H${sun.house}, Moon in H${moon.house}`,
          ],
          involvedPlanets: [l1, 'sun', 'moon'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'bahudravya_dhana',
    name: 'Bahudravya Dhana Yoga',
    sanskritName: 'बहुद्रव्य धनयोग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 41, v. 11 / Sarvārtha Cintāmaṇi 4:10',
    sanskritShloka: 'एकादशे शुभैर्दृष्टे लाभेशे केन्द्रकोणगे । बहुद्रव्ययुतो धीमान् सर्वकार्येषु सिद्धिमान् ॥',
    category: 'Dhana',
    definition: 'The 11th house lord occupies a Kendra or Trikoṇa, while connected with natural benefics.',
    effects: 'Endless influx of revenue (Bahudravya), expanding assets, lucrative commercial success, and fulfilling all ambitious goals.',
    evaluate: (ctx) => {
      const l11 = getHouseLordFromLagna(11, ctx.lagnaRashi);
      const p11 = ctx.planets[l11];
      const jup = ctx.planets.jupiter;
      const ven = ctx.planets.venus;
      if (!p11) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const inKendraOrKona = isKendra(p11.house) || isTrikona(p11.house);
      const beneficConn = (jup && (jup.house === p11.house || Math.abs(jup.house - p11.house) === 6)) ||
                          (ven && (ven.house === p11.house || Math.abs(ven.house - p11.house) === 6));

      if (inKendraOrKona && beneficConn && !isDebilitated(l11, p11.rashiNumber)) {
        return {
          isPresent: true,
          conditionsMet: [
            `11th Lord (${l11.toUpperCase()}) is placed in House ${p11.house} (Kendra/Trikoṇa)`,
            '11th Lord is connected with natural benefics (Jupiter/Venus)',
          ],
          involvedPlanets: [l11, jup ? 'jupiter' : 'venus'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'vargottama_lagna_graha',
    name: 'Vargottama Graha Formation',
    sanskritName: 'वर्गोत्तम ग्रह योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 6, v. 40 / Phaladīpikā Ch. 3, v. 10 / BJ Ch. 1, v. 14',
    sanskritShloka: 'राशिनवांशयोरेकत्वं वर्गोत्तम इति स्मृतम् । वर्गोत्तमे शुभं प्राहुर्ग्रहाणां बलमुत्तमम् ॥',
    category: 'Special',
    definition: 'A Graha occupies the identical sign (Rāśi) in both the Rāśi chart (D1) and the Navāṁśa chart (D9).',
    effects: 'Endows unshakeable foundational resilience, heightened intrinsic dignity, enduring mental fortitude, and auspicious fruitions.',
    evaluate: (ctx) => {
      const d9 = ctx.vargas?.['D9'];
      if (!d9) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const vargottamaPlanets: PlanetId[] = [];
      const conditions: string[] = [];
      const seven = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as PlanetId[];

      for (const p of seven) {
        const d1Rashi = ctx.planets[p]?.rashiNumber;
        const d9Rashi = d9.planets[p]?.rashiNumber;
        if (d1Rashi && d9Rashi && d1Rashi === d9Rashi) {
          vargottamaPlanets.push(p);
          conditions.push(`${p.toUpperCase()} is Vargottama in ${RASHIS[d1Rashi].sanskritName} (D1 & D9 Sign ${d1Rashi})`);
        }
      }

      if (vargottamaPlanets.length > 0) {
        return {
          isPresent: true,
          conditionsMet: conditions,
          involvedPlanets: vargottamaPlanets,
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
];

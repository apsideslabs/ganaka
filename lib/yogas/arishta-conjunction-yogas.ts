/**
 * Classical Conjunctions, Arishta/Kartarī, Lunar Hazards, and Jaimini Yogas
 * Sources: Bṛhat Jātaka (Ch. 13–14), Bṛhat Parāśara Horā Śāstra (Ch. 37, 44), Sārāvalī (Ch. 15–18), Jaimini Upadeśa Sūtras (Ch. 1)
 */

import { PlanetId } from '../astronomy/ephemeris';
import {
  YogaDefinition,
  getRelativeHouse,
  isKendra,
  isTrikona,
} from './yoga-engine';

const BENEFICS: PlanetId[] = ['jupiter', 'venus', 'mercury', 'moon'];
const MALEFICS: PlanetId[] = ['sun', 'mars', 'saturn', 'rahu', 'ketu'];

export const ARISHTA_CONJUNCTION_EXPANDED_YOGAS: YogaDefinition[] = [
  // -----------------------------------------------------------------------
  // LUNAR & SOLAR CONFIGURATIONS
  // -----------------------------------------------------------------------
  {
    id: 'shakata_lunar',
    name: 'Śakaṭa Yoga (Lunar)',
    sanskritName: 'शकट योग (चन्द्र शकट)',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 37, v. 14 / BJ 13:6 / PD 6:36',
    sanskritShloka: 'षष्ठाष्टमे वा रिपुगे शशाङ्काद् गुरौ स्थिते लग्नकेन्द्रे न चन्द्रे । जाते नरे शकटयोग उद्भवो भवति नित्यं विपुलदुःखभाक् ॥',
    category: 'Arishta',
    definition: 'Jupiter is in the 6th, 8th, or 12th house from the Moon, and the Moon is NOT in a Kendra from the Lagna (unless Moon is exalted or in own sign).',
    effects: 'Fluctuations like the turning of a cart-wheel (Śakaṭa): cycles of prosperity followed by sudden reversals, demanding perseverance.',
    evaluate: (ctx) => {
      const moon = ctx.planets.moon;
      const jup = ctx.planets.jupiter;
      if (!moon || !jup) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const relH = getRelativeHouse(moon.house, jup.house);
      const is6812FromMoon = relH === 6 || relH === 8 || relH === 12;
      const moonInKendra = isKendra(moon.house);
      const moonDignified = moon.rashiNumber === 4 || moon.rashiNumber === 2;

      if (is6812FromMoon && !moonInKendra && !moonDignified) {
        return {
          isPresent: true,
          conditionsMet: [
            `Jupiter is in ${relH}th house from Moon`,
            'Moon is not in a Kendra from Lagna (no immediate cancellation)',
          ],
          involvedPlanets: ['moon', 'jupiter'],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'shubha_kartari_lagna',
    name: 'Śubha Kartarī Yoga (Lagna)',
    sanskritName: 'शुभकर्तरी योग (लग्न)',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 11, v. 6 / Sarvārtha Cintāmaṇi 2:15',
    category: 'Special',
    definition: 'Natural benefics (Jupiter, Venus, Mercury, Moon) occupy both the 12th and 2nd houses from Lagna, with no malefics present.',
    effects: 'Encompassed by protective auspicious forces: robust physical vitality, moral rectitude, eloquence, and freedom from severe distress.',
    evaluate: (ctx) => {
      const h12Planets = Object.keys(ctx.planets).filter((p) => ctx.planets[p as PlanetId]?.house === 12) as PlanetId[];
      const h2Planets = Object.keys(ctx.planets).filter((p) => ctx.planets[p as PlanetId]?.house === 2) as PlanetId[];

      const h12Benefic = h12Planets.length > 0 && h12Planets.every((p) => BENEFICS.includes(p));
      const h2Benefic = h2Planets.length > 0 && h2Planets.every((p) => BENEFICS.includes(p));

      if (h12Benefic && h2Benefic) {
        return {
          isPresent: true,
          conditionsMet: [
            `2nd House has benefics (${h2Planets.join(', ')})`,
            `12th House has benefics (${h12Planets.join(', ')})`,
          ],
          involvedPlanets: [...h12Planets, ...h2Planets],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'papa_kartari_lagna',
    name: 'Pāpa Kartarī Yoga (Lagna)',
    sanskritName: 'पापकर्तरी योग (लग्न)',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 11, v. 7 / Sarvārtha Cintāmaṇi 2:16',
    category: 'Arishta',
    definition: 'Natural malefics (Sun, Mars, Saturn, Rahu, Ketu) occupy both the 12th and 2nd houses from Lagna, scissors-hemming the Ascendant.',
    effects: 'Constriction or feeling hemmed-in during formative chapters; builds exceptional stoic resilience and defensive vigilance.',
    evaluate: (ctx) => {
      const h12Planets = Object.keys(ctx.planets).filter((p) => ctx.planets[p as PlanetId]?.house === 12) as PlanetId[];
      const h2Planets = Object.keys(ctx.planets).filter((p) => ctx.planets[p as PlanetId]?.house === 2) as PlanetId[];

      const h12Malefic = h12Planets.length > 0 && h12Planets.some((p) => MALEFICS.includes(p));
      const h2Malefic = h2Planets.length > 0 && h2Planets.some((p) => MALEFICS.includes(p));

      if (h12Malefic && h2Malefic) {
        return {
          isPresent: true,
          conditionsMet: [
            `Malefics in 2nd House (${h2Planets.join(', ')}) and 12th House (${h12Planets.join(', ')})`,
          ],
          involvedPlanets: [...h12Planets, ...h2Planets],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },

  // -----------------------------------------------------------------------
  // CLASSICAL DVI-GRAHA YOGAS (Bṛhat Jātaka Ch. 14 / Sārāvalī Ch. 15-18)
  // -----------------------------------------------------------------------
  {
    id: 'lakshmi_narayana',
    name: 'Lakṣmī-Nārāyaṇa Yoga (Budha-Śukra)',
    sanskritName: 'लक्ष्मीनारायण योग (बुध-शुक्र)',
    sourceText: 'Sarvāvalī',
    chapterAndVerse: 'Sarvāvalī Ch. 16, v. 6 / BPHS Ch. 41',
    sanskritShloka: 'वाग्मी सुधीः सर्वकलाप्रवीणः सौन्दर्ययुक्तो जनवल्लभोऽयम् । बुध-शुक्रयोगे पुरुषोऽतिविद्या-धनाढ्यनामा बहुसौख्यभागी ॥',
    category: 'Conjunction',
    definition: 'Mercury and Venus are conjoined in the same sign in a Kendra, Trikoṇa, or 2nd/11th house.',
    effects: 'Divine harmony of intellect and aesthetic grace (Lakṣmī-Nārāyaṇa): exquisite eloquence, artistic mastery, wealth, and widespread popularity.',
    evaluate: (ctx) => {
      const merc = ctx.planets.mercury;
      const ven = ctx.planets.venus;
      if (!merc || !ven) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      if (merc.house === ven.house && (isKendra(merc.house) || isTrikona(merc.house) || merc.house === 2 || merc.house === 11)) {
        return {
          isPresent: true,
          conditionsMet: [
            `Mercury and Venus are conjoined in House ${merc.house}`,
            'Conjunction is situated in an auspicious house',
          ],
          involvedPlanets: ['mercury', 'venus'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'surya_guru_yoga',
    name: 'Sūrya-Guru Yoga',
    sanskritName: 'सूर्य-गुरु योग',
    sourceText: 'Bṛhat Jātaka',
    chapterAndVerse: 'Bṛhat Jātaka Ch. 14, v. 1 / Sarvāvalī 15:3',
    category: 'Conjunction',
    definition: 'The Sun and Jupiter occupy the same sign/house.',
    effects: 'Noble judicial temperament, advisor to sovereigns and ministers, deep philosophical orientation, unshakeable integrity.',
    evaluate: (ctx) => {
      const sun = ctx.planets.sun;
      const jup = ctx.planets.jupiter;
      if (!sun || !jup) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      if (sun.house === jup.house) {
        return {
          isPresent: true,
          conditionsMet: [`Sun and Jupiter are conjoined in House ${sun.house}`],
          involvedPlanets: ['sun', 'jupiter'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'chandra_budha_yoga',
    name: 'Candra-Budha Yoga',
    sanskritName: 'चन्द्र-बुध योग',
    sourceText: 'Bṛhat Jātaka',
    chapterAndVerse: 'Bṛhat Jātaka Ch. 14, v. 2 / Sarvāvalī 15:5',
    category: 'Conjunction',
    definition: 'The Moon and Mercury occupy the same sign/house.',
    effects: 'Poetic eloquence, rapid comprehension, commercial and accounting aptitude, polite demeanor, and literary fame.',
    evaluate: (ctx) => {
      const moon = ctx.planets.moon;
      const merc = ctx.planets.mercury;
      if (!moon || !merc) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      if (moon.house === merc.house) {
        return {
          isPresent: true,
          conditionsMet: [`Moon and Mercury are conjoined in House ${moon.house}`],
          involvedPlanets: ['moon', 'mercury'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'chandra_shukra_yoga',
    name: 'Candra-Śukra Yoga',
    sanskritName: 'चन्द्र-शुक्र योग',
    sourceText: 'Bṛhat Jātaka',
    chapterAndVerse: 'Bṛhat Jātaka Ch. 14, v. 3 / Sarvāvalī 15:9',
    category: 'Conjunction',
    definition: 'The Moon and Venus occupy the same sign/house.',
    effects: 'Refined aesthetic sensibility, tailoring/design skills, trade in luxuries and perfumes, pleasant domestic comfort.',
    evaluate: (ctx) => {
      const moon = ctx.planets.moon;
      const ven = ctx.planets.venus;
      if (!moon || !ven) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      if (moon.house === ven.house) {
        return {
          isPresent: true,
          conditionsMet: [`Moon and Venus are conjoined in House ${moon.house}`],
          involvedPlanets: ['moon', 'venus'],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'chandra_shani_yoga',
    name: 'Candra-Śani Yoga (Puṇarphū)',
    sanskritName: 'चन्द्र-शनि योग',
    sourceText: 'Bṛhat Jātaka',
    chapterAndVerse: 'Bṛhat Jātaka Ch. 14, v. 3 / Sarvāvalī 15:11',
    category: 'Conjunction',
    definition: 'The Moon and Saturn occupy the same sign/house or are in mutual aspect.',
    effects: 'Deep emotional detachment, psychological resilience forged through duty, affinity for elderly mentors and historic wisdom.',
    evaluate: (ctx) => {
      const moon = ctx.planets.moon;
      const sat = ctx.planets.saturn;
      if (!moon || !sat) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      if (moon.house === sat.house || Math.abs(moon.house - sat.house) === 6) {
        return {
          isPresent: true,
          conditionsMet: [`Moon and Saturn are ${moon.house === sat.house ? 'conjoined in House ' + moon.house : 'in mutual aspect'}`],
          involvedPlanets: ['moon', 'saturn'],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'guru_chandala',
    name: 'Guru-Cāṇḍāla Yoga',
    sanskritName: 'गुरु-चाण्डाल योग',
    sourceText: 'Bṛhat Parāśara Horā Śāstra',
    chapterAndVerse: 'BPHS Ch. 44 / Jātaka Pārijāta Ch. 8',
    category: 'Arishta',
    definition: 'Jupiter is conjoined with Rahu or Ketu in the same sign.',
    effects: 'Unconventional thinking, challenging orthodoxy and dogmatic traditions; calls for grounded discrimination in spiritual matters.',
    evaluate: (ctx) => {
      const jup = ctx.planets.jupiter;
      const rahu = ctx.planets.rahu || ctx.planets.true_rahu;
      const ketu = ctx.planets.ketu || ctx.planets.true_ketu;
      if (!jup) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const withRahu = rahu && jup.house === rahu.house;
      const withKetu = ketu && jup.house === ketu.house;

      if (withRahu || withKetu) {
        const node = withRahu ? 'Rahu' : 'Ketu';
        return {
          isPresent: true,
          conditionsMet: [`Jupiter is conjoined with ${node} in House ${jup.house}`],
          involvedPlanets: ['jupiter', withRahu ? 'rahu' : 'ketu'],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'angāraka_yoga',
    name: 'Aṅgāraka Yoga',
    sanskritName: 'अङ्गारक योग',
    sourceText: 'Sarvārtha Cintāmaṇi',
    chapterAndVerse: 'Sarvārtha Cintāmaṇi Ch. 8 / BPHS Ch. 44',
    category: 'Arishta',
    definition: 'Mars is conjoined with Rahu or Ketu in the same sign.',
    effects: 'High fiery intensity and explosive technical/athletic energy; requires conscious redirection into structured physical or strategic pursuits.',
    evaluate: (ctx) => {
      const mars = ctx.planets.mars;
      const rahu = ctx.planets.rahu || ctx.planets.true_rahu;
      const ketu = ctx.planets.ketu || ctx.planets.true_ketu;
      if (!mars) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const withRahu = rahu && mars.house === rahu.house;
      const withKetu = ketu && mars.house === ketu.house;

      if (withRahu || withKetu) {
        const node = withRahu ? 'Rahu' : 'Ketu';
        return {
          isPresent: true,
          conditionsMet: [`Mars is conjoined with ${node} in House ${mars.house}`],
          involvedPlanets: ['mars', withRahu ? 'rahu' : 'ketu'],
          strengthRating: 'Medium',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'kala_sarpa',
    name: 'Kāla Sarpa / Kāla Amṛta Yoga',
    sanskritName: 'कालसर्प योग / कालामृत योग',
    sourceText: 'Unverified / Medieval Vernacular Tradition',
    chapterAndVerse: 'Non-Canonical (Late Medieval & Vernacular Tradition)',
    category: 'Special',
    isUnverified: true,
    provenanceNotes: 'Absent from classical Sanskrit canonical works (BPHS, Bṛhat Jātaka, Sārāvalī, Phaladīpikā, Jātaka Pārijāta). Preserved in late medieval regional traditions.',
    definition: 'All seven classical planets (Sun through Saturn) are enclosed on one side of the Rahu-Ketu nodal axis.',
    effects: 'Intense karmic momentum, initial uphill struggles leading to extraordinary late-life achievements and enduring legacy.',
    evaluate: (ctx) => {
      const rahu = ctx.planets.rahu || ctx.planets.true_rahu;
      const ketu = ctx.planets.ketu || ctx.planets.true_ketu;
      if (!rahu || !ketu) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const seven = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as PlanetId[];
      const rHouse = rahu.house;
      const kHouse = ketu.house;

      // Count distance from Rahu to planet
      const distsFromRahu = seven.map((p) => getRelativeHouse(rHouse, ctx.planets[p]?.house || 1));
      const distsFromKetu = seven.map((p) => getRelativeHouse(kHouse, ctx.planets[p]?.house || 1));

      const allRahuToKetu = distsFromRahu.every((d) => d <= 7);
      const allKetuToRahu = distsFromKetu.every((d) => d <= 7);

      if (allRahuToKetu || allKetuToRahu) {
        const type = allRahuToKetu ? 'Kāla Sarpa (Anuloma)' : 'Kāla Amṛta (Viloma)';
        return {
          isPresent: true,
          conditionsMet: [
            `All 7 classical planets are hemmed within one hemisphere of Rahu-Ketu axis (${type})`,
          ],
          involvedPlanets: ['rahu', 'ketu', ...seven],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
  {
    id: 'jaimini_raja_yoga',
    name: 'Jaimini Rāja Yoga (AK & AmK Sambandha)',
    sanskritName: 'जैमिनि राज योग',
    sourceText: 'Jaimini Upadeśa Sūtras',
    chapterAndVerse: 'JUS Ch. 1, Sūtra 2:14 / BPHS Ch. 39',
    sanskritShloka: 'आत्मकारकोऽमात्यकारकश्च संयुतौ परस्परं वीक्षितौ वा राजयोगं जनयतः ॥',
    category: 'Raja',
    definition: 'The Ātmakāraka (planet with highest degree) and Amātyakāraka (planet with 2nd highest degree) are conjoined in the same sign or in mutual aspect.',
    effects: 'Command of royal status, executive authority, high administrative post, and enduring dignity.',
    evaluate: (ctx) => {
      const seven = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as PlanetId[];
      // Compute degrees within sign (0 to 30)
      const planetDegrees = seven
        .map((p) => {
          const pl = ctx.planets[p];
          if (!pl) return null;
          const degInSign = pl.siderealLongitude % 30;
          return { id: p, deg: degInSign, house: pl.house };
        })
        .filter(Boolean) as { id: PlanetId; deg: number; house: number }[];

      planetDegrees.sort((a, b) => b.deg - a.deg);
      if (planetDegrees.length < 2) return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };

      const ak = planetDegrees[0];
      const amk = planetDegrees[1];

      const isConj = ak.house === amk.house;
      const isAspect = Math.abs(ak.house - amk.house) === 6;

      if (isConj || isAspect) {
        return {
          isPresent: true,
          conditionsMet: [
            `Ātmakāraka (${ak.id.toUpperCase()} at ${ak.deg.toFixed(2)}°) and Amātyakāraka (${amk.id.toUpperCase()} at ${amk.deg.toFixed(2)}°) are ${isConj ? 'conjoined in House ' + ak.house : 'in mutual 7th aspect'}`,
          ],
          involvedPlanets: [ak.id, amk.id],
          strengthRating: 'High',
        };
      }
      return { isPresent: false, conditionsMet: [], involvedPlanets: [], strengthRating: 'Weak' };
    },
  },
];

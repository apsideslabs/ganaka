/**
 * Gaṇaka — Classical Marriage & Relationship Afflictions Database
 * Primary Sources: BPHS Ch. 80–81, Muhūrta Cintāmaṇi Ch. 2, Phaladīpikā Ch. 10,
 * Jātaka Candrikā, Jātaka Pārijāta Ch. 14, Kerala Prasna Marga
 */

import { PlanetId } from '../astronomy/ephemeris';
import { DoshaDefinition } from './dosha-types';
import {
  NATURAL_MALEFICS,
  getHouseLord,
  getAspectingPlanets,
  isDusthana,
  isKendra,
  isExalted,
  isOwnSign,
} from './dosha-utils';

export const CLASSICAL_MARRIAGE_DOSHAS: DoshaDefinition[] = [
  {
    id: 'kuja_dosha',
    name: 'Kuja / Maṅgala Doṣa (भौम / मङ्गल दोष)',
    sanskritName: 'भौम (मङ्गल) दोष',
    transliteration: 'Kuja / Maṅgala Doṣa',
    alternateNames: ['Bhauma Doṣa', 'Angarakha Dosha', 'Mars Affliction on Marriage'],
    category: 'Marriage & Relationship Afflictions',
    subcategory: 'Martian Marital Affliction',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'Muhūrta Cintāmaṇi & BPHS',
      sanskritTextName: 'मुहूर्तचिन्तामणिः / बृहत्पाराशर',
      chapter: 'Muhūrta Cintāmaṇi Ch. 2 / BPHS Ch. 80',
      verseOrShloka: 'MC 2:23 / BPHS 80:48',
      sanskritShloka: 'लग्ने व्यये च पाताले जामित्रे चाष्टमे कुजे । भार्या भर्तुर्विनाशाय भर्तुश्च वरकन्ययोः ॥',
      sanskritTerminology: 'Bhauma Doṣa (भौमदोष)',
      supportingSources: ['Jātaka Candrikā Ch. 1 v. 39', 'Prasna Marga Ch. 21', 'Phaladīpikā Ch. 10 v. 14'],
    },
    variants: [
      {
        traditionName: 'Standard Classical (BPHS & Muhūrta Cintāmaṇi)',
        sourceText: 'Muhūrta Cintāmaṇi',
        chapterAndVerse: 'Ch. 2 v. 23',
        description: 'Mars placed in 1st, 4th, 7th, 8th, or 12th house from Lagna, Moon, or Venus.',
        conditionFormula: 'Mars ∈ {1, 4, 7, 8, 12} from Lagna / Moon / Venus',
      },
      {
        traditionName: 'South Indian & Andhra Tradition (Includes 2nd House)',
        sourceText: 'Jātaka Candrikā / Kerala Tradition',
        chapterAndVerse: 'Jātaka Candrikā v. 40',
        description: 'Includes the 2nd house (Dvitīyagato Bhaumaḥ) representing family speech and longevity of marital bonds.',
        conditionFormula: 'Mars ∈ {1, 2, 4, 7, 8, 12} from Lagna / Moon / Venus',
      },
    ],
    cancellationRules: [
      {
        id: 'mars_own_sign_exaltation',
        title: 'Mars in Aries, Scorpio, or Capricorn',
        sanskritTitle: 'स्वक्षेत्र/उच्च भौम परिहार',
        sourceText: 'Muhūrta Cintāmaṇi',
        chapterAndVerse: 'Ch. 2 v. 25',
        sanskritShloka: 'मेषे कुजे कुजदोषो न, वृश्चिके न, मकरे न च ।',
        description: 'Mars in Aries, Scorpio, or Capricorn does not cause Kuja Dosha.',
        conditionMetDescription: 'Mars is in Aries, Scorpio, or Capricorn.',
      },
      {
        id: 'mars_house_sign_parihara',
        title: 'Specific House-Sign Exemptions (Bhauma Parihāra)',
        sanskritTitle: 'स्थान-राशि विशेष परिहार',
        sourceText: 'Muhūrta Cintāmaṇi',
        chapterAndVerse: 'Ch. 2 v. 26–28',
        sanskritShloka: 'लग्ने मेषे, व्यये वृषे, पाताले वृश्चिके, जामित्रे मकरे, चाष्टमे चापे, द्वितीये मिथुने कुजे दोषो न विद्यते ॥',
        description: 'Mars in Aries in 1st, Taurus in 12th, Scorpio in 4th, Capricorn in 7th, Sagittarius/Pisces in 8th, Gemini/Virgo in 2nd, Leo in 8th, Aquarius in 4th produces no defect.',
        conditionMetDescription: 'Mars occupies an exempt house-sign combination.',
      },
      {
        id: 'guru_chandra_drishti_conjunction',
        title: 'Jupiter or Moon Conjunction / Aspect',
        sanskritTitle: 'गुरु/चन्द्र दृष्टि युति परिहार',
        sourceText: 'Phaladīpikā',
        chapterAndVerse: 'Ch. 10 v. 15',
        sanskritShloka: 'गुरुणा सह संयुक्ते चन्द्रेणापि निरीक्षिते । न कुजदोषप्रभवो जातकस्य विधीयते ॥',
        description: 'Jupiter or Moon conjoining or casting direct aspect on Mars cancels Kuja Dosha.',
        conditionMetDescription: 'Mars is conjoined or aspected by Jupiter or Moon.',
      },
    ],
    definition: 'Mars (Kuja) is placed in the 1st, 2nd (South Indian variant), 4th, 7th, 8th, or 12th house counting from the Ascendant (Lagna), Moon, or Venus.',
    classicalEffects: 'High marital energy, passionate temperament, potential for friction unless matched with a partner of equal energetic temperament (Sama-Kuja) or cancelled by classical parihāras.',
    evaluate: (ctx) => {
      const mars = ctx.planets.mars;
      const moon = ctx.planets.moon;
      const venus = ctx.planets.venus;
      if (!mars) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      // Base Houses
      const standardHouses = [1, 4, 7, 8, 12];
      const southIndianHouses = [1, 2, 4, 7, 8, 12];
      const targetHouses = ctx.config?.include2ndHouseKujaDosha !== false ? southIndianHouses : standardHouses;

      // Calculate houses from Lagna, Moon, and Venus
      const houseFromLagna = mars.house;
      const houseFromMoon = moon ? (((mars.rashiNumber - moon.rashiNumber + 12) % 12) + 1) : 1;
      const houseFromVenus = venus ? (((mars.rashiNumber - venus.rashiNumber + 12) % 12) + 1) : 1;

      const fromLagnaMatch = targetHouses.includes(houseFromLagna);
      const fromMoonMatch = targetHouses.includes(houseFromMoon);
      const fromVenusMatch = targetHouses.includes(houseFromVenus);

      if (!fromLagnaMatch && !fromMoonMatch && !fromVenusMatch) {
        return {
          isPresent: false,
          formationStatus: 'Not Formed',
          severity: 'Low',
          conditionsMet: [],
          exceptionsApplied: [],
          involvedPlanets: ['mars'],
        };
      }

      const conditions: string[] = [];
      if (fromLagnaMatch) conditions.push(`Mars in House ${houseFromLagna} from Lagna (${mars.rashiName})`);
      if (fromMoonMatch) conditions.push(`Mars in House ${houseFromMoon} from Moon`);
      if (fromVenusMatch) conditions.push(`Mars in House ${houseFromVenus} from Venus`);

      // Evaluate Classical Cancellations / Parihāras
      const exceptions: string[] = [];

      // 1. Dignity Parihāra
      if (isOwnSign('mars', mars.rashiNumber) || isExalted('mars', mars.rashiNumber)) {
        exceptions.push(`Mars is in Swakshetra / Exaltation in ${mars.rashiName} (MC 2:25 Parihāra)`);
      }

      // 2. Specific Classical House-Sign Parihāras
      const r = mars.rashiNumber;
      const h = mars.house;
      if (
        (h === 1 && r === 1) ||          // Aries in 1st
        (h === 12 && r === 2) ||         // Taurus in 12th
        (h === 4 && (r === 8 || r === 11)) || // Scorpio or Aquarius in 4th
        (h === 7 && (r === 10 || r === 4)) || // Capricorn or Cancer in 7th
        (h === 8 && (r === 9 || r === 12 || r === 5)) || // Sag/Pisces/Leo in 8th
        (h === 2 && (r === 3 || r === 6)) // Gemini/Virgo in 2nd
      ) {
        exceptions.push(`Classical Sthāna-Rāśi exception: Mars in ${mars.rashiName} in House ${h} (MC 2:26–28)`);
      }

      // 3. Jupiter / Moon Conjunction or Aspect
      const jup = ctx.planets.jupiter;
      const jupConjunct = jup && jup.rashiNumber === mars.rashiNumber;
      const jupAspects = jup && getAspectingPlanets(mars.house, ctx.planets).includes('jupiter');
      const moonConjunct = moon && moon.rashiNumber === mars.rashiNumber;

      if (jupConjunct || jupAspects || moonConjunct) {
        exceptions.push('Mars conjunct or aspected by divine benefic Jupiter / Moon (PD 10:15 Parihāra)');
      }

      // 4. Benefic in Kendra
      if (jup && isKendra(jup.house) && (isExalted('jupiter', jup.rashiNumber) || isOwnSign('jupiter', jup.rashiNumber))) {
        exceptions.push('Exalted/Swakshetra Jupiter in Kendra exerts sovereign marital protection');
      }

      if (exceptions.length > 0) {
        return {
          isPresent: true,
          formationStatus: 'Cancelled',
          severity: 'Cancelled',
          conditionsMet: conditions,
          exceptionsApplied: exceptions,
          involvedPlanets: ['mars', ...(jup ? ['jupiter' as PlanetId] : [])],
          involvedHouses: [houseFromLagna],
          appliedVariant: ctx.config?.include2ndHouseKujaDosha !== false ? 'South Indian 6-House Rule (1, 2, 4, 7, 8, 12)' : 'Standard 5-House Rule (1, 4, 7, 8, 12)',
          classicalNotes: 'Classical parihāra rules completely nullify or temper the aggressive Martian influence into constructive enterprise.',
        };
      }

      // Severity rating based on multiplicity
      const matchCount = (fromLagnaMatch ? 1 : 0) + (fromMoonMatch ? 1 : 0) + (fromVenusMatch ? 1 : 0);

      return {
        isPresent: true,
        formationStatus: 'Formed',
        severity: matchCount >= 2 ? 'High' : 'Medium',
        conditionsMet: conditions,
        exceptionsApplied: [],
        involvedPlanets: ['mars'],
        involvedHouses: [houseFromLagna],
        appliedVariant: ctx.config?.include2ndHouseKujaDosha !== false ? 'South Indian 6-House Rule (1, 2, 4, 7, 8, 12)' : 'Standard 5-House Rule (1, 4, 7, 8, 12)',
      };
    },
  },
  {
    id: 'vaidhavya_yoga',
    name: 'Vaidhavya Yoga (7th/8th Bhava Affliction)',
    sanskritName: 'वैधव्य योग (सप्तम/अष्टम भाव दोष)',
    transliteration: 'Vaidhavya Yoga',
    alternateNames: ['Severe Marital Longevity Affliction', '7th/8th Malefic Affliction'],
    category: 'Marriage & Relationship Afflictions',
    subcategory: 'Marital Longevity',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'Phaladīpikā & BPHS',
      sanskritTextName: 'फलदीपिका / बृहत्पाराशर',
      chapter: 'PD Ch. 10 / BPHS Ch. 80',
      verseOrShloka: 'PD 10:1–6 / BPHS 80:12–18',
      sanskritShloka: 'सप्तमे चाष्टमे पापैर्युक्ते दृष्टेऽथवा सति । वैधव्यं सम्प्रजायेत यदि जीवो न पश्यति ॥',
      sanskritTerminology: 'Vaidhavya (वैधव्य)',
      supportingSources: ['Jātaka Pārijāta Ch. 14 v. 12', 'Sārāvalī Ch. 35'],
    },
    cancellationRules: [
      {
        id: 'guru_in_7th_or_aspect',
        title: 'Jupiter in 7th or Aspecting 7th/8th',
        sanskritTitle: 'गुरु दृष्टि परिहार',
        sourceText: 'Phaladīpikā',
        chapterAndVerse: 'Ch. 10 v. 8',
        sanskritShloka: 'एकोऽपि जीवः सप्तमगो हन्ति वैधव्यम् ।',
        description: 'Even a single Jupiter placed in or casting aspect on the 7th house destroys Vaidhavya Yoga.',
        conditionMetDescription: 'Jupiter is in 7th house or casts dṛṣṭi on 7th house.',
      },
    ],
    definition: 'The 7th and 8th houses are occupied exclusively by natural malefics without benefic presence or aspect, and the 7th lord is debilitated or in Dusthāna.',
    classicalEffects: 'Significant tests in marital harmony and longevity of the relationship, completely averted when Jupiter protects the 7th bhāva.',
    evaluate: (ctx) => {
      const lord7Id = getHouseLord(7, ctx.lagnaRashi);
      const lord7 = ctx.planets[lord7Id];
      if (!lord7) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      const maleficsIn7 = NATURAL_MALEFICS.filter((m) => ctx.planets[m]?.house === 7);
      const maleficsIn8 = NATURAL_MALEFICS.filter((m) => ctx.planets[m]?.house === 8);
      const lord7InDusthana = isDusthana(lord7.house);

      if ((maleficsIn7.length > 0 || maleficsIn8.length > 0) && lord7InDusthana) {
        const jup = ctx.planets.jupiter;
        const jupIn7 = jup?.house === 7;
        const jupAspects7 = jup && getAspectingPlanets(7, ctx.planets).includes('jupiter');

        const conditions = [
          `7th/8th house afflicted by: ${[...maleficsIn7, ...maleficsIn8].join(', ').toUpperCase()}`,
          `7th lord (${lord7.sanskritName}) in Dusthāna (${lord7.house}th house)`,
        ];

        if (jupIn7 || jupAspects7) {
          return {
            isPresent: true,
            formationStatus: 'Cancelled',
            severity: 'Cancelled',
            conditionsMet: conditions,
            exceptionsApplied: ['Jupiter in 7th or casting direct aspect destroys all Vaidhavya defects (PD 10:8)'],
            involvedPlanets: [lord7Id, ...maleficsIn7, ...maleficsIn8, 'jupiter'],
            involvedHouses: [7, 8],
          };
        }

        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'High',
          conditionsMet: conditions,
          exceptionsApplied: [],
          involvedPlanets: [lord7Id, ...maleficsIn7, ...maleficsIn8],
          involvedHouses: [7, 8],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'vishakanya_yoga',
    name: 'Viṣakanyā Yoga (विषकन्या योग)',
    sanskritName: 'विषकन्या योग',
    transliteration: 'Viṣakanyā Yoga',
    alternateNames: ['Poison Maiden Affliction', 'Venomous Combination'],
    category: 'Marriage & Relationship Afflictions',
    subcategory: 'Pañcāṅga & Planetary Conjunction',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'BPHS & Jātaka Pārijāta',
      sanskritTextName: 'बृहत्पाराशर / जातकपारिजातः',
      chapter: 'BPHS Ch. 81 / JP Ch. 14',
      verseOrShloka: 'BPHS 81:1–6 / JP 14:21',
      sanskritShloka: 'शनिवार द्वितीया च कृत्तिका यदि संगता । मङ्गलारे च सप्तम्यां शतभिषग् विषकन्यका ॥',
      sanskritTerminology: 'Viṣakanyā (विषकन्या)',
      supportingSources: ['Phaladīpikā Ch. 10 v. 22', 'Sārāvalī Ch. 35'],
    },
    definition: 'Specific classical astrological alignments at birth: Saturday + 2nd Tithi + Kṛttikā, Tuesday + 7th Tithi + Śatabhiṣā, or Sunday + 12th Tithi + Āśleṣā Nakṣatra.',
    classicalEffects: 'High energetic intensity requiring careful matrimonial matching; classical cancellation occurs when 7th lord is strong or Jupiter occupies Lagna.',
    evaluate: (ctx) => {
      const vara = ctx.panchanga.vara.number; // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
      const tithi = ctx.panchanga.tithi.number % 15 || 15;
      const nak = ctx.panchanga.nakshatra.number; // 3: Krittika, 9: Ashlesha, 24: Shatabhisha

      // Alignment 1: Saturday (6) + 2nd Tithi (2) + Krittika (3)
      const c1 = vara === 6 && tithi === 2 && nak === 3;
      // Alignment 2: Tuesday (2) + 7th Tithi (7) + Shatabhisha (24)
      const c2 = vara === 2 && tithi === 7 && nak === 24;
      // Alignment 3: Sunday (0) + 12th Tithi (12) + Ashlesha (9)
      const c3 = vara === 0 && tithi === 12 && nak === 9;

      if (c1 || c2 || c3) {
        const jup = ctx.planets.jupiter;
        const jupInLagna = jup?.house === 1;

        const conditions = [
          c1 ? 'Born on Saturday + Dvitīyā Tithi + Kṛttikā Nakṣatra' : c2 ? 'Born on Tuesday + Saptamī Tithi + Śatabhiṣā Nakṣatra' : 'Born on Sunday + Dvādaśī Tithi + Āśleṣā Nakṣatra',
        ];

        if (jupInLagna) {
          return {
            isPresent: true,
            formationStatus: 'Cancelled',
            severity: 'Cancelled',
            conditionsMet: conditions,
            exceptionsApplied: ['Jupiter in Ascendant (Lagna) completely cancels Viṣakanyā yoga'],
            involvedPlanets: ['jupiter'],
          };
        }

        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'High',
          conditionsMet: conditions,
          exceptionsApplied: [],
          involvedPlanets: [],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'dvi_kalatra_dosha',
    name: 'Dvi-Kalatra / Bahu-Kalatra Doṣa (द्विकलत्र दोष)',
    sanskritName: 'द्विकलत्र / बहुकलत्र दोष',
    transliteration: 'Dvi-Kalatra Doṣa',
    alternateNames: ['Multiple Marriage Affliction', 'Dual Spouse Indicator'],
    category: 'Marriage & Relationship Afflictions',
    subcategory: 'Marital Multiplicity',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'BPHS & Phaladīpikā',
      sanskritTextName: 'बृहत्पाराशर / फलदीपिका',
      chapter: 'BPHS Ch. 18 / PD Ch. 10',
      verseOrShloka: 'BPHS 18:1–8 / PD 10:11',
      sanskritShloka: 'द्वितीये सप्तमे वापि पापैर्युक्ते च संश्रिते । कलत्रद्वयमाप्नोति जातकस्तु न संशयः ॥',
      sanskritTerminology: 'Dvi-Kalatra (द्विकलत्र योग)',
      supportingSources: ['Sārāvalī Ch. 35 v. 18', 'Jātaka Pārijāta Ch. 14 v. 25'],
    },
    definition: 'The 2nd and 7th houses or their lords are occupied/aspected by multiple malefics while Venus is situated in a dual sign conjoined with malefics.',
    classicalEffects: 'Multiple significant relationships or prolonged courtship phases before settled commitment.',
    evaluate: (ctx) => {
      const lord7Id = getHouseLord(7, ctx.lagnaRashi);
      const lord2Id = getHouseLord(2, ctx.lagnaRashi);
      const venus = ctx.planets.venus;
      if (!venus) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      const maleficsIn7 = NATURAL_MALEFICS.filter((m) => ctx.planets[m]?.house === 7);
      const maleficsIn2 = NATURAL_MALEFICS.filter((m) => ctx.planets[m]?.house === 2);
      const venusInDual = [3, 6, 9, 12].includes(venus.rashiNumber);

      if ((maleficsIn7.length >= 2 || (maleficsIn7.length > 0 && maleficsIn2.length > 0)) && venusInDual) {
        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'Medium',
          conditionsMet: [
            `2nd & 7th houses afflicted by malefics: ${[...maleficsIn7, ...maleficsIn2].join(', ').toUpperCase()}`,
            `Venus situated in Dual Rāśi (${venus.rashiName})`,
          ],
          exceptionsApplied: [],
          involvedPlanets: [lord7Id, lord2Id, 'venus', ...maleficsIn7, ...maleficsIn2],
          involvedHouses: [2, 7, venus.house],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
];

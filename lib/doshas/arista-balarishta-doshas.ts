/**
 * Gaṇaka — Classical Ariṣṭa & Bālarishta Dosha Database
 * Primary Sources: BPHS Ch. 9 (Ariṣṭa) & Ch. 10 (Ariṣṭa Bhaṅga), Bṛhat Jātaka Ch. 6,
 * Sārāvalī Ch. 10–11, Phaladīpikā Ch. 13, Jātaka Pārijāta Ch. 4
 */

import { PlanetId } from '../astronomy/ephemeris';
import { DoshaDefinition } from './dosha-types';
import {
  NATURAL_MALEFICS,
  NATURAL_BENEFICS,
  getHouseLord,
  getAspectingPlanets,
  isDusthana,
  isKendra,
  isExalted,
  isOwnSign,
} from './dosha-utils';

export const CLASSICAL_ARISTA_DOSHAS: DoshaDefinition[] = [
  {
    id: 'chandra_arista',
    name: 'Candra-Ariṣṭa (Dusthāna Moon Affliction)',
    sanskritName: 'चन्द्रारिष्ट दोष',
    transliteration: 'Candrāriṣṭa Doṣa',
    alternateNames: ['Lunar Natal Affliction', 'Bālarishta Candra'],
    category: 'Ariṣṭa & Bālarishta',
    subcategory: 'Natal Vulnerability',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'BPHS & Bṛhat Jātaka',
      sanskritTextName: 'बृहत्पाराशर होराशास्त्रम् / बृहज्जातकम्',
      chapter: 'BPHS Ch. 9 / BJ Ch. 6',
      verseOrShloka: 'BPHS 9:3–6 / BJ 6:1',
      sanskritShloka: 'षष्ठाष्टमे व्यये चन्द्रे पापदृष्टे च संश्रिते । जातस्य मरणं ब्रूयात् शुभदृग्विवर्जिते ॥',
      sanskritTerminology: 'Candrāriṣṭa (चन्द्रारिष्ट)',
      supportingSources: ['Sārāvalī Ch. 10 v. 4', 'Phaladīpikā Ch. 13 v. 2', 'Jātaka Pārijāta Ch. 4 v. 5'],
    },
    cancellationRules: [
      {
        id: 'guru_in_kendra',
        title: 'Jupiter in Kendra (Ariṣṭa Bhaṅga)',
        sanskritTitle: 'गुरु केन्द्रगत अरिष्टभङ्ग',
        sourceText: 'BPHS Ch. 10',
        chapterAndVerse: 'v. 1',
        sanskritShloka: 'एकोऽपि देवपूज्यः केन्द्रगतो हन्ति सर्वदोषगणान् ।',
        description: 'Strong Jupiter in any Kendra (1, 4, 7, 10) cancels hundreds of Ariṣṭa afflictions just as reverent salutation to Shiva destroys all sins.',
        conditionMetDescription: 'Jupiter is placed in 1st, 4th, 7th, or 10th house.',
      },
      {
        id: 'purna_chandra_shubha_drishti',
        title: 'Full Moon / Benefic Aspect',
        sourceText: 'Bṛhat Jātaka',
        chapterAndVerse: 'Ch. 6 v. 11',
        description: 'If the Moon is aspected by powerful benefics (Jupiter or Venus), the Ariṣṭa is converted into long life.',
        conditionMetDescription: 'Moon receives direct aspect from Jupiter or Venus.',
      },
    ],
    definition: 'The natal Moon is situated in a Dusthāna (6th, 8th, or 12th house) and is aspected by or conjoined with natural malefics, devoid of strong benefic aspect.',
    classicalEffects: 'Health sensitivity in infancy or childhood, constitutional fragility, and maternal health concerns during early development.',
    evaluate: (ctx) => {
      const moon = ctx.planets.moon;
      if (!moon) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      const inDusthana = isDusthana(moon.house);
      if (!inDusthana) {
        return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
      }

      // Check malefic conjunction or aspect
      const aspecting = getAspectingPlanets(moon.house, ctx.planets);
      const maleficsAspectingOrConj = NATURAL_MALEFICS.filter(
        (m) => ctx.planets[m]?.house === moon.house || aspecting.includes(m)
      );

      if (maleficsAspectingOrConj.length === 0) {
        return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
      }

      // Check classical Ariṣṭa Bhaṅga (Jupiter in Kendra)
      const jup = ctx.planets.jupiter;
      const jupInKendra = jup && isKendra(jup.house);
      const beneficsAspectingMoon = ['jupiter', 'venus'].filter((b) => aspecting.includes(b as PlanetId));

      const conditions = [
        `Moon placed in Dusthāna house (${moon.house}th house)`,
        `Moon afflicted by malefic(s): ${maleficsAspectingOrConj.join(', ').toUpperCase()}`,
      ];

      if (jupInKendra || beneficsAspectingMoon.length > 0) {
        const exceptions: string[] = [];
        if (jupInKendra) exceptions.push('Jupiter in Kendra (House ' + jup.house + ') grants paramount Ariṣṭa Bhaṅga protection (BPHS 10:1)');
        if (beneficsAspectingMoon.length > 0) exceptions.push(`Moon receives protective dṛṣṭi from ${beneficsAspectingMoon.join(', ').toUpperCase()}`);

        return {
          isPresent: true,
          formationStatus: 'Cancelled',
          severity: 'Cancelled',
          conditionsMet: conditions,
          exceptionsApplied: exceptions,
          involvedPlanets: ['moon', ...maleficsAspectingOrConj],
          involvedHouses: [moon.house],
          classicalNotes: 'Classical Ariṣṭa Bhaṅga rules completely neutralize the early health fragility, conferring resilience and longevity.',
        };
      }

      return {
        isPresent: true,
        formationStatus: 'Formed',
        severity: 'High',
        conditionsMet: conditions,
        exceptionsApplied: [],
        involvedPlanets: ['moon', ...maleficsAspectingOrConj],
        involvedHouses: [moon.house],
      };
    },
  },
  {
    id: 'lagna_balarishta',
    name: 'Lagneśa Dusthāna Bālarishta',
    sanskritName: 'लग्नेश दुःस्थान बालारिष्ट',
    transliteration: 'Lagneśa Dusthāna Bālarishta',
    alternateNames: ['Ascendant Lord Affliction', 'Lagna Ariṣṭa'],
    category: 'Ariṣṭa & Bālarishta',
    subcategory: 'Natal Vulnerability',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'Bṛhat Parāśara Horā Śāstra',
      sanskritTextName: 'बृहत्पाराशर होराशास्त्रम्',
      chapter: 'BPHS Ch. 9',
      verseOrShloka: 'v. 7–9',
      sanskritShloka: 'लग्नेशे रन्ध्रगे पापैर्युते दृष्टेऽथवा सति । बालस्य जायते पीडा यदि नैवात्र शोभनम् ॥',
      sanskritTerminology: 'Lagneśa Ariṣṭa (लग्नेशारिष्ट)',
      supportingSources: ['Sārāvalī Ch. 10 v. 12', 'Phaladīpikā Ch. 13 v. 6'],
    },
    definition: 'The Ascendant lord (Lagneśa) is situated in the 8th or 6th house, conjoined with or aspected by natural malefics, without strong benefic intervention.',
    classicalEffects: 'Physical vitality challenges in formative years, sensitive digestion, and recurrent fatigue until puberty.',
    evaluate: (ctx) => {
      const lagneshaId = getHouseLord(1, ctx.lagnaRashi);
      const lagnesha = ctx.planets[lagneshaId];
      if (!lagnesha) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      if (lagnesha.house === 8 || lagnesha.house === 6) {
        const aspecting = getAspectingPlanets(lagnesha.house, ctx.planets);
        const malefics = NATURAL_MALEFICS.filter(
          (m) => m !== lagneshaId && (ctx.planets[m]?.house === lagnesha.house || aspecting.includes(m))
        );

        if (malefics.length > 0) {
          const conditions = [
            `Lagneśa (${lagnesha.sanskritName}) resides in ${lagnesha.house}th house`,
            `Lagneśa afflicted by ${malefics.join(', ').toUpperCase()}`,
          ];

          // Cancellation: Lagneśa exalted or Jupiter in Kendra
          const jupInKendra = ctx.planets.jupiter && isKendra(ctx.planets.jupiter.house);
          const lagneshaStrong = isExalted(lagneshaId, lagnesha.rashiNumber) || isOwnSign(lagneshaId, lagnesha.rashiNumber);

          if (jupInKendra || lagneshaStrong) {
            return {
              isPresent: true,
              formationStatus: 'Mitigated',
              severity: 'Low',
              conditionsMet: conditions,
              exceptionsApplied: [
                lagneshaStrong ? `Lagneśa is intrinsically strong (${lagnesha.rashiName})` : 'Jupiter in Kendra shields the bodily constitution',
              ],
              involvedPlanets: [lagneshaId, ...malefics],
              involvedHouses: [lagnesha.house],
            };
          }

          return {
            isPresent: true,
            formationStatus: 'Formed',
            severity: 'High',
            conditionsMet: conditions,
            exceptionsApplied: [],
            involvedPlanets: [lagneshaId, ...malefics],
            involvedHouses: [lagnesha.house],
          };
        }
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'matri_arista',
    name: 'Mātṛ-Ariṣṭa (Maternal Health Affliction)',
    sanskritName: 'मात्ररिष्ट दोष',
    transliteration: 'Mātṛ-Ariṣṭa Doṣa',
    alternateNames: ['Maternal Affliction', '4th Bhava Ariṣṭa'],
    category: 'Ariṣṭa & Bālarishta',
    subcategory: 'Kinship Affliction',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'Phaladīpikā & BPHS',
      sanskritTextName: 'फलदीपिका / बृहत्पाराशर',
      chapter: 'PD Ch. 13 / BPHS Ch. 9',
      verseOrShloka: 'PD 13:16 / BPHS 9:18–20',
      sanskritShloka: 'पापैश्चतुर्थगेर्युक्ते चन्द्रे पापान्वितेऽपि वा । मातृनाशो भवेत्तूर्णम् अरिष्टे सम्प्रवर्तिते ॥',
      sanskritTerminology: 'Mātṛ-Ariṣṭa (मात्ररिष्ट)',
      supportingSources: ['Jātaka Pārijāta Ch. 4 v. 22', 'Sārāvalī Ch. 10'],
    },
    definition: 'The 4th house and 4th lord are occupied or aspected by malefics while the natural significator for mother (Moon) is placed in 6th, 8th, or 12th.',
    classicalEffects: 'Health vulnerability for mother during native’s early years, physical distance from maternal nurture, or maternal hardships.',
    evaluate: (ctx) => {
      const lord4Id = getHouseLord(4, ctx.lagnaRashi);
      const lord4 = ctx.planets[lord4Id];
      const moon = ctx.planets.moon;
      if (!lord4 || !moon) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      const maleficsIn4 = NATURAL_MALEFICS.filter((m) => ctx.planets[m]?.house === 4);
      const moonInDusthana = isDusthana(moon.house);

      if (maleficsIn4.length > 0 && moonInDusthana) {
        const conditions = [
          `4th house afflicted by malefic(s): ${maleficsIn4.join(', ').toUpperCase()}`,
          `Natural maternal karaka Moon situated in Dusthāna (${moon.house}th house)`,
        ];

        // Exception: Venus or Jupiter aspecting 4th or Moon
        const beneficsAspect4 = getAspectingPlanets(4, ctx.planets).filter((b) => ['jupiter', 'venus'].includes(b));
        if (beneficsAspect4.length > 0) {
          return {
            isPresent: true,
            formationStatus: 'Mitigated',
            severity: 'Low',
            conditionsMet: conditions,
            exceptionsApplied: [`Benefic aspect on 4th house by ${beneficsAspect4.join(', ')} shields maternal longevity`],
            involvedPlanets: [lord4Id, 'moon', ...maleficsIn4],
            involvedHouses: [4, moon.house],
          };
        }

        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'Medium',
          conditionsMet: conditions,
          exceptionsApplied: [],
          involvedPlanets: [lord4Id, 'moon', ...maleficsIn4],
          involvedHouses: [4, moon.house],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'pitri_arista',
    name: 'Pitṛ-Ariṣṭa (Paternal Health Affliction)',
    sanskritName: 'पित्ररिष्ट दोष',
    transliteration: 'Pitṛ-Ariṣṭa Doṣa',
    alternateNames: ['Paternal Affliction', '9th Bhava Ariṣṭa'],
    category: 'Ariṣṭa & Bālarishta',
    subcategory: 'Kinship Affliction',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'BPHS & Phaladīpikā',
      sanskritTextName: 'बृहत्पाराशर / फलदीपिका',
      chapter: 'BPHS Ch. 9 / PD Ch. 13',
      verseOrShloka: 'BPHS 9:22–24 / PD 13:18',
      sanskritShloka: 'नवमे पापसंयुक्ते सूर्ये पापान्वितेऽपि वा । पितुरिष्टं विजानीयात् शुभदृष्टिविवर्जिते ॥',
      sanskritTerminology: 'Pitṛ-Ariṣṭa (पित्ररिष्ट)',
      supportingSources: ['Sārāvalī Ch. 10 v. 28'],
    },
    definition: 'The 9th house and 9th lord are occupied/aspected by malefics while the natural significator for father (Sun) is afflicted in 6th, 8th, or 12th.',
    classicalEffects: 'Health vulnerability for father in native’s childhood, strained early relations with father, or father experiencing intense professional stress.',
    evaluate: (ctx) => {
      const lord9Id = getHouseLord(9, ctx.lagnaRashi);
      const sun = ctx.planets.sun;
      if (!sun) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      const maleficsIn9 = NATURAL_MALEFICS.filter((m) => ctx.planets[m]?.house === 9);
      const sunInDusthana = isDusthana(sun.house);

      if (maleficsIn9.length > 0 && sunInDusthana) {
        const conditions = [
          `9th house occupied by malefic(s): ${maleficsIn9.join(', ').toUpperCase()}`,
          `Father karaka Sun in Dusthāna (${sun.house}th house)`,
        ];

        const beneficsAspect9 = getAspectingPlanets(9, ctx.planets).filter((b) => ['jupiter', 'venus'].includes(b));
        if (beneficsAspect9.length > 0 || isExalted('sun', sun.rashiNumber)) {
          return {
            isPresent: true,
            formationStatus: 'Mitigated',
            severity: 'Low',
            conditionsMet: conditions,
            exceptionsApplied: ['Protective benefic dṛṣṭi or exalted Sun preserves paternal vitality'],
            involvedPlanets: [lord9Id, 'sun', ...maleficsIn9],
            involvedHouses: [9, sun.house],
          };
        }

        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'Medium',
          conditionsMet: conditions,
          exceptionsApplied: [],
          involvedPlanets: [lord9Id, 'sun', ...maleficsIn9],
          involvedHouses: [9, sun.house],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
];

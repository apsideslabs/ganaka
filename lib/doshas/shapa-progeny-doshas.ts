/**
 * Gaṇaka — Classical Śāpa & Progeny Afflictions Database
 * Primary Source: Bṛhat Parāśara Horā Śāstra Chapter 83 (Śāpa Adhyāya) & Phaladīpikā Ch. 12
 */

import { DoshaDefinition } from './dosha-types';
import {
  NATURAL_MALEFICS,
  NATURAL_BENEFICS,
  getHouseLord,
  getAspectingPlanets,
  isDusthana,
  isExalted,
} from './dosha-utils';

export const CLASSICAL_SHAPA_DOSHAS: DoshaDefinition[] = [
  {
    id: 'sarpa_shapa',
    name: 'Sarpa Śāpa (Curse of the Serpents)',
    sanskritName: 'सर्प शाप (नाग दोष)',
    transliteration: 'Sarpa Śāpa Doṣa',
    alternateNames: ['Nāga Doṣa', 'Serpent Curse on Progeny'],
    category: 'Śāpa Classifications (BPHS Ch. 83)',
    subcategory: 'Karmic Debt on Progeny',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'Bṛhat Parāśara Horā Śāstra',
      sanskritTextName: 'बृहत्पाराशर होराशास्त्रम्',
      chapter: 'BPHS Ch. 83 (Śāpa Adhyāya)',
      verseOrShloka: 'v. 1–13',
      sanskritShloka: 'सुतभावगते राहौ भौमदृष्टेऽथवा युते । सर्पशापात् सुतध्वंसं प्रवदन्ति मनीषिणः ॥',
      sanskritTerminology: 'Sarpa Śāpa (सर्पशाप)',
      supportingSources: ['Phaladīpikā Ch. 12 v. 14', 'Jātaka Pārijāta Ch. 13 v. 18'],
    },
    definition: 'Rāhu occupies the 5th house conjoined or aspected by Mars, or Mars is in the 5th house aspected by Rāhu, or the 5th lord is conjoined with Rāhu without strong benefic aspect.',
    classicalEffects: 'Delays or complications in lineage continuation, recurring obstacles in progeny, resolved through dedicated spiritual discipline and Nāga propitiation.',
    evaluate: (ctx) => {
      const lord5Id = getHouseLord(5, ctx.lagnaRashi);
      const lord5 = ctx.planets[lord5Id];
      const rahu = ctx.planets.rahu;
      const mars = ctx.planets.mars;
      if (!rahu || !mars) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      const rahuIn5 = rahu.house === 5;
      const marsIn5 = mars.house === 5;
      const lord5WithRahu = lord5 && lord5.house === rahu.house;

      const marsAspects5 = getAspectingPlanets(5, ctx.planets).includes('mars');
      const rahuAspects5 = getAspectingPlanets(5, ctx.planets).includes('rahu');

      if ((rahuIn5 && (marsIn5 || marsAspects5)) || (marsIn5 && rahuAspects5) || (lord5WithRahu && marsAspects5)) {
        const jup = ctx.planets.jupiter;
        const jupAspects5 = jup && getAspectingPlanets(5, ctx.planets).includes('jupiter');

        const conditions = [
          rahuIn5 ? 'Rāhu occupies 5th house' : 'Mars occupies 5th with nodal aspect',
          marsAspects5 || marsIn5 ? 'Mars conjunct or casting 4/7/8 dṛṣṭi on 5th house' : '5th lord conjoined with Rāhu',
        ];

        if (jupAspects5 || isExalted('jupiter', jup?.rashiNumber || 1)) {
          return {
            isPresent: true,
            formationStatus: 'Mitigated',
            severity: 'Low',
            conditionsMet: conditions,
            exceptionsApplied: ['Divine Jupiter aspect on 5th house neutralizes the Sarpa affliction'],
            involvedPlanets: ['rahu', 'mars', lord5Id, 'jupiter'],
            involvedHouses: [5],
          };
        }

        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'High',
          conditionsMet: conditions,
          exceptionsApplied: [],
          involvedPlanets: ['rahu', 'mars', lord5Id],
          involvedHouses: [5],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'pitri_shapa',
    name: 'Pitṛ Śāpa (Curse of the Ancestors / Father)',
    sanskritName: 'पितृ शाप दोष',
    transliteration: 'Pitṛ Śāpa Doṣa',
    alternateNames: ['Paternal Ancestral Curse', 'Solar Curse on 5th House'],
    category: 'Śāpa Classifications (BPHS Ch. 83)',
    subcategory: 'Karmic Debt on Progeny',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'BPHS',
      sanskritTextName: 'बृहत्पाराशर होराशास्त्रम्',
      chapter: 'BPHS Ch. 83',
      verseOrShloka: 'v. 14–22',
      sanskritShloka: 'सूर्यः सुतगतो मन्दराहुयुक्तेक्षितो यदि । पितृशापात् सुतक्षोभं प्रवदन्ति पुरातनाः ॥',
      sanskritTerminology: 'Pitṛ Śāpa (पितृशाप)',
      supportingSources: ['Phaladīpikā Ch. 12 v. 16'],
    },
    definition: 'The Sun occupies the 5th house in debilitation (Libra) or is conjoined/aspected by Saturn or Rahu, or the 9th lord is in the 5th house heavily afflicted by malefics.',
    classicalEffects: 'Delays in progeny, heavy sense of ancestral responsibility, filial obligations requiring sincere ancestral tarpaṇa and honouring elders.',
    evaluate: (ctx) => {
      const sun = ctx.planets.sun;
      const sat = ctx.planets.saturn;
      const rahu = ctx.planets.rahu;
      const lord9Id = getHouseLord(9, ctx.lagnaRashi);
      const lord9 = ctx.planets[lord9Id];
      if (!sun) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      const sunIn5 = sun.house === 5;
      const sunAfflicted = sunIn5 && (sun.rashiNumber === 7 || sun.rashiNumber === sat?.rashiNumber || sun.rashiNumber === rahu?.rashiNumber);
      const lord9In5Afflicted = lord9?.house === 5 && (lord9.rashiNumber === sat?.rashiNumber || lord9.rashiNumber === rahu?.rashiNumber);

      if (sunAfflicted || lord9In5Afflicted) {
        const jup = ctx.planets.jupiter;
        const jupAspects5 = jup && getAspectingPlanets(5, ctx.planets).includes('jupiter');

        const conditions = [
          sunIn5 ? `Sun occupies 5th house with malefic affliction (${sun.rashiName})` : '9th lord in 5th house afflicted by Saturn/Rāhu',
        ];

        if (jupAspects5) {
          return {
            isPresent: true,
            formationStatus: 'Mitigated',
            severity: 'Low',
            conditionsMet: conditions,
            exceptionsApplied: ['Jupiter dṛṣṭi mitigates paternal curse and restores ancestral blessings'],
            involvedPlanets: ['sun', lord9Id, 'jupiter'],
            involvedHouses: [5],
          };
        }

        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'High',
          conditionsMet: conditions,
          exceptionsApplied: [],
          involvedPlanets: ['sun', lord9Id],
          involvedHouses: [5],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'matri_shapa',
    name: 'Mātṛ Śāpa (Curse of the Mother)',
    sanskritName: 'मातृ शाप दोष',
    transliteration: 'Mātṛ Śāpa Doṣa',
    alternateNames: ['Maternal Curse on Progeny'],
    category: 'Śāpa Classifications (BPHS Ch. 83)',
    subcategory: 'Karmic Debt on Progeny',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'BPHS',
      sanskritTextName: 'बृहत्पाराशर होराशास्त्रम्',
      chapter: 'BPHS Ch. 83',
      verseOrShloka: 'v. 23–30',
      sanskritShloka: 'चन्द्रे सुतगते पापैर्युक्ते वा वीक्षितेऽपि वा । मातृशापात् सुतस्याप्तिर्न भवेत् सर्वथा नृणाम् ॥',
      sanskritTerminology: 'Mātṛ Śāpa (मातृशाप)',
      supportingSources: ['Phaladīpikā Ch. 12 v. 18'],
    },
    definition: 'The Moon occupies the 5th house conjoined or aspected by Saturn and Mars, or the 4th lord is placed in the 8th house while the 5th lord is afflicted.',
    classicalEffects: 'Delays in family expansion, emotional friction with mother, rectified by dedicated maternal care and charitable acts.',
    evaluate: (ctx) => {
      const moon = ctx.planets.moon;
      const sat = ctx.planets.saturn;
      const mars = ctx.planets.mars;
      const lord4Id = getHouseLord(4, ctx.lagnaRashi);
      const lord4 = ctx.planets[lord4Id];
      if (!moon) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      const moonIn5Afflicted = moon.house === 5 && (moon.rashiNumber === sat?.rashiNumber || moon.rashiNumber === mars?.rashiNumber || moon.rashiNumber === 8);
      const lord4In8 = lord4?.house === 8;

      if (moonIn5Afflicted || (lord4In8 && moon.house === 5)) {
        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'High',
          conditionsMet: [
            moonIn5Afflicted ? `Moon in 5th house afflicted by Mars/Saturn or debilitated in ${moon.rashiName}` : '4th lord in 8th house with Moon in 5th',
          ],
          exceptionsApplied: [],
          involvedPlanets: ['moon', lord4Id],
          involvedHouses: [5],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'brahma_guru_shapa',
    name: 'Brahma / Guru Śāpa (Curse of the Preceptor)',
    sanskritName: 'ब्रह्म / गुरु शाप दोष',
    transliteration: 'Brahma / Guru Śāpa Doṣa',
    alternateNames: ['Preceptor / Sage Curse', 'Brahmin Curse'],
    category: 'Śāpa Classifications (BPHS Ch. 83)',
    subcategory: 'Karmic Debt on Progeny',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'BPHS',
      sanskritTextName: 'बृहत्पाराशर होराशास्त्रम्',
      chapter: 'BPHS Ch. 83',
      verseOrShloka: 'v. 45–52',
      sanskritShloka: 'जीवे सुतगते मन्दराहुयुक्तेक्षिते तथा । विप्रशापात् सुतप्राप्तौ विघ्नं विद्याद्विचक्षणः ॥',
      sanskritTerminology: 'Brahma / Guru Śāpa (ब्रह्मशाप)',
      supportingSources: ['Phaladīpikā Ch. 12 v. 22'],
    },
    definition: 'Jupiter occupies the 5th house conjoined or aspected by Saturn and Rahu, or Jupiter is in 8th/6th house conjoined with malefics while 5th house is afflicted.',
    classicalEffects: 'Philosophical or educational tests, delays in progeny, mitigated by honoring teachers, scriptures, and spiritual preceptors.',
    evaluate: (ctx) => {
      const jup = ctx.planets.jupiter;
      const sat = ctx.planets.saturn;
      const rahu = ctx.planets.rahu;
      if (!jup) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      const jupIn5Afflicted = jup.house === 5 && (jup.rashiNumber === sat?.rashiNumber || jup.rashiNumber === rahu?.rashiNumber || jup.rashiNumber === 10);
      const jupInDusthanaAfflicted = isDusthana(jup.house) && (jup.rashiNumber === sat?.rashiNumber || jup.rashiNumber === rahu?.rashiNumber);

      if (jupIn5Afflicted || jupInDusthanaAfflicted) {
        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'High',
          conditionsMet: [
            jupIn5Afflicted ? `Jupiter in 5th house afflicted by Saturn/Rāhu or debilitated in ${jup.rashiName}` : `Jupiter in Dusthāna (${jup.house}th house) afflicted by nodes/Saturn`,
          ],
          exceptionsApplied: [],
          involvedPlanets: ['jupiter', 'saturn', 'rahu'],
          involvedHouses: [jup.house],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'putra_bhava_arista',
    name: 'Putra-Bhāva Ariṣṭa (Santāna Pratibandha)',
    sanskritName: 'पुत्रभाव अरिष्ट (सन्तान प्रतिबन्ध)',
    transliteration: 'Putra-Bhāva Ariṣṭa',
    alternateNames: ['5th House Progeny Affliction', 'Santāna Doṣa'],
    category: 'Progeny & Santāna Afflictions',
    subcategory: 'House & Lord Affliction',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'Phaladīpikā & BPHS',
      sanskritTextName: 'फलदीपिका / बृहत्पाराशर',
      chapter: 'PD Ch. 12 / BPHS Ch. 16',
      verseOrShloka: 'PD 12:1–8 / BPHS 16:1–10',
      sanskritShloka: 'पञ्चमेशे रिपुस्थानगते पापैर्निरीक्षिते । कारकेऽपि तथाभूते पुत्रहानिर्विधीयते ॥',
      sanskritTerminology: 'Santāna Pratibandha (सन्तानप्रतिबन्ध)',
      supportingSources: ['Sārāvalī Ch. 34 v. 12', 'Jātaka Pārijāta Ch. 13'],
    },
    definition: 'The 5th house is occupied exclusively by natural malefics, the 5th lord is placed in a Dusthāna (6, 8, 12), and Putrakāraka Jupiter is weak or afflicted.',
    classicalEffects: 'Delays in conception, demanding parental journey, requiring persistent holistic health balance.',
    evaluate: (ctx) => {
      const lord5Id = getHouseLord(5, ctx.lagnaRashi);
      const lord5 = ctx.planets[lord5Id];
      const jup = ctx.planets.jupiter;
      if (!lord5 || !jup) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      const maleficsIn5 = NATURAL_MALEFICS.filter((m) => ctx.planets[m]?.house === 5);
      const lord5InDusthana = isDusthana(lord5.house);
      const jupWeak = isDusthana(jup.house) || jup.rashiNumber === 10;

      if (maleficsIn5.length > 0 && lord5InDusthana && jupWeak) {
        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'High',
          conditionsMet: [
            `5th house occupied by malefic(s): ${maleficsIn5.join(', ').toUpperCase()}`,
            `5th lord (${lord5.sanskritName}) in Dusthāna (${lord5.house}th house)`,
            `Putrakāraka Jupiter weak in ${jup.rashiName} (${jup.house}th house)`,
          ],
          exceptionsApplied: [],
          involvedPlanets: [lord5Id, 'jupiter', ...maleficsIn5],
          involvedHouses: [5, lord5.house, jup.house],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
];

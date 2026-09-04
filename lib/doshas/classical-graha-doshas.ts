/**
 * Gaṇaka — Classical Graha Afflictions & Dosha Database
 * Textual sources: BPHS, Bṛhat Jātaka, Sārāvalī, Phaladīpikā, Jātaka Pārijāta, Bṛhat Saṃhitā
 */

import { PlanetId } from '../astronomy/ephemeris';
import { DoshaDefinition } from './dosha-types';
import {
  NATURAL_MALEFICS,
  NATURAL_BENEFICS,
  checkPapaKartari,
  getAspectingPlanets,
  getAngularDistance,
  isExalted,
  isOwnSign,
} from './dosha-utils';

export const CLASSICAL_GRAHA_DOSHAS: DoshaDefinition[] = [
  {
    id: 'graha_yuddha',
    name: 'Graha Yuddha (Planetary War)',
    sanskritName: 'ग्रहयुद्ध दोष',
    transliteration: 'Graha Yuddha Doṣa',
    alternateNames: ['Planetary War Affliction', 'Tārā Graha Yuddha'],
    category: 'Graha Afflictions',
    subcategory: 'Planetary Combat',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'Bṛhat Saṃhitā & BPHS',
      sanskritTextName: 'बृहत्संहिता / बृहत्पाराशर होराशास्त्रम्',
      chapter: 'Bṛhat Saṃhitā Ch. 17 / BPHS Ch. 27',
      verseOrShloka: 'BS 17:1–4 / BPHS 27:1–8',
      sanskritShloka: 'युद्धं यदारविक्षोणीजादीनां स्यात् परस्परम् । एकराशिगता ह्येते लिप्तानां साम्यमागताः ॥',
      sanskritTerminology: 'Graha Yuddha (Bheda, Ullekha, Aṃśumarda, Apasavya)',
      supportingSources: ['Sūrya Siddhānta Ch. 7', 'Phaladīpikā Ch. 15 v. 14', 'Sārāvalī Ch. 5'],
    },
    definition: 'Two true classical non-luminary planets (Mars, Mercury, Jupiter, Venus, or Saturn) occupy the same zodiacal sign with longitudinal distance less than 1°00\'00" (60 arcminutes).',
    classicalEffects: 'The planet defeated in war (having lower northern declination/brightness) suffers total loss of auspicious potency (Yuddha-parājita), destabilizing the bhāvas it rules.',
    evaluate: (ctx) => {
      const taraGrahas: PlanetId[] = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'];
      const pairs: Array<{ p1: PlanetId; p2: PlanetId; dist: number }> = [];

      for (let i = 0; i < taraGrahas.length; i++) {
        for (let j = i + 1; j < taraGrahas.length; j++) {
          const p1 = ctx.planets[taraGrahas[i]];
          const p2 = ctx.planets[taraGrahas[j]];
          if (p1 && p2 && p1.rashiNumber === p2.rashiNumber) {
            const dist = getAngularDistance(p1.siderealLongitude, p2.siderealLongitude);
            if (dist <= 1.0) {
              pairs.push({ p1: taraGrahas[i], p2: taraGrahas[j], dist });
            }
          }
        }
      }

      if (pairs.length > 0) {
        const conditions: string[] = [];
        const involved: PlanetId[] = [];
        pairs.forEach((pair) => {
          conditions.push(
            `Graha Yuddha active between ${pair.p1.toUpperCase()} and ${pair.p2.toUpperCase()} (Separation: ${(pair.dist * 60).toFixed(1)} arcminutes in ${ctx.planets[pair.p1].rashiName})`
          );
          involved.push(pair.p1, pair.p2);
        });

        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'High',
          conditionsMet: conditions,
          exceptionsApplied: [],
          involvedPlanets: Array.from(new Set(involved)),
          involvedRashis: [ctx.planets[pairs[0].p1].rashiNumber],
          classicalNotes: 'The graha with higher northern declination or greater intrinsic brilliance is traditionally considered victor (Jayī), while the defeated graha requires careful compensatory assessment.',
        };
      }

      return {
        isPresent: false,
        formationStatus: 'Not Formed',
        severity: 'Low',
        conditionsMet: [],
        exceptionsApplied: [],
        involvedPlanets: [],
      };
    },
  },
  {
    id: 'papa_kartari_lagna',
    name: 'Pāpa Kartarī of Lagna',
    sanskritName: 'लग्न पापकर्तरी दोष',
    transliteration: 'Lagna Pāpa Kartarī Doṣa',
    alternateNames: ['Ascendant Scissor Affliction', 'Lagna Bandhana'],
    category: 'Graha Afflictions',
    subcategory: 'Hemming Affliction',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'Phaladīpikā',
      sanskritTextName: 'फलदीपिका',
      chapter: 'Phaladīpikā Ch. 6',
      verseOrShloka: 'v. 11',
      sanskritShloka: 'पापैर्व्ययारिगेर्लग्नात् पापकर्तरिसंज्ञितः । शुभैस्तु शुभकर्तर्यां राजयोगसमो मतः ॥',
      sanskritTerminology: 'Pāpa Kartarī (पापकर्तरी)',
      supportingSources: ['BPHS Ch. 12 v. 4', 'Jātaka Pārijāta Ch. 6 v. 10'],
    },
    cancellationRules: [
      {
        id: 'benefic_in_lagna',
        title: 'Benefic in Lagna / Lagneśa in Kendra',
        sourceText: 'Phaladīpikā',
        chapterAndVerse: 'Ch. 6 v. 13',
        description: 'If a strong natural benefic occupies the 1st house or casts direct aspect on Lagna, the severe scissor effect is mitigated.',
        conditionMetDescription: 'Natural benefic occupies or aspects Lagna directly.',
      },
    ],
    definition: 'The Ascendant (1st house) is hemmed between natural malefics in the 12th house and 2nd house without conjunct or intervening benefics.',
    classicalEffects: 'Creates early-life physical vulnerability, feelings of psychological restriction, obstacles in self-actualization, and chronic exertion.',
    evaluate: (ctx) => {
      const { isPapaKartari, prevMalefics, nextMalefics } = checkPapaKartari(1, ctx.planets);
      if (!isPapaKartari) {
        return {
          isPresent: false,
          formationStatus: 'Not Formed',
          severity: 'Low',
          conditionsMet: [],
          exceptionsApplied: [],
          involvedPlanets: [],
        };
      }

      // Check benefic in Lagna
      const beneficsInLagna = NATURAL_BENEFICS.filter((b) => ctx.planets[b]?.house === 1);
      const aspectingPlanets = getAspectingPlanets(1, ctx.planets);
      const beneficsAspecting = aspectingPlanets.filter((b) => NATURAL_BENEFICS.includes(b));

      const conditions = [
        `12th house occupied by natural malefic(s): ${prevMalefics.join(', ').toUpperCase()}`,
        `2nd house occupied by natural malefic(s): ${nextMalefics.join(', ').toUpperCase()}`,
      ];

      if (beneficsInLagna.length > 0 || beneficsAspecting.length > 0) {
        const exceptions = [
          beneficsInLagna.length > 0
            ? `Benefic in 1st house (${beneficsInLagna.join(', ')}) provides protective cushion`
            : `Benefic aspect on 1st house (${beneficsAspecting.join(', ')}) mitigates hemmed confinement`,
        ];
        return {
          isPresent: true,
          formationStatus: 'Mitigated',
          severity: 'Low',
          conditionsMet: conditions,
          exceptionsApplied: exceptions,
          involvedPlanets: [...prevMalefics, ...nextMalefics, ...beneficsInLagna],
          involvedHouses: [12, 1, 2],
          classicalNotes: 'Pāpa Kartarī is canonically mitigated by benefic presence/dṛṣṭi on the Ascendant.',
        };
      }

      return {
        isPresent: true,
        formationStatus: 'Formed',
        severity: 'High',
        conditionsMet: conditions,
        exceptionsApplied: [],
        involvedPlanets: [...prevMalefics, ...nextMalefics],
        involvedHouses: [12, 1, 2],
        classicalNotes: 'Classical texts recommend strengthening the Ascendant lord (Lagneśa) to break the obstructive scissor effect.',
      };
    },
  },
  {
    id: 'papa_kartari_moon',
    name: 'Pāpa Kartarī of Moon (Candra Bandhana)',
    sanskritName: 'चन्द्र पापकर्तरी दोष',
    transliteration: 'Candra Pāpa Kartarī Doṣa',
    alternateNames: ['Lunar Scissor Affliction', 'Moon Hemmed by Malefics'],
    category: 'Graha Afflictions',
    subcategory: 'Hemming Affliction',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'Jātaka Pārijāta',
      sanskritTextName: 'जातकपारिजातः',
      chapter: 'Jātaka Pārijāta Ch. 6',
      verseOrShloka: 'v. 12',
      sanskritShloka: 'चन्द्रात् पापैर्द्वादशगैर्द्वितीयाख्यैस्तु बन्धनम् । मनस्तापकरं नृणां रोगशोकविवर्धनम् ॥',
      sanskritTerminology: 'Candra Pāpakartarī (चन्द्र पापकर्तरी)',
      supportingSources: ['Phaladīpikā Ch. 6 v. 12', 'Sārāvalī Ch. 13'],
    },
    definition: 'The Moon is hemmed between natural malefics in the 12th and 2nd houses counting from the Moon’s own natal position.',
    classicalEffects: 'Mental turbulence, emotional anxiety, periodic melancholia, and maternal challenges during early childhood.',
    evaluate: (ctx) => {
      const moon = ctx.planets.moon;
      if (!moon) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      const moonHouse = moon.house;
      const prevHouse = moonHouse === 1 ? 12 : moonHouse - 1;
      const nextHouse = moonHouse === 12 ? 1 : moonHouse + 1;

      const prevMalefics = NATURAL_MALEFICS.filter((p) => ctx.planets[p]?.house === prevHouse);
      const nextMalefics = NATURAL_MALEFICS.filter((p) => ctx.planets[p]?.house === nextHouse);

      if (prevMalefics.length > 0 && nextMalefics.length > 0) {
        const jup = ctx.planets.jupiter;
        const jupAspects = jup && (jup.house === moonHouse || Math.abs(jup.house - moonHouse) === 4 || Math.abs(jup.house - moonHouse) === 8 || Math.abs(jup.house - moonHouse) === 6);

        const conditions = [
          `12th from Moon (House ${prevHouse}) occupied by ${prevMalefics.join(', ').toUpperCase()}`,
          `2nd from Moon (House ${nextHouse}) occupied by ${nextMalefics.join(', ').toUpperCase()}`,
        ];

        if (jupAspects) {
          return {
            isPresent: true,
            formationStatus: 'Mitigated',
            severity: 'Low',
            conditionsMet: conditions,
            exceptionsApplied: ['Jupiter conjunct or casting trikoṇa/7th aspect on Moon dissolves lunar distress'],
            involvedPlanets: ['moon', ...prevMalefics, ...nextMalefics, 'jupiter'],
            involvedHouses: [prevHouse, moonHouse, nextHouse],
          };
        }

        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'Medium',
          conditionsMet: conditions,
          exceptionsApplied: [],
          involvedPlanets: ['moon', ...prevMalefics, ...nextMalefics],
          involvedHouses: [prevHouse, moonHouse, nextHouse],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'angāraka_dosha',
    name: 'Aṅgāraka Doṣa (Kuja-Rāhu / Kuja-Ketu)',
    sanskritName: 'अङ्गारक दोष (भौम-राहु/केतु युति)',
    transliteration: 'Aṅgāraka Doṣa',
    alternateNames: ['Fiery Node Affliction', 'Mars-Rahu Conjunction'],
    category: 'Graha Afflictions',
    subcategory: 'Planetary Combustion & Nodes',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'Jātaka Pārijāta',
      sanskritTextName: 'जातकपारिजातः',
      chapter: 'Jātaka Pārijāta Ch. 8',
      verseOrShloka: 'v. 34–36',
      sanskritShloka: 'कुजेन राहुसंयुक्तो जातः क्रूरोऽतिसाहसी । वह्निचौरविषादिभ्यो भयं तस्य विनिर्दिशेत् ॥',
      sanskritTerminology: 'Aṅgāraka Yoga (अङ्गारक योग)',
      supportingSources: ['Phaladīpikā Ch. 15 v. 18', 'BPHS Ch. 83 v. 14'],
    },
    definition: 'Mars is in exact conjunction with Rahu or Ketu in the same rāśi/house, combining pure kinetic fire with shadowy obsession or erratic detachment.',
    classicalEffects: 'High impulsiveness, potential for burns or accidents, acute disputes with kin, and intense volatile energy requiring constructive channeling.',
    evaluate: (ctx) => {
      const mars = ctx.planets.mars;
      const rahu = ctx.planets.rahu;
      const ketu = ctx.planets.ketu;
      if (!mars || (!rahu && !ketu)) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      const withRahu = rahu && mars.rashiNumber === rahu.rashiNumber;
      const withKetu = ketu && mars.rashiNumber === ketu.rashiNumber;

      if (withRahu || withKetu) {
        const partner = withRahu ? 'rahu' : 'ketu';
        const partnerName = withRahu ? 'Rāhu' : 'Ketu';
        const jup = ctx.planets.jupiter;
        const jupAspects = jup && getAspectingPlanets(mars.house, ctx.planets).includes('jupiter');

        const conditions = [
          `Mars conjunct ${partnerName} in ${mars.rashiName} (House ${mars.house})`,
        ];

        if (jupAspects || isExalted('mars', mars.rashiNumber) || isOwnSign('mars', mars.rashiNumber)) {
          return {
            isPresent: true,
            formationStatus: 'Mitigated',
            severity: 'Low',
            conditionsMet: conditions,
            exceptionsApplied: [
              jupAspects ? 'Auspicious Jupiter dṛṣṭi tempers violent Martian impulses' : 'Mars in own sign / exaltation channels kinetic energy into constructive leadership',
            ],
            involvedPlanets: ['mars', partner as PlanetId],
            involvedHouses: [mars.house],
          };
        }

        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'High',
          conditionsMet: conditions,
          exceptionsApplied: [],
          involvedPlanets: ['mars', partner as PlanetId],
          involvedHouses: [mars.house],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'guru_chandala',
    name: 'Guru Cāṇḍāla Doṣa',
    sanskritName: 'गुरु चाण्डाल दोष',
    transliteration: 'Guru Cāṇḍāla Doṣa',
    alternateNames: ['Jupiter-Rahu Conjunction', 'Corrupted Preceptor Affliction'],
    category: 'Graha Afflictions',
    subcategory: 'Nodal Affliction of Benefics',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'Bṛhat Parāśara Horā Śāstra',
      sanskritTextName: 'बृहत्पाराशर होराशास्त्रम्',
      chapter: 'BPHS Ch. 83 (Śāpa Adhyāya)',
      verseOrShloka: 'v. 31–33',
      sanskritShloka: 'गुरौ राहुसमायुक्ते चाण्डालयोग ईरितः । धर्मबुद्धिविनाशः स्यात् पापकर्मरतो नरः ॥',
      sanskritTerminology: 'Guru Cāṇḍāla (गुरुचाण्डाल योग)',
      supportingSources: ['Jātaka Pārijāta Ch. 8 v. 40', 'Phaladīpikā Ch. 15 v. 22'],
    },
    definition: 'Jupiter (Guru) shares the same rāśi/house with Rāhu (or closely aspected by Rāhu within tight orb), casting a shadow on dharmic judgment.',
    classicalEffects: 'Unconventional belief systems, questioning orthodoxy, potential conflict with mentors, and spiritual tests before attaining genuine inner wisdom.',
    evaluate: (ctx) => {
      const jup = ctx.planets.jupiter;
      const rahu = ctx.planets.rahu;
      if (!jup || !rahu) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      if (jup.rashiNumber === rahu.rashiNumber) {
        const conditions = [
          `Jupiter conjunct Rāhu in ${jup.rashiName} (House ${jup.house})`,
        ];

        // Classical exceptions: Jupiter in own signs (Sagittarius/Pisces) or Exaltation (Cancer)
        if ([4, 9, 12].includes(jup.rashiNumber)) {
          return {
            isPresent: true,
            formationStatus: 'Mitigated',
            severity: 'Low',
            conditionsMet: conditions,
            exceptionsApplied: [
              `Jupiter is in sovereign dignity (${jup.rashiName}), subduing the toxic nodal influence and yielding profound philosophical research capacity`,
            ],
            involvedPlanets: ['jupiter', 'rahu'],
            involvedHouses: [jup.house],
            involvedRashis: [jup.rashiNumber],
          };
        }

        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'Medium',
          conditionsMet: conditions,
          exceptionsApplied: [],
          involvedPlanets: ['jupiter', 'rahu'],
          involvedHouses: [jup.house],
          involvedRashis: [jup.rashiNumber],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'shani_rahu_shraddha',
    name: 'Śani-Rāhu Śrāddha / Piśāca Doṣa',
    sanskritName: 'शनि-राहु युति (पिशाच/श्राद्ध दोष)',
    transliteration: 'Śani-Rāhu Piśāca Doṣa',
    alternateNames: ['Saturn-Rahu Conjunction', 'Nadi Nodal Curse'],
    category: 'Graha Afflictions',
    subcategory: 'Nodal Affliction of Malefics',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'Bṛhat Parāśara Horā Śāstra',
      sanskritTextName: 'बृहत्पाराशर होराशास्त्रम्',
      chapter: 'BPHS Ch. 83',
      verseOrShloka: 'v. 45–48',
      sanskritShloka: 'मन्दे राहुयुते लग्ने रिपुदोषः प्रजायते । प्रेतादिबाधा बाहुल्यं कार्यविघ्नानि सर्वदा ॥',
      sanskritTerminology: 'Preta / Piśāca Bādhā',
      supportingSources: ['Phaladīpikā Ch. 15 v. 25', 'Sarvārtha Cintāmaṇi Ch. 8'],
    },
    definition: 'Saturn and Rahu occupy the same rāśi/house, combining chronic karmic delays (Saturn) with amplifying illusion (Rahu).',
    classicalEffects: 'Unexplained psychological drag, sudden career reversals, heavy ancestral obligations, and recurrent structural roadblocks.',
    evaluate: (ctx) => {
      const sat = ctx.planets.saturn;
      const rahu = ctx.planets.rahu;
      if (!sat || !rahu) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      if (sat.rashiNumber === rahu.rashiNumber) {
        const conditions = [
          `Saturn conjunct Rāhu in ${sat.rashiName} (House ${sat.house})`,
        ];

        const jupAspects = getAspectingPlanets(sat.house, ctx.planets).includes('jupiter');
        if (jupAspects || isExalted('saturn', sat.rashiNumber) || [10, 11].includes(sat.rashiNumber)) {
          return {
            isPresent: true,
            formationStatus: 'Mitigated',
            severity: 'Low',
            conditionsMet: conditions,
            exceptionsApplied: [
              jupAspects ? 'Jupiter dṛṣṭi removes malefic stagnation' : 'Saturn in Capricorn/Aquarius/Libra transforms obstruction into massive endurance',
            ],
            involvedPlanets: ['saturn', 'rahu'],
            involvedHouses: [sat.house],
          };
        }

        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'High',
          conditionsMet: conditions,
          exceptionsApplied: [],
          involvedPlanets: ['saturn', 'rahu'],
          involvedHouses: [sat.house],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'surya_shani_virodha',
    name: 'Sūrya-Śani Saṃbandha (Pitṛ-Putra Virodha)',
    sanskritName: 'सूर्य-शनि विरोध दोष',
    transliteration: 'Sūrya-Śani Virodha Doṣa',
    alternateNames: ['Sun-Saturn Mutual Affliction', 'Father-Son Discord'],
    category: 'Graha Afflictions',
    subcategory: 'Planetary Enmity',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'Bṛhat Jātaka',
      sanskritTextName: 'बृहज्जातकम्',
      chapter: 'Bṛhat Jātaka Ch. 14',
      verseOrShloka: 'v. 3',
      sanskritShloka: 'रविशनिसमागमे स्यात् पितृसुतवैरं तथा मनस्तापः । अस्वास्थ्यं च शरीरे कार्येषु च मन्दता सतता ॥',
      sanskritTerminology: 'Sūrya-Śani Yoga',
      supportingSources: ['Sārāvalī Ch. 15 v. 8', 'Phaladīpikā Ch. 18 v. 7'],
    },
    definition: 'Sun and Saturn occupy the same rāśi or are in exact 1/7 opposition to each other, creating conflict between solar vitality/authority and Saturnian discipline/resistance.',
    classicalEffects: 'Tension with authority figures or father, internal conflict between pride and duty, and structural delays in bureaucratic recognition.',
    evaluate: (ctx) => {
      const sun = ctx.planets.sun;
      const sat = ctx.planets.saturn;
      if (!sun || !sat) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      const conjunct = sun.rashiNumber === sat.rashiNumber;
      const opposite = Math.abs(sun.house - sat.house) === 6;

      if (conjunct || opposite) {
        const conditions = [
          conjunct
            ? `Sun conjunct Saturn in ${sun.rashiName} (House ${sun.house})`
            : `Sun in House ${sun.house} mutually aspects Saturn in House ${sat.house}`,
        ];

        // Exceptions: Sun in Leo/Aries or Saturn in Libra/Aquarius
        const strongSun = isExalted('sun', sun.rashiNumber) || isOwnSign('sun', sun.rashiNumber);
        const strongSat = isExalted('saturn', sat.rashiNumber) || isOwnSign('saturn', sat.rashiNumber);

        if (strongSun || strongSat) {
          return {
            isPresent: true,
            formationStatus: 'Mitigated',
            severity: 'Low',
            conditionsMet: conditions,
            exceptionsApplied: [
              strongSun ? 'Sun possesses sovereign dignity (Aries/Leo)' : 'Saturn is exalted/swakshetra (Libra/Capricorn/Aquarius), harmonizing duties',
            ],
            involvedPlanets: ['sun', 'saturn'],
            involvedHouses: conjunct ? [sun.house] : [sun.house, sat.house],
          };
        }

        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'Medium',
          conditionsMet: conditions,
          exceptionsApplied: [],
          involvedPlanets: ['sun', 'saturn'],
          involvedHouses: conjunct ? [sun.house] : [sun.house, sat.house],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'kendra_hina_dosha',
    name: 'Kendra-Hīna / Kendra-Śūnya Affliction',
    sanskritName: 'केन्द्रहीन दोष (केन्द्रशून्यता)',
    transliteration: 'Kendra-Hīna Doṣa',
    alternateNames: ['Devoid Quadrants Affliction', 'Pāpa Kendra Yoga'],
    category: 'Graha Afflictions',
    subcategory: 'Structural Foundation',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'BPHS',
      sanskritTextName: 'बृहत्पाराशर होराशास्त्रम्',
      chapter: 'BPHS Ch. 13',
      verseOrShloka: 'v. 14–16',
      sanskritShloka: 'केन्द्रेषु शुभहीनेषु पापैरध्यासितेषु च । जीवनं क्लेशबहुलं भवति ध्रुवमेव हि ॥',
      sanskritTerminology: 'Kendra Hīnatva',
      supportingSources: ['Bṛhat Jātaka Ch. 11 v. 8', 'Sārāvalī Ch. 34'],
    },
    definition: 'All four Kendras (1st, 4th, 7th, 10th houses) are completely devoid of natural benefics while occupied predominantly by natural malefics.',
    classicalEffects: 'Lack of foundational pillars in life, high struggle in establishing stability, and requiring continuous self-generated effort.',
    evaluate: (ctx) => {
      const kendras = [1, 4, 7, 10];
      const beneficsInKendras: PlanetId[] = [];
      const maleficsInKendras: PlanetId[] = [];

      for (const [pId, p] of Object.entries(ctx.planets)) {
        if (kendras.includes(p.house)) {
          if (NATURAL_BENEFICS.includes(pId as PlanetId)) beneficsInKendras.push(pId as PlanetId);
          if (NATURAL_MALEFICS.includes(pId as PlanetId)) maleficsInKendras.push(pId as PlanetId);
        }
      }

      if (beneficsInKendras.length === 0 && maleficsInKendras.length >= 2) {
        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'High',
          conditionsMet: [
            'All 4 Kendras (1, 4, 7, 10) are devoid of natural benefics',
            `Kendras are afflicted by malefics: ${maleficsInKendras.join(', ').toUpperCase()}`,
          ],
          exceptionsApplied: [],
          involvedPlanets: maleficsInKendras,
          involvedHouses: kendras,
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
];

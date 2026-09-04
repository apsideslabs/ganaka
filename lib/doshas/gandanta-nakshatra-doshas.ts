/**
 * Gaṇaka — Classical Gandānta, Nakṣatra & Birth-Time Afflictions Database
 * Primary Sources: BPHS Ch. 84–90, Muhūrta Cintāmaṇi, Jātaka Pārijāta, Bṛhat Saṃhitā
 */

import { DoshaDefinition } from './dosha-types';
import { isKendra } from './dosha-utils';

export const GANDANTA_NAKSHATRA_DOSHAS: DoshaDefinition[] = [
  {
    id: 'nakshatra_gandanta',
    name: 'Nakṣatra Gandānta (नक्षत्र गण्डान्त)',
    sanskritName: 'नक्षत्र गण्डान्त दोष',
    transliteration: 'Nakṣatra Gandānta Doṣa',
    alternateNames: ['Lunar Junction Knot', 'Water-Fire Cusp Affliction'],
    category: 'Gandānta & Birth Defects',
    subcategory: 'Junctional Boundary Affliction',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'Bṛhat Parāśara Horā Śāstra',
      sanskritTextName: 'बृहत्पाराशर होराशास्त्रम्',
      chapter: 'BPHS Ch. 87',
      verseOrShloka: 'v. 1–8',
      sanskritShloka: 'रेवत्यश्विन्योराश्लेषामघयोर्ज्येष्ठामूलयोः । सन्धौ गण्डान्तमुद्दिष्टं सर्वकार्यविनाशनम् ॥',
      sanskritTerminology: 'Nakṣatra Gandānta (नक्षत्रगण्डान्त)',
      supportingSources: ['Muhūrta Cintāmaṇi Ch. 1 v. 38', 'Jātaka Pārijāta Ch. 4 v. 62'],
    },
    cancellationRules: [
      {
        id: 'shubha_drishti_gandanta',
        title: 'Jupiter / Venus Aspect on Moon',
        sourceText: 'Muhūrta Cintāmaṇi',
        chapterAndVerse: 'Ch. 1 v. 42',
        description: 'Direct aspect of unafflicted Jupiter on the Moon converts Gandānta into spiritual awakening and intellectual brilliance.',
        conditionMetDescription: 'Moon receives direct aspect from Jupiter.',
      },
    ],
    definition: 'The natal Moon is placed within the junction of Water-Fire zodiacal signs: Revatī (Pisces) to Aśvinī (Aries), Āśleṣā (Cancer) to Maghā (Leo), or Jyeṣṭha (Scorpio) to Mūla (Sagittarius), especially in the final or initial pāda (3°20\').',
    classicalEffects: 'High energetic sensitivity at birth, deep transformational life chapters, spiritual purification, and initial health fragility.',
    evaluate: (ctx) => {
      const moon = ctx.planets.moon;
      if (!moon) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      const gandantaPairs = [
        { name: 'Revatī–Aśvinī Gandānta (Mīna-Meṣa)', rashi1: 12, rashi2: 1, nak1: 26, nak2: 0 },
        { name: 'Āśleṣā–Maghā Gandānta (Karka-Siṃha)', rashi1: 4, rashi2: 5, nak1: 8, nak2: 9 },
        { name: 'Jyeṣṭha–Mūla Gandānta (Vṛścika-Dhanu)', rashi1: 8, rashi2: 9, nak1: 17, nak2: 18 },
      ];

      for (const pair of gandantaPairs) {
        // Ending of water rashi (26°40' to 30°00') in nakshatra 4th pada
        const inWaterEnd = moon.rashiNumber === pair.rashi1 && moon.nakshatraIndex === pair.nak1;
        // Beginning of fire rashi (0°00' to 3°20') in nakshatra 1st pada
        const inFireStart = moon.rashiNumber === pair.rashi2 && moon.nakshatraIndex === pair.nak2;

        if (inWaterEnd || inFireStart) {
          const pada = moon.pada;
          const isTightKnot = (inWaterEnd && pada === 4) || (inFireStart && pada === 1);
          const jup = ctx.planets.jupiter;
          const jupAspects = jup && Math.abs(jup.house - moon.house) === 4 || Math.abs(jup.house - moon.house) === 8 || Math.abs(jup.house - moon.house) === 6;

          const conditions = [
            `Moon resides in ${pair.name} junction (${moon.nakshatraName} Pada ${pada}, ${moon.degreeStr} in ${moon.rashiName})`,
            isTightKnot ? 'Exact terminal/initial Pada knot (Tīvra Gandānta)' : 'Nakṣatra junction orb active',
          ];

          if (jupAspects) {
            return {
              isPresent: true,
              formationStatus: 'Mitigated',
              severity: 'Low',
              conditionsMet: conditions,
              exceptionsApplied: ['Protective Jupiter aspect transforms Gandānta vulnerability into deep psychological wisdom'],
              involvedPlanets: ['moon', 'jupiter'],
              involvedRashis: [moon.rashiNumber],
              involvedNakshatras: [moon.nakshatraName],
            };
          }

          return {
            isPresent: true,
            formationStatus: 'Formed',
            severity: isTightKnot ? 'High' : 'Medium',
            conditionsMet: conditions,
            exceptionsApplied: [],
            involvedPlanets: ['moon'],
            involvedRashis: [moon.rashiNumber],
            involvedNakshatras: [moon.nakshatraName],
          };
        }
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'abhukta_mula',
    name: 'Abhukta Mūla (अभुक्त मूल दोष)',
    sanskritName: 'अभुक्त मूल दोष',
    transliteration: 'Abhukta Mūla Doṣa',
    alternateNames: ['Forbidden Mūla Knot', 'Terminal Jyeṣṭha - Initial Mūla'],
    category: 'Gandānta & Birth Defects',
    subcategory: 'Junctional Boundary Affliction',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'Bṛhat Parāśara Horā Śāstra',
      sanskritTextName: 'बृहत्पाराशर होराशास्त्रम्',
      chapter: 'BPHS Ch. 87',
      verseOrShloka: 'v. 11–14',
      sanskritShloka: 'ज्येष्ठान्तघटिका द्वे च मूलादौ घटिकाद्वयम् । अभुक्तमूलं विज्ञेयं पितृमातृकुलान्तकृत् ॥',
      sanskritTerminology: 'Abhukta Mūla (अभुक्तमूल)',
      supportingSources: ['Muhūrta Cintāmaṇi Ch. 1 v. 40', 'Jātaka Pārijāta Ch. 4 v. 65'],
    },
    definition: 'The Moon is situated within the exact classical 2-ghāṭī (48 minutes of arc / approx. 0°48\') span at the end of Jyeṣṭha (29°12\'–30°00\' Scorpio) or the first 2-ghāṭī span of Mūla (0°00\'–0°48\' Sagittarius).',
    classicalEffects: 'High spiritual destiny following early karmic storms; classical texts prescribe propitiation and care for paternal/maternal wellbeing.',
    evaluate: (ctx) => {
      const moon = ctx.planets.moon;
      if (!moon) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      // Jyeṣṭha ending: Scorpio 29°12' (29.2°) to 30.0°
      const inJyeshthaEnd = moon.rashiNumber === 8 && moon.nakshatraIndex === 17 && moon.longitudeInRashi >= 29.2;
      // Mūla beginning: Sagittarius 0°00' to 0°48' (0.8°)
      const inMulaStart = moon.rashiNumber === 9 && moon.nakshatraIndex === 18 && moon.longitudeInRashi <= 0.8;

      if (inJyeshthaEnd || inMulaStart) {
        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'High',
          conditionsMet: [
            inJyeshthaEnd
              ? `Moon in terminal 2 ghāṭīs of Jyeṣṭha (${moon.degreeStr} Scorpio)`
              : `Moon in initial 2 ghāṭīs of Mūla (${moon.degreeStr} Sagittarius)`,
          ],
          exceptionsApplied: [],
          involvedPlanets: ['moon'],
          involvedRashis: [moon.rashiNumber],
          involvedNakshatras: [moon.nakshatraName],
          classicalNotes: 'Abhukta Mūla is the most critical junctional zone in the zodiac, representing the transition from dissolution to primordial manifestation.',
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'lagna_gandanta',
    name: 'Lagna Gandānta (लग्न गण्डान्त)',
    sanskritName: 'लग्न गण्डान्त दोष',
    transliteration: 'Lagna Gandānta Doṣa',
    alternateNames: ['Ascendant Junction Knot'],
    category: 'Gandānta & Birth Defects',
    subcategory: 'Ascendant Boundary Affliction',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'BPHS & Muhūrta Cintāmaṇi',
      sanskritTextName: 'बृहत्पाराशर / मुहूर्तचिन्तामणि',
      chapter: 'BPHS Ch. 87 / MC Ch. 1',
      verseOrShloka: 'BPHS 87:15 / MC 1:44',
      sanskritShloka: 'मीनकर्कटकीटानामन्ते लग्नं यदा भवेत् । मेषसिंहधनुरादौ लग्नगण्डान्तमुच्यते ॥',
      sanskritTerminology: 'Lagna Gandānta (लग्नगण्डान्त)',
      supportingSources: ['Jātaka Pārijāta Ch. 4 v. 68'],
    },
    definition: 'The Ascendant (Lagna) cusp falls within the first 0°48\' (2 ghāṭīs) of Aries, Leo, Sagittarius, or the last 0°48\' (29°12\'–30°00\') of Pisces, Cancer, Scorpio.',
    classicalEffects: 'High sensitivity of the physical constitution at birth, strong psychological rebirth themes across major life turning points.',
    evaluate: (ctx) => {
      const lagnaRashi = ctx.lagnaRashi;
      const degInRashi = ctx.lagnaDegree;

      const isWaterEnd = [4, 8, 12].includes(lagnaRashi) && degInRashi >= 29.2;
      const isFireStart = [1, 5, 9].includes(lagnaRashi) && degInRashi <= 0.8;

      if (isWaterEnd || isFireStart) {
        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'High',
          conditionsMet: [
            isWaterEnd
              ? `Lagna at terminal boundary of Water Rashi (${ctx.chart.lagna.degreeStr} in ${ctx.chart.lagna.rashiName})`
              : `Lagna at initial boundary of Fire Rashi (${ctx.chart.lagna.degreeStr} in ${ctx.chart.lagna.rashiName})`,
          ],
          exceptionsApplied: [],
          involvedPlanets: [],
          involvedRashis: [lagnaRashi],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'tithi_gandanta',
    name: 'Tithi Gandānta (तिथि गण्डान्त)',
    sanskritName: 'तिथि गण्डान्त दोष',
    transliteration: 'Tithi Gandānta Doṣa',
    alternateNames: ['Lunar Day Junction Affliction'],
    category: 'Gandānta & Birth Defects',
    subcategory: 'Pañcāṅga Afflictions',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'BPHS & Muhūrta Cintāmaṇi',
      sanskritTextName: 'बृहत्पाराशर / मुहूर्तचिन्तामणि',
      chapter: 'BPHS Ch. 87 / MC Ch. 1',
      verseOrShloka: 'BPHS 87:16 / MC 1:46',
      sanskritShloka: 'पूर्णानां च तथान्ते स्यान्नन्दानामादितो भवेत् । घटिकाद्वितयं ज्ञेयं तिथिगण्डान्तसंज्ञितम् ॥',
      sanskritTerminology: 'Tithi Gandānta (तिथिगण्डान्त)',
      supportingSources: ['Phaladīpikā Ch. 13 v. 30'],
    },
    definition: 'Birth occurs within the terminal 2 ghāṭīs (last 48 mins) of Pūrṇā tithis (5, 10, 15, 30) or the initial 2 ghāṭīs of Nandā tithis (1, 6, 11).',
    classicalEffects: 'Financial fluctuations in youth, requiring methodical discipline in contracts and property management.',
    evaluate: (ctx) => {
      const tithiNumber = ctx.panchanga.tithi.number;
      const purnaTithis = [5, 10, 15, 20, 25, 30];
      const nandaTithis = [1, 6, 11, 16, 21, 26];

      // Check if current tithi is Purna (end) or Nanda (start)
      if (purnaTithis.includes(tithiNumber) || nandaTithis.includes(tithiNumber)) {
        // Check angular elongation to see if near boundary (each tithi is 12°)
        const sunDeg = ctx.planets.sun?.siderealLongitude || 0;
        const moonDeg = ctx.planets.moon?.siderealLongitude || 0;
        const diff = ((moonDeg - sunDeg + 360) % 360);
        const tithiFraction = (diff % 12) / 12; // 0 to 1

        const isPurnaEnd = purnaTithis.includes(tithiNumber) && tithiFraction >= 0.93; // last ~50 mins of tithi
        const isNandaStart = nandaTithis.includes(tithiNumber) && tithiFraction <= 0.07; // first ~50 mins

        if (isPurnaEnd || isNandaStart) {
          return {
            isPresent: true,
            formationStatus: 'Formed',
            severity: 'Medium',
            conditionsMet: [
              `Birth in critical Tithi boundary junction: ${ctx.panchanga.tithi.name} (${(tithiFraction * 100).toFixed(1)}% elapsed)`,
            ],
            exceptionsApplied: [],
            involvedPlanets: ['sun', 'moon'],
          };
        }
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'amavasya_janma',
    name: 'Amāvāsyā Janma Doṣa (अमावास्या जन्म दोष)',
    sanskritName: 'अमावास्या जन्म दोष',
    transliteration: 'Amāvāsyā Janma Doṣa',
    alternateNames: ['New Moon Birth Affliction', 'Darśa Janma'],
    category: 'Pañcāṅga & Tithi Afflictions',
    subcategory: 'Lunar Phase Affliction',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'Bṛhat Parāśara Horā Śāstra',
      sanskritTextName: 'बृहत्पाराशर होराशास्त्रम्',
      chapter: 'BPHS Ch. 84',
      verseOrShloka: 'v. 1–6',
      sanskritShloka: 'दर्शकाले समुत्पन्नो दरिद्रो व्याधितोऽपि वा । पितृमातृसुतानां च कष्टकृद्भवति ध्रुवम् ॥',
      sanskritTerminology: 'Darśa / Amāvāsyā Janma',
      supportingSources: ['Phaladīpikā Ch. 13 v. 28', 'Jātaka Pārijāta Ch. 4 v. 72'],
    },
    definition: 'Birth on the 30th Tithi (Amāvāsyā / New Moon) when the Moon is fully combust within the solar disc with near-zero Pakṣa Bala.',
    classicalEffects: 'Depleted vitality in childhood, heightened psychological sensitivity, maternal challenges, compensated by deep contemplative inward focus.',
    evaluate: (ctx) => {
      const tithiNumber = ctx.panchanga.tithi.number;
      if (tithiNumber === 30 || ctx.panchanga.tithi.name.toLowerCase().includes('amavasya') || ctx.panchanga.tithi.name.toLowerCase().includes('amāvāsyā')) {
        const jup = ctx.planets.jupiter;
        const jupInKendra = jup && [1, 4, 7, 10].includes(jup.house);

        const conditions = [
          `Born on Krishna Pakṣa 15 / Amāvāsyā (30th Tithi: ${ctx.panchanga.tithi.name})`,
          `Moon conjunct Sun with zero lunar illumination (Pakṣa Bala: 0)`,
        ];

        if (jupInKendra) {
          return {
            isPresent: true,
            formationStatus: 'Mitigated',
            severity: 'Low',
            conditionsMet: conditions,
            exceptionsApplied: ['Jupiter in Kendra provides radiant solar-intellectual protection'],
            involvedPlanets: ['sun', 'moon', 'jupiter'],
          };
        }

        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'Medium',
          conditionsMet: conditions,
          exceptionsApplied: [],
          involvedPlanets: ['sun', 'moon'],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'gandamula_nakshatra',
    name: 'Gandamūla Nakṣatra Janma (गण्डमूल नक्षत्र जन्म)',
    sanskritName: 'गण्डमूल नक्षत्र जन्म',
    transliteration: 'Gandamūla Nakṣatra Janma',
    alternateNames: ['Root Star Birth', 'Mercury-Ketu Nakṣatra Birth'],
    category: 'Gandānta & Birth Defects',
    subcategory: 'Nakṣatra Specific Affliction',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'BPHS',
      sanskritTextName: 'बृहत्पाराशर होराशास्त्रम्',
      chapter: 'BPHS Ch. 88–90',
      verseOrShloka: 'Ch. 88 v. 1–12',
      sanskritShloka: 'अश्विनी चाश्लेषा मघा ज्येष्ठा मूलं च रेवती । गण्डमूलानि षट् चैतानि जन्मकाले फलप्रदम् ॥',
      sanskritTerminology: 'Gandamūla (गण्डमूल)',
      supportingSources: ['Muhūrta Cintāmaṇi Ch. 1', 'Jātaka Pārijāta Ch. 4'],
    },
    definition: 'Birth in one of the six junctional Nakṣatras ruled by Mercury or Ketu (Aśvinī, Āśleṣā, Maghā, Jyeṣṭha, Mūla, Revatī).',
    classicalEffects: 'Special karmic duties regarding family legacy; specific pādas have classical significations for native, father, mother, or maternal relatives.',
    evaluate: (ctx) => {
      const moon = ctx.planets.moon;
      if (!moon) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      const gandamulaIndices = [0, 8, 9, 17, 18, 26]; // Ashvini, Ashlesha, Magha, Jyeshtha, Mula, Revati
      if (gandamulaIndices.includes(moon.nakshatraIndex)) {
        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'Medium',
          conditionsMet: [
            `Janma Nakṣatra is ${moon.nakshatraName} (Pada ${moon.pada}) — one of the 6 canonical Gandamūla asterisms`,
          ],
          exceptionsApplied: [],
          involvedPlanets: ['moon', moon.nakshatraLord],
          involvedNakshatras: [moon.nakshatraName],
          classicalNotes: 'Classical Shanti rites are traditionally performed on the 27th day after birth when Moon returns to the same Janma Nakshatra.',
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'sankranti_janma',
    name: 'Saṅkrānti Janma Doṣa (सङ्क्रान्ति जन्म दोष)',
    sanskritName: 'सङ्क्रान्ति जन्म दोष',
    transliteration: 'Saṅkrānti Janma Doṣa',
    alternateNames: ['Solar Ingress Birth Affliction'],
    category: 'Pañcāṅga & Tithi Afflictions',
    subcategory: 'Solar Ingress Affliction',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'BPHS',
      sanskritTextName: 'बृहत्पाराशर होराशास्त्रम्',
      chapter: 'BPHS Ch. 86',
      verseOrShloka: 'v. 1–8',
      sanskritShloka: 'संक्रान्तिसमये जातो दरिद्रो बहुदुःखभाक् । स्थानभ्रष्टो भवेन्नित्यं कार्यहानिः पदे पदे ॥',
      sanskritTerminology: 'Saṅkrānti Janma (संक्रान्ति जन्म)',
      supportingSources: ['Muhūrta Cintāmaṇi Ch. 1', 'Phaladīpikā Ch. 13'],
    },
    definition: 'Birth occurs when the Sun is at the very border of entering a new zodiacal sign (Sun longitude within 0°00\'–0°40\' or 29°20\'–30°00\').',
    classicalEffects: 'Frequent changes of residence or career orientation, restlessness, and sensitivity to seasonal transitions.',
    evaluate: (ctx) => {
      const sun = ctx.planets.sun;
      if (!sun) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      const deg = sun.longitudeInRashi;
      if (deg <= 0.67 || deg >= 29.33) {
        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'Medium',
          conditionsMet: [
            `Sun situated at exact Saṅkrānti ingress boundary (${sun.degreeStr} in ${sun.rashiName})`,
          ],
          exceptionsApplied: [],
          involvedPlanets: ['sun'],
          involvedRashis: [sun.rashiNumber],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'grahana_janma',
    name: 'Grahaṇa Janma Doṣa (ग्रहण जन्म दोष)',
    sanskritName: 'ग्रहण जन्म दोष',
    transliteration: 'Grahaṇa Janma Doṣa',
    alternateNames: ['Eclipse Birth Affliction', 'Solar/Lunar Eclipse Natal Affliction'],
    category: 'Pañcāṅga & Tithi Afflictions',
    subcategory: 'Eclipse Affliction',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'BPHS',
      sanskritTextName: 'बृहत्पाराशर होराशास्त्रम्',
      chapter: 'BPHS Ch. 85',
      verseOrShloka: 'v. 1–6',
      sanskritShloka: 'सूर्यचन्द्रग्रहे जातो व्याधितो दरिद्रो भवेत् । जायते बहुकष्टेन जीवनं तस्य केवलम् ॥',
      sanskritTerminology: 'Grahaṇa Janma (ग्रहण जन्म)',
      supportingSources: ['Phaladīpikā Ch. 13 v. 29', 'Jātaka Pārijāta Ch. 4 v. 74'],
    },
    definition: 'Birth during an active Solar or Lunar eclipse: Sun and Moon conjunct Rahu or Ketu in the same sign within 12° on Amāvāsyā (Solar) or Pūrṇimā (Lunar).',
    classicalEffects: 'High occult and esoteric perception, sharp public visibility swings, and periodic karmic resets in identity.',
    evaluate: (ctx) => {
      const sun = ctx.planets.sun;
      const moon = ctx.planets.moon;
      const rahu = ctx.planets.rahu;
      const ketu = ctx.planets.ketu;
      if (!sun || !moon || (!rahu && !ketu)) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      // Solar Eclipse: Sun + Moon + Node in same sign
      const solarEclipse = sun.rashiNumber === moon.rashiNumber && (sun.rashiNumber === rahu.rashiNumber || sun.rashiNumber === ketu.rashiNumber);
      // Lunar Eclipse: Moon + Node in same sign while Sun is 7th opposite
      const lunarEclipse = (moon.rashiNumber === rahu.rashiNumber || moon.rashiNumber === ketu.rashiNumber) && Math.abs(sun.house - moon.house) === 6;

      if (solarEclipse || lunarEclipse) {
        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'High',
          conditionsMet: [
            solarEclipse
              ? `Solar Eclipse alignment (Sūrya Grahaṇa): Sun, Moon, and Node conjoined in ${sun.rashiName}`
              : `Lunar Eclipse alignment (Candra Grahaṇa): Moon conjoined Node in opposition to Sun`,
          ],
          exceptionsApplied: [],
          involvedPlanets: ['sun', 'moon', 'rahu', 'ketu'],
          involvedRashis: [sun.rashiNumber, moon.rashiNumber],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
  {
    id: 'vishti_bhadra_janma',
    name: 'Viṣṭi / Bhadrā Karaṇa Janma Doṣa (विष्टि/भद्रा करण जन्म)',
    sanskritName: 'विष्टि (भद्रा) करण जन्म दोष',
    transliteration: 'Viṣṭi / Bhadrā Karaṇa Janma Doṣa',
    alternateNames: ['Bhadra Birth Affliction', 'Saturnian Vishti Karaṇa Birth'],
    category: 'Pañcāṅga & Tithi Afflictions',
    subcategory: 'Karaṇa Affliction',
    classicalStatus: 'Directly Classical',
    primarySource: {
      text: 'Muhūrta Cintāmaṇi',
      sanskritTextName: 'मुहूर्तचिन्तामणिः',
      chapter: 'Muhūrta Cintāmaṇi Ch. 1',
      verseOrShloka: 'v. 48–52',
      sanskritShloka: 'विष्ट्यां जातस्य दौर्भाग्यं कलहः सर्वकर्मसु । मारुतादपि भीतिः स्यात् यदि नो शुभवीक्षणम् ॥',
      sanskritTerminology: 'Viṣṭi Karaṇa / Bhadrā (विष्टि / भद्रा)',
      supportingSources: ['BPHS Ch. 84', 'Bṛhat Saṃhitā Ch. 99'],
    },
    definition: 'Birth during Viṣṭi Karaṇa (also known as Bhadrā), the malefic half-tithi ruled by Yama/Saturn with aggressive destructive energy.',
    classicalEffects: 'Prone to friction in cooperative partnerships and legal matters; native excels in critical auditing, surgery, forensic scrutiny, and arduous campaigns.',
    evaluate: (ctx) => {
      const karanaName = ctx.panchanga.karana.name.toLowerCase();
      if (karanaName.includes('vishti') || karanaName.includes('viṣṭi') || karanaName.includes('bhadra') || karanaName.includes('bhadrā')) {
        const jup = ctx.planets.jupiter;
        const jupAspects = jup && isKendra(jup.house);

        const conditions = [
          `Born in Viṣṭi (Bhadrā) Karaṇa (${ctx.panchanga.karana.name})`,
        ];

        if (jupAspects) {
          return {
            isPresent: true,
            formationStatus: 'Mitigated',
            severity: 'Low',
            conditionsMet: conditions,
            exceptionsApplied: ['Jupiter in Kendra mitigates destructive Bhadrā tendencies into sharp analytical mastery'],
            involvedPlanets: ['saturn', 'jupiter'],
          };
        }

        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'Medium',
          conditionsMet: conditions,
          exceptionsApplied: [],
          involvedPlanets: ['saturn'],
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
];

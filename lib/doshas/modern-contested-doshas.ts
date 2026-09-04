/**
 * Gaṇaka — Modern & Contested Doshas Database
 * Scholastic provenance tracking for late medieval and modern astrological traditions
 */

import { PlanetId } from '../astronomy/ephemeris';
import { DoshaDefinition } from './dosha-types';
import { isKendra, isExalted, isOwnSign } from './dosha-utils';

export const MODERN_CONTESTED_DOSHAS: DoshaDefinition[] = [
  {
    id: 'kala_sarpa_dosha',
    name: 'Kāla Sarpa / Kāla Amṛta Doṣa (कालसर्प दोष)',
    sanskritName: 'कालसर्प / कालामृत दोष',
    transliteration: 'Kāla Sarpa / Kāla Amṛta Doṣa',
    alternateNames: ['Serpent of Time Affliction', 'Nodal Hemisphere Enclosure'],
    category: 'Contested & Vernacular Traditions',
    subcategory: 'Nodal Enclosure',
    classicalStatus: 'Modern / Contested',
    primarySource: {
      text: 'Late Medieval Vernacular Tradition',
      sanskritTextName: 'उत्तरकालीन लोक-ज्योतिष परम्परा',
      chapter: 'Regional / Oral Compilations',
      verseOrShloka: 'Non-Canonical',
      editionOrProvenance: 'Absent from classical Sanskrit canonical works (BPHS, Bṛhat Jātaka, Sārāvalī, Phaladīpikā, Jātaka Pārijāta). Preserved in post-classical regional literature.',
      sanskritTerminology: 'Kāla Sarpa (कालसर्प)',
      supportingSources: ['B.V. Raman (Notable Horoscopes)', 'J.N. Bhasin (Art of Prediction)'],
    },
    cancellationRules: [
      {
        id: 'planet_conjunct_node',
        title: 'Planet Conjoined with Rahu/Ketu (Orb Breach)',
        description: 'If any classical planet is conjunct Rahu or Ketu within tight orb, or occupies the same degree, the strict enclosure is broken (Kāla Sarpa Bhaṅga).',
        conditionMetDescription: 'Planet conjoined with lunar node.',
        sourceText: 'Modern Research Consensus',
        chapterAndVerse: 'Bhaṅga Rules',
      },
      {
        id: 'strong_benefic_kendra',
        title: 'Strong Benefic in Lagna / 10th House',
        description: 'Exalted or swakshetra Jupiter/Venus in Kendra anchors independent life trajectory.',
        conditionMetDescription: 'Benefic in 1st or 10th house.',
        sourceText: 'Traditional Parihāra',
        chapterAndVerse: 'Bhaṅga Rules',
      },
    ],
    definition: 'All seven classical visible planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) are positioned entirely on one side of the Rahu-Ketu nodal axis (within a 180° continuous half of the zodiac).',
    classicalEffects: 'Intense karmic momentum, early uphill struggle leading to enduring late-life resilience and distinct public legacy.',
    provenanceNotes: 'Scholastic Note: Kāla Sarpa is absent from the ancient Sanskrit canon (Parāśara, Varāhamihira, Kalyāṇavarma, Mantreśvara). It gained prominence in 20th-century Indian astrological discourse. Evaluated here with full mathematical rigor and canonical transparency.',
    evaluate: (ctx) => {
      const rahu = ctx.planets.rahu;
      const ketu = ctx.planets.ketu;
      if (!rahu || !ketu) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      const planetsToCheck: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
      const rahuLong = rahu.siderealLongitude;
      const ketuLong = ketu.siderealLongitude;

      let allBetweenRahuToKetu = true;
      let allBetweenKetuToRahu = true;

      for (const pId of planetsToCheck) {
        const p = ctx.planets[pId];
        if (!p) continue;
        const pLong = p.siderealLongitude;

        // Angle from Rahu moving direct
        const angleFromRahu = (pLong - rahuLong + 360) % 360;
        if (angleFromRahu > 180) allBetweenRahuToKetu = false;

        // Angle from Ketu moving direct
        const angleFromKetu = (pLong - ketuLong + 360) % 360;
        if (angleFromKetu > 180) allBetweenKetuToRahu = false;
      }

      const isEnclosed = allBetweenRahuToKetu || allBetweenKetuToRahu;
      if (!isEnclosed) {
        return {
          isPresent: false,
          formationStatus: 'Not Formed',
          severity: 'Low',
          conditionsMet: [],
          exceptionsApplied: [],
          involvedPlanets: [],
        };
      }

      const yogaType = allBetweenRahuToKetu ? 'Kāla Sarpa (Moving towards Rāhu)' : 'Kāla Amṛta (Moving towards Ketu)';
      const rahuHouse = rahu.house;

      const traditionalNames: Record<number, string> = {
        1: 'Ananta Kāla Sarpa (1st–7th axis)',
        2: 'Kulika Kāla Sarpa (2nd–8th axis)',
        3: 'Vāsuki Kāla Sarpa (3rd–9th axis)',
        4: 'Śaṅkhapāla Kāla Sarpa (4th–10th axis)',
        5: 'Padma Kāla Sarpa (5th–11th axis)',
        6: 'Mahāpadma Kāla Sarpa (6th–12th axis)',
        7: 'Takṣaka Kāla Sarpa (7th–1st axis)',
        8: 'Karkoṭaka Kāla Sarpa (8th–2nd axis)',
        9: 'Śaṅkhacūḍa Kāla Sarpa (9th–3rd axis)',
        10: 'Ghātaka Kāla Sarpa (10th–4th axis)',
        11: 'Viṣadhara Kāla Sarpa (11th–5th axis)',
        12: 'Śeṣanāga Kāla Sarpa (12th–6th axis)',
      };

      const specificName = traditionalNames[rahuHouse] || 'Kāla Sarpa';

      // Check Cancellations / Bhaṅga
      const exceptions: string[] = [];
      const jup = ctx.planets.jupiter;
      if (jup && isKendra(jup.house) && (isExalted('jupiter', jup.rashiNumber) || isOwnSign('jupiter', jup.rashiNumber))) {
        exceptions.push('Strong Jupiter in Kendra anchors the chart and cancels obstructive momentum (Bhaṅga)');
      }

      const conditions = [
        `All 7 classical planets enclosed within ${yogaType} nodal arc`,
        `Type: ${specificName} (Rāhu in House ${rahuHouse}, Ketu in House ${ketu.house})`,
      ];

      if (exceptions.length > 0) {
        return {
          isPresent: true,
          formationStatus: 'Cancelled',
          severity: 'Cancelled',
          conditionsMet: conditions,
          exceptionsApplied: exceptions,
          involvedPlanets: ['rahu', 'ketu', ...planetsToCheck],
          involvedHouses: [rahu.house, ketu.house],
          classicalNotes: 'Kāla Sarpa Bhaṅga transforms initial constraint into monumental focused achievement.',
        };
      }

      return {
        isPresent: true,
        formationStatus: 'Formed',
        severity: 'Medium',
        conditionsMet: conditions,
        exceptionsApplied: [],
        involvedPlanets: ['rahu', 'ketu', ...planetsToCheck],
        involvedHouses: [rahu.house, ketu.house],
      };
    },
  },
  {
    id: 'modern_pitri_dosh',
    name: 'Pitri Dosh (Modern Popular Amalgamation)',
    sanskritName: 'पितृ दोष (आधुनिक रूप)',
    transliteration: 'Pitri Dosh (Popular Modern Rule)',
    alternateNames: ['Sun-Rahu Conjunction Affliction', 'Modern Ancestral Debt'],
    category: 'Contested & Vernacular Traditions',
    subcategory: 'Ancestral Affliction',
    classicalStatus: 'Modern / Contested',
    primarySource: {
      text: 'Modern Astrological Compilations',
      sanskritTextName: 'आधुनिक ज्योतिष ग्रन्थ',
      chapter: 'Modern 20th Century Compendiums',
      verseOrShloka: 'Popular Formula',
      editionOrProvenance: 'Distinct from classical BPHS Ch. 83 Pitṛ Śāpa. In modern practice, commonly identified by Sun-Rahu conjunction anywhere in the chart or Rahu in 9th house.',
      sanskritTerminology: 'Pitri Dosh (पितृदोष)',
      supportingSources: ['Lal Kitab Traditions', 'Modern Regional Guides'],
    },
    definition: 'Sun is conjoined with Rahu in any house, or Rahu occupies the 9th house (Dharma / Pitṛ Sthāna).',
    classicalEffects: 'In modern lore: ancestral debts and career slowdowns; classical Parāśara text reserves the true Pitṛ Śāpa specifically for 5th house progeny afflictions.',
    provenanceNotes: 'Scholastic Note: Classical texts describe Sun-Rahu as Grahaṇa Yoga or Sarpa-Sūrya Yuti, whereas BPHS Ch. 83 specifically defines Pitṛ Śāpa in the 5th house. This modern popular definition is provided for comparative verification.',
    evaluate: (ctx) => {
      const sun = ctx.planets.sun;
      const rahu = ctx.planets.rahu;
      if (!sun || !rahu) return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };

      const sunWithRahu = sun.rashiNumber === rahu.rashiNumber;
      const rahuIn9 = rahu.house === 9;

      if (sunWithRahu || rahuIn9) {
        return {
          isPresent: true,
          formationStatus: 'Formed',
          severity: 'Medium',
          conditionsMet: [
            sunWithRahu ? `Sun conjoined with Rāhu in ${sun.rashiName} (House ${sun.house})` : 'Rāhu occupies 9th house (Pitṛ / Dharma Bhāva)',
          ],
          exceptionsApplied: [],
          involvedPlanets: ['sun', 'rahu'],
          involvedHouses: [sun.house, rahu.house],
          classicalNotes: 'Compare with canonical Pitṛ Śāpa (BPHS Ch. 83) which specifically governs the 5th house of lineage.',
        };
      }

      return { isPresent: false, formationStatus: 'Not Formed', severity: 'Low', conditionsMet: [], exceptionsApplied: [], involvedPlanets: [] };
    },
  },
];

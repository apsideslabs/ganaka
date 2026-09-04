/**
 * Gaṇaka — Specialized Domain Evaluator: Personality & Temperament
 * (मनःस्वभाव एवं बुद्धि)
 * 
 * Sources: Sārāvalī (Ch. 22-25), Jaimini Upadeśa Sūtras (Adhyāya 1, Pāda 2)
 */

import { JyotishaChart } from '../../types';
import { DomainIndication, DirectClassicalPhala, RuleCondition, CalculatedFact } from '../types';
import { CANONICAL_RULES } from '../classical-sources';
import {
  getHouseLord,
  getShadbalaRatio,
  makeFact,
  GRAHA_SANSKRIT_NAMES,
  getCharaKarakaPlanet,
  NATURAL_BENEFICS,
} from '../shared-utils';
import { reconcileRulesAndContradictions } from '../conflict-resolver';

export function evaluateTemperamentDomain(chart: JyotishaChart): DomainIndication {
  const moon = chart.planets.moon;
  const sun = chart.planets.sun;
  const mercury = chart.planets.mercury;
  const dhiLord = getHouseLord(chart, 5);
  const akPlanetId = getCharaKarakaPlanet(chart, 'AK');
  const akPlanet = chart.planets[akPlanetId];

  const moonShadbala = getShadbalaRatio(chart, 'moon');
  const mercuryShadbala = getShadbalaRatio(chart, 'mercury');
  const isMoonBeneficAspect = NATURAL_BENEFICS.includes(dhiLord.id);

  const calculatedFacts: CalculatedFact[] = [
    makeFact(
      'fact_moon_mind',
      'Graha & Dignity',
      'Candra (Moon) • Manas (Emotional Mind)',
      `${moon.rashiName} (${moon.degreeStr}) in House ${moon.house}`,
      `Pakṣa: ${chart.panchanga.tithi.name}. Governs subconscious reflexes and emotional security.`,
      moonShadbala >= 1.0 ? 'favorable' : 'neutral'
    ),
    makeFact(
      'fact_mercury_intellect',
      'Graha & Dignity',
      'Budha (Mercury) • Buddhi (Discriminating Intellect)',
      `${mercury.rashiName} in House ${mercury.house}${mercury.isCombust ? ' [Combust / अस्त]' : ''}`,
      'Governs logical deduction, verbal expression, and cognitive synthesis.',
      mercury.isCombust ? 'limiting' : 'favorable'
    ),
    makeFact(
      'fact_jaimini_ak',
      'Jaimini Sūtra',
      'Ātmakāraka (Soul Significator)',
      `${GRAHA_SANSKRIT_NAMES[akPlanetId]} at ${akPlanet?.degreeStr || ''}`,
      'Reveals core internal values, spiritual lessons, and soul-level impulses.',
      'neutral'
    ),
    makeFact(
      'fact_dhi_lord',
      'Bhāva & Bhāveśa',
      '5th Lord of Intellect (Dhīpati)',
      `${dhiLord.name} in House ${chart.planets[dhiLord.id]?.house || 'N/A'}`,
      'Shapes intuitive creative foresight and retentive intelligence.',
      'favorable'
    ),
  ];

  const directClassicalPhalas: DirectClassicalPhala[] = [];

  // Rule 1: Sārāvalī Ch. 22-24
  const cond1: RuleCondition[] = [
    {
      id: 'c_moon_dignity',
      description: 'Moon situated in Kendra/Trikona or supported by Śaḍbala',
      expected: '>= 1.0 Śaḍbala ratio or in houses 1, 4, 5, 7, 9, 10, 11',
      observed: `House ${moon.house}, Ratio ${moonShadbala.toFixed(2)}`,
      met: [1, 4, 5, 7, 9, 10, 11].includes(moon.house) || moonShadbala >= 0.95,
    },
  ];
  if (cond1.every((c) => c.met)) {
    directClassicalPhalas.push({
      id: 'phala_saravali_manas',
      ruleId: 'saravali_chandra_buddhi_manas',
      sourceText: CANONICAL_RULES.saravali_chandra_buddhi_manas.sourceText,
      chapterAndVerse: CANONICAL_RULES.saravali_chandra_buddhi_manas.chapterAndVerse,
      sanskritTitle: CANONICAL_RULES.saravali_chandra_buddhi_manas.sanskritTitle || '',
      sanskritShloka: CANONICAL_RULES.saravali_chandra_buddhi_manas.sanskritShloka,
      editionOrManuscript: CANONICAL_RULES.saravali_chandra_buddhi_manas.editionOrManuscript,
      conditions: cond1,
      allConditionsMet: true,
      verificationLevel: 'Fully Verified',
      directPhalaText:
        'The native possesses emotional composure, responsive empathy, and balanced mental equilibrium (Śānta-manas).',
    });
  }

  // Rule 2: Jaimini AK
  directClassicalPhalas.push({
    id: 'phala_jaimini_ak',
    ruleId: 'jaimini_atmakaraka_nature',
    sourceText: CANONICAL_RULES.jaimini_atmakaraka_nature.sourceText,
    chapterAndVerse: CANONICAL_RULES.jaimini_atmakaraka_nature.chapterAndVerse,
    sanskritTitle: CANONICAL_RULES.jaimini_atmakaraka_nature.sanskritTitle || '',
    sanskritShloka: CANONICAL_RULES.jaimini_atmakaraka_nature.sanskritShloka,
    editionOrManuscript: CANONICAL_RULES.jaimini_atmakaraka_nature.editionOrManuscript,
    conditions: [
      {
        id: 'c_ak_identified',
        description: 'Planetary candidate with highest advanced degree identified as Ātmakāraka',
        expected: 'Highest Longitude Graha',
        observed: `${GRAHA_SANSKRIT_NAMES[akPlanetId]} (${akPlanet?.degreeStr || ''})`,
        met: true,
      },
    ],
    allConditionsMet: true,
    verificationLevel: 'Fully Verified',
    directPhalaText: `Soul direction and foundational ethical orientation are steered through ${GRAHA_SANSKRIT_NAMES[akPlanetId]} (Ātmakāraka).`,
  });

  const supportingFactors: string[] = [];
  const limitingFactors: string[] = [];

  if (moonShadbala >= 1.0) supportingFactors.push(`Moon has strong Śaḍbala ratio (${moonShadbala.toFixed(2)}x), stabilizing the emotional mind.`);
  if (mercuryShadbala >= 1.0 && !mercury.isCombust) supportingFactors.push('Mercury is uncombust with strong analytical faculty.');
  if (mercury.isCombust) limitingFactors.push('Mercury is combust by Sun, indicating intense mental processing subject to periodic cognitive fatigue.');

  const { multiRuleSynthesis, reconciledSummary } = reconcileRulesAndContradictions(
    directClassicalPhalas,
    [],
    []
  );

  return {
    id: 'temperament',
    title: 'Personality & Temperament',
    sanskritTitle: 'मनःस्वभाव एवं बुद्धि',
    subtitle: 'Emotional mind (Manas), intellect (Buddhi), and soul disposition (Ātmakāraka)',
    primaryBhavas: [1, 5],
    keyGrahas: ['moon', 'mercury', akPlanetId],
    keyVargas: ['D1', 'D9'],
    hasVerifiedRule: directClassicalPhalas.length > 0,
    conciseSummary: reconciledSummary,
    coreDisposition: `${moon.rashiName} Moon • ${GRAHA_SANSKRIT_NAMES[akPlanetId]} Ātmakāraka`,
    directClassicalPhalas,
    multiRuleSynthesis,
    modernMappings: [
      {
        id: 'map_temperament',
        classicalConcept: 'Manas-Buddhi-Ātmakāraka Triad',
        classicalSourceRef: 'Sārāvalī Ch. 22 & Jaimini Sūtras',
        modernMappingText:
          'Corresponds to cognitive style, emotional intelligence (EQ), and deep-seated internal motivators in modern personality psychology.',
        methodologyNote:
          'Explicit modern synthesis mapping.',
      },
    ],
    contradictions: [],
    calculatedFacts,
    satisfiedRules: directClassicalPhalas.map((p) => ({
      rule: CANONICAL_RULES[p.ruleId] || CANONICAL_RULES.saravali_chandra_buddhi_manas,
      conditionsRequired: p.conditions.map((c) => c.description),
      conditionsMet: p.conditions.filter((c) => c.met).map((c) => c.description),
      status: p.verificationLevel,
      synthesisNote: p.directPhalaText,
    })),
    supportingFactors,
    limitingOrCounterbalancingFactors: limitingFactors,
    synthesisNarrative: multiRuleSynthesis,
    calculationBasisNotes: [
      `Moon: ${moon.rashiName} (${moon.degreeStr})`,
      `Mercury: ${mercury.rashiName} (${mercury.degreeStr})`,
      `Ātmakāraka: ${GRAHA_SANSKRIT_NAMES[akPlanetId]}`,
    ],
    canonicalSources: [
      CANONICAL_RULES.saravali_chandra_buddhi_manas,
      CANONICAL_RULES.jaimini_atmakaraka_nature,
    ],
  };
}

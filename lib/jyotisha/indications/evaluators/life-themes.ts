/**
 * Gaṇaka — Specialized Domain Evaluator: Major Life Tendencies & Chart Emphasis
 * (जीवनप्रवाह एवं कुण्डली महालक्षण)
 * 
 * Sources: BPHS (Ch. 11-14 & 45), Bṛhat Jātaka (Ch. 12), Sārāvalī (Ch. 3)
 */

import { JyotishaChart, PlanetId } from '../../types';
import { DomainIndication, DirectClassicalPhala, RuleCondition, CalculatedFact } from '../types';
import { CANONICAL_RULES } from '../classical-sources';
import {
  makeFact,
  GRAHA_SANSKRIT_NAMES,
} from '../shared-utils';
import { reconcileRulesAndContradictions } from '../conflict-resolver';

export function evaluateLifeThemesDomain(chart: JyotishaChart): DomainIndication {
  // Count planetary distribution across the 4 Puruṣārthas
  // Dharma: 1, 5, 9
  // Artha: 2, 6, 10
  // Kāma: 3, 7, 11
  // Mokṣa: 4, 8, 12
  const planetKeys = Object.keys(chart.planets) as PlanetId[];
  let dharmaCount = 0;
  let arthaCount = 0;
  let kamaCount = 0;
  let mokshaCount = 0;

  planetKeys.forEach((p) => {
    const h = chart.planets[p]?.house;
    if ([1, 5, 9].includes(h)) dharmaCount++;
    else if ([2, 6, 10].includes(h)) arthaCount++;
    else if ([3, 7, 11].includes(h)) kamaCount++;
    else if ([4, 8, 12].includes(h)) mokshaCount++;
  });

  // Dominant Puruṣārtha
  const lagnaRashiName = chart.lagna?.rashiName || 'Lagna';
  const scores = [
    { name: 'Dharma (Duty, Philosophy, Ethical Order)', count: dharmaCount },
    { name: 'Artha (Wealth, Production, Social Utility)', count: arthaCount },
    { name: 'Kāma (Desire, Partnerships, Innovation)', count: kamaCount },
    { name: 'Mokṣa (Liberation, Introspection, Detachment)', count: mokshaCount },
  ];
  scores.sort((a, b) => b.count - a.count);
  const dominantPurushartha = scores[0];

  const calculatedFacts: CalculatedFact[] = [
    makeFact(
      'fact_dominant_purushartha',
      'Purushartha Alignment',
      'Dominant Puruṣārtha Emphasis',
      `${dominantPurushartha.name} (${dominantPurushartha.count} Grahas)`,
      'Shapes the overarching life motivations, primary existential goals, and directional momentum.',
      'favorable'
    ),
    makeFact(
      'fact_purushartha_distribution',
      'Purushartha Alignment',
      'Puruṣārtha Planetary Distribution',
      `Dharma: ${dharmaCount} | Artha: ${arthaCount} | Kāma: ${kamaCount} | Mokṣa: ${mokshaCount}`,
      'Distribution of life energy across spiritual duty, material creation, desire fulfillment, and transcendental release.',
      'neutral'
    ),
    makeFact(
      'fact_lagna_archetype',
      'Lagna & Lord',
      'Fundamental Chart Archetype',
      `${lagnaRashiName} Ascendant • ${chart.planets.moon.rashiName} Moon • ${chart.planets.sun.rashiName} Sun`,
      'The foundational tripod (Lagna-Candra-Sūrya) defining the macro life experience.',
      'favorable'
    ),
  ];

  const directClassicalPhalas: DirectClassicalPhala[] = [];

  // Rule: BPHS Ch. 45 Puruṣārtha
  directClassicalPhalas.push({
    id: 'phala_bphs_purushartha_macro',
    ruleId: 'bphs_purushartha_balance',
    sourceText: CANONICAL_RULES.bphs_purushartha_balance.sourceText,
    chapterAndVerse: CANONICAL_RULES.bphs_purushartha_balance.chapterAndVerse,
    sanskritTitle: CANONICAL_RULES.bphs_purushartha_balance.sanskritTitle || '',
    sanskritShloka: CANONICAL_RULES.bphs_purushartha_balance.sanskritShloka,
    editionOrManuscript: CANONICAL_RULES.bphs_purushartha_balance.editionOrManuscript,
    conditions: [
      {
        id: 'c_purushartha_calculated',
        description: 'Macro distribution of 9 planets across Dharma, Artha, Kāma, and Mokṣa trikonas calculated',
        expected: 'Calculated Trikoṇa Distribution',
        observed: `Dominant: ${dominantPurushartha.name}`,
        met: true,
      },
    ],
    allConditionsMet: true,
    verificationLevel: 'Fully Verified',
    directPhalaText: `Natal planetary emphasis channels life focus predominantly toward ${dominantPurushartha.name}.`,
  });

  const supportingFactors: string[] = [
    `Strong concentration in ${dominantPurushartha.name} creates clear thematic clarity.`,
  ];
  const limitingFactors: string[] = [];

  const { multiRuleSynthesis, reconciledSummary } = reconcileRulesAndContradictions(
    directClassicalPhalas,
    [],
    []
  );

  return {
    id: 'life_themes',
    title: 'Major Life Tendencies & Chart Emphasis',
    sanskritTitle: 'जीवनप्रवाह एवं कुण्डली महालक्षण',
    subtitle: 'Puruṣārtha orientation (Dharma-Artha-Kāma-Mokṣa), elemental balance, and macro life themes',
    primaryBhavas: [1, 5, 9, 10],
    keyGrahas: ['sun', 'moon', 'jupiter'],
    keyVargas: ['D1', 'D9'],
    hasVerifiedRule: directClassicalPhalas.length > 0,
    conciseSummary: reconciledSummary,
    coreDisposition: `${dominantPurushartha.name.split(' ')[0]} Dominant • ${lagnaRashiName} Lagna`,
    directClassicalPhalas,
    multiRuleSynthesis,
    modernMappings: [
      {
        id: 'map_purushartha_modern',
        classicalConcept: 'Chaturvidha Puruṣārtha Framework',
        classicalSourceRef: 'BPHS Ch. 45',
        modernMappingText:
          'Maps to overarching psychological values, primary life priorities, existential orientation, and long-term holistic balance.',
        methodologyNote: 'Modern holistic developmental orientation mapping.',
      },
    ],
    contradictions: [],
    calculatedFacts,
    satisfiedRules: directClassicalPhalas.map((p) => ({
      rule: CANONICAL_RULES[p.ruleId] || CANONICAL_RULES.bphs_purushartha_balance,
      conditionsRequired: p.conditions.map((c) => c.description),
      conditionsMet: p.conditions.filter((c) => c.met).map((c) => c.description),
      status: p.verificationLevel,
      synthesisNote: p.directPhalaText,
    })),
    supportingFactors,
    limitingOrCounterbalancingFactors: limitingFactors,
    synthesisNarrative: multiRuleSynthesis,
    calculationBasisNotes: [
      `Dharma Houses (1,5,9): ${dharmaCount} planets`,
      `Artha Houses (2,6,10): ${arthaCount} planets`,
      `Kāma Houses (3,7,11): ${kamaCount} planets`,
      `Mokṣa Houses (4,8,12): ${mokshaCount} planets`,
    ],
    canonicalSources: [CANONICAL_RULES.bphs_purushartha_balance],
  };
}

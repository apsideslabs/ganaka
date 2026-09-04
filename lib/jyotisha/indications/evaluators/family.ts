/**
 * Gaṇaka — Specialized Domain Evaluator: Family & Domestic Life
 * (द्वितीय-चतुर्थ भाव एवं कुटुम्ब-गृहसुख)
 * 
 * Sources: BPHS (Ch. 11 & 12), Sārāvalī (Ch. 30 & 31)
 */

import { JyotishaChart } from '../../types';
import { DomainIndication, DirectClassicalPhala, RuleCondition, CalculatedFact } from '../types';
import { CANONICAL_RULES } from '../classical-sources';
import {
  getHouseLord,
  getHouseOccupants,
  getShadbalaRatio,
  makeFact,
  GRAHA_SANSKRIT_NAMES,
} from '../shared-utils';
import { reconcileRulesAndContradictions } from '../conflict-resolver';

export function evaluateFamilyDomain(chart: JyotishaChart): DomainIndication {
  const secondLord = getHouseLord(chart, 2);
  const fourthLord = getHouseLord(chart, 4);
  const secondLordPlanet = chart.planets[secondLord.id];
  const fourthLordPlanet = chart.planets[fourthLord.id];
  const moon = chart.planets.moon;
  const moonShadbala = getShadbalaRatio(chart, 'moon');

  const calculatedFacts: CalculatedFact[] = [
    makeFact(
      'fact_kutumba_lord',
      'Bhāva & Bhāveśa',
      '2nd House Lord (Kuṭumbādhipati • Family Lineage)',
      `${secondLord.name} in House ${secondLordPlanet?.house || 'N/A'} (${secondLordPlanet?.rashiName || ''})`,
      'Governs kinship harmony, ancestral family support, and household cohesion.',
      [1, 2, 4, 5, 9, 10, 11].includes(secondLordPlanet?.house || 0) ? 'favorable' : 'neutral'
    ),
    makeFact(
      'fact_sukha_lord',
      'Bhāva & Bhāveśa',
      '4th House Lord (Sukhādhipati • Domestic Peace)',
      `${fourthLord.name} in House ${fourthLordPlanet?.house || 'N/A'} (${fourthLordPlanet?.rashiName || ''})`,
      'Governs domestic environment, residence, real estate/landed assets, and inner contentment.',
      [1, 4, 5, 9, 10].includes(fourthLordPlanet?.house || 0) ? 'favorable' : 'neutral'
    ),
    makeFact(
      'fact_matrukaraka_moon',
      'Graha & Dignity',
      'Candra (Moon) • Mātṛkāraka (Mother & Nurturance)',
      `${moon.rashiName} in House ${moon.house} (Dignity: ${moon.dignity})`,
      `Śaḍbala: ${moonShadbala.toFixed(2)}x. Primary significator of mother, emotional roots, and domestic sanctuary.`,
      moonShadbala >= 1.0 ? 'favorable' : 'neutral'
    ),
  ];

  const directClassicalPhalas: DirectClassicalPhala[] = [];

  // Rule 1: BPHS Ch. 11 & 12 Kuṭumba & Gṛhasukha
  const cond1: RuleCondition[] = [
    {
      id: 'c_fourth_lord_kendra',
      description: '4th lord well-placed in Kendra/Trikona or own sign',
      expected: 'Houses 1, 4, 5, 7, 9, 10',
      observed: `House ${fourthLordPlanet?.house}`,
      met: [1, 4, 5, 7, 9, 10].includes(fourthLordPlanet?.house || 0),
    },
    {
      id: 'c_moon_vitality',
      description: 'Moon possessing sufficient vitality',
      expected: '>= 0.85 Śaḍbala ratio',
      observed: `${moonShadbala.toFixed(2)}x`,
      met: moonShadbala >= 0.85,
    },
  ];

  if (cond1.every((c) => c.met)) {
    directClassicalPhalas.push({
      id: 'phala_bphs_kutumba',
      ruleId: 'bphs_kutumba_griha_sukha',
      sourceText: CANONICAL_RULES.bphs_kutumba_griha_sukha.sourceText,
      chapterAndVerse: CANONICAL_RULES.bphs_kutumba_griha_sukha.chapterAndVerse,
      sanskritTitle: CANONICAL_RULES.bphs_kutumba_griha_sukha.sanskritTitle || '',
      sanskritShloka: CANONICAL_RULES.bphs_kutumba_griha_sukha.sanskritShloka,
      editionOrManuscript: CANONICAL_RULES.bphs_kutumba_griha_sukha.editionOrManuscript,
      conditions: cond1,
      allConditionsMet: true,
      verificationLevel: 'Fully Verified',
      directPhalaText:
        'Domestic contentment (Gṛha-sukha), rooted ancestral support, and fruitful property possession are confirmed by classical 4th house rules.',
    });
  }

  const supportingFactors: string[] = [];
  const limitingFactors: string[] = [];

  supportingFactors.push(`4th Lord (${fourthLord.name}) positioned in House ${fourthLordPlanet?.house}.`);
  supportingFactors.push(`2nd Lord (${secondLord.name}) positioned in House ${secondLordPlanet?.house}.`);
  if (moonShadbala >= 1.0) supportingFactors.push(`Moon has strong Śaḍbala strength (${moonShadbala.toFixed(2)}x).`);

  const { multiRuleSynthesis, reconciledSummary } = reconcileRulesAndContradictions(
    directClassicalPhalas,
    [],
    []
  );

  return {
    id: 'family',
    title: 'Family & Domestic Life',
    sanskritTitle: 'द्वितीय-चतुर्थ भाव एवं कुटुम्ब-गृहसुख',
    subtitle: 'Kinship lineage (2nd), domestic peace (4th), Moon (Mātṛkāraka), and landed property',
    primaryBhavas: [2, 4],
    keyGrahas: [secondLord.id, fourthLord.id, 'moon'],
    keyVargas: ['D1', 'D4', 'D12'],
    hasVerifiedRule: directClassicalPhalas.length > 0,
    conciseSummary: reconciledSummary,
    coreDisposition: `${secondLord.name} (Kuṭumba) • ${fourthLord.name} (Sukha)`,
    directClassicalPhalas,
    multiRuleSynthesis,
    modernMappings: [
      {
        id: 'map_family_modern',
        classicalConcept: 'Kuṭumba-sthāna & Sukha-sthāna',
        classicalSourceRef: 'BPHS Ch. 11-12',
        modernMappingText:
          'Corresponds to residential stability, family-of-origin relations, real estate management, and domestic work-life balance.',
        methodologyNote: 'Modern domestic environment mapping.',
      },
    ],
    contradictions: [],
    calculatedFacts,
    satisfiedRules: directClassicalPhalas.map((p) => ({
      rule: CANONICAL_RULES[p.ruleId] || CANONICAL_RULES.bphs_kutumba_griha_sukha,
      conditionsRequired: p.conditions.map((c) => c.description),
      conditionsMet: p.conditions.filter((c) => c.met).map((c) => c.description),
      status: p.verificationLevel,
      synthesisNote: p.directPhalaText,
    })),
    supportingFactors,
    limitingOrCounterbalancingFactors: limitingFactors,
    synthesisNarrative: multiRuleSynthesis,
    calculationBasisNotes: [
      `2nd Lord: ${secondLord.name} in House ${secondLordPlanet?.house}`,
      `4th Lord: ${fourthLord.name} in House ${fourthLordPlanet?.house}`,
      `Moon: ${moon.rashiName} (${moon.degreeStr})`,
    ],
    canonicalSources: [CANONICAL_RULES.bphs_kutumba_griha_sukha],
  };
}

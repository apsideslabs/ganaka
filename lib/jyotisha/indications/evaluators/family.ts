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
  phalaFromRule,
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

  // BPHS 14 and 15 - the 3rd and 4th bhavas.
  {
    const l3 = getHouseLord(chart, 3); const l3p: any = chart.planets[l3.id];
    const l4 = getHouseLord(chart, 4); const l4p: any = chart.planets[l4.id];
    const h3 = l3p?.house ?? 0; const h4 = l4p?.house ?? 0;
    directClassicalPhalas.push(
      phalaFromRule('bphs_sahaja_bhava_phala', 'phala_bphs_sahaja',
        [{ id: 'c_3rd_lord_placed_in_a_kendra_or_trikona', description: '3rd lord placed in a kendra or trikona', expected: '3rd lord placed in a kendra or trikona', observed: `House ${h3}`, met: [1,4,7,10,5,9].includes(h3) }],
        'The 3rd bhava governs siblings and courage; its lord well placed gives brothers and valour (bhratrman vikrami).',
        CANONICAL_RULES.bphs_sahaja_bhava_phala),
    );
    const own = /Own|Exalted|Moolatrikona/.test(String(l4p?.dignity ?? ''));
    directClassicalPhalas.push(
      phalaFromRule('bphs_sukha_bhava_phala', 'phala_bphs_sukha',
        [{ id: 'c_4th_lord_in_the_4th_or_in_its_own_sign', description: '4th lord in the 4th, or in its own sign / exaltation', expected: '4th lord in the 4th, or in its own sign / exaltation', observed: `House ${h4}, ${l4p?.dignity}`, met: h4 === 4 || own }],
        'The 4th lord in the 4th or in its own dignity gives full domestic comfort, land and vehicles (purnam grha-sukham).',
        CANONICAL_RULES.bphs_sukha_bhava_phala),
    );
  }

  // Phaladipika Ch. 8 - grahas in bhavas, organised by occupant.
  {
    const occ4 = ((chart.bhavas as any[]).find((b: any) => b.houseNumber === 4)?.occupants ?? []);
    const benefic = occ4.some((o: any) => ['jupiter','venus','mercury'].includes(String(o.planet ?? o)));
    directClassicalPhalas.push(
      phalaFromRule('phaladeepika_bhava_ashraya', 'phala_phaladeepika_bhava_ashraya',
        [{ id: 'c_pd_4th_benefic', description: 'A benefic occupies the 4th', expected: '>= 1 benefic', observed: occ4.length ? String(occ4.length) + ' occupant(s)' : 'empty', met: benefic }],
        'Phaladipika reads each graha in each house; a benefic in the 4th supports domestic comfort.',
        CANONICAL_RULES.phaladeepika_bhava_ashraya),
    );
  }

  // Jaimini 1.4.32-38 — siblings from the 3rd from the Upapada.
  {
    const ulRashi = (chart.jaimini?.arudhaPadas as any)?.twelfth ?? null;
    const thirdFromUl = ulRashi ? ((ulRashi - 1 + 2) % 12) + 1 : null;
    directClassicalPhalas.push(
      phalaFromRule('jaimini_upapada_siblings', 'phala_jaimini_upapada_siblings',
        [{ id: 'c_upapada_3rd', description: 'The Upapada resolves and its 3rd is read', expected: 'Upapada present', observed: ulRashi ? `UL rasi ${ulRashi}, 3rd = ${thirdFromUl}` : 'no Upapada', met: !!ulRashi }],
        'Siblings are read from the 3rd from the Upapada, with the grahas there naming their number and nature.',
        CANONICAL_RULES.jaimini_upapada_siblings),
    );
  }

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

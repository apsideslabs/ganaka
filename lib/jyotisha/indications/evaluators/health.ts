/**
 * Gaṇaka — Specialized Domain Evaluator: Health-Related Classical Indications
 * (षष्ठ-अष्टम भाव एवं देहस्वास्थ्य)
 * 
 * Sources: BPHS (Ch. 12 & 14), Phaladīpikā (Ch. 14), Sārāvalī (Ch. 20)
 */

import { JyotishaChart } from '../../types';
import { DomainIndication, DirectClassicalPhala, RuleCondition, CalculatedFact } from '../types';
import { CANONICAL_RULES } from '../classical-sources';
import {
  getHouseLord,
  getHouseOccupants,
  getShadbalaRatio,
  getHouseSAVBindus,
  makeFact,
  GRAHA_SANSKRIT_NAMES,
  phalaFromRule,
} from '../shared-utils';
import { reconcileRulesAndContradictions } from '../conflict-resolver';

export function evaluateHealthDomain(chart: JyotishaChart): DomainIndication {
  const lagneśa = getHouseLord(chart, 1);
  const sixthLord = getHouseLord(chart, 6);
  const eighthLord = getHouseLord(chart, 8);

  const lagneśaPlanet = chart.planets[lagneśa.id];
  const sixthLordPlanet = chart.planets[sixthLord.id];
  const eighthLordPlanet = chart.planets[eighthLord.id];

  const lagneśaShadbala = getShadbalaRatio(chart, lagneśa.id);
  const sixthLordShadbala = getShadbalaRatio(chart, sixthLord.id);
  const sixthSAV = getHouseSAVBindus(chart, 6);
  const eighthSAV = getHouseSAVBindus(chart, 8);

  // Immune / resistance dominance: Lagneśa Śaḍbala > Ṣaṣṭheśa Śaḍbala
  const isImmuneResistanceStrong = lagneśaShadbala >= sixthLordShadbala;

  const calculatedFacts: CalculatedFact[] = [
    makeFact(
      'fact_dehabala_ratio',
      'Śaḍbala & Strength',
      'Lagneśa vs Ṣaṣṭheśa Strength (Dehabala vs Rogabala)',
      `Lagneśa: ${lagneśaShadbala.toFixed(2)}x | Ṣaṣṭheśa: ${sixthLordShadbala.toFixed(2)}x`,
      isImmuneResistanceStrong
        ? 'Lagneśa exceeds 6th lord, confirming robust immune defense and rapid recuperation.'
        : 'Requires consistent wellness habits to fortify recuperative vitality.',
      isImmuneResistanceStrong ? 'favorable' : 'limiting'
    ),
    makeFact(
      'fact_sixth_house_roga',
      'Bhāva & Bhāveśa',
      '6th House (Rogabhāva • Acute Imbalances)',
      `${sixthLord.name} in House ${sixthLordPlanet?.house || 'N/A'}`,
      'Governs acute physiological vulnerabilities, inflammatory episodes, and bodily humors (Doṣas).',
      'neutral'
    ),
    makeFact(
      'fact_eighth_house_ayu',
      'Bhāva & Bhāveśa',
      '8th House (Āyurbhāva • Longevity & Chronic Factors)',
      `${eighthLord.name} in House ${eighthLordPlanet?.house || 'N/A'}`,
      'Governs longevity, deep constitutional endurance, and systemic longevity reserves.',
      'neutral'
    ),
    makeFact(
      'fact_sav_health',
      'Aṣṭakavarga',
      '6th & 8th House SAV Bindus',
      `6th House: ${sixthSAV} Bindus | 8th House: ${eighthSAV} Bindus`,
      'Aṣṭakavarga vitality distribution for acute recovery and metabolic resilience.',
      'neutral'
    ),
  ];

  const directClassicalPhalas: DirectClassicalPhala[] = [];

  // Rule 1: BPHS Ch. 12 & 14 Dehabala vs Rogabala
  const cond1: RuleCondition[] = [
    {
      id: 'c_lagnesha_exceeds_sixthesha',
      description: 'Lagneśa endowed with superior Śaḍbala over 6th lord of ailments',
      expected: 'Lagneśa Śaḍbala >= Ṣaṣṭheśa Śaḍbala',
      observed: `Lagneśa ${lagneśaShadbala.toFixed(2)}x vs Ṣaṣṭheśa ${sixthLordShadbala.toFixed(2)}x`,
      met: isImmuneResistanceStrong,
    },
  ];

  if (cond1.every((c) => c.met)) {
    directClassicalPhalas.push({
      id: 'phala_bphs_dehabala_resilience',
      ruleId: 'bphs_roga_dehabala_arishta',
      sourceText: CANONICAL_RULES.bphs_roga_dehabala_arishta.sourceText,
      chapterAndVerse: CANONICAL_RULES.bphs_roga_dehabala_arishta.chapterAndVerse,
      sanskritTitle: CANONICAL_RULES.bphs_roga_dehabala_arishta.sanskritTitle || '',
      sanskritShloka: CANONICAL_RULES.bphs_roga_dehabala_arishta.sanskritShloka,
      editionOrManuscript: CANONICAL_RULES.bphs_roga_dehabala_arishta.editionOrManuscript,
      conditions: cond1,
      allConditionsMet: true,
      verificationLevel: 'Fully Verified',
      directPhalaText:
        'Vital constitutional resistance (Dehabala) exceeds physiological stressors (Rogabala), ensuring active natural immunity and rapid physical recovery.',
    });
  }

  const supportingFactors: string[] = [];
  const limitingFactors: string[] = [];

  if (isImmuneResistanceStrong) supportingFactors.push('Lagneśa Śaḍbala exceeds 6th lord, supporting natural vital resistance.');
  if (lagneśaShadbala >= 1.0) supportingFactors.push(`Ascendant lord possesses strong Śaḍbala (${lagneśaShadbala.toFixed(2)}x).`);

  if (!isImmuneResistanceStrong) limitingFactors.push('Ṣaṣṭheśa is relatively prominent, recommending proactive dietary and lifestyle moderation.');

  const { multiRuleSynthesis, reconciledSummary } = reconcileRulesAndContradictions(
    directClassicalPhalas,
    [],
    []
  );

  // BPHS 17 and 19 - the 6th and 8th bhavas.
  {
    const l6 = getHouseLord(chart, 6); const l6p: any = chart.planets[l6.id];
    const l8 = getHouseLord(chart, 8); const l8p: any = chart.planets[l8.id];
    const h6 = l6p?.house ?? 0; const h8 = l8p?.house ?? 0;
    directClassicalPhalas.push(
      phalaFromRule('bphs_shashtha_bhava_phala', 'phala_bphs_shashtha',
        [{ id: 'c_6th_lord_not_in_the_lagna_or_the_8th', description: '6th lord not in the lagna or the 8th', expected: '6th lord not in the lagna or the 8th', observed: `House ${h6}`, met: ![1, 8].includes(h6) }],
        'The 6th lord in its own sign, the lagna or the 8th gives wounds on the body; the graha joined to it names the affected region.',
        CANONICAL_RULES.bphs_shashtha_bhava_phala),
    );
    directClassicalPhalas.push(
      phalaFromRule('bphs_ayur_bhava_phala', 'phala_bphs_ayur',
        [{ id: 'c_8th_lord_not_in_a_trika_house', description: '8th lord not in a trika house', expected: '8th lord not in a trika house', observed: `House ${h8}`, met: ![6, 12].includes(h8) }],
        'The 8th bhava governs longevity; its lord strong and well placed lengthens life, afflicted it shortens it. BPHS requires the maraka analysis of Ch. 44 before any longevity statement.',
        CANONICAL_RULES.bphs_ayur_bhava_phala),
    );
  }

  // Phaladipika Ch. 14 - disease from the 6th and the lagna lord.
  {
    const l6 = getHouseLord(chart, 6); const l6p: any = chart.planets[l6.id];
    directClassicalPhalas.push(
      phalaFromRule('phaladeepika_roga_nirnaya', 'phala_phaladeepika_roga',
        [{ id: 'c_pd_6th_lord', description: '6th lord not placed in the lagna', expected: 'not house 1', observed: `House ${l6p?.house}`, met: l6p?.house !== 1 }],
        'Disease is read from the 6th bhava and its lord, the lagna and its lord, and the graha afflicting them.',
        CANONICAL_RULES.phaladeepika_roga_nirnaya),
    );
  }

  return {
    id: 'health',
    title: 'Health-Related Classical Indications',
    sanskritTitle: 'षष्ठ-अष्टम भाव एवं देहस्वास्थ्य',
    subtitle: 'Constitutional resistance (Dehabala), 6th/8th houses, and Tridoṣa balance',
    primaryBhavas: [1, 6, 8],
    keyGrahas: [lagneśa.id, sixthLord.id, eighthLord.id, 'saturn'],
    keyVargas: ['D1', 'D9'],
    hasVerifiedRule: directClassicalPhalas.length > 0,
    conciseSummary: reconciledSummary,
    coreDisposition: `Dehabala ${lagneśaShadbala.toFixed(2)}x • Rogabala ${sixthLordShadbala.toFixed(2)}x`,
    directClassicalPhalas,
    multiRuleSynthesis,
    modernMappings: [
      {
        id: 'map_health_modern',
        classicalConcept: 'Dehabala vs Rogabala Equilibrium',
        classicalSourceRef: 'BPHS Ch. 12 & 14',
        modernMappingText:
          'Corresponds to baseline metabolic endurance, immune vigilance, circadian balance, and stress adaptation capacity.',
        methodologyNote:
          'Clearly distinguished as a lifestyle/constitutional mapping, never a medical diagnosis.',
      },
    ],
    contradictions: [],
    calculatedFacts,
    satisfiedRules: directClassicalPhalas.map((p) => ({
      rule: CANONICAL_RULES[p.ruleId] || CANONICAL_RULES.bphs_roga_dehabala_arishta,
      conditionsRequired: p.conditions.map((c) => c.description),
      conditionsMet: p.conditions.filter((c) => c.met).map((c) => c.description),
      status: p.verificationLevel,
      synthesisNote: p.directPhalaText,
    })),
    supportingFactors,
    limitingOrCounterbalancingFactors: limitingFactors,
    synthesisNarrative: multiRuleSynthesis,
    calculationBasisNotes: [
      `Lagneśa: ${lagneśa.name} (${lagneśaShadbala.toFixed(2)}x Śaḍbala)`,
      `6th Lord: ${sixthLord.name} (${sixthLordShadbala.toFixed(2)}x Śaḍbala)`,
      `8th Lord: ${eighthLord.name} in House ${eighthLordPlanet?.house}`,
      `6th SAV: ${sixthSAV} bindus | 8th SAV: ${eighthSAV} bindus`,
    ],
    canonicalSources: [CANONICAL_RULES.bphs_roga_dehabala_arishta],
  };
}

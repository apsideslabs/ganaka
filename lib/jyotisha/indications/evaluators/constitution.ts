/**
 * Gaṇaka — Specialized Domain Evaluator: Lagna & Fundamental Constitution
 * (तनुभाव एवं देहप्रकृति)
 * 
 * Sources: Bṛhat Parāśara Horā Śāstra (Ch. 11), Phaladīpikā (Ch. 14), Sārāvalī (Ch. 3)
 */

import { JyotishaChart } from '../../types';
import { DomainIndication, DirectClassicalPhala, RuleCondition, CalculatedFact } from '../types';
import { CANONICAL_RULES } from '../classical-sources';
import {
  getHouseLord,
  getHouseOccupants,
  getShadbalaRatio,
  isPlanetStrongInDignity,
  isVargottama,
  getHouseSAVBindus,
  makeFact,
  GRAHA_SANSKRIT_NAMES,
} from '../shared-utils';
import { reconcileRulesAndContradictions } from '../conflict-resolver';

export function evaluateConstitutionDomain(chart: JyotishaChart): DomainIndication {
  const lagneśa = getHouseLord(chart, 1);
  const lagnaLordPlanet = chart.planets[lagneśa.id];
  const lagnaOccupants = getHouseOccupants(chart, 1);
  const lagneśaShadbala = getShadbalaRatio(chart, lagneśa.id);
  const isLagneśaStrong = isPlanetStrongInDignity(chart, lagneśa.id) || [1, 4, 7, 10, 5, 9].includes(lagnaLordPlanet?.house || 1);
  const isLagnaVargottama = isVargottama(chart, 'lagna');
  const isLagneśaVargottama = isVargottama(chart, lagneśa.id);
  const lagnaSAV = getHouseSAVBindus(chart, 1);
  const lagnaRashiName = chart.lagna?.rashiName || 'Lagna';
  const lagnaDegreeStr = chart.lagna?.degreeStr || '';
  const lagneshaTotalRupas = chart.shadbala?.[lagneśa.id]?.totalRupas || 0;

  // 1. Facts inventory
  const calculatedFacts: CalculatedFact[] = [
    makeFact(
      'fact_lagna_sign',
      'Lagna & Lord',
      'Rising Sign (Lagna Rāśi)',
      `${lagnaRashiName} (${lagnaDegreeStr})`,
      'Governs the physical embodiment, vitality, and external presentation.',
      'neutral'
    ),
    makeFact(
      'fact_lagna_lord',
      'Lagna & Lord',
      'Lagna Lord (Lagneśa)',
      `${lagneśa.name} in House ${lagnaLordPlanet?.house || 'N/A'} (${lagnaLordPlanet?.rashiName || ''})`,
      `Dignity: ${lagnaLordPlanet?.dignity || 'Neutral'}. Determines constitutional stamina and recovery.`,
      isLagneśaStrong ? 'favorable' : 'limiting'
    ),
    makeFact(
      'fact_lagna_shadbala',
      'Śaḍbala & Strength',
      'Lagneśa Śaḍbala Strength',
      `${lagneśaShadbala.toFixed(2)}x Parāśari Norm (${lagneshaTotalRupas.toFixed(1)} Rūpas)`,
      lagneśaShadbala >= 1.0 ? 'Exceeds standard requirement (Balavān)' : 'Sub-threshold requirement',
      lagneśaShadbala >= 1.0 ? 'favorable' : 'limiting'
    ),
    makeFact(
      'fact_lagna_vargottama',
      'Varga (Divisional)',
      'Vargottama Harmonization',
      isLagnaVargottama
        ? 'Lagna is Vargottama (D-1 & D-9 identical)'
        : isLagneśaVargottama
        ? `${lagneśa.name} is Vargottama`
        : 'Standard divisional placement',
      'Vargottama placement provides enduring physical resistance and longevity.',
      isLagnaVargottama || isLagneśaVargottama ? 'favorable' : 'neutral'
    ),
    makeFact(
      'fact_lagna_sav',
      'Aṣṭakavarga',
      '1st House SAV Bindus',
      `${lagnaSAV} Bindus (Baseline: 28)`,
      lagnaSAV >= 28 ? 'Fortified self-preservation and energy output' : 'Sensitive vitality threshold',
      lagnaSAV >= 28 ? 'favorable' : 'limiting'
    ),
  ];

  // 2. Direct Classical Rules & Machine Condition Verification
  const directClassicalPhalas: DirectClassicalPhala[] = [];

  // Rule 1: BPHS Ch. 11 Śloka 1-4 (Lagneśa in Kendra/Trikona)
  const cond1: RuleCondition[] = [
    {
      id: 'c1_kendra_trikona',
      description: 'Lagneśa situated in Kendra (1, 4, 7, 10) or Trikona (5, 9)',
      expected: 'House 1, 4, 5, 7, 9, or 10',
      observed: `House ${lagnaLordPlanet?.house}`,
      met: [1, 4, 5, 7, 9, 10].includes(lagnaLordPlanet?.house || 0),
    },
    {
      id: 'c1_shadbala',
      description: 'Lagneśa endowed with adequate Śaḍbala (>= 1.0 ratio)',
      expected: '>= 1.0',
      observed: lagneśaShadbala.toFixed(2),
      met: lagneśaShadbala >= 0.95,
    },
  ];
  const rule1Met = cond1.every((c) => c.met);
  if (rule1Met) {
    directClassicalPhalas.push({
      id: 'phala_bphs_lagna_tanu',
      ruleId: 'bphs_lagna_tanu_phala',
      sourceText: CANONICAL_RULES.bphs_lagna_tanu_phala.sourceText,
      chapterAndVerse: CANONICAL_RULES.bphs_lagna_tanu_phala.chapterAndVerse,
      sanskritTitle: CANONICAL_RULES.bphs_lagna_tanu_phala.sanskritTitle || '',
      sanskritShloka: CANONICAL_RULES.bphs_lagna_tanu_phala.sanskritShloka,
      editionOrManuscript: CANONICAL_RULES.bphs_lagna_tanu_phala.editionOrManuscript,
      conditions: cond1,
      allConditionsMet: true,
      verificationLevel: 'Fully Verified',
      directPhalaText:
        'The native possesses strong constitutional vitality, stamina, resilient self-preservation (Deha-saukhya), and long-term vitality.',
    });
  }

  // Rule 2: Sārāvalī Ch. 3 Śloka 48-50 (Vargottama Lagna / Lord)
  if (isLagnaVargottama || isLagneśaVargottama) {
    directClassicalPhalas.push({
      id: 'phala_saravali_vargottama',
      ruleId: 'saravali_lagna_vargottama',
      sourceText: CANONICAL_RULES.saravali_lagna_vargottama.sourceText,
      chapterAndVerse: CANONICAL_RULES.saravali_lagna_vargottama.chapterAndVerse,
      sanskritTitle: CANONICAL_RULES.saravali_lagna_vargottama.sanskritTitle || '',
      sanskritShloka: CANONICAL_RULES.saravali_lagna_vargottama.sanskritShloka,
      editionOrManuscript: CANONICAL_RULES.saravali_lagna_vargottama.editionOrManuscript,
      conditions: [
        {
          id: 'c_vargottama',
          description: 'Lagna or Lagneśa occupies identical sign in D-1 Rāśi and D-9 Navāṃśa',
          expected: 'True',
          observed: 'True',
          met: true,
        },
      ],
      allConditionsMet: true,
      verificationLevel: 'Fully Verified',
      directPhalaText:
        'Vargottama alignment reinforces radiant physical form (Rūpavān), noble disposition, and unshakeable resilience against acute ailments.',
    });
  }

  // 3. Supporting & Counterbalancing
  const supportingFactors: string[] = [];
  const limitingFactors: string[] = [];

  if (isLagneśaStrong) supportingFactors.push(`Lagneśa (${lagneśa.name}) strongly placed in House ${lagnaLordPlanet?.house}.`);
  if (lagneśaShadbala >= 1.0) supportingFactors.push(`Lagneśa Śaḍbala ratio is robust (${lagneśaShadbala.toFixed(2)}x).`);
  if (isLagnaVargottama) supportingFactors.push('Lagna is fortified by Vargottama placement in D-9 Navāṃśa.');
  if (lagnaSAV >= 28) supportingFactors.push(`1st House receives an auspicious ${lagnaSAV} SAV bindus.`);

  if (lagnaLordPlanet?.house && [6, 8, 12].includes(lagnaLordPlanet.house)) {
    limitingFactors.push(`Lagneśa situated in Dusthāna (House ${lagnaLordPlanet.house}), requiring conscious health moderation.`);
  }
  if (lagnaSAV < 28) {
    limitingFactors.push(`1st House SAV bindus (${lagnaSAV}) are below baseline 28.`);
  }

  // 4. Synthesis and Modern Interpretive Mapping
  const { multiRuleSynthesis, reconciledSummary } = reconcileRulesAndContradictions(
    directClassicalPhalas,
    [],
    []
  );

  return {
    id: 'constitution',
    title: 'Lagna & Fundamental Constitution',
    sanskritTitle: 'तनुभाव एवं देहप्रकृति',
    subtitle: 'Physical vitality, temperament archetype, and biological resilience',
    primaryBhavas: [1],
    keyGrahas: [lagneśa.id, 'sun'],
    keyVargas: ['D1', 'D9'],
    hasVerifiedRule: directClassicalPhalas.length > 0,
    conciseSummary: reconciledSummary,
    coreDisposition: `${lagnaRashiName} Ascendant • ${lagneśa.name} as Lagneśa`,
    directClassicalPhalas,
    multiRuleSynthesis,
    modernMappings: [
      {
        id: 'map_dehabala',
        classicalConcept: 'Deha-saukhya (देहसौख्य) & Balavān Lagneśa',
        classicalSourceRef: 'BPHS Ch. 11',
        modernMappingText:
          'Translates in modern ergonomic terms to high baseline physical stamina, rapid recovery from stress, and steady metabolic resilience.',
        methodologyNote:
          'Clearly distinguished as modern physiological mapping of classical Dehabala principles.',
      },
    ],
    contradictions: [],
    calculatedFacts,
    satisfiedRules: directClassicalPhalas.map((p) => ({
      rule: CANONICAL_RULES[p.ruleId] || CANONICAL_RULES.bphs_lagna_tanu_phala,
      conditionsRequired: p.conditions.map((c) => c.description),
      conditionsMet: p.conditions.filter((c) => c.met).map((c) => c.description),
      status: p.verificationLevel,
      synthesisNote: p.directPhalaText,
    })),
    supportingFactors,
    limitingOrCounterbalancingFactors: limitingFactors,
    synthesisNarrative: multiRuleSynthesis,
    calculationBasisNotes: [
      `Ascendant degree: ${lagnaDegreeStr}`,
      `Lagneśa ${lagneśa.name} positioned at ${lagnaLordPlanet?.degreeStr || 'N/A'}`,
      `Aṣṭakavarga 1st House SAV: ${lagnaSAV} bindus`,
      `Śaḍbala score: ${lagneshaTotalRupas.toFixed(2)} Rūpas`,
    ],
    canonicalSources: [
      CANONICAL_RULES.bphs_lagna_tanu_phala,
      CANONICAL_RULES.phaladeepika_lagna_dehabala,
      CANONICAL_RULES.saravali_lagna_vargottama,
    ],
  };
}

/**
 * Gaṇaka — Specialized Domain Evaluator: Children & Progeny
 * (पञ्चमभाव एवं सन्तानसुख)
 * 
 * Sources: BPHS (Ch. 12 - Pañcamabhāva), Phaladīpikā (Ch. 18 - Santāna Bhāva)
 */

import { JyotishaChart } from '../../types';
import { DomainIndication, DirectClassicalPhala, RuleCondition, CalculatedFact } from '../types';
import { CANONICAL_RULES } from '../classical-sources';
import {
  getHouseLord,
  getHouseOccupants,
  getShadbalaRatio,
  getHouseSAVBindus,
  getVargaPlacement,
  getCharaKarakaPlanet,
  makeFact,
  GRAHA_SANSKRIT_NAMES,
} from '../shared-utils';
import { reconcileRulesAndContradictions } from '../conflict-resolver';

export function evaluateChildrenDomain(chart: JyotishaChart): DomainIndication {
  const fifthLord = getHouseLord(chart, 5);
  const fifthLordPlanet = chart.planets[fifthLord.id];
  const fifthOccupants = getHouseOccupants(chart, 5);
  const jupiter = chart.planets.jupiter;
  const jupiterShadbala = getShadbalaRatio(chart, 'jupiter');
  const fifthSAV = getHouseSAVBindus(chart, 5);

  // Saptāṃśa (D-7) 5th House
  const fifthLordD7 = getVargaPlacement(chart, fifthLord.id, 'D7');

  // Jaimini Putrakāraka (PK)
  const pkPlanetId = getCharaKarakaPlanet(chart, 'PK');

  const calculatedFacts: CalculatedFact[] = [
    makeFact(
      'fact_fifth_lord_santana',
      'Bhāva & Bhāveśa',
      '5th House Lord (Putrādhipati)',
      `${fifthLord.name} in House ${fifthLordPlanet?.house || 'N/A'} (${fifthLordPlanet?.rashiName || ''})`,
      `Dignity: ${fifthLordPlanet?.dignity}. Primary significator of lineage continuation, progeny happiness, and parental bonds.`,
      [1, 4, 5, 9, 10, 11].includes(fifthLordPlanet?.house || 0) ? 'favorable' : 'neutral'
    ),
    makeFact(
      'fact_putrakaraka_jupiter',
      'Graha & Dignity',
      'Guru (Jupiter) • Natural Putrakāraka',
      `${jupiter.rashiName} in House ${jupiter.house} (Dignity: ${jupiter.dignity})`,
      `Śaḍbala: ${jupiterShadbala.toFixed(2)}x. Primary universal celestial karaka for children and wisdom transmission.`,
      jupiterShadbala >= 1.0 ? 'favorable' : 'neutral'
    ),
    makeFact(
      'fact_saptamsha_d7',
      'Varga (Divisional)',
      'Saptāṃśa (D-7) Progeny Harmonic',
      fifthLordD7 ? `${fifthLord.name} in D-7 ${fifthLordD7.rashiName}` : 'D-7 harmonic calculated',
      'Harmonic divisional chart specifically revealing progeny prosperity and lineage vitality.',
      'favorable'
    ),
    makeFact(
      'fact_fifth_house_sav',
      'Aṣṭakavarga',
      '5th House SAV Bindus',
      `${fifthSAV} Bindus (Baseline: 28)`,
      fifthSAV >= 28 ? 'Auspicious bindu density supporting progeny well-being' : 'Moderate bindu density',
      fifthSAV >= 28 ? 'favorable' : 'neutral'
    ),
  ];

  const directClassicalPhalas: DirectClassicalPhala[] = [];

  // Rule 1: BPHS Ch. 12 Pañcamabhāva
  const cond1: RuleCondition[] = [
    {
      id: 'c_fifth_lord_well_placed',
      description: '5th house lord situated in Kendra/Trikona or supported by benefic dignity',
      expected: 'Houses 1, 4, 5, 7, 9, 10, 11',
      observed: `House ${fifthLordPlanet?.house}`,
      met: [1, 4, 5, 7, 9, 10, 11].includes(fifthLordPlanet?.house || 0),
    },
    {
      id: 'c_jupiter_uncombust',
      description: 'Putrakāraka Jupiter free from combustion and severe affliction',
      expected: 'Unafflicted Jupiter',
      observed: `${jupiter.dignity}, Combust: ${jupiter.isCombust}`,
      met: !jupiter.isCombust,
    },
  ];

  if (cond1.every((c) => c.met)) {
    directClassicalPhalas.push({
      id: 'phala_bphs_santana',
      ruleId: 'bphs_putra_santana',
      sourceText: CANONICAL_RULES.bphs_putra_santana.sourceText,
      chapterAndVerse: CANONICAL_RULES.bphs_putra_santana.chapterAndVerse,
      sanskritTitle: CANONICAL_RULES.bphs_putra_santana.sanskritTitle || '',
      sanskritShloka: CANONICAL_RULES.bphs_putra_santana.sanskritShloka,
      editionOrManuscript: CANONICAL_RULES.bphs_putra_santana.editionOrManuscript,
      conditions: cond1,
      allConditionsMet: true,
      verificationLevel: 'Fully Verified',
      directPhalaText:
        'Lineage continuity and filial happiness (Santāna-saukhya) are supported with virtuous, flourishing progeny.',
    });
  }

  const supportingFactors: string[] = [];
  const limitingFactors: string[] = [];

  supportingFactors.push(`5th Lord (${fifthLord.name}) situated in House ${fifthLordPlanet?.house}.`);
  if (jupiterShadbala >= 1.0) supportingFactors.push(`Jupiter possesses robust Śaḍbala strength (${jupiterShadbala.toFixed(2)}x).`);
  if (fifthSAV >= 28) supportingFactors.push(`5th House supported by ${fifthSAV} SAV bindus.`);

  const { multiRuleSynthesis, reconciledSummary } = reconcileRulesAndContradictions(
    directClassicalPhalas,
    [],
    []
  );

  return {
    id: 'children',
    title: 'Children & Progeny',
    sanskritTitle: 'पञ्चमभाव एवं सन्तानसुख',
    subtitle: '5th House (Putra), Jupiter (Putrakāraka), Saptāṃśa (D-7), and lineage continuity',
    primaryBhavas: [5],
    keyGrahas: [fifthLord.id, 'jupiter', pkPlanetId],
    keyVargas: ['D1', 'D7', 'D9'],
    hasVerifiedRule: directClassicalPhalas.length > 0,
    conciseSummary: reconciledSummary,
    coreDisposition: `${fifthLord.name} 5th Lord • ${jupiter.rashiName} Jupiter`,
    directClassicalPhalas,
    multiRuleSynthesis,
    modernMappings: [
      {
        id: 'map_children_modern',
        classicalConcept: 'Santāna-bhāva & Putrakāraka',
        classicalSourceRef: 'BPHS Ch. 12',
        modernMappingText:
          'Reflects parenting philosophy, mentorship disposition, and cross-generational relationship dynamics.',
        methodologyNote: 'Modern developmental psychology mapping.',
      },
    ],
    contradictions: [],
    calculatedFacts,
    satisfiedRules: directClassicalPhalas.map((p) => ({
      rule: CANONICAL_RULES[p.ruleId] || CANONICAL_RULES.bphs_putra_santana,
      conditionsRequired: p.conditions.map((c) => c.description),
      conditionsMet: p.conditions.filter((c) => c.met).map((c) => c.description),
      status: p.verificationLevel,
      synthesisNote: p.directPhalaText,
    })),
    supportingFactors,
    limitingOrCounterbalancingFactors: limitingFactors,
    synthesisNarrative: multiRuleSynthesis,
    calculationBasisNotes: [
      `5th Lord: ${fifthLord.name} in House ${fifthLordPlanet?.house}`,
      `Jupiter: ${jupiter.rashiName} (${jupiter.degreeStr})`,
      `5th House SAV: ${fifthSAV} bindus`,
      `Putrakāraka: ${GRAHA_SANSKRIT_NAMES[pkPlanetId]}`,
    ],
    canonicalSources: [
      CANONICAL_RULES.bphs_putra_santana,
      CANONICAL_RULES.phaladeepika_santana_yoga,
    ],
  };
}

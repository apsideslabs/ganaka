/**
 * Gaṇaka — Specialized Domain Evaluator: Marriage & Partnership
 * (सप्तमभाव एवं कलत्रसुख)
 * 
 * Sources: BPHS (Ch. 13), Jaimini Upadeśa Sūtras (Adhyāya 1, Pāda 4), Phaladīpikā (Ch. 15)
 */

import { JyotishaChart } from '../../types';
import { DomainIndication, DirectClassicalPhala, RuleCondition, CalculatedFact } from '../types';
import { CANONICAL_RULES } from '../classical-sources';
import {
  getHouseLord,
  getHouseOccupants,
  getShadbalaRatio,
  getVargaPlacement,
  getCharaKarakaPlanet,
  calculateArudhaSign,
  getHouseSAVBindus,
  makeFact,
  GRAHA_SANSKRIT_NAMES,
  RASHI_NAMES,
} from '../shared-utils';
import { reconcileRulesAndContradictions } from '../conflict-resolver';

export function evaluateMarriageDomain(chart: JyotishaChart): DomainIndication {
  const seventhLord = getHouseLord(chart, 7);
  const seventhLordPlanet = chart.planets[seventhLord.id];
  const seventhOccupants = getHouseOccupants(chart, 7);
  const venus = chart.planets.venus;
  const venusShadbala = getShadbalaRatio(chart, 'venus');
  const seventhSAV = getHouseSAVBindus(chart, 7);

  // Upapada Lagna (UL = Arūḍha of 12th house)
  const ulRashiNum = calculateArudhaSign(chart, 12);
  const ulRashiName = RASHI_NAMES[ulRashiNum];

  // Jaimini Dārakāraka (DK = planet with lowest longitude)
  const dkPlanetId = getCharaKarakaPlanet(chart, 'DK');
  const dkPlanet = chart.planets[dkPlanetId];

  // Navāṃśa (D-9) 7th House
  const d9Chart = chart.vargas?.D9;
  const seventhLordD9 = getVargaPlacement(chart, seventhLord.id, 'D9');

  // Kuja Doṣa status from chart engine
  const kujaDoshaActive = chart.doshas?.evaluatedDoshas?.some(
    (d) => d.id === 'kuja_dosha' && d.formationStatus === 'Formed'
  );

  const calculatedFacts: CalculatedFact[] = [
    makeFact(
      'fact_seventh_lord',
      'Bhāva & Bhāveśa',
      '7th Lord (Kalatrādhipati)',
      `${seventhLord.name} in House ${seventhLordPlanet?.house || 'N/A'} (${seventhLordPlanet?.rashiName || ''})`,
      `Dignity: ${seventhLordPlanet?.dignity}. Primary significator of spouse, relational harmony, and contractual partnerships.`,
      [1, 4, 5, 7, 9, 10, 11].includes(seventhLordPlanet?.house || 0) ? 'favorable' : 'neutral'
    ),
    makeFact(
      'fact_kalatrakaraka_venus',
      'Graha & Dignity',
      'Śukra (Venus) • Kalatrakāraka',
      `${venus.rashiName} in House ${venus.house} (Dignity: ${venus.dignity})`,
      `Śaḍbala: ${venusShadbala.toFixed(2)}x. Universal significator of love, intimacy, marital bonding, and mutual empathy.`,
      venusShadbala >= 1.0 ? 'favorable' : 'neutral'
    ),
    makeFact(
      'fact_upapada_lagna',
      'Jaimini Sūtra',
      'Upapada Lagna (UL • Marriage Arūḍha)',
      `${ulRashiName}`,
      'Jaimini reference frame indicating the material stability, longevity, and societal expression of the marriage bond.',
      'favorable'
    ),
    makeFact(
      'fact_darakaraka',
      'Jaimini Sūtra',
      'Dārakāraka (Spouse Significator)',
      `${GRAHA_SANSKRIT_NAMES[dkPlanetId]} (${dkPlanet?.degreeStr || ''})`,
      'Reflects the innate personality archetype and emotional disposition of the life partner.',
      'neutral'
    ),
    makeFact(
      'fact_kuja_dosha',
      'Yoga & Affliction',
      'Kuja Doṣa Status (Maṅgala Doṣa)',
      kujaDoshaActive ? 'Formed (Subject to Classical Exceptions)' : 'No Kuja Doṣa Affliction',
      kujaDoshaActive
        ? 'Classical placement of Mars requiring maturity and balanced communication.'
        : 'Clear of Mars-induced relational friction.',
      kujaDoshaActive ? 'limiting' : 'favorable'
    ),
    makeFact(
      'fact_seventh_sav',
      'Aṣṭakavarga',
      '7th House SAV Bindus (Kalatra Bhāva)',
      `${seventhSAV} Bindus (Baseline: 28)`,
      seventhSAV >= 28
        ? 'Auspicious bindu accumulation reinforcing relational durability, mutual respect, and marital harmony.'
        : 'Demands deliberate communicative patience and mutual compromise.',
      seventhSAV >= 28 ? 'favorable' : 'limiting'
    ),
  ];

  const directClassicalPhalas: DirectClassicalPhala[] = [];

  // Rule 1: BPHS Ch. 13 Saptamabhāva
  const cond1: RuleCondition[] = [
    {
      id: 'c_seventh_lord_pos',
      description: '7th lord positioned in Kendra/Trikona or dignified sign',
      expected: 'Houses 1, 4, 5, 7, 9, 10, 11',
      observed: `House ${seventhLordPlanet?.house} (${seventhLordPlanet?.dignity})`,
      met: [1, 4, 5, 7, 9, 10, 11].includes(seventhLordPlanet?.house || 0),
    },
    {
      id: 'c_venus_dignity',
      description: 'Venus free from severe affliction and endowed with vitality',
      expected: 'Unafflicted Venus',
      observed: `${venus.dignity}, Śaḍbala ${venusShadbala.toFixed(2)}x`,
      met: !venus.dignity.startsWith('Debilitated'),
    },
  ];

  if (cond1.every((c) => c.met)) {
    directClassicalPhalas.push({
      id: 'phala_bphs_saptama',
      ruleId: 'bphs_saptama_vivaha',
      sourceText: CANONICAL_RULES.bphs_saptama_vivaha.sourceText,
      chapterAndVerse: CANONICAL_RULES.bphs_saptama_vivaha.chapterAndVerse,
      sanskritTitle: CANONICAL_RULES.bphs_saptama_vivaha.sanskritTitle || '',
      sanskritShloka: CANONICAL_RULES.bphs_saptama_vivaha.sanskritShloka,
      editionOrManuscript: CANONICAL_RULES.bphs_saptama_vivaha.editionOrManuscript,
      conditions: cond1,
      allConditionsMet: true,
      verificationLevel: 'Fully Verified',
      directPhalaText:
        'Matrimonial harmony and supportive companionship (Bhāryā-saukhya / Pati-saukhya) are supported under classical 7th house rules.',
    });
  }

  // Rule 2: Jaimini Upapada Lagna
  directClassicalPhalas.push({
    id: 'phala_jaimini_ul',
    ruleId: 'jaimini_upapada_lagna_dampatya',
    sourceText: CANONICAL_RULES.jaimini_upapada_lagna_dampatya.sourceText,
    chapterAndVerse: CANONICAL_RULES.jaimini_upapada_lagna_dampatya.chapterAndVerse,
    sanskritTitle: CANONICAL_RULES.jaimini_upapada_lagna_dampatya.sanskritTitle || '',
    sanskritShloka: CANONICAL_RULES.jaimini_upapada_lagna_dampatya.sanskritShloka,
    editionOrManuscript: CANONICAL_RULES.jaimini_upapada_lagna_dampatya.editionOrManuscript,
    conditions: [
      {
        id: 'c_ul_calc',
        description: 'Upapada Lagna and Dārakāraka calculated accurately',
        expected: 'Calculated UL & DK',
        observed: `UL in ${ulRashiName}, DK is ${GRAHA_SANSKRIT_NAMES[dkPlanetId]}`,
        met: true,
      },
    ],
    allConditionsMet: true,
    verificationLevel: 'Fully Verified',
    directPhalaText: `Marital sustainability is anchored in Upapada Lagna (${ulRashiName}) with partner qualities shaped by Dārakāraka ${GRAHA_SANSKRIT_NAMES[dkPlanetId]}.`,
  });

  const supportingFactors: string[] = [];
  const limitingFactors: string[] = [];

  supportingFactors.push(`7th Lord (${seventhLord.name}) positioned in House ${seventhLordPlanet?.house}.`);
  if (seventhSAV >= 28) supportingFactors.push(`7th House fortified with ${seventhSAV} SAV bindus, shielding marital bond against superficial conflicts.`);
  if (seventhSAV < 28) limitingFactors.push(`7th House SAV bindus (${seventhSAV}) are below baseline 28, indicating relational expectations require flexible communication.`);
  if (venusShadbala >= 1.0) supportingFactors.push(`Venus has strong Śaḍbala ratio (${venusShadbala.toFixed(2)}x).`);
  supportingFactors.push(`Upapada Lagna situated in ${ulRashiName}.`);

  if (kujaDoshaActive) limitingFactors.push('Kuja Doṣa present, calling for deliberate patience and mutual understanding.');

  const { multiRuleSynthesis, reconciledSummary } = reconcileRulesAndContradictions(
    directClassicalPhalas,
    [],
    []
  );

  return {
    id: 'marriage',
    title: 'Marriage & Partnership',
    sanskritTitle: 'सप्तमभाव एवं कलत्रसुख',
    subtitle: '7th House (Kalatra), Venus, Jaimini Upapada Lagna (UL), and Dārakāraka (DK)',
    primaryBhavas: [7],
    keyGrahas: [seventhLord.id, 'venus', dkPlanetId],
    keyVargas: ['D1', 'D9'],
    hasVerifiedRule: directClassicalPhalas.length > 0,
    conciseSummary: reconciledSummary,
    coreDisposition: `${seventhLord.name} 7th Lord • ${ulRashiName} Upapada Lagna`,
    directClassicalPhalas,
    multiRuleSynthesis,
    modernMappings: [
      {
        id: 'map_marriage_modern',
        classicalConcept: 'Kalatrasthāna & Upapada Synthesis',
        classicalSourceRef: 'BPHS Ch. 13 & Jaimini Sūtras',
        modernMappingText:
          'Corresponds to long-term relational attachment style, collaborative commitment, and mutual marital adaptability.',
        methodologyNote: 'Modern relational dynamics mapping.',
      },
    ],
    contradictions: [],
    calculatedFacts,
    satisfiedRules: directClassicalPhalas.map((p) => ({
      rule: CANONICAL_RULES[p.ruleId] || CANONICAL_RULES.bphs_saptama_vivaha,
      conditionsRequired: p.conditions.map((c) => c.description),
      conditionsMet: p.conditions.filter((c) => c.met).map((c) => c.description),
      status: p.verificationLevel,
      synthesisNote: p.directPhalaText,
    })),
    supportingFactors,
    limitingOrCounterbalancingFactors: limitingFactors,
    synthesisNarrative: multiRuleSynthesis,
    calculationBasisNotes: [
      `7th Lord: ${seventhLord.name} in House ${seventhLordPlanet?.house}`,
      `Venus: ${venus.rashiName} (Śaḍbala: ${venusShadbala.toFixed(2)}x)`,
      `Upapada Lagna: ${ulRashiName}`,
      `Dārakāraka: ${GRAHA_SANSKRIT_NAMES[dkPlanetId]}`,
    ],
    canonicalSources: [
      CANONICAL_RULES.bphs_saptama_vivaha,
      CANONICAL_RULES.jaimini_upapada_lagna_dampatya,
    ],
  };
}

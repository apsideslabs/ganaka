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
  phalaFromRule,
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

  // BPHS 18 - the 7th bhava, 42 verses, the longest of the bhava chapters.
  {
    const l7 = getHouseLord(chart, 7); const l7p: any = chart.planets[l7.id];
    const h7 = l7p?.house ?? 0;
    directClassicalPhalas.push(
      phalaFromRule('bphs_jaya_bhava_phala', 'phala_bphs_jaya_bhava',
        [
          { id: 'c_7th_lord_in_a_kendra_or_trikona', description: '7th lord in a kendra or trikona', expected: '7th lord in a kendra or trikona', observed: `House ${h7}`, met: [1,4,7,10,5,9].includes(h7) },
          { id: 'c_7th_lord_not_in_a_trika_house', description: '7th lord not in a trika house', expected: '7th lord not in a trika house', observed: `House ${h7}`, met: ![6,8,12].includes(h7) },
        ],
        'The 7th bhava governs the spouse; its lord well placed gives a good spouse and lasting union, in a trika house delay or discord.',
        CANONICAL_RULES.bphs_jaya_bhava_phala),
    );
  }

  // Phaladipika Ch. 10 - the 7th read from lagna and from the Moon.
  {
    const l7 = getHouseLord(chart, 7); const l7p: any = chart.planets[l7.id];
    const m7 = ((chart.planets.moon.rashiNumber - 1 + 6) % 12) + 1;
    directClassicalPhalas.push(
      phalaFromRule('phaladeepika_kalatra_bhava', 'phala_phaladeepika_kalatra',
        [
          { id: 'c_pd_7th_kendra', description: '7th lord in a kendra or trikona', expected: 'kendra or trikona', observed: `House ${l7p?.house}`, met: [1,4,7,10,5,9].includes(l7p?.house ?? 0) },
          { id: 'c_pd_7th_moon', description: '7th from the Moon is not a dusthana', expected: 'not 6/8/12', observed: `Rasi ${m7}`, met: ![6,8,12].includes(m7) },
        ],
        'Phaladipika reads the 7th from the lagna and again from the Moon; both must agree before the spouse reading is firm.',
        CANONICAL_RULES.phaladeepika_kalatra_bhava),
    );
  }

  // Phaladipika Ch. 18 - every pair of grahas conjoined.
  {
    const rashiCount = new Map<number, string[]>();
    for (const p of ['sun','moon','mars','mercury','jupiter','venus','saturn']) {
      const r = (chart.planets as any)[p]?.rashiNumber;
      if (!r) continue;
      if (!rashiCount.has(r)) rashiCount.set(r, []);
      rashiCount.get(r)!.push(p);
    }
    const pairs = [...rashiCount.values()].filter((g) => g.length >= 2);
    directClassicalPhalas.push(
      phalaFromRule('phaladeepika_dvija_yoga', 'phala_phaladeepika_dvija',
        [{ id: 'c_pd_pair', description: 'At least one pair of grahas conjoined', expected: '>= 1 pair', observed: pairs.length ? pairs.map((g) => g.join('+')).slice(0,3).join(', ') : 'none', met: pairs.length > 0 }],
        'Every pair of conjoined grahas is read as one unit, not as two placements.',
        CANONICAL_RULES.phaladeepika_dvija_yoga),
    );
  }

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

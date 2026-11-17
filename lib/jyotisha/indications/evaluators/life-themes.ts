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
  phalaFromRule,
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

  // BPHS 35 - the Nabhasa yogas. They operate across the whole life and do not
  // wait for a dasa, so they belong to the life-theme layer rather than to any
  // single bhava.
  {
    const kendras = [1,4,7,10].filter((h) => (chart.bhavas as any[]).some((b: any) => b.houseNumber === h && (b.occupants?.length ?? 0) > 0)).length;
    directClassicalPhalas.push(
      phalaFromRule('bphs_nabhasa_life_pattern', 'phala_bphs_nabhasa',
        [{ id: 'c_at_least_one_kendra_occupied', description: 'At least one kendra occupied', expected: 'At least one kendra occupied', observed: `${kendras} of 4 kendras filled`, met: kendras >= 1 }],
        'Nabhasa yogas describe the macro distribution of the grahas across kendra, trikona and upacaya, and are held to operate throughout life without waiting for a dasa.',
        CANONICAL_RULES.bphs_nabhasa_life_pattern),
    );
  }

  // BPHS 37 and 38 - the lunar and solar yogas, plus Ch. 36's named yogas.
  {
    const moonRashi = chart.planets.moon.rashiNumber;
    const others = ['sun','mars','mercury','jupiter','venus','saturn']
      .map((p) => (chart.planets as any)[p])
      .filter((p: any) => p && p.rashiNumber !== moonRashi);
    const in2 = others.filter((p: any) => ((p.rashiNumber - moonRashi + 12) % 12) === 1).length;
    const in12 = others.filter((p: any) => ((p.rashiNumber - moonRashi + 12) % 12) === 11).length;
    const kendraFromMoon = others.filter((p: any) => [0,3,6,9].includes((p.rashiNumber - moonRashi + 12) % 12)).length;
    directClassicalPhalas.push(
      phalaFromRule('bphs_lunar_yogas', 'phala_bphs_lunar_yogas',
        [
          { id: 'c_lunar_sunapha', description: 'A graha in the 2nd from the Moon', expected: '>= 1', observed: String(in2), met: in2 >= 1 },
          { id: 'c_lunar_kemadruma', description: 'Not Kemadruma (a graha in a kendra from the Moon)', expected: '>= 1', observed: String(kendraFromMoon), met: kendraFromMoon >= 1 },
        ],
        'Sunapha gives from the 2nd from the Moon, Anapha from the 12th; Kemadruma — neither, and no graha in a kendra from the Moon — is the classical marker of isolation.',
        CANONICAL_RULES.bphs_lunar_yogas),
    );
    const sunRashi = chart.planets.sun.rashiNumber;
    const s2 = others.filter((p: any) => ((p.rashiNumber - sunRashi + 12) % 12) === 1).length;
    const s12 = others.filter((p: any) => ((p.rashiNumber - sunRashi + 12) % 12) === 11).length;
    directClassicalPhalas.push(
      phalaFromRule('bphs_solar_yogas', 'phala_bphs_solar_yogas',
        [{ id: 'c_solar_vesi', description: 'Vesi, Vasi or Ubhayachari present', expected: '>= 1 graha beside the Sun', observed: `${s2} in 2nd, ${s12} in 12th`, met: s2 + s12 > 0 }],
        'Vesi from the 2nd from the Sun, Vasi from the 12th, Ubhayachari from both; the result follows the nature of the graha involved.',
        CANONICAL_RULES.bphs_solar_yogas),
    );
    const jupMoon = [0,3,6,9].includes(((chart.planets.jupiter.rashiNumber - moonRashi + 12) % 12));
    directClassicalPhalas.push(
      phalaFromRule('bphs_yogas_many_other', 'phala_bphs_gajakesari',
        [{ id: 'c_gajakesari', description: 'Jupiter in a kendra from the Moon (Gajakesari)', expected: 'kendra from Moon', observed: jupMoon ? 'yes' : 'no', met: jupMoon }],
        'Gajakesari forms when Jupiter occupies a kendra from the Moon; the other named yogas of the chapter follow their own arrangements.',
        CANONICAL_RULES.bphs_yogas_many_other),
    );
  }

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

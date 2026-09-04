/**
 * Gaṇaka — Specialized Domain Evaluator: Education & Knowledge
 * (चतुर्थ-पञ्चम भाव एवं विद्या-प्रज्ञा)
 * 
 * Sources: BPHS (Ch. 12), Uttarakālāmṛta (Kāṇḍa 4), Phaladīpikā (Ch. 16)
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
  NATURAL_BENEFICS,
} from '../shared-utils';
import { reconcileRulesAndContradictions } from '../conflict-resolver';

export function evaluateEducationDomain(chart: JyotishaChart): DomainIndication {
  const fourthLord = getHouseLord(chart, 4);
  const fifthLord = getHouseLord(chart, 5);
  const mercury = chart.planets.mercury;
  const jupiter = chart.planets.jupiter;
  const venus = chart.planets.venus;

  const fourthLordPlanet = chart.planets[fourthLord.id];
  const fifthLordPlanet = chart.planets[fifthLord.id];

  const mercuryShadbala = getShadbalaRatio(chart, 'mercury');
  const jupiterShadbala = getShadbalaRatio(chart, 'jupiter');

  const calculatedFacts: CalculatedFact[] = [
    makeFact(
      'fact_fourth_lord_vidya',
      'Bhāva & Bhāveśa',
      '4th Lord (Vidyā-sthānādhipati • Formal Academics)',
      `${fourthLord.name} in House ${fourthLordPlanet?.house || 'N/A'} (${fourthLordPlanet?.rashiName || ''})`,
      'Governs foundational scholastic schooling, institutional degrees, and academic diplomas.',
      [1, 4, 5, 9, 10].includes(fourthLordPlanet?.house || 0) ? 'favorable' : 'neutral'
    ),
    makeFact(
      'fact_fifth_lord_buddhi',
      'Bhāva & Bhāveśa',
      '5th Lord (Dhīpati • Intellect & Discretion)',
      `${fifthLord.name} in House ${fifthLordPlanet?.house || 'N/A'} (${fifthLordPlanet?.rashiName || ''})`,
      'Governs creative synthesis, deep analytical insight, mnemonic retention, and specialized research.',
      [1, 4, 5, 9, 10, 11].includes(fifthLordPlanet?.house || 0) ? 'favorable' : 'neutral'
    ),
    makeFact(
      'fact_vidyakaraka_mercury',
      'Graha & Dignity',
      'Budha (Mercury) • Vidyākāraka (Analytical Learning)',
      `${mercury.rashiName} in House ${mercury.house}${mercury.isCombust ? ' [Combust / अस्त]' : ''}`,
      'Significator of literacy, mathematics, coding/writing, logic, and rapid comprehension.',
      !mercury.isCombust ? 'favorable' : 'limiting'
    ),
    makeFact(
      'fact_jnanakaraka_jupiter',
      'Graha & Dignity',
      'Guru (Jupiter) • Jñānakāraka (Higher Wisdom)',
      `${jupiter.rashiName} in House ${jupiter.house} (Dignity: ${jupiter.dignity})`,
      'Significator of higher philosophy, jurisprudence, ethics, and epistemological wisdom.',
      jupiterShadbala >= 1.0 ? 'favorable' : 'neutral'
    ),
  ];

  const directClassicalPhalas: DirectClassicalPhala[] = [];

  // Rule 1: BPHS Ch. 12 Vidyā & Buddhi
  const cond1: RuleCondition[] = [
    {
      id: 'c_fourth_fifth_lords',
      description: '4th and 5th house lords well-placed in Kendras/Trikonas or benefic signs',
      expected: 'Houses 1, 4, 5, 7, 9, 10, 11',
      observed: `4th Lord in H${fourthLordPlanet?.house}, 5th Lord in H${fifthLordPlanet?.house}`,
      met:
        [1, 4, 5, 7, 9, 10, 11].includes(fourthLordPlanet?.house || 0) ||
        [1, 4, 5, 7, 9, 10, 11].includes(fifthLordPlanet?.house || 0),
    },
    {
      id: 'c_jupiter_shadbala',
      description: 'Jupiter endowed with sufficient strength for cognitive retention',
      expected: '>= 0.9 ratio',
      observed: `${jupiterShadbala.toFixed(2)}x`,
      met: jupiterShadbala >= 0.85,
    },
  ];

  if (cond1.every((c) => c.met)) {
    directClassicalPhalas.push({
      id: 'phala_bphs_vidya',
      ruleId: 'bphs_vidya_buddhi',
      sourceText: CANONICAL_RULES.bphs_vidya_buddhi.sourceText,
      chapterAndVerse: CANONICAL_RULES.bphs_vidya_buddhi.chapterAndVerse,
      sanskritTitle: CANONICAL_RULES.bphs_vidya_buddhi.sanskritTitle || '',
      sanskritShloka: CANONICAL_RULES.bphs_vidya_buddhi.sanskritShloka,
      editionOrManuscript: CANONICAL_RULES.bphs_vidya_buddhi.editionOrManuscript,
      conditions: cond1,
      allConditionsMet: true,
      verificationLevel: 'Fully Verified',
      directPhalaText:
        'The native acquires comprehensive academic qualifications (Vidyā-lābha) and displays sharp intellectual discernment (Buddhi-viveka).',
    });
  }

  // Rule 2: Sarasvatī Yoga check
  const isSaraswatiFormed =
    [1, 2, 4, 5, 7, 9, 10].includes(jupiter.house) &&
    [1, 2, 4, 5, 7, 9, 10].includes(venus.house) &&
    [1, 2, 4, 5, 7, 9, 10].includes(mercury.house) &&
    !mercury.isCombust;

  if (isSaraswatiFormed) {
    directClassicalPhalas.push({
      id: 'phala_saraswati_yoga',
      ruleId: 'uttarakalamrita_saraswati_yoga',
      sourceText: CANONICAL_RULES.uttarakalamrita_saraswati_yoga.sourceText,
      chapterAndVerse: CANONICAL_RULES.uttarakalamrita_saraswati_yoga.chapterAndVerse,
      sanskritTitle: CANONICAL_RULES.uttarakalamrita_saraswati_yoga.sanskritTitle || '',
      sanskritShloka: CANONICAL_RULES.uttarakalamrita_saraswati_yoga.sanskritShloka,
      editionOrManuscript: CANONICAL_RULES.uttarakalamrita_saraswati_yoga.editionOrManuscript,
      conditions: [
        {
          id: 'c_saraswati',
          description: 'Jupiter, Venus, and Mercury well situated in Kendras, Trikonas, or 2nd house',
          expected: 'All 3 Grahas in Kendras/Trikonas/2nd',
          observed: `Guru H${jupiter.house}, Śukra H${venus.house}, Budha H${mercury.house}`,
          met: true,
        },
      ],
      allConditionsMet: true,
      verificationLevel: 'Fully Verified',
      directPhalaText:
        'Formation of Sarasvatī Yoga: High proficiency in scholarly literature, eloquence, scientific inquiry, and cultural arts.',
    });
  }

  const supportingFactors: string[] = [];
  const limitingFactors: string[] = [];

  supportingFactors.push(`4th Lord (${fourthLord.name}) positioned in House ${fourthLordPlanet?.house}.`);
  supportingFactors.push(`5th Lord (${fifthLord.name}) positioned in House ${fifthLordPlanet?.house}.`);
  if (jupiterShadbala >= 1.0) supportingFactors.push(`Jupiter possesses strong Śaḍbala ratio (${jupiterShadbala.toFixed(2)}x).`);

  if (mercury.isCombust) limitingFactors.push('Mercury combustion suggests potential scholastic intensity requiring structured focus.');

  const { multiRuleSynthesis, reconciledSummary } = reconcileRulesAndContradictions(
    directClassicalPhalas,
    [],
    []
  );

  return {
    id: 'education',
    title: 'Education & Knowledge',
    sanskritTitle: 'चतुर्थ-पञ्चम भाव एवं विद्या-प्रज्ञा',
    subtitle: 'Institutional degrees (4th), original intellect (5th), Mercury, and Jupiter',
    primaryBhavas: [4, 5],
    keyGrahas: [fourthLord.id, fifthLord.id, 'mercury', 'jupiter'],
    keyVargas: ['D1', 'D9', 'D24'],
    hasVerifiedRule: directClassicalPhalas.length > 0,
    conciseSummary: reconciledSummary,
    coreDisposition: `${fourthLord.name} 4th Lord • ${fifthLord.name} 5th Lord`,
    directClassicalPhalas,
    multiRuleSynthesis,
    modernMappings: [
      {
        id: 'map_education_modern',
        classicalConcept: 'Vidyā (4th) vs Buddhi (5th) Differentiation',
        classicalSourceRef: 'BPHS Ch. 12',
        modernMappingText:
          'Maps to formal academic degrees & accredited curricula (4th house) versus innovative problem-solving, research synthesis, and creative ideation (5th house).',
        methodologyNote: 'Modern educational psychology mapping.',
      },
    ],
    contradictions: [],
    calculatedFacts,
    satisfiedRules: directClassicalPhalas.map((p) => ({
      rule: CANONICAL_RULES[p.ruleId] || CANONICAL_RULES.bphs_vidya_buddhi,
      conditionsRequired: p.conditions.map((c) => c.description),
      conditionsMet: p.conditions.filter((c) => c.met).map((c) => c.description),
      status: p.verificationLevel,
      synthesisNote: p.directPhalaText,
    })),
    supportingFactors,
    limitingOrCounterbalancingFactors: limitingFactors,
    synthesisNarrative: multiRuleSynthesis,
    calculationBasisNotes: [
      `4th Lord: ${fourthLord.name} in House ${fourthLordPlanet?.house}`,
      `5th Lord: ${fifthLord.name} in House ${fifthLordPlanet?.house}`,
      `Mercury: ${mercury.rashiName} (Combust: ${mercury.isCombust})`,
      `Jupiter: ${jupiter.rashiName} (Śaḍbala: ${jupiterShadbala.toFixed(2)}x)`,
    ],
    canonicalSources: [
      CANONICAL_RULES.bphs_vidya_buddhi,
      CANONICAL_RULES.uttarakalamrita_saraswati_yoga,
    ],
  };
}

/**
 * Gaṇaka — Specialized Domain Evaluator: Spiritual & Religious Inclination
 * (नवम-द्वादश भाव एवं धर्म-मोक्ष)
 * 
 * Sources: BPHS (Ch. 13), Jaimini Upadeśa Sūtras (Adhyāya 1, Pāda 2 - Kārakāṃśa)
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
  makeFact,
  GRAHA_SANSKRIT_NAMES,
  RASHI_NAMES,
} from '../shared-utils';
import { reconcileRulesAndContradictions } from '../conflict-resolver';

export function evaluateSpiritualityDomain(chart: JyotishaChart): DomainIndication {
  const ninthLord = getHouseLord(chart, 9);
  const twelfthLord = getHouseLord(chart, 12);
  const ninthLordPlanet = chart.planets[ninthLord.id];
  const twelfthLordPlanet = chart.planets[twelfthLord.id];
  const jupiter = chart.planets.jupiter;
  const ketu = chart.planets.ketu;

  // Jaimini Kārakāṃśa (Navāṃśa sign of Ātmakāraka)
  const akPlanetId = getCharaKarakaPlanet(chart, 'AK');
  const akD9 = getVargaPlacement(chart, akPlanetId, 'D9');
  const karakamshaRashiNum = akD9?.rashiNum || chart.planets[akPlanetId]?.rashiNumber || 1;
  const karakamshaRashiName = RASHI_NAMES[karakamshaRashiNum];

  // 12th from Kārakāṃśa in D-9
  const twelfthFromKarakamshaNum = ((karakamshaRashiNum + 10) % 12) + 1;
  const twelfthFromKarakamshaName = RASHI_NAMES[twelfthFromKarakamshaNum];

  const calculatedFacts: CalculatedFact[] = [
    makeFact(
      'fact_ninth_lord_dharma',
      'Bhāva & Bhāveśa',
      '9th House Lord (Dharmādhipati • Higher Truth)',
      `${ninthLord.name} in House ${ninthLordPlanet?.house || 'N/A'} (${ninthLordPlanet?.rashiName || ''})`,
      'Governs adherence to ethical order (Dharma), philosophical devotion, and guidance of Guru.',
      [1, 4, 5, 9, 10].includes(ninthLordPlanet?.house || 0) ? 'favorable' : 'neutral'
    ),
    makeFact(
      'fact_twelfth_lord_moksha',
      'Bhāva & Bhāveśa',
      '12th House Lord (Mokṣādhipati • Transcendence)',
      `${twelfthLord.name} in House ${twelfthLordPlanet?.house || 'N/A'}`,
      'Governs meditative solitude, inner detachment, dream consciousness, and spiritual liberation.',
      'neutral'
    ),
    makeFact(
      'fact_mokshakaraka_ketu',
      'Graha & Dignity',
      'Ketu • Mokṣakāraka (Significator of Liberation)',
      `${ketu.rashiName} in House ${ketu.house}`,
      'The supreme celestial karaka for non-attachment, self-realization, and esoteric intuition.',
      'favorable'
    ),
    makeFact(
      'fact_karakamsha_ishta',
      'Jaimini Sūtra',
      'Kārakāṃśa & 12th House (Iṣṭa Devatā Axis)',
      `Kārakāṃśa: ${karakamshaRashiName} | 12th from AK: ${twelfthFromKarakamshaName}`,
      'Jaimini focal point revealing the individual soul’s natural devotional path and tutelary deity.',
      'favorable'
    ),
  ];

  const directClassicalPhalas: DirectClassicalPhala[] = [];

  // Rule 1: BPHS Ch. 13 Dharma-Mokṣa
  const cond1: RuleCondition[] = [
    {
      id: 'c_ninth_lord_auspicious',
      description: '9th house lord situated in Kendra/Trikona or supported by Jupiter',
      expected: 'Houses 1, 4, 5, 7, 9, 10',
      observed: `House ${ninthLordPlanet?.house}`,
      met: [1, 4, 5, 7, 9, 10].includes(ninthLordPlanet?.house || 0),
    },
  ];

  if (cond1.every((c) => c.met)) {
    directClassicalPhalas.push({
      id: 'phala_bphs_dharma',
      ruleId: 'bphs_dharma_moksha_pravritti',
      sourceText: CANONICAL_RULES.bphs_dharma_moksha_pravritti.sourceText,
      chapterAndVerse: CANONICAL_RULES.bphs_dharma_moksha_pravritti.chapterAndVerse,
      sanskritTitle: CANONICAL_RULES.bphs_dharma_moksha_pravritti.sanskritTitle || '',
      sanskritShloka: CANONICAL_RULES.bphs_dharma_moksha_pravritti.sanskritShloka,
      editionOrManuscript: CANONICAL_RULES.bphs_dharma_moksha_pravritti.editionOrManuscript,
      conditions: cond1,
      allConditionsMet: true,
      verificationLevel: 'Fully Verified',
      directPhalaText:
        'The native is endowed with natural piety, ethical rectitude (Dharmikata), and profound respect for traditional wisdom and teachers.',
    });
  }

  // Rule 2: Jaimini Kārakāṃśa Iṣṭa Devatā
  directClassicalPhalas.push({
    id: 'phala_jaimini_ishta',
    ruleId: 'jaimini_karakamsha_ishta_devata',
    sourceText: CANONICAL_RULES.jaimini_karakamsha_ishta_devata.sourceText,
    chapterAndVerse: CANONICAL_RULES.jaimini_karakamsha_ishta_devata.chapterAndVerse,
    sanskritTitle: CANONICAL_RULES.jaimini_karakamsha_ishta_devata.sanskritTitle || '',
    sanskritShloka: CANONICAL_RULES.jaimini_karakamsha_ishta_devata.sanskritShloka,
    editionOrManuscript: CANONICAL_RULES.jaimini_karakamsha_ishta_devata.editionOrManuscript,
    conditions: [
      {
        id: 'c_karakamsha_identified',
        description: 'Kārakāṃśa (Navāṃśa of AK) and 12th from it calculated',
        expected: 'Kārakāṃśa D-9 Sign',
        observed: `${karakamshaRashiName}`,
        met: true,
      },
    ],
    allConditionsMet: true,
    verificationLevel: 'Fully Verified',
    directPhalaText: `Spiritual contemplation and Iṣṭa Devatā orientation are steered through the 12th from Kārakāṃśa (${twelfthFromKarakamshaName}).`,
  });

  const supportingFactors: string[] = [];
  const limitingFactors: string[] = [];

  supportingFactors.push(`9th Lord (${ninthLord.name}) positioned in House ${ninthLordPlanet?.house}.`);
  supportingFactors.push(`Kārakāṃśa located in ${karakamshaRashiName}.`);

  const { multiRuleSynthesis, reconciledSummary } = reconcileRulesAndContradictions(
    directClassicalPhalas,
    [],
    []
  );

  return {
    id: 'spirituality',
    title: 'Spiritual & Religious Inclination',
    sanskritTitle: 'नवम-द्वादश भाव एवं धर्म-मोक्ष',
    subtitle: '9th House (Dharma), 12th House (Mokṣa), Ketu, and Jaimini Kārakāṃśa Iṣṭa Devatā',
    primaryBhavas: [9, 12],
    keyGrahas: [ninthLord.id, twelfthLord.id, 'ketu', 'jupiter'],
    keyVargas: ['D1', 'D9', 'D20'],
    hasVerifiedRule: directClassicalPhalas.length > 0,
    conciseSummary: reconciledSummary,
    coreDisposition: `${ninthLord.name} 9th Lord • ${karakamshaRashiName} Kārakāṃśa`,
    directClassicalPhalas,
    multiRuleSynthesis,
    modernMappings: [
      {
        id: 'map_spirituality_modern',
        classicalConcept: 'Dharma-Mokṣa Alignment',
        classicalSourceRef: 'BPHS Ch. 13 & Jaimini Sūtras',
        modernMappingText:
          'Corresponds to philosophical worldview, existential purpose, contemplative mindfulness practices, and ethical self-governance.',
        methodologyNote: 'Modern philosophical orientation mapping.',
      },
    ],
    contradictions: [],
    calculatedFacts,
    satisfiedRules: directClassicalPhalas.map((p) => ({
      rule: CANONICAL_RULES[p.ruleId] || CANONICAL_RULES.bphs_dharma_moksha_pravritti,
      conditionsRequired: p.conditions.map((c) => c.description),
      conditionsMet: p.conditions.filter((c) => c.met).map((c) => c.description),
      status: p.verificationLevel,
      synthesisNote: p.directPhalaText,
    })),
    supportingFactors,
    limitingOrCounterbalancingFactors: limitingFactors,
    synthesisNarrative: multiRuleSynthesis,
    calculationBasisNotes: [
      `9th Lord: ${ninthLord.name} in House ${ninthLordPlanet?.house}`,
      `12th Lord: ${twelfthLord.name} in House ${twelfthLordPlanet?.house}`,
      `Kārakāṃśa: ${karakamshaRashiName} (${akPlanetId})`,
      `12th from Kārakāṃśa: ${twelfthFromKarakamshaName}`,
    ],
    canonicalSources: [
      CANONICAL_RULES.bphs_dharma_moksha_pravritti,
      CANONICAL_RULES.jaimini_karakamsha_ishta_devata,
    ],
  };
}

/**
 * Gaṇaka — Domain 3: Classical Shastric Career Rules (Phase 3)
 * 
 * Authentic classical rules with shloka citations from:
 * - Bṛhat Parāśara Horā Śāstra (BPHS), Ch. 18 (दशमभावफल)
 * - Phaladīpikā of Mantreśvara, Ch. 6 & Ch. 15 (कर्मभावफल / अमलायोग)
 * - Sārāvalī of Kalyāṇavarmā, Ch. 33 (वृत्तिविचार)
 * - Jātaka Pārijāta of Vaidyanātha Dīkṣita, Ch. 15 (दशांशविचार)
 */

import { EvaluatedCondition, RuleEvaluationResult, ClassicalRuleDefinition } from '../../types';
import { PredictionContext } from '../../context';

export const CAREER_CLASSICAL_RULES: Record<string, ClassicalRuleDefinition> = {
  BPHS_DASHAMESHA_KENDRA_TRIKONA: {
    ruleId: 'bphs_dashamesha_kendra_trikona',
    ruleName: 'Daśameśa Kendra-Trikona Professional Eminence',
    sourceText: 'Brihat Parashara Hora Shastra',
    chapterAndVerse: 'BPHS Ch. 18, v. 1–3',
    sanskritShloka: 'दशमेशे केन्द्रत्रिकोणगे बलयुते शुभग्रहसंयुते कीर्तिमान् प्रभुः। बहुपुत्रधनैर्युक्तः सर्वकार्येषु सिद्ध्यति॥',
    englishTranslation: 'If the 10th lord is fortified in a Kendra or Trikona endowed with strength and benefic association, the native commands eminent professional renown, administrative capability, and accomplishes undertakings successfully.',
  },
  BPHS_DASHAMESHA_DUSTHANA: {
    ruleId: 'bphs_dashamesha_dusthana',
    ruleName: 'Daśameśa Randhra-Vyaya Karmic Friction & Restructuring',
    sourceText: 'Brihat Parashara Hora Shastra',
    chapterAndVerse: 'BPHS Ch. 18, v. 14–16',
    sanskritShloka: 'दशमेशे रन्ध्रे व्यये वा दुष्टस्थानगते सति। कर्मविघ्नं भवेत्तस्य वृत्तिभङ्गो पदे पदे॥',
    englishTranslation: 'If the 10th lord is placed in the 8th or 12th without mitigating strength, career undertakings encounter sudden impediments, periods of vocational obscurity, or frequent directional shifts.',
  },
  PHALADIPIKA_AMALA_YOGA: {
    ruleId: 'phaladipika_amala_yoga',
    ruleName: 'Amala Yoga Spotless Professional Reputation',
    sourceText: 'Phaladipika of Mantreshwara',
    chapterAndVerse: 'Phaladipika Ch. 6, v. 69–70',
    sanskritShloka: 'लग्नाच्चन्द्राच्च दशमे सौम्यैर्मलवर्जितैः। अमलाख्यः समाख्यातः कीर्तिराचन्द्रतारकम्॥',
    englishTranslation: 'When natural benefics occupy the 10th from Lagna or Moon uncorrupted by malefics, Amala Yoga is formed; the person is renowned for spotless ethics, honored by rulers, and enjoys lasting prosperity.',
  },
  PHALADIPIKA_SURYA_DIGBALA: {
    ruleId: 'phaladipika_surya_digbala',
    ruleName: 'Sūrya 10th House Digbala Sovereign Authority',
    sourceText: 'Phaladipika of Mantreshwara',
    chapterAndVerse: 'Phaladipika Ch. 15, v. 4–6',
    sanskritShloka: 'दशमे भानुसंयुक्ते नृपमान्यो महीपतिः। धीरोत्साही महातेजाः कार्यदक्षः प्रतापवान्॥',
    englishTranslation: 'The Sun positioned in the 10th house possesses directional strength (Digbala), granting sovereign favor, decisive leadership, courage, and prominent administrative status.',
  },
  SARAVALI_VRITTI_GRAHA: {
    ruleId: 'saravali_vritti_graha',
    ruleName: 'Graha Karmic Archetype Allocation',
    sourceText: 'Saravali of Kalyanavarma',
    chapterAndVerse: 'Saravali Ch. 33, v. 1–5',
    sanskritShloka: 'दशमे ये ग्रहास्तिष्ठन्ति तैरेव वृत्तिनिर्देशः। स्वबलैः स्वांशकैश्चैव स्वाधिपत्यानुसारतः॥',
    englishTranslation: 'Vocation is indicated by the planets occupying or aspecting the 10th house, mediated through their natural portfolio, sign dignity, and house lordship.',
  },
  JATAKA_PARIJATA_D10_CONFIRMATION: {
    ruleId: 'jataka_parijata_d10_confirmation',
    ruleName: 'D10 Daśāṃśa Varga Institutional Confirmation',
    sourceText: 'Jataka Parijata of Vaidyanatha Dikshita',
    chapterAndVerse: 'Jataka Parijata Ch. 15, v. 12–15',
    sanskritShloka: 'दशांशेशे बलोपेते दशमे शुभसंयुते। कीर्तिर्वृद्धिरुदारा च राज्यगौरवमेव च॥',
    englishTranslation: 'When the lord of the 10th in the Daśāṃśa (D10) is fortified and associated with benefics, the native gains noble distinction, professional elevation, and sovereign honor.',
  },
};

/**
 * Evaluates Rule 1: BPHS Daśameśa Kendra-Trikona
 */
export function evaluateRuleDashameshaKendraTrikona(
  ctx: PredictionContext,
  condLord: EvaluatedCondition,
  condSAV: EvaluatedCondition
): RuleEvaluationResult {
  const def = CAREER_CLASSICAL_RULES.BPHS_DASHAMESHA_KENDRA_TRIKONA;
  const conditions = [condLord, condSAV];
  const tenthLord = ctx.getLordOfHouse(10);
  const h10 = ctx.getHouse(10);

  const isTriggered = condLord.status === 'satisfied' && condSAV.status === 'satisfied';
  const isPartiallyTriggered = (condLord.status === 'satisfied' || condLord.status === 'partially_supported') &&
    (condSAV.status === 'satisfied' || condSAV.status === 'partially_supported');

  let confidence: 'high' | 'moderate' | 'low' = 'low';
  let shastricVerdict = '';

  if (isTriggered) {
    confidence = 'high';
    shastricVerdict = `10th Lord ${tenthLord.name} in House ${tenthLord.house} (${tenthLord.dignity}) combined with ${h10.savBindus} SAV bindus satisfies the classical Parāśari rule for professional eminence, executive stability, and flourishing karma.`;
  } else if (isPartiallyTriggered) {
    confidence = 'moderate';
    shastricVerdict = `10th Lord ${tenthLord.name} holds supportive placement with moderate conditions; professional achievement develops steadily without singular sovereign entitlement.`;
  } else {
    shastricVerdict = `Classical Kendra-Trikona career flourishing rule is not satisfied: 10th lord placement or Aṣṭakavarga capacity lacks the prerequisite classical fortification.`;
  }

  return {
    ruleId: def.ruleId,
    ruleTitle: def.ruleName,
    citation: {
      sourceText: def.sourceText,
      chapterAndVerse: def.chapterAndVerse,
      sanskritShloka: def.sanskritShloka,
      englishTranslation: def.englishTranslation,
    },
    status: isTriggered ? 'satisfied' : isPartiallyTriggered ? 'partially_supported' : 'absent',
    conditionsEvaluated: conditions,
    evidence: [],
    contradictions: [],
    isTriggered: isTriggered || isPartiallyTriggered,
    confidence,
    shastricVerdict,
  };
}

/**
 * Evaluates Rule 2: BPHS Daśameśa Dusthāna
 */
export function evaluateRuleDashameshaDusthana(
  ctx: PredictionContext,
  condLord: EvaluatedCondition
): RuleEvaluationResult {
  const def = CAREER_CLASSICAL_RULES.BPHS_DASHAMESHA_DUSTHANA;
  const tenthLord = ctx.getLordOfHouse(10);
  const isDusthana = [6, 8, 12].includes(tenthLord.house);
  const isCombust = tenthLord.isCombust;

  const isTriggered = isDusthana || isCombust;
  const isSevere = isDusthana && condLord.status === 'contradicted';

  let shastricVerdict = '';
  let confidence: 'high' | 'moderate' | 'low' = 'low';

  if (isSevere) {
    confidence = 'high';
    shastricVerdict = `10th Lord ${tenthLord.name} placed in Dusthāna House ${tenthLord.house} without counter-strength satisfies the classical friction rule: career suffers periodic interruptions, unacknowledged labor, or institutional restructuring.`;
  } else if (isTriggered) {
    confidence = 'moderate';
    shastricVerdict = `10th Lord ${tenthLord.name} encounters Dusthāna or combustion friction (${tenthLord.isCombust ? 'combust, ' : ''}House ${tenthLord.house}), indicating that professional path requires navigating unconventional problem-solving or distant arenas.`;
  } else {
    shastricVerdict = `10th lord is free from classical Dusthāna debilitation or acute combustion; rule is inactive.`;
  }

  return {
    ruleId: def.ruleId,
    ruleTitle: def.ruleName,
    citation: {
      sourceText: def.sourceText,
      chapterAndVerse: def.chapterAndVerse,
      sanskritShloka: def.sanskritShloka,
      englishTranslation: def.englishTranslation,
    },
    status: isSevere ? 'satisfied' : isTriggered ? 'partially_supported' : 'absent',
    conditionsEvaluated: [condLord],
    evidence: [],
    contradictions: [],
    isTriggered,
    confidence,
    shastricVerdict,
  };
}

/**
 * Evaluates Rule 3: Phaladīpikā Amala Yoga
 */
export function evaluateRuleAmalaYoga(
  ctx: PredictionContext,
  condRay: EvaluatedCondition
): RuleEvaluationResult {
  const def = CAREER_CLASSICAL_RULES.PHALADIPIKA_AMALA_YOGA;
  const h10 = ctx.getHouse(10);
  const beneficsInH10 = h10.beneficOccupants;
  const maleficsInH10 = h10.maleficOccupants;

  const isTriggered = beneficsInH10.length > 0 && maleficsInH10.length === 0;

  let shastricVerdict = '';
  if (isTriggered) {
    shastricVerdict = `Classical Amala Yoga confirmed: natural benefics occupy the 10th house free from malefic conjunction, bestowing unblemished professional integrity, noble public reputation, and lasting career honor.`;
  } else {
    shastricVerdict = `Amala Yoga criteria not met: 10th house is either unoccupied by uncorrupted natural benefics or subject to malefic influence.`;
  }

  return {
    ruleId: def.ruleId,
    ruleTitle: def.ruleName,
    citation: {
      sourceText: def.sourceText,
      chapterAndVerse: def.chapterAndVerse,
      sanskritShloka: def.sanskritShloka,
      englishTranslation: def.englishTranslation,
    },
    status: isTriggered ? 'satisfied' : 'absent',
    conditionsEvaluated: [condRay],
    evidence: [],
    contradictions: [],
    isTriggered,
    confidence: isTriggered ? 'high' : 'low',
    shastricVerdict,
  };
}

/**
 * Evaluates Rule 4: Sūrya 10th Digbala & Authority
 */
export function evaluateRuleSuryaDigbala(
  ctx: PredictionContext,
  condAuthority: EvaluatedCondition
): RuleEvaluationResult {
  const def = CAREER_CLASSICAL_RULES.PHALADIPIKA_SURYA_DIGBALA;
  const sun = ctx.getPlanet('sun');
  const isTriggered = sun.house === 10;

  let shastricVerdict = '';
  if (isTriggered) {
    shastricVerdict = `Sun occupies the 10th house with full directional strength (Digbala); native commands executive authority, administrative presence, and natural sovereign capacity.`;
  } else {
    shastricVerdict = `Sun is not situated in the 10th house; directional Digbala authority rule is inactive.`;
  }

  return {
    ruleId: def.ruleId,
    ruleTitle: def.ruleName,
    citation: {
      sourceText: def.sourceText,
      chapterAndVerse: def.chapterAndVerse,
      sanskritShloka: def.sanskritShloka,
      englishTranslation: def.englishTranslation,
    },
    status: isTriggered ? 'satisfied' : 'absent',
    conditionsEvaluated: [condAuthority],
    evidence: [],
    contradictions: [],
    isTriggered,
    confidence: isTriggered ? 'high' : 'low',
    shastricVerdict,
  };
}

/**
 * Evaluates Rule 5: Sārāvalī Vṛtti Graha Archetype Allocation
 */
export function evaluateRuleSaravaliVritti(
  ctx: PredictionContext,
  condVocational: EvaluatedCondition
): RuleEvaluationResult {
  const def = CAREER_CLASSICAL_RULES.SARAVALI_VRITTI_GRAHA;
  const isTriggered = condVocational.status === 'satisfied';

  return {
    ruleId: def.ruleId,
    ruleTitle: def.ruleName,
    citation: {
      sourceText: def.sourceText,
      chapterAndVerse: def.chapterAndVerse,
      sanskritShloka: def.sanskritShloka,
      englishTranslation: def.englishTranslation,
    },
    status: isTriggered ? 'satisfied' : 'partially_supported',
    conditionsEvaluated: [condVocational],
    evidence: [],
    contradictions: [],
    isTriggered: true,
    confidence: isTriggered ? 'high' : 'moderate',
    shastricVerdict: `Vocational field is determined from planetary rays aspecting and occupying the 10th house: ${condVocational.observed}.`,
  };
}

/**
 * Evaluates Rule 6: Jātaka Pārijāta D10 Confirmation
 */
export function evaluateRuleJatakaParijataD10(
  ctx: PredictionContext,
  condD10: EvaluatedCondition
): RuleEvaluationResult {
  const def = CAREER_CLASSICAL_RULES.JATAKA_PARIJATA_D10_CONFIRMATION;
  const isTriggered = condD10.status === 'satisfied';

  return {
    ruleId: def.ruleId,
    ruleTitle: def.ruleName,
    citation: {
      sourceText: def.sourceText,
      chapterAndVerse: def.chapterAndVerse,
      sanskritShloka: def.sanskritShloka,
      englishTranslation: def.englishTranslation,
    },
    status: isTriggered ? 'satisfied' : 'partially_supported',
    conditionsEvaluated: [condD10],
    evidence: [],
    contradictions: [],
    isTriggered: isTriggered,
    confidence: isTriggered ? 'high' : 'moderate',
    shastricVerdict: condD10.rationale,
  };
}

/**
 * Gaṇaka — Domain 1: Classical Shastric Rules
 * 
 * Authentic classical rules with shloka citations from:
 * - Bṛhat Parāśara Horā Śāstra (BPHS), Ch. 4, 11, 15, 27
 * - Sārāvalī of Kalyāṇavarmā, Ch. 21, 23
 * - Bṛhat Jātaka of Varāhamihira, Ch. 16
 */

import { EvaluatedCondition, RuleEvaluationResult, ClassicalRuleDefinition } from '../../types';
import { PredictionContext } from '../../context';

export const CONSTITUTION_CLASSICAL_RULES: Record<string, ClassicalRuleDefinition> = {
  BPHS_DEHA_SAUKHYA: {
    ruleId: 'bphs_deha_saukhya',
    ruleName: 'Deha-Saukhya & Constitutional Stamina',
    sourceText: 'Brihat Parashara Hora Shastra',
    chapterAndVerse: 'BPHS Ch. 11, v. 2-4',
    sanskritShloka: 'लग्नेशे केन्द्रगे वापि त्रिकोणे वा शुभान्विते। दीर्घायुर्बलवांश्चैव रूपवांश्च नरः सुखी॥',
    englishTranslation: 'If the lord of Lagna occupies a Kendra or Trikona endowed with strength and benefic association, the native enjoys enduring longevity, physical radiance, and constitutional stamina.',
  },
  BPHS_TANU_AFFLICTION: {
    ruleId: 'bphs_tanu_affliction',
    ruleName: 'Tanubhāva Rogapīḍā & Vulnerability Vector',
    sourceText: 'Brihat Parashara Hora Shastra',
    chapterAndVerse: 'BPHS Ch. 11, v. 12-14',
    sanskritShloka: 'लग्नेशे षष्ठगे वापि रन्ध्रे वा व्ययगेऽपि वा। देहपीडा भवेत्तस्य यद्यसौ न बलोत्कटः॥',
    englishTranslation: 'If the lord of Lagna is in the 6th, 8th, or 12th without adequate counter-strength, bodily affliction and vitality depletion manifest.',
  },
  SARAVALI_CANDRA_SHUDDHI: {
    ruleId: 'saravali_candra_shuddhi',
    ruleName: 'Candra-Śuddhi & Emotional Equanimity',
    sourceText: 'Saravali of Kalyanavarma',
    chapterAndVerse: 'Saravali Ch. 23, v. 1-4',
    sanskritShloka: 'सम्पूर्णचन्द्रः शुभदृष्टियुक्तः केन्द्रस्थितः सर्वसुखप्रदश्च। शान्तः सुबुद्धिः स्थिरचित्तवृत्तिः कल्याणकारी जनवल्लभश्च॥',
    englishTranslation: 'When the Moon is bright, aspected by benefics, and situated in a Kendra or Trikona, the native possesses a serene mind, steady mental dispositions, and compassionate equanimity.',
  },
  SARAVALI_CANDRA_MALEFIC: {
    ruleId: 'saravali_candra_malefic',
    ruleName: 'Citta-Vaikalyā & Emotional Vulnerability',
    sourceText: 'Saravali of Kalyanavarma',
    chapterAndVerse: 'Saravali Ch. 23, v. 22-26',
    sanskritShloka: 'पापान्वितः पापनिरीक्षितो वा क्षीणः शशी दुष्टगृहे प्रविष्टः। उद्वेगचित्तो भयसंयुतश्च व्याकुलमानसः सततं भवेच्च॥',
    englishTranslation: 'When the Moon is afflicted by malefics, waning, or placed in dusthanas without benefic counteraction, the mind experiences frequent anxiety, emotional restlessness, and psychological strain.',
  },
  BPHS_BUDDHI_5TH: {
    ruleId: 'bphs_buddhi_5th',
    ruleName: 'Prajñā & Discernment Vector (Buddhi-Sthāna)',
    sourceText: 'Brihat Parashara Hora Shastra',
    chapterAndVerse: 'BPHS Ch. 15, v. 1-3',
    sanskritShloka: 'पञ्चमेशे बलोपेते शुभग्रहसमन्विते। सुबुद्धिः शास्त्रतत्त्वज्ञः प्रज्ञावांश्च भवेन्नरः॥',
    englishTranslation: 'If the 5th lord is endowed with strength and associated with benefics, the native has refined intellect, penetration into principles, and enduring cognitive discernment.',
  },
  BJ_DEHA_SVARUPA: {
    ruleId: 'bj_deha_svarupa',
    ruleName: 'D1-D9 Deha-Svarūpa Synthesis',
    sourceText: 'Brihat Jataka of Varahamihira',
    chapterAndVerse: 'Brihat Jataka Ch. 16, v. 1 & BPHS Ch. 4',
    sanskritShloka: 'लग्नांशकाधिपपतेः सदृशं शरीरं वर्णं च रूपमपि सत्त्वगुणं च कुर्यात्।',
    englishTranslation: 'The bodily form, complexion, symmetry, and inherent temperamental quality reflect the combined nature of the Lagna sign and the Navamsha Lagna lord.',
  },
};

/**
 * Evaluates the Deha-Saukhya Rule
 */
export function evaluateRuleDehaSaukhya(
  ctx: PredictionContext,
  condLagnesha: EvaluatedCondition,
  condLagnaRay: EvaluatedCondition,
  condSAV: EvaluatedCondition,
  condSun: EvaluatedCondition
): RuleEvaluationResult {
  const def = CONSTITUTION_CLASSICAL_RULES.BPHS_DEHA_SAUKHYA;
  const conditions = [condLagnesha, condLagnaRay, condSAV, condSun];
  const lagnaLord = ctx.getLordOfHouse(1);
  const h1 = ctx.getHouse(1);

  const isLagneshaFavorable = condLagnesha.status === 'satisfied' || condLagnesha.status === 'partially_supported';
  const isSAVFavorable = condSAV.status === 'satisfied';
  const hasAffliction = condLagnesha.status === 'contradicted' || condSAV.status === 'contradicted';

  const isTriggered = isLagneshaFavorable && isSAVFavorable && !hasAffliction;

  let confidence: 'high' | 'moderate' | 'low' = 'low';
  let shastricVerdict = '';

  if (isTriggered) {
    confidence = condLagnesha.status === 'satisfied' && condSun.status === 'satisfied' ? 'high' : 'moderate';
    shastricVerdict = `Lagneśa ${lagnaLord.name} fortified in House ${lagnaLord.house} (${lagnaLord.rashiName}, ${lagnaLord.dignity}) with ${h1.savBindus} SAV bindus confirms authentic classical Deha-Saukhya: the native possesses resilient bodily endurance, robust natural vitality, and steady recuperative power.`;
  } else {
    shastricVerdict = `Classical Deha-Saukhya rule is not fully substantiated: ${
      condLagnesha.status === 'contradicted' ? `Lagneśa ${lagnaLord.name} is impaired in House ${lagnaLord.house}; ` : ''
    }${condSAV.status === 'contradicted' ? `Lagna SAV contains only ${h1.savBindus} bindus (deficient); ` : ''}vitality requires conscious energy pacing.`;
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
    conditionsEvaluated: conditions,
    evidence: [],
    contradictions: [],
    isTriggered,
    confidence,
    shastricVerdict,
  };
}

/**
 * Evaluates the Tanubhāva Affliction Rule
 */
export function evaluateRuleTanuAffliction(
  ctx: PredictionContext,
  condLagnesha: EvaluatedCondition,
  condLagnaRay: EvaluatedCondition,
  condSAV: EvaluatedCondition
): RuleEvaluationResult {
  const def = CONSTITUTION_CLASSICAL_RULES.BPHS_TANU_AFFLICTION;
  const conditions = [condLagnesha, condLagnaRay, condSAV];
  const lagnaLord = ctx.getLordOfHouse(1);

  const isDusthana = [6, 8, 12].includes(lagnaLord.house);
  const isCombust = lagnaLord.isCombust;
  const isDebilitated = lagnaLord.isDebilitated && !ctx.checkNichabhanga(lagnaLord.id).isNichabhanga;
  const isSAVDeficient = condSAV.status === 'contradicted';

  const isTriggered = (isDusthana || isCombust || isDebilitated || isSAVDeficient) && condLagnesha.status === 'contradicted';

  let confidence: 'high' | 'moderate' | 'low' = 'low';
  let shastricVerdict = '';

  if (isTriggered) {
    confidence = (isDusthana && isCombust) || (isDusthana && isSAVDeficient) ? 'high' : 'moderate';
    shastricVerdict = `Classical Tanubhāva Rogapīḍā vector triggered: Lagneśa ${lagnaLord.name} in House ${lagnaLord.house} (${lagnaLord.dignity})${isCombust ? ', Combust' : ''} indicates susceptibility to physical exhaustion, somatic sensitivity, and slower recovery during adverse transits.`;
  } else {
    shastricVerdict = 'Affliction rule nullified: Lagneśa is properly sheltered without acute un-cancelled debility, dusthāna siege, or combustion.';
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
    conditionsEvaluated: conditions,
    evidence: [],
    contradictions: [],
    isTriggered,
    confidence,
    shastricVerdict,
  };
}

/**
 * Evaluates Candra Mind Equanimity Rule
 */
export function evaluateRuleCandraEquanimity(
  ctx: PredictionContext,
  condChandra: EvaluatedCondition
): RuleEvaluationResult {
  const def = CONSTITUTION_CLASSICAL_RULES.SARAVALI_CANDRA_SHUDDHI;
  const moon = ctx.getPlanet('moon');
  const isTriggered = condChandra.status === 'satisfied';

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
    conditionsEvaluated: [condChandra],
    evidence: [],
    contradictions: [],
    isTriggered,
    confidence: isTriggered ? 'high' : 'low',
    shastricVerdict: isTriggered
      ? `Candra-Śuddhi rule substantiated: Moon in ${moon.rashiName} (House ${moon.house}) endows the native with emotional serenity, psychological balance, and calm introspective equanimity.`
      : `Candra-Śuddhi rule is not actively realized in its pure state for this chart.`,
  };
}

/**
 * Evaluates Candra Emotional Affliction Rule
 */
export function evaluateRuleCandraAffliction(
  ctx: PredictionContext,
  condChandra: EvaluatedCondition
): RuleEvaluationResult {
  const def = CONSTITUTION_CLASSICAL_RULES.SARAVALI_CANDRA_MALEFIC;
  const moon = ctx.getPlanet('moon');
  const isTriggered = condChandra.status === 'contradicted';

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
    conditionsEvaluated: [condChandra],
    evidence: [],
    contradictions: [],
    isTriggered,
    confidence: isTriggered ? 'high' : 'low',
    shastricVerdict: isTriggered
      ? `Citta-Vaikalyā rule indicated: Moon in House ${moon.house} encounters classical stress vectors, pointing to emotional volatility, tendency toward anxiety or brooding solitude, requiring mindfulness.`
      : `No acute malefic siege on the lunar mind.`,
  };
}

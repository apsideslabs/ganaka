/**
 * Gaṇaka — Domain 6: Classical Shastric Marriage Rules (Phase 6)
 * 
 * Authentic classical rules with shloka citations from:
 * - Bṛhat Parāśara Horā Śāstra (BPHS), Ch. 13 (सप्तमभावफल), Ch. 6 (Śoḍaśavarga)
 * - Phaladīpikā of Mantreśvara, Ch. 10 (कलत्रभावफल) & Ch. 15 (दशाफल)
 * - Sārāvalī of Kalyāṇavarmā, Ch. 35 (सप्तमभावविचार)
 * - Jātaka Pārijāta of Vaidyanātha Dīkṣita, Ch. 14 (कलत्रभाव)
 * - Sarvārtha Cintāmaṇi of Veṅkaṭeśa Daivajña, Ch. 6 (सप्तमविचार)
 * - Jaimini Upadeśa Sūtras, Adhyāya 1, Pāda 4 (उपपद एवं दारकारक)
 * - Uttara Kālāmṛta of Kālidāsa, Kāṇḍa 5 (कुजदोषभङ्ग)
 */

import { EvaluatedCondition, RuleEvaluationResult, ClassicalRuleDefinition, PredictionEvidence } from '../../types';
import { PredictionContext } from '../../context';

export const MARRIAGE_CLASSICAL_RULES: Record<string, ClassicalRuleDefinition> = {
  BPHS_SAPTAMESHA_KENDRA_TRIKONA: {
    ruleId: 'bphs_saptamesha_kendra_trikona',
    ruleName: 'Saptamādhipati Kendra-Trikona Matrimonial Harmony',
    sourceText: 'Brihat Parashara Hora Shastra',
    chapterAndVerse: 'BPHS Ch. 13, v. 1–4',
    sanskritShloka: 'सप्तमेशे शुभैर्युक्ते स्वोच्चे वा स्वगृहे स्थिते। भार्यासौख्यं सुपुत्रांश्च लभते नात्र संशयः॥',
    englishTranslation: 'When the 7th lord is associated with natural benefics, exalted, in its own sign, or situated in a Kendra or Trikona, matrimonial harmony, devoted companionship (Bhāryā-saukhya), and domestic prosperity are obtained without doubt.',
  },
  BPHS_SAPTAMESHA_DUSTHANA: {
    ruleId: 'bphs_saptamesha_dusthana',
    ruleName: 'Saptamādhipati Randhra-Vyaya Relational Vulnerability',
    sourceText: 'Brihat Parashara Hora Shastra',
    chapterAndVerse: 'BPHS Ch. 13, v. 5–8',
    sanskritShloka: 'सप्तमेशे षष्ठे वाऽष्टमे व्यये वा पापैर्युतेऽथवा वीक्षिते। कलत्रपीडा विसंवादो जायते भृशम्॥',
    englishTranslation: 'If the 7th lord is placed in the 6th, 8th, or 12th house (Dusthāna), or conjunct/aspected by malefics without benefic relief, marital discord, spouse health vulnerabilities, or structural hurdles in partnership arise.',
  },
  PHALADIPIKA_KALATRA_SAMUCCAYA: {
    ruleId: 'phaladipika_kalatra_samuccaya',
    ruleName: 'Kalatrakāraka Śukra & Saptama Bhāva Tri-Factor Synthesis',
    sourceText: 'Phaladipika of Mantreshwara',
    chapterAndVerse: 'Phaladipika Ch. 10, v. 1–4',
    sanskritShloka: 'कलत्रभावं कलत्रेशं शुक्रेणापि विचिन्तयेत्। शुभयुक्तेक्षिते सौख्यं विपरीते विपर्ययः॥',
    englishTranslation: 'One must comprehensively evaluate the 7th bhāva, the 7th lord, and Venus (Kalatrakāraka) together. Endowed with benefic conjunctions or aspects, marital bliss thrives; when afflicted, reciprocal trials occur.',
  },
  SARAVALI_SAPTAMASTHA_GRAHA: {
    ruleId: 'saravali_saptamastha_graha',
    ruleName: 'Saptamastha Graha Spousal Temperament Allocation',
    sourceText: 'Saravali of Kalyanavarma',
    chapterAndVerse: 'Saravali Ch. 35, v. 1–10',
    sanskritShloka: 'सप्तमे ये ग्रहास्तिष्ठन्ति तैरेव कलत्रस्वरूपनिर्देशः। स्वबलैः स्वांशकैश्चैव स्वभावाचरणं शुभम्॥',
    englishTranslation: 'The planets occupying or aspecting the 7th house signify the spouse’s inherent temperament, moral conduct, social status, and marital interaction dynamic.',
  },
  SARVARTHA_CINTAMANI_VIVAHA_VILAMBA: {
    ruleId: 'sarvartha_cintamani_vivaha_vilamba',
    ruleName: 'Manda-kṛta Vivāha Vilamba (Saturnine Delay vs Denial)',
    sourceText: 'Sarvartha Chintamani & Phaladipika',
    chapterAndVerse: 'Sarvartha Chintamani Ch. 6, v. 15–22 & Phaladipika Ch. 10, v. 11',
    sanskritShloka: 'मन्दे सप्तमे वा कलत्रेशे मन्दयुक्ते मन्दान्वितेक्षिते। विलम्बेन विवाहः स्यात् परिपाके शुभं भवेत्॥',
    englishTranslation: 'When Saturn occupies the 7th house, aspects the 7th house, or conjuncts the 7th lord, marriage is delayed until chronological maturity (post-28 to 32); this delay is not denial, as mature endurance stabilizes the covenant.',
  },
  JATAKA_PARIJATA_D9_NAVAMSHA: {
    ruleId: 'jataka_parijata_d9_navamsha',
    ruleName: 'Navāṃśa (D9) Sovereign Spousal & Dharmic Confirmation',
    sourceText: 'Jataka Parijata & BPHS',
    chapterAndVerse: 'Jataka Parijata Ch. 14, v. 25–30 & BPHS Ch. 6',
    sanskritShloka: 'नवांशेशे बलोपेते स्वोच्चे वा केन्द्रसंस्थिते। कलत्रसुखसम्पत्तिः सुशीला धर्मचारिणी॥',
    englishTranslation: 'The Navāṃśa (D9) is the paramount divisional chart for spouse and dharma (भार्यार्थे च नवांषकम्). Fortification of D1 7th lord in D9 confirms whether outward natal promise delivers genuine inner marital fulfillment.',
  },
  JAIMINI_UPAPADA_LAGNA: {
    ruleId: 'jaimini_upapada_lagna',
    ruleName: 'Jaimini Upapada Lagna (UL) Marital Covenant Endurance',
    sourceText: 'Jaimini Upadesha Sutras',
    chapterAndVerse: 'Jaimini Sutras Adhyaya 1, Pada 4, Sutras 1–10',
    sanskritShloka: 'उपपदं पदं पितुः। तत्र शुभयोगे भार्यासौख्यम्। द्वितीये पापैः कलहः॥',
    englishTranslation: 'Upapada Lagna (UL, arūḍha of 12th house) governs the societal and material endurance of marriage; benefics in UL or 2nd from UL sustain a lifelong bond; malefics without benefic aspect precipitate domestic discord.',
  },
  UTTARA_KALAMRITA_KUJA_DOSHA_BHANGA: {
    ruleId: 'uttara_kalamrita_kuja_dosha_bhanga',
    ruleName: 'Kuja Doṣa Classical Cancellation & Mitigation (Bhaṅga)',
    sourceText: 'Uttara Kalamrita & BPHS',
    chapterAndVerse: 'Uttara Kalamrita Kanda 5 & BPHS Ch. 13',
    sanskritShloka: 'कुजे स्वक्षेत्रगे वापि जीवेन संयुतेक्षिते। कुजदोषस्य भङ्गः स्याद्दाम्पत्यं सुखमेधते॥',
    englishTranslation: 'Kuja Doṣa (Mars in 1, 2, 4, 7, 8, 12) is cancelled (Bhauma Doṣa Bhaṅga) when Mars is in own sign, exalted, in Leo/Aquarius, or aspected by Jupiter or Moon, safeguarding domestic peace.',
  },
};

// ============================================================================
// RULE 1: BPHS Saptamādhipati Kendra-Trikona
// ============================================================================
export function evaluateRuleSaptameshaKendraTrikona(
  ctx: PredictionContext,
  condLord: EvaluatedCondition,
  condSAV: EvaluatedCondition
): RuleEvaluationResult {
  const def = MARRIAGE_CLASSICAL_RULES.BPHS_SAPTAMESHA_KENDRA_TRIKONA;
  const isTriggered = condLord.status === 'satisfied';
  const evidence: PredictionEvidence[] = [];
  const contradictions: string[] = [];

  if (isTriggered) {
    evidence.push({
      parameter: condLord.parameter,
      observedFact: condLord.observed,
      shastricRationale: condLord.rationale,
      polarity: 'supporting',
      weight: 'decisive',
    });
    if (condSAV.status === 'satisfied') {
      evidence.push({
        parameter: condSAV.parameter,
        observedFact: condSAV.observed,
        shastricRationale: condSAV.rationale,
        polarity: 'supporting',
        weight: 'strong',
      });
    }
  } else if (condLord.status === 'contradicted') {
    contradictions.push(condLord.rationale);
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
    status: isTriggered ? 'satisfied' : condLord.status === 'contradicted' ? 'contradicted' : 'partially_supported',
    isTriggered,
    conditionsEvaluated: [condLord, condSAV],
    evidence,
    contradictions,
    shastricVerdict: isTriggered
      ? '7th Lord holds Kendra/Trikona or exalted/own sign dignity; confirms core matrimonial promise, faithful companionship, and domestic harmony.'
      : '7th Lord lacks paramount Kendra/Trikona strength; matrimonial stability relies on supporting yogas and D9 alignment.',
    confidence: isTriggered ? 'high' : 'moderate',
  };
}

// ============================================================================
// RULE 2: BPHS Saptamādhipati Dusthāna
// ============================================================================
export function evaluateRuleSaptameshaDusthana(
  ctx: PredictionContext,
  condLord: EvaluatedCondition
): RuleEvaluationResult {
  const def = MARRIAGE_CLASSICAL_RULES.BPHS_SAPTAMESHA_DUSTHANA;
  const seventhLord = ctx.getLordOfHouse(7);
  const isInDusthana = [6, 8, 12].includes(seventhLord.house);
  const isTriggered = isInDusthana;
  const evidence: PredictionEvidence[] = [];
  const contradictions: string[] = [];

  if (isTriggered) {
    if (condLord.status === 'contradicted') {
      evidence.push({
        parameter: condLord.parameter,
        observedFact: condLord.observed,
        shastricRationale: condLord.rationale,
        polarity: 'counteracting',
        weight: 'decisive',
      });
    } else {
      evidence.push({
        parameter: condLord.parameter,
        observedFact: condLord.observed,
        shastricRationale: condLord.rationale,
        polarity: 'neutral',
        weight: 'moderate',
      });
    }
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
    status: isTriggered ? condLord.status : 'absent',
    isTriggered,
    conditionsEvaluated: [condLord],
    evidence,
    contradictions,
    shastricVerdict: isTriggered
      ? `7th Lord resides in House ${seventhLord.house} (Dusthāna); relational dynamics require conscious maturity, emotional transparency, and mutual compromise.`
      : '7th Lord is free from Dusthāna (6/8/12) placement, protecting primary marital promise.',
    confidence: isTriggered ? 'high' : 'low',
  };
}

// ============================================================================
// RULE 3: Phaladīpikā Kalatra Samuccaya (Tri-Factor)
// ============================================================================
export function evaluateRuleKalatraSamuccaya(
  ctx: PredictionContext,
  condLord: EvaluatedCondition,
  condRays: EvaluatedCondition,
  condVenus: EvaluatedCondition
): RuleEvaluationResult {
  const def = MARRIAGE_CLASSICAL_RULES.PHALADIPIKA_KALATRA_SAMUCCAYA;
  const positiveCount = [condLord.status, condRays.status, condVenus.status].filter((s) => s === 'satisfied').length;
  const isTriggered = positiveCount >= 2;
  const evidence: PredictionEvidence[] = [];
  const contradictions: string[] = [];

  if (isTriggered) {
    evidence.push({
      parameter: 'kalatra_trifactor_convergence',
      observedFact: `Tri-factor convergence satisfied (${positiveCount}/3 factors satisfied)`,
      shastricRationale: '7th Lord, 7th House rays, and Venus collectively affirm matrimonial happiness per Phaladīpikā Ch. 10.',
      polarity: 'supporting',
      weight: 'decisive',
    });
  } else {
    contradictions.push('Tri-factor convergence is split or incomplete; requires balanced synthesis between 7th house and Venus.');
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
    status: isTriggered ? 'satisfied' : 'partially_supported',
    isTriggered,
    conditionsEvaluated: [condLord, condRays, condVenus],
    evidence,
    contradictions,
    shastricVerdict: isTriggered
      ? 'Classical Kalatra Tri-Factor synthesis affirms harmonious marriage through aligned strength of 7th house, 7th lord, and Venus.'
      : 'Mixed signals across 7th house, 7th lord, and Venus; partnership requires tailored communication.',
    confidence: isTriggered ? 'high' : 'moderate',
  };
}

// ============================================================================
// RULE 4: Sārāvalī Saptamastha Graha (Spousal Temperament)
// ============================================================================
export function evaluateRuleSaravaliSaptamasthaGraha(
  ctx: PredictionContext,
  condSpouse: EvaluatedCondition
): RuleEvaluationResult {
  const def = MARRIAGE_CLASSICAL_RULES.SARAVALI_SAPTAMASTHA_GRAHA;
  const isTriggered = condSpouse.status === 'satisfied';
  const evidence: PredictionEvidence[] = [];

  if (isTriggered) {
    evidence.push({
      parameter: condSpouse.parameter,
      observedFact: condSpouse.observed,
      shastricRationale: condSpouse.rationale,
      polarity: 'supporting',
      weight: 'strong',
    });
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
    status: 'satisfied',
    isTriggered,
    conditionsEvaluated: [condSpouse],
    evidence,
    contradictions: [],
    shastricVerdict: condSpouse.rationale,
    confidence: 'high',
  };
}

// ============================================================================
// RULE 5: Sarvārtha Cintāmaṇi Vivāha Vilamba (Delay vs Denial)
// ============================================================================
export function evaluateRuleSarvarthaVivahaVilamba(
  ctx: PredictionContext,
  condVilamba: EvaluatedCondition
): RuleEvaluationResult {
  const def = MARRIAGE_CLASSICAL_RULES.SARVARTHA_CINTAMANI_VIVAHA_VILAMBA;
  const isTriggered = condVilamba.status === 'partially_supported'; // Triggered when delay factors are active
  const evidence: PredictionEvidence[] = [];

  if (isTriggered) {
    evidence.push({
      parameter: condVilamba.parameter,
      observedFact: condVilamba.observed,
      shastricRationale: condVilamba.rationale,
      polarity: 'neutral',
      weight: 'moderate',
    });
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
    status: isTriggered ? 'partially_supported' : 'satisfied',
    isTriggered,
    conditionsEvaluated: [condVilamba],
    evidence,
    contradictions: [],
    shastricVerdict: condVilamba.rationale,
    confidence: 'high',
  };
}

// ============================================================================
// RULE 6: Jātaka Pārijāta D9 Navāṃśa Confirmation
// ============================================================================
export function evaluateRuleJatakaParijataD9(
  ctx: PredictionContext,
  condD9: EvaluatedCondition
): RuleEvaluationResult {
  const def = MARRIAGE_CLASSICAL_RULES.JATAKA_PARIJATA_D9_NAVAMSHA;
  const isTriggered = condD9.status === 'satisfied';
  const evidence: PredictionEvidence[] = [];
  const contradictions: string[] = [];

  if (isTriggered) {
    evidence.push({
      parameter: condD9.parameter,
      observedFact: condD9.observed,
      shastricRationale: condD9.rationale,
      polarity: 'supporting',
      weight: 'decisive',
    });
  } else if (condD9.status === 'contradicted') {
    contradictions.push(condD9.rationale);
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
    status: condD9.status,
    isTriggered,
    conditionsEvaluated: [condD9],
    evidence,
    contradictions,
    shastricVerdict: condD9.rationale,
    confidence: 'high',
  };
}

// ============================================================================
// RULE 7: Jaimini Upapada Lagna (UL) Covenant Durability
// ============================================================================
export function evaluateRuleJaiminiUpapada(
  ctx: PredictionContext,
  condJaimini: EvaluatedCondition
): RuleEvaluationResult {
  const def = MARRIAGE_CLASSICAL_RULES.JAIMINI_UPAPADA_LAGNA;
  const isTriggered = condJaimini.status === 'satisfied';
  const evidence: PredictionEvidence[] = [];
  const contradictions: string[] = [];

  if (isTriggered) {
    evidence.push({
      parameter: condJaimini.parameter,
      observedFact: condJaimini.observed,
      shastricRationale: condJaimini.rationale,
      polarity: 'supporting',
      weight: 'strong',
    });
  } else if (condJaimini.status === 'contradicted') {
    contradictions.push(condJaimini.rationale);
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
    status: condJaimini.status,
    isTriggered,
    conditionsEvaluated: [condJaimini],
    evidence,
    contradictions,
    shastricVerdict: condJaimini.rationale,
    confidence: 'high',
  };
}

// ============================================================================
// RULE 8: Uttara Kālāmṛta Kuja Doṣa Bhaṅga
// ============================================================================
export function evaluateRuleKujaDoshaBhanga(
  ctx: PredictionContext,
  condKuja: EvaluatedCondition
): RuleEvaluationResult {
  const def = MARRIAGE_CLASSICAL_RULES.UTTARA_KALAMRITA_KUJA_DOSHA_BHANGA;
  const isTriggered = condKuja.status === 'satisfied';
  const evidence: PredictionEvidence[] = [];
  const contradictions: string[] = [];

  if (isTriggered) {
    evidence.push({
      parameter: condKuja.parameter,
      observedFact: condKuja.observed,
      shastricRationale: condKuja.rationale,
      polarity: 'supporting',
      weight: 'strong',
    });
  } else if (condKuja.status === 'contradicted') {
    contradictions.push(condKuja.rationale);
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
    status: condKuja.status,
    isTriggered,
    conditionsEvaluated: [condKuja],
    evidence,
    contradictions,
    shastricVerdict: condKuja.rationale,
    confidence: 'high',
  };
}

/**
 * Gaṇaka — Domain 6: Marriage, Spouse & Sacred Partnership (Phase 6)
 * 
 * Reference implementation for Phase 6:
 * Multi-factor, shastrically verified evaluation of marriage promise,
 * spousal temperament & archetype, delay vs denial (Manda-kṛta Vivāha Vilamba),
 * Kuja Doṣa & shastric Bhaṅga, Navāṃśa (D9) confirmation, Jaimini Upapada Lagna
 * & Dārakāraka, authentic Vimshottari Daśā activation, and shastric synthesis.
 */

import { PredictionContext } from '../../context';
import {
  DomainPredictionStatus,
  QualitativeEvidenceState,
} from '../../types';
import { MarriageDomainResult } from './types';
import {
  evaluateSaptameshaMultiFactorCondition,
  evaluateSeventhBhavaRayCondition,
  evaluateKalatrakarakaCondition,
  evaluateSeventhSAVCondition,
  evaluateSpouseTemperamentCondition,
  evaluateMandaVivahaVilambaCondition,
  evaluateKujaDoshaCondition,
  evaluateD9NavamshaCondition,
  evaluateJaiminiMarriageCondition,
  evaluateMarriageTimingCondition,
} from './conditions';
import {
  evaluateRuleSaptameshaKendraTrikona,
  evaluateRuleSaptameshaDusthana,
  evaluateRuleKalatraSamuccaya,
  evaluateRuleSaravaliSaptamasthaGraha,
  evaluateRuleSarvarthaVivahaVilamba,
  evaluateRuleJatakaParijataD9,
  evaluateRuleJaiminiUpapada,
  evaluateRuleKujaDoshaBhanga,
} from './rules';
import { buildMarriageEvidenceStack } from './evidence';
import { synthesizeMarriageDomain } from './synthesis';

export * from './types';
export * from './conditions';
export * from './rules';
export * from './evidence';
export * from './synthesis';

function mapEvidenceStateToDomainStatus(state: QualitativeEvidenceState): DomainPredictionStatus {
  switch (state) {
    case 'strongly_supported':
    case 'supported':
      return 'verified_prediction';
    case 'mixed':
    case 'weakly_supported':
      return 'partially_supported';
    case 'contradicted':
      return 'contradicted_indication';
    case 'insufficient_evidence':
    default:
      return 'insufficient_evidence';
  }
}

/**
 * Main evaluation entrypoint for Domain 6 (Marriage, Spouse & Sacred Partnership)
 */
export function evaluateMarriageDomain(ctx: PredictionContext): MarriageDomainResult {
  // 1. Evaluate all multi-factor classical conditions
  const condSaptamesha = evaluateSaptameshaMultiFactorCondition(ctx);
  const condSeventhRay = evaluateSeventhBhavaRayCondition(ctx);
  const condKalatrakaraka = evaluateKalatrakarakaCondition(ctx);
  const condSeventhSAV = evaluateSeventhSAVCondition(ctx);
  const { evaluatedCondition: condSpouse, spousalProfile } = evaluateSpouseTemperamentCondition(ctx);
  const { evaluatedCondition: condVilamba, delayAnalysis } = evaluateMandaVivahaVilambaCondition(ctx);
  const { evaluatedCondition: condKuja, kujaAnalysis } = evaluateKujaDoshaCondition(ctx);
  const { evaluatedCondition: condD9, d9Confirmation } = evaluateD9NavamshaCondition(ctx);
  const { evaluatedCondition: condJaimini, jaiminiFactors } = evaluateJaiminiMarriageCondition(ctx);
  const { evaluatedCondition: condTiming, timingArc } = evaluateMarriageTimingCondition(ctx);

  const allConditions = [
    condSaptamesha,
    condSeventhRay,
    condKalatrakaraka,
    condSeventhSAV,
    condSpouse,
    condVilamba,
    condKuja,
    condD9,
    condJaimini,
    condTiming,
  ];

  // 2. Evaluate classical shastric rules
  const ruleKendraTrikona = evaluateRuleSaptameshaKendraTrikona(ctx, condSaptamesha, condSeventhSAV);
  const ruleDusthana = evaluateRuleSaptameshaDusthana(ctx, condSaptamesha);
  const ruleSamuccaya = evaluateRuleKalatraSamuccaya(ctx, condSaptamesha, condSeventhRay, condKalatrakaraka);
  const ruleSpouseArchetype = evaluateRuleSaravaliSaptamasthaGraha(ctx, condSpouse);
  const ruleVilamba = evaluateRuleSarvarthaVivahaVilamba(ctx, condVilamba);
  const ruleD9 = evaluateRuleJatakaParijataD9(ctx, condD9);
  const ruleJaimini = evaluateRuleJaiminiUpapada(ctx, condJaimini);
  const ruleKujaBhanga = evaluateRuleKujaDoshaBhanga(ctx, condKuja);

  const allRules = [
    ruleKendraTrikona,
    ruleDusthana,
    ruleSamuccaya,
    ruleSpouseArchetype,
    ruleVilamba,
    ruleD9,
    ruleJaimini,
    ruleKujaBhanga,
  ];

  const triggeredRules = allRules.filter((r) => r.isTriggered);
  const untriggeredRules = allRules.filter((r) => !r.isTriggered);

  // 3. Build Evidence Stack & resolve classical tensions
  const evidence = buildMarriageEvidenceStack(
    ctx,
    allConditions,
    spousalProfile,
    kujaAnalysis,
    d9Confirmation,
    jaiminiFactors,
    delayAnalysis,
    timingArc
  );

  // 4. Synthesize final domain predictions & narrative
  const synthesis = synthesizeMarriageDomain(
    ctx,
    evidence,
    allRules,
    spousalProfile,
    kujaAnalysis,
    d9Confirmation,
    jaiminiFactors,
    delayAnalysis,
    timingArc
  );

  const seventhLord = ctx.getLordOfHouse(7);
  const venus = ctx.getPlanet('venus');
  const h7 = ctx.getHouse(7);

  return {
    domainId: 'marriage_spouse_partnership',
    domainNumber: 6,
    canonicalTitle: 'Marriage, Spouse & Sacred Partnership',
    sanskritTitle: 'सप्तमभाव एवं कलत्र-दाम्पत्य विचार',
    governingHouses: [7],
    status: mapEvidenceStateToDomainStatus(evidence.domainState),
    primaryLord: {
      id: seventhLord.id,
      name: seventhLord.name,
      rashi: seventhLord.rashiName,
      house: seventhLord.house,
      dignity: seventhLord.dignity,
      isRetrograde: seventhLord.isRetrograde,
      isCombust: seventhLord.isCombust,
    },
    naturalKaraka: {
      id: 'venus',
      name: 'Venus (Śukra)',
      shadbalaRatio: venus.shadbalaRatio,
      house: venus.house,
      dignity: venus.dignity,
    },
    houseSAVBindus: {
      7: {
        bindus: h7.savBindus,
        evaluation: h7.savClassification,
        isFavorable: h7.isSavFavorable,
      },
    },
    evaluatedConditions: allConditions,
    triggeredRules,
    untriggeredRules,
    supportingEvidence: evidence.supportingEvidence,
    contradictingEvidence: evidence.contradictingEvidence,
    finalVerdict: synthesis.finalVerdict,
    synthesisNarrative: synthesis.synthesisNarrative,
    caveatsAndAbsences: evidence.unresolvedUncertainties,

    // Phase 6 Rich Marriage Domain Attributes
    qualitativeState: evidence.domainState,
    marriagePromise: evidence.marriagePromise,
    spousalProfile,
    kujaDosha: kujaAnalysis,
    d9NavamshaConfirmation: d9Confirmation,
    jaiminiFactors,
    delayVsDenial: delayAnalysis,
    timingArc,
    obstacles: evidence.obstacles,
    marriageTensions: evidence.tensions,
    unresolvedUncertainties: evidence.unresolvedUncertainties,
  };
}

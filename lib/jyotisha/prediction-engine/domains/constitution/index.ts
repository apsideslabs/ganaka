/**
 * Gaṇaka — Domain 1: Constitution, Mind & Physical Appearance
 * 
 * Reference implementation for Phase 2:
 * Genuinely chart-dependent, multi-factor, evidence-grounded evaluation
 * of physical stamina, cognitive temperament, skeletal appearance, and bodily indications.
 */

import { PredictionContext } from '../../context';
import {
  DomainPredictionResult,
  DomainPredictionStatus,
  RuleEvaluationResult,
  QualitativeEvidenceState,
} from '../../types';
import {
  ConstitutionDomainResult,
} from './types';
import {
  evaluateLagneshaMultiFactorCondition,
  evaluateLagnaBhavaRayCondition,
  evaluateLagnaSAVCondition,
  evaluateSuryaVitalityCondition,
  evaluateChandraManasCondition,
  evaluateBuddhiDiscernmentCondition,
  evaluateClassicalMarkVectors,
} from './conditions';
import {
  evaluateRuleDehaSaukhya,
  evaluateRuleTanuAffliction,
  evaluateRuleCandraEquanimity,
  evaluateRuleCandraAffliction,
} from './rules';
import { buildConstitutionEvidenceStack } from './evidence';
import { synthesizeConstitutionDomain } from './synthesis';

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

function mapEvidenceStateToConfidence(state: QualitativeEvidenceState): 'high' | 'moderate' | 'low' {
  switch (state) {
    case 'strongly_supported':
      return 'high';
    case 'supported':
    case 'mixed':
      return 'moderate';
    case 'weakly_supported':
    case 'contradicted':
    case 'insufficient_evidence':
    default:
      return 'low';
  }
}

/**
 * Main evaluation entrypoint for Domain 1 (Constitution / Mind / Physical Appearance)
 */
export function evaluateConstitutionDomain(ctx: PredictionContext): ConstitutionDomainResult {
  // 1. Evaluate all multi-factor conditions
  const condLagnesha = evaluateLagneshaMultiFactorCondition(ctx);
  const condLagnaRay = evaluateLagnaBhavaRayCondition(ctx);
  const condSAV = evaluateLagnaSAVCondition(ctx);
  const condSun = evaluateSuryaVitalityCondition(ctx);
  const condChandra = evaluateChandraManasCondition(ctx);
  const condBuddhi = evaluateBuddhiDiscernmentCondition(ctx);
  const { evaluatedCondition: condMarks, markIndications } = evaluateClassicalMarkVectors(ctx);

  const allConditions = [
    condLagnesha,
    condLagnaRay,
    condSAV,
    condSun,
    condChandra,
    condBuddhi,
    condMarks,
  ];

  // 2. Evaluate classical shastric rules
  const ruleDehaSaukhya = evaluateRuleDehaSaukhya(ctx, condLagnesha, condLagnaRay, condSAV, condSun);
  const ruleTanuAffliction = evaluateRuleTanuAffliction(ctx, condLagnesha, condLagnaRay, condSAV);
  const ruleCandraEquanimity = evaluateRuleCandraEquanimity(ctx, condChandra);
  const ruleCandraAffliction = evaluateRuleCandraAffliction(ctx, condChandra);

  const allRules = [ruleDehaSaukhya, ruleTanuAffliction, ruleCandraEquanimity, ruleCandraAffliction];
  const triggeredRules = allRules.filter((r) => r.isTriggered);
  const untriggeredRules = allRules.filter((r) => !r.isTriggered);

  // 3. Build Evidence Stack & resolve contradictions
  const evidenceStack = buildConstitutionEvidenceStack(ctx, allConditions, markIndications);

  // 4. Synthesize final domain predictions & details
  const synthesis = synthesizeConstitutionDomain(ctx, evidenceStack, allRules, markIndications);
  const lagnaLord = ctx.getLordOfHouse(1);
  const sun = ctx.getPlanet('sun');
  const h1 = ctx.getHouse(1);

  return {
    domainId: 'constitution_body_mind',
    domainNumber: 1,
    canonicalTitle: 'Constitution, Mind & Physical Appearance',
    sanskritTitle: 'तनुभाव एवं देहप्रकृति',
    governingHouses: [1],
    status: mapEvidenceStateToDomainStatus(evidenceStack.domainState),
    primaryLord: {
      id: lagnaLord.id,
      name: lagnaLord.name,
      rashi: lagnaLord.rashiName,
      house: lagnaLord.house,
      dignity: lagnaLord.dignity,
      isRetrograde: lagnaLord.isRetrograde,
      isCombust: lagnaLord.isCombust,
    },
    naturalKaraka: {
      id: 'sun',
      name: 'Sun',
      shadbalaRatio: sun.shadbalaRatio,
      house: sun.house,
      dignity: sun.dignity,
    },
    houseSAVBindus: {
      1: {
        bindus: h1.savBindus,
        evaluation: h1.savClassification,
        isFavorable: h1.isSavFavorable,
      },
    },
    evaluatedConditions: allConditions,
    triggeredRules,
    untriggeredRules,
    supportingEvidence: evidenceStack.supportingEvidence,
    contradictingEvidence: evidenceStack.contradictingEvidence,
    finalVerdict: synthesis.finalVerdict,
    synthesisNarrative: synthesis.synthesisNarrative,
    caveatsAndAbsences: evidenceStack.unresolvedUncertainties,

    // Domain 1 Specific Rich Attributes
    qualitativeState: evidenceStack.domainState,
    physicalStaminaState: evidenceStack.staminaState,
    mentalDispositionState: evidenceStack.mentalState,
    appearanceDetails: synthesis.appearanceDetails,
    mentalDetails: synthesis.mentalDetails,
    elementalProfile: synthesis.elementalProfile,
    maturationArc: synthesis.maturationArc,
    classicalMarkIndications: markIndications,
    constitutionalTensions: evidenceStack.tensions,
    unresolvedUncertainties: evidenceStack.unresolvedUncertainties,
  };
}

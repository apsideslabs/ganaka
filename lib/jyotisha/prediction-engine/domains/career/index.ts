/**
 * Gaṇaka — Domain 3: Career, Vocation & Karma (Phase 3)
 * 
 * Reference implementation for Phase 3:
 * Genuinely chart-dependent, multi-factor, evidence-grounded evaluation
 * of career strength, vocational field/archetype, authority/status,
 * employment vs independent work, stability, workplace environment,
 * advancement, obstacles, D10 confirmation, and authentic Daśā timing.
 */

import { PredictionContext } from '../../context';
import {
  DomainPredictionResult,
  DomainPredictionStatus,
  RuleEvaluationResult,
  QualitativeEvidenceState,
} from '../../types';
import {
  CareerDomainResult,
} from './types';
import {
  evaluateDashameshaMultiFactorCondition,
  evaluateTenthBhavaRayCondition,
  evaluateTenthSAVCondition,
  evaluateAuthorityAndRajyaCondition,
  evaluateWorkModeCondition,
  evaluateKarmaKarakaSaturnCondition,
  evaluateVocationalTendencyCondition,
  evaluateD10DashamshaCondition,
  evaluateCareerTimingCondition,
} from './conditions';
import {
  evaluateRuleDashameshaKendraTrikona,
  evaluateRuleDashameshaDusthana,
  evaluateRuleAmalaYoga,
  evaluateRuleSuryaDigbala,
  evaluateRuleSaravaliVritti,
  evaluateRuleJatakaParijataD10,
} from './rules';
import { buildCareerEvidenceStack } from './evidence';
import { synthesizeCareerDomain } from './synthesis';

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
 * Main evaluation entrypoint for Domain 3 (Career / Profession / Karma)
 */
export function evaluateCareerDomain(ctx: PredictionContext): CareerDomainResult {
  // 1. Evaluate all multi-factor conditions
  const condDashamesha = evaluateDashameshaMultiFactorCondition(ctx);
  const condTenthRay = evaluateTenthBhavaRayCondition(ctx);
  const condTenthSAV = evaluateTenthSAVCondition(ctx);
  const { evaluatedCondition: condAuthority, authorityLevel, authorityNarrative } = evaluateAuthorityAndRajyaCondition(ctx);
  const { evaluatedCondition: condWorkMode, workMode } = evaluateWorkModeCondition(ctx);
  const condKarmaSaturn = evaluateKarmaKarakaSaturnCondition(ctx);
  const { evaluatedCondition: condVocational, primaryArchetype, secondaryArchetypes } = evaluateVocationalTendencyCondition(ctx);
  const { evaluatedCondition: condD10, d10Details } = evaluateD10DashamshaCondition(ctx);
  const { evaluatedCondition: condTiming, timingArc } = evaluateCareerTimingCondition(ctx);

  const allConditions = [
    condDashamesha,
    condTenthRay,
    condTenthSAV,
    condAuthority,
    condWorkMode,
    condKarmaSaturn,
    condVocational,
    condD10,
    condTiming,
  ];

  // 2. Evaluate classical shastric rules
  const ruleKendraTrikona = evaluateRuleDashameshaKendraTrikona(ctx, condDashamesha, condTenthSAV);
  const ruleDusthana = evaluateRuleDashameshaDusthana(ctx, condDashamesha);
  const ruleAmala = evaluateRuleAmalaYoga(ctx, condTenthRay);
  const ruleSuryaDigbala = evaluateRuleSuryaDigbala(ctx, condAuthority);
  const ruleSaravaliVritti = evaluateRuleSaravaliVritti(ctx, condVocational);
  const ruleJatakaParijataD10 = evaluateRuleJatakaParijataD10(ctx, condD10);

  const allRules = [
    ruleKendraTrikona,
    ruleDusthana,
    ruleAmala,
    ruleSuryaDigbala,
    ruleSaravaliVritti,
    ruleJatakaParijataD10,
  ];
  const triggeredRules = allRules.filter((r) => r.isTriggered);
  const untriggeredRules = allRules.filter((r) => !r.isTriggered);

  // 3. Build Evidence Stack & resolve contradictions
  const evidence = buildCareerEvidenceStack(
    ctx,
    allConditions,
    authorityLevel,
    workMode,
    d10Details
  );

  // 4. Synthesize final domain predictions & details
  const synthesis = synthesizeCareerDomain(
    ctx,
    evidence,
    allRules,
    primaryArchetype,
    secondaryArchetypes,
    authorityLevel,
    authorityNarrative,
    workMode,
    timingArc,
    d10Details
  );

  const tenthLord = ctx.getLordOfHouse(10);
  const saturn = ctx.getPlanet('saturn');
  const h10 = ctx.getHouse(10);

  return {
    domainId: 'career_vocation_karma',
    domainNumber: 3,
    canonicalTitle: 'Career, Vocation & Karma',
    sanskritTitle: 'दशमभाव एवं कर्मवृत्ति',
    governingHouses: [10],
    status: mapEvidenceStateToDomainStatus(evidence.domainState),
    primaryLord: {
      id: tenthLord.id,
      name: tenthLord.name,
      rashi: tenthLord.rashiName,
      house: tenthLord.house,
      dignity: tenthLord.dignity,
      isRetrograde: tenthLord.isRetrograde,
      isCombust: tenthLord.isCombust,
    },
    naturalKaraka: {
      id: 'saturn',
      name: 'Saturn',
      shadbalaRatio: saturn.shadbalaRatio,
      house: saturn.house,
      dignity: saturn.dignity,
    },
    houseSAVBindus: {
      10: {
        bindus: h10.savBindus,
        evaluation: h10.savClassification,
        isFavorable: h10.isSavFavorable,
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

    // Phase 3 Rich Career Domain Attributes
    qualitativeState: evidence.domainState,
    careerStrength: evidence.careerStrength,
    primaryArchetype,
    secondaryArchetypes,
    authorityLevel,
    authorityNarrative,
    workMode,
    stability: evidence.stability,
    workplaceEnvironment: synthesis.workplaceEnvironment,
    advancement: evidence.advancement,
    obstacles: evidence.obstacles,
    timingArc,
    d10Details,
    careerTensions: evidence.tensions,
    unresolvedUncertainties: evidence.unresolvedUncertainties,
  };
}

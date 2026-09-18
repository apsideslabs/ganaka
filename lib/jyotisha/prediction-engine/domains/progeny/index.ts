/**
 * Gaṇaka — Domain 7: Children & Progeny (Santāna / Putra) Engine (Phase 7)
 * Comprehensive evaluation of lineage, fertility, 5th house, D7 Saptāṃśa,
 * specialized Bīja/Kṣetra Sphuṭas, Jaimini Putrakāraka, and karmic timing.
 */

import { PredictionContext } from '../../context';
import { DomainPredictionStatus, QualitativeEvidenceState } from '../../types';
import { ProgenyDomainResult } from './types';
import {
  evaluateFifthHouseCondition,
  evaluateFifthLordCondition,
  evaluateNaturalKarakaJupiterCondition,
  evaluateMultiLagnaTriangulation,
  evaluateD7SaptamshaCondition,
  evaluateSpecializedSphutasProgeny,
  evaluateJaiminiProgenyFactors,
  evaluateKarmicShapasAndObstacles,
  evaluateDelayVsDenial,
  evaluateProgenyTimingArc,
} from './conditions';
import { buildProgenyEvidenceStack } from './evidence';
import { synthesizeProgenyDomain } from './synthesis';

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
 * Main evaluation entrypoint for Domain 7 (Children & Progeny / Santāna)
 */
export function evaluateProgenyDomain(ctx: PredictionContext): ProgenyDomainResult {
  // 1. Evaluate D1 5th house & 5th lord
  const { evaluatedCondition: condFifthHouse, assessment: fifthHouse } = evaluateFifthHouseCondition(ctx);
  const { evaluatedCondition: condFifthLord, assessment: fifthLord } = evaluateFifthLordCondition(ctx);
  const { evaluatedCondition: condJupiter, assessment: naturalKarakaJupiter } = evaluateNaturalKarakaJupiterCondition(ctx);

  // 2. Multi-Lagna Triangulation
  const triangulation = evaluateMultiLagnaTriangulation(ctx);

  // 3. D7 Saptāṃśa Confirmation
  const { evaluatedCondition: condD7, confirmation: d7Saptamsha } = evaluateD7SaptamshaCondition(ctx);

  // 4. Specialized Progeny Sphuṭas (Bīja, Kṣetra, Santāna Tithi)
  const specializedSphutas = evaluateSpecializedSphutasProgeny(ctx);

  // 5. Jaimini Progeny Factors (PK, 5th from KL, A5)
  const jaiminiProgeny = evaluateJaiminiProgenyFactors(ctx);

  // 6. Karmic Curses (Śāpas) & Shastric Bhaṅga
  const shapasAndObstacles = evaluateKarmicShapasAndObstacles(ctx);

  // 7. Delay vs Denial Synthesis
  const delayVsDenial = evaluateDelayVsDenial(
    fifthHouse,
    fifthLord,
    naturalKarakaJupiter,
    d7Saptamsha,
    shapasAndObstacles
  );

  // 8. Authentic Progeny Timing Arc
  const timingArc = evaluateProgenyTimingArc(ctx, fifthLord, d7Saptamsha);

  const allConditions = [condFifthHouse, condFifthLord, condJupiter, condD7];

  // 9. Build Evidence Stack
  const evidence = buildProgenyEvidenceStack(
    ctx,
    allConditions,
    fifthHouse,
    fifthLord,
    naturalKarakaJupiter,
    d7Saptamsha,
    specializedSphutas,
    jaiminiProgeny,
    delayVsDenial,
    shapasAndObstacles
  );

  // 10. Synthesize final domain predictions & narrative
  const synthesis = synthesizeProgenyDomain(
    ctx,
    evidence,
    fifthHouse,
    fifthLord,
    naturalKarakaJupiter,
    triangulation,
    d7Saptamsha,
    specializedSphutas,
    jaiminiProgeny,
    delayVsDenial,
    shapasAndObstacles,
    timingArc
  );

  const primaryLord = ctx.getLordOfHouse(5);
  const jup = ctx.planets['jupiter'];

  return {
    domainId: 'children_progeny_lineage',
    domainNumber: 7,
    canonicalTitle: 'Children, Progeny & Lineage Continuity',
    sanskritTitle: 'पञ्चमभाव एवं सन्तान-पुत्र विचार',
    governingHouses: [5],
    status: mapEvidenceStateToDomainStatus(evidence.domainState),
    primaryLord: {
      id: primaryLord.id,
      name: primaryLord.name,
      rashi: primaryLord.rashiName,
      house: primaryLord.house,
      dignity: primaryLord.dignity,
      isRetrograde: primaryLord.isRetrograde,
      isCombust: primaryLord.isCombust,
    },
    naturalKaraka: {
      id: 'jupiter',
      name: 'Jupiter (Guru)',
      shadbalaRatio: jup.shadbalaRatio ?? 1.2,
      house: jup.house,
      dignity: jup.dignity,
    },
    houseSAVBindus: {
      5: {
        bindus: fifthHouse.savBindus,
        evaluation:
          fifthHouse.savEvaluation === 'strong_abundance'
            ? 'high'
            : fifthHouse.savEvaluation === 'adequate'
            ? 'adequate'
            : 'deficient',
        isFavorable: fifthHouse.savEvaluation !== 'deficient',
      },
    },
    evaluatedConditions: allConditions,
    triggeredRules: [],
    untriggeredRules: [],
    supportingEvidence: evidence.supportingEvidence,
    contradictingEvidence: evidence.contradictingEvidence,
    finalVerdict: synthesis.finalVerdict,
    synthesisNarrative: synthesis.synthesisNarrative,
    caveatsAndAbsences: evidence.unresolvedUncertainties,

    qualitativeState: evidence.domainState,
    fifthHouse,
    fifthLord,
    naturalKarakaJupiter,
    triangulation,
    d7Saptamsha,
    specializedSphutas,
    jaiminiProgeny,
    progenyPromise: evidence.progenyPromise,
    delayVsDenial,
    shapasAndObstacles,
    timingArc,
    progenyTensions: evidence.tensions,
    unresolvedUncertainties: evidence.unresolvedUncertainties,
    conditionsAudited: allConditions.map((c) => ({
      conditionId: c.id,
      sanskritTerm: c.name,
      status: c.status,
      observations: [c.observed],
      shastricReference: c.rationale,
    })),
  };
}

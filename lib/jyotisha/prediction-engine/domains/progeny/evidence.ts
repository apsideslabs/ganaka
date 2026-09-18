/**
 * Gaṇaka — Domain 7: Children & Progeny Evidence Stack & Synthesis (Phase 7)
 * Evidence aggregation, qualitative state determination, and shastric tension resolution.
 */

import { PredictionContext } from '../../context';
import { EvaluatedCondition, PredictionEvidence, QualitativeEvidenceState } from '../../types';
import {
  FifthHouseAssessment,
  FifthLordAssessment,
  NaturalKarakaJupiterAssessment,
  D7SaptamshaConfirmation,
  SpecializedSphutasProgeny,
  JaiminiProgenyFactors,
  ProgenyObstacleOrShapa,
  DelayVsDenialProgeny,
  ProgenyPromise,
} from './types';

export interface ProgenyTension {
  factorA: string;
  factorB: string;
  tensionDescription: string;
  shastricResolution: string;
}

export interface EvaluatedProgenyEvidenceStack {
  domainState: QualitativeEvidenceState;
  progenyPromise: ProgenyPromise;
  supportingEvidence: PredictionEvidence[];
  contradictingEvidence: PredictionEvidence[];
  tensions: ProgenyTension[];
  unresolvedUncertainties: string[];
}

export function buildProgenyEvidenceStack(
  ctx: PredictionContext,
  conditions: EvaluatedCondition[],
  fifthHouse: FifthHouseAssessment,
  fifthLord: FifthLordAssessment,
  jupiterAssessment: NaturalKarakaJupiterAssessment,
  d7Confirmation: D7SaptamshaConfirmation,
  specializedSphutas: SpecializedSphutasProgeny,
  jaiminiFactors: JaiminiProgenyFactors,
  delayVsDenial: DelayVsDenialProgeny,
  shapas: ProgenyObstacleOrShapa[]
): EvaluatedProgenyEvidenceStack {
  const supportingEvidence: PredictionEvidence[] = [];
  const contradictingEvidence: PredictionEvidence[] = [];

  conditions.forEach((c) => {
    if (c.status === 'satisfied') {
      supportingEvidence.push({
        parameter: c.parameter,
        observedFact: c.observed,
        shastricRationale: c.rationale,
        polarity: 'supporting',
        weight: c.weight === 'mandatory' ? 'decisive' : 'strong',
      });
    } else if (c.status === 'contradicted') {
      contradictingEvidence.push({
        parameter: c.parameter,
        observedFact: c.observed,
        shastricRationale: c.rationale,
        polarity: 'counteracting',
        weight: c.weight === 'mandatory' ? 'decisive' : 'strong',
      });
    }
  });

  // 1. Determine Progeny Promise
  let progenyPromise: ProgenyPromise = 'assured_healthy';

  const isD1Fortified =
    fifthLord.placedInKendraOrKona &&
    (fifthLord.dignity === 'exalted' || fifthLord.dignity === 'own' || fifthLord.dignity === 'moolatrikona' || fifthLord.dignity === 'friendly') &&
    !fifthLord.isCombust;

  const isD7Reinforced =
    d7Confirmation.vargaConfirmationStatus === 'strongly_reinforced' ||
    d7Confirmation.vargaConfirmationStatus === 'harmonious';

  const isFertileSign = fifthHouse.fertilityType === 'fertile';
  const isHighSav = fifthHouse.savEvaluation === 'strong_abundance';
  const hasUnmitigatedShapas = shapas.some((s) => !s.hasBhanga);

  if (delayVsDenial.verdictType === 'deep_structural_denial') {
    progenyPromise = 'severely_obstructed';
  } else if (hasUnmitigatedShapas) {
    progenyPromise = 'fraught_with_obstacles';
  } else if (delayVsDenial.verdictType === 'saturnine_delay') {
    progenyPromise = 'delayed_realization';
  } else if (isD1Fortified && isD7Reinforced && isFertileSign && isHighSav) {
    progenyPromise = 'abundant_progeny';
  } else if (fifthHouse.fertilityType === 'barren' && !isHighSav) {
    progenyPromise = 'limited_progeny';
  } else if (isD1Fortified && isD7Reinforced) {
    progenyPromise = 'assured_healthy';
  } else {
    progenyPromise = 'assured_healthy';
  }

  // 2. Determine Qualitative Domain Evidence State
  let domainState: QualitativeEvidenceState = 'insufficient_evidence';
  if (contradictingEvidence.length === 0 && supportingEvidence.length >= 3) {
    domainState = 'strongly_supported';
  } else if (supportingEvidence.length >= 2 && contradictingEvidence.length <= 1) {
    domainState = 'supported';
  } else if (supportingEvidence.length > 0 && contradictingEvidence.length > 0) {
    domainState = 'mixed';
  } else if (contradictingEvidence.length >= 2) {
    domainState = 'contradicted';
  } else if (supportingEvidence.length >= 1) {
    domainState = 'weakly_supported';
  }

  // 3. Classical Progeny Tensions & Shastric Resolutions
  const tensions: ProgenyTension[] = [];

  // Tension 1: D1 Favorable vs D7 Afflicted
  if (isD1Fortified && (d7Confirmation.vargaConfirmationStatus === 'mixed_friction' || d7Confirmation.vargaConfirmationStatus === 'severely_afflicted')) {
    tensions.push({
      factorA: `D1 5th Lord (${fifthLord.name}) is strong in H${fifthLord.house} (${fifthLord.dignity})`,
      factorB: `D7 Saptāṃśa places D1 5th lord in H${d7Confirmation.d1FifthLordPlacementInD7.houseInD7} (${d7Confirmation.d1FifthLordPlacementInD7.dignityInD7})`,
      tensionDescription: 'The external biological promise in Rāśi is prominent, but the subtle harmonic vehicle (Saptāṃśa) shows friction or vulnerability in pregnancy or child-rearing ease.',
      shastricResolution: 'Sarvārtha Cintāmaṇi (5.38) instructs that when D1 is strong but D7 is distressed, children are born but require mindful medical care during infancy and intentional spiritual protection.',
    });
  }

  // Tension 2: Barren Sign in 5th vs Fortified Putreśa / Jupiter
  if (fifthHouse.fertilityType === 'barren' && (isD1Fortified || jupiterAssessment.dignity === 'exalted' || jupiterAssessment.dignity === 'own')) {
    tensions.push({
      factorA: `5th house falls in a classical barren (Vandhyā) sign (${fifthHouse.rashiName})`,
      factorB: `Putreśa (${fifthLord.name}) or Jupiter is highly dignified and protective`,
      tensionDescription: 'The environmental sign archetype suggests scarcity or delay, while the personal planetary ruler supplies vital nourishment.',
      shastricResolution: 'Phaladīpikā (12.7) clarifies that a barren sign restricts volume but not quality; the native is blessed with a singular, highly accomplished, and deeply cherished child (*Eka-Putra Yoga*).',
    });
  }

  // Tension 3: Saturn Delay (Vilamba) vs Natural Maternal/Paternal Urge
  if (delayVsDenial.delayingFactors.some((f) => f.includes('Saturn') || f.includes('Retrograde'))) {
    tensions.push({
      factorA: 'Saturn or retrogression decelerates progeny realization toward chronological maturity',
      factorB: 'Biological or social timing expectations seek earlier conception',
      tensionDescription: 'A classic tension between societal impatience and Saturn’s deliberate maturation cycle.',
      shastricResolution: 'Sārāvalī (34.26) emphasizes that Saturn’s touch on Putrasthāna yields enduring, stable, and deeply grounded children when conceived after Saturn’s natural maturation period.',
    });
  }

  // Tension 4: Karmic Śāpa vs Divine Jupiterian Bhaṅga
  const dissolvedShapa = shapas.find((s) => s.hasBhanga);
  if (dissolvedShapa) {
    tensions.push({
      factorA: `Classical curse indication formed: ${dissolvedShapa.shapaType}`,
      factorB: `Divine Shastric Bhaṅga: ${dissolvedShapa.bhangaReason || 'Jupiter provides counteracting grace'}`,
      tensionDescription: 'An ancestral or past-life karmic knot meets divine counter-grace, creating temporary anxiety followed by relief.',
      shastricResolution: 'BPHS Ch. 13 affirms that when Jupiter presides in a Kendra or casts its sacred dṛṣṭi upon the 5th house, all malevolent curses lose their destructive power, resolving into spiritual awakening.',
    });
  }

  // 4. Unresolved Uncertainties (honoring epistemological limits)
  const unresolvedUncertainties: string[] = [
    'Procreative fruition requires cross-referencing both partners’ horoscopes (Bīja Sphuṭa in male chart with Kṣetra Sphuṭa in female chart) for complete dyadic assessment.',
    'Child count formulas from medieval manuscripts reflect historical infant survival rates; modern Jyotiṣa interprets these as vitality potentials rather than fixed demographic headcounts.',
  ];

  return {
    domainState,
    progenyPromise,
    supportingEvidence,
    contradictingEvidence,
    tensions,
    unresolvedUncertainties,
  };
}

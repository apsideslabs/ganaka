/**
 * Gaṇaka — Domain 6: Marriage, Spouse & Sacred Partnership Types (Phase 6)
 * 
 * Strict data types for:
 * - Multi-factor Marriage Promise & Covenant Quality evaluation
 * - Spouse Character, Temperament & Archetype (7th occupants, 7th lord, D9, DK)
 * - Delay vs Denial distinction (Manda-kṛta Vivāha Vilamba)
 * - Kuja Doṣa (Bhauma Doṣa) formation, shastric cancellations & mitigations
 * - Navāṃśa (D9) confirmation & D1–D9 synthesis
 * - Jaimini Upapada Lagna (UL), 2nd from UL & Dārakāraka (DK) layer
 * - Authentic Vimshottari Daśā Timing & Activation (no invented calendar dates)
 * - Pāpakartarī, Besiegement & Relational Friction dynamics
 * - Qualitative Evidence States (no arbitrary numbers or percentage scores)
 * - Explicit Contradictions & Marriage Tensions
 */

import { PlanetId, RashiNumber } from '../../../types';
import {
  EvaluatedCondition,
  PredictionEvidence,
  RuleEvaluationResult,
  DomainPredictionResult,
  QualitativeEvidenceState,
} from '../../types';

export type MarriagePromiseCategory =
  | 'covenant_enduring_and_harmonious'
  | 'auspicious_union_with_growth'
  | 'stable_partnership_through_effort'
  | 'relational_friction_requiring_adaptation'
  | 'prolonged_delay_or_mature_union'
  | 'complex_karmic_covenant'
  | 'uncommitted_or_denied_unless_counteracted';

export type SpousalTemperamentArchetype =
  | 'dharmic_philosophical_magnanimous' // Guru
  | 'refined_aesthetic_affectionate'    // Śukra
  | 'intellectual_articulate_youthful'   // Budha
  | 'gentle_nurturing_empathic'          // Chandra
  | 'dignified_authoritative_commanding' // Sūrya
  | 'dynamic_passionate_independent'     // Maṅgala
  | 'mature_austere_disciplined_practical' // Śani
  | 'unconventional_cross_cultural_ambitious' // Rāhu
  | 'spiritual_detached_contemplative';   // Ketu

export interface SpousalProfile {
  primaryArchetype: SpousalTemperamentArchetype;
  archetypeTitle: string;
  sanskritName: string;
  confidence: 'high' | 'moderate' | 'low';
  signifyingGrahas: PlanetId[];
  temperamentDescription: string;
  moralAndCulturalDispositions: string[];
  partnershipContribution: string;
  potentialGrowthAreas: string[];
}

export type TimingCategory =
  | 'early_union_supported'
  | 'timely_chronological_window'
  | 'delayed_saturnine_maturity'
  | 'prolonged_discernment'
  | 'dormant_current_dasha';

export interface KujaDoshaAnalysis {
  isFormed: boolean;
  marsPlacementHouse: number;
  referenceLagnasChecked: {
    fromLagna: boolean;
    fromMoon: boolean;
    fromVenus: boolean;
  };
  cancellationFactors: string[];
  isFullyCancelled: boolean;
  isMitigated: boolean;
  severityGrade: 'none' | 'mild_mitigated' | 'moderate' | 'intense_unmitigated';
  shastricVerdict: string;
}

export interface D9NavamshaConfirmation {
  d9LagnaRashi: string;
  d9LagnaLord: string;
  d9SeventhRashi: string;
  d9SeventhLord: string;
  d9SeventhOccupants: string[];
  d1SeventhLordInD9: {
    rashi: string;
    houseFromD9Lagna: number;
    dignityInD9: string;
    isVargottama: boolean;
    isPushkara: boolean;
  };
  venusD9Placement: {
    rashi: string;
    houseFromD9Lagna: number;
    dignityInD9: string;
  };
  vargaConfirmationStatus:
    | 'powerfully_reinforced'
    | 'moderately_supported'
    | 'realigned_to_different_focus'
    | 'varga_friction_indicated'
    | 'spiritual_sublimation'
    | 'neutral_or_unverified';
  shastricNote: string;
}

export interface JaiminiMarriageFactors {
  upapadaLagnaRashi: string;
  upapadaLagnaHouse: number;
  secondFromULRashi: string;
  secondFromULOccupants: string[];
  secondFromULBeneficAspects: string[];
  secondFromULMaleficAspects: string[];
  ulStabilityEvaluation: 'fortified_and_enduring' | 'harmonious_with_compromise' | 'fragile_demanding_mindfulness';
  darakarakaGraha: {
    id: PlanetId;
    name: string;
    degrees: number;
    rashi: string;
    house: number;
  };
  arudhaLagnaVsDaraPada: {
    alRashi: string;
    a7Rashi: string;
    mutualRelationship: 'kendra_trikona' | 'shadashtaka_6_8' | 'dvidvadasha_2_12' | 'tritiya_ekadasha_3_11' | 'samaptaka_1_7';
    harmonyIndication: string;
  };
  jaiminiSynthesis: string;
}

export interface MarriageTimingArc {
  activeMahadashaAssessment: string;
  activeAntardashaAssessment: string;
  isMarriageDashaActive: boolean;
  timingCategory: TimingCategory;
  activationRationale: string;
  prospectiveActivationGrahas: string[];
  timingEpistemologicalCaveat: string;
}

export interface MarriageTension {
  factorA: string;
  factorB: string;
  tensionDescription: string;
  shastricResolution: string;
}

export interface MarriageObstacle {
  obstacleType: string;
  planetaryRoot: string;
  manifestation: string;
  shastricMitigation: string | null;
}

export interface MarriageDomainResult extends DomainPredictionResult {
  qualitativeState: QualitativeEvidenceState;
  marriagePromise: MarriagePromiseCategory;
  spousalProfile: SpousalProfile;
  kujaDosha: KujaDoshaAnalysis;
  d9NavamshaConfirmation: D9NavamshaConfirmation;
  jaiminiFactors: JaiminiMarriageFactors;
  delayVsDenial: {
    isDelayed: boolean;
    delayingFactors: string[];
    mitigatingFactors: string[];
    classicalVerdict: string;
  };
  timingArc: MarriageTimingArc;
  obstacles: MarriageObstacle[];
  marriageTensions: MarriageTension[];
  unresolvedUncertainties: string[];
}

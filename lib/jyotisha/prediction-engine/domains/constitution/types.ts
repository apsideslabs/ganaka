/**
 * Gaṇaka — Domain 1: Constitution, Mind & Physical Appearance Types (Phase 2)
 * 
 * Strict data types for:
 * - Multi-factor Constitution & Stamina evaluation
 * - Moon (Manas) & Cognitive Temperament evaluation
 * - Physical Appearance & Skeletal Architecture synthesis (D1 + D9)
 * - Non-deterministic Classical Mark vectors (scars/moles/birthmarks)
 * - Qualitative Evidence States (no arbitrary numbers or percentages)
 * - Explicit Contradiction & Tension mapping
 */

import { PlanetId, RashiNumber } from '../../../types';
import {
  EvaluatedCondition,
  PredictionEvidence,
  RuleEvaluationResult,
  DomainPredictionResult,
  QualitativeEvidenceState,
} from '../../types';

export type MarkIndicationStatus =
  | 'indication_present'
  | 'strengthened'
  | 'weakened'
  | 'convergent'
  | 'insufficient_evidence';

export interface ConstitutionalTension {
  factorA: string;
  factorB: string;
  tensionDescription: string;
  shastricResolution: string;
}

export interface ClassicalMarkIndication {
  graha: PlanetId;
  grahaName: string;
  anatomicalZone: string;
  indicationType: 'Potential Scar/Cut (Vraṇa)' | 'Potential Dark Mark/Mole (Tilaka)' | 'Potential Pigmentation/Birthmark (Lāñchana)' | 'Potential Subtle Mark (Kṣata)';
  status: MarkIndicationStatus;
  classicalBasis: string;
  activeVectors: string[];
  mitigatingFactors: string[];
  synthesizedInterpretation: string;
  uncertaintyDisclaimer: string;
}

export interface PhysicalAppearanceDetails {
  statureCategory: string;
  buildType: string;
  boneStructure: string;
  facialArchitecture: string;
  gazeAndExpression: string;
  d1FoundationalInfluence: string;
  d9NavamshaMaturationInfluence: string;
  secondHouseMukhaInfluence: string;
}

export interface MentalDispositionDetails {
  state: QualitativeEvidenceState;
  manasCondition: string; // Moon state
  buddhiCondition: string; // 5th House / Mercury state
  emotionalResilience: string;
  cognitiveStrengths: string[];
  stressVulnerabilities: string[];
  keyShastricFactors: string[];
}

export interface QualitativeDoshaProfile {
  dominantElementalTendency: 'Agni (Fiery / Metabolic)' | 'Vāyu (Airy / Nervous-Agile)' | 'Pṛthvī (Earthy / Dense-Stable)' | 'Jala (Watery / Luminous-Moist)' | 'Sama (Balanced Tridoṣa)';
  shastricArchetype: 'Pitta-predominant' | 'Vāta-predominant' | 'Kapha-predominant' | 'Vāta-Pitta' | 'Pitta-Kapha' | 'Vāta-Kapha' | 'Tridoṣaja (Balanced)';
  metabolicSignature: string;
  physicalStaminaSummary: string;
  epistemologicalNotice: string; // Explicit disclaimer: traditional Jyotisha archetype, not clinical diagnostic
}

export interface LifeCycleMaturationArc {
  foundationalPhaseDescription: string; // Childhood / adolescence through D1
  adultMaturationDescription: string;  // Adult crystallization through D9 & planetary maturities
  preservationPhaseDescription: string; // Elder resilience governed by Lagneśa, 8th lord, SAV
}

export interface ConstitutionDomainResult extends DomainPredictionResult {
  qualitativeState: QualitativeEvidenceState;
  physicalStaminaState: QualitativeEvidenceState;
  mentalDispositionState: QualitativeEvidenceState;
  appearanceDetails: PhysicalAppearanceDetails;
  mentalDetails: MentalDispositionDetails;
  elementalProfile: QualitativeDoshaProfile;
  maturationArc: LifeCycleMaturationArc;
  classicalMarkIndications: ClassicalMarkIndication[];
  constitutionalTensions: ConstitutionalTension[];
  unresolvedUncertainties: string[];
}

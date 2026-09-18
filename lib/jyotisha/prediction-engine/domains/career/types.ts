/**
 * Gaṇaka — Domain 3: Career, Vocation & Karma Types (Phase 3)
 * 
 * Strict data types for:
 * - Multi-factor Career Strength & Authority evaluation
 * - Professional Field / Vocational Archetype determination
 * - Employment vs Independent Business (6th vs 7th vs 10th)
 * - Career Stability vs Volatility & Pivots (SAV, Nodal contact)
 * - D10 Daśāṃśa Varga confirmation
 * - Professional Environment & Advancement dynamics
 * - Genuine Vimshottari Daśā Timing & Activation (no fabricated ages)
 * - Qualitative Evidence States (no arbitrary numbers or percentage scores)
 * - Explicit Contradiction & Career Tension mapping
 */

import { PlanetId } from '../../../types';
import {
  EvaluatedCondition,
  PredictionEvidence,
  RuleEvaluationResult,
  DomainPredictionResult,
  QualitativeEvidenceState,
} from '../../types';

export type CareerStrengthCategory =
  | 'commanding_authority'
  | 'fortified_executive'
  | 'stable_progressive'
  | 'moderate_service'
  | 'vulnerable_or_unsettled'
  | 'constrained_karmic_friction';

export type AuthorityLevel =
  | 'sovereign_executive'
  | 'institutional_leadership'
  | 'autonomous_professional'
  | 'specialized_consultant'
  | 'operational_team_lead'
  | 'salaried_service_contributor'
  | 'subordinate_support';

export type WorkModeType =
  | 'independent_enterprise_dominant'
  | 'independent_practice_or_consultancy'
  | 'salaried_corporate_or_institutional'
  | 'public_sector_or_civil_service'
  | 'hybrid_or_transitional'
  | 'undifferentiated';

export interface ProfessionalFieldArchetype {
  fieldId: string;
  title: string;
  sanskritName: string;
  confidence: 'high' | 'moderate' | 'low';
  primaryPlanets: PlanetId[];
  connectingHouses: number[];
  rationale: string;
  subSpecializations: string[];
}

export interface WorkModeOrientation {
  mode: WorkModeType;
  title: string;
  sixthHouseWeight: 'dominant' | 'balanced' | 'recessive';
  seventhHouseWeight: 'dominant' | 'balanced' | 'recessive';
  tenthHouseAutonomy: 'high' | 'moderate' | 'low';
  rationale: string;
}

export interface StabilityProfile {
  category: 'highly_stable_and_enduring' | 'progressive_growth_through_effort' | 'periodic_pivots_and_transformations' | 'high_volatility_or_unsettled';
  title: string;
  savEvaluation: string;
  nodalInfluence: boolean;
  retrogressionEffect: string | null;
  volatilityFactors: string[];
  stabilizingFactors: string[];
  rationale: string;
}

export interface WorkplaceEnvironment {
  settingType: string;
  culturalAttributes: string[];
  institutionalScale: string;
  environmentalRationale: string;
}

export interface AdvancementVector {
  primaryDrivers: string[];
  rajaYogasActive: string[];
  dhanaYogasActive: string[];
  upachayaProgression: string;
  synthesis: string;
}

export interface ProfessionalObstacle {
  obstacleType: string;
  planetaryRoot: string;
  manifestation: string;
  shastricMitigation: string | null;
}

export interface CareerTimingArc {
  activeMahadashaAssessment: string;
  activeAntardashaAssessment: string;
  isCareerDashaActive: boolean;
  dashaActivationType: 'prime_consolidation' | 'moderate_advancement' | 'routine_maintenance' | 'transitional_friction' | 'unrelated_focus';
  prospectiveTriggers: string[];
  timingEpistemologicalCaveat: string;
}

export interface D10ConfirmationDetails {
  d10LagnaRashi: string;
  d10LagnaLord: string;
  d10TenthHouseOccupants: string[];
  d10TenthLord: string;
  d10D1LordPlacement: string;
  vargaConfirmationStatus: 'powerfully_reinforced' | 'moderately_supported' | 'realigned_to_different_focus' | 'varga_friction_indicated' | 'neutral_or_unverified';
  shastricNote: string;
}

export interface CareerTension {
  factorA: string;
  factorB: string;
  tensionDescription: string;
  shastricResolution: string;
}

export interface CareerDomainResult extends DomainPredictionResult {
  qualitativeState: QualitativeEvidenceState;
  careerStrength: CareerStrengthCategory;
  primaryArchetype: ProfessionalFieldArchetype;
  secondaryArchetypes: ProfessionalFieldArchetype[];
  authorityLevel: AuthorityLevel;
  authorityNarrative: string;
  workMode: WorkModeOrientation;
  stability: StabilityProfile;
  workplaceEnvironment: WorkplaceEnvironment;
  advancement: AdvancementVector;
  obstacles: ProfessionalObstacle[];
  timingArc: CareerTimingArc;
  d10Details: D10ConfirmationDetails;
  careerTensions: CareerTension[];
  unresolvedUncertainties: string[];
}

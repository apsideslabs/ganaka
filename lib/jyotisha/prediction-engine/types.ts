/**
 * Gaṇaka — Core Prediction Engine Types (Phase 1)
 * 
 * Strict deterministic data types for:
 * - Centralized PredictionContext
 * - Five-state Condition evaluation (satisfied, partially_supported, contradicted, absent, insufficient_evidence)
 * - Structured Evidence with polarity and shastric rationale
 * - Deterministic Rule evaluation pipeline
 * - Chart-dependent Domain prediction results
 */

import { PlanetId, RashiNumber } from '../types';

export type ConditionStatus =
  | 'satisfied'            // Factually and classical criteria fully met in chart data
  | 'partially_supported'  // Partial alignment exists, but strength threshold or secondary factors incomplete
  | 'contradicted'        // Active defeating factors (e.g. Dusthāna, combust, uncancelled debilitation, malefic affliction)
  | 'absent'              // Factor simply does not exist in chart (e.g. no planet in house, no specific yoga)
  | 'insufficient_evidence'; // Data is mixed, neutral, or insufficient to assert a definitive shastric consequence

export type QualitativeEvidenceState =
  | 'strongly_supported'
  | 'supported'
  | 'mixed'
  | 'weakly_supported'
  | 'contradicted'
  | 'insufficient_evidence';

export type EvidencePolarity = 'supporting' | 'counteracting' | 'neutral';

export type EvidenceWeight = 'decisive' | 'strong' | 'moderate' | 'minor';

export interface PredictionEvidence {
  parameter: string;         // e.g. 'lagnesha_placement', 'sav_vitality', '10th_house_occupancy'
  observedFact: string;      // e.g. 'Mars exalted in House 10 in Capricorn (1.35x Shadbala)'
  shastricRationale: string; // Explains why this astronomical fact leads to this evaluation
  polarity: EvidencePolarity;
  weight: EvidenceWeight;
}

export interface EvaluatedCondition {
  id: string;
  name: string;
  parameter: string;
  expected: string;
  observed: string;
  status: ConditionStatus;
  rationale: string;
  weight: 'mandatory' | 'qualifying' | 'counteracting';
}

export interface RuleCitation {
  sourceText: string;
  chapterAndVerse: string;
  sanskritShloka?: string;
  englishTranslation?: string;
}

export interface ClassicalRuleDefinition {
  ruleId: string;
  ruleName: string;
  sourceText: string;
  chapterAndVerse: string;
  sanskritShloka: string;
  englishTranslation: string;
}

export interface RuleEvaluationResult {
  ruleId: string;
  ruleTitle: string;
  citation: RuleCitation;
  status: ConditionStatus;
  isTriggered: boolean;
  conditionsEvaluated: EvaluatedCondition[];
  evidence: PredictionEvidence[];
  contradictions: string[];
  shastricVerdict: string;
  confidence: 'high' | 'moderate' | 'low' | 'none';
}

export type DomainPredictionStatus =
  | 'verified_prediction'      // One or more classical rules triggered with affirmative evidence
  | 'partially_supported'     // Partial evidence without fatal contradiction; moderate confidence
  | 'contradicted_indication'  // Classical positive rules contradicted by active afflictions/dusthana
  | 'insufficient_evidence';  // No affirmative or definitive shastric conditions met

export interface DomainPredictionResult {
  domainId: string;
  domainNumber: number;
  canonicalTitle: string;
  sanskritTitle: string;
  governingHouses: number[];
  status: DomainPredictionStatus;
  primaryLord: {
    id: PlanetId;
    name: string;
    rashi: string;
    house: number;
    dignity: string;
    isRetrograde: boolean;
    isCombust: boolean;
  };
  naturalKaraka: {
    id: PlanetId;
    name: string;
    shadbalaRatio: number;
    house: number;
    dignity: string;
  };
  houseSAVBindus: Record<number, {
    bindus: number;
    evaluation: 'high' | 'adequate' | 'deficient' | 'critical';
    isFavorable: boolean;
  }>;
  evaluatedConditions: EvaluatedCondition[];
  triggeredRules: RuleEvaluationResult[];
  untriggeredRules: RuleEvaluationResult[];
  supportingEvidence: PredictionEvidence[];
  contradictingEvidence: PredictionEvidence[];
  finalVerdict: string;
  synthesisNarrative: string;
  caveatsAndAbsences: string[];
}

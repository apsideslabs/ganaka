/**
 * Gaṇaka — Classical Dosha & Ariṣṭa Types & Interfaces
 * Phase 1: Canonical Database & Verification Schema
 */

import { PlanetId, RashiNumber } from '../jyotisha/types';

export type ClassicalStatus =
  | 'Directly Classical'       // Explicitly named and defined in primary canonical treatises (BPHS, BJ, Sārāvalī, Phaladīpikā, JP, etc.)
  | 'Later Classical'          // Defined in medieval/post-classical authoritative treatises (Uttara Kālāmṛta, Muhūrta Cintāmaṇi, etc.)
  | 'Regional / Traditional'   // Documented in recognized regional oral or regional śāstras (Kerala Prasna Marga, Jātaka Candrikā, South Indian tradition)
  | 'Modern / Contested';      // Popularized in 19th/20th century vernacular tradition with ambiguous or absent classical Sanskrit citations

export type DoshaCategory =
  | 'Graha Afflictions'
  | 'Ariṣṭa & Bālarishta'
  | 'Gandānta & Birth Defects'
  | 'Pañcāṅga & Tithi Afflictions'
  | 'Śāpa Classifications (BPHS Ch. 83)'
  | 'Progeny & Santāna Afflictions'
  | 'Marriage & Relationship Afflictions'
  | 'Contested & Vernacular Traditions';

export type DoshaSeverity = 'High' | 'Medium' | 'Low' | 'Mitigated' | 'Cancelled';

export type DoshaFormationStatus = 'Formed' | 'Cancelled' | 'Mitigated' | 'Not Formed' | 'Partially / Conditionally Formed';

export type RemedyClassification =
  | 'Direct textual remedy'
  | 'Later classical/traditional remedy'
  | 'Regional/traditional practice'
  | 'Modern practice';

export interface VerifiedClassicalRemedy {
  id: string;
  doshaId: string;
  title: string;
  sanskritTitle: string;
  transliteration?: string;
  purpose: string;
  traditionalMethod: string;
  sourceText: string;
  chapterAndVerse?: string;
  classification: RemedyClassification;
  qualifications?: {
    timing?: string;
    deity?: string;
    mantraOrJapa?: string;
    ritualOfferings?: string;
    fastingOrVrata?: string;
    restrictionsOrEligibility?: string;
  };
  provenanceNotes?: string;
}

export interface EvaluatedCondition {
  conditionLabel: string;
  isMet: boolean;
  chartFactor: string;
}

export interface ClassicalSourceReference {
  text: string;
  sanskritTextName: string;
  chapter: string;
  verseOrShloka: string;
  editionOrProvenance?: string;
  sanskritShloka?: string;
  sanskritTerminology?: string;
  supportingSources?: string[];
}

export interface DoshaVariantRule {
  traditionName: string; // e.g. "Bṛhat Parāśara / Standard North Indian", "South Indian (Andhra/Tamil)", "Kerala Tradition"
  sourceText: string;
  chapterAndVerse: string;
  description: string;
  conditionFormula: string;
}

export interface DoshaCancellationRule {
  id: string;
  title: string;
  sanskritTitle?: string;
  sourceText: string;
  chapterAndVerse: string;
  sanskritShloka?: string;
  description: string;
  conditionMetDescription: string;
}

export interface DoshaDefinition {
  id: string;
  name: string;
  sanskritName: string;
  transliteration: string;
  alternateNames?: string[];
  category: DoshaCategory;
  subcategory: string;
  classicalStatus: ClassicalStatus;
  primarySource: ClassicalSourceReference;
  variants?: DoshaVariantRule[];
  cancellationRules?: DoshaCancellationRule[];
  definition: string;
  classicalEffects: string;
  provenanceNotes?: string;
  evaluate: (ctx: DoshaEvaluationContext) => DoshaEvaluationResult;
}

export interface DoshaEvaluationContext {
  chart: import('../jyotisha/types').JyotishaChart;
  lagnaRashi: RashiNumber;
  lagnaDegree: number;
  planets: Record<PlanetId, import('../jyotisha/types').CalculatedPlanet>;
  bhavas: import('../jyotisha/types').BhavaCusp[];
  panchanga: import('../jyotisha/types').PanchangaResult;
  vargas?: Record<string, import('../jyotisha/types').VargaChart>;
  specialPoints?: import('../jyotisha/types').SpecialPoints;
  // User configurable variant preferences (e.g. include 2nd house for Kuja Dosha)
  config?: {
    include2ndHouseKujaDosha?: boolean;
    includeSouthIndianKujaVariants?: boolean;
  };
}

export interface DoshaEvaluationResult {
  isPresent: boolean;
  formationStatus: DoshaFormationStatus;
  severity: DoshaSeverity;
  evaluatedConditions?: EvaluatedCondition[];
  conditionsMet: string[];
  exceptionsApplied: string[];
  formationReason?: string;
  relevantFactors?: {
    planets?: string[];
    houses?: number[];
    rashis?: string[];
    nakshatras?: string[];
    lordships?: string[];
  };
  involvedPlanets: PlanetId[];
  involvedHouses?: number[];
  involvedRashis?: RashiNumber[];
  involvedNakshatras?: string[];
  appliedVariant?: string;
  classicalNotes?: string;
}

export interface EvaluatedDosha {
  id: string;
  name: string;
  sanskritName: string;
  transliteration: string;
  alternateNames?: string[];
  category: DoshaCategory;
  subcategory: string;
  classicalStatus: ClassicalStatus;
  primarySource: ClassicalSourceReference;
  variants?: DoshaVariantRule[];
  formationStatus: DoshaFormationStatus;
  severity: DoshaSeverity;
  evaluatedConditions: EvaluatedCondition[];
  conditionsMet: string[];
  exceptionsApplied: string[];
  formationReason: string;
  relevantFactors: {
    planets: string[];
    houses: number[];
    rashis: string[];
    nakshatras: string[];
    lordships?: string[];
  };
  involvedPlanets: PlanetId[];
  involvedHouses: number[];
  involvedRashis: RashiNumber[];
  involvedNakshatras: string[];
  definition: string;
  classicalEffects: string;
  provenanceNotes?: string;
  appliedVariant?: string;
  classicalNotes?: string;
  remedies: VerifiedClassicalRemedy[];
}

export interface DoshaSummaryReport {
  totalEvaluated: number;
  formedCount: number;
  cancelledCount: number;
  mitigatedCount: number;
  notFormedCount: number;
  byCategory: Record<DoshaCategory, {
    total: number;
    formed: number;
    cancelled: number;
    mitigated: number;
  }>;
  byStatus: Record<ClassicalStatus, {
    total: number;
    formed: number;
  }>;
  evaluatedDoshas: EvaluatedDosha[];
}

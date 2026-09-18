/**
 * Gaṇaka — Domain 7: Children & Progeny (Santāna / Putra) Types
 * Standardized data models for classical progeny, lineage, and child analysis.
 */

import { PlanetId, RashiNumber } from '../../../types';
import {
  DomainPredictionResult,
  QualitativeEvidenceState,
  ConditionStatus,
  EvaluatedCondition,
} from '../../types';

export interface ClassicalConditionAudit {
  conditionId: string;
  sanskritTerm: string;
  status: ConditionStatus;
  observations: string[];
  shastricReference: string;
}

export type ProgenyPromise =
  | 'abundant_progeny'      // Bahu-Putra Yoga (multiple thriving children)
  | 'assured_healthy'       // Santāna Yoga (timely, virtuous progeny)
  | 'delayed_realization'   // Vilamba Santāna (mature / delayed timing via Saturn/Dusthana)
  | 'limited_progeny'       // Alpa-Putra (one or two children, focused lineage)
  | 'fraught_with_obstacles'// Santāna Pratibandha (karmic afflictions requiring śānti)
  | 'unconventional_lineage'// Dattaka / adoption / spiritual lineage (Ketu/Mercury/Saturn combinations)
  | 'severely_obstructed';  // Classical Anapatya patterns with evaluation of bhaṅga

export type SignFertilityType = 'fertile' | 'semi_fertile' | 'barren';

export interface FifthHouseAssessment {
  houseNumber: 5;
  rashiNumber: RashiNumber;
  rashiName: string;
  signLord: PlanetId;
  fertilityType: SignFertilityType;
  occupants: Array<{
    id: PlanetId;
    name: string;
    isNaturalBenefic: boolean;
    dignity: string;
    isRetrograde: boolean;
    isCombust: boolean;
  }>;
  aspectingPlanets: Array<{
    id: PlanetId;
    name: string;
    isNaturalBenefic: boolean;
    dignity: string;
  }>;
  savBindus: number;
  savEvaluation: 'strong_abundance' | 'adequate' | 'deficient';
  shastricVerdict: string;
}

export interface FifthLordAssessment {
  planetId: PlanetId;
  name: string;
  rashiNumber: RashiNumber;
  rashiName: string;
  house: number;
  dignity: string;
  isRetrograde: boolean;
  isCombust: boolean;
  shadbalaRatio: number;
  placedInKendraOrKona: boolean;
  placedInDusthana: boolean;
  sambandhaWithJupiter: boolean;
  sambandhaWithLagnesha: boolean;
  shastricVerdict: string;
}

export interface NaturalKarakaJupiterAssessment {
  planetId: 'jupiter';
  name: string;
  rashiNumber: RashiNumber;
  rashiName: string;
  house: number;
  dignity: string;
  isRetrograde: boolean;
  isCombust: boolean;
  shadbalaRatio: number;
  karakoBhavaNashayaFormed: boolean;
  bavBindusInFifthFromJupiter: number;
  shastricVerdict: string;
}

export interface MultiLagnaTriangulation {
  fifthFromLagnaRashi: RashiNumber;
  fifthFromLagnaOccupants: string[];
  fifthFromLagnaBeneficScore: number;
  fifthFromMoonRashi: RashiNumber;
  fifthFromMoonOccupants: string[];
  fifthFromMoonBeneficScore: number;
  fifthFromJupiterRashi: RashiNumber;
  fifthFromJupiterOccupants: string[];
  fifthFromJupiterBeneficScore: number;
  ninthHouseBhavatBhavamRashi: RashiNumber;
  ninthHouseLord: PlanetId;
  ninthHouseBeneficScore: number;
  synthesis: string;
}

export interface D7SaptamshaConfirmation {
  d7LagnaRashi: RashiNumber;
  d7LagnaLord: PlanetId;
  d7FifthRashi: RashiNumber;
  d7FifthLord: PlanetId;
  d7FifthHouseOccupants: string[];
  d7JupiterHouse: number;
  d7JupiterDignity: string;
  d1FifthLordPlacementInD7: {
    rashiNumber: RashiNumber;
    houseInD7: number;
    isKendraOrKona: boolean;
    isDusthana: boolean;
    dignityInD7: string;
  };
  isFifthLordSaptamshaVargottama: boolean;
  vargaConfirmationStatus: 'strongly_reinforced' | 'harmonious' | 'mixed_friction' | 'severely_afflicted';
  shastricNote: string;
}

export interface SpecializedSphutasProgeny {
  beejaSphuta?: {
    longitude: number;
    rashiNumber: RashiNumber;
    rashiName: string;
    isOddRashi: boolean;
    navamshaRashiNumber: RashiNumber;
    isOddNavamsha: boolean;
    status: 'Sampūrṇa Bīja (Fully Fertile)' | 'Miśra (Mixed)' | 'Afflicted (Remedies Indicated)';
    shastricVerdict: string;
  };
  kshetraSphuta?: {
    longitude: number;
    rashiNumber: RashiNumber;
    rashiName: string;
    isEvenRashi: boolean;
    navamshaRashiNumber: RashiNumber;
    isEvenNavamsha: boolean;
    status: 'Sampūrṇa Kṣetra (Fully Receptive)' | 'Miśra (Mixed)' | 'Afflicted (Remedies Indicated)';
    shastricVerdict: string;
  };
  santanaTithi?: {
    tithiNumber: number;
    tithiName: string;
    paksha: 'Shukla' | 'Krishna';
    isAuspicious: boolean;
    isChidraOrRikta: boolean;
    shastricVerdict: string;
  };
}

export interface JaiminiProgenyFactors {
  putrakarakaGraha: {
    id: PlanetId;
    name: string;
    rashi: string;
    house: number;
    dignity: string;
  };
  karakamshaRashi: RashiNumber;
  fifthFromKarakamshaRashi: RashiNumber;
  planetsInOrAspectingFifthFromKL: string[];
  putrapadaA5: {
    rashiNumber: RashiNumber;
    rashiName: string;
    houseFromLagna: number;
    isDusthanaFromAL: boolean;
  };
  jaiminiProgenyVerdict: string;
}

export interface ProgenyObstacleOrShapa {
  shapaType:
    | 'Sarpa Śāpa (Rahu/Mars curse)'
    | 'Pitṛ Śāpa (Ancestral affliction via Sun)'
    | 'Mātṛ Śāpa (Matrilineal affliction via Moon)'
    | 'Brāhmaṇa / Guru Śāpa (Preceptor affliction via Jupiter)'
    | 'Bhrātṛ Śāpa (Fraternal affliction via Mars)'
    | 'Kārako Bhāva Nāśāya (Isolated Jupiter in 5th)'
    | 'Kṣīṇa Putrasthāna (Dusthāna / Combustion affliction)';
  sourceText: string;
  shastricReference: string;
  diagnosticSymptoms: string;
  hasBhanga: boolean;
  bhangaReason?: string;
  classicalRemedy: string;
}

export interface DelayVsDenialProgeny {
  verdictType: 'timely_realization' | 'saturnine_delay' | 'karmic_impediment_with_bhanga' | 'deep_structural_denial';
  classicalTextSummary: string;
  delayingFactors: string[];
  mitigatingFactors: string[];
}

export interface ProgenyTimingArc {
  activeMahadasha: string;
  activeAntardasha: string;
  isMahadashaFavorable: boolean;
  isAntardashaFavorable: boolean;
  prospectiveActivationGrahas: string[];
  timingEpistemologicalNotice: string;
}

export interface ProgenyDomainResult extends DomainPredictionResult {
  qualitativeState: QualitativeEvidenceState;
  fifthHouse: FifthHouseAssessment;
  fifthLord: FifthLordAssessment;
  naturalKarakaJupiter: NaturalKarakaJupiterAssessment;
  triangulation: MultiLagnaTriangulation;
  d7Saptamsha: D7SaptamshaConfirmation;
  specializedSphutas: SpecializedSphutasProgeny;
  jaiminiProgeny: JaiminiProgenyFactors;
  progenyPromise: ProgenyPromise;
  delayVsDenial: DelayVsDenialProgeny;
  shapasAndObstacles: ProgenyObstacleOrShapa[];
  timingArc: ProgenyTimingArc;
  progenyTensions: Array<{
    factorA: string;
    factorB: string;
    tensionDescription: string;
    shastricResolution: string;
  }>;
  unresolvedUncertainties: string[];
  conditionsAudited: ClassicalConditionAudit[];
}

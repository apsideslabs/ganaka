/**
 * Gaṇaka — Extended Daśā Systems Type Definitions
 * 
 * Modular architectural specifications for:
 * 1. Aṣṭottarī Daśā (108-Year Cycle)
 * 2. Yoginī Daśā (36-Year Cycle)
 * 3. Kālacakra Daśā (Nakṣatra-Pāda / Rāśi Cycle)
 * 4. Jaiminī Cara Daśā (Rāśi)
 * 5. Jaiminī Nārāyaṇa Daśā (Rāśi)
 * 6. Jaiminī Śūla Daśā (Rāśi Ayur-Daśā)
 * 7. Jaiminī Dṛg Daśā (Rāśi Vision/Dharma Daśā)
 */

export type ExtendedDashaSystemId =
  | 'astottari'
  | 'yogini'
  | 'kalacakra'
  | 'chara'
  | 'narayana'
  | 'shula'
  | 'drg'
  | 'shodashottari'
  | 'dwadashottari'
  | 'panchottari'
  | 'shatabdika'
  | 'chaturashiti'
  | 'dwisaptati'
  | 'mandooka'
  | 'trikona'
  | 'sthira';

export type DashaClassification = 'nakshatra_planetary' | 'raasi_jaimini';

export type DashaEligibilityStatus = 'satisfied' | 'conditional' | 'universal' | 'not_satisfied';

export interface DashaEligibility {
  status: DashaEligibilityStatus;
  isSatisfied: boolean;
  conditionTitle: string;
  classicalRule: string;
  chartEvaluation: string;
  sanskritVerse?: string;
  scripturalSource: string;
}

export interface ExtendedDashaPeriod {
  id: string;
  level: 1 | 2;
  lordKey: string;
  name: string;
  sanskritName: string;
  devanagari: string;
  startDate: Date;
  endDate: Date;
  startDateStr: string;
  endDateStr: string;
  durationYears: number;
  durationDays: number;
  isBirthBalance?: boolean;
  subPeriods?: ExtendedDashaPeriod[];
  metadata?: {
    rashiNumber?: number;
    planetId?: string;
    dehaRashi?: number;
    jivaRashi?: number;
    gatiType?: 'standard' | 'manduka' | 'markati' | 'simhavalokana';
    coLordUsed?: string;
    strengthPoints?: number;
    note?: string;
  };
}

export interface CurrentPeriodSummary {
  majorPeriod: ExtendedDashaPeriod;
  subPeriod?: ExtendedDashaPeriod;
  startDate: Date;
  endDate: Date;
  durationYears: number;
  remainingYears: number;
  remainingMonths: number;
  remainingDays: number;
  progressPercentage: number;
}

export interface ExtendedDashaSystemDefinition {
  id: ExtendedDashaSystemId;
  name: string;
  sanskritName: string;
  devanagari: string;
  cycleYears: number;
  classification: DashaClassification;
  traditionalBasis: string;
  scripturalProvenance: string;
  description: string;
  chartRequirements: string[];
}

export interface ExtendedDashaCalculationResult {
  system: ExtendedDashaSystemDefinition;
  eligibility: DashaEligibility;
  selectedVariant: string;
  availableVariants: {
    id: string;
    name: string;
    description: string;
  }[];
  currentPeriod: CurrentPeriodSummary;
  periods: ExtendedDashaPeriod[];
  calculationDetails: {
    provenance: string;
    seedBasis: string;
    balanceFraction: number;
    balanceYears: number;
    steps: string[];
  };
}

export interface DashaComparisonRow {
  systemId: ExtendedDashaSystemId;
  systemName: string;
  sanskritName: string;
  classification: DashaClassification;
  cycleYears: number;
  currentMajorPeriod: string;
  currentSubPeriod: string;
  startDateStr: string;
  endDateStr: string;
  remainingStr: string;
  progressPercentage: number;
  eligibilityStatus: DashaEligibilityStatus;
  eligibilityTitle: string;
}

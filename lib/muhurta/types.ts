/**
 * Gaṇaka — Classical Muhūrta Engine Type Definitions
 * Source-traceable, deterministic electional astrology infrastructure.
 * Grounded in Muhūrta Cintāmaṇi, Kālāmṛta, Bṛhat Saṁhitā, and Sūrya Siddhānta.
 */

import { RashiNumber } from '@/lib/jyotisha/types';
import { PlanetId } from '@/lib/astronomy/ephemeris';

export type MuhurtaObjectiveId =
  | 'vivaha' // Marriage
  | 'griharambha' // House Foundation / Construction
  | 'grihapravesha' // House Warming / Ingress
  | 'vanijyarambha' // Business Commencement
  | 'kraya_vikraya' // Business Agreement / Contracts / Trade
  | 'sevarambha' // Employment / Office Joining
  | 'yatra' // Travel / Journey
  | 'vidyarambha' // Education / Aksharabhyasa / Upanayana
  | 'namakarana' // Child Naming Ceremony
  | 'bhumi_kraya' // Land / Real Estate Purchase
  | 'vahana_kraya' // Vehicle Purchase
  | 'chikitsarambha' // Medical Treatment Commencement
  | 'shalyakarma' // Surgery & Invasive Procedures
  | 'suvarna_ratna' // Wearing Gold & Gemstones
  | 'nutana_vastra'; // New Clothes & Luxury Adornments

export interface MahaDoshaAuditRecord {
  id: string;
  name: string;
  sanskritName: string;
  status: 'CLEARED' | 'AFFLICTED' | 'MITIGATED';
  detail: string;
  mitigationText?: string;
  citationText?: string;
}

/**
 * 4 Explicit Practical Classical Selection Tiers:
 * 1. STRONGLY_RECOMMENDED: All major applicable conditions are favorable or sufficiently supported.
 * 2. SUITABLE: The principal conditions required for the objective are satisfied, although minor non-critical imperfections may exist.
 * 3. CONDITIONAL: No severe prohibition applies, but the window contains weaker or mixed factors that must be explicitly disclosed.
 * 4. AVOID: A significant applicable classical prohibition or severe conflict exists.
 */
export type MuhurtaClassification =
  | 'STRONGLY_RECOMMENDED' // उत्तम — All major applicable conditions are favorable
  | 'SUITABLE'             // सम्मत — Principal conditions satisfied, minor non-critical imperfections
  | 'CONDITIONAL'          // सापवाद / मध्यम — Acceptable with classical exception or neutral factors disclosed
  | 'AVOID';               // वर्ज्य / अविहित — Major prohibition or severe conflict

/**
 * Backward-compatible Shastric Status
 */
export type MuhurtaStatus =
  | 'QUALIFIED' // All primary, secondary and Lagna conditions MET, no unmitigated prohibitions
  | 'QUALIFIED_WITH_CONDITIONS' // Blemish present but mitigated by an authentic classical Apavāda (Parihāra)
  | 'NOT_QUALIFIED' // Critical classical exclusion present without valid mitigation
  | 'NOT_APPLICABLE'; // Out of requested scope or parameters

export type ConditionStatus = 'MET' | 'NOT_MET' | 'EXCEPTION_APPLIED' | 'NOT_APPLICABLE';

/**
 * Classical Rule Hierarchical Categories:
 * Prevents mixing minor defects with severe classical prohibitions.
 */
export type ClassicalRuleCategory =
  | 'ABSOLUTE_PROHIBITION'   // Excludes activity unless an explicit classical exception applies
  | 'MAJOR_CONDITION'       // Particularly important objective-specific conditions
  | 'SUPPORTING_CONDITION'  // Factors that fortify or weaken without unilaterally invalidating
  | 'SECONDARY_PREFERENCE'; // Desirable refinements influencing ranking

export interface ClassicalCitation {
  text: string; // e.g. 'Muhūrta Cintāmaṇi'
  sanskritTitle: string; // e.g. 'मुहूर्तचिन्तामणिः'
  chapter: string; // e.g. 'Vivāha Prakaraṇa (Ch. 6)'
  shlokaRange: string; // e.g. 'Śloka 18–22'
  sanskritQuote?: string;
  englishTranslation: string;
}

export interface ClassicalConditionRule {
  id: string;
  name: string;
  sanskritName: string;
  category: 'Tithi' | 'Vara' | 'Nakshatra' | 'Yoga' | 'Karana' | 'Lagna' | 'Planetary' | 'Exclusion' | 'Exception';
  ruleTier: ClassicalRuleCategory;
  description: string;
  citation: ClassicalCitation;
  isMandatory: boolean; // If mandatory and NOT MET without exception, window is NOT_QUALIFIED / AVOID
  isExceptionRule?: boolean;
}

export interface EvaluatedCondition {
  rule: ClassicalConditionRule;
  status: ConditionStatus;
  observedValue: string;
  requiredValue: string;
  ruleTier: ClassicalRuleCategory;
  note?: string;
}

export interface PariharaRecord {
  id: string;
  title: string;
  sanskritTitle: string;
  description: string;
  mitigatesDosha: string;
  citation: ClassicalCitation;
}

export interface DynamicQuestion {
  id: string;
  label: string;
  sanskritTerm?: string;
  description: string;
  type: 'select' | 'radio' | 'boolean';
  options?: Array<{ label: string; value: string; hint?: string }>;
  defaultValue: string | boolean;
}

export type MuhurtaQualityTier =
  | 'SOVEREIGN_GOLD' // परमोत्तम — Flawless, Sovereign Tier (Primary Nakshatra, Pure 8th, Kendra Fortified)
  | 'HIGHLY_RECOMMENDED' // उत्तम — Highly Favorable, Classic Clean Election
  | 'USABLE_WITH_PARIHARA' // मध्यम / सापवाद — Usable with Classical Pariharas / Emergency Need
  | 'NOT_RECOMMENDED'; // वर्ज्य / अविहित — Classically Prohibited (Rahu Kala, Bhadra, Malefic 8th)

export interface MuhurtaObjectiveDefinition {
  id: MuhurtaObjectiveId;
  name: string;
  sanskritName: string;
  category: 'Sanskāras' | 'Vāstu & Gṛha' | 'Vāṇijya & Artha' | 'Gati & Yātrā' | 'Sāmānya';
  briefDescription: string;
  classicalSources: ClassicalCitation[];
  dynamicQuestions: DynamicQuestion[];
  favorableTithis: number[]; // Tithi numbers 1-30 (1-15 Shukla, 16-30 Krishna)
  favorableVaras: number[]; // 0: Sun, 1: Moon, 2: Mars, 3: Mercury, 4: Jupiter, 5: Venus, 6: Sat
  favorableNakshatras: number[]; // Primary / Chief Nakshatras (1 - 27)
  secondaryNakshatras?: number[]; // Secondary / Acceptable Nakshatras (Madhyama)
  favorableLagnas: RashiNumber[]; // Primary Lagnas (1 - 12)
  secondaryLagnas?: RashiNumber[]; // Secondary Lagnas
  prohibitedTithis: number[]; // e.g. Rikta (4, 9, 14, 19, 24, 29), Amavasya (30)
  prohibitedVaras: number[];
  rules: ClassicalConditionRule[];
}

export interface PlanetaryPlacementSnapshot {
  planetId: PlanetId;
  planetName: string;
  sanskritName: string;
  rashiNumber: RashiNumber;
  rashiName: string;
  degreeInRashi: string;
  houseFromLagna: number;
  isBenefic: boolean;
  isMalefic: boolean;
  isExalted?: boolean;
  isDebilitated?: boolean;
  isOwnSign?: boolean;
  isRetrograde?: boolean;
}

export interface CandidateMuhurtaPeriod {
  id: string;
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayOfWeek: string;
  startTime: string; // e.g. "08:15 AM"
  endTime: string; // e.g. "10:30 AM"
  startHourDecimal: number;
  endHourDecimal: number;
  durationMinutes: number;
  lagnaRashi: RashiNumber;
  lagnaName: string;
  lagnaSanskrit: string;
  lagnaLord: PlanetId;
  lagnaLordName: string;
  classification: MuhurtaClassification;
  classificationLabel: string; // e.g. "Strongly Recommended (उत्तम)" | "Suitable (सम्मत)" | "Conditional (सापवाद)" | "Avoid (वर्ज्य)"
  status: MuhurtaStatus;
  statusLabel: string;
  summaryReason: string;
  classicalBasisSummary: string; // Explicit classical basis
  cautionSummary?: string; // Explicit disclosure of mixed/secondary factors
  isBestInRequestedRange: boolean;
  isStrongerAlternative?: boolean;
  purityScore: number; // 0 - 100 Classical Strength & Auspiciousness Index
  tier: MuhurtaQualityTier;
  isTopPick: boolean;
  qualityBadge: string; // e.g. "परमोत्तम (Gold)", "उत्तम (Prime)", "सापवाद (Parihāra)"
  appliedPariharas: PariharaRecord[];
  allConditions: EvaluatedCondition[];
  passedConditions: EvaluatedCondition[];
  conditionalConditions: EvaluatedCondition[];
  failedConditions: EvaluatedCondition[];
  ruleCategoriesBreakdown: {
    absoluteProhibitions: EvaluatedCondition[];
    majorConditions: EvaluatedCondition[];
    supportingConditions: EvaluatedCondition[];
    secondaryPreferences: EvaluatedCondition[];
  };
  keyPositiveFactors: string[];
  keyNegativeFactors: string[];
  specialYogas: string[];
  ashtamaShuddhi: {
    isClean: boolean;
    planetsIn8th: string[];
    description: string;
  };
  kendraBenefics: string[];
  upachayaMalefics: string[];
  papaKartari: {
    onLagna: boolean;
    onMoon: boolean;
  };
  moonDignity: {
    rashiName: string;
    isExalted: boolean;
    isDebilitated: boolean;
    isOwnSign: boolean;
    isWaxing: boolean;
    description: string;
  };
  solarMonth: {
    rashiName: string;
    isKharmas: boolean;
  };
  planetaryPositions: PlanetaryPlacementSnapshot[];
  panchangaSnapshot: {
    tithiName: string;
    tithiPaksha: 'Shukla' | 'Krishna';
    tithiNumber: number;
    nakshatraName: string;
    nakshatraPada: number;
    varaName: string;
    yogaName: string;
    karanaName: string;
    isAbhijit: boolean;
    isAmritaKala: boolean;
    isRahuKala: boolean;
    isYamaganda: boolean;
    isGulika: boolean;
    isDurmuhurta: boolean;
    isBhadra: boolean;
    // Window Specific Chronometry:
    activeHoraLord: string;
    activeHoraLordSanskrit: string;
    activeHoraFavorability: string;
    activeChoghadiyaName: string;
    activeChoghadiyaNature: string;
    activeChoghadiyaIsAuspicious: boolean;
    isGodhuli: boolean;
    isVijaya: boolean;
    isBrahmaMuhurta: boolean;
    isDagdhaTithi: boolean;
    isYamaghantaYoga: boolean;
    isMrityuYoga: boolean;
    isDagdhaYoga: boolean;
  };
  jamitraShuddhi: {
    isClean: boolean;
    planetsIn7th: string[];
    description: string;
  };
  chandraLagnaRelation: {
    rashiDistance: number;
    isShadashtaka: boolean;
    isDvidvadasha: boolean;
    description: string;
  };
  combustionStatus: {
    isJupiterCombust: boolean;
    isVenusCombust: boolean;
    description: string;
  };
  sankrantiStatus: {
    isNearSankranti: boolean;
    description: string;
  };
  mahaDoshasAudit: MahaDoshaAuditRecord[];
  citations: ClassicalCitation[];
}

export type SearchScopeType =
  | 'specific_hour' // Specific 1-2 hour window on a selected date
  | 'specific_day' // Entire 24 hours of a single day
  | 'date_range' // Custom Start Date & End Date
  | 'week' // 7 Days from Start Date
  | 'fortnight' // 15 Days (1 Pakṣa)
  | 'month' // 30 Days (1 Māsa)
  | 'two_months' // 60 Days (2 Māsas / 1 Ṛtu)
  | 'quarter' // 90 Days (1 Season / Quarter)
  | 'half_year' // 180 Days (1 Ayana)
  | 'year'; // 365 Days (1 Saṁvatsara)

/**
 * Explicit user search horizon presets
 */
export type SearchHorizonPreset =
  | 'specific_hour'      // Specific hour / time range
  | 'today'              // Today
  | 'tomorrow'           // Tomorrow
  | 'specific_day'       // Specific day
  | 'next_3_days'        // Next 3 days
  | 'this_week'          // This week (until Sunday)
  | 'next_7_days'        // Next 7 days
  | 'specific_week'      // Specific calendar week
  | 'this_month'         // This month (calendar month)
  | 'next_30_days'       // Next 30 days
  | 'selected_month'     // Selected single month
  | 'multiple_months'    // Multiple selected months (e.g. Next 2 months)
  | 'custom_range'       // Custom date range
  | 'year';              // Full Year

/**
 * Search mode controlling engine standard
 */
export type MuhurtaSearchMode =
  | 'best_available'            // Best available within my selected period (Priority to user constraint)
  | 'strongly_recommended_only'  // Strongly recommended only (High classical purity)
  | 'show_all_ranked'           // Show all ranked candidates (Including conditional / acceptable)
  | 'strict_classical';         // Strict classical criteria (Zero blemishes)

export interface MuhurtaSearchQuery {
  objectiveId: MuhurtaObjectiveId;
  searchScope: SearchScopeType;
  horizonPreset?: SearchHorizonPreset;
  startDate: Date;
  endDate: Date;
  targetHourStart?: number; // decimal hour (0 - 24)
  targetHourEnd?: number; // decimal hour (0 - 24)
  searchMode?: MuhurtaSearchMode;
  answers: Record<string, string | number | boolean>;
  preferredLagnasOnly?: boolean;
  allowDayOnly?: boolean;
}

export interface MuhurtaSearchResult {
  bestInRequestedRange: CandidateMuhurtaPeriod | null;
  candidates: CandidateMuhurtaPeriod[];
  strongerAlternativeOutsideRange: CandidateMuhurtaPeriod | null;
  requestedHorizonSummary: {
    preset: SearchHorizonPreset;
    presetLabel: string;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    searchMode: MuhurtaSearchMode;
    totalWindowsEvaluated: number;
    stronglyRecommendedCount: number;
    suitableCount: number;
    conditionalCount: number;
    avoidCount: number;
    hasNoAcceptableInRequested: boolean;
  };
}

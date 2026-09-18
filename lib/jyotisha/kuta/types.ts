/**
 * Gaṇaka — Classical Kuṭa Milan & Vivāha Matching Domain Types
 * 
 * Sources:
 * - Muhūrta Cintāmaṇi (Vivāha Prakaraṇa) by Daivajña Rāma
 * - Bṛhat Parāśara Horā Śāstra (BPHS Ch. 80-81)
 * - Jātaka Pārijāta (Ch. 14 Vivāha Yogyatā)
 * - Phaladīpikā (Ch. 10 Kalatra Bhāva)
 * - Sārāvalī (Kalyāṇavarman)
 * - Mādhavīya / Kālāmṛta / Jātaka Deśamārga (Daśakūṭa / South Indian Porutham)
 * - Jaimini Upadeśa Sūtras (Upapada Lagna & Dārakāraka alignment)
 */

import { JyotishaChart, PlanetId, RashiNumber } from '../types';

export type MatchingTradition = 'ashtakuta' | 'dashakuta';

export type KutaCategory =
  | 'varna'
  | 'vashya'
  | 'tara'
  | 'yoni'
  | 'graha_maitri'
  | 'gana'
  | 'bhakuta'
  | 'nadi'
  // South Indian Daśakūṭa additional Poruthams
  | 'mahendra'
  | 'stree_deergha'
  | 'rajju'
  | 'vedha';

export interface ClassicalRuleReference {
  primaryText: string;
  sanskritTextName: string;
  chapterOrSection: string;
  verseOrSutra?: string;
  shlokaOriginal?: string;
  translation: string;
  commentaryNotes?: string;
}

export interface KutaExceptionApplied {
  id: string;
  ruleTitle: string;
  sanskritTitle: string;
  sourceText: string;
  chapterAndVerse: string;
  shloka?: string;
  conditionDescription: string;
  effect: 'full_cancellation' | 'partial_remedy' | 'mitigated_dosha';
  grantedPoints: number;
}

export interface SingleKutaResult {
  id: KutaCategory;
  name: string;
  sanskritName: string;
  devanagari: string;
  maxScore: number;
  obtainedScore: number;
  rawScore: number;
  isDoshaPresent: boolean;
  isCancelledByException: boolean;
  exceptionApplied?: KutaExceptionApplied;
  groomValue: string;
  brideValue: string;
  matchingCondition: string;
  classicalVerdict: 'Śubha (Auspicious)' | 'Madhyama (Moderate)' | 'Aśubha (Inauspicious / Defective)';
  explanation: string;
  citation: ClassicalRuleReference;
}

export interface MangalaDoshaComparison {
  groom: {
    hasDosha: boolean;
    isCancelled: boolean;
    severity: 'None' | 'Mild' | 'Medium' | 'High';
    afflictedHouses: number[];
    cancellationReasons: string[];
    description: string;
  };
  bride: {
    hasDosha: boolean;
    isCancelled: boolean;
    severity: 'None' | 'Mild' | 'Medium' | 'High';
    afflictedHouses: number[];
    cancellationReasons: string[];
    description: string;
  };
  neutralizationStatus: 'Sama-Kuja (Perfect Balancement)' | 'One-Sided Affliction' | 'Both Free of Affliction' | 'Mitigated by Parihāra';
  verdict: string;
  citation: ClassicalRuleReference;
}

export interface DeeperHoroscopeMatching {
  // 1. Seventh House & Lord analysis (BPHS Ch. 80 / Jātaka Pārijāta)
  seventhHouseAffinity: {
    groom7thLord: PlanetId;
    bride7thLord: PlanetId;
    relationshipBetween7thLords: 'Mitra' | 'Sama' | 'Shatru';
    groom7thSign: RashiNumber;
    bride7thSign: RashiNumber;
    signDisplacement: number; // e.g. 1-7, 5-9, 6-8
    verdict: string;
    citation: ClassicalRuleReference;
  };

  // 2. Shukra & Guru (Natural Marriage Significators)
  significatorAffinity: {
    groomVenusRashi: RashiNumber;
    brideVenusRashi: RashiNumber;
    venusDisplacement: number;
    groomJupiterRashi: RashiNumber;
    brideJupiterRashi: RashiNumber;
    jupiterDisplacement: number;
    verdict: string;
    citation: ClassicalRuleReference;
  };

  // 3. Navāṃśa (D-9) Lagna & Moon Harmony (Phaladīpikā Ch. 10)
  navamshaHarmony: {
    groomD9LagnaRashi: RashiNumber;
    brideD9LagnaRashi: RashiNumber;
    groomD9MoonRashi: RashiNumber;
    brideD9MoonRashi: RashiNumber;
    d9LagnaDisplacement: number;
    d9MoonDisplacement: number;
    isTrikonaOrKendra: boolean;
    verdict: string;
    citation: ClassicalRuleReference;
  };

  // 4. Jaimini Upapada Lagna (UL) & Dārakāraka (DK)
  jaiminiKuta: {
    groomULRashi: RashiNumber;
    brideULRashi: RashiNumber;
    ulDisplacement: number;
    groomDKPlanet: PlanetId;
    brideDKPlanet: PlanetId;
    mutualDKMaitri: 'Mitra' | 'Sama' | 'Shatru';
    verdict: string;
    citation: ClassicalRuleReference;
  };

  // 5. Kuja Dosha (Maṅgala Sāmya)
  mangalaComparison: MangalaDoshaComparison;

  // 6. Daśā Sandhi (Simultaneous transition of major Mahādaśās)
  dashaSandhi: {
    groomCurrentDashaLord: PlanetId;
    brideCurrentDashaLord: PlanetId;
    isSandhiRisk: boolean;
    explanation: string;
    citation: ClassicalRuleReference;
  };
}

export interface KutaMilanResult {
  tradition: MatchingTradition;
  totalScore: number;
  maxTotalScore: number;
  percentageScore: number;
  recommendationLevel: 'Uttama (Highly Auspicious)' | 'Madhyama (Acceptable / Fair)' | 'Kaniṣṭha (Challenging / Inauspicious)';
  isNadiKutaPass: boolean;
  isBhakutaPass: boolean;
  isGanaKutaPass: boolean;
  kutaResults: SingleKutaResult[];
  deeperFactors: DeeperHoroscopeMatching;
  classicalSummary: {
    coreVerdictText: string;
    criticalDefectsFound: string[];
    criticalRemediesActive: string[];
    primaryTreatiseBasis: string;
  };
}

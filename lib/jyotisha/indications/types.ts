/**
 * Gaṇaka — Classical Chart Indications Data Types
 * Comprehensive, source-grounded data models for the 12 classical horoscope domains.
 * 
 * Strict Evidence Pipeline:
 * Calculated Horoscope Data → Exact Classical Rule → Every Required Condition → Condition Verification 
 * → Direct Classical Phala → Cross-Text Comparison & Conflict Analysis → Controlled Synthesis → Modern Interpretive Mapping
 */

import { PlanetId, DignityType, RashiNumber } from '../types';

export type DomainId =
  | 'constitution' // 1. Lagna and fundamental constitution (तनुभाव एवं देहप्रकृति)
  | 'temperament' // 2. Personality and temperament (मनःस्वभाव एवं बुद्धि)
  | 'career' // 3. Career and professional tendencies (दशमभाव एवं कर्मवृत्ति)
  | 'wealth' // 4. Wealth and resources (द्वितीय-एकादश भाव एवं धनसम्पत्ति)
  | 'education' // 5. Education and knowledge (चतुर्थ-पञ्चम भाव एवं विद्या-प्रज्ञा)
  | 'marriage' // 6. Marriage and partnership (सप्तमभाव एवं कलत्रसुख)
  | 'children' // 7. Children and progeny (पञ्चमभाव एवं सन्तानसुख)
  | 'family' // 8. Family and domestic life (द्वितीय-चतुर्थ भाव एवं कुटुम्ब-गृहसुख)
  | 'health' // 9. Health-related classical indications (षष्ठ-अष्टम भाव एवं देहस्वास्थ्य)
  | 'spirituality' // 10. Spiritual and religious inclination (नवम-द्वादश भाव एवं धर्म-मोक्ष)
  | 'status' // 11. Social position, authority & recognition (दशमभाव, आरूढ एवं कीर्ति-प्रतिष्ठा)
  | 'life_themes'; // 12. Major life themes & chart emphasis (जीवनप्रवाह एवं कुण्डली महालक्षण)

export type FactCategory =
  | 'Lagna & Lord'
  | 'Bhāva & Bhāveśa'
  | 'Graha & Dignity'
  | 'Dṛṣṭi & Yuti'
  | 'Varga (Divisional)'
  | 'Jaimini Sūtra'
  | 'Śaḍbala & Strength'
  | 'Aṣṭakavarga'
  | 'Yoga & Affliction'
  | 'Purushartha Alignment';

export interface CalculatedFact {
  id: string;
  category: FactCategory;
  label: string;
  value: string;
  significance: string;
  isFavorable?: boolean;
  neutralOrMixed?: boolean;
}

export interface RuleCondition {
  id: string;
  description: string;
  expected: string;
  observed: string;
  met: boolean;
  significance?: string;
}

export interface ClassicalRuleCitation {
  id: string;
  sourceText: string; // e.g. 'Bṛhat Parāśara Horā Śāstra', 'Phaladīpikā', 'Bṛhat Jātaka', 'Sārāvalī', 'Jaimini Upadeśa Sūtras', 'Jātaka Pārijāta', 'Uttarakālāmṛta'
  chapterAndVerse: string; // e.g. 'Ch. 11, Śloka 3–5'
  sanskritTitle?: string;
  sanskritShloka?: string; // Verbatim Sanskrit text of the rule
  ruleDescription: string;
  scopeAndConditions: string;
  editionOrManuscript?: string; // Edition note (e.g. 'Khemraj / Chowkhamba ed.')
  textualDisagreementNotes?: string;
}

export type VerificationLevel =
  | 'Fully Verified'
  | 'Substantially Verified'
  | 'Partially Verified'
  | 'Condition Not Met'
  | 'Mitigated / Modified';

export interface DirectClassicalPhala {
  id: string;
  ruleId: string;
  sourceText: string;
  chapterAndVerse: string;
  sanskritTitle: string;
  sanskritShloka?: string;
  editionOrManuscript?: string;
  conditions: RuleCondition[];
  allConditionsMet: boolean;
  verificationLevel: VerificationLevel;
  directPhalaText: string; // The literal consequence stated in the ancient text
  textualVariations?: string[];
  reconciliationNotes?: string;
}

export interface ModernInterpretiveMapping {
  id: string;
  classicalConcept: string;
  classicalSourceRef: string;
  modernMappingText: string; // Strictly labeled as interpretive mapping
  methodologyNote: string;
}

export interface ClassicalContradiction {
  id: string;
  favorableFactor: string;
  favorableSource: string;
  limitingFactor: string;
  limitingSource: string;
  conflictNature: string;
  traditionalResolution: string; // Hierarchical rule, cancellation (Bhanga), or temporal activation
  applicableTimingRule?: string;
}

export interface RuleEvaluation {
  rule: ClassicalRuleCitation;
  conditionsRequired: string[];
  conditionsMet: string[];
  conditionsUnmetOrModified?: string[];
  status: VerificationLevel;
  synthesisNote: string;
}

export interface DomainIndication {
  id: DomainId;
  title: string;
  sanskritTitle: string;
  subtitle: string;
  primaryBhavas: number[];
  keyGrahas: PlanetId[];
  keyVargas: string[];
  
  // Rule verification status
  hasVerifiedRule: boolean; // False if no specific classical rule satisfied

  // Concise synthesized overview
  conciseSummary: string;
  coreDisposition: string;
  
  // Direct Classical Phalas (verbatim source consequence with verified conditions)
  directClassicalPhalas: DirectClassicalPhala[];

  // Multi-Rule Synthesis
  multiRuleSynthesis: string;

  // Distinct Modern Interpretive Mappings (explicitly labeled)
  modernMappings: ModernInterpretiveMapping[];

  // Contradictions and Reconciliation
  contradictions: ClassicalContradiction[];

  // Multi-factor Evidence Chain
  calculatedFacts: CalculatedFact[];
  satisfiedRules: RuleEvaluation[];
  supportingFactors: string[];
  limitingOrCounterbalancingFactors: string[];
  
  // Detailed synthesis text (progressive disclosure)
  synthesisNarrative: string;
  calculationBasisNotes: string[];
  canonicalSources: ClassicalRuleCitation[];
  textualDisagreementsOrVariants?: string[];
}

export interface ClassicalIndicationsReport {
  calculatedAt: string;
  ayanamshaFormatted: string;
  totalDomains: number;
  domains: Record<DomainId, DomainIndication>;
  orderedDomainIds: DomainId[];
  globalChartSummary: {
    ascendantSign: string;
    ascendantLord: string;
    moonSign: string;
    moonNakshatra: string;
    sunSign: string;
    atmakaraka: string;
    amatyakaraka: string;
    strongestPlanetByShadbala: string;
    dominantElement: string;
    dominantGuna: string;
  };
}

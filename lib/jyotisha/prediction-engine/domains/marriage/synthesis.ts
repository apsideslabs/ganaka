/**
 * Gaṇaka — Domain 6: Marriage Synthesis Engine (Phase 6)
 * 
 * Synthesizes evaluated conditions, classical rules, and evidence stack into:
 * - Primary Matrimonial Promise & Covenant Quality
 * - Spousal Temperament & Archetype Narrative (7th occupants, 7th lord, D9, DK)
 * - Delay vs Denial Shastric Verdict (Manda-kṛta Vivāha Vilamba)
 * - Kuja Doṣa & Shastric Bhaṅga Synthesis
 * - Navāṃśa (D9) & Jaimini Upapada Lagna (UL) Confirmation
 * - Authentic Vimshottari Daśā Timing Arc
 * - Explicit Contradictions & Shastric Resolutions
 */

import { PredictionContext } from '../../context';
import { RuleEvaluationResult } from '../../types';
import { EvaluatedMarriageEvidenceStack } from './evidence';
import {
  SpousalProfile,
  KujaDoshaAnalysis,
  D9NavamshaConfirmation,
  JaiminiMarriageFactors,
  MarriageTimingArc,
} from './types';

export interface SynthesizedMarriageDomain {
  finalVerdict: string;
  synthesisNarrative: string;
  spousalHarmonySummary: string;
}

/**
 * Synthesizes the final marriage domain predictions from evaluated evidence.
 */
export function synthesizeMarriageDomain(
  ctx: PredictionContext,
  evidence: EvaluatedMarriageEvidenceStack,
  rules: RuleEvaluationResult[],
  spousalProfile: SpousalProfile,
  kujaAnalysis: KujaDoshaAnalysis,
  d9Confirmation: D9NavamshaConfirmation,
  jaiminiFactors: JaiminiMarriageFactors,
  delayVsDenial: {
    isDelayed: boolean;
    delayingFactors: string[];
    mitigatingFactors: string[];
    classicalVerdict: string;
  },
  timingArc: MarriageTimingArc
): SynthesizedMarriageDomain {
  const seventhLord = ctx.getLordOfHouse(7);
  const h7 = ctx.getHouse(7);
  const venus = ctx.getPlanet('venus');

  // 1. Spousal Harmony Summary
  let spousalHarmonySummary = '';
  if (evidence.marriagePromise === 'covenant_enduring_and_harmonious') {
    spousalHarmonySummary = 'Enduring and profoundly harmonious; anchored in mutual dharmic respect, emotional generosity, and domestic stability.';
  } else if (evidence.marriagePromise === 'auspicious_union_with_growth') {
    spousalHarmonySummary = 'Auspicious union characterized by steady emotional growth, complementary personalities, and constructive domestic cooperation.';
  } else if (evidence.marriagePromise === 'prolonged_delay_or_mature_union') {
    spousalHarmonySummary = 'Matured union through patient discernment; while solemnized later in life, the bond is exceptionally stable, faithful, and resilient.';
  } else if (evidence.marriagePromise === 'relational_friction_requiring_adaptation') {
    spousalHarmonySummary = 'Dynamic partnership with distinct points of friction; thrives through conscious communication, emotional validation, and mutual compromise.';
  } else if (evidence.marriagePromise === 'complex_karmic_covenant') {
    spousalHarmonySummary = 'Complex karmic covenant demanding personal emotional maturity, clear boundaries, and spiritual grounding to navigate deep transformative cycles.';
  } else {
    spousalHarmonySummary = 'Stable partnership sustained through daily mutual effort, practical loyalty, and clear shared domestic responsibilities.';
  }

  // 2. Final Verdict
  const triggeredRule = rules.find((r) => r.isTriggered && r.confidence === 'high') || rules.find((r) => r.isTriggered);
  const promiseTitle = evidence.marriagePromise.replace(/_/g, ' ').toUpperCase();

  let finalVerdict = '';
  if (evidence.domainState === 'strongly_supported' || evidence.domainState === 'supported') {
    finalVerdict = `Fortified Marital Covenant (${promiseTitle}): Primary partner archetype manifests as "${spousalProfile.archetypeTitle}". Domestic foundation is anchored by 7th Lord ${seventhLord.name} in House ${seventhLord.house} (${h7.savBindus} SAV bindus) with confirmed D9 Navāṃśa support. ${delayVsDenial.isDelayed ? 'Saturnine timing favors deliberate maturity.' : 'Timely covenant crystallization is supported.'}`;
  } else if (evidence.domainState === 'mixed') {
    finalVerdict = `Dynamic Marital Profile with Structural Counter-Pulls: Partner profile indicates "${spousalProfile.archetypeTitle}". Foundational promise (${seventhLord.name} in H${seventhLord.house}) coexists with classical adjustments (${evidence.obstacles.map((o) => o.obstacleType).slice(0, 2).join(', ')}) resolved through mature communication.`;
  } else if (evidence.domainState === 'contradicted') {
    finalVerdict = `Complex Karmic Partnership Profile: Partner archetype aligns with "${spousalProfile.archetypeTitle}". Relational journey requires conscious emotional boundaries, navigating active friction vectors (${evidence.obstacles.map((o) => o.obstacleType).slice(0, 2).join(', ')}).`;
  } else {
    finalVerdict = `Balanced & Adaptive Marital Profile: Partner archetype is "${spousalProfile.archetypeTitle}". Covenant unfolds flexibly, relying on shared commitment and favorable daśā cycles.`;
  }

  // 3. Narrative Synthesis
  const narrativeParts: string[] = [];

  // Paragraph 1: Foundational 7th House, Lord & Venus
  narrativeParts.push(
    `FOUNDATIONAL MARITAL PROMISE: The 7th Bhāva (${h7.rashiName}) is presided over by ${seventhLord.name}, placed in House ${seventhLord.house} (${seventhLord.rashiName}, ${seventhLord.dignity}, Ṣaḍbala ${seventhLord.shadbalaRatio.toFixed(2)}x). The 7th house holds ${h7.savBindus} Sarvāṣṭakavarga bindus (${h7.savClassification} containment reservoir). Universal significator Venus (Śukra) resides in House ${venus.house} (${venus.rashiName}, ${venus.dignity}, Ṣaḍbala ${venus.shadbalaRatio.toFixed(2)}x). ${triggeredRule ? triggeredRule.shastricVerdict : ''}`
  );

  // Paragraph 2: Spousal Archetype & Psychological Temperament
  narrativeParts.push(
    `SPOUSAL ARCHETYPE & TEMPERAMENT: Per Sārāvalī Ch. 35 and Jaimini Dārakāraka principles, the partner's intrinsic temperament is characterized as "${spousalProfile.archetypeTitle}" (${spousalProfile.sanskritName}), signified by ${spousalProfile.signifyingGrahas.map((g) => ctx.getPlanet(g).name).join(', ')}: ${spousalProfile.temperamentDescription} Partnership contribution: ${spousalProfile.partnershipContribution}`
  );

  // Paragraph 3: Delay vs Denial & Kuja Doṣa Analysis
  const kujaVerdict = kujaAnalysis.isFormed
    ? `Kuja Doṣa is formed from ${Object.entries(kujaAnalysis.referenceLagnasChecked).filter(([_, v]) => v).map(([k]) => k.replace('from', '')).join('/')} Lagna (Mars in H${kujaAnalysis.marsPlacementHouse}). ${kujaAnalysis.shastricVerdict}`
    : 'Chart is classically free from Kuja Doṣa (Bhauma Doṣa).';

  narrativeParts.push(
    `VIVĀHA VILAMBA & KUJA DOṢA ANALYSIS: ${delayVsDenial.classicalVerdict} ${kujaVerdict}`
  );

  // Paragraph 4: Varga (D9) & Jaimini Upapada Lagna
  narrativeParts.push(
    `DIVISIONAL & JAIMINI CONFIRMATION: Navāṃśa (D9) reveals ${d9Confirmation.shastricNote} In the Jaimini framework, ${jaiminiFactors.jaiminiSynthesis}`
  );

  // Paragraph 5: Tensions & Obstacles
  if (evidence.tensions.length > 0 || evidence.obstacles.length > 0) {
    const tensionSummaries = evidence.tensions.map((t) => `• Tension between ${t.factorA} and ${t.factorB}: ${t.tensionDescription} [Classical Resolution: ${t.shastricResolution}]`);
    const obstacleSummaries = evidence.obstacles.map((o) => `• ${o.obstacleType}: ${o.manifestation}${o.shastricMitigation ? ` (Mitigation: ${o.shastricMitigation})` : ''}`);
    narrativeParts.push(
      `CLASSICAL TENSIONS & RESOLUTIONS:\n${[...tensionSummaries, ...obstacleSummaries].join('\n')}`
    );
  }

  // Paragraph 6: Vimshottari Daśā Timing
  narrativeParts.push(
    `TIMING & ACTIVATION ARC: Current cycle operates under ${timingArc.activeMahadashaAssessment} and ${timingArc.activeAntardashaAssessment}. ${timingArc.activationRationale} Prospective activation grahas: ${timingArc.prospectiveActivationGrahas.join(', ')}. Epistemological Notice: ${timingArc.timingEpistemologicalCaveat}`
  );

  const synthesisNarrative = narrativeParts.join('\n\n');

  return {
    finalVerdict,
    synthesisNarrative,
    spousalHarmonySummary,
  };
}

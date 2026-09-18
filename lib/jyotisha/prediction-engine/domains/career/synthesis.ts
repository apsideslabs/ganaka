/**
 * Gaṇaka — Domain 3: Career Synthesis Engine (Phase 3)
 * 
 * Synthesizes evaluated conditions, classical rules, and evidence stack into:
 * - Primary Career Indication (concise, authoritative, chart-grounded)
 * - Authority & Status Narrative
 * - Workplace Culture & Professional Environment
 * - Strict Separation of Natal Indication from Activation/Timing
 * - Classical Shastric Citations and Verdict
 */

import { PredictionContext } from '../../context';
import { RuleEvaluationResult } from '../../types';
import {
  EvaluatedCareerEvidenceStack,
} from './evidence';
import {
  ProfessionalFieldArchetype,
  WorkModeOrientation,
  AuthorityLevel,
  WorkplaceEnvironment,
  D10ConfirmationDetails,
  CareerTimingArc,
} from './types';
import { GRAHA_NAMES } from '../../../constants';

export interface SynthesizedCareerDomain {
  finalVerdict: string;
  synthesisNarrative: string;
  workplaceEnvironment: WorkplaceEnvironment;
}

/**
 * Synthesizes the final career domain predictions from evaluated evidence.
 */
export function synthesizeCareerDomain(
  ctx: PredictionContext,
  evidence: EvaluatedCareerEvidenceStack,
  rules: RuleEvaluationResult[],
  primaryArchetype: ProfessionalFieldArchetype,
  secondaryArchetypes: ProfessionalFieldArchetype[],
  authorityLevel: AuthorityLevel,
  authorityNarrative: string,
  workMode: WorkModeOrientation,
  timingArc: CareerTimingArc,
  d10Details: D10ConfirmationDetails
): SynthesizedCareerDomain {
  const tenthLord = ctx.getLordOfHouse(10);
  const h10 = ctx.getHouse(10);
  const sun = ctx.getPlanet('sun');
  const saturn = ctx.getPlanet('saturn');

  // 1. Determine Workplace Environment
  let settingType = 'Corporate Enterprise & Institutional Hierarchy';
  const culturalAttributes: string[] = [];
  let institutionalScale = 'Established Institutional Scale';

  if (workMode.mode === 'independent_enterprise_dominant' || workMode.mode === 'independent_practice_or_consultancy') {
    settingType = 'Autonomous Consultancy, Private Studio or Commercial Enterprise';
    culturalAttributes.push('Client-centric and relationship-driven', 'High operational freedom with direct revenue responsibility');
    institutionalScale = 'Independent Practice / Boutique Enterprise';
  } else if (workMode.mode === 'public_sector_or_civil_service') {
    settingType = 'Public Sector, Statutory Regulatory Body or Civil Governance';
    culturalAttributes.push('Protocol-driven, structured and procedural', 'Public interest and institutional stewardship');
    institutionalScale = 'Large Sovereign / Government Administration';
  } else if (primaryArchetype.fieldId === 'engineering_defense' || primaryArchetype.fieldId === 'organizational_industry') {
    settingType = 'Technical Operations, Industrial Plants or Infrastructure Hubs';
    culturalAttributes.push('Methodical, precision-critical, and safety-conscious', 'Engineered workflows with tangible physical deliverables');
    institutionalScale = 'Industrial / Engineering Infrastructure';
  } else if (primaryArchetype.fieldId === 'law_advisory_ethics' || primaryArchetype.fieldId === 'finance_treasury') {
    settingType = 'Advisory Chamber, Financial Institution or Corporate Headquarters';
    culturalAttributes.push('Intellectually rigorous, fiduciary, and analytical', 'Discreet, compliance-oriented, and strategic');
    institutionalScale = 'Senior Corporate / Institutional Fiduciary';
  } else {
    settingType = 'Modern Organizational Workspace & Collaborative Systems';
    culturalAttributes.push('Team-oriented execution and functional accountability', 'Iterative goal management with structured deliverables');
    institutionalScale = 'Mid-to-Large Scale Enterprise';
  }

  const envRationale = `Workplace environment is governed by 10th house sign (${h10.rashiName}), 10th lord ${tenthLord.name} in House ${tenthLord.house}, and primary vocational archetype (${primaryArchetype.title}).`;

  const workplaceEnvironment: WorkplaceEnvironment = {
    settingType,
    culturalAttributes,
    institutionalScale,
    environmentalRationale: envRationale,
  };

  // 2. Format Final Verdict
  const triggeredRule = rules.find((r) => r.isTriggered && r.confidence === 'high') || rules.find((r) => r.isTriggered);
  let finalVerdict = '';

  const strengthTitle = evidence.careerStrength.replace(/_/g, ' ').toUpperCase();
  const authorityTitle = authorityLevel.replace(/_/g, ' ');

  if (evidence.domainState === 'strongly_supported' || evidence.domainState === 'supported') {
    finalVerdict = `Fortified Vocational Profile (${strengthTitle}): ${primaryArchetype.title}. Operates with ${authorityTitle} through ${workMode.title}. Stability is ${evidence.stability.title.toLowerCase()}, anchored by 10th Lord ${tenthLord.name} in House ${tenthLord.house} (${h10.savBindus} SAV bindus).`;
  } else if (evidence.domainState === 'mixed') {
    finalVerdict = `Dynamic Vocational Profile with Structural Counter-Pulls: ${primaryArchetype.title}. Balances ${authorityTitle} with ${evidence.stability.title.toLowerCase()}. Foundational strengths (${tenthLord.name} in H${tenthLord.house}) coexist with classical friction vectors requiring strategic pacing.`;
  } else if (evidence.domainState === 'contradicted') {
    finalVerdict = `Challenged Vocational Profile: ${primaryArchetype.title}. Professional trajectory is shaped by ${evidence.stability.title.toLowerCase()} and active karmic hurdles (${evidence.obstacles.map((o) => o.obstacleType).slice(0, 2).join(', ')}), favoring specialized individual mastery over rigid institutional climbing.`;
  } else {
    finalVerdict = `Balanced & Adaptive Vocational Profile: ${primaryArchetype.title}. Operates flexibly in ${workMode.title} without extreme sovereign elevation or acute dusthāna impairment. Vocation unfolds responsively across active Daśā seasons.`;
  }

  // 3. Narrative Synthesis
  const narrativeParts: string[] = [];

  // Paragraph 1: Foundational 10th House & Lord Analysis
  narrativeParts.push(
    `FOUNDATIONAL CAREER ARCHITECTURE: The 10th Bhāva (${h10.rashiName}) is ruled by ${tenthLord.name}, situated in House ${tenthLord.house} (${tenthLord.rashiName}, ${tenthLord.dignity}, Ṣaḍbala ${tenthLord.shadbalaRatio}x). The 10th house holds ${h10.savBindus} Sarvāṣṭakavarga bindus (${h10.savClassification} prāṇic capacity). ${triggeredRule ? triggeredRule.shastricVerdict : ''}`
  );

  // Paragraph 2: Professional Field & Authority Synthesis
  const secondaryMention = secondaryArchetypes.length > 0
    ? ` Secondary vocational affinities extend into ${secondaryArchetypes.map((s) => s.title).join(' and ')}.`
    : '';
  narrativeParts.push(
    `VOCATIONAL FIELD & AUTHORITY: The primary career trajectory manifests as ${primaryArchetype.title} (${primaryArchetype.sanskritName}), supported by influential rays of ${primaryArchetype.primaryPlanets.map((p) => GRAHA_NAMES[p]?.english || p).join(', ')}.${secondaryMention} Authority orientation is classified as ${authorityTitle}: ${authorityNarrative}`
  );

  // Paragraph 3: Work Mode, Workplace & Stability
  narrativeParts.push(
    `WORK MODE & STABILITY DYNAMICS: The chart indicates a preference for ${workMode.title} (${workMode.rationale}). Career stability is characterized as ${evidence.stability.title}: ${evidence.stability.rationale} The natural workplace setting centers on ${workplaceEnvironment.settingType} within ${workplaceEnvironment.institutionalScale}.`
  );

  // Paragraph 4: Tensions & Obstacles (Preserving Conflicts honestly)
  if (evidence.tensions.length > 0 || evidence.obstacles.length > 0) {
    const tensionSummaries = evidence.tensions.map((t) => `• Tension between ${t.factorA} and ${t.factorB}: ${t.tensionDescription} [Shastric Resolution: ${t.shastricResolution}]`);
    const obstacleSummaries = evidence.obstacles.map((o) => `• ${o.obstacleType}: ${o.manifestation}`);
    narrativeParts.push(
      `CLASSICAL TENSIONS & FRICTION VECTORS:\n${[...tensionSummaries, ...obstacleSummaries].join('\n')}`
    );
  }

  // Paragraph 5: Timing & D10 Confirmation
  narrativeParts.push(
    `TIMING & VARGA ACTIVATION: ${timingArc.activeMahadashaAssessment} ${timingArc.activeAntardashaAssessment} Daśāṃśa (D10) Varga Status: ${d10Details.shastricNote} (Notice: ${timingArc.timingEpistemologicalCaveat})`
  );

  const synthesisNarrative = narrativeParts.join('\n\n');

  return {
    finalVerdict,
    synthesisNarrative,
    workplaceEnvironment,
  };
}

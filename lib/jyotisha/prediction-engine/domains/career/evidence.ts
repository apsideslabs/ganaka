/**
 * Gaṇaka — Domain 3: Career Evidence Stack & Contradiction Resolution (Phase 3)
 * 
 * Strict Evidence Stack:
 * Relevant Factors → Classical Conditions → Supporting vs Contradicting Evidence
 * → Qualitative Evidence States → Classical Tensions & Contradiction Mapping
 */

import { PredictionContext, NATURAL_BENEFICS, NATURAL_MALEFICS } from '../../context';
import { EvaluatedCondition, PredictionEvidence, QualitativeEvidenceState } from '../../types';
import {
  CareerStrengthCategory,
  CareerTension,
  StabilityProfile,
  AdvancementVector,
  ProfessionalObstacle,
  AuthorityLevel,
  WorkModeOrientation,
  D10ConfirmationDetails,
} from './types';
import { GRAHA_NAMES } from '../../../constants';

export interface EvaluatedCareerEvidenceStack {
  domainState: QualitativeEvidenceState;
  careerStrength: CareerStrengthCategory;
  supportingEvidence: PredictionEvidence[];
  contradictingEvidence: PredictionEvidence[];
  stability: StabilityProfile;
  advancement: AdvancementVector;
  obstacles: ProfessionalObstacle[];
  tensions: CareerTension[];
  unresolvedUncertainties: string[];
}

/**
 * Builds the Career Evidence Stack, segregating supporting and contradicting evidence,
 * evaluating qualitative states, and resolving chart-specific career tensions.
 */
export function buildCareerEvidenceStack(
  ctx: PredictionContext,
  allConditions: EvaluatedCondition[],
  authorityLevel: AuthorityLevel,
  workMode: WorkModeOrientation,
  d10Details: D10ConfirmationDetails
): EvaluatedCareerEvidenceStack {
  const supportingEvidence: PredictionEvidence[] = [];
  const contradictingEvidence: PredictionEvidence[] = [];

  allConditions.forEach((c) => {
    if (c.status === 'satisfied') {
      supportingEvidence.push({
        parameter: c.parameter,
        observedFact: c.observed,
        shastricRationale: c.rationale,
        polarity: 'supporting',
        weight: c.weight === 'mandatory' ? 'decisive' : 'moderate',
      });
    } else if (c.status === 'contradicted') {
      contradictingEvidence.push({
        parameter: c.parameter,
        observedFact: c.observed,
        shastricRationale: c.rationale,
        polarity: 'counteracting',
        weight: c.weight === 'mandatory' ? 'decisive' : 'moderate',
      });
    }
  });

  const h10 = ctx.getHouse(10);
  const tenthLord = ctx.getLordOfHouse(10);
  const lagnaLord = ctx.getLordOfHouse(1);
  const sun = ctx.getPlanet('sun');
  const saturn = ctx.getPlanet('saturn');
  const verifiedYogas = Array.from(ctx.verifiedYogaNames);

  // 1. Determine Career Strength Category
  const isKendraTrikona = [1, 4, 7, 10, 5, 9].includes(tenthLord.house);
  const isDusthana = [6, 8, 12].includes(tenthLord.house);
  const isCombust = tenthLord.isCombust;
  const savBindus = h10.savBindus;

  let careerStrength: CareerStrengthCategory = 'moderate_service';
  if (authorityLevel === 'sovereign_executive' && isKendraTrikona && !isCombust && savBindus >= 28) {
    careerStrength = 'commanding_authority';
  } else if (isKendraTrikona && !isCombust && (savBindus >= 28 || tenthLord.isExalted || tenthLord.isOwnSign)) {
    careerStrength = 'fortified_executive';
  } else if ((tenthLord.house === 3 || tenthLord.house === 11 || savBindus >= 28) && !isCombust && !isDusthana) {
    careerStrength = 'stable_progressive';
  } else if (tenthLord.house === 6 || saturn.house === 10) {
    careerStrength = 'moderate_service';
  } else if (isDusthana || isCombust || savBindus < 24) {
    careerStrength = isDusthana && isCombust ? 'constrained_karmic_friction' : 'vulnerable_or_unsettled';
  }

  // 2. Determine Qualitative Domain Evidence State
  let domainState: QualitativeEvidenceState = 'insufficient_evidence';
  if (contradictingEvidence.length === 0 && supportingEvidence.length >= 4) {
    domainState = 'strongly_supported';
  } else if (supportingEvidence.length >= 3 && contradictingEvidence.length <= 1) {
    domainState = 'supported';
  } else if (supportingEvidence.length > 0 && contradictingEvidence.length > 0) {
    domainState = 'mixed';
  } else if (contradictingEvidence.length >= 2) {
    domainState = 'contradicted';
  } else if (supportingEvidence.length >= 1) {
    domainState = 'weakly_supported';
  }

  // 3. Stability Profile
  const hasRahuKetuIn10 = h10.occupants.includes('rahu') || h10.occupants.includes('ketu');
  const hasNodalOnLord = ctx.getPlanet('rahu').house === tenthLord.house || ctx.getPlanet('ketu').house === tenthLord.house;
  const isNodalInfluenced = hasRahuKetuIn10 || hasNodalOnLord;

  const stabilizingFactors: string[] = [];
  const volatilityFactors: string[] = [];

  if (savBindus >= 32) stabilizingFactors.push(`Abundant 10th house SAV (${savBindus} bindus) anchors long-term institutional tenure`);
  else if (savBindus >= 28) stabilizingFactors.push(`Adequate 10th house SAV (${savBindus} bindus) preserves career continuity`);
  else volatilityFactors.push(`Deficient 10th house SAV (${savBindus} bindus) predisposes to structural disruption`);

  if ([1, 4, 7, 10].includes(tenthLord.house)) stabilizingFactors.push(`Daśameśa fortified in Kendra House ${tenthLord.house}`);
  if (isDusthana) volatilityFactors.push(`Daśameśa located in Dusthāna House ${tenthLord.house}`);
  if (isCombust) volatilityFactors.push(`Daśameśa combust by Sun in House ${tenthLord.house}`);
  if (isNodalInfluenced) volatilityFactors.push(`Nodal axis (Rāhu/Ketu) contacts 10th house or lord, inducing sudden ascents, industry pivots, or unconventional leaps`);
  if (tenthLord.isRetrograde) volatilityFactors.push(`Retrograde Daśameśa causes non-linear career progress, periodic retracing, and independent revisions`);

  let stabilityCategory: StabilityProfile['category'] = 'progressive_growth_through_effort';
  let stabilityTitle = '';
  let stabilityRationale = '';

  if (stabilizingFactors.length >= 2 && volatilityFactors.length === 0) {
    stabilityCategory = 'highly_stable_and_enduring';
    stabilityTitle = 'Highly Stable, Continuous & Enduring';
    stabilityRationale = `Professional trajectory exhibits superior stability: protected by Kendra alignments and fortified SAV capacity without disruptive nodal contacts.`;
  } else if (volatilityFactors.length >= 2) {
    stabilityCategory = 'high_volatility_or_unsettled';
    stabilityTitle = 'High Volatility, Restructuring & Disruption Vectors';
    stabilityRationale = `Career path experiences substantial structural volatility: ${volatilityFactors.join('; ')}.`;
  } else if (isNodalInfluenced || tenthLord.isRetrograde) {
    stabilityCategory = 'periodic_pivots_and_transformations';
    stabilityTitle = 'Dynamic Evolution via Periodic Pivots & Industry Shifts';
    stabilityRationale = `Vocational journey is characterized by distinct multi-year chapters, strategic reinventions, and non-linear jumps rather than a rigid single-track ladder.`;
  } else {
    stabilityCategory = 'progressive_growth_through_effort';
    stabilityTitle = 'Progressive Cumulative Growth through Sustained Industry';
    stabilityRationale = `Steady, incremental vocational growth where stability compounds gradually through experience and Saturnine persistence.`;
  }

  const stability: StabilityProfile = {
    category: stabilityCategory,
    title: stabilityTitle,
    savEvaluation: `${savBindus} SAV bindus (${h10.savClassification})`,
    nodalInfluence: isNodalInfluenced,
    retrogressionEffect: tenthLord.isRetrograde ? `Retrograde ${tenthLord.name} in House ${tenthLord.house} brings iterative mastery and unorthodox execution.` : null,
    volatilityFactors,
    stabilizingFactors,
    rationale: stabilityRationale,
  };

  // 4. Advancement Vector
  const rajaYogasActive = verifiedYogas.filter((y) =>
    y.includes('raja') || y.includes('mahadhipati') || y.includes('ruchaka') || y.includes('bhadra') || y.includes('hamsa') || y.includes('malavya') || y.includes('sasa')
  );
  const dhanaYogasActive = verifiedYogas.filter((y) => y.includes('dhana') || y.includes('lakshmi') || y.includes('vasumathi'));

  const primaryDrivers: string[] = [];
  if (rajaYogasActive.length > 0) primaryDrivers.push(`Active Raja Yogas (${rajaYogasActive.slice(0, 2).join(', ')})`);
  if (isKendraTrikona) primaryDrivers.push(`Kendra/Trikona placement of 10th Lord ${tenthLord.name}`);
  if (h10.beneficOccupants.length > 0) primaryDrivers.push(`Benefic rays in 10th house (${h10.beneficOccupants.map((b) => GRAHA_NAMES[b]?.english || b).join(', ')})`);
  if (sun.house === 10) primaryDrivers.push(`Sun's directional Digbala in 10th house`);
  if (savBindus >= 28) primaryDrivers.push(`Adequate 10th house SAV reserve (${savBindus} bindus)`);
  if (d10Details.vargaConfirmationStatus === 'powerfully_reinforced') primaryDrivers.push(`Confirmation in D10 Daśāṃśa`);

  const upachayaProgression = `Houses 3, 6, 10, and 11 govern self-effort (Upachaya); planets situated here improve and yield increasing fruits as the native matures past initial trial periods.`;

  const advancement: AdvancementVector = {
    primaryDrivers,
    rajaYogasActive,
    dhanaYogasActive,
    upachayaProgression,
    synthesis: primaryDrivers.length > 0
      ? `Advancement is driven by ${primaryDrivers.join('; ')}.`
      : `Advancement proceeds through steady daily execution and acquired competence without singular structural elevation.`,
  };

  // 5. Professional Obstacles & Classical Mitigations
  const obstacles: ProfessionalObstacle[] = [];
  if (tenthLord.isCombust) {
    obstacles.push({
      obstacleType: 'Astaṅgata Daśameśa (Solar Combustion)',
      planetaryRoot: `10th Lord ${tenthLord.name} combust by Sun`,
      manifestation: 'Occasional friction with authority figures, difficulty asserting independent credit, or feeling that superiors overshadow personal accomplishments.',
      shastricMitigation: 'Strengthening internal executive boundaries; propitiating Sun via classical Āditya Hṛdaya and avoiding unnecessary ego collisions with leadership.',
    });
  }
  if (tenthLord.house === 8) {
    obstacles.push({
      obstacleType: 'Randhrasthāna Daśameśa (8th House Karma)',
      planetaryRoot: `10th Lord ${tenthLord.name} placed in 8th House`,
      manifestation: 'Periodic sudden breaks in career continuity, operating in background/unacknowledged capacities, or necessity of major professional reinventions.',
      shastricMitigation: 'Aligning profession with research, auditing, crisis management, or confidential domains where 8th house depth becomes an asset.',
    });
  }
  if (tenthLord.house === 6) {
    obstacles.push({
      obstacleType: 'Śatrusthāna Daśameśa (6th House Workplace Friction)',
      planetaryRoot: `10th Lord ${tenthLord.name} placed in 6th House`,
      manifestation: 'Intense workplace competition, procedural disputes, or demanding service conditions.',
      shastricMitigation: 'Harnessing analytical dispute-resolution skills; victory achieved through stamina and outworking competitors (Śatru-Jaya).',
    });
  }
  if (savBindus < 24) {
    obstacles.push({
      obstacleType: 'Deficient Aṣṭakavarga Karmic Reservoir',
      planetaryRoot: `10th House SAV Bindus at ${savBindus} (<24 threshold)`,
      manifestation: 'Efforts yield slower tangible acknowledgment; organizational projects require repeated follow-up to sustain momentum.',
      shastricMitigation: 'Focusing on high-leverage partnerships (7th house) and continuous skill upgrades to compensate for institutional drag.',
    });
  }
  if (h10.maleficOccupants.length > 0 && h10.beneficOccupants.length === 0) {
    obstacles.push({
      obstacleType: 'Karmasthāna Malefic Encumbrance',
      planetaryRoot: `Malefic occupants in 10th: ${h10.maleficOccupants.map((m) => GRAHA_NAMES[m]?.english || m).join(', ')}`,
      manifestation: 'Heavy physical/mental pressure, high-stakes exposure, or intense political scrutiny in vocational life.',
      shastricMitigation: 'Cultivating strict operational integrity and dispassionate professional boundaries.',
    });
  }

  // 6. Explicit Classical Tensions Mapping
  const tensions: CareerTension[] = [];

  // Tension 1: High Placement vs Low SAV
  if (isKendraTrikona && savBindus < 26) {
    tensions.push({
      factorA: `10th Lord ${tenthLord.name} in favorable House ${tenthLord.house} (${tenthLord.dignity})`,
      factorB: `10th House SAV bindus critically deficient at ${savBindus} bindus`,
      tensionDescription: 'The native possesses high executive ambition and genuine capability, but institutional environments lack the prāṇic capacity to sustain projects smoothly without excessive personal strain.',
      shastricResolution: 'Classical Jyotiṣa teaches that when Bhāva lord is strong but SAV is deficient, accomplishments are attained through relentless personal stamina rather than institutional ease; native must build private operational reserves.',
    });
  }

  // Tension 2: Strong 7th (Trade) vs Strong 6th (Service)
  if (workMode.mode === 'hybrid_or_transitional' || (workMode.sixthHouseWeight === 'dominant' && workMode.seventhHouseWeight === 'dominant')) {
    tensions.push({
      factorA: `6th House active (Sevā / Salaried Corporate Employment)`,
      factorB: `7th House active (Vyāpāra / Independent Commercial Partnership)`,
      tensionDescription: 'A persistent vocational pull between the stability of structured salaried employment and the desire for autonomous commercial enterprise.',
      shastricResolution: 'Resolved chronologically: early career stabilizes within institutional employment to master organizational craft; subsequent Daśā periods activate independent advisory or commercial partnerships.',
    });
  }

  // Tension 3: Sun in 10th (Digbala Authority) vs Combust/Weak 10th Lord
  if (sun.house === 10 && (tenthLord.isCombust || isDusthana)) {
    tensions.push({
      factorA: `Sun possesses directional strength (Digbala) in 10th house`,
      factorB: `10th Lord ${tenthLord.name} is ${tenthLord.isCombust ? 'combust' : 'placed in Dusthāna House ' + tenthLord.house}`,
      tensionDescription: 'Inherent presence and natural aura of authority contrasts with structural vulnerabilities in the actual administrative machinery or official title.',
      shastricResolution: 'Native thrives as a respected senior advisor, independent consultant, or policy influencer rather than an institutional bureaucrat bound by administrative red tape.',
    });
  }

  // Tension 4: D1 Promising vs D10 Dusthana
  if (d10Details.vargaConfirmationStatus === 'varga_friction_indicated') {
    tensions.push({
      factorA: `D1 Rasi chart exhibits favorable 10th lord placement`,
      factorB: `D1 10th lord occupies Dusthāna in D10 Daśāṃśa (${d10Details.d10D1LordPlacement})`,
      tensionDescription: 'Theoretical talent and vocational promise in D1 encounter procedural resistance and organizational friction when executed inside institutional hierarchies in D10.',
      shastricResolution: 'Daśāṃśa friction is mediated by working in specialized niches, boutique firms, or autonomous consulting where large bureaucratic frictions are minimized.',
    });
  }

  // 7. Unresolved Uncertainties
  const unresolvedUncertainties: string[] = [];
  if (h10.occupants.length === 0 && h10.aspectsReceived.length === 0) {
    unresolvedUncertainties.push('10th house receives no direct major aspects and hosts no occupants; vocation is mediated entirely through its lord and prevailing Daśā periods.');
  }
  if (workMode.mode === 'undifferentiated') {
    unresolvedUncertainties.push('Employment vs. independent business balance lacks a singular dominant marker; vocational mode will vary dynamically across life cycles.');
  }
  if (d10Details.vargaConfirmationStatus === 'neutral_or_unverified') {
    unresolvedUncertainties.push('Daśāṃśa (D10) exact confirmation was unverified; reliance placed on D1 rāśi integrity.');
  }

  return {
    domainState,
    careerStrength,
    supportingEvidence,
    contradictingEvidence,
    stability,
    advancement,
    obstacles,
    tensions,
    unresolvedUncertainties,
  };
}

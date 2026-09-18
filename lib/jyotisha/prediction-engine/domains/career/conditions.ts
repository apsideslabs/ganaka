/**
 * Gaṇaka — Domain 3: Career, Vocation & Karma Condition Evaluators (Phase 3)
 * 
 * Strict multi-factor classical Jyotiṣa evaluations for:
 * - 10th Lord (Daśameśa / Karmādhipati) positional integrity, dignity, combustion, retrogression
 * - 10th Bhāva (Karmasthāna) occupants, benefic/malefic rays, Amala Yoga verification
 * - Karmic capacity via genuine Aṣṭakavarga (SAV) bindu thresholds in 10th house
 * - Sovereign authority & executive status via Sūrya (Rājya-Kāraka) and active Raja Yogas
 * - Employment vs. Independent Enterprise balance (6th Seva vs. 7th Vyāpāra vs. 10th Autonomy)
 * - Karma-Kāraka Śani (Saturn) structural perseverance and service endurance
 * - Professional field / vocational archetype grounded in authentic graha contacts
 * - D10 Daśāṃśa Varga confirmation
 * - Genuine Vimshottari Daśā activation (no fabricated calendar ages)
 */

import { PredictionContext, NATURAL_BENEFICS, NATURAL_MALEFICS } from '../../context';
import { EvaluatedCondition, ConditionStatus } from '../../types';
import { RASHIS, GRAHA_NAMES } from '../../../constants';
import { PlanetId, RashiNumber } from '../../../types';
import {
  ProfessionalFieldArchetype,
  WorkModeOrientation,
  AuthorityLevel,
  D10ConfirmationDetails,
  CareerTimingArc,
} from './types';

/**
 * 1. Daśameśa (10th Lord) Multi-Factor Evaluation
 */
export function evaluateDashameshaMultiFactorCondition(ctx: PredictionContext): EvaluatedCondition {
  const tenthLord = ctx.getLordOfHouse(10);
  const h10 = ctx.getHouse(10);

  const isKendra = [1, 4, 7, 10].includes(tenthLord.house);
  const isTrikona = [5, 9].includes(tenthLord.house);
  const isDusthana = [6, 8, 12].includes(tenthLord.house);
  const isUpachaya = [3, 6, 10, 11].includes(tenthLord.house);

  const hasHighDignity = tenthLord.isExalted || tenthLord.isOwnSign || tenthLord.isMoolatrikona;
  const isFriendly = tenthLord.isFriendly;
  const isDebilitated = tenthLord.isDebilitated;
  const isCombust = tenthLord.isCombust;
  const isRetrograde = tenthLord.isRetrograde;
  const isVargottama = tenthLord.isVargottama;

  const nb = isDebilitated ? ctx.checkNichabhanga(tenthLord.id) : { isNichabhanga: false, reasons: [] };

  let status: ConditionStatus = 'insufficient_evidence';
  let rationale = '';

  if (hasHighDignity && (isKendra || isTrikona) && !isCombust) {
    status = 'satisfied';
    rationale = `10th Lord ${tenthLord.name} holds commanding dignity (${tenthLord.dignity}) in House ${tenthLord.house} (${isKendra ? 'Kendra' : 'Trikona'}), confirming foundational professional strength, high executive capacity, and uncombust authority.`;
  } else if (isDusthana) {
    if (tenthLord.house === 6) {
      if (hasHighDignity || isUpachaya) {
        status = 'partially_supported';
        rationale = `10th Lord ${tenthLord.name} sits in the 6th House (Upachaya / Shatru-Sthāna) with ${tenthLord.dignity} dignity; professional success develops through competitive perseverance, organizational problem-solving, and service administration.`;
      } else {
        status = 'contradicted';
        rationale = `10th Lord ${tenthLord.name} placed in the 6th House without superior dignity creates recurrent workplace disputes, friction with authority, or subordinate roles.`;
      }
    } else if (tenthLord.house === 8) {
      if (nb.isNichabhanga || isFriendly) {
        status = 'partially_supported';
        rationale = `10th Lord ${tenthLord.name} sits in the 8th House (Randhrasthāna); indicates transformative career transitions, research/investigative orientation, or indirect professional recognition.`;
      } else {
        status = 'contradicted';
        rationale = `10th Lord ${tenthLord.name} placed in the 8th House without protective mitigation indicates career instability, sudden vocational disruptions, or unacknowledged efforts.`;
      }
    } else {
      // 12th house
      status = 'partially_supported';
      rationale = `10th Lord ${tenthLord.name} placed in the 12th House (Vyayasthāna); classically indicates foreign professional engagements, institutional sanctuaries, or remote/distant karma.`;
    }
  } else if (isCombust) {
    status = 'contradicted';
    rationale = `10th Lord ${tenthLord.name} is Astaṅgata (combust within solar orb in House ${tenthLord.house}), causing ego collisions with superiors, obscured professional identity, or delayed independent command.`;
  } else if (isDebilitated && !nb.isNichabhanga) {
    status = 'contradicted';
    rationale = `10th Lord ${tenthLord.name} is debilitated in House ${tenthLord.house} without confirmed Nīchabhaṅga cancellation, representing foundational vulnerability in sustaining professional status.`;
  } else if (isDebilitated && nb.isNichabhanga) {
    status = 'partially_supported';
    rationale = `10th Lord ${tenthLord.name} is debilitated but redeemed by confirmed Nīchabhaṅga (${nb.reasons.join(', ')}), indicating early career struggles transformed into eventual hard-won competence.`;
  } else if (isKendra || isTrikona || isUpachaya) {
    status = 'satisfied';
    rationale = `10th Lord ${tenthLord.name} is favorably positioned in House ${tenthLord.house} (${tenthLord.dignity}${isRetrograde ? ', retrograde' : ''}${isVargottama ? ', Vargottama' : ''}), supporting steady professional functionality.`;
  } else {
    status = 'partially_supported';
    rationale = `10th Lord ${tenthLord.name} in House ${tenthLord.house} holds neutral dignity (${tenthLord.dignity}), yielding ordinary vocational results dependent on supporting yogas.`;
  }

  return {
    id: 'cond_dashamesha_multifactor',
    name: '10th Lord (Daśameśa) Positional Integrity & Dignity',
    parameter: '10th Lord House, Dignity, Combustion & Ṣaḍbala',
    expected: 'Daśameśa placed in Kendra, Trikona, or Upachaya with dignified strength and freedom from combustion',
    observed: `${tenthLord.name} in H${tenthLord.house} (${tenthLord.rashiName}, ${tenthLord.dignity}, Ṣaḍbala ${tenthLord.shadbalaRatio}x${tenthLord.isCombust ? ', COMBUST' : ''}${tenthLord.isRetrograde ? ', Retrograde' : ''})`,
    status,
    weight: 'mandatory',
    rationale,
  };
}

/**
 * 2. 10th Bhāva (Karmasthāna) Ray Condition: Occupants & Aspects
 */
export function evaluateTenthBhavaRayCondition(ctx: PredictionContext): EvaluatedCondition {
  const h10 = ctx.getHouse(10);
  const beneficsInH10 = h10.beneficOccupants.map((id) => GRAHA_NAMES[id]?.english || id);
  const maleficsInH10 = h10.maleficOccupants.map((id) => GRAHA_NAMES[id]?.english || id);
  const beneficAspects = h10.aspectsReceived.filter((a) => a.isBenefic).map((a) => GRAHA_NAMES[a.planetId]?.english || a.planetId);
  const maleficAspects = h10.aspectsReceived.filter((a) => !a.isBenefic).map((a) => GRAHA_NAMES[a.planetId]?.english || a.planetId);

  const hasAmalaYoga = beneficsInH10.length > 0 && maleficsInH10.length === 0;

  let status: ConditionStatus = 'insufficient_evidence';
  let rationale = '';

  const beneficScore = beneficsInH10.length * 2 + beneficAspects.length;
  const maleficScore = maleficsInH10.length * 2 + maleficAspects.length;

  if (hasAmalaYoga) {
    status = 'satisfied';
    rationale = `10th house is graced exclusively by natural benefic occupants (${beneficsInH10.join(', ')}) forming classical Amala Yoga, indicating spotless professional reputation, noble conduct, and recognized public honor.`;
  } else if (beneficScore > maleficScore && maleficScore === 0) {
    status = 'satisfied';
    rationale = `10th house receives uncorrupted benefic rays (Occupants: ${beneficsInH10.length ? beneficsInH10.join(', ') : 'None'}; Aspects: ${beneficAspects.join(', ')}), providing benevolent career mentorship and smooth professional advancement.`;
  } else if (beneficScore > maleficScore && maleficScore > 0) {
    status = 'partially_supported';
    rationale = `10th house receives mixed influences: benefic assistance (${[...beneficsInH10, ...beneficAspects].join(', ')}) outweighs malefic pressure (${[...maleficsInH10, ...maleficAspects].join(', ')}), yielding hard-won advancement through navigated competition.`;
  } else if (maleficScore > beneficScore && beneficScore > 0) {
    status = 'partially_supported';
    rationale = `10th house experiences notable malefic tension (${[...maleficsInH10, ...maleficAspects].join(', ')}), though mitigated by benefic rays (${[...beneficsInH10, ...beneficAspects].join(', ')}), resulting in intense professional exertion and political turbulence.`;
  } else if (maleficScore > 0 && beneficScore === 0) {
    status = 'contradicted';
    rationale = `10th house is burdened exclusively by malefic rays (Occupants: ${maleficsInH10.length ? maleficsInH10.join(', ') : 'None'}; Aspects: ${maleficAspects.join(', ')}), generating severe occupational friction, harsh workloads, or public scrutiny.`;
  } else {
    status = 'insufficient_evidence';
    rationale = `10th house is unoccupied and uninfluenced by direct major planetary aspects, functioning as a neutral conduit driven primarily by its lord.`;
  }

  return {
    id: 'cond_tenth_bhava_rays',
    name: '10th Bhāva (Karmasthāna) Ray & Aspectual Balance',
    parameter: '10th House Occupants and Classical Aspects Received',
    expected: 'Benefic occupancy or aspect without unmitigated malefic affliction',
    observed: `Occupants: [${h10.occupants.map((o) => GRAHA_NAMES[o]?.english || o).join(', ') || 'None'}]; Benefic Aspects: [${beneficAspects.join(', ') || 'None'}]; Malefic Aspects: [${maleficAspects.join(', ') || 'None'}]`,
    status,
    weight: 'qualifying',
    rationale,
  };
}

/**
 * 3. 10th House Aṣṭakavarga (SAV) Prāṇic Capacity
 */
export function evaluateTenthSAVCondition(ctx: PredictionContext): EvaluatedCondition {
  const h10 = ctx.getHouse(10);
  const bindus = h10.savBindus;

  let status: ConditionStatus = 'insufficient_evidence';
  let rationale = '';

  if (bindus >= 32) {
    status = 'satisfied';
    rationale = `10th House SAV bindu count is exceptionally fortified at ${bindus} bindus (≥32 high threshold), confirming massive reservoir of karmic endurance, unshakeable professional stability, and high capacity to materialize ambitious endeavors.`;
  } else if (bindus >= 28) {
    status = 'satisfied';
    rationale = `10th House SAV bindu count is adequate at ${bindus} bindus (≥28 standard threshold), ensuring stable career baseline and steady preservation of status.`;
  } else if (bindus >= 24) {
    status = 'partially_supported';
    rationale = `10th House SAV bindu count is slightly deficient at ${bindus} bindus (24-27 threshold), meaning professional accomplishments demand disproportionate personal exertion with slower institutional recognition.`;
  } else {
    status = 'contradicted';
    rationale = `10th House SAV bindu count is critically deficient at ${bindus} bindus (<24 threshold), creating acute structural friction where professional projects struggle for continuity or suffer periodic halts.`;
  }

  return {
    id: 'cond_tenth_sav_capacity',
    name: '10th Bhāva Aṣṭakavarga (SAV) Prāṇic Capacity',
    parameter: '10th House Sarvāṣṭakavarga Bindu Count (Threshold: 28)',
    expected: 'At least 28 SAV bindus for stable professional manifestation',
    observed: `${bindus} SAV Bindus (${h10.savClassification.toUpperCase()}) in 10th House (${h10.rashiName})`,
    status,
    weight: 'mandatory',
    rationale,
  };
}

/**
 * 4. Sovereign Authority & Executive Status (Sūrya & Raja Yogas)
 */
export function evaluateAuthorityAndRajyaCondition(ctx: PredictionContext): {
  evaluatedCondition: EvaluatedCondition;
  authorityLevel: AuthorityLevel;
  authorityNarrative: string;
} {
  const sun = ctx.getPlanet('sun');
  const h10 = ctx.getHouse(10);
  const tenthLord = ctx.getLordOfHouse(10);
  const verifiedYogas = ctx.verifiedYogaNames;

  const sunIn10 = sun.house === 10;
  const sunDignityHigh = sun.isExalted || sun.isOwnSign || sun.isMoolatrikona;
  const sunKendraTrikona = [1, 4, 7, 10, 5, 9].includes(sun.house);

  const hasRajaYoga = Array.from(verifiedYogas).some((y) =>
    y.includes('raja') || y.includes('mahadhipati') || y.includes('ruchaka') || y.includes('bhadra') || y.includes('hamsa') || y.includes('malavya') || y.includes('sasa')
  );

  let authorityLevel: AuthorityLevel = 'salaried_service_contributor';
  let authorityNarrative = '';
  let status: ConditionStatus = 'insufficient_evidence';

  if (sunIn10 && (sunDignityHigh || sun.isStrongShadbala) && hasRajaYoga) {
    authorityLevel = 'sovereign_executive';
    status = 'satisfied';
    authorityNarrative = `Sun possesses directional strength (Digbala) in the 10th house, reinforced by superior dignity and confirmed Raja Yogas; indicates commanding sovereign authority, public leadership, and high institutional jurisdiction.`;
  } else if (hasRajaYoga && (sunKendraTrikona || [1, 4, 7, 10].includes(tenthLord.house))) {
    authorityLevel = 'institutional_leadership';
    status = 'satisfied';
    authorityNarrative = `Fortified Kendra/Trikona alignments combined with active Raja Yogas bestow institutional leadership, executive responsibility, and command over organizational policy.`;
  } else if (sunIn10 || ([1, 10].includes(tenthLord.house) && !tenthLord.isCombust)) {
    authorityLevel = 'autonomous_professional';
    status = 'satisfied';
    authorityNarrative = `Strong foundational connection between Lagna and 10th house provides professional autonomy, self-directed agency, and independence from micromanagement.`;
  } else if (tenthLord.house === 6 || ctx.getPlanet('saturn').house === 10) {
    authorityLevel = 'operational_team_lead';
    status = 'partially_supported';
    authorityNarrative = `Operational and service-oriented alignments favor leadership within execution-heavy environments, overseeing teams through practical competence rather than ceremonial decree.`;
  } else if (sun.isDebilitated && !ctx.checkNichabhanga('sun').isNichabhanga) {
    authorityLevel = 'subordinate_support';
    status = 'contradicted';
    authorityNarrative = `Debilitated Sun without Nīchabhaṅga indicates difficulty exercising authority, vulnerability to administrative marginalization, or operating comfortably in supportive backstage roles.`;
  } else {
    authorityLevel = 'salaried_service_contributor';
    status = 'partially_supported';
    authorityNarrative = `Planetary configurations indicate functional competence within established organizational structures rather than prominent public or autocratic authority.`;
  }

  const cond: EvaluatedCondition = {
    id: 'cond_career_authority_status',
    name: 'Sovereign Authority & Executive Status (Rājyādhikāra)',
    parameter: 'Sūrya (Rājya-Kāraka) Dignity, 10th House Digbala & Active Raja Yogas',
    expected: 'Fortified Sun in Kendra/Trikona or active Raja Yogas for executive authority',
    observed: `Sun in H${sun.house} (${sun.rashiName}, ${sun.dignity}, Digbala: ${sunIn10 ? 'YES' : 'NO'}); Raja Yogas Active: ${hasRajaYoga ? 'YES' : 'NO'}`,
    status,
    weight: 'qualifying',
    rationale: authorityNarrative,
  };

  return { evaluatedCondition: cond, authorityLevel, authorityNarrative };
}

/**
 * 5. Work Mode Orientation: Employment (6th Seva) vs. Independent Business (7th Vyāpāra) vs. Autonomous (10th)
 */
export function evaluateWorkModeCondition(ctx: PredictionContext): {
  evaluatedCondition: EvaluatedCondition;
  workMode: WorkModeOrientation;
} {
  const h6 = ctx.getHouse(6);
  const h7 = ctx.getHouse(7);
  const h10 = ctx.getHouse(10);
  const lord6 = ctx.getLordOfHouse(6);
  const lord7 = ctx.getLordOfHouse(7);
  const lord10 = ctx.getLordOfHouse(10);
  const saturn = ctx.getPlanet('saturn');
  const mercury = ctx.getPlanet('mercury');

  // Evaluate 6th house (Seva / Salaried employment) weight
  let sixthScore = 0;
  if (h6.occupants.length > 0) sixthScore += h6.occupants.length;
  if ([1, 10].includes(lord6.house)) sixthScore += 2;
  if (lord10.house === 6) sixthScore += 2.5;
  if (saturn.house === 6 || saturn.house === 10) sixthScore += 1;

  // Evaluate 7th house (Vyāpāra / Business / Partnerships / Market Clientele) weight
  let seventhScore = 0;
  if (h7.occupants.length > 0) seventhScore += h7.occupants.length;
  if ([1, 10].includes(lord7.house)) seventhScore += 2;
  if (lord10.house === 7) seventhScore += 2.5;
  if (mercury.house === 7 || mercury.house === 10) seventhScore += 1;
  if (h7.occupants.includes('mercury') || h7.occupants.includes('jupiter')) seventhScore += 1;

  let mode: WorkModeOrientation['mode'] = 'undifferentiated';
  let title = '';
  let rationale = '';

  const sixthWeight: WorkModeOrientation['sixthHouseWeight'] =
    sixthScore >= 3 ? 'dominant' : sixthScore >= 1.5 ? 'balanced' : 'recessive';
  const seventhWeight: WorkModeOrientation['seventhHouseWeight'] =
    seventhScore >= 3 ? 'dominant' : seventhScore >= 1.5 ? 'balanced' : 'recessive';
  const tenthAutonomy: WorkModeOrientation['tenthHouseAutonomy'] =
    [1, 10].includes(lord10.house) && !lord10.isCombust ? 'high' : [4, 7, 5, 9].includes(lord10.house) ? 'moderate' : 'low';

  if (seventhScore >= 3 && seventhScore > sixthScore) {
    mode = 'independent_enterprise_dominant';
    title = 'Independent Enterprise & Commercial Trade (Vyāpāra-Pradhāna)';
    rationale = `Strong 7th house and mercantile alignments (${seventhScore.toFixed(1)} weight vs. 6th house ${sixthScore.toFixed(1)}) strongly favor autonomous commerce, direct market client interaction, and entrepreneurial ventures.`;
  } else if (seventhScore >= 2 && sixthScore <= 1.5 && tenthAutonomy === 'high') {
    mode = 'independent_practice_or_consultancy';
    title = 'Independent Practice & Advisory Consultancy';
    rationale = `Elevated 10th house autonomy coupled with favorable 7th house commercial connectivity supports private professional practice, specialist consulting, or freelance enterprise.`;
  } else if (sixthScore >= 3 && sixthScore > seventhScore) {
    mode = 'salaried_corporate_or_institutional';
    title = 'Institutional Service & Corporate Hierarchy (Sevā-Vṛtti)';
    rationale = `Dominant 6th house factors (${sixthScore.toFixed(1)} weight vs. 7th house ${seventhScore.toFixed(1)}) align the vocational karma with structured corporate hierarchies, institutional employment, and specialized functional roles.`;
  } else if (ctx.getPlanet('sun').house === 10 || (lord10.house === 10 && ctx.getPlanet('sun').isStrongShadbala)) {
    mode = 'public_sector_or_civil_service';
    title = 'Public Sector, Sovereign Service & Institutional Governance';
    rationale = `Sun's commanding alignment with the 10th house or sovereign yogas favors career roles connected with governmental agencies, statutory authorities, or public administration.`;
  } else if (Math.abs(sixthScore - seventhScore) <= 1 && (sixthScore > 1 || seventhScore > 1)) {
    mode = 'hybrid_or_transitional';
    title = 'Hybrid / Multi-Phase Vocational Trajectory';
    rationale = `Balanced dynamic between 6th (service) and 7th (independent trade) factors indicates early-career consolidation within employment transitioning into independent consulting or commercial partnership in later cycles.`;
  } else {
    mode = 'undifferentiated';
    title = 'Flexible / Adaptive Vocational Alignment';
    rationale = `Neither employment nor independent business displays decisive classical dominance; vocational mode adapts fluidly according to prevailing Daśā periods.`;
  }

  const workModeObj: WorkModeOrientation = {
    mode,
    title,
    sixthHouseWeight: sixthWeight,
    seventhHouseWeight: seventhWeight,
    tenthHouseAutonomy: tenthAutonomy,
    rationale,
  };

  const cond: EvaluatedCondition = {
    id: 'cond_work_mode_orientation',
    name: 'Work Mode Orientation (Sevā vs. Vyāpāra vs. Svātantrya)',
    parameter: '6th House (Service) vs 7th House (Trade) vs 10th House Autonomy Balance',
    expected: 'Decisive classical orientation toward either structured employment or independent commerce',
    observed: `${title} (6th House: ${sixthWeight}; 7th House: ${seventhWeight}; 10th Autonomy: ${tenthAutonomy})`,
    status: mode === 'undifferentiated' ? 'insufficient_evidence' : 'satisfied',
    weight: 'qualifying',
    rationale,
  };

  return { evaluatedCondition: cond, workMode: workModeObj };
}

/**
 * 6. Karma-Kāraka Śani (Saturn) Condition
 */
export function evaluateKarmaKarakaSaturnCondition(ctx: PredictionContext): EvaluatedCondition {
  const saturn = ctx.getPlanet('saturn');
  const isKendraOrTrikona = [1, 4, 7, 10, 5, 9].includes(saturn.house);
  const isUpachaya = [3, 6, 11].includes(saturn.house);

  let status: ConditionStatus = 'insufficient_evidence';
  let rationale = '';

  if ((saturn.isExalted || saturn.isOwnSign) && (isKendraOrTrikona || isUpachaya)) {
    status = 'satisfied';
    rationale = `Karma-Kāraka Saturn is exceptionally fortified (${saturn.dignity} in House ${saturn.house}, Ṣaḍbala ${saturn.shadbalaRatio}x), granting deep patience, capacity for grueling sustained labor, and enduring long-term career triumph.`;
  } else if (isUpachaya) {
    status = 'satisfied';
    rationale = `Saturn placed in Upachaya House ${saturn.house} operates according to classical Parāśari doctrine, steadily converting early toil into cumulative professional authority through mature perseverance.`;
  } else if (saturn.isCombust) {
    status = 'contradicted';
    rationale = `Saturn is combust in House ${saturn.house}, creating fatigue, feelings of unappreciated labor, and friction in handling bureaucratic delays.`;
  } else if (saturn.isDebilitated && !ctx.checkNichabhanga('saturn').isNichabhanga) {
    status = 'contradicted';
    rationale = `Saturn is debilitated without Nīchabhaṅga, pointing to challenges in structural organization, vocational discipline, or protracted delays in career consolidation.`;
  } else {
    status = 'partially_supported';
    rationale = `Saturn in House ${saturn.house} holds ${saturn.dignity} dignity with Ṣaḍbala ${saturn.shadbalaRatio}x, providing standard professional endurance.`;
  }

  return {
    id: 'cond_karma_karaka_saturn',
    name: 'Karma-Kāraka Śani (Saturn) Structural Endurance',
    parameter: 'Saturn Dignity, Upachaya/Kendra Placement & Combustion',
    expected: 'Fortified or Upachaya-placed Saturn for resilient vocational stamina',
    observed: `Saturn in H${saturn.house} (${saturn.rashiName}, ${saturn.dignity}, Ṣaḍbala ${saturn.shadbalaRatio}x${saturn.isCombust ? ', COMBUST' : ''})`,
    status,
    weight: 'qualifying',
    rationale,
  };
}

/**
 * 7. Professional Field / Vocational Archetype Determination
 * Grounded in authentic classical graha rulerships over 10th house, 10th lord, Lagna lord, and D10.
 */
export function evaluateVocationalTendencyCondition(ctx: PredictionContext): {
  evaluatedCondition: EvaluatedCondition;
  primaryArchetype: ProfessionalFieldArchetype;
  secondaryArchetypes: ProfessionalFieldArchetype[];
} {
  const h10 = ctx.getHouse(10);
  const tenthLord = ctx.getLordOfHouse(10);
  const lagnaLord = ctx.getLordOfHouse(1);
  const sun = ctx.getPlanet('sun');
  const moon = ctx.getPlanet('moon');
  const mars = ctx.getPlanet('mars');
  const mercury = ctx.getPlanet('mercury');
  const jupiter = ctx.getPlanet('jupiter');
  const venus = ctx.getPlanet('venus');
  const saturn = ctx.getPlanet('saturn');
  const rahu = ctx.getPlanet('rahu');
  const ketu = ctx.getPlanet('ketu');

  // Graha scores for career influence
  const grahaPoints: Record<PlanetId, number> = {
    sun: 0,
    moon: 0,
    mars: 0,
    mercury: 0,
    jupiter: 0,
    venus: 0,
    saturn: 0,
    rahu: 0,
    ketu: 0,
    true_rahu: 0,
    true_ketu: 0,
  };

  // 10th lord identity receives strong weight
  grahaPoints[tenthLord.id] += 3.5;

  // 10th house occupants receive high weight
  h10.occupants.forEach((pId) => {
    grahaPoints[pId] += 3.0;
  });

  // Aspects on 10th house
  h10.aspectsReceived.forEach((a) => {
    grahaPoints[a.planetId] += 1.5;
  });

  // Planets conjoined with 10th lord
  Object.values(ctx.planets).forEach((p) => {
    if (p.house === tenthLord.house && p.id !== tenthLord.id) {
      grahaPoints[p.id] += 1.5;
    }
  });

  // Lagna lord influence on career
  if (lagnaLord.house === 10) {
    grahaPoints[lagnaLord.id] += 2.0;
  }

  // D10 confirmation points
  const d10 = ctx.chart.vargas?.D10;
  if (d10) {
    const d10TenthRashi = ((((d10.lagnaRashi - 1) + 9) % 12) + 1) as RashiNumber;
    const d10TenthLord = RASHIS[d10TenthRashi]?.lord;
    if (d10TenthLord) {
      grahaPoints[d10TenthLord] += 1.5;
    }
  }

  // Archetype definitions grounded in Sārāvalī Ch. 33 and BPHS Ch. 18
  const archetypes: Record<string, ProfessionalFieldArchetype> = {
    sovereign_governance: {
      fieldId: 'sovereign_governance',
      title: 'State Governance, Public Policy & Executive Leadership',
      sanskritName: 'राजकीय-प्रशासन एवं शासनवृत्ति',
      confidence: 'high',
      primaryPlanets: ['sun', 'mars'],
      connectingHouses: [10, 1, 9],
      rationale: `Sun's commanding influence over the 10th house or lord confirms sovereign, statutory, governmental, or senior administrative command (Sārāvalī Ch. 33, v. 2).`,
      subSpecializations: ['Public administration', 'Statutory oversight', 'Civil leadership', 'Corporate executive governance'],
    },
    law_advisory_ethics: {
      fieldId: 'law_advisory_ethics',
      title: 'Judiciary, Law, Higher Counsel & Educational Stewardship',
      sanskritName: 'न्याय-धर्मोपदेश एवं नीति-सचिवालय',
      confidence: 'high',
      primaryPlanets: ['jupiter'],
      connectingHouses: [10, 9, 2],
      rationale: `Jupiter's decisive influence on the 10th house or lord creates preceptor, judicial, legislative, or senior advisory karma (Sārāvalī Ch. 33, v. 5).`,
      subSpecializations: ['Legal advocacy & judiciary', 'Institutional counsel', 'Higher pedagogy & philosophy', 'Trust & ethics management'],
    },
    finance_treasury: {
      fieldId: 'finance_treasury',
      title: 'Financial Stewardship, Banking, Wealth & Treasury Management',
      sanskritName: 'कोष-वित्त एवं सम्पत्ति-प्रबन्धन',
      confidence: 'high',
      primaryPlanets: ['jupiter', 'mercury'],
      connectingHouses: [10, 2, 11],
      rationale: `Combined impact of Jupiter and Mercury with Dhana houses (2nd/11th) and 10th house marks facility with fiscal reserves, accounting, and institutional capital.`,
      subSpecializations: ['Investment architecture', 'Banking & treasury operations', 'Fiscal audits', 'Capital allocation'],
    },
    commerce_analysis: {
      fieldId: 'commerce_analysis',
      title: 'Commerce, Mercantile Trade, Communication & Analytics',
      sanskritName: 'वाणिज्य, लेखा एवं सञ्चार-माध्यम',
      confidence: 'high',
      primaryPlanets: ['mercury'],
      connectingHouses: [10, 7, 3],
      rationale: `Mercury as primary influencer of 10th house confers sharp commercial instincts, analytical intellect, media communication, and negotiation mastery (Sārāvalī Ch. 33, v. 4).`,
      subSpecializations: ['Commercial brokerage', 'Data analysis & systems design', 'Journalism & media publishing', 'Logistical trade'],
    },
    engineering_defense: {
      fieldId: 'engineering_defense',
      title: 'Technical Engineering, Defense, Surgery & Operational Systems',
      sanskritName: 'यन्त्रविद्या, रक्षा एवं साहसिक-शिल्प',
      confidence: 'high',
      primaryPlanets: ['mars', 'saturn'],
      connectingHouses: [10, 6, 3],
      rationale: `Mars presiding over the 10th house or lord confers technical precision, physical courage, engineering acumen, or surgical/defense command (Sārāvalī Ch. 33, v. 3).`,
      subSpecializations: ['Mechanical / civil engineering', 'Defense & enforcement', 'Surgical / precision technical craft', 'Industrial infrastructure'],
    },
    creative_arts_media: {
      fieldId: 'creative_arts_media',
      title: 'Aesthetic Design, Creative Arts, Hospitality & Luxury Enterprise',
      sanskritName: 'कला-शिल्प, सौन्दर्य एवं आतिथ्यवृत्ति',
      confidence: 'high',
      primaryPlanets: ['venus', 'moon'],
      connectingHouses: [10, 3, 5],
      rationale: `Venus presiding over the 10th house or lord produces aesthetic mastery, creative design, architectural harmony, or luxury trade (Sārāvalī Ch. 33, v. 6).`,
      subSpecializations: ['Architectural & product design', 'Performing & visual arts', 'Hospitality & lifestyle curation', 'Diplomatic public relations'],
    },
    public_welfare_health: {
      fieldId: 'public_welfare_health',
      title: 'Healthcare, Healing, Human Relations & Public Care',
      sanskritName: 'चिकित्सा, लोकसेवा एवं परिचर्या',
      confidence: 'high',
      primaryPlanets: ['moon', 'sun', 'mars'],
      connectingHouses: [10, 6, 4],
      rationale: `Moon and Sun connected with 6th and 10th houses govern physiological care, diagnostic medicine, healthcare stewardship, and public welfare.`,
      subSpecializations: ['Clinical healthcare', 'Public welfare administration', 'Nutritional & physiological healing', 'Humanitarian community leadership'],
    },
    organizational_industry: {
      fieldId: 'organizational_industry',
      title: 'Heavy Industry, Organizational Administration & Long-Cycle Labor',
      sanskritName: 'औद्योगिक-श्रम एवं व्यवस्थापकीय-कर्म',
      confidence: 'high',
      primaryPlanets: ['saturn'],
      connectingHouses: [10, 6, 8],
      rationale: `Saturn's strong presence on the 10th house indicates methodical execution, labor organization, structural operations, or enduring foundational industries (Sārāvalī Ch. 33, v. 7).`,
      subSpecializations: ['Supply chain & logistics management', 'Infrastructure development', 'Resource extraction & heavy industry', 'Labor relations & operations'],
    },
    unconventional_research: {
      fieldId: 'unconventional_research',
      title: 'Deep Research, Unconventional Frontiers & Cutting-Edge Investigation',
      sanskritName: 'गूढ-अनुसन्धान एवं नूतन-प्रौद्योगिकी',
      confidence: 'moderate',
      primaryPlanets: ['rahu', 'ketu'],
      connectingHouses: [10, 8, 12],
      rationale: `Nodal prominence (Rahu/Ketu) on the 10th house imparts unconventional methods, cutting-edge technology, foreign domains, or deep investigative specialization.`,
      subSpecializations: ['Cryptography & cyber systems', 'Forensic & occult research', 'Cross-border technology ventures', 'Disruptive innovation'],
    },
    general_management: {
      fieldId: 'general_management',
      title: 'General Operational & Institutional Administration',
      sanskritName: 'सामान्य-प्रबन्धन एवं सार्वभौम-कार्य',
      confidence: 'moderate',
      primaryPlanets: ['mercury', 'saturn'],
      connectingHouses: [10, 1],
      rationale: `Diverse planetary rays influence the 10th house without singular planetary monopoly; indicates versatile executive adaptability across varied industries.`,
      subSpecializations: ['Organizational operations', 'Project coordination', 'Corporate administration', 'Generalist management'],
    },
  };

  // Score candidate archetypes
  const scoredArchetypes: { archetype: ProfessionalFieldArchetype; score: number }[] = [];

  // Sovereign
  scoredArchetypes.push({
    archetype: archetypes.sovereign_governance,
    score: grahaPoints.sun * 1.5 + grahaPoints.mars * 0.7,
  });
  // Law/Advisory
  scoredArchetypes.push({
    archetype: archetypes.law_advisory_ethics,
    score: grahaPoints.jupiter * 1.6,
  });
  // Finance
  scoredArchetypes.push({
    archetype: archetypes.finance_treasury,
    score: grahaPoints.jupiter * 0.9 + grahaPoints.mercury * 0.9,
  });
  // Commerce
  scoredArchetypes.push({
    archetype: archetypes.commerce_analysis,
    score: grahaPoints.mercury * 1.5,
  });
  // Engineering/Defense
  scoredArchetypes.push({
    archetype: archetypes.engineering_defense,
    score: grahaPoints.mars * 1.4 + grahaPoints.saturn * 0.6,
  });
  // Creative
  scoredArchetypes.push({
    archetype: archetypes.creative_arts_media,
    score: grahaPoints.venus * 1.5 + grahaPoints.moon * 0.6,
  });
  // Health
  scoredArchetypes.push({
    archetype: archetypes.public_welfare_health,
    score: grahaPoints.moon * 1.1 + grahaPoints.sun * 0.6 + (h10.occupants.includes('mars') ? 0.8 : 0),
  });
  // Organizational/Industry
  scoredArchetypes.push({
    archetype: archetypes.organizational_industry,
    score: grahaPoints.saturn * 1.5,
  });
  // Unconventional
  scoredArchetypes.push({
    archetype: archetypes.unconventional_research,
    score: grahaPoints.rahu * 1.3 + grahaPoints.ketu * 1.3,
  });

  scoredArchetypes.sort((a, b) => b.score - a.score);

  let primary = scoredArchetypes[0].archetype;
  // If top score is very low, fall back to general management
  if (scoredArchetypes[0].score < 2.5) {
    primary = archetypes.general_management;
  }

  const secondary = scoredArchetypes
    .slice(1, 3)
    .filter((s) => s.score >= 2.0 && s.archetype.fieldId !== primary.fieldId)
    .map((s) => s.archetype);

  const cond: EvaluatedCondition = {
    id: 'cond_vocational_field_archetype',
    name: 'Professional Field / Vocational Archetype (Vṛtti-Lakṣaṇa)',
    parameter: '10th House, 10th Lord & D10 Governing Graha Alignment',
    expected: 'Authentic classical correspondence between influential grahas and vocational domain',
    observed: `Primary: ${primary.title} (${primary.primaryPlanets.map((p) => GRAHA_NAMES[p]?.english || p).join(', ')}); Secondary: [${secondary.map((s) => s.title).join('; ') || 'None'}]`,
    status: primary.fieldId === 'general_management' ? 'partially_supported' : 'satisfied',
    weight: 'mandatory',
    rationale: primary.rationale,
  };

  return {
    evaluatedCondition: cond,
    primaryArchetype: primary,
    secondaryArchetypes: secondary,
  };
}

/**
 * 8. D10 (Daśāṃśa) Varga Confirmation Condition
 */
export function evaluateD10DashamshaCondition(ctx: PredictionContext): {
  evaluatedCondition: EvaluatedCondition;
  d10Details: D10ConfirmationDetails;
} {
  const d10 = ctx.chart.vargas?.D10;
  const d1TenthLord = ctx.getLordOfHouse(10);

  if (!d10) {
    const details: D10ConfirmationDetails = {
      d10LagnaRashi: 'Uncalculated',
      d10LagnaLord: 'Uncalculated',
      d10TenthHouseOccupants: [],
      d10TenthLord: 'Uncalculated',
      d10D1LordPlacement: 'Uncalculated',
      vargaConfirmationStatus: 'neutral_or_unverified',
      shastricNote: 'D10 Daśāṃśa chart data was not computed for this session.',
    };
    return {
      evaluatedCondition: {
        id: 'cond_d10_dashamsha_confirmation',
        name: 'D10 Daśāṃśa Varga Confirmation (Jātaka Pārijāta Ch. 15)',
        parameter: 'D10 Lagna, 10th House, and D1 10th Lord placement in D10',
        expected: 'D1 10th Lord or D10 10th House fortified in Kendra/Trikona of Daśāṃśa',
        observed: 'D10 not calculated',
        status: 'insufficient_evidence',
        weight: 'qualifying',
        rationale: 'Daśāṃśa confirmation could not be audited due to absence of divisional calculation.',
      },
      d10Details: details,
    };
  }

  const d10LagnaRashi = RASHIS[d10.lagnaRashi as RashiNumber]?.name || 'Unknown';
  const d10LagnaLordId = RASHIS[d10.lagnaRashi as RashiNumber]?.lord || 'mars';
  const d10LagnaLordName = GRAHA_NAMES[d10LagnaLordId]?.english || d10LagnaLordId;

  // D10 10th house
  const d10TenthRashiNum = ((((d10.lagnaRashi - 1) + 9) % 12) + 1) as RashiNumber;
  const d10TenthLordId = RASHIS[d10TenthRashiNum]?.lord || 'saturn';
  const d10TenthLordName = GRAHA_NAMES[d10TenthLordId]?.english || d10TenthLordId;

  // Find planets in D10 10th house
  const d10TenthOccupants: string[] = [];
  if (d10.planets) {
    Object.entries(d10.planets).forEach(([pId, pl]) => {
      if (pl.house === 10) {
        d10TenthOccupants.push(GRAHA_NAMES[pId as PlanetId]?.english || pId);
      }
    });
  }

  // Check D1 10th lord's placement in D10
  const d1LordInD10House = d10.planets?.[d1TenthLord.id]?.house || 1;
  const d1LordInD10KendraTrikona = [1, 4, 7, 10, 5, 9].includes(d1LordInD10House);
  const d1LordInD10Dusthana = [6, 8, 12].includes(d1LordInD10House);

  let vargaStatus: D10ConfirmationDetails['vargaConfirmationStatus'] = 'moderately_supported';
  let shastricNote = '';
  let status: ConditionStatus = 'satisfied';

  if (d1LordInD10KendraTrikona && d10TenthOccupants.length > 0) {
    vargaStatus = 'powerfully_reinforced';
    shastricNote = `D1 10th Lord ${d1TenthLord.name} occupies House ${d1LordInD10House} (Kendra/Trikona) in D10, accompanied by active 10th house occupants (${d10TenthOccupants.join(', ')}); decisively confirms public realization of natal career promise (Jātaka Pārijāta Ch. 15).`;
  } else if (d1LordInD10KendraTrikona) {
    vargaStatus = 'moderately_supported';
    shastricNote = `D1 10th Lord ${d1TenthLord.name} holds Kendra/Trikona station in House ${d1LordInD10House} of D10, validating steady career manifestation.`;
  } else if (d1LordInD10Dusthana) {
    vargaStatus = 'varga_friction_indicated';
    status = 'partially_supported';
    shastricNote = `D1 10th Lord ${d1TenthLord.name} is relegated to Dusthāna House ${d1LordInD10House} in D10; indicates that while natal talent exists, executing it in real-world institutional arenas requires overcoming repeated procedural hurdles.`;
  } else {
    vargaStatus = 'moderately_supported';
    shastricNote = `D1 10th Lord sits in House ${d1LordInD10House} of D10 with D10 10th lord ${d10TenthLordName}; confirms standard professional development.`;
  }

  const details: D10ConfirmationDetails = {
    d10LagnaRashi,
    d10LagnaLord: d10LagnaLordName,
    d10TenthHouseOccupants: d10TenthOccupants,
    d10TenthLord: d10TenthLordName,
    d10D1LordPlacement: `House ${d1LordInD10House}`,
    vargaConfirmationStatus: vargaStatus,
    shastricNote,
  };

  const cond: EvaluatedCondition = {
    id: 'cond_d10_dashamsha_confirmation',
    name: 'D10 Daśāṃśa Varga Confirmation (Jātaka Pārijāta Ch. 15)',
    parameter: 'D10 Lagna, 10th House, and D1 10th Lord placement in D10',
    expected: 'D1 10th Lord or D10 10th House fortified in Kendra/Trikona of Daśāṃśa',
    observed: `D10 Lagna: ${d10LagnaRashi}; D1 10th Lord in D10 H${d1LordInD10House}; Status: ${vargaStatus.replace(/_/g, ' ')}`,
    status,
    weight: 'qualifying',
    rationale: shastricNote,
  };

  return { evaluatedCondition: cond, d10Details: details };
}

/**
 * 9. Career Timing Arc (Vimshottari Daśā Activation)
 * Separates natal capacity from activation; no fabricated calendar ages.
 */
export function evaluateCareerTimingCondition(ctx: PredictionContext): {
  evaluatedCondition: EvaluatedCondition;
  timingArc: CareerTimingArc;
} {
  const mdLord = ctx.getPlanet(ctx.activeMahadasha);
  const adLord = ctx.getPlanet(ctx.activeAntardasha);
  const tenthLord = ctx.getLordOfHouse(10);
  const h10 = ctx.getHouse(10);

  const mdRulesOrOccupies10 = mdLord.housesOwned.includes(10) || mdLord.house === 10;
  const adRulesOrOccupies10 = adLord.housesOwned.includes(10) || adLord.house === 10;
  const mdIsYogakaraka = ctx.verifiedYogaNames.has('raja') || mdLord.housesOwned.some((h) => [1, 5, 9].includes(h));
  const mdInDusthana = [6, 8, 12].includes(mdLord.house);

  let isCareerDashaActive = false;
  let dashaActivationType: CareerTimingArc['dashaActivationType'] = 'routine_maintenance';
  let mdAssessment = '';
  let adAssessment = '';
  const prospectiveTriggers: string[] = [];

  if (mdRulesOrOccupies10) {
    isCareerDashaActive = true;
    dashaActivationType = 'prime_consolidation';
    mdAssessment = `Current Mahādaśā of ${mdLord.name} directly governs/occupies the 10th house; represents a major focal period for vocational consolidation, career milestones, and public identity.`;
  } else if (mdIsYogakaraka && !mdInDusthana) {
    isCareerDashaActive = true;
    dashaActivationType = 'moderate_advancement';
    mdAssessment = `Current Mahādaśā of ${mdLord.name} activates auspicious trinal/angular houses, indirectly stimulating professional advancement and institutional status.`;
  } else if (mdInDusthana) {
    dashaActivationType = 'transitional_friction';
    mdAssessment = `Current Mahādaśā of ${mdLord.name} operates from Dusthāna House ${mdLord.house}; vocational progress is marked by restructuring, intensive problem-solving, or pivots rather than effortless promotion.`;
  } else {
    dashaActivationType = 'routine_maintenance';
    mdAssessment = `Current Mahādaśā of ${mdLord.name} operates in standard vocational baseline; major professional shifts depend on incoming Antardaśā sub-cycles.`;
  }

  if (adRulesOrOccupies10) {
    adAssessment = `Active Antardaśā of ${adLord.name} triggers the 10th house directly, creating immediate operational focus on professional responsibilities.`;
  } else {
    adAssessment = `Active Antardaśā of ${adLord.name} (House ${adLord.house}) modulates daily professional rhythm according to its house portfolio.`;
  }

  // Prospective timing triggers without fabricating exact calendar years
  prospectiveTriggers.push(`Sub-periods (Antardaśās) of 10th Lord ${tenthLord.name} and 10th house occupants (${h10.occupants.map((o) => GRAHA_NAMES[o]?.english || o).join(', ') || 'dispositor'}) activate sharp career milestones.`);
  prospectiveTriggers.push(`Major transits (Gocara) of Jupiter over natal 10th house (${h10.rashiName}) or 10th lord expand professional purview.`);
  prospectiveTriggers.push(`Saturn's transit across 10th house or natal 10th lord enforces institutional accountability, heavy duty, and karmic harvest.`);

  const timingArc: CareerTimingArc = {
    activeMahadashaAssessment: mdAssessment,
    activeAntardashaAssessment: adAssessment,
    isCareerDashaActive,
    dashaActivationType,
    prospectiveTriggers,
    timingEpistemologicalCaveat: 'Vimshottari timing marks symbolic maturation and karmic readiness, not calendar determinism. Natal promise sets the ceiling; dasha governs the seasonal unfolding.',
  };

  const cond: EvaluatedCondition = {
    id: 'cond_career_timing_dasha',
    name: 'Career Activation Timing (Vimśottarī Daśā)',
    parameter: 'Active Mahādaśā & Antardaśā lordship and connection to 10th house',
    expected: 'Active Daśā connecting with 10th lord, 10th house occupants, or Raja Yogas',
    observed: `MD: ${mdLord.name} (H${mdLord.house}); AD: ${adLord.name} (H${adLord.house}); Career Active: ${isCareerDashaActive ? 'YES' : 'INDIRECT'}`,
    status: isCareerDashaActive ? 'satisfied' : 'partially_supported',
    weight: 'qualifying',
    rationale: mdAssessment,
  };

  return { evaluatedCondition: cond, timingArc };
}

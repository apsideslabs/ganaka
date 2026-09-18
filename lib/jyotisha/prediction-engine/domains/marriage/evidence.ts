/**
 * Gaṇaka — Domain 6: Marriage Evidence Stack & Contradiction Resolution (Phase 6)
 * 
 * Strict Evidence Stack:
 * Relevant Factors → Classical Conditions → Supporting vs Contradicting Evidence
 * → Qualitative Evidence States → Classical Tensions & Shastric Resolutions
 */

import { PredictionContext, NATURAL_BENEFICS, NATURAL_MALEFICS } from '../../context';
import { EvaluatedCondition, PredictionEvidence, QualitativeEvidenceState } from '../../types';
import {
  MarriagePromiseCategory,
  SpousalProfile,
  KujaDoshaAnalysis,
  D9NavamshaConfirmation,
  JaiminiMarriageFactors,
  MarriageTimingArc,
  MarriageObstacle,
  MarriageTension,
} from './types';

export interface EvaluatedMarriageEvidenceStack {
  domainState: QualitativeEvidenceState;
  marriagePromise: MarriagePromiseCategory;
  supportingEvidence: PredictionEvidence[];
  contradictingEvidence: PredictionEvidence[];
  obstacles: MarriageObstacle[];
  tensions: MarriageTension[];
  unresolvedUncertainties: string[];
}

/**
 * Builds the Marriage Evidence Stack, separating supporting and counteracting evidence,
 * evaluating qualitative evidence states, and resolving chart-specific classical marital tensions.
 */
export function buildMarriageEvidenceStack(
  ctx: PredictionContext,
  allConditions: EvaluatedCondition[],
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
): EvaluatedMarriageEvidenceStack {
  const supportingEvidence: PredictionEvidence[] = [];
  const contradictingEvidence: PredictionEvidence[] = [];

  allConditions.forEach((c) => {
    if (c.status === 'satisfied') {
      supportingEvidence.push({
        parameter: c.parameter,
        observedFact: c.observed,
        shastricRationale: c.rationale,
        polarity: 'supporting',
        weight: c.weight === 'mandatory' ? 'decisive' : 'strong',
      });
    } else if (c.status === 'contradicted') {
      contradictingEvidence.push({
        parameter: c.parameter,
        observedFact: c.observed,
        shastricRationale: c.rationale,
        polarity: 'counteracting',
        weight: c.weight === 'mandatory' ? 'decisive' : 'strong',
      });
    }
  });

  const seventhLord = ctx.getLordOfHouse(7);
  const venus = ctx.getPlanet('venus');
  const h7 = ctx.getHouse(7);
  const savBindus = h7.savBindus;

  // 1. Determine Marriage Promise Category
  let marriagePromise: MarriagePromiseCategory = 'stable_partnership_through_effort';

  const isD1LordFortified =
    [1, 4, 7, 10, 5, 9].includes(seventhLord.house) &&
    !seventhLord.isCombust &&
    !seventhLord.isDebilitated;

  const isD9Reinforced =
    d9Confirmation.vargaConfirmationStatus === 'powerfully_reinforced' ||
    d9Confirmation.vargaConfirmationStatus === 'moderately_supported';

  const isJaiminiEnduring =
    jaiminiFactors.ulStabilityEvaluation === 'fortified_and_enduring' ||
    jaiminiFactors.ulStabilityEvaluation === 'harmonious_with_compromise';

  if (isD1LordFortified && isD9Reinforced && isJaiminiEnduring && !kujaAnalysis.isFormed && savBindus >= 28) {
    marriagePromise = 'covenant_enduring_and_harmonious';
  } else if (isD1LordFortified && isD9Reinforced && savBindus >= 26) {
    marriagePromise = 'auspicious_union_with_growth';
  } else if (delayVsDenial.isDelayed && delayVsDenial.mitigatingFactors.length > 0) {
    marriagePromise = 'prolonged_delay_or_mature_union';
  } else if ([6, 8, 12].includes(seventhLord.house) || d9Confirmation.vargaConfirmationStatus === 'varga_friction_indicated') {
    marriagePromise = 'relational_friction_requiring_adaptation';
  } else if (kujaAnalysis.severityGrade === 'intense_unmitigated' || (seventhLord.isCombust && seventhLord.isDebilitated)) {
    marriagePromise = 'complex_karmic_covenant';
  } else {
    marriagePromise = 'stable_partnership_through_effort';
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

  // 3. Marriage Obstacles & Classical Mitigations
  const obstacles: MarriageObstacle[] = [];

  if (seventhLord.isCombust) {
    obstacles.push({
      obstacleType: 'Astaṅgata Saptamādhipati (Solar Combustion of 7th Lord)',
      planetaryRoot: `7th Lord ${seventhLord.name} is combust within solar orb in House ${seventhLord.house}`,
      manifestation: 'Tendency for one partner’s identity to overshadow the other; ego friction over decision-making or unexpressed vulnerabilities.',
      shastricMitigation: 'Conscious cultivation of mutual validation; avoiding unilateral unilateral domestic assertions and respecting personal creative boundaries.',
    });
  }

  if ([6, 8, 12].includes(seventhLord.house)) {
    obstacles.push({
      obstacleType: `Dusthāna Saptamādhipati (${seventhLord.house}th House Placement)`,
      planetaryRoot: `7th Lord ${seventhLord.name} situated in House ${seventhLord.house}`,
      manifestation: seventhLord.house === 6
        ? 'Relational stress sparked by daily micro-arguments, conflicting chore routines, or health concerns.'
        : seventhLord.house === 8
        ? 'Sudden psychological turbulence, undisclosed grievances, or friction with in-laws.'
        : 'Feelings of emotional distance, geographical separations, or high domestic expenditures.',
      shastricMitigation: 'Scheduled transparent dialogue; maintaining clear emotional boundaries and mutual respect for individual quietude.',
    });
  }

  if (venus.isDebilitated && !ctx.checkNichabhanga('venus').isNichabhanga) {
    obstacles.push({
      obstacleType: 'Nīcha Śukra (Debilitated Venus)',
      planetaryRoot: `Venus placed in Virgo (debilitation) without confirmed Nīchabhaṅga`,
      manifestation: 'Hypercritical expectations of partner, difficulty savoring domestic affection without analyzing flaws, or feeling emotionally unreciprocated.',
      shastricMitigation: 'Practicing radical unconditional acceptance; focusing on emotional gratitude rather than aesthetic perfection.',
    });
  }

  if (kujaAnalysis.isFormed && !kujaAnalysis.isFullyCancelled) {
    obstacles.push({
      obstacleType: 'Kuja Doṣa (Martial Fire in Marital Sthāna)',
      planetaryRoot: `Mars occupying House ${kujaAnalysis.marsPlacementHouse}`,
      manifestation: 'Impatience, sudden flashes of irritability, or reactive communication under stress.',
      shastricMitigation: 'Channeling physical energy into sports/fitness; allowing 24-hour cooling-off intervals during conflicts per classical counseling.',
    });
  }

  if (savBindus < 24) {
    obstacles.push({
      obstacleType: 'Deficient Saptama Bhāva Aṣṭakavarga Reservoir',
      planetaryRoot: `7th House SAV Bindus at ${savBindus} (<24 threshold)`,
      manifestation: 'Domestic environment vulnerable to exterior stress and social fatigue; partnership drains faster when overloaded.',
      shastricMitigation: 'Protecting domestic privacy; avoiding hosting unhelpful exterior influences and prioritizing shared rest.',
    });
  }

  // 4. Classical Marriage Tensions
  const tensions: MarriageTension[] = [];

  // Tension 1: D1 Promising vs D9 Friction
  if (
    [1, 4, 7, 10, 5, 9].includes(seventhLord.house) &&
    d9Confirmation.vargaConfirmationStatus === 'varga_friction_indicated'
  ) {
    tensions.push({
      factorA: `D1 7th Lord ${seventhLord.name} favorably situated in House ${seventhLord.house}`,
      factorB: `D9 Navāṃśa encounters friction (D1 7th lord in D9 House ${d9Confirmation.d1SeventhLordInD9.houseFromD9Lagna})`,
      tensionDescription: 'The external courtship and social bond present an auspicious face, but internal domestic life reveals subtle differences in dharmic values or emotional expectations.',
      shastricResolution: 'Classical Jyotiṣa teaches that D1 governs the social occasion while D9 governs the inner soul-bond; partners must cultivate shared spiritual practices and emotional forbearance.',
    });
  }

  // Tension 2: Kuja Doṣa vs Jupiterian Counter-Aspect
  if (kujaAnalysis.isFormed && kujaAnalysis.cancellationFactors.some((c) => c.includes('Guru') || c.includes('Jupiter'))) {
    tensions.push({
      factorA: `Mars forms Kuja Doṣa in House ${kujaAnalysis.marsPlacementHouse}`,
      factorB: `Jupiter aspects or conjoins Mars/7th house, infusing dharmic grace`,
      tensionDescription: 'A dynamic tension between fiery, impulsive reactions (Maṅgala) and wise, forgiving moral judgment (Guru).',
      shastricResolution: 'When martial impulses surge, Jupiterian higher principles provide the bridge; conflicts are swiftly resolved through dignified humor and moral maturity.',
    });
  }

  // Tension 3: Saturn Delay (Vilamba) vs Chronological Expectations
  if (delayVsDenial.isDelayed) {
    tensions.push({
      factorA: `Saturn influences 7th house/lord, decelerating marriage timing toward chronological maturity`,
      factorB: `Native or societal expectations seek earlier partnership crystallization`,
      tensionDescription: 'An inner or social impatience confronting Saturn’s cosmic mandate for emotional sobriety and character consolidation.',
      shastricResolution: 'Vilamba is not Vināśa (विलम्बो न तु विनाशः). Saturn withholds hasty unions to forge unshakeable adult discernment; marriages finalized after age 28–30 exhibit exceptional fidelity.',
    });
  }

  // Tension 4: High Rasi Promise vs Low SAV
  if (isD1LordFortified && savBindus < 26) {
    tensions.push({
      factorA: `7th Lord ${seventhLord.name} holds high dignity (${seventhLord.dignity})`,
      factorB: `7th House SAV bindus are deficient at ${savBindus} bindus`,
      tensionDescription: 'Sincere devotion and high romantic ideals meet physical or logistical fatigue inside the domestic sphere.',
      shastricResolution: 'Rather than relying on institutional ease, the couple must actively structure intentional routines and safeguard domestic energy from external drainage.',
    });
  }

  // Tension 5: Jaimini AL vs A7 Disposition
  if (jaiminiFactors.arudhaLagnaVsDaraPada.mutualRelationship === 'shadashtaka_6_8') {
    tensions.push({
      factorA: `Arūḍha Lagna (AL) in ${jaiminiFactors.arudhaLagnaVsDaraPada.alRashi}`,
      factorB: `Dāra Pada (A7) in ${jaiminiFactors.arudhaLagnaVsDaraPada.a7Rashi} (Shaḍaṣṭaka 6–8 disposition)`,
      tensionDescription: 'The external worldly image, professional circle, or social style of the native contrasts with that of the spouse.',
      shastricResolution: 'Honoring distinct professional reputations and personal spaces rather than forcing an identical public persona resolves the Shaḍaṣṭaka friction into complementary mutual admiration.',
    });
  }

  // 5. Unresolved Uncertainties
  const unresolvedUncertainties: string[] = [];
  if (h7.occupants.length === 0 && h7.aspectsReceived.length === 0) {
    unresolvedUncertainties.push('7th house is unoccupied and un-aspected in D1; spousal character is mediated primarily through its lord and Dārakāraka.');
  }
  if (!timingArc.isMarriageDashaActive) {
    unresolvedUncertainties.push(`Current Vimshottari Daśā (${timingArc.activeMahadashaAssessment}) does not emphasize marital triggers; precise timing window depends on upcoming sub-periods.`);
  }

  return {
    domainState,
    marriagePromise,
    supportingEvidence,
    contradictingEvidence,
    obstacles,
    tensions,
    unresolvedUncertainties,
  };
}

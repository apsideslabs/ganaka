/**
 * Gaṇaka — Deterministic Rule & Condition Evaluation Pipeline (Phase 1)
 * 
 * Implements:
 * 1. Chart Data → Relevant Conditions
 * 2. 5-State Condition Evaluation (satisfied | partially_supported | contradicted | absent | insufficient_evidence)
 * 3. Evidence collection with polarity and classical weight
 * 4. Deterministic Rule evaluation without text interpolation
 * 5. Strictly chart-dependent domain synthesis (refuses to force predictions on insufficient evidence)
 */

import { PlanetId } from '../types';
import { PredictionContext, NATURAL_BENEFICS, NATURAL_MALEFICS } from './context';
import { evaluateConstitutionDomain } from './domains/constitution';
import { evaluateCareerDomain } from './domains/career';
import { evaluateMarriageDomain } from './domains/marriage';
import { evaluateProgenyDomain } from './domains/progeny';
import {
  ConditionStatus,
  EvaluatedCondition,
  PredictionEvidence,
  RuleEvaluationResult,
  DomainPredictionResult,
  DomainPredictionStatus,
} from './types';

// ==========================================
// 1. Condition Evaluators
// ==========================================

export function evaluateLordPlacementCondition(
  ctx: PredictionContext,
  houseNum: number,
  expectedHouses: number[],
  name: string
): EvaluatedCondition {
  const lord = ctx.getLordOfHouse(houseNum);
  const actualHouse = lord.house;
  const isKendraTrikona = expectedHouses.includes(actualHouse);
  const isDusthana = [6, 8, 12].includes(actualHouse);

  let status: ConditionStatus = 'insufficient_evidence';
  let rationale = '';

  if (isKendraTrikona) {
    status = 'satisfied';
    rationale = `${lord.name} (Lord of H${houseNum}) is placed in auspicious House ${actualHouse} (${actualHouse === 1 || actualHouse === 4 || actualHouse === 7 || actualHouse === 10 ? 'Kendra' : 'Trikona'}), providing positional strength per Parāśara Horā principles.`;
  } else if (isDusthana) {
    status = 'contradicted';
    rationale = `${lord.name} (Lord of H${houseNum}) is placed in Dusthāna House ${actualHouse}, draining direct bhāva manifestation and introducing constitutional/circumstantial friction.`;
  } else {
    status = 'partially_supported';
    rationale = `${lord.name} (Lord of H${houseNum}) is placed in neutral/Upachaya House ${actualHouse}.`;
  }

  return {
    id: `cond_lord_placement_h${houseNum}`,
    name,
    parameter: `house_${houseNum}_lord_placement`,
    expected: `House placement in [${expectedHouses.join(', ')}]`,
    observed: `${lord.name} in House ${actualHouse} (${lord.rashiName})`,
    status,
    rationale,
    weight: 'mandatory',
  };
}

export function evaluateLordDignityCondition(
  ctx: PredictionContext,
  houseNum: number,
  name: string
): EvaluatedCondition {
  const lord = ctx.getLordOfHouse(houseNum);
  let status: ConditionStatus = 'insufficient_evidence';
  let rationale = '';

  if (lord.isExalted || lord.isOwnSign || lord.isMoolatrikona) {
    status = 'satisfied';
    rationale = `${lord.name} holds superior dignity (${lord.dignity}), bestowing high intrinsic capacity to execute house portfolios.`;
  } else if (lord.isFriendly) {
    status = 'partially_supported';
    rationale = `${lord.name} resides in friendly sign (${lord.dignity}), yielding supportive but non-dominant vitality.`;
  } else if (lord.isDebilitated) {
    const nb = ctx.checkNichabhanga(lord.id);
    if (nb.isNichabhanga) {
      status = 'partially_supported';
      rationale = `${lord.name} is debilitated in ${lord.rashiName}, but classical Nīchabhaṅga cancellation applies: ${nb.reasons.join('; ')}.`;
    } else {
      status = 'contradicted';
      rationale = `${lord.name} suffers uncancelled debilitation in ${lord.rashiName}, directly contradicting classical strength requirements.`;
    }
  } else if (lord.isCombust) {
    status = 'contradicted';
    rationale = `${lord.name} is Astaṅgata (combust within solar orb), diminishing solar ray transmission for house affairs.`;
  } else {
    status = 'insufficient_evidence';
    rationale = `${lord.name} exhibits neutral dignity (${lord.dignity}) without singular dignity advantage or crippling debility.`;
  }

  return {
    id: `cond_lord_dignity_h${houseNum}`,
    name,
    parameter: `house_${houseNum}_lord_dignity`,
    expected: 'Exalted, Own Sign, Moolatrikona, or Dignified Friend',
    observed: `${lord.name}: ${lord.dignity}${lord.isCombust ? ', Combust' : ''}${lord.isRetrograde ? ', Retrograde' : ''}`,
    status,
    rationale,
    weight: 'mandatory',
  };
}

export function evaluateHouseSAVCondition(
  ctx: PredictionContext,
  houseNum: number,
  name: string
): EvaluatedCondition {
  const house = ctx.getHouse(houseNum);
  const bindus = house.savBindus;

  let status: ConditionStatus = 'insufficient_evidence';
  let rationale = '';

  if (bindus >= 32) {
    status = 'satisfied';
    rationale = `House ${houseNum} possesses ${bindus} SAV bindus (exceeding standard 28 threshold), providing abundant praṇic reservoir and effortless manifestation.`;
  } else if (bindus >= 28) {
    status = 'partially_supported';
    rationale = `House ${houseNum} possesses ${bindus} SAV bindus, meeting standard baseline sufficiency.`;
  } else if (bindus >= 24) {
    status = 'contradicted';
    rationale = `House ${houseNum} has only ${bindus} SAV bindus, falling below standard 28 baseline and indicating moderate friction in sustaining results.`;
  } else {
    // Critical deficit (e.g. 18 SAV) — NEVER called high or positive!
    status = 'contradicted';
    rationale = `House ${houseNum} has a severe deficit of ${bindus} SAV bindus (<24 critical threshold). This indicates depleted Aṣṭakavarga vitality, creating structural vulnerability.`;
  }

  return {
    id: `cond_sav_h${houseNum}`,
    name,
    parameter: `house_${houseNum}_sav_bindus`,
    expected: '>= 28 Bindus (Standard baseline) or >= 32 (Abundant)',
    observed: `${bindus} Bindus (${house.savClassification} classification)`,
    status,
    rationale,
    weight: 'qualifying',
  };
}

export function evaluateBeneficAspectOrOccupancy(
  ctx: PredictionContext,
  houseNum: number,
  name: string
): EvaluatedCondition {
  const house = ctx.getHouse(houseNum);
  const beneficOccupants = house.beneficOccupants;
  const beneficAspects = house.aspectsReceived.filter((a) => a.isBenefic);
  const maleficOccupants = house.maleficOccupants;
  const maleficAspects = house.aspectsReceived.filter((a) => !a.isBenefic);

  let status: ConditionStatus = 'absent';
  let rationale = '';

  if (beneficOccupants.length > 0 || beneficAspects.length > 0) {
    const bNames = [
      ...beneficOccupants.map((b) => ctx.planets[b].name + ' (occupant)'),
      ...beneficAspects.map((a) => ctx.planets[a.planetId].name + ' (aspect)'),
    ];
    if (maleficOccupants.length === 0 && maleficAspects.length === 0) {
      status = 'satisfied';
      rationale = `House ${houseNum} receives unhindered Śubha-dṛṣṭi / Śubha-yoga from ${bNames.join(', ')}.`;
    } else {
      status = 'partially_supported';
      rationale = `House ${houseNum} receives benefic support (${bNames.join(', ')}), but also encounters malefic aspects (${maleficAspects.map((m) => ctx.planets[m.planetId].name).join(', ')}).`;
    }
  } else if (maleficOccupants.length > 0 || maleficAspects.length > 0) {
    const mNames = [
      ...maleficOccupants.map((m) => ctx.planets[m].name + ' (occupant)'),
      ...maleficAspects.map((a) => ctx.planets[a.planetId].name + ' (aspect)'),
    ];
    status = 'contradicted';
    rationale = `House ${houseNum} receives zero benefic support and suffers malefic affliction from ${mNames.join(', ')}.`;
  } else {
    status = 'absent';
    rationale = `House ${houseNum} is Śūnya (unoccupied) and receives no direct major aspects from natural benefics or malefics.`;
  }

  return {
    id: `cond_benefic_h${houseNum}`,
    name,
    parameter: `house_${houseNum}_benefic_influence`,
    expected: 'Presence or direct dṛṣṭi from Jupiter, Venus, or unafflicted Mercury/Moon',
    observed: house.occupants.length > 0
      ? `Occupants: [${house.occupants.map((p) => ctx.planets[p].name).join(', ')}], Aspects: [${house.aspectsReceived.map((a) => ctx.planets[a.planetId].name).join(', ')}]`
      : `Unoccupied. Aspects: [${house.aspectsReceived.map((a) => ctx.planets[a.planetId].name).join(', ') || 'None'}]`,
    status,
    rationale,
    weight: 'qualifying',
  };
}

export function evaluateMarsBodilyMarkCondition(
  ctx: PredictionContext,
  name: string
): EvaluatedCondition {
  // Classical rule (BPHS Ch. 11 & Jātaka Pārijāta Ch. 6):
  // Mars produces scars/moles on head/face ONLY IF Mars occupies or aspects House 1 or House 2 with malefic dignity.
  const h1 = ctx.getHouse(1);
  const h2 = ctx.getHouse(2);
  const mars = ctx.planets.mars;

  const marsInH1 = h1.occupants.includes('mars');
  const marsInH2 = h2.occupants.includes('mars');
  const marsAspectsH1 = h1.aspectsReceived.some((a) => a.planetId === 'mars');
  const marsAspectsH2 = h2.aspectsReceived.some((a) => a.planetId === 'mars');

  const reachesFaceOrHead = marsInH1 || marsInH2 || marsAspectsH1 || marsAspectsH2;

  let status: ConditionStatus = 'absent';
  let rationale = '';

  if (reachesFaceOrHead) {
    if (mars.isDebilitated || mars.isEnemy || !ctx.isLordInKendraOrTrikona(1)) {
      status = 'satisfied';
      rationale = `Mars directly influences House ${marsInH1 ? '1' : marsInH2 ? '2' : '1/2 via aspect'} with aggressive/enemy dignity (${mars.dignity}), satisfying classical bodily scar indication.`;
    } else {
      status = 'partially_supported';
      rationale = `Mars influences the ascendant but possesses dignified status (${mars.dignity}), indicating athletic vitality rather than pronounced scarring.`;
    }
  } else {
    // Condition is ABSENT! Mars in chart does NOT automatically predict scars!
    status = 'absent';
    rationale = `Mars (placed in House ${mars.house} in ${mars.rashiName}) has NO direct conjunction or classical aspect with House 1 (Lagna) or House 2. Classical scar conditions are strictly absent.`;
  }

  return {
    id: 'cond_mars_bodily_mark',
    name,
    parameter: 'mars_lagna_direct_contact',
    expected: 'Mars occupying or aspecting House 1 (Head) or House 2 (Face)',
    observed: `Mars in House ${mars.house} (${mars.rashiName}). Contact with H1/H2: ${reachesFaceOrHead ? 'Present' : 'Absent'}`,
    status,
    rationale,
    weight: 'qualifying',
  };
}

export function evaluateKarakaStrength(
  ctx: PredictionContext,
  karakaId: PlanetId,
  name: string
): EvaluatedCondition {
  const karaka = ctx.getPlanet(karakaId);
  let status: ConditionStatus = 'insufficient_evidence';
  let rationale = '';

  if (karaka.shadbalaRatio >= 1.15 && (karaka.isExalted || karaka.isOwnSign || karaka.isFriendly)) {
    status = 'satisfied';
    rationale = `${karaka.name} is robustly fortified with ${karaka.shadbalaRupas} Rūpas (${karaka.shadbalaRatio}x ratio) and favorable dignity (${karaka.dignity}).`;
  } else if (karaka.shadbalaRatio >= 0.95 && !karaka.isDebilitated && !karaka.isCombust) {
    status = 'partially_supported';
    rationale = `${karaka.name} possesses adequate operational strength (${karaka.shadbalaRatio}x ratio) without acute affliction.`;
  } else if (karaka.isDebilitated || karaka.isCombust || karaka.shadbalaRatio < 0.85) {
    status = 'contradicted';
    rationale = `${karaka.name} is compromised (${karaka.isCombust ? 'Combust, ' : ''}${karaka.isDebilitated ? 'Debilitated, ' : ''}${karaka.shadbalaRatio}x ratio), providing weak foundational kārakatva.`;
  } else {
    status = 'insufficient_evidence';
    rationale = `${karaka.name} shows borderline indicators (${karaka.shadbalaRatio}x ratio) requiring cross-varga confirmation.`;
  }

  return {
    id: `cond_karaka_${karakaId}`,
    name,
    parameter: `karaka_${karakaId}_potency`,
    expected: '>= 1.0x Shadbala ratio and absence of combustion/debility',
    observed: `${karaka.name}: ${karaka.shadbalaRatio}x (${karaka.shadbalaRupas} Rūpas), ${karaka.dignity}${karaka.isCombust ? ', Combust' : ''}`,
    status,
    rationale,
    weight: 'qualifying',
  };
}

// ==========================================
// 2. Rule Evaluation
// ==========================================

export function evaluateRuleFromConditions(
  ruleId: string,
  ruleTitle: string,
  citation: { sourceText: string; chapterAndVerse: string; sanskritShloka?: string; englishTranslation?: string },
  conditions: EvaluatedCondition[],
  shastricVerdictIfSatisfied: string,
  shastricVerdictIfContradicted: string
): RuleEvaluationResult {
  const mandatoryConds = conditions.filter((c) => c.weight === 'mandatory');
  const qualifyingConds = conditions.filter((c) => c.weight === 'qualifying');

  const hasContradiction = conditions.some((c) => c.status === 'contradicted');
  const allMandatorySatisfied = mandatoryConds.every((c) => c.status === 'satisfied');
  const mandatoryPartiallySupported = mandatoryConds.some((c) => c.status === 'partially_supported' || c.status === 'satisfied') && !hasContradiction;

  // Build evidence list
  const evidence: PredictionEvidence[] = conditions.map((c) => ({
    parameter: c.parameter,
    observedFact: c.observed,
    shastricRationale: c.rationale,
    polarity: c.status === 'satisfied' ? 'supporting' : c.status === 'contradicted' ? 'counteracting' : 'neutral',
    weight: c.weight === 'mandatory' ? 'decisive' : 'moderate',
  }));

  const contradictions: string[] = conditions
    .filter((c) => c.status === 'contradicted')
    .map((c) => `${c.name}: ${c.rationale}`);

  let status: ConditionStatus = 'insufficient_evidence';
  let isTriggered = false;
  let verdict = '';
  let confidence: 'high' | 'moderate' | 'low' | 'none' = 'none';

  if (hasContradiction) {
    status = 'contradicted';
    isTriggered = false;
    verdict = shastricVerdictIfContradicted;
    confidence = 'high'; // high confidence in the contradictory / limiting finding
  } else if (allMandatorySatisfied) {
    const qualifyingScore = qualifyingConds.filter((c) => c.status === 'satisfied').length;
    status = 'satisfied';
    isTriggered = true;
    verdict = shastricVerdictIfSatisfied;
    confidence = qualifyingScore >= 1 ? 'high' : 'moderate';
  } else if (mandatoryPartiallySupported) {
    status = 'partially_supported';
    isTriggered = true;
    verdict = `${shastricVerdictIfSatisfied} (Manifesting with moderate or conditional intensity due to partial planetary alignment).`;
    confidence = 'moderate';
  } else if (conditions.every((c) => c.status === 'absent')) {
    status = 'absent';
    isTriggered = false;
    verdict = 'Classical rule conditions are not present in this horoscope.';
    confidence = 'none';
  } else {
    status = 'insufficient_evidence';
    isTriggered = false;
    verdict = 'Available chart evidence does not meet the deterministic threshold required to activate this classical rule.';
    confidence = 'none';
  }

  return {
    ruleId,
    ruleTitle,
    citation,
    status,
    isTriggered,
    conditionsEvaluated: conditions,
    evidence,
    contradictions,
    shastricVerdict: verdict,
    confidence,
  };
}

// ==========================================
// 3. Domain Predictor: Lagna & Physical Constitution (Domain 1)
// ==========================================

export function evaluateDomain1LagnaConstitution(ctx: PredictionContext): DomainPredictionResult {
  const h1 = ctx.getHouse(1);
  const lagnaLord = ctx.getLordOfHouse(1);
  const sun = ctx.getPlanet('sun');

  // Condition 1: Lagna Lord in Kendra/Trikona
  const condPlacement = evaluateLordPlacementCondition(ctx, 1, [1, 4, 7, 10, 5, 9], 'Lagneśa Kendra/Trikona Placement');
  
  // Condition 2: Lagna Lord Dignity
  const condDignity = evaluateLordDignityCondition(ctx, 1, 'Lagneśa Dignity & Combustion State');

  // Condition 3: House 1 SAV Bindus
  const condSAV = evaluateHouseSAVCondition(ctx, 1, 'Lagna Bhāva SAV Praṇic Capacity');

  // Condition 4: Benefic Aspect or Occupancy on Lagna
  const condBenefic = evaluateBeneficAspectOrOccupancy(ctx, 1, 'Lagna Śubha-Dṛṣṭi & Association');

  // Condition 5: Solar Vitality (Naisargika Atmakaraka)
  const condSun = evaluateKarakaStrength(ctx, 'sun', 'Sūrya Vitality & Prāna Radiance');

  // Condition 6: Mars Facial Mark / Scar condition (strictly evaluated!)
  const condMarsScar = evaluateMarsBodilyMarkCondition(ctx, 'Maṅgala Lagna/Mukha Scarring Vector');

  const allConditions = [condPlacement, condDignity, condSAV, condBenefic, condSun, condMarsScar];

  // Rule 1: BPHS Ch. 11, v. 2-4 — Deha-Saukhya & Longevity
  const ruleVitality = evaluateRuleFromConditions(
    'bphs_lagna_vitality',
    'Deha-Saukhya & Constitutional Stamina (BPHS Ch. 11)',
    {
      sourceText: 'Brihat Parashara Hora Shastra',
      chapterAndVerse: 'BPHS Ch. 11, v. 2-4',
      sanskritShloka: 'लग्नेशे केन्द्रगे वापि त्रिकोणे वा शुभान्विते। दीर्घायुर्बलवांश्चैव रूपवांश्च नरः सुखी॥',
      englishTranslation: 'If the lord of Lagna occupies a Kendra or Trikona endowed with strength and benefic association, the native enjoys enduring longevity, physical radiance, and constitutional stamina.',
    },
    [condPlacement, condDignity, condSAV, condBenefic],
    `Lagneśa ${lagnaLord.name} placed in House ${lagnaLord.house} (${lagnaLord.rashiName}) confirms strong physical resilience (Deha-saukhya) and robust constitutional stamina supported by ${h1.savBindus} SAV bindus in the ascendant.`,
    `Constitutional stamina is structurally sensitive: Lagneśa ${lagnaLord.name} in House ${lagnaLord.house} encounters limiting factors (${condPlacement.status === 'contradicted' ? 'Dusthāna placement' : ''}${condDignity.status === 'contradicted' ? '; impaired dignity/combustion' : ''}${condSAV.status === 'contradicted' ? `; deficient Aṣṭakavarga (${h1.savBindus} bindus)` : ''}), requiring conscious health pacing and restorative habits.`
  );

  // Rule 2: Affliction / Dusthana Rule (BPHS Ch. 11, v. 12-14)
  const ruleAffliction = evaluateRuleFromConditions(
    'bphs_lagna_affliction',
    'Tanubhāva Rogapīḍā & Vulnerability Vector (BPHS Ch. 11)',
    {
      sourceText: 'Brihat Parashara Hora Shastra',
      chapterAndVerse: 'BPHS Ch. 11, v. 12-14',
      sanskritShloka: 'लग्नेशे षष्ठगे वापि रन्ध्रे वा व्ययगेऽपि वा। देहपीडा भवेत्तस्य यद्यसौ न बलोत्कटः॥',
      englishTranslation: 'If the lord of Lagna is in the 6th, 8th, or 12th without adequate counter-strength, bodily affliction and vitality depletion manifest.',
    },
    [condPlacement, condDignity],
    'Affliction rule nullified: Lagneśa is properly sheltered in auspicious houses.',
    `Physical vulnerability confirmed: Lagneśa ${lagnaLord.name} in House ${lagnaLord.house} triggers the classical Tanubhāva Rogapīḍā rule, indicating periods of physical exhaustion and slow recuperation during adverse transits.`
  );

  const triggeredRules: RuleEvaluationResult[] = [];
  const untriggeredRules: RuleEvaluationResult[] = [];

  if (ruleVitality.isTriggered) triggeredRules.push(ruleVitality);
  else untriggeredRules.push(ruleVitality);

  if (ruleAffliction.isTriggered) triggeredRules.push(ruleAffliction);
  else untriggeredRules.push(ruleAffliction);

  // Separate evidence
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

  // Synthesize domain prediction status & verdict
  let status: DomainPredictionStatus = 'insufficient_evidence';
  let finalVerdict = '';
  let synthesisNarrative = '';

  if (contradictingEvidence.length > 0 && !ruleVitality.isTriggered) {
    status = 'contradicted_indication';
    finalVerdict = ruleVitality.shastricVerdict; // This contains the specific contradictory diagnosis!
    synthesisNarrative = `Classical vitality rules are contradicted by active chart impediments: ${contradictingEvidence.map((e) => e.observedFact + ' — ' + e.shastricRationale).join(' ')} No generic strength is attributed to this ascendant.`;
  } else if (ruleVitality.isTriggered && ruleVitality.confidence === 'high') {
    status = 'verified_prediction';
    finalVerdict = ruleVitality.shastricVerdict;
    synthesisNarrative = `Classical Deha-saukhya is fully substantiated: ${supportingEvidence.map((e) => e.observedFact).join('; ')}. Ascendant operates from a fortified constitutional baseline.`;
  } else if (ruleVitality.isTriggered && ruleVitality.confidence === 'moderate') {
    status = 'partially_supported';
    finalVerdict = ruleVitality.shastricVerdict;
    synthesisNarrative = `Constitutional indicators show mixed-to-favorable status with moderate reserve capacity.`;
  } else {
    status = 'insufficient_evidence';
    finalVerdict = `Insufficient classical evidence to assert extreme vitality or severe chronic fragility. Lagneśa operates in neutral balance without singular exaltation or acute dusthāna combustion.`;
    synthesisNarrative = `Horoscope exhibits balanced/neutral baseline without triggering decisive classical yoga rules for constitutional extremes.`;
  }

  // Handle Mars bodily mark note
  const caveats: string[] = [];
  if (condMarsScar.status === 'absent') {
    caveats.push('No facial scars or head marks are predicted from Mars, as Mars forms no classical conjunction or aspect with House 1 or House 2.');
  } else if (condMarsScar.status === 'satisfied') {
    caveats.push('Distinctive facial or bodily mark confirmed due to direct Mars aspect/placement on the ascendant in aggressive dignity.');
  }

  return {
    domainId: 'constitution',
    domainNumber: 1,
    canonicalTitle: 'Lagna & Physical Constitution',
    sanskritTitle: 'तनुभाव एवं देहप्रकृति',
    governingHouses: [1],
    status,
    primaryLord: {
      id: lagnaLord.id,
      name: lagnaLord.name,
      rashi: lagnaLord.rashiName,
      house: lagnaLord.house,
      dignity: lagnaLord.dignity,
      isRetrograde: lagnaLord.isRetrograde,
      isCombust: lagnaLord.isCombust,
    },
    naturalKaraka: {
      id: 'sun',
      name: sun.name,
      shadbalaRatio: sun.shadbalaRatio,
      house: sun.house,
      dignity: sun.dignity,
    },
    houseSAVBindus: {
      1: {
        bindus: h1.savBindus,
        evaluation: h1.savClassification,
        isFavorable: h1.isSavFavorable,
      },
    },
    evaluatedConditions: allConditions,
    triggeredRules,
    untriggeredRules,
    supportingEvidence,
    contradictingEvidence,
    finalVerdict,
    synthesisNarrative,
    caveatsAndAbsences: caveats,
  };
}

// ==========================================
// 4. Domain Predictor: Career & Karma (Domain 3 / 10th House)
// ==========================================

export function evaluateDomain3Career(ctx: PredictionContext): DomainPredictionResult {
  return evaluateCareerDomain(ctx);
}

// ==========================================
// 4b. Domain Predictor: Marriage & Sacred Partnership (Domain 6 / 7th House)
// ==========================================

export function evaluateDomain6Marriage(ctx: PredictionContext): DomainPredictionResult {
  return evaluateMarriageDomain(ctx);
}

// ==========================================
// 4c. Domain Predictor: Children & Progeny (Domain 7 / 5th House)
// ==========================================

export function evaluateDomain7Progeny(ctx: PredictionContext): DomainPredictionResult {
  return evaluateProgenyDomain(ctx);
}

// ==========================================
// 5. Generic Deterministic Domain Evaluator for Remaining Domains
// ==========================================

export function evaluateGenericDomain(domainNum: number, domainId: string, primaryHouse: number, karakaId: PlanetId, title: string, sanskritTitle: string, ctx: PredictionContext): DomainPredictionResult {
  const pHouse = ctx.getHouse(primaryHouse);
  const pLord = ctx.getLordOfHouse(primaryHouse);
  const karaka = ctx.getPlanet(karakaId);

  const condPlacement = evaluateLordPlacementCondition(ctx, primaryHouse, [1, 4, 7, 10, 5, 9, 11], `${title} Lord Placement`);
  const condDignity = evaluateLordDignityCondition(ctx, primaryHouse, `${title} Lord Dignity`);
  const condSAV = evaluateHouseSAVCondition(ctx, primaryHouse, `${title} Bhāva SAV`);
  const condBenefic = evaluateBeneficAspectOrOccupancy(ctx, primaryHouse, `${title} Benefic Aspect/Occupancy`);
  const condKaraka = evaluateKarakaStrength(ctx, karakaId, `${karaka.name} Karaka Strength`);

  const allConditions = [condPlacement, condDignity, condSAV, condBenefic, condKaraka];

  const ruleDomain = evaluateRuleFromConditions(
    `canonical_rule_h${primaryHouse}`,
    `${title} Canonical Synthesis (BPHS / Phaladīpikā)`,
    {
      sourceText: 'Brihat Parashara Hora Shastra',
      chapterAndVerse: `Ch. ${10 + primaryHouse}, v. 1–3`,
      sanskritShloka: 'भावे शुभग्रहैर्युक्ते दृष्टे वा बलसंयुते। भाववृद्धिं विजानीयात् व्यत्यये भावसंक्षयम्॥',
      englishTranslation: 'When a bhāva is associated with or aspected by benefics and its lord is endowed with strength, the indications of that house flourish; in reverse conditions, decay of indications occurs.',
    },
    [condPlacement, condDignity, condSAV],
    `Lord ${pLord.name} in House ${pLord.house} (${pLord.dignity}) with ${pHouse.savBindus} SAV bindus provides verified canonical support for ${title.toLowerCase()} affairs.`,
    `Indications for ${title.toLowerCase()} face structural constraints: Lord ${pLord.name} in House ${pLord.house} (${pLord.dignity}) and ${pHouse.savBindus} SAV bindus contradict classical flourishing conditions, requiring patience and conscious remediation.`
  );

  const triggeredRules: RuleEvaluationResult[] = [];
  const untriggeredRules: RuleEvaluationResult[] = [];

  if (ruleDomain.isTriggered) triggeredRules.push(ruleDomain);
  else untriggeredRules.push(ruleDomain);

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

  let status: DomainPredictionStatus = 'insufficient_evidence';
  let finalVerdict = '';
  let synthesisNarrative = '';

  if (contradictingEvidence.length > 0 && !ruleDomain.isTriggered) {
    status = 'contradicted_indication';
    finalVerdict = ruleDomain.shastricVerdict;
    synthesisNarrative = `Classical flourishing conditions are contradicted by active chart limitations: ${contradictingEvidence.map((e) => e.observedFact).join('; ')}.`;
  } else if (ruleDomain.isTriggered && ruleDomain.confidence === 'high') {
    status = 'verified_prediction';
    finalVerdict = ruleDomain.shastricVerdict;
    synthesisNarrative = `Classical criteria are fully confirmed: ${supportingEvidence.map((e) => e.observedFact).join('; ')}.`;
  } else if (ruleDomain.isTriggered) {
    status = 'partially_supported';
    finalVerdict = ruleDomain.shastricVerdict;
    synthesisNarrative = `Classical criteria are partially supported with moderate strength.`;
  } else {
    status = 'insufficient_evidence';
    finalVerdict = `Insufficient classical evidence to assert definitive extreme outcomes for ${title.toLowerCase()}. Planetary factors are balanced without singular exaltation or acute dusthāna affliction.`;
    synthesisNarrative = `Bhāva operates in ordinary neutral balance; events will be mediated primarily by prevailing Daśā periods.`;
  }

  return {
    domainId,
    domainNumber: domainNum,
    canonicalTitle: title,
    sanskritTitle,
    governingHouses: [primaryHouse],
    status,
    primaryLord: {
      id: pLord.id,
      name: pLord.name,
      rashi: pLord.rashiName,
      house: pLord.house,
      dignity: pLord.dignity,
      isRetrograde: pLord.isRetrograde,
      isCombust: pLord.isCombust,
    },
    naturalKaraka: {
      id: karakaId,
      name: karaka.name,
      shadbalaRatio: karaka.shadbalaRatio,
      house: karaka.house,
      dignity: karaka.dignity,
    },
    houseSAVBindus: {
      [primaryHouse]: {
        bindus: pHouse.savBindus,
        evaluation: pHouse.savClassification,
        isFavorable: pHouse.isSavFavorable,
      },
    },
    evaluatedConditions: allConditions,
    triggeredRules,
    untriggeredRules,
    supportingEvidence,
    contradictingEvidence,
    finalVerdict,
    synthesisNarrative,
    caveatsAndAbsences: [],
  };
}

/**
 * Universal dispatcher for any of the 12 domains using the deterministic prediction pipeline
 */
export function evaluateDomainByNumber(domainNum: number, ctx: PredictionContext): DomainPredictionResult {
  switch (domainNum) {
    case 1:
      return evaluateConstitutionDomain(ctx);
    case 2:
      return evaluateGenericDomain(2, 'temperament', 1, 'moon', 'Personality & Mental Temperament', 'मनःस्वभाव एवं बुद्धि', ctx);
    case 3:
      return evaluateDomain3Career(ctx);
    case 4:
      return evaluateGenericDomain(4, 'wealth', 2, 'jupiter', 'Wealth, Assets & Liquid Resources', 'द्वितीय-एकादश भाव एवं धनसम्पत्ति', ctx);
    case 5:
      return evaluateGenericDomain(5, 'education', 5, 'mercury', 'Intellect, Discernment & Higher Studies', 'चतुर्थ-पञ्चम भाव एवं विद्या-प्रज्ञा', ctx);
    case 6:
      return evaluateDomain6Marriage(ctx);
    case 7:
      return evaluateDomain7Progeny(ctx);
    case 8:
      return evaluateGenericDomain(8, 'family', 4, 'moon', 'Family Harmony, Domestic Peace & Real Estate', 'द्वितीय-चतुर्थ भाव एवं कुटुम्ब-गृहसुख', ctx);
    case 9:
      return evaluateGenericDomain(9, 'health', 6, 'mars', 'Physiological Vulnerabilities & Disease Resistance', 'षष्ठ-अष्टम भाव एवं देहस्वास्थ्य', ctx);
    case 10:
      return evaluateGenericDomain(10, 'spirituality', 9, 'jupiter', 'Dharma, Philosophy & Spiritual Awakening', 'नवम-द्वादश भाव एवं धर्म-मोक्ष', ctx);
    case 11:
      return evaluateGenericDomain(11, 'status', 10, 'sun', 'Social Eminence, Authority & Public Recognition', 'दशमभाव, आरूढ एवं कीर्ति-प्रतिष्ठा', ctx);
    case 12:
    default:
      return evaluateGenericDomain(12, 'life_themes', 9, 'saturn', 'Major Life Themes & Transcendent Evolution', 'जीवनप्रवाह एवं कुण्डली महालक्षण', ctx);
  }
}

/**
 * Gaṇaka — Domain 1: Synthesis Engine
 * 
 * Generates the authentic, evidence-grounded synthesis for:
 * - What is indicated
 * - Why it is indicated
 * - Which factors support it
 * - Which factors modify or oppose it
 * - Evidence strength (qualitative states)
 * - What remains uncertain
 * 
 * Generates qualitative Ayurvedic dosha disposition (no fake percentages)
 * and classical maturation phases (no arbitrary age brackets).
 */

import { PredictionContext, NATURAL_BENEFICS, NATURAL_MALEFICS } from '../../context';
import { EvaluatedCondition, RuleEvaluationResult, QualitativeEvidenceState } from '../../types';
import { RASHIS, GRAHA_NAMES } from '../../../constants';
import { RashiNumber, PlanetId } from '../../../types';
import {
  PhysicalAppearanceDetails,
  MentalDispositionDetails,
  QualitativeDoshaProfile,
  LifeCycleMaturationArc,
  ClassicalMarkIndication,
  ConstitutionalTension,
} from './types';
import { EvaluatedEvidenceStack } from './evidence';

export interface Domain1SynthesisOutput {
  finalVerdict: string;
  synthesisNarrative: string;
  appearanceDetails: PhysicalAppearanceDetails;
  mentalDetails: MentalDispositionDetails;
  elementalProfile: QualitativeDoshaProfile;
  maturationArc: LifeCycleMaturationArc;
}

export function synthesizeConstitutionDomain(
  ctx: PredictionContext,
  evidenceStack: EvaluatedEvidenceStack,
  rules: RuleEvaluationResult[],
  markIndications: ClassicalMarkIndication[]
): Domain1SynthesisOutput {
  const chart = ctx.chart;
  const lagnaLord = ctx.getLordOfHouse(1);
  const h1 = ctx.getHouse(1);
  const h2 = ctx.getHouse(2);
  const sun = ctx.getPlanet('sun');
  const moon = ctx.getPlanet('moon');
  const mercury = ctx.getPlanet('mercury');
  const lagnaRashiNum = (chart.lagna?.rashiNumber || 1) as RashiNumber;
  const lagnaRashi = RASHIS[lagnaRashiNum];

  // D9 Navāṃśa Lagna
  const d9LagnaRashiNum = (chart.vargas?.D9?.lagnaRashi || lagnaRashiNum) as RashiNumber;
  const d9LagnaRashi = RASHIS[d9LagnaRashiNum];
  const d9LagnaLordId = d9LagnaRashi.lord;
  const d9LagnaLordName = GRAHA_NAMES[d9LagnaLordId]?.sanskrit || d9LagnaLordId;

  // 2nd House (Mukha)
  const lord2 = ctx.getLordOfHouse(2);
  const rashi2 = RASHIS[h2.rashiNumber as RashiNumber];

  // ----------------------------------------------------
  // 1. Physical Appearance Synthesis (D1 + D9 + Mukha)
  // ----------------------------------------------------
  let statureCategory = 'Medium Stature';
  let buildType = 'Balanced Frame';
  let boneStructure = 'Harmonious skeletal symmetry';

  if (['Aries', 'Leo', 'Sagittarius'].includes(lagnaRashi.name)) {
    buildType = 'Mesomorphic (Athletic & Energetic)';
    boneStructure = 'Resilient skeletal density with firm shoulder width';
    statureCategory = lagnaRashi.name === 'Sagittarius' ? 'Medium-to-Tall' : 'Medium Stature';
  } else if (['Taurus', 'Virgo', 'Capricorn'].includes(lagnaRashi.name)) {
    buildType = 'Endomorphic-to-Balanced (Sturdy & Compact)';
    boneStructure = 'Dense bone mineralization with stable, grounding joint structure';
    statureCategory = lagnaRashi.name === 'Capricorn' ? 'Lean & Slender' : 'Compact-to-Medium';
  } else if (['Gemini', 'Libra', 'Aquarius'].includes(lagnaRashi.name)) {
    buildType = 'Ectomorphic (Agile & Articulate)';
    boneStructure = 'Long, light bone architecture with flexible articulations';
    statureCategory = 'Medium-to-Tall';
  } else {
    // Water
    buildType = 'Supple & Rounded Contours';
    boneStructure = 'Softened skeletal transitions with gentle joint curvature';
    statureCategory = lagnaRashi.name === 'Cancer' ? 'Moderate-to-Compact' : 'Medium Stature';
  }

  // Modifiers on stature from Lagnesha & occupants
  if (h1.occupants.includes('saturn') || lagnaLord.id === 'saturn') {
    buildType = 'Lean & Bony (Ectomorphic)';
    statureCategory = 'Tall & Slender';
    boneStructure = 'Prominent clavicles, defined facial planes, and visible joint topography';
  } else if (h1.occupants.includes('jupiter') || lagnaLord.id === 'jupiter') {
    buildType = 'Expansive & Broad (Dignified Frame)';
    statureCategory = 'Tall & Stately';
    boneStructure = 'Broad ribcage, dignified stance, and noble skeletal volume';
  } else if (h1.occupants.includes('mars') || lagnaLord.id === 'mars') {
    buildType = 'Athletic & Muscular (Mesomorphic)';
    boneStructure = 'Compact, dense muscle definition with strong physical carriage';
  }

  // Facial Architecture
  let facialArchitecture = `Balanced facial contours reflecting ${lagnaRashi.sanskritName} rising.`;
  if (h1.occupants.includes('moon') || (chart.planets.moon && chart.planets.moon.house === 1)) {
    facialArchitecture = 'Rounded lunar contours (Candra-Mukha), soft jawline curvature, and luminous facial luster.';
  } else if (h1.occupants.includes('mars') || h2.occupants.includes('mars')) {
    facialArchitecture = 'Sharp, chiseled angular jawline with prominent chin structure and focused facial tension.';
  } else if (h1.occupants.includes('jupiter') || h2.occupants.includes('jupiter')) {
    facialArchitecture = 'Broad, generous forehead with noble cranial symmetry and an open, dignified smile.';
  } else if (h1.occupants.includes('saturn') || h2.occupants.includes('saturn')) {
    facialArchitecture = 'Sculpted, lean facial contours with prominent cheekbone planes and mature solemnity.';
  } else if (h1.occupants.includes('venus') || h2.occupants.includes('venus')) {
    facialArchitecture = 'Symmetrical, photogenic facial curves with natural softness and disarming smile.';
  }

  // Gaze and Expression
  let gazeAndExpression = 'Steady, observant gaze with natural ocular focus.';
  if (h1.occupants.includes('sun') || ctx.planetAspectsHouse('sun', 1)) {
    gazeAndExpression = 'Direct, penetrating, dignified gaze reflecting solar authority.';
  } else if (h1.occupants.includes('moon') || ctx.planetAspectsHouse('moon', 1)) {
    gazeAndExpression = 'Large, receptive, soulful liquid gaze with emotional warmth.';
  } else if (h1.occupants.includes('mars') || ctx.planetAspectsHouse('mars', 1)) {
    gazeAndExpression = 'Piercing, vigilant, intense gaze with swift responsive eye movements.';
  } else if (h1.occupants.includes('saturn') || ctx.planetAspectsHouse('saturn', 1)) {
    gazeAndExpression = 'Guarded, thoughtful, serious, and deeply calculating gaze.';
  }

  const appearanceDetails: PhysicalAppearanceDetails = {
    statureCategory,
    buildType,
    boneStructure,
    facialArchitecture,
    gazeAndExpression,
    d1FoundationalInfluence: `D1 Lagna in ${lagnaRashi.sanskritName} (${lagnaRashi.name}) establishes the childhood constitutional foundation and baseline skeletal archetype.`,
    d9NavamshaMaturationInfluence: `D9 Navāṃśa Lagna in ${d9LagnaRashi.sanskritName} (${d9LagnaRashi.name}, ruled by ${d9LagnaLordName}) determines the mature adult physical countenance, adding ${d9LagnaRashi.element.toLowerCase()}-element skeletal refinement to mature adult presence.`,
    secondHouseMukhaInfluence: `2nd House (${rashi2.sanskritName}, ruled by ${lord2.name}) governs Mukha-Sthāna (facial bone structure, oral carriage, and vocal resonance).`,
  };

  // ----------------------------------------------------
  // 2. Mental Disposition Details (Manas & Buddhi)
  // ----------------------------------------------------
  const cognitiveStrengths: string[] = [];
  const stressVulnerabilities: string[] = [];
  const keyFactors: string[] = [];

  keyFactors.push(`Candra in ${moon.rashiName} (House ${moon.house}, ${moon.dignity})`);
  keyFactors.push(`5th Lord ${ctx.getLordOfHouse(5).name} in House ${ctx.getLordOfHouse(5).house}`);
  keyFactors.push(`Budha in ${mercury.rashiName} (House ${mercury.house}, ${mercury.dignity})`);

  if (evidenceStack.mentalState === 'strongly_supported' || evidenceStack.mentalState === 'supported') {
    cognitiveStrengths.push('Emotional stability and steady mental equanimity under routine pressures');
    cognitiveStrengths.push('Clear reflective capacity with natural psychological resilience');
  } else if (evidenceStack.mentalState === 'mixed') {
    cognitiveStrengths.push('Intuitive depth and intellectual perceptiveness');
    stressVulnerabilities.push('Emotional sensitivity or fluctuating cognitive focus during high-pressure cycles');
  } else if (evidenceStack.mentalState === 'contradicted') {
    stressVulnerabilities.push('Tendency toward anxious brooding, emotional turbulence, or mental exhaustion');
    stressVulnerabilities.push('Heightened reactivity requiring intentional mindfulness and calming routines');
  }

  const mentalDetails: MentalDispositionDetails = {
    state: evidenceStack.mentalState,
    manasCondition: `Moon in House ${moon.house} (${moon.rashiName}, ${moon.dignity}): ${
      evidenceStack.mentalState === 'strongly_supported'
        ? 'unencumbered by malefic siege, providing calm emotional baseline'
        : evidenceStack.mentalState === 'contradicted'
        ? 'burdened by malefic contacts, indicating emotional vulnerability'
        : 'balanced with mixed emotional and intellectual adaptability'
    }.`,
    buddhiCondition: `5th House (Buddhi) ruled by ${ctx.getLordOfHouse(5).name} with Budha in House ${mercury.house} (${mercury.dignity}).`,
    emotionalResilience:
      evidenceStack.mentalState === 'strongly_supported'
        ? 'High classical emotional fortitude; mind recovers quickly from setbacks.'
        : evidenceStack.mentalState === 'mixed'
        ? 'Moderate emotional fortitude; resilient in structured environments, vulnerable to chaotic stimuli.'
        : 'Sensitive emotional fortitude; requires deliberate stress containment and supportive surroundings.',
    cognitiveStrengths,
    stressVulnerabilities,
    keyShastricFactors: keyFactors,
  };

  // ----------------------------------------------------
  // 3. Qualitative Ayurvedic Dosha Tendency (NO FAKE %)
  // ----------------------------------------------------
  let dominantElement: QualitativeDoshaProfile['dominantElementalTendency'] = 'Sama (Balanced Tridoṣa)';
  let shastricArchetype: QualitativeDoshaProfile['shastricArchetype'] = 'Tridoṣaja (Balanced)';
  let metabolicSignature = 'Balanced metabolic fire (Sama-Agni)';
  let physicalStaminaSummary = 'Standard constitutional endurance with balanced recuperation.';

  if (lagnaRashi.element === 'Fire' || lagnaLord.id === 'mars' || lagnaLord.id === 'sun') {
    dominantElement = 'Agni (Fiery / Metabolic)';
    shastricArchetype = 'Pitta-predominant';
    metabolicSignature = 'Sharp digestive fire (Tīkṣṇa-Agni) with high internal thermal output and rapid nutrient assimilation.';
    physicalStaminaSummary = 'Dynamic, energetic stamina; performs well in vigorous bursts, susceptible to dehydration or inflammatory heat under extreme stress.';
  } else if (lagnaRashi.element === 'Air' || lagnaLord.id === 'saturn' || lagnaLord.id === 'mercury') {
    dominantElement = 'Vāyu (Airy / Nervous-Agile)';
    shastricArchetype = 'Vāta-predominant';
    metabolicSignature = 'Fluctuating digestive fire (Viṣama-Agni) with variable cellular appetite and swift nervous system conduction.';
    physicalStaminaSummary = 'Light, agile stamina with high nervous energy; needs regular nourishment and warm hydration to prevent rapid physical fatigue.';
  } else if (lagnaRashi.element === 'Earth') {
    dominantElement = 'Pṛthvī (Earthy / Dense-Stable)';
    shastricArchetype = 'Kapha-predominant';
    metabolicSignature = 'Steady, deliberate metabolic fire (Manda-Agni) with dense tissue formation and durable nutrient storage.';
    physicalStaminaSummary = 'High baseline physical endurance and structural stamina; slow to tire, benefits from regular invigorating movement.';
  } else if (lagnaRashi.element === 'Water' || lagnaLord.id === 'moon' || lagnaLord.id === 'venus') {
    dominantElement = 'Jala (Watery / Luminous-Moist)';
    shastricArchetype = 'Kapha-predominant';
    metabolicSignature = 'Gentle, cooling metabolic process with supple tissue hydration and sensitive lymphatic circulation.';
    physicalStaminaSummary = 'Supple bodily endurance; responds favorably to gentle, rhythmic conditioning and restorative rest.';
  }

  const elementalProfile: QualitativeDoshaProfile = {
    dominantElementalTendency: dominantElement,
    shastricArchetype,
    metabolicSignature,
    physicalStaminaSummary,
    epistemologicalNotice:
      'Notice: Traditional Jyotiṣa constitutional archetypes (Bhūta-Svarūpa & Deha-Prakṛti) represent classical symbolic classifications of temperament and elements, not clinical, laboratory, or physiological medical diagnostics.',
  };

  // ----------------------------------------------------
  // 4. Classical Maturation Arc (No arbitrary age numbers)
  // ----------------------------------------------------
  const maturationArc: LifeCycleMaturationArc = {
    foundationalPhaseDescription: `Early Foundational Phase: Physical constitution is anchored primarily by D1 Lagna (${lagnaRashi.sanskritName}, ruled by ${lagnaLord.name}), shaping initial bone growth, immune adaptation, and childhood vitality.`,
    adultMaturationDescription: `Adult Maturation & Crystallization: The physical vessel progressively integrates D9 Navāṃśa Lagna (${d9LagnaRashi.sanskritName}, ruled by ${d9LagnaLordName}) alongside canonical Graha maturity sequences, refining adult bone symmetry, facial contours, and postural presence.`,
    preservationPhaseDescription: `Preservation & Mature Arc: Long-term physical resilience is governed by Lagneśa dignity (${lagnaLord.dignity}), the 8th house, and Lagna's ${h1.savBindus} SAV bindus, determining longevity stamina and recuperative poise.`,
  };

  // ----------------------------------------------------
  // 5. Final Verdict & Synthesis Narrative Generation
  // Synthesizes: What is indicated, Why, Supporting factors, Modifying factors, Evidence strength, Uncertainties
  // ----------------------------------------------------
  const stateLabel =
    evidenceStack.domainState === 'strongly_supported'
      ? 'Fortified & Resilient'
      : evidenceStack.domainState === 'supported'
      ? 'Favorable & Stable'
      : evidenceStack.domainState === 'mixed'
      ? 'Mixed with Specific Vulnerabilities'
      : evidenceStack.domainState === 'weakly_supported'
      ? 'Constrained Baseline'
      : evidenceStack.domainState === 'contradicted'
      ? 'Structurally Vulnerable'
      : 'Balanced Neutral';

  const finalVerdict = `Constitution is classified as ${stateLabel}: Physical stamina is evaluated as ${evidenceStack.staminaState.replace('_', ' ')}, while mental disposition shows ${evidenceStack.mentalState.replace('_', ' ')} status.`;

  // Narrative components answering the 6 mandatory questions:
  const whatIsIndicated = `1. Indication: The horoscope presents an embodied constitution rooted in ${lagnaRashi.sanskritName} (${lagnaRashi.name}) rising with ${statureCategory.toLowerCase()} stature and a ${buildType.toLowerCase()} skeletal frame.`;
  
  const whyIndicated = `2. Classical Basis: Lagneśa ${lagnaLord.name} is placed in House ${lagnaLord.house} (${lagnaLord.rashiName}, ${lagnaLord.dignity})${lagnaLord.isCombust ? ' in combust state' : ''}, governing bodily tissue formation alongside an ascendant capacity of ${h1.savBindus} Aṣṭakavarga bindus.`;

  const supportingFactors = evidenceStack.supportingEvidence.length > 0
    ? `3. Supporting Factors: ${evidenceStack.supportingEvidence.map((e) => e.observedFact).join('; ')}.`
    : '3. Supporting Factors: No singular classical yoga of exceptional strength is active on the ascendant.';

  const modifyingFactors = evidenceStack.contradictingEvidence.length > 0
    ? `4. Modifying / Contradicting Factors: ${evidenceStack.contradictingEvidence.map((e) => e.observedFact + ' (' + e.shastricRationale + ')').join('; ')}.`
    : '4. Modifying Factors: No severe malefic siege or dusthāna debility impedes the physical ascendant.';

  const evidenceStrength = `5. Evidence Strength: Overall domain evidence is evaluated as "${evidenceStack.domainState.toUpperCase()}" without reliance on arbitrary numeric percentages.`;

  const uncertaintiesText = evidenceStack.unresolvedUncertainties.length > 0
    ? `6. Classical Caveats & Uncertainties: ${evidenceStack.unresolvedUncertainties.join(' ')}`
    : '6. Classical Caveats: Traditional indications represent astrological predispositions and do not substitute for empirical physiological measurements.';

  const synthesisNarrative = [
    whatIsIndicated,
    whyIndicated,
    supportingFactors,
    modifyingFactors,
    evidenceStrength,
    uncertaintiesText,
  ].join('\n\n');

  return {
    finalVerdict,
    synthesisNarrative,
    appearanceDetails,
    mentalDetails,
    elementalProfile,
    maturationArc,
  };
}

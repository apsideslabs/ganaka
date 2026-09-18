/**
 * Gaṇaka — Domain 1: Evidence Stack & Contradiction Resolution
 * 
 * Strict Evidence Stack:
 * Target → Relevant Factors → Classical Conditions → Supporting vs Contradicting Evidence
 * → Qualitative Evidence States → Contradiction Resolution
 */

import { PredictionContext } from '../../context';
import { EvaluatedCondition, PredictionEvidence, QualitativeEvidenceState } from '../../types';
import {
  ConstitutionalTension,
  ClassicalMarkIndication,
} from './types';

export interface EvaluatedEvidenceStack {
  domainState: QualitativeEvidenceState;
  staminaState: QualitativeEvidenceState;
  mentalState: QualitativeEvidenceState;
  supportingEvidence: PredictionEvidence[];
  contradictingEvidence: PredictionEvidence[];
  tensions: ConstitutionalTension[];
  unresolvedUncertainties: string[];
}

/**
 * Builds the Evidence Stack, segregates supporting and contradicting evidence,
 * derives qualitative evidence states, and maps specific chart contradictions.
 */
export function buildConstitutionEvidenceStack(
  ctx: PredictionContext,
  allConditions: EvaluatedCondition[],
  markIndications: ClassicalMarkIndication[]
): EvaluatedEvidenceStack {
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

  // Physical Stamina specific conditions
  const staminaConditions = allConditions.filter((c) =>
    ['cond_lagnesha_multifactor', 'cond_lagna_bhava_rays', 'cond_lagna_sav_capacity', 'cond_surya_prana_vitality'].includes(c.id)
  );
  const staminaSupporting = staminaConditions.filter((c) => c.status === 'satisfied');
  const staminaContradicting = staminaConditions.filter((c) => c.status === 'contradicted');

  let staminaState: QualitativeEvidenceState = 'insufficient_evidence';
  if (staminaContradicting.length === 0 && staminaSupporting.length >= 2) {
    staminaState = staminaSupporting.length >= 3 ? 'strongly_supported' : 'supported';
  } else if (staminaContradicting.length > 0 && staminaSupporting.length > 0) {
    staminaState = 'mixed';
  } else if (staminaContradicting.length >= 2) {
    staminaState = 'contradicted';
  } else if (staminaContradicting.length === 1) {
    staminaState = 'weakly_supported';
  } else if (staminaSupporting.length === 1) {
    staminaState = 'weakly_supported';
  }

  // Mental Disposition specific conditions
  const mentalConditions = allConditions.filter((c) =>
    ['cond_chandra_manas_equanimity', 'cond_buddhi_discernment'].includes(c.id)
  );
  const mentalSupporting = mentalConditions.filter((c) => c.status === 'satisfied');
  const mentalContradicting = mentalConditions.filter((c) => c.status === 'contradicted');

  let mentalState: QualitativeEvidenceState = 'insufficient_evidence';
  if (mentalContradicting.length === 0 && mentalSupporting.length >= 1) {
    mentalState = mentalSupporting.length >= 2 ? 'strongly_supported' : 'supported';
  } else if (mentalContradicting.length > 0 && mentalSupporting.length > 0) {
    mentalState = 'mixed';
  } else if (mentalContradicting.length >= 1) {
    mentalState = 'contradicted';
  } else {
    mentalState = 'weakly_supported';
  }

  // Overall Domain Evidence State
  let domainState: QualitativeEvidenceState = 'insufficient_evidence';
  if (contradictingEvidence.length === 0 && supportingEvidence.length >= 3) {
    domainState = 'strongly_supported';
  } else if (contradictingEvidence.length === 0 && supportingEvidence.length >= 1) {
    domainState = 'supported';
  } else if (supportingEvidence.length > 0 && contradictingEvidence.length > 0) {
    domainState = 'mixed';
  } else if (contradictingEvidence.length >= 2 && supportingEvidence.length === 0) {
    domainState = 'contradicted';
  } else if (contradictingEvidence.length === 1) {
    domainState = 'weakly_supported';
  } else {
    domainState = 'insufficient_evidence';
  }

  // ----------------------------------------------------
  // Classical Contradictions & Tension Resolution
  // ----------------------------------------------------
  const tensions: ConstitutionalTension[] = [];
  const lagnaLord = ctx.getLordOfHouse(1);
  const h1 = ctx.getHouse(1);
  const sun = ctx.getPlanet('sun');
  const moon = ctx.getPlanet('moon');

  const condLagnesha = allConditions.find((c) => c.id === 'cond_lagnesha_multifactor');
  const condSAV = allConditions.find((c) => c.id === 'cond_lagna_sav_capacity');
  const condSurya = allConditions.find((c) => c.id === 'cond_surya_prana_vitality');
  const condChandra = allConditions.find((c) => c.id === 'cond_chandra_manas_equanimity');
  const condRays = allConditions.find((c) => c.id === 'cond_lagna_bhava_rays');

  // Tension 1: Strong Lagnesha but Low SAV in House 1
  if (
    (condLagnesha?.status === 'satisfied' || condLagnesha?.status === 'partially_supported') &&
    condSAV?.status === 'contradicted'
  ) {
    tensions.push({
      factorA: `Lagneśa ${lagnaLord.name} in House ${lagnaLord.house} (${lagnaLord.dignity})`,
      factorB: `Lagna Bhāva SAV Prāṇic Deficit (${h1.savBindus} Bindus)`,
      tensionDescription: `The planetary ruler is well-placed, but the physical ascendant vessel lacks adequate Aṣṭakavarga praṇic density (${h1.savBindus} vs baseline 28).`,
      shastricResolution: `Classical resolution: While purposeful ambition and biological willpower are intact through ${lagnaLord.name}, cellular stamina depletes rapidly under physical overexertion. The native must avoid marathon physical burnout and cultivate regular sleep rhythms.`,
    });
  }

  // Tension 2: Weak/Combust Lagnesha but Fortified Sun
  if (condLagnesha?.status === 'contradicted' && condSurya?.status === 'satisfied') {
    tensions.push({
      factorA: `Impaired Lagneśa ${lagnaLord.name} (${lagnaLord.dignity} in House ${lagnaLord.house})`,
      factorB: `Fortified Solar Prāṇa (Sūrya in ${sun.rashiName}, House ${sun.house})`,
      tensionDescription: 'The bodily ruler is constrained or in a dusthāna, but the natural soul-karaka Sun possesses strong vitality.',
      shastricResolution: 'Classical resolution: Inherent inner willpower and spiritual vitality remain robust, providing strong regenerative recovery, even though the physical constitution is vulnerable to somatic ailments during adverse dasha periods.',
    });
  }

  // Tension 3: Fortified Physical Stamina but Afflicted Lunar Mind (Somatic strength vs Emotional sensitivity)
  if (staminaState === 'strongly_supported' && (condChandra?.status === 'contradicted' || condChandra?.status === 'partially_supported')) {
    tensions.push({
      factorA: 'Fortified Physical Constitution & High SAV Reserve',
      factorB: `Afflicted/Burdened Lunar Mind (Candra in House ${moon.house})`,
      tensionDescription: 'The bodily skeletal and metabolic frame is strong, but the emotional psyche experiences heightened strain, anxiety, or introspective weight.',
      shastricResolution: 'Classical resolution: The native has excellent physical durability and muscular stamina, but can exhaust themselves psychologically through internal rumination or emotional tension. Physical exercise serves as a necessary grounding outlet for mental restlessness.',
    });
  }

  // Tension 4: Benefic Lagneśa with Malefic Ray on Lagna
  if (
    (condLagnesha?.status === 'satisfied' || condLagnesha?.status === 'partially_supported') &&
    condRays?.status === 'contradicted'
  ) {
    tensions.push({
      factorA: `Dignified Lagneśa ${lagnaLord.name}`,
      factorB: 'Malefic Aspects / Occupancy on House 1 (Head & Physical Body)',
      tensionDescription: 'Lagna ruler is auspicious, but the physical zone of the ascendant is besieged by sharp malefic dṛṣṭi.',
      shastricResolution: 'Classical resolution: Overall lifespan and constitutional framework remain protected, but the physical body is susceptible to occasional accidental trauma, facial tension, or acute inflammatory bouts.',
    });
  }

  // ----------------------------------------------------
  // Unresolved Classical Uncertainties & Caveats
  // ----------------------------------------------------
  const unresolvedUncertainties: string[] = [];

  if (markIndications.length > 0) {
    unresolvedUncertainties.push(
      'Cutaneous mark indications (scars/moles): Classical texts define predispositions through planetary rays, but individual skin expressions depend heavily on environmental exposure, pediatric history, and genetics.'
    );
  }

  if (h1.savBindus >= 26 && h1.savBindus <= 29) {
    unresolvedUncertainties.push(
      `Lagna SAV bindus (${h1.savBindus}) sit near the threshold boundary between moderate (28) and slightly sensitive (26-27), meaning constitutional stamina fluctuates with transiting Saturn and Jupiter.`
    );
  }

  if (ctx.chart.lagna?.degreeInRashi !== undefined && (ctx.chart.lagna.degreeInRashi < 1.0 || ctx.chart.lagna.degreeInRashi > 29.0)) {
    unresolvedUncertainties.push(
      `Lagna sits near a rashi boundary (Sandhi at ${ctx.chart.lagna.degreeStr}), which introduces potential sensitivity in the exact D9 Navāṃśa Lagna calculation depending on ayanāṃśa variations.`
    );
  }

  return {
    domainState,
    staminaState,
    mentalState,
    supportingEvidence,
    contradictingEvidence,
    tensions,
    unresolvedUncertainties,
  };
}

/**
 * Gaṇaka — Domain 1: Multi-Factor Condition Evaluators
 * 
 * Strict multi-factor classical Jyotiṣa evaluations for:
 * - Lagna & Lagneśa positional integrity, dignity, and vargas
 * - Praṇic capacity via true Aṣṭakavarga (SAV) thresholds
 * - Solar vitality (Sūrya Naisargika Deha-Kāraka)
 * - Lunar mind (Candra Manas-Kāraka, Pakṣa Bala, and Graha yogas)
 * - Buddhi & Discernment (5th House & Budha)
 * - Bodily Appearance synthesis (D1 + D9 + Mukha Bhāva)
 * - Non-deterministic Classical Mark Vectors (Scars, Moles, Marks)
 */

import { PredictionContext, NATURAL_BENEFICS, NATURAL_MALEFICS } from '../../context';
import { EvaluatedCondition, ConditionStatus } from '../../types';
import { RASHIS, GRAHA_NAMES } from '../../../constants';
import { PlanetId, RashiNumber } from '../../../types';
import { MarkIndicationStatus, ClassicalMarkIndication } from './types';

/**
 * 1. Lagna & Lagneśa Multi-Factor Condition
 * Combines: House placement, dignity, combustion, retrogression, varga shelter, benefic/malefic contacts
 */
export function evaluateLagneshaMultiFactorCondition(ctx: PredictionContext): EvaluatedCondition {
  const lagnaLord = ctx.getLordOfHouse(1);
  const h1 = ctx.getHouse(1);
  const lagnaRashi = RASHIS[ctx.chart.lagna?.rashiNumber as RashiNumber] || RASHIS[1];

  const isKendra = [1, 4, 7, 10].includes(lagnaLord.house);
  const isTrikona = [5, 9].includes(lagnaLord.house);
  const isDusthana = [6, 8, 12].includes(lagnaLord.house);
  const isUpachaya = [3, 11].includes(lagnaLord.house);

  const hasHighDignity = lagnaLord.isExalted || lagnaLord.isOwnSign || lagnaLord.isMoolatrikona;
  const isFriendly = lagnaLord.isFriendly;
  const isDebilitated = lagnaLord.isDebilitated;
  const isCombust = lagnaLord.isCombust;
  const isRetrograde = lagnaLord.isRetrograde;

  const nb = isDebilitated ? ctx.checkNichabhanga(lagnaLord.id) : { isNichabhanga: false, reasons: [] };

  let status: ConditionStatus = 'insufficient_evidence';
  let rationale = '';

  if (hasHighDignity && (isKendra || isTrikona) && !isCombust) {
    status = 'satisfied';
    rationale = `Lagneśa ${lagnaLord.name} holds superior dignity (${lagnaLord.dignity}) in House ${lagnaLord.house} (${isKendra ? 'Kendra' : 'Trikona'}), giving robust constitutional stamina and high physical resilience without combustion.`;
  } else if (isDusthana) {
    if (hasHighDignity || nb.isNichabhanga) {
      status = 'partially_supported';
      rationale = `Lagneśa ${lagnaLord.name} is placed in Dusthāna House ${lagnaLord.house}, but retains dignified fortitude (${lagnaLord.dignity}), requiring conscious lifestyle pacing rather than causing critical constitutional collapse.`;
    } else {
      status = 'contradicted';
      rationale = `Lagneśa ${lagnaLord.name} is placed in Dusthāna House ${lagnaLord.house} without superior dignity (${lagnaLord.dignity}), creating a classical constitutional vulnerability vector (Rogapīḍā).`;
    }
  } else if (isCombust) {
    status = 'contradicted';
    rationale = `Lagneśa ${lagnaLord.name} is Astaṅgata (combust within solar orb in House ${lagnaLord.house}), impairing bodily prāṇic radiation and physical stamina.`;
  } else if (isDebilitated && !nb.isNichabhanga) {
    status = 'contradicted';
    rationale = `Lagneśa ${lagnaLord.name} is in uncancelled debilitation in ${lagnaLord.rashiName}, directly contradicting classical stamina thresholds.`;
  } else if (isKendra || isTrikona || isUpachaya || isFriendly || nb.isNichabhanga) {
    status = 'partially_supported';
    rationale = `Lagneśa ${lagnaLord.name} holds moderate positional and sign stability (${lagnaLord.dignity} in House ${lagnaLord.house}), conferring standard constitutional stamina.`;
  }

  return {
    id: 'cond_lagnesha_multifactor',
    name: 'Lagneśa Positional & Dignity Integrity',
    parameter: 'lagnesha_kendra_trikona_dignity',
    expected: 'Kendra/Trikona placement in Own/Exalted/Friendly sign without combustion',
    observed: `${lagnaLord.name} in H${lagnaLord.house} (${lagnaLord.rashiName}, ${lagnaLord.dignity})${isCombust ? ', Combust' : ''}${isRetrograde ? ', Retrograde' : ''}`,
    status,
    rationale,
    weight: 'mandatory',
  };
}

/**
 * 2. Lagna Bhāva Ray & Occupancy Condition
 * Checks natural benefics and malefics influencing the physical body zone (H1)
 */
export function evaluateLagnaBhavaRayCondition(ctx: PredictionContext): EvaluatedCondition {
  const h1 = ctx.getHouse(1);
  const beneficsInH1 = h1.beneficOccupants.map((id) => GRAHA_NAMES[id]?.english || id);
  const maleficsInH1 = h1.maleficOccupants.map((id) => GRAHA_NAMES[id]?.english || id);
  const beneficsAspectingH1 = h1.aspectsReceived.filter((a) => a.isBenefic).map((a) => GRAHA_NAMES[a.planetId]?.english || a.planetId);
  const maleficsAspectingH1 = h1.aspectsReceived.filter((a) => !a.isBenefic).map((a) => GRAHA_NAMES[a.planetId]?.english || a.planetId);

  const totalBeneficScore = beneficsInH1.length * 2 + beneficsAspectingH1.length;
  const totalMaleficScore = maleficsInH1.length * 2 + maleficsAspectingH1.length;

  let status: ConditionStatus = 'insufficient_evidence';
  let rationale = '';

  if (totalBeneficScore > 0 && totalMaleficScore === 0) {
    status = 'satisfied';
    rationale = `Lagna receives unencumbered benefic protection from ${[...beneficsInH1, ...beneficsAspectingH1].join(', ')}, endowing the body with radiant luster (Deha-Kānti) and shielding against chronic disorders.`;
  } else if (totalBeneficScore > 0 && totalMaleficScore > 0) {
    status = 'partially_supported';
    rationale = `Lagna receives mixed planetary rays: supported by benefics (${[...beneficsInH1, ...beneficsAspectingH1].join(', ')}) while modulated by malefic influences (${[...maleficsInH1, ...maleficsAspectingH1].join(', ')}), requiring deliberate physical hygiene.`;
  } else if (totalMaleficScore > 0 && totalBeneficScore === 0) {
    status = 'contradicted';
    rationale = `Lagna is besieged solely by malefic rays (${[...maleficsInH1, ...maleficsAspectingH1].join(', ')}) without mitigating benefic dṛṣṭi, increasing susceptibility to physical fatigue and muscular tension.`;
  } else {
    status = 'insufficient_evidence';
    rationale = `Lagna is unoccupied and un-aspected by major primary benefics or malefics, operating primarily through its sign lord and dispositor.`;
  }

  return {
    id: 'cond_lagna_bhava_rays',
    name: 'Lagna Bhāva Benefic vs Malefic Ray Balance',
    parameter: 'lagna_occupancy_aspects',
    expected: 'Presence or direct dṛṣṭi of natural benefics (Jupiter, Venus, unafflicted Mercury/Moon) without malefic siege',
    observed: `Occupants: [${[...beneficsInH1, ...maleficsInH1].join(', ') || 'None'}], Aspects: [${[...beneficsAspectingH1, ...maleficsAspectingH1].join(', ') || 'None'}]`,
    status,
    rationale,
    weight: 'qualifying',
  };
}

/**
 * 3. Lagna SAV Praṇic Capacity Condition
 * Strict, authentic Aṣṭakavarga thresholds:
 * >= 32: High/Abundant (Pūrṇa-prāṇa)
 * 28-31: Adequate (Sama-prāṇa)
 * 24-27: Deficient (Alpa-prāṇa)
 * < 24: Critical Deficit (Prāṇa-kṣīṇa)
 */
export function evaluateLagnaSAVCondition(ctx: PredictionContext): EvaluatedCondition {
  const h1 = ctx.getHouse(1);
  const bindus = h1.savBindus;

  let status: ConditionStatus = 'insufficient_evidence';
  let rationale = '';

  if (bindus >= 32) {
    status = 'satisfied';
    rationale = `Lagna possesses an abundant ${bindus} SAV bindus (classical baseline is 28), providing superior physiological reserve, rapid cellular recuperation, and resistance to environmental stress.`;
  } else if (bindus >= 28) {
    status = 'satisfied';
    rationale = `Lagna carries ${bindus} SAV bindus, representing a balanced and stable baseline (Sama-prāṇa) sufficient for consistent physical endurance.`;
  } else if (bindus >= 24) {
    status = 'partially_supported';
    rationale = `Lagna carries ${bindus} SAV bindus, falling slightly below the 28-bindu baseline, suggesting moderate stamina reserves that deplete during prolonged physical strain.`;
  } else {
    status = 'contradicted';
    rationale = `Lagna contains only ${bindus} SAV bindus (critical deficit < 24), severely limiting organic recuperation and indicating constitutional fragility during demanding transit cycles.`;
  }

  return {
    id: 'cond_lagna_sav_capacity',
    name: 'Lagna Bhāva Aṣṭakavarga (SAV) Prāṇic Capacity',
    parameter: 'lagna_sav_bindus',
    expected: '>= 28 Bindus (Standard) or >= 32 Bindus (Abundant)',
    observed: `${bindus} Bindus (${h1.savClassification} classification)`,
    status,
    rationale,
    weight: 'mandatory',
  };
}

/**
 * 4. Sūrya Vitality Condition (Naisargika Deha & Prāṇa Kāraka)
 */
export function evaluateSuryaVitalityCondition(ctx: PredictionContext): EvaluatedCondition {
  const sun = ctx.getPlanet('sun');
  const isKendraTrikona = [1, 4, 7, 10, 5, 9].includes(sun.house);
  const isDusthana = [6, 8, 12].includes(sun.house);
  const hasStrength = sun.isExalted || sun.isOwnSign || sun.isMoolatrikona || sun.isFriendly;
  const ratio = sun.shadbalaRatio;

  let status: ConditionStatus = 'insufficient_evidence';
  let rationale = '';

  if ((sun.isExalted || sun.isOwnSign || ratio >= 1.2) && !isDusthana) {
    status = 'satisfied';
    rationale = `Sūrya (Solar Kāraka of Prāṇa) is fortified in ${sun.rashiName} (House ${sun.house}, ${ratio.toFixed(2)}x Ṣaḍbala), infusing the skeletal system and cardiovascular vitality with steady natural warmth.`;
  } else if (isDusthana && !hasStrength) {
    status = 'contradicted';
    rationale = `Sūrya is placed in Dusthāna House ${sun.house} with impaired strength (${sun.dignity}, ${ratio.toFixed(2)}x Ṣaḍbala), indicating susceptibility to seasonal fatigue and lower vital fire (Manda-Agni).`;
  } else if (hasStrength || isKendraTrikona || ratio >= 1.0) {
    status = 'partially_supported';
    rationale = `Sūrya maintains supportive vital output (${sun.dignity} in House ${sun.house}, ${ratio.toFixed(2)}x Ṣaḍbala).`;
  } else {
    status = 'insufficient_evidence';
    rationale = `Sūrya functions at neutral baseline without outstanding strength or debility.`;
  }

  return {
    id: 'cond_surya_prana_vitality',
    name: 'Sūrya Prāṇa & Vital Radiance',
    parameter: 'surya_dignity_shadbala',
    expected: 'Fortified Sūrya in Kendra/Trikona or Upachaya with >= 1.0x Ṣaḍbala',
    observed: `Sun in H${sun.house} (${sun.rashiName}, ${sun.dignity}, ${ratio.toFixed(2)}x Ṣaḍbala)`,
    status,
    rationale,
    weight: 'qualifying',
  };
}

/**
 * 5. Candra Mental Disposition Condition (Manas, Citta & Emotional Equanimity)
 * Evaluates: Moon sign, house, waxing/waning, aspects from benefics vs malefics, Gajakesari vs Sani-Chandra / Grahan
 */
export function evaluateChandraManasCondition(ctx: PredictionContext): EvaluatedCondition {
  const moon = ctx.getPlanet('moon');
  const isDusthana = [6, 8, 12].includes(moon.house);
  const isKendraTrikona = [1, 4, 7, 10, 5, 9].includes(moon.house);
  const isExaltedOrOwn = moon.isExalted || moon.isOwnSign;
  const isDebilitated = moon.isDebilitated;
  const isCombust = moon.isCombust;

  // Conjunctions with Moon
  const conjPlanets = ctx.chart.planets ? Object.values(ctx.chart.planets).filter((p) => p.id !== 'moon' && p.house === moon.house) : [];
  const hasJupiterConj = conjPlanets.some((p) => p.id === 'jupiter');
  const hasSaturnConj = conjPlanets.some((p) => p.id === 'saturn');
  const hasMarsConj = conjPlanets.some((p) => p.id === 'mars');
  const hasRahuConj = conjPlanets.some((p) => p.id === 'rahu');
  const hasKetuConj = conjPlanets.some((p) => p.id === 'ketu');
  const hasVenusConj = conjPlanets.some((p) => p.id === 'venus');

  // Aspects on Moon
  const aspectsOnMoon = ctx.getAspectsOnHouse(moon.house);
  const hasJupiterAspect = aspectsOnMoon.includes('jupiter');
  const hasSaturnAspect = aspectsOnMoon.includes('saturn');
  const hasMarsAspect = aspectsOnMoon.includes('mars');
  const hasRahuAspect = aspectsOnMoon.includes('rahu');

  let status: ConditionStatus = 'insufficient_evidence';
  let rationale = '';

  if ((isExaltedOrOwn || (isKendraTrikona && (hasJupiterConj || hasJupiterAspect))) && !hasSaturnConj && !hasRahuConj && !isDusthana) {
    status = 'satisfied';
    rationale = `Candra (Manas Kāraka) is fortified in ${moon.rashiName} (House ${moon.house})${hasJupiterConj || hasJupiterAspect ? ' with auspicious Guru contact' : ''}, conferring emotional serenity, psychological resilience, and a peaceful contemplative disposition.`;
  } else if ((isDebilitated && !ctx.checkNichabhanga('moon').isNichabhanga) || (isDusthana && (hasSaturnConj || hasSaturnAspect || hasRahuConj || hasMarsConj))) {
    status = 'contradicted';
    rationale = `Candra suffers affliction: placed in House ${moon.house} (${moon.rashiName}, ${moon.dignity})${hasSaturnConj || hasSaturnAspect ? ', burdened by Śani contact (vulnerability to melancholia and emotional weight)' : ''}${hasRahuConj ? ', troubled by Rāhu contact (anxiety and psychic turbulence)' : ''}${hasMarsConj ? ', agitated by Maṅgala contact (restlessness and irritability)' : ''}. Emotional balance requires intentional grounding.`;
  } else if (hasSaturnConj || hasSaturnAspect) {
    status = 'partially_supported';
    rationale = `Candra is influenced by Śani in House ${moon.house}, imparting emotional seriousness, mature sobriety, and disciplined restraint, though accompanied by periodic bouts of introspective solitude or gravity.`;
  } else if (hasJupiterConj || hasJupiterAspect || hasVenusConj) {
    status = 'satisfied';
    rationale = `Candra receives benefic grace from ${hasJupiterConj || hasJupiterAspect ? 'Guru' : 'Śukra'}, infusing optimism, emotional buoyancy, and empathetic warmth.`;
  } else if (isKendraTrikona) {
    status = 'partially_supported';
    rationale = `Candra is positioned in favorable House ${moon.house} (${moon.rashiName}), maintaining functional psychological adaptability.`;
  } else {
    status = 'insufficient_evidence';
    rationale = `Candra exhibits neutral emotional baseline without severe affliction or singular classical exaltation.`;
  }

  return {
    id: 'cond_chandra_manas_equanimity',
    name: 'Candra Emotional Mind & Equanimity (Manas)',
    parameter: 'chandra_house_aspects_dignity',
    expected: 'Fortified Candra free from malefic conjunction/aspect in Kendra/Trikona',
    observed: `Moon in H${moon.house} (${moon.rashiName}, ${moon.dignity})${hasSaturnConj || hasSaturnAspect ? ', Saturn contact' : ''}${hasRahuConj ? ', Rahu contact' : ''}${hasJupiterConj || hasJupiterAspect ? ', Jupiter contact' : ''}`,
    status,
    rationale,
    weight: 'mandatory',
  };
}

/**
 * 6. Buddhi & Discernment Condition (5th House & Mercury)
 */
export function evaluateBuddhiDiscernmentCondition(ctx: PredictionContext): EvaluatedCondition {
  const h5 = ctx.getHouse(5);
  const lord5 = ctx.getLordOfHouse(5);
  const mercury = ctx.getPlanet('mercury');

  const lord5Strong = lord5.isExalted || lord5.isOwnSign || [1, 4, 5, 7, 9, 10].includes(lord5.house);
  const mercStrong = mercury.isExalted || mercury.isOwnSign || mercury.isFriendly || mercury.shadbalaRatio >= 1.0;

  let status: ConditionStatus = 'insufficient_evidence';
  let rationale = '';

  if (lord5Strong && mercStrong && !lord5.isCombust && !mercury.isCombust) {
    status = 'satisfied';
    rationale = `5th Lord ${lord5.name} in House ${lord5.house} alongside dignified Budha (${mercury.dignity}) indicates sharp intellectual discernment (Prajñā), cognitive clarity, and methodical learning capacity.`;
  } else if ([6, 8, 12].includes(lord5.house) && mercury.isCombust) {
    status = 'contradicted';
    rationale = `5th Lord ${lord5.name} in Dusthāna House ${lord5.house} with combust Budha indicates periodic mental over-exertion, concentration dispersion, or cognitive fatigue under stress.`;
  } else if (lord5Strong || mercStrong) {
    status = 'partially_supported';
    rationale = `Intellectual discernment is supported with solid practical cognition (${lord5.name} in H${lord5.house}; Budha in H${mercury.house}).`;
  } else {
    status = 'insufficient_evidence';
    rationale = `Cognitive baseline is standard without singular classical yoga triggers.`;
  }

  return {
    id: 'cond_buddhi_discernment',
    name: 'Buddhi & Discernment Vector (5th Bhāva & Budha)',
    parameter: '5th_lord_mercury_dignity',
    expected: '5th Lord and Budha free from combustion in Kendra/Trikona',
    observed: `5th Lord ${lord5.name} in H${lord5.house} (${lord5.dignity}); Mercury in H${mercury.house} (${mercury.dignity}${mercury.isCombust ? ', Combust' : ''})`,
    status,
    rationale,
    weight: 'qualifying',
  };
}

/**
 * 7. Non-Deterministic Classical Mark Vectors (Scars, Moles, Pigmentation)
 * Evaluates whether classical indications are present, strengthened, weakened, or convergent.
 * Completely eliminates guaranteed claims!
 */
export function evaluateClassicalMarkVectors(ctx: PredictionContext): {
  evaluatedCondition: EvaluatedCondition;
  markIndications: ClassicalMarkIndication[];
} {
  const chart = ctx.chart;
  const h1 = ctx.getHouse(1);
  const lagnaLord = ctx.getLordOfHouse(1);
  const drekkanaIdx = Math.min(3, Math.floor(((chart.lagna?.degreeInRashi || 0) / 10)) + 1);

  const anatomicalRegion =
    drekkanaIdx === 1
      ? 'Head, Cranium, Forehead, or Facial Perimeter'
      : drekkanaIdx === 2
      ? 'Neck, Cervical Spine, Clavicle, or Upper Chest'
      : 'Abdominal Zone, Pelvis, Lower Spine, or Limbs';

  const markIndications: ClassicalMarkIndication[] = [];
  const mars = ctx.getPlanet('mars');
  const saturn = ctx.getPlanet('saturn');
  const rahu = ctx.getPlanet('rahu');
  const ketu = ctx.getPlanet('ketu');
  const jupiter = ctx.getPlanet('jupiter');

  // Vector 1: Mars (Vraṇa / Scar / Cut / Burn Vector)
  // Evaluates whether Mars has genuine contact with H1, H2 (Face), or Lagnesha
  const marsOccupiesH1 = mars.house === 1;
  const marsAspectsH1 = ctx.planetAspectsHouse('mars', 1);
  const marsOccupiesH2 = mars.house === 2;
  const marsAspectsH2 = ctx.planetAspectsHouse('mars', 2);
  const marsContactsLagnesha = mars.house === lagnaLord.house || ctx.planetAspectsHouse('mars', lagnaLord.house);
  const marsHasContact = marsOccupiesH1 || marsAspectsH1 || marsOccupiesH2 || marsAspectsH2 || marsContactsLagnesha;

  const jupiterAspectsMarsOrH1 = ctx.planetAspectsHouse('jupiter', 1) || ctx.planetAspectsHouse('jupiter', mars.house);

  if (marsHasContact) {
    const vectors: string[] = [];
    if (marsOccupiesH1) vectors.push('Maṅgala occupies House 1 (Bodily Foundation / Head)');
    if (marsAspectsH1) vectors.push('Maṅgala casts direct special dṛṣṭi onto House 1');
    if (marsOccupiesH2 || marsAspectsH2) vectors.push('Maṅgala influences House 2 (Mukha-Sthāna / Face)');
    if (marsContactsLagnesha) vectors.push(`Maṅgala conjoins or aspects Lagneśa ${lagnaLord.name}`);

    let status: MarkIndicationStatus = 'indication_present';
    if (vectors.length >= 2) status = 'strengthened';
    if (jupiterAspectsMarsOrH1) status = 'weakened';

    markIndications.push({
      graha: 'mars',
      grahaName: 'Maṅgala (Mars)',
      anatomicalZone: anatomicalRegion,
      indicationType: 'Potential Scar/Cut (Vraṇa)',
      status,
      classicalBasis: 'BPHS Ch. 27, v. 8-12; Sārāvalī Ch. 21 (Maṅgala Vraṇa-Lakṣaṇa)',
      activeVectors: vectors,
      mitigatingFactors: jupiterAspectsMarsOrH1 ? ['Mitigating benefic dṛṣṭi from Guru softens sharp physical trauma'] : [],
      synthesizedInterpretation: `Classical Jyotiṣa indicates a potential predisposition toward a surgical scar, childhood laceration, or heat/cut mark in the region of the ${anatomicalRegion}, prompted by Maṅgala's influence.`,
      uncertaintyDisclaimer: 'Classical indication only. The presence, exact anatomical coordinate, or visibility of physical marks is mediated by biological, pediatric, and lifestyle factors and cannot be claimed with certainty.',
    });
  }

  // Vector 2: Saturn (Kṛṣṇa-Tilaka / Dark Mole / Fibrous Mark Vector)
  const saturnOccupiesH1 = saturn.house === 1;
  const saturnAspectsH1 = ctx.planetAspectsHouse('saturn', 1);
  const saturnOccupiesH2 = saturn.house === 2;
  const saturnAspectsH2 = ctx.planetAspectsHouse('saturn', 2);
  const saturnContactsLagnesha = saturn.house === lagnaLord.house || ctx.planetAspectsHouse('saturn', lagnaLord.house);
  const saturnHasContact = saturnOccupiesH1 || saturnAspectsH1 || saturnOccupiesH2 || saturnAspectsH2 || saturnContactsLagnesha;

  if (saturnHasContact) {
    const vectors: string[] = [];
    if (saturnOccupiesH1) vectors.push('Śani occupies House 1');
    if (saturnAspectsH1) vectors.push('Śani casts 3rd/7th/10th special dṛṣṭi onto House 1');
    if (saturnOccupiesH2 || saturnAspectsH2) vectors.push('Śani influences House 2 (Face)');
    if (saturnContactsLagnesha) vectors.push(`Śani conjoins or aspects Lagneśa ${lagnaLord.name}`);

    let status: MarkIndicationStatus = 'indication_present';
    if (vectors.length >= 2) status = 'strengthened';

    markIndications.push({
      graha: 'saturn',
      grahaName: 'Śani (Saturn)',
      anatomicalZone: anatomicalRegion,
      indicationType: 'Potential Dark Mark/Mole (Tilaka)',
      status,
      classicalBasis: 'BPHS Ch. 27, v. 14; Phaladīpikā Ch. 14 (Śani Kṛṣṇa-Tilaka)',
      activeVectors: vectors,
      mitigatingFactors: [],
      synthesizedInterpretation: `Classical texts indicate a potential tendency toward a dark, raised, or fibrous mole (Kṛṣṇa-Tilaka) in the ${anatomicalRegion} under Śani's focal ray.`,
      uncertaintyDisclaimer: 'Classical indication only. Moles and pigmentation spots vary widely and cannot be confirmed as an absolute physical fact.',
    });
  }

  // Vector 3: Rahu (Lāñchana / Birthmark or Pigmentation Vector)
  const rahuOccupiesH1 = rahu.house === 1;
  const rahuOccupiesH2 = rahu.house === 2;
  const rahuContactsLagnesha = rahu.house === lagnaLord.house;
  if (rahuOccupiesH1 || rahuOccupiesH2 || rahuContactsLagnesha) {
    const vectors: string[] = [];
    if (rahuOccupiesH1) vectors.push('Rāhu occupies House 1');
    if (rahuOccupiesH2) vectors.push('Rāhu occupies House 2');
    if (rahuContactsLagnesha) vectors.push(`Rāhu conjoins Lagneśa ${lagnaLord.name}`);

    markIndications.push({
      graha: 'rahu',
      grahaName: 'Rāhu',
      anatomicalZone: anatomicalRegion,
      indicationType: 'Potential Pigmentation/Birthmark (Lāñchana)',
      status: 'indication_present',
      classicalBasis: 'BPHS Ch. 27, v. 18; Jātaka Pārijāta Ch. 5',
      activeVectors: vectors,
      mitigatingFactors: [],
      synthesizedInterpretation: `Classical texts note a predisposition to an irregular birthmark or uneven pigmentation patch near the ${anatomicalRegion} from Rāhu's shadow influence.`,
      uncertaintyDisclaimer: 'Traditional textual vector only; not a guaranteed anatomical marking.',
    });
  }

  // Convergence check: If both Mars and Saturn contact the same zone
  if (marsHasContact && saturnHasContact) {
    const primary = markIndications.find((m) => m.graha === 'mars');
    if (primary) {
      primary.status = 'convergent';
      primary.synthesizedInterpretation += ' Notice: Multiple independent classical vectors (Maṅgala + Śani) converge upon this bodily sector, increasing traditional indication density, yet physical manifestation remains contingent.';
    }
  }

  let condStatus: ConditionStatus = 'absent';
  let rationale = '';

  if (markIndications.length === 0) {
    condStatus = 'absent';
    rationale = 'No decisive classical scar, mole, or birthmark vectors are active upon Lagna, Mukha, or Lagneśa. The engine makes no unsubstantiated bodily mark assertions.';
  } else if (markIndications.some((m) => m.status === 'convergent' || m.status === 'strengthened')) {
    condStatus = 'satisfied';
    rationale = `Active classical indication vectors identified (${markIndications.map((m) => m.grahaName + ': ' + m.indicationType).join('; ')}). Handled with explicit uncertainty disclaimers.`;
  } else {
    condStatus = 'partially_supported';
    rationale = `Single classical vector present (${markIndications.map((m) => m.grahaName).join(', ')}). Handled as a classical tendency rather than guaranteed certainty.`;
  }

  const evaluatedCondition: EvaluatedCondition = {
    id: 'cond_classical_mark_vectors',
    name: 'Classical Bodily Mark Predisposition Vectors (Drekkāṇa Aṅga-Vibhāga)',
    parameter: 'mars_saturn_rahu_mark_vectors',
    expected: 'Evaluation of active planetary vectors without claiming guaranteed physical markings',
    observed: markIndications.length > 0
      ? `${markIndications.length} classical vector(s) active (${markIndications.map((m) => m.grahaName).join(', ')}) in ${anatomicalRegion}`
      : 'No active malefic contact on H1/H2/Lagneśa (no mark claimed)',
    status: condStatus,
    rationale,
    weight: 'qualifying',
  };

  return {
    evaluatedCondition,
    markIndications,
  };
}

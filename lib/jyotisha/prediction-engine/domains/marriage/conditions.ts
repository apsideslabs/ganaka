/**
 * Gaṇaka — Domain 6: Marriage, Spouse & Partnership Conditions (Phase 6)
 * 
 * Classical conditions evaluated strictly through:
 * - BPHS Ch. 13 (Saptamabhāva Phala), Ch. 6 (Śoḍaśavarga), Ch. 28-29 (Upapada)
 * - Phaladīpikā Ch. 10 (Kalatrabhāva Phala)
 * - Sārāvalī Ch. 35 (Saptama Phala)
 * - Jātaka Pārijāta Ch. 14 (Kalatra Phala)
 * - Jaimini Upadeśa Sūtras 1.4 (Upapada & Dārakāraka)
 * - Uttara Kālāmṛta Kāṇḍa 5 (Kārakas & Kuja Doṣa Bhaṅga)
 */

import { PredictionContext, NATURAL_BENEFICS, NATURAL_MALEFICS } from '../../context';
import { EvaluatedCondition, ConditionStatus } from '../../types';
import { PlanetId, RashiNumber } from '../../../types';
import { RASHIS, GRAHA_NAMES } from '../../../constants';
import { calculateChartNavamshaBreakdown } from '../../../../vargas/navamsha';
import {
  SpousalProfile,
  SpousalTemperamentArchetype,
  KujaDoshaAnalysis,
  D9NavamshaConfirmation,
  JaiminiMarriageFactors,
  MarriageTimingArc,
  TimingCategory,
} from './types';

// ============================================================================
// 1. SAPTAMĀDHIPATI MULTI-FACTOR CONDITION (7th Lord in D1)
// ============================================================================
export function evaluateSaptameshaMultiFactorCondition(ctx: PredictionContext): EvaluatedCondition {
  const seventhLord = ctx.getLordOfHouse(7);
  const isInKendra = [1, 4, 7, 10].includes(seventhLord.house);
  const isInTrikona = [5, 9].includes(seventhLord.house);
  const isInDusthana = [6, 8, 12].includes(seventhLord.house);
  const hasHighDignity = seventhLord.isExalted || seventhLord.isOwnSign || seventhLord.isMoolatrikona;
  const isFriendly = seventhLord.isFriendly;
  const isDebilitated = seventhLord.isDebilitated;
  const isCombust = seventhLord.isCombust;
  const isRetrograde = seventhLord.isRetrograde;
  const isVargottama = seventhLord.isVargottama;

  const nb = isDebilitated ? ctx.checkNichabhanga(seventhLord.id) : { isNichabhanga: false, reasons: [] };

  const lordHouseAspects = ctx.getHouse(seventhLord.house).aspectsReceived;
  const beneficAspects = lordHouseAspects.filter((a) => a.isBenefic);
  const maleficAspects = lordHouseAspects.filter((a) => !a.isBenefic);

  let status: ConditionStatus = 'insufficient_evidence';
  let rationale = '';

  if (hasHighDignity && (isInKendra || isInTrikona) && !isCombust) {
    status = 'satisfied';
    rationale = `7th Lord ${seventhLord.name} holds commanding dignity (${seventhLord.dignity}) in House ${seventhLord.house} (${isInKendra ? 'Kendra' : 'Trikona'}), confirming foundational marital harmony, partner devotion, and stable domestic prosperity per BPHS Ch. 13.`;
  } else if (isInDusthana) {
    if (seventhLord.house === 6) {
      if (hasHighDignity || beneficAspects.length > 0) {
        status = 'partially_supported';
        rationale = `7th Lord ${seventhLord.name} sits in the 6th House with ${seventhLord.dignity} dignity and benefic aspect; relational bond requires proactive problem-solving and patient conflict resolution.`;
      } else {
        status = 'contradicted';
        rationale = `7th Lord ${seventhLord.name} placed in the 6th House (Ripu-Sthāna) without protective benefic aspects indicates recurrent disputes, friction, or partner health vulnerability per classical dictums.`;
      }
    } else if (seventhLord.house === 8) {
      if (nb.isNichabhanga || hasHighDignity || beneficAspects.length > 0) {
        status = 'partially_supported';
        rationale = `7th Lord ${seventhLord.name} sits in the 8th House (Randhrasthāna); indicates deep psychological bonding, shared emotional transformation, or periods of marital restructuring.`;
      } else {
        status = 'contradicted';
        rationale = `7th Lord ${seventhLord.name} placed in the 8th House without protective mitigation points to relational turbulence, undisclosed tensions, or in-law interference per BPHS Ch. 13.`;
      }
    } else {
      // 12th house
      if (hasHighDignity || beneficAspects.length > 0) {
        status = 'partially_supported';
        rationale = `7th Lord ${seventhLord.name} situated in the 12th House (Vyayasthāna); classically suggests a partner from distant origin, private companionship, or spiritual intimacy.`;
      } else {
        status = 'contradicted';
        rationale = `7th Lord ${seventhLord.name} placed in the 12th House without benefic support suggests mutual misunderstandings, expenditure through marriage, or emotional distance.`;
      }
    }
  } else if (isCombust) {
    status = 'contradicted';
    rationale = `7th Lord ${seventhLord.name} is Astaṅgata (combust within solar orb in House ${seventhLord.house}), indicating potential ego collisions, unexpressed needs, or overshadowing of spousal identity.`;
  } else if (isDebilitated && !nb.isNichabhanga) {
    status = 'contradicted';
    rationale = `7th Lord ${seventhLord.name} is debilitated in House ${seventhLord.house} without confirmed Nīchabhaṅga cancellation, representing structural vulnerability in marital stability.`;
  } else if (isDebilitated && nb.isNichabhanga) {
    status = 'partially_supported';
    rationale = `7th Lord ${seventhLord.name} is debilitated but redeemed by confirmed Nīchabhaṅga (${nb.reasons.join(', ')}), indicating early relational trials that evolve into enduring maturity.`;
  } else if (isInKendra || isInTrikona) {
    status = 'satisfied';
    rationale = `7th Lord ${seventhLord.name} is favorably positioned in House ${seventhLord.house} (${seventhLord.dignity}${isRetrograde ? ', retrograde' : ''}${isVargottama ? ', Vargottama' : ''}), supporting steady marital commitment.`;
  } else {
    status = 'partially_supported';
    rationale = `7th Lord ${seventhLord.name} in House ${seventhLord.house} holds neutral dignity (${seventhLord.dignity}), yielding ordinary relational outcomes dependent on supporting planetary yogas.`;
  }

  return {
    id: 'cond_saptamesha_multifactor',
    name: 'Saptamādhipati (7th Lord) Positional Integrity & Dignity',
    parameter: '7th Lord House, Dignity, Combustion, Ṣaḍbala & Aspects',
    expected: '7th Lord placed in Kendra, Trikona, or own/exalted sign with freedom from combustion and malefic affliction',
    observed: `${seventhLord.name} in H${seventhLord.house} (${seventhLord.rashiName}, ${seventhLord.dignity}, Ṣaḍbala ${seventhLord.shadbalaRatio.toFixed(2)}x${seventhLord.isCombust ? ', COMBUST' : ''}${seventhLord.isRetrograde ? ', Retrograde' : ''}${seventhLord.isVargottama ? ', Vargottama' : ''})`,
    status,
    weight: 'mandatory',
    rationale,
  };
}

// ============================================================================
// 2. SAPTAMA BHĀVA RAY CONVERGENCE (7th House Occupants & Aspects)
// ============================================================================
export function evaluateSeventhBhavaRayCondition(ctx: PredictionContext): EvaluatedCondition {
  const h7 = ctx.getHouse(7);
  const beneficOccupants = h7.beneficOccupants;
  const maleficOccupants = h7.maleficOccupants;
  const aspects = h7.aspectsReceived;
  const beneficAspects = aspects.filter((a) => a.isBenefic);
  const maleficAspects = aspects.filter((a) => !a.isBenefic);

  // Check Pāpakartarī on 7th House (malefics in 6th and 8th)
  const h6 = ctx.getHouse(6);
  const h8 = ctx.getHouse(8);
  const hasMaleficIn6 = h6.maleficOccupants.length > 0;
  const hasMaleficIn8 = h8.maleficOccupants.length > 0;
  const isPapakartari = hasMaleficIn6 && hasMaleficIn8;

  // Check Śubhakartarī on 7th House
  const hasBeneficIn6 = h6.beneficOccupants.length > 0;
  const hasBeneficIn8 = h8.beneficOccupants.length > 0;
  const isShubhakartari = hasBeneficIn6 && hasBeneficIn8;

  let status: ConditionStatus = 'insufficient_evidence';
  let rationale = '';

  if (beneficOccupants.length > 0 && maleficOccupants.length === 0 && !isPapakartari) {
    status = 'satisfied';
    rationale = `7th House is sanctified by noble benefic occupants (${beneficOccupants.join(', ')}), bestowing refinement, mutual courtesy, and affectionate domestic peace per Sārāvalī Ch. 35.`;
  } else if (isShubhakartari) {
    status = 'satisfied';
    rationale = `7th House is blessed by Śubhakartarī Yoga (hemmed by benefics in 6th and 8th), shielding the marriage from exterior family discord.`;
  } else if (beneficAspects.length > 0 && maleficOccupants.length === 0 && !isPapakartari) {
    status = 'satisfied';
    rationale = `7th House receives benevolent classical dṛṣṭi from ${beneficAspects.map((a) => `${a.planetId} (${a.aspectType})`).join(', ')}, elevating matrimonial concord.`;
  } else if (isPapakartari) {
    if (beneficAspects.length > 0) {
      status = 'partially_supported';
      rationale = `Pāpakartarī Yoga surrounds the 7th house, but its constrictive impact is actively softened by direct benefic aspect from ${beneficAspects.map((a) => a.planetId).join(', ')}.`;
    } else {
      status = 'contradicted';
      rationale = `7th House is besieged by Pāpakartarī Yoga (malefics flanking 6th and 8th) without benefic relief, indicating external family pressures or emotional claustrophobia.`;
    }
  } else if (maleficOccupants.length > 0) {
    if (beneficAspects.length > 0) {
      status = 'partially_supported';
      rationale = `7th House contains malefic presence (${maleficOccupants.join(', ')}), but concurrent benefic dṛṣṭi from ${beneficAspects.map((a) => a.planetId).join(', ')} converts tension into constructive mutual growth.`;
    } else {
      status = 'contradicted';
      rationale = `7th House is occupied by malefic energy (${maleficOccupants.join(', ')}) without benefic intervention, demanding conscious tolerance and mature emotional boundaries.`;
    }
  } else {
    status = 'partially_supported';
    rationale = `7th House is unoccupied and free from severe malefic rays, providing a neutral canvas for partnership that responds primarily to the 7th lord and Venus.`;
  }

  return {
    id: 'cond_saptama_bhava_rays',
    name: 'Saptama Bhāva Ray Convergence (7th House Environmental Purity)',
    parameter: '7th House Occupants, Planetary Aspects & Kartarī Yogas',
    expected: 'Benefic presence or aspects with total absence of malefic corruption or Pāpakartarī',
    observed: `Occupants: [${h7.occupants.join(', ') || 'none'}], Benefic Aspects: [${beneficAspects.map((a) => a.planetId).join(', ') || 'none'}], Malefic Aspects: [${maleficAspects.map((a) => a.planetId).join(', ') || 'none'}]${isPapakartari ? ', Pāpakartarī active' : ''}${isShubhakartari ? ', Śubhakartarī active' : ''}`,
    status,
    weight: 'qualifying',
    rationale,
  };
}

// ============================================================================
// 3. KALATRAKĀRAKA ŚUKRA & GURU VITALITY CONDITION
// ============================================================================
export function evaluateKalatrakarakaCondition(ctx: PredictionContext): EvaluatedCondition {
  const venus = ctx.getPlanet('venus');
  const jupiter = ctx.getPlanet('jupiter');

  const venusInKendra = [1, 4, 7, 10].includes(venus.house);
  const venusInTrikona = [5, 9].includes(venus.house);
  const venusInDusthana = [6, 8, 12].includes(venus.house);
  const venusDignified = venus.isExalted || venus.isOwnSign || venus.isMoolatrikona;

  const nb = venus.isDebilitated ? ctx.checkNichabhanga('venus') : { isNichabhanga: false, reasons: [] };

  let status: ConditionStatus = 'insufficient_evidence';
  let rationale = '';

  if ((venusDignified || (venusInKendra && !venusInDusthana) || venusInTrikona) && !venus.isCombust && venus.shadbalaRatio >= 1.0) {
    status = 'satisfied';
    rationale = `Kalatrakāraka Venus is powerfully placed in House ${venus.house} (${venus.rashiName}, ${venus.dignity}, Ṣaḍbala ${venus.shadbalaRatio.toFixed(2)}x), infusing the native with emotional refinement, marital devotion, and harmonious attachment capacity.`;
  } else if (venus.isCombust) {
    status = 'partially_supported';
    rationale = `Venus is combust (Astaṅgata within solar orb in House ${venus.house}); demands that personal romantic expectations be tempered with realism and unpossessive affection.`;
  } else if (venus.isDebilitated && !nb.isNichabhanga) {
    status = 'contradicted';
    rationale = `Venus is debilitated in Virgo without Nīchabhaṅga cancellation, representing critical over-analysis of partners or difficulty enjoying domestic peace.`;
  } else if (venus.isDebilitated && nb.isNichabhanga) {
    status = 'partially_supported';
    rationale = `Venus is debilitated in Virgo but mitigated by confirmed Nīchabhaṅga (${nb.reasons.join(', ')}), evolving intellectual discernment into genuine relationship maturity.`;
  } else if (venusInDusthana) {
    if (jupiter.shadbalaRatio >= 1.05 && !jupiter.isCombust) {
      status = 'partially_supported';
      rationale = `Venus resides in Dusthāna House ${venus.house}, but a fortified Jupiter (Ṣaḍbala ${jupiter.shadbalaRatio.toFixed(2)}x) acts as a dharmic stabilizer safeguarding marital ethics.`;
    } else {
      status = 'contradicted';
      rationale = `Venus occupies Dusthāna House ${venus.house} without sufficient counterbalancing Jupiterian grace, inclining toward marital expenses or emotional dissatisfaction.`;
    }
  } else {
    status = 'partially_supported';
    rationale = `Venus sits in House ${venus.house} (${venus.dignity}, Ṣaḍbala ${venus.shadbalaRatio.toFixed(2)}x), supporting normative romantic bonding subject to transits and daśā cycles.`;
  }

  return {
    id: 'cond_kalatrakaraka_vitality',
    name: 'Kalatrakāraka Śukra & Guru Vitality (Universal Significator Strength)',
    parameter: 'Venus House, Dignity, Combustion, Ṣaḍbala & Jupiterian Support',
    expected: 'Venus dignified, uncombust, possessing Ṣaḍbala >= 1.0 in Kendra or Trikona',
    observed: `Venus in H${venus.house} (${venus.rashiName}, ${venus.dignity}, Ṣaḍbala ${venus.shadbalaRatio.toFixed(2)}x${venus.isCombust ? ', COMBUST' : ''}${venus.isRetrograde ? ', Retrograde' : ''}), Jupiter Ṣaḍbala ${jupiter.shadbalaRatio.toFixed(2)}x`,
    status,
    weight: 'mandatory',
    rationale,
  };
}

// ============================================================================
// 4. SAPTAMA BHĀVA AṢṬAKAVARGA (SAV) CONDITION
// ============================================================================
export function evaluateSeventhSAVCondition(ctx: PredictionContext): EvaluatedCondition {
  const h7 = ctx.getHouse(7);
  const savBindus = h7.savBindus;
  const classification = h7.savClassification;

  let status: ConditionStatus = 'insufficient_evidence';
  let rationale = '';

  if (savBindus >= 32) {
    status = 'satisfied';
    rationale = `7th House possesses an extraordinary accumulation of ${savBindus} SAV bindus (exceeding high threshold of 32), granting exceptional structural durability, protection from slander, and resilience against marital dissolution per BPHS Aṣṭakavarga.`;
  } else if (savBindus >= 28) {
    status = 'satisfied';
    rationale = `7th House is well-endowed with ${savBindus} SAV bindus (at or above baseline 28), providing stable containment capacity for domestic harmony through diverse life cycles.`;
  } else if (savBindus >= 24) {
    status = 'partially_supported';
    rationale = `7th House receives ${savBindus} SAV bindus (mild deficit below baseline 28), calling for conscious flexibility and conscious investment in shared communication.`;
  } else {
    status = 'contradicted';
    rationale = `7th House suffers a critical bindu deficit of ${savBindus} SAV bindus (<24), indicating heightened susceptibility to interpersonal exhaustion or external marital friction.`;
  }

  return {
    id: 'cond_saptama_sav',
    name: 'Saptama Bhāva Aṣṭakavarga Reservoir (Marital Containment Capacity)',
    parameter: '7th House Samudāya Aṣṭakavarga (SAV) Bindus',
    expected: '>= 28 Bindus for solid relational endurance (>= 32 is exceptionally fortified)',
    observed: `${savBindus} Bindus (Classification: ${classification.toUpperCase()}, Baseline: 28)`,
    status,
    weight: 'qualifying',
    rationale,
  };
}

// ============================================================================
// 5. SPOUSAL TEMPERAMENT & ARCHETYPE CONDITION (Sārāvalī & Jaimini DK)
// ============================================================================
export function evaluateSpouseTemperamentCondition(ctx: PredictionContext): {
  evaluatedCondition: EvaluatedCondition;
  spousalProfile: SpousalProfile;
} {
  const h7 = ctx.getHouse(7);
  const seventhLord = ctx.getLordOfHouse(7);
  const jaiminiDk = ctx.chart.jaimini?.charaKarakas?.find((k) => k.karakaKey === 'DK');
  const dkPlanetId: PlanetId = jaiminiDk?.planet || seventhLord.id;

  const planetInfluenceScores: Record<PlanetId, number> = {
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

  h7.occupants.forEach((pId) => {
    planetInfluenceScores[pId] = (planetInfluenceScores[pId] || 0) + 4;
  });
  planetInfluenceScores[seventhLord.id] = (planetInfluenceScores[seventhLord.id] || 0) + 3;
  planetInfluenceScores[dkPlanetId] = (planetInfluenceScores[dkPlanetId] || 0) + 3;
  h7.aspectsReceived.forEach((a) => {
    planetInfluenceScores[a.planetId] = (planetInfluenceScores[a.planetId] || 0) + 1.5;
  });

  let dominantPlanet: PlanetId = 'jupiter';
  let maxScore = -1;
  const candidatePlanets: PlanetId[] = ['jupiter', 'venus', 'mercury', 'moon', 'sun', 'mars', 'saturn', 'rahu', 'ketu'];

  candidatePlanets.forEach((pId) => {
    const s = planetInfluenceScores[pId] || 0;
    if (s > maxScore) {
      maxScore = s;
      dominantPlanet = pId;
    }
  });

  const ARCHETYPE_MAP: Record<
    PlanetId,
    {
      archetype: SpousalTemperamentArchetype;
      title: string;
      sanskritName: string;
      temperament: string;
      dispositions: string[];
      contribution: string;
      growthAreas: string[];
    }
  > = {
    jupiter: {
      archetype: 'dharmic_philosophical_magnanimous',
      title: 'Dharmic Counselor & Magnanimous Anchor',
      sanskritName: 'गुरुस्वरूप कलत्र (धर्मात्मा)',
      temperament: 'Learned, ethical, generous, possessing sound judgment, spiritual inclinations, and respect for tradition.',
      dispositions: ['High moral integrity', 'Philosophical temperament', 'Encourages higher learning', 'Family-oriented wisdom'],
      contribution: 'Brings spiritual elevation, domestic respectability, and unshakeable moral counsel to the household.',
      growthAreas: ['May hold high doctrinal expectations', 'Requires mutual intellectual and ethical respect'],
    },
    venus: {
      archetype: 'refined_aesthetic_affectionate',
      title: 'Aesthetic Harmonizer & Affectionate Companion',
      sanskritName: 'शुक्रस्वरूप कलत्र (सौन्दर्य-प्रीति)',
      temperament: 'Charming, artistically inclined, devoted to elegance, mutual comfort, social grace, and reciprocal affection.',
      dispositions: ['Refined cultural taste', 'Appreciation for fine arts and beauty', 'Gentle communicative style', 'Warm romantic devotion'],
      contribution: 'Infuses domestic life with joy, artistic ambiance, gracious hospitality, and empathetic reconciliation.',
      growthAreas: ['Discomfort with coarse or aggressive environments', 'Highly sensitive to aesthetic neglect'],
    },
    mercury: {
      archetype: 'intellectual_articulate_youthful',
      title: 'Articulate Intellect & Adaptable Companion',
      sanskritName: 'बुधस्वरूप कलत्र (विद्या-चातुर्य)',
      temperament: 'Witty, communicative, analytical, youthful in demeanor, curious, possessing strong logistical and commercial acumen.',
      dispositions: ['Sharp verbal intellect', 'Humorous and lively disposition', 'Curiosity across diverse domains', 'Skilled organizer'],
      contribution: 'Provides stimulating intellectual partnership, skilled management of domestic affairs, and cheerful companionship.',
      growthAreas: ['Prone to over-intellectualizing feelings', 'Restlessness under rigid routines'],
    },
    moon: {
      archetype: 'gentle_nurturing_empathic',
      title: 'Nurturing Empath & Intuitive Guardian',
      sanskritName: 'चन्द्रस्वरूप कलत्र (मातृस्नेह-सौम्य)',
      temperament: 'Gentle, emotionally responsive, deeply protective of loved ones, intuitive, and receptive to environment.',
      dispositions: ['Profound emotional empathy', 'Nurturing caretaking instinct', 'Appreciation for domestic comfort', 'Imaginative sensitivity'],
      contribution: 'Creates a sanctuary of deep emotional warmth, security, and intuitive understanding.',
      growthAreas: ['Fluctuating emotional cycles', 'High vulnerability to environmental discord'],
    },
    sun: {
      archetype: 'dignified_authoritative_commanding',
      title: 'Sovereign Leader & Dignified Pillar',
      sanskritName: 'सूर्यस्वरूप कलत्र (तेजस्वी-स्वाभिमानी)',
      temperament: 'Proud, noble, principled, holding high standards of self-respect, leadership, and public dignity.',
      dispositions: ['Strong personal sovereignty', 'Protective of familial honor', 'Leadership presence', 'Uncompromising principles'],
      contribution: 'Offers a formidable pillar of societal honor, executive clarity, and unbending loyalty.',
      growthAreas: ['Susceptible to ego friction if authority is challenged', 'Prone to command rather than negotiate'],
    },
    mars: {
      archetype: 'dynamic_passionate_independent',
      title: 'Dynamic Pioneer & Passionate Defender',
      sanskritName: 'मङ्गलस्वरूप कलत्र (शौर्य-पराक्रम)',
      temperament: 'Courageous, candid, highly energetic, physically or technically driven, independent and protective.',
      dispositions: ['Fierce loyalty and courage', 'Direct and unvarnished communication', 'High vitality and enterprise', 'Immediate action-orientation'],
      contribution: 'Protects the family fiercely, brings dynamic drive, and tackles practical crises with bold decisiveness.',
      growthAreas: ['Impatience and quick temper', 'Requires constructive channels for competitive energy'],
    },
    saturn: {
      archetype: 'mature_austere_disciplined_practical',
      title: 'Disciplined Realist & Enduring Pillar',
      sanskritName: 'शनिस्वरूप कलत्र (धैर्य-तपस्वी)',
      temperament: 'Mature, practical, patient, resilient, capable of enduring hardship and building security systematically.',
      dispositions: ['Exceptional endurance and patience', 'Grounded pragmatism', 'Cautious with resources', 'Sober, loyal commitment'],
      contribution: 'Anchors the marriage in unshakeable long-term stability, material prudence, and faithful endurance through trials.',
      growthAreas: ['Reserved in vocalizing emotional warmth', 'Can lean toward austerity or excessive caution'],
    },
    rahu: {
      archetype: 'unconventional_cross_cultural_ambitious',
      title: 'Unconventional Innovator & Cross-Cultural Explorer',
      sanskritName: 'राहुस्वरूप कलत्र (अपूर्व-विदेशी)',
      temperament: 'Unorthodox, ambitious, often hailing from a different cultural, geographic, or ideological background; pioneering.',
      dispositions: ['Transcends conventional norms', 'Ambitious worldly outlook', 'Fascinated by emergent frontiers', 'Intense transformative drive'],
      contribution: 'Expands the native’s worldview beyond traditional boundaries, introducing exciting growth and unique opportunities.',
      growthAreas: ['Unpredictable life pivots', 'Requires clear relational boundaries to ground ambition'],
    },
    ketu: {
      archetype: 'spiritual_detached_contemplative',
      title: 'Spiritual Ascetic & Contemplative Mystic',
      sanskritName: 'केतुस्वरूप कलत्र (अन्तःप्रज्ञ-विरागी)',
      temperament: 'Introspective, modest, spiritually inclined, non-materialistic, possessing deep psychological or metaphysical discernment.',
      dispositions: ['Freedom from superficial materialism', 'Quiet contemplative presence', 'Natural intuitive discernment', 'Disregard for pretense'],
      contribution: 'Reminds the union of higher purpose, deep detachment from transient trivia, and profound spiritual peace.',
      growthAreas: ['Periods of emotional aloofness or withdrawal', 'Indifference to conventional social ambitions'],
    },
    true_rahu: {
      archetype: 'unconventional_cross_cultural_ambitious',
      title: 'Unconventional Innovator & Cross-Cultural Explorer',
      sanskritName: 'राहुस्वरूप कलत्र (अपूर्व-विदेशी)',
      temperament: 'Unorthodox, ambitious, cross-cultural.',
      dispositions: ['Transcends conventional norms', 'Ambitious worldly outlook'],
      contribution: 'Broadens life horizons.',
      growthAreas: ['Unpredictable relational cycles'],
    },
    true_ketu: {
      archetype: 'spiritual_detached_contemplative',
      title: 'Spiritual Ascetic & Contemplative Mystic',
      sanskritName: 'केतुस्वरूप कलत्र (अन्तःप्रज्ञ-विरागी)',
      temperament: 'Introspective, modest, spiritually inclined.',
      dispositions: ['Freedom from materialism', 'Quiet depth'],
      contribution: 'Spiritual grounding.',
      growthAreas: ['Aloofness'],
    },
  };

  const archData = ARCHETYPE_MAP[dominantPlanet] || ARCHETYPE_MAP.jupiter;
  const signifyingGrahas: PlanetId[] = [dominantPlanet];
  if (dkPlanetId !== dominantPlanet && !signifyingGrahas.includes(dkPlanetId)) {
    signifyingGrahas.push(dkPlanetId);
  }
  if (seventhLord.id !== dominantPlanet && !signifyingGrahas.includes(seventhLord.id)) {
    signifyingGrahas.push(seventhLord.id);
  }

  const confidence = maxScore >= 6 ? 'high' : maxScore >= 3.5 ? 'moderate' : 'low';

  const spousalProfile: SpousalProfile = {
    primaryArchetype: archData.archetype,
    archetypeTitle: archData.title,
    sanskritName: archData.sanskritName,
    confidence,
    signifyingGrahas,
    temperamentDescription: archData.temperament,
    moralAndCulturalDispositions: archData.dispositions,
    partnershipContribution: archData.contribution,
    potentialGrowthAreas: archData.growthAreas,
  };

  const evaluatedCondition: EvaluatedCondition = {
    id: 'cond_spousal_temperament',
    name: 'Spousal Temperament & Core Archetype (Sārāvalī Ch. 35 & Jaimini DK)',
    parameter: '7th Occupants, 7th Lord & Dārakāraka Graha Archetype',
    expected: 'Definitive graha convergence illuminating spousal character and psychological disposition',
    observed: `Dominant Graha: ${dominantPlanet.toUpperCase()} (Score: ${maxScore.toFixed(1)}), Archetype: ${archData.title}, DK: ${ctx.getPlanet(dkPlanetId).name}, 7th Lord: ${seventhLord.name}`,
    status: 'satisfied',
    weight: 'qualifying',
    rationale: `Per Sārāvalī Ch. 35 & Jaimini Upadeśa Sūtras 1.4.11, the primary graha governing the 7th house and Dārakāraka identifies the partner's intrinsic temperament as "${archData.title}": ${archData.temperament}`,
  };

  return { evaluatedCondition, spousalProfile };
}

// ============================================================================
// 6. MANDA-KṚTA VIVĀHA-VILAMBA CONDITION (Delay vs Denial)
// ============================================================================
export function evaluateMandaVivahaVilambaCondition(ctx: PredictionContext): {
  evaluatedCondition: EvaluatedCondition;
  delayAnalysis: {
    isDelayed: boolean;
    delayingFactors: string[];
    mitigatingFactors: string[];
    classicalVerdict: string;
  };
} {
  const saturn = ctx.getPlanet('saturn');
  const h7 = ctx.getHouse(7);
  const seventhLord = ctx.getLordOfHouse(7);
  const jupiter = ctx.getPlanet('jupiter');

  const delayingFactors: string[] = [];
  const mitigatingFactors: string[] = [];

  if (h7.occupants.includes('saturn')) {
    delayingFactors.push('Saturn occupies the 7th house (Śani in Kalatra Bhāva); classically matures relational readiness after age 28–30.');
  }
  if (ctx.planetAspectsHouse('saturn', 7)) {
    delayingFactors.push('Saturn casts direct dṛṣṭi onto the 7th house, imposing rigorous discernment before finalizing marital commitment.');
  }
  if (saturn.house === seventhLord.house) {
    delayingFactors.push(`Saturn conjoins 7th Lord ${seventhLord.name} in House ${seventhLord.house}, decelerating marital timing toward chronological maturity.`);
  }
  if (saturn.house === 2) {
    delayingFactors.push('Saturn in 2nd house creates heavy domestic responsibilities that prioritize family duties prior to marriage.');
  }

  if (ctx.planetAspectsHouse('jupiter', 7)) {
    mitigatingFactors.push('Jupiter aspects the 7th house directly, lifting stagnation and infusing auspicious timing when dharma aligns.');
  }
  if (jupiter.house === seventhLord.house || [5, 7, 9].some((h) => ((seventhLord.house - jupiter.house + 12) % 12 + 1) === h)) {
    mitigatingFactors.push('Jupiter conjuncts or aspects the 7th Lord, dissolving denial into conscious, mature fulfillment.');
  }
  if (h7.savBindus >= 30) {
    mitigatingFactors.push(`High 7th house SAV bindus (${h7.savBindus}) guarantee that once solemnized, the bond endures steadfastly.`);
  }
  if (seventhLord.isExalted || seventhLord.isOwnSign) {
    mitigatingFactors.push(`7th Lord is dignified (${seventhLord.dignity}), safeguarding the ultimate realization of marriage.`);
  }

  const isDelayed = delayingFactors.length > 0;
  let classicalVerdict = '';

  if (isDelayed) {
    if (mitigatingFactors.length > 0) {
      classicalVerdict = 'Delay is not denial (विलम्बो न तु विनाशः): Saturn enforces maturity and deliberate choice; auspicious counters confirm enduring union in mature adulthood.';
    } else {
      classicalVerdict = 'Saturnine delay active: Marital timing requires patient personal consolidation, with peak stability manifesting past age 28–32.';
    }
  } else {
    classicalVerdict = 'Free from heavy Saturnine delay factors; marital timing unfolds through normal Daśā activations and developmental cycles.';
  }

  const evaluatedCondition: EvaluatedCondition = {
    id: 'cond_manda_vivaha_vilamba',
    name: 'Manda-kṛta Vivāha Vilamba (Saturnine Delay vs Denial Analysis)',
    parameter: 'Saturn Contact with 7th House, 7th Lord, 2nd House & Counterbalancing Jupiterian Rays',
    expected: 'Absence of severe Saturnine blockage, or clear presence of Jupiterian counter-relief confirming vilamba over vināśa',
    observed: `Saturn in H${saturn.house}, Delay Factors: ${delayingFactors.length}, Mitigating Factors: ${mitigatingFactors.length}${isDelayed ? ', DELAY ACTIVE' : ', NO DELAY'}`,
    status: isDelayed ? 'partially_supported' : 'satisfied',
    weight: 'qualifying',
    rationale: classicalVerdict,
  };

  return {
    evaluatedCondition,
    delayAnalysis: {
      isDelayed,
      delayingFactors,
      mitigatingFactors,
      classicalVerdict,
    },
  };
}

// ============================================================================
// 7. KUJA DOṢA (BHAUMA DOṢA) FORMATION & CLASSICAL BHAṄGA
// ============================================================================
export function evaluateKujaDoshaCondition(ctx: PredictionContext): {
  evaluatedCondition: EvaluatedCondition;
  kujaAnalysis: KujaDoshaAnalysis;
} {
  const mars = ctx.getPlanet('mars');
  const moon = ctx.getPlanet('moon');
  const venus = ctx.getPlanet('venus');
  const jupiter = ctx.getPlanet('jupiter');

  const kujaHouses = [1, 2, 4, 7, 8, 12];

  const fromLagna = kujaHouses.includes(mars.house);
  const marsFromMoon = ((mars.house - moon.house + 12) % 12) + 1;
  const fromMoon = kujaHouses.includes(marsFromMoon);
  const marsFromVenus = ((mars.house - venus.house + 12) % 12) + 1;
  const fromVenus = kujaHouses.includes(marsFromVenus);

  const isFormed = fromLagna || fromMoon || fromVenus;
  const cancellationFactors: string[] = [];

  if (isFormed) {
    if (mars.isOwnSign || mars.isExalted) {
      cancellationFactors.push(`Mars is in own/exalted sign (${mars.rashiName}); Kuja Doṣa cancelled per BPHS.`);
    }
    if (mars.rashiNumber === 5 || mars.rashiNumber === 11) {
      cancellationFactors.push(`Mars situated in ${mars.rashiName}; classical exemption applies per Bṛhat Jātaka.`);
    }
    if (mars.house === jupiter.house || ctx.planetAspectsHouse('jupiter', mars.house)) {
      cancellationFactors.push(`Guru conjoins or aspects Mars; divine grace subdues aggressive martial fire.`);
    }
    if (mars.house === moon.house) {
      cancellationFactors.push(`Chandra-Maṅgala Yoga dissolves negative martial afflictions into constructive enterprise.`);
    }
    if (mars.house === 2 && (mars.rashiNumber === 3 || mars.rashiNumber === 6)) {
      cancellationFactors.push('Mars in 2nd house in Mercury sign (Gemini/Virgo) is classically exempt.');
    }
    if (mars.house === 4 && (mars.rashiNumber === 1 || mars.rashiNumber === 8)) {
      cancellationFactors.push('Mars in 4th house in own sign (Aries/Scorpio) is classically exempt.');
    }
    if (mars.house === 7 && (mars.rashiNumber === 4 || mars.rashiNumber === 10)) {
      cancellationFactors.push('Mars in 7th house in Cancer (debilitated) or Capricorn (exalted) is classically exempt.');
    }
    if (mars.house === 8 && (mars.rashiNumber === 9 || mars.rashiNumber === 12)) {
      cancellationFactors.push('Mars in 8th house in Jupiterian sign (Sagittarius/Pisces) is classically exempt.');
    }
    if (mars.house === 12 && (mars.rashiNumber === 2 || mars.rashiNumber === 7)) {
      cancellationFactors.push('Mars in 12th house in Venusian sign (Taurus/Libra) is classically exempt.');
    }
    if (ctx.nativeAge >= 28) {
      cancellationFactors.push('Attainment of age 28+ classically matures martial impulses into conscious courage.');
    }
  }

  const isFullyCancelled = isFormed && cancellationFactors.length >= 2;
  const isMitigated = isFormed && cancellationFactors.length === 1;

  let severityGrade: 'none' | 'mild_mitigated' | 'moderate' | 'intense_unmitigated' = 'none';
  let shastricVerdict = '';

  if (!isFormed) {
    severityGrade = 'none';
    shastricVerdict = 'No Kuja Doṣa formed; chart is free from primary martial relational affliction.';
  } else if (isFullyCancelled) {
    severityGrade = 'mild_mitigated';
    shastricVerdict = 'Kuja Doṣa is fully cancelled (Bhauma Doṣa Bhaṅga) by multiple classical exemptions; domestic vitality is preserved.';
  } else if (isMitigated) {
    severityGrade = 'moderate';
    shastricVerdict = 'Kuja Doṣa formed with partial classical mitigation; occasional passionate friction requires mindful communication.';
  } else {
    severityGrade = 'intense_unmitigated';
    shastricVerdict = 'Kuja Doṣa active without direct classical cancellation; partner matching and emotional regulation are strongly indicated.';
  }

  const evaluatedCondition: EvaluatedCondition = {
    id: 'cond_kuja_dosha_analysis',
    name: 'Kuja Doṣa (Bhauma Doṣa) Rigorous Formation & Classical Bhaṅga',
    parameter: 'Mars Placement in H1, 2, 4, 7, 8, 12 from Lagna/Moon/Venus & Classical Exemptions',
    expected: 'No Kuja Doṣa formation, or robust classical Bhaṅga (cancellation via sign, dignity, or Jupiterian aspect)',
    observed: `Mars in H${mars.house} (${mars.rashiName}), Formed: ${isFormed}, Cancellations: ${cancellationFactors.length}, Severity: ${severityGrade.toUpperCase()}`,
    status: !isFormed || isFullyCancelled ? 'satisfied' : isMitigated ? 'partially_supported' : 'contradicted',
    weight: 'qualifying',
    rationale: shastricVerdict,
  };

  return {
    evaluatedCondition,
    kujaAnalysis: {
      isFormed,
      marsPlacementHouse: mars.house,
      referenceLagnasChecked: { fromLagna, fromMoon, fromVenus },
      cancellationFactors,
      isFullyCancelled,
      isMitigated,
      severityGrade,
      shastricVerdict,
    },
  };
}

// ============================================================================
// 8. NAVĀṂŚA (D9) CONFIRMATION CONDITION
// ============================================================================
export function evaluateD9NavamshaCondition(ctx: PredictionContext): {
  evaluatedCondition: EvaluatedCondition;
  d9Confirmation: D9NavamshaConfirmation;
} {
  const breakdown = calculateChartNavamshaBreakdown(ctx.chart.lagna, ctx.chart.planets);
  const seventhLord = ctx.getLordOfHouse(7);

  const lagnaNav = breakdown.lagnaNavamsha;
  const d9LagnaRashiNum = lagnaNav ? lagnaNav.navamshaRashiNumber : 1;
  const d9LagnaRashiName = lagnaNav ? lagnaNav.navamshaRashiName : 'Mesha';
  const d9LagnaLord = lagnaNav ? lagnaNav.navamshaLord : 'Mars';

  const d9SeventhRashiNum = (((d9LagnaRashiNum - 1 + 6) % 12) + 1) as RashiNumber;
  const d9SeventhRashiName = RASHIS[d9SeventhRashiNum]?.name || 'Tula';
  const d9SeventhLord = RASHIS[d9SeventhRashiNum]?.lord || 'venus';

  const d9SeventhOccupants: string[] = [];
  breakdown.planetsNavamsha.forEach((b) => {
    if (b.houseInD9 === 7) {
      d9SeventhOccupants.push(b.entityName);
    }
  });

  const d1LordNav = breakdown.planetsNavamsha.find((b) => b.entityId === seventhLord.id);
  const d1LordHouseInD9 = d1LordNav?.houseInD9 || 1;
  const d1LordRashiInD9 = d1LordNav?.navamshaRashiName || '';
  const d1LordIsVargottama = d1LordNav?.isVargottama || false;
  const d1LordIsPushkara = d1LordNav?.isPushkara || false;

  let d1LordDignityInD9 = 'neutral';
  if (d1LordNav) {
    const rNum = d1LordNav.navamshaRashiNumber;
    const pId = seventhLord.id;
    if (RASHIS[rNum]?.lord === pId) {
      d1LordDignityInD9 = 'own_sign';
    } else if (
      (pId === 'sun' && rNum === 1) ||
      (pId === 'moon' && rNum === 2) ||
      (pId === 'mars' && rNum === 10) ||
      (pId === 'mercury' && rNum === 6) ||
      (pId === 'jupiter' && rNum === 4) ||
      (pId === 'venus' && rNum === 12) ||
      (pId === 'saturn' && rNum === 7)
    ) {
      d1LordDignityInD9 = 'exalted';
    } else if (
      (pId === 'sun' && rNum === 7) ||
      (pId === 'moon' && rNum === 8) ||
      (pId === 'mars' && rNum === 4) ||
      (pId === 'mercury' && rNum === 12) ||
      (pId === 'jupiter' && rNum === 10) ||
      (pId === 'venus' && rNum === 6) ||
      (pId === 'saturn' && rNum === 1)
    ) {
      d1LordDignityInD9 = 'debilitated';
    }
  }

  const venusNav = breakdown.planetsNavamsha.find((b) => b.entityId === 'venus');
  const venusHouseInD9 = venusNav?.houseInD9 || 1;
  const venusRashiInD9 = venusNav?.navamshaRashiName || '';
  let venusDignityInD9 = 'neutral';
  if (venusNav) {
    if (venusNav.navamshaRashiNumber === 12) venusDignityInD9 = 'exalted';
    else if (venusNav.navamshaRashiNumber === 6) venusDignityInD9 = 'debilitated';
    else if ([2, 7].includes(venusNav.navamshaRashiNumber)) venusDignityInD9 = 'own_sign';
  }

  let vargaConfirmationStatus: D9NavamshaConfirmation['vargaConfirmationStatus'] = 'neutral_or_unverified';
  let shastricNote = '';

  const isD1LordFavorableInD9 = [1, 4, 5, 7, 9, 10, 11].includes(d1LordHouseInD9);
  const isD1LordDignifiedInD9 = ['exalted', 'own_sign'].includes(d1LordDignityInD9) || d1LordIsVargottama || d1LordIsPushkara;

  if (isD1LordDignifiedInD9 && isD1LordFavorableInD9) {
    vargaConfirmationStatus = 'powerfully_reinforced';
    shastricNote = `D1 7th Lord ${seventhLord.name} is fortified in D9 (${d1LordDignityInD9}${d1LordIsVargottama ? ', Vargottama' : ''}) in D9 House ${d1LordHouseInD9}; confirms high matrimonial fulfillment and dharmic unity.`;
  } else if (isD1LordFavorableInD9 && d1LordDignityInD9 !== 'debilitated') {
    vargaConfirmationStatus = 'moderately_supported';
    shastricNote = `D1 7th Lord sits in D9 House ${d1LordHouseInD9} (${d1LordRashiInD9}); supports stable domestic partnership without structural friction.`;
  } else if (d1LordDignityInD9 === 'debilitated' || [6, 8, 12].includes(d1LordHouseInD9)) {
    vargaConfirmationStatus = 'varga_friction_indicated';
    shastricNote = `D1 7th Lord encounters weakness in D9 (House ${d1LordHouseInD9}, ${d1LordDignityInD9}); cautions that outward social promise encounters internal psychological adjustments in marriage.`;
  } else {
    vargaConfirmationStatus = 'moderately_supported';
    shastricNote = 'Navāṃśa provides balanced baseline confirmation for relational development.';
  }

  const d9Confirmation: D9NavamshaConfirmation = {
    d9LagnaRashi: d9LagnaRashiName,
    d9LagnaLord,
    d9SeventhRashi: d9SeventhRashiName,
    d9SeventhLord,
    d9SeventhOccupants,
    d1SeventhLordInD9: {
      rashi: d1LordRashiInD9,
      houseFromD9Lagna: d1LordHouseInD9,
      dignityInD9: d1LordDignityInD9,
      isVargottama: d1LordIsVargottama,
      isPushkara: d1LordIsPushkara,
    },
    venusD9Placement: {
      rashi: venusRashiInD9,
      houseFromD9Lagna: venusHouseInD9,
      dignityInD9: venusDignityInD9,
    },
    vargaConfirmationStatus,
    shastricNote,
  };

  const evaluatedCondition: EvaluatedCondition = {
    id: 'cond_d9_navamsha_confirmation',
    name: 'Navāṃśa (D9) Kalatra & Dharma Confirmation',
    parameter: 'D9 Lagna, D9 7th House/Lord & D1 7th Lord Placement in D9',
    expected: 'D1 7th Lord placed in Kendra, Trikona, or dignified sign in D9 (avoiding D9 Dusthānas 6, 8, 12)',
    observed: `D9 Lagna: ${d9LagnaRashiName}, D1 7th Lord ${seventhLord.name} in D9 H${d1LordHouseInD9} (${d1LordRashiInD9}, ${d1LordDignityInD9}${d1LordIsVargottama ? ', Vargottama' : ''})`,
    status:
      vargaConfirmationStatus === 'powerfully_reinforced' || vargaConfirmationStatus === 'moderately_supported'
        ? 'satisfied'
        : vargaConfirmationStatus === 'varga_friction_indicated'
        ? 'contradicted'
        : 'partially_supported',
    weight: 'mandatory',
    rationale: shastricNote,
  };

  return { evaluatedCondition, d9Confirmation };
}

// ============================================================================
// 9. JAIMINI UPAPADA LAGNA (UL) & DĀRAKĀRAKA (DK) CONDITION
// ============================================================================
export function evaluateJaiminiMarriageCondition(ctx: PredictionContext): {
  evaluatedCondition: EvaluatedCondition;
  jaiminiFactors: JaiminiMarriageFactors;
} {
  const jaimini = ctx.chart.jaimini;
  const ulPada = jaimini?.arudhaPadas?.find((p) => p.house === 12);
  const alPada = jaimini?.arudhaPadas?.find((p) => p.house === 1);
  const a7Pada = jaimini?.arudhaPadas?.find((p) => p.house === 7);
  const dk = jaimini?.charaKarakas?.find((k) => k.karakaKey === 'DK');

  const ulRashiNum = ulPada?.rashiNumber || 1;
  const ulRashiName = ulPada?.rashiName || RASHIS[ulRashiNum]?.name || 'Mesha';

  const lagnaRashiNum = ctx.houses[1].rashiNumber;
  const ulHouseFromLagna = (((ulRashiNum - lagnaRashiNum + 12) % 12) + 1);

  const secondFromULRashiNum = (((ulRashiNum - 1 + 1) % 12) + 1) as RashiNumber;
  const secondFromULRashiName = RASHIS[secondFromULRashiNum]?.name || '';

  const secondFromULOccupants: string[] = [];
  const secondFromULBenefics: string[] = [];
  const secondFromULMalefics: string[] = [];

  Object.values(ctx.planets).forEach((p) => {
    if (p.rashiNumber === secondFromULRashiNum) {
      secondFromULOccupants.push(p.name);
      if (NATURAL_BENEFICS.includes(p.id)) {
        secondFromULBenefics.push(p.name);
      } else if (NATURAL_MALEFICS.includes(p.id)) {
        secondFromULMalefics.push(p.name);
      }
    }
  });

  const secondFromULAspects: { planetName: string; isBenefic: boolean }[] = [];
  const getModality = (rNum: RashiNumber): 'movable' | 'fixed' | 'dual' => {
    if ([1, 4, 7, 10].includes(rNum)) return 'movable';
    if ([2, 5, 8, 11].includes(rNum)) return 'fixed';
    return 'dual';
  };
  const secondSignType = getModality(secondFromULRashiNum);

  Object.values(ctx.planets).forEach((p) => {
    const plRashi = p.rashiNumber;
    if (plRashi === secondFromULRashiNum) return;
    const plSignType = getModality(plRashi);
    let castsRashiDrishti = false;

    if (secondSignType === 'movable' && plSignType === 'fixed') {
      const dist = ((plRashi - secondFromULRashiNum + 12) % 12) + 1;
      if (dist !== 2) castsRashiDrishti = true;
    } else if (secondSignType === 'fixed' && plSignType === 'movable') {
      const dist = ((secondFromULRashiNum - plRashi + 12) % 12) + 1;
      if (dist !== 2) castsRashiDrishti = true;
    } else if (secondSignType === 'dual' && plSignType === 'dual') {
      castsRashiDrishti = true;
    }

    if (castsRashiDrishti) {
      secondFromULAspects.push({
        planetName: p.name,
        isBenefic: NATURAL_BENEFICS.includes(p.id),
      });
    }
  });

  const beneficAspects = secondFromULAspects.filter((a) => a.isBenefic).map((a) => a.planetName);
  const maleficAspects = secondFromULAspects.filter((a) => !a.isBenefic).map((a) => a.planetName);

  let ulStability: JaiminiMarriageFactors['ulStabilityEvaluation'] = 'harmonious_with_compromise';

  if (secondFromULBenefics.length > 0 || (beneficAspects.length > 0 && secondFromULMalefics.length === 0)) {
    ulStability = 'fortified_and_enduring';
  } else if (secondFromULMalefics.length > 0 && beneficAspects.length === 0) {
    ulStability = 'fragile_demanding_mindfulness';
  } else {
    ulStability = 'harmonious_with_compromise';
  }

  const alRashiNum = alPada?.rashiNumber || 1;
  const a7RashiNum = a7Pada?.rashiNumber || 7;
  const distALtoA7 = (((a7RashiNum - alRashiNum + 12) % 12) + 1);

  let mutualRel: JaiminiMarriageFactors['arudhaLagnaVsDaraPada']['mutualRelationship'] = 'kendra_trikona';
  let harmonyIndication = '';

  if ([1, 4, 7, 10].includes(distALtoA7)) {
    mutualRel = distALtoA7 === 7 ? 'samaptaka_1_7' : 'kendra_trikona';
    harmonyIndication = 'Arūḍha Lagna and Dāra Pada sit in Kendra/1–7; public relationship radiates mutual alignment and societal harmony.';
  } else if ([5, 9].includes(distALtoA7)) {
    mutualRel = 'kendra_trikona';
    harmonyIndication = 'AL and A7 in 5–9 Trikona; innate goodwill and shared philosophical principles bless the worldly partnership.';
  } else if ([3, 11].includes(distALtoA7)) {
    mutualRel = 'tritiya_ekadasha_3_11';
    harmonyIndication = 'AL and A7 in 3–11; energetic cooperation and mutual material growth characterize the union.';
  } else if ([6, 8].includes(distALtoA7)) {
    mutualRel = 'shadashtaka_6_8';
    harmonyIndication = 'AL and A7 in 6–8 (Shaḍaṣṭaka); worldly image or external lifestyle differences require conscious accommodation.';
  } else {
    mutualRel = 'dvidvadasha_2_12';
    harmonyIndication = 'AL and A7 in 2–12; one partner may expend significant emotional or material resources on the other.';
  }

  const dkPlanet = ctx.getPlanet(dk?.planet || 'venus');
  const dkInfo = {
    id: dkPlanet.id,
    name: dkPlanet.name,
    degrees: dk?.degrees || 0,
    rashi: dkPlanet.rashiName,
    house: dkPlanet.house,
  };

  const jaiminiSynthesis = `Upapada Lagna in ${ulRashiName} (House ${ulHouseFromLagna}). 2nd from UL (${secondFromULRashiName}) indicates ${
    ulStability === 'fortified_and_enduring'
      ? 'strong longevity of the marital covenant'
      : ulStability === 'fragile_demanding_mindfulness'
      ? 'potential domestic turbulence requiring patience'
      : 'standard marital adaptability'
  }. Dārakāraka is ${dkInfo.name} at ${dkInfo.degrees.toFixed(2)}°, anchoring partner character. AL-A7 relation: ${harmonyIndication}`;

  const jaiminiFactors: JaiminiMarriageFactors = {
    upapadaLagnaRashi: ulRashiName,
    upapadaLagnaHouse: ulHouseFromLagna,
    secondFromULRashi: secondFromULRashiName,
    secondFromULOccupants,
    secondFromULBeneficAspects: beneficAspects,
    secondFromULMaleficAspects: maleficAspects,
    ulStabilityEvaluation: ulStability,
    darakarakaGraha: dkInfo,
    arudhaLagnaVsDaraPada: {
      alRashi: alPada?.rashiName || '',
      a7Rashi: a7Pada?.rashiName || '',
      mutualRelationship: mutualRel,
      harmonyIndication,
    },
    jaiminiSynthesis,
  };

  const evaluatedCondition: EvaluatedCondition = {
    id: 'cond_jaimini_upapada_darakaraka',
    name: 'Jaimini Upapada Lagna (UL) & Dārakāraka (DK) Covenant Layer',
    parameter: 'Upapada Sign, 2nd from UL Benefic/Malefic Disposition & AL vs A7 Relationship',
    expected: 'Benefic occupation or aspect in 2nd from UL confirming lifelong covenant; AL-A7 in Kendra/Trikona',
    observed: `UL: ${ulRashiName} (H${ulHouseFromLagna}), 2nd from UL: ${secondFromULRashiName} (${ulStability.toUpperCase()}), DK: ${dkInfo.name}, AL-A7: ${mutualRel}`,
    status: ulStability === 'fortified_and_enduring' ? 'satisfied' : ulStability === 'harmonious_with_compromise' ? 'partially_supported' : 'contradicted',
    weight: 'qualifying',
    rationale: jaiminiSynthesis,
  };

  return { evaluatedCondition, jaiminiFactors };
}

// ============================================================================
// 10. VIMSHOTTARI DAŚĀ TIMING & ACTIVATION CONDITION
// ============================================================================
export function evaluateMarriageTimingCondition(ctx: PredictionContext): {
  evaluatedCondition: EvaluatedCondition;
  timingArc: MarriageTimingArc;
} {
  const seventhLord = ctx.getLordOfHouse(7);
  const secondLord = ctx.getLordOfHouse(2);
  const ninthLord = ctx.getLordOfHouse(9);
  const h7 = ctx.getHouse(7);
  const activeMD = ctx.activeMahadasha;
  const activeAD = ctx.activeAntardasha;

  const jaiminiDk = ctx.chart.jaimini?.charaKarakas?.find((k) => k.karakaKey === 'DK')?.planet;

  const primaryTriggers: PlanetId[] = [seventhLord.id, 'venus'];
  h7.occupants.forEach((p) => {
    if (!primaryTriggers.includes(p)) primaryTriggers.push(p);
  });
  if (jaiminiDk && !primaryTriggers.includes(jaiminiDk)) primaryTriggers.push(jaiminiDk);

  const secondaryTriggers: PlanetId[] = [secondLord.id, ninthLord.id, 'jupiter'];

  const mdIsPrimary = primaryTriggers.includes(activeMD);
  const mdIsSecondary = secondaryTriggers.includes(activeMD);
  const adIsPrimary = primaryTriggers.includes(activeAD);
  const adIsSecondary = secondaryTriggers.includes(activeAD);

  const isMarriageDashaActive = (mdIsPrimary && (adIsPrimary || adIsSecondary)) || (mdIsSecondary && adIsPrimary) || (adIsPrimary && mdIsSecondary);

  let timingCategory: TimingCategory = 'dormant_current_dasha';
  let activationRationale = '';

  const mdName = ctx.getPlanet(activeMD).name;
  const adName = ctx.getPlanet(activeAD).name;

  if (isMarriageDashaActive) {
    timingCategory = ctx.nativeAge < 26 ? 'early_union_supported' : 'timely_chronological_window';
    activationRationale = `Active Vimshottari period (${mdName} Mahādaśā / ${adName} Antardaśā) directly engages the classical marriage significators (7th house, 7th lord, or Kalatrakāraka). Matrimonial opportunities, covenant formalization, or relationship crystallization are actively triggered.`;
  } else if (mdIsPrimary || adIsPrimary) {
    timingCategory = 'timely_chronological_window';
    activationRationale = `Partial activation: Either Mahādaśā (${mdName}) or Antardaśā (${adName}) touches the 7th house or Venus, creating relational interest or courtship progress, though full formalization often awaits mutual activation.`;
  } else {
    timingCategory = 'dormant_current_dasha';
    activationRationale = `Current cycle (${mdName} MD / ${adName} AD) is primarily oriented toward other developmental domains (e.g., career, study, or family restructuring). Marriage promise remains intact in the natal chart, awaiting forthcoming sub-periods of ${primaryTriggers.map((p) => ctx.getPlanet(p).name).join(', ')}.`;
  }

  const timingArc: MarriageTimingArc = {
    activeMahadashaAssessment: `${mdName} Mahādaśā (${mdIsPrimary ? 'Primary Marriage Significator' : mdIsSecondary ? 'Secondary Facilitator' : 'Non-relational focus'})`,
    activeAntardashaAssessment: `${adName} Antardaśā (${adIsPrimary ? 'Direct Relational Trigger' : adIsSecondary ? 'Supportive Sub-period' : 'General development'})`,
    isMarriageDashaActive,
    timingCategory,
    activationRationale,
    prospectiveActivationGrahas: primaryTriggers.map((p) => ctx.getPlanet(p).name),
    timingEpistemologicalCaveat:
      'Daśā analysis reveals the astrological window of relational activation; it does not fabricate synthetic calendar wedding dates. Free will, cultural readiness, and mutual dharmic consent remain decisive.',
  };

  const evaluatedCondition: EvaluatedCondition = {
    id: 'cond_marriage_dasha_timing',
    name: 'Vimshottari Daśā Marriage Activation Arc',
    parameter: 'Active Mahādaśā & Antardaśā Linkage to 7th Lord, 7th House, Venus or Jupiter',
    expected: 'Active Daśā/Antardaśā ruled by 7th Lord, 7th Occupant, Venus, or Dharmic 9th/2nd Lord',
    observed: `MD: ${mdName}, AD: ${adName}, Is Active: ${isMarriageDashaActive}, Timing Arc: ${timingCategory.toUpperCase()}`,
    status: isMarriageDashaActive ? 'satisfied' : 'partially_supported',
    weight: 'qualifying',
    rationale: activationRationale,
  };

  return { evaluatedCondition, timingArc };
}

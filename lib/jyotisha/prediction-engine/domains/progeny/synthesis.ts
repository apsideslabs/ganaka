/**
 * Gaṇaka — Domain 7: Children & Progeny Synthesis Engine (Phase 7)
 * Synthesizes evaluated conditions, classical rules, and evidence stack into:
 * - Primary Progeny Promise & Lineage Quality
 * - D1 5th House, 5th Lord, and Jupiterian Kāraka Status
 * - D7 Saptāṃśa Harmonic Confirmation
 * - Bīja & Kṣetra Sphuṭa Vitality Insights
 * - Jaimini Putrakāraka & Kārakāṃśa Triangulation
 * - Delay vs. Denial Shastric Verdict
 * - Karmic Śāpas, Mitigations, and Authentic Timing Arc
 */

import { PredictionContext } from '../../context';
import { EvaluatedProgenyEvidenceStack } from './evidence';
import {
  FifthHouseAssessment,
  FifthLordAssessment,
  NaturalKarakaJupiterAssessment,
  MultiLagnaTriangulation,
  D7SaptamshaConfirmation,
  SpecializedSphutasProgeny,
  JaiminiProgenyFactors,
  ProgenyObstacleOrShapa,
  DelayVsDenialProgeny,
  ProgenyTimingArc,
} from './types';

export interface SynthesizedProgenyDomain {
  finalVerdict: string;
  synthesisNarrative: string;
  progenyPromiseSummary: string;
}

export function synthesizeProgenyDomain(
  ctx: PredictionContext,
  evidence: EvaluatedProgenyEvidenceStack,
  fifthHouse: FifthHouseAssessment,
  fifthLord: FifthLordAssessment,
  jupiterAssessment: NaturalKarakaJupiterAssessment,
  triangulation: MultiLagnaTriangulation,
  d7Confirmation: D7SaptamshaConfirmation,
  specializedSphutas: SpecializedSphutasProgeny,
  jaiminiFactors: JaiminiProgenyFactors,
  delayVsDenial: DelayVsDenialProgeny,
  shapas: ProgenyObstacleOrShapa[],
  timingArc: ProgenyTimingArc
): SynthesizedProgenyDomain {
  // 1. Progeny Promise Summary
  let progenyPromiseSummary = '';
  switch (evidence.progenyPromise) {
    case 'abundant_progeny':
      progenyPromiseSummary =
        'Bahu-Putra Yoga: Classical sources confirm multiple flourishing, healthy, and virtuous children who bring deep domestic happiness and prestige to the lineage.';
      break;
    case 'assured_healthy':
      progenyPromiseSummary =
        'Santāna Yoga: Timely, sound, and affectionate progeny; children embody strong moral and intellectual character, supporting parental dharma.';
      break;
    case 'delayed_realization':
      progenyPromiseSummary =
        'Vilamba Santāna: Procreative realization is deferred to mature adulthood under Saturnine or retrograde discipline; children born are resilient and deeply grounded.';
    case 'limited_progeny':
      progenyPromiseSummary =
        'Alpa-Putra / Eka-Putra: A focused lineage characterized by one or two deeply cherished, highly accomplished children who receive concentrated parental investment.';
      break;
    case 'fraught_with_obstacles':
      progenyPromiseSummary =
        'Santāna Pratibandha: Progeny journey encounters karmic impediments or health anxieties requiring traditional devotional or astrological mitigations.';
      break;
    case 'unconventional_lineage':
      progenyPromiseSummary =
        'Dattaka / Ādhunika Lineage: Unconventional, adopted, or spiritual progeny patterns predominated by unique planetary configurations.';
      break;
    case 'severely_obstructed':
      progenyPromiseSummary =
        'Classical Anapatya indication: Deep biological resistance across D1, D7, and Jupiter; spiritual mentorship or non-traditional family pathways are indicated.';
      break;
  }

  // 2. Final Verdict
  const promiseTitle = evidence.progenyPromise.replace(/_/g, ' ').toUpperCase();
  let finalVerdict = '';
  if (evidence.domainState === 'strongly_supported' || evidence.domainState === 'supported') {
    finalVerdict = `Auspicious Lineage Promise (${promiseTitle}): 5th Bhāva (${fifthHouse.rashiName}, ${fifthHouse.fertilityType}) is supported by Putreśa ${fifthLord.name} in H${fifthLord.house} (${fifthLord.dignity}) and ${fifthHouse.savBindus} SAV bindus. D7 Saptāṃśa confirms ${d7Confirmation.vargaConfirmationStatus.replace(/_/g, ' ')} harmonic continuity. ${delayVsDenial.delayingFactors.length > 0 ? 'Saturnine timing favors deliberate maturity.' : 'Progeny arrives harmoniously during active Daśā activation.'}`;
  } else if (evidence.domainState === 'mixed') {
    finalVerdict = `Mixed Progeny Indications with Resolvable Friction (${promiseTitle}): Foundational potential (${fifthLord.name} in H${fifthLord.house}) balances classical delays or karmic lessons (${delayVsDenial.delayingFactors.slice(0, 2).join('; ') || 'initial delays'}). Divine mitigations and D7 support ensure eventual fulfillment.`;
  } else if (evidence.domainState === 'contradicted') {
    finalVerdict = `Complex Progeny Profile with Significant Karmic Factors (${promiseTitle}): Multiple classical stress points (${shapas.map((s) => s.shapaType).slice(0, 2).join(', ') || 'dusthāna placements'}) indicate that patience, medical guidance, and traditional śāntis are essential.`;
  } else {
    finalVerdict = `Equilibrium Progeny Profile (${promiseTitle}): 5th house and significator Jupiter operate in standard equilibrium, responsive to active planetary cycles.`;
  }

  // 3. Narrative Synthesis
  const narrativeParts: string[] = [];

  // Paragraph 1: Foundational D1 5th House, Lord & Jupiter
  narrativeParts.push(
    `FOUNDATIONAL PROGENY PROMISE (D1): The 5th Bhāva (${fifthHouse.rashiName}) represents the primary seat of progeny (Putrasthāna), falling in a ${fifthHouse.fertilityType} sign with ${fifthHouse.savBindus} Sarvāṣṭakavarga bindus (${fifthHouse.savEvaluation.replace(/_/g, ' ')}). Putreśa ${fifthLord.name} occupies House ${fifthLord.house} (${fifthLord.rashiName}, ${fifthLord.dignity}, Śaḍbala ${fifthLord.shadbalaRatio.toFixed(2)}x). Universal significator Jupiter (Guru) presides in House ${jupiterAssessment.house} (${jupiterAssessment.rashiName}, ${jupiterAssessment.dignity}, Śaḍbala ${jupiterAssessment.shadbalaRatio.toFixed(2)}x). ${fifthHouse.shastricVerdict}`
  );

  // Paragraph 2: Multi-Lagna Triangulation
  narrativeParts.push(
    `MULTI-LAGNA TRIANGULATION: Classical Jyotiṣa evaluates progeny from four distinct reference horizons (BPHS Ch. 13 & Phaladīpikā Ch. 12). 5th from Janma Lagna falls in ${fifthHouse.rashiName}; 5th from Candra Lagna falls in Rashi ${triangulation.fifthFromMoonRashi}; 5th from Guru falls in Rashi ${triangulation.fifthFromJupiterRashi}; and Bhavat Bhavam (9th house) falls in Rashi ${triangulation.ninthHouseBhavatBhavamRashi}. ${triangulation.synthesis}`
  );

  // Paragraph 3: D7 Saptāṃśa & Specialized Sphuṭas
  narrativeParts.push(
    `D7 SAPTĀṂŚA & HARMONIC CONFIRMATION: The Saptāṃśa chart (D7) serves as the definitive divisional mirror for children (*सप्तांशे पुत्रपौत्राणां*). D7 Lagna is ${d7Confirmation.d7LagnaRashi}, and D7 5th house is governed by ${d7Confirmation.d7FifthLord}. D1 5th lord occupies House ${d7Confirmation.d1FifthLordPlacementInD7.houseInD7} in D7 (${d7Confirmation.d1FifthLordPlacementInD7.dignityInD7}${d7Confirmation.isFifthLordSaptamshaVargottama ? ', Saptāṃśa Vargottama' : ''}). ${d7Confirmation.shastricNote} Specialized calculations: Bīja Sphuṭa indicates ${specializedSphutas.beejaSphuta?.status || 'balanced'}; Kṣetra Sphuṭa indicates ${specializedSphutas.kshetraSphuta?.status || 'balanced'}; and Santāna Tithi is ${specializedSphutas.santanaTithi?.tithiName || 'auspicious'}.`
  );

  // Paragraph 4: Jaimini Putrakāraka & Kārakāṃśa
  narrativeParts.push(
    `JAIMINI PROGENY FACTORS: Putrakāraka (PK) is ${jaiminiFactors.putrakarakaGraha.name} residing in House ${jaiminiFactors.putrakarakaGraha.house}. The 5th from Kārakāṃśa (KL Rashi ${jaiminiFactors.karakamshaRashi}) is Rashi ${jaiminiFactors.fifthFromKarakamshaRashi}, influenced by: ${jaiminiFactors.planetsInOrAspectingFifthFromKL.join(', ') || 'neutral aspects'}. Putrapada (A5) sits in House ${jaiminiFactors.putrapadaA5.houseFromLagna} from Lagna. ${jaiminiFactors.jaiminiProgenyVerdict}`
  );

  // Paragraph 5: Delay vs Denial & Karmic Mitigations
  const shapaText = shapas.length > 0
    ? `Karmic condition(s) detected: ${shapas.map((s) => `${s.shapaType}${s.hasBhanga ? ` (Dissolved via ${s.bhangaReason})` : ''}`).join('; ')}.`
    : 'No severe classical curses (Śāpas) detected in the 5th house matrix.';
  narrativeParts.push(
    `DELAY VS. DENIAL & SHAPAS: ${delayVsDenial.classicalTextSummary} ${shapaText}`
  );

  // Paragraph 6: Authentic Timing Arc
  narrativeParts.push(
    `AUTHENTIC TIMING ARC: Currently active periods: ${timingArc.activeMahadasha} Mahādaśā / ${timingArc.activeAntardasha} Antardaśā. Primary activating significators include: ${timingArc.prospectiveActivationGrahas.join(', ')}. ${timingArc.timingEpistemologicalNotice}`
  );

  return {
    finalVerdict,
    synthesisNarrative: narrativeParts.join('\n\n'),
    progenyPromiseSummary,
  };
}

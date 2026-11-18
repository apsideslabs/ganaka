/**
 * Gaṇaka — Master Kuṭa Milan Matching Orchestrator
 * 
 * Harmonizes:
 * - Aṣṭakūṭa (8 Kūṭas, 36 Points)
 * - South Indian Daśakūṭa (10 Poruthams)
 * - Deeper Horoscope Factors (7th Bhāva, Venus, Jupiter, Navāṃśa D-9, Jaimini UL/DK, Kuja Sāmya)
 * 
 * Strict deterministic evaluation with classical citations and zero modern guessing.
 */

import { JyotishaChart } from '../types';
import { extractLunarData, calculateAllAshtakutas } from './ashtakuta-calculator';
import { calculateAllDashakutas } from './dashakuta-calculator';
import { evaluateDeeperHoroscopeMatching } from './deeper-matching';
import { KutaMilanResult, MatchingTradition, SingleKutaResult } from './types';

export function calculateKutaMilan(
  groomChart: JyotishaChart,
  brideChart: JyotishaChart,
  tradition: MatchingTradition = 'ashtakuta'
): KutaMilanResult {
  const groomLunar = extractLunarData(groomChart);
  const brideLunar = extractLunarData(brideChart);

  // 1. Calculate Aṣṭakūṭa
  const ashtakutaResults = calculateAllAshtakutas(groomLunar, brideLunar);

  let finalKutaResults: SingleKutaResult[] = [];
  let totalScore = 0;
  let maxTotalScore = 36;

  if (tradition === 'dashakuta') {
    const dashakutaExtra = calculateAllDashakutas(groomLunar, brideLunar);
    // A Daśakūṭa is TEN poruthams, not twelve. Six of the North Indian kūṭas
    // appear in it under other names (Dina = Tārā, Rashi = Bhakūṭa,
    // Rasyadhipati = Graha Maitrī, plus Gana, Yoni and Vaśya). The South drops
    // Varṇa and Nāḍī — Nāḍī, the heaviest check in the North at 8 points, does
    // not exist in this system at all — and adds four: Mahendra, Stree Deergha,
    // Rajju, Vedha. Showing all twelve was a superset, not a Daśakūṭa.
    const SOUTH_ONLY = new Set(['varna', 'nadi']);
    finalKutaResults = [
      ...ashtakutaResults.filter((k) => !SOUTH_ONLY.has(k.id)),
      ...dashakutaExtra,
    ];
    // The South Indian model does NOT add graded points. Its ten poruthams are
    // pass/fail gates: a porutham is either present or it is not, and the
    // reading is "seven of ten", never "24 of 31". So the Daśakūṭa score counts
    // how many poruthams are present, out of ten, rather than summing the
    // North's graded weights.
    maxTotalScore = 10;
  } else {
    finalKutaResults = ashtakutaResults;
    maxTotalScore = 36;
  }

  // A porutham counts as present when it scores anything at all — the South
  // Indian tradition grades nothing, so half of a Tārā still means the Tārā
  // porutham is there. The North sums the graded weights instead.
  totalScore = tradition === 'dashakuta'
    ? finalKutaResults.filter((k) => k.obtainedScore > 0).length
    : finalKutaResults.reduce((acc, k) => acc + k.obtainedScore, 0);
  const percentageScore = Math.round((totalScore / maxTotalScore) * 100);

  // Key critical safety check flags per Muhūrta Cintāmaṇi
  const nadiKuta = ashtakutaResults.find((k) => k.id === 'nadi');
  const bhakutaKuta = ashtakutaResults.find((k) => k.id === 'bhakuta');
  const ganaKuta = ashtakutaResults.find((k) => k.id === 'gana');

  const isNadiKutaPass = nadiKuta ? nadiKuta.obtainedScore > 0 : true;
  const isBhakutaPass = bhakutaKuta ? bhakutaKuta.obtainedScore > 0 : true;
  const isGanaKutaPass = ganaKuta ? ganaKuta.obtainedScore > 1 : true;

  // 2. Evaluate Deeper Factors
  const deeperFactors = evaluateDeeperHoroscopeMatching(groomChart, brideChart);

  // 3. Classical Synthesis & Recommendation
  let recommendationLevel: KutaMilanResult['recommendationLevel'];
  const criticalDefectsFound: string[] = [];
  const criticalRemediesActive: string[] = [];

  if (nadiKuta?.isDoshaPresent) {
    if (nadiKuta.isCancelledByException) {
      criticalRemediesActive.push(`Eka-Nāḍī Doṣa mitigated by ${nadiKuta.exceptionApplied?.ruleTitle}`);
    } else {
      criticalDefectsFound.push('Severe unmitigated Eka-Nāḍī Doṣa');
    }
  }

  if (bhakutaKuta?.isDoshaPresent) {
    if (bhakutaKuta.isCancelledByException) {
      criticalRemediesActive.push(`Bhakūṭa Doṣa cancelled by ${bhakutaKuta.exceptionApplied?.ruleTitle}`);
    } else {
      criticalDefectsFound.push('Unmitigated adverse Bhakūṭa displacement');
    }
  }

  if (ganaKuta?.isDoshaPresent) {
    if (ganaKuta.isCancelledByException) {
      criticalRemediesActive.push(`Gaṇa Doṣa mitigated by ${ganaKuta.exceptionApplied?.ruleTitle}`);
    } else {
      criticalDefectsFound.push('Rākṣasa Gaṇa friction without mitigation');
    }
  }

  if (deeperFactors.mangalaComparison.neutralizationStatus === 'One-Sided Affliction') {
    criticalDefectsFound.push('One-Sided Kuja / Maṅgala Doṣa requires attention');
  } else if (deeperFactors.mangalaComparison.neutralizationStatus === 'Sama-Kuja (Perfect Balancement)') {
    criticalRemediesActive.push('Full Kuja Sāmya (Equal Martian energetic equilibrium)');
  }

  if (totalScore >= 24 && isNadiKutaPass && isBhakutaPass) {
    recommendationLevel = 'Uttama (Highly Auspicious)';
  } else if (totalScore >= 18 && isNadiKutaPass) {
    recommendationLevel = 'Madhyama (Acceptable / Fair)';
  } else {
    recommendationLevel = 'Kaniṣṭha (Challenging / Inauspicious)';
  }

  let coreVerdictText = '';
  if (recommendationLevel === 'Uttama (Highly Auspicious)') {
    coreVerdictText = `Strong classical compatibility (${totalScore}/${maxTotalScore} points). The constitutional lunar layers (Aṣṭakūṭa) and deeper planetary geometries show elevated natural harmony, mutual support, and auspicious familial prospects.`;
  } else if (recommendationLevel === 'Madhyama (Acceptable / Fair)') {
    coreVerdictText = `Balanced classical matching (${totalScore}/${maxTotalScore} points). Fulfills the standard 18-point threshold. Critical vital points (Nāḍī & Bhakūṭa) are safeguarded, and standard marriage is astrologically tenable.`;
  } else {
    coreVerdictText = `Challenging matching score (${totalScore}/${maxTotalScore} points). ${
      !isNadiKutaPass
        ? 'Unmitigated Eka-Nāḍī Doṣa is active, which classical authorities (BPHS & Muhūrta Cintāmaṇi) advise against due to genetic/progeny concerns.'
        : 'Multiple constitutional friction points detected across the Kūṭa matrix.'
    }`;
  }

  return {
    tradition,
    totalScore,
    maxTotalScore,
    percentageScore,
    recommendationLevel,
    isNadiKutaPass,
    isBhakutaPass,
    isGanaKutaPass,
    kutaResults: finalKutaResults,
    deeperFactors,
    classicalSummary: {
      coreVerdictText,
      criticalDefectsFound,
      criticalRemediesActive,
      primaryTreatiseBasis:
        tradition === 'dashakuta'
          ? 'Mādhavīya, Prasna Marga, Jātaka Deśamārga, & Muhūrta Cintāmaṇi'
          : 'Muhūrta Cintāmaṇi (Vivāha Prakaraṇa) & Bṛhat Parāśara Horā Śāstra (Ch. 80-81)',
    },
  };
}

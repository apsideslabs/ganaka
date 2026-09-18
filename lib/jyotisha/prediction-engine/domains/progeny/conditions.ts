/**
 * Gaṇaka — Domain 7: Children & Progeny (Santāna / Putra) Conditions
 * Pure deterministic condition evaluators auditing classical combinations.
 */

import { PredictionContext } from '../../context';
import { EvaluatedCondition, ConditionStatus } from '../../types';
import { PlanetId, RashiNumber } from '../../../types';
import { RASHIS, GRAHA_NAMES } from '../../../constants';
import { calculateAllVargas } from '../../../../vargas/varga-engine';
import { calculateNavamsha } from '../../../../vargas/navamsha';
import { normalizeDegrees } from '../../../../astronomy/julian';
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
  SignFertilityType,
} from './types';
import { PROGENY_RULES } from './rules';

const NATURAL_BENEFICS: PlanetId[] = ['jupiter', 'venus', 'mercury', 'moon'];
const NATURAL_MALEFICS: PlanetId[] = ['saturn', 'mars', 'rahu', 'ketu', 'sun'];

// Classical Sign Fertility Classification
// Fertile (Jala / Saumya): Cancer(4), Scorpio(8), Pisces(12), Taurus(2)
// Semi-fertile: Libra(7), Sagittarius(9), Capricorn(10), Aquarius(11)
// Barren (Vandhyā): Aries(1), Gemini(3), Leo(5), Virgo(6)
export function getSignFertility(rashi: RashiNumber): SignFertilityType {
  if ([2, 4, 8, 12].includes(rashi)) return 'fertile';
  if ([7, 9, 10, 11].includes(rashi)) return 'semi_fertile';
  return 'barren';
}

function getModality(rNum: RashiNumber): 'movable' | 'fixed' | 'dual' {
  if ([1, 4, 7, 10].includes(rNum)) return 'movable';
  if ([2, 5, 8, 11].includes(rNum)) return 'fixed';
  return 'dual';
}

// ==========================================
// 1. D1 5th House Assessment
// ==========================================
export function evaluateFifthHouseCondition(ctx: PredictionContext): {
  evaluatedCondition: EvaluatedCondition;
  assessment: FifthHouseAssessment;
} {
  const house5 = ctx.getHouse(5);
  const rashiNum = house5.rashiNumber;
  const rashiName = RASHIS[rashiNum]?.sanskritName || 'Simha';
  const signLord = RASHIS[rashiNum]?.lord as PlanetId;
  const fertilityType = getSignFertility(rashiNum);

  const occupants = house5.occupants.map((pId) => {
    const p = ctx.planets[pId];
    return {
      id: pId,
      name: p?.name || pId,
      isNaturalBenefic: NATURAL_BENEFICS.includes(pId),
      dignity: p?.dignity || 'neutral',
      isRetrograde: p?.isRetrograde || false,
      isCombust: p?.isCombust || false,
    };
  });

  const aspectingPlanets = (house5.aspectsReceived || []).map((a) => {
    const p = ctx.planets[a.planetId];
    return {
      id: a.planetId,
      name: p?.name || a.planetId,
      isNaturalBenefic: NATURAL_BENEFICS.includes(a.planetId),
      dignity: p?.dignity || 'neutral',
    };
  });

  const savBindus = ctx.chart.ashtakavarga?.sav?.bindusByRashi?.[rashiNum - 1] ?? 28;
  const savEvaluation =
    savBindus >= 30 ? 'strong_abundance' : savBindus >= 25 ? 'adequate' : 'deficient';

  const beneficOccupantsCount = occupants.filter((o) => o.isNaturalBenefic).length;
  const maleficOccupantsCount = occupants.filter((o) => !o.isNaturalBenefic).length;
  const beneficAspectsCount = aspectingPlanets.filter((a) => a.isNaturalBenefic).length;
  const maleficAspectsCount = aspectingPlanets.filter((a) => !a.isNaturalBenefic).length;

  let score = 0;
  if (fertilityType === 'fertile') score += 2;
  else if (fertilityType === 'semi_fertile') score += 1;

  score += (beneficOccupantsCount * 2) + beneficAspectsCount;
  score -= (maleficOccupantsCount * 2) + maleficAspectsCount;
  if (savEvaluation === 'strong_abundance') score += 2;
  else if (savEvaluation === 'deficient') score -= 2;

  let status: ConditionStatus = 'satisfied';
  let shastricVerdict = '';

  if (score >= 3) {
    status = 'satisfied';
    shastricVerdict = `5th house (${rashiName}) is strongly fortified with fertile sign disposition, benefic support, and ${savBindus} SAV bindus. Procreative promise is highly auspicious.`;
  } else if (score >= 0) {
    status = 'partially_supported';
    shastricVerdict = `5th house (${rashiName}) possesses moderate baseline capacity (${fertilityType} sign, ${savBindus} SAV bindus) with balanced planetary influences.`;
  } else {
    status = 'contradicted';
    shastricVerdict = `5th house (${rashiName}) experiences classical strain (${fertilityType} sign, malefic concentration or deficient SAV of ${savBindus} bindus), indicating potential delays or need for śāntis.`;
  }

  const assessment: FifthHouseAssessment = {
    houseNumber: 5,
    rashiNumber: rashiNum,
    rashiName,
    signLord,
    fertilityType,
    occupants,
    aspectingPlanets,
    savBindus,
    savEvaluation,
    shastricVerdict,
  };

  const rule = PROGENY_RULES.BPHS_13_PUTRA_BHAVA_SUBHA;
  const evaluatedCondition: EvaluatedCondition = {
    id: rule.ruleId,
    name: rule.sanskritTitle,
    parameter: '5th House Fertility, Occupants, Aspects & SAV',
    expected: 'Fertile sign, benefic occupancy or aspect, >= 28 SAV bindus',
    observed: `Sign: ${rashiName} (${fertilityType}), Occupants: ${occupants.map((o) => o.name).join(', ') || 'None'}, Aspects: ${aspectingPlanets.map((a) => a.name).join(', ') || 'None'}, SAV: ${savBindus} (${savEvaluation})`,
    status,
    rationale: shastricVerdict,
    weight: 'mandatory',
  };

  return { evaluatedCondition, assessment };
}

// ==========================================
// 2. D1 5th Lord (Putreśa) Assessment
// ==========================================
export function evaluateFifthLordCondition(ctx: PredictionContext): {
  evaluatedCondition: EvaluatedCondition;
  assessment: FifthLordAssessment;
} {
  const fifthLordPlanet = ctx.getLordOfHouse(5);
  const house = fifthLordPlanet.house;
  const rashiNum = fifthLordPlanet.rashiNumber;
  const rashiName = fifthLordPlanet.rashiName;
  const dignity = fifthLordPlanet.dignity;
  const isRetrograde = fifthLordPlanet.isRetrograde;
  const isCombust = fifthLordPlanet.isCombust;
  const shadbalaRatio = fifthLordPlanet.shadbalaRatio ?? 1.1;

  const placedInKendraOrKona = [1, 4, 5, 7, 9, 10].includes(house);
  const placedInDusthana = [6, 8, 12].includes(house);

  const jupiter = ctx.planets['jupiter'];
  const sambandhaWithJupiter =
    jupiter && (jupiter.house === house || fifthLordPlanet.house === jupiter.house);

  const lagnesha = ctx.getLordOfHouse(1);
  const sambandhaWithLagnesha =
    lagnesha && (lagnesha.house === house || fifthLordPlanet.house === lagnesha.house);

  let status: ConditionStatus = 'satisfied';
  let shastricVerdict = '';

  if (placedInDusthana || dignity === 'debilitated' || isCombust) {
    status = 'contradicted';
    shastricVerdict = `Putreśa (${fifthLordPlanet.name}) is in H${house} (${dignity}${isCombust ? ', combust' : ''}), indicating vulnerability in initial procreative ease or maternal/filial stress.`;
  } else if (placedInKendraOrKona && (dignity === 'exalted' || dignity === 'own' || dignity === 'friendly' || dignity === 'moolatrikona')) {
    status = 'satisfied';
    shastricVerdict = `Putreśa (${fifthLordPlanet.name}) is well-fortified in H${house} (${dignity}, Śaḍbala ${shadbalaRatio.toFixed(2)}x), strongly anchoring family continuity and progeny vitality.`;
  } else {
    status = 'partially_supported';
    shastricVerdict = `Putreśa (${fifthLordPlanet.name}) is moderately situated in H${house} (${dignity}, Śaḍbala ${shadbalaRatio.toFixed(2)}x).`;
  }

  const assessment: FifthLordAssessment = {
    planetId: fifthLordPlanet.id,
    name: fifthLordPlanet.name,
    rashiNumber: rashiNum,
    rashiName,
    house,
    dignity,
    isRetrograde,
    isCombust,
    shadbalaRatio,
    placedInKendraOrKona,
    placedInDusthana,
    sambandhaWithJupiter: Boolean(sambandhaWithJupiter),
    sambandhaWithLagnesha: Boolean(sambandhaWithLagnesha),
    shastricVerdict,
  };

  const rule = placedInDusthana
    ? PROGENY_RULES.BPHS_13_PUTRESHA_DUSTHANA
    : PROGENY_RULES.BPHS_13_PUTRA_BHAVA_SUBHA;

  const evaluatedCondition: EvaluatedCondition = {
    id: rule.ruleId,
    name: rule.sanskritTitle,
    parameter: 'Putreśa (5th Lord) Dignity, House & Combustion',
    expected: '5th Lord in Kendra or Kona with benefic dignity, free from combustion',
    observed: `${fifthLordPlanet.name} in H${house} (${rashiName}, ${dignity}, Śaḍbala ${shadbalaRatio.toFixed(2)}x${isCombust ? ', combust' : ''})`,
    status,
    rationale: shastricVerdict,
    weight: 'mandatory',
  };

  return { evaluatedCondition, assessment };
}

// ==========================================
// 3. Natural Kāraka Jupiter (Guru) Assessment
// ==========================================
export function evaluateNaturalKarakaJupiterCondition(ctx: PredictionContext): {
  evaluatedCondition: EvaluatedCondition;
  assessment: NaturalKarakaJupiterAssessment;
} {
  const jup = ctx.planets['jupiter'];
  const house = jup.house;
  const rashiNum = jup.rashiNumber;
  const rashiName = jup.rashiName;
  const dignity = jup.dignity;
  const isRetrograde = jup.isRetrograde;
  const isCombust = jup.isCombust;
  const shadbalaRatio = jup.shadbalaRatio ?? 1.2;

  // Check Kārako Bhāva Nāśāya:
  // Is Jupiter in the 5th house as the sole occupant, without other benefic dṛṣṭi?
  const house5 = ctx.getHouse(5);
  const isAloneInFifth = house === 5 && house5.occupants.length === 1;
  const hasOtherBeneficDrishti = (house5.aspectsReceived || []).some((a) =>
    ['venus', 'mercury', 'moon'].includes(a.planetId)
  );
  const karakoBhavaNashayaFormed = isAloneInFifth && !hasOtherBeneficDrishti;

  // 5th house from Jupiter in Jupiter's BAV
  const fifthFromJupRashi = ((((rashiNum - 1) + 4) % 12) + 1) as RashiNumber;
  const jupBav = ctx.chart.ashtakavarga?.bav?.['jupiter'];
  const bavBindusInFifthFromJupiter = jupBav?.bindusByRashi?.[fifthFromJupRashi - 1] ?? 4;

  let status: ConditionStatus = 'satisfied';
  let shastricVerdict = '';

  if (dignity === 'debilitated' || isCombust) {
    status = 'contradicted';
    shastricVerdict = `Jupiter (Naisargika Putrakāraka) is compromised (${dignity}${isCombust ? ', combust' : ''}), suggesting karmic delays in progeny realization.`;
  } else if (karakoBhavaNashayaFormed) {
    status = 'partially_supported';
    shastricVerdict = `Jupiter occupies the 5th house in isolated splendor (*Kārako Bhāva Nāśāya* per BPHS 13.31), tending to produce late progeny or singular strong attachment.`;
  } else if (dignity === 'exalted' || dignity === 'own' || dignity === 'moolatrikona' || dignity === 'friendly') {
    status = 'satisfied';
    shastricVerdict = `Jupiter is strong and dignified in H${house} (${dignity}, Śaḍbala ${shadbalaRatio.toFixed(2)}x, BAV ${bavBindusInFifthFromJupiter} bindus in 5th from Guru), abundantly sheltering progeny.`;
  } else {
    status = 'partially_supported';
    shastricVerdict = `Jupiter is moderately placed in H${house} (${dignity}, Śaḍbala ${shadbalaRatio.toFixed(2)}x).`;
  }

  const assessment: NaturalKarakaJupiterAssessment = {
    planetId: 'jupiter',
    name: 'Jupiter (Guru)',
    rashiNumber: rashiNum,
    rashiName,
    house,
    dignity,
    isRetrograde,
    isCombust,
    shadbalaRatio,
    karakoBhavaNashayaFormed,
    bavBindusInFifthFromJupiter,
    shastricVerdict,
  };

  const rule = karakoBhavaNashayaFormed
    ? PROGENY_RULES.BPHS_13_KARAKO_BHAVA_NASHAYA
    : PROGENY_RULES.BPHS_13_PUTRA_BHAVA_SUBHA;

  const evaluatedCondition: EvaluatedCondition = {
    id: rule.ruleId,
    name: rule.sanskritTitle,
    parameter: 'Naisargika Putrakāraka Jupiter Dignity & Placement',
    expected: 'Jupiter in noble dignity, strong Shadbala, supportive 5th house contact',
    observed: `Jupiter in H${house} (${rashiName}, ${dignity}, Śaḍbala ${shadbalaRatio.toFixed(2)}x, Kārako Bhāva Nāśāya: ${karakoBhavaNashayaFormed ? 'Yes' : 'No'})`,
    status,
    rationale: shastricVerdict,
    weight: 'qualifying',
  };

  return { evaluatedCondition, assessment };
}

// ==========================================
// 4. Multi-Lagna Triangulation (Lagna, Moon, Jupiter, 9th House)
// ==========================================
export function evaluateMultiLagnaTriangulation(ctx: PredictionContext): MultiLagnaTriangulation {
  const lagnaRashi = ctx.chart.lagna.rashiNumber;
  const fifthFromLagnaRashi = ((((lagnaRashi - 1) + 4) % 12) + 1) as RashiNumber;

  const moonRashi = ctx.planets['moon'].rashiNumber;
  const fifthFromMoonRashi = ((((moonRashi - 1) + 4) % 12) + 1) as RashiNumber;

  const jupRashi = ctx.planets['jupiter'].rashiNumber;
  const fifthFromJupiterRashi = ((((jupRashi - 1) + 4) % 12) + 1) as RashiNumber;

  const ninthHouseRashi = ((((lagnaRashi - 1) + 8) % 12) + 1) as RashiNumber;
  const ninthHouseLord = RASHIS[ninthHouseRashi].lord as PlanetId;

  // Helper to score occupants of any rashi
  const getRashiOccupantsAndScore = (rNum: RashiNumber) => {
    const occupants: string[] = [];
    let score = 0;
    Object.values(ctx.planets).forEach((p) => {
      if (p.rashiNumber === rNum) {
        occupants.push(p.name);
        if (NATURAL_BENEFICS.includes(p.id)) score += 1;
        if (NATURAL_MALEFICS.includes(p.id)) score -= 1;
      }
    });
    return { occupants, score };
  };

  const fromLagna = getRashiOccupantsAndScore(fifthFromLagnaRashi);
  const fromMoon = getRashiOccupantsAndScore(fifthFromMoonRashi);
  const fromJupiter = getRashiOccupantsAndScore(fifthFromJupiterRashi);
  const fromNinth = getRashiOccupantsAndScore(ninthHouseRashi);

  const totalScore = fromLagna.score + fromMoon.score + fromJupiter.score + fromNinth.score;
  let synthesis = '';

  if (totalScore >= 3) {
    synthesis = 'Unanimous classical reinforcement: 5th from Lagna, Moon, and Jupiter simultaneously display strong benefic occupation, indicating smooth and joyous lineage.';
  } else if (totalScore >= 0) {
    synthesis = 'Harmonious cross-lagna foundation: Key progeny reference points balance minor planetary tensions, confirming normal generative potential.';
  } else {
    synthesis = 'Cross-lagna affliction: Notable malefic concentration across Moon and Jupiter reference houses suggests karmic tests requiring spiritual or astrological remediation.';
  }

  return {
    fifthFromLagnaRashi,
    fifthFromLagnaOccupants: fromLagna.occupants,
    fifthFromLagnaBeneficScore: fromLagna.score,
    fifthFromMoonRashi,
    fifthFromMoonOccupants: fromMoon.occupants,
    fifthFromMoonBeneficScore: fromMoon.score,
    fifthFromJupiterRashi,
    fifthFromJupiterOccupants: fromJupiter.occupants,
    fifthFromJupiterBeneficScore: fromJupiter.score,
    ninthHouseBhavatBhavamRashi: ninthHouseRashi,
    ninthHouseLord,
    ninthHouseBeneficScore: fromNinth.score,
    synthesis,
  };
}

// ==========================================
// 5. D7 Saptāṃśa Harmonic Confirmation
// ==========================================
export function evaluateD7SaptamshaCondition(ctx: PredictionContext): {
  evaluatedCondition: EvaluatedCondition;
  confirmation: D7SaptamshaConfirmation;
} {
  const allVargas = calculateAllVargas(ctx.chart.lagna.siderealLongitude, ctx.chart.planets);
  const d7Chart = allVargas.vargas['D7'];

  const d7LagnaRashi = d7Chart?.houses?.[1]?.rashiNumber ?? 1;
  const d7LagnaLord = (RASHIS[d7LagnaRashi]?.lord as PlanetId) ?? 'mars';

  const d7FifthRashi = d7Chart?.houses?.[5]?.rashiNumber ?? 5;
  const d7FifthLord = (RASHIS[d7FifthRashi]?.lord as PlanetId) ?? 'sun';

  const d7FifthHouseOccupants = (d7Chart?.houses?.[5]?.occupants ?? []).map(
    (o: any) => (typeof o === 'string' ? (GRAHA_NAMES[o as PlanetId] || o) : (o.english || o.sanskrit || String(o)))
  );

  const d7JupiterHouse = d7Chart?.planets?.['jupiter']?.house ?? 1;
  const d7JupiterRashi = d7Chart?.planets?.['jupiter']?.rashiNumber ?? 1;
  let d7JupiterDignity = 'neutral';
  if (d7JupiterRashi === 4) d7JupiterDignity = 'exalted';
  else if (d7JupiterRashi === 10) d7JupiterDignity = 'debilitated';
  else if (d7JupiterRashi === 9 || d7JupiterRashi === 12) d7JupiterDignity = 'own';

  // Where does D1 5th lord go in D7?
  const d1FifthLord = ctx.getLordOfHouse(5);
  const d1FifthLordInD7 = d7Chart?.planets?.[d1FifthLord.id];
  const d1LordHouseInD7 = d1FifthLordInD7?.house ?? 1;
  const d1LordRashiInD7 = d1FifthLordInD7?.rashiNumber ?? 1;
  const isKendraOrKona = [1, 4, 5, 7, 9, 10].includes(d1LordHouseInD7);
  const isDusthana = [6, 8, 12].includes(d1LordHouseInD7);

  let dignityInD7 = 'neutral';
  const pId = d1FifthLord.id;
  const rNum = d1LordRashiInD7;
  if (RASHIS[rNum]?.lord === pId) {
    dignityInD7 = 'own';
  } else if (
    (pId === 'sun' && rNum === 1) ||
    (pId === 'moon' && rNum === 2) ||
    (pId === 'mars' && rNum === 10) ||
    (pId === 'mercury' && rNum === 6) ||
    (pId === 'jupiter' && rNum === 4) ||
    (pId === 'venus' && rNum === 12) ||
    (pId === 'saturn' && rNum === 7)
  ) {
    dignityInD7 = 'exalted';
  } else if (
    (pId === 'sun' && rNum === 7) ||
    (pId === 'moon' && rNum === 8) ||
    (pId === 'mars' && rNum === 4) ||
    (pId === 'mercury' && rNum === 12) ||
    (pId === 'jupiter' && rNum === 10) ||
    (pId === 'venus' && rNum === 6) ||
    (pId === 'saturn' && rNum === 1)
  ) {
    dignityInD7 = 'debilitated';
  }

  // Saptāṃśa Vargottama:
  const isFifthLordSaptamshaVargottama = d1FifthLord.rashiNumber === d1LordRashiInD7;

  let vargaConfirmationStatus: D7SaptamshaConfirmation['vargaConfirmationStatus'] = 'harmonious';
  let shastricNote = '';

  if (isFifthLordSaptamshaVargottama || (isKendraOrKona && (dignityInD7 === 'exalted' || dignityInD7 === 'own'))) {
    vargaConfirmationStatus = 'strongly_reinforced';
    shastricNote = `D7 Saptāṃśa powerfully reinforces the progeny promise: D1 5th lord (${d1FifthLord.name}) occupies H${d1LordHouseInD7} in D7 (${dignityInD7}${isFifthLordSaptamshaVargottama ? ', Vargottama' : ''}) with Jupiter in H${d7JupiterHouse}.`;
  } else if (isDusthana && dignityInD7 === 'debilitated') {
    vargaConfirmationStatus = 'severely_afflicted';
    shastricNote = `D7 Saptāṃśa reveals deep karmic friction: D1 5th lord falls into Dusthāna H${d1LordHouseInD7} in D7 in debilitation, indicating that physical realization faces significant challenges.`;
  } else if (isDusthana) {
    vargaConfirmationStatus = 'mixed_friction';
    shastricNote = `D7 Saptāṃśa shows minor friction: D1 5th lord sits in H${d1LordHouseInD7} of D7, indicating initial delays before parental fruits manifest.`;
  } else {
    vargaConfirmationStatus = 'harmonious';
    shastricNote = `D7 Saptāṃśa provides supportive confirmation: D1 5th lord is in H${d1LordHouseInD7} in D7, with D7 5th lord (${GRAHA_NAMES[d7FifthLord]}) maintaining equilibrium.`;
  }

  const confirmation: D7SaptamshaConfirmation = {
    d7LagnaRashi,
    d7LagnaLord,
    d7FifthRashi,
    d7FifthLord,
    d7FifthHouseOccupants,
    d7JupiterHouse,
    d7JupiterDignity,
    d1FifthLordPlacementInD7: {
      rashiNumber: d1LordRashiInD7,
      houseInD7: d1LordHouseInD7,
      isKendraOrKona,
      isDusthana,
      dignityInD7,
    },
    isFifthLordSaptamshaVargottama,
    vargaConfirmationStatus,
    shastricNote,
  };

  const rule = PROGENY_RULES.BPHS_6_SAPTAMSHA_PUTRA;
  const status: ConditionStatus =
    vargaConfirmationStatus === 'strongly_reinforced'
      ? 'satisfied'
      : vargaConfirmationStatus === 'harmonious'
      ? 'satisfied'
      : vargaConfirmationStatus === 'mixed_friction'
      ? 'partially_supported'
      : 'contradicted';

  const evaluatedCondition: EvaluatedCondition = {
    id: rule.ruleId,
    name: rule.sanskritTitle,
    parameter: 'Saptāṃśa (D7) Harmonic Confirmation of Lineage',
    expected: 'D7 Lagna and 5th house dignified, D1 5th lord auspiciously placed in D7',
    observed: `D7 Lagna: ${RASHIS[d7LagnaRashi]?.sanskritName}, D7 5th Lord: ${GRAHA_NAMES[d7FifthLord]}, D1 5th Lord in D7: H${d1LordHouseInD7} (${dignityInD7}${isFifthLordSaptamshaVargottama ? ', Vargottama' : ''})`,
    status,
    rationale: shastricNote,
    weight: 'qualifying',
  };

  return { evaluatedCondition, confirmation };
}

// ==========================================
// 6. Specialized Progeny Sphuṭas: Bīja, Kṣetra, Santāna Tithi
// ==========================================
export function evaluateSpecializedSphutasProgeny(ctx: PredictionContext): SpecializedSphutasProgeny {
  const sunLong = ctx.chart.planets['sun'].siderealLongitude;
  const moonLong = ctx.chart.planets['moon'].siderealLongitude;
  const marsLong = ctx.chart.planets['mars'].siderealLongitude;
  const jupLong = ctx.chart.planets['jupiter'].siderealLongitude;
  const venLong = ctx.chart.planets['venus'].siderealLongitude;

  // 1. Bīja Sphuṭa = Sun + Venus + Jupiter (mod 360)
  const beejaLong = normalizeDegrees(sunLong + venLong + jupLong);
  const beejaRashi = (Math.floor(beejaLong / 30) + 1) as RashiNumber;
  const beejaDegInRashi = beejaLong % 30;
  const beejaNav = calculateNavamsha(beejaRashi, beejaDegInRashi);
  const isBeejaOddRashi = beejaRashi % 2 === 1;
  const isBeejaOddNav = beejaNav.navamshaRashiNumber % 2 === 1;

  let beejaStatus: NonNullable<SpecializedSphutasProgeny['beejaSphuta']>['status'] = 'Miśra (Mixed)';
  let beejaVerdict = '';
  if (isBeejaOddRashi && isBeejaOddNav) {
    beejaStatus = 'Sampūrṇa Bīja (Fully Fertile)';
    beejaVerdict = 'Both Rāśi and Navāṃśa of Bīja Sphuṭa fall in masculine (Odd) signs, verifying robust procreative vitality (*Sampūrṇa Bīja* per BPHS Ch. 83).';
  } else if (!isBeejaOddRashi && !isBeejaOddNav) {
    beejaStatus = 'Afflicted (Remedies Indicated)';
    beejaVerdict = 'Bīja Sphuṭa falls in feminine (Even) signs in both Rāśi and Navāṃśa, indicating procreative latency or genetic delay requiring traditional japa.';
  } else {
    beejaStatus = 'Miśra (Mixed)';
    beejaVerdict = 'Bīja Sphuṭa exhibits mixed polarity between Rāśi and Navāṃśa, indicating viable procreative capacity with standard lifestyle balance.';
  }

  // 2. Kṣetra Sphuṭa = Moon + Mars + Jupiter (mod 360)
  const kshetraLong = normalizeDegrees(moonLong + marsLong + jupLong);
  const kshetraRashi = (Math.floor(kshetraLong / 30) + 1) as RashiNumber;
  const kshetraDegInRashi = kshetraLong % 30;
  const kshetraNav = calculateNavamsha(kshetraRashi, kshetraDegInRashi);
  const isKshetraEvenRashi = kshetraRashi % 2 === 0;
  const isKshetraEvenNav = kshetraNav.navamshaRashiNumber % 2 === 0;

  let kshetraStatus: NonNullable<SpecializedSphutasProgeny['kshetraSphuta']>['status'] = 'Miśra (Mixed)';
  let kshetraVerdict = '';
  if (isKshetraEvenRashi && isKshetraEvenNav) {
    kshetraStatus = 'Sampūrṇa Kṣetra (Fully Receptive)';
    kshetraVerdict = 'Both Rāśi and Navāṃśa of Kṣetra Sphuṭa occupy feminine (Even) signs, confirming an exceptionally fertile, receptive uterine matrix (*Sampūrṇa Kṣetra*).';
  } else if (!isKshetraEvenRashi && !isKshetraEvenNav) {
    kshetraStatus = 'Afflicted (Remedies Indicated)';
    kshetraVerdict = 'Kṣetra Sphuṭa occupies masculine (Odd) signs in both Rāśi and Navāṃśa, indicating hormonal heat or physiological friction requiring śāntis.';
  } else {
    kshetraStatus = 'Miśra (Mixed)';
    kshetraVerdict = 'Kṣetra Sphuṭa exhibits balanced mixed polarity across Rāśi and Navāṃśa.';
  }

  // 3. Santāna Tithi = 5 * (Moon - Sun) mod 360 per Phaladīpikā 12.23
  const santanaDeg = normalizeDegrees(5 * (moonLong - sunLong));
  const tithiIndex = Math.floor(santanaDeg / 12); // 0 to 29
  const tithiNumber = (tithiIndex % 15) + 1;
  const paksha: 'Shukla' | 'Krishna' = tithiIndex < 15 ? 'Shukla' : 'Krishna';
  const isChidraOrRikta = [4, 9, 14].includes(tithiNumber) || (paksha === 'Krishna' && tithiNumber === 15) || (paksha === 'Krishna' && tithiNumber === 8);
  const isAuspicious = !isChidraOrRikta && !(paksha === 'Krishna' && tithiNumber > 10);

  const tithiNames = [
    'Pratipadā', 'Dvitīyā', 'Tṛtīyā', 'Caturthī', 'Pañcamī',
    'Ṣaṣṭhī', 'Saptamī', 'Aṣṭamī', 'Navamī', 'Daśamī',
    'Ekādaśī', 'Dvādaśī', 'Trayodaśī', 'Caturdaśī',
    paksha === 'Shukla' ? 'Pūrṇimā' : 'Amāvāsyā',
  ];
  const tithiName = `${paksha} ${tithiNames[tithiNumber - 1]}`;
  const santanaTithiVerdict = isAuspicious
    ? `Santāna Tithi (${tithiName}) is auspicious, confirming unhindered conception windows per Phaladīpikā 12.23.`
    : `Santāna Tithi (${tithiName}) falls in a Riktā or Chidra segment, advising astrological election (Muhūrta) for conception.`;

  return {
    beejaSphuta: {
      longitude: beejaLong,
      rashiNumber: beejaRashi,
      rashiName: RASHIS[beejaRashi]?.sanskritName || 'Mesha',
      isOddRashi: isBeejaOddRashi,
      navamshaRashiNumber: beejaNav.navamshaRashiNumber,
      isOddNavamsha: isBeejaOddNav,
      status: beejaStatus,
      shastricVerdict: beejaVerdict,
    },
    kshetraSphuta: {
      longitude: kshetraLong,
      rashiNumber: kshetraRashi,
      rashiName: RASHIS[kshetraRashi]?.sanskritName || 'Vrishabha',
      isEvenRashi: isKshetraEvenRashi,
      navamshaRashiNumber: kshetraNav.navamshaRashiNumber,
      isEvenNavamsha: isKshetraEvenNav,
      status: kshetraStatus,
      shastricVerdict: kshetraVerdict,
    },
    santanaTithi: {
      tithiNumber,
      tithiName,
      paksha,
      isAuspicious,
      isChidraOrRikta,
      shastricVerdict: santanaTithiVerdict,
    },
  };
}

// ==========================================
// 7. Jaimini Progeny Factors (PK, 5th from KL, A5)
// ==========================================
export function evaluateJaiminiProgenyFactors(ctx: PredictionContext): JaiminiProgenyFactors {
  const charaKarakas = ctx.chart.jaimini?.charaKarakas || [];
  const pkEntry = charaKarakas.find((k) => k.karakaKey === 'PK');
  const pkPlanet = pkEntry ? ctx.planets[pkEntry.planet] : ctx.planets['jupiter'];

  const karakamshaRashi = ctx.chart.jaimini?.karakamshaRashi || 1;
  const fifthFromKLRashi = ((((karakamshaRashi - 1) + 4) % 12) + 1) as RashiNumber;

  // Check planets in or aspecting 5th from KL via Jaimini Rāśi Dṛṣṭi
  const fifthFromKLModality = getModality(fifthFromKLRashi);
  const planetsInOrAspectingFifthFromKL: string[] = [];

  Object.values(ctx.planets).forEach((p) => {
    if (p.rashiNumber === fifthFromKLRashi) {
      planetsInOrAspectingFifthFromKL.push(`${p.name} (occupying)`);
      return;
    }
    const pModality = getModality(p.rashiNumber);
    let castsRashiDrishti = false;
    if (fifthFromKLModality === 'movable' && pModality === 'fixed') {
      const dist = ((p.rashiNumber - fifthFromKLRashi + 12) % 12) + 1;
      if (dist !== 2) castsRashiDrishti = true;
    } else if (fifthFromKLModality === 'fixed' && pModality === 'movable') {
      const dist = ((fifthFromKLRashi - p.rashiNumber + 12) % 12) + 1;
      if (dist !== 2) castsRashiDrishti = true;
    } else if (fifthFromKLModality === 'dual' && pModality === 'dual') {
      castsRashiDrishti = true;
    }
    if (castsRashiDrishti) {
      planetsInOrAspectingFifthFromKL.push(`${p.name} (aspecting)`);
    }
  });

  // Putrapada (A5 / Mantra Pada)
  const arudhas = ctx.chart.jaimini?.arudhaPadas || [];
  const a5 = arudhas.find((a) => a.house === 5);
  const al = arudhas.find((a) => a.house === 1);
  const a5Rashi = a5?.rashiNumber || 5;
  const alRashi = al?.rashiNumber || 1;

  const distFromAL = ((a5Rashi - alRashi + 12) % 12) + 1;
  const isDusthanaFromAL = [6, 8, 12].includes(distFromAL);

  let jaiminiProgenyVerdict = '';
  if (planetsInOrAspectingFifthFromKL.some((g) => g.includes('Jupiter') || g.includes('Venus'))) {
    jaiminiProgenyVerdict = `Jaimini synthesis is highly favorable: Putrakāraka is ${pkPlanet.name} in H${pkPlanet.house}, and 5th from Kārakāṃśa receives benefic aspect, assuring intellectual and virtuous progeny (*Jaimini Upadeśa Sūtras 1.4*).`;
  } else if (isDusthanaFromAL) {
    jaiminiProgenyVerdict = `Putrakāraka is ${pkPlanet.name}; Putrapada (A5) is in H${distFromAL} from Ārūḍha Lagna, indicating external delays or social scrutiny before parental fulfillment.`;
  } else {
    jaiminiProgenyVerdict = `Putrakāraka is ${pkPlanet.name} in ${pkPlanet.rashiName}; Jaimini factors confirm stable, balanced lineage continuation.`;
  }

  return {
    putrakarakaGraha: {
      id: pkPlanet.id,
      name: pkPlanet.name,
      rashi: pkPlanet.rashiName,
      house: pkPlanet.house,
      dignity: pkPlanet.dignity,
    },
    karakamshaRashi,
    fifthFromKarakamshaRashi: fifthFromKLRashi,
    planetsInOrAspectingFifthFromKL,
    putrapadaA5: {
      rashiNumber: a5Rashi,
      rashiName: RASHIS[a5Rashi]?.sanskritName || 'Simha',
      houseFromLagna: a5 ? (((a5.rashiNumber - ctx.chart.lagna.rashiNumber + 12) % 12) + 1) : 5,
      isDusthanaFromAL,
    },
    jaiminiProgenyVerdict,
  };
}

// ==========================================
// 8. Karmic Curses (Santāna Śāpas) & Shastric Bhaṅga
// ==========================================
export function evaluateKarmicShapasAndObstacles(ctx: PredictionContext): ProgenyObstacleOrShapa[] {
  const obstacles: ProgenyObstacleOrShapa[] = [];
  const house5 = ctx.getHouse(5);
  const fifthLord = ctx.getLordOfHouse(5);
  const jupiter = ctx.planets['jupiter'];
  const saturn = ctx.planets['saturn'];
  const mars = ctx.planets['mars'];
  const rahu = ctx.planets['rahu'];
  const sun = ctx.planets['sun'];
  const moon = ctx.planets['moon'];

  // Global Bhaṅga Check (Sarvārtha Cintāmaṇi 5.45 & Jātaka Pārijāta 13.35):
  // Strong Jupiter in Kendra (1, 4, 7, 10) or aspecting 5th house or Lagna cancels all curses!
  const jupInKendra = [1, 4, 7, 10].includes(jupiter.house) && (jupiter.dignity === 'exalted' || jupiter.dignity === 'own' || jupiter.dignity === 'friendly');
  const jupAspectsFifth = ctx.planetAspectsHouse('jupiter', 5) || jupiter.house === 5;
  const globalBhanga = jupInKendra || jupAspectsFifth;
  const globalBhangaReason = jupAspectsFifth
    ? 'Jupiter casts a direct sacred dṛṣṭi upon the 5th house, neutralising classical curse afflictions (Sarvārtha Cintāmaṇi 5.45).'
    : jupInKendra
    ? 'Powerful Jupiter presiding in an angular Kendra (H' + jupiter.house + ') grants divine immunity and dissolves Anapatya afflictions.'
    : undefined;

  // 1. Sarpa Śāpa (Rahu in 5th aspected by Mars, or Mars-Rahu in 5th)
  const rahuIn5 = house5.occupants.includes('rahu');
  const marsIn5 = house5.occupants.includes('mars');
  const marsAspects5 = ctx.planetAspectsHouse('mars', 5);
  if ((rahuIn5 && marsAspects5) || (rahuIn5 && marsIn5)) {
    obstacles.push({
      shapaType: 'Sarpa Śāpa (Rahu/Mars curse)',
      sourceText: 'BPHS Ch. 13, Śloka 32–41',
      shastricReference: 'सर्पशापात् सुतक्षयः (Nāga afflictions)',
      diagnosticSymptoms: 'Rahu and Mars co-influence the 5th house, producing reproductive anxiety, heat, or delayed gestation.',
      hasBhanga: globalBhanga,
      bhangaReason: globalBhangaReason,
      classicalRemedy: 'Pratiṣṭhā of silver Nāga idol, worship of Lord Subrahmaṇya / Kārtikeya, or Mahāmṛtyuñjaya Japa.',
    });
  }

  // 2. Pitṛ Śāpa (Sun in 5th afflicted by Saturn/Rahu, or 5th lord + Sun in 8th)
  const sunIn5 = house5.occupants.includes('sun');
  const saturnAspects5 = ctx.planetAspectsHouse('saturn', 5);
  const fifthLordWithSunIn8 = fifthLord.house === 8 && sun.house === 8;
  if ((sunIn5 && (saturnAspects5 || rahuIn5)) || fifthLordWithSunIn8) {
    obstacles.push({
      shapaType: 'Pitṛ Śāpa (Ancestral affliction via Sun)',
      sourceText: 'BPHS Ch. 13, Śloka 42–52',
      shastricReference: 'पितृशापादपत्यनाशः (Ancestral karmic debt)',
      diagnosticSymptoms: 'Affliction connecting Sūrya, the 5th house, and Saturn/Rahu, indicating paternal or ancestral vows needing fulfillment.',
      hasBhanga: globalBhanga,
      bhangaReason: globalBhangaReason,
      classicalRemedy: 'Performance of Pitṛ Tarpaṇa / Piṇḍadāna at Gaya or sacred tīrthas, Harivaṃśa Purāṇa reading.',
    });
  }

  // 3. Mātṛ Śāpa (Moon afflicted in 5th by Saturn/Mars)
  const moonIn5 = house5.occupants.includes('moon');
  if (moonIn5 && (saturnAspects5 || marsAspects5 || marsIn5)) {
    obstacles.push({
      shapaType: 'Mātṛ Śāpa (Matrilineal affliction via Moon)',
      sourceText: 'BPHS Ch. 13, Śloka 53–62',
      shastricReference: 'मातृशापात् सुतबाधः (Maternal karmic debt)',
      diagnosticSymptoms: 'Candra in the 5th under cruel malefic aspects, indicating psychological stress or maternal grief.',
      hasBhanga: globalBhanga,
      bhangaReason: globalBhangaReason,
      classicalRemedy: 'Gau-dāna (cow worship/support), worship of Divine Mother / Lalitā Sahasranāma.',
    });
  }

  // 4. Brāhmaṇa / Guru Śāpa (Jupiter afflicted by Saturn/Rahu in 5th or 9th)
  if ((jupiter.house === 5 || jupiter.house === 9) && (jupiter.dignity === 'debilitated' || (saturn.house === jupiter.house && rahu.house === jupiter.house))) {
    obstacles.push({
      shapaType: 'Brāhmaṇa / Guru Śāpa (Preceptor affliction via Jupiter)',
      sourceText: 'BPHS Ch. 13, Śloka 63–73',
      shastricReference: 'गुरुशापादपत्यबाधः (Preceptor debt)',
      diagnosticSymptoms: 'Jupiter distressed in Dharma/Putra sthāna, calling for respect toward spiritual mentors.',
      hasBhanga: globalBhanga,
      bhangaReason: globalBhangaReason,
      classicalRemedy: 'Honoring spiritual teachers, Viṣṇu Sahasranāma recitation, educational charity to youth.',
    });
  }

  // 5. Kārako Bhāva Nāśāya
  if (
    jupiter.house === 5 &&
    house5.occupants.length === 1 &&
    !(house5.aspectsReceived || []).some((a) => NATURAL_BENEFICS.includes(a.planetId))
  ) {
    obstacles.push({
      shapaType: 'Kārako Bhāva Nāśāya (Isolated Jupiter in 5th)',
      sourceText: 'BPHS Ch. 13, Śloka 31 & Jātaka Pārijāta 13.12',
      shastricReference: 'कारको भावनाशाय (Significator self-inundation)',
      diagnosticSymptoms: 'Jupiter as sole occupant of the 5th house generates excessive expectations or delayed realization of children.',
      hasBhanga: false,
      classicalRemedy: 'Regular recitation of Santāna Gopāla Mantra and cultivation of emotional detachment.',
    });
  }

  return obstacles;
}

// ==========================================
// 9. Delay vs. Denial Synthesis (Vilamba vs Anapatya)
// ==========================================
export function evaluateDelayVsDenial(
  fifthHouse: FifthHouseAssessment,
  fifthLord: FifthLordAssessment,
  jupiterAssessment: NaturalKarakaJupiterAssessment,
  d7Confirmation: D7SaptamshaConfirmation,
  obstacles: ProgenyObstacleOrShapa[]
): DelayVsDenialProgeny {
  const delayingFactors: string[] = [];
  const mitigatingFactors: string[] = [];

  // Check delaying agents (Saturn influence, retrograde, 8th house)
  if (fifthHouse.occupants.some((o) => o.id === 'saturn')) {
    delayingFactors.push('Saturn occupies the 5th house (*Manda Vilamba* per Sārāvalī 34.25)');
  }
  if (fifthHouse.aspectingPlanets.some((a) => a.id === 'saturn')) {
    delayingFactors.push('Saturn casts aspect upon the 5th house, indicating maturity in timing');
  }
  if (fifthLord.isRetrograde) {
    delayingFactors.push(`Putreśa (${fifthLord.name}) is retrograde, signifying deep karmic gestation`);
  }
  if (fifthLord.house === 8) {
    delayingFactors.push(`Putreśa is placed in the 8th house, causing initial anxieties before parental fruits`);
  }
  if (fifthHouse.fertilityType === 'barren') {
    delayingFactors.push(`5th house falls in a barren/semi-fruitful sign (${fifthHouse.rashiName})`);
  }

  // Check mitigating agents
  if (fifthLord.dignity === 'exalted' || fifthLord.dignity === 'own') {
    mitigatingFactors.push(`Putreśa is highly dignified (${fifthLord.dignity})`);
  }
  if (jupiterAssessment.dignity === 'exalted' || jupiterAssessment.dignity === 'own') {
    mitigatingFactors.push(`Naisargika Putrakāraka Jupiter is fortified (${jupiterAssessment.dignity})`);
  }
  if (fifthHouse.aspectingPlanets.some((a) => a.id === 'jupiter')) {
    mitigatingFactors.push('Jupiter casts benign 5th house aspect');
  }
  if (fifthHouse.savBindus >= 28) {
    mitigatingFactors.push(`5th house possesses strong SAV bio-astrological reserves (${fifthHouse.savBindus} bindus)`);
  }
  if (d7Confirmation.vargaConfirmationStatus === 'strongly_reinforced') {
    mitigatingFactors.push('D7 Saptāṃśa powerfully redeems and anchors the progeny promise');
  }

  const unmitigatedShapas = obstacles.filter((o) => !o.hasBhanga);
  const isDeepDenial =
    fifthLord.placedInDusthana &&
    fifthLord.dignity === 'debilitated' &&
    jupiterAssessment.dignity === 'debilitated' &&
    fifthHouse.savEvaluation === 'deficient' &&
    d7Confirmation.vargaConfirmationStatus === 'severely_afflicted';

  let verdictType: DelayVsDenialProgeny['verdictType'] = 'timely_realization';
  let classicalTextSummary = '';

  if (isDeepDenial) {
    verdictType = 'deep_structural_denial';
    classicalTextSummary =
      'Classical texts identify comprehensive Anapatya conditions across D1, D7, and Jupiter, suggesting that biological progeny faces severe structural resistance requiring adoption or profound spiritual dedication.';
  } else if (unmitigatedShapas.length > 0) {
    verdictType = 'karmic_impediment_with_bhanga';
    classicalTextSummary = `Karmic obstacles (${unmitigatedShapas.map((s) => s.shapaType).join(', ')}) create resistance, yet shastric mitigations are present to navigate delays.`;
  } else if (delayingFactors.length > 0) {
    verdictType = 'saturnine_delay';
    classicalTextSummary =
      'Progeny promise is structurally intact but conditioned by classical Vilamba (delay). Saturnine or retrograde factors defer childbirth to mature adulthood (post-30 or post-36), after which healthy children arrive.';
  } else {
    verdictType = 'timely_realization';
    classicalTextSummary =
      'Foundational progeny promise is unhindered by severe delay or denial factors, indicating timely fruition in accordance with Daśā activation.';
  }

  return {
    verdictType,
    classicalTextSummary,
    delayingFactors,
    mitigatingFactors,
  };
}

// ==========================================
// 10. Progeny Timing Arc (Daśā & Activating Grahas)
// ==========================================
export function evaluateProgenyTimingArc(
  ctx: PredictionContext,
  fifthLord: FifthLordAssessment,
  d7Confirmation: D7SaptamshaConfirmation
): ProgenyTimingArc {
  const activeMahadasha = ctx.activeMahadasha || 'jupiter';
  const activeAntardasha = ctx.activeAntardasha || 'mercury';

  // Primary activation grahas for progeny:
  // 1. Putreśa (5th lord)
  // 2. Jupiter (Putrakāraka)
  // 3. Occupants and aspectors of 5th
  // 4. D7 5th lord and D7 Lagna lord
  // 5. 9th lord (Bhavat Bhavam)
  const prospectiveActivationGrahas: string[] = [
    fifthLord.name,
    'Jupiter',
    GRAHA_NAMES[d7Confirmation.d7FifthLord]?.english || String(d7Confirmation.d7FifthLord),
    GRAHA_NAMES[d7Confirmation.d7LagnaLord]?.english || String(d7Confirmation.d7LagnaLord),
  ];

  const house5 = ctx.getHouse(5);
  house5.occupants.forEach((pId) => {
    const name = GRAHA_NAMES[pId]?.english || String(pId);
    if (!prospectiveActivationGrahas.includes(name)) prospectiveActivationGrahas.push(name);
  });

  const isMahadashaFavorable = prospectiveActivationGrahas.some(
    (g) => g.toLowerCase() === activeMahadasha.toLowerCase()
  );
  const isAntardashaFavorable = prospectiveActivationGrahas.some(
    (g) => g.toLowerCase() === activeAntardasha.toLowerCase()
  );

  const timingEpistemologicalNotice =
    'Authentic Jyotiṣa determines event timing through active Daśā/Antardaśā and transit alignment (Dvigurvādhi) of Jupiter and Saturn, rejecting speculative calendar dates.';

  return {
    activeMahadasha: GRAHA_NAMES[activeMahadasha as PlanetId]?.english || String(activeMahadasha),
    activeAntardasha: GRAHA_NAMES[activeAntardasha as PlanetId]?.english || String(activeAntardasha),
    isMahadashaFavorable,
    isAntardashaFavorable,
    prospectiveActivationGrahas,
    timingEpistemologicalNotice,
  };
}

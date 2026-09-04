/**
 * Gaṇaka — Master Classical Dosha & Ariṣṭa Evaluation Engine
 * Phase 2: Canonical Database, Evaluation Matrix & Researched Remedies
 */

import { JyotishaChart, PlanetId, RashiNumber } from '../jyotisha/types';
import {
  DoshaDefinition,
  DoshaEvaluationContext,
  EvaluatedDosha,
  DoshaSummaryReport,
  DoshaCategory,
  ClassicalStatus,
  EvaluatedCondition,
} from './dosha-types';

import { CLASSICAL_GRAHA_DOSHAS } from './classical-graha-doshas';
import { CLASSICAL_ARISTA_DOSHAS } from './arista-balarishta-doshas';
import { GANDANTA_NAKSHATRA_DOSHAS } from './gandanta-nakshatra-doshas';
import { CLASSICAL_SHAPA_DOSHAS } from './shapa-progeny-doshas';
import { CLASSICAL_MARRIAGE_DOSHAS } from './marriage-kuja-doshas';
import { MODERN_CONTESTED_DOSHAS } from './modern-contested-doshas';
import { getRemediesForDosha } from './classical-remedies';
import { RASHI_LORDS } from './dosha-utils';

/**
 * Master Registry of all verified Classical & Traditional Dosha Definitions
 */
export const ALL_DOSHA_DEFINITIONS: DoshaDefinition[] = [
  ...CLASSICAL_GRAHA_DOSHAS,
  ...CLASSICAL_ARISTA_DOSHAS,
  ...GANDANTA_NAKSHATRA_DOSHAS,
  ...CLASSICAL_SHAPA_DOSHAS,
  ...CLASSICAL_MARRIAGE_DOSHAS,
  ...MODERN_CONTESTED_DOSHAS,
];

export interface DoshaEngineOptions {
  include2ndHouseKujaDosha?: boolean;
  includeSouthIndianKujaVariants?: boolean;
}

/**
 * Formats a planet's longitude, sign, and house for clear display in chart factor checklists
 */
function formatPlanetPosition(planet: PlanetId, ctx: DoshaEvaluationContext): string {
  const p = ctx.planets[planet];
  if (!p) return `${planet.toUpperCase()} (Not found in chart)`;
  const deg = Math.floor(p.longitudeInRashi);
  const min = Math.floor((p.longitudeInRashi - deg) * 60);
  return `${p.name} in ${p.rashiName} (${deg}°${min.toString().padStart(2, '0')}', House ${p.house}${p.isRetrograde ? ' ℞' : ''})`;
}

/**
 * Builds explicit evaluated conditions (Condition 1, Condition 2, etc.) for any Dosha
 * with exact chart factors responsible for Met / Not Met states.
 */
function buildEvaluatedConditions(
  def: DoshaDefinition,
  result: ReturnType<DoshaDefinition['evaluate']>,
  ctx: DoshaEvaluationContext
): EvaluatedCondition[] {
  if (result.evaluatedConditions && result.evaluatedConditions.length > 0) {
    return result.evaluatedConditions;
  }

  const conditions: EvaluatedCondition[] = [];

  // 1. Graha Yuddha
  if (def.id === 'graha_yuddha') {
    const isMet = result.formationStatus === 'Formed';
    conditions.push({
      conditionLabel: 'Two non-luminary planets (Mars, Mercury, Jupiter, Venus, Saturn) in same sign within 1°00\'',
      isMet,
      chartFactor: isMet
        ? result.conditionsMet.join('; ')
        : 'All non-luminary planets maintain angular separation > 1°00\' across all signs',
    });
    return conditions;
  }

  // 2. Pāpa Kartarī of Lagna
  if (def.id === 'papa_kartari_lagna') {
    const p12 = Object.values(ctx.planets).filter((p) => p.house === 12 && ['sun', 'mars', 'saturn', 'rahu', 'ketu'].includes(p.id));
    const p2 = Object.values(ctx.planets).filter((p) => p.house === 2 && ['sun', 'mars', 'saturn', 'rahu', 'ketu'].includes(p.id));
    const c1Met = p12.length > 0;
    const c2Met = p2.length > 0;
    conditions.push({
      conditionLabel: 'Natural malefic graha situated in the 12th house (Vyaya Bhāva)',
      isMet: c1Met,
      chartFactor: c1Met
        ? p12.map((p) => formatPlanetPosition(p.id as PlanetId, ctx)).join(', ')
        : '12th House free of natural malefics',
    });
    conditions.push({
      conditionLabel: 'Natural malefic graha situated in the 2nd house (Dhana Bhāva)',
      isMet: c2Met,
      chartFactor: c2Met
        ? p2.map((p) => formatPlanetPosition(p.id as PlanetId, ctx)).join(', ')
        : '2nd House free of natural malefics',
    });
    return conditions;
  }

  // 3. Pāpa Kartarī of Moon
  if (def.id === 'papa_kartari_chandra') {
    const moon = ctx.planets.moon;
    const moonHouse = moon ? moon.house : 1;
    const prevH = moonHouse === 1 ? 12 : moonHouse - 1;
    const nextH = moonHouse === 12 ? 1 : moonHouse + 1;
    const pPrev = Object.values(ctx.planets).filter((p) => p.house === prevH && ['sun', 'mars', 'saturn', 'rahu', 'ketu'].includes(p.id));
    const pNext = Object.values(ctx.planets).filter((p) => p.house === nextH && ['sun', 'mars', 'saturn', 'rahu', 'ketu'].includes(p.id));
    const c1 = pPrev.length > 0;
    const c2 = pNext.length > 0;
    conditions.push({
      conditionLabel: `Natural malefic graha in 12th from Moon (${prevH}th House)`,
      isMet: c1,
      chartFactor: c1 ? pPrev.map((p) => formatPlanetPosition(p.id as PlanetId, ctx)).join(', ') : `House ${prevH} free of malefics`,
    });
    conditions.push({
      conditionLabel: `Natural malefic graha in 2nd from Moon (${nextH}th House)`,
      isMet: c2,
      chartFactor: c2 ? pNext.map((p) => formatPlanetPosition(p.id as PlanetId, ctx)).join(', ') : `House ${nextH} free of malefics`,
    });
    return conditions;
  }

  // 4. Kuja / Maṅgala Doṣa
  if (def.id === 'kuja_dosha') {
    const mars = ctx.planets.mars;
    const kujaHouses = ctx.config?.include2ndHouseKujaDosha ? [1, 2, 4, 7, 8, 12] : [1, 4, 7, 8, 12];
    const isMarsInKujaHouse = mars ? kujaHouses.includes(mars.house) : false;
    conditions.push({
      conditionLabel: `Mars positioned in Lagna, 4th, 7th, 8th, 12th${ctx.config?.include2ndHouseKujaDosha ? ' or 2nd (South Indian tradition)' : ''} from Ascendant`,
      isMet: isMarsInKujaHouse,
      chartFactor: mars ? formatPlanetPosition('mars', ctx) : 'Mars not evaluated',
    });

    if (isMarsInKujaHouse) {
      const hasBhanga = result.exceptionsApplied.length > 0;
      conditions.push({
        conditionLabel: 'Absence of classical cancellation (Swakshetra, Uchcha, Jupiter aspect, or sign exemptions)',
        isMet: !hasBhanga,
        chartFactor: hasBhanga
          ? `Parihāra triggered: ${result.exceptionsApplied.join('; ')}`
          : 'No classical Kuja Parihāra cancellation met in this chart',
      });
    }
    return conditions;
  }

  // 5. Guru Cāṇḍāla Yoga
  if (def.id === 'guru_chandala_yoga') {
    const jup = ctx.planets.jupiter;
    const rahu = ctx.planets.rahu;
    const isConj = jup && rahu && jup.rashiNumber === rahu.rashiNumber;
    conditions.push({
      conditionLabel: 'Jupiter (Guru) and Rāhu conjunct in the same sign',
      isMet: !!isConj,
      chartFactor: isConj
        ? `${formatPlanetPosition('jupiter', ctx)} conjoined with ${formatPlanetPosition('rahu', ctx)}`
        : `Jupiter is in ${jup?.rashiName || 'N/A'} (House ${jup?.house}) while Rāhu is in ${rahu?.rashiName || 'N/A'} (House ${rahu?.house})`,
    });
    return conditions;
  }

  // 6. Aṅgāraka Yoga
  if (def.id === 'angarakha_yoga') {
    const mars = ctx.planets.mars;
    const rahu = ctx.planets.rahu;
    const isConj = mars && rahu && mars.rashiNumber === rahu.rashiNumber;
    conditions.push({
      conditionLabel: 'Mars (Kuja) and Rāhu conjunct in the same sign',
      isMet: !!isConj,
      chartFactor: isConj
        ? `${formatPlanetPosition('mars', ctx)} conjoined with ${formatPlanetPosition('rahu', ctx)}`
        : `Mars is in ${mars?.rashiName || 'N/A'} (House ${mars?.house}) while Rāhu is in ${rahu?.rashiName || 'N/A'} (House ${rahu?.house})`,
    });
    return conditions;
  }

  // 7. Śani-Rāhu Affliction
  if (def.id === 'shani_rahu_dosha') {
    const sat = ctx.planets.saturn;
    const rahu = ctx.planets.rahu;
    const isConj = sat && rahu && sat.rashiNumber === rahu.rashiNumber;
    conditions.push({
      conditionLabel: 'Saturn (Śani) and Rāhu conjunct in the same sign',
      isMet: !!isConj,
      chartFactor: isConj
        ? `${formatPlanetPosition('saturn', ctx)} conjoined with ${formatPlanetPosition('rahu', ctx)}`
        : `Saturn is in ${sat?.rashiName || 'N/A'} (House ${sat?.house}) while Rāhu is in ${rahu?.rashiName || 'N/A'} (House ${rahu?.house})`,
    });
    return conditions;
  }

  // 8. Sūrya-Śani Mutual Affliction
  if (def.id === 'surya_shani_dosha') {
    const sun = ctx.planets.sun;
    const sat = ctx.planets.saturn;
    const isConj = sun && sat && sun.rashiNumber === sat.rashiNumber;
    const isOpp = sun && sat && ((sat.house - sun.house + 12) % 12) + 1 === 7;
    const isMet = !!(isConj || isOpp);
    conditions.push({
      conditionLabel: 'Sun (Sūrya) and Saturn (Śani) in mutual conjunction or 1/7 opposition',
      isMet,
      chartFactor: isMet
        ? `${formatPlanetPosition('sun', ctx)} ${isConj ? 'conjoined with' : 'opposing'} ${formatPlanetPosition('saturn', ctx)}`
        : `Sun is in ${sun?.rashiName || 'N/A'} (House ${sun?.house}) and Saturn is in ${sat?.rashiName || 'N/A'} (House ${sat?.house})`,
    });
    return conditions;
  }

  // 9. Kendra-Hīna (Void Kendras)
  if (def.id === 'kendra_hina_dosha') {
    const kendraPlanets = Object.values(ctx.planets).filter((p) => [1, 4, 7, 10].includes(p.house));
    const isMet = kendraPlanets.length === 0;
    conditions.push({
      conditionLabel: 'All 4 Kendra houses (1st, 4th, 7th, 10th) completely devoid of planetary occupation',
      isMet,
      chartFactor: isMet
        ? 'No planets situated in 1st, 4th, 7th, or 10th houses'
        : `Kendras occupied by: ${kendraPlanets.map((p) => `${p.name} (House ${p.house})`).join(', ')}`,
    });
    return conditions;
  }

  // 10. Sarpa Śāpa (BPHS Ch. 83)
  if (def.id === 'sarpa_shapa') {
    const p5Lords = Object.values(ctx.planets).filter((p) => p.house === 5);
    const mars = ctx.planets.mars;
    const rahu = ctx.planets.rahu;
    const isMet = result.formationStatus === 'Formed';
    conditions.push({
      conditionLabel: 'Affliction to 5th House / 5th Lord by Rāhu, Mars, or Saturn as specified in BPHS 83:14–22',
      isMet,
      chartFactor: isMet
        ? result.conditionsMet.join('; ')
        : `5th House is ${ctx.chart.lagna.rashiNumber === 8 ? 'Pisces' : 'free of BPHS Sarpa Śāpa combination'} (Rāhu in H${rahu?.house}, Mars in H${mars?.house}, 5th occupants: ${p5Lords.length > 0 ? p5Lords.map((p) => p.name).join(', ') : 'None'})`,
    });
    return conditions;
  }

  // 11. Pitṛ Śāpa (BPHS Ch. 83)
  if (def.id === 'pitri_shapa') {
    const isMet = result.formationStatus === 'Formed';
    const sun = ctx.planets.sun;
    conditions.push({
      conditionLabel: '5th House / 5th Lord afflicted by Sun in debility, Navāṃśa of Saturn, or malefic conjunctions (BPHS 83:33–42)',
      isMet,
      chartFactor: isMet
        ? result.conditionsMet.join('; ')
        : `Sun in ${sun?.rashiName || 'N/A'} (House ${sun?.house}); 5th house parameters do not trigger classical Pitṛ Śāpa`,
    });
    return conditions;
  }

  // 12. Mātṛ Śāpa (BPHS Ch. 83)
  if (def.id === 'matri_shapa') {
    const isMet = result.formationStatus === 'Formed';
    const moon = ctx.planets.moon;
    conditions.push({
      conditionLabel: '5th House / 5th Lord afflicted by debilitated/dark Moon hemmed or aspected by malefics (BPHS 83:50–57)',
      isMet,
      chartFactor: isMet
        ? result.conditionsMet.join('; ')
        : `Moon in ${moon?.rashiName || 'N/A'} (House ${moon?.house}); 5th house free of classical Mātṛ Śāpa combinations`,
    });
    return conditions;
  }

  // 13. Brahma / Guru Śāpa (BPHS Ch. 83)
  if (def.id === 'brahma_shapa') {
    const isMet = result.formationStatus === 'Formed';
    const jup = ctx.planets.jupiter;
    conditions.push({
      conditionLabel: 'Jupiter afflicted in 5th house / 5th lord in signs of Mars/Saturn with Rahu/malefics (BPHS 83:72–81)',
      isMet,
      chartFactor: isMet
        ? result.conditionsMet.join('; ')
        : `Jupiter in ${jup?.rashiName || 'N/A'} (House ${jup?.house}); no classical Brahma Śāpa alignment detected`,
    });
    return conditions;
  }

  // 14. Nakṣatra Gandānta
  if (def.id === 'nakshatra_gandanta') {
    const moon = ctx.planets.moon;
    const isMet = result.formationStatus === 'Formed';
    conditions.push({
      conditionLabel: 'Moon situated in the terminal/initial 3°20\' junction of Revatī-Aśvinī, Āśleṣā-Maghā, or Jyeṣṭhā-Mūla',
      isMet,
      chartFactor: isMet
        ? result.conditionsMet.join('; ')
        : moon
        ? `Moon in ${moon.nakshatraName} pada ${moon.pada} (${moon.rashiName} ${Math.floor(moon.longitudeInRashi)}°${Math.floor((moon.longitudeInRashi % 1) * 60)}' — outside Gandānta junction)`
        : 'Moon position evaluated',
    });
    return conditions;
  }

  // 15. Abhukta Mūla
  if (def.id === 'abhukta_mula_dosha') {
    const moon = ctx.planets.moon;
    const isMet = result.formationStatus === 'Formed';
    conditions.push({
      conditionLabel: 'Moon situated in terminal 48 arcminutes of Jyeṣṭhā or initial 48 arcminutes of Mūla Nakṣatra',
      isMet,
      chartFactor: isMet
        ? result.conditionsMet.join('; ')
        : moon
        ? `Moon in ${moon.nakshatraName} (${moon.rashiName} ${Math.floor(moon.longitudeInRashi)}°${Math.floor((moon.longitudeInRashi % 1) * 60)}' — outside Abhukta boundary)`
        : 'Moon evaluated',
    });
    return conditions;
  }

  // 16. Kāla Sarpa / Kāla Amṛta Doṣa
  if (def.id === 'kala_sarpa_dosha') {
    const isMet = result.formationStatus === 'Formed';
    const isCan = result.formationStatus === 'Cancelled';
    conditions.push({
      conditionLabel: 'All 7 classical visible planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) hemmed strictly within one nodal hemisphere between Rāhu and Ketu',
      isMet: isMet || isCan,
      chartFactor: (isMet || isCan)
        ? (result.appliedVariant || 'All 7 visible planets situated between nodal axis')
        : 'Planets are distributed on both sides of the Rāhu–Ketu nodal axis (no nodal confinement)',
    });
    if (isCan) {
      conditions.push({
        conditionLabel: 'Absence of classical Bhaṅga (planet conjoining Rahu/Ketu or Lagna outside axis)',
        isMet: false,
        chartFactor: `Bhaṅga cancellation active: ${result.exceptionsApplied.join('; ')}`,
      });
    }
    return conditions;
  }

  // 17. Pañcāṅga Afflictions (Amāvāsyā, Saṅkrānti, Grahaṇa, Viṣṭi)
  if (def.id === 'amavasya_janma') {
    const isMet = result.formationStatus === 'Formed';
    conditions.push({
      conditionLabel: 'Birth occurring on 30th Tithi (Amāvāsyā — Dark Moon)',
      isMet,
      chartFactor: `Current Tithi: ${ctx.panchanga.tithi.name} (${ctx.panchanga.tithi.paksha} Pakṣa #${ctx.panchanga.tithi.number})`,
    });
    return conditions;
  }

  if (def.id === 'vishti_bhadra_karana') {
    const isMet = result.formationStatus === 'Formed';
    conditions.push({
      conditionLabel: 'Birth occurring during Viṣṭi (Bhadrā) Karaṇa',
      isMet,
      chartFactor: `Current Karaṇa: ${ctx.panchanga.karana.name} (#${ctx.panchanga.karana.number})`,
    });
    return conditions;
  }

  // Default fallback condition builder from result.conditionsMet / exceptionsApplied
  if (result.conditionsMet.length > 0) {
    result.conditionsMet.forEach((cond, idx) => {
      conditions.push({
        conditionLabel: `Canonical condition #${idx + 1} (${def.name})`,
        isMet: true,
        chartFactor: cond,
      });
    });
  } else {
    conditions.push({
      conditionLabel: `Primary formation criteria for ${def.name}`,
      isMet: false,
      chartFactor: `Planetary configuration does not satisfy canonical criteria (${def.definition.slice(0, 100)}...)`,
    });
  }

  return conditions;
}

/**
 * Derives a clean, concise explanation of why the Dosha formed or did not form
 */
function buildFormationReason(
  def: DoshaDefinition,
  result: ReturnType<DoshaDefinition['evaluate']>,
  conditions: EvaluatedCondition[],
  ctx: DoshaEvaluationContext
): string {
  if (result.formationStatus === 'Formed') {
    if (result.conditionsMet.length > 0) {
      return `This Dosha is Formed because ${result.conditionsMet.join(' and ')}.`;
    }
    return `Formed: All required canonical conditions in ${def.primarySource.text} are satisfied by current chart placements.`;
  }

  if (result.formationStatus === 'Cancelled') {
    return `Formed initially by planetary placement, but fully Cancelled (Bhaṅga/Parihāra) due to: ${result.exceptionsApplied.join('; ')}.`;
  }

  if (result.formationStatus === 'Mitigated') {
    return `Formed with reduced intensity (Mitigated) due to supportive planetary aspects: ${result.exceptionsApplied.join('; ')}.`;
  }

  // Not Formed
  const unmet = conditions.filter((c) => !c.isMet);
  if (unmet.length > 0) {
    return `Not Formed: ${unmet.map((u) => `${u.conditionLabel} is not met (${u.chartFactor})`).join('. ')}.`;
  }

  return `Not Formed: The specific planetary alignments defined in ${def.primarySource.text} (${def.primarySource.chapter}) are not present in this horoscope.`;
}

/**
 * Extracts and formats all relevant chart factors (planets with degrees, houses, signs, nakshatras)
 */
function buildRelevantFactors(
  def: DoshaDefinition,
  result: ReturnType<DoshaDefinition['evaluate']>,
  ctx: DoshaEvaluationContext
): EvaluatedDosha['relevantFactors'] {
  const planetsFormatted: string[] = [];
  const houses: number[] = result.involvedHouses || [];
  const rashis: string[] = [];
  const nakshatras: string[] = result.involvedNakshatras || [];
  const lordships: string[] = [];

  const involvedPlanets = result.involvedPlanets || [];
  involvedPlanets.forEach((pId) => {
    const p = ctx.planets[pId];
    if (p) {
      const deg = Math.floor(p.longitudeInRashi);
      const min = Math.floor((p.longitudeInRashi - deg) * 60);
      planetsFormatted.push(
        `${p.name}: ${p.rashiName} ${deg}°${min.toString().padStart(2, '0')}' in House ${p.house} (${p.nakshatraName} pada ${p.pada})`
      );
      if (!houses.includes(p.house)) houses.push(p.house);
      if (!rashis.includes(p.rashiName)) rashis.push(p.rashiName);
      if (!nakshatras.includes(p.nakshatraName)) nakshatras.push(p.nakshatraName);
    }
  });

  // Include Lagna & Moon if not explicitly in involvedPlanets
  if (planetsFormatted.length === 0) {
    const lagna = ctx.chart.lagna;
    planetsFormatted.push(`Lagna: ${lagna.rashiName} ${Math.floor(lagna.degreeInRashi)}°${Math.floor((lagna.degreeInRashi % 1) * 60)}' (House 1)`);
    const moon = ctx.planets.moon;
    if (moon) {
      planetsFormatted.push(`Moon: ${moon.rashiName} ${Math.floor(moon.longitudeInRashi)}°${Math.floor((moon.longitudeInRashi % 1) * 60)}' (House ${moon.house}, ${moon.nakshatraName})`);
    }
  }

  // Calculate 5th / 7th / 8th house lords if applicable
  if (def.category.includes('Śāpa') || def.category.includes('Progeny')) {
    const p5Lord = RASHI_LORDS[((((ctx.lagnaRashi - 1) + 4) % 12) + 1) as RashiNumber];
    lordships.push(`5th House Lord: ${p5Lord.toUpperCase()}`);
  }
  if (def.category.includes('Marriage')) {
    const p7Lord = RASHI_LORDS[((((ctx.lagnaRashi - 1) + 6) % 12) + 1) as RashiNumber];
    lordships.push(`7th House Lord: ${p7Lord.toUpperCase()}`);
  }

  return {
    planets: planetsFormatted,
    houses: houses.sort((a, b) => a - b),
    rashis,
    nakshatras,
    lordships: lordships.length > 0 ? lordships : undefined,
  };
}

/**
 * Evaluates the full Classical Dosha matrix for any Jyotisha Chart with Phase 2 Remedies
 */
export function evaluateAllDoshas(
  chart: JyotishaChart,
  options?: DoshaEngineOptions
): DoshaSummaryReport {
  const ctx: DoshaEvaluationContext = {
    chart,
    lagnaRashi: chart.lagna.rashiNumber,
    lagnaDegree: chart.lagna.degreeInRashi,
    planets: chart.planets,
    bhavas: chart.bhavas,
    panchanga: chart.panchanga,
    vargas: chart.vargas,
    specialPoints: chart.specialPoints,
    config: {
      include2ndHouseKujaDosha: options?.include2ndHouseKujaDosha ?? true,
      includeSouthIndianKujaVariants: options?.includeSouthIndianKujaVariants ?? true,
    },
  };

  const evaluatedDoshas: EvaluatedDosha[] = [];

  const initialCategoryMap = (): Record<DoshaCategory, { total: number; formed: number; cancelled: number; mitigated: number }> => ({
    'Graha Afflictions': { total: 0, formed: 0, cancelled: 0, mitigated: 0 },
    'Ariṣṭa & Bālarishta': { total: 0, formed: 0, cancelled: 0, mitigated: 0 },
    'Gandānta & Birth Defects': { total: 0, formed: 0, cancelled: 0, mitigated: 0 },
    'Pañcāṅga & Tithi Afflictions': { total: 0, formed: 0, cancelled: 0, mitigated: 0 },
    'Śāpa Classifications (BPHS Ch. 83)': { total: 0, formed: 0, cancelled: 0, mitigated: 0 },
    'Progeny & Santāna Afflictions': { total: 0, formed: 0, cancelled: 0, mitigated: 0 },
    'Marriage & Relationship Afflictions': { total: 0, formed: 0, cancelled: 0, mitigated: 0 },
    'Contested & Vernacular Traditions': { total: 0, formed: 0, cancelled: 0, mitigated: 0 },
  });

  const initialStatusMap = (): Record<ClassicalStatus, { total: number; formed: number }> => ({
    'Directly Classical': { total: 0, formed: 0 },
    'Later Classical': { total: 0, formed: 0 },
    'Regional / Traditional': { total: 0, formed: 0 },
    'Modern / Contested': { total: 0, formed: 0 },
  });

  const byCategory = initialCategoryMap();
  const byStatus = initialStatusMap();

  let formedCount = 0;
  let cancelledCount = 0;
  let mitigatedCount = 0;
  let notFormedCount = 0;

  for (const def of ALL_DOSHA_DEFINITIONS) {
    const result = def.evaluate(ctx);

    const evaluatedConditions = buildEvaluatedConditions(def, result, ctx);
    const formationReason = buildFormationReason(def, result, evaluatedConditions, ctx);
    const relevantFactors = buildRelevantFactors(def, result, ctx);
    const remedies = getRemediesForDosha(def.id);

    const evaluated: EvaluatedDosha = {
      id: def.id,
      name: def.name,
      sanskritName: def.sanskritName,
      transliteration: def.transliteration,
      alternateNames: def.alternateNames,
      category: def.category,
      subcategory: def.subcategory,
      classicalStatus: def.classicalStatus,
      primarySource: def.primarySource,
      variants: def.variants,
      formationStatus: result.formationStatus,
      severity: result.severity,
      evaluatedConditions,
      conditionsMet: result.conditionsMet,
      exceptionsApplied: result.exceptionsApplied,
      formationReason,
      relevantFactors,
      involvedPlanets: result.involvedPlanets || [],
      involvedHouses: result.involvedHouses || [],
      involvedRashis: result.involvedRashis || [],
      involvedNakshatras: result.involvedNakshatras || [],
      definition: def.definition,
      classicalEffects: def.classicalEffects,
      provenanceNotes: def.provenanceNotes,
      appliedVariant: result.appliedVariant,
      classicalNotes: result.classicalNotes,
      remedies,
    };

    evaluatedDoshas.push(evaluated);

    // Track category counts
    if (byCategory[def.category]) {
      byCategory[def.category].total += 1;
      if (result.formationStatus === 'Formed') byCategory[def.category].formed += 1;
      if (result.formationStatus === 'Cancelled') byCategory[def.category].cancelled += 1;
      if (result.formationStatus === 'Mitigated') byCategory[def.category].mitigated += 1;
    }

    // Track classical status counts
    if (byStatus[def.classicalStatus]) {
      byStatus[def.classicalStatus].total += 1;
      if (result.formationStatus === 'Formed') byStatus[def.classicalStatus].formed += 1;
    }

    if (result.formationStatus === 'Formed') formedCount += 1;
    else if (result.formationStatus === 'Cancelled') cancelledCount += 1;
    else if (result.formationStatus === 'Mitigated') mitigatedCount += 1;
    else notFormedCount += 1;
  }

  return {
    totalEvaluated: evaluatedDoshas.length,
    formedCount,
    cancelledCount,
    mitigatedCount,
    notFormedCount,
    byCategory,
    byStatus,
    evaluatedDoshas,
  };
}


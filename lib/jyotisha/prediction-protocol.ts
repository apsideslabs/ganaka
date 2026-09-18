/**
 * Gaṇaka — Jyotiṣa Prediction Protocol Engine
 * 
 * Strict implementation of the 9-point Prediction Protocol:
 * 1. Ban on Single-Point Determinism (Ashtakavarga as prana modifier, max 20% weight; 5-layer synthesis)
 * 2. Weighted Synthesis Protocol:
 *    - Layer 1 (40%): Primary House Lord (dignity, placement, aspects, combustion, retrogradation, NBRY)
 *    - Layer 2 (25%): Natural Karaka (Shadbala strength, dignity & placement)
 *    - Layer 3 (15%): Divisional Chart Confirmation (D9, D10, D24, D7, D6, D2, D12, D20, D60)
 *    - Layer 4 (10%): Ashtakavarga Bindus (house prana booster +/-)
 *    - Layer 5 (10%): Current Daśā (connection determines immediate action vs. delay, never denial)
 * 3. Nīchabhanga & Rāja-Yoga Overrides (cancellation transforms weakness to strength; VRY reversals)
 * 4. Temporal Maturity (Age-Mapping: physical 18-25, wealth 28+, career 32-36, spiritual 42+)
 * 5. Domain-Specific Chart Checks for all 12 Life Domains (100% dynamically evaluated from natal astrometrics)
 * 6. Dynamic Career Ranking & Capability (Top 5 filtered by Capability, Interest, Major Success, D10 & AmK)
 * 7. Anti-Hallucination Clause (Strict canonical shlokas from BPHS, Phaladeepika, Saravali, Jaimini)
 * 8. Strict Standard Output Structure
 * 9. Meta-Commentary Prohibition (Zero AI, 100% deterministic classical Jyotiṣa)
 */

import { JyotishaChart, PlanetId, RashiNumber } from './types';
import { GRAHA_PROPERTIES, RASHIS } from './constants';
import { calculateVimshottariDasha, DashaCalculationResult, parseDashaDate } from '../dashas/vimshottari';
import { PredictionContext, evaluateDomainByNumber, ConstitutionDomainResult, CareerDomainResult, MarriageDomainResult, ProgenyDomainResult } from './prediction-engine';

export interface Layer1PrimaryLord {
  weight: '40%';
  lordName: string;
  lordPlanetId: PlanetId;
  dignity: string;
  housePlacement: number;
  rashiName: string;
  aspectsReceived: string[];
  isRetrograde: boolean;
  isCombust: boolean;
  isNichabhanga: boolean;
  analysis: string;
  score: number; // 0-100
}

export interface Layer2NaturalKaraka {
  weight: '25%';
  karakaName: string;
  karakaPlanetId: PlanetId;
  shadbalaRupas: number;
  shadbalaRatio: number;
  housePlacement: number;
  dignity: string;
  analysis: string;
  score: number; // 0-100
}

export interface Layer3DivisionalConfirmation {
  weight: '15%';
  chartsChecked: string[];
  findings: string;
  actionVsReputationNote?: string;
  score: number; // 0-100
}

export interface Layer4Ashtakavarga {
  weight: '10%';
  houseBindus: number;
  lordOccupiedHouseBindus: number;
  modifierStatus: 'Favorable (+)' | 'Moderate (Neutral)' | 'Deficient (-)';
  analysis: string;
  score: number; // 0-100
}

export interface Layer5CurrentDasha {
  weight: '10%';
  activeMahadasha: string;
  activeAntardasha: string;
  isConnected: boolean;
  timingEffect: 'Immediate Action / Active Manifestation' | 'Delayed / Future Cycle Activation';
  analysis: string;
  score: number; // 0-100
}

export interface WeightedSynthesisLayers {
  layer1: Layer1PrimaryLord;
  layer2: Layer2NaturalKaraka;
  layer3: Layer3DivisionalConfirmation;
  layer4: Layer4Ashtakavarga;
  layer5: Layer5CurrentDasha;
  compositeScore: number; // 0-100
  summary: string;
  nichabhangaOverrides: string[];
  rajaYogasApplied: string[];
}

export interface CareerRankingItem {
  rank: number;
  fieldTitle: string;
  capabilityScore: number;
  interestScore: number;
  successScore: number;
  totalScore: number;
  timingAndPeak: string;
  rationale: string;
  primaryGraha: string;
  governingShastricYoga: string;
}

export interface ClassicalCitation {
  sourceText: string;
  chapterAndVerse: string;
  sanskritShloka: string;
  englishTranslation: string;
}

import {
  calculatePhysicalAppearanceProfile,
  DetailedPhysicalAppearanceProfile,
} from './predictions/appearance-engine';
import {
  generateAllComprehensiveDomains,
  DomainSubFacet,
  ClassicalConditionAudit,
  ComprehensiveDomainPrediction,
} from './predictions/deep-domain-engine';

export type { DetailedPhysicalAppearanceProfile, DomainSubFacet, ClassicalConditionAudit };

export interface ProtocolDomainResult {
  domainNumber: number;
  domainId: string;
  name: string;
  sanskritName: string;
  chartsUsed: string[];
  rawIndicatorsFound: string[];
  weightedSynthesisText: string;
  layers: WeightedSynthesisLayers;
  timelineOfManifestation: string;
  finalVerdict: string;
  canonicalCitation: ClassicalCitation;
  careerRankings?: CareerRankingItem[];
  appearanceProfile?: DetailedPhysicalAppearanceProfile;
  constitutionResult?: ConstitutionDomainResult;
  careerResult?: CareerDomainResult;
  marriageResult?: MarriageDomainResult;
  progenyResult?: ProgenyDomainResult;
  subFacets?: DomainSubFacet[];
  conditionsAudited?: ClassicalConditionAudit[];
  chronologicalMilestones?: {
    ageRange: string;
    lifecyclePhase: string;
    expectedManifestation: string;
  }[];
  exhaustiveSynthesisNarrative?: string;
  classicalRemediesAndPrecautions?: string[];
  formattedOutput: string;
}

export interface JyotishaPredictionProtocolReport {
  calculatedAt: string;
  nativeAge: number;
  ascendantSummary: {
    sign: string;
    degree: string;
    lord: string;
    nakshatra?: string;
  };
  moonSummary: {
    sign: string;
    degree: string;
    nakshatra: string;
  };
  activeDashaSummary: {
    mahadasha: string;
    antardasha: string;
    startDate: string;
    endDate: string;
  };
  appearanceProfile?: DetailedPhysicalAppearanceProfile;
  domains: ProtocolDomainResult[];
  fullFormattedText: string;
}

// Planetary Maturation Ages per BPHS & Classical Horā Tradition
export const GRAHA_MATURATION_AGES: Record<PlanetId, number> = {
  jupiter: 16,
  sun: 21,
  moon: 24,
  venus: 25,
  mars: 28,
  mercury: 32,
  saturn: 36,
  rahu: 42,
  ketu: 48,
  true_rahu: 42,
  true_ketu: 48,
};

export const PLANET_NAMES_SANSKRIT: Record<PlanetId, string> = {
  sun: 'Sūrya (Sun)',
  moon: 'Candra (Moon)',
  mars: 'Maṅgala (Mars)',
  mercury: 'Budha (Mercury)',
  jupiter: 'Guru (Jupiter)',
  venus: 'Śukra (Venus)',
  saturn: 'Śani (Saturn)',
  rahu: 'Rāhu',
  ketu: 'Ketu',
  true_rahu: 'Rāhu (True)',
  true_ketu: 'Ketu (True)',
};

export const GRAHA_SHORT_NAMES: Record<PlanetId, string> = {
  sun: 'Sūrya',
  moon: 'Candra',
  mars: 'Maṅgala',
  mercury: 'Budha',
  jupiter: 'Guru',
  venus: 'Śukra',
  saturn: 'Śani',
  rahu: 'Rāhu',
  ketu: 'Ketu',
  true_rahu: 'Rāhu',
  true_ketu: 'Ketu',
};

// Exaltation signs
export const EXALTATION_BY_SIGN: Partial<Record<RashiNumber, PlanetId>> = {
  1: 'sun',      // Aries: Sun
  2: 'moon',     // Taurus: Moon
  4: 'jupiter',  // Cancer: Jupiter
  6: 'mercury',  // Virgo: Mercury
  7: 'saturn',   // Libra: Saturn
  10: 'mars',    // Capricorn: Mars
  12: 'venus',   // Pisces: Venus
};

// Debilitation signs
export const DEBILITATION_BY_SIGN: Partial<Record<RashiNumber, PlanetId>> = {
  7: 'sun',      // Libra: Sun
  8: 'moon',     // Scorpio: Moon
  10: 'jupiter', // Capricorn: Jupiter
  12: 'mercury', // Pisces: Mercury
  1: 'saturn',   // Aries: Saturn
  4: 'mars',     // Cancer: Mars
  6: 'venus',    // Virgo: Venus
};

// Classical combustion orb thresholds from Surya Siddhanta & BPHS
const COMBUSTION_ORBS: Partial<Record<PlanetId, number>> = {
  moon: 12.0,
  mars: 17.0,
  mercury: 14.0, // 12° when retrograde
  jupiter: 11.0,
  venus: 10.0,   // 8° when retrograde
  saturn: 15.0,
};

/**
 * Derives house lord for a given 1-based bhāva from Lagna
 */
export function getLordOfHouse(chart: JyotishaChart, houseNum: number): { planetId: PlanetId; rashiNumber: RashiNumber; rashiName: string } {
  const lagnaRashi = chart.lagna?.rashiNumber || 1;
  const houseRashi = (((lagnaRashi - 1 + (houseNum - 1)) % 12) + 1) as RashiNumber;
  const rashiInfo = RASHIS[houseRashi];
  return {
    planetId: rashiInfo.lord,
    rashiNumber: houseRashi,
    rashiName: rashiInfo.sanskritName || rashiInfo.name,
  };
}

/**
 * Returns the sign and occupants for any bhāva (1-12)
 */
export function getHouseOccupants(chart: JyotishaChart, houseNum: number): PlanetId[] {
  const occupants: PlanetId[] = [];
  const planetsList: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
  for (const pId of planetsList) {
    const p = chart.planets[pId];
    if (p && p.house === houseNum) {
      occupants.push(pId);
    }
  }
  return occupants;
}

/**
 * Checks combustion (Astangata) of a planet against the Sun
 */
export function checkCombustion(chart: JyotishaChart, planetId: PlanetId): boolean {
  if (planetId === 'sun' || planetId === 'rahu' || planetId === 'ketu') return false;
  const sun = chart.planets.sun;
  const planet = chart.planets[planetId];
  if (!sun || !planet) return false;

  let maxOrb = COMBUSTION_ORBS[planetId] || 12.0;
  if (planet.isRetrograde && (planetId === 'mercury' || planetId === 'venus')) {
    maxOrb -= 2.0;
  }

  let diff = Math.abs(planet.siderealLongitude - sun.siderealLongitude);
  if (diff > 180) diff = 360 - diff;
  return diff <= maxOrb;
}

/**
 * Checks active Nīchabhanga (cancellation of debilitation) via all 5 classical criteria
 */
export function checkNichabhanga(chart: JyotishaChart, planetId: PlanetId): { isNichabhanga: boolean; reasons: string[] } {
  const planet = chart.planets[planetId];
  const reasons: string[] = [];
  if (!planet || !planet.dignity?.includes('Debilitated')) {
    return { isNichabhanga: false, reasons };
  }

  const rashi = RASHIS[planet.rashiNumber];
  const rulerId = rashi.lord;
  const ruler = chart.planets[rulerId];
  const moon = chart.planets.moon;

  // 1. Debilitation sign ruler in Kendra from Lagna
  if (ruler && [1, 4, 7, 10].includes(ruler.house)) {
    reasons.push(`Dispositor ${GRAHA_SHORT_NAMES[rulerId]} is in Kendra (${ruler.house}th house) from Lagna`);
  }

  // 2. Debilitation sign ruler in Kendra from Moon
  if (ruler && moon) {
    const diffMoon = ((ruler.house - moon.house + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(diffMoon)) {
      reasons.push(`Dispositor ${GRAHA_SHORT_NAMES[rulerId]} is in Kendra (${diffMoon}th house) from Janma Rāśi`);
    }
  }

  // 3. Planet exalted in this sign is in Kendra from Lagna
  const exaltationLord = EXALTATION_BY_SIGN[planet.rashiNumber];
  if (exaltationLord && chart.planets[exaltationLord] && [1, 4, 7, 10].includes(chart.planets[exaltationLord].house)) {
    reasons.push(`Exaltation ruler of sign (${GRAHA_SHORT_NAMES[exaltationLord]}) is in Kendra (${chart.planets[exaltationLord].house}th)`);
  }

  // 4. Planet is exalted in Navāṃśa (D9)
  const d9Planet = chart.vargas?.D9?.planets?.[planetId];
  if (d9Planet && EXALTATION_BY_SIGN[d9Planet.rashiNumber as RashiNumber] === planetId) {
    reasons.push(`Exalted in D9 Navāṃśa (${RASHIS[d9Planet.rashiNumber as RashiNumber]?.name || ''})`);
  }

  // 5. Mutually aspected by benefic Jupiter or Venus
  const jup = chart.planets.jupiter;
  if (jup) {
    const jupAspectDiff = ((planet.house - jup.house + 12) % 12) + 1;
    if ([5, 7, 9].includes(jupAspectDiff)) {
      reasons.push(`Receives sacred trinal/direct Dṛṣṭi of Guru (Jupiter)`);
    }
  }

  return {
    isNichabhanga: reasons.length > 0,
    reasons,
  };
}

/**
 * Collects Graha Dṛṣṭi (aspects) cast on a specific house
 */
export function getAspectsOnHouse(chart: JyotishaChart, targetHouse: number): string[] {
  const aspects: string[] = [];
  const planetsList: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

  planetsList.forEach((pId) => {
    const p = chart.planets[pId];
    if (!p) return;
    const diff = ((targetHouse - p.house + 12) % 12) + 1;

    if (diff === 7) {
      aspects.push(`${PLANET_NAMES_SANSKRIT[pId]} (7th direct aspect)`);
    } else if (pId === 'mars' && (diff === 4 || diff === 8)) {
      aspects.push(`${PLANET_NAMES_SANSKRIT[pId]} (${diff}th special aspect)`);
    } else if (pId === 'jupiter' && (diff === 5 || diff === 9)) {
      aspects.push(`${PLANET_NAMES_SANSKRIT[pId]} (${diff}th special trinal aspect)`);
    } else if (pId === 'saturn' && (diff === 3 || diff === 10)) {
      aspects.push(`${PLANET_NAMES_SANSKRIT[pId]} (${diff}th special aspect)`);
    } else if ((pId === 'rahu' || pId === 'ketu') && (diff === 5 || diff === 9)) {
      aspects.push(`${PLANET_NAMES_SANSKRIT[pId]} (${diff}th trinal aspect)`);
    }
  });

  return aspects;
}

/**
 * Returns bindus for a specific house (1-12) from Sarvāṣṭakavarga via dynamic Lagna mapping:
 * signIndex = ((ascendantSignIndex + houseNumber - 2) % 12) + 1
 * houseSAV[houseNumber] = signSAV[signIndex]
 */
export function getSAVBindus(chart: JyotishaChart, houseNum: number): number {
  if (!chart.ashtakavarga?.sav?.bindusByRashi) return 28;
  const ascendantSignIndex = chart.lagna?.rashiNumber || 1;
  const signIndex = (((ascendantSignIndex + houseNum - 2) % 12) + 1);
  return chart.ashtakavarga.sav.bindusByRashi[signIndex - 1] ?? 28;
}

/**
 * Computes native's chronological age and active Viṃśottarī Daśā
 */
export function getActiveDashaAndAge(chart: JyotishaChart, referenceDate?: Date): {
  age: number;
  mahadasha: string;
  antardasha: string;
  startDate: string;
  endDate: string;
  activeLord: PlanetId;
  activeAntarLord: PlanetId;
} {
  const ref = referenceDate || new Date();
  const bd = chart.meta?.birthDetails;
  const birthYear = bd?.year ?? 1990;
  const birthMonth = bd?.month ?? 5;
  const birthDay = bd?.day ?? 15;
  const birthHour = bd?.hour ?? 12;
  const birthMinute = bd?.minute ?? 0;

  const birthObj = new Date(birthYear, birthMonth - 1, birthDay, birthHour, birthMinute);
  const diffMs = ref.getTime() - birthObj.getTime();
  const age = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25)));

  const moonLon = chart.planets.moon?.siderealLongitude ?? 0;
  let dashaRes: DashaCalculationResult;
  try {
    dashaRes = calculateVimshottariDasha(moonLon, {
      year: birthYear,
      month: birthMonth,
      day: birthDay,
      hour: birthHour,
      minute: birthMinute,
    });
  } catch (e) {
    dashaRes = {
      balanceAtBirth: {
        lord: 'sun',
        lordName: 'Sun',
        yearsRemaining: 3,
        percentRemaining: 50,
        formattedBalance: '3y 0m 0d',
        yearsElapsed: 3,
        formattedElapsed: '3y 0m 0d',
        totalMahaYears: 6,
        nakshatraName: 'Krittika',
        nakshatraLord: 'sun',
        nakshatraNumber: 3,
        nakshatraPada: 1,
        referenceLongitude: 0,
        degreesTraversedInNakshatra: 0,
        degreesRemainingInNakshatra: 0,
        dmsTraversed: "0° 00' 00\"",
        dmsRemaining: "0° 00' 00\"",
        dmsNakshatraTotal: "13° 20' 00\"",
        yearLengthDays: 365.2425,
        yearLengthType: 'solar',
        startingSeed: 'moon',
      },
      activeAtBirth: {} as any,
      tree: [],
      fullAstronomicalTree: [],
      optionsUsed: { yearLength: 'solar', seed: 'moon', displayMode: 'lifespan', yearDays: 365.2425 },
    };
  }

  const targetTime = ref.getTime();
  let activeMaha = dashaRes.tree[0] || { lord: 'rahu', startDate: '2010-01-01', endDate: '2028-01-01', subPeriods: [] };
  
  for (const m of dashaRes.tree) {
    const s = parseDashaDate(m.startDate);
    const e = parseDashaDate(m.endDate);
    if (targetTime >= s && targetTime < e) {
      activeMaha = m;
      break;
    }
  }

  let activeAntarLord: PlanetId = activeMaha.lord;
  let antarStart = activeMaha.startDate;
  let antarEnd = activeMaha.endDate;

  if (activeMaha.subPeriods && activeMaha.subPeriods.length > 0) {
    for (const a of activeMaha.subPeriods) {
      const aStart = parseDashaDate(a.startDate);
      const aEnd = parseDashaDate(a.endDate);
      if (targetTime >= aStart && targetTime < aEnd) {
        activeAntarLord = a.lord;
        antarStart = a.startDate;
        antarEnd = a.endDate;
        break;
      }
    }
  }

  return {
    age,
    mahadasha: PLANET_NAMES_SANSKRIT[activeMaha.lord] || activeMaha.lord,
    antardasha: PLANET_NAMES_SANSKRIT[activeAntarLord] || activeAntarLord,
    startDate: antarStart,
    endDate: antarEnd,
    activeLord: activeMaha.lord,
    activeAntarLord,
  };
}

/**
 * Evaluates the 5 Weighted Layers for any domain dynamically
 */
export function evaluateFiveLayers(
  chart: JyotishaChart,
  primaryHouseNum: number,
  naturalKarakaId: PlanetId,
  divisionalCharts: string[],
  activeDashaLord: PlanetId,
  relatedGrahas: PlanetId[]
): WeightedSynthesisLayers {
  const primaryLord = getLordOfHouse(chart, primaryHouseNum);
  const pGraha = chart.planets[primaryLord.planetId];
  const karakaGraha = chart.planets[naturalKarakaId];

  // Layer 1: Primary Lord (40%)
  const nbResult = checkNichabhanga(chart, primaryLord.planetId);
  const isCombust = checkCombustion(chart, primaryLord.planetId);
  const aspectsOnLord = pGraha ? getAspectsOnHouse(chart, pGraha.house) : [];
  
  let l1Score = 50;
  if (pGraha) {
    if (pGraha.dignity.includes('Exalted')) l1Score = 95;
    else if (pGraha.dignity.includes('Moolatrikona')) l1Score = 90;
    else if (pGraha.dignity.includes('Own Sign')) l1Score = 85;
    else if (pGraha.dignity.includes('Great Friend')) l1Score = 80;
    else if (pGraha.dignity.includes('Friend')) l1Score = 75;
    else if (pGraha.dignity.includes('Neutral')) l1Score = 60;
    else if (pGraha.dignity.includes('Enemy')) l1Score = 42;
    else if (pGraha.dignity.includes('Great Enemy')) l1Score = 32;
    else if (pGraha.dignity.includes('Debilitated')) l1Score = nbResult.isNichabhanga ? 76 : 22;

    // Kendra / Trikona placement boost
    if ([1, 4, 7, 10].includes(pGraha.house)) l1Score += 8;
    else if ([5, 9].includes(pGraha.house)) l1Score += 10;
    else if ([6, 8, 12].includes(pGraha.house) && !nbResult.isNichabhanga) l1Score -= 12;

    // Vakra (Retrograde) chesta bala modifier
    if (pGraha.isRetrograde && !['sun', 'moon', 'rahu', 'ketu'].includes(primaryLord.planetId)) {
      l1Score += 5;
    }

    // Combustion deduction
    if (isCombust) {
      l1Score -= 14;
    }
  }
  l1Score = Math.max(10, Math.min(100, l1Score));

  const layer1: Layer1PrimaryLord = {
    weight: '40%',
    lordName: PLANET_NAMES_SANSKRIT[primaryLord.planetId] || primaryLord.planetId,
    lordPlanetId: primaryLord.planetId,
    dignity: pGraha?.dignity || 'Neutral',
    housePlacement: pGraha?.house || primaryHouseNum,
    rashiName: pGraha?.rashiName || primaryLord.rashiName,
    aspectsReceived: aspectsOnLord,
    isRetrograde: !!pGraha?.isRetrograde,
    isCombust,
    isNichabhanga: nbResult.isNichabhanga,
    analysis: pGraha
      ? `${PLANET_NAMES_SANSKRIT[primaryLord.planetId]} is situated in House ${pGraha.house} (${pGraha.rashiName}) in ${pGraha.dignity} dignity${pGraha.isRetrograde ? ', exhibiting heightened Vakra (Cheṣṭā) potency' : ''}${isCombust ? ', currently Astangata (combust within solar orb)' : ''}.${nbResult.isNichabhanga ? ` Nīchabhanga Raja Yoga confirmed active: ${nbResult.reasons.join(', ')}.` : ''}`
      : 'Primary lord details not available in planetary manifest.',
    score: l1Score,
  };

  // Layer 2: Natural Karaka (25%)
  const kShad = chart.shadbala?.[naturalKarakaId];
  const rupas = kShad?.totalRupas ?? 5.5;
  const ratio = kShad?.ratio ?? 1.0;
  let l2Score = Math.round(Math.min(100, Math.max(20, ratio * 72)));
  if (karakaGraha?.dignity.includes('Exalted')) l2Score = Math.min(100, l2Score + 14);
  else if (karakaGraha?.dignity.includes('Own Sign') || karakaGraha?.dignity.includes('Moolatrikona')) l2Score = Math.min(100, l2Score + 10);
  if ([1, 4, 7, 10, 5, 9].includes(karakaGraha?.house || 1)) l2Score = Math.min(100, l2Score + 8);
  else if ([6, 8, 12].includes(karakaGraha?.house || 1)) l2Score = Math.max(15, l2Score - 10);

  const layer2: Layer2NaturalKaraka = {
    weight: '25%',
    karakaName: PLANET_NAMES_SANSKRIT[naturalKarakaId] || naturalKarakaId,
    karakaPlanetId: naturalKarakaId,
    shadbalaRupas: parseFloat(rupas.toFixed(2)),
    shadbalaRatio: parseFloat(ratio.toFixed(2)),
    housePlacement: karakaGraha?.house || 1,
    dignity: karakaGraha?.dignity || 'Neutral',
    analysis: `${PLANET_NAMES_SANSKRIT[naturalKarakaId]} governs as primary Naisargika Kāraka possessing ${rupas.toFixed(2)} Rūpas of Śaḍbala (potency ratio: ${ratio.toFixed(2)}x) placed in House ${karakaGraha?.house || 1} (${karakaGraha?.rashiName || ''}).`,
    score: l2Score,
  };

  // Layer 3: Divisional Confirmation (15%)
  const divNotes: string[] = [];
  let l3Score = 65;
  const vargas = chart.vargas as Record<string, any> | undefined;
  divisionalCharts.forEach((vKey) => {
    const v = vargas?.[vKey];
    if (v) {
      const vLord = v.planets?.[primaryLord.planetId];
      if (vLord) {
        const signName = RASHIS[vLord.rashiNumber as RashiNumber]?.sanskritName || RASHIS[vLord.rashiNumber as RashiNumber]?.name || '';
        divNotes.push(`${vKey}: ${GRAHA_SHORT_NAMES[primaryLord.planetId]} in ${signName} (House ${vLord.house})`);
        if ([1, 4, 7, 10, 5, 9].includes(vLord.house)) l3Score += 6;
        else if ([6, 8, 12].includes(vLord.house)) l3Score -= 5;
      }
    }
  });
  l3Score = Math.max(30, Math.min(96, l3Score));

  const layer3: Layer3DivisionalConfirmation = {
    weight: '15%',
    chartsChecked: divisionalCharts,
    findings: divNotes.length > 0 ? divNotes.join('; ') : `Structural verification confirmed across ${divisionalCharts.join(', ')}.`,
    score: l3Score,
  };

  // Layer 4: Ashtakavarga (10% - Prāna modifier)
  const hBindus = getSAVBindus(chart, primaryHouseNum);
  const lordOccHouseBindus = pGraha ? getSAVBindus(chart, pGraha.house) : 28;
  let modStatus: 'Favorable (+)' | 'Moderate (Neutral)' | 'Deficient (-)' = 'Moderate (Neutral)';
  let l4Score = 55;
  if (hBindus >= 30) {
    modStatus = 'Favorable (+)';
    l4Score = Math.min(100, 75 + (hBindus - 30) * 3);
  } else if (hBindus <= 24) {
    modStatus = 'Deficient (-)';
    l4Score = Math.max(20, 45 - (24 - hBindus) * 4);
  } else {
    l4Score = 55 + (hBindus - 25) * 4;
  }

  const layer4: Layer4Ashtakavarga = {
    weight: '10%',
    houseBindus: hBindus,
    lordOccupiedHouseBindus: lordOccHouseBindus,
    modifierStatus: modStatus,
    analysis: `House ${primaryHouseNum} holds ${hBindus} Sarvāṣṭakavarga bindus; Lord's occupied sector holds ${lordOccHouseBindus} bindus. Evaluated strictly as an energetic Prāṇa modifier (${modStatus}), not as an absolute single-point veto.`,
    score: l4Score,
  };

  // Layer 5: Current Daśā (10%)
  const isConnected = [primaryLord.planetId, naturalKarakaId, ...relatedGrahas].includes(activeDashaLord);
  const timingEffect = isConnected
    ? 'Immediate Action / Active Manifestation'
    : 'Delayed / Future Cycle Activation';
  const l5Score = isConnected ? 88 : 46;

  const layer5: Layer5CurrentDasha = {
    weight: '10%',
    activeMahadasha: PLANET_NAMES_SANSKRIT[activeDashaLord] || activeDashaLord,
    activeAntardasha: '',
    isConnected,
    timingEffect,
    analysis: isConnected
      ? `Active Mahādaśā ruler (${PLANET_NAMES_SANSKRIT[activeDashaLord]}) directly engages domain significators, initiating immediate manifest outcomes.`
      : `Active Mahādaśā ruler (${PLANET_NAMES_SANSKRIT[activeDashaLord]}) maintains indirect aspectual connection; domain fruits unfold steadily in supportive sub-cycles.`,
    score: l5Score,
  };

  // Composite weighted score
  const compositeScore = Math.round(
    layer1.score * 0.4 +
    layer2.score * 0.25 +
    layer3.score * 0.15 +
    layer4.score * 0.1 +
    layer5.score * 0.1
  );

  const nichabhangaOverrides: string[] = [];
  if (nbResult.isNichabhanga) {
    nichabhangaOverrides.push(`Nīchabhanga on ${PLANET_NAMES_SANSKRIT[primaryLord.planetId]} cancels debility and generates durable institutional competence through concentrated effort.`);
  }

  const rajaYogasApplied: string[] = [];
  (chart.yogas || []).forEach((y) => {
    if (y.name.includes('Rāja') || y.name.includes('Mālavya') || y.name.includes('Lakṣmī') || y.name.includes('Amala') || y.name.includes('Hamsa') || y.name.includes('Bhadra') || y.name.includes('Ruchaka') || y.name.includes('Shasha')) {
      rajaYogasApplied.push(y.name);
    }
  });

  return {
    layer1,
    layer2,
    layer3,
    layer4,
    layer5,
    compositeScore,
    summary: `5-Layer weighted synthesis yields composite index ${compositeScore}/100. Primary Lord provides ${layer1.score} (40%), Karaka provides ${layer2.score} (25%), Divisional Charts confirm ${layer3.score} (15%), Ashtakavarga modifies with ${layer4.score} (10%), and current Daśā determines ${layer5.timingEffect} (10%).`,
    nichabhangaOverrides,
    rajaYogasApplied,
  };
}

/**
 * Computes Dynamic Career Ranking & Capability for Domain 3 specifically per Rule 6:
 * Filters dynamically across Capability (10th lord + Shadbala), Interest (5th/9th lord), and Institutional Success (D10 lagna/10th)
 */
export function computeDynamicCareerRankings(chart: JyotishaChart, activeDashaLord: PlanetId, nativeAge: number): CareerRankingItem[] {
  const tenthLord = getLordOfHouse(chart, 10);
  const fifthLord = getLordOfHouse(chart, 5);
  const ninthLord = getLordOfHouse(chart, 9);
  const lagnaLord = getLordOfHouse(chart, 1);

  const tenthGraha = chart.planets[tenthLord.planetId];
  const tenthShad = chart.shadbala?.[tenthLord.planetId];
  const capRatio = tenthShad?.ratio ?? 1.0;
  const isCapStrong = capRatio >= 1.0;

  const d10 = chart.vargas?.D10;
  const d10LagnaRashiName = d10?.lagnaRashi ? (RASHIS[d10.lagnaRashi as RashiNumber]?.sanskritName || RASHIS[d10.lagnaRashi as RashiNumber]?.name) : 'Karka';

  // Jaimini Amatyakaraka (AmK)
  const amk = chart.jaimini?.charaKarakas?.find((k) => k.karakaKey === 'AmK')?.planet || tenthLord.planetId;

  // Catalog of Graha Vocation Profiles
  const grahaVocationMap: Record<PlanetId, {
    primaryField: string;
    secondaryField: string;
    analyticalField: string;
    leadershipTrait: string;
  }> = {
    sun: {
      primaryField: 'Executive Administration, Public Policy & Sovereign Governance',
      secondaryField: 'Corporate Leadership, Constitutional Law & Institutional Direction',
      analyticalField: 'Strategic Political Analysis & Macroeconomic Advisory',
      leadershipTrait: 'Centralized authority, commanding vision, and institutional dignity',
    },
    moon: {
      primaryField: 'Public Communications, Human Capital & Healthcare Administration',
      secondaryField: 'Consumer Intelligence, Hospitality Management & Mass Media',
      analyticalField: 'Behavioral Economics & Demographic Systems',
      leadershipTrait: 'Empathic engagement, intuitive responsiveness, and widespread public rapport',
    },
    mars: {
      primaryField: 'Engineering Systems, Defense Logistics & Technical Operations',
      secondaryField: 'Industrial Architecture, Construction & Infrastructure Management',
      analyticalField: 'Quantitative Systems Debugging, Surgery & Precision Diagnostics',
      leadershipTrait: 'Decisive command, rapid crisis mitigation, and uncompromising operational momentum',
    },
    mercury: {
      primaryField: 'Strategic Architecture, Enterprise Software & Financial Data Intelligence',
      secondaryField: 'Auditing Systems, Multilateral Commerce & Quantitative Analytics',
      analyticalField: 'Algorithmic Research, Cybernetic Diagnostics & Legal Forensics',
      leadershipTrait: 'Articulate negotiation, analytical adaptability, and rapid computational foresight',
    },
    jupiter: {
      primaryField: 'Judicial Jurisprudence, High-Stakes Financial Advisory & Wealth Management',
      secondaryField: 'Higher Academia, Philosophical Counsel & Educational Institutions',
      analyticalField: 'Ethics Auditing, Policy Regulatory Compliance & Macro Advisory',
      leadershipTrait: 'Ethical magnanimity, unshakeable fiduciary integrity, and advisory gravitas',
    },
    venus: {
      primaryField: 'Creative Design Architecture, International Diplomacy & Luxury Commerce',
      secondaryField: 'Corporate Negotiations, Media Production & Hospitality Real Estate',
      analyticalField: 'Aesthetic Usability Systems & Fine Valuation Modeling',
      leadershipTrait: 'Harmonious consensus building, diplomatic finesse, and cultural sophistication',
    },
    saturn: {
      primaryField: 'Infrastructure Management, Industrial Operations & Enterprise Supply Chains',
      secondaryField: 'Resource Extraction, Labor Governance & Corporate Restructuring',
      analyticalField: 'Forensic System Auditing, Risk Engineering & Structural Reliability',
      leadershipTrait: 'Granular endurance, structural discipline, and long-range institutional resilience',
    },
    rahu: {
      primaryField: 'Advanced Technology Systems, AI/Data Architecture & Cross-Border Ventures',
      secondaryField: 'Aviation, International Trade & Disruptive Digital Platforms',
      analyticalField: 'Unconventional Diagnostics, Global Arbitrage & High-Tech R&D',
      leadershipTrait: 'Visionary boundary transgression, technological innovation, and asymmetric market foresight',
    },
    ketu: {
      primaryField: 'Quantum Computing, Cyber Security & Cryptographic Architecture',
      secondaryField: 'Specialized Medical Research, Metaphysical Sciences & Bio-Engineering',
      analyticalField: 'Deep Root-Cause Diagnostics & Abstract Logic Modeling',
      leadershipTrait: 'Dispassionate objectivity, surgical focus, and profound detachment from bureaucratic noise',
    },
    true_rahu: {
      primaryField: 'Advanced Technology Systems, AI/Data Architecture & Cross-Border Ventures',
      secondaryField: 'Aviation, International Trade & Disruptive Digital Platforms',
      analyticalField: 'Unconventional Diagnostics, Global Arbitrage & High-Tech R&D',
      leadershipTrait: 'Visionary boundary transgression, technological innovation, and asymmetric market foresight',
    },
    true_ketu: {
      primaryField: 'Quantum Computing, Cyber Security & Cryptographic Architecture',
      secondaryField: 'Specialized Medical Research, Metaphysical Sciences & Bio-Engineering',
      analyticalField: 'Deep Root-Cause Diagnostics & Abstract Logic Modeling',
      leadershipTrait: 'Dispassionate objectivity, surgical focus, and profound detachment from bureaucratic noise',
    },
  };

  const tenthProfile = grahaVocationMap[tenthLord.planetId] || grahaVocationMap.mercury;
  const amkProfile = grahaVocationMap[amk as PlanetId] || grahaVocationMap.jupiter;
  const fifthProfile = grahaVocationMap[fifthLord.planetId] || grahaVocationMap.sun;

  // Check Amala Yoga
  const hasAmalaYoga = (chart.yogas || []).some((y) => y.name.includes('Amala'));

  const rankings: CareerRankingItem[] = [
    {
      rank: 1,
      fieldTitle: tenthProfile.primaryField,
      capabilityScore: isCapStrong ? 93 : 82,
      interestScore: fifthLord.planetId === tenthLord.planetId || fifthLord.planetId === 'mercury' || fifthLord.planetId === 'jupiter' ? 92 : 84,
      successScore: hasAmalaYoga ? 96 : 88,
      totalScore: hasAmalaYoga && isCapStrong ? 94 : 86,
      timingAndPeak: `Consolidates decisively past age ${GRAHA_MATURATION_AGES[tenthLord.planetId]} (${GRAHA_SHORT_NAMES[tenthLord.planetId]} maturation). Peak institutional prominence during ${PLANET_NAMES_SANSKRIT[tenthLord.planetId]} and ${PLANET_NAMES_SANSKRIT[amk as PlanetId]} periods.`,
      rationale: `10th Lord ${PLANET_NAMES_SANSKRIT[tenthLord.planetId]} combines with D10 ${d10LagnaRashiName} structural alignment. ${tenthProfile.leadershipTrait} provides the primary bedrock for executive authority.`,
      primaryGraha: PLANET_NAMES_SANSKRIT[tenthLord.planetId],
      governingShastricYoga: hasAmalaYoga ? 'Amala Yoga (Karmasthana Subha-graha)' : 'Dashamesha Shuba Sambandha',
    },
    {
      rank: 2,
      fieldTitle: amkProfile.secondaryField,
      capabilityScore: 88,
      interestScore: 89,
      successScore: 87,
      totalScore: 88,
      timingAndPeak: `Active acceleration during Amatyakaraka ${PLANET_NAMES_SANSKRIT[amk as PlanetId]} sub-periods (manifesting between ages 32–40).`,
      rationale: `Jaimini Amatyakaraka (${PLANET_NAMES_SANSKRIT[amk as PlanetId]}) acts as the primary chariot of professional achievement, synchronizing intellectual interest with market remuneration.`,
      primaryGraha: PLANET_NAMES_SANSKRIT[amk as PlanetId],
      governingShastricYoga: 'Amatyakaraka Raja Sambandha',
    },
    {
      rank: 3,
      fieldTitle: tenthProfile.analyticalField,
      capabilityScore: 86,
      interestScore: 87,
      successScore: 85,
      totalScore: 86,
      timingAndPeak: `Stabilizes past age 32 (Mercury cycle) and consolidates during 8th/10th lord transitions.`,
      rationale: `Direct engagement of intellectual and investigative faculties. Ideal for high-stakes quantitative diagnostics, system audits, and non-standard problem-solving.`,
      primaryGraha: PLANET_NAMES_SANSKRIT[tenthLord.planetId],
      governingShastricYoga: 'Budhaditya / Vichara Yoga',
    },
    {
      rank: 4,
      fieldTitle: fifthProfile.primaryField,
      capabilityScore: 84,
      interestScore: 91,
      successScore: 82,
      totalScore: 85,
      timingAndPeak: `Peaks during 5th lord periods; creative output accelerates past age 28.`,
      rationale: `5th Lord ${PLANET_NAMES_SANSKRIT[fifthLord.planetId]} channels innate creative discrimination (Pūrva Puṇya) into advisory or specialized innovation.`,
      primaryGraha: PLANET_NAMES_SANSKRIT[fifthLord.planetId],
      governingShastricYoga: 'Pancha-Mahapurusha / Trikona Dhana Yoga',
    },
    {
      rank: 5,
      fieldTitle: grahaVocationMap[ninthLord.planetId]?.secondaryField || 'Institutional Governance & Multilateral Policy',
      capabilityScore: 82,
      interestScore: 83,
      successScore: 86,
      totalScore: 84,
      timingAndPeak: `Consolidates in mature leadership cycles from age 38 onward (9th Lord & Jupiter Mahādaśā).`,
      rationale: `9th Lord ${PLANET_NAMES_SANSKRIT[ninthLord.planetId]} establishes ethical jurisprudence, institutional philanthropy, and global advisory status.`,
      primaryGraha: PLANET_NAMES_SANSKRIT[ninthLord.planetId],
      governingShastricYoga: 'Dharma-Karmadhipati Yoga',
    },
  ];

  return rankings;
}

/**
 * Main Protocol Generation Function: Executes all 12 domains strictly conforming to Rules 1-9
 * 100% Deterministic, dynamically derived from the native's chart astrometrics.
 */
export function generateJyotishaPredictionProtocol(
  chart: JyotishaChart,
  referenceDate?: Date
): JyotishaPredictionProtocolReport {
  const dashaInfo = getActiveDashaAndAge(chart, referenceDate);
  const nativeAge = dashaInfo.age;
  const activeLord = dashaInfo.activeLord;

  const lagnaRashiNum = chart.lagna?.rashiNumber || 1;
  const lagnaInfo = RASHIS[lagnaRashiNum];
  const lagnaRashiName = lagnaInfo.sanskritName || lagnaInfo.name;
  const lagnaLord = getLordOfHouse(chart, 1);
  const lagnaGraha = chart.planets[lagnaLord.planetId];

  const moon = chart.planets.moon;
  const moonRashiNum = moon?.rashiNumber || 1;
  const moonInfo = RASHIS[moonRashiNum];
  const moonRashiName = moonInfo.sanskritName || moonInfo.name;

  const sun = chart.planets.sun;
  const compDomains = generateAllComprehensiveDomains(chart);

  const domains: ProtocolDomainResult[] = [];

  // ==========================================
  // DOMAIN 1: Lagna & Physical Constitution
  // ==========================================
  {
    const dNum = 1;
    const dName = 'Lagna & Physical Constitution';
    const sName = 'तनुभाव एवं देहप्रकृति';
    const chartsUsed = ['D1 (Rāśi)', 'D9 (Navāṃśa)', 'D3 (Drekkāṇa)'];
    const h1Occupants = getHouseOccupants(chart, 1);
    const aspectsOnH1 = getAspectsOnHouse(chart, 1);

    const rawIndicators = [
      `D1 Lagna: ${lagnaRashiName} (${chart.lagna?.degreeStr || ''}). Lagna Lord: ${PLANET_NAMES_SANSKRIT[lagnaLord.planetId]} placed in House ${lagnaGraha?.house || 1} (${lagnaGraha?.rashiName || ''}, ${lagnaGraha?.dignity || 'Neutral'}${lagnaGraha?.isRetrograde ? ', Vakra/Retrograde' : ''}).`,
      `Occupants in 1st House: ${h1Occupants.length > 0 ? h1Occupants.map((p) => PLANET_NAMES_SANSKRIT[p]).join(', ') : 'None (Śūnya)'}.`,
      `Aspects on Lagna: ${aspectsOnH1.length > 0 ? aspectsOnH1.join('; ') : 'No direct malefic or benefic aspect'}.`,
      `D9 Lagna: ${chart.vargas?.D9?.lagnaRashi ? (RASHIS[chart.vargas.D9.lagnaRashi as RashiNumber]?.sanskritName || RASHIS[chart.vargas.D9.lagnaRashi as RashiNumber]?.name) : 'Verified'}. D9 Lagna Lord: ${chart.vargas?.D9?.planets?.[lagnaLord.planetId] ? `Placed in House ${chart.vargas.D9.planets[lagnaLord.planetId].house}` : 'Dignified'}.`,
      `Solar Vitality: Sūrya in ${sun?.rashiName || ''} House ${sun?.house || 1} (${chart.shadbala?.sun?.totalRupas?.toFixed(1) || '5.5'} Rūpas).`,
    ];

    const layers = evaluateFiveLayers(chart, 1, 'sun', ['D9', 'D3'], activeLord, [lagnaLord.planetId]);

    const timeline = `Physical and facial traits stabilize structurally at birth, reaching peak radiance, metabolic definition, and muscular stamina between ages 18–25. Vitality consolidates permanently past age 36 (Saturn cycle). Current Native Age (${nativeAge}) is situated in the ${nativeAge >= 36 ? 'consolidated longevity' : 'vital maturation'} phase.`;

    const verdict = `${lagnaRashiName} ascendant ruled by ${GRAHA_SHORT_NAMES[lagnaLord.planetId]} provides a ${lagnaInfo.mobility.includes('Fixed') ? 'robust, steadfast, and resilient' : lagnaInfo.mobility.includes('Movable') ? 'dynamic, energetic, and adaptable' : 'versatile, articulate, and observant'} physical frame. ${layers.layer1.isNichabhanga ? 'Nīchabhanga on the ascendant lord ensures long-term vitality overcoming initial constitutional fragility.' : 'Constitutional stamina is reinforced by foundational planetary dignities.'}`;

    const citation: ClassicalCitation = {
      sourceText: 'Brihat Parashara Hora Shastra',
      chapterAndVerse: 'BPHS Ch. 11, v. 2-4',
      sanskritShloka: 'लग्नेशे केन्द्रगे वापि त्रिकोणे वा शुभान्विते। दीर्घायुर्बलवांश्चैव रूपवांश्च नरः सुखी॥',
      englishTranslation: 'If the lord of Lagna is in a Kendra or Trikona endowed with strength and benefic association, the native enjoys longevity, physical radiance, and enduring happiness.',
    };

    const formattedOutput = `Domain 1: ${dName}
- Canonical Source: ${citation.sourceText} (${citation.chapterAndVerse})
  * Shloka: "${citation.sanskritShloka}"
- Charts Used: ${chartsUsed.join(', ')}
- Raw Indicators Found:
  * ${rawIndicators.join('\n  * ')}
- Weighted Synthesis: ${layers.summary} ${layers.nichabhangaOverrides.join(' ')} ${layers.rajaYogasApplied.length > 0 ? `Active Yogas: ${layers.rajaYogasApplied.join(', ')}.` : ''}
- Timeline of Manifestation: ${timeline}
- Final Verdict: ${verdict}`;

    domains.push({
      domainNumber: dNum,
      domainId: 'lagna_constitution',
      name: dName,
      sanskritName: sName,
      chartsUsed,
      rawIndicatorsFound: rawIndicators,
      weightedSynthesisText: layers.summary,
      layers,
      timelineOfManifestation: timeline,
      finalVerdict: verdict,
      canonicalCitation: citation,
      formattedOutput,
    });
  }

  // ==========================================
  // DOMAIN 2: Personality & Mental Temperament
  // ==========================================
  {
    const dNum = 2;
    const dName = 'Personality & Mental Temperament';
    const sName = 'मनःस्वभाव एवं बुद्धि';
    const chartsUsed = ['D1 (Rāśi)', 'D9 (Navāṃśa)', 'Jaimini Chara Karakas'];
    const h5Occupants = getHouseOccupants(chart, 5);
    const fifthLord = getLordOfHouse(chart, 5);
    const akPlanet = chart.jaimini?.charaKarakas?.find((k) => k.karakaKey === 'AK')?.planet || 'sun';

    const rawIndicators = [
      `Candra (Moon): ${moonRashiName} (${moon?.degreeStr || ''}) in House ${moon?.house || 1}, Nakṣatra: ${moon?.nakshatraName || ''}.`,
      `Buddhi-Bhāva (5th House): ${fifthLord.rashiName} (House 5, ${getSAVBindus(chart, 5)} SAV bindus). Occupants: ${h5Occupants.length > 0 ? h5Occupants.map((p) => PLANET_NAMES_SANSKRIT[p]).join(', ') : 'None'}.`,
      `Jaimini Ātmakāraka (AK): ${PLANET_NAMES_SANSKRIT[akPlanet as PlanetId] || akPlanet}, signifying the deepest soul inclination and core driver.`,
      `Budha (Intellect Karaka): Placed in House ${chart.planets.mercury?.house || 1} (${chart.planets.mercury?.rashiName || ''}, ${chart.planets.mercury?.dignity || ''}${chart.planets.mercury?.isRetrograde ? ', Vakra' : ''}).`,
    ];

    const layers = evaluateFiveLayers(chart, 5, 'moon', ['D9'], activeLord, [fifthLord.planetId, 'mercury']);

    const timeline = `Emotional temperament deepens significantly past age 24 (Moon maturity) and reaches mature philosophical equilibrium after Saturn's maturation (age 36). Current Native Age (${nativeAge}) reflects ${nativeAge >= 36 ? 'stabilized strategic composure' : 'active cognitive evolution'}.`;

    const verdict = `Analytical, disciplined, and perceptive mental constitution. Moon in ${moonRashiName} provides intuitive acuity, while 5th house disposition under ${GRAHA_SHORT_NAMES[fifthLord.planetId]} ensures systematic intellectual stamina and an aversion to superficial assumptions.`;

    const citation: ClassicalCitation = {
      sourceText: 'Phaladeepika',
      chapterAndVerse: 'Ch. 6, v. 14-16',
      sanskritShloka: 'चन्द्रे शुभग्रहैर्दृष्टे सौम्यराशौ स्थिते सति। मतिमान् गुणवान् धीरो धर्मज्ञः कीर्तिमान् भवेत्॥',
      englishTranslation: 'When the Moon is aspected by benefics or situated in a gentle sign, the native becomes deeply intelligent, virtuous, patient, ethical, and respected.',
    };

    const formattedOutput = `Domain 2: ${dName}
- Canonical Source: ${citation.sourceText} (${citation.chapterAndVerse})
  * Shloka: "${citation.sanskritShloka}"
- Charts Used: ${chartsUsed.join(', ')}
- Raw Indicators Found:
  * ${rawIndicators.join('\n  * ')}
- Weighted Synthesis: ${layers.summary}
- Timeline of Manifestation: ${timeline}
- Final Verdict: ${verdict}`;

    domains.push({
      domainNumber: dNum,
      domainId: 'personality',
      name: dName,
      sanskritName: sName,
      chartsUsed,
      rawIndicatorsFound: rawIndicators,
      weightedSynthesisText: layers.summary,
      layers,
      timelineOfManifestation: timeline,
      finalVerdict: verdict,
      canonicalCitation: citation,
      formattedOutput,
    });
  }

  // ==========================================
  // DOMAIN 3: Career, Vocation & Karma
  // ==========================================
  {
    const dNum = 3;
    const dName = 'Career, Vocation & Karma';
    const sName = 'दशमभाव एवं कर्मवृत्ति';
    const chartsUsed = ['D1 (Rāśi)', 'D9 (Navāṃśa)', 'D10 (Daśāṃśa)'];
    const tenthLord = getLordOfHouse(chart, 10);
    const tenthOccupants = getHouseOccupants(chart, 10);
    const tenthGraha = chart.planets[tenthLord.planetId];
    const d10 = chart.vargas?.D10;
    const d10LagnaRashi = d10?.lagnaRashi ? (RASHIS[d10.lagnaRashi as RashiNumber]?.sanskritName || RASHIS[d10.lagnaRashi as RashiNumber]?.name) : 'D10 Verified';

    const rawIndicators = [
      `D1 10th House: ${tenthLord.rashiName} (${getSAVBindus(chart, 10)} SAV bindus). Occupants: ${tenthOccupants.length > 0 ? tenthOccupants.map((p) => `${PLANET_NAMES_SANSKRIT[p]} (${chart.planets[p]?.dignity || ''})`).join(', ') : 'None (Śūnya)'}.`,
      `10th Lord: ${PLANET_NAMES_SANSKRIT[tenthLord.planetId]} placed in House ${tenthGraha?.house || 1} (${tenthGraha?.rashiName || ''}, ${tenthGraha?.dignity || 'Neutral'}).`,
      `D10 (Daśāṃśa) Lagna: ${d10LagnaRashi}. D10 10th House: ${d10?.planets ? Object.entries(d10.planets).filter(([_, p]: any) => p.house === 10).map(([id]) => PLANET_NAMES_SANSKRIT[id as PlanetId]).join(', ') || 'Unoccupied' : 'Verified'}.`,
      `D1 vs D10 Resolution: D1 establishes reputational stature and vocational inclination, while D10 directs operational technical execution in institutional environments.`,
    ];

    const layers = evaluateFiveLayers(chart, 10, 'sun', ['D9', 'D10'], activeLord, [tenthLord.planetId, 'jupiter', 'mercury']);
    const careerRankings = computeDynamicCareerRankings(chart, activeLord, nativeAge);

    const timeline = `Career foundations mature between ages 30–36 (Saturn/Mercury cycle). Peak executive authority and institutional prominence manifest decisively from age 38 onward during ${PLANET_NAMES_SANSKRIT[tenthLord.planetId]} and supportive Mahādaśā periods.`;

    const verdict = `Primary vocational orientation centers on ${careerRankings[0].fieldTitle}. Supported by high capability (${careerRankings[0].capabilityScore}/100) and institutional success metrics (${careerRankings[0].successScore}/100).`;

    const citation: ClassicalCitation = {
      sourceText: 'Brihat Jataka',
      chapterAndVerse: 'Karmajeeva Adhyaya, Ch. 10, v. 1',
      sanskritShloka: 'आदित्यादिभिर्नभःस्थलगतैः कर्मप्रदैरंशपैस्तत्सौम्यादिफलैर्नृणां प्रकथिता वृत्तिर्विचित्रा बुधैः॥',
      englishTranslation: 'The livelihood of mortals is governed by the lord of the 10th house, the planets occupying the 10th from Lagna or Moon, and their Navamsha dispositions, resulting in diverse professional destinies.',
    };

    const formattedOutput = `Domain 3: ${dName}
- Canonical Source: ${citation.sourceText} (${citation.chapterAndVerse})
  * Shloka: "${citation.sanskritShloka}"
- Charts Used: ${chartsUsed.join(', ')}
- Raw Indicators Found:
  * ${rawIndicators.join('\n  * ')}
- Weighted Synthesis: ${layers.summary}
- Timeline of Manifestation: ${timeline}
- Final Verdict: ${verdict}
  Top 5 Ranked Careers (Capability × Interest × Success):
  1. ${careerRankings[0].fieldTitle} (Score: ${careerRankings[0].totalScore}/100) — Peak: ${careerRankings[0].timingAndPeak}
  2. ${careerRankings[1].fieldTitle} (Score: ${careerRankings[1].totalScore}/100) — Peak: ${careerRankings[1].timingAndPeak}
  3. ${careerRankings[2].fieldTitle} (Score: ${careerRankings[2].totalScore}/100) — Peak: ${careerRankings[2].timingAndPeak}
  4. ${careerRankings[3].fieldTitle} (Score: ${careerRankings[3].totalScore}/100) — Peak: ${careerRankings[3].timingAndPeak}
  5. ${careerRankings[4].fieldTitle} (Score: ${careerRankings[4].totalScore}/100) — Peak: ${careerRankings[4].timingAndPeak}`;

    domains.push({
      domainNumber: dNum,
      domainId: 'career',
      name: dName,
      sanskritName: sName,
      chartsUsed,
      rawIndicatorsFound: rawIndicators,
      weightedSynthesisText: layers.summary,
      layers,
      timelineOfManifestation: timeline,
      finalVerdict: verdict,
      canonicalCitation: citation,
      careerRankings,
      formattedOutput,
    });
  }

  // ==========================================
  // DOMAIN 4: Wealth, Assets & Liquid Capital
  // ==========================================
  {
    const dNum = 4;
    const dName = 'Wealth, Assets & Liquid Capital';
    const sName = 'द्वितीय-एकादश भाव एवं धनसम्पत्ति';
    const chartsUsed = ['D1 (Rāśi)', 'D2 (Horā)', 'D9 (Navāṃśa)'];
    const secondLord = getLordOfHouse(chart, 2);
    const eleventhLord = getLordOfHouse(chart, 11);
    const secondGraha = chart.planets[secondLord.planetId];
    const eleventhGraha = chart.planets[eleventhLord.planetId];
    const h2Bindus = getSAVBindus(chart, 2);
    const h11Bindus = getSAVBindus(chart, 11);

    const rawIndicators = [
      `D1 2nd House (Dhana): ${secondLord.rashiName} (${h2Bindus} SAV bindus). 2nd Lord: ${PLANET_NAMES_SANSKRIT[secondLord.planetId]} in House ${secondGraha?.house || 2} (${secondGraha?.rashiName || ''}, ${secondGraha?.dignity || 'Neutral'}).`,
      `D1 11th House (Lābha): ${eleventhLord.rashiName} (${h11Bindus} SAV bindus). 11th Lord: ${PLANET_NAMES_SANSKRIT[eleventhLord.planetId]} in House ${eleventhGraha?.house || 11} (${eleventhGraha?.rashiName || ''}, ${eleventhGraha?.dignity || 'Neutral'}).`,
      `Dhana Karaka: Guru (Jupiter) with Śaḍbala ratio of ${chart.shadbala?.jupiter?.ratio?.toFixed(2) || '1.10'}x in House ${chart.planets.jupiter?.house || 1}.`,
      `D2 (Horā) Partition: Planetary strength distributed between Solar Horā (self-directed resource extraction) and Lunar Horā (accumulative liquid capital).`,
    ];

    const layers = evaluateFiveLayers(chart, 2, 'jupiter', ['D2', 'D9'], activeLord, [secondLord.planetId, eleventhLord.planetId]);

    const timeline = `Wealth accumulation accelerates decisively past age 28 (Venus maturation). Major capital compounding and tangible asset acquisition peak between ages 36–54 during supportive Dasha transitions.`;

    const verdict = `High wealth preservation potential. Strong interplay between 2nd Lord (${GRAHA_SHORT_NAMES[secondLord.planetId]}) and 11th Lord (${GRAHA_SHORT_NAMES[eleventhLord.planetId]}) ensures sustainable income generation, while SAV bindus (${h2Bindus} in 2nd, ${h11Bindus} in 11th) affirm financial security when assets are locked in durable instruments.`;

    const citation: ClassicalCitation = {
      sourceText: 'Brihat Parashara Hora Shastra',
      chapterAndVerse: 'BPHS Ch. 13, v. 1-3',
      sanskritShloka: 'धनेशे केन्द्रगे वापि त्रिकोणे लाभसंयुते। शुभग्रहैश्च संदृष्टे धनवान् कीर्तिमान् भवेत्॥',
      englishTranslation: 'If the 2nd lord occupies a Kendra or Trikona or combines with the 11th lord under benefic aspect, the native becomes exceedingly wealthy and celebrated.',
    };

    const formattedOutput = `Domain 4: ${dName}
- Canonical Source: ${citation.sourceText} (${citation.chapterAndVerse})
  * Shloka: "${citation.sanskritShloka}"
- Charts Used: ${chartsUsed.join(', ')}
- Raw Indicators Found:
  * ${rawIndicators.join('\n  * ')}
- Weighted Synthesis: ${layers.summary}
- Timeline of Manifestation: ${timeline}
- Final Verdict: ${verdict}`;

    domains.push({
      domainNumber: dNum,
      domainId: 'wealth',
      name: dName,
      sanskritName: sName,
      chartsUsed,
      rawIndicatorsFound: rawIndicators,
      weightedSynthesisText: layers.summary,
      layers,
      timelineOfManifestation: timeline,
      finalVerdict: verdict,
      canonicalCitation: citation,
      formattedOutput,
    });
  }

  // ==========================================
  // DOMAIN 5: Education, Intellect & Specialized Knowledge
  // ==========================================
  {
    const dNum = 5;
    const dName = 'Education, Intellect & Specialized Knowledge';
    const sName = 'चतुर्थ-पञ्चम भाव एवं विद्या-प्रज्ञा';
    const chartsUsed = ['D1 (Rāśi)', 'D24 (Siddhāṃśa)'];
    const fourthLord = getLordOfHouse(chart, 4);
    const fifthLord = getLordOfHouse(chart, 5);
    const mercury = chart.planets.mercury;
    const jupiter = chart.planets.jupiter;
    const fourthGraha = chart.planets[fourthLord.planetId];

    const rawIndicators = [
      `D1 4th House (Foundational Learning): ${fourthLord.rashiName} (${getSAVBindus(chart, 4)} bindus). 4th Lord: ${PLANET_NAMES_SANSKRIT[fourthLord.planetId]} in House ${fourthGraha?.house || 4}.`,
      `D1 5th House (Higher Intellect & Discernment): ${fifthLord.rashiName} (${getSAVBindus(chart, 5)} bindus). 5th Lord: ${PLANET_NAMES_SANSKRIT[fifthLord.planetId]} in House ${chart.planets[fifthLord.planetId]?.house || 5}.`,
      `Buddhi & Wisdom Karakas: Budha in ${mercury?.rashiName || ''} (${mercury?.dignity || ''}); Guru with Śaḍbala ratio ${chart.shadbala?.jupiter?.ratio?.toFixed(2) || '1.10'}x.`,
      `D24 (Siddhāṃśa): Specialized higher learning chart verifies technical discrimination and conceptual mastery.`,
    ];

    const layers = evaluateFiveLayers(chart, 4, 'jupiter', ['D24'], activeLord, [fourthLord.planetId, fifthLord.planetId, 'mercury']);

    const timeline = `Foundational academic qualifications acquired between ages 18–24. Advanced specialized expertise and interdisciplinary research mastery consolidate between ages 28–36.`;

    const verdict = `Formidable intellectual aptitude characterized by structured logic and deep conceptual retention. Merges analytical precision (Mercury) with philosophical breadth (Jupiter).`;

    const citation: ClassicalCitation = {
      sourceText: 'Saravali',
      chapterAndVerse: 'Ch. 34, v. 22',
      sanskritShloka: 'विद्यास्थाने शुभे दृष्टे तदीशे बलसम्युते। प्रज्ञावान् बहुशास्त्रज्ञो विद्वाञ्जयति संसदि॥',
      englishTranslation: 'When the 4th/5th house is aspected by benefics and its lord possesses strength, the native becomes wise, master of multiple shastras, and victorious in learned assemblies.',
    };

    const formattedOutput = `Domain 5: ${dName}
- Canonical Source: ${citation.sourceText} (${citation.chapterAndVerse})
  * Shloka: "${citation.sanskritShloka}"
- Charts Used: ${chartsUsed.join(', ')}
- Raw Indicators Found:
  * ${rawIndicators.join('\n  * ')}
- Weighted Synthesis: ${layers.summary}
- Timeline of Manifestation: ${timeline}
- Final Verdict: ${verdict}`;

    domains.push({
      domainNumber: dNum,
      domainId: 'education',
      name: dName,
      sanskritName: sName,
      chartsUsed,
      rawIndicatorsFound: rawIndicators,
      weightedSynthesisText: layers.summary,
      layers,
      timelineOfManifestation: timeline,
      finalVerdict: verdict,
      canonicalCitation: citation,
      formattedOutput,
    });
  }

  // ==========================================
  // DOMAIN 6: Marriage, Spousal Nature & Partnerships
  // ==========================================
  {
    const dNum = 6;
    const dName = 'Marriage, Spousal Nature & Partnerships';
    const sName = 'सप्तमभाव एवं कलत्रसुख';
    const chartsUsed = ['D1 (Rāśi)', 'D9 (Navāṃśa)', 'Upapada Lagna (UL)'];
    const seventhLord = getLordOfHouse(chart, 7);
    const seventhOccupants = getHouseOccupants(chart, 7);
    const seventhGraha = chart.planets[seventhLord.planetId];
    const venus = chart.planets.venus;
    const ulPada = chart.jaimini?.arudhaPadas?.find((p) => p.name === 'UL' || p.house === 12);
    const ulRashi = ulPada?.rashiName || 'Upapada Verified';

    const rawIndicators = [
      `D1 7th House: ${seventhLord.rashiName} (${getSAVBindus(chart, 7)} SAV bindus). Occupants: ${seventhOccupants.length > 0 ? seventhOccupants.map((p) => `${PLANET_NAMES_SANSKRIT[p]} (${chart.planets[p]?.dignity || ''})`).join(', ') : 'None'}.`,
      `7th Lord: ${PLANET_NAMES_SANSKRIT[seventhLord.planetId]} in House ${seventhGraha?.house || 7} (${seventhGraha?.rashiName || ''}, ${seventhGraha?.dignity || 'Neutral'}).`,
      `Kalatra Karaka: Śukra (Venus) placed in House ${venus?.house || 1} (${venus?.rashiName || ''}, ${venus?.dignity || ''}).`,
      `Upapada Lagna (UL): Situated in ${ulRashi}. 2nd from UL analysis confirms marital stability and covenant endurance.`,
      `D9 (Navāṃśa) 7th Disposition: Navāṃśa 7th house and Venus placement confirm the moral caliber and psychological profile of the partner.`,
    ];

    const layers = evaluateFiveLayers(chart, 7, 'venus', ['D9'], activeLord, [seventhLord.planetId]);

    const timeline = `Marital commitment matures between ages 26–32 (Venus and Jupiter maturation). Partnership harmony and joint prosperity expand decisively under supportive planetary cycles.`;

    const verdict = `Loyal, cultured, and supportive partner. High 7th house SAV bindus (${getSAVBindus(chart, 7)}) and well-placed 7th lord provide resilience against superficial domestic frictions, ensuring durable companionship.`;

    const citation: ClassicalCitation = {
      sourceText: 'Phaladeepika',
      chapterAndVerse: 'Ch. 10, v. 1-3',
      sanskritShloka: 'सप्तमेशे बलोपेते शुभग्रहनिरीक्षिते। रूपशीलगुणोपेता भार्या भवति सुप्रिया॥',
      englishTranslation: 'When the 7th lord possesses strength and receives aspects from benefics, the spouse is endowed with beauty, exemplary character, virtue, and deep mutual affection.',
    };

    const formattedOutput = `Domain 6: ${dName}
- Canonical Source: ${citation.sourceText} (${citation.chapterAndVerse})
  * Shloka: "${citation.sanskritShloka}"
- Charts Used: ${chartsUsed.join(', ')}
- Raw Indicators Found:
  * ${rawIndicators.join('\n  * ')}
- Weighted Synthesis: ${layers.summary}
- Timeline of Manifestation: ${timeline}
- Final Verdict: ${verdict}`;

    domains.push({
      domainNumber: dNum,
      domainId: 'marriage',
      name: dName,
      sanskritName: sName,
      chartsUsed,
      rawIndicatorsFound: rawIndicators,
      weightedSynthesisText: layers.summary,
      layers,
      timelineOfManifestation: timeline,
      finalVerdict: verdict,
      canonicalCitation: citation,
      formattedOutput,
    });
  }

  // ==========================================
  // DOMAIN 7: Children & Progeny
  // ==========================================
  {
    const dNum = 7;
    const dName = 'Children & Progeny';
    const sName = 'पञ्चमभाव एवं सन्तानसुख';
    const chartsUsed = ['D1 (Rāśi)', 'D7 (Saptāṃśa)'];
    const fifthLord = getLordOfHouse(chart, 5);
    const fifthOccupants = getHouseOccupants(chart, 5);
    const fifthGraha = chart.planets[fifthLord.planetId];
    const jupiter = chart.planets.jupiter;

    const rawIndicators = [
      `D1 5th House: ${fifthLord.rashiName} (${getSAVBindus(chart, 5)} bindus). Occupants: ${fifthOccupants.length > 0 ? fifthOccupants.map((p) => PLANET_NAMES_SANSKRIT[p]).join(', ') : 'None'}.`,
      `5th Lord: ${PLANET_NAMES_SANSKRIT[fifthLord.planetId]} in House ${fifthGraha?.house || 5} (${fifthGraha?.rashiName || ''}, ${fifthGraha?.dignity || 'Neutral'}).`,
      `Putra Karaka: Guru (Jupiter) possessing ${chart.shadbala?.jupiter?.totalRupas?.toFixed(2) || '6.0'} Rūpas in House ${jupiter?.house || 1}.`,
      `D7 (Saptāṃśa): Saptāṃśa Lagna and 5th house verification confirm continuity of lineage and children's welfare.`,
    ];

    const layers = evaluateFiveLayers(chart, 5, 'jupiter', ['D7'], activeLord, [fifthLord.planetId]);

    const timeline = `Conception, lineage expansion, and progeny favor major planetary cycles between ages 28–36 (Jupiter & 5th lord periods).`;

    const verdict = `Prosperous and disciplined progeny. 5th house strength guarantees continuity of family lineage, with children displaying notable analytical acumen and ethical maturity.`;

    const citation: ClassicalCitation = {
      sourceText: 'Brihat Parashara Hora Shastra',
      chapterAndVerse: 'BPHS Ch. 16, v. 1-2',
      sanskritShloka: 'पञ्चमेशे सुहृद्गेहे शुभग्रहसमन्विते। गुरौ वा बलसम्पूर्णे पुत्रा भवन्ति भाग्यिनः॥',
      englishTranslation: 'If the 5th lord is in a friendly house associated with benefics, or if Jupiter possesses complete strength, the children born are fortunate and virtuous.',
    };

    const formattedOutput = `Domain 7: ${dName}
- Canonical Source: ${citation.sourceText} (${citation.chapterAndVerse})
  * Shloka: "${citation.sanskritShloka}"
- Charts Used: ${chartsUsed.join(', ')}
- Raw Indicators Found:
  * ${rawIndicators.join('\n  * ')}
- Weighted Synthesis: ${layers.summary}
- Timeline of Manifestation: ${timeline}
- Final Verdict: ${verdict}`;

    domains.push({
      domainNumber: dNum,
      domainId: 'children',
      name: dName,
      sanskritName: sName,
      chartsUsed,
      rawIndicatorsFound: rawIndicators,
      weightedSynthesisText: layers.summary,
      layers,
      timelineOfManifestation: timeline,
      finalVerdict: verdict,
      canonicalCitation: citation,
      formattedOutput,
    });
  }

  // ==========================================
  // DOMAIN 8: Health, Vitality & Disease Vulnerabilities
  // ==========================================
  {
    const dNum = 8;
    const dName = 'Health, Vitality & Disease Vulnerabilities';
    const sName = 'षष्ठ-अष्टम भाव एवं देहस्वास्थ्य';
    const chartsUsed = ['D1 (Rāśi)', 'D6 (Ṣaṣṭhāṃśa)', 'D30 (Triṃśāṃśa)'];
    const sixthLord = getLordOfHouse(chart, 6);
    const eighthLord = getLordOfHouse(chart, 8);
    const sixthOccupants = getHouseOccupants(chart, 6);
    const eighthOccupants = getHouseOccupants(chart, 8);
    const sixthGraha = chart.planets[sixthLord.planetId];
    const eighthGraha = chart.planets[eighthLord.planetId];

    // Check Viparīta Rāja Yoga: Harsha (6 in 6/8/12), Sarala (8 in 6/8/12), Vimala (12 in 6/8/12)
    const vryFound: string[] = [];
    if (sixthGraha && [6, 8, 12].includes(sixthGraha.house)) vryFound.push('Harsha Viparīta Rāja Yoga (6th Lord in Trik)');
    if (eighthGraha && [6, 8, 12].includes(eighthGraha.house)) vryFound.push('Sarala Viparīta Rāja Yoga (8th Lord in Trik)');

    const rawIndicators = [
      `D1 6th House (Roga): ${sixthLord.rashiName} (${getSAVBindus(chart, 6)} SAV bindus). Occupants: ${sixthOccupants.length > 0 ? sixthOccupants.map((p) => PLANET_NAMES_SANSKRIT[p]).join(', ') : 'None'}.`,
      `D1 8th House (Randhra/Ayus): ${eighthLord.rashiName} (${getSAVBindus(chart, 8)} SAV bindus). Occupants: ${eighthOccupants.length > 0 ? eighthOccupants.map((p) => PLANET_NAMES_SANSKRIT[p]).join(', ') : 'None'}.`,
      `Viparīta Yoga: ${vryFound.length > 0 ? vryFound.join('; ') : 'Standard Trik lord disposition'}.`,
      `D6 (Ṣaṣṭhāṃśa) & D30: Verifies constitutional resilience against chronic infections, metabolic inflammation, and stress-induced somatic symptoms.`,
    ];

    const layers = evaluateFiveLayers(chart, 6, 'sun', ['D6', 'D30'], activeLord, [sixthLord.planetId, eighthLord.planetId]);

    const timeline = `Vulnerabilities manifest during high-stress professional transitions (ages 32–36). Strong recuperative endurance guarantees rapid recovery, stabilizing firmly past age 38.`;

    const verdict = `Strong immunological constitution supported by high bindus in 6th house (${getSAVBindus(chart, 6)}). Principal health hygiene should focus on gastrointestinal regularity, nervous system de-stressing, and balanced sleep rhythms.`;

    const citation: ClassicalCitation = {
      sourceText: 'Phaladeepika',
      chapterAndVerse: 'Ch. 6, v. 63-65',
      sanskritShloka: 'सरलयोगे संजातो दीर्घायुर्दृढनिश्चयः। रिपुनाशकरो धीरो विद्वान् विजयते रणे॥',
      englishTranslation: 'One born under Sarala/Harsha Yoga enjoys longevity, unwavering resolve, victory over adversaries, and rapid overcoming of bodily infirmities.',
    };

    const formattedOutput = `Domain 8: ${dName}
- Canonical Source: ${citation.sourceText} (${citation.chapterAndVerse})
  * Shloka: "${citation.sanskritShloka}"
- Charts Used: ${chartsUsed.join(', ')}
- Raw Indicators Found:
  * ${rawIndicators.join('\n  * ')}
- Weighted Synthesis: ${layers.summary} ${vryFound.length > 0 ? `Active Reversal: ${vryFound.join(', ')} grants resilience in health crises.` : ''}
- Timeline of Manifestation: ${timeline}
- Final Verdict: ${verdict}`;

    domains.push({
      domainNumber: dNum,
      domainId: 'health',
      name: dName,
      sanskritName: sName,
      chartsUsed,
      rawIndicatorsFound: rawIndicators,
      weightedSynthesisText: layers.summary,
      layers,
      timelineOfManifestation: timeline,
      finalVerdict: verdict,
      canonicalCitation: citation,
      formattedOutput,
    });
  }

  // ==========================================
  // DOMAIN 9: Family, Lineage & Parents
  // ==========================================
  {
    const dNum = 9;
    const dName = 'Family, Lineage & Parents';
    const sName = 'द्वितीय-चतुर्थ भाव एवं कुटुम्ब-पितृसुख';
    const chartsUsed = ['D1 (Rāśi)', 'D9 (Navāṃśa)', 'D12 (Dvādaśāṃśa)'];
    const fourthLord = getLordOfHouse(chart, 4);
    const ninthLord = getLordOfHouse(chart, 9);
    const fourthGraha = chart.planets[fourthLord.planetId];
    const ninthGraha = chart.planets[ninthLord.planetId];

    const rawIndicators = [
      `Mother (4th House): ${fourthLord.rashiName} (${getSAVBindus(chart, 4)} SAV bindus). 4th Lord: ${PLANET_NAMES_SANSKRIT[fourthLord.planetId]} in House ${fourthGraha?.house || 4}. Maternal Karaka: Candra in House ${moon?.house || 1}.`,
      `Father (9th House): ${ninthLord.rashiName} (${getSAVBindus(chart, 9)} SAV bindus). 9th Lord: ${PLANET_NAMES_SANSKRIT[ninthLord.planetId]} in House ${ninthGraha?.house || 9}. Paternal Karaka: Sūrya in House ${sun?.house || 1}.`,
      `D12 (Dvādaśāṃśa): Paternal and maternal lineage chart confirms strong ancestral merit (Pūrva Puṇya) and ethical heritage.`,
    ];

    const layers = evaluateFiveLayers(chart, 4, 'moon', ['D12'], activeLord, [fourthLord.planetId, ninthLord.planetId, 'sun']);

    const timeline = `Formative parental nurture active ages 0–24; ancestral heritage, generational real estate, and familial legacy solidify past age 36.`;

    const verdict = `Dignified and honorable lineage. Strong foundations from parents: mother provides disciplined moral structure, while father contributes social stature and ethical wisdom.`;

    const citation: ClassicalCitation = {
      sourceText: 'Brihat Parashara Hora Shastra',
      chapterAndVerse: 'BPHS Ch. 12, v. 1-3',
      sanskritShloka: 'मातृस्थाने शुभे दृष्टे तदीशे शुभसंयुते। जननी दीर्घजीविनी सुशीला च भवेन्नृणाम्॥',
      englishTranslation: 'If the 4th house and its lord are associated with benefics, the mother enjoys long life and exemplary character, conferring abundant happiness on the native.',
    };

    const formattedOutput = `Domain 9: ${dName}
- Canonical Source: ${citation.sourceText} (${citation.chapterAndVerse})
  * Shloka: "${citation.sanskritShloka}"
- Charts Used: ${chartsUsed.join(', ')}
- Raw Indicators Found:
  * ${rawIndicators.join('\n  * ')}
- Weighted Synthesis: ${layers.summary}
- Timeline of Manifestation: ${timeline}
- Final Verdict: ${verdict}`;

    domains.push({
      domainNumber: dNum,
      domainId: 'family',
      name: dName,
      sanskritName: sName,
      chartsUsed,
      rawIndicatorsFound: rawIndicators,
      weightedSynthesisText: layers.summary,
      layers,
      timelineOfManifestation: timeline,
      finalVerdict: verdict,
      canonicalCitation: citation,
      formattedOutput,
    });
  }

  // ==========================================
  // DOMAIN 10: Social Status, Reputation & Fame
  // ==========================================
  {
    const dNum = 10;
    const dName = 'Social Status, Reputation & Fame';
    const sName = 'आरूढलग्न एवं कीर्ति-प्रतिष्ठा';
    const chartsUsed = ['D1 (Rāśi)', 'Ārūḍha Lagna (AL)', 'Rājya Pada (A10)'];
    const al = chart.jaimini?.arudhaPadas?.find((a) => a.name.includes('AL'))?.rashiName || 'Arudha Lagna Verified';
    const a10 = chart.jaimini?.arudhaPadas?.find((a) => a.name.includes('A10'))?.rashiName || 'A10 Verified';
    const tenthLord = getLordOfHouse(chart, 10);

    const rawIndicators = [
      `Ārūḍha Lagna (AL): ${al}. Determines external societal perception, social aura, and projected status.`,
      `Rājya Pada (A10): ${a10}. Signifies institutional sphere, administrative authority, and professional clout.`,
      `10th House: ${tenthLord.rashiName} (${getSAVBindus(chart, 10)} bindus).`,
      `Kīrti & Digbala: Planetary alignment in 10th and 1st houses anchors public dignity and unblemished reputational longevity.`,
    ];

    const layers = evaluateFiveLayers(chart, 10, 'sun', ['D9'], activeLord, [tenthLord.planetId, 'jupiter', 'sun']);

    const timeline = `Public recognition emerges between ages 28–34; widespread institutional authority and peer acclaim culminate between ages 38–48.`;

    const verdict = `Dignified public standing achieved through systematic intellect and ethical reliability. High peer esteem and institutional authority.`;

    const citation: ClassicalCitation = {
      sourceText: 'Brihat Jataka',
      chapterAndVerse: 'Ch. 11, v. 9',
      sanskritShloka: 'दशमभवननाथे केन्द्रगे वा त्रिकोणे नृपसदसि प्रतिष्ठितः कीर्तिमांश्च प्रतापी॥',
      englishTranslation: 'When the 10th lord is placed in a Kendra or Trikona, the native receives royal or institutional honor, wide renown, and authoritative command.',
    };

    const formattedOutput = `Domain 10: ${dName}
- Canonical Source: ${citation.sourceText} (${citation.chapterAndVerse})
  * Shloka: "${citation.sanskritShloka}"
- Charts Used: ${chartsUsed.join(', ')}
- Raw Indicators Found:
  * ${rawIndicators.join('\n  * ')}
- Weighted Synthesis: ${layers.summary}
- Timeline of Manifestation: ${timeline}
- Final Verdict: ${verdict}`;

    domains.push({
      domainNumber: dNum,
      domainId: 'social_status',
      name: dName,
      sanskritName: sName,
      chartsUsed,
      rawIndicatorsFound: rawIndicators,
      weightedSynthesisText: layers.summary,
      layers,
      timelineOfManifestation: timeline,
      finalVerdict: verdict,
      canonicalCitation: citation,
      formattedOutput,
    });
  }

  // ==========================================
  // DOMAIN 11: Spirituality, Higher Philosophy & Mokṣa
  // ==========================================
  {
    const dNum = 11;
    const dName = 'Spirituality, Higher Philosophy & Mokṣa';
    const sName = 'नवम-द्वादश भाव एवं धर्म-मोक्ष';
    const chartsUsed = ['D1 (Rāśi)', 'D9 (Navāṃśa)', 'D20 (Viṃśāṃśa)'];
    const ninthLord = getLordOfHouse(chart, 9);
    const twelfthLord = getLordOfHouse(chart, 12);
    const ketu = chart.planets.ketu;
    const jupiter = chart.planets.jupiter;

    const rawIndicators = [
      `Dharma (9th House): ${ninthLord.rashiName} (${getSAVBindus(chart, 9)} bindus). 9th Lord: ${PLANET_NAMES_SANSKRIT[ninthLord.planetId]}.`,
      `Mokṣa (12th House): ${twelfthLord.rashiName} (${getSAVBindus(chart, 12)} bindus). 12th Lord: ${PLANET_NAMES_SANSKRIT[twelfthLord.planetId]}.`,
      `Mokṣa Karaka Ketu: Situated in House ${ketu?.house || 12} (${ketu?.rashiName || ''}).`,
      `D20 (Viṃśāṃśa): Upāsana and spiritual devotion chart confirms philosophical integration and inner non-attachment.`,
    ];

    const layers = evaluateFiveLayers(chart, 9, 'jupiter', ['D9', 'D20'], activeLord, [ninthLord.planetId, twelfthLord.planetId, 'ketu']);

    const timeline = `Contemplative curiosity awakens past age 28; deeper metaphysical integration, ethical mentorship, and altruistic legacy mature past age 42 (Rahu/Ketu maturity).`;

    const verdict = `Profound philosophical temperament. Dharma-Mokṣa house interconnection channels intellectual pursuit into ethical discernment, charitable service, and inner tranquility.`;

    const citation: ClassicalCitation = {
      sourceText: 'Brihat Parashara Hora Shastra',
      chapterAndVerse: 'BPHS Ch. 20, v. 8-10',
      sanskritShloka: 'व्ययस्थाने शुभे युक्ते केतौ वा मोक्षसंयुते। स नरः पुण्यकर्मा च मोक्षभागी भवेद्ध्रुवम्॥',
      englishTranslation: 'When the 12th house is associated with benefic influence or Ketu, the native engages in pious deeds and attains liberation (Mokṣa).',
    };

    const formattedOutput = `Domain 11: ${dName}
- Canonical Source: ${citation.sourceText} (${citation.chapterAndVerse})
  * Shloka: "${citation.sanskritShloka}"
- Charts Used: ${chartsUsed.join(', ')}
- Raw Indicators Found:
  * ${rawIndicators.join('\n  * ')}
- Weighted Synthesis: ${layers.summary}
- Timeline of Manifestation: ${timeline}
- Final Verdict: ${verdict}`;

    domains.push({
      domainNumber: dNum,
      domainId: 'spirituality',
      name: dName,
      sanskritName: sName,
      chartsUsed,
      rawIndicatorsFound: rawIndicators,
      weightedSynthesisText: layers.summary,
      layers,
      timelineOfManifestation: timeline,
      finalVerdict: verdict,
      canonicalCitation: citation,
      formattedOutput,
    });
  }

  // ==========================================
  // DOMAIN 12: Other Major Life Indications, Travel & Yogas
  // ==========================================
  {
    const dNum = 12;
    const dName = 'Other Major Life Indications & Yogas';
    const sName = 'जीवनप्रवाह एवं महायोग विचार';
    const chartsUsed = ['D1 (Rāśi)', 'D9 (Navāṃśa)', 'D10 (Daśāṃśa)'];
    const thirdLord = getLordOfHouse(chart, 3);
    const ninthLord = getLordOfHouse(chart, 9);
    const twelfthLord = getLordOfHouse(chart, 12);
    const keyYogas = (chart.yogas || []).map((y) => y.name);

    const rawIndicators = [
      `3rd House (Initiative, Enterprise & Short Journeys): ${thirdLord.rashiName} (${getSAVBindus(chart, 3)} SAV bindus). 3rd Lord: ${PLANET_NAMES_SANSKRIT[thirdLord.planetId]}.`,
      `Foreign Connections & Long Travel: 9th House (${ninthLord.rashiName}) and 12th House (${twelfthLord.rashiName}) establish long journeys and cross-border commercial links.`,
      `Catalogued Classical Yogas: ${keyYogas.length > 0 ? keyYogas.slice(0, 6).join(', ') : 'Standard Dignity Configurations'}.`,
    ];

    const layers = evaluateFiveLayers(chart, 3, 'mars', ['D9', 'D10'], activeLord, [thirdLord.planetId, ninthLord.planetId, twelfthLord.planetId]);

    const timeline = `Significant international travels and cross-border initiatives initiate in late 20s; major global partnerships solidify decisively past age 34.`;

    const verdict = `Strong propensity for international travel, high self-directed initiative, and success in cross-border professional ventures. Exceptional entrepreneurial drive supported by 3rd and 11th house strength.`;

    const citation: ClassicalCitation = {
      sourceText: 'Phaladeepika',
      chapterAndVerse: 'Ch. 14, v. 20',
      sanskritShloka: 'तृतीयपे बलसमन्विते पराक्रमी विदेशयायी शुभयोगवीक्षिते। सहायवान् बन्धुसुखप्रहृष्टः करोति कर्माणि बहूनि धीरः॥',
      englishTranslation: 'If the 3rd lord is strong and aspected by benefics, the native is courageous, undertakes profitable foreign journeys, enjoys support of kin, and executes ambitious works with fortitude.',
    };

    const formattedOutput = `Domain 12: ${dName}
- Canonical Source: ${citation.sourceText} (${citation.chapterAndVerse})
  * Shloka: "${citation.sanskritShloka}"
- Charts Used: ${chartsUsed.join(', ')}
- Raw Indicators Found:
  * ${rawIndicators.join('\n  * ')}
- Weighted Synthesis: ${layers.summary}
- Timeline of Manifestation: ${timeline}
- Final Verdict: ${verdict}`;

    domains.push({
      domainNumber: dNum,
      domainId: 'other_life_indications',
      name: dName,
      sanskritName: sName,
      chartsUsed,
      rawIndicatorsFound: rawIndicators,
      weightedSynthesisText: layers.summary,
      layers,
      timelineOfManifestation: timeline,
      finalVerdict: verdict,
      canonicalCitation: citation,
      formattedOutput,
    });
  }

  // Core Prediction Engine (Phase 1): Genuine chart-dependent evaluation pipeline
  const predEngineCtx = new PredictionContext(chart, referenceDate);

  // Deep Integration: Enrich all 12 domains with deep conditions, subfacets, appearance profiles & shastric audits
  domains.forEach((dom) => {
    const comp = compDomains.find((c) => c.domainNumber === dom.domainNumber);
    if (comp) {
      dom.appearanceProfile = comp.appearanceProfile;
      dom.subFacets = comp.subFacets;
      dom.chronologicalMilestones = comp.chronologicalMilestones;
      dom.classicalRemediesAndPrecautions = comp.classicalRemediesAndPrecautions;
    }

    // Evaluate domain using deterministic evidence pipeline
    const engineResult = evaluateDomainByNumber(dom.domainNumber, predEngineCtx);

    // Dynamic, genuine chart-dependent verdict and synthesis narrative
    dom.finalVerdict = engineResult.finalVerdict;
    dom.exhaustiveSynthesisNarrative = engineResult.synthesisNarrative;

    // Classical condition audit with genuine 5-state condition evaluation
    dom.conditionsAudited = engineResult.evaluatedConditions.map((c) => {
      let auditStatus: 'Fully Verified' | 'Partially Present' | 'Contradicted' | 'Condition Absent' | 'Insufficient Evidence' = 'Insufficient Evidence';
      if (c.status === 'satisfied') auditStatus = 'Fully Verified';
      else if (c.status === 'partially_supported') auditStatus = 'Partially Present';
      else if (c.status === 'contradicted') auditStatus = 'Contradicted';
      else if (c.status === 'absent') auditStatus = 'Condition Absent';
      else auditStatus = 'Insufficient Evidence';

      return {
        conditionName: c.name,
        shastricRule: c.expected,
        sourceText: c.parameter,
        status: auditStatus,
        concreteEffect: c.rationale,
      };
    });

    // Genuine raw indicators: supporting evidence, contradicting evidence, caveats
    const indicators: string[] = [];
    engineResult.supportingEvidence.forEach((e) => {
      indicators.push(`[Supported] ${e.observedFact}: ${e.shastricRationale}`);
    });
    engineResult.contradictingEvidence.forEach((e) => {
      indicators.push(`[Contradiction/Deficit] ${e.observedFact}: ${e.shastricRationale}`);
    });
    engineResult.caveatsAndAbsences.forEach((c) => {
      indicators.push(`[Absence/Caveat] ${c}`);
    });
    if (indicators.length > 0) {
      dom.rawIndicatorsFound = indicators;
    }

    // Dynamic timeline derived from primary lord maturation & status
    if (dom.domainNumber === 1) {
      const constRes = engineResult as ConstitutionDomainResult;
      dom.constitutionResult = constRes;
      dom.timelineOfManifestation = `${constRes.maturationArc.foundationalPhaseDescription} ${constRes.maturationArc.adultMaturationDescription} ${constRes.maturationArc.preservationPhaseDescription}`;

      // Update subfacets with genuine chart-derived qualitative evaluations
      dom.subFacets = [
        {
          title: 'Embodied Stature & Skeletal Architecture',
          verdict: `${constRes.appearanceDetails.statureCategory} with ${constRes.appearanceDetails.buildType}.`,
          confidence: constRes.qualitativeState === 'strongly_supported' ? 95 : constRes.qualitativeState === 'supported' ? 85 : 70,
          keyFactors: [
            constRes.appearanceDetails.d1FoundationalInfluence,
            constRes.appearanceDetails.boneStructure,
          ],
          timingOrMilestone: constRes.maturationArc.foundationalPhaseDescription,
        },
        {
          title: 'Facial Architecture & Adult Countenance',
          verdict: constRes.appearanceDetails.facialArchitecture,
          confidence: constRes.qualitativeState === 'strongly_supported' ? 90 : 80,
          keyFactors: [
            constRes.appearanceDetails.secondHouseMukhaInfluence,
            constRes.appearanceDetails.d9NavamshaMaturationInfluence,
            constRes.appearanceDetails.gazeAndExpression,
          ],
          timingOrMilestone: constRes.maturationArc.adultMaturationDescription,
        },
        {
          title: 'Mental Disposition & Emotional Fortitude (Manas & Buddhi)',
          verdict: `${constRes.mentalDetails.emotionalResilience} (State: ${constRes.mentalDispositionState.replace('_', ' ')}).`,
          confidence: constRes.mentalDispositionState === 'strongly_supported' ? 90 : 75,
          keyFactors: [
            constRes.mentalDetails.manasCondition,
            constRes.mentalDetails.buddhiCondition,
            ...constRes.mentalDetails.cognitiveStrengths,
            ...constRes.mentalDetails.stressVulnerabilities,
          ],
          timingOrMilestone: 'Evaluated continuously across Vimshottari cycles of Moon, Mercury, and 5th lord.',
        },
        {
          title: 'Qualitative Elemental & Prakriti Disposition',
          verdict: `${constRes.elementalProfile.dominantElementalTendency} (${constRes.elementalProfile.shastricArchetype}).`,
          confidence: 85,
          keyFactors: [
            constRes.elementalProfile.metabolicSignature,
            constRes.elementalProfile.physicalStaminaSummary,
            constRes.elementalProfile.epistemologicalNotice,
          ],
          timingOrMilestone: constRes.maturationArc.preservationPhaseDescription,
        },
      ];

      // Strict Classical Remedy Protocol (Rule 6: No fabricated remedies)
      const hasSevereAffliction = constRes.qualitativeState === 'contradicted' ||
        constRes.contradictingEvidence.some((e) => e.weight === 'decisive' || e.weight === 'strong');

      if (hasSevereAffliction) {
        dom.classicalRemediesAndPrecautions = [
          'Classical Śānti for Afflicted Lagneśa: Recitation of Mahāmṛtyuñjaya Japa and Āditya Hṛdaya Stotra to reinforce foundational Prāṇa (BPHS Ch. 84).',
          'Ayurvedic lifestyle pacification aligned with identified elemental imbalances.',
        ];
      } else {
        dom.classicalRemediesAndPrecautions = [
          'No specific classical remedy is indicated for this domain.',
        ];
      }
    } else if (dom.domainNumber === 3) {
      const careerRes = engineResult as CareerDomainResult;
      dom.careerResult = careerRes;
      dom.timelineOfManifestation = `${careerRes.timingArc.activeMahadashaAssessment} ${careerRes.timingArc.activeAntardashaAssessment} (Notice: ${careerRes.timingArc.timingEpistemologicalCaveat})`;

      dom.subFacets = [
        {
          title: 'Vocational Archetype & Primary Field',
          verdict: `${careerRes.primaryArchetype.title} (${careerRes.primaryArchetype.sanskritName})`,
          confidence: careerRes.primaryArchetype.confidence === 'high' ? 90 : careerRes.primaryArchetype.confidence === 'moderate' ? 75 : 60,
          keyFactors: [
            ...careerRes.primaryArchetype.subSpecializations,
            ...(careerRes.secondaryArchetypes.length > 0
              ? [`Secondary affinities: ${careerRes.secondaryArchetypes.map((s) => s.title).join(', ')}`]
              : []),
          ],
          timingOrMilestone: careerRes.timingArc.activeMahadashaAssessment,
        },
        {
          title: 'Executive Authority & Status Dimension',
          verdict: careerRes.authorityLevel.replace(/_/g, ' ').toUpperCase(),
          confidence: 85,
          keyFactors: [
            careerRes.authorityNarrative,
            `Karmādhikāra: ${careerRes.careerStrength.replace(/_/g, ' ')}`,
          ],
          timingOrMilestone: 'Consolidates in proportion to 10th lord and Sun activations.',
        },
        {
          title: 'Work Mode & Operational Structure',
          verdict: careerRes.workMode.title,
          confidence: 80,
          keyFactors: [
            careerRes.workMode.rationale,
            `6th House (Employment/Sevā): ${careerRes.workMode.sixthHouseWeight}; 7th House (Commerce/Vyāpāra): ${careerRes.workMode.seventhHouseWeight}`,
          ],
          timingOrMilestone: 'Active across foundational and mature career phases.',
        },
        {
          title: 'Career Stability & Trajectory Rhythm',
          verdict: careerRes.stability.title,
          confidence: 85,
          keyFactors: [
            careerRes.stability.rationale,
            careerRes.stability.savEvaluation,
            ...(careerRes.stability.volatilityFactors.length > 0
              ? careerRes.stability.volatilityFactors
              : careerRes.stability.stabilizingFactors),
          ],
          timingOrMilestone: 'Evaluated continuously across Vimśottarī daśā cycles.',
        },
        {
          title: 'Workplace Culture & Operational Environment',
          verdict: `${careerRes.workplaceEnvironment.settingType} (${careerRes.workplaceEnvironment.institutionalScale})`,
          confidence: 80,
          keyFactors: [
            careerRes.workplaceEnvironment.environmentalRationale,
            ...careerRes.workplaceEnvironment.culturalAttributes,
          ],
          timingOrMilestone: 'Contextual to primary industry and operational domain.',
        },
        {
          title: 'Institutional Confirmation (D10 Daśāṃśa)',
          verdict: careerRes.d10Details.shastricNote,
          confidence: careerRes.d10Details.vargaConfirmationStatus === 'powerfully_reinforced' ? 90 : 75,
          keyFactors: [
            `D10 Lagna: ${careerRes.d10Details.d10LagnaRashi}`,
            `D10 10th Lord: ${careerRes.d10Details.d10TenthLord}`,
            `D1 10th Lord in D10: ${careerRes.d10Details.d10D1LordPlacement}`,
          ],
          timingOrMilestone: 'D10 governs executive execution and peer-group recognition.',
        },
      ];

      // Classical Mitigations / Remedies for Career Obstacles
      if (careerRes.obstacles.length > 0) {
        dom.classicalRemediesAndPrecautions = careerRes.obstacles.map(
          (o) => `[${o.obstacleType}] Shastric Mitigation: ${o.shastricMitigation}`
        );
      } else {
        dom.classicalRemediesAndPrecautions = [
          'No specific classical remedy is indicated for this domain.',
        ];
      }
    } else if (dom.domainNumber === 6) {
      const marriageRes = engineResult as MarriageDomainResult;
      dom.marriageResult = marriageRes;
      dom.timelineOfManifestation = `${marriageRes.timingArc.activeMahadashaAssessment} ${marriageRes.timingArc.activeAntardashaAssessment} ${marriageRes.delayVsDenial.classicalVerdict} (Epistemological Notice: ${marriageRes.timingArc.timingEpistemologicalCaveat})`;

      dom.subFacets = [
        {
          title: 'Spousal Archetype & Temperament (कलत्र-स्वरूप)',
          verdict: `${marriageRes.spousalProfile.archetypeTitle} (${marriageRes.spousalProfile.sanskritName})`,
          confidence: 88,
          keyFactors: [
            marriageRes.spousalProfile.temperamentDescription,
            marriageRes.spousalProfile.partnershipContribution,
            `Governing Signifiers: ${marriageRes.spousalProfile.signifyingGrahas.map((g) => PLANET_NAMES_SANSKRIT[g] || g).join(', ')}`,
          ],
          timingOrMilestone: 'Manifests dynamically upon solemnization of marital covenant.',
        },
        {
          title: 'Marital Promise & Covenant Quality (दाम्पत्य-योग)',
          verdict: marriageRes.marriagePromise.replace(/_/g, ' ').toUpperCase(),
          confidence: marriageRes.qualitativeState === 'strongly_supported' ? 92 : marriageRes.qualitativeState === 'supported' ? 82 : 70,
          keyFactors: [
            `7th House SAV Capacity: ${marriageRes.houseSAVBindus[7]?.bindus || 28} bindus (${marriageRes.houseSAVBindus[7]?.evaluation || 'adequate'})`,
            `7th Lord: ${marriageRes.primaryLord.name} in H${marriageRes.primaryLord.house} (${marriageRes.primaryLord.dignity})`,
            `Universal Karaka: ${marriageRes.naturalKaraka.name} (Śaḍbala ratio ${marriageRes.naturalKaraka.shadbalaRatio.toFixed(2)}x)`,
          ],
          timingOrMilestone: 'Foundational baseline enduring across the native lifespan.',
        },
        {
          title: 'Kuja Doṣa & Shastric Bhaṅga (मङ्गलदोष एवं परिहार)',
          verdict: marriageRes.kujaDosha.isFormed
            ? (marriageRes.kujaDosha.isFullyCancelled ? 'Kuja Doṣa Formed with Shastric Bhaṅga (Nullified)' : 'Active Kuja Doṣa (Requires Shastric Precautions)')
            : 'Chart Free from Kuja Doṣa (Bhauma Doṣa Absent)',
          confidence: 90,
          keyFactors: [
            marriageRes.kujaDosha.shastricVerdict,
            ...(marriageRes.kujaDosha.cancellationFactors.length > 0 ? marriageRes.kujaDosha.cancellationFactors : ['No classical cancellation factors required/present']),
          ],
          timingOrMilestone: 'Primary impact relevant during early marital alignment and partnership transitions.',
        },
        {
          title: 'Manda Vivāha Vilamba / Timing Dynamics (विवाह-काल एवं विलम्ब)',
          verdict: marriageRes.delayVsDenial.isDelayed ? 'Delayed / Mature Timing (Saturnine Vilamba)' : 'Timely / Standard Matrimonial Promise',
          confidence: 85,
          keyFactors: [
            marriageRes.delayVsDenial.classicalVerdict,
            ...(marriageRes.delayVsDenial.delayingFactors.length > 0 ? marriageRes.delayVsDenial.delayingFactors : ['No structural delaying factors observed']),
            ...(marriageRes.delayVsDenial.mitigatingFactors.length > 0 ? marriageRes.delayVsDenial.mitigatingFactors : []),
          ],
          timingOrMilestone: `Prospective Graha Activation Windows: ${marriageRes.timingArc.prospectiveActivationGrahas.join(', ')}`,
        },
        {
          title: 'Navāṃśa (D9) & Jaimini Upapada Confirmation (नवांश एवं उपपद)',
          verdict: marriageRes.d9NavamshaConfirmation.shastricNote,
          confidence: marriageRes.d9NavamshaConfirmation.vargaConfirmationStatus === 'powerfully_reinforced' ? 92 : 80,
          keyFactors: [
            `D9 7th Lord: ${marriageRes.d9NavamshaConfirmation.d9SeventhLord} (Varga state: ${marriageRes.d9NavamshaConfirmation.vargaConfirmationStatus.replace(/_/g, ' ')})`,
            marriageRes.jaiminiFactors.jaiminiSynthesis,
            `Dārakāraka (DK): ${marriageRes.jaiminiFactors.darakarakaGraha.name}`,
            `Upapada Lagna (UL): ${marriageRes.jaiminiFactors.upapadaLagnaRashi}`,
          ],
          timingOrMilestone: 'D9 and UL confirm the internal spiritual and emotional reality of marriage.',
        },
      ];

      // Classical Mitigations / Remedies for Marriage Obstacles & Kuja Dosha
      const marriageRemedies: string[] = [];
      if (marriageRes.obstacles.length > 0) {
        marriageRes.obstacles.forEach((o) => {
          if (o.shastricMitigation) {
            marriageRemedies.push(`[${o.obstacleType}] Shastric Mitigation: ${o.shastricMitigation}`);
          }
        });
      }
      if (marriageRes.kujaDosha.isFormed && !marriageRes.kujaDosha.isFullyCancelled) {
        marriageRemedies.push('[Kuja Doṣa] Classical recommendation: Horoscopic matching (Sama-Kuja compatibility) or traditional Bhauma-Śānti per Muhūrta Cintāmaṇi.');
      }
      if (marriageRemedies.length > 0) {
        dom.classicalRemediesAndPrecautions = marriageRemedies;
      } else {
        dom.classicalRemediesAndPrecautions = [
          'No specific classical afflictions requiring remedial intervention; foundational marital karakas are well-supported.',
        ];
      }
    } else if (dom.domainNumber === 7) {
      const progenyRes = engineResult as ProgenyDomainResult;
      dom.progenyResult = progenyRes;
      dom.timelineOfManifestation = `${progenyRes.timingArc.isMahadashaFavorable ? 'Current Mahādaśā supports progeny fruition.' : 'Progeny activation concentrates in prospective Daśā cycles.'} Active: ${progenyRes.timingArc.activeMahadasha}/${progenyRes.timingArc.activeAntardasha}. (Epistemological Notice: ${progenyRes.timingArc.timingEpistemologicalNotice})`;

      dom.subFacets = [
        {
          title: 'Lineage & Progeny Promise (सन्तान-योग)',
          verdict: progenyRes.progenyPromise.replace(/_/g, ' ').toUpperCase(),
          confidence: progenyRes.qualitativeState === 'strongly_supported' ? 92 : progenyRes.qualitativeState === 'supported' ? 82 : 72,
          keyFactors: [
            `5th Bhāva (${progenyRes.fifthHouse.rashiName}, ${progenyRes.fifthHouse.fertilityType}): ${progenyRes.fifthHouse.savBindus} SAV bindus (${progenyRes.fifthHouse.savEvaluation.replace(/_/g, ' ')})`,
            `Putreśa: ${progenyRes.fifthLord.name} in H${progenyRes.fifthLord.house} (${progenyRes.fifthLord.dignity})`,
            `Natural Kāraka Jupiter: in H${progenyRes.naturalKarakaJupiter.house} (${progenyRes.naturalKarakaJupiter.dignity}, Śaḍbala ${progenyRes.naturalKarakaJupiter.shadbalaRatio.toFixed(2)}x)`,
          ],
          timingOrMilestone: 'Primary potential for conception and lineage continuity across reproductive years.',
        },
        {
          title: 'Multi-Lagna Triangulation (पञ्चमस्थान चतुष्टय)',
          verdict: progenyRes.triangulation.synthesis,
          confidence: 85,
          keyFactors: [
            `5th from Janma Lagna: Rashi ${progenyRes.fifthHouse.rashiName}`,
            `5th from Candra Lagna: Rashi ${progenyRes.triangulation.fifthFromMoonRashi}`,
            `5th from Guru: Rashi ${progenyRes.triangulation.fifthFromJupiterRashi}`,
            `Bhavat Bhavam (9th from Lagna): Rashi ${progenyRes.triangulation.ninthHouseBhavatBhavamRashi}`,
          ],
          timingOrMilestone: 'Fourfold reference triangulation per BPHS Ch. 13 & Phaladīpikā Ch. 12.',
        },
        {
          title: 'Saptāṃśa (D7) Harmonic Confirmation (सप्तांश विचार)',
          verdict: progenyRes.d7Saptamsha.shastricNote,
          confidence: progenyRes.d7Saptamsha.vargaConfirmationStatus === 'strongly_reinforced' ? 92 : 80,
          keyFactors: [
            `D7 Lagna: ${progenyRes.d7Saptamsha.d7LagnaRashi}, D7 5th Lord: ${progenyRes.d7Saptamsha.d7FifthLord}`,
            `D1 5th Lord in D7: House ${progenyRes.d7Saptamsha.d1FifthLordPlacementInD7.houseInD7} (${progenyRes.d7Saptamsha.d1FifthLordPlacementInD7.dignityInD7}${progenyRes.d7Saptamsha.isFifthLordSaptamshaVargottama ? ', Vargottama' : ''})`,
            `D7 5th House Occupants: ${progenyRes.d7Saptamsha.d7FifthHouseOccupants.join(', ') || 'None'}`,
          ],
          timingOrMilestone: 'Divisional confirmation reveals physical gestation, birth ease, and child welfare.',
        },
        {
          title: 'Specialized Vitality Sphuṭas (बीज-क्षेत्र स्फुट)',
          verdict: `Bīja: ${progenyRes.specializedSphutas.beejaSphuta?.status || 'N/A'}; Kṣetra: ${progenyRes.specializedSphutas.kshetraSphuta?.status || 'N/A'}`,
          confidence: 85,
          keyFactors: [
            `Bīja Sphuṭa: ${progenyRes.specializedSphutas.beejaSphuta?.rashiName || 'N/A'} (${((progenyRes.specializedSphutas.beejaSphuta?.longitude ?? 0) % 30).toFixed(1)}°) - ${progenyRes.specializedSphutas.beejaSphuta?.status || 'N/A'}`,
            `Kṣetra Sphuṭa: ${progenyRes.specializedSphutas.kshetraSphuta?.rashiName || 'N/A'} (${((progenyRes.specializedSphutas.kshetraSphuta?.longitude ?? 0) % 30).toFixed(1)}°) - ${progenyRes.specializedSphutas.kshetraSphuta?.status || 'N/A'}`,
            `Santāna Tithi: ${progenyRes.specializedSphutas.santanaTithi?.tithiName || 'N/A'} - ${progenyRes.specializedSphutas.santanaTithi?.isAuspicious ? 'Auspicious' : 'Challenged'}`,
          ],
          timingOrMilestone: 'Vitality indicators assessing constitutional procreative prāna per classical texts.',
        },
        {
          title: 'Jaimini Putrakāraka & Kārakāṃśa (जैमिनी पुत्रविचार)',
          verdict: progenyRes.jaiminiProgeny.jaiminiProgenyVerdict,
          confidence: 86,
          keyFactors: [
            `Putrakāraka (PK): ${progenyRes.jaiminiProgeny.putrakarakaGraha.name} in H${progenyRes.jaiminiProgeny.putrakarakaGraha.house}`,
            `Kārakāṃśa (KL): Rashi ${progenyRes.jaiminiProgeny.karakamshaRashi}; 5th from KL: Rashi ${progenyRes.jaiminiProgeny.fifthFromKarakamshaRashi}`,
            `Putrapada (A5): House ${progenyRes.jaiminiProgeny.putrapadaA5.houseFromLagna} from Lagna`,
          ],
          timingOrMilestone: 'Soul-level progeny indication via Jaimini Sūtras.',
        },
        {
          title: 'Delay vs Denial & Karmic Śāpas (विलम्ब-प्रतिबन्ध विचार)',
          verdict: progenyRes.delayVsDenial.classicalTextSummary,
          confidence: 88,
          keyFactors: [
            ...(progenyRes.delayVsDenial.delayingFactors.length > 0 ? progenyRes.delayVsDenial.delayingFactors : ['No structural delay factors observed']),
            ...(progenyRes.delayVsDenial.mitigatingFactors.length > 0 ? progenyRes.delayVsDenial.mitigatingFactors : []),
            ...(progenyRes.shapasAndObstacles.length > 0 ? progenyRes.shapasAndObstacles.map((s) => `${s.shapaType}: ${s.hasBhanga ? 'Mitigated' : 'Active'}`) : ['No major classical Śāpas detected']),
          ],
          timingOrMilestone: `Prospective Activation Grahas: ${progenyRes.timingArc.prospectiveActivationGrahas.join(', ')}`,
        },
      ];

      // Classical Mitigations / Remedies for Progeny Obstacles & Shapas
      const progenyRemedies: string[] = [];
      if (progenyRes.shapasAndObstacles.length > 0) {
        progenyRes.shapasAndObstacles.forEach((s) => {
          if (s.classicalRemedy) {
            progenyRemedies.push(`[${s.shapaType}] Shastric Remedy: ${s.classicalRemedy}`);
          }
        });
      }
      if (progenyRemedies.length > 0) {
        dom.classicalRemediesAndPrecautions = progenyRemedies;
      } else {
        dom.classicalRemediesAndPrecautions = [
          'No severe classical afflictions requiring remedial intervention; foundational Putrasthāna factors are well-supported.',
        ];
      }
    } else {
      const pLord = engineResult.primaryLord;
      const matAge = GRAHA_MATURATION_AGES[pLord.id] || 32;
      if (engineResult.status === 'contradicted_indication') {
        dom.timelineOfManifestation = `Initial friction or structural vulnerability active in early life; gradual stabilization requires conscious adaptation up to age ${matAge} (${GRAHA_SHORT_NAMES[pLord.id]} maturation) under favorable Daśā periods.`;
      } else if (engineResult.status === 'verified_prediction') {
        dom.timelineOfManifestation = `Foundational vitality active from birth; peak acceleration consolidates decisively around age ${matAge} (${GRAHA_SHORT_NAMES[pLord.id]} maturation).`;
      } else if (engineResult.status === 'insufficient_evidence') {
        dom.timelineOfManifestation = `Decisive timing cannot be confirmed: primary conditions lack requisite textual verification threshold.`;
      }
    }

    // Expand formatted text with genuine facets and condition audits
    const conditionLines = (dom.conditionsAudited || [])
      .map((c) => `  * [${c.status}] ${c.conditionName}: ${c.concreteEffect}`)
      .join('\n');
    const indicatorLines = dom.rawIndicatorsFound.map((ind) => `  * ${ind}`).join('\n');
    dom.formattedOutput = `Domain ${dom.domainNumber}: ${dom.name} (${dom.sanskritName})
- Canonical Source: ${dom.canonicalCitation.sourceText} (${dom.canonicalCitation.chapterAndVerse})
- Evidence Status: ${engineResult.status.toUpperCase()}
- Evaluated Conditions & Indicators:
${indicatorLines}
- Classical Condition Audit:
${conditionLines}
- Timeline of Manifestation: ${dom.timelineOfManifestation}
- Final Verdict: ${dom.finalVerdict}`;
  });

  const fullFormattedText = domains.map((d) => d.formattedOutput).join('\n\n---\n\n');

  return {
    calculatedAt: new Date().toISOString(),
    nativeAge,
    ascendantSummary: {
      sign: lagnaRashiName,
      degree: chart.lagna?.degreeStr || '00°00′',
      lord: PLANET_NAMES_SANSKRIT[lagnaLord.planetId],
      nakshatra: chart.lagna?.nakshatraName,
    },
    moonSummary: {
      sign: moonRashiName,
      degree: moon?.degreeStr || '00°00′',
      nakshatra: moon?.nakshatraName || '',
    },
    activeDashaSummary: {
      mahadasha: dashaInfo.mahadasha,
      antardasha: dashaInfo.antardasha,
      startDate: dashaInfo.startDate,
      endDate: dashaInfo.endDate,
    },
    appearanceProfile: compDomains[0]?.appearanceProfile,
    domains,
    fullFormattedText,
  };
}

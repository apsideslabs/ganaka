/**
 * Gaṇaka — Classical Chart Indications Shared Calculation Utilities
 * Multi-factor verification helpers across Parāśara, Jaimini, Varāhamihira, and Aṣṭakavarga.
 */

import {
  JyotishaChart,
  PlanetId,
  VargaId,
  RashiNumber,
  DignityType,
} from '../types';
import { CalculatedFact, FactCategory } from './types';

export const RASHI_NAMES: Record<number, string> = {
  1: 'Meṣa (Aries)',
  2: 'Vṛṣabha (Taurus)',
  3: 'Mithuna (Gemini)',
  4: 'Karka (Cancer)',
  5: 'Siṃha (Leo)',
  6: 'Kanyā (Virgo)',
  7: 'Tulā (Libra)',
  8: 'Vṛścika (Scorpio)',
  9: 'Dhanu (Sagittarius)',
  10: 'Makara (Capricorn)',
  11: 'Kumbha (Aquarius)',
  12: 'Mīna (Pisces)',
};

export const RASHI_LORDS: Record<number, PlanetId> = {
  1: 'mars',
  2: 'venus',
  3: 'mercury',
  4: 'moon',
  5: 'sun',
  6: 'mercury',
  7: 'venus',
  8: 'mars',
  9: 'jupiter',
  10: 'saturn',
  11: 'saturn',
  12: 'jupiter',
};

export const NATURAL_BENEFICS: PlanetId[] = ['jupiter', 'venus', 'mercury', 'moon'];
export const NATURAL_MALEFICS: PlanetId[] = ['saturn', 'mars', 'sun', 'rahu', 'ketu'];

export const GRAHA_SANSKRIT_NAMES: Record<PlanetId, string> = {
  sun: 'Sūrya (सूर्य)',
  moon: 'Candra (चन्द्र)',
  mars: 'Maṅgala (मङ्गल)',
  mercury: 'Budha (बुध)',
  jupiter: 'Guru (गुरु)',
  venus: 'Śukra (शुक्र)',
  saturn: 'Śani (शनि)',
  rahu: 'Rāhu (राहु)',
  ketu: 'Ketu (केतु)',
  true_rahu: 'True Rāhu (सत्य राहु)',
  true_ketu: 'True Ketu (सत्य केतु)',
};

/**
 * Get Lagna Rashi Number safely
 */
export function getLagnaRashiNumber(chart: JyotishaChart): RashiNumber {
  return chart.lagna?.rashiNumber || 1;
}

/**
 * Get the lord of a given house number (1-12) based on the Lagna sign
 */
export function getHouseLord(chart: JyotishaChart, houseNum: number): { id: PlanetId; name: string } {
  const lagnaRashiNum = getLagnaRashiNumber(chart);
  const houseRashiNum = (((lagnaRashiNum - 1) + (houseNum - 1)) % 12) + 1;
  const lordId = RASHI_LORDS[houseRashiNum];
  return {
    id: lordId,
    name: GRAHA_SANSKRIT_NAMES[lordId] || lordId,
  };
}

/**
 * Get all planets occupying a given house (1-12)
 */
export function getHouseOccupants(chart: JyotishaChart, houseNum: number): PlanetId[] {
  const occupants: PlanetId[] = [];
  const planetKeys = Object.keys(chart.planets) as PlanetId[];
  for (const p of planetKeys) {
    if (chart.planets[p]?.house === houseNum) {
      occupants.push(p);
    }
  }
  return occupants;
}

/**
 * Check if a planet is in dignity (Exalted, Moolatrikona, Own Sign)
 */
export function isPlanetStrongInDignity(chart: JyotishaChart, planetId: PlanetId): boolean {
  const p = chart.planets[planetId];
  if (!p) return false;
  const d = p.dignity || '';
  return (
    d.startsWith('Exalted') ||
    d === 'Moolatrikona' ||
    d.startsWith('Own Sign') ||
    d.startsWith('Great Friend')
  );
}

/**
 * Check if a planet is combust or debilitated
 */
export function isPlanetAfflicted(chart: JyotishaChart, planetId: PlanetId): boolean {
  const p = chart.planets[planetId];
  if (!p) return false;
  const d = p.dignity || '';
  return p.isCombust || d.startsWith('Debilitated');
}

/**
 * Get Shadbala ratio for a planet (>= 1.0 is considered strong by Parashara)
 */
export function getShadbalaRatio(chart: JyotishaChart, planetId: PlanetId): number {
  const sb = chart.shadbala?.[planetId];
  if (sb?.ratio !== undefined) return sb.ratio;
  if (sb?.totalRupas && sb?.requiredRupas) return sb.totalRupas / sb.requiredRupas;
  return 1.0;
}

/**
 * Classical BPHS Dynamic House-to-Sign SAV Mapping Result
 */
export interface DynamicHouseSAVResult {
  // 1-indexed house number (1..12) -> SAV bindus
  houseSAV: Record<number, number>;
  // 1-indexed house number (1..12) -> occupying Rāśi number (1..12)
  signByHouse: Record<number, number>;
  // Strongest house by SAV bindus
  strongestHouse: { houseNum: number; rashiNum: number; bindus: number };
  // Weakest house by SAV bindus
  weakestHouse: { houseNum: number; rashiNum: number; bindus: number };
  // House structural totals
  kendraTotal: number; // Houses 1, 4, 7, 10
  trikonaTotal: number; // Houses 1, 5, 9
  dusthanaTotal: number; // Houses 6, 8, 12
  upachayaTotal: number; // Houses 3, 6, 10, 11
  labhaVyayaBalance: number; // H11 - H12
}

/**
 * Dynamic House-to-Sign SAV Mapping Engine (Prediction Layer)
 * 
 * Per BPHS & classical Parāśari doctrine:
 * The Sarvāṣṭakavarga (SAV) matrix is strictly rāśi-based (Aries=1 through Pisces=12).
 * The Prediction Layer must dynamically map sign-based SAV → house-based SAV according to Janma Lagna:
 * signIndex = ((ascendantSignIndex + houseNumber - 2) % 12) + 1
 * houseSAV[houseNumber] = signSAV[signIndex]
 */
export function getDynamicHouseSAV(chart: JyotishaChart): DynamicHouseSAVResult {
  const ascendantSignIndex = getLagnaRashiNumber(chart);
  const houseSAV: Record<number, number> = {};
  const signByHouse: Record<number, number> = {};
  const rawSAV = chart.ashtakavarga?.sav?.bindusByRashi;

  for (let houseNumber = 1; houseNumber <= 12; houseNumber++) {
    const signIndex = (((ascendantSignIndex + houseNumber - 2) % 12) + 1);
    signByHouse[houseNumber] = signIndex;
    houseSAV[houseNumber] = rawSAV ? (rawSAV[signIndex - 1] ?? 28) : 28;
  }

  let strongest = { houseNum: 1, rashiNum: signByHouse[1], bindus: houseSAV[1] };
  let weakest = { houseNum: 1, rashiNum: signByHouse[1], bindus: houseSAV[1] };

  for (let h = 1; h <= 12; h++) {
    const pts = houseSAV[h];
    if (pts > strongest.bindus) {
      strongest = { houseNum: h, rashiNum: signByHouse[h], bindus: pts };
    }
    if (pts < weakest.bindus) {
      weakest = { houseNum: h, rashiNum: signByHouse[h], bindus: pts };
    }
  }

  return {
    houseSAV,
    signByHouse,
    strongestHouse: strongest,
    weakestHouse: weakest,
    kendraTotal: houseSAV[1] + houseSAV[4] + houseSAV[7] + houseSAV[10],
    trikonaTotal: houseSAV[1] + houseSAV[5] + houseSAV[9],
    dusthanaTotal: houseSAV[6] + houseSAV[8] + houseSAV[12],
    upachayaTotal: houseSAV[3] + houseSAV[6] + houseSAV[10] + houseSAV[11],
    labhaVyayaBalance: houseSAV[11] - houseSAV[12],
  };
}

/**
 * Sarvāṣṭakavarga (SAV) Architectural Doctrine:
 * D1 Sarvāṣṭakavarga (SAV) is strictly a D1/Rāśi dataset (337 bindus across Aries..Pisces).
 * It is dynamically converted from sign-based SAV to house-based SAV ONLY according to the
 * D1 Janma Lagna (Natal Ascendant).
 * CRITICAL MANDATE: D1 SAV must NEVER be converted into a divisional-chart SAV by using another
 * Varga's Lagna (such as D9 Navāṃśa Lagna or D10 Daśāṃśa Lagna).
 */

/**
 * Get Ashtakavarga SAV bindus for a house (1-12) via dynamic Lagna mapping:
 * signIndex = ((ascendantSignIndex + houseNumber - 2) % 12) + 1
 * houseSAV[houseNumber] = signSAV[signIndex]
 * Uses strictly D1 Janma Lagna.
 */
export function getHouseSAVBindus(chart: JyotishaChart, houseNum: number): number {
  if (!chart.ashtakavarga?.sav?.bindusByRashi) return 28;
  const ascendantSignIndex = getLagnaRashiNumber(chart);
  const signIndex = (((ascendantSignIndex + houseNum - 2) % 12) + 1);
  return chart.ashtakavarga.sav.bindusByRashi[signIndex - 1] ?? 28;
}

/**
 * Get Varga Placement of a planet in a specific divisional chart (e.g. D9, D10, D7)
 */
export function getVargaPlacement(
  chart: JyotishaChart,
  planetId: PlanetId,
  vargaId: VargaId
): { rashiNum: number; rashiName: string; house: number } | null {
  const vargaChart = chart.vargas?.[vargaId];
  if (!vargaChart || !vargaChart.planets?.[planetId]) return null;
  const p = vargaChart.planets[planetId];
  return {
    rashiNum: p.rashiNumber,
    rashiName: RASHI_NAMES[p.rashiNumber] || `Rāśi ${p.rashiNumber}`,
    house: p.house,
  };
}

/**
 * Get independent House ↔ Rāśi mapping for a specific Divisional Chart (Varga).
 * Rule: Every divisional chart must maintain its own independent House ↔ Rāśi mapping based on
 * that Varga's Ascendant. Never reuse D1 house mapping for D9, D10, D7, D12, etc.
 */
export function getVargaHouseRashi(chart: JyotishaChart, vargaId: VargaId, houseNum: number): RashiNumber | null {
  const vargaChart = chart.vargas?.[vargaId];
  if (!vargaChart) return null;
  return ((((vargaChart.lagnaRashi - 1) + (houseNum - 1)) % 12) + 1) as RashiNumber;
}

/**
 * Get the independent House Lord (Bhāveśa) for a specific house in a Divisional Chart.
 * Calculated strictly from that Varga's own Ascendant and resulting sign ruler.
 */
export function getVargaHouseLord(chart: JyotishaChart, vargaId: VargaId, houseNum: number): {
  id: PlanetId;
  name: string;
  rashiNumber: RashiNumber;
  placementInVarga?: { rashiNumber: RashiNumber; house: number };
} | null {
  const vargaChart = chart.vargas?.[vargaId];
  if (!vargaChart) return null;
  const houseRashi = ((((vargaChart.lagnaRashi - 1) + (houseNum - 1)) % 12) + 1) as RashiNumber;
  const lordId = RASHI_LORDS[houseRashi];
  const lordPlacement = vargaChart.planets?.[lordId];
  return {
    id: lordId,
    name: GRAHA_SANSKRIT_NAMES[lordId] || lordId,
    rashiNumber: houseRashi,
    placementInVarga: lordPlacement
      ? {
          rashiNumber: lordPlacement.rashiNumber,
          house: lordPlacement.house,
        }
      : undefined,
  };
}

/**
 * Get all planets occupying a specific house in a Divisional Chart (Varga)
 * based strictly on that Varga's Ascendant.
 */
export function getVargaHouseOccupants(chart: JyotishaChart, vargaId: VargaId, houseNum: number): PlanetId[] {
  const vargaChart = chart.vargas?.[vargaId];
  if (!vargaChart || !vargaChart.planets) return [];
  const occupants: PlanetId[] = [];
  for (const [pId, pData] of Object.entries(vargaChart.planets)) {
    if (pData.house === houseNum) {
      occupants.push(pId as PlanetId);
    }
  }
  return occupants;
}

/**
 * Check if a planet or Lagna is Vargottama (same sign in D-1 and D-9)
 */
export function isVargottama(chart: JyotishaChart, planetId: PlanetId | 'lagna'): boolean {
  if (planetId === 'lagna') {
    const d1Rashi = getLagnaRashiNumber(chart);
    const d9Rashi = chart.vargas?.D9?.lagnaRashi;
    return d1Rashi === d9Rashi;
  }
  if (chart.vargottamaPlanets?.includes(planetId)) return true;
  const d1P = chart.planets[planetId];
  const d9P = chart.vargas?.D9?.planets?.[planetId];
  if (!d1P || !d9P) return false;
  return d1P.rashiNumber === d9P.rashiNumber;
}

/**
 * Look up Jaimini Chara Karaka planet
 */
export function getCharaKarakaPlanet(
  chart: JyotishaChart,
  karakaKey: 'AK' | 'AmK' | 'BK' | 'MK' | 'PiK' | 'PK' | 'GK' | 'DK'
): PlanetId {
  const karaka = chart.jaimini?.charaKarakas?.find((k) => k.karakaKey === karakaKey);
  if (karaka?.planet) return karaka.planet;
  if (karakaKey === 'AK') return 'sun';
  if (karakaKey === 'AmK') return 'mercury';
  if (karakaKey === 'DK') return 'venus';
  return 'jupiter';
}

/**
 * Calculate Jaimini Arudha Lagna (AL) or Upapada Lagna (UL) sign number
 */
export function calculateArudhaSign(chart: JyotishaChart, houseNum: number): number {
  const lagnaRashiNum = getLagnaRashiNumber(chart);
  const targetHouseRashi = (((lagnaRashiNum - 1) + (houseNum - 1)) % 12) + 1;
  const lordId = RASHI_LORDS[targetHouseRashi];
  const lordRashiNum = chart.planets[lordId]?.rashiNumber || targetHouseRashi;
  
  // Distance from house to its lord
  const dist = ((lordRashiNum - targetHouseRashi + 12) % 12);
  let arudhaRashi = (((lordRashiNum - 1) + dist) % 12) + 1;
  
  // Classical Parāśari exception: If Arudha falls in the same house or 7th from it, take 10th from it
  if (arudhaRashi === targetHouseRashi || arudhaRashi === (((targetHouseRashi - 1) + 6) % 12) + 1) {
    arudhaRashi = (((arudhaRashi - 1) + 9) % 12) + 1;
  }
  
  return arudhaRashi;
}

/**
 * Fact Builder helper
 */
export function makeFact(
  id: string,
  category: FactCategory,
  label: string,
  value: string,
  significance: string,
  tone: 'favorable' | 'limiting' | 'neutral' = 'neutral'
): CalculatedFact {
  return {
    id,
    category,
    label,
    value,
    significance,
    isFavorable: tone === 'favorable',
    neutralOrMixed: tone === 'neutral',
  };
}

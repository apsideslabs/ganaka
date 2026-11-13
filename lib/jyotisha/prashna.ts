/**
 * Gaṇaka — Prasna Marga: the horary chart.
 *
 * A prasna is cast for the moment the question is put, not for a birth. The
 * text names six things to study (8.1): the arudha, the lagna, the lagna's
 * navāṃśa, the chhatra, the sign of the body part the asker touched, and the
 * sign holding the Moon.
 *
 * Of those, three are computable from the moment alone:
 *
 *   ARUDHA (5.7–11) — the sign answering to the direction the questioner faces.
 *     Aries and Taurus east, Gemini south-east, Cancer and Leo south, Virgo
 *     south-west, Libra and Scorpio west, Sagittarius north-west, Capricorn and
 *     Aquarius north, Pisces north-east.
 *
 *   TRISPHUTA (5.17) — lagna + Moon + Māndi. Adding the Sun gives the
 *     catusphuṭa, and Rāhu on top of that the pañcasphuṭa.
 *
 *   PRĀṆA / DEHA / MṚTYU (5.19–20) — the life, body and death points, built
 *     from the same three bodies.
 *
 * The chhatra and the touched body-part sign depend on the sitting and cannot
 * be derived from an ephemeris, so they are left to the astrologer.
 */
import type { JyotishaChart, RashiNumber } from './types';
import { RASHIS } from './constants';

/** The eight directions and the signs the text assigns to each (Prasna Marga 5.7). */
export const DIRECTION_SIGNS: Array<{ direction: string; sanskrit: string; signs: RashiNumber[] }> = [
  { direction: 'East', sanskrit: 'Pūrva', signs: [1, 2] },        // Meṣa, Vṛṣabha
  { direction: 'South-East', sanskrit: 'Āgneya', signs: [3] },     // Mithuna
  { direction: 'South', sanskrit: 'Dakṣiṇa', signs: [4, 5] },      // Karka, Siṃha
  { direction: 'South-West', sanskrit: 'Nairṛtya', signs: [6] },   // Kanyā
  { direction: 'West', sanskrit: 'Paścima', signs: [7, 8] },       // Tulā, Vṛścika
  { direction: 'North-West', sanskrit: 'Vāyavya', signs: [9] },    // Dhanu
  { direction: 'North', sanskrit: 'Uttara', signs: [10, 11] },     // Makara, Kumbha
  { direction: 'North-East', sanskrit: 'Īśāna', signs: [12] },     // Mīna
];

/** Resolve the arudha from the direction the questioner faces. */
export function arudhaFromDirection(direction: string): RashiNumber | null {
  const key = direction.trim().toLowerCase().replace(/[\s_-]/g, '');
  for (const d of DIRECTION_SIGNS) {
    if (d.direction.toLowerCase().replace(/[\s_-]/g, '') === key) return d.signs[0];
    if (d.sanskrit.toLowerCase() === key) return d.signs[0];
  }
  return null;
}

export interface SphutaPoint {
  key: string;
  name: string;
  sanskritName: string;
  longitude: number;
  rashiNumber: RashiNumber;
  rashiName: string;
  degreeStr: string;
}

export interface PrashnaResult {
  /** The chart cast for the moment of the question. */
  chart: JyotishaChart;
  arudha: {
    direction: string;
    rashiNumber: RashiNumber;
    rashiName: string;
  } | null;
  trisphuta: SphutaPoint;
  chatusphuta: SphutaPoint;
  panchasphuta: SphutaPoint;
  pranaSphuta: SphutaPoint;
  dehaSphuta: SphutaPoint;
  mrityuSphuta: SphutaPoint;
  /** The six things Prasna Marga 8.1 says to study, as far as computable. */
  sixFactors: Array<{ name: string; value: string; computable: boolean }>;
}

function norm(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function makePoint(key: string, name: string, sanskritName: string, longitude: number): SphutaPoint {
  const lon = norm(longitude);
  const rashiNumber = (Math.floor(lon / 30) + 1) as RashiNumber;
  const degIn = lon % 30;
  const d = Math.floor(degIn);
  const m = Math.floor((degIn - d) * 60);
  return {
    key,
    name,
    sanskritName,
    longitude: lon,
    rashiNumber,
    rashiName: RASHIS[rashiNumber]?.name ?? '',
    degreeStr: `${d}°${String(m).padStart(2, '0')}′ ${RASHIS[rashiNumber]?.sanskritName ?? ''}`,
  };
}

/**
 * Build the prasna sphuṭas from a chart cast at the moment of the question.
 *
 * @param chart       Chart cast for the question moment.
 * @param direction   Compass direction the questioner faced, if known.
 */
export function calculatePrashna(chart: JyotishaChart, direction?: string): PrashnaResult {
  const lagnaLon = chart.lagna.siderealLongitude;
  const moonLon = chart.planets.moon.siderealLongitude;
  const sunLon = chart.planets.sun.siderealLongitude;

  // Māndi — the ascendant-derived upagraha the text uses for the sphuṭas.
  const mandiLon = (chart as any).specialPoints?.mandi
    ? ((chart as any).specialPoints.mandi.rashi - 1) * 30 +
      (chart as any).specialPoints.mandi.degreeInRashi
    : 0;
  const rahuLon = (chart.planets as any)?.rahu?.siderealLongitude ?? 0;

  const trisphutaLon = lagnaLon + moonLon + mandiLon;
  const chatusphutaLon = trisphutaLon + sunLon;
  const panchasphutaLon = chatusphutaLon + rahuLon;

  // Prasna Marga 5.19–20: prāṇa and deha are the lagna and the Moon scaled by
  // fixed multipliers with Māndi added; mṛtyu is Māndi with the Sun.
  const PRANA_MULT = 3;
  const DEHA_MULT = 5;
  const pranaLon = lagnaLon * PRANA_MULT + mandiLon;
  const dehaLon = moonLon * DEHA_MULT + mandiLon;
  const mrityuLon = mandiLon + sunLon;

  const arudhaRashi = direction ? arudhaFromDirection(direction) : null;

  const d9Lagna = (() => {
    const navamsaIndex = Math.floor(((lagnaLon % 30) + 30) % 30 / (30 / 9));
    const startSign = [1, 4, 7, 10].includes(chart.lagna.rashiNumber)
      ? chart.lagna.rashiNumber
      : [2, 5, 8, 11].includes(chart.lagna.rashiNumber)
        ? ((chart.lagna.rashiNumber + 8 - 1) % 12) + 1
        : ((chart.lagna.rashiNumber + 4 - 1) % 12) + 1;
    return (((startSign - 1 + navamsaIndex) % 12) + 1) as RashiNumber;
  })();

  const sixFactors = [
    { name: 'Arudha', value: arudhaRashi ? (RASHIS[arudhaRashi]?.name ?? '') : 'needs the questioner’s direction', computable: !!arudhaRashi },
    { name: 'Lagna', value: `${RASHIS[chart.lagna.rashiNumber]?.name} ${chart.lagna.degreeStr ?? ''}`.trim(), computable: true },
    { name: 'Lagna Navāṃśa', value: RASHIS[d9Lagna]?.name ?? '', computable: true },
    { name: 'Chhatra', value: 'depends on the sitting', computable: false },
    { name: 'Spriṣṭāṅga (touched limb)', value: 'depends on the questioner', computable: false },
    { name: 'Candra Rāśi', value: RASHIS[chart.planets.moon.rashiNumber]?.name ?? '', computable: true },
  ];

  return {
    chart,
    arudha: arudhaRashi
      ? { direction: direction ?? '', rashiNumber: arudhaRashi, rashiName: RASHIS[arudhaRashi]?.name ?? '' }
      : null,
    trisphuta: makePoint('trisphuta', 'Trisphuṭa', 'त्रिस्फुट', trisphutaLon),
    chatusphuta: makePoint('chatusphuta', 'Catuṣphuṭa', 'चतुस्फुट', chatusphutaLon),
    panchasphuta: makePoint('panchasphuta', 'Pañcasphuṭa', 'पञ्चस्फुट', panchasphutaLon),
    pranaSphuta: makePoint('prana', 'Prāṇa Sphuṭa', 'प्राण स्फुट', pranaLon),
    dehaSphuta: makePoint('deha', 'Deha Sphuṭa', 'देह स्फुट', dehaLon),
    mrityuSphuta: makePoint('mrityu', 'Mṛtyu Sphuṭa', 'मृत्यु स्फुट', mrityuLon),
    sixFactors,
  };
}

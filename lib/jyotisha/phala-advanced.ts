/**
 * Gaṇaka — Ishta / Kaṣṭa Phala, motion states, and the progeny sphuṭas.
 *
 * Ishta and Kaṣṭa come from BPHS 28.2–28.6. The verses work in "rashmis":
 *
 *   28.2  Ucca Rashmi — subtract the planet's debilitation point from its
 *         position; if over six signs take it from the circle.
 *   28.4  Cheshta Kendra — for the Sun, the sāyana Sun less three signs; for
 *         the Moon, the Moon less the Sun.
 *   28.6  "Reduce the Ucca and Cheshta rashmis by one each, multiply by ten,
 *         and add them; half of that is Ishta. Kaṣṭa is that subtracted from
 *         sixty."
 *
 * Note what that arithmetic does. A rashmi runs from 1 (at the debilitation
 * point) to 7 (opposite it). Subtracting one gives 0–6; multiplying by ten
 * gives 0–60 virūpas, which is exactly the Ucca Bala and Cheshta Bala the
 * śaḍbala already computes. So Ishta = (Ucca Bala + Cheshta Bala) / 2 and
 * Kaṣṭa = 60 − Ishta, with no approximation introduced.
 */
import type { JyotishaChart, PlanetId, RashiNumber } from './types';
import { GRAHA_PROPERTIES, RASHIS } from './constants';

const TARAS: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

/** Mean sidereal daily motion in degrees, for the motion-state classification. */
const MEAN_DAILY_MOTION: Record<string, number> = {
  sun: 0.9856,
  moon: 13.1764,
  mars: 0.5240,
  mercury: 1.3833,
  jupiter: 0.0831,
  venus: 1.6021,
  saturn: 0.0334,
  rahu: 0.0529,
  ketu: 0.0529,
};

export type MotionState =
  | 'Vakrī (retrograde)'
  | 'Anuvakrī (re-accelerating)'
  | 'Sthambhī (stationary)'
  | 'Mandā (slow)'
  | 'Samā (mean)'
  | 'Aticharā (fast)';

export interface PlanetPhala {
  planet: PlanetId;
  name: string;
  /** Arc from the debilitation point, 0–180°. */
  debilitationArc: number;
  /** Ucca Bala in virūpas, 0–60. */
  uccaBala: number;
  /** Cheshta Bala in virūpas, 0–60, taken from the śaḍbala. */
  chestaBala: number;
  /** (Ucca + Cheshta) / 2, per BPHS 28.6. */
  ishta: number;
  /** 60 − Ishta. */
  kashta: number;
  motionState: MotionState;
  speed: number;
  meanSpeed: number;
  /** speed / mean, above 1.1 is Aticharā. */
  speedRatio: number;
}

export interface ProgenySphuta {
  key: 'bija' | 'kshetra';
  name: string;
  sanskritName: string;
  longitude: number;
  rashiNumber: RashiNumber;
  rashiName: string;
  degreeStr: string;
  /** Beeja wants an odd sign, Kshetra an even one. */
  favourableParity: 'odd' | 'even';
  isFavourable: boolean;
}

export interface PhalaResult {
  planets: Record<string, PlanetPhala>;
  progeny: ProgenySphuta[];
}

/** Normalise an angle difference into 0–180°. */
function arc180(a: number, b: number): number {
  const d = Math.abs(((a - b) % 360 + 360) % 360);
  return d > 180 ? 360 - d : d;
}

/** Classify a planet's motion against its mean speed. */
export function classifyMotion(speed: number, planet: PlanetId): MotionState {
  const mean = MEAN_DAILY_MOTION[planet] ?? 1;
  const ratio = speed / mean;

  if (Math.abs(speed) < mean * 0.02) return 'Sthambhī (stationary)';
  if (speed < 0) return 'Vakrī (retrograde)';
  if (ratio > 1.1) return 'Aticharā (fast)';
  if (ratio <= 0.9) return 'Mandā (slow)';
  return 'Samā (mean)';
}

/**
 * Ishta and Kaṣṭa Phala for the seven tāras, plus the Bīja and Kṣetra sphuṭas.
 */
export function calculatePhala(chart: JyotishaChart): PhalaResult {
  const planets: Record<string, PlanetPhala> = {};

  for (const p of TARAS) {
    const pos: any = (chart.planets as any)?.[p];
    if (!pos) continue;

    const prop = GRAHA_PROPERTIES[p];
    // Debilitation point as an absolute longitude.
    const debilitationLon =
      (prop.debilitationSign - 1) * 30 + prop.debilitationDegree;

    const arc = arc180(pos.siderealLongitude, debilitationLon);
    // Ucca Bala in virūpas: the arc divided by three, as (rashmi − 1) × 10.
    const uccaBala = arc / 3;

    const sb: any = (chart.shadbala as any)?.[p];
    // The rashmi method caps a component at seven, i.e. sixty virūpas. The
    // śaḍbala's own cheṣṭā value is not clamped and can exceed sixty, which
    // would drive Kaṣṭa negative, so clamp it to the range the verse assumes.
    const chestaBala = Math.min(60, Math.max(0, sb?.chestaBala ?? 0));

    const ishta = (uccaBala + chestaBala) / 2;

    const mean = MEAN_DAILY_MOTION[p] ?? 1;
    planets[p] = {
      planet: p,
      name: prop?.name ?? p,
      debilitationArc: arc,
      uccaBala,
      chestaBala,
      ishta,
      kashta: 60 - ishta,
      motionState: classifyMotion(pos.speed ?? 0, p),
      speed: pos.speed ?? 0,
      meanSpeed: mean,
      speedRatio: (pos.speed ?? 0) / mean,
    };
  }

  // Bīja and Kṣetra sphuṭas — BPHS, progeny chapter. Bīja (male) is the sum of
  // the Sun, Venus and Jupiter; Kṣetra (female) the sum of the Moon, Mars and
  // Jupiter. Some recensions give Venus rather than Mars in Kṣetra; the Mars
  // reading is the one followed here.
  const lon = (p: PlanetId) => (chart.planets as any)?.[p]?.siderealLongitude ?? 0;
  const makeSphuta = (
    key: 'bija' | 'kshetra',
    name: string,
    sanskritName: string,
    total: number
  ): ProgenySphuta => {
    const longitude = ((total % 360) + 360) % 360;
    const rashiNumber = (Math.floor(longitude / 30) + 1) as RashiNumber;
    const degIn = longitude % 30;
    const d = Math.floor(degIn);
    const m = Math.floor((degIn - d) * 60);
    return {
      key,
      name,
      sanskritName,
      longitude,
      rashiNumber,
      rashiName: RASHIS[rashiNumber]?.name ?? '',
      degreeStr: `${d}°${String(m).padStart(2, '0')}′ ${RASHIS[rashiNumber]?.sanskritName ?? ''}`,
      favourableParity: key === 'bija' ? 'odd' : 'even',
      isFavourable: key === 'bija' ? rashiNumber % 2 === 1 : rashiNumber % 2 === 0,
    };
  };

  const progeny: ProgenySphuta[] = [
    makeSphuta('bija', 'Bīja Sphuṭa', 'बीज स्फुट', lon('sun') + lon('venus') + lon('jupiter')),
    makeSphuta('kshetra', 'Kṣetra Sphuṭa', 'क्षेत्र स्फुट', lon('moon') + lon('mars') + lon('jupiter')),
  ];

  return { planets, progeny };
}

/**
 * Mṛtyu Bhāga — the fateful degrees.
 *
 * Each graha has one critical degree in each sign. A graha sitting on it has its
 * significations exposed to crisis, interruption or loss — not literal death,
 * which is a reading no table of degrees can deliver on its own.
 *
 * ⚠ THE SOURCES DISAGREE, AND THE DISAGREEMENT IS RECORDED HERE RATHER THAN
 * RESOLVED SILENTLY. The Jātaka Pārijāta and Sarvārtha Cintāmaṇi agree on every
 * graha except the Moon, where they give one sequence and the Phaladīpikā and
 * Bṛhat Prajāpatya give a quite different one. Both are tabulated; the caller
 * picks a recension and the UI states which is in force. Picking one and hiding
 * the other is how a chart ends up "wrong" against the book someone else uses.
 *
 * Orb, from the medical-astrology usage: the Ascendant within 1°, the Sun, Moon
 * and Mercury within 40′, and the rest within 30′.
 */

import type { JyotishaChart, PlanetId, RashiNumber } from './types';
import { GRAHA_PROPERTIES, RASHIS } from './constants';

export type MrityuRecension = 'jataka_parijata' | 'phaladipika';

/** Degrees within each sign, Aries first. */
const TABLE: Record<string, Record<MrityuRecension, number[]>> = {
  ascendant: {
    jataka_parijata: [1, 9, 22, 22, 25, 2, 4, 23, 18, 20, 24, 10],
    phaladipika: [1, 9, 22, 22, 25, 2, 4, 23, 18, 20, 24, 10],
  },
  sun: {
    jataka_parijata: [20, 9, 12, 6, 8, 24, 16, 17, 22, 2, 3, 23],
    phaladipika: [20, 9, 12, 6, 8, 24, 16, 17, 22, 2, 3, 23],
  },
  moon: {
    // The one graha on which the two traditions genuinely part company.
    jataka_parijata: [8, 25, 22, 22, 21, 1, 4, 23, 18, 20, 20, 10],
    phaladipika: [26, 12, 13, 25, 24, 11, 26, 14, 13, 25, 5, 12],
  },
  mars: {
    jataka_parijata: [19, 28, 25, 23, 29, 28, 14, 21, 2, 15, 11, 6],
    phaladipika: [19, 28, 25, 23, 29, 28, 14, 21, 2, 15, 11, 6],
  },
  mercury: {
    jataka_parijata: [15, 14, 13, 12, 8, 18, 20, 10, 21, 22, 7, 5],
    phaladipika: [15, 14, 13, 12, 8, 18, 20, 10, 21, 22, 7, 5],
  },
  jupiter: {
    jataka_parijata: [19, 29, 12, 27, 6, 4, 13, 10, 17, 11, 15, 28],
    phaladipika: [19, 29, 12, 27, 6, 4, 13, 10, 17, 11, 15, 28],
  },
  venus: {
    jataka_parijata: [28, 15, 11, 17, 10, 13, 4, 6, 27, 12, 29, 19],
    phaladipika: [28, 15, 11, 17, 10, 13, 4, 6, 27, 12, 29, 19],
  },
  saturn: {
    jataka_parijata: [10, 4, 7, 9, 12, 16, 3, 18, 28, 14, 13, 15],
    phaladipika: [10, 4, 7, 9, 12, 16, 3, 18, 28, 14, 13, 15],
  },
  rahu: {
    jataka_parijata: [14, 13, 12, 11, 24, 23, 22, 21, 10, 20, 18, 8],
    phaladipika: [14, 13, 12, 11, 24, 23, 22, 21, 10, 20, 18, 8],
  },
  ketu: {
    jataka_parijata: [8, 18, 20, 10, 21, 22, 23, 24, 11, 12, 13, 14],
    phaladipika: [8, 18, 20, 10, 21, 22, 23, 24, 11, 12, 13, 14],
  },
  mandi: {
    jataka_parijata: [23, 24, 11, 12, 13, 14, 8, 18, 20, 10, 21, 22],
    phaladipika: [23, 24, 11, 12, 13, 14, 8, 18, 20, 10, 21, 22],
  },
};

/** Orb in arcminutes, per body. */
const ORB_MINUTES: Record<string, number> = {
  ascendant: 60, sun: 40, moon: 40, mercury: 40,
  mars: 30, jupiter: 30, saturn: 30, rahu: 30, ketu: 30, mandi: 30,
};

export interface MrityuBhagaRow {
  body: string;
  bodyName: string;
  rashi: RashiNumber;
  rashiName: string;
  /** The graha's degree within its sign. */
  degreeInRashi: number;
  /** The fateful degree for this body in this sign. */
  criticalDegree: number;
  /** Signed distance in arcminutes from the critical degree. */
  deltaMinutes: number;
  withinOrb: boolean;
  orbMinutes: number;
}

export interface MrityuBhagaResult {
  recension: MrityuRecension;
  rows: MrityuBhagaRow[];
  /** Only the bodies actually sitting on their degree. */
  affected: MrityuBhagaRow[];
  /** The full table, for display: body → degrees per sign. */
  table: Array<{ body: string; bodyName: string; degrees: number[] }>;
  note: string;
}

const BODY_NAMES: Record<string, string> = {
  ascendant: 'Lagna', sun: 'Sūrya', moon: 'Candra', mars: 'Maṅgala',
  mercury: 'Budha', jupiter: 'Guru', venus: 'Śukra', saturn: 'Śani',
  rahu: 'Rāhu', ketu: 'Ketu', mandi: 'Māndi',
};

const signDelta = (a: number, b: number): number => {
  let d = a - b;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
};

/**
 * Evaluate every graha against its Mṛtyu Bhāga degree.
 */
export function calculateMrityuBhaga(
  chart: JyotishaChart,
  recension: MrityuRecension = 'jataka_parijata'
): MrityuBhagaResult {
  const rows: MrityuBhagaRow[] = [];

  const add = (body: string, rashi: RashiNumber, degreeInRashi: number) => {
    const degrees = TABLE[body]?.[recension];
    if (!degrees || !rashi) return;
    const critical = degrees[rashi - 1];
    if (typeof critical !== 'number') return;

    const deltaDeg = signDelta(degreeInRashi, critical);
    const deltaMinutes = deltaDeg * 60;
    const orb = ORB_MINUTES[body] ?? 30;

    rows.push({
      body,
      bodyName: BODY_NAMES[body] ?? body,
      rashi,
      rashiName: RASHIS[rashi]?.name ?? '',
      degreeInRashi: Number(degreeInRashi.toFixed(4)),
      criticalDegree: critical,
      deltaMinutes: Number(deltaMinutes.toFixed(1)),
      withinOrb: Math.abs(deltaMinutes) <= orb,
      orbMinutes: orb,
    });
  };

  // The Ascendant.
  add('ascendant', chart.lagna.rashiNumber as RashiNumber, chart.lagna.siderealLongitude % 30);

  // The nine grahas.
  for (const id of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'] as PlanetId[]) {
    const p: any = (chart.planets as any)?.[id];
    if (!p || typeof p.siderealLongitude !== 'number') continue;
    add(id, p.rashiNumber as RashiNumber, p.siderealLongitude % 30);
  }

  // Māndi, when the chart carries the upagraha.
  const mandi: any = (chart.specialPoints as any)?.mandi ?? (chart as any).upagrahas?.mandi;
  if (mandi && typeof mandi.siderealLongitude === 'number') {
    add('mandi', (Math.floor(mandi.siderealLongitude / 30) + 1) as RashiNumber, mandi.siderealLongitude % 30);
  }

  const table = Object.keys(TABLE).map((body) => ({
    body,
    bodyName: BODY_NAMES[body] ?? body,
    degrees: TABLE[body][recension],
  }));

  return {
    recension,
    rows,
    affected: rows.filter((r) => r.withinOrb),
    table,
    note:
      'The sources disagree on the Moon: Jātaka Pārijāta gives 8, 25, 22, 22, 21, 1, 4, 23, 18, 20, 20, 10 ' +
      'while Phaladīpikā and Bṛhat Prajāpatya give 26, 12, 13, 25, 24, 11, 26, 14, 13, 25, 5, 12. ' +
      'Every other graha agrees across the traditions. Orbs: Lagna 1°, Sun/Moon/Mercury 40′, the rest 30′. ' +
      'A graha here has its significations exposed to crisis — it is not by itself a prediction of death.',
  };
}

/** The degrees for one body, both recensions, for a comparison view. */
export function mrityuBhagaTable(): Array<{
  body: string;
  bodyName: string;
  jataka: number[];
  phaladipika: number[];
  differs: boolean;
}> {
  return Object.keys(TABLE).map((body) => {
    const a = TABLE[body].jataka_parijata;
    const b = TABLE[body].phaladipika;
    return {
      body,
      bodyName: BODY_NAMES[body] ?? body,
      jataka: a,
      phaladipika: b,
      differs: a.some((v, i) => v !== b[i]),
    };
  });
}

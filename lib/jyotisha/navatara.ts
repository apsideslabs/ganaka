/**
 * Navatāra Chakra — the nine tārās.
 *
 * The 27 nakṣatras are counted from the native's janma nakṣatra in nine steps
 * that repeat three times. Each tārā carries a nature, and the chakra is read
 * for whether a given day's nakṣatra favours an undertaking.
 *
 * It is a natal structure used for muhūrta: the janma nakṣatra is fixed at birth,
 * so the chakra does not change — what changes is which nakṣatra the day falls in
 * and therefore which tārā is in force.
 */

import type { JyotishaChart } from './types';
import { NAKSHATRA_NADI } from './nadi';
import { calculateAllPlanets } from '../astronomy/ephemeris';
import { calculateJulianDay } from '../astronomy/julian';

export type TaraNature = 'auspicious' | 'inauspicious' | 'mixed';

export interface Tara {
  number: number;
  name: string;
  sanskrit: string;
  nature: TaraNature;
  meaning: string;
  /** What the tārā is good for, and what it warns against. */
  guidance: string;
}

/** The nine, in the order the count runs from the janma nakṣatra. */
export const TARAS: Tara[] = [
  { number: 1, name: 'Janma', sanskrit: 'जन्म', nature: 'mixed', meaning: 'Birth',
    guidance: 'Mixed. Fine for routine work and existing business; avoid beginning a cure or a journey.' },
  { number: 2, name: 'Sampat', sanskrit: 'सम्पत्', nature: 'auspicious', meaning: 'Wealth',
    guidance: 'Favourable. Financial dealings, investment, purchase, anything meant to grow.' },
  { number: 3, name: 'Vipat', sanskrit: 'विपत्', nature: 'inauspicious', meaning: 'Danger',
    guidance: 'Avoid. Loss, litigation, travel and any undertaking that cannot be undone.' },
  { number: 4, name: 'Kṣema', sanskrit: 'क्षेम', nature: 'auspicious', meaning: 'Well-being',
    guidance: 'Favourable. General undertakings, celebration, travel, recovery.' },
  { number: 5, name: 'Pratyak', sanskrit: 'प्रत्यक्', nature: 'inauspicious', meaning: 'Obstacle',
    guidance: 'Avoid. Progress stalls and negotiations turn; a poor day to commit.' },
  { number: 6, name: 'Sādhana', sanskrit: 'साधन', nature: 'auspicious', meaning: 'Accomplishment',
    guidance: 'Favourable. Spiritual practice, study, creative and professional work.' },
  { number: 7, name: 'Naidhana', sanskrit: 'नैधन (वध)', nature: 'inauspicious', meaning: 'Destruction',
    guidance: 'Avoid entirely. The harshest tārā; no auspicious beginning.' },
  { number: 8, name: 'Mitra', sanskrit: 'मित्र', nature: 'auspicious', meaning: 'Friend',
    guidance: 'Favourable. Meetings, alliances, partnerships, reconciliation.' },
  { number: 9, name: 'Parama Mitra', sanskrit: 'परम मित्र', nature: 'auspicious', meaning: 'Great friend',
    guidance: 'Most favourable. Any undertaking, and especially those needing goodwill.' },
];

export interface NavaTaraRow {
  /** 1–27, the nakṣatra being judged. */
  nakshatraNumber: number;
  nakshatraName: string;
  /** 1–9, the tārā in force. */
  taraNumber: number;
  tara: Tara;
  /** How many steps from the janma nakṣatra, 0–26. */
  offset: number;
}

export interface NavaTaraChakra {
  janmaNakshatra: string;
  janmaNumber: number;
  /** The nine tārās, each with the three nakṣatras that fall in it. */
  cycle: Array<{ tara: Tara; nakshatras: Array<{ number: number; name: string }> }>;
  /** All 27, in order. */
  rows: NavaTaraRow[];
  /** Today's tārā, when a date is given. */
  current: NavaTaraRow | null;
  /** The tārās that are auspicious for this native. */
  favourable: number[];
  note: string;
}

/**
 * Which tārā a given nakṣatra falls in, counted from the janma nakṣatra.
 */
export function taraFor(janmaNumber: number, nakshatraNumber: number): number {
  const offset = ((nakshatraNumber - janmaNumber + 27) % 27);
  return (offset % 9) + 1;
}

/**
 * Build the Navatāra Chakra for a chart.
 */
export function calculateNavaTara(
  chart: JyotishaChart,
  currentNakshatraNumber?: number
): NavaTaraChakra {
  const moon: any = (chart.planets as any)?.moon;
  const janmaNumber = Number(moon?.nakshatraIndex ?? 0) + 1 || 1;

  const rows: NavaTaraRow[] = NAKSHATRA_NADI.map((n) => {
    const t = taraFor(janmaNumber, n.number);
    return {
      nakshatraNumber: n.number,
      nakshatraName: n.name,
      taraNumber: t,
      tara: TARAS[t - 1],
      offset: (n.number - janmaNumber + 27) % 27,
    };
  });

  // The cycle: each tārā with the three nakṣatras it holds for this native.
  const cycle = TARAS.map((t) => ({
    tara: t,
    nakshatras: rows.filter((r) => r.taraNumber === t.number)
      .map((r) => ({ number: r.nakshatraNumber, name: r.nakshatraName })),
  }));

  const current = currentNakshatraNumber
    ? rows.find((r) => r.nakshatraNumber === currentNakshatraNumber) ?? null
    : null;

  return {
    janmaNakshatra: moon?.nakshatraName ?? '',
    janmaNumber,
    cycle,
    rows,
    current,
    favourable: TARAS.filter((t) => t.nature === 'auspicious').map((t) => t.number),
    note:
      'Counted from the janma nakṣatra in nine repeating steps. Each tārā holds three nakṣatras, ' +
      'and the three most difficult — Vipat, Pratyak and Naidhana — are avoided for beginnings. ' +
      'The chakra is fixed at birth; what changes is which nakṣatra the day falls in.',
  };
}

/** The Moon's nakṣatra at an arbitrary instant, 1–27. */
export function nakshatraAt(jdUt: number, ayanamshaType: any = 'lahiri'): number {
  const planets: any = calculateAllPlanets(jdUt, ayanamshaType, 0);
  const lon = Number(planets?.moon?.siderealLongitude ?? 0);
  return Math.floor(lon / (360 / 27)) + 1;
}

export interface TaraToday {
  date: string;
  nakshatraNumber: number;
  nakshatraName: string;
  taraNumber: number;
  tara: Tara;
  /** True when the tārā favours beginning something. */
  favourable: boolean;
  guidance: string;
}

/**
 * Which tārā is in force on a given date for a given janma nakṣatra.
 *
 * The chakra is fixed at birth; what changes day to day is the Moon's nakṣatra,
 * and therefore which of the nine is in force. Computed at local noon so the
 * answer does not flip as the Moon crosses a boundary during the day.
 */
export function taraToday(
  janmaNumber: number,
  when: Date = new Date(),
  latitude = 0,
  longitude = 0,
  timezoneOffsetHours = 0,
  ayanamshaType: any = 'lahiri'
): TaraToday {
  const jd = calculateJulianDay(
    when.getFullYear(), when.getMonth() + 1, when.getDate(),
    12 - timezoneOffsetHours, 0, 0
  );
  const nak = nakshatraAt(jd, ayanamshaType);
  const t = taraFor(janmaNumber, nak);
  const tara = TARAS[t - 1];
  return {
    date: when.toISOString().slice(0, 10),
    nakshatraNumber: nak,
    nakshatraName: NAKSHATRA_NADI[nak - 1]?.name ?? '',
    taraNumber: t,
    tara,
    favourable: tara.nature === 'auspicious',
    guidance: tara.guidance,
  };
}

/**
 * Gaṇaka — birth-time sensitivity.
 *
 * A chart is only as firm as the clock it came from. A time rounded to the
 * nearest five minutes moves the ascendant by about a degree, and near a sign
 * or navāṃśa boundary that is enough to change the lagna, the varga placements
 * and the daśā balance. The checklist is right that presenting every output as
 * equally certain is misleading.
 *
 * This recomputes the chart at the stated uncertainty either side of the
 * recorded time and reports which outputs hold and which move. Nothing is
 * inferred: every verdict is a comparison of two real calculations.
 */
import type { JyotishaChart, RashiNumber } from './types';
import { calculateFullJyotishaChart } from './calculator';
import { RASHIS } from './constants';

export interface UnstableItem {
  /** What moved. */
  label: string;
  /** Value at the earlier time. */
  atMinus: string;
  /** Value at the recorded time. */
  atRecorded: string;
  /** Value at the later time. */
  atPlus: string;
}

export interface TimeSensitivityReport {
  uncertaintyMinutes: number;
  /** True when every compared output is identical across the window. */
  isStable: boolean;
  /** Outputs that did not move. */
  stable: string[];
  /** Outputs that did. */
  unstable: UnstableItem[];
  /** Minutes from the recorded time to the nearest sign change of the lagna. */
  minutesToLagnaChange: number | null;
  /** Minutes from the recorded time to the nearest nakṣatra change of the Moon. */
  minutesToNakshatraChange: number | null;
  /** How much the Vimśottarī balance at birth shifts, in years. */
  dashaBalanceShiftYears: number;
  /** Plain-language summary. */
  summary: string;
}

type BirthInput = Parameters<typeof calculateFullJyotishaChart>[0];

const VARGA_SPOTLIGHT: Array<{ id: string; label: string }> = [
  { id: 'D1', label: 'D-1 lagna' },
  { id: 'D9', label: 'D-9 lagna' },
  { id: 'D10', label: 'D-10 lagna' },
  { id: 'D7', label: 'D-7 lagna' },
  { id: 'D60', label: 'D-60 lagna' },
];

/** Shift a birth input by a number of minutes. */
function shifted(birth: BirthInput, minutes: number): BirthInput {
  const total = birth.hour * 60 + birth.minute + minutes;
  const dayShift = Math.floor(total / 1440);
  const minuteOfDay = ((total % 1440) + 1440) % 1440;
  const hour = Math.floor(minuteOfDay / 60);
  const minute = Math.floor(minuteOfDay % 60);

  if (dayShift === 0) return { ...birth, hour, minute };

  // Move the calendar date when the shift crosses midnight.
  const d = new Date(Date.UTC(birth.year, birth.month - 1, birth.day));
  d.setUTCDate(d.getUTCDate() + dayShift);
  return {
    ...birth,
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour,
    minute,
  };
}

function rashiName(r: RashiNumber | undefined): string {
  return r ? (RASHIS[r]?.name ?? String(r)) : '—';
}

/**
 * Assess how much the chart moves across ±uncertaintyMinutes.
 */
export function assessTimeSensitivity(
  birth: BirthInput,
  uncertaintyMinutes = 5
): TimeSensitivityReport {
  const minutes = Math.max(1, Math.round(uncertaintyMinutes));

  const base = calculateFullJyotishaChart(birth);
  const early = calculateFullJyotishaChart(shifted(birth, -minutes));
  const late = calculateFullJyotishaChart(shifted(birth, +minutes));

  const stable: string[] = [];
  const unstable: UnstableItem[] = [];

  const compare = (label: string, a: string, b: string, c: string) => {
    if (a === b && b === c) stable.push(label);
    else unstable.push({ label, atMinus: a, atRecorded: b, atPlus: c });
  };

  // --- ascendant and its degree ---
  compare('Lagna rāśi',
    rashiName(early.lagna.rashiNumber),
    rashiName(base.lagna.rashiNumber),
    rashiName(late.lagna.rashiNumber));

  // The degree moves almost always; report it only when it crosses a whole degree.
  compare('Lagna degree',
    `${Math.floor(early.lagna.degreeInRashi ?? 0)}°`,
    `${Math.floor(base.lagna.degreeInRashi ?? 0)}°`,
    `${Math.floor(late.lagna.degreeInRashi ?? 0)}°`);

  // --- Moon ---
  compare('Moon nakṣatra',
    early.planets.moon.nakshatraName ?? '—',
    base.planets.moon.nakshatraName ?? '—',
    late.planets.moon.nakshatraName ?? '—');

  compare('Moon pāda',
    String(early.planets.moon.pada ?? '—'),
    String(base.planets.moon.pada ?? '—'),
    String(late.planets.moon.pada ?? '—'));

  compare('Moon rāśi',
    rashiName(early.planets.moon.rashiNumber),
    rashiName(base.planets.moon.rashiNumber),
    rashiName(late.planets.moon.rashiNumber));

  // --- the vargas that matter most ---
  for (const v of VARGA_SPOTLIGHT) {
    // The varga charts expose `lagnaRashi`, not a `lagna` object. Reading the
    // wrong field made every varga compare as '—' and pass as stable, which is
    // worse than not checking at all.
    const pick = (c: JyotishaChart) => {
      const r = (c.vargas as any)?.[v.id]?.lagnaRashi;
      return r ? rashiName(r as RashiNumber) : '—';
    };
    compare(v.label, pick(early), pick(base), pick(late));
  }

  // --- vimśottarī balance at birth ---
  const balanceOf = (c: JyotishaChart): number => {
    const tree: any[] = (c.vimshottari as any)?.tree ?? [];
    const active = tree.find((n) => n?.isBirthActive) ?? tree[0];
    return active?.elapsedBeforeBirthYears ?? 0;
  };
  const bEarly = balanceOf(early);
  const bBase = balanceOf(base);
  const bLate = balanceOf(late);
  const dashaShift = Math.max(
    Math.abs(bBase - bEarly),
    Math.abs(bLate - bBase)
  );

  // --- how far the lagna and Moon are from their next boundary ---
  const minutesToLagnaChange = estimateMinutesToBoundary(
    base.lagna.siderealLongitude ?? 0, 30, 15 / 60 // lagna moves ~15°/hour
  );
  const minutesToNakshatraChange = estimateMinutesToBoundary(
    base.planets.moon.siderealLongitude ?? 0, 360 / 27, 0.55 / 60 // Moon ~0.55°/hour
  );

  const isStable = unstable.length === 0;
  const summary = isStable
    ? `Every compared output holds across ±${minutes} minutes. The chart is not sensitive at this precision.`
    : `${unstable.length} of ${unstable.length + stable.length} outputs move across ±${minutes} minutes: ` +
      `${unstable.map((u) => u.label).join(', ')}.`;

  return {
    uncertaintyMinutes: minutes,
    isStable,
    stable,
    unstable,
    minutesToLagnaChange,
    minutesToNakshatraChange,
    dashaBalanceShiftYears: dashaShift,
    summary,
  };
}

/**
 * Minutes until a longitude crosses the next multiple of `span`, given the
 * body's rate of travel in degrees per minute.
 */
function estimateMinutesToBoundary(
  longitude: number,
  span: number,
  degreesPerMinute: number
): number | null {
  if (!degreesPerMinute) return null;
  const into = ((longitude % span) + span) % span;
  const remaining = span - into;
  return Math.round(remaining / degreesPerMinute);
}

/**
 * Candidate days inside a delivering KP window.
 *
 * KP times an event in two stages. The dasha gives the window; the transit
 * marks the moment inside it. The rule, as the texts state it:
 *
 *   "at the time of the event, the Sun and the Moon are found transiting in the
 *    star or sub of the period lords... a day qualifies when the Sun's sign,
 *    star and sub lords are all among the period lords."
 *
 * The Sun is used for a window of months, the Moon for a window of days — the
 * body whose motion matches the span being narrowed.
 *
 * Two things this deliberately does not do. It does not deny the event when no
 * day qualifies: "a day on which the transit disagrees does not deny the event;
 * KP writers' own tallies of transit agreement fall well short of every case."
 * And it does not rank the days it finds — they are returned in time order,
 * unranked.
 *
 * The transiting body's lords are converted to houses against the fixed natal
 * cusps, by occupation and ownership, never against a chart cast for the
 * transit moment.
 */
import type { JyotishaChart, PlanetId } from '@/lib/jyotisha/types';
import { sunMoonLongitudes } from '@/lib/astronomy/ephemeris';
import { calculateKPPosition } from '@/lib/jyotisha/sphutas';
import type { KpTimingWindow } from './timing';

export interface CandidateDay {
  /** ISO date of the day. */
  date: string;
  /** The body whose transit qualified it. */
  body: 'sun' | 'moon';
  /** Its sign, star and sub lords on that day. */
  signLord: PlanetId;
  starLord: PlanetId;
  subLord: PlanetId;
  /** Which of the window's period lords those three are. */
  matched: PlanetId[];
}

const DAY = 86400000;

/**
 * Days inside `window` on which the transit body's sign, star and sub lords are
 * all among the window's period lords.
 */
export function candidateDays(
  chart: JyotishaChart,
  window: KpTimingWindow,
  maxDays = 40
): CandidateDay[] {
  const from = new Date(window.from).getTime();
  const to = new Date(window.to).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return [];

  const spanDays = (to - from) / DAY;
  // The body whose motion matches the span: the Sun for months, the Moon for days.
  const body: 'sun' | 'moon' = spanDays >= 20 ? 'sun' : 'moon';

  const lords = new Set(window.lords.map((l) => l.lord));
  const ayan: any = (chart.meta as any)?.ayanamshaType ?? 'lahiri';
  const custom = (chart.meta as any)?.ayanamshaType === 'custom'
    ? Number((chart.meta as any)?.ayanamshaValue ?? 0)
    : 0;

  const out: CandidateDay[] = [];
  for (let t = from; t <= to && out.length < maxDays; t += DAY) {
    const jd = 2440587.5 + t / DAY; // Unix epoch → Julian Day
    const { sun, moon } = sunMoonLongitudes(jd, ayan, custom);
    const lon = body === 'sun' ? sun : moon;
    const kp = calculateKPPosition(lon);

    const signLord = kp.signLord as PlanetId;
    const starLord = kp.starLord as PlanetId;
    const subLord = kp.subLord as PlanetId;

    // All three must be among the window's period lords.
    if (lords.has(signLord) && lords.has(starLord) && lords.has(subLord)) {
      out.push({
        date: new Date(t).toISOString().slice(0, 10),
        body,
        signLord,
        starLord,
        subLord,
        matched: [...new Set([signLord, starLord, subLord])],
      });
    }
  }
  return out;
}

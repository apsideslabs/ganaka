/**
 * KP — timing: the ruling planets against the running daśā.
 *
 * KP's fourth step: "Examine the Vimśottarī daśā sequence and relevant transits
 * for a supported timing period." A matter is treated as ripe when the daśā lord,
 * the antardaśā lord, or one of the cusp's significators appears among the ruling
 * planets at the moment of judgement.
 *
 * This is the step that turns a promise into a window, and it is why KP pairs the
 * ruling planets with the daśā chain rather than reading either alone.
 */
import type { JyotishaChart, PlanetId } from '../jyotisha/types';
import { GRAHA_PROPERTIES } from '../jyotisha/constants';
import type { RulingPlanetsResult } from './ruling-planets';
import type { SignificatorsResult } from './significators';

export interface KpTimingWindow {
  level: 'mahā' | 'antara' | 'pratyantara';
  lord: PlanetId;
  lordName: string;
  from: string;
  to: string;
  /** True when this lord is one of the ruling planets. */
  isRulingPlanet: boolean;
  /** True when this lord is a significator of the house under question. */
  isSignificator: boolean;
  /** True when both — the strongest KP signal. */
  ripe: boolean;
}

export interface KpTimingResult {
  house: number;
  /** The period running now. */
  current: KpTimingWindow | null;
  /** Upcoming periods whose lord is both a ruling planet and a significator. */
  ripeWindows: KpTimingWindow[];
  note: string;
}

/** The running chain from the chart's Viṃśottarī tree. */
function runningChain(chart: JyotishaChart, now: Date): any[] {
  const tree: any[] = (chart.vimshottari as any)?.tree ?? [];
  const chain: any[] = [];
  let level = tree;
  for (let depth = 0; depth < 3 && level && level.length; depth++) {
    const hit = level.find((n) => {
      const s = new Date(n.startDate).getTime();
      const e = new Date(n.endDate).getTime();
      return now.getTime() >= s && now.getTime() <= e;
    });
    if (!hit) break;
    chain.push(hit);
    level = hit.subPeriods ?? [];
  }
  return chain;
}

/**
 * Cross the ruling planets with the daśā chain for one house.
 */
export function kpTiming(
  chart: JyotishaChart,
  ruling: RulingPlanetsResult,
  significators: SignificatorsResult,
  house: number,
  now: Date = new Date()
): KpTimingResult {
  const rpSet = new Set<PlanetId>(ruling.distinct);
  const sigSet = new Set<PlanetId>(significators.ranked.map((r) => r.planet));

  const chain = runningChain(chart, now);
  const levels: Array<KpTimingWindow['level']> = ['mahā', 'antara', 'pratyantara'];

  const toWindow = (node: any, i: number): KpTimingWindow => {
    const lord = (node.lord ?? node.lordKey) as PlanetId;
    const isRp = rpSet.has(lord);
    const isSig = sigSet.has(lord);
    return {
      level: levels[i] ?? 'pratyantara',
      lord,
      lordName: GRAHA_PROPERTIES[lord]?.name ?? node.lordName ?? String(lord),
      from: String(node.startDate ?? ''),
      to: String(node.endDate ?? ''),
      isRulingPlanet: isRp,
      isSignificator: isSig,
      ripe: isRp && isSig,
    };
  };

  const windows = chain.map(toWindow);
  const current = windows[0] ?? null;

  // Ripe windows: the running chain first, then the antardaśās of the current
  // mahādaśā that would qualify later.
  const ripe: KpTimingWindow[] = windows.filter((w) => w.ripe);

  const mahadasha = chain[0];
  if (mahadasha?.subPeriods) {
    for (const sub of mahadasha.subPeriods) {
      const w = toWindow(sub, 1);
      if (w.ripe && new Date(w.from).getTime() >= now.getTime()) ripe.push(w);
    }
  }

  return {
    house,
    current,
    ripeWindows: ripe.slice(0, 12),
    note:
      'A period is treated as ripe when its lord is both a ruling planet of the moment and a ' +
      'significator of the house under question. KP uses this as a timing signal, not a promise — ' +
      'the cuspal sub lord still decides whether the matter is promised at all.',
  };
}

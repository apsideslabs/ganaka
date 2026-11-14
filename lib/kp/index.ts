/**
 * KP — the engine, in one call.
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  KP IS A SEPARATE FRAMEWORK. It replaces whole-sign houses with       │
 * │  Placidus cusps and reads each nakṣatra through its star and sub lord. │
 * │  Do not mix its judgements with the Parāśarī ones elsewhere in the     │
 * │  app — the two answer different questions on different geometry.       │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * LAYOUT — each file owns one idea, so a rule can be checked without reading
 * the whole engine:
 *
 *   constants.ts       fruitful/barren signs, house groups, node list
 *   cusps.ts           Placidus cusps + the four KP lords of each
 *   significators.ts   the four-level ranking, retrograde rejection, node agency
 *   ruling-planets.ts  the five ruling planets, node agents, retrograde omission
 *   promise.ts         cuspal sub-lord promise + cuspal interlinks
 *   timing.ts          ruling planets crossed with the running daśā
 *   index.ts           this file: assemble the layer
 *
 * Everything here derives from the chart the rest of the app already built, so
 * a caller never needs to enter birth data again — pass the chart, get KP.
 */
import type { JyotishaChart, PlanetId } from '../jyotisha/types';
import { buildKpCusps, cuspLord, type KpCusp } from './cusps';
import { significatorsOf, nodeAgency, type SignificatorsResult } from './significators';
import { rulingPlanetsForChart, type RulingPlanetsResult } from './ruling-planets';
import { evaluateCuspPromise, cuspalInterlinks, type CuspPromiseResult, type CuspInterlink } from './promise';
import { kpTiming, type KpTimingResult } from './timing';
import { KP_MATTERS, fertilityOf, type KpMatter } from './constants';

export * from './constants';
export * from './cusps';
export * from './significators';
export * from './ruling-planets';
export * from './promise';
export * from './timing';

export interface KpLayer {
  /** The twelve Placidus cusps with their lord chains. */
  cusps: KpCusp[];
  /** Significators for every house. */
  significators: Record<number, SignificatorsResult>;
  /** The ruling planets of the chart's own moment. */
  ruling: RulingPlanetsResult;
  /** The promise verdict for each matter. */
  promises: Record<string, CuspPromiseResult | null>;
  /** Which cusp's star holds which other cusp's sub lord. */
  interlinks: CuspInterlink[];
  /** Timing for the primary house of each matter. */
  timing: Record<string, KpTimingResult>;
  /** Nodes acting as agents of the grahas they associate with. */
  nodeAgents: Array<{ node: PlanetId; agentOf: PlanetId }>;
  /** Fruitful / semi-fruitful / barren sign of each house. */
  fertility: Record<number, string>;
}

/**
 * Build the whole KP layer from a chart.
 *
 * One call, no birth-data entry — the chart already carries everything KP needs.
 */
export function calculateKpLayer(chart: JyotishaChart, now: Date = new Date()): KpLayer {
  const cusps = buildKpCusps(chart);

  const significators: Record<number, SignificatorsResult> = {};
  for (let h = 1; h <= 12; h++) {
    significators[h] = significatorsOf(chart, cusps, h);
  }

  const ruling = rulingPlanetsForChart(chart);

  const promises: Record<string, CuspPromiseResult | null> = {};
  const timing: Record<string, KpTimingResult> = {};
  for (const [key, m] of Object.entries(KP_MATTERS)) {
    promises[key] = evaluateCuspPromise(chart, cusps, m.primary, m.matter, m.detrimental);
    timing[key] = kpTiming(chart, ruling, significators[m.primary], m.primary, now);
  }

  const fertility: Record<number, string> = {};
  for (const c of cusps) fertility[c.house] = fertilityOf(c.rashi);

  return {
    cusps,
    significators,
    ruling,
    promises,
    interlinks: cuspalInterlinks(chart, cusps),
    timing,
    nodeAgents: nodeAgency(chart),
    fertility,
  };
}

/** Convenience: the matter definitions, re-exported for UI use. */
export { KP_MATTERS };
export type { KpMatter };

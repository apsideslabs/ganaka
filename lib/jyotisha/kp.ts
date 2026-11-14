/**
 * KP — compatibility shim.
 *
 * The engine now lives in `lib/kp/`, split by concern. This file keeps the old
 * import path working for the report and export, and exposes wrappers whose
 * signatures match what those callers already use.
 *
 * New code should import from `@/lib/kp` and call `calculateKpLayer(chart)` once
 * rather than re-deriving cusps per question — that is what the layer is for.
 */
import type { JyotishaChart } from './types';
import { buildKpCusps, type KpCusp } from '../kp/cusps';
import { significatorsOf, type SignificatorsResult } from '../kp/significators';
import { evaluateCuspPromise as evaluateOnCusps, type CuspPromiseResult } from '../kp/promise';

export * from '../kp/constants';
export type { RulingPlanet, RulingPlanetsResult } from '../kp/ruling-planets';
export type { SignificatorLevel, SignificatorsResult } from '../kp/significators';
export type { CuspPromise, CuspPromiseResult, CuspInterlink } from '../kp/promise';
export type { KpCusp, KpLords } from '../kp/cusps';
export type { KpTimingWindow, KpTimingResult } from '../kp/timing';

export { calculateRulingPlanets, rulingPlanetsForChart } from '../kp/ruling-planets';
export { cuspalInterlinks } from '../kp/promise';
export { kpTiming } from '../kp/timing';
export { buildKpCusps };

/**
 * Significators for one house.
 *
 * Builds the Placidus cusps on demand so the caller does not have to hold them.
 * Where several houses are needed, use `calculateKpLayer` instead — it builds
 * the cusp set once.
 */
export function calculateSignificators(chart: JyotishaChart, house: number): SignificatorsResult['levels'] {
  return significatorsOf(chart, buildKpCusps(chart), house).levels;
}

/** The full significator result, including the retrograde rejections. */
export function significatorsDetail(chart: JyotishaChart, house: number): SignificatorsResult {
  return significatorsOf(chart, buildKpCusps(chart), house);
}

/**
 * The cuspal sub-lord promise for one house.
 *
 * Same convenience as above: cusps are built internally.
 */
export function evaluateCuspPromise(
  chart: JyotishaChart,
  house: number,
  matterHouses: number[],
  detrimentalHouses: number[]
): CuspPromiseResult | null {
  return evaluateOnCusps(chart, buildKpCusps(chart), house, matterHouses, detrimentalHouses);
}

export type { KpCusp as Cusp };

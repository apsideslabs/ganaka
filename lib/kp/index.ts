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
import { calculateKPPosition } from '../jyotisha/sphutas';
import { GRAHA_PROPERTIES } from '../jyotisha/constants';
import { significatorsOf, nodeAgency, housesSignified, type SignificatorsResult, type NodeAgent } from './significators';
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

/**
 * One graha as KP tabulates it: where it sits, and the four lords of that degree.
 * This is the working table a KP astrologer reads from — the square kuṇḍalī is
 * not the KP view, the cuspal placement and the lord chain are.
 */
export interface KpPlanetRow {
  id: PlanetId;
  name: string;
  longitude: number;
  rashi: number;
  rashiName: string;
  degreeInRashi: number;
  /** The Placidus house whose arc holds it — not the sign-based house. */
  house: number;
  nakshatra: string;
  pada: number;
  signLord: PlanetId;
  starLord: PlanetId;
  subLord: PlanetId;
  subSubLord: PlanetId;
  retrograde: boolean;
  dignity: string;
  /** Houses it signifies, node agency included. */
  signifies: number[];
}

/** One row of the Viṃśottarī table KP times events from. */
export interface KpDashaRow {
  level: 'mahā' | 'antara' | 'pratyantara';
  lord: PlanetId;
  lordName: string;
  from: string;
  to: string;
  isRunning: boolean;
  /** Houses this lord signifies. */
  signifies: number[];
}

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
  /** Nodes acting as agents of the grahas they represent, with the basis. */
  nodeAgents: NodeAgent[];
  /** Fruitful / semi-fruitful / barren sign of each house. */
  fertility: Record<number, string>;
  /** The planet table: every graha with its four lords and cuspal house. */
  planets: KpPlanetRow[];
  /** The Viṃśottarī table, mahā and antara, with significations. */
  dasha: KpDashaRow[];
}

/**
 * Build the whole KP layer from a chart.
 *
 * One call, no birth-data entry — the chart already carries everything KP needs.
 */
/**
 * The layer costs about 34 ms — the cusp set, twelve significator rankings and
 * nine timing walks. Panels remount on every tab switch, so the result is cached
 * against the chart object itself. Charts are shared and immutable (see the
 * calculator's cache), so this holds for the life of the session.
 */
const layerCache = new WeakMap<JyotishaChart, Map<string, KpLayer>>();

export function calculateKpLayer(
  chart: JyotishaChart,
  now: Date = new Date(),
  mode: 'natal' | 'horary' = 'natal'
): KpLayer {
  let byKey = layerCache.get(chart);
  if (!byKey) { byKey = new Map(); layerCache.set(chart, byKey); }
  const key = `${mode}`;
  const hit = byKey.get(key);
  if (hit) return hit;
  const built = buildKpLayer(chart, now, mode);
  byKey.set(key, built);
  return built;
}

function buildKpLayer(
  chart: JyotishaChart,
  now: Date,
  mode: 'natal' | 'horary'
): KpLayer {
  const cusps = buildKpCusps(chart);

  const significators: Record<number, SignificatorsResult> = {};
  for (let h = 1; h <= 12; h++) {
    significators[h] = significatorsOf(chart, cusps, h, mode);
  }

  const ruling = rulingPlanetsForChart(chart, true, mode);

  const promises: Record<string, CuspPromiseResult | null> = {};
  const timing: Record<string, KpTimingResult> = {};
  for (const [key, m] of Object.entries(KP_MATTERS)) {
    promises[key] = evaluateCuspPromise(chart, cusps, m.primary, m.matter, m.detrimental);
    timing[key] = kpTiming(chart, cusps, ruling, significators[m.primary], m.primary, m.matter, now);
  }

  const fertility: Record<number, string> = {};
  for (const c of cusps) fertility[c.house] = fertilityOf(c.rashi);

  // ---- planet table ------------------------------------------------------
  const planets: KpPlanetRow[] = [];
  for (const [id, p] of Object.entries(chart.planets as any)) {
    const pl: any = p;
    if (typeof pl?.siderealLongitude !== 'number') continue;
    const lon = pl.siderealLongitude;
    const kpLords = calculateKPPosition(lon);

    // The cuspal house, not the sign-based one.
    let houseNo = 1;
    for (let i = 0; i < 12; i++) {
      const start = cusps[i].longitude;
      const end = cusps[(i + 1) % 12].longitude;
      const inside = start < end ? lon >= start && lon < end : lon >= start || lon < end;
      if (inside) { houseNo = cusps[i].house; break; }
    }

    planets.push({
      id: id as PlanetId,
      name: pl.name ?? id,
      longitude: Number(lon.toFixed(4)),
      rashi: pl.rashiNumber,
      rashiName: pl.rashiName,
      degreeInRashi: Number((lon % 30).toFixed(4)),
      house: houseNo,
      nakshatra: pl.nakshatraName,
      pada: pl.pada,
      signLord: kpLords.signLord,
      starLord: kpLords.starLord,
      subLord: kpLords.subLord,
      subSubLord: kpLords.subSubLord,
      retrograde: pl.isRetrograde === true,
      dignity: pl.dignity ?? '',
      signifies: housesSignified(chart, cusps, id as PlanetId),
    });
  }

  // ---- dasha table -------------------------------------------------------
  const dasha: KpDashaRow[] = [];
  const nowMs = now.getTime();
  const tree: any[] = (chart.vimshottari as any)?.tree ?? [];
  for (const maha of tree) {
    const mLord = (maha.lord ?? maha.lordKey) as PlanetId;
    const runningMaha = nowMs >= new Date(maha.startDate).getTime() && nowMs <= new Date(maha.endDate).getTime();
    dasha.push({
      level: 'mahā', lord: mLord,
      lordName: GRAHA_PROPERTIES[mLord]?.name ?? mLord,
      from: String(maha.startDate).slice(0, 10), to: String(maha.endDate).slice(0, 10),
      isRunning: runningMaha, signifies: housesSignified(chart, cusps, mLord),
    });
    for (const antar of maha.subPeriods ?? []) {
      const aLord = (antar.lord ?? antar.lordKey) as PlanetId;
      dasha.push({
        level: 'antara', lord: aLord,
        lordName: GRAHA_PROPERTIES[aLord]?.name ?? aLord,
        from: String(antar.startDate).slice(0, 10), to: String(antar.endDate).slice(0, 10),
        isRunning: nowMs >= new Date(antar.startDate).getTime() && nowMs <= new Date(antar.endDate).getTime(),
        signifies: housesSignified(chart, cusps, aLord),
      });
    }
  }

  return {
    cusps,
    significators,
    ruling,
    promises,
    interlinks: cuspalInterlinks(chart, cusps),
    timing,
    nodeAgents: nodeAgency(chart),
    fertility,
    planets,
    dasha,
  };
}

/** Convenience: the matter definitions, re-exported for UI use. */
export { KP_MATTERS };
export type { KpMatter };

/**
 * Five-layer strength scoring.
 *
 * A reading is only as good as what it is allowed to rest on. This scores each
 * life domain on the five layers the classical texts actually use, with fixed
 * weights, so a verdict can be traced to a number instead of a sentence:
 *
 *   1. Bhāveśa        40%  the domain's house lord — dignity, house type,
 *                          combustion, retrogradation
 *   2. Naisargika      25%  the natural significator, weighed by its ṣaḍbala ratio
 *   3. Divisional      15%  where the lord sits in the domain's own varga
 *   4. Aṣṭakavarga     10%  the bindus in the domain's bhāva
 *   5. Daśā            10%  whether the running period can deliver it
 *
 * The weights are published rather than hidden. They are a convention, not a
 * verse, and a reader who disagrees with them can see exactly what to change.
 */

import type { JyotishaChart, PlanetId } from '../types';
import { RASHIS } from '../constants';

export type Tone = 'strong' | 'favourable' | 'mixed' | 'weak';

export interface ScoredLayer {
  name: string;
  weight: number;
  /** 0–1 after normalisation. */
  score: number;
  /** What the layer read, in plain words. */
  read: string;
}

export interface DomainScore {
  id: string;
  label: string;
  /** Weighted total, 0–100. */
  total: number;
  tone: Tone;
  layers: ScoredLayer[];
  /** The house and lord the score is anchored on. */
  house: number;
  lord: PlanetId;
  lordName: string;
}

/** Dignity ladder, from the texts' own order. */
const DIGNITY: Array<[RegExp, number]> = [
  [/^Exalted/i, 3],
  [/^Moolatrikona/i, 2.5],
  [/^Own Sign/i, 2],
  [/^Great Friend/i, 1.2],
  [/^Friend/i, 1],
  [/^Neutral/i, 0],
  [/^Great Enemy/i, -1.5],
  [/^Enemy/i, -1],
  [/^Debilitated/i, -2.5],
];

function dignityScore(d: string | undefined): number {
  if (!d) return 0;
  for (const [re, v] of DIGNITY) if (re.test(d)) return v;
  return 0;
}

/** Map an unbounded score into 0–1. */
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/**
 * Dignity runs −2.5…+3, and the house-type and condition adjustments add about
 * ±1 more. Normalising over −2.5…+3 saturated every exalted lord to 100 and
 * every debilitated one to 0, which flattened the ranking; the window below is
 * the real reach of the sum.
 */
const normDignity = (x: number) => clamp01((x + 3.6) / 7.2);

const KENDRA = [1, 4, 7, 10];
const KONA = [5, 9];
const DUSTHANA = [6, 8, 12];

/**
 * Layer 1 — the bhāveśa.
 *
 * Dignity of the lord, the type of house it sits in, combustion and
 * retrogradation. A lord in a dusthāna cannot carry its house however well
 * dignified it is, which is why house type is added rather than multiplied.
 */
function bhaveśa(chart: JyotishaChart, house: number): { score: number; read: string; lord: PlanetId } {
  const bhava: any = (chart.bhavas as any[])?.[house - 1];
  const lord = (bhava?.rashiLord ?? bhava?.lord) as PlanetId;
  const p: any = (chart.planets as any)?.[lord];
  if (!p) return { score: 0.5, read: 'the house lord could not be read', lord };

  let raw = dignityScore(p.dignity);
  const bits: string[] = [p.dignity ?? 'undignified'];

  const h = Number(p.house);
  if (KENDRA.includes(h)) { raw += 0.8; bits.push(`in a kendra (house ${h})`); }
  else if (KONA.includes(h)) { raw += 0.8; bits.push(`in a koṇa (house ${h})`); }
  else if (DUSTHANA.includes(h)) { raw -= 0.8; bits.push(`in a dusthāna (house ${h})`); }
  else bits.push(`in house ${h}`);

  if (p.isCombust) { raw -= 0.5; bits.push('combust'); }
  if (p.isRetrograde) { raw -= 0.3; bits.push('retrograde'); }

  // A clause, so it can follow "because" in the reading.
  const head = bits[0];
  const rest = bits.slice(1).join(', ');
  return { score: normDignity(raw), read: `the lord is ${head}${rest ? `, ${rest}` : ''}`, lord };
}

/**
 * Layer 2 — the naisargika kāraka.
 *
 * The natural significator's ṣaḍbala ratio. 1.0 is the required minimum, so it
 * maps to the midpoint; 1.5 or better is full marks, 0.5 or worse is none.
 */
function naisargika(chart: JyotishaChart, karakas: PlanetId[]): { score: number; read: string } {
  const sb: any = chart.shadbala;
  const ratios: Array<{ id: PlanetId; ratio: number }> = [];
  for (const k of karakas) {
    const r = sb?.[k]?.ratio;
    if (typeof r === 'number') ratios.push({ id: k, ratio: r });
  }
  if (ratios.length === 0) return { score: 0.5, read: 'no kāraka strength available' };

  const avg = ratios.reduce((a, b) => a + b.ratio, 0) / ratios.length;
  const score = clamp01((avg - 0.5) / 1.0);
  const best = ratios.reduce((a, b) => (a.ratio >= b.ratio ? a : b));
  return {
    score,
    read: `the kāraka ṣaḍbala averages ${avg.toFixed(2)}× the required rūpas, strongest being ${best.id}`,
  };
}

/**
 * Layer 3 — divisional confirmation.
 *
 * Does the lord hold up in the domain's own varga? A lord that is strong in the
 * rāśi but falls in the D-10 has not confirmed a career.
 */
function divisional(
  chart: JyotishaChart,
  lord: PlanetId,
  vargas: string[]
): { score: number; read: string } {
  const wanted = vargas.filter((v) => v !== 'D1');
  const check = wanted.length ? wanted[wanted.length - 1] : 'D9';
  const v: any = (chart.vargas as any)?.[check];
  if (!v) return { score: 0.5, read: `the ${check} is not available` };

  // Vargottama is the strongest confirmation a varga can give.
  const vargottama = Array.isArray((chart as any).vargottamaPlanets)
    && (chart as any).vargottamaPlanets.includes(lord);

  // Otherwise: does the lord land in a kendra or koṇa of that varga?
  const inVarga: any = v.planets?.[lord] ?? (v.positions as any)?.[lord];
  const vargaHouse = Number(inVarga?.house ?? inVarga?.rashiNumber ?? 0);
  const good = KENDRA.includes(vargaHouse) || KONA.includes(vargaHouse);

  if (vargottama) return { score: 0.9, read: `the lord is vargottama, repeating its sign in ${check}` };
  if (inVarga && good) return { score: 0.75, read: `the lord falls in a kendra or koṇa of ${check}` };
  if (inVarga) return { score: 0.45, read: `the lord falls outside the kendras of ${check}` };
  return { score: 0.5, read: `${check} does not place the lord` };
}

/**
 * Layer 4 — aṣṭakavarga.
 *
 * The SAV bindus in the domain's bhāva, as a modifier rather than a verdict.
 * The twelve-sign total is 337, so the average is 28: that maps to the midpoint.
 */
function ashtakavarga(chart: JyotishaChart, house: number): { score: number; read: string } {
  const sav: number[] = (chart.ashtakavarga as any)?.sav?.bindusByRashi;
  const bhava: any = (chart.bhavas as any[])?.[house - 1];
  const rashi = Number(bhava?.rashiNumber);
  if (!Array.isArray(sav) || !rashi) return { score: 0.5, read: 'SAV unavailable' };

  const bindus = sav[rashi - 1];
  // 20 → 0, 28 → 0.5, 36 → 1
  const score = clamp01((bindus - 20) / 16);
  return { score, read: `the ${RASHIS[rashi as 1]?.name ?? 'house'} sign holds ${bindus} SAV bindus` };
}

/**
 * Layer 5 — daśā.
 *
 * Whether the running mahādaśā lord is connected to the domain at all. A strong
 * house whose lord never rules a period cannot deliver on its promise in that
 * window.
 */
function dasha(
  chart: JyotishaChart,
  house: number,
  lord: PlanetId,
  karakas: PlanetId[]
): { score: number; read: string } {
  const tree: any[] = (chart.vimshottari as any)?.tree ?? [];
  const now = Date.now();
  const running = tree.find((n) => {
    const s = new Date(n.startDate).getTime();
    const e = new Date(n.endDate).getTime();
    return now >= s && now <= e;
  });
  if (!running) return { score: 0.5, read: 'no running period found' };

  const runLord = (running.lord ?? running.lordKey) as PlanetId;
  const bhava: any = (chart.bhavas as any[])?.[house - 1];
  const occupants: PlanetId[] = (bhava?.planetsInHouse ?? []) as PlanetId[];

  if (runLord === lord) return { score: 1, read: `the running ${runLord} period is the house lord itself` };
  if (karakas.includes(runLord)) return { score: 0.8, read: `the running ${runLord} period is a kāraka of this domain` };
  if (occupants.includes(runLord)) return { score: 0.7, read: `the running ${runLord} period occupies the house` };

  // Counts as significator by star link when its star lord is the house lord.
  const starLord = (chart.planets as any)?.[runLord]?.nakshatraLord;
  if (starLord === lord) return { score: 0.6, read: `the running ${runLord} sits in the house lord's star` };

  return { score: 0.25, read: `the running ${runLord} period is not connected to this domain` };
}

export interface DomainSpec {
  id: string;
  label: string;
  house: number;
  karakas: PlanetId[];
  vargas: string[];
}

/** Score one domain across all five layers. */
export function scoreDomain(chart: JyotishaChart, spec: DomainSpec): DomainScore {
  const b = bhaveśa(chart, spec.house);
  const layers: ScoredLayer[] = [
    { name: 'Bhāveśa', weight: 0.40, score: b.score, read: b.read },
    { name: 'Naisargika kāraka', weight: 0.25, ...(() => {
      const n = naisargika(chart, spec.karakas);
      return { score: n.score, read: n.read };
    })() },
    { name: 'Divisional', weight: 0.15, ...(() => {
      const d = divisional(chart, b.lord, spec.vargas);
      return { score: d.score, read: d.read };
    })() },
    { name: 'Aṣṭakavarga', weight: 0.10, ...(() => {
      const a = ashtakavarga(chart, spec.house);
      return { score: a.score, read: a.read };
    })() },
    { name: 'Daśā', weight: 0.10, ...(() => {
      const d = dasha(chart, spec.house, b.lord, spec.karakas);
      return { score: d.score, read: d.read };
    })() },
  ];

  const total = Math.round(layers.reduce((sum, l) => sum + l.score * l.weight, 0) * 100);
  const tone: Tone = total >= 70 ? 'strong' : total >= 55 ? 'favourable' : total >= 40 ? 'mixed' : 'weak';

  return {
    id: spec.id,
    label: spec.label,
    total,
    tone,
    layers,
    house: spec.house,
    lord: b.lord,
    lordName: b.lord,
  };
}

/** Score every domain of a chart. */
export function scoreAllDomains(chart: JyotishaChart, specs: DomainSpec[]): DomainScore[] {
  return specs.map((s) => scoreDomain(chart, s));
}

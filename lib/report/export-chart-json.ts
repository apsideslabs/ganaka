'use client';

/**
 * Gaṇaka — complete chart export.
 *
 * Gaṇaka computes; it does not predict. This module serialises everything the
 * engine produced — positions, vargas, balas, daśās, yogas, doṣas, Jaimini
 * factors — into one versioned JSON document.
 *
 * It is the machine-readable twin of the PDF: the same computation, addressed
 * to software rather than to a reader. A separate prediction platform consumes
 * this instead of recomputing, so the two can never drift apart.
 */
import type { JyotishaChart } from '@/lib/jyotisha/types';

/** Bump only on a breaking change to the shape below. */
export const EXPORT_SCHEMA = 'ganaka.chart/v1';

export interface GanakaChartExport {
  schema: string;
  generator: {
    name: string;
    version: string;
    url: string;
    scope: 'calculation';
    note: string;
  };
  generatedAt: string;
  /** How many daśā levels this document carries. */
  dashaDepth: number;
  birth: JyotishaChart['meta']['birthDetails'];
  calculation: {
    ayanamshaType: string;
    ayanamshaValue: number;
    ayanamshaFormatted: string;
    houseSystem: string;
    julianDay: number;
    engineVersion: string;
    calculatedAt: string;
  };
  summary: {
    lagnaRashi: string;
    lagnaDegree: string;
    moonNakshatra: string;
    vargaCount: number;
    yogaCount: number;
    doshaCount: number;
    mahadashaCount: number;
  };
  chart: {
    lagna: JyotishaChart['lagna'];
    planets: JyotishaChart['planets'];
    bhavas: JyotishaChart['bhavas'];
    panchanga: JyotishaChart['panchanga'];
    vargas: JyotishaChart['vargas'];
    vargottamaPlanets: JyotishaChart['vargottamaPlanets'];
    vimshottari: JyotishaChart['vimshottari'];
    ashtakavarga: JyotishaChart['ashtakavarga'];
    shadbala: JyotishaChart['shadbala'];
    yogas: JyotishaChart['yogas'];
    doshas: JyotishaChart['doshas'];
    jaimini: JyotishaChart['jaimini'];
    specialPoints: JyotishaChart['specialPoints'];
  };
}

/** Deep, JSON-safe copy: drops functions and undefined, keeps Dates as ISO. */
function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value ?? null)) as T;
}

/**
 * Trim a daśā tree to `depth` levels. The engine builds four or more; the report
 * prints three (mahā, antara, pratyantar), and each deeper level multiplies the
 * node count by nine, so an untrimmed export runs to several megabytes.
 */
function trimDasha(periods: any[], depth: number, level = 1): any[] {
  return (periods || []).map((p) => {
    const { subPeriods, ...rest } = p;
    return level < depth && subPeriods?.length
      ? { ...rest, subPeriods: trimDasha(subPeriods, depth, level + 1) }
      : rest;
  });
}

export interface ExportOptions {
  /** Daśā levels to include. 3 = mahā, antara, pratyantar (matches the report). */
  dashaDepth?: number;
}

export function buildChartExport(chart: JyotishaChart, opts: ExportOptions = {}): GanakaChartExport {
  const bd = chart.meta.birthDetails;
  const depth = Math.max(1, opts.dashaDepth ?? 3);
  const vim: any = chart.vimshottari || {};
  const tree: any[] = trimDasha(vim.tree || [], depth);
  // fullAstronomicalTree is a parallel structure whose dates are already carried
  // on every node above, so shipping both doubles the file for no information.
  const vimshottari = { ...vim, tree, fullAstronomicalTree: undefined };
  delete vimshottari.fullAstronomicalTree;

  return {
    schema: EXPORT_SCHEMA,
    generator: {
      name: 'Ganaka',
      version: chart.meta.engineVersion,
      url: 'https://apsideslabs.github.io/ganaka/',
      scope: 'calculation',
      note:
        'Computed positions and classical classifications only. This document ' +
        'contains no predictions or remedies; interpretation belongs to the ' +
        'reader or to a separate prediction system.',
    },
    generatedAt: new Date().toISOString(),
    dashaDepth: depth,
    birth: plain(bd),
    calculation: {
      ayanamshaType: chart.meta.ayanamshaType,
      ayanamshaValue: chart.meta.ayanamshaValue,
      ayanamshaFormatted: chart.meta.ayanamshaFormatted,
      houseSystem: chart.meta.houseSystem,
      julianDay: chart.meta.julianDay,
      engineVersion: chart.meta.engineVersion,
      calculatedAt: chart.meta.calculatedAt,
    },
    summary: {
      lagnaRashi: chart.lagna.rashiName,
      lagnaDegree: chart.lagna.degreeStr,
      moonNakshatra: `${chart.lagna.nakshatraName} pada ${chart.lagna.pada}`,
      vargaCount: Object.keys(chart.vargas || {}).length,
      yogaCount: (chart.yogas || []).length,
      doshaCount: ((chart.doshas as any)?.evaluatedDoshas || []).length,
      mahadashaCount: tree.length,
    },
    chart: {
      lagna: plain(chart.lagna),
      planets: plain(chart.planets),
      bhavas: plain(chart.bhavas),
      panchanga: plain(chart.panchanga),
      vargas: plain(chart.vargas),
      vargottamaPlanets: plain(chart.vargottamaPlanets),
      vimshottari: plain(vimshottari),
      ashtakavarga: plain(chart.ashtakavarga),
      shadbala: plain(chart.shadbala),
      yogas: plain(chart.yogas),
      doshas: plain(chart.doshas),
      jaimini: plain(chart.jaimini),
      specialPoints: plain(chart.specialPoints),
    },
  };
}

/** Suggested filename, matching the PDF's convention. */
export function chartJsonFilename(chart: JyotishaChart): string {
  const d = chart.meta.birthDetails;
  return `Ganaka-Chart-${d.year}${String(d.month).padStart(2, '0')}${String(d.day).padStart(2, '0')}.json`;
}

/** Serialise to pretty-printed JSON. */
export function chartToJsonString(chart: JyotishaChart): string {
  return JSON.stringify(buildChartExport(chart), null, 2);
}

/** Trigger a browser download of the JSON. */
export function downloadChartJson(chart: JyotishaChart): void {
  const blob = new Blob([chartToJsonString(chart)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = chartJsonFilename(chart);
  document.body.appendChild(a);
  a.click();
  a.remove();
  // give the browser a tick to start the download before releasing the blob
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

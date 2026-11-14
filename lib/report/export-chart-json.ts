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
import { calculateBhavaBala } from '@/lib/shadbala/bhava-bala';
import { calculatePhala } from '@/lib/jyotisha/phala-advanced';
import { calculateVimshopakaBala } from '@/lib/jyotisha/vimshopaka';
import { calculateSudarshanaChakra } from '@/lib/jyotisha/sudarshana';
import { findEclipses, ECLIPSE_METHOD_NOTE } from '@/lib/astronomy/eclipses';
import { calculateDoubleTransit } from '@/lib/jyotisha/transits';
import { calculateKpLayer } from '@/lib/kp';
import { calculateMrityuBhaga } from '@/lib/jyotisha/mrityu-bhaga';
import { calculateNadi } from '@/lib/jyotisha/nadi';
import { fourStepForAll } from '@/lib/kp/four-step';
import { calculateAvakahadaChakra } from '@/lib/jyotisha/avakahada';
import { calculateCurrentTransits } from '@/lib/jyotisha/transits';
import { extractLunarData } from '@/lib/jyotisha/kuta/ashtakuta-calculator';
import { calculatePrashna } from '@/lib/jyotisha/prashna';
import { nakshatraAt, vedhaFor } from '@/lib/jyotisha/sarvatobhadra';
import { calculateAllExtendedDashas } from '@/lib/dashas/extended-engine';
import { calculateVarshaphala } from '@/lib/varshaphala/varshaphala';
import { calculateMudda, calculatePatyayini, calculateTajikaAspects } from '@/lib/varshaphala/tajika-dashas';

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
    /** Mean or true lunar node — the checklist requires this be recorded. */
    nodeType: 'mean' | 'true';
    jaiminiScheme: '7_karaka' | '8_karaka';
    /** Inputs that were clamped or normalised; empty when the chart is clean. */
    warnings: string[];
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
  /** The engine's own record of how the chart was built. */
  meta: Record<string, unknown>;
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
    yogas: Array<Record<string, unknown>>;
    doshas: Record<string, unknown>;
    jaimini: JyotishaChart['jaimini'];
    specialPoints: JyotishaChart['specialPoints'];
  };
  /** House strength — BPHS 27.26–31. */
  bhavaBala: Record<string, unknown>;
  /** Ishta/Kaṣṭa, motion states, Bīja and Kṣetra sphuṭas — BPHS 28. */
  phala: Record<string, unknown>;
  /** Pañcadhā maitrī — natural, temporal and compound relationships. */
  relationships: Record<string, unknown>;
  /** Each graha against the lord of the sign it sits in. */
  dispositorRelations: Array<Record<string, unknown>>;
  /** Favourable number, colour, day, gem and deity. */
  attributes: Record<string, unknown>;
  /** Sāyana (tropical) longitudes beside the nirayana ones. */
  sayana: Array<Record<string, unknown>>;
  /** Bhāva spaṣṭa — the aadi / madhya / anta of all twelve houses. */
  bhavaSpasht: Array<Record<string, unknown>>;
  /** Avakahāda Cakra — nāmākṣara, paya, yoni, gaṇa, nāḍī, gotra. */
  avakahada: Record<string, unknown>;
  /** Gochara — current transits, vedha, sāḍhe sātī. */
  transits: Record<string, unknown>;
  /** Lunar data used by the marriage-matching bridge. */
  matchingData: Record<string, unknown>;
  /** The five avasthā sets, per graha. */
  avasthas: Record<string, unknown>;
  /** Mṛtyu Bhāga — the fateful degrees, both recensions. */
  mrityuBhaga: Record<string, unknown>;
  /** Nakṣatra nāḍī for the Moon and Lagna. */
  nadi: Record<string, unknown>;
  /** The KP four-step check for every matter. */
  kpFourStep: Record<string, unknown>;
  /** The KP layer: ruling planets, significators and the cusp promise. */
  kp: Record<string, unknown>;
  /** Jupiter–Saturn double transit as of the export date. */
  doubleTransit: Record<string, unknown>;
  /** Jaimini argala and virodhargala for the reference houses. */
  argala: Array<Record<string, unknown>>;
  /** Bhāva Chalita — the same grahas placed by bhāva cusp rather than by sign. */
  bhavaChalit: Record<string, unknown>;
  /** The local sky: midheaven, imum coeli and descendant. */
  angles: Record<string, unknown>;
  /** Saṃhitā: eclipses across a ten-year window around the chart date. */
  eclipses: Record<string, unknown>;
  /** Graha dṛṣṭi — which houses each graha aspects. */
  drishti: Record<string, unknown>;
  /** Sudarśana Cakra — the three rings and the annual house. */
  sudarshana: Record<string, unknown> | null;
  /** Viṃśopaka weighting across the varga sets. */
  vimshopaka: Array<Record<string, unknown>>;
  /** Sarvatobhadra ring position and vedha for each graha. */
  sarvatobhadra: Record<string, unknown>;
  /** The sixteen daśā systems, level-1 periods only. */
  extendedDashas: Record<string, unknown>;
  /** The current year's Varṣaphala, condensed. */
  varshaphala: Record<string, unknown> | null;
  /** Tājika Muḍḍa, Patyayini and Ithasala/Ishrafa for that year. */
  tajika: Record<string, unknown> | null;
  /** Praśna sphuṭas for the birth moment, without an arudha direction. */
  prashna: Record<string, unknown>;
}

/**
 * Strip the interpretation from a detected yoga or doṣa.
 *
 * The detection — which combination formed, from which verse, on what
 * conditions — is a calculation and stays. The `effects` prose and the
 * `remedies` prescriptions are the prediction layer and do not belong in a
 * chart document, which reports what the chart contains rather than what it
 * means.
 */
function stripPrediction<T extends Record<string, any>>(item: T): Record<string, any> {
  const { effects, classicalEffects, remedies, ...rest } = item;
  return rest;
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
  // The slim tree carries the same dates and lords without the repeated
  // derived strings, and is what the export ships.
  const slimTree: any[] = slimDashaTree(vim.tree || [], depth);
  // fullAstronomicalTree is a parallel structure whose dates are already carried
  // on every node above, so shipping both doubles the file for no information.
  const vimshottari = { ...vim, tree: slimTree, fullAstronomicalTree: undefined };
  delete vimshottari.fullAstronomicalTree;

  return {
    schema: EXPORT_SCHEMA,
    generator: {
      name: 'Ganaka',
      version: chart.meta.engineVersion,
      url: 'https://apsideslabs.github.io/ganaka/',
      scope: 'calculation',
      note:
        'Computed positions and classical classifications only. Yogas and doshas ' +
        'are reported as detections — which combination formed, from which verse, ' +
        'on what conditions — without their effects prose or remedies. This ' +
        'document contains no predictions and no remedies; interpretation belongs ' +
        'to the reader or to a separate prediction system.',
    },
    generatedAt: new Date().toISOString(),
    dashaDepth: depth,
    birth: plain(bd),
    calculation: {
      ayanamshaType: chart.meta.ayanamshaType,
      ayanamshaValue: chart.meta.ayanamshaValue,
      ayanamshaFormatted: chart.meta.ayanamshaFormatted,
      houseSystem: chart.meta.houseSystem,
      nodeType: (chart.meta as any).nodeType ?? 'mean',
      jaiminiScheme: (chart.meta as any).jaiminiScheme ?? '7_karaka',
      // Inputs that were clamped or normalised. Empty when the chart is clean.
      warnings: ((chart.meta as any).warnings ?? []) as string[],
      julianDay: chart.meta.julianDay,
      engineVersion: chart.meta.engineVersion,
      calculatedAt: chart.meta.calculatedAt,
    },
    summary: {
      lagnaRashi: chart.lagna.rashiName,
      lagnaDegree: chart.lagna.degreeStr,
      // This read the LAGNA's nakshatra and labelled it the Moon's, so the
      // summary reported Anurādhā for a chart whose Moon sits in Rohiṇī.
      moonNakshatra: `${(chart.planets as any).moon.nakshatraName} pada ${(chart.planets as any).moon.pada}`,
      vargaCount: Object.keys(chart.vargas || {}).length,
      yogaCount: (chart.yogas || []).length,
      doshaCount: ((chart.doshas as any)?.evaluatedDoshas || []).length,
      mahadashaCount: tree.length,
    },
    ...buildExtendedSections(chart, depth),
    meta: plain(chart.meta),
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
      yogas: plain((chart.yogas || []).map(stripPrediction)),
      doshas: plain({
        ...(chart.doshas as any),
        evaluatedDoshas: ((chart.doshas as any)?.evaluatedDoshas || []).map(stripPrediction),
      }),
      jaimini: plain(chart.jaimini),
      specialPoints: plain(chart.specialPoints),
    },
  };
}


/**
 * The sections added after the original export: house strength, Ishta/Kaṣṭa,
 * Sarvatobhadra, the sixteen daśā systems, Varṣaphala, Tājika and Praśna.
 *
 * Every one is wrapped so a single failing calculation cannot break the whole
 * document — a consumer gets the sections that computed and `null` for the rest
 * rather than an exception instead of a file.
 */
function buildExtendedSections(chart: JyotishaChart, depth: number) {
  // Untyped on purpose: the sections below return different shapes and a
  // generic here would force every fallback to match its branch exactly.
  const safe = (fn: () => any, fallback: any): any => {
    try { return fn(); } catch { return fallback; }
  };

  // --- Bhāva Bala ---------------------------------------------------------
  const bhavaBala = safe(() => {
    const bb: any = calculateBhavaBala(chart);
    const out: Record<string, unknown> = {};
    for (const [house, r] of Object.entries(bb) as any) {
      out[house] = {
        rashi: r.rashiName,
        reference: r.referenceAngle,
        lord: r.lord,
        digBala: Number(r.digBala.toFixed(2)),
        drigAdjustment: Number(r.drigAdjustment.toFixed(2)),
        adhipatiBala: Number(r.adhipatiBala.toFixed(2)),
        occupancyAdjustment: r.occupancyAdjustment,
        dayNightAdjustment: r.dayNightAdjustment,
        totalVirupas: Number(r.totalVirupas.toFixed(2)),
        totalRupas: Number(r.totalRupas.toFixed(3)),
        rank: r.rank,
        aspectingPlanets: r.aspectingPlanets,
      };
    }
    return out;
  }, {});

  // --- Ishta / Kaṣṭa, motion, progeny sphuṭas ------------------------------
  const phala = safe(() => {
    const ph: any = calculatePhala(chart);
    return {
      planets: Object.fromEntries(
        Object.entries(ph.planets).map(([k, p]: any) => [k, {
          name: p.name,
          uccaBala: Number(p.uccaBala.toFixed(2)),
          chestaBala: Number(p.chestaBala.toFixed(2)),
          ishta: Number(p.ishta.toFixed(2)),
          kashta: Number(p.kashta.toFixed(2)),
          motionState: p.motionState,
          speed: Number(p.speed.toFixed(4)),
          speedRatio: Number(p.speedRatio.toFixed(3)),
        }])
      ),
      progenySphutas: ph.progeny.map((s: any) => ({
        key: s.key,
        name: s.name,
        longitude: Number(s.longitude.toFixed(4)),
        rashi: s.rashiName,
        degreeStr: s.degreeStr,
        wants: s.favourableParity,
        isFavourable: s.isFavourable,
      })),
    };
  }, {});

  // --- Relationships, attributes, sāyana and bhāva spaṣṭa -------------------
  const relationships = safe(() => {
    const r: any = (chart as any).relationships;
    if (!r) return {};
    return {
      pairs: r.pairs.map((p: any) => ({
        planet: p.planet, other: p.other,
        natural: p.natural, temporal: p.temporal, compound: p.compound,
        houseDistance: p.houseDistance,
      })),
      summary: r.summary,
    };
  }, {});

  const dispositorRelations = safe(() =>
    ((chart as any).dispositorRelations || []).map((d: any) => ({
      planet: d.planet, rashi: d.rashiName, dispositor: d.dispositor,
      natural: d.natural, temporal: d.temporal, compound: d.compound,
    })), []);

  const attributes = safe(() => (chart as any).attributes ?? {}, {});

  const sayana = safe(() =>
    Object.entries(chart.planets as any).map(([id, p]: any) => ({
      planet: id,
      sayana: Number(p.tropicalLongitude?.toFixed?.(4) ?? 0),
      nirayana: Number(p.siderealLongitude?.toFixed?.(4) ?? 0),
      ayanamshaApplied: Number(((p.tropicalLongitude ?? 0) - (p.siderealLongitude ?? 0)).toFixed(4)),
    })), []);

  const bhavaSpasht = safe(() =>
    ((chart.bhavas as any[]) || []).map((h: any) => ({
      house: h.houseNumber ?? h.house,
      rashi: h.rashiNumber,
      lord: h.rashiLord ?? h.lord,
      aadi: Number((h.aadiDegree ?? h.startDegree ?? 0).toFixed(3)),
      madhya: Number((h.madhyaDegree ?? h.midDegree ?? 0).toFixed(3)),
      anta: Number((h.antaDegree ?? h.endDegree ?? 0).toFixed(3)),
      madhyaStr: h.madhyaDMS ?? h.midDegreeStr ?? '',
    })), []);

  // --- Avakahāda, gochara and matching ----------------------------
  const avakahada = safe(() => calculateAvakahadaChakra(chart), {});

  const transits = safe(() => {
    const t: any = calculateCurrentTransits(
      (chart.planets as any).moon.rashiNumber,
      chart.lagna.rashiNumber,
      chart.meta.ayanamshaType as any
    );
    return {
      date: t.transitDateStr,
      planets: t.planets.map((p: any) => ({
        id: p.id,
        rashi: p.transitRashi,
        rashiName: p.transitRashiName,
        degreeInRashi: p.transitDegreeInRashi,
        houseFromMoon: p.houseFromNatalMoon,
        houseFromLagna: p.houseFromNatalLagna,
        isBenefic: p.isBeneficTransitFromMoon,
        vedhaHouse: p.vedhaHouse,
        obstructed: p.hasVedhaObstruction,
        obstructingPlanets: p.obstructingPlanets,
      })),
      sadeSati: t.sadeSati,
    };
  }, {});

  const matchingData = safe(() => extractLunarData(chart), {});

  // --- Avasthās, mṛtyu bhāga, nāḍī, four-step -------------------------------
  const avasthas = safe(() => {
    const out: Record<string, unknown> = {};
    for (const [id, p] of Object.entries(chart.planets as any)) {
      const av = (p as any)?.avasthas;
      if (av) out[id] = av;
    }
    return out;
  }, {});

  const mrityuBhaga = safe(() => {
    const r = calculateMrityuBhaga(chart);
    return { recension: r.recension, rows: r.rows, affected: r.affected.map((a) => a.body), note: r.note };
  }, {});

  const nadi = safe(() => {
    const n = calculateNadi(chart);
    return {
      moon: { nakshatra: n.moonNakshatra, number: n.moonNumber, nadi: n.moonNadi },
      lagna: { nakshatra: n.lagnaNakshatra, number: n.lagnaNumber, nadi: n.lagnaNadi },
      distribution: n.distribution,
      note: n.note,
    };
  }, {});

  const kpFourStep = safe(() => {
    const layer = calculateKpLayer(chart);
    return fourStepForAll(chart, layer).map((r) => ({
      matter: r.matter, house: r.house, outcome: r.outcome,
      steps: r.steps.map((s) => ({ step: s.step, title: s.title, verdict: s.verdict, finding: s.finding })),
      conclusion: r.conclusion,
    }));
  }, []);

  // --- KP layer -------------------------------------------------------------
  const kp = safe(() => {
    const layer = calculateKpLayer(chart);
    return {
      cusps: layer.cusps.map((c) => ({
        house: c.house,
        longitude: c.longitude,
        rashi: c.rashi,
        rashiName: c.rashiName,
        signLord: c.lords.signLord,
        starLord: c.lords.starLord,
        subLord: c.lords.subLord,
        subSubLord: c.lords.subSubLord,
        occupants: c.occupants,
        fertility: layer.fertility[c.house],
      })),
      ruling: {
        planets: layer.ruling.planets.map((r) => ({ role: r.role, planet: r.planet })),
        nodeAgents: layer.ruling.nodeAgents.map((r) => ({ role: r.role, planet: r.planet })),
        workingSet: layer.ruling.workingSet.map((r) => r.planet),
        omittedRetrograde: layer.ruling.omittedRetrograde,
      },
      significators: Object.fromEntries(
        Object.entries(layer.significators).map(([h, sig]) => [h, {
          levels: sig.levels.map((l) => ({ level: l.level, rule: l.rule, planets: l.planets })),
          rejectedRetrograde: sig.rejectedRetrograde,
        }])
      ),
      // Signification only — the promise verdict is a prediction and stays out.
      promises: Object.fromEntries(
        Object.entries(layer.promises).map(([k, r]) => [k, r ? {
          house: r.house,
          subLord: r.subLord,
          signifies: r.signifies,
          matterHouses: r.matterHouses,
          detrimentalHouses: r.detrimentalHouses,
          hitsMatter: r.hitsMatter,
          hitsDetrimental: r.hitsDetrimental,
          fertility: r.fertility,
        } : null])
      ),
      interlinks: layer.interlinks,
      nodeAgents: layer.nodeAgents,
      fertility: layer.fertility,
      // The KP working tables: every graha with its four lords and cuspal
      // house, and the Viṃśottarī chain with each lord's significations.
      planets: layer.planets.map((p) => ({
        id: p.id, longitude: p.longitude, rashi: p.rashi, rashiName: p.rashiName,
        degreeInRashi: p.degreeInRashi, house: p.house, nakshatra: p.nakshatra, pada: p.pada,
        signLord: p.signLord, starLord: p.starLord, subLord: p.subLord, subSubLord: p.subSubLord,
        retrograde: p.retrograde, signifies: p.signifies,
      })),
      dasha: layer.dasha.map((d) => ({
        level: d.level, lord: d.lord, from: d.from, to: d.to,
        isRunning: d.isRunning, signifies: d.signifies,
      })),
    };
  }, {});

  // --- Double transit and argala --------------------------------------------
  const doubleTransit = safe(() => {
    const r = calculateDoubleTransit(
      chart.lagna.rashiNumber,
      new Date(),
      chart.meta.ayanamshaType as any
    );
    return {
      date: r.transitDateStr,
      activeHouses: r.activeHouses,
      houses: r.houses,
      note:
        'A major event needs transiting Jupiter and Saturn to activate the same house — Jupiter ' +
        'by the 5th, 7th or 9th from itself, Saturn by the 3rd, 7th or 10th.',
    };
  }, {});

  const argala = safe(() =>
    ((chart as any).argala || []).map((a: any) => ({
      house: a.houseFromLagna,
      type: a.argalaType,
      planets: a.argalaPlanets,
      virodhaHouse: a.virodhaHouse,
      virodhaPlanets: a.virodhaPlanets,
      obstructed: a.isObstructed,
      status: a.status,
    })), []);

  // --- Bhāva Chalita and the local angles -----------------------------------
  const bhavaChalit = safe(() => {
    const bc: any = (chart as any).bhavaChalit;
    if (!bc) return {};
    return {
      system: bc.system,
      summary: bc.summary,
      note: bc.note,
      entries: bc.entries.map((e: any) => ({
        planet: e.planet,
        rashiHouse: e.rashiHouse,
        chalitHouse: e.chalitHouse,
        shifted: e.shifted,
        degreeInBhava: e.degreeInBhava,
        bhavaMid: e.bhavaMid,
        fromMid: e.fromMid,
      })),
      bhavas: bc.bhavas,
    };
  }, {});

  const angles = safe(() => (chart as any).angles ?? {}, {});

  // --- Saṃhitā: eclipses ----------------------------------------------------
  const eclipses = safe(() => {
    const bd = chart.meta.birthDetails;
    const y = bd.year;
    const list = findEclipses({
      from: { year: y, month: 1, day: 1 },
      to: { year: y + 10, month: 12, day: 31 },
      latitude: bd.latitude,
      longitude: bd.longitude,
      timezoneOffsetHours: bd.timezoneOffsetHours,
      ayanamshaType: chart.meta.ayanamshaType as any,
      maxResults: 60,
    });
    return {
      method: ECLIPSE_METHOD_NOTE,
      events: list.map((e) => ({
        kind: e.kind,
        jd: Number(e.jd.toFixed(6)),
        label: e.label,
        moonLatitude: e.moonLatitude,
        limit: e.limit,
        depth: e.depth,
        aboveHorizon: e.aboveHorizon,
      })),
    };
  }, {});

  // --- Dṛṣṭi matrix and Sudarśana -------------------------------------------
  const drishti = safe(() => {
    const byPlanet: Record<string, number[]> = {};
    const byHouse: Record<string, string[]> = {};
    for (let h = 1; h <= 12; h++) byHouse[String(h)] = [];
    for (const [id, p] of Object.entries(chart.planets as any)) {
      const houses: number[] = (p as any)?.aspectsToHouses ?? [];
      byPlanet[id] = houses;
      for (const h of houses) {
        if (byHouse[String(h)]) byHouse[String(h)].push(id);
      }
    }
    return {
      note: 'Whole-sign graha dṛṣṭi: houses are numbered from the lagna.',
      byPlanet,
      byHouse,
    };
  }, {});

  const sudarshana = safe(() => {
    const bd = chart.meta.birthDetails;
    const yearOfLife = Math.max(1, new Date().getFullYear() - bd.year);
    const s: any = calculateSudarshanaChakra(chart, { yearOfLife });
    return {
      yearOfLife,
      dasha: s.dasha,
      rings: s.rings.map((r: any) => ({
        reference: r.reference,
        referenceRashi: r.referenceRashi,
        referenceRashiName: r.referenceRashiName,
        houses: r.houses.map((h: any) => ({
          house: h.house,
          rashi: h.rashi,
          planets: h.planets,
        })),
      })),
      perGraha: s.perGraha,
    };
  }, null);

  // --- Viṃśopaka -----------------------------------------------------------
  const vimshopaka = safe(() => {
    const v: any[] = calculateVimshopakaBala(chart.vargas) as any[];
    return v.map((x) => ({
      planet: x.planet,
      name: x.planetName,
      shadvarga: Number(x.shadvargaScore?.toFixed?.(3) ?? 0),
      saptavarga: Number(x.saptavargaScore?.toFixed?.(3) ?? 0),
      dashavarga: Number(x.dashavargaScore?.toFixed?.(3) ?? 0),
      shodashavarga: Number(x.shodashavargaScore?.toFixed?.(3) ?? 0),
      percentageRating: x.percentageRating,
      band: x.band,
      namedGrade: x.namedGrade,
      reading: x.reading,
    }));
  }, []);

  // --- Sarvatobhadra: each graha's ring position and vedha ------------------
  const sarvatobhadra = safe(() => {
    const perPlanet: Record<string, unknown> = {};
    for (const [id, pos] of Object.entries(chart.planets as any)) {
      const p: any = pos;
      const idx = p.nakshatraIndex ?? 0;
      const v = vedhaFor(idx);
      perPlanet[id] = {
        nakshatra: p.nakshatraName ?? nakshatraAt(idx),
        ringIndex: idx,
        vedha: { front: v.front, left: v.left, right: v.right },
      };
    }
    return {
      note: 'Ring-level vedha only. The classical cross-layer vedha set is not reproduced.',
      planets: perPlanet,
    };
  }, {});

  // --- The sixteen daśā systems, level-1 periods ---------------------------
  const extendedDashas = safe(() => {
    const bd = chart.meta.birthDetails;
    const birth = new Date(Date.UTC(
      bd.year, bd.month - 1, bd.day,
      Math.round(bd.hour - (bd.timezoneOffsetHours ?? 0)), bd.minute, bd.second
    ));
    const all: any = calculateAllExtendedDashas(chart, birth);
    const out: Record<string, unknown> = {};
    for (const [id, r] of Object.entries(all) as any) {
      out[id] = {
        name: r.system?.name ?? id,
        cycleYears: r.system?.cycleYears ?? 0,
        provenance: r.system?.scripturalProvenance ?? '',
        eligibility: r.eligibility?.status ?? 'universal',
        current: r.currentPeriod?.majorPeriod?.name ?? '',
        periods: slimPeriods(r.periods),
      };
    }
    return out;
  }, {});

  // --- Varṣaphala and Tājika for the current year of life ------------------
  const bd = chart.meta.birthDetails;
  const yearNumber = Math.max(1, new Date().getFullYear() - bd.year);

  const varshaphala = safe(() => {
    const v: any = calculateVarshaphala(chart, {
      yearNumber,
      latitude: bd.latitude,
      longitude: bd.longitude,
      timezoneOffsetHours: bd.timezoneOffsetHours,
    });
    return {
      yearNumber: v.yearNumber,
      solarReturn: v.solarReturn,
      residualArcsec: Number(v.residualArcsec.toFixed(4)),
      annualLagna: v.chart.lagna.rashiName,
      muntha: { house: v.muntha.house, rashi: v.muntha.rashiName, natalHouse: v.muntha.natalHouse },
      varshesha: {
        lord: v.varshesha.lordName,
        scores: v.varshesha.scores.map((s: any) => ({ planet: s.planet, points: s.points })),
      },
      sahams: v.sahams.map((s: any) => ({ name: s.name, rashi: s.rashiName, house: s.house })),
    };
  }, null);

  const tajika = safe(() => {
    const yearStart = new Date(Date.UTC(new Date().getFullYear(), 0, 1));
    const mudda = calculateMudda(chart.planets.moon.siderealLongitude, yearStart);
    const pat: any = calculatePatyayini(chart, yearStart);
    const aspects = calculateTajikaAspects(chart);
    return {
      yearStart: yearStart.toISOString().slice(0, 10),
      mudda: mudda.map((m) => ({
        lord: m.lord,
        from: m.startDate.toISOString().slice(0, 10),
        to: m.endDate.toISOString().slice(0, 10),
        days: Number(m.durationDays.toFixed(2)),
      })),
      patyayini: {
        totalDegrees: Number(pat.totalDegrees.toFixed(4)),
        rows: pat.rows.map((r: any) => ({
          body: r.body,
          krishamsa: Number(r.krishamsa.toFixed(4)),
          patyamsa: Number(r.patyamsa.toFixed(4)),
          fractionOfYear: Number(r.fractionOfYear.toFixed(6)),
        })),
      },
      aspects: aspects.map((a) => ({
        pair: `${a.a}-${a.b}`,
        type: a.type,
        angle: a.aspectAngle,
        separation: Number(a.separation.toFixed(3)),
        orb: Number(a.orb.toFixed(2)),
      })),
    };
  }, null);

  // --- Praśna sphuṭas for the moment (no arudha without a direction) -------
  const prashna = safe(() => {
    const p: any = calculatePrashna(chart);
    const pick = (x: any) => ({ longitude: Number(x.longitude.toFixed(4)), rashi: x.rashiName, degreeStr: x.degreeStr });
    return {
      note: 'Arudha needs the direction the questioner faced and is omitted here.',
      trisphuta: pick(p.trisphuta),
      chatusphuta: pick(p.chatusphuta),
      panchasphuta: pick(p.panchasphuta),
      pranaSphuta: pick(p.pranaSphuta),
      dehaSphuta: pick(p.dehaSphuta),
      mrityuSphuta: pick(p.mrityuSphuta),
      sixFactors: p.sixFactors,
    };
  }, {});

  return {
    bhavaBala, phala, vimshopaka, sarvatobhadra, extendedDashas, varshaphala, tajika, prashna,
    relationships, dispositorRelations, attributes, sayana, bhavaSpasht,
    drishti, sudarshana, eclipses, bhavaChalit, angles, doubleTransit, argala, kp,
    avakahada, transits, matchingData,
    avasthas, mrityuBhaga, nadi, kpFourStep,
  };
}

/**
 * Reduce a daśā period to the fields that carry information. The engine's
 * periods repeat long derived strings on every node; keeping the dates, the
 * lord and the length is what a consumer needs and cuts the file by a third.
 */
/** Recursive slimmer for the Vimśottarī tree, keeping the nesting. */
function slimDashaTree(periods: any[], depth: number, level = 1): any[] {
  return (periods || []).map((p) => {
    const node: any = {
      lord: p.lordKey ?? p.lord ?? p.planet ?? '',
      name: p.name ?? p.lordName ?? '',
      from: p.startDateStr ?? p.startDate ?? '',
      to: p.endDateStr ?? p.endDate ?? '',
      years: Number((p.durationYears ?? 0).toFixed(3)),
    };
    // The Vimśottarī tree marks the period running at birth and how much of it
    // had already elapsed; both are real information, not derived duplicates.
    if (p.isBirthActive) {
      node.isBirthActive = true;
      if (p.elapsedBeforeBirthYears != null) {
        node.elapsedBeforeBirthYears = Number(p.elapsedBeforeBirthYears.toFixed(3));
      }
    }
    if (level < depth && p.subPeriods?.length) {
      node.subPeriods = slimDashaTree(p.subPeriods, depth, level + 1);
    }
    return node;
  });
}

function slimPeriods(periods: any[]): any[] {
  return (periods || []).map((p) => ({
    lord: p.lordKey ?? p.lord ?? '',
    name: p.name ?? p.lordName ?? '',
    from: p.startDateStr ?? p.startDate ?? '',
    to: p.endDateStr ?? p.endDate ?? '',
    years: Number((p.durationYears ?? 0).toFixed(3)),
  }));
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

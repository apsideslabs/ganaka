/**
 * Overall reading.
 *
 * The domain evaluators answer twelve separate questions; this composes them into
 * one reading, and it does so on a number rather than on a sentence. Each domain
 * is first scored across the five layers (see `five-layer.ts`), then the reading
 * is written from those scores: a strong domain is described as standing on firm
 * ground and the layer that carried it is named, a weak one is described as thin
 * and the layer that dragged it is named.
 *
 * Two things are kept apart on purpose, because conflating them is the commonest
 * error in a chart reading:
 *
 *   STRENGTH   — can this domain deliver at all, from its own chart?
 *   ACTIVATION — does the running daśā open it now?
 *
 * A house can be strong and dormant, or weak and currently activated. Both are
 * said plainly.
 *
 * Deterministic: no model, no generation. Every clause traces to a scored layer.
 */

import type { ClassicalIndicationsReport, DomainId, DomainIndication } from './types';
import { scoreAllDomains, type DomainScore, type DomainSpec } from '../reading/five-layer';

export interface OverallReading {
  headline: string;
  /** How the weighing works, stated so a reader can disagree with it. */
  method: string;
  movements: Array<{
    title: string;
    /** Domains rolled into this movement, strongest first. */
    scores: DomainScore[];
    body: string;
    /** Whether the running period opens this movement now. */
    activation: 'active' | 'dormant' | 'partial';
    /**
     * What the classical texts actually said about this movement: how many
     * rules were tested, how many the chart met, and which verses fired.
     * The score says how strong a domain is; this says what it rests on.
     */
    classical: {
      tested: number;
      met: number;
      /** Distinct source texts behind the rules that were met. */
      sources: string[];
      /** The chapter citations that fired, in the order they were tested. */
      citations: string[];
    };
  }>;
  atAGlance: Array<{ label: string; value: string }>;
  /** Domains resting on the thinnest ground. */
  thinnest: string[];
  /** Domains that are strong but not currently activated. */
  strongButDormant: string[];
  /** The classical record behind the whole reading. */
  evidence: {
    rulesTested: number;
    rulesMet: number;
    /** Per-text tally, so a reading leaning on one book is visible. */
    byText: Array<{ text: string; tested: number; met: number }>;
    /** Where two texts on the chart disagreed. */
    contradictions: string[];
  };
  /**
   * A condition that recurs across several domains. One weak graha dragging
   * three houses is a different reading from three unrelated weaknesses, and
   * the domain-by-domain view cannot show the difference.
   */
  threads: Array<{ observation: string; domains: string[] }>;
}

const KEEP_PARENTHETICAL =
  /^(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces|\d.*)$/i;

/** Strip glosses and rule citations, leaving plain sentences. */
function plain(s: string | undefined): string {
  if (!s) return '';
  let out = s
    .replace(/\s*\(([^)]*)\)/g, (m, inner: string) =>
      KEEP_PARENTHETICAL.test(inner.trim()) ? m : '')
    .replace(/\s+(?:by|under|through|from)\s+classical[^.;,]*/gi, '')
    .replace(/\s+(?:by|under|through)\s+(?:the\s+)?(?:\d+(?:st|nd|rd|th)\s+)?(?:house|bhāva)\s+rules?/gi, '')
    .replace(/\s*No direct canonical configuration[^.]*\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  out = out.replace(/\s+(?:is|are|was|were|be|being)\s*([.;]|$)/gi, '$1');
  return out;
}

function firstSentence(s: string): string {
  const p = plain(s);
  const m = p.match(/^(.{20,240}?[.!?])(\s|$)/);
  const first = (m ? m[1] : p).trim();
  return first.replace(/\s+(?:is|are|was|were|be|being)\s*([.;]|$)/gi, '$1').trim();
}

function summaryOf(d: DomainIndication | undefined): string {
  if (!d) return '';
  return firstSentence(d.conciseSummary || d.multiRuleSynthesis || d.coreDisposition || '');
}

function sentence(s: string): string {
  const t = s.trim();
  if (!t) return '';
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

function lower(s: string): string {
  const t = s.trim();
  if (!t) return '';
  return /[āīūṛṝḷēōṃḥśṣṭḍṇñṅĀĪŪṚŚṢṬḌṆ]/.test(t) ? t : t.toLowerCase();
}

/** The layer that carried a domain, and the one that dragged it. */
function bestAndWorst(score: DomainScore): { best: string; worst: string } {
  const sorted = [...score.layers].sort((a, b) => b.score - a.score);
  return { best: sorted[0]?.read ?? '', worst: sorted[sorted.length - 1]?.read ?? '' };
}

/**
 * One line per domain: what the evaluator concluded, then how firmly it stands
 * and why. Kept to a single sentence so a movement of three domains still reads
 * as a paragraph rather than a list of verdicts.
 */
function describe(score: DomainScore, d: DomainIndication | undefined): string {
  const base = summaryOf(d);
  const { best } = bestAndWorst(score);

  const qualifier =
    score.tone === 'strong' ? 'firmly grounded'
      : score.tone === 'favourable' ? 'reasonably supported'
        : score.tone === 'mixed' ? 'unevenly supported'
          : 'thinly grounded';

  const why = best ? ` — ${qualifier}, because ${plain(best)}` : ` — ${qualifier}`;
  // With no evaluator summary the label stands in, and a colon reads better
  // than the em dash used when there is a sentence to qualify.
  if (!base) return `${score.label}: ${qualifier}${best ? `, because ${plain(best)}` : ''}.`;

  return `${base.replace(/[.!?]$/, '')}${why}.`;
}

/** The movement's own verdict, naming what carried it and what dragged it. */
function movementVerdict(scores: DomainScore[], activation: 'active' | 'dormant' | 'partial'): string {
  if (scores.length === 0) return '';
  const sorted = [...scores].sort((a, b) => b.total - a.total);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];

  const spread = top.total - bottom.total;
  const shape =
    spread >= 30 ? 'uneven — one area carries the rest'
      : spread >= 12 ? 'moderately even'
        : 'even';

  const activationLine =
    activation === 'active' ? 'The running period opens this now.'
      : activation === 'dormant' ? 'The running period does not open this yet, so read it as capacity rather than as present event.'
        : 'The running period opens part of this.';

  // A one- or two-point gap is noise; naming a "weaker" ground there would
  // invent a distinction the scores do not support.
  const contrast = top.id !== bottom.id && spread >= 10
    ? ` ${top.label.split('&')[0].trim()} is the stronger ground (${top.total}); ${bottom.label.split('&')[0].trim()} the weaker (${bottom.total}).`
    : '';

  return `Taken together the picture is ${shape}.${contrast} ${activationLine}`;
}

/** Whether the daśā layer opens a movement now. */
function activationOf(scores: DomainScore[]): 'active' | 'dormant' | 'partial' {
  if (scores.length === 0) return 'partial';
  const dashaScores = scores.map(
    (s) => s.layers.find((l) => l.name === 'Daśā')?.score ?? 0.5
  );
  const avg = dashaScores.reduce((a, b) => a + b, 0) / dashaScores.length;
  if (avg >= 0.6) return 'active';
  if (avg <= 0.35) return 'dormant';
  return 'partial';
}

/** Every phala the twelve evaluators produced, with the domain it came from. */
function collectPhalas(report: ClassicalIndicationsReport) {
  const out: Array<{ domain: DomainId; phala: any }> = [];
  for (const id of report.orderedDomainIds ?? []) {
    for (const phala of (report.domains?.[id]?.directClassicalPhalas ?? [])) {
      out.push({ domain: id as DomainId, phala });
    }
  }
  return out;
}

/**
 * A condition shared by three or more domains.
 *
 * The evaluators each test their own houses, so a combust Jupiter sitting in
 * the 5th and aspecting the 7th shows up as two unrelated "Condition Not Met"
 * lines. Naming the shared cause is what turns twelve verdicts into a reading.
 */
function findThreads(report: ClassicalIndicationsReport) {
  // A domain is "thin" when at least one of its classical rules was tested and
  // failed. Its keyGrahas are the grahas the evaluator itself nominated as the
  // carriers of that domain, so a graha recurring across thin domains is the
  // shared cause — no text parsing, no guessing.
  const thin: Array<{ title: string; grahas: string[] }> = [];
  for (const id of report.orderedDomainIds ?? []) {
    const d = report.domains?.[id];
    const ph = d?.directClassicalPhalas ?? [];
    if (!ph.length) continue;
    if (!ph.some((x: any) => !x.allConditionsMet)) continue;
    // Only the primary significator: every domain nominates three or four
    // grahas, so counting them all makes almost any graha look like a thread.
    const primary = String((d?.keyGrahas ?? [])[0] ?? '');
    const grahas = /^(sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu)$/i.test(primary)
      ? [primary] : [];
    if (grahas.length) thin.push({ title: d?.title ?? String(id), grahas });
  }

  const byGraha = new Map<string, string[]>();
  for (const { title, grahas } of thin) {
    for (const g of grahas) {
      const key = g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
      if (!byGraha.has(key)) byGraha.set(key, []);
      byGraha.get(key)!.push(title);
    }
  }

  return [...byGraha.entries()]
    .filter(([, domains]) => domains.length >= 3)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([graha, domains]) => ({
      observation:
        `${graha} is the primary significator in ${domains.length} domains whose classical rule failed — ` +
        'one placement carrying several weaknesses, not several separate ones.',
      domains,
    }));
}

/**
 * Compose the overall reading from the domain report and the chart.
 */
export function buildOverallReading(
  report: ClassicalIndicationsReport,
  chart: any
): OverallReading {
  const g = report.globalChartSummary;
  const dom = (id: DomainId) => report.domains?.[id];

  // Score every domain the report produced.
  const specs: DomainSpec[] = (report.orderedDomainIds ?? []).map((id) => {
    const d = report.domains?.[id];
    const ph = d?.directClassicalPhalas ?? [];
    return {
      id,
      label: d?.title ?? id,
      house: d?.primaryBhavas?.[0] ?? 1,
      karakas: [...new Set((d?.keyGrahas ?? []) as any)] as any,
      vargas: d?.keyVargas ?? ['D1', 'D9'],
      // The sixth layer: what the texts said about this domain, in the score.
      classical: ph.length
        ? { tested: ph.length, met: ph.filter((x: any) => x.allConditionsMet).length }
        : undefined,
    };
  });
  const scores = scoreAllDomains(chart, specs);
  const byId = new Map(scores.map((s) => [s.id, s]));

  const pick = (ids: DomainId[]): DomainScore[] =>
    ids.map((id) => byId.get(id)).filter((s): s is DomainScore => !!s)
      .sort((a, b) => b.total - a.total);

  const groups: Array<{ title: string; ids: DomainId[] }> = [
    { title: 'Who they are', ids: ['constitution', 'temperament', 'status'] },
    { title: 'How they make their way', ids: ['career', 'wealth', 'education'] },
    { title: 'Who they share life with', ids: ['marriage', 'family', 'children'] },
    { title: 'Footing — physical and inner', ids: ['health', 'spirituality', 'life_themes'] },
  ];

  const allPhalas = collectPhalas(report);
  const phalasOf = (ids: DomainId[]) => allPhalas.filter((x) => ids.includes(x.domain));

  const movements = groups.map((grp) => {
    const gs = pick(grp.ids);
    const activation = activationOf(gs);
    const lines = grp.ids
      .map((id) => {
        const s = byId.get(id);
        return s ? describe(s, dom(id)) : '';
      })
      .filter(Boolean)
      .join(' ');

    // What the texts said about this movement, not just what the score says.
    const ph = phalasOf(grp.ids);
    const met = ph.filter((x) => x.phala.allConditionsMet);
    const classical = {
      tested: ph.length,
      met: met.length,
      sources: [...new Set(met.map((x) => String(x.phala.sourceText ?? '')).filter(Boolean))],
      citations: met.map((x) => String(x.phala.chapterAndVerse ?? '')).filter(Boolean).slice(0, 6),
    };
    const evidenceLine =
      ph.length === 0 ? ''
        : met.length === 0
          ? ` No classical rule was met for this movement — ${ph.length} were tested and every condition failed.`
          : ` Of ${ph.length} classical rules tested here, ${met.length} hold${classical.sources.length ? `, across ${classical.sources.length} text${classical.sources.length === 1 ? '' : 's'}` : ''}.`;

    const body = `${lines}${evidenceLine} ${movementVerdict(gs, activation)}`.trim();
    return { title: grp.title, scores: gs, body, activation, classical };
  }).filter((m) => m.body.length > 0);

  const lagnaName = plain(g.ascendantSign).split('(')[0].trim();
  const moonName = plain(g.moonSign).split('(')[0].trim();

  const strongest = [...scores].sort((a, b) => b.total - a.total)[0];
  const weakest = [...scores].sort((a, b) => a.total - b.total)[0];

  // Per-text tally across the whole reading.
  const byTextMap = new Map<string, { tested: number; met: number }>();
  for (const { phala } of allPhalas) {
    const t = String(phala.sourceText ?? '');
    if (!t) continue;
    const cur = byTextMap.get(t) ?? { tested: 0, met: 0 };
    cur.tested += 1;
    if (phala.allConditionsMet) cur.met += 1;
    byTextMap.set(t, cur);
  }
  const byText = [...byTextMap.entries()]
    .map(([text, v]) => ({ text, ...v }))
    .sort((a, b) => b.tested - a.tested);

  const contradictions = [...new Set(
    allPhalas
      .map((x) => String(x.phala.reconciliationNotes ?? '').trim())
      .filter((n) => n.length > 20)
  )].slice(0, 4);

  const evidence = {
    rulesTested: allPhalas.length,
    rulesMet: allPhalas.filter((x) => x.phala.allConditionsMet).length,
    byText,
    contradictions,
  };


  const headline =
    `${lagnaName} ascendant with the Moon in ${moonName} — ` +
    `${lower(plain(g.dominantElement))} in temperament, ${lower(plain(g.dominantGuna))} by disposition. ` +
    (strongest && weakest && strongest.id !== weakest.id
      ? `${strongest.label.split('&')[0].trim()} is the firmest ground here; ${weakest.label.split('&')[0].trim()} the thinnest.`
      : '') +
    (evidence.rulesTested > 0
      ? ` ${evidence.rulesMet} of ${evidence.rulesTested} classical rules tested hold for this chart.`
      : '');

  const atAGlance = [
    { label: 'Ascendant', value: plain(g.ascendantSign) },
    { label: 'Ascendant lord', value: plain(g.ascendantLord) },
    { label: 'Moon', value: `${plain(g.moonSign)} · ${plain(g.moonNakshatra)}` },
    { label: 'Sun', value: plain(g.sunSign) },
    { label: 'Ātmakāraka', value: plain(g.atmakaraka) },
    { label: 'Amatyakāraka', value: plain(g.amatyakaraka) },
    { label: 'Strongest by ṣaḍbala', value: plain(g.strongestPlanetByShadbala) },
    { label: 'Element', value: plain(g.dominantElement) },
    { label: 'Guṇa', value: plain(g.dominantGuna) },
  ].filter((x) => x.value.length > 0);

  const thinnest = [...scores].sort((a, b) => a.total - b.total).slice(0, 3)
    .filter((s) => s.tone === 'weak' || s.tone === 'mixed')
    .map((s) => s.label);

  const strongButDormant = scores
    .filter((s) => (s.tone === 'strong' || s.tone === 'favourable') &&
      (s.layers.find((l) => l.name === 'Daśā')?.score ?? 0) <= 0.3)
    .map((s) => s.label);

  const threads = findThreads(report);

  const method =
    'Each domain is scored on six layers — the house lord 35%, its natural significator 22%, ' +
    'the divisional chart 13%, aṣṭakavarga bindus 9%, whether the running daśā opens it 9%, ' +
    'and how many of the domain\'s own classical rules the chart met 12%. ' +
    'The sixth layer is there because the other five and the rule layer could disagree outright: ' +
    'a domain could look strong on dignity and ṣaḍbala while every verse written about it failed. ' +
    'The weights are a convention, not a verse; they are stated so the reading can be argued with.';

  return { headline, method, movements, atAGlance, thinnest, strongButDormant, evidence, threads };
}

/** The single paragraph form, for places that want one block of prose. */
export function overallReadingAsProse(r: OverallReading): string {
  return [r.headline, ...r.movements.map((m) => `${m.title}. ${m.body}`)].join('\n\n');
}

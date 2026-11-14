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
  }>;
  atAGlance: Array<{ label: string; value: string }>;
  /** Domains resting on the thinnest ground. */
  thinnest: string[];
  /** Domains that are strong but not currently activated. */
  strongButDormant: string[];
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
    return {
      id,
      label: d?.title ?? id,
      house: d?.primaryBhavas?.[0] ?? 1,
      karakas: [...new Set((d?.keyGrahas ?? []) as any)] as any,
      vargas: d?.keyVargas ?? ['D1', 'D9'],
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
    const body = `${lines} ${movementVerdict(gs, activation)}`.trim();
    return { title: grp.title, scores: gs, body, activation };
  }).filter((m) => m.body.length > 0);

  const lagnaName = plain(g.ascendantSign).split('(')[0].trim();
  const moonName = plain(g.moonSign).split('(')[0].trim();

  const strongest = [...scores].sort((a, b) => b.total - a.total)[0];
  const weakest = [...scores].sort((a, b) => a.total - b.total)[0];

  const headline =
    `${lagnaName} ascendant with the Moon in ${moonName} — ` +
    `${lower(plain(g.dominantElement))} in temperament, ${lower(plain(g.dominantGuna))} by disposition. ` +
    (strongest && weakest && strongest.id !== weakest.id
      ? `${strongest.label.split('&')[0].trim()} is the firmest ground here; ${weakest.label.split('&')[0].trim()} the thinnest.`
      : '');

  const atAGlance = [
    { label: 'Ascendant', value: plain(g.ascendantSign) },
    { label: 'Ascendant lord', value: plain(g.ascendantLord) },
    { label: 'Moon', value: `${plain(g.moonSign)} · ${plain(g.moonNakshatra)}` },
    { label: 'Sun', value: plain(g.sunSign) },
    { label: 'Ātmakāraka', value: plain(g.atmakaraka) },
    { label: 'Amatyakāraka', value: plain(g.amatyakāraka) },
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

  const method =
    'Each domain is scored on five layers — the house lord 40%, its natural significator 25%, ' +
    'the divisional chart 15%, aṣṭakavarga bindus 10%, and whether the running daśā opens it 10%. ' +
    'The weights are a convention, not a verse; they are stated so the reading can be argued with.';

  return { headline, method, movements, atAGlance, thinnest, strongButDormant };
}

/** The single paragraph form, for places that want one block of prose. */
export function overallReadingAsProse(r: OverallReading): string {
  return [r.headline, ...r.movements.map((m) => `${m.title}. ${m.body}`)].join('\n\n');
}

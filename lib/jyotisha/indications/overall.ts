/**
 * Overall reading.
 *
 * The domain evaluators answer twelve separate questions. This composes them into
 * one reading — the chart's disposition as a whole, in four movements: who the
 * person is, how they make their way, who they share life with, and the inner and
 * physical footing. Nothing here is a new judgement; every clause comes from a
 * domain's own synthesised summary.
 *
 * Deliberately deterministic: no model, no generation. Reordering or editing the
 * prose below changes the reading, so it is kept short and literal.
 */

import type { ClassicalIndicationsReport, DomainId, DomainIndication } from './types';

export interface OverallReading {
  /** One line naming the chart's centre of gravity. */
  headline: string;
  /** Four movements, in order. */
  movements: Array<{ title: string; body: string }>;
  /** The chart facts the reading rests on. */
  atAGlance: Array<{ label: string; value: string }>;
  /** Domains whose evaluator found no verified classical rule. */
  thinGrounds: string[];
}

/**
 * Parentheticals worth keeping: English sign names and numeric detail. Everything
 * else in brackets is a Sanskrit gloss, and the reading should not need a
 * glossary to be read.
 */
const KEEP_PARENTHETICAL =
  /^(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces|\d.*)$/i;

/**
 * Strip the markup the domain summaries carry, leaving plain sentences.
 *
 * Three things go, because this panel now gives one reading rather than a rule
 * audit: parenthetical glosses, rule citations, and the evaluator's own note that
 * no rule fired.
 */
function plain(s: string | undefined): string {
  if (!s) return '';
  let out = s
    .replace(/\s*\(([^)]*)\)/g, (m, inner: string) =>
      KEEP_PARENTHETICAL.test(inner.trim()) ? m : '')
    // Rule citations. Only the citation goes, never the verb: "are established
    // through classical Kendra-Koṇa synergies" becomes "are established", which
    // still reads, where dropping the whole clause left a bare noun phrase.
    .replace(/\s+(?:by|under|through|from)\s+classical[^.;,]*/gi, '')
    .replace(/\s+(?:by|under|through)\s+(?:the\s+)?(?:\d+(?:st|nd|rd|th)\s+)?(?:house|bhāva)\s+rules?/gi, '')
    .replace(/\s*No direct canonical configuration[^.]*\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // A stripped clause can leave a copula dangling ("...companionship are.").
  out = out.replace(/\s+(?:is|are|was|were|be|being)\s*([.;]|$)/gi, '$1');

  return out;
}

/** First sentence only — the domain summaries run long. */
function firstSentence(s: string): string {
  const p = plain(s);
  const m = p.match(/^(.{20,240}?[.!?])(\s|$)/);
  const first = (m ? m[1] : p).trim();
  return first.replace(/\s+(?:is|are|was|were|be|being)\s*([.;]|$)/gi, '$1').trim();
}

/** Sentence case for a phrase used mid-sentence. */
function lower(s: string): string {
  const t = s.trim();
  if (!t) return '';
  return /[āīūṛṝḷēōṃḥśṣṭḍṇñṅĀĪŪṚŚṢṬḌṆ]/.test(t) ? t : t.toLowerCase();
}

/** Join sentences with correct terminal punctuation. */
function sentence(s: string): string {
  const t = s.trim();
  if (!t) return '';
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

/** Pull the summary of a domain, preferring the concise one. */
function summaryOf(d: DomainIndication | undefined): string {
  if (!d) return '';
  const src = d.conciseSummary || d.multiRuleSynthesis || d.coreDisposition || '';
  return firstSentence(src);
}

function dispositionOf(d: DomainIndication | undefined): string {
  if (!d) return '';
  return plain(d.coreDisposition ?? '');
}

/**
 * Compose the overall reading.
 */
export function buildOverallReading(report: ClassicalIndicationsReport): OverallReading {
  const g = report.globalChartSummary;
  const dom = (id: DomainId) => report.domains?.[id];

  const self = [dom('constitution'), dom('temperament'), dom('status')];
  const work = [dom('career'), dom('wealth'), dom('education')];
  const bonds = [dom('marriage'), dom('family'), dom('children')];
  const inner = [dom('health'), dom('spirituality'), dom('life_themes')];

  const weave = (list: Array<DomainIndication | undefined>): string =>
    list
      .map(summaryOf)
      .filter((s) => s.length > 0)
      .map(sentence)
      .join(' ');

  const lagnaName = plain(g.ascendantSign).split('(')[0].trim();
  const moonName = plain(g.moonSign).split('(')[0].trim();

  const headline =
    `${lagnaName} ascendant with the Moon in ${moonName} — ` +
    `${lower(plain(g.dominantElement))} in temperament, ${lower(plain(g.dominantGuna))} by disposition.`;

  const movements = [
    { title: 'Who they are', body: weave(self) },
    { title: 'How they make their way', body: weave(work) },
    { title: 'Who they share life with', body: weave(bonds) },
    { title: 'Footing — physical and inner', body: weave(inner) },
  ].filter((m) => m.body.length > 0);

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

  const thinGrounds = (report.orderedDomainIds ?? [])
    .map((id) => report.domains?.[id])
    .filter((d): d is DomainIndication => !!d && d.hasVerifiedRule === false)
    .map((d) => d.title);

  return { headline, movements, atAGlance, thinGrounds };
}

/** The single paragraph form, for places that want one block of prose. */
export function overallReadingAsProse(r: OverallReading): string {
  return [r.headline, ...r.movements.map((m) => `${m.title}. ${m.body}`)].join('\n\n');
}

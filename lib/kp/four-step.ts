/**
 * KP — the four-step check.
 *
 * The procedure a KP astrologer actually runs, in the order the texts give it.
 * Every step already existed as a separate calculation; this chains them so the
 * answer to "is this matter promised, and when" is one verdict rather than four
 * tables the reader has to assemble themselves.
 *
 *   1. PROMISE   — is the cusp's sub lord a significator of the matter's houses?
 *   2. STRENGTH  — which significators are strong enough to deliver it?
 *   3. RULING    — do the ruling planets of the moment corroborate?
 *   4. TIMING    — which daśā window covers the whole house group?
 *
 * The order matters. A matter denied at step 1 is not rescued by a good daśā at
 * step 4 — that is the point of the sequence, and collapsing it is the commonest
 * way a KP reading goes wrong.
 */

import type { JyotishaChart, PlanetId } from '../jyotisha/types';
import { GRAHA_PROPERTIES } from '../jyotisha/constants';
import type { KpLayer } from './index';
import { KP_MATTERS } from './constants';

export type StepVerdict = 'yes' | 'no' | 'partial' | 'unknown';

export interface KpStep {
  step: 1 | 2 | 3 | 4;
  title: string;
  /** What the step asks, in one line. */
  question: string;
  verdict: StepVerdict;
  /** The finding in plain words. */
  finding: string;
  /** The evidence the verdict rests on. */
  evidence: string[];
}

export interface FourStepResult {
  matter: string;
  matterLabel: string;
  house: number;
  matterHouses: number[];
  steps: KpStep[];
  /** The chain's conclusion, which is the weakest step's verdict. */
  conclusion: string;
  /** Overall: does the matter deliver, and when. */
  outcome: 'promised-and-timed' | 'promised-untimed' | 'denied' | 'inconclusive';
}

const nameOf = (id: PlanetId): string => GRAHA_PROPERTIES[id]?.name ?? String(id);

/**
 * Run the four steps for one matter.
 */
export function fourStepCheck(
  chart: JyotishaChart,
  layer: KpLayer,
  matterKey: string,
  now: Date = new Date()
): FourStepResult | null {
  const matter = KP_MATTERS[matterKey];
  if (!matter) return null;

  const promise = layer.promises[matterKey];
  const sig = layer.significators[matter.primary];
  const timing = layer.timing[matterKey];
  const ruling = layer.ruling;

  // ---- Step 1: is the matter promised at all? --------------------------
  const step1: KpStep = {
    step: 1,
    title: 'Promise',
    question: `Does the ${matter.primary}th cusp's sub lord signify the matter houses?`,
    verdict: promise
      ? promise.promise === 'promised' || promise.promise === 'promised-when-direct'
        ? 'yes'
        : promise.promise === 'mixed' ? 'partial' : promise.promise === 'denied' ? 'no' : 'unknown'
      : 'unknown',
    finding: promise
      ? promise.reading
      : 'The cusp could not be evaluated.',
    evidence: promise
      ? [
          `Sub lord: ${nameOf(promise.subLord)}${promise.subLordRetrograde ? ' (retrograde)' : ''}`,
          `Signifies houses: ${promise.signifies.join(', ') || 'none'}`,
          `Matter houses held: ${promise.hitsMatter.join(', ') || 'none'}`,
          `Detrimental houses held: ${promise.hitsDetrimental.join(', ') || 'none'}`,
          `Cusp fertility: ${promise.fertility}`,
        ]
      : [],
  };

  // ---- Step 2: which significators can deliver? ------------------------
  const ranked = sig?.ranked ?? [];
  const rpSet = new Set<PlanetId>(ruling.distinct);
  const strong = ranked.filter((r) => r.level <= 2);
  const step2: KpStep = {
    step: 2,
    title: 'Significators',
    question: 'Which grahas actually signify the house, and how strongly?',
    verdict: ranked.length === 0 ? 'unknown' : strong.length > 0 ? 'yes' : 'partial',
    finding:
      ranked.length === 0
        ? 'No graha signifies this house by any of the four links.'
        : `${ranked.length} graha(s) signify house ${matter.primary}; ${strong.length} at level 1 or 2, which is what can deliver.`,
    evidence: ranked.slice(0, 8).map(
      (r) => `L${r.level} · ${r.planetName}${rpSet.has(r.planet) ? ' — also a ruling planet' : ''}`
    ),
  };

  // ---- Step 3: do the ruling planets corroborate? ----------------------
  const overlap = ranked.filter((r) => rpSet.has(r.planet)).map((r) => r.planetName);
  const step3: KpStep = {
    step: 3,
    title: 'Ruling planets',
    question: 'Do the ruling planets of the moment appear among the significators?',
    verdict: overlap.length > 0 ? 'yes' : 'no',
    finding:
      overlap.length > 0
        ? `${overlap.join(', ')} ${overlap.length === 1 ? 'is' : 'are'} both a significator of this house and a ruling planet of the moment — the chart is ripe.`
        : 'No significator of this house rules the moment, so the chart is not ripe for it now.',
    evidence: [
      `Ruling set: ${ruling.workingSet.map((r) => r.planetName).join(', ') || 'none'}`,
      ...(ruling.omittedRetrograde.length
        ? [`Omitted for retrogression: ${ruling.omittedRetrograde.map(nameOf).join(', ')}`]
        : []),
    ],
  };

  // ---- Step 4: is there a daśā window? ---------------------------------
  const windows = timing?.windows ?? [];
  const step4: KpStep = {
    step: 4,
    title: 'Timing',
    question: 'Which period covers the whole house group?',
    verdict: windows.length > 0 ? 'yes' : 'no',
    finding:
      windows.length > 0
        ? `${windows.length} window(s) in the current mahādaśā have lords that together cover ${timing.matterHouses.join(', ')}.`
        : `No period in the current mahādaśā covers all of ${timing?.matterHouses.join(', ') ?? matter.matter.join(', ')}.`,
    evidence: windows.slice(0, 5).map(
      (w) => `${w.from.slice(0, 10)} → ${w.to.slice(0, 10)} · ${w.lords.map((l) => l.lordName).join(' › ')} · covers ${w.covered.join(',')}`
    ),
  };

  const steps = [step1, step2, step3, step4];

  // The chain is only as strong as its first refusal: a denied promise is not
  // rescued by a good daśā, which is the whole reason the steps are ordered.
  let outcome: FourStepResult['outcome'];
  let conclusion: string;

  if (step1.verdict === 'no') {
    outcome = 'denied';
    conclusion =
      'Step 1 refuses: the cuspal sub lord signifies the detrimental houses, so the matter is not promised. ' +
      'No daśā window at step 4 can override that — the sequence exists precisely so it does not.';
  } else if (step1.verdict === 'unknown') {
    outcome = 'inconclusive';
    conclusion = 'The cusp could not be judged, so the chain stops at step 1.';
  } else if (step1.verdict === 'partial') {
    outcome = windows.length > 0 ? 'promised-and-timed' : 'inconclusive';
    conclusion =
      'The sub lord signifies both the matter and the detrimental houses, so both results are given — ' +
      (windows.length > 0
        ? `and step 4 finds ${windows.length} window(s) where the period lords favour it.`
        : 'but no current period covers the whole group, so the timing is open.');
  } else {
    outcome = windows.length > 0 ? 'promised-and-timed' : 'promised-untimed';
    conclusion =
      windows.length > 0
        ? `Promised, and timed: ${windows.length} delivering window(s) fall inside the running mahādaśā` +
          (step3.verdict === 'yes' ? ', corroborated by the ruling planets.' : '.')
        : 'Promised, but no period in the running mahādaśā covers the whole house group — the matter waits for a later mahādaśā.';
  }

  return {
    matter: matterKey,
    matterLabel: matter.label,
    house: matter.primary,
    matterHouses: matter.matter,
    steps,
    conclusion,
    outcome,
  };
}

/** Run all four steps for every matter. */
export function fourStepForAll(
  chart: JyotishaChart,
  layer: KpLayer,
  now: Date = new Date()
): FourStepResult[] {
  return Object.keys(KP_MATTERS)
    .map((k) => fourStepCheck(chart, layer, k, now))
    .filter((r): r is FourStepResult => !!r);
}

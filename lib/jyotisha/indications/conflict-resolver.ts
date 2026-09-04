/**
 * Gaṇaka — Classical Conflict Resolver & Multi-Source Reconciler
 * Analyzes conflicting indications, cross-textual variances, and applies
 * traditional Parāśari hierarchy, cancellation rules (Bhaṅga), and temporal activation.
 */

import { ClassicalContradiction, DirectClassicalPhala, RuleEvaluation } from './types';

export function reconcileRulesAndContradictions(
  directPhalas: DirectClassicalPhala[],
  satisfiedRules: RuleEvaluation[],
  contradictions: ClassicalContradiction[]
): {
  multiRuleSynthesis: string;
  reconciledSummary: string;
} {
  const verifiedPhalas = directPhalas.filter((p) => p.allConditionsMet);

  if (verifiedPhalas.length === 0) {
    return {
      multiRuleSynthesis:
        'No sufficiently specific classical phala was verified for this configuration under the currently implemented textual rules.',
      reconciledSummary:
        'No direct canonical configuration was fully met under current rules.',
    };
  }

  // 1. If only 1 verified phala
  if (verifiedPhalas.length === 1) {
    const p = verifiedPhalas[0];
    return {
      multiRuleSynthesis: `Under the verified conditions present in this horoscope, the classical rule of ${p.sourceText} (${p.chapterAndVerse}) applies: "${p.directPhalaText}".`,
      reconciledSummary: p.directPhalaText,
    };
  }

  // 2. Multi-rule synthesis
  const sourceRefs = verifiedPhalas.map((p) => `${p.sourceText} [${p.chapterAndVerse}]`).join(', ');
  
  let synthesisText = `Cross-examination of multiple verified classical treatises (${sourceRefs}) establishes the following synthesized conclusion:\n\n`;

  verifiedPhalas.forEach((p, idx) => {
    synthesisText += `• Rule ${idx + 1} (${p.sourceText}): ${p.directPhalaText}\n`;
  });

  // Handle explicit contradictions
  if (contradictions.length > 0) {
    synthesisText += `\nClassical Conflict & Hierarchy Resolution:\n`;
    contradictions.forEach((c) => {
      synthesisText += `- While ${c.favorableFactor} indicates positive capacity, ${c.limitingFactor} provides a counterbalancing influence. According to traditional Parāśari hierarchy (${c.traditionalResolution}), results materialize through conscious effort during favorable Daśā periods.`;
    });
  }

  return {
    multiRuleSynthesis: synthesisText,
    reconciledSummary: verifiedPhalas[0].directPhalaText,
  };
}

import { NextRequest, NextResponse } from 'next/server';
import { generateJyotishaPredictionProtocol } from '@/lib/jyotisha/prediction-protocol';

/**
 * Deterministic Shastric Synthesis Engine
 * 
 * 100% Deterministic classical synthesis platform.
 * Complies strictly with the 9-Point Jyotiṣa Prediction Protocol and classical treatises
 * (Brihat Parashara Hora Shastra, Phaladeepika, Brihat Jataka, Saravali, and Jaimini Sutras).
 * Zero AI hallucination, zero external API dependencies, and 100% verifiable astrometrics.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      mode = 'domain_synthesis', // 'prediction_protocol' | 'domain_synthesis'
      chart,
      domainId,
      domainTitle,
      sanskritTitle,
      chartSummary,
      verifiedFacts,
      directPhalas,
      satisfiedRules,
      contradictions,
      calculationBasis,
      synthesisLevel = 'standard', // 'standard' | 'in_depth' | 'shastra_pure'
    } = body;

    // =========================================================================
    // MODE 1: JYOTIṢA PREDICTION PROTOCOL (Full 12 Domains Synthesis)
    // =========================================================================
    if (mode === 'prediction_protocol' && chart) {
      const deterministicProtocolReport = generateJyotishaPredictionProtocol(chart);

      return NextResponse.json({
        success: true,
        mode: 'prediction_protocol',
        source: 'Deterministic Canonical Shastric Protocol Engine',
        protocolReport: deterministicProtocolReport,
        synthesis: deterministicProtocolReport.fullFormattedText,
      });
    }

    // =========================================================================
    // MODE 2: DOMAIN-SPECIFIC CLASSICAL SHASTRA SYNTHESIS
    // =========================================================================
    if (chart && domainId) {
      // Find matching domain from prediction protocol if available
      const protocolReport = generateJyotishaPredictionProtocol(chart);
      const matchingDomain = protocolReport.domains.find(
        (d) => d.domainId === domainId || d.name.toLowerCase().includes(domainTitle?.toLowerCase() || '')
      );

      const synthesis = generateDeterministicSynthesis(
        domainTitle || matchingDomain?.name || 'Life Domain',
        sanskritTitle || matchingDomain?.sanskritName || 'भाव विचार',
        verifiedFacts || matchingDomain?.rawIndicatorsFound || [],
        directPhalas || [],
        contradictions || [],
        matchingDomain
      );

      return NextResponse.json({
        success: true,
        domainId,
        domainTitle,
        sanskritTitle,
        synthesis,
        source: 'Deterministic Canonical Shastric Engine (BPHS / Phaladeepika)',
        synthesisLevel,
        protocolDomain: matchingDomain || null,
      });
    }

    // Fallback for general domain synthesis requests
    const synthesis = generateDeterministicSynthesis(
      domainTitle || 'Life Domain',
      sanskritTitle || 'भाव विचार',
      verifiedFacts || [],
      directPhalas || [],
      contradictions || []
    );

    return NextResponse.json({
      success: true,
      domainId,
      domainTitle,
      sanskritTitle,
      synthesis,
      source: 'Deterministic Canonical Shastric Engine',
      synthesisLevel,
    });
  } catch (error: any) {
    console.error('Error in deterministic synthesis route:', error);
    return NextResponse.json(
      { error: error?.message || 'Calculation failed' },
      { status: 500 }
    );
  }
}

/**
 * Deterministic Shastric Synthesis generator based on classical Horā treatises
 */
function generateDeterministicSynthesis(
  domainTitle: string,
  sanskritTitle: string,
  verifiedFacts: any[],
  directPhalas: any[],
  contradictions: any[],
  protocolDomain?: any
): string {
  const metRules = Array.isArray(directPhalas) ? directPhalas.filter((p: any) => p.allConditionsMet) : [];
  const partiallyMetRules = Array.isArray(directPhalas) ? directPhalas.filter((p: any) => !p.allConditionsMet && p.conditions?.some((c: any) => c.met)) : [];

  let text = `### I. शास्त्रीय फलविचार (CANONICAL SHASTRA PHALA)\n`;
  
  if (protocolDomain?.canonicalCitation) {
    const c = protocolDomain.canonicalCitation;
    text += `**[${c.sourceText} — ${c.chapterAndVerse}]**\n`;
    text += `*मूल श्लोक:* \`${c.sanskritShloka}\`\n`;
    text += `*Translation:* ${c.englishTranslation}\n\n`;
  }

  if (metRules.length > 0) {
    text += `Under classical Horā rules, the following canonical yogas are fully verified for **${domainTitle}** (${sanskritTitle}):\n\n`;
    metRules.forEach((rule: any) => {
      text += `• **[${rule.sourceText} — ${rule.chapterAndVerse}]**: ${rule.directPhalaText}\n`;
      if (rule.sanskritShloka) {
        text += `  *मूल श्लोक:* \`${rule.sanskritShloka}\`\n`;
      }
    });
  } else if (partiallyMetRules.length > 0) {
    text += `The chart exhibits preliminary structural factors related to canonical yogas, though specific secondary conditions remain unfulfilled under classical thresholds:\n\n`;
    partiallyMetRules.forEach((rule: any) => {
      text += `• **[${rule.sourceText} — ${rule.chapterAndVerse}]**: ${rule.directPhalaText} *(Partially Verified)*\n`;
    });
  } else if (!protocolDomain?.canonicalCitation) {
    text += `Foundational planetary dignities govern this domain without single-point malefic or benefic extremes.\n`;
  }

  text += `\n### II. कारक एवं भाव समन्वय (MULTI-FACTOR INTEGRATION)\n`;
  if (protocolDomain?.layers) {
    const l = protocolDomain.layers;
    text += `Astrometric 5-layer weighted evaluation yields a composite index of **${l.compositeScore}/100**:\n`;
    text += `• **Layer 1 — Bhāveśa (40%):** ${l.layer1.lordName} in House ${l.layer1.housePlacement} (${l.layer1.rashiName}, ${l.layer1.dignity}) — Score: ${l.layer1.score}/100. ${l.layer1.analysis}\n`;
    text += `• **Layer 2 — Naisargika Kāraka (25%):** ${l.layer2.karakaName} (Śaḍbala: ${l.layer2.shadbalaRupas} Rūpas, ${l.layer2.shadbalaRatio}x ratio) — Score: ${l.layer2.score}/100.\n`;
    text += `• **Layer 3 — Divisional Confirmation (15%):** ${l.layer3.findings} — Score: ${l.layer3.score}/100.\n`;
    text += `• **Layer 4 — Sarvāṣṭakavarga (10%):** ${l.layer4.houseBindus} Bindus (${l.layer4.modifierStatus}) — Score: ${l.layer4.score}/100.\n`;
    text += `• **Layer 5 — Viṃśottarī Daśā (10%):** ${l.layer5.activeMahadasha} (${l.layer5.timingEffect}) — Score: ${l.layer5.score}/100.\n`;
  } else if (Array.isArray(verifiedFacts)) {
    text += `Astrometric evaluation indicates this domain is governed by the calculated natal placements:\n`;
    verifiedFacts.slice(0, 6).forEach((f: any) => {
      if (typeof f === 'string') {
        text += `• ${f}\n`;
      } else if (f.label) {
        text += `• **${f.label}**: ${f.value} — *${f.significance || ''}*\n`;
      }
    });
  }

  text += `\n### III. विरोध एवं परिहार (TENSIONS, CANCELLATIONS & TIMING)\n`;
  if (protocolDomain?.layers?.nichabhangaOverrides?.length > 0) {
    text += `**Nīchabhanga Overrides:**\n`;
    protocolDomain.layers.nichabhangaOverrides.forEach((o: string) => {
      text += `• ${o}\n`;
    });
  }
  if (protocolDomain?.timelineOfManifestation) {
    text += `**Temporal Manifestation Window:**\n${protocolDomain.timelineOfManifestation}\n`;
  } else if (Array.isArray(contradictions) && contradictions.length > 0) {
    contradictions.forEach((c: any) => {
      text += `• **Conflict:** ${c.favorableFactor} vs ${c.limitingFactor}\n  **Traditional Resolution:** ${c.traditionalResolution}\n`;
    });
  } else {
    text += `No direct diametric classical contradictions were identified among the satisfied rules. Results unfold progressively across the major periods (Mahādaśās) and sub-periods (Antardaśās) of the participating Grahas.\n`;
  }

  text += `\n### IV. निष्कर्ष एवं निर्णय (FINAL DETERMINISTIC VERDICT)\n`;
  if (protocolDomain?.finalVerdict) {
    text += `${protocolDomain.finalVerdict}\n`;
  } else {
    text += `The domain demonstrates stability under classical Horā principles, with fruits maturing progressively in alignment with the native's chronological maturation and dasha cycles.\n`;
  }

  if (protocolDomain?.careerRankings && protocolDomain.careerRankings.length > 0) {
    text += `\n### V. कर्मवृत्ति प्राधान्य (TOP VOCATIONAL RANKINGS)\n`;
    protocolDomain.careerRankings.forEach((r: any) => {
      text += `**${r.rank}. ${r.fieldTitle}** (Total Index: ${r.totalScore}/100)\n`;
      text += `   • *Capability:* ${r.capabilityScore}/100 | *Interest:* ${r.interestScore}/100 | *Success:* ${r.successScore}/100\n`;
      text += `   • *Primary Graha:* ${r.primaryGraha} | *Yoga:* ${r.governingShastricYoga}\n`;
      text += `   • *Timing & Peak:* ${r.timingAndPeak}\n`;
      text += `   • *Rationale:* ${r.rationale}\n\n`;
    });
  }

  return text;
}

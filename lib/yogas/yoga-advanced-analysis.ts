/**
 * Gaṇaka — Classical Yoga Advanced Analysis Engine (Phase 4)
 * 
 * SOURCED STRICTLY FROM CANONICAL JYOTIṢA AUTHORITIES:
 * - Bṛhat Parāśara Horā Śāstra (BPHS)
 * - Bṛhat Jātaka (BJ)
 * - Sārāvalī (Sarv)
 * - Phaladīpikā (PD)
 * - Jātaka Pārijāta (JP)
 * - Uttara Kālāmṛta (UK)
 * - Jaimini Upadeśa Sūtras (JUS)
 * 
 * ARCHITECTURAL CONSTRAINTS:
 * 1. ZERO arbitrary scores, weights, percentages, or AI predictions.
 * 2. Deterministic qualification based on classical planetary dignity, Shadbala, combustion, vargottama, and bhanga rules.
 * 3. Conflicting Yogas are evaluated via canonical resolution rules; if no classical precedence exists, uncertainty is explicitly declared.
 * 4. Varga-specific formations evaluate purely against the selected divisional chart context.
 */

import { PlanetId } from '../astronomy/ephemeris';
import { DetectedYoga, JyotishaChart, RashiNumber, VargaId } from '../jyotisha/types';
import { GRAHA_PROPERTIES, RASHIS } from '../jyotisha/constants';
import { detectAllYogas } from './yoga-engine';
import { evaluateYogaActivation, YogaActivationReport } from './yoga-activation';

export interface GrahaQualification {
  planet: PlanetId;
  planetName: string;
  rashiNumber: RashiNumber;
  rashiName: string;
  house: number;
  dignity: 'Exalted' | 'Moolatrikona' | 'Own Sign' | 'Friendly' | 'Neutral' | 'Enemy' | 'Debilitated';
  isCombust: boolean;
  isRetrograde: boolean;
  isVargottama: boolean;
  shadbalaRatio?: number; // Total / Required
  shadbalaRank?: number;
  qualitativeNotes: string[];
}

export interface YogaQualificationReport {
  yogaId: string;
  yogaName: string;
  sanskritName: string;
  category: string;
  participatingGrahas: GrahaQualification[];
  bhangaPresent: boolean;
  bhangaDescription?: string;
  bhangaSource?: string;
  overallQualification: string[];
  canonicalBasis: string;
}

export interface YogaInteractionReport {
  pairId: string;
  yogaA: { id: string; name: string; category: string; nature: 'Auspicious' | 'Inauspicious' | 'Mixed' };
  yogaB: { id: string; name: string; category: string; nature: 'Auspicious' | 'Inauspicious' | 'Mixed' };
  interactionType: 'Cancellation' | 'Modification' | 'Temporal Separation' | 'Unresolved Conflict' | 'Mutual Reinforcement';
  classicalPrecedenceEstablished: boolean;
  classicalRule?: string;
  resultDescription: string;
  sourceText?: string;
}

export interface VargaYogaResult {
  vargaId: VargaId;
  vargaName: string;
  vargaSignificance: string;
  formedYogas: DetectedYoga[];
}

/**
 * Determines qualitative dignity of a planet in a given Rashi.
 */
export function getGrahaDignity(planet: PlanetId, rashi: RashiNumber): 'Exalted' | 'Moolatrikona' | 'Own Sign' | 'Friendly' | 'Neutral' | 'Enemy' | 'Debilitated' {
  const props = GRAHA_PROPERTIES[planet];
  if (!props) return 'Neutral';

  if (props.exaltationSign === rashi) return 'Exalted';
  if (props.debilitationSign === rashi) return 'Debilitated';
  if (props.moolatrikonaSign === rashi) return 'Moolatrikona';
  if (props.ownSigns && props.ownSigns.includes(rashi)) return 'Own Sign';

  const signLord = RASHIS[rashi].lord;
  if (signLord === planet) return 'Own Sign';

  // Natural relationships per Parashara
  // Sun friends: Moon, Mars, Jupiter; enemies: Venus, Saturn; neutral: Mercury
  // Moon friends: Sun, Mercury; enemies: none; neutral: Mars, Jupiter, Venus, Saturn
  // Mars friends: Sun, Moon, Jupiter; enemies: Mercury; neutral: Venus, Saturn
  // Mercury friends: Sun, Venus; enemies: Moon; neutral: Mars, Jupiter, Saturn
  // Jupiter friends: Sun, Moon, Mars; enemies: Mercury, Venus; neutral: Saturn
  // Venus friends: Mercury, Saturn; enemies: Sun, Moon; neutral: Mars, Jupiter
  // Saturn friends: Mercury, Venus; enemies: Sun, Moon, Mars; neutral: Jupiter
  const friendMap: Partial<Record<PlanetId, PlanetId[]>> = {
    sun: ['moon', 'mars', 'jupiter'],
    moon: ['sun', 'mercury'],
    mars: ['sun', 'moon', 'jupiter'],
    mercury: ['sun', 'venus'],
    jupiter: ['sun', 'moon', 'mars'],
    venus: ['mercury', 'saturn'],
    saturn: ['mercury', 'venus'],
    rahu: ['mercury', 'venus', 'saturn'],
    ketu: ['mars', 'jupiter'],
    true_rahu: ['mercury', 'venus', 'saturn'],
    true_ketu: ['mars', 'jupiter'],
  };

  const enemyMap: Partial<Record<PlanetId, PlanetId[]>> = {
    sun: ['venus', 'saturn'],
    moon: [],
    mars: ['mercury'],
    mercury: ['moon'],
    jupiter: ['mercury', 'venus'],
    venus: ['sun', 'moon'],
    saturn: ['sun', 'moon', 'mars'],
    rahu: ['sun', 'moon', 'mars'],
    ketu: ['sun', 'moon'],
    true_rahu: ['sun', 'moon', 'mars'],
    true_ketu: ['sun', 'moon'],
  };

  if (friendMap[planet]?.includes(signLord)) return 'Friendly';
  if (enemyMap[planet]?.includes(signLord)) return 'Enemy';
  return 'Neutral';
}

/**
 * Evaluates detailed qualitative qualifications for a formed Yoga.
 */
export function evaluateYogaQualification(yoga: DetectedYoga, chart: JyotishaChart): YogaQualificationReport {
  const grahaQualifications: GrahaQualification[] = [];
  const notes: string[] = [];

  const involved = yoga.involvedPlanets || [];

  for (const p of involved) {
    const pl = chart.planets[p];
    if (!pl) continue;

    const dignity = getGrahaDignity(p, pl.rashiNumber);
    const isVargottama = chart.vargottamaPlanets?.includes(p) || false;
    const shadbala = chart.shadbala?.[p];

    const qNotes: string[] = [];
    qNotes.push(`Positioned in ${pl.rashiName} (House ${pl.house})`);
    qNotes.push(`Dignity: ${dignity}`);

    if (pl.isCombust) {
      qNotes.push('Combust (Asta) — modified by close proximity to Sūrya');
    }
    if (pl.isRetrograde) {
      qNotes.push('Vakra (Retrograde) — endowed with high Cheṣṭā Bala');
    }
    if (isVargottama) {
      qNotes.push('Vargottama (identical sign in D1 and D9) — enhancing constitutional stability');
    }
    if (shadbala) {
      const ratioStr = shadbala.ratio.toFixed(2);
      if (shadbala.ratio >= 1.0) {
        qNotes.push(`Shadbala: ${shadbala.totalRupas.toFixed(1)} Rūpas (${ratioStr}x required — Rank ${shadbala.rank})`);
      } else {
        qNotes.push(`Shadbala: ${shadbala.totalRupas.toFixed(1)} Rūpas (${ratioStr}x required — below 1.0 threshold)`);
      }
    }

    grahaQualifications.push({
      planet: p,
      planetName: pl.name,
      rashiNumber: pl.rashiNumber,
      rashiName: pl.rashiName,
      house: pl.house,
      dignity,
      isCombust: pl.isCombust,
      isRetrograde: pl.isRetrograde,
      isVargottama,
      shadbalaRatio: shadbala?.ratio,
      shadbalaRank: shadbala?.rank,
      qualitativeNotes: qNotes,
    });
  }

  // Check specific Bhanga rules
  let bhangaPresent = false;
  let bhangaDescription: string | undefined;
  let bhangaSource: string | undefined;

  // 1. Neechabhanga
  const debilitatedGrahas = grahaQualifications.filter((g) => g.dignity === 'Debilitated');
  if (debilitatedGrahas.length > 0) {
    for (const deb of debilitatedGrahas) {
      const debProps = GRAHA_PROPERTIES[deb.planet];
      const debSignLord = RASHIS[deb.rashiNumber].lord;
      const debSignLordHouse = chart.planets[debSignLord]?.house;
      const exaltLord = RASHIS[debProps.exaltationSign].lord;
      const exaltLordHouse = chart.planets[exaltLord]?.house;

      const isKendra = (h?: number) => h === 1 || h === 4 || h === 7 || h === 10;

      if (isKendra(debSignLordHouse) || isKendra(exaltLordHouse)) {
        bhangaPresent = true;
        bhangaDescription = `Nīcabhaṅga Rāja Yoga: Debilitation of ${deb.planetName} is cancelled because ${
          isKendra(debSignLordHouse) ? `sign lord ${chart.planets[debSignLord].name}` : `exaltation lord ${chart.planets[exaltLord].name}`
        } is situated in a Kendra from Lagna.`;
        bhangaSource = 'Bṛhat Parāśara Horā Śāstra 39:1–5, Phaladīpikā 6:26–30';
        notes.push(bhangaDescription);
      }
    }
  }

  // 2. Kemadruma Bhanga
  if (yoga.id.includes('kemadruma')) {
    // Check if benefics occupy Kendras from Lagna or Chandra
    const jupiterH = chart.planets.jupiter?.house;
    const venusH = chart.planets.venus?.house;
    const mercuryH = chart.planets.mercury?.house;
    const moonH = chart.planets.moon?.house;

    const kendraFromLagna = [1, 4, 7, 10];
    const hasBeneficInKendra =
      kendraFromLagna.includes(jupiterH) ||
      kendraFromLagna.includes(venusH) ||
      kendraFromLagna.includes(mercuryH);

    if (hasBeneficInKendra || kendraFromLagna.includes(moonH)) {
      bhangaPresent = true;
      bhangaDescription = 'Kemadruma Bhaṅga: The inauspicious effects of Kemadruma are cancelled because auspicious planets occupy Kendra houses from the Lagna.';
      bhangaSource = 'Bṛhat Jātaka 13:6, Sārāvalī 13:10, Phaladīpikā 6:7';
      notes.push(bhangaDescription);
    }
  }

  // 3. Sakata Bhanga
  if (yoga.id.includes('sakata')) {
    const jupiterH = chart.planets.jupiter?.house;
    const jupiterDignity = getGrahaDignity('jupiter', chart.planets.jupiter?.rashiNumber);
    if (jupiterH === 1 || jupiterH === 4 || jupiterH === 7 || jupiterH === 10 || jupiterDignity === 'Exalted') {
      bhangaPresent = true;
      bhangaDescription = 'Śakaṭa Bhaṅga: The cyclic disruption of Śakaṭa Yoga is modified because Bṛhaspati (Jupiter) occupies a Kendra from Lagna / is in Exaltation.';
      bhangaSource = 'Phaladīpikā 6:57, Jātaka Pārijāta 7:16';
      notes.push(bhangaDescription);
    }
  }

  // Synthesize overall qualitative assessment
  const exaltedCount = grahaQualifications.filter((g) => g.dignity === 'Exalted' || g.dignity === 'Moolatrikona' || g.dignity === 'Own Sign').length;
  const combustCount = grahaQualifications.filter((g) => g.isCombust).length;

  if (exaltedCount > 0 && combustCount === 0) {
    notes.push('Participating Grahas hold dignified rāśi placement without combustion obstruction.');
  } else if (combustCount > 0) {
    notes.push('Yoga expression is qualified by combustion of one or more participating grahas.');
  }

  return {
    yogaId: yoga.id,
    yogaName: yoga.name,
    sanskritName: yoga.sanskritName,
    category: yoga.category,
    participatingGrahas: grahaQualifications,
    bhangaPresent,
    bhangaDescription,
    bhangaSource,
    overallQualification: notes.length > 0 ? notes : ['Evaluated on standard natal planetary positions and dignities.'],
    canonicalBasis: `${yoga.chapterAndVerse || yoga.sourceText}`,
  };
}

/**
 * Evaluates interactions, modifications, or conflicts between pairs of formed Yogas.
 */
export function evaluateYogaInteractions(formedYogas: DetectedYoga[], chart: JyotishaChart): YogaInteractionReport[] {
  const reports: YogaInteractionReport[] = [];
  if (!formedYogas || formedYogas.length < 2) return reports;

  const yogaIds = formedYogas.map((y) => y.id);

  // Helper to categorize nature
  const getNature = (y: DetectedYoga): 'Auspicious' | 'Inauspicious' | 'Mixed' => {
    if (y.category === 'Arishta') return 'Inauspicious';
    if (y.id.includes('daridra') || y.id.includes('kemadruma') || y.id.includes('sakata') || y.id.includes('pasa') || y.id.includes('sarpa')) {
      return 'Inauspicious';
    }
    if (y.category === 'Viparita') return 'Mixed';
    return 'Auspicious';
  };

  // 1. Neechabhanga vs Debilitation / Arishta
  const hasNeechabhanga = formedYogas.find((y) => y.id.includes('neechabhanga'));
  const hasArishta = formedYogas.filter((y) => getNature(y) === 'Inauspicious');

  if (hasNeechabhanga && hasArishta.length > 0) {
    for (const arishta of hasArishta) {
      reports.push({
        pairId: `${hasNeechabhanga.id}_vs_${arishta.id}`,
        yogaA: { id: hasNeechabhanga.id, name: hasNeechabhanga.name, category: hasNeechabhanga.category, nature: 'Auspicious' },
        yogaB: { id: arishta.id, name: arishta.name, category: arishta.category, nature: 'Inauspicious' },
        interactionType: 'Cancellation',
        classicalPrecedenceEstablished: true,
        classicalRule: 'Nīcabhaṅga Rāja Yoga cancels the debility-related adversity of the involved graha and converts the placement into an auspicious elevation.',
        resultDescription: 'Classical Horā texts establish that Nīcabhaṅga acts as an active neutralization of debilitation arishta, transforming the weakness into later elevation.',
        sourceText: 'BPHS 39:1–5, Phaladīpikā 6:26–30',
      });
    }
  }

  // 2. Raja/Dhana Yogas vs Kemadruma / Sakata
  const auspiciousYogas = formedYogas.filter((y) => getNature(y) === 'Auspicious' && (y.category === 'Raja' || y.category === 'Dhana' || y.category === 'Pancha Mahapurusha'));
  const inauspiciousYogas = formedYogas.filter((y) => getNature(y) === 'Inauspicious' && (y.id.includes('kemadruma') || y.id.includes('sakata')));

  for (const aus of auspiciousYogas) {
    for (const inaus of inauspiciousYogas) {
      // Check if Kemadruma has bhanga
      const isSakata = inaus.id.includes('sakata');
      const isKemadruma = inaus.id.includes('kemadruma');

      reports.push({
        pairId: `${aus.id}_vs_${inaus.id}`,
        yogaA: { id: aus.id, name: aus.name, category: aus.category, nature: 'Auspicious' },
        yogaB: { id: inaus.id, name: inaus.name, category: inaus.category, nature: 'Inauspicious' },
        interactionType: 'Temporal Separation',
        classicalPrecedenceEstablished: true,
        classicalRule: 'Temporal allocation: Auspicious results manifest during the Mahādaśā/Antardaśā of the auspicious yoga lords, whereas cyclic fluctuations or obstructions occur during the Dasha of the afflicted graha.',
        resultDescription: `${aus.name} and ${inaus.name} coexist in the natal foundation. Classical Horā states that the fruits of auspicious yogas are delivered during their respective Dasha periods, whereas ${isSakata ? 'cyclic fluctuations (Śakaṭa)' : isKemadruma ? 'periods of isolation/strain (Kemadruma)' : 'afflictions'} emerge during the period of the afflicted Grahas.`,
        sourceText: 'Phaladīpikā 20:34–36, BPHS 75:38–42',
      });
    }
  }

  // 3. Pairs of apparently conflicting yogas with NO classical precedence established
  const otherAuspicious = formedYogas.filter((y) => getNature(y) === 'Auspicious' && !auspiciousYogas.includes(y));
  const otherInauspicious = formedYogas.filter((y) => getNature(y) === 'Inauspicious' && !inauspiciousYogas.includes(y));

  for (const aus of otherAuspicious) {
    for (const inaus of otherInauspicious) {
      reports.push({
        pairId: `${aus.id}_vs_${inaus.id}`,
        yogaA: { id: aus.id, name: aus.name, category: aus.category, nature: 'Auspicious' },
        yogaB: { id: inaus.id, name: inaus.name, category: inaus.category, nature: 'Inauspicious' },
        interactionType: 'Unresolved Conflict',
        classicalPrecedenceEstablished: false,
        classicalRule: 'Classical sources available to the system do not establish a precedence rule between these combinations.',
        resultDescription: `Both ${aus.name} (${aus.category}) and ${inaus.name} (${inaus.category}) are mathematically formed in the chart. Canonical Horā literature does not state that one unconditionally dissolves the other; both retain distinct domain influences.`,
        sourceText: 'Classical Canon General Principle',
      });
    }
  }

  return reports;
}

/**
 * Evaluates formed classical yogas in any of the 16 Shodashavarga charts.
 */
export function detectVargaYogas(vargaId: VargaId, chart: JyotishaChart): VargaYogaResult {
  const varga = chart.vargas?.[vargaId];
  if (!varga) {
    return {
      vargaId,
      vargaName: vargaId,
      vargaSignificance: '',
      formedYogas: [],
    };
  }

  // Build the planet context strictly from the Varga chart
  const vargaPlanets: Record<
    PlanetId,
    {
      siderealLongitude: number;
      rashiNumber: RashiNumber;
      house: number;
      isCombust: boolean;
      isRetrograde: boolean;
    }
  > = {} as any;

  for (const p of Object.keys(varga.planets) as PlanetId[]) {
    const pl = varga.planets[p];
    const d1Pl = chart.planets[p];
    vargaPlanets[p] = {
      siderealLongitude: (pl.rashiNumber - 1) * 30 + (pl.degreeInRashi || 0),
      rashiNumber: pl.rashiNumber,
      house: pl.house,
      isCombust: d1Pl ? d1Pl.isCombust : false,
      isRetrograde: d1Pl ? d1Pl.isRetrograde : false,
    };
  }

  const formed = detectAllYogas(
    vargaPlanets,
    varga.lagnaRashi,
    (varga.lagnaRashi - 1) * 30 + (varga.lagnaDegreeInRashi || 0)
  );

  return {
    vargaId,
    vargaName: varga.name,
    vargaSignificance: varga.significance,
    formedYogas: formed,
  };
}

export interface CrossVargaRecurrence {
  yogaId: string;
  yogaName: string;
  sanskritName: string;
  category: string;
  formedInD1: boolean;
  recurringVargas: Array<{ vargaId: VargaId; vargaName: string }>;
  recurrenceCount: number;
  classicalContextNote: string;
}

/**
 * Computes cross-divisional recurrence of classical yogas across selected Shodashavarga charts.
 * Adheres strictly to canonical principles without assigning artificial percentage multipliers.
 */
export function getCrossVargaSummary(
  chart: JyotishaChart,
  targetVargas: VargaId[] = ['D9', 'D10', 'D2', 'D3', 'D7', 'D12']
): CrossVargaRecurrence[] {
  if (!chart.vargas) return [];

  const vargaResults: Record<VargaId, DetectedYoga[]> = {} as any;
  for (const vid of targetVargas) {
    if (chart.vargas[vid]) {
      vargaResults[vid] = detectVargaYogas(vid, chart).formedYogas;
    }
  }

  // D1 formed yogas map
  const d1Yogas = chart.yogas || [];
  const d1Map = new Map<string, DetectedYoga>();
  d1Yogas.forEach((y) => d1Map.set(y.id, y));

  // Collect all unique yoga IDs across D1 and evaluated Vargas
  const allYogaIds = new Set<string>();
  d1Yogas.forEach((y) => allYogaIds.add(y.id));
  Object.values(vargaResults).forEach((list) => {
    list.forEach((y) => allYogaIds.add(y.id));
  });

  const recurrences: CrossVargaRecurrence[] = [];

  for (const yId of allYogaIds) {
    const d1Yoga = d1Map.get(yId);
    const recurringVargas: Array<{ vargaId: VargaId; vargaName: string }> = [];

    for (const vid of targetVargas) {
      const list = vargaResults[vid] || [];
      const match = list.find((y) => y.id === yId);
      if (match && chart.vargas[vid]) {
        recurringVargas.push({
          vargaId: vid,
          vargaName: chart.vargas[vid].name,
        });
      }
    }

    // Only include if formed in D1 or recurs in at least one Varga
    if (d1Yoga || recurringVargas.length > 0) {
      const sample = d1Yoga || Object.values(vargaResults).flat().find((y) => y.id === yId);
      if (sample) {
        recurrences.push({
          yogaId: yId,
          yogaName: sample.name,
          sanskritName: sample.sanskritName,
          category: sample.category,
          formedInD1: !!d1Yoga,
          recurringVargas,
          recurrenceCount: (d1Yoga ? 1 : 0) + recurringVargas.length,
          classicalContextNote: d1Yoga
            ? recurringVargas.length > 0
              ? `Formed in D1 (Rāśi) and independently recurrent in ${recurringVargas.map((v) => v.vargaId).join(', ')}.`
              : 'Formed strictly in D1 (Rāśi) natal foundation.'
            : `Harmonically formed in divisional harmonic (${recurringVargas.map((v) => v.vargaId).join(', ')}), distinct from natal D1.`,
        });
      }
    }
  }

  // Sort by count descending (D1 presence first)
  return recurrences.sort((a, b) => {
    if (a.formedInD1 && !b.formedInD1) return -1;
    if (!a.formedInD1 && b.formedInD1) return 1;
    return b.recurrenceCount - a.recurrenceCount;
  });
}


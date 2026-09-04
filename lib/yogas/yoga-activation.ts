/**
 * Gaṇaka — Classical Yoga Activation & Manifestation Engine (Phase 2)
 * 
 * STRICTLY SOURCED FROM CLASSICAL JYOTIṢA CANON:
 * - Bṛhat Parāśara Horā Śāstra (BPHS) — Ch. 34, 35, 36, 37, 39, 41-42, 47-59, 75
 * - Phaladīpikā (PD) — Ch. 6, 19, 20
 * - Bṛhat Jātaka (BJ) — Ch. 12, 13, 20
 * - Sārāvalī (Sarv) — Ch. 13, 14, 15, 16, 17, 18, 21, 35
 * - Uttara Kālāmṛta (UK) — Kāṇḍa 4, v. 18-24
 * - Jātaka Pārijāta (JP) — Ch. 6, 7, 17, 18
 * - Jaimini Upadeśa Sūtras (JUS) — Ch. 1
 *
 * Separation of Concerns:
 * 1. Formation = Verified natal presence in the birth chart (already evaluated).
 * 2. Activation = Exact calculated timing/period when the yoga becomes relevant
 *    according to the verified classical textual rule.
 * 
 * A yoga that is not formed NEVER activates.
 * If canonical texts do not establish a timing rule for a yoga, returns "Activation rule not established."
 */

import { PlanetId } from '../astronomy/ephemeris';
import { DetectedYoga, DashaPeriod, JyotishaChart, RashiNumber } from '../jyotisha/types';
import { RASHIS } from '../jyotisha/constants';

export interface CalculatedPeriodSpan {
  type: 'Mahadasha' | 'Antardasha' | 'Pratyantardasha' | 'Lifelong' | 'Mutual Sub-period';
  label: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}

export interface YogaActivationReport {
  yogaId: string;
  yogaName: string;
  sanskritName: string;
  category: string;
  formation: 'Present' | 'Not Formed';
  isEstablished: boolean;
  relevantPeriodsText: string;
  calculatedPeriods: CalculatedPeriodSpan[];
  basis: string;
  source: string;
}

/**
 * Finds all Mahadasha periods of a given planet from the Vimshottari tree.
 */
function findMahadashas(tree: DashaPeriod[], planet: PlanetId): DashaPeriod[] {
  if (!tree) return [];
  return tree.filter((m) => m.lord === planet);
}

/**
 * Finds specific mutual Antardashas (e.g. Planet A MD -> Planet B AD).
 */
function findMutualAntardashas(
  tree: DashaPeriod[],
  planetA: PlanetId,
  planetB: PlanetId
): Array<{ mahadashaLord: PlanetId; antardashaLord: PlanetId; startDate: string; endDate: string }> {
  if (!tree) return [];
  const results: Array<{ mahadashaLord: PlanetId; antardashaLord: PlanetId; startDate: string; endDate: string }> = [];

  for (const maha of tree) {
    if (maha.lord === planetA && maha.subPeriods) {
      for (const antar of maha.subPeriods) {
        if (antar.lord === planetB) {
          results.push({
            mahadashaLord: planetA,
            antardashaLord: planetB,
            startDate: antar.startDate,
            endDate: antar.endDate,
          });
        }
      }
    }
  }

  return results;
}

/**
 * Checks if a given date string window covers the current timestamp.
 */
function isDateSpanCurrent(startDate?: string, endDate?: string): boolean {
  if (!startDate || !endDate) return false;
  const now = new Date().getTime();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return now >= start && now <= end;
}

/**
 * Capitalizes planet ID for display.
 */
function formatPlanetName(p: PlanetId): string {
  if (!p) return '';
  return p.charAt(0).toUpperCase() + p.slice(1);
}

/**
 * Evaluates the activation and manifestation timing for an ALREADY-DETECTED classical Yoga.
 * Strict rule: If Yoga is not formed, it must never become active.
 */
export function evaluateYogaActivation(
  yoga: DetectedYoga,
  chart: Pick<JyotishaChart, 'planets' | 'lagna' | 'bhavas' | 'vimshottari' | 'jaimini'>
): YogaActivationReport {
  const tree = chart.vimshottari?.tree || [];
  const lagnaRashi = chart.lagna.rashiNumber;

  // Helper to get house lord of house N
  const getHouseLord = (houseNum: number): PlanetId => {
    const rashiNum = (((lagnaRashi - 1 + (houseNum - 1)) % 12) + 1) as RashiNumber;
    return RASHIS[rashiNum].lord;
  };

  const yogaId = yoga.id;
  const planets = yoga.involvedPlanets || [];

  // =========================================================================
  // 1. PAÑCA MAHĀPURUṢA YOGAS
  // Classical Source: Phaladīpikā Ch. 20, v. 25-30; BPHS Ch. 75, v. 38
  // Rule: Manifests during the Mahādaśā & Antardaśā of the single forming planet.
  // =========================================================================
  if (
    yogaId === 'rucaka_yoga' ||
    yogaId === 'bhadra_yoga' ||
    yogaId === 'hamsa_yoga' ||
    yogaId === 'malavya_yoga' ||
    yogaId === 'shasha_yoga'
  ) {
    const formingPlanet: PlanetId =
      yogaId === 'rucaka_yoga'
        ? 'mars'
        : yogaId === 'bhadra_yoga'
        ? 'mercury'
        : yogaId === 'hamsa_yoga'
        ? 'jupiter'
        : yogaId === 'malavya_yoga'
        ? 'venus'
        : 'saturn';

    const mahas = findMahadashas(tree, formingPlanet);
    const calculatedPeriods: CalculatedPeriodSpan[] = [];

    mahas.forEach((m) => {
      calculatedPeriods.push({
        type: 'Mahadasha',
        label: `${formatPlanetName(formingPlanet)} Mahādaśā`,
        startDate: m.startDate,
        endDate: m.endDate,
        isCurrent: isDateSpanCurrent(m.startDate, m.endDate),
      });

      // Self Antardasha (e.g. Jupiter-Jupiter)
      const selfAntar = m.subPeriods?.find((a) => a.lord === formingPlanet);
      if (selfAntar) {
        calculatedPeriods.push({
          type: 'Antardasha',
          label: `${formatPlanetName(formingPlanet)} Mahādaśā / ${formatPlanetName(formingPlanet)} Antardaśā (Sva-Bhukti)`,
          startDate: selfAntar.startDate,
          endDate: selfAntar.endDate,
          isCurrent: isDateSpanCurrent(selfAntar.startDate, selfAntar.endDate),
        });
      }
    });

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : `${formatPlanetName(formingPlanet)} Mahādaśā & Antardaśā`;

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: yoga.category,
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: `Mahādaśā and Antardaśā of ${formatPlanetName(formingPlanet)} (the dignified Kendra Mahāpuruṣa kāraka)`,
      source: 'Phaladīpikā Ch. 20, v. 25–30; BPHS Ch. 75, v. 38',
    };
  }

  // =========================================================================
  // 2. NĀBHĀSA YOGAS (All 32 Formations: Āśraya, Dala, Ākṛti, Saṅkhyā)
  // Classical Source: BPHS Ch. 35, v. 29-30; Bṛhat Jātaka Ch. 12, v. 19; Phaladīpikā Ch. 6, v. 43
  // Rule: "Nābhāsāḥ sarvadā phala-dāyinaḥ" — Operates continuously throughout life.
  // =========================================================================
  if (yoga.category === 'Nabhasa' || yogaId.startsWith('nabhasa_')) {
    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: 'Nabhasa',
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: 'Continuous / Lifelong (Sarvadā phala-dāyinaḥ)',
      calculatedPeriods: [
        {
          type: 'Lifelong',
          label: 'Lifelong Constitutional Influence (Sarvadā)',
          isCurrent: true,
        },
      ],
      basis: 'Classical rule establishes Nābhāsa yogas as continuous lifelong geometric/temperamental frameworks not confined to a single planetary Daśā (Sarvadā phala)',
      source: 'BPHS Ch. 35, v. 29–30; Bṛhat Jātaka Ch. 12, v. 19; Phaladīpikā Ch. 6, v. 43',
    };
  }

  // =========================================================================
  // 3. BHĀVĀDHIPATI YOGAS (Cāmarādi 24 Yogas: 12 Auspicious & 12 Inauspicious)
  // Classical Source: Phaladīpikā Ch. 6 & Ch. 20, v. 1-20; Jātaka Pārijāta Ch. 18
  // Rule: Manifests during the Mahādaśā & Antardaśā of the respective Bhāva Lord.
  // =========================================================================
  const bhavaYogaMap: Record<string, number> = {
    chamara_yoga: 1,
    avayoga: 1,
    dhenu_yoga: 2,
    nihsva_yoga: 2,
    shaurya_yoga: 3,
    mriti_yoga: 3,
    jaladhi_yoga: 4,
    kuhu_yoga: 4,
    bhava_chatra_yoga: 5,
    pamara_yoga: 5,
    astra_yoga: 6,
    bhava_harsa_yoga: 6,
    kama_yoga: 7,
    durbhaga_yoga: 7,
    bhava_sarala_yoga: 8,
    bhava_dainya_yoga: 8,
    bhagya_yoga: 9,
    nirbhagya_yoga: 9,
    khyati_yoga: 10,
    duryoga: 10,
    bhava_parijata_yoga: 11,
    daridra_yoga: 11,
    bhava_vimala_yoga: 12,
    kshati_yoga: 12,
  };

  if (bhavaYogaMap[yogaId] !== undefined) {
    const houseNum = bhavaYogaMap[yogaId];
    const lord = getHouseLord(houseNum);
    const mahas = findMahadashas(tree, lord);
    const calculatedPeriods: CalculatedPeriodSpan[] = [];

    mahas.forEach((m) => {
      calculatedPeriods.push({
        type: 'Mahadasha',
        label: `${formatPlanetName(lord)} Mahādaśā (Lord of ${houseNum}${getOrdinalSuffix(houseNum)} Bhāva)`,
        startDate: m.startDate,
        endDate: m.endDate,
        isCurrent: isDateSpanCurrent(m.startDate, m.endDate),
      });

      const selfAntar = m.subPeriods?.find((a) => a.lord === lord);
      if (selfAntar) {
        calculatedPeriods.push({
          type: 'Antardasha',
          label: `${formatPlanetName(lord)} MD / ${formatPlanetName(lord)} AD`,
          startDate: selfAntar.startDate,
          endDate: selfAntar.endDate,
          isCurrent: isDateSpanCurrent(selfAntar.startDate, selfAntar.endDate),
        });
      }
    });

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : `${formatPlanetName(lord)} Mahādaśā (Lord of ${houseNum}${getOrdinalSuffix(houseNum)} Bhāva)`;

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: yoga.category,
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: `Mahādaśā and Antardaśā of ${formatPlanetName(lord)} as lord of the ${houseNum}${getOrdinalSuffix(houseNum)} Bhāva`,
      source: 'Phaladīpikā Ch. 20, v. 1–20; Jātaka Pārijāta Ch. 18',
    };
  }

  // =========================================================================
  // 4. SAMBANDHA RĀJA YOGAS & DHANA YOGAS (2-Lord Combinations)
  // Classical Source: BPHS Ch. 34, v. 16-19; Phaladīpikā Ch. 20, v. 34-36; Uttara Kālāmṛta Kāṇḍa 4, v. 18-20
  // Rule: Manifests in the Mahādaśā of Lord A in Antardaśā of Lord B, and vice versa.
  // =========================================================================
  const twoLordYogaMap: Record<string, [number, number]> = {
    dharma_karmadhipati_raja_yoga: [9, 10],
    lagnesha_panchamesha_raja_yoga: [1, 5],
    bandhvesha_bhagyesha_raja_yoga: [4, 9],
    maha_dhana_yoga: [2, 11],
    kahala_yoga: [4, 9],
    shankha_yoga: [5, 6],
  };

  if (twoLordYogaMap[yogaId] !== undefined) {
    const [h1, h2] = twoLordYogaMap[yogaId];
    const lord1 = getHouseLord(h1);
    const lord2 = getHouseLord(h2);

    const calculatedPeriods: CalculatedPeriodSpan[] = [];

    if (lord1 === lord2) {
      // Single planet rules both houses (e.g. Mars for Cancer/Leo Lagna, Venus for Capricorn/Aquarius Lagna)
      const mahas = findMahadashas(tree, lord1);
      mahas.forEach((m) => {
        calculatedPeriods.push({
          type: 'Mahadasha',
          label: `${formatPlanetName(lord1)} Mahādaśā (Single Yoga-kāraka ruling ${h1}th & ${h2}th)`,
          startDate: m.startDate,
          endDate: m.endDate,
          isCurrent: isDateSpanCurrent(m.startDate, m.endDate),
        });
      });
    } else {
      // Mutual MD -> AD
      const mutual1to2 = findMutualAntardashas(tree, lord1, lord2);
      const mutual2to1 = findMutualAntardashas(tree, lord2, lord1);

      mutual1to2.forEach((p) => {
        calculatedPeriods.push({
          type: 'Mutual Sub-period',
          label: `${formatPlanetName(lord1)} MD (${h1}${getOrdinalSuffix(h1)} L) → ${formatPlanetName(lord2)} AD (${h2}${getOrdinalSuffix(h2)} L)`,
          startDate: p.startDate,
          endDate: p.endDate,
          isCurrent: isDateSpanCurrent(p.startDate, p.endDate),
        });
      });

      mutual2to1.forEach((p) => {
        calculatedPeriods.push({
          type: 'Mutual Sub-period',
          label: `${formatPlanetName(lord2)} MD (${h2}${getOrdinalSuffix(h2)} L) → ${formatPlanetName(lord1)} AD (${h1}${getOrdinalSuffix(h1)} L)`,
          startDate: p.startDate,
          endDate: p.endDate,
          isCurrent: isDateSpanCurrent(p.startDate, p.endDate),
        });
      });
    }

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : `Mutual Mahādaśā/Antardaśā of ${formatPlanetName(lord1)} and ${formatPlanetName(lord2)}`;

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: yoga.category,
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: `Mutual Mahādaśā and Antardaśā of Sambandhī lords: ${formatPlanetName(lord1)} (${h1}${getOrdinalSuffix(h1)} lord) and ${formatPlanetName(lord2)} (${h2}${getOrdinalSuffix(h2)} lord)`,
      source: 'BPHS Ch. 34, v. 16–19; Phaladīpikā Ch. 20, v. 34–36; Uttara Kālāmṛta Kāṇḍa 4, v. 18–20',
    };
  }

  // =========================================================================
  // 5. VIPARĪTA RĀJA YOGAS (Harṣa, Sarala, Vimala)
  // Classical Source: Uttara Kālāmṛta Kāṇḍa 4, v. 22
  // Rule: Manifests during mutual Daśā/Antardaśā of the involved Trika lords (6, 8, 12).
  // =========================================================================
  if (yogaId === 'harsa_vrt' || yogaId === 'sarala_vrt' || yogaId === 'vimala_vrt') {
    const houseNum = yogaId === 'harsa_vrt' ? 6 : yogaId === 'sarala_vrt' ? 8 : 12;
    const lord = getHouseLord(houseNum);
    const mahas = findMahadashas(tree, lord);
    const calculatedPeriods: CalculatedPeriodSpan[] = [];

    mahas.forEach((m) => {
      calculatedPeriods.push({
        type: 'Mahadasha',
        label: `${formatPlanetName(lord)} Mahādaśā (Trika lord of ${houseNum}${getOrdinalSuffix(houseNum)} Bhāva)`,
        startDate: m.startDate,
        endDate: m.endDate,
        isCurrent: isDateSpanCurrent(m.startDate, m.endDate),
      });

      const selfAntar = m.subPeriods?.find((a) => a.lord === lord);
      if (selfAntar) {
        calculatedPeriods.push({
          type: 'Antardasha',
          label: `${formatPlanetName(lord)} MD / ${formatPlanetName(lord)} AD`,
          startDate: selfAntar.startDate,
          endDate: selfAntar.endDate,
          isCurrent: isDateSpanCurrent(selfAntar.startDate, selfAntar.endDate),
        });
      }
    });

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : `${formatPlanetName(lord)} Mahādaśā (${houseNum}${getOrdinalSuffix(houseNum)} Trika Lord)`;

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: 'Viparita',
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: `Mahādaśā and Antardaśā of ${formatPlanetName(lord)} (Lord of ${houseNum}${getOrdinalSuffix(houseNum)} placed in another Trika house)`,
      source: 'Uttara Kālāmṛta Kāṇḍa 4, v. 22',
    };
  }

  // =========================================================================
  // 6. PARIVARTANA YOGAS (Mahā, Dainya, Khala, Khaḍga)
  // Classical Source: Phaladīpikā Ch. 20, v. 34-36; BPHS Ch. 42
  // Rule: Manifests in mutual MD/AD of the two exchanging Grahas.
  // =========================================================================
  if (yogaId === 'maha_parivartana_yoga' || yogaId === 'khadga_yoga') {
    const p1 = planets[0];
    const p2 = planets[1];

    const calculatedPeriods: CalculatedPeriodSpan[] = [];
    if (p1 && p2) {
      const mutual1to2 = findMutualAntardashas(tree, p1, p2);
      const mutual2to1 = findMutualAntardashas(tree, p2, p1);

      mutual1to2.forEach((p) => {
        calculatedPeriods.push({
          type: 'Mutual Sub-period',
          label: `${formatPlanetName(p1)} MD → ${formatPlanetName(p2)} AD`,
          startDate: p.startDate,
          endDate: p.endDate,
          isCurrent: isDateSpanCurrent(p.startDate, p.endDate),
        });
      });

      mutual2to1.forEach((p) => {
        calculatedPeriods.push({
          type: 'Mutual Sub-period',
          label: `${formatPlanetName(p2)} MD → ${formatPlanetName(p1)} AD`,
          startDate: p.startDate,
          endDate: p.endDate,
          isCurrent: isDateSpanCurrent(p.startDate, p.endDate),
        });
      });
    }

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : `Mutual periods of exchanging lords (${planets.map(formatPlanetName).join(', ')})`;

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: yoga.category,
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: `Mutual Mahādaśā and Antardaśā of exchanging lords (${planets.map(formatPlanetName).join(' and ')})`,
      source: 'Phaladīpikā Ch. 20, v. 34–36; BPHS Ch. 42',
    };
  }

  // =========================================================================
  // 7. CANDRA (LUNAR) YOGAS
  // Classical Source: Bṛhat Jātaka Ch. 13, v. 3-5; Phaladīpikā Ch. 20, v. 21-33; BPHS Ch. 36
  // =========================================================================
  if (yogaId === 'gajakesari_yoga') {
    const calculatedPeriods: CalculatedPeriodSpan[] = [];
    const jupToMoon = findMutualAntardashas(tree, 'jupiter', 'moon');
    const moonToJup = findMutualAntardashas(tree, 'moon', 'jupiter');

    jupToMoon.forEach((p) => {
      calculatedPeriods.push({
        type: 'Mutual Sub-period',
        label: 'Jupiter Mahādaśā / Moon Antardaśā',
        startDate: p.startDate,
        endDate: p.endDate,
        isCurrent: isDateSpanCurrent(p.startDate, p.endDate),
      });
    });

    moonToJup.forEach((p) => {
      calculatedPeriods.push({
        type: 'Mutual Sub-period',
        label: 'Moon Mahādaśā / Jupiter Antardaśā',
        startDate: p.startDate,
        endDate: p.endDate,
        isCurrent: isDateSpanCurrent(p.startDate, p.endDate),
      });
    });

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : 'Jupiter MD / Moon AD & Moon MD / Jupiter AD';

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: 'Chandra',
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: 'Mutual Daśā and Antardaśā of Jupiter and Moon (Guru-Candra-daśā-antare)',
      source: 'Phaladīpikā Ch. 20, v. 31; BPHS Ch. 36',
    };
  }

  if (yogaId === 'sunapha_yoga' || yogaId === 'anapha_yoga' || yogaId === 'duradhara_yoga') {
    const formingPlanets = planets.filter((p) => p !== 'moon' && p !== 'sun' && p !== 'rahu' && p !== 'ketu');
    const calculatedPeriods: CalculatedPeriodSpan[] = [];

    formingPlanets.forEach((p) => {
      const mahas = findMahadashas(tree, p);
      mahas.forEach((m) => {
        calculatedPeriods.push({
          type: 'Mahadasha',
          label: `${formatPlanetName(p)} Mahādaśā (Planet in 2nd/12th from Moon)`,
          startDate: m.startDate,
          endDate: m.endDate,
          isCurrent: isDateSpanCurrent(m.startDate, m.endDate),
        });
      });
    });

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : `Mahādaśā of ${formingPlanets.map(formatPlanetName).join(', ')}`;

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: 'Chandra',
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: `Daśā of the planet(s) causing the lunar formation in 2nd/12th from Moon (${formingPlanets.map(formatPlanetName).join(', ')})`,
      source: 'Bṛhat Jātaka Ch. 13, v. 3–5; Phaladīpikā Ch. 20, v. 21–24',
    };
  }

  if (yogaId === 'chandra_adhi_yoga') {
    const benefics: PlanetId[] = ['jupiter', 'venus', 'mercury'];
    const calculatedPeriods: CalculatedPeriodSpan[] = [];

    benefics.forEach((p) => {
      const mahas = findMahadashas(tree, p);
      mahas.forEach((m) => {
        calculatedPeriods.push({
          type: 'Mahadasha',
          label: `${formatPlanetName(p)} Mahādaśā (Benefic in 6th/7th/8th from Moon)`,
          startDate: m.startDate,
          endDate: m.endDate,
          isCurrent: isDateSpanCurrent(m.startDate, m.endDate),
        });
      });
    });

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : 'Daśā periods of Jupiter, Venus, and Mercury';

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: 'Chandra',
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: 'Daśā periods of the natural benefics posited in 6th, 7th, and 8th from Moon',
      source: 'BPHS Ch. 36; Phaladīpikā Ch. 20, v. 33',
    };
  }

  if (yogaId === 'chandra_mangala_yoga') {
    const calculatedPeriods: CalculatedPeriodSpan[] = [];
    const moonMars = findMutualAntardashas(tree, 'moon', 'mars');
    const marsMoon = findMutualAntardashas(tree, 'mars', 'moon');

    moonMars.forEach((p) => {
      calculatedPeriods.push({
        type: 'Mutual Sub-period',
        label: 'Moon Mahādaśā / Mars Antardaśā',
        startDate: p.startDate,
        endDate: p.endDate,
        isCurrent: isDateSpanCurrent(p.startDate, p.endDate),
      });
    });

    marsMoon.forEach((p) => {
      calculatedPeriods.push({
        type: 'Mutual Sub-period',
        label: 'Mars Mahādaśā / Moon Antardaśā',
        startDate: p.startDate,
        endDate: p.endDate,
        isCurrent: isDateSpanCurrent(p.startDate, p.endDate),
      });
    });

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : 'Moon MD / Mars AD & Mars MD / Moon AD';

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: 'Chandra',
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: 'Mutual Daśā and Antardaśā of Moon and Mars',
      source: 'Sārāvalī Ch. 15, v. 11; Phaladīpikā Ch. 20',
    };
  }

  if (yogaId === 'kemadruma_yoga') {
    const moonMahas = findMahadashas(tree, 'moon');
    const calculatedPeriods: CalculatedPeriodSpan[] = moonMahas.map((m) => ({
      type: 'Mahadasha',
      label: 'Moon Mahādaśā (Unflanked Moon period)',
      startDate: m.startDate,
      endDate: m.endDate,
      isCurrent: isDateSpanCurrent(m.startDate, m.endDate),
    }));

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : 'Moon Mahādaśā';

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: 'Chandra',
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: 'Moon Mahādaśā under conditions of uncancelled Kemadruma',
      source: 'BPHS Ch. 36; Phaladīpikā Ch. 20, v. 24',
    };
  }

  // =========================================================================
  // 8. SŪRYA (SOLAR) YOGAS
  // Classical Source: Sārāvalī Ch. 14, v. 1-2; BPHS Ch. 37; Bṛhat Jātaka Ch. 13, v. 1
  // =========================================================================
  if (yogaId === 'budhaditya_yoga') {
    const calculatedPeriods: CalculatedPeriodSpan[] = [];
    const sunMerc = findMutualAntardashas(tree, 'sun', 'mercury');
    const mercSun = findMutualAntardashas(tree, 'mercury', 'sun');

    sunMerc.forEach((p) => {
      calculatedPeriods.push({
        type: 'Mutual Sub-period',
        label: 'Sun Mahādaśā / Mercury Antardaśā',
        startDate: p.startDate,
        endDate: p.endDate,
        isCurrent: isDateSpanCurrent(p.startDate, p.endDate),
      });
    });

    mercSun.forEach((p) => {
      calculatedPeriods.push({
        type: 'Mutual Sub-period',
        label: 'Mercury Mahādaśā / Sun Antardaśā',
        startDate: p.startDate,
        endDate: p.endDate,
        isCurrent: isDateSpanCurrent(p.startDate, p.endDate),
      });
    });

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : 'Sun MD / Mercury AD & Mercury MD / Sun AD';

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: 'Surya',
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: 'Mutual Daśā and Antardaśā of Sun and Mercury (Budhāditya-yuti-daśā)',
      source: 'Sārāvalī Ch. 14, v. 1–2; BPHS Ch. 37',
    };
  }

  if (yogaId === 'vesi_yoga' || yogaId === 'vosi_yoga' || yogaId === 'ubhayachari_yoga') {
    const formingPlanets = planets.filter((p) => p !== 'sun' && p !== 'moon' && p !== 'rahu' && p !== 'ketu');
    const calculatedPeriods: CalculatedPeriodSpan[] = [];

    formingPlanets.forEach((p) => {
      const mahas = findMahadashas(tree, p);
      mahas.forEach((m) => {
        calculatedPeriods.push({
          type: 'Mahadasha',
          label: `${formatPlanetName(p)} Mahādaśā (Planet flanking Sun)`,
          startDate: m.startDate,
          endDate: m.endDate,
          isCurrent: isDateSpanCurrent(m.startDate, m.endDate),
        });
      });
    });

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : `Mahādaśā of ${formingPlanets.map(formatPlanetName).join(', ')}`;

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: 'Surya',
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: `Daśā of the planet(s) posited in 2nd/12th from Sun (${formingPlanets.map(formatPlanetName).join(', ')})`,
      source: 'Bṛhat Jātaka Ch. 13, v. 1; Phaladīpikā Ch. 20, v. 18–20',
    };
  }

  // =========================================================================
  // 9. NĪCABHAṄGA RĀJA YOGA
  // Classical Source: Phaladīpikā Ch. 6, v. 26-30; Uttara Kālāmṛta Kāṇḍa 4, v. 24
  // =========================================================================
  if (yogaId === 'neechabhanga_raja_yoga') {
    const calculatedPeriods: CalculatedPeriodSpan[] = [];
    planets.forEach((p) => {
      const mahas = findMahadashas(tree, p);
      mahas.forEach((m) => {
        calculatedPeriods.push({
          type: 'Mahadasha',
          label: `${formatPlanetName(p)} Mahādaśā (Debilitation cancellation period)`,
          startDate: m.startDate,
          endDate: m.endDate,
          isCurrent: isDateSpanCurrent(m.startDate, m.endDate),
        });
      });
    });

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : `Daśā of cancellation-forming planet(s) (${planets.map(formatPlanetName).join(', ')})`;

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: 'Raja',
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: `Daśā of the debilitated planet (sub-periods of cancellation lord) and cancellation-causing dispositor (${planets.map(formatPlanetName).join(', ')})`,
      source: 'Phaladīpikā Ch. 6, v. 26–30; Uttara Kālāmṛta Kāṇḍa 4, v. 24',
    };
  }

  // =========================================================================
  // 10. TWO-PLANET CLASSICAL CONJUNCTIONS
  // Classical Source: Sārāvalī Ch. 15-18; Phaladīpikā Ch. 20, v. 34-36
  // =========================================================================
  const twoPlanetConjunctionMap: Record<string, [PlanetId, PlanetId]> = {
    lakshmi_narayana_yoga: ['mercury', 'venus'],
    guru_mangala_yoga: ['jupiter', 'mars'],
    surya_guru_yoga: ['sun', 'jupiter'],
    chandra_budha_yoga: ['moon', 'mercury'],
    chandra_shukra_yoga: ['moon', 'venus'],
    chandra_shani_yoga: ['moon', 'saturn'],
    guru_chandala_yoga: ['jupiter', 'rahu'],
  };

  if (twoPlanetConjunctionMap[yogaId] !== undefined) {
    const [p1, p2] = twoPlanetConjunctionMap[yogaId];
    const calculatedPeriods: CalculatedPeriodSpan[] = [];

    const mutual1to2 = findMutualAntardashas(tree, p1, p2);
    const mutual2to1 = findMutualAntardashas(tree, p2, p1);

    mutual1to2.forEach((p) => {
      calculatedPeriods.push({
        type: 'Mutual Sub-period',
        label: `${formatPlanetName(p1)} MD → ${formatPlanetName(p2)} AD`,
        startDate: p.startDate,
        endDate: p.endDate,
        isCurrent: isDateSpanCurrent(p.startDate, p.endDate),
      });
    });

    mutual2to1.forEach((p) => {
      calculatedPeriods.push({
        type: 'Mutual Sub-period',
        label: `${formatPlanetName(p2)} MD → ${formatPlanetName(p1)} AD`,
        startDate: p.startDate,
        endDate: p.endDate,
        isCurrent: isDateSpanCurrent(p.startDate, p.endDate),
      });
    });

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : `Mutual Daśā/Antardaśā of ${formatPlanetName(p1)} and ${formatPlanetName(p2)}`;

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: yoga.category,
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: `Mutual Mahādaśā and Antardaśā of the conjoined planets (${formatPlanetName(p1)} and ${formatPlanetName(p2)})`,
      source: 'Sārāvalī Ch. 15–18; Phaladīpikā Ch. 20, v. 34–36',
    };
  }

  // =========================================================================
  // 11. JAIMINI RĀJA YOGA (AK + AmK)
  // Classical Source: Jaimini Upadeśa Sūtras Ch. 1, Sūtra 3
  // =========================================================================
  if (yogaId === 'jaimini_raja_yoga') {
    const calculatedPeriods: CalculatedPeriodSpan[] = [];
    if (planets.length >= 2) {
      const [p1, p2] = planets;
      const m1to2 = findMutualAntardashas(tree, p1, p2);
      const m2to1 = findMutualAntardashas(tree, p2, p1);

      m1to2.forEach((p) => {
        calculatedPeriods.push({
          type: 'Mutual Sub-period',
          label: `${formatPlanetName(p1)} MD (AK) → ${formatPlanetName(p2)} AD (AmK)`,
          startDate: p.startDate,
          endDate: p.endDate,
          isCurrent: isDateSpanCurrent(p.startDate, p.endDate),
        });
      });

      m2to1.forEach((p) => {
        calculatedPeriods.push({
          type: 'Mutual Sub-period',
          label: `${formatPlanetName(p2)} MD (AmK) → ${formatPlanetName(p1)} AD (AK)`,
          startDate: p.startDate,
          endDate: p.endDate,
          isCurrent: isDateSpanCurrent(p.startDate, p.endDate),
        });
      });
    }

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : 'Mutual periods of Ātmakāraka and Amātyakāraka';

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: 'Raja',
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: 'Mutual Vimśottarī and Chara Daśā periods of Ātmakāraka and Amātyakāraka',
      source: 'Jaimini Upadeśa Sūtras Ch. 1, Sūtra 3',
    };
  }

  // =========================================================================
  // 12. COMPLEX CLASSICAL YOGAS (Amala, Sarasvatī, Akhaṇḍa Sāmrājya, Lakṣmī, Gaurī, Puṣkala)
  // Classical Source: Phaladīpikā Ch. 6; BPHS Ch. 39
  // =========================================================================
  if (yogaId === 'amala_yoga') {
    const beneficsIn10 = planets;
    const calculatedPeriods: CalculatedPeriodSpan[] = [];
    beneficsIn10.forEach((p) => {
      const mahas = findMahadashas(tree, p);
      mahas.forEach((m) => {
        calculatedPeriods.push({
          type: 'Mahadasha',
          label: `${formatPlanetName(p)} Mahādaśā (Benefic in 10th house)`,
          startDate: m.startDate,
          endDate: m.endDate,
          isCurrent: isDateSpanCurrent(m.startDate, m.endDate),
        });
      });
    });

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : `Mahādaśā of 10th house benefic(s) (${beneficsIn10.map(formatPlanetName).join(', ')})`;

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: 'Raja',
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: `Mahādaśā of the natural benefic(s) in the 10th house (${beneficsIn10.map(formatPlanetName).join(', ')})`,
      source: 'Phaladīpikā Ch. 6; BPHS Ch. 39',
    };
  }

  if (yogaId === 'sarasvati_yoga') {
    const calculatedPeriods: CalculatedPeriodSpan[] = [];
    ['jupiter', 'venus', 'mercury'].forEach((p) => {
      const mahas = findMahadashas(tree, p as PlanetId);
      mahas.forEach((m) => {
        calculatedPeriods.push({
          type: 'Mahadasha',
          label: `${formatPlanetName(p as PlanetId)} Mahādaśā (Sarasvatī Yoga planet)`,
          startDate: m.startDate,
          endDate: m.endDate,
          isCurrent: isDateSpanCurrent(m.startDate, m.endDate),
        });
      });
    });

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : 'Mahādaśā periods of Jupiter, Venus, and Mercury';

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: 'Raja',
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: 'Mahādaśā periods of Jupiter, Venus, and Mercury placed in Kendras, Trikoṇas, or 2nd house in strength',
      source: 'Phaladīpikā Ch. 6, v. 25–26',
    };
  }

  if (yogaId === 'lakshmi_yoga') {
    const lord9 = getHouseLord(9);
    const lord1 = getHouseLord(1);
    const calculatedPeriods: CalculatedPeriodSpan[] = [];

    const mutual1to9 = findMutualAntardashas(tree, lord9, lord1);
    const mutual9to1 = findMutualAntardashas(tree, lord1, lord9);

    [...mutual1to9, ...mutual9to1].forEach((p) => {
      calculatedPeriods.push({
        type: 'Mutual Sub-period',
        label: `${formatPlanetName(p.mahadashaLord)} MD → ${formatPlanetName(p.antardashaLord)} AD`,
        startDate: p.startDate,
        endDate: p.endDate,
        isCurrent: isDateSpanCurrent(p.startDate, p.endDate),
      });
    });

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : `Mutual periods of 9th lord (${formatPlanetName(lord9)}) and Lagna lord (${formatPlanetName(lord1)})`;

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: 'Dhana',
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: `Mutual Mahādaśā and Antardaśā of 9th lord (${formatPlanetName(lord9)}) and Lagna lord (${formatPlanetName(lord1)})`,
      source: 'Phaladīpikā Ch. 6; BPHS Ch. 39',
    };
  }

  if (yogaId === 'gauri_yoga') {
    const calculatedPeriods: CalculatedPeriodSpan[] = [];
    const moonJup = findMutualAntardashas(tree, 'moon', 'jupiter');
    const jupMoon = findMutualAntardashas(tree, 'jupiter', 'moon');

    [...moonJup, ...jupMoon].forEach((p) => {
      calculatedPeriods.push({
        type: 'Mutual Sub-period',
        label: `${formatPlanetName(p.mahadashaLord)} MD → ${formatPlanetName(p.antardashaLord)} AD`,
        startDate: p.startDate,
        endDate: p.endDate,
        isCurrent: isDateSpanCurrent(p.startDate, p.endDate),
      });
    });

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : 'Mutual periods of Moon and Jupiter';

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: 'Raja',
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: 'Mutual Mahādaśā and Antardaśā of dignified Moon and aspecting Jupiter',
      source: 'Phaladīpikā Ch. 6',
    };
  }

  // =========================================================================
  // 13. KARTARĪ YOGAS
  // Classical Source: BPHS Ch. 12; Phaladīpikā Ch. 6
  // =========================================================================
  if (yogaId === 'shubha_kartari_lagna' || yogaId === 'papa_kartari_lagna') {
    const lagnaLord = getHouseLord(1);
    const mahas = findMahadashas(tree, lagnaLord);
    const calculatedPeriods: CalculatedPeriodSpan[] = mahas.map((m) => ({
      type: 'Mahadasha',
      label: `${formatPlanetName(lagnaLord)} Mahādaśā (Lagna Lord)`,
      startDate: m.startDate,
      endDate: m.endDate,
      isCurrent: isDateSpanCurrent(m.startDate, m.endDate),
    }));

    const periodText = calculatedPeriods.length > 0
      ? calculatedPeriods.map((p) => `${p.label} (${p.startDate} – ${p.endDate})${p.isCurrent ? ' [CURRENTLY ACTIVE]' : ''}`).join('; ')
      : `${formatPlanetName(lagnaLord)} Mahādaśā & periods of enclosing planets`;

    return {
      yogaId: yoga.id,
      yogaName: yoga.name,
      sanskritName: yoga.sanskritName,
      category: yoga.category,
      formation: 'Present',
      isEstablished: true,
      relevantPeriodsText: periodText,
      calculatedPeriods,
      basis: `Daśā of Lagna Lord (${formatPlanetName(lagnaLord)}) and enclosing 2nd/12th house planets (${planets.map(formatPlanetName).join(', ')})`,
      source: 'BPHS Ch. 12; Phaladīpikā Ch. 6',
    };
  }

  // =========================================================================
  // 14. FALLBACK / UNBOUND YOGAS WHERE TEXTS DO NOT ESTABLISH TIMING
  // Classical Rule: Do not guess. Show "Activation rule not established."
  // =========================================================================
  return {
    yogaId: yoga.id,
    yogaName: yoga.name,
    sanskritName: yoga.sanskritName,
    category: yoga.category,
    formation: 'Present',
    isEstablished: false,
    relevantPeriodsText: 'Activation rule not established.',
    calculatedPeriods: [],
    basis: 'Classical texts do not establish a specific Daśā activation rule for this formation.',
    source: yoga.chapterAndVerse || yoga.sourceText || 'Canonical Classical Canon',
  };
}

function getOrdinalSuffix(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

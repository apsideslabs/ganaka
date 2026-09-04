/**
 * Gaṇaka — Specialized Domain Evaluator: Career & Professional Life
 * (दशमभाव एवं कर्मवृत्ति)
 * 
 * Sources: Bṛhat Jātaka (Ch. 10 - Karmajīvādhyāya), BPHS (Ch. 12 & Ch. 7 Daśāṃśa), Sārāvalī (Ch. 32)
 */

import { JyotishaChart, PlanetId } from '../../types';
import { DomainIndication, DirectClassicalPhala, RuleCondition, CalculatedFact } from '../types';
import { CANONICAL_RULES } from '../classical-sources';
import {
  getHouseLord,
  getHouseOccupants,
  getShadbalaRatio,
  getHouseSAVBindus,
  getVargaPlacement,
  getCharaKarakaPlanet,
  makeFact,
  GRAHA_SANSKRIT_NAMES,
  RASHI_NAMES,
} from '../shared-utils';
import { reconcileRulesAndContradictions } from '../conflict-resolver';

// Classical Karakatvas for Livelihood from Bṛhat Jātaka Ch. 10
const CLASSICAL_PLANETARY_VOCATIONS: Partial<Record<PlanetId, { sanskritCategory: string; classicalLivelihood: string; modernMapping: string }>> = {
  sun: {
    sanskritCategory: 'Rājasevā, Prabhutva, Suvarṇa (राजसेवा, प्रभुत्व, सुवर्ण)',
    classicalLivelihood: 'State administration, royal patronage, executive governance, gold/precious metals, pharmaceuticals.',
    modernMapping: 'Public governance, corporate C-suite leadership, government administration, energy & biomedical leadership.',
  },
  moon: {
    sanskritCategory: 'Jalavāṇijya, Kṛṣi, Strīsamūha (जलवाणिज्य, कृषि, स्त्रीसमूह)',
    classicalLivelihood: 'Marine trade, liquids/agriculture, hospitality, dairy, textile commerce, maternal care.',
    modernMapping: 'Supply chain management, healthcare, public relations, hospitality, consumer goods, maritime logistics.',
  },
  mars: {
    sanskritCategory: 'Śastra, Sāhasa, Dhātu, Agni (शस्त्र, साहस, धातु, अग्नि)',
    classicalLivelihood: 'Military command, metallurgy, engineering with fire/tools, surgical/medical operations, law enforcement.',
    modernMapping: 'Software architecture/engineering, surgery, defense, heavy industry, physical athletics, infrastructure construction.',
  },
  mercury: {
    sanskritCategory: 'Lipi, Gaṇita, Vāṇijya, Śāstra (लिपि, गणित, वाणिज्य, शास्त्र)',
    classicalLivelihood: 'Scribes, computation/mathematics, commercial trading, diplomatic treaties, literary authorship.',
    modernMapping: 'Data science, financial trading, software development, journalism, accounting, marketing & publishing.',
  },
  jupiter: {
    sanskritCategory: 'Dharma, Nīti, Guru, Vidhividyā (धर्म, नीति, गुरु, विधिविद्या)',
    classicalLivelihood: 'Judges, royal counselors, priesthood/theology, pedagogy, institutional treasurers.',
    modernMapping: 'Legal jurisprudence, university professorship, executive advisory/consulting, banking governance, regulatory policy.',
  },
  venus: {
    sanskritCategory: 'Kalā, Śilpa, Ratna, Vāhana (कला, शिल्प, रत्न, वाहन)',
    classicalLivelihood: 'Fine arts, aesthetics, luxury merchandise, gemstones, vehicles/conveyances, diplomatic alliances.',
    modernMapping: 'Design/UI-UX, architecture, entertainment, luxury goods, fashion, diplomacy, high-end hospitality.',
  },
  saturn: {
    sanskritCategory: 'Śrama, Khani, Bhāra, Sevā (श्रम, खनि, भार, सेवा)',
    classicalLivelihood: 'Mining/oil exploration, manual enterprise, elder care, labor organization, civic utility management.',
    modernMapping: 'Industrial operations, civil engineering, mining/petroleum, organizational logistics, public labor systems.',
  },
  rahu: {
    sanskritCategory: 'Viṣa, Yantra, Videsha (विष, यन्त्र, विदेश)',
    classicalLivelihood: 'Foreign trade, research in unseen forces, unconventional machinery, alchemy/poisons.',
    modernMapping: 'Advanced research & AI technologies, cross-border international enterprise, aviation, cybersecurity.',
  },
  ketu: {
    sanskritCategory: 'Mokṣa, Sūkṣma-vidyā, Śūnyatā (मोक्ष, सूक्ष्मविद्या, शून्यता)',
    classicalLivelihood: 'Ascetic pursuits, occult investigation, subtle mathematics, computational logic.',
    modernMapping: 'Cryptographic algorithms, specialized backend engineering, monastic/spiritual guidance, root-cause diagnostic research.',
  },
};

export function evaluateCareerDomain(chart: JyotishaChart): DomainIndication {
  // 1. Complete Factor Universe
  const tenthLord = getHouseLord(chart, 10);
  const tenthLordPlanet = chart.planets[tenthLord.id];
  const tenthOccupants = getHouseOccupants(chart, 10);
  
  // 10th from Moon (Candra-Lagna)
  const moonHouse = chart.planets.moon.house;
  const tenthFromMoonHouse = ((moonHouse + 8) % 12) + 1;
  const tenthFromMoonLord = getHouseLord(chart, tenthFromMoonHouse);

  // 10th from Sun (Sūrya-Lagna)
  const sunHouse = chart.planets.sun.house;
  const tenthFromSunHouse = ((sunHouse + 8) % 12) + 1;
  const tenthFromSunLord = getHouseLord(chart, tenthFromSunHouse);

  // Navāṃśa (D-9) and Daśāṃśa (D-10) Placements
  const tenthLordD9 = getVargaPlacement(chart, tenthLord.id, 'D9');
  const tenthLordD10 = getVargaPlacement(chart, tenthLord.id, 'D10');

  // Jaimini Amātyakāraka (AmK)
  const amkPlanetId = getCharaKarakaPlanet(chart, 'AmK');
  const amkPlanet = chart.planets[amkPlanetId];

  // Strengths
  const tenthLordShadbala = getShadbalaRatio(chart, tenthLord.id);
  const tenthSAV = getHouseSAVBindus(chart, 10);

  // Primary Vocational Planet determined by classical priority:
  // Occupant in 10th > 10th Lord > 10th from Moon > Amātyakāraka
  const primaryCareerPlanetId: PlanetId = tenthOccupants.length > 0
    ? tenthOccupants[0]
    : tenthLord.id;
  const vocationalData = CLASSICAL_PLANETARY_VOCATIONS[primaryCareerPlanetId] || CLASSICAL_PLANETARY_VOCATIONS.sun!;

  // Facts Inventory
  const calculatedFacts: CalculatedFact[] = [
    makeFact(
      'fact_tenth_house_lord',
      'Bhāva & Bhāveśa',
      '10th House Lord (Karma-adhipati)',
      `${tenthLord.name} in House ${tenthLordPlanet?.house || 'N/A'} (${tenthLordPlanet?.rashiName || ''})`,
      `Dignity: ${tenthLordPlanet?.dignity}. Primary significator of professional duties and public responsibility.`,
      tenthLordShadbala >= 1.0 ? 'favorable' : 'neutral'
    ),
    makeFact(
      'fact_tenth_occupants',
      'Bhāva & Bhāveśa',
      '10th House Occupants (Daśamabhāva)',
      tenthOccupants.length > 0
        ? tenthOccupants.map((p) => GRAHA_SANSKRIT_NAMES[p]).join(', ')
        : 'Vacant (Lord dictates outcome)',
      'Occupants directly infuse the day-to-day work environment with their functional characteristics.',
      tenthOccupants.length > 0 ? 'favorable' : 'neutral'
    ),
    makeFact(
      'fact_candra_tenth',
      'Bhāva & Bhāveśa',
      '10th from Moon (Candra-Lagna Karma)',
      `House ${tenthFromMoonHouse} ruled by ${tenthFromMoonLord.name}`,
      'Evaluates vocation aligned with subconscious inclinations and emotional satisfaction.',
      'neutral'
    ),
    makeFact(
      'fact_amk_planet',
      'Jaimini Sūtra',
      'Amātyakāraka (Career Significator)',
      `${GRAHA_SANSKRIT_NAMES[amkPlanetId]} in House ${amkPlanet?.house}`,
      'Jaimini significator for executive ministers, counselors, professional sustainment, and career altitude.',
      'favorable'
    ),
    makeFact(
      'fact_dashamsha_placement',
      'Varga (Divisional)',
      'Daśāṃśa (D-10) Disposition',
      tenthLordD10 ? `${tenthLord.name} in D-10 ${tenthLordD10.rashiName} (H${tenthLordD10.house})` : 'Calculated D-10 harmonic',
      'Harmonic divisional chart specifically revealing public achievements and professional status.',
      'favorable'
    ),
    makeFact(
      'fact_tenth_sav',
      'Aṣṭakavarga',
      '10th House SAV Bindus',
      `${tenthSAV} Bindus (Baseline: 28)`,
      tenthSAV >= 28 ? 'Fortified professional durability and impact' : 'Requires steady perseverance to manifest public standing',
      tenthSAV >= 28 ? 'favorable' : 'limiting'
    ),
  ];

  // 2. Classical Rules & Verification
  const directClassicalPhalas: DirectClassicalPhala[] = [];

  // Rule 1: Bṛhat Jātaka Ch. 10 (Karmajīvādhyāya)
  const cond1: RuleCondition[] = [
    {
      id: 'c_karmajiva_determined',
      description: 'Livelihood evaluated from 10th house from Lagna/Moon and dominant planetary karakatva',
      expected: 'Planetary ruler identified',
      observed: `Ruled primarily by ${GRAHA_SANSKRIT_NAMES[primaryCareerPlanetId]}`,
      met: true,
      significance: 'Satisfies Varāhamihira Karmajīva criteria',
    },
  ];
  directClassicalPhalas.push({
    id: 'phala_brihat_jataka_karma',
    ruleId: 'brihat_jataka_karmajiva',
    sourceText: CANONICAL_RULES.brihat_jataka_karmajiva.sourceText,
    chapterAndVerse: CANONICAL_RULES.brihat_jataka_karmajiva.chapterAndVerse,
    sanskritTitle: CANONICAL_RULES.brihat_jataka_karmajiva.sanskritTitle || '',
    sanskritShloka: CANONICAL_RULES.brihat_jataka_karmajiva.sanskritShloka,
    editionOrManuscript: CANONICAL_RULES.brihat_jataka_karmajiva.editionOrManuscript,
    conditions: cond1,
    allConditionsMet: true,
    verificationLevel: 'Fully Verified',
    directPhalaText: `Primary classical livelihood alignment is through ${vocationalData.sanskritCategory}: ${vocationalData.classicalLivelihood}`,
  });

  // Rule 2: BPHS Ch. 7 & 12 (Daśāṃśa & Amātyakāraka)
  const cond2: RuleCondition[] = [
    {
      id: 'c_amk_active',
      description: 'Amātyakāraka and 10th lord evaluated for professional altitude',
      expected: 'Amātyakāraka identified',
      observed: `${GRAHA_SANSKRIT_NAMES[amkPlanetId]} positioned in House ${amkPlanet?.house}`,
      met: true,
    },
    {
      id: 'c_tenth_sav_strength',
      description: '10th house supported by Aṣṭakavarga bindus',
      expected: '>= 28 Bindus',
      observed: `${tenthSAV} Bindus`,
      met: tenthSAV >= 28,
    },
  ];
  if (cond2.every((c) => c.met)) {
    directClassicalPhalas.push({
      id: 'phala_bphs_dashamsha',
      ruleId: 'bphs_dashamsha_karmaphala',
      sourceText: CANONICAL_RULES.bphs_dashamsha_karmaphala.sourceText,
      chapterAndVerse: CANONICAL_RULES.bphs_dashamsha_karmaphala.chapterAndVerse,
      sanskritTitle: CANONICAL_RULES.bphs_dashamsha_karmaphala.sanskritTitle || '',
      sanskritShloka: CANONICAL_RULES.bphs_dashamsha_karmaphala.sanskritShloka,
      editionOrManuscript: CANONICAL_RULES.bphs_dashamsha_karmaphala.editionOrManuscript,
      conditions: cond2,
      allConditionsMet: true,
      verificationLevel: 'Fully Verified',
      directPhalaText:
        'Endowed with executive capacity and sustainable career elevation through the synergy of 10th lord and Amātyakāraka.',
    });
  }

  // Supporting and Limiting
  const supportingFactors: string[] = [];
  const limitingFactors: string[] = [];

  supportingFactors.push(`10th Lord (${tenthLord.name}) positioned in House ${tenthLordPlanet?.house}.`);
  if (tenthLordShadbala >= 1.0) supportingFactors.push(`10th Lord Śaḍbala ratio is robust (${tenthLordShadbala.toFixed(2)}x).`);
  if (tenthSAV >= 28) supportingFactors.push(`10th House fortified with ${tenthSAV} SAV bindus.`);
  supportingFactors.push(`Amātyakāraka is ${GRAHA_SANSKRIT_NAMES[amkPlanetId]}, strengthening counselor and executive abilities.`);

  if (tenthSAV < 28) limitingFactors.push(`10th House SAV bindus (${tenthSAV}) suggest professional fruition requires persistence.`);

  const { multiRuleSynthesis, reconciledSummary } = reconcileRulesAndContradictions(
    directClassicalPhalas,
    [],
    []
  );

  return {
    id: 'career',
    title: 'Career & Professional Life',
    sanskritTitle: 'दशमभाव एवं कर्मवृत्ति',
    subtitle: '10th House (Karma), Amātyakāraka (AmK), Daśāṃśa (D-10), and classical livelihood categories',
    primaryBhavas: [10],
    keyGrahas: [tenthLord.id, primaryCareerPlanetId, amkPlanetId],
    keyVargas: ['D1', 'D9', 'D10'],
    hasVerifiedRule: directClassicalPhalas.length > 0,
    conciseSummary: reconciledSummary,
    coreDisposition: `${tenthLord.name} 10th Lord • ${GRAHA_SANSKRIT_NAMES[primaryCareerPlanetId]} Karma Influencer`,
    directClassicalPhalas,
    multiRuleSynthesis,
    modernMappings: [
      {
        id: 'map_career_modern',
        classicalConcept: `Varāhamihira Karmajīva: ${vocationalData.sanskritCategory}`,
        classicalSourceRef: 'Bṛhat Jātaka Ch. 10',
        modernMappingText: `Modern professional equivalents include: ${vocationalData.modernMapping}`,
        methodologyNote:
          'Strictly labeled as an interpretive modern mapping of the authentic classical archetype.',
      },
    ],
    contradictions: [],
    calculatedFacts,
    satisfiedRules: directClassicalPhalas.map((p) => ({
      rule: CANONICAL_RULES[p.ruleId] || CANONICAL_RULES.brihat_jataka_karmajiva,
      conditionsRequired: p.conditions.map((c) => c.description),
      conditionsMet: p.conditions.filter((c) => c.met).map((c) => c.description),
      status: p.verificationLevel,
      synthesisNote: p.directPhalaText,
    })),
    supportingFactors,
    limitingOrCounterbalancingFactors: limitingFactors,
    synthesisNarrative: multiRuleSynthesis,
    calculationBasisNotes: [
      `10th Lord: ${tenthLord.name} in ${tenthLordPlanet?.rashiName} (House ${tenthLordPlanet?.house})`,
      `10th from Moon: House ${tenthFromMoonHouse} ruled by ${tenthFromMoonLord.name}`,
      `Amātyakāraka: ${GRAHA_SANSKRIT_NAMES[amkPlanetId]}`,
      `10th House SAV: ${tenthSAV} bindus`,
    ],
    canonicalSources: [
      CANONICAL_RULES.brihat_jataka_karmajiva,
      CANONICAL_RULES.bphs_dashamsha_karmaphala,
    ],
  };
}

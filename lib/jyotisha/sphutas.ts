/**
 * Gaṇaka — Classical Sphuṭa Calculation Engine
 * Calculates:
 * 1. Detailed Graha Sphuṭas with Nakshatra, Pada, Swamy, KP Sub-Lords, Avasthas
 * 2. Trisphuṭādi & Composite Mathematical Points (Beeja, Kshetra, Trisphuta, Chatusphuta, Panchasphuta, Prana, Deha, Mrityu, Kunda, Bhrigu Bindu, Yogi/Avayogi)
 * 3. Dhūmādi (11 Classical Aprakāśaka Upagrahas per BPHS Ch. 25 & Prasna Marga)
 * 4. Drekkāṇa Classifications & 22nd Drekkāṇa (Khareśa / Chidra Graha)
 */

import { PlanetId } from '../astronomy/ephemeris';
import { normalizeDegrees, toDMS } from '../astronomy/julian';
import { RashiNumber, CalculatedPlanet, DignityType } from './types';
import { RASHIS, NAKSHATRAS, GRAHA_PROPERTIES, VIMSHOTTARI_SEQUENCE } from './constants';

export interface KPPosition {
  signLord: PlanetId;
  starLord: PlanetId;
  subLord: PlanetId;
  subSubLord: PlanetId;
}

export interface PlanetaryAvasthas {
  baladi: 'Bāla (Infant)' | 'Kumāra (Youth)' | 'Yuva (Adult / Prime)' | 'Vṛddha (Advanced / Aged)' | 'Mṛta (Dead / Inactive)';
  baladiStrength: string;
  jagradadi: 'Jāgrata (Awake)' | 'Svapna (Dreaming)' | 'Suṣupti (Sleeping)';
  deeptadi: 'Dīpta (Exalted)' | 'Svastha (Own Sign)' | 'Mudita (Friend Sign)' | 'Śānta (Benefic Sub-division)' | 'Dīna (Neutral)' | 'Duḥkhita (Enemy Sign)' | 'Vikala (Combust)' | 'Khala (Debilitated)' | 'Kopa (Defeated)';
}

export interface DetailedGrahaSphuta {
  id: PlanetId;
  name: string;
  sanskritName: string;
  devanagari: string;
  siderealLongitude: number;
  tropicalLongitude: number;
  dmsStr: string;
  rashiNumber: RashiNumber;
  rashiName: string;
  rashiSanskrit: string;
  rashiLord: PlanetId;
  degreeInRashi: number;
  degreeInRashiDMS: string;
  nakshatraIndex: number;
  nakshatraNumber: number;
  nakshatraName: string;
  nakshatraLord: PlanetId;
  pada: 1 | 2 | 3 | 4;
  padaLord: PlanetId;
  kp: KPPosition;
  avasthas: PlanetaryAvasthas;
  speed: number;
  declination: number;
  isRetrograde: boolean;
  isCombust: boolean;
  dignity: DignityType;
  house: number;
}

export interface SpecialCompositeSphuta {
  id: string;
  name: string;
  sanskritName: string;
  category: 'Trisphuṭādi' | 'Fertility' | 'Vital Point' | 'Tajika Saham';
  longitude: number;
  dmsStr: string;
  rashiNumber: RashiNumber;
  rashiName: string;
  rashiLord: PlanetId;
  degreeInRashi: number;
  nakshatraName: string;
  nakshatraLord: PlanetId;
  pada: number;
  formula: string;
  significance: string;
  diagnostic?: {
    status: 'Favorable' | 'Neutral' | 'Adverse' | 'Informational';
    description: string;
  };
}

export interface UpagrahaPoint {
  id: string;
  name: string;
  sanskritName: string;
  longitude: number;
  dmsStr: string;
  rashiNumber: RashiNumber;
  rashiName: string;
  rashiLord: PlanetId;
  degreeInRashi: number;
  nakshatraName: string;
  lord: PlanetId;
  description: string;
}

export interface DrekkanaAnalysis {
  twentySecondDrekkana: {
    drekkanaNumber: number; // 22
    rashiNumber: RashiNumber;
    rashiName: string;
    lord: PlanetId;
    lordName: string;
    khareshaDescription: string;
  };
  sixtyFourthNavamsha: {
    navamshaNumber: number; // 64
    rashiNumber: RashiNumber;
    rashiName: string;
    lord: PlanetId;
    lordName: string;
    description: string;
  };
  planetDrekkanas: Array<{
    planetId: PlanetId;
    planetName: string;
    drekkanaPart: 1 | 2 | 3;
    drekkanaRashi: RashiNumber;
    drekkanaRashiName: string;
    drekkanaLord: PlanetId;
    classification: 'Ayudha (Weapon)' | 'Sarpa (Serpent)' | 'Chatuṣpada (Quadruped)' | 'Pakṣī (Bird)' | 'Varāha (Boar)' | 'Pāśa (Noose)' | 'Saumya (Gentle / Human)';
    interpretation: string;
  }>;
}

// 9 Vimshottari Lords sequence
const VIM_LORDS: PlanetId[] = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];
const VIM_YEARS: number[] = [7, 20, 6, 10, 7, 18, 16, 19, 17];
const TOTAL_YEARS = 120;

/**
 * Calculates Krishnamurti Paddhati (KP) Star Lord, Sub Lord, and Sub-Sub Lord
 */
export function calculateKPPosition(siderealLongitude: number): KPPosition {
  const norm = normalizeDegrees(siderealLongitude);
  const rashiIndex = Math.floor(norm / 30);
  const rashiNum = (rashiIndex + 1) as RashiNumber;
  const signLord = RASHIS[rashiNum].lord;

  // Nakshatra (Star Lord)
  const nakSpan = 360.0 / 27.0; // 13°20' = 13.3333333333°
  const nakIndex = Math.floor(norm / nakSpan) % 27;
  const starLord = NAKSHATRAS[nakIndex].lord;

  // Degrees elapsed in Nakshatra
  const nakStart = nakIndex * nakSpan;
  const degInNak = norm - nakStart; // 0 to 13.333333°

  // Starting sub-lord in the nakshatra is always the star lord itself
  const starLordSeqIndex = VIM_LORDS.indexOf(starLord);

  // Sub-lord calculation: nakSpan is partitioned in proportion of vimshottari years
  let accumulatedDeg = 0;
  let subLord: PlanetId = starLord;
  let subStartDeg = 0;
  let subSpan = 0;
  let subLordSeqIndex = starLordSeqIndex;

  for (let i = 0; i < 9; i++) {
    const sIndex = (starLordSeqIndex + i) % 9;
    const sLord = VIM_LORDS[sIndex];
    const span = nakSpan * (VIM_YEARS[sIndex] / TOTAL_YEARS);

    if (degInNak >= accumulatedDeg && degInNak < accumulatedDeg + span + 0.000001) {
      subLord = sLord;
      subStartDeg = accumulatedDeg;
      subSpan = span;
      subLordSeqIndex = sIndex;
      break;
    }
    accumulatedDeg += span;
  }

  // Sub-Sub Lord calculation: subSpan partitioned in proportion of vimshottari years
  const degInSub = degInNak - subStartDeg;
  let subSubAccum = 0;
  let subSubLord: PlanetId = subLord;

  for (let j = 0; j < 9; j++) {
    const ssIndex = (subLordSeqIndex + j) % 9;
    const ssLord = VIM_LORDS[ssIndex];
    const ssSpan = subSpan * (VIM_YEARS[ssIndex] / TOTAL_YEARS);

    if (degInSub >= subSubAccum && degInSub < subSubAccum + ssSpan + 0.000001) {
      subSubLord = ssLord;
      break;
    }
    subSubAccum += ssSpan;
  }

  return {
    signLord,
    starLord,
    subLord,
    subSubLord,
  };
}

/**
 * Calculates BPHS Planetary Avasthas (Bālādi, Jāgradādi, Dīptādi)
 */
export function calculatePlanetaryAvasthas(
  planetId: PlanetId,
  degreeInRashi: number,
  rashiNum: RashiNumber,
  dignity: DignityType,
  isCombust: boolean
): PlanetaryAvasthas {
  const isOddRashi = rashiNum % 2 === 1;
  const deg = degreeInRashi;

  // 1. Bālādi Avasthā (5 states of 6° each)
  // Odd signs: 0-6 Bala, 6-12 Kumara, 12-18 Yuva, 18-24 Vriddha, 24-30 Mrita
  // Even signs: 0-6 Mrita, 6-12 Vriddha, 12-18 Yuva, 18-24 Kumara, 24-30 Bala
  let baladi: PlanetaryAvasthas['baladi'] = 'Yuva (Adult / Prime)';
  let baladiStrength = '100% Full Fruit';

  const part = Math.min(4, Math.floor(deg / 6)); // 0, 1, 2, 3, 4
  const oddSequence: PlanetaryAvasthas['baladi'][] = [
    'Bāla (Infant)',
    'Kumāra (Youth)',
    'Yuva (Adult / Prime)',
    'Vṛddha (Advanced / Aged)',
    'Mṛta (Dead / Inactive)',
  ];
  const oddStrengths = ['25% Fruit', '50% Fruit', '100% Full Fruit', 'Minimal / Nominal Fruit', '0% Ineffective'];

  const evenSequence: PlanetaryAvasthas['baladi'][] = [
    'Mṛta (Dead / Inactive)',
    'Vṛddha (Advanced / Aged)',
    'Yuva (Adult / Prime)',
    'Kumāra (Youth)',
    'Bāla (Infant)',
  ];
  const evenStrengths = ['0% Ineffective', 'Minimal / Nominal Fruit', '100% Full Fruit', '50% Fruit', '25% Fruit'];

  if (isOddRashi) {
    baladi = oddSequence[part];
    baladiStrength = oddStrengths[part];
  } else {
    baladi = evenSequence[part];
    baladiStrength = evenStrengths[part];
  }

  // 2. Jāgradādi Avasthā (Alertness state based on dignity)
  let jagradadi: PlanetaryAvasthas['jagradadi'] = 'Svapna (Dreaming)';
  if (dignity.startsWith('Exalted') || dignity.startsWith('Own Sign') || dignity.startsWith('Moolatrikona')) {
    jagradadi = 'Jāgrata (Awake)';
  } else if (dignity.startsWith('Debilitated') || dignity.startsWith('Great Enemy')) {
    jagradadi = 'Suṣupti (Sleeping)';
  } else {
    jagradadi = 'Svapna (Dreaming)';
  }

  // 3. Dīptādi Avasthā (9 subtle luminosity states)
  let deeptadi: PlanetaryAvasthas['deeptadi'] = 'Dīna (Neutral)';
  if (isCombust) {
    deeptadi = 'Vikala (Combust)';
  } else if (dignity.startsWith('Exalted')) {
    deeptadi = 'Dīpta (Exalted)';
  } else if (dignity.startsWith('Own Sign') || dignity.startsWith('Moolatrikona')) {
    deeptadi = 'Svastha (Own Sign)';
  } else if (dignity.startsWith('Great Friend') || dignity.startsWith('Friend')) {
    deeptadi = 'Mudita (Friend Sign)';
  } else if (dignity.startsWith('Neutral')) {
    deeptadi = 'Dīna (Neutral)';
  } else if (dignity.startsWith('Enemy') || dignity.startsWith('Great Enemy')) {
    deeptadi = 'Duḥkhita (Enemy Sign)';
  } else if (dignity.startsWith('Debilitated')) {
    deeptadi = 'Khala (Debilitated)';
  }

  return {
    baladi,
    baladiStrength,
    jagradadi,
    deeptadi,
  };
}

/**
 * Calculates Comprehensive Graha Sphuṭas with KP Sub-Lords, Pada Lords, and Avasthas
 */
export function calculateDetailedGrahaSphutas(
  planets: Record<PlanetId, CalculatedPlanet>
): DetailedGrahaSphuta[] {
  const result: DetailedGrahaSphuta[] = [];

  for (const [pId, p] of Object.entries(planets)) {
    const pKey = pId as PlanetId;
    const kp = calculateKPPosition(p.siderealLongitude);
    const avasthas = calculatePlanetaryAvasthas(
      pKey,
      p.longitudeInRashi,
      p.rashiNumber,
      p.dignity,
      p.isCombust
    );

    const degDms = toDMS(p.longitudeInRashi);
    const degInRashiDMS = `${degDms.degrees}°${degDms.minutes.toString().padStart(2, '0')}′${degDms.seconds.toString().padStart(2, '0')}″`;

    const nakInfo = NAKSHATRAS[p.nakshatraIndex];
    const padaLord = nakInfo.padaLords[p.pada - 1] || 'mars';

    result.push({
      id: pKey,
      name: p.name,
      sanskritName: p.sanskritName,
      devanagari: p.devanagari,
      siderealLongitude: p.siderealLongitude,
      tropicalLongitude: p.tropicalLongitude,
      dmsStr: p.degreeStr,
      rashiNumber: p.rashiNumber,
      rashiName: p.rashiName,
      rashiSanskrit: RASHIS[p.rashiNumber].sanskritName,
      rashiLord: RASHIS[p.rashiNumber].lord,
      degreeInRashi: p.longitudeInRashi,
      degreeInRashiDMS: degInRashiDMS,
      nakshatraIndex: p.nakshatraIndex,
      nakshatraNumber: nakInfo.number,
      nakshatraName: p.nakshatraName,
      nakshatraLord: p.nakshatraLord,
      pada: p.pada,
      padaLord,
      kp,
      avasthas,
      speed: p.speed,
      declination: p.declination,
      isRetrograde: p.isRetrograde,
      isCombust: p.isCombust,
      dignity: p.dignity,
      house: p.house,
    });
  }

  return result;
}

/**
 * Calculates Trisphuṭādi, Bīja/Kṣetra Sphuṭa, Yogasphuṭa, Prāṇa, Deha, Mṛtyu, and Kunda Sphuṭas
 */
export function calculateAllSpecialSphutas(
  sunLong: number,
  moonLong: number,
  marsLong: number,
  jupiterLong: number,
  venusLong: number,
  rahuLong: number,
  lagnaLong: number,
  gulikaLong: number
): SpecialCompositeSphuta[] {
  const points: SpecialCompositeSphuta[] = [];

  function makeSphuta(
    id: string,
    name: string,
    sanskritName: string,
    category: SpecialCompositeSphuta['category'],
    longDeg: number,
    formula: string,
    significance: string,
    diagnostic?: SpecialCompositeSphuta['diagnostic']
  ): SpecialCompositeSphuta {
    const norm = normalizeDegrees(longDeg);
    const rashiNum = (Math.floor(norm / 30) + 1) as RashiNumber;
    const degInRashi = norm % 30;
    const dms = toDMS(norm);
    const nakRaw = norm / (360.0 / 27.0);
    const nakIndex = Math.floor(nakRaw) % 27;
    const nakInfo = NAKSHATRAS[nakIndex];
    const pada = (Math.floor((nakRaw - Math.floor(nakRaw)) * 4) + 1);

    return {
      id,
      name,
      sanskritName,
      category,
      longitude: norm,
      dmsStr: `${dms.degrees}°${dms.minutes.toString().padStart(2, '0')}′${dms.seconds.toString().padStart(2, '0')}″`,
      rashiNumber: rashiNum,
      rashiName: RASHIS[rashiNum].sanskritName,
      rashiLord: RASHIS[rashiNum].lord,
      degreeInRashi: degInRashi,
      nakshatraName: nakInfo.name,
      nakshatraLord: nakInfo.lord,
      pada,
      formula,
      significance,
      diagnostic,
    };
  }

  // 1. Bīja Sphuṭa (Male Fertility / Procreative Potency) = Sun + Venus + Jupiter
  const beejaLong = normalizeDegrees(sunLong + venusLong + jupiterLong);
  const beejaRashi = Math.floor(beejaLong / 30) + 1;
  const beejaNavamsha = Math.floor((beejaLong % 30) / (30 / 9)) + 1;
  const isBeejaOddRashi = beejaRashi % 2 === 1;
  const isBeejaOddNav = beejaNavamsha % 2 === 1;
  let beejaDiag: SpecialCompositeSphuta['diagnostic'] = {
    status: isBeejaOddRashi && isBeejaOddNav ? 'Favorable' : isBeejaOddRashi || isBeejaOddNav ? 'Neutral' : 'Adverse',
    description: isBeejaOddRashi && isBeejaOddNav
      ? 'Highly Auspicious: Both Rāśi and Navāṃśa are in Odd (Masculine) signs, confirming strong procreative vitality.'
      : isBeejaOddRashi || isBeejaOddNav
      ? 'Moderate: One of Rāśi/Navāṃśa is Odd. Minor remedial measures recommended.'
      : 'Afflicted: Falls in Even sign in both Rāśi & Navāṃśa. May indicate vitality or procreative delay.',
  };
  points.push(
    makeSphuta(
      'beeja_sphuta',
      'Bīja Sphuṭa',
      'बीज स्फुट (पुरुष शक्ति)',
      'Fertility',
      beejaLong,
      'Sūrya + Śukra + Guru',
      'Procreative vitality and genetic strength for male lineage',
      beejaDiag
    )
  );

  // 2. Kṣetra Sphuṭa (Female Fertility / Receptive Field) = Moon + Mars + Jupiter
  const kshetraLong = normalizeDegrees(moonLong + marsLong + jupiterLong);
  const kshetraRashi = Math.floor(kshetraLong / 30) + 1;
  const kshetraNavamsha = Math.floor((kshetraLong % 30) / (30 / 9)) + 1;
  const isKshetraEvenRashi = kshetraRashi % 2 === 0;
  const isKshetraEvenNav = kshetraNavamsha % 2 === 0;
  let kshetraDiag: SpecialCompositeSphuta['diagnostic'] = {
    status: isKshetraEvenRashi && isKshetraEvenNav ? 'Favorable' : isKshetraEvenRashi || isKshetraEvenNav ? 'Neutral' : 'Adverse',
    description: isKshetraEvenRashi && isKshetraEvenNav
      ? 'Highly Auspicious: Both Rāśi and Navāṃśa are in Even (Feminine) signs, indicating fertile womb and health.'
      : isKshetraEvenRashi || isKshetraEvenNav
      ? 'Moderate: Mixed polarity between Rāśi and Navāṃśa.'
      : 'Afflicted: Falls in Odd signs in both Rāśi & Navāṃśa. Classical texts suggest Japa or remedial observance.',
  };
  points.push(
    makeSphuta(
      'kshetra_sphuta',
      'Kṣetra Sphuṭa',
      'क्षेत्र स्फुट (स्त्री शक्ति)',
      'Fertility',
      kshetraLong,
      'Candra + Maṅgala + Guru',
      'Fertility, uterine health, and maternal lineage strength',
      kshetraDiag
    )
  );

  // 3. Tri-sphuṭa = Lagna + Moon + Gulika (Crucial Praśna & Longevity Point)
  const trisphutaLong = normalizeDegrees(lagnaLong + moonLong + gulikaLong);
  points.push(
    makeSphuta(
      'trisphuta',
      'Trisphuṭa',
      'त्रिस्फुट',
      'Trisphuṭādi',
      trisphutaLong,
      'Lagna + Candra + Gulika',
      'Key composite pivot for vitality, event timing, and disease origin in Praśna Mārga'
    )
  );

  // 4. Catuḥ-sphuṭa = Trisphuṭa + Sun
  const chatusphutaLong = normalizeDegrees(trisphutaLong + sunLong);
  points.push(
    makeSphuta(
      'chatusphuta',
      'Catuḥsphuṭa',
      'चतुःस्फुट',
      'Trisphuṭādi',
      chatusphutaLong,
      'Trisphuṭa + Sūrya',
      'Four-fold composite point indicating overall fortune and affliction verification'
    )
  );

  // 5. Pañca-sphuṭa = Catuḥsphuṭa + Rāhu
  const panchasphutaLong = normalizeDegrees(chatusphutaLong + rahuLong);
  points.push(
    makeSphuta(
      'panchasphuta',
      'Pañcasphuṭa',
      'पञ्चस्फुट',
      'Trisphuṭādi',
      panchasphutaLong,
      'Catuḥsphuṭa + Rāhu',
      'Five-fold composite sensitive degree used in advanced Praśna Mārga analysis'
    )
  );

  // 6. Prāṇa Sphuṭa = (Lagna * 15) mod 360 / Praśna Mārga formula
  const pranaLong = normalizeDegrees(lagnaLong * 15);
  points.push(
    makeSphuta(
      'prana_sphuta',
      'Prāṇa Sphuṭa',
      'प्राण स्फुट (श्वास शक्ति)',
      'Vital Point',
      pranaLong,
      '(Lagna × 15) mod 360°',
      'Vital breath force, dynamic life energy, and sensory coordination'
    )
  );

  // 7. Deha Sphuṭa = (Moon * 12) mod 360
  const dehaLong = normalizeDegrees(moonLong * 12);
  points.push(
    makeSphuta(
      'deha_sphuta',
      'Deha Sphuṭa',
      'देह स्फुट (शरीर शक्ति)',
      'Vital Point',
      dehaLong,
      '(Candra × 12) mod 360°',
      'Physical embodiment, constitutional resilience, and organic equilibrium'
    )
  );

  // 8. Mṛtyu Sphuṭa = (Gulika * 12) mod 360
  const mrityuLong = normalizeDegrees(gulikaLong * 12);
  points.push(
    makeSphuta(
      'mrityu_sphuta',
      'Mṛtyu Sphuṭa',
      'मृत्यु स्फुट (सङ्कट बिन्दु)',
      'Vital Point',
      mrityuLong,
      '(Gulika × 12) mod 360°',
      'Critical vulnerability point; transits over this degree mark sensitive periods'
    )
  );

  // 9. Kunda Sphuṭa = (Lagna * 81) mod 360 (Used for Birth Time Rectification)
  const kundaLong = normalizeDegrees(lagnaLong * 81);
  points.push(
    makeSphuta(
      'kunda_sphuta',
      'Kunda Sphuṭa',
      'कुन्द स्फुट (शोधन बिन्दु)',
      'Vital Point',
      kundaLong,
      '(Lagna × 81) mod 360°',
      'Birth time rectification anchor; Nakṣatra of Kunda must harmonize with Janma Nakṣatra'
    )
  );

  // 10. Bhṛgu Bindu = Midpoint of Moon and Rahu
  let bhriguLong = (moonLong + rahuLong) / 2.0;
  if (Math.abs(moonLong - rahuLong) > 180) {
    bhriguLong = normalizeDegrees(bhriguLong + 180);
  }
  points.push(
    makeSphuta(
      'bhrigu_bindu',
      'Bhṛgu Bindu',
      'भृगु बिन्दु (भाग्य बिन्दु)',
      'Vital Point',
      bhriguLong,
      'Midpoint(Candra, Rāhu)',
      'Destiny trigger point; major planetary transits over Bhṛgu Bindu unlock major life events'
    )
  );

  // 11. Yogī Sphuṭa = (Sun + Moon + 93°20') mod 360
  const yogiLong = normalizeDegrees(sunLong + moonLong + 93.33333333333334);
  const yogiNakIdx = Math.floor(yogiLong / (360.0 / 27.0)) % 27;
  const yogiLord = NAKSHATRAS[yogiNakIdx].lord;

  // Avayogī = Yogī + 186°40' (6th Nakshatra from Yogi Nakshatra)
  const avayogiLong = normalizeDegrees(yogiLong + 186.66666666666666);
  const avayogiNakIdx = Math.floor(avayogiLong / (360.0 / 27.0)) % 27;
  const avayogiLord = NAKSHATRAS[avayogiNakIdx].lord;

  points.push(
    makeSphuta(
      'yogi_sphuta',
      'Yogī Sphuṭa & Lord',
      'योगी स्फुट (वरदान बिन्दु)',
      'Vital Point',
      yogiLong,
      '(Sūrya + Candra + 93°20′) mod 360°',
      `Auspicious prosperity degree. Yogī Graha: ${yogiLord.toUpperCase()} (${NAKSHATRAS[yogiNakIdx].name})`,
      {
        status: 'Favorable',
        description: `Yogī Planet is ${yogiLord.toUpperCase()}; rules prosperity and positive breakthroughs.`,
      }
    )
  );

  points.push(
    makeSphuta(
      'avayogi_sphuta',
      'Avayogī Sphuṭa & Lord',
      'अवयोगी स्फुट (अवरोध बिन्दु)',
      'Vital Point',
      avayogiLong,
      '(Yogī + 186°40′) mod 360°',
      `Obstruction / karmic debt degree. Avayogī Graha: ${avayogiLord.toUpperCase()} (${NAKSHATRAS[avayogiNakIdx].name})`,
      {
        status: 'Neutral',
        description: `Avayogī Planet is ${avayogiLord.toUpperCase()}; indicates areas requiring disciplined patience.`,
      }
    )
  );

  // 12. Puṇya Saham (Tājika Fortune Saham) = Moon - Sun + Lagna (Day) or Sun - Moon + Lagna (Night)
  const punyaSahamLong = normalizeDegrees(moonLong - sunLong + lagnaLong);
  points.push(
    makeSphuta(
      'punya_saham',
      'Puṇya Saham (Fortune)',
      'पुण्य सहम (भाग्य बिन्दु)',
      'Tajika Saham',
      punyaSahamLong,
      'Candra - Sūrya + Lagna',
      'Tājika point of merit, spiritual grace, and fortunate wealth flow'
    )
  );

  // 13. Vidyā Saham (Education Saham) = Sun - Moon + Lagna
  const vidyaSahamLong = normalizeDegrees(sunLong - moonLong + lagnaLong);
  points.push(
    makeSphuta(
      'vidya_saham',
      'Vidyā Saham (Learning)',
      'विद्या सहम (ज्ञान बिन्दु)',
      'Tajika Saham',
      vidyaSahamLong,
      'Sūrya - Candra + Lagna',
      'Tājika point for scholastic attainments, higher wisdom, and retention'
    )
  );

  return points;
}

/**
 * Calculates 11 Classical Aprakāśaka Upagrahas (Dhūmādi)
 */
export function calculateAllUpagrahas(
  sunLong: number,
  birthJD: number,
  sunriseJD: number,
  sunsetJD: number,
  dayIndex: number
): UpagrahaPoint[] {
  const isDay = birthJD >= sunriseJD && birthJD <= sunsetJD;

  // 1. Dhūma = Sun + 133°20'
  const dhooma = normalizeDegrees(sunLong + 133.33333333333334);
  // 2. Vyatīpāta = 360° - Dhūma
  const vyatipata = normalizeDegrees(360.0 - dhooma);
  // 3. Pariveṣa = Vyatīpāta + 180°
  const parivesha = normalizeDegrees(vyatipata + 180.0);
  // 4. Indracāpa (Kodaṇḍa) = 360° - Pariveṣa
  const indrachapa = normalizeDegrees(360.0 - parivesha);
  // 5. Upaketu (Śikhi) = Indracāpa + 16°40'
  const upaketu = normalizeDegrees(indrachapa + 16.666666666666668);

  // 6. Gulika (Saturn's portion of day/night)
  const gulikaDayPortions = [7, 6, 5, 4, 3, 2, 1]; // Sun..Sat
  const gulikaNightPortions = [3, 2, 1, 7, 6, 5, 4];
  const gPortion = isDay ? gulikaDayPortions[dayIndex] : gulikaNightPortions[dayIndex];
  const gulikaGhatis = (gPortion - 1) * 3.75;
  const gulika = normalizeDegrees(sunLong + gulikaGhatis * 30.0);

  // 7. Māndi (Middle of Gulika's segment)
  const mandi = normalizeDegrees(gulika + 1.875 * 15.0);

  // 8. Kāla (Sun's Upagraha)
  const kala = normalizeDegrees(sunLong + 30.0);
  // 9. Mṛtyu (Mars's Upagraha)
  const mrityu = normalizeDegrees(sunLong + 90.0);
  // 10. Ardhaprahāra (Mercury's Upagraha)
  const ardhaprahara = normalizeDegrees(sunLong + 150.0);
  // 11. Yamaghaṇṭa (Jupiter's Upagraha)
  const yamaghanta = normalizeDegrees(sunLong + 210.0);

  const rawList = [
    { id: 'dhooma', name: 'Dhūma', sanskrit: 'धूम', deg: dhooma, lord: 'mars' as PlanetId, desc: 'Smoky, fiery non-luminous point causing restlessness and sudden friction.' },
    { id: 'vyatipata', name: 'Vyatīpāta', sanskrit: 'व्यतीपात', deg: vyatipata, lord: 'rahu' as PlanetId, desc: 'Heavy karmic whirlpool point associated with reversal of outcomes.' },
    { id: 'parivesha', name: 'Pariveṣa', sanskrit: 'परिवेष', deg: parivesha, lord: 'moon' as PlanetId, desc: 'Halo / enclosure point representing subtle mental confinement or protection.' },
    { id: 'indrachapa', name: 'Indracāpa (Kodaṇḍa)', sanskrit: 'इन्द्रचाप', deg: indrachapa, lord: 'venus' as PlanetId, desc: 'Bow of Indra; sudden unexpected strokes of fortune or sharp illusion.' },
    { id: 'upaketu', name: 'Upaketu (Śikhī)', sanskrit: 'उपकेतु', deg: upaketu, lord: 'ketu' as PlanetId, desc: 'Flag / comet-like tail signifying detachment and spiritual awakening.' },
    { id: 'gulika', name: 'Gulika', sanskrit: 'गुलिक', deg: gulika, lord: 'saturn' as PlanetId, desc: 'Offspring of Saturn (Śaniputra); primary point for assessing karmic burdens.' },
    { id: 'mandi', name: 'Māndi', sanskrit: 'मान्दि', deg: mandi, lord: 'saturn' as PlanetId, desc: 'Crest of Gulika; key focal point for physical constitution and vulnerability.' },
    { id: 'kala', name: 'Kāla (Upagraha)', sanskrit: 'काल', deg: kala, lord: 'sun' as PlanetId, desc: 'Solar sub-planet governing temporal vitality and authority challenges.' },
    { id: 'mrityu_upa', name: 'Mṛtyu (Upagraha)', sanskrit: 'मृत्यु', deg: mrityu, lord: 'mars' as PlanetId, desc: 'Martian sub-planet signifying critical bodily thresholds and endurance.' },
    { id: 'ardhaprahara', name: 'Ardhaprahāra', sanskrit: 'अर्धप्रहार', deg: ardhaprahara, lord: 'mercury' as PlanetId, desc: 'Mercurial sub-planet signifying cognitive adaptations and trade hurdles.' },
    { id: 'yamaghanta', name: 'Yamaghaṇṭa', sanskrit: 'यमघण्ट', deg: yamaghanta, lord: 'jupiter' as PlanetId, desc: 'Jupiterian sub-planet indicating divine intervention amidst peril.' },
  ];

  return rawList.map((item) => {
    const rNum = (Math.floor(item.deg / 30) + 1) as RashiNumber;
    const degInR = item.deg % 30;
    const dms = toDMS(item.deg);
    const nakIdx = Math.floor(item.deg / (360.0 / 27.0)) % 27;

    return {
      id: item.id,
      name: item.name,
      sanskritName: item.sanskrit,
      longitude: item.deg,
      dmsStr: `${dms.degrees}°${dms.minutes.toString().padStart(2, '0')}′${dms.seconds.toString().padStart(2, '0')}″`,
      rashiNumber: rNum,
      rashiName: RASHIS[rNum].sanskritName,
      rashiLord: RASHIS[rNum].lord,
      degreeInRashi: degInR,
      nakshatraName: NAKSHATRAS[nakIdx].name,
      lord: item.lord,
      description: item.desc,
    };
  });
}

/**
 * Calculates 22nd Drekkāṇa (Khareśa / Chidra Graha), 64th Navāṃśa, and Drekkāṇa Classifications
 */
export function calculateDrekkanaAnalysis(
  lagnaLong: number,
  moonLong: number,
  planets: Record<PlanetId, CalculatedPlanet>
): DrekkanaAnalysis {
  // 22nd Drekkana from Lagna: Each Drekkana = 10°. Lagna Drekkana index = Math.floor(lagnaLong / 10).
  // 22nd Drekkana index = (lagnaDrekkanaIndex + 21) mod 36.
  const lagnaDrekkanaIndex = Math.floor(lagnaLong / 10);
  const twentySecondIndex = (lagnaDrekkanaIndex + 21) % 36;
  const twentySecondSignIndex = Math.floor(twentySecondIndex / 3);
  const twentySecondPart = (twentySecondIndex % 3); // 0, 1, 2
  const baseSignNum = (twentySecondSignIndex + 1) as RashiNumber;

  // Parashari Drekkana target sign:
  // Part 0 = same sign; Part 1 = 5th from it; Part 2 = 9th from it
  const offsets = [0, 4, 8];
  const twentySecondRashi = (((baseSignNum - 1 + offsets[twentySecondPart]) % 12) + 1) as RashiNumber;
  const khareshaLord = RASHIS[twentySecondRashi].lord;

  // 64th Navamsha from Moon (4th from Moon in D9 / 8th house in D9)
  const moonNavIndex = Math.floor(moonLong / (30.0 / 9.0));
  const sixtyFourthNavIndex = (moonNavIndex + 63) % 108;
  const sixtyFourthSignIndex = Math.floor(sixtyFourthNavIndex / 9);
  const sixtyFourthPart = sixtyFourthNavIndex % 9;
  const moonBaseSign = (sixtyFourthSignIndex + 1) as RashiNumber;
  const elem = RASHIS[moonBaseSign].element;
  let navStart = 1;
  if (elem === 'Fire') navStart = 1;
  else if (elem === 'Earth') navStart = 10;
  else if (elem === 'Air') navStart = 7;
  else if (elem === 'Water') navStart = 4;
  const sixtyFourthRashi = (((navStart - 1 + sixtyFourthPart) % 12) + 1) as RashiNumber;
  const sixtyFourthLord = RASHIS[sixtyFourthRashi].lord;

  // Classify each planet's Drekkana
  // Classical Sarpa, Ayudha, Pakshi, Chatushpada, etc. Drekkana rules:
  // Sarpa (Serpent): Cancer 2nd & 3rd, Scorpio 1st & 2nd, Pisces 3rd
  // Ayudha (Weapon / Armed): Aries 1st & 3rd, Gemini 1st & 3rd, Leo 2nd, Virgo 2nd, Libra 1st, Sagittarius 1st & 3rd, Capricorn 1st
  // Pakshi (Bird): Aries 2nd, Gemini 2nd, Leo 1st, Libra 2nd, Aquarius 1st
  // Chatuṣpada (Quadruped): Aries 2nd, Taurus 1st & 2nd, Leo 3rd, Scorpio 3rd, Sagittarius 1st, Capricorn 2nd
  // Varāha / Pāśa: Capricorn 3rd, Scorpio 1st
  const planetDrekkanas = Object.values(planets).map((p) => {
    const degInR = p.longitudeInRashi;
    const part = (Math.min(2, Math.floor(degInR / 10)) + 1) as 1 | 2 | 3;
    const pSign = p.rashiNumber;
    const pOffsets = [0, 4, 8];
    const dRashi = (((pSign - 1 + pOffsets[part - 1]) % 12) + 1) as RashiNumber;
    const dLord = RASHIS[dRashi].lord;

    let classification: DrekkanaAnalysis['planetDrekkanas'][0]['classification'] = 'Saumya (Gentle / Human)';
    let interpretation = 'Favorable, constructive, and dignified developmental potential.';

    if ((pSign === 4 && (part === 2 || part === 3)) || (pSign === 8 && (part === 1 || part === 2)) || (pSign === 12 && part === 3)) {
      classification = 'Sarpa (Serpent)';
      interpretation = 'Sarpa Drekkāṇa: Intuitive, secretively strategic, intense karmic shedding and regeneration.';
    } else if (
      (pSign === 1 && (part === 1 || part === 3)) ||
      (pSign === 3 && (part === 1 || part === 3)) ||
      (pSign === 5 && part === 2) ||
      (pSign === 6 && part === 2) ||
      (pSign === 7 && part === 1) ||
      (pSign === 9 && (part === 1 || part === 3)) ||
      (pSign === 10 && part === 1)
    ) {
      classification = 'Ayudha (Weapon)';
      interpretation = 'Āyudha Drekkāṇa: Combat-ready, sharp, courageous, enterprising, and self-defensive.';
    } else if ((pSign === 1 && part === 2) || (pSign === 3 && part === 2) || (pSign === 5 && part === 1) || (pSign === 7 && part === 2) || (pSign === 11 && part === 1)) {
      classification = 'Pakṣī (Bird)';
      interpretation = 'Pakṣī Drekkāṇa: Free-ranging, swift intellectual wanderer, exploratory, and communicative.';
    } else if ((pSign === 2 && (part === 1 || part === 2)) || (pSign === 5 && part === 3) || (pSign === 8 && part === 3) || (pSign === 10 && part === 2)) {
      classification = 'Chatuṣpada (Quadruped)';
      interpretation = 'Chatuṣpada Drekkāṇa: Grounded, physical, enduring stamina, animal husbandry, and persistent labor.';
    }

    return {
      planetId: p.id,
      planetName: p.sanskritName,
      drekkanaPart: part,
      drekkanaRashi: dRashi,
      drekkanaRashiName: RASHIS[dRashi].sanskritName,
      drekkanaLord: dLord,
      classification,
      interpretation,
    };
  });

  return {
    twentySecondDrekkana: {
      drekkanaNumber: 22,
      rashiNumber: twentySecondRashi,
      rashiName: RASHIS[twentySecondRashi].sanskritName,
      lord: khareshaLord,
      lordName: GRAHA_PROPERTIES[khareshaLord]?.sanskritName || khareshaLord,
      khareshaDescription: `The Lord of the 22nd Drekkāṇa (Khareśa / Chidra Graha) is ${GRAHA_PROPERTIES[khareshaLord]?.sanskritName || khareshaLord}. It acts as a primary vulnerability and karmic transformation indicator.`,
    },
    sixtyFourthNavamsha: {
      navamshaNumber: 64,
      rashiNumber: sixtyFourthRashi,
      rashiName: RASHIS[sixtyFourthRashi].sanskritName,
      lord: sixtyFourthLord,
      lordName: GRAHA_PROPERTIES[sixtyFourthLord]?.sanskritName || sixtyFourthLord,
      description: `The 64th Navāṃśa from Moon falls in ${RASHIS[sixtyFourthRashi].sanskritName} ruled by ${GRAHA_PROPERTIES[sixtyFourthLord]?.sanskritName || sixtyFourthLord}. Key anchor for subconscious and health shifts.`,
    },
    planetDrekkanas,
  };
}

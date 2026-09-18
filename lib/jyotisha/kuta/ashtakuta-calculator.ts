/**
 * Gaṇaka — Classical Aṣṭakūṭa Calculation Engine
 * Strictly follows Muhūrta Cintāmaṇi, BPHS (Ch. 80-81), and Jātaka Pārijāta.
 * 
 * Implements deterministic scoring, raw conflict detection, and systematic
 * classical exception/cancellation (Parihāra / Bhaṅga) evaluation.
 */

import { JyotishaChart, PlanetId, RashiNumber } from '../types';
import { RASHIS, NAKSHATRAS } from '../constants';
import { calculateNaturalFriendship } from '../dignity';
import { KUTA_CITATIONS } from './citations';
import { SingleKutaResult, KutaExceptionApplied } from './types';

export interface PersonLunarData {
  rashiNumber: RashiNumber;
  rashiLord: PlanetId;
  rashiName: string;
  nakshatraIndex: number; // 0 to 26
  nakshatraNumber: number; // 1 to 27
  nakshatraName: string;
  nakshatraPada: 1 | 2 | 3 | 4;
  longitude: number;
}

export function extractLunarData(chart: JyotishaChart): PersonLunarData {
  const moon = chart.planets.moon;
  const nakIndex = typeof moon.nakshatraIndex === 'number' ? moon.nakshatraIndex : 0;
  const nakNum = nakIndex + 1;
  const rashiNum = moon.rashiNumber;
  const rashiLord = RASHIS[rashiNum].lord;

  return {
    rashiNumber: rashiNum,
    rashiLord: rashiLord,
    rashiName: moon.rashiName || RASHIS[rashiNum].sanskritName,
    nakshatraIndex: nakIndex,
    nakshatraNumber: nakNum,
    nakshatraName: moon.nakshatraName || NAKSHATRAS[nakIndex].name,
    nakshatraPada: moon.pada || 1,
    longitude: moon.siderealLongitude || 0,
  };
}

// ----------------------------------------------------------------------
// 1. VARṆA KŪṬA (Max 1 Point)
// ----------------------------------------------------------------------
// Brāhmaṇa (4, 8, 12 - Water) -> Rank 4
// Kṣatriya (1, 5, 9 - Fire)   -> Rank 3
// Vaiśya (2, 6, 10 - Earth)   -> Rank 2
// Śūdra (3, 7, 11 - Air)      -> Rank 1
const VARNA_RANKS: Record<RashiNumber, { rank: number; name: string; sanskrit: string }> = {
  4: { rank: 4, name: 'Brāhmaṇa', sanskrit: 'ब्राह्मण' },
  8: { rank: 4, name: 'Brāhmaṇa', sanskrit: 'ब्राह्मण' },
  12: { rank: 4, name: 'Brāhmaṇa', sanskrit: 'ब्राह्मण' },
  1: { rank: 3, name: 'Kṣatriya', sanskrit: 'क्षत्रिय' },
  5: { rank: 3, name: 'Kṣatriya', sanskrit: 'क्षत्रिय' },
  9: { rank: 3, name: 'Kṣatriya', sanskrit: 'क्षत्रिय' },
  2: { rank: 2, name: 'Vaiśya', sanskrit: 'वैश्य' },
  6: { rank: 2, name: 'Vaiśya', sanskrit: 'वैश्य' },
  10: { rank: 2, name: 'Vaiśya', sanskrit: 'वैश्य' },
  3: { rank: 1, name: 'Śūdra', sanskrit: 'शूद्र' },
  7: { rank: 1, name: 'Śūdra', sanskrit: 'शूद्र' },
  11: { rank: 1, name: 'Śūdra', sanskrit: 'शूद्र' },
};

export function calculateVarnaKuta(groom: PersonLunarData, bride: PersonLunarData): SingleKutaResult {
  const gVarna = VARNA_RANKS[groom.rashiNumber];
  const bVarna = VARNA_RANKS[bride.rashiNumber];
  const maxScore = 1;

  let obtainedScore = 0;
  let explanation = '';
  let verdict: 'Śubha (Auspicious)' | 'Madhyama (Moderate)' | 'Aśubha (Inauspicious / Defective)';

  if (gVarna.rank >= bVarna.rank) {
    obtainedScore = 1;
    verdict = 'Śubha (Auspicious)';
    explanation = `Groom is ${gVarna.name} (Rank ${gVarna.rank}) and Bride is ${bVarna.name} (Rank ${bVarna.rank}). Groom is equal or higher in spiritual mental temperament. Full points awarded.`;
  } else {
    obtainedScore = 0;
    verdict = 'Aśubha (Inauspicious / Defective)';
    explanation = `Bride is ${bVarna.name} (Rank ${bVarna.rank}) and Groom is ${gVarna.name} (Rank ${gVarna.rank}). Classical texts (Muhūrta Cintāmaṇi Śloka 2) state that when Bride belongs to a higher Varṇa than Groom, 0 points are assigned.`;
  }

  return {
    id: 'varna',
    name: 'Varṇa Kūṭa (वर्ण कूट)',
    sanskritName: 'वर्ण कूट',
    devanagari: 'वर्ण कूट',
    maxScore,
    obtainedScore,
    rawScore: obtainedScore,
    isDoshaPresent: obtainedScore === 0,
    isCancelledByException: false,
    groomValue: `${gVarna.name} (${gVarna.sanskrit})`,
    brideValue: `${bVarna.name} (${bVarna.sanskrit})`,
    matchingCondition: gVarna.rank >= bVarna.rank ? 'Groom Varṇa ≥ Bride Varṇa' : 'Bride Varṇa > Groom Varṇa',
    classicalVerdict: verdict,
    explanation,
    citation: KUTA_CITATIONS.varna,
  };
}

// ----------------------------------------------------------------------
// 2. VAŚYA KŪṬA (Max 2 Points)
// ----------------------------------------------------------------------
// Catuṣpāda (1, 2, 9 [second half], 10 [first half])
// Dvipada / Mānava (3, 6, 7, 9 [first half], 11)
// Jalacara (4, 10 [second half], 12)
// Vanacara (5 - Leo)
// Kīṭa (8 - Scorpio)
export function calculateVashyaKuta(groom: PersonLunarData, bride: PersonLunarData): SingleKutaResult {
  const gR = groom.rashiNumber;
  const bR = bride.rashiNumber;
  const maxScore = 2;

  // Mutual Vaśya mapping per Muhūrta Cintāmaṇi Śloka 3:
  // Aries controls Leo & Scorpio
  // Taurus controls Cancer & Libra
  // Gemini controls Virgo
  // Cancer controls Scorpio & Sagittarius
  // Leo controls Libra
  // Virgo controls Pisces & Gemini
  // Libra controls Capricorn & Virgo
  // Scorpio controls Cancer
  // Sagittarius controls Pisces
  // Capricorn controls Aries & Aquarius
  // Aquarius controls Aries
  // Pisces controls Capricorn
  const VASHYA_AFFINITY_MAP: Record<RashiNumber, RashiNumber[]> = {
    1: [5, 8],
    2: [4, 7],
    3: [6],
    4: [8, 9],
    5: [7],
    6: [12, 3],
    7: [10, 6],
    8: [4],
    9: [12],
    10: [1, 11],
    11: [1],
    12: [10],
  };

  const isSameRashi = gR === bR;
  const groomControlsBride = VASHYA_AFFINITY_MAP[gR]?.includes(bR) || false;
  const brideControlsGroom = VASHYA_AFFINITY_MAP[bR]?.includes(gR) || false;

  let obtainedScore = 0;
  let conditionStr = '';
  let verdict: 'Śubha (Auspicious)' | 'Madhyama (Moderate)' | 'Aśubha (Inauspicious / Defective)';
  let explanation = '';

  if (isSameRashi) {
    obtainedScore = 2;
    verdict = 'Śubha (Auspicious)';
    conditionStr = 'Identical Rāśi (Mutual Affinity)';
    explanation = 'Both share the same Moon sign, producing natural harmony and mutual understanding. Full 2 points awarded.';
  } else if (groomControlsBride && brideControlsGroom) {
    obtainedScore = 2;
    verdict = 'Śubha (Auspicious)';
    conditionStr = 'Mutual Vaśya (Reciprocal Magnetic Attraction)';
    explanation = 'Both Moon signs are mutually amenable (Vaśya) to each other according to Muhūrta Cintāmaṇi. Full 2 points awarded.';
  } else if (groomControlsBride) {
    obtainedScore = 2;
    verdict = 'Śubha (Auspicious)';
    conditionStr = 'Bride in Groom’s Vaśya';
    explanation = 'Bride’s Moon sign is in the Vaśya (amenable control) sphere of the Groom. Full 2 points awarded.';
  } else if (brideControlsGroom) {
    obtainedScore = 1;
    verdict = 'Madhyama (Moderate)';
    conditionStr = 'Groom in Bride’s Vaśya';
    explanation = 'Groom’s Moon sign is in Bride’s Vaśya. Moderate harmony (1 point).';
  } else {
    // Check if one sign is food to another (Bhakṣya-Bhakṣaka: Leo vs Catuṣpāda / Aries etc.)
    const isEnmity = (gR === 5 && [1, 2, 9].includes(bR)) || (bR === 5 && [1, 2, 9].includes(gR));
    obtainedScore = isEnmity ? 0 : 0.5;
    verdict = isEnmity ? 'Aśubha (Inauspicious / Defective)' : 'Madhyama (Moderate)';
    conditionStr = isEnmity ? 'Vaira / Non-Vaśya (Predator-Prey conflict)' : 'Neutral / Non-Vaśya';
    explanation = isEnmity
      ? 'Hostile Vaśya relationship (one sign naturally preys on or opposes the other). 0 points.'
      : 'Neither sign exerts primary Vaśya over the other. 0.5 points assigned for non-hostile indifference.';
  }

  return {
    id: 'vashya',
    name: 'Vaśya Kūṭa (वश्य कूट)',
    sanskritName: 'वश्य कूट',
    devanagari: 'वश्य कूट',
    maxScore,
    obtainedScore,
    rawScore: obtainedScore,
    isDoshaPresent: obtainedScore === 0,
    isCancelledByException: false,
    groomValue: `${RASHIS[gR].sanskritName} (${RASHIS[gR].name})`,
    brideValue: `${RASHIS[bR].sanskritName} (${RASHIS[bR].name})`,
    matchingCondition: conditionStr,
    classicalVerdict: verdict,
    explanation,
    citation: KUTA_CITATIONS.vashya,
  };
}

// ----------------------------------------------------------------------
// 3. TĀRĀ / DINA KŪṬA (Max 3 Points)
// ----------------------------------------------------------------------
export function calculateTaraKuta(groom: PersonLunarData, bride: PersonLunarData): SingleKutaResult {
  const gNak = groom.nakshatraNumber; // 1 to 27
  const bNak = bride.nakshatraNumber; // 1 to 27
  const maxScore = 3;

  // Cycle 1: Count from Bride to Groom modulo 9
  let brideToGroom = (gNak - bNak + 1);
  if (brideToGroom <= 0) brideToGroom += 27;
  const brideToGroomTara = ((brideToGroom - 1) % 9) + 1;

  // Cycle 2: Count from Groom to Bride modulo 9
  let groomToBride = (bNak - gNak + 1);
  if (groomToBride <= 0) groomToBride += 27;
  const groomToBrideTara = ((groomToBride - 1) % 9) + 1;

  const TARA_NAMES: Record<number, { name: string; isBad: boolean; meaning: string }> = {
    1: { name: 'Janma', isBad: false, meaning: 'Birth Nakṣatra (Self)' },
    2: { name: 'Sampat', isBad: false, meaning: 'Wealth & Prosperity' },
    3: { name: 'Vipat', isBad: true, meaning: 'Danger & Calamity' },
    4: { name: 'Kṣema', isBad: false, meaning: 'Wellbeing & Security' },
    5: { name: 'Pratyari', isBad: true, meaning: 'Obstacles & Enmity' },
    6: { name: 'Sādhaka', isBad: false, meaning: 'Achievement & Fulfillment' },
    7: { name: 'Vadha (Naidhana)', isBad: true, meaning: 'Destruction & Severe Affliction' },
    8: { name: 'Mitra', isBad: false, meaning: 'Friendly Affection' },
    9: { name: 'Parama Mitra', isBad: false, meaning: 'Supreme Friendship' },
  };

  const bgInfo = TARA_NAMES[brideToGroomTara];
  const gbInfo = TARA_NAMES[groomToBrideTara];

  let rawScore = 0;
  if (!bgInfo.isBad && !gbInfo.isBad) {
    rawScore = 3;
  } else if (!bgInfo.isBad || !gbInfo.isBad) {
    rawScore = 1.5;
  } else {
    rawScore = 0;
  }

  // Classical Exceptions (Muhūrta Cintāmaṇi Ch. 2):
  // If Tārā lords or Rāśi lords are identical or natural friends, the inauspiciousness of Vipat/Pratyari is mitigated.
  let exceptionApplied: KutaExceptionApplied | undefined;
  let finalScore = rawScore;
  let isCancelled = false;

  const rashiFriendship = calculateNaturalFriendship(groom.rashiLord, bride.rashiLord);
  const areRashiLordsFriendlyOrSame = groom.rashiLord === bride.rashiLord || rashiFriendship === 'Mitra';

  if (rawScore < 3 && areRashiLordsFriendlyOrSame) {
    exceptionApplied = {
      id: 'tara_mitra_parihara',
      ruleTitle: 'Rāśi Lord Friendship Tārā Parihāra',
      sanskritTitle: 'राशीश मैत्री तारा परिहार',
      sourceText: 'Muhūrta Cintāmaṇi',
      chapterAndVerse: 'Vivāha Prakaraṇa Śloka 5',
      conditionDescription: `Moon sign lords are ${groom.rashiLord === bride.rashiLord ? 'identical' : 'mutual friends'} (${groom.rashiLord} & ${bride.rashiLord}), neutralizing the adverse Tārā ray.`,
      effect: 'mitigated_dosha',
      grantedPoints: 1.5,
    };
    finalScore = Math.min(3, rawScore + 1.5);
    isCancelled = true;
  }

  const verdict =
    finalScore >= 3
      ? 'Śubha (Auspicious)'
      : finalScore >= 1.5
      ? 'Madhyama (Moderate)'
      : 'Aśubha (Inauspicious / Defective)';

  return {
    id: 'tara',
    name: 'Tārā / Dina Kūṭa (तारा / दिन कूट)',
    sanskritName: 'तारा कूट',
    devanagari: 'तारा कूट',
    maxScore,
    obtainedScore: finalScore,
    rawScore,
    isDoshaPresent: rawScore === 0,
    isCancelledByException: isCancelled,
    exceptionApplied,
    groomValue: `To Bride: ${bgInfo.name} (${brideToGroomTara})`,
    brideValue: `To Groom: ${gbInfo.name} (${groomToBrideTara})`,
    matchingCondition: `Bride→Groom: ${bgInfo.name} (${bgInfo.isBad ? 'Adverse' : 'Favorable'}) | Groom→Bride: ${gbInfo.name} (${gbInfo.isBad ? 'Adverse' : 'Favorable'})`,
    classicalVerdict: verdict,
    explanation: `Count from Bride to Groom gives ${bgInfo.name} Tārā; Count from Groom to Bride gives ${gbInfo.name} Tārā. Raw score: ${rawScore}/3.${isCancelled ? ' Exception applied: Rāśi lord friendship mitigates Tārā defect.' : ''}`,
    citation: KUTA_CITATIONS.tara,
  };
}

// ----------------------------------------------------------------------
// 4. YONI KŪṬA (Max 4 Points)
// ----------------------------------------------------------------------
// 14 Yonis mapped across 27 Nakṣatras:
// 1. Aśva (Horse): Aśvinī, Śatabhiṣā
// 2. Gaja (Elephant): Bharaṇī, Revatī
// 3. Meṣa (Sheep/Ram): Kṛttikā, Puṣya
// 4. Sarpa (Serpent): Rohiṇī, Mṛgaśīrṣā
// 5. Śvā (Dog): Ārdrā, Mūla
// 6. Mārjāra (Cat): Punarvasu, Āśleṣā
// 7. Siṃha (Lion): Maghā, Pūrva Phālgunī
// 8. Go (Cow): Uttara Phālgunī, Uttara Bhādrapadā
// 9. Mahiṣa (Buffalo): Hasta, Svātī
// 10. Vyāghra (Tiger): Citrā, Viśākhā
// 11. Mṛga (Deer): Anurādhā, Jyeṣṭhā
// 12. Vānara (Monkey): Pūrvāṣāḍhā, Śravaṇa
// 13. Nakula (Mongoose): Uttarāṣāḍhā, Abhijit (or just Uttarāṣāḍhā)
// 14. Mūṣaka (Rat): Dhaniṣṭhā, Pūrva Bhādrapadā
interface YoniClassification {
  animal: string;
  sanskrit: string;
  gender: 'Male' | 'Female';
}

const NAKSHATRA_YONI_TABLE: Record<number, YoniClassification> = {
  1: { animal: 'Horse', sanskrit: 'अश्व (Aśva)', gender: 'Male' },
  2: { animal: 'Elephant', sanskrit: 'गज (Gaja)', gender: 'Male' },
  3: { animal: 'Sheep', sanskrit: 'मेष (Meṣa)', gender: 'Female' },
  4: { animal: 'Serpent', sanskrit: 'सर्प (Sarpa)', gender: 'Male' },
  5: { animal: 'Serpent', sanskrit: 'सर्प (Sarpa)', gender: 'Female' },
  6: { animal: 'Dog', sanskrit: 'श्वान (Śvā)', gender: 'Female' },
  7: { animal: 'Cat', sanskrit: 'मार्जार (Mārjāra)', gender: 'Female' },
  8: { animal: 'Sheep', sanskrit: 'मेष (Meṣa)', gender: 'Male' },
  9: { animal: 'Cat', sanskrit: 'मार्जार (Mārjāra)', gender: 'Male' },
  10: { animal: 'Lion', sanskrit: 'सिंह (Siṃha)', gender: 'Male' },
  11: { animal: 'Lion', sanskrit: 'सिंह (Siṃha)', gender: 'Female' },
  12: { animal: 'Cow', sanskrit: 'गौ (Go)', gender: 'Male' },
  13: { animal: 'Buffalo', sanskrit: 'महिष (Mahiṣa)', gender: 'Female' },
  14: { animal: 'Tiger', sanskrit: 'व्याघ्र (Vyāghra)', gender: 'Female' },
  15: { animal: 'Buffalo', sanskrit: 'महिष (Mahiṣa)', gender: 'Male' },
  16: { animal: 'Tiger', sanskrit: 'व्याघ्र (Vyāghra)', gender: 'Male' },
  17: { animal: 'Deer', sanskrit: 'मृग (Mṛga)', gender: 'Female' },
  18: { animal: 'Deer', sanskrit: 'मृग (Mṛga)', gender: 'Male' },
  19: { animal: 'Dog', sanskrit: 'श्वान (Śvā)', gender: 'Male' },
  20: { animal: 'Monkey', sanskrit: 'वानर (Vānara)', gender: 'Male' },
  21: { animal: 'Mongoose', sanskrit: 'नकुल (Nakula)', gender: 'Male' },
  22: { animal: 'Monkey', sanskrit: 'वानर (Vānara)', gender: 'Female' },
  23: { animal: 'Rat', sanskrit: 'मूषक (Mūṣaka)', gender: 'Female' },
  24: { animal: 'Horse', sanskrit: 'अश्व (Aśva)', gender: 'Female' },
  25: { animal: 'Rat', sanskrit: 'मूषक (Mūṣaka)', gender: 'Male' },
  26: { animal: 'Cow', sanskrit: 'गौ (Go)', gender: 'Female' },
  27: { animal: 'Elephant', sanskrit: 'गज (Gaja)', gender: 'Female' },
};

// Sworn Enmity (Śatru / Mahāvaira) pairs per Muhūrta Cintāmaṇi:
// Horse - Buffalo (अश्व - महिष)
// Elephant - Lion (गज - सिंह)
// Sheep - Monkey (मेष - वानर)
// Serpent - Mongoose (सर्प - नकुल)
// Dog - Deer (श्वान - मृग)
// Cat - Rat (मार्जार - मूषक)
// Cow - Tiger (गौ - व्याघ्र)
const SWORN_ENMITY_PAIRS: [string, string][] = [
  ['Horse', 'Buffalo'],
  ['Elephant', 'Lion'],
  ['Sheep', 'Monkey'],
  ['Serpent', 'Mongoose'],
  ['Dog', 'Deer'],
  ['Cat', 'Rat'],
  ['Cow', 'Tiger'],
];

export function calculateYoniKuta(groom: PersonLunarData, bride: PersonLunarData): SingleKutaResult {
  const gYoni = NAKSHATRA_YONI_TABLE[groom.nakshatraNumber];
  const bYoni = NAKSHATRA_YONI_TABLE[bride.nakshatraNumber];
  const maxScore = 4;

  const isSwornEnemy = SWORN_ENMITY_PAIRS.some(
    ([a, b]) =>
      (gYoni.animal === a && bYoni.animal === b) ||
      (gYoni.animal === b && bYoni.animal === a)
  );

  let obtainedScore = 0;
  let conditionStr = '';
  let verdict: 'Śubha (Auspicious)' | 'Madhyama (Moderate)' | 'Aśubha (Inauspicious / Defective)';
  let explanation = '';

  if (gYoni.animal === bYoni.animal) {
    obtainedScore = 4;
    verdict = 'Śubha (Auspicious)';
    conditionStr = `Same Yoni (${gYoni.animal})`;
    explanation = `Both bride and groom share the same Yoni species (${gYoni.animal}). Complete physical intimacy, biological affinity, and constitutional alignment. Full 4 points.`;
  } else if (isSwornEnemy) {
    obtainedScore = 0;
    verdict = 'Aśubha (Inauspicious / Defective)';
    conditionStr = `Mahāvaira / Sworn Enmity (${gYoni.animal} vs ${bYoni.animal})`;
    explanation = `The Yonis represent natural sworn predatory enemies in nature (${gYoni.animal} and ${bYoni.animal}). Classical treatises designate this as Mahāvaira Yoni Doṣa (0 points).`;
  } else {
    // Friendly vs Neutral vs Unfriendly scoring
    // Friends = 3, Neutral = 2, Unfriendly = 1
    // Animals of same genus or harmless herbivores (e.g. Deer & Cow) score 3.
    const HERBIVORES = ['Horse', 'Elephant', 'Sheep', 'Cow', 'Buffalo', 'Deer'];
    const isBothHerbivore = HERBIVORES.includes(gYoni.animal) && HERBIVORES.includes(bYoni.animal);

    if (isBothHerbivore) {
      obtainedScore = 3;
      verdict = 'Śubha (Auspicious)';
      conditionStr = `Friendly Animals (${gYoni.animal} & ${bYoni.animal})`;
      explanation = `Friendly non-competing animal species (${gYoni.animal} & ${bYoni.animal}). Generates peaceful temperament and mutual comfort (3 points).`;
    } else {
      obtainedScore = 2;
      verdict = 'Madhyama (Moderate)';
      conditionStr = `Neutral Animals (${gYoni.animal} & ${bYoni.animal})`;
      explanation = `Neutral animal disposition between ${gYoni.animal} and ${bYoni.animal} (2 points).`;
    }
  }

  return {
    id: 'yoni',
    name: 'Yoni Kūṭa (योनि कूट)',
    sanskritName: 'योनि कूट',
    devanagari: 'योनि कूट',
    maxScore,
    obtainedScore,
    rawScore: obtainedScore,
    isDoshaPresent: obtainedScore === 0,
    isCancelledByException: false,
    groomValue: `${gYoni.sanskrit} (${gYoni.gender})`,
    brideValue: `${bYoni.sanskrit} (${bYoni.gender})`,
    matchingCondition: conditionStr,
    classicalVerdict: verdict,
    explanation,
    citation: KUTA_CITATIONS.yoni,
  };
}

// ----------------------------------------------------------------------
// 5. GRAHA MAITRĪ KŪṬA (Max 5 Points)
// ----------------------------------------------------------------------
export function calculateGrahaMaitriKuta(groom: PersonLunarData, bride: PersonLunarData): SingleKutaResult {
  const gLord = groom.rashiLord;
  const bLord = bride.rashiLord;
  const maxScore = 5;

  let obtainedScore = 0;
  let conditionStr = '';
  let verdict: 'Śubha (Auspicious)' | 'Madhyama (Moderate)' | 'Aśubha (Inauspicious / Defective)';
  let explanation = '';

  if (gLord === bLord) {
    obtainedScore = 5;
    verdict = 'Śubha (Auspicious)';
    conditionStr = `Identical Moon Sign Lord (${gLord})`;
    explanation = `Both share the same Moon sign lord (${gLord}). Complete psychic harmony and intellectual alignment. Full 5 points.`;
  } else {
    const groomRelToBride = calculateNaturalFriendship(gLord, bLord); // 'Mitra' | 'Sama' | 'Shatru'
    const brideRelToGroom = calculateNaturalFriendship(bLord, gLord);

    if (groomRelToBride === 'Mitra' && brideRelToGroom === 'Mitra') {
      obtainedScore = 5;
      verdict = 'Śubha (Auspicious)';
      conditionStr = `Mutual Friends (${gLord} ↔ ${bLord})`;
      explanation = `Rāśi lords ${gLord} and ${bLord} are mutual natural friends (Naisargika Mitra). Full 5 points.`;
    } else if (
      (groomRelToBride === 'Mitra' && brideRelToGroom === 'Sama') ||
      (groomRelToBride === 'Sama' && brideRelToGroom === 'Mitra')
    ) {
      obtainedScore = 4;
      verdict = 'Śubha (Auspicious)';
      conditionStr = `Friend + Neutral (${gLord} & ${bLord})`;
      explanation = `One lord treats the other as friend and the other treats as neutral. Auspicious (4 points).`;
    } else if (groomRelToBride === 'Sama' && brideRelToGroom === 'Sama') {
      obtainedScore = 3;
      verdict = 'Madhyama (Moderate)';
      conditionStr = `Mutual Neutral (${gLord} ↔ ${bLord})`;
      explanation = `Both Moon sign lords view each other as neutrals (Sama). Balanced 3 points.`;
    } else if (
      (groomRelToBride === 'Mitra' && brideRelToGroom === 'Shatru') ||
      (groomRelToBride === 'Shatru' && brideRelToGroom === 'Mitra')
    ) {
      obtainedScore = 1;
      verdict = 'Aśubha (Inauspicious / Defective)';
      conditionStr = `Friend + Enemy (${gLord} & ${bLord})`;
      explanation = `Asymmetric friendship/enmity between ${gLord} and ${bLord} (1 point).`;
    } else if (
      (groomRelToBride === 'Sama' && brideRelToGroom === 'Shatru') ||
      (groomRelToBride === 'Shatru' && brideRelToGroom === 'Sama')
    ) {
      obtainedScore = 0.5;
      verdict = 'Aśubha (Inauspicious / Defective)';
      conditionStr = `Neutral + Enemy (${gLord} & ${bLord})`;
      explanation = `One lord is neutral, while the other is an enemy (0.5 points).`;
    } else {
      obtainedScore = 0;
      verdict = 'Aśubha (Inauspicious / Defective)';
      conditionStr = `Mutual Enemies (${gLord} ↔ ${bLord})`;
      explanation = `Both Moon sign lords are mutual natural enemies (Naisargika Śatru). 0 points.`;
    }
  }

  return {
    id: 'graha_maitri',
    name: 'Graha Maitrī Kūṭa (ग्रहमैत्री कूट)',
    sanskritName: 'ग्रहमैत्री कूट',
    devanagari: 'ग्रहमैत्री कूट',
    maxScore,
    obtainedScore,
    rawScore: obtainedScore,
    isDoshaPresent: obtainedScore <= 1,
    isCancelledByException: false,
    groomValue: `${groom.rashiLord} (${groom.rashiName})`,
    brideValue: `${bride.rashiLord} (${bride.rashiName})`,
    matchingCondition: conditionStr,
    classicalVerdict: verdict,
    explanation,
    citation: KUTA_CITATIONS.graha_maitri,
  };
}

// ----------------------------------------------------------------------
// 6. GAṆA KŪṬA (Max 6 Points)
// ----------------------------------------------------------------------
// Deva: Aśvinī, Mṛgaśīrṣā, Punarvasu, Puṣya, Hasta, Svātī, Anurādhā, Śravaṇa, Revatī
// Manuṣya: Bharaṇī, Rohiṇī, Ārdrā, Pūrva Phālgunī, Uttara Phālgunī, Pūrvāṣāḍhā, Uttarāṣāḍhā, Pūrva Bhādrapadā, Uttara Bhādrapadā
// Rākṣasa: Kṛttikā, Āśleṣā, Maghā, Citrā, Viśākhā, Jyeṣṭhā, Mūla, Dhaniṣṭhā, Śatabhiṣā
type GanaCategory = 'Deva' | 'Manushya' | 'Rakshasa';

const NAKSHATRA_GANA_MAP: Record<number, GanaCategory> = {
  1: 'Deva',
  2: 'Manushya',
  3: 'Rakshasa',
  4: 'Manushya',
  5: 'Deva',
  6: 'Manushya',
  7: 'Deva',
  8: 'Deva',
  9: 'Rakshasa',
  10: 'Rakshasa',
  11: 'Manushya',
  12: 'Manushya',
  13: 'Deva',
  14: 'Rakshasa',
  15: 'Deva',
  16: 'Rakshasa',
  17: 'Deva',
  18: 'Rakshasa',
  19: 'Rakshasa',
  20: 'Manushya',
  21: 'Manushya',
  22: 'Deva',
  23: 'Rakshasa',
  24: 'Rakshasa',
  25: 'Manushya',
  26: 'Manushya',
  27: 'Deva',
};

export function calculateGanaKuta(groom: PersonLunarData, bride: PersonLunarData): SingleKutaResult {
  const gGana = NAKSHATRA_GANA_MAP[groom.nakshatraNumber];
  const bGana = NAKSHATRA_GANA_MAP[bride.nakshatraNumber];
  const maxScore = 6;

  let rawScore = 0;
  let conditionStr = `${gGana} (Groom) & ${bGana} (Bride)`;

  if (gGana === bGana) {
    rawScore = 6;
  } else if (
    (gGana === 'Deva' && bGana === 'Manushya') ||
    (gGana === 'Manushya' && bGana === 'Deva')
  ) {
    rawScore = 5;
  } else if (gGana === 'Rakshasa' && (bGana === 'Deva' || bGana === 'Manushya')) {
    // Rākṣasa Groom with Deva/Manuṣya bride is tolerated moderately in some texts (1 point)
    rawScore = 1;
  } else {
    // Rākṣasa Bride with Deva/Manuṣya Groom causes severe disharmony per classical texts
    rawScore = 0;
  }

  // Classical Exceptions (Muhūrta Cintāmaṇi Śloka 15):
  // 1. If Moon sign lords are identical or mutual friends.
  // 2. If the distance from Bride Nakṣatra to Groom Nakṣatra is > 14.
  // In these cases, Gaṇa Doṣa is nullified and partial/full points are restored.
  let exceptionApplied: KutaExceptionApplied | undefined;
  let finalScore = rawScore;
  let isCancelled = false;

  const rashiLordSameOrFriend =
    groom.rashiLord === bride.rashiLord ||
    calculateNaturalFriendship(groom.rashiLord, bride.rashiLord) === 'Mitra';

  let nakDistance = groom.nakshatraNumber - bride.nakshatraNumber + 1;
  if (nakDistance <= 0) nakDistance += 27;

  if (rawScore <= 1) {
    if (rashiLordSameOrFriend) {
      exceptionApplied = {
        id: 'gana_rashi_lord_maitri',
        ruleTitle: 'Rāśi Lord Friendship Gaṇa Parihāra',
        sanskritTitle: 'राशीश मैत्री गण परिहार',
        sourceText: 'Muhūrta Cintāmaṇi',
        chapterAndVerse: 'Vivāha Prakaraṇa Śloka 15',
        conditionDescription: `Moon sign lords are ${groom.rashiLord === bride.rashiLord ? 'identical' : 'mutual friends'} (${groom.rashiLord} & ${bride.rashiLord}). Classical texts state that Graha Maitrī overrides Gaṇa conflict.`,
        effect: 'mitigated_dosha',
        grantedPoints: 4,
      };
      finalScore = 4;
      isCancelled = true;
    } else if (nakDistance > 14) {
      exceptionApplied = {
        id: 'gana_distance_parihara',
        ruleTitle: 'Nakṣatra Distance (>14) Parihāra',
        sanskritTitle: 'दूर नक्षत्र गण परिहार',
        sourceText: 'Muhūrta Cintāmaṇi',
        chapterAndVerse: 'Vivāha Prakaraṇa Śloka 15',
        conditionDescription: `The distance from Bride Nakṣatra to Groom Nakṣatra is ${nakDistance} (>14 nakṣatras), mitigating Gaṇa friction.`,
        effect: 'mitigated_dosha',
        grantedPoints: 3,
      };
      finalScore = 3;
      isCancelled = true;
    }
  }

  const verdict =
    finalScore >= 5
      ? 'Śubha (Auspicious)'
      : finalScore >= 3
      ? 'Madhyama (Moderate)'
      : 'Aśubha (Inauspicious / Defective)';

  return {
    id: 'gana',
    name: 'Gaṇa Kūṭa (गण कूट)',
    sanskritName: 'गण कूट',
    devanagari: 'गण कूट',
    maxScore,
    obtainedScore: finalScore,
    rawScore,
    isDoshaPresent: rawScore <= 1,
    isCancelledByException: isCancelled,
    exceptionApplied,
    groomValue: `${gGana} (${groom.nakshatraName})`,
    brideValue: `${bGana} (${bride.nakshatraName})`,
    matchingCondition: conditionStr,
    classicalVerdict: verdict,
    explanation: `Groom is ${gGana} and Bride is ${bGana}. Raw score: ${rawScore}/6.${isCancelled ? ' Exception applied: Gaṇa defect mitigated by classical parihāra.' : ''}`,
    citation: KUTA_CITATIONS.gana,
  };
}

// ----------------------------------------------------------------------
// 7. BHAKŪṬA / RĀŚI KŪṬA (Max 7 Points)
// ----------------------------------------------------------------------
export function calculateBhakutaKuta(groom: PersonLunarData, bride: PersonLunarData): SingleKutaResult {
  const gR = groom.rashiNumber;
  const bR = bride.rashiNumber;
  const maxScore = 7;

  // Displacement from Bride to Groom (1 to 12)
  let displacement = (gR - bR + 1);
  if (displacement <= 0) displacement += 12;

  // The reciprocal displacement from Groom to Bride is 14 - displacement (or 13 - displacement depending on inclusive count)
  // Pair representations:
  // 1-1 (Abhinna)
  // 2-12 (Dvidvādaśa)
  // 3-11 (Trir-ekādaśa)
  // 4-10 (Caturtha-Daśama)
  // 5-9 (Nava-Pañcama)
  // 6-8 (Ṣaḍaṣṭaka)
  // 7-7 (Saptama)
  const is2_12 = displacement === 2 || displacement === 12;
  const is6_8 = displacement === 6 || displacement === 8;
  const is5_9 = displacement === 5 || displacement === 9;

  let rawScore = 0;
  let conditionStr = '';
  let defectType: string | null = null;

  if (is2_12) {
    rawScore = 0;
    defectType = 'Dvidvādaśa (2-12)';
    conditionStr = '2-12 Displacement (Dvidvādaśa Doṣa)';
  } else if (is6_8) {
    rawScore = 0;
    defectType = 'Ṣaḍaṣṭaka (6-8)';
    conditionStr = '6-8 Displacement (Ṣaḍaṣṭaka Doṣa)';
  } else if (is5_9) {
    rawScore = 0;
    defectType = 'Nava-Pañcama (5-9)';
    conditionStr = '5-9 Displacement (Nava-Pañcama Doṣa)';
  } else {
    // 1-1, 3-11, 4-10, 7-7 are auspicious
    rawScore = 7;
    conditionStr = `${displacement}-${14 - displacement > 12 ? 1 : 14 - displacement} Auspicious Displacement`;
  }

  // Classical Exceptions (Bhakūṭa Bhaṅga per Muhūrta Cintāmaṇi Śloka 18–21 & BPHS Ch. 80):
  // 1. Same Moon sign lord (e.g. Aries-Scorpio is 6-8 but lord is Mars; Taurus-Libra is 6-8 but lord is Venus; Capricorn-Aquarius is 2-12 but lord is Saturn).
  // 2. Moon sign lords are mutual natural friends (e.g. Pisces-Leo: Jupiter & Sun; Cancer-Sagittarius: Moon & Jupiter).
  // 3. Same Navāṃśa lord or Navāṃśa compatibility.
  let exceptionApplied: KutaExceptionApplied | undefined;
  let finalScore = rawScore;
  let isCancelled = false;

  const sameRashiLord = groom.rashiLord === bride.rashiLord;
  const mutualFriendLords = calculateNaturalFriendship(groom.rashiLord, bride.rashiLord) === 'Mitra';

  if (rawScore === 0) {
    if (sameRashiLord) {
      exceptionApplied = {
        id: 'bhakuta_same_lord_bhanga',
        ruleTitle: 'Ekeśa Bhakūṭa Bhaṅga (Same Rāśi Lord)',
        sanskritTitle: 'एकनाथ भकूट भङ्ग',
        sourceText: 'Muhūrta Cintāmaṇi',
        chapterAndVerse: 'Vivāha Prakaraṇa Śloka 18',
        shloka: 'एकस्याधिपतेर्भावे षडष्टकेऽपि न दोषः ।',
        conditionDescription: `Groom (${groom.rashiName}) and Bride (${bride.rashiName}) share the same Moon sign lord (${groom.rashiLord}). Classical treatises confirm that identical lordship completely cancels ${defectType}.`,
        effect: 'full_cancellation',
        grantedPoints: 7,
      };
      finalScore = 7;
      isCancelled = true;
    } else if (mutualFriendLords) {
      exceptionApplied = {
        id: 'bhakuta_mitra_bhanga',
        ruleTitle: 'Maitrī Bhakūṭa Bhaṅga (Mutual Friendship of Lords)',
        sanskritTitle: 'मैत्री भकूट भङ्ग',
        sourceText: 'Muhūrta Cintāmaṇi & BPHS',
        chapterAndVerse: 'Vivāha Prakaraṇa Śloka 19 / BPHS 80:31',
        shloka: 'राशीशयोश्च सुहृद्भावे भकूटदोषो न जायते ॥',
        conditionDescription: `Moon sign lords (${groom.rashiLord} & ${bride.rashiLord}) are mutual natural friends (Mitra), canceling ${defectType}.`,
        effect: 'full_cancellation',
        grantedPoints: 7,
      };
      finalScore = 7;
      isCancelled = true;
    }
  }

  const verdict =
    finalScore >= 7
      ? 'Śubha (Auspicious)'
      : 'Aśubha (Inauspicious / Defective)';

  return {
    id: 'bhakuta',
    name: 'Bhakūṭa / Rāśi Kūṭa (भकूट कूट)',
    sanskritName: 'भकूट कूट',
    devanagari: 'भकूट कूट',
    maxScore,
    obtainedScore: finalScore,
    rawScore,
    isDoshaPresent: rawScore === 0,
    isCancelledByException: isCancelled,
    exceptionApplied,
    groomValue: `${groom.rashiName} (Rāśi ${gR})`,
    brideValue: `${bride.rashiName} (Rāśi ${bR})`,
    matchingCondition: conditionStr,
    classicalVerdict: verdict,
    explanation:
      rawScore === 7
        ? `Auspicious sign displacement (${displacement}). Full 7 points awarded.`
        : isCancelled
        ? `Raw ${defectType} detected, but completely cancelled by classical Bhakūṭa Bhaṅga (${exceptionApplied?.ruleTitle}). Full 7 points restored.`
        : `Defective ${defectType} displacement without cancellation. 0/7 points.`,
    citation: KUTA_CITATIONS.bhakuta,
  };
}

// ----------------------------------------------------------------------
// 8. NĀḌĪ KŪṬA (Max 8 Points)
// ----------------------------------------------------------------------
// 27 Nakṣatras divided into:
// Ādi (Vāta): 1, 6, 7, 12, 13, 18, 19, 24, 25
// Madhya (Pitta): 2, 5, 8, 11, 14, 17, 20, 23, 26
// Antya (Kapha): 3, 4, 9, 10, 15, 16, 21, 22, 27
type NadiCategory = 'Ādi (Vāta)' | 'Madhya (Pitta)' | 'Antya (Kapha)';

const NAKSHATRA_NADI_MAP: Record<number, NadiCategory> = {
  1: 'Ādi (Vāta)',
  2: 'Madhya (Pitta)',
  3: 'Antya (Kapha)',
  4: 'Antya (Kapha)',
  5: 'Madhya (Pitta)',
  6: 'Ādi (Vāta)',
  7: 'Ādi (Vāta)',
  8: 'Madhya (Pitta)',
  9: 'Antya (Kapha)',
  10: 'Antya (Kapha)',
  11: 'Madhya (Pitta)',
  12: 'Ādi (Vāta)',
  13: 'Ādi (Vāta)',
  14: 'Madhya (Pitta)',
  15: 'Antya (Kapha)',
  16: 'Antya (Kapha)',
  17: 'Madhya (Pitta)',
  18: 'Ādi (Vāta)',
  19: 'Ādi (Vāta)',
  20: 'Madhya (Pitta)',
  21: 'Antya (Kapha)',
  22: 'Antya (Kapha)',
  23: 'Madhya (Pitta)',
  24: 'Ādi (Vāta)',
  25: 'Ādi (Vāta)',
  26: 'Madhya (Pitta)',
  27: 'Antya (Kapha)',
};

export function calculateNadiKuta(groom: PersonLunarData, bride: PersonLunarData): SingleKutaResult {
  const gNadi = NAKSHATRA_NADI_MAP[groom.nakshatraNumber];
  const bNadi = NAKSHATRA_NADI_MAP[bride.nakshatraNumber];
  const maxScore = 8;

  const isSameNadi = gNadi === bNadi;
  let rawScore = isSameNadi ? 0 : 8;

  // Classical Exceptions to Eka-Nāḍī Doṣa (Muhūrta Cintāmaṇi Śloka 25–27, BPHS Ch. 80 v. 34–36):
  // 1. Same Rāśi but Different Nakṣatras (एकराशौ पृथग्धिष्ण्ये नाडीदोषो न विद्यते).
  // 2. Same Nakṣatra but Different Rāśis (e.g. Kṛttikā Aries-Taurus, Mṛgaśīrṣā Taurus-Gemini, etc.).
  // 3. Same Nakṣatra with Different Padas for certain benign nakṣatras (Rohiṇī, Mṛgaśīrṣā, Ārdrā, Jyeṣṭhā, etc.).
  // 4. Identical Moon sign lords with different nakṣatras.
  let exceptionApplied: KutaExceptionApplied | undefined;
  let finalScore = rawScore;
  let isCancelled = false;

  if (isSameNadi) {
    const isSameRashiDiffNak = groom.rashiNumber === bride.rashiNumber && groom.nakshatraNumber !== bride.nakshatraNumber;
    const isSameNakDiffRashi = groom.nakshatraNumber === bride.nakshatraNumber && groom.rashiNumber !== bride.rashiNumber;
    const isSameNakDiffPada = groom.nakshatraNumber === bride.nakshatraNumber && groom.nakshatraPada !== bride.nakshatraPada;

    if (isSameRashiDiffNak) {
      exceptionApplied = {
        id: 'nadi_same_rashi_diff_nak',
        ruleTitle: 'Eka-Rāśi Bhinna-Nakṣatra Parihāra',
        sanskritTitle: 'एकराशौ पृथग्धिष्ण्ये नाडी परिहार',
        sourceText: 'Muhūrta Cintāmaṇi & BPHS',
        chapterAndVerse: 'Vivāha Prakaraṇa Śloka 25 / BPHS 80:34',
        shloka: 'एकराशौ पृथग्धिष्ण्ये नाडीदोषो न विद्यते । पृथग्राशौ त्वेकधिष्ण्ये नाडीदोषो न विद्यते ॥',
        conditionDescription: `Same Moon sign (${groom.rashiName}) but different Nakṣatras (${groom.nakshatraName} & ${bride.nakshatraName}). Classical shlokas expressly exempt this from Eka-Nāḍī Doṣa.`,
        effect: 'full_cancellation',
        grantedPoints: 8,
      };
      finalScore = 8;
      isCancelled = true;
    } else if (isSameNakDiffRashi) {
      exceptionApplied = {
        id: 'nadi_same_nak_diff_rashi',
        ruleTitle: 'Eka-Nakṣatra Bhinna-Rāśi Parihāra',
        sanskritTitle: 'पृथग्राशौ त्वेकधिष्ण्ये नाडी परिहार',
        sourceText: 'Muhūrta Cintāmaṇi & BPHS',
        chapterAndVerse: 'Vivāha Prakaraṇa Śloka 25 / BPHS 80:34',
        shloka: 'पृथग्राशौ त्वेकधिष्ण्ये नाडीदोषो न विद्यते ॥',
        conditionDescription: `Same Nakṣatra (${groom.nakshatraName}) spanning across different Rāśis (${groom.rashiName} & ${bride.rashiName}). Fully exempt from Nāḍī Doṣa.`,
        effect: 'full_cancellation',
        grantedPoints: 8,
      };
      finalScore = 8;
      isCancelled = true;
    } else if (isSameNakDiffPada) {
      // Different quarters
      exceptionApplied = {
        id: 'nadi_diff_pada_parihara',
        ruleTitle: 'Bhinna Pada (Different Quarters) Parihāra',
        sanskritTitle: 'पाद भेद नाडी परिहार',
        sourceText: 'Muhūrta Cintāmaṇi',
        chapterAndVerse: 'Vivāha Prakaraṇa Śloka 26',
        conditionDescription: `Same Nakṣatra (${groom.nakshatraName}) but distinct Padas (Groom P${groom.nakshatraPada}, Bride P${bride.nakshatraPada}). Nāḍī affliction is significantly mitigated.`,
        effect: 'mitigated_dosha',
        grantedPoints: 6,
      };
      finalScore = 6;
      isCancelled = true;
    }
  }

  const verdict =
    finalScore >= 8
      ? 'Śubha (Auspicious)'
      : finalScore >= 6
      ? 'Madhyama (Moderate)'
      : 'Aśubha (Inauspicious / Defective)';

  return {
    id: 'nadi',
    name: 'Nāḍī Kūṭa (नाडी कूट)',
    sanskritName: 'नाडी कूट',
    devanagari: 'नाडी कूट',
    maxScore,
    obtainedScore: finalScore,
    rawScore,
    isDoshaPresent: rawScore === 0,
    isCancelledByException: isCancelled,
    exceptionApplied,
    groomValue: `${gNadi} (${groom.nakshatraName})`,
    brideValue: `${bNadi} (${bride.nakshatraName})`,
    matchingCondition: isSameNadi ? `Identical Nāḍī (${gNadi})` : `Distinct Nāḍīs (${gNadi} ↔ ${bNadi})`,
    classicalVerdict: verdict,
    explanation:
      rawScore === 8
        ? `Different Nāḍīs (${gNadi} & ${bNadi}). Complete physiological, genetic, and constitutional harmony. Full 8 points.`
        : isCancelled
        ? `Raw Eka-Nāḍī conflict (${gNadi}) cancelled by classical exception: ${exceptionApplied?.ruleTitle}. ${finalScore}/8 points restored.`
        : `Unmitigated Eka-Nāḍī Doṣa (${gNadi}). Classical texts strictly warn against genetic defect and lineage affliction. 0/8 points.`,
    citation: KUTA_CITATIONS.nadi,
  };
}

// ----------------------------------------------------------------------
// Master Aṣṭakūṭa Runner
// ----------------------------------------------------------------------
export function calculateAllAshtakutas(groom: PersonLunarData, bride: PersonLunarData): SingleKutaResult[] {
  return [
    calculateVarnaKuta(groom, bride),
    calculateVashyaKuta(groom, bride),
    calculateTaraKuta(groom, bride),
    calculateYoniKuta(groom, bride),
    calculateGrahaMaitriKuta(groom, bride),
    calculateGanaKuta(groom, bride),
    calculateBhakutaKuta(groom, bride),
    calculateNadiKuta(groom, bride),
  ];
}

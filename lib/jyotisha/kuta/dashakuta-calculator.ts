/**
 * Gaṇaka — South Indian Daśakūṭa (10 Poruthams) Engine
 * Sources: Mādhavīya, Jātaka Deśamārga, Prasna Marga, Muhūrta Dīpikā.
 * 
 * Distinct South Indian tradition incorporating:
 * 1. Dina Porutham (corresponds to Tārā)
 * 2. Gaṇa Porutham
 * 3. Mahendra Porutham (progeny, longevity, prosperity)
 * 4. Strī Dīrgha Porutham (marital longevity)
 * 5. Yoni Porutham
 * 6. Rāśi Porutham (corresponds to Bhakūṭa)
 * 7. Rāśyadhipati Porutham (corresponds to Graha Maitrī)
 * 8. Vaśya Porutham
 * 9. Rajju Porutham (primary physical longevity rope)
 * 10. Vedha Porutham (piercing nakṣatra discord)
 */

import { PersonLunarData } from './ashtakuta-calculator';
import { SingleKutaResult } from './types';
import { KUTA_CITATIONS } from './citations';

// ----------------------------------------------------------------------
// 1. MAHENDRA PORUTHAM (माहेन्द्र पोरुथम्)
// ----------------------------------------------------------------------
// Count from Bride nakṣatra to Groom nakṣatra.
// Auspicious counts: 4, 7, 10, 13, 16, 19, 22, 25.
export function calculateMahendraPorutham(groom: PersonLunarData, bride: PersonLunarData): SingleKutaResult {
  let count = (groom.nakshatraNumber - bride.nakshatraNumber + 1);
  if (count <= 0) count += 27;

  const MAHENDRA_COUNTS = [4, 7, 10, 13, 16, 19, 22, 25];
  const isPass = MAHENDRA_COUNTS.includes(count);

  return {
    id: 'mahendra',
    name: 'Mahendra Porutham (माहेन्द्र पोरुथम्)',
    sanskritName: 'माहेन्द्र पोरुथम्',
    devanagari: 'माहेन्द्र पोरुथम्',
    maxScore: 1,
    obtainedScore: isPass ? 1 : 0,
    rawScore: isPass ? 1 : 0,
    isDoshaPresent: !isPass,
    isCancelledByException: false,
    groomValue: `Nakṣatra #${groom.nakshatraNumber}`,
    brideValue: `Nakṣatra #${bride.nakshatraNumber}`,
    matchingCondition: `Count Bride→Groom: ${count} (${isPass ? 'Auspicious Mahendra Position' : 'Non-Mahendra'})`,
    classicalVerdict: isPass ? 'Śubha (Auspicious)' : 'Aśubha (Inauspicious / Defective)',
    explanation: isPass
      ? `Distance is ${count} nakṣatras, which belongs to the classical Mahendra octet (4, 7, 10, 13, 16, 19, 22, 25). Bestows prosperity, family longevity, and noble lineage.`
      : `Distance is ${count} nakṣatras, which does not fall in the classical Mahendra sequence. Neutral/ineffective for Mahendra blessings.`,
    citation: KUTA_CITATIONS.mahendra,
  };
}

// ----------------------------------------------------------------------
// 2. STRĪ DĪRGHA PORUTHAM (स्त्रीदीर्घ पोरुथम्)
// ----------------------------------------------------------------------
// Count from Bride nakṣatra to Groom nakṣatra.
// > 13: Full / Auspicious (Uttama)
// 7 to 13: Moderate (Madhyama)
// < 7: Weak (Kaniṣṭha)
export function calculateStreeDeerghaPorutham(groom: PersonLunarData, bride: PersonLunarData): SingleKutaResult {
  let count = (groom.nakshatraNumber - bride.nakshatraNumber + 1);
  if (count <= 0) count += 27;

  let score = 0;
  let verdict: 'Śubha (Auspicious)' | 'Madhyama (Moderate)' | 'Aśubha (Inauspicious / Defective)';
  let explanation = '';

  if (count > 13) {
    score = 1;
    verdict = 'Śubha (Auspicious)';
    explanation = `Distance is ${count} nakṣatras (>13). Classical Mādhavīya accords full Uttama Strī Dīrgha, ensuring health, auspicious fortune, and long life for the wife.`;
  } else if (count >= 7) {
    score = 0.5;
    verdict = 'Madhyama (Moderate)';
    explanation = `Distance is ${count} nakṣatras (between 7 and 13). Moderate (Madhyama) Strī Dīrgha. Acceptable when other major poruthams agree.`;
  } else {
    score = 0;
    verdict = 'Aśubha (Inauspicious / Defective)';
    explanation = `Distance is ${count} nakṣatras (<7). Inauspicious proximity in traditional South Indian matching canons.`;
  }

  return {
    id: 'stree_deergha',
    name: 'Strī Dīrgha Porutham (स्त्रीदीर्घ पोरुथम्)',
    sanskritName: 'स्त्रीदीर्घ पोरुथम्',
    devanagari: 'स्त्रीदीर्घ पोरुथम्',
    maxScore: 1,
    obtainedScore: score,
    rawScore: score,
    isDoshaPresent: score === 0,
    isCancelledByException: false,
    groomValue: `Distance: ${count}`,
    brideValue: `Reference Origin`,
    matchingCondition: `Count Bride→Groom: ${count}`,
    classicalVerdict: verdict,
    explanation,
    citation: KUTA_CITATIONS.stree_deergha,
  };
}

// ----------------------------------------------------------------------
// 3. RAJJU PORUTHAM (रज्जु पोरुथम्)
// ----------------------------------------------------------------------
// 5 Rajjus (Ropes):
// 1. Śiro (Head): Mṛgaśīrṣā, Citrā, Dhaniṣṭhā
// 2. Kaṇṭha (Neck): Rohiṇī, Ārdrā, Hasta, Svātī, Śravaṇa, Śatabhiṣā
// 3. Nābhi (Navel): Kṛttikā, Punarvasu, U. Phālgunī, Viśākhā, U. Aṣāḍhā, P. Bhādrapadā
// 4. Kaṭi (Waist): Bharaṇī, Puṣya, P. Phālgunī, Anurādhā, P. Aṣāḍhā, U. Bhādrapadā
// 5. Pāda (Foot): Aśvinī, Āśleṣā, Maghā, Jyeṣṭhā, Mūla, Revatī
type RajjuLimb = 'Śiro (Head)' | 'Kaṇṭha (Neck)' | 'Nābhi (Navel)' | 'Kaṭi (Waist)' | 'Pāda (Foot)';

const NAKSHATRA_RAJJU_MAP: Record<number, RajjuLimb> = {
  1: 'Pāda (Foot)',
  2: 'Kaṭi (Waist)',
  3: 'Nābhi (Navel)',
  4: 'Kaṇṭha (Neck)',
  5: 'Śiro (Head)',
  6: 'Kaṇṭha (Neck)',
  7: 'Nābhi (Navel)',
  8: 'Kaṭi (Waist)',
  9: 'Pāda (Foot)',
  10: 'Pāda (Foot)',
  11: 'Kaṭi (Waist)',
  12: 'Nābhi (Navel)',
  13: 'Kaṇṭha (Neck)',
  14: 'Śiro (Head)',
  15: 'Kaṇṭha (Neck)',
  16: 'Nābhi (Navel)',
  17: 'Kaṭi (Waist)',
  18: 'Pāda (Foot)',
  19: 'Pāda (Foot)',
  20: 'Kaṭi (Waist)',
  21: 'Nābhi (Navel)',
  22: 'Kaṇṭha (Neck)',
  23: 'Śiro (Head)',
  24: 'Kaṇṭha (Neck)',
  25: 'Nābhi (Navel)',
  26: 'Kaṭi (Waist)',
  27: 'Pāda (Foot)',
};

export function calculateRajjuPorutham(groom: PersonLunarData, bride: PersonLunarData): SingleKutaResult {
  const gRajju = NAKSHATRA_RAJJU_MAP[groom.nakshatraNumber];
  const bRajju = NAKSHATRA_RAJJU_MAP[bride.nakshatraNumber];

  const isSameRajju = gRajju === bRajju;
  const isPass = !isSameRajju;

  let explanation = '';
  if (isPass) {
    explanation = `Groom is in ${gRajju} and Bride is in ${bRajju}. Different Rajjus ensure longevity, sound marital constitution, and mutual protection.`;
  } else {
    explanation = `Both bride and groom share identical Rajju (${gRajju}). In South Indian tradition, Same Rajju is considered a major dosha: ${
      gRajju.startsWith('Śiro')
        ? 'Śiro Rajju indicates severe threat to husband’s longevity.'
        : gRajju.startsWith('Kaṇṭha')
        ? 'Kaṇṭha Rajju indicates risk of early demise or severe grief to wife.'
        : gRajju.startsWith('Nābhi')
        ? 'Nābhi Rajju indicates threat to offspring and progeny.'
        : gRajju.startsWith('Kaṭi')
        ? 'Kaṭi Rajju indicates chronic financial hardship.'
        : 'Pāda Rajju indicates aimless wandering and instability.'
    }`;
  }

  return {
    id: 'rajju',
    name: 'Rajju Porutham (रज्जु पोरुथम्)',
    sanskritName: 'रज्जु पोरुथम्',
    devanagari: 'रज्जु पोरुथम्',
    maxScore: 1,
    obtainedScore: isPass ? 1 : 0,
    rawScore: isPass ? 1 : 0,
    isDoshaPresent: !isPass,
    isCancelledByException: false,
    groomValue: gRajju,
    brideValue: bRajju,
    matchingCondition: isPass ? 'Different Rajju (Favorable)' : `Identical Rajju (${gRajju})`,
    classicalVerdict: isPass ? 'Śubha (Auspicious)' : 'Aśubha (Inauspicious / Defective)',
    explanation,
    citation: KUTA_CITATIONS.rajju,
  };
}

// ----------------------------------------------------------------------
// 4. VEDHA PORUTHAM (वेध पोरुथम्)
// ----------------------------------------------------------------------
// Mutually afflicting (piercing) Nakṣatra pairs per Mādhavīya:
// 1. Aśvinī - Jyeṣṭhā
// 2. Bharaṇī - Anurādhā
// 3. Kṛttikā - Viśākhā
// 4. Rohiṇī - Svātī
// 5. Ārdrā - Śravaṇa
// 6. Punarvasu - Uttarāṣāḍhā
// 7. Puṣya - Pūrvāṣāḍhā
// 8. Āśleṣā - Mūla
// 9. Maghā - Revatī
// 10. P. Phālgunī - U. Bhādrapadā
// 11. U. Phālgunī - P. Bhādrapadā
// 12. Hasta - Śatabhiṣā
// 13. Mṛgaśīrṣā - Dhaniṣṭhā & Citrā (Triple axis)
const VEDHA_PAIRS: [number, number][] = [
  [1, 18], // Aśvinī - Jyeṣṭhā
  [2, 17], // Bharaṇī - Anurādhā
  [3, 16], // Kṛttikā - Viśākhā
  [4, 15], // Rohiṇī - Svātī
  [6, 22], // Ārdrā - Śravaṇa
  [7, 21], // Punarvasu - Uttarāṣāḍhā
  [8, 20], // Puṣya - Pūrvāṣāḍhā
  [9, 19], // Āśleṣā - Mūla
  [10, 27], // Maghā - Revatī
  [11, 26], // P. Phālgunī - U. Bhādrapadā
  [12, 25], // U. Phālgunī - P. Bhādrapadā
  [13, 24], // Hasta - Śatabhiṣā
  [5, 23],  // Mṛgaśīrṣā - Dhaniṣṭhā
  [5, 14],  // Mṛgaśīrṣā - Citrā
  [14, 23], // Citrā - Dhaniṣṭhā
];

export function calculateVedhaPorutham(groom: PersonLunarData, bride: PersonLunarData): SingleKutaResult {
  const gN = groom.nakshatraNumber;
  const bN = bride.nakshatraNumber;

  const hasVedha = VEDHA_PAIRS.some(
    ([a, b]) => (gN === a && bN === b) || (gN === b && bN === a)
  );

  const isPass = !hasVedha;

  return {
    id: 'vedha',
    name: 'Vedha Porutham (वेध पोरुथम्)',
    sanskritName: 'वेध पोरुथम्',
    devanagari: 'वेध पोरुथम्',
    maxScore: 1,
    obtainedScore: isPass ? 1 : 0,
    rawScore: isPass ? 1 : 0,
    isDoshaPresent: !isPass,
    isCancelledByException: false,
    groomValue: groom.nakshatraName,
    brideValue: bride.nakshatraName,
    matchingCondition: isPass ? 'Free of Vedha affliction' : 'Vedha (Piercing / Mutually Obstructive) Nakṣatra Pair',
    classicalVerdict: isPass ? 'Śubha (Auspicious)' : 'Aśubha (Inauspicious / Defective)',
    explanation: isPass
      ? `No Vedha discord between ${groom.nakshatraName} and ${bride.nakshatraName}. Free of mutually piercing cosmic rays.`
      : `Vedha detected between ${groom.nakshatraName} and ${bride.nakshatraName}. Classical Mādhavīya states that Vedha causes chronic antagonism and unprovoked friction.`,
    citation: KUTA_CITATIONS.vedha,
  };
}

export function calculateAllDashakutas(groom: PersonLunarData, bride: PersonLunarData): SingleKutaResult[] {
  return [
    calculateMahendraPorutham(groom, bride),
    calculateStreeDeerghaPorutham(groom, bride),
    calculateRajjuPorutham(groom, bride),
    calculateVedhaPorutham(groom, bride),
  ];
}

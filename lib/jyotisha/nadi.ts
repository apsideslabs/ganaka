/**
 * Nakṣatra Nāḍī — the three channels.
 *
 * The 27 nakṣatras cycle through three nāḍīs: Ādi (vāta), Madhya (pitta) and
 * Antya (kapha), starting with Aśvinī at Ādi. The cycle is the basis of
 * nāḍī-kūṭa in marriage matching, where two charts sharing a nāḍī are held to be
 * a poor match on constitution — though the classical texts weigh it as one of
 * eight kūṭas, not as a veto.
 *
 * The classification is a fixed cycle, so it is stated once and verified against
 * the list rather than derived from a formula that could silently drift.
 */

import type { JyotishaChart, RashiNumber } from './types';

export type Nadi = 'adi' | 'madhya' | 'antya';

export interface NadiInfo {
  sanskrit: string;
  english: string;
  dosha: string;
  nature: string;
}

export const NADI_INFO: Record<Nadi, NadiInfo> = {
  adi: { sanskrit: 'आदि', english: 'Ādi', dosha: 'Vāta', nature: 'Air — restless, quick, changeable' },
  madhya: { sanskrit: 'मध्य', english: 'Madhya', dosha: 'Pitta', nature: 'Fire — intense, driven, sharp' },
  antya: { sanskrit: 'अन्त्य', english: 'Antya', dosha: 'Kapha', nature: 'Water — steady, phlegmatic, enduring' },
};

/**
 * The 27 nakṣatras in order, with the nāḍī the cycle assigns each.
 * Written out rather than computed so a transcription error is visible.
 */
export const NAKSHATRA_NADI: Array<{ number: number; name: string; nadi: Nadi }> = [
  { number: 1, name: 'Aśvinī', nadi: 'adi' },
  { number: 2, name: 'Bharaṇī', nadi: 'madhya' },
  { number: 3, name: 'Kṛttikā', nadi: 'antya' },
  { number: 4, name: 'Rohiṇī', nadi: 'adi' },
  { number: 5, name: 'Mṛgaśirā', nadi: 'madhya' },
  { number: 6, name: 'Ārdrā', nadi: 'antya' },
  { number: 7, name: 'Punarvasu', nadi: 'adi' },
  { number: 8, name: 'Puṣya', nadi: 'madhya' },
  { number: 9, name: 'Āśleṣā', nadi: 'antya' },
  { number: 10, name: 'Maghā', nadi: 'adi' },
  { number: 11, name: 'Pūrva Phālgunī', nadi: 'madhya' },
  { number: 12, name: 'Uttara Phālgunī', nadi: 'antya' },
  { number: 13, name: 'Hasta', nadi: 'adi' },
  { number: 14, name: 'Citrā', nadi: 'madhya' },
  { number: 15, name: 'Svātī', nadi: 'antya' },
  { number: 16, name: 'Viśākhā', nadi: 'adi' },
  { number: 17, name: 'Anurādhā', nadi: 'madhya' },
  { number: 18, name: 'Jyeṣṭhā', nadi: 'antya' },
  { number: 19, name: 'Mūla', nadi: 'adi' },
  { number: 20, name: 'Pūrva Āṣāḍhā', nadi: 'madhya' },
  { number: 21, name: 'Uttara Āṣāḍhā', nadi: 'antya' },
  { number: 22, name: 'Śravaṇa', nadi: 'adi' },
  { number: 23, name: 'Dhaniṣṭhā', nadi: 'madhya' },
  { number: 24, name: 'Śatabhiṣā', nadi: 'antya' },
  { number: 25, name: 'Pūrva Bhādrapadā', nadi: 'adi' },
  { number: 26, name: 'Uttara Bhādrapadā', nadi: 'madhya' },
  { number: 27, name: 'Revatī', nadi: 'antya' },
];

/** Nāḍī of a nakṣatra by its 1-based number. */
export function nadiOf(nakshatraNumber: number): Nadi {
  const entry = NAKSHATRA_NADI[(nakshatraNumber - 1) % 27];
  return entry?.nadi ?? 'adi';
}

export interface ChartNadi {
  moonNakshatra: string;
  moonNumber: number;
  moonNadi: Nadi;
  moonNadiInfo: NadiInfo;
  lagnaNakshatra: string;
  lagnaNumber: number;
  lagnaNadi: Nadi;
  lagnaNadiInfo: NadiInfo;
  /** How many of the 27 fall in each nāḍī — 9 each by construction. */
  distribution: Record<Nadi, number>;
  /** Nāḍī of every nakṣatra, for the table. */
  table: Array<{ number: number; name: string; nadi: Nadi; nadiName: string }>;
  note: string;
}

/** Nāḍī for the chart's Moon and Lagna. */
export function calculateNadi(chart: JyotishaChart): ChartNadi {
  const moon: any = (chart.planets as any)?.moon;
  // Field-name trap: a graha carries nakshatraIndex (0-based), the lagna carries
  // nakshatraNumber (1-based). Reading the wrong one silently gave nakṣatra 1.
  const moonNum = Number(moon?.nakshatraIndex ?? 0) + 1;
  const lagnaNum = Number(
    (chart.lagna as any)?.nakshatraNumber ?? ((chart.lagna as any)?.nakshatraIndex ?? 0) + 1
  );

  const moonNadi = nadiOf(moonNum || 1);
  const lagnaNadi = nadiOf(lagnaNum || 1);

  const distribution: Record<Nadi, number> = { adi: 0, madhya: 0, antya: 0 };
  for (const n of NAKSHATRA_NADI) distribution[n.nadi]++;

  return {
    moonNakshatra: moon?.nakshatraName ?? '',
    moonNumber: moonNum,
    moonNadi,
    moonNadiInfo: NADI_INFO[moonNadi],
    lagnaNakshatra: (chart.lagna as any)?.nakshatraName ?? '',
    lagnaNumber: lagnaNum,
    lagnaNadi,
    lagnaNadiInfo: NADI_INFO[lagnaNadi],
    distribution,
    table: NAKSHATRA_NADI.map((n) => ({
      ...n,
      nadiName: NADI_INFO[n.nadi].english,
    })),
    note:
      'The 27 nakṣatras cycle Ādi, Madhya, Antya from Aśvinī, giving nine of each. ' +
      'Nāḍī-kūṭa in marriage matching treats a shared nāḍī as one weak factor among eight — ' +
      'not a veto, and several practising traditions disregard it entirely.',
  };
}

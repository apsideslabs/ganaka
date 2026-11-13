/**
 * Gaṇaka — Sarvatobhadra Cakra (सर्वतोभद्र चक्र).
 *
 * A 9×9 grid of 81 cells. The outer ring of 28 carries the nakṣatras including
 * Abhijit, seven to a side, counted clockwise from the north-east corner. Inside
 * it sit the twelve rāśis, the seven vāras, and the akṣaras of the Sanskrit
 * alphabet, so that a name, a tithi, a sign and a star can all be located in the
 * same figure.
 *
 * The ring order below is the one the classical table gives, beginning at the
 * top row and running clockwise:
 *
 *   Dhanishta · Śatabhiṣā · Pūrvabhādrapadā · Uttarabhādrapadā · Revatī ·
 *   Aśvinī · Bharaṇī | Kṛttikā · Rohiṇī · Mṛgaśīrṣā · Ārdrā · Punarvasu ·
 *   Puṣya · Āśleṣā | Maghā · Pūrvaphālgunī · Uttraphālgunī · Hasta · Citrā ·
 *   Svātī · Viśākhā | Anurādhā · Jyeṣṭhā · Mūla · Pūrvāṣāḍhā · Uttarāṣāḍhā ·
 *   Abhijit · Śravaṇa
 *
 * Vedha is obstruction: a graha standing in a nakṣatra casts on the one
 * directly opposite it and on the two beside it. Benefics there help, malefics
 * obstruct, and a favourable vedha can cancel an adverse one.
 *
 * What is implemented is the nakṣatra ring and the vedha positions on it. The
 * full vedha set also crosses the rāśi, tithi, vāra and akṣara layers — the
 * text's own example has Kṛttikā obstructing Bharaṇī, a vowel, Vṛṣabha, Tulā,
 * a consonant and a tithi at once — and that cross-layer mapping is not built
 * here.
 */
import type { RashiNumber } from '../jyotisha/types';

/** The 28 nakṣatras in ring order, clockwise from the top row. */
export const SBC_RING: string[] = [
  'Dhanishta', 'Śatabhiṣā', 'Pūrvabhādrapadā', 'Uttarabhādrapadā', 'Revatī', 'Aśvinī', 'Bharaṇī',
  'Kṛttikā', 'Rohiṇī', 'Mṛgaśīrṣā', 'Ārdrā', 'Punarvasu', 'Puṣya', 'Āśleṣā',
  'Maghā', 'Pūrvaphālgunī', 'Uttaraphālgunī', 'Hasta', 'Citrā', 'Svātī', 'Viśākhā',
  'Anurādhā', 'Jyeṣṭhā', 'Mūla', 'Pūrvāṣāḍhā', 'Uttarāṣāḍhā', 'Abhijit', 'Śravaṇa',
];

/** Ring cell coordinates (row, col), 0-based, for each of the 28 stars. */
const RING_CELLS: Array<[number, number]> = [
  // top row, left to right: cols 1..7
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7],
  // right column, top to bottom: rows 1..7
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8],
  // bottom row, right to left: cols 7..1
  [8, 7], [8, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1],
  // left column, bottom to top: rows 7..1
  [7, 0], [6, 0], [5, 0], [4, 0], [3, 0], [2, 0], [1, 0],
];

/** The twelve rāśis in the inner ring, clockwise from the east. */
const RASHI_RING: RashiNumber[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1];

export interface SarvatobhadraCell {
  row: number;
  col: number;
  layer: 'corner' | 'nakshatra' | 'akshara' | 'rashi' | 'vara' | 'empty';
  value: string;
}

export interface SarvatobhadraVedha {
  /** The nakṣatra the graha occupies. */
  from: string;
  /** Ring index, 0-27. */
  index: number;
  /** Directly opposite — 14 places round the ring. */
  front: string;
  /** The two adjacent stars. */
  left: string;
  right: string;
}

/**
 * The nakṣatra at a ring index.
 */
export function nakshatraAt(index: number): string {
  return SBC_RING[((index % 28) + 28) % 28];
}

/**
 * The ring-level positions around a graha's nakṣatra: the star diametrically
 * opposite on the 28-ring and its two neighbours.
 *
 * This is NOT the full classical vedha set. The text's own example has a graha
 * in Kṛttikā obstructing Bharaṇī and Viśākhā together with a vowel, two rāśis, a
 * consonant and a tithi — a cross-layer figure that the ring geometry alone does
 * not reproduce. What is returned here is the ring skeleton, and it is labelled
 * as such rather than presented as the complete rule.
 */
export function vedhaFor(nakshatraIndex: number): SarvatobhadraVedha {
  const i = ((nakshatraIndex % 28) + 28) % 28;
  return {
    from: SBC_RING[i],
    index: i,
    front: SBC_RING[(i + 14) % 28],
    left: SBC_RING[(i + 27) % 28],
    right: SBC_RING[(i + 1) % 28],
  };
}

/**
 * Build the 9×9 grid. Only the layers that can be placed deterministically are
 * filled; the akṣara and vāra layers are left as their classical positions
 * without inventing a mapping the sources disagree on.
 */
export function buildSarvatobhadraGrid(): SarvatobhadraCell[] {
  const cells: SarvatobhadraCell[] = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      cells.push({ row, col, layer: 'empty', value: '' });
    }
  }
  const at = (r: number, c: number) => cells[r * 9 + c];

  // Nakṣatras on the outer ring.
  RING_CELLS.forEach(([r, c], i) => {
    at(r, c).layer = 'nakshatra';
    at(r, c).value = SBC_RING[i];
  });

  // The four corners hold vowels.
  const corners: Array<[number, number, string]> = [
    [0, 0, 'ई'], [0, 8, 'अ'], [8, 8, 'आ'], [8, 0, 'इ'],
  ];
  for (const [r, c, v] of corners) {
    at(r, c).layer = 'corner';
    at(r, c).value = v;
  }

  // Rāśis on the ring inside the nakṣatras — the four cells at 2,2 / 2,6 / 6,6 / 6,2
  // plus the four at 2,4 / 4,6 / 6,4 / 4,2, twelve in all.
  const rashiCells: Array<[number, number]> = [
    [2, 3], [2, 4], [2, 5],
    [3, 6], [4, 6], [5, 6],
    [6, 5], [6, 4], [6, 3],
    [5, 2], [4, 2], [3, 2],
  ];
  rashiCells.forEach(([r, c], i) => {
    at(r, c).layer = 'rashi';
    at(r, c).value = `R${RASHI_RING[i]}`;
  });

  return cells;
}

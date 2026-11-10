/**
 * Gaṇaka — report typefaces.
 *
 * Three families, each doing a job the others cannot:
 *
 *   Noto Serif            body and headings; carries the full Latin Extended
 *                         block, so IAST diacritics (ṛ ṣ ṭ ḍ ṇ ṃ ḥ ā ī ū ś ñ)
 *                         render as themselves instead of being folded to ASCII.
 *   Noto Serif Devanagari Devanagari runs, where they appear.
 *   Noto Sans Symbols     the zodiac and planetary glyphs (♈ ♉ … ☉ ☽ ♂ ☿ ♃ ♀ ♄ ☊ ☋).
 *   Noto Sans Symbols 2   the Sun (☉ U+2609), the one glyph Symbols 1 lacks.
 *
 * The files are served from public/fonts and fetched at generation time, so the
 * type is only ever downloaded by someone who actually asks for a PDF.
 */
import { Font } from '@react-pdf/renderer';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const SERIF = 'NotoSerif';
export const DEVA = 'NotoSerifDevanagari';
export const SYMBOLS = 'NotoSansSymbols';
export const SYMBOLS2 = 'NotoSansSymbols2';

let registered = false;

/** Idempotent: registering the same family twice throws inside react-pdf. */
export function registerReportFonts() {
  if (registered) return;
  registered = true;

  Font.register({
    family: SERIF,
    fonts: [
      { src: `${BASE}/fonts/NotoSerif-Regular.ttf` },
      { src: `${BASE}/fonts/NotoSerif-Bold.ttf`, fontWeight: 'bold' },
      { src: `${BASE}/fonts/NotoSerif-Italic.ttf`, fontStyle: 'italic' },
    ],
  });

  Font.register({
    family: DEVA,
    fonts: [
      { src: `${BASE}/fonts/NotoSerifDevanagari-Regular.ttf` },
      { src: `${BASE}/fonts/NotoSerifDevanagari-Bold.ttf`, fontWeight: 'bold' },
    ],
  });

  Font.register({
    family: SYMBOLS,
    fonts: [
      { src: `${BASE}/fonts/NotoSansSymbols-Regular.ttf` },
      { src: `${BASE}/fonts/NotoSansSymbols-Bold.ttf`, fontWeight: 'bold' },
    ],
  });

  Font.register({
    family: SYMBOLS2,
    fonts: [{ src: `${BASE}/fonts/NotoSansSymbols2-Regular.ttf` }],
  });

  // Long compound words should break rather than overflow a cell.
  Font.registerHyphenationCallback((word) => [word]);
}

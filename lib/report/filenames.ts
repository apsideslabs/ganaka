/**
 * Export filenames.
 *
 * Kept apart from the generators so a caller — or a test — can name a file
 * without dragging in react-pdf or the whole export builder.
 */
import type { JyotishaChart } from '@/lib/jyotisha/types';

/** Lowercase ASCII slug: strip diacritics, collapse anything else to a dash. */
export function slugName(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

/** `Ganaka-Chart-Rahul.json`, or the date when no name was given. */
export function chartJsonFilename(
  chart: JyotishaChart,
  opts: { kind?: 'natal' | 'gochar' } = {}
): string {
  const d: any = chart.meta.birthDetails;
  if (opts.kind === 'gochar') return 'Ganaka-Gochar.json';

  const name = d?.personName ? slugName(String(d.personName)) : '';
  if (name) return `Ganaka-Chart-${name}.json`;

  return `Ganaka-Chart-${d.year}${String(d.month).padStart(2, '0')}${String(d.day).padStart(2, '0')}.json`;
}

/** `Ganaka-Jyotisha-Rahul.pdf`, or the date when no name was given. */
export function chartPdfFilename(chart: JyotishaChart): string {
  const d: any = chart.meta.birthDetails;
  const name = d?.personName ? slugName(String(d.personName)) : '';
  if (name) return `Ganaka-Jyotisha-${name}.pdf`;
  return `Ganaka-Jyotisa-Chart-${d.year}${String(d.month).padStart(2, '0')}${String(d.day).padStart(2, '0')}.pdf`;
}

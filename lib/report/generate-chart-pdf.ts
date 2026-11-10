'use client';

/**
 * Gaṇaka — report entry point.
 *
 * The document itself lives in ChartReport.tsx and is built with
 * @react-pdf/renderer, so it lays out with flexbox instead of millimetre
 * coordinates, draws its charts as real SVG and sets its type in Noto Serif.
 *
 * Everything is imported dynamically: the renderer and the ~2.4 MB of fonts are
 * only fetched when someone actually asks for a PDF, so the workspace keeps its
 * normal bundle weight.
 */
import type { JyotishaChart } from '@/lib/jyotisha/types';

/**
 * Suggested filename. Gaṇaka's report is identified by its engine and the
 * moment it describes, not by whoever happened to generate it.
 */
export function chartPdfFilename(chart: JyotishaChart): string {
  const d = chart.meta.birthDetails;
  return `Ganaka-Jyotisa-Chart-${d.year}${String(d.month).padStart(2, '0')}${String(d.day).padStart(2, '0')}.pdf`;
}

/**
 * Builds the report and returns it as a Blob. The caller decides what to do
 * with it — the workspace shows it in the preview modal first.
 */
export async function buildReportBlob(chart: JyotishaChart): Promise<Blob> {
  const [{ pdf }, React, { ChartReport }, { registerReportFonts }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('react'),
    import('./ChartReport'),
    import('./fonts'),
  ]);

  registerReportFonts();

  const element = React.createElement(ChartReport, { chart }) as any;
  return pdf(element).toBlob();
}

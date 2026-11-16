'use client';

/**
 * Gaṇaka — report entry point.
 *
 * The document itself lives in ChartReport.tsx and is built with
 * @react-pdf/renderer, so it lays out with flexbox instead of millimetre
 * coordinates, draws its charts as real SVG and sets its type in Noto Serif.
 *
 * Everything is imported dynamically: the renderer and the fonts are only
 * fetched when someone actually asks for a PDF, so the workspace keeps its
 * normal bundle weight.
 *
 * ⚠ THE WEB-WORKER PATH WAS REMOVED. It moved the render off the main thread,
 * which was the right idea, but the worker chunk does not resolve reliably
 * under a static export with a basePath — the worker fails to load, the code
 * falls back to the main thread, and the user sees a failure instead of a
 * slower success. A working slow export beats a fast one that does not run.
 */
import type { JyotishaChart } from '@/lib/jyotisha/types';

export { chartPdfFilename } from './filenames';

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

'use client';

/**
 * Gaṇaka — report entry point.
 *
 * The document itself lives in ChartReport.tsx and is built with
 * @react-pdf/renderer, so it lays out with flexbox instead of millimetre
 * coordinates, draws its charts as real SVG and sets its type in Noto Serif.
 *
 * The render runs in a Web Worker (pdf.worker.ts). It took the same two or
 * three seconds either way, but on the main thread those seconds were a frozen
 * tab — no paint, no scroll, no click — which is what "the page hangs" meant.
 * Off the main thread the interface keeps responding while the document builds.
 *
 * Everything is imported dynamically: the renderer and the ~2.4 MB of fonts are
 * only fetched when someone actually asks for a PDF, so the workspace keeps its
 * normal bundle weight.
 */
import type { JyotishaChart } from '@/lib/jyotisha/types';
import type { PdfWorkerRequest, PdfWorkerResponse } from './pdf.worker';

export { chartPdfFilename } from './filenames';

let pdfRequestCounter = 0;

/** Render on the main thread — the fallback when a worker cannot be created. */
async function renderOnMainThread(chart: JyotishaChart): Promise<Blob> {
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

/**
 * Builds the report and returns it as a Blob. The caller decides what to do
 * with it — the workspace shows it in the preview modal first.
 *
 * The chart is a plain data object, so it survives structured cloning intact;
 * that is why only it crosses the boundary.
 */
export async function buildReportBlob(chart: JyotishaChart): Promise<Blob> {
  if (typeof Worker === 'undefined') return renderOnMainThread(chart);

  let worker: Worker;
  try {
    worker = new Worker(new URL('./pdf.worker.ts', import.meta.url), { type: 'module' });
  } catch {
    return renderOnMainThread(chart);
  }

  // A monotonic counter, not Math.random: lib/ is required to stay
  // deterministic so a given chart always produces the same output.
  const requestId = `pdf-${++pdfRequestCounter}`;

  try {
    return await new Promise<Blob>((resolve, reject) => {
      const cleanup = () => {
        worker.onmessage = null;
        worker.onerror = null;
        worker.terminate();
      };

      worker.onmessage = (event: MessageEvent<PdfWorkerResponse>) => {
        const msg = event.data;
        if (!msg || msg.requestId !== requestId) return;
        cleanup();
        if (msg.ok) resolve(msg.blob);
        else reject(new Error(msg.error));
      };

      worker.onerror = (err) => {
        cleanup();
        reject(new Error(err?.message || 'PDF worker failed'));
      };

      worker.postMessage({ chart, requestId } as PdfWorkerRequest);
    });
  } catch {
    // A worker that cannot start must not cost the user their report.
    return renderOnMainThread(chart);
  }
}

/**
 * Gaṇaka — report worker.
 *
 * A PDF is not I/O that politely yields. It is a long synchronous stretch:
 * resolve styles, turn characters into glyphs, break every paragraph into
 * lines, decide where each page ends — and page breaking gets more expensive
 * the more there is to break. On the main thread that is a frozen tab: no
 * paint, no scroll, no click.
 *
 * Running it here costs exactly the same time and blocks nothing. The document
 * component has to live inside the worker, because postMessage clones data and
 * a React element does not survive cloning — so what crosses the boundary is
 * the chart, and what comes back is a Blob.
 */

import { pdf, Font } from '@react-pdf/renderer';
import React from 'react';
import { ChartReport } from './ChartReport';
import { registerReportFonts } from './fonts';

export type PdfWorkerRequest = { chart: unknown; requestId: string };
export type PdfWorkerResponse =
  | { requestId: string; ok: true; blob: Blob }
  | { requestId: string; ok: false; error: string };

/**
 * Fonts are registered per module scope, and the worker has its own. A
 * registration made on the main thread does nothing here, so it is done inside
 * this file before the first render.
 */
registerReportFonts();

self.onmessage = async (event: MessageEvent<PdfWorkerRequest>) => {
  const { chart, requestId } = event.data;
  try {
    const element = React.createElement(ChartReport, { chart: chart as any }) as any;
    const blob = await pdf(element).toBlob();
    (self as any).postMessage({ requestId, ok: true, blob } as PdfWorkerResponse);
  } catch (err: any) {
    (self as any).postMessage({
      requestId,
      ok: false,
      error: err?.message ? String(err.message) : 'PDF render failed',
    } as PdfWorkerResponse);
  }
};

// `Font` is imported so the module graph keeps the renderer's font store in
// scope alongside registerReportFonts.
void Font;

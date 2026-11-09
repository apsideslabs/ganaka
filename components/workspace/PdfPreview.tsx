'use client';

/**
 * In-app PDF preview.
 *
 * An <iframe src="blob:…pdf"> looks fine on a desktop browser and is completely
 * blank on Chrome for Android, which refuses to run its PDF viewer inside a
 * frame. So the document is rasterised with PDF.js and shown as images, which
 * works the same on every device and needs no plugin.
 */
import React, { useEffect, useState } from 'react';

interface PdfPreviewProps {
  url: string;
  onError?: (message: string) => void;
}

export function PdfPreview({ url, onError }: PdfPreviewProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const pdfjs: any = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `${
          process.env.NEXT_PUBLIC_BASE_PATH || ''
        }/pdf.worker.min.js`;

        const doc = await pdfjs.getDocument(url).promise;
        if (cancelled) return;
        setTotal(doc.numPages);

        const rendered: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          if (cancelled) return;
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 1.35 });
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('canvas 2d context unavailable');
          await page.render({ canvasContext: ctx, viewport }).promise;
          rendered.push(canvas.toDataURL('image/jpeg', 0.82));
          setPages([...rendered]);
        }
      } catch (err: any) {
        if (cancelled) return;
        const msg = err?.message ? String(err.message) : 'Could not render the PDF';
        setError(msg);
        onError?.(msg);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, onError]);

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm font-semibold text-stone-800">Preview unavailable</p>
        <p className="text-xs text-stone-500 max-w-sm">
          The document was built successfully but this browser could not render it here.
          Use Download PDF to open it in your PDF reader.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-stone-200/70 p-3 sm:p-5">
      {pages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-stone-500">
          <div className="w-6 h-6 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono">Rendering pages…</p>
        </div>
      )}
      <div className="mx-auto flex flex-col items-center gap-3 max-w-3xl">
        {pages.map((src, i) => (
          <figure key={i} className="w-full">
            <img
              src={src}
              alt={`Report page ${i + 1}`}
              className="w-full rounded shadow-md border border-stone-300 bg-white"
            />
            <figcaption className="mt-1 text-center text-[10px] font-mono text-stone-500">
              Page {i + 1}{total ? ` of ${total}` : ''}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

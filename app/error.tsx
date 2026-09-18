'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client error to console
    console.error('Gaṇaka Client Runtime Exception:', error);
  }, [error]);

  return (
    <div className="w-full flex-1 flex items-center justify-center p-6 bg-[#FAF9F6]">
      <div className="max-w-md w-full text-center space-y-5 bg-white border border-rose-200 p-8 rounded-2xl shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-700 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-mono uppercase tracking-widest text-rose-800 font-bold">
            Calculation Interrupted
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
            An Unexpected Error Occurred
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
            {error?.message ||
              'An unexpected computation issue occurred during rendering. You can re-initialize the workstation or return home.'}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-[#171614] text-[#FCFAF6] rounded-xl hover:bg-[#8C2D19] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry Calculation
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-[#ECE7DC] text-[#171614] border border-[#DCD5C6] rounded-xl hover:bg-[#E2DCCE] transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

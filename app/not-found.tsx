import React from 'react';
import Link from 'next/link';
import { Compass, ArrowRight, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="w-full flex-1 flex items-center justify-center p-6 bg-[#FAF9F6]">
      <div className="max-w-md w-full text-center space-y-5 bg-white border border-[#DCD5C6] p-8 rounded-2xl shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-[#8C2D19] mx-auto">
          <Compass className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-mono uppercase tracking-widest text-[#8C2D19] font-bold">
            404 • Not Found
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
            Coordinate Not Located
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
            The requested astronomical calculation, ephemeris page, or workstation view does not exist in Gaṇaka.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-[#171614] text-[#FCFAF6] rounded-xl hover:bg-[#8C2D19] transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
          <Link
            href="/workspace"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-[#ECE7DC] text-[#171614] border border-[#DCD5C6] rounded-xl hover:bg-[#E2DCCE] transition-all"
          >
            Workspace
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { MuhurtaObjectiveDefinition } from '@/lib/muhurta/types';
import { BookOpen, ShieldCheck, Check, Info } from 'lucide-react';

interface MuhurtaObjectiveInfoProps {
  objective: MuhurtaObjectiveDefinition;
}

export function MuhurtaObjectiveInfo({ objective }: MuhurtaObjectiveInfoProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-4 sm:p-5 shadow-xs space-y-3 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-[#1D4ED8] rounded border border-blue-100">
            {objective.category}
          </span>
          <h3 className="text-sm sm:text-base font-serif font-bold text-[#0F172A]">
            {objective.name} ({objective.sanskritName})
          </h3>
        </div>

        <div className="flex items-center gap-1 text-xs font-mono text-[#64748B]">
          <BookOpen className="w-3.5 h-3.5 text-[#1D4ED8]" />
          <span>Shāstric Basis: {objective.classicalSources.map((s) => s.text).join(', ')}</span>
        </div>
      </div>

      <p className="text-xs text-[#0F172A] font-serif leading-relaxed">
        {objective.briefDescription}
      </p>

      {/* Classical Citations Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
        {objective.classicalSources.slice(0, 2).map((cit, idx) => (
          <div key={idx} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-md p-2.5 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-[#0F172A]">{cit.text}</span>
              <span className="text-[10px] font-mono text-[#64748B]">{cit.chapter}</span>
            </div>
            {cit.sanskritQuote && (
              <p className="text-[11px] font-serif text-[#1D4ED8] italic">
                &ldquo;{cit.sanskritQuote}&rdquo;
              </p>
            )}
            <p className="text-[11px] font-serif text-[#64748B] leading-normal">
              {cit.englishTranslation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

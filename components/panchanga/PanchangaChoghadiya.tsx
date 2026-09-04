'use client';

/**
 * Gaṇaka — Pañcāṅga Choghadiyā Layer
 * 8 Daytime and 8 Nighttime Choghadiyā cycles derived from local Sunrise & Sunset.
 * Categories: Amṛta (Best), Śubha (Good), Lābha (Gain), Chara (Neutral),
 * Roga (Evil), Kāla (Loss), Udvega (Anxiety).
 */

import React, { useState } from 'react';
import { PanchangaResult } from '@/lib/jyotisha/types';
import { Sun, Moon, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface PanchangaChoghadiyaProps {
  panchanga: PanchangaResult;
}

export function PanchangaChoghadiya({ panchanga }: PanchangaChoghadiyaProps) {
  const [viewMode, setViewMode] = useState<'day' | 'night'>('day');
  const daySlots = panchanga.muhurtas.choghadiyaDay || [];
  const nightSlots = panchanga.muhurtas.choghadiyaNight || [];
  const currentSlots = viewMode === 'day' ? daySlots : nightSlots;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8C2D19]" />
            <h3 className="font-serif font-bold text-base text-slate-900">
              Choghadiyā Muhūrta Cycles (चौघड़िया मुहूर्त)
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-serif mt-0.5">
            8 daytime and 8 nighttime divisions (3.75 Ghaṭīs / ~90 mins each) for immediate travel &amp; work timing
          </p>
        </div>

        {/* Day / Night Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 border border-slate-200/80 rounded-xl text-xs font-mono">
          <button
            type="button"
            onClick={() => setViewMode('day')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'day'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sun size={13} className={viewMode === 'day' ? 'text-amber-500' : 'text-slate-400'} />
            <span>Day (दिन चौघड़िया)</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('night')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'night'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Moon size={13} className={viewMode === 'night' ? 'text-indigo-500' : 'text-slate-400'} />
            <span>Night (रात्रि चौघड़िया)</span>
          </button>
        </div>
      </div>

      {/* Choghadiyā Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {currentSlots.map((slot) => {
          let badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
          let StatusIcon = CheckCircle2;
          let favorableLabel = 'Highly Auspicious';

          if (slot.category === 'Shubh' || slot.category === 'Amrit' || slot.category === 'Labh' || slot.name.includes('Shubh') || slot.name.includes('Amrit') || slot.name.includes('Labh')) {
            badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            StatusIcon = CheckCircle2;
            favorableLabel = slot.name.includes('Amrit') ? 'Supreme (Nectar)' : slot.name.includes('Labh') ? 'Gainful (Prosperity)' : 'Auspicious (Sacred)';
          } else if (slot.category === 'Char' || slot.name.includes('Char')) {
            badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
            StatusIcon = AlertCircle;
            favorableLabel = 'Dynamic / Travel';
          } else {
            badgeBg = 'bg-rose-50 text-rose-800 border-rose-200';
            StatusIcon = XCircle;
            favorableLabel = slot.name.includes('Rog') ? 'Harmful (Disease)' : slot.name.includes('Kal') ? 'Inauspicious (Loss)' : 'Anxiety / Avoid';
          }

          return (
            <div
              key={`${viewMode}-${slot.number}`}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                slot.isCurrent
                  ? 'bg-white border-[#8C2D19] ring-2 ring-[#8C2D19]/20 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono pb-2.5 border-b border-slate-200/70">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    Slot #{slot.number}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-md flex items-center gap-1 ${badgeBg}`}>
                    <StatusIcon size={11} />
                    <span>{slot.nature}</span>
                  </span>
                </div>

                <div className="pt-2.5">
                  <div className="text-base font-serif font-bold text-slate-900">
                    {slot.name}
                  </div>
                  <div className="text-xs text-slate-500 font-serif mt-0.5">
                    {slot.sanskritName} • Lord: <strong className="capitalize text-slate-800">{slot.rulingPlanetName}</strong>
                  </div>
                  <div className="text-[11px] text-[#8C2D19] font-mono font-medium mt-1">
                    {favorableLabel}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Span:</span>
                <strong className="text-slate-900 font-bold">{slot.timeRange}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend & Classical Reference */}
      <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-600" /> Amṛta, Śubha, Lābha = Auspicious</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Chara = Travel / Dynamic</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-600" /> Roga, Kāla, Udvega = Inauspicious</span>
        </div>
        <span className="text-slate-400">Reference: Muhūrta Gaṇapati</span>
      </div>
    </div>
  );
}

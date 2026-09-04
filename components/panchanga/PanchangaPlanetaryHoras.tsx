'use client';

/**
 * Gaṇaka — Pañcāṅga 24 Planetary Horās Layer
 * Exact planetary hours calculated from local Sunrise.
 * Day Lord rules Horā 1, followed by classical Chaldean descending planetary distance order.
 */

import React from 'react';
import { HoraPeriod } from '@/lib/jyotisha/muhurta-advanced';
import { GRAHA_PROPERTIES } from '@/lib/jyotisha/constants';
import { Sun, Moon } from 'lucide-react';

interface PanchangaPlanetaryHorasProps {
  horas: HoraPeriod[];
}

export function PanchangaPlanetaryHoras({ horas }: PanchangaPlanetaryHorasProps) {
  const dayHoras = horas.slice(0, 12);
  const nightHoras = horas.slice(12, 24);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs">
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-600" />
          <h3 className="font-serif font-bold text-base text-slate-900">
            24 Planetary Horās (द्वादश दिन-रात्रि होरा चक्र)
          </h3>
        </div>
        <p className="text-xs text-slate-500 font-serif mt-0.5">
          Classical Chaldean sequence starting with the ruling weekday lord at true local Sunrise
        </p>
      </div>

      {/* Daytime Horās (1 to 12) */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-amber-700">
          <Sun size={14} />
          <span>Daytime Horās (दिवा होराः • Horā 1 to 12)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs font-mono">
          {dayHoras.map((h) => {
            const prop = GRAHA_PROPERTIES[h.ruler];
            return (
              <div
                key={h.hourIndex}
                className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between text-slate-500 border-b border-slate-200/70 pb-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#8C2D19]">
                    Horā #{h.hourIndex + 1}
                  </span>
                  <span className="text-[10px] text-slate-900 font-bold">{h.timeRange}</span>
                </div>
                <div className="text-sm font-serif font-bold text-slate-900 flex items-center justify-between">
                  <span>{h.rulerName}</span>
                  <span className="text-xs text-[#8C2D19] font-serif font-normal">
                    {prop?.devanagari || h.ruler}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 font-sans">
                  Favorable: <strong className="text-slate-900 font-serif">{h.isFavorableFor}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nighttime Horās (13 to 24) */}
      <div className="space-y-3.5 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-indigo-600">
          <Moon size={14} />
          <span>Nighttime Horās (रात्रि होराः • Horā 13 to 24)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs font-mono">
          {nightHoras.map((h) => {
            const prop = GRAHA_PROPERTIES[h.ruler];
            return (
              <div
                key={h.hourIndex}
                className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between text-slate-500 border-b border-slate-200/70 pb-1.5">
                  <span className="text-[10px] uppercase font-bold text-indigo-700">
                    Horā #{h.hourIndex + 1}
                  </span>
                  <span className="text-[10px] text-slate-900 font-bold">{h.timeRange}</span>
                </div>
                <div className="text-sm font-serif font-bold text-slate-900 flex items-center justify-between">
                  <span>{h.rulerName}</span>
                  <span className="text-xs text-[#8C2D19] font-serif font-normal">
                    {prop?.devanagari || h.ruler}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 font-sans">
                  Favorable: <strong className="text-slate-900 font-serif">{h.isFavorableFor}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

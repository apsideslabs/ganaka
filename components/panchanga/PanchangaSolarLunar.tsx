'use client';

/**
 * Gaṇaka — Pañcāṅga Solar & Lunar Ephemeris Layer
 * High-precision calculation of Sunrise (Sūryodaya), Sunset (Sūryāsta),
 * Moonrise (Candrodaya), Moonset (Candrāsta), Solar Noon (Madhyāhna),
 * Dina Māna & Rātri Māna in standard time and traditional Vedic Ghāṭīs.
 */

import React from 'react';
import { PanchangaResult } from '@/lib/jyotisha/types';
import { Sun } from 'lucide-react';

interface PanchangaSolarLunarProps {
  panchanga: PanchangaResult;
}

export function PanchangaSolarLunar({ panchanga }: PanchangaSolarLunarProps) {
  const { sunTimes } = panchanga;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-1">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-600" />
          <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900">
            Solar &amp; Lunar Chronometry (Sūrya-Candra Gati)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Refraction-corrected at Horizon (34&apos; + 16&apos; semi-diameter)
        </span>
      </div>

      {/* Grid of 6 Key Timings */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col justify-between hover:border-slate-300 transition-colors">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">
            Sunrise (सूर्योदय)
          </span>
          <strong className="text-base font-bold text-slate-900 mt-1 font-mono">
            {sunTimes.sunrise}
          </strong>
          <span className="text-[10px] text-slate-400 mt-0.5">Civil Horizon</span>
        </div>

        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col justify-between hover:border-slate-300 transition-colors">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">
            Sunset (सूर्यास्त)
          </span>
          <strong className="text-base font-bold text-slate-900 mt-1 font-mono">
            {sunTimes.sunset}
          </strong>
          <span className="text-[10px] text-slate-400 mt-0.5">Civil Horizon</span>
        </div>

        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col justify-between hover:border-slate-300 transition-colors">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">
            Solar Noon (मध्याह्न)
          </span>
          <strong className="text-base font-bold text-slate-900 mt-1 font-mono">
            {sunTimes.solarNoon}
          </strong>
          <span className="text-[10px] text-slate-400 mt-0.5">Meridian Transit</span>
        </div>

        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col justify-between hover:border-slate-300 transition-colors">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">
            Moonrise (चन्द्रोदय)
          </span>
          <strong className="text-base font-bold text-slate-900 mt-1 font-mono">
            {sunTimes.moonrise}
          </strong>
          <span className="text-[10px] text-slate-400 mt-0.5">Lunar Horizon</span>
        </div>

        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col justify-between hover:border-slate-300 transition-colors">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">
            Moonset (चन्द्रास्त)
          </span>
          <strong className="text-base font-bold text-slate-900 mt-1 font-mono">
            {sunTimes.moonset}
          </strong>
          <span className="text-[10px] text-slate-400 mt-0.5">Lunar Horizon</span>
        </div>

        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col justify-between hover:border-slate-300 transition-colors">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">
            Moon Phase &amp; Light
          </span>
          <strong className="text-base font-bold text-[#8C2D19] mt-1 font-mono">
            {sunTimes.moonIlluminationPct != null ? `${sunTimes.moonIlluminationPct.toFixed(1)}%` : '—'}
          </strong>
          <span className="text-[10px] text-slate-500 mt-0.5 truncate">
            {sunTimes.moonPhaseName || 'Candra Kalā'}
          </span>
        </div>
      </div>

      {/* Dina Māna & Rātri Māna in Traditional Units */}
      <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center justify-between">
          <span className="text-slate-600">Day Duration (दिनमान • Dina Māna):</span>
          <strong className="text-slate-900 font-bold">
            {sunTimes.dayDuration} ({sunTimes.dayDurationGhatis})
          </strong>
        </div>
        <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center justify-between">
          <span className="text-slate-600">Night Duration (रात्रिमान • Rātri Māna):</span>
          <strong className="text-slate-900 font-bold">
            {sunTimes.nightDuration} ({sunTimes.nightDurationGhatis})
          </strong>
        </div>
      </div>
    </div>
  );
}

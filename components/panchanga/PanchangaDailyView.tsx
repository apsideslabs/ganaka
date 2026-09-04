'use client';

/**
 * Gaṇaka — Daily Pañcāṅga Master View
 * Clean, structured, un-capped presentation of the complete Daily Pañcāṅga:
 * 1. Daily Executive Astronomical Banner & Sun/Moon Chronometry
 * 2. The Five Classical Limbs (Pañca-Aṅga: Tithi, Vāra, Nakṣatra, Yoga, Karaṇa)
 * 3. Daily Auspicious & Inauspicious Muhūrta Windows (Śubha & Varjya Kāla)
 * 4. Graha Sphuṭas at Sunrise (True Sidereal Planetary Longitudes)
 * 5. Solar & Lunar Chronometry (Dina-Māna & Rātri-Māna in Civil & Ghaṭī Units)
 * 6. Traditional Indian Eras & Saṁvat Systems (Vikrama, Śaka, Kaliyuga, Jovian Cycle)
 * 7. Connected Shāstric Instruments Hub
 */

import React from 'react';
import { PanchangaResult } from '@/lib/jyotisha/types';
import { AllPlanetsRecord } from './types';
import { PanchangaFiveLimbs } from './PanchangaFiveLimbs';
import { PanchangaMuhurtaMatrix } from './PanchangaMuhurtaMatrix';
import { PanchangaSolarLunar } from './PanchangaSolarLunar';
import { PanchangaCalendrics } from './PanchangaCalendrics';
import { PanchangaGrahaSpashta } from './PanchangaGrahaSpashta';
import { PanchangaMoonPhaseSvg } from './PanchangaMoonPhaseSvg';
import {
  Sun,
  Clock,
  Compass,
  Sparkles,
  Calendar as CalendarIcon,
  ArrowRight,
  FileSpreadsheet,
  Search,
  Award,
} from 'lucide-react';

interface PanchangaDailyViewProps {
  panchanga: PanchangaResult;
  planets: AllPlanetsRecord;
  date: Date;
  cityName: string;
  ayanamshaFormatted: string;
  jd: number;
  onNavigateToTab?: (tab: string) => void;
}

export function PanchangaDailyView({
  panchanga,
  planets,
  date,
  cityName,
  ayanamshaFormatted,
  jd,
  onNavigateToTab,
}: PanchangaDailyViewProps) {
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="w-full space-y-6">
      {/* 1. MASTER DAILY OVERVIEW BANNER CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900 text-white rounded-md">
                Drik Siddhānta Almanac
              </span>
              <span className="text-xs font-mono text-slate-600 font-medium bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                {cityName}
              </span>
              <span className="text-xs font-mono text-[#8C2D19] font-medium bg-[#8C2D19]/10 px-2.5 py-0.5 rounded-md border border-[#8C2D19]/20">
                {panchanga.calendar.lunarMonth.amantaName} Māsa ({panchanga.tithi.paksha} Pakṣa)
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              {formattedDate}
            </h2>

            <p className="text-xs sm:text-sm font-serif text-slate-600">
              {panchanga.calendar.eras.samvatsara60.sanskritName} Saṁvatsara • {panchanga.calendar.ayana.name} (उत्तरायण/दक्षिणायन) • {panchanga.calendar.rtu.name} Ṛtu
            </p>
          </div>

          {/* Quick Sun & Moon Astro Strip */}
          <div className="flex items-center gap-4 sm:gap-6 bg-slate-50/90 p-4 rounded-xl border border-slate-200/80 self-start lg:self-center">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200/60">
                <Sun className="w-5 h-5 text-[#8C2D19]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
                  Sunrise / Sunset
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 block">
                  {panchanga.sunTimes.sunrise} – {panchanga.sunTimes.sunset}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Dina: {panchanga.sunTimes.dayDurationGhatis}
                </span>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-slate-200" />

            <div className="flex items-center gap-3">
              <PanchangaMoonPhaseSvg
                tithiNumber={panchanga.tithi.number}
                illuminationFraction={
                  (panchanga.sunTimes.moonIlluminationPct ??
                    (panchanga.tithi.number <= 15
                      ? panchanga.tithi.number
                      : 30 - panchanga.tithi.number) /
                      15 *
                      100) / 100
                }
                phaseAngleDeg={panchanga.tithi.number * 12}
                size={32}
              />
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-semibold">
                  Candra (Moon)
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 block">
                  {panchanga.tithi.paksha} Pakṣa • {panchanga.sunTimes.moonPhaseName || (panchanga.tithi.number <= 15 ? 'Śukla' : 'Kṛṣṇa')}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Illum: {(panchanga.sunTimes.moonIlluminationPct || 50).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. THE FIVE CLASSICAL LIMBS (PAÑCA-AṄGA) */}
        <PanchangaFiveLimbs panchanga={panchanga} />
      </div>

      {/* 3. DAILY AUSPICIOUS & INAUSPICIOUS MUHŪRTA WINDOWS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
        <PanchangaMuhurtaMatrix panchanga={panchanga} />
      </div>

      {/* 4. GRAHA SPHUṬAS AT SUNRISE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
        <PanchangaGrahaSpashta
          planets={planets}
          ayanamshaFormatted={ayanamshaFormatted}
          jd={jd}
        />
      </div>

      {/* 5. TWO-COLUMN GRID: SOLAR/LUNAR CHRONOMETRY & TRADITIONAL ERAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solar & Lunar Chronometry */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
          <PanchangaSolarLunar panchanga={panchanga} />
        </div>

        {/* Traditional Indian Eras & Saṁvat Systems */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
          <PanchangaCalendrics panchanga={panchanga} />
        </div>
      </div>

      {/* 6. CONNECTED SHĀSTRIC INSTRUMENTS HUB */}
      {onNavigateToTab && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8C2D19]" />
                <span>Connected Shāstric Calculations for this Date &amp; Location</span>
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Direct one-click access to specialized horary, electional, and ephemeris instruments
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md self-start sm:self-auto">
              9 Instruments Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Rising Lagnas */}
            <button
              type="button"
              onClick={() => onNavigateToTab('lagna')}
              className="p-4 bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-left transition-all group cursor-pointer shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-white text-[#8C2D19] rounded-lg border border-slate-200/60 group-hover:bg-[#8C2D19] group-hover:text-white transition-colors">
                    <Clock size={16} />
                  </div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                    लग्न सारणी
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm text-slate-900 group-hover:text-[#8C2D19] transition-colors">
                  Rising Lagnas (Ascendants)
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  12 rising signs from local sunrise with exact horizon entry and exit times.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono text-[#8C2D19] font-bold">
                <span>View Table</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* 2. Planetary Horas */}
            <button
              type="button"
              onClick={() => onNavigateToTab('horas')}
              className="p-4 bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-left transition-all group cursor-pointer shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-white text-amber-700 rounded-lg border border-slate-200/60 group-hover:bg-amber-700 group-hover:text-white transition-colors">
                    <Sun size={16} />
                  </div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                    होरा चक्र
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm text-slate-900 group-hover:text-[#8C2D19] transition-colors">
                  24 Planetary Horās
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Day and night planetary hours ruled in classical Chaldean orbital sequence.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono text-[#8C2D19] font-bold">
                <span>View 24 Horās</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* 3. Choghadiya Cycles */}
            <button
              type="button"
              onClick={() => onNavigateToTab('choghadiya')}
              className="p-4 bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-left transition-all group cursor-pointer shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-white text-emerald-700 rounded-lg border border-slate-200/60 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                    <Award size={16} />
                  </div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold">
                    चौघड़िया
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm text-slate-900 group-hover:text-[#8C2D19] transition-colors">
                  Choghadiyā Cycles
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Day and night 8-fold periods (Amṛta, Śubha, Lābha, Chara, Roga, Kāla, Udvega).
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono text-[#8C2D19] font-bold">
                <span>View Cycles</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* 4. Muhūrta Finder */}
            <button
              type="button"
              onClick={() => onNavigateToTab('finder')}
              className="p-4 bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl text-left transition-all group cursor-pointer shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-white text-purple-700 rounded-lg border border-slate-200/60 group-hover:bg-[#8C2D19] group-hover:text-white transition-colors">
                    <Search size={16} />
                  </div>
                  <span className="text-[10px] font-mono uppercase text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                    SHASTRA
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm text-slate-900 group-hover:text-[#8C2D19] transition-colors">
                  Muhūrta Finder Engine
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Constraint-first classical selection engine for marriage, travel, business, and medical rituals.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono text-[#8C2D19] font-bold">
                <span>Open Finder</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

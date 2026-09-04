'use client';

/**
 * Gaṇaka — Pañcāṅga Calendrics & Eras Layer
 * Implements Sūrya Siddhānta & Classical Vedic Calendrical Systems:
 * 1. Vikrama Saṃvat & Śaka Saṃvat
 * 2. Kali Yuga (कलि संवत्सर)
 * 3. 60-Year Jovian Saṃvatsara (प्रभव to क्षय)
 * 4. Solar Month (सौर मास) & Day with exact degree in Rāśi
 * 5. Lunar Month (चान्द्र मास) — Amānta & Pūrṇimānta with Adhika/Kṣaya detection
 * 6. Vedic Ṛtu (६ ऋतवः) & Ayana (उत्तरायण / दक्षिणायन)
 * 7. Upcoming Saṅkrānti & Puṇya Kāla
 */

import React from 'react';
import { PanchangaResult } from '@/lib/jyotisha/types';
import { Calendar } from 'lucide-react';

interface PanchangaCalendricsProps {
  panchanga: PanchangaResult;
}

export function PanchangaCalendrics({ panchanga }: PanchangaCalendricsProps) {
  const { calendar } = panchanga;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-1">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-700" />
          <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900">
            Classical Eras &amp; Calendrical Framework (संवत्सर-मास-ऋतु)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Sūrya Siddhānta &amp; Brāhma Chronology
        </span>
      </div>

      {/* Grid of 6 Key Calendrical Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
        {/* Solar Month */}
        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col justify-between hover:border-slate-300 transition-colors">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">
            Solar Month (सौर मास)
          </span>
          <strong className="text-base font-serif font-bold text-slate-900 mt-1">
            {calendar.solarMonth.name}
          </strong>
          <span className="text-[10px] text-slate-500 mt-0.5">
            Day {calendar.solarMonth.solarDay} ({calendar.solarMonth.sunDegreeInRashi})
          </span>
        </div>

        {/* Amānta Lunar Month */}
        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col justify-between hover:border-slate-300 transition-colors">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">
            Amānta Lunar Month
          </span>
          <strong className="text-base font-serif font-bold text-slate-900 mt-1">
            {calendar.lunarMonth.amantaName}
          </strong>
          <span className="text-[10px] text-slate-500 mt-0.5">
            {calendar.lunarMonth.status} (South/West)
          </span>
        </div>

        {/* Pūrṇimānta Lunar Month */}
        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col justify-between hover:border-slate-300 transition-colors">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">
            Pūrṇimānta Month
          </span>
          <strong className="text-base font-serif font-bold text-slate-900 mt-1">
            {calendar.lunarMonth.purnimantaName}
          </strong>
          <span className="text-[10px] text-slate-500 mt-0.5">
            North Indian Almanac
          </span>
        </div>

        {/* Vedic Season (Ṛtu) */}
        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col justify-between hover:border-slate-300 transition-colors">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">
            Vedic Season (ऋतु)
          </span>
          <strong className="text-base font-serif font-bold text-slate-900 mt-1">
            {calendar.rtu.name}
          </strong>
          <span className="text-[10px] text-slate-500 mt-0.5">
            {calendar.rtu.sanskritName}
          </span>
        </div>

        {/* Solar Ayana */}
        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col justify-between hover:border-slate-300 transition-colors">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">
            Solar Ayana (अयन)
          </span>
          <strong className="text-base font-serif font-bold text-slate-900 mt-1">
            {calendar.ayana.name}
          </strong>
          <span className="text-[10px] text-slate-500 mt-0.5 truncate">
            {calendar.ayana.description}
          </span>
        </div>

        {/* 60-Year Saṃvatsara */}
        <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col justify-between hover:border-slate-300 transition-colors">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">
            60-Yr Saṃvatsara
          </span>
          <strong className="text-base font-serif font-bold text-slate-900 mt-1">
            {calendar.eras.samvatsara60.name}
          </strong>
          <span className="text-[10px] text-slate-500 mt-0.5">
            Cycle #{calendar.eras.samvatsara60.number} / 60
          </span>
        </div>
      </div>

      {/* Eras Strip & Saṅkrānti Moment */}
      <div className="pt-3 border-t border-slate-100 space-y-2 text-xs font-mono">
        <div className="flex flex-wrap items-center justify-between text-slate-600 gap-3">
          <div className="flex items-center gap-1.5">
            <span>Vikrama Saṃvat:</span>
            <strong className="text-slate-900 text-sm font-bold">{calendar.eras.vikramaSamvat}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Śaka Saṃvat (National):</span>
            <strong className="text-slate-900 text-sm font-bold">{calendar.eras.shakaSamvat}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Kali Yuga Elapsed:</span>
            <strong className="text-slate-900 text-sm font-bold">{calendar.eras.kaliYugaYear}</strong>
          </div>
        </div>

        {calendar.sankranti.nextSankrantiName && (
          <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
            <span className="text-slate-600">
              Upcoming Solar Ingress (संक्रान्ति):{' '}
              <strong className="text-slate-900 font-serif">{calendar.sankranti.nextSankrantiName}</strong>
            </span>
            <span className="font-bold text-[#8C2D19] font-mono">
              {calendar.sankranti.nextSankrantiDateTime}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

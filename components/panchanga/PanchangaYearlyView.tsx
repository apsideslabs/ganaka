'use client';

/**
 * Gaṇaka — Yearly Pañcāṅga & Saṁvatsara Almanac
 * Year-level calendrical overview, 12 Solar Saṅkrāntis, 6 Vedic Ritus,
 * and 12-month direct navigation into specific months/dates.
 */

import React, { useMemo } from 'react';
import { AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { CityLocation } from '@/lib/astronomy/coordinates';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sun,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface PanchangaYearlyViewProps {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  selectedCity: CityLocation;
  ayanamshaType: AyanamshaType;
  onNavigateToTab?: (tab: string) => void;
}

interface SankrantiInfo {
  rashiNumber: number;
  rashiName: string;
  sanskritName: string;
  ingressDateStr: string;
  approxDate: string;
  significance: string;
}

const SANKRANTIS: SankrantiInfo[] = [
  { rashiNumber: 1, rashiName: 'Mesha (Aries)', sanskritName: 'मेष संक्रान्ति', approxDate: 'April 14', ingressDateStr: 'Apr 14', significance: 'Vedic Solar New Year (Maha Vishuva)' },
  { rashiNumber: 2, rashiName: 'Vrishabha (Taurus)', sanskritName: 'वृषभ संक्रान्ति', approxDate: 'May 15', ingressDateStr: 'May 15', significance: 'Sun enters Fixed Earth' },
  { rashiNumber: 3, rashiName: 'Mithuna (Gemini)', sanskritName: 'मिथुन संक्रान्ति', approxDate: 'June 15', ingressDateStr: 'Jun 15', significance: 'Raja Sankranti' },
  { rashiNumber: 4, rashiName: 'Karka (Cancer)', sanskritName: 'कर्क संक्रान्ति', approxDate: 'July 16', ingressDateStr: 'Jul 16', significance: 'Dakshinayana Commencement (Summer Solstice)' },
  { rashiNumber: 5, rashiName: 'Simha (Leo)', sanskritName: 'सिंह संक्रान्ति', approxDate: 'August 16', ingressDateStr: 'Aug 16', significance: 'Sun enters Moolatrikona / Own Sign' },
  { rashiNumber: 6, rashiName: 'Kanya (Virgo)', sanskritName: 'कन्या संक्रान्ति', approxDate: 'September 16', ingressDateStr: 'Sep 16', significance: 'Pitr Paksha / Autumnal Vishuva' },
  { rashiNumber: 7, rashiName: 'Tula (Libra)', sanskritName: 'तुला संक्रान्ति', approxDate: 'October 17', ingressDateStr: 'Oct 17', significance: 'Jala Vishuva / Autumn Equinox' },
  { rashiNumber: 8, rashiName: 'Vrishchika (Scorpio)', sanskritName: 'वृश्चिक संक्रान्ति', approxDate: 'November 16', ingressDateStr: 'Nov 16', significance: 'Deepavali period ingress' },
  { rashiNumber: 9, rashiName: 'Dhanu (Sagittarius)', sanskritName: 'धनु संक्रान्ति', approxDate: 'December 16', ingressDateStr: 'Dec 16', significance: 'Makaravilakku prelude' },
  { rashiNumber: 10, rashiName: 'Makara (Capricorn)', sanskritName: 'मकर संक्रान्ति', approxDate: 'January 14', ingressDateStr: 'Jan 14', significance: 'Uttarayana Commencement (Great Harvest festival)' },
  { rashiNumber: 11, rashiName: 'Kumbha (Aquarius)', sanskritName: 'कुम्भ संक्रान्ति', approxDate: 'February 13', ingressDateStr: 'Feb 13', significance: 'Maha Kumbha Snana ingress' },
  { rashiNumber: 12, rashiName: 'Meena (Pisces)', sanskritName: 'मीन संक्रान्ति', approxDate: 'March 14', ingressDateStr: 'Mar 14', significance: 'Solar year finale ingress' },
];

const RITUS = [
  { name: 'Vasanta (Spring)', sanskrit: 'वसन्त ऋतु', span: 'Chaitra – Vaishakha (Mid Feb – Mid Apr)', rulingGraha: 'Venus (Śukra)' },
  { name: 'Grīṣma (Summer)', sanskrit: 'ग्रीष्म ऋतु', span: 'Jyeshtha – Ashadha (Mid Apr – Mid Jun)', rulingGraha: 'Sun & Mars (Sūrya & Maṅgala)' },
  { name: 'Varṣā (Monsoon)', sanskrit: 'वर्षा ऋतु', span: 'Shravana – Bhadrapada (Mid Jun – Mid Aug)', rulingGraha: 'Moon (Candra)' },
  { name: 'Śarad (Autumn)', sanskrit: 'शरद् ऋतु', span: 'Ashvina – Kartika (Mid Aug – Mid Oct)', rulingGraha: 'Mercury (Budha)' },
  { name: 'Hemanta (Pre-Winter)', sanskrit: 'हेमन्त ऋतु', span: 'Margashirsha – Pausha (Mid Oct – Mid Dec)', rulingGraha: 'Jupiter (Guru)' },
  { name: 'Śiśira (Winter)', sanskrit: 'शिशिर ऋतु', span: 'Magha – Phalguna (Mid Dec – Mid Feb)', rulingGraha: 'Saturn (Śani)' },
];

export function PanchangaYearlyView({
  selectedDate,
  onSelectDate,
  onNavigateToTab,
}: PanchangaYearlyViewProps) {
  const currentYear = selectedDate.getFullYear();

  const handlePrevYear = () => {
    onSelectDate(new Date(currentYear - 1, selectedDate.getMonth(), selectedDate.getDate()));
  };

  const handleNextYear = () => {
    onSelectDate(new Date(currentYear + 1, selectedDate.getMonth(), selectedDate.getDate()));
  };

  // 12 Months Navigation Grid
  const monthsList = useMemo(() => {
    return Array.from({ length: 12 }).map((_, mIdx) => {
      const d = new Date(currentYear, mIdx, 1);
      const name = d.toLocaleDateString('en-US', { month: 'long' });
      const short = d.toLocaleDateString('en-US', { month: 'short' });
      return {
        monthIndex: mIdx,
        name,
        short,
        isCurrentMonth: selectedDate.getMonth() === mIdx,
      };
    });
  }, [currentYear, selectedDate]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-7">
      {/* 1. Year Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon className="w-4 h-4 text-[#8C2D19]" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Yearly Calendrical System
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
            Yearly Pañcāṅga Almanac — {currentYear} CE
          </h2>
          <p className="text-xs font-serif text-slate-500 mt-0.5">
            Comprehensive solar ingress (Saṅkrāntis), 6 Vedic seasons (Ritus), and 12-month navigation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevYear}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
            title="Previous Year"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 py-1.5 bg-slate-100 border border-slate-200/80 rounded-lg text-xs font-mono font-bold text-slate-900">
            {currentYear}
          </span>
          <button
            type="button"
            onClick={handleNextYear}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors cursor-pointer"
            title="Next Year"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. 12 Month Direct Navigation Matrix */}
      <div className="space-y-3">
        <h3 className="text-sm font-serif font-bold text-slate-900 flex items-center gap-1.5">
          <CalendarIcon className="w-4 h-4 text-[#8C2D19]" />
          <span>12-Month Quick Navigation for {currentYear}</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {monthsList.map((m) => (
            <button
              key={m.monthIndex}
              type="button"
              onClick={() => {
                onSelectDate(new Date(currentYear, m.monthIndex, 1));
                if (onNavigateToTab) onNavigateToTab('calendar');
              }}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                m.isCurrentMonth
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                  : 'bg-slate-50/70 border-slate-200/80 text-slate-900 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-mono uppercase tracking-wider opacity-75">
                  {m.short}
                </span>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </div>
              <span className="text-sm font-serif font-bold mt-1.5 block">
                {m.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. 12 Solar Saṅkrāntis Table */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-serif font-bold text-slate-900 flex items-center gap-1.5">
          <Sun className="w-4 h-4 text-[#8C2D19]" />
          <span>12 Sūrya Saṅkrāntis (Solar Ingress Points for {currentYear})</span>
        </h3>
        <div className="overflow-x-auto border border-slate-200/90 rounded-xl bg-white">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px] font-serif">
                <th className="py-3 px-3.5">#</th>
                <th className="py-3 px-3.5">Saṅkrānti (Sanskrit)</th>
                <th className="py-3 px-3.5">Sidereal Sign</th>
                <th className="py-3 px-3.5">Calendar Date</th>
                <th className="py-3 px-3.5">Astronomical Significance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SANKRANTIS.map((s) => (
                <tr key={s.rashiNumber} className="hover:bg-slate-50/80 text-slate-800 transition-colors">
                  <td className="py-3 px-3.5 font-bold text-[#8C2D19]">{s.rashiNumber}</td>
                  <td className="py-3 px-3.5 font-serif font-bold text-slate-900">{s.sanskritName}</td>
                  <td className="py-3 px-3.5">{s.rashiName}</td>
                  <td className="py-3 px-3.5 font-semibold text-slate-900">{s.approxDate}, {currentYear}</td>
                  <td className="py-3 px-3.5 text-slate-500 font-sans">{s.significance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. 6 Vedic Ritus (Seasons) Overview */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-serif font-bold text-slate-900 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#8C2D19]" />
          <span>Six Classical Vedic Seasons (Ṣaḍ-Ṛtavaḥ)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {RITUS.map((r, i) => (
            <div key={i} className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Season #{i + 1}
              </span>
              <span className="text-sm font-serif font-bold text-slate-900 block">
                {r.name} • {r.sanskrit}
              </span>
              <p className="text-[11px] font-mono text-slate-600">
                Months: {r.span}
              </p>
              <p className="text-[11px] font-mono text-[#8C2D19] font-medium">
                Ruling Planet: {r.rulingGraha}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * Gaṇaka — Classical Rāśi → Navāṃśa Mapping & Planetary Breakdown Panel
 *
 * Implements classical Parāśari Navāṃśa mapping (BPHS Ch. 6, Ślokas 21–24, Sārāvalī, Bṛhat Jātaka):
 * - Every Rāśi (1..12) with its 9 Navāṃśa divisions:
 *   • degree range within the Rāśi (00°00'00" – 03°20'00", etc.)
 *   • Navāṃśa number (1–9)
 *   • resulting Navāṃśa Rāśi
 * - Used dynamically for Lagna and all Grahas (not a static dummy table)
 * - Calculation pipeline: Rāśi + exact degree → Navāṃśa number (1–9) → Navāṃśa Rāśi
 * - Highlights Vargottama & Puṣkara Navāṃśa placements with canonical classical rules.
 */

import React, { useState, useMemo } from 'react';
import { JyotishaChart, RashiNumber } from '@/lib/jyotisha/types';
import { RASHIS } from '@/lib/jyotisha/constants';
import {
  getCompleteNavamshaMappingTable,
  calculateChartNavamshaBreakdown,
  calculateNavamsha,
  formatDegreesDMS,
  RashiNavamshaTable,
  CalculatedNavamshaPosition,
} from '@/lib/vargas/navamsha';
import {
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  Gem,
  Compass,
  ArrowRight,
  Info,
  Table as TableIcon,
  Sliders,
} from 'lucide-react';

interface NavamshaPanelProps {
  chart: JyotishaChart;
  onNavigateToVargaChart?: () => void;
}

export const NavamshaPanel: React.FC<NavamshaPanelProps> = ({ chart, onNavigateToVargaChart }) => {
  const [selectedRashiView, setSelectedRashiView] = useState<RashiNumber>(
    (chart.lagna?.rashiNumber || 1) as RashiNumber
  );
  const [calcRashi, setCalcRashi] = useState<RashiNumber>(chart.lagna?.rashiNumber || 1);
  const [calcDeg, setCalcDeg] = useState<number>(
    parseFloat((chart.lagna?.degreeInRashi ?? 15.0).toFixed(4))
  );
  const [searchFilter, setSearchFilter] = useState('');

  // 1. Calculate live chart breakdown for Lagna + all Grahas
  const chartBreakdown = useMemo(() => {
    if (!chart.lagna || !chart.planets) return null;
    return calculateChartNavamshaBreakdown(chart.lagna, chart.planets);
  }, [chart]);

  // 2. Generate the complete 12 Rāśi × 9 Navāṃśa canonical reference table
  const canonicalTable = useMemo(() => {
    return getCompleteNavamshaMappingTable();
  }, []);

  // 3. Live Interactive calculation for custom degree test
  const customCalcResult = useMemo(() => {
    return calculateNavamsha(calcRashi, calcDeg);
  }, [calcRashi, calcDeg]);

  // Map of which planets/Lagna reside in which [rashiNumber-navamshaNumber]
  const residentEntitiesMap = useMemo(() => {
    const map = new Map<string, CalculatedNavamshaPosition[]>();
    if (!chartBreakdown) return map;

    const allPositions = [chartBreakdown.lagnaNavamsha, ...chartBreakdown.planetsNavamsha];
    for (const pos of allPositions) {
      const key = `${pos.rashiNumber}-${pos.navamshaNumber}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(pos);
    }
    return map;
  }, [chartBreakdown]);

  const activeRashiData = useMemo(() => {
    const rashi = canonicalTable.find((r) => r.rashiNumber === selectedRashiView) || canonicalTable[0];
    if (!searchFilter.trim()) return rashi;
    const q = searchFilter.toLowerCase();
    const filteredDivisions = rashi.divisions.filter(
      (d) =>
        d.navamshaRashiName.toLowerCase().includes(q) ||
        d.navamshaRashiSanskrit.toLowerCase().includes(q) ||
        d.navamshaLord.toLowerCase().includes(q) ||
        d.nakshatraName.toLowerCase().includes(q) ||
        d.rangeFormatted.includes(q)
    );
    return {
      ...rashi,
      divisions: filteredDivisions,
    };
  }, [canonicalTable, selectedRashiView, searchFilter]);

  return (
    <div id="navamsha-mapping-panel" className="space-y-8 font-sans">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-900">
            <Layers className="w-3.5 h-3.5 text-[#8C2D19]" />
            <span>BPHS Chapter 6 • Canonical D-9 Navāṃśa Engine</span>
          </div>
          <h2 className="text-xl font-serif font-bold tracking-tight text-slate-900">
            Classical Rāśi → Navāṃśa (D-9) Mapping &amp; Graha Analysis
          </h2>
          <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
            Every Rāśi is divided into 9 equal harmonic arcs of <strong>3°20&apos;00&quot; (3.333333°)</strong>.
            The starting Navāṃśa is strictly governed by the sign&apos;s element (Tattva):
            Fiery signs begin with <strong>Meṣa (1)</strong>, Earthy with <strong>Makara (10)</strong>,
            Airy with <strong>Tulā (7)</strong>, and Watery with <strong>Karka (4)</strong>.
          </p>
        </div>

        {/* Quick Stats Badges */}
        {chartBreakdown && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-900 font-medium flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Vargottama (D1=D9):</span>
              <strong className="font-mono text-emerald-950 font-bold">
                {chartBreakdown.vargottamaCount}
              </strong>
            </div>

            <div className="px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 font-medium flex items-center gap-1.5 shadow-2xs">
              <Gem className="w-4 h-4 text-amber-600" />
              <span>Puṣkara Navāṃśa:</span>
              <strong className="font-mono text-amber-950 font-bold">
                {chartBreakdown.pushkaraCount}
              </strong>
            </div>

            {onNavigateToVargaChart && (
              <button
                type="button"
                onClick={onNavigateToVargaChart}
                className="px-3 py-1.5 bg-[#8C2D19] text-white rounded-xl text-xs font-bold hover:bg-[#732414] transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
              >
                <span>View D-9 Chart</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. SECTION A: Live Graha & Lagna Navāṃśa Mapping Breakdown */}
      {chartBreakdown && (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs space-y-0">
          <div className="bg-slate-50/70 border-b border-slate-200/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#8C2D19]" />
                <h3 className="font-serif font-bold text-slate-900 text-base">
                  Live Horoscope Breakdown: Lagna &amp; Grahas in Navāṃśa
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated strictly via <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">Rāśi + exact degree → Navāṃśa # (1–9) → Navāṃśa Rāśi</code>
              </p>
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              D9 Lagna: <strong className="text-slate-900">{chartBreakdown.lagnaNavamsha.navamshaRashiSanskrit} ({chartBreakdown.lagnaNavamsha.navamshaRashiName})</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table id="navamsha-grahas-table" className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/40 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">D-1 Rāśi &amp; Exact Degree</th>
                  <th className="py-3 px-4 text-center">Navāṃśa # (1–9)</th>
                  <th className="py-3 px-4">Degree Range in Rāśi</th>
                  <th className="py-3 px-4">Resulting Navāṃśa Rāśi</th>
                  <th className="py-3 px-4">Sign Lord</th>
                  <th className="py-3 px-4 text-center">D-9 House</th>
                  <th className="py-3 px-4">Nakshatra &amp; Pāda</th>
                  <th className="py-3 px-4 text-right">Auspicious Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* 1. Lagna Row */}
                <tr className="bg-amber-50/30 hover:bg-amber-50/60 transition-colors font-medium">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#8C2D19]" />
                      <span className="font-serif">Lagna (Ascendant)</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-900 font-semibold">
                      {chartBreakdown.lagnaNavamsha.rashiSanskrit} ({chartBreakdown.lagnaNavamsha.rashiName})
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {chartBreakdown.lagnaNavamsha.formattedDegreeInRashi}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-900 font-mono font-bold text-xs border border-amber-300 shadow-2xs">
                      #{chartBreakdown.lagnaNavamsha.navamshaNumber}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {chartBreakdown.lagnaNavamsha.degreeRangeFormatted}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">
                      {chartBreakdown.lagnaNavamsha.navamshaRashiSanskrit} ({chartBreakdown.lagnaNavamsha.navamshaRashiName})
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      in D9: {chartBreakdown.lagnaNavamsha.formattedDegreeInNavamsha}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 capitalize">
                    {chartBreakdown.lagnaNavamsha.navamshaLord}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#8C2D19]">
                    H1
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <span>{chartBreakdown.lagnaNavamsha.nakshatraName}</span>
                    <span className="text-slate-400 ml-1 font-mono">P{chartBreakdown.lagnaNavamsha.nakshatraPada}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {chartBreakdown.lagnaNavamsha.isVargottama && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-md font-bold text-[10px]">
                          Vargottama
                        </span>
                      )}
                      {chartBreakdown.lagnaNavamsha.isPushkara && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-bold text-[10px] inline-flex items-center gap-1">
                          <Gem className="w-2.5 h-2.5 text-amber-700" />
                          <span>Puṣkara</span>
                        </span>
                      )}
                      {!chartBreakdown.lagnaNavamsha.isVargottama && !chartBreakdown.lagnaNavamsha.isPushkara && (
                        <span className="text-slate-400">&mdash;</span>
                      )}
                    </div>
                  </td>
                </tr>

                {/* 2. Grahas Rows */}
                {chartBreakdown.planetsNavamsha.map((p) => {
                  return (
                    <tr
                      key={p.entityId}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif capitalize text-slate-900">
                            {p.entitySanskrit} ({p.entityName})
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-900 font-medium">
                          {p.rashiSanskrit} ({p.rashiName})
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {p.formattedDegreeInRashi}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-mono font-bold text-xs border shadow-2xs ${
                            p.isVargottama
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                              : p.isPushkara
                              ? 'bg-amber-100 text-amber-950 border-amber-300'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          #{p.navamshaNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {p.degreeRangeFormatted}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {p.navamshaRashiSanskrit} ({p.navamshaRashiName})
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          in D9: {p.formattedDegreeInNavamsha}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 capitalize">
                        {p.navamshaLord}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#8C2D19]">
                        H{p.houseInD9}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span>{p.nakshatraName}</span>
                        <span className="text-slate-400 ml-1 font-mono">P{p.nakshatraPada}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {p.isVargottama && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-md font-bold text-[10px]">
                              Vargottama
                            </span>
                          )}
                          {p.isPushkara && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-bold text-[10px] inline-flex items-center gap-1">
                              <Gem className="w-2.5 h-2.5 text-amber-700" />
                              <span>Puṣkara</span>
                            </span>
                          )}
                          {!p.isVargottama && !p.isPushkara && (
                            <span className="text-slate-400 text-[11px]">&mdash;</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SECTION B: Interactive Degree → Navāṃśa Calculator Tool */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#8C2D19]" />
            <h3 className="font-serif font-bold text-slate-900 text-base">
              Interactive Rāśi + Degree → Navāṃśa Calculator
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Rāśi + exact degree → Navāṃśa number (1–9) → Navāṃśa Rāśi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Controls: Source Sign & Degree */}
          <div className="md:col-span-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Source Rāśi (Sign):
                </label>
                <select
                  value={calcRashi}
                  onChange={(e) => setCalcRashi(parseInt(e.target.value, 10) as RashiNumber)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-[#8C2D19] focus:outline-none"
                >
                  {Object.values(RASHIS).map((r) => (
                    <option key={r.number} value={r.number}>
                      {r.number}. {r.sanskritName} ({r.name}) — {r.element}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex justify-between">
                  <span>Degree within Rāśi (0°–30°):</span>
                  <span className="font-mono text-[#8C2D19] font-bold">
                    {formatDegreesDMS(calcDeg)}
                  </span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={29.9999}
                  step={0.01}
                  value={calcDeg}
                  onChange={(e) => setCalcDeg(parseFloat(e.target.value))}
                  className="w-full accent-[#8C2D19] cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Presets based on Chart Entities */}
            {chartBreakdown && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Quick Load from Horoscope:
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setCalcRashi(chartBreakdown.lagnaNavamsha.rashiNumber);
                      setCalcDeg(chartBreakdown.lagnaNavamsha.degreeInRashi);
                    }}
                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    Lagna ({chartBreakdown.lagnaNavamsha.rashiSanskrit})
                  </button>
                  {chartBreakdown.planetsNavamsha.slice(0, 5).map((p) => (
                    <button
                      key={p.entityId}
                      type="button"
                      onClick={() => {
                        setCalcRashi(p.rashiNumber);
                        setCalcDeg(p.degreeInRashi);
                      }}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-[11px] font-medium cursor-pointer transition-colors"
                    >
                      {p.entitySanskrit}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Result Output Card */}
          <div className="md:col-span-6 bg-slate-50 border border-slate-200/90 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-700">Calculated Navāṃśa Result</span>
              <span className="font-mono">{customCalcResult.rangeFormatted}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#8C2D19] text-white flex flex-col items-center justify-center shadow-xs shrink-0">
                <span className="text-[10px] font-bold uppercase opacity-80">Navāṃśa</span>
                <span className="text-xl font-serif font-bold">#{customCalcResult.navamshaNumber}</span>
              </div>

              <div className="space-y-0.5">
                <div className="text-base font-serif font-bold text-slate-900">
                  {customCalcResult.navamshaRashi.sanskritName} ({customCalcResult.navamshaRashi.name})
                </div>
                <div className="text-xs text-slate-600">
                  Element: <strong>{customCalcResult.navamshaRashi.element}</strong> • Sign Lord: <strong className="capitalize">{customCalcResult.navamshaRashi.lord}</strong>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Nakshatra Pāda: <strong>{customCalcResult.nakshatraName} Pāda {customCalcResult.nakshatraPada}</strong>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 pt-1">
              {customCalcResult.isVargottama ? (
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full font-bold text-[10px]">
                  🌟 Vargottama (Same sign in D1 &amp; D9)
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">Non-Vargottama</span>
              )}

              {customCalcResult.isPushkara && (
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                  <Gem className="w-3 h-3 text-amber-700" />
                  <span>Puṣkara Navāṃśa (Fortified)</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECTION C: Canonical 9 Navāṃśa Reference Mapping Table for Selected Rāśi */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs space-y-0">
        <div className="bg-slate-50/70 border-b border-slate-200/80 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-[#8C2D19]" />
                <h3 className="font-serif font-bold text-slate-900 text-base">
                  Canonical Rāśi → 9 Navāṃśa Reference Table
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Select a Rāśi below to inspect its 9 classical Navāṃśa divisions, degree bounds, resulting signs, lords &amp; live chart Grahas.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter divisions, lords, nakshatras..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#8C2D19] focus:outline-none"
              />
            </div>
          </div>

          {/* Rāśi Selector Ribbon (12 Signs - User Chooses Exactly One) */}
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
              Choose Rāśi (Sign):
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {canonicalTable.map((r) => {
                const isSelected = selectedRashiView === r.rashiNumber;
                return (
                  <button
                    key={r.rashiNumber}
                    type="button"
                    onClick={() => {
                      setSelectedRashiView(r.rashiNumber);
                      setCalcRashi(r.rashiNumber);
                    }}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap text-xs flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#8C2D19] text-white font-bold shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                      {r.rashiNumber}
                    </span>
                    <span>{r.rashiSanskrit}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                      ({r.rashiName})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Sign Display */}
        <div className="p-6">
          <div
            key={activeRashiData.rashiNumber}
            className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs"
          >
            {/* Rashi Header */}
            <div className="bg-slate-50/90 px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-xl bg-[#8C2D19] text-white font-mono font-bold text-xs flex items-center justify-center shadow-2xs">
                  {activeRashiData.rashiNumber}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-bold text-slate-900 text-base">
                      {activeRashiData.rashiSanskrit} ({activeRashiData.rashiName})
                    </h4>
                    <span className="text-xs text-slate-500 font-serif">
                      {activeRashiData.rashiDevanagari}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
                <span className="px-2.5 py-1 bg-slate-200/70 rounded-lg font-medium text-[11px]">
                  Element: <strong>{activeRashiData.element}</strong>
                </span>
                <span className="px-2.5 py-1 bg-slate-200/70 rounded-lg font-medium text-[11px]">
                  Lord: <strong className="capitalize">{activeRashiData.lord}</strong>
                </span>
                <span className="px-2.5 py-1 bg-amber-100/80 text-amber-950 border border-amber-200 rounded-lg font-medium text-[11px]">
                  Navāṃśas Start at: <strong>{activeRashiData.startSignSanskrit} (#{activeRashiData.startSignNumber})</strong>
                </span>
              </div>
            </div>

            {/* 9 Navamsha Divisions Table for this Rashi */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 text-[11px]">
                    <th className="py-3 px-4 text-center w-16">Nav #</th>
                    <th className="py-3 px-4 w-40">Degree Range</th>
                    <th className="py-3 px-4">Resulting Navāṃśa Rāśi</th>
                    <th className="py-3 px-4">Sign Lord</th>
                    <th className="py-3 px-4">Element</th>
                    <th className="py-3 px-4">Nakshatra Pāda</th>
                    <th className="py-3 px-4 text-center">Flags</th>
                    <th className="py-3 px-4 text-right">Grahas in this Chart</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {activeRashiData.divisions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        No Navāṃśa divisions matching &ldquo;{searchFilter}&rdquo; in this sign.
                      </td>
                    </tr>
                  ) : (
                    activeRashiData.divisions.map((div) => {
                      const cellKey = `${activeRashiData.rashiNumber}-${div.navamshaNumber}`;
                      const residentEntities = residentEntitiesMap.get(cellKey) || [];

                      return (
                        <tr
                          key={div.navamshaNumber}
                          className={`transition-colors ${
                            residentEntities.length > 0
                              ? 'bg-amber-50/70 hover:bg-amber-50 font-medium'
                              : div.isVargottama
                              ? 'bg-emerald-50/20 hover:bg-slate-50'
                              : 'hover:bg-slate-50/60'
                          }`}
                        >
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-mono font-bold text-[11px] ${
                                div.isVargottama
                                  ? 'bg-emerald-100 text-emerald-950'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {div.navamshaNumber}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                            {div.rangeFormatted}
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">
                              {div.navamshaRashiSanskrit} ({div.navamshaRashiName})
                            </div>
                          </td>

                          <td className="py-3 px-4 capitalize text-slate-600">
                            {div.navamshaLord}
                          </td>

                          <td className="py-3 px-4 text-slate-600">
                            {div.navamshaElement}
                          </td>

                          <td className="py-3 px-4 text-slate-600 text-[11px]">
                            {div.nakshatraName} P{div.nakshatraPada}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              {div.isVargottama && (
                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-[9px] font-bold">
                                  Vargottama
                                </span>
                              )}
                              {div.isPushkara && (
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-bold inline-flex items-center gap-0.5">
                                  <Gem className="w-2.5 h-2.5 text-amber-700" />
                                  <span>Puṣkara</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Resident Entities in Native's Chart */}
                          <td className="py-3 px-4 text-right">
                            {residentEntities.length > 0 ? (
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {residentEntities.map((ent) => (
                                  <span
                                    key={ent.entityId}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-2xs ${
                                      ent.entityId === 'lagna'
                                        ? 'bg-[#8C2D19] text-white border-[#8C2D19]'
                                        : 'bg-amber-100 text-amber-950 border-amber-300'
                                    }`}
                                  >
                                    {ent.entitySanskrit} ({ent.formattedDegreeInRashi})
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-300 text-[11px]">&mdash;</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

/**
 * Gaṇaka — Classical Viṃśottarī Daśā Hierarchical Viewer & Engine
 * Full 4-Level Sub-Period Support, Active Daśā Resolution,
 * Bhukta (Elapsed) & Bhogya (Balance), and Daśā Sandhi Indicators.
 */

import React, { useState, useMemo } from 'react';
import { DashaPeriod, CalculatedPlanet, JyotishaChart } from '@/lib/jyotisha/types';
import { getCurrentActiveDasha, ActiveDashaHierarchy } from '@/lib/dashas/vimshottari';
import { GRAHA_PROPERTIES, RASHIS } from '@/lib/jyotisha/constants';
import {
  ChevronRight,
  ChevronDown,
  Clock,
  AlertTriangle,
  Layers,
  Search,
  Calendar,
  Compass,
  Activity,
} from 'lucide-react';

const VIMSHOTTARI_YEARS_MAP: Record<string, number> = {
  ketu: 7,
  venus: 20,
  sun: 6,
  moon: 10,
  mars: 7,
  rahu: 18,
  jupiter: 16,
  saturn: 19,
  mercury: 17,
};

interface VimshottariPanelProps {
  chart: JyotishaChart;
}

export function VimshottariPanel({ chart }: VimshottariPanelProps) {
  const vimshottari = chart.vimshottari;
  const [activeTab, setActiveTab] = useState<'active' | 'timeline' | 'planets'>('active');
  const [expandedMaha, setExpandedMaha] = useState<number | null>(0);
  const [expandedAntar, setExpandedAntar] = useState<number | null>(null);
  const [expandedPrat, setExpandedPrat] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Target reference date (default: today)
  const [targetDateStr, setTargetDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const activeDashaHierarchy = useMemo(() => {
    const target = new Date(targetDateStr);
    return getCurrentActiveDasha(vimshottari.tree, isNaN(target.getTime()) ? new Date() : target);
  }, [vimshottari.tree, targetDateStr]);

  const toggleMaha = (idx: number) => {
    setExpandedMaha(expandedMaha === idx ? null : idx);
    setExpandedAntar(null);
    setExpandedPrat(null);
  };

  const toggleAntar = (idx: number) => {
    setExpandedAntar(expandedAntar === idx ? null : idx);
    setExpandedPrat(null);
  };

  const togglePrat = (idx: number) => {
    setExpandedPrat(expandedPrat === idx ? null : idx);
  };

  return (
    <div id="vimshottari-panel-container" className="space-y-6">
      {/* Navigation Header */}
      <div id="dasha-header-bar" className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="dasha-main-title" className="font-serif text-lg font-bold tracking-tight text-slate-900">
            Viṃśottarī Daśā (१२० वर्ष महादशा प्रणाली)
          </h2>
          <p className="font-sans text-xs text-slate-500">
            4-Level sub-period hierarchy (Mahā → Antar → Pratyantar → Sūkṣma), Bhukta/Bhogya, and Daśā Sandhi
          </p>
        </div>

        <div id="dasha-tabs-wrapper" className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            id="tab-btn-active-dasha"
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-[#8C2D19] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Active Daśā &amp; Bhukta</span>
          </button>
          <button
            id="tab-btn-timeline-tree"
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-[#8C2D19] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Full 4-Level Timeline</span>
          </button>
          <button
            id="tab-btn-planet-dashas"
            onClick={() => setActiveTab('planets')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'planets'
                ? 'bg-[#8C2D19] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Planet Profiles</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: Active Dasha, Bhukta & Bhogya, Sandhi */}
      {activeTab === 'active' && activeDashaHierarchy && (
        <div id="subview-active-dasha" className="space-y-6">
          {/* Active Period Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8C2D19] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#8C2D19]"></span>
                </span>
                <span className="font-serif text-base font-bold text-slate-900">
                  Active Operating Daśā on {targetDateStr}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="input-target-date" className="text-xs text-slate-500 font-medium font-sans">
                  Query Date:
                </label>
                <input
                  id="input-target-date"
                  type="date"
                  value={targetDateStr}
                  onChange={(e) => setTargetDateStr(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-900 shadow-2xs focus:border-[#8C2D19] focus:outline-none"
                />
              </div>
            </div>

            {/* 4-Level Active Period Hierarchy Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-sans">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">1. Mahādaśā</div>
                <div className="font-serif text-lg font-bold text-[#8C2D19]">
                  {activeDashaHierarchy.mahadasha.lordName}
                </div>
                <div className="font-mono text-xs text-slate-600">
                  {activeDashaHierarchy.mahadasha.startDate} – {activeDashaHierarchy.mahadasha.endDate}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">2. Antardaśā (Bhukti)</div>
                <div className="font-serif text-lg font-bold text-slate-900">
                  {activeDashaHierarchy.antardasha.lordName}
                </div>
                <div className="font-mono text-xs text-slate-600">
                  {activeDashaHierarchy.antardasha.startDate} – {activeDashaHierarchy.antardasha.endDate}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">3. Pratyantardaśā</div>
                <div className="font-serif text-lg font-bold text-slate-900">
                  {activeDashaHierarchy.pratyantardasha.lordName}
                </div>
                <div className="font-mono text-xs text-slate-600">
                  {activeDashaHierarchy.pratyantardasha.startDate} – {activeDashaHierarchy.pratyantardasha.endDate}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">4. Sūkṣmadaśā</div>
                <div className="font-serif text-lg font-bold text-slate-900">
                  {activeDashaHierarchy.sookshmadasha?.lordName || '—'}
                </div>
                <div className="font-mono text-xs text-slate-600">
                  {activeDashaHierarchy.sookshmadasha ? `${activeDashaHierarchy.sookshmadasha.startDate} – ${activeDashaHierarchy.sookshmadasha.endDate}` : '—'}
                </div>
              </div>
            </div>

            {/* Progress / Bhukta Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-mono text-slate-600">
                <span>Bhukta (Elapsed): <strong>{(activeDashaHierarchy.bhukta?.percentage || 0).toFixed(1)}%</strong></span>
                <span>Bhogya (Remaining): <strong>{(activeDashaHierarchy.bhogya?.percentage || 0).toFixed(1)}%</strong></span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-[#8C2D19] to-[#C2410C] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, activeDashaHierarchy.bhukta?.percentage || 0))}%` }}
                />
              </div>
            </div>

            {/* Sandhi Warning (if within boundary) */}
            {activeDashaHierarchy.isSandhiActive && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold font-serif text-sm block">Daśā Sandhi (Transition Junction Period)</span>
                  <p className="leading-relaxed">
                    {activeDashaHierarchy.sandhiDetails?.warning ||
                      'The current epoch is within the transition junction (Sandhi) between major periods. Classical texts counsel caution in new undertakings during Sandhi junctions.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Birth Balance of Dasha Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-xs">
              <span className="text-[11px] text-slate-500 block uppercase tracking-wider font-semibold">Janma Daśā Lord</span>
              <span className="text-base font-serif font-bold text-[#8C2D19] block uppercase">
                {vimshottari.balanceAtBirth.lord}
              </span>
              <span className="text-xs text-slate-600 block">Lord of Janma Nakṣatra</span>
            </div>

            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-xs">
              <span className="text-[11px] text-slate-500 block uppercase tracking-wider font-semibold">Birth Balance (Bhogya)</span>
              <span className="text-base font-mono font-bold text-slate-900 block">
                {vimshottari.balanceAtBirth.yearsRemaining.toFixed(2)} Years
              </span>
              <span className="text-xs text-slate-600 block">
                {(vimshottari.balanceAtBirth.percentRemaining || 0).toFixed(1)}% remaining at birth
              </span>
            </div>

            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-xs">
              <span className="text-[11px] text-slate-500 block uppercase tracking-wider font-semibold">Total Cycle Length</span>
              <span className="text-base font-mono font-bold text-slate-900 block">120 Solar Years</span>
              <span className="text-xs text-slate-600 block">9 Mahādaśās per Parāśara</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: Full 4-Level Timeline Tree */}
      {activeTab === 'timeline' && (
        <div id="subview-timeline-tree" className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <span className="font-serif font-bold text-slate-900 text-sm">
              120-Year Viṃśottarī Hierarchy Tree
            </span>
            <span className="text-xs text-slate-500">Click any row to expand sub-periods</span>
          </div>

          <div className="space-y-3 font-sans">
            {vimshottari.tree.map((maha, mIdx) => {
              const isMahaOpen = expandedMaha === mIdx;

              return (
                <div
                  key={mIdx}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/60 overflow-hidden transition-all"
                >
                  <div
                    onClick={() => toggleMaha(mIdx)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isMahaOpen ? (
                        <ChevronDown className="w-4 h-4 text-[#8C2D19]" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                      <div>
                        <span className="font-serif font-bold text-slate-900 text-sm">
                          {maha.lordName} Mahādaśā
                        </span>
                        <span className="text-xs font-mono text-slate-500 ml-2">
                          ({maha.durationYears.toFixed(2)} yrs)
                        </span>
                      </div>
                    </div>

                    <div className="font-mono text-xs text-slate-600 font-medium">
                      {maha.startDate} – {maha.endDate}
                    </div>
                  </div>

                  {/* Level 2: Antardashas */}
                  {isMahaOpen && maha.subPeriods && (
                    <div className="p-4 pt-0 border-t border-slate-200/60 space-y-2 bg-white">
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 py-1">
                        Antardaśās (Bhuktis)
                      </div>
                      <div className="space-y-1.5">
                        {maha.subPeriods.map((antar, aIdx) => {
                          const isAntarOpen = expandedAntar === aIdx;

                          return (
                            <div
                              key={aIdx}
                              className="rounded-lg border border-slate-100 bg-slate-50/80 overflow-hidden"
                            >
                              <div
                                onClick={() => toggleAntar(aIdx)}
                                className="p-2.5 px-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  {isAntarOpen ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-[#8C2D19]" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                  <span className="font-semibold text-slate-900">
                                    {maha.lordName} - {antar.lordName}
                                  </span>
                                </div>
                                <span className="font-mono text-slate-500">
                                  {antar.startDate} – {antar.endDate}
                                </span>
                              </div>

                              {/* Level 3: Pratyantardashas */}
                              {isAntarOpen && antar.subPeriods && (
                                <div className="p-3 border-t border-slate-200/60 bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                  {antar.subPeriods.map((prat, pIdx) => (
                                    <div
                                      key={pIdx}
                                      className="p-2 bg-slate-50 rounded-md border border-slate-200/60 text-xs font-mono"
                                    >
                                      <div className="font-semibold text-slate-900 font-sans">
                                        {prat.lordName}
                                      </div>
                                      <div className="text-[10px] text-slate-500">
                                        {prat.startDate} - {prat.endDate}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: Planet Profiles & Dasha Influence */}
      {activeTab === 'planets' && (
        <div id="subview-planet-dashas" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.values(chart.planets).map((p) => {
            const prop = GRAHA_PROPERTIES[p.id];
            return (
              <div
                key={p.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-sm hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-base">{p.sanskritName}</h4>
                    <span className="text-xs text-slate-500 font-mono">({p.name})</span>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-bold border border-slate-200">
                    H{p.house} • {p.rashiName}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Longitude:</span>
                    <span className="font-bold text-slate-900">{p.degreeStr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Nakṣatra:</span>
                    <span className="text-slate-800">{p.nakshatraName} (P{p.pada})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Dignity:</span>
                    <span className="text-[#8C2D19] font-bold font-sans">{p.dignity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Viṃśottarī Span:</span>
                    <span className="text-slate-800 font-bold">{VIMSHOTTARI_YEARS_MAP[p.id] || '—'} Years</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

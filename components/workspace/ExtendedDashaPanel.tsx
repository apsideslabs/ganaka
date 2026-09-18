'use client';

/**
 * Gaṇaka — Extended Daśā Systems Panel
 * 
 * Houses 7 authentic classical Daśā calculation systems alongside a synchronized Comparison Matrix:
 * 1. Aṣṭottarī Daśā (108-year Nakṣatra-planetary cycle per BPHS 46.37–45)
 * 2. Yoginī Daśā (36-year octagonal cycle per BPHS 46 & Rudrayāmala)
 * 3. Kālacakra Daśā (Nakṣatra-Pāda Savya/Apasavya Wheel of Time per BPHS 46.46–112)
 * 4. Jaiminī Cara Daśā (Foundational Rāśi Daśā per Jaimini Sūtras 2.4)
 * 5. Jaiminī Nārāyaṇa Daśā (Padakrama progressive Rāśi Daśā per Jaimini Sūtras 2.1)
 * 6. Jaiminī Śūla Daśā (Ayur-Daśā for crisis & health per Jaimini Sūtras 2.1)
 * 7. Jaiminī Dṛg Daśā (Vision & Dharma Daśā from 9th House triads per Jaimini Sūtras 2.4)
 */

import React, { useState, useMemo } from 'react';
import { JyotishaChart } from '@/lib/jyotisha/types';
import {
  ExtendedDashaSystemId,
  ExtendedDashaPeriod,
  ExtendedDashaCalculationResult,
  DashaComparisonRow,
} from '@/lib/dashas/extended-types';
import {
  calculateSingleExtendedDasha,
  buildDashaComparisonMatrix,
  ALL_EXTENDED_SYSTEMS,
} from '@/lib/dashas/extended-engine';
import {
  Clock,
  ArrowLeft,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Scale,
  Calendar,
  Compass,
  Search,
  Info,
} from 'lucide-react';

interface ExtendedDashaPanelProps {
  chart: JyotishaChart;
  onBackToVimshottari?: () => void;
}

export function ExtendedDashaPanel({ chart, onBackToVimshottari }: ExtendedDashaPanelProps) {
  // Navigation: 'comparison' or individual system id
  const [activeView, setActiveView] = useState<'comparison' | ExtendedDashaSystemId>('comparison');

  // Variant selections for systems with multiple traditions
  const [astottariVariant, setAstottariVariant] = useState<'ardradi_28' | 'ardradi_27'>('ardradi_28');
  const [charaVariant, setCharaVariant] = useState<'classical_lagna' | 'kn_rao_9th'>('classical_lagna');

  // Expandable periods in the timeline view (ID tracking)
  const [expandedPeriods, setExpandedPeriods] = useState<Record<string, boolean>>({});

  // Search query within period timelines
  const [searchQuery, setSearchQuery] = useState('');

  // Extract birth date from chart metadata
  const birthDate = useMemo(() => {
    const meta = (chart as any).meta?.birthDetails;
    if (meta && meta.year) {
      return new Date(meta.year, (meta.month || 1) - 1, meta.day || 1, meta.hour || 12, meta.minute || 0, meta.second || 0);
    }
    return new Date(2000, 0, 1, 12, 0, 0);
  }, [chart]);

  // Current calculation for selected single system
  const currentResult = useMemo<ExtendedDashaCalculationResult | null>(() => {
    if (activeView === 'comparison') return null;
    const variant = activeView === 'astottari' ? astottariVariant : activeView === 'chara' ? charaVariant : undefined;
    return calculateSingleExtendedDasha(activeView, chart, birthDate, variant);
  }, [activeView, chart, birthDate, astottariVariant, charaVariant]);

  // Comparison matrix across all systems
  const comparisonRows = useMemo<DashaComparisonRow[]>(() => {
    return buildDashaComparisonMatrix(chart, birthDate);
  }, [chart, birthDate]);

  const toggleExpand = (periodId: string) => {
    setExpandedPeriods((prev) => ({
      ...prev,
      [periodId]: !prev[periodId],
    }));
  };

  // Filtered periods for timeline view
  const filteredPeriods = useMemo(() => {
    if (!currentResult) return [];
    if (!searchQuery.trim()) return currentResult.periods;
    const q = searchQuery.toLowerCase();
    return currentResult.periods.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sanskritName.toLowerCase().includes(q) ||
        p.devanagari.includes(q) ||
        p.startDateStr.includes(q) ||
        p.endDateStr.includes(q)
    );
  }, [currentResult, searchQuery]);

  return (
    <div className="space-y-6">
      {/* TOP HEADER WITH NAVIGATION */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200">
                <Layers className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-serif font-bold text-slate-900">
                Extended Daśā Systems
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                7 Traditional Disciplines
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Rigorous, authentic calculation engines for Parāśarī &amp; Jaiminī temporal progressions alongside Viṃśottarī.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onBackToVimshottari && (
              <button
                onClick={onBackToVimshottari}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 text-[#8C2D19] hover:bg-amber-100 border border-amber-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Viṃśottarī Daśā (120y)</span>
              </button>
            )}
          </div>
        </div>

        {/* SYSTEM SELECTOR PILLS */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={() => {
              setActiveView('comparison');
              setSearchQuery('');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              activeView === 'comparison'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>Comparison Matrix</span>
            </span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

          {/* Nakshatra Planetary Systems */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
              Nakṣatra:
            </span>
            {[
              { id: 'astottari', name: 'Aṣṭottarī (108y)' },
              { id: 'yogini', name: 'Yoginī (36y)' },
              { id: 'kalacakra', name: 'Kālacakra (Pāda)' },
            ].map((sys) => (
              <button
                key={sys.id}
                onClick={() => {
                  setActiveView(sys.id as ExtendedDashaSystemId);
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  activeView === sys.id
                    ? 'bg-[#8C2D19] text-white border-[#8C2D19] shadow-2xs'
                    : 'bg-amber-50/70 text-amber-950 border-amber-200/80 hover:bg-amber-100'
                }`}
              >
                {sys.name}
              </button>
            ))}
          </div>

          <div className="h-5 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

          {/* Jaimini Rashi Systems */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
              Jaiminī Rāśi:
            </span>
            {[
              { id: 'chara', name: 'Cara Daśā' },
              { id: 'narayana', name: 'Nārāyaṇa Daśā' },
              { id: 'shula', name: 'Śūla (Ayur)' },
              { id: 'drg', name: 'Dṛg (Dharma)' },
            ].map((sys) => (
              <button
                key={sys.id}
                onClick={() => {
                  setActiveView(sys.id as ExtendedDashaSystemId);
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  activeView === sys.id
                    ? 'bg-indigo-900 text-white border-indigo-900 shadow-2xs'
                    : 'bg-indigo-50/70 text-indigo-950 border-indigo-200/80 hover:bg-indigo-100'
                }`}
              >
                {sys.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* VIEW A: COMPARISON MATRIX */}
      {activeView === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-slate-900">
                  Active Daśā Periods Synchronized Comparison
                </h3>
                <p className="text-xs text-slate-500">
                  Cross-system synchronization for today’s date across Nakṣatra planetary and Jaiminī Rāśi methodologies.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Synchronized to Birth Chart
                </span>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                    <th className="py-3 px-3.5">System</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Cycle</th>
                    <th className="py-3 px-3">Active Major Period</th>
                    <th className="py-3 px-3">Active Sub-Period</th>
                    <th className="py-3 px-3">Span (Start – End)</th>
                    <th className="py-3 px-3">Progress / Remaining</th>
                    <th className="py-3 px-3">Eligibility</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonRows.map((row) => (
                    <tr
                      key={row.systemId}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-3.5 font-medium text-slate-900">
                        <div className="font-serif font-bold text-sm text-slate-900">
                          {row.systemName}
                        </div>
                        <div className="text-[11px] font-serif text-slate-500">
                          {row.sanskritName}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                            row.classification === 'nakshatra_planetary'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                          }`}
                        >
                          {row.classification === 'nakshatra_planetary' ? 'Nakṣatra' : 'Jaiminī Rāśi'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-700">
                        {row.cycleYears}y
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-serif font-bold text-[#8C2D19] text-xs">
                          {row.currentMajorPeriod}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-serif font-medium text-slate-800 text-xs">
                          {row.currentSubPeriod}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600 text-[11px]">
                        <div>{row.startDateStr}</div>
                        <div className="text-slate-400">to {row.endDateStr}</div>
                      </td>
                      <td className="py-3.5 px-3 min-w-[130px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-slate-700 font-mono">
                              {row.remainingStr}
                            </span>
                            <span className="text-slate-400 font-bold font-mono">
                              {row.progressPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#8C2D19] h-1.5 rounded-full"
                              style={{ width: `${Math.min(100, row.progressPercentage)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        {row.eligibilityStatus === 'satisfied' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] font-medium border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Satisfied
                          </span>
                        ) : row.eligibilityStatus === 'conditional' ? (
                          <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md text-[11px] font-medium border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Conditional
                          </span>
                        ) : row.eligibilityStatus === 'not_satisfied' ? (
                          <span className="inline-flex items-center gap-1 text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md text-[11px] font-medium border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Unsatisfied
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md text-[11px] font-medium border border-blue-200">
                            <Info className="w-3 h-3 text-blue-600" />
                            Universal
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => setActiveView(row.systemId)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Examine &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Guidance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-amber-50/50 border border-amber-200/70 rounded-2xl p-5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-amber-950 font-serif font-bold text-sm">
                <Compass className="w-4 h-4 text-[#8C2D19]" />
                <span>Nakṣatra-Based Planetary Systems</span>
              </div>
              <p className="text-amber-900/90 leading-relaxed">
                Systems like <strong>Aṣṭottarī (108y)</strong>, <strong>Yoginī (36y)</strong>, and <strong>Kālacakra</strong> calculate durations based on the Moon’s exact sidereal longitude and asterism quarter (pāda). They govern psychological states, somatic transitions, and planetary transits.
              </p>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-200/70 rounded-2xl p-5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-indigo-950 font-serif font-bold text-sm">
                <Layers className="w-4 h-4 text-indigo-800" />
                <span>Rāśi-Based Jaiminī Systems</span>
              </div>
              <p className="text-indigo-900/90 leading-relaxed">
                Systems like <strong>Cara Daśā</strong>, <strong>Nārāyaṇa Daśā</strong>, <strong>Śūla Daśā</strong>, and <strong>Dṛg Daśā</strong> employ entire zodiac signs (Rāśis) as period rulers. They reveal objective environment, social status, health crises, and spiritual initiation through Arūḍhas and Kārakas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: INDIVIDUAL SYSTEM DETAILS */}
      {activeView !== 'comparison' && currentResult && (
        <div className="space-y-6">
          {/* SYSTEM HEADER & PROVENANCE CARD */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-xl font-serif font-bold text-slate-900">
                    {currentResult.system.name}
                  </h3>
                  <span className="text-sm font-serif text-[#8C2D19] font-medium">
                    {currentResult.system.devanagari}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      currentResult.system.classification === 'nakshatra_planetary'
                        ? 'bg-amber-100 text-amber-900 border-amber-200'
                        : 'bg-indigo-100 text-indigo-900 border-indigo-200'
                    }`}
                  >
                    {currentResult.system.classification === 'nakshatra_planetary'
                      ? 'Nakṣatra Planetary Cycle'
                      : 'Jaiminī Rāśi Cycle'}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200 font-mono">
                    Cycle: {currentResult.system.cycleYears} Years
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                  {currentResult.system.description}
                </p>
              </div>

              {/* VARIANT PICKER IF AVAILABLE */}
              {currentResult.availableVariants.length > 1 && (
                <div className="shrink-0 p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-xs">
                  <span className="font-semibold text-slate-700 block">Calculation Methodology:</span>
                  <select
                    value={activeView === 'astottari' ? astottariVariant : charaVariant}
                    onChange={(e) => {
                      if (activeView === 'astottari') {
                        setAstottariVariant(e.target.value as any);
                      } else if (activeView === 'chara') {
                        setCharaVariant(e.target.value as any);
                      }
                    }}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#8C2D19] cursor-pointer"
                  >
                    {currentResult.availableVariants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* SCRIPTURAL PROVENANCE & BASIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#8C2D19]" />
                  <span>Scriptural Provenance</span>
                </span>
                <span className="font-serif font-bold text-slate-900 block">
                  {currentResult.system.scripturalProvenance}
                </span>
                <span className="text-slate-600 block text-[11px]">
                  {currentResult.system.traditionalBasis}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#8C2D19]" />
                  <span>Calculated Seed Basis</span>
                </span>
                <span className="font-serif font-bold text-slate-900 block">
                  {currentResult.calculationDetails.seedBasis}
                </span>
                <span className="text-slate-600 block text-[11px]">
                  Birth Balance: {currentResult.calculationDetails.balanceYears.toFixed(2)} years ({Math.round(currentResult.calculationDetails.balanceFraction * 100)}% remaining)
                </span>
              </div>
            </div>

            {/* CLASSICAL ELIGIBILITY BANNER */}
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                currentResult.eligibility.status === 'satisfied'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : currentResult.eligibility.status === 'conditional'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : currentResult.eligibility.status === 'not_satisfied'
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                  : 'bg-blue-50/70 border-blue-200 text-blue-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-serif font-bold text-sm">
                  {currentResult.eligibility.status === 'satisfied' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  ) : currentResult.eligibility.status === 'not_satisfied' ? (
                    <AlertCircle className="w-4 h-4 text-rose-700" />
                  ) : (
                    <Info className="w-4 h-4 text-slate-700" />
                  )}
                  <span>Condition Status: {currentResult.eligibility.conditionTitle}</span>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border">
                  {currentResult.eligibility.status === 'satisfied'
                    ? 'Classical Condition Satisfied'
                    : currentResult.eligibility.status === 'conditional'
                    ? 'Conditional Application'
                    : currentResult.eligibility.status === 'not_satisfied'
                    ? 'Conditions Not Satisfied (Research Mode)'
                    : 'Universal Applicability'}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                <strong>Classical Rule:</strong> {currentResult.eligibility.classicalRule}
              </p>
              <p className="text-slate-600 text-[11px]">
                <strong>Chart Evaluation:</strong> {currentResult.eligibility.chartEvaluation}
              </p>
              {currentResult.eligibility.sanskritVerse && (
                <div className="p-2.5 bg-white/70 rounded-lg border border-slate-200 font-serif text-[11px] text-slate-800 italic">
                  {currentResult.eligibility.sanskritVerse}
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE PERIOD HERO CARD */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8C2D19]" />
                <h4 className="font-serif font-bold text-base text-slate-900">
                  Current Active Period ({new Date().toISOString().split('T')[0]})
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                {currentResult.currentPeriod.progressPercentage}% Elapsed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1">
                <span className="text-xs text-amber-800 font-semibold block">Active Mahādaśā</span>
                <span className="text-lg font-serif font-bold text-[#8C2D19] block">
                  {currentResult.currentPeriod.majorPeriod.name}
                </span>
                <span className="text-xs text-slate-600 block font-serif">
                  {currentResult.currentPeriod.majorPeriod.devanagari}
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                <span className="text-xs text-slate-600 font-semibold block">Active Antardaśā</span>
                <span className="text-lg font-serif font-bold text-slate-900 block">
                  {currentResult.currentPeriod.subPeriod?.name || '—'}
                </span>
                <span className="text-xs text-slate-600 block font-serif">
                  {currentResult.currentPeriod.subPeriod?.devanagari || '—'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                <span className="text-xs text-slate-600 font-semibold block">Period Duration</span>
                <span className="text-base font-serif font-bold text-slate-900 block font-mono">
                  {currentResult.currentPeriod.durationYears.toFixed(2)} Years
                </span>
                <span className="text-xs text-slate-500 block font-mono">
                  {currentResult.currentPeriod.majorPeriod.startDateStr} &rarr; {currentResult.currentPeriod.majorPeriod.endDateStr}
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                <span className="text-xs text-slate-600 font-semibold block">Remaining Balance</span>
                <span className="text-base font-serif font-bold text-[#8C2D19] block font-mono">
                  {currentResult.currentPeriod.remainingYears}y {currentResult.currentPeriod.remainingMonths}m {currentResult.currentPeriod.remainingDays}d
                </span>
                <span className="text-xs text-slate-500 block">
                  Until {currentResult.currentPeriod.majorPeriod.endDateStr}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#8C2D19] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, currentResult.currentPeriod.progressPercentage)}%` }}
                />
              </div>
            </div>
          </div>

          {/* CHRONOLOGICAL PERIOD TIMELINE TABLE */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-serif font-bold text-base text-slate-900">
                  Chronological Period Sequence
                </h4>
                <p className="text-xs text-slate-500">
                  Click on any Mahādaśā row to reveal its classical Antardaśā sub-period breakdowns.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter periods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#8C2D19]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                    <th className="py-2.5 px-3 w-8"></th>
                    <th className="py-2.5 px-3">Period / Lord</th>
                    <th className="py-2.5 px-3">Devanāgarī</th>
                    <th className="py-2.5 px-3">Duration (Years)</th>
                    <th className="py-2.5 px-3">Start Date</th>
                    <th className="py-2.5 px-3">End Date</th>
                    <th className="py-2.5 px-3">Notes / Classical Factors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPeriods.map((period) => {
                    const isExpanded = !!expandedPeriods[period.id];
                    const isActive =
                      currentResult.currentPeriod.majorPeriod.id === period.id;

                    return (
                      <React.Fragment key={period.id}>
                        <tr
                          onClick={() => toggleExpand(period.id)}
                          className={`cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-amber-50/70 hover:bg-amber-100/70'
                              : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3 px-3 text-slate-400">
                            {period.subPeriods && period.subPeriods.length > 0 ? (
                              isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )
                            ) : null}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
                              <span>{period.name}</span>
                              {isActive && (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#8C2D19] text-white">
                                  Current
                                </span>
                              )}
                              {period.isBirthBalance && (
                                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                  Birth Balance
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-serif text-slate-700 font-medium">
                            {period.devanagari}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-800">
                            {period.durationYears.toFixed(2)}y
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600">
                            {period.startDateStr}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600">
                            {period.endDateStr}
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            {period.metadata?.note || (period.metadata?.gatiType ? `Gati: ${period.metadata.gatiType}` : '—')}
                          </td>
                        </tr>

                        {/* EXPANDED SUB-PERIODS (ANTARDAŚĀS) */}
                        {isExpanded && period.subPeriods && (
                          <tr>
                            <td colSpan={7} className="p-0 bg-slate-50/60">
                              <div className="py-2.5 px-6 space-y-2 border-y border-slate-200/60">
                                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 text-[#8C2D19]" />
                                  <span>Antardaśā Sub-Periods for {period.name}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                                  {period.subPeriods.map((sub) => {
                                    const isSubActive =
                                      currentResult.currentPeriod.subPeriod?.id === sub.id;

                                    return (
                                      <div
                                        key={sub.id}
                                        className={`p-2.5 rounded-xl border transition-all ${
                                          isSubActive
                                            ? 'bg-amber-100/90 border-amber-300 text-amber-950 font-bold ring-1 ring-amber-400'
                                            : 'bg-white border-slate-200 text-slate-800'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-serif font-bold">
                                            {sub.name}
                                          </span>
                                          {isSubActive && (
                                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#8C2D19] text-white font-bold">
                                              Active
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-mono mt-1">
                                          {sub.durationYears < 1
                                            ? `${(sub.durationYears * 12).toFixed(1)} mo`
                                            : `${sub.durationYears.toFixed(2)} yr`}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                          {sub.startDateStr} &rarr; {sub.endDateStr}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* CALCULATION STEPS & PROVENANCE DETAILS */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3 text-xs">
            <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#8C2D19]" />
              <span>Calculation Steps &amp; Technical Audit</span>
            </h4>
            <div className="space-y-1.5 text-slate-600">
              {currentResult.calculationDetails.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="font-mono font-bold text-slate-400 select-none">
                    {idx + 1}.
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

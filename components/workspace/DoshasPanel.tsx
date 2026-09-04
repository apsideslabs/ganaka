'use client';

/**
 * Gaṇaka — Classical Dosha & Ariṣṭa Verification Panel
 * Phase 2: Dosha Detection & Classical Remedies (Śānti & Parihāra)
 * Features:
 * - Deterministic evaluation against the verified classical database
 * - Exact condition checklists (Condition 1, 2, 3... Met / Not Met with responsible chart factors)
 * - Transparent explanation of why each Dosha formed or did not form
 * - Researched classical remedy database with authentic Sanskrit textual citations & provenance
 * - Separation between mathematical formation, classical effects, and remedial measures
 */

import React, { useState, useMemo } from 'react';
import { JyotishaChart } from '../../lib/jyotisha/types';
import {
  EvaluatedDosha,
  DoshaCategory,
  DoshaFormationStatus,
  ClassicalStatus,
  VerifiedClassicalRemedy,
} from '../../lib/doshas/dosha-types';
import { evaluateAllDoshas } from '../../lib/doshas/dosha-engine';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Info,
  Layers,
  Sparkles,
  Flame,
  Search,
  Check,
  X,
  Compass,
  SlidersHorizontal,
  Scroll,
  Flower2,
  Clock,
  UserCheck,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface DoshasPanelProps {
  chart: JyotishaChart;
  onNavigateToRemedies?: () => void;
}

const CATEGORIES: Array<{ id: 'all' | DoshaCategory; label: string; icon: any }> = [
  { id: 'all', label: 'All Categories', icon: Layers },
  { id: 'Graha Afflictions', label: 'Graha Afflictions', icon: Flame },
  { id: 'Ariṣṭa & Bālarishta', label: 'Ariṣṭa & Bālarishta', icon: ShieldAlert },
  { id: 'Gandānta & Birth Defects', label: 'Gandānta & Birth', icon: Compass },
  { id: 'Pañcāṅga & Tithi Afflictions', label: 'Pañcāṅga Afflictions', icon: Sparkles },
  { id: 'Śāpa Classifications (BPHS Ch. 83)', label: 'Śāpa (BPHS Ch. 83)', icon: BookOpen },
  { id: 'Progeny & Santāna Afflictions', label: 'Progeny & Santāna', icon: ShieldAlert },
  { id: 'Marriage & Relationship Afflictions', label: 'Marriage & Kuja Doṣa', icon: Flame },
  { id: 'Contested & Vernacular Traditions', label: 'Modern / Contested', icon: Info },
];

export const DoshasPanel: React.FC<DoshasPanelProps> = ({ chart, onNavigateToRemedies }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | DoshaCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'formed' | 'cancelled_mitigated' | 'not_formed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoshaModal, setSelectedDoshaModal] = useState<EvaluatedDosha | null>(null);

  // Variant preference toggles
  const [include2ndHouseKuja, setInclude2ndHouseKuja] = useState(true);

  // Recalculate if user changes variant preferences
  const doshaReport = useMemo(() => {
    return evaluateAllDoshas(chart, {
      include2ndHouseKujaDosha: include2ndHouseKuja,
    });
  }, [chart, include2ndHouseKuja]);

  // Filtered doshas
  const filteredDoshas = useMemo(() => {
    return doshaReport.evaluatedDoshas.filter((d) => {
      // Category filter
      if (selectedCategory !== 'all' && d.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (statusFilter === 'formed' && d.formationStatus !== 'Formed') return false;
      if (statusFilter === 'cancelled_mitigated' && d.formationStatus !== 'Cancelled' && d.formationStatus !== 'Mitigated') return false;
      if (statusFilter === 'not_formed' && d.formationStatus !== 'Not Formed') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = d.name.toLowerCase().includes(q) || d.sanskritName.toLowerCase().includes(q) || d.transliteration.toLowerCase().includes(q);
        const matchesSource = d.primarySource.text.toLowerCase().includes(q) || d.primarySource.chapter.toLowerCase().includes(q);
        const matchesPlanets = d.involvedPlanets.some((p) => p.toLowerCase().includes(q));
        const matchesConditions = d.conditionsMet.some((c) => c.toLowerCase().includes(q));
        return matchesName || matchesSource || matchesPlanets || matchesConditions;
      }

      return true;
    });
  }, [doshaReport, selectedCategory, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & METRIC SUMMARY */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#8C2D19]" />
              <h2 className="text-lg font-serif font-bold text-slate-900">
                Classical Dosha &amp; Ariṣṭa Detection Engine
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#8C2D19]/10 text-[#8C2D19] font-bold">
                Phase 2: Detection &amp; Verified Remedies
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Evaluates every verified classical Dosha with complete condition checklists, chart factors, and researched textual remedies (<em>Śānti &amp; Parihāra</em>).
            </p>
          </div>

          {/* South Indian 2nd House Kuja Dosha Variant Switch */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2">
            <SlidersHorizontal className="w-4 h-4 text-[#8C2D19]" />
            <div className="text-left">
              <span className="text-[11px] font-bold text-slate-800 block">Kuja Doṣa 2nd House</span>
              <span className="text-[10px] text-slate-500 block">South Indian Tradition</span>
            </div>
            <button
              type="button"
              onClick={() => setInclude2ndHouseKuja(!include2ndHouseKuja)}
              className={`ml-2 relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                include2ndHouseKuja ? 'bg-[#8C2D19]' : 'bg-slate-300'
              }`}
              title="Toggle South Indian 2nd house inclusion for Kuja Dosha"
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  include2ndHouseKuja ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Core Metric Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">
              Total Evaluated
            </span>
            <span className="text-2xl font-mono font-bold text-slate-900 block">
              {doshaReport.totalEvaluated}
            </span>
            <span className="text-[11px] text-slate-600 block">
              Directly Classical: <strong>{doshaReport.byStatus['Directly Classical']?.total || 0}</strong>
            </span>
          </div>

          <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-rose-700 block uppercase tracking-wider font-bold">
              Formed (Active)
            </span>
            <span className="text-2xl font-mono font-bold text-rose-900 block">
              {doshaReport.formedCount}
            </span>
            <span className="text-[11px] text-rose-700 block">
              Remedial measures available
            </span>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-emerald-700 block uppercase tracking-wider font-bold">
              Cancelled / Mitigated
            </span>
            <span className="text-2xl font-mono font-bold text-emerald-900 block">
              {doshaReport.cancelledCount + doshaReport.mitigatedCount}
            </span>
            <span className="text-[11px] text-emerald-700 block">
              Bhaṅga &amp; Parihāra applied
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">
              Not Formed
            </span>
            <span className="text-2xl font-mono font-bold text-slate-700 block">
              {doshaReport.notFormedCount}
            </span>
            <span className="text-[11px] text-slate-500 block">
              Conditions clear
            </span>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY TABS & FILTERS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-4">
        {/* Category Pill Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isCatActive = selectedCategory === cat.id;
            const count =
              cat.id === 'all'
                ? doshaReport.totalEvaluated
                : doshaReport.byCategory[cat.id as DoshaCategory]?.total || 0;

            const formed =
              cat.id === 'all'
                ? doshaReport.formedCount
                : doshaReport.byCategory[cat.id as DoshaCategory]?.formed || 0;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isCatActive
                    ? 'bg-[#8C2D19] text-white border-[#8C2D19] shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCatActive ? 'text-white' : 'text-[#8C2D19]'}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isCatActive
                      ? 'bg-[#701E00] text-white'
                      : formed > 0
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Formation Status Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({doshaReport.totalEvaluated})
            </button>
            <button
              onClick={() => setStatusFilter('formed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'formed'
                  ? 'bg-rose-700 text-white'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Formed ({doshaReport.formedCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('cancelled_mitigated')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'cancelled_mitigated'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Cancelled / Mitigated ({doshaReport.cancelledCount + doshaReport.mitigatedCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('not_formed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'not_formed'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Not Formed ({doshaReport.notFormedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dosha, text, planet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#8C2D19]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. CURRENT CHART DOSHA RESULTS LIST */}
      {filteredDoshas.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-3 shadow-sm">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-serif font-bold text-slate-800">No Doshas Matched Filter</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try switching to another category, clearing your search query, or selecting &apos;All&apos; statuses.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-3 px-4">Dosha Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Tradition</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Conditions / Factors</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDoshas.map((dosha) => {
                  const isFormed = dosha.formationStatus === 'Formed';
                  const isCancelled = dosha.formationStatus === 'Cancelled';
                  const isMitigated = dosha.formationStatus === 'Mitigated';

                  return (
                    <tr
                      key={dosha.id}
                      onClick={() => setSelectedDoshaModal(dosha)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        isFormed ? 'bg-rose-50/30' : isCancelled ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      {/* Name & Sanskrit */}
                      <td className="py-3.5 px-4">
                        <div className="font-serif font-bold text-slate-900">
                          {dosha.name}
                        </div>
                        <div className="text-[11px] font-serif text-[#8C2D19] font-medium">
                          {dosha.sanskritName}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {dosha.category}
                        </span>
                      </td>

                      {/* Classical Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            dosha.classicalStatus === 'Directly Classical'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : dosha.classicalStatus === 'Later Classical'
                              ? 'bg-blue-100 text-blue-900'
                              : dosha.classicalStatus === 'Regional / Traditional'
                              ? 'bg-indigo-100 text-indigo-900'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {dosha.classicalStatus}
                        </span>
                      </td>

                      {/* Formation Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1.5 ${
                            isFormed
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : isCancelled
                              ? 'bg-emerald-700 text-white shadow-2xs'
                              : isMitigated
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isFormed && <AlertTriangle className="w-3 h-3" />}
                          {isCancelled && <ShieldCheck className="w-3 h-3" />}
                          {isMitigated && <Sparkles className="w-3 h-3" />}
                          <span>{dosha.formationStatus}</span>
                        </span>
                      </td>

                      {/* Conditions / Factors */}
                      <td className="py-3.5 px-4">
                        {isFormed ? (
                          <span className="text-[11px] text-rose-900 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md font-mono font-medium inline-block">
                            {dosha.conditionsMet.length} {dosha.conditionsMet.length === 1 ? 'condition met' : 'conditions met'}
                          </span>
                        ) : isCancelled || isMitigated ? (
                          <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md font-medium inline-block truncate max-w-xs" title={dosha.exceptionsApplied.join('; ')}>
                            {dosha.exceptionsApplied[0] || 'Mitigated by benefic'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">
                            0 / {dosha.evaluatedConditions.length} conditions
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoshaModal(dosha);
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-[#8C2D19] hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. DOSHA DETAILS MODAL (FULL VERIFICATION PROOF + REMEDIES) */}
      {selectedDoshaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-medium">
                    {selectedDoshaModal.category}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      selectedDoshaModal.formationStatus === 'Formed'
                        ? 'bg-rose-600 text-white'
                        : selectedDoshaModal.formationStatus === 'Cancelled'
                        ? 'bg-emerald-700 text-white'
                        : selectedDoshaModal.formationStatus === 'Mitigated'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {selectedDoshaModal.formationStatus}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      selectedDoshaModal.classicalStatus === 'Directly Classical'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    {selectedDoshaModal.classicalStatus}
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-900">
                  {selectedDoshaModal.name}
                </h3>
                <span className="text-sm font-serif font-bold text-[#8C2D19] block">
                  {selectedDoshaModal.sanskritName} ({selectedDoshaModal.transliteration})
                </span>
              </div>

              <button
                onClick={() => setSelectedDoshaModal(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORMATION CONDITION CHECKLIST */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  Formation Condition Evaluation Checklist:
                </span>
                <span className="text-[11px] font-mono text-slate-600">
                  {selectedDoshaModal.evaluatedConditions.filter((c) => c.isMet).length} / {selectedDoshaModal.evaluatedConditions.length} conditions met
                </span>
              </div>

              <div className="space-y-2">
                {selectedDoshaModal.evaluatedConditions.map((cond, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs flex flex-col gap-1 ${
                      cond.isMet
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : 'bg-slate-100/60 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold flex items-center gap-1.5">
                        {cond.isMet ? (
                          <span className="text-rose-700 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Condition {idx + 1} &mdash; Met
                          </span>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-slate-400" /> Condition {idx + 1} &mdash; Not Met
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          cond.isMet ? 'bg-rose-200 text-rose-900' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {cond.isMet ? 'Met' : 'Not Met'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-800 mt-0.5">
                      <strong>Rule:</strong> {cond.conditionLabel}
                    </p>

                    <div className="mt-1 p-2 bg-white/80 rounded border border-slate-200/60 text-[11px] font-mono text-slate-800">
                      <span className="text-slate-500 font-sans block text-[10px] uppercase font-bold">
                        Chart Factor Responsible:
                      </span>
                      {cond.chartFactor}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WHY THIS DOSHA IS FORMED / NOT FORMED */}
            <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-1.5 text-xs">
              <span className="text-[10px] text-amber-900 uppercase tracking-wider font-bold block">
                Why this Dosha is {selectedDoshaModal.formationStatus}:
              </span>
              <p className="text-amber-950 leading-relaxed font-medium">
                {selectedDoshaModal.formationReason}
              </p>
            </div>

            {/* RELEVANT CHART POSITIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                  Relevant Planetary Positions:
                </span>
                <ul className="space-y-1 text-[11px] text-slate-800 font-mono">
                  {selectedDoshaModal.relevantFactors.planets.map((p, i) => (
                    <li key={i} className="truncate">&bull; {p}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                  Relevant Houses, Signs &amp; Lordships:
                </span>
                <div className="space-y-1 text-[11px] text-slate-800">
                  <p>
                    <strong>Houses Involved:</strong>{' '}
                    {selectedDoshaModal.relevantFactors.houses.length > 0
                      ? selectedDoshaModal.relevantFactors.houses.join(', ')
                      : 'None'}
                  </p>
                  {selectedDoshaModal.relevantFactors.lordships && (
                    <p>
                      <strong>Lordships:</strong> {selectedDoshaModal.relevantFactors.lordships.join('; ')}
                    </p>
                  )}
                  {selectedDoshaModal.relevantFactors.nakshatras.length > 0 && (
                    <p>
                      <strong>Nakṣatras:</strong> {selectedDoshaModal.relevantFactors.nakshatras.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* CANCELLATION OR MITIGATION (IF APPLICABLE) */}
            {selectedDoshaModal.exceptionsApplied.length > 0 && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Classical Cancellation / Parihāra Verified:</span>
                </span>
                <ul className="space-y-1.5">
                  {selectedDoshaModal.exceptionsApplied.map((e, i) => (
                    <li key={i} className="text-emerald-950 font-medium text-xs">
                      &bull; {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CLASSICAL MEANING & PHALA */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                Classical Meaning &amp; Astrological Effects (Phala):
              </span>
              <p className="text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                {selectedDoshaModal.classicalEffects}
              </p>
            </div>

            {/* TEXTUAL REFERENCE & SANSKRIT SHLOKA */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  Classical Textual Reference
                </span>
                <span className="font-mono font-bold text-[#8C2D19]">
                  {selectedDoshaModal.primarySource.verseOrShloka}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {selectedDoshaModal.primarySource.text} &bull; {selectedDoshaModal.primarySource.chapter}
              </p>
              {selectedDoshaModal.primarySource.sanskritShloka && (
                <div className="p-3 bg-white border border-slate-200/80 rounded-lg">
                  <span className="text-[10px] text-slate-400 block mb-1">Mūla Śloka (मूल श्लोक):</span>
                  <p className="text-xs font-serif font-bold text-slate-900 leading-relaxed italic">
                    {selectedDoshaModal.primarySource.sanskritShloka}
                  </p>
                </div>
              )}
              {selectedDoshaModal.primarySource.supportingSources && selectedDoshaModal.primarySource.supportingSources.length > 0 && (
                <p className="text-[11px] text-slate-600">
                  <strong>Supporting Treatises:</strong> {selectedDoshaModal.primarySource.supportingSources.join('; ')}
                </p>
              )}
            </div>

            {/* ACTIVE REMEDIES NOTIFICATION (NO REMEDIES IN VIEW DETAILS — DIRECTS TO REMEDIES SUB-PAGE) */}
            {selectedDoshaModal.formationStatus === 'Formed' && selectedDoshaModal.remedies.length > 0 && onNavigateToRemedies && (
              <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <Flower2 className="w-4 h-4 text-[#8C2D19] shrink-0" />
                  <span className="text-amber-950 font-medium">
                    This active affliction has <strong>{selectedDoshaModal.remedies.length} verified classical remedies (Śānti &amp; Parihāra)</strong> recorded in canonical texts.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDoshaModal(null);
                    onNavigateToRemedies();
                  }}
                  className="px-3.5 py-1.5 bg-[#8C2D19] text-white rounded-lg font-bold text-xs hover:bg-[#732414] transition-all whitespace-nowrap cursor-pointer inline-flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
                >
                  <span>View in Remedies Sub-Page</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedDoshaModal(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


'use client';

/**
 * Gaṇaka — Classical Remedies (Śānti & Parihāra Śāstra) Sub-Page
 * Strictly displays verified classical remedial measures ONLY for Doshas that are present (Formed) in the chart.
 * Features:
 * - Active afflicted Doshas summary
 * - Textual remedy cards with authentic Sanskrit names, classifications, and full ritual prescriptions
 * - Timing (Muhūrta/Tithi), presiding deity, mantra/japa counts, dāna/offerings, vrata/fasting rules
 * - Direct classical verse citations and scholastic provenance
 */

import React, { useState, useMemo } from 'react';
import { JyotishaChart } from '../../lib/jyotisha/types';
import {
  EvaluatedDosha,
  VerifiedClassicalRemedy,
} from '../../lib/doshas/dosha-types';
import { evaluateAllDoshas } from '../../lib/doshas/dosha-engine';
import {
  Flower2,
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  Sparkles,
  AlertTriangle,
  Flame,
  Search,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
  Scroll,
} from 'lucide-react';

interface RemediesPanelProps {
  chart: JyotishaChart;
  onNavigateToDosha?: (doshaId: string) => void;
}

export const RemediesPanel: React.FC<RemediesPanelProps> = ({ chart, onNavigateToDosha }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [selectedDoshaFilter, setSelectedDoshaFilter] = useState<string>('all');

  // Evaluate doshas to get only ACTIVE/PRESENT ones
  const doshaReport = useMemo(() => {
    return evaluateAllDoshas(chart, {
      include2ndHouseKujaDosha: true,
    });
  }, [chart]);

  // Filter only present (Formed) doshas
  const formedDoshas = useMemo(() => {
    return doshaReport.evaluatedDoshas.filter((d) => d.formationStatus === 'Formed');
  }, [doshaReport]);

  // Aggregate all remedies belonging strictly to formed doshas
  const presentRemediesList = useMemo(() => {
    const list: Array<{ dosha: EvaluatedDosha; remedy: VerifiedClassicalRemedy }> = [];
    formedDoshas.forEach((d) => {
      if (d.remedies && d.remedies.length > 0) {
        d.remedies.forEach((rem) => {
          list.push({ dosha: d, remedy: rem });
        });
      }
    });
    return list;
  }, [formedDoshas]);

  // Filtered list based on search and filters
  const filteredRemedies = useMemo(() => {
    return presentRemediesList.filter(({ dosha, remedy }) => {
      // Classification filter
      if (selectedClassification !== 'all' && remedy.classification !== selectedClassification) {
        return false;
      }
      // Specific Dosha filter
      if (selectedDoshaFilter !== 'all' && dosha.id !== selectedDoshaFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = remedy.title?.toLowerCase().includes(q) || remedy.sanskritTitle?.toLowerCase().includes(q);
        const matchesDosha = dosha.name?.toLowerCase().includes(q) || dosha.sanskritName?.toLowerCase().includes(q);
        const matchesMethod = remedy.traditionalMethod?.toLowerCase().includes(q);
        const matchesSource = remedy.sourceText?.toLowerCase().includes(q);
        const matchesDeity = remedy.qualifications?.deity?.toLowerCase().includes(q);
        const matchesMantra = remedy.qualifications?.mantraOrJapa?.toLowerCase().includes(q);
        return matchesTitle || matchesDosha || matchesMethod || matchesSource || matchesDeity || matchesMantra;
      }
      return true;
    });
  }, [presentRemediesList, selectedClassification, selectedDoshaFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. HEADER & ACTIVE AFFLICTION SUMMARY */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#8C2D19]" />
              <h2 className="text-lg font-serif font-bold text-slate-900">
                Classical Remedies (Śānti &amp; Parihāra Śāstra)
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#8C2D19]/10 text-[#8C2D19] font-bold">
                Affliction-Specific Prescriptions
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Verified scriptural remedial measures (<em>Śānti</em>, <em>Homa</em>, <em>Dāna</em>, <em>Japa</em> &amp; <em>Vrata</em>) active exclusively for the Doshas identified in this chart.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-amber-50/80 border border-amber-200/80 rounded-xl px-4 py-2 text-xs text-amber-900 font-medium">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Strictly filtered: Remedies are displayed <strong>only if the affliction is actively formed</strong>.</span>
          </div>
        </div>

        {/* Active Doshas Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-rose-700 block uppercase tracking-wider font-bold">
              Active Formed Doshas
            </span>
            <span className="text-2xl font-mono font-bold text-rose-900 block">
              {formedDoshas.length}
            </span>
            <span className="text-[11px] text-rose-700 block">
              Afflictions present in this horoscope
            </span>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-amber-700 block uppercase tracking-wider font-bold">
              Available Textual Remedies
            </span>
            <span className="text-2xl font-mono font-bold text-amber-900 block">
              {presentRemediesList.length}
            </span>
            <span className="text-[11px] text-amber-800 block">
              From BPHS, Śaunaka Smṛti &amp; Muhūrta Cintāmaṇi
            </span>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1 shadow-2xs">
            <span className="text-[10px] text-emerald-700 block uppercase tracking-wider font-bold">
              Cancelled / Mitigated Doshas
            </span>
            <span className="text-2xl font-mono font-bold text-emerald-900 block">
              {doshaReport.cancelledCount + doshaReport.mitigatedCount}
            </span>
            <span className="text-[11px] text-emerald-700 block">
              No remedies required (Bhaṅga applied)
            </span>
          </div>
        </div>

        {/* Active Afflicted Doshas Quick Bar */}
        {formedDoshas.length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Active Afflictions Requiring Attention:
            </span>
            <div className="flex flex-wrap gap-2">
              {formedDoshas.map((d) => {
                const count = d.remedies?.length || 0;
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDoshaFilter(selectedDoshaFilter === d.id ? 'all' : d.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                      selectedDoshaFilter === d.id
                        ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                        : 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <AlertTriangle className={`w-3.5 h-3.5 ${selectedDoshaFilter === d.id ? 'text-white' : 'text-rose-600'}`} />
                    <span>{d.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        selectedDoshaFilter === d.id ? 'bg-rose-900 text-white' : 'bg-rose-200 text-rose-800'
                      }`}
                    >
                      {count} {count === 1 ? 'remedy' : 'remedies'}
                    </span>
                  </button>
                );
              })}
              {selectedDoshaFilter !== 'all' && (
                <button
                  onClick={() => setSelectedDoshaFilter('all')}
                  className="px-2.5 py-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 font-medium cursor-pointer"
                >
                  Show All Active
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. FILTER & SEARCH CONTROLS */}
      {presentRemediesList.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Classification Filters */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setSelectedClassification('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedClassification === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Classifications ({presentRemediesList.length})
              </button>
              <button
                onClick={() => setSelectedClassification('Direct textual remedy')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedClassification === 'Direct textual remedy'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Direct Textual
              </button>
              <button
                onClick={() => setSelectedClassification('Later classical/traditional remedy')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedClassification === 'Later classical/traditional remedy'
                    ? 'bg-blue-700 text-white'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                Later Classical / Traditional
              </button>
              <button
                onClick={() => setSelectedClassification('Regional/traditional practice')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedClassification === 'Regional/traditional practice'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                Regional
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search mantra, deity, ritual, text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#8C2D19]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. REMEDY LIST OR EMPTY STATE */}
      {formedDoshas.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-slate-900">
              No Active Doshas Requiring Remedies
            </h3>
            <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
              All 30+ classical afflictions evaluated against this horoscope are either <strong>Not Formed</strong> or have been completely <strong>Cancelled / Mitigated (Bhaṅga &amp; Parihāra)</strong> by benefic aspects, exalted dispositions, or classical cancellation rules.
            </p>
          </div>
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block">
              Śānti / Expiation rites are not required for this chart.
            </span>
          </div>
        </div>
      ) : filteredRemedies.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center space-y-3 shadow-sm">
          <Flower2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-serif font-bold text-slate-800">
            No Remedies Matched Filter
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search query or switching to &apos;All Classifications&apos;.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredRemedies.map(({ dosha, remedy }, index) => {
            const qualifications = remedy.qualifications;

            return (
              <div
                key={remedy.id || index}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5 hover:border-slate-300 transition-all"
              >
                {/* Header: Associated Dosha & Remedy Title */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 font-bold inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-700" />
                        <span>Affliction: {dosha.name}</span>
                      </span>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                        {dosha.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-slate-900">
                      {remedy.title}
                    </h3>
                    <span className="text-sm font-serif font-bold text-[#8C2D19] block">
                      {remedy.sanskritTitle} {remedy.transliteration ? `(${remedy.transliteration})` : ''}
                    </span>
                  </div>

                  {/* Classification Badge */}
                  <div className="shrink-0">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold inline-block border ${
                        remedy.classification === 'Direct textual remedy'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                          : remedy.classification === 'Later classical/traditional remedy'
                          ? 'bg-blue-100 text-blue-900 border-blue-200'
                          : remedy.classification === 'Regional/traditional practice'
                          ? 'bg-indigo-100 text-indigo-900 border-indigo-200'
                          : 'bg-amber-100 text-amber-900 border-amber-200'
                      }`}
                    >
                      {remedy.classification}
                    </span>
                  </div>
                </div>

                {/* Classical Purpose */}
                <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] text-amber-900 uppercase font-bold tracking-wider block">
                    Classical Expiation Purpose (Śānti Prayojana):
                  </span>
                  <p className="text-amber-950 font-medium leading-relaxed">
                    {remedy.purpose}
                  </p>
                </div>

                {/* Prescribed Traditional Method */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                    Prescribed Traditional Method (Vidhāna):
                  </span>
                  <p className="text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    {remedy.traditionalMethod}
                  </p>
                </div>

                {/* Qualifications & Ritual Prescriptions Grid */}
                {qualifications && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {qualifications.timing && (
                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">
                          Prescribed Timing / Muhūrta:
                        </span>
                        <p className="text-slate-800 font-medium">
                          {qualifications.timing}
                        </p>
                      </div>
                    )}

                    {qualifications.deity && (
                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">
                          Presiding Deity (Adhidevatā):
                        </span>
                        <p className="text-slate-800 font-medium">
                          {qualifications.deity}
                        </p>
                      </div>
                    )}

                    {qualifications.mantraOrJapa && (
                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">
                          Mantra &amp; Japa Count:
                        </span>
                        <p className="text-slate-800 font-serif font-bold text-[#8C2D19]">
                          {qualifications.mantraOrJapa}
                        </p>
                      </div>
                    )}

                    {qualifications.ritualOfferings && (
                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">
                          Offerings &amp; Dāna (द्रव्य दान):
                        </span>
                        <p className="text-slate-800 font-medium">
                          {qualifications.ritualOfferings}
                        </p>
                      </div>
                    )}

                    {qualifications.fastingOrVrata && (
                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">
                          Vrata &amp; Fasting Rules:
                        </span>
                        <p className="text-slate-800 font-medium">
                          {qualifications.fastingOrVrata}
                        </p>
                      </div>
                    )}

                    {qualifications.restrictionsOrEligibility && (
                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">
                          Eligibility / Classical Caveats:
                        </span>
                        <p className="text-slate-800 font-medium">
                          {qualifications.restrictionsOrEligibility}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Source Citation & Provenance Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#8C2D19]" />
                    <span>
                      <strong>Textual Source:</strong> {remedy.sourceText}{' '}
                      {remedy.chapterAndVerse ? `(${remedy.chapterAndVerse})` : ''}
                    </span>
                  </div>

                  {remedy.provenanceNotes && (
                    <div className="text-[10px] text-amber-800 italic bg-amber-50/70 px-2 py-0.5 rounded border border-amber-200/60">
                      {remedy.provenanceNotes}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

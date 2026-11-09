'use client';

/**
 * Gaṇaka — Classical Muhūrta Finder Subsystem
 * Objective-driven electional astrology search engine grounded in classical texts:
 * Muhūrta Cintāmaṇi, Kālāmṛta, Bṛhat Saṁhitā, and Sūrya Siddhānta.
 * 
 * Strict User-Controlled 8-Step Workflow:
 * 1. Select Objective & Deed Category
 * 2. Confirm Location Anchor & Ayanāṃśa
 * 3. Choose Search Period Scope via Horizon Calendar
 * 4. Answer Dynamic Objective-Specific Questions
 * 5. Review Search Criteria & Filters
 * 6. Execute "FIND MUHŪRTAS" Search with Real SVG Astrolabe Engine Animation
 * 7. Inspect Calculated Candidates with Shastric Purity Score Matrix & Top Sovereign Picks
 * 8. Deep Shāstric Rule Ledger & 21 Mahā-Doṣas Audit Inspection
 */

import React, { useState, useMemo } from 'react';
import { MUHURTA_OBJECTIVES, getObjectiveById } from '@/lib/muhurta/objectives-registry';
import { searchClassicalMuhurtas } from '@/lib/muhurta/engine';
import {
  MuhurtaObjectiveId,
  MuhurtaSearchQuery,
  CandidateMuhurtaPeriod,
  MuhurtaSearchResult,
} from '@/lib/muhurta/types';
import { CityLocation } from '@/lib/astronomy/coordinates';
import { AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { MuhurtaCalendarHorizonPicker } from '@/components/muhurta/MuhurtaCalendarHorizonPicker';
import { MuhurtaCalculationSvg } from '@/components/muhurta/MuhurtaCalculationSvg';
import { MuhurtaObjectiveInfo } from '@/components/muhurta/MuhurtaObjectiveInfo';
import { MuhurtaCandidateCard } from '@/components/muhurta/MuhurtaCandidateCard';
import { MuhurtaDetailInspector } from '@/components/muhurta/MuhurtaDetailInspector';
import {
  Compass,
  Sparkles,
  AlertTriangle,
  BookOpen,
  ShieldCheck,
  Clock,
  Crown,
  Trophy,
  Calendar,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { formatPlace } from '@/lib/format-place';

interface MuhurtaFinderPanelProps {
  currentDate: Date;
  selectedCity: CityLocation;
  ayanamshaType: AyanamshaType;
  onSelectResultDate?: (d: Date) => void;
}

type ClassificationFilterTab =
  | 'all'
  | 'strongly_recommended'
  | 'suitable'
  | 'conditional'
  | 'avoid';

type ObjectiveCategoryTab = 'ALL' | 'Vāstu & Gṛha' | 'Sanskāras' | 'Vāṇijya & Artha' | 'Chikitsā & Sāmānya';

export function MuhurtaFinderPanel({
  currentDate,
  selectedCity,
  ayanamshaType,
  onSelectResultDate,
}: MuhurtaFinderPanelProps) {
  // Step 1: Objective Selection
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<MuhurtaObjectiveId>('grihapravesha');
  const [categoryFilter, setCategoryFilter] = useState<ObjectiveCategoryTab>('ALL');

  // Step 3: Search Scope & Calendar Horizon Selection
  const [startDate, setStartDate] = useState<Date>(() => new Date(currentDate));
  const [endDate, setEndDate] = useState<Date>(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 14); // default to a Pakṣa (15 days)
    return d;
  });

  // Step 4: Dynamic Questionnaire Answers
  const [answers, setAnswers] = useState<Record<string, string | boolean | number>>({
    entryType: 'apurva',
    houseDirection: 'east',
    requireSthiraLagna: true,
  });

  // Step 5: Review & Filter Flags
  const [allowDayOnly, setAllowDayOnly] = useState<boolean>(true);
  const [preferredLagnasOnly, setPreferredLagnasOnly] = useState<boolean>(false);

  // Step 6 & 7: Execution State & Calculated Results
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isCalculatingWithSvg, setIsCalculatingWithSvg] = useState<boolean>(false);
  const [searchResult, setSearchResult] = useState<MuhurtaSearchResult | null>(null);
  const [statusFilter, setStatusFilter] = useState<ClassificationFilterTab>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMuhurtaPeriod | null>(null);

  const activeObjective = useMemo(() => getObjectiveById(selectedObjectiveId), [selectedObjectiveId]);

  // Filtered objectives by category
  const filteredObjectives = useMemo(() => {
    if (categoryFilter === 'ALL') return MUHURTA_OBJECTIVES;
    if (categoryFilter === 'Vāstu & Gṛha') {
      return MUHURTA_OBJECTIVES.filter((o) => o.category === 'Vāstu & Gṛha' || o.id === 'bhumi_kraya');
    }
    if (categoryFilter === 'Sanskāras') {
      return MUHURTA_OBJECTIVES.filter((o) => o.category === 'Sanskāras' || o.id === 'vivaha' || o.id === 'namakarana');
    }
    if (categoryFilter === 'Vāṇijya & Artha') {
      return MUHURTA_OBJECTIVES.filter((o) => o.category === 'Vāṇijya & Artha' || o.id === 'vanijyarambha' || o.id === 'suvarna_ratna' || o.id === 'nutana_vastra');
    }
    if (categoryFilter === 'Chikitsā & Sāmānya') {
      return MUHURTA_OBJECTIVES.filter((o) => o.category === 'Sāmānya' || o.id === 'chikitsarambha' || o.id === 'shalyakarma' || o.id === 'yatra');
    }
    return MUHURTA_OBJECTIVES;
  }, [categoryFilter]);

  // Candidates list derived from search result
  const candidates = useMemo(() => searchResult?.candidates || [], [searchResult]);
  const bestInRequestedRange = searchResult?.bestInRequestedRange || null;
  const strongerAlternative = searchResult?.strongerAlternativeOutsideRange || null;

  // Handle switching objective
  const handleSelectObjective = (id: MuhurtaObjectiveId) => {
    setSelectedObjectiveId(id);
    const obj = getObjectiveById(id);
    const initialAnswers: Record<string, string | boolean | number> = {};
    obj.dynamicQuestions.forEach((q) => {
      initialAnswers[q.id] = q.defaultValue;
    });
    setAnswers(initialAnswers);
    setSelectedCandidate(null);
  };

  const handleAnswerChange = (qId: string, val: string | boolean | number) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const handleDateRangeChange = (newStart: Date, newEnd: Date) => {
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  // Expand horizon to include stronger alternative outside range
  const handleExpandToStrongerAlternative = () => {
    if (!strongerAlternative) return;
    const newEnd = new Date(strongerAlternative.date);
    newEnd.setHours(23, 59, 59, 999);
    setEndDate(newEnd);

    // Re-run search with extended end date
    const query: MuhurtaSearchQuery = {
      objectiveId: selectedObjectiveId,
      searchScope: 'date_range',
      startDate,
      endDate: newEnd,
      answers,
      allowDayOnly,
      preferredLagnasOnly,
    };
    const result = searchClassicalMuhurtas(query, selectedCity, ayanamshaType);
    setSearchResult(result);
    const targetCandidate = result.candidates.find((c) => c.dateString === strongerAlternative.dateString) || result.bestInRequestedRange;
    setSelectedCandidate(targetCandidate || null);
  };

  // Explicit User Action to execute Search
  const handleStartSearch = () => {
    setIsCalculatingWithSvg(true);
  };

  // Called when SVG computation animation completes its mathematical stages
  const handleCalculationComplete = () => {
    try {
      const query: MuhurtaSearchQuery = {
        objectiveId: selectedObjectiveId,
        searchScope: 'date_range',
        startDate,
        endDate,
        answers,
        allowDayOnly,
        preferredLagnasOnly,
      };

      const result = searchClassicalMuhurtas(query, selectedCity, ayanamshaType);
      setSearchResult(result);
      setHasSearched(true);

      if (result.bestInRequestedRange) {
        setSelectedCandidate(result.bestInRequestedRange);
      } else if (result.candidates.length > 0) {
        setSelectedCandidate(result.candidates[0]);
      } else {
        setSelectedCandidate(null);
      }
    } catch (err) {
      console.error('Error calculating Muhurtas:', err);
    } finally {
      setIsCalculatingWithSvg(false);
    }
  };

  // Filter candidates for displayed list
  const displayedCandidates = useMemo(() => {
    switch (statusFilter) {
      case 'strongly_recommended':
        return candidates.filter((c) => c.classification === 'STRONGLY_RECOMMENDED');
      case 'suitable':
        return candidates.filter((c) => c.classification === 'SUITABLE');
      case 'conditional':
        return candidates.filter((c) => c.classification === 'CONDITIONAL');
      case 'avoid':
        return candidates.filter((c) => c.classification === 'AVOID');
      case 'all':
      default:
        return candidates;
    }
  }, [candidates, statusFilter]);

  const stronglyCount = candidates.filter((c) => c.classification === 'STRONGLY_RECOMMENDED').length;
  const suitableCount = candidates.filter((c) => c.classification === 'SUITABLE').length;
  const conditionalCount = candidates.filter((c) => c.classification === 'CONDITIONAL').length;
  const avoidCount = candidates.filter((c) => c.classification === 'AVOID').length;
  const usableTotal = stronglyCount + suitableCount + conditionalCount;

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Objective Selection & Setup Panel */}
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[#64748B] font-semibold">
                Classical Electional Astrology Subsystem
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0F172A]">
              Muhūrta Finder (सटीक मुहूर्त शोधक)
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] font-serif mt-0.5 max-w-3xl">
              Deterministic search engine verifying Pañcāṅga Shuddhi, Aṣṭama Śuddhi, Jāmitra Śuddhi, 21 Mahā-Doṣas, Horā cycles, and sovereign Yogas from <em>Muhūrta Cintāmaṇi</em>, <em>Kālāmṛta</em> &amp; <em>Bṛhat Saṁhitā</em>.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#0F172A] bg-[#F8FAFC] px-3.5 py-2 rounded-md border border-[#E2E8F0] self-start sm:self-center shadow-2xs">
            <Compass className="w-4 h-4 text-[#1D4ED8]" />
            <span>Anchor: <strong>{formatPlace(selectedCity)}</strong> ({ayanamshaType.toUpperCase()})</span>
          </div>
        </div>

        {/* Step 1: Objective Selector */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-[11px] font-bold">1</span>
              <span>Select Undertaking / Objective (उद्देश्य चयनम्)</span>
            </label>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono">
              {[
                { id: 'ALL', label: 'All Deeds' },
                { id: 'Vāstu & Gṛha', label: 'Domestic & Vāstu' },
                { id: 'Sanskāras', label: 'Milestones & Family' },
                { id: 'Vāṇijya & Artha', label: 'Trade & Gems' },
                { id: 'Chikitsā & Sāmānya', label: 'Surgery & General' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id as ObjectiveCategoryTab)}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-[#0F172A] text-white font-bold'
                      : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Objective Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {filteredObjectives.map((obj) => {
              const isSelected = obj.id === selectedObjectiveId;
              return (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => handleSelectObjective(obj.id)}
                  className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-xs'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#0F172A] hover:bg-white hover:border-[#1D4ED8]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                        isSelected ? 'text-blue-300' : 'text-[#1D4ED8]'
                      }`}
                    >
                      {obj.category}
                    </span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                  </div>
                  <span className={`text-xs sm:text-sm font-serif font-bold block ${isSelected ? 'text-white' : 'text-[#0F172A]'}`}>
                    {obj.name}
                  </span>
                  <span
                    className={`text-[11px] block mt-0.5 truncate ${
                      isSelected ? 'text-slate-300' : 'text-[#64748B]'
                    }`}
                  >
                    {obj.sanskritName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Objective Classical Parameters Card */}
        <MuhurtaObjectiveInfo objective={activeObjective} />

        {/* Step 2 & 3: Calendar Horizon Picker & Objective Dynamic Questions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-[#E2E8F0]">
          {/* Left Column: Calendar Horizon Picker */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-[11px] font-mono font-bold">2</span>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
                Choose Search Horizon &amp; Boundaries
              </h3>
            </div>

            <MuhurtaCalendarHorizonPicker
              startDate={startDate}
              endDate={endDate}
              onChangeRange={handleDateRangeChange}
            />

            {/* Daytime vs 24-Hour and Preferred Lagna Filters */}
            <div className="space-y-2 pt-2 bg-[#F8FAFC] p-3 rounded-md border border-[#E2E8F0] text-xs font-mono">
              <label className="flex items-center gap-2 text-xs font-medium text-[#0F172A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDayOnly}
                  onChange={(e) => setAllowDayOnly(e.target.checked)}
                  className="rounded border-[#E2E8F0] text-[#1D4ED8] focus:ring-[#1D4ED8]"
                />
                <span>Diurnal Windows Only (Sūryodaya to Sūryāsta - Daylight Hours)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-[#0F172A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferredLagnasOnly}
                  onChange={(e) => setPreferredLagnasOnly(e.target.checked)}
                  className="rounded border-[#E2E8F0] text-[#1D4ED8] focus:ring-[#1D4ED8]"
                />
                <span>Prioritize Primary Fixed (Sthira) or Auspicious Lagnas Only</span>
              </label>
            </div>
          </div>

          {/* Right Column: Objective-Specific Dynamic Questions */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-[11px] font-mono font-bold">3</span>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F172A]">
                Shāstric Questionnaire ({activeObjective.name})
              </h3>
            </div>

            <div className="space-y-3.5 bg-[#F8FAFC] p-4 rounded-md border border-[#E2E8F0] min-h-[220px]">
              {activeObjective.dynamicQuestions.map((q) => (
                <div key={q.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-serif font-bold text-[#0F172A]">
                      {q.label}
                    </label>
                    <span className="text-[10px] font-mono text-[#64748B]">{q.sanskritTerm}</span>
                  </div>

                  {q.type === 'select' && (
                    <select
                      value={(answers[q.id] as string) || (q.defaultValue as string)}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-[#E2E8F0] rounded-md px-3 py-2 text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] shadow-2xs"
                    >
                      {q.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {q.type === 'boolean' && (
                    <label className="flex items-center gap-2 text-xs font-medium text-[#0F172A] cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(answers[q.id] ?? q.defaultValue)}
                        onChange={(e) => handleAnswerChange(q.id, e.target.checked)}
                        className="rounded border-[#E2E8F0] text-[#1D4ED8] focus:ring-[#1D4ED8]"
                      />
                      <span>Enforce strict classical rule constraint</span>
                    </label>
                  )}

                  {q.description && (
                    <p className="text-[11px] text-[#64748B] italic font-serif">
                      {q.description}
                    </p>
                  )}
                </div>
              ))}

              {/* Shāstra Citation Badge */}
              {activeObjective.classicalSources[0] && (
                <div className="pt-2 border-t border-[#E2E8F0] flex items-center gap-2 text-[11px] font-serif text-[#64748B]">
                  <BookOpen className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0" />
                  <span>
                    Authority: <strong>{activeObjective.classicalSources[0].text}</strong> ({activeObjective.classicalSources[0].chapter})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 4: Action Execution Bar */}
        <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs font-mono text-[#64748B]">
            Scanning Horizon:{' '}
            <strong className="text-[#0F172A]">
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
              {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </strong>{' '}
            in <strong>{formatPlace(selectedCity)}</strong> ({ayanamshaType.toUpperCase()} Ayanāṃśa)
          </div>

          <button
            type="button"
            onClick={handleStartSearch}
            disabled={isCalculatingWithSvg}
            className="py-3 px-8 bg-[#1D4ED8] hover:bg-blue-800 disabled:bg-slate-300 text-white rounded-md font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-xs active:scale-[0.98]"
          >
            <Compass className="w-4 h-4 text-blue-200" />
            <span>Calculate Auspicious Windows (मुहूर्त शोधनम्)</span>
          </button>
        </div>
      </div>

      {/* SVG Real Mathematical Calculation Engine Animation */}
      {isCalculatingWithSvg && (
        <MuhurtaCalculationSvg
          objectiveName={activeObjective.name}
          cityName={selectedCity.name}
          startDate={startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          endDate={endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          onComplete={handleCalculationComplete}
        />
      )}

      {/* 2. Results Section & Constraint-First Ranked Showcase */}
      {hasSearched && !isCalculatingWithSvg && (
        <div className="space-y-6">
          {/* A. BEST IN REQUESTED HORIZON BANNER */}
          {bestInRequestedRange && (
            <div
              id="best-in-requested-range-banner"
              className={`p-5 sm:p-6 rounded-lg border shadow-xs space-y-3 transition-all ${
                bestInRequestedRange.classification === 'STRONGLY_RECOMMENDED'
                  ? 'bg-emerald-50/60 border-emerald-300'
                  : bestInRequestedRange.classification === 'SUITABLE'
                  ? 'bg-blue-50/60 border-blue-300'
                  : bestInRequestedRange.classification === 'CONDITIONAL'
                  ? 'bg-amber-50/60 border-amber-300'
                  : 'bg-slate-50 border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-md bg-white border border-[#E2E8F0] shadow-2xs">
                    <Trophy className="w-5 h-5 text-[#1D4ED8]" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider block text-[#0F172A]">
                      Top Auspicious Window in Horizon (सर्वश्रेष्ठ उपलब्ध काल)
                    </span>
                    <span className="text-[11px] text-[#64748B] font-mono">
                      Strictly prioritized within {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-3 py-1 bg-white font-bold rounded-md border border-[#E2E8F0] text-[#0F172A]">
                    {bestInRequestedRange.classificationLabel}
                  </span>
                  <span className="px-2.5 py-1 bg-[#1D4ED8] text-white font-bold rounded-md shadow-2xs">
                    Purity: {bestInRequestedRange.purityScore}/100
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-[#0F172A]">
                    {bestInRequestedRange.date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#0F172A]">
                    <span className="font-bold text-[#1D4ED8] bg-white px-2 py-0.5 rounded border border-blue-100">
                      {bestInRequestedRange.startTime} – {bestInRequestedRange.endTime} ({bestInRequestedRange.durationMinutes} min)
                    </span>
                    <span>•</span>
                    <span>Lagna: <strong>{bestInRequestedRange.lagnaName}</strong> ({bestInRequestedRange.lagnaSanskrit})</span>
                    <span>•</span>
                    <span>Tithi: <strong>{bestInRequestedRange.panchangaSnapshot.tithiName}</strong></span>
                    <span>•</span>
                    <span>Nakṣatra: <strong>{bestInRequestedRange.panchangaSnapshot.nakshatraName}</strong></span>
                  </div>
                  <p className="text-xs font-serif pt-1 leading-relaxed text-[#0F172A] max-w-3xl">
                    {bestInRequestedRange.classicalBasisSummary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCandidate(bestInRequestedRange)}
                  className="px-4 py-2.5 bg-[#0F172A] hover:bg-[#1D4ED8] text-white font-mono text-xs font-bold rounded-md transition-all cursor-pointer shrink-0 shadow-xs"
                >
                  Inspect Shāstric Ledger &rarr;
                </button>
              </div>

              {bestInRequestedRange.specialYogas.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E2E8F0]">
                  {bestInRequestedRange.specialYogas.map((yoga, yIdx) => (
                    <span
                      key={yIdx}
                      className="px-2.5 py-0.5 text-xs font-serif bg-white border border-[#E2E8F0] rounded-md flex items-center gap-1 font-semibold text-[#0F172A]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8]" />
                      <span>{yoga}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* B. STRONGER ALTERNATIVE OUTSIDE HORIZON */}
          {strongerAlternative && (
            <div
              id="stronger-lookahead-alternative-banner"
              className="p-4 sm:p-5 bg-white border border-amber-300 rounded-lg shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 bg-amber-50 rounded-md text-amber-800 shrink-0 mt-0.5 border border-amber-200">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-900">
                        Classical Lookahead Advisory (श्रेष्ठतर काल विकल्प)
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-100 text-amber-900 rounded font-bold">
                        {strongerAlternative.classificationLabel}
                      </span>
                    </div>
                    <p className="text-xs font-serif text-[#0F172A] mt-0.5">
                      While your requested horizon concludes on <strong>{endDate.toLocaleDateString()}</strong>, an authentically superior sovereign window occurs on{' '}
                      <strong>
                        {strongerAlternative.date.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </strong>{' '}
                      ({strongerAlternative.startTime} – {strongerAlternative.endTime}, {strongerAlternative.lagnaName} Lagna, Purity: {strongerAlternative.purityScore}/100).
                    </p>
                    <p className="text-[11px] font-serif text-[#64748B] italic mt-0.5">
                      {strongerAlternative.classicalBasisSummary}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExpandToStrongerAlternative}
                  className="px-4 py-2 bg-[#1D4ED8] hover:bg-blue-800 text-white font-mono text-xs font-bold rounded-md transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2 shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-200" />
                  <span>Extend Horizon to This Date</span>
                </button>
              </div>
            </div>
          )}

          {/* Results Summary Header & Classification Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <h3 className="text-base font-serif font-bold text-[#0F172A]">
                Evaluated Windows ({candidates.length} Windows Analyzed)
              </h3>
              <p className="text-xs text-[#64748B] font-serif">
                Classified deterministically by classical rules: Sovereign/Recommended, Suitable, Conditional, and Prohibited.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-bold">
                {usableTotal} Usable
              </span>
              <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-md font-bold">
                {avoidCount} Prohibited (वर्ज्य)
              </span>
            </div>
          </div>

          {/* 4-Tier Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: `All Evaluated (${candidates.length})` },
              { id: 'strongly_recommended', label: `Strongly Recommended (${stronglyCount})` },
              { id: 'suitable', label: `Suitable within Horizon (${suitableCount})` },
              { id: 'conditional', label: `Conditional / Parihāra (${conditionalCount})` },
              { id: 'avoid', label: `Prohibited / Avoid (${avoidCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as ClassificationFilterTab)}
                className={`py-1.5 px-3 rounded-md border text-xs font-mono transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#0F172A] text-white font-bold border-[#0F172A] shadow-xs'
                    : 'bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Candidate Windows List & Deep Inspection Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Candidates Table / List (Left Column) */}
            <div className="lg:col-span-7 space-y-3">
              {displayedCandidates.length === 0 ? (
                <div className="p-8 text-center bg-white border border-[#E2E8F0] rounded-lg space-y-2 shadow-xs">
                  <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto opacity-70" />
                  <h4 className="text-sm font-serif font-bold text-[#0F172A]">
                    No Windows Found in This Classification Filter
                  </h4>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto font-serif">
                    Try selecting &quot;All Evaluated&quot; or extending your search horizon using the calendar picker above.
                  </p>
                </div>
              ) : (
                displayedCandidates.map((c) => (
                  <MuhurtaCandidateCard
                    key={c.id}
                    candidate={c}
                    isSelected={selectedCandidate?.id === c.id}
                    onSelect={setSelectedCandidate}
                  />
                ))
              )}
            </div>

            {/* Candidate Deep Analytical & Source Inspection Drawer (Right Column) */}
            <div className="lg:col-span-5">
              {selectedCandidate ? (
                <MuhurtaDetailInspector
                  candidate={selectedCandidate}
                  onSelectResultDate={onSelectResultDate}
                />
              ) : (
                <div className="p-8 text-center bg-white border border-[#E2E8F0] rounded-lg space-y-2 shadow-xs">
                  <BookOpen className="w-8 h-8 text-[#64748B] mx-auto opacity-50" />
                  <h4 className="text-sm font-serif font-bold text-[#0F172A]">
                    Select a Candidate Window
                  </h4>
                  <p className="text-xs text-[#64748B] max-w-xs mx-auto font-serif">
                    Click any candidate window on the left to inspect its 21 Mahā-Doṣas audit, planetary houses, Horā cycle, and classical Shāstric citations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

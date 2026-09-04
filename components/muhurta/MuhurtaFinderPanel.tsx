'use client';

/**
 * Gaṇaka — Classical Muhūrta Finder Subsystem
 * Objective-driven electional astrology search engine grounded in classical texts:
 * Muhūrta Cintāmaṇi, Kālāmṛta, Bṛhat Saṁhitā, and Sūrya Siddhānta.
 * 
 * Strict User-Controlled 8-Step Workflow:
 * 1. Select Objective
 * 2. Confirm Location & Ayanāṃśa
 * 3. Choose Search Period Scope (Hour, Day, Range, Week, Month, Multi-Month, Year)
 * 4. Answer Dynamic Objective-Specific Questions
 * 5. Review Search Criteria & Filters
 * 6. Execute "FIND MUHŪRTAS" Search with Real SVG Astrolabe Engine Animation
 * 7. Inspect Calculated Candidates with Shastric Purity Score Matrix & Top Sovereign Picks
 * 8. Deep Shāstric Rule Ledger & House Placements Inspection
 */

import React, { useState, useMemo } from 'react';
import { MUHURTA_OBJECTIVES, getObjectiveById } from '@/lib/muhurta/objectives-registry';
import { searchClassicalMuhurtas } from '@/lib/muhurta/engine';
import {
  MuhurtaObjectiveId,
  MuhurtaSearchQuery,
  CandidateMuhurtaPeriod,
  MuhurtaSearchResult,
  SearchScopeType,
} from '@/lib/muhurta/types';
import { CityLocation } from '@/lib/astronomy/coordinates';
import { AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { MuhurtaCalendarHorizonPicker } from '@/components/muhurta/MuhurtaCalendarHorizonPicker';
import { MuhurtaCalculationSvg } from '@/components/muhurta/MuhurtaCalculationSvg';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BookOpen,
  Search,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sun,
  Flame,
  Check,
  Crown,
  Trophy,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
} from 'lucide-react';

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

export function MuhurtaFinderPanel({
  currentDate,
  selectedCity,
  ayanamshaType,
  onSelectResultDate,
}: MuhurtaFinderPanelProps) {
  // Step 1: Objective Selection
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<MuhurtaObjectiveId>('grihapravesha');

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
    <div className="space-y-6">
      {/* 1. Objective Selection & Setup Panel */}
      <div className="bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCD5C6] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#8B2F0B]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[#5C5850] font-semibold">
                Classical Electional Astrology Subsystem
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#171614]">
              Muhūrta Finder (सटीक मुहूर्त शोधक)
            </h2>
            <p className="text-xs sm:text-sm text-[#5C5850] font-serif mt-0.5">
              Deterministic search engine verifying Pañcāṅga Shuddhi, Aṣṭama Śuddhi, Lagna fortification, and sovereign Yogas from <em>Muhūrta Cintāmaṇi</em>, <em>Kālāmṛta</em> &amp; <em>Bṛhat Saṁhitā</em>.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#171614] bg-[#ECE7DC] px-3.5 py-2 rounded-xs border border-[#DCD5C6] self-start sm:self-center shadow-2xs">
            <Compass className="w-3.5 h-3.5 text-[#8B2F0B]" />
            <span>Anchor: <strong>{selectedCity.name}</strong></span>
          </div>
        </div>

        {/* Step 1: Objective Selector Carousel / Grid */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#171614] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#8B2F0B] text-white flex items-center justify-center text-[11px]">1</span>
              <span>Select Undertaking / Objective (उद्देश्य चयनम्)</span>
            </label>
            <span className="text-[11px] font-mono text-[#5C5850]">{MUHURTA_OBJECTIVES.length} Classical Deeds</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {MUHURTA_OBJECTIVES.map((obj) => {
              const isSelected = obj.id === selectedObjectiveId;
              return (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => handleSelectObjective(obj.id)}
                  className={`p-3.5 rounded-xs border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-[#171614] border-[#171614] text-[#FCFAF6] shadow-xs ring-1 ring-[#171614]'
                      : 'bg-[#F4F0E7] border-[#DCD5C6] text-[#171614] hover:bg-[#ECE7DC] hover:border-[#8B2F0B]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                        isSelected ? 'text-[#C49A45]' : 'text-[#8B2F0B]'
                      }`}
                    >
                      {obj.category}
                    </span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#C49A45]" />}
                  </div>
                  <span className={`text-xs sm:text-sm font-serif font-bold block ${isSelected ? 'text-[#FCFAF6]' : 'text-[#171614]'}`}>
                    {obj.name}
                  </span>
                  <span
                    className={`text-[11px] block mt-0.5 truncate ${
                      isSelected ? 'text-[#DCD5C6]' : 'text-[#5C5850]'
                    }`}
                  >
                    {obj.sanskritName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 & 3: Calendar Horizon Picker & Objective Dynamic Questions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-[#DCD5C6]">
          {/* Left Column: Clean Bespoke Calendar Horizon Picker */}
          <div className="lg:col-span-7 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#8B2F0B] text-white flex items-center justify-center text-[11px] font-mono font-bold">2</span>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#171614]">
                Choose Search Horizon &amp; Boundaries
              </h3>
            </div>

            <MuhurtaCalendarHorizonPicker
              startDate={startDate}
              endDate={endDate}
              onChangeRange={handleDateRangeChange}
            />

            {/* Daytime vs 24-Hour and Preferred Lagna Filters */}
            <div className="space-y-2 pt-2 bg-[#F4F0E7] p-3 border border-[#DCD5C6] rounded-xs text-xs font-mono">
              <label className="flex items-center gap-2 text-xs font-medium text-[#171614] cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDayOnly}
                  onChange={(e) => setAllowDayOnly(e.target.checked)}
                  className="rounded-xs border-[#DCD5C6] text-[#8B2F0B] focus:ring-[#8B2F0B]"
                />
                <span>Diurnal (Daytime Sūryodaya to Sūryāsta) Windows Only</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-[#171614] cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferredLagnasOnly}
                  onChange={(e) => setPreferredLagnasOnly(e.target.checked)}
                  className="rounded-xs border-[#DCD5C6] text-[#8B2F0B] focus:ring-[#8B2F0B]"
                />
                <span>Filter Strictly to Prescribed Classical Lagnas Only</span>
              </label>
            </div>
          </div>

          {/* Right Column: Objective-Specific Dynamic Questions */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#8B2F0B] text-white flex items-center justify-center text-[11px] font-mono font-bold">3</span>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#171614]">
                Objective Shāstric Questionnaire ({activeObjective.name})
              </h3>
            </div>

            <div className="space-y-3.5 bg-[#F4F0E7] p-4 rounded-xs border border-[#DCD5C6] min-h-[220px]">
              {activeObjective.dynamicQuestions.map((q) => (
                <div key={q.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-serif font-bold text-[#171614]">
                      {q.label}
                    </label>
                    <span className="text-[10px] font-mono text-[#5C5850]">{q.sanskritTerm}</span>
                  </div>

                  {q.type === 'select' && (
                    <select
                      value={(answers[q.id] as string) || (q.defaultValue as string)}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="w-full text-xs font-medium bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs px-3 py-2 text-[#171614] focus:outline-none focus:border-[#8B2F0B] shadow-2xs"
                    >
                      {q.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {q.type === 'boolean' && (
                    <label className="flex items-center gap-2 text-xs font-medium text-[#171614] cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={Boolean(answers[q.id] ?? q.defaultValue)}
                        onChange={(e) => handleAnswerChange(q.id, e.target.checked)}
                        className="rounded-xs border-[#DCD5C6] text-[#8B2F0B] focus:ring-[#8B2F0B]"
                      />
                      <span>Apply strict Shāstric rule constraint</span>
                    </label>
                  )}

                  {q.description && (
                    <p className="text-[11px] text-[#5C5850] italic font-serif">
                      {q.description}
                    </p>
                  )}
                </div>
              ))}

              {/* Shāstra Citation Badge */}
              {activeObjective.classicalSources[0] && (
                <div className="pt-2 border-t border-[#DCD5C6] flex items-center gap-2 text-[11px] font-serif text-[#5C5850]">
                  <BookOpen className="w-3.5 h-3.5 text-[#8B2F0B] shrink-0" />
                  <span>
                    Authority: <strong>{activeObjective.classicalSources[0].text}</strong> ({activeObjective.classicalSources[0].chapter})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 4: Action Execution Bar */}
        <div className="pt-4 border-t border-[#DCD5C6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs font-mono text-[#5C5850]">
            Scanning Horizon:{' '}
            <strong className="text-[#171614]">
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
              {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </strong>{' '}
            in <strong>{selectedCity.name}</strong> ({ayanamshaType.toUpperCase()} Ayanāṃśa)
          </div>

          <button
            type="button"
            onClick={handleStartSearch}
            disabled={isCalculatingWithSvg}
            className="py-3 px-8 bg-[#171614] hover:bg-[#8B2F0B] disabled:bg-[#A69F91] text-[#FCFAF6] rounded-xs font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.98]"
          >
            <Compass className="w-4 h-4 text-[#C49A45]" />
            <span>Calculate Auspicious Windows (मुहूर्त गणना)</span>
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
          {/* A. BEST IN REQUESTED HORIZON BANNER (Constraint-First Focus) */}
          {bestInRequestedRange && (
            <div
              id="best-in-requested-range-banner"
              className={`p-5 sm:p-6 rounded-xs border shadow-md space-y-3 transition-all ${
                bestInRequestedRange.classification === 'STRONGLY_RECOMMENDED'
                  ? 'bg-[#171614] text-[#FCFAF6] border-[#C49A45]'
                  : bestInRequestedRange.classification === 'SUITABLE'
                  ? 'bg-[#FCFAF6] text-[#171614] border-[#8B2F0B] ring-1 ring-[#8B2F0B]/20'
                  : bestInRequestedRange.classification === 'CONDITIONAL'
                  ? 'bg-[#FCFAF6] text-[#171614] border-[#C49A45] ring-1 ring-[#C49A45]/30'
                  : 'bg-[#F4F0E7] text-[#171614] border-[#8B2F0B]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Trophy
                    className={`w-5 h-5 ${
                      bestInRequestedRange.classification === 'STRONGLY_RECOMMENDED'
                        ? 'text-[#C49A45]'
                        : 'text-[#8B2F0B]'
                    }`}
                  />
                  <div>
                    <span
                      className={`text-xs font-mono font-bold uppercase tracking-widest block ${
                        bestInRequestedRange.classification === 'STRONGLY_RECOMMENDED'
                          ? 'text-[#C49A45]'
                          : 'text-[#8B2F0B]'
                      }`}
                    >
                      Best Window in Your Requested Horizon (सर्वश्रेष्ठ उपलब्ध काल)
                    </span>
                    <span className="text-[11px] opacity-75 font-mono">
                      Strictly prioritized within {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span
                    className={`px-3 py-1 font-bold rounded-xs ${
                      bestInRequestedRange.classification === 'STRONGLY_RECOMMENDED'
                        ? 'bg-[#C49A45] text-[#171614]'
                        : bestInRequestedRange.classification === 'SUITABLE'
                        ? 'bg-[#8B2F0B] text-[#FCFAF6]'
                        : 'bg-[#ECE7DC] text-[#8B2F0B] border border-[#C49A45]'
                    }`}
                  >
                    {bestInRequestedRange.classificationLabel}
                  </span>
                  <span className="px-2.5 py-1 bg-black/10 dark:bg-white/10 font-bold rounded-xs">
                    Purity Score: {bestInRequestedRange.purityScore}/100
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-serif font-bold">
                    {bestInRequestedRange.date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono opacity-90">
                    <span className="font-bold text-[#8B2F0B] dark:text-[#C49A45]">
                      {bestInRequestedRange.startTime} – {bestInRequestedRange.endTime} ({bestInRequestedRange.durationMinutes} min)
                    </span>
                    <span>•</span>
                    <span>Lagna: <strong>{bestInRequestedRange.lagnaName}</strong> ({bestInRequestedRange.lagnaSanskrit})</span>
                    <span>•</span>
                    <span>Tithi: <strong>{bestInRequestedRange.panchangaSnapshot.tithiName}</strong></span>
                    <span>•</span>
                    <span>Nakṣatra: <strong>{bestInRequestedRange.panchangaSnapshot.nakshatraName}</strong></span>
                  </div>
                  <p className="text-xs font-serif pt-1 leading-relaxed opacity-90 max-w-3xl">
                    {bestInRequestedRange.classicalBasisSummary}
                  </p>
                  {bestInRequestedRange.cautionSummary && (
                    <div className="flex items-center gap-1.5 text-xs text-[#8B2F0B] font-mono pt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{bestInRequestedRange.cautionSummary}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCandidate(bestInRequestedRange)}
                  className={`px-4 py-2.5 font-mono text-xs font-bold rounded-xs transition-all cursor-pointer shrink-0 shadow-sm ${
                    bestInRequestedRange.classification === 'STRONGLY_RECOMMENDED'
                      ? 'bg-[#C49A45] hover:bg-[#D97706] text-[#171614]'
                      : 'bg-[#171614] hover:bg-[#8B2F0B] text-[#FCFAF6]'
                  }`}
                >
                  Inspect Full Shāstric Ledger &rarr;
                </button>
              </div>

              {bestInRequestedRange.specialYogas.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                  {bestInRequestedRange.specialYogas.map((yoga, yIdx) => (
                    <span
                      key={yIdx}
                      className="px-2.5 py-0.5 text-xs font-serif bg-black/10 dark:bg-white/10 border border-black/15 dark:border-white/15 rounded-xs flex items-center gap-1 font-semibold"
                    >
                      <Sparkles className="w-3 h-3 text-[#C49A45]" />
                      <span>{yoga}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* B. STRONGER ALTERNATIVE OUTSIDE HORIZON (Honest Classical Lookahead) */}
          {strongerAlternative && (
            <div
              id="stronger-lookahead-alternative-banner"
              className="p-4 sm:p-5 bg-[#FCFAF6] border-2 border-dashed border-[#C49A45] rounded-xs shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 bg-[#ECE7DC] rounded-xs text-[#8B2F0B] shrink-0 mt-0.5">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8B2F0B]">
                        Classical Lookahead Advisory (श्रेष्ठतर काल विकल्प)
                      </span>
                      <span className="px-2 py-0.2 text-[10px] font-mono bg-[#171614] text-[#FCFAF6] rounded-xs font-bold">
                        {strongerAlternative.classificationLabel}
                      </span>
                    </div>
                    <p className="text-xs font-serif text-[#171614] mt-0.5">
                      While your requested horizon concludes on <strong>{endDate.toLocaleDateString()}</strong>, a substantially superior window occurs on{' '}
                      <strong>
                        {strongerAlternative.date.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </strong>{' '}
                      ({strongerAlternative.startTime} – {strongerAlternative.endTime}, {strongerAlternative.lagnaName} Lagna, Purity: {strongerAlternative.purityScore}/100).
                    </p>
                    <p className="text-[11px] font-serif text-[#5C5850] italic mt-0.5">
                      {strongerAlternative.classicalBasisSummary}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExpandToStrongerAlternative}
                  className="px-4 py-2 bg-[#8B2F0B] hover:bg-[#701E00] text-[#FCFAF6] font-mono text-xs font-bold rounded-xs transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#C49A45]" />
                  <span>Expand Horizon to Include This Date</span>
                </button>
              </div>
            </div>
          )}

          {/* Results Summary Header & 4-Tier Classification Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <h3 className="text-base font-serif font-bold text-[#171614]">
                Evaluated Classical Windows ({candidates.length} Windows in Horizon)
              </h3>
              <p className="text-xs text-[#5C5850] font-serif">
                Ranked deterministically across 4 classical tiers: Strongly Recommended, Suitable, Conditional, and Prohibited.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="px-2.5 py-1 bg-[#ECE7DC] text-[#171614] border border-[#DCD5C6] rounded-xs font-bold">
                {usableTotal} Usable
              </span>
              <span className="px-2.5 py-1 bg-[#ECE7DC] text-[#8B2F0B] border border-[#DCD5C6] rounded-xs font-bold">
                {avoidCount} Prohibited (वर्ज्य)
              </span>
            </div>
          </div>

          {/* 4-Tier Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
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
                className={`py-1.5 px-3 rounded-xs border text-xs font-mono transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#171614] text-[#FCFAF6] font-bold border-[#171614] shadow-xs'
                    : 'bg-[#FCFAF6] text-[#5C5850] border-[#DCD5C6] hover:bg-[#ECE7DC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 3. Candidate Windows List & Deep Inspection Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Candidates Table / List (Left Column) */}
            <div className="lg:col-span-7 space-y-3">
              {displayedCandidates.length === 0 ? (
                <div className="p-8 text-center bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs space-y-2 shadow-xs">
                  <AlertTriangle className="w-8 h-8 text-[#8B2F0B] mx-auto opacity-70" />
                  <h4 className="text-sm font-serif font-bold text-[#171614]">
                    No Windows Found in This Classification Filter
                  </h4>
                  <p className="text-xs text-[#5C5850] max-w-sm mx-auto font-serif">
                    Try selecting &quot;All Evaluated&quot; or extending your search horizon using the calendar picker above.
                  </p>
                </div>
              ) : (
                displayedCandidates.map((c) => {
                  const isSelected = selectedCandidate?.id === c.id;
                  const isStrong = c.classification === 'STRONGLY_RECOMMENDED';
                  const isSuitable = c.classification === 'SUITABLE';
                  const isConditional = c.classification === 'CONDITIONAL';
                  const isAvoid = c.classification === 'AVOID';

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCandidate(c)}
                      className={`p-4 sm:p-5 rounded-xs border transition-all cursor-pointer space-y-3 ${
                        isSelected
                          ? 'bg-[#FCFAF6] border-[#8B2F0B] ring-2 ring-[#8B2F0B]/30 shadow-md'
                          : isStrong
                          ? 'bg-[#FCFAF6] border-[#171614] hover:border-[#8B2F0B]'
                          : isSuitable
                          ? 'bg-[#FCFAF6] border-[#DCD5C6] hover:border-[#8B2F0B]'
                          : isConditional
                          ? 'bg-[#FCFAF6] border-[#DCD5C6] hover:border-[#C49A45]'
                          : 'bg-[#F4F0E7] border-[#DCD5C6] opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-xs flex items-center gap-1 ${
                              isStrong
                                ? 'bg-[#171614] text-[#C49A45]'
                                : isSuitable
                                ? 'bg-[#8B2F0B] text-[#FCFAF6]'
                                : isConditional
                                ? 'bg-[#ECE7DC] text-[#8B2F0B] border border-[#C49A45]'
                                : 'bg-[#5C5850] text-[#FCFAF6]'
                            }`}
                          >
                            {isStrong && <Crown className="w-3 h-3" />}
                            {isSuitable && <Check className="w-3 h-3" />}
                            {isConditional && <ShieldCheck className="w-3 h-3" />}
                            {isAvoid && <XCircle className="w-3 h-3" />}
                            <span>{c.classificationLabel}</span>
                          </span>

                          {c.isBestInRequestedRange && (
                            <span className="px-2 py-0.5 text-[10px] font-mono bg-[#C49A45] text-[#171614] font-bold rounded-xs">
                              ⭐ Best in Horizon
                            </span>
                          )}

                          <span className="text-xs sm:text-sm font-serif font-bold text-[#171614]">
                            {c.date.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#ECE7DC] text-[#171614] rounded-xs">
                            Score: {c.purityScore}/100
                          </span>
                          <div className="flex items-center gap-1 text-xs font-mono text-[#8B2F0B] font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{c.startTime} – {c.endTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Summary Limbs Strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-2 border-t border-[#DCD5C6]">
                        <div className="p-2 bg-[#F4F0E7] rounded-xs border border-[#DCD5C6]">
                          <span className="text-[10px] text-[#5C5850] block uppercase">Lagna (Ascendant)</span>
                          <span className="font-serif font-bold text-[#171614]">{c.lagnaName}</span>
                        </div>
                        <div className="p-2 bg-[#F4F0E7] rounded-xs border border-[#DCD5C6]">
                          <span className="text-[10px] text-[#5C5850] block uppercase">Tithi</span>
                          <span className="font-serif text-[#171614] truncate block">
                            {c.panchangaSnapshot.tithiName}
                          </span>
                        </div>
                        <div className="p-2 bg-[#F4F0E7] rounded-xs border border-[#DCD5C6]">
                          <span className="text-[10px] text-[#5C5850] block uppercase">Nakṣatra</span>
                          <span className="font-serif text-[#171614] truncate block">
                            {c.panchangaSnapshot.nakshatraName}
                          </span>
                        </div>
                        <div className="p-2 bg-[#F4F0E7] rounded-xs border border-[#DCD5C6]">
                          <span className="text-[10px] text-[#5C5850] block uppercase">8th House</span>
                          <span className={`font-serif font-bold truncate block ${c.ashtamaShuddhi.isClean ? 'text-[#171614]' : 'text-[#8B2F0B]'}`}>
                            {c.ashtamaShuddhi.isClean ? '✓ Pure' : '⚠ Occupied'}
                          </span>
                        </div>
                      </div>

                      {/* Classical Basis & Decision Statement */}
                      <p className="text-xs font-serif text-[#171614] leading-relaxed pt-1">
                        {c.classicalBasisSummary}
                      </p>

                      {c.cautionSummary && (
                        <p className="text-[11px] font-mono text-[#8B2F0B] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{c.cautionSummary}</span>
                        </p>
                      )}

                      {/* Special Yogas Badges */}
                      {c.specialYogas.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {c.specialYogas.map((yoga, yIdx) => (
                            <span
                              key={yIdx}
                              className="px-2 py-0.5 text-[11px] font-serif bg-[#ECE7DC] text-[#171614] border border-[#DCD5C6] rounded-xs font-semibold flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3 text-[#8B2F0B]" />
                              <span>{yoga}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Applied Parihāras (Exceptions) */}
                      {c.appliedPariharas.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {c.appliedPariharas.map((par, pIdx) => (
                            <span
                              key={pIdx}
                              className="px-2 py-0.5 text-[11px] font-serif bg-[#ECE7DC] text-[#8B2F0B] border border-[#DCD5C6] rounded-xs font-medium flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3 h-3 text-[#8B2F0B]" />
                              <span>{par.title}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Candidate Deep Analytical & Source Inspection Drawer (Right Column) */}
            <div className="lg:col-span-5">
              {selectedCandidate ? (
                <div className="bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs p-5 sm:p-6 space-y-5 sticky top-4 shadow-xs">
                  <div className="border-b border-[#DCD5C6] pb-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5850] font-bold">
                        Shāstric Verification Inspector
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-xs ${
                          selectedCandidate.classification === 'STRONGLY_RECOMMENDED'
                            ? 'bg-[#171614] text-[#C49A45]'
                            : selectedCandidate.classification === 'SUITABLE'
                            ? 'bg-[#8B2F0B] text-[#FCFAF6]'
                            : selectedCandidate.classification === 'CONDITIONAL'
                            ? 'bg-[#ECE7DC] text-[#8B2F0B] border border-[#C49A45]'
                            : 'bg-[#5C5850] text-[#FCFAF6]'
                        }`}
                      >
                        {selectedCandidate.classificationLabel}
                      </span>
                    </div>
                    <h3 className="text-lg font-serif font-bold text-[#171614]">
                      {selectedCandidate.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-mono text-[#8B2F0B] font-bold">
                        {selectedCandidate.startTime} – {selectedCandidate.endTime} ({selectedCandidate.durationMinutes} min)
                      </p>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#ECE7DC] rounded-xs text-[#171614]">
                        Lagna: {selectedCandidate.lagnaName} ({selectedCandidate.lagnaSanskrit})
                      </span>
                    </div>
                  </div>

                  {/* Summary Reason & Classical Basis */}
                  <div className="p-3.5 bg-[#F4F0E7] border border-[#DCD5C6] rounded-xs text-xs space-y-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#5C5850] block">
                      Qualification Analysis (निर्णय सारम्)
                    </span>
                    <p className="font-serif text-[#171614] text-xs leading-relaxed">
                      {selectedCandidate.classicalBasisSummary}
                    </p>
                    {selectedCandidate.cautionSummary && (
                      <p className="text-[11px] font-mono text-[#8B2F0B] pt-1 border-t border-[#DCD5C6]">
                        {selectedCandidate.cautionSummary}
                      </p>
                    )}
                  </div>

                  {/* 4-Tier Categorized Shāstric Rule Ledger */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#171614] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#8B2F0B]" />
                      <span>Categorized Shāstric Rule Ledger</span>
                    </h4>

                    {/* Tier 1: Absolute Prohibitions */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#8B2F0B] bg-[#ECE7DC] px-2.5 py-1 rounded-xs">
                        <span>1. Absolute Prohibitions (वर्ज्य / महादोष)</span>
                        <span>{selectedCandidate.ruleCategoriesBreakdown.absoluteProhibitions.length} Rules</span>
                      </div>
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {selectedCandidate.ruleCategoriesBreakdown.absoluteProhibitions.map((cond, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-xs border text-xs space-y-1 ${
                              cond.status === 'MET'
                                ? 'bg-[#FCFAF6] border-[#DCD5C6]'
                                : 'bg-[#F4F0E7] border-[#8B2F0B]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-serif font-bold text-[#171614]">
                                {cond.rule.name}
                              </span>
                              <span
                                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs ${
                                  cond.status === 'MET'
                                    ? 'bg-[#171614] text-[#FCFAF6]'
                                    : 'bg-[#8B2F0B] text-[#FCFAF6]'
                                }`}
                              >
                                {cond.status === 'MET' ? 'CLEARED' : 'VIOLATION'}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#5C5850] font-mono">
                              Observed: <strong>{cond.observedValue}</strong>
                            </p>
                            {cond.note && (
                              <p className="text-[10px] text-[#5C5850] italic font-serif">
                                {cond.note}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tier 2: Major Conditions */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#171614] bg-[#ECE7DC] px-2.5 py-1 rounded-xs">
                        <span>2. Major Required Conditions (मुख्य लक्षण)</span>
                        <span>{selectedCandidate.ruleCategoriesBreakdown.majorConditions.length} Rules</span>
                      </div>
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {selectedCandidate.ruleCategoriesBreakdown.majorConditions.map((cond, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-xs border text-xs space-y-1 ${
                              cond.status === 'MET'
                                ? 'bg-[#FCFAF6] border-[#DCD5C6]'
                                : cond.status === 'EXCEPTION_APPLIED'
                                ? 'bg-[#ECE7DC] border-[#DCD5C6]'
                                : 'bg-[#F4F0E7] border-[#8B2F0B]/40'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-serif font-bold text-[#171614]">
                                {cond.rule.name}
                              </span>
                              <span
                                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-xs ${
                                  cond.status === 'MET'
                                    ? 'bg-[#171614] text-[#FCFAF6]'
                                    : cond.status === 'EXCEPTION_APPLIED'
                                    ? 'bg-[#8B2F0B] text-[#FCFAF6]'
                                    : 'bg-[#5C5850] text-[#FCFAF6]'
                                }`}
                              >
                                {cond.status}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#5C5850] font-mono">
                              Observed: <strong>{cond.observedValue}</strong>
                            </p>
                            {cond.note && (
                              <p className="text-[10px] text-[#5C5850] italic font-serif">
                                {cond.note}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tier 3 & 4: Supporting Auspicious & Preferences */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#5C5850] bg-[#ECE7DC] px-2.5 py-1 rounded-xs">
                        <span>3 &amp; 4. Supporting &amp; Preferences (सहायक एवं गौण)</span>
                        <span>
                          {selectedCandidate.ruleCategoriesBreakdown.supportingConditions.length +
                            selectedCandidate.ruleCategoriesBreakdown.secondaryPreferences.length}{' '}
                          Rules
                        </span>
                      </div>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {[
                          ...selectedCandidate.ruleCategoriesBreakdown.supportingConditions,
                          ...selectedCandidate.ruleCategoriesBreakdown.secondaryPreferences,
                        ].map((cond, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-xs border border-[#DCD5C6] bg-[#FCFAF6] text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-serif font-medium text-[#171614]">
                                {cond.rule.name}
                              </span>
                              <span className="text-[9px] font-mono text-[#5C5850]">
                                {cond.status === 'MET' ? '✓ Satisfied' : '○ Neutral'}
                              </span>
                            </div>
                            <p className="text-[10px] text-[#5C5850] font-mono">
                              {cond.observedValue}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Classical Text Citations */}
                  {selectedCandidate.citations.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[#DCD5C6]">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#171614] flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#8B2F0B]" />
                        <span>Classical Shāstric Authorities</span>
                      </h4>

                      <div className="space-y-2">
                        {selectedCandidate.citations.map((c, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-[#F4F0E7] border border-[#DCD5C6] rounded-xs text-xs space-y-1"
                          >
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="font-serif font-bold text-[#8B2F0B] block">
                                {c.text} ({c.chapter} {c.shlokaRange})
                              </span>
                              <span className="text-[10px] font-serif text-[#5C5850]">
                                {c.sanskritTitle}
                              </span>
                            </div>
                            {c.sanskritQuote && (
                              <p className="text-[11px] font-serif text-[#8B2F0B] italic bg-[#ECE7DC] p-1.5 rounded-xs border border-[#DCD5C6]">
                                {c.sanskritQuote}
                              </p>
                            )}
                            <p className="text-[11px] font-serif text-[#171614] leading-relaxed">
                              {c.englishTranslation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Jump to Daily Date Button */}
                  {onSelectResultDate && (
                    <button
                      type="button"
                      onClick={() => onSelectResultDate(selectedCandidate.date)}
                      className="w-full py-2.5 bg-[#8B2F0B] hover:bg-[#701E00] text-[#FCFAF6] rounded-xs font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <span>Open Date in Daily Pañcāṅga</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-[#FCFAF6] border border-[#DCD5C6] rounded-xs space-y-2 shadow-xs">
                  <BookOpen className="w-8 h-8 text-[#5C5850] mx-auto opacity-50" />
                  <h4 className="text-sm font-serif font-bold text-[#171614]">
                    Select a Candidate Window
                  </h4>
                  <p className="text-xs text-[#5C5850] max-w-xs mx-auto font-serif">
                    Click any candidate window on the left to inspect its classical rule verification, planetary house positions, and shāstric citations.
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

'use client';

/**
 * Gaṇaka — Classical Yoga Results & Advanced Analysis Interface (Phase 4)
 * 
 * ARCHITECTURAL LAYERS:
 * 1. Normal Mode (Phase 3 Core):
 *    - Answers: "Which classical Yogas are actually formed in this chart?"
 *    - Minimal compact cards: Name, Sanskrit name, Category, FORMED badge, "View details →".
 *    - Unformed Yogas are strictly hidden. Empty categories omitted.
 * 
 * 2. Advanced Mode (Phase 4 Advanced Analysis):
 *    - Answers: "How are formed Yogas qualified, when do they activate, how do they interact, and where else are they formed in divisional charts?"
 *    - Section 1: Activation / Daśā (Sourced classical timing, no invented dates/states).
 *    - Section 2: Yoga Strength & Qualification (Qualitative planetary dignities, Shadbala, combustion, Bhanga; zero fake scores).
 *    - Section 3: Conflicting / Overlapping Results (Classical precedence/cancellation or explicit textual uncertainty).
 *    - Section 4: Varga-specific Yogas (Divisional chart formations with clear context labeling).
 */

import React, { useState, useMemo, useEffect } from 'react';
import { DetectedYoga, JyotishaChart, VargaId } from '../../lib/jyotisha/types';
import {
  Search,
  X,
  BookOpen,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  GitFork,
  Layers,
  Scale,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import {
  evaluateYogaActivation,
  evaluateYogaQualification,
  evaluateYogaInteractions,
  detectVargaYogas,
  getCrossVargaSummary,
  CrossVargaRecurrence,
  YogaActivationReport,
  YogaQualificationReport,
  YogaInteractionReport,
} from '../../lib/yogas/yoga-engine';

interface YogasPanelProps {
  yogas: DetectedYoga[];
  chart?: JyotishaChart;
}

export const YogasPanel: React.FC<YogasPanelProps> = ({ yogas, chart }) => {
  // Mode selection: 'normal' (Natal Formations) vs 'advanced' (Advanced Analysis)
  const [mode, setMode] = useState<'normal' | 'advanced'>('normal');

  // Advanced sub-view tabs
  const [advancedTab, setAdvancedTab] = useState<'activation' | 'qualification' | 'conflicts' | 'vargas'>('activation');

  // Selected Varga for Section 4
  const [selectedVarga, setSelectedVarga] = useState<VargaId>('D9');
  const [vargaSubView, setVargaSubView] = useState<'single' | 'cross'>('single');

  // Search and category filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal inspection state
  const [modalYoga, setModalYoga] = useState<{
    yoga: DetectedYoga;
    vargaContext?: { id: VargaId; name: string };
  } | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalYoga(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Formed yogas present in natal chart (strictly filtered by deterministic engine)
  const formedNatalYogas = useMemo(() => yogas || [], [yogas]);

  // Extract unique categories that actually have formed yogas in this natal chart
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    formedNatalYogas.forEach((y) => {
      if (y.category) cats.add(y.category);
    });
    return Array.from(cats);
  }, [formedNatalYogas]);

  // Filter formed natal yogas based on search and selected category
  const filteredNatalYogas = useMemo(() => {
    return formedNatalYogas.filter((y) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        y.name.toLowerCase().includes(q) ||
        (y.sanskritName && y.sanskritName.toLowerCase().includes(q)) ||
        (y.effects && y.effects.toLowerCase().includes(q));
      const matchesCategory = selectedCategory === 'All' || y.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [formedNatalYogas, searchQuery, selectedCategory]);

  // Group filtered natal formed yogas by their classical category (empty categories omitted)
  const groupedNatalYogas = useMemo(() => {
    const groups: Record<string, DetectedYoga[]> = {};
    filteredNatalYogas.forEach((y) => {
      const cat = y.category || 'Special';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(y);
    });
    return groups;
  }, [filteredNatalYogas]);

  // Advanced Analysis: Interactions and Conflicts
  const interactions = useMemo(() => {
    if (!chart || formedNatalYogas.length < 2) return [];
    return evaluateYogaInteractions(formedNatalYogas, chart);
  }, [formedNatalYogas, chart]);

  // Advanced Analysis: Varga Formations
  const vargaResult = useMemo(() => {
    if (!chart) return { vargaId: selectedVarga, vargaName: selectedVarga, vargaSignificance: '', formedYogas: [] };
    return detectVargaYogas(selectedVarga, chart);
  }, [selectedVarga, chart]);

  // Advanced Analysis: Cross-Varga Recurrence
  const crossVargaRecurrences = useMemo(() => {
    if (!chart) return [];
    return getCrossVargaSummary(chart);
  }, [chart]);

  // List of available Vargas in the chart
  const vargaList: Array<{ id: VargaId; label: string; name: string }> = [
    { id: 'D9', label: 'D9 Navāṃśa', name: 'Navāṃśa (Spouse & Dharma)' },
    { id: 'D10', label: 'D10 Daśāṃśa', name: 'Daśāṃśa (Profession & Career)' },
    { id: 'D1', label: 'D1 Rāśi', name: 'Rāśi (Natal Foundation)' },
    { id: 'D2', label: 'D2 Horā', name: 'Horā (Wealth & Resources)' },
    { id: 'D3', label: 'D3 Drekkāṇa', name: 'Drekkāṇa (Siblings & Courage)' },
    { id: 'D4', label: 'D4 Caturthāṃśa', name: 'Caturthāṃśa (Fixed Assets & Fortune)' },
    { id: 'D7', label: 'D7 Saptāṃśa', name: 'Saptāṃśa (Progeny & Dynastic Line)' },
    { id: 'D12', label: 'D12 Dvādaśāṃśa', name: 'Dvādaśāṃśa (Parents & Ancestry)' },
    { id: 'D16', label: 'D16 Ṣoḍaśāṃśa', name: 'Ṣoḍaśāṃśa (Vehicles & Pleasures)' },
    { id: 'D20', label: 'D20 Viṃśāṃśa', name: 'Viṃśāṃśa (Spiritual Practice & Upāsana)' },
    { id: 'D24', label: 'D24 Caturviṃśāṃśa', name: 'Caturviṃśāṃśa (Higher Knowledge & Learning)' },
    { id: 'D27', label: 'D27 Saptaviṃśāṃśa', name: 'Saptaviṃśāṃśa (Strengths & Vulnerabilities)' },
    { id: 'D30', label: 'D30 Trimśāṃśa', name: 'Trimśāṃśa (Misfortunes & Arishta)' },
    { id: 'D40', label: 'D40 Khavedāṃśa', name: 'Khavedāṃśa (Auspicious Effects)' },
    { id: 'D45', label: 'D45 Akṣavedāṃśa', name: 'Akṣavedāṃśa (General Well-being)' },
    { id: 'D60', label: 'D60 Ṣaṣṭiāṃśa', name: 'Ṣaṣṭiāṃśa (Past Karma & Fine Destiny)' },
  ];

  return (
    <div className="bg-white border border-[#E8E2D6] rounded-xl p-6 shadow-xs space-y-6">
      {/* Top Header & Mode Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#F0ECE1] pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-serif font-bold text-[#2A241A]">
              Classical Yogas
            </h3>
            <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-full bg-[#FAF5EE] text-[#8B2500] border border-[#E8DFC8]">
              {formedNatalYogas.length} Natal Formations
            </span>
          </div>
          <p className="text-xs text-[#7A7060] mt-0.5">
            Deterministic classical Horā combinations evaluated against planetary positions and dignities
          </p>
        </div>

        {/* Mode Toggle & Search Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Main Mode Toggle: Normal vs Advanced Mode */}
          <div className="flex items-center p-0.5 bg-[#F5F0E6] border border-[#E6DEC9] rounded-lg text-xs">
            <button
              onClick={() => setMode('normal')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                mode === 'normal'
                  ? 'bg-white text-[#2A241A] shadow-xs font-semibold'
                  : 'text-[#6A5E4E] hover:text-[#2A241A]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Normal Mode</span>
            </button>
            <button
              onClick={() => setMode('advanced')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                mode === 'advanced'
                  ? 'bg-white text-[#8B2500] shadow-xs font-semibold'
                  : 'text-[#6A5E4E] hover:text-[#2A241A]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8B2500]" />
              <span>Advanced Mode</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9A8D7A]" />
            <input
              type="text"
              placeholder="Search yogas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#FAF8F5] border border-[#E0D7C6] rounded-lg text-xs text-[#2A241A] placeholder-[#9A8D7A] focus:outline-none focus:border-[#8B2500] w-40 sm:w-48"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9A8D7A] hover:text-[#2A241A]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. NORMAL MODE (PRIMARY VIEW — PHASE 3 PRESERVED STRICTLY)                 */}
      {/* ========================================================================= */}
      {mode === 'normal' && (
        <div className="space-y-6">
          {/* Category Filter Pills (Only categories with formed yogas in this chart) */}
          {availableCategories.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-[#8B2500] text-white font-semibold shadow-xs'
                    : 'bg-[#FAF8F5] text-[#6A5E4E] border border-[#EAE3D5] hover:bg-[#F2ECE0]'
                }`}
              >
                All ({formedNatalYogas.length})
              </button>
              {availableCategories.map((cat) => {
                const count = formedNatalYogas.filter((y) => y.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 text-xs rounded-full transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#8B2500] text-white font-semibold shadow-xs'
                        : 'bg-[#FAF8F5] text-[#6A5E4E] border border-[#EAE3D5] hover:bg-[#F2ECE0]'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Grouped Category Sections (Empty categories are strictly omitted) */}
          {Object.keys(groupedNatalYogas).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedNatalYogas).map(([category, items]) => (
                <div key={category} className="space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-1.5">
                    <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#73634F]">
                      {category} Yogas ({items.length})
                    </h4>
                  </div>

                  {/* Minimal Yoga Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((y) => (
                      <div
                        key={y.id}
                        className="border border-[#EAE3D5] rounded-xl p-4 bg-[#FCFAF7] hover:border-[#D6C7AE] hover:shadow-xs transition-all flex flex-col justify-between gap-3 text-xs"
                      >
                        {/* Title & Status */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A7C68]">
                              {y.category}
                            </span>
                            <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px]">
                              <ShieldCheck className="w-2.5 h-2.5 text-emerald-700" />
                              FORMED
                            </span>
                          </div>
                          <h5 className="font-serif font-bold text-sm text-[#2A241A] leading-snug">
                            {y.name}
                          </h5>
                          {y.sanskritName && (
                            <p className="text-xs text-[#8B2500] font-serif">
                              {y.sanskritName}
                            </p>
                          )}
                        </div>

                        {/* View Details Action */}
                        <div className="pt-2 border-t border-[#F2ECE0] flex items-center justify-end">
                          <button
                            onClick={() => setModalYoga({ yoga: y })}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B2500] hover:text-[#5E1800] transition-colors py-0.5"
                          >
                            <span>View details</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-[#8A7D6B] border border-dashed border-[#E0D7C6] rounded-xl bg-[#FAF8F5] p-6">
              {searchQuery
                ? `No formed yogas match "${searchQuery}" in category ${selectedCategory}.`
                : 'No classical yogas formed under the selected filter.'}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ADVANCED MODE (PHASE 4: ADVANCED YOGA ANALYSIS)                         */}
      {/* ========================================================================= */}
      {mode === 'advanced' && (
        <div className="space-y-6">
          {/* Advanced Section Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-[#F0ECE1] pb-3">
            <button
              onClick={() => setAdvancedTab('activation')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                advancedTab === 'activation'
                  ? 'bg-[#2A241A] text-white shadow-xs font-semibold'
                  : 'bg-[#FAF8F5] text-[#6A5E4E] border border-[#EAE3D5] hover:bg-[#F2ECE0]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Section 1: Activation / Daśā</span>
            </button>
            <button
              onClick={() => setAdvancedTab('qualification')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                advancedTab === 'qualification'
                  ? 'bg-[#2A241A] text-white shadow-xs font-semibold'
                  : 'bg-[#FAF8F5] text-[#6A5E4E] border border-[#EAE3D5] hover:bg-[#F2ECE0]'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-emerald-500" />
              <span>Section 2: Strength & Qualification</span>
            </button>
            <button
              onClick={() => setAdvancedTab('conflicts')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                advancedTab === 'conflicts'
                  ? 'bg-[#2A241A] text-white shadow-xs font-semibold'
                  : 'bg-[#FAF8F5] text-[#6A5E4E] border border-[#EAE3D5] hover:bg-[#F2ECE0]'
              }`}
            >
              <GitFork className="w-3.5 h-3.5 text-blue-500" />
              <span>Section 3: Interactions & Conflicts ({interactions.length})</span>
            </button>
            <button
              onClick={() => setAdvancedTab('vargas')}
              className={`px-3.5 py-1.5 text-xs rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                advancedTab === 'vargas'
                  ? 'bg-[#2A241A] text-white shadow-xs font-semibold'
                  : 'bg-[#FAF8F5] text-[#6A5E4E] border border-[#EAE3D5] hover:bg-[#F2ECE0]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-500" />
              <span>Section 4: Varga-Specific Yogas</span>
            </button>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* SECTION 1: ACTIVATION / DAŚĀ                                          */}
          {/* --------------------------------------------------------------------- */}
          {advancedTab === 'activation' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#FAF8F5] border border-[#EAE3D5] rounded-lg text-xs text-[#5C4E3D] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#2A241A]">
                  <Clock className="w-3.5 h-3.5 text-[#8B2500]" />
                  <span>Classical Daśā Activation Analysis</span>
                </div>
                <p className="text-[11px] text-[#7A6E5D] leading-relaxed">
                  Natal formation establishes foundational presence; temporal manifestation depends strictly on canonical Daśā activation rules. Unspecified timing is recorded as unestablished without interpolation.
                </p>
              </div>

              {formedNatalYogas.length > 0 ? (
                <div className="space-y-3">
                  {formedNatalYogas.map((y) => {
                    const activation = chart ? evaluateYogaActivation(y, chart) : null;

                    return (
                      <div
                        key={y.id}
                        className="border border-[#EAE3D5] rounded-xl p-4 bg-[#FCFAF7] space-y-3 text-xs"
                      >
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#F0ECE1] pb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif font-bold text-sm text-[#2A241A]">{y.name}</h4>
                              <span className="text-[10px] text-[#8B2500] font-serif">{y.sanskritName}</span>
                            </div>
                            <span className="text-[10px] text-[#8A7C68] uppercase tracking-wider font-semibold">
                              {y.category} • FORMED
                            </span>
                          </div>
                          <button
                            onClick={() => setModalYoga({ yoga: y })}
                            className="inline-flex items-center gap-1 text-xs text-[#8B2500] hover:text-[#5E1800] font-medium"
                          >
                            <span>View analysis</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Activation Periods */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#8A7C68]">
                            <Clock className="w-3 h-3 text-[#8B2500]" />
                            <span>Activation / Relevant Period:</span>
                          </div>

                          {activation ? (
                            activation.isEstablished ? (
                              <div className="space-y-1.5 pl-1">
                                {activation.calculatedPeriods.length > 0 ? (
                                  activation.calculatedPeriods.map((p, pIdx) => (
                                    <div
                                      key={pIdx}
                                      className={`p-2 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 ${
                                        p.isCurrent
                                          ? 'bg-amber-50/90 border-amber-300 text-[#733E0A]'
                                          : 'bg-white border-[#E8E1D3] text-[#4A3E31]'
                                      }`}
                                    >
                                      <span className="font-medium">{p.label}</span>
                                      <div className="flex items-center gap-2">
                                        {p.startDate && p.endDate && (
                                          <span className="font-mono text-[10px] text-[#7A6E5D]">
                                            {p.startDate} → {p.endDate}
                                          </span>
                                        )}
                                        {p.isCurrent && (
                                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                                            Current
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-2 rounded-lg bg-white border border-[#E8E1D3] text-xs font-medium text-[#4A3E31]">
                                    {activation.relevantPeriodsText}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EBE4D7] text-xs text-[#7A7060] italic pl-2.5">
                                Classical activation rule not specified in the available source.
                              </div>
                            )
                          ) : (
                            <div className="text-xs text-[#7A7060] italic">
                              Calculated Daśā data not available.
                            </div>
                          )}
                        </div>

                        {/* Basis & Source */}
                        {activation && (
                          <div className="pt-2 border-t border-[#F0ECE1] grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-[#6A5D4B]">
                            <div>
                              <span className="font-semibold text-[#4A3E31]">Basis: </span>
                              <span>{activation.basis}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3 text-[#8B2500] shrink-0" />
                              <span>
                                <strong className="text-[#4A3E31]">Source: </strong>
                                {activation.source}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-[#8A7D6B]">
                  No formed yogas available for activation analysis.
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* SECTION 2: YOGA STRENGTH & QUALIFICATION                              */}
          {/* --------------------------------------------------------------------- */}
          {advancedTab === 'qualification' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#FAF8F5] border border-[#EAE3D5] rounded-lg text-xs text-[#5C4E3D] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#2A241A]">
                  <Scale className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Classical Strength & Qualitative Evaluation</span>
                </div>
                <p className="text-[11px] text-[#7A6E5D] leading-relaxed">
                  Evaluated strictly on participating Grahas&apos; classical dignities, combustion, retrogression, Shadbala ratios, and canonical Bhaṅga modifications. Zero arbitrary scores or artificial percentage weights.
                </p>
              </div>

              {chart && formedNatalYogas.length > 0 ? (
                <div className="space-y-3">
                  {formedNatalYogas.map((y) => {
                    const qual = evaluateYogaQualification(y, chart);

                    return (
                      <div
                        key={y.id}
                        className="border border-[#EAE3D5] rounded-xl p-4 bg-[#FCFAF7] space-y-3 text-xs"
                      >
                        {/* Card Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#F0ECE1] pb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif font-bold text-sm text-[#2A241A]">{y.name}</h4>
                              <span className="text-[10px] text-[#8B2500] font-serif">{y.sanskritName}</span>
                            </div>
                            <span className="text-[10px] text-[#8A7C68] uppercase tracking-wider font-semibold">
                              {y.category} • FORMED
                            </span>
                          </div>
                          <button
                            onClick={() => setModalYoga({ yoga: y })}
                            className="inline-flex items-center gap-1 text-xs text-[#8B2500] hover:text-[#5E1800] font-medium"
                          >
                            <span>View qualification</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Participating Grahas Dignity Breakdown */}
                        <div className="space-y-2">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A7C68]">
                            Participating Graha Qualifications
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {qual.participatingGrahas.map((g, gIdx) => (
                              <div
                                key={gIdx}
                                className="p-2.5 rounded-lg bg-white border border-[#E8DFC8] space-y-1 text-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-serif font-bold text-[#2A241A] uppercase text-[11px]">
                                    {g.planetName}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                                      g.dignity === 'Exalted' || g.dignity === 'Moolatrikona' || g.dignity === 'Own Sign'
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                        : g.dignity === 'Debilitated'
                                        ? 'bg-red-50 text-red-800 border border-red-200'
                                        : 'bg-[#F5EFE6] text-[#6A5D4B] border border-[#E2DACB]'
                                    }`}
                                  >
                                    {g.dignity}
                                  </span>
                                </div>
                                <div className="text-[10px] text-[#7A6E5D]">
                                  {g.rashiName} (House {g.house})
                                </div>
                                <div className="space-y-0.5 pt-1 text-[10px] text-[#5C4E3D]">
                                  {g.qualitativeNotes.map((note, nIdx) => (
                                    <div key={nIdx} className="leading-tight">
                                      • {note}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bhanga Presence if applicable */}
                        {qual.bhangaPresent && qual.bhangaDescription && (
                          <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-300 text-xs space-y-1 text-[#733E0A]">
                            <div className="font-bold flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-700" />
                              <span>Classical Bhaṅga / Modification Present</span>
                            </div>
                            <p className="text-[11px] leading-relaxed">{qual.bhangaDescription}</p>
                            {qual.bhangaSource && (
                              <div className="text-[10px] text-[#8C531B] italic">
                                Source: {qual.bhangaSource}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Overall Assessment Summary */}
                        <div className="pt-2 border-t border-[#F0ECE1] text-[11px] text-[#6A5D4B] space-y-0.5">
                          <span className="font-semibold text-[#4A3E31]">Canonical Assessment: </span>
                          <span>{qual.overallQualification.join(' ')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-[#8A7D6B]">
                  No formed yogas available for qualification analysis.
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* SECTION 3: CONFLICTING / OVERLAPPING RESULTS                          */}
          {/* --------------------------------------------------------------------- */}
          {advancedTab === 'conflicts' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#FAF8F5] border border-[#EAE3D5] rounded-lg text-xs text-[#5C4E3D] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#2A241A]">
                  <GitFork className="w-3.5 h-3.5 text-blue-800" />
                  <span>Conflicting & Overlapping Combinations Analysis</span>
                </div>
                <p className="text-[11px] text-[#7A6E5D] leading-relaxed">
                  Charts frequently contain both auspicious and adverse formations. Canonical texts provide specific resolution principles (Bhaṅga, cancellation, and temporal Daśā separation). Where no classical precedence exists, textual uncertainty is explicitly preserved.
                </p>
              </div>

              {interactions.length > 0 ? (
                <div className="space-y-3">
                  {interactions.map((inter, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-xl p-4 space-y-3 text-xs ${
                        inter.classicalPrecedenceEstablished
                          ? 'bg-[#FCFAF7] border-[#E8DFC8]'
                          : 'bg-[#FAF8F5] border-[#E2DACB]'
                      }`}
                    >
                      {/* Pair Title */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0ECE1] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-sm text-[#2A241A]">
                            {inter.yogaA.name}
                          </span>
                          <span className="text-[10px] text-[#8A7C68] font-bold">vs</span>
                          <span className="font-serif font-bold text-sm text-[#2A241A]">
                            {inter.yogaB.name}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                            inter.interactionType === 'Cancellation'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : inter.interactionType === 'Temporal Separation'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {inter.interactionType}
                        </span>
                      </div>

                      {/* Classical Rule / Status */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A7C68]">
                          {inter.classicalPrecedenceEstablished
                            ? 'Classical Precedence Principle'
                            : 'Textual Precedence Status'}
                        </div>
                        <p className="text-xs text-[#3E3427] font-medium leading-relaxed">
                          {inter.classicalRule}
                        </p>
                      </div>

                      {/* Result Description */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A7C68]">
                          Analytical Result
                        </div>
                        <p className="text-xs text-[#524634] leading-relaxed p-2.5 rounded-lg bg-white border border-[#EAE3D5]">
                          {inter.resultDescription}
                        </p>
                      </div>

                      {/* Source Citation */}
                      {inter.sourceText && (
                        <div className="flex items-center gap-1 text-[10px] text-[#7A6E5D] pt-1 border-t border-[#F0ECE1]">
                          <BookOpen className="w-3 h-3 text-[#8B2500]" />
                          <span>Source: {inter.sourceText}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-[#8A7D6B] border border-dashed border-[#E0D7C6] rounded-xl bg-[#FAF8F5] p-6">
                  No direct conflicting or overlapping classical formations identified among the formed Yogas in this chart.
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------------- */}
          {/* SECTION 4: VARGA-SPECIFIC YOGAS                                       */}
          {/* --------------------------------------------------------------------- */}
          {advancedTab === 'vargas' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#FAF8F5] border border-[#EAE3D5] rounded-lg text-xs text-[#5C4E3D] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#2A241A]">
                  <Layers className="w-3.5 h-3.5 text-purple-800" />
                  <span>Divisional Chart (Ṣoḍaśavarga) Yoga Formations</span>
                </div>
                <p className="text-[11px] text-[#7A6E5D] leading-relaxed">
                  Evaluates whether classical yoga definitions are mathematically formed within specific harmonic divisional charts. Formations in a Varga remain distinct from the D1 natal chart.
                </p>
              </div>

              {/* Sub-view switcher: Specific Varga vs Cross-Varga Recurrence */}
              <div className="flex items-center gap-2 border-b border-[#F0ECE1] pb-2">
                <button
                  onClick={() => setVargaSubView('single')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    vargaSubView === 'single'
                      ? 'bg-[#2A241A] text-white font-semibold shadow-xs'
                      : 'bg-[#FAF8F5] text-[#6A5E4E] border border-[#EAE3D5] hover:bg-[#F2ECE0]'
                  }`}
                >
                  By Specific Divisional Chart
                </button>
                <button
                  onClick={() => setVargaSubView('cross')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    vargaSubView === 'cross'
                      ? 'bg-[#2A241A] text-white font-semibold shadow-xs'
                      : 'bg-[#FAF8F5] text-[#6A5E4E] border border-[#EAE3D5] hover:bg-[#F2ECE0]'
                  }`}
                >
                  Cross-Varga Recurrence Matrix
                </button>
              </div>

              {vargaSubView === 'single' ? (
                <div className="space-y-4">
                  {/* Varga Selector Pills */}
                  <div className="flex flex-wrap gap-1.5 pb-2">
                    {vargaList.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVarga(v.id)}
                        className={`px-3 py-1 text-xs rounded-lg transition-all ${
                          selectedVarga === v.id
                            ? 'bg-[#8B2500] text-white font-semibold shadow-xs'
                            : 'bg-[#FAF8F5] text-[#6A5E4E] border border-[#EAE3D5] hover:bg-[#F2ECE0]'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>

                  {/* Selected Varga Context Banner */}
                  <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E8DFC8] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A7C68]">
                        Selected Divisional Chart
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[#2A241A]">
                        {vargaResult.vargaName} ({vargaResult.vargaId})
                      </h4>
                      <p className="text-[11px] text-[#7A6E5D]">{vargaResult.vargaSignificance}</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-white border border-[#E0D5C1] text-[#8B2500] shrink-0">
                      {vargaResult.formedYogas.length} Formations in {vargaResult.vargaId}
                    </span>
                  </div>

                  {/* Formed Yogas in Selected Varga */}
                  {vargaResult.formedYogas.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {vargaResult.formedYogas.map((y) => (
                        <div
                          key={y.id}
                          className="border border-[#EAE3D5] rounded-xl p-4 bg-[#FCFAF7] hover:border-[#D6C7AE] hover:shadow-xs transition-all flex flex-col justify-between gap-3 text-xs"
                        >
                          {/* Header */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A7C68]">
                                {y.category} • {vargaResult.vargaId}
                              </span>
                              <span className="inline-flex items-center gap-1 text-purple-800 font-semibold px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-[10px]">
                                <ShieldCheck className="w-2.5 h-2.5 text-purple-700" />
                                FORMED
                              </span>
                            </div>
                            <h5 className="font-serif font-bold text-sm text-[#2A241A] leading-snug">
                              {y.name}
                            </h5>
                            {y.sanskritName && (
                              <p className="text-xs text-[#8B2500] font-serif">
                                {y.sanskritName}
                              </p>
                            )}
                          </div>

                          {/* Action */}
                          <div className="pt-2 border-t border-[#F2ECE0] flex items-center justify-end">
                            <button
                              onClick={() =>
                                setModalYoga({
                                  yoga: y,
                                  vargaContext: { id: vargaResult.vargaId, name: vargaResult.vargaName },
                                })
                              }
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#8B2500] hover:text-[#5E1800] transition-colors py-0.5"
                            >
                              <span>View details</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-xs text-[#8A7D6B] border border-dashed border-[#E0D7C6] rounded-xl bg-[#FAF8F5] p-6">
                      No classical Yogas formed in {vargaResult.vargaName} ({vargaResult.vargaId}).
                    </div>
                  )}
                </div>
              ) : (
                /* Cross-Varga Recurrence View */
                <div className="space-y-3">
                  <div className="p-3 bg-[#FAF6EE] border border-[#E8DFC8] rounded-lg text-xs text-[#5C4E3D] space-y-1">
                    <span className="font-bold text-[#2A241A]">Cross-Divisional Harmonic Recurrence</span>
                    <p className="text-[11px] text-[#7A6E5D]">
                      Lists classical Yogas and their presence across the primary divisional charts (D1, D9, D10, D2, D3, D7, D12). Recurrence is shown strictly factually without arbitrary numerical score scaling.
                    </p>
                  </div>

                  {crossVargaRecurrences.length > 0 ? (
                    <div className="space-y-2.5">
                      {crossVargaRecurrences.map((rec) => (
                        <div
                          key={rec.yogaId}
                          className="border border-[#EAE3D5] rounded-xl p-4 bg-[#FCFAF7] space-y-2 text-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#F0ECE1] pb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-serif font-bold text-sm text-[#2A241A]">
                                  {rec.yogaName}
                                </h4>
                                {rec.sanskritName && (
                                  <span className="text-xs text-[#8B2500] font-serif">{rec.sanskritName}</span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#8A7C68] uppercase tracking-wider font-semibold">
                                {rec.category} • Present in {rec.recurrenceCount} chart context{rec.recurrenceCount > 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {rec.formedInD1 && (
                                <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold">
                                  D1 (Rāśi)
                                </span>
                              )}
                              {rec.recurringVargas.map((v, vIdx) => (
                                <span
                                  key={vIdx}
                                  className="px-2 py-0.5 rounded bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-semibold"
                                >
                                  {v.vargaId}
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-[11px] text-[#6A5D4B] leading-relaxed">
                            {rec.classicalContextNote}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-xs text-[#8A7D6B] border border-dashed border-[#E0D7C6] rounded-xl bg-[#FAF8F5] p-6">
                      No cross-varga recurrences calculated.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PROGRESSIVE VIEW DETAILS FLOATING DIALOG / MODAL                        */}
      {/* ========================================================================= */}
      {modalYoga && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setModalYoga(null)}
        >
          <div
            className="bg-white border border-[#DCD3C1] rounded-2xl max-w-lg w-full max-h-[88vh] overflow-y-auto shadow-xl p-6 space-y-5 text-xs text-[#3A3022]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#F0ECE1] pb-3 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7C68]">
                  {modalYoga.vargaContext
                    ? `${modalYoga.vargaContext.name} (${modalYoga.vargaContext.id}) • ${modalYoga.yoga.category} Yoga`
                    : `${modalYoga.yoga.category} Yoga`}
                </span>
                <h4 className="font-serif font-bold text-lg text-[#2A241A]">
                  {modalYoga.yoga.name}
                </h4>
                {modalYoga.yoga.sanskritName && (
                  <p className="text-sm text-[#8B2500] font-serif mt-0.5">
                    {modalYoga.yoga.sanskritName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setModalYoga(null)}
                className="p-1.5 rounded-lg text-[#8A7C68] hover:text-[#2A241A] hover:bg-[#F5EFE6] transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formation Status & Required Conditions Met */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7C68]">
                  Formation Status
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[11px]">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  FORMED {modalYoga.vargaContext ? `IN ${modalYoga.vargaContext.id}` : 'IN NATAL D1'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE3D5] space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#73634F]">
                  Required Conditions Verified
                </div>
                <ul className="space-y-1.5 text-xs text-[#4A3E31]">
                  {modalYoga.yoga.conditionsMet.map((cond, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-700 font-bold leading-none mt-0.5">✓</span>
                      <span className="leading-snug">{cond}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Unverified / Late Medieval Provenance Note */}
            {modalYoga.yoga.isUnverified && (
              <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300 text-xs text-[#7A440A] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>Scholastic Provenance Note</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {modalYoga.yoga.provenanceNotes ||
                    'This combination is absent from the classical Sanskrit canon (BPHS, Bṛhat Jātaka, Sārāvalī, Phaladīpikā, Jātaka Pārijāta) and is preserved in post-classical or regional traditions.'}
                </p>
              </div>
            )}

            {/* Participating Astrological Factors */}
            {modalYoga.yoga.involvedPlanets && modalYoga.yoga.involvedPlanets.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7C68]">
                  Participating Grahas
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {modalYoga.yoga.involvedPlanets.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#F5EFE6] border border-[#E0D5C1] font-mono text-[11px] uppercase font-semibold text-[#4A3E31]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Classical Shloka Citation */}
            {modalYoga.yoga.sanskritShloka && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7C68]">
                  Classical Shloka
                </span>
                <div className="p-3 rounded-xl bg-[#FFFDF9] border border-[#E8DFC8] font-serif text-xs text-[#524433] leading-relaxed italic">
                  &ldquo;{modalYoga.yoga.sanskritShloka}&rdquo;
                </div>
              </div>
            )}

            {/* Classical Interpretation / Effects */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A7C68]">
                Classical Phala (Interpretation)
              </span>
              <p className="text-xs text-[#4A3E31] leading-relaxed p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE3D5]">
                {modalYoga.yoga.effects}
              </p>
            </div>

            {/* Canonical Reference Source */}
            <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E8DFC8] flex items-center justify-between text-xs text-[#6A5D4B]">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#8B2500] shrink-0" />
                <span className="font-semibold text-[#2A241A]">Canonical Reference:</span>
                <span>{modalYoga.yoga.chapterAndVerse || modalYoga.yoga.sourceText || 'Canonical Classical Canon'}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-[#F0ECE1] flex justify-end">
              <button
                onClick={() => setModalYoga(null)}
                className="px-4 py-1.5 bg-[#2A241A] hover:bg-[#42392B] text-white rounded-lg text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

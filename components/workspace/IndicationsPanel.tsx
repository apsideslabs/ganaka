'use client';

/**
 * Gaṇaka — Classical Chart Indications Panel
 * (शास्त्रीय कुण्डली फल विवेक)
 * 
 * Provides an evidence-based, deterministic source-grounded Phala engine
 * across 12 classical life domains.
 * 
 * Strict Evidence Pipeline:
 * Calculated Chart Data → Exact Classical Rule → Every Required Condition → Condition Verification
 * → Direct Classical Phala → Cross-Text Comparison & Conflict Analysis → Controlled Synthesis → Modern Interpretive Mapping
 */

import React, { useState, useMemo, useEffect } from 'react';
import { JyotishaChart } from '../../lib/jyotisha/types';
import {
  DomainId,
  DomainIndication,
  ClassicalIndicationsReport,
} from '../../lib/jyotisha/indications/types';
import { generateClassicalChartIndications } from '../../lib/jyotisha/indications';
import {
  BookOpen,
  Search,
  X,
  Compass,
  Heart,
  Briefcase,
  Coins,
  GraduationCap,
  Users,
  Baby,
  Home,
  Activity,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Info,
  Scale,
  Copy,
  Check,
  FileText,
  HelpCircle,
  SplitSquareVertical,
} from 'lucide-react';

interface IndicationsPanelProps {
  chart: JyotishaChart;
}

// Icon mapping per domain
const DOMAIN_ICONS: Record<DomainId, React.ElementType> = {
  constitution: Compass,
  temperament: Sparkles,
  career: Briefcase,
  wealth: Coins,
  education: GraduationCap,
  marriage: Heart,
  children: Baby,
  family: Home,
  health: Activity,
  spirituality: Sparkles,
  status: Award,
  life_themes: Layers,
};

// Domain category groupings for quick filtering
const DOMAIN_CATEGORIES: Record<string, { id: string; label: string; domainIds: DomainId[] }> = {
  all: {
    id: 'all',
    label: 'All 12 Domains',
    domainIds: [
      'constitution',
      'temperament',
      'career',
      'wealth',
      'education',
      'marriage',
      'children',
      'family',
      'health',
      'spirituality',
      'status',
      'life_themes',
    ],
  },
  foundational: {
    id: 'foundational',
    label: 'Constitution & Mind',
    domainIds: ['constitution', 'temperament', 'life_themes'],
  },
  endeavors: {
    id: 'endeavors',
    label: 'Career, Wealth & Status',
    domainIds: ['career', 'wealth', 'status', 'education'],
  },
  relationships: {
    id: 'relationships',
    label: 'Marriage, Progeny & Family',
    domainIds: ['marriage', 'children', 'family'],
  },
  health_spirit: {
    id: 'health_spirit',
    label: 'Health & Spiritual Life',
    domainIds: ['health', 'spirituality'],
  },
};

export const IndicationsPanel: React.FC<IndicationsPanelProps> = ({ chart }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDomainModal, setSelectedDomainModal] = useState<DomainIndication | null>(null);
  const [modalTab, setModalTab] = useState<'shlokas' | 'evidence' | 'modern' | 'calculations'>('shlokas');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Generate deterministic report from the unified chart data
  const report: ClassicalIndicationsReport = useMemo(() => {
    return generateClassicalChartIndications(chart);
  }, [chart]);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedDomainModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered domains
  const filteredDomains = useMemo(() => {
    const categoryGroup =
      Object.values(DOMAIN_CATEGORIES).find((c) => c.id === selectedCategory) ||
      DOMAIN_CATEGORIES.all;

    return report.orderedDomainIds
      .map((id) => report.domains[id])
      .filter((domain) => {
        if (!categoryGroup.domainIds.includes(domain.id)) return false;

        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();

        return (
          domain.title.toLowerCase().includes(q) ||
          domain.sanskritTitle.toLowerCase().includes(q) ||
          domain.conciseSummary.toLowerCase().includes(q) ||
          domain.coreDisposition.toLowerCase().includes(q) ||
          domain.calculatedFacts.some(
            (f) =>
              f.label.toLowerCase().includes(q) ||
              f.value.toLowerCase().includes(q) ||
              f.significance.toLowerCase().includes(q)
          ) ||
          domain.canonicalSources?.some(
            (s) =>
              s?.sourceText?.toLowerCase().includes(q) ||
              s?.chapterAndVerse?.toLowerCase().includes(q)
          )
        );
      });
  }, [report, selectedCategory, searchQuery]);

  const handleCopySummary = (domain: DomainIndication) => {
    const text = `${domain.title} (${domain.sanskritTitle})\n\nCanonical Summary:\n${domain.conciseSummary}\n\nDirect Classical Phalas:\n${domain.directClassicalPhalas.map((p) => `• [${p.sourceText} ${p.chapterAndVerse}]: ${p.directPhalaText}`).join('\n')}\n\nCalculated Natal Facts:\n${domain.calculatedFacts.map((f) => `- ${f.label}: ${f.value}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(domain.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="classical-chart-indications-panel" className="space-y-6">
      {/* 1. Header & Synthesis Baseline Card */}
      <div
        id="indications-hero-card"
        className="bg-white rounded-xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#2A1810] via-[#3D1E16] to-[#1E1B18] px-6 py-6 text-white border-b border-amber-900/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-300/90 text-xs font-semibold uppercase tracking-wider mb-1">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Gaṇaka Source-Grounded Classical Phala Engine • 12 Specialized Domains</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-3">
                <span>Classical Chart Indications</span>
                <span className="text-base font-normal font-sans text-amber-200/80">
                  (शास्त्रीय कुण्डली फल विवेक)
                </span>
              </h2>
              <p className="text-slate-300 text-sm mt-1 max-w-3xl leading-relaxed">
                Deterministic conditional Phala evaluation derived directly from authentic Sanskrit
                treatises (BPHS, Bṛhat Jātaka, Phaladīpikā, Sārāvalī, Jaimini Sūtras, Jātaka Pārijāta)
                with exact condition verification and explicit modern mapping separation.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-200 text-xs font-medium border border-amber-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Deterministic Sourced Logic</span>
              </span>
            </div>
          </div>

          {/* Global Quick Baseline Badges */}
          <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Lagna (Ascendant)</span>
              <strong className="text-amber-200 font-medium truncate block">
                {report.globalChartSummary.ascendantSign}
              </strong>
            </div>
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Candra (Moon)</span>
              <strong className="text-amber-200 font-medium truncate block">
                {report.globalChartSummary.moonSign}
              </strong>
            </div>
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Sūrya (Sun)</span>
              <strong className="text-amber-200 font-medium truncate block">
                {report.globalChartSummary.sunSign}
              </strong>
            </div>
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Ātmakāraka (AK)</span>
              <strong className="text-amber-200 font-medium truncate block">
                {report.globalChartSummary.atmakaraka}
              </strong>
            </div>
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Amātyakāraka (AmK)</span>
              <strong className="text-amber-200 font-medium truncate block">
                {report.globalChartSummary.amatyakaraka}
              </strong>
            </div>
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Śaḍbala Balavān</span>
              <strong className="text-amber-200 font-medium truncate block">
                {report.globalChartSummary.strongestPlanetByShadbala}
              </strong>
            </div>
          </div>
        </div>

        {/* Professional Disclaimer Bar */}
        <div className="bg-amber-50/70 px-6 py-3 border-b border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900/90">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Methodological Standard:</strong> Every indication is grounded in specific Sanskrit
            manuscript ślokas. If a condition is not met, it is explicitly shown. Modern psychological
            or vocational mappings are strictly separated from canonical source consequences.
          </p>
        </div>
      </div>

      {/* 2. Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {Object.values(DOMAIN_CATEGORIES).map((cat) => (
            <button
              key={cat.id}
              id={`cat-btn-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#8C2D19] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative min-w-[260px] md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="indications-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search domains, Sanskrit rules, Grahas..."
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C2D19]/20 focus:border-[#8C2D19] text-slate-800 placeholder-slate-400 shadow-sm"
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

      {/* 3. Grid of 12 Domain Cards */}
      {filteredDomains.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Compass className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-medium text-slate-700">No matching domains found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or switching to &apos;All 12 Domains&apos;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDomains.map((domain) => {
            const IconComponent = DOMAIN_ICONS[domain.id] || Compass;
            const hasVerifiedRules = domain.directClassicalPhalas.some((p) => p.allConditionsMet);

            return (
              <div
                key={domain.id}
                id={`domain-card-${domain.id}`}
                className="bg-white rounded-xl border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#8C2D19]/10 text-[#8C2D19] flex items-center justify-center shrink-0 border border-[#8C2D19]/20">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-slate-900 text-sm group-hover:text-[#8C2D19] transition-colors leading-tight">
                          {domain.title}
                        </h3>
                        <span className="text-[11px] font-sans text-amber-800/80 font-medium">
                          {domain.sanskritTitle}
                        </span>
                      </div>
                    </div>

                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold tracking-wider uppercase border border-slate-200 shrink-0">
                      H{domain.primaryBhavas.join(', H')}
                    </span>
                  </div>

                  {/* Core Disposition Badge */}
                  <div className="px-4 py-2 bg-amber-50/40 border-b border-amber-100/60 flex items-center justify-between text-xs">
                    <span className="text-amber-900/80 font-medium truncate">
                      {domain.coreDisposition}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      {domain.keyVargas.join(' • ')}
                    </span>
                  </div>

                  {/* Direct Classical Phala Preview */}
                  <div className="p-4 space-y-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                        <BookOpen className="w-3 h-3 text-[#8C2D19]" />
                        <span>Direct Canonical Phala</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-sans line-clamp-3">
                        {domain.conciseSummary}
                      </p>
                    </div>

                    {/* Quick Calculated Facts */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Verified Natal Conditions
                      </span>
                      {domain.calculatedFacts.slice(0, 3).map((fact) => (
                        <div
                          key={fact.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-50 border border-slate-100/80"
                        >
                          <span className="text-slate-600 text-[11px] truncate pr-2">
                            {fact.label}
                          </span>
                          <span
                            className={`text-[11px] font-medium truncate ${
                              fact.isFavorable
                                ? 'text-emerald-700 font-semibold'
                                : fact.neutralOrMixed
                                ? 'text-slate-700'
                                : 'text-amber-800'
                            }`}
                          >
                            {fact.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-3 px-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <button
                    id={`btn-details-${domain.id}`}
                    onClick={() => {
                      setSelectedDomainModal(domain);
                      setModalTab('shlokas');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C2D19] hover:text-[#6E2213] transition-colors"
                  >
                    <span>Inspect Sanskrit Rules & Proof</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleCopySummary(domain)}
                    title="Copy domain summary"
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
                  >
                    {copiedId === domain.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Progressive Disclosure Deep-Dive Modal */}
      {selectedDomainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            id="domain-modal-content"
            className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#2A1810] to-[#1E1B18] text-white flex items-center justify-between border-b border-amber-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
                  {React.createElement(DOMAIN_ICONS[selectedDomainModal.id] || Compass, {
                    className: 'w-5 h-5',
                  })}
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white leading-tight">
                    {selectedDomainModal.title}
                  </h3>
                  <span className="text-xs text-amber-200/90 font-sans">
                    {selectedDomainModal.sanskritTitle} • {selectedDomainModal.subtitle}
                  </span>
                </div>
              </div>

              <button
                id="btn-close-modal"
                onClick={() => setSelectedDomainModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="px-6 border-b border-slate-200 bg-slate-50 flex items-center gap-4 text-xs font-semibold overflow-x-auto scrollbar-none">
              <button
                onClick={() => setModalTab('shlokas')}
                className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  modalTab === 'shlokas'
                    ? 'border-[#8C2D19] text-[#8C2D19]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Sanskrit Ślokas & Phala</span>
              </button>
              <button
                onClick={() => setModalTab('evidence')}
                className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  modalTab === 'evidence'
                    ? 'border-[#8C2D19] text-[#8C2D19]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Condition Verification Matrix</span>
              </button>
              <button
                onClick={() => setModalTab('modern')}
                className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  modalTab === 'modern'
                    ? 'border-[#8C2D19] text-[#8C2D19]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <SplitSquareVertical className="w-4 h-4" />
                <span>Modern Interpretive Mapping</span>
              </button>
              <button
                onClick={() => setModalTab('calculations')}
                className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  modalTab === 'calculations'
                    ? 'border-[#8C2D19] text-[#8C2D19]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>Calculations & Vargas</span>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              {/* TAB 1: Sanskrit Ślokas & Phala */}
              {modalTab === 'shlokas' && (
                <div className="space-y-4">
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/70">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
                      Multi-Rule Classical Synthesis
                    </span>
                    <p className="text-slate-800 leading-relaxed font-sans text-xs whitespace-pre-line">
                      {selectedDomainModal.multiRuleSynthesis}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#8C2D19]" />
                      <span>Direct Classical Phala & Manuscript Citations</span>
                    </h4>

                    {selectedDomainModal.directClassicalPhalas.map((phala) => (
                      <div
                        key={phala.id}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-serif font-bold text-slate-900 text-sm block">
                              {phala.sourceText} • {phala.chapterAndVerse}
                            </span>
                            {phala.sanskritTitle && (
                              <span className="text-amber-800 text-[11px] font-sans font-medium">
                                {phala.sanskritTitle}
                              </span>
                            )}
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border ${
                              phala.allConditionsMet
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {phala.verificationLevel}
                          </span>
                        </div>

                        {/* Verbatim Sanskrit Shloka */}
                        {phala.sanskritShloka && (
                          <div className="bg-[#2A1810] text-amber-100 p-3.5 rounded-lg font-serif text-xs leading-relaxed border border-amber-900/60 shadow-inner whitespace-pre-line">
                            {phala.sanskritShloka}
                          </div>
                        )}

                        {/* Direct Phala Consequence */}
                        <div className="bg-white p-3 rounded-lg border border-slate-200/80 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                            Direct Classical Result (प्रत्यक्ष फल)
                          </span>
                          <p className="text-slate-800 font-sans text-xs leading-relaxed">
                            {phala.directPhalaText}
                          </p>
                        </div>

                        {phala.editionOrManuscript && (
                          <div className="text-[10px] text-slate-400">
                            <strong>Source Manuscript/Edition:</strong> {phala.editionOrManuscript}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: Evidence Chain & Condition Verification Matrix */}
              {modalTab === 'evidence' && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <h4 className="font-serif font-bold text-slate-900 text-sm">
                      Condition-by-Condition Verification Matrix
                    </h4>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Every condition prescribed by the classical treatise is matched against the computed
                      astrometric values of this horoscope:
                    </p>

                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                      {selectedDomainModal.directClassicalPhalas.flatMap((p) => p.conditions).map((cond) => (
                        <div key={cond.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <strong className="text-slate-800 text-xs block">
                                {cond.description}
                              </strong>
                              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-mono">
                                <span>Expected: <strong className="text-slate-700">{cond.expected}</strong></span>
                                <span>•</span>
                                <span>Observed: <strong className="text-slate-800">{cond.observed}</strong></span>
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 flex items-center gap-1 ${
                                cond.met
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {cond.met ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Condition Met</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3 h-3 text-rose-600" />
                                  <span>Not Satisfied</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* All Verified Facts Table */}
                  <div className="space-y-2">
                    <h4 className="font-serif font-bold text-slate-900 text-sm">
                      Calculated Natal Factor Inventory
                    </h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                      {selectedDomainModal.calculatedFacts.map((fact) => (
                        <div key={fact.id} className="p-3 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-800 text-xs">
                              {fact.label}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                fact.isFavorable
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : fact.neutralOrMixed
                                  ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {fact.value}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-1 leading-normal">
                            {fact.significance}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Supporting vs Counterbalancing Factors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-200/70 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Supporting Classical Factors</span>
                      </span>
                      <ul className="space-y-1.5 text-[11px] text-emerald-950">
                        {selectedDomainModal.supportingFactors.length > 0 ? (
                          selectedDomainModal.supportingFactors.map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 shrink-0">•</span>
                              <span>{f}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-500 italic">No strong independent positive yogas.</li>
                        )}
                      </ul>
                    </div>

                    <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-200/70 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Counterbalancing & Limiting Considerations</span>
                      </span>
                      <ul className="space-y-1.5 text-[11px] text-amber-950">
                        {selectedDomainModal.limitingOrCounterbalancingFactors.length > 0 ? (
                          selectedDomainModal.limitingOrCounterbalancingFactors.map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-amber-500 shrink-0">•</span>
                              <span>{f}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-slate-500 italic">No significant classical afflictions present.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Modern Interpretive Mapping */}
              {modalTab === 'modern' && (
                <div className="space-y-4">
                  <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200/80 space-y-2 text-indigo-950">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-900 flex items-center gap-1.5">
                      <SplitSquareVertical className="w-3.5 h-3.5 text-indigo-700" />
                      <span>Modern Translation Boundary</span>
                    </span>
                    <p className="text-xs leading-relaxed">
                      Ancient Sanskrit texts reflect their historical socio-cultural context. The mappings below
                      are strictly labeled as modern ergonomic and psychological analogies. They are never
                      attributed as literal claims of the ancient manuscripts.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {selectedDomainModal.modernMappings.map((map) => (
                      <div
                        key={map.id}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 text-sm">{map.classicalConcept}</strong>
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono">
                            {map.classicalSourceRef}
                          </span>
                        </div>
                        <p className="text-slate-800 text-xs leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                          {map.modernMappingText}
                        </p>
                        <div className="text-[10px] text-slate-400 italic">
                          {map.methodologyNote}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Calculations & Basis */}
              {modalTab === 'calculations' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-serif font-bold text-slate-900 text-sm">
                      Computational Foundation & Astrometric Parameters
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                      {selectedDomainModal.calculationBasisNotes.map((note, i) => (
                        <li key={i} className="leading-relaxed">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Harmonic Divisional Vargas Utilized
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedDomainModal.keyVargas.map((v) => (
                        <span
                          key={v}
                          className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-slate-800 text-xs font-medium shadow-sm"
                        >
                          {v} ({v === 'D1' ? 'Rāśi' : v === 'D9' ? 'Navāṃśa' : v === 'D10' ? 'Daśāṃśa' : v === 'D7' ? 'Saptāṃśa' : v === 'D2' ? 'Horā' : v === 'D4' ? 'Caturthāṃśa' : v === 'D20' ? 'Viṃśāṃśa' : v === 'D24' ? 'Caturviṃśāṃśa' : 'Divisional'})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Gaṇaka Deterministic Horā Subsystem</span>
              <button
                onClick={() => handleCopySummary(selectedDomainModal)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium transition-colors shadow-sm"
              >
                {copiedId === selectedDomainModal.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied Summary</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Domain Summary</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

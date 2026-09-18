'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { JyotishaChart } from '../../lib/jyotisha/types';
import { generateClassicalChartIndications } from '../../lib/jyotisha/indications';
import {
  DomainIndication,
  ClassicalIndicationsReport,
  DirectClassicalPhala,
  RuleCondition,
} from '../../lib/jyotisha/indications/types';
import { CANONICAL_RULES } from '../../lib/jyotisha/indications/classical-sources';
import {
  generateJyotishaPredictionProtocol,
  JyotishaPredictionProtocolReport,
  ProtocolDomainResult,
} from '../../lib/jyotisha/prediction-protocol';
import {
  BookOpen,
  ShieldCheck,
  Scale,
  SplitSquareVertical,
  AlertCircle,
  ChevronRight,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Compass,
  Heart,
  Award,
  Briefcase,
  GraduationCap,
  Users,
  Shield,
  Lightbulb,
  Activity,
  ChevronDown,
  ChevronUp,
  Printer,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Wand2,
  X,
  Clock,
  CheckCircle2,
  TrendingUp,
  User,
  Eye,
} from 'lucide-react';

interface IndicationsPanelProps {
  chart: JyotishaChart;
}

const DOMAIN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  constitution: Compass,
  temperament: Lightbulb,
  career: Briefcase,
  wealth: Award,
  education: GraduationCap,
  marriage: Heart,
  children: Users,
  family: Shield,
  health: Activity,
  spirituality: Sparkles,
  status: Award,
  life_themes: Compass,
};

const DOMAIN_CATEGORIES = {
  all: {
    id: 'all',
    label: 'All 12 Domains (द्वादश भाव फल)',
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
  personal: {
    id: 'personal',
    label: 'Constitution & Mind (तनु-मनः)',
    domainIds: ['constitution', 'temperament', 'life_themes'],
  },
  career_wealth: {
    id: 'career_wealth',
    label: 'Career, Wealth & Status (कर्म-अर्थ)',
    domainIds: ['career', 'wealth', 'status', 'education'],
  },
  relationships: {
    id: 'relationships',
    label: 'Marriage, Progeny & Family (कलत्र-कुटुम्ब)',
    domainIds: ['marriage', 'children', 'family'],
  },
  health_spirit: {
    id: 'health_spirit',
    label: 'Health & Spirituality (स्वास्थ्य-धर्म)',
    domainIds: ['health', 'spirituality'],
  },
};

type ViewMode = 'domains' | 'rules_library' | 'dossier';
type ScriptMode = 'devanagari' | 'iast' | 'both';

export const IndicationsPanel: React.FC<IndicationsPanelProps> = ({ chart }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('domains');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDomainModal, setSelectedDomainModal] = useState<DomainIndication | null>(null);
  const [modalTab, setModalTab] = useState<'shlokas' | 'evidence' | 'modern' | 'calculations' | 'ai_synthesis'>('shlokas');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [scriptMode, setScriptMode] = useState<ScriptMode>('both');

  // Jyotiṣa Prediction Protocol State
  const [selectedProtocolDomainNum, setSelectedProtocolDomainNum] = useState<number | 'all'>('all');
  const [isProtocolSynthesizing, setIsProtocolSynthesizing] = useState<boolean>(false);
  const [protocolAiText, setProtocolAiText] = useState<string | null>(null);
  const [protocolSynthesisSource, setProtocolSynthesisSource] = useState<string | null>('Deterministic Canonical Shastric Protocol Engine');
  const [cardActiveTab, setCardActiveTab] = useState<Record<string, 'synthesis' | 'phala'>>({});

  const deterministicProtocolReport: JyotishaPredictionProtocolReport = useMemo(() => {
    return generateJyotishaPredictionProtocol(chart);
  }, [chart]);

  const [showAppearanceCard, setShowAppearanceCard] = useState<boolean>(true);
  const appearanceProfile = deterministicProtocolReport.appearanceProfile;
  const domain1Protocol = deterministicProtocolReport.domains.find((d) => d.domainNumber === 1);

  // Shastric Synthesis State
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisLevel, setSynthesisLevel] = useState<'standard' | 'in_depth' | 'shastra_pure'>('in_depth');
  const [aiSynthesisText, setAiSynthesisText] = useState<string | null>(null);
  const [synthesisSource, setSynthesisSource] = useState<string | null>('Deterministic Canonical Shastric Engine');
  const [synthesisError, setSynthesisError] = useState<string | null>(null);

  // Rules Library Filters
  const [librarySourceFilter, setLibrarySourceFilter] = useState<string>('all');
  const [libraryStatusFilter, setLibraryStatusFilter] = useState<'all' | 'satisfied' | 'partial' | 'unmet'>('all');
  const [librarySearch, setLibrarySearch] = useState('');

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

  // All canonical rules from registry combined with this chart's evaluation status
  const evaluatedRulesList = useMemo(() => {
    const phalasByRuleId = new Map<string, DirectClassicalPhala>();
    Object.values(report.domains).forEach((d) => {
      d.directClassicalPhalas.forEach((p) => {
        phalasByRuleId.set(p.ruleId, p);
      });
    });

    return Object.values(CANONICAL_RULES).map((rule) => {
      const evaluation = phalasByRuleId.get(rule.id);
      return {
        citation: rule,
        evaluation: evaluation || null,
        isSatisfied: evaluation?.allConditionsMet ?? false,
        verificationLevel: evaluation?.verificationLevel || 'Uncatalogued in Active Domains',
      };
    });
  }, [report]);

  // Filtered Rules for the Classical Library
  const filteredRulesList = useMemo(() => {
    return evaluatedRulesList.filter((item) => {
      // Source filter
      if (librarySourceFilter !== 'all') {
        if (!item.citation.sourceText.toLowerCase().includes(librarySourceFilter.toLowerCase())) {
          return false;
        }
      }

      // Status filter
      if (libraryStatusFilter === 'satisfied') {
        if (!item.isSatisfied) return false;
      } else if (libraryStatusFilter === 'partial') {
        if (item.isSatisfied || !item.evaluation?.conditions?.some((c) => c.met)) return false;
      } else if (libraryStatusFilter === 'unmet') {
        if (item.isSatisfied) return false;
      }

      // Search
      if (librarySearch.trim()) {
        const q = librarySearch.toLowerCase().trim();
        const matchTitle = item.citation.sanskritTitle?.toLowerCase().includes(q);
        const matchDesc = item.citation.ruleDescription?.toLowerCase().includes(q);
        const matchShloka = item.citation.sanskritShloka?.toLowerCase().includes(q);
        const matchSource = item.citation.sourceText?.toLowerCase().includes(q);
        const matchVerse = item.citation.chapterAndVerse?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchShloka || matchSource || matchVerse;
      }

      return true;
    });
  }, [evaluatedRulesList, librarySourceFilter, libraryStatusFilter, librarySearch]);

  // Handle Classical Shastric Synthesis Call
  const handleGenerateAiSynthesis = async (domain: DomainIndication) => {
    setIsSynthesizing(true);
    setSynthesisError(null);
    setAiSynthesisText(null);

    try {
      const res = await fetch('/api/jyotisha/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chart,
          domainId: domain.id,
          domainTitle: domain.title,
          sanskritTitle: domain.sanskritTitle,
          chartSummary: {
            ascendantSign: report.globalChartSummary.ascendantSign,
            ascendantLord: report.globalChartSummary.ascendantLord,
            moonSign: report.globalChartSummary.moonSign,
            moonNakshatra: report.globalChartSummary.moonNakshatra,
            sunSign: report.globalChartSummary.sunSign,
            atmakaraka: report.globalChartSummary.atmakaraka,
            amatyakaraka: report.globalChartSummary.amatyakaraka,
            strongestPlanetByShadbala: report.globalChartSummary.strongestPlanetByShadbala,
          },
          verifiedFacts: domain.calculatedFacts,
          directPhalas: domain.directClassicalPhalas,
          satisfiedRules: domain.directClassicalPhalas.filter((p) => p.allConditionsMet),
          contradictions: domain.contradictions,
          calculationBasis: domain.calculationBasisNotes,
          synthesisLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok && !data.synthesis) {
        throw new Error(data.error || 'Failed to synthesize');
      }

      setAiSynthesisText(data.synthesis);
      setSynthesisSource(data.source || 'Deterministic Canonical Shastric Engine');
    } catch (err: any) {
      console.error('Synthesis error:', err);
      // Seamless offline fallback: fetch from client-side prediction protocol
      const domainNum = report.orderedDomainIds.indexOf(domain.id) + 1;
      const protoDom = deterministicProtocolReport.domains.find(
        (d) => d.domainId === domain.id || d.domainNumber === domainNum
      );
      if (protoDom) {
        setAiSynthesisText(protoDom.formattedOutput);
        setSynthesisSource('Deterministic Canonical Shastric Engine (Client Offline)');
      } else {
        setSynthesisError(err.message || 'Error occurred during classical synthesis');
      }
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCopySummary = (domain: DomainIndication) => {
    const domainNum = report.orderedDomainIds.indexOf(domain.id) + 1;
    const protoDom = deterministicProtocolReport.domains.find(
      (d) => d.domainId === domain.id || d.domainNumber === domainNum
    );
    let text = `${domain.title} (${domain.sanskritTitle})\n\n`;
    if (protoDom) {
      text += `5-Layer Synthesis Composite Score: ${protoDom.layers.compositeScore}/100\n`;
      text += `Strict Verdict: ${protoDom.finalVerdict}\n`;
      text += `Timeline: ${protoDom.timelineOfManifestation}\n\n`;
    }
    text += `Canonical Summary:\n${domain.conciseSummary}\n\nDirect Classical Phalas:\n${domain.directClassicalPhalas.map((p) => `• [${p.sourceText} ${p.chapterAndVerse}]: ${p.directPhalaText}`).join('\n')}\n\nCalculated Natal Facts:\n${domain.calculatedFacts.map((f) => `- ${f.label}: ${f.value}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(domain.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyFullDossier = () => {
    let dossier = `# Gaṇaka Classical Horoscope Indications Dossier (द्वादश भाव फल विवेक)\n`;
    dossier += `Generated: ${new Date().toLocaleDateString()} | System: Deterministic Classical Jyotiṣa Engine\n\n`;
    dossier += `## Chart Core Baseline\n`;
    dossier += `- Lagna (Ascendant): ${chart.lagna.rashiName} (${chart.lagna.degreeStr})\n`;
    dossier += `- Moon: ${chart.planets.moon.rashiName} (${chart.planets.moon.degreeStr}) in ${chart.planets.moon.nakshatraName}\n`;
    dossier += `- Sun: ${chart.planets.sun.rashiName} (${chart.planets.sun.degreeStr})\n`;
    dossier += `- Total Canonical Rules Verified in Engine: 96 Rules across 12 Domains\n\n`;
    dossier += `---\n\n`;

    report.orderedDomainIds.forEach((id, idx) => {
      const d = report.domains[id];
      dossier += `### ${idx + 1}. ${d.title} (${d.sanskritTitle})\n`;
      dossier += `**Core Disposition:** ${d.coreDisposition}\n\n`;
      dossier += `**Canonical Summary:**\n${d.conciseSummary}\n\n`;
      dossier += `**Multi-Rule Synthesis:**\n${d.multiRuleSynthesis}\n\n`;
      dossier += `**Verified Direct Classical Rules:**\n`;
      d.directClassicalPhalas.forEach((p) => {
        dossier += `- **[${p.sourceText} — ${p.chapterAndVerse}]** (${p.verificationLevel}): ${p.directPhalaText}\n`;
        if (p.sanskritShloka) dossier += `  > *${p.sanskritShloka}*\n`;
      });
      dossier += `\n**Key Astrometric Facts:**\n`;
      d.calculatedFacts.slice(0, 5).forEach((f) => {
        dossier += `- ${f.label}: ${f.value} (${f.significance})\n`;
      });
      dossier += `\n---\n\n`;
    });

    navigator.clipboard.writeText(dossier);
    setCopiedId('full_dossier');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyProtocolReport = () => {
    const text = protocolAiText || deterministicProtocolReport.fullFormattedText;
    navigator.clipboard.writeText(text);
    setCopiedId('protocol_report');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadProtocolReport = () => {
    const text = protocolAiText || deterministicProtocolReport.fullFormattedText;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const b = chart.meta?.birthDetails;
    const dateStr = b
      ? `${b.year}-${String(b.month).padStart(2, '0')}-${String(b.day).padStart(2, '0')}`
      : 'chart';
    link.download = `Jyotisha_Prediction_Protocol_Report_${dateStr}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRunProtocolAi = async () => {
    setIsProtocolSynthesizing(true);
    try {
      const res = await fetch('/api/jyotisha/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'prediction_protocol',
          chart,
        }),
      });
      const data = await res.json();
      if (data.synthesis) {
        setProtocolAiText(data.synthesis);
        setProtocolSynthesisSource(data.source || 'Deterministic Canonical Shastric Protocol Engine');
      } else {
        setProtocolAiText(deterministicProtocolReport.fullFormattedText);
        setProtocolSynthesisSource('Deterministic Canonical Shastric Protocol Engine');
      }
    } catch (e) {
      console.error('Protocol synthesis failed:', e);
      setProtocolAiText(deterministicProtocolReport.fullFormattedText);
      setProtocolSynthesisSource('Deterministic Canonical Shastric Protocol Engine');
    } finally {
      setIsProtocolSynthesizing(false);
    }
  };

  return (
    <div id="classical-chart-indications-panel" className="space-y-6">
      {/* 1. Header & View Mode Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19] animate-pulse" />
              <h2 className="text-xl font-serif font-bold text-slate-900 tracking-tight">
                Classical Chart Indications & Phala Engine
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                96 Canonical Rules • 12 Domains
              </span>
            </div>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Deterministic, condition-verified classical predictions sourced from BPHS, Phaladīpikā,
              Sārāvalī, Bṛhat Jātaka, and Jaimini Sūtras.
            </p>
          </div>

          {/* Primary View Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              id="view-mode-domains"
              onClick={() => setViewMode('domains')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'domains'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#8C2D19]" />
              <span>12 Life Domains</span>
            </button>
            <button
              id="view-mode-rules"
              onClick={() => setViewMode('rules_library')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'rules_library'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#8C2D19]" />
              <span>Classical Sūtra Library</span>
            </button>
            <button
              id="view-mode-dossier"
              onClick={() => setViewMode('dossier')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'dossier'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#8C2D19]" />
              <span>Phala Dossier</span>
            </button>
          </div>
        </div>

        {/* Synthesis Baseline Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Lagna (Ascendant)</span>
            <span className="font-serif font-bold text-slate-800 text-sm">
              {report.globalChartSummary.ascendantSign}
            </span>
            <span className="text-[10px] text-slate-500 block truncate font-mono">
              Lord: {report.globalChartSummary.ascendantLord}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Candra (Moon)</span>
            <span className="font-serif font-bold text-slate-800 text-sm">
              {report.globalChartSummary.moonSign}
            </span>
            <span className="text-[10px] text-slate-500 block truncate font-mono">
              {report.globalChartSummary.moonNakshatra}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sūrya (Sun)</span>
            <span className="font-serif font-bold text-slate-800 text-sm">
              {report.globalChartSummary.sunSign}
            </span>
            <span className="text-[10px] text-slate-500 block truncate font-mono">
              {chart.planets.sun.nakshatraName}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ātmakāraka (AK)</span>
            <span className="font-serif font-bold text-amber-900 text-sm">
              {report.globalChartSummary.atmakaraka}
            </span>
            <span className="text-[10px] text-slate-500 block truncate font-mono">
              Soul Significator
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Amātyakāraka (AmK)</span>
            <span className="font-serif font-bold text-amber-900 text-sm">
              {report.globalChartSummary.amatyakaraka}
            </span>
            <span className="text-[10px] text-slate-500 block truncate font-mono">
              Career Significator
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Śaḍbala Balavān</span>
            <span className="font-serif font-bold text-emerald-800 text-sm">
              {report.globalChartSummary.strongestPlanetByShadbala}
            </span>
            <span className="text-[10px] text-slate-500 block truncate font-mono">
              Max Potency Graha
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: UNIFIED 12 DOMAINS (CLASSICAL PHALAS & 5-LAYER PREDICTION PROTOCOL) */}
      {/* ========================================================================= */}
      {viewMode === 'domains' && (
        <div id="unified-domains-view" className="space-y-5">
          {/* Top Controls Bar: Category Filters, Search, AI Synthesis, Export */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                {Object.values(DOMAIN_CATEGORIES).map((cat) => (
                  <button
                    key={cat.id}
                    id={`cat-filter-${cat.id}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all font-medium ${
                      selectedCategory === cat.id
                        ? 'bg-[#8C2D19] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Action Buttons & Search */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search Field */}
                <div className="relative flex-1 sm:w-56 min-w-[180px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search rules, yogas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#8C2D19]"
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

                {/* Canonical Protocol Synthesis Button */}
                <button
                  id="btn-run-protocol-ai"
                  onClick={handleRunProtocolAi}
                  disabled={isProtocolSynthesizing}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-[#8C2D19] to-amber-900 hover:from-[#6E2213] hover:to-amber-950 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                  title="Execute Canonical 5-Layer Shastric Protocol across all 12 domains"
                >
                  {isProtocolSynthesizing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Computing Protocol...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Execute Protocol</span>
                    </>
                  )}
                </button>

                {/* Copy Dossier Button */}
                <button
                  id="btn-copy-protocol-report"
                  onClick={handleCopyProtocolReport}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="Copy full evaluation dossier"
                >
                  {copiedId === 'protocol_report' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Dossier</span>
                    </>
                  )}
                </button>

                {/* Download Markdown Dossier Button */}
                <button
                  id="btn-download-protocol-report"
                  onClick={handleDownloadProtocolReport}
                  className="px-3 py-1.5 bg-[#8C2D19] hover:bg-[#6E2213] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  title="Download Markdown dossier"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>

                {/* Script Preference Toggle */}
                <button
                  onClick={() =>
                    setScriptMode((prev) =>
                      prev === 'both' ? 'devanagari' : prev === 'devanagari' ? 'iast' : 'both'
                    )
                  }
                  title="Toggle Sanskrit Script Display"
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-serif flex items-center gap-1"
                >
                  <span>संस्कृत:</span>
                  <span className="font-bold text-[#8C2D19] uppercase text-[10px]">
                    {scriptMode === 'both' ? 'देव + IAST' : scriptMode === 'devanagari' ? 'देवनागरी' : 'IAST'}
                  </span>
                </button>
              </div>
            </div>

            {/* Astrometric Temporal & Daśā Context Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 text-xs">
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Chronological Age</span>
                <span className="text-sm font-bold text-slate-800 font-mono">
                  {deterministicProtocolReport.nativeAge} Years
                </span>
                <span className="text-[10px] text-slate-500 block">Metabolic & Maturity Cycle</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Mahādaśā</span>
                <span className="text-sm font-bold text-slate-800">
                  {deterministicProtocolReport.activeDashaSummary.mahadasha}
                </span>
                <span className="text-[10px] text-slate-500 block font-mono">Governing Planetary Lord</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Antardaśā</span>
                <span className="text-sm font-bold text-slate-800">
                  {deterministicProtocolReport.activeDashaSummary.antardasha}
                </span>
                <span className="text-[10px] text-slate-500 block font-mono truncate">
                  Valid until {deterministicProtocolReport.activeDashaSummary.endDate}
                </span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Weighting System</span>
                <span className="text-sm font-bold text-emerald-800">
                  5-Layer Strict
                </span>
                <span className="text-[10px] text-slate-500 block">40% • 25% • 15% • 10% • 10%</span>
              </div>
            </div>
          </div>

          {/* Canonical Prediction Protocol Synthesis Notification if active */}
          {protocolAiText && (
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#8C2D19]" />
                  Canonical Prediction Protocol Active ({protocolSynthesisSource})
                </span>
                <button
                  onClick={() => setProtocolAiText(null)}
                  className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline"
                >
                  Collapse Synthesis View
                </button>
              </div>
              <div className="text-xs text-slate-700 max-h-56 overflow-y-auto font-sans leading-relaxed bg-white/80 p-3.5 rounded-xl border border-amber-100 whitespace-pre-line">
                {protocolAiText}
              </div>
            </div>
          )}

          {/* Canonical Physical Appearance & Bodily Constitution Engine */}
          {appearanceProfile && (
            <div
              id="lagna-appearance-master-card"
              className="bg-white rounded-2xl border border-amber-200/90 shadow-xs overflow-hidden"
            >
              {/* Header & Toggle */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950 via-[#3D1810] to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight">
                        Lagna Physical Appearance & Constitution Engine
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/40">
                        10/10 Shastric Resolution
                      </span>
                    </div>
                    <p className="text-xs text-amber-200/80 font-sans mt-0.5">
                      तनुभाव एवं देहप्रकृति निर्णय • BPHS Ch. 4, Sārāvalī Ch. 21, Bṛhat Jātaka Ch. 17
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setShowAppearanceCard(!showAppearanceCard)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-amber-100 flex items-center gap-1.5 transition-colors"
                  >
                    <span>{showAppearanceCard ? 'Collapse Anatomy' : 'Expand Anatomy'}</span>
                    {showAppearanceCard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Quick Glance Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-amber-50/60 border-b border-amber-100 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-amber-200/70 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Stature & Build</span>
                  <span className="font-serif font-bold text-slate-900 text-sm block">
                    {appearanceProfile.stature.category}
                  </span>
                  <span className="text-[11px] text-amber-900 font-medium truncate block">
                    {appearanceProfile.stature.buildType}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-amber-200/70 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Complexion & Varṇa</span>
                  <span className="font-serif font-bold text-slate-900 text-sm block truncate">
                    {appearanceProfile.skinAndComplexion.classicalVarna}
                  </span>
                  <span className="text-[11px] text-amber-900 font-medium truncate block">
                    {appearanceProfile.skinAndComplexion.texture}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-amber-200/70 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Head, Eyes & Gaze</span>
                  <span className="font-serif font-bold text-slate-900 text-sm block truncate">
                    {appearanceProfile.faceAndHead.headShape}
                  </span>
                  <span className="text-[11px] text-amber-900 font-medium truncate block">
                    {appearanceProfile.eyesAndGaze.gazeIntensity}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-amber-200/70 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Ayurvedic Deha Prakriti</span>
                  <span className="font-serif font-bold text-amber-950 text-sm block">
                    {appearanceProfile.ayurvedicDosha.dominantPrakriti}
                  </span>
                  <span className="text-[10px] text-amber-900 font-medium truncate block">
                    {domain1Protocol?.constitutionResult?.elementalProfile?.dominantElementalTendency || 'Elemental Disposition'}
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown Panels */}
              {/* Collapsible Appearance Card Content */}
              {showAppearanceCard && (
                <div className="p-5 space-y-6 bg-white text-xs">
                  {/* Constitutional Evidence Stack & Contradiction Resolution (Phase 2) */}
                  {domain1Protocol?.constitutionResult && (
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-300/80 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-950 font-serif flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-[#8C2D19]" />
                              <span>Classical Evidence Stack & Multi-Factor Synthesis (संवाद-विवाद निर्णय)</span>
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                              domain1Protocol.constitutionResult.qualitativeState === 'strongly_supported'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : domain1Protocol.constitutionResult.qualitativeState === 'supported'
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : domain1Protocol.constitutionResult.qualitativeState === 'mixed'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : domain1Protocol.constitutionResult.qualitativeState === 'contradicted'
                                ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                : 'bg-slate-100 text-slate-900'
                            }`}>
                              {domain1Protocol.constitutionResult.qualitativeState.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                            Deterministic multi-factor evaluation weighing Lagneśa dignity, SAV threshold, Sūrya vitality, and Candra-Buddhi temperament.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] bg-white px-2 py-1 rounded border border-amber-200 text-slate-700 font-medium">
                            Stamina: <strong className="text-slate-900 capitalize">{domain1Protocol.constitutionResult.physicalStaminaState.replace('_', ' ')}</strong>
                          </span>
                          <span className="text-[10px] bg-white px-2 py-1 rounded border border-amber-200 text-slate-700 font-medium">
                            Mind: <strong className="text-slate-900 capitalize">{domain1Protocol.constitutionResult.mentalDispositionState.replace('_', ' ')}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Constitutional Tensions (Contradictions Resolved) */}
                      {domain1Protocol.constitutionResult.constitutionalTensions && domain1Protocol.constitutionResult.constitutionalTensions.length > 0 && (
                        <div className="p-3 bg-white rounded-lg border border-amber-200/90 space-y-2">
                          <span className="text-[10px] font-bold text-amber-950 uppercase tracking-wider block">
                            Evaluated Astrological Tensions & Shastric Resolutions
                          </span>
                          <div className="space-y-1.5">
                            {domain1Protocol.constitutionResult.constitutionalTensions.map((tension, tIdx) => (
                              <div key={tIdx} className="text-[11px] bg-amber-50/50 p-2 rounded border border-amber-200/50">
                                <span className="font-bold text-amber-900 block">{tension.factorA} vs. {tension.factorB}</span>
                                <p className="text-slate-700 mt-0.5"><strong className="text-slate-900">Tension:</strong> {tension.tensionDescription}</p>
                                <p className="text-emerald-900 font-medium mt-0.5"><strong className="text-emerald-950">Resolution Strategy:</strong> {tension.shastricResolution}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Unresolved Uncertainties */}
                      {domain1Protocol.constitutionResult.unresolvedUncertainties && domain1Protocol.constitutionResult.unresolvedUncertainties.length > 0 && (
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-600 space-y-1">
                          <span className="font-bold text-slate-700 block uppercase tracking-wider">Uncertainties & Boundary Disclaimers</span>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {domain1Protocol.constitutionResult.unresolvedUncertainties.map((unc, uIdx) => (
                              <li key={uIdx}>{unc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Executive Narrative */}
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                        <span>Canonical Physical Vessel Synthesis (Deha-Svarūpa)</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                        D1 {appearanceProfile.lagnaRashi} • D9 {appearanceProfile.d9LagnaRashi}
                      </span>
                    </div>
                    <p className="text-slate-800 text-[11px] leading-relaxed font-sans">
                      {appearanceProfile.executiveAppearanceNarrative}
                    </p>
                  </div>

                  {/* Section 1: 4 Core Anatomical Pillars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Stature & Skeletal Architecture */}
                    <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 font-serif border-b border-slate-200/70 pb-2">
                        <Compass className="w-4 h-4 text-[#8C2D19]" />
                        <span>Skeletal Stature & Build</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-[11px]">
                        {appearanceProfile.stature.heightTendencyCm} height tendency with {appearanceProfile.stature.boneStructure.toLowerCase()}.
                      </p>
                      <div className="pt-1.5 border-t border-slate-200/50 text-[10px] text-slate-500">
                        <span className="font-semibold text-slate-700">Torso:</span> {appearanceProfile.stature.chestAndShoulders}
                      </div>
                    </div>

                    {/* Facial Contours & Features */}
                    <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 font-serif border-b border-slate-200/70 pb-2">
                        <User className="w-4 h-4 text-[#8C2D19]" />
                        <span>Facial Architecture</span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-700">
                        <div><strong className="text-slate-900">Forehead:</strong> {appearanceProfile.faceAndHead.forehead}</div>
                        <div><strong className="text-slate-900">Jaw & Chin:</strong> {appearanceProfile.faceAndHead.jawAndChin}</div>
                        <div><strong className="text-slate-900">Contours:</strong> {appearanceProfile.faceAndHead.cheeksAndContours}</div>
                      </div>
                      <div className="pt-1.5 border-t border-slate-200/50 text-[10px] text-slate-500 truncate" title={appearanceProfile.faceAndHead.symmetryDescription}>
                        {appearanceProfile.faceAndHead.symmetryDescription}
                      </div>
                    </div>

                    {/* Eyes, Vision & Complexion */}
                    <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 font-serif border-b border-slate-200/70 pb-2">
                        <Eye className="w-4 h-4 text-[#8C2D19]" />
                        <span>Eyes, Gaze & Complexion</span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-700">
                        <div><strong className="text-slate-900">Eye Type:</strong> {appearanceProfile.eyesAndGaze.eyeType}</div>
                        <div><strong className="text-slate-900">Shade:</strong> {appearanceProfile.eyesAndGaze.shadeAndLuster}</div>
                        <div><strong className="text-slate-900">Skin:</strong> {appearanceProfile.skinAndComplexion.dermatologicalTendencies}</div>
                      </div>
                      <div className="pt-1.5 border-t border-slate-200/50 text-[10px] text-slate-500">
                        <strong className="text-slate-700">Hair:</strong> {appearanceProfile.hair.volumeAndGrowth}, {appearanceProfile.hair.curlPattern}
                      </div>
                    </div>

                    {/* Bearing, Gait & Stance */}
                    <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 font-serif border-b border-slate-200/70 pb-2">
                        <Activity className="w-4 h-4 text-[#8C2D19]" />
                        <span>Bearing & Stance</span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-700">
                        <div><strong className="text-slate-900">Gait:</strong> {appearanceProfile.gaitAndCarriage.gaitStyle}</div>
                        <div><strong className="text-slate-900">Postural Stance:</strong> {appearanceProfile.gaitAndCarriage.postureAndStance}</div>
                        <div><strong className="text-slate-900">Anatomical Focus:</strong> {appearanceProfile.distinctiveMarks.anatomicalFocalPoint}</div>
                      </div>
                      <div className="pt-1.5 border-t border-slate-200/50 text-[10px] text-slate-500 truncate" title={appearanceProfile.distinctiveMarks.drekkanaBodilyMapping}>
                        {appearanceProfile.distinctiveMarks.drekkanaBodilyMapping}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Influencing Grahas & Navāṃśa (D9) Deha-Svarūpa */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <span className="text-xs font-bold text-slate-900 font-serif flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#8C2D19]" />
                        <span>Graha Modifiers & Navāṃśa (D9) Mature Form (ग्रह प्रभाव एवं नवांश देह स्वरूप)</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Lagnesha: {appearanceProfile.lagnaLord} in {appearanceProfile.lagnaLordSign} ({appearanceProfile.lagnaLordDignity})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                      {/* Left: Lagna Lord Conjunctions & Aspects */}
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                        <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block">
                          Lagna Lord Conjunctions & Modifiers
                        </span>
                        {appearanceProfile.influencingGrahas?.lagnaLordConjunctions && appearanceProfile.influencingGrahas.lagnaLordConjunctions.length > 0 ? (
                          <ul className="space-y-1.5 text-slate-700">
                            {appearanceProfile.influencingGrahas.lagnaLordConjunctions.map((item, idx) => (
                              <li key={idx} className="leading-relaxed pl-2 border-l-2 border-amber-400">
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-slate-500 italic">
                            Lagna Lord {appearanceProfile.lagnaLord} sits unencumbered by direct conjunctions in {appearanceProfile.lagnaLordSign}, expressing clean, unadulterated canonical {appearanceProfile.lagnaRashi} traits.
                          </p>
                        )}

                        {appearanceProfile.influencingGrahas?.lagnaLordAspects && appearanceProfile.influencingGrahas.lagnaLordAspects.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 space-y-1">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                              Planetary Aspects on Lagna Lord
                            </span>
                            {appearanceProfile.influencingGrahas.lagnaLordAspects.map((asp, idx) => (
                              <p key={idx} className="text-[10px] text-slate-600 leading-snug">
                                • {asp}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right: D9 Navāṃśa Adult Appearance Synthesis */}
                      <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider block">
                            D9 Navāṃśa Mature Adult Contours
                          </span>
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Navāṃśa Lagna: {appearanceProfile.d9NavamshaLagnaDetails?.rashiName || appearanceProfile.d9LagnaRashi}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {appearanceProfile.d9NavamshaLagnaDetails?.adultMaturationEffect || appearanceProfile.influencingGrahas?.d9NavamshaSynthesis}
                        </p>
                        {appearanceProfile.d9NavamshaLagnaDetails?.occupantsInD9Lagna && appearanceProfile.d9NavamshaLagnaDetails.occupantsInD9Lagna.length > 0 && (
                          <div className="text-[10px] text-amber-800 bg-amber-50/70 p-2 rounded border border-amber-200/50">
                            <strong>D9 Lagna Occupants:</strong> {appearanceProfile.d9NavamshaLagnaDetails.occupantsInD9Lagna.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Mukha Bhāva (2nd House) & Left Eye / Sleep (12th House) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 2nd House: Mukha Bhāva */}
                    <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                        <span className="text-xs font-bold text-slate-900 font-serif flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#8C2D19]" />
                          <span>Mukha Bhāva (2nd House: Jaw, Smile & Voice)</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {appearanceProfile.secondHouseMukhaProfile?.rashiName}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-[11px] text-slate-700">
                        <div>
                          <strong className="text-slate-900">Jawline & Bone Structure:</strong>{' '}
                          {appearanceProfile.secondHouseMukhaProfile?.facialBoneAndJawline}
                        </div>
                        <div>
                          <strong className="text-slate-900">Teeth & Smile:</strong>{' '}
                          {appearanceProfile.secondHouseMukhaProfile?.teethAndSmile}
                        </div>
                        <div>
                          <strong className="text-slate-900">Vocal Timbre & Resonance:</strong>{' '}
                          {appearanceProfile.secondHouseMukhaProfile?.vocalTimbre}
                        </div>
                        <div>
                          <strong className="text-slate-900">Right Eye Luster:</strong>{' '}
                          {appearanceProfile.secondHouseMukhaProfile?.rightEyeLuster}
                        </div>
                      </div>
                    </div>

                    {/* 12th House: Left Eye & Somatosensory Sleep */}
                    <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                        <span className="text-xs font-bold text-slate-900 font-serif flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-[#8C2D19]" />
                          <span>Ocular & Sleep Architecture (12th House)</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {appearanceProfile.twelfthHouseLeftEyeProfile?.rashiName}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-[11px] text-slate-700">
                        <div>
                          <strong className="text-slate-900">Left Eye Appearance:</strong>{' '}
                          {appearanceProfile.twelfthHouseLeftEyeProfile?.leftEyeAppearance}
                        </div>
                        <div>
                          <strong className="text-slate-900">Rest & Sleep Architecture:</strong>{' '}
                          {appearanceProfile.twelfthHouseLeftEyeProfile?.sleepArchitecture}
                        </div>
                        <div className="pt-1 text-[10px] text-slate-500 italic">
                          Governed by lord {appearanceProfile.twelfthHouseLeftEyeProfile?.lordName}; reflects internal cellular renewal rhythms.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Granular Organ-by-Organ Anatomy Breakdown */}
                  {appearanceProfile.detailedAnatomy && (
                    <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                        <span className="text-xs font-bold text-slate-900 font-serif flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-[#8C2D19]" />
                          <span>Organ-by-Organ Anatomical Profile (प्रत्यङ्ग शारीर विवरण)</span>
                        </span>
                        <span className="text-[10px] text-slate-500">7 Anatomical Zones</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-[11px]">
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 space-y-1">
                          <span className="font-bold text-slate-900 text-xs block">Cranium & Forehead</span>
                          <p className="text-slate-600 leading-relaxed">{appearanceProfile.detailedAnatomy.craniumAndForehead}</p>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 space-y-1">
                          <span className="font-bold text-slate-900 text-xs block">Eyes & Brows</span>
                          <p className="text-slate-600 leading-relaxed">{appearanceProfile.detailedAnatomy.eyesAndBrows}</p>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 space-y-1">
                          <span className="font-bold text-slate-900 text-xs block">Nose & Bridge</span>
                          <p className="text-slate-600 leading-relaxed">{appearanceProfile.detailedAnatomy.noseAndBridge}</p>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 space-y-1">
                          <span className="font-bold text-slate-900 text-xs block">Lips, Teeth & Voice</span>
                          <p className="text-slate-600 leading-relaxed">{appearanceProfile.detailedAnatomy.lipsTeethAndVoice}</p>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 space-y-1">
                          <span className="font-bold text-slate-900 text-xs block">Neck, Shoulders & Chest</span>
                          <p className="text-slate-600 leading-relaxed">{appearanceProfile.detailedAnatomy.neckShouldersAndChest}</p>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 space-y-1">
                          <span className="font-bold text-slate-900 text-xs block">Hands, Fingers & Palms</span>
                          <p className="text-slate-600 leading-relaxed">{appearanceProfile.detailedAnatomy.handsFingersAndArms}</p>
                        </div>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 text-[11px] space-y-1">
                        <span className="font-bold text-slate-900 text-xs block">Spine, Pelvis & Lower Limbs</span>
                        <p className="text-slate-600 leading-relaxed">{appearanceProfile.detailedAnatomy.spinePelvisAndLimbs}</p>
                      </div>
                    </div>
                  )}

                  {/* Section 5: Specific Marks, Scars & Moles Catalog (Drekkāṇa Aṅga-Vibhāga) */}
                  {appearanceProfile.specificMarksCatalog && appearanceProfile.specificMarksCatalog.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/70 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-amber-200/60 pb-2">
                        <div>
                          <span className="text-xs font-bold text-amber-950 font-serif flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-[#8C2D19]" />
                            <span>Classical Bodily Mark Predisposition Vectors (तिलक, लाञ्छन एवं व्रण विचार)</span>
                          </span>
                          <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                            Evaluation of classical planetary indication vectors (BPHS Ch. 27 & Jātaka Pārijāta Ch. 5). Traditional indications represent astrological predispositions and are non-deterministic.
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded shrink-0">
                          {appearanceProfile.specificMarksCatalog.length} Indication Vectors Mapped
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                        {appearanceProfile.specificMarksCatalog.map((mark, idx) => (
                          <div key={idx} className="p-2.5 rounded-lg bg-white border border-amber-200/60 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                                    mark.type === 'Scar (Vraṇa)'
                                      ? 'bg-rose-100 text-rose-900'
                                      : mark.type === 'Mole (Tilaka)'
                                      ? 'bg-amber-100 text-amber-900'
                                      : mark.type === 'Birthmark (Lāñchana)'
                                      ? 'bg-purple-100 text-purple-900'
                                      : 'bg-blue-100 text-blue-900'
                                  }`}
                                >
                                  {mark.type}
                                </span>
                                {mark.indicationStatus && (
                                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                    mark.indicationStatus === 'Convergent'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {mark.indicationStatus}
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] font-mono text-slate-500">{mark.planetOrigin}</span>
                            </div>
                            <p className="text-slate-800 font-medium leading-snug">{mark.anatomicalDescription}</p>
                            <span className="text-[9px] text-slate-400 italic block">{mark.shastricBasis}</span>
                            {mark.uncertaintyNote && (
                              <span className="text-[9px] text-amber-800/80 block font-sans">
                                ↳ {mark.uncertaintyNote}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 6: Ayurvedic Deha Prakriti & Qualitative Elemental Profile */}
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-amber-950 font-serif">
                          Deha Prakṛti (त्रिदोष एवं पञ्चमहाभूत स्वभाव) — {appearanceProfile.ayurvedicDosha.dominantPrakriti} Constitutional Tendency
                        </span>
                        <p className="text-[11px] text-slate-700 font-sans mt-0.5 leading-relaxed">
                          {appearanceProfile.ayurvedicDosha.metabolicSignature}
                        </p>
                        <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                          Stamina & Recovery: {appearanceProfile.ayurvedicDosha.physicalStaminaSummary}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-amber-100/50 border border-amber-200/60 text-[10px] text-amber-900/90 leading-relaxed font-sans">
                      {appearanceProfile.ayurvedicDosha.epistemologicalDisclaimer ||
                        'Notice: Traditional Jyotiṣa constitutional archetypes (Bhūta-svarūpa & Deha-prakṛti) represent symbolic psycho-physical classifications and are not clinical, laboratory, or physiological medical diagnostics.'}
                    </div>

                    {/* Classical Maturation Arc (D1 Foundation -> D9 Crystallization -> Maturity) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                      <div className="p-2.5 rounded-lg bg-white border border-amber-200/60 text-[10px] space-y-0.5">
                        <span className="font-bold text-amber-900 block">Foundational Growth (D1)</span>
                        <p className="text-slate-600">{appearanceProfile.agingTrajectory.youthPhase}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-amber-200/60 text-[10px] space-y-0.5">
                        <span className="font-bold text-amber-900 block">Adult Maturation (D9)</span>
                        <p className="text-slate-600">{appearanceProfile.agingTrajectory.adultPrimePhase}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-amber-200/60 text-[10px] space-y-0.5">
                        <span className="font-bold text-amber-900 block">Mature Consolidation</span>
                        <p className="text-slate-600">{appearanceProfile.agingTrajectory.matureYearsPhase}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-amber-200/60 text-[10px] space-y-0.5">
                        <span className="font-bold text-amber-900 block">Longevity & Preservation</span>
                        <p className="text-slate-600">{appearanceProfile.agingTrajectory.elderPhase || 'Sustained bodily dignity anchored by Lagneśa dignity and Aṣṭakavarga capacity.'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 7: Classical Sanskrit Shloka for Appearance */}
                  {appearanceProfile.classicalCitation && (
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Canonical Shastric Authority on Physical Appearance
                      </span>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-serif font-bold text-amber-950">
                          <span>{appearanceProfile.classicalCitation.source}</span>
                          <span className="text-[10px] text-slate-500 font-sans">{appearanceProfile.classicalCitation.chapterVerse}</span>
                        </div>
                        {appearanceProfile.classicalCitation.sanskritShloka && (
                          <div className="p-2 rounded bg-amber-100/50 border border-amber-200/60 font-serif text-[11px] text-amber-950 leading-relaxed">
                            {appearanceProfile.classicalCitation.sanskritShloka}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-700 leading-relaxed font-sans">
                          {appearanceProfile.classicalCitation.englishTranslation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 12 Domains Unified Cards Grid */}
          {filteredDomains.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No life domains matched your filter query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDomains.map((domain) => {
                const IconComponent = DOMAIN_ICONS[domain.id] || Compass;
                const topPhala = domain.directClassicalPhalas[0];
                const isExpanded = expandedCardId === domain.id;
                const metRulesCount = domain.directClassicalPhalas.filter((p) => p.allConditionsMet).length;
                const domainNum = report.orderedDomainIds.indexOf(domain.id) + 1;
                const protoDom = deterministicProtocolReport.domains.find(
                  (d) => d.domainId === domain.id || d.domainNumber === domainNum
                );
                const activeTab = cardActiveTab[domain.id] || 'synthesis';

                return (
                  <div
                    key={domain.id}
                    id={`domain-card-${domain.id}`}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-2 bg-gradient-to-b from-white to-slate-50/40">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#8C2D19] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                          {domainNum}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-serif font-bold text-slate-900 text-sm leading-snug">
                              {domain.title}
                            </h3>
                          </div>
                          <span className="text-[11px] text-[#8C2D19] font-serif block">
                            {domain.sanskritTitle}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {protoDom && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white font-mono">
                            {protoDom.layers.compositeScore}/100
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {metRulesCount} Met / 8 Rules
                        </span>
                      </div>
                    </div>

                    {/* Core Disposition & Vargas Strip */}
                    <div className="px-4 py-2 bg-amber-50/40 border-b border-amber-100/60 flex items-center justify-between text-xs">
                      <span className="text-amber-900/90 font-medium truncate text-[11px]">
                        {domain.coreDisposition}
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold shrink-0 ml-2">
                        {domain.keyVargas.slice(0, 3).join(' • ')}
                      </span>
                    </div>

                    {/* Card Sub-Tab Switcher: 5-Layer Synthesis vs Canonical Phala */}
                    <div className="px-4 pt-3 pb-1 border-b border-slate-100 flex items-center gap-1.5 text-xs bg-slate-50/50">
                      <button
                        onClick={() =>
                          setCardActiveTab((prev) => ({ ...prev, [domain.id]: 'synthesis' }))
                        }
                        className={`flex-1 py-1.5 px-2 rounded-lg text-center font-medium transition-all text-[11px] ${
                          activeTab === 'synthesis'
                            ? 'bg-white text-[#8C2D19] shadow-xs border border-slate-200/80 font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        5-Layer Protocol & Verdict
                      </button>
                      <button
                        onClick={() =>
                          setCardActiveTab((prev) => ({ ...prev, [domain.id]: 'phala' }))
                        }
                        className={`flex-1 py-1.5 px-2 rounded-lg text-center font-medium transition-all text-[11px] ${
                          activeTab === 'phala'
                            ? 'bg-white text-[#8C2D19] shadow-xs border border-slate-200/80 font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Canonical Phala & Rules
                      </button>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 space-y-3 flex-1">
                      {/* TAB 1: 5-Layer Weighted Synthesis & Final Verdict */}
                      {activeTab === 'synthesis' && protoDom && (
                        <div className="space-y-3">
                          {/* 5-Layer Mini Matrix */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              5-Layer Weighted Matrix
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px]">
                              {/* Layer 1 */}
                              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/70">
                                <div className="flex justify-between font-semibold text-slate-600">
                                  <span>Lord (40%)</span>
                                  <span className="font-bold text-slate-900">{protoDom.layers.layer1.score}%</span>
                                </div>
                                <div className="text-[9px] text-slate-500 truncate" title={protoDom.layers.layer1.lordName}>
                                  {protoDom.layers.layer1.lordName} • H{protoDom.layers.layer1.housePlacement}
                                </div>
                              </div>

                              {/* Layer 2 */}
                              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/70">
                                <div className="flex justify-between font-semibold text-slate-600">
                                  <span>Kāraka (25%)</span>
                                  <span className="font-bold text-slate-900">{protoDom.layers.layer2.score}%</span>
                                </div>
                                <div className="text-[9px] text-slate-500 truncate" title={protoDom.layers.layer2.karakaName}>
                                  {protoDom.layers.layer2.karakaName} ({protoDom.layers.layer2.shadbalaRatio}x)
                                </div>
                              </div>

                              {/* Layer 3 */}
                              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/70">
                                <div className="flex justify-between font-semibold text-slate-600">
                                  <span>Varga (15%)</span>
                                  <span className="font-bold text-slate-900">{protoDom.layers.layer3.score}%</span>
                                </div>
                                <div className="text-[9px] text-slate-500 truncate" title={protoDom.layers.layer3.findings}>
                                  {protoDom.layers.layer3.chartsChecked.join(', ')}
                                </div>
                              </div>

                              {/* Layer 4 */}
                              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/70">
                                <div className="flex justify-between font-semibold text-slate-600">
                                  <span>SAV (10%)</span>
                                  <span className="font-bold text-slate-900">{protoDom.layers.layer4.score}%</span>
                                </div>
                                <div className="text-[9px] text-slate-500 truncate">
                                  {protoDom.layers.layer4.houseBindus} Bindus
                                </div>
                              </div>

                              {/* Layer 5 */}
                              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/70 col-span-2 sm:col-span-1">
                                <div className="flex justify-between font-semibold text-slate-600">
                                  <span>Daśā (10%)</span>
                                  <span className="font-bold text-slate-900">{protoDom.layers.layer5.score}%</span>
                                </div>
                                <div className="text-[9px] text-slate-500 truncate">
                                  {protoDom.layers.layer5.activeMahadasha}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Overrides / Yogas Badge strip */}
                          {(protoDom.layers.nichabhangaOverrides.length > 0 || protoDom.layers.rajaYogasApplied.length > 0) && (
                            <div className="flex flex-wrap items-center gap-1 pt-0.5">
                              {protoDom.layers.nichabhangaOverrides.map((ov, i) => (
                                <span
                                  key={`nb-${i}`}
                                  className="px-2 py-0.5 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200"
                                >
                                  Nīchabhanga: {ov}
                                </span>
                              ))}
                              {protoDom.layers.rajaYogasApplied.map((ry, i) => (
                                <span
                                  key={`ry-${i}`}
                                  className="px-2 py-0.5 rounded text-[9px] font-semibold bg-amber-50 text-amber-900 border border-amber-200"
                                >
                                  Yoga: {ry}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Phase 3: Classical Career Architecture & Multi-Factor Stack */}
                          {protoDom.careerResult && (
                            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-300/80 space-y-3">
                              {/* Header & Status Badges */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-amber-950 font-serif flex items-center gap-1">
                                      <Briefcase className="w-3.5 h-3.5 text-[#8C2D19]" />
                                      <span>Career Architecture & Karmasthāna Stack (कर्म-वृत्ति निर्णय)</span>
                                    </span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
                                      protoDom.careerResult.qualitativeState === 'strongly_supported'
                                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                        : protoDom.careerResult.qualitativeState === 'supported'
                                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                        : protoDom.careerResult.qualitativeState === 'mixed'
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                        : protoDom.careerResult.qualitativeState === 'contradicted'
                                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                        : 'bg-slate-100 text-slate-800 border border-slate-300'
                                    }`}>
                                      {protoDom.careerResult.qualitativeState.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-amber-200 capitalize">
                                      {protoDom.careerResult.careerStrength.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-600 font-sans">
                                    Chart-dependent multi-factor synthesis evaluating 10th Bhāva, Daśameśa, Sūrya, Śani, D10 Daśāṃśa, and SAV capacity.
                                  </p>
                                </div>
                                <div className="text-[10px] font-medium text-amber-900 bg-white/90 px-2 py-1 rounded border border-amber-200/80 shrink-0 capitalize">
                                  Authority: <strong className="text-slate-900">{protoDom.careerResult.authorityLevel.replace(/_/g, ' ')}</strong>
                                </div>
                              </div>

                              {/* Key Vocational Coordinates Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                <div className="p-2 bg-white rounded-lg border border-amber-200/70 space-y-0.5">
                                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Primary Field & Archetype</span>
                                  <span className="font-serif font-bold text-slate-900 text-xs block truncate" title={protoDom.careerResult.primaryArchetype.title}>
                                    {protoDom.careerResult.primaryArchetype.title}
                                  </span>
                                  <span className="text-[10px] text-amber-800 block truncate capitalize">
                                    {protoDom.careerResult.primaryArchetype.sanskritName} • {protoDom.careerResult.primaryArchetype.confidence} affinity
                                  </span>
                                </div>

                                <div className="p-2 bg-white rounded-lg border border-amber-200/70 space-y-0.5">
                                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Work Mode Orientation</span>
                                  <span className="font-semibold text-slate-900 text-xs block truncate" title={protoDom.careerResult.workMode.title}>
                                    {protoDom.careerResult.workMode.title}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block truncate">
                                    6th (Sevā): {protoDom.careerResult.workMode.sixthHouseWeight} • 7th (Vyāpāra): {protoDom.careerResult.workMode.seventhHouseWeight}
                                  </span>
                                </div>

                                <div className="p-2 bg-white rounded-lg border border-amber-200/70 space-y-0.5">
                                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Stability & SAV Prāṇa</span>
                                  <span className="font-semibold text-slate-900 text-xs block truncate" title={protoDom.careerResult.stability.title}>
                                    {protoDom.careerResult.stability.title}
                                  </span>
                                  <span className="text-[10px] text-slate-600 block truncate">
                                    {protoDom.careerResult.stability.savEvaluation}
                                  </span>
                                </div>
                              </div>

                              {/* Workplace Environment & D10 Confirmation */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                <div className="p-2 bg-white rounded-lg border border-amber-100 space-y-1">
                                  <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">Workplace Setting & Scale</span>
                                  <p className="text-slate-700 leading-tight">
                                    <strong className="text-slate-900">{protoDom.careerResult.workplaceEnvironment.settingType}</strong> ({protoDom.careerResult.workplaceEnvironment.institutionalScale}).
                                  </p>
                                  {protoDom.careerResult.workplaceEnvironment.culturalAttributes.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {protoDom.careerResult.workplaceEnvironment.culturalAttributes.map((attr, aIdx) => (
                                        <span key={aIdx} className="text-[9px] bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200/60">
                                          {attr}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="p-2 bg-white rounded-lg border border-amber-100 space-y-1">
                                  <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">Daśāṃśa (D10) Varga Confirmation</span>
                                  <p className="text-slate-700 leading-tight">
                                    {protoDom.careerResult.d10Details.shastricNote}
                                  </p>
                                  <div className="text-[9px] font-mono text-amber-800 bg-amber-50/60 px-1.5 py-0.5 rounded border border-amber-200/50 mt-1">
                                    D10 Lagna: {protoDom.careerResult.d10Details.d10LagnaRashi} • D10 10th Lord: {protoDom.careerResult.d10Details.d10TenthLord} • D1 Lord in D10: {protoDom.careerResult.d10Details.d10D1LordPlacement}
                                  </div>
                                </div>
                              </div>

                              {/* Career Tensions & Shastric Resolutions */}
                              {protoDom.careerResult.careerTensions && protoDom.careerResult.careerTensions.length > 0 && (
                                <div className="p-2.5 bg-white rounded-lg border border-amber-200/80 space-y-1.5">
                                  <span className="text-[10px] font-bold text-amber-950 uppercase tracking-wider block">
                                    Evaluated Career Tensions & Classical Resolutions
                                  </span>
                                  <div className="space-y-1.5">
                                    {protoDom.careerResult.careerTensions.map((tension, tIdx) => (
                                      <div key={tIdx} className="text-[10px] bg-amber-50/50 p-2 rounded border border-amber-200/60 space-y-0.5">
                                        <span className="font-bold text-amber-900 block">{tension.factorA} vs. {tension.factorB}</span>
                                        <p className="text-slate-700"><strong className="text-slate-900">Tension:</strong> {tension.tensionDescription}</p>
                                        <p className="text-emerald-900 font-medium"><strong className="text-emerald-950">Shastric Resolution:</strong> {tension.shastricResolution}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Obstacles & Classical Mitigations */}
                              {protoDom.careerResult.obstacles && protoDom.careerResult.obstacles.length > 0 && (
                                <div className="p-2 bg-rose-50/60 rounded-lg border border-rose-200/80 space-y-1">
                                  <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wider block">
                                    Classical Karmic Obstacles & Classical Mitigations
                                  </span>
                                  <div className="space-y-1">
                                    {protoDom.careerResult.obstacles.map((obs, oIdx) => (
                                      <div key={oIdx} className="text-[10px] bg-white/90 p-1.5 rounded border border-rose-100 space-y-0.5">
                                        <span className="font-bold text-rose-950 block">{obs.obstacleType}</span>
                                        <p className="text-slate-700">{obs.manifestation}</p>
                                        <p className="text-emerald-900 font-medium"><strong className="text-emerald-950">Classical Mitigation:</strong> {obs.shastricMitigation}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Phase 6: Classical Marriage, Spouse & Sacred Partnership Stack */}
                          {protoDom.marriageResult && (
                            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-300/80 space-y-3">
                              {/* Header & Status Badges */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-200/80 pb-2">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-rose-950 font-serif flex items-center gap-1">
                                      <Heart className="w-3.5 h-3.5 text-[#8C2D19]" />
                                      <span>Marriage, Spouse & Sacred Partnership Stack (कलत्र-दाम्पत्य निर्णय)</span>
                                    </span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
                                      protoDom.marriageResult.qualitativeState === 'strongly_supported'
                                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                        : protoDom.marriageResult.qualitativeState === 'supported'
                                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                        : protoDom.marriageResult.qualitativeState === 'mixed'
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                        : protoDom.marriageResult.qualitativeState === 'contradicted'
                                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                        : 'bg-slate-100 text-slate-800 border border-slate-300'
                                    }`}>
                                      {protoDom.marriageResult.qualitativeState.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-rose-200 capitalize">
                                      {protoDom.marriageResult.marriagePromise.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-600 font-sans">
                                    Multi-layered classical evaluation across D1 Rāśi, D9 Navāṃśa, Jaimini Upapada Lagna & Dārakāraka, Kuja Doṣa & authentic Daśā timing.
                                  </p>
                                </div>
                                <div className="text-[10px] font-medium text-rose-900 bg-white/90 px-2 py-1 rounded border border-rose-200/80 shrink-0">
                                  7th SAV: <strong className="text-slate-900">{protoDom.marriageResult.houseSAVBindus[7]?.bindus || 28} bindus</strong>
                                </div>
                              </div>

                              {/* Key Matrimonial Coordinates Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                <div className="p-2 bg-white rounded-lg border border-rose-200/70 space-y-0.5">
                                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Spousal Archetype</span>
                                  <span className="font-serif font-bold text-slate-900 text-xs block truncate" title={protoDom.marriageResult.spousalProfile.archetypeTitle}>
                                    {protoDom.marriageResult.spousalProfile.archetypeTitle}
                                  </span>
                                  <span className="text-[10px] text-rose-800 block truncate capitalize">
                                    {protoDom.marriageResult.spousalProfile.sanskritName} • Signifiers: {protoDom.marriageResult.spousalProfile.signifyingGrahas.join(', ')}
                                  </span>
                                </div>

                                <div className="p-2 bg-white rounded-lg border border-rose-200/70 space-y-0.5">
                                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Delay vs Denial (Vilamba)</span>
                                  <span className="font-semibold text-slate-900 text-xs block truncate" title={protoDom.marriageResult.delayVsDenial.classicalVerdict}>
                                    {protoDom.marriageResult.delayVsDenial.isDelayed ? 'Delayed / Mature Realization' : 'Timely / Standard Promise'}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block truncate">
                                    {protoDom.marriageResult.delayVsDenial.delayingFactors.length > 0 ? protoDom.marriageResult.delayVsDenial.delayingFactors[0] : 'Saturnine delays absent'}
                                  </span>
                                </div>

                                <div className="p-2 bg-white rounded-lg border border-rose-200/70 space-y-0.5">
                                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Kuja Doṣa Status</span>
                                  <span className={`font-semibold text-xs block truncate ${protoDom.marriageResult.kujaDosha.isFormed && !protoDom.marriageResult.kujaDosha.isFullyCancelled ? 'text-rose-700' : 'text-slate-900'}`}>
                                    {protoDom.marriageResult.kujaDosha.isFormed
                                      ? (protoDom.marriageResult.kujaDosha.isFullyCancelled ? 'Formed with Shastric Bhaṅga' : 'Active Kuja Doṣa')
                                      : 'Free from Kuja Doṣa'}
                                  </span>
                                  <span className="text-[10px] text-slate-600 block truncate">
                                    {protoDom.marriageResult.kujaDosha.isFormed ? `Mars in H${protoDom.marriageResult.kujaDosha.marsPlacementHouse}` : 'Absent from Lagna/Moon/Venus'}
                                  </span>
                                </div>
                              </div>

                              {/* Varga (D9) & Jaimini Confirmation */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                <div className="p-2 bg-white rounded-lg border border-rose-100 space-y-1">
                                  <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">Navāṃśa (D9) Varga Confirmation</span>
                                  <p className="text-slate-700 leading-tight">
                                    {protoDom.marriageResult.d9NavamshaConfirmation.shastricNote}
                                  </p>
                                  <div className="text-[9px] font-mono text-rose-800 bg-rose-50/60 px-1.5 py-0.5 rounded border border-rose-200/50 mt-1">
                                    D9 7th Lord: {protoDom.marriageResult.d9NavamshaConfirmation.d9SeventhLord} • Varga Status: {protoDom.marriageResult.d9NavamshaConfirmation.vargaConfirmationStatus.replace(/_/g, ' ')}
                                  </div>
                                </div>

                                <div className="p-2 bg-white rounded-lg border border-rose-100 space-y-1">
                                  <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">Jaimini Upapada (UL) & Dārakāraka</span>
                                  <p className="text-slate-700 leading-tight">
                                    {protoDom.marriageResult.jaiminiFactors.jaiminiSynthesis}
                                  </p>
                                  <div className="text-[9px] font-mono text-rose-800 bg-rose-50/60 px-1.5 py-0.5 rounded border border-rose-200/50 mt-1">
                                    UL Rashi: {protoDom.marriageResult.jaiminiFactors.upapadaLagnaRashi} • DK Graha: {protoDom.marriageResult.jaiminiFactors.darakarakaGraha.name} ({protoDom.marriageResult.jaiminiFactors.darakarakaGraha.rashi})
                                  </div>
                                </div>
                              </div>

                              {/* Marriage Tensions & Shastric Resolutions */}
                              {protoDom.marriageResult.marriageTensions && protoDom.marriageResult.marriageTensions.length > 0 && (
                                <div className="p-2.5 bg-white rounded-lg border border-rose-200/80 space-y-1.5">
                                  <span className="text-[10px] font-bold text-rose-950 uppercase tracking-wider block">
                                    Evaluated Matrimonial Tensions & Classical Resolutions
                                  </span>
                                  <div className="space-y-1.5">
                                    {protoDom.marriageResult.marriageTensions.map((tension, tIdx) => (
                                      <div key={tIdx} className="text-[10px] bg-rose-50/50 p-2 rounded border border-rose-200/60 space-y-0.5">
                                        <span className="font-bold text-rose-900 block">{tension.factorA} vs. {tension.factorB}</span>
                                        <p className="text-slate-700"><strong className="text-slate-900">Tension:</strong> {tension.tensionDescription}</p>
                                        <p className="text-emerald-900 font-medium"><strong className="text-emerald-950">Shastric Resolution:</strong> {tension.shastricResolution}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Obstacles & Classical Mitigations */}
                              {protoDom.marriageResult.obstacles && protoDom.marriageResult.obstacles.length > 0 && (
                                <div className="p-2 bg-rose-50/60 rounded-lg border border-rose-200/80 space-y-1">
                                  <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wider block">
                                    Classical Karmic Obstacles & Mitigations
                                  </span>
                                  <div className="space-y-1">
                                    {protoDom.marriageResult.obstacles.map((obs, oIdx) => (
                                      <div key={oIdx} className="text-[10px] bg-white/90 p-1.5 rounded border border-rose-100 space-y-0.5">
                                        <span className="font-bold text-rose-950 block">{obs.obstacleType}</span>
                                        <p className="text-slate-700">{obs.manifestation}</p>
                                        {obs.shastricMitigation && (
                                          <p className="text-emerald-900 font-medium"><strong className="text-emerald-950">Classical Mitigation:</strong> {obs.shastricMitigation}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Phase 7: Classical Children, Progeny & Lineage Continuity Stack */}
                          {protoDom.progenyResult && (
                            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-300/80 space-y-3">
                              {/* Header & Status Badges */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-2">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-emerald-950 font-serif flex items-center gap-1">
                                      <Users className="w-3.5 h-3.5 text-[#8C2D19]" />
                                      <span>Children, Progeny & Lineage Continuity Stack (सन्तान-पुत्र निर्णय)</span>
                                    </span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${
                                      protoDom.progenyResult.qualitativeState === 'strongly_supported'
                                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                        : protoDom.progenyResult.qualitativeState === 'supported'
                                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                        : protoDom.progenyResult.qualitativeState === 'mixed'
                                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                        : protoDom.progenyResult.qualitativeState === 'contradicted'
                                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                        : 'bg-slate-100 text-slate-800 border border-slate-300'
                                    }`}>
                                      {protoDom.progenyResult.qualitativeState.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-emerald-200 capitalize">
                                      {protoDom.progenyResult.progenyPromise.replace(/_/g, ' ')}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-600 font-sans">
                                    Multi-layered classical evaluation across D1 Rāśi 5th Bhāva, D7 Saptāṃśa, Bīja/Kṣetra Sphuṭas, Jaimini Putrakāraka & Kārakāṃśa, and Karmic Śāpa analysis.
                                  </p>
                                </div>
                                <div className="text-[10px] font-medium text-emerald-900 bg-white/90 px-2 py-1 rounded border border-emerald-200/80 shrink-0">
                                  5th SAV: <strong className="text-slate-900">{protoDom.progenyResult.fifthHouse.savBindus} bindus</strong> ({protoDom.progenyResult.fifthHouse.savEvaluation.replace(/_/g, ' ')})
                                </div>
                              </div>

                              {/* Key Procreative Coordinates Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                <div className="p-2 bg-white rounded-lg border border-emerald-200/70 space-y-0.5">
                                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">5th Bhāva & Putreśa</span>
                                  <span className="font-serif font-bold text-slate-900 text-xs block truncate" title={protoDom.progenyResult.fifthLord.name}>
                                    {protoDom.progenyResult.fifthHouse.rashiName} ({protoDom.progenyResult.fifthHouse.fertilityType})
                                  </span>
                                  <span className="text-[10px] text-emerald-800 block truncate capitalize">
                                    Lord: {protoDom.progenyResult.fifthLord.name} in H{protoDom.progenyResult.fifthLord.house} • {protoDom.progenyResult.fifthLord.dignity}
                                  </span>
                                </div>

                                <div className="p-2 bg-white rounded-lg border border-emerald-200/70 space-y-0.5">
                                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Natural Kāraka Jupiter</span>
                                  <span className="font-semibold text-slate-900 text-xs block truncate">
                                    Guru in H{protoDom.progenyResult.naturalKarakaJupiter.house} ({protoDom.progenyResult.naturalKarakaJupiter.rashiName})
                                  </span>
                                  <span className="text-[10px] text-slate-600 block truncate">
                                    {protoDom.progenyResult.naturalKarakaJupiter.dignity} • Śaḍbala {protoDom.progenyResult.naturalKarakaJupiter.shadbalaRatio.toFixed(2)}x
                                  </span>
                                </div>

                                <div className="p-2 bg-white rounded-lg border border-emerald-200/70 space-y-0.5">
                                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Delay vs Denial (Vilamba)</span>
                                  <span className="font-semibold text-slate-900 text-xs block truncate" title={protoDom.progenyResult.delayVsDenial.classicalTextSummary}>
                                    {protoDom.progenyResult.delayVsDenial.verdictType.replace(/_/g, ' ')}
                                  </span>
                                  <span className="text-[10px] text-slate-500 block truncate">
                                    {protoDom.progenyResult.delayVsDenial.delayingFactors.length > 0 ? protoDom.progenyResult.delayVsDenial.delayingFactors[0] : 'Saturnine delays absent'}
                                  </span>
                                </div>
                              </div>

                              {/* Varga (D7) & Specialized Sphutas Confirmation */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                <div className="p-2 bg-white rounded-lg border border-emerald-100 space-y-1">
                                  <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">Saptāṃśa (D7) Varga Confirmation</span>
                                  <p className="text-slate-700 leading-tight">
                                    {protoDom.progenyResult.d7Saptamsha.shastricNote}
                                  </p>
                                  <div className="text-[9px] font-mono text-emerald-800 bg-emerald-50/60 px-1.5 py-0.5 rounded border border-emerald-200/50 mt-1">
                                    D7 Lagna: {protoDom.progenyResult.d7Saptamsha.d7LagnaRashi} • D7 5th Lord: {protoDom.progenyResult.d7Saptamsha.d7FifthLord} • D1 5th Lord in D7 H{protoDom.progenyResult.d7Saptamsha.d1FifthLordPlacementInD7.houseInD7} ({protoDom.progenyResult.d7Saptamsha.d1FifthLordPlacementInD7.dignityInD7})
                                  </div>
                                </div>

                                <div className="p-2 bg-white rounded-lg border border-emerald-100 space-y-1">
                                  <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">Specialized Sphuṭas (Bīja / Kṣetra / Tithi)</span>
                                  <p className="text-slate-700 leading-tight">
                                    Bīja: {protoDom.progenyResult.specializedSphutas.beejaSphuta?.status || 'Balanced'} • Kṣetra: {protoDom.progenyResult.specializedSphutas.kshetraSphuta?.status || 'Balanced'}
                                  </p>
                                  <div className="text-[9px] font-mono text-emerald-800 bg-emerald-50/60 px-1.5 py-0.5 rounded border border-emerald-200/50 mt-1">
                                    Bīja: {protoDom.progenyResult.specializedSphutas.beejaSphuta?.rashiName} ({((protoDom.progenyResult.specializedSphutas.beejaSphuta?.longitude ?? 0) % 30).toFixed(1)}°) • Santāna Tithi: {protoDom.progenyResult.specializedSphutas.santanaTithi?.tithiName} ({protoDom.progenyResult.specializedSphutas.santanaTithi?.isAuspicious ? 'Auspicious' : 'Challenged'})
                                  </div>
                                </div>
                              </div>

                              {/* Jaimini Progeny Factors */}
                              <div className="p-2 bg-white rounded-lg border border-emerald-100 space-y-1 text-[11px]">
                                <span className="font-bold text-slate-800 block text-[10px] uppercase tracking-wider">Jaimini Putrakāraka (PK) & Kārakāṃśa (KL)</span>
                                <p className="text-slate-700 leading-tight">
                                  {protoDom.progenyResult.jaiminiProgeny.jaiminiProgenyVerdict}
                                </p>
                                <div className="text-[9px] font-mono text-emerald-800 bg-emerald-50/60 px-1.5 py-0.5 rounded border border-emerald-200/50">
                                  PK Graha: {protoDom.progenyResult.jaiminiProgeny.putrakarakaGraha.name} (H{protoDom.progenyResult.jaiminiProgeny.putrakarakaGraha.house}) • KL Rashi: {protoDom.progenyResult.jaiminiProgeny.karakamshaRashi} • 5th from KL: {protoDom.progenyResult.jaiminiProgeny.fifthFromKarakamshaRashi} • Putrapada (A5): H{protoDom.progenyResult.jaiminiProgeny.putrapadaA5.houseFromLagna}
                                </div>
                              </div>

                              {/* Progeny Tensions & Shastric Resolutions */}
                              {protoDom.progenyResult.progenyTensions && protoDom.progenyResult.progenyTensions.length > 0 && (
                                <div className="p-2.5 bg-white rounded-lg border border-emerald-200/80 space-y-1.5">
                                  <span className="text-[10px] font-bold text-emerald-950 uppercase tracking-wider block">
                                    Evaluated Progeny Tensions & Classical Resolutions
                                  </span>
                                  <div className="space-y-1.5">
                                    {protoDom.progenyResult.progenyTensions.map((tension, tIdx) => (
                                      <div key={tIdx} className="text-[10px] bg-emerald-50/50 p-2 rounded border border-emerald-200/60 space-y-0.5">
                                        <span className="font-bold text-emerald-900 block">{tension.factorA} vs. {tension.factorB}</span>
                                        <p className="text-slate-700"><strong className="text-slate-900">Tension:</strong> {tension.tensionDescription}</p>
                                        <p className="text-emerald-900 font-medium"><strong className="text-emerald-950">Shastric Resolution:</strong> {tension.shastricResolution}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Karmic Shapas & Classical Remedies */}
                              {protoDom.progenyResult.shapasAndObstacles && protoDom.progenyResult.shapasAndObstacles.length > 0 && (
                                <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-200/80 space-y-1">
                                  <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
                                    Classical Karmic Śāpas & Shastric Remedies (BPHS Ch. 13)
                                  </span>
                                  <div className="space-y-1">
                                    {protoDom.progenyResult.shapasAndObstacles.map((shapa, sIdx) => (
                                      <div key={sIdx} className="text-[10px] bg-white/90 p-1.5 rounded border border-emerald-100 space-y-0.5">
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-emerald-950">{shapa.shapaType}</span>
                                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                                            shapa.hasBhanga
                                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                                          }`}>
                                            {shapa.hasBhanga ? 'Bhaṅga Formed (Mitigated)' : 'Active Obstacle'}
                                          </span>
                                        </div>
                                        <p className="text-slate-700">{shapa.diagnosticSymptoms}</p>
                                        {shapa.hasBhanga && shapa.bhangaReason && (
                                          <p className="text-blue-900"><strong className="text-blue-950">Bhaṅga Rationale:</strong> {shapa.bhangaReason}</p>
                                        )}
                                        {shapa.classicalRemedy && (
                                          <p className="text-emerald-900 font-medium"><strong className="text-emerald-950">Shastric Remedy:</strong> {shapa.classicalRemedy}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Vocational Rankings if Domain 3 */}
                          {protoDom.careerRankings && protoDom.careerRankings.length > 0 && (
                            <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-1.5">
                              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                                <Briefcase className="w-3 h-3 text-[#8C2D19]" />
                                <span>Vocational Capability Alignments</span>
                              </span>
                              <div className="space-y-1">
                                {protoDom.careerRankings.slice(0, 3).map((cr) => (
                                  <div
                                    key={cr.rank}
                                    className="flex items-center justify-between text-xs py-0.5 px-1.5 rounded bg-white border border-amber-100"
                                  >
                                    <div className="flex items-center gap-1.5 truncate">
                                      <span className="w-4 h-4 rounded-full bg-[#8C2D19] text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                                        #{cr.rank}
                                      </span>
                                      <span className="font-semibold text-slate-900 truncate text-[11px]">
                                        {cr.fieldTitle}
                                      </span>
                                    </div>
                                    <span className="font-mono font-bold text-[10px] text-emerald-800 shrink-0">
                                      {cr.totalScore}/100
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Timeline of Manifestation */}
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-start gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                            <div className="text-[11px] text-slate-700 font-sans leading-relaxed">
                              <strong className="text-slate-900">Timeline:</strong> {protoDom.timelineOfManifestation}
                            </div>
                          </div>

                          {/* Sub-Facets Breakdown (10/10 Granularity) */}
                          {protoDom.subFacets && protoDom.subFacets.length > 0 && (
                            <div className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-2">
                              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                                Deep Sub-Facet Analysis
                              </span>
                              <div className="space-y-1.5">
                                {protoDom.subFacets.map((sf, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="p-2 rounded-lg bg-white border border-slate-200/60 space-y-1 text-xs"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-slate-900 text-[11px]">
                                        {sf.title}
                                      </span>
                                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                                        Strength: {sf.confidence}/100
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 leading-relaxed">
                                      {sf.verdict}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Classical Conditions Audited (Verification Matrix) */}
                          {protoDom.conditionsAudited && protoDom.conditionsAudited.length > 0 && (
                            <div className="p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-[#8C2D19]" />
                                  <span>Classical Condition Audit ({protoDom.conditionsAudited.length} Rules)</span>
                                </span>
                              </div>
                              <div className="space-y-1">
                                {protoDom.conditionsAudited.map((cond, cIdx) => (
                                  <div
                                    key={cIdx}
                                    className="p-1.5 rounded-lg bg-white border border-slate-100 flex items-start justify-between gap-1.5 text-[10px]"
                                  >
                                    <div className="space-y-0.5 min-w-0">
                                      <div className="font-semibold text-slate-800 truncate" title={cond.conditionName}>
                                        {cond.conditionName}
                                      </div>
                                      <div className="text-slate-500 text-[9px] truncate">
                                        {cond.sourceText} • {cond.concreteEffect}
                                      </div>
                                    </div>
                                    <span
                                      className={`px-1.5 py-0.5 rounded font-bold shrink-0 text-[9px] ${
                                        cond.status === 'Fully Verified'
                                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                          : cond.status === 'Partially Present'
                                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                          : cond.status === 'Contradicted'
                                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                                      }`}
                                    >
                                      {cond.status}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Chronological Milestones */}
                          {protoDom.chronologicalMilestones && protoDom.chronologicalMilestones.length > 0 && (
                            <div className="p-2.5 bg-amber-50/40 rounded-xl border border-amber-200/60 space-y-1">
                              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                                Chronological Life Cycle Milestones
                              </span>
                              <div className="grid grid-cols-2 gap-1 text-[10px]">
                                {protoDom.chronologicalMilestones.map((m, mIdx) => (
                                  <div key={mIdx} className="p-1.5 rounded bg-white border border-amber-100">
                                    <span className="font-bold text-[#8C2D19] block">{m.ageRange}</span>
                                    <span className="text-slate-500 text-[9px] block truncate">{m.lifecyclePhase}</span>
                                    <p className="text-slate-700 text-[10px] line-clamp-2 mt-0.5">{m.expectedManifestation}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Classical Remedies & Mitigations */}
                          {protoDom.classicalRemediesAndPrecautions && protoDom.classicalRemediesAndPrecautions.length > 0 && (
                            <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200/70 space-y-1">
                              <span className="text-[10px] font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1">
                                <Shield className="w-3 h-3 text-emerald-700" />
                                <span>Classical Remedies & Shastric Mitigations</span>
                              </span>
                              <ul className="list-disc list-inside text-[10px] text-emerald-900 space-y-0.5">
                                {protoDom.classicalRemediesAndPrecautions.map((rem, rIdx) => (
                                  <li key={rIdx} className="leading-snug">{rem}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Final Verdict (Strict Synthesis) */}
                          <div className="bg-slate-900 text-slate-100 p-3 rounded-xl text-xs font-sans leading-relaxed shadow-xs">
                            <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-amber-400" />
                              <span>Strict Verdict</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-200">
                              {protoDom.finalVerdict}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: Canonical Phalas & Verified Conditions */}
                      {activeTab === 'phala' && (
                        <div className="space-y-3">
                          {/* Direct Canonical Phala Preview */}
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                              <BookOpen className="w-3 h-3 text-[#8C2D19]" />
                              <span>Direct Canonical Phala</span>
                            </div>
                            <p className="text-xs text-slate-800 leading-relaxed font-sans line-clamp-3">
                              {domain.conciseSummary}
                            </p>
                          </div>

                          {/* Quick Verified Natal Conditions */}
                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                              Verified Natal Astrometrics
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

                          {/* Top Canonical Rule Preview */}
                          {topPhala && (
                            <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5 text-xs">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-amber-950 font-serif">
                                  {topPhala.sourceText} • {topPhala.chapterAndVerse}
                                </span>
                                <span className="font-semibold text-emerald-800">
                                  {topPhala.verificationLevel}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-800 leading-relaxed font-sans line-clamp-2">
                                {topPhala.directPhalaText}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-3 px-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                      <button
                        id={`btn-details-${domain.id}`}
                        onClick={() => {
                          setSelectedDomainModal(domain);
                          setModalTab('shlokas');
                          setAiSynthesisText(null);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C2D19] hover:text-[#6E2213] transition-colors"
                      >
                        <span>Inspect 8 Rules & Full Proof</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopySummary(domain)}
                          title="Copy domain evaluation"
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200/60 transition-colors"
                        >
                          {copiedId === domain.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: CLASSICAL SŪTRA & RULE LIBRARY (शास्त्रीय सूत्र ग्रन्थालय) */}
      {/* ========================================================================= */}
      {viewMode === 'rules_library' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-slate-900">
                  Canonical Sūtra & Classical Rule Library (शास्त्रीय ग्रन्थ संहिता)
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Browse and verify authentic astrological rules from ancient Jyotiṣa manuscripts against the native&apos;s chart.
                </p>
              </div>

              {/* Library Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Source Filter */}
                <select
                  value={librarySourceFilter}
                  onChange={(e) => setLibrarySourceFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
                >
                  <option value="all">All Treatises (सर्व ग्रन्थ)</option>
                  <option value="Parāśara">Bṛhat Parāśara Horā Śāstra (BPHS)</option>
                  <option value="Phaladīpikā">Phaladīpikā (Mantreśvara)</option>
                  <option value="Bṛhat Jātaka">Bṛhat Jātaka (Varāhamihira)</option>
                  <option value="Sārāvalī">Sārāvalī (Kalyāṇavarmā)</option>
                  <option value="Jaimini">Jaimini Upadeśa Sūtras</option>
                  <option value="Pārijāta">Jātaka Pārijāta</option>
                  <option value="Uttarakālāmṛta">Uttarakālāmṛta</option>
                </select>

                {/* Status Filter */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setLibraryStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      libraryStatusFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Rules
                  </button>
                  <button
                    onClick={() => setLibraryStatusFilter('satisfied')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      libraryStatusFilter === 'satisfied'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Met in Chart
                  </button>
                  <button
                    onClick={() => setLibraryStatusFilter('unmet')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      libraryStatusFilter === 'unmet'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Unmet
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Sanskrit verses..."
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    className="pl-2.5 pr-6 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none"
                  />
                  {librarySearch && (
                    <button
                      onClick={() => setLibrarySearch('')}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Rules Feed */}
            <div className="space-y-4">
              {filteredRulesList.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No classical rules found matching current library filters.
                </div>
              ) : (
                filteredRulesList.map(({ citation, evaluation, isSatisfied }) => (
                  <div
                    key={citation.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isSatisfied
                        ? 'bg-emerald-50/40 border-emerald-200/90'
                        : 'bg-white border-slate-200/80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <span className="text-xs font-serif font-bold text-slate-900">
                          {citation.sourceText} • {citation.chapterAndVerse}
                        </span>
                        {citation.sanskritTitle && (
                          <span className="text-[#8C2D19] font-serif text-xs font-semibold ml-2">
                            {citation.sanskritTitle}
                          </span>
                        )}
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider self-start sm:self-auto border ${
                          isSatisfied
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isSatisfied ? 'Condition Verified' : 'Condition Not Met'}
                      </span>
                    </div>

                    {/* Verbatim Sanskrit Shloka */}
                    {citation.sanskritShloka && (
                      <div className="p-3 bg-[#2A1810] text-amber-100 rounded-lg font-serif text-xs leading-relaxed border border-amber-900/60 my-2">
                        {citation.sanskritShloka}
                      </div>
                    )}

                    {/* Rule Description */}
                    <p className="text-xs text-slate-800 leading-relaxed font-sans mb-3">
                      {citation.ruleDescription}
                    </p>

                    {/* Observed Conditions Verification */}
                    {evaluation && evaluation.conditions.length > 0 && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          Condition-by-Condition Verification
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {evaluation.conditions.map((cond) => (
                            <div
                              key={cond.id}
                              className={`p-2 rounded border text-xs ${
                                cond.met
                                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                                  : 'bg-slate-100/70 border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between font-semibold text-[11px] mb-0.5">
                                <span>{cond.description}</span>
                                <span className={cond.met ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                                  {cond.met ? '✓ MET' : '✗ NOT MET'}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-600 font-mono">
                                Expected: {cond.expected} | Observed: {cond.observed}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {citation.textualDisagreementNotes && (
                      <div className="mt-2 text-[10px] text-amber-900 bg-amber-50/70 p-2 rounded border border-amber-200/60">
                        <strong>Textual Commentary:</strong> {citation.textualDisagreementNotes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 3: FULL 12-DOMAIN PHALA DOSSIER (सम्पूर्ण फल विवरण) */}
      {/* ========================================================================= */}
      {viewMode === 'dossier' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
            {/* Dossier Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-serif font-bold text-slate-900">
                  Comprehensive 12-Domain Classical Phala Dossier
                </h3>
                <span className="text-xs text-[#8C2D19] font-serif">
                  सम्पूर्ण द्वादश भाव शास्त्रीय फलविवेक निर्देश
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyFullDossier}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copiedId === 'full_dossier' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied Dossier</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-[#8C2D19] hover:bg-[#6E2213] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>

            {/* Dossier Document Content */}
            <div className="space-y-8 divide-y divide-slate-100">
              {report.orderedDomainIds.map((domainId, idx) => {
                const domain = report.domains[domainId];
                return (
                  <div key={domain.id} className={idx > 0 ? 'pt-6 space-y-4' : 'space-y-4'}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#8C2D19] text-white flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-serif font-bold text-base text-slate-900">
                            {domain.title}
                          </h4>
                          <span className="text-xs text-[#8C2D19] font-serif">
                            {domain.sanskritTitle}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                        {domain.coreDisposition}
                      </span>
                    </div>

                    {/* Synthesis & Concise Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          Canonical Summary
                        </span>
                        <p className="text-slate-800 leading-relaxed font-sans">
                          {domain.conciseSummary}
                        </p>
                      </div>

                      <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider block">
                          Multi-Rule Synthesis
                        </span>
                        <p className="text-slate-800 leading-relaxed font-sans whitespace-pre-line">
                          {domain.multiRuleSynthesis}
                        </p>
                      </div>
                    </div>

                    {/* Direct Met Rules */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Verified Classical Rules
                      </span>
                      <div className="space-y-2">
                        {domain.directClassicalPhalas.map((phala) => (
                          <div
                            key={phala.id}
                            className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-serif font-bold text-slate-900">
                                {phala.sourceText} • {phala.chapterAndVerse}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                  phala.allConditionsMet
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {phala.verificationLevel}
                              </span>
                            </div>

                            {phala.sanskritShloka && (
                              <div className="font-serif text-[11px] text-amber-950 bg-amber-50/60 p-2 rounded border border-amber-100">
                                {phala.sanskritShloka}
                              </div>
                            )}

                            <p className="text-slate-700 font-sans leading-relaxed">
                              {phala.directPhalaText}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}





      {/* ========================================================================= */}
      {/* 4. PROGRESSIVE DISCLOSURE DEEP-DIVE MODAL (WITH AI SYNTHESIS) */}
      {/* ========================================================================= */}
      {selectedDomainModal && (() => {
        const modalDomainNum = report.orderedDomainIds.indexOf(selectedDomainModal.id) + 1;
        const modalProtoDom = deterministicProtocolReport.domains.find(
          (d) => d.domainId === selectedDomainModal.id || d.domainNumber === modalDomainNum
        );
        return (
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
                <span>8 Sanskrit Ślokas & Phala</span>
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
                onClick={() => setModalTab('ai_synthesis')}
                className={`py-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  modalTab === 'ai_synthesis'
                    ? 'border-[#8C2D19] text-[#8C2D19]'
                    : 'border-transparent text-amber-800 hover:text-amber-950 font-bold'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#8C2D19]" />
                <span>Canonical Shastric Synthesis</span>
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
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
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
                      <span>Direct Classical Phala & Manuscript Citations (8 Rules)</span>
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

              {/* TAB 2: Condition Verification Matrix */}
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

                    <div className="space-y-4">
                      {selectedDomainModal.directClassicalPhalas.map((phala) => (
                        <div
                          key={phala.id}
                          className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                        >
                          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                            <span className="font-serif font-bold text-xs text-slate-900">
                              {phala.sourceText} — {phala.chapterAndVerse}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                phala.allConditionsMet
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {phala.verificationLevel}
                            </span>
                          </div>

                          <div className="p-3 space-y-2">
                            {phala.conditions.map((cond: RuleCondition) => (
                              <div
                                key={cond.id}
                                className={`p-2.5 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                                  cond.met
                                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <div>
                                  <span className="font-medium block">{cond.description}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    Expected: {cond.expected} • Observed: {cond.observed}
                                  </span>
                                </div>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded self-start sm:self-auto uppercase tracking-wider ${
                                    cond.met
                                      ? 'bg-emerald-200/70 text-emerald-900'
                                      : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {cond.met ? 'Condition Met' : 'Unmet'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Classical Contradictions & Mitigations */}
                  {selectedDomainModal.contradictions.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-slate-200">
                      <h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-1.5 text-amber-900">
                        <AlertCircle className="w-4 h-4 text-amber-700" />
                        <span>Classical Contradictions & Traditional Resolutions (विरोध एवं परिहार)</span>
                      </h4>
                      <div className="space-y-2.5">
                        {selectedDomainModal.contradictions.map((c) => (
                          <div
                            key={c.id}
                            className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs font-semibold text-amber-950">
                              <span>Favorable: {c.favorableFactor}</span>
                              <span>Limiting: {c.limitingFactor}</span>
                            </div>
                            <div className="text-xs text-slate-800 bg-white/80 p-2.5 rounded-lg border border-amber-100 space-y-1">
                              <span className="text-[10px] font-bold text-amber-900 uppercase block">
                                Traditional Reconciliatory Principle
                              </span>
                              <p>{c.traditionalResolution}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Canonical Shastric Synthesis (Deterministic Classical Horā) */}
              {modalTab === 'ai_synthesis' && (
                <div className="space-y-4">
                  <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#8C2D19]" />
                        <span className="font-serif font-bold text-slate-900 text-sm">
                          Deterministic Canonical Horā Synthesis
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={synthesisLevel}
                          onChange={(e: any) => setSynthesisLevel(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg text-xs px-2 py-1 text-slate-700"
                        >
                          <option value="standard">Standard Classical Synthesis</option>
                          <option value="in_depth">In-Depth Śāstric Analysis</option>
                          <option value="shastra_pure">Śāstra-Pure Parāśarī</option>
                        </select>
                        <button
                          onClick={() => handleGenerateAiSynthesis(selectedDomainModal)}
                          disabled={isSynthesizing}
                          className="px-3 py-1 bg-[#8C2D19] hover:bg-[#6E2213] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-xs"
                        >
                          {isSynthesizing ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Synthesizing...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Generate Shastric Synthesis</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      This deterministic synthesis computes the <strong>exact verified evidence package</strong> (natal astrometric facts, 5-layer weighted synthesis, matched canonical rules, and traditional resolutions) directly from classical treatises. Sourced canonically from BPHS, Phaladīpikā, Sārāvalī, Bṛhat Jātaka, and Jaimini Sūtras.
                    </p>
                  </div>

                  {synthesisError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{synthesisError}</span>
                    </div>
                  )}

                  {isSynthesizing && (
                    <div className="p-10 text-center space-y-3 bg-slate-50 rounded-xl border border-slate-200">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#8C2D19] mx-auto" />
                      <p className="font-serif font-bold text-slate-800 text-sm">
                        Consulting Classical Treatises & Verified Evidence...
                      </p>
                      <p className="text-xs text-slate-500 font-sans italic max-w-sm mx-auto">
                        “नक्षत्राणि ग्रहाश्चैव कारणं सुखदुःखयोः। प्रत्यक्षं ज्योतिषे ज्ञेयं कर्मणां फलनिर्णयः॥”
                      </p>
                    </div>
                  )}

                  {!isSynthesizing && aiSynthesisText && (
                    <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-inner">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                          Verified Classical Synthesis ({synthesisSource})
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(aiSynthesisText);
                            setCopiedId('ai_synthesis');
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded flex items-center gap-1 text-[11px]"
                        >
                          {copiedId === 'ai_synthesis' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Text</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="prose prose-slate prose-sm text-xs leading-relaxed space-y-3 font-sans whitespace-pre-line text-slate-800">
                        {aiSynthesisText}
                      </div>
                    </div>
                  )}

                  {!isSynthesizing && !aiSynthesisText && (
                    <div className="space-y-4">
                      {modalProtoDom ? (
                        <div className="space-y-4">
                          {/* Rich Canonical Pre-Calculated Synthesis */}
                          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Deterministic Shastric Synthesis Engine (10/10 Resolution)</span>
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(modalProtoDom.formattedOutput);
                                  setCopiedId('proto_output');
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded flex items-center gap-1 text-[11px]"
                              >
                                {copiedId === 'proto_output' ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-600 font-semibold">Copied Full Package</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Proof Package</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Exhaustive Synthesis Narrative */}
                            <div className="text-xs leading-relaxed space-y-3 font-sans whitespace-pre-line text-slate-800 bg-amber-50/30 p-3.5 rounded-xl border border-amber-100/80">
                              {modalProtoDom.exhaustiveSynthesisNarrative || modalProtoDom.finalVerdict}
                            </div>

                            {/* Sub-Facets Breakdown */}
                            {modalProtoDom.subFacets && modalProtoDom.subFacets.length > 0 && (
                              <div className="pt-2 space-y-2">
                                <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider block">
                                  Exhaustive Sub-Facet Audits
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {modalProtoDom.subFacets.map((sf, sIdx) => (
                                    <div key={sIdx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-serif font-bold text-slate-900 text-xs">{sf.title}</span>
                                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                                          Strength: {sf.confidence}/100
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-700 leading-relaxed">{sf.verdict}</p>
                                      <span className="text-[9px] text-slate-500 italic block">{sf.timingOrMilestone}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Condition Audits */}
                            {modalProtoDom.conditionsAudited && modalProtoDom.conditionsAudited.length > 0 && (
                              <div className="pt-2 space-y-2">
                                <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider block">
                                  Classical Conditions Audit Trail ({modalProtoDom.conditionsAudited.length} Rules Checked)
                                </span>
                                <div className="space-y-1.5">
                                  {modalProtoDom.conditionsAudited.map((cond, cIdx) => (
                                    <div key={cIdx} className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-2 text-xs">
                                      <div className="space-y-0.5">
                                        <span className="font-semibold text-slate-800 text-[11px] block">{cond.conditionName}</span>
                                        <span className="text-[10px] text-slate-500 block">{cond.sourceText} • {cond.concreteEffect}</span>
                                      </div>
                                      <span
                                        className={`px-2 py-0.5 rounded font-bold text-[9px] shrink-0 uppercase tracking-wider ${
                                          cond.status === 'Fully Verified'
                                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                            : cond.status === 'Partially Present'
                                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                            : cond.status === 'Contradicted'
                                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                            : 'bg-slate-200 text-slate-700 border border-slate-300'
                                        }`}
                                      >
                                        {cond.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Chronological Milestones */}
                            {modalProtoDom.chronologicalMilestones && modalProtoDom.chronologicalMilestones.length > 0 && (
                              <div className="pt-2 space-y-2">
                                <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider block">
                                  Chronological Life Cycle Milestones
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                  {modalProtoDom.chronologicalMilestones.map((m, mIdx) => (
                                    <div key={mIdx} className="p-2 rounded-lg bg-amber-50/50 border border-amber-100 space-y-0.5">
                                      <span className="font-bold text-[#8C2D19] block text-xs">{m.ageRange}</span>
                                      <span className="text-slate-500 text-[9px] block truncate">{m.lifecyclePhase}</span>
                                      <p className="text-slate-700 text-[10px] leading-tight mt-1">{m.expectedManifestation}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Classical Remedies */}
                            {modalProtoDom.classicalRemediesAndPrecautions && modalProtoDom.classicalRemediesAndPrecautions.length > 0 && (
                              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/70 space-y-1 text-xs">
                                <span className="text-[10px] font-bold text-emerald-950 uppercase tracking-wider block">
                                  Classical Remedies & Precautions
                                </span>
                                <ul className="list-disc list-inside text-[11px] text-emerald-900 space-y-0.5">
                                  {modalProtoDom.classicalRemediesAndPrecautions.map((rem, rIdx) => (
                                    <li key={rIdx}>{rem}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                          Click <strong>&ldquo;Generate Synthesis&rdquo;</strong> to synthesize the 8 canonical rules with verified chart evidence.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Modern Interpretive Mapping */}
              {modalTab === 'modern' && (
                <div className="space-y-4">
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-200/70 space-y-2">
                    <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                      Methodological Disclaimer & Boundary
                    </span>
                    <p className="text-slate-700 leading-relaxed font-sans text-xs">
                      Classical texts prescribe archetypal indicators suited to their historical eras.
                      The modern mappings below are psychological and functional translations designed
                      for contemporary life, and are explicitly labeled as modern interpretive models rather
                      than verbatim ancient assertions.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {selectedDomainModal.modernMappings.map((mapping) => (
                      <div
                        key={mapping.id}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-slate-900 text-xs">
                            {mapping.classicalConcept}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Ref: {mapping.classicalSourceRef}
                          </span>
                        </div>
                        <p className="text-slate-800 text-xs leading-relaxed font-sans">
                          {mapping.modernMappingText}
                        </p>
                        <div className="text-[10px] text-slate-500 italic bg-white p-2 rounded border border-slate-100">
                          <strong>Analytical Basis:</strong> {mapping.methodologyNote}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: Calculations & Vargas */}
              {modalTab === 'calculations' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-serif font-bold text-slate-900 text-sm">
                      Calculated Natal Indicators & Dignities
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedDomainModal.calculatedFacts.map((fact) => (
                        <div
                          key={fact.id}
                          className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 text-[10px] uppercase font-semibold">
                              {fact.category}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${
                                fact.isFavorable
                                  ? 'text-emerald-700'
                                  : fact.neutralOrMixed
                                  ? 'text-slate-700'
                                  : 'text-amber-800'
                              }`}
                            >
                              {fact.value}
                            </span>
                          </div>
                          <span className="font-serif font-bold text-slate-900 text-xs block">
                            {fact.label}
                          </span>
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            {fact.significance}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Astrometric Calculation Basis
                    </span>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 font-mono">
                      {selectedDomainModal.calculationBasisNotes.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-sans">
                Gaṇaka Jyotiṣa • Deterministic Classical Rule Engine
              </span>

              <button
                onClick={() => handleCopySummary(selectedDomainModal)}
                className="px-3.5 py-1.5 bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
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
        );
      })()}
    </div>
  );
};

export default IndicationsPanel;

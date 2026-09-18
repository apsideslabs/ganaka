'use client';

/**
 * Gaṇaka — Classical Viṃśottarī Daśā Hierarchical Viewer & Calculation Engine
 * 
 * 100% Authentic Classical Formula Execution:
 * - Parāśarī 120-Year Viṃśottarī System (BPHS Ch. 46 & Ch. 51-60)
 * - Configurable Daśā Māna (Year Length): 365.2425d Solar, 360d Sāvana (Classical BPHS), 365.2564d Sidereal, 365.25d Julian
 * - Starting Seed (Nakṣatra Kṣetra): Janma (Moon), Lagna, Utpanna (5th), Kṣema (4th), Ādhāna (8th)
 * - True Classical Balance at Birth: Exact Bhukta (elapsed) & Bhogya (remaining) arc (800' scale)
 * - True Antardaśā Sequence: Identifies birth-active sub-period and executes full classical durations for subsequent periods
 * - 6-Level Sub-Period Hierarchy (Mahā → Antar → Pratyantar → Sūkṣma → Prāṇa → Deha)
 * - Mathematical Proof & Audit Modal ("Daśā Gaṇita Śāstra")
 * - Classical Daśā Phala Synthesis (BPHS & Phaladīpikā)
 */

import React, { useState, useMemo } from 'react';
import { DashaPeriod, JyotishaChart } from '@/lib/jyotisha/types';
import {
  calculateVimshottariDasha,
  getCurrentActiveDasha,
  calculateSubPeriodsForPeriod,
  ActiveDashaHierarchy,
  DashaYearLength,
  DashaSeed,
  getYearLengthInDays,
  degToDMS,
} from '@/lib/dashas/vimshottari';
import { GRAHA_PROPERTIES } from '@/lib/jyotisha/constants';
import {
  ChevronRight,
  ChevronDown,
  Clock,
  AlertTriangle,
  Layers,
  Search,
  Calendar,
  Compass,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  Sliders,
  CheckCircle2,
  HelpCircle,
  X,
  Scale,
  ExternalLink,
  ShieldCheck,
  Zap,
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

const DASHA_LEVEL_CONFIG = [
  { level: 1, name: 'Mahādaśā', sanskrit: 'महादशा', tag: 'Level 1', color: 'text-amber-800 bg-amber-100' },
  { level: 2, name: 'Antardaśā', sanskrit: 'अन्तर्दशा', tag: 'Level 2', color: 'text-blue-800 bg-blue-100' },
  { level: 3, name: 'Pratyantardaśā', sanskrit: 'प्रत्यन्तर्दशा', tag: 'Level 3', color: 'text-emerald-800 bg-emerald-100' },
  { level: 4, name: 'Sūkṣmadaśā', sanskrit: 'सूक्ष्मदशा', tag: 'Level 4', color: 'text-indigo-800 bg-indigo-100' },
  { level: 5, name: 'Prāṇadaśā', sanskrit: 'प्राणदशा', tag: 'Level 5', color: 'text-rose-800 bg-rose-100' },
  { level: 6, name: 'Dehadaśā', sanskrit: 'देहदशा', tag: 'Level 6', color: 'text-purple-800 bg-purple-100' },
];

const DASHA_PLANET_THEMES: Record<string, {
  bg: string;
  hoverBg: string;
  border: string;
  activeBorder: string;
  text: string;
}> = {
  ketu: {
    bg: 'bg-stone-50',
    hoverBg: 'hover:bg-stone-100',
    border: 'border-stone-300',
    activeBorder: 'border-stone-800 ring-2 ring-stone-500',
    text: 'text-stone-800',
  },
  venus: {
    bg: 'bg-pink-50/70',
    hoverBg: 'hover:bg-pink-100/80',
    border: 'border-pink-200',
    activeBorder: 'border-pink-800 ring-2 ring-pink-400',
    text: 'text-pink-900',
  },
  sun: {
    bg: 'bg-amber-50/80',
    hoverBg: 'hover:bg-amber-100',
    border: 'border-amber-300',
    activeBorder: 'border-amber-700 ring-2 ring-amber-500',
    text: 'text-amber-950',
  },
  moon: {
    bg: 'bg-sky-50/80',
    hoverBg: 'hover:bg-sky-100',
    border: 'border-sky-200',
    activeBorder: 'border-sky-800 ring-2 ring-sky-400',
    text: 'text-sky-950',
  },
  mars: {
    bg: 'bg-rose-50/80',
    hoverBg: 'hover:bg-rose-100',
    border: 'border-rose-300',
    activeBorder: 'border-rose-800 ring-2 ring-rose-500',
    text: 'text-rose-950',
  },
  rahu: {
    bg: 'bg-indigo-50/80',
    hoverBg: 'hover:bg-indigo-100',
    border: 'border-indigo-300',
    activeBorder: 'border-indigo-950 ring-2 ring-indigo-500',
    text: 'text-indigo-950',
  },
  jupiter: {
    bg: 'bg-yellow-50/80',
    hoverBg: 'hover:bg-yellow-100',
    border: 'border-yellow-300',
    activeBorder: 'border-yellow-700 ring-2 ring-yellow-500',
    text: 'text-yellow-950',
  },
  saturn: {
    bg: 'bg-slate-100/90',
    hoverBg: 'hover:bg-slate-200',
    border: 'border-slate-300',
    activeBorder: 'border-slate-900 ring-2 ring-slate-600',
    text: 'text-slate-900',
  },
  mercury: {
    bg: 'bg-emerald-50/80',
    hoverBg: 'hover:bg-emerald-100',
    border: 'border-emerald-300',
    activeBorder: 'border-emerald-800 ring-2 ring-emerald-500',
    text: 'text-emerald-950',
  },
};

interface VimshottariPanelProps {
  chart: JyotishaChart;
  onOpenExtendedDashas?: () => void;
}

export function VimshottariPanel({ chart, onOpenExtendedDashas }: VimshottariPanelProps) {
  // Configurable Calculation Parameters
  const [yearLength, setYearLength] = useState<DashaYearLength>('solar');
  const [seed, setSeed] = useState<DashaSeed>('moon');
  const [displayMode, setDisplayMode] = useState<'lifespan' | 'full_astronomical'>('lifespan');
  const [showMathModal, setShowMathModal] = useState(false);

  // Tab & Search State
  const [activeTab, setActiveTab] = useState<'timeline' | 'active' | 'planets'>('timeline');
  const [searchQuery, setSearchQuery] = useState('');

  // Target reference date (default: today)
  const [targetDateStr, setTargetDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Extract birth details from chart metadata
  const birthDateDetails = useMemo(() => {
    const meta = (chart as any).meta?.birthDetails;
    if (meta) {
      return {
        year: meta.year,
        month: meta.month,
        day: meta.day,
        hour: meta.hour,
        minute: meta.minute,
        second: meta.second || 0,
        formattedBirthDate: `${meta.year}-${meta.month.toString().padStart(2, '0')}-${meta.day.toString().padStart(2, '0')}`,
      };
    }
    return {
      year: 2000,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      second: 0,
      formattedBirthDate: '2000-01-01',
    };
  }, [chart]);

  // Recalculate full authentic Vimshottari Dasha according to chosen parameters
  const vimshottari = useMemo(() => {
    const moonLon = chart.planets.moon?.siderealLongitude ?? 0;
    const lagnaLon = chart.lagna?.siderealLongitude ?? 0;

    return calculateVimshottariDasha(
      moonLon,
      {
        year: birthDateDetails.year,
        month: birthDateDetails.month,
        day: birthDateDetails.day,
        hour: birthDateDetails.hour,
        minute: birthDateDetails.minute,
        second: birthDateDetails.second,
      },
      {
        yearLength,
        seed,
        displayMode,
        lagnaLongitude: lagnaLon,
        timezoneOffsetHours: (chart as any).meta?.birthDetails?.timezoneOffsetHours,
      }
    );
  }, [chart, birthDateDetails, yearLength, seed, displayMode]);

  const yearDays = useMemo(() => getYearLengthInDays(yearLength), [yearLength]);

  // Dynamic active dasha hierarchy computed for queried target date
  const activeDashaHierarchy = useMemo(() => {
    const target = new Date(targetDateStr);
    return getCurrentActiveDasha(
      vimshottari.tree,
      isNaN(target.getTime()) ? new Date() : target,
      yearDays
    );
  }, [vimshottari.tree, targetDateStr, yearDays]);

  // Initial active hierarchy computed for today
  const initialActive = useMemo(() => {
    const target = new Date();
    return getCurrentActiveDasha(vimshottari.tree, target, yearDays);
  }, [vimshottari.tree, yearDays]);

  // 6-Level Drill-Down Page Navigation State
  // Level 1: mahaIdx === null (Shows all 9 Mahadashas & timeline)
  // Level 2: mahaIdx !== null, antarIdx === null (Shows only 9 Antardashas of that Mahadasha)
  // Level 3: antarIdx !== null, pratIdx === null (Shows only 9 Pratyantardashas)
  // Level 4: pratIdx !== null, sookIdx === null (Shows only 9 Sookshmadashas)
  // Level 5: sookIdx !== null, pranaIdx === null (Shows only 9 Pranadashas)
  // Level 6: pranaIdx !== null (Shows 9 Dehadashas)
  const [drillDown, setDrillDown] = useState<{
    mahaIdx: number | null;
    antarIdx: number | null;
    pratIdx: number | null;
    sookIdx: number | null;
    pranaIdx: number | null;
  }>({
    mahaIdx: null,
    antarIdx: null,
    pratIdx: null,
    sookIdx: null,
    pranaIdx: null,
  });

  // Determine current active depth level (1 to 6)
  const currentLevel = useMemo(() => {
    if (drillDown.mahaIdx === null) return 1;
    if (drillDown.antarIdx === null) return 2;
    if (drillDown.pratIdx === null) return 3;
    if (drillDown.sookIdx === null) return 4;
    if (drillDown.pranaIdx === null) return 5;
    return 6;
  }, [drillDown]);

  // Selected periods along the breadcrumb path
  const selectedMaha = drillDown.mahaIdx !== null ? vimshottari.tree[drillDown.mahaIdx] : null;
  const selectedAntar = (selectedMaha && drillDown.antarIdx !== null && selectedMaha.subPeriods)
    ? selectedMaha.subPeriods[drillDown.antarIdx]
    : null;
  const selectedPrat = (selectedAntar && drillDown.pratIdx !== null && selectedAntar.subPeriods)
    ? selectedAntar.subPeriods[drillDown.pratIdx]
    : null;
  const selectedSook = (selectedPrat && drillDown.sookIdx !== null && selectedPrat.subPeriods)
    ? selectedPrat.subPeriods[drillDown.sookIdx]
    : null;

  // Level 5 Pranadashas for selected Sookshma
  const pranaList = useMemo(() => {
    if (!selectedSook) return [];
    return calculateSubPeriodsForPeriod(selectedSook, 5);
  }, [selectedSook]);

  const selectedPrana = (drillDown.pranaIdx !== null && pranaList[drillDown.pranaIdx])
    ? pranaList[drillDown.pranaIdx]
    : null;

  // Level 6 Dehadashas for selected Prana
  const dehaList = useMemo(() => {
    if (!selectedPrana) return [];
    return calculateSubPeriodsForPeriod(selectedPrana, 6);
  }, [selectedPrana]);

  // All periods for the currently active level (unfiltered, for the visual timeline)
  const allLevelPeriods = useMemo<DashaPeriod[]>(() => {
    if (currentLevel === 1) return vimshottari.tree;
    if (currentLevel === 2 && selectedMaha?.subPeriods) return selectedMaha.subPeriods;
    if (currentLevel === 3 && selectedAntar?.subPeriods) return selectedAntar.subPeriods;
    if (currentLevel === 4 && selectedPrat?.subPeriods) return selectedPrat.subPeriods;
    if (currentLevel === 5) return pranaList;
    if (currentLevel === 6) return dehaList;
    return [];
  }, [currentLevel, vimshottari.tree, selectedMaha, selectedAntar, selectedPrat, pranaList, dehaList]);

  // Total duration of periods at current level for proportional timeline scaling
  const totalLevelDuration = useMemo(() => {
    return allLevelPeriods.reduce((acc, p) => acc + (p.durationYears || 0), 0);
  }, [allLevelPeriods]);

  // Navigation handlers
  const goBack = () => {
    if (drillDown.pranaIdx !== null) {
      setDrillDown(prev => ({ ...prev, pranaIdx: null }));
    } else if (drillDown.sookIdx !== null) {
      setDrillDown(prev => ({ ...prev, sookIdx: null }));
    } else if (drillDown.pratIdx !== null) {
      setDrillDown(prev => ({ ...prev, pratIdx: null }));
    } else if (drillDown.antarIdx !== null) {
      setDrillDown(prev => ({ ...prev, antarIdx: null }));
    } else if (drillDown.mahaIdx !== null) {
      setDrillDown(prev => ({ ...prev, mahaIdx: null }));
    }
  };

  const jumpToMahaLevel = () => {
    setDrillDown({
      mahaIdx: null,
      antarIdx: null,
      pratIdx: null,
      sookIdx: null,
      pranaIdx: null,
    });
  };

  const jumpToAntarLevel = () => {
    setDrillDown(prev => ({
      ...prev,
      antarIdx: null,
      pratIdx: null,
      sookIdx: null,
      pranaIdx: null,
    }));
  };

  const jumpToPratLevel = () => {
    setDrillDown(prev => ({
      ...prev,
      pratIdx: null,
      sookIdx: null,
      pranaIdx: null,
    }));
  };

  const jumpToSookLevel = () => {
    setDrillDown(prev => ({
      ...prev,
      sookIdx: null,
      pranaIdx: null,
    }));
  };

  const jumpToPranaLevel = () => {
    setDrillDown(prev => ({
      ...prev,
      pranaIdx: null,
    }));
  };

  const jumpToActiveDasha = () => {
    if (activeDashaHierarchy?.activePathIndices) {
      const { mahaIdx } = activeDashaHierarchy.activePathIndices;
      setDrillDown({
        mahaIdx,
        antarIdx: null,
        pratIdx: null,
        sookIdx: null,
        pranaIdx: null,
      });
    }
  };

  const handleTargetDateChange = (newDateStr: string) => {
    setTargetDateStr(newDateStr);
  };

  const isPeriodActive = (startDate: string, endDate: string) => {
    const targetMs = new Date(targetDateStr).getTime();
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    return targetMs >= s && targetMs < e;
  };

  // Filter items at current level
  const currentItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (currentLevel === 1) {
      return vimshottari.tree.map((m, idx) => ({ item: m, idx })).filter(({ item }) => {
        if (!q) return true;
        return (
          item.lordName.toLowerCase().includes(q) ||
          item.lord.toLowerCase().includes(q) ||
          item.startDate.includes(q) ||
          item.endDate.includes(q)
        );
      });
    }
    if (currentLevel === 2 && selectedMaha?.subPeriods) {
      return selectedMaha.subPeriods.map((a, idx) => ({ item: a, idx })).filter(({ item }) => {
        if (!q) return true;
        return (
          item.lordName.toLowerCase().includes(q) ||
          item.lord.toLowerCase().includes(q) ||
          item.startDate.includes(q) ||
          item.endDate.includes(q)
        );
      });
    }
    if (currentLevel === 3 && selectedAntar?.subPeriods) {
      return selectedAntar.subPeriods.map((p, idx) => ({ item: p, idx })).filter(({ item }) => {
        if (!q) return true;
        return (
          item.lordName.toLowerCase().includes(q) ||
          item.lord.toLowerCase().includes(q) ||
          item.startDate.includes(q) ||
          item.endDate.includes(q)
        );
      });
    }
    if (currentLevel === 4 && selectedPrat?.subPeriods) {
      return selectedPrat.subPeriods.map((s, idx) => ({ item: s, idx })).filter(({ item }) => {
        if (!q) return true;
        return (
          item.lordName.toLowerCase().includes(q) ||
          item.lord.toLowerCase().includes(q) ||
          item.startDate.includes(q) ||
          item.endDate.includes(q)
        );
      });
    }
    if (currentLevel === 5 && pranaList.length > 0) {
      return pranaList.map((pr, idx) => ({ item: pr, idx })).filter(({ item }) => {
        if (!q) return true;
        return (
          item.lordName.toLowerCase().includes(q) ||
          item.lord.toLowerCase().includes(q) ||
          item.startDate.includes(q) ||
          item.endDate.includes(q)
        );
      });
    }
    if (currentLevel === 6 && dehaList.length > 0) {
      return dehaList.map((d, idx) => ({ item: d, idx })).filter(({ item }) => {
        if (!q) return true;
        return (
          item.lordName.toLowerCase().includes(q) ||
          item.lord.toLowerCase().includes(q) ||
          item.startDate.includes(q) ||
          item.endDate.includes(q)
        );
      });
    }
    return [];
  }, [currentLevel, vimshottari.tree, selectedMaha, selectedAntar, selectedPrat, pranaList, dehaList, searchQuery]);

  // Quick Age Jump handler
  const setQuickAge = (years: number) => {
    const b = new Date(birthDateDetails.formattedBirthDate);
    if (!isNaN(b.getTime())) {
      const targetYear = b.getUTCFullYear() + years;
      const m = (b.getUTCMonth() + 1).toString().padStart(2, '0');
      const d = b.getUTCDate().toString().padStart(2, '0');
      handleTargetDateChange(`${targetYear}-${m}-${d}`);
    }
  };

  return (
    <div id="vimshottari-panel" className="space-y-6">
      {/* 1. TOP BANNER: Title & Calculation Settings Toolbar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-[#8C2D19]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Viṃśottarī Daśā Gaṇita</span>
                  <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                    BPHS Ch. 46
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Astronomically exact 120-year Parāśarī cycle with full 6-level sub-period hierarchy down to Dehadaśā.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenExtendedDashas && (
              <button
                id="btn-open-extended-dashas"
                onClick={onOpenExtendedDashas}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-900 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-700" />
                <span>Extended Daśās (7 Systems) &rarr;</span>
              </button>
            )}

            <button
              id="btn-open-math-modal"
              onClick={() => setShowMathModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-[#8C2D19] hover:bg-amber-100 border border-amber-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Daśā Gaṇita Śāstra (Formula &amp; Proof)</span>
            </button>

            <button
              id="btn-focus-active-dasha"
              onClick={jumpToActiveDasha}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8C2D19] text-white hover:bg-[#722414] text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Locate Active Daśā</span>
            </button>
          </div>
        </div>

        {/* CALCULATION FORMULA CONTROLS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1 text-xs">
          {/* 1. Year Length (Daśā Māna) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="select-year-length" className="font-semibold text-slate-700 flex items-center gap-1">
                <Scale className="w-3 h-3 text-[#8C2D19]" />
                <span>Daśā Māna (Year Length)</span>
              </label>
              <span className="font-mono text-[10px] text-slate-500 font-bold">{yearDays}d/yr</span>
            </div>
            <select
              id="select-year-length"
              value={yearLength}
              onChange={(e) => setYearLength(e.target.value as DashaYearLength)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#8C2D19] cursor-pointer"
            >
              <option value="solar">Modern Solar (365.2425 days) • AstroSage / Drik</option>
              <option value="savana">Classical Sāvana (360.0 days) • BPHS / Jagannatha</option>
              <option value="sidereal">Sidereal Saura (365.2564 days) • Solar Arc</option>
              <option value="julian">Julian Astronomical (365.25 days)</option>
            </select>
          </div>

          {/* 2. Starting Seed (Kṣetra) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="select-starting-seed" className="font-semibold text-slate-700 flex items-center gap-1">
                <Compass className="w-3 h-3 text-[#8C2D19]" />
                <span>Starting Seed (Nakṣatra Kṣetra)</span>
              </label>
              <span className="font-mono text-[10px] text-slate-500 capitalize">{seed}</span>
            </div>
            <select
              id="select-starting-seed"
              value={seed}
              onChange={(e) => setSeed(e.target.value as DashaSeed)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#8C2D19] cursor-pointer"
            >
              <option value="moon">Janma Nakṣatra (Moon) • Universal Standard</option>
              <option value="lagna">Lagna Nakṣatra (Ascendant) • BPHS 46.12</option>
              <option value="utpanna">Utpanna (5th from Moon) • BPHS 46.15</option>
              <option value="kshema">Kṣema (4th from Moon) • BPHS 46.16</option>
              <option value="adhana">Ādhāna (8th from Moon) • BPHS 46.17</option>
            </select>
          </div>

          {/* 3. View Mode */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="select-display-mode" className="font-semibold text-slate-700 flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#8C2D19]" />
                <span>Daśā Display Horizon</span>
              </label>
              <span className="font-mono text-[10px] text-slate-500">
                {displayMode === 'lifespan' ? 'Lifespan' : 'Full Cycle'}
              </span>
            </div>
            <select
              id="select-display-mode"
              value={displayMode}
              onChange={(e) => setDisplayMode(e.target.value as 'lifespan' | 'full_astronomical')}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#8C2D19] cursor-pointer"
            >
              <option value="lifespan">Lifespan Mode (From Birth Date Onwards)</option>
              <option value="full_astronomical">Full Astronomical Cycle (Includes Pre-Natal)</option>
            </select>
          </div>
        </div>

        {/* BIRTH BALANCE SUMMARY STRIP */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-800">
            <div>
              <span className="text-slate-500 text-[11px] block">Janma Seed Lord:</span>
              <span className="font-serif font-bold text-[#8C2D19] uppercase text-sm">
                {vimshottari.balanceAtBirth.lordName} ({vimshottari.balanceAtBirth.lord})
              </span>
            </div>
            <div className="h-7 w-px bg-amber-200 hidden sm:block" />
            <div>
              <span className="text-slate-500 text-[11px] block">Nakṣatra &amp; Pada:</span>
              <span className="font-bold text-slate-900">
                {vimshottari.balanceAtBirth.nakshatraName} (Pada {vimshottari.balanceAtBirth.nakshatraPada})
              </span>
            </div>
            <div className="h-7 w-px bg-amber-200 hidden sm:block" />
            <div>
              <span className="text-slate-500 text-[11px] block">Arc Traversed / Remaining:</span>
              <span className="font-mono text-slate-800 font-semibold">
                {vimshottari.balanceAtBirth.dmsTraversed} / {vimshottari.balanceAtBirth.dmsRemaining}
              </span>
            </div>
            <div className="h-7 w-px bg-amber-200 hidden sm:block" />
            <div>
              <span className="text-slate-500 text-[11px] block">Balance at Birth (Bhogya):</span>
              <span className="font-mono text-emerald-800 font-bold text-sm">
                {vimshottari.balanceAtBirth.formattedBalance} ({vimshottari.balanceAtBirth.yearsRemaining} yrs)
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowMathModal(true)}
            className="text-[11px] font-semibold text-[#8C2D19] underline hover:text-[#722414] cursor-pointer"
          >
            Audit Math &amp; Formulas &rarr;
          </button>
        </div>
      </div>

      {/* 2. NAVIGATION TABS & DATE QUICK SELECTOR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            id="tab-btn-timeline"
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-[#8C2D19] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            6-Level Daśā Hierarchy
          </button>
          <button
            id="tab-btn-active"
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-[#8C2D19] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Active Period &amp; Phala
          </button>
          <button
            id="tab-btn-planets"
            onClick={() => setActiveTab('planets')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'planets'
                ? 'bg-[#8C2D19] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Planetary Spans
          </button>
        </div>

        {/* Quick Date Selectors */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Jump:</span>
          <button
            onClick={() => handleTargetDateChange(new Date().toISOString().split('T')[0])}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={() => handleTargetDateChange(birthDateDetails.formattedBirthDate)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
          >
            At Birth
          </button>
          <button
            onClick={() => setQuickAge(18)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
          >
            Age 18
          </button>
          <button
            onClick={() => setQuickAge(25)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
          >
            Age 25
          </button>
          <button
            onClick={() => setQuickAge(40)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
          >
            Age 40
          </button>
          <button
            onClick={() => setQuickAge(60)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
          >
            Age 60
          </button>
        </div>
      </div>

      {/* 3. SUB-VIEW 1: TIMELINE & 6-LEVEL HIERARCHY */}
      {activeTab === 'timeline' && (
        <div id="subview-timeline" className="space-y-4">
          {/* Controls: Reference Date, Jump to Active, Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#8C2D19]" />
              <span className="text-xs font-semibold text-slate-700">Reference Date:</span>
              <input
                id="target-date-input"
                type="date"
                value={targetDateStr}
                onChange={(e) => handleTargetDateChange(e.target.value)}
                className="font-mono text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#8C2D19] cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-focus-active"
                onClick={jumpToActiveDasha}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-[#8C2D19] hover:bg-amber-100 border border-amber-200 text-xs font-medium transition-colors cursor-pointer"
                title="Jump directly to the currently active Mahādaśā & Antardaśā"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8C2D19]" />
                <span>Jump to Active Daśā</span>
              </button>

              {currentLevel > 1 && (
                <button
                  id="btn-reset-maha"
                  onClick={jumpToMahaLevel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
                  title="Return to Mahādaśās page"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>All Mahādaśās</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Chain Quick Breadcrumb Banner (Interactive) */}
          {activeDashaHierarchy && (
            <div className="p-3.5 bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-slate-50 rounded-xl border border-amber-200/90 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                <span className="font-semibold text-slate-800">Operative Chain on {targetDateStr}:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                <button
                  onClick={jumpToMahaLevel}
                  className="px-2 py-0.5 bg-[#8C2D19] text-white rounded-md font-bold shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
                  title="View All Mahādaśās"
                >
                  M: {activeDashaHierarchy.mahadasha.lordName}
                </button>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <button
                  onClick={() => {
                    if (activeDashaHierarchy?.activePathIndices) {
                      setDrillDown({
                        mahaIdx: activeDashaHierarchy.activePathIndices.mahaIdx,
                        antarIdx: null,
                        pratIdx: null,
                        sookIdx: null,
                        pranaIdx: null,
                      });
                    }
                  }}
                  className="px-2 py-0.5 bg-amber-700 text-white rounded-md font-bold shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
                  title="View Antardaśās for this Mahādaśā"
                >
                  A: {activeDashaHierarchy.antardasha.lordName}
                </button>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <button
                  onClick={() => {
                    if (activeDashaHierarchy?.activePathIndices) {
                      setDrillDown({
                        mahaIdx: activeDashaHierarchy.activePathIndices.mahaIdx,
                        antarIdx: activeDashaHierarchy.activePathIndices.antarIdx,
                        pratIdx: null,
                        sookIdx: null,
                        pranaIdx: null,
                      });
                    }
                  }}
                  className="px-2 py-0.5 bg-blue-700 text-white rounded-md font-bold shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
                  title="View Pratyantardaśās"
                >
                  P: {activeDashaHierarchy.pratyantardasha.lordName}
                </button>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <button
                  onClick={() => {
                    if (activeDashaHierarchy?.activePathIndices) {
                      setDrillDown({
                        mahaIdx: activeDashaHierarchy.activePathIndices.mahaIdx,
                        antarIdx: activeDashaHierarchy.activePathIndices.antarIdx,
                        pratIdx: activeDashaHierarchy.activePathIndices.pratIdx,
                        sookIdx: null,
                        pranaIdx: null,
                      });
                    }
                  }}
                  className="px-2 py-0.5 bg-indigo-700 text-white rounded-md font-bold shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
                  title="View Sūkṣmadaśās"
                >
                  S: {activeDashaHierarchy.sookshmadasha?.lordName || '—'}
                </button>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <button
                  onClick={() => {
                    if (activeDashaHierarchy?.activePathIndices) {
                      setDrillDown({
                        mahaIdx: activeDashaHierarchy.activePathIndices.mahaIdx,
                        antarIdx: activeDashaHierarchy.activePathIndices.antarIdx,
                        pratIdx: activeDashaHierarchy.activePathIndices.pratIdx,
                        sookIdx: activeDashaHierarchy.activePathIndices.sookIdx,
                        pranaIdx: null,
                      });
                    }
                  }}
                  className="px-2 py-0.5 bg-emerald-700 text-white rounded-md font-bold shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
                  title="View Prāṇadaśās"
                >
                  Pr: {activeDashaHierarchy.pranadasha?.lordName || '—'}
                </button>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <button
                  onClick={() => {
                    if (activeDashaHierarchy?.activePathIndices) {
                      setDrillDown({
                        mahaIdx: activeDashaHierarchy.activePathIndices.mahaIdx,
                        antarIdx: activeDashaHierarchy.activePathIndices.antarIdx,
                        pratIdx: activeDashaHierarchy.activePathIndices.pratIdx,
                        sookIdx: activeDashaHierarchy.activePathIndices.sookIdx,
                        pranaIdx: activeDashaHierarchy.activePathIndices.pranaIdx,
                      });
                    }
                  }}
                  className="px-2 py-0.5 bg-purple-700 text-white rounded-md font-bold shadow-2xs hover:opacity-90 transition-opacity cursor-pointer"
                  title="View Dehadaśās"
                >
                  D: {activeDashaHierarchy.dehadasha?.lordName || '—'}
                </button>
              </div>
            </div>
          )}

          {/* BOX CAPPED CONTAINER */}
          <div id="dasha-box-container" className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            {/* Header: Back Button, Breadcrumb Trail, Level Badge */}
            <div className="p-3.5 sm:p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {currentLevel > 1 && (
                  <button
                    id="btn-level-back"
                    onClick={goBack}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 hover:text-[#8C2D19] border border-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                )}

                {/* Breadcrumb Trail */}
                <nav aria-label="Dasha Navigation Breadcrumb" className="flex items-center gap-1.5 text-xs flex-wrap">
                  <button
                    onClick={jumpToMahaLevel}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer font-medium ${
                      currentLevel === 1
                        ? 'bg-amber-100/90 text-amber-950 font-bold'
                        : 'text-slate-600 hover:text-[#8C2D19] hover:bg-slate-200/50'
                    }`}
                  >
                    Mahādaśās
                  </button>

                  {selectedMaha && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <button
                        onClick={jumpToAntarLevel}
                        className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer font-medium ${
                          currentLevel === 2
                            ? 'bg-amber-100/90 text-amber-950 font-bold'
                            : 'text-slate-600 hover:text-[#8C2D19] hover:bg-slate-200/50'
                        }`}
                      >
                        {selectedMaha.lordName} Antardaśā
                      </button>
                    </>
                  )}

                  {selectedAntar && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <button
                        onClick={jumpToPratLevel}
                        className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer font-medium ${
                          currentLevel === 3
                            ? 'bg-amber-100/90 text-amber-950 font-bold'
                            : 'text-slate-600 hover:text-[#8C2D19] hover:bg-slate-200/50'
                        }`}
                      >
                        {selectedAntar.lordName} Pratyantar
                      </button>
                    </>
                  )}

                  {selectedPrat && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <button
                        onClick={jumpToSookLevel}
                        className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer font-medium ${
                          currentLevel === 4
                            ? 'bg-amber-100/90 text-amber-950 font-bold'
                            : 'text-slate-600 hover:text-[#8C2D19] hover:bg-slate-200/50'
                        }`}
                      >
                        {selectedPrat.lordName} Sūkṣma
                      </button>
                    </>
                  )}

                  {selectedSook && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <button
                        onClick={jumpToPranaLevel}
                        className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer font-medium ${
                          currentLevel === 5
                            ? 'bg-amber-100/90 text-amber-950 font-bold'
                            : 'text-slate-600 hover:text-[#8C2D19] hover:bg-slate-200/50'
                        }`}
                      >
                        {selectedSook.lordName} Prāṇa
                      </button>
                    </>
                  )}

                  {selectedPrana && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="px-2 py-0.5 rounded-md bg-amber-100/90 text-amber-950 font-bold">
                        {selectedPrana.lordName} Deha
                      </span>
                    </>
                  )}
                </nav>
              </div>

              {/* Level Pill */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8C2D19]" />
                  Level {currentLevel} of 6 • {DASHA_LEVEL_CONFIG[currentLevel - 1].name} ({DASHA_LEVEL_CONFIG[currentLevel - 1].sanskrit})
                </span>
              </div>
            </div>

            {/* Context Banner for Level 2+ */}
            {currentLevel > 1 && (
              <div className="px-4 py-2.5 bg-amber-50/40 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="text-slate-700">
                  <span className="text-slate-500 font-medium">Viewing sub-periods of: </span>
                  <span className="font-semibold text-slate-900">
                    {currentLevel === 2 && selectedMaha && `${selectedMaha.lordName} Mahādaśā (${selectedMaha.durationYears.toFixed(2)} yrs • ${selectedMaha.startDate} to ${selectedMaha.endDate})`}
                    {currentLevel === 3 && selectedMaha && selectedAntar && `${selectedMaha.lordName} → ${selectedAntar.lordName} Antardaśā (${(selectedAntar.durationYears * 12).toFixed(1)} mos • ${selectedAntar.startDate} to ${selectedAntar.endDate})`}
                    {currentLevel === 4 && selectedAntar && selectedPrat && `${selectedAntar.lordName} → ${selectedPrat.lordName} Pratyantar (${(selectedPrat.durationYears * yearDays).toFixed(0)} days • ${selectedPrat.startDate} to ${selectedPrat.endDate})`}
                    {currentLevel === 5 && selectedPrat && selectedSook && `${selectedPrat.lordName} → ${selectedSook.lordName} Sūkṣma (${selectedSook.startDate} to ${selectedSook.endDate})`}
                    {currentLevel === 6 && selectedSook && selectedPrana && `${selectedSook.lordName} → ${selectedPrana.lordName} Prāṇa (${selectedPrana.startDate} to ${selectedPrana.endDate})`}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Click any row or block to view Level {currentLevel < 6 ? currentLevel + 1 : 6}
                </span>
              </div>
            )}

            {/* INTERACTIVE VISUAL TIMELINE STRIP */}
            <div id="dasha-visual-timeline" className="p-3.5 sm:p-4 bg-slate-50/70 border-b border-slate-200/80 space-y-2.5">
              {/* Level 2+ Quick Parent Mahadasha Switcher */}
              {currentLevel > 1 && (
                <div className="space-y-1.5 pb-2.5 border-b border-slate-200/70">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <span>Parent Mahādaśās</span>
                      <span className="text-slate-400 font-normal hidden sm:inline">(Click to switch parent)</span>
                    </span>
                    <span>Active Parent: <strong className="text-slate-900">{selectedMaha?.lordName}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
                    {vimshottari.tree.map((m, mIdx) => {
                      const isSelected = drillDown.mahaIdx === mIdx;
                      const isMahaActive = isPeriodActive(m.startDate, m.endDate);
                      return (
                        <button
                          key={mIdx}
                          onClick={() => {
                            setDrillDown({
                              mahaIdx: mIdx,
                              antarIdx: null,
                              pratIdx: null,
                              sookIdx: null,
                              pranaIdx: null,
                            });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#8C2D19] text-white shadow-2xs'
                              : isMahaActive
                              ? 'bg-amber-100/90 text-amber-950 border border-amber-300/80 hover:bg-amber-200/80'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                          title={`Switch to ${m.lordName} Mahādaśā (${m.durationYears.toFixed(0)} yrs)`}
                        >
                          {isMahaActive && (
                            <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-amber-600'} animate-pulse`} />
                          )}
                          <span>{m.lordName}</span>
                          <span className={`text-[10px] font-mono ${isSelected ? 'text-amber-200' : 'text-slate-400'}`}>
                            {m.durationYears.toFixed(0)}y
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Timeline Track Header */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#8C2D19]" />
                  <span className="font-semibold text-slate-800">
                    {currentLevel === 1 && 'Mahādaśā Lifespan Timeline'}
                    {currentLevel === 2 && `${selectedMaha?.lordName} Antardaśā Timeline`}
                    {currentLevel === 3 && `${selectedAntar?.lordName} Pratyantardaśā Timeline`}
                    {currentLevel === 4 && `${selectedPrat?.lordName} Sūkṣmadaśā Timeline`}
                    {currentLevel === 5 && `${selectedSook?.lordName} Prāṇadaśā Timeline`}
                    {currentLevel === 6 && `${selectedPrana?.lordName} Dehadaśā Timeline`}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                    ({allLevelPeriods.length} periods • {totalLevelDuration > 0 ? (totalLevelDuration >= 1 ? `${totalLevelDuration.toFixed(1)} yrs` : `${(totalLevelDuration * 12).toFixed(1)} mos`) : ''})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 text-amber-900 font-medium bg-amber-100/80 px-2 py-0.5 rounded-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                    <span>Highlighted = Active</span>
                  </span>
                </div>
              </div>

              {/* Interactive Proportional Blocks */}
              <div className="relative">
                <div className="flex items-stretch gap-1.5 overflow-x-auto pb-1.5 pt-1 scrollbar-thin">
                  {allLevelPeriods.map((p, idx) => {
                    const isActive = isPeriodActive(p.startDate, p.endDate);
                    const theme = DASHA_PLANET_THEMES[p.lord.toLowerCase()] || DASHA_PLANET_THEMES.jupiter;
                    const durationWeight = p.durationYears || 0.1;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (currentLevel === 1) {
                            setDrillDown({
                              mahaIdx: idx,
                              antarIdx: null,
                              pratIdx: null,
                              sookIdx: null,
                              pranaIdx: null,
                            });
                          } else if (currentLevel === 2) {
                            setDrillDown(prev => ({ ...prev, antarIdx: idx, pratIdx: null, sookIdx: null, pranaIdx: null }));
                          } else if (currentLevel === 3) {
                            setDrillDown(prev => ({ ...prev, pratIdx: idx, sookIdx: null, pranaIdx: null }));
                          } else if (currentLevel === 4) {
                            setDrillDown(prev => ({ ...prev, sookIdx: idx, pranaIdx: null }));
                          } else if (currentLevel === 5) {
                            setDrillDown(prev => ({ ...prev, pranaIdx: idx }));
                          }
                        }}
                        style={{
                          flex: `${Math.max(durationWeight, 0.25)} 0 0%`,
                          minWidth: currentLevel === 1 ? '76px' : '64px',
                        }}
                        className={`group relative p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                          isActive
                            ? `${theme.activeBorder} ${theme.bg} shadow-xs ring-2 ring-amber-500`
                            : `${theme.border} ${theme.bg} ${theme.hoverBg} hover:shadow-2xs`
                        }`}
                        title={`${p.lordName}: ${p.startDate} to ${p.endDate} (${p.durationYears.toFixed(2)} yrs). Click to drill down.`}
                      >
                        {/* Active Indicator Floating Badge */}
                        {isActive && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#8C2D19] text-white tracking-wider shadow-xs whitespace-nowrap z-10 flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-amber-300 animate-pulse" />
                            ACTIVE
                          </span>
                        )}

                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className={`text-xs font-bold truncate ${theme.text}`}>
                              {p.lordName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {currentLevel === 1 && `${p.durationYears.toFixed(0)}y`}
                              {currentLevel === 2 && `${(p.durationYears * 12).toFixed(0)}m`}
                              {currentLevel === 3 && `${Math.round(p.durationYears * yearDays)}d`}
                              {currentLevel >= 4 && `${Math.round(p.durationYears * yearDays * 24)}h`}
                            </span>
                          </div>
                        </div>

                        {/* Date Span Subtext */}
                        <div className="mt-1 text-[10px] font-mono text-slate-500 truncate leading-tight">
                          <span>{p.startDate.split('-')[0]}</span>
                          <span className="mx-0.5 text-slate-400">→</span>
                          <span>{p.endDate.split('-')[0]}</span>
                        </div>

                        {/* Drill Down Hover Hint */}
                        {currentLevel < 6 && (
                          <div className="mt-1 flex items-center justify-between text-[9px] font-semibold text-[#8C2D19] opacity-0 group-hover:opacity-100 transition-opacity">
                            <span>Open {DASHA_LEVEL_CONFIG[currentLevel].name.slice(0, 5)}..</span>
                            <ChevronRight className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* In-box Search Filter */}
            <div className="p-3 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  id="search-dasha-current-level"
                  type="text"
                  placeholder={`Search ${DASHA_LEVEL_CONFIG[currentLevel - 1].name} by planet (e.g. Jupiter, Rahu) or year...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#8C2D19]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* CAPPED SCROLLABLE BOX BODY */}
            <div className="max-h-[540px] overflow-y-auto p-3 sm:p-4 space-y-2.5 bg-slate-50/40">
              {currentItems.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <p>No matching periods found for &ldquo;{searchQuery}&rdquo;.</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-[#8C2D19] font-medium hover:underline cursor-pointer"
                  >
                    Clear search filter
                  </button>
                </div>
              ) : (
                currentItems.map(({ item, idx }) => {
                  const isActive = isPeriodActive(item.startDate, item.endDate);

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (currentLevel === 1) {
                          setDrillDown({
                            mahaIdx: idx,
                            antarIdx: null,
                            pratIdx: null,
                            sookIdx: null,
                            pranaIdx: null,
                          });
                        } else if (currentLevel === 2) {
                          setDrillDown(prev => ({ ...prev, antarIdx: idx, pratIdx: null, sookIdx: null, pranaIdx: null }));
                        } else if (currentLevel === 3) {
                          setDrillDown(prev => ({ ...prev, pratIdx: idx, sookIdx: null, pranaIdx: null }));
                        } else if (currentLevel === 4) {
                          setDrillDown(prev => ({ ...prev, sookIdx: idx, pranaIdx: null }));
                        } else if (currentLevel === 5) {
                          setDrillDown(prev => ({ ...prev, pranaIdx: idx }));
                        }
                      }}
                      className={`group p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? 'border-amber-400 bg-amber-50/80 ring-1 ring-amber-300 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        {/* Period Title & Lord Info */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isActive
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                            }`}
                          >
                            {idx + 1}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-900 text-sm">
                                {currentLevel === 1 && `${item.lordName} Mahādaśā`}
                                {currentLevel === 2 && `${selectedMaha?.lordName} - ${item.lordName} Antardaśā`}
                                {currentLevel === 3 && `${selectedMaha?.lordName} - ${selectedAntar?.lordName} - ${item.lordName} Pratyantar`}
                                {currentLevel === 4 && `${selectedAntar?.lordName} - ${selectedPrat?.lordName} - ${item.lordName} Sūkṣma`}
                                {currentLevel === 5 && `${selectedPrat?.lordName} - ${selectedSook?.lordName} - ${item.lordName} Prāṇa`}
                                {currentLevel === 6 && `${item.lordName} Dehadaśā`}
                              </span>

                              {/* Duration Tag */}
                              <span className="text-xs text-slate-500 font-mono">
                                {currentLevel === 1 && `(${item.durationYears.toFixed(2)} yrs)`}
                                {currentLevel === 2 && `(${(item.durationYears * 12).toFixed(1)} mos)`}
                                {currentLevel === 3 && `(${Math.round(item.durationYears * yearDays)} days)`}
                                {currentLevel === 4 && `(${Math.round(item.durationYears * yearDays * 24)} hrs)`}
                                {currentLevel >= 5 && `(${Math.round(item.durationYears * yearDays * 24 * 60)} mins)`}
                              </span>

                              {/* Active Status Badges */}
                              {isActive ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/90 text-amber-900 shadow-2xs">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-700 animate-pulse" />
                                  ACTIVE NOW
                                </span>
                              ) : null}
                              {'isPreNatal' in item && Boolean((item as { isPreNatal?: boolean }).isPreNatal) ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                                  Pre-Natal
                                </span>
                              ) : null}
                              {'isActiveAtBirth' in item && Boolean((item as { isActiveAtBirth?: boolean }).isActiveAtBirth) ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                  At Birth
                                </span>
                              ) : null}
                            </div>

                            {/* Date Span */}
                            <div className="text-xs text-slate-600 font-mono mt-0.5">
                              {item.startDate} <span className="text-slate-400">→</span> {item.endDate}
                            </div>
                          </div>
                        </div>

                        {/* Drill-down prompt button */}
                        {currentLevel < 6 && (
                          <div className="flex items-center gap-1 text-xs font-semibold text-[#8C2D19] group-hover:translate-x-0.5 transition-transform self-end sm:self-center shrink-0">
                            <span>View {DASHA_LEVEL_CONFIG[currentLevel].name}s</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. SUB-VIEW 2: ACTIVE DASHA & PHALA SYNTHESIS */}
      {activeTab === 'active' && activeDashaHierarchy && (
        <div id="subview-active-dasha" className="space-y-6">
          {/* Active Period Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8C2D19] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#8C2D19]"></span>
                </span>
                <span className="font-serif text-base font-bold text-slate-900">
                  Full 6-Level Operating Daśā Chain on {targetDateStr}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="input-target-date" className="text-xs text-slate-500 font-medium font-sans">
                  Query Reference Date:
                </label>
                <input
                  id="input-target-date"
                  type="date"
                  value={targetDateStr}
                  onChange={(e) => handleTargetDateChange(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-900 shadow-2xs focus:border-[#8C2D19] focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* 6-Level Active Period Hierarchy Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 font-sans">
              {/* Level 1: Mahadasha */}
              <div className="rounded-xl bg-amber-50/70 p-3.5 border border-amber-200/80 space-y-1 shadow-2xs">
                <div className="text-[10px] uppercase font-bold tracking-wider text-amber-800">1. Mahādaśā</div>
                <div className="font-serif text-lg font-bold text-[#8C2D19]">
                  {activeDashaHierarchy.mahadasha.lordName}
                </div>
                <div className="font-mono text-[11px] text-slate-600">
                  {activeDashaHierarchy.mahadasha.startDate}
                </div>
                <div className="font-mono text-[10px] text-slate-400">
                  to {activeDashaHierarchy.mahadasha.endDate}
                </div>
                <span className="inline-block text-[10px] font-sans text-amber-800/80 font-medium">
                  {activeDashaHierarchy.mahadasha.durationYears.toFixed(2)} Years
                </span>
              </div>

              {/* Level 2: Antardasha */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-1 shadow-2xs">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">2. Antardaśā</div>
                <div className="font-serif text-lg font-bold text-slate-900">
                  {activeDashaHierarchy.antardasha.lordName}
                </div>
                <div className="font-mono text-[11px] text-slate-600">
                  {activeDashaHierarchy.antardasha.startDate}
                </div>
                <div className="font-mono text-[10px] text-slate-400">
                  to {activeDashaHierarchy.antardasha.endDate}
                </div>
                <span className="inline-block text-[10px] font-sans text-slate-500 font-medium">
                  {(activeDashaHierarchy.antardasha.durationYears * 12).toFixed(1)} Months
                </span>
              </div>

              {/* Level 3: Pratyantardasha */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-1 shadow-2xs">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">3. Pratyantardaśā</div>
                <div className="font-serif text-lg font-bold text-slate-900">
                  {activeDashaHierarchy.pratyantardasha.lordName}
                </div>
                <div className="font-mono text-[11px] text-slate-600">
                  {activeDashaHierarchy.pratyantardasha.startDate}
                </div>
                <div className="font-mono text-[10px] text-slate-400">
                  to {activeDashaHierarchy.pratyantardasha.endDate}
                </div>
                <span className="inline-block text-[10px] font-sans text-slate-500 font-medium">
                  {(activeDashaHierarchy.pratyantardasha.durationYears * yearDays).toFixed(0)} Days
                </span>
              </div>

              {/* Level 4: Sookshmadasha */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 space-y-1 shadow-2xs">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">4. Sūkṣmadaśā</div>
                <div className="font-serif text-lg font-bold text-slate-900">
                  {activeDashaHierarchy.sookshmadasha?.lordName || '—'}
                </div>
                <div className="font-mono text-[11px] text-slate-600 truncate">
                  {activeDashaHierarchy.sookshmadasha?.startDate || '—'}
                </div>
                <div className="font-mono text-[10px] text-slate-400 truncate">
                  to {activeDashaHierarchy.sookshmadasha?.endDate || '—'}
                </div>
                <span className="inline-block text-[10px] font-sans text-slate-500 font-medium">
                  Micro-Period
                </span>
              </div>

              {/* Level 5: Pranadasha */}
              <div className="rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-200/80 space-y-1 shadow-2xs">
                <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">5. Prāṇadaśā</div>
                <div className="font-serif text-lg font-bold text-emerald-900">
                  {activeDashaHierarchy.pranadasha?.lordName || '—'}
                </div>
                <div className="font-mono text-[10px] text-slate-600 truncate">
                  {activeDashaHierarchy.pranadasha?.startDate || '—'}
                </div>
                <div className="font-mono text-[10px] text-slate-400 truncate">
                  to {activeDashaHierarchy.pranadasha?.endDate || '—'}
                </div>
                <span className="inline-block text-[10px] font-sans text-emerald-700 font-medium">
                  Hours-Level
                </span>
              </div>

              {/* Level 6: Dehadasha */}
              <div className="rounded-xl bg-purple-50/60 p-3.5 border border-purple-200/80 space-y-1 shadow-2xs">
                <div className="text-[10px] uppercase font-bold tracking-wider text-purple-800">6. Dehadaśā</div>
                <div className="font-serif text-lg font-bold text-purple-900">
                  {activeDashaHierarchy.dehadasha?.lordName || '—'}
                </div>
                <div className="font-mono text-[10px] text-slate-600 truncate">
                  {activeDashaHierarchy.dehadasha?.startDate || '—'}
                </div>
                <div className="font-mono text-[10px] text-slate-400 truncate">
                  to {activeDashaHierarchy.dehadasha?.endDate || '—'}
                </div>
                <span className="inline-block text-[10px] font-sans text-purple-700 font-medium">
                  Minutes-Level
                </span>
              </div>
            </div>

            {/* Progress / Bhukta Bar */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs font-mono text-slate-600">
                <span>
                  Mahādaśā Bhukta (Elapsed): <strong>{(activeDashaHierarchy.bhukta?.percentage || 0).toFixed(1)}%</strong> ({activeDashaHierarchy.bhukta?.years}y {activeDashaHierarchy.bhukta?.months}m {activeDashaHierarchy.bhukta?.days}d)
                </span>
                <span>
                  Bhogya (Remaining): <strong>{(activeDashaHierarchy.bhogya?.percentage || 0).toFixed(1)}%</strong> ({activeDashaHierarchy.bhogya?.years}y {activeDashaHierarchy.bhogya?.months}m {activeDashaHierarchy.bhogya?.days}d)
                </span>
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

          {/* CLASSICAL DASHA PHALA INTERPRETATION CARD */}
          {activeDashaHierarchy.phala && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#8C2D19]" />
                  <h4 className="font-serif font-bold text-slate-900 text-base">
                    Classical Daśā Phala (Śāstrīya Interpretation)
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                  {activeDashaHierarchy.phala.classicalSource}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-1.5">
                  <div className="font-serif font-bold text-[#8C2D19] text-sm flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-700" />
                    <span>{activeDashaHierarchy.phala.mahaTitle}</span>
                  </div>
                  <p className="text-slate-700">
                    {activeDashaHierarchy.phala.mahaEffects}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="font-serif font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{activeDashaHierarchy.phala.antarTitle}</span>
                  </div>
                  <p className="text-slate-700">
                    {activeDashaHierarchy.phala.antarEffects}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-slate-50 to-amber-50/30 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
                <span className="font-bold font-serif text-sm block mb-1 text-slate-900">
                  Synthesized Karmic Vector (Mahā &times; Antar Blended)
                </span>
                <p>{activeDashaHierarchy.phala.combinedSynthesis}</p>
              </div>
            </div>
          )}

          {/* Birth Balance of Dasha Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-xs">
              <span className="text-[11px] text-slate-500 block uppercase tracking-wider font-semibold">Janma Daśā Lord</span>
              <span className="text-base font-serif font-bold text-[#8C2D19] block uppercase">
                {vimshottari.balanceAtBirth.lordName} ({vimshottari.balanceAtBirth.lord})
              </span>
              <span className="text-xs text-slate-600 block">
                {vimshottari.balanceAtBirth.nakshatraName} • Pada {vimshottari.balanceAtBirth.nakshatraPada}
              </span>
            </div>

            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-xs">
              <span className="text-[11px] text-slate-500 block uppercase tracking-wider font-semibold">Birth Balance (Bhogya)</span>
              <span className="text-base font-mono font-bold text-slate-900 block">
                {vimshottari.balanceAtBirth.formattedBalance}
              </span>
              <span className="text-xs text-slate-600 block">
                {(vimshottari.balanceAtBirth.percentRemaining || 0).toFixed(1)}% remaining at birth ({vimshottari.balanceAtBirth.yearsRemaining} yrs)
              </span>
            </div>

            <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-xs">
              <span className="text-[11px] text-slate-500 block uppercase tracking-wider font-semibold">Formula Configuration</span>
              <span className="text-base font-mono font-bold text-slate-900 block">
                {yearDays}d Year ({yearLength})
              </span>
              <span className="text-xs text-slate-600 block">
                Seed: {seed.toUpperCase()} • 120-Year Parāśarī
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUB-VIEW 3: PLANET PROFILES & INFLUENCE */}
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

      {/* 6. MATHEMATICAL PROOF & FORMULA AUDIT MODAL (DAŚĀ GAṆITA ŚĀSTRA) */}
      {showMathModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-[#8C2D19]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Viṃśottarī Daśā Gaṇita Śāstra
                  </h3>
                  <p className="text-xs text-slate-500">
                    Step-by-step mathematical derivation of birth balance &amp; sub-period proportionality per BPHS Ch. 46.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMathModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mathematical Step-by-Step Breakdown */}
            <div className="space-y-4 text-xs font-sans text-slate-700 leading-relaxed">
              {/* Step 1 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold font-serif text-slate-900 text-sm block">
                  1. Astronomical Reference Longitude &amp; Nakṣatra Arc
                </span>
                <p>
                  The Nakṣatra circle comprises 27 equal divisions of exactly 13&deg; 20&apos; 00&quot; (800 arcminutes).
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs pt-1">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-sans">Reference Longitude:</span>
                    <span className="font-bold text-slate-900">{vimshottari.balanceAtBirth.referenceLongitude}&deg;</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-sans">Nakṣatra:</span>
                    <span className="font-bold text-[#8C2D19]">
                      #{vimshottari.balanceAtBirth.nakshatraNumber} {vimshottari.balanceAtBirth.nakshatraName}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-sans">Nakṣatra Span:</span>
                    <span className="font-bold text-slate-900">13&deg; 20&apos; 00&quot; (800&apos;)</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-sans">Janma Lord:</span>
                    <span className="font-bold text-amber-800 uppercase">{vimshottari.balanceAtBirth.lordName} ({vimshottari.balanceAtBirth.totalMahaYears}y)</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold font-serif text-slate-900 text-sm block">
                  2. Arc Traversed (Bhukta) vs. Arc Remaining (Bhogya)
                </span>
                <div className="space-y-1.5 font-mono text-xs bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Arc Traversed in Nakṣatra (&theta;):</span>
                    <span className="font-bold text-slate-900">
                      {vimshottari.balanceAtBirth.dmsTraversed} ({vimshottari.balanceAtBirth.degreesTraversedInNakshatra.toFixed(4)}&deg; = {(vimshottari.balanceAtBirth.degreesTraversedInNakshatra * 60).toFixed(2)}&apos;)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Arc Remaining to Traverse (800&apos; - &theta;):</span>
                    <span className="font-bold text-emerald-800">
                      {vimshottari.balanceAtBirth.dmsRemaining} ({vimshottari.balanceAtBirth.degreesRemainingInNakshatra.toFixed(4)}&deg; = {(vimshottari.balanceAtBirth.degreesRemainingInNakshatra * 60).toFixed(2)}&apos;)
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
                <span className="font-bold font-serif text-[#8C2D19] text-sm block">
                  3. Classical Balance of Daśā at Birth Formula
                </span>
                <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2 font-mono text-xs text-slate-800">
                  <div className="text-amber-900 font-semibold font-sans">
                    Sūtra (BPHS Ch. 46.12-14):
                  </div>
                  <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60 text-slate-900">
                    &quot;Multiply the remaining arcminutes by the full Daśā span of the Nakṣatra lord, then divide by 800. The quotient yields the remaining balance of years, months, and days (Bhogya Daśā).&quot;
                  </div>
                  <div className="pt-1 space-y-1 text-slate-700">
                    <div>
                      <strong>Bhogya Balance:</strong> ({vimshottari.balanceAtBirth.dmsRemaining} &divide; 800&apos;) &times; {vimshottari.balanceAtBirth.totalMahaYears} years = <span className="font-bold text-[#8C2D19]">{vimshottari.balanceAtBirth.yearsRemaining} years ({vimshottari.balanceAtBirth.formattedBalance})</span>
                    </div>
                    <div>
                      <strong>Bhukta Elapsed:</strong> ({vimshottari.balanceAtBirth.dmsTraversed} &divide; 800&apos;) &times; {vimshottari.balanceAtBirth.totalMahaYears} years = <span className="font-bold text-slate-900">{vimshottari.balanceAtBirth.yearsElapsed} years ({vimshottari.balanceAtBirth.formattedElapsed})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold font-serif text-slate-900 text-sm block">
                  4. Antardaśā &amp; Sub-Period Proportional Formula
                </span>
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="font-mono text-slate-900">
                    <strong>Antardaśā Duration (Years):</strong> (Mahādaśā Years &times; Antardaśā Lord Years) &divide; 120
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Sub-periods do not arbitrarily shrink or restart at birth. The 9 Antardaśās run consecutively from the astronomical start of the Mahādaśā ({vimshottari.activeAtBirth.mahadasha.startDate}). Those prior to birth are pre-natal; the one spanning the birth date operates at birth with its balance; and subsequent sub-periods execute for their full classical lengths.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold font-serif text-slate-900 text-sm block">
                  5. Year Length Discrepancies Explained (360d Sāvana vs. 365.2425d Solar)
                </span>
                <p className="text-slate-600 text-[11px]">
                  Classical texts like <em>BPHS</em> (Ch. 46) and <em>Sūrya Siddhānta</em> frequently employ the 360-day <strong>Sāvana Year</strong> (12 months &times; 30 civil days). Modern computerized ephemerides (such as AstroSage or Drik) typically default to the 365.2425-day <strong>Gregorian Solar Year</strong>.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] font-mono border border-slate-200 bg-white rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-2 text-left">Daśā Māna Type</th>
                        <th className="p-2 text-left">Days per Year</th>
                        <th className="p-2 text-left">Classical Origin</th>
                        <th className="p-2 text-left">Software Default</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className={yearLength === 'solar' ? 'bg-amber-50 font-bold' : ''}>
                        <td className="p-2">Modern Solar</td>
                        <td className="p-2">365.2425</td>
                        <td className="p-2">Tropical / Civil Calendar</td>
                        <td className="p-2">AstroSage, Drik, Parāśara Light</td>
                      </tr>
                      <tr className={yearLength === 'savana' ? 'bg-amber-50 font-bold' : ''}>
                        <td className="p-2">Classical Sāvana</td>
                        <td className="p-2">360.0000</td>
                        <td className="p-2">BPHS Ch. 46, Sūrya Siddhānta</td>
                        <td className="p-2">Jagannatha Hora (Configurable)</td>
                      </tr>
                      <tr className={yearLength === 'sidereal' ? 'bg-amber-50 font-bold' : ''}>
                        <td className="p-2">Sidereal Saura</td>
                        <td className="p-2">365.2564</td>
                        <td className="p-2">Sun 360&deg; sidereal transit</td>
                        <td className="p-2">Astronomical research</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowMathModal(false)}
                className="px-5 py-2 rounded-xl bg-[#8C2D19] text-white text-xs font-semibold hover:bg-[#722414] transition-all cursor-pointer shadow-sm"
              >
                Close Audit Dialog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

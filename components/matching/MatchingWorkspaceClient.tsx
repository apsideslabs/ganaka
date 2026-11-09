'use client';

/**
 * Gaṇaka — Kuṭa Milan / Vivāha Matching Dedicated Workspace
 * Complete, deterministic two-chart matching console built upon verified classical Jyotiṣa canons:
 * - Aṣṭakūṭa 36-Point Framework (Muhūrta Cintāmaṇi & BPHS)
 * - South Indian Daśakūṭa 10-Poruthams (Mādhavīya, Prasna Marga)
 * - Rigorous exception/parihāra engine (raw status -> exception check -> verified result)
 * - Deeper Horoscope Factors (7th House/Lord, Venus/Jupiter, D-9 Navāṃśa, Jaimini UL/DK, Kuja Sāmya)
 * - Interactive rule inspection and classical Sanskrit citation tracing
 */

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { calculateFullJyotishaChart, CalculationInput } from '@/lib/jyotisha/calculator';
import { calculateKutaMilan } from '@/lib/jyotisha/kuta/kuta-engine';
import { extractLunarData } from '@/lib/jyotisha/kuta/ashtakuta-calculator';
import { MatchingTradition } from '@/lib/jyotisha/kuta/types';
import { CITIES_DATABASE, searchLocations } from '@/lib/astronomy/coordinates';
import { useCitySearch } from '@/hooks/use-city-search';
import { formatPlaceRegion } from '@/lib/format-place';
import { KutaCard } from './KutaCard';
import { DeeperMatchingPanel } from './DeeperMatchingPanel';
import { MatchingDiagram } from './MatchingDiagram';
import { GanakaDatePicker } from '../ui/GanakaDatePicker';
import { GanakaClockPicker } from '../ui/GanakaClockPicker';
import { GanakaButton } from '../ui/GanakaButton';
import {
  Users,
  Award,
  Sparkles,
  ShieldCheck,
  BookOpen,
  MapPin,
  Calendar,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronDown,
} from 'lucide-react';


function isoToDate(iso: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 12, 0, 0);
}

function dateToIso(date: Date | null): string {
  if (!date) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function MatchingWorkspaceClient() {
  const [tradition, setTradition] = useState<MatchingTradition>('ashtakuta');
  const [activeTab, setActiveTab] = useState<'kutas' | 'deeper' | 'sources'>('kutas');

  // Groom Form State (Default: New Delhi, 15 May 1990, 10:30)
  const [groomName, setGroomName] = useState('Groom (Vara)');
  const [groomDate, setGroomDate] = useState('1990-05-15');
  const [groomTime, setGroomTime] = useState({ hour: 10, minute: 30, second: 0 });
  const [groomCitySearch, setGroomCitySearch] = useState('New Delhi');
  const [groomLocation, setGroomLocation] = useState(CITIES_DATABASE[0]);

  // Bride Form State (Default: Mumbai, 22 Nov 1993, 14:15)
  const [brideName, setBrideName] = useState('Bride (Kanyā)');
  const [brideDate, setBrideDate] = useState('1993-11-22');
  const [brideTime, setBrideTime] = useState({ hour: 14, minute: 15, second: 0 });
  const [brideCitySearch, setBrideCitySearch] = useState('Mumbai');
  const [brideLocation, setBrideLocation] = useState(
    CITIES_DATABASE.find((c) => c.name === 'Mumbai') || CITIES_DATABASE[1]
  );

  // Compute Groom Chart
  const groomChart = useMemo(() => {
    const [y, m, d] = groomDate.split('-').map(Number);
    const input: CalculationInput = {
      year: y || 1990,
      month: m || 5,
      day: d || 15,
      hour: groomTime.hour,
      minute: groomTime.minute,
      second: groomTime.second,
      latitude: groomLocation.latitude,
      longitude: groomLocation.longitude,
      timezoneOffsetHours: groomLocation.timezoneOffsetHours,
      locationName: groomLocation.name,
    };
    return calculateFullJyotishaChart(input);
  }, [groomDate, groomTime, groomLocation]);

  // Compute Bride Chart
  const brideChart = useMemo(() => {
    const [y, m, d] = brideDate.split('-').map(Number);
    const input: CalculationInput = {
      year: y || 1993,
      month: m || 11,
      day: d || 22,
      hour: brideTime.hour,
      minute: brideTime.minute,
      second: brideTime.second,
      latitude: brideLocation.latitude,
      longitude: brideLocation.longitude,
      timezoneOffsetHours: brideLocation.timezoneOffsetHours,
      locationName: brideLocation.name,
    };
    return calculateFullJyotishaChart(input);
  }, [brideDate, brideTime, brideLocation]);

  // Compute Kūṭa Milan Result
  const matchingResult = useMemo(() => {
    return calculateKutaMilan(groomChart, brideChart, tradition);
  }, [groomChart, brideChart, tradition]);

  const groomLunar = useMemo(() => extractLunarData(groomChart), [groomChart]);
  const brideLunar = useMemo(() => extractLunarData(brideChart), [brideChart]);

  // City Search handlers
  const [showGroomCityDropdown, setShowGroomCityDropdown] = useState(false);
  const [showBrideCityDropdown, setShowBrideCityDropdown] = useState(false);

  const groomCityResults = useCitySearch(groomCitySearch, 5, 5);

  const brideCityResults = useCitySearch(brideCitySearch, 5, 5);

  return (
    <div className="w-full min-h-screen bg-[#FDFCF8] text-[#171614] pb-16">
      {/* Top Header Bar */}
      <div className="w-full bg-[#FAF9F6] border-b border-[#DCD5C6] px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider font-bold bg-[#8C2D19]/10 text-[#8C2D19]">
                Classical Vivāha Saṃvāda
              </span>
              <span className="text-xs font-mono text-stone-400">
                Aṣṭakūṭa & Daśakūṭa Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mt-1">
              Kuṭa Milan & Marriage Compatibility
            </h1>
            <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
              Deterministic, source-traceable two-chart matching according to Muhūrta Cintāmaṇi,
              Bṛhat Parāśara Horā Śāstra, and Mādhavīya. Complete with raw condition detection,
              classical exceptions (Parihāra / Bhaṅga), and deeper horoscope factors.
            </p>
          </div>

          {/* Tradition Switcher */}
          <div className="flex items-center gap-2 p-1 bg-[#ECE7DC] rounded-xl border border-[#DCD5C6] self-start md:self-auto">
            <button
              type="button"
              id="select-tradition-ashtakuta"
              onClick={() => setTradition('ashtakuta')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                tradition === 'ashtakuta'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Aṣṭakūṭa (36 Pts)
            </button>
            <button
              type="button"
              id="select-tradition-dashakuta"
              onClick={() => setTradition('dashakuta')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                tradition === 'dashakuta'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Daśakūṭa (10 Poruthams)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Two-Person Input Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 border-b border-stone-200">
          {/* Groom (Vara) Card */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#171614] text-[#FCFAF6] flex items-center justify-center font-mono text-xs font-bold">
                  ♂
                </span>
                <input
                  type="text"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  className="font-serif font-bold text-sm text-stone-900 bg-transparent border-b border-dashed border-stone-300 focus:outline-none focus:border-[#8C2D19]"
                />
              </div>
              <span className="text-[11px] font-mono text-stone-500">
                {groomLunar.rashiName} ({groomLunar.nakshatraName} P{groomLunar.nakshatraPada})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block mb-1">
                  Birth Date
                </label>
                <GanakaDatePicker value={isoToDate(groomDate)} onChange={(d) => setGroomDate(dateToIso(d))} />
              </div>

              <div>
                <label className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block mb-1">
                  Birth Time
                </label>
                <GanakaClockPicker value={groomTime} onChange={setGroomTime} />
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block mb-1">
                Birth Location
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={groomCitySearch}
                  onChange={(e) => {
                    setGroomCitySearch(e.target.value);
                    setShowGroomCityDropdown(true);
                  }}
                  onFocus={() => setShowGroomCityDropdown(true)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-[#8C2D19]"
                  placeholder="Search city..."
                />
              </div>
              {showGroomCityDropdown && groomCityResults.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden">
                  {groomCityResults.map((c) => (
                    <button
                      key={`groom-loc-${c.name}`}
                      type="button"
                      onClick={() => {
                        setGroomLocation(c);
                        setGroomCitySearch(c.name);
                        setShowGroomCityDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center justify-between"
                    >
                      <span className="font-semibold text-stone-800">{c.name}</span>
                      <span className="text-[10px] font-mono text-stone-500">
                        {formatPlaceRegion({ name: c.name, stateOrRegion: c.state, country: c.country })}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bride (Kanyā) Card */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#8C2D19] text-[#FCFAF6] flex items-center justify-center font-mono text-xs font-bold">
                  ♀
                </span>
                <input
                  type="text"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  className="font-serif font-bold text-sm text-stone-900 bg-transparent border-b border-dashed border-stone-300 focus:outline-none focus:border-[#8C2D19]"
                />
              </div>
              <span className="text-[11px] font-mono text-stone-500">
                {brideLunar.rashiName} ({brideLunar.nakshatraName} P{brideLunar.nakshatraPada})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block mb-1">
                  Birth Date
                </label>
                <GanakaDatePicker value={isoToDate(brideDate)} onChange={(d) => setBrideDate(dateToIso(d))} />
              </div>

              <div>
                <label className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block mb-1">
                  Birth Time
                </label>
                <GanakaClockPicker value={brideTime} onChange={setBrideTime} />
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block mb-1">
                Birth Location
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={brideCitySearch}
                  onChange={(e) => {
                    setBrideCitySearch(e.target.value);
                    setShowBrideCityDropdown(true);
                  }}
                  onFocus={() => setShowBrideCityDropdown(true)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-[#8C2D19]"
                  placeholder="Search city..."
                />
              </div>
              {showBrideCityDropdown && brideCityResults.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden">
                  {brideCityResults.map((c) => (
                    <button
                      key={`bride-loc-${c.name}`}
                      type="button"
                      onClick={() => {
                        setBrideLocation(c);
                        setBrideCitySearch(c.name);
                        setShowBrideCityDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 flex items-center justify-between"
                    >
                      <span className="font-semibold text-stone-800">{c.name}</span>
                      <span className="text-[10px] font-mono text-stone-500">{c.state || c.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Master Score & Classical Verdict Banner */}
        <div className="mt-6 p-6 bg-white border border-stone-200/90 rounded-2xl shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                    matchingResult.recommendationLevel.startsWith('Uttama')
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : matchingResult.recommendationLevel.startsWith('Madhyama')
                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {matchingResult.recommendationLevel}
                </span>
                <span className="text-xs font-mono text-stone-500">
                  {matchingResult.classicalSummary.primaryTreatiseBasis}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
                {matchingResult.totalScore} of {matchingResult.maxTotalScore} Classical Points ({matchingResult.percentageScore}%)
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
                {matchingResult.classicalSummary.coreVerdictText}
              </p>

              {/* Critical active remedies / exceptions */}
              {matchingResult.classicalSummary.criticalRemediesActive.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {matchingResult.classicalSummary.criticalRemediesActive.map((r, i) => (
                    <span
                      key={`rem-${i}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-mono font-medium"
                    >
                      <ShieldCheck className="w-3 h-3 text-amber-700" />
                      {r}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Visual Mini Dial */}
            <div className="flex items-center gap-4 shrink-0 p-4 bg-stone-50 rounded-xl border border-stone-100">
              <div className="text-center">
                <span className="text-[10px] font-mono text-stone-500 uppercase block">Nāḍī Status</span>
                <span
                  className={`text-xs font-mono font-bold ${
                    matchingResult.isNadiKutaPass ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {matchingResult.isNadiKutaPass ? 'Pass' : 'Defective'}
                </span>
              </div>
              <div className="w-px h-8 bg-stone-200" />
              <div className="text-center">
                <span className="text-[10px] font-mono text-stone-500 uppercase block">Bhakūṭa Status</span>
                <span
                  className={`text-xs font-mono font-bold ${
                    matchingResult.isBhakutaPass ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {matchingResult.isBhakutaPass ? 'Pass' : 'Defective'}
                </span>
              </div>
              <div className="w-px h-8 bg-stone-200" />
              <div className="text-center">
                <span className="text-[10px] font-mono text-stone-500 uppercase block">Gaṇa Status</span>
                <span
                  className={`text-xs font-mono font-bold ${
                    matchingResult.isGanaKutaPass ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {matchingResult.isGanaKutaPass ? 'Pass' : 'Moderate'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View Tabs: Kūṭas vs Deeper Factors vs Diagrams */}
        <div className="flex items-center gap-2 mt-8 border-b border-stone-200">
          <button
            type="button"
            onClick={() => setActiveTab('kutas')}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'kutas'
                ? 'border-[#8C2D19] text-[#8C2D19]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            {tradition === 'ashtakuta' ? 'Aṣṭakūṭa Factors (8 Kūṭas)' : 'Daśakūṭa Factors (10 Poruthams)'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('deeper')}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'deeper'
                ? 'border-[#8C2D19] text-[#8C2D19]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Deeper Horoscope Analysis (7th/D9/Kuja)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sources')}
            className={`px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'sources'
                ? 'border-[#8C2D19] text-[#8C2D19]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Classical Source Hierarchy
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'kutas' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: The Kūṭa Cards */}
              <div className="lg:col-span-2 space-y-4">
                {matchingResult.kutaResults.map((kuta, idx) => (
                  <KutaCard key={kuta.id} kuta={kuta} index={idx} />
                ))}
              </div>

              {/* Right Col: Zodiacal Geometry Diagram */}
              <div className="space-y-4">
                <MatchingDiagram groom={groomLunar} bride={brideLunar} />

                {/* Classical Reference Card */}
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-stone-900 font-serif">
                    <BookOpen className="w-3.5 h-3.5 text-[#8C2D19]" />
                    <span>Classical Evaluation Methodology</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed text-[11px]">
                    According to Muhūrta Cintāmaṇi Śloka 1–32, individual score alone is never the sole criterion.
                    A union scoring 28/36 with uncancelled Eka-Nāḍī Doṣa is prohibited, while an 18/36 union
                    with clean Nāḍī and cancelled Bhakūṭa (Ekeśa Bhaṅga) is auspicious and permissible.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deeper' && (
            <DeeperMatchingPanel deeper={matchingResult.deeperFactors} />
          )}

          {activeTab === 'sources' && (
            <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">
                  Classical Treatises & Textual Foundations
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  Gaṇaka does not rely on modern internet tables, commercial scoring formulas, or arbitrary weights.
                  Every Kūṭa, condition, exception, and cancellation is grounded in primary Sanskrit literature.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                  <h4 className="font-serif font-bold text-stone-900 text-sm">
                    1. Muhūrta Cintāmaṇi (मुहूर्तचिन्तामणिः)
                  </h4>
                  <p className="text-stone-500 font-mono text-[10px]">
                    Author: Daivajña Rāma (16th Century CE) — Vivāha Prakaraṇa (Ślokas 1–32)
                  </p>
                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    The foremost authority on Aṣṭakūṭa. Defines exact scoring, Varṇa ranks,
                    Vaśya matrix, Yoni Mahāvaira, Gaṇa classifications, and essential Parihāras
                    for Eka-Nāḍī and Bhakūṭa.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                  <h4 className="font-serif font-bold text-stone-900 text-sm">
                    2. Bṛhat Parāśara Horā Śāstra (बृहत्पाराशर होराशास्त्रम्)
                  </h4>
                  <p className="text-stone-500 font-mono text-[10px]">
                    Author: Maharṣi Parāśara — Chapters 80 & 81 (Strī Jātaka & Vivāha Kūṭa)
                  </p>
                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    Foundational Parāśari canons for conjugal compatibility, Kuja Doṣa formation,
                    7th house lord aspects, and Navāṃśa (D-9) resonance.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                  <h4 className="font-serif font-bold text-stone-900 text-sm">
                    3. Mādhavīya & Jātaka Deśamārga (माधवीयम् / जातकदेशमार्गः)
                  </h4>
                  <p className="text-stone-500 font-mono text-[10px]">
                    Classical South Indian Porutham Authority
                  </p>
                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    Defines the 10-Porutham system (Daśakūṭa), establishing Mahendra, Strī Dīrgha,
                    the 5 Rajjus (Śiro, Kaṇṭha, Nābhi, Kaṭi, Pāda), and Vedha nakṣatra piercing rays.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                  <h4 className="font-serif font-bold text-stone-900 text-sm">
                    4. Jaimini Upadeśa Sūtras (जैमिनि उपदेश सूत्राणि)
                  </h4>
                  <p className="text-stone-500 font-mono text-[10px]">
                    Author: Maharṣi Jaimini — Chapter 1 Pāda 4
                  </p>
                  <p className="text-stone-600 text-[11px] leading-relaxed">
                    Evaluates the Upapada Lagna (UL) and Dārakāraka (DK) mutual disposition,
                    confirming long-term spiritual companionship and dharmic alignment.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

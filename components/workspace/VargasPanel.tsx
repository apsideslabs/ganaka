'use client';

/**
 * Gaṇaka — Divisional Charts (Varga Chakras / वर्ग चक्र) Explorer
 * Clean SVG-based vector chart visualizer with crisp lines, balanced spacing,
 * proper typography, and consistent house/sign geometry.
 *
 * Supports:
 * 1. Standard Vargas — D1–D60 (the 16 canonical BPHS Śoḍaśavarga charts) [Default]
 * 2. Extended Vargas — Traditional harmonic charts (D5, D6, D8, D11, D81, D108, D144)
 */

import React, { useState, useEffect } from 'react';
import { VargaChart, VargaId, CalculatedPlanet, RashiNumber } from '@/lib/jyotisha/types';
import { PlanetId } from '@/lib/astronomy/ephemeris';
import { DivisionalChartDiagram } from './DivisionalChartDiagram';
import { RASHIS, GRAHA_PROPERTIES } from '@/lib/jyotisha/constants';
import {
  VARGA_DEFINITIONS,
  STANDARD_VARGA_IDS,
  EXTENDED_VARGA_IDS,
} from '@/lib/vargas/varga-engine';
import {
  getWorkspaceSettings,
  subscribeToSettings,
  saveWorkspaceSettings,
} from '@/lib/settings/settings-storage';
import {
  Layers,
  Compass,
  CheckCircle2,
  Award,
  Sparkles,
  Sliders,
  RotateCcw,
} from 'lucide-react';

interface VargasPanelProps {
  vargas: Record<VargaId, VargaChart>;
  vargottamaPlanets: PlanetId[];
  onNavigateToNavamsha?: () => void;
  onNavigateToAshtakavarga?: (vargaId: VargaId) => void;
  onOpenSettings?: () => void;
}

const BHAVA_TITLES: Record<number, { sanskrit: string; english: string; karakatva: string }> = {
  1: { sanskrit: 'Tanu Bhāva', english: 'Self & Vitality', karakatva: 'Constitutional seed & core identity' },
  2: { sanskrit: 'Dhana Bhāva', english: 'Wealth & Speech', karakatva: 'Resources, lineage & expression' },
  3: { sanskrit: 'Sahaja Bhāva', english: 'Courage & Siblings', karakatva: 'Valor, enterprise & initiative' },
  4: { sanskrit: 'Sukha Bhāva', english: 'Happiness & Assets', karakatva: 'Inner contentment, property & mother' },
  5: { sanskrit: 'Putra Bhāva', english: 'Progeny & Intellect', karakatva: 'Creative genius, lineage & pūrva-puṇya' },
  6: { sanskrit: 'Ari Bhāva', english: 'Obstacles & Service', karakatva: 'Conflict resolution, discipline & debts' },
  7: { sanskrit: 'Yuvati Bhāva', english: 'Spouse & Partner', karakatva: 'Union, contracts & reciprocal bonds' },
  8: { sanskrit: 'Randhra Bhāva', english: 'Transformation', karakatva: 'Longevity, occult secrets & deep karma' },
  9: { sanskrit: 'Dharma Bhāva', english: 'Fortune & Preceptor', karakatva: 'Higher law, guru guidance & righteous path' },
  10: { sanskrit: 'Karma Bhāva', english: 'Vocation & Authority', karakatva: 'Action in the world, reputation & duty' },
  11: { sanskrit: 'Lābha Bhāva', english: 'Gains & Aspirations', karakatva: 'Revenues, community & fulfillment' },
  12: { sanskrit: 'Vyaya Bhāva', english: 'Liberation & Mokṣa', karakatva: 'Renunciation, expenditures & transcendence' },
};

export function VargasPanel({
  vargas,
  vargottamaPlanets,
  onNavigateToNavamsha,
  onNavigateToAshtakavarga,
  onOpenSettings,
}: VargasPanelProps) {
  // Initialize from Workspace Settings
  const [workspaceSettings, setWorkspaceSettings] = useState(() => getWorkspaceSettings());
  const [vargaSetMode, setVargaSetMode] = useState<'standard' | 'extended'>(
    () => workspaceSettings.vargaSetMode || 'standard'
  );
  const [selectedVargaId, setSelectedVargaId] = useState<VargaId>('D9');
  const [activeTab, setActiveTab] = useState<'planets' | 'houses'>('planets');

  // Keep state synchronized with Workspace Settings storage
  useEffect(() => {
    return subscribeToSettings((scope) => {
      if (scope === 'workspace') {
        const s = getWorkspaceSettings();
        setWorkspaceSettings(s);
        if (s.vargaSetMode) {
          setVargaSetMode(s.vargaSetMode);
        }
      }
    });
  }, []);

  const handleSetModeChange = (mode: 'standard' | 'extended') => {
    setVargaSetMode(mode);
    const updated = {
      ...workspaceSettings,
      vargaSetMode: mode,
    };
    setWorkspaceSettings(updated);
    saveWorkspaceSettings(updated);
  };

  const activeVarga = vargas[selectedVargaId] || vargas['D1'];
  const activeDef = VARGA_DEFINITIONS[selectedVargaId] || VARGA_DEFINITIONS['D1'];

  // Enabled extended vargas
  const enabledExtended = workspaceSettings.enabledExtendedVargas || EXTENDED_VARGA_IDS;

  return (
    <div id="vargas-panel-container" className="space-y-6">
      {/* Header */}
      <div
        id="vargas-header-bar"
        className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 id="vargas-main-title" className="font-serif text-lg font-bold tracking-tight text-slate-900">
              Divisional Charts Explorer (वर्ग चक्र)
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#8C2D19]/10 text-[#8C2D19]">
              {vargaSetMode === 'standard' ? 'Standard 16 Vargas' : 'Extended Vargas Active'}
            </span>
          </div>
          <p className="font-sans text-xs text-slate-500 mt-0.5">
            Crisp SVG harmonic charts computed per authentic classical Parāśara &amp; Jaimini principles
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Vargottama Status Badge */}
          {vargottamaPlanets.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-sans font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Vargottama (D1=D9):</span>
              <span className="font-bold uppercase font-mono">{vargottamaPlanets.join(', ')}</span>
            </div>
          )}

          {/* Settings shortcut button */}
          {onOpenSettings && (
            <button
              type="button"
              id="btn-vargas-open-settings"
              onClick={onOpenSettings}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
              title="Configure Varga Sets & Options in Workspace Settings"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Varga Settings</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================= */}
      {/* VARGA SELECTOR TIER (STANDARD VS EXTENDED)                    */}
      {/* ============================================================= */}
      <div id="varga-selection-container" className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3.5">
        {/* Tier Mode Selector Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 font-sans text-xs">
              <button
                type="button"
                id="btn-varga-mode-standard"
                onClick={() => handleSetModeChange('standard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  vargaSetMode === 'standard'
                    ? 'bg-[#8C2D19] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>1. Standard Vargas (D1–D60)</span>
                <span className="text-[10px] opacity-85">(16 Charts)</span>
              </button>

              <button
                type="button"
                id="btn-toggle-extended-vargas"
                onClick={() => handleSetModeChange('extended')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  vargaSetMode === 'extended'
                    ? 'bg-[#8C2D19] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>2. Extended Vargas</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            {vargaSetMode === 'standard' ? (
              <span>Canonical BPHS Śoḍaśavarga (Default)</span>
            ) : (
              <span className="text-indigo-700 font-medium">Traditional Harmonic Extensions Loaded</span>
            )}
          </div>
        </div>

        {/* Standard 16 Vargas Ribbon */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold px-1">
            <span>Standard Vargas — Ṣoḍaśavarga (16 Canonical Charts)</span>
            <span className="text-[10px] text-slate-400">Classical Parāśara</span>
          </div>

          <div
            id="varga-selector-ribbon"
            className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-1.5 font-sans"
          >
            {STANDARD_VARGA_IDS.map((vId) => {
              const def = VARGA_DEFINITIONS[vId];
              const isSelected = selectedVargaId === vId;

              return (
                <button
                  key={vId}
                  type="button"
                  id={`btn-varga-${vId}`}
                  onClick={() => setSelectedVargaId(vId)}
                  title={`${def.name} (${def.sanskritName}) — ${def.significance}`}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#8C2D19] text-white border-[#8C2D19] shadow-xs font-bold'
                      : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold font-mono">{vId}</div>
                  <div className="text-[10px] truncate opacity-90">{def.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Extended Vargas Section (Loaded separately when mode is 'extended' or accessed) */}
        {vargaSetMode === 'extended' && (
          <div
            id="extended-vargas-loaded-section"
            className="pt-3 border-t border-slate-200/80 space-y-2 animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-indigo-900 font-semibold px-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Extended Vargas (7 Traditional Harmonic Charts)</span>
              </span>
              <button
                type="button"
                onClick={() => handleSetModeChange('standard')}
                className="text-[10px] text-slate-500 hover:text-[#8C2D19] cursor-pointer inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Return to Standard</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 font-sans">
              {EXTENDED_VARGA_IDS.map((vId) => {
                const def = VARGA_DEFINITIONS[vId];
                const isSelected = selectedVargaId === vId;
                const isEnabled = enabledExtended.includes(vId);

                return (
                  <button
                    key={vId}
                    type="button"
                    id={`btn-extended-varga-${vId}`}
                    onClick={() => setSelectedVargaId(vId)}
                    title={`${def.name} (${def.sanskritName}) — ${def.significance} [Source: ${def.classicalSource}]`}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-bold'
                        : isEnabled
                        ? 'bg-indigo-50/50 text-slate-800 border-indigo-200/80 hover:bg-indigo-100/50'
                        : 'bg-slate-50 text-slate-400 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono">{vId}</span>
                      <span className="text-[9px] font-mono opacity-80">1/{def.factor}</span>
                    </div>
                    <div className="text-xs font-serif font-semibold truncate mt-0.5">{def.name}</div>
                    <div className="text-[9px] opacity-75 truncate">{def.sanskritName}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================= */}
      {/* MAIN SELECTED VARGA VIEW: CRISP SVG CHART + DETAILED LEDGER   */}
      {/* ============================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: High-Definition SVG Chart Visualizer */}
        <div className="lg:col-span-6 flex justify-center w-full">
          <DivisionalChartDiagram
            key={`${selectedVargaId}-${activeVarga.lagnaRashi}`}
            vargaId={selectedVargaId}
            vargaName={activeDef.name}
            sanskritName={activeDef.sanskritName}
            significance={activeDef.significance}
            divisionFactor={activeDef.factor}
            lagnaRashi={activeVarga.lagnaRashi}
            planets={activeVarga.planets}
            initialStyle={workspaceSettings.chartStyle || 'north'}
          />
        </div>

        {/* Right Column: Varga Insights, Architectural Isolation & Tables */}
        <div className="lg:col-span-6 space-y-6 font-sans">
          {/* Varga Information Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#8C2D19]">
                <Layers className="w-4 h-4" /> Varga Significance &amp; Division Factor
              </div>
              <div className="flex items-center gap-1.5">
                {selectedVargaId === 'D9' && onNavigateToNavamsha && (
                  <button
                    type="button"
                    onClick={onNavigateToNavamsha}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-lg text-[11px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1 shadow-2xs"
                  >
                    <span>108-Navāṃśa Table</span>
                    <Compass className="w-3 h-3 text-[#8C2D19]" />
                  </button>
                )}
                {onNavigateToAshtakavarga && (
                  <button
                    type="button"
                    id={`btn-open-${selectedVargaId.toLowerCase()}-sav`}
                    onClick={() => onNavigateToAshtakavarga(selectedVargaId)}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-[#8C2D19] border border-[#8C2D19]/30 rounded-lg text-[11px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1 shadow-2xs"
                    title={`View ${selectedVargaId} Ashtakavarga points (SAV & BAV)`}
                  >
                    <span>{selectedVargaId} SAV Bindus</span>
                    <Award className="w-3 h-3 text-[#8C2D19]" />
                  </button>
                )}
              </div>
            </div>

            <h3 className="text-lg font-serif font-bold text-slate-900">
              {activeDef.id}: {activeDef.name} ({activeDef.sanskritName})
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">{activeDef.significance}</p>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 font-mono flex-wrap gap-2">
              <div>
                Harmonic Division: <strong className="text-slate-800">1/{activeDef.factor}</strong> (Arc span ={' '}
                {(30 / activeDef.factor).toFixed(2)}°)
              </div>
              <div className="text-amber-900/80 text-[11px]">
                Classical Source: {activeDef.classicalSource}
              </div>
            </div>
          </div>

          {/* Architectural Notice: Strict Varga Isolation */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold">Independent Varga Ascendant: </span>
              <span>House 1 = </span>
              <span className="font-serif font-bold text-[#8C2D19]">
                {RASHIS[activeVarga.lagnaRashi]?.sanskritName} ({RASHIS[activeVarga.lagnaRashi]?.name} • #{activeVarga.lagnaRashi})
              </span>
            </div>
            <div className="text-[11px] text-amber-800 font-medium">
              Strict isolation: Never reuses D1 house mapping.
            </div>
          </div>

          {/* Table Container with Sub-Tab Switcher */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3 font-serif text-sm font-bold text-slate-900 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 font-sans text-xs">
                <button
                  type="button"
                  id="btn-varga-tab-planets"
                  onClick={() => setActiveTab('planets')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeTab === 'planets'
                      ? 'bg-[#8C2D19] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Planetary Coordinates
                </button>
                <button
                  type="button"
                  id="btn-varga-tab-houses"
                  onClick={() => setActiveTab('houses')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    activeTab === 'houses'
                      ? 'bg-[#8C2D19] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  12-Bhāva Ledger (Houses)
                </button>
              </div>

              <span className="text-xs text-slate-500 font-sans font-normal">
                {activeTab === 'planets' ? 'Harmonic Coordinates' : 'Independent House ↔ Rāśi Architecture'}
              </span>
            </div>

            {activeTab === 'planets' ? (
              <div className="overflow-x-auto">
                <table id="varga-planets-table" className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                      <th className="py-3 px-4">Graha</th>
                      <th className="py-3 px-4">Rāśi (Sign)</th>
                      <th className="py-3 px-4">Sign Lord</th>
                      <th className="py-3 px-4 text-center">House</th>
                      <th className="py-3 px-4 text-right">Degree in Division</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(activeVarga.planets).map(([pId, pInfo]) => {
                      const rInfo = RASHIS[pInfo.rashiNumber];
                      const prop = GRAHA_PROPERTIES[pId as PlanetId];

                      return (
                        <tr key={pId} id={`varga-planet-row-${pId}`} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            <span className="font-serif capitalize">{prop?.sanskritName || pId}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-800 font-medium">
                            {rInfo.sanskritName} ({rInfo.name})
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px] uppercase">
                            {rInfo.lord}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-[#8C2D19]">
                            H{pInfo.house}
                          </td>
                          <td className="py-3 px-4 font-mono text-right text-slate-600">
                            {pInfo.degreeInRashi.toFixed(2)}°
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* 12-Bhāva Ledger: Independent House ↔ Rāśi Mapping for this Varga */
              <div className="overflow-x-auto">
                <table id="varga-houses-table" className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                      <th className="py-3 px-4">House (Bhāva)</th>
                      <th className="py-3 px-4">Rāśi in {activeDef.id}</th>
                      <th className="py-3 px-4">Varga Lord (Bhāveśa)</th>
                      <th className="py-3 px-4">Lord Placement in {activeDef.id}</th>
                      <th className="py-3 px-4">Occupants in {activeDef.id}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
                      const houseRashi = ((((activeVarga.lagnaRashi - 1) + (h - 1)) % 12) + 1) as RashiNumber;
                      const rInfo = RASHIS[houseRashi];
                      const lordId = rInfo.lord as PlanetId;
                      const lordInVarga = activeVarga.planets[lordId];
                      const bTitle = BHAVA_TITLES[h];

                      const occupants = Object.entries(activeVarga.planets)
                        .filter(([_, p]) => p.house === h)
                        .map(([id]) => id as PlanetId);

                      return (
                        <tr key={h} id={`varga-house-row-${h}`} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#8C2D19] font-mono">H{h}</div>
                            <div className="font-serif text-[11px] text-slate-700">{bTitle.sanskrit}</div>
                            <div className="text-[10px] text-slate-400">{bTitle.english}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900">
                              {rInfo.sanskritName} ({rInfo.name})
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">Sign #{houseRashi}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-serif font-semibold capitalize text-slate-800">
                              {GRAHA_PROPERTIES[lordId]?.sanskritName || lordId}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono ml-1">({lordId})</span>
                          </td>
                          <td className="py-3 px-4">
                            {lordInVarga ? (
                              <div>
                                <span className="font-mono font-bold text-[#8C2D19]">H{lordInVarga.house}</span>
                                <span className="text-slate-600 ml-1">
                                  ({RASHIS[lordInVarga.rashiNumber]?.sanskritName || ''})
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 font-mono text-[11px]">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {occupants.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {occupants.map((occ) => (
                                  <span
                                    key={occ}
                                    className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 font-serif text-[11px] font-medium"
                                  >
                                    {GRAHA_PROPERTIES[occ]?.sanskritName || occ}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Empty</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

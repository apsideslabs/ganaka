'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Sliders,
  X,
  RotateCcw,
  Check,
  Eye,
  Layers,
  Sparkles,
  Award,
  CircleDot,
  Columns,
  Info,
  BookOpen,
  PlusCircle,
  Compass,
} from 'lucide-react';
import {
  WorkspaceSettings,
  VargaSetMode,
  DEFAULT_WORKSPACE_SETTINGS,
} from '@/lib/settings/types';
import {
  getWorkspaceSettings,
  saveWorkspaceSettings,
  resetWorkspaceSettings,
  subscribeToSettings,
} from '@/lib/settings/settings-storage';
import { VargaId } from '@/lib/jyotisha/types';
import {
  VARGA_DEFINITIONS,
  STANDARD_VARGA_IDS,
  EXTENDED_VARGA_IDS,
} from '@/lib/vargas/varga-engine';
import { AYANAMSHA_DEFINITIONS, AyanamshaType } from '@/lib/astronomy/ayanamsha';

interface WorkspaceSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerButton?: React.ReactNode;
  onSettingsApplied?: (newSettings: WorkspaceSettings) => void;
}

export function WorkspaceSettingsDialog({
  open,
  onOpenChange,
  triggerButton,
  onSettingsApplied,
}: WorkspaceSettingsDialogProps) {
  const [settings, setSettings] = useState<WorkspaceSettings>(() => getWorkspaceSettings());
  const [activeTab, setActiveTab] = useState<'rendering' | 'vargas' | 'ephemeris' | 'dignities'>('rendering');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setSettings(getWorkspaceSettings());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    return subscribeToSettings((scope) => {
      if (scope === 'workspace') {
        setSettings(getWorkspaceSettings());
      }
    });
  }, []);

  const updateSetting = <K extends keyof WorkspaceSettings>(key: K, value: WorkspaceSettings[K]) => {
    const updated = saveWorkspaceSettings({ [key]: value });
    setSettings(updated);
    if (onSettingsApplied) {
      onSettingsApplied(updated);
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1500);
  };

  const handleReset = () => {
    const reset = resetWorkspaceSettings();
    setSettings(reset);
    if (onSettingsApplied) {
      onSettingsApplied(reset);
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1500);
  };

  const toggleExtendedVarga = (vid: VargaId) => {
    const current = settings.enabledExtendedVargas || [];
    const next = current.includes(vid)
      ? current.filter((id) => id !== vid)
      : [...current, vid];
    updateSetting('enabledExtendedVargas', next);
  };

  const setAllExtendedVargas = (enable: boolean) => {
    updateSetting('enabledExtendedVargas', enable ? [...EXTENDED_VARGA_IDS] : []);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {triggerButton && <Dialog.Trigger asChild>{triggerButton}</Dialog.Trigger>}

      <Dialog.Portal>
        <Dialog.Overlay
          id="workspace-settings-overlay"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        />

        <Dialog.Content
          id="workspace-settings-modal"
          className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col focus:outline-none animate-in slide-in-from-right duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-[#8C2D19] rounded-lg border border-amber-200/60">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                  <span>Workspace Settings &amp; Engine</span>
                  <span className="text-xs font-mono font-normal text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                    Kuṇḍalī
                  </span>
                </Dialog.Title>
                <Dialog.Description className="text-xs text-slate-500 font-sans mt-0.5">
                  Calculation models, Bhava Chalit cusp systems, and Kundali visual markers
                </Dialog.Description>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {savedNotice && (
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Applied</span>
                </span>
              )}
              <Dialog.Close asChild>
                <button
                  type="button"
                  id="workspace-settings-close-btn"
                  aria-label="Close Workspace Settings"
                  className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto">
            <button
              type="button"
              id="workspace-tab-rendering"
              onClick={() => setActiveTab('rendering')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'rendering'
                  ? 'border-[#8C2D19] text-[#8C2D19] bg-amber-50/30'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Chart Rendering</span>
            </button>

            <button
              type="button"
              id="workspace-tab-vargas"
              onClick={() => setActiveTab('vargas')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'vargas'
                  ? 'border-[#8C2D19] text-[#8C2D19] bg-amber-50/30'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Divisional Charts (Vargas)</span>
            </button>

            <button
              type="button"
              id="workspace-tab-ephemeris"
              onClick={() => setActiveTab('ephemeris')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'ephemeris'
                  ? 'border-[#8C2D19] text-[#8C2D19] bg-amber-50/30'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>House &amp; Nodes</span>
            </button>

            <button
              type="button"
              id="workspace-tab-dignities"
              onClick={() => setActiveTab('dignities')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'dignities'
                  ? 'border-[#8C2D19] text-[#8C2D19] bg-amber-50/30'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Badges &amp; Markers</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. CHART RENDERING */}
            {activeTab === 'rendering' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="space-y-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold block">
                    Chart Style Projection
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      id="ws-style-north"
                      onClick={() => updateSetting('chartStyle', 'north')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        settings.chartStyle === 'north'
                          ? 'border-[#8C2D19] bg-amber-50/40 text-slate-900 font-bold shadow-xs ring-1 ring-[#8C2D19]/30'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-serif font-bold block">North Indian</span>
                      <span className="text-[10px] font-mono text-[#8C2D19] font-medium block">Diamond / Kendra</span>
                      <span className="text-[11px] text-slate-500 font-normal mt-1 block">
                        Lagna fixed top center. Signs rotate counter-clockwise.
                      </span>
                    </button>

                    <button
                      type="button"
                      id="ws-style-south"
                      onClick={() => updateSetting('chartStyle', 'south')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        settings.chartStyle === 'south'
                          ? 'border-[#8C2D19] bg-amber-50/40 text-slate-900 font-bold shadow-xs ring-1 ring-[#8C2D19]/30'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-serif font-bold block">South Indian</span>
                      <span className="text-[10px] font-mono text-[#8C2D19] font-medium block">Fixed 4×4 Box</span>
                      <span className="text-[11px] text-slate-500 font-normal mt-1 block">
                        Signs fixed clockwise. Lagna marked with diagonal slash.
                      </span>
                    </button>

                    <button
                      type="button"
                      id="ws-style-east"
                      onClick={() => updateSetting('chartStyle', 'east')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        settings.chartStyle === 'east'
                          ? 'border-[#8C2D19] bg-amber-50/40 text-slate-900 font-bold shadow-xs ring-1 ring-[#8C2D19]/30'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-serif font-bold block">East Indian</span>
                      <span className="text-[10px] font-mono text-[#8C2D19] font-medium block">Bengali / Mithila</span>
                      <span className="text-[11px] text-slate-500 font-normal mt-1 block">
                        Signs fixed with bisected corners. Mesha top-center, anti-clockwise.
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold block">
                    Dual Comparison Mode
                  </label>
                  <div
                    onClick={() => updateSetting('dualViewMode', !settings.dualViewMode)}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <span className="text-xs font-serif font-bold text-slate-900 block">
                        Enable Side-by-Side Dual Charts
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        Render Rashi (D1) alongside a divisional varga simultaneously
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.dualViewMode}
                      onChange={() => {}}
                      className="w-4 h-4 accent-[#8C2D19] cursor-pointer"
                    />
                  </div>

                  {settings.dualViewMode && (
                    <div className="p-3 bg-amber-50/50 border border-amber-200/70 rounded-xl space-y-2">
                      <label htmlFor="ws-secondary-varga-select" className="text-xs font-mono font-bold text-slate-700 block">
                        Default Secondary Comparison Varga
                      </label>
                      <select
                        id="ws-secondary-varga-select"
                        value={settings.dualSecondaryVarga}
                        onChange={(e) => updateSetting('dualSecondaryVarga', e.target.value as VargaId)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#8C2D19]"
                      >
                        <option value="D9">D9 — Navāṁśa (Dharma, Spouse &amp; Soul Strength)</option>
                        <option value="D10">D10 — Daśāṁśa (Profession &amp; Public Karma)</option>
                        <option value="D7">D7 — Saptāṁśa (Progeny &amp; Creative Fruit)</option>
                        <option value="D12">D12 — Dvādaśāṁśa (Ancestry &amp; Lineage)</option>
                        <option value="D3">D3 — Drekkāṇa (Courage &amp; Siblings)</option>
                        <option value="D60">D60 — Ṣaṣṭyaṁśa (Past Karma Balance)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div
                    onClick={() => updateSetting('aspectLines', !settings.aspectLines)}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <span className="text-xs font-serif font-bold text-slate-900 block">
                        Display Dṛṣṭi (Aspect) Ray Vectors
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        Overlay graphical full 7th aspect lines across houses in North Indian chart
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.aspectLines}
                      onChange={() => {}}
                      className="w-4 h-4 accent-[#8C2D19] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DIVISIONAL CHARTS / VARGAS SELECTOR */}
            {activeTab === 'vargas' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-sm font-serif font-bold text-slate-900">
                    Varga &amp; Divisional Charts Selection
                  </h3>
                  <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
                    Select your operational tier of Divisional Charts (Varga Chakras). Standard Vargas is the default canonical tier; Extended Vargas adds traditional harmonic charts.
                  </p>
                </div>

                {/* Two Main Options */}
                <div className="space-y-4">
                  {/* Option 1: Standard Vargas — D1–D60 */}
                  <div
                    id="ws-varga-option-standard"
                    onClick={() => updateSetting('vargaSetMode', 'standard')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      settings.vargaSetMode === 'standard'
                        ? 'border-[#8C2D19] bg-amber-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <input
                            type="radio"
                            id="varga-mode-standard-radio"
                            name="vargaSetMode"
                            checked={settings.vargaSetMode === 'standard'}
                            onChange={() => updateSetting('vargaSetMode', 'standard')}
                            className="w-4 h-4 accent-[#8C2D19] cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-serif font-bold text-slate-900">
                              1. Standard Vargas — D1–D60
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#8C2D19]/10 text-[#8C2D19]">
                              Default Selection
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-normal mt-1 leading-relaxed">
                            Contains the 16 default BPHS Śoḍaśavarga charts: D1, D2, D3, D4, D7, D9, D10, D12, D16, D20, D24, D27, D30, D40, D45, D60.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Standard 16 Charts Breakdown */}
                    <div className="mt-4 pt-3 border-t border-slate-200/70">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-2">
                        Included Classical Śoḍaśavarga (16 Charts):
                      </span>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                        {STANDARD_VARGA_IDS.map((vid) => (
                          <div
                            key={vid}
                            className="px-2 py-1 bg-white/90 border border-slate-200/80 rounded-md text-center"
                            title={`${VARGA_DEFINITIONS[vid].name} — ${VARGA_DEFINITIONS[vid].significance}`}
                          >
                            <span className="text-[11px] font-mono font-bold text-slate-800 block">
                              {vid}
                            </span>
                            <span className="text-[9px] text-slate-500 truncate block">
                              {VARGA_DEFINITIONS[vid].name}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2.5 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span className="font-semibold text-slate-700">Classical Hierarchy:</span>
                        <span>Ṣaḍvarga (6) • Saptavarga (7) • Daśavarga (10) • Śoḍaśavarga (16)</span>
                      </div>
                    </div>
                  </div>

                  {/* Option 2: Extended Vargas */}
                  <div
                    id="ws-varga-option-extended"
                    className={`p-4 rounded-xl border-2 transition-all ${
                      settings.vargaSetMode === 'extended'
                        ? 'border-[#8C2D19] bg-amber-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <input
                            type="radio"
                            id="varga-mode-extended-radio"
                            name="vargaSetMode"
                            checked={settings.vargaSetMode === 'extended'}
                            onChange={() => updateSetting('vargaSetMode', 'extended')}
                            className="w-4 h-4 accent-[#8C2D19] cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-serif font-bold text-slate-900">
                              2. Extended Vargas
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Traditional Harmonics
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-normal mt-1 leading-relaxed">
                            Click to load and display additional supported Varga charts with authentic traditional source bases.
                          </p>
                        </div>
                      </div>

                      {/* Extended Vargas Action Button */}
                      <button
                        type="button"
                        id="ws-load-extended-vargas-btn"
                        onClick={() => updateSetting('vargaSetMode', 'extended')}
                        className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-colors shrink-0 cursor-pointer ${
                          settings.vargaSetMode === 'extended'
                            ? 'bg-[#8C2D19] text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {settings.vargaSetMode === 'extended' ? 'Extended Active' : 'Extended Vargas'}
                      </button>
                    </div>

                    {/* Extended Vargas Loaded Section & Options */}
                    {settings.vargaSetMode === 'extended' ? (
                      <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#8C2D19]" />
                            <span>Supported Extended Varga Charts &amp; Options</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setAllExtendedVargas(true)}
                              className="text-[11px] font-mono text-[#8C2D19] hover:underline cursor-pointer"
                            >
                              Enable All
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={() => setAllExtendedVargas(false)}
                              className="text-[11px] font-mono text-slate-500 hover:underline cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          {EXTENDED_VARGA_IDS.map((vid) => {
                            const def = VARGA_DEFINITIONS[vid];
                            const isEnabled = (settings.enabledExtendedVargas || []).includes(vid);
                            return (
                              <div
                                key={vid}
                                id={`ws-extended-varga-${vid}`}
                                onClick={() => toggleExtendedVarga(vid)}
                                className={`p-3 rounded-lg border flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                                  isEnabled
                                    ? 'bg-white border-amber-300 shadow-xs'
                                    : 'bg-slate-50/80 border-slate-200 opacity-65'
                                }`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded text-xs font-mono font-bold">
                                      {vid}
                                    </span>
                                    <span className="text-xs font-serif font-bold text-slate-900">
                                      {def.name} ({def.sanskritName})
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-500">
                                      Div: 1/{def.factor} ({(30 / def.factor).toFixed(2)}°)
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 font-normal">
                                    {def.significance}
                                  </p>
                                  <p className="text-[10px] font-mono text-amber-900/80">
                                    Source: {def.classicalSource}
                                  </p>
                                </div>
                                <input
                                  type="checkbox"
                                  id={`ws-toggle-varga-${vid}`}
                                  checked={isEnabled}
                                  onChange={() => {}}
                                  className="w-4 h-4 accent-[#8C2D19] cursor-pointer mt-1 shrink-0"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Extended Vargas are kept separate to keep the main workspace clean.</span>
                        <button
                          type="button"
                          onClick={() => updateSetting('vargaSetMode', 'extended')}
                          className="font-mono text-[#8C2D19] font-bold hover:underline cursor-pointer"
                        >
                          Load Options →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. AYANAMSHA, HOUSE SYSTEM & NODES */}
            {activeTab === 'ephemeris' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Ayanamsha System Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold block flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-[#8C2D19]" />
                      <span>Ayanāṃśa System (Zodiac Sidereal Offset)</span>
                    </label>
                    <span className="text-[10px] font-mono text-[#8C2D19] font-bold bg-[#8C2D19]/10 px-2 py-0.5 rounded">
                      Persistent for all charts
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed">
                    Once selected, this Ayanāṃśa remains active and consistent across all charts, divisional vargas, and profiles.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      {
                        id: 'lahiri' as AyanamshaType,
                        name: 'Lahiri (Chitrapaksha)',
                        sub: 'Standard',
                        desc: 'Indian Calendar Reform 1952. Star Spica (Citrā) at 180°00′.',
                      },
                      {
                        id: 'true_chitra' as AyanamshaType,
                        name: 'True Chitra',
                        sub: 'High Precision',
                        desc: 'Dynamically references exact center of star Spica (Swiss Eph).',
                      },
                      {
                        id: 'kp' as AyanamshaType,
                        name: 'Krishnamurti (KP)',
                        sub: 'Sub-Lord System',
                        desc: 'Formulated by Prof. K.S. Krishnamurti for KP astrology.',
                      },
                      {
                        id: 'raman' as AyanamshaType,
                        name: 'Dr. B.V. Raman',
                        sub: 'Classical',
                        desc: 'Classical Revati Zero 397 AD anchor favored by Dr. B.V. Raman.',
                      },
                      {
                        id: 'pushya_paksha' as AyanamshaType,
                        name: 'Pushya Paksha',
                        sub: 'P.V.R. Rao',
                        desc: 'Delta Cancri (Pushya yogathara) fixed at 106°00′ sidereal.',
                      },
                      {
                        id: 'yukteshwar' as AyanamshaType,
                        name: 'Sri Yukteshwar',
                        sub: 'The Holy Science',
                        desc: 'Equinox Revati 499 AD alignment by Swami Sri Yukteshwar.',
                      },
                      {
                        id: 'surya_siddhanta' as AyanamshaType,
                        name: 'Sūrya Siddhānta',
                        sub: 'Ancient Canonical',
                        desc: 'Classical zero-precession anchor from the Surya Siddhanta treatise.',
                      },
                      {
                        id: 'fagan_bradley' as AyanamshaType,
                        name: 'Fagan-Bradley',
                        sub: 'Western Sidereal',
                        desc: 'Aldebaran at 15° Taurus standard widely adopted in the West.',
                      },
                    ].map((ayan) => {
                      const isSelected = (settings.ayanamsha || 'lahiri') === ayan.id;
                      return (
                        <div
                          key={ayan.id}
                          id={`ws-ayanamsha-${ayan.id}`}
                          onClick={() => updateSetting('ayanamsha', ayan.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#8C2D19] bg-amber-50/40 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-xs font-serif font-bold text-slate-900 block">
                                {ayan.name}
                              </span>
                              <span className="text-[10px] font-mono text-[#8C2D19] font-medium block">
                                {ayan.sub}
                              </span>
                            </div>
                            <div className="shrink-0 pt-0.5">
                              <div
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? 'border-[#8C2D19] bg-[#8C2D19] text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
                              </div>
                            </div>
                          </div>
                          <p className="text-[10.5px] text-slate-500 font-normal mt-1.5 leading-snug">
                            {ayan.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold block">
                    Bhava Chalit House Cusp System
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {[
                      {
                        id: 'equal_whole' as const,
                        name: 'Equal Sign / Whole Sign (Classical Parāśara)',
                        desc: 'Each bhava corresponds precisely to the entire 30° zodiacal sign containing the Lagna degree. The primary classical Vedic standard.',
                      },
                      {
                        id: 'sripati' as const,
                        name: 'Śrīpati Paddhati (Unequal Bhava Madhyas)',
                        desc: 'Classical Indian unequal house division based on trisection of quadrants (Porphyry algorithm) described in Śrīpati Jātaka Karma.',
                      },
                      {
                        id: 'placidus' as const,
                        name: 'Placidus Semi-Arc',
                        desc: 'Houses based on time-proportional division of diurnal and nocturnal semi-arcs.',
                      },
                    ].map((sys) => {
                      const isSelected = settings.houseSystem === sys.id;
                      return (
                        <div
                          key={sys.id}
                          id={`ws-house-${sys.id}`}
                          onClick={() => updateSetting('houseSystem', sys.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                            isSelected
                              ? 'border-[#8C2D19] bg-amber-50/40 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="text-xs font-serif font-bold text-slate-900 block">
                              {sys.name}
                            </span>
                            <p className="text-[11px] text-slate-500">{sys.desc}</p>
                          </div>
                          <div className="shrink-0 pt-0.5">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'border-[#8C2D19] bg-[#8C2D19] text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold block">
                    Lunar Node (Rāhu / Ketu) Orbit Model
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      id="ws-node-mean"
                      onClick={() => updateSetting('nodeMode', 'mean')}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        settings.nodeMode === 'mean'
                          ? 'border-[#8C2D19] bg-amber-50/40 font-bold text-slate-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-serif font-bold block">Mean Node (Madhyama)</span>
                      <span className="text-[11px] text-slate-500 font-normal mt-1 block">
                        Strictly retrograde uniform motion. Classical Shastric standard across Indian ephemerides.
                      </span>
                    </button>

                    <button
                      type="button"
                      id="ws-node-true"
                      onClick={() => updateSetting('nodeMode', 'true')}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        settings.nodeMode === 'true'
                          ? 'border-[#8C2D19] bg-amber-50/40 font-bold text-slate-900'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-serif font-bold block">True Node (Spaṣṭa)</span>
                      <span className="text-[11px] text-slate-500 font-normal mt-1 block">
                        Oscillating true gravitational intersection of lunar &amp; ecliptic planes.
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. DIGNITIES & VISUAL BADGES */}
            {activeTab === 'dignities' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3.5 bg-blue-50/60 border border-blue-200/70 rounded-xl flex items-start gap-3">
                  <Info className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Custom visual markers display right alongside graha glyphs in the Kundali cells
                    for quick evaluation of dignity, directional power, and astronomical state.
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      key: 'showDegreesInCells' as const,
                      label: 'Show Graha Degrees in Chart Cells',
                      sub: 'Displays exact degree and minute next to planet glyphs (e.g. Me 18°42′)',
                    },
                    {
                      key: 'highlightDignities' as const,
                      label: 'Highlight Exalted (Ucca) & Debilitated (Nīca)',
                      sub: 'Applies green accent for exalted planets and red accent for debilitated planets',
                    },
                    {
                      key: 'showRetrogradeBadge' as const,
                      label: 'Show Retrograde Marker (Vakrī / व / R)',
                      sub: 'Displays retrograde indicator on grahas with negative apparent motion',
                    },
                    {
                      key: 'showCombustionBadge' as const,
                      label: 'Show Combustion Marker (Asta / अ)',
                      sub: 'Highlights planets within combustion orb of the Sun',
                    },
                    {
                      key: 'showDigbalaBadge' as const,
                      label: 'Show Digbala (Directional Strength) Badge',
                      sub: 'Highlights planets occupying their directional strength houses',
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      id={`ws-toggle-${item.key}`}
                      onClick={() => updateSetting(item.key, !settings[item.key])}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
                    >
                      <div className="pr-4">
                        <span className="text-xs font-serif font-bold text-slate-900 block">
                          {item.label}
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal block mt-0.5">
                          {item.sub}
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings[item.key]}
                        onChange={() => {}}
                        className="w-4 h-4 accent-[#8C2D19] cursor-pointer shrink-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <button
              type="button"
              id="workspace-settings-reset-btn"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <Dialog.Close asChild>
              <button
                type="button"
                id="workspace-settings-apply-btn"
                className="px-5 py-2 text-xs font-mono uppercase font-bold text-white bg-slate-900 hover:bg-[#8C2D19] rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Done
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

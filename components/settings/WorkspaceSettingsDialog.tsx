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
} from 'lucide-react';
import {
  WorkspaceSettings,
  DEFAULT_WORKSPACE_SETTINGS,
} from '@/lib/settings/types';
import {
  getWorkspaceSettings,
  saveWorkspaceSettings,
  resetWorkspaceSettings,
  subscribeToSettings,
} from '@/lib/settings/settings-storage';
import { VargaId } from '@/lib/jyotisha/types';

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
  const [activeTab, setActiveTab] = useState<'rendering' | 'ephemeris' | 'dignities'>('rendering');
  const [savedNotice, setSavedNotice] = useState(false);

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

            {/* 2. HOUSE SYSTEM & NODES */}
            {activeTab === 'ephemeris' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="space-y-3">
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

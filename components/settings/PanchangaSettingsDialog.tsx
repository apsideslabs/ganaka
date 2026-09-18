'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Settings,
  X,
  RotateCcw,
  Check,
  Calendar,
  Clock,
  Sun,
  Sparkles,
  Award,
  AlertTriangle,
  Info,
  Layers,
} from 'lucide-react';
import {
  PanchangaSettings,
  DEFAULT_PANCHANGA_SETTINGS,
} from '@/lib/settings/types';
import {
  getPanchangaSettings,
  savePanchangaSettings,
  resetPanchangaSettings,
  subscribeToSettings,
} from '@/lib/settings/settings-storage';
import { AYANAMSHA_DEFINITIONS, AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { PanchangaViewTab } from '@/components/panchanga/types';

interface PanchangaSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerButton?: React.ReactNode;
  onSettingsApplied?: (newSettings: PanchangaSettings) => void;
}

export function PanchangaSettingsDialog({
  open,
  onOpenChange,
  triggerButton,
  onSettingsApplied,
}: PanchangaSettingsDialogProps) {
  const [settings, setSettings] = useState<PanchangaSettings>(() => getPanchangaSettings());
  const [activeTab, setActiveTab] = useState<'shastra' | 'muhurta' | 'display'>('shastra');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setSettings(getPanchangaSettings());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    return subscribeToSettings((scope) => {
      if (scope === 'panchanga') {
        setSettings(getPanchangaSettings());
      }
    });
  }, []);

  const updateSetting = <K extends keyof PanchangaSettings>(key: K, value: PanchangaSettings[K]) => {
    const updated = savePanchangaSettings({ [key]: value });
    setSettings(updated);
    if (onSettingsApplied) {
      onSettingsApplied(updated);
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1500);
  };

  const handleReset = () => {
    const reset = resetPanchangaSettings();
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
          id="panchanga-settings-overlay"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        />

        <Dialog.Content
          id="panchanga-settings-modal"
          className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col focus:outline-none animate-in slide-in-from-right duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 text-[#8C2D19] rounded-lg border border-red-200/60">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <Dialog.Title className="text-base font-serif font-bold text-slate-900 flex items-center gap-2">
                  <span>Pañcāṅga &amp; Muhūrta Settings</span>
                  <span className="text-xs font-mono font-normal text-[#8C2D19] bg-red-50 px-2 py-0.5 rounded border border-red-200/60">
                    Almanac
                  </span>
                </Dialog.Title>
                <Dialog.Description className="text-xs text-slate-500 font-sans mt-0.5">
                  Shastric computation rules, lunar month reckoning &amp; electional windows
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
                  id="panchanga-settings-close-btn"
                  aria-label="Close Pañcāṅga Settings"
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
              id="panchanga-tab-shastra"
              onClick={() => setActiveTab('shastra')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'shastra'
                  ? 'border-[#8C2D19] text-[#8C2D19] bg-red-50/30'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Shastric Reckoning</span>
            </button>

            <button
              type="button"
              id="panchanga-tab-muhurta"
              onClick={() => setActiveTab('muhurta')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'muhurta'
                  ? 'border-[#8C2D19] text-[#8C2D19] bg-red-50/30'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Muhūrta &amp; Dosha</span>
            </button>

            <button
              type="button"
              id="panchanga-tab-display"
              onClick={() => setActiveTab('display')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-wider font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'display'
                  ? 'border-[#8C2D19] text-[#8C2D19] bg-red-50/30'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>View &amp; Units</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. SHASTRIC RECKONING */}
            {activeTab === 'shastra' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Tithi Rule */}
                <div className="space-y-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold block">
                    Tithi Reckoning Standard
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      type="button"
                      id="panchanga-tithi-udaya"
                      onClick={() => updateSetting('tithiReckoning', 'udaya_tithi')}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        settings.tithiReckoning === 'udaya_tithi'
                          ? 'border-[#8C2D19] bg-red-50/40 text-slate-900 font-bold shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-serif font-bold text-slate-900">
                          Sūryodaya-Vyāpinī (Udaya Tithi)
                        </span>
                        <span className="text-[10px] font-mono text-[#8C2D19] bg-red-50 px-1.5 py-0.5 rounded font-semibold">
                          Vedic Ritual Standard
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal">
                        The lunar day prevailing at exact astronomical local sunrise governs the day&apos;s
                        religious observances, Vratas, and canonical festivals.
                      </p>
                    </button>

                    <button
                      type="button"
                      id="panchanga-tithi-exact"
                      onClick={() => updateSetting('tithiReckoning', 'astronomical_exact')}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        settings.tithiReckoning === 'astronomical_exact'
                          ? 'border-[#8C2D19] bg-red-50/40 text-slate-900 font-bold shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-serif font-bold text-slate-900">
                          Astronomical Exact (Span Transition)
                        </span>
                        <span className="text-[10px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                          Continuous Drik
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal">
                        Continuous display of exact 12° angular distance increments between Moon and
                        Sun with precise start and end moment timestamps.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Lunar Month Tradition */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold block">
                    Lunar Month (Māsa) Reckoning Tradition
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      id="panchanga-masa-amanta"
                      onClick={() => updateSetting('masaSystem', 'amanta')}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        settings.masaSystem === 'amanta'
                          ? 'border-[#8C2D19] bg-red-50/40 text-slate-900 font-bold shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-serif font-bold block">Amānta System</span>
                      <span className="text-[10px] font-mono text-slate-500 block mb-1">New Moon to New Moon</span>
                      <p className="text-[11px] text-slate-500 font-normal">
                        Month ends on Amāvāsyā. Followed in Maharashtra, Gujarat, Karnataka, Andhra &amp; Tamil Nadu.
                      </p>
                    </button>

                    <button
                      type="button"
                      id="panchanga-masa-purnimanta"
                      onClick={() => updateSetting('masaSystem', 'purnimanta')}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        settings.masaSystem === 'purnimanta'
                          ? 'border-[#8C2D19] bg-red-50/40 text-slate-900 font-bold shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-serif font-bold block">Pūrṇimānta System</span>
                      <span className="text-[10px] font-mono text-slate-500 block mb-1">Full Moon to Full Moon</span>
                      <p className="text-[11px] text-slate-500 font-normal">
                        Month ends on Pūrṇimā. Followed in Uttar Pradesh, Bihar, Rajasthan, MP, Punjab &amp; Haryana.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Ayanamsha in Panchanga */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <label htmlFor="panchanga-ayanamsha-select" className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold block">
                    Pañcāṅga Ayanāṃśa Model
                  </label>
                  <select
                    id="panchanga-ayanamsha-select"
                    value={settings.ayanamsha}
                    onChange={(e) => updateSetting('ayanamsha', e.target.value as AyanamshaType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-medium focus:outline-none focus:border-[#8C2D19]"
                  >
                    {Object.entries(AYANAMSHA_DEFINITIONS).map(([key, def]) => (
                      <option key={key} value={key}>
                        {def.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 2. MUHURTA & DOSHA WINDOWS */}
            {activeTab === 'muhurta' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-3.5 bg-amber-50/60 border border-amber-200/70 rounded-xl flex items-start gap-3">
                  <Info className="w-4 h-4 text-amber-800 mt-0.5 shrink-0" />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    Control which electional Muhūrta windows and inauspicious dosha intervals are
                    prominently highlighted across the daily summary and calendar views.
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      key: 'highlightAbhijit' as const,
                      label: 'Highlight Abhijit Muhūrta (अभिजीत मुहूर्त)',
                      sub: 'The 8th diurnal division (around local noon) that destroys all negative afflictions',
                    },
                    {
                      key: 'highlightBrahmaMuhurta' as const,
                      label: 'Highlight Brāhma Muhūrta (ब्राह्म मुहूर्त)',
                      sub: 'The auspicious pre-dawn interval 96 to 48 minutes prior to local sunrise',
                    },
                    {
                      key: 'highlightInauspicious' as const,
                      label: 'Highlight Inauspicious Intervals (Rāhu Kāla / Yamagaṇḍa / Gulika)',
                      sub: 'Color-code and tag high-risk electional intervals to prevent dosha timings',
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      id={`panchanga-toggle-${item.key}`}
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

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold block">
                    Choghadiyā Starting Reference Point
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      id="panchanga-choghadiya-sunrise"
                      onClick={() => updateSetting('choghadiyaAnchor', 'sunrise')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        settings.choghadiyaAnchor === 'sunrise'
                          ? 'border-[#8C2D19] bg-red-50/40 text-slate-900 font-bold shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-serif block">Local Sunrise (Drik)</span>
                      <span className="text-[10px] text-slate-500 block font-normal">Astronomical Sunrise Anchor</span>
                    </button>

                    <button
                      type="button"
                      id="panchanga-choghadiya-sixam"
                      onClick={() => updateSetting('choghadiyaAnchor', 'six_am')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        settings.choghadiyaAnchor === 'six_am'
                          ? 'border-[#8C2D19] bg-red-50/40 text-slate-900 font-bold shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-serif block">Standard 6:00 AM</span>
                      <span className="text-[10px] text-slate-500 block font-normal">Civil Clock Nominal Anchor</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. VIEW & UNITS */}
            {activeTab === 'display' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="space-y-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold block">
                    Daylight Duration (Dina-Māna) Unit
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'hours' as const, label: 'Civil Hours', desc: '12h 48m 10s' },
                      { id: 'ghatis' as const, label: 'Vedic Ghaṭīs', desc: '32 Ghaṭīs, 02 Palas' },
                      { id: 'both' as const, label: 'Both Units', desc: 'Hours + Ghaṭīs' },
                    ].map((unit) => {
                      const isSelected = settings.dinaManaFormat === unit.id;
                      return (
                        <button
                          key={unit.id}
                          type="button"
                          id={`panchanga-dinamana-${unit.id}`}
                          onClick={() => updateSetting('dinaManaFormat', unit.id)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#8C2D19] bg-red-50/40 text-slate-900 font-bold shadow-xs'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xs font-serif block">{unit.label}</span>
                          <span className="text-[10px] font-mono text-slate-500 font-normal">
                            {unit.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <label htmlFor="panchanga-default-tab-select" className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold block">
                    Default Workstation View on Load
                  </label>
                  <select
                    id="panchanga-default-tab-select"
                    value={settings.defaultTab}
                    onChange={(e) => updateSetting('defaultTab', e.target.value as PanchangaViewTab)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-serif font-medium focus:outline-none focus:border-[#8C2D19]"
                  >
                    <option value="daily">Daily Pañcāṅga (5 Classical Limbs)</option>
                    <option value="calendar">Calendar Grid (Interactive Monthly)</option>
                    <option value="monthly">Monthly Ledger (Ephemeris Table)</option>
                    <option value="yearly">Yearly Almanac (Saṁvatsara &amp; 12 Saṅkrāntis)</option>
                    <option value="lagna">Rising Lagnas (24-Hour Horizon Entry)</option>
                    <option value="horas">24 Planetary Horās (Chaldean Hours)</option>
                    <option value="choghadiya">Choghadiyā Cycles (8-fold Muhūrtas)</option>
                    <option value="muhurta">Muhūrta Windows (Abhijit &amp; Rahu Kala)</option>
                    <option value="finder">Muhūrta Finder (Classical Shastric Engine)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <button
              type="button"
              id="panchanga-settings-reset-btn"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <Dialog.Close asChild>
              <button
                type="button"
                id="panchanga-settings-apply-btn"
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

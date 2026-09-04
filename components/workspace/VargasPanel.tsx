'use client';

/**
 * Gaṇaka — Ṣoḍaśavarga (16 Divisional Charts) Interactive Explorer
 * Full 16-Varga harmonic calculations per BPHS Chapters 6-7,
 * Interactive North/South Indian Chart Viewers,
 * and Vargottama / Ṣaḍvarga Dignity Analyzer.
 */

import React, { useState } from 'react';
import { VargaChart, VargaId, CalculatedPlanet } from '@/lib/jyotisha/types';
import { PlanetId } from '@/lib/astronomy/ephemeris';
import { KundaliChart } from '../charts/KundaliChart';
import { RASHIS, GRAHA_PROPERTIES } from '@/lib/jyotisha/constants';
import { Layers, Compass, CheckCircle2, ShieldCheck } from 'lucide-react';

interface VargasPanelProps {
  vargas: Record<VargaId, VargaChart>;
  vargottamaPlanets: PlanetId[];
  onNavigateToNavamsha?: () => void;
}

export function VargasPanel({ vargas, vargottamaPlanets, onNavigateToNavamsha }: VargasPanelProps) {
  const [selectedVargaId, setSelectedVargaId] = useState<VargaId>('D9');
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');

  const activeVarga = vargas[selectedVargaId] || vargas['D1'];

  const vargaList: Array<{ id: VargaId; name: string; sanskrit: string; portfolio: string }> = [
    { id: 'D1', name: 'Rāśi', sanskrit: 'राशि', portfolio: 'Physical body & general destiny' },
    { id: 'D2', name: 'Horā', sanskrit: 'होरा', portfolio: 'Wealth & financial resources' },
    { id: 'D3', name: 'Drekkāṇa', sanskrit: 'द्रेष्काण', portfolio: 'Siblings, courage & initiative' },
    { id: 'D4', name: 'Caturthāṃśa', sanskrit: 'चतुर्थांश', portfolio: 'Landed property & fortune' },
    { id: 'D7', name: 'Saptāṃśa', sanskrit: 'सप्तांश', portfolio: 'Progeny, children & dynasty' },
    { id: 'D9', name: 'Navāṃśa', sanskrit: 'नवांश', portfolio: 'Dharma, spouse & soul destiny' },
    { id: 'D10', name: 'Daśāṃśa', sanskrit: 'दशांश', portfolio: 'Career status & societal power' },
    { id: 'D12', name: 'Dvādaśāṃśa', sanskrit: 'द्वादशांश', portfolio: 'Parents & ancestral roots' },
    { id: 'D16', name: 'Ṣoḍaśāṃśa', sanskrit: 'षोडशांश', portfolio: 'Vehicles, luxuries & inner joy' },
    { id: 'D20', name: 'Viṃśāṃśa', sanskrit: 'विंशांश', portfolio: 'Spiritual sādhanā & worship' },
    { id: 'D24', name: 'Caturviṃśāṃśa', sanskrit: 'चतुर्विंशांश', portfolio: 'Higher learning, vidyā & memory' },
    { id: 'D27', name: 'Saptaviṃśāṃśa', sanskrit: 'सप्तविंशांश', portfolio: 'Strengths, vitality & weaknesses' },
    { id: 'D30', name: 'Triṃśāṃśa', sanskrit: 'त्रिंशांश', portfolio: 'Misfortunes, evils & arishta' },
    { id: 'D40', name: 'Khavedāṃśa', sanskrit: 'खवेदांश', portfolio: 'Auspicious & inauspicious results' },
    { id: 'D45', name: 'Akṣavedāṃśa', sanskrit: 'अक्षवेदांश', portfolio: 'General well-being & character' },
    { id: 'D60', name: 'Ṣaṣṭyāṃśa', sanskrit: 'षष्ट्यंश', portfolio: 'All aspects of past-life karma' },
  ];

  return (
    <div id="vargas-panel-container" className="space-y-6">
      {/* Header */}
      <div id="vargas-header-bar" className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="vargas-main-title" className="font-serif text-lg font-bold tracking-tight text-slate-900">
            Ṣoḍaśavarga Cakra Explorer (१६ वर्ग चक्र)
          </h2>
          <p className="font-sans text-xs text-slate-500">
            16 Harmonic divisional charts computed per BPHS Chapters 6–7
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Chart Style Switcher */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 font-sans text-xs">
            <button
              id="btn-varga-north-style"
              onClick={() => setChartStyle('north')}
              className={`rounded-lg px-3 py-1 font-semibold transition-all cursor-pointer ${
                chartStyle === 'north'
                  ? 'bg-[#8C2D19] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              North (Diamond)
            </button>
            <button
              id="btn-varga-south-style"
              onClick={() => setChartStyle('south')}
              className={`rounded-lg px-3 py-1 font-semibold transition-all cursor-pointer ${
                chartStyle === 'south'
                  ? 'bg-[#8C2D19] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              South (Box)
            </button>
          </div>

          {/* Vargottama Badge */}
          {vargottamaPlanets.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-sans font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Vargottama (D1=D9):</span>
              <span className="font-bold uppercase font-mono">{vargottamaPlanets.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* 16 Varga Button Ribbon */}
      <div id="varga-selector-ribbon" className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-16 gap-2 font-sans">
        {vargaList.map((v) => {
          const isSelected = selectedVargaId === v.id;

          return (
            <button
              key={v.id}
              id={`btn-varga-${v.id}`}
              onClick={() => setSelectedVargaId(v.id)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#8C2D19] text-white border-[#8C2D19] shadow-sm font-bold'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold font-mono">{v.id}</div>
              <div className="text-[10px] truncate opacity-90">{v.name}</div>
            </button>
          );
        })}
      </div>

      {/* Main Selected Varga View (Chart + Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Kundali Chart Visualizer */}
        <div className="lg:col-span-6 flex justify-center bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
          <KundaliChart
            lagnaRashi={activeVarga.lagnaRashi}
            planets={activeVarga.planets}
            title={`${activeVarga.id} — ${activeVarga.name} (${activeVarga.sanskritName})`}
            subtitle={activeVarga.significance}
            style={chartStyle}
          />
        </div>

        {/* Right: Varga Insights & Planetary Table */}
        <div className="lg:col-span-6 space-y-6 font-sans">
          {/* Varga Information Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#8C2D19]">
                <Layers className="w-4 h-4" /> Varga Significance &amp; Division Factor
              </div>
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
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-900">
              {activeVarga.id}: {activeVarga.name} ({activeVarga.sanskritName})
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">{activeVarga.significance}</p>
            <div className="text-xs text-slate-500 pt-1 font-mono">
              Harmonic Division: <strong className="text-slate-800">1/{activeVarga.divisionFactor}</strong> (Segment span ={' '}
              {(30 / activeVarga.divisionFactor).toFixed(2)}°)
            </div>
          </div>

          {/* Planetary Table for this Varga */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3.5 font-serif text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Planetary Positions in {activeVarga.id}</span>
              <span className="text-xs text-slate-500 font-sans font-normal">Harmonic Coordinates</span>
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}

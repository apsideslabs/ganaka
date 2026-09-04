'use client';

/**
 * Gaṇaka — Śaḍbala & Viṃśopakā Bala (Positional & Divisional Strengths) Panel
 * Reference: BPHS Ch. 27 & 45
 */

import React, { useState } from 'react';
import { ShadbalaComponent, VargaChart, VargaId } from '@/lib/jyotisha/types';
import { PlanetId } from '@/lib/astronomy/ephemeris';
import { calculateVimshopakaBala } from '@/lib/jyotisha/vimshopaka';
import { Shield, TrendingUp, CheckCircle, AlertCircle, Award, Layers } from 'lucide-react';

interface ShadbalaPanelProps {
  shadbala: Record<PlanetId, ShadbalaComponent>;
  vargas?: Record<VargaId, VargaChart>;
}

export const ShadbalaPanel: React.FC<ShadbalaPanelProps> = ({ shadbala, vargas }) => {
  const [activeSubTab, setActiveSubTab] = useState<'shadbala' | 'vimshopaka'>('shadbala');

  const planetNames: Record<string, string> = {
    sun: 'Sun (Sūrya)',
    moon: 'Moon (Candra)',
    mars: 'Mars (Maṅgala)',
    mercury: 'Mercury (Budha)',
    jupiter: 'Jupiter (Guru)',
    venus: 'Venus (Śukra)',
    saturn: 'Saturn (Śani)',
  };

  const grahas = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  const vimshopakaScores = vargas ? calculateVimshopakaBala(vargas) : [];

  return (
    <div className="bg-white border border-[#E8E2D6] rounded-xl p-6 shadow-xs space-y-6">
      {/* Header & Sub-tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F0ECE1] pb-4 gap-3">
        <div>
          <h3 className="text-base font-serif font-bold text-[#2A241A] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#8B2500]" />
            <span>Planetary Strength &amp; Potency Analytics</span>
          </h3>
          <p className="text-xs text-[#7A7060]">
            Classical Śaḍbala (6-Fold Potency) and Parāśari Viṃśopakā Bala (20-Point Ṣoḍaśavarga Balance).
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-lg border border-[#E5DEC8]">
          <button
            type="button"
            onClick={() => setActiveSubTab('shadbala')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === 'shadbala'
                ? 'bg-[#8B2500] text-white shadow-2xs'
                : 'text-[#6A5E4E] hover:text-[#1A1A1A]'
            }`}
          >
            Śaḍbala (6-Fold)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('vimshopaka')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === 'vimshopaka'
                ? 'bg-[#8B2500] text-white shadow-2xs'
                : 'text-[#6A5E4E] hover:text-[#1A1A1A]'
            }`}
          >
            Viṃśopakā Bala (20-Pt)
          </button>
        </div>
      </div>

      {/* 1. Śaḍbala Table */}
      {activeSubTab === 'shadbala' && (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-[#EBE4D7] rounded-lg">
            <table className="w-full text-center text-xs">
              <thead className="bg-[#FAF8F5] text-[#5A4E3C] font-serif border-b border-[#EBE4D7] text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3 text-left">Graha</th>
                  <th className="py-3 px-2">Sthāna (स्थान)</th>
                  <th className="py-3 px-2">Dig (दिग्)</th>
                  <th className="py-3 px-2">Kāla (काल)</th>
                  <th className="py-3 px-2">Ceṣṭā (चेष्टा)</th>
                  <th className="py-3 px-2">Naisargika (नैसर्गिक)</th>
                  <th className="py-3 px-2">Dṛg (दृग्)</th>
                  <th className="py-3 px-3 bg-[#FAF4E8] font-bold text-[#2A241A]">Total Virūpas</th>
                  <th className="py-3 px-2 font-bold text-[#8B2500]">Rūpas</th>
                  <th className="py-3 px-2">Required</th>
                  <th className="py-3 px-2">Ratio</th>
                  <th className="py-3 px-2 text-center">Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE0] font-sans">
                {grahas.map((g) => {
                  const comp = shadbala[g as PlanetId];
                  if (!comp) return null;
                  const isStrong = comp.ratio >= 1.0;

                  return (
                    <tr key={g} className="hover:bg-[#FDFBF8] transition-colors">
                      <td className="py-2.5 px-3 text-left font-serif font-bold text-[#2A241A]">
                        {planetNames[g] || g}
                      </td>
                      <td className="py-2.5 px-2 font-mono text-[#4A4030]">{comp.sthanaBala}</td>
                      <td className="py-2.5 px-2 font-mono text-[#4A4030]">{comp.digBala}</td>
                      <td className="py-2.5 px-2 font-mono text-[#4A4030]">{comp.kalaBala}</td>
                      <td className="py-2.5 px-2 font-mono text-[#4A4030]">{comp.chestaBala}</td>
                      <td className="py-2.5 px-2 font-mono text-[#4A4030]">{comp.naisargikaBala}</td>
                      <td className="py-2.5 px-2 font-mono text-[#4A4030]">{comp.drigBala}</td>
                      <td className="py-2.5 px-3 font-mono font-bold bg-[#FAF6EE] text-[#2A241A]">
                        {comp.totalVirupas}
                      </td>
                      <td className="py-2.5 px-2 font-mono font-bold text-[#8B2500]">
                        {comp.totalRupas}
                      </td>
                      <td className="py-2.5 px-2 font-mono text-[#7A6E5C]">{comp.requiredRupas}</td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            isStrong
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {comp.ratio}x
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-[#3A3225]">
                        #{comp.rank}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Viṃśopakā Bala Table */}
      {activeSubTab === 'vimshopaka' && (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-[#EBE4D7] rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#5A4E3C] font-serif border-b border-[#EBE4D7] text-[11px]">
                <tr>
                  <th className="py-3 px-3">Graha</th>
                  <th className="py-3 px-3 font-semibold">Ṣaḍvarga (6 Vargas)</th>
                  <th className="py-3 px-3 font-semibold">Saptavarga (7 Vargas)</th>
                  <th className="py-3 px-3 font-semibold">Daśavarga (10 Vargas)</th>
                  <th className="py-3 px-3 font-bold bg-[#FAF4E8] text-[#8B2500]">
                    Ṣoḍaśavarga (16 Vargas / 20)
                  </th>
                  <th className="py-3 px-3 text-center">Strength %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE0]">
                {vimshopakaScores.map((vs) => (
                  <tr key={vs.planet} className="hover:bg-[#FDFBF8]">
                    <td className="py-2.5 px-3 font-bold text-[#1A1A1A]">
                      {vs.planetName} ({planetNames[vs.planet]?.split(' ')[0]})
                    </td>
                    <td className="py-2.5 px-3 font-mono">{vs.shadvargaScore} / 20</td>
                    <td className="py-2.5 px-3 font-mono">{vs.saptavargaScore} / 20</td>
                    <td className="py-2.5 px-3 font-mono">{vs.dashavargaScore} / 20</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#8B2500] bg-[#FAF6EE]">
                      {vs.shodashavargaScore} / 20.0
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-[#EBE4D7] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#8B2500] h-full"
                            style={{ width: `${vs.percentageRating}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-[#2A241A]">
                          {vs.percentageRating}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

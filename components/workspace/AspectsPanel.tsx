'use client';

import React, { useState } from 'react';
import { CalculatedPlanet, RashiNumber } from '@/lib/jyotisha/types';
import { PlanetId } from '@/lib/astronomy/ephemeris';
import {
  calculateMutualAspectMatrix,
  calculateJaiminiRashiDrishti,
  GrahaAspectDetail,
  RashiDrishtiDetail,
} from '@/lib/jyotisha/aspects';
import { Eye, Compass, Info, Zap } from 'lucide-react';
import { RASHIS } from '@/lib/jyotisha/constants';

interface AspectsPanelProps {
  planets: Record<PlanetId, CalculatedPlanet>;
  lagnaRashi: RashiNumber;
}

export const AspectsPanel: React.FC<AspectsPanelProps> = ({ planets, lagnaRashi }) => {
  const [activeSubTab, setActiveSubTab] = useState<'graha' | 'rashi' | 'matrix'>('graha');

  const aspectList: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
  const matrix = calculateMutualAspectMatrix(planets);
  const rashiDrishtis = calculateJaiminiRashiDrishti(planets);

  // Helper to find aspect strength between two planets
  const getAspect = (fromP: PlanetId, toP: PlanetId): GrahaAspectDetail | undefined => {
    return matrix.find((m) => m.fromPlanet === fromP && m.toPlanet === toP);
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E8E2D6] shadow-xs">
        <div>
          <h2 className="text-lg font-serif font-bold text-[#1A1A1A] flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#8B2500]" />
            <span>Dṛṣṭi (Aspect) Computation System</span>
          </h2>
          <p className="text-xs text-[#6A5E4E]">
            Full Parāśari Graha Dṛṣṭi (with virūpa intensities &amp; special aspects) and Jaimini Rāśi Dṛṣṭi.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-lg border border-[#E5DEC8]">
          <button
            type="button"
            onClick={() => setActiveSubTab('graha')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === 'graha'
                ? 'bg-[#8B2500] text-white shadow-2xs'
                : 'text-[#6A5E4E] hover:text-[#1A1A1A]'
            }`}
          >
            Graha Dṛṣṭi Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('rashi')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === 'rashi'
                ? 'bg-[#8B2500] text-white shadow-2xs'
                : 'text-[#6A5E4E] hover:text-[#1A1A1A]'
            }`}
          >
            Jaimini Rāśi Dṛṣṭi
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: 9x9 Graha Drishti Heatmap Matrix */}
      {activeSubTab === 'graha' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E8E2D6] rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-[#FAF8F5] border-b border-[#EAE3D5] flex items-center justify-between">
              <span className="font-serif font-bold text-sm text-[#2A241A]">
                9×9 Planetary Aspect Matrix (Virūpas / 60)
              </span>
              <span className="text-[11px] font-mono text-[#8C7F6C]">
                Full Aspect = 60 Virūpas (100%)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse font-mono">
                <thead>
                  <tr className="bg-[#F6F2EB] text-[#5C4F3E] border-b border-[#E2DACB]">
                    <th className="p-3 font-semibold">Aspecting ↓ / Aspect on →</th>
                    {aspectList.map((pid) => (
                      <th key={pid} className="p-2.5 text-center font-bold capitalize">
                        {planets[pid]?.sanskritName || pid}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DF]">
                  {aspectList.map((fromPid) => {
                    const fromPlanet = planets[fromPid];
                    return (
                      <tr key={fromPid} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="p-3 font-semibold text-[#1A1A1A] bg-[#FAF8F5] border-r border-[#EAE3D5]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-serif font-bold">{fromPlanet?.sanskritName}</span>
                            <span className="text-[10px] text-[#8C7F6C] font-normal">
                              ({fromPlanet?.name})
                            </span>
                          </div>
                        </td>
                        {aspectList.map((toPid) => {
                          if (fromPid === toPid) {
                            return (
                              <td
                                key={toPid}
                                className="p-2.5 text-center bg-[#F2ECE0] text-[#9E9280] font-mono text-[11px]"
                              >
                                —
                              </td>
                            );
                          }

                          const aspect = getAspect(fromPid, toPid);
                          if (!aspect || aspect.aspectStrengthVirupas === 0) {
                            return (
                              <td key={toPid} className="p-2.5 text-center text-[#B0A594] text-[11px]">
                                0
                              </td>
                            );
                          }

                          const isSpecial = aspect.isSpecialAspect;
                          const isFull = aspect.aspectStrengthVirupas >= 50;

                          return (
                            <td
                              key={toPid}
                              className={`p-2.5 text-center font-semibold transition-colors ${
                                isFull
                                  ? 'bg-[#FAF0E6] text-[#8B2500] font-bold'
                                  : 'text-[#4A3E2C]'
                              }`}
                              title={`${aspect.fromPlanet} aspects ${aspect.toPlanet}: ${aspect.aspectStrengthVirupas}/60 Virūpas (${aspect.aspectDescription})`}
                            >
                              <div className="flex flex-col items-center">
                                <span>{aspect.aspectStrengthVirupas}</span>
                                {isSpecial && (
                                  <span className="text-[9px] px-1 bg-[#8B2500] text-white rounded font-sans">
                                    Special
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Special Aspects Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E8E2D6] space-y-2">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#8B2500]">
                <Zap className="w-4 h-4" />
                <span>Maṅgala (Mars) Special Aspects</span>
              </div>
              <p className="text-xs text-[#5C4F3E] leading-relaxed">
                Casts 100% full Dṛṣṭi on <strong>4th house (90°)</strong> and <strong>8th house (210°)</strong> in addition to standard 7th house opposition.
              </p>
              <div className="text-[11px] font-mono text-[#8C7F6C]">
                Mars House: {planets.mars?.house}th → Aspects Houses:{' '}
                {planets.mars?.aspectsToHouses.join(', ')}th
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E8E2D6] space-y-2">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#8B2500]">
                <Zap className="w-4 h-4" />
                <span>Guru (Jupiter) &amp; Nodes Trines</span>
              </div>
              <p className="text-xs text-[#5C4F3E] leading-relaxed">
                Casts 100% full auspicious Dṛṣṭi on <strong>5th house (120°)</strong> and <strong>9th house (240°)</strong> (Amṛta Dṛṣṭi).
              </p>
              <div className="text-[11px] font-mono text-[#8C7F6C]">
                Jupiter House: {planets.jupiter?.house}th → Aspects Houses:{' '}
                {planets.jupiter?.aspectsToHouses.join(', ')}th
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E8E2D6] space-y-2">
              <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#8B2500]">
                <Zap className="w-4 h-4" />
                <span>Śani (Saturn) Special Aspects</span>
              </div>
              <p className="text-xs text-[#5C4F3E] leading-relaxed">
                Casts 100% full Dṛṣṭi on <strong>3rd house (60°)</strong> and <strong>10th house (270°)</strong> in addition to 7th house.
              </p>
              <div className="text-[11px] font-mono text-[#8C7F6C]">
                Saturn House: {planets.saturn?.house}th → Aspects Houses:{' '}
                {planets.saturn?.aspectsToHouses.join(', ')}th
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Jaimini Rashi Drishti */}
      {activeSubTab === 'rashi' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E8E2D6] rounded-xl overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-[#FAF8F5] border-b border-[#EAE3D5] flex items-center justify-between">
              <span className="font-serif font-bold text-sm text-[#2A241A]">
                Jaimini Rāśi Dṛṣṭi (Sign Aspect Rules)
              </span>
              <span className="text-xs text-[#6A5E4E]">
                Chara ↔ Sthira (except adjacent) • Dvisvabhāva ↔ Dvisvabhāva
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#F6F2EB] text-[#5C4F3E] border-b border-[#E2DACB]">
                    <th className="p-3 font-semibold">Rāśi (Sign)</th>
                    <th className="p-3 font-semibold">Mobility Nature</th>
                    <th className="p-3 font-semibold">Occupying Grahas</th>
                    <th className="p-3 font-semibold">Aspects Signs (Rāśi Dṛṣṭi)</th>
                    <th className="p-3 font-semibold">Grahas Influenced</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DF]">
                  {rashiDrishtis.map((item) => {
                    const rInfo = RASHIS[item.sourceRashi];
                    return (
                      <tr key={item.sourceRashi} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="p-3 font-bold text-[#1A1A1A]">
                          {rInfo.number}. {rInfo.sanskritName} ({rInfo.name})
                        </td>
                        <td className="p-3 font-mono text-[#5C4F3E]">{rInfo.mobility}</td>
                        <td className="p-3">
                          {item.planetsInSource.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.planetsInSource.map((pid) => (
                                <span
                                  key={pid}
                                  className="px-2 py-0.5 rounded bg-[#F5EBE1] text-[#8B2500] font-semibold text-[11px]"
                                >
                                  {planets[pid]?.sanskritName}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#A09280] italic">Empty</span>
                          )}
                        </td>
                        <td className="p-3 font-medium text-[#2A241A]">
                          {item.aspectsRashiNames.join(', ')}
                        </td>
                        <td className="p-3">
                          {item.aspectingPlanets.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {item.aspectingPlanets.map((pid) => (
                                <span
                                  key={pid}
                                  className="px-2 py-0.5 rounded bg-[#FAF2EC] border border-[#ECD9CE] text-[#5C4F3E] text-[11px]"
                                >
                                  {planets[pid]?.sanskritName}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[#A09280]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

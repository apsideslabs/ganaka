'use client';

/**
 * Gaṇaka — Jaimini Sūtra Systems (जैमिनी सूत्र प्रणाली)
 * Independent Classical Jaimini Astrological Computing Engine
 * 
 * Includes:
 * 1. 7/8 Chara Kārakas (चर कारक), Kārakāṃśa (कारकांश) & Swāṃśa (स्वांश)
 * 2. Jaimini Chara Daśā (चर दशा - K.N. Rao Method)
 * 3. Jaimini Rāśi Dṛṣṭi (राशि दृष्टि - Movable/Fixed/Dual Sign Aspects)
 * 4. Argalā & Virodhārgalā Matrix (अर्गला एवं विरोधागला)
 * 5. 12 Arūḍha Padas (आरूढ पद) & Upapada Lagna (UL / A7)
 * 6. Viśeṣa Lagnas (विशेष लग्न) & Classical Upagrahas (उपग्रह)
 */

import React, { useState, useMemo } from 'react';
import { JaiminiFactors, SpecialPoints, CalculatedPlanet, RashiNumber } from '@/lib/jyotisha/types';
import { PlanetId } from '@/lib/astronomy/ephemeris';
import { calculateCharaDasha } from '@/lib/jyotisha/chara-dasha';
import { calculateHouseArgalas } from '@/lib/jyotisha/argala';
import { calculateJaiminiRashiDrishti } from '@/lib/jyotisha/aspects';
import {
  CHARA_KARAKA_CLASSICAL_DATA,
  calculateJaiminiFactors,
  CharaKarakaClassicalInfo,
} from '@/lib/jaimini/jaimini-engine';
import {
  Compass,
  Star,
  Clock,
  ShieldCheck,
  Eye,
  Sparkles,
  Heart,
  Award,
  Layers,
  BookOpen,
  X,
  Info,
  ChevronRight,
} from 'lucide-react';
import { RASHIS } from '@/lib/jyotisha/constants';

interface JaiminiSpecialPanelProps {
  jaimini: JaiminiFactors;
  specialPoints: SpecialPoints;
  planets: Record<PlanetId, CalculatedPlanet>;
  lagnaRashi: RashiNumber;
  lagnaLongitude?: number;
  birthYear: number;
}

export const JaiminiSpecialPanel: React.FC<JaiminiSpecialPanelProps> = ({
  jaimini,
  specialPoints,
  planets,
  lagnaRashi,
  lagnaLongitude,
  birthYear,
}) => {
  const [activeTab, setActiveTab] = useState<
    'karakas' | 'charadasha' | 'rashi_drishti' | 'argala' | 'arudhas' | 'special_lagnas'
  >('karakas');

  const [karakaScheme, setKarakaScheme] = useState<'7_karaka' | '8_karaka'>('7_karaka');
  const [selectedKarakaKey, setSelectedKarakaKey] = useState<
    'AK' | 'AmK' | 'BK' | 'MK' | 'PiK' | 'PK' | 'GK' | 'DK' | null
  >(null);

  // Recompute Jaimini Chara Karakas if user switches between 7 and 8 Kāraka schemes
  const effectiveJaimini = useMemo(() => {
    if (karakaScheme === '7_karaka' && jaimini.charaKarakas.length === 7) {
      return jaimini;
    }
    const lagnaLong = lagnaLongitude ?? (lagnaRashi - 1) * 30;
    return calculateJaiminiFactors(planets, lagnaLong, karakaScheme);
  }, [jaimini, planets, lagnaLongitude, lagnaRashi, karakaScheme]);

  const charaDasha = useMemo(
    () => calculateCharaDasha(lagnaRashi, planets, birthYear),
    [lagnaRashi, planets, birthYear]
  );

  const argalas = useMemo(
    () => calculateHouseArgalas(lagnaRashi, planets),
    [lagnaRashi, planets]
  );

  const rashiDrishtis = useMemo(
    () => calculateJaiminiRashiDrishti(planets),
    [planets]
  );

  const selectedInfo: CharaKarakaClassicalInfo | null = selectedKarakaKey
    ? CHARA_KARAKA_CLASSICAL_DATA[selectedKarakaKey]
    : null;

  const selectedAssignedPlanet = selectedKarakaKey
    ? effectiveJaimini.charaKarakas.find((c) => c.karakaKey === selectedKarakaKey)
    : null;

  const selectedPlanetObj = selectedAssignedPlanet
    ? planets[selectedAssignedPlanet.planet]
    : null;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header & Sub-system Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-200/80 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#8C2D19]" />
            <h3 className="text-lg font-serif font-bold text-slate-900">
              Jaimini Sūtra Systems (जैमिनी सूत्र प्रणाली)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Classical Sage Jaimini Upadeśa Sūtras: Chara Kārakas, Chara Daśā, Rāśi Dṛṣṭi, Argalā, 12 Arūḍha Padas &amp; Upapada.
          </p>
        </div>

        {/* Sub-system segmented tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          {[
            { id: 'karakas', label: 'Chara Kārakas', icon: Star },
            { id: 'charadasha', label: 'Chara Daśā', icon: Clock },
            { id: 'rashi_drishti', label: 'Rāśi Dṛṣṭi (Aspects)', icon: Eye },
            { id: 'argala', label: 'Argalā Matrix', icon: ShieldCheck },
            { id: 'arudhas', label: 'Arūḍhas & Upapada', icon: Sparkles },
            { id: 'special_lagnas', label: 'Viśeṣa Lagnas', icon: Layers },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#8C2D19] text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#8C2D19]'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Chara Kārakas & Kārakāṃśa / Swāṃśa */}
      {activeTab === 'karakas' && (
        <div className="space-y-6">
          {/* Top Controls: 7 vs 8 Karaka Scheme Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-serif font-bold text-slate-900">Classical Tradition:</span>
              <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setKarakaScheme('7_karaka')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    karakaScheme === '7_karaka'
                      ? 'bg-white text-[#8C2D19] font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  7-Kāraka (Saptakāraka)
                </button>
                <button
                  type="button"
                  onClick={() => setKarakaScheme('8_karaka')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    karakaScheme === '8_karaka'
                      ? 'bg-white text-[#8C2D19] font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  8-Kāraka (Aṣṭakāraka with Rāhu)
                </button>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {karakaScheme === '7_karaka'
                ? 'Standard Parāśari & Jaimini 7 physical planets'
                : 'Includes Rāhu with reverse progression (30° - deg)'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Chara Karakas Table */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8C2D19] uppercase tracking-wider">
                  <Star className="w-4 h-4" /> {karakaScheme === '7_karaka' ? '7' : '8'} Chara Kārakas (चर कारक तालिका)
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Click any row for Classical Sūtras
                </span>
              </div>

              {/* Scrollable table container with touch and scroll styling */}
              <div className="border border-slate-200/90 rounded-xl overflow-x-auto max-w-full bg-white shadow-2xs overscroll-x-contain">
                <table className="w-full min-w-[700px] text-left text-xs border-collapse font-sans table-auto">
                  <thead className="bg-slate-50 text-slate-600 font-serif border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Kāraka Role</th>
                      <th className="py-2.5 px-4">Graha (Planet)</th>
                      <th className="py-2.5 px-4">Natal Rāśi (Sign)</th>
                      <th className="py-2.5 px-4 text-right">Advancement Degree</th>
                      <th className="py-2.5 px-4">Significance</th>
                      <th className="py-2.5 px-4 text-center">Classical Sūtra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {effectiveJaimini.charaKarakas.map((ck) => {
                      const planetObj = planets[ck.planet];
                      const isAK = ck.karakaKey === 'AK';
                      const isDK = ck.karakaKey === 'DK';
                      const isSelected = selectedKarakaKey === ck.karakaKey;

                      return (
                        <tr
                          key={ck.karakaKey}
                          onClick={() => setSelectedKarakaKey(ck.karakaKey)}
                          className={`transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-amber-100/70 font-medium ring-1 ring-inset ring-amber-300'
                              : isAK
                              ? 'bg-amber-50/60 font-semibold hover:bg-amber-100/50'
                              : isDK
                              ? 'bg-rose-50/30 hover:bg-rose-100/40'
                              : 'hover:bg-slate-50/90'
                          }`}
                        >
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                  isAK
                                    ? 'bg-[#8C2D19] text-white'
                                    : isDK
                                    ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                    : 'bg-slate-100 text-slate-800'
                                }`}
                              >
                                {ck.karakaKey}
                              </span>
                              <span className="font-bold text-slate-900">{ck.karakaName}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 font-serif font-bold text-[#8C2D19]">
                            {planetObj?.sanskritName || ck.planet}
                            <span className="text-[10px] font-mono text-slate-500 font-normal ml-1">
                              ({planetObj?.name || ck.planet})
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-medium text-slate-700">
                            {planetObj?.rashiName ? (
                              <div className="flex items-center gap-1.5">
                                <span>{planetObj.rashiName}</span>
                                <span className="font-mono text-[10px] text-slate-500">
                                  ({planetObj.degreeStr})
                                </span>
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-2.5 px-4 font-mono text-right text-slate-900 font-bold">
                            <div className="flex items-center justify-end gap-2">
                              <span>{ck.degrees.toFixed(2)}°</span>
                              <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden hidden sm:block">
                                <div
                                  className={`h-full rounded-full ${
                                    isAK ? 'bg-[#8C2D19]' : isDK ? 'bg-rose-500' : 'bg-slate-400'
                                  }`}
                                  style={{ width: `${(ck.degrees / 30) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 text-[11px] max-w-[200px] truncate">
                            {ck.karakaKey === 'AK' && 'Soul Indicator (Ātman), prime purpose & destiny'}
                            {ck.karakaKey === 'AmK' && 'Career, intellect, ministerial guidance & status'}
                            {ck.karakaKey === 'BK' && 'Siblings, mentors, courage & inner drive'}
                            {ck.karakaKey === 'MK' && 'Mother, happiness, nurturing, home & conveyance'}
                            {ck.karakaKey === 'PiK' && 'Father, lineage, ancestry & philosophical roots'}
                            {ck.karakaKey === 'PK' && 'Children, creative genius, memory & disciples'}
                            {ck.karakaKey === 'GK' && 'Kinsmen, obstacles, disease, rivalry & challenges'}
                            {ck.karakaKey === 'DK' && 'Spouse, marriage, partnerships & worldly contracts'}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedKarakaKey(ck.karakaKey);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-[#8C2D19] hover:text-white rounded-md text-[10px] font-semibold text-slate-700 transition-all cursor-pointer"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>Sūtra</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Kāraka Reference Area */}
              <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-1.5 font-serif font-bold text-xs text-slate-900">
                    <Info className="w-3.5 h-3.5 text-[#8C2D19]" />
                    <span>Kāraka Reference &amp; Classical Sūtra Guide (कारक परिचय एवं शास्त्रीय आधार)</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Jaimini Upadeśa Sūtra Ch. 1 &amp; BPHS Ch. 32
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {(
                    ['AK', 'AmK', 'BK', 'MK', ...(karakaScheme === '8_karaka' ? (['PiK'] as const) : []), 'PK', 'GK', 'DK'] as const
                  ).map((kKey) => {
                    const info = CHARA_KARAKA_CLASSICAL_DATA[kKey];
                    const isSelected = selectedKarakaKey === kKey;
                    return (
                      <button
                        key={kKey}
                        type="button"
                        onClick={() => setSelectedKarakaKey(kKey)}
                        className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-100/80 border-amber-300 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[10px] font-bold">
                            {kKey}
                          </span>
                          <span className="text-[10px] font-serif font-bold text-[#8C2D19]">
                            {info.sanskrit}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 text-xs mt-1">
                          {info.name}
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                          {info.literalMeaning}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Karakamsha & Swamsha + Summary Cards */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-3 shadow-2xs">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block font-serif">
                  Jaimini Special Navāṃśa Lagnas
                </span>

                <div className="space-y-3">
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#8C2D19] uppercase tracking-wider">
                        Kārakāṃśa (कारकांश)
                      </span>
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 font-mono text-[10px] rounded font-bold">
                        D-9 of AK
                      </span>
                    </div>
                    <span className="text-base font-serif font-bold text-slate-900 block">
                      {RASHIS[effectiveJaimini.karakamshaRashi]?.sanskritName} ({RASHIS[effectiveJaimini.karakamshaRashi]?.name})
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      The sign occupied by the Ātmakāraka in the Navāṃśa (D-9) chart. Defines spiritual orientation, latent talents, and final salvation (Mokṣa).
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Swāṃśa (स्वांश)
                      </span>
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 font-mono text-[10px] rounded font-bold">
                        D-9 Lagna
                      </span>
                    </div>
                    <span className="text-base font-serif font-bold text-slate-900 block">
                      {RASHIS[effectiveJaimini.swamshaRashi]?.sanskritName} ({RASHIS[effectiveJaimini.swamshaRashi]?.name})
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Navāṃśa Ascendant of the native. Acts as the primary anchor for Jaimini dharmic and vocational analysis.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs space-y-1.5 text-amber-950">
                <div className="font-serif font-bold text-[#8C2D19] flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5" />
                  <span>Ātmakāraka vs Dārākāraka Dynamics:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900">
                  When <strong>AK</strong> (Highest degree) and <strong>DK</strong> (Lowest degree) are in mutual sambandha or Kendra/Trikona, it creates powerful Jaimini Rāja Yogas for enduring prominence.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Classical Sūtra Detail Modal */}
      {selectedInfo && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedKarakaKey(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#8C2D19] text-white font-mono text-xs font-bold">
                    {selectedInfo.shortLabel}
                  </span>
                  <h4 className="text-lg font-serif font-bold text-slate-900">
                    {selectedInfo.name} ({selectedInfo.sanskrit})
                  </h4>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {selectedInfo.literalMeaning} • Rank #{selectedInfo.order7 || selectedInfo.order8} in degree advancement
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedKarakaKey(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Natal Assignment in this Chart */}
            {selectedAssignedPlanet && selectedPlanetObj && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/90 rounded-xl text-xs space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C2D19] block font-serif">
                  Natal Assignment in Current Chart:
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-serif font-bold text-sm text-slate-900">
                    {selectedPlanetObj.sanskritName} ({selectedPlanetObj.name})
                  </div>
                  <div className="font-mono text-slate-700">
                    In <strong>{selectedPlanetObj.rashiName}</strong> at <strong>{selectedPlanetObj.degreeStr}</strong> (Advancement: <strong>{selectedAssignedPlanet.degrees.toFixed(2)}°</strong>)
                  </div>
                </div>
              </div>
            )}

            {/* Classical Significance & Karakatvas */}
            <div className="space-y-2">
              <span className="text-xs font-serif font-bold text-slate-900 uppercase tracking-wider block">
                Classical Significations (कारकत्व विचार)
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {selectedInfo.significations.map((sig, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#8C2D19] font-bold">•</span>
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Authentic Jaimini Sūtra Reference */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                <span className="font-serif font-bold text-[#8C2D19]">
                  {selectedInfo.jaiminiSutraRef.sutra}
                </span>
                <span className="px-1.5 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-mono rounded font-semibold">
                  Jaimini Upadeśa
                </span>
              </div>
              <div className="font-serif text-sm font-bold text-slate-900">
                {selectedInfo.jaiminiSutraRef.sanskrit}
              </div>
              <div className="font-mono text-[11px] text-slate-600 italic">
                {selectedInfo.jaiminiSutraRef.transliteration}
              </div>
              <p className="text-slate-700 leading-relaxed pt-1 border-t border-slate-200/60">
                {selectedInfo.jaiminiSutraRef.translation}
              </p>
            </div>

            {/* BPHS Reference */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                <span className="font-serif font-bold text-[#8C2D19]">
                  {selectedInfo.bphsRef.reference}
                </span>
                <span className="px-1.5 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-mono rounded font-semibold">
                  Parāśara Śāstra
                </span>
              </div>
              <div className="font-serif text-sm font-bold text-slate-900">
                {selectedInfo.bphsRef.sanskrit}
              </div>
              <div className="font-mono text-[11px] text-slate-600 italic">
                {selectedInfo.bphsRef.transliteration}
              </div>
              <p className="text-slate-700 leading-relaxed pt-1 border-t border-slate-200/60">
                {selectedInfo.bphsRef.translation}
              </p>
            </div>

            {/* Analytical Application in Jaimini */}
            <div className="p-3.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-800">
              <span className="font-serif font-bold text-slate-900 block">
                Jaimini Analytical Application:
              </span>
              <p className="text-[11px] leading-relaxed text-slate-600">
                {selectedInfo.classicalApplication}
              </p>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedKarakaKey(null)}
                className="px-4 py-2 bg-[#8C2D19] hover:bg-[#702414] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Close Reference
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Jaimini Chara Daśā */}
      {activeTab === 'charadasha' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div>
              <span className="font-serif font-bold text-base text-slate-900 block">
                Jaimini Chara Daśā Sequence (K.N. Rao Method)
              </span>
              <span className="text-xs text-slate-500">
                12 Rāśi life progressions calculated strictly via classical Lord placement rules.
              </span>
            </div>
            <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-[#8C2D19] font-bold self-start sm:self-auto">
              {lagnaRashi % 2 === 1 ? 'Direct Zodiacal (Odd Lagna)' : 'Indirect Zodiacal (Even Lagna)'}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200/90 rounded-xl bg-white shadow-2xs">
            <table className="w-full min-w-[650px] text-xs text-left border-collapse font-sans">
              <thead className="bg-slate-50 text-slate-600 font-serif border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 text-center w-12">#</th>
                  <th className="py-3 px-4">Rāśi Daśā Period</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Age Window</th>
                  <th className="py-3 px-4">Calendar Years</th>
                  <th className="py-3 px-4">Rāśi Lord &amp; Placement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {charaDasha.map((cd, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#8C2D19] text-center">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-serif">
                        {cd.sanskritName} ({cd.rashiName})
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {cd.durationYears} Years
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      Age {cd.startAge} – {cd.endAge}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#8C2D19]">
                      {cd.startYear} – {cd.endYear}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {planets[cd.lord]?.sanskritName} in {RASHIS[cd.lordPlacementRashi]?.sanskritName} ({RASHIS[cd.lordPlacementRashi]?.name})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Jaimini Rāśi Dṛṣṭi (Sign Aspects) */}
      {activeTab === 'rashi_drishti' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div>
              <span className="font-serif font-bold text-base text-slate-900 block">
                Jaimini Rāśi Dṛṣṭi (Sign Aspect Rules &amp; Matrix)
              </span>
              <span className="text-xs text-slate-500">
                Chara (Movable) ↔ Sthira (Fixed) [except adjacent] • Dvisvabhāva (Dual) ↔ Dvisvabhāva
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-600 font-mono">
                12 Signs Computed
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200/90 rounded-xl bg-white shadow-2xs">
            <table className="w-full min-w-[650px] text-xs text-left border-collapse font-sans">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-serif border-b border-slate-200">
                  <th className="py-3 px-4">Rāśi (Source Sign)</th>
                  <th className="py-3 px-4">Mobility (Tattva)</th>
                  <th className="py-3 px-4">Occupying Grahas in Chart</th>
                  <th className="py-3 px-4">Aspects Signs (Rāśi Dṛṣṭi)</th>
                  <th className="py-3 px-4">Grahas Influenced by Aspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rashiDrishtis.map((item) => {
                  const rInfo = RASHIS[item.sourceRashi];
                  return (
                    <tr key={item.sourceRashi} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 font-serif">
                          {rInfo.number}. {rInfo.sanskritName} ({rInfo.name})
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium">
                          {rInfo.mobility}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {item.planetsInSource.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.planetsInSource.map((pid) => (
                              <span
                                key={pid}
                                className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-200 font-semibold text-[11px]"
                              >
                                {planets[pid]?.sanskritName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Empty Sign</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 font-serif">
                        {item.aspectsRashiNames.join(', ')}
                      </td>
                      <td className="py-3 px-4">
                        {item.aspectingPlanets.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.aspectingPlanets.map((pid) => (
                              <span
                                key={pid}
                                className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium"
                              >
                                {planets[pid]?.sanskritName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Argalā & Virodhārgalā Matrix */}
      {activeTab === 'argala' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div>
              <span className="font-serif font-bold text-base text-slate-900 block">
                Argalā (Intervention) &amp; Virodhārgalā (Obstruction) Matrix
              </span>
              <span className="text-xs text-slate-500">
                Primary: 2nd (obs. 12th), 4th (obs. 10th), 11th (obs. 3rd) • Secondary: 5th (obs. 9th)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {argalas.map((arg, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/70 space-y-2.5 text-xs shadow-2xs"
              >
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="font-serif font-bold text-[#8C2D19] text-sm">
                    {arg.argalaType} Argalā
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] border ${
                      arg.status.includes('Śubha')
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : arg.status.includes('Pāpa')
                        ? 'bg-rose-50 text-rose-900 border-rose-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {arg.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Intervening House:</span>
                    <strong className="text-slate-900">House {arg.houseFromLagna}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Planets in Argalā:</span>
                    <span className="font-bold text-[#8C2D19]">
                      {arg.argalaPlanets.length > 0
                        ? arg.argalaPlanets.map((p) => planets[p]?.sanskritName).join(', ')
                        : 'None (No Argalā)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Obstructing House (Virodha):</span>
                    <strong className="text-slate-900">House {arg.virodhaHouse}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Obstructing Planets:</span>
                    <span className="font-medium text-slate-700">
                      {arg.virodhaPlanets.length > 0
                        ? arg.virodhaPlanets.map((p) => planets[p]?.sanskritName).join(', ')
                        : 'None'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. 12 Arūḍha Padas & Upapada (UL) */}
      {activeTab === 'arudhas' && (
        <div className="space-y-6">
          {/* Key Arudhas Featured Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8C2D19] uppercase tracking-wider font-serif">
                  Ārūḍha Lagna (AL / A1)
                </span>
                <span className="px-2 py-0.5 bg-[#8C2D19] text-white font-mono text-[10px] rounded-md font-bold">
                  Status
                </span>
              </div>
              <div className="text-lg font-serif font-bold text-slate-900">
                {effectiveJaimini.arudhaPadas[0]?.rashiName} (Rāśi #{effectiveJaimini.arudhaPadas[0]?.rashiNumber})
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Public perception, external manifestation of personality, worldly stature &amp; tangible accomplishments.
              </p>
            </div>

            <div className="p-4 bg-rose-50/60 border border-rose-200/90 rounded-2xl space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900 uppercase tracking-wider font-serif flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-600" />
                  <span>Upapada Lagna (UL / A12)</span>
                </span>
                <span className="px-2 py-0.5 bg-rose-800 text-white font-mono text-[10px] rounded-md font-bold">
                  Marriage
                </span>
              </div>
              <div className="text-lg font-serif font-bold text-slate-900">
                {effectiveJaimini.arudhaPadas[11]?.rashiName} (Rāśi #{effectiveJaimini.arudhaPadas[11]?.rashiNumber})
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Spouse nature, marital bonding, family-in-law background, and long-term domestic stability.
              </p>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-200/90 rounded-2xl space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider font-serif flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Rājyapada (A10)</span>
                </span>
                <span className="px-2 py-0.5 bg-emerald-800 text-white font-mono text-[10px] rounded-md font-bold">
                  Vocation
                </span>
              </div>
              <div className="text-lg font-serif font-bold text-slate-900">
                {effectiveJaimini.arudhaPadas[9]?.rashiName} (Rāśi #{effectiveJaimini.arudhaPadas[9]?.rashiNumber})
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Professional reputation, honors from government/rulers, executive power and career glory.
              </p>
            </div>
          </div>

          {/* 12 Arudha Padas Grid */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8C2D19] uppercase tracking-wider">
              <Compass className="w-4 h-4" /> All 12 Arūḍha Padas (द्वादश आरूढ पद)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {effectiveJaimini.arudhaPadas.map((ap) => {
                const isSpecial = ap.house === 1 || ap.house === 7 || ap.house === 10 || ap.house === 12;
                return (
                  <div
                    key={ap.house}
                    className={`p-3 rounded-xl border flex flex-col justify-between shadow-2xs ${
                      isSpecial
                        ? 'bg-amber-50/40 border-amber-200/90'
                        : 'bg-white border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold text-slate-900 font-serif">{ap.name.split(' ')[0]}</span>
                      <span className="font-mono text-[11px] font-bold text-[#8C2D19]">H{ap.house}</span>
                    </div>
                    <div className="text-sm font-serif font-bold text-slate-900 mt-1.5">
                      {ap.rashiName}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-1">
                      Sign #{ap.rashiNumber}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 6. Viśeṣa Lagnas & Classical Upagrahas */}
      {activeTab === 'special_lagnas' && (
        <div className="space-y-6">
          {/* Special Lagnas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-serif font-bold text-sm text-slate-900">
                Classical Viśeṣa Lagnas (Special Mathematical Ascendants)
              </span>
              <span className="text-xs font-mono text-slate-500">
                BPHS Ch. 5 &amp; Jaimini Sūtras
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: 'Indu Lagna (इन्दु लग्न)', pos: specialPoints.induLagna, desc: 'Special Ascendant for financial prosperity and magnitude of wealth.' },
                { name: 'Śrī Lagna (श्री लग्न)', pos: specialPoints.shreeLagna, desc: 'Ascendant for Goddess Lakṣmī grace and material fortune.' },
                { name: 'Horā Lagna (होरा लग्न)', pos: specialPoints.horaLagna, desc: 'Hour Ascendant for liquid wealth accumulation and resources.' },
                { name: 'Ghaṭī Lagna (घटी लग्न)', pos: specialPoints.ghatiLagna, desc: 'Power, political rank, authority and public eminence.' },
                { name: 'Bhāva Lagna (भाव लग्न)', pos: specialPoints.bhavaLagna, desc: 'Rising cusp representing vitality and bodily endurance.' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1 text-xs shadow-2xs">
                  <div className="font-serif font-bold text-[#8C2D19] text-sm">{item.name}</div>
                  <div className="font-mono font-bold text-base text-slate-900">
                    {RASHIS[item.pos.rashi]?.sanskritName} ({item.pos.degreeStr})
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upagrahas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-serif font-bold text-sm text-slate-900">
                Classical Upagrahas &amp; Apaprakāśa Grahas (Invisible Shadow Points)
              </span>
              <span className="text-xs font-mono text-slate-500">
                Chāyā Upagrahas (BPHS Ch. 3)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { name: 'Gulikā (गुलिका)', pos: specialPoints.gulika, desc: 'Son of Saturn; critical for karma and sudden events.' },
                { name: 'Māndi (मान्दि)', pos: specialPoints.mandi, desc: 'Poisonous limb of Saturn.' },
                { name: 'Dhūma (धूम)', pos: specialPoints.dhooma, desc: 'Calculated from Sun + 133°20\'.' },
                { name: 'Vyatīpāta (व्यतीपात)', pos: specialPoints.vyatipata, desc: 'Calculated from 360° - Dhooma.' },
                { name: 'Pariveṣa (परिवेष)', pos: specialPoints.parivesha, desc: 'Calculated from Vyatipata + 180°.' },
                { name: 'Indracāpa (इन्द्रचाप)', pos: specialPoints.indrachapa, desc: 'Calculated from 360° - Parivesha.' },
                { name: 'Upaketu (उपकेतु)', pos: specialPoints.upaketu, desc: 'Calculated from Indrachapa + 16°40\'.' },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1 text-xs shadow-2xs">
                  <div className="font-serif font-bold text-[#8C2D19]">{item.name}</div>
                  <div className="font-mono font-bold text-sm text-slate-900">
                    {RASHIS[item.pos.rashi]?.sanskritName} ({item.pos.degreeStr})
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight pt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


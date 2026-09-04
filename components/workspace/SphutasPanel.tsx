'use client';

import React, { useState, useMemo } from 'react';
import { JyotishaChart } from '@/lib/jyotisha/types';
import {
  calculateDetailedGrahaSphutas,
  calculateAllSpecialSphutas,
  calculateAllUpagrahas,
  calculateDrekkanaAnalysis,
  DetailedGrahaSphuta,
  SpecialCompositeSphuta,
  UpagrahaPoint,
} from '@/lib/jyotisha/sphutas';
import { ShieldAlert, Compass, BookOpen, Layers, Flame, Info, Table } from 'lucide-react';

interface SphutasPanelProps {
  chart: JyotishaChart;
}

export function SphutasPanel({ chart }: SphutasPanelProps) {
  const [subTab, setSubTab] = useState<'graha' | 'trisphutadi' | 'dhumadi' | 'drekkana'>('graha');

  // Compute all Sphuta data derived from current chart
  const detailedGrahas = useMemo(() => {
    return calculateDetailedGrahaSphutas(chart.planets);
  }, [chart.planets]);

  const trisphutadiPoints = useMemo(() => {
    const p = chart.planets;
    const gulikaObj = chart.specialPoints?.gulika;
    const gulikaLong = gulikaObj
      ? (gulikaObj.rashi - 1) * 30 + gulikaObj.degreeInRashi
      : (chart.lagna.siderealLongitude + 60) % 360;
    return calculateAllSpecialSphutas(
      p.sun.siderealLongitude,
      p.moon.siderealLongitude,
      p.mars.siderealLongitude,
      p.jupiter.siderealLongitude,
      p.venus.siderealLongitude,
      p.rahu.siderealLongitude,
      chart.lagna.siderealLongitude,
      gulikaLong
    );
  }, [chart.planets, chart.lagna.siderealLongitude, chart.specialPoints]);

  const upagrahas = useMemo(() => {
    const meta = chart.meta;
    const p = chart.planets;
    const birthJD = meta.julianDay;
    const sunriseJD = birthJD - 0.25;
    const sunsetJD = birthJD + 0.25;
    const dayIdx = chart.panchanga.vara.number;
    return calculateAllUpagrahas(p.sun.siderealLongitude, birthJD, sunriseJD, sunsetJD, dayIdx);
  }, [chart]);

  const drekkanaAnalysis = useMemo(() => {
    return calculateDrekkanaAnalysis(
      chart.lagna.siderealLongitude,
      chart.planets.moon.siderealLongitude,
      chart.planets
    );
  }, [chart.lagna.siderealLongitude, chart.planets]);

  return (
    <div id="sphutas-module-container" className="space-y-6">
      {/* Sub-navigation Header */}
      <div id="sphutas-subnav-bar" className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="sphutas-main-title" className="font-serif text-lg font-bold tracking-tight text-slate-900">
            Sphuṭas &amp; Special Sensitive Degrees (स्फुट)
          </h2>
          <p className="font-sans text-xs text-slate-500">
            Graha Sphuṭas, Trisphuṭādi composites, Dhūmādi non-luminous points, and Drekkāṇa diagnostics
          </p>
        </div>

        <div id="sphutas-tabs-wrapper" className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            id="tab-btn-graha-sphutas"
            onClick={() => setSubTab('graha')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'graha'
                ? 'bg-[#8C2D19] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Graha Sphuṭas</span>
          </button>
          <button
            id="tab-btn-trisphutadi"
            onClick={() => setSubTab('trisphutadi')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'trisphutadi'
                ? 'bg-[#8C2D19] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Trisphuṭādi (Composite)</span>
          </button>
          <button
            id="tab-btn-dhumadi"
            onClick={() => setSubTab('dhumadi')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'dhumadi'
                ? 'bg-[#8C2D19] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Dhūmādi Upagrahas</span>
          </button>
          <button
            id="tab-btn-drekkana"
            onClick={() => setSubTab('drekkana')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-sans text-xs font-semibold transition-all cursor-pointer ${
              subTab === 'drekkana'
                ? 'bg-[#8C2D19] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Drekkāṇa &amp; 22nd D-3</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Detailed Graha Sphutas Table */}
      {subTab === 'graha' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-50/60 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-serif font-bold text-slate-900 text-sm">
              Graha Sphuṭas: Longitudes, Nakṣatra Padas, and Speeds
            </h3>
            <span className="text-xs font-mono text-slate-500">True Sidereal Ephemeris</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Graha</th>
                  <th className="py-3 px-4">Sidereal Longitude</th>
                  <th className="py-3 px-4">Rāśi (Sign)</th>
                  <th className="py-3 px-4">Degree in Rāśi</th>
                  <th className="py-3 px-4">Nakṣatra &amp; Pada</th>
                  <th className="py-3 px-4">Nakṣatra Lord</th>
                  <th className="py-3 px-4">KP Sub-Lord</th>
                  <th className="py-3 px-4 text-center">Avasthā</th>
                  <th className="py-3 px-4 text-right">Daily Motion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detailedGrahas.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-serif font-bold text-slate-900 text-sm">{g.sanskritName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">({g.name})</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                      {g.dmsStr}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {g.rashiName} ({g.rashiSanskrit})
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {g.degreeInRashiDMS || `${g.degreeInRashi.toFixed(2)}°`}
                    </td>
                    <td className="py-3 px-4 text-slate-800">
                      <div className="font-medium">{g.nakshatraName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Pada {g.pada}</div>
                    </td>
                    <td className="py-3 px-4 uppercase font-semibold text-slate-700 font-mono">
                      {g.nakshatraLord}
                    </td>
                    <td className="py-3 px-4 uppercase text-slate-600 font-mono">
                      {g.kp?.subLord || '—'}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-800">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                        {g.avasthas?.baladi?.split(' ')[0] || g.dignity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-right text-slate-600">
                      {g.speed > 0 ? `+${g.speed.toFixed(3)}` : g.speed.toFixed(3)}°/d
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Trisphutadi & Composite Sphutas */}
      {subTab === 'trisphutadi' && (
        <div className="space-y-6">
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-sm">
            <h3 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8C2D19]" />
              <span>Classical Composite Sensitive Sphuṭas (त्रिस्फुटादि)</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculated per classical Praśna and Jātaka rules. Trisphuṭa (Lagna + Candra + Gulika) and
              Catussphuṭa (Trisphuṭa + Sūrya) indicate vital auspicious windows, critical prāṇa points, and
              karmic triggers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trisphutadiPoints.map((pt) => (
              <div
                key={pt.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-sm hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-sm">{pt.name}</h4>
                    <span className="text-xs text-[#8C2D19] font-serif">{pt.sanskritName}</span>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-bold border border-slate-200">
                    {pt.rashiName}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Longitude:</span>
                    <span className="font-bold text-slate-900">{pt.dmsStr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Nakṣatra:</span>
                    <span className="text-slate-800">{pt.nakshatraName} (P{pt.pada})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Nakṣatra Lord:</span>
                    <span className="uppercase text-slate-800 font-semibold">{pt.nakshatraLord}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Degree in Rāśi:</span>
                    <span className="text-slate-800">{pt.degreeInRashi.toFixed(2)}°</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic">
                  Formula: <span className="font-mono not-italic text-slate-700">{pt.formula}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Dhumadi Upagrahas */}
      {subTab === 'dhumadi' && (
        <div className="space-y-6">
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-sm">
            <h3 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#8C2D19]" />
              <span>Dhūmādi Non-Luminous Upagrahas (धूमादि उपग्रह)</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Classical invisible shadow planets computed directly from Solar Longitude (Sūrya Sphuṭa) per
              BPHS Chapter 3: Dhūma (Sun + 133°20&apos;), Vyatīpāta (360° - Dhūma), Pariveṣa (Vyatīpāta + 180°),
              Indracāpa (360° - Pariveṣa), Upaketu (Indracāpa + 16°40&apos;).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {upagrahas.map((up) => (
              <div
                key={up.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3 shadow-sm hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-sm">{up.name}</h4>
                    <span className="text-xs text-[#8C2D19] font-serif">{up.sanskritName}</span>
                  </div>
                  <span className="font-mono text-xs px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-bold border border-slate-200">
                    {up.rashiName}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Longitude:</span>
                    <span className="font-bold text-slate-900">{up.dmsStr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Nakṣatra:</span>
                    <span className="text-slate-800">{up.nakshatraName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Lord:</span>
                    <span className="uppercase text-slate-800 font-semibold">{up.lord}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <p className="leading-snug">{up.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Drekkana & 22nd D-3 */}
      {subTab === 'drekkana' && (
        <div className="space-y-6">
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-sm">
            <h3 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#8C2D19]" />
              <span>Drekkāṇa Diagnostic &amp; 22nd Drekkāṇa (Kharesha)</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detailed analysis of the 8th house 3rd harmonic segment (22nd Drekkāṇa) and 64th Navāṃśa from
              Lagna &amp; Moon. These points pinpoint bodily vulnerabilities and specific transformational
              epochs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-serif font-bold text-slate-900 text-base">22nd Drekkāṇa from Lagna</h4>
                  <span className="text-xs text-[#8C2D19]">Kharesha Point</span>
                </div>
                <span className="font-mono text-xs px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg font-bold">
                  {drekkanaAnalysis.twentySecondDrekkana.rashiName}
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Drekkāṇa Number:</span>
                  <span className="font-bold text-slate-900">{drekkanaAnalysis.twentySecondDrekkana.drekkanaNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Drekkāṇa Lord (Kharesha):</span>
                  <span className="font-bold text-[#8C2D19] uppercase">
                    {drekkanaAnalysis.twentySecondDrekkana.lordName} ({drekkanaAnalysis.twentySecondDrekkana.lord})
                  </span>
                </div>
                <div className="pt-2 text-xs text-slate-600 font-sans">
                  {drekkanaAnalysis.twentySecondDrekkana.khareshaDescription}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-serif font-bold text-slate-900 text-base">64th Navāṃśa from Moon</h4>
                  <span className="text-xs text-[#8C2D19]">Candra 64th Navāṃśa</span>
                </div>
                <span className="font-mono text-xs px-3 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg font-bold">
                  {drekkanaAnalysis.sixtyFourthNavamsha.rashiName}
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Navāṃśa Number:</span>
                  <span className="font-bold text-slate-900">{drekkanaAnalysis.sixtyFourthNavamsha.navamshaNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Navāṃśa Lord:</span>
                  <span className="font-bold text-[#8C2D19] uppercase">
                    {drekkanaAnalysis.sixtyFourthNavamsha.lordName} ({drekkanaAnalysis.sixtyFourthNavamsha.lord})
                  </span>
                </div>
                <div className="pt-2 text-xs text-slate-600 font-sans">
                  {drekkanaAnalysis.sixtyFourthNavamsha.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

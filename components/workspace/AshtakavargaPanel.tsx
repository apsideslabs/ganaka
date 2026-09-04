'use client';

/**
 * Gaṇaka — Classical Aṣṭakavarga, Śodhana & Kakshā Engine
 * Bhinnāṣṭakavarga (BAV), Sarvāṣṭakavarga (SAV: 337 Bindus),
 * Trikona Shodhana, Ekadhipatya Shodhana, Shodhya Pinda,
 * Prastārāṣṭakavarga Kakshā details, and Visual Aṣṭakavarga Kundalī Chart.
 */

import React, { useState } from 'react';
import { AshtakavargaResult, RashiNumber } from '@/lib/jyotisha/types';
import { PlanetId } from '@/lib/astronomy/ephemeris';
import { RASHIS } from '@/lib/jyotisha/constants';
import { Table, Award, Layers, Compass, Grid } from 'lucide-react';

interface AshtakavargaPanelProps {
  ashtakavarga: AshtakavargaResult;
  lagnaRashi?: RashiNumber;
}

export function AshtakavargaPanel({ ashtakavarga, lagnaRashi = 1 }: AshtakavargaPanelProps) {
  const [viewMode, setViewMode] = useState<'matrix' | 'kaksha' | 'chart'>('matrix');
  const [selectedKakshaGraha, setSelectedKakshaGraha] = useState<string>('jupiter');
  const [chartGraha, setChartGraha] = useState<'sav' | PlanetId>('sav');
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');

  const rashiHeaders = [
    { num: 1, name: 'Meṣa (1)' },
    { num: 2, name: 'Vṛṣa (2)' },
    { num: 3, name: 'Mith (3)' },
    { num: 4, name: 'Kark (4)' },
    { num: 5, name: 'Siṃh (5)' },
    { num: 6, name: 'Kany (6)' },
    { num: 7, name: 'Tulā (7)' },
    { num: 8, name: 'Vṛśc (8)' },
    { num: 9, name: 'Dhan (9)' },
    { num: 10, name: 'Maka (10)' },
    { num: 11, name: 'Kumb (11)' },
    { num: 12, name: 'Mīna (12)' },
  ];

  const grahas: PlanetId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

  // Kaksha order
  const kakshaList = ashtakavarga.kakshaOrder || [
    { id: 'saturn', name: 'Śani (Saturn)', span: '0°00′ – 3°45′' },
    { id: 'jupiter', name: 'Guru (Jupiter)', span: '3°45′ – 7°30′' },
    { id: 'mars', name: 'Maṅgala (Mars)', span: '7°30′ – 11°15′' },
    { id: 'sun', name: 'Sūrya (Sun)', span: '11°15′ – 15°00′' },
    { id: 'venus', name: 'Śukra (Venus)', span: '15°00′ – 18°45′' },
    { id: 'mercury', name: 'Budha (Mercury)', span: '18°45′ – 22°30′' },
    { id: 'moon', name: 'Candra (Moon)', span: '22°30′ – 26°15′' },
    { id: 'lagna', name: 'Lagna (Ascendant)', span: '26°15′ – 30°00′' },
  ];

  // Get bindus for chart display
  const chartBindusByRashi = chartGraha === 'sav'
    ? ashtakavarga.sav.bindusByRashi
    : ashtakavarga.bav[chartGraha]?.bindusByRashi || new Array(12).fill(0);

  return (
    <div id="ashtakavarga-panel-container" className="space-y-6">
      {/* Header */}
      <div id="ashtakavarga-header-bar" className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8CEBA] pb-3">
        <div>
          <h2 id="ashtakavarga-main-title" className="font-serif text-xl font-bold tracking-tight text-[#2B1810]">
            Aṣṭakavarga &amp; Śodhana Bindu Architecture
          </h2>
          <p className="font-sans text-xs text-[#6B5E51]">
            Bhinnāṣṭakavarga (BAV), Sarvāṣṭakavarga (SAV: 337 Bindus), Śodhya Piṇḍa &amp; Prastārāṣṭakavarga Kakshās
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-[#D8CEBA] bg-[#F2EADB] p-1 font-sans text-xs">
            <button
              onClick={() => setViewMode('matrix')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                viewMode === 'matrix' ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-sm' : 'text-[#4A3B32]'
              }`}
            >
              Master Matrix
            </button>
            <button
              onClick={() => setViewMode('kaksha')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                viewMode === 'kaksha' ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-sm' : 'text-[#4A3B32]'
              }`}
            >
              Prastāra (Kakshās)
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                viewMode === 'chart' ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-sm' : 'text-[#4A3B32]'
              }`}
            >
              Kundalī Chart Mode
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: Master Matrix (BAV + SAV + Shodhana + Shodhya Pinda) */}
      {viewMode === 'matrix' && (
        <div id="subview-ashtakavarga-matrix" className="space-y-6 font-sans">
          {/* Main Table */}
          <div className="rounded-xl border border-[#D8CEBA] bg-[#FAF6EE] shadow-sm overflow-hidden">
            <div className="border-b border-[#D8CEBA] bg-[#EFE7D8] px-4 py-2.5 flex items-center justify-between">
              <span className="font-serif text-sm font-bold text-[#2B1810]">
                8 BAV Planetary Tables &amp; Master Sarvāṣṭakavarga (SAV)
              </span>
              <span className="font-mono text-xs font-bold text-[#8C2D19] bg-[#F2EADC] px-2.5 py-0.5 rounded">
                Total SAV Bindus: {ashtakavarga.sav.total} / 337
              </span>
            </div>

            <div className="overflow-x-auto">
              <table id="ashtakavarga-data-table" className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D8CEBA] bg-[#F7F2E7] text-[#5C4A3E] font-medium">
                    <th className="py-2.5 px-3 text-left">Graha / Table</th>
                    {rashiHeaders.map((r) => (
                      <th key={r.num} className="py-2.5 px-2 font-semibold">
                        {r.name}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 bg-[#EFE7D8] font-bold text-[#8C2D19]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DEC8]">
                  {grahas.map((g) => {
                    const bav = ashtakavarga.bav[g];
                    if (!bav) return null;

                    return (
                      <tr key={g} id={`bav-row-${g}`} className="hover:bg-[#F2EADC] transition-colors">
                        <td className="py-2 px-3 text-left font-serif font-bold uppercase text-[#2B1810]">
                          {bav.planet} BAV
                        </td>
                        {bav.bindusByRashi.map((val, idx) => (
                          <td
                            key={idx}
                            className={`py-2 px-2 font-mono ${
                              val >= 5
                                ? 'font-bold text-[#2D5A27] bg-[#E1EAD2]/40'
                                : val <= 3
                                ? 'text-[#8C2D19]'
                                : 'text-[#3D2F28]'
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                        <td className="py-2 px-3 font-mono font-bold bg-[#EFE7D8] text-[#8C2D19]">
                          {bav.totalBindus}
                        </td>
                      </tr>
                    );
                  })}

                  {/* SAV Row */}
                  <tr className="bg-[#EAE0D0] font-bold border-t-2 border-[#D8CEBA]">
                    <td className="py-3 px-3 text-left font-serif text-[#8C2D19] text-sm">
                      SARVĀṢṬAKAVARGA (SAV)
                    </td>
                    {ashtakavarga.sav.bindusByRashi.map((val, idx) => (
                      <td
                        key={idx}
                        className={`py-3 px-2 font-mono text-sm ${
                          val >= 30
                            ? 'text-[#2D5A27] bg-[#E1EAD2]/60 font-bold'
                            : val < 25
                            ? 'text-[#8C2D19] bg-[#F9DCD5]/60 font-bold'
                            : 'text-[#2B1810]'
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                    <td className="py-3 px-3 font-mono text-sm text-[#8C2D19] bg-[#E2D5C0]">
                      {ashtakavarga.sav.total}
                    </td>
                  </tr>

                  {/* Trikona Shodhana */}
                  <tr className="bg-[#FAF6EE] text-[#5C4A3E]">
                    <td className="py-2 px-3 text-left font-serif">Trikoṇa Śodhana</td>
                    {ashtakavarga.trikonaReductions.map((val, idx) => (
                      <td key={idx} className="py-2 px-2 font-mono font-medium">
                        {val}
                      </td>
                    ))}
                    <td className="py-2 px-3 font-mono font-semibold bg-[#EFE7D8]">
                      {ashtakavarga.trikonaReductions.reduce((a, b) => a + b, 0)}
                    </td>
                  </tr>

                  {/* Ekadhipatya Shodhana */}
                  <tr className="bg-[#FAF6EE] text-[#5C4A3E]">
                    <td className="py-2 px-3 text-left font-serif">Ekādhipatya Śodhana</td>
                    {ashtakavarga.ekadhipatyaReductions.map((val, idx) => (
                      <td key={idx} className="py-2 px-2 font-mono font-medium">
                        {val}
                      </td>
                    ))}
                    <td className="py-2 px-3 font-mono font-semibold bg-[#EFE7D8]">
                      {ashtakavarga.ekadhipatyaReductions.reduce((a, b) => a + b, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Shodhya Pinda Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#D8CEBA] shadow-sm">
              <span className="text-xs text-[#7A6B5C] block font-bold uppercase tracking-wider">Rāśi Piṇḍa</span>
              <span className="text-2xl font-serif font-bold text-[#2B1810]">
                {ashtakavarga.shodhyaPinda.rasiPinda}
              </span>
              <p className="text-[11px] text-[#5C4A3E] mt-1">Multiplied with classical sign gunakaras</p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#D8CEBA] shadow-sm">
              <span className="text-xs text-[#7A6B5C] block font-bold uppercase tracking-wider">Graha Piṇḍa</span>
              <span className="text-2xl font-serif font-bold text-[#2B1810]">
                {ashtakavarga.shodhyaPinda.grahaPinda}
              </span>
              <p className="text-[11px] text-[#5C4A3E] mt-1">Multiplied with planetary gunakaras</p>
            </div>

            <div className="p-4 rounded-xl bg-[#F2EADC] border border-[#D8CEBA] shadow-sm">
              <span className="text-xs text-[#8C2D19] block font-bold uppercase tracking-wider">Total Śodhya Piṇḍa</span>
              <span className="text-2xl font-serif font-bold text-[#8C2D19]">
                {ashtakavarga.shodhyaPinda.totalShodhyaPinda}
              </span>
              <p className="text-[11px] text-[#5C4A3E] mt-1">Composite vitality factor (Rāśi + Graha)</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Prastarashtakavarga (Kakshas) */}
      {viewMode === 'kaksha' && (
        <div id="subview-ashtakavarga-kaksha" className="space-y-4 font-sans">
          <div className="rounded-xl border border-[#D8CEBA] bg-[#FAF6EE] p-4 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6DEC8] pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-[#2B1810]">
                  Prastārāṣṭakavarga (8 Kakṣā Sub-divisions per Sign)
                </h3>
                <p className="text-xs text-[#7A6B5C]">
                  Each Rāśi of 30° is divided into 8 Kakṣās of 3°45′ each, ruled in fixed sequence: Saturn → Lagna.
                </p>
              </div>

              {/* Graha selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#7A6B5C] font-semibold">Select Planet:</span>
                <select
                  value={selectedKakshaGraha}
                  onChange={(e) => setSelectedKakshaGraha(e.target.value)}
                  className="rounded-md border border-[#D8CEBA] bg-[#FDFBF7] px-3 py-1 font-serif text-xs font-bold text-[#8C2D19] focus:outline-none"
                >
                  {grahas.map((g) => (
                    <option key={g} value={g}>
                      {g.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Kaksha Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#D8CEBA] bg-[#F7F2E7] text-[#5C4A3E] font-medium">
                    <th className="py-2.5 px-3 text-left">Kakṣā Lord</th>
                    <th className="py-2.5 px-2 text-left">Degree Span</th>
                    {rashiHeaders.map((r) => (
                      <th key={r.num} className="py-2.5 px-2 font-semibold">
                        {r.name}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 bg-[#EFE7D8] font-bold text-[#8C2D19]">Sum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DEC8]">
                  {kakshaList.map((k) => {
                    const row = ashtakavarga.prastaraGrids?.[selectedKakshaGraha]?.[k.id] || new Array(12).fill(0);
                    const rowSum = row.reduce((a, b) => a + b, 0);

                    return (
                      <tr key={k.id} className="hover:bg-[#F2EADC] transition-colors">
                        <td className="py-2 px-3 text-left font-serif font-bold text-[#2B1810]">
                          {k.name}
                        </td>
                        <td className="py-2 px-2 text-left font-mono text-[10px] text-[#7A6B5C]">
                          {k.span}
                        </td>
                        {row.map((val: number, idx: number) => (
                          <td
                            key={idx}
                            className={`py-2 px-2 font-mono font-bold ${
                              val === 1 ? 'text-[#2D5A27] bg-[#E1EAD2]/50' : 'text-[#A89C89]'
                            }`}
                          >
                            {val === 1 ? '1' : '0'}
                          </td>
                        ))}
                        <td className="py-2 px-3 font-mono font-bold bg-[#EFE7D8] text-[#8C2D19]">
                          {rowSum}
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

      {/* VIEW 3: Kundali Chart Mode */}
      {viewMode === 'chart' && (
        <div id="subview-ashtakavarga-chart" className="space-y-4 font-sans flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-between gap-3 w-full max-w-2xl bg-[#FAF6EE] p-3 rounded-xl border border-[#D8CEBA]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#7A6B5C]">Display Bindus For:</span>
              <select
                value={chartGraha}
                onChange={(e) => setChartGraha(e.target.value as any)}
                className="rounded-md border border-[#D8CEBA] bg-[#FDFBF7] px-3 py-1 font-serif text-xs font-bold text-[#8C2D19] focus:outline-none"
              >
                <option value="sav">Sarvāṣṭakavarga (SAV)</option>
                {grahas.map((g) => (
                  <option key={g} value={g}>
                    {g.toUpperCase()} BAV
                  </option>
                ))}
              </select>
            </div>

            <div className="inline-flex rounded-lg border border-[#D8CEBA] bg-[#F2EADB] p-1 text-xs">
              <button
                onClick={() => setChartStyle('north')}
                className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                  chartStyle === 'north' ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-sm' : 'text-[#4A3B32]'
                }`}
              >
                North Style
              </button>
              <button
                onClick={() => setChartStyle('south')}
                className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                  chartStyle === 'south' ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-sm' : 'text-[#4A3B32]'
                }`}
              >
                South Style
              </button>
            </div>
          </div>

          {/* Render 12 Rashi Bindus in Kundali style */}
          <div className="w-full max-w-xl bg-[#FAF6EE] p-6 rounded-2xl border border-[#D8CEBA] shadow-sm space-y-4">
            <div className="text-center">
              <h3 className="font-serif font-bold text-lg text-[#2B1810]">
                {chartGraha === 'sav' ? 'Sarvāṣṭakavarga (SAV) Bindu Distribution' : `${chartGraha.toUpperCase()} BAV Chart`}
              </h3>
              <p className="text-xs text-[#7A6B5C]">
                Bindu score per Rāśi relative to Janma Lagna #{lagnaRashi}
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
              {rashiHeaders.map((r, idx) => {
                const bindu = chartBindusByRashi[idx] || 0;
                const isStrong = chartGraha === 'sav' ? bindu >= 28 : bindu >= 5;
                const isWeak = chartGraha === 'sav' ? bindu < 25 : bindu <= 3;

                return (
                  <div
                    key={r.num}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isStrong
                        ? 'border-[#C8D9B8] bg-[#EEF5E7]'
                        : isWeak
                        ? 'border-[#E6BFB8] bg-[#FDF0EE]'
                        : 'border-[#D8CEBA] bg-[#F2EADC]'
                    }`}
                  >
                    <div className="font-serif text-xs font-bold text-[#2B1810]">{r.name}</div>
                    <div className={`font-mono text-xl font-bold mt-1 ${
                      isStrong ? 'text-[#2D5A27]' : isWeak ? 'text-[#8C2D19]' : 'text-[#2B1810]'
                    }`}>
                      {bindu}
                    </div>
                    <div className="text-[10px] text-[#7A6B5C] mt-0.5">
                      {isStrong ? 'Strong' : isWeak ? 'Weak' : 'Moderate'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

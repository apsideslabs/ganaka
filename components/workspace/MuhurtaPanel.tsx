'use client';

import React, { useState } from 'react';
import { PanchangaResult } from '@/lib/jyotisha/types';
import {
  calculateDailyHoras,
  calculateAllTaraBalam,
} from '@/lib/jyotisha/muhurta-advanced';
import { Sun, Clock, Compass, ShieldAlert, Award, Sparkles } from 'lucide-react';

interface MuhurtaPanelProps {
  panchanga: PanchangaResult;
  janmaNakshatraNumber: number;
}

export const MuhurtaPanel: React.FC<MuhurtaPanelProps> = ({
  panchanga,
  janmaNakshatraNumber,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'tarabala' | 'horas' | 'muhurtas'>('muhurtas');

  const horas = calculateDailyHoras(panchanga.vara.number, 6);
  const taraBalam = calculateAllTaraBalam(janmaNakshatraNumber);

  return (
    <div className="space-y-6 text-[#171614]">
      {/* Header & Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF7F0] p-4 rounded-xl border border-[#D8CEBA] shadow-2xs">
        <div>
          <h2 className="text-base font-serif font-bold text-[#171614] flex items-center gap-2">
            <Sun className="w-4 h-4 text-[#7A2D12]" />
            <span>Muhūrta, Horā &amp; Tārā Balam Chronometry</span>
          </h2>
          <p className="text-xs text-[#5C5850]">
            Classical Muhūrta divisions calculated from local sunrise/sunset and astronomical lunar-solar coordinates.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#F0ECE1] p-1 rounded-lg border border-[#D8CEBA]">
          <button
            type="button"
            onClick={() => setActiveSubTab('muhurtas')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === 'muhurtas'
                ? 'bg-[#7A2D12] text-white shadow-2xs'
                : 'text-[#5C5850] hover:text-[#171614]'
            }`}
          >
            Muhūrta Windows
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('horas')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === 'horas'
                ? 'bg-[#7A2D12] text-white shadow-2xs'
                : 'text-[#5C5850] hover:text-[#171614]'
            }`}
          >
            24 Planetary Horās
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('tarabala')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeSubTab === 'tarabala'
                ? 'bg-[#7A2D12] text-white shadow-2xs'
                : 'text-[#5C5850] hover:text-[#171614]'
            }`}
          >
            27 Tārā Balam
          </button>
        </div>
      </div>

      {/* Sub-Tab 1: Muhurta Windows */}
      {activeSubTab === 'muhurtas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Auspicious Windows */}
            <div className="bg-white p-5 rounded-xl border border-[#E6DEC8] space-y-3 shadow-3xs">
              <h3 className="font-serif font-bold text-sm text-[#1E4620] border-b border-[#F0ECE1] pb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1E4620]" />
                Auspicious Muhūrta Windows (Śubha Kāla)
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-[#F9FCF9] border border-[#D5EBD5] rounded-lg">
                  <div>
                    <span className="font-bold text-[#1E4620] block">Abhijit Muhūrta</span>
                    <span className="text-[10px] text-[#5C5850]">8th daytime muhūrta (Noon centered)</span>
                  </div>
                  <span className="font-mono font-bold text-[#1E4620]">
                    {panchanga.muhurtas.abhijit}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#F9FCF9] border border-[#D5EBD5] rounded-lg">
                  <div>
                    <span className="font-bold text-[#1E4620] block">Brāhma Muhūrta</span>
                    <span className="text-[10px] text-[#5C5850]">14th night muhūrta (Pre-sunrise)</span>
                  </div>
                  <span className="font-mono font-bold text-[#1E4620]">
                    {panchanga.muhurtas.brahmaMuhurta}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#F9FCF9] border border-[#D5EBD5] rounded-lg">
                  <div>
                    <span className="font-bold text-[#1E4620] block">Amṛta Kāla</span>
                    <span className="text-[10px] text-[#5C5850]">42 Ghatis post-Varjyam</span>
                  </div>
                  <span className="font-mono font-bold text-[#1E4620]">
                    {panchanga.muhurtas.amritKalam}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#F9FCF9] border border-[#D5EBD5] rounded-lg">
                  <div>
                    <span className="font-bold text-[#1E4620] block">Godhūli Muhūrta</span>
                    <span className="text-[10px] text-[#5C5850]">Sunset ± 12 minutes</span>
                  </div>
                  <span className="font-mono font-bold text-[#1E4620]">
                    {panchanga.muhurtas.godhuli}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#F9FCF9] border border-[#D5EBD5] rounded-lg">
                  <div>
                    <span className="font-bold text-[#1E4620] block">Vijaya Muhūrta</span>
                    <span className="text-[10px] text-[#5C5850]">11th daytime muhūrta</span>
                  </div>
                  <span className="font-mono font-bold text-[#1E4620]">
                    {panchanga.muhurtas.vijaya}
                  </span>
                </div>
              </div>
            </div>

            {/* Inauspicious Windows */}
            <div className="bg-white p-5 rounded-xl border border-[#E6DEC8] space-y-3 shadow-3xs">
              <h3 className="font-serif font-bold text-sm text-[#7A2D12] border-b border-[#F0ECE1] pb-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#7A2D12]" />
                Inauspicious Windows (Varjya &amp; Pāpa Kāla)
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-[#FCF9F9] border border-[#F0D5D5] rounded-lg">
                  <div>
                    <span className="font-bold text-[#7A2D12] block">Rāhu Kāla</span>
                    <span className="text-[10px] text-[#5C5850]">Weekday daytime division</span>
                  </div>
                  <span className="font-mono font-bold text-[#7A2D12]">
                    {panchanga.muhurtas.rahukala}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#FCF9F9] border border-[#F0D5D5] rounded-lg">
                  <div>
                    <span className="font-bold text-[#7A2D12] block">Yamagaṇḍa Kāla</span>
                    <span className="text-[10px] text-[#5C5850]">Yama daytime division</span>
                  </div>
                  <span className="font-mono font-bold text-[#7A2D12]">
                    {panchanga.muhurtas.yamaghanta}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#FCF9F9] border border-[#F0D5D5] rounded-lg">
                  <div>
                    <span className="font-bold text-[#7A2D12] block">Gulikā Kāla</span>
                    <span className="text-[10px] text-[#5C5850]">Śani daytime division</span>
                  </div>
                  <span className="font-mono font-bold text-[#7A2D12]">
                    {panchanga.muhurtas.gulikakala}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#FCF9F9] border border-[#F0D5D5] rounded-lg">
                  <div>
                    <span className="font-bold text-[#7A2D12] block">Varjyam (Tyājya Kāla)</span>
                    <span className="text-[10px] text-[#5C5850]">Nakṣatra inauspicious span</span>
                  </div>
                  <span className="font-mono font-bold text-[#7A2D12]">
                    {panchanga.muhurtas.varjyam}
                  </span>
                </div>
                <div className="p-2.5 bg-[#FCF9F9] border border-[#F0D5D5] rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#7A2D12]">Durmuhūrta Spans</span>
                    <span className="font-mono text-[11px] text-[#7A2D12]">
                      {panchanga.muhurtas.durmuhurta.join(' • ')}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#5C5850] block">Inauspicious daytime muhūrtas for {panchanga.vara.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ephemeris Summary Banner */}
          <div className="p-4 rounded-xl bg-white border border-[#E6DEC8] flex flex-wrap items-center justify-between gap-4 text-xs shadow-3xs">
            <div>
              <span className="text-[#7A7468] block text-[11px] font-serif">Ahorātra Planetary Chronometry</span>
              <span className="font-bold text-[#171614] font-serif text-sm">
                Sunrise: {panchanga.sunTimes.sunrise} • Sunset: {panchanga.sunTimes.sunset} • Solar Noon: {panchanga.sunTimes.solarNoon}
              </span>
            </div>
            <div className="font-mono text-[#5C5850] text-[11px]">
              Dinamāna: <strong>{panchanga.sunTimes.dayDuration}</strong> ({panchanga.sunTimes.dayDurationGhatis}) | Rātrimāna: <strong>{panchanga.sunTimes.nightDuration}</strong> ({panchanga.sunTimes.nightDurationGhatis})
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: 24 Planetary Horas */}
      {activeSubTab === 'horas' && (
        <div className="bg-white border border-[#E6DEC8] rounded-xl overflow-hidden shadow-3xs">
          <div className="px-5 py-3.5 bg-[#FAF7F0] border-b border-[#E6DEC8] flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-[#171614]">
              Daily 24 Horā Cycles (Vāra Lord: {panchanga.vara.sanskritName})
            </span>
            <span className="text-xs text-[#5C5850]">
              Planetary hour rulers from Sunrise to next Sunrise
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#F4EFE6] text-[#4A463E] border-b border-[#D8CEBA]">
                  <th className="p-3 font-semibold">Horā #</th>
                  <th className="p-3 font-semibold">Time Window</th>
                  <th className="p-3 font-semibold">Horā Ruler (Graha)</th>
                  <th className="p-3 font-semibold">Recommended Auspicious Undertakings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE1]">
                {horas.map((h) => (
                  <tr key={h.hourIndex} className="hover:bg-[#FAF7F0] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#7A2D12]">
                      Horā {h.hourIndex}
                    </td>
                    <td className="p-3 font-mono text-[#171614]">{h.timeRange}</td>
                    <td className="p-3 font-semibold text-[#171614]">
                      {h.rulerName}
                    </td>
                    <td className="p-3 text-[#5C5850]">{h.isFavorableFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: 27 Tara Balam Table */}
      {activeSubTab === 'tarabala' && (
        <div className="bg-white border border-[#E6DEC8] rounded-xl overflow-hidden shadow-3xs space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3">
            <span className="font-serif font-bold text-sm text-[#171614]">
              Tārā Balam from Natal Moon Nakṣatra (#{janmaNakshatraNumber} {panchanga.nakshatra.name})
            </span>
            <span className="text-xs font-mono text-[#7A7468]">
              9 Cycles: Sampat, Kṣema, Sādhana, Mitra, Parama Mitra (Auspicious)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {taraBalam.map((item) => {
              const isGood = item.tara.nature !== 'Inauspicious';
              return (
                <div
                  key={item.nakshatra.number}
                  className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                    isGood
                      ? 'bg-[#F9FCF9] border-[#D1E7D1] text-[#1E4620]'
                      : 'bg-[#FCF9F9] border-[#F0D5D5] text-[#7A2D12]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">
                      #{item.nakshatra.number}. {item.nakshatra.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isGood
                          ? 'bg-[#E5F4E5] text-[#1E4620]'
                          : 'bg-[#FCEBEB] text-[#7A2D12]'
                      }`}
                    >
                      {item.tara.name} ({item.tara.sanskritName.split(' ')[0]})
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5C5850]">
                    Lord: <strong>{item.nakshatra.lord}</strong> • Deity: {item.nakshatra.deity}
                  </div>
                  <p className="text-[11px] text-[#5C5850] leading-tight pt-1">
                    {item.tara.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

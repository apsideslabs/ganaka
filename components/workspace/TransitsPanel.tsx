'use client';

/**
 * Gaṇaka — Gocāra (Planetary Transits) & Vedha Obstruction Engine
 * Real-time planetary transits against Natal Moon & Ascendant,
 * Classical Vedha Obstruction diagnostics, Śani Sāḍhē Sātī tracker,
 * and Interactive Transit Chart Visualizer.
 */

import React, { useState, useMemo } from 'react';
import { CalculatedPlanet, RashiNumber } from '@/lib/jyotisha/types';
import { PlanetId } from '@/lib/astronomy/ephemeris';
import { AyanamshaType } from '@/lib/astronomy/ayanamsha';
import { calculateCurrentTransits } from '@/lib/jyotisha/transits';
import { KundaliChart } from '../charts/KundaliChart';
import { RASHIS } from '@/lib/jyotisha/constants';
import { GanakaDatePicker } from '@/components/ui/GanakaDatePicker';
import {
  Activity,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Ban,
} from 'lucide-react';

interface TransitsPanelProps {
  natalPlanets: Record<PlanetId, CalculatedPlanet>;
  natalMoonRashi: RashiNumber;
  natalLagnaRashi: RashiNumber;
  ayanamshaType: AyanamshaType;
}

export function TransitsPanel({
  natalPlanets,
  natalMoonRashi,
  natalLagnaRashi,
  ayanamshaType,
}: TransitsPanelProps) {
  const [transitDate, setTransitDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'table' | 'chart' | 'overlay'>('table');
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');

  const transitData = useMemo(() => {
    return calculateCurrentTransits(
      natalMoonRashi,
      natalLagnaRashi,
      ayanamshaType,
      transitDate || new Date()
    );
  }, [natalMoonRashi, natalLagnaRashi, ayanamshaType, transitDate]);

  // Adjust date helpers
  const adjustDate = (days: number) => {
    const next = new Date(transitDate);
    next.setDate(next.getDate() + days);
    setTransitDate(next);
  };

  const adjustMonth = (months: number) => {
    const next = new Date(transitDate);
    next.setMonth(next.getMonth() + months);
    setTransitDate(next);
  };

  const adjustYear = (years: number) => {
    const next = new Date(transitDate);
    next.setFullYear(next.getFullYear() + years);
    setTransitDate(next);
  };

  // Convert transit planets to chart format for KundaliChart
  const transitChartPlanets: Record<PlanetId, { rashiNumber: RashiNumber; degreeInRashi: number; house: number; isRetrograde?: boolean }> = useMemo(() => {
    const map: any = {};
    for (const tp of transitData.planets) {
      map[tp.id] = {
        rashiNumber: tp.transitRashi,
        degreeInRashi: tp.transitDegreeInRashi,
        house: tp.houseFromNatalLagna,
        isRetrograde: tp.isRetrograde,
      };
    }
    return map;
  }, [transitData.planets]);

  return (
    <div id="transits-panel-container" className="space-y-6">
      {/* Header & Controls */}
      <div id="transits-header-bar" className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D8CEBA] pb-3">
        <div>
          <h2 id="transits-main-title" className="font-serif text-xl font-bold tracking-tight text-[#2B1810]">
            Gocāra (Transits) &amp; Vedha Obstruction
          </h2>
          <p className="font-sans text-xs text-[#6B5E51]">
            Real-time planetary transits counted from Janma Rāśi (Moon) and Janma Lagna
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sub-view switcher */}
          <div className="inline-flex rounded-lg border border-[#D8CEBA] bg-[#F2EADB] p-1 font-sans text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                viewMode === 'table' ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-sm' : 'text-[#4A3B32]'
              }`}
            >
              Diagnostic Table
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                viewMode === 'chart' ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-sm' : 'text-[#4A3B32]'
              }`}
            >
              Transit Chart
            </button>
            <button
              onClick={() => setViewMode('overlay')}
              className={`rounded-md px-2.5 py-1 font-semibold transition-all ${
                viewMode === 'overlay' ? 'bg-[#8C2D19] text-[#FDFBF7] shadow-sm' : 'text-[#4A3B32]'
              }`}
            >
              Natal vs Gochara
            </button>
          </div>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="rounded-xl border border-[#D8CEBA] bg-[#FAF6EE] p-3 shadow-sm flex flex-wrap items-center justify-between gap-3 font-sans text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#8C2D19]" />
          <span className="font-bold text-[#2B1810]">Gocāra Reference Date:</span>
          <span className="font-mono font-bold text-[#8C2D19] bg-[#F2EADC] px-2 py-0.5 rounded">
            {transitData.transitDateStr}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setTransitDate(new Date())}
            className="rounded border border-[#D8CEBA] bg-[#FDFBF7] px-2 py-1 font-semibold text-[#2B1810] hover:bg-[#F2EADB]"
          >
            Today
          </button>
          <button
            onClick={() => adjustDate(-1)}
            className="rounded border border-[#D8CEBA] bg-[#FDFBF7] px-2 py-1 text-[#2B1810] hover:bg-[#F2EADB]"
          >
            -1 Day
          </button>
          <button
            onClick={() => adjustDate(1)}
            className="rounded border border-[#D8CEBA] bg-[#FDFBF7] px-2 py-1 text-[#2B1810] hover:bg-[#F2EADB]"
          >
            +1 Day
          </button>
          <button
            onClick={() => adjustMonth(-1)}
            className="rounded border border-[#D8CEBA] bg-[#FDFBF7] px-2 py-1 text-[#2B1810] hover:bg-[#F2EADB]"
          >
            -1 Month
          </button>
          <button
            onClick={() => adjustMonth(1)}
            className="rounded border border-[#D8CEBA] bg-[#FDFBF7] px-2 py-1 text-[#2B1810] hover:bg-[#F2EADB]"
          >
            +1 Month
          </button>
          <button
            onClick={() => adjustYear(-1)}
            className="rounded border border-[#D8CEBA] bg-[#FDFBF7] px-2 py-1 text-[#2B1810] hover:bg-[#F2EADB]"
          >
            -1 Year
          </button>
          <button
            onClick={() => adjustYear(1)}
            className="rounded border border-[#D8CEBA] bg-[#FDFBF7] px-2 py-1 text-[#2B1810] hover:bg-[#F2EADB]"
          >
            +1 Year
          </button>
        </div>
      </div>

      {/* Saturn Sāḍhē Sātī & Dhaiyā Diagnostic Card */}
      <div className="rounded-xl border border-[#D8CEBA] bg-[#FAF6EE] p-4 shadow-sm space-y-3 font-sans">
        <div className="flex items-center justify-between border-b border-[#E6DEC8] pb-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-[#8C2D19]" />
            <h3 className="font-serif text-base font-bold text-[#2B1810]">
              Saturn Transit Diagnostic (Śani Sāḍhē Sātī &amp; Dhaiyā)
            </h3>
          </div>
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${
              transitData.sadeSati.isActive
                ? 'bg-[#F9DCD5] text-[#8C2D19] border border-[#E6BFB8]'
                : 'bg-[#E1EAD2] text-[#2D5A27] border border-[#C8D9B8]'
            }`}
          >
            {transitData.sadeSati.phase}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg bg-[#F2EADC] p-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A6B5C]">Natal Moon (Janma Rāśi)</span>
            <div className="font-serif text-base font-bold text-[#2B1810] mt-0.5">
              {RASHIS[natalMoonRashi].sanskritName} ({RASHIS[natalMoonRashi].name})
            </div>
          </div>

          <div className="rounded-lg bg-[#F2EADC] p-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A6B5C]">Transiting Saturn House</span>
            <div className="font-mono text-base font-bold text-[#8C2D19] mt-0.5">
              {transitData.sadeSati.saturnNatalHouseFromMoon}th House from Moon
            </div>
          </div>

          <div className="rounded-lg bg-[#F2EADC] p-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A6B5C]">Classical Assessment</span>
            <div className="text-xs font-semibold text-[#2B1810] mt-0.5">
              {transitData.sadeSati.dhairyaDescription}
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: Diagnostic Table with Vedha status */}
      {viewMode === 'table' && (
        <div id="subview-transit-table" className="rounded-xl border border-[#D8CEBA] bg-[#FAF6EE] shadow-sm overflow-hidden font-sans">
          <div className="border-b border-[#D8CEBA] bg-[#EFE7D8] px-4 py-2.5 flex items-center justify-between">
            <span className="font-serif text-sm font-bold text-[#2B1810]">
              Transit Positions, House Reckoning &amp; Vedha (Obstruction) Table
            </span>
            <span className="text-xs text-[#7A6B5C]">
              Reference: Phaladeepika Ch. 26 &amp; BPHS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table id="transits-data-table" className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D8CEBA] bg-[#F7F2E7] text-[#5C4A3E] font-medium">
                  <th className="py-2.5 px-3">Graha</th>
                  <th className="py-2.5 px-3">Transit Rāśi</th>
                  <th className="py-2.5 px-3 font-mono">Degree in Rāśi</th>
                  <th className="py-2.5 px-3 text-center">House (from Moon)</th>
                  <th className="py-2.5 px-3 text-center">House (from Lagna)</th>
                  <th className="py-2.5 px-3">Vedha (Obstruction)</th>
                  <th className="py-2.5 px-3">Verdict</th>
                  <th className="py-2.5 px-3">Phaladeepika Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DEC8]">
                {transitData.planets.map((p) => (
                  <tr key={p.id} id={`transit-row-${p.id}`} className="hover:bg-[#F2EADC] transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#2B1810]">
                      <div className="font-serif">{p.sanskritName}</div>
                      <div className="text-[10px] text-[#7A6B5C]">({p.name})</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#3D2F28]">
                      {p.transitRashiName} (#{p.transitRashi})
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#8C2D19]">
                      {p.transitDegreeInRashi.toFixed(2)}°
                      {p.isRetrograde && <span className="ml-1 text-[10px] text-[#8C2D19] font-bold">(R)</span>}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-[#2B1810]">
                      {p.houseFromNatalMoon}th
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[#5C4A3E]">
                      {p.houseFromNatalLagna}th
                    </td>
                    <td className="py-2.5 px-3">
                      {p.hasVedhaObstruction ? (
                        <div className="text-[#8C2D19] flex items-center gap-1 font-bold text-[11px]">
                          <Ban className="h-3 w-3 text-[#8C2D19]" />
                          <span>Obstructed ({p.obstructingPlanets?.join(', ')})</span>
                        </div>
                      ) : (
                        <div className="text-[#2D5A27] flex items-center gap-1 font-semibold text-[11px]">
                          <ShieldCheck className="h-3 w-3 text-[#2D5A27]" />
                          <span>Clear (No Vedha)</span>
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {p.isBeneficTransitFromMoon ? (
                        <span className="inline-flex items-center gap-1 rounded bg-[#E1EAD2] px-2 py-0.5 text-[10px] font-bold text-[#2D5A27]">
                          <CheckCircle2 className="h-3 w-3" /> Favorable (Śubha)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-[#F9DCD5] px-2 py-0.5 text-[10px] font-bold text-[#8C2D19]">
                          <AlertTriangle className="h-3 w-3" /> Unfavorable (Aśubha)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-[#5C4A3E] max-w-xs">
                      {p.transitEffectsSummary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Transit Kundali Chart */}
      {viewMode === 'chart' && (
        <div id="subview-transit-chart" className="flex flex-col items-center gap-4">
          <div className="inline-flex rounded-lg border border-[#D8CEBA] bg-[#F2EADB] p-1 font-sans text-xs">
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

          <KundaliChart
            lagnaRashi={natalLagnaRashi}
            planets={transitChartPlanets}
            title={`Gocāra Cakra (Transits on ${transitData.transitDateStr})`}
            subtitle="Planetary transit positions relative to Natal Ascendant"
            style={chartStyle}
          />
        </div>
      )}

      {/* VIEW 3: Side-by-Side Natal vs Gochara Overlay */}
      {viewMode === 'overlay' && (
        <div id="subview-transit-overlay" className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start font-sans">
          {/* Natal Chart Column */}
          <div className="rounded-xl border border-[#D8CEBA] bg-[#FAF6EE] p-4 shadow-sm space-y-3">
            <div className="border-b border-[#E6DEC8] pb-2 font-serif font-bold text-base text-[#2B1810]">
              Natal Janma Kundalī (Birth Positions)
            </div>
            <div className="space-y-1.5 text-xs">
              {Object.values(natalPlanets).map((p) => (
                <div key={p.id} className="flex justify-between items-center p-2 rounded bg-[#F2EADC]">
                  <span className="font-semibold text-[#2B1810]">{p.sanskritName}</span>
                  <span className="font-mono text-[#8C2D19]">{p.degreeStr} in {p.rashiName} (H{p.house})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transit Chart Column */}
          <div className="rounded-xl border border-[#D8CEBA] bg-[#FAF6EE] p-4 shadow-sm space-y-3">
            <div className="border-b border-[#E6DEC8] pb-2 font-serif font-bold text-base text-[#2B1810]">
              Gocāra Transits ({transitData.transitDateStr})
            </div>
            <div className="space-y-1.5 text-xs">
              {transitData.planets.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-2 rounded bg-[#F2EADC]">
                  <span className="font-semibold text-[#2B1810]">{p.sanskritName}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#8C2D19]">{p.transitDegreeInRashi.toFixed(2)}° in {p.transitRashiName}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      p.isBeneficTransitFromMoon ? 'bg-[#E1EAD2] text-[#2D5A27]' : 'bg-[#F9DCD5] text-[#8C2D19]'
                    }`}>
                      {p.houseFromNatalMoon}th from 🌕
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

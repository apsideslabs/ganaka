'use client';

/**
 * Gaṇaka — Varṣaphala (वर्षफल) Panel
 *
 * The annual chart: cast for the instant the Sun returns to its natal sidereal
 * longitude, and read for that year alone. Tājika system, after Nīlakaṇṭha's
 * Tājika Nīlakaṇṭhī.
 *
 * Colours follow the workspace convention — #8C2D19 accent, slate neutrals —
 * rather than the #8B2500 variant used by a handful of older panels.
 */

import React, { useMemo, useState } from 'react';
import type { JyotishaChart, PlanetId, RashiNumber, VargaId } from '@/lib/jyotisha/types';
import { calculateVarshaphala } from '@/lib/varshaphala/varshaphala';
import { DivisionalChartDiagram } from './DivisionalChartDiagram';
import { CalendarDays, Sun, Compass, Award, Info, Orbit } from 'lucide-react';

interface VarshaphalaPanelProps {
  chart: JyotishaChart;
}

const RASHI_NAMES = [
  'Meṣa', 'Vṛṣabha', 'Mithuna', 'Karka', 'Siṃha', 'Kanyā',
  'Tulā', 'Vṛścika', 'Dhanu', 'Makara', 'Kumbha', 'Mīna',
];

const GRAHA_LABEL: Record<string, string> = {
  sun: 'Sun (Sūrya)', moon: 'Moon (Candra)', mars: 'Mars (Maṅgala)',
  mercury: 'Mercury (Budha)', jupiter: 'Jupiter (Guru)', venus: 'Venus (Śukra)',
  saturn: 'Saturn (Śani)', rahu: 'Rāhu', ketu: 'Ketu',
};

const GRAHA_ORDER: PlanetId[] = [
  'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu',
];

export const VarshaphalaPanel: React.FC<VarshaphalaPanelProps> = ({ chart }) => {
  const b = chart.meta.birthDetails;
  const currentYear = Math.max(1, new Date().getFullYear() - b.year);
  const [yearNumber, setYearNumber] = useState<number>(currentYear);

  const result = useMemo(() => {
    try {
      return calculateVarshaphala(chart, {
        yearNumber,
        latitude: b.latitude,
        longitude: b.longitude,
        timezoneOffsetHours: b.timezoneOffsetHours,
      });
    } catch (e) {
      console.warn('Varṣaphala calculation failed', e);
      return null;
    }
  }, [chart, yearNumber, b.latitude, b.longitude, b.timezoneOffsetHours]);

  if (!result) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <p className="text-sm text-slate-500">Varṣaphala could not be computed for this chart.</p>
      </div>
    );
  }

  const { solarReturn, muntha, varshesha, sahams, chart: annual } = result;
  const pad = (n: number) => String(n).padStart(2, '0');
  const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const returnDate = `${solarReturn.day} ${MONTHS[solarReturn.month]} ${solarReturn.year}`;

  // The annual chart, shaped for the shared diagram component.
  const diagramPlanets = Object.fromEntries(
    GRAHA_ORDER.map((id) => {
      const p: any = (annual.planets as any)[id];
      return [id, {
        rashiNumber: p.rashiNumber as RashiNumber,
        degreeStr: p.degreeStr,
        isRetrograde: p.isRetrograde,
        isCombust: p.isCombust,
      }];
    })
  ) as Record<PlanetId, { rashiNumber: RashiNumber; degreeStr?: string; isRetrograde?: boolean; isCombust?: boolean }>;

  return (
    <div className="space-y-5">
      {/* ---------- header ---------- */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
            <h2 className="text-base font-serif font-bold text-slate-900">Varṣaphala — Annual Kuṇḍalī</h2>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            The year's own chart, cast for the varṣapraveśa — the instant the Sun returns to its
            natal sidereal longitude. Tājika system, after the Tājika Nīlakaṇṭhī.
          </p>
        </div>
        <div className="flex items-end gap-3 shrink-0">
          <div>
            <label htmlFor="varsha-year" className="block text-[9px] font-mono uppercase tracking-widest text-slate-400 mb-1">
              Year of life
            </label>
            <input
              id="varsha-year"
              type="number"
              min={1}
              max={120}
              value={yearNumber}
              onChange={(e) => setYearNumber(Math.max(1, Math.min(120, Number(e.target.value) || 1)))}
              className="w-24 px-2.5 py-1.5 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8C2D19]/40"
            />
          </div>
        </div>
      </div>

      {/* ---------- the return instant ---------- */}
      <div className="bg-white border border-slate-200/90 rounded-2xl px-5 py-4 shadow-xs flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-[#8C2D19]" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Varṣapraveśa</span>
        </div>
        <span className="font-serif font-bold text-slate-900">{returnDate}</span>
        <span className="font-mono text-sm text-slate-700">
          {pad(solarReturn.hour)}:{pad(solarReturn.minute)}:{pad(solarReturn.second)}
        </span>
        <span className="text-xs text-slate-500">
          Sun returned to {result.natalSunLongitude.toFixed(4)}°
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          residual {result.residualArcsec.toFixed(2)}″
        </span>
      </div>

      {/* ---------- the annual chart + its grahas ---------- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">
            The year's kuṇḍalī
          </h3>
          <DivisionalChartDiagram
            vargaId={'D1' as VargaId}
            vargaName="Varṣaphala"
            sanskritName="वर्षफल"
            significance="Annual chart cast for the solar return"
            divisionFactor={1}
            lagnaRashi={annual.lagna.rashiNumber}
            lagnaDegreeStr={annual.lagna.degreeStr}
            planets={diagramPlanets}
            initialStyle="north"
          />
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">
            Grahas of the year
          </h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Planet</th>
                <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Sign</th>
                <th className="text-right py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Degree</th>
                <th className="text-center py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">House</th>
              </tr>
            </thead>
            <tbody>
              {GRAHA_ORDER.map((id) => {
                const p: any = (annual.planets as any)[id];
                if (!p) return null;
                return (
                  <tr key={id} className="border-b border-slate-100 last:border-0">
                    <td className="py-1.5 text-slate-700 whitespace-nowrap">
                      {GRAHA_LABEL[id] ?? id}
                      {p.isRetrograde ? <span className="ml-1 text-[10px] text-[#8C2D19]">R</span> : null}
                    </td>
                    <td className="py-1.5 text-slate-600">{p.rashiName}</td>
                    <td className="py-1.5 text-right font-mono tabular-nums text-slate-600">{p.degreeStr}</td>
                    <td className="py-1.5 text-center font-mono tabular-nums text-slate-700">{p.house}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- muntha / varshesha / lagna ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-1.5 mb-1">
            <Compass className="w-3.5 h-3.5 text-[#8C2D19]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Annual Lagna</span>
          </div>
          <div className="font-serif text-lg font-bold text-slate-900">
            {RASHI_NAMES[annual.lagna.rashiNumber - 1]}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{annual.lagna.degreeStr}</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-1.5 mb-1">
            <Orbit className="w-3.5 h-3.5 text-[#8C2D19]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Munthā</span>
          </div>
          <div className="font-serif text-lg font-bold text-slate-900">House {muntha.house}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            in {muntha.rashiName} · natal house {muntha.natalHouse}
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-1.5 mb-1">
            <Award className="w-3.5 h-3.5 text-[#8C2D19]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Varṣeśa</span>
          </div>
          <div className="font-serif text-lg font-bold text-slate-900">{varshesha.lordName}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {varshesha.sanskritName} · {varshesha.scores[0].points}/25 pañcavargīya
          </div>
        </div>
      </div>

      {/* ---------- varshesha election ---------- */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">
          Pañcavargīya Bala — election of the varṣeśa
        </h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Graha</th>
              <th className="text-right py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Points</th>
              <th className="text-left py-2 pl-4 font-mono text-[9px] uppercase tracking-wider text-slate-400 w-1/2">Strength</th>
            </tr>
          </thead>
          <tbody>
            {varshesha.scores.map((s, i) => (
              <tr key={s.planet} className="border-b border-slate-100 last:border-0">
                <td className="py-1.5">
                  <span className={i === 0 ? 'font-bold text-[#8C2D19]' : 'text-slate-700'}>{s.name}</span>
                </td>
                <td className="py-1.5 text-right font-mono tabular-nums text-slate-700">{s.points}</td>
                <td className="py-1.5 pl-4">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(s.points / 25) * 100}%`,
                        background: i === 0 ? '#8C2D19' : '#CBD5E1',
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------- sahams ---------- */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">
          Sahams — sensitive points of the year
        </h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Saham</th>
              <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Sign</th>
              <th className="text-right py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Longitude</th>
              <th className="text-right py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">House</th>
            </tr>
          </thead>
          <tbody>
            {sahams.map((s) => (
              <tr key={s.key} className="border-b border-slate-100 last:border-0">
                <td className="py-1.5 text-slate-700">
                  {s.name} <span className="text-slate-400">{s.sanskritName}</span>
                </td>
                <td className="py-1.5 text-slate-600">{s.rashiName}</td>
                <td className="py-1.5 text-right font-mono tabular-nums text-slate-500">{s.longitude.toFixed(2)}°</td>
                <td className="py-1.5 text-right font-mono tabular-nums text-slate-700">{s.house}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------- scope note ---------- */}
      <div className="flex gap-2.5 bg-white border border-slate-200/90 rounded-2xl px-5 py-4 shadow-xs">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          The solar return, the annual kuṇḍalī, munthā, varṣeśa and the saham mechanism are
          implemented. Two things the Tājika texts give are not: the full thirty-saham list — whose
          pairs differ between recensions — and the harṣala and tri-paṭākī aspect strengths. They
          are omitted rather than approximated.
        </p>
      </div>
    </div>
  );
};

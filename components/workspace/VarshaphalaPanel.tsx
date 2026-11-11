'use client';

/**
 * Gaṇaka — Varṣaphala (वर्षफल) Panel
 *
 * The annual chart: cast for the instant the Sun returns to its natal
 * sidereal longitude, read for that year alone. Tājika system, after
 * Nīlakaṇṭha's Tājika Nīlakaṇṭhī.
 */

import React, { useMemo, useState } from 'react';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import { calculateVarshaphala } from '@/lib/varshaphala/varshaphala';
import { CalendarDays, Sun, Compass, Award, Info } from 'lucide-react';

interface VarshaphalaPanelProps {
  chart: JyotishaChart;
}

const RASHI_NAMES = [
  'Meṣa', 'Vṛṣabha', 'Mithuna', 'Karka', 'Siṃha', 'Kanyā',
  'Tulā', 'Vṛścika', 'Dhanu', 'Makara', 'Kumbha', 'Mīna',
];

export const VarshaphalaPanel: React.FC<VarshaphalaPanelProps> = ({ chart }) => {
  const birthYear = chart.meta.birthDetails.year;
  const now = new Date();
  const currentYear = Math.max(1, now.getFullYear() - birthYear);

  const [yearNumber, setYearNumber] = useState<number>(currentYear);

  const result = useMemo(() => {
    try {
      return calculateVarshaphala(chart, {
        yearNumber,
        latitude: chart.meta.birthDetails.latitude,
        longitude: chart.meta.birthDetails.longitude,
        timezoneOffsetHours: chart.meta.birthDetails.timezoneOffsetHours,
      });
    } catch (e) {
      console.warn('Varṣaphala calculation failed', e);
      return null;
    }
  }, [chart, yearNumber]);

  if (!result) {
    return (
      <div className="bg-white border border-[#E8E2D6] rounded-xl p-6 shadow-xs">
        <p className="text-sm text-[#7A7060]">
          Varṣaphala could not be computed for this chart.
        </p>
      </div>
    );
  }

  const { solarReturn, muntha, varshesha, sahams, chart: annual } = result;
  const pad = (n: number) => String(n).padStart(2, '0');
  const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const returnDate = `${solarReturn.day} ${MONTHS[solarReturn.month]} ${solarReturn.year}`;

  return (
    <div className="bg-white border border-[#E8E2D6] rounded-xl p-6 shadow-xs space-y-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F0ECE1] pb-4 gap-3">
        <div>
          <h3 className="text-base font-serif font-bold text-[#2A241A] flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#8B2500]" />
            <span>Varṣaphala — Annual Chart</span>
          </h3>
          <p className="text-xs text-[#7A7060]">
            Cast for the varṣapraveśa: the instant the Sun returns to its natal sidereal longitude.
            Tājika system, after the Tājika Nīlakaṇṭhī.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="varsha-year" className="text-[10px] font-mono uppercase tracking-wider text-[#7A7060]">
            Year of life
          </label>
          <input
            id="varsha-year"
            type="number"
            min={1}
            max={120}
            value={yearNumber}
            onChange={(e) => setYearNumber(Math.max(1, Math.min(120, Number(e.target.value) || 1)))}
            className="w-20 px-2 py-1.5 text-sm font-mono border border-[#E5DEC8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B2500]/40"
          />
        </div>
      </div>

      {/* solar return */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-[#FAF8F5] border border-[#E5DEC8] rounded-lg px-4 py-3">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-[#8B2500]" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A7060]">Varṣapraveśa</span>
        </div>
        <span className="font-serif font-bold text-[#2A241A]">{returnDate}</span>
        <span className="font-mono text-sm text-[#2A241A]">
          {pad(solarReturn.hour)}:{pad(solarReturn.minute)}:{pad(solarReturn.second)}
        </span>
        <span className="text-xs text-[#7A7060]">
          Sun returned to {result.natalSunLongitude.toFixed(4)}°
        </span>
        <span className="text-[10px] font-mono text-[#9A8E78]">
          residual {result.residualArcsec.toFixed(2)}″
        </span>
      </div>

      {/* three cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="border border-[#EBE4D7] rounded-lg p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Compass className="w-3.5 h-3.5 text-[#8B2500]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A7060]">Annual Lagna</span>
          </div>
          <div className="font-serif text-lg font-bold text-[#2A241A]">
            {RASHI_NAMES[annual.lagna.rashiNumber - 1]}
          </div>
          <div className="text-xs text-[#7A7060] mt-0.5">{annual.lagna.degreeStr}</div>
        </div>

        <div className="border border-[#EBE4D7] rounded-lg p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <CalendarDays className="w-3.5 h-3.5 text-[#8B2500]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A7060]">Munthā</span>
          </div>
          <div className="font-serif text-lg font-bold text-[#2A241A]">
            House {muntha.house}
          </div>
          <div className="text-xs text-[#7A7060] mt-0.5">
            in {muntha.rashiName} · natal house {muntha.natalHouse}
          </div>
        </div>

        <div className="border border-[#EBE4D7] rounded-lg p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Award className="w-3.5 h-3.5 text-[#8B2500]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A7060]">Varṣeśa</span>
          </div>
          <div className="font-serif text-lg font-bold text-[#2A241A]">
            {varshesha.lordName}
          </div>
          <div className="text-xs text-[#7A7060] mt-0.5">
            {varshesha.sanskritName} · {varshesha.scores[0].points}/25 pañcavargīya
          </div>
        </div>
      </div>

      {/* varshesha election */}
      <div>
        <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#7A7060] mb-2">
          Pañcavargīya Bala — election of the varṣeśa
        </h4>
        <div className="overflow-x-auto border border-[#EBE4D7] rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-[#FAF8F5] text-[#5A4E3C] border-b border-[#EBE4D7] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2 px-3 text-left font-normal">Graha</th>
                <th className="py-2 px-3 text-right font-normal">Points</th>
                <th className="py-2 px-3 text-left font-normal w-1/2">Strength</th>
              </tr>
            </thead>
            <tbody>
              {varshesha.scores.map((s, i) => (
                <tr key={s.planet} className="border-t border-[#F0ECE1]">
                  <td className="py-1.5 px-3">
                    <span className={i === 0 ? 'font-bold text-[#8B2500]' : 'text-[#2A241A]'}>
                      {s.name}
                    </span>
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono tabular-nums text-[#2A241A]">
                    {s.points}
                  </td>
                  <td className="py-1.5 px-3">
                    <div className="h-1.5 bg-[#F0ECE1] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(s.points / 25) * 100}%`,
                          background: i === 0 ? '#8B2500' : '#C9BDA4',
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* sahams */}
      <div>
        <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#7A7060] mb-2">
          Sahams — sensitive points of the year
        </h4>
        <div className="overflow-x-auto border border-[#EBE4D7] rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-[#FAF8F5] text-[#5A4E3C] border-b border-[#EBE4D7] text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2 px-3 text-left font-normal">Saham</th>
                <th className="py-2 px-3 text-left font-normal">Rāśi</th>
                <th className="py-2 px-3 text-right font-normal">Longitude</th>
                <th className="py-2 px-3 text-right font-normal">House</th>
              </tr>
            </thead>
            <tbody>
              {sahams.map((s) => (
                <tr key={s.key} className="border-t border-[#F0ECE1]">
                  <td className="py-1.5 px-3 text-[#2A241A]">
                    {s.name} <span className="text-[#9A8E78]">{s.sanskritName}</span>
                  </td>
                  <td className="py-1.5 px-3 text-[#2A241A]">{s.rashiName}</td>
                  <td className="py-1.5 px-3 text-right font-mono tabular-nums text-[#7A7060]">
                    {s.longitude.toFixed(2)}°
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono tabular-nums text-[#2A241A]">
                    {s.house}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* scope note */}
      <div className="flex gap-2.5 bg-[#FAF8F5] border border-[#E5DEC8] rounded-lg px-4 py-3">
        <Info className="w-4 h-4 text-[#A08A5E] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#7A7060] leading-relaxed">
          The solar return, munthā, varṣeśa and saham mechanism are implemented. Two things the
          Tājika texts give are not: the full thirty-saham list — whose pairs differ between
          recensions — and the harṣala and tri-paṭākī aspect strengths. They are omitted rather
          than approximated.
        </p>
      </div>
    </div>
  );
};

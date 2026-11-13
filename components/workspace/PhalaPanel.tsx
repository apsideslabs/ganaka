'use client';

/**
 * Gaṇaka — Ishta/Kaṣṭa Phala, planetary motion states, progeny sphuṭas and
 * Kakṣyā transits.
 *
 * Ishta and Kaṣṭa come from BPHS 28.6. The motion states follow the classical
 * Vakrī / Anuvakrī / Mandā / Samā / Aticharā division. The Bīja and Kṣetra
 * sphuṭas are the progeny points. Kakṣyā is the 3°45′ transit filter read
 * against the natal Bhinna Aṣṭakavarga.
 */

import React, { useMemo } from 'react';
import type { JyotishaChart } from '@/lib/jyotisha/types';
import { calculatePhala } from '@/lib/jyotisha/phala-advanced';
import { calculateKakshyaTransits } from '@/lib/ashtakavarga/kakshya';
import { calculateAllPlanets } from '@/lib/astronomy/ephemeris';
import { calculateJulianDay } from '@/lib/astronomy/julian';
import { Info, Sparkles, TrendingUp, TrendingDown, Orbit } from 'lucide-react';

interface PhalaPanelProps {
  chart: JyotishaChart;
}

const MOTION_COLOUR: Record<string, string> = {
  'Vakrī (retrograde)': 'text-[#8C2D19]',
  'Anuvakrī (re-accelerating)': 'text-[#8C2D19]',
  'Sthambhī (stationary)': 'text-slate-400',
  'Mandā (slow)': 'text-slate-500',
  'Samā (mean)': 'text-slate-600',
  'Aticharā (fast)': 'text-emerald-700',
};

export const PhalaPanel: React.FC<PhalaPanelProps> = ({ chart }) => {
  const phala = useMemo(() => {
    try {
      return calculatePhala(chart);
    } catch (e) {
      console.warn('Phala calculation failed', e);
      return null;
    }
  }, [chart]);

  // Today's transiting positions, for the kakṣyā filter.
  const kakshya = useMemo(() => {
    try {
      const now = new Date();
      const jd = calculateJulianDay(
        now.getFullYear(), now.getMonth() + 1, now.getDate(),
        now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()
      );
      const ayan: any = (chart.meta as any)?.ayanamshaType ?? 'lahiri';
      const p: any = calculateAllPlanets(jd, ayan, 0);
      const lons: any = {};
      for (const g of ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']) {
        if (p[g]?.siderealLongitude != null) lons[g] = p[g].siderealLongitude;
      }
      return calculateKakshyaTransits(chart, lons);
    } catch (e) {
      console.warn('Kakṣyā calculation failed', e);
      return [];
    }
  }, [chart]);

  if (!phala) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <p className="text-sm text-slate-500">Ishta/Kaṣṭa could not be computed for this chart.</p>
      </div>
    );
  }

  const rows = Object.values(phala.planets);

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19]" />
          <h2 className="text-base font-serif font-bold text-slate-900">Ishta &amp; Kaṣṭa Phala</h2>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
          A graha&rsquo;s capacity to deliver good or difficult results, from its Ucca and Cheṣṭā
          strength — BPHS 28.6. Ishta plus Kaṣṭa always totals sixty virūpas.
        </p>
      </div>

      {/* ishta / kashta table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Graha</th>
              <th className="text-right py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Ucca</th>
              <th className="text-right py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Cheṣṭā</th>
              <th className="text-right py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Ishta</th>
              <th className="text-right py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Kaṣṭa</th>
              <th className="text-left py-2 pl-4 font-mono text-[9px] uppercase tracking-wider text-slate-400">Delivery</th>
              <th className="text-left py-2 pl-4 font-mono text-[9px] uppercase tracking-wider text-slate-400">Motion</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.planet} className="border-b border-slate-100 last:border-0">
                <td className="py-1.5 text-slate-700">{r.name}</td>
                <td className="py-1.5 text-right font-mono tabular-nums text-slate-500">{r.uccaBala.toFixed(1)}</td>
                <td className="py-1.5 text-right font-mono tabular-nums text-slate-500">{r.chestaBala.toFixed(1)}</td>
                <td className="py-1.5 text-right font-mono tabular-nums font-semibold text-emerald-700">{r.ishta.toFixed(1)}</td>
                <td className="py-1.5 text-right font-mono tabular-nums font-semibold text-[#8C2D19]">{r.kashta.toFixed(1)}</td>
                <td className="py-1.5 pl-4">
                  <div className="flex h-1.5 w-28 rounded-full overflow-hidden bg-slate-100">
                    <div className="h-full bg-emerald-600" style={{ width: `${(r.ishta / 60) * 100}%` }} />
                    <div className="h-full bg-[#8C2D19]" style={{ width: `${(r.kashta / 60) * 100}%` }} />
                  </div>
                </td>
                <td className={`py-1.5 pl-4 text-[10px] ${MOTION_COLOUR[r.motionState] ?? 'text-slate-500'}`}>
                  {r.motionState}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* progeny sphutas */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#8C2D19]" /> Progeny Sphuṭas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {phala.progeny.map((s) => (
            <div key={s.key} className="border border-slate-100 rounded-lg p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-0.5">
                {s.name} <span className="text-slate-300">{s.sanskritName}</span>
              </div>
              <div className="font-serif text-base font-bold text-slate-900">{s.degreeStr}</div>
              <div className={`text-[11px] mt-0.5 ${s.isFavourable ? 'text-emerald-700' : 'text-[#8C2D19]'}`}>
                {s.isFavourable ? 'favourable' : 'not favourable'} · wants {s.favourableParity} sign
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* kakshya */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
          <Orbit className="w-3.5 h-3.5 text-[#8C2D19]" /> Kakṣyā Transits — today
        </h3>
        <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
          Each sign divides into eight kakṣyās of 3°45′. A transit delivers good results only
          where the kakṣyā lord gave a bindu in that sign of the graha&rsquo;s Bhinna Aṣṭakavarga.
        </p>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Graha</th>
              <th className="text-left py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Rāśi</th>
              <th className="text-right py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Deg</th>
              <th className="text-center py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Kakṣyā</th>
              <th className="text-left py-2 pl-3 font-mono text-[9px] uppercase tracking-wider text-slate-400">Lord</th>
              <th className="text-center py-2 font-mono text-[9px] uppercase tracking-wider text-slate-400">Bindu</th>
            </tr>
          </thead>
          <tbody>
            {kakshya.length === 0 && (
              <tr><td colSpan={6} className="py-3 text-center text-slate-400">unavailable</td></tr>
            )}
            {kakshya.map((k) => (
              <tr key={k.planet} className="border-b border-slate-100 last:border-0">
                <td className="py-1.5 text-slate-700 capitalize">{k.planet}</td>
                <td className="py-1.5 text-slate-600">{k.rashiName}</td>
                <td className="py-1.5 text-right font-mono tabular-nums text-slate-500">{k.degreeInRashi.toFixed(2)}°</td>
                <td className="py-1.5 text-center font-mono tabular-nums text-slate-600">{k.kakshyaNumber}</td>
                <td className="py-1.5 pl-3 text-slate-600">{k.kakshyaLordName}</td>
                <td className="py-1.5 text-center">
                  {k.isFavourable ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 inline" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-[#8C2D19] inline" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* note */}
      <div className="flex gap-2.5 bg-white border border-slate-200/90 rounded-2xl px-5 py-4 shadow-xs">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Ishta and Kaṣṭa follow BPHS 28.6 exactly: the Ucca and Cheṣṭā rashmis, less one each and
          multiplied by ten, are the virūpas above. Cheṣṭā is clamped to the sixty-virūpa ceiling
          the verse assumes. Prāṇapada and Kunda lagnas are not computed — the sources disagree on
          the rate at which Praṇapada advances, and no verified figure is used here rather than a
          guess.
        </p>
      </div>
    </div>
  );
};

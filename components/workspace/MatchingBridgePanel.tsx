'use client';

import React from 'react';
import Link from 'next/link';
import { JyotishaChart } from '@/lib/jyotisha/types';
import { extractLunarData } from '@/lib/jyotisha/kuta/ashtakuta-calculator';
import { HeartHandshake, ArrowRight, ShieldAlert, Sparkles, BookOpen, User } from 'lucide-react';
import { RASHIS } from '@/lib/jyotisha/constants';

interface MatchingBridgePanelProps {
  chart: JyotishaChart;
}

export function MatchingBridgePanel({ chart }: MatchingBridgePanelProps) {
  const lunar = extractLunarData(chart);
  const marsHouse = chart.planets.mars.house;
  const isKuja = [1, 2, 4, 7, 8, 12].includes(marsHouse);
  // The chart exposes `bhavas`; `houses` never existed on the type, so this
  // panel was reading undefined and would throw on render.
  const seventh = chart.bhavas[6];
  const seventhLord = seventh.rashiLord;
  const seventhSign = seventh.rashiNumber;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header with Direct Workspace CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold bg-[#8C2D19]/10 text-[#8C2D19]">
              Vivāha Kūṭa Milan
            </span>
            <span className="text-xs font-mono text-slate-400">Classical Compatibility Hub</span>
          </div>
          <h3 className="font-serif font-bold text-lg text-slate-900 mt-1">
            Marriage & Kūṭa Matching Profile
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Key natal marriage parameters extracted from this horoscope for classical two-chart Kuṭa Milan.
          </p>
        </div>

        <Link
          href="/matching"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#171614] hover:bg-[#8C2D19] text-[#FCFAF6] text-xs font-mono font-bold uppercase tracking-wider shadow-xs transition-colors group self-start sm:self-auto"
        >
          <span>Open Full Matching Console</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Natal Marriage Signatures Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Lunar Matrix */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-stone-900 font-serif">
            <Sparkles className="w-4 h-4 text-[#8C2D19]" />
            <span>Lunar Foundation (Janma Rāśi)</span>
          </div>
          <div className="space-y-1 text-slate-700">
            <p>
              <span className="text-slate-500 font-mono text-[11px] block">Rāśi & Lord:</span>
              <span className="font-semibold">{lunar.rashiName} ({lunar.rashiLord})</span>
            </p>
            <p>
              <span className="text-slate-500 font-mono text-[11px] block">Nakṣatra & Pada:</span>
              <span className="font-semibold">{lunar.nakshatraName} (Pada {lunar.nakshatraPada})</span>
            </p>
          </div>
        </div>

        {/* 7th House & Kalatra */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-stone-900 font-serif">
            <HeartHandshake className="w-4 h-4 text-indigo-600" />
            <span>7th Bhāva (Kalatra Sthāna)</span>
          </div>
          <div className="space-y-1 text-slate-700">
            <p>
              <span className="text-slate-500 font-mono text-[11px] block">7th Cusp Sign:</span>
              <span className="font-semibold">{RASHIS[seventhSign as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12].sanskritName}</span>
            </p>
            <p>
              <span className="text-slate-500 font-mono text-[11px] block">7th House Lord:</span>
              <span className="font-semibold capitalize">{seventhLord}</span>
            </p>
          </div>
        </div>

        {/* Kuja Dosha Status */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-stone-900 font-serif">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Maṅgala / Kuja Disposition</span>
          </div>
          <div className="space-y-1 text-slate-700">
            <p>
              <span className="text-slate-500 font-mono text-[11px] block">Mars Placement:</span>
              <span className="font-semibold">House {marsHouse} ({chart.planets.mars.dignity.split(' ')[0]})</span>
            </p>
            <p>
              <span className="text-slate-500 font-mono text-[11px] block">Classical Status:</span>
              <span className={`font-semibold ${isKuja ? 'text-amber-700' : 'text-emerald-700'}`}>
                {isKuja ? 'Kuja Afflicted (Requires Sāmya)' : 'Clean / Non-Afflicted'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Guidance Note */}
      <div className="p-4 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-stone-900 font-serif font-bold">
          <BookOpen className="w-3.5 h-3.5 text-[#8C2D19]" />
          <span>Classical Matching Protocol</span>
        </div>
        <p className="text-stone-600 leading-relaxed text-[11px]">
          In Muhūrta Cintāmaṇi and BPHS, individual horoscope analysis precedes Kūṭa matching.
          Use the dedicated Matching Workspace to pair this chart against a prospective spouse with full
          Aṣṭakūṭa 36-point scoring, South Indian Daśakūṭa 10-poruthams, verified exception rules,
          and deeper Navāṃśa (D-9) resonance.
        </p>
      </div>
    </div>
  );
}

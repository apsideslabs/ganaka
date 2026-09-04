'use client';

/**
 * Gaṇaka — Pañcāṅga Five Limbs (Pañca-Aṅga) Layer
 * Implements rigorous classical details for:
 * 1. Tithi (तिथयः) — Pakṣa, ending time, Udaya tithi, deity, tattva, Nandā/Bhadrā/etc.
 * 2. Vāra (वासराः) — Vedic sunrise weekday, Lord, Deity, Metal, Color, Horā lord.
 * 3. Nakṣatra (नक्षत्राणि) — Pāda (1-4), ending time, Udaya nakṣatra, Lord, Deity, Gaṇa, Pāda Akṣara.
 * 4. Yoga (योगाः) — 27 Nitya Yogas, ending time, Udaya yoga, auspiciousness, deity.
 * 5. Karaṇa (करणानि) — Movable/Fixed, ending time, Udaya karaṇa, Bhadrā (Viṣṭi) status & abode.
 */

import React from 'react';
import { PanchangaResult } from '@/lib/jyotisha/types';
import { Award, ShieldAlert } from 'lucide-react';

interface PanchangaFiveLimbsProps {
  panchanga: PanchangaResult;
}

export function PanchangaFiveLimbs({ panchanga }: PanchangaFiveLimbsProps) {
  const { tithi, vara, nakshatra, yoga, karana } = panchanga;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#8C2D19]" />
          <h3 className="font-serif font-bold text-base text-slate-900">
            The Five Classical Limbs (Pañca-Aṅga • पञ्चाङ्ग)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Calculated at Local Sunrise &amp; Sub-second Transitions
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. TITHI */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200/70 pb-2">
              <span className="font-mono uppercase font-bold text-[#8C2D19] text-[10px] tracking-wider">1. Tithi (तिथि)</span>
              <span className="font-serif font-bold text-slate-900 text-xs">{tithi.paksha} Pakṣa</span>
            </div>

            <div className="pt-0.5">
              <div className="text-base font-serif font-bold text-slate-900 leading-snug">
                {tithi.name}
              </div>
              <div className="text-xs text-slate-500 font-serif mt-0.5">
                {tithi.sanskritName} • #{tithi.number}
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-[11px] text-slate-600 font-sans">
                Deity: <strong className="text-slate-900 font-serif">{tithi.deity}</strong>
              </div>
              {tithi.nature && (
                <div className="text-[11px] text-[#8C2D19] font-mono font-semibold">
                  {tithi.nature} Class • {tithi.tattva} Tattva
                </div>
              )}
              {tithi.nityaDeity && (
                <div className="text-[11px] text-slate-600 font-sans">
                  Nityā Devī: <strong className="text-slate-900 font-serif">{tithi.nityaDeity}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/70 space-y-1 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-600">
              <span>Ends At:</span>
              <strong className="text-slate-900 font-bold">{tithi.endTime}</strong>
            </div>
            {tithi.nextTithiName && (
              <div className="text-[10px] text-slate-400 truncate">
                Next: {tithi.nextTithiName}
              </div>
            )}
            {tithi.udayaTithi && (
              <div className="text-[10px] text-[#8C2D19] font-semibold">
                Udaya (Sunrise): {tithi.udayaTithi}
              </div>
            )}
          </div>
        </div>

        {/* 2. VĀRA */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200/70 pb-2">
              <span className="font-mono uppercase font-bold text-[#8C2D19] text-[10px] tracking-wider">2. Vāra (वासर)</span>
              <span className="font-serif font-bold text-slate-900 text-xs">{vara.civilWeekday}</span>
            </div>

            <div className="pt-0.5">
              <div className="text-base font-serif font-bold text-slate-900 leading-snug">
                {vara.sunriseVedicVara}
              </div>
              <div className="text-xs text-slate-500 font-serif mt-0.5">
                {vara.sanskritName} • Day #{vara.number}
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-[11px] text-slate-600 font-sans">
                Lord: <strong className="text-slate-900 font-serif capitalize">{vara.lord}</strong>
              </div>
              {vara.deity && (
                <div className="text-[11px] text-slate-600 font-sans">
                  Deity: <strong className="text-slate-900 font-serif">{vara.deity}</strong>
                </div>
              )}
              {vara.horaLordNowName && (
                <div className="text-[11px] text-[#8C2D19] font-mono font-semibold">
                  Current Horā: {vara.horaLordNowName}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/70 space-y-1 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-600">
              <span>Metal:</span>
              <strong className="text-slate-900 font-bold">{vara.metal || 'Gold / Copper'}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Color:</span>
              <strong className="text-slate-900 font-bold">{vara.color || 'Red / Copper'}</strong>
            </div>
          </div>
        </div>

        {/* 3. NAKṢATRA */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200/70 pb-2">
              <span className="font-mono uppercase font-bold text-[#8C2D19] text-[10px] tracking-wider">3. Nakṣatra (नक्षत्र)</span>
              <span className="font-mono font-bold text-[#8C2D19]">Pāda {nakshatra.pada}</span>
            </div>

            <div className="pt-0.5">
              <div className="text-base font-serif font-bold text-slate-900 leading-snug">
                {nakshatra.name}
              </div>
              <div className="text-xs text-slate-500 font-serif mt-0.5">
                {nakshatra.sanskritName} • #{nakshatra.number}
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="text-[11px] text-slate-600 font-sans">
                Lord: <strong className="text-slate-900 font-serif capitalize">{nakshatra.lord}</strong> • Gaṇa: <strong className="text-slate-900 font-serif">{nakshatra.gana}</strong>
              </div>
              <div className="text-[11px] text-slate-600 font-sans">
                Deity: <strong className="text-slate-900 font-serif">{nakshatra.deity}</strong>
              </div>
              {nakshatra.akshara && (
                <div className="text-[11px] text-[#8C2D19] font-serif font-bold">
                  Nāma Akṣara: &quot;{nakshatra.akshara}&quot;
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/70 space-y-1 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-600">
              <span>Ends At:</span>
              <strong className="text-slate-900 font-bold">{nakshatra.endTime}</strong>
            </div>
            {nakshatra.nextNakshatraName && (
              <div className="text-[10px] text-slate-400 truncate">
                Next: {nakshatra.nextNakshatraName}
              </div>
            )}
            {nakshatra.udayaNakshatra && (
              <div className="text-[10px] text-[#8C2D19] font-semibold">
                Udaya (Sunrise): {nakshatra.udayaNakshatra}
              </div>
            )}
          </div>
        </div>

        {/* 4. YOGA */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200/70 pb-2">
              <span className="font-mono uppercase font-bold text-[#8C2D19] text-[10px] tracking-wider">4. Yoga (योग)</span>
              <span className="font-mono text-xs text-slate-500">#{yoga.number} / 27</span>
            </div>

            <div className="pt-0.5">
              <div className="text-base font-serif font-bold text-slate-900 leading-snug">
                {yoga.name}
              </div>
              <div className="text-xs text-slate-500 font-serif mt-0.5">
                {yoga.sanskritName}
              </div>
            </div>

            <div className="space-y-1 text-xs">
              {yoga.deity && (
                <div className="text-[11px] text-slate-600 font-sans">
                  Deity: <strong className="text-slate-900 font-serif">{yoga.deity}</strong>
                </div>
              )}
              {yoga.auspiciousness && (
                <div className={`text-[11px] font-mono font-semibold ${
                  yoga.auspiciousness.includes('Auspicious') || yoga.auspiciousness.includes('Shubha')
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                }`}>
                  Nature: {yoga.auspiciousness}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/70 space-y-1 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-600">
              <span>Ends At:</span>
              <strong className="text-slate-900 font-bold">{yoga.endTime}</strong>
            </div>
            {yoga.nextYogaName && (
              <div className="text-[10px] text-slate-400 truncate">
                Next: {yoga.nextYogaName}
              </div>
            )}
            {yoga.udayaYoga && (
              <div className="text-[10px] text-[#8C2D19] font-semibold">
                Udaya (Sunrise): {yoga.udayaYoga}
              </div>
            )}
          </div>
        </div>

        {/* 5. KARAṆA */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200/70 pb-2">
              <span className="font-mono uppercase font-bold text-[#8C2D19] text-[10px] tracking-wider">5. Karaṇa (करण)</span>
              <span className="font-mono text-xs text-slate-500">#{karana.number} / 60</span>
            </div>

            <div className="pt-0.5">
              <div className="text-base font-serif font-bold text-slate-900 leading-snug">
                {karana.name}
              </div>
              <div className="text-xs text-slate-500 font-serif mt-0.5">
                {karana.sanskritName} • Type: {karana.type}
              </div>
            </div>

            <div className="space-y-1 text-xs">
              {karana.isBhadraActive ? (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-700 font-serif font-bold flex items-center gap-1.5">
                  <ShieldAlert size={13} className="shrink-0 text-rose-600" />
                  <span>Bhadrā (Viṣṭi) Active in {karana.bhadraLocation || 'Pātāla'}</span>
                </div>
              ) : (
                <div className="text-[11px] text-emerald-800 font-sans">
                  Deity: <strong className="text-slate-900 font-serif">{karana.deity}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/70 space-y-1 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-600">
              <span>Ends At:</span>
              <strong className="text-slate-900 font-bold">{karana.endTime}</strong>
            </div>
            {karana.nextKaranaName && (
              <div className="text-[10px] text-slate-400 truncate">
                Next: {karana.nextKaranaName}
              </div>
            )}
            {karana.udayaKarana && (
              <div className="text-[10px] text-[#8C2D19] font-semibold">
                Udaya (Sunrise): {karana.udayaKarana}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

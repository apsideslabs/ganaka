'use client';

/**
 * Gaṇaka — Pañcāṅga Muhūrta Matrix Layer
 * Complete calculation of classical Vedic Muhūrtas grounded in Muhūrta Chintāmaṇi & Kāladīpikā:
 * 1. Auspicious (Śubha Kāla): Abhijit, Brāhma Muhūrta, Amṛta Kāla (Amṛta Ghaṭī), Vijaya, Godhūli, Niśītha
 * 2. Inauspicious (Aśubha / Varjya Kāla): Rāhukāla, Yamaghaṇṭa, Gulikakāla, Durmuhūrta, Varjyam (Viṣa Ghaṭī)
 * 3. Special Vedic Yogas: Sarvārtha Siddhi, Amṛta Siddhi, Guru/Ravi Puṣya, Dvi-puṣkar, Tri-puṣkar
 */

import React from 'react';
import { PanchangaResult } from '@/lib/jyotisha/types';
import { Sparkles, ShieldAlert } from 'lucide-react';

interface PanchangaMuhurtaMatrixProps {
  panchanga: PanchangaResult;
}

export function PanchangaMuhurtaMatrix({ panchanga }: PanchangaMuhurtaMatrixProps) {
  const { muhurtas } = panchanga;

  const hasSpecialYoga = Boolean(
    muhurtas.amritaSiddhiYoga || muhurtas.sarvarthaSiddhiYoga || muhurtas.pushyaYoga
  );

  return (
    <div className="space-y-6">
      {/* Special Auspicious Yogas Banner */}
      {hasSpecialYoga && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-3 text-emerald-900">
            <Sparkles className="w-5 h-5 text-emerald-700 fill-emerald-700 shrink-0" />
            <div>
              <strong className="font-serif text-sm block">Special Vedic Auspicious Yoga Active Today</strong>
              <span className="text-emerald-700 font-medium">
                {[muhurtas.pushyaYoga, muhurtas.amritaSiddhiYoga, muhurtas.sarvarthaSiddhiYoga]
                  .filter(Boolean)
                  .join(' • ')}
              </span>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-700 text-white rounded-lg font-mono uppercase text-[10px] font-bold tracking-wider self-start sm:self-auto">
            Mahā-Śubha Kāla
          </span>
        </div>
      )}

      {/* Two Column Grid: Auspicious vs Inauspicious */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Auspicious Windows (Śubha Kāla) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900">
                Auspicious Muhūrta Windows (शुभ काल)
              </h3>
            </div>
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 px-2 py-0.5 bg-emerald-50 border border-emerald-200/60 rounded-md">
              Favorable
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {/* Abhijit */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl hover:border-emerald-300 transition-colors">
              <div>
                <strong className="text-sm font-serif font-bold text-slate-900 block">
                  Abhijit Muhūrta (अभिजित्)
                </strong>
                <span className="text-[10px] text-slate-500 font-sans">
                  8th daytime segment (Universal doṣa-destroyer, ruled by Lord Viṣṇu)
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-800 font-mono">
                {muhurtas.abhijit}
              </span>
            </div>

            {/* Brāhma */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl hover:border-emerald-300 transition-colors">
              <div>
                <strong className="text-sm font-serif font-bold text-slate-900 block">
                  Brāhma Muhūrta (ब्राह्म मुहूर्तः)
                </strong>
                <span className="text-[10px] text-slate-500 font-sans">
                  14th nocturnal segment (Ideal for meditation, mantra sādhanā, study)
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-800 font-mono">
                {muhurtas.brahmaMuhurta}
              </span>
            </div>

            {/* Amṛta Kāla */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl hover:border-emerald-300 transition-colors">
              <div>
                <strong className="text-sm font-serif font-bold text-slate-900 block">
                  Amṛta Kāla (अमृत काल / अमृत घटी)
                </strong>
                <span className="text-[10px] text-slate-500 font-sans">
                  Nectarine lunar span derived from Nakṣatra degree (4 Ghaṭīs)
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-800 font-mono">
                {muhurtas.amritKalam}
              </span>
            </div>

            {/* Vijaya */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl hover:border-emerald-300 transition-colors">
              <div>
                <strong className="text-sm font-serif font-bold text-slate-900 block">
                  Vijaya Muhūrta (विजय मुहूर्त)
                </strong>
                <span className="text-[10px] text-slate-500 font-sans">
                  11th daytime segment (Ensures victory in litigation, travel, ventures)
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-800 font-mono">
                {muhurtas.vijaya}
              </span>
            </div>

            {/* Godhūli */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl hover:border-emerald-300 transition-colors">
              <div>
                <strong className="text-sm font-serif font-bold text-slate-900 block">
                  Godhūli Muhūrta (गोधूलि काल)
                </strong>
                <span className="text-[10px] text-slate-500 font-sans">
                  Sunset twilight cusp (12 minutes before &amp; after sunset)
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-800 font-mono">
                {muhurtas.godhuli}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Inauspicious Windows (Aśubha / Varjya Kāla) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900">
                Inauspicious Windows (अशुभ काल / वर्ज्यम्)
              </h3>
            </div>
            <span className="text-[10px] font-mono uppercase font-bold text-rose-700 px-2 py-0.5 bg-rose-50 border border-rose-200/60 rounded-md">
              Avoid New Ventures
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {/* Rāhukāla */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl hover:border-rose-300 transition-colors">
              <div>
                <strong className="text-sm font-serif font-bold text-rose-700 block">
                  Rāhukāla (राहुकाल)
                </strong>
                <span className="text-[10px] text-slate-500 font-sans">
                  1/8th of diurnal span ruled by Rāhu — strictly avoid all beginnings
                </span>
              </div>
              <span className="text-sm font-bold text-rose-700 font-mono">
                {muhurtas.rahukala}
              </span>
            </div>

            {/* Yamaghaṇṭa */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl hover:border-rose-300 transition-colors">
              <div>
                <strong className="text-sm font-serif font-bold text-rose-700 block">
                  Yamaghaṇṭa (यमघण्ट)
                </strong>
                <span className="text-[10px] text-slate-500 font-sans">
                  Ruled by Yama / Guru division — harmful for journey and commerce
                </span>
              </div>
              <span className="text-sm font-bold text-rose-700 font-mono">
                {muhurtas.yamaghanta}
              </span>
            </div>

            {/* Gulikakāla */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl hover:border-rose-300 transition-colors">
              <div>
                <strong className="text-sm font-serif font-bold text-rose-700 block">
                  Gulikakāla (गुलिककाल)
                </strong>
                <span className="text-[10px] text-slate-500 font-sans">
                  Ruled by Saturn&apos;s son Gulika / Māndi — obstacle period
                </span>
              </div>
              <span className="text-sm font-bold text-rose-700 font-mono">
                {muhurtas.gulikakala}
              </span>
            </div>

            {/* Varjyam (Viṣa Ghaṭī) */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl hover:border-rose-300 transition-colors">
              <div>
                <strong className="text-sm font-serif font-bold text-rose-700 block">
                  Varjyam (वर्ज्यम् / विषघटी)
                </strong>
                <span className="text-[10px] text-slate-500 font-sans">
                  Poisonous 4 Ghaṭī window of the ruling Nakṣatra
                </span>
              </div>
              <span className="text-sm font-bold text-rose-700 font-mono">
                {muhurtas.varjyam}
              </span>
            </div>

            {/* Durmuhūrta */}
            {muhurtas.durmuhurta && muhurtas.durmuhurta.length > 0 && (
              <div className="flex items-center justify-between p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl hover:border-rose-300 transition-colors">
                <div>
                  <strong className="text-sm font-serif font-bold text-rose-700 block">
                    Durmuhūrta (दुर्मुहूर्त)
                  </strong>
                  <span className="text-[10px] text-slate-500 font-sans">
                    Inauspicious weekday-specific diurnal divisions
                  </span>
                </div>
                <div className="text-right">
                  {muhurtas.durmuhurta.map((dm, idx) => (
                    <span key={idx} className="block text-xs font-bold text-rose-700 font-mono">
                      {dm}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

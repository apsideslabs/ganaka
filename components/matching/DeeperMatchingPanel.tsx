'use client';

import React from 'react';
import { DeeperHoroscopeMatching } from '@/lib/jyotisha/kuta/types';
import { Shield, Sparkles, Heart, Compass, Flame, Clock } from 'lucide-react';
import { RASHIS } from '@/lib/jyotisha/constants';

interface DeeperMatchingPanelProps {
  deeper: DeeperHoroscopeMatching;
}

export function DeeperMatchingPanel({ deeper }: DeeperMatchingPanelProps) {
  const {
    seventhHouseAffinity,
    significatorAffinity,
    navamshaHarmony,
    jaiminiKuta,
    mangalaComparison,
    dashaSandhi,
  } = deeper;

  return (
    <div id="deeper-matching-container" className="space-y-6">
      {/* Introduction banner */}
      <div className="p-4 bg-[#FAF9F6] border border-stone-200/90 rounded-xl">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#8C2D19]" />
          <h3 className="font-serif font-bold text-sm text-stone-900">
            Deeper Classical Vivāha Factors (Beyond Aṣṭakūṭa)
          </h3>
        </div>
        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
          While Kūṭa Milan assesses lunar constitutional resonance, classical authorities
          (BPHS Ch. 80, Jātaka Pārijāta Ch. 14, Phaladīpikā Ch. 10, Jaimini Upadeśa Sūtras)
          mandate evaluating 7th Bhāva lords, natural significators (Śukra/Guru), Navāṃśa (D-9) dharmic harmony,
          Upapada Lagna, and Martian energetic equilibrium (Kuja Sāmya).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Kuja / Maṅgala Doṣa Balancement (Kuja Sāmya) */}
        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-600" />
              <h4 className="font-serif font-bold text-xs text-stone-900">
                Maṅgala / Kuja Doṣa Sāmya
              </h4>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                mangalaComparison.neutralizationStatus.includes('Sama') ||
                mangalaComparison.neutralizationStatus.includes('Free')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              {mangalaComparison.neutralizationStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
              <span className="text-[10px] font-mono text-stone-500 uppercase block">Groom</span>
              <p className="font-semibold text-stone-800">
                {mangalaComparison.groom.hasDosha ? 'Afflicted' : 'Clean'} ({mangalaComparison.groom.severity})
              </p>
              <p className="text-[11px] text-stone-600 mt-0.5">{mangalaComparison.groom.description}</p>
            </div>
            <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
              <span className="text-[10px] font-mono text-stone-500 uppercase block">Bride</span>
              <p className="font-semibold text-stone-800">
                {mangalaComparison.bride.hasDosha ? 'Afflicted' : 'Clean'} ({mangalaComparison.bride.severity})
              </p>
              <p className="text-[11px] text-stone-600 mt-0.5">{mangalaComparison.bride.description}</p>
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            {mangalaComparison.verdict}
          </p>

          <div className="pt-2 border-t border-stone-100 text-[10px] font-mono text-stone-500">
            Source: {mangalaComparison.citation.sanskritTextName} ({mangalaComparison.citation.chapterOrSection})
          </div>
        </div>

        {/* 2. 7th House & 7th Lord Relationship */}
        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#8C2D19]" />
              <h4 className="font-serif font-bold text-xs text-stone-900">
                7th Bhāva & Lord Conjugal Affinity
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-stone-100 text-stone-800 border border-stone-200">
              Displacement: {seventhHouseAffinity.signDisplacement}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
              <span className="text-[10px] font-mono text-stone-500 uppercase block">Groom 7th</span>
              <p className="font-semibold text-stone-800">
                Lord: {seventhHouseAffinity.groom7thLord}
              </p>
              <p className="text-[11px] text-stone-600">Sign: {RASHIS[seventhHouseAffinity.groom7thSign].sanskritName}</p>
            </div>
            <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
              <span className="text-[10px] font-mono text-stone-500 uppercase block">Bride 7th</span>
              <p className="font-semibold text-stone-800">
                Lord: {seventhHouseAffinity.bride7thLord}
              </p>
              <p className="text-[11px] text-stone-600">Sign: {RASHIS[seventhHouseAffinity.bride7thSign].sanskritName}</p>
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            {seventhHouseAffinity.verdict}
          </p>

          <div className="pt-2 border-t border-stone-100 text-[10px] font-mono text-stone-500">
            Source: {seventhHouseAffinity.citation.sanskritTextName} ({seventhHouseAffinity.citation.chapterOrSection})
          </div>
        </div>

        {/* 3. Navāṃśa (D-9) Dharmic Harmony */}
        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h4 className="font-serif font-bold text-xs text-stone-900">
                Navāṃśa (D-9) Spiritual & Dharmic Geometry
              </h4>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                navamshaHarmony.isTrikonaOrKendra
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-stone-100 text-stone-800 border border-stone-200'
              }`}
            >
              {navamshaHarmony.isTrikonaOrKendra ? 'Kendra / Trikona' : 'Neutral Axis'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
              <span className="text-[10px] font-mono text-stone-500 uppercase block">Groom D-9</span>
              <p className="font-semibold text-stone-800">
                Lagna: {RASHIS[navamshaHarmony.groomD9LagnaRashi].sanskritName}
              </p>
              <p className="text-[11px] text-stone-600">
                Moon: {RASHIS[navamshaHarmony.groomD9MoonRashi].sanskritName}
              </p>
            </div>
            <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
              <span className="text-[10px] font-mono text-stone-500 uppercase block">Bride D-9</span>
              <p className="font-semibold text-stone-800">
                Lagna: {RASHIS[navamshaHarmony.brideD9LagnaRashi].sanskritName}
              </p>
              <p className="text-[11px] text-stone-600">
                Moon: {RASHIS[navamshaHarmony.brideD9MoonRashi].sanskritName}
              </p>
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            {navamshaHarmony.verdict}
          </p>

          <div className="pt-2 border-t border-stone-100 text-[10px] font-mono text-stone-500">
            Source: {navamshaHarmony.citation.sanskritTextName} ({navamshaHarmony.citation.chapterOrSection})
          </div>
        </div>

        {/* 4. Jaimini Upapada Lagna & Dārakāraka */}
        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <h4 className="font-serif font-bold text-xs text-stone-900">
                Jaimini Upapada (UL) & Dārakāraka (DK)
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
              DK: {jaiminiKuta.mutualDKMaitri}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
              <span className="text-[10px] font-mono text-stone-500 uppercase block">Groom Jaimini</span>
              <p className="font-semibold text-stone-800">
                UL: {RASHIS[jaiminiKuta.groomULRashi].sanskritName}
              </p>
              <p className="text-[11px] text-stone-600">DK: {jaiminiKuta.groomDKPlanet}</p>
            </div>
            <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
              <span className="text-[10px] font-mono text-stone-500 uppercase block">Bride Jaimini</span>
              <p className="font-semibold text-stone-800">
                UL: {RASHIS[jaiminiKuta.brideULRashi].sanskritName}
              </p>
              <p className="text-[11px] text-stone-600">DK: {jaiminiKuta.brideDKPlanet}</p>
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            {jaiminiKuta.verdict}
          </p>

          <div className="pt-2 border-t border-stone-100 text-[10px] font-mono text-stone-500">
            Source: {jaiminiKuta.citation.sanskritTextName} ({jaiminiKuta.citation.chapterOrSection})
          </div>
        </div>

        {/* 5. Daśā Sandhi Risk */}
        <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-700" />
              <h4 className="font-serif font-bold text-xs text-stone-900">
                Vimśottarī Mahādaśā Rhythm & Daśā Sandhi
              </h4>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                dashaSandhi.isSandhiRisk
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {dashaSandhi.isSandhiRisk ? 'Concurrent Archetype' : 'Complementary Cycles'}
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            {dashaSandhi.explanation}
          </p>

          <div className="pt-2 border-t border-stone-100 text-[10px] font-mono text-stone-500">
            Source: {dashaSandhi.citation.sanskritTextName} ({dashaSandhi.citation.chapterOrSection})
          </div>
        </div>
      </div>
    </div>
  );
}

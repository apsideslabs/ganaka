'use client';

/**
 * Gaṇaka — Pañcāṅga Planetary Sphuṭas Layer (ग्रह स्फुट)
 * Exact sidereal planetary longitudes calculated for the chosen day at Sunrise.
 */

import React from 'react';
import type { PlanetId } from '@/lib/astronomy/ephemeris';
import { RASHIS, NAKSHATRAS } from '@/lib/jyotisha/constants';
import type { RashiNumber } from '@/lib/jyotisha/types';
import { toDMS } from '@/lib/astronomy/julian';
import { Compass } from 'lucide-react';
import type { AllPlanetsRecord } from './types';

interface PanchangaGrahaSpashtaProps {
  planets: AllPlanetsRecord;
  ayanamshaFormatted: string;
  jd?: number;
}

export function PanchangaGrahaSpashta({
  planets,
  ayanamshaFormatted,
}: PanchangaGrahaSpashtaProps) {
  const planetList: Array<{ id: PlanetId; label: string }> = [
    { id: 'sun', label: 'Sun (Sūrya • सूर्य)' },
    { id: 'moon', label: 'Moon (Candra • चन्द्र)' },
    { id: 'mars', label: 'Mars (Maṅgala • मङ्गल)' },
    { id: 'mercury', label: 'Mercury (Budha • बुध)' },
    { id: 'jupiter', label: 'Jupiter (Guru • गुरु)' },
    { id: 'venus', label: 'Venus (Śukra • शुक्र)' },
    { id: 'saturn', label: 'Saturn (Śani • शनि)' },
    { id: 'rahu', label: 'Rāhu (Mean • राहु)' },
    { id: 'ketu', label: 'Ketu (Mean • केतु)' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-1">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#8C2D19]" />
          <h3 className="font-serif font-bold text-base text-slate-900">
            Planetary Longitudes &amp; Sphuṭas (दैनिक ग्रह स्पष्ट)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Ayanāṃśa: {ayanamshaFormatted} • Geocentric Nirayana
        </span>
      </div>

      <div className="border border-slate-200/90 rounded-xl overflow-x-auto bg-white">
        <table className="w-full text-left text-xs border-collapse font-mono">
          <thead className="bg-slate-50 text-slate-900 font-serif border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 font-bold">Planet (Graha)</th>
              <th className="py-3 px-4 font-bold">Sidereal Longitude</th>
              <th className="py-3 px-4 font-bold">Rāśi (Zodiac Sign)</th>
              <th className="py-3 px-4 font-bold">Rāśi Degree</th>
              <th className="py-3 px-4 font-bold">Nakṣatra &amp; Pāda</th>
              <th className="py-3 px-4 font-bold">Motion</th>
              <th className="py-3 px-4 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {planetList.map((item) => {
              const p = planets[item.id];
              if (!p) return null;
              const rashiNum = ((Math.floor(p.siderealLongitude / 30) % 12) + 1) as RashiNumber;
              const rashi = RASHIS[rashiNum];
              const degInRashi = p.siderealLongitude % 30;
              const dms = toDMS(degInRashi);

              const nakSpan = 360 / 27;
              const nakIndex = Math.floor(p.siderealLongitude / nakSpan) % 27;
              const nak = NAKSHATRAS[nakIndex];
              const pada = Math.floor(((p.siderealLongitude % nakSpan) / nakSpan) * 4) + 1;

              const isSun = item.id === 'sun';
              const isMoon = item.id === 'moon';
              const sunLong = planets.sun?.siderealLongitude || 0;
              const diffFromSun = Math.abs(p.siderealLongitude - sunLong);
              const isCombust = !isSun && !isMoon && diffFromSun < 8.5;

              return (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-serif font-bold text-slate-900">
                    {item.label}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#8C2D19]">
                    {p.siderealLongitude.toFixed(4)}°
                  </td>
                  <td className="py-3 px-4 font-serif font-medium text-slate-800">
                    {rashi.name} ({rashi.sanskritName})
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {dms.degrees}° {dms.minutes}&apos; {dms.seconds.toFixed(0)}&quot;
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-serif font-medium text-slate-800">{nak.name}</span>{' '}
                    <span className="font-mono text-[#8C2D19] font-semibold">Pāda {pada}</span>
                  </td>
                  <td className="py-3 px-4">
                    {p.isRetrograde ? (
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-[10px] font-bold font-mono">
                        Vakrī (Retrograde)
                      </span>
                    ) : (
                      <span className="text-emerald-700 text-[10px] font-bold font-mono">Mārgī (Direct)</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {isCombust ? (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[10px] font-bold font-mono">
                        Asta (Combust)
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px] font-mono">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

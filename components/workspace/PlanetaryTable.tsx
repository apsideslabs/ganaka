'use client';

/**
 * Gaṇaka — Classical Planetary Positions & Dignities Table
 * High-precision sidereal longitudes, house placements, nakshatra padas,
 * dignities (Avasthās), daily motion speeds, retrogression, and aspect targets.
 */

import React from 'react';
import { CalculatedPlanet } from '../../lib/jyotisha/types';
import { PlanetId } from '../../lib/astronomy/ephemeris';
import { Table } from 'lucide-react';

interface PlanetaryTableProps {
  planets: Record<PlanetId, CalculatedPlanet>;
  onSelectPlanet?: (p: CalculatedPlanet) => void;
}

export const PlanetaryTable: React.FC<PlanetaryTableProps> = ({ planets, onSelectPlanet }) => {
  const grahaList = Object.values(planets);

  const getDignityStyle = (dignity: string) => {
    if (dignity.startsWith('Exalted') || dignity.includes('Ucca') || dignity.includes('Uchcha')) {
      return {
        backgroundColor: '#E8F5EF',
        borderColor: '#16845B',
        color: '#16845B',
      };
    }
    if (
      dignity.startsWith('Debilitated') ||
      dignity.includes('Neecha') ||
      dignity.startsWith('Enemy') ||
      dignity.startsWith('Great Enemy') ||
      dignity.includes('Shatru')
    ) {
      return {
        backgroundColor: '#FBECEC',
        borderColor: '#B54747',
        color: '#B54747',
      };
    }
    if (
      dignity.startsWith('Moolatrikona') ||
      dignity.startsWith('Own Sign') ||
      dignity.includes('Swakshetra') ||
      dignity.startsWith('Great Friend') ||
      dignity.startsWith('Friend') ||
      dignity.includes('Mitra')
    ) {
      return {
        backgroundColor: '#EDF3FC',
        borderColor: '#3B6FC4',
        color: '#3B6FC4',
      };
    }
    return {
      backgroundColor: '#F2F4F7',
      borderColor: '#667085',
      color: '#667085',
    };
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
            <Table className="w-5 h-5 text-[#8C2D19]" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-slate-900">
              Sphuṭa Graha Sthiti (Planetary Coordinates)
            </h3>
            <p className="text-xs text-slate-500">
              True Sidereal Longitudes, Dignities (Avasthās), Nakṣatra Padas, Daily Motion &amp; Aspect Rays
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 bg-white text-slate-700 border border-slate-200 rounded-lg shadow-2xs">
            9 Classical Grahas
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-serif border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Graha</th>
              <th className="py-3.5 px-4 font-semibold">Sidereal Longitude</th>
              <th className="py-3.5 px-4 font-semibold">Rāśi</th>
              <th className="py-3.5 px-4 text-center font-semibold">House</th>
              <th className="py-3.5 px-4 font-semibold">Nakṣatra &amp; Pada</th>
              <th className="py-3.5 px-4 font-semibold">Dignity (Avasthā)</th>
              <th className="py-3.5 px-4 text-right font-semibold">Speed (°/day)</th>
              <th className="py-3.5 px-4 text-center font-semibold">State</th>
              <th className="py-3.5 px-4 text-center font-semibold">Dṛṣṭi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans">
            {grahaList.map((p) => {
              return (
                <tr
                  key={p.id}
                  onClick={() => onSelectPlanet?.(p)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  {/* Planet Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-slate-900 text-sm">{p.sanskritName}</span>
                      <span className="text-xs text-slate-500 font-mono">({p.name})</span>
                    </div>
                  </td>

                  {/* Degree DMS */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                    {p.degreeStr}
                  </td>

                  {/* Rashi */}
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-900">{p.rashiName}</span>
                    <span className="text-[11px] text-slate-500 block font-mono">
                      {(p.longitudeInRashi).toFixed(2)}°
                    </span>
                  </td>

                  {/* House */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 font-mono font-bold text-slate-800 border border-slate-200/80 text-xs shadow-2xs">
                      H{p.house}
                    </span>
                  </td>

                  {/* Nakshatra & Pada */}
                  <td className="py-3.5 px-4">
                    <div className="text-slate-900 font-medium">{p.nakshatraName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Pada {p.pada} • Lord: <span className="uppercase font-semibold text-slate-800">{p.nakshatraLord}</span>
                    </div>
                  </td>

                  {/* Dignity */}
                  <td className="py-3.5 px-4">
                    {(() => {
                      const style = getDignityStyle(p.dignity);
                      return (
                        <span
                          style={{
                            backgroundColor: style.backgroundColor,
                            borderColor: style.borderColor,
                            color: style.color,
                          }}
                          className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border shadow-2xs"
                        >
                          {p.dignity}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Speed */}
                  <td className="py-3.5 px-4 font-mono text-right text-slate-600 font-medium">
                    {p.speed > 0 ? `+${p.speed}` : p.speed}
                  </td>

                  {/* State Badges (Retrograde / Combust) */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 font-mono">
                      {p.isRetrograde && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-md border border-amber-300 shadow-2xs" title="Vakra (Retrograde)">
                          (R)
                        </span>
                      )}
                      {p.isCombust && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-900 rounded-md border border-rose-300 shadow-2xs" title="Asta (Combust)">
                          (C)
                        </span>
                      )}
                      {!p.isRetrograde && !p.isCombust && (
                        <span className="text-[11px] text-slate-500">Direct</span>
                      )}
                    </div>
                  </td>

                  {/* Aspects */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-mono text-xs font-medium text-slate-700">
                      {p.aspectsToHouses.map((h) => `H${h}`).join(', ')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

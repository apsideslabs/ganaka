'use client';

/**
 * Gaṇaka — Classical Kuṇḍalī Chart Visualizer
 * Renders authentic North Indian (Diamond / Diamond-Kendra style)
 * and South Indian (Fixed 12-Rāśi box style) Kuṇḍalīs in vector SVG.
 */

import React, { useState, useMemo } from 'react';
import { PlanetId } from '../../lib/astronomy/ephemeris';
import { CalculatedPlanet, RashiNumber } from '../../lib/jyotisha/types';
import { RASHIS } from '../../lib/jyotisha/constants';
import { NorthIndianChart, ChartData, PlanetPosition } from '../../chart';

interface KundaliChartProps {
  lagnaRashi: RashiNumber;
  lagnaDegreeStr?: string;
  planets: Record<PlanetId, { rashiNumber: RashiNumber; degreeStr?: string; isRetrograde?: boolean; isCombust?: boolean }>;
  title?: string;
  subtitle?: string;
  style?: 'north' | 'south';
  size?: number;
  highlightHouse?: number;
  onHouseClick?: (houseNum: number) => void;
}

export const KundaliChart: React.FC<KundaliChartProps> = ({
  lagnaRashi,
  lagnaDegreeStr,
  planets,
  title = 'Rāśi Kuṇḍalī (D-1)',
  subtitle,
  style: initialStyle = 'north',
  size = 480,
  highlightHouse,
  onHouseClick,
}) => {
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>(initialStyle);

  // Parse degrees from DMS string
  const parseDegree = (degStr?: string): number => {
    if (!degStr) return 0;
    const match = degStr.match(/(\d+)[°\s]+(\d+)?/);
    if (match) {
      const deg = parseInt(match[1], 10) || 0;
      const min = parseInt(match[2] || '0', 10) || 0;
      return deg + min / 60;
    }
    const num = parseFloat(degStr);
    return isNaN(num) ? 0 : num;
  };

  // Convert to structured ChartData format for NorthIndianChartRenderer
  const structuredChartData: ChartData = useMemo(() => {
    const planetList: PlanetPosition[] = [];
    const planetNameMap: Record<PlanetId, string> = {
      sun: 'Sun',
      moon: 'Moon',
      mars: 'Mars',
      mercury: 'Mercury',
      jupiter: 'Jupiter',
      venus: 'Venus',
      saturn: 'Saturn',
      rahu: 'Rahu',
      ketu: 'Ketu',
      true_rahu: 'True Rahu',
      true_ketu: 'True Ketu',
    };

    for (const [pId, pData] of Object.entries(planets)) {
      if (pData && pData.rashiNumber) {
        planetList.push({
          name: planetNameMap[pId as PlanetId] || pId,
          sign: pData.rashiNumber,
          degree: parseDegree(pData.degreeStr),
          retrograde: !!pData.isRetrograde,
        });
      }
    }

    return {
      ascendant: {
        sign: lagnaRashi,
        degree: parseDegree(lagnaDegreeStr),
      },
      planets: planetList,
      title,
      subtitle,
    };
  }, [lagnaRashi, lagnaDegreeStr, planets, title, subtitle]);

  // Group planets by Rashi for South Indian chart
  const planetsByRashi: Record<RashiNumber, Array<{ id: PlanetId; label: string; isRetro: boolean; isComb: boolean }>> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
    10: [],
    11: [],
    12: [],
  };

  const shortNames: Record<PlanetId, string> = {
    sun: 'Su',
    moon: 'Mo',
    mars: 'Ma',
    mercury: 'Me',
    jupiter: 'Ju',
    venus: 'Ve',
    saturn: 'Sa',
    rahu: 'Ra',
    ketu: 'Ke',
    true_rahu: 'TRa',
    true_ketu: 'TKe',
  };

  for (const [pId, pData] of Object.entries(planets)) {
    if (pData && pData.rashiNumber) {
      planetsByRashi[pData.rashiNumber].push({
        id: pId as PlanetId,
        label: shortNames[pId as PlanetId] || pId,
        isRetro: !!pData.isRetrograde,
        isComb: !!pData.isCombust,
      });
    }
  }

  // Get Rashi for each House (1 to 12) in North Indian format
  const getHouseRashi = (h: number): RashiNumber => {
    return (((lagnaRashi - 1 + (h - 1)) % 12) + 1) as RashiNumber;
  };

  return (
    <div className="flex flex-col items-center bg-[#FAF7F0] border border-[#D8CEBA] rounded-lg p-4 shadow-xs w-full max-w-lg">
      <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-[#E6DEC8]">
        <div>
          <h4 className="text-sm font-serif font-bold text-[#171614] tracking-tight">{title}</h4>
          {subtitle && <p className="text-xs text-[#5C5850]">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1 bg-[#EDE8DC] p-0.5 rounded border border-[#D8CEBA]">
          <button
            type="button"
            onClick={() => setChartStyle('north')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
              chartStyle === 'north'
                ? 'bg-[#7A2D12] text-[#FAF7F0] shadow-2xs font-semibold'
                : 'text-[#5C5850] hover:text-[#171614]'
            }`}
          >
            North Indian
          </button>
          <button
            type="button"
            onClick={() => setChartStyle('south')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
              chartStyle === 'south'
                ? 'bg-[#7A2D12] text-[#FAF7F0] shadow-2xs font-semibold'
                : 'text-[#5C5850] hover:text-[#171614]'
            }`}
          >
            South Indian
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-square max-w-[440px] flex items-center justify-center">
        {chartStyle === 'north' ? (
          <NorthIndianSVG
            lagnaRashi={lagnaRashi}
            lagnaDegreeStr={lagnaDegreeStr}
            planetsByRashi={planetsByRashi}
            getHouseRashi={getHouseRashi}
            onHouseClick={onHouseClick}
          />
        ) : (
          <SouthIndianSVG
            lagnaRashi={lagnaRashi}
            planetsByRashi={planetsByRashi}
            onHouseClick={onHouseClick}
          />
        )}
      </div>

      <div className="mt-3 flex items-center justify-between w-full text-[11px] text-[#5C5850] px-1 font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[#7A2D12] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7A2D12]" /> Lagna (Asc)
          </span>
          <span className="text-[#A39882]">•</span>
          <span className="text-[#8B2F0B]">(R) Retrograde</span>
          <span className="text-[#A39882]">•</span>
          <span className="text-[#5C5850]">1–12 Rāśi</span>
        </div>
        <span className="text-[10px] text-[#7A7060]">Classical Geometry</span>
      </div>
    </div>
  );
};

/**
 * North Indian Diamond Chart SVG Component
 */
const NorthIndianSVG: React.FC<{
  lagnaRashi: RashiNumber;
  lagnaDegreeStr?: string;
  planetsByRashi: Record<RashiNumber, Array<{ id: PlanetId; label: string; isRetro: boolean; isComb: boolean }>>;
  getHouseRashi: (h: number) => RashiNumber;
  onHouseClick?: (h: number) => void;
}> = ({ lagnaRashi, lagnaDegreeStr, planetsByRashi, getHouseRashi, onHouseClick }) => {
  // House polygon definitions for 400x400 viewBox
  const housePolygons: Record<number, string> = {
    1: '200,0 300,100 200,200 100,100', // 1st House (Top Kendra)
    2: '0,0 200,0 100,100', // 2nd House
    3: '0,0 100,100 0,200', // 3rd House
    4: '0,200 100,100 200,200 100,300', // 4th House (Left Kendra)
    5: '0,200 100,300 0,400', // 5th House
    6: '0,400 100,300 200,400', // 6th House
    7: '200,200 300,300 200,400 100,300', // 7th House (Bottom Kendra)
    8: '200,400 300,300 400,400', // 8th House
    9: '300,300 400,200 400,400', // 9th House
    10: '200,200 300,100 400,200 300,300', // 10th House (Right Kendra)
    11: '300,100 400,0 400,200', // 11th House
    12: '200,0 400,0 300,100', // 12th House
  };

  // Center coordinates for planet text per house
  const houseCenters: Record<number, { x: number; y: number; rashiPos: { x: number; y: number } }> = {
    1: { x: 200, y: 110, rashiPos: { x: 200, y: 55 } },
    2: { x: 100, y: 45, rashiPos: { x: 100, y: 25 } },
    3: { x: 45, y: 100, rashiPos: { x: 25, y: 100 } },
    4: { x: 110, y: 200, rashiPos: { x: 55, y: 200 } },
    5: { x: 45, y: 300, rashiPos: { x: 25, y: 300 } },
    6: { x: 100, y: 355, rashiPos: { x: 100, y: 375 } },
    7: { x: 200, y: 290, rashiPos: { x: 200, y: 345 } },
    8: { x: 300, y: 355, rashiPos: { x: 300, y: 375 } },
    9: { x: 355, y: 300, rashiPos: { x: 375, y: 300 } },
    10: { x: 290, y: 200, rashiPos: { x: 345, y: 200 } },
    11: { x: 355, y: 100, rashiPos: { x: 375, y: 100 } },
    12: { x: 300, y: 45, rashiPos: { x: 300, y: 25 } },
  };

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full select-none">
      {/* Outer Border & Grid */}
      <rect x="2" y="2" width="396" height="396" fill="#FDFBF7" stroke="#A49277" strokeWidth="2.5" rx="4" />

      {/* House polygons with hover */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
        const rashi = getHouseRashi(h);
        const planets = planetsByRashi[rashi] || [];
        const isKendra = [1, 4, 7, 10].includes(h);

        return (
          <g key={h} className="cursor-pointer group" onClick={() => onHouseClick?.(h)}>
            <polygon
              points={housePolygons[h]}
              fill={isKendra ? '#F8F4EC' : '#FDFBF7'}
              stroke="#B3A288"
              strokeWidth="1.2"
              className="group-hover:fill-[#EFE8D8] transition-colors"
            />
          </g>
        );
      })}

      {/* Diagonal and Cross Internal Structural Lines */}
      <line x1="0" y1="0" x2="400" y2="400" stroke="#9C896E" strokeWidth="1.8" />
      <line x1="400" y1="0" x2="0" y2="400" stroke="#9C896E" strokeWidth="1.8" />
      <polygon points="200,0 400,200 200,400 0,200" fill="none" stroke="#9C896E" strokeWidth="1.8" />

      {/* House Numbers / Rashi Numbers and Planets */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
        const rashi = getHouseRashi(h);
        const center = houseCenters[h];
        const planets = planetsByRashi[rashi] || [];

        return (
          <g key={h}>
            {/* Rashi Number in small classical font */}
            <text
              x={center.rashiPos.x}
              y={center.rashiPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[11px] font-serif font-bold fill-[#80705A]"
            >
              {rashi}
            </text>

            {/* Lagna Label in House 1 */}
            {h === 1 && (
              <text
                x="200"
                y="85"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[11px] font-sans font-bold fill-[#8B2500] tracking-wider"
              >
                Asc / ल {lagnaDegreeStr ? `(${lagnaDegreeStr.split(' ')[0]})` : ''}
              </text>
            )}

            {/* Render Planets */}
            {planets.map((p, idx) => {
              const total = planets.length;
              const yOffset = h === 1 ? 105 + idx * 16 : center.y - (total * 8) + idx * 16 + 8;

              return (
                <text
                  key={p.id}
                  x={center.x}
                  y={yOffset}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-[11px] font-sans font-semibold ${
                    p.isRetro ? 'fill-[#8B0000]' : p.isComb ? 'fill-[#B8860B]' : 'fill-[#241F18]'
                  }`}
                >
                  {p.label}
                  {p.isRetro && <tspan className="text-[9px] font-bold fill-[#8B0000]"> (R)</tspan>}
                  {p.isComb && <tspan className="text-[9px] font-bold fill-[#B8860B]"> (C)</tspan>}
                </text>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
};

/**
 * South Indian Fixed-Rashi Chart SVG Component
 */
const SouthIndianSVG: React.FC<{
  lagnaRashi: RashiNumber;
  planetsByRashi: Record<RashiNumber, Array<{ id: PlanetId; label: string; isRetro: boolean; isComb: boolean }>>;
  onHouseClick?: (h: number) => void;
}> = ({ lagnaRashi, planetsByRashi, onHouseClick }) => {
  // South Indian box coordinates (4x4 grid, center 2x2 empty):
  // 12 (Pisces): (0,0), 1 (Aries): (1,0), 2 (Taurus): (2,0), 3 (Gemini): (3,0)
  // 11 (Aquarius): (0,1),                                     4 (Cancer): (3,1)
  // 10 (Capr): (0,2),                                         5 (Leo): (3,2)
  // 9 (Sagit): (0,3), 8 (Scorp): (1,3), 7 (Libra): (2,3), 6 (Virgo): (3,3)
  const rashiGridPositions: Record<RashiNumber, { col: number; row: number }> = {
    12: { col: 0, row: 0 },
    1: { col: 1, row: 0 },
    2: { col: 2, row: 0 },
    3: { col: 3, row: 0 },
    4: { col: 3, row: 1 },
    5: { col: 3, row: 2 },
    6: { col: 3, row: 3 },
    7: { col: 2, row: 3 },
    8: { col: 1, row: 3 },
    9: { col: 0, row: 3 },
    10: { col: 0, row: 2 },
    11: { col: 0, row: 1 },
  };

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full select-none">
      <rect x="2" y="2" width="396" height="396" fill="#FDFBF7" stroke="#A49277" strokeWidth="2.5" rx="4" />

      {/* Grid Lines */}
      {/* Horizontals */}
      <line x1="0" y1="100" x2="400" y2="100" stroke="#B3A288" strokeWidth="1.5" />
      <line x1="0" y1="300" x2="400" y2="300" stroke="#B3A288" strokeWidth="1.5" />
      <line x1="0" y1="200" x2="100" y2="200" stroke="#B3A288" strokeWidth="1.5" />
      <line x1="300" y1="200" x2="400" y2="200" stroke="#B3A288" strokeWidth="1.5" />

      {/* Verticals */}
      <line x1="100" y1="0" x2="100" y2="400" stroke="#B3A288" strokeWidth="1.5" />
      <line x1="300" y1="0" x2="300" y2="400" stroke="#B3A288" strokeWidth="1.5" />
      <line x1="200" y1="0" x2="200" y2="100" stroke="#B3A288" strokeWidth="1.5" />
      <line x1="200" y1="300" x2="200" y2="400" stroke="#B3A288" strokeWidth="1.5" />

      {/* Center Box Details */}
      <rect x="102" y="102" width="196" height="196" fill="#F6F1E5" />
      <text x="200" y="185" textAnchor="middle" className="text-sm font-serif font-bold fill-[#4A3F2C]">
        Rāśi Cakra
      </text>
      <text x="200" y="210" textAnchor="middle" className="text-xs font-sans fill-[#80705A]">
        South Indian Format
      </text>

      {/* Render 12 Rashis */}
      {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as RashiNumber[]).map((rashiNum) => {
        const grid = rashiGridPositions[rashiNum];
        const x = grid.col * 100;
        const y = grid.row * 100;
        const isLagna = rashiNum === lagnaRashi;
        const planets = planetsByRashi[rashiNum] || [];

        return (
          <g key={rashiNum} className="cursor-pointer" onClick={() => onHouseClick?.(rashiNum)}>
            {isLagna && (
              <line
                x1={x}
                y1={y}
                x2={x + 100}
                y2={y + 100}
                stroke="#8B2500"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            )}

            {/* Rashi Name / Sanskrit Tag */}
            <text
              x={x + 8}
              y={y + 16}
              className="text-[10px] font-serif font-bold fill-[#857662]"
            >
              {RASHIS[rashiNum].sanskritName}
            </text>

            {isLagna && (
              <text
                x={x + 92}
                y={y + 16}
                textAnchor="end"
                className="text-[10px] font-sans font-bold fill-[#8B2500]"
              >
                ASC / ल
              </text>
            )}

            {/* Planets in this Rashi */}
            {planets.map((p, idx) => (
              <text
                key={p.id}
                x={x + 50}
                y={y + 36 + idx * 16}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-[11px] font-sans font-semibold ${
                  p.isRetro ? 'fill-[#8B0000]' : p.isComb ? 'fill-[#B8860B]' : 'fill-[#241F18]'
                }`}
              >
                {p.label}
                {p.isRetro && <tspan className="text-[9px] font-bold fill-[#8B0000]"> (R)</tspan>}
                {p.isComb && <tspan className="text-[9px] font-bold fill-[#B8860B]"> (C)</tspan>}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
};

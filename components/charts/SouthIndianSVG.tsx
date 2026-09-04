'use client';

/**
 * Gaṇaka — South Indian (Fixed 12-Rāśi Box) Kuṇḍalī Vector SVG
 * Precise 4x4 matrix geometry with boundary containment clip-paths
 * and non-colliding stellium placement (handles up to 9 planets in a single box).
 */

import React from 'react';
import { RashiNumber } from '../../lib/jyotisha/types';
import { ChartPlanetItem, RASHI_DATA, getHouseForRashi } from './chartLayoutUtils';

interface SouthIndianSVGProps {
  lagnaRashi: RashiNumber;
  lagnaDegreeStr?: string;
  planetsByRashi: Record<RashiNumber, ChartPlanetItem[]>;
  highlightHouse?: number;
  onHouseClick?: (houseNum: number) => void;
  showDegrees?: boolean;
  svgRef?: React.Ref<SVGSVGElement>;
}

export const SouthIndianSVG: React.FC<SouthIndianSVGProps> = ({
  lagnaRashi,
  lagnaDegreeStr,
  planetsByRashi,
  highlightHouse,
  onHouseClick,
  showDegrees = false,
  svgRef,
}) => {
  // South Indian box coordinates (4x4 matrix, 150px per cell):
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

  /**
   * Adaptive Non-Colliding Layout for South Indian cells (150x150px).
   * Generates exact coordinates within the cell safely between y: 38 and y: 136.
   */
  const getPlanetCellPositions = (
    bx: number,
    by: number,
    count: number
  ): Array<{ x: number; y: number }> => {
    if (count === 0) return [];

    if (count === 1) {
      return [{ x: bx + 75, y: by + 86 }];
    }
    if (count === 2) {
      return [
        { x: bx + 75, y: by + 68 },
        { x: bx + 75, y: by + 104 },
      ];
    }
    if (count === 3) {
      return [
        { x: bx + 75, y: by + 58 },
        { x: bx + 75, y: by + 86 },
        { x: bx + 75, y: by + 114 },
      ];
    }
    if (count === 4) {
      return [
        { x: bx + 42, y: by + 68 },
        { x: bx + 108, y: by + 68 },
        { x: bx + 42, y: by + 105 },
        { x: bx + 108, y: by + 105 },
      ];
    }
    if (count <= 6) {
      return [
        { x: bx + 42, y: by + 58 },
        { x: bx + 108, y: by + 58 },
        { x: bx + 42, y: by + 86 },
        { x: bx + 108, y: by + 86 },
        { x: bx + 42, y: by + 114 },
        { x: bx + 108, y: by + 114 },
      ].slice(0, count);
    }

    // 7 to 9 planets (Stellium in South Indian cell!)
    // 2 columns with up to 4-5 compact rows, strictly staying above by+135
    return [
      { x: bx + 42, y: by + 48 },
      { x: bx + 108, y: by + 48 },
      { x: bx + 42, y: by + 70 },
      { x: bx + 108, y: by + 70 },
      { x: bx + 42, y: by + 92 },
      { x: bx + 108, y: by + 92 },
      { x: bx + 42, y: by + 114 },
      { x: bx + 108, y: by + 114 },
      { x: bx + 75, y: by + 132 },
    ].slice(0, count);
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 600 600"
      className="w-full h-full select-none"
      style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision' }}
    >
      <defs>
        {/* Clip paths for all 12 boxes with 2px inner inset */}
        {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as RashiNumber[]).map((r) => {
          const grid = rashiGridPositions[r];
          return (
            <clipPath key={`clip-si-${r}`} id={`clip-si-${r}`}>
              <rect
                x={grid.col * 150 + 2}
                y={grid.row * 150 + 2}
                width={146}
                height={146}
              />
            </clipPath>
          );
        })}
      </defs>

      {/* Base Canvas */}
      <rect
        x="3"
        y="3"
        width="594"
        height="594"
        fill="#FCFBF8"
        stroke="#94836B"
        strokeWidth="3"
        rx="4"
      />

      {/* Center 2x2 Box (300x300) with classical Medallion */}
      <rect x="150" y="150" width="300" height="300" fill="#FAF6EE" stroke="#B3A188" strokeWidth="1.6" />
      <circle cx="300" cy="300" r="110" fill="#F4EDE0" stroke="#D1C4AF" strokeWidth="1.2" strokeDasharray="4 2" />

      <text x="300" y="270" textAnchor="middle" fill="#3E3427" className="text-[17px] font-serif font-bold">
        Rāśi Cakra
      </text>
      <text x="300" y="295" textAnchor="middle" fill="#756754" className="text-[11.5px] font-sans font-medium">
        South Indian Format (Fixed Rāśi)
      </text>
      <text x="300" y="325" textAnchor="middle" fill="#8C2D19" className="text-[11px] font-mono font-semibold">
        Lagna: {RASHI_DATA[lagnaRashi].sanskrit} ({RASHI_DATA[lagnaRashi].english})
      </text>
      {lagnaDegreeStr && (
        <text x="300" y="342" textAnchor="middle" fill="#9C8B76" className="text-[10px] font-mono">
          {lagnaDegreeStr}
        </text>
      )}

      {/* Grid Lines */}
      {/* Horizontal grid lines */}
      <line x1="0" y1="150" x2="600" y2="150" stroke="#B3A188" strokeWidth="1.6" />
      <line x1="0" y1="450" x2="600" y2="450" stroke="#B3A188" strokeWidth="1.6" />
      <line x1="0" y1="300" x2="150" y2="300" stroke="#B3A188" strokeWidth="1.6" />
      <line x1="450" y1="300" x2="600" y2="300" stroke="#B3A188" strokeWidth="1.6" />

      {/* Vertical grid lines */}
      <line x1="150" y1="0" x2="150" y2="600" stroke="#B3A188" strokeWidth="1.6" />
      <line x1="450" y1="0" x2="450" y2="600" stroke="#B3A188" strokeWidth="1.6" />
      <line x1="300" y1="0" x2="300" y2="150" stroke="#B3A188" strokeWidth="1.6" />
      <line x1="300" y1="450" x2="300" y2="600" stroke="#B3A188" strokeWidth="1.6" />

      {/* 12 Outer Rashi Cells */}
      {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as RashiNumber[]).map((rashiNum) => {
        const grid = rashiGridPositions[rashiNum];
        const bx = grid.col * 150;
        const by = grid.row * 150;
        const isLagna = rashiNum === lagnaRashi;
        const houseNum = getHouseForRashi(rashiNum, lagnaRashi);
        const isSelected = highlightHouse === houseNum;
        const occupants = planetsByRashi[rashiNum] || [];
        const positions = getPlanetCellPositions(bx, by, occupants.length);
        const fontSizeClass = occupants.length >= 6 ? 'text-[10px]' : occupants.length >= 4 ? 'text-[11px]' : 'text-[12px]';

        return (
          <g
            key={`cell-${rashiNum}`}
            className="cursor-pointer"
            onClick={() => onHouseClick?.(houseNum)}
          >
            {/* Cell Highlight background on hover or selection */}
            {isSelected && (
              <rect x={bx + 2} y={by + 2} width={146} height={146} fill="#EDE4D1" />
            )}

            {/* Lagna Diagonal Cross Slash in South Indian Tradition */}
            {isLagna && (
              <g>
                <line
                  x1={bx + 2}
                  y1={by + 2}
                  x2={bx + 148}
                  y2={by + 148}
                  stroke="#8C2D19"
                  strokeWidth="1.6"
                  strokeDasharray="4 2"
                  opacity={0.7}
                />
              </g>
            )}

            {/* Clipped content */}
            <g clipPath={`url(#clip-si-${rashiNum})`}>
              {/* Header: Rashi Name & Sign Number */}
              <text
                x={bx + 10}
                y={by + 18}
                fill="#6B5C49"
                className="text-[11px] font-serif font-bold"
              >
                {RASHI_DATA[rashiNum].sanskrit} <tspan className="text-[10px] font-sans font-normal text-[#8A7963]">({rashiNum})</tspan>
              </text>

              {/* Right: House Number & Lagna Badge */}
              <text
                x={bx + 140}
                y={by + 18}
                textAnchor="end"
                className={`text-[10px] font-mono font-bold ${
                  isLagna ? 'fill-[#8C2D19]' : 'fill-[#9C8B76]'
                }`}
              >
                {isLagna ? 'ASC / H1' : `H${houseNum}`}
              </text>

              {/* Render Occupant Planets */}
              {occupants.map((p, idx) => {
                const pos = positions[idx] || { x: bx + 75, y: by + 86 };

                return (
                  <g key={p.id}>
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`${fontSizeClass} font-sans font-bold ${
                        p.isRetro ? 'fill-[#8B0000]' : p.isComb ? 'fill-[#B45309]' : 'fill-[#1C1814]'
                      }`}
                    >
                      {p.label}
                      {p.isRetro && (
                        <tspan className="text-[9px] font-bold fill-[#8B0000]"> (R)</tspan>
                      )}
                      {p.isComb && (
                        <tspan className="text-[9px] font-bold fill-[#B45309]"> (C)</tspan>
                      )}
                      {showDegrees && p.degreeStr && (
                        <tspan className="text-[8.5px] font-mono font-normal fill-[#786E61]">
                          {' '}
                          {p.degreeStr.split(' ')[0]}
                        </tspan>
                      )}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        );
      })}
    </svg>
  );
};

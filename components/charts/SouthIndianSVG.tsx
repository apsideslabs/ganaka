'use client';

/**
 * Gaṇaka — South Indian (Fixed 12-Rāśi Box) Kuṇḍalī Vector SVG
 * Precise 4x4 matrix geometry with boundary containment clip-paths
 * and non-colliding stellium placement (handles up to 9 planets in a single box).
 */

import React from 'react';
import { RashiNumber } from '../../lib/jyotisha/types';
import { ChartPlanetItem, RASHI_DATA, getHouseForRashi, GRAHA_COLOR_MAP } from './chartLayoutUtils';

interface SouthIndianSVGProps {
  lagnaRashi: RashiNumber;
  lagnaDegreeStr?: string;
  planetsByRashi: Record<RashiNumber, ChartPlanetItem[]>;
  highlightHouse?: number;
  onHouseClick?: (houseNum: number) => void;
  showDegrees?: boolean;
  svgRef?: React.Ref<SVGSVGElement>;
  centerTitle?: string;
  centerSubtitle?: string;
}

export const SouthIndianSVG: React.FC<SouthIndianSVGProps> = ({
  lagnaRashi,
  lagnaDegreeStr,
  planetsByRashi,
  highlightHouse,
  onHouseClick,
  showDegrees = false,
  svgRef,
  centerTitle,
  centerSubtitle,
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
      // Required for a standalone export: without the namespace a saved .svg is
      // not recognised as SVG by strict parsers (cairosvg, Illustrator, print
      // pipelines), and every label renders as tofu boxes.
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 600"
      className="w-full h-full select-none"
      // textRendering:geometricPrecision disables font shaping in several SVG
      // consumers, which is the other half of the tofu problem on export.
      style={{ shapeRendering: 'geometricPrecision' }}
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
        x="2"
        y="2"
        width="596"
        height="596"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth="2.5"
        rx="6"
      />

      {/* Center 2x2 Box (300x300) with modern clean summary card */}
      <rect x="150" y="150" width="300" height="300" fill="#F8FAFC" stroke="#334155" strokeWidth="1.8" />
      <circle cx="300" cy="300" r="110" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="4 3" />

      <text x="300" y="268" textAnchor="middle" dominantBaseline="central" fill="#0F172A" fontSize="17" fontFamily="Georgia, serif" fontWeight="700">
        {centerTitle || 'Rāśi Cakra'}
      </text>
      <text x="300" y="292" textAnchor="middle" dominantBaseline="central" fill="#475569" fontSize="12" fontFamily="system-ui, sans-serif" fontWeight="500">
        {centerSubtitle || 'South Indian Format (Fixed Rāśi)'}
      </text>
      <text x="300" y="320" textAnchor="middle" dominantBaseline="central" fill="#8C2D19" fontSize="12" fontFamily="ui-monospace, monospace" fontWeight="700">
        Lagna: {RASHI_DATA[lagnaRashi].sanskrit} ({RASHI_DATA[lagnaRashi].english})
      </text>
      {lagnaDegreeStr && (
        <text x="300" y="340" textAnchor="middle" dominantBaseline="central" fill="#64748B" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="500">
          {lagnaDegreeStr}
        </text>
      )}

      {/* Grid Lines - High-Contrast Slate */}
      {/* Horizontal grid lines */}
      <line x1="0" y1="150" x2="600" y2="150" stroke="#334155" strokeWidth="1.8" />
      <line x1="0" y1="450" x2="600" y2="450" stroke="#334155" strokeWidth="1.8" />
      <line x1="0" y1="300" x2="150" y2="300" stroke="#334155" strokeWidth="1.8" />
      <line x1="450" y1="300" x2="600" y2="300" stroke="#334155" strokeWidth="1.8" />

      {/* Vertical grid lines */}
      <line x1="150" y1="0" x2="150" y2="600" stroke="#334155" strokeWidth="1.8" />
      <line x1="450" y1="0" x2="450" y2="600" stroke="#334155" strokeWidth="1.8" />
      <line x1="300" y1="0" x2="300" y2="150" stroke="#334155" strokeWidth="1.8" />
      <line x1="300" y1="450" x2="300" y2="600" stroke="#334155" strokeWidth="1.8" />

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
        const planetFontSize = occupants.length >= 7 ? 11 : occupants.length >= 5 ? 12.5 : occupants.length >= 3 ? 14 : occupants.length === 2 ? 15 : 17;

        return (
          <g
            key={`cell-${rashiNum}`}
            className="cursor-pointer"
            onClick={() => onHouseClick?.(houseNum)}
          >
            {/* Cell Highlight background on hover or selection */}
            {isSelected && (
              <rect x={bx + 2} y={by + 2} width={146} height={146} fill="#EFF6FF" />
            )}

            {/* Lagna Diagonal Cross Slash in South Indian Tradition */}
            {isLagna && (
              <g>
                <line
                  x1={bx + 2}
                  y1={by + 2}
                  x2={bx + 148}
                  y2={by + 148}
                  stroke="#DC2626"
                  strokeWidth="2.2"
                  strokeDasharray="5 3"
                  opacity={0.85}
                />
              </g>
            )}

            {/* Clipped content */}
            <g clipPath={`url(#clip-si-${rashiNum})`}>
              {/* Header: Rashi Name & Sign Number */}
              <text
                x={bx + 10}
                y={by + 18}
                dominantBaseline="central"
                fill="#334155"
                fontSize="12" fontFamily="Georgia, serif" fontWeight="700"
              >
                {RASHI_DATA[rashiNum].sanskrit}
                <tspan fontSize="14" fontFamily="Georgia, serif" fontWeight="700" fill="#334155">
                  {' '}{rashiNum}
                </tspan>
              </text>

              {/* Right: House Number & Lagna Badge */}
              <text
                x={bx + 140}
                y={by + 18}
                textAnchor="end"
                dominantBaseline="central"
                className={`text-[11px] font-mono font-bold ${
                  isLagna ? 'fill-[#DC2626]' : 'fill-[#8A8175]'
                }`}
              >
                {isLagna ? 'ASC' : `H${houseNum}`}
              </text>

              {/* Render Occupant Planets - High-Contrast & Bold */}
              {occupants.map((p, idx) => {
                const pos = positions[idx] || { x: bx + 75, y: by + 86 };
                const colorSpec = GRAHA_COLOR_MAP[p.id];
                const planetFill = p.isRetro ? '#DC2626' : colorSpec?.text || (p.isComb ? '#D97706' : '#0F172A');

                return (
                  <g key={p.id}>
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      fontSize={planetFontSize}
                      fontWeight="700"
                      fill={planetFill}
                      stroke="#FFFFFF"
                      strokeWidth={2.5}
                      strokeLinejoin="round"
                      paintOrder="stroke fill"
                    >
                      {p.label}
                      {p.isRetro && (
                        <tspan fill="#DC2626" fontWeight="700" fontSize={Math.max(8, planetFontSize - 5)} dy="-4">
                          {'R'}
                        </tspan>
                      )}
                      {p.isComb && (
                        <tspan fill="#D97706" fontWeight="700" fontSize={Math.max(8, planetFontSize - 5)} dy="-4">
                          {'C'}
                        </tspan>
                      )}
                      {showDegrees && p.degreeStr && (
                        <tspan fill="#475569" fontWeight="600" fontSize={Math.max(9.5, planetFontSize - 3.5)}>
                          {' '}{p.degreeStr.split(' ')[0]}
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

'use client';

/**
 * Gaṇaka — North Indian (Diamond / Kendra) Kuṇḍalī Vector SVG
 * Precise geometric layout with boundary containment clip-paths
 * and non-colliding stellium placement (handles up to 9 planets in a single house).
 */

import React from 'react';
import { RashiNumber } from '../../lib/jyotisha/types';
import { ChartPlanetItem, RASHI_DATA, GRAHA_COLOR_MAP } from './chartLayoutUtils';

interface NorthIndianSVGProps {
  lagnaRashi: RashiNumber;
  lagnaDegreeStr?: string;
  planetsByHouse: Record<number, ChartPlanetItem[]>;
  highlightHouse?: number;
  onHouseClick?: (houseNum: number) => void;
  showDegrees?: boolean;
  svgRef?: React.Ref<SVGSVGElement>;
}

export const NorthIndianSVG: React.FC<NorthIndianSVGProps> = ({
  lagnaRashi,
  lagnaDegreeStr,
  planetsByHouse,
  highlightHouse,
  onHouseClick,
  showDegrees = false,
  svgRef,
}) => {
  // House polygon vertices in 600x600 viewBox
  const housePolygons: Record<number, string> = {
    1: '300,0 450,150 300,300 150,150', // Top Kendra
    2: '0,0 300,0 150,150', // Top-Left Triangle
    3: '0,0 150,150 0,300', // Left-Top Triangle
    4: '0,300 150,150 300,300 150,450', // Left Kendra
    5: '0,300 150,450 0,600', // Left-Bottom Triangle
    6: '0,600 150,450 300,600', // Bottom-Left Triangle
    7: '300,300 450,450 300,600 150,450', // Bottom Kendra
    8: '300,600 450,450 600,600', // Bottom-Right Triangle
    9: '450,450 600,300 600,600', // Right-Bottom Triangle
    10: '300,300 450,150 600,300 450,450', // Right Kendra
    11: '450,150 600,0 600,300', // Right-Top Triangle
    12: '300,0 600,0 450,150', // Top-Right Triangle
  };

  // Sign number position (placed near an inner corner to maximize open room for planets)
  const signNumberPositions: Record<number, { x: number; y: number }> = {
    1: { x: 300, y: 250 },
    2: { x: 150, y: 130 },
    3: { x: 120, y: 150 },
    4: { x: 250, y: 300 },
    5: { x: 120, y: 450 },
    6: { x: 150, y: 470 },
    7: { x: 300, y: 350 },
    8: { x: 450, y: 470 },
    9: { x: 480, y: 450 },
    10: { x: 350, y: 300 },
    11: { x: 480, y: 150 },
    12: { x: 450, y: 130 },
  };

  // House label badge (e.g. "H1") position
  const houseLabelPositions: Record<number, { x: number; y: number }> = {
    1: { x: 300, y: 270 },
    2: { x: 150, y: 18 },
    3: { x: 18, y: 150 },
    4: { x: 270, y: 300 },
    5: { x: 18, y: 450 },
    6: { x: 150, y: 585 },
    7: { x: 300, y: 330 },
    8: { x: 450, y: 585 },
    9: { x: 582, y: 450 },
    10: { x: 330, y: 300 },
    11: { x: 582, y: 150 },
    12: { x: 450, y: 18 },
  };

  /**
   * Adaptive Non-Colliding Layout Engine for North Indian houses.
   * Computes exact {x, y} coordinates for each planet in a given house.
   * Handles 1 to 9 planets without ever crossing boundary lines.
   */
  const getPlanetPositions = (house: number, count: number): Array<{ x: number; y: number }> => {
    if (count === 0) return [];

    // --- 1. Diamond Kendra Houses (1, 4, 7, 10) ---
    if (house === 1) {
      // Top Kendra: Lagna tag is at top y=55; sign number is at y=250.
      // Usable central diamond zone: x: 230 to 370, y: 100 to 215.
      if (count === 1) return [{ x: 300, y: 150 }];
      if (count === 2) return [{ x: 300, y: 125 }, { x: 300, y: 175 }];
      if (count === 3) return [{ x: 300, y: 110 }, { x: 300, y: 150 }, { x: 300, y: 190 }];
      if (count === 4) {
        return [
          { x: 260, y: 130 }, { x: 340, y: 130 },
          { x: 260, y: 170 }, { x: 340, y: 170 },
        ];
      }
      if (count <= 6) {
        return [
          { x: 260, y: 115 }, { x: 340, y: 115 },
          { x: 260, y: 150 }, { x: 340, y: 150 },
          { x: 260, y: 185 }, { x: 340, y: 185 },
        ].slice(0, count);
      }
      // 7 to 9 planets (Stellium in Lagna!)
      return [
        { x: 245, y: 115 }, { x: 300, y: 115 }, { x: 355, y: 115 },
        { x: 245, y: 150 }, { x: 300, y: 150 }, { x: 355, y: 150 },
        { x: 245, y: 185 }, { x: 300, y: 185 }, { x: 355, y: 185 },
      ].slice(0, count);
    }

    if (house === 4) {
      // Left Kendra: Center is (150, 300).
      if (count === 1) return [{ x: 150, y: 300 }];
      if (count === 2) return [{ x: 150, y: 275 }, { x: 150, y: 325 }];
      if (count === 3) return [{ x: 150, y: 260 }, { x: 150, y: 300 }, { x: 150, y: 340 }];
      if (count === 4) {
        return [
          { x: 115, y: 280 }, { x: 185, y: 280 },
          { x: 115, y: 320 }, { x: 185, y: 320 },
        ];
      }
      if (count <= 6) {
        return [
          { x: 115, y: 265 }, { x: 185, y: 265 },
          { x: 115, y: 300 }, { x: 185, y: 300 },
          { x: 115, y: 335 }, { x: 185, y: 335 },
        ].slice(0, count);
      }
      return [
        { x: 95, y: 265 }, { x: 150, y: 265 }, { x: 205, y: 265 },
        { x: 95, y: 300 }, { x: 150, y: 300 }, { x: 205, y: 300 },
        { x: 95, y: 335 }, { x: 150, y: 335 }, { x: 205, y: 335 },
      ].slice(0, count);
    }

    if (house === 7) {
      // Bottom Kendra: Center is (300, 450).
      if (count === 1) return [{ x: 300, y: 450 }];
      if (count === 2) return [{ x: 300, y: 425 }, { x: 300, y: 475 }];
      if (count === 3) return [{ x: 300, y: 410 }, { x: 300, y: 450 }, { x: 300, y: 490 }];
      if (count === 4) {
        return [
          { x: 260, y: 430 }, { x: 340, y: 430 },
          { x: 260, y: 470 }, { x: 340, y: 470 },
        ];
      }
      if (count <= 6) {
        return [
          { x: 260, y: 415 }, { x: 340, y: 415 },
          { x: 260, y: 450 }, { x: 340, y: 450 },
          { x: 260, y: 485 }, { x: 340, y: 485 },
        ].slice(0, count);
      }
      return [
        { x: 245, y: 415 }, { x: 300, y: 415 }, { x: 355, y: 415 },
        { x: 245, y: 450 }, { x: 300, y: 450 }, { x: 355, y: 450 },
        { x: 245, y: 485 }, { x: 300, y: 485 }, { x: 355, y: 485 },
      ].slice(0, count);
    }

    if (house === 10) {
      // Right Kendra: Center is (450, 300).
      if (count === 1) return [{ x: 450, y: 300 }];
      if (count === 2) return [{ x: 450, y: 275 }, { x: 450, y: 325 }];
      if (count === 3) return [{ x: 450, y: 260 }, { x: 450, y: 300 }, { x: 450, y: 340 }];
      if (count === 4) {
        return [
          { x: 415, y: 280 }, { x: 485, y: 280 },
          { x: 415, y: 320 }, { x: 485, y: 320 },
        ];
      }
      if (count <= 6) {
        return [
          { x: 415, y: 265 }, { x: 485, y: 265 },
          { x: 415, y: 300 }, { x: 485, y: 300 },
          { x: 415, y: 335 }, { x: 485, y: 335 },
        ].slice(0, count);
      }
      return [
        { x: 395, y: 265 }, { x: 450, y: 265 }, { x: 505, y: 265 },
        { x: 395, y: 300 }, { x: 450, y: 300 }, { x: 505, y: 300 },
        { x: 395, y: 335 }, { x: 450, y: 335 }, { x: 505, y: 335 },
      ].slice(0, count);
    }

    // --- 2. Top Triangle Houses (2 & 12) ---
    // Wide horizontal base along top (y=0 to y=60). Apex at (150, 150) or (450, 150).
    if (house === 2) {
      if (count === 1) return [{ x: 150, y: 65 }];
      if (count === 2) return [{ x: 150, y: 50 }, { x: 150, y: 85 }];
      if (count === 3) return [{ x: 100, y: 50 }, { x: 150, y: 65 }, { x: 200, y: 50 }];
      if (count === 4) {
        return [
          { x: 100, y: 45 }, { x: 200, y: 45 },
          { x: 125, y: 80 }, { x: 175, y: 80 },
        ];
      }
      // 5 to 9 planets: row along wide top edge, then middle, then apex
      return [
        { x: 75, y: 40 }, { x: 150, y: 40 }, { x: 225, y: 40 },
        { x: 105, y: 70 }, { x: 150, y: 70 }, { x: 195, y: 70 },
        { x: 125, y: 100 }, { x: 150, y: 100 }, { x: 175, y: 100 },
      ].slice(0, count);
    }

    if (house === 12) {
      if (count === 1) return [{ x: 450, y: 65 }];
      if (count === 2) return [{ x: 450, y: 50 }, { x: 450, y: 85 }];
      if (count === 3) return [{ x: 400, y: 50 }, { x: 450, y: 65 }, { x: 500, y: 50 }];
      if (count === 4) {
        return [
          { x: 400, y: 45 }, { x: 500, y: 45 },
          { x: 425, y: 80 }, { x: 475, y: 80 },
        ];
      }
      return [
        { x: 375, y: 40 }, { x: 450, y: 40 }, { x: 525, y: 40 },
        { x: 405, y: 70 }, { x: 450, y: 70 }, { x: 495, y: 70 },
        { x: 425, y: 100 }, { x: 450, y: 100 }, { x: 475, y: 100 },
      ].slice(0, count);
    }

    // --- 3. Left Triangle Houses (3 & 5) ---
    // Wide vertical base along left edge (x=0 to x=60). Apex at (150, 150) or (150, 450).
    if (house === 3) {
      if (count === 1) return [{ x: 55, y: 150 }];
      if (count === 2) return [{ x: 55, y: 115 }, { x: 55, y: 185 }];
      if (count === 3) return [{ x: 45, y: 95 }, { x: 65, y: 150 }, { x: 45, y: 205 }];
      if (count === 4) {
        return [
          { x: 40, y: 95 }, { x: 40, y: 205 },
          { x: 75, y: 125 }, { x: 75, y: 175 },
        ];
      }
      return [
        { x: 35, y: 75 }, { x: 35, y: 150 }, { x: 35, y: 225 },
        { x: 65, y: 105 }, { x: 65, y: 150 }, { x: 65, y: 195 },
        { x: 95, y: 125 }, { x: 95, y: 150 }, { x: 95, y: 175 },
      ].slice(0, count);
    }

    if (house === 5) {
      if (count === 1) return [{ x: 55, y: 450 }];
      if (count === 2) return [{ x: 55, y: 415 }, { x: 55, y: 485 }];
      if (count === 3) return [{ x: 45, y: 395 }, { x: 65, y: 450 }, { x: 45, y: 505 }];
      if (count === 4) {
        return [
          { x: 40, y: 395 }, { x: 40, y: 505 },
          { x: 75, y: 425 }, { x: 75, y: 475 },
        ];
      }
      return [
        { x: 35, y: 375 }, { x: 35, y: 450 }, { x: 35, y: 525 },
        { x: 65, y: 405 }, { x: 65, y: 450 }, { x: 65, y: 495 },
        { x: 95, y: 425 }, { x: 95, y: 450 }, { x: 95, y: 475 },
      ].slice(0, count);
    }

    // --- 4. Bottom Triangle Houses (6 & 8) ---
    // Wide horizontal base along bottom (y=540 to y=600). Apex at (150, 450) or (450, 450).
    if (house === 6) {
      if (count === 1) return [{ x: 150, y: 535 }];
      if (count === 2) return [{ x: 150, y: 515 }, { x: 150, y: 550 }];
      if (count === 3) return [{ x: 100, y: 550 }, { x: 150, y: 535 }, { x: 200, y: 550 }];
      if (count === 4) {
        return [
          { x: 125, y: 520 }, { x: 175, y: 520 },
          { x: 100, y: 555 }, { x: 200, y: 555 },
        ];
      }
      return [
        { x: 125, y: 500 }, { x: 150, y: 500 }, { x: 175, y: 500 },
        { x: 105, y: 530 }, { x: 150, y: 530 }, { x: 195, y: 530 },
        { x: 75, y: 560 }, { x: 150, y: 560 }, { x: 225, y: 560 },
      ].slice(0, count);
    }

    if (house === 8) {
      if (count === 1) return [{ x: 450, y: 535 }];
      if (count === 2) return [{ x: 450, y: 515 }, { x: 450, y: 550 }];
      if (count === 3) return [{ x: 400, y: 550 }, { x: 450, y: 535 }, { x: 500, y: 550 }];
      if (count === 4) {
        return [
          { x: 425, y: 520 }, { x: 475, y: 520 },
          { x: 400, y: 555 }, { x: 500, y: 555 },
        ];
      }
      return [
        { x: 425, y: 500 }, { x: 450, y: 500 }, { x: 475, y: 500 },
        { x: 405, y: 530 }, { x: 450, y: 530 }, { x: 495, y: 530 },
        { x: 375, y: 560 }, { x: 450, y: 560 }, { x: 525, y: 560 },
      ].slice(0, count);
    }

    // --- 5. Right Triangle Houses (9 & 11) ---
    // Wide vertical base along right edge (x=540 to x=600). Apex at (450, 450) or (450, 150).
    if (house === 9) {
      if (count === 1) return [{ x: 545, y: 450 }];
      if (count === 2) return [{ x: 545, y: 415 }, { x: 545, y: 485 }];
      if (count === 3) return [{ x: 555, y: 395 }, { x: 535, y: 450 }, { x: 555, y: 505 }];
      if (count === 4) {
        return [
          { x: 560, y: 395 }, { x: 560, y: 505 },
          { x: 525, y: 425 }, { x: 525, y: 475 },
        ];
      }
      return [
        { x: 565, y: 375 }, { x: 565, y: 450 }, { x: 565, y: 525 },
        { x: 535, y: 405 }, { x: 535, y: 450 }, { x: 535, y: 495 },
        { x: 505, y: 425 }, { x: 505, y: 450 }, { x: 505, y: 475 },
      ].slice(0, count);
    }

    if (house === 11) {
      if (count === 1) return [{ x: 545, y: 150 }];
      if (count === 2) return [{ x: 545, y: 115 }, { x: 545, y: 185 }];
      if (count === 3) return [{ x: 555, y: 95 }, { x: 535, y: 150 }, { x: 555, y: 205 }];
      if (count === 4) {
        return [
          { x: 560, y: 95 }, { x: 560, y: 205 },
          { x: 525, y: 125 }, { x: 525, y: 175 },
        ];
      }
      return [
        { x: 565, y: 75 }, { x: 565, y: 150 }, { x: 565, y: 225 },
        { x: 535, y: 105 }, { x: 535, y: 150 }, { x: 535, y: 195 },
        { x: 505, y: 125 }, { x: 505, y: 150 }, { x: 505, y: 175 },
      ].slice(0, count);
    }

    return [{ x: 300, y: 300 }];
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 600 600"
      className="w-full h-full select-none"
      style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision' }}
    >
      <defs>
        {/* Clip paths for every house to physically prevent any text from crossing boundaries */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
          <clipPath key={`clip-ni-h-${h}`} id={`clip-ni-h-${h}`}>
            <polygon points={housePolygons[h]} />
          </clipPath>
        ))}

        {/* Subtle drop shadow for Lagna badge */}
        <filter id="badge-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Background Frame */}
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

      {/* House Polygons & Fill Treatments (Crisp Slate-50 for Kendra houses, Pure White for others) */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
        const isKendra = [1, 4, 7, 10].includes(h);
        const isSelected = highlightHouse === h;

        return (
          <g
            key={`poly-${h}`}
            className="cursor-pointer transition-colors"
            onClick={() => onHouseClick?.(h)}
          >
            <polygon
              points={housePolygons[h]}
              fill={isSelected ? '#EFF6FF' : isKendra ? '#F8FAFC' : '#FFFFFF'}
              stroke="#334155"
              strokeWidth="1.8"
              className="hover:fill-[#F1F5F9]"
            />
          </g>
        );
      })}

      {/* Classical Structural Geometric Lines (Diagonal & Diamond cross) - High Contrast Dark Slate */}
      <line x1="0" y1="0" x2="600" y2="600" stroke="#334155" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <line x1="600" y1="0" x2="0" y2="600" stroke="#334155" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <polygon
        points="300,0 600,300 300,600 0,300"
        fill="none"
        stroke="#334155"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />

      {/* House Signs, Badges, and Planets (Strictly Clipped) */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => {
        const rashi = (((lagnaRashi - 1 + (h - 1)) % 12) + 1) as RashiNumber;
        const signPos = signNumberPositions[h];
        const labelPos = houseLabelPositions[h];
        const occupants = planetsByHouse[h] || [];
        const positions = getPlanetPositions(h, occupants.length);
        const planetFontSize = occupants.length >= 7 ? 12 : occupants.length >= 5 ? 13.5 : occupants.length >= 3 ? 15 : occupants.length === 2 ? 16 : 18;

        return (
          <g key={`content-${h}`} clipPath={`url(#clip-ni-h-${h})`}>
            {/* Rashi Number in classical serif with white contrast halo */}
            <text
              x={signPos.x}
              y={signPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="Georgia, Cambria, serif"
              fontSize={16}
              fontWeight="700"
              fill="#334155"
              stroke="#FFFFFF"
              strokeWidth={3}
              paintOrder="stroke fill"
            >
              {rashi}
            </text>

            {/* House Tag ("H1" .. "H12") */}
            <text
              x={labelPos.x}
              y={labelPos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="ui-monospace, monospace"
              fontSize={11}
              fontWeight="700"
              fill="#64748B"
              stroke="#FFFFFF"
              strokeWidth={2}
              paintOrder="stroke fill"
            >
              {`H${h}`}
            </text>

            {/* Lagna Tag in House 1 - High Visibility Ruby Badge */}
            {h === 1 && (
              <g>
                <rect
                  x={190}
                  y={34}
                  width={220}
                  height={28}
                  rx={14}
                  fill="#FEF2F2"
                  stroke="#DC2626"
                  strokeWidth={1.8}
                  filter="url(#badge-shadow)"
                />
                <text
                  x={300}
                  y={48}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontSize={12.5}
                  fontWeight="800"
                  fill="#991B1B"
                >
                  Lagna (Asc) {lagnaDegreeStr ? `• ${lagnaDegreeStr.split(' ')[0]}` : ''}
                </text>
              </g>
            )}

            {/* Render Planets - High Contrast, Bold, Sized for Ultra-Readability */}
            {occupants.map((p, idx) => {
              const pos = positions[idx] || { x: 300, y: 300 };
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
                    fontWeight="800"
                    fill={planetFill}
                    stroke="#FFFFFF"
                    strokeWidth={3.5}
                    strokeLinejoin="round"
                    paintOrder="stroke fill"
                  >
                    {p.label}
                    {p.isRetro && (
                      <tspan fill="#DC2626" fontWeight="900" fontSize={Math.max(10, planetFontSize - 2.5)}>
                        {' '}(R)
                      </tspan>
                    )}
                    {p.isComb && (
                      <tspan fill="#D97706" fontWeight="900" fontSize={Math.max(10, planetFontSize - 2.5)}>
                        {' '}(C)
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
        );
      })}
    </svg>
  );
};

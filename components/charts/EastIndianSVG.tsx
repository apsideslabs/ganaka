'use client';

/**
 * Gaṇaka — East Indian (Bengali / Mithila / Eastern Fixed-Sign) Kuṇḍalī Vector SVG
 * Precise 3x3 partitioned geometry with diagonal bisected corner chambers,
 * strict boundary containment clip-paths, and non-colliding stellium placement.
 */

import React from 'react';
import { RashiNumber } from '../../lib/jyotisha/types';
import { ChartPlanetItem, RASHI_DATA, getHouseForRashi } from './chartLayoutUtils';

interface EastIndianSVGProps {
  lagnaRashi: RashiNumber;
  lagnaDegreeStr?: string;
  planetsByRashi: Record<RashiNumber, ChartPlanetItem[]>;
  highlightHouse?: number;
  onHouseClick?: (houseNum: number) => void;
  showDegrees?: boolean;
  svgRef?: React.Ref<SVGSVGElement>;
}

export const EastIndianSVG: React.FC<EastIndianSVGProps> = ({
  lagnaRashi,
  lagnaDegreeStr,
  planetsByRashi,
  highlightHouse,
  onHouseClick,
  showDegrees = false,
  svgRef,
}) => {
  // 12 Chambers Polygon & Geometry in 600x600 viewBox
  // 4 Cardinal Squares (200x200):
  // Sign 1 (Aries): Top-Center (200, 0) to (400, 200)
  // Sign 4 (Cancer): Left-Center (0, 200) to (200, 400)
  // Sign 7 (Libra): Bottom-Center (200, 400) to (400, 600)
  // Sign 10 (Capricorn): Right-Center (400, 200) to (600, 400)
  // 8 Corner Triangles:
  // Sign 2 (Taurus): Top-Left Upper
  // Sign 3 (Gemini): Top-Left Lower
  // Sign 5 (Leo): Bottom-Left Upper
  // Sign 6 (Virgo): Bottom-Left Lower
  // Sign 8 (Scorpio): Bottom-Right Lower
  // Sign 9 (Sagittarius): Bottom-Right Upper
  // Sign 11 (Aquarius): Top-Right Lower
  // Sign 12 (Pisces): Top-Right Upper
  const chamberPolygons: Record<RashiNumber, string> = {
    1: '200,0 400,0 400,200 200,200',
    2: '0,0 200,0 200,200',
    3: '0,0 200,200 0,200',
    4: '0,200 200,200 200,400 0,400',
    5: '0,400 200,400 0,600',
    6: '200,400 200,600 0,600',
    7: '200,400 400,400 400,600 200,600',
    8: '400,400 400,600 600,600',
    9: '400,400 600,400 600,600',
    10: '400,200 600,200 600,400 400,400',
    11: '400,200 600,200 600,0',
    12: '400,0 600,0 400,200',
  };

  /**
   * Adaptive Non-Colliding Layout for East Indian chambers.
   * Generates safe positions inside squares and bisected corner triangles.
   */
  const getChamberPlanetPositions = (
    rashi: RashiNumber,
    count: number
  ): Array<{ x: number; y: number }> => {
    if (count === 0) return [];

    // --- 1. Cardinal Squares (1, 4, 7, 10) (200x200 space) ---
    if (rashi === 1) {
      // Top-Center (x: 200..400, y: 0..200)
      if (count === 1) return [{ x: 300, y: 115 }];
      if (count === 2) return [{ x: 300, y: 95 }, { x: 300, y: 140 }];
      if (count === 3) return [{ x: 300, y: 80 }, { x: 300, y: 115 }, { x: 300, y: 150 }];
      if (count === 4) {
        return [
          { x: 255, y: 95 }, { x: 345, y: 95 },
          { x: 255, y: 140 }, { x: 345, y: 140 },
        ];
      }
      if (count <= 6) {
        return [
          { x: 255, y: 80 }, { x: 345, y: 80 },
          { x: 255, y: 115 }, { x: 345, y: 115 },
          { x: 255, y: 150 }, { x: 345, y: 150 },
        ].slice(0, count);
      }
      // 7 to 9 planets
      return [
        { x: 250, y: 75 }, { x: 300, y: 75 }, { x: 350, y: 75 },
        { x: 250, y: 112 }, { x: 300, y: 112 }, { x: 350, y: 112 },
        { x: 250, y: 148 }, { x: 300, y: 148 }, { x: 350, y: 148 },
      ].slice(0, count);
    }

    if (rashi === 4) {
      // Left-Center (x: 0..200, y: 200..400)
      if (count === 1) return [{ x: 100, y: 315 }];
      if (count === 2) return [{ x: 100, y: 295 }, { x: 100, y: 340 }];
      if (count === 3) return [{ x: 100, y: 280 }, { x: 100, y: 315 }, { x: 100, y: 350 }];
      if (count === 4) {
        return [
          { x: 55, y: 295 }, { x: 145, y: 295 },
          { x: 55, y: 340 }, { x: 145, y: 340 },
        ];
      }
      if (count <= 6) {
        return [
          { x: 55, y: 280 }, { x: 145, y: 280 },
          { x: 55, y: 315 }, { x: 145, y: 315 },
          { x: 55, y: 350 }, { x: 145, y: 350 },
        ].slice(0, count);
      }
      return [
        { x: 50, y: 275 }, { x: 100, y: 275 }, { x: 150, y: 275 },
        { x: 50, y: 312 }, { x: 100, y: 312 }, { x: 150, y: 312 },
        { x: 50, y: 348 }, { x: 100, y: 348 }, { x: 150, y: 348 },
      ].slice(0, count);
    }

    if (rashi === 7) {
      // Bottom-Center (x: 200..400, y: 400..600)
      if (count === 1) return [{ x: 300, y: 515 }];
      if (count === 2) return [{ x: 300, y: 495 }, { x: 300, y: 540 }];
      if (count === 3) return [{ x: 300, y: 480 }, { x: 300, y: 515 }, { x: 300, y: 550 }];
      if (count === 4) {
        return [
          { x: 255, y: 495 }, { x: 345, y: 495 },
          { x: 255, y: 540 }, { x: 345, y: 540 },
        ];
      }
      if (count <= 6) {
        return [
          { x: 255, y: 480 }, { x: 345, y: 480 },
          { x: 255, y: 515 }, { x: 345, y: 515 },
          { x: 255, y: 550 }, { x: 345, y: 550 },
        ].slice(0, count);
      }
      return [
        { x: 250, y: 475 }, { x: 300, y: 475 }, { x: 350, y: 475 },
        { x: 250, y: 512 }, { x: 300, y: 512 }, { x: 350, y: 512 },
        { x: 250, y: 548 }, { x: 300, y: 548 }, { x: 350, y: 548 },
      ].slice(0, count);
    }

    if (rashi === 10) {
      // Right-Center (x: 400..600, y: 200..400)
      if (count === 1) return [{ x: 500, y: 315 }];
      if (count === 2) return [{ x: 500, y: 295 }, { x: 500, y: 340 }];
      if (count === 3) return [{ x: 500, y: 280 }, { x: 500, y: 315 }, { x: 500, y: 350 }];
      if (count === 4) {
        return [
          { x: 455, y: 295 }, { x: 545, y: 295 },
          { x: 455, y: 340 }, { x: 545, y: 340 },
        ];
      }
      if (count <= 6) {
        return [
          { x: 455, y: 280 }, { x: 545, y: 280 },
          { x: 455, y: 315 }, { x: 545, y: 315 },
          { x: 455, y: 350 }, { x: 545, y: 350 },
        ].slice(0, count);
      }
      return [
        { x: 450, y: 275 }, { x: 500, y: 275 }, { x: 550, y: 275 },
        { x: 450, y: 312 }, { x: 500, y: 312 }, { x: 550, y: 312 },
        { x: 450, y: 348 }, { x: 500, y: 348 }, { x: 550, y: 348 },
      ].slice(0, count);
    }

    // --- 2. Corner Triangles (Hypotenuse-safe layouts) ---
    // Sign 2 (Taurus / Vṛṣabha): Top-Left Upper: (0,0)-(200,0)-(200,200). Inside: x > y.
    if (rashi === 2) {
      if (count === 1) return [{ x: 135, y: 65 }];
      if (count === 2) return [{ x: 120, y: 50 }, { x: 160, y: 80 }];
      if (count === 3) return [{ x: 100, y: 45 }, { x: 145, y: 55 }, { x: 165, y: 95 }];
      return [
        { x: 80, y: 40 }, { x: 130, y: 40 }, { x: 175, y: 40 },
        { x: 110, y: 70 }, { x: 155, y: 70 },
        { x: 140, y: 100 }, { x: 175, y: 100 },
        { x: 165, y: 130 }, { x: 180, y: 155 },
      ].slice(0, count);
    }

    // Sign 3 (Gemini / Mithuna): Top-Left Lower: (0,0)-(200,200)-(0,200). Inside: y > x.
    if (rashi === 3) {
      if (count === 1) return [{ x: 65, y: 135 }];
      if (count === 2) return [{ x: 50, y: 120 }, { x: 80, y: 160 }];
      if (count === 3) return [{ x: 45, y: 100 }, { x: 55, y: 145 }, { x: 95, y: 165 }];
      return [
        { x: 40, y: 80 }, { x: 40, y: 130 }, { x: 40, y: 175 },
        { x: 70, y: 110 }, { x: 70, y: 155 },
        { x: 100, y: 140 }, { x: 100, y: 175 },
        { x: 130, y: 165 }, { x: 155, y: 180 },
      ].slice(0, count);
    }

    // Sign 5 (Leo / Siṃha): Bottom-Left Upper: (0,400)-(200,400)-(0,600). Inside: x + y < 600.
    if (rashi === 5) {
      if (count === 1) return [{ x: 65, y: 465 }];
      if (count === 2) return [{ x: 50, y: 445 }, { x: 80, y: 485 }];
      if (count === 3) return [{ x: 45, y: 435 }, { x: 90, y: 450 }, { x: 55, y: 495 }];
      return [
        { x: 40, y: 435 }, { x: 90, y: 435 }, { x: 140, y: 435 },
        { x: 45, y: 470 }, { x: 95, y: 470 },
        { x: 40, y: 505 }, { x: 75, y: 505 },
        { x: 35, y: 540 }, { x: 45, y: 565 },
      ].slice(0, count);
    }

    // Sign 6 (Virgo / Kanyā): Bottom-Left Lower: (200,400)-(200,600)-(0,600). Inside: x + y > 600.
    if (rashi === 6) {
      if (count === 1) return [{ x: 135, y: 535 }];
      if (count === 2) return [{ x: 120, y: 515 }, { x: 150, y: 555 }];
      if (count === 3) return [{ x: 145, y: 505 }, { x: 110, y: 545 }, { x: 155, y: 565 }];
      return [
        { x: 160, y: 470 }, { x: 165, y: 505 },
        { x: 110, y: 530 }, { x: 155, y: 530 },
        { x: 60, y: 565 }, { x: 105, y: 565 }, { x: 155, y: 565 },
        { x: 135, y: 580 }, { x: 175, y: 580 },
      ].slice(0, count);
    }

    // Sign 8 (Scorpio / Vṛścika): Bottom-Right Lower: (400,400)-(400,600)-(600,600). Inside: y > x.
    if (rashi === 8) {
      if (count === 1) return [{ x: 465, y: 535 }];
      if (count === 2) return [{ x: 450, y: 515 }, { x: 480, y: 555 }];
      if (count === 3) return [{ x: 445, y: 500 }, { x: 455, y: 545 }, { x: 495, y: 565 }];
      return [
        { x: 440, y: 470 }, { x: 440, y: 510 },
        { x: 445, y: 545 }, { x: 485, y: 545 },
        { x: 445, y: 575 }, { x: 495, y: 575 }, { x: 545, y: 575 },
        { x: 470, y: 525 }, { x: 515, y: 555 },
      ].slice(0, count);
    }

    // Sign 9 (Sagittarius / Dhanu): Bottom-Right Upper: (400,400)-(600,400)-(600,600). Inside: x > y.
    if (rashi === 9) {
      if (count === 1) return [{ x: 535, y: 465 }];
      if (count === 2) return [{ x: 520, y: 445 }, { x: 550, y: 485 }];
      if (count === 3) return [{ x: 505, y: 435 }, { x: 555, y: 450 }, { x: 545, y: 495 }];
      return [
        { x: 465, y: 435 }, { x: 515, y: 435 }, { x: 565, y: 435 },
        { x: 505, y: 470 }, { x: 555, y: 470 },
        { x: 535, y: 505 }, { x: 565, y: 505 },
        { x: 555, y: 540 }, { x: 570, y: 565 },
      ].slice(0, count);
    }

    // Sign 11 (Aquarius / Kumbha): Top-Right Lower: (400,200)-(600,200)-(600,0). Inside: x > 400 + y.
    if (rashi === 11) {
      if (count === 1) return [{ x: 535, y: 135 }];
      if (count === 2) return [{ x: 520, y: 155 }, { x: 550, y: 115 }];
      if (count === 3) return [{ x: 505, y: 165 }, { x: 550, y: 145 }, { x: 555, y: 105 }];
      return [
        { x: 560, y: 65 }, { x: 560, y: 105 },
        { x: 510, y: 140 }, { x: 555, y: 140 },
        { x: 460, y: 175 }, { x: 505, y: 175 }, { x: 555, y: 175 },
        { x: 530, y: 110 }, { x: 565, y: 160 },
      ].slice(0, count);
    }

    // Sign 12 (Pisces / Mīna): Top-Right Upper: (400,0)-(600,0)-(400,200). Inside: x + y < 600.
    if (rashi === 12) {
      if (count === 1) return [{ x: 465, y: 65 }];
      if (count === 2) return [{ x: 450, y: 50 }, { x: 480, y: 85 }];
      if (count === 3) return [{ x: 445, y: 45 }, { x: 490, y: 55 }, { x: 465, y: 95 }];
      return [
        { x: 435, y: 40 }, { x: 485, y: 40 }, { x: 535, y: 40 },
        { x: 445, y: 70 }, { x: 495, y: 70 },
        { x: 440, y: 105 }, { x: 475, y: 105 },
        { x: 435, y: 140 }, { x: 445, y: 165 },
      ].slice(0, count);
    }

    return [{ x: 300, y: 300 }];
  };

  // Header position for each chamber
  const chamberHeaderPositions: Record<RashiNumber, { x: number; y: number; anchor: 'start' | 'middle' | 'end' }> = {
    1: { x: 300, y: 24, anchor: 'middle' },
    2: { x: 185, y: 22, anchor: 'end' },
    3: { x: 18, y: 185, anchor: 'start' },
    4: { x: 100, y: 224, anchor: 'middle' },
    5: { x: 18, y: 420, anchor: 'start' },
    6: { x: 185, y: 585, anchor: 'end' },
    7: { x: 300, y: 424, anchor: 'middle' },
    8: { x: 415, y: 585, anchor: 'start' },
    9: { x: 582, y: 420, anchor: 'end' },
    10: { x: 500, y: 224, anchor: 'middle' },
    11: { x: 582, y: 185, anchor: 'end' },
    12: { x: 415, y: 22, anchor: 'start' },
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 600 600"
      className="w-full h-full select-none"
      style={{ shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision' }}
    >
      <defs>
        {/* Clip paths for all 12 chambers to physically seal boundaries */}
        {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as RashiNumber[]).map((r) => (
          <clipPath key={`clip-ei-${r}`} id={`clip-ei-${r}`}>
            <polygon points={chamberPolygons[r]} />
          </clipPath>
        ))}
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

      {/* 3x3 Grid Matrix Primary Lines */}
      {/* Horizontals */}
      <line x1="0" y1="200" x2="600" y2="200" stroke="#B3A188" strokeWidth="1.8" />
      <line x1="0" y1="400" x2="600" y2="400" stroke="#B3A188" strokeWidth="1.8" />
      {/* Verticals */}
      <line x1="200" y1="0" x2="200" y2="600" stroke="#B3A188" strokeWidth="1.8" />
      <line x1="400" y1="0" x2="400" y2="600" stroke="#B3A188" strokeWidth="1.8" />

      {/* Corner Square Diagonals (Classical Bengali / Mithila Division) */}
      {/* Top-Left: (0,0) to (200,200) */}
      <line x1="0" y1="0" x2="200" y2="200" stroke="#B3A188" strokeWidth="1.8" />
      {/* Bottom-Left: (200,400) to (0,600) */}
      <line x1="200" y1="400" x2="0" y2="600" stroke="#B3A188" strokeWidth="1.8" />
      {/* Bottom-Right: (400,400) to (600,600) */}
      <line x1="400" y1="400" x2="600" y2="600" stroke="#B3A188" strokeWidth="1.8" />
      {/* Top-Right: (400,200) to (600,0) */}
      <line x1="400" y1="200" x2="600" y2="0" stroke="#B3A188" strokeWidth="1.8" />

      {/* Center 200x200 Chamber with Bengali Classical Title */}
      <rect x="200" y="200" width="200" height="200" fill="#FAF6EE" stroke="#B3A188" strokeWidth="1.6" />
      <circle cx="300" cy="300" r="75" fill="#F4EDE0" stroke="#D1C4AF" strokeWidth="1.2" strokeDasharray="3 2" />

      <text x="300" y="278" textAnchor="middle" fill="#3E3427" className="text-[15px] font-serif font-bold">
        পূর্ব ভারতীয় চক্র
      </text>
      <text x="300" y="298" textAnchor="middle" fill="#756754" className="text-[11px] font-sans font-medium">
        East Indian (Bengali/Mithila)
      </text>
      <text x="300" y="322" textAnchor="middle" fill="#8C2D19" className="text-[10.5px] font-mono font-semibold">
        লগ্ন: {RASHI_DATA[lagnaRashi].bengali} ({RASHI_DATA[lagnaRashi].sanskrit})
      </text>
      {lagnaDegreeStr && (
        <text x="300" y="338" textAnchor="middle" fill="#9C8B76" className="text-[9.5px] font-mono">
          {lagnaDegreeStr}
        </text>
      )}

      {/* 12 Outer Chambers */}
      {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as RashiNumber[]).map((rashiNum) => {
        const isLagna = rashiNum === lagnaRashi;
        const houseNum = getHouseForRashi(rashiNum, lagnaRashi);
        const isSelected = highlightHouse === houseNum;
        const header = chamberHeaderPositions[rashiNum];
        const occupants = planetsByRashi[rashiNum] || [];
        const positions = getChamberPlanetPositions(rashiNum, occupants.length);
        const fontSizeClass = occupants.length >= 6 ? 'text-[10px]' : occupants.length >= 4 ? 'text-[11px]' : 'text-[12px]';

        return (
          <g
            key={`chamber-${rashiNum}`}
            className="cursor-pointer"
            onClick={() => onHouseClick?.(houseNum)}
          >
            {/* Interactive Chamber Hover Fill */}
            <polygon
              points={chamberPolygons[rashiNum]}
              fill={isSelected ? '#EDE4D1' : isLagna ? '#FFF8F5' : '#FCFBF8'}
              className="hover:fill-[#F2EBDB] transition-colors"
              stroke="#B3A188"
              strokeWidth="1.2"
            />

            {/* Chamber Contents with Strict Clip Path */}
            <g clipPath={`url(#clip-ei-${rashiNum})`}>
              {/* Header Label: Bengali Name + Sanskrit + House */}
              <text
                x={header.x}
                y={header.y}
                textAnchor={header.anchor}
                fill="#6B5C49"
                className="text-[11px] font-serif font-bold"
              >
                {RASHI_DATA[rashiNum].bengali} • {RASHI_DATA[rashiNum].sanskrit}
                <tspan className="text-[9.5px] font-mono font-medium text-[#9C8B76]"> ({rashiNum})</tspan>
                {isLagna ? (
                  <tspan className="text-[10px] font-sans font-bold fill-[#8C2D19]"> [লগ্ন/H1]</tspan>
                ) : (
                  <tspan className="text-[9px] font-mono fill-[#B5A996]"> [H{houseNum}]</tspan>
                )}
              </text>

              {/* Render Occupant Planets */}
              {occupants.map((p, idx) => {
                const pos = positions[idx] || { x: 300, y: 300 };

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

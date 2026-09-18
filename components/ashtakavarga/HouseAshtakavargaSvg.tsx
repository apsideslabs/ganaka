'use client';

/**
 * Gaṇaka — 12-House Aṣṭakavarga Kuṇḍalī Chart
 * Interactive North, South, and East Indian vector charts displaying points per House (Bhāva)
 * with classical threshold styling and D1 sign numbers.
 */

import React from 'react';
import { RashiNumber } from '@/lib/jyotisha/types';

export interface HousePointData {
  houseNum: number;
  houseName: string;
  shortName: string;
  rashiNum: RashiNumber;
  rashiName: string;
  rashiSanskrit: string;
  rashiLord: string;
  points: number;
  status: 'strong' | 'average' | 'weak';
  statusColor: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeBorder: string;
  };
  bavBreakdown: Record<string, number>;
}

export interface HouseAshtakavargaSvgProps {
  housesData: HousePointData[];
  chartStyle: 'north' | 'south' | 'east';
  selectedHouse: number;
  onSelectHouse: (houseNum: number) => void;
  targetTitle: string;
  totalPoints: number;
  averagePoints: number;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

// Center coords & geometry for North Indian 12 houses (600x600 viewBox)
const NORTH_HOUSE_POLYGONS: Record<number, string> = {
  1: '300,0 450,150 300,300 150,150', // Top Kendra (H1)
  2: '0,0 300,0 150,150', // Top-Left Triangle (H2)
  3: '0,0 150,150 0,300', // Left-Top Triangle (H3)
  4: '0,300 150,150 300,300 150,450', // Left Kendra (H4)
  5: '0,300 150,450 0,600', // Left-Bottom Triangle (H5)
  6: '0,600 150,450 300,600', // Bottom-Left Triangle (H6)
  7: '300,300 450,450 300,600 150,450', // Bottom Kendra (H7)
  8: '300,600 450,450 600,600', // Bottom-Right Triangle (H8)
  9: '450,450 600,300 600,600', // Right-Bottom Triangle (H9)
  10: '300,300 450,150 600,300 450,450', // Right Kendra (H10)
  11: '450,150 600,0 600,300', // Right-Top Triangle (H11)
  12: '300,0 600,0 450,150', // Top-Right Triangle (H12)
};

const NORTH_HOUSE_CENTERS: Record<number, { cx: number; cy: number }> = {
  1: { cx: 300, cy: 150 },
  2: { cx: 150, cy: 58 },
  3: { cx: 58, cy: 150 },
  4: { cx: 150, cy: 300 },
  5: { cx: 58, cy: 450 },
  6: { cx: 150, cy: 542 },
  7: { cx: 300, cy: 450 },
  8: { cx: 450, cy: 542 },
  9: { cx: 542, cy: 450 },
  10: { cx: 450, cy: 300 },
  11: { cx: 542, cy: 150 },
  12: { cx: 450, cy: 58 },
};

// Classical sign number positions in North Indian Kuṇḍalī
const NORTH_SIGN_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: 300, y: 255 },
  2: { x: 150, y: 125 },
  3: { x: 125, y: 150 },
  4: { x: 255, y: 300 },
  5: { x: 125, y: 450 },
  6: { x: 150, y: 475 },
  7: { x: 300, y: 345 },
  8: { x: 450, y: 475 },
  9: { x: 475, y: 450 },
  10: { x: 345, y: 300 },
  11: { x: 475, y: 150 },
  12: { x: 450, y: 125 },
};

// South Indian 4x4 Grid positions for Rashis 1-12
const SOUTH_RASHI_ORDER: RashiNumber[] = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const SOUTH_RASHI_GRID: Record<RashiNumber, { x: number; y: number; w: number; h: number }> = {
  12: { x: 0, y: 0, w: 150, h: 150 },
  1: { x: 150, y: 0, w: 150, h: 150 },
  2: { x: 300, y: 0, w: 150, h: 150 },
  3: { x: 450, y: 0, w: 150, h: 150 },
  4: { x: 450, y: 150, w: 150, h: 150 },
  5: { x: 450, y: 300, w: 150, h: 150 },
  6: { x: 450, y: 450, w: 150, h: 150 },
  7: { x: 300, y: 450, w: 150, h: 150 },
  8: { x: 150, y: 450, w: 150, h: 150 },
  9: { x: 0, y: 450, w: 150, h: 150 },
  10: { x: 0, y: 300, w: 150, h: 150 },
  11: { x: 0, y: 150, w: 150, h: 150 },
};

// East Indian fixed sign polygons & centers (Bengali/Mithila Kuṇḍalī)
const EAST_RASHI_ORDER: RashiNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const EAST_RASHI_GEOMETRY: Record<
  RashiNumber,
  { polygon: string; cx: number; cy: number; signX: number; signY: number }
> = {
  1: { polygon: '200,0 400,0 400,200 200,200', cx: 300, cy: 100, signX: 380, signY: 25 }, // Aries (top center)
  2: { polygon: '0,0 200,0 200,200', cx: 133, cy: 67, signX: 180, signY: 25 }, // Taurus (top left top)
  3: { polygon: '0,0 200,200 0,200', cx: 67, cy: 133, signX: 25, signY: 180 }, // Gemini (top left side)
  4: { polygon: '0,200 200,200 200,400 0,400', cx: 100, cy: 300, signX: 25, signY: 225 }, // Cancer (left center)
  5: { polygon: '0,400 200,400 0,600', cx: 67, cy: 467, signX: 25, signY: 425 }, // Leo (bottom left side)
  6: { polygon: '200,400 200,600 0,600', cx: 133, cy: 533, signX: 180, signY: 575 }, // Virgo (bottom left bottom)
  7: { polygon: '200,400 400,400 400,600 200,600', cx: 300, cy: 500, signX: 380, signY: 575 }, // Libra (bottom center)
  8: { polygon: '400,400 400,600 600,600', cx: 467, cy: 533, signX: 420, signY: 575 }, // Scorpio (bottom right bottom)
  9: { polygon: '400,400 600,400 600,600', cx: 533, cy: 467, signX: 575, signY: 425 }, // Sagittarius (bottom right side)
  10: { polygon: '400,200 600,200 600,400 400,400', cx: 500, cy: 300, signX: 575, signY: 225 }, // Capricorn (right center)
  11: { polygon: '400,200 600,200 600,0', cx: 533, cy: 133, signX: 575, signY: 180 }, // Aquarius (top right side)
  12: { polygon: '400,0 600,0 400,200', cx: 467, cy: 67, signX: 420, signY: 25 }, // Pisces (top right top)
};

export const HouseAshtakavargaSvg: React.FC<HouseAshtakavargaSvgProps> = ({
  housesData,
  chartStyle,
  selectedHouse,
  onSelectHouse,
  targetTitle,
  totalPoints,
  averagePoints,
  svgRef,
}) => {
  // Map houses by house number for quick indexing
  const houseMap = React.useMemo(() => {
    const map = new Map<number, HousePointData>();
    housesData.forEach((h) => map.set(Number(h.houseNum), h));
    return map;
  }, [housesData]);

  // Map houses by occupying rashi number (for fixed-rashi charts: South & East Indian)
  const rashiHouseMap = React.useMemo(() => {
    const map = new Map<number, HousePointData>();
    housesData.forEach((h) => {
      map.set(Number(h.rashiNum), h);
    });
    return map;
  }, [housesData]);

  return (
    <div className="w-full flex flex-col items-center select-none">
      <svg
        ref={svgRef}
        viewBox="0 0 600 600"
        className="w-full max-w-[580px] h-auto aspect-square drop-shadow-md rounded-xl bg-[#FDFBF7]"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`12-House Aṣṭakavarga Chart - ${targetTitle}`}
      >
        <defs>
          <filter id="ashtaka-badge-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#2B1810" floodOpacity="0.15" />
          </filter>
          <filter id="ashtaka-selected-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#8C2D19" floodOpacity="0.4" />
          </filter>
        </defs>

        {chartStyle === 'north' && (
          /* ============================================================ */
          /* NORTH INDIAN 12-HOUSE DIAMOND STYLE                          */
          /* ============================================================ */
          <g id="north-ashtakavarga-chart">
            {/* Background Base */}
            <rect x="0" y="0" width="600" height="600" fill="#FDFBF7" />

            {/* Individual House Cells */}
            {Array.from({ length: 12 }, (_, i) => i + 1).map((hNum) => {
              const poly = NORTH_HOUSE_POLYGONS[hNum];
              const center = NORTH_HOUSE_CENTERS[hNum];
              const signPos = NORTH_SIGN_POSITIONS[hNum];
              const data = houseMap.get(hNum);
              const isSelected = selectedHouse === hNum;

              if (!data || !center) return null;

              const fillColor = isSelected ? '#FDF0CD' : data.statusColor.bg;
              const strokeColor = isSelected ? '#8C2D19' : data.statusColor.border;
              const strokeWidth = isSelected ? 3.5 : 1.5;

              return (
                <g
                  key={hNum}
                  id={`ashtaka-north-house-${hNum}`}
                  className="cursor-pointer transition-all duration-150 group"
                  onClick={() => onSelectHouse(hNum)}
                  filter={isSelected ? 'url(#ashtaka-selected-glow)' : undefined}
                >
                  {/* House Area Polygon */}
                  <polygon
                    points={poly}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    className="hover:opacity-90 transition-colors"
                  />

                  {/* Clean D1 Sign Number in Classical Position */}
                  {signPos && (
                    <text
                      x={signPos.x}
                      y={signPos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#7A6B5C"
                      fontSize="14"
                      fontWeight="bold"
                      fontFamily="Georgia, Cambria, serif"
                      pointerEvents="none"
                    >
                      {data.rashiNum}
                    </text>
                  )}

                  {/* House Content Group centered at (cx, cy) */}
                  <g transform={`translate(${center.cx}, ${center.cy})`}>
                    {/* Top: House / Lagna Badge */}
                    <rect
                      x="-38"
                      y="-40"
                      width="76"
                      height="20"
                      rx="10"
                      fill={isSelected ? '#8C2D19' : hNum === 1 ? '#7C2D12' : data.statusColor.badgeBg}
                      stroke={isSelected ? '#681F0F' : hNum === 1 ? '#451A03' : data.statusColor.badgeBorder}
                      strokeWidth="1"
                      filter="url(#ashtaka-badge-shadow)"
                    />
                    <text
                      x="0"
                      y="-26"
                      textAnchor="middle"
                      fill={isSelected || hNum === 1 ? '#FFFFFF' : data.statusColor.text}
                      fontSize="10.5"
                      fontWeight="bold"
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {hNum === 1 ? 'Lagna (H1)' : `House ${hNum}`}
                    </text>

                    {/* Middle: Prominent Points Count */}
                    <text
                      x="0"
                      y="7"
                      textAnchor="middle"
                      fill={isSelected ? '#681F0F' : data.statusColor.text}
                      fontSize="24"
                      fontWeight="900"
                      fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                      className="tracking-tight"
                    >
                      {data.points}
                    </text>

                    {/* Bottom: Bhāva Name */}
                    <text
                      x="0"
                      y="23"
                      textAnchor="middle"
                      fill="#6B5E51"
                      fontSize="10"
                      fontWeight="600"
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {data.shortName.split(' ')[0]}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Inner Diagonal & Outer Geometric Linework (overlay for crisp edges) */}
            <line x1="0" y1="0" x2="600" y2="600" stroke="#7A6B5C" strokeWidth="1.2" opacity="0.6" pointerEvents="none" />
            <line x1="600" y1="0" x2="0" y2="600" stroke="#7A6B5C" strokeWidth="1.2" opacity="0.6" pointerEvents="none" />
            <line x1="300" y1="0" x2="0" y2="300" stroke="#7A6B5C" strokeWidth="1.5" opacity="0.75" pointerEvents="none" />
            <line x1="0" y1="300" x2="300" y2="600" stroke="#7A6B5C" strokeWidth="1.5" opacity="0.75" pointerEvents="none" />
            <line x1="300" y1="600" x2="600" y2="300" stroke="#7A6B5C" strokeWidth="1.5" opacity="0.75" pointerEvents="none" />
            <line x1="600" y1="300" x2="300" y2="0" stroke="#7A6B5C" strokeWidth="1.5" opacity="0.75" pointerEvents="none" />
            <rect x="1" y="1" width="598" height="598" fill="none" stroke="#635345" strokeWidth="3" pointerEvents="none" />
          </g>
        )}

        {chartStyle === 'south' && (
          /* ============================================================ */
          /* SOUTH INDIAN 12-RĀŚI FIXED BOX STYLE                         */
          /* ============================================================ */
          <g id="south-ashtakavarga-chart">
            {/* Background Base */}
            <rect x="0" y="0" width="600" height="600" fill="#FDFBF7" />

            {/* 12 Outer Perimeter Signs */}
            {SOUTH_RASHI_ORDER.map((rNum) => {
              const rect = SOUTH_RASHI_GRID[rNum];
              const data = rashiHouseMap.get(rNum);
              if (!data) return null;

              const isSelected = selectedHouse === data.houseNum;
              const isLagna = data.houseNum === 1;
              const fillColor = isSelected ? '#FDF0CD' : data.statusColor.bg;
              const strokeColor = isSelected ? '#8C2D19' : data.statusColor.border;
              const strokeWidth = isSelected ? 3.5 : 1.5;

              return (
                <g
                  key={rNum}
                  id={`ashtaka-south-rashi-${rNum}`}
                  className="cursor-pointer transition-all duration-150 group"
                  onClick={() => onSelectHouse(data.houseNum)}
                  filter={isSelected ? 'url(#ashtaka-selected-glow)' : undefined}
                >
                  <rect
                    x={rect.x + (isSelected ? 2 : 1)}
                    y={rect.y + (isSelected ? 2 : 1)}
                    width={rect.w - (isSelected ? 4 : 2)}
                    height={rect.h - (isSelected ? 4 : 2)}
                    rx="4"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    className="hover:opacity-90 transition-colors"
                  />

                  {/* Top-Right: Clean D1 Sign Number */}
                  <text
                    x={rect.x + rect.w - 12}
                    y={rect.y + 18}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill="#7A6B5C"
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="Georgia, Cambria, serif"
                    pointerEvents="none"
                  >
                    {rNum}
                  </text>

                  {/* Top-Left: House Number / Lagna indicator */}
                  <text
                    x={rect.x + 12}
                    y={rect.y + 18}
                    textAnchor="start"
                    dominantBaseline="middle"
                    fill={isLagna ? '#8C2D19' : '#5A4B3E'}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    pointerEvents="none"
                  >
                    {isLagna ? 'Lagna (H1)' : `H${data.houseNum}`}
                  </text>

                  {/* House Center Content */}
                  <g transform={`translate(${rect.x + rect.w / 2}, ${rect.y + rect.h / 2 + 5})`}>
                    {/* Big Points Count */}
                    <text
                      x="0"
                      y="-2"
                      textAnchor="middle"
                      fill={isSelected ? '#681F0F' : data.statusColor.text}
                      fontSize="26"
                      fontWeight="900"
                      fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                      className="tracking-tight"
                    >
                      {data.points}
                    </text>

                    {/* Bhāva Name */}
                    <text
                      x="0"
                      y="18"
                      textAnchor="middle"
                      fill="#7A6B5C"
                      fontSize="10"
                      fontWeight="600"
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {data.shortName.split(' ')[0]}
                    </text>

                    {/* Status Pill */}
                    <text
                      x="0"
                      y="32"
                      textAnchor="middle"
                      fill={isSelected ? '#8C2D19' : '#8A7968'}
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {data.status.toUpperCase()}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Center Summary Box (x: 150, y: 150, w: 300, h: 300) */}
            <rect
              x="151"
              y="151"
              width="298"
              height="298"
              fill="#F4EFE6"
              stroke="#B3A28F"
              strokeWidth="2"
            />
            <g transform="translate(300, 300)">
              <rect
                x="-135"
                y="-135"
                width="270"
                height="270"
                rx="8"
                fill="#FAF6EE"
                stroke="#D8CEBA"
                strokeWidth="1.5"
              />

              <text
                x="0"
                y="-85"
                textAnchor="middle"
                fill="#8C2D19"
                fontSize="11"
                fontWeight="bold"
                letterSpacing="1.5"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                AṢṬAKAVARGA KUṆḌALĪ
              </text>

              <text
                x="0"
                y="-60"
                textAnchor="middle"
                fill="#2B1810"
                fontSize="15"
                fontWeight="bold"
                fontFamily="Georgia, serif"
              >
                {targetTitle}
              </text>

              <line x1="-80" y1="-44" x2="80" y2="-44" stroke="#E6DEC8" strokeWidth="1.5" />

              <text
                x="0"
                y="-20"
                textAnchor="middle"
                fill="#6B5E51"
                fontSize="10"
                fontWeight="600"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                TOTAL BINDUS
              </text>
              <text
                x="0"
                y="14"
                textAnchor="middle"
                fill="#8C2D19"
                fontSize="32"
                fontWeight="900"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              >
                {totalPoints}
              </text>

              <text
                x="0"
                y="38"
                textAnchor="middle"
                fill="#594B40"
                fontSize="11"
                fontWeight="600"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              >
                House Mean: {averagePoints.toFixed(2)}
              </text>

              <rect
                x="-100"
                y="54"
                width="200"
                height="24"
                rx="12"
                fill="#EAE2D3"
                stroke="#D8CEBA"
                strokeWidth="1"
              />
              <text
                x="0"
                y="70"
                textAnchor="middle"
                fill="#4A3B32"
                fontSize="9.5"
                fontWeight="600"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                Click any house cell to inspect
              </text>
            </g>

            {/* Grid Lines for South Indian Matrix */}
            <rect x="1" y="1" width="598" height="598" fill="none" stroke="#635345" strokeWidth="3" pointerEvents="none" />
            <line x1="150" y1="0" x2="150" y2="600" stroke="#B3A28F" strokeWidth="1.5" pointerEvents="none" />
            <line x1="300" y1="0" x2="300" y2="600" stroke="#B3A28F" strokeWidth="1.5" pointerEvents="none" />
            <line x1="450" y1="0" x2="450" y2="600" stroke="#B3A28F" strokeWidth="1.5" pointerEvents="none" />
            <line x1="0" y1="150" x2="600" y2="150" stroke="#B3A28F" strokeWidth="1.5" pointerEvents="none" />
            <line x1="0" y1="300" x2="600" y2="300" stroke="#B3A28F" strokeWidth="1.5" pointerEvents="none" />
            <line x1="0" y1="450" x2="600" y2="450" stroke="#B3A28F" strokeWidth="1.5" pointerEvents="none" />
          </g>
        )}

        {chartStyle === 'east' && (
          /* ============================================================ */
          /* EAST INDIAN FIXED-RĀŚI STYLE (BENGALI / MITHILA KUṆḌALĪ)     */
          /* ============================================================ */
          <g id="east-ashtakavarga-chart">
            {/* Background Base */}
            <rect x="0" y="0" width="600" height="600" fill="#FDFBF7" />

            {/* 12 Fixed Rāśi Chambers */}
            {EAST_RASHI_ORDER.map((rNum) => {
              const geo = EAST_RASHI_GEOMETRY[rNum];
              const data = rashiHouseMap.get(rNum);
              if (!data) return null;

              const isSelected = selectedHouse === data.houseNum;
              const isLagna = data.houseNum === 1;
              const fillColor = isSelected ? '#FDF0CD' : data.statusColor.bg;
              const strokeColor = isSelected ? '#8C2D19' : data.statusColor.border;
              const strokeWidth = isSelected ? 3.5 : 1.5;

              return (
                <g
                  key={rNum}
                  id={`ashtaka-east-rashi-${rNum}`}
                  className="cursor-pointer transition-all duration-150 group"
                  onClick={() => onSelectHouse(data.houseNum)}
                  filter={isSelected ? 'url(#ashtaka-selected-glow)' : undefined}
                >
                  <polygon
                    points={geo.polygon}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    className="hover:opacity-90 transition-colors"
                  />

                  {/* Clean D1 Sign Number */}
                  <text
                    x={geo.signX}
                    y={geo.signY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#7A6B5C"
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="Georgia, Cambria, serif"
                    pointerEvents="none"
                  >
                    {rNum}
                  </text>

                  {/* House Content Group */}
                  <g transform={`translate(${geo.cx}, ${geo.cy})`}>
                    {/* House Header */}
                    <text
                      x="0"
                      y="-18"
                      textAnchor="middle"
                      fill={isLagna ? '#8C2D19' : '#5A4B3E'}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {isLagna ? 'Lagna (H1)' : `H${data.houseNum}`}
                    </text>

                    {/* Points Count */}
                    <text
                      x="0"
                      y="5"
                      textAnchor="middle"
                      fill={isSelected ? '#681F0F' : data.statusColor.text}
                      fontSize="22"
                      fontWeight="900"
                      fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                      className="tracking-tight"
                    >
                      {data.points}
                    </text>

                    {/* Bhāva Name */}
                    <text
                      x="0"
                      y="20"
                      textAnchor="middle"
                      fill="#7A6B5C"
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {data.shortName.split(' ')[0]}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Central Summary Box (x: 200, y: 200, w: 200, h: 200) */}
            <rect
              x="201"
              y="201"
              width="198"
              height="198"
              fill="#F4EFE6"
              stroke="#B3A28F"
              strokeWidth="2"
            />
            <g transform="translate(300, 300)">
              <rect
                x="-88"
                y="-88"
                width="176"
                height="176"
                rx="6"
                fill="#FAF6EE"
                stroke="#D8CEBA"
                strokeWidth="1.2"
              />

              <text
                x="0"
                y="-55"
                textAnchor="middle"
                fill="#8C2D19"
                fontSize="9.5"
                fontWeight="bold"
                letterSpacing="1.2"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                EAST INDIAN
              </text>

              <text
                x="0"
                y="-36"
                textAnchor="middle"
                fill="#2B1810"
                fontSize="13"
                fontWeight="bold"
                fontFamily="Georgia, serif"
              >
                {targetTitle}
              </text>

              <line x1="-55" y1="-26" x2="55" y2="-26" stroke="#E6DEC8" strokeWidth="1" />

              <text
                x="0"
                y="-10"
                textAnchor="middle"
                fill="#6B5E51"
                fontSize="9"
                fontWeight="600"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                TOTAL BINDUS
              </text>
              <text
                x="0"
                y="16"
                textAnchor="middle"
                fill="#8C2D19"
                fontSize="24"
                fontWeight="900"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              >
                {totalPoints}
              </text>

              <text
                x="0"
                y="34"
                textAnchor="middle"
                fill="#594B40"
                fontSize="9.5"
                fontWeight="600"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              >
                Mean: {averagePoints.toFixed(1)}
              </text>

              <text
                x="0"
                y="55"
                textAnchor="middle"
                fill="#8C2D19"
                fontSize="11"
                fontWeight="bold"
                fontFamily="Georgia, serif"
              >
                अष्टकवर्ग
              </text>
            </g>

            {/* Linework overlay for East Indian geometry */}
            <rect x="1" y="1" width="598" height="598" fill="none" stroke="#635345" strokeWidth="3" pointerEvents="none" />
            <line x1="200" y1="0" x2="200" y2="600" stroke="#7A6B5C" strokeWidth="1.5" pointerEvents="none" />
            <line x1="400" y1="0" x2="400" y2="600" stroke="#7A6B5C" strokeWidth="1.5" pointerEvents="none" />
            <line x1="0" y1="200" x2="600" y2="200" stroke="#7A6B5C" strokeWidth="1.5" pointerEvents="none" />
            <line x1="0" y1="400" x2="600" y2="400" stroke="#7A6B5C" strokeWidth="1.5" pointerEvents="none" />
            {/* Corner Diagonals */}
            <line x1="0" y1="0" x2="200" y2="200" stroke="#7A6B5C" strokeWidth="1.5" pointerEvents="none" />
            <line x1="600" y1="0" x2="400" y2="200" stroke="#7A6B5C" strokeWidth="1.5" pointerEvents="none" />
            <line x1="0" y1="600" x2="200" y2="400" stroke="#7A6B5C" strokeWidth="1.5" pointerEvents="none" />
            <line x1="600" y1="600" x2="400" y2="400" stroke="#7A6B5C" strokeWidth="1.5" pointerEvents="none" />
          </g>
        )}
      </svg>
    </div>
  );
};

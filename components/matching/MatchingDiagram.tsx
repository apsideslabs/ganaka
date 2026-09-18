'use client';

import React from 'react';
import { PersonLunarData } from '@/lib/jyotisha/kuta/ashtakuta-calculator';
import { RASHIS } from '@/lib/jyotisha/constants';

interface MatchingDiagramProps {
  groom: PersonLunarData;
  bride: PersonLunarData;
}

export function MatchingDiagram({ groom, bride }: MatchingDiagramProps) {
  // Center of SVG
  const cx = 150;
  const cy = 150;
  const outerR = 125;
  const innerR = 90;

  // Compute angles on the 12-Rashi circle (0 to 360 deg)
  // Each Rashi is 30 deg.
  const groomAngle = ((groom.rashiNumber - 1) * 30 + 15) * (Math.PI / 180);
  const brideAngle = ((bride.rashiNumber - 1) * 30 + 15) * (Math.PI / 180);

  const gX = cx + Math.cos(groomAngle - Math.PI / 2) * 85;
  const gY = cy + Math.sin(groomAngle - Math.PI / 2) * 85;

  const bX = cx + Math.cos(brideAngle - Math.PI / 2) * 85;
  const bY = cy + Math.sin(brideAngle - Math.PI / 2) * 85;

  let displacement = (groom.rashiNumber - bride.rashiNumber + 1);
  if (displacement <= 0) displacement += 12;

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col items-center">
      <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
        <h4 className="text-xs font-serif font-bold text-stone-900">
          Zodiacal Displacement (Bhakūṭa Geometry)
        </h4>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold">
          Count: {displacement} / 12
        </span>
      </div>

      <div className="relative w-full max-w-[300px] aspect-square flex items-center justify-center">
        <svg viewBox="0 0 300 300" className="w-full h-full select-none" fill="none">
          {/* Outer Calibration Circles */}
          <circle cx={cx} cy={cy} r={outerR} stroke="#DCD5C6" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx={cx} cy={cy} r={innerR} stroke="#E7E2D6" strokeWidth="0.75" />

          {/* 12 Rashi Sectors */}
          {Array.from({ length: 12 }).map((_, i) => {
            const rashiNum = (i + 1) as keyof typeof RASHIS;
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const lineX1 = cx + Math.cos(angle) * (innerR - 10);
            const lineY1 = cy + Math.sin(angle) * (innerR - 10);
            const lineX2 = cx + Math.cos(angle) * outerR;
            const lineY2 = cy + Math.sin(angle) * outerR;

            const labelAngle = (i * 30 + 15 - 90) * (Math.PI / 180);
            const labelX = cx + Math.cos(labelAngle) * (outerR - 16);
            const labelY = cy + Math.sin(labelAngle) * (outerR - 16);

            const isGroomRashi = groom.rashiNumber === rashiNum;
            const isBrideRashi = bride.rashiNumber === rashiNum;

            return (
              <g key={`rashi-diag-${i}`}>
                <line x1={lineX1} y1={lineY1} x2={lineX2} y2={lineY2} stroke="#E7E2D6" strokeWidth="0.75" />
                <text
                  x={labelX}
                  y={labelY + 3}
                  textAnchor="middle"
                  className={`text-[9px] font-mono ${
                    isGroomRashi || isBrideRashi
                      ? 'fill-[#8C2D19] font-bold'
                      : 'fill-stone-400 font-normal'
                  }`}
                >
                  {RASHIS[rashiNum].sanskritName.slice(0, 3)}
                </text>
              </g>
            );
          })}

          {/* Connection Vector between Groom & Bride */}
          <line
            x1={gX}
            y1={gY}
            x2={bX}
            y2={bY}
            stroke="#8C2D19"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />

          {/* Groom Marker */}
          <g>
            <circle cx={gX} cy={gY} r="14" fill="#171614" stroke="#8C2D19" strokeWidth="1.5" />
            <text x={gX} y={gY + 3.5} textAnchor="middle" fill="#FCFAF6" className="text-[9px] font-mono font-bold">
              ♂
            </text>
          </g>

          {/* Bride Marker */}
          <g>
            <circle cx={bX} cy={bY} r="14" fill="#8C2D19" stroke="#171614" strokeWidth="1.5" />
            <text x={bX} y={bY + 3.5} textAnchor="middle" fill="#FCFAF6" className="text-[9px] font-mono font-bold">
              ♀
            </text>
          </g>

          {/* Center Hub */}
          <circle cx={cx} cy={cy} r="6" fill="#DCD5C6" />
        </svg>
      </div>

      <div className="flex items-center gap-6 mt-1 text-[11px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#171614] border border-[#8C2D19]" />
          <span className="text-stone-700">Groom ({groom.rashiName})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8C2D19] border border-[#171614]" />
          <span className="text-stone-700">Bride ({bride.rashiName})</span>
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * Gaṇaka — Divisional Chart Diagram (High-Definition Crisp Vector SVG)
 * Unified with the high-contrast professional astrology-software vector rendering engine.
 * Renders authentic North Indian (Diamond / Kendra), South Indian (Fixed 12-Rāśi box),
 * and East Indian (Bengali / Mithila) Kuṇḍalīs in pure, scalable vector SVG.
 */

import React, { useState, useMemo, useRef } from 'react';
import { PlanetId } from '@/lib/astronomy/ephemeris';
import { RashiNumber, VargaId } from '@/lib/jyotisha/types';
import {
  ChartStyleType,
  ChartPlanetItem,
  PLANET_SHORT_LABELS,
  PLANET_FULL_NAMES,
  RASHI_DATA,
  getHouseForRashi,
  downloadChartAsSvg,
  downloadChartAsPng,
} from '../charts/chartLayoutUtils';
import { NorthIndianSVG } from '../charts/NorthIndianSVG';
import { SouthIndianSVG } from '../charts/SouthIndianSVG';
import { EastIndianSVG } from '../charts/EastIndianSVG';
import { Download, FileImage, Eye } from 'lucide-react';

export interface DivisionalChartDiagramProps {
  vargaId: VargaId;
  vargaName: string;
  sanskritName: string;
  significance: string;
  divisionFactor: number;
  lagnaRashi: RashiNumber;
  lagnaDegreeStr?: string;
  planets: Record<
    PlanetId,
    {
      rashiNumber: RashiNumber;
      degreeStr?: string;
      isRetrograde?: boolean;
      isCombust?: boolean;
    }
  >;
  initialStyle?: ChartStyleType;
  highlightHouse?: number;
  onHouseClick?: (houseNum: number) => void;
}

export const DivisionalChartDiagram: React.FC<DivisionalChartDiagramProps> = ({
  vargaId,
  vargaName,
  sanskritName,
  significance,
  divisionFactor,
  lagnaRashi,
  lagnaDegreeStr,
  planets,
  initialStyle = 'north',
  highlightHouse,
  onHouseClick,
}) => {
  const [chartStyle, setChartStyle] = useState<ChartStyleType>(initialStyle);
  const [showDegrees, setShowDegrees] = useState<boolean>(false);
  const [selectedHouse, setSelectedHouse] = useState<number | null>(highlightHouse ?? null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Transform raw planet record into structured items
  const structuredPlanets: ChartPlanetItem[] = useMemo(() => {
    const list: ChartPlanetItem[] = [];
    for (const [pId, pData] of Object.entries(planets)) {
      if (pData && pData.rashiNumber) {
        const id = pId as PlanetId;
        list.push({
          id,
          label: PLANET_SHORT_LABELS[id] || pId.slice(0, 2),
          fullName: PLANET_FULL_NAMES[id] || pId,
          degreeStr: pData.degreeStr,
          isRetro: !!pData.isRetrograde,
          isComb: !!pData.isCombust,
          rashiNumber: pData.rashiNumber,
        });
      }
    }
    return list;
  }, [planets]);

  // Group planets by House (1 to 12) for North Indian chart
  const planetsByHouse = useMemo(() => {
    const map: Record<number, ChartPlanetItem[]> = {
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
      7: [], 8: [], 9: [], 10: [], 11: [], 12: [],
    };
    for (const p of structuredPlanets) {
      const h = getHouseForRashi(p.rashiNumber, lagnaRashi);
      if (map[h]) map[h].push(p);
    }
    return map;
  }, [structuredPlanets, lagnaRashi]);

  // Group planets by Rashi (1 to 12) for South and East Indian charts
  const planetsByRashi = useMemo(() => {
    const map: Record<RashiNumber, ChartPlanetItem[]> = {
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
      7: [], 8: [], 9: [], 10: [], 11: [], 12: [],
    };
    for (const p of structuredPlanets) {
      if (map[p.rashiNumber]) map[p.rashiNumber].push(p);
    }
    return map;
  }, [structuredPlanets]);

  const handleHouseClick = (h: number) => {
    setSelectedHouse((prev) => (prev === h ? null : h));
    if (onHouseClick) onHouseClick(h);
  };

  const handleExportSvg = () => {
    const safeTitle = `${vargaId}_${vargaName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadChartAsSvg(svgRef.current, `${safeTitle}-${chartStyle}`);
  };

  const handleExportPng = () => {
    const safeTitle = `${vargaId}_${vargaName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadChartAsPng(svgRef.current, `${safeTitle}-${chartStyle}`, 1200);
  };

  return (
    <div
      id={`divisional-chart-card-${vargaId.toLowerCase()}`}
      className="flex flex-col items-center bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs w-full select-none"
    >
      {/* Chart Top Control Bar */}
      <div className="flex items-center justify-between w-full pb-3.5 mb-3 border-b border-slate-100 flex-wrap gap-2.5">
        {/* Style Selector Tabs */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 font-sans text-xs">
          <button
            type="button"
            id="varga-diagram-north-btn"
            onClick={() => setChartStyle('north')}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
              chartStyle === 'north'
                ? 'bg-[#8C2D19] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            North Indian
          </button>
          <button
            type="button"
            id="varga-diagram-south-btn"
            onClick={() => setChartStyle('south')}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
              chartStyle === 'south'
                ? 'bg-[#8C2D19] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            South Indian
          </button>
          <button
            type="button"
            id="varga-diagram-east-btn"
            onClick={() => setChartStyle('east')}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
              chartStyle === 'east'
                ? 'bg-[#8C2D19] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            East Indian
          </button>
        </div>

        {/* Action Controls: Degrees Toggle, SVG, PNG */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id="varga-diagram-degrees-toggle"
            onClick={() => setShowDegrees(!showDegrees)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium rounded-lg border transition-colors cursor-pointer ${
              showDegrees
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle exact planet degrees in chart"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Degrees</span>
          </button>

          <button
            type="button"
            id="varga-diagram-export-svg"
            onClick={handleExportSvg}
            className="p-1.5 text-slate-600 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Export crisp vector SVG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            id="varga-diagram-export-png"
            onClick={handleExportPng}
            className="p-1.5 text-slate-600 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Export high-resolution PNG (1200px)"
          >
            <FileImage className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full aspect-square max-w-[500px] flex items-center justify-center">
        {chartStyle === 'north' && (
          <NorthIndianSVG
            svgRef={svgRef}
            lagnaRashi={lagnaRashi}
            lagnaDegreeStr={lagnaDegreeStr}
            planetsByHouse={planetsByHouse}
            highlightHouse={selectedHouse ?? undefined}
            onHouseClick={handleHouseClick}
            showDegrees={showDegrees}
          />
        )}
        {chartStyle === 'south' && (
          <SouthIndianSVG
            svgRef={svgRef}
            lagnaRashi={lagnaRashi}
            lagnaDegreeStr={lagnaDegreeStr}
            planetsByRashi={planetsByRashi}
            highlightHouse={selectedHouse ?? undefined}
            onHouseClick={handleHouseClick}
            showDegrees={showDegrees}
            centerTitle={`${vargaId} • ${vargaName}`}
            centerSubtitle={`${sanskritName} (1/${divisionFactor})`}
          />
        )}
        {chartStyle === 'east' && (
          <EastIndianSVG
            svgRef={svgRef}
            lagnaRashi={lagnaRashi}
            lagnaDegreeStr={lagnaDegreeStr}
            planetsByRashi={planetsByRashi}
            highlightHouse={selectedHouse ?? undefined}
            onHouseClick={handleHouseClick}
            showDegrees={showDegrees}
            centerTitle={`${vargaId} • ${vargaName}`}
            centerSubtitle={`${sanskritName} (1/${divisionFactor})`}
          />
        )}
      </div>

      {/* Chart Footer Indicator */}
      <div className="mt-3.5 flex items-center justify-between w-full text-xs text-slate-500 px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-rose-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-600" /> Lagna ({RASHI_DATA[lagnaRashi]?.english})
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-red-600 font-bold">(R) Retro</span>
          <span className="text-slate-300">•</span>
          <span className="text-amber-600 font-bold">(C) Combust</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
          {chartStyle === 'north' ? 'Diamond / Kendra' : chartStyle === 'south' ? 'Fixed 12 Rāśi' : 'East / Bengali'}
        </span>
      </div>
    </div>
  );
};

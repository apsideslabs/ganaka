'use client';

/**
 * Gaṇaka — Classical Kuṇḍalī Chart Visualizer
 * Renders authentic North Indian (Diamond / Kendra), South Indian (Fixed 12-Rāśi box),
 * and East Indian (Bengali / Mithila) Kuṇḍalīs in pure, scalable vector SVG.
 * Includes boundary containment clip-paths, non-colliding stellium positioning,
 * and high-resolution SVG/PNG export.
 */

import React, { useState, useMemo, useRef } from 'react';
import { PlanetId } from '../../lib/astronomy/ephemeris';
import { RashiNumber } from '../../lib/jyotisha/types';
import {
  ChartStyleType,
  ChartPlanetItem,
  PLANET_SHORT_LABELS,
  PLANET_FULL_NAMES,
  getHouseForRashi,
  getRashiForHouse,
  downloadChartAsSvg,
  downloadChartAsPng,
} from './chartLayoutUtils';
import { NorthIndianSVG } from './NorthIndianSVG';
import { SouthIndianSVG } from './SouthIndianSVG';
import { EastIndianSVG } from './EastIndianSVG';
import { Download, FileImage, Sparkles } from 'lucide-react';

export interface KundaliChartProps {
  lagnaRashi: RashiNumber;
  lagnaDegreeStr?: string;
  planets: Record<PlanetId, { rashiNumber: RashiNumber; degreeStr?: string; isRetrograde?: boolean; isCombust?: boolean }>;
  title?: string;
  subtitle?: string;
  style?: ChartStyleType;
  size?: number;
  highlightHouse?: number;
  onHouseClick?: (houseNum: number) => void;
  showDegreesDefault?: boolean;
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
  showDegreesDefault = false,
}) => {
  const [chartStyle, setChartStyle] = useState<ChartStyleType>(initialStyle);
  const [prevInitialStyle, setPrevInitialStyle] = useState<ChartStyleType>(initialStyle);
  const [showDegrees, setShowDegrees] = useState<boolean>(showDegreesDefault);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Sync state if initialStyle prop changes from outside without triggering useEffect cascade
  if (initialStyle !== prevInitialStyle) {
    setPrevInitialStyle(initialStyle);
    setChartStyle(initialStyle);
  }

  // Transform raw planet record into typed list of ChartPlanetItem
  const structuredPlanets: ChartPlanetItem[] = useMemo(() => {
    const list: ChartPlanetItem[] = [];

    for (const [pId, pData] of Object.entries(planets)) {
      if (pData && pData.rashiNumber) {
        const id = pId as PlanetId;
        list.push({
          id,
          label: PLANET_SHORT_LABELS[id] || pId.slice(0, 2),
          fullName: PLANET_FULL_NAMES[id] || pId,
          degreeStr:
            pData.degreeStr ||
            (typeof (pData as any).degreeInRashi === 'number'
              ? `${(pData as any).degreeInRashi.toFixed(1)}°`
              : undefined),
          isRetro: !!pData.isRetrograde,
          isComb: !!pData.isCombust,
          rashiNumber: pData.rashiNumber,
        });
      }
    }

    return list;
  }, [planets]);

  // Group planets by Rashi Number (1 to 12) for South and East Indian charts
  const planetsByRashi = useMemo(() => {
    const grouped: Record<RashiNumber, ChartPlanetItem[]> = {
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
      7: [], 8: [], 9: [], 10: [], 11: [], 12: [],
    };

    for (const p of structuredPlanets) {
      if (grouped[p.rashiNumber]) {
        grouped[p.rashiNumber].push(p);
      }
    }

    return grouped;
  }, [structuredPlanets]);

  // Group planets by House Number (1 to 12) for North Indian chart
  const planetsByHouse = useMemo(() => {
    const grouped: Record<number, ChartPlanetItem[]> = {
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
      7: [], 8: [], 9: [], 10: [], 11: [], 12: [],
    };

    for (const p of structuredPlanets) {
      const houseNum = getHouseForRashi(p.rashiNumber, lagnaRashi);
      if (grouped[houseNum]) {
        grouped[houseNum].push(p);
      }
    }

    return grouped;
  }, [structuredPlanets, lagnaRashi]);

  // Export handlers
  const handleExportSvg = () => {
    const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadChartAsSvg(svgRef.current, `${safeTitle}-${chartStyle}`);
  };

  const handleExportPng = () => {
    const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    downloadChartAsPng(svgRef.current, `${safeTitle}-${chartStyle}`, 1200);
  };

  return (
    <div className="flex flex-col items-center bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs w-full max-w-xl select-none">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mb-3 pb-3 border-b border-slate-100 gap-2.5">
        <div>
          <h4 className="text-sm sm:text-base font-serif font-bold text-slate-900 tracking-tight">{title}</h4>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>

        <div className="flex items-center flex-wrap gap-1.5 self-end sm:self-auto">
          {/* Style Selector Tabs */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-xs">
            <button
              type="button"
              onClick={() => setChartStyle('north')}
              className={`px-2.5 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                chartStyle === 'north'
                  ? 'bg-[#8C2D19] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="North Indian Diamond Chart"
            >
              North
            </button>
            <button
              type="button"
              onClick={() => setChartStyle('south')}
              className={`px-2.5 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                chartStyle === 'south'
                  ? 'bg-[#8C2D19] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="South Indian Fixed-Rashi Box Chart"
            >
              South
            </button>
            <button
              type="button"
              onClick={() => setChartStyle('east')}
              className={`px-2.5 py-1 font-semibold rounded-md transition-all cursor-pointer ${
                chartStyle === 'east'
                  ? 'bg-[#8C2D19] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="East Indian (Bengali/Mithila) Chart"
            >
              East
            </button>
          </div>

          {/* Degrees Toggle */}
          <button
            type="button"
            onClick={() => setShowDegrees(!showDegrees)}
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg border transition-colors cursor-pointer ${
              showDegrees
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle Planetary Degrees"
          >
            °Deg
          </button>

          {/* Export SVG */}
          <button
            type="button"
            onClick={handleExportSvg}
            className="p-1.5 text-slate-600 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Download Crisp Vector SVG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Export PNG */}
          <button
            type="button"
            onClick={handleExportPng}
            className="p-1.5 text-slate-600 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Download High-Resolution PNG (1200px)"
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
            highlightHouse={highlightHouse}
            onHouseClick={onHouseClick}
            showDegrees={showDegrees}
          />
        )}
        {chartStyle === 'south' && (
          <SouthIndianSVG
            svgRef={svgRef}
            lagnaRashi={lagnaRashi}
            lagnaDegreeStr={lagnaDegreeStr}
            planetsByRashi={planetsByRashi}
            highlightHouse={highlightHouse}
            onHouseClick={onHouseClick}
            showDegrees={showDegrees}
          />
        )}
        {chartStyle === 'east' && (
          <EastIndianSVG
            svgRef={svgRef}
            lagnaRashi={lagnaRashi}
            lagnaDegreeStr={lagnaDegreeStr}
            planetsByRashi={planetsByRashi}
            highlightHouse={highlightHouse}
            onHouseClick={onHouseClick}
            showDegrees={showDegrees}
          />
        )}
      </div>

      {/* Footer Legend & Status */}
      <div className="mt-3.5 flex items-center justify-between w-full text-xs text-slate-500 px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-rose-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-600" /> Lagna
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-red-600 font-bold">
            <sup className="text-[9px] font-black">R</sup> Retrograde
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-amber-600 font-bold">
            <sup className="text-[9px] font-black">C</sup> Combust
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
          {chartStyle === 'north' ? 'Diamond / Kendra' : chartStyle === 'south' ? 'Fixed 12 Rāśi' : 'Bengali / Mithila'}
        </span>
      </div>
    </div>
  );
};

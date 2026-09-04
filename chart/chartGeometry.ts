/**
 * North Indian Vedic Kundali Chart Geometry Module
 * Provides mathematical coordinates, line definitions, and house regions
 * for classical North Indian (Diamond) chart structure.
 */

import { HouseRegion } from './types';

export interface ChartGeometryConfig {
  size: number;
  padding: number;
}

export interface ChartGeometry {
  size: number;
  padding: number;
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
    midX: number;
    midY: number;
  };
  keyPoints: {
    tl: [number, number]; // Top-Left
    tc: [number, number]; // Top-Center
    tr: [number, number]; // Top-Right
    rc: [number, number]; // Right-Center
    br: [number, number]; // Bottom-Right
    bc: [number, number]; // Bottom-Center
    bl: [number, number]; // Bottom-Left
    lc: [number, number]; // Left-Center
    center: [number, number]; // Center
    tlc: [number, number]; // Top-Left Center intersection
    trc: [number, number]; // Top-Right Center intersection
    brc: [number, number]; // Bottom-Right Center intersection
    blc: [number, number]; // Bottom-Left Center intersection
  };
  lines: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    type: 'outer' | 'diamond' | 'diagonal';
  }>;
  houses: Record<number, HouseRegion>;
}

export const DEFAULT_GEOMETRY_CONFIG: ChartGeometryConfig = {
  size: 800,
  padding: 50,
};

/**
 * Calculates deterministic mathematical coordinates for the North Indian chart.
 */
export function calculateChartGeometry(
  config: Partial<ChartGeometryConfig> = {}
): ChartGeometry {
  const size = config.size ?? DEFAULT_GEOMETRY_CONFIG.size;
  const padding = config.padding ?? DEFAULT_GEOMETRY_CONFIG.padding;

  const minX = padding;
  const minY = padding;
  const maxX = size - padding;
  const maxY = size - padding;
  const width = maxX - minX;
  const height = maxY - minY;
  const midX = minX + width / 2;
  const midY = minY + height / 2;

  // Key primary points
  const tl: [number, number] = [minX, minY];
  const tc: [number, number] = [midX, minY];
  const tr: [number, number] = [maxX, minY];
  const rc: [number, number] = [maxX, midY];
  const br: [number, number] = [maxX, maxY];
  const bc: [number, number] = [midX, maxY];
  const bl: [number, number] = [minX, maxY];
  const lc: [number, number] = [minX, midY];
  const center: [number, number] = [midX, midY];

  // Intersection points of diagonals with inner diamond edges
  const tlc: [number, number] = [minX + width * 0.25, minY + height * 0.25];
  const trc: [number, number] = [minX + width * 0.75, minY + height * 0.25];
  const brc: [number, number] = [minX + width * 0.75, minY + height * 0.75];
  const blc: [number, number] = [minX + width * 0.25, minY + height * 0.75];

  // Structural lines for rendering
  const lines: ChartGeometry['lines'] = [
    // Outer border square
    { x1: tl[0], y1: tl[1], x2: tr[0], y2: tr[1], type: 'outer' },
    { x1: tr[0], y1: tr[1], x2: br[0], y2: br[1], type: 'outer' },
    { x1: br[0], y1: br[1], x2: bl[0], y2: bl[1], type: 'outer' },
    { x1: bl[0], y1: bl[1], x2: tl[0], y2: tl[1], type: 'outer' },

    // Inner diamond edges
    { x1: tc[0], y1: tc[1], x2: rc[0], y2: rc[1], type: 'diamond' },
    { x1: rc[0], y1: rc[1], x2: bc[0], y2: bc[1], type: 'diamond' },
    { x1: bc[0], y1: bc[1], x2: lc[0], y2: lc[1], type: 'diamond' },
    { x1: lc[0], y1: lc[1], x2: tc[0], y2: tc[1], type: 'diamond' },

    // Full diagonals
    { x1: tl[0], y1: tl[1], x2: br[0], y2: br[1], type: 'diagonal' },
    { x1: tr[0], y1: tr[1], x2: bl[0], y2: bl[1], type: 'diagonal' },
  ];

  // Precise 12 House Regions
  const houses: Record<number, HouseRegion> = {
    // 1st House: Top Central Diamond (Lagna)
    1: {
      house: 1,
      type: 'diamond',
      points: [tc, trc, center, tlc],
      anchor: { x: midX, y: minY + height * 0.24 },
      signNumberAnchor: { x: midX, y: minY + height * 0.42 },
    },
    // 2nd House: Top Left Triangle
    2: {
      house: 2,
      type: 'triangle',
      points: [tl, tc, tlc],
      anchor: { x: minX + width * 0.25, y: minY + height * 0.10 },
      signNumberAnchor: { x: minX + width * 0.38, y: minY + height * 0.20 },
    },
    // 3rd House: Upper-Left Side Triangle
    3: {
      house: 3,
      type: 'triangle',
      points: [tl, tlc, lc],
      anchor: { x: minX + width * 0.10, y: minY + height * 0.25 },
      signNumberAnchor: { x: minX + width * 0.20, y: minY + height * 0.38 },
    },
    // 4th House: Left Middle Diamond
    4: {
      house: 4,
      type: 'diamond',
      points: [lc, tlc, center, blc],
      anchor: { x: minX + width * 0.24, y: midY },
      signNumberAnchor: { x: minX + width * 0.42, y: midY },
    },
    // 5th House: Lower-Left Side Triangle
    5: {
      house: 5,
      type: 'triangle',
      points: [lc, blc, bl],
      anchor: { x: minX + width * 0.10, y: minY + height * 0.75 },
      signNumberAnchor: { x: minX + width * 0.20, y: minY + height * 0.62 },
    },
    // 6th House: Bottom Left Triangle
    6: {
      house: 6,
      type: 'triangle',
      points: [bl, blc, bc],
      anchor: { x: minX + width * 0.25, y: minY + height * 0.90 },
      signNumberAnchor: { x: minX + width * 0.38, y: minY + height * 0.80 },
    },
    // 7th House: Bottom Central Diamond
    7: {
      house: 7,
      type: 'diamond',
      points: [bc, blc, center, brc],
      anchor: { x: midX, y: minY + height * 0.76 },
      signNumberAnchor: { x: midX, y: minY + height * 0.58 },
    },
    // 8th House: Bottom Right Triangle
    8: {
      house: 8,
      type: 'triangle',
      points: [bc, brc, br],
      anchor: { x: minX + width * 0.75, y: minY + height * 0.90 },
      signNumberAnchor: { x: minX + width * 0.62, y: minY + height * 0.80 },
    },
    // 9th House: Lower-Right Side Triangle
    9: {
      house: 9,
      type: 'triangle',
      points: [br, brc, rc],
      anchor: { x: minX + width * 0.90, y: minY + height * 0.75 },
      signNumberAnchor: { x: minX + width * 0.80, y: minY + height * 0.62 },
    },
    // 10th House: Right Middle Diamond
    10: {
      house: 10,
      type: 'diamond',
      points: [rc, brc, center, trc],
      anchor: { x: minX + width * 0.76, y: midY },
      signNumberAnchor: { x: minX + width * 0.58, y: midY },
    },
    // 11th House: Upper-Right Side Triangle
    11: {
      house: 11,
      type: 'triangle',
      points: [rc, trc, tr],
      anchor: { x: minX + width * 0.90, y: minY + height * 0.25 },
      signNumberAnchor: { x: minX + width * 0.80, y: minY + height * 0.38 },
    },
    // 12th House: Top Right Triangle
    12: {
      house: 12,
      type: 'triangle',
      points: [tr, trc, tc],
      anchor: { x: minX + width * 0.75, y: minY + height * 0.10 },
      signNumberAnchor: { x: minX + width * 0.62, y: minY + height * 0.20 },
    },
  };

  return {
    size,
    padding,
    bounds: {
      minX,
      minY,
      maxX,
      maxY,
      width,
      height,
      midX,
      midY,
    },
    keyPoints: {
      tl,
      tc,
      tr,
      rc,
      br,
      bc,
      bl,
      lc,
      center,
      tlc,
      trc,
      brc,
      blc,
    },
    lines,
    houses,
  };
}

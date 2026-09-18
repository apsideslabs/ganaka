/**
 * Gaṇaka — Classical Kuṇḍalī Chart Layout & Export Utilities
 * Shared types, color constants, astronomical nomenclature, and export helpers.
 */

import { PlanetId } from '../../lib/astronomy/ephemeris';
import { RashiNumber } from '../../lib/jyotisha/types';

export type ChartStyleType = 'north' | 'south' | 'east';

export interface ChartPlanetItem {
  id: PlanetId;
  label: string;
  fullName: string;
  degreeStr?: string;
  isRetro: boolean;
  isComb: boolean;
  rashiNumber: RashiNumber;
}

export const PLANET_SHORT_LABELS: Record<PlanetId, string> = {
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

export const PLANET_FULL_NAMES: Record<PlanetId, string> = {
  sun: 'Sūrya',
  moon: 'Candra',
  mars: 'Maṅgala',
  mercury: 'Budha',
  jupiter: 'Bṛhaspati',
  venus: 'Śukra',
  saturn: 'Śani',
  rahu: 'Rāhu',
  ketu: 'Ketu',
  true_rahu: 'True Rāhu',
  true_ketu: 'True Ketu',
};

export interface GrahaColorSpec {
  text: string;
  bg: string;
  border: string;
}

export const GRAHA_COLOR_MAP: Record<PlanetId, GrahaColorSpec> = {
  sun: { text: '#C2410C', bg: '#FFF7ED', border: '#FDBA74' },
  moon: { text: '#0369A1', bg: '#F0F9FF', border: '#BAE6FD' },
  mars: { text: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
  mercury: { text: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
  jupiter: { text: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  venus: { text: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' },
  saturn: { text: '#1E3A8A', bg: '#EFF6FF', border: '#BFDBFE' },
  rahu: { text: '#4C1D95', bg: '#FAF5FF', border: '#E9D5FF' },
  ketu: { text: '#78350F', bg: '#FEF3C7', border: '#FDE68A' },
  true_rahu: { text: '#4C1D95', bg: '#FAF5FF', border: '#E9D5FF' },
  true_ketu: { text: '#78350F', bg: '#FEF3C7', border: '#FDE68A' },
};

export interface RashiMeta {
  number: RashiNumber;
  sanskrit: string;
  english: string;
  bengali: string;
}

export const RASHI_DATA: Record<RashiNumber, RashiMeta> = {
  1: { number: 1, sanskrit: 'Meṣa', english: 'Aries', bengali: 'মেষ' },
  2: { number: 2, sanskrit: 'Vṛṣabha', english: 'Taurus', bengali: 'বৃষ' },
  3: { number: 3, sanskrit: 'Mithuna', english: 'Gemini', bengali: 'মিথুন' },
  4: { number: 4, sanskrit: 'Karka', english: 'Cancer', bengali: 'কর্কট' },
  5: { number: 5, sanskrit: 'Siṃha', english: 'Leo', bengali: 'সিংহ' },
  6: { number: 6, sanskrit: 'Kanyā', english: 'Virgo', bengali: 'কন্যা' },
  7: { number: 7, sanskrit: 'Tulā', english: 'Libra', bengali: 'তুলা' },
  8: { number: 8, sanskrit: 'Vṛścika', english: 'Scorpio', bengali: 'বৃশ্চিক' },
  9: { number: 9, sanskrit: 'Dhanu', english: 'Sagittarius', bengali: 'ধনু' },
  10: { number: 10, sanskrit: 'Makara', english: 'Capricorn', bengali: 'মকর' },
  11: { number: 11, sanskrit: 'Kumbha', english: 'Aquarius', bengali: 'কুম্ভ' },
  12: { number: 12, sanskrit: 'Mīna', english: 'Pisces', bengali: 'মীন' },
};

/**
 * Calculates the House Number (1 to 12) for a given Rashi, relative to the Lagna Rashi.
 */
export function getHouseForRashi(rashi: RashiNumber, lagnaRashi: RashiNumber): number {
  return ((rashi - lagnaRashi + 12) % 12) + 1;
}

/**
 * Calculates the Rashi Number (1 to 12) for a given House Number (1 to 12), relative to the Lagna Rashi.
 */
export function getRashiForHouse(house: number, lagnaRashi: RashiNumber): RashiNumber {
  return (((lagnaRashi - 1 + (house - 1)) % 12) + 1) as RashiNumber;
}

/**
 * Clean export to standalone vector SVG file
 */
export function downloadChartAsSvg(svgElement: SVGSVGElement | null, filename: string): void {
  if (!svgElement) return;
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);

  // Ensure standalone SVG namespace
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = `${filename}.svg`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

/**
 * Clean export to high-resolution PNG file (1200x1200px)
 */
export function downloadChartAsPng(
  svgElement: SVGSVGElement | null,
  filename: string,
  targetResolution = 1200
): void {
  if (!svgElement) return;
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svgElement);
  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = targetResolution;
    canvas.height = targetResolution;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, targetResolution, targetResolution);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const pngUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${filename}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(pngUrl);
    }, 'image/png');

    URL.revokeObjectURL(url);
  };
  img.src = url;
}

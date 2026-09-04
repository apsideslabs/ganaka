/**
 * Core Data Structures for North Indian Vedic Chart (D1)
 */

export interface PlanetPosition {
  name: string;
  sign: number; // 1 = Aries (Meṣa) .. 12 = Pisces (Mīna)
  degree: number; // 0.0 to 29.999... (degrees within the sign)
  retrograde?: boolean;
  speed?: number;
}

export interface AscendantPosition {
  sign: number; // 1 = Aries (Meṣa) .. 12 = Pisces (Mīna)
  degree: number; // 0.0 to 29.999... (degrees within the sign)
}

export interface ChartData {
  ascendant: AscendantPosition;
  planets: PlanetPosition[];
  title?: string;
  subtitle?: string;
}

export interface ChartOptions {
  size?: number;
  padding?: number;
  showDegrees?: boolean;
  degreeFormat?: 'dms' | 'decimal';
  useAstronomicalSymbols?: boolean;
  showSignNumbers?: boolean;
  showAscendantDegree?: boolean;
  theme?: 'classic' | 'warm' | 'high-contrast';
}

export interface HouseRegion {
  house: number; // 1 to 12
  points: Array<[number, number]>;
  anchor: {
    x: number;
    y: number;
  };
  signNumberAnchor: {
    x: number;
    y: number;
  };
  type: 'diamond' | 'triangle';
}

export interface PlacedPlanet {
  planet: PlanetPosition;
  house: number;
  sign: number;
  formattedText: string;
  symbol: string;
  x: number;
  y: number;
  isRetrograde: boolean;
}

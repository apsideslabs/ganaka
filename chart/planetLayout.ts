/**
 * Deterministic Planet & Ascendant Layout Engine
 * Calculates house positions, deterministic coordinates for multiple occupants,
 * formatting of degrees, and symbol mappings.
 */

import { PlanetPosition, AscendantPosition, PlacedPlanet, HouseRegion, ChartOptions } from './types';

export const PLANET_ASTRONOMICAL_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mars: '♂',
  Mercury: '☿',
  Jupiter: '♃',
  Venus: '♀',
  Saturn: '♄',
  Rahu: '☊',
  Ketu: '☋',
  Ascendant: 'Asc',
  Asc: 'Asc',
  Lagna: 'Asc',
};

export const PLANET_SHORT_CODES: Record<string, string> = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
  Ascendant: 'Asc',
  Asc: 'Asc',
  Lagna: 'Asc',
};

export const SIGN_NAMES: Record<number, { en: string; sa: string }> = {
  1: { en: 'Aries', sa: 'Meṣa' },
  2: { en: 'Taurus', sa: 'Vṛṣabha' },
  3: { en: 'Gemini', sa: 'Mithuna' },
  4: { en: 'Cancer', sa: 'Karka' },
  5: { en: 'Leo', sa: 'Siṃha' },
  6: { en: 'Virgo', sa: 'Kanyā' },
  7: { en: 'Libra', sa: 'Tulā' },
  8: { en: 'Scorpio', sa: 'Vṛścika' },
  9: { en: 'Sagittarius', sa: 'Dhanu' },
  10: { en: 'Capricorn', sa: 'Makara' },
  11: { en: 'Aquarius', sa: 'Kumbha' },
  12: { en: 'Pisces', sa: 'Mīna' },
};

/**
 * Maps a house (1–12) to its corresponding zodiac sign given the Ascendant sign.
 */
export function getSignForHouse(house: number, ascendantSign: number): number {
  return ((ascendantSign - 1 + (house - 1)) % 12) + 1;
}

/**
 * Maps a zodiac sign (1–12) to the house (1–12) it occupies given the Ascendant sign.
 */
export function getHouseForSign(sign: number, ascendantSign: number): number {
  return ((sign - ascendantSign + 12) % 12) + 1;
}

/**
 * Formats degrees into DMS (e.g. 12°31′) or decimal (e.g. 12.51°).
 */
export function formatDegree(degree: number, format: 'dms' | 'decimal' = 'dms'): string {
  const normDeg = ((degree % 30) + 30) % 30;
  if (format === 'decimal') {
    return `${normDeg.toFixed(2)}°`;
  }
  const d = Math.floor(normDeg);
  const m = Math.floor((normDeg - d) * 60);
  return `${d}°${m.toString().padStart(2, '0')}′`;
}

/**
 * Gets the display code/symbol for a planet.
 */
export function getPlanetSymbol(name: string, useAstronomicalSymbols = false): string {
  if (useAstronomicalSymbols && PLANET_ASTRONOMICAL_SYMBOLS[name]) {
    return PLANET_ASTRONOMICAL_SYMBOLS[name];
  }
  return PLANET_SHORT_CODES[name] || name.slice(0, 2);
}

/**
 * Formats a planet entry (e.g. "Su" or "Me(R)"). Degrees only if explicitly requested.
 */
export function formatPlanetLabel(
  planet: PlanetPosition,
  options: Partial<ChartOptions> = {}
): string {
  const code = getPlanetSymbol(planet.name, options.useAstronomicalSymbols);
  const retro = planet.retrograde ? '(R)' : '';
  const showDeg = options.showDegrees ?? false;
  if (!showDeg) {
    return `${code}${retro}`;
  }
  const degStr = formatDegree(planet.degree, options.degreeFormat ?? 'dms');
  return `${code}${retro} ${degStr}`;
}

/**
 * Formats the Ascendant label for House 1 (e.g. "Asc"). Degrees only if explicitly requested.
 */
export function formatAscendantLabel(
  ascendant: AscendantPosition,
  options: Partial<ChartOptions> = {}
): string {
  const showDeg = options.showAscendantDegree ?? false;
  if (!showDeg) return 'Asc';
  const degStr = formatDegree(ascendant.degree, options.degreeFormat ?? 'dms');
  return `Asc ${degStr}`;
}

export interface HouseOccupantsLayout {
  house: number;
  sign: number;
  planets: PlacedPlanet[];
}

/**
 * Deterministically calculates exact SVG coordinates for all planets in each house.
 * Uses mathematical anchor positions and grid/stack layouts based on occupant count.
 */
export function calculatePlanetLayouts(
  planets: PlanetPosition[],
  ascendant: AscendantPosition,
  houses: Record<number, HouseRegion>,
  options: Partial<ChartOptions> = {}
): Record<number, HouseOccupantsLayout> {
  const result: Record<number, HouseOccupantsLayout> = {};

  // Initialize all 12 houses
  for (let h = 1; h <= 12; h++) {
    result[h] = {
      house: h,
      sign: getSignForHouse(h, ascendant.sign),
      planets: [],
    };
  }

  // Group planets by house
  const housePlanetsMap: Record<number, PlanetPosition[]> = {};
  for (let h = 1; h <= 12; h++) {
    housePlanetsMap[h] = [];
  }

  for (const planet of planets) {
    const house = getHouseForSign(planet.sign, ascendant.sign);
    if (house >= 1 && house <= 12) {
      housePlanetsMap[house].push(planet);
    }
  }

  // Lay out each house deterministically
  for (let h = 1; h <= 12; h++) {
    const houseRegion = houses[h];
    const housePlanets = housePlanetsMap[h];
    const count = housePlanets.length;
    const anchor = houseRegion.anchor;

    // Line height and vertical spacing for compact typography
    const lineHeight = 18;
    const isDiamond = houseRegion.type === 'diamond';

    // In House 1, Ascendant is placed at top anchor area, so adjust planet anchor down slightly
    const startY = h === 1 ? anchor.y + 14 : anchor.y;

    if (count === 0) {
      continue;
    } else if (count === 1) {
      // Single planet: perfectly centered
      const p = housePlanets[0];
      result[h].planets.push({
        planet: p,
        house: h,
        sign: result[h].sign,
        formattedText: formatPlanetLabel(p, options),
        symbol: getPlanetSymbol(p.name, options.useAstronomicalSymbols),
        x: anchor.x,
        y: startY,
        isRetrograde: !!p.retrograde,
      });
    } else if (count === 2) {
      // Two planets: vertical arrangement
      const offset = lineHeight * 0.55;
      const yPositions = [startY - offset, startY + offset];
      housePlanets.forEach((p, idx) => {
        result[h].planets.push({
          planet: p,
          house: h,
          sign: result[h].sign,
          formattedText: formatPlanetLabel(p, options),
          symbol: getPlanetSymbol(p.name, options.useAstronomicalSymbols),
          x: anchor.x,
          y: yPositions[idx],
          isRetrograde: !!p.retrograde,
        });
      });
    } else if (count === 3) {
      // Three planets: compact vertical stack
      const yPositions = [startY - lineHeight, startY, startY + lineHeight];
      housePlanets.forEach((p, idx) => {
        result[h].planets.push({
          planet: p,
          house: h,
          sign: result[h].sign,
          formattedText: formatPlanetLabel(p, options),
          symbol: getPlanetSymbol(p.name, options.useAstronomicalSymbols),
          x: anchor.x,
          y: yPositions[idx],
          isRetrograde: !!p.retrograde,
        });
      });
    } else {
      // 4+ planets: compact 2-column grid or multi-row stack
      const colWidth = isDiamond ? 64 : 56;
      const rows = Math.ceil(count / 2);
      const startRowY = startY - ((rows - 1) * lineHeight) / 2;

      housePlanets.forEach((p, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const xPos = col === 0 ? anchor.x - colWidth / 2 : anchor.x + colWidth / 2;
        const yPos = startRowY + row * lineHeight;

        result[h].planets.push({
          planet: p,
          house: h,
          sign: result[h].sign,
          formattedText: formatPlanetLabel(p, options),
          symbol: getPlanetSymbol(p.name, options.useAstronomicalSymbols),
          x: xPos,
          y: yPos,
          isRetrograde: !!p.retrograde,
        });
      });
    }
  }

  return result;
}

/**
 * North Indian Vedic Chart (D1) SVG Renderer
 * Uses @svgdotjs/svg.js to programmatically draw pure SVG vector geometry.
 */

import { SVG, Svg } from '@svgdotjs/svg.js';
import { ChartData, ChartOptions } from './types';
import { calculateChartGeometry, ChartGeometry } from './chartGeometry';
import {
  calculatePlanetLayouts,
  formatAscendantLabel,
  SIGN_NAMES,
} from './planetLayout';

export class NorthIndianChartRenderer {
  private data: ChartData;
  private options: ChartOptions;
  private geometry: ChartGeometry;

  constructor(data: ChartData, options: ChartOptions = {}) {
    this.data = data;
    this.options = {
      size: options.size ?? 800,
      padding: options.padding ?? 40,
      showDegrees: options.showDegrees ?? false,
      degreeFormat: options.degreeFormat ?? 'dms',
      useAstronomicalSymbols: options.useAstronomicalSymbols ?? false,
      showSignNumbers: options.showSignNumbers ?? true,
      showAscendantDegree: options.showAscendantDegree ?? false,
      theme: options.theme ?? 'classic',
    };
    this.geometry = calculateChartGeometry({
      size: this.options.size,
      padding: this.options.padding,
    });
  }

  /**
   * Update data and recalculate
   */
  public setData(data: ChartData): void {
    this.data = data;
  }

  /**
   * Update options and recalculate geometry
   */
  public setOptions(options: Partial<ChartOptions>): void {
    this.options = { ...this.options, ...options };
    this.geometry = calculateChartGeometry({
      size: this.options.size,
      padding: this.options.padding,
    });
  }

  /**
   * Theme color palette
   */
  private getColors() {
    switch (this.options.theme) {
      case 'warm':
        return {
          bg: '#FAF8F5',
          strokeOuter: '#2C2218',
          strokeInner: '#3D3124',
          signNumber: '#8B2500',
          planetText: '#1F1A14',
          ascendantText: '#8B2500',
          retrograde: '#A82D00',
          accent: '#8B2500',
        };
      case 'high-contrast':
        return {
          bg: '#FFFFFF',
          strokeOuter: '#000000',
          strokeInner: '#000000',
          signNumber: '#555555',
          planetText: '#000000',
          ascendantText: '#000000',
          retrograde: '#CC0000',
          accent: '#000000',
        };
      case 'classic':
      default:
        return {
          bg: '#FFFFFF',
          strokeOuter: '#1A1A1A',
          strokeInner: '#2A241A',
          signNumber: '#7C3416',
          planetText: '#181818',
          ascendantText: '#8B2500',
          retrograde: '#B91C1C',
          accent: '#8B2500',
        };
    }
  }

  /**
   * Renders the chart SVG directly into a target DOM HTML element.
   */
  public renderToElement(container: HTMLElement): Svg {
    // Clear container
    container.innerHTML = '';

    const size = this.options.size ?? 800;
    const colors = this.getColors();

    // Create SVG root
    const draw = SVG()
      .addTo(container)
      .size('100%', '100%')
      .viewbox(0, 0, size, size)
      .attr({
        role: 'img',
        'aria-label': `North Indian Vedic Kundali Chart - Lagna ${SIGN_NAMES[this.data.ascendant.sign]?.sa || ''}`,
      });

    this.drawStructure(draw, colors);
    this.drawHouseNumbers(draw, colors);
    this.drawAscendant(draw, colors);
    this.drawPlanets(draw, colors);
    this.drawHeader(draw, colors);

    return draw;
  }

  /**
   * Generates pure SVG string for SSR or headless usage.
   */
  public renderToString(): string {
    // If in browser, use an off-screen container
    if (typeof document !== 'undefined') {
      const tempDiv = document.createElement('div');
      this.renderToElement(tempDiv);
      return tempDiv.innerHTML;
    }

    // Pure string fallback for SSR
    return this.renderPureSvgString();
  }

  /**
   * Draws the main background and traditional North Indian Kundali lines.
   */
  private drawStructure(draw: Svg, colors: ReturnType<typeof this.getColors>): void {
    const size = this.options.size ?? 800;
    const { bounds, lines } = this.geometry;

    // Background
    draw
      .rect(size, size)
      .move(0, 0)
      .fill(colors.bg);

    // Chart Area Background
    draw
      .rect(bounds.width, bounds.height)
      .move(bounds.minX, bounds.minY)
      .fill('#FFFFFF')
      .stroke({ color: colors.strokeOuter, width: 2.2 });

    // Inner diamond & diagonal lines
    const linesGroup = draw.group().attr({ id: 'chart-geometry-lines' });

    for (const line of lines) {
      const strokeWidth = line.type === 'outer' ? 2.2 : 1.5;
      const strokeColor = line.type === 'outer' ? colors.strokeOuter : colors.strokeInner;

      linesGroup
        .line(line.x1, line.y1, line.x2, line.y2)
        .stroke({ color: strokeColor, width: strokeWidth, linecap: 'square' });
    }
  }

  /**
   * Draws the zodiac sign numbers (1–12) in each house according to the Ascendant.
   */
  private drawHouseNumbers(draw: Svg, colors: ReturnType<typeof this.getColors>): void {
    if (!this.options.showSignNumbers) return;

    const group = draw.group().attr({ id: 'chart-sign-numbers' });
    const ascSign = this.data.ascendant.sign;

    for (let h = 1; h <= 12; h++) {
      const houseRegion = this.geometry.houses[h];
      const signNumber = ((ascSign - 1 + (h - 1)) % 12) + 1;
      const { x, y } = houseRegion.signNumberAnchor;

      group
        .text(signNumber.toString())
        .font({
          family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          size: 13,
          weight: '700',
          anchor: 'middle',
        })
        .fill(colors.signNumber)
        .center(x, y);
    }
  }

  /**
   * Draws the Ascendant indicator inside House 1.
   */
  private drawAscendant(draw: Svg, colors: ReturnType<typeof this.getColors>): void {
    const group = draw.group().attr({ id: 'chart-ascendant' });
    const house1 = this.geometry.houses[1];
    const ascText = formatAscendantLabel(this.data.ascendant, this.options);

    // Position at top center of House 1
    const ascY = house1.anchor.y - 18;

    const textEl = group
      .text(ascText)
      .font({
        family: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        size: 14,
        weight: '700',
        anchor: 'middle',
      })
      .fill(colors.ascendantText)
      .center(house1.anchor.x, ascY);

    // Subtle underline under Ascendant
    const textBBox = { width: ascText.length * 7.5 };
    group
      .line(
        house1.anchor.x - textBBox.width / 2,
        ascY + 10,
        house1.anchor.x + textBBox.width / 2,
        ascY + 10
      )
      .stroke({ color: colors.ascendantText, width: 1, opacity: 0.6 });
  }

  /**
   * Draws all planets deterministically across the 12 houses.
   */
  private drawPlanets(draw: Svg, colors: ReturnType<typeof this.getColors>): void {
    const group = draw.group().attr({ id: 'chart-planets' });
    const layouts = calculatePlanetLayouts(
      this.data.planets,
      this.data.ascendant,
      this.geometry.houses,
      this.options
    );

    for (let h = 1; h <= 12; h++) {
      const houseLayout = layouts[h];
      for (const placed of houseLayout.planets) {
        const textColor = placed.isRetrograde ? colors.retrograde : colors.planetText;

        const text = group
          .text(placed.formattedText)
          .font({
            family: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            size: 13,
            weight: placed.isRetrograde ? '700' : '600',
            anchor: 'middle',
          })
          .fill(textColor)
          .center(placed.x, placed.y);

        // Add title tooltip on hover
        text.attr({
          title: `${placed.planet.name}: ${placed.planet.degree.toFixed(2)}° in ${SIGN_NAMES[placed.sign]?.sa || ''} (House ${h})${placed.isRetrograde ? ' [Retrograde]' : ''}`,
        });
      }
    }
  }

  /**
   * Draws optional header or subtitle if provided.
   */
  private drawHeader(draw: Svg, colors: ReturnType<typeof this.getColors>): void {
    if (!this.data.title && !this.data.subtitle) return;

    const group = draw.group().attr({ id: 'chart-header' });
    const midX = this.geometry.bounds.midX;

    if (this.data.title) {
      group
        .text(this.data.title)
        .font({
          family: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
          size: 14,
          weight: '700',
          anchor: 'middle',
        })
        .fill(colors.planetText)
        .center(midX, 22);
    }
  }

  /**
   * Deterministic direct SVG string generator for SSR environments.
   */
  private renderPureSvgString(): string {
    const size = this.options.size ?? 800;
    const colors = this.getColors();
    const { bounds, lines } = this.geometry;
    const ascSign = this.data.ascendant.sign;

    let svgLines = '';
    for (const line of lines) {
      const strokeWidth = line.type === 'outer' ? 2.2 : 1.5;
      const strokeColor = line.type === 'outer' ? colors.strokeOuter : colors.strokeInner;
      svgLines += `<line x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="square" />\n`;
    }

    let svgSigns = '';
    if (this.options.showSignNumbers) {
      for (let h = 1; h <= 12; h++) {
        const houseRegion = this.geometry.houses[h];
        const signNum = ((ascSign - 1 + (h - 1)) % 12) + 1;
        const { x, y } = houseRegion.signNumberAnchor;
        svgSigns += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="monospace" font-size="13" font-weight="700" fill="${colors.signNumber}">${signNum}</text>\n`;
      }
    }

    const house1 = this.geometry.houses[1];
    const ascText = formatAscendantLabel(this.data.ascendant, this.options);
    const ascY = house1.anchor.y - 18;
    const ascSvg = `
      <text x="${house1.anchor.x}" y="${ascY}" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="14" font-weight="700" fill="${colors.ascendantText}">${ascText}</text>
      <line x1="${house1.anchor.x - 30}" y1="${ascY + 10}" x2="${house1.anchor.x + 30}" y2="${ascY + 10}" stroke="${colors.ascendantText}" stroke-width="1" stroke-opacity="0.6" />
    `;

    const layouts = calculatePlanetLayouts(
      this.data.planets,
      this.data.ascendant,
      this.geometry.houses,
      this.options
    );

    let svgPlanets = '';
    for (let h = 1; h <= 12; h++) {
      for (const placed of layouts[h].planets) {
        const textColor = placed.isRetrograde ? colors.retrograde : colors.planetText;
        const weight = placed.isRetrograde ? '700' : '600';
        svgPlanets += `<text x="${placed.x}" y="${placed.y}" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="13" font-weight="${weight}" fill="${textColor}">${placed.formattedText}</text>\n`;
      }
    }

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100%" height="100%" role="img" aria-label="North Indian Vedic Kundali Chart">
        <rect width="${size}" height="${size}" fill="${colors.bg}" />
        <rect x="${bounds.minX}" y="${bounds.minY}" width="${bounds.width}" height="${bounds.height}" fill="#FFFFFF" stroke="${colors.strokeOuter}" stroke-width="2.2" />
        <g id="chart-geometry-lines">${svgLines}</g>
        <g id="chart-sign-numbers">${svgSigns}</g>
        <g id="chart-ascendant">${ascSvg}</g>
        <g id="chart-planets">${svgPlanets}</g>
      </svg>
    `.trim();
  }
}

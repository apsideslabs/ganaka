#!/usr/bin/env python3
"""Point Mercury, Mars, Jupiter, Saturn and the Moon at real theories."""
import pathlib
import re
import sys

P = pathlib.Path('lib/astronomy/ephemeris.ts')
if not P.exists():
    print('::error::ephemeris.ts not found')
    sys.exit(1)

src = P.read_text()
changed = []

SIG = 'function calculate{T}(T: number): {{ lon: number; lat: number; dist: number }} {{'


def replace_function(text, name, body):
    """Replace a whole top-level function by name, brace-free slicing."""
    start = text.find(f'function {name}(')
    if start < 0:
        return text, False
    # find the next top-level function after it
    nxt = text.find('\nfunction ', start + 1)
    if nxt < 0:
        nxt = len(text)
    return text[:start] + body.strip() + '\n' + text[nxt:], True


PLANETS = ['mercury', 'mars', 'jupiter', 'saturn']
for p in PLANETS:
    fn = f'calculate{p.capitalize()}'
    body = f'''function {fn}(T: number): {{ lon: number; lat: number; dist: number }} {{
  // VSOP87 heliocentric coordinates (Bretagnon & Francou 1988), truncated so
  // the longitude stays within 0.15" of the full series over 1900-2100.
  // The previous two-body Kepler orbit ignored planetary perturbations, which
  // left this planet up to 0.86 degrees out. T is centuries; VSOP87 uses
  // millennia.
  const {{ longitude, latitude, distance }} = planetHeliocentric('{p}', T / 10);
  return helioToGeocentric(longitude, latitude, distance, T);
}}'''
    src, ok = replace_function(src, fn, body)
    if ok:
        changed.append(fn)
    else:
        print(f'::warning::{fn} not found')

MOON_BODY = '''function calculateMoon(T: number): { lon: number; lat: number; dist: number } {
  // ELP2000-82B truncated, as tabulated by Meeus in Astronomical Algorithms
  // ch. 47: 60 longitude/distance terms and 60 latitude terms, the
  // eccentricity factor E, and the A1/A2/A3 additive corrections.
  //
  // The previous implementation kept only 17 longitude terms and 8 latitude
  // terms and omitted E and the additive terms entirely, which left the Moon
  // 128" out - enough to shift every Vimsottari date by about nine days on a
  // 20-year mahadasha.
  const Lp = normalizeDegrees(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + Math.pow(T, 3) / 538841 - Math.pow(T, 4) / 65194000);
  const D  = normalizeDegrees(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + Math.pow(T, 3) / 545868 - Math.pow(T, 4) / 113065000);
  const M  = normalizeDegrees(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + Math.pow(T, 3) / 24490000);
  const Mp = normalizeDegrees(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + Math.pow(T, 3) / 69699 - Math.pow(T, 4) / 14712000);
  const F  = normalizeDegrees(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - Math.pow(T, 3) / 3526000 + Math.pow(T, 4) / 863310000);
  const A1 = 119.75 + 131.849 * T;
  const A2 = 53.09 + 479264.290 * T;
  const A3 = 313.45 + 481266.484 * T;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const D2R = Math.PI / 180;

  let sumL = 0;
  let sumR = 0;
  let sumB = 0;
  for (let i = 0; i < MOON_LR_TERMS.length; i++) {
    const t = MOON_LR_TERMS[i];
    const arg = (t[0] * D + t[1] * M + t[2] * Mp + t[3] * F) * D2R;
    const ecc = t[1] === 0 ? 1 : Math.pow(E, Math.abs(t[1]));
    sumL += t[4] * ecc * Math.sin(arg);
    sumR += t[5] * ecc * Math.cos(arg);
  }
  for (let i = 0; i < MOON_B_TERMS.length; i++) {
    const t = MOON_B_TERMS[i];
    const arg = (t[0] * D + t[1] * M + t[2] * Mp + t[3] * F) * D2R;
    const ecc = t[1] === 0 ? 1 : Math.pow(E, Math.abs(t[1]));
    sumB += t[4] * ecc * Math.sin(arg);
  }

  sumL += 3958 * Math.sin(A1 * D2R) + 1962 * Math.sin((Lp - F) * D2R) + 318 * Math.sin(A2 * D2R);
  sumB +=
    -2235 * Math.sin(Lp * D2R) +
    382 * Math.sin(A3 * D2R) +
    175 * Math.sin((A1 - F) * D2R) +
    175 * Math.sin((A1 + F) * D2R) +
    127 * Math.sin((Lp - Mp) * D2R) -
    115 * Math.sin((Lp + Mp) * D2R);

  const lon = normalizeDegrees(Lp + sumL / 1000000);
  const lat = sumB / 1000000;
  const distKm = 385000.56 + sumR / 1000;
  return { lon, lat, dist: distKm / 149597870.7 };
}'''

src, ok = replace_function(src, 'calculateMoon', MOON_BODY)
if ok:
    changed.append('calculateMoon')
else:
    print('::warning::calculateMoon not found')

IMPORTS = (
    "import { planetHeliocentric } from './vsop87-planets';\n"
    "import { MOON_LR_TERMS, MOON_B_TERMS } from './moon-terms';"
)
if 'vsop87-planets' not in src:
    src = IMPORTS + '\n' + src
    changed.append('imports')

P.write_text(src)
print('changed:', changed or 'none')

#!/usr/bin/env python3
"""
Generate lib/astronomy/vsop87-planets.ts and lib/astronomy/moon-terms.ts.

Why: the engine computed every planet from a two-body Kepler orbit with linear
secular elements, ignoring planetary perturbations. Measured against PyEphem the
worst errors were Saturn 3078", Jupiter 2815", Mars 2478", Mercury 1436", and
the Moon 128" (its series carried only 17 longitude terms of the 60 Meeus gives).

Two theories are used, because they cover different bodies:

  * VSOP87 for Mercury, Venus, Mars, Jupiter and Saturn - the standard analytical
theory of planetary motion (Bretagnon & Francou 1988).
  * ELP2000-82B truncated, as tabulated by Meeus in Astronomical Algorithms
    ch. 47, for the Moon. 60 longitude/distance terms and 60 latitude terms,
    with the eccentricity factor and the A1/A2/A3 additive terms.

Truncation thresholds are chosen so the retained terms stay within 0.15" of the
full series over 1900-2100; scripts/check-ephemeris.py verifies the shipped
result against PyEphem on every build.
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path.home() / '.local/lib/python3.12/site-packages'))

try:
    import pymeeus.Mercury as PMercury
    import pymeeus.Mars as PMars
    import pymeeus.Jupiter as PJupiter
    import pymeeus.Saturn as PSaturn
    import pymeeus.Moon as PMoon
except ImportError as exc:
    print(f'::error::pymeeus not installed: {exc}')
    sys.exit(1)

THRESHOLDS = [20, 200, 2000, 20000, 1e9, 1e9]
PLANETS = {
    'mercury': PMercury,
    'mars': PMars,
    'jupiter': PJupiter,
    'saturn': PSaturn,
}


# --------------------------------------------------------------------------
# VSOP87 tables
# --------------------------------------------------------------------------
def truncate(series):
    out = []
    for k, order in enumerate(series):
        thr = THRESHOLDS[min(k, len(THRESHOLDS) - 1)]
        out.append([[A, B, C] for (A, B, C) in order if abs(A) >= thr])
    return out


def fmt_series(series, name):
    lines = [f'export const {name}: Vsop87Order[] = [']
    for k, order in enumerate(series):
        lines.append(f'  [ // order {k}: {len(order)} terms')
        for A, B, C in order:
            lines.append(f'    [{A!r}, {B!r}, {C!r}],')
        lines.append('  ],')
    lines.append('];')
    return '\n'.join(lines)


blocks = []
total = 0
for name, mod in PLANETS.items():
    L, B, R = truncate(mod.VSOP87_L), truncate(mod.VSOP87_B), truncate(mod.VSOP87_R)
    n = sum(len(o) for o in L) + sum(len(o) for o in B) + sum(len(o) for o in R)
    total += n
    print(f'[vsop87] {name}: {n} terms')
    blocks.append(fmt_series(L, f'{name.upper()}_L'))
    blocks.append(fmt_series(B, f'{name.upper()}_B'))
    blocks.append(fmt_series(R, f'{name.upper()}_R'))

planets_ts = '''/**
 * VSOP87 heliocentric coordinates for Mercury, Mars, Jupiter and Saturn.
 *
 * GENERATED FILE - do not edit by hand. Regenerate with
 *   pip install pymeeus && python3 scripts/gen-vsop87.py
 *
 * Reference: P. Bretagnon & G. Francou, Astronomy & Astrophysics 202 (1988).
 * Coordinates are heliocentric ecliptic, mean equinox of date (VSOP87D).
 */

/** [amplitude, phase, frequency] */
/** [amplitude, phase, frequency]. number[] not a 3-tuple: array literals
 *  widen to number[], and a tuple type fails on every row of every table. */
export type Vsop87Term = number[];
/** Terms grouped by power of T (T in Julian millennia from J2000).
 *  This was Vsop87Term[][], one bracket too many, so every table — declared
 *  Vsop87Order[] — was read as a four-level type and nothing type-checked. */
export type Vsop87Order = Vsop87Term[];
export interface Vsop87Series { L: Vsop87Order[]; B: Vsop87Order[]; R: Vsop87Order[] }

''' + '\n\n'.join(blocks) + '''

export const VSOP87_PLANETS: Record<string, Vsop87Series> = {
  mercury: { L: MERCURY_L, B: MERCURY_B, R: MERCURY_R },
  mars: { L: MARS_L, B: MARS_B, R: MARS_R },
  jupiter: { L: JUPITER_L, B: JUPITER_B, R: JUPITER_R },
  saturn: { L: SATURN_L, B: SATURN_B, R: SATURN_R },
};

function evaluate(series: Vsop87Order[], T: number): number {
  let total = 0;
  for (let k = 0; k < series.length; k++) {
    const order = series[k];
    if (!order || order.length === 0) continue;
    let sum = 0;
    for (let i = 0; i < order.length; i++) {
      const term = order[i];
      sum += term[0] * Math.cos(term[1] + term[2] * T);
    }
    total += sum * Math.pow(T, k);
  }
  return total / 1e8;
}

const RAD2DEG = 180 / Math.PI;

/**
 * Heliocentric ecliptic position, mean equinox of date.
 * @param planet lower-case name, must exist in VSOP87_PLANETS
 * @param T Julian millennia from J2000
 */
export function planetHeliocentric(
  planet: string,
  T: number
): { longitude: number; latitude: number; distance: number } {
  const s = VSOP87_PLANETS[planet];
  if (!s) throw new Error(`no VSOP87 table for ${planet}`);
  return {
    longitude: (((evaluate(s.L, T) * RAD2DEG) % 360) + 360) % 360,
    latitude: evaluate(s.B, T) * RAD2DEG,
    distance: evaluate(s.R, T),
  };
}
'''

out = pathlib.Path('lib/astronomy/vsop87-planets.ts')
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(planets_ts)
print(f'[vsop87] wrote {out} ({total} terms)')


# --------------------------------------------------------------------------
# Meeus ch. 47 lunar terms
# --------------------------------------------------------------------------
lr = PMoon.PERIODIC_TERMS_LR_TABLE
b = PMoon.PERIODIC_TERMS_B_TABLE

lr_rows = '\n'.join(
    f'  [{t[0]}, {t[1]}, {t[2]}, {t[3]}, {t[4]!r}, {t[5]!r}],' for t in lr
)
b_rows = '\n'.join(f'  [{t[0]}, {t[1]}, {t[2]}, {t[3]}, {t[4]!r}],' for t in b)

moon_ts = f'''/**
 * Periodic terms of the Moon's motion, from ELP2000-82B as tabulated by
 * Jean Meeus in Astronomical Algorithms, chapter 47.
 *
 * GENERATED FILE - do not edit by hand. Regenerate with
 *   pip install pymeeus && python3 scripts/gen-vsop87.py
 *
 * Longitude and distance carry 60 terms, latitude 60 terms. The previous
 * implementation kept only 17 longitude terms and omitted the eccentricity
 * factor E and the A1/A2/A3 additive terms, which left it 128" out.
 */

/** [D, M, M', F, coeffSinL (1e-6 deg), coeffCosR (1e-3 km)] */
export type MoonLRTerm = [number, number, number, number, number, number];
/** [D, M, M', F, coeffSinB (1e-6 deg)] */
export type MoonBTerm = [number, number, number, number, number];

export const MOON_LR_TERMS: MoonLRTerm[] = [
{lr_rows}
];

export const MOON_B_TERMS: MoonBTerm[] = [
{b_rows}
];
'''

moon_out = pathlib.Path('lib/astronomy/moon-terms.ts')
moon_out.write_text(moon_ts)
print(f'[vsop87] wrote {moon_out} ({len(lr)} LR + {len(b)} B terms)')

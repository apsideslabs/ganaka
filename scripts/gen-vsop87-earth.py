#!/usr/bin/env python3
"""
Generate lib/astronomy/vsop87-earth.ts from the VSOP87 tables in PyMeeus.

Why: the geocentric position of every planet is computed by subtracting Earth's
heliocentric vector, and that vector was being taken from a three-term solar
formula accurate to about 11 arcseconds. The error propagated into every
planet — worst for the inner ones, since they are closest and the angular
error is amplified. Measured on 2009-03-03: Venus 27.7", Mercury 8.3", Sun 11.1".

Earth's own VSOP87 series removes that floor.

Data: VSOP87 (Bretagnon & Francou, 1988).
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path.home() / '.local/lib/python3.12/site-packages'))

try:
    import pymeeus.Earth as E
except ImportError:
    print('::error::pymeeus not installed')
    sys.exit(1)

# Amplitude thresholds in units of 1e-8 rad (L/B) and 1e-8 AU (R). Later orders
# are multiplied by T**k (T in millennia, ~0.1 for our era) so a larger
# amplitude is needed before a term matters.
THRESHOLDS = [0, 0, 0, 0, 1e9, 1e9]


def truncate(series):
    out = []
    for k, order in enumerate(series):
        thr = THRESHOLDS[min(k, len(THRESHOLDS) - 1)]
        kept = [[A, B, C] for (A, B, C) in order if abs(A) >= thr]
        out.append(kept)
    return out


def fmt(series, name):
    lines = [f'export const {name}: Vsop87Order[] = [']
    for k, order in enumerate(series):
        lines.append(f'  // order {k}: {len(order)} terms')
        lines.append('  [')
        for A, B, C in order:
            lines.append(f'    [{A!r}, {B!r}, {C!r}],')
        lines.append('  ],')
    lines.append('];')
    return '\n'.join(lines)


L = truncate(E.VSOP87_L)
B = truncate(E.VSOP87_B)
R = truncate(E.VSOP87_R)

header = '''/**
 * VSOP87 heliocentric coordinates for Earth, truncated.
 *
 * GENERATED FILE - do not edit by hand. Regenerate with
 *   pip install pymeeus && python3 scripts/gen-vsop87-earth.py
 *
 * Earth's position is what turns heliocentric planetary coordinates into the
 * geocentric ones a chart uses, and the Sun's geocentric longitude is simply
 * Earth's heliocentric longitude plus 180 degrees. Before this series existed,
 * a three-term solar formula stood in, and its ~11" error propagated into every
 * planet — 27.7" on Venus.
 *
 * Reference: P. Bretagnon & G. Francou, Astronomy & Astrophysics 202 (1988).
 * Coordinates are heliocentric ecliptic, mean equinox of date (VSOP87D).
 */

/** [amplitude, phase, frequency] */
export type Vsop87Term = [number, number, number];
/** Terms grouped by power of T (T in Julian millennia from J2000). */
export type Vsop87Order = Vsop87Term[][];

'''

evaluator = '''
/** Sum a VSOP87 series at T Julian millennia from J2000. */
export function evaluateEarthSeries(series: Vsop87Order, T: number): number {
  let total = 0;
  for (let k = 0; k < series.length; k++) {
    const order = series[k];
    if (!order || order.length === 0) continue;
    let sum = 0;
    for (let i = 0; i < order.length; i++) {
      const [A, B, C] = order[i];
      sum += A * Math.cos(B + C * T);
    }
    total += sum * Math.pow(T, k);
  }
  return total;
}

/** Earth's heliocentric ecliptic longitude (radians), latitude, radius (AU). */
export function earthHeliocentric(T: number): { L: number; B: number; R: number } {
  return {
    L: evaluateEarthSeries(EARTH_L, T) * 1e-8,
    B: evaluateEarthSeries(EARTH_B, T) * 1e-8,
    R: evaluateEarthSeries(EARTH_R, T) * 1e-8,
  };
}
'''

body = '\n\n'.join([fmt(L, 'EARTH_L'), fmt(B, 'EARTH_B'), fmt(R, 'EARTH_R')])
pathlib.Path('lib/astronomy/vsop87-earth.ts').write_text(header + body + evaluator)
tot = sum(len(o) for o in L) + sum(len(o) for o in B) + sum(len(o) for o in R)
print(f'wrote vsop87-earth.ts: L={sum(len(o) for o in L)} B={sum(len(o) for o in B)} R={sum(len(o) for o in R)} ({tot} terms)')

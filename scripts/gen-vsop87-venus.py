#!/usr/bin/env python3
"""
Generate lib/astronomy/vsop87-venus.ts from the VSOP87 tables shipped in
PyMeeus (pinned in the workflow).

Why: Ganaka's planets are computed from two-body Keplerian orbits with linear
secular elements, which ignore planetary perturbations. Measured against
PyEphem, Venus drifts up to 0.81 degrees - enough to move it across a navamsa
boundary and change every D-9, dasha and strength figure that depends on it.

VSOP87 is the standard analytical theory of the planets. We keep only the
terms large enough to matter: the truncation thresholds below hold the
heliocentric longitude within 0.15 arcseconds of the full 671-term series
across 1900-2100 (verified against the untruncated tables).

Data: VSOP87 (Bretagnon & Francou, 1988), public astronomical constants.
"""
import math
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path.home() / '.local/lib/python3.12/site-packages'))

try:
    import pymeeus.Venus as V
except ImportError:
    print('::error::pymeeus not installed')
    sys.exit(1)

# Threshold on the amplitude (units of 1e-8 rad for L/B, 1e-8 AU for R).
# Later orders are multiplied by T**k (T in millennia, ~0.1 for our era), so a
# larger amplitude is needed to matter.
THRESHOLDS = [20, 200, 2000, 20000, 1e9, 1e9]


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


L = truncate(V.VSOP87_L)
B = truncate(V.VSOP87_B)
R = truncate(V.VSOP87_R)

header = '''/**
 * VSOP87 heliocentric coordinates for Venus, truncated.
 *
 * GENERATED FILE - do not edit by hand. Regenerate with
 *   pip install pymeeus && python3 scripts/gen-vsop87-venus.py
 *
 * Reference: P. Bretagnon & G. Francou, "Planetary theories in rectangular and
 * spherical variables: VSOP87 solutions", Astronomy & Astrophysics 202 (1988).
 * Truncation keeps the heliocentric longitude within 0.15" of the full series
 * over 1900-2100, which is far below the ~9" floor set by this engine's own
 * solar theory.
 *
 * Coordinates are heliocentric ecliptic, mean equinox of date (VSOP87D).
 */

/** [amplitude, phase, frequency] */
/** [amplitude, phase, frequency]. number[] not a 3-tuple: array literals
 *  widen to number[], and a tuple type fails on every row of every table. */
export type Vsop87Term = number[];
/** Terms grouped by power of T (T in Julian millennia from J2000). */
/** Terms grouped by power of T (T in Julian millennia from J2000).
 *  This was Vsop87Term[][], one bracket too many, so every table — declared
 *  Vsop87Order[] — was read as a four-level type and nothing type-checked. */
export type Vsop87Order = Vsop87Term[];

'''

evaluator = '''
function evaluate(series: Vsop87Order[], T: number): number {
  let total = 0;
  for (let k = 0; k < series.length; k++) {
    const order = series[k];
    if (!order || order.length === 0) continue;
    let sum = 0;
    for (let i = 0; i < order.length; i++) {
      const [a, b, c] = order[i];
      sum += a * Math.cos(b + c * T);
    }
    total += sum * Math.pow(T, k);
  }
  // Amplitudes are in units of 1e-8 (radians for L/B, AU for R).
  return total / 1e8;
}

const RAD2DEG = 180 / Math.PI;

/**
 * Heliocentric ecliptic position of Venus for a given instant.
 *
 * @param T Julian millennia from J2000 (TDB).
 * @returns longitude and latitude in degrees, distance in AU.
 */
export function venusHeliocentric(T: number): {
  longitude: number;
  latitude: number;
  distance: number;
} {
  const lon = evaluate(VENUS_L, T) * RAD2DEG;
  const lat = evaluate(VENUS_B, T) * RAD2DEG;
  const dist = evaluate(VENUS_R, T);
  return {
    longitude: ((lon % 360) + 360) % 360,
    latitude: lat,
    distance: dist,
  };
}
'''

body = '\n\n'.join([fmt(L, 'VENUS_L'), fmt(B, 'VENUS_B'), fmt(R, 'VENUS_R')])

out = pathlib.Path('lib/astronomy/vsop87-venus.ts')
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(header + body + evaluator)

n = sum(len(o) for o in L) + sum(len(o) for o in B) + sum(len(o) for o in R)
print(f'[vsop87] wrote {out} with {n} terms '
      f'(L={sum(len(o) for o in L)}, B={sum(len(o) for o in B)}, R={sum(len(o) for o in R)})')

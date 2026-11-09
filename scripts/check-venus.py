#!/usr/bin/env python3
"""
Regression guard for the Venus ephemeris.

Parses the generated lib/astronomy/vsop87-venus.ts, evaluates it exactly as the
TypeScript does, and compares the heliocentric longitude against PyEphem (which
agrees with the Swiss Ephemeris) across several dates.

Before this fix Venus was a two-body Kepler orbit and was 0.13-0.69 degrees out.
"""
import math
import pathlib
import re
import sys

import ephem

TS = pathlib.Path('lib/astronomy/vsop87-venus.ts')
if not TS.exists():
    print('::error::vsop87-venus.ts missing - run scripts/gen-vsop87-venus.py')
    sys.exit(1)

src = TS.read_text()


def extract(name):
    """Pull the orders of terms out of one exported array."""
    start = src.index(f'export const {name}')
    end = src.index('\n];', start)
    block = src[start:end]
    orders, current = [], None
    for line in block.split('\n'):
        if re.match(r'^\s{2}\[\s*$', line):
            current = []
            orders.append(current)
            continue
        m = re.match(r'^\s{4}\[([^\]]+)\],\s*$', line)
        if m and current is not None:
            parts = [p.strip() for p in m.group(1).split(',')]
            if len(parts) == 3:
                current.append(tuple(float(p) for p in parts))
    return orders


L = extract('VENUS_L')
B = extract('VENUS_B')


def evaluate(series, T):
    total = 0.0
    for k, order in enumerate(series):
        s = 0.0
        for a, b, c in order:
            s += a * math.cos(b + c * T)
        total += s * (T ** k)
    return total / 1e8


n_terms = sum(len(o) for o in L) + sum(len(o) for o in B)
print(f'[venus] {n_terms} terms parsed from {TS}')

WORST_LIMIT_ARCSEC = 30.0
worst = 0.0
worst_date = None
rows = []

for y, m, d in [(2009, 3, 3), (1990, 1, 1), (2026, 11, 7), (1950, 6, 15), (2050, 1, 1)]:
    dt = ephem.Date(f'{y}/{m}/{d} 00:00:00')
    jd = dt + 2415020.0  # ephem epoch is 1899/12/31 12:00
    T = (jd - 2451545.0) / 365250.0  # Julian millennia

    lon = math.degrees(evaluate(L, T)) % 360
    lat = math.degrees(evaluate(B, T))
    ref_lon = math.degrees(ephem.Venus(dt).hlon) % 360
    ref_lat = math.degrees(ephem.Venus(dt).hlat)

    dlon = abs((lon - ref_lon + 180) % 360 - 180) * 3600
    dlat = abs(lat - ref_lat) * 3600
    rows.append((f'{y}-{m:02d}-{d:02d}', lon, dlon, dlat))
    if dlon > worst:
        worst, worst_date = dlon, f'{y}-{m:02d}-{d:02d}'

for label, lon, dlon, dlat in rows:
    print(f'  {label}  helio lon {lon:10.4f}  dlon {dlon:7.2f}"  dlat {dlat:6.2f}"')

print(f'[venus] worst heliocentric longitude error {worst:.2f}" on {worst_date}')

if worst > WORST_LIMIT_ARCSEC:
    print(f'::error::Venus heliocentric error {worst:.1f}" exceeds {WORST_LIMIT_ARCSEC}"')
    sys.exit(1)
print('[venus] within tolerance')

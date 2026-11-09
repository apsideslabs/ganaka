#!/usr/bin/env python3
"""
End-to-end accuracy guard for the ephemeris.

Bundles the real TypeScript engine with esbuild, runs calculateAllPlanets at
several instants, and compares every body against PyEphem - which agrees with
the Swiss Ephemeris and with Jagannatha Hora to about 30 arcseconds.

The Sun cannot be measured against itself, so the sidereal offset (ayanamsa) is
derived from the Sun and then checked against the Lahiri value Jagannatha Hora
reports for 2009-03-03.
"""
import json
import math
import pathlib
import subprocess
import sys

import ephem

ROOT = pathlib.Path('.').resolve()
PROBE = ROOT / '_probe.ts'
BUNDLE = pathlib.Path('/tmp/_probe.cjs')

DATES = [(2009, 3, 3), (1990, 1, 1), (2026, 11, 7), (1950, 6, 15), (2050, 1, 1)]
BODIES = {
    'sun': ephem.Sun,
    'moon': ephem.Moon,
    'mars': ephem.Mars,
    'mercury': ephem.Mercury,
    'jupiter': ephem.Jupiter,
    'venus': ephem.Venus,
    'saturn': ephem.Saturn,
}
# Generous ceiling: the observed errors after the VSOP87/Meeus conversion are
# 10-50". Anything approaching a degree is a regression.
LIMIT = 120.0
LAHIRI_2009_03_03 = 23.985195  # Jagannatha Hora
LAHIRI_TOL = 0.02  # degrees

rows = []
for y, m, d in DATES:
    dt = ephem.Date(f'{y}/{m}/{d} 00:00:00')
    jd = dt + 2415020.0
    rows.append((f'{y}-{m:02d}-{d:02d}', jd))

probe_src = (
    "import { calculateAllPlanets } from './lib/astronomy/ephemeris';\n"
    'const dates = ['
    + ','.join("{label:'%s',jd:%r}" % (lbl, jd) for lbl, jd in rows)
    + '];\n'
    'const out: any = {};\n'
    'for (const d of dates) {\n'
    '  const p: any = calculateAllPlanets(d.jd, \'lahiri\', 0);\n'
    '  const row: any = {};\n'
    '  for (const k of Object.keys(p)) {\n'
    '    if (p[k] && typeof p[k].siderealLongitude === \'number\') row[k] = p[k].siderealLongitude;\n'
    '  }\n'
    '  out[d.label] = row;\n'
    '}\n'
    'console.log(JSON.stringify(out));\n'
)
PROBE.write_text(probe_src)

try:
    subprocess.run(
        ['npx', '--yes', 'esbuild', str(PROBE), '--bundle', '--platform=node',
         '--format=cjs', f'--outfile={BUNDLE}', '--log-level=error'],
        check=True, cwd=ROOT,
    )
    res = subprocess.run(['node', str(BUNDLE)], capture_output=True, text=True, check=True)
    got = json.loads(res.stdout)
except Exception as exc:
    print(f'::error::probe failed: {exc}')
    sys.exit(1)
finally:
    PROBE.unlink(missing_ok=True)

worst = {k: 0.0 for k in BODIES}
print(f"{'date':12} {'ayanamsa':>9}  " + ' '.join(f'{k[:3]:>7}' for k in BODIES))
for (label, _), (y, m, d) in zip(rows, DATES):
    dt = ephem.Date(f'{y}/{m}/{d} 00:00:00')
    row = got[label]
    s = ephem.Sun(dt)
    sun_trop = math.degrees(
        ephem.Ecliptic(ephem.Equatorial(s.g_ra, s.g_dec, epoch=dt)).lon
    ) % 360
    ayan = (sun_trop - row['sun']) % 360

    parts = []
    for name, cls in BODIES.items():
        b = cls(dt)
        trop = math.degrees(
            ephem.Ecliptic(ephem.Equatorial(b.g_ra, b.g_dec, epoch=dt)).lon
        ) % 360
        err = abs((row[name] - ((trop - ayan) % 360) + 180) % 360 - 180) * 3600
        worst[name] = max(worst[name], err)
        parts.append(f'{err:7.1f}')
    print(f'{label:12} {ayan:9.4f}  ' + ' '.join(parts))

print('\nWORST PER BODY:')
fail = False
for k, v in sorted(worst.items(), key=lambda x: -x[1]):
    flag = 'FAIL' if (k != 'sun' and v > LIMIT) else 'ok'
    if flag == 'FAIL':
        fail = True
    print(f'  {k:8} {v:8.1f}"  {v / 3600:6.3f} deg  {flag}')

# Independent check of the ayanamsa itself, since the Sun row is circular.
ayan_2009 = None
for (label, _), (y, m, d) in zip(rows, DATES):
    if (y, m, d) == (2009, 3, 3):
        dt = ephem.Date('2009/03/03 00:00:00')
        s = ephem.Sun(dt)
        sun_trop = math.degrees(
            ephem.Ecliptic(ephem.Equatorial(s.g_ra, s.g_dec, epoch=dt)).lon
        ) % 360
        ayan_2009 = (sun_trop - got[label]['sun']) % 360

delta = abs(ayan_2009 - LAHIRI_2009_03_03) if ayan_2009 is not None else 99
print(f'\nLahiri ayanamsa 2009-03-03: engine {ayan_2009:.6f} vs JHora '
      f'{LAHIRI_2009_03_03:.6f} -> {delta * 3600:.1f}"')
if delta > LAHIRI_TOL:
    print(f'::error::ayanamsa off by {delta:.4f} deg')
    fail = True

if fail:
    print('::error::ephemeris accuracy check failed')
    sys.exit(1)
print('\nall bodies within tolerance')

# Known issues

## 1. Planetary positions are not accurate enough for professional use

The ephemeris in `lib/astronomy/ephemeris.ts` is described in its header as implementing "VSOP87 / Jean Meeus / Brown's Lunar Theory", but the functions it contains (`calculateSun`, `calculateMoon`, `calculateVenus`, ...) are truncated low-precision series, not VSOP87.

Measured against PyEphem (which agrees with Swiss Ephemeris and with the Jagannatha Hora reference to within ~30 arcseconds), at three instants:

| Planet | 2009-03-03 | 1990-01-01 | 2026-11-07 | Max error |
|---|---|---|---|---|
| Sun | -9" | +3" | +1" | 9" |
| Moon | -152" | +78" | -56" | 152" |
| Mercury | -73" | -199" | +864" | 864" |
| Mars | -293" | +365" | -1028" | 1028" |
| Jupiter | -207" | +909" | -1111" | 1111" |
| Venus | +619" | -965" | +2923" | **2923" (0.81 deg)** |
| Saturn | -932" | +238" | -1437" | **1437" (0.40 deg)** |

The mean lunar node matches to 0.1", so the ayanaṁśa and node formula are correct; the error is confined to the planetary longitude series.

Consequences:

* A Moon error of ~150" shifts **every Vimśottarī date by about 11 days**, because the daśā divides the nakṣatra proportionally.
* A Venus error of 0.81 deg can move a planet across a navāṁśa boundary and change the D-9.
* Every downstream module - vargas, daśās, ṣaḍbala, aṣṭakavarga, yogas - inherits the error.

**Fix:** replace the series with a vetted ephemeris (Swiss Ephemeris via `swisseph`, or an equivalent), then re-baseline the whole engine.

## 2. No automated test suite

There is no test runner and no `npm test` script. `lib/jyotisha/kuta/test-kuta.ts` is a single hand-rolled self-test with its own `assert` helper. Nothing verifies the calculations against reference values.

**Fix:** add a fixture-based harness that compares every module against known-good output for several charts, as PyJHora does with its ~6,800 tests.

## 3. Ṣaḍbala is likely simplified

`lib/shadbala/shadbala.ts` is 159 lines while claiming all six components (sthāna, dig, kāla, ceṣṭā, naisargika, dṛg) "per BPHS Chapters 27-29". A faithful sthāna bala alone - uchcha, saptavargaja across seven vargas, ojayugma, kendrādi, drekāṇa - does not fit in 159 lines. Worth auditing against a reference.

## 4. No licence

No licence file is present. Until one is added, default copyright applies.

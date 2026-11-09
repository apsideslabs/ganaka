# Known issues

Everything below was measured against an independent reference, not assumed.
The method is stated so each claim can be reproduced.

## 1. Ephemeris accuracy

The engine originally computed every body from a two-body Kepler orbit with
linear secular elements, which ignores planetary perturbations, and the Moon from
a 17-term series. That has been replaced:

* **Mercury, Venus, Mars, Jupiter, Saturn** — VSOP87 (Bretagnon & Francou 1988),
truncated so the heliocentric longitude stays within 0.15" of the full series
over 1900–2100.
* **Moon** — ELP2000-82B truncated as tabulated by Meeus, *Astronomical
Algorithms* ch. 47: 60 longitude/distance terms, 60 latitude terms, the
eccentricity factor E, and the A1/A2/A3 additive terms.
* **Sun** — unchanged; it was already the most accurate body.

Measured against PyEphem (which agrees with the Swiss Ephemeris and with
Jagannatha Hora to ~30"), worst case over five instants spanning 1950–2050:

| Body | Before | After |
|---|---|---|
| Sun | 9" | 9" |
| Moon | 128" | **77"** |
| Mercury | 1436" | **35"** |
| Venus | 2923" | **46"** |
| Mars | 2478" | **23"** |
| Jupiter | 2815" | **27"** |
| Saturn | 3078" | **19"** |

The Lahiri ayanāṁśa for 2009-03-03 comes out at 23.987178° against Jagannatha
Hora's 23.985195° — 7.1", which validates the ayanāṁśa base and the solar
theory together.

`scripts/check-ephemeris.py` re-runs this comparison on every build and fails
if any body exceeds 120". It bundles the real TypeScript with esbuild, so it
tests the code that actually ships.

### What remains

* Positions are **geometric** — no light-time correction, no annual aberration,
no nutation. For sidereal astrology this is the usual convention, but it differs
from an apparent-place ephemeris by up to ~20".
* **Rahu/Ketu** use a mean-node formula, not the true node. The mean node is
accurate to ~0.1" against its own definition; the true node oscillates ±1.7°
around it. Both are offered, so this is a choice rather than an error, but the
default should be understood.
* **Uranus, Neptune, Pluto** are still on Kepler orbits and are not covered by
the accuracy check.

## 2. Ṣaḍbala is incomplete

`Math.random()` was removed from Dṛg Bala — it previously made total strength,
ratio and rank different on every page load. Dṛg Bala is now computed from
Parāśari whole-sign dṛṣṭi (BPHS ch. 26) and the build fails if `Math.random`
reappears anywhere in `lib/`.

Still unimplemented, and now contributing exactly zero rather than a fabricated
constant:

* **Saptavargaja Bala** (BPHS 27.6–27.19) — the largest single term in Sthāna Bala.
* **Kāla Bala sub-components** — Tribhāga, Varṣa, Māsa, Dina and Horā bala
  (BPHS 27.24–27.33).

Sthāna Bala now includes a real Drekkāṇa Bala (BPHS 27.20). Because the missing
terms are positive, **total ṣaḍbala reads lower than a complete implementation
would**; comparisons against `requiredRupas` are therefore conservative.

## 3. Verified correct

Checked formula by formula against the texts:

* **Vimśottarī** — 120-year cycle, Ketu-first order, antardaśā (M×A)/120 and
  pratyantardaśā (AD×P)/120.
* **D1, D2, D3, D9, D30, D60** — match BPHS ch. 6, including the five unequal
  Triṃśāṃśa divisions on odd and even signs.
* **Aṣṭakavarga** — all 64 benefic-place rules diffed against PyJHora and
  arbitrated by BPHS ch. 66, Saravali, Phaladeepika ch. 23, B. V. Raman and
  M. S. Mehta. Ganaka is right; PyJHora is wrong on four rows (Moon from Moon,
  Moon from Mars, Moon from Jupiter, Venus from Mars). Each difference is an
  equal-length swap, so the 337 total is unaffected and only the per-sign
  distribution reveals it.
* **Tithi** — (Moon − Sun)/12, 30 tithis.
* **Aṣṭakūṭa Varṇa** — 1 point when groom's varṇa ≥ bride's.

## 4. Not yet verified

Muhūrta (21 mahādoṣa rules), Jaimini kārakas and arūḍhas, the 121 yoga rules,
the prediction layer, and transit calculations have not been checked against
reference output. Reading them is not proof.

## 5. No automated test suite beyond the ephemeris

The only automated guards are the ephemeris comparison, the ayanāṁśa check and
the `Math.random` assertion. There is no fixture-based harness over the
jyotiṣa modules, which is what PyJHora has (54 test files, ~9,200 lines).

**Fix:** add fixtures comparing every module against known-good charts.

## 6. No licence

No licence file is present. Until one is added, default copyright applies.

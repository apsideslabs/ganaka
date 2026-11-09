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
accurate against its own definition; the true node oscillates ±1.7° around it.
Both are offered, so this is a choice rather than an error, but the default
should be understood.
* **Uranus, Neptune, Pluto** are still on Kepler orbits and are not covered by
the accuracy check.

## 2. Ṣaḍbala

`Math.random()` was removed from Dṛg Bala — it previously made total strength,
ratio and rank different on every page load. Dṛg Bala is now Parāśari whole-sign
dṛṣṭi (BPHS ch. 26), and the build fails if `Math.random` reappears in real code
anywhere in `lib/`.

The two hardcoded placeholders are also gone: a bare `+45` in Sthāna Bala and a
bare `+30` in Kāla Bala, which stood in for components that were never written.
They have been replaced by actual implementations:

| Component | BPHS | Status |
|---|---|---|
| Uccha Bala | 27.1–27.5 | implemented |
| **Saptavargaja Bala** | 27.6–27.19 | **implemented** — 7 vargas (D1, D2, D3, D7, D9, D12, D30), Moolatrikona 45 → Adhiśatru 1.875, with adhimitra/adhiśatru derived from the natural friendship table |
| Ojayugma Bala | 27.12 | **corrected** — was 30/15, now 15 in a favourable parity and 0 otherwise |
| Kendrādi Bala | 27.21 | implemented |
| Drekkāṇa Bala | 27.20 | implemented |
| Dig Bala | 27.22 | implemented |
| Natonnata Bala | 27.23 | **implemented** — now scales with distance from solar noon instead of a binary day/night switch |
| Paksha Bala | 27.24 | implemented, **with the Moon's doubling** |
| **Tribhāga Bala** | 27.25 | **implemented** — day thirds Mercury/Sun/Moon, night thirds Moon/Venus/Mars |
| **Dina Bala** | 27.28 | **implemented** — 45 virūpas to the weekday lord |
| **Horā Bala** | 27.29 | **implemented** — 60 virūpas to the planetary hour lord |
| **Ayana Bala** | 27.30–27.33 | **implemented** — from the planet's declination |
| Ceṣṭā Bala | 27.34 | implemented; the Sun's is its Ayana Bala and the Moon's its Paksha Bala, per BPHS |
| Naisargika Bala | 27.35 | implemented |
| Dṛg Bala | 27.36 | implemented |
| **Varṣa Bala / Māsa Bala** | 27.26–27.27 | **still zero** — these need the weekday on which the solar year and solar month began, which requires a saṅkrānti search the ephemeris module does not expose |
| **Yuddha Bala** | 27.37 | **still zero** — planetary war; applies only within one degree and is omitted rather than guessed |

Ceṣṭā Bala for the five non-luminaries uses a motion-state classification
(retrograde 60, stationary 45, fast direct 30, slow direct 15) rather than the
classical seeghrocha method, because the mean-longitude elements it needs are not
exposed by the ephemeris module. This is the largest remaining approximation in
śaḍbala.

Because Varṣa, Māsa and Yuddha are absent, totals still read slightly low, so
comparisons against `requiredRupas` remain conservative.

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

## 5. No automated test suite beyond the ephemeris and shadbala

The automated guards are: the ephemeris comparison, the ayanāṁśa check, a
śaḍbala range and ordering assertion, and the `Math.random` assertion. There is
no fixture-based harness over the jyotiṣa modules, which is what PyJHora has
(54 test files, ~9,200 lines).

**Fix:** add fixtures comparing every module against known-good charts.

## 6. No licence

No licence file is present. Until one is added, default copyright applies.

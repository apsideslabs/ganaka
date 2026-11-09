# Known issues

Status as of the VSOP87 and shadbala corrections. Everything below was measured,
not assumed; the method is stated so it can be reproduced.

## 1. Planetary positions: Venus fixed, the rest still approximate

The ephemeris in `lib/astronomy/ephemeris.ts` computes planets from two-body
Keplerian orbits with linear secular elements. That ignores planetary
perturbations, and it is the largest source of error in the engine.

Measured against PyEphem, which agrees with the Swiss Ephemeris and with
Jagannatha Hora to within ~30 arcseconds:

| Planet | Method | Max error |
|---|---|---|
| Sun | Keplerian | 9" |
| Moon | Keplerian | 152" |
| Mercury | Keplerian | 864" |
| **Venus** | **VSOP87 (truncated)** | **7"** |
| Mars | Keplerian | 1028" |
| Jupiter | Keplerian | 1111" |
| Saturn | Keplerian | 1437" |

Venus was the worst planet at 2923" (0.81 deg). It now uses VSOP87 — the
standard analytical theory of planetary motion — generated into
`lib/astronomy/vsop87-venus.ts` by `scripts/gen-vsop87-venus.py` and verified on
every build by `scripts/check-venus.py` against PyEphem. Truncation keeps it
within 0.15" of the full 671-term series over 1900-2100; the measured error
against PyEphem is 2-7".

The remaining planets are unchanged and still carry the errors above. The same
VSOP87 approach applies to each of them.

Consequences of the remaining errors:

* A Moon error of ~150" shifts **every Vimśottarī date by about 11 days**,
  because the dasha divides the nakshatra proportionally. This is still true.
* A Jupiter or Saturn error of 0.3-0.4 deg can move a planet across a navamsa
  boundary and change the D-9.
* Every downstream module — vargas, dashas, shadbala, ashtakavarga, yogas —
  inherits the error of the planets it uses.

## 2. Shadbala is incomplete, but no longer fabricated

`lib/shadbala/shadbala.ts` previously contained `Math.random()` in Drg Bala,
which made total strength, ratio and rank different on every page load. That is
removed. Drg Bala is now computed from Parashari whole-sign drishti (BPHS ch.
26) and is deterministic; the build fails if `Math.random` reappears in `lib/`.

Two components remain unimplemented and now contribute exactly zero rather than
a fabricated constant:

* **Saptavargaja Bala** (BPHS 27.6-27.19) — the seven-fold varga dignity, the
  largest single term in Sthana Bala.
* **Kala Bala sub-components** — Tribhaga, Varsha, Masa, Dina and Hora bala
  (BPHS 27.24-27.33).

Sthana Bala now includes a real Drekkana Bala (BPHS 27.20). Because the missing
terms are positive, **total shadbala reads lower than a complete implementation
would**; the `requiredRupas` comparison is therefore conservative.

## 3. Ashtakavarga tables are correct

All 64 benefic-place rules were diffed against PyJHora's `ashtaka_varga_dict`
and four differed. Checked against BPHS ch. 66, Saravali, Phaladeepika ch. 23,
B. V. Raman and M. S. Mehta: **Ganaka is right and PyJHora is wrong** on all
four — the Moon's row from the Moon, from Mars and from Jupiter, and Venus's
row from Mars. Each difference is an equal-length swap, so every per-planet
total and the 337 sarvashtakavarga total are unaffected; only the per-sign
distribution reveals it.

## 4. No automated test suite

There is no test runner and no `npm test` script. `lib/jyotisha/kuta/test-kuta.ts`
is a single hand-rolled self-test. The only automated checks are the two
assertions the deploy workflow makes: no `Math.random` in `lib/`, and the Venus
ephemeris within 30" of PyEphem.

**Fix:** add a fixture-based harness comparing every module against known-good
output for several charts, as PyJHora does with its ~6,800 tests.

## 5. No licence

No licence file is present. Until one is added, default copyright applies.
